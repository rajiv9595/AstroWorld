/**
 * ASTROWORLD — Advanced Astrological Research Rules & Formulas Corpus
 * 
 * Formalized ingestion of verified classical rules, predictive formulas, and diagnostic mechanics
 * from the Astrological Research Corpus (Batches 1–2: Rules 1–175) & Deep Research Report.
 */

export type ResearchRuleCategory =
  | 'mathematical'
  | 'timing'
  | 'kp'
  | 'medical'
  | 'career_wealth'
  | 'prashna'
  | 'bhrigu_nadi'
  | 'combinations';

export interface ResearchRule {
  id: string;
  ruleNumber: number;
  category: ResearchRuleCategory;
  name: string;
  formula?: string;
  authority: string;
  classicalDictum: string;
  modernApplication: string;
  keywords: string[];
}

export const RESEARCH_RULES_CORPUS: ResearchRule[] = [
  // =========================================================================
  // I. MATHEMATICAL & STRUCTURAL FORMULAS (1–15)
  // =========================================================================
  {
    id: 'RULE_001_NAVAMSHA_D9',
    ruleNumber: 1,
    category: 'mathematical',
    name: 'Navamsha (D9) Harmonic Calculation',
    formula: 'Divide sign longitude by 3°20\' (200\'). Pada = floor(deg / 3.3333) + 1. Fiery signs count from Aries; Earthy from Capricorn; Airy from Libra; Watery from Cancer.',
    authority: 'Brihat Parashara Hora Shastra (Ch. 6)',
    classicalDictum: 'Navamsha reveals the subtle internal strength, soul dharma, and fruit-bearing capacity of the natal grahas.',
    modernApplication: 'Validates career sustainability, inner emotional resilience, and matrimonial compatibility beyond surface D1 appearances.',
    keywords: ['navamsha', 'd9', 'pada', 'varga', 'harmonic']
  },
  {
    id: 'RULE_002_DASHAMSHA_D10',
    ruleNumber: 2,
    category: 'mathematical',
    name: 'Dashamsha (D10) Professional Wheel',
    formula: 'Each division equals 3°. Odd signs count consecutively from sign itself; Even signs count consecutively from 9th sign from it.',
    authority: 'BPHS Ch. 6 (Dashamsha)',
    classicalDictum: 'Mahat-phalam (great achievements), royal status, and public livelihood are judged strictly through the Dashamsha.',
    modernApplication: 'Identifies executive leadership trajectory, institutional hierarchy, public fame, and corporate governance authority.',
    keywords: ['dashamsha', 'd10', 'career', 'profession', 'livelihood']
  },
  {
    id: 'RULE_003_SHASHTIAMSHA_D60',
    ruleNumber: 3,
    category: 'mathematical',
    name: 'Shashtiamsha (D60) Supreme Karmic Discriminator',
    formula: 'Each arc = 0°30\'. Multiply degree by 2, add 1. Count from current sign to determine Deva/Rakshasa/Yama deity dignity.',
    authority: 'BPHS Ch. 6, Sl. 41',
    classicalDictum: 'Sage Parashara states D60 overrides all other vargas in judging the final fruit of past-life karma (Prarabdha Karma).',
    modernApplication: 'Differentiates twin births separated by minutes and confirms whether planetary promises will bear pure or tainted fruits.',
    keywords: ['shashtiamsha', 'd60', 'karma', 'twins', 'deity']
  },
  {
    id: 'RULE_004_BHRIGU_BINDU',
    ruleNumber: 4,
    category: 'mathematical',
    name: 'Bhrigu Bindu (Destiny Seed Point)',
    formula: 'Bhrigu Bindu = (Moon Longitude + Rahu Longitude) / 2 (measured forward from Rahu to Moon).',
    authority: 'Bhrigu Nadi / C.S. Patel',
    classicalDictum: 'The exact midpoint between Rahu and Moon is the focal nexus where past-life karmic debts precipitate into this incarnation.',
    modernApplication: 'Transits of Jupiter, Saturn, or Rahu/Ketu across the Bhrigu Bindu trigger unalterable, fated life-altering events.',
    keywords: ['bhrigu bindu', 'midpoint', 'fated event', 'destiny point']
  },
  {
    id: 'RULE_005_YOGI_AVAYOGI_POINT',
    ruleNumber: 5,
    category: 'mathematical',
    name: 'Yogi & Avayogi Points of Fortune & Obstruction',
    formula: 'Yogi Point = Sun Longitude + Moon Longitude + 93°20\'. Yogi Nakshatra Lord brings wealth; Sahayogi sign lord supports; Avayogi Nakshatra Lord (Point + 186°40\') obstructs.',
    authority: 'Uttara Kalamrita / Vedic Tradition',
    classicalDictum: 'The Yogi planet bestows effortless prosperity and divine protection; the Avayogi planet creates hidden sabotage and financial leakage.',
    modernApplication: 'Critical for selecting business partners, timing wealth liquidity, and screening vendor or institutional contracts.',
    keywords: ['yogi', 'avayogi', 'sahayogi', 'point of fortune', 'prosperity']
  },
  {
    id: 'RULE_006_ARUDHA_LAGNA_AL',
    ruleNumber: 6,
    category: 'mathematical',
    name: 'Arudha Lagna (AL / Maya Peetha)',
    formula: 'Count signs from Lagna to Lagna Lord; count equal signs forward. Exception: If result falls in 1st or 7th, move 10 signs forward.',
    authority: 'Jaimini Upadesha Sutras Ch. 1',
    classicalDictum: 'Arudha Lagna represents the perceived reality, public reputation, social status, and worldly projection of the native.',
    modernApplication: 'Evaluates public brand, investor confidence, social media perception, and societal recognition regardless of inner state.',
    keywords: ['arudha lagna', 'al', 'jaimini', 'public image', 'reputation']
  },
  {
    id: 'RULE_007_UPAPADA_LAGNA_UL',
    ruleNumber: 7,
    category: 'mathematical',
    name: 'Upapada Lagna (UL / Matrimonial Arudha)',
    formula: 'Apply Arudha calculation to the 12th house and 12th lord from Lagna.',
    authority: 'Jaimini Upadesha Sutras Ch. 1.4',
    classicalDictum: 'Upapada Lagna determines the durability of marriage, spouse lineage, marital sacrifice, and domestic sustainability.',
    modernApplication: 'Predicts marital durability; benefics in 2nd from UL ensure long-lasting marriage, while malefics indicate legal separation.',
    keywords: ['upapada lagna', 'ul', 'marriage', 'spouse', 'matrimony']
  },
  {
    id: 'RULE_008_MRITYU_BHAGA',
    ruleNumber: 8,
    category: 'mathematical',
    name: 'Mrityu Bhaga (Fatal Vulnerability Degrees)',
    formula: 'Specific acute degrees per sign for each planet (e.g. Sun at 20° Aries, Moon at 26° Taurus, Saturn at 10° Pisces).',
    authority: 'Jataka Parijata & Saravali',
    classicalDictum: 'A planet sitting within 1° of its Mrityu Bhaga suffers loss of vitality, triggering acute crises or physical emergencies during its dasha.',
    modernApplication: 'Flags surgical vulnerabilities, corporate downfalls, and periods requiring intense preventative caution and remedial chanting.',
    keywords: ['mrityu bhaga', 'fatal degree', 'vulnerability', 'crisis']
  },
  {
    id: 'RULE_009_PUSHKARA_NAVAMSHA',
    ruleNumber: 9,
    category: 'mathematical',
    name: 'Pushkara Navamsha & Bhaga Regeneration',
    formula: 'Two specific 3°20\' zones in every sign owned by benefics (Jupiter, Venus, Mercury, Moon).',
    authority: 'Vidyamadhaviyam / Jataka Parijata',
    classicalDictum: 'Any planet in Pushkara Navamsha gains immense restorative, healing, and wealth-conferring power, neutralizing debilitation.',
    modernApplication: 'Explains unexpected bounce-backs after financial or health bankruptcy; marks planets capable of generating sovereign wealth.',
    keywords: ['pushkara', 'pushkara navamsha', 'regeneration', 'healing']
  },
  {
    id: 'RULE_010_VARGOTTAMA',
    ruleNumber: 10,
    category: 'mathematical',
    name: 'Vargottama Integrity Principle',
    formula: 'A planet occupying the exact same zodiac sign in both D1 (Rashi) and D9 (Navamsha).',
    authority: 'BPHS & Phaladeepika Ch. 3',
    classicalDictum: 'A Vargottama planet functions with strength equivalent to occupying its own sign (Swakshetra), bestowing unshakeable dignity.',
    modernApplication: 'Provides enduring psychological stability, executive credibility, and unwavering professional execution under stress.',
    keywords: ['vargottama', 'd1 d9 match', 'inner strength', 'swakshetra']
  },
  {
    id: 'RULE_011_SIXTY_FOURTH_NAVAMSHA',
    ruleNumber: 11,
    category: 'mathematical',
    name: '64th Navamsha (Khara Navamsha / Sudden Shift)',
    formula: 'The 4th Navamsha sign from the 8th house in D9 (210° from Moon or Lagna).',
    authority: 'Prasna Marga & Jataka Parijata',
    classicalDictum: 'Transits of natural malefics (Saturn, Mars, Rahu) across the 64th Navamsha lord or sign trigger sudden structural breakdown or health shocks.',
    modernApplication: 'Pinpoints precise timing for corporate reorganizations, sudden layoffs, health alerts, and estate probate triggers.',
    keywords: ['64th navamsha', 'khara', 'sudden event', 'transit shock']
  },
  {
    id: 'RULE_012_TWENTY_SECOND_DREKKANA',
    ruleNumber: 12,
    category: 'mathematical',
    name: '22nd Drekkana (Kharesh / Acute Trauma Axis)',
    formula: 'The 8th house lord of the D3 Drekkana chart.',
    authority: 'BPHS Ch. 6 & Saravali',
    classicalDictum: 'The 22nd Drekkana lord indicates bodily injury, surgical intervention, accidents, or acute infectious vulnerability.',
    modernApplication: 'Identifies preventative health windows, ergonomic/sports injury risks, and surgical timing protocols.',
    keywords: ['22nd drekkana', 'kharesh', 'd3', 'surgery', 'injury']
  },
  {
    id: 'RULE_013_BHAVA_CHALIT_MIDPOINT',
    ruleNumber: 13,
    category: 'mathematical',
    name: 'Bhava Chalit Cuspal Midpoint Dynamics',
    formula: 'Midpoint = (Cusp_n + Cusp_n+1) / 2. Shifted planets deliver Chalit house results while retaining Rashi lordship.',
    authority: 'Deepak Kapoor / BPHS Ch. 11',
    classicalDictum: 'A planet shifting houses in Chalit gives internal psychological impulse in Rashi, but external physical manifestation in the Chalit bhava.',
    modernApplication: 'Explains career or wealth outcomes that seemingly defy whole-sign charts (e.g. 11th house gains materializing via 12th house MNC exposure).',
    keywords: ['chalit', 'bhava chalit', 'midpoint', 'sandhi', 'house shift']
  },
  {
    id: 'RULE_014_SAV_DIFFERENTIAL',
    ruleNumber: 14,
    category: 'mathematical',
    name: 'Sarvashtakavarga (SAV) Wealth Retention Differential',
    formula: 'Compare Bindus: 11th House > 10th House (Gains > Effort) AND 11th House > 12th House (Gains > Expenditure).',
    authority: 'BPHS Ch. 66–72 (Ashtakavarga)',
    classicalDictum: 'When the 11th house holds more bindus than the 10th, rewards exceed labor. When 11th exceeds 12th, wealth crystallizes permanently.',
    modernApplication: 'Defines wealth accumulation velocity, financial runway, and savings retention index for startup founders and investors.',
    keywords: ['ashtakavarga', 'sav', 'bindus', 'wealth retention', 'gains vs expenditure']
  },
  {
    id: 'RULE_015_KAKSHYA_TRANSIT_MECHANICS',
    ruleNumber: 15,
    category: 'mathematical',
    name: 'Kakshya Transit Subdivision (Ashtakavarga Precision)',
    formula: 'Each sign (30°) is divided into 8 Kakshyas of 3°45\' ruled by: Saturn, Jupiter, Mars, Sun, Venus, Mercury, Moon, Lagna.',
    authority: 'Prasna Marga & Ashtakavarga Texts',
    classicalDictum: 'A transiting planet produces tangible benefic results in a Kakshya ONLY if that specific Kakshya lord contributed a Bindu (Prasthara).',
    modernApplication: 'Narrows multi-month planetary transits down to exact 3–5 day operational windows where contracts sign and wealth materializes.',
    keywords: ['kakshya', 'prasthara', 'micro-transit', 'bindu activation']
  },

  // =========================================================================
  // II. PREDICTIVE TIMING & TRANSIT MECHANICS (16–30)
  // =========================================================================
  {
    id: 'RULE_016_DOUBLE_TRANSIT',
    ruleNumber: 16,
    category: 'timing',
    name: 'Double Transit Law of Event Manifestation',
    formula: 'Jupiter and Saturn must simultaneously aspect or occupy a house or its lord in Gochara.',
    authority: 'Dr. K.N. Rao / BPHS Synthesis',
    classicalDictum: 'Saturn provides the karmic sanction (structure/time); Jupiter provides divine grace (fructification). Without both, no major milestone occurs.',
    modernApplication: 'Mandatory filter for predicting marriages, promotions, home purchases, and childbirth with clinical precision.',
    keywords: ['double transit', 'jupiter saturn', 'event window', 'kn rao']
  },
  {
    id: 'RULE_017_VIMSHOTTARI_ACTIVATION_TRIAD',
    ruleNumber: 17,
    category: 'timing',
    name: 'Vimshottari Dasha Activation Triad',
    formula: 'A Dasha lord manifests results via: (a) its Nakshatra Lord, (b) conjunct/aspecting planets, (c) its Sign Dispositor.',
    authority: 'BPHS Ch. 46 & Phaladeepika',
    classicalDictum: 'Planets act as conduits for their star lords; the dispositor grounds the material outcome into worldly reality.',
    modernApplication: 'Prevents shallow superficial readings; explains why a combust or functional malefic can bestow unexpected millions.',
    keywords: ['vimshottari', 'nakshatra lord', 'dispositor', 'dasha activation']
  },
  {
    id: 'RULE_018_DASHA_CHHIDRA',
    ruleNumber: 18,
    category: 'timing',
    name: 'Dasha Chhidra (Terminal Transition Vulnerability)',
    formula: 'The final Antardasha of any Mahadasha (e.g. Moon-Sun, Mars-Moon, Rahu-Mars).',
    authority: 'Saravali & Jataka Parijata',
    classicalDictum: 'During Dasha Chhidra, old karmic structures dissolve, emotional fatigue peaks, and life rearranges itself for the incoming dasha ruler.',
    modernApplication: 'Directs clients to avoid irreversible speculative commitments, massive debt, or hostile career exits during transition quarters.',
    keywords: ['dasha chhidra', 'terminal dasha', 'transition', 'dissolution']
  },
  {
    id: 'RULE_019_SELF_ANTARDASHA_PARADOX',
    ruleNumber: 19,
    category: 'timing',
    name: 'Mahadasha–Self Antardasha Paradox',
    formula: 'During MD-MD (e.g. Saturn-Saturn, Rahu-Rahu), results reflect the 4th house from the lord or its Nakshatra lord rather than self.',
    authority: 'Bhavartha Ratnakara',
    classicalDictum: 'The start of a major dasha requires acclimatization; the native feels internal restructuring before outward manifestation begins.',
    modernApplication: 'Manages user expectations when an exalted Yogakaraka dasha begins quietly without immediate fireworks in year one.',
    keywords: ['self antardasha', 'md ad paradox', 'acclimatization']
  },
  {
    id: 'RULE_020_NADI_JUPITER_TWELVE_YEAR_CYCLE',
    ruleNumber: 20,
    category: 'timing',
    name: 'Jupiter 12-Year Nadi Progression Cycle',
    formula: 'Jupiter returns every 12 years (Ages 12, 24, 36, 48, 60, 72). Progressed Jupiter advances 1 sign per year.',
    authority: 'Bhrigu Nadi Principles',
    classicalDictum: 'Every 12th year of life marks a fresh expansion of Jeeva (life force), intellectual rebirth, and divine blessing in trinal houses.',
    modernApplication: 'Tracks age-based milestones: Age 24 first career foundation, Age 36 executive stability, Age 48 peak institutional authority.',
    keywords: ['nadi progression', 'jupiter 12 year', 'jeeva', 'milestones']
  },
  {
    id: 'RULE_021_SATURN_THIRTY_YEAR_NADI_CYCLE',
    ruleNumber: 21,
    category: 'timing',
    name: 'Saturn 30-Year Nadi Progression of Karma',
    formula: 'Saturn advances 2.5 years per sign from natal Saturn position.',
    authority: 'Bhrigu Nadi & Classical Jyotish',
    classicalDictum: 'The house reached by progressed Saturn experiences intense reality-testing, heavy responsibility, and karmic consolidation.',
    modernApplication: 'Explains career restructuring, debt payoffs, and structural foundations across 2.5-year operational epochs.',
    keywords: ['saturn 30 year', 'progressed saturn', 'karmic cycle', 'nadi timing']
  },
  {
    id: 'RULE_022_CHARA_DASHA_MARRIAGE_TIMING',
    ruleNumber: 22,
    category: 'timing',
    name: 'Jaimini Chara Dasha Relational Timing',
    formula: 'Marriage manifests during Chara Dasha of signs aspecting or containing Darakaraka (DK), Upapada Lagna (UL), or 7th from UL.',
    authority: 'Jaimini Upadesha Sutras',
    classicalDictum: 'Jaimini sign-based dasha confirms physical matrimonial manifestation independently of Vimshottari planetary periods.',
    modernApplication: 'Provides secondary confirmation cross-check for marriage windows, eliminating false-positive dasha flags.',
    keywords: ['chara dasha', 'jaimini', 'darakaraka', 'upapada lagna', 'marriage timing']
  },
  {
    id: 'RULE_024_NODAL_RETURN_CYCLE',
    ruleNumber: 24,
    category: 'timing',
    name: 'Rahu-Ketu 18.6-Year Nodal Return Cycle',
    formula: 'Nodal Returns occur at Ages 18.6, 37.2, 55.8; Reversed Nodal Returns occur at Ages 9.3, 27.9, 46.5, 65.1.',
    authority: 'Classical Predictive Principles',
    classicalDictum: 'Nodal returns force an irreversible reorientation of life purpose; reverse returns shatter existing comfort zones.',
    modernApplication: 'Ages 27–28 and 37–38 represent the most frequent ages for radical career pivots, divorce, or entrepreneurial breakthroughs.',
    keywords: ['nodal return', 'rahu ketu', '18 year cycle', 'karmic pivot']
  },
  {
    id: 'RULE_027_RETROGRADE_VAKRI_RULE',
    ruleNumber: 27,
    category: 'timing',
    name: 'Retrograde (Vakri) Dual-Signification Law',
    formula: 'A retrograde planet delivers results of its occupied sign plus 50% strength of the preceding house (12th from itself).',
    authority: 'Saravali & Bhavartha Ratnakara',
    classicalDictum: 'Retrograde grahas possess high Chesta Bala (motional strength); their fruits arrive via non-linear, delayed, or repetitive cycles.',
    modernApplication: 'Warns against hasty conclusions in contracts; indicates multiple attempts before permanent breakthrough manifests.',
    keywords: ['retrograde', 'vakri', 'chesta bala', 'delayed results']
  },
  {
    id: 'RULE_029_BADHAKA_OBSTRUCTION_MATRIX',
    ruleNumber: 29,
    category: 'timing',
    name: 'Badhaka Obstruction & Remedial Axis',
    formula: 'Movable Lagnas: 11th House is Badhaka; Fixed Lagnas: 9th House; Dual Lagnas: 7th House.',
    authority: 'Prasna Marga Ch. 15 & BPHS',
    classicalDictum: 'The Badhakesh (lord of badhaka) causes invisible, stubborn impediments that cannot be solved by brute force alone.',
    modernApplication: 'Prescribes physical relocation, software architecture paradigm shifts, or specialized spiritual propitiations to dissolve deadlock.',
    keywords: ['badhaka', 'badhakesh', 'obstruction', 'invisible hurdles']
  },

  // =========================================================================
  // III. KRISHNAMURTI PADDHATI (KP) CUSPAL INTERLINKS (31–45)
  // =========================================================================
  {
    id: 'RULE_031_KP_CORE_SUB_LORD',
    ruleNumber: 31,
    category: 'kp',
    name: 'Core Krishnamurti Paddhati (KP) Axiom',
    formula: 'Planet indicates Matter/Source; Nakshatra Lord signifies Houses Manifested; Cuspal Sub-Lord Decides Fruit (Yes/No).',
    authority: 'Prof. K.S. Krishnamurti (KP Readers Vol. I–VI)',
    classicalDictum: 'A planet cannot yield results outside the houses signified by its star lord; its sub-lord determines whether that fruit is nectar or poison.',
    modernApplication: 'Eliminates guesswork in decision-making; delivers binary affirmative/negative verdicts with 80%+ statistical reliability.',
    keywords: ['kp', 'krishnamurti paddhati', 'sub-lord', 'star lord', 'cuspal interlinks']
  },
  {
    id: 'RULE_032_KP_MARRIAGE_FORMULA',
    ruleNumber: 32,
    category: 'kp',
    name: 'KP Marriage Promise & Timing Formula',
    formula: '7th Cuspal Sub-Lord must signify Houses 2, 7, or 11. Separation threatened if connected to 1, 6, 10.',
    authority: 'KP Reader Vol. III',
    classicalDictum: 'House 7 = Partnership; House 2 = Family Expansion; House 11 = Joyful Union. Houses 1, 6, 10 are 12th to each, causing denial.',
    modernApplication: 'Gold standard for assessing whether marriage is promised, delayed, or vulnerable to divorce.',
    keywords: ['kp marriage', '7th csl', 'houses 2 7 11', 'marital promise']
  },
  {
    id: 'RULE_035_KP_JOB_EMPLOYMENT_FORMULA',
    ruleNumber: 35,
    category: 'kp',
    name: 'KP Career Entry & Promotion Formula',
    formula: '6th or 10th Cuspal Sub-Lord signifies Houses 2, 6, 10, 11 during operating Dasha-Bhukti-Antara.',
    authority: 'KP Reader Vol. IV',
    classicalDictum: 'House 6 = Salaried service & competitive clearance; House 10 = Public status; House 2 = Liquid income; House 11 = Promotion.',
    modernApplication: 'Predicts exact contract signing months and salary appraisal cycles with clinical precision.',
    keywords: ['kp career', '6th csl', '10th csl', 'job placement', 'promotion']
  },
  {
    id: 'RULE_036_KP_FOREIGN_TRAVEL_FORMULA',
    ruleNumber: 36,
    category: 'kp',
    name: 'KP Long-Distance Foreign Settlement Formula',
    formula: '12th Cuspal Sub-Lord signifies Houses 3 (departure), 9 (long journey), 12 (foreign land).',
    authority: 'KP Reader Vol. IV',
    classicalDictum: 'When the 12th sub-lord connects to 3, 9, 12 in movable or watery signs, foreign residence is irrevocable.',
    modernApplication: 'Used for student visa approvals, H1B/PR status confirmation, and overseas multinational relocations.',
    keywords: ['kp foreign', '12th csl', 'visa', 'overseas settlement']
  },
  {
    id: 'RULE_037_KP_LITIGATION_VICTORY',
    ruleNumber: 37,
    category: 'kp',
    name: 'KP Legal Dispute & Competitor Defeat Formula',
    formula: '6th or 11th Cuspal Sub-Lord signifies Houses 6 and 11 without House 12.',
    authority: 'KP Reader Vol. V',
    classicalDictum: '6th house defeats rivals; 11th house secures the verdict. Connection to 12th causes heavy financial loss to attorneys.',
    modernApplication: 'Advises corporate boards on whether to settle litigation out of court or proceed to final judicial verdict.',
    keywords: ['kp litigation', 'court case', 'dispute victory', '6th 11th csl']
  },
  {
    id: 'RULE_038_KP_PROPERTY_PURCHASE',
    ruleNumber: 38,
    category: 'kp',
    name: 'KP Real Estate & Immovable Property Formula',
    formula: '4th Cuspal Sub-Lord signifies Houses 4 (property), 11 (gain), and 12 (capital investment outflow).',
    authority: 'KP Reader Vol. IV',
    classicalDictum: 'House 4 represents the immovable structure; House 12 represents parting with liquid capital to acquire enduring brick-and-mortar.',
    modernApplication: 'Times deed registration, mortgage approvals, and protects against title deed fraud.',
    keywords: ['kp property', '4th csl', 'real estate', 'home purchase']
  },

  // =========================================================================
  // IV. MEDICAL ASTROLOGY & HEALTH DIAGNOSTICS (46–65)
  // =========================================================================
  {
    id: 'RULE_046_DISEASE_GENESIS_TRIAD',
    ruleNumber: 46,
    category: 'medical',
    name: 'Classical Disease Genesis Triad (6-8-12 Axis)',
    formula: '6th House = Acute/Functional Disease; 8th House = Chronic/Incurable/Surgical; 12th House = Confinement/Hospitalization.',
    authority: 'BPHS Ch. 18, 20 & Phaladeepika Ch. 15',
    classicalDictum: 'The 6th indicates curable pathology; the 8th indicates deep karmic destruction; the 12th removes the physical vessel from the world.',
    modernApplication: 'Guides clinical diagnostics between outpatient pharmaceutical treatment (6th) vs. invasive surgery/ICU care (8th/12th).',
    keywords: ['medical astrology', '6 8 12 axis', 'dusthana', 'pathology']
  },
  {
    id: 'RULE_048_TRIDOSHA_PLANETARY_MAPPING',
    ruleNumber: 48,
    category: 'medical',
    name: 'Ayurvedic Tridosha Planetary Mapping',
    formula: 'Vata (Wind/Nerves) = Saturn, Rahu, Mercury; Pitta (Fire/Metabolism) = Sun, Mars, Ketu; Kapha (Fluid/Mass) = Moon, Venus, Jupiter.',
    authority: 'Charaka Samhita & Brihat Jataka Ch. 2',
    classicalDictum: 'Planetary afflictions disturb the corresponding Dosha, triggering physiological imbalances prior to visible symptom onset.',
    modernApplication: 'Provides dietary and lifestyle interventions (e.g. pacifying Vata via grounding foods during Saturn-Rahu periods).',
    keywords: ['tridosha', 'ayurveda', 'vata', 'pitta', 'kapha', 'medical diagnostics']
  },
  {
    id: 'RULE_049_CARDIAC_DISEASE_SIGNATURE',
    ruleNumber: 49,
    category: 'medical',
    name: 'Cardiac & Vascular Disease Formula',
    formula: 'Simultaneous affliction of Sun (natural heart karaka), 4th/5th house, and Leo sign by Saturn/Rahu (blockage) or Mars/Ketu (infarction).',
    authority: 'Dr. B.V. Raman / Medical Astrology Texts',
    classicalDictum: 'When the Sun and the house of the chest/heart are hemmed by malefics in fixed signs, arterial distress and ischemia occur.',
    modernApplication: 'Prescribes preventive cardiological screening, stress-reduction regimens, and lipid management protocols.',
    keywords: ['cardiac', 'heart disease', 'sun', 'leo', 'vascular']
  },
  {
    id: 'RULE_050_DIABETES_PANCREATIC_FORMULA',
    ruleNumber: 50,
    category: 'medical',
    name: 'Diabetes Mellitus & Metabolic Syndrome Formula',
    formula: 'Affliction of Venus (insulin/pancreas) and Jupiter (liver/glycogen) in watery signs or across the 6th/8th axis.',
    authority: 'Medical Jyotish Shastra',
    classicalDictum: 'Venus governs refined juices and sugar; Jupiter governs sweet flesh and assimilation. Malefic nodes afflicting both trigger sweet urine.',
    modernApplication: 'Monitors HbA1c levels, endocrine disruptions, insulin resistance, and dietary sugar intake.',
    keywords: ['diabetes', 'venus jupiter', 'pancreas', 'insulin', 'metabolic syndrome']
  },
  {
    id: 'RULE_051_ONCOLOGY_MALIGNANCY_SIGNATURE',
    ruleNumber: 51,
    category: 'medical',
    name: 'Oncology & Malignant Cellular Proliferation',
    formula: 'Rahu (uncontrolled growth) afflicting 6th/8th lord, Lagna, or Moon, combined with afflicted Jupiter (cellular expansion).',
    authority: 'Modern Research / Classical Malefic Synthesis',
    classicalDictum: 'Rahu is the master of toxic expansion and atypical mutations; combined with dusthana lords, cells lose their dharmic boundary.',
    modernApplication: 'Flags need for oncology screening, tumor marker testing, and detox protocols when dasha triggers node-dusthana links.',
    keywords: ['cancer', 'oncology', 'rahu', 'malignancy', 'cellular growth']
  },
  {
    id: 'RULE_052_AUTOIMMUNE_MYSTERY_ILLNESS',
    ruleNumber: 52,
    category: 'medical',
    name: 'Autoimmune & Unexplained Pathology (Ketu Axis)',
    formula: 'Ketu in 6th or 8th house aspected by Saturn or Moon without benefic Jupiter rescue.',
    authority: 'Nadi Medical Sutras',
    classicalDictum: 'Ketu represents microscopic, hidden, or self-sabotaging energies; in dusthanas it turns the immune defense against the self.',
    modernApplication: 'Identifies fibromyalgia, lupus, Hashimoto’s, chronic Lyme, and post-viral neurological syndromes that evade initial labs.',
    keywords: ['autoimmune', 'ketu', 'mystery illness', 'psychosomatic']
  },
  {
    id: 'RULE_053_DEPRESSION_CLINICAL_ANXIETY',
    ruleNumber: 53,
    category: 'medical',
    name: 'Clinical Depression & Neuro-Anxiety Signature',
    formula: 'Moon trapped in Papakartari Yoga (hemmed between malefics), conjunct Saturn/Rahu in 4th/8th/12th, with weak Mercury.',
    authority: 'Phaladeepika Ch. 6 (Kemadruma & Arishta)',
    classicalDictum: 'When the Moon (Manas / mind) is deprived of light and encircled by cruel grahas, melancholy and dark thoughts consume the soul.',
    modernApplication: 'Recommends psychiatric care, cognitive therapy, routine grounding, and avoiding prolonged isolation.',
    keywords: ['depression', 'anxiety', 'moon affliction', 'papakartari', 'mental health']
  },
  {
    id: 'RULE_054_SURGICAL_INTERVENTION_FORMULA',
    ruleNumber: 54,
    category: 'medical',
    name: 'Surgical Intervention & Incision Timing',
    formula: 'Mars (scalpel/blood) and Ketu (incision/laser) influencing 8th house or 6th Cuspal Sub-Lord during joint dasha/transit.',
    authority: 'KP Medical & BPHS',
    classicalDictum: 'Ketu cuts and separates; Mars pierces and sheds blood. In the 8th house of surgery, invasive procedures materialize.',
    modernApplication: 'Identifies safe electional muhurtas for elective surgery and warns against emergency surgical triggers.',
    keywords: ['surgery', 'mars ketu', 'scalpel', 'incision', '8th house']
  },

  // =========================================================================
  // V. CAREER, WEALTH & FINANCIAL ASTROLOGY (66–85)
  // =========================================================================
  {
    id: 'RULE_066_MAHADHAN_YOGA',
    ruleNumber: 66,
    category: 'career_wealth',
    name: 'Mahadhan Yoga (Supreme Wealth Matrix)',
    formula: 'Mutual Parivartana, conjunction, or strong trinal link between 2nd Lord (Capital), 11th Lord (Gains), 5th Lord (Speculation), and 9th Lord (Fortune).',
    authority: 'BPHS Ch. 41 & Bhavartha Ratnakara',
    classicalDictum: 'When Lakshmi houses (5, 9) combine with Dhana-Labha houses (2, 11), the native commands inexhaustible sovereign wealth.',
    modernApplication: 'Creates venture capital windfalls, IPO wealth events, and multi-generational family office reserves.',
    keywords: ['mahadhan yoga', 'wealth', 'parivartana', 'lakshmi sthana', 'dhana']
  },
  {
    id: 'RULE_067_INDU_LAGNA_WEALTH_FORMULA',
    ruleNumber: 67,
    category: 'career_wealth',
    name: 'Indu Lagna (Moon Wealth Ascendant of Billions)',
    formula: 'Add Kalas of 9th lord from Lagna + 9th lord from Moon (Sun 30, Moon 16, Mars 6, Merc 8, Jup 10, Ven 12, Sat 1). Mod 12, count from Moon. Benefics here grant billions.',
    authority: 'Brihat Jataka & Jataka Parijata Ch. 7',
    classicalDictum: 'Even in an otherwise modest chart, a solitary benefic in Indu Lagna transforms the native into a master of gold and treasury.',
    modernApplication: 'Key indicator of extreme liquid net worth, unicorn valuation ownership, and high-frequency asset compounding.',
    keywords: ['indu lagna', 'kalas', 'billionaire', 'wealth ascendant', 'brihat jataka']
  },
  {
    id: 'RULE_071_SOFTWARE_AI_DATA_CAREER',
    ruleNumber: 71,
    category: 'career_wealth',
    name: 'Software, AI & Data Intelligence Career Formula',
    formula: 'Conjunction or trinal link in D1 & D10 between Mercury (logic/code), Rahu (virtual systems/AI/cloud), and Ketu (micro-algorithms/binary).',
    authority: 'Modern Astrological Research Synthesis',
    classicalDictum: 'Mercury writes the mathematical script; Rahu scales into the infinite cloud matrix; Ketu debugs the binary silicon.',
    modernApplication: 'Identifies software engineers, machine learning scientists, cloud architects, and quantitative high-frequency traders.',
    keywords: ['software career', 'ai', 'data science', 'mercury rahu ketu', 'd10']
  },
  {
    id: 'RULE_076_VIPAREETA_RAJA_YOGA',
    ruleNumber: 76,
    category: 'career_wealth',
    name: 'Vipareeta Raja Yoga (Triumph Through Crisis)',
    formula: 'Lords of 6th, 8th, or 12th houses situated exclusively in other dusthanas (6, 8, 12) free from any Kendra/Trikona connection.',
    authority: 'Phaladeepika Ch. 6, Sl. 63–69 & Uttara Kalamrita',
    classicalDictum: 'Harsha, Sarala, and Vimala Yogas: When poison cancels poison, competitor ruin or industry collapse elevates the native to sovereignty.',
    modernApplication: 'Explains contrarian market gains, buying distressed assets at bottom, and succeeding when rivals face bankruptcy.',
    keywords: ['vipareeta raja yoga', 'dusthana', 'crisis elevation', 'sarala', 'vimala']
  },
  {
    id: 'RULE_077_NEECHA_BHANGA_RAJA_YOGA',
    ruleNumber: 77,
    category: 'career_wealth',
    name: 'Neecha Bhanga Raja Yoga (Humiliation to Mastery)',
    formula: 'Debilitated planet whose sign dispositor or exaltation ruler sits in a Kendra from Lagna or Moon.',
    authority: 'Phaladeepika Ch. 6 & BPHS',
    classicalDictum: 'The planet starts in weakness, experiencing initial rejection; but its cancellation ruler lifts it to emperor status in late maturity.',
    modernApplication: 'Hallmark of self-made founders who overcome early academic or career failure to build dominant global enterprises.',
    keywords: ['neecha bhanga', 'cancellation of debilitation', 'raja yoga', 'late mastery']
  },
  {
    id: 'RULE_078_JAIMINI_AMATYAKARAKA_CAREER',
    ruleNumber: 78,
    category: 'career_wealth',
    name: 'Jaimini Amatyakaraka (AmK) Vocational Vector',
    formula: 'The planet holding the second-highest longitude in the chart is AmK; its D1, D9, and D10 placements determine executive role.',
    authority: 'Jaimini Upadesha Sutras',
    classicalDictum: 'AmK represents the chief counselor, minister of state, and prime engine of professional execution.',
    modernApplication: 'Identifies executive advisory roles, functional leadership track, and alignment with corporate C-suite hierarchy.',
    keywords: ['amatyakaraka', 'amk', 'jaimini', 'career vector', 'executive']
  },
  {
    id: 'RULE_082_BHRIGU_NADI_SATURN_VENUS_WEALTH',
    ruleNumber: 82,
    category: 'career_wealth',
    name: 'Bhrigu Nadi Saturn + Venus Wealth Confluence',
    formula: 'Saturn (Karma Karaka) conjunct, trine (1, 5, 9), or mutually aspecting Venus (Lakshmi Karaka).',
    authority: 'Bhrigu Nadi Sutras',
    classicalDictum: 'When the Lord of Labor connects with the Goddess of Abundance, every drop of sweat converts directly into tangible wealth.',
    modernApplication: 'Guarantees commercial profitability, lucrative corporate compensation packages, and luxury real estate ownership.',
    keywords: ['saturn venus', 'bhrigu nadi', 'kamdhenu', 'wealth accumulation']
  },
  {
    id: 'RULE_083_BHRIGU_NADI_SATURN_KETU_OBSTACLE',
    ruleNumber: 83,
    category: 'career_wealth',
    name: 'Bhrigu Nadi Saturn + Ketu Career Reinvention',
    formula: 'Saturn conjunct or directly followed by Ketu in the same directional trine.',
    authority: 'Bhrigu Nadi Sutras',
    classicalDictum: 'Ketu acts as the cosmic guillotine to corporate ego; the native suffers disillusionment in structured jobs, forcing freelance autonomy.',
    modernApplication: 'Advises against climbing traditional corporate ladders; directs native into independent specialized consulting, research, or tech advisory.',
    keywords: ['saturn ketu', 'career detachment', 'reinvention', 'freelance']
  },

  // =========================================================================
  // VI. PRASHNA (HORARY) ASTROLOGY RULES (86–100)
  // =========================================================================
  {
    id: 'RULE_086_TAJIKA_ITHASALA_YOGA',
    ruleNumber: 86,
    category: 'prashna',
    name: 'Tajika / Prashna Ithasala Yoga (Applying Aspect)',
    formula: 'Faster-moving planet at lower degree approaches slower-moving planet within mutual Deeptamsha orbs.',
    authority: 'Tajika Neelakanthi & Prashna Shastra',
    classicalDictum: 'When the Lagna lord and Karyesh form Ithasala, the desired objective manifests smoothly and successfully.',
    modernApplication: 'Yields immediate definitive affirmative answers for live horary queries regarding deals, contracts, and lost objects.',
    keywords: ['ithasala', 'tajika', 'applying aspect', 'prashna', 'horary']
  },
  {
    id: 'RULE_087_TAJIKA_EASARPHA_YOGA',
    ruleNumber: 87,
    category: 'prashna',
    name: 'Tajika Easarpha Yoga (Separating / Missed Window)',
    formula: 'Faster planet has already passed the degree of slower planet by > 1° within the aspect orb.',
    authority: 'Tajika Neelakanthi',
    classicalDictum: 'Easarpha indicates the opportunity has departed; efforts to revive the expired agreement meet exhaustion.',
    modernApplication: 'Warns against chasing lost deals or expired offers; counsels moving forward to fresh initiatives.',
    keywords: ['easarpha', 'separating aspect', 'missed opportunity', 'prashna']
  },
  {
    id: 'RULE_090_KAMBOOLA_YOGA',
    ruleNumber: 90,
    category: 'prashna',
    name: 'Kamboola Yoga (Lunar Confirmation of Success)',
    formula: 'Lagna Lord and Karyesh form Ithasala, AND Moon joins either planet in applying Ithasala.',
    authority: 'Tajika Neelakanthi',
    classicalDictum: 'Kamboola is classified into Shreshtha, Madhyama, and Adhama; strong Kamboola guarantees glorious, rapid fulfillment.',
    modernApplication: 'Signifies an unqualified home-run outcome in business transactions, funding rounds, and legal arbitrations.',
    keywords: ['kamboola', 'prashna', 'lunar confirmation', 'shreshtha']
  },
  {
    id: 'RULE_091_LOST_ARTICLE_RECOVERY',
    ruleNumber: 91,
    category: 'prashna',
    name: 'Nashta Vastu Prashna (Lost Property Recovery)',
    formula: 'Benefics in 1st/2nd house or 7th lord in Lagna = Found inside premises. 8th lord in Lagna or 7th in 8th/12th = Permanently stolen.',
    authority: 'Prasna Marga & Shatpanchashika',
    classicalDictum: 'The directional placement of the 7th cusp indicates where the object rests and whether an insider or stranger took it.',
    modernApplication: 'Pinpoints physical coordinates and recovery likelihood for lost legal documents, hardware, or valuables.',
    keywords: ['lost article', 'nashta vastu', 'prashna', 'recovery']
  },

  // =========================================================================
  // VII. BHRIGU NADI DIRECTIONAL TRINES & MECHANICS (101–125)
  // =========================================================================
  {
    id: 'RULE_101_BHRIGU_NADI_DIRECTIONAL_TRINES',
    ruleNumber: 101,
    category: 'bhrigu_nadi',
    name: 'Bhrigu Nadi Directional Trines (Dik-Trikona Conjunction)',
    formula: 'East (Fire): 1, 5, 9; South (Earth): 2, 6, 10; West (Air): 3, 7, 11; North (Water): 4, 8, 12. Planets in same trine act as 100% conjunct.',
    authority: 'Bhrigu Nadi Classical Sutras',
    classicalDictum: 'Signs belonging to the same element fuse their planetary energies into a unified composite stream across the chart.',
    modernApplication: 'Eliminates whole-sign blindness; explains profound talent or affliction arising between grahas in separate signs.',
    keywords: ['bhrigu nadi', 'directional trines', 'dik-trikona', '1 5 9 fusion']
  },
  {
    id: 'RULE_102_NADI_INFLUENCE_HIERARCHY',
    ruleNumber: 102,
    category: 'bhrigu_nadi',
    name: 'Nadi Angular Influence Hierarchy (100% / 75% / 50%)',
    formula: '1st, 5th, 9th = 100% direct fusion; 7th = 75% support/opposition; 2nd = 50% next-step modifier; 12th = 50% past foundation.',
    authority: 'Bhrigu Nadi Core Axioms',
    classicalDictum: 'The 2nd house planet modifies the immediate forward path; the 12th house planet feeds secret support or background expenditure.',
    modernApplication: 'Calculates exact weighted multi-vector planetary influences on career (Saturn) and life path (Jupiter).',
    keywords: ['influence hierarchy', 'nadi aspects', 'trines', 'gatekeeper', 'secret support']
  },
  {
    id: 'RULE_103_DEGREE_ORDERING_PURVA_PASHCHIMA',
    ruleNumber: 103,
    category: 'bhrigu_nadi',
    name: 'Purva-Pashchima Intra-Sign Degree Ordering',
    formula: 'Sort planets in a directional trine by degree (0° to 30°). Lower degree planet moves toward higher degree planet.',
    authority: 'Bhrigu Nadi Sequential Sutras',
    classicalDictum: 'A planet at 8° is moving toward a planet at 15°; it has already crossed a planet at 4° in past karmic iterations.',
    modernApplication: 'Differentiates whether a life experience occurs early vs. late; maps the exact sequence of vocational transitions.',
    keywords: ['degree ordering', 'purva pashchima', 'approaching', 'separating', 'nadi sequence']
  },
  {
    id: 'RULE_108_JEEVA_DEHA_KARAKAS',
    ruleNumber: 108,
    category: 'bhrigu_nadi',
    name: 'Nadi Jeeva & Deha Karaka System',
    formula: 'Male Chart: Jupiter = Jeeva (Self), Venus = Spouse; Female Chart: Venus = Jeeva (Self), Mars = Husband.',
    authority: 'Bhrigu Nadi Gender Foundations',
    classicalDictum: 'In Nadi, planetary karakas replace houses as primary life significators: Sun = Father, Moon = Mother, Saturn = Karma.',
    modernApplication: 'Allows instant diagnostic readings across relationship dynamics without requiring uncertain birth minutes.',
    keywords: ['jeeva karaka', 'deha karaka', 'bhrigu nadi gender', 'jupiter venus mars']
  },
  {
    id: 'RULE_114_KARTARI_HEMMING_OF_KARAKAS',
    ruleNumber: 114,
    category: 'bhrigu_nadi',
    name: 'Hemming (Kartari) of Karakas in Nadi',
    formula: 'If Saturn has Mars in 12th and Ketu in 2nd, profession is suffocated. If Jupiter is between Venus and Mercury, life enjoys permanent grace.',
    authority: 'Bhrigu Nadi Kartari Sutras',
    classicalDictum: 'Planets flanking a karaka in the 12th and 2nd houses dictate whether that domain moves with freedom or under entrapment.',
    modernApplication: 'Diagnoses workplace entrapment, burnout, or unassailable financial insulation.',
    keywords: ['kartari', 'hemming', 'bhrigu nadi', 'career entrapment', 'papakartari']
  },

  // =========================================================================
  // VIII. BHRIGU NADI COMBINATIONS & TRIADS (126–175)
  // =========================================================================
  {
    id: 'RULE_126_SUN_MERCURY_BUDHADITYA',
    ruleNumber: 126,
    category: 'combinations',
    name: 'Sun + Mercury (Budhaditya in Nadi)',
    formula: 'Sun conjunct or trine Mercury. Mercury at higher degree than Sun surpasses father\'s intellectual standing.',
    authority: 'Bhrigu Nadi Sutras',
    classicalDictum: 'Sharp analytical intelligence, accounting prowess, administrative skill, and respected family lineage.',
    modernApplication: 'Indicates high proficiency in data science, administrative consulting, corporate finance, and governance.',
    keywords: ['sun mercury', 'budhaditya', 'analytics', 'father lineage']
  },
  {
    id: 'RULE_130_SUN_SATURN_KARMIC_FRICTION',
    ruleNumber: 130,
    category: 'combinations',
    name: 'Sun + Saturn (Karmic Friction & Late Authority)',
    formula: 'Sun conjunct, opposite (1/7), or trine Saturn.',
    authority: 'Bhrigu Nadi & Classical Texts',
    classicalDictum: 'Deep friction with paternal figures and early authority; grants unshakeable resilience and mastery in law/civil authority after 36.',
    modernApplication: 'Guides clients dealing with bureaucratic bottlenecks or challenging managers toward patience and institutional leverage.',
    keywords: ['sun saturn', 'karmic friction', 'father friction', 'delayed authority']
  },
  {
    id: 'RULE_135_MOON_JUPITER_GAJAKESARI',
    ruleNumber: 135,
    category: 'combinations',
    name: 'Moon + Jupiter (Gajakesari in Nadi)',
    formula: 'Moon conjunct or trine Jupiter.',
    authority: 'Bhrigu Nadi Sutras',
    classicalDictum: 'Pure reputation, emotional wisdom, virtuous mother, and steady accumulation of liquid wealth across multiple geographies.',
    modernApplication: 'Confers durable customer trust, executive mentorship capacity, and emotional poise during market distress.',
    keywords: ['moon jupiter', 'gajakesari', 'reputation', 'emotional wisdom']
  },
  {
    id: 'RULE_142_MARS_VENUS_PASSION_WEALTH',
    ruleNumber: 142,
    category: 'combinations',
    name: 'Mars + Venus (Passion & High-Yield Assets)',
    formula: 'Mars conjunct or trine Venus in same directional trine.',
    authority: 'Bhrigu Nadi Sutras',
    classicalDictum: 'Magnetic attraction, fast luxury vehicles, prime real estate, and intense romantic chemistry.',
    modernApplication: 'Drives consumer tech marketing, luxury brand sales, architectural aesthetics, and high-velocity asset turnover.',
    keywords: ['mars venus', 'luxury real estate', 'vehicles', 'passion']
  },
  {
    id: 'RULE_152_JUPITER_SATURN_DHARMA_KARMA',
    ruleNumber: 152,
    category: 'combinations',
    name: 'Jupiter + Saturn (Dharma-Karma Adhipati in Nadi)',
    formula: 'Jupiter (Dharma) conjunct or trine Saturn (Karma).',
    authority: 'Bhrigu Nadi Supreme Sutras',
    classicalDictum: 'The ultimate royal combination: institutional governance, judicial balance, philosophical maturity, and permanent status after age 36.',
    modernApplication: 'Hallmark of managing partners, hospital directors, academic chancellors, and corporate board members.',
    keywords: ['jupiter saturn', 'dharma karma', 'institutional leadership', 'permanent status']
  },
  {
    id: 'RULE_161_COMMERCIAL_TRIAD_SATURN_VENUS_MERCURY',
    ruleNumber: 161,
    category: 'combinations',
    name: 'Supreme Commercial Triad (Saturn + Venus + Mercury)',
    formula: 'Saturn (Karma), Venus (Wealth), and Mercury (Trade/Intellect) residing in the same directional trine.',
    authority: 'Bhrigu Nadi Commercial Sutras',
    classicalDictum: 'The master commercial trinity: labor effortlessly unites with capital and commerce, building lasting industrial and financial empires.',
    modernApplication: 'Identifies tech startup founders, private equity managers, fin-tech architects, and successful corporate conglomerates.',
    keywords: ['commercial triad', 'saturn venus mercury', 'fintech', 'industrial empire', 'wealth founder']
  },
  {
    id: 'RULE_162_DHARMIC_JUDGE_SATURN_JUPITER_KETU',
    ruleNumber: 162,
    category: 'combinations',
    name: 'Dharmic Judge & Spiritual Monk Triad (Saturn + Jupiter + Ketu)',
    formula: 'Saturn, Jupiter, and Ketu residing in the same directional trine.',
    authority: 'Bhrigu Nadi Spiritual Sutras',
    classicalDictum: 'Integrity beyond bribery; the native serves in high judicial courts, spiritual trusts, or deep scientific research with zero ego.',
    modernApplication: 'Marks Supreme Court justices, ethical AI policy researchers, bio-ethicists, and authentic spiritual preceptors.',
    keywords: ['saturn jupiter ketu', 'dharmic judge', 'judiciary', 'spiritual monk', 'ethical integrity']
  },
  {
    id: 'RULE_171_DEGREE_SANDWICH_RULE',
    ruleNumber: 171,
    category: 'combinations',
    name: 'Degree Sandwich Sequence (Planet X between Y and Z)',
    formula: 'Planet A (lowest deg) -> Planet B (middle deg) -> Planet C (highest deg) in same directional trine.',
    authority: 'Bhrigu Nadi Progression Principles',
    classicalDictum: 'The native first experiences the significations of Planet A, integrates Planet B in middle career, and dissolves into Planet C.',
    modernApplication: 'If Saturn sits between Venus (8°) and Ketu (24°), native first accumulates commercial wealth, then exits into spiritual advisory.',
    keywords: ['degree sandwich', 'chronological sequence', 'trine degrees', 'career evolution']
  }
];

/**
 * Programmatic Search & Retrieval Engine for the Astrological Research Corpus.
 */
export class ResearchRuleEngine {
  private rules: ResearchRule[] = RESEARCH_RULES_CORPUS;

  public getAllRules(): ResearchRule[] {
    return this.rules;
  }

  public getRulesByCategory(category: ResearchRuleCategory): ResearchRule[] {
    return this.rules.filter((r) => r.category === category);
  }

  public searchRules(query: string): ResearchRule[] {
    const q = query.toLowerCase();
    return this.rules.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.classicalDictum.toLowerCase().includes(q) ||
        r.modernApplication.toLowerCase().includes(q) ||
        r.authority.toLowerCase().includes(q) ||
        r.keywords.some((k) => k.toLowerCase().includes(q))
    );
  }

  public getRuleById(id: string): ResearchRule | undefined {
    return this.rules.find((r) => r.id === id);
  }
}

export const globalResearchRuleEngine = new ResearchRuleEngine();
