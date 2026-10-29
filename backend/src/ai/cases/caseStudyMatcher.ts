/**
 * ASTROWORLD — Dynamic Chart-Twin Case Study Matcher
 * 
 * Ranks candidate empirical case studies against a native's active astrological
 * fingerprint using mathematical vector cosine similarity blended with Shastric
 * categorical congruence (Lagna triplicity, Dasha synergy, Yoga overlap, and
 * double-transit activation).
 */

import { NormalizedChartFingerprint, calculateCosineSimilarity } from './chartFingerprint.ts';
import { AstrologicalCaseStudyRecord, CaseStudyMatchResult, CaseStudyQueryFilter } from './caseStudyTypes.ts';

const ELEMENT_MAP: Record<string, 'Fire' | 'Earth' | 'Air' | 'Water'> = {
  Aries: 'Fire', Leo: 'Fire', Sagittarius: 'Fire',
  Taurus: 'Earth', Virgo: 'Earth', Capricorn: 'Earth',
  Gemini: 'Air', Libra: 'Air', Aquarius: 'Air',
  Cancer: 'Water', Scorpio: 'Water', Pisces: 'Water',
};

/**
 * Match and rank top empirical case twins for a given birth chart.
 */
export function matchCaseStudyTwins(
  nativeFingerprint: NormalizedChartFingerprint,
  candidates: AstrologicalCaseStudyRecord[],
  filter?: CaseStudyQueryFilter
): CaseStudyMatchResult[] {
  const results: CaseStudyMatchResult[] = [];
  const minSim = filter?.minSimilarity ?? 0.60;
  const limit = filter?.limit ?? 5;

  for (const candidate of candidates) {
    if (filter?.domain && candidate.domain !== filter.domain && candidate.domain !== 'general') {
      continue;
    }

    const cFp = candidate.chartFingerprint;
    const cosine = calculateCosineSimilarity(nativeFingerprint.embeddingVector, candidate.embeddingVector);

    let shastricScore = 0;
    const signatures: string[] = [];

    // 1. Lagna Alignment
    if (nativeFingerprint.lagnaSign === cFp.lagnaSign) {
      shastricScore += 0.25;
      signatures.push(`Identical ${nativeFingerprint.lagnaSign} Ascendant`);
    } else if (ELEMENT_MAP[nativeFingerprint.lagnaSign] === ELEMENT_MAP[cFp.lagnaSign]) {
      shastricScore += 0.12;
      signatures.push(`Harmonic ${ELEMENT_MAP[nativeFingerprint.lagnaSign]} element Ascendant (${cFp.lagnaSign})`);
    }

    // 2. Active Dasha Synergy
    if (nativeFingerprint.runningDasha.mahadasha === cFp.runningDasha.mahadasha) {
      shastricScore += 0.25;
      signatures.push(`Shared active ${nativeFingerprint.runningDasha.mahadasha} Mahadasha`);
      if (nativeFingerprint.runningDasha.antardasha === cFp.runningDasha.antardasha) {
        shastricScore += 0.15;
        signatures.push(`Identical ${nativeFingerprint.runningDasha.mahadasha}-${nativeFingerprint.runningDasha.antardasha} sub-period`);
      }
    }

    // 3. Jaimini Karaka Alignment
    if (nativeFingerprint.atmakaraka === cFp.atmakaraka) {
      shastricScore += 0.10;
      signatures.push(`Identical Atmakaraka (${nativeFingerprint.atmakaraka})`);
    }

    // 4. Shared Classical Yogas
    const nativeYogas = new Set(nativeFingerprint.activeYogas || []);
    const sharedYogas = (cFp.activeYogas || []).filter(y => nativeYogas.has(y));
    if (sharedYogas.length > 0) {
      shastricScore += Math.min(0.15, sharedYogas.length * 0.05);
      signatures.push(`Shared classical yogas: ${sharedYogas.slice(0, 2).join(', ')}`);
    }

    // 5. Double Transit Trigger Confluence
    const nativeDouble = nativeFingerprint.transitsAtEvent?.doubleTransitHouses || [];
    const candidateDouble = cFp.transitsAtEvent?.doubleTransitHouses || [];
    const sharedDouble = nativeDouble.filter(h => candidateDouble.includes(h));
    if (sharedDouble.length > 0) {
      shastricScore += 0.10;
      signatures.push(`Simultaneous double-transit activation on House ${sharedDouble.join(', ')}`);
    }

    // Combined Match Index (Weighted 60% Continuous Astronomical Vector + 40% Shastric Rules)
    const combined = Math.min(1.0, (cosine * 0.60) + (Math.min(1.0, shastricScore) * 0.40));
    const combinedIndex = Math.round(combined * 100);

    if (cosine >= minSim || combined >= minSim || shastricScore >= 0.25) {
      results.push({
        caseStudy: candidate,
        cosineSimilarity: Number(cosine.toFixed(4)),
        shastricCongruenceScore: Number(shastricScore.toFixed(4)),
        combinedMatchIndex: combinedIndex,
        matchingSignatures: signatures,
      });
    }
  }

  // Sort by highest combined match index descending
  results.sort((a, b) => b.combinedMatchIndex - a.combinedMatchIndex);

  return results.slice(0, limit);
}
