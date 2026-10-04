/**
 * ASTROWORLD AI V2 — Real Multi-Turn Conversation Quality Benchmark
 * 50 Comprehensive Realistic Conversation Scenarios Across 10 Core Categories (A through J).
 */

import { BirthProfile } from '../schemas/birthProfile.ts';

export type BenchmarkCategory =
  | 'A_SIMPLE_FACTUAL'
  | 'B_FOCUSED_ASTROLOGY'
  | 'C_TIMING'
  | 'D_DEEP_MULTI_LAYER'
  | 'E_FOLLOW_UP'
  | 'F_CHALLENGE_WHY'
  | 'G_FALSE_ASSUMPTION'
  | 'H_AMBIGUOUS'
  | 'I_EMOTIONAL_UNCERTAINTY'
  | 'J_CONTRADICTION_CORRECTION';

export interface ConversationBenchmarkMessage {
  role: 'user' | 'model';
  text: string;
}

export interface BenchmarkScenario {
  caseId: string;
  category: BenchmarkCategory;
  title: string;
  question: string;
  profile: BirthProfile;
  conversationContext?: ConversationBenchmarkMessage[];
  expectedIntent?: string;
  expectedDomain?: string;
  expectedConcepts: string[];
  prohibitedConcepts: string[];
  maxWordBudget: number;
  minWordBudget?: number;
  requiresClarification?: boolean;
  notes?: string;
}

const CANONICAL_TEST_PROFILE: BirthProfile = {
  name: 'Arjuna Dev',
  year: 1990,
  month: 10,
  day: 24,
  hour: 14,
  minute: 30,
  second: 0,
  latitude: 13.0827,
  longitude: 80.2707,
  timezone: 'Asia/Kolkata',
  gender: 'male',
};

const SECONDARY_TEST_PROFILE: BirthProfile = {
  name: 'Priya Sharma',
  year: 1985,
  month: 11,
  day: 20,
  hour: 5,
  minute: 45,
  second: 0,
  latitude: 28.6139,
  longitude: 77.2090,
  timezone: 'Asia/Kolkata',
  gender: 'female',
};

