/**
 * ASTROWORLD — Deterministic Intent & Entity Classifier
 * Analyzes natural language questions to extract classical astrological intents,
 * target dates/timeframes, specific Grahas, Vargas, and required consultation depth.
 */

import { ExtractedEntities, IntentAnalysisResult, QueryDepth, UserIntent } from '../types.ts';
import { PlanetName, VargaCode, ZodiacSign } from '../../../../shared/index.ts';

const ALL_PLANETS: PlanetName[] = [
  'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu',
];

const ALL_ZODIAC_SIGNS: ZodiacSign[] = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

const MONTH_MAP: Record<string, number> = {
  january: 1, jan: 1,
  february: 2, feb: 2,
  march: 3, mar: 3,
  april: 4, apr: 4,
  may: 5,
  june: 6, jun: 6,
  july: 7, jul: 7,
  august: 8, aug: 8,
  september: 9, sep: 9, sept: 9,
  october: 10, oct: 10,
  november: 11, nov: 11,
  december: 12, dec: 12,
};

export function classifyUserQuestion(
  question: string,
  previousTimeframe?: string
): IntentAnalysisResult {
  const normalized = question.toLowerCase().trim();
  const allIntents = new Set<UserIntent>();

  // 1. Entities Extraction
  const entities: ExtractedEntities = {
    depth: 'ANALYSIS',
  };

  // Detect exact date request (e.g. "exact date", "exact day", "when exactly will")
  if (
    normalized.includes('exact date') ||
    normalized.includes('exact day') ||
    normalized.includes('exact time') ||
    normalized.includes('when exactly') ||
    normalized.includes('give me an exact')
  ) {
    entities.isExactDateRequested = true;
  }

  // Detect Planets mentioned
  const planetsFound: PlanetName[] = [];
  ALL_PLANETS.forEach((p) => {
    const regex = new RegExp(`\\b${p.toLowerCase()}\\b`, 'i');
    if (regex.test(normalized)) {
      planetsFound.push(p);
    }
  });
  if (planetsFound.length > 0) {
    entities.planetsMentioned = planetsFound;
  }

  // Detect Signs mentioned
  const signsFound: ZodiacSign[] = [];
  ALL_ZODIAC_SIGNS.forEach((s) => {
    const regex = new RegExp(`\\b${s.toLowerCase()}\\b`, 'i');
    if (regex.test(normalized)) {
      signsFound.push(s);
    }
  });
  if (signsFound.length > 0) {
    entities.signsMentioned = signsFound;
  }

  // Detect Vargas
  if (/\b(d9|navamsha|navamsa|navamsh)\b/i.test(normalized)) {
    entities.vargaCode = 'D9';
    allIntents.add('D9');
    allIntents.add('VARGA');
  } else if (/\b(d10|dashamsha|dasamsa|dashamsh)\b/i.test(normalized)) {
    entities.vargaCode = 'D10';
    allIntents.add('D10');
    allIntents.add('VARGA');
  } else if (/\b(d60|shashtiamsha|shashtyamsa)\b/i.test(normalized)) {
    entities.vargaCode = 'D60';
    allIntents.add('VARGA');
  } else if (/\b(d[0-9]+|divisional|varga|shodashavarga)\b/i.test(normalized)) {
    allIntents.add('VARGA');
  }

  // Detect Date & Timeframe Entities
  // Pattern A: "March 2027", "Feb 2027"
  const monthYearMatch = normalized.match(
    /\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)\s+(\d{4})\b/i
  );
  if (monthYearMatch) {
    const mStr = monthYearMatch[1].toLowerCase();
    const yNum = parseInt(monthYearMatch[2], 10);
    entities.targetMonth = MONTH_MAP[mStr];
    entities.targetYear = yNum;
    entities.timeframeDescription = `${monthYearMatch[1]} ${yNum}`;
    allIntents.add('TRANSITS_FUTURE');
  } else {
    // Pattern B: Just 4 digit Year e.g. "in 2027"
    const yearMatch = normalized.match(/\b(20\d\d)\b/);
    if (yearMatch) {
      entities.targetYear = parseInt(yearMatch[1], 10);
      entities.timeframeDescription = `Year ${yearMatch[1]}`;
      allIntents.add('TRANSITS_FUTURE');
    }

    // Pattern C: "next month", "this month", "next year"
    if (normalized.includes('next month')) {
      const now = new Date();
      const targetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      entities.targetMonth = targetDate.getMonth() + 1;
      entities.targetYear = targetDate.getFullYear();
      entities.timeframeDescription = 'Next Month';
      allIntents.add('TRANSITS_FUTURE');
    } else if (normalized.includes('this month') || normalized.includes('current month')) {
      const now = new Date();
      entities.targetMonth = now.getMonth() + 1;
      entities.targetYear = now.getFullYear();
      entities.timeframeDescription = 'Current Month';
      allIntents.add('TRANSITS_CURRENT');
    } else if (normalized.includes('next year')) {
      const now = new Date();
      entities.targetYear = now.getFullYear() + 1;
      entities.timeframeDescription = `Year ${now.getFullYear() + 1}`;
      allIntents.add('TRANSITS_FUTURE');
    } else if (normalized.includes('next') || normalized.includes('upcoming') || normalized.includes('soon')) {
      entities.timeframeDescription = 'Upcoming Window';
    }
  }

  // Inherit timeframe if follow-up
  if (!entities.timeframeDescription && previousTimeframe) {
    entities.timeframeDescription = previousTimeframe;
  }

  // 2. Intent Classification Rules
  // Dignity / Exaltation / Debilitation
  if (
    /\b(exalt|exalted|uchcha|debilitat|debilitated|neecha|moolatrikona|swakshetra|own sign|dignity)\b/i.test(
      normalized
    )
  ) {
    allIntents.add('DIGNITY');
    if (entities.vargaCode === 'D9') allIntents.add('D9');
    if (entities.vargaCode === 'D10') allIntents.add('D10');
  }

  // Transits (Gochara)
  if (/\b(transit|transits|gochar|gochara|movement|movements|sade sati|shani sade sati)\b/i.test(normalized)) {
    if (entities.targetYear || entities.targetMonth || entities.timeframeDescription) {
      allIntents.add('TRANSITS_FUTURE');
    } else {
      allIntents.add('TRANSITS_CURRENT');
    }
  }

  // Career & Profession
  if (
    /\b(career|job|profession|work|promotion|boss|business|employment|interview|offer|joining|hire|fired|vocation)\b/i.test(
      normalized
    )
  ) {
    allIntents.add('CAREER');
    allIntents.add('JOB');
    entities.topicArea = 'CAREER';
  }

  // Marriage & Relationships
  if (
    /\b(marriage|wedding|spouse|partner|husband|wife|relationship|love|divorce|milan|compatibility|vivah)\b/i.test(
      normalized
    )
  ) {
    allIntents.add('MARRIAGE');
    allIntents.add('RELATIONSHIP');
    entities.topicArea = 'MARRIAGE';
  }

  // Finance & Wealth
  if (
    /\b(money|wealth|finance|financial|property|gain|investment|dhana|assets|rich|loss|debt)\b/i.test(
      normalized
    )
  ) {
    allIntents.add('FINANCE');
    entities.topicArea = 'WEALTH';
  }

  // Health & Vitality
  if (/\b(health|disease|illness|vitality|longevity|injury|medical|surgery|ayur)\b/i.test(normalized)) {
    allIntents.add('HEALTH');
    entities.topicArea = 'HEALTH';
  }

  // Spirituality & Dharma
  if (
    /\b(spiritual|spirituality|moksha|dharma|meditation|guru|puja|temple|god|karma|past life)\b/i.test(
      normalized
    )
  ) {
    allIntents.add('SPIRITUALITY');
    entities.topicArea = 'SPIRITUAL';
  }

  // Dasha
  if (/\b(dasha|dasa|mahadasha|antardasha|pratyantar|bhukti|period|vimshottari)\b/i.test(normalized)) {
    allIntents.add('DASHA');
  }

  // Classical Yogas & Doshas
  if (/\b(yoga|yogas|raja yoga|dhana yoga|gajakesari|neechabhanga|viparita)\b/i.test(normalized)) {
    allIntents.add('YOGA');
  }
  if (/\b(dosha|doshas|mangal|manglik|kaal sarp|kalsarpa|pitra|sade sati)\b/i.test(normalized)) {
    allIntents.add('DOSHA');
  }

  // Jaimini
  if (
    /\b(jaimini|atmakaraka|amatyakaraka|darakaraka|chara karaka|karakamsa|arudha|arudha lagna|upapada)\b/i.test(
      normalized
    )
  ) {
    allIntents.add('JAIMINI');
  }

  // Strength / Shadbala / Ashtakavarga
  if (/\b(shadbala|strength|rupas|virupas|bala|digbala|sthanabala|ashtakavarga|bindus|sav|bav)\b/i.test(normalized)) {
    allIntents.add('STRENGTH');
  }

  // Remedies
  if (/\b(remedy|remedies|gemstone|gemstones|rudraksha|mantra|mantras|charity|donation|yantra)\b/i.test(normalized)) {
    allIntents.add('REMEDY');
  }

  // General Natal Positions
  if (
    /\b(my planets|planetary positions|natal chart|birth chart|where is|what are my|my ascendant|my lagna|planets)\b/i.test(
      normalized
    )
  ) {
    allIntents.add('PLANETS');
    allIntents.add('NATAL_CHART');
  }

  // Follow-up / Clarification
  if (
    /^(why|why\?|what about|compare|is this because|does it|how so|tell me more|what next|explain)\b/i.test(
      normalized
    )
  ) {
    allIntents.add('GENERAL_FOLLOWUP');
  }

  // 3. Determine Depth
  if (allIntents.has('DIGNITY') && planetsFound.length > 0 && !allIntents.has('CAREER') && !allIntents.has('MARRIAGE')) {
    entities.depth = 'FACT';
  } else if (allIntents.has('TRANSITS_FUTURE') && !allIntents.has('CAREER') && !allIntents.has('MARRIAGE')) {
    entities.depth = 'OVERVIEW';
  } else if (
    (allIntents.has('CAREER') || allIntents.has('MARRIAGE')) &&
    (allIntents.has('DASHA') || allIntents.has('TRANSITS_FUTURE') || allIntents.has('D10') || allIntents.has('D9'))
  ) {
    entities.depth = 'DEEP_CONSULTATION';
  } else {
    entities.depth = 'ANALYSIS';
  }

  // Default fallback
  if (allIntents.size === 0) {
    allIntents.add('GENERAL');
  }

  // Determine primary intent
  let primaryIntent: UserIntent = 'GENERAL';
  if (allIntents.has('CAREER')) primaryIntent = 'CAREER';
  else if (allIntents.has('MARRIAGE')) primaryIntent = 'MARRIAGE';
  else if (allIntents.has('TRANSITS_FUTURE')) primaryIntent = 'TRANSITS_FUTURE';
  else if (allIntents.has('TRANSITS_CURRENT')) primaryIntent = 'TRANSITS_CURRENT';
  else if (allIntents.has('DIGNITY')) primaryIntent = 'DIGNITY';
  else if (allIntents.has('DASHA')) primaryIntent = 'DASHA';
  else if (allIntents.has('YOGA')) primaryIntent = 'YOGA';
  else if (allIntents.has('JAIMINI')) primaryIntent = 'JAIMINI';
  else if (allIntents.has('REMEDY')) primaryIntent = 'REMEDY';
  else if (allIntents.has('PLANETS')) primaryIntent = 'PLANETS';
  else if (allIntents.has('GENERAL_FOLLOWUP')) primaryIntent = 'GENERAL_FOLLOWUP';
  else primaryIntent = Array.from(allIntents)[0];

  return {
    primaryIntent,
    allIntents: Array.from(allIntents),
    entities,
    confidence: 0.95,
  };
}
