/**
 * ASTROWORLD — Panchanga (Five Limbs of Vedic Time) Engine
 * Classical calculations for Tithi, Vara, Nakshatra, Yoga, and Karana.
 */

import { formatDMS, normalizeDegrees } from './astronomy.ts';
import { NAKSHATRAS } from './constants.ts';
import { PanchangaFacts, PlanetName, PlanetPosition } from './types.ts';

export const TITHI_NAMES: string[] = [
  'Pratipada (प्रतिपदा)',
  'Dwitiya (द्वितीया)',
  'Tritiya (तृतीया)',
  'Chaturthi (चतुर्थी)',
  'Panchami (पञ्चमी)',
  'Shashthi (षष्ठी)',
  'Saptami (सप्तमी)',
  'Ashtami (अष्टमी)',
  'Navami (नवमी)',
  'Dashami (दशमी)',
  'Ekadashi (एकादशी)',
  'Dwadashi (द्वादशी)',
  'Trayodashi (त्रयोदशी)',
  'Chaturdashi (चतुर्दशी)',
  'Purnima (पूर्णिमा - Full Moon)', // 15
  'Pratipada (प्रतिपदा)',
  'Dwitiya (द्वितीया)',
  'Tritiya (तृतीया)',
  'Chaturthi (चतुर्थी)',
  'Panchami (पञ्चमी)',
  'Shashthi (षष्ठी)',
  'Saptami (सप्तमी)',
  'Ashtami (अष्टमी)',
  'Navami (नवमी)',
  'Dashami (दशमी)',
  'Ekadashi (एकादशी)',
  'Dwadashi (द्वादशी)',
  'Trayodashi (त्रयोदशी)',
  'Chaturdashi (चतुर्दशी)',
  'Amavasya (अमावस्या - New Moon)', // 30
];

export const NITHYA_YOGAS: string[] = [
  'Vishkambha (विष्कम्भ)',
  'Priti (प्रीति)',
  'Ayushman (आयुष्मान्)',
  'Saubhagya (सौभाग्य)',
  'Shobhana (शोभन)',
  'Atiganda (अतिगण्ड)',
  'Sukarma (सुकर्मा)',
  'Dhriti (धृति)',
  'Shula (शूल)',
  'Ganda (गण्ड)',
  'Vriddhi (वृद्धि)',
  'Dhruva (ध्रुव)',
  'Vyaghata (व्याघात)',
  'Harshana (हर्षण)',
  'Vajra (वज्र)',
  'Siddhi (सिद्धि)',
  'Vyatipata (व्यतीपात)',
  'Variyan (वरीयान्)',
  'Parigha (परिघ)',
  'Shiva (शिव)',
  'Siddha (सिद्ध)',
  'Sadhya (साध्य)',
  'Shubha (शुभ)',
  'Shukla (शुक्ल)',
  'Brahma (ब्रह्म)',
  'Indra (इन्द्र)',
  'Vaidhriti (वैधृति)',
];

export const VARA_NAMES: { name: string; lord: PlanetName }[] = [
  { name: 'Ravivara (रविवार - Sunday)', lord: 'Sun' },
  { name: 'Somavara (सोमवार - Monday)', lord: 'Moon' },
  { name: 'Mangalavara (मंगलवार - Tuesday)', lord: 'Mars' },
  { name: 'Budhavara (बुधवार - Wednesday)', lord: 'Mercury' },
  { name: 'Guruvara (गुरुवार - Thursday)', lord: 'Jupiter' },
  { name: 'Shukravara (शुक्रवार - Friday)', lord: 'Venus' },
  { name: 'Shanivara (शनिवार - Saturday)', lord: 'Saturn' },
];

/**
 * Calculate Panchanga facts from planetary positions and birth date.
 */
