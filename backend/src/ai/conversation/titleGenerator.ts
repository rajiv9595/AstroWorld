/**
 * ASTROWORLD AI V2 — Smart Conversation Nickname / Title Generator
 * 
 * Generates concise, human-friendly 3–5 word chat nicknames (similar to ChatGPT and Gemini)
 * based on the user's initial inquiry and astrological context.
 */

import { GoogleGenAI } from '@google/genai';

const STOP_PATTERNS = [
  /^(can you\s+)?(please\s+)?(tell me\s+)?(about\s+)?/i,
  /^(when\s+(will|am|do)\s+i\s+(will\s+)?(get|receive|find|have|experience)\s+)/i,
  /^(what\s+(is|are)\s+my\s+)/i,
  /^(how\s+will\s+my\s+)/i,
  /^(how\s+is\s+my\s+)/i,
  /^(will\s+i\s+(ever\s+)?(get|be|have|find)\s+)/i,
  /^(is\s+there\s+any\s+chance\s+of\s+)/i,
  /^(explain\s+(to\s+me\s+)?)/i,
  /^(predict\s+my\s+)/i,
  /^(i\s+want\s+to\s+know\s+(about\s+)?)/i,
  /^(hello|hi|hey|good\s+morning|good\s+evening|namaste)\b/i,
];

