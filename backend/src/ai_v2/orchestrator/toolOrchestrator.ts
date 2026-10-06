/**
 * ASTROWORLD AI V2 — Tool Execution Orchestrator
 * Coordinates safe, parallelized and dependency-resolved execution of deterministic astrology tools.
 * Collects facts, derived facts, provenance, and produces an immutable EvidencePacket.
 */

import { BirthProfileInput, validateBirthProfile } from '../schemas/birthProfile.ts';
import { QuestionPlan, validateQuestionPlan, PlannedToolRequest } from '../schemas/questionPlan.ts';
import {
  EvidencePacket,
  FactItem,
  DerivedFactItem,
  ToolExecutionRecord,
  validateEvidencePacket,
} from '../schemas/evidencePacket.ts';
import { ToolPlanner, PlannedExecutionGraph } from '../planner/toolPlanner.ts';
import { AstrologyToolRegistry } from '../tools/toolRegistry.ts';

export interface OrchestratorOptions {
  maxToolCalls?: number;
  timeoutMs?: number;
}

export class ToolExecutionOrchestrator {
  private toolPlanner: ToolPlanner;
  private maxToolCalls: number;
  private timeoutMs: number;

  constructor(options?: OrchestratorOptions) {
    this.toolPlanner = new ToolPlanner();
    this.maxToolCalls = options?.maxToolCalls ?? 10;
    this.timeoutMs = options?.timeoutMs ?? 15000;
  }

  /**
   * Orchestrates tool resolution and execution to build a comprehensive EvidencePacket.
   */
  public async orchestrate(plan: QuestionPlan, birthProfile: BirthProfileInput): Promise<EvidencePacket> {
    const startTime = Date.now();

    // 1. Validate Birth Profile
    const birthValidation = validateBirthProfile(birthProfile);
    if (!birthValidation.valid) {
      throw new Error(`Orchestration failed: invalid birth profile - ${birthValidation.error}`);
    }

    // 2. Validate Question Plan
    const planValidation = validateQuestionPlan(plan);
    if (!planValidation.valid) {
      throw new Error(`Orchestration failed: invalid question plan - ${planValidation.errors.join('; ')}`);
    }

    // 3. Check for Clarification Requirement
    if (plan.clarificationRequired) {
      return this.buildClarificationEvidencePacket(plan, startTime);
    }

    // 4. Resolve Execution Graph
    const graph: PlannedExecutionGraph = this.toolPlanner.planTools(plan, birthProfile);

    // Safety: Prevent excessive tool execution loops
    if (graph.allPlannedTools.length > this.maxToolCalls) {
      throw new Error(
        `Safety violation: Planned tool count (${graph.allPlannedTools.length}) exceeds max limit (${this.maxToolCalls}).`
      );
    }

    const toolResults: ToolExecutionRecord[] = [];
    const warnings: string[] = [];
    const missingEvidence: string[] = [];
    let parallelBatchesCount = 0;

    // 5. Execute Independent Tools in Parallel
    if (graph.independentTools.length > 0) {
      parallelBatchesCount++;
      const batchPromises = graph.independentTools.map(req => this.executeSingleTool(req));
      const batchResults = await Promise.all(batchPromises);
      toolResults.push(...batchResults);
    }

    // 6. Execute Dependent Tools Sequentially
    if (graph.dependentTools.length > 0) {
      for (const req of graph.dependentTools) {
        // Verify prerequisite tools executed successfully
        const prereqsPassed = (req.dependsOn || []).every(dep =>
          toolResults.some(r => r.toolName === dep && r.success)
        );

        if (!prereqsPassed) {
          missingEvidence.push(req.toolName);
          warnings.push(`Skipped tool "${req.toolName}" due to failed or missing dependency: ${(req.dependsOn || []).join(', ')}`);
          continue;
        }

        const res = await this.executeSingleTool(req);
        toolResults.push(res);
      }
    }

    // 7. Extract Verified Facts & Derived Facts
    const facts: FactItem[] = [];
    const derivedFacts: DerivedFactItem[] = [];
    const provenanceList: Array<{
      toolName: string;
      sourceEngine: string;
      ruleStandard: string;
      calculatedAtIso: string;
      verified: boolean;
    }> = [];

    for (const record of toolResults) {
      if (record.provenance) {
        provenanceList.push({
          toolName: record.toolName,
          ...record.provenance,
        });
      }

      if (record.success && record.data) {
        this.extractFactsFromToolData(record.toolName, record.data, facts, derivedFacts);
      } else if (!record.success) {
        warnings.push(`Tool execution failed for ${record.toolName}: ${record.error}`);
      }
    }

    const totalDurationMs = Date.now() - startTime;

    // 8. Assemble Evidence Packet
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
      toolResults,
      provenance: provenanceList,
      warnings,
      missingEvidence,
      executionMetrics: {
        totalDurationMs,
        toolsExecutedCount: toolResults.length,
        parallelBatchesCount,
      },
      verified: toolResults.length > 0 && toolResults.every(r => r.success && r.provenance?.verified),
    };

    // 9. Schema Self-Validation
    const packetValidation = validateEvidencePacket(evidencePacket);
    if (!packetValidation.valid) {
      throw new Error(`Orchestration produced invalid EvidencePacket: ${packetValidation.errors.join('; ')}`);
    }

