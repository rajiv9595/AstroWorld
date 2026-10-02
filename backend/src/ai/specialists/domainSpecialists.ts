/**
 * ASTROWORLD — Domain Specialist Selectors
 * Deterministic evidence extractors that assemble domain-specific facts,
 * rules, and timing windows without requiring separate LLM invocations.
 */

import {
  AIInterpretationContext,
  PlanetName,
  VargaCode,
} from '../../../../shared/index.ts';
import {
  ConsultationContextPacket,
  ExtractedEntities,
  TimingFact,
} from '../types.ts';
// @ts-ignore astronomy-engine cjs/esm export
import * as Astronomy from 'astronomy-engine';
import { calculatePlanetaryPositions, calculateLahiriAyanamsha } from '../../../../shared/engine/astronomy.ts';

/**
 * 1. Career Specialist
 */
export function selectCareerEvidence(
  context: AIInterpretationContext,
  entities: ExtractedEntities
): Partial<ConsultationContextPacket> {
  const ascSignIndex = context.ascendant.signIndex;
  // 10th house is (ascSignIndex + 9) % 12
  const tenthHouseNum = 10;
  const tenthSignIndex = (ascSignIndex + 9) % 12;

  // D1 Planets in 10th house or ruling 10th house
  const tenthOccupants = context.planets.filter((p) => p.houseNumber === 10);
  const tenthLord = context.houses.find((h) => h.houseNumber === 10)?.lord;
  const tenthLordPlanet = context.planets.find((p) => p.name === tenthLord);

  // D10 Dashamsha
  const d10 = context.vargas?.['D10'];

  // Amatyakaraka (Jaimini Career Karaka)
  const amk = context.jaimini?.charaKarakas?.find((k) => k.role === 'AmK');

  // Career Yogas
  const careerYogas = (context.yogas || [])
    .filter((y) => y.present && (y.name.includes('Raja') || y.name.includes('Dhana') || y.name.includes('Amala') || y.name.includes('Pancha Mahapurusha')))
    .map((y) => ({ name: y.name, reference: y.bphsReference || 'BPHS', effects: y.effects }));

  // Timing
  const currentDasha = context.dasha?.currentHierarchy;
  const timing: TimingFact[] = [];
  if (currentDasha) {
    timing.push({
      type: 'EVENT_WINDOW',
      periodLabel: `${currentDasha.mahadasha?.lord}-${currentDasha.antardasha?.subLord} Dasha Window`,
      startDateIso: currentDasha.antardasha?.startDateIso,
      endDateIso: currentDasha.antardasha?.endDateIso,
      description: `Active sub-period ruled by ${currentDasha.antardasha?.subLord} operating in natal chart.`,
      confidence: 'MEDIUM',
    });
  }

  const relevantPlanets = [...tenthOccupants];
  if (tenthLordPlanet && !relevantPlanets.some((p) => p.name === tenthLordPlanet.name)) {
    relevantPlanets.push(tenthLordPlanet);
  }
  // Include Sun (natural karaka for profession/authority) and Saturn (karma karaka)
  const sun = context.planets.find((p) => p.name === 'Sun');
  const saturn = context.planets.find((p) => p.name === 'Saturn');
  if (sun && !relevantPlanets.some((p) => p.name === 'Sun')) relevantPlanets.push(sun);
  if (saturn && !relevantPlanets.some((p) => p.name === 'Saturn')) relevantPlanets.push(saturn);

  return {
    relevantChartFacts: {
      ascendant: {
        sign: context.ascendant.sign,
        degree: context.ascendant.formattedDegree,
        nakshatra: context.ascendant.nakshatra,
        pada: context.ascendant.pada,
      },
      planets: relevantPlanets.map((p) => ({
        name: p.name,
        sign: p.sign,
        degree: p.formattedDegree,
        house: p.houseNumber,
        dignity: p.dignity,
        nakshatra: p.nakshatra,
        pada: p.pada,
        retrograde: p.retrograde,
        combust: p.combust,
        factKey: `D1:${p.name}:${p.sign}:H${p.houseNumber}`,
      })),
    },
    relevantVargaFacts: d10
      ? [
          {
            code: 'D10',
            ascendantSign: d10.ascendantSign,
            planets: d10.planets.map((p) => ({
              name: p.planet,
              vargaSign: p.vargaSign,
              house: p.houseNumber,
              dignity: p.dignity,
              factKey: `D10:${p.planet}:${p.vargaSign}:H${p.houseNumber}`,
            })),
          },
        ]
      : undefined,
    relevantJaimini: {
      amatyakaraka: amk ? `${amk.planet} (${amk.role}, Career Karaka)` : undefined,
      atmakaraka: context.jaimini?.atmakaraka,
    },
    relevantYogas: careerYogas,
    relevantRules: [
      `10th house is ruled by ${tenthLord || '10th Lord'} residing in House ${tenthLordPlanet?.houseNumber || 'H10'}.`,
      `D10 Dashamsha Lagna is ${d10?.ascendantSign || 'established'}.`,
      `In Vedic astrology, career shifts coincide with planetary periods of 10th lord, 1st lord, or Karakas Sun/Saturn combined with major transits of Jupiter/Saturn.`,
    ],
    relevantTiming: timing,
  };
}

