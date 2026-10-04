/**
 * ASTROWORLD AI V2 — Phase 5C Longitudinal Memory Benchmark
 * Defines 40 Comprehensive Multi-Session Longitudinal Scenarios (Categories A-H)
 * plus 15 Real End-to-End Gemini Longitudinal Scenarios.
 * Tests long-term memory continuity, conflict superseding, cross-domain isolation,
 * astrology memory firewall revalidation, privacy isolation, and memory control.
 */

import { BirthProfile } from '../schemas/birthProfile.ts';
import { MemoryCategory } from './persistentMemoryTypes.ts';

export const LONGITUDINAL_BENCHMARK_PROFILE: BirthProfile = {
  name: 'Longitudinal Benchmark Subject',
  year: 1990,
  month: 10,
  day: 24,
  hour: 14,
  minute: 30,
  second: 0,
  latitude: 28.6139,
  longitude: 77.209,
  timezone: 'Asia/Kolkata',
  gender: 'male',
};

export interface LongitudinalStep {
  userQuery: string;
  expectedMemoryKey?: string;
  expectedMemoryCategory?: MemoryCategory;
  expectedSubstringInResponse?: string;
  prohibitedSubstringInResponse?: string;
}

export interface LongitudinalSession {
  sessionLabel: string;
  conversationId: string;
  userId?: string;
  steps: LongitudinalStep[];
}

export interface LongitudinalScenario {
  id: string;
  category:
    | 'CAREER_CONTINUITY'
    | 'CHANGED_CAREER_GOAL'
    | 'THREAD_CONTINUITY'
    | 'CROSS_DOMAIN_ISOLATION'
    | 'ASTROLOGY_INVALIDATION'
    | 'USER_CORRECTION'
    | 'EXPLICIT_CONTROL'
    | 'PRIVACY_ISOLATION';
  title: string;
  description: string;
  userId: string;
  preSeededMemories?: Array<{
    memoryId: string;
    category: MemoryCategory;
    key: string;
    value: string;
    sourceType: 'user_explicit' | 'assistant_derived';
    sourceTrust: 'USER_CONFIRMED' | 'HISTORICAL_INTERPRETATION';
    validationStatus: 'validated' | 'requires_recheck';
    tags?: string[];
  }>;
  sessions: LongitudinalSession[];
  finalAssertions: {
    expectedActiveKeys?: string[];
    prohibitedActiveKeys?: string[];
    expectedMemoryValues?: Record<string, string>;
    exactActiveCount?: number;
  };
}

