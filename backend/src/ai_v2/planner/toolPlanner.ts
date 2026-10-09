/**
 * ASTROWORLD AI V2 — Tool Planner
 * Converts a validated QuestionPlan into a minimal, deterministic list of tool operations with dependency resolution.
 */

import { VargaCode } from '../../../../shared/index.ts';
import { BirthProfileInput } from '../schemas/birthProfile.ts';
import { QuestionPlan, PlannedToolRequest, ToolDependency } from '../schemas/questionPlan.ts';
import { ASTROLOGY_TOOL_DEFINITIONS } from '../schemas/toolSchemas.ts';

export interface PlannedExecutionGraph {
  independentTools: PlannedToolRequest[];
  dependentTools: PlannedToolRequest[];
  allPlannedTools: PlannedToolRequest[];
  dependencies: ToolDependency[];
}

export class ToolPlanner {
  /**
   * Plans the exact, minimal set of deterministic astrology tools required for a QuestionPlan.
   */
  public planTools(plan: QuestionPlan, birthProfile: BirthProfileInput): PlannedExecutionGraph {
    // If clarification is required, return no tool execution
    if (plan.clarificationRequired) {
      return {
        independentTools: [],
        dependentTools: [],
        allPlannedTools: [],
        dependencies: [],
      };
    }

    const toolMap = new Map<string, PlannedToolRequest>();
    const dependencies: ToolDependency[] = [];

    // Helper to register tool request
    const addTool = (toolName: string, parameters: Record<string, any>, dependsOn: string[] = [], priority: number = 1) => {
      // Validate tool is in ASTROLOGY_TOOL_DEFINITIONS
      if (!ASTROLOGY_TOOL_DEFINITIONS[toolName]) {
        throw new Error(`ToolPlanner error: Unknown tool "${toolName}"`);
      }

      const key = `${toolName}_${JSON.stringify(parameters)}`;
      if (!toolMap.has(key)) {
        toolMap.set(key, {
          id: `req_${toolMap.size + 1}_${toolName}`,
          toolName,
          parameters,
          dependsOn,
          priority,
        });

        if (dependsOn.length > 0) {
          dependencies.push({
            tool: toolName,
            dependsOn,
          });
        }
      }
    };

    const requestedToolsExplicit = plan.requiredTools || [];

    // 1. If explicit tools were already proposed in the QuestionPlan, validate and schedule them
    if (requestedToolsExplicit.length > 0) {
      for (const req of requestedToolsExplicit) {
        addTool(req.toolName, { birthProfile, ...(req.parameters || {}) }, req.dependsOn || [], req.priority || 1);
      }
    } else {
      // 2. Otherwise, infer the exact minimal tool set deterministically from intent, domain, layers, and temporal scope
      this.inferToolsFromPlan(plan, birthProfile, addTool);
    }

    const allPlannedTools = Array.from(toolMap.values()).sort((a, b) => (b.priority || 1) - (a.priority || 1));
    const independentTools = allPlannedTools.filter(t => !t.dependsOn || t.dependsOn.length === 0);
    const dependentTools = allPlannedTools.filter(t => t.dependsOn && t.dependsOn.length > 0);

    return {
      independentTools,
      dependentTools,
      allPlannedTools,
      dependencies,
    };
  }

