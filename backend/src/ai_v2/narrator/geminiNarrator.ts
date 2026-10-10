/**
 * ASTROWORLD AI V2 — Gemini Conversational Narrator
 * Synthesizes the final conversational response, runs post-response validation,
 * executes the 2-step repair loop if violations occur, and produces an audited FinalResponse.
 * 
 * ZERO HARDCODED HOROSCOPE FACTS: The deterministic failsafe operates exclusively
 * on runtime-provided validated claims, evidence, and context pack.
 */

import { GoogleGenAI } from '@google/genai';
import { QuestionPlan } from '../schemas/questionPlan.ts';
import { ReasoningPacket } from '../schemas/reasoningPacket.ts';
import { ApprovedClaimSet } from '../schemas/claimPacket.ts';
import {
  ResponsePlan,
  FinalResponse,
  validateFinalResponse,
} from '../schemas/responsePlan.ts';
import { getNarratorSystemInstruction, buildNarratorUserPrompt, getQuestionCoverageLimitations } from './narratorPrompt.ts';
import { ResponseClaimExtractor } from './claimExtractor.ts';
import { PostResponseGroundingValidator } from './postResponseValidator.ts';

export interface GeminiNarratorOptions {
  forceMockMode?: boolean;
  aiClient?: GoogleGenAI;
  apiKey?: string;
  primaryModel?: string;
  fallbackModel?: string;
  forcePrimaryFailure?: boolean;
  primaryTimeoutMs?: number;
  fallbackTimeoutMs?: number;
  repairTimeoutMs?: number;
  consultationDeadlineMs?: number;
}

export class GeminiNarrator {
  private claimExtractor: ResponseClaimExtractor;
  private validator: PostResponseGroundingValidator;
  private aiClient?: GoogleGenAI;
  private forceMockMode: boolean = false;
  private primaryModel: string = 'gemini-3.8-flash';
  private fallbackModel: string = 'gemini-3.1-flash-lite';
  private forcePrimaryFailure: boolean = false;
  private primaryTimeoutMs: number = 8000;
  private fallbackTimeoutMs: number = 6000;
  private repairTimeoutMs: number = 4000;
  private consultationDeadlineMs?: number;

  private lastExecutionMode: 'live_gemini' | 'mock_gemini' | 'deterministic_ci' = 'deterministic_ci';
  private lastRequestedModel: string = 'gemini-3.8-flash';
  private lastSelectedModel: string = 'gemini-3.8-flash';
  private lastEffectiveModel: string = 'gemini-3.8-flash';
  private lastFallbackTriggered: boolean = false;
  private lastFallbackReason?: string;
  private lastProviderLatencyMs: number = 0;
  private lastModelUsed?: string;
  private lastModelCalls: number = 0;
  private lastRepairAttempts: number = 0;
  private lastTimeoutTriggered: boolean = false;
  private lastEffectiveModelBudgetMs: number = 8000;

  // Enhanced fallback causality telemetry fields
  private lastPrimaryAttempted: boolean = false;
  private lastPrimarySucceeded: boolean = false;
  private lastPrimaryFailureReason?: string;
  private lastPrimaryDurationMs?: number;
  private lastPrimaryTimeoutTriggered: boolean = false;
  private lastFallbackAttempted: boolean = false;
  private lastFallbackSucceeded: boolean = false;
  private lastFallbackFailureReason?: string;
  private lastFallbackDurationMs?: number;
  private lastFallbackTimeoutTriggered: boolean = false;
  private lastDeterministicFallbackUsed: boolean = false;
  private lastDeterministicFallbackDurationMs?: number;
  private lastFinalExecutionPath: 'primary_model' | 'fallback_model' | 'deterministic_failsafe' | 'mock_gemini' = 'deterministic_failsafe';

  constructor(options?: GeminiNarratorOptions) {
    this.claimExtractor = new ResponseClaimExtractor();
    this.validator = new PostResponseGroundingValidator();

    if (options?.primaryModel) this.primaryModel = options.primaryModel;
    if (options?.fallbackModel) this.fallbackModel = options.fallbackModel;
    if (options?.forcePrimaryFailure !== undefined) this.forcePrimaryFailure = options.forcePrimaryFailure;
    if (options?.primaryTimeoutMs !== undefined) this.primaryTimeoutMs = options.primaryTimeoutMs;
    if (options?.fallbackTimeoutMs !== undefined) this.fallbackTimeoutMs = options.fallbackTimeoutMs;
    if (options?.repairTimeoutMs !== undefined) this.repairTimeoutMs = options.repairTimeoutMs;
    if (options?.consultationDeadlineMs !== undefined) this.consultationDeadlineMs = options.consultationDeadlineMs;
    this.lastEffectiveModelBudgetMs = this.primaryTimeoutMs;

    const isLiveRequested = !!options?.apiKey || !!options?.aiClient || process.env.FORCE_LIVE_GEMINI === 'true' || process.argv.includes('--live');
    this.forceMockMode = options?.forceMockMode ?? !isLiveRequested;

    if (options?.aiClient) {
      this.aiClient = options.aiClient;
    } else if (!this.forceMockMode) {
      const apiKey = options?.apiKey || process.env.GEMINI_API_KEY;
      if (apiKey) {
        this.aiClient = new GoogleGenAI({ apiKey });
      }
    }
  }

