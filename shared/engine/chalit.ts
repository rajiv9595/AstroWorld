/**
 * ASTROWORLD — Sripathi Bhava Chalit & Awasiya Bala Engine
 * Implements Chapter 11 (Bhavas, Cusps, and Chalit Chart) & Chapter 16.2 (Residential Bala)
 * of Deepak Kapoor's authoritative treatise "Astronomy and Mathematical Astrology".
 */

// @ts-ignore astronomy-engine has cjs/esm export
import * as Astronomy from 'astronomy-engine';
import { formatDMS, normalizeDegrees } from './astronomy.ts';
import { ZODIAC_SIGNS } from './constants.ts';
import {
  AscendantInfo,
  ChalitBhava,
  ChalitChart,
  ChalitPlanetPlacement,
  PlanetPosition,
  ZodiacSign,
} from './types.ts';

/**
 * Normalizes an angle into [0, 360).
 */
function normDeg(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

/**
 * Calculates the forward circular distance from angle a to angle b along the zodiac.
 * Result is in [0, 360).
 */
export function forwardArc(fromDeg: number, toDeg: number): number {
  return normDeg(toDeg - fromDeg);
}

/**
 * Checks if a longitude falls within the forward arc from startDeg to endDeg.
 */
export function isAngleBetween(targetDeg: number, startDeg: number, endDeg: number): boolean {
  const normTarget = normDeg(targetDeg);
  const normStart = normDeg(startDeg);
  const normEnd = normDeg(endDeg);

  const fullSpan = forwardArc(normStart, normEnd);
  const targetArc = forwardArc(normStart, normTarget);

  return targetArc >= 0 && targetArc < fullSpan;
}

/**
 * Calculate the Midheaven (Madhya Lagna / MC / 10th House Cusp) in sidereal degrees.
 * Derived from Local Sidereal Time (RAMC) and true obliquity of the ecliptic.
 */
export function calculateMidheaven(
  time: any,
  longitude: number,
  ayanamsha: number
): {
  siderealLongitude: number;
  tropicalLongitude: number;
  sign: ZodiacSign;
  degreeInSign: number;
  formattedDegree: string;
} {
  const gmst = Astronomy.SiderealTime(time);
  const lstHours = normDeg((gmst + longitude / 15.0 + 24.0) % 24.0);
  const ramcRad = (lstHours * 15.0 * Math.PI) / 180.0;

  // True obliquity of the ecliptic
  const t = time.ut / 36525.0;
  const epsDeg = 23.4392911 - (46.815 * t) / 3600.0;
  const epsRad = (epsDeg * Math.PI) / 180.0;

  // Midheaven calculation (RAMC on upper meridian)
  // tan(lambda_MC) = tan(RAMC) / cos(eps)
  const y = Math.sin(ramcRad);
  const x = Math.cos(ramcRad) * Math.cos(epsRad);
  let mcTropDeg = (Math.atan2(y, x) * 180.0) / Math.PI;
  mcTropDeg = normDeg(mcTropDeg);

  const mcSidDeg = normalizeDegrees(mcTropDeg - ayanamsha);
  const signIndex = Math.floor(mcSidDeg / 30);
  const sign = ZODIAC_SIGNS[signIndex];
  const degreeInSign = mcSidDeg % 30;

  return {
    siderealLongitude: mcSidDeg,
    tropicalLongitude: mcTropDeg,
    sign,
    degreeInSign,
    formattedDegree: formatDMS(degreeInSign),
  };
}

/**
 * Calculates 12 Sripathi Bhava Madhyas (cusps) and 12 Bhava Sandhis (boundaries).
 * Adheres strictly to the classical trisection procedure explained in Chapter 11.
 */
export function calculateSripathiBhavas(
  ascendantSiderealDegrees: number,
  mcSiderealDegrees: number
): {
  madhyas: number[]; // 1-indexed, length 13 (index 0 unused)
  sandhis: number[]; // 1-indexed, length 13 (index 0 unused)
} {
  const madhyas = new Array(13).fill(0);
  const sandhis = new Array(13).fill(0);

  // 1. Principal Quadrant Points
  madhyas[1] = normDeg(ascendantSiderealDegrees);
  madhyas[7] = normDeg(madhyas[1] + 180.0);
  madhyas[10] = normDeg(mcSiderealDegrees);
  madhyas[4] = normDeg(madhyas[10] + 180.0);

  // 2. Trisection of Eastern/Upper Quadrant: From 10th Cusp (MC) to 1st Cusp (Ascendant)
  const arc10to1 = forwardArc(madhyas[10], madhyas[1]);
  const step10to1 = arc10to1 / 3.0;

  madhyas[11] = normDeg(madhyas[10] + step10to1);
  madhyas[12] = normDeg(madhyas[10] + 2.0 * step10to1);
  // Opposite houses (Western/Lower Quadrant)
  madhyas[5] = normDeg(madhyas[11] + 180.0);
  madhyas[6] = normDeg(madhyas[12] + 180.0);

  // 3. Trisection of Northern/Lower Quadrant: From 1st Cusp (Ascendant) to 4th Cusp (Nadir/IC)
  const arc1to4 = forwardArc(madhyas[1], madhyas[4]);
  const step1to4 = arc1to4 / 3.0;

  madhyas[2] = normDeg(madhyas[1] + step1to4);
  madhyas[3] = normDeg(madhyas[1] + 2.0 * step1to4);
  // Opposite houses (Southern/Upper Quadrant)
  madhyas[8] = normDeg(madhyas[2] + 180.0);
  madhyas[9] = normDeg(madhyas[3] + 180.0);

  // 4. Bhava Sandhis (Boundary between House h and House h+1)
  // Each Sandhi is the exact midpoint of the forward arc between consecutive Madhyas.
  for (let h = 1; h <= 12; h++) {
    const nextH = h === 12 ? 1 : h + 1;
    const arcBetween = forwardArc(madhyas[h], madhyas[nextH]);
    sandhis[h] = normDeg(madhyas[h] + arcBetween / 2.0);
  }

  return { madhyas, sandhis };
}

/**
 * Constructs the complete Sripathi Bhava Chalit Chart, assigns each planet to its
 * actual operational house, determines house shifts, and calculates Awasiya Bala.
 */
export function calculateChalitChart(
  planets: PlanetPosition[],
  ascendant: AscendantInfo,
  mcSiderealDegrees: number
): ChalitChart {
  const { madhyas, sandhis } = calculateSripathiBhavas(
    ascendant.siderealLongitude,
    mcSiderealDegrees
  );

  // Pre-calculate Aarambh and Viram Sandhis for each house 1..12
  const houseAarambh: number[] = new Array(13).fill(0);
  const houseViram: number[] = new Array(13).fill(0);
  for (let h = 1; h <= 12; h++) {
    const prevH = h === 1 ? 12 : h - 1;
    houseAarambh[h] = sandhis[prevH];
    houseViram[h] = sandhis[h];
  }

  // 1. Assign planets to Chalit Houses & Compute Awasiya (Residential) Bala
  const chalitPlacements: ChalitPlanetPlacement[] = planets.map((p) => {
    const lon = normDeg(p.siderealLongitude);
    let assignedHouse = 1;

    for (let h = 1; h <= 12; h++) {
      if (isAngleBetween(lon, houseAarambh[h], houseViram[h])) {
        assignedHouse = h;
        break;
      }
    }

    // Compute Awasiya Bala (Kapoor Chapter 16.2)
    const aarambh = houseAarambh[assignedHouse];
    const madhya = madhyas[assignedHouse];
    const viram = houseViram[assignedHouse];

    let awasiyaShashtiamsha = 0;
    let bhavaHalf: 'PURVA' | 'UTTARA' = 'PURVA';

    if (isAngleBetween(lon, aarambh, madhya)) {
      // First half (Purva Bhag): Rises from 0 at Aarambh to 60 at Madhya
      bhavaHalf = 'PURVA';
      const distFromAarambh = forwardArc(aarambh, lon);
      const purvaSpan = forwardArc(aarambh, madhya);
      awasiyaShashtiamsha = purvaSpan > 0 ? (distFromAarambh / purvaSpan) * 60.0 : 60.0;
    } else {
      // Second half (Uttara Bhag): Decreases from 60 at Madhya to 0 at Viram
      bhavaHalf = 'UTTARA';
      const distToViram = forwardArc(lon, viram);
      const uttaraSpan = forwardArc(madhya, viram);
      awasiyaShashtiamsha = uttaraSpan > 0 ? (distToViram / uttaraSpan) * 60.0 : 0.0;
    }

    awasiyaShashtiamsha = Math.max(0, Math.min(60, Math.round(awasiyaShashtiamsha * 100) / 100));
    const awasiyaPercent = Math.round((awasiyaShashtiamsha / 60.0) * 1000) / 10;

    const shifted = assignedHouse !== p.houseNumber;
    let shiftDirection: 'FORWARD' | 'BACKWARD' | 'SAME' = 'SAME';
    if (shifted) {
      const diff = (assignedHouse - p.houseNumber + 12) % 12;
      shiftDirection = diff === 1 ? 'FORWARD' : diff === 11 ? 'BACKWARD' : 'FORWARD';
    }

    return {
      planet: p.name,
      siderealLongitude: p.siderealLongitude,
      rashiHouse: p.houseNumber,
      chalitHouse: assignedHouse,
      shifted,
      shiftDirection,
      awasiyaBalaShashtiamsha: awasiyaShashtiamsha,
      awasiyaBalaPercent: awasiyaPercent,
      bhavaHalf,
    };
  });

  // 2. Build 12 Chalit Bhava descriptors
  const bhavas: ChalitBhava[] = [];
  for (let h = 1; h <= 12; h++) {
    const madhyaLon = madhyas[h];
    const signIndex = Math.floor(madhyaLon / 30);
    const sign = ZODIAC_SIGNS[signIndex];
    const degInSign = madhyaLon % 30;

    const aarambhLon = houseAarambh[h];
    const viramLon = houseViram[h];
    const span = forwardArc(aarambhLon, viramLon);

    const occupants = chalitPlacements
      .filter((cp) => cp.chalitHouse === h)
      .map((cp) => cp.planet);

    bhavas.push({
      houseNumber: h,
      bhavaMadhya: madhyaLon,
      bhavaMadhyaFormatted: formatDMS(degInSign),
      bhavaMadhyaSign: sign,
      bhavaMadhyaSignIndex: signIndex,
      aarambhSandhi: aarambhLon,
      aarambhSandhiFormatted: formatDMS(aarambhLon % 30),
      viramSandhi: viramLon,
      viramSandhiFormatted: formatDMS(viramLon % 30),
      occupants,
      spanDegrees: Math.round(span * 100) / 100,
    });
  }

  const mcSignIndex = Math.floor(mcSiderealDegrees / 30);
  const mcSign = ZODIAC_SIGNS[mcSignIndex];
  const mcDeg = mcSiderealDegrees % 30;

  return {
    bhavas,
    planets: chalitPlacements,
    midheaven: {
      longitude: mcSiderealDegrees,
      sign: mcSign,
      degreeInSign: mcDeg,
      formattedDegree: formatDMS(mcDeg),
    },
  };
}
