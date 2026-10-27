/**
 * ASTROWORLD — Authentic Remedial Shastra Engine
 * Customized Vedic Upayas, Strict Gemstone Guardrails, Daana, Mantras, and Habit Calibration
 * 
 * Lineage & Authorities:
 * 1. Sage Parashara (BPHS Shanti & Upaya Adhyaya)
 * 2. Prof. V.K. Choudhry (Systems' Approach Gemstone Guardrail Law)
 * 3. Classical Ratna & Daana Samhitas
 * 
 * CORE PRINCIPLE:
 * Gemstones are PRESCRIBED ONLY for Weak Functional Benefics.
 * Gemstones are STRICTLY PROHIBITED for Functional Malefics (which must be pacified via Daana, Japa, and ethical habits).
 */

import { PlanetName, ZodiacSign } from '../../../../shared/engine/types.ts';
import { getLagnaFunctionalProfile } from './lagnaFunctionalMatrix.ts';

export interface GemstoneRecommendation {
  planet: PlanetName;
  gemstoneName: string;
  sanskritName: string;
  suitabilityStatus: 'HIGHLY_RECOMMENDED' | 'STRICTLY_PROHIBITED' | 'CONDITIONAL_WITH_CAUTION';
  metal: string;
  finger: string;
  consecrationDay: string;
  consecrationTime: string;
  rationale: string;
}

export interface DaanaRemedy {
  planet: PlanetName;
  targetAffliction: string;
  itemsToDonate: string[];
  recipientArchetype: string;
  favorableDayAndTime: string;
  spiritualSignificance: string;
}

export interface VedicMantraRemedy {
  planet: PlanetName;
  mantraText: string;
  transliteration: string;
  prescribedRepetitions: number; // e.g. 23,000 for Saturn, 19,000 for Jupiter
  rosaryMalaType: 'Rudraksha' | 'Tulsi' | 'Sphatika' | 'Red Sandalwood' | 'Lotus Seed';
  dailyTarget: string;
  spiritualFocus: string;
}

export interface BehavioralKarmicHabit {
  planet: PlanetName;
  archetypalRoot: string;
  dailyHabitDirective: string;
  environmentalCorrection: string;
}

export interface CompleteRemedialDossier {
  nativeLagna: ZodiacSign;
  recommendedGemstones: GemstoneRecommendation[];
  prohibitedGemstones: GemstoneRecommendation[];
  daanaPrescriptions: DaanaRemedy[];
  mantraSadhana: VedicMantraRemedy[];
  behavioralHabits: BehavioralKarmicHabit[];
  masterRemedialSummary: string;
}

