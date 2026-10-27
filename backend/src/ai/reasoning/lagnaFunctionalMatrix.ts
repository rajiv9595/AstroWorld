/**
 * ASTROWORLD AI V3 — Lagna-Specific Functional Benefic/Malefic Matrix
 * Shastric foundation from Brihat Parashara Hora Shastra (BPHS Ch. 34: Functional Nature of Planets)
 * Evaluates the exact functional dignity, Yogakarakas, Badhakas, and Marakas for all 12 Ascendants.
 */

export interface LagnaFunctionalProfile {
  lagnaSign: string;
  lagnaLord: string;
  yogakarakas: string[];
  functionalBenefics: string[];
  functionalMalefics: string[];
  functionalNeutrals: string[];
  systemsApproachMalefics?: string[];
  systemsApproachBenefics?: string[];
  badhakaHouse: number;
  badhakaLord: string;
  marakaHouses: number[];
  marakaLords: string[];
  keyRajaYogas: string[];
  shastricVerdict: string;
}

export const LAGNA_FUNCTIONAL_PROFILES: Record<string, LagnaFunctionalProfile> = {
  Aries: {
    lagnaSign: 'Aries',
    lagnaLord: 'Mars',
    yogakarakas: ['Jupiter', 'Sun'],
    functionalBenefics: ['Sun', 'Jupiter', 'Mars'],
    functionalMalefics: ['Mercury', 'Venus', 'Saturn'],
    functionalNeutrals: ['Moon'],
systemsApproachMalefics: ["Mercury", "Rahu", "Ketu"],
    systemsApproachBenefics: ["Sun", "Moon", "Mars", "Jupiter", "Venus", "Saturn"],
        badhakaHouse: 11, // Movable sign: 11th house is Badhaka
    badhakaLord: 'Saturn',
    marakaHouses: [2, 7],
    marakaLords: ['Venus'],
    keyRajaYogas: [
      'Sun (5th lord) + Jupiter (9th lord) mutual aspect or conjunction (Supreme Dharma-Karmadhipati Yoga)',
      'Mars (1st lord) + Jupiter (9th lord) in Kendra or Trikona'
    ],
    shastricVerdict: 'For Aries Ascendant, Jupiter is the prime Bhagyadhipati (9th lord) and Sun is the auspicious 5th lord. Saturn is the 10th lord of profession but also the 11th lord Badhaka, requiring disciplined effort rather than easy shortcuts.'
  },
  Taurus: {
    lagnaSign: 'Taurus',
    lagnaLord: 'Venus',
    yogakarakas: ['Saturn'],
    functionalBenefics: ['Saturn', 'Mercury'],
    functionalMalefics: ['Jupiter', 'Mars', 'Moon'],
    functionalNeutrals: ['Venus', 'Sun'],
systemsApproachMalefics: ["Venus", "Jupiter", "Mars", "Rahu", "Ketu"],
    systemsApproachBenefics: ["Sun", "Moon", "Mercury", "Saturn"],
        badhakaHouse: 9, // Fixed sign: 9th house is Badhaka
    badhakaLord: 'Saturn',
    marakaHouses: [2, 7],
    marakaLords: ['Mercury', 'Mars'],
    keyRajaYogas: [
      'Saturn as solitary Yogakaraka owning both 9th (Trikona) and 10th (Kendra)',
      'Mercury (2nd/5th lord) + Saturn (9th/10th lord) conferring immense wealth and executive authority'
    ],
    shastricVerdict: 'For Taurus Ascendant, Saturn is the supreme Yogakaraka commanding the 9th and 10th houses. Jupiter acts as a major functional malefic (owning 8th and 11th), while Mercury is a great wealth-giver (owning 2nd and 5th).'
  },
  Gemini: {
    lagnaSign: 'Gemini',
    lagnaLord: 'Mercury',
    yogakarakas: ['Venus'],
    functionalBenefics: ['Venus'],
    functionalMalefics: ['Mars', 'Jupiter', 'Sun'],
    functionalNeutrals: ['Mercury', 'Saturn'],
systemsApproachMalefics: ["Rahu", "Ketu"],
    systemsApproachBenefics: ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"],
        badhakaHouse: 7, // Dual sign: 7th house is Badhaka
    badhakaLord: 'Jupiter',
    marakaHouses: [2, 7],
    marakaLords: ['Moon', 'Jupiter'],
    keyRajaYogas: [
      'Mercury (1st/4th lord) + Venus (5th lord) creating powerful Lakshmi-Narayana Yoga',
      'Saturn (9th lord) + Venus (5th lord) in harmonious placement'
    ],
    shastricVerdict: 'For Gemini Ascendant, Venus is the prime benefic and 5th lord of intellect and fortune. Jupiter suffers from Kendradhipati Dosha and Badhaka status (owning 7th and 10th), demanding caution in partnerships.'
  },
  Cancer: {
    lagnaSign: 'Cancer',
    lagnaLord: 'Moon',
    yogakarakas: ['Mars'],
    functionalBenefics: ['Mars', 'Jupiter'],
    functionalMalefics: ['Venus', 'Mercury', 'Saturn'],
    functionalNeutrals: ['Moon', 'Sun'],
systemsApproachMalefics: ["Jupiter", "Saturn", "Rahu", "Ketu"],
    systemsApproachBenefics: ["Sun", "Moon", "Mars", "Mercury", "Venus"],
        badhakaHouse: 11,
    badhakaLord: 'Venus',
    marakaHouses: [2, 7],
    marakaLords: ['Sun', 'Saturn'],
    keyRajaYogas: [
      'Mars as solitary Yogakaraka owning 5th (Trikona) and 10th (Kendra)',
      'Jupiter (9th lord) + Mars (10th lord) forming sovereign Dharma-Karmadhipati Yoga'
    ],
    shastricVerdict: 'For Cancer Ascendant, Mars is the most powerful Yogakaraka capable of giving high rank and leadership. Venus is a functional malefic (4th and 11th lord Badhaka), while Jupiter provides noble 9th-house luck.'
  },
  Leo: {
    lagnaSign: 'Leo',
    lagnaLord: 'Sun',
    yogakarakas: ['Mars'],
    functionalBenefics: ['Mars', 'Jupiter', 'Sun'],
    functionalMalefics: ['Venus', 'Mercury', 'Saturn'],
    functionalNeutrals: ['Moon'],
systemsApproachMalefics: ["Moon", "Rahu", "Ketu"],
    systemsApproachBenefics: ["Sun", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"],
        badhakaHouse: 9,
    badhakaLord: 'Mars',
    marakaHouses: [2, 7],
    marakaLords: ['Mercury', 'Saturn'],
    keyRajaYogas: [
      'Mars owning 4th (Kendra) and 9th (Trikona) as Yogakaraka',
      'Sun (1st lord) + Mars (9th lord) conferring undisputed authority and social prestige'
    ],
    shastricVerdict: 'For Leo Ascendant, Mars acts as premier Yogakaraka (4th and 9th lord), bestowing land, authority, and executive drive. Saturn is an adversary (6th and 7th lord), making partnerships hard-earned.'
  },
  Virgo: {
    lagnaSign: 'Virgo',
    lagnaLord: 'Mercury',
    yogakarakas: ['Venus'],
    functionalBenefics: ['Venus'],
    functionalMalefics: ['Mars', 'Jupiter', 'Moon'],
    functionalNeutrals: ['Mercury', 'Saturn', 'Sun'],
systemsApproachMalefics: ["Saturn", "Mars", "Sun", "Rahu", "Ketu"],
    systemsApproachBenefics: ["Moon", "Mercury", "Jupiter", "Venus"],
        badhakaHouse: 7,
    badhakaLord: 'Jupiter',
    marakaHouses: [2, 7],
    marakaLords: ['Venus', 'Jupiter'],
    keyRajaYogas: [
      'Mercury (1st/10th lord) + Venus (2nd/9th lord Bhagyadhipati)',
      'Mercury in Virgo Lagna creating Bhadra Maha Purusha Yoga'
    ],
    shastricVerdict: 'For Virgo Ascendant, Venus is the auspicious 9th lord of fortune. Jupiter has Kendradhipati and Badhaka blemish (4th and 7th lord), while Mars is the primary functional malefic (3rd and 8th lord).'
  },
  Libra: {
    lagnaSign: 'Libra',
    lagnaLord: 'Venus',
    yogakarakas: ['Saturn'],
    functionalBenefics: ['Saturn', 'Mercury'],
    functionalMalefics: ['Jupiter', 'Sun', 'Mars'],
    functionalNeutrals: ['Venus', 'Moon'],
systemsApproachMalefics: ["Mercury", "Rahu", "Ketu"],
    systemsApproachBenefics: ["Sun", "Moon", "Mars", "Jupiter", "Venus", "Saturn"],
        badhakaHouse: 11,
    badhakaLord: 'Sun',
    marakaHouses: [2, 7],
    marakaLords: ['Mars'],
    keyRajaYogas: [
      'Saturn owning 4th (Kendra) and 5th (Trikona) as supreme Yogakaraka',
      'Mercury (9th lord) + Saturn (5th lord) forming auspicious Trikona Dhana Yoga'
    ],
    shastricVerdict: 'For Libra Ascendant, Saturn is the benevolent Yogakaraka bringing stable wealth and profound success. Jupiter is an aggressive functional malefic (3rd and 6th lord), meaning competitive friction must be handled prudently.'
  },
  Scorpio: {
    lagnaSign: 'Scorpio',
    lagnaLord: 'Mars',
    yogakarakas: ['Jupiter', 'Sun'],
    functionalBenefics: ['Jupiter', 'Sun', 'Moon'],
    functionalMalefics: ['Mercury', 'Venus', 'Saturn'],
    functionalNeutrals: ['Mars'],
systemsApproachMalefics: ["Mars", "Venus", "Rahu", "Ketu"],
    systemsApproachBenefics: ["Sun", "Moon", "Mercury", "Jupiter", "Saturn"],
        badhakaHouse: 9,
    badhakaLord: 'Moon',
    marakaHouses: [2, 7],
    marakaLords: ['Jupiter', 'Venus'],
    keyRajaYogas: [
      'Sun (10th lord) + Moon (9th lord) producing premier Dharma-Karmadhipati Raja Yoga',
      'Jupiter (5th lord) + Sun (10th lord) conferring governance and intellectual eminence'
    ],
    shastricVerdict: 'For Scorpio Ascendant, Sun (10th lord) and Moon (9th lord) create supreme royal alignment. Mercury is the worst functional malefic (8th and 11th lord), while Jupiter guards wealth and progeny as 5th lord.'
  },
  Sagittarius: {
    lagnaSign: 'Sagittarius',
    lagnaLord: 'Jupiter',
    yogakarakas: ['Sun', 'Mars'],
    functionalBenefics: ['Sun', 'Mars'],
    functionalMalefics: ['Venus', 'Mercury', 'Saturn'],
    functionalNeutrals: ['Jupiter', 'Moon'],
systemsApproachMalefics: ["Moon", "Rahu", "Ketu"],
    systemsApproachBenefics: ["Sun", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"],
        badhakaHouse: 7,
    badhakaLord: 'Mercury',
    marakaHouses: [2, 7],
    marakaLords: ['Saturn', 'Mercury'],
    keyRajaYogas: [
      'Sun (9th lord) + Mercury (10th lord) creating classical Budhaditya Dharma-Karma Yoga',
      'Mars (5th lord) + Jupiter (Lagna lord) producing leadership prowess'
    ],
    shastricVerdict: 'For Sagittarius Ascendant, Sun is the pure Bhagyadhipati (9th lord) and Mars is the dynamic 5th lord. Venus is an uncompromising functional malefic (6th and 11th lord), while Mercury requires careful balance as 10th and 7th Badhaka.'
  },
  Capricorn: {
    lagnaSign: 'Capricorn',
    lagnaLord: 'Saturn',
    yogakarakas: ['Venus'],
    functionalBenefics: ['Venus', 'Mercury'],
    functionalMalefics: ['Mars', 'Jupiter', 'Moon'],
    functionalNeutrals: ['Saturn', 'Sun'],
systemsApproachMalefics: ["Sun", "Jupiter", "Rahu", "Ketu"],
    systemsApproachBenefics: ["Moon", "Mars", "Mercury", "Venus", "Saturn"],
        badhakaHouse: 11,
    badhakaLord: 'Mars',
    marakaHouses: [2, 7],
    marakaLords: ['Saturn', 'Moon'],
    keyRajaYogas: [
      'Venus as solitary Yogakaraka owning 5th (Trikona) and 10th (Kendra)',
      'Mercury (9th lord) + Venus (10th lord) producing world-class commercial and administrative success'
    ],
    shastricVerdict: 'For Capricorn Ascendant, Venus is the dazzling Yogakaraka commanding career and fortune. Jupiter is functional malefic (3rd and 12th lord), while Mars is an intense Badhaka (11th lord) despite owning the 4th.'
  },
  Aquarius: {
    lagnaSign: 'Aquarius',
    lagnaLord: 'Saturn',
    yogakarakas: ['Venus'],
    functionalBenefics: ['Venus', 'Saturn'],
    functionalMalefics: ['Jupiter', 'Moon', 'Mars'],
    functionalNeutrals: ['Mercury', 'Sun'],
systemsApproachMalefics: ["Moon", "Mercury", "Rahu", "Ketu"],
    systemsApproachBenefics: ["Sun", "Mars", "Jupiter", "Venus", "Saturn"],
        badhakaHouse: 9,
    badhakaLord: 'Venus',
    marakaHouses: [2, 7],
    marakaLords: ['Jupiter', 'Sun'],
    keyRajaYogas: [
      'Venus owning 4th (Kendra) and 9th (Trikona) as paramount Yogakaraka',
      'Saturn (1st lord) + Venus (9th lord) creating stable lifelong prosperity'
    ],
    shastricVerdict: 'For Aquarius Ascendant, Venus is the paramount Yogakaraka bringing elegance, property, and fortune. Jupiter is a functional malefic (2nd and 11th Dhana lord but inherently inimical to Saturn Lagna), requiring grounded realism.'
  },
  Pisces: {
    lagnaSign: 'Pisces',
    lagnaLord: 'Jupiter',
    yogakarakas: ['Moon', 'Mars'],
    functionalBenefics: ['Moon', 'Mars'],
    functionalMalefics: ['Saturn', 'Venus', 'Sun', 'Mercury'],
    functionalNeutrals: ['Jupiter'],
systemsApproachMalefics: ["Sun", "Venus", "Saturn", "Rahu", "Ketu"],
    systemsApproachBenefics: ["Moon", "Mars", "Mercury", "Jupiter"],
        badhakaHouse: 7,
    badhakaLord: 'Mercury',
    marakaHouses: [2, 7],
    marakaLords: ['Mars', 'Mercury'],
    keyRajaYogas: [
      'Mars (9th lord) + Moon (5th lord) forming celebrated Chandra-Mangala Dharma Yoga',
      'Jupiter (1st/10th lord) + Mars (9th lord) creating royal administrative authority'
    ],
    shastricVerdict: 'For Pisces Ascendant, Mars is the supreme benefic owning the 9th house of fortune (and 2nd of wealth), and Moon is the pure 5th lord. Venus is an extreme functional malefic (3rd and 8th lord), demanding self-discipline.'
  }
};

export function getLagnaFunctionalProfile(ascendantSign: string): LagnaFunctionalProfile {
  const normalized = ascendantSign.trim().charAt(0).toUpperCase() + ascendantSign.trim().slice(1).toLowerCase();
  const profile = LAGNA_FUNCTIONAL_PROFILES[normalized];
  if (profile) return profile;
  return LAGNA_FUNCTIONAL_PROFILES['Aries'];
}

export function evaluatePlanetForLagna(ascendantSign: string, planet: string): {
  role: 'yogakaraka' | 'functional_benefic' | 'functional_malefic' | 'neutral' | 'badhaka';
  explanation: string;
} {
  const profile = getLagnaFunctionalProfile(ascendantSign);
  const p = planet.trim().charAt(0).toUpperCase() + planet.trim().slice(1).toLowerCase();

  if (profile.yogakarakas.includes(p)) {
    return {
      role: 'yogakaraka',
      explanation: `${p} is the solitary or premier Yogakaraka for ${profile.lagnaSign} Lagna, commanding both Kendra (quadrant) and Trikona (trine) houses to deliver peak success.`
    };
  }
  if (p === profile.badhakaLord) {
    return {
      role: 'badhaka',
      explanation: `${p} holds the Badhaka portfolio (obstruction lord from House ${profile.badhakaHouse}) for ${profile.lagnaSign} Lagna, testing patience before final breakthroughs.`
    };
  }
  if (profile.functionalBenefics.includes(p)) {
    return {
      role: 'functional_benefic',
      explanation: `${p} is an authentic functional benefic for ${profile.lagnaSign} Lagna, supporting favorable outcomes and growth.`
    };
  }
  if (profile.functionalMalefics.includes(p)) {
    return {
      role: 'functional_malefic',
      explanation: `${p} is a functional malefic for ${profile.lagnaSign} Lagna (commanding Dusthana or inimical houses), requiring disciplined right action rather than blind speculation.`
    };
  }

  return {
    role: 'neutral',
    explanation: `${p} operates with mixed or neutral functional disposition for ${profile.lagnaSign} Lagna.`
  };
}
