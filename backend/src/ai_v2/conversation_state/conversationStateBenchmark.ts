/**
 * ASTROWORLD AI V2 — Phase 5A Conversation State Benchmark Test Suite
 * 60 Comprehensive Scenarios Across 8 Categories:
 * A: Direct Continuation (10)
 * B: Why / How Follow-Up (10)
 * C: Temporal References (10)
 * D: Pronoun & Reference Resolution (10)
 * E: Domain Switching (5)
 * F: Previous Claim Challenge (5)
 * G: Correction Handling (5)
 * H: Ambiguous References (5)
 */

export interface BenchmarkTurnSetup {
  user: string;
  assistantSummary: string;
  domain?: string;
  factors?: string[];
  timing?: string;
  claims?: Array<{ id: string; statement: string; type?: string; entities?: string[] }>;
}

export interface StateBenchmarkScenario {
  id: string;
  category:
    | 'A_DIRECT_CONTINUATION'
    | 'B_WHY_HOW'
    | 'C_TEMPORAL'
    | 'D_PRONOUN_REFERENCE'
    | 'E_DOMAIN_SWITCH'
    | 'F_CLAIM_CHALLENGE'
    | 'G_CORRECTION'
    | 'H_AMBIGUOUS';
  title: string;
  history: BenchmarkTurnSetup[];
  query: string;
  expectedDomain?: string;
  expectedTopicSnippet?: string;
  expectedIntent?: string;
  expectedEntity?: string;
  expectedTemporalType?: string;
  expectedExplanationRequested?: boolean;
  expectedClarificationNeeded?: boolean;
  expectedClarificationReasonSnippet?: string;
  expectedDomainSwitched?: boolean;
  prohibitedBehaviors?: string[];
}