/**
 * 2. Marriage & Relationship Specialist
 */
export function selectMarriageEvidence(
  context: AIInterpretationContext,
  entities: ExtractedEntities
): Partial<ConsultationContextPacket> {
  const seventhHouse = context.houses.find((h) => h.houseNumber === 7);
  const seventhLord = seventhHouse?.lord;
  const seventhLordPlanet = context.planets.find((p) => p.name === seventhLord);
  const seventhOccupants = context.planets.filter((p) => p.houseNumber === 7);

  const venus = context.planets.find((p) => p.name === 'Venus');
  const jupiter = context.planets.find((p) => p.name === 'Jupiter');

  const relevantPlanets = [...seventhOccupants];
  if (seventhLordPlanet && !relevantPlanets.some((p) => p.name === seventhLordPlanet.name)) {
    relevantPlanets.push(seventhLordPlanet);
  }
  if (venus && !relevantPlanets.some((p) => p.name === 'Venus')) relevantPlanets.push(venus);
  if (jupiter && !relevantPlanets.some((p) => p.name === 'Jupiter')) relevantPlanets.push(jupiter);

  // D9 Navamsha
  const d9 = context.vargas?.['D9'];
  const darakaraka = context.jaimini?.charaKarakas?.find((k) => k.role === 'DK');

  // Manglik Dosha check
  const manglik = context.doshas?.find((d) => d.name.toLowerCase().includes('mangal') || d.name.toLowerCase().includes('manglik'));

  // Timing
  const currentDasha = context.dasha?.currentHierarchy;
  const timing: TimingFact[] = [];
  if (currentDasha) {
    timing.push({
      type: 'EVENT_WINDOW',
      periodLabel: `${currentDasha.mahadasha?.lord}-${currentDasha.antardasha?.subLord} Dasha Window`,
      startDateIso: currentDasha.antardasha?.startDateIso,
      endDateIso: currentDasha.antardasha?.endDateIso,
      description: `Active relationship timing window in ${currentDasha.antardasha?.subLord} Antardasha.`,
      confidence: 'MEDIUM',
    });
  }

  return {
    relevantChartFacts: {
      ascendant: {
        sign: context.ascendant.sign,
        degree: context.ascendant.formattedDegree,
        nakshatra: context.ascendant.nakshatra,
        pada: context.ascendant.pada,
      },
      planets: relevantPlanets.map((p) => ({
        name: p.name,
        sign: p.sign,
        degree: p.formattedDegree,
        house: p.houseNumber,
        dignity: p.dignity,
        nakshatra: p.nakshatra,
        pada: p.pada,
        retrograde: p.retrograde,
        combust: p.combust,
        factKey: `D1:${p.name}:${p.sign}:H${p.houseNumber}`,
      })),
    },
    relevantVargaFacts: d9
      ? [
          {
            code: 'D9',
            ascendantSign: d9.ascendantSign,
            planets: d9.planets.map((p) => ({
              name: p.planet,
              vargaSign: p.vargaSign,
              house: p.houseNumber,
              dignity: p.dignity,
              factKey: `D9:${p.planet}:${p.vargaSign}:H${p.houseNumber}`,
            })),
          },
        ]
      : undefined,
    relevantJaimini: {
      darakaraka: darakaraka ? `${darakaraka.planet} (Darakaraka - Spouse indicator)` : undefined,
    },
    relevantRules: [
      `7th house is ruled by ${seventhLord || '7th Lord'} in ${seventhLordPlanet?.sign || 'its sign'}.`,
      `Venus (Kalathrakaraka) is placed in ${venus?.sign} in House ${venus?.houseNumber}.`,
      `D9 Navamsha Lagna is ${d9?.ascendantSign || 'established'}, which governs marital fruit and soul alignment.`,
      manglik && manglik.present ? `Mangal Dosha note: ${manglik.description}` : 'No severe Manglik affliction on 7th house.',
    ],
    relevantTiming: timing,
  };
}

