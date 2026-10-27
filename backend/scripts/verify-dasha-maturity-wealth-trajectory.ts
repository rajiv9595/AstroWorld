/**
 * Verification Script: Dasha Trajectory, Graha Paripakva Kala (Planetary Maturity),
 * Varga Activation Lifecycle, Specific Year / Date / Age Inquiries, and Wealth vs. Caution Prediction.
 */

import { ConsultAgent } from '../src/ai_agent/consultAgent.ts';
import { BirthProfileInput } from '../src/ai_v2/schemas/birthProfile.ts';

const testProfile: BirthProfileInput = {
  year: 2005,
  month: 2,
  day: 26,
  hour: 14,
  minute: 10,
  latitude: 16.9891,
  longitude: 81.784,
  timezone: 'Asia/Kolkata',
};

async function runTest() {
  console.log('--- TESTING AI CONSULT AGENT: 4-TIER PREDICTIVE SYNTHESIS ---');
  const agent = new ConsultAgent();

  const questions = [
    'what will happen in 2030 for me, will I be wealthier or should I be careful and why?',
    'what will happen when I am 28 years old, which dasha will I run and what changes?',
  ];

  for (const q of questions) {
    console.log(`\n========================================`);
    console.log(`QUERY: "${q}"`);
    console.log(`========================================`);

    const result = await agent.consult({
      userMessage: q,
      birthProfile: testProfile,
      forceMockMode: false,
    });

    console.log(`SUCCESS: ${result.success}`);
    console.log(`MODEL USED: ${result.executionMetadata.modelUsed}`);
    console.log(`TOOLS CALLED: ${result.toolsCalled.join(', ')}`);
    console.log(`\nRESPONSE EXCERPT:\n${result.text.slice(0, 1500)}...\n`);

    // Verify key astrological components
    const hasDasha = /dasha|mahadasha/i.test(result.text);
    const hasAge = /age|\b25\b|\b28\b|years old/i.test(result.text);
    const hasWealthOrCaution = /wealth|careful|vigilance|money|gain|protect|flourish/i.test(result.text);

    console.log(`Checks: hasDasha=${hasDasha}, hasAge=${hasAge}, hasWealthOrCaution=${hasWealthOrCaution}`);
  }
}

runTest().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
