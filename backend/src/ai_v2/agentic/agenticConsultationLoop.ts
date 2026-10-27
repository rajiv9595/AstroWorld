/**
 * ASTROWORLD AI V2 — Agentic Consultation Loop
 * Model-driven tool-calling loop like Cursor/ChatGPT/Gemini.
 * The AI autonomously decides which astrology tools and web searches to invoke,
 * iterates until it has sufficient verified evidence, then answers like a human pro.
 */

import { GoogleGenAI } from '@google/genai';
import { BirthProfile } from '../schemas/birthProfile.ts';
import { AstrologyToolRegistry } from '../tools/toolRegistry.ts';
import { ToolExecutionResult } from '../tools/astrologyTools.ts';
import { AGENTIC_SYSTEM_PROMPT } from './agenticSystemPrompt.ts';

export interface AgenticToolCall {
  name: string;
  args: Record<string, any>;
  callId: string;
}

export interface AgenticIteration {
  iteration: number;
  modelReasoning: string;
  toolCalls: AgenticToolCall[];
  toolResults: ToolExecutionResult[];
  sufficientEvidence: boolean;
}

export interface AgenticConsultationResult {
  success: boolean;
  finalAnswer: string;
  iterations: AgenticIteration[];
  totalToolCalls: number;
  evidenceSummary: {
    chartCalculated: boolean;
    transitsChecked: boolean;
    dashaChecked: boolean;
    yogasChecked: boolean;
    webSearched: boolean;
  };
  executionMode: 'live_agentic' | 'deterministic_fallback';
  modelUsed?: string;
}

interface ToolResultMessage {
  role: 'tool';
  content: string;
  name: string;
  toolCallId?: string;
}

interface ModelMessage {
  role: 'user' | 'assistant' | 'tool';
  content: string;
  toolCalls?: Array<{
    id: string;
    type: 'function';
    function: { name: string; arguments: string };
  }>;
  name?: string;
}

const MAX_ITERATIONS = 6;

export class AgenticConsultationLoop {
  private aiClient?: GoogleGenAI;
  private grokApiKey?: string;
  private geminiApiKey?: string;
  private primaryModel: string;
  private fallbackModel: string;
  private forceMockMode: boolean;

  constructor(options?: {
    apiKey?: string;
    forceMockMode?: boolean;
    primaryModel?: string;
    fallbackModel?: string;
  }) {
    const envKey = process.env.GROK_API_KEY || process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY;
    const directKey = options?.apiKey;

    // Only treat as Grok key if it actually looks like one (gsk_ / xai-)
    const isGrokKey = (k?: string) => Boolean(k && (k.startsWith('gsk_') || k.startsWith('xai-')));
    this.grokApiKey = (directKey && isGrokKey(directKey)) ? directKey :
      (isGrokKey(envKey) ? envKey : undefined);

    // Gemini key (AIza / AQ. prefix or plain)
    this.geminiApiKey = (directKey && !isGrokKey(directKey)) ? directKey :
      (!isGrokKey(envKey) ? envKey : undefined);

    this.primaryModel = options?.primaryModel ||
      (this.grokApiKey ? (process.env.GROK_PRIMARY_MODEL || 'qwen/qwen3.8-27b') : (process.env.GEMINI_PRIMARY_MODEL || 'gemini-2.5-flash'));
    this.fallbackModel = options?.fallbackModel ||
      (this.grokApiKey ? (process.env.GROK_FALLBACK_MODEL || 'openai/gpt-oss-120b') : (process.env.GEMINI_FALLBACK_MODEL || 'gemini-flash-lite-latest'));

    const isLiveRequested = !!this.grokApiKey || !!this.geminiApiKey ||
      process.env.FORCE_LIVE_GEMINI === 'true' || process.env.FORCE_LIVE_GROK === 'true' || process.argv.includes('--live');
    this.forceMockMode = options?.forceMockMode ?? !isLiveRequested;

    if (!this.forceMockMode && !this.grokApiKey && this.geminiApiKey) {
      this.aiClient = new GoogleGenAI({ apiKey: this.geminiApiKey });
    }
  }

