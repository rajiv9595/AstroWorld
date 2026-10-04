/**
 * ASTROWORLD AI V2 — Astrology Tool Implementations
 * Direct adapters to the deterministic shared calculation engine.
 * Pure, structured, verifiable data responses only — zero prose or interpretation.
 */

import {
  computeCanonicalChart,
  calculateLahiriAyanamsha,
  calculatePlanetaryPositions,
  calculateAscendant,
  birthProfileToUtcDate,
  generateAllShodashavargas,
  calculateVimshottariDasha,
  calculateTransits,
  calculateYogasAndDoshas,
  calculateStrengthFacts,
  calculateAshtakavarga,
  calculateJaiminiFacts,
  calculatePanchanga,
  VargaCode,
} from '../../../../shared/index.ts';

import { validateBirthProfile, VALID_VARGA_CODES } from '../schemas/birthProfile.ts';

export interface ToolExecutionResult<T = any> {
  success: boolean;
  tool: string;
  data?: T;
  error?: string;
  provenance: {
    sourceEngine: string;
    ruleStandard: string;
    calculatedAtIso: string;
    verified: boolean;
  };
}

/**
 * 1. get_birth_chart (D1 Rashi)
 */
export function executeGetBirthChart(args: any): ToolExecutionResult {
  const validation = validateBirthProfile(args?.birthProfile);
  if (!validation.valid || !validation.data) {
    return {
      success: false,
      tool: 'get_birth_chart',
      error: validation.error || 'Invalid birth profile arguments.',
      provenance: {
        sourceEngine: 'AstroWorld Canonical Ephemeris',
        ruleStandard: 'Surya Siddhanta & BPHS',
        calculatedAtIso: new Date().toISOString(),
        verified: false,
      },
    };
  }

  try {
    const chart = computeCanonicalChart(validation.data);
    return {
      success: true,
      tool: 'get_birth_chart',
      data: {
        native: chart.birthProfile,
        ascendant: chart.ascendant,
        planets: chart.planets,
        houses: chart.houses,
      },
      provenance: {
        sourceEngine: 'AstroWorld Canonical Ephemeris (astronomy-engine + Analytical Lahiri Ayanamsha)',
        ruleStandard: 'BPHS Ch. 3 (Graha Guna Swarupa)',
        calculatedAtIso: new Date().toISOString(),
        verified: true,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      tool: 'get_birth_chart',
      error: `Calculation error: ${err.message}`,
      provenance: {
        sourceEngine: 'AstroWorld Canonical Ephemeris (astronomy-engine + Analytical Lahiri Ayanamsha)',
        ruleStandard: 'Surya Siddhanta & BPHS',
        calculatedAtIso: new Date().toISOString(),
        verified: false,
      },
    };
  }
}

/**
 * 2. get_divisional_chart (Vargas D1 to D60)
 */
export function executeGetDivisionalChart(args: any): ToolExecutionResult {
  const validation = validateBirthProfile(args?.birthProfile);
  if (!validation.valid || !validation.data) {
    return {
      success: false,
      tool: 'get_divisional_chart',
      error: validation.error || 'Invalid birth profile.',
      provenance: {
        sourceEngine: 'Parashari Shodashavarga Engine (astronomy-engine + Analytical Lahiri Ayanamsha)',
        ruleStandard: 'BPHS Ch. 6',
        calculatedAtIso: new Date().toISOString(),
        verified: false,
      },
    };
  }

  const vargaCode = (args?.vargaCode || 'D9').toUpperCase() as VargaCode;
  if (!VALID_VARGA_CODES.includes(vargaCode)) {
    return {
      success: false,
      tool: 'get_divisional_chart',
      error: `Invalid vargaCode: "${vargaCode}". Must be one of: ${VALID_VARGA_CODES.join(', ')}`,
      provenance: {
        sourceEngine: 'Parashari Shodashavarga Engine (astronomy-engine + Analytical Lahiri Ayanamsha)',
        ruleStandard: 'BPHS Ch. 6',
        calculatedAtIso: new Date().toISOString(),
        verified: false,
      },
    };
  }

  try {
    const chart = computeCanonicalChart(validation.data);
    const targetVarga = chart.vargas[vargaCode];

    return {
      success: true,
      tool: 'get_divisional_chart',
      data: {
        vargaCode,
        vargaName: targetVarga.name,
        harmonicDivision: targetVarga.divisionNumber,
        ascendantSign: targetVarga.ascendantSign,
        ascendantSignIndex: targetVarga.ascendantSignIndex,
        planets: targetVarga.planets,
      },
      provenance: {
        sourceEngine: 'Parashari Shodashavarga Engine (astronomy-engine + Analytical Lahiri Ayanamsha)',
        ruleStandard: `BPHS Ch. 6 (Varga Ganita - ${vargaCode})`,
        calculatedAtIso: new Date().toISOString(),
        verified: true,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      tool: 'get_divisional_chart',
      error: `Varga calculation error: ${err.message}`,
      provenance: {
        sourceEngine: 'Parashari Shodashavarga Engine (astronomy-engine + Analytical Lahiri Ayanamsha)',
        ruleStandard: 'BPHS Ch. 6',
        calculatedAtIso: new Date().toISOString(),
        verified: false,
      },
    };
  }
}

/**
 * 2b. get_all_divisional_charts (Complete Shodashavarga D1 through D60)
 */
export function executeGetAllDivisionalCharts(args: any): ToolExecutionResult {
  const validation = validateBirthProfile(args?.birthProfile);
  if (!validation.valid || !validation.data) {
    return {
      success: false,
      tool: 'get_all_divisional_charts',
      error: validation.error || 'Invalid birth profile.',
      provenance: {
        sourceEngine: 'Parashari Shodashavarga Engine (astronomy-engine + Analytical Lahiri Ayanamsha)',
        ruleStandard: 'BPHS Ch. 6 (Shodashavarga Adhyaya)',
        calculatedAtIso: new Date().toISOString(),
        verified: false,
      },
    };
  }

  try {
    const chart = computeCanonicalChart(validation.data);
    const vargasSummary: Record<string, any> = {};
    for (const [code, varga] of Object.entries(chart.vargas)) {
      vargasSummary[code] = {
        name: varga.name,
        sanskritName: varga.sanskritName,
        divisionNumber: varga.divisionNumber,
        purpose: varga.purpose,
        ascendantSign: varga.ascendantSign,
        planets: varga.planets.map(p => ({
          planet: p.planet,
          sign: p.vargaSign,
          houseNumber: p.houseNumber,
          dignity: p.dignity,
        })),
      };
    }

    return {
      success: true,
      tool: 'get_all_divisional_charts',
      data: {
        availableVargas: Object.keys(vargasSummary),
        count: Object.keys(vargasSummary).length,
        vargas: vargasSummary,
      },
      provenance: {
        sourceEngine: 'Parashari Shodashavarga Engine (astronomy-engine + Analytical Lahiri Ayanamsha)',
        ruleStandard: 'BPHS Ch. 6 (Complete 16 Divisional Matrix)',
        calculatedAtIso: new Date().toISOString(),
        verified: true,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      tool: 'get_all_divisional_charts',
      error: `Complete Shodashavarga calculation error: ${err.message}`,
      provenance: {
        sourceEngine: 'Parashari Shodashavarga Engine (astronomy-engine + Analytical Lahiri Ayanamsha)',
        ruleStandard: 'BPHS Ch. 6',
        calculatedAtIso: new Date().toISOString(),
        verified: false,
      },
    };
  }
}

/**
 * 3. get_current_dasha
 */
export function executeGetCurrentDasha(args: any): ToolExecutionResult {
  const validation = validateBirthProfile(args?.birthProfile);
  if (!validation.valid || !validation.data) {
    return {
      success: false,
      tool: 'get_current_dasha',
      error: validation.error || 'Invalid birth profile.',
      provenance: {
        sourceEngine: 'Vimshottari Dasha Engine',
        ruleStandard: 'BPHS Ch. 46',
        calculatedAtIso: new Date().toISOString(),
        verified: false,
      },
    };
  }

  try {
    const chart = computeCanonicalChart(validation.data);
    return {
      success: true,
      tool: 'get_current_dasha',
      data: {
        balanceAtBirth: chart.dasha.balanceAtBirth,
        currentHierarchy: chart.dasha.currentHierarchy,
        activeLords: {
          mahadasha: chart.dasha.currentHierarchy.mahadasha?.lord,
          antardasha: chart.dasha.currentHierarchy.antardasha?.subLord || chart.dasha.currentHierarchy.antardasha?.lord,
          pratyantardasha: chart.dasha.currentHierarchy.pratyantardasha?.pratyantarLord || chart.dasha.currentHierarchy.pratyantardasha?.lord,
        },
      },
      provenance: {
        sourceEngine: 'Vimshottari Dasha Engine (120-Year Cycle)',
        ruleStandard: 'BPHS Ch. 46 (Dasha Paddhati)',
        calculatedAtIso: new Date().toISOString(),
        verified: true,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      tool: 'get_current_dasha',
      error: `Dasha calculation error: ${err.message}`,
      provenance: {
        sourceEngine: 'Vimshottari Dasha Engine',
        ruleStandard: 'BPHS Ch. 46',
        calculatedAtIso: new Date().toISOString(),
        verified: false,
      },
    };
  }
}

/**
 * 4. get_dasha_at (Target Date)
 */
export function executeGetDashaAt(args: any): ToolExecutionResult {
  const validation = validateBirthProfile(args?.birthProfile);
  if (!validation.valid || !validation.data) {
    return {
      success: false,
      tool: 'get_dasha_at',
      error: validation.error || 'Invalid birth profile.',
      provenance: {
        sourceEngine: 'Vimshottari Dasha Engine',
        ruleStandard: 'BPHS Ch. 46',
        calculatedAtIso: new Date().toISOString(),
        verified: false,
      },
    };
  }

  const targetDateStr = args?.targetDateIso;
  if (!targetDateStr || isNaN(Date.parse(targetDateStr))) {
    return {
      success: false,
      tool: 'get_dasha_at',
      error: 'Invalid or missing targetDateIso string (e.g. "2027-03-15T00:00:00Z").',
      provenance: {
        sourceEngine: 'Vimshottari Dasha Engine',
        ruleStandard: 'BPHS Ch. 46',
        calculatedAtIso: new Date().toISOString(),
        verified: false,
      },
    };
  }

  try {
    const targetDateUtc = new Date(targetDateStr);
    const chart = computeCanonicalChart(validation.data, targetDateUtc);

    return {
      success: true,
      tool: 'get_dasha_at',
      data: {
        targetDateIso: targetDateUtc.toISOString(),
        activeHierarchy: chart.dasha.currentHierarchy,
        activeLords: {
          mahadasha: chart.dasha.currentHierarchy.mahadasha?.lord,
          antardasha: chart.dasha.currentHierarchy.antardasha?.subLord || chart.dasha.currentHierarchy.antardasha?.lord,
          pratyantardasha: chart.dasha.currentHierarchy.pratyantardasha?.pratyantarLord || chart.dasha.currentHierarchy.pratyantardasha?.lord,
        },
      },
      provenance: {
        sourceEngine: 'Vimshottari Dasha Engine (120-Year Cycle)',
        ruleStandard: 'BPHS Ch. 46 (Dasha Paddhati)',
        calculatedAtIso: new Date().toISOString(),
        verified: true,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      tool: 'get_dasha_at',
      error: `Dasha target calculation error: ${err.message}`,
      provenance: {
        sourceEngine: 'Vimshottari Dasha Engine',
        ruleStandard: 'BPHS Ch. 46',
        calculatedAtIso: new Date().toISOString(),
        verified: false,
      },
    };
  }
}

/**
 * 5. get_transits (Gochara & Sade Sati)
 */
export function executeGetTransits(args: any): ToolExecutionResult {
  const validation = validateBirthProfile(args?.birthProfile);
  if (!validation.valid || !validation.data) {
    return {
      success: false,
      tool: 'get_transits',
      error: validation.error || 'Invalid birth profile.',
      provenance: {
        sourceEngine: 'Gochara Transit Engine',
        ruleStandard: 'Phaladeepika Ch. 26',
        calculatedAtIso: new Date().toISOString(),
        verified: false,
      },
    };
  }

  try {
    const evalDate = args?.targetDateIso ? new Date(args.targetDateIso) : new Date();
    const chart = computeCanonicalChart(validation.data, evalDate);

    return {
      success: true,
      tool: 'get_transits',
      data: {
        queryDateIso: chart.transits.queryDateIso,
        planets: chart.transits.planets,
        sadeSati: chart.transits.sadeSati,
      },
      provenance: {
        sourceEngine: 'Gochara Transit Engine (astronomy-engine + Analytical Lahiri Ayanamsha)',
        ruleStandard: 'Phaladeepika Ch. 26 (Gochara Phala)',
        calculatedAtIso: new Date().toISOString(),
        verified: true,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      tool: 'get_transits',
      error: `Transit calculation error: ${err.message}`,
      provenance: {
        sourceEngine: 'Gochara Transit Engine',
        ruleStandard: 'Phaladeepika Ch. 26',
        calculatedAtIso: new Date().toISOString(),
        verified: false,
      },
    };
  }
}

/**
 * 6. get_active_yogas (Yogas & Doshas)
 */
export function executeGetActiveYogas(args: any): ToolExecutionResult {
  const validation = validateBirthProfile(args?.birthProfile);
  if (!validation.valid || !validation.data) {
    return {
      success: false,
      tool: 'get_active_yogas',
      error: validation.error || 'Invalid birth profile.',
      provenance: {
        sourceEngine: 'Classical Yoga Evaluator',
        ruleStandard: 'BPHS & Saravali',
        calculatedAtIso: new Date().toISOString(),
        verified: false,
      },
    };
  }

  try {
    const chart = computeCanonicalChart(validation.data);
    const activeYogas = chart.yogas.filter((y) => y.present);

    return {
      success: true,
      tool: 'get_active_yogas',
      data: {
        activeYogasCount: activeYogas.length,
        yogas: activeYogas,
        doshas: chart.doshas,
      },
      provenance: {
        sourceEngine: 'Classical Yoga Evaluator Engine',
        ruleStandard: 'Brihat Parashara Hora Shastra (Yoga Adhyaya)',
        calculatedAtIso: new Date().toISOString(),
        verified: true,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      tool: 'get_active_yogas',
      error: `Yoga evaluation error: ${err.message}`,
      provenance: {
        sourceEngine: 'Classical Yoga Evaluator',
        ruleStandard: 'BPHS & Saravali',
        calculatedAtIso: new Date().toISOString(),
        verified: false,
      },
    };
  }
}

/**
 * 7. get_planetary_strength (Shadbala)
 */
export function executeGetPlanetaryStrength(args: any): ToolExecutionResult {
  const validation = validateBirthProfile(args?.birthProfile);
  if (!validation.valid || !validation.data) {
    return {
      success: false,
      tool: 'get_planetary_strength',
      error: validation.error || 'Invalid birth profile.',
      provenance: {
        sourceEngine: 'Shadbala Six-Fold Strength Engine',
        ruleStandard: 'BPHS Ch. 27-28',
        calculatedAtIso: new Date().toISOString(),
        verified: false,
      },
    };
  }

  try {
    const chart = computeCanonicalChart(validation.data);
    return {
      success: true,
      tool: 'get_planetary_strength',
      data: {
        shadbala: chart.strength.shadbala,
        bhavaBala: chart.strength.bhavaBala,
        avasthas: chart.strength.avasthas,
      },
      provenance: {
        sourceEngine: 'Shadbala Six-Fold Strength Engine',
        ruleStandard: 'BPHS Ch. 27-28 (Graha-Bhava Bala)',
        calculatedAtIso: new Date().toISOString(),
        verified: true,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      tool: 'get_planetary_strength',
      error: `Strength calculation error: ${err.message}`,
      provenance: {
        sourceEngine: 'Shadbala Six-Fold Strength Engine',
        ruleStandard: 'BPHS Ch. 27-28',
        calculatedAtIso: new Date().toISOString(),
        verified: false,
      },
    };
  }
}

/**
 * 8. get_ashtakavarga (BAV & SAV)
 */
export function executeGetAshtakavarga(args: any): ToolExecutionResult {
  const validation = validateBirthProfile(args?.birthProfile);
  if (!validation.valid || !validation.data) {
    return {
      success: false,
      tool: 'get_ashtakavarga',
      error: validation.error || 'Invalid birth profile.',
      provenance: {
        sourceEngine: 'Parashari 337-Bindu SAV Engine',
        ruleStandard: 'BPHS Ch. 66-72',
        calculatedAtIso: new Date().toISOString(),
        verified: false,
      },
    };
  }

  try {
    const chart = computeCanonicalChart(validation.data);
    return {
      success: true,
      tool: 'get_ashtakavarga',
      data: {
        sarvashtakavargaTotal: chart.ashtakavarga.sarvashtakavargaTotal,
        sav: chart.ashtakavarga.sav,
        strongSigns: chart.ashtakavarga.strongSigns,
        averageSigns: chart.ashtakavarga.averageSigns,
        weakSigns: chart.ashtakavarga.weakSigns,
        bav: chart.ashtakavarga.bav,
      },
      provenance: {
        sourceEngine: 'Parashari 337-Bindu SAV Engine',
        ruleStandard: 'BPHS Ch. 66-72 (Ashtakavarga Adhyaya)',
        calculatedAtIso: new Date().toISOString(),
        verified: true,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      tool: 'get_ashtakavarga',
      error: `Ashtakavarga calculation error: ${err.message}`,
      provenance: {
        sourceEngine: 'Parashari 337-Bindu SAV Engine',
        ruleStandard: 'BPHS Ch. 66-72',
        calculatedAtIso: new Date().toISOString(),
        verified: false,
      },
    };
  }
}

/**
 * 9. get_jaimini_details (Karakas, Karakamsa, Arudha Lagna)
 */
export function executeGetJaiminiDetails(args: any): ToolExecutionResult {
  const validation = validateBirthProfile(args?.birthProfile);
  if (!validation.valid || !validation.data) {
    return {
      success: false,
      tool: 'get_jaimini_details',
      error: validation.error || 'Invalid birth profile.',
      provenance: {
        sourceEngine: 'Jaimini Sutras Engine',
        ruleStandard: 'Jaimini Upadesha Sutras 1.1',
        calculatedAtIso: new Date().toISOString(),
        verified: false,
      },
    };
  }

  try {
    const chart = computeCanonicalChart(validation.data);
    return {
      success: true,
      tool: 'get_jaimini_details',
      data: chart.jaimini,
      provenance: {
        sourceEngine: 'Jaimini Sutras Engine',
        ruleStandard: 'Jaimini Upadesha Sutras (Chara Karaka Adhyaya)',
        calculatedAtIso: new Date().toISOString(),
        verified: true,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      tool: 'get_jaimini_details',
      error: `Jaimini calculation error: ${err.message}`,
      provenance: {
        sourceEngine: 'Jaimini Sutras Engine',
        ruleStandard: 'Jaimini Upadesha Sutras 1.1',
        calculatedAtIso: new Date().toISOString(),
        verified: false,
      },
    };
  }
}

/**
 * 10. get_panchanga (5 Limbs of Time)
 */
export function executeGetPanchanga(args: any): ToolExecutionResult {
  const validation = validateBirthProfile(args?.birthProfile);
  if (!validation.valid || !validation.data) {
    return {
      success: false,
      tool: 'get_panchanga',
      error: validation.error || 'Invalid birth profile.',
      provenance: {
        sourceEngine: 'Panchanga Calculation Engine',
        ruleStandard: 'Surya Siddhanta',
        calculatedAtIso: new Date().toISOString(),
        verified: false,
      },
    };
  }

  try {
    const chart = computeCanonicalChart(validation.data);
    return {
      success: true,
      tool: 'get_panchanga',
      data: chart.panchanga,
      provenance: {
        sourceEngine: 'Panchanga Calculation Engine',
        ruleStandard: 'Surya Siddhanta & Muhurta Martanda',
        calculatedAtIso: new Date().toISOString(),
        verified: true,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      tool: 'get_panchanga',
      error: `Panchanga calculation error: ${err.message}`,
      provenance: {
        sourceEngine: 'Panchanga Calculation Engine',
        ruleStandard: 'Surya Siddhanta',
        calculatedAtIso: new Date().toISOString(),
        verified: false,
      },
    };
  }
}
