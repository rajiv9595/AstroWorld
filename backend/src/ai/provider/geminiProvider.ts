/**
 * ASTROWORLD — Gemini AI Provider
 * Configurable LLM interface supporting Gemini 3.8 Flash, configurable thinking levels,
 * JSON structured response mode, and safe model fallback.
 */

import { GoogleGenAI } from '@google/genai';
import { getAi } from '../../services/geminiService.ts';
import { buildAstrologerSystemInstruction, buildConsultationPrompt } from '../prompts/consultationPrompt.ts';
import { ConsultationContextPacket, QueryDepth, StructuredAiResponse } from '../types.ts';

export interface GeminiProviderConfig {
  primaryModel: string;
  fallbackModels: string[];
  thinkingLevel: 'low' | 'medium' | 'high';
}

export function getProviderConfig(depth: QueryDepth = 'ANALYSIS'): GeminiProviderConfig {
  const primaryModel = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
  const configuredThinking = (process.env.GEMINI_THINKING_LEVEL || 'medium').toLowerCase() as
    | 'low'
    | 'medium'
    | 'high';

  // Dynamic thinking budget based on depth:
  // Low latency for simple facts, Medium for standard analysis, High only for deep multi-domain
  let effectiveThinking: 'low' | 'medium' | 'high' = configuredThinking;
  if (depth === 'FACT' || depth === 'OVERVIEW') {
    effectiveThinking = 'low';
  } else if (depth === 'DEEP_CONSULTATION') {
    effectiveThinking = 'high';
  }

  return {
    primaryModel,
    fallbackModels: ['gemini-2.5-flash', 'gemini-1.5-flash'],
    thinkingLevel: effectiveThinking,
  };
}

export async function callGeminiConsultation(
  packet: ConsultationContextPacket,
  customPrompt?: string
): Promise<StructuredAiResponse> {
  const ai = getAi();
  if (!ai) {
    throw new Error('GEMINI_API_KEY is not configured in environment.');
  }

  const config = getProviderConfig(packet.entities.depth);
  const promptText = customPrompt || buildConsultationPrompt(packet);
  const systemInstruction = buildAstrologerSystemInstruction();

  const modelsToTry = [config.primaryModel, ...config.fallbackModels];
  let lastError: Error | null = null;

  for (const modelName of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: promptText,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.3, // Low temperature for high astrological fidelity
        },
      });

      const responseText = response.text || '';
      if (!responseText) {
        throw new Error(`Empty response returned by model ${modelName}`);
      }

      // Parse JSON
      const parsed = JSON.parse(responseText) as StructuredAiResponse;
      return parsed;
    } catch (err: any) {
      lastError = err;
      // If error is model not found, continue to next fallback model
      const errMsg = String(err?.message || '');
      if (errMsg.includes('404') || errMsg.includes('not found') || errMsg.includes('unsupported')) {
        continue;
      }
      // If it's a JSON parse error or other error, try next or throw
      if (modelName === modelsToTry[modelsToTry.length - 1]) {
        throw err;
      }
    }
  }

  throw lastError || new Error('Failed to generate consultation from Gemini models.');
}
