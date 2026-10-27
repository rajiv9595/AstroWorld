/**
 * Web search tool — Gemini Google Search grounding for worldly facts only.
 * Forbidden for natal placements / predictive chart dates.
 */

import { GoogleGenAI } from '@google/genai';
import { ToolExecutionResult } from './astrologyTools.ts';

const NATAL_BLOCK =
  /\b(my (moon|sun|lagna|ascendant|chart|dasha|house|nakshatra)|natal|birth chart|horoscope placement|when will i marry|my saturn)\b/i;

export function isNatalWebSearchForbidden(query: string): boolean {
  return NATAL_BLOCK.test(query || '');
}

export async function executeWebSearch(
  args: any,
  options?: { aiClient?: GoogleGenAI | null; modelName?: string },
): Promise<ToolExecutionResult> {
  const query = typeof args?.query === 'string' ? args.query.trim() : '';
  if (!query) {
    return {
      success: false,
      tool: 'web_search',
      error: 'query is required',
      provenance: {
        sourceEngine: 'Web Search',
        ruleStandard: 'N/A',
        calculatedAtIso: new Date().toISOString(),
        verified: false,
      },
    };
  }

  if (isNatalWebSearchForbidden(query)) {
    return {
      success: false,
      tool: 'web_search',
      error:
        'web_search forbidden for natal chart / personal predictive queries. Use engine tools instead.',
      provenance: {
        sourceEngine: 'Web Search Policy Gate',
        ruleStandard: 'Natal facts must come from engine',
        calculatedAtIso: new Date().toISOString(),
        verified: false,
      },
    };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const ai = options?.aiClient ?? (apiKey ? new GoogleGenAI({ apiKey }) : null);
  const modelName = options?.modelName || process.env.AI_AGENT_MODEL || 'gemini-2.5-flash';

  if (!ai) {
    return {
      success: true,
      tool: 'web_search',
      data: {
        query,
        mode: 'unavailable',
        summary:
          'Web search is not configured (missing GEMINI_API_KEY). Answer from classical RAG and engine data only.',
        sources: [],
      },
      provenance: {
        sourceEngine: 'Web Search (unavailable)',
        ruleStandard: 'Google Search grounding',
        calculatedAtIso: new Date().toISOString(),
        verified: false,
      },
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Provide a brief factual answer with sources for: ${query}\nDo not invent astrology chart placements.`,
            },
          ],
        },
      ],
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.2,
      },
    });

    const text =
      (response as any)?.text ||
      (response as any)?.candidates?.[0]?.content?.parts
        ?.map((p: any) => p.text)
        .filter(Boolean)
        .join('\n') ||
      '';

    const grounding =
      (response as any)?.candidates?.[0]?.groundingMetadata ||
      (response as any)?.groundingMetadata ||
      null;

    const sources: Array<{ title?: string; uri?: string }> = [];
    const chunks = grounding?.groundingChunks || grounding?.groundingSupports || [];
    for (const chunk of chunks) {
      const web = chunk?.web || chunk?.retrievedContext;
      if (web?.uri || web?.title) {
        sources.push({ title: web.title, uri: web.uri });
      }
    }

    return {
      success: true,
      tool: 'web_search',
      data: {
        query,
        mode: 'google_search',
        summary: String(text).slice(0, 4000),
        sources: sources.slice(0, 8),
      },
      provenance: {
        sourceEngine: 'Gemini Google Search Grounding',
        ruleStandard: 'World facts only',
        calculatedAtIso: new Date().toISOString(),
        verified: Boolean(text),
      },
    };
  } catch (err: any) {
    return {
      success: false,
      tool: 'web_search',
      error: `Web search failed: ${err.message}`,
      provenance: {
        sourceEngine: 'Gemini Google Search Grounding',
        ruleStandard: 'World facts only',
        calculatedAtIso: new Date().toISOString(),
        verified: false,
      },
    };
  }
}
