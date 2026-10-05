/**
 * ASTROWORLD — Phase 8 Horizon Edge-State Contract
 *
 * Phase 8 hardens horizon-event API semantics at the boundary conditions that
 * are easy to mis-handle even when nominal rise/set precision is green:
 *   - polar-day / polar-night no-event states;
 *   - strict invalid-coordinate rejection;
 *   - ordinary-event ordering and local civil-day mapping.
 *
 * This contract deliberately does not change ephemeris models or tolerances.
 * It validates the provider API semantics shared by Astronomy Engine and Swiss.
 */

import {
  astronomyEngineEphemerisProvider,
  validateHorizonLocation,
} from '../../shared/index.ts';
import { createSwissEphemerisProvider, closeSwissEphemeris } from '../src/services/ephemeris/swissEphemerisAdapter.ts';

type Event = 'RISE' | 'SET';

type PolarCase = {
  label: string;
  startUtc: string;
  latitude: number;
  longitude: number;
  event: Event;
};

const POLAR_CASES: PolarCase[] = [
  {
    label: 'Tromsø summer solar set',
    startUtc: '2024-06-21T00:00:00.000Z',
    latitude: 69.6492,
    longitude: 18.9553,
    event: 'SET',
  },
  {
    label: 'Tromsø winter solar rise',
    startUtc: '2024-12-21T00:00:00.000Z',
    latitude: 69.6492,
    longitude: 18.9553,
    event: 'RISE',
  },
  {
    label: 'Longyearbyen summer solar set',
    startUtc: '2024-06-21T00:00:00.000Z',
    latitude: 78.2232,
    longitude: 15.6469,
    event: 'SET',
  },
  {
    label: 'Longyearbyen winter solar rise',
    startUtc: '2024-12-21T00:00:00.000Z',
    latitude: 78.2232,
    longitude: 15.6469,
    event: 'RISE',
  },
];

type NormalCase = {
  label: string;
  timezone: string;
  expectedLocalDate: string;
  expectedLocalTime: string;
  startUtc: string;
  event: Event;
};

const NORMAL_CASES: NormalCase[] = [
  {
    label: 'Anaparthy 2005 Sun rise',
    timezone: 'Asia/Kolkata',
    expectedLocalDate: '2005-08-17',
    expectedLocalTime: '05:46:03',
    startUtc: '2005-08-16T18:30:00.000Z',
    event: 'RISE',
  },
  {
    label: 'Anaparthy 2005 Sun set',
    timezone: 'Asia/Kolkata',
    expectedLocalDate: '2005-08-17',
    expectedLocalTime: '18:26:12',
    startUtc: '2005-08-17T06:30:00.000Z',
    event: 'SET',
  },
];

const LOCATION = { latitude: 16.93407, longitude: 81.95522 };

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

function expectThrow(label: string, action: () => unknown): void {
  try {
    action();
  } catch {
    return;
  }
  throw new Error(label + ': expected validation error');
}

