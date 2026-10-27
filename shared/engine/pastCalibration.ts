/**
 * ASTROWORLD — Past Calibration Engine (The Daivajna Anchor)
 * Scans the native's historical Vimshottari Dasha transitions and Gochara transits
 * across the past 3 to 10 years to identify defining life milestones and karmic pivots.
 * 
 * Used by the AI Astrologer to calibrate chart accuracy and anchor readings in proven past reality.
 */

import { calculateVimshottariDasha } from './dasha.ts';
import { PlanetName } from './types.ts';

export interface PastMilestoneAnchor {
  periodLabel: string;
  startDateIso: string;
  endDateIso: string;
  mahadashaLord: PlanetName;
  antardashaLord: PlanetName;
  archetype: 'STRUCTURAL_TEST' | 'EXPANSION_ELEVATION' | 'RADICAL_PIVOT' | 'DETACHMENT_REORIENTATION' | 'RELATIONSHIP_FAMILY' | 'AMBITION_FRICTION';
  theme: string;
  astrologicalBasis: string;
  calibrationStatement: string;
}

export interface PastCalibrationResult {
  evaluationDateIso: string;
  lookbackYears: number;
  milestones: PastMilestoneAnchor[];
  leadCalibrationSummary: string;
}

const ARCHETYPE_MAP: Record<string, {
  archetype: PastMilestoneAnchor['archetype'];
  theme: string;
  narrative: (md: string, ad: string) => string;
}> = {
  'Rahu/Saturn': {
    archetype: 'STRUCTURAL_TEST',
    theme: 'Heavy Karmic Restructuring & Reality Check',
    narrative: (md, ad) =>
      `A period marked by heavy professional weight, unsparing reality checks, and dismantling illusions, compelling you to rebuild with deep self-discipline.`
  },
  'Saturn/Rahu': {
    archetype: 'STRUCTURAL_TEST',
    theme: 'Unconventional Ambition Meets Karmic Law',
    narrative: (md, ad) =>
      `A testing phase of abrupt shifts, psychological endurance, and navigating unchartered professional territory under demanding pressure.`
  },
  'Jupiter/Saturn': {
    archetype: 'STRUCTURAL_TEST',
    theme: 'Philosophical Realignment & Career Maturation',
    narrative: (md, ad) =>
      `A pivotal phase of reconciling idealism with harsh practical realities; restructuring long-term goals and accepting heavier accountability.`
  },
  'Saturn/Jupiter': {
    archetype: 'EXPANSION_ELEVATION',
    theme: 'Harvest of Hard Labor & Emerging Relief',
    narrative: (md, ad) =>
      `Light emerging after a prolonged period of grinding effort; wisdom gained through trials translating into newfound authority or renewed guidance.`
  },
  'Rahu/Jupiter': {
    archetype: 'EXPANSION_ELEVATION',
    theme: 'Material Expansion & Broadening Horizons',
    narrative: (md, ad) =>
      `An expansive, ambitious window of expanding personal or professional horizons, though requiring care not to overextend beyond realistic limits.`
  },
  'Jupiter/Venus': {
    archetype: 'RELATIONSHIP_FAMILY',
    theme: 'Major Auspicious Milestones & Material Comfort',
    narrative: (md, ad) =>
      `A period favoring emotional relationships, domestic enrichment, financial recovery, or artistic and aesthetic fulfillment.`
  },
  'Venus/Jupiter': {
    archetype: 'EXPANSION_ELEVATION',
    theme: 'Grace, Social Elevation & Financial Progress',
    narrative: (md, ad) =>
      `Confluence of the two prime benefics; marked by improved public respect, financial opportunities, and constructive mentorship.`
  },
  'Ketu/Saturn': {
    archetype: 'DETACHMENT_REORIENTATION',
    theme: 'Spiritual Purging & Release of Old Identity',
    narrative: (md, ad) =>
      `An emotionally solitary phase of shedding outdated commitments, encountering sudden delays, and seeking deeper inner purpose over external validation.`
  },
  'Saturn/Ketu': {
    archetype: 'DETACHMENT_REORIENTATION',
    theme: 'Karmic Severance & Solitary Endurance',
    narrative: (md, ad) =>
      `A cycle of intense inward focus, pruning stagnant relationships or career paths, and enduring trials with quiet fortitude.`
  },
  'Mars/Rahu': {
    archetype: 'AMBITION_FRICTION',
    theme: 'Angaraka Energy — Intense Ambition & Conflict',
    narrative: (md, ad) =>
      `High-voltage drive and volatile ambition; a window characterized by abrupt changes, risk-taking, or defending your ground against friction.`
  },
  'Rahu/Mars': {
    archetype: 'AMBITION_FRICTION',
    theme: 'Urgent Action & Risk of Burnout',
    narrative: (md, ad) =>
      `Furious momentum combined with heightened impulsiveness; navigating sudden crises or competitive environments requiring calm vigilance.`
  },
  'Sun/Saturn': {
    archetype: 'STRUCTURAL_TEST',
    theme: 'Authority Confrontation & Identity Trial',
    narrative: (md, ad) =>
      `Friction with authority figures or heavy scrutiny of your self-worth; learning that true respect is earned through humility and endurance.`
  },
  'Saturn/Sun': {
    archetype: 'STRUCTURAL_TEST',
    theme: 'Responsibility and Public Accountability',
    narrative: (md, ad) =>
      `Standing under the spotlight of scrutiny; enduring rigid professional expectations to establish lasting credibility.`
  },
  'Moon/Rahu': {
    archetype: 'RADICAL_PIVOT',
    theme: 'Psychological Turbulence & Emotional Restlessness',
    narrative: (md, ad) =>
      `Heightened emotional sensitivity, restlessness, or sudden environmental relocations that challenged your sense of inner equilibrium.`
  },
};

