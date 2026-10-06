/**
 * ASTROWORLD — Phase 10 Classical Corpus Integrity Contract
 *
 * This gate validates the internal corpus contract. It does not pretend that
 * metadata alone proves a source-text transcription; source verification is
 * still a governed editorial process.
 */

import { CLASSICAL_JYOTISH_KNOWLEDGE_BASE } from '../src/ai_v2/rag/knowledgeBase.ts';
import { validateKnowledgeRecord } from '../src/ai_v2/schemas/knowledgeRecord.ts';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

assert(CLASSICAL_JYOTISH_KNOWLEDGE_BASE.length >= 1, 'Classical knowledge base must not be empty');

const ids = new Set<string>();
const citations = new Set<string>();

for (const record of CLASSICAL_JYOTISH_KNOWLEDGE_BASE) {
  const validation = validateKnowledgeRecord(record);
  assert(validation.valid, `Invalid knowledge record ${record.id}: ${validation.errors.join('; ')}`);
  assert(record.verified === true, `Unverified record in production corpus: ${record.id}`);
  assert(!ids.has(record.id), `Duplicate knowledge record id: ${record.id}`);
  ids.add(record.id);
  assert(!citations.has(record.citation), `Duplicate citation token: ${record.citation}`);
  citations.add(record.citation);
  assert(record.metadata.planetarySubjects.every(Boolean), `Empty planetary subject in ${record.id}`);
  assert(record.metadata.houseSubjects.every(h => Number.isInteger(h) && h >= 1 && h <= 12), `Invalid house subject in ${record.id}`);
  assert(record.metadata.vargaSubjects.every(Boolean), `Empty Varga subject in ${record.id}`);
  assert(record.metadata.tags.length > 0, `Knowledge record has no tags: ${record.id}`);
}

console.log(`✅ ${CLASSICAL_JYOTISH_KNOWLEDGE_BASE.length} classical records passed schema/source-integrity contract`);
console.log('✅ All production corpus records are explicitly verified and uniquely cited');
console.log('ℹ️ This gate validates repository metadata integrity; it does not replace editorial source-text verification');
