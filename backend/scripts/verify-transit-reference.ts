/**
 * ASTROWORLD — Transit Reference Verification
 *
 * Independent Swiss-Ephemeris Lahiri vectors for fixed transit dates.
 * This validates sign/longitude output and catches retrograde-state regressions.
 */

import * as Astronomy from 'astronomy-engine';
import {
  calculateLahiriAyanamsha,
  calculatePlanetaryPositions,
} from '../../shared/index.ts';

type Ref = { lon: number; retrograde: boolean };

const reference: Record<string, Record<string, Ref>> = {
  '2026-10-05T00:00:00.000Z': {
    Sun: { lon: 167.5436987311181, retrograde: false },
    Moon: { lon: 96.40876182979612, retrograde: false },
    Mars: { lon: 99.7727503713574, retrograde: false },
    Mercury: { lon: 191.5699519685049, retrograde: false },
    Jupiter: { lon: 116.06542625970775, retrograde: false },
    Venus: { lon: 194.20404138355914, retrograde: true },
    Saturn: { lon: 347.0334114876482, retrograde: true },
    Rahu: { lon: 303.27253152198676, retrograde: true },
    Ketu: { lon: 123.27253152198676, retrograde: true },
  },
  '2027-06-03T00:00:00.000Z': {
    Sun: { lon: 47.98815096167152, retrograde: false },
    Moon: { lon: 23.391438141089928, retrograde: false },
    Mars: { lon: 133.82191300112257, retrograde: false },
    Mercury: { lon: 69.83175676732876, retrograde: false },
    Jupiter: { lon: 116.43980890410813, retrograde: false },
    Venus: { lon: 29.02908645856207, retrograde: false },
    Saturn: { lon: 0.0031733488839549295, retrograde: false },
    Rahu: { lon: 290.502112033935, retrograde: true },
    Ketu: { lon: 110.50211203393502, retrograde: true },
  },
};

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

for (const [iso, refs] of Object.entries(reference)) {
  const time = new Astronomy.AstroTime(new Date(iso));
  const ayanamsha = calculateLahiriAyanamsha(time);
  const actual = calculatePlanetaryPositions(time, ayanamsha, 1);
  for (const [planet, ref] of Object.entries(refs)) {
    const got = actual.find(p => p.name === planet);
    assert(Boolean(got), `${iso} ${planet}: missing planet`);
    const raw = Math.abs(got!.siderealLongitude - ref.lon);
    const delta = Math.min(raw, 360 - raw);
    // Keep transit vectors consistent with the independent astronomy oracle:
    // Swiss-Ephemeris comparison allows 120 arcsec for planetary longitudes.
    // Rahu/Ketu keep their narrower 30 arcsec analytical-node allowance.
    const toleranceDeg = (planet === 'Rahu' || planet === 'Ketu')
      ? 30 / 3600
      : 120 / 3600;
    assert(
      delta <= toleranceDeg,
      `${iso} ${planet}: longitude delta ${delta}° exceeds reference tolerance`,
    );
    assert(got!.retrograde === ref.retrograde,
      `${iso} ${planet}: expected retrograde=${ref.retrograde}, got ${got!.retrograde}`);
  }
  console.log(`✅ ${iso}: all planetary transit vectors and retrograde states match`);
}

console.log('✅ Transit reference verification passed.');
