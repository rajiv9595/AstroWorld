/**
 * ASTROWORLD — Vimshottari Dasha Engine
 * Exact astronomical balance calculation and hierarchical timeline (MD / AD / PD).
 */

import { VIMSHOTTARI_DURATIONS, VIMSHOTTARI_SEQUENCE } from './constants.ts';
import { getNakshatraAndPada } from './astronomy.ts';
import { DashaPeriod, PlanetName, VimshottariDashaFacts } from './types.ts';

const DAYS_PER_YEAR = 365.25;
const MS_PER_DAY = 86400000;
const MS_PER_YEAR = DAYS_PER_YEAR * MS_PER_DAY;

function validateDashaInputs(
  moonSiderealLon: number,
  birthDateUtc: Date,
  evaluationDateUtc: Date,
): void {
  if (!Number.isFinite(moonSiderealLon) || moonSiderealLon < 0 || moonSiderealLon >= 360) {
    throw new Error('Vimshottari Dasha requires Moon sidereal longitude in [0, 360).');
  }
  if (!(birthDateUtc instanceof Date) || Number.isNaN(birthDateUtc.getTime())) {
    throw new Error('Vimshottari Dasha requires a valid UTC birth date.');
  }
  if (!(evaluationDateUtc instanceof Date) || Number.isNaN(evaluationDateUtc.getTime())) {
    throw new Error('Vimshottari Dasha requires a valid UTC evaluation date.');
  }
  if (evaluationDateUtc.getTime() < birthDateUtc.getTime()) {
    throw new Error('Vimshottari Dasha evaluation date cannot precede the birth date.');
  }
}

/**
 * Generate sub-lord sequence starting from parent lord.
 */
function getCycleStartingFrom(startLord: PlanetName): PlanetName[] {
  const idx = VIMSHOTTARI_SEQUENCE.indexOf(startLord);
  return Array.from({ length: 9 }, (_, i) => VIMSHOTTARI_SEQUENCE[(idx + i) % 9]);
}

/**
 * Compute complete 120-year Vimshottari Dasha hierarchy and active periods.
 */
