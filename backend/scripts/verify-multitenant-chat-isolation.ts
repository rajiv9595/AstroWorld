/**
 * ASTROWORLD — Multi-Tenant Chat Isolation & Privacy Verification
 *
 * Verifies that:
 * 1. User conversations and messages are strictly scoped by user_id in the database.
 * 2. User B cannot list, load, access, or modify User A's conversations or messages.
 * 3. AI Agent consult route enforces ownership checks against IDOR and conversation hijacking.
 * 4. Each user maintains their own private conversation history.
 */

import { ConversationPersistenceRepository } from '../src/ai_v2/conversation_state/conversationPersistenceRepository.ts';
import { ConversationState, ConversationTurn } from '../src/ai_v2/conversation_state/conversationStateTypes.ts';
import { ProductionConsultationService } from '../src/ai_v2/production/productionConsultationService.ts';
import { ConsultationOrchestrator } from '../src/ai_v2/consultation/consultationOrchestrator.ts';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`FAILED: ${message}`);
    throw new Error(message);
  }
}

const ALICE_ID = '11111111-1111-1111-1111-111111111111';
const BOB_ID = '22222222-2222-2222-2222-222222222222';

class MultiTenantMockDb {
  public conversations: Map<string, any> = new Map();
  public messages: any[] = [];

  public makeClient() {
    const self = this;
    return {
      from(table: string) {
        let filters: Array<{ field: string; value: any }> = [];
        let orderBy: { field: string; ascending: boolean } | null = null;
        let updatePayload: any = null;

        const builder: any = {
          select() {
            return builder;
          },
          eq(field: string, value: any) {
            filters.push({ field, value });
            return builder;
          },
          order(field: string, opts?: { ascending?: boolean }) {
            orderBy = { field, ascending: opts?.ascending ?? true };
            return builder;
          },
          async maybeSingle() {
            if (table === 'conversations') {
              for (const row of self.conversations.values()) {
                const match = filters.every(f => row[f.field] === f.value);
                if (match) return { data: { ...row }, error: null };
              }
            } else if (table === 'conversation_messages') {
              for (const row of self.messages) {
                const match = filters.every(f => row[f.field] === f.value);
                if (match) return { data: { ...row }, error: null };
              }
            }
            return { data: null, error: null };
          },
          async single() {
            const res = await builder.maybeSingle();
            if (!res.data) return { data: null, error: new Error('Not found') };
            return res;
          },
          insert(rows: any) {
            const list = Array.isArray(rows) ? rows : [rows];
            if (table === 'conversations') {
              for (const r of list) {
                self.conversations.set(r.id, { ...r });
              }
            } else if (table === 'conversation_messages') {
              self.messages.push(...list.map(r => ({ ...r })));
            }
            return {
              select() {
                return {
                  async single() {
                    return { data: list[0], error: null };
                  },
                };
              },
              data: rows,
              error: null,
            };
          },
          update(payload: any) {
            updatePayload = payload;
            return builder;
          },
          then(resolve: any, reject?: any) {
            let results: any[] = [];
            if (table === 'conversations') {
              results = Array.from(self.conversations.values()).filter(row =>
                filters.every(f => row[f.field] === f.value)
              );
            } else if (table === 'conversation_messages') {
              results = self.messages.filter(row =>
                filters.every(f => row[f.field] === f.value)
              );
            }
            return Promise.resolve({ data: results, error: null }).then(resolve, reject);
          },
        };
        return builder;
      },
    };
  }
}

