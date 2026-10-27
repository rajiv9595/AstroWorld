/**
 * Agentic consult tools — compact wrappers over the deterministic astrology engine.
 */

import {
  listDashaWindows,
  findHouseIngressWindows,
  findPlanetSignIngresses,
  rankDomainWindows,
  scanTransits,
  birthProfileToUtcDate,
} from '../../../../shared/index.ts';
import type { TimingDomain, PlanetName } from '../../../../shared/index.ts';
import { validateBirthProfile } from '../schemas/birthProfile.ts';
import { computeCanonicalChartWithConfiguredEphemeris } from '../../services/ephemeris/providerRuntime.ts';
import {
  executeGetBirthChart,
  executeGetDivisionalChart,
  executeGetCurrentDasha,
  executeGetDashaAt,
  executeGetTransits,
  executeGetActiveYogas,
  executeGetPlanetaryStrength,
  executeGetAshtakavarga,
  executeGetJaiminiDetails,
  executeGetPanchanga,
  executeGetChalitChart,
  executeGetUpgrahas,
  ToolExecutionResult,
} from './astrologyTools.ts';
import { CareerReasoningEngine } from '../career/index.ts';

export interface AgentToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, unknown>;
    required: string[];
  };
}

const BIRTH_PROFILE_PROP = {
  type: 'object',
  description: 'Native birth date/time/place. Prefer omitting if already known; server injects it.',
  properties: {
    year: { type: 'number' },
    month: { type: 'number' },
    day: { type: 'number' },
    hour: { type: 'number' },
    minute: { type: 'number' },
    latitude: { type: 'number' },
    longitude: { type: 'number' },
    timezone: { type: 'string' },
  },
};

function fail(tool: string, error: string): ToolExecutionResult {
  return {
    success: false,
    tool,
    error,
    provenance: {
      sourceEngine: 'AstroWorld Agent Engine Tools',
      ruleStandard: 'N/A',
      calculatedAtIso: new Date().toISOString(),
      verified: false,
    },
  };
}

function compactChartSummary(data: any): any {
  if (!data) return data;
  return {
    native: data.native
      ? { name: data.native.name, timezone: data.native.timezone }
      : undefined,
    ascendant: data.ascendant
      ? {
          sign: data.ascendant.sign,
          degreeInSign: data.ascendant.degreeInSign,
          formattedDegree: data.ascendant.formattedDegree,
          nakshatra: data.ascendant.nakshatra,
        }
      : undefined,
    planets: Array.isArray(data.planets)
      ? data.planets.map((p: any) => ({
          name: p.name,
          sign: p.sign,
          houseNumber: p.houseNumber,
          degreeInSign: p.degreeInSign,
          formattedDegree: p.formattedDegree,
          nakshatra: p.nakshatra,
          dignity: p.dignity,
          retrograde: p.retrograde,
          signLord: p.signLord,
        }))
      : undefined,
    houses: Array.isArray(data.houses)
      ? data.houses.map((h: any) => ({
          houseNumber: h.houseNumber,
          sign: h.sign,
          lord: h.lord,
          occupants: h.occupants,
        }))
      : undefined,
    chalit: data.chalit,
    upgrahas: data.upgrahas,
    pastCalibration: data.pastCalibration,
    dasha: data.dasha,
  };
}

async function loadChart(birthProfile: any, evalDate?: Date) {
  const validation = validateBirthProfile(birthProfile);
  if (!validation.valid || !validation.data) {
    throw new Error(validation.error || 'Invalid birth profile');
  }
  const chart = await computeCanonicalChartWithConfiguredEphemeris(
    validation.data,
    evalDate || new Date(),
  );
  return { profile: validation.data, chart };
}

