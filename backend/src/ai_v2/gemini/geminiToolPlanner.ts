/**
 * ASTROWORLD AI V2 — Gemini Tool Calling Integration
 * Connects the Google GenAI SDK to the controlled AstrologyToolRegistry.
 * Gemini serves strictly as a natural-language question understanding and tool-calling agent.
 * Gemini NEVER calculates astrology mathematics or invents placements.
 */

import { GoogleGenAI, FunctionDeclaration, Type } from '@google/genai';
import { ASTROLOGY_TOOL_DEFINITIONS, ToolDefinition } from '../schemas/toolSchemas.ts';
import { AstrologyToolRegistry } from '../tools/toolRegistry.ts';
import { QuestionPlan } from '../schemas/questionPlan.ts';
import { BirthProfileInput } from '../schemas/birthProfile.ts';

export interface GeminiPlannerConfig {
  apiKey?: string;
  modelName?: string;
}

export class GeminiToolPlanner {
  private ai: GoogleGenAI | null = null;
  private modelName: string;

  constructor(config?: GeminiPlannerConfig) {
    const apiKey = config?.apiKey || process.env.GEMINI_API_KEY;
    this.modelName = config?.modelName || 'gemini-3.8-flash';
    if (apiKey) {
      this.ai = new GoogleGenAI({ apiKey });
    }
  }

  /**
   * Translates the canonical ASTROLOGY_TOOL_DEFINITIONS into Gemini function declarations.
   */
  public getGeminiFunctionDeclarations(): any[] {
    return Object.values(ASTROLOGY_TOOL_DEFINITIONS).map(def => ({
      name: def.name,
      description: def.description,
      parameters: def.parameters,
    }));
  }

  /**
   * Invokes Gemini to select tools via native function calling without generating prose answers.
   */
  public async planToolsWithGemini(
    question: string,
    birthProfile: BirthProfileInput
  ): Promise<{ selectedTools: Array<{ name: string; args: any }>; rawResponse?: string }> {
    if (!this.ai) {
      throw new Error('Gemini API key is not configured. Set GEMINI_API_KEY in your environment.');
    }

    const systemInstruction = `
You are the AstroWorld Question Understanding and Tool Selection Layer.
Your task is to analyze the user's astrological question and request the exact deterministic tools needed from the AstroWorld Engine.

CRITICAL DIRECTIVES:
1. You DO NOT calculate or invent planetary positions, dashas, transits, or yogas.
2. You must NEVER generate the final prose astrological answer in this phase.
3. You must request the minimum necessary tools using the provided function declarations.
4. If a question is simple (e.g. "What is my Moon sign?"), request ONLY the D1 birth chart tool.
5. If a question is ambiguous, do not request any tools.
`;

    const functionDeclarations = this.getGeminiFunctionDeclarations();

    const response = await this.ai.models.generateContent({
      model: this.modelName,
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `User Question: "${question}"\nNative Birth Details: ${JSON.stringify(birthProfile)}`,
            },
          ],
        },
      ],
      config: {
        systemInstruction,
        temperature: 0.1,
        tools: [{ functionDeclarations }],
      },
    });

    const functionCalls = response.functionCalls || [];
    const selectedTools: Array<{ name: string; args: any }> = functionCalls.map(fc => ({
      name: fc.name || '',
      args: fc.args || {},
    }));

    return {
      selectedTools,
      rawResponse: response.text,
    };
  }
}
