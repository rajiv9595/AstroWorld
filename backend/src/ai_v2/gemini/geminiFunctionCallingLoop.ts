/**
 * ASTROWORLD AI V2 — Gemini Function Calling Loop & Integration Gate
 * Orchestrates multi-round tool-calling conversations between Gemini and AstrologyToolRegistry.
 * Enforces strict security boundaries:
 * - Engine is sole authoritative source of truth.
 * - Gemini NEVER calculates astrology facts or writes final prose in this phase.
 * - Unsupported functions and invalid arguments are immediately rejected.
 * - Multi-round limits prevent infinite loops.
 * - Mock mode supports offline deterministic CI testability.
 */

import { GoogleGenAI } from '@google/genai';
import { ASTROLOGY_TOOL_DEFINITIONS } from '../schemas/toolSchemas.ts';
import { AstrologyToolRegistry } from '../tools/toolRegistry.ts';
import { BirthProfileInput, validateBirthProfile } from '../schemas/birthProfile.ts';
import { EvidencePacket, FactItem, DerivedFactItem, ToolExecutionRecord, validateEvidencePacket } from '../schemas/evidencePacket.ts';
import { QuestionPlan } from '../schemas/questionPlan.ts';
import { QuestionPlanner } from '../planner/questionPlanner.ts';

export interface GeminiLoopConfig {
  apiKey?: string;
  modelName?: string;
  maxRounds?: number;
  maxToolCallsTotal?: number;
  timeoutMs?: number;
  mockMode?: boolean;
}

export interface ToolCallTraceRecord {
  round: number;
  toolName: string;
  arguments: Record<string, any>;
  executionDurationMs: number;
  success: boolean;
  verified: boolean;
  error?: string;
}

export interface GeminiGateExecutionResult {
  success: boolean;
  evidencePacket: EvidencePacket;
  trace: {
    requestId: string;
    model: string;
    totalRounds: number;
    totalToolCalls: number;
    toolCallTrace: ToolCallTraceRecord[];
    totalDurationMs: number;
    terminationReason: 'evidence_complete' | 'max_rounds_reached' | 'max_tools_reached' | 'clarification_required' | 'error';
  };
  warnings: string[];
}

export class GeminiFunctionCallingLoop {
  private ai: GoogleGenAI | null = null;
  private modelName: string;
  private maxRounds: number;
  private maxToolCallsTotal: number;
  private timeoutMs: number;
  private mockMode: boolean;
  private questionPlanner: QuestionPlanner;

  constructor(config?: GeminiLoopConfig) {
    const apiKey = config?.apiKey || process.env.GEMINI_API_KEY;
    this.modelName = config?.modelName || 'gemini-3.8-flash';
    this.maxRounds = config?.maxRounds ?? 4;
    this.maxToolCallsTotal = config?.maxToolCallsTotal ?? 10;
    this.timeoutMs = config?.timeoutMs ?? 20000;
    this.mockMode = config?.mockMode ?? (!apiKey);
    this.questionPlanner = new QuestionPlanner();

    if (apiKey && !config?.mockMode) {
      this.ai = new GoogleGenAI({ apiKey });
    }
  }

  /**
   * Translates the canonical ASTROLOGY_TOOL_DEFINITIONS into Gemini function declarations format.
   */
  public getFunctionDeclarations(): any[] {
    return Object.values(ASTROLOGY_TOOL_DEFINITIONS).map(def => ({
      name: def.name,
      description: def.description,
      parameters: def.parameters,
    }));
  }

