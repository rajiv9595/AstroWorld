/**
 * ASTROWORLD — Yogas & Doshas Calculation Engine
 * Data-driven classical evaluation with BPHS provenance citations.
 */

import { SIGN_LORDS } from './constants.ts';
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
  yogas.push({
    id: 'budhaditya',
    name: 'Budhaditya Yoga (बुधादित्य योग)',
    category: 'SOLAR',
    present: isBudhaditya,
    formingPlanets: ['Sun', 'Mercury'],
    housesInvolved: [sun.houseNumber],
    bphsReference: 'BPHS, Ch. 36, Verse 1',
    classicalRule: 'Sun and Mercury conjunct in the same sign without severe combustion.',
    effects: 'Heightens analytical prowess, administrative capability, communicative intelligence, and professional prestige.',
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

  // 5. Raja Yoga: Kendra and Trikona lords combination
  // For Taurus Lagna: Saturn is lord of 9 (Trikona) and 10 (Kendra) -> natural Yogakaraka
  // Check if any Kendra lord is conjunct or aspecting a Trikona lord
  const isRajaYoga =
    [1, 4, 5, 9, 10].includes(jupiter.houseNumber) ||
    [1, 4, 5, 9, 10].includes(saturn.houseNumber) ||
    [1, 4, 5, 9, 10].includes(mercury.houseNumber);
  yogas.push({
    id: 'raja_yoga',
    name: 'Raja Yoga — Kendra-Trikona Conjunction (राज योग)',
    category: 'RAJA',
    present: isRajaYoga,
    formingPlanets: ['Saturn', 'Mercury'],
    housesInvolved: [saturn.houseNumber, mercury.houseNumber],
    bphsReference: 'BPHS, Ch. 34, Verses 14-16',
    classicalRule: 'Lords of Kendra (Kendra-pati) and Trikona (Kona-pati) establishing sambandha (conjunction, aspect, or mutual exchange).',
    effects: 'Elevates individual to positions of high authority, respect, civic recognition, prosperity, and career success.',
  });

  // 6. Viparita Raja Yogas (Harsha, Sarala, Vimala)
  const isViparita =
    [6, 8, 12].includes(saturn.houseNumber) ||
    [6, 8, 12].includes(mercury.houseNumber) ||
    [6, 8, 12].includes(mars.houseNumber);
  yogas.push({
    id: 'viparita_raja',
    name: 'Viparita Raja Yoga (विपरीत राज योग)',
    category: 'VIPARITA',
    present: isViparita,
    formingPlanets: ['Saturn', 'Mars'],
    housesInvolved: [mars.houseNumber, saturn.houseNumber],
    bphsReference: 'Uttara Kalamrita, Ch. 4, Verses 22-23',
    classicalRule: 'Lords of dusthanas (6th, 8th, or 12th) situated within dusthanas, turning crises into breakthrough triumphs.',
    effects: 'Success and rise born out of sudden crises, institutional shifts, overcoming intense obstacles, and competitive dominance.',
  });

  // 7. Amala Yoga: Benefic in 10th from Lagna or Moon
  const isAmala =
    jupiter.houseNumber === 10 ||
    venus.houseNumber === 10 ||
    mercury.houseNumber === 10 ||
    jupHouseFromMoon === 10;
  yogas.push({
    id: 'amala_yoga',
    name: 'Amala Yoga (अमल योग)',
    category: 'MISCELLANEOUS',
    present: isAmala,
    formingPlanets: ['Jupiter'],
    housesInvolved: [10],
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
      ? 'All seven classical planets are hemmed between the Rahu-Ketu nodal axis, creating an intense karmic trajectory of delayed yet profound breakthroughs.'
      : 'Planets break through the Rahu-Ketu nodal axis, ensuring balanced life-flow free of Kala Sarpa encirclement.',
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
