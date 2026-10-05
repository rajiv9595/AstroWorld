/**
 * ASTROWORLD — Phase 5D Horizon-Event Precision Contract
 *
 * Contract layers:
 * 1. Swiss Ephemeris 2.10.03 reference vectors generated independently with
 *    the Python pyswisseph binding, not through the TypeScript adapter.
 * 2. Swiss Node adapter must reproduce those vectors within 2 seconds.
 * 3. Astronomy Engine and Swiss must agree within 60 seconds under the same
 *    standard apparent upper-limb/refraction convention.
 * 4. Local civil-day mapping must survive DST transitions.
 *
 * IMPORTANT:
 * - This is an event-time/model contract, not a claim about observed weather
 *   dependent rise/set accuracy.
 * - USNO notes that actual rise/set observations can differ by a minute or
 *   more because refraction and local horizon conditions vary.
 */

import * as Astronomy from 'astronomy-engine';
import {
  astronomyEngineEphemerisProvider,
  calculateComprehensiveDailyPanchanga,
} from '../../shared/index.ts';
import {
  closeSwissEphemeris,
  createSwissEphemerisProvider,
} from '../src/services/ephemeris/swissEphemerisAdapter.ts';

type Body = 'Sun' | 'Moon';
type Event = 'RISE' | 'SET';

type ReferenceVector = {
  label: string;
  timezone: string;
  latitude: number;
  longitude: number;
  body: Body;
  event: Event;
  startUtc: string;
  expectedUtc: string;
  expectedLocalDate: string;
  expectedLocalTime: string;
};

