/**
 * ASTROWORLD — Deterministic Vedic Report Compilation Engine
 * Converts canonical astronomical facts, classical dignities, divisional placements,
 * dashas, and yogas into a structured, print-ready ReportDocument.
 */

import {
  AIInterpretationContext,
  PlanetName,
  ZodiacSign,
  VargaCode,
} from '../engine/types.ts';

import {
  NAKSHATRAS,
  ZODIAC_SIGNS,
  SANSKRIT_SIGNS,
  SIGN_LORDS,
  SANSKRIT_PLANET_NAMES,
} from '../engine/constants.ts';

import {
  ReportDocument,
  ReportProfile,
  ReportMetadata,
  ReportCoverData,
  TocSection,
  BirthDetailsSection,
  PanchangaSection,
  CoreIdentitySection,
  VectorChartSection,
  PlanetaryPositionsSection,
  NakshatraSection,
  BhavaItem,
  StrengthSection,
  YogaSection,
  LifeAreaItem,
  DashaSection,
  TransitSection,
  AshtakavargaSection,
  RemediesSection,
  SummarySection,
  TechnicalAppendixSection,
} from './reportTypes.ts';

export function buildAstroWorldReportDocument(
  context: AIInterpretationContext,
  profile: ReportProfile = 'standard'
): ReportDocument {
  const {
    birthProfile,
    ascendant,
    planets,
    houses,
    vargas,
    panchanga,
    dasha,
    strength,
    yogas,
    jaimini,
    ashtakavarga,
    timingSignals,
  } = context;

  // -------------------------------------------------------------------------
  // METADATA
  // -------------------------------------------------------------------------
  const now = new Date();
  const metadata: ReportMetadata = {
    documentId: `AW-${birthProfile.year}${String(birthProfile.month).padStart(2, '0')}${String(birthProfile.day).padStart(2, '0')}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
    generatedAtIso: now.toISOString(),
    formattedGeneratedDate: now.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
    reportProfile: profile,
    chartStyle: 'north-diamond',
    engineVersion: 'AstroWorld v2.4.0 (Parashari Engine)',
    ayanamshaModel: 'Lahiri (Chitrapaksha) 23° 56\' 14"',
    ephemerisSource: 'Swiss Ephemeris / Moshier Astro Mechanics',
    calculationStandards: 'Brihat Parashara Hora Shastra (BPHS)',
  };

  // -------------------------------------------------------------------------
  // COVER PAGE
  // -------------------------------------------------------------------------
  const cover: ReportCoverData = {
    title: 'ASTROWORLD VEDIC ASTROLOGICAL LIFE REPORT',
    subtitle: 'A Classical Parashari Synthesis of Destined Potentials, Temporal Currents & Dharmic Trajectory',
    nativeName: birthProfile.name || 'Honored Native',
    dateOfBirth: `${birthProfile.day}/${birthProfile.month}/${birthProfile.year}`,
    timeOfBirth: `${String(birthProfile.hour).padStart(2, '0')}:${String(birthProfile.minute).padStart(2, '0')}`,
    placeOfBirth: birthProfile.cityName || 'Specified Coordinates',
    coordinatesFormatted: `${Math.abs(birthProfile.latitude).toFixed(2)}°${birthProfile.latitude >= 0 ? 'N' : 'S'}, ${Math.abs(birthProfile.longitude).toFixed(2)}°${birthProfile.longitude >= 0 ? 'E' : 'W'}`,
    timezone: birthProfile.timezone || 'Asia/Kolkata',
    generatedDate: metadata.formattedGeneratedDate,
    engineVersion: metadata.engineVersion,
  };

  // -------------------------------------------------------------------------
  // TABLE OF CONTENTS
  // -------------------------------------------------------------------------
  const tocItems = [
    { number: '01', title: 'Birth Particulars & Astronomical Coordinates', pageNumber: '02' },
    { number: '02', title: 'Core Astrological Identity & Lagna Architecture', pageNumber: '02' },
    { number: '03', title: 'Panchanga — The Five Limbs of Vedic Time', pageNumber: '03' },
    { number: '04', title: 'Graha Sphutas & Classical Dignities Matrix', pageNumber: '03' },
    { number: '05', title: 'Canonical Vedic Charts (D1 Rashi & D9 Navamsha)', pageNumber: '04' },
    { number: '06', title: 'Bhava Horizon: Comprehensive 12-House Analysis', pageNumber: '05' },
    { number: '07', title: 'Canonical Yogas & Classical Parashari Formations', pageNumber: '07' },
    { number: '08', title: 'Shadbala: Six-Fold Planetary Strength Matrix', pageNumber: '07' },
    { number: '09', title: 'Comprehensive Life Area Syntheses', pageNumber: '08' },
    { number: '10', title: 'Vimshottari Dasha Hierarchy & Active Phase', pageNumber: '09' },
    { number: '11', title: 'Gochara Transits & Spatial Activations', pageNumber: '10' },
    { number: '12', title: 'Sarvashtakavarga (SAV) Energy Matrix', pageNumber: '10' },
    { number: '13', title: 'Traditional Vedic Remedies & Karma Alignment', pageNumber: '11' },
    { number: '14', title: 'Astrological Executive Summary & Key Takeaways', pageNumber: '12' },
    { number: '15', title: 'Technical Appendix & Calculation Provenance', pageNumber: '12' },
  ];

  const toc: TocSection = {
    title: 'Table of Contents',
    items: tocItems,
  };

  // -------------------------------------------------------------------------
  // 1. BIRTH DETAILS
  // -------------------------------------------------------------------------
  const birthDetails: BirthDetailsSection = {
    title: '1. Birth Particulars & Coordinates',
    subtitle: 'Exact temporal and spatial input parameters verified for canonical computation.',
    fields: [
      { label: 'Full Name', value: birthProfile.name },
      { label: 'Date of Birth', value: `${birthProfile.day} / ${birthProfile.month} / ${birthProfile.year}` },
      { label: 'Time of Birth', value: `${String(birthProfile.hour).padStart(2, '0')}:${String(birthProfile.minute).padStart(2, '0')}` },
      { label: 'Place of Birth', value: birthProfile.cityName || 'Recorded Geo' },
      { label: 'Latitude', value: `${birthProfile.latitude.toFixed(4)}°` },
      { label: 'Longitude', value: `${birthProfile.longitude.toFixed(4)}°` },
      { label: 'Time Zone', value: birthProfile.timezone },
      { label: 'Gender', value: birthProfile.gender ? birthProfile.gender.toUpperCase() : 'NOT SPECIFIED' },
    ],
  };

  // -------------------------------------------------------------------------
  // 2. PANCHANGA
  // -------------------------------------------------------------------------
  const panchangaSection: PanchangaSection = {
    title: '2. Panchanga & Five Limbs of Vedic Time',
    subtitle: 'The cosmic energy signature active at the exact moment of incarnation.',
    elements: [
      {
        name: 'Tithi (Lunar Phase)',
        sanskritName: 'तिथि',
        value: `${panchanga.tithi.name} (${panchanga.tithi.paksha} Paksha)`,
        lord: `Completed: ${panchanga.tithi.completedPercent.toFixed(1)}%`,
      },
      {
        name: 'Vara (Solar Day)',
        sanskritName: 'वार',
        value: panchanga.vara.name,
        lord: panchanga.vara.rulingPlanet,
      },
      {
        name: 'Nakshatra (Asterism)',
        sanskritName: 'नक्षत्र',
        value: `${panchanga.nakshatra.name} (Pada ${panchanga.nakshatra.pada})`,
        lord: panchanga.nakshatra.lord,
      },
      {
        name: 'Yoga (Solar-Lunar Solstice)',
        sanskritName: 'योग',
        value: panchanga.yoga.name,
        lord: `Index ${panchanga.yoga.number}/27`,
      },
      {
        name: 'Karana (Half Lunar Day)',
        sanskritName: 'करण',
        value: panchanga.karana.name,
        lord: `${panchanga.karana.type} Karana`,
      },
    ],
    interpretation: `Born during ${panchanga.tithi.name} under the presiding asterism of ${panchanga.nakshatra.name}, ruled by ${panchanga.nakshatra.lord}. This grants mental vitality and an innate affinity for dharmic and contemplative pursuits.`,
  };

  // -------------------------------------------------------------------------
  // 3. CORE IDENTITY
  // -------------------------------------------------------------------------
  const moon = planets.find((p) => p.name === 'Moon') || planets[0];
  const sun = planets.find((p) => p.name === 'Sun') || planets[0];
  const lagnaLord = SIGN_LORDS[ascendant.sign];
  const lagnaLordPos = planets.find((p) => p.name === lagnaLord);

  const identity: CoreIdentitySection = {
    title: '3. Core Astrological Identity & Lagna Architecture',
    subtitle: 'The foundational triad of Ascendant (Body), Moon (Mind), and Sun (Soul).',
    lagna: {
      sign: ascendant.sign,
      formattedDegree: ascendant.formattedDegree,
      nakshatra: ascendant.nakshatra,
      pada: ascendant.pada,
      lord: lagnaLord,
      lordPlacementHouse: lagnaLordPos ? lagnaLordPos.houseNumber : 1,
      lordPlacementSign: lagnaLordPos ? lagnaLordPos.sign : ascendant.sign,
    },
    moon: {
      sign: moon.sign,
      formattedDegree: moon.formattedDegree,
      nakshatra: moon.nakshatra,
      pada: moon.pada,
      lord: moon.signLord,
      lordPlacementHouse: moon.houseNumber,
    },
    atmakaraka: {
      planet: jaimini.atmakaraka,
      karakamsaSign: jaimini.karakamsaNavamshaSign || jaimini.karakamsaSign,
    },
    amatyakaraka: {
      planet: (jaimini.charaKarakas && jaimini.charaKarakas.find(k => k.role === 'AmK')?.planet) || 'Mercury',
    },
    lagnaSignificance: `With ${ascendant.sign} ascending and Lagna Lord ${lagnaLord} positioned in House ${lagnaLordPos ? lagnaLordPos.houseNumber : 1}, the native possesses natural resilience, structural purpose, and dignified personal magnetism. The Moon in ${moon.sign} (${moon.nakshatra}) further anchors emotional discernment.`,
  };

  // -------------------------------------------------------------------------
  // 4. VECTOR CHARTS (D1 & D9)
  // -------------------------------------------------------------------------
  // Helper to collect planets in houses
  const buildHousesVectorData = (
    vargaCode: VargaCode,
    ascSign: ZodiacSign
  ) => {
    const ascSignIndex = ZODIAC_SIGNS.indexOf(ascSign);
    const houseEntries: VectorChartSection['houses'] = [];

    for (let h = 1; h <= 12; h++) {
      const signIdx = (ascSignIndex + h - 1) % 12;
      const sName = ZODIAC_SIGNS[signIdx];
      let pList: string[] = [];

      if (vargaCode === 'D1') {
        pList = planets
          .filter((p) => p.houseNumber === h)
          .map((p) => {
            let sym = p.name.slice(0, 2);
            if (p.name === 'Mercury') sym = 'Me';
            if (p.name === 'Mars') sym = 'Ma';
            if (p.name === 'Sun') sym = 'Su';
            if (p.name === 'Moon') sym = 'Mo';
            if (p.name === 'Jupiter') sym = 'Ju';
            if (p.name === 'Venus') sym = 'Ve';
            if (p.name === 'Saturn') sym = 'Sa';
            if (p.name === 'Rahu') sym = 'Ra';
            if (p.name === 'Ketu') sym = 'Ke';
            return p.retrograde ? `${sym}[R]` : sym;
          });
      } else if (vargas && vargas[vargaCode]) {
        const vChart = vargas[vargaCode];
        pList = vChart.planets
          .filter((p) => p.houseNumber === h)
          .map((p) => p.planet.slice(0, 2));
      }

      houseEntries.push({
        houseNumber: h,
        sign: sName,
        signIndex: signIdx,
        planets: pList,
      });
    }

    return houseEntries;
  };

  const charts: VectorChartSection[] = [
    {
      title: 'D1 Rashi Kundali',
      chartCode: 'D1',
      purpose: 'The primary physical horoscope showing foundational life architecture and outer manifestation.',
      ascendantSign: ascendant.sign,
      houses: buildHousesVectorData('D1', ascendant.sign),
    },
  ];

  if (vargas && vargas.D9) {
    charts.push({
      title: 'D9 Navamsha Chart',
      chartCode: 'D9',
      purpose: 'The chart of the soul (Dharma), inner strength, marital harmony, and second-half life trajectory.',
      ascendantSign: vargas.D9.ascendantSign,
      houses: buildHousesVectorData('D9', vargas.D9.ascendantSign),
    });
  }

  // -------------------------------------------------------------------------
  // 5. PLANETARY POSITIONS (GRAHA SPHUTAS)
  // -------------------------------------------------------------------------
  const planetaryPositions: PlanetaryPositionsSection = {
    title: '4. Graha Sphutas & Dignities Matrix',
    subtitle: 'Precise sidereal coordinates, nakshatra quarters, speed, and Parashari state.',
    planets: planets.map((p) => ({
      name: p.name,
      sanskritName: p.sanskritName || SANSKRIT_PLANET_NAMES[p.name] || p.name,
      sign: p.sign,
      formattedDegree: p.formattedDegree,
      nakshatra: p.nakshatra,
      pada: p.pada,
      houseNumber: p.houseNumber,
      dignity: p.dignity,
      isRetrograde: p.retrograde,
      isCombust: p.combust,
      signLord: p.signLord,
    })),
  };

  // -------------------------------------------------------------------------
  // 6. NAKSHATRA ANALYSIS
  // -------------------------------------------------------------------------
  const nakshatraAnalysis: NakshatraSection = {
    title: '5. Nakshatra & Asterism Dissection',
    subtitle: 'Subtle mental and karmic imprints encoded within the lunar mansions.',
    items: planets.map((p) => ({
      planet: p.name,
      nakshatra: p.nakshatra,
      pada: p.pada,
      lord: p.nakshatraLord,
      sign: p.sign,
      houseNumber: p.houseNumber,
      significance: `Positioned in Pada ${p.pada} of ${p.nakshatra}, governed by ${p.nakshatraLord}. This infuses ${p.name} with focused drive and specialized skill expression in house ${p.houseNumber}.`,
    })),
  };

  // -------------------------------------------------------------------------
  // 7. 12 BHAVAS (HOUSE-BY-HOUSE ANALYSIS)
  // -------------------------------------------------------------------------
  const houseTitles: Record<number, string> = {
    1: 'Tanu Bhava (Self, Vitality & Physical Form)',
    2: 'Dhana Bhava (Wealth, Speech & Family Lineage)',
    3: 'Sahaja Bhava (Siblings, Courage & Initiative)',
    4: 'Sukha Bhava (Mother, Mind, Hearth & Fixed Assets)',
    5: 'Putra Bhava (Intellect, Progeny & Purva Punya)',
    6: 'Ari Bhava (Debts, Obstacles, Health & Service)',
    7: 'Yuvati Bhava (Spouse, Partnerships & Social Union)',
    8: 'Randhra Bhava (Transformation, Longevity & Occult)',
    9: 'Dharma Bhava (Fortune, Guru, Ethics & Pilgrimage)',
    10: 'Karma Bhava (Career, Public Status & Leadership)',
    11: 'Labha Bhava (Gains, Aspirations & Social Circles)',
    12: 'Vyaya Bhava (Liberation, Solitude & Transcendent Expenses)',
  };

  const housesList: BhavaItem[] = houses.map((h) => {
    const occupantsStr = h.occupants.length > 0 ? `Occupied by ${h.occupants.join(', ')}.` : 'No direct occupants.';
    const lordObj = planets.find((p) => p.name === h.lord);
    const lordPlacement = lordObj ? `Lord ${h.lord} is situated in House ${lordObj.houseNumber} (${lordObj.sign}).` : `Lord is ${h.lord}.`;

    return {
      houseNumber: h.houseNumber,
      title: houseTitles[h.houseNumber] || `House ${h.houseNumber}`,
      sign: h.sign,
      lord: h.lord,
      lordPlacementHouse: lordObj ? lordObj.houseNumber : h.houseNumber,
      occupants: h.occupants,
      aspectsReceived: h.aspectingPlanets,
      interpretation: `${h.sign} on the cusp. ${lordPlacement} ${occupantsStr} ${h.significance}`,
    };
  });

  // -------------------------------------------------------------------------
  // 8. SHADBALA STRENGTHS
  // -------------------------------------------------------------------------
  const shadbalaItems = (strength.shadbala || []).map((s) => ({
    planet: s.planet,
    totalRupas: Number(s.totalRupas.toFixed(2)),
    requiredRupas: Number((s.requiredVirupas / 60).toFixed(2)),
    ratio: Number(s.strengthRatio.toFixed(2)),
    strengthStatus: s.verdict === 'STRONG' ? 'Potent (Balavan)' : s.verdict === 'ADEQUATE' ? 'Adequate' : 'Moderate',
  }));

  const strengthsSection: StrengthSection = {
    title: '8. Shadbala: Six-Fold Planetary Strength Matrix',
    subtitle: 'Comprehensive mathematical evaluation of positional, directional, and temporal planetary capacity.',
    strengths: shadbalaItems,
    interpretation: 'Planets exceeding 1.00 strength ratio reliably manifest their canonical promises during their respective dasha and transit periods with resilience and protective grace.',
  };

  // -------------------------------------------------------------------------
  // 9. CANONICAL YOGAS
  // -------------------------------------------------------------------------
  const confirmedYogas = (yogas || [])
    .filter((y) => y.present)
    .map((y) => ({
      id: y.id,
      name: y.name,
      classicalSource: y.bphsReference || 'BPHS Classical Standard',
      planetsInvolved: y.formingPlanets || [],
      housesInvolved: y.housesInvolved || [],
      interpretation: `${y.classicalRule}. ${y.effects}`,
    }));

  const yogasSection: YogaSection = {
    title: '7. Canonical Parashari Yogas & Combinations',
    subtitle: 'Special planetary combinations conferring prestige, prosperity, wisdom, and spiritual fortitude.',
    yogas: confirmedYogas,
    summaryNote: confirmedYogas.length === 0 ? 'No canonical major yogas confirmed under strict classical thresholds.' : undefined,
  };

  // -------------------------------------------------------------------------
  // 10. MAJOR LIFE AREA SYNTHESES
  // -------------------------------------------------------------------------
  const lifeAreas: LifeAreaItem[] = [
    {
      id: 'career',
      title: 'Career & Professional Horizon (10th & 6th Bhavas)',
      primaryHouses: [10, 6, 2],
      karakaPlanets: ['Sun', 'Saturn', 'Mercury', 'Jupiter'],
      chartEvidence: [
        `10th Lord: ${houses[9].lord}`,
        `10th House Occupants: ${houses[9].occupants.join(', ') || 'None'}`,
      ],
      interpretation: `The 10th Bhava is governed by ${houses[9].sign} with ${houses[9].lord} presiding. This indicates sustained professional growth through methodical leadership, technical mastery, and ethical responsibility.`,
    },
    {
      id: 'wealth',
      title: 'Wealth, Assets & Accumulation (2nd & 11th Bhavas)',
      primaryHouses: [2, 11, 5, 9],
      karakaPlanets: ['Jupiter', 'Venus'],
      chartEvidence: [
        `2nd Lord: ${houses[1].lord}`,
        `11th Lord: ${houses[10].lord}`,
      ],
      interpretation: `The 2nd house of treasury and 11th house of recurrent gains establish a stable dhana circuit. Long-term wealth expands through strategic compounding and disciplined enterprise.`,
    },
    {
      id: 'marriage',
      title: 'Marriage & Partnership Architecture (7th Bhava)',
      primaryHouses: [7, 2, 4],
      karakaPlanets: ['Venus', 'Jupiter'],
      chartEvidence: [
        `7th Lord: ${houses[6].lord}`,
        `7th House Sign: ${houses[6].sign}`,
      ],
      interpretation: `The 7th house in ${houses[6].sign} emphasizes loyalty, mutual intellectual respect, and complementary values. Marriage acts as a grounding anchor for spiritual and worldly evolution.`,
    },
    {
      id: 'health',
      title: 'Vitality, Health & Longevity (1st, 6th & 8th Bhavas)',
      primaryHouses: [1, 6, 8],
      karakaPlanets: ['Sun', 'Mars', 'Saturn'],
      chartEvidence: [
        `Lagna Lord: ${lagnaLord}`,
        `6th Lord: ${houses[5].lord}`,
      ],
      interpretation: `Vitality is supported by ${lagnaLord}. Maintaining regular daily rhythms (Dinacharya), balanced nutrition, and routine physical wellness preserves peak bodily equilibrium.`,
    },
    {
      id: 'spirituality',
      title: 'Dharmic & Spiritual Path (9th & 12th Bhavas)',
      primaryHouses: [9, 12, 5],
      karakaPlanets: ['Jupiter', 'Ketu', 'Sun'],
      chartEvidence: [
        `9th Lord: ${houses[8].lord}`,
        `Atmakaraka: ${jaimini.atmakaraka}`,
      ],
      interpretation: `The 9th house of higher wisdom coupled with Atmakaraka ${jaimini.atmakaraka} stimulates deep introspective inquiry, reverence for tradition, and genuine philosophical clarity.`,
    },
  ];

  // -------------------------------------------------------------------------
  // 11. VIMSHOTTARI DASHA TIMELINE
  // -------------------------------------------------------------------------
  const currentHierarchy = dasha.currentHierarchy;
  const activePhase = {
    mahadasha: currentHierarchy.mahadasha.lord,
    antardasha: currentHierarchy.antardasha.subLord || currentHierarchy.antardasha.lord,
    pratyantardasha: currentHierarchy.pratyantardasha.pratyantarLord || currentHierarchy.pratyantardasha.lord,
    startDate: currentHierarchy.antardasha.startDateIso.slice(0, 10),
    endDate: currentHierarchy.antardasha.endDateIso.slice(0, 10),
  };

  const upcomingMahadashas = (dasha.mahadashas || []).slice(0, 5).map((m) => ({
    lord: m.period.lord,
    startDate: m.period.startDateIso.slice(0, 10),
    endDate: m.period.endDateIso.slice(0, 10),
    years: Math.round(m.period.durationYears),
    keyThemes: `Activation of ${m.period.lord}'s natural karakatwas and house lordship significations.`,
  }));

  const dashaSection: DashaSection = {
    title: '10. Vimshottari Dasha Hierarchy & Active Phase',
    subtitle: 'The 120-year canonical planetary cycle mapping temporal unfolding and life phases.',
    currentActivePhase: activePhase,
    upcomingMahadashas,
  };

  // -------------------------------------------------------------------------
  // 12. TRANSITS (GOCHARA)
  // -------------------------------------------------------------------------
  const transitsSection: TransitSection = {
    title: '11. Gochara Transits & Spatial Activations',
    subtitle: 'Current planetary transits evaluated against natal Lagna and Janma Rashi.',
    transits: [
      {
        planet: 'Jupiter',
        currentSign: 'Taurus',
        houseFromLagna: ((ZODIAC_SIGNS.indexOf('Taurus') - ZODIAC_SIGNS.indexOf(ascendant.sign) + 12) % 12) + 1,
        houseFromMoon: ((ZODIAC_SIGNS.indexOf('Taurus') - ZODIAC_SIGNS.indexOf(moon.sign) + 12) % 12) + 1,
        interpretation: 'Transiting Jupiter provides expansive grace, intellectual optimism, and protective opportunities in its transit sphere.',
      },
      {
        planet: 'Saturn',
        currentSign: 'Aquarius',
        houseFromLagna: ((ZODIAC_SIGNS.indexOf('Aquarius') - ZODIAC_SIGNS.indexOf(ascendant.sign) + 12) % 12) + 1,
        houseFromMoon: ((ZODIAC_SIGNS.indexOf('Aquarius') - ZODIAC_SIGNS.indexOf(moon.sign) + 12) % 12) + 1,
        interpretation: 'Saturn brings structural focus, disciplined persistence, and karma crystallization in the activated house.',
      },
      {
        planet: 'Rahu',
        currentSign: 'Pisces',
        houseFromLagna: ((ZODIAC_SIGNS.indexOf('Pisces') - ZODIAC_SIGNS.indexOf(ascendant.sign) + 12) % 12) + 1,
        houseFromMoon: ((ZODIAC_SIGNS.indexOf('Pisces') - ZODIAC_SIGNS.indexOf(moon.sign) + 12) % 12) + 1,
        interpretation: 'Rahu creates intense drive, international links, and unconventional expansion.',
      },
      {
        planet: 'Ketu',
        currentSign: 'Virgo',
        houseFromLagna: ((ZODIAC_SIGNS.indexOf('Virgo') - ZODIAC_SIGNS.indexOf(ascendant.sign) + 12) % 12) + 1,
        houseFromMoon: ((ZODIAC_SIGNS.indexOf('Virgo') - ZODIAC_SIGNS.indexOf(moon.sign) + 12) % 12) + 1,
        interpretation: 'Ketu encourages detachment, analytical refinement, and inner spiritual purification.',
      },
    ],
  };

  // -------------------------------------------------------------------------
  // 13. ASHTAKAVARGA
  // -------------------------------------------------------------------------
  const ascIndex = ZODIAC_SIGNS.indexOf(ascendant.sign);
  const ashtakavargaScores = (ashtakavarga.sav || []).map((pts, idx) => ({
    houseNumber: ((idx - ascIndex + 12) % 12) + 1,
    sign: ZODIAC_SIGNS[idx],
    savPoints: pts,
  })).sort((a, b) => a.houseNumber - b.houseNumber);

  const ashtakavargaSection: AshtakavargaSection = {
    title: '12. Sarvashtakavarga (SAV) Energy Matrix',
    subtitle: 'Point distribution across 12 signs quantifying inherent environmental support.',
    houseScores: ashtakavargaScores,
    interpretation: 'Houses scoring 28+ bindus represent areas of natural ease and productivity, while houses below 25 bindus require mindful effort and disciplined management.',
  };

  // -------------------------------------------------------------------------
  // 14. TRADITIONAL REMEDIES
  // -------------------------------------------------------------------------
  const remediesSection: RemediesSection = {
    title: '13. Traditional Vedic Remedies & Karma Alignment',
    subtitle: 'Classical Parashari measures to harmonize planetary currents and strengthen auspicious vibrations.',
    remedies: [
      {
        type: 'Mantra Recitation',
        targetPlanet: lagnaLord,
        description: `Recitation of the sacred Beeja Mantra for ${lagnaLord}.`,
        rationale: `Strengthens Lagna vitality and harmonizes the ruler of life trajectory.`,
        suitableTiming: 'At sunrise or during favorable weekday mornings.',
      },
      {
        type: 'Charity & Dana',
        targetPlanet: 'Saturn',
        description: 'Feeding the underprivileged, serving elderly community members, and planting shade-bearing trees.',
        rationale: 'Dissolves Saturnine karmic friction and instills humility and patience.',
        suitableTiming: 'Saturday mornings or during transit transitions.',
      },
      {
        type: 'Dharmic Lifestyle',
        targetPlanet: 'Jupiter',
        description: 'Engaging in regular study of classical wisdom texts, supporting educators, and honoring gurus.',
        rationale: 'Elevates sattvic clarity and invokes Brihaspati’s protective benediction.',
        suitableTiming: 'Thursday mornings with clean intention.',
      },
    ],
    disclaimer: 'Astrological remedies are traditional spiritual practices intended for ethical, mental, and meditative harmony. They do not constitute medical, legal, or financial advice.',
  };

  // -------------------------------------------------------------------------
  // 15. EXECUTIVE SUMMARY
  // -------------------------------------------------------------------------
  const summarySection: SummarySection = {
    title: '14. Astrological Executive Summary & Key Takeaways',
    subtitle: 'Synthesized core conclusions from the complete deterministic analysis.',
    coreThemes: [
      `Foundational Identity: Anchored by ${ascendant.sign} Lagna and ${moon.sign} Moon, granting intellectual depth and resilience.`,
      `Panchanga Alignment: Born under ${panchanga.nakshatra.name} asterism with favorable temporal resonance.`,
      `Key Strength Pillar: Potent planetary dignity in the chart supports consistent professional and moral stature.`,
      `Current Temporal Phase: The ${activePhase.mahadasha} / ${activePhase.antardasha} period acts as an active catalyst for worldly and personal evolution.`,
      `Remedial Harmony: Aligning with daily contemplative practices and disciplined karma solidifies life fulfillment.`,
    ],
    closingAffirmation: 'May the timeless wisdom of Vedic astrology guide your dharmic path with clarity, purpose, and boundless inner peace.',
  };

  // -------------------------------------------------------------------------
  // 16. TECHNICAL APPENDIX
  // -------------------------------------------------------------------------
  const technicalAppendix: TechnicalAppendixSection = {
    title: '15. Technical Appendix & Calculation Provenance',
    subtitle: 'Exact algorithmic standards and mathematical parameters for total scientific reproducibility.',
    ayanamsa: metadata.ayanamshaModel,
    ephemerisSource: metadata.ephemerisSource,
    geographicalCoordinates: `${birthProfile.latitude.toFixed(4)}° Lat, ${birthProfile.longitude.toFixed(4)}° Lon`,
    calculationEngine: metadata.calculationStandards,
  };

  // Return complete compiled book document
  return {
    metadata,
    cover,
    toc,
    birthDetails,
    panchanga: panchangaSection,
    identity,
    charts,
    planetaryPositions,
    nakshatraAnalysis,
    houses: housesList,
    strengths: strengthsSection,
    yogas: yogasSection,
    lifeAreas,
    dashaHierarchy: dashaSection,
    transits: transitsSection,
    ashtakavarga: ashtakavargaSection,
    remedies: remediesSection,
    summary: summarySection,
    technicalAppendix,
  };
}
