import dotenv from 'dotenv';
dotenv.config();

import { runAstrologerTestSuite } from '../src/ai/tests/astrologer.test.ts';

async function main() {
  try {
    const report = await runAstrologerTestSuite();
    if (report.failed > 0) {
      console.error(`Test Suite finished with ${report.failed} failures.`);
      process.exit(1);
    } else {
      console.log(`✅ All ${report.passed} tests passed successfully!`);
      process.exit(0);
    }
  } catch (err) {
    console.error('Fatal test runner error:', err);
    process.exit(1);
  }
}

main();