const REFERENCE: ReferenceVector[] = [
  // Generated independently with pyswisseph / Swiss Ephemeris 2.10.03,
  // pressure 1013.25 hPa, temperature 15 C, altitude 0 m, default
  // astronomical upper-limb/refraction convention.
  {
    label: 'Anaparthy 2005-08-17 Sun rise',
    timezone: 'Asia/Kolkata',
    latitude: 16.93407,
    longitude: 81.95522,
    body: 'Sun',
    event: 'RISE',
    startUtc: '2005-08-16T18:30:00.000Z',
    expectedUtc: '2005-08-17T00:16:03.332Z',
    expectedLocalDate: '2005-08-17',
    expectedLocalTime: '05:46:03',
  },
  {
    label: 'Anaparthy 2005-08-17 Sun set',
    timezone: 'Asia/Kolkata',
    latitude: 16.93407,
    longitude: 81.95522,
    body: 'Sun',
    event: 'SET',
    startUtc: '2005-08-17T06:30:00.000Z',
    expectedUtc: '2005-08-17T12:56:12.999Z',
    expectedLocalDate: '2005-08-17',
    expectedLocalTime: '18:26:12',
  },
  {
    label: 'Anaparthy 2005-08-17 Moon rise',
    timezone: 'Asia/Kolkata',
    latitude: 16.93407,
    longitude: 81.95522,
    body: 'Moon',
    event: 'RISE',
    startUtc: '2005-08-16T18:30:00.000Z',
    expectedUtc: '2005-08-17T11:03:30.104Z',
    expectedLocalDate: '2005-08-17',
    expectedLocalTime: '16:33:30',
  },
  {
    label: 'Anaparthy 2005-08-17 Moon set',
    timezone: 'Asia/Kolkata',
    latitude: 16.93407,
    longitude: 81.95522,
    body: 'Moon',
    event: 'SET',
    startUtc: '2005-08-17T06:30:00.000Z',
    expectedUtc: '2005-08-17T22:22:48.078Z',
    expectedLocalDate: '2005-08-18',
    expectedLocalTime: '03:52:48',
  },
  {
    label: 'New Delhi 2024-03-10 Sun rise',
    timezone: 'Asia/Kolkata',
    latitude: 28.6139,
    longitude: 77.209,
    body: 'Sun',
    event: 'RISE',
    startUtc: '2024-03-09T18:30:00.000Z',
    expectedUtc: '2024-03-10T01:06:19.544Z',
    expectedLocalDate: '2024-03-10',
    expectedLocalTime: '06:36:19',
  },
  {
    label: 'New Delhi 2024-03-10 Sun set',
    timezone: 'Asia/Kolkata',
    latitude: 28.6139,
    longitude: 77.209,
    body: 'Sun',
    event: 'SET',
    startUtc: '2024-03-10T06:30:00.000Z',
    expectedUtc: '2024-03-10T12:56:46.019Z',
    expectedLocalDate: '2024-03-10',
    expectedLocalTime: '18:26:46',
  },
  {
    label: 'New Delhi 2024-03-10 Moon rise',
    timezone: 'Asia/Kolkata',
    latitude: 28.6139,
    longitude: 77.209,
    body: 'Moon',
    event: 'RISE',
    startUtc: '2024-03-09T18:30:00.000Z',
    expectedUtc: '2024-03-10T01:07:14.806Z',
    expectedLocalDate: '2024-03-10',
    expectedLocalTime: '06:37:14',
  },
  {
    label: 'New Delhi 2024-03-10 Moon set',
    timezone: 'Asia/Kolkata',
    latitude: 28.6139,
    longitude: 77.209,
    body: 'Moon',
    event: 'SET',
    startUtc: '2024-03-10T06:30:00.000Z',
    expectedUtc: '2024-03-10T13:02:09.359Z',
    expectedLocalDate: '2024-03-10',
    expectedLocalTime: '18:32:09',
  },
  {
    label: 'New York 2024-03-10 DST-start Sun rise',
    timezone: 'America/New_York',
    latitude: 40.7128,
    longitude: -74.006,
    body: 'Sun',
    event: 'RISE',
    startUtc: '2024-03-10T05:00:00.000Z',
    expectedUtc: '2024-03-10T11:14:55.929Z',
    expectedLocalDate: '2024-03-10',
    expectedLocalTime: '07:14:55',
  },
  {
    label: 'New York 2024-03-10 DST-start Sun set',
    timezone: 'America/New_York',
    latitude: 40.7128,
    longitude: -74.006,
    body: 'Sun',
    event: 'SET',
    startUtc: '2024-03-10T16:00:00.000Z',
    expectedUtc: '2024-03-10T22:57:54.105Z',
    expectedLocalDate: '2024-03-10',
    expectedLocalTime: '18:57:54',
  },
  {
    label: 'New York 2024-03-10 DST-start Moon rise',
    timezone: 'America/New_York',
    latitude: 40.7128,
    longitude: -74.006,
    body: 'Moon',
    event: 'RISE',
    startUtc: '2024-03-10T05:00:00.000Z',
    expectedUtc: '2024-03-10T11:33:53.998Z',
    expectedLocalDate: '2024-03-10',
    expectedLocalTime: '07:33:53',
  },
  {
    label: 'New York 2024-03-10 DST-start Moon set',
    timezone: 'America/New_York',
    latitude: 40.7128,
    longitude: -74.006,
    body: 'Moon',
    event: 'SET',
    startUtc: '2024-03-10T16:00:00.000Z',
    expectedUtc: '2024-03-10T23:33:49.782Z',
    expectedLocalDate: '2024-03-10',
    expectedLocalTime: '19:33:49',
  },
  {
    label: 'New York 2024-11-03 DST-end Sun rise',
    timezone: 'America/New_York',
    latitude: 40.7128,
    longitude: -74.006,
    body: 'Sun',
    event: 'RISE',
    startUtc: '2024-11-03T04:00:00.000Z',
    expectedUtc: '2024-11-03T11:29:22.464Z',
    expectedLocalDate: '2024-11-03',
    expectedLocalTime: '06:29:22',
  },
  {
    label: 'New York 2024-11-03 DST-end Sun set',
    timezone: 'America/New_York',
    latitude: 40.7128,
    longitude: -74.006,
    body: 'Sun',
    event: 'SET',
    startUtc: '2024-11-03T17:00:00.000Z',
    expectedUtc: '2024-11-03T21:49:16.655Z',
    expectedLocalDate: '2024-11-03',
    expectedLocalTime: '16:49:16',
  },
  {
    label: 'Sydney 2024-12-21 DST Sun rise',
    timezone: 'Australia/Sydney',
    latitude: -33.8688,
    longitude: 151.2093,
    body: 'Sun',
    event: 'RISE',
    startUtc: '2024-12-20T13:00:00.000Z',
    expectedUtc: '2024-12-20T18:40:52.426Z',
    expectedLocalDate: '2024-12-21',
    expectedLocalTime: '05:40:52',
  },
  {
    label: 'Sydney 2024-12-21 DST Sun set',
    timezone: 'Australia/Sydney',
    latitude: -33.8688,
    longitude: 151.2093,
    body: 'Sun',
    event: 'SET',
    startUtc: '2024-12-21T01:00:00.000Z',
    expectedUtc: '2024-12-21T09:05:37.226Z',
    expectedLocalDate: '2024-12-21',
    expectedLocalTime: '20:05:37',
  },
  {
    label: 'Sydney 2024-12-21 Moon rise (next civil day)',
    timezone: 'Australia/Sydney',
    latitude: -33.8688,
    longitude: 151.2093,
    body: 'Moon',
    event: 'RISE',
    startUtc: '2024-12-20T13:00:00.000Z',
    expectedUtc: '2024-12-21T13:20:22.337Z',
    expectedLocalDate: '2024-12-22',
    expectedLocalTime: '00:20:22',
  },
  {
    label: 'Sydney 2024-12-21 Moon set (next civil day)',
    timezone: 'Australia/Sydney',
    latitude: -33.8688,
    longitude: 151.2093,
    body: 'Moon',
    event: 'SET',
    startUtc: '2024-12-21T01:00:00.000Z',
    expectedUtc: '2024-12-22T01:07:04.345Z',
    expectedLocalDate: '2024-12-22',
    expectedLocalTime: '12:07:04',
  },
];

