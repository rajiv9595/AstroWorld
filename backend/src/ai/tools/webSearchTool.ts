/**
 * ASTROWORLD AI V2 — Web Search Tool Wrapper
 * Bridges the existing ai_agent web_search into the v2 controlled tool boundary.
 * Worldly facts only — natal/predictive queries are blocked by the policy gate.
 */

import { GoogleGenAI } from '@google/genai';
import {
  executeWebSearch,
  isNatalWebSearchForbidden,
} from './webSearch.ts';
import { ToolExecutionResult } from './astrologyTools.ts';

export async function executeWebSearchTool(args: any): Promise<ToolExecutionResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  const aiClient = apiKey ? new GoogleGenAI({ apiKey }) : undefined;

  return executeWebSearch(args, {
    aiClient,
    modelName: process.env.AI_AGENT_MODEL || 'gemini-2.5-flash',
  });
}

export { isNatalWebSearchForbidden };
