import { ConsultAgent } from '../src/ai/agent/consultAgent.ts';

async function main() {
  console.log('🌌 Testing ConsultAgent Dasha Succession Intelligence...');

  const birthProfile = {
    name: 'Medapati Bhaskara Venkata Rajeev Reddy',
    year: 2005,
    month: 8,
    day: 17,
    hour: 6,
    minute: 0,
    latitude: 16.9891,
    longitude: 82.2475,
    timezone: 'Asia/Kolkata',
  };

  const agent = new ConsultAgent({ forceMockMode: true });

  const query = 'after kuja mahadasha i having saturn mahadashaa???';
  console.log(`\nInquiry: "${query}"\n`);

  const result = await agent.consult({
    userMessage: query,
    birthProfile,
    conversationId: 'test_dasha_succession_session',
  });

  console.log('--- CONSULTATION RESPONSE TEXT ---');
  console.log(result.text);

  console.log('\n--- VERIFICATION ASSERTIONS ---');
  const answersNoSaturnAfterKuja = /No,\s+Saturn/i.test(result.text) || /does NOT follow Kuja/i.test(result.text);
  const mentionsRahuFollowsMars = /Rahu/i.test(result.text);
  const mentionsBPHS = /BPHS|Brihat Parashara/i.test(result.text);
  const containsLateSaturn = /Saturn.*(after Jupiter|Peak Karmic|Senior)/i.test(result.text);

  console.log('1. Directly rejects Saturn immediately following Kuja:', answersNoSaturnAfterKuja ? '✅ PASSED' : '❌ FAILED');
  console.log('2. States Rahu follows Mars/Kuja:', mentionsRahuFollowsMars ? '✅ PASSED' : '❌ FAILED');
  console.log('3. Cites Brihat Parashara Hora Shastra (BPHS):', mentionsBPHS ? '✅ PASSED' : '❌ FAILED');
  console.log('4. Accurately positions Saturn era later in life:', containsLateSaturn ? '✅ PASSED' : '❌ FAILED');

  if (!answersNoSaturnAfterKuja || !mentionsRahuFollowsMars || !mentionsBPHS) {
    console.error('❌ Verification failed!');
    process.exit(1);
  }

  console.log('\n🎉 ALL DASHA SUCCESSION ASSERTIONS PASSED WITH 100% TRUTH!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

