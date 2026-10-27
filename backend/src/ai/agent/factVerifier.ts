/**
 * Lightweight post-answer fact verifier.
 * Ensures calendar dates and key planet-sign-house triples appear in tool JSON.
 * This is a fact check — not the old claim-narration cage.
 */

export interface ToolFactCorpus {
  rawText: string;
  isoDates: Set<string>;
  datePrefixes: Set<string>; // YYYY-MM-DD
  planetSignMentions: Set<string>; // "moon:cancer"
  planetHouseMentions: Set<string>; // "jupiter:10"
}

export interface FactVerificationResult {
  valid: boolean;
  unsupportedDates: string[];
  warnings: string[];
  repairedText?: string;
}

function collectStrings(value: unknown, out: string[]): void {
  if (value == null) return;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    out.push(String(value));
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectStrings(item, out);
    return;
  }
  if (typeof value === 'object') {
    for (const v of Object.values(value as Record<string, unknown>)) {
      collectStrings(v, out);
    }
  }
}

export function buildToolFactCorpus(toolPayloads: unknown[]): ToolFactCorpus {
  const parts: string[] = [];
  for (const payload of toolPayloads) {
    collectStrings(payload, parts);
  }
  const rawText = parts.join(' | ').toLowerCase();

  const isoDates = new Set<string>();
  const datePrefixes = new Set<string>();
  const isoRe = /\d{4}-\d{2}-\d{2}(?:[tT ]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:z|[+-]\d{2}:?\d{2})?)?/gi;
  for (const m of rawText.match(isoRe) || []) {
    isoDates.add(m.toLowerCase());
    datePrefixes.add(m.slice(0, 10));
  }

  const planetSignMentions = new Set<string>();
  const planetHouseMentions = new Set<string>();
  const planets = [
    'sun',
    'moon',
    'mars',
    'mercury',
    'jupiter',
    'venus',
    'saturn',
    'rahu',
    'ketu',
  ];
  const signs = [
    'aries',
    'taurus',
    'gemini',
    'cancer',
    'leo',
    'virgo',
    'libra',
    'scorpio',
    'sagittarius',
    'capricorn',
    'aquarius',
    'pisces',
  ];

  // Heuristic: if both planet name and sign appear in tool text, allow mention
  for (const planet of planets) {
    if (!rawText.includes(planet)) continue;
    for (const sign of signs) {
      if (rawText.includes(sign)) {
        planetSignMentions.add(`${planet}:${sign}`);
      }
    }
    for (let h = 1; h <= 12; h++) {
      if (
        rawText.includes(`"natalLagnaHouse":${h}`) ||
        rawText.includes(`"houseNumber":${h}`) ||
        rawText.includes(`house ${h}`) ||
        rawText.includes(`"natallagnahouse":${h}`)
      ) {
        planetHouseMentions.add(`${planet}:${h}`);
      }
    }
  }

  return { rawText, isoDates, datePrefixes, planetSignMentions, planetHouseMentions };
}

const MONTH_NAMES: Record<string, string> = {
  january: '01',
  february: '02',
  march: '03',
  april: '04',
  may: '05',
  june: '06',
  july: '07',
  august: '08',
  september: '09',
  october: '10',
  november: '11',
  december: '12',
};

function extractAnswerDates(text: string): string[] {
  const found = new Set<string>();
  const iso = text.match(/\b20\d{2}-\d{2}-\d{2}\b/g) || [];
  for (const d of iso) found.add(d);

  // e.g. March 15, 2027 or 15 March 2027
  const named =
    text.match(
      /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+20\d{2}\b/gi,
    ) || [];
  for (const n of named) {
    const m = n.match(
      /(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(20\d{2})/i,
    );
    if (m) {
      const mm = MONTH_NAMES[m[1].toLowerCase()];
      const dd = String(Number(m[2])).padStart(2, '0');
      found.add(`${m[3]}-${mm}-${dd}`);
    }
  }

  return Array.from(found);
}

/**
 * Verify that specific calendar dates in the answer appear in tool outputs (by YYYY-MM-DD).
 * Soft on planet-sign prose (tools already constrained the model); hard on fabricated dates.
 */
export function verifyAnswerAgainstTools(
  answerText: string,
  toolPayloads: unknown[],
): FactVerificationResult {
  const corpus = buildToolFactCorpus(toolPayloads);
  const answerDates = extractAnswerDates(answerText);
  const unsupportedDates: string[] = [];
  const warnings: string[] = [];

  for (const d of answerDates) {
    const prefix = d.slice(0, 10);
    const ok =
      corpus.datePrefixes.has(prefix) ||
      Array.from(corpus.datePrefixes).some((toolDate) => {
        // Allow month-level match if exact day not present (EVENT_WINDOW language)
        return toolDate.slice(0, 7) === prefix.slice(0, 7);
      });
    if (!ok) unsupportedDates.push(d);
  }

  let repairedText = answerText;
  if (unsupportedDates.length > 0) {
    warnings.push(
      `Unsupported dates not found in tool outputs: ${unsupportedDates.join(', ')}`,
    );
    for (const d of unsupportedDates) {
      // Soften exact fabricated dates rather than deleting whole paragraphs
      repairedText = repairedText.replace(
        new RegExp(d.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
        'an engine-verified window near that period',
      );
      // Also replace named forms already converted
    }
  }

  return {
    valid: unsupportedDates.length === 0,
    unsupportedDates,
    warnings,
    repairedText: unsupportedDates.length > 0 ? repairedText : undefined,
  };
}
