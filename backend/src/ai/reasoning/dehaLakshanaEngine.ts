/**
 * ASTROWORLD — Deha & Anga Lakshana Diagnostic Engine
 * Generates unprompted, hyper-specific physical traits, bodily scars/marks,
 * ancestral lineage patterns, deep psychological signatures, and unasked question anticipations.
 * 
 * Based on classical treatises:
 * - Brihat Parashara Hora Shastra (Deha Lakshana, Anga Sphurana, and Graha Drishti)
 * - Saravali & Phaladeepika (Physical marks and psychological temperaments)
 * - Traditional Daivajna consultation protocols (the classical "Cold Read" / Shock Diagnosis)
 */

import { PlanetName, ZodiacSign } from '../../../../shared/engine/types.ts';
import { SIGN_LORDS } from '../../../../shared/engine/constants.ts';

export interface DehaInputPlanet {
  name: PlanetName;
  sign: ZodiacSign;
  houseNumber: number;
  degreeInSign?: number;
  retrograde?: boolean;
  combust?: boolean;
}

export interface DehaChartInput {
  lagnaSign: ZodiacSign;
  lagnaDegree?: number;
  planets: DehaInputPlanet[];
  moonNakshatra?: string;
  activeDashaLord?: PlanetName;
  activeAntardashaLord?: PlanetName;
  isPeakSadeSati?: boolean;
  careerDoubleTransitActive?: boolean;
  marriageDoubleTransitActive?: boolean;
}

export interface PhysicalTraitFact {
  category: 'SCAR_MARK' | 'BODY_TYPE' | 'GAZE_FACIAL' | 'VULNERABILITY';
  title: string;
  grahaSignature: string;
  manifestation: string;
  confidenceScore: number; // 0-100
}

export interface AncestralLineageFact {
  lineageAxis: 'MATERNAL_4TH_HOUSE' | 'PATERNAL_9TH_HOUSE' | 'ANCESTRAL_ESTATE_2ND_HOUSE';
  title: string;
  grahaSignature: string;
  historicalPattern: string;
  confidenceScore: number;
}

export interface PsychologicalQuirkFact {
  traitKey: string;
  title: string;
  grahaSignature: string;
  covertTruth: string;
  behavioralManifestation: string;
}

export interface DehaLakshanaDiagnosticResult {
  openingDiagnosticAnchor: string;
  physicalSignatures: PhysicalTraitFact[];
  ancestralSecrets: AncestralLineageFact[];
  psychologicalQuirks: PsychologicalQuirkFact[];
  unaskedQuestionAnticipation: string;
  formattedDaivajnaDossier: string;
}

// Classical Parashari aspects
function planetAspectsHouse(planet: PlanetName, planetHouse: number, targetHouse: number): boolean {
  const dist = ((targetHouse - planetHouse + 12) % 12) + 1; // 1-based distance
  if (dist === 7) return true; // All planets aspect 7th house
  if (planet === 'Mars' && (dist === 4 || dist === 8)) return true;
  if (planet === 'Saturn' && (dist === 3 || dist === 10)) return true;
  if (planet === 'Jupiter' && (dist === 5 || dist === 9)) return true;
  if ((planet === 'Rahu' || planet === 'Ketu') && (dist === 5 || dist === 9)) return true;
  return false;
}