async function runMultiTenantVerification() {
  console.log('--- STARTING MULTI-TENANT CHAT ISOLATION VERIFICATION ---');

  const mockDb = new MultiTenantMockDb();
  const repo = new ConversationPersistenceRepository({
    configured: true,
    supabaseClient: mockDb.makeClient(),
  });

  // 1. Alice creates conversation conv_alice_1
  const aliceState: ConversationState = {
    conversationId: 'conv_alice_1',
    turnIndex: 1,
    currentTopic: 'Marriage Prospects 2027',
    currentIntent: 'marriage_timing',
    currentDomain: 'relationships',
    activePlanetFocus: ['Venus', 'Jupiter'],
    activeHouseFocus: [7],
    activeVargas: ['D1', 'D9'],
    activeTimePeriods: ['2027'],
    activeDates: ['2027-04-15'],
    lastQuestion: 'When will I get married?',
    lastAnswerSummary: {
      mainConclusion: 'A strong marriage window opens between April and November 2027 under Jupiter Dasha.',
      supportingFactors: ['7th Lord exalted in D9', 'Jupiter transit 7th house'],
    },
    activeClaims: [],
    relevantPreviousClaims: [],
    userCorrections: [],
    unresolvedThreads: [],
    recentlyDiscussedFactors: ['Venus'],
    recentQuestions: ['When will I get married?'],
    recentAnswers: ['April-November 2027'],
    referencedTurnIds: ['turn_a1'],
    clarificationNeeded: false,
    contextConfidence: 1,
    stateVersion: 1,
    createdAtIso: '2026-10-20T10:00:00.000Z',
    updatedAtIso: '2026-10-20T10:00:00.000Z',
  };

  const aliceTurn: ConversationTurn = {
    turnId: 'turn_a1',
    turnIndex: 1,
    userMessage: 'When will I get married?',
    answerSummary: {
      mainConclusion: 'A strong marriage window opens between April and November 2027 under Jupiter Dasha.',
      supportingFactors: ['Venus', 'Jupiter'],
    },
    approvedClaimIds: [],
    dominantFactors: ['Venus'],
    domain: 'relationships',
    intent: 'marriage_timing',
    referencedFactors: ['Venus'],
    createdAt: '2026-10-20T10:00:00.000Z',
    executionMode: 'production',
    fullAnswer: 'Dear Alice, your chart reveals a potent relational window between April and November 2027...',
  };

  await repo.save(ALICE_ID, aliceState, aliceTurn);

  // 2. Alice's conversation exists and is owned by Alice
  const aliceOwnsAliceConv = await repo.owns(ALICE_ID, 'conv_alice_1');
  assert(aliceOwnsAliceConv === true, "Alice must own 'conv_alice_1'");

  const convOwner = await repo.getOwner('conv_alice_1');
  assert(convOwner === ALICE_ID, "Owner of 'conv_alice_1' must be Alice's UUID");

  // 3. Bob CANNOT own or load Alice's conversation
  const bobOwnsAliceConv = await repo.owns(BOB_ID, 'conv_alice_1');
  assert(bobOwnsAliceConv === false, "Bob must NOT own Alice's conversation");

  const bobLoadedAliceConv = await repo.load(BOB_ID, 'conv_alice_1');
  assert(bobLoadedAliceConv === null, "Bob must receive null when trying to load Alice's conversation");

  // 4. Bob's conversation list MUST NOT contain Alice's conversations
  const bobSummaries = await repo.listSummaries(BOB_ID);
  assert(bobSummaries.length === 0, "Bob's conversation summaries must be completely empty");

  // 5. Alice's conversation list DOES contain her conversation and full answer
  const aliceLoaded = await repo.load(ALICE_ID, 'conv_alice_1');
  assert(aliceLoaded !== null, "Alice must successfully load her conversation");
  assert(Boolean(aliceLoaded?.turns[0].fullAnswer?.includes('Dear Alice')), 'Alice must receive her full private consultation answer');

  // 6. Test ProductionConsultationService ownership checks
  const orchestrator = new ConsultationOrchestrator({
    conversationPersistence: repo,
  } as any);
  const prodService = new ProductionConsultationService({
    orchestrator,
  } as any);

  prodService.setConversationOwner('conv_alice_1', ALICE_ID);

  const isAliceOwned = await prodService.isConversationOwnedByAsync('conv_alice_1', ALICE_ID);
  assert(isAliceOwned === true, "prodService must confirm Alice owns 'conv_alice_1'");

  const isBobOwned = await prodService.isConversationOwnedByAsync('conv_alice_1', BOB_ID);
  assert(isBobOwned === false, "prodService must REJECT Bob attempting to claim 'conv_alice_1'");

  const bobOwnedConversations = await prodService.listConversationSummariesAsync(BOB_ID);
  assert(
    !bobOwnedConversations.some(c => c.conversationId === 'conv_alice_1'),
    "Bob's summary list must NEVER include Alice's conversation"
  );

  // 7. Bob creates his own conversation conv_bob_1
  const bobState: ConversationState = {
    conversationId: 'conv_bob_1',
    turnIndex: 1,
    currentTopic: 'Career Promotion 2026',
    currentIntent: 'career_timing',
    currentDomain: 'career',
    activePlanetFocus: ['Sun', 'Mars'],
    activeHouseFocus: [10],
    activeVargas: ['D1', 'D10'],
    activeTimePeriods: ['2026'],
    activeDates: ['2026-11-01'],
    lastQuestion: 'When will I be promoted?',
    lastAnswerSummary: {
      mainConclusion: 'Promotion prospects surge in late 2026.',
      supportingFactors: ['Mars D10 placement'],
    },
    activeClaims: [],
    relevantPreviousClaims: [],
    userCorrections: [],
    unresolvedThreads: [],
    recentlyDiscussedFactors: ['Sun'],
    recentQuestions: ['When will I be promoted?'],
    recentAnswers: ['Late 2026'],
    referencedTurnIds: ['turn_b1'],
    clarificationNeeded: false,
    contextConfidence: 1,
    stateVersion: 1,
    createdAtIso: '2026-10-20T11:00:00.000Z',
    updatedAtIso: '2026-10-20T11:00:00.000Z',
  };

  const bobTurn: ConversationTurn = {
    turnId: 'turn_b1',
    turnIndex: 1,
    userMessage: 'When will I be promoted?',
    answerSummary: {
      mainConclusion: 'Promotion prospects surge in late 2026.',
      supportingFactors: ['Mars'],
    },
    approvedClaimIds: [],
    dominantFactors: ['Mars'],
    domain: 'career',
    intent: 'career_timing',
    referencedFactors: ['Sun'],
    createdAt: '2026-10-20T11:00:00.000Z',
    executionMode: 'production',
    fullAnswer: 'Dear Bob, your 10th house indicates a leadership elevation in late 2026...',
  };

  await repo.save(BOB_ID, bobState, bobTurn);
  prodService.setConversationOwner('conv_bob_1', BOB_ID);

  // 8. Verify strict isolation: Alice only sees Alice's convs, Bob only sees Bob's convs
  const aliceList = await prodService.listConversationSummariesAsync(ALICE_ID);
  const bobList = await prodService.listConversationSummariesAsync(BOB_ID);

  assert(aliceList.length === 1 && aliceList[0].conversationId === 'conv_alice_1', 'Alice list must only contain Alice');
  assert(bobList.length === 1 && bobList[0].conversationId === 'conv_bob_1', 'Bob list must only contain Bob');

  console.log('✅ ALL 8 MULTI-TENANT CHAT ISOLATION CHECKS PASSED PERFECTLY!');
}

runMultiTenantVerification().catch(err => {
  console.error('Multi-tenant verification failed:', err);
  process.exit(1);
});
