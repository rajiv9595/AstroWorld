/**
 * ASTROWORLD — Phase 9 Astronomy Engine horizon edge contract
 *
 * Provider-neutral API semantics are regression-tested here without requiring
 * the optional Swiss native dependency.
 */

import { astronomyEngineEphemerisProvider } from '../../shared/index.ts';

const cases = [
  {
    name: 'Invalid latitude rejected',
    run: () =>
      astronomyEngineEphemerisProvider.getHorizonEvent(
        new Date('2024-01-01T00:00:00.000Z'),
        'Sun',
        'RISE',
        { latitude: 91, longitude: 0 },
      ),
    shouldThrow: true,
  },
  {
    name: 'Invalid longitude rejected',
    run: () =>
      astronomyEngineEphemerisProvider.getHorizonEvent(
        new Date('2024-01-01T00:00:00.000Z'),
        'Sun',
        'RISE',
        { latitude: 0, longitude: 181 },
      ),
    shouldThrow: true,
  },
  {
    name: 'Tromsø summer Sun set has no event',
    run: () =>
      astronomyEngineEphemerisProvider.getHorizonEvent(
        new Date('2024-06-21T00:00:00.000Z'),
        'Sun',
        'SET',
        { latitude: 69.6492, longitude: 18.9553 },
      ),
    shouldThrow: false,
    assertNull: true,
  },
  {
    name: 'Tromsø winter Sun rise has no event',
    run: () =>
      astronomyEngineEphemerisProvider.getHorizonEvent(
        new Date('2024-12-21T00:00:00.000Z'),
        'Sun',
        'RISE',
        { latitude: 69.6492, longitude: 18.9553 },
      ),
    shouldThrow: false,
    assertNull: true,
  },
];

let passed = 0;
let failed = 0;

for (const testCase of cases) {
  try {
    const result = testCase.run();

    if (testCase.shouldThrow) {
      throw new Error('Expected validation error, but provider returned normally.');
    }

    if (testCase.assertNull && result !== null) {
      throw new Error('Expected null no-event state, got ' + result.toISOString() + '.');
    }

    passed++;
    console.log('✅ ' + testCase.name);
  } catch (error) {
    if (testCase.shouldThrow) {
      passed++;
      console.log('✅ ' + testCase.name);
    } else {
      failed++;
      console.error(
        '❌ ' +
          testCase.name +
          ' — ' +
          (error instanceof Error ? error.message : String(error)),
      );
    }
  }
}

console.log('\\n==================================================');
console.log('PHASE 9 HORIZON EDGE CONTRACT: ' + passed + ' PASSED | ' + failed + ' FAILED');
console.log('==================================================');

if (failed > 0) process.exitCode = 1;
