/**
 * ASTROWORLD — Swiss Ephemeris Adapter Contract
 *
 * This is an opt-in server-side validation. The optional @swisseph/node
 * dependency must be installed before running this script.
 *
 * Expected vectors were independently generated with Swiss Ephemeris 2.10.03
 * using Lahiri / Chitrapaksha and mean lunar node.
 */

import {
  closeSwissEphemeris,
  createSwissEphemerisSnapshot,
} from '../src/services/ephemeris/swissEphemerisAdapter.ts';

type Vector = {
  utc: string;
  latitude: number;
  longitude: number;
  ayanamsha: number;
  ascendant: number;
  planets: Record<string, number>;
};

const REFERENCE: Vector[] = [
  {
    utc: '2005-08-16T18:32:00.000Z',
    latitude: 16.93407,
    longitude: 81.95522,
    ayanamsha: 23.93565836563647,
    ascendant: 39.95620244441955,
    planets: {
      Sun: 120.04284066208803,
      Moon: 257.8637656115666,
      Mars: 16.59405768925442,
      Mercury: 104.84054007297352,
      Jupiter: 171.84362377517226,
      Venus: 155.6427499901487,
      Saturn: 100.06349180994296,
      Rahu: 352.32741227614775,
      Ketu: 172.3274122761477,
    },
  },
  {
    utc: '2030-07-01T12:00:00.000Z',
    latitude: 16.93407,
    longitude: 81.95522,
    ayanamsha: 24.28312871434332,
    ascendant: 240.20772072234294,
    planets: {
      Sun: 75.43011121160335,
      Moon: 82.14200260283613,
      Mars: 65.6181615921832,
      Mercury: 83.98909338207324,
      Jupiter: 203.75230971273257,
      Venus: 46.44232830134532,
      Saturn: 39.41900537771398,
      // Direct Swiss sidereal mean node (SEFLG_SIDEREAL). Mean lunar
      // nodes are mathematical points; do not reconstruct them by mixing
      // nutated tropical longitude with a non-nutated ayanamsha.
      Rahu: 230.90957323623547,
      Ketu: 50.90957323623547,
    },
  },
];

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function assertArcsec(
  label: string,
  actual: number,
  expected: number,
  toleranceArcsec = 0.5,
): void {
  const raw = Math.abs(actual - expected) % 360;
  const deltaArcsec = Math.min(raw, 360 - raw) * 3600;
  assert(
    deltaArcsec <= toleranceArcsec,
    label + ': delta ' + deltaArcsec.toFixed(6) + ' arcsec exceeds ' + toleranceArcsec + ' arcsec',
  );
}

async function main(): Promise<void> {
  console.log('🔭 Swiss Ephemeris adapter contract');

  try {
    for (const ref of REFERENCE) {
      const snapshot = await createSwissEphemerisSnapshot(
        new Date(ref.utc),
        { latitude: ref.latitude, longitude: ref.longitude },
      );

      assert(snapshot.source === 'swiss-ephemeris', 'Unexpected ephemeris source');
      assert(snapshot.ayanamsha.name === 'Lahiri', 'Swiss adapter must use Lahiri');
      assert(snapshot.planets.length === 9, 'Swiss adapter must return 9 Vedic bodies');

      // The published Lahiri offset is convention/model-sensitive across
      // Swiss-Ephemeris generations. Keep this check tight at 5 arcsec while
      // requiring the actual chart coordinates below to match sub-arcsecond.
      assertArcsec(ref.utc + ' — Lahiri ayanamsha', snapshot.ayanamsha.degrees, ref.ayanamsha, 5);
      assertArcsec(ref.utc + ' — Ascendant', snapshot.ascendantSiderealLongitude, ref.ascendant);

      for (const [name, expected] of Object.entries(ref.planets)) {
        const actual = snapshot.planets.find((planet) => planet.name === name);
        assert(Boolean(actual), ref.utc + ' — missing ' + name);
        // The Moon can differ slightly across Swiss-compatible builds/data
        // packs at future epochs. Keep this cross-build tolerance explicit and
        // narrow; all other bodies remain sub-arcsecond.
        const toleranceArcsec = name === 'Moon' ? 1.0 : 0.5;
        assertArcsec(
          ref.utc + ' — ' + name,
          actual!.siderealLongitude,
          expected,
          toleranceArcsec,
        );
      }

      console.log('✅ ' + ref.utc + ': Swiss Lahiri snapshot matches independent vectors');
    }

    console.log('✅ Swiss Ephemeris adapter contract passed');
  } catch (error: any) {
    const message = String(error?.message || error);
    if (message.includes("Cannot find package '@swisseph/node'")) {
      console.error(
        '❌ @swisseph/node is not installed. Run "npm install @swisseph/node" before this opt-in test.',
      );
      process.exitCode = 2;
      return;
    }
    throw error;
  } finally {
    await closeSwissEphemeris();
  }
}

main().catch((error) => {
  console.error('❌ Swiss Ephemeris adapter contract failed:', error);
  process.exitCode = 1;
});
