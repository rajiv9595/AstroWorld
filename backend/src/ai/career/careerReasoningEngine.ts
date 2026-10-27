/**
 * ASTROWORLD — Multi-Layered Career Reasoning Engine
 *
 * Implements the 5-Layer Vedic Career Matrix:
 * Layer 1: D1 Rashi Chart (10th house, 10th lord, occupants, aspects, 2nd, 6th, 11th, 5th, 9th)
 * Layer 2: 10th Lord Dispositor Chain (D1 placement, dignity, dispositor, D10 placement)
 * Layer 3: D10 Dashamsha Chart (D10 Lagna, D10 10th house, D10 occupants, D1 10th lord in D10, AmK in D10)
 * Layer 4: D24 Siddhamsa Chart (D24 5th/9th/10th houses, academic aptitude, Mercury/Jupiter dignity)
 * Layer 5: Education vs Employment vs Specialization Separation
 * Plus Jaimini Career Matrix (AmK in D1/D9/D10, Karakamsha KL, 10th from KL, A10 Rajya Pada)
 * Explicit Contradiction Detection, Heuristic Scoring, and Epistemic Abstention.
 */

import { SIGN_LORDS, ZODIAC_SIGNS } from '../../../../shared/engine/constants.ts';
import type {
  AIInterpretationContext,
  PlanetName,
  PlanetPosition,
  VargaChart,
  ZodiacSign,
} from '../../../../shared/engine/types.ts';
import {
  CAREER_TAXONOMY,
  COMPETING_OCCUPATIONAL_DISTINCTIONS,
  CompetingDistinction,
  TaxonomyRole,
} from './careerTaxonomy.ts';
import {
  CAREER_RULE_REGISTRY,
  CareerRuleRecord,
} from './careerRuleRegistry.ts';
import {
  classifyCareerIntent,
  ClassifiedCareerIntent,
} from './careerIntentClassifier.ts';

export interface EvaluatedCareerCandidate {
  taxonomyId: string;
  roleLabel: string;
  disciplineLabel: string;
  sectorLabel: string;
  relativeCompatibilityScore: number; // 0 - 100 heuristic index, explicitly NOT a statistical probability
  rank: number;
  evidenceFor: string[];
  evidenceAgainst: string[];
  chartFacts: string[];
  matchedRuleIds: string[];
  citations: { author: string; work: string; reference: string }[];
  isTopCandidate: boolean;
  distinctionNotes?: string;
}

export interface EducationVsCareerMatrix {
  educationStreamD24: {
    primaryField: string;
    d24Signatures: string[];
    academicDegreesSuggested: string[];
  };
  vocationalEntryD1: {
    primaryWorkSector: string;
    d1Signatures: string[];
  };
  ultimateSpecializationD10: {
    specialization: string;
    d10Signatures: string[];
  };
  alignmentCommentary: string;
}

export interface CareerReasoningResult {
  query: string;
  classifiedIntent: ClassifiedCareerIntent;
  methodology: {
    school: 'parashari' | 'jaimini' | 'kp' | 'synthetic';
    ruleRegistryVersion: string;
    charaKarakaScheme: 'seven_karaka' | 'eight_karaka';
    ayanamsha: string;
  };
  deterministicFacts: {
    d1Ascendant: { sign: ZodiacSign; degree: string };
    d1TenthHouse: {
      sign: ZodiacSign;
      lord: PlanetName;
      lordPlacement: { sign: ZodiacSign; house: number; dignity: string };
      occupants: PlanetName[];
      aspectingPlanets: PlanetName[];
    };
    dispositorChain: {
      tenthLord: PlanetName;
      tenthLordSign: ZodiacSign;
      tenthLordDispositor: PlanetName;
      tenthLordD10Placement?: { sign: ZodiacSign; house: number };
    };
    d10Dashamsha: {
      ascendantSign?: ZodiacSign;
      tenthHouseSign?: ZodiacSign;
      tenthLord?: PlanetName;
      tenthHouseOccupants: PlanetName[];
      d1TenthLordInD10?: { sign: ZodiacSign; house: number };
      amkInD10?: { sign: ZodiacSign; house: number };
    };
    d24Siddhamsa: {
      ascendantSign?: ZodiacSign;
      fifthHouseSign?: ZodiacSign;
      fifthLord?: PlanetName;
      fifthHouseOccupants: PlanetName[];
      mercuryPlacement?: { sign: ZodiacSign; house: number };
      jupiterPlacement?: { sign: ZodiacSign; house: number };
    };
    jaiminiFacts: {
      amatyakaraka: PlanetName;
      amkPlacements: {
        d1Sign: ZodiacSign;
        d1House: number;
        d9Sign?: ZodiacSign;
        d9House?: number;
        d10Sign?: ZodiacSign;
        d10House?: number;
      };
      karakamshaNavamshaSign: ZodiacSign;
      tenthFromKarakamsha: { sign: ZodiacSign; occupants: PlanetName[] };
      rajyaPadaA10?: { sign: ZodiacSign; houseNumber: number };
      darakarakaNote: string;
    };
  };
  educationVsCareer: EducationVsCareerMatrix;
  rankedCandidates: EvaluatedCareerCandidate[];
  competingDistinctions: CompetingDistinction[];
  detectedContradictions: {
    category: 'D1_vs_D10' | 'Education_vs_Vocation' | 'Methodology_Discrepancy' | 'Overlapping_Specialties';
    description: string;
    impactOnAssessment: string;
  }[];
  abstentionAssessment: {
    shouldAbstainFromExactSpecialization: boolean;
    abstentionReason?: string;
    scopeOfValidity: 'broad_sector_only' | 'discipline_level' | 'specialization_qualified' | 'inconclusive';
  };
  epistemicDisclaimer: string;
}

