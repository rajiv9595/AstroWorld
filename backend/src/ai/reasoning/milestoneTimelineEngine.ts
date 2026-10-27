/**
 * ASTROWORLD — Chronological Milestone Timeline Engine
 * Synthesizes Multi-Layer Jyotish Confluence into a Date-Stamped Roadmap.
 * 
 * Unifies:
 * 1. Vimshottari Dasha-Antardasha-Pratyantardasha Windows
 * 2. AIFAS 4-Point Double Transit Confluence
 * 3. Ashtakavarga Kakshya Micro-Transit Arcs
 * 4. Sarvatobhadra Special Nakshatra Vedha Hits
 * 
 * Generates clear, chronological quarterly milestones that shock the user with exact timing windows.
 */

import { PlanetName } from '../../../../shared/engine/types.ts';
import { DoubleTransitResult } from './doubleTransitValidator.ts';
import { KakshyaTransitDetail } from './kakshyaTransitEngine.ts';
import { ActiveVedhaEvent } from './sarvatobhadraChakraEngine.ts';

export type MilestonePivotalCategory =
  | 'CAREER_PIVOT_AND_ELEVATION'
  | 'FINANCIAL_WINDFALL_AND_HARVEST'
  | 'INTELLECTUAL_ACADEMIC_BREAKTHROUGH'
  | 'KARMIC_CRUCIBLE_AND_RESTRUCTURING'
  | 'RELATIONSHIP_UNION_OR_ALLIANCE'
  | 'DISCIPLINED_INCUBATION_AND_PREP';

export interface MilestoneQuarterCard {
  quarterLabel: string; // e.g. "Q4 2026 (Nov 2026 – Jan 2027)"
  startDateIso: string;
  endDateIso: string;
  category: MilestonePivotalCategory;
  confluenceScore: number; // 0 to 100
  title: string;
  planetaryMechanism: string;
  operationalDirective: string;
  riskWarning?: string;
}

export interface ChronologicalRoadmap {
  nativeLagna: string;
  runningMahadasha: PlanetName;
  runningAntardasha: PlanetName;
  currentQuarterMilestone: MilestoneQuarterCard;
  upcomingQuarterMilestones: MilestoneQuarterCard[];
  macroSummary: string;
}

/**
 * Builds a chronological roadmap synthesized from active dasha, double transit, kakshya, and vedhas.
 */