/**
 * Calibrates past life milestones from the native's chart over the past 3 to 8 years.
 */
export function calibratePastMilestones(
  moonSiderealLon: number,
  birthDateUtc: Date,
  evaluationDateUtc: Date = new Date(),
  lookbackYears: number = 7
): PastCalibrationResult {
  const dashaFacts = calculateVimshottariDasha(moonSiderealLon, birthDateUtc, evaluationDateUtc);

  const evalMs = evaluationDateUtc.getTime();
  const lookbackMs = evalMs - lookbackYears * 365.25 * 86400000;

  const milestones: PastMilestoneAnchor[] = [];

  // 1. Inspect all Antardashas within the lookback window
  for (const md of dashaFacts.mahadashas) {
    for (const ad of md.antardashas) {
      const adStartMs = new Date(ad.period.startDateIso).getTime();
      const adEndMs = new Date(ad.period.endDateIso).getTime();

      // Overlaps with the lookback window AND has concluded or is mostly past
      if (adEndMs >= lookbackMs && adStartMs < evalMs) {
        const mdLord = ad.period.lord;
        const adLord = ad.period.subLord || mdLord;
        const pairKey = `${mdLord}/${adLord}`;

        const startYr = new Date(adStartMs).getFullYear();
        const endYr = new Date(adEndMs).getFullYear();
        const startMo = (new Date(adStartMs).getMonth() + 1).toString().padStart(2, '0');
        const endMo = (new Date(adEndMs).getMonth() + 1).toString().padStart(2, '0');
        const periodLabel = `${startYr}-${startMo} → ${endYr}-${endMo}`;

        const mapped = ARCHETYPE_MAP[pairKey];
        if (mapped) {
          milestones.push({
            periodLabel,
            startDateIso: ad.period.startDateIso,
            endDateIso: ad.period.endDateIso,
            mahadashaLord: mdLord,
            antardashaLord: adLord,
            archetype: mapped.archetype,
            theme: mapped.theme,
            astrologicalBasis: `${mdLord} Mahadasha – ${adLord} Antardasha`,
            calibrationStatement: mapped.narrative(mdLord, adLord),
          });
        } else {
          // Generic archetype based on lords
          const isBeneficPair = (mdLord === 'Jupiter' || mdLord === 'Venus' || mdLord === 'Mercury') &&
                               (adLord === 'Jupiter' || adLord === 'Venus' || adLord === 'Mercury');
          const isMaleficPair = (mdLord === 'Saturn' || mdLord === 'Rahu' || mdLord === 'Mars' || mdLord === 'Ketu') &&
                               (adLord === 'Saturn' || adLord === 'Rahu' || adLord === 'Mars' || adLord === 'Ketu');

          milestones.push({
            periodLabel,
            startDateIso: ad.period.startDateIso,
            endDateIso: ad.period.endDateIso,
            mahadashaLord: mdLord,
            antardashaLord: adLord,
            archetype: isMaleficPair ? 'STRUCTURAL_TEST' : (isBeneficPair ? 'EXPANSION_ELEVATION' : 'RADICAL_PIVOT'),
            theme: `${mdLord}/${adLord} Sub-Period Transition`,
            astrologicalBasis: `${mdLord} Mahadasha – ${adLord} Antardasha`,
            calibrationStatement: isMaleficPair
              ? `A period of steady patience and endurance where responsibilities required your full mental focus and grit.`
              : (isBeneficPair
                ? `A constructive cycle of intellectual expansion, social goodwill, and building favorable connections.`
                : `A transition phase balancing ${mdLord}'s broader life direction with ${adLord}'s immediate operational priorities.`),
          });
        }
      }
    }
  }

  // Pick top 2 most prominent past anchors (favoring defining archetypes)
  const prioritized = [...milestones].sort((a, b) => {
    const score = (m: PastMilestoneAnchor) => {
      if (m.archetype === 'STRUCTURAL_TEST') return 3;
      if (m.archetype === 'EXPANSION_ELEVATION') return 2;
      return 1;
    };
    return score(b) - score(a);
  });

  const selected = prioritized.slice(0, 3);

  let leadSummary = '';
  if (selected.length > 0) {
    const primary = selected[0];
    leadSummary = `Between ${primary.periodLabel} during your ${primary.astrologicalBasis}, you underwent a period of ${primary.theme.toLowerCase()} (${primary.calibrationStatement}).`;
  }

  return {
    evaluationDateIso: evaluationDateUtc.toISOString(),
    lookbackYears,
    milestones: selected,
    leadCalibrationSummary: leadSummary,
  };
}
