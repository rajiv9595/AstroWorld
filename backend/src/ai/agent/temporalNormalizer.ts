/**
 * NLP temporal-scope normalizer for consult questions.
 * Maps phrases like "soon", "this year", "next few years" into concrete ISO windows.
 */

export interface TemporalWindow {
  fromIso: string;
  toIso: string;
  label: string;
  source: 'explicit' | 'phrase' | 'default';
  disclosedNote: string;
}

const MS_DAY = 86400000;

function startOfUtcDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function addDays(d: Date, days: number): Date {
  return new Date(d.getTime() + days * MS_DAY);
}

function addMonths(d: Date, months: number): Date {
  const out = new Date(d.getTime());
  out.setUTCMonth(out.getUTCMonth() + months);
  return out;
}

/**
 * Normalize natural-language time references into [from, to] UTC ISO bounds.
 */
export function normalizeTemporalScope(
  question: string,
  now: Date = new Date(),
  birthYear?: number,
): TemporalWindow {
  const lower = (question || '').toLowerCase();
  const from = startOfUtcDay(now);

  // 1. Age-based queries (e.g., "when I am 28", "at age 30", "when I turn 25", "in my 32nd year")
  if (birthYear) {
    const ageMatch = lower.match(/\b(?:at\s+age|when\s+i\s+am|when\s+i\s+turn|in\s+my|at\s+my)\s*(\d{1,2})(?:th|st|nd|rd)?(?:\s*years?\s*old|\s*year|\s*years)?\b/i) || lower.match(/\bage\s*(\d{1,2})\b/i);
    if (ageMatch) {
      const targetAge = parseInt(ageMatch[1], 10);
      if (targetAge > 0 && targetAge <= 120) {
        const targetYear = birthYear + targetAge;
        const fromIso = new Date(Date.UTC(targetYear, 0, 1)).toISOString();
        const toIso = new Date(Date.UTC(targetYear, 11, 31, 23, 59, 59)).toISOString();
        return {
          fromIso,
          toIso,
          label: `Age ${targetAge} (Year ${targetYear})`,
          source: 'explicit',
          disclosedNote: `Targeting Age ${targetAge} (calendar year ${targetYear}).`,
        };
      }
    }
  }

  // 1b. Range queries starting from "next month" / "now" / "today" up to a target month & year
  // e.g. "from next month to feb 2027", "next month to feb 2027", "from now until feb 2027", "upto feb 2027", "till feb 2027"
  const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  const rangeFromNextMonthMatch = lower.match(/\b(?:from\s+)?(?:next\s+month|now|today|current\s+time)\s+(?:to|until|till|through|upto)\s+(?:the\s+end\s+of\s+)?(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)?\s*(\d{4})\b/i);
  if (rangeFromNextMonthMatch) {
    const rawMonth = rangeFromNextMonthMatch[1];
    const y = parseInt(rangeFromNextMonthMatch[2], 10);
    const mIdx = rawMonth ? monthNames.findIndex((m) => rawMonth.toLowerCase().startsWith(m)) : 11;
    if (y >= 1950 && y <= 2100) {
      const isNextMonth = lower.includes('next month');
      const startD = isNextMonth ? addMonths(from, 1) : from;
      const endD = new Date(Date.UTC(y, (mIdx >= 0 ? mIdx : 11) + 1, 0, 23, 59, 59));
      const mLabel = rawMonth ? (rawMonth.charAt(0).toUpperCase() + rawMonth.slice(1).toLowerCase()) : '';
      return {
        fromIso: startD.toISOString(),
        toIso: endD.toISOString(),
        label: isNextMonth ? `Next Month to ${mLabel} ${y}`.trim() : `Today to ${mLabel} ${y}`.trim(),
        source: 'explicit',
        disclosedNote: `Covering the full upcoming trajectory from ${isNextMonth ? 'next month' : 'today'} through ${mLabel} ${y}.`,
      };
    }
  }

  // 1c. Range queries with "upto", "up to", "till", "until" followed by Month + Year
  const rangeUptoMonthMatch = lower.match(/\b(?:upto|up\s+to|till|until|through)\s+(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)\s*(\d{4})\b/i);
  if (rangeUptoMonthMatch) {
    const rawMonth = rangeUptoMonthMatch[1];
    const y = parseInt(rangeUptoMonthMatch[2], 10);
    const mIdx = monthNames.findIndex((m) => rawMonth.toLowerCase().startsWith(m));
    if (mIdx >= 0 && y >= 1950 && y <= 2100) {
      const endD = new Date(Date.UTC(y, mIdx + 1, 0, 23, 59, 59));
      return {
        fromIso: from.toISOString(),
        toIso: endD.toISOString(),
        label: `Today to ${rawMonth} ${y}`,
        source: 'explicit',
        disclosedNote: `Covering the entire upcoming timeframe from today through ${rawMonth} ${y}.`,
      };
    }
  }

  // 1d. Range queries between two explicit month-year dates
  const rangeBetweenMonthsMatch = lower.match(/\b(?:from|between)\s+(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)\s*(\d{4})?\s+(?:to|until|till|and)\s+(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)\s+(\d{4})\b/i);
  if (rangeBetweenMonthsMatch) {
    const m1Str = rangeBetweenMonthsMatch[1];
    const m2Str = rangeBetweenMonthsMatch[3];
    const y2 = parseInt(rangeBetweenMonthsMatch[4], 10);
    const y1 = rangeBetweenMonthsMatch[2] ? parseInt(rangeBetweenMonthsMatch[2], 10) : now.getUTCFullYear();
    const m1Idx = monthNames.findIndex((m) => m1Str.toLowerCase().startsWith(m));
    const m2Idx = monthNames.findIndex((m) => m2Str.toLowerCase().startsWith(m));
    if (m1Idx >= 0 && m2Idx >= 0 && y2 >= 1950 && y2 <= 2100) {
      const startD = new Date(Date.UTC(y1, m1Idx, 1));
      const endD = new Date(Date.UTC(y2, m2Idx + 1, 0, 23, 59, 59));
      return {
        fromIso: startD.toISOString(),
        toIso: endD.toISOString(),
        label: `${m1Str} ${y1} to ${m2Str} ${y2}`,
        source: 'explicit',
        disclosedNote: `Covering the full multi-year period from ${m1Str} ${y1} to ${m2Str} ${y2}.`,
      };
    }
  }

  // 2. Month + Year queries (e.g. "November 2026", "March 2028", "January 2030")
  const monthYearMatch = lower.match(/\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)\b\s*(\d{4})/i);
  if (monthYearMatch) {
    const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const mIdx = monthNames.findIndex((m) => monthYearMatch[1].toLowerCase().startsWith(m));
    const y = parseInt(monthYearMatch[2], 10);
    if (mIdx >= 0 && y >= 1950 && y <= 2100) {
      const fromIso = new Date(Date.UTC(y, mIdx, 1)).toISOString();
      const toIso = new Date(Date.UTC(y, mIdx + 1, 0, 23, 59, 59)).toISOString();
      return {
        fromIso,
        toIso,
        label: `${monthYearMatch[1]} ${y}`,
        source: 'explicit',
        disclosedNote: `Using calendar month ${monthYearMatch[1]} ${y}.`,
      };
    }
  }

  // 3. Explicit year ranges: 2026-2028, 2028 to 2032, 2018-2022
  const yearRange = lower.match(/\b(19\d{2}|20\d{2})\s*[-–to]+\s*(19\d{2}|20\d{2})\b/);
  if (yearRange) {
    const y1 = Number(yearRange[1]);
    const y2 = Number(yearRange[2]);
    const a = Math.min(y1, y2);
    const b = Math.max(y1, y2);
    const fromIso = new Date(Date.UTC(a, 0, 1)).toISOString();
    const toIso = new Date(Date.UTC(b, 11, 31, 23, 59, 59)).toISOString();
    return {
      fromIso,
      toIso,
      label: `${a}–${b}`,
      source: 'explicit',
      disclosedNote: `Using explicit calendar window ${a}–${b}.`,
    };
  }

  // 4. Single past or future year: in 2028, in 2030, in 2018, during 2021
  const singleYear = lower.match(/\bin\s+(19\d{2}|20\d{2})\b/) || lower.match(/\b(19\d{2}|20\d{2})\b/);
  if (singleYear) {
    const y = Number(singleYear[1]);
    if (y >= 1950 && y <= 2100) {
      const fromIso = new Date(Date.UTC(y, 0, 1)).toISOString();
      const toIso = new Date(Date.UTC(y, 11, 31, 23, 59, 59)).toISOString();
      return {
        fromIso,
        toIso,
        label: String(y),
        source: 'explicit',
        disclosedNote: `Using calendar year ${y}.`,
      };
    }
  }

  // Months
  const monthsMatch = lower.match(/\b(?:next|coming|in the next)\s+(\d+)\s+months?\b/);
  if (monthsMatch) {
    const n = Math.min(60, Math.max(1, Number(monthsMatch[1])));
    const to = addMonths(from, n);
    return {
      fromIso: from.toISOString(),
      toIso: to.toISOString(),
      label: `next ${n} months`,
      source: 'phrase',
      disclosedNote: `Scanning the next ${n} months from today.`,
    };
  }

  const yearsMatch = lower.match(/\b(?:next|coming|in the next)\s+(\d+)\s+years?\b/);
  if (yearsMatch) {
    const n = Math.min(5, Math.max(1, Number(yearsMatch[1])));
    const to = addMonths(from, n * 12);
    return {
      fromIso: from.toISOString(),
      toIso: to.toISOString(),
      label: `next ${n} year(s)`,
      source: 'phrase',
      disclosedNote: `Scanning the next ${n} year(s) from today.`,
    };
  }

  if (/\b(this year|current year)\b/.test(lower)) {
    const y = now.getUTCFullYear();
    return {
      fromIso: from.toISOString(),
      toIso: new Date(Date.UTC(y, 11, 31, 23, 59, 59)).toISOString(),
      label: `rest of ${y}`,
      source: 'phrase',
      disclosedNote: `Using the remainder of calendar year ${y}.`,
    };
  }

  if (/\b(next year)\b/.test(lower)) {
    const y = now.getUTCFullYear() + 1;
    return {
      fromIso: new Date(Date.UTC(y, 0, 1)).toISOString(),
      toIso: new Date(Date.UTC(y, 11, 31, 23, 59, 59)).toISOString(),
      label: String(y),
      source: 'phrase',
      disclosedNote: `Using calendar year ${y}.`,
    };
  }

  if (/\b(soon|near future|upcoming|coming months?)\b/.test(lower)) {
    const to = addDays(from, 90);
    return {
      fromIso: from.toISOString(),
      toIso: to.toISOString(),
      label: 'next 90 days',
      source: 'phrase',
      disclosedNote: 'Interpreting "soon" as the next 90 days.',
    };
  }

  if (/\b(this month)\b/.test(lower)) {
    const y = now.getUTCFullYear();
    const m = now.getUTCMonth();
    const to = new Date(Date.UTC(y, m + 1, 0, 23, 59, 59));
    return {
      fromIso: from.toISOString(),
      toIso: to.toISOString(),
      label: 'rest of this month',
      source: 'phrase',
      disclosedNote: 'Using the remainder of the current calendar month.',
    };
  }

  // Unbounded future / "when will I marry" / "is it possible in future"
  const unbounded =
    /\b(when will|will i|is it possible|any time|in (the )?future|ever|someday|near dates?|months? or years?)\b/.test(
      lower,
    ) ||
    /\b(marriage|marry|career|job|promote|pregnancy|child|foreign|travel)\b/.test(lower);

  if (unbounded || /\b(timing|period|window|muhurat)\b/.test(lower)) {
    const to = addMonths(from, 36);
    return {
      fromIso: from.toISOString(),
      toIso: to.toISOString(),
      label: 'next 36 months (default)',
      source: 'default',
      disclosedNote:
        'No explicit end date was given; defaulting to a 36-month scan window and disclosing it in the answer.',
    };
  }

  // Non-timing questions: still provide a short default for optional transit context
  const to = addDays(from, 30);
  return {
    fromIso: from.toISOString(),
    toIso: to.toISOString(),
    label: 'next 30 days (context)',
    source: 'default',
    disclosedNote: 'No strong timing phrase detected; a 30-day transit context is available if needed.',
  };
}

export function formatTemporalNote(window: TemporalWindow): string {
  return `${window.disclosedNote} Window: ${window.fromIso.slice(0, 10)} → ${window.toIso.slice(0, 10)} (${window.label}).`;
}
