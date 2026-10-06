/**
 * ASTROWORLD — Dignity Relationship Contract
 *
 * Exaltation/debilitation status and the planet's natural relationship to the
 * occupied sign lord are independent facts and must not be conflated.
 */

import { calculateDignity } from '../../shared/index.ts';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const cases = [
  ['Moon', 'Taurus', 3, 'EXALTED', 'NEUTRAL'],
  ['Mars', 'Capricorn', 28, 'EXALTED', 'NEUTRAL'],
  ['Mercury', 'Virgo', 15, 'EXALTED', 'SELF'],
  ['Jupiter', 'Capricorn', 5, 'DEBILITATED', 'NEUTRAL'],
  ['Mars', 'Cancer', 28, 'DEBILITATED', 'FRIEND'],
  ['Venus', 'Virgo', 27, 'DEBILITATED', 'FRIEND'],
  ['Sun', 'Libra', 10, 'DEBILITATED', 'ENEMY'],
] as const;

for (const [planet, sign, degree, dignity, relation] of cases) {
  const fact = calculateDignity(planet, sign, degree, 'D1');
  assert(fact.dignity === dignity, `${planet} ${sign} dignity: expected ${dignity}, got ${fact.dignity}`);
  assert(fact.naturalRelationshipToLord === relation,
    `${planet} ${sign} lord relationship: expected ${relation}, got ${fact.naturalRelationshipToLord}`);
}

console.log('✅ Exaltation/debilitation and sign-lord relationship contract passed');