export async function executeScanTransits(args: any): Promise<ToolExecutionResult> {
  try {
    const { chart } = await loadChart(args?.birthProfile);
    const from = new Date(args?.fromIso || Date.now());
    const to = new Date(args?.toIso || Date.now() + 365 * 86400000);
    const stepDays = typeof args?.stepDays === 'number' ? args.stepDays : 30;
    const result = scanTransits(
      chart.planets,
      chart.ascendant.signIndex,
      chart.ashtakavarga,
      from,
      to,
      stepDays,
    );
    return {
      success: true,
      tool: 'scan_transits',
      data: result,
      provenance: {
        sourceEngine: 'Gochara Timing Scan',
        ruleStandard: 'Phaladeepika Ch. 26 (sampled)',
        calculatedAtIso: new Date().toISOString(),
        verified: true,
      },
    };
  } catch (err: any) {
    return fail('scan_transits', err.message);
  }
}

export async function executeScanDashaWindows(args: any): Promise<ToolExecutionResult> {
  try {
    const { profile, chart } = await loadChart(args?.birthProfile);
    const moon = chart.planets.find((p) => p.name === 'Moon');
    if (!moon) return fail('scan_dasha_windows', 'Natal Moon missing');
    const birthUtc = birthProfileToUtcDate(profile);
    const from = new Date(args?.fromIso || Date.now());
    const to = new Date(args?.toIso || Date.now() + 365 * 86400000 * 3);
    const level = (args?.level || 'ANTARDASHA') as 'MAHADASHA' | 'ANTARDASHA' | 'PRATYANTARDASHA';
    const windows = listDashaWindows(moon.siderealLongitude, birthUtc, from, to, level);
    return {
      success: true,
      tool: 'scan_dasha_windows',
      data: { fromIso: from.toISOString(), toIso: to.toISOString(), level, windows },
      provenance: {
        sourceEngine: 'Vimshottari Dasha Engine',
        ruleStandard: 'BPHS Ch. 46',
        calculatedAtIso: new Date().toISOString(),
        verified: true,
      },
    };
  } catch (err: any) {
    return fail('scan_dasha_windows', err.message);
  }
}

export async function executeFindIngresses(args: any): Promise<ToolExecutionResult> {
  try {
    const { chart } = await loadChart(args?.birthProfile);
    const planet = (args?.planet || 'Jupiter') as PlanetName;
    const from = new Date(args?.fromIso || Date.now());
    const to = new Date(args?.toIso || Date.now() + 365 * 86400000 * 2);
    const house = typeof args?.house === 'number' ? args.house : undefined;

    if (house) {
      const windows = findHouseIngressWindows(
        planet,
        chart.ascendant.signIndex,
        house,
        from,
        to,
      );
      return {
        success: true,
        tool: 'find_ingresses',
        data: { mode: 'house', planet, house, windows },
        provenance: {
          sourceEngine: 'Ingress Search',
          ruleStandard: 'Sidereal whole-sign gochara',
          calculatedAtIso: new Date().toISOString(),
          verified: true,
        },
      };
    }

    const ingresses = findPlanetSignIngresses(
      planet,
      from,
      to,
      chart.ascendant.signIndex,
    );
    return {
      success: true,
      tool: 'find_ingresses',
      data: { mode: 'sign', planet, ingresses },
      provenance: {
        sourceEngine: 'Ingress Search',
        ruleStandard: 'Sidereal sign boundary bisection',
        calculatedAtIso: new Date().toISOString(),
        verified: true,
      },
    };
  } catch (err: any) {
    return fail('find_ingresses', err.message);
  }
}

export async function executeRankTimingWindows(args: any): Promise<ToolExecutionResult> {
  try {
    const { profile, chart } = await loadChart(args?.birthProfile);
    const moon = chart.planets.find((p) => p.name === 'Moon');
    if (!moon) return fail('rank_timing_windows', 'Natal Moon missing');
    const domain = (args?.domain || 'general') as TimingDomain;
    const from = new Date(args?.fromIso || Date.now());
    const to = new Date(args?.toIso || Date.now() + 365 * 86400000 * 3);
    const birthUtc = birthProfileToUtcDate(profile);
    const ranked = rankDomainWindows(
      domain,
      chart.planets,
      chart.ascendant.signIndex,
      chart.ashtakavarga,
      moon.siderealLongitude,
      birthUtc,
      from,
      to,
    );
    return {
      success: true,
      tool: 'rank_timing_windows',
      data: { domain, fromIso: from.toISOString(), toIso: to.toISOString(), windows: ranked },
      provenance: {
        sourceEngine: 'Domain Timing Ranker',
        ruleStandard: 'Dasha + Gochara + SAV confluence (EVENT_WINDOW)',
        calculatedAtIso: new Date().toISOString(),
        verified: true,
      },
    };
  } catch (err: any) {
    return fail('rank_timing_windows', err.message);
  }
}