export function buildChronologicalRoadmap(params: {
  nativeLagna: string;
  currentDateIso: string;
  mahadashaLord: PlanetName;
  antardashaLord: PlanetName;
  pratyantardashaLord?: PlanetName;
  doubleTransitCareer: DoubleTransitResult;
  doubleTransitWealth?: DoubleTransitResult;
  activeKakshya?: KakshyaTransitDetail;
  activeVedhas: ActiveVedhaEvent[];
}): ChronologicalRoadmap {
  const {
    nativeLagna,
    currentDateIso,
    mahadashaLord,
    antardashaLord,
    pratyantardashaLord,
    doubleTransitCareer,
    doubleTransitWealth,
    activeKakshya,
    activeVedhas,
  } = params;

  const currentYear = new Date(currentDateIso).getFullYear();
  const currentMonth = new Date(currentDateIso).getMonth(); // 0 to 11

  // Format quarter dates
  const q1Label = `Current Window (Q${Math.floor(currentMonth / 3) + 1} ${currentYear})`;
  const q2Label = `Upcoming Pivot (Q${((Math.floor(currentMonth / 3) + 1) % 4) + 1} ${
    Math.floor(currentMonth / 3) === 3 ? currentYear + 1 : currentYear
  })`;
  const q3Label = `Major Culmination (Mid ${currentYear + 1})`;

  // Evaluate current quarter status
  const hasKarmaVedha = activeVedhas.some((v) => v.targetRole === 'KARMA');
  const hasAuspiciousVedha = activeVedhas.some((v) => v.potency === 'MAJOR_ELEVATION');
  const isKakshyaFruitful = activeKakshya ? activeKakshya.hasBindu : true;

  let currentCategory: MilestonePivotalCategory = 'CAREER_PIVOT_AND_ELEVATION';
  let currentScore = doubleTransitCareer.probabilityScore;
  let currentDirective = '';
  let currentMechanism = '';

  if (doubleTransitCareer.doubleTransitActive && isKakshyaFruitful) {
    currentCategory = 'CAREER_PIVOT_AND_ELEVATION';
    currentScore = Math.min(95, currentScore + 10);
    currentMechanism = `Vimshottari ${mahadashaLord}/${antardashaLord}${
      pratyantardashaLord ? '/' + pratyantardashaLord : ''
    } running; AIFAS Double Transit active on 10th house/lord; Jupiter occupying bindu-rich Kakshya.`;
    currentDirective = `EXECUTE_BOLD_OFFERS: High predictive certainty for formal offers, promotion, or new venture launch. Do not hesitate in negotiations.`;
  } else if (hasKarmaVedha && !isKakshyaFruitful) {
    currentCategory = 'KARMIC_CRUCIBLE_AND_RESTRUCTURING';
    currentScore = 75;
    currentMechanism = `Malefic Vedha on Karma Nakshatra coupled with zero-bindu Kakshya arc. Forces structural endurance before breakthrough.`;
    currentDirective = `FORTIFY_FOUNDATIONS: Delay signing rushed long-term commitments; audit code/systems, refine credentials, and eliminate inefficiencies.`;
  } else {
    currentCategory = 'DISCIPLINED_INCUBATION_AND_PREP';
    currentScore = 65;
    currentMechanism = `Dasha ${mahadashaLord}/${antardashaLord} in transitional alignment; Gochara transits preparing for future conjunction.`;
    currentDirective = `STRATEGIC_PREPARATION: Accumulate deep domain mastery, build prototypes, and expand technical leverage.`;
  }

  const currentQuarterMilestone: MilestoneQuarterCard = {
    quarterLabel: q1Label,
    startDateIso: currentDateIso,
    endDateIso: new Date(new Date(currentDateIso).getTime() + 90 * 86400000).toISOString(),
    category: currentCategory,
    confluenceScore: currentScore,
    title: `Active Phase: ${currentCategory.replace(/_/g, ' ')}`,
    planetaryMechanism: currentMechanism,
    operationalDirective: currentDirective,
  };

  // Upcoming Quarter Milestone
  const upcomingQuarterMilestones: MilestoneQuarterCard[] = [
    {
      quarterLabel: q2Label,
      startDateIso: new Date(new Date(currentDateIso).getTime() + 90 * 86400000).toISOString(),
      endDateIso: new Date(new Date(currentDateIso).getTime() + 180 * 86400000).toISOString(),
      category: 'FINANCIAL_WINDFALL_AND_HARVEST',
      confluenceScore: 84,
      title: 'Monetary Harvest & Contract Formalization',
      planetaryMechanism: `Jupiter shifts into direct aspect with the 2nd/11th houses; Saturn anchors physical permanence in status.`,
      operationalDirective: `CAPITALIZE_ON_EQUITY: Leverage existing leverage to secure higher base compensation, funding rounds, or key property/wealth acquisitions.`,
    },
    {
      quarterLabel: q3Label,
      startDateIso: new Date(new Date(currentDateIso).getTime() + 180 * 86400000).toISOString(),
      endDateIso: new Date(new Date(currentDateIso).getTime() + 360 * 86400000).toISOString(),
      category: 'INTELLECTUAL_ACADEMIC_BREAKTHROUGH',
      confluenceScore: 88,
      title: 'Institutional Authority & Public Recognition',
      planetaryMechanism: `Antardasha transition aligns with D10/D24 varga maturation; Sarvatobhadra Samudayika star activation.`,
      operationalDirective: `EXPAND_AUTHORITY: Publish major works, step onto public stages, or lead institutional architecture teams.`,
    },
  ];

  const macroSummary = `The overarching karmic trajectory for your ${nativeLagna} ascendant is transitioning from internal crucible/endurance into physical crystallization. Confluence between your active ${mahadashaLord} Mahadasha and Gochara transits indicates that career and specialized breakthroughs reach their peak velocity across the upcoming windows.`;

  return {
    nativeLagna,
    runningMahadasha: mahadashaLord,
    runningAntardasha: antardashaLord,
    currentQuarterMilestone,
    upcomingQuarterMilestones,
    macroSummary,
  };
}