export function calculatePanchanga(
  planets: PlanetPosition[],
  birthDateUtc: Date,
  ayanamsaDeg: number
): PanchangaFacts {
  const sun = planets.find((p) => p.name === 'Sun')!;
  const moon = planets.find((p) => p.name === 'Moon')!;

  // 1. Tithi: (Moon - Sun) % 360 / 12
  const elongation = normalizeDegrees(moon.siderealLongitude - sun.siderealLongitude);
  const tithiIndex = Math.min(29, Math.floor(elongation / 12.0));
  const tithiNum = tithiIndex + 1;
  const tithiName = TITHI_NAMES[tithiIndex];
  const paksha = tithiNum <= 15 ? 'Shukla' : 'Krishna';
  const tithiCompletedPercent = ((elongation % 12.0) / 12.0) * 100;

  // 2. Vara: Day of the week
  const dayOfWeek = birthDateUtc.getUTCDay(); // 0=Sun .. 6=Sat
  const varaInfo = VARA_NAMES[dayOfWeek];

  // 3. Nakshatra: Moon's sidereal position
  const moonNakSpan = 360.0 / 27.0;
  const nakIndex = Math.min(26, Math.floor(moon.siderealLongitude / moonNakSpan));
  const nak = NAKSHATRAS[nakIndex];
  const nakElapsed = moon.siderealLongitude - nak.startDegree;
  const pada = Math.min(4, Math.floor(nakElapsed / (moonNakSpan / 4)) + 1);
  const nakCompletedPercent = (nakElapsed / moonNakSpan) * 100;

  // 4. Nithya Yoga: (Sun + Moon) % 360 / 13°20'
  const sumDegrees = normalizeDegrees(sun.siderealLongitude + moon.siderealLongitude);
  const yogaIndex = Math.min(26, Math.floor(sumDegrees / moonNakSpan));
  const yogaName = NITHYA_YOGAS[yogaIndex];

  // 5. Karana: Elongation divided by 6°
  const karanaIndex = Math.min(59, Math.floor(elongation / 6.0));
  const karanaNum = karanaIndex + 1;
  let karanaName = '';
  let karanaType: 'Chara' | 'Sthira' = 'Chara';

  if (karanaNum === 1) {
    karanaName = 'Kimstughna (किंस्तुघ्न)';
    karanaType = 'Sthira';
  } else if (karanaNum >= 58) {
    if (karanaNum === 58) karanaName = 'Shakuni (शकुनि)';
    else if (karanaNum === 59) karanaName = 'Chatushpada (चतुष्पद)';
    else karanaName = 'Naga (नाग)';
    karanaType = 'Sthira';
  } else {
    // 7 repeating movable karanas
    const charaKaranas = [
      'Bava (बव)',
      'Balava (बालव)',
      'Kaulava (कौलव)',
      'Taitila (तैतिल)',
      'Garija (गरिज)',
      'Vanija (वणिज)',
      'Vishti / Bhadra (विष्टि / भद्रा)',
    ];
    karanaName = charaKaranas[(karanaNum - 2) % 7];
    karanaType = 'Chara';
  }

  return {
    tithi: {
      number: tithiNum,
      name: tithiName,
      paksha,
      completedPercent: Math.round(tithiCompletedPercent * 10) / 10,
    },
    vara: {
      number: dayOfWeek,
      name: varaInfo.name,
      rulingPlanet: varaInfo.lord,
    },
    nakshatra: {
      number: nak.number,
      name: nak.name,
      lord: nak.ruler,
      pada,
      completedPercent: Math.round(nakCompletedPercent * 10) / 10,
    },
    yoga: {
      number: yogaIndex + 1,
      name: yogaName,
    },
    karana: {
      number: karanaNum,
      name: karanaName,
      type: karanaType,
    },
    sunriseUtc: '06:00:00Z', // nominal anchor
    sunsetUtc: '18:15:00Z',
    ayanamsa: {
      type: 'lahiri',
      valueDegrees: ayanamsaDeg,
      formatted: formatDMS(ayanamsaDeg),
    },
  };
}
