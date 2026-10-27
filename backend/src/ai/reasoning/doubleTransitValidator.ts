/**
 * ASTROWORLD AI V3 — Double Transit (Guru-Shani) Confluence Engine
 * Evaluates the authoritative research-grade Double Transit principle:
 * In Vedic astrology, major life events (career promotion, marriage, child birth, relocation, property)
 * only precipitate into physical reality when BOTH Jupiter and Saturn simultaneously aspect or transit
 * the relevant house or its lord.
 */

export interface DoubleTransitResult {
  targetHouse: number;
  domain: string;
  jupiterActivating: boolean;
  jupiterMechanism?: string;
  saturnActivating: boolean;
  saturnMechanism?: string;
  doubleTransitActive: boolean;
  aifasConditionsMet?: string[];
  probabilityScore: number; // 0 - 100
  verdict: 'imminent_manifestation' | 'promising_opportunity' | 'structural_pressure' | 'internal_cultivation';
  shastricExplanation: string;
}

export function evaluateDoubleTransit(params: {
  targetHouse: number;
  domain: string;
  jupiterHouse: number; // Current transit house of Jupiter from Lagna (1-12)
  saturnHouse: number;  // Current transit house of Saturn from Lagna (1-12)
  houseLordHouse?: number; // Natal or current position of the target house lord (1-12)
  alternativeHouse?: number; // AIFAS secondary house: 7th for career (10th from 10th), 9th for education, 1st for marriage
  alternativeLordHouse?: number; // Natal placement of alternative house lord
}): DoubleTransitResult {
  const { targetHouse, domain, jupiterHouse, saturnHouse, houseLordHouse, alternativeHouse, alternativeLordHouse } = params;

  // Jupiter aspects: 1st (occupied), 5th, 7th, 9th
  const jupiterInfluences = [
    jupiterHouse,
    ((jupiterHouse + 4 - 1) % 12) + 1, // 5th aspect
    ((jupiterHouse + 6 - 1) % 12) + 1, // 7th aspect
    ((jupiterHouse + 8 - 1) % 12) + 1, // 9th aspect
  ];

  // Saturn aspects: 1st (occupied), 3rd, 7th, 10th
  const saturnInfluences = [
    saturnHouse,
    ((saturnHouse + 2 - 1) % 12) + 1, // 3rd aspect
    ((saturnHouse + 6 - 1) % 12) + 1, // 7th aspect
    ((saturnHouse + 9 - 1) % 12) + 1, // 10th aspect
  ];

  const jupiterDirectHouse = jupiterInfluences.includes(targetHouse);
  const jupiterLord = houseLordHouse ? jupiterInfluences.includes(houseLordHouse) : false;
  const jupiterAltHouse = alternativeHouse ? jupiterInfluences.includes(alternativeHouse) : false;
  const jupiterAltLord = alternativeLordHouse ? jupiterInfluences.includes(alternativeLordHouse) : false;
  const jupiterActivating = jupiterDirectHouse || jupiterLord || jupiterAltHouse || jupiterAltLord;

  const saturnDirectHouse = saturnInfluences.includes(targetHouse);
  const saturnLord = houseLordHouse ? saturnInfluences.includes(houseLordHouse) : false;
  const saturnAltHouse = alternativeHouse ? saturnInfluences.includes(alternativeHouse) : false;
  const saturnAltLord = alternativeLordHouse ? saturnInfluences.includes(alternativeLordHouse) : false;
  const saturnActivating = saturnDirectHouse || saturnLord || saturnAltHouse || saturnAltLord;

  // AIFAS 4-point contact list: 1. Target House, 2. Target Lord, 3. Alt House, 4. Alt Lord
  const aifasConditionsMet: string[] = [];
  if (jupiterDirectHouse || saturnDirectHouse) aifasConditionsMet.push(`House ${targetHouse}`);
  if (jupiterLord || saturnLord) aifasConditionsMet.push(`Lord of House ${targetHouse}`);
  if (alternativeHouse && (jupiterAltHouse || saturnAltHouse)) aifasConditionsMet.push(`Alternative House ${alternativeHouse}`);
  if (alternativeLordHouse && (jupiterAltLord || saturnAltLord)) aifasConditionsMet.push(`Lord of Alt House ${alternativeHouse}`);

  const jupiterMechanism = jupiterDirectHouse
    ? `Jupiter in House ${jupiterHouse} directly aspects/occupies House ${targetHouse}`
    : jupiterLord
    ? `Jupiter in House ${jupiterHouse} directly aspects the ${targetHouse}th house lord in House ${houseLordHouse}`
    : jupiterAltHouse
    ? `Jupiter in House ${jupiterHouse} activates alternative House ${alternativeHouse} (Bhavat Bhavam)`
    : undefined;

  const saturnMechanism = saturnDirectHouse
    ? `Saturn in House ${saturnHouse} directly aspects/occupies House ${targetHouse}`
    : saturnLord
    ? `Saturn in House ${saturnHouse} directly aspects the ${targetHouse}th house lord in House ${houseLordHouse}`
    : saturnAltHouse
    ? `Saturn in House ${saturnHouse} activates alternative House ${alternativeHouse} (Bhavat Bhavam)`
    : undefined;

  const doubleTransitActive = (jupiterActivating && saturnActivating) || aifasConditionsMet.length >= 2;

  let probabilityScore = 38;
  let verdict: DoubleTransitResult['verdict'] = 'internal_cultivation';
  let shastricExplanation = '';

  if (doubleTransitActive) {
    probabilityScore = 88;
    verdict = 'imminent_manifestation';
    shastricExplanation = `Double Transit Criterion MET (AIFAS & Classical Shastra): Both Jupiter and Saturn are actively activating the ${targetHouse}th house of ${domain} (Confluence points: ${aifasConditionsMet.join(', ')}). Jupiter provides divine sanction, while Saturn enforces physical crystallisation into reality. This timing window possesses high predictive certainty for concrete breakthroughs.`;
  } else if (jupiterActivating && !saturnActivating) {
    probabilityScore = 68;
    verdict = 'promising_opportunity';
    shastricExplanation = `Single Transit (Jupiter): Jupiter is favorably illuminating the ${targetHouse}th house, opening mental enthusiasm, interview opportunities, or proposals, but Saturn has not yet applied its binding aspect for final physical consolidation. Expect fruitful talks and preparation.`;
  } else if (!jupiterActivating && saturnActivating) {
    probabilityScore = 55;
    verdict = 'structural_pressure';
    shastricExplanation = `Single Transit (Saturn): Saturn is casting its gaze upon the ${targetHouse}th house, creating heavy obligations, delays, and structural pressure. Without Jupiter's aspect, fruits require patience and sustained discipline before blossoming.`;
  } else {
    probabilityScore = 35;
    verdict = 'internal_cultivation';
    shastricExplanation = `Neither Jupiter nor Saturn is directly activating the ${targetHouse}th house during this immediate snapshot. Classical rules suggest this is an incubation phase for building internal readiness rather than forcing external leaps.`;
  }

  return {
    targetHouse,
    domain,
    jupiterActivating,
    jupiterMechanism,
    saturnActivating,
    saturnMechanism,
    doubleTransitActive,
    aifasConditionsMet,
    probabilityScore,
    verdict,
    shastricExplanation,
  };
}