/**
 * 3. Dignity Specialist
 */
export function selectDignityEvidence(
  context: AIInterpretationContext,
  entities: ExtractedEntities
): Partial<ConsultationContextPacket> {
  const vargaTarget = entities.vargaCode || 'D1';
  const targetPlanets = entities.planetsMentioned && entities.planetsMentioned.length > 0
    ? entities.planetsMentioned
    : context.planets.map((p) => p.name);

  if (vargaTarget === 'D1') {
    const matchingPlanets = context.planets.filter((p) => targetPlanets.includes(p.name));
    return {
      relevantChartFacts: {
        ascendant: {
          sign: context.ascendant.sign,
          degree: context.ascendant.formattedDegree,
          nakshatra: context.ascendant.nakshatra,
          pada: context.ascendant.pada,
        },
        planets: matchingPlanets.map((p) => ({
          name: p.name,
          sign: p.sign,
          degree: p.formattedDegree,
          house: p.houseNumber,
          dignity: p.dignity,
          nakshatra: p.nakshatra,
          pada: p.pada,
          retrograde: p.retrograde,
          combust: p.combust,
          factKey: `D1:${p.name}:${p.sign}:${p.dignity}`,
        })),
      },
      relevantRules: matchingPlanets.map(
        (p) =>
          `D1 ${p.name} in ${p.sign} (${p.formattedDegree}) possesses canonical dignity: ${p.dignity}.`
      ),
    };
  }

  // Varga Dignity (e.g. D9, D10)
  const vargaChart = context.vargas?.[vargaTarget];
  if (vargaChart) {
    const matchingVargaPlanets = vargaChart.planets.filter((p) => targetPlanets.includes(p.planet));
    return {
      relevantVargaFacts: [
        {
          code: vargaTarget,
          ascendantSign: vargaChart.ascendantSign,
          planets: matchingVargaPlanets.map((p) => ({
            name: p.planet,
            vargaSign: p.vargaSign,
            house: p.houseNumber,
            dignity: p.dignity,
            factKey: `${vargaTarget}:${p.planet}:${p.vargaSign}:${p.dignity}`,
          })),
        },
      ],
      relevantRules: matchingVargaPlanets.map(
        (p) =>
          `${vargaTarget} ${p.planet} in ${p.vargaSign} achieves canonical ${vargaTarget} dignity: ${p.dignity} (evaluated independently at sign-level).`
      ),
    };
  }

  return {};
}

/**
 * 4. Transit (Gochara) Specialist
 */