// Classical Beeja Mantras from BPHS & Vedic Samhitas
const MANTRA_DATABASE: Record<PlanetName, {
  text: string;
  translit: string;
  japaCount: number;
  mala: VedicMantraRemedy['rosaryMalaType'];
  focus: string;
}> = {
  Sun: {
    text: 'ॐ ह्रां ह्रीं ह्रौं सः सूर्याय नमः',
    translit: 'Om Hraam Hreem Hraum Sah Sooryaaya Namah',
    japaCount: 7000,
    mala: 'Rudraksha',
    focus: 'Vitality, leadership confidence, physical eyesight, and paternal grace.',
  },
  Moon: {
    text: 'ॐ श्रां श्रीं श्रौं सः चन्द्राय नमः',
    translit: 'Om Shraam Shreem Shraum Sah Chandraaya Namah',
    japaCount: 11000,
    mala: 'Sphatika',
    focus: 'Emotional equilibrium, restful sleep, cognitive calm, and intuitive clarity.',
  },
  Mars: {
    text: 'ॐ क्रां क्रीं क्रौं सः भौमाय नमः',
    translit: 'Om Kraam Kreem Kraum Sah Bhaumaaya Namah',
    japaCount: 10000,
    mala: 'Red Sandalwood',
    focus: 'Courage, physical vitality, engineering stamina, and dissolving impulsive anger.',
  },
  Mercury: {
    text: 'ॐ ब्रां ब्रीं ब्रौं सः बुधाय नमः',
    translit: 'Om Braam Breem Braum Sah Budhaaya Namah',
    japaCount: 9000,
    mala: 'Tulsi',
    focus: 'Intellectual discrimination, clear coding/writing, business acumen, and nervous system ease.',
  },
  Jupiter: {
    text: 'ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः',
    translit: 'Om Graam Greem Graum Sah Gurave Namah',
    japaCount: 19000,
    mala: 'Rudraksha',
    focus: 'Higher wisdom, academic and research honors, ethical expansion, and divine providence.',
  },
  Venus: {
    text: 'ॐ द्रां द्रीं द्रौं सः शुक्राय नमः',
    translit: 'Om Draam Dreem Draum Sah Shukraaya Namah',
    japaCount: 16000,
    mala: 'Sphatika',
    focus: 'Aesthetic harmony, partnership fulfillment, creative refinement, and material grace.',
  },
  Saturn: {
    text: 'ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः',
    translit: 'Om Praam Preem Praum Sah Shanaischaraya Namah',
    japaCount: 23000,
    mala: 'Rudraksha',
    focus: 'Unshakeable endurance, professional permanence, karmic debt release, and humble focus.',
  },
  Rahu: {
    text: 'ॐ भ्रां भ्रीं भ्रौं सः राहवे नमः',
    translit: 'Om Bhraam Bhreem Bhraum Sah Rahave Namah',
    japaCount: 18000,
    mala: 'Rudraksha',
    focus: 'Dissolving obsessive illusions, mental fog, sudden anxiety, and technological mastery.',
  },
  Ketu: {
    text: 'ॐ स्रां स्रीं स्रौं सः केतवे नमः',
    translit: 'Om Sraam Sreem Sraum Sah Ketave Namah',
    japaCount: 17000,
    mala: 'Rudraksha',
    focus: 'Spiritual liberation, detachment from ego friction, deep occult and algorithmic intuition.',
  },
};

// Classical Gemstones details
const GEMSTONE_DATABASE: Record<PlanetName, {
  name: string;
  sanskrit: string;
  metal: string;
  finger: string;
  day: string;
  time: string;
}> = {
  Sun: { name: 'Ruby', sanskrit: 'Manikya (माणिक्य)', metal: 'Gold or Copper', finger: 'Ring Finger', day: 'Sunday', time: 'Within 1 hour of Sunrise' },
  Moon: { name: 'Natural Pearl', sanskrit: 'Mukta (मुक्ता)', metal: 'Silver', finger: 'Little Finger', day: 'Monday', time: 'Evening after Sunset' },
  Mars: { name: 'Red Coral', sanskrit: 'Pravala (प्रवाल)', metal: 'Gold or Copper', finger: 'Ring Finger', day: 'Tuesday', time: 'Morning after Sunrise' },
  Mercury: { name: 'Emerald', sanskrit: 'Marakata (मरकत)', metal: 'Gold or Silver', finger: 'Little Finger', day: 'Wednesday', time: 'Morning 2 hours after Sunrise' },
  Jupiter: { name: 'Yellow Sapphire', sanskrit: 'Pushparaga (पुष्पराग)', metal: 'Gold or Brass', finger: 'Index Finger', day: 'Thursday', time: 'Morning during Jupiter Hora' },
  Venus: { name: 'Diamond / White Zircon', sanskrit: 'Vajra (वज्र)', metal: 'Platinum, White Gold or Silver', finger: 'Middle or Little Finger', day: 'Friday', time: 'Morning during Venus Hora' },
  Saturn: { name: 'Blue Sapphire / Amethyst', sanskrit: 'Neelam (नीलम)', metal: 'Iron, Silver or White Gold', finger: 'Middle Finger', day: 'Saturday', time: 'Saturday Evening at Twilight' },
  Rahu: { name: 'Hessonite Garnet', sanskrit: 'Gomedha (गोमेद)', metal: 'Silver or Ashtadhatu', finger: 'Middle Finger', day: 'Saturday', time: 'Saturday Night' },
  Ketu: { name: "Cat's Eye", sanskrit: 'Vaidoorya (वैडूर्य)', metal: 'Gold or Silver', finger: 'Middle or Ring Finger', day: 'Thursday/Tuesday', time: 'Midnight or Dawn' },
};

