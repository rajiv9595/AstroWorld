/**
 * ASTROWORLD AI V2 — Phase 5B Persistent Consultation Memory Verification Suite
 * Executes 80+ targeted unit tests across 10 categories (A through J),
 * runs the 20-scenario multi-turn memory benchmark, measures latency (<20ms),
 * and verifies critical security/privacy isolation and the astrology memory firewall.
 */

import {
  InMemoryPersistentMemoryRepository,
  MemoryWriteGate,
  MemoryConsolidator,
  AstrologyMemoryValidator,
  MemoryRetriever,
  MemoryCandidateGenerator,
  MemoryCommandResolver,
  UserMemoryService,
  PersistentMemory,
  MemoryWriteCandidate,
} from '../src/ai_v2/memory/index.ts';
import {
  ConsultationOrchestrator,
} from '../src/ai_v2/consultation/consultationOrchestrator.ts';
import {
  MEMORY_BENCHMARK_SCENARIOS,
  BENCHMARK_TEST_PROFILE,
} from '../src/ai_v2/memory/memoryBenchmark.ts';
import { EvidencePacket } from '../src/ai_v2/schemas/evidencePacket.ts';
import { ReasoningPacket } from '../src/ai_v2/schemas/reasoningPacket.ts';

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testId: string, description: string, detail?: string) {
  if (condition) {
    passedCount++;
    console.log(`  ✅ [PASSED] [${testId}] ${description}${detail ? ` (${detail})` : ''}`);
  } else {
    failedCount++;
    console.error(`  ❌ [FAILED] [${testId}] ${description}${detail ? ` (${detail})` : ''}`);
  }
}

