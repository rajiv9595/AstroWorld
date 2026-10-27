/**
 * Specialization RAG Verification Test Script
 */
import { dynamicRAGEngine } from '../src/ai/rag/dynamicRagEngine.ts';
import { calculateSpecializationCoherenceScore } from '../src/ai/rag/specializationTechCorpus.ts';

const queries = [
  'Law LLB and advocate legal judiciary pathway',
  'Medicine physician MBBS clinical surgery',
  'Civil engineering construction and architecture',
  'ECE electronics electrical communication systems',
  'Chartered Accountancy commerce taxation auditing CA',
  'MBA business administration general management',
  'Artificial intelligence machine learning foundation models',
  'Robotics mechatronics and automation'
];

console.log('Testing Specialization RAG Dynamic Retrieval across 148 rules:\n');

for (const q of queries) {
  const res = dynamicRAGEngine.search({ query: q, limit: 2 });
  console.log(`Query: "${q}"`);
  for (const r of res) {
    console.log(`  -> [${r.id}] ${r.citation}`);
  }
}

// Test SCORE-001 Coherence formula
const sampleScore = calculateSpecializationCoherenceScore({
  educationConvergence: 0.85,
  planetaryThemeConvergence: 0.90,
  careerHouseConvergence: 0.80,
  vargaCorroboration: 0.75,
  dashaActivation: 0.70,
  contradictionPenalty: 0.05
});

console.log(`\nSample 5-Factor Thematic Coherence Score (SCORE-001): ${sampleScore}/100`);
console.log('Test completed successfully!');