  /**
   * Main agentic entry point. Model drives the tool-calling loop.
   */
  public async consult(
    rawQuestion: string,
    birthProfile: BirthProfile,
    options?: {
      conversationContext?: Array<{ role: 'user' | 'model'; text: string }>;
      userPreferences?: { responseStyle?: string; answerDepth?: string };
      forceMockMode?: boolean;
      maxIterations?: number;
    }
  ): Promise<AgenticConsultationResult> {
    const isMock = options?.forceMockMode ?? this.forceMockMode;
    const maxIterations = options?.maxIterations ?? MAX_ITERATIONS;
    const iterations: AgenticIteration[] = [];
    let sufficientEvidence = false;

    // Build conversation context for the model
    const contextMessages: ModelMessage[] = [];
    if (options?.conversationContext && options.conversationContext.length > 0) {
      for (const turn of options.conversationContext) {
        contextMessages.push({
          role: turn.role === 'model' ? 'assistant' : 'user',
          content: turn.text,
        });
      }
    }

    // Add the current question with birth profile context
    const profileContext = this.formatBirthProfileContext(birthProfile);
    contextMessages.push({
      role: 'user',
      content: `${profileContext}\n\nUser Question: ${rawQuestion}\n\nYou are an expert Vedic astrologer. Decide which tools to call to answer this question accurately. Start by analyzing what information you need, then call the appropriate tools.`,
    });

    let executionMode: 'live_agentic' | 'deterministic_fallback' = 'deterministic_fallback';
    let modelUsed: string | undefined;

    // If no live client, use deterministic fallback
    if (isMock || (!this.grokApiKey && !this.aiClient)) {
      return this.buildDeterministicFallback(rawQuestion, birthProfile);
    }

    // Agentic loop: model decides tools → execute → reason → repeat
    let currentMessages = [...contextMessages];
    for (let iter = 0; iter < maxIterations; iter++) {
      const iterationNum = iter + 1;

      // Ask the model what to do next (reasoning + tool calls)
      const modelResponse = await this.callAgenticModel(currentMessages, isMock);
      if (!modelResponse) break;

      executionMode = 'live_agentic';
      modelUsed = this.primaryModel;

      // Check if model says it has enough evidence and wants to answer
      const wantsToAnswer = this.modelWantsToAnswer(modelResponse.content);
      const toolCalls = this.parseToolCalls(modelResponse);

      const iteration: AgenticIteration = {
        iteration: iterationNum,
        modelReasoning: modelResponse.content,
        toolCalls: [],
        toolResults: [],
        sufficientEvidence: wantsToAnswer && toolCalls.length === 0,
      };

      // If model wants to answer with no more tools, we're done
      if (wantsToAnswer && toolCalls.length === 0) {
        sufficientEvidence = true;
        iterations.push(iteration);
        // Add model's final answer as assistant message
        currentMessages.push({ role: 'assistant', content: modelResponse.content });
        break;
      }

      // Execute tool calls in parallel
      if (toolCalls.length > 0) {
        const toolResults = await this.executeToolCalls(toolCalls, birthProfile);
        iteration.toolCalls = toolCalls;
        iteration.toolResults = toolResults;

        // Feed tool results back to the model
        const toolResultSummary = this.buildToolResultSummary(toolResults);
        currentMessages.push({
          role: 'assistant',
          content: modelResponse.content,
          toolCalls: toolCalls.map(tc => ({
            id: tc.callId,
            type: 'function' as const,
            function: { name: tc.name, arguments: JSON.stringify(tc.args) },
          })),
        });
        currentMessages.push({
          role: 'tool',
          content: toolResultSummary,
          name: 'multi_tool_result',
        });
      }

      iterations.push(iteration);

      // If model didn't request any tools and didn't say it wants to answer, ask it to conclude
      if (toolCalls.length === 0 && !wantsToAnswer) {
        currentMessages.push({
          role: 'user',
          content: 'You have not requested any tools. Do you have sufficient verified evidence to answer the user? If yes, provide your final answer. If no, specify exactly which tool you need to call next.',
        });
      }
    }

    // Get final answer from model (one more turn to synthesize)
    let finalAnswer = '';
    if (sufficientEvidence) {
      // Extract the last assistant message as the answer
      const lastAssistant = [...currentMessages].reverse().find(m => m.role === 'assistant' && !m.toolCalls);
      finalAnswer = lastAssistant ? lastAssistant.content : '';
    }

    if (!finalAnswer) {
      // Force a final synthesis turn
      const synthesisResponse = await this.callAgenticModel([
        ...currentMessages,
        { role: 'user', content: 'Based on all the tool results above, provide your final conversational answer to the user. Be warm, wise, and human-like. Explain the astrological reasoning clearly.' },
      ], isMock);
      finalAnswer = synthesisResponse?.content || this.buildDeterministicFallback(rawQuestion, birthProfile).finalAnswer;
    }

    return {
      success: true,
      finalAnswer,
      iterations,
      totalToolCalls: iterations.reduce((sum, it) => sum + it.toolResults.length, 0),
      evidenceSummary: this.buildEvidenceSummary(iterations),
      executionMode,
      modelUsed,
    };
  }

