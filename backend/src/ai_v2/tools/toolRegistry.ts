/**
 * ASTROWORLD AI V2 — Controlled Tool Registry
 * Single authoritative boundary dispatching deterministic tool requests to the astrology engine.
 */

import { ASTROLOGY_TOOL_DEFINITIONS, ToolDefinition } from '../schemas/toolSchemas.ts';
import {
  executeGetBirthChart,
  executeGetDivisionalChart,
  executeGetAllDivisionalCharts,
  executeGetCurrentDasha,
  executeGetDashaAt,
  executeGetTransits,
  executeGetActiveYogas,
  executeGetPlanetaryStrength,
  executeGetAshtakavarga,
  executeGetJaiminiDetails,
  executeGetPanchanga,
  ToolExecutionResult,
} from './astrologyTools.ts';

type ToolHandler = (args: any) => ToolExecutionResult;

export class AstrologyToolRegistry {
  private static handlers: Record<string, ToolHandler> = {
    get_birth_chart: executeGetBirthChart,
    get_divisional_chart: executeGetDivisionalChart,
    get_all_divisional_charts: executeGetAllDivisionalCharts,
    get_current_dasha: executeGetCurrentDasha,
    get_dasha_at: executeGetDashaAt,
    get_transits: executeGetTransits,
    get_active_yogas: executeGetActiveYogas,
    get_planetary_strength: executeGetPlanetaryStrength,
    get_ashtakavarga: executeGetAshtakavarga,
    get_jaimini_details: executeGetJaiminiDetails,
    get_panchanga: executeGetPanchanga,
  };

  /**
   * Retrieves all registered tool definitions for Gemini Function Calling declarations.
   */
  public static getToolDefinitions(): ToolDefinition[] {
    return Object.values(ASTROLOGY_TOOL_DEFINITIONS);
  }

  /**
   * Checks if a tool name is registered in the controlled boundary.
   */
  public static hasTool(toolName: string): boolean {
    return Boolean(this.handlers[toolName]);
  }

  /**
   * Executes a registered tool securely through the controlled boundary.
   */
  public static executeTool(toolName: string, args: any): ToolExecutionResult {
    const handler = this.handlers[toolName];
    if (!handler) {
      return {
        success: false,
        tool: toolName,
        error: `Tool "${toolName}" is not registered in the AI V2 Tool Registry. Available tools: ${Object.keys(this.handlers).join(', ')}`,
        provenance: {
          sourceEngine: 'AI V2 Tool Registry',
          ruleStandard: 'N/A',
          calculatedAtIso: new Date().toISOString(),
          verified: false,
        },
      };
    }

    try {
      return handler(args);
    } catch (err: any) {
      return {
        success: false,
        tool: toolName,
        error: `Unexpected error executing tool "${toolName}": ${err.message}`,
        provenance: {
          sourceEngine: 'AI V2 Tool Registry',
          ruleStandard: 'N/A',
          calculatedAtIso: new Date().toISOString(),
          verified: false,
        },
      };
    }
  }

  /**
   * Returns list of all registered tool names.
   */
  public static getRegisteredToolNames(): string[] {
    return Object.keys(this.handlers);
  }
}
