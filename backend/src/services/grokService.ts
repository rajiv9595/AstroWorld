import dotenv from 'dotenv';

dotenv.config();

export interface GrokCompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
}

export class GrokService {
  private static instance: GrokService;
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string, baseUrl?: string) {
    this.apiKey = apiKey || process.env.GROK_API_KEY || process.env.GROQ_API_KEY || '';
    this.baseUrl = baseUrl || process.env.GROK_BASE_URL || 'https://api.groq.com/openai/v1';
  }

  public static getInstance(): GrokService {
    if (!GrokService.instance) {
      GrokService.instance = new GrokService();
    }
    return GrokService.instance;
  }

  public isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  public async completeChat(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    options?: GrokCompletionOptions
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Grok/Groq API key is not configured. Set GROK_API_KEY or GROQ_API_KEY.');
    }

    const model = options?.model || process.env.GROK_PRIMARY_MODEL || 'qwen/qwen3.8-27b';
    const temperature = options?.temperature ?? 0.65;
    const timeoutMs = options?.timeoutMs ?? 8000;

    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: options?.maxTokens,
      }),
      signal: AbortSignal.timeout(timeoutMs),
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      throw new Error(`Grok API error HTTP ${res.status}: ${errBody}`);
    }

    const data: any = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('Grok API returned empty completion text');
    }

    return content.trim();
  }
}

export function getGrok(): GrokService {
  return GrokService.getInstance();
}
