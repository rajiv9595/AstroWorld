/**
 * ASTROWORLD AI V2 — Response Claim Extractor
 * Extracts atomic astrological entities, dates, houses, yogas, and certainty levels from generated prose.
 */

import { ExtractedResponseClaim } from '../schemas/responsePlan.ts';

const PLANET_NAMES = [
  'sun',
  'moon',
  'mars',
  'mercury',
  'jupiter',
  'venus',
  'saturn',
  'rahu',
  'ketu',
  'neptune',
  'uranus',
  'pluto',
  'chiron',
];

const YOGA_NAMES = [
  'gajakesari',
  'raja yoga',
  'dhana yoga',
  'hamsa yoga',
  'malavya yoga',
  'bhadra yoga',
  'ruchaka yoga',
  'sasa yoga',
  'kaal sarp',
  'manglik',
  'budhaditya',
  'neecha bhanga',
  'amatyakaraka',
  'atmakaraka',
];

const CERTAINTY_REGEX =
  /\b(guarantee|guaranteed|guarantees|definitely|certainly|100%\s*certain|must\s+happen|will\s+happen\s+for\s+sure|inevitable|without\s+a\s+doubt|unquestionably)\b/i;

export class ResponseClaimExtractor {
  /**
   * Parses prose into atomic claims and extracts mentioned astrological facts.
   */
  public extractClaims(generatedText: string): ExtractedResponseClaim[] {
    const claims: ExtractedResponseClaim[] = [];

    // Split into sentences
    const rawSentences = generatedText
      .split(/(?<=[.?!])\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 5);

    for (const sentence of rawSentences) {
      const lower = sentence.toLowerCase();

      // Extract Planets
      const planets: string[] = [];
      for (const p of PLANET_NAMES) {
        if (new RegExp(`\\b${p}\\b`, 'i').test(sentence)) {
          planets.push(p.charAt(0).toUpperCase() + p.slice(1));
        }
      }

      // Extract Houses
      const houses: number[] = [];
      const houseMatches = sentence.matchAll(/\b(1st|2nd|3rd|4th|5th|6th|7th|8th|9th|10th|11th|12th|\d{1,2}(?:th|st|nd|rd))\s+(?:house|bhava)\b/gi);
      for (const m of houseMatches) {
        const num = parseInt(m[1].replace(/\D/g, ''), 10);
        if (num >= 1 && num <= 12 && !houses.includes(num)) {
          houses.push(num);
        }
      }

      // Extract Yogas / Doshas
      const yogas: string[] = [];
      for (const y of YOGA_NAMES) {
        if (lower.includes(y)) {
          yogas.push(y);
        }
      }

      // Extract Dates (Years and Specific Dates)
      const referencedDates: string[] = [];
      const yearMatches = sentence.matchAll(/\b(19\d{2}|20\d{2})\b/g);
      for (const ym of yearMatches) {
        if (!referencedDates.includes(ym[1])) {
          referencedDates.push(ym[1]);
        }
      }

      const specificDateMatch = sentence.match(/\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}(?:st|nd|rd|th)?,\s+\d{4}\b/i);
      if (specificDateMatch) {
        referencedDates.push(specificDateMatch[0]);
      }

      // Determine Claim Type
      let claimType: 'factual' | 'interpretive' | 'timing' | 'prediction' | 'unverified' = 'interpretive';
      if (referencedDates.length > 0 || lower.includes('window') || lower.includes('period') || lower.includes('dasha')) {
        claimType = 'timing';
      } else if (planets.length > 0 && houses.length > 0) {
        claimType = 'factual';
      } else if (lower.includes('will') || lower.includes('indicate') || lower.includes('suggest') || lower.includes('support')) {
        claimType = 'prediction';
      }

      // Determine Certainty Level
      const isNegatedCertainty =
        /\b(no\s+.*(?:guarantee|guaranteed|certainty)|not\s+(?:guaranteed|certain|inevitable|fatalistic)|never\s+guaranteed|cannot\s+be\s+guaranteed|is\s+not\s+guaranteed)\b/i.test(sentence);
      const hasCertaintyKeyword = CERTAINTY_REGEX.test(sentence) && !isNegatedCertainty;
      const certaintyLevel = hasCertaintyKeyword ? 'certain' : 'probabilistic';

      const entities = [...planets, ...yogas];

      claims.push({
        claimText: sentence,
        claimType,
        referencedDates,
        planets,
        houses,
        yogas,
        entities,
        certaintyLevel,
      });
    }

    return claims;
  }
}