// Daana & Pacification Database
const DAANA_DATABASE: Record<PlanetName, {
  items: string[];
  recipient: string;
  time: string;
  significance: string;
}> = {
  Sun: {
    items: ['Wheat grains', 'Jaggery (Gur)', 'Copper vessels', 'Red flowers', 'Ruby/Red cloth'],
    recipient: 'Vedic scholars, public workers, or fatherly figures',
    time: 'Sunday noon',
    significance: 'Dissolves ego friction and ancestral pitru obligations.',
  },
  Moon: {
    items: ['Rice', 'Milk', 'White cloth', 'Silver coin', 'Water to thirsty travelers'],
    recipient: 'Elderly women, mothers, or underprivileged children',
    time: 'Monday evening',
    significance: 'Calms mental turbulence and enhances psychological peace.',
  },
  Mars: {
    items: ['Red lentils (Masoor Dal)', 'Jaggery rotis', 'Red clothing', 'Copper coins'],
    recipient: 'Brothers, soldiers, manual laborers, or feeding cows',
    time: 'Tuesday morning',
    significance: 'Mitigates Manglik Dosha, burns impulsive conflict, and shields against injuries.',
  },
  Mercury: {
    items: ['Whole green gram (Moong Dal)', 'Green vegetables', 'Stationery/Books for students', 'Green cloth'],
    recipient: 'Needy students, schools, or orphanages',
    time: 'Wednesday morning',
    significance: 'Unlocks sharp speech, resolves contract disputes, and cleanses commerce karma.',
  },
  Jupiter: {
    items: ['Yellow split gram (Chana Dal)', 'Turmeric', 'Yellow sweets', 'Spiritual scriptures', 'Saffron'],
    recipient: 'Teachers, priests, sages, or libraries',
    time: 'Thursday morning',
    significance: 'Restores divine blessings, intellectual progress, and moral respect.',
  },
  Venus: {
    items: ['White silk', 'Camphor', 'Ghee', 'Curd/Sugar', 'Cosmetic items for destitute women'],
    recipient: 'Destitute women, female shelters, or artistic centers',
    time: 'Friday sunrise',
    significance: 'Heals relationship rifts and purifies sensory excesses.',
  },
  Saturn: {
    items: ['Black sesame seeds (Til)', 'Mustard oil in iron bowl', 'Black cloth', 'Iron tools', 'Dark blankets'],
    recipient: 'Sanitation workers, disabled elders, or feeding black crows/dogs',
    time: 'Saturday sunset',
    significance: 'Supreme pacification for Sade Sati, Kantaka Shani, and heavy career delays.',
  },
  Rahu: {
    items: ['Coconut floated in flowing water', 'Black and blue blankets', 'Mustard seeds', 'Lead'],
    recipient: 'Sweepers, night watchmen, leprosy centers, or feeding stray dogs',
    time: 'Saturday late evening',
    significance: 'Clears mental phobias, dissolves deceptive traps, and pacifies sudden volatility.',
  },
  Ketu: {
    items: ['Two-colored blanket (Black & White)', 'Sesame seeds', 'Sour food/Lemon rice for dogs', 'Seven grains (Satnaja)'],
    recipient: 'Monks, renunciants, hermits, or stray dogs',
    time: 'Tuesday/Thursday dawn',
    significance: 'Cuts through invisible psychic friction and accelerates spiritual enlightenment.',
  },
};

