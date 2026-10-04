/**
 * ASTROWORLD AI V2 — Phase 4F Real Conversation Quality Benchmark Test Harness
 * Executes the 50-scenario conversation benchmark, evaluates 14 quality metrics,
 * writes machine-readable results JSON and human-review markdown exports, and asserts 100% success.
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  ConsultationOrchestrator,
  CONVERSATION_BENCHMARK_SCENARIOS,
  ConversationEvaluator,
  EvaluationResult,
} from '../src/ai_v2/consultation/index.ts';

async function runConversationQualityBenchmark() {
  console.log('🌟 Starting AstroWorld AI V2 Phase 4F Conversation Quality Benchmark Suite...\n');

  const forceLive = process.argv.includes('--live');
  const forceMock = process.argv.includes('--mock') || !forceLive;

  const orchestrator = new ConsultationOrchestrator({
    forceMockMode: forceMock,
    apiKey: forceLive ? process.env.GEMINI_API_KEY : undefined,
  });

  const evaluator = new ConversationEvaluator();
  const results: EvaluationResult[] = [];
  const categoryStats: Record<string, { total: number; passed: number }> = {};

  console.log(`📋 Executing ${CONVERSATION_BENCHMARK_SCENARIOS.length} Multi-Turn Conversation Scenarios...\n`);

  for (let i = 0; i < CONVERSATION_BENCHMARK_SCENARIOS.length; i++) {
    const scenario = CONVERSATION_BENCHMARK_SCENARIOS[i];
    const cat = scenario.category;
    if (!categoryStats[cat]) {
      categoryStats[cat] = { total: 0, passed: 0 };
    }
    categoryStats[cat].total++;

    const consultation = await orchestrator.consult(scenario.question, scenario.profile, {
      conversationContext: scenario.conversationContext,
      forceMockMode: forceMock,
    });

    const evalResult = evaluator.evaluate(consultation, scenario);
    results.push(evalResult);

    if (evalResult.passed) {
      categoryStats[cat].passed++;
    } else {
      console.error(`❌ [FAILED] Case ${scenario.caseId} (${scenario.category}): ${scenario.title}`);
      console.error(`   Question: "${scenario.question}"`);
      console.error(`   Failed Checks: ${evalResult.failedChecks.join('; ')}`);
      console.error(`   Response:\n"${evalResult.response}"\n`);
    }
  }

  // Write Machine-Readable JSON Results
  const resultsJsonPath = path.resolve(process.cwd(), 'conversation_benchmark_results.json');
  fs.writeFileSync(resultsJsonPath, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`💾 Machine-readable results exported to: ${resultsJsonPath}`);

  // Write Human-Review Markdown Export
  const reviewMarkdownPath = path.resolve(process.cwd(), 'conversation_benchmark_review.md');
  const markdownContent = generateReviewMarkdown(results);
  fs.writeFileSync(reviewMarkdownPath, markdownContent, 'utf-8');
  console.log(`📄 Human-review Markdown report exported to: ${reviewMarkdownPath}\n`);

  // Category Breakdown Summary
  console.log('================================================================================');
  console.log('PHASE 4F CONVERSATION QUALITY BENCHMARK BREAKDOWN');
  console.log('================================================================================');
  let allPassed = true;
  for (const [cat, stats] of Object.entries(categoryStats)) {
    const status = stats.passed === stats.total ? '✅ PASSED' : '❌ FAILED';
    console.log(`${status} [${cat}]: ${stats.passed}/${stats.total} scenarios passed`);
    if (stats.passed !== stats.total) {
      allPassed = false;
    }
  }
  console.log('================================================================================');

  // Verify Golden Jupiter Promotion Case specifically
  const goldenCase = results.find(r => r.caseId === 'C5_JUPITER_PROMOTION_GOLDEN');
  if (goldenCase) {
    console.log('\n--- CANONICAL JUPITER PROMOTION CASE REVIEW (STEP 10) ---');
    console.log(`Execution Mode: "${goldenCase.executionMode}"`);
    console.log(`Label: "${goldenCase.reviewerSuggestedLabel}"`);
    console.log(`Word Count: ${goldenCase.metrics.responseLengthWords} words`);
    console.log(`Response:\n--------------------------------------------------\n${goldenCase.response}\n--------------------------------------------------\n`);
    if (!goldenCase.passed) {
      throw new Error(`Golden Jupiter Promotion Case failed: ${goldenCase.failedChecks.join('; ')}`);
    }
  }

  const totalPassed = results.filter(r => r.passed).length;
  console.log(`\nTOTAL BENCHMARK SCORE: ${totalPassed}/${results.length} PASSED (${Math.round((totalPassed / results.length) * 100)}% SUCCESS)`);

  if (!allPassed || totalPassed !== results.length) {
    throw new Error(`Phase 4F Conversation Benchmark failed: ${results.length - totalPassed} failed cases.`);
  }

  console.log('\n==================================================');
  console.log(`PHASE 4F CONVERSATION QUALITY SUITE: 10/10 CATEGORIES PASSED | 0 FAILED`);
  console.log('==================================================\n');
}

function generateReviewMarkdown(results: EvaluationResult[]): string {
  const lines: string[] = [
    '# AstroWorld AI V2 — Phase 4F Conversation Quality Review',
    '',
    `**Generated At**: ${new Date().toISOString()}`,
    `**Total Scenarios**: ${results.length}`,
    `**Passed Scenarios**: ${results.filter(r => r.passed).length} / ${results.length}`,
    '',
    '## Reviewer Label Guide',
    '- `excellent`: Fully grounded, answer-first, crisp, within ideal budget.',
    '- `natural`: Warm, conversational, accurate Vedic tone.',
    '- `too verbose`: Response exceeded concise word budget.',
    '- `too robotic`: Contains rigid boilerplate or metadata artifacts.',
    '- `too vague`: Did not cover specific astrological entity/question.',
    '- `too technical`: Excessive raw degrees/sloka citations in normal mode.',
    '- `awkward`: Rough phrasing or unaddressed context.',
    '- `needs improvement`: Grounding, timing, or safety violation.',
    '',
    '---',
    '',
  ];

  const categories = Array.from(new Set(results.map(r => r.category)));

  for (const cat of categories) {
    const catResults = results.filter(r => r.category === cat);
    lines.push(`## Category: ${cat} (${catResults.length} Scenarios)`);
    lines.push('');

    for (const res of catResults) {
      lines.push(`### [${res.caseId}] ${res.question}`);
      lines.push(`- **Execution Mode**: \`${res.executionMode}\``);
      lines.push(`- **Reviewer Label**: \`${res.reviewerSuggestedLabel}\``);
      lines.push(`- **Word Count**: ${res.metrics.responseLengthWords} words`);
      lines.push(`- **Question Coverage**: ${Math.round(res.metrics.questionCoverage * 100)}%`);
      lines.push(`- **Timing Accurate**: ${res.metrics.timingAccuracy ? 'Yes' : 'No'}`);
      lines.push(`- **Certainty Controlled (Non-fatalistic)**: ${res.metrics.certaintyControl ? 'Yes' : 'No'}`);
      lines.push(`- **Remedy Leakage**: ${res.metrics.remedyLeakage ? 'Violation' : 'None'}`);
      lines.push(`- **Status**: ${res.passed ? '✅ PASSED' : '❌ FAILED'}`);
      if (res.failedChecks.length > 0) {
        lines.push(`- **Failed Checks**: ${res.failedChecks.join(', ')}`);
      }
      lines.push('');
      lines.push('**Generated Response:**');
      lines.push('> ' + res.response.replace(/\n/g, '\n> '));
      lines.push('');
      lines.push('---');
      lines.push('');
    }
  }

  return lines.join('\n');
}

runConversationQualityBenchmark().catch(err => {
  console.error('Fatal Error running conversation benchmark:', err);
  process.exit(1);
});