function absSeconds(a: Date, b: Date): number {
  return Math.abs(a.getTime() - b.getTime()) / 1000;
}

function localParts(date: Date, timezone: string): { date: string; time: string } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);

  const values: Record<string, string> = {};
  for (const part of parts) {
    if (part.type !== 'literal') values[part.type] = part.value;
  }

  return {
    date: values.year + '-' + values.month + '-' + values.day,
    time: values.hour + ':' + values.minute + ':' + values.second,
  };
}

function assertClose(label: string, actual: Date, expected: string, toleranceSeconds: number): number {
  const expectedDate = new Date(expected);
  const delta = absSeconds(actual, expectedDate);
  if (delta > toleranceSeconds) {
    throw new Error(
      label + ': delta ' + delta.toFixed(3) + 's exceeds ' + toleranceSeconds + 's',
    );
  }
  return delta;
}

async function main(): Promise<void> {
  console.log('🌅 AstroWorld Phase 5D horizon-event precision contract\n');
  console.log('Convention: apparent upper limb + standard refraction, sea-level observer, flat horizon.');
  console.log('Oracle: independently generated Swiss Ephemeris 2.10.03 / pyswisseph vectors.');
  console.log('Comparison: Astronomy Engine SearchRiseSet under its documented visible-top + 34 arcmin refraction model.\n');

  let passed = 0;
  let failed = 0;
  let maxSwissDelta = 0;
  let maxAstronomyDelta = 0;

  function pass(name: string, detail: string) {
    passed++;
    console.log('✅ ' + name + ': ' + detail);
  }

  function fail(name: string, detail: string) {
    failed++;
    console.error('❌ ' + name + ': ' + detail);
  }

  const swiss = await createSwissEphemerisProvider();

  try {
    for (const ref of REFERENCE) {
      const start = new Date(ref.startUtc);
      const swissActual = swiss.getHorizonEvent(
        start,
        ref.body,
        ref.event,
        { latitude: ref.latitude, longitude: ref.longitude },
      );

      if (!swissActual) {
        fail(ref.label + ' Swiss oracle', 'provider returned null');
        continue;
      }

      const swissDelta = assertClose(ref.label + ' Swiss reference', swissActual, ref.expectedUtc, 2);
      maxSwissDelta = Math.max(maxSwissDelta, swissDelta);

      const local = localParts(swissActual, ref.timezone);
      if (local.date !== ref.expectedLocalDate || local.time !== ref.expectedLocalTime) {
        fail(
          ref.label + ' timezone mapping',
          'expected ' + ref.expectedLocalDate + ' ' + ref.expectedLocalTime +
          ', got ' + local.date + ' ' + local.time,
        );
      } else {
        pass(ref.label + ' timezone mapping', local.date + ' ' + local.time);
      }

      const astronomyBody = ref.body === 'Sun' ? Astronomy.Body.Sun : Astronomy.Body.Moon;
      const direction = ref.event === 'RISE' ? 1 : -1;
      const astronomyActual = Astronomy.SearchRiseSet(
        astronomyBody,
        new Astronomy.Observer(ref.latitude, ref.longitude, 0),
        direction,
        start,
        1,
      );

      if (!astronomyActual) {
        fail(ref.label + ' Astronomy Engine', 'SearchRiseSet returned null');
        continue;
      }

      const astronomyDate = astronomyActual.date;
      const astronomyDelta = absSeconds(astronomyDate, swissActual);
      maxAstronomyDelta = Math.max(maxAstronomyDelta, astronomyDelta);

      if (astronomyDelta > 60) {
        fail(
          ref.label + ' Astronomy Engine comparison',
          'delta ' + astronomyDelta.toFixed(3) + 's exceeds 60s',
        );
      } else {
        pass(
          ref.label + ' Astronomy Engine comparison',
          'Swiss/AE Δ ' + astronomyDelta.toFixed(3) + 's',
        );
      }
    }

    // Explicit DST civil-day regression: Sydney has no Moonrise/Moonset on
    // 2024-12-21; the next Moonrise/Moonset belong to 2024-12-22 local time.
    // The temporal provider primitive may legitimately return those next
    // events; Panchanga must not mislabel them as events for the requested day.
    const sydneyDaily = calculateComprehensiveDailyPanchanga(
      new Date('2024-12-21T12:00:00+11:00'),
      -33.8688,
      151.2093,
      'Australia/Sydney',
      'Sydney, Australia',
      swiss,
    );

    if (sydneyDaily.solarLunar.moonrise === 'No Moonrise' &&
        sydneyDaily.solarLunar.moonset === 'No Moonset') {
      pass(
        'Sydney civil-day Moon event assignment',
        'next-day Moon events are not mislabeled as 2024-12-21 events',
      );
    } else {
      fail(
        'Sydney civil-day Moon event assignment',
        'expected No Moonrise / No Moonset, got ' +
        sydneyDaily.solarLunar.moonrise + ' / ' + sydneyDaily.solarLunar.moonset,
      );
    }

    console.log('\n==================================================');
    console.log(
      'PHASE 5D HORIZON PRECISION: ' + passed + ' PASSED | ' + failed + ' FAILED',
    );
    console.log('Max Swiss oracle delta: ' + maxSwissDelta.toFixed(3) + 's');
    console.log('Max Astronomy Engine delta: ' + maxAstronomyDelta.toFixed(3) + 's');
    console.log('Precision contract: Swiss adapter ≤ 2s to frozen vectors; AE/Swiss ≤ 60s.');
    console.log('==================================================\n');

    if (failed > 0) process.exitCode = 1;
  } finally {
    await closeSwissEphemeris();
  }
}

main().catch((error) => {
  console.error('❌ Phase 5D horizon precision contract failed:', error);
  process.exitCode = 1;
});