export async function executeAnalyzeCareerAndEducation(args: any): Promise<ToolExecutionResult> {
  try {
    const { chart } = await loadChart(args?.birthProfile);
    const query = args?.query || 'What career or educational path does my chart indicate?';
    const analysis = CareerReasoningEngine.analyzeCareer(chart, query);
    return {
      success: true,
      tool: 'analyze_career_and_education',
      data: analysis,
      provenance: {
        sourceEngine: 'Career & Education Reasoning Engine',
        ruleStandard: 'BPHS Ch. 11/24 + Jaimini Sutras 1.2/1.3 + D10 + D24 Multi-Layer Matrix',
        calculatedAtIso: new Date().toISOString(),
        verified: true,
      },
    };
  } catch (err: any) {
    return fail('analyze_career_and_education', err.message);
  }
}

async function wrapSnapshot(
  name: string,
  executor: (args: any) => Promise<ToolExecutionResult>,
  args: any,
  compact?: (data: any) => any,
): Promise<ToolExecutionResult> {
  const result = await executor(args);
  if (result.success && result.data && compact) {
    result.data = compact(result.data);
  }
  result.tool = name;
  return result;
}

export const AGENT_TOOL_DEFINITIONS: AgentToolDefinition[] = [
  {
    name: 'get_birth_chart',
    description:
      'D1 Rashi chart: Ascendant, 9 planets (sign/house/nakshatra/dignity), house lords. Use for any natal fact.',
    parameters: {
      type: 'object',
      properties: { birthProfile: BIRTH_PROFILE_PROP },
      required: [],
    },
  },
  {
    name: 'get_divisional_chart',
    description: 'One varga chart (D9 marriage, D10 career, D7 children, etc.).',
    parameters: {
      type: 'object',
      properties: {
        birthProfile: BIRTH_PROFILE_PROP,
        vargaCode: {
          type: 'string',
          description: 'D1|D2|D3|D4|D7|D9|D10|D12|D16|D20|D24|D27|D30|D40|D45|D60',
        },
      },
      required: ['vargaCode'],
    },
  },
  {
    name: 'get_current_dasha',
    description: 'Active Vimshottari MD/AD/PD as of today.',
    parameters: { type: 'object', properties: { birthProfile: BIRTH_PROFILE_PROP }, required: [] },
  },
  {
    name: 'get_dasha_at',
    description: 'Vimshottari MD/AD/PD at a specific ISO date.',
    parameters: {
      type: 'object',
      properties: {
        birthProfile: BIRTH_PROFILE_PROP,
        targetDateIso: { type: 'string' },
      },
      required: ['targetDateIso'],
    },
  },
  {
    name: 'get_transits',
    description: 'Gochara snapshot for a date (default now), including Sade Sati.',
    parameters: {
      type: 'object',
      properties: {
        birthProfile: BIRTH_PROFILE_PROP,
        targetDateIso: { type: 'string' },
      },
      required: [],
    },
  },
  {
    name: 'get_active_yogas',
    description: 'Classical yogas and doshas present in the natal chart.',
    parameters: { type: 'object', properties: { birthProfile: BIRTH_PROFILE_PROP }, required: [] },
  },
  {
    name: 'get_planetary_strength',
    description: 'Shadbala, Bhava Bala, Avasthas.',
    parameters: { type: 'object', properties: { birthProfile: BIRTH_PROFILE_PROP }, required: [] },
  },
  {
    name: 'get_ashtakavarga',
    description: 'SAV bindus per sign and strength bands.',
    parameters: { type: 'object', properties: { birthProfile: BIRTH_PROFILE_PROP }, required: [] },
  },
  {
    name: 'get_jaimini_details',
    description: 'Chara karakas, Arudha, Upapada, Karakamsa.',
    parameters: { type: 'object', properties: { birthProfile: BIRTH_PROFILE_PROP }, required: [] },
  },
  {
    name: 'get_panchanga',
    description: 'Birth or target-date Panchanga (tithi, nakshatra, yoga, karana).',
    parameters: {
      type: 'object',
      properties: {
        birthProfile: BIRTH_PROFILE_PROP,
        targetDateIso: { type: 'string' },
      },
      required: [],
    },
  },
  {
    name: 'scan_transits',
    description:
      'Sample gochara across a date range (monthly by default). Required for future timing questions.',
    parameters: {
      type: 'object',
      properties: {
        birthProfile: BIRTH_PROFILE_PROP,
        fromIso: { type: 'string' },
        toIso: { type: 'string' },
        stepDays: { type: 'number' },
      },
      required: ['fromIso', 'toIso'],
    },
  },
  {
    name: 'scan_dasha_windows',
    description: 'List Vimshottari MD/AD/PD periods overlapping a date range.',
    parameters: {
      type: 'object',
      properties: {
        birthProfile: BIRTH_PROFILE_PROP,
        fromIso: { type: 'string' },
        toIso: { type: 'string' },
        level: { type: 'string', description: 'MAHADASHA|ANTARDASHA|PRATYANTARDASHA' },
      },
      required: ['fromIso', 'toIso'],
    },
  },
  {
    name: 'find_ingresses',
    description:
      'Find planet sign ingresses, or windows when a planet occupies a natal house. Exact timestamps for sign changes.',
    parameters: {
      type: 'object',
      properties: {
        birthProfile: BIRTH_PROFILE_PROP,
        planet: { type: 'string' },
        fromIso: { type: 'string' },
        toIso: { type: 'string' },
        house: { type: 'number', description: 'Optional natal house 1-12' },
      },
      required: ['planet', 'fromIso', 'toIso'],
    },
  },
  {
    name: 'rank_timing_windows',
    description:
      'Rank EVENT_WINDOW periods for a life domain (marriage|career|finance|relationship|health|education|general) using dasha+transit+SAV.',
    parameters: {
      type: 'object',
      properties: {
        birthProfile: BIRTH_PROFILE_PROP,
        domain: { type: 'string' },
        fromIso: { type: 'string' },
        toIso: { type: 'string' },
      },
      required: ['domain', 'fromIso', 'toIso'],
    },
  },
  {
    name: 'analyze_career_and_education',
    description:
      'Performs structured, source-grounded multi-layered Vedic career and education analysis: D1 10th house & lord, dispositor chain, D10 Dashamsha, D24 education Siddhamsa, Jaimini AmK/KL/A10, ranked occupational candidates, branch-level distinctions (CSE vs ECE, medicine vs pharmacy), contradiction detection, and explicit epistemic abstention.',
    parameters: {
      type: 'object',
      properties: {
        birthProfile: BIRTH_PROFILE_PROP,
        query: {
          type: 'string',
          description: 'The native\'s specific career or education question (e.g. "CSE or ECE?", "What field should I study?", "Software engineer vs Data scientist").',
        },
      },
      required: [],
    },
  },
  {
    name: 'get_domain_playbook',
    description: 'Retrieve method checklist for a life domain (technique steps, not an answer).',
    parameters: {
      type: 'object',
      properties: {
        domain: { type: 'string' },
        question: { type: 'string' },
      },
      required: [],
    },
  },
  {
    name: 'retrieve_classical_rules',
    description: 'RAG over classical Jyotish knowledge (BPHS, Phaladeepika, etc.).',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string' },
        limit: { type: 'number' },
      },
      required: ['query'],
    },
  },
  {
    name: 'web_search',
    description:
      'Google Search for worldly facts only (festivals, news, general definitions). NEVER for natal chart math or predictive dates.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string' },
      },
      required: ['query'],
    },
  },
];