// ---------------------------------------------------------------------------
// Engine Implementation
// ---------------------------------------------------------------------------

export class CareerReasoningEngine {
  /**
   * Evaluates complete multi-layered career & education analysis.
   */
  public static analyzeCareer(
    context: AIInterpretationContext,
    userQuery: string = 'What career or educational path does my chart indicate?'
  ): CareerReasoningResult {
    const classifiedIntent = classifyCareerIntent(userQuery);

    const ascendant = context.ascendant;
    const planets = context.planets;
    const houses = context.houses;
    const vargas = context.vargas || {};
    const d9Chart = vargas['D9'] as VargaChart | undefined;
    const d10Chart = vargas['D10'] as VargaChart | undefined;
    const d24Chart = vargas['D24'] as VargaChart | undefined;
    const jaimini = context.jaimini;

    // 1. Layer 1: D1 Tenth House & Tenth Lord
    const tenthHouseInfo = houses.find((h) => h.houseNumber === 10) || houses[9];
    const tenthSign = tenthHouseInfo?.sign || ZODIAC_SIGNS[(ascendant.signIndex + 9) % 12];
    const tenthLord = SIGN_LORDS[tenthSign];
    const tenthLordPlanet = planets.find((p) => p.name === tenthLord)!;
    const tenthOccupants = planets.filter((p) => p.houseNumber === 10).map((p) => p.name);

    // Parashari Graha Drishti on 10th house
    const aspectingPlanets: PlanetName[] = [];
    for (const p of planets) {
      if (p.name === 'Rahu' || p.name === 'Ketu') continue;
      const distFromPlanetTo10 = (10 - p.houseNumber + 12) % 12;
      // All planets cast 7th aspect (distance 6 signs)
      if (distFromPlanetTo10 === 6) aspectingPlanets.push(p.name);
      // Mars special aspects (4th and 8th; distance 3 and 7)
      if (p.name === 'Mars' && (distFromPlanetTo10 === 3 || distFromPlanetTo10 === 7)) aspectingPlanets.push(p.name);
      // Jupiter special aspects (5th and 9th; distance 4 and 8)
      if (p.name === 'Jupiter' && (distFromPlanetTo10 === 4 || distFromPlanetTo10 === 8)) aspectingPlanets.push(p.name);
      // Saturn special aspects (3rd and 10th; distance 2 and 9)
      if (p.name === 'Saturn' && (distFromPlanetTo10 === 2 || distFromPlanetTo10 === 9)) aspectingPlanets.push(p.name);
    }

    // 2. Layer 2: Tenth Lord Dispositor Chain
    const tenthLordSign = tenthLordPlanet.sign;
    const tenthLordDispositor = SIGN_LORDS[tenthLordSign];
    let tenthLordD10Placement: { sign: ZodiacSign; house: number } | undefined = undefined;
    if (d10Chart) {
      const pD10 = d10Chart.planets.find((p) => p.planet === tenthLord);
      if (pD10) tenthLordD10Placement = { sign: pD10.vargaSign, house: pD10.houseNumber };
    }

    // 3. Layer 3: D10 Dashamsha Facts
    const d10AscSign = d10Chart?.ascendantSign;
    let d10TenthSign: ZodiacSign | undefined = undefined;
    let d10TenthLord: PlanetName | undefined = undefined;
    let d10TenthOccupants: PlanetName[] = [];
    let d1TenthLordInD10: { sign: ZodiacSign; house: number } | undefined = undefined;
    let amkInD10: { sign: ZodiacSign; house: number } | undefined = undefined;

    if (d10Chart && d10AscSign) {
      const d10AscIdx = ZODIAC_SIGNS.indexOf(d10AscSign);
      const d10TenthIdx = (d10AscIdx + 9) % 12;
      d10TenthSign = ZODIAC_SIGNS[d10TenthIdx];
      d10TenthLord = SIGN_LORDS[d10TenthSign];
      d10TenthOccupants = d10Chart.planets
        .filter((p) => p.houseNumber === 10 || p.vargaSign === d10TenthSign)
        .map((p) => p.planet);

      const d1TLp = d10Chart.planets.find((p) => p.planet === tenthLord);
      if (d1TLp) d1TenthLordInD10 = { sign: d1TLp.vargaSign, house: d1TLp.houseNumber };

      if (jaimini.amatyakaraka) {
        const amkp = d10Chart.planets.find((p) => p.planet === jaimini.amatyakaraka);
        if (amkp) amkInD10 = { sign: amkp.vargaSign, house: amkp.houseNumber };
      }
    }

    // 4. Layer 4: D24 Siddhamsa Facts
    const d24AscSign = d24Chart?.ascendantSign;
    let d24FifthSign: ZodiacSign | undefined = undefined;
    let d24FifthLord: PlanetName | undefined = undefined;
    let d24FifthOccupants: PlanetName[] = [];
    let d24MercuryPlacement: { sign: ZodiacSign; house: number } | undefined = undefined;
    let d24JupiterPlacement: { sign: ZodiacSign; house: number } | undefined = undefined;

    if (d24Chart && d24AscSign) {
      const d24AscIdx = ZODIAC_SIGNS.indexOf(d24AscSign);
      const d24FifthIdx = (d24AscIdx + 4) % 12;
      d24FifthSign = ZODIAC_SIGNS[d24FifthIdx];
      d24FifthLord = SIGN_LORDS[d24FifthSign];
      d24FifthOccupants = d24Chart.planets
        .filter((p) => p.houseNumber === 5 || p.vargaSign === d24FifthSign)
        .map((p) => p.planet);

      const merc = d24Chart.planets.find((p) => p.planet === 'Mercury');
      if (merc) d24MercuryPlacement = { sign: merc.vargaSign, house: merc.houseNumber };
      const jup = d24Chart.planets.find((p) => p.planet === 'Jupiter');
      if (jup) d24JupiterPlacement = { sign: jup.vargaSign, house: jup.houseNumber };
    }

    // 5. Jaimini Career Indicators
    const amk = jaimini.amatyakaraka || (jaimini.charaKarakas[1]?.planet ?? 'Mercury');
    const amkPlanet = planets.find((p) => p.name === amk)!;
    const amkPlacements = {
      d1Sign: amkPlanet.sign,
      d1House: amkPlanet.houseNumber,
      d9Sign: jaimini.amatyakarakaDetails?.d9Sign,
      d9House: jaimini.amatyakarakaDetails?.d9House,
      d10Sign: jaimini.amatyakarakaDetails?.d10Sign,
      d10House: jaimini.amatyakarakaDetails?.d10House,
    };
    const karakamshaNavamshaSign = jaimini.karakamsaNavamshaSign;
    const tenthFromKarakamsha = jaimini.tenthFromKarakamsaNavamsha || {
      sign: ZODIAC_SIGNS[(ZODIAC_SIGNS.indexOf(karakamshaNavamshaSign) + 9) % 12],
      occupants: [],
    };
    const rajyaPadaA10 = jaimini.rajyaPadaA10;

    // 6. Evaluate Candidates Across Taxonomy
    const allRoles: { role: TaxonomyRole; disciplineLabel: string; sectorLabel: string }[] = [];
    for (const sector of CAREER_TAXONOMY) {
      for (const disc of sector.disciplines) {
        for (const spec of disc.specializations) {
          for (const role of spec.roles) {
            allRoles.push({
              role,
              disciplineLabel: disc.label,
              sectorLabel: sector.label,
            });
          }
        }
      }
    }

    const candidateAssessments: EvaluatedCareerCandidate[] = [];

    for (const item of allRoles) {
      const role = item.role;
      let score = 30; // Baseline neutrality
      const evidenceFor: string[] = [];
      const evidenceAgainst: string[] = [];
      const chartFacts: string[] = [];
      const matchedRuleIds: string[] = [];
      const citations: { author: string; work: string; reference: string }[] = [];

      const pSigs = role.planetaryArchetypes.primarySignificators;
      const sSigs = role.planetaryArchetypes.secondarySignificators;
      const favD1Houses = role.planetaryArchetypes.favorableHousesD1;
      const favD10Houses = role.planetaryArchetypes.favorableHousesD10;

      // 1. D1 10th Lord Resonance (Vocational Karma)
      if (pSigs.includes(tenthLord)) {
        score += 18;
        evidenceFor.push(`10th Lord in D1 is ${tenthLord}, a primary significator for ${role.label}.`);
        chartFacts.push(`D1 10th lord = ${tenthLord} in ${tenthLordPlanet.sign} (House ${tenthLordPlanet.houseNumber})`);
      } else if (sSigs.includes(tenthLord)) {
        score += 9;
        evidenceFor.push(`10th Lord in D1 is ${tenthLord}, a supportive secondary significator.`);
      }

      // 2. D1 10th House Occupants & Aspects
      for (const occ of tenthOccupants) {
        if (pSigs.includes(occ)) {
          score += 12;
          evidenceFor.push(`Primary significator ${occ} occupies D1 10th house.`);
          chartFacts.push(`${occ} in 10th house`);
        }
      }
      for (const asp of aspectingPlanets) {
        if (pSigs.includes(asp)) {
          score += 6;
          evidenceFor.push(`Primary significator ${asp} casts Graha Drishti on the 10th house.`);
        }
      }

      // 3. D1 5th House of Intellect & Specialization (Buddhi Bhava)
      const fifthHouseInfo = houses.find((h) => h.houseNumber === 5) || houses[4];
      const fifthSign = fifthHouseInfo?.sign || ZODIAC_SIGNS[(ascendant.signIndex + 4) % 12];
      const fifthLord = SIGN_LORDS[fifthSign];
      const fifthOccupants = planets.filter((p) => p.houseNumber === 5).map((p) => p.name);

      if (pSigs.includes(fifthLord)) {
        score += 14;
        evidenceFor.push(`5th Lord of intellect (Buddhi) in D1 is ${fifthLord}, establishing natural cognitive affinity for ${role.label}.`);
      } else if (sSigs.includes(fifthLord)) {
        score += 7;
        evidenceFor.push(`5th Lord ${fifthLord} supports the intellectual foundations of this domain.`);
      }
      for (const occ of fifthOccupants) {
        if (pSigs.includes(occ)) {
          score += 10;
          evidenceFor.push(`Intellect house occupant ${occ} directly energizes the cognitive competencies of ${role.label}.`);
        } else if (sSigs.includes(occ)) {
          score += 5;
        }
      }

      // 4. Jaimini Amatyakaraka (AmK) — The Vocational Soul
      if (pSigs.includes(amk)) {
        score += 16;
        evidenceFor.push(`Jaimini Amatyakaraka (AmK) is ${amk}, directly signifying ${role.label}.`);
        chartFacts.push(`AmK = ${amk} in D1 House ${amkPlanet.houseNumber}, D10 House ${amkPlacements.d10House ?? 'N/A'}`);
        matchedRuleIds.push('RULE-JAIMINI-AMK-D10-004');
        citations.push({
          author: 'Maharishi Jaimini',
          work: 'Jaimini Upadesha Sutras',
          reference: '1.2.1-1.2.14',
        });
      } else if (sSigs.includes(amk)) {
        score += 8;
        evidenceFor.push(`Amatyakaraka ${amk} acts as an assisting karmic driver.`);
      }

      // 5. 10th from Karakamsha Navamsha (KL)
      for (const occ of tenthFromKarakamsha.occupants) {
        if (pSigs.includes(occ)) {
          score += 10;
          evidenceFor.push(`Planet ${occ} occupies the 10th from Karakamsha in D9 Navamsha, establishing vocational dharma.`);
          matchedRuleIds.push('RULE-JAIMINI-KL-10TH-005');
        }
      }

      // 6. D10 Dashamsha Match (Professional Action & Authority)
      if (d10Chart && d10TenthLord && pSigs.includes(d10TenthLord)) {
        score += 14;
        evidenceFor.push(`D10 10th Lord is ${d10TenthLord}, manifesting ${role.label} in executive authority.`);
        matchedRuleIds.push('RULE-RAMAN-D10-DASHAMSHA-007');
      } else if (d10Chart && d10TenthLord && sSigs.includes(d10TenthLord)) {
        score += 7;
      }
      for (const occ of d10TenthOccupants) {
        if (pSigs.includes(occ)) {
          score += 10;
          evidenceFor.push(`D10 10th House occupant is ${occ}, directly empowering ${role.label}.`);
        }
      }

      // 7. D24 Siddhamsa Academic Match (University Vidya & Research Aptitude)
      if (d24Chart && d24FifthLord && (pSigs.includes(d24FifthLord) || sSigs.includes(d24FifthLord))) {
        score += 12;
        evidenceFor.push(`D24 5th Lord of higher intellect is ${d24FifthLord}, confirming academic degree alignment.`);
        matchedRuleIds.push('RULE-KNRAO-D24-EDUCATION-008');
      }
      for (const occ of d24FifthOccupants) {
        if (pSigs.includes(occ)) {
          score += 10;
          evidenceFor.push(`D24 5th House occupant ${occ} strongly anchors specialized university study.`);
        }
      }

      // 8. Active Vimshottari Dasha Alignment (Temporal Momentum)
      const dashaAny = context.dasha as any;
      const activeMahadasha = (dashaAny?.currentHierarchy?.mahadasha?.planet || dashaAny?.activeMahadasha?.planet || dashaAny?.activeLords?.mahadasha) as PlanetName | undefined;
      const activeAntardasha = (dashaAny?.currentHierarchy?.antardasha?.planet || dashaAny?.activeAntardasha?.planet || dashaAny?.activeLords?.antardasha) as PlanetName | undefined;
      if (activeMahadasha && pSigs.includes(activeMahadasha)) {
        score += 8;
        evidenceFor.push(`Current Mahadasha Lord ${activeMahadasha} actively channels life energy toward ${role.label}.`);
      }
      if (activeAntardasha && pSigs.includes(activeAntardasha)) {
        score += 10;
        evidenceFor.push(`Current Antardasha Lord ${activeAntardasha} acts as immediate real-world time-director for this domain.`);
      }

      // 9. Principled Sector Sanity & Contradiction Filters (Universal Shastric Checks)
      // Legal roles require legal/judiciary/dispute houses (6th or 9th house)
      if (role.sectorId === 'law_governance_public' && role.disciplineId === 'law_legal') {
        const jup = planets.find((p) => p.name === 'Jupiter');
        const sat = planets.find((p) => p.name === 'Saturn');
        const hasLegalHouses = [6, 9].includes(jup?.houseNumber || 0) || [6, 9].includes(sat?.houseNumber || 0) || [6, 9].includes(tenthLordPlanet.houseNumber);
        if (!hasLegalHouses) {
          score -= 15;
          evidenceAgainst.push('Absence of primary legal dispute or judiciary house emphasis (6th/9th house).');
        }
      }

      // Surgical roles require sharp cutting instruments (Mars/Ketu in 6th/8th/10th)
      if (role.id === 'role_general_surgeon') {
        const mars = planets.find((p) => p.name === 'Mars');
        const ketu = planets.find((p) => p.name === 'Ketu');
        const hasSurgicalHouses = [6, 8, 10].includes(mars?.houseNumber || 0) && ([6, 8, 10].includes(ketu?.houseNumber || 0) || d10TenthOccupants.includes('Mars'));
        if (hasSurgicalHouses) {
          score += 12;
          evidenceFor.push('Mars and Ketu operative in 6th/8th/10th houses govern surgical precision.');
        } else {
          score -= 15;
          evidenceAgainst.push('Absence of classical Mars-Ketu surgical incision signature in 6th/8th/10th houses.');
        }
      }

      // Civil construction requires permanent earth/structure houses (4th/10th Saturn/Mars)
      if (role.id === 'role_civil_engineer') {
        const saturn = planets.find((p) => p.name === 'Saturn');
        if ([4, 10].includes(saturn?.houseNumber || 0)) {
          score += 10;
          evidenceFor.push('Saturn active in 4th/10th house governs masonry, foundations, and land structures.');
        } else {
          score -= 8;
        }
      }

      // Normalize score between 10 and 95 (Astrology never guarantees 100%)
      const normalizedScore = Math.min(92, Math.max(15, Math.round(score)));

      candidateAssessments.push({
        taxonomyId: role.id,
        roleLabel: role.label,
        disciplineLabel: item.disciplineLabel,
        sectorLabel: item.sectorLabel,
        relativeCompatibilityScore: normalizedScore,
        rank: 0,
        evidenceFor,
        evidenceAgainst,
        chartFacts,
        matchedRuleIds,
        citations,
        isTopCandidate: false,
        distinctionNotes: role.distinctionNotes,
      });
    }

    // Sort descending by relative compatibility score
    candidateAssessments.sort((a, b) => b.relativeCompatibilityScore - a.relativeCompatibilityScore);
    candidateAssessments.forEach((cand, idx) => {
      cand.rank = idx + 1;
      if (idx === 0) cand.isTopCandidate = true;
    });

    const topCandidate = candidateAssessments[0];
    const secondCandidate = candidateAssessments[1];

    // 7. Layer 5: Dynamic D24 Academic Faculty & Higher Education Stream Mapping
    // Synthesizes D24 5th House (Intellect), D24 9th House (Degree route), and D1 5th House (Buddhi)
    const d1FifthInfo = houses.find((h) => h.houseNumber === 5) || houses[4];
    const d1FifthLord = SIGN_LORDS[d1FifthInfo?.sign || ZODIAC_SIGNS[(ascendant.signIndex + 4) % 12]];
    const d1FifthOccupants = planets.filter((p) => p.houseNumber === 5).map((p) => p.name);

    const academicGrahas = new Set<PlanetName>([
      ...(d24FifthLord ? [d24FifthLord] : []),
      ...d24FifthOccupants,
      d1FifthLord,
      ...d1FifthOccupants,
    ]);

    let educationPrimary = 'Engineering & Computational Systems';
    const d24Signatures: string[] = [];
    let degs: string[] = ['B.Tech / B.E.'];

    if (d24Chart && d24FifthLord) {
      d24Signatures.push(`D24 5th lord is ${d24FifthLord} in ${d24FifthSign || '5th house'}`);
    }
    if (d1FifthLord) {
      d24Signatures.push(`D1 5th lord is ${d1FifthLord} with occupants [${d1FifthOccupants.join(', ') || 'None'}]`);
    }

    const hasMercury = academicGrahas.has('Mercury');
    const hasMars = academicGrahas.has('Mars');
    const hasRahu = academicGrahas.has('Rahu') || planets.find((p) => p.name === 'Rahu')?.houseNumber === 5 || planets.find((p) => p.name === 'Rahu')?.houseNumber === 11;
    const hasKetu = academicGrahas.has('Ketu') || planets.find((p) => p.name === 'Ketu')?.houseNumber === 5;
    const hasJupiter = academicGrahas.has('Jupiter');
    const hasSun = academicGrahas.has('Sun');
    const hasSaturn = academicGrahas.has('Saturn');
    const hasVenus = academicGrahas.has('Venus');
    const hasMoon = academicGrahas.has('Moon');

    // Dynamic Confluence Evaluation across AstroTech Educational Pathways (EDU-001 - EDU-034):
    if (hasMercury && (hasRahu || hasKetu || (hasJupiter && (d24FifthSign === 'Gemini' || d24FifthSign === 'Virgo' || d1FifthInfo?.sign === 'Virgo')))) {
      educationPrimary = 'Artificial Intelligence, Data Science & Advanced Computing';
      degs = [
        'B.Tech / B.E. in Artificial Intelligence & Data Science (AI&DS)',
        'Diploma in Artificial Intelligence & Machine Learning (AIML)',
        'B.Tech in Computer Science & Engineering (AI/ML)',
        'B.S. / M.S. in Applied Data Intelligence',
        'B.Tech in Computer Science Engineering (CSE)',
      ];
    } else if (hasMercury && hasMars && !hasSun) {
      educationPrimary = 'Computer Science, Software Engineering & Systems Architecture';
      degs = [
        'B.Tech in Computer Science & Engineering (CSE)',
        'B.Tech in Information Technology (IT)',
        'BCA / MCA in Software Systems',
        'B.S. in Computer Science',
      ];
    } else if (hasMars && hasMercury && (hasSun || hasSaturn)) {
      educationPrimary = 'Electronics, Electrical & Communication Engineering (ECE / EEE)';
      degs = [
        'B.Tech in Electronics & Communication Engineering (ECE)',
        'B.Tech in Electrical & Electronics Engineering (EEE)',
        'VLSI & Embedded Systems Engineering',
      ];
    } else if (hasMars && hasSaturn && !hasMercury) {
      educationPrimary = 'Mechanical Engineering, Mechatronics & Industrial Systems';
      degs = [
        'B.Tech in Mechanical Engineering',
        'B.Tech in Mechatronics & Industrial Robotics',
        'Manufacturing & Automation Engineering',
      ];
    } else if (hasSaturn && hasMars && [4, 10].includes(planets.find((p) => p.name === 'Saturn')?.houseNumber || 0)) {
      educationPrimary = 'Civil Engineering, Structural Design & Architecture';
      degs = [
        'B.Tech in Civil Engineering',
        'B.Arch (Architecture & Urban Planning)',
        'Construction Technology & Structural Engineering',
      ];
    } else if (hasSun && hasMars && (hasJupiter || [6, 8].includes(planets.find((p) => p.name === 'Sun')?.houseNumber || 0))) {
      educationPrimary = 'Medicine, Surgery & Clinical Health Sciences';
      degs = [
        'MBBS (Bachelor of Medicine & Bachelor of Surgery)',
        'M.D. / M.S. Clinical Specialties',
        'BDS (Dental Surgery)',
      ];
    } else if (hasVenus && (hasMoon || hasRahu) && (hasJupiter || hasMercury)) {
      educationPrimary = 'Pharmaceutical Sciences, Drug Discovery & Biotechnology';
      degs = [
        'B.Pharm / M.Pharm (Pharmaceutical Sciences)',
        'B.Tech / B.Sc in Biotechnology & Bioinformatics',
      ];
    } else if (hasJupiter && hasSaturn && hasMercury) {
      educationPrimary = 'Law, Legal Studies & Jurisprudence';
      degs = [
        'BA LLB / BBA LLB (Integrated Law)',
        'LLM (Corporate & Constitutional Jurisprudence)',
      ];
    } else if (hasMercury && hasJupiter && hasVenus) {
      educationPrimary = 'Commerce, Chartered Accountancy & Financial Risk';
      degs = [
        'Chartered Accountancy (CA / ICAI)',
        'B.Com / M.Com (Audit, Taxation & Cost Accounting)',
        'CFA / B.S. in Quantitative Finance & Risk',
      ];
    } else if (hasSun && hasMercury && hasJupiter) {
      educationPrimary = 'Business Administration, Strategic Management & Public Policy';
      degs = [
        'BBA / MBA (Strategy, Operations & General Management)',
        'Public Administration & Civil Services Preparation',
      ];
    } else if (hasVenus && hasMercury) {
      educationPrimary = 'Design, Human-Computer Interaction (UI/UX) & Creative Media';
      degs = [
        'B.Des (Interaction Design, UI/UX, Product Design)',
        'BFA / Animation, VFX & Visual Communication',
      ];
    }

    const vocationalEntry = `${topCandidate.sectorLabel} (${topCandidate.disciplineLabel})`;
    const ultimateSpec = topCandidate.roleLabel;

    const alignmentCommentary =
      `Vedic astrology clearly separates education (D24/5th house), initial employment foundation (D1/10th house & 6th house of service), and peak specialized vocation (D10 Dashamsha & Amatyakaraka). A native may study ${educationPrimary}, establish initial career in ${vocationalEntry}, and progressively specialize into ${ultimateSpec}.`;

    const educationVsCareer: EducationVsCareerMatrix = {
      educationStreamD24: {
        primaryField: educationPrimary,
        d24Signatures,
        academicDegreesSuggested: degs,
      },
      vocationalEntryD1: {
        primaryWorkSector: vocationalEntry,
        d1Signatures: [`10th Lord = ${tenthLord} in ${tenthLordSign}`, ...tenthOccupants.map((o) => `Occupant = ${o}`)],
      },
      ultimateSpecializationD10: {
        specialization: ultimateSpec,
        d10Signatures: [
          `D10 10th Lord = ${d10TenthLord ?? 'N/A'}`,
          `AmK in D10 = House ${amkInD10?.house ?? 'N/A'}`,
        ],
      },
      alignmentCommentary,
    };

    // 8. Contradiction Detection
    const detectedContradictions: CareerReasoningResult['detectedContradictions'] = [];

    // Check D1 vs D10 divergence
    if (d10TenthLord && tenthLord !== d10TenthLord) {
      detectedContradictions.push({
        category: 'D1_vs_D10',
        description: `D1 10th lord is ${tenthLord}, while D10 10th lord is ${d10TenthLord}.`,
        impactOnAssessment: `Indicates that the native's broad external vocation (${tenthLord}) is refined or transformed through specific departmental duties governed by ${d10TenthLord} in the Dashamsha.`,
      });
    }

    // Check overlapping specializations
    if (topCandidate && secondCandidate && Math.abs(topCandidate.relativeCompatibilityScore - secondCandidate.relativeCompatibilityScore) <= 12) {
      detectedContradictions.push({
        category: 'Overlapping_Specialties',
        description: `Top candidates "${topCandidate.roleLabel}" (${topCandidate.relativeCompatibilityScore}%) and "${secondCandidate.roleLabel}" (${secondCandidate.relativeCompatibilityScore}%) share significant planetary signatures.`,
        impactOnAssessment: 'Classical astrological factors cannot deterministically separate these two overlapping modern specializations without over-promising precision.',
      });
    }

    // 9. Abstention & Ambiguity Logic
    let shouldAbstain = false;
    let abstentionReason: string | undefined = undefined;
    let scopeOfValidity: CareerReasoningResult['abstentionAssessment']['scopeOfValidity'] = 'specialization_qualified';

    if (topCandidate && secondCandidate && Math.abs(topCandidate.relativeCompatibilityScore - secondCandidate.relativeCompatibilityScore) <= 10) {
      // If candidates are Software Engineer vs Data Scientist or AI Engineer
      const techOverlap =
        (topCandidate.taxonomyId.includes('software') || topCandidate.taxonomyId.includes('data') || topCandidate.taxonomyId.includes('ai')) &&
        (secondCandidate.taxonomyId.includes('software') || secondCandidate.taxonomyId.includes('data') || secondCandidate.taxonomyId.includes('ai'));

      if (techOverlap) {
        shouldAbstain = true;
        abstentionReason =
          `The chart displays decisive planetary confluence for computational, technical, and analytical disciplines (governed by Mercury, Mars, and Rahu), but classical Jyotish principles do not provide a mathematically distinct boundary between "${topCandidate.roleLabel}" and "${secondCandidate.roleLabel}". Both roles share algorithmic logic and digital systems architecture. The engine abstains from claiming an exclusive fatalistic prediction between these two titles.`;
        scopeOfValidity = 'discipline_level';
      }
    }

    return {
      query: userQuery,
      classifiedIntent,
      methodology: {
        school: 'parashari',
        ruleRegistryVersion: '2.4.0',
        charaKarakaScheme: (jaimini.karakaScheme as any) || 'seven_karaka',
        ayanamsha: 'Chitra Paksha / Lahiri',
      },
      deterministicFacts: {
        d1Ascendant: {
          sign: ascendant.sign,
          degree: ascendant.formattedDegree,
        },
        d1TenthHouse: {
          sign: tenthSign,
          lord: tenthLord,
          lordPlacement: {
            sign: tenthLordPlanet.sign,
            house: tenthLordPlanet.houseNumber,
            dignity: tenthLordPlanet.dignity,
          },
          occupants: tenthOccupants,
          aspectingPlanets,
        },
        dispositorChain: {
          tenthLord,
          tenthLordSign,
          tenthLordDispositor,
          tenthLordD10Placement,
        },
        d10Dashamsha: {
          ascendantSign: d10AscSign,
          tenthHouseSign: d10TenthSign,
          tenthLord: d10TenthLord,
          tenthHouseOccupants: d10TenthOccupants,
          d1TenthLordInD10,
          amkInD10,
        },
        d24Siddhamsa: {
          ascendantSign: d24AscSign,
          fifthHouseSign: d24FifthSign,
          fifthLord: d24FifthLord,
          fifthHouseOccupants: d24FifthOccupants,
          mercuryPlacement: d24MercuryPlacement,
          jupiterPlacement: d24JupiterPlacement,
        },
        jaiminiFacts: {
          amatyakaraka: amk,
          amkPlacements,
          karakamshaNavamshaSign,
          tenthFromKarakamsha,
          rajyaPadaA10: rajyaPadaA10
            ? { sign: rajyaPadaA10.sign, houseNumber: rajyaPadaA10.houseNumber }
            : undefined,
          darakarakaNote:
            'Classical Jaimini convention explicitly designates Darakaraka (DK) as the significator of spouse, intimacy, and marital alliances. Any modern assertion claiming Darakaraka as a primary indicator of sustained career prosperity is an uncorroborated hypothesis and is not used as a vocational determinant.',
        },
      },
      educationVsCareer,
      rankedCandidates: candidateAssessments.slice(0, 5),
      competingDistinctions: COMPETING_OCCUPATIONAL_DISTINCTIONS,
      detectedContradictions,
      abstentionAssessment: {
        shouldAbstainFromExactSpecialization: shouldAbstain,
        abstentionReason,
        scopeOfValidity,
      },
      epistemicDisclaimer:
        'Vedic astrology provides structured insights into intellectual disposition, karmic inclinations, and broad professional domains. Exact occupational titles are modern socio-economic conventions; astrological interpretations should be treated as guidance regarding aptitude and timing rather than guaranteed fatalistic certainties.',
    };
  }
}
