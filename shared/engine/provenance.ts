/**
 * ASTROWORLD — Provenance & Evidence Registry
 * Authoritative mapping from calculated facts to classical textual sources (BPHS, Phaladeepika, Jaimini).
 */

import {
  AscendantInfo,
  AshtakavargaFacts,
  DoshaFact,
  EvidenceRecord,
  HouseInfo,
  JaiminiFacts,
  PanchangaFacts,
  PlanetPosition,
  StrengthFacts,
  TimingSignal,
  TransitFacts,
  VargaChart,
  VargaCode,
  VimshottariDashaFacts,
  YogaFact,
} from './types.ts';

export function buildEvidencePool(
  ascendant: AscendantInfo,
  planets: PlanetPosition[],
  houses: HouseInfo[],
  vargas: Record<VargaCode, VargaChart>,
  panchanga: PanchangaFacts,
  dasha: VimshottariDashaFacts,
  strength: StrengthFacts,
  yogas: YogaFact[],
  doshas: DoshaFact[],
  jaimini: JaiminiFacts,
  ashtakavarga: AshtakavargaFacts,
  transits: TransitFacts,
  timingSignals: TimingSignal[]
): EvidenceRecord[] {
  const pool: EvidenceRecord[] = [];

  // 1. Ascendant
  pool.push({
    evidenceId: 'EVID_LAGNA_POSITION',
    category: 'ASTRONOMY',
    sourceSystem: 'AstroWorld Canonical Ephemeris',
    ruleReference: 'Surya Siddhanta & BPHS Ch. 3 (Graha Guna Swarupa)',
    factPath: 'chart.ascendant.siderealLongitude',
    factValue: `${ascendant.sign} ${ascendant.formattedDegree} (${ascendant.nakshatra} Pada ${ascendant.pada})`,
    description: `Ascendant (Lagna) is precisely located at ${ascendant.formattedDegree} in ${ascendant.sign}, governed by ${ascendant.nakshatraLord}.`,
  });

  // 2. Planets & Dignities
  for (const p of planets) {
    pool.push({
      evidenceId: `EVID_PLANET_${p.name.toUpperCase()}_D1`,
      category: 'DIGNITY',
      sourceSystem: 'BPHS Classical Dignity Engine',
      ruleReference: 'BPHS Ch. 3 (Exaltation, Debilitation & Moolatrikona Rules)',
      factPath: `chart.d1.planets.${p.name}`,
      factValue: `${p.sign} ${p.formattedDegree}, House ${p.houseNumber}, Dignity: ${p.dignity}`,
      description: `${p.name} occupies ${p.sign} in house ${p.houseNumber} with canonical dignity ${p.dignity} (${p.nakshatra} Pada ${p.pada}).`,
    });
  }

  // 3. Key Vargas (D9, D10)
  const d9 = vargas['D9'];
  if (d9) {
    for (const p of d9.planets) {
      pool.push({
        evidenceId: `EVID_VARGA_D9_${p.planet.toUpperCase()}`,
        category: 'VARGA',
        sourceSystem: 'Parashari Shodashavarga Engine',
        ruleReference: 'BPHS Ch. 6 (Shodashavarga Varga Ganita)',
        factPath: `vargas.D9.planets.${p.planet}`,
        factValue: `${p.vargaSign}, House ${p.houseNumber}, Dignity: ${p.dignity}`,
        description: `In D9 Navamsha, ${p.planet} occupies ${p.vargaSign} with independent dignity ${p.dignity}.`,
      });
    }
  }

  // 4. Dasha periods
  const curMd = dasha.currentHierarchy.mahadasha;
  const curAd = dasha.currentHierarchy.antardasha;
  pool.push({
    evidenceId: `EVID_DASHA_ACTIVE_${curMd.lord}_${curAd.subLord}`,
    category: 'DASHA',
    sourceSystem: 'Vimshottari Dasha Engine (120-Year Parashari Cycle)',
    ruleReference: 'BPHS Ch. 46 (Dasha Paddhati)',
    factPath: 'dasha.currentHierarchy',
    factValue: `${curMd.lord} MD / ${curAd.subLord} AD (Balance at birth: ${dasha.balanceAtBirth.rulingLord} ${dasha.balanceAtBirth.balanceYears}y)`,
    description: `Active Mahadasha of ${curMd.lord} with Antardasha of ${curAd.subLord} (${curAd.startDateIso.slice(0, 10)} to ${curAd.endDateIso.slice(0, 10)}).`,
  });

  // 5. Yogas
  for (const y of yogas.filter((x) => x.present)) {
    pool.push({
      evidenceId: `EVID_YOGA_${y.id.toUpperCase()}`,
      category: 'YOGA',
      sourceSystem: 'Classical Yoga Evaluator',
      ruleReference: y.bphsReference,
      factPath: `yogas.${y.id}`,
      factValue: `PRESENT - Forming planets: ${y.formingPlanets.join(', ')}`,
      description: `${y.name} is canonically confirmed: ${y.classicalRule}`,
    });
  }

  // 6. Ashtakavarga
  pool.push({
    evidenceId: 'EVID_ASHTAKAVARGA_SAV',
    category: 'ASHTAKAVARGA',
    sourceSystem: 'Parashari 337-Bindu SAV Engine',
    ruleReference: 'BPHS Ch. 66-72 (Ashtakavarga Adhyaya)',
    factPath: 'ashtakavarga.sarvashtakavargaTotal',
    factValue: `337 bindus total across 12 signs. Strong signs: ${ashtakavarga.strongSigns.join(', ')}`,
    description: `Samudayashtakavarga distributes 337 bindus across 12 houses; houses with >28 bindus indicate structural strength.`,
  });

  // 7. Transits
  for (const tp of transits.planets.filter((p) => ['Jupiter', 'Saturn', 'Rahu'].includes(p.planet))) {
    pool.push({
      evidenceId: `EVID_TRANSIT_${tp.planet.toUpperCase()}`,
      category: 'TRANSIT',
      sourceSystem: 'Gochara Transit Engine',
      ruleReference: 'Phaladeepika Ch. 26 (Gochara Phala)',
      factPath: `transits.planets.${tp.planet}`,
      factValue: `${tp.sign} (${tp.formattedDegree}), House ${tp.natalLagnaHouse} from Lagna, House ${tp.chandraLagnaHouse} from Moon`,
      description: `Transit ${tp.planet} is transiting ${tp.sign} in house ${tp.natalLagnaHouse} from Lagna with ${tp.ashtakavargaBindus} SAV bindus.`,
    });
  }

  pool.push({
    evidenceId: 'EVID_LIMITATION_NO_FABRICATED_DATES',
    category: 'TRANSIT',
    sourceSystem: 'AstroWorld Safety/Provenance Layer',
    ruleReference: 'No unsupported deterministic event dates',
    factPath: 'timingSignals.unknown',
    factValue: 'UNKNOWN',
    description: 'Long-horizon speculative event dates remain unknown unless independently supported by sufficient Dasha, transit, and other evidence-backed confluence.',
  });

  if (transits.solarIngress) {
    pool.push({
      evidenceId: `EVID_TRANSIT_SUN_INGRESS_${transits.solarIngress.targetSign.toUpperCase()}`,
      category: 'TRANSIT',
      sourceSystem: 'Gochara Transit Engine',
      ruleReference: 'Sidereal solar longitude boundary search',
      factPath: 'transits.solarIngress',
      factValue: `Next sidereal solar ingress into ${transits.solarIngress.targetSign} at ${transits.solarIngress.timestampUtc}`,
      description: `The next sidereal solar ingress into ${transits.solarIngress.targetSign} is computed by a forward bracket and bisection on the 30° sidereal boundary.`,
    });
  }

  // 8. Jaimini
  pool.push({
    evidenceId: 'EVID_JAIMINI_ATMAKARAKA',
    category: 'ASTRONOMY',
    sourceSystem: 'Jaimini Upadesha Sutras',
    ruleReference: 'Jaimini Sutras 1.1.10-15',
    factPath: 'jaimini.atmakaraka',
    factValue: `AK: ${jaimini.atmakaraka}, Karakamsa: ${jaimini.karakamsaNavamshaSign}`,
    description: `Atmakaraka is ${jaimini.atmakaraka}, and the soul's Karakamsa sign in Navamsha is ${jaimini.karakamsaNavamshaSign}.`,
  });

  return pool;
}