export function selectTransitEvidence(
  context: AIInterpretationContext,
  entities: ExtractedEntities
): Partial<ConsultationContextPacket> {
  // If a specific future month/year was requested (e.g., March 2027), compute exact ephemeris for that target date
  let targetDate = new Date();
  if (entities.targetYear) {
    const m = entities.targetMonth ? entities.targetMonth - 1 : 0;
    targetDate = new Date(Date.UTC(entities.targetYear, m, 15, 12, 0, 0));
  }

  // Compute transit positions for target date using astronomy engine
  const astroTime = new Astronomy.AstroTime(targetDate);
  const ayanamsha = calculateLahiriAyanamsha(astroTime);
  const transitPlanets = calculatePlanetaryPositions(astroTime, ayanamsha, context.ascendant.signIndex);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const periodLabel = entities.targetYear
    ? `${entities.targetMonth ? monthNames[entities.targetMonth - 1] + ' ' : ''}${entities.targetYear}`
    : 'Current Live Transits';

  // Moon house from natal Moon
  const natalMoon = context.planets.find((p) => p.name === 'Moon');
  const natalMoonSignIndex = natalMoon?.signIndex ?? 0;

  const transitFacts = transitPlanets.map((tp) => {
    const natalLagnaHouse = ((tp.signIndex - context.ascendant.signIndex + 12) % 12) + 1;
    const chandraHouse = ((tp.signIndex - natalMoonSignIndex + 12) % 12) + 1;
    return {
      name: tp.name,
      transitSign: tp.sign,
      approxDegree: Math.round(tp.degreeInSign * 10) / 10,
      nakshatra: tp.nakshatra,
      retrograde: tp.retrograde,
      natalHouse: natalLagnaHouse,
      chandraHouse,
    };
  });

  return {
    relevantTransitFacts: {
      evaluationPeriod: periodLabel,
      planets: transitFacts,
      sadeSatiStatus: context.transits?.sadeSati?.active
        ? `Sade Sati is Active (${context.transits.sadeSati.phase})`
        : 'Sade Sati is Inactive',
    },
    relevantRules: [
      `Transits (Gochara) evaluated for ${periodLabel} with Lahiri Ayanamsha (${ayanamsha.toFixed(2)}°).`,
      `Jupiter in transit activates houses 5, 7, 9 from transit sign. Saturn casts 3rd, 7th, 10th aspects.`,
    ],
  };
}

/**
 * 5. Dasha Specialist
 */
export function selectDashaEvidence(
  context: AIInterpretationContext
): Partial<ConsultationContextPacket> {
  const currentHierarchy = context.dasha?.currentHierarchy;
  if (!currentHierarchy) return {};

  const mahadasha = currentHierarchy.mahadasha;
  const antardasha = currentHierarchy.antardasha;

  return {
    relevantDashaFacts: {
      activeHierarchy: `${mahadasha?.lord || 'Active'} Mahadasha -> ${antardasha?.subLord || 'Active'} Antardasha -> ${currentHierarchy.pratyantardasha?.pratyantarLord || 'Active'} Pratyantardasha`,
      currentMahadasha: mahadasha
        ? {
            lord: mahadasha.lord || 'Active',
            startDate: mahadasha.startDateIso?.slice(0, 10) || '',
            endDate: mahadasha.endDateIso?.slice(0, 10) || '',
          }
        : undefined,
      currentAntardasha: antardasha
        ? {
            lord: antardasha.subLord || 'Active',
            startDate: antardasha.startDateIso?.slice(0, 10) || '',
            endDate: antardasha.endDateIso?.slice(0, 10) || '',
          }
        : undefined,
    },
    relevantRules: [
      `Vimshottari Dasha is calculated from Moon's exact nakshatra (${context.planets.find((p) => p.name === 'Moon')?.nakshatra || 'Hasta'}).`,
      `Current ruler: ${mahadasha?.lord} Mahadasha active until ${mahadasha?.endDateIso?.slice(0, 10)}.`,
      `Current sub-ruler: ${antardasha?.subLord} Antardasha active until ${antardasha?.endDateIso?.slice(0, 10)}.`,
    ],
  };
}
