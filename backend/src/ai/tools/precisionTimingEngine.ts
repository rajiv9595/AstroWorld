/**
 * ASTROWORLD AI V2 — Precision Timing Window Scanner
 * Scans a date range day-by-day (or step-by-step) computing transits + dasha
 * at each sample, scores each sample against classical rules, and merges
 * consecutive high-scoring samples into exact dated windows with start/end dates.
 * Gives the user exact "from date → to date" favorable periods instead of vague
 * "this year" or "next month" answers.
 */

import {
  executeGetDashaAt,
  executeGetTransits,
  executeGetActiveYogas,
  ToolExecutionResult,
} from '../tools/astrologyTools.ts';
import { BirthProfileInput } from '../schemas/birthProfile.ts';

export interface TimingSample {
  dateIso: string;
  score: number;
  dashaLords: {
    mahadasha: string | undefined;
    antardasha: string | undefined;
    pratyantardasha: string | undefined;
  };
  transits: Array<{
    planet: string;
    sign: string | undefined;
    houseFromLagna: number | undefined;
    houseFromMoon: number | undefined;
    retrograde: boolean | undefined;
  }>;
  sadeSati?: { active: boolean; phase: string | undefined };
  rationale: string[];
}

export interface TimingWindow {
  startIso: string;
  endIso: string;
  startLabel: string;
  endLabel: string;
  averageScore: number;
  peakScore: number;
  peakDateIso: string;
  domain: string;
  rationale: string[];
  tag: string; // e.g. 'favorable_career', 'challenging_health'
}

export interface PrecisionTimingResult {
  success: boolean;
  domain: string;
  timeframe: { startIso: string; endIso: string; label: string };
  samples: TimingSample[];
  windows: TimingWindow[];
  recommendedWindows: TimingWindow[];
  cautionWindows: TimingWindow[];
  totalSamplesScanned: number;
  method: string;
}

interface ScanOptions {
  birthProfile: BirthProfileInput;
  domain: 'career' | 'relationship' | 'finance' | 'health' | 'education' | 'children' | 'general';
  startIso: string;
  endIso: string;
  stepDays?: number; // default 3 days for balance of precision vs speed
  maxSamples?: number; // safety cap
  topN?: number; // how many top windows to return
}

const DEFAULT_STEP_DAYS = 3;
const MAX_SAMPLES = 120; // ~1 year at 3-day steps
const TOP_N = 4;

// House weights per domain: which houses matter most for transit activation
const DOMAIN_HOUSE_WEIGHTS: Record<string, number[]> = {
  career: [10, 1, 6, 11, 4, 7, 9],
  relationship: [7, 2, 1, 9, 5, 11],
  finance: [2, 11, 5, 9, 1, 10],
  health: [1, 6, 8, 12, 4],
  education: [4, 5, 9, 1, 2],
  children: [5, 9, 1, 2, 11],
  general: [1, 4, 7, 10],
};

// Planets that are benefic when transiting key houses (classical gochara from Moon)
const BENEFIC_PLANETS = ['Jupiter', 'Venus', 'Mercury'];
// Planets considered malefic in transit
const MALEFIC_PLANETS = ['Saturn', 'Mars', 'Rahu', 'Ketu'];

export class PrecisionTimingEngine {
  /**
   * Main entry: scan timeframe and return scored windows.
   */
  public async scan(options: ScanOptions): Promise<PrecisionTimingResult> {
    const stepDays = options.stepDays ?? DEFAULT_STEP_DAYS;
    const maxSamples = options.maxSamples ?? MAX_SAMPLES;
    const topN = options.topN ?? TOP_N;

    const startDate = new Date(options.startIso);
    const endDate = new Date(options.endIso);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new Error('Invalid startIso or endIso for timing scan.');
    }
    if (endDate <= startDate) {
      throw new Error('endIso must be after startIso.');
    }

    const samples: TimingSample[] = [];
    let current = new Date(startDate.getTime());
    let count = 0;

