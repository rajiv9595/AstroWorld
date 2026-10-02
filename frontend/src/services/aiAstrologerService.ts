/**
 * ASTROWORLD — Grounded AI Astrologer Client Service
 * Communicates with backend endpoints (/api/ai/interpret, /api/ai/chat, /api/ai/tts).
 */

import { AIInterpretationContext } from '../engine/types.ts';

export interface ConsultationResponse {
  success: boolean;
  synthesis: string;
  source: string;
  suggestedQuestions?: string[];
  summaryHUD?: {
    lagna: string;
    nakshatra: string;
    moonSign: string;
    sunSign: string;
    currentDasha: string;
    dashaEnd: string;
    atmakaraka: string;
    karakamsa: string;
    sadeSati: string;
    topYogas: string[];
  };
  error?: string;
}

export interface ChatReplyResponse {
  success: boolean;
  reply: string;
  suggestedQuestions?: string[];
  error?: string;
}

export interface AudioTTSResponse {
  success: boolean;
  audioBase64?: string;
  mimeType?: string;
  error?: string;
}

export interface SavedConsultationItem {
  id: string;
  domain: string;
  query: string;
  synthesis: string;
  source: string;
  created_at: string;
}

export async function requestConsultation(
  context: AIInterpretationContext,
  domain: string = 'COMPREHENSIVE',
  query?: string,
  userId?: string,
  chartId?: string
): Promise<ConsultationResponse> {
  const res = await fetch('/api/ai/interpret', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      context,
      domain,
      query: query || '',
      userId,
      chartId,
    }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Consultation request failed with status ${res.status}`);
  }

  return await res.json();
}

export async function sendAstrologerMessage(
  context: AIInterpretationContext,
  message: string,
  history: Array<{ role: 'user' | 'model'; parts?: Array<{ text: string }>; text?: string }>
): Promise<ChatReplyResponse> {
  const res = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      context,
      message,
      history,
    }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Astrologer chat failed with status ${res.status}`);
  }

  return await res.json();
}

export async function requestAstrologerAudio(
  text: string,
  voice: 'Fenrir' | 'Kore' | 'Zephyr' | 'Charon' = 'Fenrir'
): Promise<AudioTTSResponse> {
  const res = await fetch('/api/ai/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, voice }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Audio synthesis unavailable');
  }

  return await res.json();
}

export async function fetchUserConsultationHistory(
  userId: string
): Promise<SavedConsultationItem[]> {
  try {
    const res = await fetch(`/api/ai/history/${encodeURIComponent(userId)}`);
    const data = await res.json();
    return data.consultations || [];
  } catch (err) {
    console.warn('Consultation history fetch notice:', err);
    return [];
  }
}