function cleanTitleString(raw: string): string {
  let cleaned = raw
    .replace(/^["'`\s]+|["'`\s]+$/g, '')
    .replace(/[.?!,;:]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  // If longer than 45 chars, truncate gracefully at word boundary
  if (cleaned.length > 45) {
    const truncated = cleaned.slice(0, 42);
    const lastSpace = truncated.lastIndexOf(' ');
    cleaned = (lastSpace > 20 ? truncated.slice(0, lastSpace) : truncated) + '...';
  }

  // Capitalize words nicely
  return cleaned
    .split(' ')
    .map(word => {
      const lower = word.toLowerCase();
      if (['in', 'of', 'and', 'for', 'to', 'the', 'a', 'on', 'at', 'by', 'with'].includes(lower)) {
        return lower;
      }
      if (/^b\.?tech$/i.test(word)) return 'B.Tech';
      if (/^m\.?tech$/i.test(word)) return 'M.Tech';
      if (/^mba$/i.test(word)) return 'MBA';
      if (/^ai$/i.test(word)) return 'AI';
      if (/^d\d+$/i.test(word)) return word.toUpperCase();
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ')
    .replace(/^\w/, c => c.toUpperCase());
}

export function generateHeuristicNickname(userMessage: string, domain?: string): string {
  if (!userMessage || typeof userMessage !== 'string') {
    return 'Vedic Consultation';
  }

  const trimmed = userMessage.trim();
  const lower = trimmed.toLowerCase();

  // Check for greetings or trivial openers
  if (/^(hi|hello|hey|namaste|greetings)[\s!.]*$/i.test(trimmed)) {
    return 'Chart Consultation';
  }

  // Extract year if explicitly asked (e.g. 2026, 2027)
  const yearMatch = trimmed.match(/\b(202[4-9]|203\d)\b/);
  const yearSuffix = yearMatch ? ` (${yearMatch[1]})` : '';

  // Astrological entities
  const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
  const matchedPlanet = planets.find(p => new RegExp(`\\b${p}\\b`, 'i').test(trimmed));

  // Career patterns
  if (/\b(job\s+offer|first\s+job|campus|placement)\b/i.test(lower)) {
    if (/\bb\.?tech\b/i.test(lower)) return `B.Tech Job Offer${yearSuffix}`;
    return `First Job Offer${yearSuffix}`;
  }
  if (/\b(promotion|salary|increment|hike)\b/i.test(lower)) {
    return `Career Promotion & Growth${yearSuffix}`;
  }
  if (/\b(business|startup|entrepreneur|venture)\b/i.test(lower)) {
    return `Business & Venture Prospects${yearSuffix}`;
  }
  if (/\b(career|job|profession|employment|work)\b/i.test(lower)) {
    if (matchedPlanet) return `${matchedPlanet} Career Analysis${yearSuffix}`;
    return `Career Prospects${yearSuffix}`;
  }

  // Marriage & Relationship patterns
  if (/\b(marriage|wedding|married|marry|spouse|partner|husband|wife)\b/i.test(lower)) {
    if (/\b(timing|when|date|year|will|can)\b/i.test(lower)) {
      return `Marriage Timing${yearSuffix}`;
    }
    if (/\b(nature|characteristic|looks|profession|quality)\b/i.test(lower)) {
      return `Future Spouse Characteristics`;
    }
    return `Marriage & Relationship${yearSuffix}`;
  }
  if (/\b(love|affair|breakup|divorce|reconciliation)\b/i.test(lower)) {
    return `Relationship Analysis${yearSuffix}`;
  }

  // Health & Well-being
  if (/\b(health|disease|illness|surgery|mental|anxiety|stress|depression)\b/i.test(lower)) {
    return `Health & Vitality Analysis${yearSuffix}`;
  }

  // Wealth & Finance
  if (/\b(wealth|money|finance|debt|loan|stock|investment|property|house|vehicle)\b/i.test(lower)) {
    return `Wealth & Financial Growth${yearSuffix}`;
  }

  // Astrology concepts
  if (/\b(sade\s+sati|dhayya)\b/i.test(lower)) {
    return `Saturn Sade Sati Analysis`;
  }
  if (/\b(dasha|mahadasha|antardasha|pratyantardasha)\b/i.test(lower)) {
    if (matchedPlanet) return `${matchedPlanet} Dasha Analysis${yearSuffix}`;
    return `Dasha Period Analysis${yearSuffix}`;
  }
  if (/\b(kundli|kundali|horoscope|birth\s+chart|lagna|ascendant)\b/i.test(lower)) {
    return `Birth Chart Analysis${yearSuffix}`;
  }

  // Strip common leading question prefixes
  let stripped = trimmed;
  for (const pattern of STOP_PATTERNS) {
    stripped = stripped.replace(pattern, '');
  }
  stripped = stripped.trim();

  // If stripped text is clean and meaningful
  if (stripped.length >= 4) {
    const words = stripped.split(/\s+/).slice(0, 5);
    const candidate = words.join(' ');
    return cleanTitleString(candidate + yearSuffix);
  }

  // Fallback to domain
  if (domain && domain !== 'general') {
    return `${domain.charAt(0).toUpperCase() + domain.slice(1)} Consultation${yearSuffix}`;
  }

  return `Vedic Consultation${yearSuffix}`;
}

export async function generateConversationNickname(
  userMessage: string,
  domain?: string,
  options?: {
    apiKey?: string;
    model?: string;
    timeoutMs?: number;
  }
): Promise<string> {
  const heuristic = generateHeuristicNickname(userMessage, domain);

  const grokKey = process.env.GROK_API_KEY || process.env.GROQ_API_KEY;
  const geminiKey = options?.apiKey || process.env.GEMINI_API_KEY;
  if ((!grokKey && !geminiKey) || process.env.FORCE_MOCK_GEMINI === 'true') {
    return heuristic;
  }

  const timeoutMs = options?.timeoutMs ?? 2000;
  const prompt = `You are a chat title generator for an astrology consultation app.
Create a very short, natural, 3 to 5 word title/nickname for a chat thread started with this user inquiry:
"${userMessage}"

Rules:
1. Max 5 words.
2. No punctuation at the end. No quotes.
3. Include specific years or entities if mentioned (e.g. "B.Tech Job Offer 2027", "Saturn Sade Sati Analysis").
4. Return ONLY the title text, nothing else.`;

  // First try Grok if key is configured
  if (grokKey) {
    try {
      const grokModel = options?.model || process.env.GROK_PRIMARY_MODEL || 'qwen/qwen3.8-27b';
      const baseUrl = process.env.GROK_BASE_URL || 'https://api.groq.com/openai/v1';
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${grokKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: grokModel,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.2,
          max_tokens: 25,
        }),
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (res.ok) {
        const data: any = await res.json();
        const text = data?.choices?.[0]?.message?.content?.trim();
        if (text && text.length >= 3 && text.length <= 50) {
          return cleanTitleString(text);
        }
      }
    } catch {
      // Fallback
    }
  }

  if (geminiKey) {
    try {
      const modelName = options?.model || process.env.GEMINI_PRIMARY_MODEL || 'gemini-3.5-flash-lite';
      const aiClient = new GoogleGenAI({ apiKey: geminiKey });
      const titlePromise = aiClient.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          temperature: 0.2,
          maxOutputTokens: 20,
        },
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Title generation timed out')), timeoutMs)
      );

      const result = await Promise.race([titlePromise, timeoutPromise]);
      const text = result?.text?.trim();
      if (text && text.length >= 3 && text.length <= 50) {
        return cleanTitleString(text);
      }
    } catch {
      // Graceful fallback to heuristic
    }
  }

  return heuristic;
}
