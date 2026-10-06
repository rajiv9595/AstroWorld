/**
 * ASTROWORLD — Timezone / DST Contract
 *
 * Validates local wall-clock to UTC conversion across the US DST boundary.
 * India does not observe DST, but the engine is designed for arbitrary IANA zones.
 */

import { localDateTimeToUtcDate } from '../../shared/index.ts';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const before = localDateTimeToUtcDate(2026, 3, 7, 12, 0, 0, 'America/New_York');
const after = localDateTimeToUtcDate(2026, 3, 9, 12, 0, 0, 'America/New_York');

assert(before.toISOString() === '2026-03-07T17:00:00.000Z',
  `Unexpected pre-DST conversion: ${before.toISOString()}`);
assert(after.toISOString() === '2026-03-09T16:00:00.000Z',
  `Unexpected post-DST conversion: ${after.toISOString()}`);

const india = localDateTimeToUtcDate(2005, 8, 17, 0, 2, 0, 'Asia/Kolkata');
assert(india.toISOString() === '2005-08-16T18:32:00.000Z',
  `Unexpected India conversion: ${india.toISOString()}`);

console.log('✅ DST and India timezone conversion contract passed');
