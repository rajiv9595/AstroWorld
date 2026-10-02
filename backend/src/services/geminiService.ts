import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

let cachedClient: GoogleGenAI | null = null;
let lastKey: string | undefined = undefined;

export function getAi(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!cachedClient || lastKey !== apiKey) {
    lastKey = apiKey;
    cachedClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return cachedClient;
}

// Backwards compatibility export
export const ai = getAi();
