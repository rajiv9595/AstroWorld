/**
 * Verification Script: AI Guru Daivajna Intelligence, Past Calibration & Dynamic RAG
 */

import { calibratePastMilestones } from '../../shared/engine/pastCalibration.ts';
import { dynamicRAGEngine } from '../src/ai_v2/rag/dynamicRagEngine.ts';
import { DocumentIngestionService } from '../src/ai_v2/rag/documentIngestionService.ts';
import { createConsultAgent } from '../src/ai_agent/consultAgent.ts';
import { DEFAULT_BIRTH_PROFILE } from '../../shared/engine/canonicalChart.ts';

async function runVerification() {
  console.log('=== VERIFYING AI GURU DAIVAJNA INTELLIGENCE & DYNAMIC RAG ===\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, msg: string) {
    if (condition) {
      console.log(`✅ PASS: ${msg}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${msg}`);
      failed++;
    }
  }

  // -------------------------------------------------------------------------
  // 1. PAST CALIBRATION ENGINE TESTS
  // -------------------------------------------------------------------------
  console.log('--- 1. Testing Past Calibration Engine ---');
  // Moon in Sagittarius at 254.4° (Swami Vivekananda / standard benchmark)
  const evalDate = new Date('2026-10-20T00:00:00Z');
  const pastCal = calibratePastMilestones(254.4, new Date('1990-05-15T08:30:00Z'), evalDate, 8);

  assert(Array.isArray(pastCal.milestones), 'milestones is an array');
  assert(pastCal.milestones.length > 0, `Detected ${pastCal.milestones.length} past milestones`);
  assert(typeof pastCal.leadCalibrationSummary === 'string' && pastCal.leadCalibrationSummary.length > 20, 'Generated descriptive lead calibration summary');
  console.log(`   Sample Lead Summary: "${pastCal.leadCalibrationSummary.slice(0, 80)}..."`);
  assert(pastCal.milestones.some(m => m.periodLabel.includes('→')), 'Milestones contain formatted period labels');

  // -------------------------------------------------------------------------
  // 2. DYNAMIC RAG ENGINE & DOMAIN KNOWLEDGE TESTS
  // -------------------------------------------------------------------------
  console.log('\n--- 2. Testing Dynamic RAG Engine ---');
  const totalRules = dynamicRAGEngine.getTotalRuleCount();
  assert(totalRules >= 30, `Total rules in RAG repository: ${totalRules} (>= 30)`);

  // Wealth & Billionaire search
  const wealthResults = dynamicRAGEngine.search({ query: 'indu lagna billionaire dhana wealth', domain: 'wealth', limit: 3 });
  assert(wealthResults.length > 0, `Wealth query returned ${wealthResults.length} records`);
  assert(wealthResults.some(r => r.id.includes('wealth_indu_lagna') || r.id.includes('wealth_sav')), 'Found Indu Lagna or SAV wealth rule');

  // Modern tech / career search
  const techResults = dynamicRAGEngine.search({ query: 'software startup rahu mercury innovation', domain: 'career', limit: 3 });
  assert(techResults.length > 0, `Career tech query returned ${techResults.length} records`);
  assert(techResults.some(r => r.id.includes('tech_disruptor') || r.id.includes('career_d10')), 'Found modern tech disruptor or D10 rule');

  // Medical vulnerability search
  const medResults = dynamicRAGEngine.search({ query: '22nd drekkhana 64th navamsha vitality', domain: 'health', limit: 3 });
  assert(medResults.length > 0, `Medical query returned ${medResults.length} records`);
  assert(medResults.some(r => r.id.includes('22nd_drekkhana') || r.id.includes('maraka')), 'Found 22nd Drekkhana or Maraka rule');

  // Marriage Upapada search
  const marriageResults = dynamicRAGEngine.search({ query: 'upapada lagna navamsha spouse durability', domain: 'marriage', limit: 3 });
  assert(marriageResults.length > 0, `Marriage query returned ${marriageResults.length} records`);
  assert(marriageResults.some(r => r.id.includes('upapada') || r.id.includes('navamsha_marriage')), 'Found Upapada Lagna or Navamsha marriage rule');

  // Spiritual Atmakaraka search
  const spiritResults = dynamicRAGEngine.search({ query: 'atmakaraka soul purpose liberation jaimini', domain: 'spirituality', limit: 3 });
  assert(spiritResults.length > 0, `Spiritual query returned ${spiritResults.length} records`);
  assert(spiritResults.some(r => r.id.includes('atmakaraka')), 'Found Atmakaraka soul evolution rule');

  // -------------------------------------------------------------------------
  // 3. DOCUMENT INGESTION SERVICE TESTS (FOR FUTURE DOCX UPLOADS)
  // -------------------------------------------------------------------------
  console.log('\n--- 3. Testing Dynamic Document Ingestion Service ---');
  const sampleDocText = `
CHAPTER 1: WEALTH MANIFESTATION & KUBERA YOGAS
When the 2nd lord and 11th lord exchange houses while Jupiter aspects the Lagna, the native creates an empire of wealth.
Many billionaires share this configuration in technology and global logistics.

CHAPTER 2: EXECUTIVE CAREER & INDUSTRY TITANS
The 10th house in D10 Dashamsha when occupied by Mars in Capricorn gives rise to industrial magnates and defense commanders.
Status rises steadily after the 32nd year of life.

CHAPTER 3: MEDICAL CHRONICITY & 8TH HOUSE NODAL AXIS
When Ketu transits the 8th house during a Saturn sub-period, lymphatic and endocrine systems require deep detoxification.
  `;

  const ingestedCount = DocumentIngestionService.ingestDocumentText('Research_Mastery_Docx_Preview', sampleDocText);
  assert(ingestedCount >= 3, `Successfully ingested ${ingestedCount} sections into Dynamic RAG`);

  // Verify that newly ingested chunks are immediately retrievable
  const dynamicSearch = dynamicRAGEngine.search({ query: 'kubera yogas billionaires empire' });
  assert(dynamicSearch.length > 0, 'Newly ingested Kubera wealth document chunk is immediately searchable');
  assert(dynamicSearch.some(r => r.citation.includes('Research_Mastery_Docx_Preview')), 'Chunk provenance correctly tracks sourceDocName');

  // -------------------------------------------------------------------------
  // 4. CONSULT AGENT DAIVAJNA SYNTHESIS TESTS
  // -------------------------------------------------------------------------
  console.log('\n--- 4. Testing Consult Agent Daivajna Synthesis ---');
  const agent = createConsultAgent({ forceMockMode: true });

  const testProfile = {
    name: 'Consult Benchmark',
    year: 1992,
    month: 8,
    day: 24,
    hour: 14,
    minute: 30,
    latitude: 28.6139,
    longitude: 77.209,
    timezone: 'Asia/Kolkata',
  };

  // 4a. Wealth Consultation
  const wealthConsult = await agent.consult({
    userMessage: 'Will I become wealthy or a billionaire? What is my Indu Lagna and wealth potential?',
    birthProfile: testProfile,
  });
  assert(wealthConsult.success, 'Wealth consultation succeeded');
  assert(wealthConsult.text.includes('Wealth') || wealthConsult.text.includes('bindus'), 'Wealth response cites wealth concepts and bindus');

  // 4b. Spiritual Atmakaraka Consultation
  const spiritConsult = await agent.consult({
    userMessage: 'What is my Atmakaraka and what is my true soul purpose in this lifetime?',
    birthProfile: testProfile,
  });
  assert(spiritConsult.success, 'Spiritual consultation succeeded');
  assert(spiritConsult.text.includes('Atmakaraka') && spiritConsult.text.includes('Karakamsa'), 'Spiritual response cites Atmakaraka and Karakamsa');

  // 4c. Comprehensive Multi-Domain Consultation with Past Calibration
  const fullConsult = await agent.consult({
    userMessage: 'Give me a complete consultation for my career, wealth, and health over the next 2 years.',
    birthProfile: testProfile,
  });
  assert(fullConsult.success, 'Multi-domain consultation succeeded');
  assert(fullConsult.text.includes('Past Calibration') || fullConsult.text.includes('Karmic Foundation'), 'Multi-domain consultation weaves Past Calibration anchor');
  assert(fullConsult.text.includes('Career') && fullConsult.text.includes('Health'), 'Multi-domain consultation addresses career and health thoroughly');

  console.log(`\n==================================================`);
  console.log(`RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log(`==================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runVerification().catch(err => {
  console.error('Test suite error:', err);
  process.exit(1);
});