type ToolHandler = (args: any) => Promise<ToolExecutionResult>;

const SNAPSHOT_HANDLERS: Record<string, ToolHandler> = {
  get_birth_chart: (args) =>
    wrapSnapshot('get_birth_chart', executeGetBirthChart, args, compactChartSummary),
  get_divisional_chart: (args) =>
    wrapSnapshot('get_divisional_chart', executeGetDivisionalChart, args, (d) => ({
      vargaCode: d.vargaCode,
      vargaName: d.vargaName,
      ascendantSign: d.ascendantSign,
      planets: Array.isArray(d.planets)
        ? d.planets.map((p: any) => ({
            planet: p.planet,
            sign: p.vargaSign || p.sign,
            houseNumber: p.houseNumber,
            dignity: p.dignity,
          }))
        : d.planets,
    })),
  get_current_dasha: (args) => wrapSnapshot('get_current_dasha', executeGetCurrentDasha, args),
  get_dasha_at: (args) => wrapSnapshot('get_dasha_at', executeGetDashaAt, args),
  get_transits: (args) =>
    wrapSnapshot('get_transits', executeGetTransits, args, (d) => ({
      queryDateIso: d.queryDateIso,
      sadeSati: d.sadeSati,
      planets: Array.isArray(d.planets)
        ? d.planets.map((p: any) => ({
            planet: p.planet,
            sign: p.sign,
            natalLagnaHouse: p.natalLagnaHouse,
            chandraLagnaHouse: p.chandraLagnaHouse,
            ashtakavargaBindus: p.ashtakavargaBindus,
            retrograde: p.retrograde,
          }))
        : d.planets,
    })),
  get_active_yogas: (args) =>
    wrapSnapshot('get_active_yogas', executeGetActiveYogas, args, (d) => ({
      activeYogasCount: d.activeYogasCount,
      yogas: Array.isArray(d.yogas)
        ? d.yogas.map((y: any) => ({
            name: y.name,
            category: y.category,
            formingPlanets: y.formingPlanets,
            housesInvolved: y.housesInvolved,
            effects: y.effects,
          }))
        : d.yogas,
      doshas: Array.isArray(d.doshas)
        ? d.doshas
            .filter((x: any) => x.present)
            .map((x: any) => ({
              name: x.name,
              severity: x.severity,
              description: x.description,
            }))
        : d.doshas,
    })),
  get_planetary_strength: (args) =>
    wrapSnapshot('get_planetary_strength', executeGetPlanetaryStrength, args, (d) => ({
      shadbala: Array.isArray(d.shadbala)
        ? d.shadbala.map((s: any) => ({
            planet: s.planet,
            totalRupas: s.totalRupas,
            strengthRatio: s.strengthRatio,
            verdict: s.verdict,
            rank: s.rank,
          }))
        : d.shadbala,
    })),
  get_ashtakavarga: (args) => wrapSnapshot('get_ashtakavarga', executeGetAshtakavarga, args),
  get_jaimini_details: (args) => wrapSnapshot('get_jaimini_details', executeGetJaiminiDetails, args),
  get_panchanga: (args) => wrapSnapshot('get_panchanga', executeGetPanchanga, args),
  get_chalit_chart: (args) => wrapSnapshot('get_chalit_chart', executeGetChalitChart, args),
  get_upgrahas: (args) => wrapSnapshot('get_upgrahas', executeGetUpgrahas, args),
  scan_transits: executeScanTransits,
  scan_dasha_windows: executeScanDashaWindows,
  find_ingresses: executeFindIngresses,
  rank_timing_windows: executeRankTimingWindows,
  analyze_career_and_education: executeAnalyzeCareerAndEducation,
};

export function getSnapshotHandlers(): Record<string, ToolHandler> {
  return SNAPSHOT_HANDLERS;
}

export function getAgentFunctionDeclarations(): any[] {
  return AGENT_TOOL_DEFINITIONS.map((def) => ({
    name: def.name,
    description: def.description,
    parameters: def.parameters,
  }));
}
