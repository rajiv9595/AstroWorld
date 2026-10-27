import { calculateVimshottariDasha, getNakshatraAndPada } from '../../shared/index.ts';

const moonLon = 257.863765612; // From prompt reference: 257°51'49.56"
const birthUtc = new Date('2005-08-16T18:32:00.000Z');
const nak = getNakshatraAndPada(moonLon);
console.log('Nakshatra:', nak.nakshatra, 'Pada:', nak.pada, 'Lord:', nak.nakshatraLord);

const dasha = calculateVimshottariDasha(moonLon, birthUtc, new Date('2026-10-22T15:30:00.000Z'));
console.log('Ruling lord:', dasha.balanceAtBirth.rulingLord);
console.log('Balance years:', dasha.balanceAtBirth.balanceYears);
console.log('First MD:', dasha.mahadashas[0].period.lord);
console.log('First MD start:', dasha.mahadashas[0].period.startDateIso);
console.log('First MD end:', dasha.mahadashas[0].period.endDateIso);
console.log('Current MD:', dasha.currentHierarchy.mahadasha.lord);
console.log('Current AD:', dasha.currentHierarchy.antardasha.subLord);
console.log('Current PD:', dasha.currentHierarchy.pratyantardasha.pratyantarLord);