export function calculateVimshottariDasha(
  moonSiderealLon: number,
  birthDateUtc: Date,
  evaluationDateUtc: Date = new Date()
): VimshottariDashaFacts {
  validateDashaInputs(moonSiderealLon, birthDateUtc, evaluationDateUtc);
  const nakInfo = getNakshatraAndPada(moonSiderealLon);
  const startLord = nakInfo.nakshatraLord;
  const fullDurYears = VIMSHOTTARI_DURATIONS[startLord];

  // Fraction of nakshatra remaining to be traversed by Moon
  const remainingFraction = Math.max(0, Math.min(1, (100 - nakInfo.completedPercent) / 100));
  const balanceYears = remainingFraction * fullDurYears;
  const elapsedYears = fullDurYears - balanceYears;

  const balanceMonths = Math.floor((balanceYears % 1) * 12);
  const balanceDays = Math.floor((((balanceYears % 1) * 12) % 1) * 30.4375);

  const birthMs = birthDateUtc.getTime();
  const evalMs = evaluationDateUtc.getTime();

  // Initial Mahadasha virtual start timestamp (when the lord's full period theoretically began)
  let currentMs = Math.round(birthMs - elapsedYears * MS_PER_YEAR);

  const mahadashaLords = getCycleStartingFrom(startLord);
  const cycleLengthMs = 120 * MS_PER_YEAR;
  const cycleCount = Math.max(
    1,
    evalMs >= currentMs
      ? Math.ceil((evalMs - currentMs + 1) / cycleLengthMs)
      : 1,
  );
  const mahadashas: VimshottariDashaFacts['mahadashas'] = [];

  let activeMd: DashaPeriod | null = null;
  let activeAd: DashaPeriod | null = null;
  let activePd: DashaPeriod | null = null;

  for (let cycle = 0; cycle < cycleCount; cycle++) {
    for (const mdLord of mahadashaLords) {
    const mdDurYears = VIMSHOTTARI_DURATIONS[mdLord];
    const mdDurMs = Math.round(mdDurYears * MS_PER_YEAR);
    const mdStartMs = currentMs;
    const mdEndMs = mdStartMs + mdDurMs;

    const isMdActive = evalMs >= mdStartMs && evalMs < mdEndMs;

    const mdPeriod: DashaPeriod = {
      level: 'MAHADASHA',
      lord: mdLord,
      startDateIso: new Date(mdStartMs).toISOString(),
      endDateIso: new Date(mdEndMs).toISOString(),
      durationYears: mdDurYears,
      path: mdLord,
      activeNow: isMdActive,
    };

    if (isMdActive) {
      activeMd = mdPeriod;
    }

    // Antardashas within this Mahadasha
    const adLords = getCycleStartingFrom(mdLord);
    const antardashas: {
      period: DashaPeriod;
      pratyantardashas: DashaPeriod[];
    }[] = [];

    let adCurrentMs = mdStartMs;

    for (const adLord of adLords) {
      const adLordDur = VIMSHOTTARI_DURATIONS[adLord];
      const adDurYears = (mdDurYears * adLordDur) / 120.0;
      const adDurMs = Math.round(adDurYears * MS_PER_YEAR);
      const adStartMs = adCurrentMs;
      const adEndMs = adStartMs + adDurMs;

      const isAdActive = evalMs >= adStartMs && evalMs < adEndMs;

      const adPeriod: DashaPeriod = {
        level: 'ANTARDASHA',
        lord: mdLord,
        subLord: adLord,
        startDateIso: new Date(adStartMs).toISOString(),
        endDateIso: new Date(adEndMs).toISOString(),
        durationYears: adDurYears,
        path: `${mdLord}/${adLord}`,
        activeNow: isAdActive,
      };

      if (isAdActive) {
        activeAd = adPeriod;
      }

      // Pratyantardashas within this Antardasha
      const pdLords = getCycleStartingFrom(adLord);
      const pratyantardashas: DashaPeriod[] = [];
      let pdCurrentMs = adStartMs;

      for (const pdLord of pdLords) {
        const pdLordDur = VIMSHOTTARI_DURATIONS[pdLord];
        const pdDurYears = (adDurYears * pdLordDur) / 120.0;
        const pdDurMs = Math.round(pdDurYears * MS_PER_YEAR);
        const pdStartMs = pdCurrentMs;
        const pdEndMs = pdStartMs + pdDurMs;

        const isPdActive = evalMs >= pdStartMs && evalMs < pdEndMs;

        const pdPeriod: DashaPeriod = {
          level: 'PRATYANTARDASHA',
          lord: mdLord,
          subLord: adLord,
          pratyantarLord: pdLord,
          startDateIso: new Date(pdStartMs).toISOString(),
          endDateIso: new Date(pdEndMs).toISOString(),
          durationYears: pdDurYears,
          path: `${mdLord}/${adLord}/${pdLord}`,
          activeNow: isPdActive,
        };

        if (isPdActive) {
          activePd = pdPeriod;
        }

        pratyantardashas.push(pdPeriod);
        pdCurrentMs = pdEndMs;
      }

      antardashas.push({
        period: adPeriod,
        pratyantardashas,
      });

      adCurrentMs = adEndMs;
    }

    mahadashas.push({
      period: mdPeriod,
      antardashas,
    });

      currentMs = mdEndMs;
    }
  }

  // Fallbacks only for evaluation dates that precede the generated sequence.
  const defaultMd = mahadashas[0].period;
  const defaultAd = mahadashas[0].antardashas[0].period;
  const defaultPd = mahadashas[0].antardashas[0].pratyantardashas[0];

  return {
    balanceAtBirth: {
      rulingLord: startLord,
      balanceYears: Math.round(balanceYears * 100) / 100,
      balanceMonths,
      balanceDays,
      fullDurationYears: fullDurYears,
    },
    currentHierarchy: {
      mahadasha: activeMd || defaultMd,
      antardasha: activeAd || defaultAd,
      pratyantardasha: activePd || defaultPd,
    },
    mahadashas,
  };
}
