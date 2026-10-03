/**
 * ASTROWORLD AI V2 — Phase 4C Real Gemini Response Quality Audit
 * 
 * Executes the complete AI V2 consultation pipeline on:
 * Query: "How does the upcoming transit of Jupiter support my promotion timing?"
 * Uses the live Gemini API if GEMINI_API_KEY is available.
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root and backend
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import {
  ConsultationOrchestrator,
  BirthProfile,
  validateConsultationResult,
} from '../src/ai_v2/index.ts';

const AUDIT_PROFILE: BirthProfile = {
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

async function runQualityAudit() {
  const query = 'How does the upcoming transit of Jupiter support my promotion timing?';
  const apiKey = process.env.GEMINI_API_KEY;

  console.log('==================================================');
  console.log('ASTROWORLD AI V2 — PHASE 4C REAL GEMINI AUDIT');
  console.log('==================================================');
  console.log(`Live API Key Configured: ${apiKey ? 'YES' : 'NO'}`);

  const orchestrator = new ConsultationOrchestrator({ apiKey });

  const result = await orchestrator.consult(query, AUDIT_PROFILE);

  console.log('\n--- 1. COMPLETE EXECUTION TRACE ---');
  console.log(`Execution Mode: ${result.trace.executionMode}`);
  console.log(`Gemini Model: ${result.trace.geminiModelUsed || 'N/A'}`);
  console.log(`\n--- 2. QUESTION PLAN ---`);
  console.log(JSON.stringify(result.questionPlan, null, 2));

  console.log(`\n--- 3. TOOL CALLS & EVIDENCE PACKET SUMMARY ---`);
  console.log(`Executed Tools: ${result.evidencePacket.toolResults.map(r => r.toolName).join(', ')}`);
  console.log(`Total Facts: ${result.evidencePacket.facts.length}`);
  console.log(`Facts Summary:\n` + result.evidencePacket.facts.slice(0, 10).map(f => `  - [${f.category}] ${f.entity}: ${f.property} = ${typeof f.value === 'object' ? JSON.stringify(f.value) : f.value}`).join('\n'));

  console.log(`\n--- 4. RETRIEVED CLASSICAL KNOWLEDGE (RAG) ---`);
  console.log(`Count: ${result.ragResults.length}`);
  result.ragResults.forEach((r, idx) => {
    console.log(`  ${idx + 1}. [${r.citation}] ${r.author} (${r.tradition}): ${r.normalizedRule}`);
  });

  console.log(`\n--- 5. REASONING PACKET SUMMARY ---`);
  console.log(`Direction: ${result.reasoningPacket.direction} | Strength: ${result.reasoningPacket.strength} | Confidence: ${result.reasoningPacket.confidence}`);
  console.log(`Primary Factors (${result.reasoningPacket.primaryFactors.length}):\n` + result.reasoningPacket.primaryFactors.map(f => `  - ${f.entity}: ${f.rationale}`).join('\n'));
  console.log(`Restricting/Structural Factors (${result.reasoningPacket.restrictingFactors.length}):\n` + result.reasoningPacket.restrictingFactors.map(f => `  - ${f.entity}: ${f.rationale}`).join('\n'));
  console.log(`Confluence Layers (${result.reasoningPacket.confluence?.layers?.length || 0}):\n` + result.reasoningPacket.confluence?.layers?.map(l => `  - [${l.layer}] ${l.factorDescription} (${l.alignment})`).join('\n'));
  console.log(`Temporal Windows (${result.reasoningPacket.temporalWindows.length}):\n` + result.reasoningPacket.temporalWindows.map(w => `  - [${w.label}] ${w.startDateIso} to ${w.endDateIso} (${w.type})`).join('\n'));

  console.log(`\n--- 6. APPROVED CLAIM SET ---`);
  console.log(`Total Approved: ${result.approvedClaimSet.claims.length}`);
  console.log(`Claims:\n` + result.approvedClaimSet.claims.slice(0, 8).map(c => `  - [${c.type} / ${c.strength}] ${c.text}`).join('\n'));

  console.log(`\n--- 7. RESPONSE PLAN ---`);
  console.log(`Response Type: ${result.responsePlan.responseType}`);
  console.log(`Answer First: ${result.responsePlan.answerFirst}`);
  console.log(`Sections (${result.responsePlan.sections.length}):\n` + result.responsePlan.sections.map(s => `  - [${s.title}] ${s.intent}`).join('\n'));

  console.log(`\n--- 8. FINAL GENERATED RESPONSE ---`);
  console.log(result.finalResponse.text);

  console.log(`\n--- 9. VALIDATION & REPAIR RESULTS ---`);
  console.log(`Validator Status: ${result.finalResponse.validatorStatus}`);
  console.log(`Repair Attempts: ${result.trace.metrics.repairAttempts}`);
  console.log(`Referenced Claim IDs: ${result.finalResponse.referencedClaimIds.length}`);
  console.log(`Referenced Evidence IDs: ${result.finalResponse.referencedEvidenceIds.length}`);

  console.log(`\n--- 10. PERFORMANCE & LATENCY BREAKDOWN ---`);
  console.log(`Total Latency: ${result.trace.latencyMs.total}ms`);
  console.log(JSON.stringify(result.trace.latencyMs, null, 2));
  console.log(`Metrics:`);
  console.log(JSON.stringify(result.trace.metrics, null, 2));

  console.log('\n==================================================');
  console.log('AUDIT RUN COMPLETE');
  console.log('==================================================\n');
}

runQualityAudit().catch(err => {
  console.error('Audit execution error:', err);
  process.exit(1);
});