// Behavioral & Karmic Habit Database
const HABIT_DATABASE: Record<PlanetName, {
  root: string;
  directive: string;
  environmental: string;
}> = {
  Sun: {
    root: 'Solar Alignment & Paternal Karma',
    directive: 'Awaken before sunrise; touch the feet of father/elders daily; stand in gentle morning sunlight for 10 minutes.',
    environmental: 'Keep East entrance uncluttered, allow natural morning sunlight into living space.',
  },
  Moon: {
    root: 'Lunar Hydration & Maternal Respect',
    directive: 'Drink water from a pure silver cup; never insult or neglect mother; practice 15 minutes of evening silence.',
    environmental: 'Keep North-West corner clean and well-lit with soft white or silver ambient light.',
  },
  Mars: {
    root: 'Physical Discipline & Brotherhood',
    directive: 'Engage in rigorous physical exercise; avoid argumentative provocation; maintain protective loyalty toward siblings.',
    environmental: 'Avoid keeping rusted iron, damaged electrical tools, or broken weapons in the South.',
  },
  Mercury: {
    root: 'Ethical Communication & Cognitive Hygiene',
    directive: 'Speak with absolute truthfulness in trade; avoid gossip and deceptive language; read or learn a new technical skill daily.',
    environmental: 'Place broad-leaf green plants in the North; organize study and computer desks without clutter.',
  },
  Jupiter: {
    root: 'Reverence for Knowledge & Mentorship',
    directive: 'Never mock teachers or spiritual traditions; donate educational materials to underprivileged students; eat pure vegetarian meals on Thursdays.',
    environmental: 'Keep North-East (Ishanya) corner completely sacred, clean, and free of heavy junk.',
  },
  Venus: {
    root: 'Aesthetic Refinement & Honor of Feminine Energy',
    directive: 'Treat women with unconditional dignity; wear clean, well-ironed clothing; practice artistic moderation.',
    environmental: 'Keep South-East corner fragrant; burn natural sandalwood incense; avoid dark, dingy spaces.',
  },
  Saturn: {
    root: 'Humility Towards Labor & Time Punctuality',
    directive: 'Treat domestic and sanitation staff with generous respect; be unfailingly punctual; accept hard labor without complaint.',
    environmental: 'Keep West corner stable and anchored; do not allow footwear to clutter doorways.',
  },
  Rahu: {
    root: 'Addiction Cleansing & Mental Simplicity',
    directive: 'Avoid substance abuse, smoking, and late-night digital bingeing; eat freshly cooked hot meals; avoid taking unearned shortcuts.',
    environmental: 'Keep South-West corner absolutely clean; eliminate obsolete tangled cables and broken electronic gadgets.',
  },
  Ketu: {
    root: 'Egoless Service & Spiritual Detachment',
    directive: 'Cultivate humility; do good deeds without bragging; spend time in solitary meditation; show compassionate care to stray animals.',
    environmental: 'Maintain a dedicated prayer/meditation corner; avoid excessive clutter under beds.',
  },
};

/**
 * Generates an authentic, personalized Remedial Shastra Dossier for any Ascendant.
 */
