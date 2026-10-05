/**
 * ASTROWORLD — Phase 9 Birth Time & Location Contract
 *
 * Guards the civil-time boundary before any chart calculation is allowed to run.
 */

import {
  birthProfileToUtcDate,
  localDateTimeToUtcDate,
} from '../../shared/index.ts';
import { validateBirthProfile } from '../src/ai_v2/schemas/birthProfile.ts';

type Contract = {
  name: string;
  run: () => void;
};

function expectThrow(name: string, run: () => void): Contract {
  return {
    name,
    run: () => {
      let threw = false;
      try {
        run();
      } catch {
        threw = true;
      }
      if (!threw) throw new Error('Expected validation error.');
    },
  };
}

function expectEqual(name: string, actual: string, expected: string): Contract {
  return {
    name,
    run: () => {
      if (actual !== expected) {
        throw new Error('Expected ' + expected + ', got ' + actual + '.');
      }
    },
  };
}

const baseProfile = {
  name: 'Phase 9 Test Native',
  year: 2024,
  month: 1,
  day: 15,
  hour: 12,
  minute: 0,
  second: 0,
  latitude: 16.93407,
  longitude: 81.95522,
  timezone: 'Asia/Kolkata',
};

const contracts: Contract[] = [
  expectThrow('Invalid Gregorian date rejected', () => {
    localDateTimeToUtcDate(2024, 2, 31, 12, 0, 0, 'Asia/Kolkata');
  }),

  expectThrow('Invalid IANA timezone rejected', () => {
    localDateTimeToUtcDate(2024, 1, 15, 12, 0, 0, 'Asia/Not_A_Zone');
  }),

  expectThrow('DST gap rejected', () => {
    // America/New_York jumped from 01:59:59 to 03:00:00 on 2024-03-10.
    localDateTimeToUtcDate(2024, 3, 10, 2, 30, 0, 'America/New_York');
  }),

  expectThrow('DST fold rejected', () => {
    // America/New_York repeated 01:00–01:59 on 2024-11-03.
    localDateTimeToUtcDate(2024, 11, 3, 1, 30, 0, 'America/New_York');
  }),

  {
    name: 'Valid Kolkata time resolves',
    run: () => {
      const actual = birthProfileToUtcDate(baseProfile);
      const expected = '2024-01-15T06:30:00.000Z';
      if (actual.toISOString() !== expected) {
        throw new Error('Expected ' + expected + ', got ' + actual.toISOString() + '.');
      }
    },
  },

  {
    name: 'Valid New York standard time resolves',
    run: () => {
      const actual = localDateTimeToUtcDate(2024, 1, 15, 12, 0, 0, 'America/New_York');
      const expected = '2024-01-15T17:00:00.000Z';
      if (actual.toISOString() !== expected) {
        throw new Error('Expected ' + expected + ', got ' + actual.toISOString() + '.');
      }
    },
  },

  {
    name: 'Valid New York daylight time resolves',
    run: () => {
      const actual = localDateTimeToUtcDate(2024, 7, 15, 12, 0, 0, 'America/New_York');
      const expected = '2024-07-15T16:00:00.000Z';
      if (actual.toISOString() !== expected) {
        throw new Error('Expected ' + expected + ', got ' + actual.toISOString() + '.');
      }
    },
  },

  {
    name: 'Zero coordinates are preserved',
    run: () => {
      const profile = { ...baseProfile, latitude: 0, longitude: 0, timezone: 'UTC' };
      const validation = validateBirthProfile(profile);
      if (!validation.valid || !validation.data) {
        throw new Error(validation.error || 'Expected zero coordinates to be valid.');
      }
      if (validation.data.latitude !== 0 || validation.data.longitude !== 0) {
        throw new Error('Zero latitude/longitude were not preserved.');
      }
    },
  },

  {
    name: 'Backend rejects calendar-invalid birth profile',
    run: () => {
      const validation = validateBirthProfile({ ...baseProfile, month: 2, day: 31 });
      if (validation.valid) {
        throw new Error('Invalid calendar date passed backend validation.');
      }
    },
  },

  {
    name: 'Backend rejects invalid timezone birth profile',
    run: () => {
      const validation = validateBirthProfile({ ...baseProfile, timezone: 'America/Not_A_Zone' });
      if (validation.valid) {
        throw new Error('Invalid timezone passed backend validation.');
      }
    },
  },
];

let passed = 0;
let failed = 0;

for (const contract of contracts) {
  try {
    contract.run();
    passed++;
    console.log('✅ ' + contract.name);
  } catch (error) {
    failed++;
    console.error(
      '❌ ' +
        contract.name +
        ' — ' +
        (error instanceof Error ? error.message : String(error)),
    );
  }
}

console.log('\\n==================================================');
console.log('PHASE 9 TIME/PLACE CONTRACT: ' + passed + ' PASSED | ' + failed + ' FAILED');
console.log('==================================================');

if (failed > 0) process.exitCode = 1;