async function main(): Promise<void> {
  console.log('🧭 AstroWorld Phase 8 horizon edge-state contract\n');

  let passed = 0;
  let failed = 0;

  function pass(name: string, detail: string): void {
    passed++;
    console.log('✅ ' + name + ': ' + detail);
  }

  function fail(name: string, detail: string): void {
    failed++;
    console.error('❌ ' + name + ': ' + detail);
  }

  const swiss = await createSwissEphemerisProvider();

  try {
    // Shared validation must fail closed before either provider can delegate to
    // an astronomy library that might otherwise return an opaque null/error.
    const invalidCases: Array<[string, { latitude: number; longitude: number }]> = [
      ['NaN latitude', { latitude: Number.NaN, longitude: 0 }],
      ['latitude above range', { latitude: 91, longitude: 0 }],
      ['longitude above range', { latitude: 0, longitude: 181 }],
    ];

    for (const [label, location] of invalidCases) {
      try {
        expectThrow(
          'Shared validator ' + label,
          () => validateHorizonLocation(location, 'Phase 8 test'),
        );
        pass('Shared horizon validation ' + label, 'rejected');
      } catch (error) {
        fail('Shared horizon validation ' + label, error instanceof Error ? error.message : String(error));
      }

      try {
        expectThrow(
          'Astronomy Engine ' + label,
          () =>
            astronomyEngineEphemerisProvider.getHorizonEvent(
              new Date('2024-01-01T00:00:00.000Z'),
              'Sun',
              'RISE',
              location,
            ),
        );
        pass('Astronomy Engine horizon validation ' + label, 'rejected');
      } catch (error) {
        fail('Astronomy Engine horizon validation ' + label, error instanceof Error ? error.message : String(error));
      }

      try {
        expectThrow(
          'Swiss ' + label,
          () =>
            swiss.getHorizonEvent(
              new Date('2024-01-01T00:00:00.000Z'),
              'Sun',
              'RISE',
              location,
            ),
        );
        pass('Swiss horizon validation ' + label, 'rejected');
      } catch (error) {
        fail('Swiss horizon validation ' + label, error instanceof Error ? error.message : String(error));
      }
    }

    for (const testCase of POLAR_CASES) {
      const start = new Date(testCase.startUtc);

      for (const [providerName, provider] of [
        ['Astronomy Engine', astronomyEngineEphemerisProvider],
        ['Swiss Ephemeris', swiss],
      ] as const) {
        try {
          const actual = provider.getHorizonEvent(
            start,
            'Sun',
            testCase.event,
            { latitude: testCase.latitude, longitude: testCase.longitude },
          );

          if (actual !== null) {
            throw new Error(
              'expected no Sun ' +
              testCase.event.toLowerCase() +
              ' event near polar date, got ' +
              actual.toISOString(),
            );
          }

          pass(
            testCase.label + ' ' + providerName,
            'null no-event state preserved',
          );
        } catch (error) {
          fail(
            testCase.label + ' ' + providerName,
            error instanceof Error ? error.message : String(error),
          );
        }
      }
    }

    const normalResults: Array<{ provider: string; event: Event; date: Date }> = [];

    for (const testCase of NORMAL_CASES) {
      for (const [providerName, provider] of [
        ['Astronomy Engine', astronomyEngineEphemerisProvider],
        ['Swiss Ephemeris', swiss],
      ] as const) {
        try {
          const actual = provider.getHorizonEvent(
            new Date(testCase.startUtc),
            'Sun',
            testCase.event,
            LOCATION,
          );
          if (!actual) throw new Error('provider returned null for an ordinary solar event');

          const local = localParts(actual, testCase.timezone);
          if (local.date !== testCase.expectedLocalDate || local.time !== testCase.expectedLocalTime) {
            throw new Error(
              'expected ' +
              testCase.expectedLocalDate +
              ' ' +
              testCase.expectedLocalTime +
              ', got ' +
              local.date +
              ' ' +
              local.time,
            );
          }

          normalResults.push({ provider: providerName, event: testCase.event, date: actual });
          pass(
            testCase.label + ' ' + providerName,
            'strict anchor semantics; ' + local.date + ' ' + local.time,
          );
        } catch (error) {
          fail(
            testCase.label + ' ' + providerName,
            error instanceof Error ? error.message : String(error),
          );
        }
      }
    }

    for (const providerName of ['Astronomy Engine', 'Swiss Ephemeris'] as const) {
      const rise = normalResults.find((r) => r.provider === providerName && r.event === 'RISE')?.date;
      const set = normalResults.find((r) => r.provider === providerName && r.event === 'SET')?.date;
      if (!rise || !set) {
        fail(providerName + ' ordinary event ordering', 'missing rise or set result');
      } else if (rise.getTime() >= set.getTime()) {
        fail(providerName + ' ordinary event ordering', 'rise must precede same-day set');
      } else {
        pass(
          providerName + ' ordinary event ordering',
          'rise ' + rise.toISOString() + ' < set ' + set.toISOString(),
        );
      }
    }

    console.log('\n==================================================');
    console.log(
      'PHASE 8 HORIZON EDGE-STATE CONTRACT: ' +
      passed +
      ' PASSED | ' +
      failed +
      ' FAILED',
    );
    console.log(
      'Contracts: invalid coordinates fail closed; polar no-event states return null; ordinary rise/set anchors preserve exact civil-day mapping and ordering.',
    );
    console.log('==================================================\n');

    if (failed > 0) process.exitCode = 1;
  } finally {
    await closeSwissEphemeris();
  }
}

main().catch((error) => {
  console.error('❌ Phase 8 horizon edge-state contract failed:', error);
  process.exitCode = 1;
});