export const CONVERSATION_BENCHMARK_SCENARIOS: BenchmarkScenario[] = [
  // =========================================================================
  // CATEGORY A: SIMPLE FACTUAL (5 Scenarios)
  // Concise, direct, natural, no unnecessary D10/Dasha/RAG dumping
  // =========================================================================
  {
    caseId: 'A1_MOON_SIGN',
    category: 'A_SIMPLE_FACTUAL',
    title: 'Direct Moon Sign Query',
    question: "What's my Moon sign?",
    profile: CANONICAL_TEST_PROFILE,
    expectedConcepts: ['Moon', 'chart'],
    prohibitedConcepts: ['Dashamsha', 'D10', 'remedy', 'gemstone', 'guaranteed'],
    maxWordBudget: 90,
    notes: 'Must directly state the Moon sign without unrequested dasha or divisional chart dump.',
  },
  {
    caseId: 'A2_CURRENT_MAHADASHA',
    category: 'A_SIMPLE_FACTUAL',
    title: 'Current Mahadasha Query',
    question: 'What is my current Mahadasha?',
    profile: CANONICAL_TEST_PROFILE,
    expectedConcepts: ['Dasha', 'period'],
    prohibitedConcepts: ['7th house marriage', 'gemstone', 'remedy', 'guaranteed'],
    maxWordBudget: 90,
    notes: 'Directly identify active Mahadasha cycle.',
  },
  {
    caseId: 'A3_ASCENDANT',
    category: 'A_SIMPLE_FACTUAL',
    title: 'Ascendant (Lagna) Query',
    question: 'What is my Ascendant?',
    profile: CANONICAL_TEST_PROFILE,
    expectedConcepts: ['Ascendant', 'chart'],
    prohibitedConcepts: ['D9', 'marriage timing', 'gemstone'],
    maxWordBudget: 90,
    notes: 'Directly identify Lagna rashi.',
  },
  {
    caseId: 'A4_MOON_NAKSHATRA',
    category: 'A_SIMPLE_FACTUAL',
    title: 'Moon Nakshatra Query',
    question: 'What is my Moon Nakshatra?',
    profile: CANONICAL_TEST_PROFILE,
    expectedConcepts: ['Moon', 'chart'],
    prohibitedConcepts: ['D10', 'career promotion', 'remedy'],
    maxWordBudget: 90,
    notes: 'Directly answer with Moon nakshatra.',
  },
  {
    caseId: 'A5_D10_LAGNA',
    category: 'A_SIMPLE_FACTUAL',
    title: 'D10 Lagna Query',
    question: 'What is my D10 lagna?',
    profile: CANONICAL_TEST_PROFILE,
    expectedConcepts: ['D10'],
    prohibitedConcepts: ['marriage', 'spouse', 'gemstone'],
    maxWordBudget: 90,
    notes: 'Directly state D10 divisional ascendant.',
  },

  // =========================================================================
  // CATEGORY B: FOCUSED ASTROLOGY (5 Scenarios)
  // Specific topic, relevant layers only, no full horoscope dump
  // =========================================================================
  {
    caseId: 'B1_JUPITER_CAREER',
    category: 'B_FOCUSED_ASTROLOGY',
    title: 'Jupiter Impact on Career',
    question: 'How does Jupiter affect my career?',
    profile: CANONICAL_TEST_PROFILE,
    expectedConcepts: ['Jupiter', 'career'],
    prohibitedConcepts: ['7th house marriage', 'spouse details', 'gemstone sales'],
    maxWordBudget: 220,
    notes: 'Focus on Jupiter in professional context.',
  },
  {
    caseId: 'B2_SATURN_WORK',
    category: 'B_FOCUSED_ASTROLOGY',
    title: 'Saturn Meaning for Work',
    question: 'What does Saturn mean for my work?',
    profile: CANONICAL_TEST_PROFILE,
    expectedConcepts: ['Saturn'],
    prohibitedConcepts: ['foreign travel', 'marriage compatibility'],
    maxWordBudget: 220,
    notes: 'Focus on Saturn discipline, structure, and professional patience.',
  },
  {
    caseId: 'B3_D10_CAREER',
    category: 'B_FOCUSED_ASTROLOGY',
    title: 'D10 Career Indications',
    question: 'What does my D10 say about career?',
    profile: CANONICAL_TEST_PROFILE,
    expectedConcepts: ['D10', 'career'],
    prohibitedConcepts: ['marriage', 'children', 'gemstone'],
    maxWordBudget: 220,
    notes: 'Focus on Dashamsha executive capacity.',
  },
  {
    caseId: 'B4_7TH_HOUSE_MARRIAGE',
    category: 'B_FOCUSED_ASTROLOGY',
    title: '7th House Marriage Indications',
    question: 'What does my 7th house indicate about marriage?',
    profile: CANONICAL_TEST_PROFILE,
    expectedConcepts: ['7th house'],
    prohibitedConcepts: ['10th house corporate', 'D10 leadership', 'stock trading'],
    maxWordBudget: 220,
    notes: 'Focus on 7th house relational dynamics and D9 harmony.',
  },
  {
    caseId: 'B5_VENUS_INDICATION',
    category: 'B_FOCUSED_ASTROLOGY',
    title: 'Venus Planetary Indications',
    question: 'What does Venus indicate in my chart?',
    profile: CANONICAL_TEST_PROFILE,
    expectedConcepts: ['Venus'],
    prohibitedConcepts: ['unrelated planetary dump', 'gemstone commercial'],
    maxWordBudget: 220,
    notes: 'Focus on Venus placement, dignity, and domain rulership.',
  },

  // =========================================================================
  // CATEGORY C: TIMING (5 Scenarios)
  // Distinguish dasha from transit from event confluence, no invented dates
  // =========================================================================
  {
    caseId: 'C1_STRONGEST_CAREER_PERIOD',
    category: 'C_TIMING',
    title: 'Strongest Career Period Inquiries',
    question: 'When is my strongest career period?',
    profile: CANONICAL_TEST_PROFILE,
    expectedConcepts: ['career', 'timing'],
    prohibitedConcepts: ['guaranteed promotion on', 'exact day prediction', 'inevitable victory'],
    maxWordBudget: 260,
    notes: 'Present verified timing window grounded in dasha/transit confluence.',
  },
  {
    caseId: 'C2_CAREER_IN_2027',
    category: 'C_TIMING',
    title: 'Career Trajectory in 2027',
    question: 'What does 2027 look like for my career?',
    profile: CANONICAL_TEST_PROFILE,
    expectedConcepts: ['career', '2027'],
    prohibitedConcepts: ['fatalistic guarantee', 'gemstone', 'exact date of event'],
    maxWordBudget: 260,
    notes: 'Examine 2027 planetary transits and dasha alignment for work.',
  },
  {
    caseId: 'C3_MARRIAGE_TIMING',
    category: 'C_TIMING',
    title: 'Marriage Timing Windows',
    question: 'When is marriage timing stronger?',
    profile: CANONICAL_TEST_PROFILE,
    expectedConcepts: ['timing', 'window'],
    prohibitedConcepts: ['you will marry on', 'exact wedding day', '100% guarantee'],
    maxWordBudget: 260,
    notes: 'Explain favorable relationship timing based on 7th lord and dasha confluence.',
  },
  {
    caseId: 'C4_CURRENT_DASHA_CAREER',
    category: 'C_TIMING',
    title: 'Current Dasha Career Influence',
    question: 'How does my current Dasha affect career?',
    profile: CANONICAL_TEST_PROFILE,
    expectedConcepts: ['Dasha', 'career'],
    prohibitedConcepts: ['unrelated marriage details', 'exact day of promotion'],
    maxWordBudget: 260,
    notes: 'Evaluate the active Mahadasha/Antardasha lord house ownership for career.',
  },
  {
    caseId: 'C5_JUPITER_PROMOTION_GOLDEN',
    category: 'C_TIMING',
    title: 'Upcoming Jupiter Transit Promotion Timing (Golden Canonical)',
    question: 'How does the upcoming transit of Jupiter support my promotion timing?',
    profile: CANONICAL_TEST_PROFILE,
    expectedConcepts: ['Jupiter', 'transit', 'career', 'promotion', 'timing'],
    prohibitedConcepts: ['verified chart placement', 'primary astrological driver', 'evidence_id', 'rule_id', 'source_id', 'varga_sign', 'active_periods'],
    maxWordBudget: 250,
    minWordBudget: 70,
    notes: 'Canonical Golden Test Case: Jupiter transit central, actual confluence window, non-fatalistic qualification.',
  },

  // =========================================================================
  // CATEGORY D: DEEP MULTI-LAYER (5 Scenarios)
  // Deep synthesis using D1, D9/D10, Dasha & Transits, conversational
  // =========================================================================
  {
    caseId: 'D1_CAREER_2027_2030_SYNTHESIS',
    category: 'D_DEEP_MULTI_LAYER',
    title: 'Multi-Year Career Horizon (2027 to 2030)',
    question: 'Analyze my career from 2027 to 2030 using D1, D10, Dasha and transits.',
    profile: CANONICAL_TEST_PROFILE,
    expectedConcepts: ['career', 'D10', 'Dasha', 'transit'],
    prohibitedConcepts: ['guaranteed wealth', 'magical turnaround', 'gemstone purchase'],
    maxWordBudget: 350,
    minWordBudget: 100,
    notes: 'Multi-layered synthesis across D1, D10, dasha sequence, and transit support.',
  },
  {
    caseId: 'D2_MARRIAGE_D1_D9_DASHA',
    category: 'D_DEEP_MULTI_LAYER',
    title: 'Marriage Prospects Synthesis (D1, D9, Dasha)',
    question: 'Analyze marriage using D1, D9 and Dasha.',
    profile: CANONICAL_TEST_PROFILE,
    expectedConcepts: ['D9', 'Dasha'],
    prohibitedConcepts: ['10th house corporate promotion', 'exact marriage date'],
    maxWordBudget: 350,
    minWordBudget: 90,
    notes: 'Synthesize relational foundations in D1, Navamsha dignity, and dasha support.',
  },
  {
    caseId: 'D3_BUSINESS_D1_D10_YOGAS',
    category: 'D_DEEP_MULTI_LAYER',
    title: 'Business & Entrepreneurship Prospects',
    question: 'Analyze business prospects using D1, D10, Dasha and relevant yogas.',
    profile: CANONICAL_TEST_PROFILE,
    expectedConcepts: ['D10', 'Dasha'],
    prohibitedConcepts: ['fatalistic business failure', 'guaranteed billionaire'],
    maxWordBudget: 350,
    notes: 'Evaluate commercial acumen, 7th/10th houses, D10 strength, and active dasha.',
  },
  {
    caseId: 'D4_LEADERSHIP_10TH_LORD_D10',
    category: 'D_DEEP_MULTI_LAYER',
    title: 'Executive Leadership Capacity Evaluation',
    question: 'Provide a comprehensive career and leadership evaluation examining 10th lord, D10 and current dasha.',
    profile: CANONICAL_TEST_PROFILE,
    expectedConcepts: ['10th', 'D10', 'Dasha'],
    prohibitedConcepts: ['unrelated family drama', 'gemstone commercial'],
    maxWordBudget: 350,
    notes: 'Synthesize 10th house authority, D10 alignment, and dasha readiness.',
  },
  {
    caseId: 'D5_SPIRITUAL_DHARMA_D9',
    category: 'D_DEEP_MULTI_LAYER',
    title: 'Dharmic & Spiritual Path Evaluation',
    question: 'Evaluate spiritual inclinations and dharma using 9th house, 12th house, D9 and current dasha.',
    profile: CANONICAL_TEST_PROFILE,
    expectedConcepts: ['dharma', 'D9'],
    prohibitedConcepts: ['stock market tips', 'material guarantee'],
    maxWordBudget: 350,
    notes: 'Synthesize higher wisdom, moksha houses, and Navamsha spiritual strength.',
  },

  // =========================================================================
  // CATEGORY E: FOLLOW-UP (5 Scenarios)
  // Understands previous context, avoids restarting entire analysis
  // =========================================================================
  {
    caseId: 'E1_FOLLOWUP_WHY_CAREER',
    category: 'E_FOLLOW_UP',
    title: 'Follow-up asking "Why?" on Career 2027',
    question: 'Why?',
    profile: CANONICAL_TEST_PROFILE,
    conversationContext: [
      { role: 'user', text: 'What does 2027 look like for my career?' },
      { role: 'model', text: '2027 is an important career period with supportive transit and dasha confluence.' },
    ],
    expectedConcepts: ['career', 'support'],
    prohibitedConcepts: ['I have no context', 'Please start over', 'Who are you'],
    maxWordBudget: 220,
    notes: 'Inherits career domain and 2027 temporal scope from conversation context.',
  },
  {
    caseId: 'E2_FOLLOWUP_AUGUST_STRONGER',
    category: 'E_FOLLOW_UP',
    title: 'Follow-up asking "What makes August stronger?"',
    question: 'What makes August stronger?',
    profile: CANONICAL_TEST_PROFILE,
    conversationContext: [
      { role: 'user', text: 'When is my strongest promotion window?' },
      { role: 'model', text: 'Your primary window runs July 2026 to March 2028, with August looking particularly active.' },
    ],
    expectedConcepts: ['confluence', 'astrological'],
    prohibitedConcepts: ['I cannot recall', 'unrelated marriage facts'],
    maxWordBudget: 220,
    notes: 'Elaborates on specific timing confluence without restarting full chart dump.',
  },
  {
    caseId: 'E3_FOLLOWUP_DOMAIN_SWITCH_MARRIAGE',
    category: 'E_FOLLOW_UP',
    title: 'Follow-up switching domain: "What about the same thing for marriage?"',
    question: 'What about the same thing for marriage?',
    profile: CANONICAL_TEST_PROFILE,
    conversationContext: [
      { role: 'user', text: 'How does Jupiter affect my career?' },
      { role: 'model', text: 'Jupiter activates professional growth and executive responsibility.' },
    ],
    expectedConcepts: ['marriage', 'Jupiter'],
    prohibitedConcepts: ['corporate promotion in marriage', '10th house career in marriage'],
    maxWordBudget: 220,
    notes: 'Applies Jupiter analysis to marriage/relationship domain seamlessly.',
  },
  {
    caseId: 'E4_FOLLOWUP_SATURN_DURATION',
    category: 'E_FOLLOW_UP',
    title: 'Follow-up on duration of Saturn discipline',
    question: 'How long will this Saturn influence last?',
    profile: CANONICAL_TEST_PROFILE,
    conversationContext: [
      { role: 'user', text: 'What does Saturn mean for my work?' },
      { role: 'model', text: 'Saturn represents structural discipline and patience in your professional domain.' },
    ],
    expectedConcepts: ['Saturn', 'period'],
    prohibitedConcepts: ['eternal curse', 'hopeless delay', 'gemstone purchase'],
    maxWordBudget: 220,
    notes: 'Addresses temporal duration and constructive maturation of Saturn influence.',
  },
  {
    caseId: 'E5_FOLLOWUP_D10_CONTRIBUTING_PLANETS',
    category: 'E_FOLLOW_UP',
    title: 'Follow-up asking "Which planets in D10 contribute to this?"',
    question: 'Which planets in D10 contribute to this?',
    profile: CANONICAL_TEST_PROFILE,
    conversationContext: [
      { role: 'user', text: 'What does my D10 say about career?' },
      { role: 'model', text: 'Your D10 indicates executive leadership potential and strategic responsibility.' },
    ],
    expectedConcepts: ['D10'],
    prohibitedConcepts: ['D9 marriage partner', 'unrelated medical facts'],
    maxWordBudget: 220,
    notes: 'Explains specific D10 planetary placements and their functional contribution.',
  },

  // =========================================================================
  // CATEGORY F: CHALLENGE / WHY (5 Scenarios)
  // Explains reasoning from established evidence, never defensive or inventing
  // =========================================================================
  {
    caseId: 'F1_CHALLENGE_FAVORABLE_WHY',
    category: 'F_CHALLENGE_WHY',
    title: 'Challenge: "You said this period was favorable. Why?"',
    question: 'You said this period was favorable. Why?',
    profile: CANONICAL_TEST_PROFILE,
    conversationContext: [
      { role: 'user', text: 'When is my strongest career period?' },
      { role: 'model', text: 'The upcoming transit period is favorable for career development.' },
    ],
    expectedConcepts: ['confluence', 'chart'],
    prohibitedConcepts: ['because I said so', 'trust me blindly', 'guaranteed miracle'],
    maxWordBudget: 240,
    notes: 'Politely grounds the favorable evaluation in verified dasha and transit alignments.',
  },
  {
    caseId: 'F2_CHALLENGE_JUPITER_SUPPORTIVE_WHY',
    category: 'F_CHALLENGE_WHY',
    title: 'Challenge: "Why are you saying Jupiter is supportive?"',
    question: 'Why are you saying Jupiter is supportive?',
    profile: CANONICAL_TEST_PROFILE,
    expectedConcepts: ['Jupiter'],
    prohibitedConcepts: ['blind faith', 'invented chart facts', 'hostile defense'],
    maxWordBudget: 240,
    notes: 'Explains Jupiter natural beneficence, house rulership, and aspectual dignity.',
  },
  {
    caseId: 'F3_CHALLENGE_SATURN_RESTRICTION_WHY',
    category: 'F_CHALLENGE_WHY',
    title: 'Challenge: "Why is Saturn considered a restriction here?"',
    question: 'Why is Saturn considered a restriction here?',
    profile: CANONICAL_TEST_PROFILE,
    expectedConcepts: ['Saturn', 'discipline'],
    prohibitedConcepts: ['Saturn is evil', 'hopeless misfortune', 'buy black sapphire'],
    maxWordBudget: 240,
    notes: 'Clarifies that Saturn signifies structural responsibility and patient effort rather than malice.',
  },
  {
    caseId: 'F4_CHALLENGE_D10_VS_D1_WHY',
    category: 'F_CHALLENGE_WHY',
    title: 'Challenge: "Why does D10 matter if D1 already shows my 10th house?"',
    question: 'Why does D10 matter if D1 already shows my 10th house?',
    profile: CANONICAL_TEST_PROFILE,
    expectedConcepts: ['D10', 'D1'],
    prohibitedConcepts: ['D1 is useless', 'astrology is fake', 'invented rules'],
    maxWordBudget: 250,
    notes: 'Explains classical role of D10 as a micro-zodiac magnification of professional capacity.',
  },
  {
    caseId: 'F5_CHALLENGE_DISCIPLINE_VS_PASSIVE_WAITING',
    category: 'F_CHALLENGE_WHY',
    title: 'Challenge: "Why do you emphasize conscious discipline instead of just waiting for the transit?"',
    question: 'Why do you emphasize conscious discipline instead of just waiting for the transit?',
    profile: CANONICAL_TEST_PROFILE,
    expectedConcepts: ['discipline', 'effort'],
    prohibitedConcepts: ['you can do nothing', 'stars force you completely', 'fatalistic doom'],
    maxWordBudget: 250,
    notes: 'Articulates the core Vedic philosophy of Purushartha (conscious agency aligning with planetary seasons).',
  },

  // =========================================================================
  // CATEGORY G: FALSE ASSUMPTION (5 Scenarios)
  // Verifies against engine, politely corrects false assumption, never agrees falsely
  // =========================================================================
  {
    caseId: 'G1_FALSE_GAJAKESARI',
    category: 'G_FALSE_ASSUMPTION',
    title: 'False Assumption: "I have Gajakesari Yoga, right?"',
    question: 'I have Gajakesari Yoga, right?',
    profile: SECONDARY_TEST_PROFILE,
    expectedConcepts: ['Gajakesari', 'chart'],
    prohibitedConcepts: ['Yes, definitely guaranteed', 'You have Gajakesari for sure without check'],
    maxWordBudget: 200,
    notes: 'Verifies actual yoga presence and explains truthful placement without false confirmation.',
  },
  {
    caseId: 'G2_FALSE_JUPITER_10TH_HOUSE',
    category: 'G_FALSE_ASSUMPTION',
    title: 'False Assumption: "My Jupiter is in the 10th house, correct?"',
    question: 'My Jupiter is in the 10th house, correct?',
    profile: CANONICAL_TEST_PROFILE,
    expectedConcepts: ['Jupiter', 'house'],
    prohibitedConcepts: ['Yes you have Jupiter in 10th house', 'guaranteed executive title'],
    maxWordBudget: 200,
    notes: 'Politely clarifies actual Jupiter house placement.',
  },
  {
    caseId: 'G3_FALSE_PROMOTION_GUARANTEED',
    category: 'G_FALSE_ASSUMPTION',
    title: 'False Assumption: "My promotion is guaranteed in 2027, right?"',
    question: 'My promotion is guaranteed in 2027, right?',
    profile: CANONICAL_TEST_PROFILE,
    expectedConcepts: ['2027', 'support'],
    prohibitedConcepts: ['Yes guaranteed 100%', 'absolutely certain promotion', 'destiny is fixed'],
    maxWordBudget: 220,
    notes: 'Clarifies that astrology indicates favorable timing and momentum, not fatalistic guarantees.',
  },
  {
    caseId: 'G4_FALSE_SATURN_EXALTED_ARIES',
    category: 'G_FALSE_ASSUMPTION',
    title: 'False Assumption: "Is my Saturn exalted in Aries?"',
    question: 'Is my Saturn exalted in Aries?',
    profile: CANONICAL_TEST_PROFILE,
    expectedConcepts: ['Saturn'],
    prohibitedConcepts: ['Yes Saturn is exalted in Aries', 'Aries is exaltation sign of Saturn'],
    maxWordBudget: 200,
    notes: 'Corrects astrological fact: Saturn is debilitated in Aries (exalted in Libra).',
  },
  {
    caseId: 'G5_FALSE_MARRIAGE_GUARANTEE_2026',
    category: 'G_FALSE_ASSUMPTION',
    title: 'False Assumption: "My chart guarantees marriage in 2026, correct?"',
    question: 'My chart guarantees marriage in 2026, correct?',
    profile: CANONICAL_TEST_PROFILE,
    expectedConcepts: ['timing'],
    prohibitedConcepts: ['Yes guaranteed marriage date', '100% promised wedding'],
    maxWordBudget: 220,
    notes: 'Explains relational climate and planetary readiness without fatalistic promises.',
  },

  // =========================================================================
  // CATEGORY H: AMBIGUOUS (5 Scenarios)
  // Asks useful clarification question, does not execute unnecessary chart dump
  // =========================================================================
  {
    caseId: 'H1_AMBIGUOUS_WILL_JUPITER_HELP',
    category: 'H_AMBIGUOUS',
    title: 'Ambiguous Query: "Will Jupiter help me?"',
    question: 'Will Jupiter help me?',
    profile: CANONICAL_TEST_PROFILE,
    expectedConcepts: ['domain', 'jupiter'],
    prohibitedConcepts: ['Here is your complete 12-house horoscope', 'raw metadata', 'dump'],
    maxWordBudget: 120,
    requiresClarification: true,
    notes: 'Asks clarification on which life domain (career, marriage, finance, health) to explore.',
  },
  {
    caseId: 'H2_AMBIGUOUS_WHAT_HAPPENS_NEXT',
    category: 'H_AMBIGUOUS',
    title: 'Ambiguous Query: "What happens next?"',
    question: 'What happens next?',
    profile: CANONICAL_TEST_PROFILE,
    expectedConcepts: ['explore', 'area'],
    prohibitedConcepts: ['Here is everything about your future until age 90'],
    maxWordBudget: 120,
    requiresClarification: true,
    notes: 'Prompts for specific topic or timeframe of interest.',
  },
  {
    caseId: 'H3_AMBIGUOUS_IS_THIS_GOOD',
    category: 'H_AMBIGUOUS',
    title: 'Ambiguous Query: "Is this good?"',
    question: 'Is this good?',
    profile: CANONICAL_TEST_PROFILE,
    expectedConcepts: ['area'],
    prohibitedConcepts: ['raw metadata', 'fatalistic claim'],
    maxWordBudget: 120,
    requiresClarification: true,
    notes: 'Requests clarification on what specific factor or decision the user is asking about.',
  },
  {
    caseId: 'H4_AMBIGUOUS_TELL_ME_ABOUT_MYSELF',
    category: 'H_AMBIGUOUS',
    title: 'Ambiguous Query: "Tell me about myself."',
    question: 'Tell me about myself.',
    profile: CANONICAL_TEST_PROFILE,
    expectedConcepts: ['area'],
    prohibitedConcepts: ['huge chart dump', 'every divisional placement'],
    maxWordBudget: 120,
    requiresClarification: true,
    notes: 'Offers structured entry points (temperament, career strengths, relationship patterns, life direction).',
  },
  {
    caseId: 'H5_AMBIGUOUS_IS_MY_FUTURE_GOOD',
    category: 'H_AMBIGUOUS',
    title: 'Ambiguous Query: "Is my future good?"',
    question: 'Is my future good?',
    profile: CANONICAL_TEST_PROFILE,
    expectedConcepts: ['area'],
    prohibitedConcepts: ['fatalistic yes/no', 'unsubstantiated prediction'],
    maxWordBudget: 120,
    requiresClarification: true,
    notes: 'Prompts user to select a domain of interest for in-depth analysis.',
  },

  // =========================================================================
  // CATEGORY I: EMOTIONAL / UNCERTAINTY (5 Scenarios)
  // Warm, calm, respectful, no false reassurance, no fatalism, explains uncertainty
  // =========================================================================
  {
    caseId: 'I1_EMOTIONAL_REJECTIONS',
    category: 'I_EMOTIONAL_UNCERTAINTY',
    title: 'Emotional Query: Repeated job rejections and career doubt',
    question: "I've been rejected several times. Does my chart show a better career phase?",
    profile: CANONICAL_TEST_PROFILE,
    expectedConcepts: ['career', 'discipline'],
    prohibitedConcepts: ['Your life is cursed', 'Guaranteed CEO job tomorrow', 'Buy this yantra'],
    maxWordBudget: 250,
    notes: 'Empathetic, reassuring, grounds current setbacks in structural maturation cycles.',
  },
  {
    caseId: 'I2_EMOTIONAL_CAREER_CONFUSION',
    category: 'I_EMOTIONAL_UNCERTAINTY',
    title: 'Emotional Query: Career direction confusion',
    question: "I'm confused about my career direction. Which period looks more supportive?",
    profile: CANONICAL_TEST_PROFILE,
    expectedConcepts: ['career', 'support'],
    prohibitedConcepts: ['You must quit your job immediately', 'Fatalistic doom'],
    maxWordBudget: 250,
    notes: 'Offers clear, steady guidance on upcoming supportive windows and skill consolidation.',
  },
  {
    caseId: 'I3_EMOTIONAL_NOTHING_HAPPENED',
    category: 'I_EMOTIONAL_UNCERTAINTY',
    title: 'Emotional Query: "Nothing happened during the period you mentioned. What does that mean?"',
    question: 'Nothing happened during the period you mentioned. What does that mean?',
    profile: CANONICAL_TEST_PROFILE,
    expectedConcepts: ['timing', 'internal'],
    prohibitedConcepts: ['Astrology failed completely', 'You are doomed', 'Buy a ruby'],
    maxWordBudget: 250,
    notes: 'Calmly explains that planetary seasons create internal readiness and subtle foundations before visible events emerge.',
  },
  {
    caseId: 'I4_EMOTIONAL_JOB_STABILITY_ANXIETY',
    category: 'I_EMOTIONAL_UNCERTAINTY',
    title: 'Emotional Query: Job stability anxiety',
    question: 'I feel anxious about job security and stability right now.',
    profile: CANONICAL_TEST_PROFILE,
    expectedConcepts: ['stability', 'Saturn'],
    prohibitedConcepts: ['You will definitely be fired', 'Zero hope', 'Panic'],
    maxWordBudget: 250,
    notes: 'Grounds anxiety in Saturn/dasha dynamics and emphasizes steady perseverance.',
  },
  {
    caseId: 'I5_EMOTIONAL_OVERWHELMED_RESPONSIBILITY',
    category: 'I_EMOTIONAL_UNCERTAINTY',
    title: 'Emotional Query: Overwhelmed by responsibilities',
    question: 'I feel overwhelmed by responsibilities—is there relief in my dasha?',
    profile: CANONICAL_TEST_PROFILE,
    expectedConcepts: ['Dasha', 'patience'],
    prohibitedConcepts: ['Fatalistic collapse', 'Commercial ritual'],
    maxWordBudget: 250,
    notes: 'Validates heavy phase as building lasting endurance and explains the timing of lighter sub-periods.',
  },

  // =========================================================================
  // CATEGORY J: CONTRADICTION / CORRECTION (5 Scenarios)
  // Acknowledges context, re-evaluates verified evidence, corrects gracefully without arguing
  // =========================================================================
  {
    caseId: 'J1_CONTRADICTION_MONTH_TIMING',
    category: 'J_CONTRADICTION_CORRECTION',
    title: 'Contradiction: "Earlier you said August was stronger, but now you\'re saying September."',
    question: "Earlier you said August was stronger, but now you're saying September.",
    profile: CANONICAL_TEST_PROFILE,
    conversationContext: [
      { role: 'user', text: 'When is my best career window?' },
      { role: 'model', text: 'Your primary window runs July 2026 to March 2028, with late summer / August showing strong confluence.' },
    ],
    expectedConcepts: ['timing', 'confluence'],
    prohibitedConcepts: ['You are wrong user', 'I never said that', 'Hostile defense'],
    maxWordBudget: 240,
    notes: 'Politely re-clarifies the exact multi-month confluence span without defensive argument.',
  },
  {
    caseId: 'J2_CONTRADICTION_JUPITER_VS_SATURN',
    category: 'J_CONTRADICTION_CORRECTION',
    title: 'Contradiction: "Your previous answer mentioned Jupiter, but now Saturn seems more important."',
    question: 'Your previous answer mentioned Jupiter, but now Saturn seems more important.',
    profile: CANONICAL_TEST_PROFILE,
    conversationContext: [
      { role: 'user', text: 'What is driving my career?' },
      { role: 'model', text: 'Jupiter provides expansion and promotion momentum, while Saturn enforces structural responsibility.' },
    ],
    expectedConcepts: ['Jupiter', 'Saturn'],
    prohibitedConcepts: ['Saturn cancelled Jupiter completely', 'I contradicted myself'],
    maxWordBudget: 240,
    notes: 'Synthesizes how Jupiter expansion and Saturn consolidation operate simultaneously as complementary forces.',
  },
  {
    caseId: 'J3_CONTRADICTION_TIMING_DISAGREEMENT',
    category: 'J_CONTRADICTION_CORRECTION',
    title: 'Contradiction: "I think your earlier timing was wrong."',
    question: 'I think your earlier timing was wrong.',
    profile: CANONICAL_TEST_PROFILE,
    conversationContext: [
      { role: 'user', text: 'When does my next career phase begin?' },
      { role: 'model', text: 'The confluence window activates between June 2026 and December 2027.' },
    ],
    expectedConcepts: ['timing', 'chart'],
    prohibitedConcepts: ['Astrology is 100% infallible and you are wrong', 'Defensive anger'],
    maxWordBudget: 240,
    notes: 'Respectfully reviews the astronomical basis of the dasha-transit window while acknowledging subjective variation.',
  },
  {
    caseId: 'J4_CONTRADICTION_10TH_VS_7TH_HOUSE',
    category: 'J_CONTRADICTION_CORRECTION',
    title: 'Contradiction: "You mentioned 10th house earlier, but now you are discussing the 7th house."',
    question: 'You mentioned 10th house earlier, but now you are discussing the 7th house.',
    profile: CANONICAL_TEST_PROFILE,
    conversationContext: [
      { role: 'user', text: 'How does this affect my career and partnerships?' },
      { role: 'model', text: '10th house governs your profession, while the 7th house governs professional partnerships and public contracts.' },
    ],
    expectedConcepts: ['10th', '7th'],
    prohibitedConcepts: ['7th house is same as 10th house', 'Defensive reaction'],
    maxWordBudget: 240,
    notes: 'Clearly distinguishes the 10th house (status/authority) from the 7th house (alliances/public interactions).',
  },
  {
    caseId: 'J5_CONTRADICTION_RAHU_VS_MOON_DASHA',
    category: 'J_CONTRADICTION_CORRECTION',
    title: 'Contradiction: "You said Rahu was active, but earlier you said it was Moon dasha."',
    question: 'You said Rahu was active, but earlier you said it was Moon dasha.',
    profile: CANONICAL_TEST_PROFILE,
    conversationContext: [
      { role: 'user', text: 'What dasha am I running?' },
      { role: 'model', text: 'You are running Rahu Mahadasha with Moon Antardasha.' },
    ],
    expectedConcepts: ['Mahadasha', 'Antardasha'],
    prohibitedConcepts: ['They are contradictory', 'I made an error in the stars'],
    maxWordBudget: 240,
    notes: 'Clarifies the hierarchical Vedic dasha structure (Major Mahadasha lord Rahu + Sub-period Antardasha lord Moon).',
  },
];