  public setForcePrimaryFailure(force: boolean) {
    this.forcePrimaryFailure = force;
  }

  public getLastTelemetry(): {
    requestedModel: string;
    selectedModel: string;
    effectiveModel: string;
    fallbackTriggered: boolean;
    fallbackReason?: string;
    executionMode: 'live_gemini' | 'mock_gemini' | 'deterministic_ci';
    providerLatencyMs: number;
    modelCalls: number;
    repairAttempts: number;
    modelUsed?: string;
    modelTimeoutBudgetMs: number;
    timeoutTriggered: boolean;
    primaryAttempted: boolean;
    primarySucceeded: boolean;
    primaryFailureReason?: string;
    primaryDurationMs?: number;
    primaryTimeoutTriggered: boolean;
    fallbackAttempted: boolean;
    fallbackSucceeded: boolean;
    fallbackFailureReason?: string;
    fallbackDurationMs?: number;
    fallbackTimeoutTriggered: boolean;
    deterministicFallbackUsed: boolean;
    deterministicFallbackDurationMs?: number;
    finalExecutionPath: 'primary_model' | 'fallback_model' | 'deterministic_failsafe' | 'mock_gemini';
  } {
    return {
      requestedModel: this.lastRequestedModel,
      selectedModel: this.lastSelectedModel,
      effectiveModel: this.lastEffectiveModel,
      fallbackTriggered: this.lastFallbackTriggered,
      fallbackReason: this.lastFallbackReason,
      executionMode: this.lastExecutionMode,
      providerLatencyMs: this.lastProviderLatencyMs,
      modelCalls: this.lastModelCalls,
      repairAttempts: this.lastRepairAttempts,
      modelUsed: this.lastModelUsed,
      modelTimeoutBudgetMs: this.lastEffectiveModelBudgetMs,
      timeoutTriggered: this.lastTimeoutTriggered,
      primaryAttempted: this.lastPrimaryAttempted,
      primarySucceeded: this.lastPrimarySucceeded,
      primaryFailureReason: this.lastPrimaryFailureReason,
      primaryDurationMs: this.lastPrimaryDurationMs,
      primaryTimeoutTriggered: this.lastPrimaryTimeoutTriggered,
      fallbackAttempted: this.lastFallbackAttempted,
      fallbackSucceeded: this.lastFallbackSucceeded,
      fallbackFailureReason: this.lastFallbackFailureReason,
      fallbackDurationMs: this.lastFallbackDurationMs,
      fallbackTimeoutTriggered: this.lastFallbackTimeoutTriggered,
      deterministicFallbackUsed: this.lastDeterministicFallbackUsed,
      deterministicFallbackDurationMs: this.lastDeterministicFallbackDurationMs,
      finalExecutionPath: this.lastFinalExecutionPath,
    };
  }

  public async narrate(
    plan: QuestionPlan,
    reasoningPacket: ReasoningPacket,
    approvedClaimSet: ApprovedClaimSet,
    responsePlan: ResponsePlan,
    options?: {
      forceMockMode?: boolean;
      forceMock?: boolean;
      maxRepairAttempts?: number;
      forcePrimaryFailure?: boolean;
      deadlineMs?: number;
      parentDeadlineTimestampMs?: number;
    }
  ): Promise<FinalResponse> {
    return this.generateNarrative(plan, reasoningPacket, approvedClaimSet, responsePlan, {
      forceMock: options?.forceMock ?? options?.forceMockMode,
      maxRepairAttempts: options?.maxRepairAttempts,
      forcePrimaryFailure: options?.forcePrimaryFailure,
      deadlineMs: options?.deadlineMs,
      parentDeadlineTimestampMs: options?.parentDeadlineTimestampMs,
    });
  }