  /**
   * Deterministically maps the QuestionPlan parameters to minimal required tools.
   */
  private inferToolsFromPlan(
    plan: QuestionPlan,
    birthProfile: BirthProfileInput,
    addTool: (toolName: string, parameters: Record<string, any>, dependsOn?: string[], priority?: number) => void
  ): void {
    const { intent, domain, chartLayers, temporalScope, targetDatesIso } = plan;

    // A. Minimal Simple Questions
    if (intent === 'general_chart_question' || intent === 'planet_question' || intent === 'house_question') {
      addTool('get_birth_chart', { birthProfile }, [], 10);
      const vargas = chartLayers.filter(l => l !== 'D1');
      for (const v of vargas) {
        addTool('get_divisional_chart', { birthProfile, vargaCode: v }, [], 9);
      }
      return;
    }

    if (intent === 'varga_analysis') {
      addTool('get_birth_chart', { birthProfile }, [], 10);
      if (chartLayers.length > 3 || chartLayers.length >= 16) {
        addTool('get_all_divisional_charts', { birthProfile }, ['get_birth_chart'], 9);
      } else {
        const vargas = chartLayers.filter(l => l !== 'D1');
        if (vargas.length === 0) vargas.push('D9');
        for (const v of vargas) {
          addTool('get_divisional_chart', { birthProfile, vargaCode: v }, ['get_birth_chart'], 9);
        }
      }
      return;
    }

    if (intent === 'dasha_analysis') {
      addTool('get_current_dasha', { birthProfile }, [], 10);
      if (targetDatesIso && targetDatesIso.length > 0) {
        for (const date of targetDatesIso) {
          addTool('get_dasha_at', { birthProfile, targetDateIso: date }, ['get_current_dasha'], 5);
        }
      }
      return;
    }

    if (intent === 'transit_analysis') {
      addTool('get_birth_chart', { birthProfile }, [], 10);
      const targetDate = targetDatesIso?.[0] || temporalScope.startIso;
      addTool('get_transits', { birthProfile, targetDateIso: targetDate }, ['get_birth_chart'], 8);
      return;
    }

    if (intent === 'yoga_analysis') {
      addTool('get_birth_chart', { birthProfile }, [], 10);
      addTool('get_active_yogas', { birthProfile }, [], 9);
      return;
    }

    if (intent === 'panchanga' || intent === 'muhurta') {
      addTool('get_birth_chart', { birthProfile }, [], 10);
      addTool('get_panchanga', { birthProfile }, [], 9);
      return;
    }

    // B. Domain Specific Questions
    if (domain === 'career' || intent === 'career' || intent === 'job_change' || intent === 'promotion_timing' || intent === 'career_timing') {
      addTool('get_birth_chart', { birthProfile }, [], 10);
      addTool('get_divisional_chart', { birthProfile, vargaCode: 'D10' as VargaCode }, [], 9);

      // Preserve additional plan layers (such as D4 for a foreign-career question)
      // without duplicating the primary domain's default divisional chart.
      for (const varga of chartLayers) {
        if (varga !== 'D1' && varga !== 'D10') {
          addTool('get_divisional_chart', { birthProfile, vargaCode: varga }, [], 8);
        }
      }

      addTool('get_current_dasha', { birthProfile }, [], 8);
      addTool('get_active_yogas', { birthProfile }, [], 7);

      if (temporalScope.type === 'upcoming' || temporalScope.type === 'specific_date' || targetDatesIso.length > 0) {
        const targetDate = targetDatesIso[0] || temporalScope.startIso || new Date(new Date().getFullYear() + 1, 0, 1).toISOString();
        addTool('get_dasha_at', { birthProfile, targetDateIso: targetDate }, ['get_current_dasha'], 6);
        addTool('get_transits', { birthProfile, targetDateIso: targetDate }, ['get_birth_chart'], 6);
      }
      return;
    }

    if (domain === 'relationship' || intent === 'marriage' || intent === 'relationship') {
      addTool('get_birth_chart', { birthProfile }, [], 10);
      addTool('get_divisional_chart', { birthProfile, vargaCode: 'D9' as VargaCode }, [], 9);
      addTool('get_current_dasha', { birthProfile }, [], 8);
      addTool('get_jaimini_details', { birthProfile }, [], 7);

      if (temporalScope.type === 'upcoming' || temporalScope.type === 'specific_date' || targetDatesIso.length > 0) {
        const targetDate = targetDatesIso[0] || temporalScope.startIso;
        if (targetDate) {
          addTool('get_dasha_at', { birthProfile, targetDateIso: targetDate }, ['get_current_dasha'], 6);
          addTool('get_transits', { birthProfile, targetDateIso: targetDate }, ['get_birth_chart'], 6);
        }
      }
      return;
    }

    if (domain === 'travel' || intent === 'travel') {
      addTool('get_birth_chart', { birthProfile }, [], 10);
      addTool('get_divisional_chart', { birthProfile, vargaCode: 'D4' as VargaCode }, [], 9);
      addTool('get_current_dasha', { birthProfile }, [], 8);

      if (
        temporalScope.type === 'upcoming' ||
        temporalScope.type === 'specific_date' ||
        targetDatesIso.length > 0
      ) {
        const targetDate =
          targetDatesIso[0] ||
          temporalScope.startIso ||
          new Date(new Date().getFullYear() + 1, 0, 1).toISOString();
        addTool('get_dasha_at', { birthProfile, targetDateIso: targetDate }, ['get_current_dasha'], 7);
        addTool('get_transits', { birthProfile, targetDateIso: targetDate }, ['get_birth_chart'], 7);
      }
      return;
    }

    if (domain === 'finance' || intent === 'wealth' || intent === 'finance' || intent === 'business') {
      addTool('get_birth_chart', { birthProfile }, [], 10);
      addTool('get_active_yogas', { birthProfile }, [], 9);
      addTool('get_ashtakavarga', { birthProfile }, [], 8);
      addTool('get_current_dasha', { birthProfile }, [], 7);
      return;
    }

    if (domain === 'health' || intent === 'health') {
      addTool('get_birth_chart', { birthProfile }, [], 10);
      addTool('get_planetary_strength', { birthProfile }, [], 9);
      addTool('get_current_dasha', { birthProfile }, [], 8);
      return;
    }

    if (domain === 'spirituality' || intent === 'spirituality') {
      addTool('get_birth_chart', { birthProfile }, [], 10);
      addTool('get_divisional_chart', { birthProfile, vargaCode: 'D9' as VargaCode }, [], 9);
      addTool('get_jaimini_details', { birthProfile }, [], 8);
      return;
    }

    // Default fallback: load D1 chart and active dasha
    addTool('get_birth_chart', { birthProfile }, [], 10);
    addTool('get_current_dasha', { birthProfile }, [], 8);
  }
}
