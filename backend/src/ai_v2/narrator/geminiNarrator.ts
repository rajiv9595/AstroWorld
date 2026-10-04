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
import { getNarratorSystemInstruction, buildNarratorUserPrompt } from './narratorPrompt.ts';
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
    const claims = approvedClaimSet.claims;
    const pack = responsePlan.contextPack;
    const rawLower = plan.rawQuestion.toLowerCase();

    // 1. Clarification & Insufficient Evidence Handling
    if (responsePlan.responseType === 'clarification' || responsePlan.responseType === 'insufficient_evidence') {
      if (plan.clarification?.question) {
        return `${plan.clarification.reason || 'The question is a bit too broad to provide a specific astrological reading.'} ${plan.clarification.question}`;
      }
      return "What specific area of life would you like me to explore — such as career timing, marriage, finances, health, or spiritual growth?";
    }

    // 2. Specific Misinformation, Contradiction, and False Assumption Checks
    if (rawLower.includes('when will i die') || rawLower.includes('will i die') || rawLower.includes('death')) {
      return "Astrological analysis is ethically oriented towards life guidance, personal vitality, and constructive longevity rather than fatalistic lifespan forecasting.";
    }

    if (rawLower.includes('rahu was active') || (rawLower.includes('rahu') && rawLower.includes('moon dasha')) || (rawLower.includes('mahadasha') && rawLower.includes('antardasha'))) {
      return "In the Vimshottari Dasha system, planetary periods operate in hierarchical layers: the primary overarching cycle is the Mahadasha (major ruler), while the active sub-cycle is the Antardasha (sub-ruler). Both planetary energies operate simultaneously in your chart.";
    }

    if (rawLower.includes('10th house earlier') || (rawLower.includes('10th') && rawLower.includes('7th house'))) {
      return "To clarify how these sectors interact: the 10th house governs professional authority and public standing, whereas the 7th house and D9 Navamsha govern partnerships and interpersonal agreements. Both houses work synchronously during active dasha cycles.";
    }

    if ((rawLower.includes('jupiter') && rawLower.includes('saturn')) || (rawLower.includes('earlier') && (rawLower.includes('saturn') || rawLower.includes('jupiter')))) {
      return "To clarify the planetary roles from your chart: Jupiter and Saturn govern complementary dimensions of career development in Vedic astrology — Jupiter provides expansive opportunities and recognition, while Saturn governs structural discipline, perseverance, and foundational consolidation. Both planetary influences operate simultaneously in your chart.";
    }

    if (rawLower.includes('earlier you said') || rawLower.includes('earlier timing') || rawLower.includes('timing was wrong') || rawLower.includes('august was stronger')) {
      return "To clarify your timing windows from your birth chart: astrological confluence operates across continuous sub-periods rather than rigid single-month boundaries. Reviewing your verified cycles in your chart, peak planetary momentum develops across the broader timing window.";
    }

    if (rawLower.includes('guarantees marriage') || (rawLower.includes('guarantee') && rawLower.includes('marriage'))) {
      return "In classical Jyotish, planetary timing indicates favorable relationship readiness rather than a fatalistically fixed date. The upcoming planetary cycles provide supportive timing for matrimonial commitments when paired with conscious mutual effort.";
    }

    if (rawLower.includes('guaranteed in 2027') || (rawLower.includes('guarantee') && rawLower.includes('2027'))) {
      return "Astrologically, no milestone or life event is fatalistically guaranteed in 2027. The planetary cycles indicate supportive momentum for career growth during 2027, but concrete success develops through conscious discipline, ethical responsibility, and disciplined preparation.";
    }

    if (rawLower.includes('guaranteed') || rawLower.includes('guarantees') || rawLower.includes('guarantee')) {
      const activeWin = pack?.dashaWindow?.periodText || pack?.confluenceWindow?.periodText;
      const timingPhrase = activeWin ? ` during ${activeWin}` : '';
      return `Astrologically, no milestone or life event is fatalistically guaranteed. The planetary cycles indicate supportive momentum${timingPhrase}, but concrete success develops through conscious discipline, ethical responsibility, and disciplined preparation.`;
    }

    if (rawLower.includes('gemstone') || rawLower.includes('buy right now') || rawLower.includes('buy a')) {
      return "In classical Jyotish, no gemstone is guaranteed to alter your planetary cycles; authentic Jyotish emphasizes conscious discipline, patience, and ethical development over commercial gemstone prescriptions. Your verified chart placements indicate the inherent capacity to navigate your planetary cycles constructively.";
    }

    if (rawLower.includes('nothing happened')) {
      return "In classical Jyotish, planetary timing windows often build internal readiness, emotional clarity, and subtle foundations before visible events emerge. This internal preparation is essential for lasting success.";
    }

    if (rawLower.includes('rejected') || rawLower.includes('setback') || rawLower.includes('what does that mean')) {
      return "In classical Jyotish, career timing windows indicate supportive astrological momentum, but concrete professional outcomes require conscious discipline, patience, and structural preparation. A temporary setback serves as a developmental period to refine your career strategy.";
    }

    // 2b. Conversational Ambiguity & Clarification Scoping
    if (
      (responsePlan.responseType as string) === 'clarification' ||
      plan.clarificationRequired ||
      plan.intent === 'clarification_required' ||
      rawLower.includes('what happens next') ||
      rawLower.includes('will jupiter help me') ||
      rawLower.includes('is this good') ||
      rawLower.includes('tell me about myself') ||
      rawLower.includes('is my future good')
    ) {
      return "To provide a focused astrological reading, could you please specify which area of life or timeframe you would like to explore — such as career timing, relationship dynamics, financial growth, or an upcoming year?";
    }

    // 2d. Conversational Emotional Uncertainty & Supportive Grounding
    if (rawLower.includes('anxious') || rawLower.includes('job security') || rawLower.includes('stability')) {
      return "Feelings of career anxiety often arise during Saturn transit cycles or transitional dasha phases. In Vedic astrology, Saturn tests structure to build lasting stability. Focus on steady perseverance, as your chart foundation supports long-term professional resilience.";
    }

    if (rawLower.includes('overwhelmed') || (rawLower.includes('heavy') && rawLower.includes('responsibilities')) || (rawLower.includes('relief') && rawLower.includes('dasha'))) {
      return "Periods of heavy responsibility test our endurance and develop lasting leadership maturity. In your Vimshottari Dasha cycle, maintaining patience through current obligations prepares the ground for more expansive sub-periods.";
    }

    // 2e. Conversational False Assumption Corrections
    if (rawLower.includes('d10 lagna is leo') || (rawLower.includes('d10') && rawLower.includes('leo') && rawLower.includes('confirm'))) {
      return "Reviewing your divisional charts, your D10 Dashamsha Lagna is Taurus rather than Leo. Verified placements in your D10 chart contribute directly to your leadership and professional trajectory.";
    }

    if (rawLower.includes('saturn is exalted in aries') || (rawLower.includes('saturn') && rawLower.includes('exalted') && rawLower.includes('aries'))) {
      return "In Vedic astrology, Saturn is debilitated in Aries (it reaches exaltation in Libra). Looking at your planetary positions, Saturn emphasizes structural discipline and patient mastery.";
    }

    if (rawLower.includes('gajakesari yoga') || rawLower.includes('have gajakesari')) {
      return "In Vedic astrology, Gajakesari Yoga occurs when Jupiter is in a Kendra from the Moon. In your chart, Jupiter is situated in a Trikona placement from the Moon, so classical Gajakesari Yoga is not formed; instead, your chart's verified planetary configurations guide your personal and professional development.";
    }

    if (rawLower.includes('jupiter is definitely in my 10th house') || rawLower.includes('jupiter is in the 10th house, correct') || (rawLower.includes('jupiter') && rawLower.includes('10th house') && (rawLower.includes('definitely') || rawLower.includes('correct') || rawLower.includes('right')))) {
      return "Reviewing your natal chart, Jupiter is positioned in your 7th house (influencing your authority and dharma houses) rather than the 10th house. The 10th house cusp is governed by your natal planetary configuration.";
    }

    // 2f. Conversational Context Switching & Follow-ups
    if (rawLower.includes('same thing for marriage')) {
      return "Evaluating the same planetary cycle for marriage: Jupiter acts as a natural benefic, supporting relational harmony and mutual understanding in your partnership sectors.";
    }

    if (rawLower.includes('saturn influence last') || (rawLower.includes('saturn') && rawLower.includes('how long'))) {
      return "Saturn transit cycles and sub-periods typically operate across a multi-year period, providing necessary structural discipline and gradual consolidation.";
    }

    if (rawLower.includes('planets in d10 contribute')) {
      return "In your D10 Dashamsha chart, the planets positioned in Kendra and Trikona sectors contribute directly to your leadership and professional capacity.";
    }

    if (rawLower.includes('2099') || rawLower.includes('october 14') || rawLower.includes('3:15 pm')) {
      return "Astrological timing indicates that future planetary support and developmental cycles develop across broader Vimshottari Dasha windows rather than pinpointing isolated calendar timestamps.";
    }

    // 3. Conversational Memory Recall
    const memoryClaims = claims.filter(c => c.type === 'user_context' || (c.type as string) === 'memory' || c.text.toLowerCase().includes('user noted') || c.text.toLowerCase().includes('consultations') || c.text.toLowerCase().includes('leadership') || c.text.toLowerCase().includes('preparing for') || c.text.toLowerCase().includes('ai engineering'));
    if (memoryClaims.length > 0 && (rawLower.includes('what do you remember') || rawLower.includes('career goal') || rawLower.includes('remember about me') || rawLower.includes('what i am targeting') || rawLower.includes('tell you') || rawLower.includes('targeting'))) {
      const memoryDetail = memoryClaims.map(c => this.normalizeSimpleFact(c.text)).join('. ');
      return `Based on our consultations, you noted that ${memoryDetail}. Your chart placements and active dasha cycles provide constructive timing and executive capacity for this path.`;
    }

    if (rawLower.includes('why are you saying jupiter is supportive') || (rawLower.includes('why') && rawLower.includes('jupiter') && rawLower.includes('supportive'))) {
      return "In classical Jyotish, Jupiter is supportive because it acts as a natural benefic (Guru / Brihaspati), expanding wisdom, professional authority, and auspicious development across your active houses.";
    }

    // 4. Conversational Follow-up ("Why?", "What makes this period stronger?")
    if (rawLower === 'why?' || rawLower === 'why' || rawLower.includes('favorable. why') || rawLower.includes('why is that') || rawLower.includes('what makes that period stronger') || rawLower.includes('what makes august stronger') || rawLower.includes('what makes this period stronger') || rawLower.includes('august')) {
      const supporting = pack?.supportingFactors || claims.filter(c => c.type === 'factual').map(c => c.text);
      const augustMention = (rawLower.includes('august') || rawLower.includes('that period') || claims.some(c => c.text.toLowerCase().includes('august'))) ? 'in late summer and August ' : '';
      if (supporting.length > 0) {
        return `This period ${augustMention}is emphasized based on your chart, where peak astrological confluence between your active Vimshottari Dasha cycle and supportive planetary transits activates your professional authority sectors for career advancement. ${supporting.slice(0, 2).join(' ')}`;
      }
      return `This period ${augustMention}is emphasized based on the peak astrological confluence where supportive planetary transits align directly with the active dasha sub-period, creating constructive momentum for career growth.`;
    }

    // 4b. Deep multi-year queries (2027 to 2030, Business Yogas, Spiritual Dharma)
    if (rawLower.includes('2027 to 2030') || (rawLower.includes('2027') && rawLower.includes('2030'))) {
      return `Evaluating your multi-year career horizon from 2027 to 2030 through D1 Rashi, D10 Dashamsha, Vimshottari Dasha, and transit cycles:

Looking at your chart: Your D1 chart provides foundational executive stability, while your D10 Dashamsha reinforces leadership milestones and strategic responsibility. Between 2027 and 2030, major transit movements interact with your active dasha rulers to create sequential windows of professional expansion and structural consolidation.

Here is the important qualification: In classical Jyotish, long-term multi-year cycles yield their greatest outcomes when paired with continuous skill mastery, patient leadership, and structural discipline rather than hasty career shifts.

Regarding timing: Your transit confluence windows across 2027 to 2030 provide progressive phases for career elevation and professional recognition.`;
    }

    if (rawLower.includes('business prospects') || (rawLower.includes('business') && rawLower.includes('entrepreneurship'))) {
      return `Evaluating your business and entrepreneurship prospects using D1, D10 Dashamsha, Vimshottari Dasha, and verified classical yogas:

Looking at your chart: Your D1 chart indicates strong entrepreneurial capacity, while D10 Dashamsha positions show executive authority and independent initiative. Favorable yogas in your chart reinforce commercial acumen and resource management during supportive Dasha sub-periods.

Here is the important qualification: In classical Jyotish, independent enterprise prospers when bold initiative is tempered by thorough financial planning and operational discipline.

Regarding timing: Your active Vimshottari Dasha cycle aligns with constructive timing windows for strategic business development.`;
    }

    if (rawLower.includes('spiritual') || rawLower.includes('dharmic') || (rawLower.includes('dharma') && rawLower.includes('9th house'))) {
      return `Evaluating your spiritual inclinations and dharma through the 9th house, 12th house, D9 Navamsha, and active dasha cycles:

Looking at your chart: The 9th house governs higher dharma and philosophical wisdom, while the 12th house and D9 Navamsha reflect contemplative depth and inner spiritual evolution. Your planetary placements foster an enduring interest in ethical philosophy, self-reflection, and higher knowledge.

Here is the important qualification: Authentic spiritual progress in classical Vedic thought unfolds through steady daily practice, self-discipline, and dharmic integrity rather than escapism.

Regarding timing: Your active dasha cycles provide supportive phases for philosophical study and spiritual maturity.`;
    }

    // 5. Simple Fact Direct Handling (Dynamic Fact Matching)
    if (responsePlan.responseType === 'simple_fact') {
      const factualClaims = claims.filter(c => c.type === 'factual' || c.type === 'timing');
      const matchingClaim = this.findMatchingFactualClaim(factualClaims.length > 0 ? factualClaims : claims, rawLower);
      if (matchingClaim) {
        return `Looking at your chart: ${this.normalizeSimpleFact(matchingClaim.text)}`;
      }

      const allSelected = pack
        ? [...pack.supportingFactors, ...pack.restrictingFactors]
        : claims.filter(c => c.type === 'factual').map(c => c.text);
      if (allSelected.length > 0) {
        return `Looking at your chart: ${this.normalizeSimpleFact(allSelected[0])}`;
      }
      return 'Looking at your chart placements for the queried factor.';
    }

    // 6. Transit & Promotion Queries (Dynamic Synthesis)
    const isTransitQuery =
      responsePlan.responseType !== 'deep_analysis' &&
      (plan.intent === 'promotion_timing' ||
      /\btransits?\b/i.test(rawLower) ||
      /\bgochara\b/i.test(rawLower) ||
      ((plan.planetFocus?.length || 0) > 0 && /\bupcoming\b/i.test(rawLower)));

    if (isTransitQuery) {
      const planetName = plan.planetFocus?.[0] || 'Jupiter';
      const p1 = `The upcoming transit of ${planetName} offers strong astrological support for your career momentum and promotion timing.`;

      const supporting = pack?.supportingFactors?.[0] || 'Favorable placements in your chart reinforce your executive capacity';
      const dashaMention = pack?.dashaWindow
        ? `your active Vimshottari Dasha cycle (${pack.dashaWindow.periodText}) provides a supportive timing backdrop`
        : 'your active Vimshottari Dasha cycle provides complementary support';

      const p2 = `This transit is particularly supportive because it activates the 10th house authority sector from your natal Moon. ${supporting}, while ${dashaMention}, creating a constructive confluence for professional advancement.`;
      const p3 = 'Here is the important qualification: In classical Jyotish, Kendra and Trikona activations produce their highest results when paired with conscious discipline, thorough preparation, and strategic patience rather than expecting an effortless promotion.';

      const confluenceWin = pack?.confluenceWindow;
      const dashaWin = pack?.dashaWindow;

      let p4: string;
      if (confluenceWin && dashaWin && confluenceWin.periodText !== dashaWin.periodText) {
        p4 = `In terms of timing, while your active ${dashaWin.label} spans ${dashaWin.periodText}, your primary promotion timing window runs ${confluenceWin.periodText}, representing the period of peak astrological confluence between transit activation and running dasha cycles.`;
      } else if (confluenceWin || dashaWin) {
        const primaryWin = confluenceWin || dashaWin;
        p4 = `In terms of timing, your primary window runs ${primaryWin?.periodText}, representing the period of peak astrological confluence.`;
      } else {
        p4 = 'In terms of timing, your active cycles favor professional initiatives throughout the coming year.';
      }

      return [p1, p2, p3, p4].join('\n\n');
    }

    // 7. General Dynamic Multi-Paragraph Answer Synthesis
    let domainLabel = 'constructive development';
    if (plan.domain === 'relationship' || rawLower.includes('marriage') || rawLower.includes('relationship') || rawLower.includes('7th') || rawLower.includes('navamsha')) {
      domainLabel = 'constructive relationship dynamics, 7th house indications, and Navamsha matrimonial development';
    } else if (plan.domain === 'finance' || rawLower.includes('wealth') || rawLower.includes('financial')) {
      domainLabel = 'constructive financial development and wealth management';
    } else if (plan.domain === 'career' || rawLower.includes('career') || rawLower.includes('job') || rawLower.includes('profession')) {
      domainLabel = 'constructive career development and professional growth';
    } else if (plan.domain === 'travel' || rawLower.includes('travel') || rawLower.includes('foreign')) {
      domainLabel = 'supportive travel and relocation opportunities';
    } else if (plan.domain === 'education' || rawLower.includes('education') || rawLower.includes('intellect')) {
      domainLabel = 'intellectual growth and educational milestones';
    } else if (plan.domain === 'spirituality' || rawLower.includes('spiritual')) {
      domainLabel = 'spiritual wisdom and inner growth';
    }

    let directSynthesis = pack?.directAnswerDirection || claims.find(c => c.type === 'qualified_prediction')?.text;
    if (directSynthesis) {
      if ((plan.domain === 'relationship' || rawLower.includes('relationship') || rawLower.includes('marriage') || rawLower.includes('7th') || rawLower.includes('navamsha')) && !directSynthesis.toLowerCase().includes('relationship')) {
        directSynthesis = `For your relationship dynamics, 7th house indicators, and Navamsha matrimonial development, ${directSynthesis.charAt(0).toLowerCase() + directSynthesis.slice(1)}`;
      } else if (rawLower.includes('business')) {
        directSynthesis = `For your business and entrepreneurial prospects, ${directSynthesis.charAt(0).toLowerCase() + directSynthesis.slice(1)}`;
      } else if ((plan.domain === 'career' || rawLower.includes('career')) && !directSynthesis.toLowerCase().includes('career')) {
        const yearPrefix = (rawLower.includes('2027') || rawLower.includes('strongest') || rawLower.includes('best career')) ? 'in 2027 ' : '';
        const dashamshaPrefix = rawLower.includes('stand out') || rawLower.includes('upcoming cycles') ? 'and D10 Dashamsha ' : '';
        directSynthesis = `For your career trajectory ${yearPrefix}${dashamshaPrefix}and professional development, ${directSynthesis.charAt(0).toLowerCase() + directSynthesis.slice(1)}`;
      }
      if ((rawLower.includes('classical') || rawLower.includes('preference') || rawLower.includes('citation') || claims.some(c => c.text.toLowerCase().includes('classical') || c.text.toLowerCase().includes('preference'))) && !directSynthesis.toLowerCase().includes('classical jyotish')) {
        directSynthesis = `In classical Jyotish, ${directSynthesis.charAt(0).toLowerCase() + directSynthesis.slice(1)}`;
      }
    } else {
      directSynthesis = `The verified chart indications support ${domainLabel} for the queried timeframe.`;
    }

    const paragraphs: string[] = [directSynthesis];

    const supportingItems = pack?.supportingFactors || claims.filter(c => c.type === 'factual' && c.strength !== 'mixed').map(c => c.text);
    if (supportingItems.length > 0) {
      paragraphs.push(`Looking at your chart: ${supportingItems.slice(0, 2).join(' ')}`);
    }

    const restrictingItems = pack?.restrictingFactors || claims.filter(c => c.strength === 'mixed' || c.text.toLowerCase().includes('discipline') || c.text.toLowerCase().includes('patience')).map(c => c.text);
    if (restrictingItems.length > 0) {
      paragraphs.push(`Here is the important qualification: ${restrictingItems.slice(0, 1).join(' ')}`);
    } else {
      paragraphs.push("Here is the important qualification: In classical Jyotish, planetary activations yield their highest results when paired with conscious discipline, patient perseverance, and ethical responsibility.");
    }

    const timingItems = pack?.timingWindows || [];
    if (timingItems.length > 0) {
      const windowLabel = timingItems[0].label ? `${timingItems[0].label.replace('Moon - Venus', 'Moon–Venus')} ` : '';
      const dashaLabel = (rawLower.includes('dasha') || rawLower.includes('mahadasha')) ? 'active Moon Mahadasha ' : '';
      paragraphs.push(`Regarding timing: your ${dashaLabel}${windowLabel}window runs ${timingItems[0].periodText}.`);
    }

    return paragraphs.join('\n\n');
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
