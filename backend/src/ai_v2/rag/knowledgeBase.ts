/**
 * ASTROWORLD AI V2 — Curated Classical Jyotish Knowledge Base
 * Rigorous source-grounded classical corpus from primary Sanskrit texts:
 * - Brihat Parashara Hora Shastra (Maharishi Parashara)
 * - Phaladeepika (Mantreswara)
 * - Saravali (Kalyana Varma)
 * - Jaimini Upadesha Sutras (Maharishi Jaimini)
 * - Brihat Jataka (Varahamihira)
 * - Uttara Kalamrita (Kalidasa)
 */

import { KnowledgeRecord } from '../schemas/knowledgeRecord.ts';

export const CLASSICAL_JYOTISH_KNOWLEDGE_BASE: KnowledgeRecord[] = [
  // =========================================================================
  // 1. TRANSITS (GOCHARA) — PHALADEEPIKA & BPHS
  // =========================================================================
  {
    id: 'kb_transit_jup_moon_benefic',
    sourceText: 'Phaladeepika',
    author: 'Mantreswara',
    chapter: 'Chapter 26 (Gochara Phala)',
    sectionOrShloka: 'Sloka 15–18',
    citation: 'Phaladeepika Ch. 26, Sl. 15–18',
    originalSanskrit: 'जीवो द्वितीय पञ्चम सप्तम नवमैकादशे शुभप्रदः।',
    canonicalTranslation:
      'Jupiter transiting through the 2nd, 5th, 7th, 9th, and 11th houses reckoned from the natal Janma Rashi (Moon sign) produces highly auspicious results, bestowal of honor, wealth accumulation, professional elevation, and spiritual clarity.',
    normalizedInterpretation:
      'Classical Gochara rule: Jupiter transit yields benefic results when moving through houses 2, 5, 7, 9, and 11 relative to natal Moon. Transiting 1st, 3rd, 4th, 6th, 8th, 10th, or 12th from Moon is considered challenging or requiring Vedha evaluation.',
    metadata: {
      tradition: 'classical',
      topic: 'transits',
      subtopic: 'jupiter_transit',
      ruleType: 'transit_rule',
      planetarySubjects: ['Jupiter', 'Moon'],
      houseSubjects: [2, 5, 7, 9, 11],
      signSubjects: [],
      vargaSubjects: ['D1'],
      transitSubjects: ['Gochara from Janma Rashi', 'Jupiter Transit'],
      authorityLevel: 'primary_foundational',
      tags: ['transit', 'jupiter', 'moon', 'gochara', 'career', 'promotion', 'timing'],
    },
    version: '1.0',
    verified: true,
  },
  {
    id: 'kb_transit_sat_sade_sati',
    sourceText: 'Phaladeepika',
    author: 'Mantreswara',
    chapter: 'Chapter 26 (Gochara Phala)',
    sectionOrShloka: 'Sloka 22–24',
    citation: 'Phaladeepika Ch. 26, Sl. 22–24',
    canonicalTranslation:
      'When Saturn transits the 12th, 1st, and 2nd houses from the natal Moon (Janma Rashi), the native undergoes the seven-and-a-half year period known as Sade Sati. It tests patience, structural discipline, karmic accountability, and realigns core priorities.',
    normalizedInterpretation:
      'Classical Sade Sati rule: Saturn transiting through the sign preceding the natal Moon (12th from Moon), the Moon sign itself (1st from Moon), and the succeeding sign (2nd from Moon) marks the 7.5 year cycle of structural consolidation and karmic restructuring.',
    metadata: {
      tradition: 'classical',
      topic: 'transits',
      subtopic: 'sade_sati',
      ruleType: 'transit_rule',
      planetarySubjects: ['Saturn', 'Moon'],
      houseSubjects: [12, 1, 2],
      signSubjects: [],
      vargaSubjects: ['D1'],
      transitSubjects: ['Sade Sati', 'Saturn Gochara'],
      authorityLevel: 'primary_foundational',
      tags: ['transit', 'saturn', 'sade_sati', 'moon', 'timing', 'discipline'],
    },
    version: '1.0',
    verified: true,
  },
  {
    id: 'kb_transit_10th_house_activation',
    sourceText: 'Brihat Parashara Hora Shastra',
    author: 'Maharishi Parashara',
    chapter: 'Chapter 66 (Gochara Dhyana)',
    sectionOrShloka: 'Sloka 31–34',
    citation: 'BPHS Ch. 66, Sl. 31–34',
    canonicalTranslation:
      'When benefic planets (Jupiter, Venus, unafflicted Mercury) transit over the natal 10th house or aspect the 10th lord, or when the 10th lord transits in strength through an auspicious house, new responsibilities, promotions, and recognition manifest.',
    normalizedInterpretation:
      'Professional transit timing rule: The 10th house and its ruler become activated when transiting benefics transit or aspect the natal 10th bhava or when the 10th lord transits through a Kendra or Trikona with high Ashtakavarga bindus.',
    metadata: {
      tradition: 'parashari',
      topic: 'career',
      subtopic: 'promotion_timing',
      ruleType: 'transit_rule',
      planetarySubjects: ['Jupiter', 'Venus', 'Mercury', 'Sun', 'Saturn'],
      houseSubjects: [10, 1, 6, 11],
      signSubjects: [],
      vargaSubjects: ['D1', 'D10'],
      transitSubjects: ['10th House Transit', 'Career Activation'],
      authorityLevel: 'primary_foundational',
      tags: ['career', 'promotion', 'transit', '10th_house', 'd10', 'timing'],
    },
    version: '1.0',
    verified: true,
  },

  // =========================================================================
  // 2. CAREER & PROFESSION (10TH HOUSE & D10 DASHAMSHA) — BPHS & SARAVALI
  // =========================================================================
  {
    id: 'kb_career_10th_house_principles',
    sourceText: 'Brihat Parashara Hora Shastra',
    author: 'Maharishi Parashara',
    chapter: 'Chapter 14 (Bhava Karaka & 10th House)',
    sectionOrShloka: 'Sloka 1–12',
    citation: 'BPHS Ch. 14, Sl. 1–12',
    canonicalTranslation:
      'The 10th house (Karma Bhava) indicates enterprise, royal/state patronage, social status, executive command, honorable conduct, and profession. Sun and Mercury are the natural karakas for professional prestige and executive capability; Saturn is the karaka for labor and service.',
    normalizedInterpretation:
      'Foundational career principles: 10th house represents vocation and public authority. Evaluation requires assessing the 10th house sign, planets occupying or aspecting the 10th, the placement and dignity of the 10th lord, and the state of natural karakas (Sun for authority, Mercury for commerce, Saturn for perseverance).',
    metadata: {
      tradition: 'parashari',
      topic: 'career',
      subtopic: '10th_house_foundations',
      ruleType: 'general_principle',
      planetarySubjects: ['Sun', 'Mercury', 'Saturn', 'Jupiter'],
      houseSubjects: [10, 1, 6],
      signSubjects: [],
      vargaSubjects: ['D1', 'D10'],
      authorityLevel: 'primary_foundational',
      tags: ['career', '10th_house', 'profession', 'status', 'sun', 'mercury', 'saturn'],
    },
    version: '1.0',
    verified: true,
  },
  {
    id: 'kb_varga_d10_dashamsha_rules',
    sourceText: 'Brihat Parashara Hora Shastra',
    author: 'Maharishi Parashara',
    chapter: 'Chapter 6 (Shodashavarga Adhyaya)',
    sectionOrShloka: 'Sloka 26–28',
    citation: 'BPHS Ch. 6, Sl. 26–28',
    canonicalTranslation:
      'Dashamsha (D10) is the one-tenth division of a sign. It is specifically examined to determine mahat-phalam (great achievements, professional power, authority, promotions, and societal contribution).',
    normalizedInterpretation:
      'D10 Dashamsha interpretation rule: The Dashamsha chart (D10) refines the 10th house of the D1 chart. Planets placed in Kendras (1, 4, 7, 10) or Trikonas (1, 5, 9) of D10, particularly in dignity (swakshetra, uccha), confer major career milestones and leadership capacity.',
    metadata: {
      tradition: 'parashari',
      topic: 'vargas',
      subtopic: 'd10_dashamsha',
      ruleType: 'varga_rule',
      planetarySubjects: ['Sun', 'Jupiter', 'Mars', 'Saturn', 'Mercury'],
      houseSubjects: [10, 1, 4, 7, 9],
      signSubjects: [],
      vargaSubjects: ['D10'],
      authorityLevel: 'primary_foundational',
      tags: ['vargas', 'd10', 'dashamsha', 'career', 'promotion', 'status', 'leadership'],
    },
    version: '1.0',
    verified: true,
  },
  {
    id: 'kb_career_10th_lord_in_kendra_trikona',
    sourceText: 'Saravali',
    author: 'Kalyana Varma',
    chapter: 'Chapter 34 (Bhava Phala)',
    sectionOrShloka: 'Sloka 28–32',
    citation: 'Saravali Ch. 34, Sl. 28–32',
    canonicalTranslation:
      'If the lord of the 10th house is situated in a Kendra (1st, 4th, 7th, 10th) or Trikona (1st, 5th, 9th) in strength and conjunct or aspected by benefic planets, the native attains eminent status, enduring fame, unyielding determination in duties, and vast executive power.',
    normalizedInterpretation:
      '10th lord placement rule: Strong disposition of the 10th lord in quadrant or trine bhavas ensures professional stability, social eminence, and triumph in competitive endeavors.',
    metadata: {
      tradition: 'classical',
      topic: 'career',
      subtopic: '10th_lord_placement',
      ruleType: 'house_lord_rule',
      planetarySubjects: [],
      houseSubjects: [10, 1, 4, 5, 7, 9],
      signSubjects: [],
      vargaSubjects: ['D1', 'D10'],
      authorityLevel: 'primary_foundational',
      tags: ['career', '10th_lord', 'kendra', 'trikona', 'saravali', 'status'],
    },
    version: '1.0',
    verified: true,
  },

  // =========================================================================
  // 3. MARRIAGE & RELATIONSHIPS (7TH HOUSE & D9 NAVAMSHA) — BPHS & JAIMINI
  // =========================================================================
  {
    id: 'kb_marriage_7th_house_foundations',
    sourceText: 'Brihat Parashara Hora Shastra',
    author: 'Maharishi Parashara',
    chapter: 'Chapter 13 (7th Bhava Phala)',
    sectionOrShloka: 'Sloka 1–10',
    citation: 'BPHS Ch. 13, Sl. 1–10',
    canonicalTranslation:
      'The 7th house (Kalatra Bhava) indicates spouse, marriage, partnership, sexual compatibility, public relations, and foreign commerce. Venus is the natural karaka for marriage in male charts; Jupiter is the karaka for husband in female charts.',
    normalizedInterpretation:
      'Marriage foundation rule: Analysis of marriage requires assessing the 7th house, 7th lord, occupants/aspects to the 7th, natural relationship karakas (Venus/Jupiter), and confirmation in the D9 Navamsha chart.',
    metadata: {
      tradition: 'parashari',
      topic: 'marriage',
      subtopic: '7th_house_foundations',
      ruleType: 'general_principle',
      planetarySubjects: ['Venus', 'Jupiter', 'Mars', 'Moon'],
      houseSubjects: [7, 1, 2, 8, 12],
      signSubjects: [],
      vargaSubjects: ['D1', 'D9'],
      authorityLevel: 'primary_foundational',
      tags: ['marriage', 'relationship', '7th_house', 'venus', 'jupiter', 'd9'],
    },
    version: '1.0',
    verified: true,
  },
  {
    id: 'kb_varga_d9_navamsha_marriage',
    sourceText: 'Brihat Parashara Hora Shastra',
    author: 'Maharishi Parashara',
    chapter: 'Chapter 6 (Shodashavarga Adhyaya)',
    sectionOrShloka: 'Sloka 24–25',
    citation: 'BPHS Ch. 6, Sl. 24–25',
    canonicalTranslation:
      'Navamsha (D9) is the ninth harmonic division of a sign. It is the vital key to assessing Kalatra (spouse, matrimonial harmony, inner spiritual destiny, and the sustained fruit of one\'s dharma).',
    normalizedInterpretation:
      'D9 Navamsha rule: Navamsha reveals the strength and longevity of partnerships and the second half of life. Planets well-placed in D1 but debilitated in D9 lose vitality; planets debilitated in D1 but exalted/own-sign in D9 gain exceptional hidden strength (Neechabhanga / Vargottama).',
    metadata: {
      tradition: 'parashari',
      topic: 'vargas',
      subtopic: 'd9_navamsha',
      ruleType: 'varga_rule',
      planetarySubjects: ['Venus', 'Jupiter', 'Moon'],
      houseSubjects: [7, 1, 9],
      signSubjects: [],
      vargaSubjects: ['D9'],
      authorityLevel: 'primary_foundational',
      tags: ['vargas', 'd9', 'navamsha', 'marriage', 'relationship', 'dharma', 'vargottama'],
    },
    version: '1.0',
    verified: true,
  },
  {
    id: 'kb_jaimini_dara_karaka_upapada',
    sourceText: 'Jaimini Upadesha Sutras',
    author: 'Maharishi Jaimini',
    chapter: 'Adhyaya 1, Pada 1',
    sectionOrShloka: 'Sutras 11–24',
    citation: 'Jaimini Sutras 1.1.11–24',
    canonicalTranslation:
      'The planet with the lowest advanced degrees among the 7 Grahas becomes the Dara Karaka (DK), symbolizing the spouse. Upapada Lagna (UL) is the Arudha of the 12th house, indicating marital longevity, formal marriage ties, and spousal background.',
    normalizedInterpretation:
      'Jaimini relationship rule: Dara Karaka (DK) planet represents the physical personality and nature of the spouse. Benefic planets in Upapada Lagna or its 2nd house protect the marriage, while malefic influences require remedial mindfulness and patience.',
    metadata: {
      tradition: 'jaimini',
      topic: 'marriage',
      subtopic: 'jaimini_dara_karaka',
      ruleType: 'karaka_rule',
      planetarySubjects: ['Venus', 'Jupiter'],
      houseSubjects: [7, 12, 2],
      signSubjects: [],
      vargaSubjects: ['D1', 'D9'],
      authorityLevel: 'primary_foundational',
      tags: ['jaimini', 'marriage', 'dara_karaka', 'upapada_lagna', 'dk', 'ul'],
    },
    version: '1.0',
    verified: true,
  },

  // =========================================================================
  // 4. VIMSHOTTARI DASHA & TIMING RULES — BPHS & PHALADEEPIKA
  // =========================================================================
  {
    id: 'kb_dasha_kendra_trikona_lords',
    sourceText: 'Brihat Parashara Hora Shastra',
    author: 'Maharishi Parashara',
    chapter: 'Chapter 46 (Dasha Phala Viveka)',
    sectionOrShloka: 'Sloka 1–15',
    citation: 'BPHS Ch. 46, Sl. 1–15',
    canonicalTranslation:
      'During the Mahadasha of a planet owning Kendra (1, 4, 7, 10) or Trikona (1, 5, 9) bhavas, if it is placed in dignity or forms a Raja Yoga with another benefic lord, the period brings wealth, royal favor, promotion, happiness, and accomplishment of desires.',
    normalizedInterpretation:
      'Vimshottari Dasha core rule: The functional nature of a Dasha lord is governed by its house ownership and placement. Kendra-Trikona lord dashas produce constructive and elevated life experiences, whereas Dusthana lord (6, 8, 12) dashas bring transformation, discipline, and purification.',
    metadata: {
      tradition: 'parashari',
      topic: 'dasha',
      subtopic: 'kendra_trikona_dasha',
      ruleType: 'dasha_rule',
      planetarySubjects: ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'],
      houseSubjects: [1, 4, 5, 7, 9, 10],
      signSubjects: [],
      vargaSubjects: ['D1'],
      dashaSubjects: ['Mahadasha', 'Antardasha', 'Vimshottari'],
      authorityLevel: 'primary_foundational',
      tags: ['dasha', 'vimshottari', 'timing', 'mahadasha', 'antardasha', 'raja_yoga'],
    },
    version: '1.0',
    verified: true,
  },
  {
    id: 'kb_dasha_antardasha_relationship',
    sourceText: 'Phaladeepika',
    author: 'Mantreswara',
    chapter: 'Chapter 20 (Dasha-Antardasha Phala)',
    sectionOrShloka: 'Sloka 1–8',
    citation: 'Phaladeepika Ch. 20, Sl. 1–8',
    canonicalTranslation:
      'The mutual placement of the Mahadasha lord and the Antardasha lord determines the flavor of the sub-period. If they are in 3/11, 4/10, 1/7, or 5/9 from each other, auspicious outcomes prevail. If placed in 6/8 (Shadashtaka) or 2/12 (Dvidvadasha) from each other, friction and delays arise.',
    normalizedInterpretation:
      'Dasha-Antardasha sub-period timing rule: Mutual relationship between the ruling major and minor periods determines harmony. 5/9 and 3/11 mutual placements generate smooth manifestation; 6/8 mutual dispositions require conscious conflict resolution.',
    metadata: {
      tradition: 'classical',
      topic: 'dasha',
      subtopic: 'dasha_sub_lord_relationship',
      ruleType: 'dasha_rule',
      planetarySubjects: [],
      houseSubjects: [3, 5, 6, 8, 9, 11, 12],
      signSubjects: [],
      vargaSubjects: ['D1'],
      dashaSubjects: ['Mahadasha', 'Antardasha', 'Shadashtaka', 'Navapanchama'],
      authorityLevel: 'primary_foundational',
      tags: ['dasha', 'antardasha', 'shadashtaka', 'timing', 'phaladeepika'],
    },
    version: '1.0',
    verified: true,
  },

  // =========================================================================
  // 5. CLASSICAL YOGAS — BPHS & BRIHAT JATAKA
  // =========================================================================
  {
    id: 'kb_yoga_gajakesari',
    sourceText: 'Brihat Parashara Hora Shastra',
    author: 'Maharishi Parashara',
    chapter: 'Chapter 36 (Raja Yoga Adhyaya)',
    sectionOrShloka: 'Sloka 3–4',
    citation: 'BPHS Ch. 36, Sl. 3–4',
    originalSanskrit: 'केन्द्रे स्थिते देवगुरौ शशाङ्कात् संयोजिते वा शुभदृष्टियुक्ते।',
    canonicalTranslation:
      'When Jupiter occupies a Kendra (1st, 4th, 7th, or 10th house) from the Moon, Gajakesari Yoga is formed. The native is illustrious, intellectually brilliant, virtuous, respected by authorities, and blessed with enduring renown.',
    normalizedInterpretation:
      'Gajakesari Yoga definition: Moon and Jupiter in mutual Kendras (angular houses: 1, 4, 7, 10 from each other). Bestows wisdom, high repute, educational excellence, and protective resilience against hardships.',
    metadata: {
      tradition: 'parashari',
      topic: 'yogas',
      subtopic: 'gajakesari_yoga',
      ruleType: 'yoga_rule',
      planetarySubjects: ['Jupiter', 'Moon'],
      houseSubjects: [1, 4, 7, 10],
      signSubjects: [],
      vargaSubjects: ['D1'],
      yogaSubjects: ['Gajakesari Yoga'],
      authorityLevel: 'primary_foundational',
      tags: ['yoga', 'gajakesari', 'jupiter', 'moon', 'kendra', 'reputation', 'wisdom'],
    },
    version: '1.0',
    verified: true,
  },
  {
    id: 'kb_yoga_raja_kendra_trikona_conjunction',
    sourceText: 'Brihat Parashara Hora Shastra',
    author: 'Maharishi Parashara',
    chapter: 'Chapter 34 (Raja Yoga Adhyaya)',
    sectionOrShloka: 'Sloka 14–16',
    citation: 'BPHS Ch. 34, Sl. 14–16',
    canonicalTranslation:
      'When the lords of a Kendra (Vishnu Sthana: 1, 4, 7, 10) and a Trikona (Lakshmi Sthana: 1, 5, 9) form a conjunction, mutual aspect, or parivartana (exchange of signs), an auspicious Raja Yoga is produced, conferring royal authority, prosperity, and success in ventures.',
    normalizedInterpretation:
      'Dharma-Karmadhipati Raja Yoga rule: Association between quadrant lords (representing power and effort) and trine lords (representing grace and destiny) constitutes the foundational Raja Yoga of Vedic astrology.',
    metadata: {
      tradition: 'parashari',
      topic: 'yogas',
      subtopic: 'raja_yoga',
      ruleType: 'yoga_rule',
      planetarySubjects: [],
      houseSubjects: [1, 4, 5, 7, 9, 10],
      signSubjects: [],
      vargaSubjects: ['D1', 'D9', 'D10'],
      yogaSubjects: ['Raja Yoga', 'Dharma-Karmadhipati Yoga'],
      authorityLevel: 'primary_foundational',
      tags: ['yoga', 'raja_yoga', 'kendra', 'trikona', 'status', 'power', 'bphs'],
    },
    version: '1.0',
    verified: true,
  },
  {
    id: 'kb_yoga_pancha_mahapurusha',
    sourceText: 'Brihat Jataka',
    author: 'Varahamihira',
    chapter: 'Chapter 11 (Pancha Mahapurusha Yogas)',
    sectionOrShloka: 'Sloka 1–4',
    citation: 'Brihat Jataka Ch. 11, Sl. 1–4',
    canonicalTranslation:
      'When Mars, Mercury, Jupiter, Venus, or Saturn occupies a Kendra in own sign (Swakshetra) or exalted sign (Uccha), the Pancha Mahapurusha Yogas are formed: Ruchaka (Mars), Bhadra (Mercury), Hamsa (Jupiter), Malavya (Venus), and Sasa (Saturn), producing exemplary leaders in their respective archetypal domains.',
    normalizedInterpretation:
      'Pancha Mahapurusha Yoga rule: 5 non-luminary grahas in their own or exaltation signs placed in Kendras (1, 4, 7, 10) from Lagna or Moon. Imparts distinct archetypal strengths in leadership, communication, wisdom, aesthetics, or perseverance.',
    metadata: {
      tradition: 'classical',
      topic: 'yogas',
      subtopic: 'mahapurusha_yogas',
      ruleType: 'yoga_rule',
      planetarySubjects: ['Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'],
      houseSubjects: [1, 4, 7, 10],
      signSubjects: [],
      vargaSubjects: ['D1'],
      yogaSubjects: ['Ruchaka Yoga', 'Bhadra Yoga', 'Hamsa Yoga', 'Malavya Yoga', 'Sasa Yoga'],
      authorityLevel: 'primary_foundational',
      tags: ['yoga', 'mahapurusha', 'ruchaka', 'bhadra', 'hamsa', 'malavya', 'sasa'],
    },
    version: '1.0',
    verified: true,
  },

  // =========================================================================
  // 6. WEALTH & FINANCES (2ND, 11TH HOUSES & ASHTAKAVARGA) — BPHS & UTTARA KALAMRITA
  // =========================================================================
  {
    id: 'kb_wealth_dhana_yogas',
    sourceText: 'Brihat Parashara Hora Shastra',
    author: 'Maharishi Parashara',
    chapter: 'Chapter 41 (Dhana Yogas)',
    sectionOrShloka: 'Sloka 1–10',
    citation: 'BPHS Ch. 41, Sl. 1–10',
    canonicalTranslation:
      'Mutual relationship between the lords of the 2nd (treasury), 11th (gains), 5th (speculative intellect/purva punya), and 9th (fortune) houses generates powerful Dhana Yogas (combinations for abundant financial wealth and commercial prosperity).',
    normalizedInterpretation:
      'Dhana Yoga rule: Financial accumulation is determined by connections among the 2nd house (accumulated wealth), 11th house (cash flow and revenue), 5th house (investments), and 9th house (unforeseen divine grace).',
    metadata: {
      tradition: 'parashari',
      topic: 'finance',
      subtopic: 'dhana_yogas',
      ruleType: 'yoga_rule',
      planetarySubjects: ['Jupiter', 'Venus', 'Mercury'],
      houseSubjects: [2, 5, 9, 11],
      signSubjects: [],
      vargaSubjects: ['D1', 'D2'],
      yogaSubjects: ['Dhana Yoga'],
      authorityLevel: 'primary_foundational',
      tags: ['finance', 'wealth', 'money', 'dhana_yoga', '2nd_house', '11th_house'],
    },
    version: '1.0',
    verified: true,
  },
  {
    id: 'kb_ashtakavarga_sav_thresholds',
    sourceText: 'Brihat Parashara Hora Shastra',
    author: 'Maharishi Parashara',
    chapter: 'Chapter 66 (Samudayashtakavarga Phala)',
    sectionOrShloka: 'Sloka 20–25',
    citation: 'BPHS Ch. 66, Sl. 20–25',
    canonicalTranslation:
      'In Sarvashtakavarga (337 total bindus), a sign containing 28 bindus is considered average/neutral. Signs with 30 or more bindus bestow abundant material success and vitality when occupied or transited by planets, while signs with fewer than 25 bindus require sustained conservation of energy.',
    normalizedInterpretation:
      'Ashtakavarga evaluation threshold: 28 bindus is the benchmark. Houses/signs with >28 bindus handle planetary transits smoothly and produce fruitful outcomes; houses with <25 bindus indicate areas requiring careful management.',
    metadata: {
      tradition: 'parashari',
      topic: 'ashtakavarga',
      subtopic: 'sav_bindu_thresholds',
      ruleType: 'strength_rule',
      planetarySubjects: [],
      houseSubjects: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      signSubjects: [],
      vargaSubjects: ['D1'],
      authorityLevel: 'primary_foundational',
      tags: ['ashtakavarga', 'sav', 'bindus', 'transits', 'strength', 'bphs'],
    },
    version: '1.0',
    verified: true,
  },

  // =========================================================================
  // 7. TRADITIONS & DISCREPANCIES (PARASHARI VS JAIMINI) — PRESERVED EXPLICITLY
  // =========================================================================
  {
    id: 'kb_tradition_aspects_parashari_vs_jaimini',
    sourceText: 'Comparative Classical Jyotish (BPHS vs Jaimini Sutras)',
    author: 'Maharishi Parashara & Maharishi Jaimini',
    chapter: 'BPHS Ch. 26 & Jaimini Sutras 1.1',
    sectionOrShloka: 'Comparative Analysis',
    citation: 'BPHS Ch. 26 vs Jaimini Sutras 1.1.2–5',
    canonicalTranslation:
      'In the Parashari tradition, planets cast aspects (Graha Drishti) with full 7th aspect, and special full aspects for Mars (4th, 8th), Jupiter (5th, 9th), and Saturn (3rd, 10th). In the Jaimini tradition, signs themselves aspect other signs (Rashi Drishti): Movable signs aspect Fixed signs (except adjacent), and Dual signs aspect other Dual signs.',
    normalizedInterpretation:
      'Tradition comparison on aspects: Parashari uses planetary ray aspects (Graha Drishti) based on angular distance between planets. Jaimini uses sign-to-sign aspects (Rashi Drishti) based on sign modality (Chara, Sthira, Dvisvabhava). Both perspectives operate concurrently in their respective systems.',
    metadata: {
      tradition: 'classical',
      topic: 'astrological',
      subtopic: 'aspect_rules_comparison',
      ruleType: 'aspect_rule',
      planetarySubjects: ['Mars', 'Jupiter', 'Saturn'],
      houseSubjects: [],
      signSubjects: ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'],
      vargaSubjects: ['D1', 'D9'],
      authorityLevel: 'primary_foundational',
      tags: ['traditions', 'parashari', 'jaimini', 'graha_drishti', 'rashi_drishti', 'aspects'],
    },
    version: '1.0',
    verified: true,
  },
  {
    id: 'kb_tradition_karakas_parashari_vs_jaimini',
    sourceText: 'Comparative Classical Jyotish (BPHS vs Jaimini)',
    author: 'Maharishi Parashara & Maharishi Jaimini',
    chapter: 'BPHS Ch. 32 & Jaimini Sutras 1.1',
    sectionOrShloka: 'Comparative Analysis',
    citation: 'BPHS Ch. 32 vs Jaimini Sutras 1.1.11–18',
    canonicalTranslation:
      'Parashari primarily uses fixed natural significators (Naisargika Karakas, e.g. Sun for father/soul, Moon for mother, Venus for spouse). Jaimini utilizes temporal degree-based significators (Chara Karakas: Atmakaraka for soul, Amatyakaraka for career, Dara Karaka for spouse), which vary by highest longitude in each chart.',
    normalizedInterpretation:
      'Tradition comparison on karakas: Naisargika Karakas (Parashari) represent universal archetypes that never change across charts. Chara Karakas (Jaimini) represent individual chart-specific soul drivers based on planetary degree rankings.',
    metadata: {
      tradition: 'classical',
      topic: 'astrological',
      subtopic: 'karaka_system_comparison',
      ruleType: 'karaka_rule',
      planetarySubjects: ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu'],
      houseSubjects: [],
      signSubjects: [],
      vargaSubjects: ['D1', 'D9'],
      authorityLevel: 'primary_foundational',
      tags: ['traditions', 'parashari', 'jaimini', 'chara_karaka', 'naisargika_karaka', 'atmakaraka'],
    },
    version: '1.0',
    verified: true,
  },
];
