/**
 * ASTROWORLD — Sarvatobhadra Chakra & Special Nakshatra Vedha Engine
 * Classical Nadi & Samhita Frontier Transit Analysis
 * 
 * Computes the 7 Sensitive Pivotal Nakshatras from the Native's Janma Nakshatra:
 * 1. Janma (1st Star) — Physical body, vital health, core persona
 * 2. Karma (10th Star) — Career zenith, professional power, status elevation or crisis
 * 3. Sanghatika (16th Star) — Strategic partnerships, marriage, alliances, co-founders
 * 4. Samudayika (18th Star) — Financial windfalls, societal recognition, collective wealth
 * 5. Vainashika (23rd Star) — Rupture, severe karmic trials, destruction of obstacles/stagnation
 * 6. Manasa (25th Star) — Mental serenity, deep psyche, cognitive focus vs acute turbulence
 * 7. Abhisheka (27th Star) — Coronation, supreme authority, mastery and leadership
 * 
 * Cross-analyzes current transiting Grahas (Saturn, Jupiter, Rahu, Ketu, Mars) for direct
 * occupancy and angular Vedha afflictions to provide shocking predictive clarity.
 */

import { PlanetName } from '../../../../shared/engine/types.ts';
import { NAKSHATRAS } from '../../../../shared/engine/constants.ts';

export type SpecialNakshatraRole =
  | 'JANMA'
  | 'KARMA'
  | 'SANGHATIKA'
  | 'SAMUDAYIKA'
  | 'VAINASHIKA'
  | 'MANASA'
  | 'ABHISHEKA';

export interface SpecialNakshatraProfile {
  role: SpecialNakshatraRole;
  nakshatraName: string;
  nakshatraIndex: number; // 0 to 26
  offsetFromJanma: number; // 1, 10, 16, 18, 23, 25, 27
  traditionalSphere: string;
  modernManifestation: string;
}

export interface ActiveVedhaEvent {
  transitingPlanet: PlanetName;
  transitingNakshatra: string;
  targetRole: SpecialNakshatraRole;
  targetNakshatra: string;
  vedhaType: 'DIRECT_OCCUPATION' | 'OPPOSITE_VEDHA' | 'TRINAL_VEDHA';
  potency: 'CRITICAL_CONSEQUENCE' | 'MAJOR_ELEVATION' | 'PSYCHOLOGICAL_PRESSURE' | 'AUSPICIOUS_EXPANSION';
  predictiveInsight: string;
}

export interface SarvatobhadraAnalysis {
  janmaNakshatra: string;
  specialNakshatras: Record<SpecialNakshatraRole, SpecialNakshatraProfile>;
  activeVedhas: ActiveVedhaEvent[];
  summaryVerdict: string;
}

const SPECIAL_OFFSETS: Array<{
  role: SpecialNakshatraRole;
  offset: number; // 1-indexed (1, 10, 16, 18, 23, 25, 27)
  traditionalSphere: string;
  modernManifestation: string;
}> = [
  {
    role: 'JANMA',
    offset: 1,
    traditionalSphere: 'Deha, Arogya & Prana (Physical Body & Vitality)',
    modernManifestation: 'Personal identity, physical endurance, self-confidence, and vitality baseline.',
  },
  {
    role: 'KARMA',
    offset: 10,
    traditionalSphere: 'Vyapar, Rajapada & Vritti (Career & Public Power)',
    modernManifestation: 'Executive standing, promotions, major job pivots, institutional authority, and professional reputation.',
  },
  {
    role: 'SANGHATIKA',
    offset: 16,
    traditionalSphere: 'Maitri, Vivaha & Sandhi (Partnerships & Alliances)',
    modernManifestation: 'Business partnerships, co-founder dynamics, legal contracts, marital union, and key alliances.',
  },
  {
    role: 'SAMUDAYIKA',
    offset: 18,
    traditionalSphere: 'Labha, Samudaya & Dhana (Collective Wealth & Fortune)',
    modernManifestation: 'Financial windfalls, fundraising breakthroughs, community standing, and sudden economic elevation.',
  },
  {
    role: 'VAINASHIKA',
    offset: 23,
    traditionalSphere: 'Vinasha, Sankata & Kshaya (Crisis, Endings & Trials)',
    modernManifestation: 'Shedding outdated structures, acute stress tests, legal/work frictions, and karmic pruning.',
  },
  {
    role: 'MANASA',
    offset: 25,
    traditionalSphere: 'Manas, Chitta & Dhriti (Mind, Psyche & Mental Peace)',
    modernManifestation: 'Cognitive focus, anxiety spikes, existential clarity, psychological breakthroughs, and mental health.',
  },
  {
    role: 'ABHISHEKA',
    offset: 27,
    traditionalSphere: 'Pattabhisheka & Vijaya (Coronation, Triumph & Leadership)',
    modernManifestation: 'Highest professional pinnacle, winning competitive selections, public triumph, and leadership coronation.',
  },
];