export function evaluateDehaLakshana(chart: DehaChartInput): DehaLakshanaDiagnosticResult {
  const physicalSignatures: PhysicalTraitFact[] = [];
  const ancestralSecrets: AncestralLineageFact[] = [];
  const psychologicalQuirks: PsychologicalQuirkFact[] = [];

  const lagnaLord = SIGN_LORDS[chart.lagnaSign];
  const lagnaLordPlanet = chart.planets.find((p) => p.name === lagnaLord);
  const mars = chart.planets.find((p) => p.name === 'Mars');
  const saturn = chart.planets.find((p) => p.name === 'Saturn');
  const rahu = chart.planets.find((p) => p.name === 'Rahu');
  const ketu = chart.planets.find((p) => p.name === 'Ketu');
  const sun = chart.planets.find((p) => p.name === 'Sun');
  const moon = chart.planets.find((p) => p.name === 'Moon');
  const mercury = chart.planets.find((p) => p.name === 'Mercury');
  const venus = chart.planets.find((p) => p.name === 'Venus');
  const jupiter = chart.planets.find((p) => p.name === 'Jupiter');

  // --- 1. PHYSICAL MARKS & ANGA LAKSHANA ---

  // Mars signature on Lagna or Lagna Lord (Forehead / Upper Limbs / Heat scar)
  const marsIn1st = mars?.houseNumber === 1;
  const marsAspects1st = mars ? planetAspectsHouse('Mars', mars.houseNumber, 1) : false;
  const marsConjunctLagnaLord = mars && lagnaLordPlanet && mars.houseNumber === lagnaLordPlanet.houseNumber;
  if (marsIn1st || marsAspects1st || marsConjunctLagnaLord) {
    physicalSignatures.push({
      category: 'SCAR_MARK',
      title: 'Cranial / Facial Scar or Heat Sensitivity Signature',
      grahaSignature: marsIn1st ? 'Mars in 1st House' : marsAspects1st ? 'Mars Aspecting Lagna' : 'Mars Conjunct Lagna Lord',
      manifestation: 'Carries a distinct mark, faint childhood scar, or past heat/cut injury near the forehead, hairline, eyebrow, or right upper shoulder. Skin is prone to sudden flushed heat or rash under acute stress.',
      confidenceScore: marsIn1st ? 95 : 88,
    });
  }

  // Ketu signature on Lagna or Lagna Lord (Birthmark / Narrow Escape)
  const ketuIn1st = ketu?.houseNumber === 1;
  const ketuWithLagnaLord = ketu && lagnaLordPlanet && ketu.houseNumber === lagnaLordPlanet.houseNumber;
  if (ketuIn1st || ketuWithLagnaLord) {
    physicalSignatures.push({
      category: 'SCAR_MARK',
      title: 'Hidden Birthmark or Childhood Puncture Mark',
      grahaSignature: ketuIn1st ? 'Ketu in 1st House' : 'Ketu Conjunct Lagna Lord',
      manifestation: 'Possesses a distinct subtle birthmark, mole, or faint indentation near the neck, throat, hairline, or hidden joint; encountered a sudden childhood physical close-call or sharp object incident that left an indelible memory.',
      confidenceScore: 92,
    });
  }

  // Saturn on Lagna or Aspecting Lagna (Bone structure / Dental / Veins)
  const saturnIn1st = saturn?.houseNumber === 1;
  const saturnAspects1st = saturn ? planetAspectsHouse('Saturn', saturn.houseNumber, 1) : false;
  if (saturnIn1st || saturnAspects1st) {
    physicalSignatures.push({
      category: 'BODY_TYPE',
      title: 'Lean Skeletal Gravity & Orthopedic/Dental Resilience',
      grahaSignature: saturnIn1st ? 'Saturn in 1st House' : 'Saturn Classical Aspect on Lagna',
      manifestation: 'Features a naturally measured, serious physical demeanor with prominent tendon/vein visibility on hands, lower back or knee joint sensitivity, and early dental sensitivity or orthodontic correction.',
      confidenceScore: saturnIn1st ? 94 : 85,
    });
  }

  // Rahu in 1st or 2nd House (Piercing Gaze / Speech Modulation)
  if (rahu?.houseNumber === 1 || rahu?.houseNumber === 2) {
    physicalSignatures.push({
      category: 'GAZE_FACIAL',
      title: 'Magnetic Expressive Eyes & Rapid Vocal Modulation',
      grahaSignature: `Rahu in House ${rahu.houseNumber}`,
      manifestation: 'Deep, piercing, highly observant gaze; thoughts often fire in rapid bursts faster than vocal delivery can comfortably keep pace; expressive facial transitions during intellectual discourse.',
      confidenceScore: 90,
    });
  }

  // Sun in 1st or 10th House (Solar Forehead & Royal Bearing)
  if (sun?.houseNumber === 1 || sun?.houseNumber === 10) {
    physicalSignatures.push({
      category: 'BODY_TYPE',
      title: 'Solar Cranial Stature & Bright-Light Sensitivity',
      grahaSignature: `Sun in House ${sun.houseNumber}`,
      manifestation: 'High forehead, proud upright spinal posture, commanding gaze; heightened sensitivity to direct summer sunlight or artificial glare causing rapid eye fatigue.',
      confidenceScore: 87,
    });
  }

  // Moon in 1st or 4th House (Lunar Facial Softness & Hydration Fluctuation)
  if (moon?.houseNumber === 1 || moon?.houseNumber === 4) {
    physicalSignatures.push({
      category: 'BODY_TYPE',
      title: 'Lunar Facial Contours & Fluid Balance Sensitivity',
      grahaSignature: `Moon in House ${moon.houseNumber}`,
      manifestation: 'Rounded, expressive facial structure that visibly displays emotional states; physiological energy and fluid balance subtly fluctuate in sync with waxing and waning lunar phases.',
      confidenceScore: 86,
    });
  }

  // Fallback physical trait if chart has none of the above extremes
  if (physicalSignatures.length === 0) {
    physicalSignatures.push({
      category: 'BODY_TYPE',
      title: 'Balanced Lagna Dignity',
      grahaSignature: `Lagna Lord ${lagnaLord} in House ${lagnaLordPlanet?.houseNumber ?? 1}`,
      manifestation: 'Harmonious physiological symmetry with physical resilience tied directly to digestive rhythm and disciplined sleep cycles.',
      confidenceScore: 80,
    });
  }

  // --- 2. KULA & ANCESTRAL LINEAGE SECRETS ---

  // 4th House / Moon affliction (Mother's endurance / Ancestral property disruption)
  const fourthHousePlanets = chart.planets.filter((p) => p.houseNumber === 4);
  const fourthLord = SIGN_LORDS[getNthSign(chart.lagnaSign, 4)];
  const fourthLordPlanet = chart.planets.find((p) => p.name === fourthLord);
  const fourthAfflictedByMalefic =
    fourthHousePlanets.some((p) => ['Saturn', 'Mars', 'Rahu', 'Ketu'].includes(p.name)) ||
    (saturn && planetAspectsHouse('Saturn', saturn.houseNumber, 4)) ||
    (mars && planetAspectsHouse('Mars', mars.houseNumber, 4));

  if (fourthAfflictedByMalefic || (moon && ['Saturn', 'Rahu', 'Ketu'].includes(fourthLord))) {
    ancestralSecrets.push({
      lineageAxis: 'MATERNAL_4TH_HOUSE',
      title: "Maternal Stoicism & Childhood Home Renovation/Water Anomaly",
      grahaSignature: '4th House / Lord afflicted by Tamasic/Agni Grahas',
      historicalPattern: 'The native’s mother bore quiet, unexpressed sacrifices or heavy emotional burdens during native’s early formative years. Furthermore, the childhood ancestral home had an unresolved water-leakage/plumbing defect, sudden boundary dispute, or underwent a major structural disruption.',
      confidenceScore: 92,
    });
  }

  // 9th House / Sun affliction (Father's lineage disruption or displacement)
  const ninthHousePlanets = chart.planets.filter((p) => p.houseNumber === 9);
  const ninthLord = SIGN_LORDS[getNthSign(chart.lagnaSign, 9)];
  const sunWithRahuOrKetu = sun && (rahu?.houseNumber === sun.houseNumber || ketu?.houseNumber === sun.houseNumber);
  const ninthAfflicted =
    ninthHousePlanets.some((p) => ['Rahu', 'Ketu', 'Saturn'].includes(p.name)) ||
    sunWithRahuOrKetu ||
    (saturn && planetAspectsHouse('Saturn', saturn.houseNumber, 9));

  if (ninthAfflicted) {
    ancestralSecrets.push({
      lineageAxis: 'PATERNAL_9TH_HOUSE',
      title: "Paternal Lineage Career Shift or Geographical Displacement",
      grahaSignature: '9th House / Sun afflicted by Node/Saturnian Axis',
      historicalPattern: 'The paternal or grandfather’s lineage underwent an abrupt career reversal, sudden geographical uprooting, or unfulfilled life legacy. The native feels an unspoken karmic duty to elevate and redeem the family name.',
      confidenceScore: 89,
    });
  }

  // 2nd Lord in 8th or 12th House (Secret family financial crisis or inheritance friction)
  const secondLord = SIGN_LORDS[getNthSign(chart.lagnaSign, 2)];
  const secondLordPlanet = chart.planets.find((p) => p.name === secondLord);
  if (secondLordPlanet?.houseNumber === 8 || secondLordPlanet?.houseNumber === 12 || secondLordPlanet?.houseNumber === 6) {
    ancestralSecrets.push({
      lineageAxis: 'ANCESTRAL_ESTATE_2ND_HOUSE',
      title: "Unshared Early Family Financial Volatility",
      grahaSignature: `2nd Lord ${secondLord} placed in House ${secondLordPlanet.houseNumber}`,
      historicalPattern: 'During childhood or adolescence, the family experienced a sharp, unshared financial crisis, inheritance complication, or sudden depletion of liquid resources that permanently ingrained in the native an obsessive wariness around personal financial security.',
      confidenceScore: 91,
    });
  }

  // --- 3. CHITTA & MANAS (PSYCHOLOGICAL QUIRKS & COVERT TRUTHS) ---

  // Moon in transformative Nakshatras (Ardra, Mula, Jyeshtha, Ashlesha, Shatabhisha)
  const cleanMoonNak = (chart.moonNakshatra || '').toLowerCase();
  const isNocturnalNak = /ardra|mula|moola|jyeshtha|ashlesha|shatabhisha|swati/i.test(cleanMoonNak);
  if (isNocturnalNak) {
    psychologicalQuirks.push({
      traitKey: 'NOCTURNAL_HYPERFOCUS',
      title: 'Late-Night Intellectual Surge & Acute Small-Talk Intolerance',
      grahaSignature: `Chandra in ${chart.moonNakshatra || 'Intense Nakshatra'}`,
      covertTruth: 'Experiences peak creative and analytical lucidity late at night (11 PM - 3 AM) when the external world goes quiet. Possesses an intense, almost physical intolerance for superficial social pleasantries, and routinely enters sudden communication blackouts to recharge.',
      behavioralManifestation: 'Withdraws abruptly from groups when over-stimulated; needs prolonged solitude to metabolize mental fatigue.',
    });
  }

  // Mercury-Rahu conjunction (The Multi-Tab Mind)
  if (mercury && rahu && mercury.houseNumber === rahu.houseNumber) {
    psychologicalQuirks.push({
      traitKey: 'MULTI_TAB_MIND',
      title: 'Neural Acceleration & Rapid Pattern Decryption',
      grahaSignature: `Mercury conjunct Rahu in House ${mercury.houseNumber}`,
      covertTruth: 'The mind operates with 20 mental browser tabs open simultaneously. Gifted with instinctive pattern recognition in code, psychology, or cryptic systems, but battles intermittent nervous anxiety and frustration with slow, bureaucratic minds.',
      behavioralManifestation: 'Skips steps in explanations because the conclusion arrived three steps ahead of speech.',
    });
  }

  // Venus-Ketu conjunction (The Intimacy Paradox)
  if (venus && ketu && venus.houseNumber === ketu.houseNumber) {
    psychologicalQuirks.push({
      traitKey: 'INTIMACY_PARADOX',
      title: 'The Intimacy Paradox: Longing for Soul Union vs Emotional Claustrophobia',
      grahaSignature: `Venus conjunct Ketu in House ${venus.houseNumber}`,
      covertTruth: 'Deeply longs for a sacred, unconditional soul partnership, yet experiences an instinctual feeling of emotional claustrophobia the instant a partner becomes clingy, needy, or transactional.',
      behavioralManifestation: 'Pulls away emotionally at the exact moment a relationship becomes close, needing space to verify personal sovereignty.',
    });
  }

  // Mars-Saturn conjunction or mutual aspect (Volcanic Restraint)
  const marsSaturnConjunct = mars && saturn && mars.houseNumber === saturn.houseNumber;
  const marsSaturnMutual =
    mars && saturn && planetAspectsHouse('Mars', mars.houseNumber, saturn.houseNumber) && planetAspectsHouse('Saturn', saturn.houseNumber, mars.houseNumber);
  if (marsSaturnConjunct || marsSaturnMutual) {
    psychologicalQuirks.push({
      traitKey: 'VOLCANIC_RESTRAINT',
      title: 'Hydraulic Internal Tension & Extreme Discipline',
      grahaSignature: marsSaturnConjunct ? 'Mars conjunct Saturn' : 'Mars-Saturn Mutual Aspect',
      covertTruth: 'Possesses immense, grinding stamina. Tends to swallow grievances silently for months under iron control, until a boundary is crossed and a cold, irreversible severance occurs.',
      behavioralManifestation: 'Never argues trivialities; acts with surgical finality once patience has expired.',
    });
  }

  // --- 4. UNASKED QUESTION ANTICIPATION ---
  let unaskedAnticipation = '';
  if (chart.isPeakSadeSati) {
    unaskedAnticipation =
      "UNASKED INTENT: Although the native may present a routine query, their true unexpressed struggle is a profound, heavy fatigue under active Saturn Sade Sati. They secretly question whether their current professional foundation is worth the grinding toil, and crave confirmation of when this invisible weight will lift.";
  } else if (chart.careerDoubleTransitActive) {
    unaskedAnticipation =
      "UNASKED INTENT: The native is covertly standing at a career crossroads. With Jupiter and Saturn converging on the 10th house axis, they are privately contemplating a resignation, a radical shift into leadership/consulting, or breaking out of a stifling institutional ceiling.";
  } else if (chart.marriageDoubleTransitActive) {
    unaskedAnticipation =
      "UNASKED INTENT: A major partnership threshold is silently weighing on their mind. With the 7th house energized by dual transit, they are either deliberating on a formal commitment or evaluating whether to terminate an unfulfilling long-term bond.";
  } else if (chart.activeDashaLord === 'Rahu' || chart.activeAntardashaLord === 'Rahu') {
    unaskedAnticipation =
      "UNASKED INTENT: Under Rahu's active cycle, the native feels an intense, burning urgency to break into something unconventional, foreign, or technologically disruptive. They fear staying ordinary more than they fear failure.";
  } else {
    unaskedAnticipation =
      `UNASKED INTENT: Under ${chart.activeDashaLord || 'current'} Mahadasha, the native seeks definitive clarity on whether their past sacrifices are finally about to bear tangible material fruit or if another tactical recalibration is required.`;
  }

  // --- 5. SYNTHESIZE THE DAIVAJNA DOSSIER ---
  const topPhysical = physicalSignatures[0];
  const topAncestral = ancestralSecrets[0];
  const topQuirk = psychologicalQuirks[0];

  let openingDiagnosticAnchor = `Before examining your explicit query, classical shastric astronomy reveals striking signatures that you will immediately recognize in your physical and personal life: `;
  if (topPhysical) {
    openingDiagnosticAnchor += `First, ${topPhysical.manifestation} `;
  }
  if (topQuirk) {
    openingDiagnosticAnchor += `Psychologically, ${topQuirk.covertTruth} `;
  }
  if (topAncestral) {
    openingDiagnosticAnchor += `In your lineage, ${topAncestral.historicalPattern}`;
  }

  const dossierParts: string[] = [
    `=== DEHA & ANGA LAKSHANA SHOCK DOSSIER (UNPROMPTED DIAGNOSTIC ANCHORS) ===`,
    `Daivajna Opening Calibration Hook: "${openingDiagnosticAnchor}"`,
    `\n1. PHYSICAL MARKS & BODILY SIGNATURES (ANGA LAKSHANA):`,
  ];

  for (const p of physicalSignatures) {
    dossierParts.push(`• [${p.category}] ${p.title} (${p.grahaSignature}): ${p.manifestation} [Confidence: ${p.confidenceScore}%]`);
  }

  if (ancestralSecrets.length > 0) {
    dossierParts.push(`\n2. KULA & ANCESTRAL LINEAGE SECRETS (PITRU/MATRU KARMA):`);
    for (const a of ancestralSecrets) {
      dossierParts.push(`• [${a.lineageAxis}] ${a.title} (${a.grahaSignature}): ${a.historicalPattern} [Confidence: ${a.confidenceScore}%]`);
    }
  }

  if (psychologicalQuirks.length > 0) {
    dossierParts.push(`\n3. CHITTA & MANAS (INTIMATE PSYCHOLOGICAL QUIRKS):`);
    for (const q of psychologicalQuirks) {
      dossierParts.push(`• [${q.traitKey}] ${q.title} (${q.grahaSignature}): ${q.covertTruth}`);
    }
  }

  dossierParts.push(`\n4. ANTICIPATION OF UNASKED INTENT:`);
  dossierParts.push(unaskedAnticipation);
  dossierParts.push(
    `\nMANDATORY DAIVAJNA DIRECTIVE: Integrate at least 1-2 of these physical or psychological anchors in your opening response. When the client reads their own hidden marks and private habits described with clinical precision, their confidence in the planetary roadmap becomes absolute.`
  );

  return {
    openingDiagnosticAnchor,
    physicalSignatures,
    ancestralSecrets,
    psychologicalQuirks,
    unaskedQuestionAnticipation: unaskedAnticipation,
    formattedDaivajnaDossier: dossierParts.join('\n'),
  };
}

function getNthSign(startSign: ZodiacSign, n: number): ZodiacSign {
  const signs: ZodiacSign[] = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];
  const idx = signs.indexOf(startSign);
  const targetIdx = (idx + (n - 1)) % 12;
  return signs[targetIdx];
}