  /**
   * Executes a multi-round function calling conversation with Gemini until all necessary evidence is gathered.
   */
  public async execute(
    rawQuestion: string,
    birthProfile: BirthProfileInput,
    followUpContext?: any
  ): Promise<GeminiGateExecutionResult> {
    const startTime = Date.now();
    const requestId = `req_gate_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const toolCallTrace: ToolCallTraceRecord[] = [];
    const toolExecutionRecords: ToolExecutionRecord[] = [];
    const warnings: string[] = [];

    // 1. Input Validation
    const birthValidation = validateBirthProfile(birthProfile);
    if (!birthValidation.valid || !birthValidation.data) {
      throw new Error(`GeminiGate validation error: ${birthValidation.error}`);
    }

    // 2. Question Plan Generation
    const plan: QuestionPlan = await this.questionPlanner.plan(rawQuestion, followUpContext);

    // 3. Ambiguity Check
    if (plan.clarificationRequired) {
      const clarificationPacket = this.buildClarificationPacket(plan, startTime);
      return {
        success: true,
        evidencePacket: clarificationPacket,
        trace: {
          requestId,
          model: this.modelName,
          totalRounds: 0,
          totalToolCalls: 0,
          toolCallTrace: [],
          totalDurationMs: Date.now() - startTime,
          terminationReason: 'clarification_required',
        },
        warnings: ['User question is ambiguous; halted before tool execution.'],
      };
    }

    let currentRound = 0;
    let terminationReason: GeminiGateExecutionResult['trace']['terminationReason'] = 'evidence_complete';

    if (this.mockMode || !this.ai) {
      // Mock execution mode for deterministic CI testing
      await this.runMockFunctionCallingLoop(
        rawQuestion,
        birthValidation.data,
        plan,
        toolCallTrace,
        toolExecutionRecords,
        warnings
      );
    } else {
      // Live Gemini Function Calling Loop via Google GenAI SDK
      terminationReason = await this.runLiveGeminiFunctionCallingLoop(
        rawQuestion,
        birthValidation.data,
        toolCallTrace,
        toolExecutionRecords,
        warnings
      );
    }

    // 4. Extract verified facts exclusively from deterministic tool execution records
    const facts: FactItem[] = [];
    const derivedFacts: DerivedFactItem[] = [];
    const provenanceList: Array<{
      toolName: string;
      sourceEngine: string;
      ruleStandard: string;
      calculatedAtIso: string;
      verified: boolean;
    }> = [];

    for (const record of toolExecutionRecords) {
      if (record.provenance) {
        provenanceList.push({
          toolName: record.toolName,
          ...record.provenance,
        });
      }

      if (record.success && record.data) {
        this.extractFactsFromToolData(record.toolName, record.data, facts, derivedFacts);
      }
    }

    const totalDurationMs = Date.now() - startTime;

    // 5. Assemble Evidence Packet
    const evidencePacket: EvidencePacket = {
      version: 'ai-v2-evidence-1',
      createdAtIso: new Date().toISOString(),
      question: {
        raw: plan.rawQuestion,
        normalized: plan.normalizedQuestion,
        intent: plan.intent,
        domain: plan.domain,
      },
      plan,
      facts,
      derivedFacts,
      toolResults: toolExecutionRecords,
      provenance: provenanceList,
      warnings,
      missingEvidence: [],
      executionMetrics: {
        totalDurationMs,
        toolsExecutedCount: toolExecutionRecords.length,
        parallelBatchesCount: toolCallTrace.length,
      },
      verified: toolExecutionRecords.length > 0 && toolExecutionRecords.every(r => r.success && r.provenance?.verified),
    };

    const packetValidation = validateEvidencePacket(evidencePacket);
    if (!packetValidation.valid) {
      throw new Error(`GeminiGate produced invalid EvidencePacket: ${packetValidation.errors.join('; ')}`);
    }

    return {
      success: true,
      evidencePacket,
      trace: {
        requestId,
        model: this.modelName,
        totalRounds: Math.max(1, toolCallTrace.length > 0 ? Math.max(...toolCallTrace.map(t => t.round)) : 1),
        totalToolCalls: toolExecutionRecords.length,
        toolCallTrace,
        totalDurationMs,
        terminationReason,
      },
      warnings,
    };
  }

  /**
   * Executes the live Google GenAI function calling multi-turn loop.
   */
  private async runLiveGeminiFunctionCallingLoop(
    rawQuestion: string,
    birthProfile: BirthProfileInput,
    trace: ToolCallTraceRecord[],
    records: ToolExecutionRecord[],
    warnings: string[]
  ): Promise<GeminiGateExecutionResult['trace']['terminationReason']> {
    if (!this.ai) {
      throw new Error('GoogleGenAI client not initialized.');
    }

    const systemInstruction = `
You are the AstroWorld Question Understanding & Tool Invocation Agent.
Your responsibility is to analyze the user's astrological inquiry and request the exact deterministic tools needed from the AstroWorld Astrology Engine.

CRITICAL PROTOCOL RULES:
1. You DO NOT calculate or invent planetary positions, house lords, yogas, or dashas.
2. You must call the approved AstroWorld tools to retrieve all necessary astrological facts.
3. For simple inquiries (e.g. Moon sign), request ONLY the D1 chart tool.
4. For complex inquiries (e.g. career in 2027), request D1, D10, Dasha, and Gochara transits.
5. Once you have received the tool responses, do NOT write a natural-language astrological interpretation. Simply return a brief structured text acknowledging that evidence collection is complete.
`;

    const functionDeclarations = this.getFunctionDeclarations();
    const contents: any[] = [
      {
        role: 'user',
        parts: [
          {
            text: `User Question: "${rawQuestion}"\nNative Birth Data: ${JSON.stringify(birthProfile)}`,
          },
        ],
      },
    ];

    let round = 1;
    let terminationReason: GeminiGateExecutionResult['trace']['terminationReason'] = 'evidence_complete';

    while (round <= this.maxRounds) {
      if (records.length >= this.maxToolCallsTotal) {
        warnings.push(`Terminated multi-round loop: reached max tool limit (${this.maxToolCallsTotal}).`);
        terminationReason = 'max_tools_reached';
        break;
      }

      const response = await this.ai.models.generateContent({
        model: this.modelName,
        contents,
        config: {
          systemInstruction,
          temperature: 0.1,
          tools: [{ functionDeclarations }],
        },
      });

      const functionCalls = response.functionCalls || [];

      // If no further tool calls requested by Gemini, the gathering is complete
      if (functionCalls.length === 0) {
        terminationReason = 'evidence_complete';
        break;
      }

      // Add model's function call message to history
      const modelParts: any[] = [];
      for (const fc of functionCalls) {
        modelParts.push({ functionCall: { name: fc.name, args: fc.args } });
      }
      contents.push({ role: 'model', parts: modelParts });

      // Execute each requested tool through AstrologyToolRegistry
      const responseParts: any[] = [];
      for (const fc of functionCalls) {
        const toolName = fc.name || '';
        const toolArgs = (fc.args as Record<string, any>) || {};

        // Security check: ensure tool is in whitelist
        if (!AstrologyToolRegistry.hasTool(toolName)) {
          warnings.push(`Gemini requested unsupported tool "${toolName}". Rejected.`);
          trace.push({
            round,
            toolName,
            arguments: toolArgs,
            executionDurationMs: 0,
            success: false,
            verified: false,
            error: `Unsupported tool: "${toolName}"`,
          });
          responseParts.push({
            functionResponse: {
              name: toolName,
              response: { error: `Tool "${toolName}" is not permitted.` },
            },
          });
          continue;
        }

        const startTool = Date.now();
        // Inject validated birthProfile if omitted by model
        const mergedArgs = { birthProfile, ...toolArgs };
        const result = await AstrologyToolRegistry.executeTool(toolName, mergedArgs);
        const duration = Date.now() - startTool;

        trace.push({
          round,
          toolName,
          arguments: toolArgs,
          executionDurationMs: duration,
          success: result.success,
          verified: Boolean(result.provenance?.verified),
          error: result.error,
        });

        records.push({
          toolName,
          executionDurationMs: duration,
          success: result.success,
          provenance: result.provenance,
          resultSummary: result.success ? `Executed ${toolName}` : undefined,
          data: result.data,
          error: result.error,
        });

        responseParts.push({
          functionResponse: {
            name: toolName,
            response: result.success ? result.data : { error: result.error },
          },
        });
      }

      // Add tool results back to Gemini context for subsequent rounds
      contents.push({ role: 'user', parts: responseParts });
      round++;
    }

    if (round > this.maxRounds) {
      warnings.push(`Terminated multi-round loop: reached max round limit (${this.maxRounds}).`);
      terminationReason = 'max_rounds_reached';
    }

    return terminationReason;
  }

  /**
   * Deterministic mock function calling loop for offline CI test suites.
   */
  private async runMockFunctionCallingLoop(
    rawQuestion: string,
    birthProfile: BirthProfileInput,
    plan: QuestionPlan,
    trace: ToolCallTraceRecord[],
    records: ToolExecutionRecord[],
    warnings: string[]
  ): Promise<void> {
    const lower = rawQuestion.toLowerCase();

    // Determine mock tool sequence deterministically based on intent & domain
    const plannedTools: Array<{ round: number; name: string; args: any }> = [];

    if (lower.includes('moon sign') || lower.includes('rashi') || lower.includes('lagna')) {
      plannedTools.push({ round: 1, name: 'get_birth_chart', args: { birthProfile } });
    } else if (lower.includes('current mahadasha') || lower.includes('running dasha')) {
      plannedTools.push({ round: 1, name: 'get_current_dasha', args: { birthProfile } });
    } else if (lower.includes('d10') || lower.includes('dashamsha')) {
      plannedTools.push({ round: 1, name: 'get_divisional_chart', args: { birthProfile, vargaCode: 'D10' } });
    } else if (
      (lower.includes('career') || lower.includes('promotion') || lower.includes('job')) &&
      (lower.includes('2027') || lower.includes('timing') || lower.includes('transit'))
    ) {
      // Multi-round mock flow: Round 1 -> D1 + D10, Round 2 -> Dasha + Transits
      plannedTools.push({ round: 1, name: 'get_birth_chart', args: { birthProfile } });
      plannedTools.push({ round: 1, name: 'get_divisional_chart', args: { birthProfile, vargaCode: 'D10' } });
      plannedTools.push({ round: 2, name: 'get_current_dasha', args: { birthProfile } });
      plannedTools.push({
        round: 2,
        name: 'get_dasha_at',
        args: { birthProfile, targetDateIso: '2027-06-15T00:00:00.000Z' },
      });
      plannedTools.push({
        round: 2,
        name: 'get_transits',
        args: { birthProfile, targetDateIso: '2027-06-15T00:00:00.000Z' },
      });
    } else if (lower.includes('marriage') || lower.includes('relationship')) {
      plannedTools.push({ round: 1, name: 'get_birth_chart', args: { birthProfile } });
      plannedTools.push({ round: 1, name: 'get_divisional_chart', args: { birthProfile, vargaCode: 'D9' } });
      plannedTools.push({ round: 2, name: 'get_current_dasha', args: { birthProfile } });
      plannedTools.push({ round: 2, name: 'get_jaimini_details', args: { birthProfile } });
    } else {
      plannedTools.push({ round: 1, name: 'get_birth_chart', args: { birthProfile } });
      plannedTools.push({ round: 1, name: 'get_current_dasha', args: { birthProfile } });
    }

    const filteredTools = plannedTools.filter(t => t.round <= this.maxRounds);

    for (const item of filteredTools) {
      const start = Date.now();
      const result = await AstrologyToolRegistry.executeTool(item.name, item.args);
      const duration = Date.now() - start;

      trace.push({
        round: item.round,
        toolName: item.name,
        arguments: item.args,
        executionDurationMs: duration,
        success: result.success,
        verified: Boolean(result.provenance?.verified),
        error: result.error,
      });

      records.push({
        toolName: item.name,
        executionDurationMs: duration,
        success: result.success,
        provenance: result.provenance,
        resultSummary: result.success ? `Executed ${item.name}` : undefined,
        data: result.data,
        error: result.error,
      });
    }
  }

  /**
   * Extracts verified facts from tool results for inclusion in EvidencePacket.
   */
  private extractFactsFromToolData(
    toolName: string,
    data: any,
    facts: FactItem[],
    derivedFacts: DerivedFactItem[]
  ): void {
    if (!data) return;

    if (toolName === 'get_birth_chart') {
      if (data.ascendant) {
        facts.push({
          id: `fact_asc_${Date.now()}`,
          category: 'natal',
          entity: 'Ascendant',
          property: 'sign',
          value: data.ascendant.sign,
          sign: data.ascendant.sign,
          house: 1,
          degree: data.ascendant.degreeInSign || data.ascendant.degree,
          nakshatra: data.ascendant.nakshatra,
          sourceTool: toolName,
          verified: true,
        });
      }

      const planetList = Array.isArray(data.planets) ? data.planets : Object.values(data.planets || {});
      for (const p of planetList as any[]) {
        facts.push({
          id: `fact_${(p.name || p.planet || '').toLowerCase()}_${Date.now()}`,
          category: 'natal',
          entity: p.name || p.planet,
          property: 'position',
          value: `${p.sign} ${p.formattedDegree || ''}`.trim(),
          sign: p.sign,
          house: p.houseNumber || p.house,
          degree: p.degreeInSign || p.longitude,
          nakshatra: p.nakshatra,
          dignity: p.dignity,
          sourceTool: toolName,
          verified: true,
        });
      }
    }

    if (toolName === 'get_current_dasha' || toolName === 'get_dasha_at') {
      const lords = data.activeLords;
      if (lords) {
        facts.push({
          id: `fact_dasha_${Date.now()}`,
          category: 'dasha',
          entity: 'Vimshottari Dasha',
          property: 'active_periods',
          value: `${lords.mahadasha} - ${lords.antardasha} - ${lords.pratyantardasha || ''}`.trim(),
          sourceTool: toolName,
          verified: true,
        });
      }
    }

    if (toolName === 'get_divisional_chart') {
      const vargaPlanets = data.planets || [];
      for (const p of vargaPlanets) {
        facts.push({
          id: `fact_${data.vargaCode}_${(p.planet || '').toLowerCase()}_${Date.now()}`,
          category: 'varga',
          entity: `${p.planet} in ${data.vargaCode}`,
          property: 'varga_sign',
          value: `${p.vargaSign} (House ${p.houseNumber})`,
          sign: p.vargaSign,
          house: p.houseNumber,
          dignity: p.dignity,
          sourceTool: toolName,
          verified: true,
        });
      }
    }

    if (toolName === 'get_active_yogas' && Array.isArray(data.activeYogas)) {
      for (const y of data.activeYogas) {
        derivedFacts.push({
          id: `yoga_${(y.name || '').toLowerCase().replace(/\s+/g, '_')}`,
          type: 'Yoga',
          ruleCitation: y.citation || 'Brihat Parashara Hora Shastra',
          participatingPlanets: y.planetsInvolved,
          participatingHouses: y.housesInvolved,
          description: y.description || y.name,
          sourceTool: toolName,
          verified: true,
        });
      }
    }

    if (toolName === 'get_transits' && Array.isArray(data.transits)) {
      for (const t of data.transits) {
        facts.push({
          id: `fact_transit_${(t.planet || '').toLowerCase()}`,
          category: 'transit',
          entity: `${t.planet} (Transit)`,
          property: 'house_from_moon',
          value: `House ${t.houseFromMoon} from Moon, House ${t.houseFromLagna} from Lagna`,
          sign: t.currentSign,
          sourceTool: toolName,
          verified: true,
        });
      }
    }
  }

  private buildClarificationPacket(plan: QuestionPlan, startTime: number): EvidencePacket {
    return {
      version: 'ai-v2-evidence-1',
      createdAtIso: new Date().toISOString(),
      question: {
        raw: plan.rawQuestion,
        normalized: plan.normalizedQuestion,
        intent: plan.intent,
        domain: plan.domain,
      },
      plan,
      facts: [],
      derivedFacts: [],
      toolResults: [],
      provenance: [],
      warnings: ['Clarification required before tool execution.'],
      missingEvidence: ['User clarification input'],
      executionMetrics: {
        totalDurationMs: Date.now() - startTime,
        toolsExecutedCount: 0,
        parallelBatchesCount: 0,
      },
      verified: true,
    };
  }
}