/**
 * Resolves all 7 special sensitive Nakshatras from the native's Janma (Moon) Nakshatra.
 */
export function computeSpecialNakshatras(janmaNakshatraIndex: number): Record<SpecialNakshatraRole, SpecialNakshatraProfile> {
  const result: Partial<Record<SpecialNakshatraRole, SpecialNakshatraProfile>> = {};

  for (const item of SPECIAL_OFFSETS) {
    // 0-indexed formula: (janma + offset - 1) % 27
    const targetIdx = (janmaNakshatraIndex + item.offset - 1) % 27;
    const nakshatraDef = NAKSHATRAS[targetIdx];
    const nakshatraName = nakshatraDef?.name || `Nakshatra ${targetIdx + 1}`;

    result[item.role] = {
      role: item.role,
      nakshatraName,
      nakshatraIndex: targetIdx,
      offsetFromJanma: item.offset,
      traditionalSphere: item.traditionalSphere,
      modernManifestation: item.modernManifestation,
    };
  }

  return result as Record<SpecialNakshatraRole, SpecialNakshatraProfile>;
}

/**
 * Evaluates active transiting planets against the native's 7 special Nakshatras.
 */
export function evaluateSarvatobhadraTransits(params: {
  janmaNakshatraIndex: number;
  transitingPlanets: Array<{
    planet: PlanetName;
    nakshatraIndex: number;
  }>;
}): SarvatobhadraAnalysis {
  const { janmaNakshatraIndex, transitingPlanets } = params;
  const janmaNakshatra = NAKSHATRAS[janmaNakshatraIndex]?.name || 'Ashwini';
  const specialNakshatras = computeSpecialNakshatras(janmaNakshatraIndex);

  const activeVedhas: ActiveVedhaEvent[] = [];

  for (const tp of transitingPlanets) {
    const tNakName = NAKSHATRAS[tp.nakshatraIndex]?.name || `Star ${tp.nakshatraIndex + 1}`;

    for (const [roleKey, profile] of Object.entries(specialNakshatras)) {
      const role = roleKey as SpecialNakshatraRole;
      const targetIdx = profile.nakshatraIndex;

      // 1. Direct Occupancy (Planet sits right in the special star)
      if (tp.nakshatraIndex === targetIdx) {
        if (['Saturn', 'Rahu', 'Ketu', 'Mars'].includes(tp.planet)) {
          let insight = '';
          let potency: ActiveVedhaEvent['potency'] = 'CRITICAL_CONSEQUENCE';

          if (role === 'KARMA') {
            insight = `Transiting ${tp.planet} directly occupies your Karma Nakshatra (${profile.nakshatraName}). This triggers a defining restructuring in your career: unexpected organizational changes, heavy executive pressure, or a sudden demand to step up into independent authority.`;
          } else if (role === 'MANASA') {
            potency = 'PSYCHOLOGICAL_PRESSURE';
            insight = `Transiting ${tp.planet} touches your Manasa Nakshatra (${profile.nakshatraName}). Expect heightened psychological restlessness, insomnia, or intense existential re-evaluation. A powerful time for deep meditation and strategic patience.`;
          } else if (role === 'VAINASHIKA') {
            insight = `Transiting ${tp.planet} activates your Vainashika Nakshatra (${profile.nakshatraName}). An old chapter or exhausting commitment is being severed. Clear deadwood from your path; avoid impulsive legal or financial gambles.`;
          } else if (role === 'JANMA') {
            potency = 'PSYCHOLOGICAL_PRESSURE';
            insight = `Transiting ${tp.planet} crosses your Janma Nakshatra (${profile.nakshatraName}). Prioritize physical vitality, avoid burnout, and practice deliberate discipline in all daily habits.`;
          } else {
            insight = `Transiting ${tp.planet} impacts ${role} Nakshatra (${profile.nakshatraName}), demanding disciplined restructuring in ${profile.modernManifestation}.`;
          }

          activeVedhas.push({
            transitingPlanet: tp.planet,
            transitingNakshatra: tNakName,
            targetRole: role,
            targetNakshatra: profile.nakshatraName,
            vedhaType: 'DIRECT_OCCUPATION',
            potency,
            predictiveInsight: insight,
          });
        } else if (['Jupiter', 'Venus'].includes(tp.planet)) {
          let insight = '';
          let potency: ActiveVedhaEvent['potency'] = 'MAJOR_ELEVATION';

          if (role === 'KARMA') {
            insight = `Transiting ${tp.planet} graces your Karma Nakshatra (${profile.nakshatraName}). A golden window for career promotion, public visibility, high-level mentorship, and institutional recognition.`;
          } else if (role === 'SAMUDAYIKA') {
            insight = `Transiting ${tp.planet} blesses your Samudayika Nakshatra (${profile.nakshatraName}). Triggers collective financial elevation, unexpected monetary inflows, and favorable community reception.`;
          } else if (role === 'ABHISHEKA') {
            insight = `Transiting ${tp.planet} enters your Abhisheka Nakshatra (${profile.nakshatraName}). The highest omen for leadership triumph, formal award of credentials, or winning competitive selection.`;
          } else {
            potency = 'AUSPICIOUS_EXPANSION';
            insight = `Benefic transit of ${tp.planet} over ${role} Nakshatra (${profile.nakshatraName}) unlocks grace and harmony in ${profile.modernManifestation}.`;
          }

          activeVedhas.push({
            transitingPlanet: tp.planet,
            transitingNakshatra: tNakName,
            targetRole: role,
            targetNakshatra: profile.nakshatraName,
            vedhaType: 'DIRECT_OCCUPATION',
            potency,
            predictiveInsight: insight,
          });
        }
      }

      // 2. Opposite Vedha (14th Star / Exact Polar Ray in Sarvatobhadra)
      const oppositeIdx = (targetIdx + 13) % 27; // 14th star across the 27-circle
      if (tp.nakshatraIndex === oppositeIdx) {
        if (['Saturn', 'Rahu', 'Mars'].includes(tp.planet)) {
          activeVedhas.push({
            transitingPlanet: tp.planet,
            transitingNakshatra: tNakName,
            targetRole: role,
            targetNakshatra: profile.nakshatraName,
            vedhaType: 'OPPOSITE_VEDHA',
            potency: role === 'KARMA' ? 'CRITICAL_CONSEQUENCE' : 'PSYCHOLOGICAL_PRESSURE',
            predictiveInsight: `Transiting ${tp.planet} in ${tNakName} casts direct Polar Vedha on your ${role} star (${profile.nakshatraName}). Forces confrontation with external obstacles, compelling structured resilience in ${profile.traditionalSphere}.`,
          });
        } else if (tp.planet === 'Jupiter') {
          activeVedhas.push({
            transitingPlanet: tp.planet,
            transitingNakshatra: tNakName,
            targetRole: role,
            targetNakshatra: profile.nakshatraName,
            vedhaType: 'OPPOSITE_VEDHA',
            potency: 'AUSPICIOUS_EXPANSION',
            predictiveInsight: `Transiting Jupiter in ${tNakName} casts luminous Polar Vedha onto your ${role} star (${profile.nakshatraName}), mitigating past friction and opening constructive alliances.`,
          });
        }
      }
    }
  }

  let summaryVerdict = '';
  const criticalHits = activeVedhas.filter((v) => v.potency === 'CRITICAL_CONSEQUENCE');
  const majorElevations = activeVedhas.filter((v) => v.potency === 'MAJOR_ELEVATION');

  if (majorElevations.length > 0 && criticalHits.length === 0) {
    summaryVerdict = `SARVATOBHADRA LUMINOSITY: Auspicious stars are actively illuminated by benefic transits. Excellent timing for bold professional steps, strategic alliances, and financial expansion.`;
  } else if (criticalHits.length > 0 && majorElevations.length === 0) {
    summaryVerdict = `SARVATOBHADRA CRUCIBLE: Intense malefic Vedha active on pivotal life stars (Karma/Vainashika). This is a period of karmic testing and mandatory restructuring; avoid haste and focus on disciplined execution.`;
  } else if (criticalHits.length > 0 && majorElevations.length > 0) {
    summaryVerdict = `SARVATOBHADRA COMPLEX HARMONIC: Simultaneous pressure and breakthrough. While executive demands or mental tests are high, divine grace provides a high-level breakthrough if integrity is maintained.`;
  } else {
    summaryVerdict = `SARVATOBHADRA EQUILIBRIUM: Core sensitive stars are operating without acute afflictions. Steady, self-directed progress without jarring external shocks.`;
  }

  return {
    janmaNakshatra,
    specialNakshatras,
    activeVedhas,
    summaryVerdict,
  };
}