  /**
   * Call the model (Gemini or Groq) with agentic system prompt + function calling tools.
   */
  private async callAgenticModel(
    messages: ModelMessage[],
    isMock: boolean
  ): Promise<{ content: string; toolCalls?: any[] } | null> {
    const systemInstruction = AGENTIC_SYSTEM_PROMPT;

    // Build tool declarations for function calling
    const toolDefs = AstrologyToolRegistry.getToolDefinitions();
    const geminiTools = toolDefs.map(td => ({
      name: td.name,
      description: td.description,
      parameters: td.parameters,
    }));

    if (this.grokApiKey && !isMock) {
      // Groq-compatible OpenAI API
      const groqMessages = [
        { role: 'system', content: systemInstruction },
        ...messages,
      ];

      const body: any = {
        model: this.primaryModel,
        messages: groqMessages,
        temperature: 0.6,
        tools: geminiTools.map(t => ({ type: 'function', function: t })),
        tool_choice: 'auto',
      };

      try {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.grokApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(30000),
        });

        if (!res.ok) {
          const errText = await res.text().catch(() => '');
          throw new Error(`Groq API HTTP ${res.status}: ${errText}`);
        }

        const data: any = await res.json();
        const choice = data?.choices?.[0];
        if (!choice) return null;

        const message = choice.message;
        const content = message?.content || '';
        const toolCalls = message?.tool_calls?.map((tc: any) => ({
          id: tc.id,
          name: tc.function?.name,
          arguments: JSON.parse(tc.function?.arguments || '{}'),
        })) || [];

        return { content, toolCalls };
      } catch (err: any) {
        console.warn('[AgenticLoop] Groq call failed:', err.message);
        return null;
      }
    }

    if (this.aiClient && !isMock) {
      // Gemini with function calling
      try {
        const geminiContents = messages.map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }],
        }));

        const response = await this.aiClient.models.generateContent({
          model: this.primaryModel,
          contents: geminiContents,
          config: {
            systemInstruction,
            temperature: 0.6,
            tools: geminiTools.length > 0 ? [{ functionDeclarations: geminiTools as any }] : undefined,
            toolConfig: { functionCallingConfig: { mode: 'AUTO' as any } } as any,
          } as any,
        });

        const text = (response as any)?.text || '';
        const calls = (response as any)?.candidates?.[0]?.functionCalls;
        const toolCalls = calls?.map((fc: any) => ({
          id: `call_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          name: fc.name,
          arguments: fc.args || {},
        })) || [];

        return { content: text, toolCalls };
      } catch (err: any) {
        console.warn('[AgenticLoop] Gemini call failed:', err.message);
        return null;
      }
    }

    return null;
  }

  /**
   * Execute tool calls in parallel through the v2 tool registry.
   */
  private async executeToolCalls(
    toolCalls: AgenticToolCall[],
    birthProfile: BirthProfile
  ): Promise<ToolExecutionResult[]> {
    const results = await Promise.all(toolCalls.map(async (tc) => {
      // Inject birthProfile into args if the tool needs it and it's not provided
      const args: any = { ...tc.args };
      if (
        tc.name !== 'web_search' &&
        (!args.birthProfile || Object.keys(args.birthProfile).length === 0)
      ) {
        args.birthProfile = birthProfile;
      }

      try {
        return await AstrologyToolRegistry.executeTool(tc.name, args);
      } catch (err: any) {
        return {
          success: false,
          tool: tc.name,
          error: err.message,
          provenance: {
            sourceEngine: 'Agentic Tool Executor',
            ruleStandard: 'N/A',
            calculatedAtIso: new Date().toISOString(),
            verified: false,
          },
        };
      }
    }));
    return results;
  }

  /**
   * Parse tool calls from model response.
   */
  private parseToolCalls(modelResponse: { content: string; toolCalls?: any[] }): AgenticToolCall[] {
    if (!modelResponse.toolCalls || modelResponse.toolCalls.length === 0) {
      // Also try to parse from content as fallback
      return [];
    }
    return modelResponse.toolCalls.map((tc, i) => ({
      name: tc.name,
      args: tc.arguments || {},
      callId: tc.id || `call_${Date.now()}_${i}`,
    }));
  }

  /**
   * Check if model indicates it wants to give final answer (no more tools).
   */
  private modelWantsToAnswer(content: string): boolean {
    const lower = content.toLowerCase();
    const answerSignals = [
      'final answer', 'i have enough', 'sufficient evidence', 'based on',
      'looking at your chart', 'the transits show', 'in conclusion',
      'here is my answer', 'my assessment', 'vedic perspective',
    ];
    const noMoreTools = !/call.*tool|use.*get_|invoke.*tool|need to calculate|need to search/i.test(lower) ||
      lower.includes('no more tools') || lower.includes('enough information');
    return answerSignals.some(s => lower.includes(s)) && noMoreTools;
  }

  /**
   * Build a summary of tool results to feed back to the model.
   */
  private buildToolResultSummary(results: ToolExecutionResult[]): string {
    const lines: string[] = [];
    for (const r of results) {
      if (r.success) {
        lines.push(`[${r.tool}] SUCCESS: ${JSON.stringify(r.data).slice(0, 2000)}`);
      } else {
        lines.push(`[${r.tool}] ERROR: ${r.error}`);
      }
      lines.push(`  Source: ${r.provenance.sourceEngine} | Rule: ${r.provenance.ruleStandard} | Verified: ${r.provenance.verified}`);
    }
    return lines.join('\n');
  }

  /**
   * Build evidence summary from iterations.
   */
  private buildEvidenceSummary(iterations: AgenticIteration[]): AgenticConsultationResult['evidenceSummary'] {
    const allResults = iterations.flatMap(it => it.toolResults);
    return {
      chartCalculated: allResults.some(r => r.tool === 'get_birth_chart' && r.success),
      transitsChecked: allResults.some(r => r.tool === 'get_transits' && r.success),
      dashaChecked: allResults.some(r => (r.tool === 'get_current_dasha' || r.tool === 'get_dasha_at') && r.success),
      yogasChecked: allResults.some(r => r.tool === 'get_active_yogas' && r.success),
      webSearched: allResults.some(r => r.tool === 'web_search' && r.success),
    };
  }

  /**
   * Deterministic fallback when no live AI client is available.
   */
  private buildDeterministicFallback(rawQuestion: string, birthProfile: BirthProfile): AgenticConsultationResult {
    return {
      success: true,
      finalAnswer: `I don't have a live AI model configured to run the agentic consultation loop. Please set GEMINI_API_KEY or GROQ_API_KEY in your backend/.env to enable the full agentic astrologer. In the meantime, you can use the standard v2 consultation endpoints which provide deterministic chart calculations for: ${rawQuestion}`,
      iterations: [],
      totalToolCalls: 0,
      evidenceSummary: {
        chartCalculated: false,
        transitsChecked: false,
        dashaChecked: false,
        yogasChecked: false,
        webSearched: false,
      },
      executionMode: 'deterministic_fallback',
    };
  }

  /**
   * Format birth profile context for the model.
   */
  private formatBirthProfileContext(profile: BirthProfile): string {
    return `NATIVE BIRTH PROFILE:
Date: ${profile.year}-${String(profile.month).padStart(2, '0')}-${String(profile.day).padStart(2, '0')}
Time: ${String(profile.hour).padStart(2, '0')}:${String(profile.minute).padStart(2, '0')}
Coordinates: ${profile.latitude}, ${profile.longitude}
Timezone: ${profile.timezone}`;
  }
}
