/**
 * ASTROWORLD — Yogas & Doshas Calculation Engine
 * Data-driven classical evaluation with BPHS provenance citations.
 */

import { SIGN_LORDS, ZODIAC_SIGNS } from './constants.ts';
import { DoshaFact, PlanetName, PlanetPosition, YogaFact, ZodiacSign } from './types.ts';

export function calculateYogasAndDoshas(
  planets: PlanetPosition[],
  ascendantSign: ZodiacSign
): { yogas: YogaFact[]; doshas: DoshaFact[] } {
  const yogas: YogaFact[] = [];
  const doshas: DoshaFact[] = [];

  const getPlanet = (name: PlanetName) => planets.find((p) => p.name === name)!;
  const sun = getPlanet('Sun');
  const moon = getPlanet('Moon');
  const mars = getPlanet('Mars');
  const mercury = getPlanet('Mercury');
  const jupiter = getPlanet('Jupiter');
  const venus = getPlanet('Venus');
  const saturn = getPlanet('Saturn');
  const rahu = getPlanet('Rahu');
  const ketu = getPlanet('Ketu');

  const kendraHouses = [1, 4, 7, 10];
  const trikonaHouses = [1, 5, 9];

  // 1. Pancha Mahapurusha Yogas
  // Ruchaka
  const isRuchaka =
    kendraHouses.includes(mars.houseNumber) &&
    ['Aries', 'Scorpio', 'Capricorn'].includes(mars.sign);
  yogas.push({
    id: 'ruchaka',
    name: 'Ruchaka Yoga (रुचक योग)',
    category: 'MAHAPURUSHA',
    present: isRuchaka,
    formingPlanets: ['Mars'],
    housesInvolved: [mars.houseNumber],
    bphsReference: 'BPHS, Ch. 75, Verses 1-4',
    classicalRule: 'Mars in own sign (Aries, Scorpio) or exaltation sign (Capricorn) situated in a Kendra from Lagna.',
    effects: 'Grants exceptional courage, physical vigor, executive authority, commanding presence, victory over adversaries, and engineering acumen.',
  });

  // Bhadra
  const isBhadra =
    kendraHouses.includes(mercury.houseNumber) &&
    ['Gemini', 'Virgo'].includes(mercury.sign);
  yogas.push({
    id: 'bhadra',
    name: 'Bhadra Yoga (भद्र योग)',
    category: 'MAHAPURUSHA',
    present: isBhadra,
    formingPlanets: ['Mercury'],
    housesInvolved: [mercury.houseNumber],
    bphsReference: 'BPHS, Ch. 75, Verses 5-8',
    classicalRule: 'Mercury in own sign (Gemini) or exaltation/own sign (Virgo) situated in a Kendra from Lagna.',
    effects: 'Bestows sharp intellect, eloquent speech, profound scholarship, commercial mastery, and longevity.',
  });

  // Hamsa
  const isHamsa =
    kendraHouses.includes(jupiter.houseNumber) &&
    ['Sagittarius', 'Pisces', 'Cancer'].includes(jupiter.sign);
  yogas.push({
    id: 'hamsa',
    name: 'Hamsa Yoga (हंस योग)',
    category: 'MAHAPURUSHA',
    present: isHamsa,
    formingPlanets: ['Jupiter'],
    housesInvolved: [jupiter.houseNumber],
    bphsReference: 'BPHS, Ch. 75, Verses 9-12',
    classicalRule: 'Jupiter in own sign (Sagittarius, Pisces) or exaltation sign (Cancer) situated in a Kendra from Lagna.',
    effects: 'Endows with spiritual wisdom, ethical nobility, reverence from leaders, righteous character, and scholarly fame.',
  });

  // Malavya
  const isMalavya =
    kendraHouses.includes(venus.houseNumber) &&
    ['Taurus', 'Libra', 'Pisces'].includes(venus.sign);
  yogas.push({
    id: 'malavya',
    name: 'Malavya Yoga (मालव्य योग)',
    category: 'MAHAPURUSHA',
    present: isMalavya,
    formingPlanets: ['Venus'],
    housesInvolved: [venus.houseNumber],
    bphsReference: 'BPHS, Ch. 75, Verses 13-16',
    classicalRule: 'Venus in own sign (Taurus, Libra) or exaltation sign (Pisces) situated in a Kendra from Lagna.',
    effects: 'Confers beauty, refinement, artistic mastery, wealth, luxurious comforts, domestic bliss, and magnetic attraction.',
  });

  // Sasa
  const isSasa =
    kendraHouses.includes(saturn.houseNumber) &&
    ['Capricorn', 'Aquarius', 'Libra'].includes(saturn.sign);
  yogas.push({
    id: 'sasa',
    name: 'Sasa Yoga (शश योग)',
    category: 'MAHAPURUSHA',
    present: isSasa,
    formingPlanets: ['Saturn'],
    housesInvolved: [saturn.houseNumber],
    bphsReference: 'BPHS, Ch. 75, Verses 17-20',
    classicalRule: 'Saturn in own sign (Capricorn, Aquarius) or exaltation sign (Libra) situated in a Kendra from Lagna.',
    effects: 'Grants steadfast endurance, mass leadership, administrative power over land or organizations, discipline, and strategic tenacity.',
  });

  // 2. Gajakesari Yoga: Jupiter in Kendra from Moon
  const moonHouse = moon.houseNumber;
  const jupHouseFromMoon = ((jupiter.houseNumber - moonHouse + 12) % 12) + 1;
  const isGajakesari = kendraHouses.includes(jupHouseFromMoon);
  yogas.push({
    id: 'gajakesari',
    name: 'Gajakesari Yoga (गजकेसरी योग)',
    category: 'CHANDRA',
    present: isGajakesari,
    formingPlanets: ['Jupiter', 'Moon'],
    housesInvolved: [moon.houseNumber, jupiter.houseNumber],
    bphsReference: 'BPHS, Ch. 36, Verses 3-4',
    classicalRule: 'Jupiter in an angular house (1st, 4th, 7th, or 10th) from the natal Moon.',
    effects: 'Bestows invincible reputation, enduring prosperity, intellectual brilliance, overcoming enemies, and noble character.',
  });

  // 3. Budhaditya Yoga: Sun and Mercury conjunct
  const isBudhaditya = sun.sign === mercury.sign;
  const budhadityaQualification = mercury.combust ? 'Mercury is combust; the conjunction is structurally present but its expression requires qualification.' : 'No combustion qualification flagged by the engine.';
  yogas.push({
    id: 'budhaditya',
    name: 'Budhaditya Yoga (बुधादित्य योग)',
    category: 'SOLAR',
    present: isBudhaditya,
    formingPlanets: ['Sun', 'Mercury'],
    housesInvolved: [sun.houseNumber],
    bphsReference: 'BPHS, Ch. 36, Verse 1',
    classicalRule: 'Sun and Mercury conjunct in the same sign without severe combustion.',
    effects: `Structural conjunction detected. ${budhadityaQualification}`,
  });

  // 4. Chandra-Mangala Yoga: Moon and Mars conjunct or mutual aspect
  const isChandraMangala =
    moon.sign === mars.sign ||
    Math.abs(moon.houseNumber - mars.houseNumber) === 6;
  yogas.push({
    id: 'chandra_mangala',
    name: 'Chandra-Mangala Yoga (चन्द्र-मंगल योग)',
    category: 'DHANA',
    present: isChandraMangala,
    formingPlanets: ['Moon', 'Mars'],
    housesInvolved: [moon.houseNumber, mars.houseNumber],
    bphsReference: 'BPHS, Ch. 36, Verse 15',
    classicalRule: 'Moon and Mars in conjunction or in mutual 7th aspect.',
    effects: 'Strong wealth-generating potential through bold enterprise, commerce, property investments, and energetic resourcefulness.',
  });

  // 5. Raja Yoga: actual Kendra/Trikona lord sambandha.
  // A planet must be the lord of the relevant house(s); merely occupying a
  // kendra/trikona is not sufficient to establish this named yoga.
  const getHouseLord = (house: number): PlanetName => {
    // Ascendant sign is represented by house 1; derive each house sign from the canonical zodiac order.
    const ascIndex = ZODIAC_SIGNS.indexOf(ascendantSign);
    const houseSign = ZODIAC_SIGNS[(ascIndex + house - 1 + 12) % 12];
    return SIGN_LORDS[houseSign];
  };
  const lordHouse = (planet: PlanetName) => getPlanet(planet).houseNumber;
  const sambandha = (a: PlanetName, b: PlanetName): boolean => {
    if (a === b) return true; // single planet owning both Kendra and Trikona = Yogakaraka structure
    const pa = getPlanet(a);
    const pb = getPlanet(b);
    const sameHouse = pa.houseNumber === pb.houseNumber;
    const mutualAspect = ((pa.houseNumber - pb.houseNumber + 12) % 12) === 6;
    const oneInOthersSign = SIGN_LORDS[pa.sign] === b || SIGN_LORDS[pb.sign] === a;
    const exchange = SIGN_LORDS[pa.sign] === b && SIGN_LORDS[pb.sign] === a;
    return sameHouse || mutualAspect || oneInOthersSign || exchange;
  };
  const kendraLords = kendraHouses.map(getHouseLord);
  const trikonaLords = [5, 9].map(getHouseLord);
  const rajaPairs = kendraLords.flatMap(k =>
    trikonaLords.filter(t => sambandha(k, t)).map(t => [k, t] as [PlanetName, PlanetName])
  );
  const isRajaYoga = rajaPairs.length > 0;
  const rajaPlanets = Array.from(new Set(rajaPairs.flat()));
  const rajaHouses = Array.from(new Set(rajaPlanets.map(p => getPlanet(p).houseNumber)));
  yogas.push({
    id: 'raja_yoga',
    name: 'Raja Yoga — Kendra-Trikona Lord Sambandha (राज योग)',
    category: 'RAJA',
    present: isRajaYoga,
    formingPlanets: rajaPlanets,
    housesInvolved: rajaHouses,
    bphsReference: 'BPHS, Ch. 34, Verses 14-16',
    classicalRule: 'A Kendra lord and Trikona lord establish sambandha by conjunction, mutual 7th aspect, exchange, or a single planet owning both functional groups.',
    effects: 'Indicates a classical authority/prosperity combination; actual manifestation depends on dignity, strength, dasha activation, and affliction.',
  });

  // 6. Viparita Raja Yogas — evaluate the actual dusthana lords.
  const dusthanas = [6, 8, 12];
  const dusthanaLordMap = new Map<number, PlanetName>(
    dusthanas.map(h => [h, getHouseLord(h)])
  );
  const harshaLord = dusthanaLordMap.get(6)!;
  const saralaLord = dusthanaLordMap.get(8)!;
  const vimalaLord = dusthanaLordMap.get(12)!;
  const harsha = dusthanas.includes(lordHouse(harshaLord));
  const sarala = dusthanas.includes(lordHouse(saralaLord));
  const vimala = dusthanas.includes(lordHouse(vimalaLord));
  const viparitaPlanets = Array.from(new Set([
    ...(harsha ? [harshaLord] : []),
    ...(sarala ? [saralaLord] : []),
    ...(vimala ? [vimalaLord] : []),
  ]));
  const viparitaHouses = Array.from(new Set(viparitaPlanets.map(p => lordHouse(p))));
  const isViparita = viparitaPlanets.length > 0;
  yogas.push({
    id: 'harsha_viparita',
    name: 'Harsha Viparita Raja Yoga (हर्ष विपरीत राज योग)',
    category: 'VIPARITA',
    present: harsha,
    formingPlanets: [harshaLord],
    housesInvolved: harsha ? [6, lordHouse(harshaLord)] : [6],
    bphsReference: 'Uttara Kalamrita, Ch. 4, Verses 22-23',
    classicalRule: 'The 6th lord is placed in a dusthana (6th, 8th, or 12th).',
    effects: 'Potential rise through overcoming competition, obstacles, debts, or service-related adversity.',
  });
  yogas.push({
    id: 'sarala_viparita',
    name: 'Sarala Viparita Raja Yoga (सरल विपरीत राज योग)',
    category: 'VIPARITA',
    present: sarala,
    formingPlanets: [saralaLord],
    housesInvolved: sarala ? [8, lordHouse(saralaLord)] : [8],
    bphsReference: 'Uttara Kalamrita, Ch. 4, Verses 22-23',
    classicalRule: 'The 8th lord is placed in a dusthana (6th, 8th, or 12th).',
    effects: 'Potential resilience and gains through transformation, hidden matters, and crises.',
  });
  yogas.push({
    id: 'vimala_viparita',
    name: 'Vimala Viparita Raja Yoga (विमल विपरीत राज योग)',
    category: 'VIPARITA',
    present: vimala,
    formingPlanets: [vimalaLord],
    housesInvolved: vimala ? [12, lordHouse(vimalaLord)] : [12],
    bphsReference: 'Uttara Kalamrita, Ch. 4, Verses 22-23',
    classicalRule: 'The 12th lord is placed in a dusthana (6th, 8th, or 12th).',
    effects: 'Potential independence and constructive results from expenditure, foreign links, isolation, or release.',
  });
  // Backward-compatible aggregate for callers that consume a single Viparita flag.
  yogas.push({
    id: 'viparita_raja',
    name: 'Viparita Raja Yoga — Aggregate',
    category: 'VIPARITA',
    present: isViparita,
    formingPlanets: viparitaPlanets,
    housesInvolved: viparitaHouses,
    bphsReference: 'Uttara Kalamrita, Ch. 4, Verses 22-23',
    classicalRule: 'At least one specific dusthana-lord Viparita condition is satisfied.',
    effects: 'Interpret only after identifying the specific Harsha, Sarala, or Vimala formation and its strength.',
  });

  // 7. Amala Yoga: Benefic in 10th from Lagna or Moon
  const venusHouseFromMoon = ((venus.houseNumber - moonHouse + 12) % 12) + 1;
  const mercuryHouseFromMoon = ((mercury.houseNumber - moonHouse + 12) % 12) + 1;
  const amalaPlanets = new Set<PlanetName>();
  if ([jupiter.houseNumber, venus.houseNumber, mercury.houseNumber].includes(10)) {
    if (jupiter.houseNumber === 10) amalaPlanets.add('Jupiter');
    if (venus.houseNumber === 10) amalaPlanets.add('Venus');
    if (mercury.houseNumber === 10) amalaPlanets.add('Mercury');
  }
  if ([jupHouseFromMoon, venusHouseFromMoon, mercuryHouseFromMoon].includes(10)) {
    if (jupHouseFromMoon === 10) amalaPlanets.add('Jupiter');
    if (venusHouseFromMoon === 10) amalaPlanets.add('Venus');
    if (mercuryHouseFromMoon === 10) amalaPlanets.add('Mercury');
  }
  const amalaFormingPlanets = Array.from(amalaPlanets);
  const amalaHouses = Array.from(new Set([
    ...amalaFormingPlanets.map(p => getPlanet(p).houseNumber),
  ]));
  const isAmala = amalaFormingPlanets.length > 0;
  yogas.push({
    id: 'amala_yoga',
    name: 'Amala Yoga (अमल योग)',
    category: 'MISCELLANEOUS',
    present: isAmala,
    formingPlanets: amalaFormingPlanets,
    housesInvolved: amalaHouses.length > 0 ? amalaHouses : [10],
    bphsReference: 'BPHS, Ch. 36, Verse 21',
    classicalRule: 'A natural benefic (Jupiter, Venus, Mercury) occupying the 10th house from Lagna or Moon.',
    effects: 'Brings spotless professional reputation, benevolent leadership, enduring honor, and virtuous conduct throughout career.',
  });

  // DOSHAS
  // 1. Manglik / Kuja Dosha
  // Mars in 1, 4, 7, 8, 12 from Lagna
  const manglikHouses = [1, 4, 7, 8, 12];
  const isManglikFromLagna = manglikHouses.includes(mars.houseNumber);
  const marsHouseFromMoon = ((mars.houseNumber - moon.houseNumber + 12) % 12) + 1;
  const isManglikFromMoon = manglikHouses.includes(marsHouseFromMoon);
  const isManglik = isManglikFromLagna || isManglikFromMoon;

  const mitigating: string[] = [];
  if (mars.sign === 'Aries') mitigating.push('Mars is in its own sign (Aries), substantially neutralizing adverse fire.');
  // Aspect cancellations
  const diffJupMars = (mars.houseNumber - jupiter.houseNumber + 12) % 12;
  const isJupAspectingMars = diffJupMars === 6 || diffJupMars === 4 || diffJupMars === 8;
  if (isJupAspectingMars) mitigating.push('Jupiter aspects Mars, providing cooling benefic protection.');

  const diffSatMars = (mars.houseNumber - saturn.houseNumber + 12) % 12;
  const isSatAspectingMars = diffSatMars === 6 || diffSatMars === 2 || diffSatMars === 9;
  if (isSatAspectingMars) mitigating.push('Saturn balances marital impulse with patience and discipline.');

  doshas.push({
    id: 'kuja_dosha',
    name: 'Manglik / Kuja Dosha (कुज दोष)',
    present: isManglik,
    severity: isManglik ? (mitigating.length > 0 ? 'MILD' : 'MEDIUM') : 'NONE',
    description: isManglik
      ? `Mars is placed in house ${mars.houseNumber} from Lagna (and house ${marsHouseFromMoon} from Moon), indicating marital assertiveness and passion.`
      : 'Mars is placed in auspicious neutral houses (2, 3, 5, 6, 9, 10, 11), free from Kuja Dosha.',
    mitigatingFactors: mitigating,
    remedies: [
      'Cultivate open, non-reactive communication in partnerships.',
      'Chant Hanuman Chalisa or Mangala Gayatri.',
      'Honoring energy through disciplined physical exercises.',
    ],
  });

  // 2. Kala Sarpa / Amrita Yoga check
  // Are all 7 planets situated on one side of Rahu-Ketu axis?
  const rahuSignIdx = rahu.signIndex;
  const ketuSignIdx = ketu.signIndex;
  let allOneSide = true;
  for (const p of [sun, moon, mars, mercury, jupiter, venus, saturn]) {
    const diff = ((p.signIndex - rahuSignIdx + 12) % 12);
    if (diff > 6) {
      allOneSide = false;
      break;
    }
  }

  doshas.push({
    id: 'kala_sarpa',
    name: 'Kala Sarpa Dosha / Yoga (काल सर्प योग)',
    present: allOneSide,
    severity: allOneSide ? 'MEDIUM' : 'NONE',
    description: allOneSide
      ? 'All seven classical planets fall within the selected Rahu-Ketu half-axis under this implementation. Kala Sarpa is school-dependent and should not be treated as a universally accepted dosha.'
      : 'The selected Kala Sarpa half-axis condition is not satisfied under this implementation.',
    mitigatingFactors: [
      'Benefic planets in angles provide relief and counter-balance.',
      'Rahu in Pisces/Sagittarius is spiritually oriented.',
    ],
    remedies: [
      'Maha Mrityunjaya Japa for inner peace and mental serenity.',
      'Seva and selfless service to elder mentors.',
    ],
  });

  return { yogas, doshas };
}
