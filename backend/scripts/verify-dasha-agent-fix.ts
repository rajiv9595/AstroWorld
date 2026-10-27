import { ConsultAgent } from '../src/ai_agent/consultAgent.ts';

async function main() {
  console.log('--- TESTING AI CONSULT AGENT WITH USER CHART (17/8/2005) ---');
  
  const birthProfile = {
    name: 'User',
    year: 2005,
    month: 8,
    day: 17,
    hour: 0,
    minute: 30,
    latitude: 17.6868, // sample India lat/lon
    longitude: 83.2185,
    timezone: 'Asia/Kolkata',
  };

  const agent = new ConsultAgent({ forceMockMode: false });

  console.log('\n--- Test Question 1: Relational harmony & Venus ---');
  const res1 = await agent.consult({
    userMessage: 'What does Venus in my chart indicate about relational harmony?',
    birthProfile,
    conversationId: 'test_relational_session',
  });

  console.log('Result 1 Model Used:', res1.executionMetadata.modelUsed);
  console.log('Result 1 Tools Called:', res1.toolsCalled);
  console.log('\n--- Excerpt of Answer 1 ---');
  console.log(res1.text.slice(0, 800));

  console.log('\n--- Test Question 2: Career momentum & current dasha ---');
  const res2 = await agent.consult({
    userMessage: 'How does my current dasha affect career momentum?',
    birthProfile,
    conversationId: 'test_career_session',
  });

  console.log('Result 2 Model Used:', res2.executionMetadata.modelUsed);
  console.log('Result 2 Tools Called:', res2.toolsCalled);
  console.log('\n--- FULL TEXT OF ANSWER 2 ---');
  console.log(res2.text);

  // Assertions
  const hasSunSaturnHallucinationQ1 = /sun\s+mahadasha/i.test(res1.text);
  const mentionsMoonQ1 = /moon/i.test(res1.text) || !hasSunSaturnHallucinationQ1;
  const mentionsMoonRahuQ2 = /moon/i.test(res2.text) && /rahu/i.test(res2.text);

  console.log('\n--- VERIFICATION CHECKS ---');
  console.log('Q1 contains Sun Mahadasha hallucination?', hasSunSaturnHallucinationQ1 ? 'FAILED (Found Sun)' : 'PASSED (No Sun hallucination)');
  console.log('Q2 correctly identifies Moon / Rahu?', mentionsMoonRahuQ2 ? 'PASSED (Found Moon & Rahu)' : 'FAILED');

  if (hasSunSaturnHallucinationQ1 || !mentionsMoonRahuQ2) {
    console.error('❌ Check failed!');
    process.exit(1);
  } else {
    console.log('✅ ALL VERIFICATIONS PASSED SUCCESSFULLY!');
  }
}

main().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
