/**
 * Domain method playbooks — RAG-as-skills for the consult agent.
 * Comprehensive, unbiased Vedic Jyotish technique checklists covering all life sectors.
 */

export interface DomainPlaybook {
  id: string;
  domain: string;
  title: string;
  chartLayers: string[];
  houses: number[];
  planets: string[];
  requiredTools: string[];
  methodSteps: string[];
  timingFocus: string[];
}

export const DOMAIN_PLAYBOOKS: DomainPlaybook[] = [
  {
    id: 'pb_marriage',
    domain: 'marriage',
    title: 'Marriage, Spouse & Relational Harmony',
    chartLayers: ['D1', 'D9'],
    houses: [7, 2, 11, 4, 8, 12],
    planets: ['Venus', 'Jupiter', 'Moon', 'Mars'],
    requiredTools: [
      'get_birth_chart',
      'get_divisional_chart',
      'get_jaimini_details',
      'get_active_yogas',
      'scan_dasha_windows',
      'scan_transits',
      'rank_timing_windows',
    ],
    methodSteps: [
      'Inspect D1 7th house (Kalatra Bhava), 7th lord disposition, occupants, and aspects.',
      'Audit Jaimini Upapada Lagna (UL) and 2nd from UL for matrimonial longevity and stability.',
      'Mandatory D9 Navamsha: inspect D9 7th house, D9 7th lord, Venus dignity, and Jaimini Darakaraka (DK).',
      'Assess Manglik / Kuja Dosha from Lagna, Moon, and Venus; evaluate classical cancellations (exaltation, own sign, Jupiter aspect).',
      'List Vimshottari AD windows of 7th lord, Venus, Jupiter, or D9 Lagna lord overlapping the scan range.',
      'Scan Jupiter/Saturn double transits conferring fructification on natal 7th house / 7th lord.',
      'Rank EVENT_WINDOW confluence; never invent exact wedding calendar days.',
    ],
    timingFocus: ['7th house transits', 'Venus/Jupiter dasha', 'D9 confirmation', 'Double transit on 7th'],
  },
  {
    id: 'pb_relationship',
    domain: 'relationship',
    title: 'Love, Romance, Compatibility & Partnerships',
    chartLayers: ['D1', 'D9'],
    houses: [5, 7, 11],
    planets: ['Venus', 'Moon', 'Jupiter', 'Mars', 'Rahu'],
    requiredTools: [
      'get_birth_chart',
      'get_divisional_chart',
      'get_jaimini_details',
      'scan_dasha_windows',
      'scan_transits',
      'rank_timing_windows',
    ],
    methodSteps: [
      'Assess 5th house (romance, attraction, purva punya) and 7th house (commitment, formal union) separately.',
      'Examine Venus (Karaka of love) and Moon (emotional attachment and vulnerability).',
      'Use D9 Navamsha for underlying psychological endurance; D1 for immediate manifestation.',
      'Analyze Rahu/Ketu axis relative to 5th/7th houses for unconventional or karmic soul connections.',
      'Rank dasha + transit windows for relationship initiation and mutual alignment.',
    ],
    timingFocus: ['5th/7th activation', 'Venus dasha', 'Jupiter gochara', 'Moon transit triggers'],
  },
  {
    id: 'pb_career',
    domain: 'career',
    title: 'Career, Profession, Vocation & Business',
    chartLayers: ['D1', 'D10', 'D24', 'D9'],
    houses: [10, 6, 2, 11, 5, 9, 3],
    planets: ['Sun', 'Saturn', 'Mercury', 'Mars', 'Jupiter', 'Rahu'],
    requiredTools: [
      'get_birth_chart',
      'get_divisional_chart',
      'get_jaimini_details',
      'analyze_career_and_education',
      'scan_dasha_windows',
      'scan_transits',
      'rank_timing_windows',
    ],
    methodSteps: [
      'Read 10th house (Karma Bhava), 10th lord, and dispositor chain from D1 Rashi.',
      'Analyze D10 Dashamsha for executive action, authority, leadership, and professional stature.',
      'Analyze D24 Siddhamsa to separate academic training from subsequent vocational evolution.',
      'Synthesize Jaimini Amatyakaraka (AmK) in D1/D9/D10 and 10th from Karakamsha.',
      'Distinguish salaried corporate employment (6th house/Saturn) from independent entrepreneurship (3rd/7th/11th/Mercury/Sun).',
      'Execute analyze_career_and_education to rank vocational archetypes with honest epistemic calibration.',
    ],
    timingFocus: ['10th house', 'D10', 'career dasha lords', 'Jupiter/Saturn transit', 'timing windows'],
  },
  {
    id: 'pb_finance',
    domain: 'finance',
    title: 'Wealth, Abundance, Investments & Financial Sovereignty',
    chartLayers: ['D1', 'D2'],
    houses: [2, 11, 9, 5, 1, 8, 12],
    planets: ['Jupiter', 'Venus', 'Mercury', 'Moon'],
    requiredTools: [
      'get_birth_chart',
      'get_divisional_chart',
      'get_ashtakavarga',
      'get_active_yogas',
      'scan_dasha_windows',
      'scan_transits',
      'rank_timing_windows',
    ],
    methodSteps: [
      'Assess 2nd house (Dhana / asset accumulation) and 11th house (Labha / revenue inflow) with lords and occupants.',
      'Inspect D2 Hora chart to determine lunar (steady wealth) vs solar (active enterprise) financial mode.',
      'Identify classical Dhana Yogas (conjunctions/mutual aspects between 1st, 2nd, 5th, 9th, and 11th lords).',
      'Calculate Sarvashtakavarga (SAV) points: compare 11th house gains against 12th house expenditures for retention capacity.',
      'Evaluate Indu Lagna (wealth multiplier point) and planets aspecting or occupying it.',
      'Audit 6th/8th/12th afflictions to identify risks of speculative losses, debts, or bankruptcy.',
    ],
    timingFocus: ['2nd/11th activation', 'Jupiter/Venus/Mercury dasha', 'SAV transit score', 'Indu Lagna transits'],
  },
  {
    id: 'pb_education',
    domain: 'education',
    title: 'Higher Education, Degree & Academic Specialization',
    chartLayers: ['D1', 'D24', 'D9', 'Chalit'],
    houses: [4, 5, 9, 10],
    planets: ['Mercury', 'Jupiter', 'Mars', 'Rahu', 'Saturn'],
    requiredTools: [
      'get_birth_chart',
      'get_divisional_chart',
      'get_chalit_chart',
      'get_jaimini_details',
      'retrieve_classical_rules',
    ],
    methodSteps: [
      'Inspect D1 5th house (intellect), 5th lord, 10th house (practical career alignment), and Mercury (Karaka of cognition).',
      'Audit Sripathi Bhava Chalit house cusps: verify individual planet longitudes against Bhava Viram Sandhi before asserting shifts.',
      'Inspect D9 Navamsha: D9 Lagna, 5th house, and Atmakaraka Karakamsa (Jaimini Upadesha Sutras 1.2).',
      'Mandatory D24 (Chaturvimshamsha / Siddhamsha): inspect D24 Lagna, D24 5th house and lord for specialized branch of study, and D24 11th house for academic achievements.',
      'Synthesize disciplinary archetype: Technical/Engineering/Data (Mercury in Gemini/Virgo, Mars/Rahu/Saturn) vs Medical/Biological (Sun/Mars/Jupiter/6th) with explicit epistemic uncertainty.',
    ],
    timingFocus: ['D24 confirmation', '5th/9th/10th confluence', 'Mercury/Rahu/Jupiter periods'],
  },
  {
    id: 'pb_health',
    domain: 'health',
    title: 'Vitality, Medical Jyotish, Longevity & Ayurvedic Tridosha',
    chartLayers: ['D1', 'D3', 'D30'],
    houses: [1, 6, 8, 12, 2, 7],
    planets: ['Sun', 'Moon', 'Mars', 'Saturn', 'Rahu', 'Ketu'],
    requiredTools: [
      'get_birth_chart',
      'get_divisional_chart',
      'get_planetary_strength',
      'get_current_dasha',
      'scan_transits',
      'retrieve_classical_rules',
    ],
    methodSteps: [
      'Assess 1st house (Tanu Bhava) and Lagna lord for baseline vitality and constitutional immunity.',
      'Inspect 6th house (Roga Bhava) for acute ailments; 8th house (Ayus Bhava) for chronic conditions and longevity.',
      'Identify 22nd Drekkhana (8th in D3) and its lord (Kharesha) as well as 64th Navamsha for acute health vulnerabilities.',
      'Evaluate Maraka houses (2nd and 7th) and Badhaka Sthana relative to running dasha.',
      'Synthesize Ayurvedic Tridosha balance: Pitta (Sun/Mars/inflammation), Vata (Saturn/Rahu/nervous/joints), Kapha (Moon/Venus/Jupiter/mucus/metabolism).',
      'Mandatory Epistemic Protocol: Never provide fatalistic diagnostic claims; encourage professional medical consultations.',
    ],
    timingFocus: ['Lagna lord strength', '6th/8th house dasha', 'Saturn/Rahu transits', '22nd Drekkhana activation'],
  },
  {
    id: 'pb_progeny',
    domain: 'progeny',
    title: 'Children, Progeny, Fertility & Santana Bhava',
    chartLayers: ['D1', 'D7'],
    houses: [5, 2, 11, 9],
    planets: ['Jupiter', 'Sun', 'Mars', 'Venus', 'Moon'],
    requiredTools: [
      'get_birth_chart',
      'get_divisional_chart',
      'get_jaimini_details',
      'get_active_yogas',
      'scan_dasha_windows',
      'scan_transits',
      'rank_timing_windows',
    ],
    methodSteps: [
      'Inspect 5th house (Putra Bhava), 5th lord, and primary Karaka Jupiter in D1 Rashi.',
      'Mandatory D7 Saptamsha examination: inspect D7 Lagna, D7 5th house, and D7 Jupiter placement (BPHS Ch. 6, Sl. 14–15).',
      'Synthesize Jaimini Putrakaraka (PK) and its dignity in D1 and D9.',
      'Check classical Santan Dosha (affliction to 5th house by Rahu/Ketu, Saturn, or Mars without benefic aspect).',
      'Audit Beeja Sphuta (for male vitality) and Kshetra Sphuta (for female vitality) when fertility questions arise.',
      'Scan double-transit activation of Jupiter and Saturn over natal 5th house or 5th lord for conception and childbirth windows.',
    ],
    timingFocus: ['5th house dasha', 'Jupiter transit on 5th/9th', 'D7 Saptamsha activation', 'Double transit on 5th'],
  },
  {
    id: 'pb_property',
    domain: 'property',
    title: 'Real Estate, Land, Property, Home & Luxury Vehicles',
    chartLayers: ['D1', 'D4', 'D16'],
    houses: [4, 2, 11, 12],
    planets: ['Mars', 'Venus', 'Moon', 'Saturn'],
    requiredTools: [
      'get_birth_chart',
      'get_divisional_chart',
      'get_active_yogas',
      'scan_dasha_windows',
      'scan_transits',
      'rank_timing_windows',
    ],
    methodSteps: [
      'Inspect 4th house (Sukha & Matri Bhava), 4th lord, and natural Karakas: Mars (Bhumi / land & real estate) and Venus (Vahana / luxury vehicles).',
      'Mandatory D4 Chaturthamsha examination for immovable property, buildings, land acquisitions, and domestic stability (BPHS Ch. 6, Sl. 8–9).',
      'Mandatory D16 Shodasamsa examination for vehicles, conveyances, and general comforts (BPHS Ch. 6, Sl. 19–20).',
      'Examine 4th house affliction (Rahu/Saturn/Mars) for property disputes or relocation necessities.',
      'Scan dasha periods of 4th lord, Mars, or Venus coupled with Jupiter gochara on the 4th house for purchase timing.',
    ],
    timingFocus: ['4th house activation', 'Mars/Venus dasha periods', 'D4 confirmation', 'Jupiter transiting 4th'],
  },
  {
    id: 'pb_spirituality',
    domain: 'spirituality',
    title: 'Spirituality, Moksha, Meditation, Ishta Devata & Past Karma',
    chartLayers: ['D1', 'D9', 'D20'],
    houses: [9, 12, 8, 4, 5, 1],
    planets: ['Jupiter', 'Ketu', 'Sun', 'Saturn', 'Mercury', 'Moon'],
    requiredTools: [
      'get_birth_chart',
      'get_divisional_chart',
      'get_jaimini_details',
      'retrieve_classical_rules',
      'scan_transits',
    ],
    methodSteps: [
      'Inspect 9th house (Dharma / Guru), 12th house (Moksha / Kaivalya), and 8th house (Kundalini / Occult / Sadhana).',
      'Determine Jaimini Atmakaraka (AK) and its Navamsha placement (Karakamsha Lagna).',
      'Determine Ishta Devata from the 12th house from Karakamsha in D9 (Jaimini Upadesha Sutras Ch. 1, Sl. 2).',
      'Inspect D20 Vimsamsa for upasana siddhi, mantra alignment, and devotional receptivity (BPHS Ch. 6, Sl. 22–23).',
      'Synthesize Ketu’s disposition (Moksha Karaka) and Jupiter (Spiritual Preceptor / Wisdom).',
    ],
    timingFocus: ['12th/9th house dasha', 'Jupiter transits over Dharma/Moksha houses', 'Ketu sub-periods'],
  },
  {
    id: 'pb_litigation',
    domain: 'litigation',
    title: 'Litigation, Legal Disputes, Enemies, Court Battles & Competitors',
    chartLayers: ['D1', 'D6'],
    houses: [6, 8, 10, 1, 12, 3],
    planets: ['Mars', 'Saturn', 'Rahu', 'Sun', 'Jupiter'],
    requiredTools: [
      'get_birth_chart',
      'get_divisional_chart',
      'get_active_yogas',
      'scan_dasha_windows',
      'scan_transits',
      'rank_timing_windows',
    ],
    methodSteps: [
      'Examine 6th house (Shatru & Vivada Bhava), 6th lord strength, and natural malefics in 6th (Mars, Saturn, Rahu).',
      'Identify Shatru Hanta Yogas: natural malefics placed in the 6th house vanquish opponents and bring legal triumph.',
      'Check Vipareeta Raja Yogas (6th lord in 8th/12th, or 8th lord in 6th) which turn adversity and legal attacks into unexpected victory.',
      'Compare strength of Lagna lord (native) vs 6th lord (opponent) to predict verdict outcomes.',
      'Scan timing windows when Lagna lord or 10th lord runs sub-periods under protective Jupiter gochara.',
    ],
    timingFocus: ['6th house dasha', 'Lagna lord vs 6th lord dasha', 'Mars/Rahu transits', 'Court verdict windows'],
  },
  {
    id: 'pb_foreign',
    domain: 'foreign',
    title: 'Foreign Travel, Relocation, Visa, Overseas Settlement & Citizenship',
    chartLayers: ['D1', 'D9', 'D4'],
    houses: [9, 12, 3, 4, 7],
    planets: ['Rahu', 'Moon', 'Jupiter', 'Saturn'],
    requiredTools: [
      'get_birth_chart',
      'get_divisional_chart',
      'scan_dasha_windows',
      'scan_transits',
      'rank_timing_windows',
    ],
    methodSteps: [
      'Examine 3rd house (departure from homeland), 9th house (long-distance pilgrimages/higher travel), and 12th house (foreign residence/distant lands).',
      'Check placement of 4th lord (homeland): 4th lord in 12th, 9th, or 6th, or afflicted by Rahu, signals permanent foreign settlement.',
      'Evaluate Movable Signs (Chara Rashi: Aries, Cancer, Libra, Capricorn) on 9th, 12th, or Lagna cusps.',
      'Analyze Rahu (Karaka for foreign lands, unconventional journeys) and Moon (travel/water crossings).',
      'Scan 9th/12th lord dasha windows and Rahu sub-periods for visa issuance and overseas relocation.',
    ],
    timingFocus: ['12th/9th house dasha', 'Rahu periods', 'Transits of Jupiter/Saturn over 9th/12th'],
  },
  {
    id: 'pb_family',
    domain: 'family',
    title: 'Family, Parents, Siblings, In-Laws & Lineage (Kula Karma)',
    chartLayers: ['D1', 'D12', 'D3'],
    houses: [2, 4, 9, 3, 11],
    planets: ['Sun', 'Moon', 'Mars', 'Jupiter'],
    requiredTools: [
      'get_birth_chart',
      'get_divisional_chart',
      'get_active_yogas',
      'scan_dasha_windows',
      'scan_transits',
    ],
    methodSteps: [
      'Evaluate 9th house and Sun for father (Pitri Bhava & Karaka); 4th house and Moon for mother (Matri Bhava & Karaka).',
      'Mandatory D12 Dwadasamsa examination for ancestral karma, parents’ health, and paternal/maternal lineages (BPHS Ch. 6, Sl. 17–18).',
      'Evaluate 3rd house and Mars for younger siblings; 11th house and Jupiter for elder siblings; inspect D3 Drekkhana.',
      'Inspect 2nd house (Kutumba Bhava) for domestic harmony, shared family values, and extended family ties.',
      'Check for Pitru Dosha or ancestral afflictions (Sun/Moon conjunct Rahu/Ketu) and provide restorative guidance.',
    ],
    timingFocus: ['9th/4th house dasha', 'Sun/Moon sub-periods', 'D12 Dwadasamsa activation'],
  },
  {
    id: 'pb_remedy',
    domain: 'remedy',
    title: 'Authentic Classical Vedic Remedies (Shastric Upayas)',
    chartLayers: ['D1', 'D9'],
    houses: [1, 5, 9],
    planets: ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'],
    requiredTools: [
      'get_birth_chart',
      'get_planetary_strength',
      'get_active_yogas',
      'retrieve_classical_rules',
    ],
    methodSteps: [
      'Ground all remedies strictly in classical shastras (Brihat Parashara Hora Shastra Ch. 84–97, Prasna Marga Ch. 23).',
      'Gemstone Therapy (Ratna Dharana) Principle: Recommend gems ONLY for functional benefics, Lagna lord, or Yogakarakas. NEVER prescribe gemstones for lords of 6th, 8th, 12th, Marakas (2/7), or Badhakas.',
      'Mantra Therapy: Prescribe authentic planetary Bija Mantras or Vedic Gayatri with precise count, auspicious day, and mental purity.',
      'Daana (Charity): Recommend specific dravyas (grains, metals, cloth) on the ruling planet’s day to propitiate afflicted planets without aggravating negative house rulerships.',
      'Vrata (Fasting) & Dhyana: Prescribe disciplined fasting on the planetary day to clear tamasic karma and purify the mind.',
    ],
    timingFocus: ['Current Dasha lord pacification', 'Afflicted transit mitigation', 'Lagna lord strengthening'],
  },
  {
    id: 'pb_transit',
    domain: 'transit',
    title: 'Gochara, Sade Sati & Planetary Ingresses',
    chartLayers: ['D1'],
    houses: [],
    planets: ['Jupiter', 'Saturn', 'Rahu', 'Ketu'],
    requiredTools: ['get_birth_chart', 'get_transits', 'scan_transits', 'find_ingresses'],
    methodSteps: [
      'Compute current or target-date gochara from Lagna and Moon.',
      'For Sade Sati: Saturn vs natal Moon (12th/1st/2nd from Janma Rashi).',
      'For future ingress questions: find_ingresses / house windows.',
    ],
    timingFocus: ['gochara', 'Sade Sati', 'ingresses'],
  },
  {
    id: 'pb_fame',
    domain: 'fame',
    title: 'Viral Fame, Digital Reach, Stardom & Media Controversy',
    chartLayers: ['D1', 'D10'],
    houses: [3, 10, 11, 1],
    planets: ['Rahu', 'Mercury', 'Venus', 'Sun', 'Mars'],
    requiredTools: [
      'get_birth_chart',
      'get_divisional_chart',
      'get_current_dasha',
      'scan_transits',
      'retrieve_classical_rules',
    ],
    methodSteps: [
      'Inspect 3rd house (digital media, short-form broadcasting, communications) and Rahu/Mercury/Venus placement.',
      'Inspect 10th house (public pinnacle, authority, mass recognition) and Upachaya strength (houses 3, 6, 10, 11).',
      'Evaluate Rahu Mahadasha / Antardasha activation as the cosmic catalyst for overnight virality.',
      'Audit Mars/6th lord aspects to Rahu for polarizing fame, trolling, and controversy-driven algorithm visibility (Khyati through Vivada).',
      'Check D10 Dashamsha for durability vs short-lived viral sensation.',
    ],
    timingFocus: ['Rahu dasha periods', '3rd/10th house transits', 'Jupiter aspect on Upachaya houses'],
  },
  {
    id: 'pb_betrayal',
    domain: 'betrayal',
    title: 'Financial Deception, Scams, Friend Treachery & Shadow Losses',
    chartLayers: ['D1', 'D9'],
    houses: [11, 8, 12, 2, 7],
    planets: ['Rahu', 'Ketu', 'Mercury', 'Jupiter', 'Mars'],
    requiredTools: [
      'get_birth_chart',
      'get_divisional_chart',
      'get_current_dasha',
      'scan_transits',
      'retrieve_classical_rules',
    ],
    methodSteps: [
      'Audit 11th house (social circles, trusted networks, gains) and 11th lord placement in 8th/12th Dusthanas.',
      'Inspect 2nd/8th wealth axis for Rahu-Ketu nodal afflictions and sudden liquidation vulnerabilities.',
      'Check for Guru Chandal Yoga (Jupiter + Rahu) causing financial gullibility and vulnerability to Ponzi/scam schemes.',
      'Examine 7th house (commercial partners) for Mars + Ketu conjunction indicating sudden contract betrayal and asset diversion.',
      'Prescribe protective shastric caution: independent contract verification and zero blind financial trust.',
    ],
    timingFocus: ['8th/12th lord dasha', 'Rahu/Ketu transit on 2nd/11th axis', 'Saturn transit over 11th lord'],
  },
  {
    id: 'pb_general',
    domain: 'general',
    title: 'General Chart Consultation & Life Synthesis',
    chartLayers: ['D1'],
    houses: [1],
    planets: [],
    requiredTools: ['get_birth_chart', 'get_current_dasha', 'get_transits'],
    methodSteps: [
      'Answer the specific question; do not dump a generic life reading.',
      'Pull only the layers needed (Dasha, yogas, strength) based on the ask.',
    ],
    timingFocus: ['current dasha', 'current transit'],
  },
];

