import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

export interface LLMMessage {

  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMGenerateOptions {
  messages: LLMMessage[];
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
}

export interface LLMGenerateResult {
  text: string;
  provider: 'nvidia' | 'gemini' | 'groq' | 'synthetic';
  modelUsed: string;
  durationMs: number;
}

export class MultiProviderLLMClient {
  private nvidiaApiKey?: string;
  private nvidiaBaseUrl: string;
  private nvidiaModel: string;

  private geminiApiKey?: string;
  private geminiModel: string;
  private geminiFallbackModel: string;

  private groqApiKey?: string;
  private groqBaseUrl: string;
  private groqModel: string;

  constructor() {
    this.nvidiaApiKey = process.env.NVIDIA_API_KEY?.trim() || undefined;
    this.nvidiaBaseUrl = (process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1').replace(/\/+$/, '');
    this.nvidiaModel = process.env.NVIDIA_MODEL || 'meta/llama-3.1-70b-instruct';

    this.geminiApiKey = process.env.GEMINI_API_KEY?.trim() || undefined;
    this.geminiModel = process.env.GEMINI_PRIMARY_MODEL || 'gemini-3.5-flash-lite';
    this.geminiFallbackModel = process.env.GEMINI_FALLBACK_MODEL || 'gemini-3.8-flash';

    this.groqApiKey = process.env.GROQ_API_KEY?.trim() || process.env.GROK_API_KEY?.trim() || undefined;
    this.groqBaseUrl = (process.env.GROK_BASE_URL || 'https://api.groq.com/openai/v1').replace(/\/+$/, '');
    this.groqModel = process.env.GROK_PRIMARY_MODEL || 'qwen/qwen3.8-27b';
  }

  public hasAnyLiveKey(): boolean {
    return Boolean(this.nvidiaApiKey || this.geminiApiKey || this.groqApiKey);
  }

  public async generate(options: LLMGenerateOptions): Promise<LLMGenerateResult> {
    const start = Date.now();
    const timeoutMs = options.timeoutMs ?? 20000;
    const errors: string[] = [];

    // 1. Try Gemini API first if key is present (supports massive 1M token context for 7-perspective council)
    if (this.geminiApiKey) {
      const geminiCandidateModels = Array.from(
        new Set([
          'gemini-3.5-flash-lite',
          'gemini-3.8-flash',
          this.geminiFallbackModel,
          this.geminiModel,
          'gemini-flash-latest',
        ].filter(Boolean))
      );

      for (const model of geminiCandidateModels) {
        try {
          const text = await this.callGemini({
            apiKey: this.geminiApiKey,
            model,
            messages: options.messages,
            temperature: options.temperature ?? 0.65,
            maxTokens: options.maxTokens ?? 4096,
            timeoutMs: Math.min(timeoutMs, 30000),
          });
          if (text && text.length > 20) {
            return {
              text,
              provider: 'gemini',
              modelUsed: model,
              durationMs: Date.now() - start,
            };
          }
        } catch (err: any) {
          errors.push(`Gemini ${model} (${err.message})`);
          console.warn(`[MultiProviderLLM] Gemini (${model}) attempt failed: ${err.message}`);
        }
      }
    }

    // 2. Try Groq API (condensing prompt to fit Groq 8k TPM limits)
    if (this.groqApiKey) {
      const groqCandidateModels = Array.from(
        new Set([
          'openai/gpt-oss-120b',
          'openai/gpt-oss-20b',
          this.groqModel,
        ].filter(Boolean))
      );

      // Condense messages to fit within Groq's 7k-8k token rate limits
      const condensedMessages: LLMMessage[] = options.messages.map((m) => {
        if (m.content.length > 12000) {
          return { role: m.role, content: m.content.slice(0, 12000) + '\n[...evidence matrix condensed for throughput...]' };
        }
        return m;
      });

      for (const model of groqCandidateModels) {
        try {
          const text = await this.callOpenAICompatible({
            baseUrl: this.groqBaseUrl,
            apiKey: this.groqApiKey,
            model,
            messages: condensedMessages,
            temperature: options.temperature ?? 0.6,
            maxTokens: Math.min(options.maxTokens ?? 2048, 2048),
            timeoutMs: Math.min(timeoutMs, 25000),
          });
          if (text && text.length > 20) {
            return {
              text,
              provider: 'groq',
              modelUsed: model,
              durationMs: Date.now() - start,
            };
          }
        } catch (err: any) {
          errors.push(`Groq ${model} (${err.message})`);
          console.warn(`[MultiProviderLLM] Groq (${model}) attempt failed: ${err.message}`);
        }
      }
    }

    // 3. Try NVIDIA API if key is present
    if (this.nvidiaApiKey) {
      try {
        const text = await this.callOpenAICompatible({
          baseUrl: this.nvidiaBaseUrl,
          apiKey: this.nvidiaApiKey,
          model: this.nvidiaModel,
          messages: options.messages,
          temperature: options.temperature ?? 0.6,
          maxTokens: options.maxTokens ?? 4096,
          timeoutMs: Math.min(timeoutMs, 25000),
        });
        if (text && text.length > 20) {
          return {
            text,
            provider: 'nvidia',
            modelUsed: this.nvidiaModel,
            durationMs: Date.now() - start,
          };
        }
      } catch (err: any) {
        errors.push(`NVIDIA (${err.message})`);
        console.warn(`[MultiProviderLLM] NVIDIA API attempt failed: ${err.message}`);
      }
    }

    throw new Error(`All LLM providers failed: ${errors.join('; ')}`);
  }

  private async callOpenAICompatible(opts: {
    baseUrl: string;
    apiKey: string;
    model: string;
    messages: LLMMessage[];
    temperature: number;
    maxTokens: number;
    timeoutMs: number;
  }): Promise<string> {
    const res = await fetch(`${opts.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${opts.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: opts.model,
        messages: opts.messages,
        temperature: opts.temperature,
        max_tokens: opts.maxTokens,
      }),
      signal: AbortSignal.timeout(opts.timeoutMs),
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status}: ${errBody.slice(0, 300)}`);
    }

    const data: any = await res.json();
    const rawContent = data?.choices?.[0]?.message?.content;
    if (!rawContent || typeof rawContent !== 'string') {
      throw new Error('Empty response content received from API');
    }
    const content = rawContent
      .replace(/<think>[\s\S]*?<\/think>/gi, '')
      .replace(/<thought>[\s\S]*?<\/thought>/gi, '')
      .trim();
    if (!content) {
      throw new Error('Response content was empty after stripping reasoning tags');
    }
    return content;
  }

  private async callGemini(opts: {
    apiKey: string;
    model: string;
    messages: LLMMessage[];
    temperature: number;
    maxTokens?: number;
    timeoutMs: number;
  }): Promise<string> {
    const systemMsg = opts.messages.find((m) => m.role === 'system');
    const nonSystemMsgs = opts.messages.filter((m) => m.role !== 'system');

    const contents = nonSystemMsgs.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const payload: any = {
      contents,
      generationConfig: {
        temperature: opts.temperature,
        maxOutputTokens: opts.maxTokens ?? 4096,
      },
    };

    if (systemMsg) {
      payload.systemInstruction = {
        parts: [{ text: systemMsg.content }],
      };
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${opts.model}:generateContent?key=${opts.apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(opts.timeoutMs),
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status}: ${errBody.slice(0, 300)}`);
    }

    const data: any = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text || typeof text !== 'string') {
      throw new Error('Empty text content received from Gemini API');
    }
    return text.trim();
  }
}
