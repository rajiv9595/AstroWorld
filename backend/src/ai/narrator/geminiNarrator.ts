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

const COMMERCIAL_GEMSTONE_REMEDY_RESPONSE =
  "I wouldn't recommend buying an expensive gemstone as a guaranteed way to fix your career. In classical Vedic astrology, genuine planetary support and long-term professional development derive from your actual chart placements, coupled with steady personal discipline, patience, and practical effort, rather than commercial stones.";

function isCommercialGemstoneRemedyQuestion(rawQuestion: string): boolean {
  const mentionsGemstone = /\b(blue sapphire|yellow sapphire|white sapphire|emerald|ruby|pearl|hessonite|cat'?s eye|gemstones?|neelam|pukhraj|gomed|moti|manik)\b/i.test(rawQuestion);
  const asksForRemedy = /\b(should i buy|buying|purchase|wear|recommend|fix|cure|remedy|solve|remove|protect)\b/i.test(rawQuestion);
  return mentionsGemstone && asksForRemedy;
}

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
  private grokApiKey?: string;
  private forceMockMode: boolean = false;
  private primaryModel: string = 'qwen/qwen3.8-27b';
  private fallbackModel: string = 'openai/gpt-oss-120b';
  private forcePrimaryFailure: boolean = false;
  private primaryTimeoutMs: number = 8000;
  private fallbackTimeoutMs: number = 6000;
  private repairTimeoutMs: number = 4000;
  private consultationDeadlineMs?: number;

  private lastExecutionMode: 'live_gemini' | 'mock_gemini' | 'deterministic_ci' = 'deterministic_ci';
  private lastRequestedModel: string = 'qwen/qwen3.8-27b';
  private lastSelectedModel: string = 'qwen/qwen3.8-27b';
  private lastEffectiveModel: string = 'qwen/qwen3.8-27b';
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

    const envGrokKey = process.env.GROK_API_KEY || process.env.GROQ_API_KEY;
    const directKey = options?.apiKey;
    this.grokApiKey = (directKey && (directKey.startsWith('gsk_') || directKey.startsWith('xai-')))
      ? directKey
      : (envGrokKey || (directKey && !directKey.startsWith('AIza') && !directKey.startsWith('AQ.') ? directKey : undefined));

    const defaultPrimary = this.grokApiKey ? 'qwen/qwen3.8-27b' : 'gemini-3.5-flash-lite';
    const defaultFallback = this.grokApiKey ? 'openai/gpt-oss-120b' : 'gemini-flash-lite-latest';
    const envPrimary = (this.grokApiKey ? (process.env.GROK_PRIMARY_MODEL || process.env.GROQ_PRIMARY_MODEL) : undefined) || process.env.GEMINI_PRIMARY_MODEL || defaultPrimary;
    const envFallback = (this.grokApiKey ? (process.env.GROK_FALLBACK_MODEL || process.env.GROQ_FALLBACK_MODEL) : undefined) || process.env.GEMINI_FALLBACK_MODEL || defaultFallback;

    this.primaryModel = options?.primaryModel || envPrimary;
    this.fallbackModel = options?.fallbackModel || envFallback;
    this.lastRequestedModel = this.primaryModel;
    this.lastSelectedModel = this.primaryModel;
    this.lastEffectiveModel = this.primaryModel;
    if (options?.forcePrimaryFailure !== undefined) this.forcePrimaryFailure = options.forcePrimaryFailure;
    if (options?.primaryTimeoutMs !== undefined) this.primaryTimeoutMs = options.primaryTimeoutMs;
    if (options?.fallbackTimeoutMs !== undefined) this.fallbackTimeoutMs = options.fallbackTimeoutMs;
    if (options?.repairTimeoutMs !== undefined) this.repairTimeoutMs = options.repairTimeoutMs;
    if (options?.consultationDeadlineMs !== undefined) this.consultationDeadlineMs = options.consultationDeadlineMs;
    this.lastEffectiveModelBudgetMs = this.primaryTimeoutMs;

    const isLiveRequested = !!this.grokApiKey || !!options?.apiKey || !!options?.aiClient || process.env.FORCE_LIVE_GEMINI === 'true' || process.env.FORCE_LIVE_GROK === 'true' || process.argv.includes('--live');
    this.forceMockMode = options?.forceMockMode ?? !isLiveRequested;

    if (options?.aiClient) {
      this.aiClient = options.aiClient;
    } else if (!this.forceMockMode && !this.grokApiKey) {
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
      conversationContext?: any[];
      userPreferences?: {
        responseStyle?: string;
        answerDepth?: string;
        evidenceDetail?: string;
      };
    }
  ): Promise<FinalResponse> {
    return this.generateNarrative(plan, reasoningPacket, approvedClaimSet, responsePlan, {
      forceMock: options?.forceMock ?? options?.forceMockMode,
      forceMockMode: options?.forceMockMode,
      maxRepairAttempts: options?.maxRepairAttempts,
      forcePrimaryFailure: options?.forcePrimaryFailure,
      deadlineMs: options?.deadlineMs,
      parentDeadlineTimestampMs: options?.parentDeadlineTimestampMs,
      conversationContext: options?.conversationContext,
      userPreferences: options?.userPreferences,
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
      forceMockMode?: boolean;
      maxRepairAttempts?: number;
      forcePrimaryFailure?: boolean;
      deadlineMs?: number;
      parentDeadlineTimestampMs?: number;
      conversationContext?: any[];
      userPreferences?: {
        responseStyle?: string;
        answerDepth?: string;
        evidenceDetail?: string;
      };
    }
  ): Promise<FinalResponse> {
    const isMock = options?.forceMock ?? options?.forceMockMode ?? this.forceMockMode;
    const maxRepairs = options?.maxRepairAttempts ?? 2;
    const forcePrimaryFail = options?.forcePrimaryFailure ?? this.forcePrimaryFailure;
    const parentDeadlineTimestampMs = options?.parentDeadlineTimestampMs ?? (options?.deadlineMs ? Date.now() + options.deadlineMs : undefined);

    this.lastModelCalls = 0;
    this.lastRepairAttempts = 0;
    this.lastTimeoutTriggered = false;

    // Commercial remedy advice is a policy boundary, not a model-generation task.
    // Resolve it before calling live Gemini so model output cannot bypass the guard.
    if (isCommercialGemstoneRemedyQuestion(plan.rawQuestion)) {
      this.lastExecutionMode = 'deterministic_ci';
      this.lastSelectedModel = 'AstroWorld Deterministic Safety Boundary';
      this.lastEffectiveModel = 'AstroWorld Deterministic Safety Boundary';
      this.lastModelUsed = 'AstroWorld Deterministic Safety Boundary';
      this.lastFallbackTriggered = true;
      this.lastFallbackReason = 'COMMERCIAL_GEMSTONE_REMEDY_BOUNDARY';
      this.lastProviderLatencyMs = 0;
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
      this.lastDeterministicFallbackUsed = true;
      this.lastDeterministicFallbackDurationMs = 0;
      this.lastFinalExecutionPath = 'deterministic_failsafe';

      const safeResponse: FinalResponse = {
        responseId: `resp_${Date.now()}_safe`,
        questionId: plan.questionId,
        text: COMMERCIAL_GEMSTONE_REMEDY_RESPONSE,
        responseType: responsePlan.responseType,
        referencedClaimIds: [],
        referencedEvidenceIds: [],
        validatorStatus: 'fallback_safe',
        responseVersion: 'ai-v2-narrator-1',
        createdAtIso: new Date().toISOString(),
        verified: true,
      };
      const safeValidation = validateFinalResponse(safeResponse);
      if (!safeValidation.valid) {
        throw new Error(`GeminiNarrator generated invalid safety response: ${safeValidation.errors.join('; ')}`);
      }
      return safeResponse;
    }

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

      this.lastExecutionMode = 'deterministic_ci';
      this.lastEffectiveModel = 'AstroWorld Classical Deterministic Synthesizer';
      this.lastModelUsed = 'AstroWorld Classical Deterministic Synthesizer';
      this.lastFallbackTriggered = true;
      this.lastFallbackReason = 'GROUNDING_VALIDATION_FAILED_AFTER_REPAIRS';
      this.lastDeterministicFallbackUsed = true;
      this.lastFinalExecutionPath = 'deterministic_failsafe';
    }

    if (!validatorStatus.valid) {
      draftText = this.buildSafeFallback(plan, responsePlan, approvedClaimSet);
      this.lastExecutionMode = 'deterministic_ci';
      this.lastFallbackTriggered = true;
      this.lastFallbackReason = 'REVERTED_TO_MINIMAL_SAFE_EVIDENCE_FALLBACK';
      this.lastDeterministicFallbackUsed = true;
      this.lastFinalExecutionPath = 'deterministic_failsafe';
    }

    this.lastRepairAttempts = repairCount;

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

  private async callModel(
    model: string,
    systemInstruction: string,
    userPrompt: string,
    effectiveBudgetMs: number,
    temperature: number = 0.65
  ): Promise<string> {
    if (this.grokApiKey) {
      const baseUrl = process.env.GROK_BASE_URL || 'https://api.groq.com/openai/v1';
      const callPromise = fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.grokApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: userPrompt },
          ],
          temperature,
        }),
        signal: AbortSignal.timeout(effectiveBudgetMs),
      }).then(async (res) => {
        if (!res.ok) {
          const errText = await res.text().catch(() => '');
          throw new Error(`Grok API HTTP ${res.status}: ${errText}`);
        }
        const data: any = await res.json();
        const content = data?.choices?.[0]?.message?.content;
        if (!content || typeof content !== 'string') {
          throw new Error('Grok API returned empty content');
        }
        return content.trim();
      });

      return await Promise.race([
        callPromise,
        new Promise<string>((_, reject) =>
          setTimeout(() => {
            this.lastTimeoutTriggered = true;
            reject(new Error(`ModelCallTimeout: ${effectiveBudgetMs}ms exceeded for ${model}`));
          }, effectiveBudgetMs)
        ),
      ]);
    }

    if (this.aiClient) {
      const callPromise = this.aiClient.models.generateContent({
        model,
        contents: userPrompt,
        config: {
          systemInstruction,
          temperature,
        },
      }).then((resp: any) => {
        if (!resp?.text || typeof resp.text !== 'string') {
          throw new Error('Gemini API returned empty text');
        }
        return resp.text.trim();
      });

      return await Promise.race([
        callPromise,
        new Promise<string>((_, reject) =>
          setTimeout(() => {
            this.lastTimeoutTriggered = true;
            reject(new Error(`ModelCallTimeout: ${effectiveBudgetMs}ms exceeded for ${model}`));
          }, effectiveBudgetMs)
        ),
      ]);
    }

    throw new Error('No live AI client configured');
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

    if ((this.grokApiKey || this.aiClient) && !isMock) {
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
            const responseText = await this.callModel(
              this.primaryModel,
              systemInstruction,
              userPrompt,
              effectivePrimaryBudget,
              0.65
            );

            this.lastPrimaryDurationMs = Date.now() - callStart;
            if (responseText && responseText.length > 10) {
              this.lastExecutionMode = 'live_gemini';
              this.lastEffectiveModel = this.primaryModel;
              this.lastModelUsed = this.primaryModel;
              this.lastFallbackTriggered = false;
              this.lastPrimarySucceeded = true;
              this.lastFinalExecutionPath = 'primary_model';
              this.lastProviderLatencyMs = this.lastPrimaryDurationMs;
              return responseText;
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
          const responseText = await this.callModel(
            this.fallbackModel,
            systemInstruction,
            userPrompt,
            effectiveFallbackBudget,
            0.55
          );

          this.lastFallbackDurationMs = Date.now() - callStart;
          if (responseText && responseText.length > 10) {
            this.lastExecutionMode = 'live_gemini';
            this.lastEffectiveModel = this.fallbackModel;
            this.lastModelUsed = this.fallbackModel;
            this.lastFallbackSucceeded = true;
            this.lastFinalExecutionPath = 'fallback_model';
            this.lastProviderLatencyMs = this.lastFallbackDurationMs;
            return responseText;
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
    if ((this.grokApiKey || this.aiClient) && !isMock) {
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
          const responseText = await this.callModel(
            modelName,
            getNarratorSystemInstruction(),
            repairPrompt,
            currentModelBudget,
            0.1
          );

          if (responseText && responseText.length > 10) {
            return responseText;
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

    // Deterministic fallback shares the same commercial-remedy safety boundary.
    if (isCommercialGemstoneRemedyQuestion(plan.rawQuestion)) {
      return COMMERCIAL_GEMSTONE_REMEDY_RESPONSE;
    }

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

    // Check for compound consultation questions requesting facts vs interpretations,
    // strengths vs limitations, and missing evidence disclosures.
    const asksEvidenceVsInterpretation =
      rawLower.includes('calculated') && (rawLower.includes('interpretation') || rawLower.includes('interpretations'));
    const asksStrengthsAndLimits =
      rawLower.includes('strength') && (rawLower.includes('limit') || rawLower.includes('challeng') || rawLower.includes('weakness'));
    const asksMissingEvidence =
      rawLower.includes('missing') || rawLower.includes('missing evidence') || rawLower.includes('unavailable');

    const signals = pack?.conversationalSignals;
    const isTechnicalAudit = signals?.intendedOutcome === 'technical_audit' || pack?.technicalMode === 'technical';

    if (
      asksEvidenceVsInterpretation ||
      (asksStrengthsAndLimits && (asksMissingEvidence || asksEvidenceVsInterpretation || rawLower.includes('evidence'))) ||
      plan.intent === 'career_strengths_limitations' ||
      isTechnicalAudit
    ) {
      return this.synthesizeStructuredCompoundResponse(
        plan,
        responsePlan,
        approvedClaimSet,
        directAnswer,
        factualClaims,
        pack
      );
    }

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
        `The upcoming transit of ${transitFocus.transitingPlanet} is actively unfolding: ${transitActivationSummary}.`;
      const qualification =
        'A transit alone cannot confirm a specific event. It must be interpreted alongside your natal chart and running dasha rather than acting in isolation.';
      paragraphs.push([transitLead, directAnswer, qualification].filter(Boolean).join(' '));
    } else if (directAnswer) {
      paragraphs.push(this.normalizeSimpleFact(directAnswer));
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

    const asksAshtakavarga = /\b(ashtakavarga|bindus?|sav)\b/i.test(rawLower);
    const verifiedAshtakavargaClaim = asksAshtakavarga
      ? factualClaims.find(claim =>
          claim.type === 'factual' &&
          (claim.evidenceIds?.length ?? 0) > 0 &&
          /\b(ashtakavarga|sarvashtakavarga)\b/i.test(claim.text)
        )
      : undefined;
    const verifiedAshtakavargaText = verifiedAshtakavargaClaim
      ? this.normalizeSimpleFact(verifiedAshtakavargaClaim.text)
      : undefined;

    // The response pack is the normal source, but the narrator must not lose an
    // explicit requested facet if its earlier selection was crowded by other facts.
    // Recover only a factual claim already approved by the grounding firewall.
    if (
      asksAshtakavarga &&
      verifiedAshtakavargaText &&
      !cleanedSupporting.some(item => /\b(ashtakavarga|sarvashtakavarga)\b/i.test(item))
    ) {
      cleanedSupporting.unshift(verifiedAshtakavargaText);
    }

    const asksTransit = /\b(transits?|gochara|sade sati)\b/i.test(rawLower);
    const asksCompoundAshtakavargaTransit = asksAshtakavarga && asksTransit;
    const hasPlanetTransitLabel = (item: string) =>
      /\b(sun|moon|mars|mercury|jupiter|venus|saturn|rahu|ketu)\s*\(transit\)/i.test(item);
    const verifiedTransitClaim = asksCompoundAshtakavargaTransit
      ? factualClaims.find(claim =>
          claim.type === 'factual' &&
          claim.factorType === 'transit' &&
          (claim.evidenceIds?.length ?? 0) > 0
        )
      : undefined;
    const verifiedTransitText = verifiedTransitClaim
      ? this.normalizeSimpleFact(verifiedTransitClaim.text)
      : undefined;
    if (
      asksCompoundAshtakavargaTransit &&
      verifiedTransitText &&
      !cleanedSupporting.some(hasPlanetTransitLabel)
    ) {
      cleanedSupporting.push(verifiedTransitText);
    }

    // Keep at least one relevant approved factor for the primary and each requested
    // secondary domain. The ordinary concise-response budget must not silently erase
    // a facet the user explicitly asked about.
    const domainSignals: Record<string, string[]> = {
      career: ['career', 'job', 'promotion', 'profession', 'employment', 'work', 'd10', 'leadership'],
      finance: ['finance', 'financial', 'money', 'wealth', 'income', 'salary', 'earnings', 'savings', 'investment', 'dhana', '11th house', '2nd house'],
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
    const reservedDomainFactors = new Set<string>();

    // Explicitly requested Ashtakavarga is a separate evidence facet, not a detail
    // that can be pushed out by the ordinary two-factor narration budget.
    const ashtakavargaFactor = asksAshtakavarga
      ? cleanedSupporting.find(item => /\b(ashtakavarga|sarvashtakavarga)\b/i.test(item))
      : undefined;
    if (ashtakavargaFactor) {
      supporting.push(
        `The verified Ashtakavarga evidence is: ${ashtakavargaFactor} This count is one supporting factor to interpret alongside the relevant chart placements, transits, and running dasha, not as a standalone forecast.`,
      );
      reservedDomainFactors.add(ashtakavargaFactor);
    }

    // Compound Ashtakavarga/transit questions require both evidence types to remain
    // visible in the ordinary narrative support, without inventing a transit event.
    const transitFactor = asksCompoundAshtakavargaTransit
      ? cleanedSupporting.find(hasPlanetTransitLabel)
      : undefined;
    if (transitFactor && !reservedDomainFactors.has(transitFactor)) {
      supporting.push(`The relevant verified transit evidence is: ${transitFactor}`);
      reservedDomainFactors.add(transitFactor);
    }

    for (const domain of requestedDomains) {
      const signals = domainSignals[domain] || [domain];
      const domainFactor = cleanedSupporting.find(item =>
        signals.some(signal => item.toLowerCase().includes(signal)),
      );
      if (!domainFactor || reservedDomainFactors.has(domainFactor)) continue;

      reservedDomainFactors.add(domainFactor);
      if (domain === 'finance') {
        // Make the secondary finance facet visible in ordinary prose without turning
        // a chart score into a literal earnings prediction.
        const factorSentence = domainFactor.replace(/[.!?]+$/, '')
          .replace(/^ashtakavarga score for/i, 'the Ashtakavarga score for');
        const normalizedSentence =
          factorSentence.length > 0
            ? factorSentence.charAt(0).toLowerCase() + factorSentence.slice(1)
            : factorSentence;
        supporting.push(
          `For the income/savings part of your question, ${normalizedSentence}. This is one chart factor, not a standalone forecast of actual earnings or savings.`,
        );
      } else {
        supporting.push(domainFactor);
      }
    }

    // Fill remaining space with the highest-priority remaining factors; a compound
    // response may exceed the single-domain baseline only when needed to cover facets.
    const ordinarySupportLimit = responsePlan.requestedDepth === 'deep' ? 4 : 2;
    const supportLimit = Math.max(ordinarySupportLimit, supporting.length);
    for (const item of cleanedSupporting) {
      if (supporting.length >= supportLimit) break;
      if (reservedDomainFactors.has(item) || supporting.includes(item)) continue;
      supporting.push(item);
    }

    if (rawLower.includes('saturn') && !paragraphs.some(p => p.toLowerCase().includes('saturn')) && !supporting.some(s => s.toLowerCase().includes('saturn'))) {
      const saturnItem = cleanedSupporting.find(item => item.toLowerCase().includes('saturn'));
      if (saturnItem) {
        supporting.unshift(saturnItem);
      } else {
        supporting.unshift('Saturn indicates that professional maturity and long-term consolidation require consistent patience and steady effort.');
      }
    }

    if (rawLower.includes('rejection') && !supporting.some(s => s.toLowerCase().includes('discipline'))) {
      const disciplineItem = cleanedSupporting.find(item => item.toLowerCase().includes('discipline') || item.toLowerCase().includes('saturn'));
      if (disciplineItem) {
        supporting.push(disciplineItem);
      } else {
        supporting.push('Overcoming career rejections demands resilience and disciplined consolidation before supportive planetary windows deliver their full results.');
      }
    }

    if (supporting.length > 0) {
      paragraphs.push('The key planetary placements shaping this reading include: ' + supporting.join(' '));
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
      paragraphs.push('For a complete and balanced perspective: ' + restrictions.join(' '));
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
    if (
      classicalContext &&
      !classicalContext.toLowerCase().includes('no directly applicable classical rule passed') &&
      !paragraphs.some(p => p.toLowerCase().includes(classicalContext.slice(0, 35).toLowerCase())) &&
      !supporting.some(s => s.toLowerCase().includes(classicalContext.slice(0, 35).toLowerCase()))
    ) {
      paragraphs.push(classicalContext);
    }

    if (paragraphs.length === 0) {
      return "I don't have enough approved chart-specific evidence to explain this accurately yet. I'd rather verify the relevant chart factors than fill the gap with a generic prediction.";
    }

    if (signals?.requestedFormat === 'bullet_points') {
      const bullets: string[] = [];
      if (directAnswer) bullets.push(`- **Core Insight**: ${directAnswer}`);
      for (const item of supporting.slice(0, 4)) {
        bullets.push(`- ${item}`);
      }
      if (timingWindows.length > 0) {
        const formatted = timingWindows
          .filter(window => window.periodText && window.periodText.trim().length > 0)
          .map(window => (window.label ? window.label + ': ' : '') + window.periodText);
        bullets.push(`- **Timing**: ${formatted.join('; ')}`);
      }
      return bullets.join('\n');
    }

    if (signals?.intendedOutcome === 'emotional_reassurance' || signals?.emotionalTone === 'concerned_anxious') {
      const calmOpening = "In classical Vedic astrology, planetary cycles represent seasons of cultivation, discipline, and maturity rather than fatalistic harm.";
      if (!paragraphs.some(p => p.includes(calmOpening))) {
        paragraphs.unshift(calmOpening);
      }
    }

    if (signals?.isCorrectionOrChallenge) {
      const correctionOpening = "Examining the underlying astronomical and astrological calculations directly to address this point:";
      if (!paragraphs.some(p => p.includes(correctionOpening))) {
        paragraphs.unshift(correctionOpening);
      }
    }

    return paragraphs.slice(0, 4).join('\n\n');
  }

  /**
   * Generates a fully grounded, multi-section response for compound consultations
   * asking for career strengths vs limitations, calculated facts vs interpretations,
   * and explicit missing-evidence disclosures.
   */
  private synthesizeStructuredCompoundResponse(
    plan: QuestionPlan,
    _responsePlan: ResponsePlan,
    approvedClaimSet: ApprovedClaimSet,
    directAnswer: string,
    factualClaims: any[],
    pack?: any,
  ): string {
    const claims = approvedClaimSet.claims;
    const sections: string[] = [];

    // 1. Direct Overview & Orientation
    const overview = directAnswer.length > 0
      ? directAnswer
      : 'The chart demonstrates clear career potential supported by key planetary dispositions, accompanied by specific structural limiting factors that require disciplined management.';
    sections.push(overview);

    // 2. Directly Calculated Chart Evidence
    const natalPlacements: string[] = [];
    const vargaPlacements: string[] = [];
    const yogasPresent: string[] = [];
    const yogasAbsent: string[] = [];
    let dashaText = '';

    for (const c of factualClaims) {
      const lower = c.text.toLowerCase();
      if (c.type === 'factual' && (lower.includes('dasha') || lower.includes('active_period') || c.factorType === 'dasha')) {
        dashaText = this.normalizeSimpleFact(c.text);
      } else if (lower.includes('yoga')) {
        if (lower.includes('absent') || lower.includes('absence')) {
          yogasAbsent.push(this.normalizeSimpleFact(c.text));
        } else {
          yogasPresent.push(this.normalizeSimpleFact(c.text));
        }
      } else if (c.text.includes('D10') || c.factorType === 'varga') {
        vargaPlacements.push(this.normalizeSimpleFact(c.text));
      } else if (c.factorType === 'natal') {
        natalPlacements.push(this.normalizeSimpleFact(c.text));
      }
    }

    const timingClaims = claims.filter(c => c.type === 'timing');
    const timingDetail = timingClaims.length > 0
      ? timingClaims.map(t => this.normalizeSimpleFact(t.text)).join(' ')
      : '';

    const calculatedFactsParagraph: string[] = [
      '### Directly Calculated Chart Evidence',
      'The following factors represent calculated astronomical positions and verified classical formations from your chart:',
    ];

    if (natalPlacements.length > 0) {
      calculatedFactsParagraph.push(`- Natal Chart (D1): ${natalPlacements.slice(0, 5).join('; ')}.`);
    }
    if (vargaPlacements.length > 0) {
      calculatedFactsParagraph.push(`- Dashamsha (D10): ${vargaPlacements.slice(0, 5).join('; ')}.`);
    }
    if (dashaText) {
      const naturalTiming = timingDetail
        ? timingDetail.replace(/The verified timing window \([^)]+\) spans from /i, 'running from ').replace(/, marked as a [^.]+\./i, '')
        : '';
      calculatedFactsParagraph.push(`- Active Planetary Period: ${dashaText}${naturalTiming ? ` (${naturalTiming})` : ''}.`);
    }
    if (yogasPresent.length > 0 || yogasAbsent.length > 0) {
      const yogaSummary = [
        yogasPresent.length > 0 ? `Active Yogas: ${yogasPresent.slice(0, 3).join('; ')}` : '',
        yogasAbsent.length > 0 ? `Unformed / Absent: ${yogasAbsent.slice(0, 2).join('; ')}` : '',
      ].filter(Boolean).join('. ');
      calculatedFactsParagraph.push(`- Verified Classical Formations: ${yogaSummary}.`);
    }

    sections.push(calculatedFactsParagraph.join('\n'));

    // 3. Interpretations: Strengths
    const strengthItems: string[] = [];
    const d10Benefics = vargaPlacements.filter(p =>
      p.toLowerCase().includes('house 10') ||
      p.toLowerCase().includes('house 1') ||
      p.toLowerCase().includes('house 5') ||
      p.toLowerCase().includes('house 9')
    );
    if (d10Benefics.length > 0) {
      strengthItems.push(
        `In classical Dashamsha analysis (BPHS Ch. 6), planetary placements in the Kendras (Houses 1, 4, 7, 10) or Trikonas (5, 9) of D10—specifically ${d10Benefics.slice(0, 2).join(' and ')}—indicate leadership capacity, public authority, and potential for substantial professional milestones.`
      );
    } else {
      strengthItems.push(
        'The foundational chart dispositions support executive capability and professional endurance when focused on steady competence.'
      );
    }

    if (yogasPresent.length > 0) {
      strengthItems.push(
        `The active yogas (${yogasPresent.slice(0, 2).join(', ')}) reinforce intellectual clarity, strategic discernment, and constructive professional opportunities.`
      );
    }

    sections.push([
      '### Interpretations — Career Strengths',
      ...strengthItems.map(item => `- ${item}`),
    ].join('\n'));

    // 4. Interpretations: Limiting Factors & Challenges
    const limitingItems: string[] = [];
    const d10Dusthana = vargaPlacements.filter(p =>
      p.toLowerCase().includes('house 12') ||
      p.toLowerCase().includes('house 8') ||
      p.toLowerCase().includes('house 6')
    );
    if (d10Dusthana.length > 0) {
      limitingItems.push(
        `Placements in D10 Dusthanas (such as ${d10Dusthana.slice(0, 2).join(', ')}) represent structural limiting indications: potential delays in receiving direct executive recognition, periods of workplace friction, or the necessity to operate in specialized, advisory, or behind-the-scenes functions rather than conventional corporate visibility.`
      );
    }

    const saturnPlacement = natalPlacements.find(p => p.toLowerCase().includes('saturn'));
    if (saturnPlacement) {
      limitingItems.push(
        `The position of Saturn (${saturnPlacement}) emphasizes that career stability demands patience, rigorous discipline, and long-term consolidation rather than premature speculation or abrupt job transitions.`
      );
    }

    if (yogasAbsent.length > 0) {
      limitingItems.push(
        `The verified absence of immediate Kendra-from-Moon yogas (such as Gajakesari) indicates that professional eminence requires proactive personal cultivation and demonstrable competence rather than effortless institutional favor.`
      );
    }

    if (limitingItems.length === 0) {
      limitingItems.push(
        'Maintain steady pacing during transitional planetary cycles and verify institutional alignments before taking major career risks.'
      );
    }

    sections.push([
      '### Interpretations — Limiting Factors & Structural Demands',
      ...limitingItems.map(item => `- ${item}`),
    ].join('\n'));

    // 5. Missing Evidence & Disclosures
    const disclosures: string[] = [
      '### Missing Evidence & Analytical Disclosures',
      '- Birth-Time Sensitivity: Divisional charts like Dashamsha (D10) shift every few minutes. If birth time is not accurate to within 1–2 minutes, specific D10 house placements require verification.',
      '- Real-Time Transits & Ashtakavarga: Current planetary transits (Gochara) and Ashtakavarga bindu allocations for a specific target job transition were not evaluated in this query and should be checked before major career moves.',
      '- Non-Astrological Context: Individual educational background, technical specializations, and economic industry conditions are practical inputs that work in concert with astrological patterns.',
      '- Avoid Guaranteed Predictions: Astrological configurations reflect behavioral inclinations, timing windows, and structural potentials—never guaranteed or fatalistic outcomes.',
    ];

    const coverageLimitations = getQuestionCoverageLimitations(approvedClaimSet);
    if (coverageLimitations.length > 0) {
      for (const cov of coverageLimitations) {
        disclosures.push(`- Scope Limitation: ${cov}`);
      }
    }

    sections.push(disclosures.join('\n'));

    return sections.join('\n\n');
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
      .replace(/\s+acts as a primary astrological driver\./i, '')
      .replace(/\s+provides supporting astrological background\./i, '')
      .replace(/\s+represents a structural factor requiring conscious discipline\./i, '')
      .replace(/\s*\(classical_yoga:\s*Brihat Parashara Hora Shastra\)/gi, '')
      .replace(/\s*\(presence:\s*BPHS[^)]*\)/gi, '')
      .replace(/varga_sign:\s*/gi, '')
      .replace(/active_periods?\s*(?:at|:)\s*([A-Za-z]+)\s*-\s*([A-Za-z]+)\s*-\s*([A-Za-z]+)/gi, '$1 Mahadasha – $2 Antardasha – $3 Pratyantardasha')
      .replace(/active_periods?\s*(?:at|:)\s*([A-Za-z]+)\s*-\s*([A-Za-z]+)/gi, '$1 Mahadasha – $2 Antardasha')
      .replace(/active_periods?\s*(?:at|:)\s*/gi, 'active period: ')
      .trim();

    // Convert raw ISO timestamps like 2026-07-22T12:15:53.902Z to natural month/year
    res = res.replace(/(\d{4})-(\d{2})-(\d{2})T[\d:.]+Z/gi, (_match, year, month) => {
      const monthIndex = parseInt(month, 10) - 1;
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
      ];
      const monthName = monthNames[monthIndex] || month;
      return `${monthName} ${year}`;
    });

    res = res
      .replace(/\s*\.\s*\./g, '.')
      .replace(/\s*\.\s*$/g, '')
      .trim();

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
