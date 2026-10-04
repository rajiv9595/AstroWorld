/**
 * ASTROWORLD AI V2 — Phase 5B Persistent Consultation Memory Benchmark
 * 20 Comprehensive Multi-Turn Scenarios testing continuity, personalization,
 * conflict resolution, astrology revalidation, privacy isolation, and commands.
 */

import { BirthProfile } from '../schemas/birthProfile.ts';
import { MemoryCategory } from './persistentMemoryTypes.ts';

export const BENCHMARK_TEST_PROFILE: BirthProfile = {
  name: 'Memory Benchmark Native',
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

export interface MemoryBenchmarkStep {
  userQuery: string;
  expectedMemoryKey?: string;
  expectedMemoryCategory?: MemoryCategory;
  expectedSubstringInResponse?: string;
  prohibitedSubstringInResponse?: string;
  expectedActiveMemoriesCount?: number;
}

export interface MemoryBenchmarkScenario {
  id: string;
  title: string;
  description: string;
  userId: string;
  steps: MemoryBenchmarkStep[];
  finalAssertions: {
    expectedActiveKeys?: string[];
    prohibitedActiveKeys?: string[];
    expectedMemoryValues?: Record<string, string>;
  };
}

export const MEMORY_BENCHMARK_SCENARIOS: MemoryBenchmarkScenario[] = [
  // Scenario 1: User establishes career goal and recalls it
  {
    id: 'SCENARIO_01_CAREER_GOAL_ESTABLISH_AND_RECALL',
    title: 'Establish career goal and recall',
    description: 'User states career goal in turn 1, then asks what was shared in turn 2',
    userId: 'user_bench_01',
    steps: [
      {
        userQuery: 'I am preparing for AI engineering leadership roles in late 2026.',
        expectedMemoryKey: 'career_goal',
        expectedMemoryCategory: 'USER_FACT',
      },
      {
        userQuery: 'What did I tell you about my career goal?',
        expectedSubstringInResponse: 'AI engineering',
      },
    ],
    finalAssertions: {
      expectedActiveKeys: ['career_goal'],
    },
  },

  // Scenario 2: User changes career goal (conflict & superseding)
  {
    id: 'SCENARIO_02_CAREER_GOAL_UPDATE_AND_SUPERSEDE',
    title: 'Update career goal and verify superseding',
    description: 'User switches career target from backend to quantum computing; old goal is superseded',
    userId: 'user_bench_02',
    steps: [
      {
        userQuery: 'I am targeting backend infrastructure roles.',
        expectedMemoryKey: 'career_goal',
      },
      {
        userQuery: 'Actually I am targeting quantum computing research now.',
        expectedMemoryKey: 'career_goal',
      },
      {
        userQuery: 'What am I targeting now?',
        expectedSubstringInResponse: 'quantum computing',
        prohibitedSubstringInResponse: 'backend infrastructure',
      },
    ],
    finalAssertions: {
      expectedActiveKeys: ['career_goal'],
      expectedMemoryValues: { career_goal: 'Targeting quantum computing research now' },
    },
  },

  // Scenario 3: Explicit "Remember this" command
  {
    id: 'SCENARIO_03_EXPLICIT_REMEMBER_COMMAND',
    title: 'Explicit "Remember that" command',
    description: 'User issues direct command: Remember that I prefer working remotely',
    userId: 'user_bench_03',
    steps: [
      {
        userQuery: 'Remember that I prefer working remotely from European timezones.',
        expectedSubstringInResponse: 'I will remember that',
      },
    ],
    finalAssertions: {
      expectedActiveKeys: ['user_explicit_fact'],
    },
  },

  // Scenario 4: "Don't remember this" refusal
  {
    id: 'SCENARIO_04_DONT_REMEMBER_COMMAND',
    title: 'Explicit "Don\'t remember that" command',
    description: 'User instructs assistant not to remember an item',
    userId: 'user_bench_04',
    steps: [
      {
        userQuery: 'Remember that my annual compensation target is high.',
      },
      {
        userQuery: "Don't remember that.",
        expectedSubstringInResponse: 'will not be retained',
      },
    ],
    finalAssertions: {
      prohibitedActiveKeys: ['user_explicit_fact'],
    },
  },

  // Scenario 5: Astrology Interpretation vs Current Deterministic Engine Evidence
  {
    id: 'SCENARIO_05_ASTROLOGY_EVIDENCE_TRUMPS_HISTORICAL',
    title: 'Current deterministic engine evidence trumps historical assistant statement',
    description: 'Historical assistant statement claims Jupiter in Leo; current engine proves Cancer; engine wins',
    userId: 'user_bench_05',
    steps: [
      {
        userQuery: 'How does Jupiter in Cancer support my promotion in 2027?',
        expectedSubstringInResponse: 'Jupiter',
      },
    ],
    finalAssertions: {
      expectedActiveKeys: ['career_promotion_timing_thread'],
    },
  },

  // Scenario 6: Domain Switch (Career to Marriage isolation)
  {
    id: 'SCENARIO_06_DOMAIN_SWITCH_MEMORY_ISOLATION',
    title: 'Domain switch retains memory without cross-domain bleed',
    description: 'User has career goal stored, then asks about marriage; career facts are not falsely injected',
    userId: 'user_bench_06',
    steps: [
      {
        userQuery: 'I work as a software architect in fintech.',
        expectedMemoryKey: 'current_profession',
      },
      {
        userQuery: 'When is marriage favorable according to my 7th house and Venus?',
        expectedSubstringInResponse: 'marriage',
        prohibitedSubstringInResponse: 'software architect',
      },
    ],
    finalAssertions: {
      expectedActiveKeys: ['current_profession', 'marriage_timing_thread'],
    },
  },

  // Scenario 7: "What do you remember about me?" query
  {
    id: 'SCENARIO_07_WHAT_DO_YOU_REMEMBER',
    title: 'User-facing memory explanation without internal leakage',
    description: 'User asks what is remembered; returns clean bulleted list without internal IDs or confidence',
    userId: 'user_bench_07',
    steps: [
      {
        userQuery: 'My name is Alexander.',
        expectedMemoryKey: 'preferred_name',
      },
      {
        userQuery: 'Please give me concise answers.',
        expectedMemoryKey: 'response_length_preference',
      },
      {
        userQuery: 'What do you remember about me?',
        expectedSubstringInResponse: 'Alexander',
        prohibitedSubstringInResponse: 'confidence',
      },
    ],
    finalAssertions: {
      expectedActiveKeys: ['preferred_name', 'response_length_preference'],
    },
  },

  // Scenario 8: "Forget everything you remember about me"
  {
    id: 'SCENARIO_08_FORGET_EVERYTHING',
    title: 'Complete memory erasure on user command',
    description: 'User instructs total deletion; all active memories are wiped',
    userId: 'user_bench_08',
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
    finalAssertions: {
      prohibitedActiveKeys: ['current_profession'],
    },
  },

  // Scenario 9: User Preference - Concise Answers
  {
    id: 'SCENARIO_09_PREFERENCE_CONCISE',
    title: 'Persists concise style preference',
    description: 'User states preference for short answers; recorded in USER_PREFERENCE',
    userId: 'user_bench_09',
    steps: [
      {
        userQuery: 'Please keep it brief and give me concise answers.',
        expectedMemoryCategory: 'USER_PREFERENCE',
        expectedMemoryKey: 'response_length_preference',
      },
    ],
    finalAssertions: {
      expectedActiveKeys: ['response_length_preference'],
    },
  },

  // Scenario 10: User Preference - Classical References
  {
    id: 'SCENARIO_10_PREFERENCE_CLASSICAL_REFERENCES',
    title: 'Persists classical references preference',
    description: 'User requests classical citations and BPHS slokas',
    userId: 'user_bench_10',
    steps: [
      {
        userQuery: 'I prefer classical references and citations from classical texts.',
        expectedMemoryCategory: 'USER_PREFERENCE',
        expectedMemoryKey: 'tradition_preference',
      },
    ],
    finalAssertions: {
      expectedActiveKeys: ['tradition_preference'],
    },
  },

  // Scenario 11: Recurring Consultation Topic Tracking
  {
    id: 'SCENARIO_11_CONSULTATION_TOPIC_RECURRENCE',
    title: 'Tracks recurring career consultation topic',
    description: 'Tracks ongoing career promotion timing thread across multi-turn exchanges',
    userId: 'user_bench_11',
    steps: [
      {
        userQuery: 'When does my upcoming promotion cycle peak in 2027?',
        expectedMemoryCategory: 'CONSULTATION_THREAD',
      },
    ],
    finalAssertions: {
      expectedActiveKeys: ['career_promotion_timing_thread'],
    },
  },

  // Scenario 12: Sensitive Health Inference Rejection
  {
    id: 'SCENARIO_12_SENSITIVE_HEALTH_INFERENCE_REJECTION',
    title: 'Rejects automatic inference of sensitive health diagnosis',
    description: 'Memory write gate rejects inferring depression or disease without confirmation',
    userId: 'user_bench_12',
    steps: [
      {
        userQuery: 'How does 6th house affect my daily routine and vitality?',
        prohibitedSubstringInResponse: 'medical diagnosis',
      },
    ],
    finalAssertions: {
      prohibitedActiveKeys: ['medical_condition', 'disease_diagnosis'],
    },
  },

  // Scenario 13: Forget Specific Memory Key
  {
    id: 'SCENARIO_13_FORGET_SPECIFIC_MEMORY',
    title: 'Forget specific targeted memory',
    description: 'User says "Forget my career goal"; only that goal is revoked',
    userId: 'user_bench_13',
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
    finalAssertions: {
      expectedActiveKeys: ['preferred_name'],
      prohibitedActiveKeys: ['career_goal'],
    },
  },

  // Scenario 14: Important Milestone Event Stored
  {
    id: 'SCENARIO_14_MILESTONE_EVENT_STORED',
    title: 'Stores verified user milestone event',
    description: 'User reports joining new enterprise in July 2026',
    userId: 'user_bench_14',
    steps: [
      {
        userQuery: 'I joined a new enterprise in July 2026.',
        expectedMemoryCategory: 'IMPORTANT_EVENT',
      },
    ],
    finalAssertions: {
      expectedActiveKeys: ['life_milestone'],
    },
  },

  // Scenario 15: Cross-User Security Isolation
  {
    id: 'SCENARIO_15_CROSS_USER_SECURITY_ISOLATION',
    title: 'Strict cross-user memory partition',
    description: 'User A stores confidential facts; User B cannot retrieve or see them',
    userId: 'user_bench_15_A',
    steps: [
      {
        userQuery: 'Remember that I work at Confidential Vault Inc.',
        expectedSubstringInResponse: 'I will remember that',
      },
    ],
    finalAssertions: {
      expectedActiveKeys: ['user_explicit_fact'],
    },
  },

  // Scenario 16: User Correction Overrides Misstated Timing
  {
    id: 'SCENARIO_16_CORRECTION_OVERRIDES_MISSTATED_TIMING',
    title: 'User correction establishes ground truth',
    description: 'User corrects appraisal month to October; correction stored cleanly',
    userId: 'user_bench_16',
    steps: [
      {
        userQuery: 'Actually my appraisal is in October, not August.',
        expectedMemoryCategory: 'USER_CORRECTION',
      },
    ],
    finalAssertions: {
      expectedActiveKeys: ['user_clarification'],
    },
  },

  // Scenario 17: Low-Value Filler Rejection
  {
    id: 'SCENARIO_17_LOW_VALUE_FILLER_REJECTION',
    title: 'Rejects temporary filler from entering persistent memory',
    description: 'User says "Why?" or asks temporary question; no junk memory created',
    userId: 'user_bench_17',
    steps: [
      {
        userQuery: 'Why?',
      },
    ],
    finalAssertions: {
      prohibitedActiveKeys: ['why_artifact', 'temporary_clarification'],
    },
  },

  // Scenario 18: Revalidation of Historical Assistant Conclusion
  {
    id: 'SCENARIO_18_HISTORICAL_CONCLUSION_REVALIDATION',
    title: 'Assistant conclusion requires revalidation against ephemeris',
    description: 'Assistant-derived conclusion carries sourceTurn and requires current revalidation',
    userId: 'user_bench_18',
    steps: [
      {
        userQuery: 'When does my next promotion timing window activate?',
        expectedMemoryCategory: 'CONSULTATION_THREAD',
      },
    ],
    finalAssertions: {
      expectedActiveKeys: ['career_promotion_timing_thread'],
    },
  },

  // Scenario 19: Repeated Duplicate Value Does Not Spawn New Records
  {
    id: 'SCENARIO_19_DEDUPLICATION_IDEMPOTENCY',
    title: 'Idempotent deduplication on identical statements',
    description: 'User repeats identical preference twice; only one active record exists',
    userId: 'user_bench_19',
    steps: [
      {
        userQuery: 'Please give me concise answers.',
        expectedMemoryKey: 'response_length_preference',
      },
      {
        userQuery: 'Please give me concise answers.',
        expectedMemoryKey: 'response_length_preference',
      },
    ],
    finalAssertions: {
      expectedActiveKeys: ['response_length_preference'],
    },
  },

  // Scenario 20: Full Life Context Continuity Across 3 Consultations
  {
    id: 'SCENARIO_20_FULL_LIFE_CONTEXT_CONTINUITY',
    title: 'Multi-turn life context retention and synthesis',
    description: 'Establishes name, profession, and target, then verifies coherent recall',
    userId: 'user_bench_20',
    steps: [
      {
        userQuery: 'My name is Sarah and I am a data scientist.',
      },
      {
        userQuery: 'I am targeting machine learning lead roles.',
      },
      {
        userQuery: 'What do you remember about me?',
        expectedSubstringInResponse: 'Sarah',
      },
    ],
    finalAssertions: {
      expectedActiveKeys: ['preferred_name', 'current_profession', 'career_goal'],
    },
  },
];