export function generateRemedialDossier(params: {
  lagnaSign: ZodiacSign;
  weakBenefics?: PlanetName[];
  afflictedMalefics?: PlanetName[];
  activeDashaLord?: PlanetName;
}): CompleteRemedialDossier {
  const { lagnaSign, weakBenefics = [], afflictedMalefics = [], activeDashaLord } = params;
  const functionalProfile = getLagnaFunctionalProfile(lagnaSign);

  const fbSet = new Set<PlanetName>(
    functionalProfile ? (functionalProfile.functionalBenefics as PlanetName[]) : []
  );
  const fmSet = new Set<PlanetName>([
    ...(functionalProfile ? (functionalProfile.functionalMalefics as PlanetName[]) : (['Rahu', 'Ketu'] as PlanetName[])),
    ...(functionalProfile?.systemsApproachMalefics ? (functionalProfile.systemsApproachMalefics as PlanetName[]) : []),
    'Rahu' as PlanetName,
    'Ketu' as PlanetName,
  ]);

  const recommendedGemstones: GemstoneRecommendation[] = [];
  const prohibitedGemstones: GemstoneRecommendation[] = [];
  const daanaPrescriptions: DaanaRemedy[] = [];
  const mantraSadhana: VedicMantraRemedy[] = [];
  const behavioralHabits: BehavioralKarmicHabit[] = [];

  // 1. Evaluate Gemstones (Only for Functional Benefics!)
  for (const [planetStr, gemData] of Object.entries(GEMSTONE_DATABASE)) {
    const planet = planetStr as PlanetName;
    const isFB = fbSet.has(planet);
    const isFM = fmSet.has(planet);

    if (isFM) {
      prohibitedGemstones.push({
        planet,
        gemstoneName: gemData.name,
        sanskritName: gemData.sanskrit,
        suitabilityStatus: 'STRICTLY_PROHIBITED',
        metal: 'None',
        finger: 'None',
        consecrationDay: 'Never',
        consecrationTime: 'Never',
        rationale: `STRICT PROHIBITION (Systems' Approach Law): ${planet} is a Functional Malefic for ${lagnaSign} Lagna (governs Dusthana houses 6th, 8th, or 12th). Wearing ${gemData.name} will amplify disease, financial distress, accidents, or conflict. Pacify through Daana and Japa instead.`,
      });
    } else if (isFB) {
      const isWeak = weakBenefics.includes(planet) || planet === functionalProfile?.lagnaLord;
      recommendedGemstones.push({
        planet,
        gemstoneName: gemData.name,
        sanskritName: gemData.sanskrit,
        suitabilityStatus: 'HIGHLY_RECOMMENDED',
        metal: gemData.metal,
        finger: gemData.finger,
        consecrationDay: gemData.day,
        consecrationTime: gemData.time,
        rationale: `APPROVED (Functional Benefic): ${planet} is a life-supporting Functional Benefic for ${lagnaSign} Lagna. Wearing ${gemData.name} safely reinforces vitality, status, and auspicious opportunities.`,
      });
    }
  }

  // 2. Build Daana & Mantras for Active Malefics / Dasha Lords
  const targetsForPacification = new Set<PlanetName>([
    ...afflictedMalefics,
    ...(functionalProfile ? (functionalProfile.functionalMalefics as PlanetName[]) : (['Saturn', 'Rahu', 'Ketu'] as PlanetName[])),
  ]);

  if (activeDashaLord && fmSet.has(activeDashaLord)) {
    targetsForPacification.add(activeDashaLord);
  }

  for (const planet of targetsForPacification) {
    const daanaInfo = DAANA_DATABASE[planet];
    if (daanaInfo) {
      daanaPrescriptions.push({
        planet,
        targetAffliction: `Pacification of ${planet} (Functional Malefic for ${lagnaSign})`,
        itemsToDonate: daanaInfo.items,
        recipientArchetype: daanaInfo.recipient,
        favorableDayAndTime: `${daanaInfo.time}`,
        spiritualSignificance: daanaInfo.significance,
      });
    }

    const mantraInfo = MANTRA_DATABASE[planet];
    if (mantraInfo) {
      mantraSadhana.push({
        planet,
        mantraText: mantraInfo.text,
        transliteration: mantraInfo.translit,
        prescribedRepetitions: mantraInfo.japaCount,
        rosaryMalaType: mantraInfo.mala,
        dailyTarget: '108 repetitions (1 mala) daily at twilight or dawn',
        spiritualFocus: mantraInfo.focus,
      });
    }

    const habitInfo = HABIT_DATABASE[planet];
    if (habitInfo) {
      behavioralHabits.push({
        planet,
        archetypalRoot: habitInfo.root,
        dailyHabitDirective: habitInfo.directive,
        environmentalCorrection: habitInfo.environmental,
      });
    }
  }

  // Also include running Dasha Lord in Mantra Sadhana if benefic
  if (activeDashaLord && fbSet.has(activeDashaLord) && !mantraSadhana.some((m) => m.planet === activeDashaLord)) {
    const dashaMantra = MANTRA_DATABASE[activeDashaLord];
    if (dashaMantra) {
      mantraSadhana.unshift({
        planet: activeDashaLord,
        mantraText: dashaMantra.text,
        transliteration: dashaMantra.translit,
        prescribedRepetitions: dashaMantra.japaCount,
        rosaryMalaType: dashaMantra.mala,
        dailyTarget: '108 repetitions daily during morning puja',
        spiritualFocus: `Empowers active ${activeDashaLord} Mahadasha for maximum material and dharmic harvest.`,
      });
    }
  }

  const masterRemedialSummary = `For your ${lagnaSign} Lagna, authentic remedial shastra operates on dual polarity: STRENGTHEN life-supporting Functional Benefics (${functionalProfile?.functionalBenefics.join(', ')}) through approved gemstones and constructive habits; PACIFY Functional Malefics (${functionalProfile?.functionalMalefics.join(', ')}) through Daana (charity), Japa (mantras), and ethical conduct. Never wear gemstones of functional malefics.`;

  return {
    nativeLagna: lagnaSign,
    recommendedGemstones,
    prohibitedGemstones,
    daanaPrescriptions,
    mantraSadhana,
    behavioralHabits,
    masterRemedialSummary,
  };
}
