/**
 * ASTROWORLD AI V2/V3 — Planetary Maturity & Varga Activation Engine
 * Synthesizes:
 * 1. Classical Graha Paripakva Kala (Planetary Maturity Ages: BPHS / Phaladeepika)
 * 2. Varga Pravritti Kala (Divisional Chart Activation Stages across life chapters)
 * 3. Synthesis with Vimshottari Dasha and Gochara Transits for Past/Present/Future trajectory
 */

import { PlanetName, VargaCode } from '../../../../shared/index.ts';
import { BirthProfileInput } from '../schemas/birthProfile.ts';

export interface PlanetaryMaturityRecord {
  planet: PlanetName;
  maturityAge: number;
  isMatured: boolean;
  maturedAtYear?: number;
  yearsRemaining?: number;
  shastricSignificance: string;
  modernManifestation: string;
}

export interface VargaActivationStage {
  vargaCode: VargaCode;
  vargaName: string;
  sanskritPurpose: string;
  optimalAgeWindow: string;
  isActiveNow: boolean;
  activationLevel: 'foundational' | 'peak_operational' | 'maturing' | 'dormant';
  guidance: string;
}

export interface PlanetaryMaturityProfile {
  birthUtc: Date;
  evaluationDateUtc: Date;
  ageYears: number;
  ageFormatted: string;
  maturedPlanets: PlanetaryMaturityRecord[];
  pendingPlanets: PlanetaryMaturityRecord[];
  nextMaturityMilestone?: PlanetaryMaturityRecord;
  vargaStages: VargaActivationStage[];
  synthesisNote: string;
}

export const CLASSICAL_PLANETARY_MATURITY_AGES: Record<PlanetName, { age: number; significance: string; modern: string }> = {
  Jupiter: {
    age: 16,
    significance: 'Awakening of higher intellect (Buddhi), moral conscience, formal mentorship, and spiritual receptivity.',
    modern: 'Transition from secondary schooling into serious academic focus, vocational orientation, and ethical worldview formation.',
  },
  Sun: {
    age: 21,
    significance: 'Maturation of the Atman (individual ego, personal sovereignty, self-reliance, and separation from paternal shadow).',
    modern: 'Graduation, initial vocational autonomy, establishing independent identity, and making autonomous life decisions.',
  },
  Moon: {
    age: 24,
    significance: 'Emotional stabilization of Manas (the subconscious mind, psychological equilibrium, and public empathy).',
    modern: 'Emotional independence, settling of early 20s psychological turbulence, establishing stable interpersonal relationships.',
  },
  Venus: {
    age: 25,
    significance: 'Maturation of relational aesthetics (Shukra), marital discernment, refined taste, and enduring partnership capacity.',
    modern: 'Serious matrimonial readiness, long-term romantic commitments, refined creative endeavors, and luxury lifestyle anchoring.',
  },
  Mars: {
    age: 28,
    significance: 'Tempering of physical aggression into strategic courage (Dhairya), executive leadership, and immovable asset acquisition.',
    modern: 'Major property acquisition, executive career promotions, entrepreneurial risk-taking, and decisive professional mastery.',
  },
  Mercury: {
    age: 32,
    significance: 'Apex of commercial discrimination (Viveka), business acumen, strategic negotiation, and intellectual consolidation.',
    modern: 'Peak professional competence, independent commercial ventures, advanced technological mastery, and financial strategy.',
  },
  Saturn: {
    age: 36,
    significance: 'The Great Karmic Maturation. Dissolution of youthful illusions; enduring structural permanence, resilience, and unshakeable mastery.',
    modern: 'Stabilization of long-term wealth, permanent career tenure, societal authority, and reaping enduring rewards of past hardships.',
  },
  Rahu: {
    age: 42,
    significance: 'Maturation of worldly ambition (Maya); understanding worldly illusions, sudden major transformation, or global breakout.',
    modern: 'Mid-life professional peak, large-scale unconventional breakthroughs, international expansion, or radical reinvention.',
  },
  Ketu: {
    age: 48,
    significance: 'Spiritual detachment (Moksha Karaka); transmuting material victories into philosophical depth, wisdom, and liberation.',
    modern: 'Mentorship phase, deep philosophical/spiritual awakening, legacy planning, and release from superficial material anxieties.',
  },
};

