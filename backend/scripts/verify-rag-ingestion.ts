/**
 * ASTROWORLD — Verification Script for Study Notes & Research RAG Ingestion
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dynamicRAGEngine } from '../src/ai_v2/rag/dynamicRagEngine.ts';
import { DocumentIngestionService } from '../src/ai_v2/rag/documentIngestionService.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runRAGIngestionVerification() {
  console.log('🏛️ Starting RAG Research & Study Notes Ingestion Verification...\n');

  const baselineRuleCount = dynamicRAGEngine.getTotalRuleCount();
  console.log(`Initial Canonical RAG Rules in Base: ${baselineRuleCount}`);

  // Ingest Study Notes
  const studyNotesPath = path.resolve(__dirname, 'extracted_study_notes.txt');
  if (fs.existsSync(studyNotesPath)) {
    const rawText = fs.readFileSync(studyNotesPath, 'utf-8');
    const ingested = DocumentIngestionService.ingestDocumentText('Kapoor_Astronomy_and_Math_Astrology', rawText);
    console.log(`✅ Ingested ${ingested} thematic chunks from Kapoor Study Notes`);
  } else {
    console.warn(`⚠️ Study notes file not found at ${studyNotesPath}`);
  }

  // Ingest OCR Extraction
  const ocrPath = path.resolve(__dirname, 'extracted_ocr.txt');
  if (fs.existsSync(ocrPath)) {
    const rawOcr = fs.readFileSync(ocrPath, 'utf-8');
    const ingested = DocumentIngestionService.ingestDocumentText('Deepak_Kapoor_OCR_Extraction', rawOcr);
    console.log(`✅ Ingested ${ingested} thematic chunks from Deepak Kapoor OCR Extraction`);
  } else {
    console.warn(`⚠️ OCR extraction file not found at ${ocrPath}`);
  }

  const finalRuleCount = dynamicRAGEngine.getTotalRuleCount();
  console.log(`\nFinal Unified Knowledge Base Rule Count: ${finalRuleCount} (+${finalRuleCount - baselineRuleCount} chunks ingested)\n`);

  // Verify Specific Topic Retrieval
  console.log('--- TESTING SPECIFIC RETRIEVAL FROM INGESTED NOTES ---');

  const chalitResults = dynamicRAGEngine.search({ query: 'Chalit Sandhi Aarambh Viram Deepak Kapoor', limit: 3 });
  console.log(`1. Query 'Chalit Sandhi': Found ${chalitResults.length} records. Top citation: ${chalitResults[0]?.citation}`);

  const vargaResults = dynamicRAGEngine.search({ query: 'D24 Siddhamsha higher education degrees', limit: 3 });
  console.log(`2. Query 'D24 Siddhamsha': Found ${vargaResults.length} records. Top citation: ${vargaResults[0]?.citation}`);

  const shadbalaResults = dynamicRAGEngine.search({ query: 'Shadbala Sthana Dig Kaala Bala virupas', limit: 3 });
  console.log(`3. Query 'Shadbala': Found ${shadbalaResults.length} records. Top citation: ${shadbalaResults[0]?.citation}`);

  const cseResults = dynamicRAGEngine.search({ query: 'Computer Science Engineering CSE Mercury Rahu', limit: 3 });
  console.log(`4. Query 'CSE Engineering': Found ${cseResults.length} records. Top citation: ${cseResults[0]?.citation}`);

  if (chalitResults.length > 0 && vargaResults.length > 0 && shadbalaResults.length > 0 && cseResults.length > 0) {
    console.log('\n🎉 ALL RAG INGESTION & RETRIEVAL VERIFICATION CHECKS PASSED!\n');
  } else {
    throw new Error('Some retrieval queries failed to return expected records.');
  }
}

runRAGIngestionVerification().catch((err) => {
  console.error('❌ Ingestion Verification failed:', err);
  process.exit(1);
});
