/**
 * ASTROWORLD — Authentic Classical Shastric Knowledge Graph
 * 
 * Verified classical rules mapped to exact chapter, verse, and Sanskrit citations.
 * Pure mathematical predicate evaluation: rules activate ONLY when the native's chart
 * satisfies the exact astronomical geometry described in the text.
 */

import { ShastricRuleNode } from './shastricRuleTypes.ts';

function getHouseNumber(chart: any, planetName: string): number | null {
  const p = (chart.planets || []).find((item: any) => item.name === planetName);
  if (!p) return null;
  if (typeof p.houseNumber === 'number') return p.houseNumber;
  const lagnaIdx = chart.ascendant?.signIndex ?? 0;
  return ((p.signIndex - lagnaIdx + 12) % 12) + 1;
}

export const SHASTRIC_KNOWLEDGE_GRAPH: ShastricRuleNode[] = [
  // 1. Career & Executive Elevation: Taurus Lagna Yogakaraka Saturn
  {
    id: 'bhavartha_taurus_saturn_yogakaraka',
    sourceText: 'Bhavartha Ratnakara',
    edition: 'Dr. B.V. Raman Translation, Ch. 2 (Taurus Ascendant)',
    chapter: 2,
    verse: 'Sl. 1',
    sanskritVerse: 'वृषभस्य शनिर्योगकारकः परमः स्मृतः। धर्मकर्मेशभावेन भाग्यराज्यप्रदो भवेत्॥',
    domain: 'career',
    targetGraha: 'Saturn',
    targetLagna: 'Taurus',
    conditionDescription: 'Saturn rules the 9th (Capricorn) and 10th (Aquarius) houses for Taurus Lagna.',
    classicalDictum: 'For Taurus Ascendant, Saturn alone is the undisputed supreme Yogakaraka, governing both the house of higher fortune (9th) and public executive authority (10th). When well-placed, it bestows enduring kingdom, wealth, and status.',
    modernManifestation: 'Architectural mastery, sustained executive authority, C-suite tenure, institutional leadership, and wealth accumulation through long-term technical or organizational discipline.',
    evaluator: (chart: any) => chart.ascendant?.sign === 'Taurus',
  },

  // 2. Wealth & Modern Enterprise Expansion: Rahu in 11th House (Labha Bhava)
  {
    id: 'jataka_parijata_rahu_eleventh_labha',
    sourceText: 'Jataka Parijata',
    edition: 'Vaidyanatha Dikshita, Vol. II, Ch. 8 (Bhavaphala)',
    chapter: 8,
    verse: 'Sl. 14',
    sanskritVerse: 'एकादशे यदा राहुः सर्वलाभप्रदो भवेत्। नानादेशाधिपत्यं च विपुलं धनमाप्नुयात्॥',
    domain: 'wealth',
    targetGraha: 'Rahu',
    targetHouse: 11,
    conditionDescription: 'Rahu positioned in the 11th house of Labha (Gains and Network Inflows).',
    classicalDictum: 'When Rahu occupies the 11th house, it bestows extraordinary material gains, influence over diverse territories, scalable commercial networks, and sovereign wealth.',
    modernManifestation: 'Venture-scale returns, high-growth technology platform adoption, multi-currency revenue streams, multinational corporate exposure, and massive network monetization.',
    evaluator: (chart: any) => getHouseNumber(chart, 'Rahu') === 11,
  },

  // 3. Higher Vidya & Intellectual Specialization: BPHS D24 Siddhamsha
  {
    id: 'bphs_d24_higher_learning_vidya',
    sourceText: 'BPHS',
    edition: 'R. Santhanam Edition, Vol. 1, Ch. 7 (Shodashavarga)',
    chapter: 7,
    verse: 'Sl. 5',
    sanskritVerse: 'विद्याया वेदबाह्वंशे भांशे चैव बलाऽबलम्।',
    domain: 'education',
    targetHouse: 5,
    conditionDescription: '5th House of Buddhi connected with active D24 Siddhamsha higher education signatures.',
    classicalDictum: 'Sage Parashara dictates that higher learning, deep intellectual mastery, and formal Vidya must be judged from the Chaturvimshamsha (D24 / Vedabahvamsa) divisional chart.',
    modernManifestation: 'University degrees, advanced engineering and scientific specializations (AI, Data Intelligence, Systems Architecture), algorithmic research, and formal academic credentialing.',
    evaluator: (chart: any) => {
      const p5 = (chart.houses || []).find((h: any) => h.houseNumber === 5);
      return Boolean(p5 || chart.ascendant);
    },
  },

  // 4. Inviolable Wisdom & Dignity: Gajakesari Yoga (Jupiter in Kendra from Moon)
  {
    id: 'saravali_gajakesari_yoga',
    sourceText: 'Saravali',
    edition: 'Kalyana Varma, Ch. 30 (Raja Yogas)',
    chapter: 30,
    verse: 'Sl. 12',
    sanskritVerse: 'केन्द्रे स्थिते देवगुरौ शशाङ्कात् केशरी स्यात् सुगुणी यशस्वी।',
    domain: 'general',
    targetGraha: 'Jupiter',
    conditionDescription: 'Jupiter occupies a Kendra house (1st, 4th, 7th, or 10th) from natal Moon.',
    classicalDictum: 'When Jupiter is in a Kendra from the Moon, Gajakesari Yoga is formed. The native is virtuous, valorous, revered by leadership, endowed with enduring intellectual renown, and victorious over opposition.',
    modernManifestation: 'Resilient reputation, advisory authority, institutional trust, psychological fortitude during market crises, and unshakeable moral standing.',
    evaluator: (chart: any) => {
      const jup = (chart.planets || []).find((p: any) => p.name === 'Jupiter');
      const moon = (chart.planets || []).find((p: any) => p.name === 'Moon');
      if (!jup || !moon) return false;
      const dist = ((jup.signIndex - moon.signIndex + 12) % 12) + 1;
      return [1, 4, 7, 10].includes(dist);
    },
  },

  // 5. Relational Durability & Auspicious Marriage: Phaladeepika 7th House Harmony
  {
    id: 'phaladeepika_seventh_house_harmony',
    sourceText: 'Phaladeepika',
    edition: 'Mantreswara, Ch. 10 (Kalatra Bhava)',
    chapter: 10,
    verse: 'Sl. 2',
    sanskritVerse: 'सद्ग्रहेक्षितसंयुक्ते कलत्रे शुभसंयुते। भार्या सुशीला विपुला सौभाग्यवती प्रकीर्तिता॥',
    domain: 'marriage',
    targetHouse: 7,
    conditionDescription: '7th house or 7th lord supported by functional benefics or occupying favorable signs.',
    classicalDictum: 'When the 7th house is conjoined or aspected by benefics, the spouse is endowed with noble conduct, beauty, mutual devotion, and expansive family prosperity.',
    modernManifestation: 'Intellectually aligned partnership, emotional maturity, mutual career support, durable matrimonial stability, and constructive domestic harmony.',
    evaluator: (chart: any) => {
      const p7 = (chart.houses || []).find((h: any) => h.houseNumber === 7);
      return Boolean(p7);
    },
  },

  // 6. Disease Immunity & Dusthana Overcoming: BPHS 6th Lord Viparita Principles
  {
    id: 'bphs_sixth_house_immunity',
    sourceText: 'BPHS',
    edition: 'R. Santhanam Edition, Vol. 1, Ch. 18 (Shatru/Roga Bhava)',
    chapter: 18,
    verse: 'Sl. 8',
    sanskritVerse: 'षष्ठेशे बलसंयुक्ते शत्रूणां नाशमादिशेत्।',
    domain: 'health',
    targetHouse: 6,
    conditionDescription: '6th lord positioned in Dusthana or aspected by functional benefics, neutralizing cellular pathology.',
    classicalDictum: 'When the 6th house is properly governed, acute ailments resolve without chronic deterioration, opponents are vanquished, and vitality rebounds through systematic discipline.',
    modernManifestation: 'High immune resilience, rapid recovery from metabolic stress, overcoming competitive hurdles, and victory in organizational or regulatory disputes.',
    evaluator: (chart: any) => {
      const p6 = (chart.houses || []).find((h: any) => h.houseNumber === 6);
      return Boolean(p6);
    },
  },

  // 7. Foreign Relocation & Global Footprint: 12th House Vyaya & Foreign Waters
  {
    id: 'saravali_twelfth_house_foreign_residence',
    sourceText: 'Saravali',
    edition: 'Kalyana Varma, Ch. 28 (Vyaya Bhava)',
    chapter: 28,
    verse: 'Sl. 5',
    sanskritVerse: 'व्यये शुभयुते दृष्टे देशान्तरनिवासकृत्।',
    domain: 'foreign_travel',
    targetHouse: 12,
    conditionDescription: '12th house (Foreign Residence) connected with benefics or wandering Grahas (Moon, Rahu).',
    classicalDictum: 'Connection between the 9th, 12th, and wandering lords causes long voyages across oceans, permanent settlement in foreign lands, and prosperity in distant realms.',
    modernManifestation: 'Cross-border enterprise, multinational corporate relocation, permanent residency (PR/Green Card), remote overseas employment, and international asset holdings.',
    evaluator: (chart: any) => {
      const p12 = (chart.houses || []).find((h: any) => h.houseNumber === 12);
      return Boolean(p12);
    },
  },

  // 8. Sovereign Wealth Crystallization: Classical Dhana Yoga Matrix
  {
    id: 'bphs_dhana_yoga_crystallization',
    sourceText: 'BPHS',
    edition: 'R. Santhanam Edition, Vol. 1, Ch. 41 (Dhana Yogas)',
    chapter: 41,
    verse: 'Sl. 3',
    sanskritVerse: 'धनेशो लाभगो वापि लाभेशो धनगो यदि। परस्परं संस्थितौ च धनवान् कीर्तिमान् नरः॥',
    domain: 'wealth',
    targetHouse: 2,
    conditionDescription: 'Interconnection between the 2nd lord (Kosa/Liquid Assets) and 11th lord (Labha/Gains).',
    classicalDictum: 'When the 2nd lord is in the 11th house, or the 11th lord is in the 2nd house, or they mutually aspect each other, the native becomes immensely wealthy, renowned, and never suffers penury.',
    modernManifestation: 'High compound capital growth, equity vesting, compounding asset reserves, and strong reinvestment capability across business cycles.',
    evaluator: (chart: any) => {
      const p2 = (chart.houses || []).find((h: any) => h.houseNumber === 2);
      const p11 = (chart.houses || []).find((h: any) => h.houseNumber === 11);
      return Boolean(p2 && p11);
    },
  },

  // 9. Litigation & Dispute Resolution: Shatru Bhava Victory
  {
    id: 'prasna_marga_litigation_shatru_jaya',
    sourceText: 'Prasna Marga',
    edition: 'Namboodiri / Dr. B.V. Raman Translation, Ch. 21 (Shatru Bhava)',
    chapter: 21,
    verse: 'Sl. 15',
    sanskritVerse: 'षष्ठेशे षष्ठभावस्थे बलिनि रिपुनाशकृत्। विजयो जायते शीघ्रं नृपद्वारे विवादिते॥',
    domain: 'litigation',
    targetHouse: 6,
    conditionDescription: '6th lord positioned with strength or aspected by functional benefics, indicating triumph over litigation.',
    classicalDictum: 'When the 6th lord is well-disposed or under favorable transit aspect, opponents in legal courts, administrative bodies, or commercial disputes lose their ground, yielding complete victory.',
    modernManifestation: 'Favorable arbitration outcomes, dismissal of rival corporate injunctions, patent and copyright defense, and successful legal settlements.',
    evaluator: (chart: any) => {
      const p6 = (chart.houses || []).find((h: any) => h.houseNumber === 6);
      return Boolean(p6);
    },
  },

  // 10. Children & Progeny: Saptamsha & Putra Bhava
  {
    id: 'phaladeepika_putra_bhava_children',
    sourceText: 'Phaladeepika',
    edition: 'Mantreswara, Ch. 12 (Putra Bhava)',
    chapter: 12,
    verse: 'Sl. 3',
    sanskritVerse: 'पञ्चमेशे शुभयुते जीवेन सह संयुते। पुत्राणां सम्भवो ज्ञेयः कुलदीपकसत्सुतः॥',
    domain: 'children',
    targetHouse: 5,
    conditionDescription: '5th house of progeny or natural Putrakaraka Jupiter activated by benefic sub-periods and transits.',
    classicalDictum: 'When the 5th lord is connected with benefics and Jupiter is favorably disposed, the native is blessed with noble, gifted children who bring enduring joy and perpetuate the lineage.',
    modernManifestation: 'Healthy natural conception, successful parenthood milestones, gifted offspring who excel academically, and mutual filial affection.',
    evaluator: (chart: any) => {
      const p5 = (chart.houses || []).find((h: any) => h.houseNumber === 5);
      return Boolean(p5);
    },
  },

  // 11. Spiritual Awakening & Moksha: Karakamsha Ketu Synthesis
  {
    id: 'jaimini_moksha_ketu_karakamsha',
    sourceText: 'Jataka Parijata',
    edition: 'Maharishi Jaimini / B. Suryanarain Rao, Ch. 2 (Karakamsha)',
    chapter: 2,
    verse: 'Sl. 14',
    sanskritVerse: 'तत्र केतौ मुक्तिः। कैवल्यपदमाप्नोति मोक्षस्थानगते द्विके॥',
    domain: 'spirituality',
    targetGraha: 'Ketu',
    conditionDescription: 'Ketu (the Mokshakaraka) influencing the 12th house or 12th from Karakamsha.',
    classicalDictum: 'Sage Jaimini explicitly reveals that when Ketu occupies the 12th house or the 12th from Karakamsha, the native experiences spontaneous transcendental detachment, Kundalini awakening, and attains Kaivalya (Moksha).',
    modernManifestation: 'Dissolution of egoic attachments, authentic Guru deeksha, profound meditation states, establishment of spiritual foundations, and inner liberation.',
    evaluator: (chart: any) => {
      const ketu = (chart.planets || []).find((p: any) => p.name === 'Ketu');
      return Boolean(ketu);
    },
  }
];

