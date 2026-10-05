/**
 * ASTROWORLD — Classical Parashari Graha Drishti
 *
 * Canonical whole-sign house aspect semantics used by the reasoning engine.
 * Convention:
 * - All nine grahas receive/cast the standard 7th aspect.
 * - Mars additionally casts 4th and 8th.
 * - Jupiter additionally casts 5th and 9th.
 * - Saturn additionally casts 3rd and 10th.
 * - Rahu/Ketu special aspects are deliberately excluded by default because
 *   node-aspect traditions differ across schools; callers may opt in.
 */

import { PlanetName, PlanetPosition } from './types.ts';

const NODE_ASPECTS = [5, 7, 9] as const;

/**
 * Return the Parashari full-aspect houses measured from a planet's occupied
 * whole-sign house. The returned house numbers are 1..12, with 1 = conjunction.
 */
export function getParashariAspectHouses(
  fromHouse: number,
  planet: PlanetName,
  includeNodeAspects = false,
): number[] {
  if (!Number.isInteger(fromHouse) || fromHouse < 1 || fromHouse > 12) {
    throw new Error('Parashari aspect calculation requires an occupied house in the range 1..12.');
  }

  const nodeSpecial = includeNodeAspects && (planet === 'Rahu' || planet === 'Ketu')
    ? NODE_ASPECTS
    : [];

  // Stable classical order: special graha drishti is reported by its
  // traditional distance, with the universal 7th aspect in the middle.
  const offsets = planet === 'Mars'
    ? [4, 7, 8]
    : planet === 'Jupiter'
      ? [5, 7, 9]
      : planet === 'Saturn'
        ? [3, 7, 10]
        : nodeSpecial.length > 0
          ? [5, 7, 9]
          : [7];

  return offsets.map((distance) => ((fromHouse + distance - 2) % 12) + 1);
}

/**
 * Return the whole-sign house distance from source to target:
 * 1 = conjunction, 7 = opposition/full 7th aspect.
 */
export function getParashariHouseDistance(fromHouse: number, toHouse: number): number {
  if (
    !Number.isInteger(fromHouse) || fromHouse < 1 || fromHouse > 12 ||
    !Number.isInteger(toHouse) || toHouse < 1 || toHouse > 12
  ) {
    throw new Error('Parashari house distance requires house numbers in the range 1..12.');
  }

  return ((toHouse - fromHouse + 12) % 12) + 1;
}

/**
 * Determine whether one planet has a classical full Parashari aspect on
 * another planet under the current whole-sign convention.
 */
export function hasParashariAspect(
  from: Pick<PlanetPosition, 'name' | 'houseNumber'>,
  to: Pick<PlanetPosition, 'houseNumber'>,
  includeNodeAspects = false,
): boolean {
  if (from.houseNumber === to.houseNumber) return true;
  return getParashariAspectHouses(from.houseNumber, from.name, includeNodeAspects)
    .includes(to.houseNumber);
}

/**
 * Determine whether two planets are connected by a classical Parashari
 * conjunction/aspect relationship, which is the relationship used by the
 * strict Raja Yoga sambandha evaluator.
 */
export function hasParashariSambandha(
  a: Pick<PlanetPosition, 'name' | 'houseNumber'>,
  b: Pick<PlanetPosition, 'name' | 'houseNumber'>,
): boolean {
  return hasParashariAspect(a, b) || hasParashariAspect(b, a);
}
