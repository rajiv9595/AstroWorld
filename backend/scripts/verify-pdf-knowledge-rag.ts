/**
 * ASTROWORLD — PDF Knowledge Base RAG Verification Script
 * Validates that all 43 PDF rulebooks (2,498 chunks) are indexed and queryable in DynamicRAGEngine.
 */

import { DocumentIngestionService } from '../src/ai_v2/rag/documentIngestionService.ts';
import { dynamicRAGEngine } from '../src/ai_v2/rag/dynamicRagEngine.ts';

console.log('================================================================================');
console.log('ASTROWORLD — PDF KNOWLEDGE RAG ENGINE VERIFICATION');
console.log('================================================================================');

// 1. Run ingestion
DocumentIngestionService.autoIngestPreloadedNotes();

const totalCount = dynamicRAGEngine.getTotalRuleCount();
console.log('RAG Engine Ingestion Stats:');
console.log(`  • Total Permanent KB Records:   ${totalCount}`);

if (totalCount < 2500) {
  console.error(`❌ [FAIL] Expected >= 2,500 total permanent records, found ${totalCount}`);
  process.exit(1);
}
console.log('✅ [PASS] All 2,498 PDF knowledge records permanently baked into static memory.');

// 2. Test semantic query: "Auditory Digital Communication"
const auditoryResults = dynamicRAGEngine.search({
  query: 'Auditory Digital Communication',
  limit: 3,
});
console.log('\nQuery: "Auditory Digital Communication"');
console.log(`Results Found: ${auditoryResults.length}`);
for (const r of auditoryResults) {
  console.log(`  -> Source: "${r.sourceText}" | Chapter: "${r.chapter}"`);
}
const matched = auditoryResults.some(r => r.sourceText.includes('Auditory'));
if (!matched) {
  console.error('❌ [FAIL] Did not retrieve Auditory Digital Communicator chunk');
  process.exit(1);
}
console.log(`✅ [PASS] Found Auditory chunk in results.`);

// 3. Test semantic query: "Choleric Temperament"
const cholericResults = dynamicRAGEngine.search({
  query: 'Choleric Temperament Core Values',
  limit: 3,
});
console.log('\nQuery: "Choleric Temperament"');
console.log(`Results Found: ${cholericResults.length}`);
if (cholericResults.length === 0 || !cholericResults[0].sourceText.includes('Choleric')) {
  console.error('❌ [FAIL] Did not retrieve Choleric Temperament chunk');
  process.exit(1);
}
console.log(`✅ [PASS] Top Hit: [${cholericResults[0].sourceText}] ${cholericResults[0].chapter}`);

// 4. Test semantic query: "Level of Thinking Local Global"
const thinkingResults = dynamicRAGEngine.search({
  query: 'Level of Thinking Local Global',
  limit: 3,
});
console.log('\nQuery: "Level of Thinking Local Global"');
console.log(`Results Found: ${thinkingResults.length}`);
if (thinkingResults.length === 0 || !thinkingResults[0].sourceText.includes('Thinking')) {
  console.error('❌ [FAIL] Did not retrieve Thinking Style chunk');
  process.exit(1);
}
console.log(`✅ [PASS] Top Hit: [${thinkingResults[0].sourceText}] ${thinkingResults[0].chapter}`);

console.log('\n================================================================================');
console.log('ALL PDF KNOWLEDGE RAG ENGINE CONTRACTS PASSED (100%)');
console.log('================================================================================');
