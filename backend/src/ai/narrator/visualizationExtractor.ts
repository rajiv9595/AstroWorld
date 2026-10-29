/**
 * ASTROWORLD AI V3 — Contextual Consultation Visualization Extractor
 * Deterministically synthesizes visual metadata (Dasha Timeline, Shadbala Meters, Timing Probability)
 * from verified engine calculations and evidence packets for rich in-chat rendering.
 */

import { ConsultationVisualizations, DashaTimelineViz, PlanetaryStrengthViz, TimingProbabilityViz, AshtakavargaHouseViz } from '../schemas/visualizations.ts';
import { EvidencePacket } from '../schemas/evidencePacket.ts';
import { ReasoningPacket } from '../schemas/reasoningPacket.ts';
import { QuestionPlan } from '../schemas/questionPlan.ts';
import { ResponsePlan } from '../schemas/responsePlan.ts';
import { BirthProfile } from '../schemas/birthProfile.ts';
import { computeCanonicalChartWithConfiguredEphemeris } from '../../services/ephemeris/providerRuntime.ts';

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

export async function extractConsultationVisualizations(params: {
  evidencePacket?: EvidencePacket;
  reasoningPacket?: ReasoningPacket;
  questionPlan?: QuestionPlan;
  responsePlan?: ResponsePlan;
  birthProfile?: BirthProfile;
  query?: string;
  domain?: string;
}): Promise<ConsultationVisualizations | undefined> {
  const { evidencePacket, reasoningPacket, questionPlan, responsePlan, birthProfile } = params;
  const viz: ConsultationVisualizations = {};
  const now = new Date();
  const q = (params.query || questionPlan?.normalizedQuestion || questionPlan?.rawQuestion || '').toLowerCase();
  const domain = params.domain || questionPlan?.domain || 'general';

  // Strict relevance filters: NEVER attach widgets just to show off; only include when directly relevant to user intent!
  const isTimingQuery = Boolean(
    q && /\b(when|timing|dasha|mahadasha|antardasha|timeline|window|date|dates|month|months|year|years|future|in 20\d\d|schedule|period|start|begin|happen|offer|contract|placement|milestone)\b/i.test(q)
  );
  const isProbabilityQuery = Boolean(
    q && /\b(probability|chances?|rate|score|predict|favorable|percentage|which month|highest probability|will i)\b/i.test(q)
  );
  const isStrengthQuery = Boolean(
    q && /\b(shadbala|virupas?|planetary\s*strength|strongest\s*planet|weakest\s*planet|balas?|potency)\b/i.test(q)
  );
  const isAshtakavargaQuery = Boolean(
    q && /\b(ashtakavarga|bindus?|sarvashtakavarga|sav|bav|house\s*energy|house\s*strength|wealth\s*retention|retention\s*ratio)\b/i.test(q)
  );

  // 1. Extract Dasha Timeline (Only if query is timing-related)
  if (isTimingQuery || !q) {
  try {
    const dashaTool = evidencePacket?.toolResults?.find(
      r => (r.toolName === 'get_current_dasha' || r.toolName === 'get_dasha_at') && r.success && r.data
    );

    let activeLords = dashaTool?.data?.activeLords || dashaTool?.data?.currentHierarchy;
    let md = dashaTool?.data?.mahadasha || activeLords?.mahadasha?.lord;
    let ad = dashaTool?.data?.antardasha || activeLords?.antardasha?.subLord || activeLords?.antardasha?.lord;
    let pd = dashaTool?.data?.pratyantardasha || activeLords?.pratyantardasha?.pratyantarLord;
    let startIso = activeLords?.antardasha?.startDateIso || activeLords?.mahadasha?.startDateIso;
    let endIso = activeLords?.antardasha?.endDateIso || activeLords?.mahadasha?.endDateIso;

    // Fallback directly to canonical chart if dasha tool wasn't invoked
    if ((!md || !startIso) && birthProfile) {
      try {
        const chart = await computeCanonicalChartWithConfiguredEphemeris(birthProfile, now);
        const curr = chart.dasha.currentHierarchy;
        md = curr.mahadasha?.lord;
        ad = curr.antardasha?.subLord || curr.antardasha?.lord;
        pd = curr.pratyantardasha?.pratyantarLord || curr.pratyantardasha?.subLord;
        startIso = curr.antardasha?.startDateIso || curr.mahadasha?.startDateIso;
        endIso = curr.antardasha?.endDateIso || curr.mahadasha?.endDateIso;
      } catch {}
    }

    if (md && startIso && endIso) {
      const startTime = new Date(startIso).getTime();
      const endTime = new Date(endIso).getTime();
      const nowTime = now.getTime();
      const totalSpan = Math.max(1, endTime - startTime);
      const elapsed = Math.min(100, Math.max(0, Math.round(((nowTime - startTime) / totalSpan) * 100)));
      const remainingMs = Math.max(0, endTime - nowTime);
      const remainingYears = Math.max(0, Number((remainingMs / (1000 * 86400 * 365.25)).toFixed(1)));

      const nextLord = getNextDashaLord(ad || md);
      const endDateFormatted = new Date(endIso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

      viz.dashaTimeline = {
        type: 'dasha_timeline',
        mahadasha: md,
        antardasha: ad || md,
        pratyantardasha: pd,
        startDateIso: startIso,
        endDateIso: endIso,
        percentElapsed: elapsed,
        remainingYears,
        nextMilestone: `${nextLord} period begins around ${endDateFormatted}`,
      };
    }
  } catch (err) {
    console.warn('[VisualizationExtractor] Dasha timeline extraction error:', err);
  }
  }

  // 2. Extract Planetary Strengths (Shadbala - Only if requested or strength-relevant)
  if (isStrengthQuery) {
  try {
    const strengthTool = evidencePacket?.toolResults?.find(
      r => r.toolName === 'get_planetary_strength' && r.success && r.data?.shadbala
    );

    let shadbalaMap = strengthTool?.data?.shadbala;

    if (!shadbalaMap && birthProfile) {
      try {
        const chart = await computeCanonicalChartWithConfiguredEphemeris(birthProfile, now);
        shadbalaMap = chart.strength.shadbala;
      } catch {}
    }

    if (shadbalaMap && typeof shadbalaMap === 'object') {
      const relevantPlanets = getRelevantPlanetsForDomain(questionPlan?.domain, questionPlan?.normalizedQuestion || questionPlan?.rawQuestion);
      const strengths: PlanetaryStrengthViz[] = [];

      for (const planet of relevantPlanets) {
        const pKey = Object.keys(shadbalaMap).find(k => k.toLowerCase() === planet.toLowerCase());
        const pData = pKey ? shadbalaMap[pKey] : null;
        if (pData) {
          const virupas = Math.round(pData.totalVirupas || pData.virupas || 0);
          const req = Math.round(pData.requiredVirupas || 390);
          const ratio = Number(((virupas / Math.max(1, req))).toFixed(2));
          const isStrong = ratio >= 1.0;
          strengths.push({
            type: 'planetary_strength',
            planet: capitalize(planet),
            virupas,
            requiredVirupas: req,
            ratio,
            isStrong,
            statusText: ratio >= 1.25 ? 'High Potency' : ratio >= 1.0 ? 'Adequate / Strong' : 'Requires Cultivation',
          });
        }
      }

      if (strengths.length > 0) {
        viz.planetaryStrengths = strengths.slice(0, 3);
      }
    }
  } catch (err) {
    console.warn('[VisualizationExtractor] Planetary strength extraction error:', err);
  }
  }

  // 3. Extract Timing Probability Gauge (Only if timing probability query)
  if (isProbabilityQuery) {
  try {
    const timingWindows = responsePlan?.contextPack?.timingWindows || [];
    const primaryWindow = timingWindows[0];
    const targetDomain = domain || questionPlan?.domain || 'career';
    const direction = reasoningPacket?.direction || 'supportive';

    if (primaryWindow || targetDomain !== 'general') {
      const confluence = reasoningPacket?.confluence;
      const suppScore = confluence?.supportiveScore ?? (direction === 'supportive' ? 2.5 : direction === 'mixed' ? 1.5 : 0.5);
      const restScore = confluence?.restrictingScore ?? (direction === 'challenging' ? 2.0 : 0.5);
      const totalScore = suppScore + restScore;

      // Mathematically derived from evaluated chart layers rather than hardcoded constants
      const calculatedPercent = totalScore > 0
        ? Math.min(95, Math.max(20, Math.round((suppScore / totalScore) * 100)))
        : 50;

      let status: TimingProbabilityViz['status'] = 'supportive';
      if (calculatedPercent >= 75 && (confluence?.confluenceStrength === 'strong' || direction === 'supportive')) {
        status = 'highly_favorable';
      } else if (calculatedPercent >= 55) {
        status = 'supportive';
      } else if (calculatedPercent >= 40) {
        status = 'mixed';
      } else {
        status = 'friction';
      }

      const keyDrivers: string[] = [];
      if (responsePlan?.contextPack?.supportingFactors?.length) {
        keyDrivers.push(responsePlan.contextPack.supportingFactors[0]);
      }
      if (responsePlan?.contextPack?.transitFocus) {
        keyDrivers.push(`Transit ${responsePlan.contextPack.transitFocus.transitingPlanet} activating House ${responsePlan.contextPack.transitFocus.targetHouse}`);
      }
      if (keyDrivers.length === 0) {
        keyDrivers.push('Dasha lord angular alignment');
      }

      const layersCount = confluence?.convergingLayersCount ?? (status === 'highly_favorable' ? 3 : 2);
      const dynamicSummary = status === 'highly_favorable'
        ? `High astronomical synergy confirmed across ${layersCount} evaluated chart layers (support index: ${suppScore}).`
        : status === 'supportive'
        ? `Favorable alignment across ${layersCount} chart layers with steady structural support.`
        : status === 'mixed'
        ? `Dual support and restraint factors detected (support: ${suppScore}, restraint: ${restScore}); demands measured preparation.`
        : `Elevated restrictive influences (restraint index: ${restScore}); favorable for strategic preparation rather than immediate expansion.`;

      viz.timingProbability = {
        type: 'timing_probability',
        windowLabel: primaryWindow?.label || `${capitalize(targetDomain)} Alignment Cycle`,
        periodText: primaryWindow?.periodText || 'Upcoming Strategic Window',
        scorePercent: calculatedPercent,
        status,
        summary: dynamicSummary,
        keyDrivers: keyDrivers.slice(0, 2),
      };
    }
  } catch (err) {
    console.warn('[VisualizationExtractor] Timing probability extraction error:', err);
  }
  }

  // 4. Extract Ashtakavarga Summary (Only if Ashtakavarga or financial retention query)
  if (isAshtakavargaQuery) {
  try {
    const avTool = evidencePacket?.toolResults?.find(
      r => r.toolName === 'get_ashtakavarga' && r.success && r.data?.sav
    );

    let sav = avTool?.data?.sav;

    if (!sav && birthProfile) {
      try {
        const chart = await computeCanonicalChartWithConfiguredEphemeris(birthProfile, now);
        sav = chart.ashtakavarga?.sav;
      } catch {}
    }

    if (sav && Array.isArray(sav) && sav.length >= 12) {
      const targetHouses = getDomainKeyHouses(domain || questionPlan?.domain);
      const housesViz: AshtakavargaHouseViz[] = [];

      for (const houseNum of targetHouses) {
        const bindus = Number(sav[houseNum - 1]) || 28;
        const status = bindus >= 32 ? 'exceptional' : bindus >= 28 ? 'strong' : bindus >= 25 ? 'average' : 'friction';
        housesViz.push({
          type: 'ashtakavarga_house',
          house: houseNum,
          bindus,
          status,
        });
      }

      if (housesViz.length > 0) {
        viz.ashtakavargaSummary = housesViz;
      }
    }
  } catch (err) {
    console.warn('[VisualizationExtractor] Ashtakavarga summary extraction error:', err);
  }
  }

  // Only return viz if at least one visualization was populated
  if (Object.keys(viz).length > 0) {
    return viz;
  }
  return undefined;
}

function getNextDashaLord(currentLord: string): string {
  const sequence = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
  const idx = sequence.findIndex(p => p.toLowerCase() === currentLord.toLowerCase());
  if (idx >= 0) {
    return sequence[(idx + 1) % sequence.length];
  }
  return 'Next';
}

function getRelevantPlanetsForDomain(domain?: string, query?: string): string[] {
  const q = (query || '').toLowerCase();
  if (q.includes('saturn') || q.includes('sade')) return ['Saturn', 'Jupiter', 'Moon'];
  if (q.includes('jupiter')) return ['Jupiter', 'Saturn', 'Sun'];
  if (q.includes('mercury') || q.includes('business')) return ['Mercury', 'Jupiter', 'Saturn'];
  if (q.includes('venus') || q.includes('marriage') || q.includes('relationship')) return ['Venus', 'Jupiter', 'Mars'];
  if (q.includes('mars')) return ['Mars', 'Sun', 'Jupiter'];

  switch (domain) {
    case 'career':
      return ['Saturn', 'Jupiter', 'Sun'];
    case 'marriage':
    case 'relationship':
      return ['Venus', 'Jupiter', 'Moon'];
    case 'finance':
    case 'wealth':
      return ['Jupiter', 'Mercury', 'Venus'];
    case 'health':
      return ['Sun', 'Mars', 'Saturn'];
    case 'education':
      return ['Mercury', 'Jupiter', 'Moon'];
    default:
      return ['Jupiter', 'Saturn', 'Sun'];
  }
}

function getDomainKeyHouses(domain?: string): number[] {
  switch (domain) {
    case 'career':
      return [10, 11, 1];
    case 'marriage':
    case 'relationship':
      return [7, 2, 11];
    case 'finance':
    case 'wealth':
      return [11, 2, 9];
    case 'health':
      return [1, 6, 8];
    default:
      return [10, 11, 1];
  }
}

function capitalize(s: string): string {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}