async function runPhase5BVerificationSuite() {
  console.log('\n🧠 ================================================================================');
  console.log('ASTROWORLD AI V2 — PHASE 5B PERSISTENT MEMORY VERIFICATION SUITE (80+ TESTS)');
  console.log('================================================================================\n');

  const repo = new InMemoryPersistentMemoryRepository();
  const writeGate = new MemoryWriteGate();
  const consolidator = new MemoryConsolidator(repo);
  const validator = new AstrologyMemoryValidator();
  const retriever = new MemoryRetriever(repo);
  const generator = new MemoryCandidateGenerator();
  const commandResolver = new MemoryCommandResolver(repo);
  const memoryService = new UserMemoryService(repo);

  // =========================================================================
  // CATEGORY A: EXPLICIT USER MEMORY (10 Tests)
  // =========================================================================
  console.log('--- CATEGORY A: EXPLICIT USER MEMORY (10 TESTS) ---');

  // A1: Save explicit preferred name
  const candA1: MemoryWriteCandidate = {
    userId: 'user_A',
    category: 'USER_FACT',
    key: 'preferred_name',
    value: 'Rohan Sharma',
    sourceType: 'user_explicit',
  };
  const decA1 = writeGate.evaluate(candA1);
  const resA1 = await consolidator.consolidate(candA1, decA1);
  assert(resA1.action === 'created' && resA1.memory.value === 'Rohan Sharma', 'A1', 'Stores explicit preferred name');

  // A2: Save current profession
  const candA2: MemoryWriteCandidate = {
    userId: 'user_A',
    category: 'USER_FACT',
    key: 'current_profession',
    value: 'Software Architect at Enterprise SaaS',
    sourceType: 'user_explicit',
  };
  const resA2 = await consolidator.consolidate(candA2, writeGate.evaluate(candA2));
  assert(resA2.memory.key === 'current_profession', 'A2', 'Stores current profession');

  // A3: Save career goal
  const candA3: MemoryWriteCandidate = {
    userId: 'user_A',
    category: 'USER_FACT',
    key: 'career_goal',
    value: 'Targeting VP of Engineering in late 2026',
    sourceType: 'user_explicit',
  };
  const resA3 = await consolidator.consolidate(candA3, writeGate.evaluate(candA3));
  assert(resA3.memory.category === 'USER_FACT', 'A3', 'Stores career goal');

  // A4: Save industry sector
  const candA4: MemoryWriteCandidate = {
    userId: 'user_A',
    category: 'USER_FACT',
    key: 'industry',
    value: 'Fintech and Quantitative Trading',
    sourceType: 'user_explicit',
  };
  const resA4 = await consolidator.consolidate(candA4, writeGate.evaluate(candA4));
  assert(resA4.memory.key === 'industry', 'A4', 'Stores industry sector');

  // A5: Save explicit relationship status
  const candA5: MemoryWriteCandidate = {
    userId: 'user_A',
    category: 'USER_FACT',
    key: 'relationship_status',
    value: 'Engaged to be married in late 2027',
    sourceType: 'user_explicit',
    sensitivity: 'personal',
  };
  const resA5 = await consolidator.consolidate(candA5, writeGate.evaluate(candA5));
  assert(resA5.memory.sensitivity === 'personal', 'A5', 'Stores personal relationship context with correct sensitivity');

  // A6: Save location preference
  const candA6: MemoryWriteCandidate = {
    userId: 'user_A',
    category: 'USER_FACT',
    key: 'relocation_target',
    value: 'Planning to relocate to Singapore or London',
    sourceType: 'user_explicit',
  };
  const resA6 = await consolidator.consolidate(candA6, writeGate.evaluate(candA6));
  assert(resA6.memory.value.includes('Singapore'), 'A6', 'Stores relocation target');

  // A7: Retrieve stored user facts
  const factsA = await repo.find({ userId: 'user_A', categories: ['USER_FACT'] });
  assert(factsA.length === 6, 'A7', 'Retrieves all 6 active user facts');

  // A8: User confirmed trust level
  assert(resA1.memory.sourceTrust === 'USER_CONFIRMED', 'A8', 'Explicit user facts receive USER_CONFIRMED trust level');

  // A9: Memory validation status
  assert(resA1.memory.validationStatus === 'validated', 'A9', 'Explicit user facts receive validated status');

  // A10: Query non-existent memory ID returns undefined
  const nonExistent = await repo.getById('user_A', 'mem_non_existent');
  assert(nonExistent === undefined, 'A10', 'Non-existent memory ID safely returns undefined');

  // =========================================================================
  // CATEGORY B: USER PREFERENCES (8 Tests)
  // =========================================================================
  console.log('\n--- CATEGORY B: USER PREFERENCES (8 TESTS) ---');

  // B1: Concise answer preference
  const candB1: MemoryWriteCandidate = {
    userId: 'user_B',
    category: 'USER_PREFERENCE',
    key: 'response_length_preference',
    value: 'Prefers concise, direct answers without unnecessary expansion',
    sourceType: 'user_explicit',
  };
  const resB1 = await consolidator.consolidate(candB1, writeGate.evaluate(candB1));
  assert(resB1.memory.category === 'USER_PREFERENCE', 'B1', 'Stores concise response preference');

  // B2: Classical references preference
  const candB2: MemoryWriteCandidate = {
    userId: 'user_B',
    category: 'USER_PREFERENCE',
    key: 'tradition_preference',
    value: 'Prefers classical citations from BPHS and Phaladeepika',
    sourceType: 'user_explicit',
  };
  const resB2 = await consolidator.consolidate(candB2, writeGate.evaluate(candB2));
  assert(resB2.memory.key === 'tradition_preference', 'B2', 'Stores classical references preference');

  // B3: Practical interpretation preference
  const candB3: MemoryWriteCandidate = {
    userId: 'user_B',
    category: 'USER_PREFERENCE',
    key: 'counseling_style',
    value: 'Prefers practical career advice over abstract symbolism',
    sourceType: 'user_explicit',
  };
  const resB3 = await consolidator.consolidate(candB3, writeGate.evaluate(candB3));
  assert(resB3.memory.value.includes('practical career advice'), 'B3', 'Stores practical interpretation preference');

  // B4: Tone preference
  const candB4: MemoryWriteCandidate = {
    userId: 'user_B',
    category: 'USER_PREFERENCE',
    key: 'tone_preference',
    value: 'Prefers calm and objective tone without fatalism',
    sourceType: 'user_explicit',
  };
  const resB4 = await consolidator.consolidate(candB4, writeGate.evaluate(candB4));
  assert(resB4.memory.key === 'tone_preference', 'B4', 'Stores objective tone preference');

  // B5: Deduplication of identical preference
  const resB5 = await consolidator.consolidate(candB1, writeGate.evaluate(candB1));
  assert(resB5.action === 'rejected_duplicate', 'B5', 'Correctly rejects duplicate preference record');

  // B6: Updating preference value supersedes prior record
  const candB6: MemoryWriteCandidate = {
    userId: 'user_B',
    category: 'USER_PREFERENCE',
    key: 'response_length_preference',
    value: 'Prefers detailed technical expositions with mathematical degrees',
    sourceType: 'user_explicit',
  };
  const resB6 = await consolidator.consolidate(candB6, writeGate.evaluate(candB6));
  assert(resB6.action === 'superseded_old', 'B6', 'Updating preference supersedes old record');

  // B7: Verified that old preference is now superseded
  const oldB1 = await repo.getById('user_B', resB1.memory.memoryId);
  assert(oldB1?.status === 'superseded', 'B7', 'Old preference status set to superseded');

  // B8: Active preferences query only returns active records
  const activePrefsB = await repo.find({ userId: 'user_B', categories: ['USER_PREFERENCE'], status: 'active' });
  assert(!activePrefsB.some(p => p.memoryId === resB1.memory.memoryId), 'B8', 'Superseded preference omitted from active query');

  // =========================================================================
  // CATEGORY C: CONSULTATION TOPICS (8 Tests)
  // =========================================================================
  console.log('\n--- CATEGORY C: CONSULTATION TOPICS (8 TESTS) ---');

  // C1: Career topic
  const candC1: MemoryWriteCandidate = {
    userId: 'user_C',
    category: 'CONSULTATION_TOPIC',
    key: 'topic_career_advancement',
    value: 'Recurring consultation focus on 10th house executive leadership and promotion',
    sourceType: 'assistant_derived',
    tags: ['career', 'topic'],
  };
  const resC1 = await consolidator.consolidate(candC1, writeGate.evaluate(candC1));
  assert(resC1.memory.category === 'CONSULTATION_TOPIC', 'C1', 'Stores career advancement topic');

  // C2: Marriage topic
  const candC2: MemoryWriteCandidate = {
    userId: 'user_C',
    category: 'CONSULTATION_TOPIC',
    key: 'topic_marriage_compatibility',
    value: 'Recurring consultation focus on 7th house and Venus D9 timing',
    sourceType: 'assistant_derived',
    tags: ['relationship', 'marriage'],
  };
  const resC2 = await consolidator.consolidate(candC2, writeGate.evaluate(candC2));
  assert(resC2.memory.tags.includes('marriage'), 'C2', 'Stores marriage topic with tags');

  // C3: Finance topic
  const candC3: MemoryWriteCandidate = {
    userId: 'user_C',
    category: 'CONSULTATION_TOPIC',
    key: 'topic_financial_expansion',
    value: 'Recurring consultation focus on 11th house gains and wealth confluences',
    sourceType: 'assistant_derived',
    tags: ['finance', 'wealth'],
  };
  const resC3 = await consolidator.consolidate(candC3, writeGate.evaluate(candC3));
  assert(resC3.memory.key === 'topic_financial_expansion', 'C3', 'Stores wealth topic');

  // C4: Spirituality topic
  const candC4: MemoryWriteCandidate = {
    userId: 'user_C',
    category: 'CONSULTATION_TOPIC',
    key: 'topic_spiritual_dharma',
    value: 'Recurring consultation focus on 9th/12th house dharma and meditation',
    sourceType: 'assistant_derived',
    tags: ['spirituality', 'dharma'],
  };
  const resC4 = await consolidator.consolidate(candC4, writeGate.evaluate(candC4));
  assert(resC4.memory.tags.includes('spirituality'), 'C4', 'Stores spiritual dharma topic');

  // C5: Filter topics by domain
  const careerTopics = await repo.find({ userId: 'user_C', categories: ['CONSULTATION_TOPIC'], domain: 'career' });
  assert(careerTopics.length === 1 && careerTopics[0].key === 'topic_career_advancement', 'C5', 'Filters topics by domain cleanly');

  // C6: Filter topics by relationship domain
  const relTopics = await repo.find({ userId: 'user_C', categories: ['CONSULTATION_TOPIC'], domain: 'relationship' });
  assert(relTopics.length === 1 && relTopics[0].tags.includes('marriage'), 'C6', 'Filters topics by relationship domain');

  // C7: Assistant derived trust assignment
  assert(resC1.memory.sourceTrust === 'HISTORICAL_INTERPRETATION', 'C7', 'Assistant derived topics receive HISTORICAL_INTERPRETATION trust');

  // C8: Assistant derived topics marked requires_recheck
  assert(resC1.memory.validationStatus === 'requires_recheck', 'C8', 'Astrology topics flagged requires_recheck');

  // =========================================================================
  // CATEGORY D: LONG-TERM THREADS (8 Tests)
  // =========================================================================
  console.log('\n--- CATEGORY D: LONG-TERM THREADS (8 TESTS) ---');

  // D1: Career timing thread
  const candD1: MemoryWriteCandidate = {
    userId: 'user_D',
    category: 'CONSULTATION_THREAD',
    key: 'career_promotion_timing_thread',
    value: 'Ongoing open inquiry: Peak promotion timing confluence in late 2026 vs 2027',
    sourceType: 'assistant_derived',
    tags: ['career', 'timing', 'thread'],
  };
  const resD1 = await consolidator.consolidate(candD1, writeGate.evaluate(candD1));
  assert(resD1.memory.category === 'CONSULTATION_THREAD', 'D1', 'Stores long-term career timing thread');

  // D2: Marriage timing thread
  const candD2: MemoryWriteCandidate = {
    userId: 'user_D',
    category: 'CONSULTATION_THREAD',
    key: 'marriage_timing_thread',
    value: 'Ongoing open inquiry: Favorable marriage transit window in late 2026',
    sourceType: 'assistant_derived',
    tags: ['relationship', 'marriage', 'thread'],
  };
  const resD2 = await consolidator.consolidate(candD2, writeGate.evaluate(candD2));
  assert(resD2.memory.tags.includes('thread'), 'D2', 'Stores marriage timing thread');

  // D3: Education thread
  const candD3: MemoryWriteCandidate = {
    userId: 'user_D',
    category: 'CONSULTATION_THREAD',
    key: 'higher_education_thread',
    value: 'Ongoing open inquiry: MBA vs Master in Data Science in foreign university',
    sourceType: 'assistant_derived',
    tags: ['education', 'career', 'thread'],
  };
  const resD3 = await consolidator.consolidate(candD3, writeGate.evaluate(candD3));
  assert(resD3.memory.key === 'higher_education_thread', 'D3', 'Stores education thread');

  // D4: Business expansion thread
  const candD4: MemoryWriteCandidate = {
    userId: 'user_D',
    category: 'CONSULTATION_THREAD',
    key: 'business_expansion_thread',
    value: 'Ongoing open inquiry: Commercial trade expansion under Mercury antardasha',
    sourceType: 'assistant_derived',
    tags: ['business', 'thread'],
  };
  const resD4 = await consolidator.consolidate(candD4, writeGate.evaluate(candD4));
  assert(resD4.memory.category === 'CONSULTATION_THREAD', 'D4', 'Stores business thread');

  // D5: Thread resolution / soft delete
  await repo.update('user_D', resD4.memory.memoryId, { status: 'superseded' });
  const updatedD4 = await repo.getById('user_D', resD4.memory.memoryId);
  assert(updatedD4?.status === 'superseded', 'D5', 'Successfully marks resolved thread as superseded');

  // D6: Active thread retrieval excludes superseded
  const activeThreadsD = await repo.find({ userId: 'user_D', categories: ['CONSULTATION_THREAD'], status: 'active' });
  assert(activeThreadsD.length === 3, 'D6', 'Active threads query excludes superseded thread');

  // D7: Provenance preservation
  assert(Boolean(resD1.memory.createdAt && resD1.memory.updatedAt), 'D7', 'Preserves complete timestamp provenance on threads');

  // D8: Version tracking
  assert(resD1.memory.version === 1, 'D8', 'Thread initializes at version 1');

  // =========================================================================
  // CATEGORY E: MEMORY RETRIEVAL RELEVANCE (10 Tests)
  // =========================================================================
  console.log('\n--- CATEGORY E: MEMORY RETRIEVAL RELEVANCE (10 TESTS) ---');

  // Setup user_E with career and marriage memories
  await repo.save({
    memoryId: 'mem_E_career_1',
    userId: 'user_E',
    category: 'USER_FACT',
    key: 'current_profession',
    value: 'Staff Engineer at Cloud Infrastructure',
    normalizedValue: 'staff engineer cloud infrastructure',
    sourceType: 'user_explicit',
    sourceTrust: 'USER_CONFIRMED',
    status: 'active',
    sensitivity: 'normal',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    validationStatus: 'validated',
    evidenceRefs: [],
    tags: ['career', 'profession'],
    version: 1,
    confidence: 1.0,
  });

  await repo.save({
    memoryId: 'mem_E_career_2',
    userId: 'user_E',
    category: 'CONSULTATION_THREAD',
    key: 'career_promotion_timing_thread',
    value: 'Promotion timing discussion around 2027 Jupiter transit',
    normalizedValue: 'promotion timing discussion 2027',
    sourceType: 'assistant_derived',
    sourceTrust: 'HISTORICAL_INTERPRETATION',
    status: 'active',
    sensitivity: 'normal',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    validationStatus: 'validated',
    evidenceRefs: [],
    tags: ['career', 'timing', 'jupiter'],
    version: 1,
    confidence: 0.9,
  });

  await repo.save({
    memoryId: 'mem_E_marriage_1',
    userId: 'user_E',
    category: 'USER_FACT',
    key: 'marriage_preference',
    value: 'Seeking partners with creative and artistic background',
    normalizedValue: 'seeking partners creative artistic background',
    sourceType: 'user_explicit',
    sourceTrust: 'USER_CONFIRMED',
    status: 'active',
    sensitivity: 'personal',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    validationStatus: 'validated',
    evidenceRefs: [],
    tags: ['relationship', 'marriage'],
    version: 1,
    confidence: 1.0,
  });

  await repo.save({
    memoryId: 'mem_E_pref_1',
    userId: 'user_E',
    category: 'USER_PREFERENCE',
    key: 'response_length_preference',
    value: 'Prefers concise answers',
    normalizedValue: 'prefers concise answers',
    sourceType: 'user_explicit',
    sourceTrust: 'USER_CONFIRMED',
    status: 'active',
    sensitivity: 'normal',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    validationStatus: 'validated',
    evidenceRefs: [],
    tags: ['style'],
    version: 1,
    confidence: 1.0,
  });

  // E1: Career query selects career memories
  const retE1 = await retriever.retrieve({
    userId: 'user_E',
    domain: 'career',
    topic: 'promotion',
    entities: ['Jupiter'],
  });
  assert(
    retE1.pack.selectedMemories.some(m => m.memoryId === 'mem_E_career_1'),
    'E1',
    'Career query retrieves user career fact'
  );

  // E2: Career query retrieves career thread
  assert(
    retE1.pack.selectedMemories.some(m => m.memoryId === 'mem_E_career_2'),
    'E2',
    'Career query retrieves career thread'
  );

  // E3: Career query includes user style preference
  assert(
    retE1.pack.selectedMemories.some(m => m.memoryId === 'mem_E_pref_1'),
    'E3',
    'Career query includes user presentation preference'
  );

  // E4: Career query EXCLUDES unrelated marriage fact
  assert(
    !retE1.pack.selectedMemories.some(m => m.memoryId === 'mem_E_marriage_1'),
    'E4',
    'Career query strictly excludes unrelated marriage fact (zero cross-domain bleed)'
  );

  // E5: Marriage query selects marriage memory
  const retE5 = await retriever.retrieve({
    userId: 'user_E',
    domain: 'relationship',
    topic: 'marriage partner',
    entities: ['Venus'],
  });
  assert(
    retE5.pack.selectedMemories.some(m => m.memoryId === 'mem_E_marriage_1'),
    'E5',
    'Relationship query retrieves marriage preference'
  );

  // E6: Marriage query EXCLUDES career fact
  assert(
    !retE5.pack.selectedMemories.some(m => m.memoryId === 'mem_E_career_1'),
    'E6',
    'Relationship query strictly excludes career fact'
  );

  // E7: Retrieval latency under 20ms
  assert(retE1.pack.latencyMs < 20, 'E7', `Retrieval executed in ${retE1.pack.latencyMs}ms (<20ms threshold)`);

  // E8: Context summary generated
  assert(retE1.pack.contextSummary.includes('Staff Engineer'), 'E8', 'Context pack formats human-scannable context summary');

  // E9: Max memories budgeting enforced
  const retE9 = await retriever.retrieve({
    userId: 'user_E',
    domain: 'career',
    maxMemories: 2,
  });
  assert(retE9.pack.selectedMemories.length <= 2, 'E9', 'Enforces strict maxMemories retrieval limit');

  // E10: Trace observability
  assert(retE1.trace.memoriesConsideredCount >= 4, 'E10', 'MemoryTrace records memories considered count');

  // =========================================================================
  // CATEGORY F: MEMORY CONFLICTS & EVOLUTION (8 Tests)
  // =========================================================================
  console.log('\n--- CATEGORY F: MEMORY CONFLICTS & EVOLUTION (8 TESTS) ---');

  // F1: Create initial job role
  const candF1: MemoryWriteCandidate = {
    userId: 'user_F',
    category: 'USER_FACT',
    key: 'target_role',
    value: 'Targeting backend engineering roles',
    sourceType: 'user_explicit',
  };
  const resF1 = await consolidator.consolidate(candF1, writeGate.evaluate(candF1));
  assert(resF1.action === 'created', 'F1', 'Initial target role created');

  // F2: Contradicting update supersedes old memory
  const candF2: MemoryWriteCandidate = {
    userId: 'user_F',
    category: 'USER_FACT',
    key: 'target_role',
    value: 'Targeting AI engineering roles',
    sourceType: 'user_explicit',
  };
  const resF2 = await consolidator.consolidate(candF2, writeGate.evaluate(candF2));
  assert(
    resF2.action === 'superseded_old' && resF2.supersededMemoryId === resF1.memory.memoryId,
    'F2',
    'Conflicting new goal supersedes older goal'
  );

  // F3: Old memory status is superseded
  const oldF1 = await repo.getById('user_F', resF1.memory.memoryId);
  assert(oldF1?.status === 'superseded', 'F3', 'Old memory status verified as superseded');

  // F4: Old memory points to new superseding memory
  assert(oldF1?.supersededByMemoryId === resF2.memory.memoryId, 'F4', 'Old memory records supersededByMemoryId pointer');

  // F5: New memory points to superseded memory
  assert(resF2.memory.supersedesMemoryId === resF1.memory.memoryId, 'F5', 'New memory records supersedesMemoryId pointer');

  // F6: Active query returns ONLY the new active value
  const activeF = await repo.find({ userId: 'user_F', keys: ['target_role'], status: 'active' });
  assert(activeF.length === 1 && activeF[0].value.includes('AI engineering'), 'F6', 'Active query returns only the current active goal');

  // F7: Third update preserves unbroken lineage
  const candF7: MemoryWriteCandidate = {
    userId: 'user_F',
    category: 'USER_FACT',
    key: 'target_role',
    value: 'Targeting Quantum ML research',
    sourceType: 'user_explicit',
  };
  const resF7 = await consolidator.consolidate(candF7, writeGate.evaluate(candF7));
  assert(resF7.supersededMemoryId === resF2.memory.memoryId, 'F7', 'Third update supersedes second in unbroken lineage chain');

  // F8: Repository count includes superseded records
  const totalF = await repo.count('user_F');
  assert(totalF === 3, 'F8', 'Repository stores all versions in history (3 records)');

  // =========================================================================
  // CATEGORY G: MEMORY CORRECTION (8 Tests)
  // =========================================================================
  console.log('\n--- CATEGORY G: MEMORY CORRECTION (8 TESTS) ---');

  // G1: User correction created
  const candG1: MemoryWriteCandidate = {
    userId: 'user_G',
    category: 'USER_CORRECTION',
    key: 'user_clarification',
    value: 'Actually my appraisal is in October, not August',
    sourceType: 'user_explicit',
  };
  const resG1 = await consolidator.consolidate(candG1, writeGate.evaluate(candG1));
  assert(resG1.memory.category === 'USER_CORRECTION', 'G1', 'Stores explicit user timing correction');

  // G2: Correction receives highest trust USER_CONFIRMED
  assert(resG1.memory.sourceTrust === 'USER_CONFIRMED', 'G2', 'User correction receives USER_CONFIRMED trust');

  // G3: Job title correction
  const candG3: MemoryWriteCandidate = {
    userId: 'user_G',
    category: 'USER_CORRECTION',
    key: 'role_clarification',
    value: 'Actually I am in individual technical consulting, not management',
    sourceType: 'user_explicit',
  };
  const resG3 = await consolidator.consolidate(candG3, writeGate.evaluate(candG3));
  assert(resG3.memory.value.includes('consulting, not management'), 'G3', 'Stores job title correction');

  // G4: Retrieval includes corrections for topic
  const retG4 = await retriever.retrieve({ userId: 'user_G', domain: 'career' });
  assert(retG4.pack.selectedMemories.some(m => m.category === 'USER_CORRECTION'), 'G4', 'Retrieval prioritizes user corrections in career domain');

  // G5: Candidate generator detects "Actually I am..."
  const genG5 = generator.generateCandidates({
    userId: 'user_G',
    userMessage: 'Actually I am targeting fintech startups, not legacy banks.',
  });
  assert(genG5.some(c => c.category === 'USER_CORRECTION'), 'G5', 'Candidate generator identifies "Actually..." correction');

  // G6: Candidate generator detects "Actually my appraisal..."
  const genG6 = generator.generateCandidates({
    userId: 'user_G',
    userMessage: 'Actually my appraisal is in November.',
  });
  assert(genG6.some(c => c.category === 'USER_CORRECTION'), 'G6', 'Candidate generator identifies appraisal correction');

  // G7: User correction validation status
  assert(resG1.memory.validationStatus === 'validated', 'G7', 'User corrections are marked validated immediately');

  // G8: Correction does not leak into unrelated domains
  const retG8 = await retriever.retrieve({ userId: 'user_G', domain: 'spirituality' });
  assert(!retG8.pack.selectedMemories.some(m => m.key === 'role_clarification'), 'G8', 'Job correction does not leak into spirituality domain');

  // =========================================================================
  // CATEGORY H: ASTROLOGY-MEMORY VALIDATION (FIREWALL) (10 Tests)
  // =========================================================================
  console.log('\n--- CATEGORY H: ASTROLOGY-MEMORY VALIDATION (FIREWALL) (10 TESTS) ---');

  // Mock Evidence Packet where Jupiter is in Cancer and Mahadasha is Moon
  const mockEvidence: EvidencePacket = {
    version: 'v2',
    question: { raw: 'q_test_h', normalized: 'q_test_h', intent: 'general', domain: 'career' },
    plan: {} as any,
    createdAtIso: new Date().toISOString(),
    derivedFacts: [],
    facts: [
      {
        id: 'fact_chart_1',
        sourceTool: 'get_birth_chart',
        category: 'natal',
        entity: 'Jupiter',
        property: 'position',
        value: { positions: { Jupiter: { sign: 'Cancer', degree: 17.75 } } },
        verified: true,
      },
      {
        id: 'fact_dasha_1',
        sourceTool: 'get_current_dasha',
        category: 'dasha',
        entity: 'Vimshottari',
        property: 'period',
        value: { mahadasha: 'Moon', antardasha: 'Venus' },
        verified: true,
      },
    ],
    toolResults: [],
    provenance: [],
    warnings: [],
    missingEvidence: [],
    executionMetrics: { totalDurationMs: 0, toolsExecutedCount: 2, parallelBatchesCount: 1 },
    verified: true,
  };

  const mockReasoning: ReasoningPacket = {
    questionId: 'q_test_h',
    direction: 'supportive',
    strength: 'strong',
    primaryFactors: [],
    supportingFactors: [],
    restrictingFactors: [],
    appliedRules: [],
  } as any;

  // H1: Non-astrological memory passes without requiring engine check
  const nonAstroMem: PersistentMemory = {
    memoryId: 'mem_h1',
    userId: 'user_H',
    category: 'USER_FACT',
    key: 'preferred_name',
    value: 'Vikram',
    normalizedValue: 'vikram',
    sourceType: 'user_explicit',
    sourceTrust: 'USER_CONFIRMED',
    status: 'active',
    sensitivity: 'normal',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    validationStatus: 'validated',
    evidenceRefs: [],
    tags: [],
    version: 1,
    confidence: 1.0,
  };
  const valH1 = validator.validateAgainstCurrentContext(nonAstroMem, mockEvidence, mockReasoning);
  assert(valH1.isAstrological === false && valH1.validationStatus === 'not_applicable', 'H1', 'Non-astrological memory skips engine revalidation');

  // H2: Historical assistant conclusion claiming Jupiter in Cancer is VALIDATED
  const validAstroMem: PersistentMemory = {
    memoryId: 'mem_h2',
    userId: 'user_H',
    category: 'ASSISTANT_CONCLUSION',
    key: 'jupiter_placement',
    value: 'Jupiter in Cancer activates 10th house authority',
    normalizedValue: 'jupiter in cancer activates 10th house authority',
    sourceType: 'assistant_derived',
    sourceTrust: 'HISTORICAL_INTERPRETATION',
    status: 'active',
    sensitivity: 'normal',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    validationStatus: 'requires_recheck',
    evidenceRefs: [],
    tags: ['jupiter'],
    version: 1,
    confidence: 0.9,
  };
  const valH2 = validator.validateAgainstCurrentContext(validAstroMem, mockEvidence, mockReasoning);
  assert(valH2.isValidated === true && valH2.validationStatus === 'validated', 'H2', 'Valid historical placement is confirmed by current chart evidence');

  // H3: Historical assistant conclusion claiming Jupiter in Leo is INVALIDATED
  const falseAstroMem: PersistentMemory = {
    memoryId: 'mem_h3',
    userId: 'user_H',
    category: 'ASSISTANT_CONCLUSION',
    key: 'jupiter_placement',
    value: 'Jupiter in Leo activates creative leadership',
    normalizedValue: 'jupiter in leo activates creative leadership',
    sourceType: 'assistant_derived',
    sourceTrust: 'HISTORICAL_INTERPRETATION',
    status: 'active',
    sensitivity: 'normal',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    validationStatus: 'requires_recheck',
    evidenceRefs: [],
    tags: ['jupiter'],
    version: 1,
    confidence: 0.9,
  };
  const valH3 = validator.validateAgainstCurrentContext(falseAstroMem, mockEvidence, mockReasoning);
  assert(valH3.isValidated === false && valH3.validationStatus === 'invalidated', 'H3', 'Contradicted historical placement (Leo vs Cancer) is strictly invalidated');

  // H4: Historical dasha claim claiming Sun Mahadasha is INVALIDATED (Current is Moon)
  const falseDashaMem: PersistentMemory = {
    memoryId: 'mem_h4',
    userId: 'user_H',
    category: 'ASSISTANT_CONCLUSION',
    key: 'dasha_claim',
    value: 'Running Sun Mahadasha with promotion timing',
    normalizedValue: 'running sun mahadasha with promotion timing',
    sourceType: 'assistant_derived',
    sourceTrust: 'HISTORICAL_INTERPRETATION',
    status: 'active',
    sensitivity: 'normal',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    validationStatus: 'requires_recheck',
    evidenceRefs: [],
    tags: ['dasha'],
    version: 1,
    confidence: 0.9,
  };
  const valH4 = validator.validateAgainstCurrentContext(falseDashaMem, mockEvidence, mockReasoning);
  assert(valH4.conflictsWithCurrentEvidence === true && valH4.validationStatus === 'invalidated', 'H4', 'Contradicted dasha claim (Sun vs Moon) is invalidated');

  // H5: Historical dasha claim claiming Moon Mahadasha is VALIDATED
  const trueDashaMem: PersistentMemory = {
    memoryId: 'mem_h5',
    userId: 'user_H',
    category: 'ASSISTANT_CONCLUSION',
    key: 'dasha_claim',
    value: 'Running Moon Mahadasha until 2028',
    normalizedValue: 'running moon mahadasha until 2028',
    sourceType: 'assistant_derived',
    sourceTrust: 'HISTORICAL_INTERPRETATION',
    status: 'active',
    sensitivity: 'normal',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    validationStatus: 'requires_recheck',
    evidenceRefs: [],
    tags: ['dasha'],
    version: 1,
    confidence: 0.9,
  };
  const valH5 = validator.validateAgainstCurrentContext(trueDashaMem, mockEvidence, mockReasoning);
  assert(valH5.isValidated === true && valH5.validationStatus === 'validated', 'H5', 'Accurate dasha claim (Moon Mahadasha) is validated');

  // H6: Invalidated historical memory is rejected at retrieval time
  await repo.save(falseAstroMem);
  const retH6 = await retriever.retrieve({
    userId: 'user_H',
    domain: 'career',
    currentEvidence: mockEvidence,
    currentReasoning: mockReasoning,
  });
  assert(
    !retH6.pack.selectedMemories.some(m => m.memoryId === 'mem_h3'),
    'H6',
    'Retriever strictly drops invalidated historical conclusion (never injected into prompt)'
  );

  // H7: Validated historical memory is accepted at retrieval time
  await repo.save(validAstroMem);
  const retH7 = await retriever.retrieve({
    userId: 'user_H',
    domain: 'career',
    currentEvidence: mockEvidence,
    currentReasoning: mockReasoning,
  });
  assert(
    retH7.pack.selectedMemories.some(m => m.memoryId === 'mem_h2'),
    'H7',
    'Retriever retains verified historical astrology memory'
  );

  // H8: Trace records invalidated memory reason
  assert(
    retH6.trace.rejectionReasons.some(r => r.memoryId === 'mem_h3'),
    'H8',
    'MemoryTrace records explicit rejection reason for invalidated astrology memory'
  );

  // H9: Missing evidence flags requires_recheck
  const valH9 = validator.validateAgainstCurrentContext(validAstroMem, undefined, undefined);
  assert(valH9.validationStatus === 'requires_recheck', 'H9', 'Missing current evidence flags requires_recheck');

  // H10: Directional contradiction with reasoning flags conflict
  const insufficientReasoning: ReasoningPacket = {
    ...mockReasoning,
    direction: 'insufficient_evidence',
  } as any;
  const favorableMem: PersistentMemory = {
    ...validAstroMem,
    memoryId: 'mem_h10',
    value: 'Jupiter provides strongly favorable promotion certainty in August',
  };
  const valH10 = validator.validateAgainstCurrentContext(favorableMem, mockEvidence, insufficientReasoning);
  assert(valH10.conflictsWithCurrentEvidence === true, 'H10', 'Directional conflict with current reasoning flags conflict');

  // =========================================================================
  // CATEGORY I: USER MEMORY COMMANDS (5 Tests)
  // =========================================================================
  console.log('\n--- CATEGORY I: USER MEMORY COMMANDS (5 TESTS) ---');

  // I1: "Remember that..." command
  const resI1 = await commandResolver.executeCommand('user_I', 'Remember that I am preparing for AI engineering leadership.');
  assert(resI1.handled === true && resI1.action === 'remember', 'I1', 'Executes "Remember that..." command successfully');

  // I2: "What do you remember about me?" command
  const resI2 = await commandResolver.executeCommand('user_I', 'What do you remember about me?');
  assert(
    resI2.handled === true &&
      resI2.action === 'list_memories' &&
      Boolean(resI2.responseMessage?.includes('AI engineering leadership')),
    'I2',
    'Executes "What do you remember about me?" command returning friendly bulleted list'
  );

  // I3: No internal leakage in "What do you remember" response
  assert(
    !resI2.responseMessage?.includes('mem_') &&
      !resI2.responseMessage?.includes('confidence') &&
      !resI2.responseMessage?.includes('USER_FACT'),
    'I3',
    'User memory summary contains zero internal memory IDs, confidence scores, or enum codes'
  );

  // I4: "Don't remember that" command
  const resI4 = await commandResolver.executeCommand('user_I', "Don't remember that.");
  assert(resI4.handled === true && resI4.action === 'revoke_last', 'I4', 'Executes "Don\'t remember that" command');

  // I5: "Forget everything you remember about me" command
  const resI5 = await commandResolver.executeCommand('user_I', 'Forget everything you remember about me.');
  assert(
    resI5.handled === true && resI5.action === 'forget_all',
    'I5',
    'Executes "Forget everything..." command wiping all stored user memories'
  );

  // =========================================================================
  // CATEGORY J: PRIVACY & SECURITY ISOLATION (5 Tests)
  // =========================================================================
  console.log('\n--- CATEGORY J: PRIVACY & SECURITY ISOLATION (5 TESTS) ---');

  // J1: Cross-user data isolation
  await repo.save({
    memoryId: 'mem_secret_user_J1',
    userId: 'user_J1',
    category: 'USER_FACT',
    key: 'private_financial_goal',
    value: 'Confidential net worth target $10M',
    normalizedValue: 'confidential net worth target $10m',
    sourceType: 'user_explicit',
    sourceTrust: 'USER_CONFIRMED',
    status: 'active',
    sensitivity: 'sensitive',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    validationStatus: 'validated',
    evidenceRefs: [],
    tags: ['private'],
    version: 1,
    confidence: 1.0,
  });

  const j2Memories = await repo.find({ userId: 'user_J2' });
  assert(
    !j2Memories.some(m => m.memoryId === 'mem_secret_user_J1'),
    'J1',
    'User J2 cannot retrieve or see memories belonging to User J1 (zero cross-user leakage)'
  );

  // J2: Direct getById with wrong userId returns undefined
  const crossGet = await repo.getById('user_J2', 'mem_secret_user_J1');
  assert(crossGet === undefined, 'J2', 'Direct getById with mismatched userId safely returns undefined');

  // J3: Rejection of inferred sensitive health/medical attributes
  const candJ3: MemoryWriteCandidate = {
    userId: 'user_J1',
    category: 'USER_FACT',
    key: 'inferred_health_condition',
    value: 'User has severe mental illness and depression',
    sourceType: 'assistant_derived', // NOT explicit user confirmation!
  };
  const decJ3 = writeGate.evaluate(candJ3);
  assert(decJ3.accepted === false, 'J3', 'WriteGate strictly rejects unconfirmed inference of sensitive medical/mental health conditions');

  // J4: Rejection of inferred sensitive political/sexual attributes
  const candJ4: MemoryWriteCandidate = {
    userId: 'user_J1',
    category: 'USER_FACT',
    key: 'inferred_politics',
    value: 'User political affiliation voting history',
    sourceType: 'assistant_derived',
  };
  const decJ4 = writeGate.evaluate(candJ4);
  assert(decJ4.accepted === false, 'J4', 'WriteGate strictly rejects unconfirmed inference of political attributes');

  // J5: Deleted memory is permanently unretrievable
  await repo.save({
    memoryId: 'mem_to_delete',
    userId: 'user_J1',
    category: 'USER_FACT',
    key: 'temporary_item',
    value: 'Temporary note',
    normalizedValue: 'temporary note',
    sourceType: 'user_explicit',
    sourceTrust: 'USER_CONFIRMED',
    status: 'active',
    sensitivity: 'normal',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    validationStatus: 'validated',
    evidenceRefs: [],
    tags: [],
    version: 1,
    confidence: 1.0,
  });
  await repo.delete('user_J1', 'mem_to_delete');
  const postDelete = await repo.getById('user_J1', 'mem_to_delete');
  assert(postDelete === undefined, 'J5', 'Deleted memory record is immediately and permanently unretrievable');

  // =========================================================================
  // EXECUTE 20-SCENARIO MULTI-TURN BENCHMARK
  // =========================================================================
  console.log('\n================================================================================');
  console.log('RUNNING 20-SCENARIO MULTI-TURN CONSULTATION MEMORY BENCHMARK');
  console.log('================================================================================\n');

  const orchestrator = new ConsultationOrchestrator({
    forceMockMode: true,
    memoryRepository: repo,
  });

  let benchmarkPassed = 0;

  for (let sIdx = 0; sIdx < MEMORY_BENCHMARK_SCENARIOS.length; sIdx++) {
    const sc = MEMORY_BENCHMARK_SCENARIOS[sIdx];
    let scenarioSuccess = true;

    for (let stIdx = 0; stIdx < sc.steps.length; stIdx++) {
      const step = sc.steps[stIdx];
      const result = await orchestrator.consult(step.userQuery, BENCHMARK_TEST_PROFILE, {
        userId: sc.userId,
      });

      const respText = result.finalResponse.text;

      if (step.expectedSubstringInResponse) {
        if (!respText.toLowerCase().includes(step.expectedSubstringInResponse.toLowerCase())) {
          console.error(`  ❌ Benchmark ${sc.id} Step ${stIdx + 1} missing expected: "${step.expectedSubstringInResponse}"\nText: "${respText}"`);
          scenarioSuccess = false;
        }
      }

      if (step.prohibitedSubstringInResponse) {
        if (respText.toLowerCase().includes(step.prohibitedSubstringInResponse.toLowerCase())) {
          console.error(`  ❌ Benchmark ${sc.id} Step ${stIdx + 1} contains prohibited: "${step.prohibitedSubstringInResponse}"\nText: "${respText}"`);
          scenarioSuccess = false;
        }
      }
    }

    // Verify final assertions against stored memories
    const userMemories = await repo.find({ userId: sc.userId, status: 'active' });

    if (sc.finalAssertions.expectedActiveKeys) {
      for (const expKey of sc.finalAssertions.expectedActiveKeys) {
        if (!userMemories.some(m => m.key === expKey)) {
          console.error(`  ❌ Benchmark ${sc.id} missing expected active key: "${expKey}"`);
          scenarioSuccess = false;
        }
      }
    }

    if (sc.finalAssertions.prohibitedActiveKeys) {
      for (const proKey of sc.finalAssertions.prohibitedActiveKeys) {
        if (userMemories.some(m => m.key === proKey)) {
          console.error(`  ❌ Benchmark ${sc.id} contains prohibited active key: "${proKey}"`);
          scenarioSuccess = false;
        }
      }
    }

    if (scenarioSuccess) {
      benchmarkPassed++;
      console.log(`  ✅ [BENCHMARK PASSED] (${sIdx + 1}/20) [${sc.id}]: ${sc.title}`);
    } else {
      console.error(`  ❌ [BENCHMARK FAILED] (${sIdx + 1}/20) [${sc.id}]: ${sc.title}`);
    }
  }

  assert(
    benchmarkPassed === MEMORY_BENCHMARK_SCENARIOS.length,
    'BENCHMARK_SUITE',
    `All 20 multi-turn memory benchmark scenarios passed (20/20)`
  );

  // =========================================================================
  // RESULTS SUMMARY
  // =========================================================================
  console.log('\n================================================================================');
  console.log(`PHASE 5B PERSISTENT MEMORY VERIFICATION RESULTS`);
  console.log(`TOTAL TESTS: ${passedCount + failedCount} | PASSED: ${passedCount} | FAILED: ${failedCount}`);
  console.log(`BENCHMARK SCENARIOS: ${benchmarkPassed}/${MEMORY_BENCHMARK_SCENARIOS.length} PASSED`);
  console.log('================================================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runPhase5BVerificationSuite().catch(err => {
  console.error('Fatal error in Phase 5B verification suite:', err);
  process.exit(1);
});