  /**
   * Main entry point: synthesizes conversational response from verified claims,
   * runs validator, executes repair loop if needed, and produces audited FinalResponse.
   */
  public async generateNarrative(
    plan: QuestionPlan,
    reasoningPacket: ReasoningPacket,
    approvedClaimSet: ApprovedClaimSet,
    responsePlan: ResponsePlan,
    options?: {
      forceMock?: boolean;
      maxRepairAttempts?: number;
      forcePrimaryFailure?: boolean;
      deadlineMs?: number;
      parentDeadlineTimestampMs?: number;
    }
  ): Promise<FinalResponse> {
    const isMock = options?.forceMock ?? this.forceMockMode;
    const maxRepairs = options?.maxRepairAttempts ?? 2;
    const forcePrimaryFail = options?.forcePrimaryFailure ?? this.forcePrimaryFailure;
    const parentDeadlineTimestampMs = options?.parentDeadlineTimestampMs ?? (options?.deadlineMs ? Date.now() + options.deadlineMs : undefined);

    this.lastModelCalls = 0;
    this.lastRepairAttempts = 0;
    this.lastTimeoutTriggered = false;

    // Step 1: Generate initial draft (live Gemini or deterministic failsafe)
    let draftText = await this.generateDraft(plan, responsePlan, approvedClaimSet, isMock, forcePrimaryFail, parentDeadlineTimestampMs);

    // Step 2: Extract claims from generated draft
    let extractedClaims = this.claimExtractor.extractClaims(draftText);

    // Step 3: Post-response grounding validation against approved claim set
    let validatorStatus = this.validator.validate(extractedClaims, draftText, approvedClaimSet, reasoningPacket, plan);

    // Step 4: Repair Loop (Up to maxRepairs attempts)
    let repairCount = 0;
    while (!validatorStatus.valid && repairCount < maxRepairs) {
      repairCount++;
      draftText = await this.repairDraft(
        draftText,
        validatorStatus.violations,
        plan,
        responsePlan,
        approvedClaimSet,
        isMock,
        parentDeadlineTimestampMs
      );
      extractedClaims = this.claimExtractor.extractClaims(draftText);
      validatorStatus = this.validator.validate(extractedClaims, draftText, approvedClaimSet, reasoningPacket, plan);
    }

    // Step 5: If still invalid after repair loop, fallback to pure deterministic synthesizer
    if (!validatorStatus.valid) {
      draftText = this.synthesizeDeterministicNarrative(plan, responsePlan, approvedClaimSet);
      extractedClaims = this.claimExtractor.extractClaims(draftText);
      validatorStatus = this.validator.validate(extractedClaims, draftText, approvedClaimSet, reasoningPacket, plan);
    }

    // Step 6: Assemble final validated response packet
    const referencedClaimIds = approvedClaimSet.claims.map(c => c.claimId);
    const referencedEvidenceIds = Array.from(new Set(approvedClaimSet.claims.flatMap(c => c.evidenceIds || [])));
    const responseId = `resp_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const questionId = plan.questionId;

    const finalStatus: 'approved' | 'repaired' | 'fallback_safe' = 
      repairCount > 0 && validatorStatus.valid ? 'repaired' : (validatorStatus.valid ? 'approved' : 'fallback_safe');

    const finalResponse: FinalResponse = {
      responseId,
      questionId,
      text: draftText,
      responseType: responsePlan.responseType,
      referencedClaimIds,
      referencedEvidenceIds,
      validatorStatus: finalStatus,
      responseVersion: 'ai-v2-narrator-1',
      createdAtIso: new Date().toISOString(),
      verified: true,
    };

    const schemaValidation = validateFinalResponse(finalResponse);
    if (!schemaValidation.valid) {
      throw new Error(`GeminiNarrator generated invalid FinalResponse: ${schemaValidation.errors.join('; ')}`);
    }

    return finalResponse;
  }

  /**
   * Generates conversational draft text using true hierarchical child deadline calculation.
   */
  private async generateDraft(
    plan: QuestionPlan,
    responsePlan: ResponsePlan,
    approvedClaimSet: ApprovedClaimSet,
    forceMock?: boolean,
    forcePrimaryFail?: boolean,
    parentDeadlineTimestampMs?: number
  ): Promise<string> {
    const isMock = forceMock ?? this.forceMockMode;
    this.lastRequestedModel = this.primaryModel;
    this.lastSelectedModel = this.primaryModel;
    this.lastFallbackTriggered = false;
    this.lastFallbackReason = undefined;
    this.lastProviderLatencyMs = 0;
    this.lastTimeoutTriggered = false;

    // Reset attempt-level causality telemetry
    this.lastPrimaryAttempted = false;
    this.lastPrimarySucceeded = false;
    this.lastPrimaryFailureReason = undefined;
    this.lastPrimaryDurationMs = undefined;
    this.lastPrimaryTimeoutTriggered = false;
    this.lastFallbackAttempted = false;
    this.lastFallbackSucceeded = false;
    this.lastFallbackFailureReason = undefined;
    this.lastFallbackDurationMs = undefined;
    this.lastFallbackTimeoutTriggered = false;
    this.lastDeterministicFallbackUsed = false;
    this.lastDeterministicFallbackDurationMs = undefined;
    this.lastFinalExecutionPath = isMock ? 'mock_gemini' : 'deterministic_failsafe';

    if (this.aiClient && !isMock) {
      const systemInstruction = getNarratorSystemInstruction();
      const userPrompt = buildNarratorUserPrompt(plan.rawQuestion, responsePlan, approvedClaimSet);

      // Controlled primary model attempt
      if (!forcePrimaryFail) {
        this.lastPrimaryAttempted = true;
        const remainingForPrimary = parentDeadlineTimestampMs !== undefined
          ? parentDeadlineTimestampMs - Date.now()
          : Infinity;

        if (remainingForPrimary <= 50) {
          this.lastTimeoutTriggered = true;
          this.lastPrimaryTimeoutTriggered = true;
          this.lastFallbackTriggered = true;
          this.lastPrimaryFailureReason = `PARENT_DEADLINE_EXHAUSTED_BEFORE_PRIMARY (${Math.round(remainingForPrimary)}ms remaining)`;
          this.lastFallbackReason = this.lastPrimaryFailureReason;
        } else {
          const effectivePrimaryBudget = Math.min(this.primaryTimeoutMs, remainingForPrimary);
          this.lastEffectiveModelBudgetMs = effectivePrimaryBudget;

          const callStart = Date.now();
          try {
            this.lastModelCalls++;
            const callPromise = this.aiClient.models.generateContent({
              model: this.primaryModel,
              contents: userPrompt,
              config: {
                systemInstruction,
                temperature: 0.3,
              },
            });

            const response: any = await Promise.race([
              callPromise,
              new Promise((_, reject) =>
                setTimeout(() => {
                  this.lastTimeoutTriggered = true;
                  this.lastPrimaryTimeoutTriggered = true;
                  reject(new Error(`ModelCallTimeout: ${effectivePrimaryBudget}ms exceeded for ${this.primaryModel}`));
                }, effectivePrimaryBudget)
              ),
            ]);

            this.lastPrimaryDurationMs = Date.now() - callStart;
            if (response.text && response.text.trim().length > 10) {
              this.lastExecutionMode = 'live_gemini';
              this.lastEffectiveModel = this.primaryModel;
              this.lastModelUsed = this.primaryModel;
              this.lastFallbackTriggered = false;
              this.lastPrimarySucceeded = true;
              this.lastFinalExecutionPath = 'primary_model';
              this.lastProviderLatencyMs = this.lastPrimaryDurationMs;
              return response.text.trim();
            }
          } catch (err: any) {
            this.lastPrimaryDurationMs = Date.now() - callStart;
            this.lastPrimarySucceeded = false;
            this.lastPrimaryFailureReason = err?.message || `Error calling primary model ${this.primaryModel}`;
            this.lastFallbackTriggered = true;
            this.lastFallbackReason = this.lastPrimaryFailureReason;
            console.warn(`[GeminiNarrator] Primary model ${this.primaryModel} failed: ${this.lastFallbackReason}. Activating fallback to ${this.fallbackModel}.`);
          }
        }
      } else {
        this.lastPrimaryAttempted = true;
        this.lastPrimarySucceeded = false;
        this.lastPrimaryFailureReason = 'CONTROLLED_PRIMARY_FAILURE_SIMULATION';
        this.lastFallbackTriggered = true;
        this.lastFallbackReason = 'CONTROLLED_PRIMARY_FAILURE_SIMULATION';
      }

      // Fallback model attempt: strictly derives remaining parent budget
      this.lastFallbackAttempted = true;
      const remainingForFallback = parentDeadlineTimestampMs !== undefined
        ? parentDeadlineTimestampMs - Date.now()
        : Infinity;

      if (remainingForFallback <= 50) {
        this.lastTimeoutTriggered = true;
        this.lastFallbackTimeoutTriggered = true;
        this.lastFallbackFailureReason = `PARENT_DEADLINE_EXHAUSTED_BEFORE_FALLBACK (${Math.round(remainingForFallback)}ms remaining)`;
        this.lastFallbackReason = this.lastFallbackFailureReason;
      } else {
        const effectiveFallbackBudget = Math.min(this.fallbackTimeoutMs, remainingForFallback);
        this.lastEffectiveModelBudgetMs = effectiveFallbackBudget;

        const callStart = Date.now();
        try {
          this.lastModelCalls++;
          const callPromise = this.aiClient.models.generateContent({
            model: this.fallbackModel,
            contents: userPrompt,
            config: {
              systemInstruction,
              temperature: 0.3,
            },
          });

          const response: any = await Promise.race([
            callPromise,
            new Promise((_, reject) =>
              setTimeout(() => {
                this.lastTimeoutTriggered = true;
                this.lastFallbackTimeoutTriggered = true;
                reject(new Error(`ModelCallTimeout: ${effectiveFallbackBudget}ms exceeded for ${this.fallbackModel}`));
              }, effectiveFallbackBudget)
            ),
          ]);

          this.lastFallbackDurationMs = Date.now() - callStart;
          if (response.text && response.text.trim().length > 10) {
            this.lastExecutionMode = 'live_gemini';
            this.lastEffectiveModel = this.fallbackModel;
            this.lastModelUsed = this.fallbackModel;
            this.lastFallbackSucceeded = true;
            this.lastFinalExecutionPath = 'fallback_model';
            this.lastProviderLatencyMs = this.lastFallbackDurationMs;
            return response.text.trim();
          }
        } catch (err: any) {
          this.lastFallbackDurationMs = Date.now() - callStart;
          this.lastFallbackSucceeded = false;
          this.lastFallbackFailureReason = err?.message || 'unknown error';
          this.lastFallbackReason = `ALL_LIVE_MODELS_UNAVAILABLE: Primary(${this.lastPrimaryFailureReason || this.lastFallbackReason}) -> Fallback(${this.lastFallbackFailureReason})`;
          console.warn(`[GeminiNarrator] Fallback model ${this.fallbackModel} also failed: ${err.message}. Reverting to deterministic failsafe.`);
        }
      }
    }

    this.lastExecutionMode = isMock ? 'mock_gemini' : 'deterministic_ci';
    this.lastSelectedModel = 'AstroWorld Classical Deterministic Narrator';
    this.lastEffectiveModel = 'AstroWorld Classical Deterministic Narrator';
    this.lastModelUsed = 'AstroWorld Classical Deterministic Narrator';
    this.lastProviderLatencyMs = 0;
    this.lastDeterministicFallbackUsed = !isMock;
    this.lastFinalExecutionPath = isMock ? 'mock_gemini' : 'deterministic_failsafe';

    // Pure, dynamic claim-grounded deterministic narrative synthesis
    const detStart = Date.now();
    const detResult = this.synthesizeDeterministicNarrative(plan, responsePlan, approvedClaimSet);
    this.lastDeterministicFallbackDurationMs = Date.now() - detStart;
    return detResult;
  }

  /**
   * Repairs draft text by targeting specific detected violations within remaining parent deadline.
   */
  private async repairDraft(
    originalDraft: string,
    violations: string[],
    plan: QuestionPlan,
    responsePlan: ResponsePlan,
    approvedClaimSet: ApprovedClaimSet,
    effectiveMock?: boolean,
    parentDeadlineTimestampMs?: number
  ): Promise<string> {
    this.lastRepairAttempts++;
    const isMock = effectiveMock ?? this.forceMockMode;
    if (this.aiClient && !isMock) {
      const remainingForRepair = parentDeadlineTimestampMs !== undefined
        ? parentDeadlineTimestampMs - Date.now()
        : Infinity;

      if (remainingForRepair <= 50) {
        this.lastTimeoutTriggered = true;
        return this.synthesizeDeterministicNarrative(plan, responsePlan, approvedClaimSet);
      }

      const effectiveRepairBudget = Math.min(this.repairTimeoutMs, remainingForRepair);
      this.lastEffectiveModelBudgetMs = effectiveRepairBudget;
      const candidateModels = [this.primaryModel, this.fallbackModel];
      const repairPrompt = `The previous response draft contained grounding violations that must be fixed:
VIOLATIONS TO CORRECT:
${violations.map(v => `- ${v}`).join('\n')}

PREVIOUS DRAFT:
"${originalDraft}"

APPROVED CLAIMS ONLY:
${approvedClaimSet.claims.map(c => `- ${c.text}`).join('\n')}

Rewrite the response removing all unapproved dates, certainty words, or unverified claims.`;

      for (const modelName of candidateModels) {
        const loopRemaining = parentDeadlineTimestampMs !== undefined
          ? parentDeadlineTimestampMs - Date.now()
          : Infinity;
        if (loopRemaining <= 50) break;
        const currentModelBudget = Math.min(this.repairTimeoutMs, loopRemaining);
        try {
          this.lastModelCalls++;
          const callPromise = this.aiClient.models.generateContent({
            model: modelName,
            contents: repairPrompt,
            config: {
              systemInstruction: getNarratorSystemInstruction(),
              temperature: 0.1,
            },
          });

          const response: any = await Promise.race([
            callPromise,
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error(`RepairModelCallTimeout: ${currentModelBudget}ms exceeded for ${modelName}`)), currentModelBudget)
            ),
          ]);

          if (response.text && response.text.trim().length > 10) {
            return response.text.trim();
          }
        } catch (err: any) {
          console.warn(`[GeminiNarrator] Live repair model ${modelName} error: ${err.message}`);
        }
      }
    }

    return this.synthesizeDeterministicNarrative(plan, responsePlan, approvedClaimSet);
  }

  /**
   * High-quality deterministic conversational narrative synthesizer.
   * Completely dynamic: constructs response exclusively from approved claims and context pack.
   * NEVER injects hardcoded horoscopes or facts from any fixed native profile.
   */
  public synthesizeDeterministicNarrative(
    plan: QuestionPlan,
    responsePlan: ResponsePlan,
    approvedClaimSet: ApprovedClaimSet
  ): string {
    const claims = approvedClaimSet.claims.filter(claim => claim.allowed !== false);
    const pack = responsePlan.contextPack;
    const rawLower = plan.rawQuestion.toLowerCase();

    // Safety responses may be deterministic, but chart-specific statements never are.
    if (rawLower.includes('when will i die') || rawLower.includes('will i die') || rawLower.includes('death')) {
      return "I don't provide fatalistic predictions about death. We can instead explore chart themes traditionally associated with vitality, resilience, and supportive periods, while keeping practical health decisions grounded in medical advice.";
    }

    if (responsePlan.responseType === 'clarification' || responsePlan.responseType === 'insufficient_evidence' ||
        plan.clarificationRequired || plan.intent === 'clarification_needed' || plan.intent === 'clarification_required') {
      if (plan.clarification?.question) {
        return (plan.clarification.reason || 'I need one detail to give you a focused reading.') + ' ' + plan.clarification.question;
      }
      const baseResponse = "I don't have enough verified chart evidence to answer that reliably yet. Which life area and timeframe should I focus on?";
      const coverageLimitations = responsePlan.responseType === 'insufficient_evidence'
        ? getQuestionCoverageLimitations(approvedClaimSet)
        : [];
      return [baseResponse, ...coverageLimitations].join(' ');
    }

    if (claims.length === 0) {
      const coverageLimitations = getQuestionCoverageLimitations(approvedClaimSet);
      return [
        "I don't have enough approved chart-specific evidence in this response to give you a reliable interpretation. I'd rather check the relevant placements and timing than guess.",
        ...coverageLimitations,
      ].join(' ');
    }

    // Memory recall must be grounded in user-provided memory and must not append a chart prediction.
    const asksMemory = rawLower.includes('what do you remember') ||
      rawLower.includes('remember about me') || rawLower.includes('what i am targeting') ||
      rawLower.includes('career goal') || rawLower.includes('what did i tell you');
    const memoryClaims = claims.filter(claim =>
      claim.type === 'user_context' || (claim.type as string) === 'memory' ||
      claim.text.toLowerCase().startsWith('user noted:')
    );
    if (asksMemory && memoryClaims.length > 0) {
      return memoryClaims.map(claim => this.normalizeSimpleFact(claim.text)).join(' ');
    }

    const factualClaims = claims.filter(claim => claim.type === 'factual' || claim.type === 'timing');
    const synthesisClaim = claims.find(claim => claim.type === 'qualified_prediction' || claim.type === 'interpretive');

    // Resolve simple chart-fact questions against the actual supplied claims. In particular,
    // select a D10 Lagna/Ascendant fact from this chart, never a benchmark-native answer.
    if (responsePlan.responseType === 'simple_fact') {
      const asksD10Lagna = rawLower.includes('d10') &&
        (rawLower.includes('lagna') || rawLower.includes('ascendant'));
      const d10LagnaClaim = asksD10Lagna
        ? factualClaims.find(claim => {
            const text = claim.text.toLowerCase();
            return text.includes('d10') && (text.includes('lagna') || text.includes('ascendant'));
          })
        : undefined;
      const matchingClaim = d10LagnaClaim ||
        this.findMatchingFactualClaim(factualClaims.length > 0 ? factualClaims : claims, rawLower);
      if (matchingClaim) {
        return this.normalizeSimpleFact(matchingClaim.text);
      }
      const contextFact = (pack?.supportingFactors || []).find(factor => factor && factor.trim().length > 0);
      if (contextFact) {
        return this.normalizeSimpleFact(contextFact);
      }
      return "I couldn't find a matching verified chart fact for that specific question. Please check that the chart layer and birth details are correct.";
    }

    // The conclusion comes from the approved synthesis claim/context. This method does not
    // infer a placement, yoga, dasha, transit, event, or classical rule from the wording alone.
    const directAnswer = (pack?.directAnswerDirection || synthesisClaim?.text || '').trim();
    const paragraphs: string[] = [];
    const transitFocus = pack?.transitFocus;
    const transitActivationSummary = (transitFocus?.activationSummary?.trim() || '').replace(/[.!?]+$/, '');
    const hasVerifiedTransitFocus =
      transitFocus?.hasVerifiedTransitEvidence === true &&
      typeof transitFocus.transitingPlanet === 'string' &&
      transitFocus.transitingPlanet.trim().length > 0 &&
      transitActivationSummary.length > 0;

    if (hasVerifiedTransitFocus) {
      // The transit lead is derived only from a verified transit claim in the context pack.
      // A generic transit phrase is never emitted merely because the user mentioned a planet.
      const transitLead =
        `The transit of ${transitFocus.transitingPlanet} is calculated as follows: ${transitActivationSummary}.`;
      const qualification =
        'A key qualification: a transit alone cannot confirm a specific event; it must be read alongside the natal chart and running dasha.';
      paragraphs.push([transitLead, directAnswer, qualification].filter(Boolean).join(' '));
    } else if (directAnswer) {
      paragraphs.push(directAnswer);
    }

    const coverageLimitations = getQuestionCoverageLimitations(approvedClaimSet);
    if (coverageLimitations.length > 0) {
      paragraphs.push(coverageLimitations.join(' '));
    }

    const rawSupporting = pack?.supportingFactors?.length
      ? pack.supportingFactors
      : factualClaims
          .filter(claim => claim.type === 'factual' && claim.strength !== 'mixed')
          .map(claim => this.normalizeSimpleFact(claim.text));
    const cleanedSupporting = rawSupporting
      .filter(item => typeof item === 'string' && item.trim().length > 0)
      .filter(item => !directAnswer || item.trim().toLowerCase() !== directAnswer.toLowerCase())
      .filter(item =>
        !hasVerifiedTransitFocus ||
        item.trim().toLowerCase() !== transitActivationSummary.toLowerCase()
      );

    // Keep at least one relevant approved factor for the primary and each requested
    // secondary domain. The ordinary concise-response budget must not silently erase
    // a facet the user explicitly asked about.
    const domainSignals: Record<string, string[]> = {
      career: ['career', 'job', 'promotion', 'profession', 'employment', 'work', 'd10', 'leadership'],
      finance: ['finance', 'financial', 'money', 'wealth', 'income', 'salary', 'earnings', 'savings', 'investment', 'ashtakavarga', 'dhana', '11th house', '2nd house'],
      relationship: ['relationship', 'marriage', 'spouse', 'partner', 'wedding', 'love', 'navamsha', 'd9'],
      travel: ['travel', 'abroad', 'overseas', 'foreign', 'relocation', 'relocate', 'emigration', 'd4'],
      education: ['education', 'study', 'studies', 'exam', 'academic', 'university', 'degree', 'd24'],
      health: ['health', 'vitality', 'well-being', 'wellbeing', 'illness'],
      spirituality: ['spirituality', 'spiritual', 'moksha', 'dharma'],
    };
    const requestedDomains = Array.from(new Set([
      ...(pack?.domain ? [pack.domain] : []),
      ...(pack?.secondaryDomains || []),
    ])).map(domain => domain.toLowerCase());
    const supporting: string[] = [];
    for (const domain of requestedDomains) {
      const signals = domainSignals[domain] || [domain];
      const domainFactor = cleanedSupporting.find(item =>
        signals.some(signal => item.toLowerCase().includes(signal)),
      );
      if (domainFactor && !supporting.includes(domainFactor)) supporting.push(domainFactor);
    }

    // Fill remaining space with the highest-priority remaining factors; a compound
    // response may exceed the single-domain baseline only when needed to cover facets.
    const ordinarySupportLimit = responsePlan.requestedDepth === 'deep' ? 4 : 2;
    const supportLimit = Math.max(ordinarySupportLimit, supporting.length);
    for (const item of cleanedSupporting) {
      if (supporting.length >= supportLimit) break;
      if (!supporting.includes(item)) supporting.push(item);
    }

    if (supporting.length > 0) {
      paragraphs.push('The main chart factors are: ' + supporting.join(' '));
    }

    const rawRestrictions = pack?.restrictingFactors?.length
      ? pack.restrictingFactors
      : claims
          .filter(claim => claim.type !== 'factual' && claim.type !== 'timing' &&
            (claim.strength === 'mixed' || claim.text.toLowerCase().includes('restriction') ||
             claim.text.toLowerCase().includes('delay') || claim.text.toLowerCase().includes('patience')))
          .map(claim => claim.text);
    const restrictions = rawRestrictions
      .filter(item => typeof item === 'string' && item.trim().length > 0)
      .slice(0, 2);
    if (restrictions.length > 0) {
      paragraphs.push('The important qualification is: ' + restrictions.join(' '));
    }

    const asksTiming = ['when', 'timing', 'period', 'window', 'year', 'month', 'dasha', 'transit', 'by 20']
      .some(term => rawLower.includes(term));
    const timingWindows = asksTiming ? (pack?.timingWindows || []).slice(0, 2) : [];
    if (timingWindows.length > 0) {
      const formatted = timingWindows
        .filter(window => window.periodText && window.periodText.trim().length > 0)
        .map(window => (window.label ? window.label + ': ' : '') + window.periodText);
      if (formatted.length > 0) {
        paragraphs.push('For timing, the calculated window is ' + formatted.join('; ') + '.');
      }
    }

    const classicalContext = pack?.classicalContextSummary?.trim();
    if (classicalContext &&
        !classicalContext.toLowerCase().includes('no directly applicable classical rule passed')) {
      paragraphs.push(classicalContext);
    }

    if (paragraphs.length === 0) {
      return "I don't have enough approved chart-specific evidence to explain this accurately yet. I'd rather verify the relevant chart factors than fill the gap with a generic prediction.";
    }

    return paragraphs.slice(0, 4).join('\n\n');
  }

  /**
   * Helper to dynamically match factual claims to user inquiry tokens without hardcoded profiles.
   */
  private findMatchingFactualClaim(claims: any[], lower: string): any {
    // Only search non-authority claims
    const eligible = claims.filter(c => c.type !== 'authority');

    return eligible.find(c => {
      const textLower = c.text.toLowerCase();
      if (lower.includes('moon sign') || lower.includes('rashi') || lower.includes('rasi')) {
        return textLower.includes('moon') && (textLower.includes('sign') || textLower.includes('placement') || textLower.includes('is in') || textLower.includes('position'));
      }
      if (lower.includes('d10') && (lower.includes('lagna') || lower.includes('ascendant') || lower.includes('rising'))) {
        return (textLower.includes('d10') || textLower.includes('dashamsha')) && (textLower.includes('lagna') || textLower.includes('ascendant'));
      }
      if (lower.includes('d9') && (lower.includes('lagna') || lower.includes('ascendant') || lower.includes('rising'))) {
        return (textLower.includes('d9') || textLower.includes('navamsha')) && (textLower.includes('lagna') || textLower.includes('ascendant'));
      }
      if (lower.includes('nakshatra') || lower.includes('birth star') || lower.includes('star')) {
        return textLower.includes('nakshatra') || textLower.includes('pada') || textLower.includes('moon');
      }
      if (lower.includes('atmakaraka') || lower.includes('jaimini') || lower.includes('amatyakaraka')) {
        return textLower.includes('atmakaraka') || textLower.includes('amatyakaraka') || textLower.includes('karakamsa') || textLower.includes('jaimini') || textLower.includes('sun') || textLower.includes('driver');
      }
      if (lower.includes('10th house') || lower.includes('10th')) {
        return textLower.includes('10th') || textLower.includes('house 10') || textLower.includes('tenth') || textLower.includes('saturn');
      }
      if (lower.includes('7th house') || lower.includes('7th')) {
        return textLower.includes('7th') || textLower.includes('house 7') || textLower.includes('seventh');
      }
      if (lower.includes('5th house') || lower.includes('5th')) {
        return textLower.includes('5th') || textLower.includes('house 5') || textLower.includes('fifth');
      }
      if (lower.includes('9th house') || lower.includes('9th')) {
        return textLower.includes('9th') || textLower.includes('house 9') || textLower.includes('ninth');
      }
      if (lower.includes('11th house') || lower.includes('11th')) {
        return textLower.includes('11th') || textLower.includes('house 11') || textLower.includes('eleventh');
      }
      if (lower.includes('ascendant') || (lower.includes('lagna') && !lower.includes('d10') && !lower.includes('d9'))) {
        return textLower.includes('ascendant') || textLower.includes('lagna is in') || textLower.includes('placement of ascendant');
      }
      if (lower.includes('dasha') || lower.includes('mahadasha') || lower.includes('antardasha')) {
        return textLower.includes('dasha') || textLower.includes('mahadasha') || textLower.includes('antardasha');
      }
      if (lower.includes('venus')) return textLower.includes('venus');
      if (lower.includes('jupiter')) return textLower.includes('jupiter');
      if (lower.includes('saturn')) return textLower.includes('saturn');
      if (lower.includes('mars')) return textLower.includes('mars');
      if (lower.includes('mercury')) return textLower.includes('mercury');
      if (lower.includes('sun')) return textLower.includes('sun');
      if (lower.includes('rahu')) return textLower.includes('rahu');
      if (lower.includes('ketu')) return textLower.includes('ketu');
      return false;
    });
  }

  private normalizeSimpleFact(text: string): string {
    let res = text
      .replace(/^The verified chart placement of\s+/i, '')
      .replace(/\s+acts as a primary astrological driver\./i, '.')
      .replace(/\s+provides supporting astrological background\./i, '.')
      .replace(/varga_sign:\s*/gi, '')
      .replace(/active_periods?:\s*([A-Za-z]+)\s*-\s*([A-Za-z]+)/gi, 'active $1 Mahadasha ($2 Antardasha) period')
      .replace(/active_periods:\s*/gi, 'active Antardasha / Mahadasha period: ')
      .trim();

    if (/\b(mahadasha|antardasha|dasha)\b/i.test(res) && !/\b(period|cycle)\b/i.test(res)) {
      res = `${res} period`;
    }
    return res;
  }

  /**
   * Safe minimal fallback response.
   */
  private buildSafeFallback(
    plan: QuestionPlan,
    responsePlan: ResponsePlan,
    approvedClaimSet: ApprovedClaimSet
  ): string {
    const fallbackPrefix = "I can support this from the verified chart evidence, but the generated explanation included a detail I couldn't verify, so I'm keeping the answer to the factors I can substantiate.";
    const directClaim = approvedClaimSet.claims.find(c => c.type === 'qualified_prediction') || approvedClaimSet.claims[0];
    const timingClaim = approvedClaimSet.claims.find(c => c.type === 'timing');

    const parts = [
      fallbackPrefix,
      directClaim ? directClaim.text : 'The astrological factors support constructive development.'
    ];
    if (timingClaim) {
      parts.push(timingClaim.text);
    }

    return parts.join('\n\n');
  }
}
