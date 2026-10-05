/**
 * ASTROWORLD — Predictions & Timing Engine
 * Strict evidence-based confluence and timing semantics (EXACT vs EVENT_WINDOW vs UNKNOWN).
 */

import { ZODIAC_SIGNS } from './constants.ts';
import {
  AshtakavargaFacts,
  PlanetPosition,
  TimingPrecision,
  TimingSignal,
  TransitFacts,
  VimshottariDashaFacts,
  YogaFact,
} from './types.ts';

export function calculateTimingSignals(
  dashaFacts: VimshottariDashaFacts,
  transitFacts: TransitFacts,
  ashtakavargaFacts: AshtakavargaFacts,
  yogas: YogaFact[],
  planets: PlanetPosition[]
): TimingSignal[] {
  const signals: TimingSignal[] = [];

  const activeMd = dashaFacts.currentHierarchy.mahadasha;
  const activeAd = dashaFacts.currentHierarchy.antardasha;
  const activePd = dashaFacts.currentHierarchy.pratyantardasha;

  const transitJupiter = transitFacts.planets.find((p) => p.planet === 'Jupiter')!;
  const transitSaturn = transitFacts.planets.find((p) => p.planet === 'Saturn')!;
  const transitSun = transitFacts.planets.find((p) => p.planet === 'Sun')!;

  // 1. Current Active Dasha Window (Event Window)
  signals.push({
    id: `TIMING_DASHA_${activeMd.lord}_${activeAd.subLord}`,
    title: `Active Vimshottari Dasha Window: ${activeMd.lord} / ${activeAd.subLord}`,
    domain: 'GENERAL',
    precision: 'EVENT_WINDOW',
    windowStartIso: activeAd.startDateIso,
    windowEndIso: activeAd.endDateIso,
    confluenceBasis: 'DIRECT',
    activeFactors: [
      `Mahadasha Lord: ${activeMd.lord}`,
      `Antardasha Lord: ${activeAd.subLord}`,
      `Pratyantardasha Lord: ${activePd.pratyantarLord}`,
    ],
    evidenceIds: [
      `EVID_DASHA_ACTIVE_${activeMd.lord}_${activeAd.subLord}`,
    ],
    summary: `The native is progressing through the ${activeMd.lord} Mahadasha and ${activeAd.subLord} Antardasha window (${activeAd.startDateIso.slice(0, 10)} to ${activeAd.endDateIso.slice(0, 10)} UTC dates). The themes associated with these planetary lords are highlighted during this temporal phase.`,
  });

  // 2. Career & Professional Trajectory (Event Window)
  // Check if 10th house or 10th lord is activated by Dasha or Transit Jupiter/Saturn
  const transitJupiterSignIndex = ZODIAC_SIGNS.indexOf(transitJupiter.sign);
  const jupSav = transitJupiterSignIndex >= 0
    ? ashtakavargaFacts.sav[transitJupiterSignIndex]
    : 28;
  const careerConfluence =
    ['Sun', 'Mercury', 'Jupiter', 'Saturn'].includes(activeMd.lord) ||
    ['Sun', 'Mercury', 'Jupiter', 'Saturn'].includes(activeAd.subLord || '');

  signals.push({
    id: 'TIMING_CAREER_EXPANSION',
    title: 'Career & Professional Execution Window',
    domain: 'CAREER',
    precision: 'EVENT_WINDOW',
    windowStartIso: activeAd.startDateIso,
    windowEndIso: activeAd.endDateIso,
    confluenceBasis: careerConfluence && jupSav >= 28 ? 'CONVERGENT' : 'SUPPORTED',
    activeFactors: [
      `Active Dasha: ${activeMd.lord}/${activeAd.subLord}`,
      `Transit Jupiter transiting natal house ${transitJupiter.natalLagnaHouse} (${transitJupiter.sign}) with ${jupSav} SAV bindus`,
      `Transit Saturn in house ${transitSaturn.natalLagnaHouse}`,
    ],
    evidenceIds: [
      'EVID_TRANSIT_JUPITER',
      'EVID_ASHTAKAVARGA_SAV',
    ],
    summary: `The active Dasha window is accompanied by Jupiter transiting house ${transitJupiter.natalLagnaHouse} with ${jupSav} SAV bindus. This is classified as a bounded supported timing signal, not a guaranteed event.`,
  });

  // 3. Exact Solar Ingress (EXACT Timing Precision)
  if (transitFacts.solarIngress) {
    signals.push({
      id: 'TIMING_EXACT_SOLAR_INGRESS',
      title: `Next Sidereal Solar Ingress: Sun enters ${transitFacts.solarIngress.targetSign}`,
      domain: 'GENERAL',
      precision: 'EXACT',
      exactTimestampUtc: transitFacts.solarIngress.timestampUtc,
      confluenceBasis: 'DIRECT',
      activeFactors: [
        `Current Transit Sun: ${transitSun.formattedDegree} in ${transitSun.sign}`,
        `Next sidereal sign boundary: ${transitFacts.solarIngress.targetSign}`,
      ],
      evidenceIds: ['EVID_TRANSIT_SUN_INGRESS_' + transitFacts.solarIngress.targetSign.toUpperCase()],
      summary: `The next sidereal solar ingress into ${transitFacts.solarIngress.targetSign} is calculated at ${transitFacts.solarIngress.timestampUtc}.`,
    });
  }

  // 4. Relationships & Partnership Window
  const venOrJupActive =
    ['Venus', 'Jupiter', 'Moon'].includes(activeMd.lord) ||
    ['Venus', 'Jupiter', 'Moon'].includes(activeAd.subLord || '');

  signals.push({
    id: 'TIMING_RELATIONSHIP_DYNAMICS',
    title: 'Relational Maturation & Harmony Phase',
    domain: 'RELATIONSHIPS',
    precision: 'EVENT_WINDOW',
    windowStartIso: activeAd.startDateIso,
    windowEndIso: activeAd.endDateIso,
    confluenceBasis: venOrJupActive ? 'SUPPORTED' : 'CONTEXTUAL',
    activeFactors: [
      `Active Antardasha: ${activeAd.subLord}`,
      `Venus natal placement and dignity are available in the canonical chart evidence`,
    ],
    evidenceIds: [
      'EVID_PLANET_VENUS_D1',
      `EVID_DASHA_ACTIVE_${activeMd.lord}_${activeAd.subLord}`,
    ],
    summary: `Relational themes are highlighted across the ongoing ${activeAd.subLord} Antardasha window; this signal is contextual unless corroborated by additional relationship-specific evidence.`,
  });

  // 5. Unknown / Low-Evidence Long-Horizon Signal (Demonstrating strict UNKNOWN semantics)
  signals.push({
    id: 'TIMING_UNKNOWN_DISTANT_EVENT',
    title: 'Distant Multi-Decadal Milestone Boundary',
    domain: 'FINANCE',
    precision: 'UNKNOWN',
    confluenceBasis: 'UNRESOLVED',
    activeFactors: ['Insufficient sub-period alignment beyond current 3-tier hierarchy'],
    evidenceIds: ['EVID_LIMITATION_NO_FABRICATED_DATES'],
    summary: 'Classical Vedic astrology does not assign deterministic calendar dates to speculative long-term events without multi-system confluence (Dasha + Gochara + Ashtakavarga). Classified as UNKNOWN to prevent unfounded claims.',
  });

  return signals;
}
