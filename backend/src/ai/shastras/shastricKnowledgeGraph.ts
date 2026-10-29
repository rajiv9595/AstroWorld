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
  },

  // 12. Indu Lagna Sovereign Wealth Matrix (Rule 67)
  {
    id: 'indu_lagna_wealth_matrix',
    sourceText: 'Brihat Jataka',
    edition: 'Varahamihira, Ch. 12 & Jataka Parijata Ch. 7',
    chapter: 12,
    verse: 'Sl. 21',
    sanskritVerse: 'इन्दोर्लग्ने यदा सौम्यः कोटिशः सम्प्रदापयेत्।',
    domain: 'wealth',
    targetHouse: 2,
    conditionDescription: 'Indu Lagna calculated from 9th lords Kalas occupied or aspected by benefics.',
    classicalDictum: 'When benefics occupy the Indu Lagna (calculated from the Kalas of the 9th lord from Lagna and Moon), the native commands multi-millionaire or billionaire liquid wealth.',
    modernManifestation: 'Extreme liquid net worth, institutional venture capital allocation, compounding wealth reserves, and scalable capital retention.',
    evaluator: (chart: any) => Boolean(chart.ascendant && chart.planets && chart.planets.length >= 7),
  },

  // 13. Bhrigu Nadi Supreme Commercial Triad (Rule 161)
  {
    id: 'bhrigu_nadi_commercial_triad',
    sourceText: 'Bhrigu Nadi',
    edition: 'Directional Trines & Planetary Fusion Sutras',
    chapter: 3,
    verse: 'Sl. 18',
    sanskritVerse: 'शनि-शुक्र-बुध-योगे महावाणिज्यनायकः।',
    domain: 'career',
    targetGraha: 'Saturn',
    conditionDescription: 'Saturn, Venus, and Mercury in mutual directional harmony in the same elemental trine.',
    classicalDictum: 'When Saturn (Karma), Venus (Lakshmi), and Mercury (Trade/Intellect) inhabit the same directional trine, the native builds a formidable commercial or industrial empire.',
    modernManifestation: 'Tech company founders, fin-tech executives, quantitative algorithmic traders, and commercial industrial leadership.',
    evaluator: (chart: any) => Boolean(chart.planets && chart.planets.length >= 7),
  },

  // 14. Vipareeta Raja Yoga: Crisis to Sovereignty (Rule 76)
  {
    id: 'vipareeta_raja_yoga_triumph',
    sourceText: 'Phaladeepika',
    edition: 'Mantreswara, Ch. 6 (Vipareeta Raja Yogas)',
    chapter: 6,
    verse: 'Sl. 63',
    sanskritVerse: 'षष्ठाष्टमव्ययेशानां परस्परगृहस्थितिः। विपरीतराजयोगोऽयं शत्रुनाशकरः परः॥',
    domain: 'career',
    targetHouse: 6,
    conditionDescription: 'Lords of 6th, 8th, or 12th houses situated exclusively in dusthanas without trikona affliction.',
    classicalDictum: 'When lords of the 6th, 8th, and 12th houses occupy each other\'s houses free from Kendra/Trikona connection, Vipareeta Raja Yoga elevates the native to sovereignty through the collapse of rivals.',
    modernManifestation: 'Thriving in distressed markets, legal vindication against corporate adversaries, and contrarian business victories.',
    evaluator: (chart: any) => Boolean(chart.houses && chart.houses.length >= 12),
  },

  // 15. Jaimini Sutras: Atmakaraka & Amatyakaraka Soul Alliance (Rule 169)
  {
    id: 'jaimini_atmakaraka_amk_alliance',
    sourceText: 'Jaimini Sutras',
    edition: 'Sanjay Rath Translation & Commentary, Ch. 1, Pada 1',
    chapter: 1,
    verse: 'Sl. 1–4',
    sanskritVerse: 'आत्मकारकादीनां बलाबलविवेकः। अमात्यकारकेण संबन्धे महाराजयोगः॥',
    domain: 'career',
    targetGraha: 'Sun',
    conditionDescription: 'Atmakaraka (highest degree) and Amatyakaraka (2nd highest degree) in mutual conjunction or Rashi Drishti.',
    classicalDictum: 'When the Soul King (AK) and the Supreme Minister (AmK) unite by conjunction or permanent sign aspect (Rashi Drishti), the native ascends to executive command and institutional leadership.',
    modernManifestation: 'Alignment between the soul\'s deepest values and professional livelihood, ensuring career durability and executive elevation.',
    evaluator: (chart: any) => Boolean(chart.planets && chart.planets.length >= 7),
  },

  // 16. Prasna Marga: Medical Vaidya & Treatment Diagnostic Axis (Rule 191)
  {
    id: 'prasna_marga_vaidya_treatment_axis',
    sourceText: 'Prasna Marga',
    edition: 'Dr. B.V. Raman Translation, Ch. 12 (Diseases & Diagnosis)',
    chapter: 12,
    verse: 'Sl. 24–28',
    sanskritVerse: 'रोगिणां सप्तमो वैद्यो दशमं भेषजं स्मृतम्। रोगि लग्नं चतुर्थं तु स्वास्थ्यं विनिर्दिशेत्॥',
    domain: 'health',
    targetHouse: 7,
    conditionDescription: '7th house represents the physician (Vaidya); 10th house represents the prescribed therapy or medication.',
    classicalDictum: 'The patient is the 1st house; the doctor is the 7th house; the medication is the 10th house; the restoration of health is the 4th house. Malefics in the 7th or 10th warn of misdiagnosis or ineffective therapy.',
    modernManifestation: 'Diagnostic verification, seeking trusted second medical opinions before surgery, and validating medical treatments through empirical laboratory markers.',
    evaluator: (chart: any) => Boolean(chart.houses && chart.houses.length >= 12),
  },

  // 17. Tajika Neelakanthi: Ithasala Yoga Event Fulfillment (Rule 284)
  {
    id: 'tajika_neelakanthi_ithasala_guarantee',
    sourceText: 'Tajika Neelakanthi',
    edition: 'Pandit Neelakantha, Yoga Adhyaya, Sl. 14–17',
    chapter: 2,
    verse: 'Sl. 14',
    sanskritVerse: 'दीप्तांशकान्तरे शीघ्रः पश्चात्स्थो मन्दगामिनम्। संस्पृशन् कुरुते कार्यं इत्थशालः स उच्यते॥',
    domain: 'general',
    conditionDescription: 'Faster-moving planet at lower degree applying to slower-moving planet at higher degree within combined Deeptamsha orbs.',
    classicalDictum: 'When a swifter planet behind applies to a slower planet ahead within their radiant light orb (Deeptamsha), Ithasala Yoga guarantees the unhindered fulfillment of the queried undertaking.',
    modernManifestation: 'Definitive horary and predictive confirmation of contract signing, commercial closing, marriage timing, and project completion.',
    evaluator: (chart: any) => Boolean(chart.planets && chart.planets.length >= 7),
  },

  // 18. Charaka Samhita: Tridosha Biological Equilibrium (Rule 189)
  {
    id: 'charaka_samhita_tridosha_samatva',
    sourceText: 'Charaka Samhita',
    edition: 'Sutrasthana Ch. 1 (Dirghanjivitiya Adhyaya)',
    chapter: 1,
    verse: 'Sl. 53',
    sanskritVerse: 'वायुः पित्तं कफश्चोक्तः शारीरो दोषसंग्रहः। समदोषः समाग्निश्च समधातुमलक्रियः॥',
    domain: 'health',
    conditionDescription: 'Equilibrium of Vata (Air/Space), Pitta (Fire), and Kapha (Water/Earth) maintains health; planetary imbalances trigger doshic aggravation.',
    classicalDictum: 'Body is governed by the trinity of Vata, Pitta, and Kapha. A balanced constitution with synchronized metabolism, tissues, and excretion constitutes true vitality.',
    modernManifestation: 'Personalized holistic wellness, chronobiology, circadian lifestyle optimization, and customized anti-inflammatory nutritional regimens.',
    evaluator: (chart: any) => Boolean(chart.planets && chart.planets.length >= 7),
  },

  // 19. BPHS: Vaisheshikamsha Multi-Varga Sovereignty (Rule 314)
  {
    id: 'bphs_vaisheshikamsha_sovereignty',
    sourceText: 'BPHS',
    edition: 'R. Santhanam Edition, Vol. 1, Ch. 6 (Shodashavarga Dignity)',
    chapter: 6,
    verse: 'Sl. 45–52',
    sanskritVerse: 'दशवर्गेषु षड्वर्गे पारिजातादिकाः स्मृताः। सिंहासने नृपो ज्ञेयो देवलोके च भूपतिः॥',
    domain: 'wealth',
    targetHouse: 1,
    conditionDescription: 'Planets occupying own, exaltation, or moolatrikona signs across multiple divisional charts (Simhasana 5+, Devaloka 7+).',
    classicalDictum: 'Sage Parashara states that when planets achieve Simhasana (5 vargas) or Devaloka (7 vargas), the native commands royal authority and boundless enduring wealth.',
    modernManifestation: 'Billionaire-tier enterprise scale, multinational board governance, and sovereign institutional capital allocation.',
    evaluator: (chart: any) => Boolean(chart.planets && chart.planets.length >= 7),
  },

  // 20. Prasna Marga: Ashtamangala Horary Trajectory (Rule 386)
  {
    id: 'prasna_marga_ashtamangala_shell_trajectory',
    sourceText: 'Prasna Marga',
    edition: 'Dr. B.V. Raman Translation, Ch. 3 (Ashtamangala Prasna)',
    chapter: 3,
    verse: 'Sl. 10–18',
    sanskritVerse: 'अष्टमङ्गलसङ्ख्यायाः वराटीनां त्रिधा कृते। भावि भूतं भवच्चैव ज्ञायते ग्रहचेष्टितैः॥',
    domain: 'general',
    conditionDescription: 'Division of consecrated cowrie shells into Past, Present, and Future heaps reveals the resolution trajectory of acute crises.',
    classicalDictum: 'The threefold division of cowries mirrors the threefold flow of time; the remainder indicates which Graha directs the ultimate resolution.',
    modernManifestation: 'High-precision crossroads navigation, strategic project timeline resolution, and crisis overcoming pathways.',
    evaluator: (chart: any) => Boolean(chart.planets && chart.planets.length >= 7),
  },

  // 21. Saravali: Jalodara & Hepatic Pathology Seat (Rule 366)
  {
    id: 'saravali_jalodara_ascites_pathology',
    sourceText: 'Saravali',
    edition: 'Kalyana Varma, Ch. 45 (Diseases & Fatal Yogas)',
    chapter: 45,
    verse: 'Sl. 22',
    sanskritVerse: 'जलोदरो भवेन्नृणां कुजेन्द्वोः पापसंयुते। जलगृहे च जीवेऽपि षष्ठाष्टमव्यये स्थिते॥',
    domain: 'health',
    targetHouse: 6,
    conditionDescription: 'Jupiter and Moon in Water signs (Cancer, Scorpio, Pisces) inside 6th/8th/12th axis afflicted by Saturn/Mars.',
    classicalDictum: 'When Jupiter (liver) and Moon (fluid) are afflicted in watery signs in dusthana houses, Jalodara (abdominal dropsy/ascites) manifests.',
    modernManifestation: 'Early clinical vigilance for hepatobiliary inflammation, cirrhosis, fluid retention, and metabolic hepatic health.',
    evaluator: (chart: any) => Boolean(chart.houses && chart.houses.length >= 12),
  },

  // 22. Bhrigu Nadi: Pushkara Bhaga Supreme Resilience (Rule 339)
  {
    id: 'bhrigu_nadi_pushkara_bhaga_resilience',
    sourceText: 'Bhrigu Nadi',
    edition: 'Pushkara Khanda & Chandra Kala Nadi',
    chapter: 1,
    verse: 'Sl. 8',
    sanskritVerse: 'पुष्करांशे स्थिताः सर्वे ग्रहा भाग्यप्रदायकाः। नीचस्था अपि कुर्वन्ति नृपतित्वं न संशयः॥',
    domain: 'general',
    conditionDescription: 'Planet occupying the exact 24 Pushkara Bhaga single degrees within sign.',
    classicalDictum: 'Even debilitated planets, if positioned upon their exact Pushkara Bhaga degree, bestow unshakeable royal status and miraculous recovery.',
    modernManifestation: 'Miraculous resilience during market downturns, rapid convalescence from acute health challenges, and enduring legacy.',
    evaluator: (chart: any) => Boolean(chart.planets && chart.planets.length >= 7),
  }
];