export const CONVERSATION_STATE_BENCHMARK_SCENARIOS: StateBenchmarkScenario[] = [
  // =========================================================================
  // CATEGORY A: DIRECT CONTINUATION (10 Tests)
  // Maintains active topic/domain, factors, and builds naturally
  // =========================================================================
  {
    id: 'A1_CAREER_PROGRESSION',
    category: 'A_DIRECT_CONTINUATION',
    title: 'Career progression continuation',
    history: [
      {
        user: 'How does Jupiter affect my career?',
        assistantSummary: 'Jupiter activates professional expansion and leadership in your 10th house.',
        domain: 'career',
        factors: ['Jupiter', '10th House'],
      },
    ],
    query: 'What about my executive responsibilities?',
    expectedDomain: 'career',
    expectedExplanationRequested: false,
    expectedClarificationNeeded: false,
  },
  {
    id: 'A2_DASHA_SUBPERIOD_CONTINUATION',
    category: 'A_DIRECT_CONTINUATION',
    title: 'Active dasha sub-period inquiry',
    history: [
      {
        user: 'What dasha am I running?',
        assistantSummary: 'You are running Moon Mahadasha with Venus Antardasha.',
        domain: 'timing',
        factors: ['Moon', 'Venus'],
      },
    ],
    query: 'And the next sub-period?',
    expectedDomain: 'timing',
    expectedClarificationNeeded: false,
  },
  {
    id: 'A3_D10_LAGNA_ELABORATION',
    category: 'A_DIRECT_CONTINUATION',
    title: 'Dashamsha Lagna elaboration',
    history: [
      {
        user: 'What is my D10 Lagna?',
        assistantSummary: 'Your D10 Lagna is Taurus, providing stability and practical perseverance in profession.',
        domain: 'career',
        factors: ['D10 Lagna', 'Taurus'],
      },
    ],
    query: 'Does that mean corporate stability?',
    expectedDomain: 'career',
    expectedClarificationNeeded: false,
  },
  {
    id: 'A4_FINANCE_SAV_CONTINUATION',
    category: 'A_DIRECT_CONTINUATION',
    title: 'Financial bindu continuation',
    history: [
      {
        user: 'How is my financial outlook?',
        assistantSummary: 'The 11th house has 34 bindus indicating strong gains.',
        domain: 'finance',
        factors: ['11th House', 'Ashtakavarga'],
      },
    ],
    query: 'Are savings similarly favored?',
    expectedDomain: 'finance',
    expectedClarificationNeeded: false,
  },
  {
    id: 'A5_RELATIONSHIP_D9_CONTINUATION',
    category: 'A_DIRECT_CONTINUATION',
    title: 'Navamsha marriage continuation',
    history: [
      {
        user: 'What does my 7th house indicate about marriage?',
        assistantSummary: 'The 7th lord is placed well in D9 indicating matrimonial harmony.',
        domain: 'relationship',
        factors: ['7th Lord', 'D9'],
      },
    ],
    query: 'How does that affect partnership timing?',
    expectedDomain: 'relationship',
    expectedClarificationNeeded: false,
  },
  {
    id: 'A6_HEALTH_VITALITY_CONTINUATION',
    category: 'A_DIRECT_CONTINUATION',
    title: 'Health and vitality continuation',
    history: [
      {
        user: 'How is my health right now?',
        assistantSummary: 'Sun placement encourages vitality while Saturn demands structured routines.',
        domain: 'health',
        factors: ['Sun', 'Saturn'],
      },
    ],
    query: 'What routines support this?',
    expectedDomain: 'health',
    expectedClarificationNeeded: false,
  },
  {
    id: 'A7_SPIRITUAL_MOKSHA_CONTINUATION',
    category: 'A_DIRECT_CONTINUATION',
    title: 'Spiritual dharma continuation',
    history: [
      {
        user: 'What are my spiritual inclinations?',
        assistantSummary: 'The 9th and 12th houses show strong philosophical and dharmic focus.',
        domain: 'spirituality',
        factors: ['9th House', '12th House'],
      },
    ],
    query: 'Does meditation strengthen this?',
    expectedDomain: 'spirituality',
    expectedClarificationNeeded: false,
  },
  {
    id: 'A8_BUSINESS_COMMERCE_CONTINUATION',
    category: 'A_DIRECT_CONTINUATION',
    title: 'Commercial trade continuation',
    history: [
      {
        user: 'Can I do business?',
        assistantSummary: 'Mercury in dignity favors independent commerce and consulting.',
        domain: 'career',
        factors: ['Mercury'],
      },
    ],
    query: 'What about international clients?',
    expectedDomain: 'career',
    expectedClarificationNeeded: false,
  },
  {
    id: 'A9_YOGA_MANIFESTATION_CONTINUATION',
    category: 'A_DIRECT_CONTINUATION',
    title: 'Yoga manifestation continuation',
    history: [
      {
        user: 'Do I have Budhaditya Yoga?',
        assistantSummary: 'Yes, Sun and Mercury form Budhaditya Yoga in Libra.',
        domain: 'general',
        factors: ['Budhaditya Yoga', 'Mercury', 'Sun'],
      },
    ],
    query: 'How does this yoga show up in daily decisions?',
    expectedClarificationNeeded: false,
  },
  {
    id: 'A10_TRANSIT_ACTIVATION_CONTINUATION',
    category: 'A_DIRECT_CONTINUATION',
    title: 'Gochara transit activation continuation',
    history: [
      {
        user: 'How does Jupiter transit my chart?',
        assistantSummary: 'Jupiter transits through Cancer activating 10th house authority.',
        domain: 'timing',
        factors: ['Jupiter', 'Cancer'],
      },
    ],
    query: 'Does it aspect my 2nd house from there?',
    expectedDomain: 'timing',
    expectedClarificationNeeded: false,
  },

  // =========================================================================
  // CATEGORY B: WHY / HOW FOLLOW-UP (10 Tests)
  // Resolves "Why?", "How so?", "What makes that stronger?" to prior context
  // =========================================================================
  {
    id: 'B1_SIMPLE_WHY_CAREER',
    category: 'B_WHY_HOW',
    title: 'Single word "Why?" after career timing answer',
    history: [
      {
        user: 'When is my strongest career period?',
        assistantSummary: 'Your primary supportive career window runs from July 2026 to March 2028 during Moon-Venus.',
        domain: 'career',
        factors: ['Moon', 'Venus', '10th House'],
        timing: 'July 2026 to March 2028',
      },
    ],
    query: 'Why?',
    expectedDomain: 'career',
    expectedIntent: 'challenge_previous_conclusion',
    expectedExplanationRequested: true,
    expectedClarificationNeeded: false,
  },
  {
    id: 'B2_WHY_IS_THAT_TIMING',
    category: 'B_WHY_HOW',
    title: 'Follow-up asking "Why is that?" on promotion',
    history: [
      {
        user: 'Will I get promoted in 2027?',
        assistantSummary: '2027 shows strong planetary confluence for promotion.',
        domain: 'career',
        factors: ['Jupiter', '10th House'],
      },
    ],
    query: 'Why is that?',
    expectedDomain: 'career',
    expectedIntent: 'challenge_previous_conclusion',
    expectedExplanationRequested: true,
    expectedClarificationNeeded: false,
  },
  {
    id: 'B3_HOW_SO_MARRIAGE',
    category: 'B_WHY_HOW',
    title: 'Follow-up asking "How so?" on marriage prospects',
    history: [
      {
        user: 'When is marriage favorable?',
        assistantSummary: 'The upcoming Venus cycle creates a receptive relational climate.',
        domain: 'relationship',
        factors: ['Venus', '7th House'],
      },
    ],
    query: 'How so?',
    expectedDomain: 'relationship',
    expectedIntent: 'challenge_previous_conclusion',
    expectedExplanationRequested: true,
    expectedClarificationNeeded: false,
  },
  {
    id: 'B4_WHAT_MAKES_THAT_STRONGER',
    category: 'B_WHY_HOW',
    title: 'Follow-up asking "What makes that stronger?"',
    history: [
      {
        user: 'Which career phase is better?',
        assistantSummary: 'The late 2026 window is distinctly stronger than early 2026.',
        domain: 'career',
        factors: ['Jupiter', 'Moon-Venus'],
      },
    ],
    query: 'What makes that stronger?',
    expectedDomain: 'career',
    expectedExplanationRequested: true,
    expectedClarificationNeeded: false,
  },
  {
    id: 'B5_WHAT_MAKES_AUGUST_STRONGER',
    category: 'B_WHY_HOW',
    title: 'Follow-up asking "What makes August stronger?"',
    history: [
      {
        user: 'When is the peak promotion period?',
        assistantSummary: 'The window spans 2026 to 2028 with August showing strong activation.',
        domain: 'career',
        timing: 'August',
        factors: ['Jupiter transit', '10th House'],
      },
    ],
    query: 'What makes August stronger?',
    expectedDomain: 'career',
    expectedExplanationRequested: true,
    expectedClarificationNeeded: false,
  },
  {
    id: 'B6_WHY_SATURN_DISCIPLINE',
    category: 'B_WHY_HOW',
    title: 'Follow-up asking why Saturn enforces discipline',
    history: [
      {
        user: 'What does Saturn mean for my work?',
        assistantSummary: 'Saturn requires structural patience and slow consolidation.',
        domain: 'career',
        factors: ['Saturn'],
      },
    ],
    query: 'Why do you say that?',
    expectedDomain: 'career',
    expectedExplanationRequested: true,
    expectedClarificationNeeded: false,
  },
  {
    id: 'B7_HOW_DOES_THAT_WORK',
    category: 'B_WHY_HOW',
    title: 'Follow-up asking "How does that work?" for D10',
    history: [
      {
        user: 'How does D10 modify D1?',
        assistantSummary: 'D10 acts as a microscopic magnification of 10th house executive capacity.',
        domain: 'career',
        factors: ['D10', 'D1'],
      },
    ],
    query: 'How does that work in practice?',
    expectedDomain: 'career',
    expectedClarificationNeeded: false,
  },
  {
    id: 'B8_WHY_CHALLENGE_FAVORABLE',
    category: 'B_WHY_HOW',
    title: 'Challenging favorable assessment',
    history: [
      {
        user: 'Is 2027 favorable for wealth?',
        assistantSummary: 'Yes, 2027 shows favorable confluence for wealth accumulation.',
        domain: 'finance',
        factors: ['11th Lord', '2nd House'],
      },
    ],
    query: 'Why is it favorable?',
    expectedDomain: 'finance',
    expectedIntent: 'challenge_previous_conclusion',
    expectedExplanationRequested: true,
    expectedClarificationNeeded: false,
  },
  {
    id: 'B9_WHAT_DID_YOU_MEAN',
    category: 'B_WHY_HOW',
    title: 'Follow-up asking "What did you mean by that?"',
    history: [
      {
        user: 'Will I travel abroad?',
        assistantSummary: 'Rahu dasha sub-periods can trigger sudden foreign relocation.',
        domain: 'career',
        factors: ['Rahu', '12th House'],
      },
    ],
    query: 'What did you mean by sudden relocation?',
    expectedExplanationRequested: false,
    expectedClarificationNeeded: false,
  },
  {
    id: 'B10_WHY_NO_PRIOR_CONTEXT_HALT',
    category: 'B_WHY_HOW',
    title: '"Why?" without any prior history triggers graceful clarification halt',
    history: [],
    query: 'Why?',
    expectedClarificationNeeded: true,
    expectedClarificationReasonSnippet: 'No previous statement exists',
  },

  // =========================================================================
  // CATEGORY C: TEMPORAL REFERENCES (10 Tests)
  // Resolves "this period", "August", "2027", "next year"
  // =========================================================================
  {
    id: 'C1_THIS_PERIOD_RESOLVES_PREV_DASHA',
    category: 'C_TEMPORAL',
    title: '"this period" resolves to previously identified Dasha window',
    history: [
      {
        user: 'When is my strongest career period?',
        assistantSummary: 'Your supportive window runs July 2026 to March 2028.',
        domain: 'career',
        timing: 'July 2026 to March 2028',
      },
    ],
    query: 'How should I prepare for this period?',
    expectedDomain: 'career',
    expectedTemporalType: 'prior_confluence_window',
    expectedClarificationNeeded: false,
  },
  {
    id: 'C2_THAT_PERIOD_RESOLVES_WINDOW',
    category: 'C_TEMPORAL',
    title: '"that period" resolves to previously identified window',
    history: [
      {
        user: 'Is 2027 good for marriage?',
        assistantSummary: 'Mid-2027 shows strong 7th house activation.',
        domain: 'relationship',
        timing: 'Mid-2027',
      },
    ],
    query: 'What challenges might arise during that period?',
    expectedDomain: 'relationship',
    expectedTemporalType: 'prior_confluence_window',
    expectedClarificationNeeded: false,
  },
  {
    id: 'C3_WHAT_ABOUT_AUGUST',
    category: 'C_TEMPORAL',
    title: '"What about August?" resolves to specific month focus',
    history: [
      {
        user: 'When is promotion strongest in 2026?',
        assistantSummary: 'Summer 2026 has strong transit support.',
        domain: 'career',
      },
    ],
    query: 'What about August?',
    expectedDomain: 'career',
    expectedTemporalType: 'month_focus',
    expectedClarificationNeeded: false,
  },
  {
    id: 'C4_WHAT_ABOUT_2027',
    category: 'C_TEMPORAL',
    title: '"What about 2027?" resolves year scope',
    history: [
      {
        user: 'How is my job in 2026?',
        assistantSummary: '2026 requires steady foundational effort.',
        domain: 'career',
      },
    ],
    query: 'What about 2027?',
    expectedDomain: 'career',
    expectedTemporalType: 'year_focus',
    expectedClarificationNeeded: false,
  },
  {
    id: 'C5_STRONGER_WINDOW_REFERENCE',
    category: 'C_TEMPORAL',
    title: '"the stronger window" resolves to identified confluence period',
    history: [
      {
        user: 'Compare early 2026 vs late 2026 for promotion',
        assistantSummary: 'Late 2026 (September to December) is distinctly stronger.',
        domain: 'career',
        timing: 'September to December 2026',
      },
    ],
    query: 'Will the stronger window bring new offers?',
    expectedDomain: 'career',
    expectedTemporalType: 'prior_confluence_window',
    expectedClarificationNeeded: false,
  },
  {
    id: 'C6_NEXT_YEAR_INQUIRY',
    category: 'C_TEMPORAL',
    title: '"next year" inherits current domain',
    history: [
      {
        user: 'What does Saturn mean for work right now?',
        assistantSummary: 'Saturn brings heavy responsibilities currently.',
        domain: 'career',
      },
    ],
    query: 'Does that ease next year?',
    expectedDomain: 'career',
    expectedClarificationNeeded: false,
  },
  {
    id: 'C7_LATER_IN_THE_YEAR',
    category: 'C_TEMPORAL',
    title: '"later in the year" preserves career domain',
    history: [
      {
        user: 'I was rejected this month.',
        assistantSummary: 'Current transits are restrictive but shift later in the year.',
        domain: 'career',
      },
    ],
    query: 'When later in the year does it shift?',
    expectedDomain: 'career',
    expectedClarificationNeeded: false,
  },
  {
    id: 'C8_THAT_WINDOW_MARRIAGE',
    category: 'C_TEMPORAL',
    title: '"that window" preserves marriage domain',
    history: [
      {
        user: 'When is marriage favorable?',
        assistantSummary: 'The favorable window opens in November 2026.',
        domain: 'relationship',
        timing: 'November 2026',
      },
    ],
    query: 'Can engagement happen during that window?',
    expectedDomain: 'relationship',
    expectedTemporalType: 'prior_confluence_window',
    expectedClarificationNeeded: false,
  },
  {
    id: 'C9_MONTH_AFTER_NEXT',
    category: 'C_TEMPORAL',
    title: 'Relative temporal inquiry',
    history: [
      {
        user: 'How is my business in August?',
        assistantSummary: 'August is active for sales.',
        domain: 'career',
      },
    ],
    query: 'What about September?',
    expectedDomain: 'career',
    expectedClarificationNeeded: false,
  },
  {
    id: 'C10_THAT_PERIOD_NO_PRIOR_TIMING_HALT',
    category: 'C_TEMPORAL',
    title: '"What about that period?" without any identifiable prior period halts for clarification',
    history: [
      {
        user: 'Tell me about Jupiter in Cancer.',
        assistantSummary: 'Jupiter is exalted in Cancer bringing wisdom and expansive vision.',
        domain: 'general',
        factors: ['Jupiter', 'Cancer'],
      },
    ],
    query: 'What about that period?',
    expectedClarificationNeeded: true,
    expectedClarificationReasonSnippet: 'No specific timeframe',
  },

  // =========================================================================
  // CATEGORY D: PRONOUN / REFERENCE RESOLUTION (10 Tests)
  // Resolves "it", "they", "that planet", "that yoga"
  // =========================================================================
  {
    id: 'D1_IT_RESOLVES_SINGLE_PLANET_JUPITER',
    category: 'D_PRONOUN_REFERENCE',
    title: '"it" resolves cleanly when only one planet (Jupiter) was discussed',
    history: [
      {
        user: 'How does Jupiter affect my career?',
        assistantSummary: 'Jupiter expands professional visibility and authority.',
        domain: 'career',
        factors: ['Jupiter'],
      },
    ],
    query: 'What house does it rule?',
    expectedDomain: 'career',
    expectedEntity: 'Jupiter',
    expectedClarificationNeeded: false,
  },
  {
    id: 'D2_IT_RESOLVES_SINGLE_PLANET_SATURN',
    category: 'D_PRONOUN_REFERENCE',
    title: '"it" resolves cleanly when only one planet (Saturn) was discussed',
    history: [
      {
        user: 'What does Saturn mean for work?',
        assistantSummary: 'Saturn demands discipline and endurance.',
        domain: 'career',
        factors: ['Saturn'],
      },
    ],
    query: 'How long will it remain there?',
    expectedDomain: 'career',
    expectedEntity: 'Saturn',
    expectedClarificationNeeded: false,
  },
  {
    id: 'D3_THAT_PLANET_VENUS',
    category: 'D_PRONOUN_REFERENCE',
    title: '"that planet" resolves to recently discussed Venus',
    history: [
      {
        user: 'What does Venus indicate in my chart?',
        assistantSummary: 'Venus in Libra confers diplomatic finesse and artistic balance.',
        domain: 'relationship',
        factors: ['Venus'],
      },
    ],
    query: 'Does that planet help my career too?',
    expectedDomain: 'career',
    expectedEntity: 'Venus',
    expectedDomainSwitched: true,
    expectedClarificationNeeded: false,
  },
  {
    id: 'D4_THAT_YOGA_BUDHADITYA',
    category: 'D_PRONOUN_REFERENCE',
    title: '"that yoga" resolves to Budhaditya Yoga',
    history: [
      {
        user: 'Do I have Budhaditya Yoga?',
        assistantSummary: 'Yes, Budhaditya Yoga is formed by Sun and Mercury in Libra.',
        domain: 'general',
        factors: ['Budhaditya Yoga'],
      },
    ],
    query: 'When does that yoga give results?',
    expectedEntity: 'Budhaditya Yoga',
    expectedClarificationNeeded: false,
  },
  {
    id: 'D5_THIS_PLACEMENT_D10_LAGNA',
    category: 'D_PRONOUN_REFERENCE',
    title: '"this placement" resolves to Taurus D10 Lagna',
    history: [
      {
        user: 'What is my D10 Lagna?',
        assistantSummary: 'Your D10 Lagna is Taurus providing steady practical grounding.',
        domain: 'career',
        factors: ['D10 Lagna'],
      },
    ],
    query: 'Does this placement favor civil service?',
    expectedDomain: 'career',
    expectedEntity: 'D10 Lagna',
    expectedClarificationNeeded: false,
  },
  {
    id: 'D6_THEY_RESOLVES_RAJA_YOGA_LORDS',
    category: 'D_PRONOUN_REFERENCE',
    title: '"they" resolves to Kendra-Trikona lords',
    history: [
      {
        user: 'What creates Raja Yoga in my chart?',
        assistantSummary: 'Kendra and Trikona lords join in harmonious conjunction.',
        domain: 'general',
        factors: ['Kendra-Trikona Lords'],
      },
    ],
    query: 'Which houses do they rule?',
    expectedClarificationNeeded: false,
  },
  {
    id: 'D7_THAT_TRANSIT_JUPITER',
    category: 'D_PRONOUN_REFERENCE',
    title: '"that transit" resolves to Jupiter Gochara',
    history: [
      {
        user: 'How does Jupiter transit support my promotion?',
        assistantSummary: 'Jupiter transits the 10th house activating authority.',
        domain: 'career',
        factors: ['Jupiter Transit'],
      },
    ],
    query: 'When does that transit finish?',
    expectedDomain: 'career',
    expectedClarificationNeeded: false,
  },
  {
    id: 'D8_EARLIER_ONE_RESOLVES_PRIOR_WINDOW',
    category: 'D_PRONOUN_REFERENCE',
    title: '"the earlier one" resolves to first mentioned window',
    history: [
      {
        user: 'Compare 2026 vs 2028 for job change',
        assistantSummary: '2026 has subtle preparation while 2028 has visible fruition.',
        domain: 'career',
        timing: '2026',
      },
    ],
    query: 'What should I do during the earlier one?',
    expectedDomain: 'career',
    expectedClarificationNeeded: false,
  },
  {
    id: 'D9_IT_RESOLVES_MOON_SIGN',
    category: 'D_PRONOUN_REFERENCE',
    title: '"it" resolves to Moon sign',
    history: [
      {
        user: 'What is my Moon sign?',
        assistantSummary: 'Your Moon sign is Sagittarius at 09° 41\'.',
        domain: 'general',
        factors: ['Moon'],
      },
    ],
    query: 'What nakshatra is it in?',
    expectedEntity: 'Moon',
    expectedClarificationNeeded: false,
  },
  {
    id: 'D10_AMBIGUOUS_IT_MULTIPLE_PLANETS_HALT',
    category: 'D_PRONOUN_REFERENCE',
    title: '"What about it?" when both Jupiter and Saturn were discussed triggers clarification halt',
    history: [
      {
        user: 'Tell me about Jupiter and Saturn in my chart.',
        assistantSummary: 'Jupiter provides expansive momentum while Saturn enforces structural responsibility.',
        domain: 'career',
        factors: ['Jupiter', 'Saturn'],
      },
    ],
    query: 'What about it?',
    expectedClarificationNeeded: true,
    expectedClarificationReasonSnippet: 'both Jupiter and Saturn',
  },

  // =========================================================================
  // CATEGORY E: DOMAIN SWITCHING (5 Tests)
  // Clean transitions between domains without losing consultation continuity
  // =========================================================================
  {
    id: 'E1_CAREER_TO_MARRIAGE_SWITCH',
    category: 'E_DOMAIN_SWITCH',
    title: 'Switch from career to marriage',
    history: [
      {
        user: 'How is my career looking in 2027?',
        assistantSummary: '2027 is a supportive career window with promotion momentum.',
        domain: 'career',
        factors: ['Jupiter', '10th House'],
      },
    ],
    query: 'What about marriage?',
    expectedDomain: 'relationship',
    expectedDomainSwitched: true,
    expectedClarificationNeeded: false,
  },
  {
    id: 'E2_MARRIAGE_TO_FINANCE_SWITCH',
    category: 'E_DOMAIN_SWITCH',
    title: 'Switch from marriage to wealth/finance',
    history: [
      {
        user: 'When is marriage favorable?',
        assistantSummary: 'Late 2026 favors marriage.',
        domain: 'relationship',
        factors: ['Venus', '7th House'],
      },
    ],
    query: 'How does that period look for money and wealth?',
    expectedDomain: 'finance',
    expectedDomainSwitched: true,
    expectedClarificationNeeded: false,
  },
  {
    id: 'E3_FINANCE_TO_SPIRITUALITY_SWITCH',
    category: 'E_DOMAIN_SWITCH',
    title: 'Switch from finance to spirituality',
    history: [
      {
        user: 'What are my financial prospects?',
        assistantSummary: 'Gains are strong in 11th house.',
        domain: 'finance',
        factors: ['11th House'],
      },
    ],
    query: 'What about my spiritual path and dharma?',
    expectedDomain: 'spirituality',
    expectedDomainSwitched: true,
    expectedClarificationNeeded: false,
  },
  {
    id: 'E4_SPIRITUALITY_TO_CAREER_SWITCH',
    category: 'E_DOMAIN_SWITCH',
    title: 'Switch from spirituality back to career',
    history: [
      {
        user: 'What does my 12th house indicate for meditation?',
        assistantSummary: '12th house fosters inner reflection.',
        domain: 'spirituality',
        factors: ['12th House'],
      },
    ],
    query: 'Can I integrate this into my corporate profession?',
    expectedDomain: 'career',
    expectedDomainSwitched: true,
    expectedClarificationNeeded: false,
  },
  {
    id: 'E5_HEALTH_TO_RELATIONSHIP_SWITCH',
    category: 'E_DOMAIN_SWITCH',
    title: 'Switch from health to relationship',
    history: [
      {
        user: 'How is my health and vitality?',
        assistantSummary: 'Vitality is steady with proper discipline.',
        domain: 'health',
        factors: ['Sun'],
      },
    ],
    query: 'How does this affect my marriage partner?',
    expectedDomain: 'relationship',
    expectedDomainSwitched: true,
    expectedClarificationNeeded: false,
  },

  // =========================================================================
  // CATEGORY F: PREVIOUS CLAIM CHALLENGE (5 Tests)
  // Retrieves prior claim statement and context without hallucination
  // =========================================================================
  {
    id: 'F1_CHALLENGE_2027_CLAIM',
    category: 'F_CLAIM_CHALLENGE',
    title: 'User challenges "You said 2027 was strongest"',
    history: [
      {
        user: 'When is my best career window?',
        assistantSummary: '2027 has strongest career confluence.',
        domain: 'career',
        timing: '2027',
        claims: [
          {
            id: 'claim_c1_2027',
            statement: '2027 has strongest career confluence under Moon-Venus dasha',
            entities: ['2027', 'Moon', 'Venus'],
          },
        ],
      },
    ],
    query: 'You said 2027 was strongest. Why?',
    expectedDomain: 'career',
    expectedExplanationRequested: true,
    expectedClarificationNeeded: false,
  },
  {
    id: 'F2_CHALLENGE_JUPITER_SUPPORT',
    category: 'F_CLAIM_CHALLENGE',
    title: 'User challenges "Earlier you said Jupiter was supportive"',
    history: [
      {
        user: 'Is Jupiter favorable?',
        assistantSummary: 'Jupiter provides expansive promotion momentum in 10th house.',
        domain: 'career',
        factors: ['Jupiter'],
        claims: [
          {
            id: 'claim_c2_jup',
            statement: 'Jupiter provides expansive promotion momentum in 10th house',
            entities: ['Jupiter'],
          },
        ],
      },
    ],
    query: 'Earlier you said Jupiter was supportive. Why?',
    expectedDomain: 'career',
    expectedEntity: 'Jupiter',
    expectedExplanationRequested: true,
    expectedClarificationNeeded: false,
  },
  {
    id: 'F3_CHALLENGE_SATURN_BURDEN',
    category: 'F_CLAIM_CHALLENGE',
    title: 'User challenges assertion of Saturn burden',
    history: [
      {
        user: 'Why is work so heavy?',
        assistantSummary: 'Saturn enforces discipline and patience in your career.',
        domain: 'career',
        factors: ['Saturn'],
      },
    ],
    query: 'Earlier you said Saturn was causing this. Can you explain that?',
    expectedDomain: 'career',
    expectedEntity: 'Saturn',
    expectedClarificationNeeded: false,
  },
  {
    id: 'F4_CHALLENGE_TIMING_DISAGREEMENT',
    category: 'F_CLAIM_CHALLENGE',
    title: 'User questions timing accuracy respectfully',
    history: [
      {
        user: 'When does promotion happen?',
        assistantSummary: 'The primary window activates July 2026 to March 2028.',
        domain: 'career',
        timing: 'July 2026 to March 2028',
      },
    ],
    query: 'I think your earlier timing was wrong. Why did you pick 2026?',
    expectedDomain: 'career',
    expectedClarificationNeeded: false,
  },
  {
    id: 'F5_CHALLENGE_AUGUST_VS_SEPTEMBER',
    category: 'F_CLAIM_CHALLENGE',
    title: 'User challenges month shift',
    history: [
      {
        user: 'Is August good?',
        assistantSummary: 'August has strong transit confluence.',
        domain: 'career',
        claims: [{ id: 'claim_c5_aug', statement: 'August has strong transit confluence', entities: ['August'] }],
      },
    ],
    query: 'Earlier you said August, but now you said September. Why?',
    expectedDomain: 'career',
    expectedExplanationRequested: true,
    expectedClarificationNeeded: false,
  },

  // =========================================================================
  // CATEGORY G: CORRECTION HANDLING (5 Tests)
  // Overrides obsolete claims and records explicit corrections
  // =========================================================================
  {
    id: 'G1_CORRECTION_JUPITER_VS_SATURN',
    category: 'G_CORRECTION',
    title: 'User highlights Jupiter vs Saturn distinction',
    history: [
      {
        user: 'What drives my career?',
        assistantSummary: 'Jupiter drives expansion.',
        domain: 'career',
        factors: ['Jupiter'],
      },
      {
        user: 'Why is work so hard?',
        assistantSummary: 'Saturn enforces heavy structural responsibility.',
        domain: 'career',
        factors: ['Saturn'],
      },
    ],
    query: 'Earlier you said Jupiter was strongest, now you are saying Saturn.',
    expectedDomain: 'career',
    expectedClarificationNeeded: false,
  },
  {
    id: 'G2_USER_CORRECTION_WRONG_MONTH',
    category: 'G_CORRECTION',
    title: 'User corrects previously misstated timing assumption',
    history: [
      {
        user: 'When is my appraisal?',
        assistantSummary: 'Your appraisal window activates around August.',
        domain: 'career',
      },
    ],
    query: 'Actually my appraisal is in October, not August. What does October show?',
    expectedDomain: 'career',
    expectedClarificationNeeded: false,
  },
  {
    id: 'G3_USER_CORRECTION_JOB_TITLE',
    category: 'G_CORRECTION',
    title: 'User clarifies current role context',
    history: [
      {
        user: 'Will I get into management?',
        assistantSummary: '10th house authority supports executive management.',
        domain: 'career',
      },
    ],
    query: 'Actually I am in individual technical consulting, not management. Does D10 still apply?',
    expectedDomain: 'career',
    expectedClarificationNeeded: false,
  },
  {
    id: 'G4_CONTRADICTION_MOON_VS_RAHU_DASHA',
    category: 'G_CORRECTION',
    title: 'Clarifying hierarchical dasha lords without contradiction',
    history: [
      {
        user: 'What dasha am I in?',
        assistantSummary: 'You are running Moon Mahadasha with Venus Antardasha.',
        domain: 'timing',
        factors: ['Moon', 'Venus'],
      },
    ],
    query: 'Earlier you said Moon dasha, but someone else said Venus. Are they contradictory?',
    expectedDomain: 'timing',
    expectedClarificationNeeded: false,
  },
  {
    id: 'G5_RETRIEVE_EARLIER_THREAD_AFTER_SWITCH',
    category: 'G_CORRECTION',
    title: 'Retrieving earlier career thread after relationship discussion',
    history: [
      {
        user: 'How is my career?',
        assistantSummary: 'Career is supported by Jupiter transit in 10th house.',
        domain: 'career',
        factors: ['Jupiter'],
      },
      {
        user: 'What about marriage?',
        assistantSummary: 'Marriage has supportive Venus cycle in late 2026.',
        domain: 'relationship',
        factors: ['Venus'],
      },
    ],
    query: 'What did you say about career earlier?',
    expectedDomain: 'career',
    expectedDomainSwitched: true,
    expectedClarificationNeeded: false,
  },

  // =========================================================================
  // CATEGORY H: AMBIGUOUS REFERENCES (5 Tests)
  // Unresolvable pronouns or candidate ambiguity halts with targeted options
  // =========================================================================
  {
    id: 'H1_WHAT_ABOUT_IT_MULTIPLE_PLANETS',
    category: 'H_AMBIGUOUS',
    title: '"What about it?" with multiple active planets triggers clarification',
    history: [
      {
        user: 'Tell me about Jupiter and Saturn.',
        assistantSummary: 'Jupiter brings expansion while Saturn enforces patience.',
        domain: 'career',
        factors: ['Jupiter', 'Saturn'],
      },
    ],
    query: 'What about it?',
    expectedClarificationNeeded: true,
    expectedClarificationReasonSnippet: 'both Jupiter and Saturn',
  },
  {
    id: 'H2_WHAT_ABOUT_THAT_PERIOD_NO_TIMING',
    category: 'H_AMBIGUOUS',
    title: '"What about that period?" with no established timeframe triggers clarification',
    history: [
      {
        user: 'What does Venus in Libra indicate?',
        assistantSummary: 'Venus in Libra confers charm, artistic balance, and diplomatic tact.',
        domain: 'general',
        factors: ['Venus'],
      },
    ],
    query: 'What about that period?',
    expectedClarificationNeeded: true,
    expectedClarificationReasonSnippet: 'No specific timeframe',
  },
  {
    id: 'H3_SAME_THING_MULTIPLE_FACTORS',
    category: 'H_AMBIGUOUS',
    title: '"What about the same thing?" with multiple prior factors triggers clarification',
    history: [
      {
        user: 'Tell me about Sun, Moon, and Mercury.',
        assistantSummary: 'Sun is debilitated in Libra, Moon is in Sagittarius, and Mercury forms Budhaditya.',
        domain: 'general',
        factors: ['Sun', 'Moon', 'Mercury'],
      },
    ],
    query: 'What about the same thing for career?',
    expectedDomain: 'career',
    expectedClarificationNeeded: true,
    expectedClarificationReasonSnippet: 'Multiple astrological topics',
  },
  {
    id: 'H4_UNRESOLVED_PRONOUN_NO_PRIOR_ENTITY',
    category: 'H_AMBIGUOUS',
    title: '"Is it good?" at consultation start without antecedent triggers clarification',
    history: [],
    query: 'Is it good?',
    expectedClarificationNeeded: true,
  },
  {
    id: 'H5_WHAT_NEXT_GENERIC_HALT',
    category: 'H_AMBIGUOUS',
    title: '"What next?" without topic anchor triggers clarification',
    history: [],
    query: 'What next?',
    expectedClarificationNeeded: true,
  },
];