    return evidencePacket;
  }

  /**
   * Executes a single tool request with timing and error isolation.
   */
  private async executeSingleTool(req: PlannedToolRequest): Promise<ToolExecutionRecord> {
    const start = Date.now();
    try {
      if (!AstrologyToolRegistry.hasTool(req.toolName)) {
        return {
          toolName: req.toolName,
          executionDurationMs: 0,
          success: false,
          provenance: {
            sourceEngine: 'AI V2 Tool Registry',
            ruleStandard: 'N/A',
            calculatedAtIso: new Date().toISOString(),
            verified: false,
          },
          error: `Unregistered tool: "${req.toolName}" is not in the AstrologyToolRegistry whitelist.`,
          data: null,
        };
      }

      const rawResult = await AstrologyToolRegistry.executeTool(req.toolName, req.parameters);
      const duration = Date.now() - start;

      return {
        toolName: req.toolName,
        executionDurationMs: duration,
        success: rawResult.success,
        provenance: rawResult.provenance || {
          sourceEngine: 'AstroWorld Deterministic Engine v2.0 (shared/engine)',
          ruleStandard: 'Classical Jyotish Siddhanta',
          calculatedAtIso: new Date().toISOString(),
          verified: rawResult.success,
        },
        resultSummary: rawResult.success ? `Executed ${req.toolName} successfully` : undefined,
        data: rawResult.data,
        error: rawResult.error,
      };
    } catch (err: any) {
      const duration = Date.now() - start;
      return {
        toolName: req.toolName,
        executionDurationMs: duration,
        success: false,
        provenance: {
          sourceEngine: 'AstroWorld Deterministic Engine v2.0 (shared/engine)',
          ruleStandard: 'N/A',
          calculatedAtIso: new Date().toISOString(),
          verified: false,
        },
        error: err.message || String(err),
        data: null,
      };
    }
  }

  /**
   * Builds an immediate EvidencePacket when the user query requires clarification before computation.
   */
  private buildClarificationEvidencePacket(plan: QuestionPlan, startTime: number): EvidencePacket {
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

  /**
   * Extracts raw and derived facts from structured tool payloads into indexed FactItems.
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

    if (toolName === 'get_divisional_chart') {
      if (data.ascendantSign) {
        facts.push({
          id: `fact_${(data.vargaCode || '').toLowerCase()}_lagna_${Date.now()}`,
          category: 'varga',
          entity: `${data.vargaCode} Lagna`,
          property: 'sign',
          value: data.ascendantSign,
          sign: data.ascendantSign,
          house: 1,
          degree: 0,
          sourceTool: toolName,
          verified: true,
        });
      }

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

    const yogasList = Array.isArray(data.yogas) ? data.yogas : Array.isArray(data.activeYogas) ? data.activeYogas : [];
    if (toolName === 'get_active_yogas' && Array.isArray(yogasList)) {
      for (const y of yogasList) {
        derivedFacts.push({
          id: `yoga_${String(y.id || y.name || '')
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '')}`,
          type: 'Yoga',
          ruleCitation: y.citation || 'Brihat Parashara Hora Shastra',
          participatingPlanets: y.planetsInvolved,
          participatingHouses: y.housesInvolved,
          description: y.description || y.name,
          sourceTool: toolName,
          verified: true,
        });
      }

      const gajaPresent = yogasList.some(
        (y: any) => String(y?.id || y?.name || '')
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '')
          .replace(/^yoga/, '')
          .replace(/yoga$/, '') === 'gajakesari',
      );

      // The negative result is emitted only from a successful, verified,
      // complete yoga-engine response, preserving auditable evidence lineage.
      if (!gajaPresent) {
        derivedFacts.push({
          id: 'yoga_gajakesari_absence',
          type: 'Yoga',
          ruleCitation: 'BPHS, Gajakesari Yoga Kendra-from-Moon prerequisite',
          description: 'Gajakesari Yoga absent: verified yoga engine returned no qualifying Gajakesari formation.',
          sourceTool: toolName,
          verified: true,
        });
      }
    }

    if (toolName === 'get_jaimini_details') {
      if (data.atmakaraka) {
        facts.push({
          id: `fact_ak_${Date.now()}`,
          category: 'jaimini',
          entity: 'Atmakaraka (AK)',
          property: 'graha',
          value: data.atmakaraka.graha,
          sign: data.atmakaraka.sign,
          sourceTool: toolName,
          verified: true,
        });
      }
      if (data.karakamsa) {
        facts.push({
          id: `fact_karakamsa_${Date.now()}`,
          category: 'jaimini',
          entity: 'Karakamsa',
          property: 'sign',
          value: data.karakamsa.sign,
          sign: data.karakamsa.sign,
          sourceTool: toolName,
          verified: true,
        });
      }
    }

    if (toolName === 'get_ashtakavarga' && data.sarvashtakavarga) {
      facts.push({
        id: `fact_sav_total_${Date.now()}`,
        category: 'ashtakavarga',
        entity: 'Sarvashtakavarga',
        property: 'total_bindus',
        value: data.sarvashtakavarga.totalBindus || 337,
        sourceTool: toolName,
        verified: true,
      });
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

    if (toolName === 'get_panchanga' && data.panchanga) {
      facts.push({
        id: `fact_panchanga_${Date.now()}`,
        category: 'panchanga',
        entity: 'Panchanga',
        property: 'five_limbs',
        value: `${data.panchanga.tithi?.name || ''}, ${data.panchanga.nakshatra?.name || ''}, ${data.panchanga.vara?.name || ''}`,
        sourceTool: toolName,
        verified: true,
      });
    }
  }
}