export function detectPlaybookDomains(question: string): string[] {
  const lower = (question || '').toLowerCase();
  const hits: string[] = [];

  // Marriage, Relationships, Romance & Partnerships
  if (/\b(marry|marriage|wedding|spouse|wife|husband|divorce|remarriage|in-laws|bride|groom|vivaha)\b/.test(lower)) {
    hits.push('marriage');
  }
  if (/\b(relationship|romance|partner|dating|girlfriend|boyfriend|breakup|soulmate|attraction|love\s*life|in\s*love|love\s*marriage)\b/.test(lower) || (/\blove\b/.test(lower) && !/\b(ai|coding|tech|project|projects|hobby|hobbies|art|music|work|job|career|firm|company|engineering|firm)\b/.test(lower))) {
    hits.push('relationship');
  }

  // Career, Profession, Business & High-Tech Enterprise
  if (/\b(career|job|promotion|profession|work|business|office|boss|corporate|entrepreneur|startup|interview|employment|placement|vocation|ai|machine learning|data science|cybersecurity|cloud|fintech|blockchain|crypto)\b/.test(lower)) {
    hits.push('career');
  }

  // Wealth, Income, Investments, Shadow Wealth & Speculation
  if (/\b(money|wealth|income|finance|salary|gains?|rich|millionaire|billionaire|cash|investment|crypto|stocks?|trading|windfall|debt|loan|bankrupt|daridra|dhana|indu lagna|shadow wealth|speculation)\b/.test(lower)) {
    hits.push('finance');
  }

  // Viral Fame, Overnight Stardom, Digital Influencers & Media Controversy
  if (/\b(fame|famous|viral|virality|stardom|celebrity|influencer|youtube|instagram|tiktok|social media|followers|trolls?|controversy|scandal|media attention|overnight success|spotlight|public recognition)\b/.test(lower)) {
    hits.push('fame');
  }

  // Financial Deception, Cyber Scams, Friend Betrayal & Theft
  if (/\b(cheated|cheat|betray|betrayed|betrayal|fraud|scam|scammed|scams|deceive|deceived|deception|stolen|steal|embezzle|embezzlement|fake friend|backstab|lost money|scammed by)\b/.test(lower)) {
    hits.push('betrayal');
  }

  // Health, Medical Jyotish, Longevity, Modern Diseases & Mental Wellness
  if (/\b(health|illness|disease|vitality|hospital|sickness|surgery|operation|medical|doctor|cancer|tumor|autoimmune|lupus|rheumatoid|neurology|neurological|adhd|epilepsy|depression|mental health|anxiety|panic|burnout|pain|recovery|accident|longevity|ayus|maraka|tridosha|vata|pitta|kapha)\b/.test(lower)) {
    hits.push('health');
  }

  // Higher Education, Degree, Tech Disciplines & Academics
  if (/\b(education|study|studying|exam|college|university|degree|school|academic|btech|mbbs|phd|masters|engineering|branch|specialization|siddhamsha|d24|artificial intelligence|data science|biotech|genomics)\b/.test(lower)) {
    hits.push('education');
  }

  // Children, Progeny, Fertility & Santana
  if (/\b(children|child|kids|son|daughter|baby|babies|pregnant|pregnancy|conceiving|conception|fertility|childless|santan|santana|progeny|saptamsha|d7)\b/.test(lower)) {
    hits.push('progeny');
  }

  // Property, Real Estate, Land & Vehicles
  if (/\b(property|house|home|land|flat|apartment|real estate|plot|building|vehicle|car|conveyance|vahana|chaturthamsha|d4|shodasamsa|d16)\b/.test(lower)) {
    hits.push('property');
  }

  // Spirituality, Moksha, Meditation & Ishta Devata
  if (/\b(spirituality|spiritual|moksha|meditation|god|deity|ishta devata|ishtadevata|karma|past life|rebirth|kundalini|guru|enlightenment|temple|puja|sannyasa|renunciation|vimsamsa|d20|atmakaraka|karakamsha)\b/.test(lower)) {
    hits.push('spirituality');
  }

  // Litigation, Legal Battles, Disputes & Enemies
  if (/\b(court|legal|lawsuit|case|litigation|police|dispute|trial|enemy|opponent|competitor|rivals|shatru|conflict|victory|shatruhanta)\b/.test(lower)) {
    hits.push('litigation');
  }

  // Foreign Travel, Relocation, Visa & Overseas Settlement
  if (/\b(foreign|abroad|visa|immigration|travel|overseas|relocate|relocation|move abroad|green card|citizenship|settlement abroad|journey|flight)\b/.test(lower)) {
    hits.push('foreign');
  }

  // Family, Parents, Siblings & Ancestry
  if (/\b(family|father|mother|parents|brother|sister|sibling|siblings|lineage|ancestry|pitru|pitri|pitru dosha|dwadasamsa|d12|drekkhana|d3)\b/.test(lower)) {
    hits.push('family');
  }

  // Authentic Vedic Remedies, Gemstones, Mantras & Charity
  if (/\b(remedy|remedies|gemstone|stone|ring|mantra|japa|daana|charity|donation|fasting|vrata|pooja|havan|shanti|pacification|upaya)\b/.test(lower)) {
    hits.push('remedy');
  }

  // Transits, Gochara, Sade Sati & Ingresses
  if (/\b(transit|gochara|sade sati|sadesati|saturn return|jupiter return|ingress)\b/.test(lower)) {
    hits.push('transit');
  }

  if (hits.length === 0) hits.push('general');
  return Array.from(new Set(hits));
}

export function getPlaybooksForQuestion(question: string): DomainPlaybook[] {
  const domains = detectPlaybookDomains(question);
  return DOMAIN_PLAYBOOKS.filter((p) => domains.includes(p.domain));
}

export function getPlaybookByDomain(domain: string): DomainPlaybook | undefined {
  return DOMAIN_PLAYBOOKS.find((p) => p.domain === domain || p.id === domain);
}
