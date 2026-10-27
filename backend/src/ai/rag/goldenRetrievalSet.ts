/**
 * ASTROWORLD AI V2 — Golden Retrieval Evaluation Dataset
 * Standard benchmark of 20+ classical Jyotish test queries across all major domains and chart layers.
 * Used for automated precision, recall, and domain separation quality testing.
 */

export interface GoldenRetrievalCase {
  id: string;
  query: string;
  expectedTopics: string[];
  expectedPrimaryCitationKeywords: string[];
  forbiddenTopics: string[];
  description: string;
}

export const GOLDEN_RETRIEVAL_BENCHMARK: GoldenRetrievalCase[] = [
  // 1. Transits & Timing
  {
    id: 'golden_01_jup_transit',
    query: 'How does Jupiter transit through the 5th and 11th houses from Moon bring growth?',
    expectedTopics: ['transits'],
    expectedPrimaryCitationKeywords: ['Phaladeepika', 'Gochara'],
    forbiddenTopics: ['marriage', 'sade_sati'],
    description: 'Jupiter transit relative to Janma Rashi Moon',
  },
  {
    id: 'golden_02_saturn_sade_sati',
    query: 'What classical texts explain Saturn transiting the 12th, 1st, and 2nd from natal Moon?',
    expectedTopics: ['transits'],
    expectedPrimaryCitationKeywords: ['Phaladeepika', 'Sade Sati'],
    forbiddenTopics: ['dhana_yogas', 'd10_dashamsha'],
    description: 'Saturn 7.5 year Sade Sati cycle from Janma Rashi',
  },
  {
    id: 'golden_03_career_10th_transit',
    query: 'How does the transit of benefics over the 10th house activate promotions?',
    expectedTopics: ['career', 'transits'],
    expectedPrimaryCitationKeywords: ['BPHS', 'Phaladeepika'],
    forbiddenTopics: ['marriage', 'dara_karaka'],
    description: '10th house transit and professional promotion timing',
  },

  // 2. Career & D10 Dashamsha
  {
    id: 'golden_04_career_10th_house',
    query: 'What are the classical rules for the 10th house Karma Bhava and executive prestige?',
    expectedTopics: ['career'],
    expectedPrimaryCitationKeywords: ['BPHS', 'Karma Bhava'],
    forbiddenTopics: ['marriage', '7th_house'],
    description: '10th house foundational career principles in BPHS',
  },
  {
    id: 'golden_05_d10_dashamsha',
    query: 'How should the Dashamsha D10 divisional chart be evaluated for professional power?',
    expectedTopics: ['vargas', 'career'],
    expectedPrimaryCitationKeywords: ['BPHS', 'Shodashavarga', 'Dashamsha'],
    forbiddenTopics: ['marriage', 'navamsha'],
    description: 'D10 Dashamsha varga rules for leadership and profession',
  },
  {
    id: 'golden_06_10th_lord_kendra',
    query: 'What does Saravali say about the 10th lord placed in Kendras and Trikonas?',
    expectedTopics: ['career'],
    expectedPrimaryCitationKeywords: ['Saravali', 'Bhava Phala'],
    forbiddenTopics: ['marriage', 'sade_sati'],
    description: '10th lord in quadrant or trine according to Saravali',
  },

  // 3. Marriage & D9 Navamsha
  {
    id: 'golden_07_marriage_7th_house',
    query: 'What are the foundational principles of the 7th house and Venus for marriage in BPHS?',
    expectedTopics: ['marriage'],
    expectedPrimaryCitationKeywords: ['BPHS', 'Kalatra'],
    forbiddenTopics: ['career', '10th_house'],
    description: '7th house Kalatra Bhava and Venus significations',
  },
  {
    id: 'golden_08_d9_navamsha_marriage',
    query: 'Why is the D9 Navamsha chart examined for spousal compatibility and inner dharma?',
    expectedTopics: ['vargas', 'marriage'],
    expectedPrimaryCitationKeywords: ['BPHS', 'Navamsha'],
    forbiddenTopics: ['career', 'dashamsha'],
    description: 'D9 Navamsha role in matrimonial longevity and dharma',
  },
  {
    id: 'golden_09_jaimini_dara_karaka',
    query: 'How does Jaimini Upadesha Sutras define Dara Karaka DK and Upapada Lagna UL for spouse?',
    expectedTopics: ['marriage'],
    expectedPrimaryCitationKeywords: ['Jaimini', 'Dara Karaka', 'Upapada'],
    forbiddenTopics: ['career', 'sade_sati'],
    description: 'Jaimini Dara Karaka and Upapada Lagna relationship rules',
  },

  // 4. Dashas & Timing
  {
    id: 'golden_10_vimshottari_kendra_trikona',
    query: 'What are the results during Mahadashas of Kendra and Trikona lords in BPHS?',
    expectedTopics: ['dasha'],
    expectedPrimaryCitationKeywords: ['BPHS', 'Dasha Phala'],
    forbiddenTopics: ['sade_sati', 'marriage'],
    description: 'Vimshottari Mahadasha of Kendra and Trikona lords',
  },
  {
    id: 'golden_11_dasha_antardasha_relations',
    query: 'How does Phaladeepika evaluate the 6/8 Shadashtaka relationship between Mahadasha and Antardasha lords?',
    expectedTopics: ['dasha'],
    expectedPrimaryCitationKeywords: ['Phaladeepika', 'Dasha'],
    forbiddenTopics: ['d10_dashamsha', 'dhana_yogas'],
    description: 'Sub-period mutual placement rules in Phaladeepika',
  },

  // 5. Yogas
  {
    id: 'golden_12_gajakesari_yoga',
    query: 'What is the classical definition and result of Gajakesari Yoga when Jupiter is in Kendra from Moon?',
    expectedTopics: ['yogas'],
    expectedPrimaryCitationKeywords: ['BPHS', 'Gajakesari'],
    forbiddenTopics: ['sade_sati', 'marriage'],
    description: 'Gajakesari Yoga definition and effects',
  },
  {
    id: 'golden_13_raja_yoga_kendra_trikona',
    query: 'How do Kendra and Trikona lords form Dharma-Karmadhipati Raja Yoga in BPHS?',
    expectedTopics: ['yogas'],
    expectedPrimaryCitationKeywords: ['BPHS', 'Raja Yoga'],
    forbiddenTopics: ['sade_sati', 'marriage'],
    description: 'Kendra-Trikona lord association Raja Yoga in BPHS',
  },
  {
    id: 'golden_14_pancha_mahapurusha',
    query: 'How does Brihat Jataka define the Pancha Mahapurusha Yogas (Ruchaka, Bhadra, Hamsa, Malavya, Sasa)?',
    expectedTopics: ['yogas'],
    expectedPrimaryCitationKeywords: ['Brihat Jataka', 'Mahapurusha'],
    forbiddenTopics: ['dara_karaka', 'upapada'],
    description: 'Pancha Mahapurusha 5-planet yogas in Brihat Jataka',
  },

  // 6. Wealth & Finance
  {
    id: 'golden_15_dhana_yogas',
    query: 'Which house lord combinations produce Dhana Yogas for financial prosperity in BPHS?',
    expectedTopics: ['finance'],
    expectedPrimaryCitationKeywords: ['BPHS', 'Dhana Yoga'],
    forbiddenTopics: ['marriage', 'sade_sati'],
    description: 'Dhana Yoga 2nd, 5th, 9th, 11th house combinations',
  },
  {
    id: 'golden_16_ashtakavarga_sav',
    query: 'What are the 28-bindu threshold rules for Sarvashtakavarga SAV in BPHS Chapter 66?',
    expectedTopics: ['ashtakavarga'],
    expectedPrimaryCitationKeywords: ['BPHS', 'Samudayashtakavarga', 'Ashtakavarga'],
    forbiddenTopics: ['marriage', 'd9_navamsha'],
    description: 'Ashtakavarga 28-bindu benefic threshold in BPHS',
  },

  // 7. Comparative Traditions
  {
    id: 'golden_17_aspects_parashari_vs_jaimini',
    query: 'How do planetary ray aspects Graha Drishti differ from Jaimini sign aspects Rashi Drishti?',
    expectedTopics: ['astrological'],
    expectedPrimaryCitationKeywords: ['BPHS', 'Jaimini', 'Comparative'],
    forbiddenTopics: ['dhana_yogas'],
    description: 'Parashari vs Jaimini aspect system comparison',
  },
  {
    id: 'golden_18_karakas_parashari_vs_jaimini',
    query: 'What is the distinction between fixed Naisargika Karakas and degree-based Chara Karakas?',
    expectedTopics: ['astrological'],
    expectedPrimaryCitationKeywords: ['BPHS', 'Jaimini', 'Comparative'],
    forbiddenTopics: ['sade_sati'],
    description: 'Parashari fixed vs Jaimini Chara Karakas comparison',
  },

  // 8. Multi-Layer Cross-Domain Timing
  {
    id: 'golden_19_career_promotion_timing_2027',
    query: 'Analyze how Jupiter transit, D10 Dashamsha, and active Mahadasha timing indicate executive promotion.',
    expectedTopics: ['career', 'transits', 'vargas', 'dasha'],
    expectedPrimaryCitationKeywords: ['BPHS', 'Phaladeepika', 'Dashamsha'],
    forbiddenTopics: ['marriage', 'upapada'],
    description: 'Multi-layer career promotion synthesis query',
  },
  {
    id: 'golden_20_marriage_navamsha_dasha',
    query: 'How does D9 Navamsha and 7th lord dasha indicate matrimonial timing and spousal harmony?',
    expectedTopics: ['marriage', 'vargas', 'dasha'],
    expectedPrimaryCitationKeywords: ['BPHS', 'Navamsha', 'Kalatra'],
    forbiddenTopics: ['career', 'dashamsha'],
    description: 'Matrimonial timing through D9 Navamsha and 7th lord dasha',
  },
];
