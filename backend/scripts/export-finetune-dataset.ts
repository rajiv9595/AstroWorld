/**
 * ASTROWORLD AI V2 — Fine-Tuning Dataset Export CLI Tool
 * Exports golden and captured consultation datasets to .jsonl format for:
 * 1. OpenAI Chat Completion Fine-Tuning
 * 2. Google Gemini Model Tuning (AI Studio / Vertex AI)
 * 3. Llama-3 / Unsloth Instruction Fine-Tuning
 * 
 * Usage:
 *   tsx scripts/export-finetune-dataset.ts [--format=all|openai|gemini|llama] [--outDir=./datasets]
 */

import * as fs from 'fs';
import * as path from 'path';
import { FineTuningDatasetCollector } from '../src/ai_v2/dataset/datasetCollector.ts';

async function main() {
  console.log('🌌 AstroWorld AI V2 — Fine-Tuning Dataset Exporter\n');

  const args = process.argv.slice(2);
  const formatArg = args.find(a => a.startsWith('--format='))?.split('=')[1] || 'all';
  const outDirArg = args.find(a => a.startsWith('--outDir='))?.split('=')[1] || path.resolve(process.cwd(), 'datasets');

  if (!fs.existsSync(outDirArg)) {
    fs.mkdirSync(outDirArg, { recursive: true });
  }

  const collector = new FineTuningDatasetCollector();
  const audit = collector.auditDataset();

  console.log(`📊 Total Golden Master Samples: ${audit.totalSamples}`);
  if (!audit.passed) {
    console.warn('⚠️ Dataset Audit Warnings:');
    audit.issues.forEach(i => console.warn(`   - ${i}`));
  } else {
    console.log('✅ Dataset Quality Audit: PASSED (100% compliant with Master Persona)\n');
  }

  // 1. OpenAI Format
  if (formatArg === 'all' || formatArg === 'openai') {
    const openaiSamples = collector.toOpenAIFormat();
    const openaiPath = path.join(outDirArg, 'astroworld_finetune_openai.jsonl');
    const openaiContent = openaiSamples.map(s => JSON.stringify(s)).join('\n');
    fs.writeFileSync(openaiPath, openaiContent, 'utf-8');
    console.log(`✅ Exported OpenAI format (${openaiSamples.length} lines):`);
    console.log(`   📁 ${openaiPath}`);
  }

  // 2. Gemini Format
  if (formatArg === 'all' || formatArg === 'gemini') {
    const geminiSamples = collector.toGeminiFormat();
    const geminiPath = path.join(outDirArg, 'astroworld_finetune_gemini.jsonl');
    const geminiContent = geminiSamples.map(s => JSON.stringify(s)).join('\n');
    fs.writeFileSync(geminiPath, geminiContent, 'utf-8');
    console.log(`✅ Exported Google Gemini format (${geminiSamples.length} lines):`);
    console.log(`   📁 ${geminiPath}`);
  }

  // 3. Llama-3 Format
  if (formatArg === 'all' || formatArg === 'llama') {
    const llamaSamples = collector.toLlama3Format();
    const llamaPath = path.join(outDirArg, 'astroworld_finetune_llama3.jsonl');
    const llamaContent = llamaSamples.map(s => JSON.stringify(s)).join('\n');
    fs.writeFileSync(llamaPath, llamaContent, 'utf-8');
    console.log(`✅ Exported Llama-3 Instruct format (${llamaSamples.length} lines):`);
    console.log(`   📁 ${llamaPath}`);
  }

  console.log('\n✨ Dataset export complete! Ready for model training and fine-tuning.');
}

main().catch(err => {
  console.error('Fatal error during dataset export:', err);
  process.exit(1);
});