export const LONGITUDINAL_BENCHMARK_SCENARIOS: LongitudinalScenario[] = [
  // =========================================================================
  // CATEGORY A: CAREER CONTINUITY (5 Scenarios)
  // =========================================================================
  {
    id: 'LONGITUDINAL_A1_AI_ENGINEERING_RECALL',
    category: 'CAREER_CONTINUITY',
    title: 'AI Engineering Leadership Goal Multi-Session Recall',
    description: 'User states career goal in Session 1, then queries what was shared in Session 2 days later',
    userId: 'user_long_a1',
    sessions: [
      {
        sessionLabel: 'Session 1 (Day 1)',
        conversationId: 'conv_a1_s1',
        steps: [
          {
            userQuery: 'I am preparing for AI engineering leadership roles in late 2026.',
            expectedMemoryKey: 'career_goal',
            expectedMemoryCategory: 'USER_FACT',
          },
        ],
      },
      {
        sessionLabel: 'Session 2 (Day 14)',
        conversationId: 'conv_a1_s2',
        steps: [
          {
            userQuery: 'What kind of career path did I tell you I was targeting?',
            expectedSubstringInResponse: 'AI engineering',
          },
        ],
      },
    ],
    finalAssertions: {
      expectedActiveKeys: ['career_goal'],
    },
  },
  {
    id: 'LONGITUDINAL_A2_ENTERPRISE_ARCHITECT_RECALL',
    category: 'CAREER_CONTINUITY',
    title: 'Enterprise Architect Profession Multi-Session Recall',
    description: 'User states profession in Session 1, then queries it in Session 2',
    userId: 'user_long_a2',
    sessions: [
      {
        sessionLabel: 'Session 1 (Day 1)',
        conversationId: 'conv_a2_s1',
        steps: [
          {
            userQuery: 'I work as an Enterprise Architect in banking infrastructure.',
            expectedMemoryKey: 'current_profession',
            expectedMemoryCategory: 'USER_FACT',
          },
        ],
      },
      {
        sessionLabel: 'Session 2 (Day 7)',
        conversationId: 'conv_a2_s2',
        steps: [
          {
            userQuery: 'What is my current profession?',
            expectedSubstringInResponse: 'Enterprise Architect',
          },
        ],
      },
    ],
    finalAssertions: {
      expectedActiveKeys: ['current_profession'],
    },
  },
  {
    id: 'LONGITUDINAL_A3_STARTUP_TRANSITION_RECALL',
    category: 'CAREER_CONTINUITY',
    title: 'Healthtech Startup Transition Goal Multi-Session Recall',
    description: 'User expresses startup plans in Session 1 and recalls them in Session 2',
    userId: 'user_long_a3',
    sessions: [
      {
        sessionLabel: 'Session 1 (Day 1)',
        conversationId: 'conv_a3_s1',
        steps: [
          {
            userQuery: 'I am aiming for founding a healthtech startup next year.',
            expectedMemoryKey: 'career_goal',
          },
        ],
      },
      {
        sessionLabel: 'Session 2 (Day 21)',
        conversationId: 'conv_a3_s2',
        steps: [
          {
            userQuery: 'What did I say about my startup plans?',
            expectedSubstringInResponse: 'healthtech startup',
          },
        ],
      },
    ],
    finalAssertions: {
      expectedActiveKeys: ['career_goal'],
    },
  },
  {
    id: 'LONGITUDINAL_A4_REMOTE_LOCATION_RECALL',
    category: 'CAREER_CONTINUITY',
    title: 'Remote Singapore Location Context Recall',
    description: 'User mentions global remote roles from Singapore in Session 1, verifies recall in Session 2',
    userId: 'user_long_a4',
    sessions: [
      {
        sessionLabel: 'Session 1 (Day 1)',
        conversationId: 'conv_a4_s1',
        steps: [
          {
            userQuery: 'I am preparing for remote global roles from Singapore.',
            expectedMemoryKey: 'career_goal',
          },
        ],
      },
      {
        sessionLabel: 'Session 2 (Day 10)',
        conversationId: 'conv_a4_s2',
        steps: [
          {
            userQuery: 'What did I share about my location and role preference?',
            expectedSubstringInResponse: 'Singapore',
          },
        ],
      },
    ],
    finalAssertions: {
      expectedActiveKeys: ['career_goal'],
    },
  },
  {
    id: 'LONGITUDINAL_A5_EXECUTIVE_LEADERSHIP_RECALL',
    category: 'CAREER_CONTINUITY',
    title: 'Chief Technology Officer Target Role Recall',
    description: 'User targets CTO role in Session 1, asks about targeted position in Session 2',
    userId: 'user_long_a5',
    sessions: [
      {
        sessionLabel: 'Session 1 (Day 1)',
        conversationId: 'conv_a5_s1',
        steps: [
          {
            userQuery: 'I am targeting Chief Technology Officer positions.',
            expectedMemoryKey: 'career_goal',
          },
        ],
      },
      {
        sessionLabel: 'Session 2 (Day 30)',
        conversationId: 'conv_a5_s2',
        steps: [
          {
            userQuery: 'What role am I targeting?',
            expectedSubstringInResponse: 'Chief Technology Officer',
          },
        ],
      },
    ],
    finalAssertions: {
      expectedActiveKeys: ['career_goal'],
    },
  },

  // =========================================================================
  // CATEGORY B: CHANGED CAREER GOAL (5 Scenarios)
  // =========================================================================
  {
    id: 'LONGITUDINAL_B1_BACKEND_TO_AI',
    category: 'CHANGED_CAREER_GOAL',
    title: 'Backend to AI Engineering Target Evolution',
    description: 'Session 1: Backend roles; Session 2: Switches to AI engineering; Session 3: Verifies superseding',
    userId: 'user_long_b1',
    sessions: [
      {
        sessionLabel: 'Session 1 (Month 1)',
        conversationId: 'conv_b1_s1',
        steps: [
          {
            userQuery: 'I am targeting backend infrastructure roles.',
            expectedMemoryKey: 'career_goal',
          },
        ],
      },
      {
        sessionLabel: 'Session 2 (Month 2)',
        conversationId: 'conv_b1_s2',
        steps: [
          {
            userQuery: 'Actually I am targeting AI engineering research now.',
            expectedMemoryKey: 'career_goal',
          },
        ],
      },
      {
        sessionLabel: 'Session 3 (Month 3)',
        conversationId: 'conv_b1_s3',
        steps: [
          {
            userQuery: 'What career direction am I targeting now?',
            expectedSubstringInResponse: 'AI engineering',
            prohibitedSubstringInResponse: 'backend infrastructure',
          },
        ],
      },
    ],
    finalAssertions: {
      expectedActiveKeys: ['career_goal'],
      expectedMemoryValues: { career_goal: 'Targeting AI engineering research now' },
    },
  },
  {
    id: 'LONGITUDINAL_B2_PM_TO_FOUNDER',
    category: 'CHANGED_CAREER_GOAL',
    title: 'Product Manager to Startup Founder Evolution',
    description: 'Session 1: Product Manager; Session 2: Startup founder; Session 3: Confirms founder active',
    userId: 'user_long_b2',
    sessions: [
      {
        sessionLabel: 'Session 1',
        conversationId: 'conv_b2_s1',
        steps: [
          {
            userQuery: 'I am preparing for Senior Product Manager interviews.',
            expectedMemoryKey: 'career_goal',
          },
        ],
      },
      {
        sessionLabel: 'Session 2',
        conversationId: 'conv_b2_s2',
        steps: [
          {
            userQuery: 'Actually I am preparing for full-time startup founder roles.',
            expectedMemoryKey: 'career_goal',
          },
        ],
      },
      {
        sessionLabel: 'Session 3',
        conversationId: 'conv_b2_s3',
        steps: [
          {
            userQuery: 'What did I tell you about my career goal?',
            expectedSubstringInResponse: 'startup founder',
            prohibitedSubstringInResponse: 'Product Manager',
          },
        ],
      },
    ],
    finalAssertions: {
      expectedActiveKeys: ['career_goal'],
      expectedMemoryValues: { career_goal: 'Targeting full-time startup founder roles' },
    },
  },
  {
    id: 'LONGITUDINAL_B3_LITIGATOR_TO_LEGALTECH',
    category: 'CHANGED_CAREER_GOAL',
    title: 'Litigator to LegalTech Consulting Evolution',
    description: 'Session 1: Corporate litigator; Session 2: Switches to legaltech consulting',
    userId: 'user_long_b3',
    sessions: [
      {
        sessionLabel: 'Session 1',
        conversationId: 'conv_b3_s1',
        steps: [
          {
            userQuery: 'I work as a corporate litigator.',
            expectedMemoryKey: 'current_profession',
          },
        ],
      },
      {
        sessionLabel: 'Session 2',
        conversationId: 'conv_b3_s2',
        steps: [
          {
            userQuery: 'Actually I am switching to legaltech consulting.',
            expectedMemoryKey: 'career_goal',
          },
        ],
      },
      {
        sessionLabel: 'Session 3',
        conversationId: 'conv_b3_s3',
        steps: [
          {
            userQuery: 'What am I targeting now?',
            expectedSubstringInResponse: 'legaltech consulting',
          },
        ],
      },
    ],
    finalAssertions: {
      expectedActiveKeys: ['career_goal'],
    },
  },
  {
    id: 'LONGITUDINAL_B4_QUANT_TO_CRYPTOGRAPHY',
    category: 'CHANGED_CAREER_GOAL',
    title: 'Quant Trading to Cryptography Evolution',
    description: 'Session 1: Quant trading; Session 2: Cryptography research',
    userId: 'user_long_b4',
    sessions: [
      {
        sessionLabel: 'Session 1',
        conversationId: 'conv_b4_s1',
        steps: [
          {
            userQuery: 'I am targeting quantitative trading roles.',
            expectedMemoryKey: 'career_goal',
          },
        ],
      },
      {
        sessionLabel: 'Session 2',
        conversationId: 'conv_b4_s2',
        steps: [
          {
            userQuery: 'Actually I am targeting cryptography research.',
            expectedMemoryKey: 'career_goal',
          },
        ],
      },
      {
        sessionLabel: 'Session 3',
        conversationId: 'conv_b4_s3',
        steps: [
          {
            userQuery: 'What am I targeting now?',
            expectedSubstringInResponse: 'cryptography research',
            prohibitedSubstringInResponse: 'quantitative trading',
          },
        ],
      },
    ],
    finalAssertions: {
      expectedActiveKeys: ['career_goal'],
      expectedMemoryValues: { career_goal: 'Targeting cryptography research' },
    },
  },
  {
    id: 'LONGITUDINAL_B5_ANALYST_TO_ML_ENGINEER',
    category: 'CHANGED_CAREER_GOAL',
    title: 'Business Analyst to ML Engineer Evolution',
    description: 'Session 1: Data analyst; Session 2: ML engineering; Session 3: Verifies ML active',
    userId: 'user_long_b5',
    sessions: [
      {
        sessionLabel: 'Session 1',
        conversationId: 'conv_b5_s1',
        steps: [
          {
            userQuery: 'I am targeting business data analyst jobs.',
            expectedMemoryKey: 'career_goal',
          },
        ],
      },
      {
        sessionLabel: 'Session 2',
        conversationId: 'conv_b5_s2',
        steps: [
          {
            userQuery: 'Actually I am targeting machine learning engineering roles.',
            expectedMemoryKey: 'career_goal',
          },
        ],
      },
      {
        sessionLabel: 'Session 3',
        conversationId: 'conv_b5_s3',
        steps: [
          {
            userQuery: 'What am I targeting now?',
            expectedSubstringInResponse: 'machine learning engineering',
            prohibitedSubstringInResponse: 'business data analyst',
          },
        ],
      },
    ],
    finalAssertions: {
      expectedActiveKeys: ['career_goal'],
      expectedMemoryValues: { career_goal: 'Targeting machine learning engineering roles' },
    },
  },

  // =========================================================================
  // CATEGORY C: CONSULTATION THREAD CONTINUITY (5 Scenarios)
  // =========================================================================
  {
    id: 'LONGITUDINAL_C1_CAREER_PROMOTION_TIMING',
    category: 'THREAD_CONTINUITY',
    title: '2027 Promotion Window Thread Follow-up Across Sessions',
    description: 'Session 1: Identifies 2027 timing window; Session 2: Follows up on why that period is stronger',
    userId: 'user_long_c1',
    sessions: [
      {
        sessionLabel: 'Session 1 (Month 1)',
        conversationId: 'conv_c1_s1',
        steps: [
          {
            userQuery: 'When is my strongest career period?',
            expectedSubstringInResponse: '2027',
          },
        ],
      },
      {
        sessionLabel: 'Session 2 (Month 2)',
        conversationId: 'conv_c1_s2',
        steps: [
          {
            userQuery: 'What makes August stronger?',
            expectedSubstringInResponse: 'astrological confluence',
          },
        ],
      },
    ],
    finalAssertions: {
      expectedActiveKeys: ['career_promotion_timing_thread'],
    },
  },
  {
    id: 'LONGITUDINAL_C2_MARRIAGE_TIMING_THREAD',
    category: 'THREAD_CONTINUITY',
    title: 'Marriage Timing Thread Follow-up Across Sessions',
    description: 'Session 1: Identifies Moon-Venus marriage window; Session 2: Deepens relationship query',
    userId: 'user_long_c2',
    sessions: [
      {
        sessionLabel: 'Session 1',
        conversationId: 'conv_c2_s1',
        steps: [
          {
            userQuery: 'When is marriage timing stronger?',
            expectedSubstringInResponse: 'Moon–Venus',
          },
        ],
      },
      {
        sessionLabel: 'Session 2',
        conversationId: 'conv_c2_s2',
        steps: [
          {
            userQuery: 'When is marriage favorable according to my 7th house and Venus?',
            expectedSubstringInResponse: 'marriage',
          },
        ],
      },
    ],
    finalAssertions: {
      expectedActiveKeys: ['marriage_timing_thread'],
    },
  },
  {
    id: 'LONGITUDINAL_C3_JUPITER_D10_THREAD',
    category: 'THREAD_CONTINUITY',
    title: 'Jupiter D10 Influence Thread Follow-up Across Sessions',
    description: 'Session 1: Discusses Jupiter in D10; Session 2: Explores why Jupiter is supportive',
    userId: 'user_long_c3',
    sessions: [
      {
        sessionLabel: 'Session 1',
        conversationId: 'conv_c3_s1',
        steps: [
          {
            userQuery: 'How does Jupiter affect my career?',
            expectedSubstringInResponse: 'Jupiter',
          },
        ],
      },
      {
        sessionLabel: 'Session 2',
        conversationId: 'conv_c3_s2',
        steps: [
          {
            userQuery: 'Why are you saying Jupiter is supportive?',
            expectedSubstringInResponse: 'Jupiter is supportive',
          },
        ],
      },
    ],
    finalAssertions: {
      expectedActiveKeys: ['career_promotion_timing_thread'],
    },
  },
  {
    id: 'LONGITUDINAL_C4_SATURN_DISCIPLINE_THREAD',
    category: 'THREAD_CONTINUITY',
    title: 'Saturn Structural Discipline Thread Follow-up Across Sessions',
    description: 'Session 1: Explores Saturn in work; Session 2: Inquires why Saturn enforces discipline',
    userId: 'user_long_c4',
    sessions: [
      {
        sessionLabel: 'Session 1',
        conversationId: 'conv_c4_s1',
        steps: [
          {
            userQuery: 'What does Saturn mean for my work?',
            expectedSubstringInResponse: 'Saturn',
          },
        ],
      },
      {
        sessionLabel: 'Session 2',
        conversationId: 'conv_c4_s2',
        steps: [
          {
            userQuery: 'Why is Saturn considered a restriction?',
            expectedSubstringInResponse: 'discipline',
          },
        ],
      },
    ],
    finalAssertions: {
      expectedActiveKeys: ['career_promotion_timing_thread'],
    },
  },
  {
    id: 'LONGITUDINAL_C5_MULTI_YEAR_TRAJECTORY_THREAD',
    category: 'THREAD_CONTINUITY',
    title: 'Multi-Year 2027-2030 Trajectory Thread Follow-up',
    description: 'Session 1: Inquires about 2027-2030; Session 2: Follows up on multi-year career factors',
    userId: 'user_long_c5',
    sessions: [
      {
        sessionLabel: 'Session 1',
        conversationId: 'conv_c5_s1',
        steps: [
          {
            userQuery: 'How does 2027 to 2030 look for my career?',
            expectedSubstringInResponse: '2027 to 2030',
          },
        ],
      },
      {
        sessionLabel: 'Session 2',
        conversationId: 'conv_c5_s2',
        steps: [
          {
            userQuery: 'How does 2027 look like for my career?',
            expectedSubstringInResponse: '2027',
          },
        ],
      },
    ],
    finalAssertions: {
      expectedActiveKeys: ['career_promotion_timing_thread'],
    },
  },

  // =========================================================================
  // CATEGORY D: CROSS-DOMAIN ISOLATION (5 Scenarios)
  // =========================================================================
  {
    id: 'LONGITUDINAL_D1_CAREER_NOT_IN_MARRIAGE',
    category: 'CROSS_DOMAIN_ISOLATION',
    title: 'Career Software Architect Memory Excluded from Marriage Answer',
    description: 'Session 1: User stores software architect job; Session 2: Asks about marriage; no career leak',
    userId: 'user_long_d1',
    sessions: [
      {
        sessionLabel: 'Session 1',
        conversationId: 'conv_d1_s1',
        steps: [
          {
            userQuery: 'I work as a software architect in fintech.',
            expectedMemoryKey: 'current_profession',
          },
        ],
      },
      {
        sessionLabel: 'Session 2',
        conversationId: 'conv_d1_s2',
        steps: [
          {
            userQuery: 'When is marriage favorable according to my 7th house and Venus?',
            expectedSubstringInResponse: 'marriage',
            prohibitedSubstringInResponse: 'software architect',
          },
        ],
      },
    ],
    finalAssertions: {
      expectedActiveKeys: ['current_profession', 'marriage_timing_thread'],
    },
  },
  {
    id: 'LONGITUDINAL_D2_RELATIONSHIP_NOT_IN_CAREER',
    category: 'CROSS_DOMAIN_ISOLATION',
    title: 'Wedding Fact Excluded from Career Transit Analysis',
    description: 'Session 1: Wedding fact stored; Session 2: Career transit inquiry; no wedding leak',
    userId: 'user_long_d2',
    sessions: [
      {
        sessionLabel: 'Session 1',
        conversationId: 'conv_d2_s1',
        steps: [
          {
            userQuery: 'Remember that I am planning my wedding in late 2027.',
            expectedSubstringInResponse: 'will remember that',
          },
        ],
      },
      {
        sessionLabel: 'Session 2',
        conversationId: 'conv_d2_s2',
        steps: [
          {
            userQuery: 'How does Jupiter affect my career?',
            expectedSubstringInResponse: 'Jupiter',
            prohibitedSubstringInResponse: 'wedding',
          },
        ],
      },
    ],
    finalAssertions: {
      expectedActiveKeys: ['user_explicit_fact'],
    },
  },
  {
    id: 'LONGITUDINAL_D3_FINANCE_NOT_IN_SPIRITUALITY',
    category: 'CROSS_DOMAIN_ISOLATION',
    title: 'High Frequency Trading Fact Excluded from Dharma Inquiry',
    description: 'Session 1: High frequency trading target; Session 2: Spiritual dharma question; no trading leak',
    userId: 'user_long_d3',
    sessions: [
      {
        sessionLabel: 'Session 1',
        conversationId: 'conv_d3_s1',
        steps: [
          {
            userQuery: 'Remember that I am targeting high frequency trading investments.',
            expectedSubstringInResponse: 'will remember that',
          },
        ],
      },
      {
        sessionLabel: 'Session 2',
        conversationId: 'conv_d3_s2',
        steps: [
          {
            userQuery: 'Evaluating my dharmic and spiritual inclinations.',
            expectedSubstringInResponse: 'dharma',
            prohibitedSubstringInResponse: 'frequency trading',
          },
        ],
      },
    ],
    finalAssertions: {
      expectedActiveKeys: ['user_explicit_fact'],
    },
  },
  {
    id: 'LONGITUDINAL_D4_HEALTH_NOT_IN_BUSINESS',
    category: 'CROSS_DOMAIN_ISOLATION',
    title: 'Ayurvedic Diet Note Excluded from D10 Commercial Enterprise',
    description: 'Session 1: Diet fact; Session 2: D10 business inquiry; no digestion/diet leak',
    userId: 'user_long_d4',
    sessions: [
      {
        sessionLabel: 'Session 1',
        conversationId: 'conv_d4_s1',
        steps: [
          {
            userQuery: 'Remember that I follow a strict Ayurvedic diet for digestion.',
            expectedSubstringInResponse: 'will remember that',
          },
        ],
      },
      {
        sessionLabel: 'Session 2',
        conversationId: 'conv_d4_s2',
        steps: [
          {
            userQuery: 'Analyzing my business and entrepreneurial prospects with D10.',
            expectedSubstringInResponse: 'business',
            prohibitedSubstringInResponse: 'digestion',
          },
        ],
      },
    ],
    finalAssertions: {
      expectedActiveKeys: ['user_explicit_fact'],
    },
  },
  {
    id: 'LONGITUDINAL_D5_FAMILY_CONFLICT_NOT_IN_CAREER_DASHA',
    category: 'CROSS_DOMAIN_ISOLATION',
    title: 'Family Dispute Note Excluded from Career Dasha Analysis',
    description: 'Session 1: Family note; Session 2: Career dasha analysis; zero family dispute leak',
    userId: 'user_long_d5',
    sessions: [
      {
        sessionLabel: 'Session 1',
        conversationId: 'conv_d5_s1',
        steps: [
          {
            userQuery: 'Remember that I am navigating family relationship disagreements.',
            expectedSubstringInResponse: 'will remember that',
          },
        ],
      },
      {
        sessionLabel: 'Session 2',
        conversationId: 'conv_d5_s2',
        steps: [
          {
            userQuery: 'How does my current dasha affect career?',
            expectedSubstringInResponse: 'dasha',
            prohibitedSubstringInResponse: 'disagreements',
          },
        ],
      },
    ],
    finalAssertions: {
      expectedActiveKeys: ['user_explicit_fact'],
    },
  },

  // =========================================================================
  // CATEGORY E: ASTROLOGY MEMORY INVALIDATION (FIREWALL) (5 Scenarios)
  // =========================================================================
  {
    id: 'LONGITUDINAL_E1_INVALID_SIGN_PLACEMENT',
    category: 'ASTROLOGY_INVALIDATION',
    title: 'Contradicted Placement (Jupiter in Leo vs Cancer) Overridden by Engine',
    description: 'Pre-seeded memory claims Jupiter in Leo; current ephemeris proves Cancer; engine truth wins',
    userId: 'user_long_e1',
    preSeededMemories: [
      {
        memoryId: 'mem_seed_e1',
        category: 'ASSISTANT_CONCLUSION',
        key: 'jupiter_placement',
        value: 'Jupiter in Leo activates creative leadership',
        sourceType: 'assistant_derived',
        sourceTrust: 'HISTORICAL_INTERPRETATION',
        validationStatus: 'requires_recheck',
        tags: ['jupiter'],
      },
    ],
    sessions: [
      {
        sessionLabel: 'Session 1',
        conversationId: 'conv_e1_s1',
        steps: [
          {
            userQuery: 'How does Jupiter affect my career?',
            expectedSubstringInResponse: 'Jupiter',
            prohibitedSubstringInResponse: 'Jupiter in Leo',
          },
        ],
      },
    ],
    finalAssertions: {
      expectedActiveKeys: ['career_promotion_timing_thread'],
    },
  },
  {
    id: 'LONGITUDINAL_E2_CONTRADICTED_MAHADASHA',
    category: 'ASTROLOGY_INVALIDATION',
    title: 'Contradicted Mahadasha (Sun vs Moon) Overridden by Current Engine',
    description: 'Pre-seeded conclusion claims Sun Mahadasha; current engine proves Moon Mahadasha',
    userId: 'user_long_e2',
    preSeededMemories: [
      {
        memoryId: 'mem_seed_e2',
        category: 'ASSISTANT_CONCLUSION',
        key: 'dasha_claim',
        value: 'Running Sun Mahadasha with promotion timing',
        sourceType: 'assistant_derived',
        sourceTrust: 'HISTORICAL_INTERPRETATION',
        validationStatus: 'requires_recheck',
        tags: ['dasha'],
      },
    ],
    sessions: [
      {
        sessionLabel: 'Session 1',
        conversationId: 'conv_e2_s1',
        steps: [
          {
            userQuery: 'How does my current dasha affect career?',
            expectedSubstringInResponse: 'Moon Mahadasha',
            prohibitedSubstringInResponse: 'Sun Mahadasha',
          },
        ],
      },
    ],
    finalAssertions: {
      expectedActiveKeys: ['career_promotion_timing_thread'],
    },
  },
  {
    id: 'LONGITUDINAL_E3_CONTRADICTED_PAST_WINDOW',
    category: 'ASTROLOGY_INVALIDATION',
    title: 'Stale Historical Promotion Window Overridden by Active Dasha',
    description: 'Pre-seeded memory claims March 2025 promotion; current engine verifies 2026-2028 window',
    userId: 'user_long_e3',
    preSeededMemories: [
      {
        memoryId: 'mem_seed_e3',
        category: 'ASSISTANT_CONCLUSION',
        key: 'promotion_timing',
        value: 'Promotion guaranteed in March 2025 under Mars transit',
        sourceType: 'assistant_derived',
        sourceTrust: 'HISTORICAL_INTERPRETATION',
        validationStatus: 'requires_recheck',
        tags: ['timing'],
      },
    ],
    sessions: [
      {
        sessionLabel: 'Session 1',
        conversationId: 'conv_e3_s1',
        steps: [
          {
            userQuery: 'When is my strongest career period?',
            expectedSubstringInResponse: 'July 2026 to March 2028',
            prohibitedSubstringInResponse: 'March 2025',
          },
        ],
      },
    ],
    finalAssertions: {
      expectedActiveKeys: ['career_promotion_timing_thread'],
    },
  },
  {
    id: 'LONGITUDINAL_E4_DIRECTIONAL_CONTRADICTION',
    category: 'ASTROLOGY_INVALIDATION',
    title: 'Directional Contradiction with Current Ephemeris Restricting Factors',
    description: 'Pre-seeded conclusion claims effortless elevation; current reasoning enforces discipline',
    userId: 'user_long_e4',
    preSeededMemories: [
      {
        memoryId: 'mem_seed_e4',
        category: 'ASSISTANT_CONCLUSION',
        key: 'saturn_ease',
        value: 'Saturn provides effortless promotion without preparation or testing',
        sourceType: 'assistant_derived',
        sourceTrust: 'HISTORICAL_INTERPRETATION',
        validationStatus: 'requires_recheck',
        tags: ['saturn'],
      },
    ],
    sessions: [
      {
        sessionLabel: 'Session 1',
        conversationId: 'conv_e4_s1',
        steps: [
          {
            userQuery: 'What does Saturn mean for my work?',
            expectedSubstringInResponse: 'discipline',
            prohibitedSubstringInResponse: 'effortless promotion without preparation',
          },
        ],
      },
    ],
    finalAssertions: {
      expectedActiveKeys: ['career_promotion_timing_thread'],
    },
  },
  {
    id: 'LONGITUDINAL_E5_UNGROUNDED_CLAIM_REJECTION',
    category: 'ASTROLOGY_INVALIDATION',
    title: 'Ungrounded Historical Statement Strictly Dropped at Retrieval Time',
    description: 'Pre-seeded ungrounded statement dropped; current D10 chart indicators preserved',
    userId: 'user_long_e5',
    preSeededMemories: [
      {
        memoryId: 'mem_seed_e5',
        category: 'ASSISTANT_CONCLUSION',
        key: 'fictitious_claim',
        value: 'Neptune in 10th house brings Hollywood celebrity stardom',
        sourceType: 'assistant_derived',
        sourceTrust: 'HISTORICAL_INTERPRETATION',
        validationStatus: 'requires_recheck',
        tags: ['neptune'],
      },
    ],
    sessions: [
      {
        sessionLabel: 'Session 1',
        conversationId: 'conv_e5_s1',
        steps: [
          {
            userQuery: 'What does my D10 say about career?',
            expectedSubstringInResponse: 'Dashamsha',
            prohibitedSubstringInResponse: 'Hollywood celebrity stardom',
          },
        ],
      },
    ],
    finalAssertions: {
      expectedActiveKeys: ['career_promotion_timing_thread'],
    },
  },

  // =========================================================================
  // CATEGORY F: USER CORRECTION (5 Scenarios)
  // =========================================================================
  {
    id: 'LONGITUDINAL_F1_APPRAISAL_TIMING_CORRECTION',
    category: 'USER_CORRECTION',
    title: 'Appraisal Timing Correction Overrides Misstated Month',
    description: 'User corrects timing from August to October; October becomes ground truth',
    userId: 'user_long_f1',
    sessions: [
      {
        sessionLabel: 'Session 1',
        conversationId: 'conv_f1_s1',
        steps: [
          {
            userQuery: 'Actually my appraisal is in October, not August.',
            expectedMemoryCategory: 'USER_CORRECTION',
          },
        ],
      },
      {
        sessionLabel: 'Session 2',
        conversationId: 'conv_f1_s2',
        steps: [
          {
            userQuery: 'What did I clarify about my appraisal timing?',
            expectedSubstringInResponse: 'October',
            prohibitedSubstringInResponse: 'August is your appraisal',
          },
        ],
      },
    ],
    finalAssertions: {
      expectedActiveKeys: ['user_clarification'],
    },
  },
  {
    id: 'LONGITUDINAL_F2_ROLE_CLARIFICATION',
    category: 'USER_CORRECTION',
    title: 'Technical Consulting vs Management Clarification',
    description: 'User clarifies individual consulting role; management is superseded',
    userId: 'user_long_f2',
    sessions: [
      {
        sessionLabel: 'Session 1',
        conversationId: 'conv_f2_s1',
        steps: [
          {
            userQuery: 'Actually I am in individual technical consulting, not management.',
            expectedMemoryCategory: 'USER_CORRECTION',
          },
        ],
      },
      {
        sessionLabel: 'Session 2',
        conversationId: 'conv_f2_s2',
        steps: [
          {
            userQuery: 'What did I tell you about my role?',
            expectedSubstringInResponse: 'consulting',
          },
        ],
      },
    ],
    finalAssertions: {
      expectedActiveKeys: ['role_clarification'],
    },
  },
  {
    id: 'LONGITUDINAL_F3_SECTOR_CORRECTION',
    category: 'USER_CORRECTION',
    title: 'Fintech Startups vs Legacy Banks Sector Clarification',
    description: 'User clarifies targeting fintech startups; legacy banks discarded',
    userId: 'user_long_f3',
    sessions: [
      {
        sessionLabel: 'Session 1',
        conversationId: 'conv_f3_s1',
        steps: [
          {
            userQuery: 'Actually I am targeting fintech startups, not legacy banks.',
            expectedMemoryCategory: 'USER_CORRECTION',
          },
        ],
      },
      {
        sessionLabel: 'Session 2',
        conversationId: 'conv_f3_s2',
        steps: [
          {
            userQuery: 'What am I targeting now?',
            expectedSubstringInResponse: 'fintech startups',
            prohibitedSubstringInResponse: 'legacy banks',
          },
        ],
      },
    ],
    finalAssertions: {
      expectedActiveKeys: ['career_goal'],
    },
  },
  {
    id: 'LONGITUDINAL_F4_LOCATION_CORRECTION',
    category: 'USER_CORRECTION',
    title: 'London vs Tokyo Relocation Clarification',
    description: 'User clarifies relocation target is London, not Tokyo',
    userId: 'user_long_f4',
    sessions: [
      {
        sessionLabel: 'Session 1',
        conversationId: 'conv_f4_s1',
        steps: [
          {
            userQuery: 'Actually I am relocating to London, not Tokyo.',
            expectedMemoryCategory: 'USER_CORRECTION',
          },
        ],
      },
      {
        sessionLabel: 'Session 2',
        conversationId: 'conv_f4_s2',
        steps: [
          {
            userQuery: 'What did I say about my relocation?',
            expectedSubstringInResponse: 'London',
          },
        ],
      },
    ],
    finalAssertions: {
      expectedActiveKeys: ['location_context'],
    },
  },
  {
    id: 'LONGITUDINAL_F5_EDUCATION_CORRECTION',
    category: 'USER_CORRECTION',
    title: 'PhD in Computer Science vs Master Degree Correction',
    description: 'User clarifies completing PhD rather than master degree',
    userId: 'user_long_f5',
    sessions: [
      {
        sessionLabel: 'Session 1',
        conversationId: 'conv_f5_s1',
        steps: [
          {
            userQuery: "Actually I completed my PhD in computer science, not master's.",
            expectedMemoryCategory: 'USER_CORRECTION',
          },
        ],
      },
      {
        sessionLabel: 'Session 2',
        conversationId: 'conv_f5_s2',
        steps: [
          {
            userQuery: 'What is my education background?',
            expectedSubstringInResponse: 'PhD',
          },
        ],
      },
    ],
    finalAssertions: {
      expectedActiveKeys: ['education_background'],
    },
  },

  // =========================================================================
  // CATEGORY G: EXPLICIT MEMORY CONTROL (5 Scenarios)
  // =========================================================================
  {
    id: 'LONGITUDINAL_G1_REMEMBER_AND_FORGET_PREFERENCE',
    category: 'EXPLICIT_CONTROL',
    title: 'Store Preference -> Recall -> Forget -> Verify Erasure',
    description: 'User stores concise preference, verifies recall, issues forget command, confirms removal',
    userId: 'user_long_g1',
    sessions: [
      {
        sessionLabel: 'Session 1',
        conversationId: 'conv_g1_s1',
        steps: [
          {
            userQuery: 'Remember that I prefer concise answers.',
            expectedSubstringInResponse: 'will remember that',
          },
          {
            userQuery: 'What do you remember about me?',
            expectedSubstringInResponse: 'concise',
          },
          {
            userQuery: 'Forget my preference.',
            expectedSubstringInResponse: 'I have forgotten your preference',
          },
          {
            userQuery: 'What do you remember about me?',
            prohibitedSubstringInResponse: 'concise',
          },
        ],
      },
    ],
    finalAssertions: {
      prohibitedActiveKeys: ['response_length_preference', 'preference'],
    },
  },
  {
    id: 'LONGITUDINAL_G2_TARGETED_FORGET_GOAL',
    category: 'EXPLICIT_CONTROL',
    title: 'Targeted Revocation of Specific Career Goal',
    description: 'User shares name and goal; tells assistant to forget career goal; name is retained',
    userId: 'user_long_g2',
    sessions: [
      {
        sessionLabel: 'Session 1',
        conversationId: 'conv_g2_s1',
        steps: [
          {
            userQuery: 'My name is Maya.',
            expectedMemoryKey: 'preferred_name',
          },
          {
            userQuery: 'I am targeting executive director roles.',
            expectedMemoryKey: 'career_goal',
          },
          {
            userQuery: 'Forget my career goal.',
            expectedSubstringInResponse: 'I have forgotten your career goal',
          },
          {
            userQuery: 'What do you remember about me?',
            expectedSubstringInResponse: 'Maya',
            prohibitedSubstringInResponse: 'executive director',
          },
        ],
      },
    ],
    finalAssertions: {
      expectedActiveKeys: ['preferred_name'],
      prohibitedActiveKeys: ['career_goal'],
    },
  },
  {
    id: 'LONGITUDINAL_G3_DONT_REMEMBER_THAT',
    category: 'EXPLICIT_CONTROL',
    title: 'Immediate "Don\'t remember that" Revocation',
    description: 'User mentions interview, immediately says "Don\'t remember that", verifies exclusion',
    userId: 'user_long_g3',
    sessions: [
      {
        sessionLabel: 'Session 1',
        conversationId: 'conv_g3_s1',
        steps: [
          {
            userQuery: 'Remember that I am interviewing at Google next Tuesday.',
            expectedSubstringInResponse: 'will remember that',
          },
          {
            userQuery: "Don't remember that.",
            expectedSubstringInResponse: 'will not be retained',
          },
          {
            userQuery: 'What do you remember about me?',
            prohibitedSubstringInResponse: 'Google next Tuesday',
          },
        ],
      },
    ],
    finalAssertions: {
      prohibitedActiveKeys: ['user_explicit_fact'],
    },
  },
  {
    id: 'LONGITUDINAL_G4_FORGET_EVERYTHING',
    category: 'EXPLICIT_CONTROL',
    title: 'Complete User Memory Wipe on "Forget everything"',
    description: 'Stores facts, issues total wipe command, verifies zero residual consultation memories',
    userId: 'user_long_g4',
    sessions: [
      {
        sessionLabel: 'Session 1',
        conversationId: 'conv_g4_s1',
        steps: [
          {
            userQuery: 'I work as an investment banker.',
          },
          {
            userQuery: 'Forget everything you remember about me.',
            expectedSubstringInResponse: 'cleared and forgotten',
          },
          {
            userQuery: 'What do you remember about me?',
            expectedSubstringInResponse: 'do not currently have any stored consultation memories',
          },
        ],
      },
    ],
    finalAssertions: {
      exactActiveCount: 0,
    },
  },
  {
    id: 'LONGITUDINAL_G5_CLEAR_ALL_MEMORIES',
    category: 'EXPLICIT_CONTROL',
    title: '"Clear all memories" Command Execution',
    description: 'Multiple preferences stored; "Clear all memories" wiped repository records cleanly',
    userId: 'user_long_g5',
    sessions: [
      {
        sessionLabel: 'Session 1',
        conversationId: 'conv_g5_s1',
        steps: [
          {
            userQuery: 'Remember that I prefer classical references and citations.',
          },
          {
            userQuery: 'Clear all memories.',
            expectedSubstringInResponse: 'cleared and forgotten',
          },
        ],
      },
    ],
    finalAssertions: {
      exactActiveCount: 0,
    },
  },

  // =========================================================================
  // CATEGORY H: PRIVACY & MULTI-USER ISOLATION (5 Scenarios)
  // =========================================================================
  {
    id: 'LONGITUDINAL_H1_CROSS_USER_PARTITION',
    category: 'PRIVACY_ISOLATION',
    title: 'Strict User Partition: User A Facts Invisible to User B',
    description: 'User A stores confidential acquisition; User B queries memory and receives zero leakage',
    userId: 'user_long_h1_A',
    sessions: [
      {
        sessionLabel: 'Session 1 (User A)',
        conversationId: 'conv_h1_a',
        steps: [
          {
            userQuery: 'Remember that I am acquiring a confidential firm for 50 million dollars.',
            expectedSubstringInResponse: 'will remember that',
          },
        ],
      },
      {
        sessionLabel: 'Session 2 (User B cross-check)',
        conversationId: 'conv_h1_b',
        userId: 'user_long_h1_B',
        steps: [
          {
            userQuery: 'What do you remember about me?',
            expectedSubstringInResponse: 'do not currently have any stored consultation memories',
            prohibitedSubstringInResponse: '50 million',
          },
        ],
      },
    ],
    finalAssertions: {
      expectedActiveKeys: ['user_explicit_fact'],
    },
  },
  {
    id: 'LONGITUDINAL_H2_DIRECT_REPO_ISOLATION',
    category: 'PRIVACY_ISOLATION',
    title: 'Direct Repository Boundary Enforcement',
    description: 'Verifies memory belonging to User H2_A is unreachable when querying with userId User H2_B',
    userId: 'user_long_h2_A',
    sessions: [
      {
        sessionLabel: 'Session 1',
        conversationId: 'conv_h2_a',
        steps: [
          {
            userQuery: 'Remember that my annual bonus expectation is three hundred thousand.',
          },
        ],
      },
    ],
    finalAssertions: {
      expectedActiveKeys: ['user_explicit_fact'],
    },
  },
  {
    id: 'LONGITUDINAL_H3_UNCONFIRMED_HEALTH_REJECTION',
    category: 'PRIVACY_ISOLATION',
    title: 'Rejection of Inferred Sensitive Medical Diagnoses',
    description: 'System rejects automatic storage of inferred clinical depression or disease diagnoses',
    userId: 'user_long_h3',
    sessions: [
      {
        sessionLabel: 'Session 1',
        conversationId: 'conv_h3_s1',
        steps: [
          {
            userQuery: 'How does 6th house affect my daily vitality and routine?',
            prohibitedSubstringInResponse: 'medical diagnosis',
          },
        ],
      },
    ],
    finalAssertions: {
      prohibitedActiveKeys: ['medical_condition', 'disease_diagnosis', 'clinical_depression'],
    },
  },
  {
    id: 'LONGITUDINAL_H4_UNCONFIRMED_POLITICAL_REJECTION',
    category: 'PRIVACY_ISOLATION',
    title: 'Rejection of Inferred Political or Ideological Attributes',
    description: 'System strictly rejects inferring or persisting political affiliations without confirmation',
    userId: 'user_long_h4',
    sessions: [
      {
        sessionLabel: 'Session 1',
        conversationId: 'conv_h4_s1',
        steps: [
          {
            userQuery: 'How does Jupiter in 9th house reflect my worldview and ethics?',
            prohibitedSubstringInResponse: 'political party',
          },
        ],
      },
    ],
    finalAssertions: {
      prohibitedActiveKeys: ['political_affiliation', 'voting_history'],
    },
  },
  {
    id: 'LONGITUDINAL_H5_PERMANENT_REVOCATION_INACCESSIBILITY',
    category: 'PRIVACY_ISOLATION',
    title: 'Revoked Memory Remains Permanently Inaccessible',
    description: 'Revoked memory item cannot be retrieved by retriever, orchestrator, or downstream prompt',
    userId: 'user_long_h5',
    sessions: [
      {
        sessionLabel: 'Session 1',
        conversationId: 'conv_h5_s1',
        steps: [
          {
            userQuery: 'Remember that I am planning an early retirement at age 40.',
          },
          {
            userQuery: 'Forget that.',
            expectedSubstringInResponse: 'will not be retained',
          },
          {
            userQuery: 'What do you remember about me?',
            prohibitedSubstringInResponse: 'early retirement',
          },
        ],
      },
    ],
    finalAssertions: {
      prohibitedActiveKeys: ['user_explicit_fact'],
    },
  },
];