export class PlanetaryMaturityEngine {
  /**
   * Evaluates planetary maturity and divisional chart activation for any birth chart at any evaluation date.
   */
  public static evaluate(birthProfile: BirthProfileInput, evalDate: Date = new Date()): PlanetaryMaturityProfile {
    const birthUtc = new Date(Date.UTC(
      birthProfile.year,
      birthProfile.month - 1,
      birthProfile.day,
      birthProfile.hour || 12,
      birthProfile.minute || 0
    ));

    const diffMs = evalDate.getTime() - birthUtc.getTime();
    const ageYears = Math.max(0, diffMs / (365.2425 * 86400000));
    const fullYears = Math.floor(ageYears);
    const remainingMonths = Math.floor((ageYears - fullYears) * 12);
    const ageFormatted = `${fullYears} years, ${remainingMonths} months`;

    const birthYear = birthProfile.year;
    const maturedPlanets: PlanetaryMaturityRecord[] = [];
    const pendingPlanets: PlanetaryMaturityRecord[] = [];

    const planetList: PlanetName[] = ['Jupiter', 'Sun', 'Moon', 'Venus', 'Mars', 'Mercury', 'Saturn', 'Rahu', 'Ketu'];

    for (const p of planetList) {
      const info = CLASSICAL_PLANETARY_MATURITY_AGES[p];
      const isMatured = ageYears >= info.age;
      const record: PlanetaryMaturityRecord = {
        planet: p,
        maturityAge: info.age,
        isMatured,
        maturedAtYear: isMatured ? birthYear + info.age : undefined,
        yearsRemaining: isMatured ? undefined : Number((info.age - ageYears).toFixed(1)),
        shastricSignificance: info.significance,
        modernManifestation: info.modern,
      };

      if (isMatured) {
        maturedPlanets.push(record);
      } else {
        pendingPlanets.push(record);
      }
    }

    // Sort matured descending by age, pending ascending by age
    maturedPlanets.sort((a, b) => b.maturityAge - a.maturityAge);
    pendingPlanets.sort((a, b) => a.maturityAge - b.maturityAge);

    const nextMaturityMilestone = pendingPlanets.length > 0 ? pendingPlanets[0] : undefined;

    // Varga Chart Activation Stages
    const vargaStages: VargaActivationStage[] = [
      {
        vargaCode: 'D1',
        vargaName: 'Rashi Chart',
        sanskritPurpose: 'Tanu Bhava & Physical Vessel',
        optimalAgeWindow: 'Lifelong (Birth onwards)',
        isActiveNow: true,
        activationLevel: 'foundational',
        guidance: 'Anchors baseline bodily constitution, social identity, and the outer playground where karmas unfold.',
      },
      {
        vargaCode: 'D24',
        vargaName: 'Siddhamsha / Chaturvimshamsha',
        sanskritPurpose: 'Vidya & Intellectual Mastery',
        optimalAgeWindow: 'Ages 16–26 (Youth & University Years)',
        isActiveNow: ageYears >= 16 && ageYears <= 28,
        activationLevel: ageYears >= 16 && ageYears <= 26 ? 'peak_operational' : ageYears < 16 ? 'dormant' : 'maturing',
        guidance: 'Governs higher academic learning, competitive examinations, technical degrees, and cognitive discipline.',
      },
      {
        vargaCode: 'D9',
        vargaName: 'Navamsha',
        sanskritPurpose: 'Dharma, Inner Potential & Matrimonial Longevity',
        optimalAgeWindow: 'Ages 28–32 onwards (Post-Matrimonial / Adulthood)',
        isActiveNow: ageYears >= 25,
        activationLevel: ageYears >= 28 ? 'peak_operational' : ageYears >= 24 ? 'maturing' : 'foundational',
        guidance: 'Reveals the true internal fruit-bearing strength of planets. Gains primary dominance as youthful impulsiveness settles.',
      },
      {
        vargaCode: 'D10',
        vargaName: 'Dashamsha',
        sanskritPurpose: 'Mahat-Phala & Career Executive Authority',
        optimalAgeWindow: 'Ages 24–60 (Professional & Institutional Ascendance)',
        isActiveNow: ageYears >= 22,
        activationLevel: ageYears >= 26 ? 'peak_operational' : 'maturing',
        guidance: 'Governs executive authority, institutional reputation, leadership tenure, and public professional legacy.',
      },
      {
        vargaCode: 'D4',
        vargaName: 'Chaturthamsha',
        sanskritPurpose: 'Bhagyabhumi & Permanent Fixed Assets',
        optimalAgeWindow: 'Ages 28–50 (Asset Acquisition & Home Stability)',
        isActiveNow: ageYears >= 28,
        activationLevel: ageYears >= 28 ? 'peak_operational' : 'dormant',
        guidance: 'Activates when the native establishes an independent permanent residence or acquires immovable real estate.',
      },
      {
        vargaCode: 'D20',
        vargaName: 'Vimsamsa',
        sanskritPurpose: 'Upasana, Mantra Siddhi & Spiritual Realization',
        optimalAgeWindow: 'Ages 36+ (Mid-life Spiritual Deepening)',
        isActiveNow: ageYears >= 36,
        activationLevel: ageYears >= 36 ? 'peak_operational' : 'dormant',
        guidance: 'Governs internal meditative detachment, divine alignment with Ishta Devata, and spiritual evolution.',
      },
    ];

    // Synthesis note
    let synthesisNote = '';
    if (nextMaturityMilestone) {
      synthesisNote = `Native is currently at age ${ageFormatted}. ${maturedPlanets.length} planets have attained classical Graha Paripakva (maturity). The next major planetary maturation milestone is ${nextMaturityMilestone.planet} at age ${nextMaturityMilestone.maturityAge} (in ~${nextMaturityMilestone.yearsRemaining} years), which awakens ${nextMaturityMilestone.modernManifestation.toLowerCase()}`;
    } else {
      synthesisNote = `Native is at age ${ageFormatted}. All classical planetary maturity cycles (through Ketu at age 48) have matured, conferring seasoned karmic discernment and unshakeable mastery.`;
    }

    return {
      birthUtc,
      evaluationDateUtc: evalDate,
      ageYears,
      ageFormatted,
      maturedPlanets,
      pendingPlanets,
      nextMaturityMilestone,
      vargaStages,
      synthesisNote,
    };
  }
}
