/**
 * ASTROWORLD AI V2 — Fine-Tuning Dataset Schemas
 * Standard data exchange schemas for training and fine-tuning proprietary AI models:
 * - OpenAI Chat Completion JSONL format
 * - Google Gemini Tuning JSONL format
 * - Llama-3 / Alpaca Instruct JSONL format
 */

export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenAITrainingSample {
  messages: OpenAIMessage[];
}

export interface GeminiContentPart {
  text: string;
}

export interface GeminiContentItem {
  role: 'user' | 'model';
  parts: GeminiContentPart[];
}

export interface GeminiTrainingSample {
  systemInstruction?: {
    parts: GeminiContentPart[];
  };
  contents: GeminiContentItem[];
}

export interface Llama3InstructSample {
  instruction: string;
  input: string;
  output: string;
  systemPrompt?: string;
}

export interface MasterAstrologyExample {
  id: string;
  domain: 'career' | 'relationship' | 'finance' | 'timing' | 'health_vitality' | 'spirituality' | 'remedies_purushartha';
  title: string;
  userQuestion: string;
  birthProfileSummary: string;
  astrologicalContext: {
    ascendant: string;
    moonSign: string;
    sunSign: string;
    activeDasha: string;
    keyPlacements: string[];
    transits: string[];
    yogas?: string[];
  };
  systemInstruction: string;
  idealResponse: string;
  astrologicalRationale: string;
  qualityReview: {
    answerFirst: boolean;
    empathyScore: number; // 1-5
    depthScore: number; // 1-5
    groundingVerified: boolean;
  };
}