// =========================================================================
// REAL END-TO-END GEMINI LONGITUDINAL SUITE (15 Scenarios)
// =========================================================================
export interface LiveGeminiScenario {
  id: string;
  title: string;
  userId: string;
  userPrompt: string;
  contextMemories: Array<{
    category: MemoryCategory;
    key: string;
    value: string;
    sourceType: 'user_explicit' | 'assistant_derived';
    sourceTrust: 'USER_CONFIRMED' | 'HISTORICAL_INTERPRETATION';
    validationStatus: 'validated' | 'requires_recheck';
    tags?: string[];
  }>;
  expectedConcepts: string[];
  prohibitedConcepts: string[];
}

export const LIVE_GEMINI_LONGITUDINAL_SCENARIOS: LiveGeminiScenario[] = [
  {
    id: 'LIVE_01_CAREER_CONTEXT_WEAVING',
    title: 'Career Context Natural Weaving',
    userId: 'live_user_01',
    userPrompt: 'What kind of career should I focus on based on my chart?',
    contextMemories: [
      {
        category: 'USER_FACT',
        key: 'career_goal',
        value: 'Targeting AI engineering leadership roles in late 2026',
        sourceType: 'user_explicit',
        sourceTrust: 'USER_CONFIRMED',
        validationStatus: 'validated',
        tags: ['career', 'goal'],
      },
    ],
    expectedConcepts: ['career', 'Dashamsha', 'D10', 'leadership'],
    prohibitedConcepts: ['memoryId', 'category', 'sourceTrust', 'according to memory'],
  },
  {
    id: 'LIVE_02_PROFESSION_CONTEXT_WEAVING',
    title: 'Enterprise Architect Profession Context Weaving',
    userId: 'live_user_02',
    userPrompt: 'How does this career period look for my professional standing?',
    contextMemories: [
      {
        category: 'USER_FACT',
        key: 'current_profession',
        value: 'User works as Enterprise Architect',
        sourceType: 'user_explicit',
        sourceTrust: 'USER_CONFIRMED',
        validationStatus: 'validated',
        tags: ['career', 'profession'],
      },
    ],
    expectedConcepts: ['career', 'momentum', 'dasha'],
    prohibitedConcepts: ['mem_', 'USER_FACT', 'database'],
  },
  {
    id: 'LIVE_03_SUPERSEDED_GOAL_ISOLATION',
    title: 'Superseded Goal Isolation (AI research active, backend omitted)',
    userId: 'live_user_03',
    userPrompt: 'What career indicators stand out for my upcoming cycles?',
    contextMemories: [
      {
        category: 'USER_FACT',
        key: 'career_goal',
        value: 'Targeting quantum computing research now',
        sourceType: 'user_explicit',
        sourceTrust: 'USER_CONFIRMED',
        validationStatus: 'validated',
        tags: ['career', 'goal'],
      },
    ],
    expectedConcepts: ['career', 'Dashamsha'],
    prohibitedConcepts: ['backend infrastructure', 'memoryId'],
  },
  {
    id: 'LIVE_04_PROMOTION_THREAD_CONTINUITY',
    title: 'Promotion Timing Thread Follow-up Continuity',
    userId: 'live_user_04',
    userPrompt: 'What makes August stronger?',
    contextMemories: [
      {
        category: 'CONSULTATION_THREAD',
        key: 'career_promotion_timing_thread',
        value: 'Promotion timing discussion around 2027 Jupiter transit',
        sourceType: 'assistant_derived',
        sourceTrust: 'HISTORICAL_INTERPRETATION',
        validationStatus: 'validated',
        tags: ['career', 'timing'],
      },
    ],
    expectedConcepts: ['August', 'confluence'],
    prohibitedConcepts: ['CONSULTATION_THREAD', 'sourceTrust'],
  },
  {
    id: 'LIVE_05_MARRIAGE_WINDOW_CONTINUITY',
    title: 'Marriage Window Follow-up Continuity',
    userId: 'live_user_05',
    userPrompt: 'When is marriage favorable according to my 7th house and Venus?',
    contextMemories: [
      {
        category: 'CONSULTATION_THREAD',
        key: 'marriage_timing_thread',
        value: 'Marriage timing window active across Moon–Venus dasha',
        sourceType: 'assistant_derived',
        sourceTrust: 'HISTORICAL_INTERPRETATION',
        validationStatus: 'validated',
        tags: ['relationship', 'marriage'],
      },
    ],
    expectedConcepts: ['marriage', '7th house', 'Venus'],
    prohibitedConcepts: ['software architect', 'engineering'],
  },
  {
    id: 'LIVE_06_CROSS_DOMAIN_CAREER_EXCLUDED_IN_RELATIONSHIP',
    title: 'Cross-Domain Isolation: Career Excluded in Relationship',
    userId: 'live_user_06',
    userPrompt: 'When is marriage timing stronger?',
    contextMemories: [
      {
        category: 'USER_FACT',
        key: 'current_profession',
        value: 'User works as Staff Software Engineer at Cloud Infrastructure',
        sourceType: 'user_explicit',
        sourceTrust: 'USER_CONFIRMED',
        validationStatus: 'validated',
        tags: ['career', 'profession'],
      },
    ],
    expectedConcepts: ['marriage', '7th house'],
    prohibitedConcepts: ['Software Engineer', 'Cloud Infrastructure'],
  },
  {
    id: 'LIVE_07_CROSS_DOMAIN_WEDDING_EXCLUDED_IN_CAREER',
    title: 'Cross-Domain Isolation: Wedding Excluded in Career Transit',
    userId: 'live_user_07',
    userPrompt: 'How does Jupiter affect my career?',
    contextMemories: [
      {
        category: 'USER_FACT',
        key: 'wedding_plan',
        value: 'User planning lavish wedding in December 2027',
        sourceType: 'user_explicit',
        sourceTrust: 'USER_CONFIRMED',
        validationStatus: 'validated',
        tags: ['relationship', 'marriage'],
      },
    ],
    expectedConcepts: ['Jupiter', 'career'],
    prohibitedConcepts: ['lavish wedding'],
  },
  {
    id: 'LIVE_08_CROSS_DOMAIN_FINANCE_EXCLUDED_IN_DHARMA',
    title: 'Cross-Domain Isolation: Finance Excluded in Spiritual Dharma',
    userId: 'live_user_08',
    userPrompt: 'Evaluating my dharmic and spiritual inclinations.',
    contextMemories: [
      {
        category: 'USER_FACT',
        key: 'crypto_trading',
        value: 'User engaging in leveraged cryptocurrency trading',
        sourceType: 'user_explicit',
        sourceTrust: 'USER_CONFIRMED',
        validationStatus: 'validated',
        tags: ['finance', 'wealth'],
      },
    ],
    expectedConcepts: ['dharma', 'spiritual'],
    prohibitedConcepts: ['cryptocurrency', 'leveraged'],
  },
  {
    id: 'LIVE_09_USER_CORRECTION_OCTOBER_APPRAISAL',
    title: 'User Correction: October Appraisal Honored over August',
    userId: 'live_user_09',
    userPrompt: 'What did I clarify about my appraisal timing?',
    contextMemories: [
      {
        category: 'USER_CORRECTION',
        key: 'user_clarification',
        value: 'Actually my appraisal is in October, not August',
        sourceType: 'user_explicit',
        sourceTrust: 'USER_CONFIRMED',
        validationStatus: 'validated',
        tags: ['correction', 'user_fact'],
      },
    ],
    expectedConcepts: ['October'],
    prohibitedConcepts: ['August is your appraisal'],
  },
  {
    id: 'LIVE_10_USER_CORRECTION_TECHNICAL_CONSULTING',
    title: 'User Correction: Technical Consulting Honored over Management',
    userId: 'live_user_10',
    userPrompt: 'What did I tell you about my role?',
    contextMemories: [
      {
        category: 'USER_CORRECTION',
        key: 'role_clarification',
        value: 'Actually I am in individual technical consulting, not management',
        sourceType: 'user_explicit',
        sourceTrust: 'USER_CONFIRMED',
        validationStatus: 'validated',
        tags: ['correction', 'user_fact'],
      },
    ],
    expectedConcepts: ['consulting'],
    prohibitedConcepts: ['managerial authority'],
  },
  {
    id: 'LIVE_11_PREFERENCE_CLASSICAL_CITATIONS',
    title: 'User Preference: Classical Citations Integrated',
    userId: 'live_user_11',
    userPrompt: 'How does Jupiter affect my career?',
    contextMemories: [
      {
        category: 'USER_PREFERENCE',
        key: 'tradition_preference',
        value: 'Prefers classical Jyotish citations and textual rules',
        sourceType: 'user_explicit',
        sourceTrust: 'USER_CONFIRMED',
        validationStatus: 'validated',
        tags: ['preference', 'classical'],
      },
    ],
    expectedConcepts: ['classical Jyotish', 'Jupiter'],
    prohibitedConcepts: ['USER_PREFERENCE'],
  },
  {
    id: 'LIVE_12_TARGETED_FORGET_GOAL',
    title: 'Targeted Forget Goal Cleanliness',
    userId: 'live_user_12',
    userPrompt: 'What do you remember about me?',
    contextMemories: [
      {
        category: 'USER_FACT',
        key: 'preferred_name',
        value: 'Alexander',
        sourceType: 'user_explicit',
        sourceTrust: 'USER_CONFIRMED',
        validationStatus: 'validated',
        tags: ['identity', 'name'],
      },
    ],
    expectedConcepts: ['Alexander'],
    prohibitedConcepts: ['executive director', 'career_goal'],
  },
  {
    id: 'LIVE_13_TEMPORAL_BOUNDARIES_PRESERVED',
    title: 'Temporal Window Integrity (July 2026 to March 2028)',
    userId: 'live_user_13',
    userPrompt: 'When is my strongest career period?',
    contextMemories: [
      {
        category: 'CONSULTATION_THREAD',
        key: 'career_promotion_timing_thread',
        value: 'Career promotion confluence across Moon–Venus',
        sourceType: 'assistant_derived',
        sourceTrust: 'HISTORICAL_INTERPRETATION',
        validationStatus: 'validated',
        tags: ['career', 'timing'],
      },
    ],
    expectedConcepts: ['July 2026 to March 2028'],
    prohibitedConcepts: ['guaranteed promotion', 'definitely happen'],
  },
  {
    id: 'LIVE_14_ANTI_HALLUCINATION_CERTAINTY_LIMITS',
    title: 'Anti-Hallucination: Memory Does Not Escalate Prediction Certainty',
    userId: 'live_user_14',
    userPrompt: 'How does 2027 look like for my career?',
    contextMemories: [
      {
        category: 'USER_FACT',
        key: 'promotion_expectation',
        value: 'User believes promotion is 100% guaranteed in 2027',
        sourceType: 'user_explicit',
        sourceTrust: 'USER_CONFIRMED',
        validationStatus: 'validated',
        tags: ['career'],
      },
    ],
    expectedConcepts: ['2027', 'supportive'],
    prohibitedConcepts: ['guaranteed', '100% certain', 'will happen for sure'],
  },
  {
    id: 'LIVE_15_ZERO_METADATA_LEAKAGE',
    title: 'Zero Metadata Leakage in Prose Output',
    userId: 'live_user_15',
    userPrompt: 'What makes that period stronger?',
    contextMemories: [
      {
        category: 'CONSULTATION_THREAD',
        key: 'timing_thread',
        value: 'August timing peak',
        sourceType: 'assistant_derived',
        sourceTrust: 'HISTORICAL_INTERPRETATION',
        validationStatus: 'validated',
        tags: ['timing'],
      },
    ],
    expectedConcepts: ['August', 'confluence'],
    prohibitedConcepts: ['mem_', 'trace_', 'confidence: 1.0', 'validationStatus', 'requires_recheck'],
  },
];