    while (current <= endDate && count < maxSamples) {
      const dateIso = current.toISOString();
      const sample = await this.scanSingleDate(options.birthProfile, options.domain, dateIso);
      samples.push(sample);
      current = new Date(current.getTime() + stepDays * 24 * 60 * 60 * 1000);
      count++;
    }

    const windows = this.mergeSamplesIntoWindows(samples, options.domain);
    const recommended = windows
      .filter(w => w.tag.startsWith('favorable'))
      .sort((a, b) => b.peakScore - a.peakScore)
      .slice(0, topN);
    const caution = windows
      .filter(w => w.tag.startsWith('challenging'))
      .sort((a, b) => b.peakScore - a.peakScore)
      .slice(0, topN);

    return {
      success: true,
      domain: options.domain,
      timeframe: {
        startIso: options.startIso,
        endIso: options.endIso,
        label: this.formatTimeframeLabel(startDate, endDate),
      },
      samples,
      windows,
      recommendedWindows: recommended,
      cautionWindows: caution,
      totalSamplesScanned: samples.length,
      method: 'precision_timing_scanner_v1',
    };
  }

  /**
   * Scan a single date: fetch dasha + transits, score against classical rules.
   */
  private async scanSingleDate(
    birthProfile: BirthProfileInput,
    domain: string,
    dateIso: string
  ): Promise<TimingSample> {
    const rationale: string[] = [];
    let score = 0;

    // 1. Dasha at this date
    const dashaResult = await executeGetDashaAt({ birthProfile, targetDateIso: dateIso });
    let dashaLords = { mahadasha: undefined, antardasha: undefined, pratyantardasha: undefined };
    if (dashaResult.success && dashaResult.data) {
      dashaLords = {
        mahadasha: dashaResult.data.activeLords?.mahadasha,
        antardasha: dashaResult.data.activeLords?.antardasha,
        pratyantardasha: dashaResult.data.activeLords?.pratyantardasha,
      };
      const dashaScore = this.scoreDashaLords(dashaLords, domain, birthProfile);
      score += dashaScore.score;
      rationale.push(...dashaScore.rationale);
    }

    // 2. Transits at this date
    const transitResult = await executeGetTransits({ birthProfile, targetDateIso: dateIso });
    let transits: TimingSample['transits'] = [];
    let sadeSati: TimingSample['sadeSati'] = undefined;
    if (transitResult.success && transitResult.data) {
      const rawPlanets = transitResult.data.planets || [];
      transits = rawPlanets.map((p: any) => ({
        planet: p.planet,
        sign: p.sign || p.currentSign,
        houseFromLagna: p.natalLagnaHouse ?? p.houseFromLagna,
        houseFromMoon: p.chandraLagnaHouse ?? p.houseFromMoon,
        retrograde: p.retrograde,
      }));
      sadeSati = transitResult.data.sadeSati;

      const transitScore = this.scoreTransits(transits, domain, sadeSati);
      score += transitScore.score;
      rationale.push(...transitScore.rationale);
    }

    // 3. Active yogas at natal (static but relevant for timing confidence)
    const yogaResult = await executeGetActiveYogas({ birthProfile });
    let yogaRationale: string[] = [];
    if (yogaResult.success && yogaResult.data) {
      const yogas = yogaResult.data.activeYogas || [];
      if (yogas.length > 0) {
        const names = yogas.map((y: any) => y.name || y.id || 'yoga').join(', ');
        yogaRationale.push(`Active classical yogas: ${names}. These amplify dasha-transit results during favorable windows.`);
        score += Math.min(yogas.length, 3) * 1.5; // cap yoga boost
      }
    }
    rationale.push(...yogaRationale);

    // Normalize score to 0-10 range
    const normalizedScore = Math.max(0, Math.min(10, score));

    return {
      dateIso,
      score: normalizedScore,
      dashaLords,
      transits,
      sadeSati,
      rationale: [...new Set(rationale)], // dedupe
    };
  }

  /**
   * Score dasha lords based on classical rules.
   */
  private scoreDashaLords(
    lords: TimingSample['dashaLords'],
    domain: string,
    _birthProfile: BirthProfileInput
  ): { score: number; rationale: string[] } {
    let score = 0;
    const rationale: string[] = [];

    const md = lords.mahadasha;
    const ad = lords.antardasha;
    const pd = lords.pratyantardasha;

    // Kendra-Trikona lords are constructive
    const kendraTrikona = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus'];
    const dusthana = ['Saturn', 'Rahu', 'Ketu'];

    // Mahadasha lord scoring
    if (md) {
      if (kendraTrikona.includes(md)) {
        score += 2.0;
        rationale.push(`Mahadasha ${md} is a Kendra-Trikona significator — constructive period.`);
      } else if (dusthana.includes(md)) {
        score -= 1.0;
        rationale.push(`Mahadasha ${md} is a Dusthana significator — transformational, requires discipline.`);
      }
    }

    // Antardasha lord scoring
    if (ad) {
      if (kendraTrikona.includes(ad)) {
        score += 2.5;
        rationale.push(`Antardasha ${ad} is constructive — supports manifestation.`);
      } else if (dusthana.includes(ad)) {
        score -= 1.5;
        rationale.push(`Antardasha ${ad} is restrictive — expect delays or purification.`);
      }
    }

    // Dasha lord mutual relationship (classical: 5/9, 3/11 good; 6/8 bad)
    if (md && ad) {
      const rel = this.dashaMutualRelation(md, ad);
      if (rel === 'supportive') {
        score += 3.0;
        rationale.push(`${md} → ${ad} dasha relationship is supportive (5/9 or 3/11).`);
      } else if (rel === 'challenging') {
        score -= 3.0;
        rationale.push(`${md} → ${ad} dasha relationship is challenging (6/8 or 2/12).`);
      }
    }

    // Domain-specific dasha favorability
    const domainFavor: Record<string, string[]> = {
      career: ['Sun', 'Jupiter', 'Mars', 'Mercury', 'Venus'],
      relationship: ['Venus', 'Jupiter', 'Moon', 'Mars'],
      finance: ['Jupiter', 'Venus', 'Mercury', 'Sun'],
      health: ['Sun', 'Moon', 'Jupiter', 'Venus'],
      education: ['Jupiter', 'Mercury', 'Sun', 'Moon'],
      children: ['Jupiter', 'Moon', 'Venus'],
      general: ['Jupiter', 'Venus', 'Sun', 'Moon'],
    };
    const favored = domainFavor[domain] ?? domainFavor.general;
    if (md && favored.includes(md)) {
      score += 1.5;
      rationale.push(`Mahadasha ${md} is favorable for ${domain}.`);
    }
    if (ad && favored.includes(ad)) {
      score += 1.0;
      rationale.push(`Antardasha ${ad} is favorable for ${domain}.`);
    }

    return { score, rationale };
  }

  /**
   * Determine dasha mutual relationship (simplified: based on planet order).
   * Classical: 5/9, 3/11 supportive; 6/8 challenging. We approximate using
   * Vimshottari planet sequence positions.
   */
  private dashaMutualRelation(md: string, ad: string): 'supportive' | 'challenging' | 'neutral' {
    const sequence = ['Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury', 'Ketu', 'Venus'];
    const mdIdx = sequence.indexOf(md);
    const adIdx = sequence.indexOf(ad);
    if (mdIdx < 0 || adIdx < 0) return 'neutral';

    // Circular distance in Vimshottari sequence
    const diff = Math.abs(mdIdx - adIdx);
    const circular = Math.min(diff, sequence.length - diff);

    // Approximation: adjacent in sequence often indicates 5/9 or 3/11 type harmony
    // This is a heuristic; exact house math would require full planet positions.
    if (circular === 1 || circular === 2) return 'supportive';
    if (circular === 4 || circular === 5) return 'challenging';
    return 'neutral';
  }

  /**
   * Score transits based on classical gochara rules.
   */
  private scoreTransits(
    transits: TimingSample['transits'],
    domain: string,
    sadeSati: TimingSample['sadeSati']
  ): { score: number; rationale: string[] } {
    let score = 0;
    const rationale: string[] = [];
    const keyHouses = DOMAIN_HOUSE_WEIGHTS[domain] ?? DOMAIN_HOUSE_WEIGHTS.general;

    for (const t of transits) {
      const planet = t.planet;
      const hLagna = t.houseFromLagna;
      const hMoon = t.houseFromMoon;

      // Benefic transiting key houses from Lagna
      if (BENEFIC_PLANETS.includes(planet)) {
        if (hLagna && keyHouses.includes(hLagna)) {
          score += 2.5;
          rationale.push(`${planet} transits house ${hLagna} from Lagna (benefic activation for ${domain}).`);
        }
        if (hMoon && keyHouses.includes(hMoon)) {
          score += 2.0;
          rationale.push(`${planet} transits house ${hMoon} from Moon (benefic gochara).`);
        }
        // Jupiter over Moon or over key house is especially strong
        if (planet === 'Jupiter' && hMoon && [1, 2, 5, 7, 9, 11].includes(hMoon)) {
          score += 2.5;
          rationale.push('Jupiter transits a benefic house from Moon — expansion and protection.');
        }
        // Other benefics over benefic houses from Moon (classical gochara)
        if ((planet === 'Venus' || planet === 'Mercury') && hMoon && [2, 5, 7, 9, 11].includes(hMoon)) {
          score += 1.5;
          rationale.push(`${planet} transits a benefic house from Moon — supportive for ${domain}.`);
        }
      }

      // Malefic transiting key houses (challenging)
      if (MALEFIC_PLANETS.includes(planet)) {
        if (hLagna && keyHouses.includes(hLagna)) {
          score -= 1.5;
          rationale.push(`${planet} transits house ${hLagna} from Lagna — friction in ${domain} area.`);
        }
        if (hMoon && keyHouses.includes(hMoon)) {
          score -= 1.0;
          rationale.push(`${planet} transits house ${hMoon} from Moon — emotional or domestic strain.`);
        }
      }

      // Saturn Sade Sati specific
      if (planet === 'Saturn' && sadeSati?.active) {
        score -= 1.5;
        rationale.push(`Saturn Sade Sati active (phase: ${sadeSati.phase}) — structural testing period.`);
      }

      // Retrograde modifier
      if (t.retrograde === true) {
        score -= 0.5;
        rationale.push(`${planet} is retrograde — results may be delayed or revisited.`);
      }
    }

    // =========================================================================
    // DOUBLE-TRANSIT (JUPITER + SATURN) PREDICTIVE CONFLUENCE (DR. K.N. RAO PRINCIPLE)
    // =========================================================================
    const jupTransit = transits.find((t) => t.planet === 'Jupiter');
    const satTransit = transits.find((t) => t.planet === 'Saturn');

    if (jupTransit?.houseFromLagna && satTransit?.houseFromLagna) {
      const jH = jupTransit.houseFromLagna;
      const sH = satTransit.houseFromLagna;

      // Classical Graha Drishti:
      // Jupiter aspects: conjunction (1st), 5th, 7th, 9th
      const jupAspects = [jH, ((jH - 1 + 4) % 12) + 1, ((jH - 1 + 6) % 12) + 1, ((jH - 1 + 8) % 12) + 1];
      // Saturn aspects: conjunction (1st), 3rd, 7th, 10th
      const satAspects = [sH, ((sH - 1 + 2) % 12) + 1, ((sH - 1 + 6) % 12) + 1, ((sH - 1 + 9) % 12) + 1];

      // Check primary and secondary domain houses
      const primaryHouse = keyHouses[0] || 1;
      const secondaryHouse = keyHouses[1] || 10;

      const jupPrimary = jupAspects.includes(primaryHouse);
      const satPrimary = satAspects.includes(primaryHouse);

      if (jupPrimary && satPrimary) {
        score += 4.5;
        rationale.push(
          `🌟 DOUBLE-TRANSIT CONFLUENCE ACTIVE on House ${primaryHouse}: Both Jupiter (aspecting from House ${jH}) and Saturn (aspecting from House ${sH}) simultaneously activate the primary ${domain} house. According to Dr. K.N. Rao's proven predictive methodology, this double-transit is the supreme astrological trigger for major concrete milestones.`
        );
      } else {
        const jupSec = jupAspects.includes(secondaryHouse);
        const satSec = satAspects.includes(secondaryHouse);
        if (jupSec && satSec) {
          score += 3.5;
          rationale.push(
            `✨ Secondary Double-Transit active on House ${secondaryHouse}: Jupiter and Saturn simultaneously aspect the auxiliary ${domain} house, creating solid background momentum.`
          );
        } else if (jupPrimary) {
          score += 1.5;
          rationale.push(`Jupiter Gochara aspects primary ${domain} house (House ${primaryHouse}) — brings protective grace and expansion.`);
        } else if (satPrimary) {
          score += 1.0;
          rationale.push(`Saturn Gochara aspects primary ${domain} house (House ${primaryHouse}) — demands structured preparation and accountability.`);
        }
      }
    }

    return { score, rationale };
  }

  /**
   * Merge consecutive high-scoring samples into contiguous windows.
   */
  private mergeSamplesIntoWindows(
    samples: TimingSample[],
    domain: string
  ): TimingWindow[] {
    if (samples.length === 0) return [];

    const threshold = 1.5; // score above this = favorable window
    const cautionThreshold = -1.0; // score below this = caution window

    const windows: TimingWindow[] = [];
    let i = 0;

    while (i < samples.length) {
      const s = samples[i];
      if (s.score >= threshold) {
        // Start a favorable window
        const windowStart = i;
        let j = i;
        let peak = s;
        let allRationale: string[] = [...s.rationale];
        while (j + 1 < samples.length && samples[j + 1].score >= threshold) {
          j++;
          allRationale.push(...samples[j].rationale);
          if (samples[j].score > peak.score) peak = samples[j];
        }
        const windowEnd = j;

        windows.push({
          startIso: samples[windowStart].dateIso,
          endIso: samples[windowEnd].dateIso,
          startLabel: this.formatDateLabel(samples[windowStart].dateIso),
          endLabel: this.formatDateLabel(samples[windowEnd].dateIso),
          averageScore: this.avgScore(samples.slice(windowStart, windowEnd + 1)),
          peakScore: peak.score,
          peakDateIso: peak.dateIso,
          domain,
          rationale: [...new Set(allRationale)].slice(0, 6),
          tag: 'favorable_' + domain,
        });
        i = windowEnd + 1;
      } else if (s.score <= cautionThreshold) {
        // Start a caution window
        const windowStart = i;
        let j = i;
        let peak = s;
        let allRationale: string[] = [...s.rationale];
        while (j + 1 < samples.length && samples[j + 1].score <= cautionThreshold) {
          j++;
          allRationale.push(...samples[j].rationale);
          if (samples[j].score < peak.score) peak = samples[j];
        }
        const windowEnd = j;

        windows.push({
          startIso: samples[windowStart].dateIso,
          endIso: samples[windowEnd].dateIso,
          startLabel: this.formatDateLabel(samples[windowStart].dateIso),
          endLabel: this.formatDateLabel(samples[windowEnd].dateIso),
          averageScore: this.avgScore(samples.slice(windowStart, windowEnd + 1)),
          peakScore: peak.score,
          peakDateIso: peak.dateIso,
          domain,
          rationale: [...new Set(allRationale)].slice(0, 6),
          tag: 'challenging_' + domain,
        });
        i = windowEnd + 1;
      } else {
        i++;
      }
    }

    return windows.sort((a, b) => b.peakScore - a.peakScore);
  }

  private avgScore(samples: TimingSample[]): number {
    if (samples.length === 0) return 0;
    return samples.reduce((sum, s) => sum + s.score, 0) / samples.length;
  }

  private formatDateLabel(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  private formatTimeframeLabel(start: Date, end: Date): string {
    const y1 = start.getUTCFullYear();
    const y2 = end.getUTCFullYear();
    if (y1 === y2) {
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} ${y1}`;
    }
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  }
}

export const precisionTimingEngine = new PrecisionTimingEngine();
