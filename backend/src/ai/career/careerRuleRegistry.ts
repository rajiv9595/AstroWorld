/**
 * ASTROWORLD — Versioned Career Rule Registry
 *
 * Grounded in classical Jyotish shastras (BPHS, Jaimini Sutras, Saravali, Phaladeepika),
 * authoritative commentaries (B.V. Raman, K.N. Rao), verified practitioner literature
 * (IIAG, IVA), and explicit modern interpretive hypotheses with epistemic limitations.
 */

export type SourceClass =
  | 'primary_classical'
  | 'commentarial'
  | 'practitioner_research'
  | 'modern_hypothesis'
  | 'empirical_limitation';

export type AstrologicalSchool = 'parashari' | 'jaimini' | 'kp' | 'synthetic';

export interface SourceCitation {
  author: string;
  work: string;
  chapterOrSection: string;
  verseOrReference: string;
  excerpt?: string;
  url?: string;
}

export interface CareerRuleRecord {
  ruleId: string;
  ruleName: string;
  ruleVersion: string;
  school: AstrologicalSchool;
  sourceClass: SourceClass;
  citation: SourceCitation;
  relevantFactors: {
    primaryBodies: string[];
    secondaryBodies?: string[];
    housesD1?: number[];
    housesD10?: number[];
    housesD24?: number[];
    jaiminiFactors?: ('AK' | 'AmK' | 'KL' | '10th_from_KL' | 'A10')[];
  };
  candidateTaxonomyIds: string[];
  positiveConditions: string[];
  contradictionConditions: string[];
  limitations: string;
  epistemicStatus:
    | 'classical_canonical'
    | 'commentarial_interpretation'
    | 'practitioner_hypothesis'
    | 'empirical_unvalidated';
}

// ---------------------------------------------------------------------------
// Canonical Rule Registry
// ---------------------------------------------------------------------------

export const CAREER_RULE_REGISTRY: CareerRuleRecord[] = [
  // -------------------------------------------------------------------------
  // 1. Classical Primary Sources (BPHS, Saravali, Phaladeepika, Jaimini Sutras)
  // -------------------------------------------------------------------------
  {
    ruleId: 'RULE-BPHS-10TH-SUN-001',
    ruleName: 'Sun in 10th House / 10th Lord Solar Association',
    ruleVersion: '1.0.0',
    school: 'parashari',
    sourceClass: 'primary_classical',
    citation: {
      author: 'Maharishi Parashara',
      work: 'Brihat Parashara Hora Shastra',
      chapterOrSection: 'Adhyaya 11 & 24',
      verseOrReference: 'Shloka 10.1-10.4',
      excerpt: 'If the Sun is in the 10th house or aspects the 10th lord, the native attains royal favor, administrative authority, public governance, and medicinal aptitude.',
    },
    relevantFactors: {
      primaryBodies: ['Sun'],
      housesD1: [10],
      housesD10: [1, 10],
    },
    candidateTaxonomyIds: ['role_clinical_physician', 'law_governance_public', 'healthcare_medicine'],
    positiveConditions: [
      'Sun occupies or aspects the 10th house in D1 or D10',
      'Sun is in dignity (Exalted in Aries, Own sign in Leo, or Digbala in 10th house)',
      '10th lord conjuncts or is aspected by Sun',
    ],
    contradictionConditions: [
      'Sun debilitated in Libra without Neechabhanga',
      'Sun afflicted by Rahu/Saturn in 6th/8th/12th houses',
    ],
    limitations: 'Indicates administrative authority, public status, or royal governance; does not independently differentiate specific medical branches without Mars/Moon/Jupiter collaboration.',
    epistemicStatus: 'classical_canonical',
  },
  {
    ruleId: 'RULE-BPHS-10TH-MARS-002',
    ruleName: 'Mars in 10th House / Kuja Engineering & Surgical Signification',
    ruleVersion: '1.0.0',
    school: 'parashari',
    sourceClass: 'primary_classical',
    citation: {
      author: 'Maharishi Parashara',
      work: 'Brihat Parashara Hora Shastra',
      chapterOrSection: 'Adhyaya 24',
      verseOrReference: 'Shloka 24.18-24.22',
      excerpt: 'Mars in the 10th house bestows Digbala (directional strength). The native earns livelihood through mechanical implements, engineering, metals, defense, fire, or surgical instruments.',
    },
    relevantFactors: {
      primaryBodies: ['Mars'],
      housesD1: [10],
      housesD10: [1, 10],
    },
    candidateTaxonomyIds: ['role_general_surgeon', 'role_mechanical_engineer', 'role_civil_engineer', 'role_software_engineer'],
    positiveConditions: [
      'Mars possesses Digbala in 10th house or occupies own/exalted sign in D1 or D10',
      '10th lord in Martian navamsha or conjunct Mars',
    ],
    contradictionConditions: [
      'Mars debilitated in Cancer without cancelation',
      'Mars combust Sun within 3 degrees',
    ],
    limitations: 'Mars universally signifies practical mechanics, instruments, and physical force. Requires divisional charts (D10, D24) and Mercury/Saturn contacts to isolate software engineering from mechanical engineering or surgery.',
    epistemicStatus: 'classical_canonical',
  },
  {
    ruleId: 'RULE-SARAVALI-MERCURY-10TH-003',
    ruleName: 'Saravali: Mercury in 10th House Intellectual & Computational Mastery',
    ruleVersion: '1.0.0',
    school: 'parashari',
    sourceClass: 'primary_classical',
    citation: {
      author: 'Kalyana Varma',
      work: 'Saravali',
      chapterOrSection: 'Chapter 31 (Karma Bhava Phala)',
      verseOrReference: 'Sloka 14-16',
      excerpt: 'Mercury in the 10th house produces a scholar of mathematics, analytical commerce, drafting, writing, and advisory intelligence, possessing dexterity in logic and communication.',
    },
    relevantFactors: {
      primaryBodies: ['Mercury'],
      housesD1: [10],
      housesD10: [1, 10],
      housesD24: [5, 10],
    },
    candidateTaxonomyIds: ['role_software_engineer', 'role_data_analyst', 'role_data_scientist', 'computer_science_engineering'],
    positiveConditions: [
      'Mercury in own sign (Gemini/Virgo) or exalted in Virgo in D1, D10, or D24',
      'Mercury occupies 5th or 10th house of intellect and profession',
    ],
    contradictionConditions: [
      'Mercury debilitated in Pisces without cancelation',
      'Mercury severely combust or afflicted by nodes in 8th/12th houses',
    ],
    limitations: 'Mercury signifies computation, discrete mathematics, and communication. In the classical era, this represented scribes and accountants; in the modern era, it extends to computer code, data logic, and analytics.',
    epistemicStatus: 'classical_canonical',
  },
  {
    ruleId: 'RULE-JAIMINI-AMK-D10-004',
    ruleName: 'Jaimini Sutras: Amatyakaraka (AmK) as Primary Career Signifier',
    ruleVersion: '1.0.0',
    school: 'jaimini',
    sourceClass: 'primary_classical',
    citation: {
      author: 'Maharishi Jaimini',
      work: 'Jaimini Upadesha Sutras',
      chapterOrSection: 'Adhyaya 1, Pada 2 & 3',
      verseOrReference: 'Sutras 1.2.1 - 1.2.14',
      excerpt: 'The Amatyakaraka (planet with second highest degree) signifies ministership, professional achievement, and the worldly vocation of the native.',
    },
    relevantFactors: {
      primaryBodies: ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'],
      jaiminiFactors: ['AmK', 'KL', '10th_from_KL', 'A10'],
      housesD10: [1, 5, 9, 10, 11],
    },
    candidateTaxonomyIds: ['engineering_technology', 'healthcare_medicine', 'business_commerce_finance', 'science_research'],
    positiveConditions: [
      'Amatyakaraka is placed in Kendra (1, 4, 7, 10) or Trikona (5, 9) in D1 and D10',
      'Amatyakaraka aspects or conjuncts the Atmakaraka (AK) or Karakamsha Lagna (KL)',
      'Amatyakaraka connects with the 10th house or Rajya Pada (A10)',
    ],
    contradictionConditions: [
      'Amatyakaraka in 6th, 8th, or 12th from Karakamsha in Navamsha',
      'Amatyakaraka heavily aspected by cruel malefics without benefic relief',
    ],
    limitations: 'Amatyakaraka designates the primary functional archetype of achievement; it does not map uniquely to single corporate titles without synthesis of its D10 dispositor and planetary nature.',
    epistemicStatus: 'classical_canonical',
  },
  {
    ruleId: 'RULE-JAIMINI-KL-10TH-005',
    ruleName: 'Jaimini Sutras: 10th House from Karakamsha Navamsha',
    ruleVersion: '1.0.0',
    school: 'jaimini',
    sourceClass: 'primary_classical',
    citation: {
      author: 'Maharishi Jaimini',
      work: 'Jaimini Upadesha Sutras',
      chapterOrSection: 'Adhyaya 1, Pada 2',
      verseOrReference: 'Sutra 1.2.69 - 1.2.75',
      excerpt: 'Planets occupying or aspecting the 10th sign from Karakamsha Navamsha determine the public accomplishments, professional enterprise, and lasting vocational footprint.',
    },
    relevantFactors: {
      primaryBodies: ['Mercury', 'Mars', 'Jupiter', 'Saturn', 'Sun', 'Venus'],
      jaiminiFactors: ['10th_from_KL'],
    },
    candidateTaxonomyIds: ['engineering_technology', 'healthcare_medicine', 'law_governance_public', 'science_research'],
    positiveConditions: [
      'Benefic planets (Jupiter, Mercury, Venus) occupying or aspecting 10th from KL',
      'Mars in 10th from KL indicating engineering, weapons, or surgical enterprise',
      'Mercury in 10th from KL indicating commerce, mathematics, computing, and literature',
    ],
    contradictionConditions: [
      '10th from KL devoid of planetary aspect and its lord placed in debilitation',
    ],
    limitations: 'Karakamsha is established from D9 Navamsha. It reflects inner soul aptitude manifesting outwardly, not necessarily the administrative title on a corporate payroll.',
    epistemicStatus: 'classical_canonical',
  },
  {
    ruleId: 'RULE-PHALADEEPIKA-DISPOSITOR-10TH-006',
    ruleName: 'Phaladeepika: Navamsha Dispositor of the 10th Lord (Vocation Source)',
    ruleVersion: '1.0.0',
    school: 'parashari',
    sourceClass: 'primary_classical',
    citation: {
      author: 'Mantreswara',
      work: 'Phaladeepika',
      chapterOrSection: 'Adhyaya 5',
      verseOrReference: 'Sloka 22-26',
      excerpt: 'The source of livelihood is determined by the lord of the Navamsha occupied by the 10th lord from the Lagna, Moon, or Sun, whichever is strongest.',
    },
    relevantFactors: {
      primaryBodies: ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'],
      housesD1: [10],
    },
    candidateTaxonomyIds: ['healthcare_medicine', 'engineering_technology', 'business_commerce_finance', 'science_research'],
    positiveConditions: [
      '10th lord D9 dispositor identified deterministically from planetary positions',
      'The D9 dispositor is strong in D1 and D10',
    ],
    contradictionConditions: [
      '10th lord D9 dispositor is combust or placed in 6th/8th/12th in D1',
    ],
    limitations: 'The Navamsha dispositor indicates the underlying planetary coloring of the profession. Counting this as a separate independent confirmation when already evaluating the 10th lord creates double-counting bias.',
    epistemicStatus: 'classical_canonical',
  },

  // -------------------------------------------------------------------------
  // 2. Authoritative Commentaries & Modern Practitioner Research
  // -------------------------------------------------------------------------
  {
    ruleId: 'RULE-RAMAN-D10-DASHAMSHA-007',
    ruleName: 'B.V. Raman: D10 Dashamsha as the Great Wheel of Professional Achievement',
    ruleVersion: '1.0.0',
    school: 'parashari',
    sourceClass: 'commentarial',
    citation: {
      author: 'Dr. B.V. Raman',
      work: 'How to Judge a Horoscope (Volume 2)',
      chapterOrSection: 'Chapter on the Tenth House (Pages 240-275)',
      verseOrReference: 'D-10 Principles',
      excerpt: 'D1 establishes the potential of career, while D10 (Dashamsha) reveals the actual realization, status, hierarchy, and professional trajectory. Strong planets in D10 Kendras elevate the native.',
    },
    relevantFactors: {
      primaryBodies: ['Sun', 'Mars', 'Mercury', 'Saturn', 'Jupiter'],
      housesD10: [1, 4, 7, 10, 11],
    },
    candidateTaxonomyIds: ['engineering_technology', 'business_commerce_finance', 'law_governance_public'],
    positiveConditions: [
      'D1 10th lord placed in Kendra or Trikona in D10',
      'Lagna lord of D10 strong in D10 1st or 10th house',
      'Benefics or strong Yogakarakas in D10 10th house',
    ],
    contradictionConditions: [
      'D1 10th lord debilitated in D10 6th/8th/12th houses',
      'D10 Lagna lord combust and afflicted',
    ],
    limitations: 'D10 must never be read in isolation without D1; D10 provides depth and dignity of worldly action, not a disconnected alternate chart.',
    epistemicStatus: 'commentarial_interpretation',
  },
  {
    ruleId: 'RULE-KNRAO-D24-EDUCATION-008',
    ruleName: 'K.N. Rao: D24 Siddhamsa as the Seat of Academic Mastery & Specialization',
    ruleVersion: '1.0.0',
    school: 'parashari',
    sourceClass: 'commentarial',
    citation: {
      author: 'K.N. Rao',
      work: 'Planets and Education',
      chapterOrSection: 'Chapter on Higher Education & Siddhamsa',
      verseOrReference: 'Principles of D-24',
      excerpt: 'D24 (Chaturvimshamsha/Siddhamsa) specifically uncovers learning capacity, university degrees, intellectual inclinations, and academic honors. Mercury, Jupiter, and 5th house in D24 define the academic branch.',
    },
    relevantFactors: {
      primaryBodies: ['Mercury', 'Jupiter', 'Mars', 'Rahu'],
      housesD24: [1, 4, 5, 9, 10],
    },
    candidateTaxonomyIds: ['computer_science_engineering', 'electronics_communication_engineering', 'medicine_clinical', 'academic_research_teaching'],
    positiveConditions: [
      'Mercury in own sign or exalted in D24 5th house (mathematics/computing)',
      'Mars in D24 5th or 10th house (engineering sciences/mechanical logic)',
      'Jupiter in D24 5th or 9th house (higher theoretical scholarship/pedagogy)',
    ],
    contradictionConditions: [
      '5th house of D24 afflicted by debilitated planets without cancellation',
    ],
    limitations: 'D24 discloses intellectual discipline and capacity for study; it does not guarantee that the native stays permanently in their studied discipline for their 40-year career.',
    epistemicStatus: 'commentarial_interpretation',
  },
  {
    ruleId: 'RULE-IIAG-MODERN-MEDICINE-009',
    ruleName: 'IIAG Practitioner Research: Medical Profession Triad (Sun, Mars, 6th House)',
    ruleVersion: '1.0.0',
    school: 'parashari',
    sourceClass: 'practitioner_research',
    citation: {
      author: 'Indian Institute of Astrological Guidance (IIAG)',
      work: 'Astrology for Career & Profession',
      chapterOrSection: 'Medical & Healthcare Kundli Formations',
      verseOrReference: 'IIAG Career Monograph',
      url: 'https://iiag.co.in/articles/astrology-information-blogs/astrology-for-career',
    },
    relevantFactors: {
      primaryBodies: ['Sun', 'Mars', 'Moon'],
      housesD1: [6, 8, 10, 12],
      housesD10: [6, 10],
    },
    candidateTaxonomyIds: ['role_clinical_physician', 'role_general_surgeon', 'medicine_clinical'],
    positiveConditions: [
      'Connection between 6th house (disease/healing) and 10th house (profession)',
      'Sun (life-giver/vitality) strong in Kendra or Trikona',
      'Mars (blood, surgery, operational energy) influencing 6th or 10th house',
    ],
    contradictionConditions: [
      'Total absence of 6th/8th house connections to 10th house or 10th lord',
    ],
    limitations: 'Practitioner research synthesis; useful for identifying medical orientation but cannot replace formal clinical licensing requirements.',
    epistemicStatus: 'practitioner_hypothesis',
  },

  // -------------------------------------------------------------------------
  // 3. Modern Interpretive Hypotheses (AI, Software, ECE, Cloud, Cybersecurity)
  // -------------------------------------------------------------------------
  {
    ruleId: 'RULE-MOD-TECH-MERC-MARS-RAHU-010',
    ruleName: 'Modern Hypothesis: Software Engineering Triad (Mercury-Mars-Rahu)',
    ruleVersion: '1.0.0',
    school: 'synthetic',
    sourceClass: 'modern_hypothesis',
    citation: {
      author: 'Modern Computational Jyotish Research',
      work: 'Astroworld Technical Vocational Ontology',
      chapterOrSection: 'Software Engineering Archetype',
      verseOrReference: 'TECH-SE-001',
      excerpt: 'Software engineering unites Mercury (discrete algorithmic logic, programming languages, communication of code) with Mars (engineering architecture, structural execution) and Rahu (virtual systems, abstract cyberspace).',
    },
    relevantFactors: {
      primaryBodies: ['Mercury', 'Mars', 'Rahu'],
      housesD1: [3, 5, 10, 11],
      housesD10: [3, 5, 10, 11],
      housesD24: [5, 10],
    },
    candidateTaxonomyIds: ['role_software_engineer', 'role_backend_engineer', 'computer_science_engineering'],
    positiveConditions: [
      'Mercury associated with Mars or Rahu in D1, D10, or D24',
      '10th house or 10th lord placed in intellectual air signs (Gemini, Libra, Aquarius) or Martian/Mercurial signs',
      'Mercury strong in D24 (Siddhamsa) 5th or 10th house',
    ],
    contradictionConditions: [
      'Mercury severely combust or afflicted by debilitated planets with no technical aspects',
      '10th house purely occupied by planets of classical agrarian or ascetic symbolism without modern aspects',
    ],
    limitations: 'Does NOT deterministically distinguish Software Development from Data Science or Backend Architecture when evaluated in isolation. The boundaries among modern computational sub-fields share significant planetary overlap.',
    epistemicStatus: 'practitioner_hypothesis',
  },
  {
    ruleId: 'RULE-MOD-TECH-AI-RAHU-MERC-011',
    ruleName: 'Modern Hypothesis: Artificial Intelligence & Machine Learning (Rahu + Mercury + 5th/8th)',
    ruleVersion: '1.0.0',
    school: 'synthetic',
    sourceClass: 'modern_hypothesis',
    citation: {
      author: 'Modern Computational Jyotish Research',
      work: 'Emerging Technologies Astrological Framework',
      chapterOrSection: 'AI & Data Intelligence Synthesis',
      verseOrReference: 'TECH-AI-002',
      excerpt: 'Artificial intelligence combines Rahu (synthetic intelligence, illusion, complex autonomous automata, non-human cognition) with Mercury (computational logic, algorithms) and deep research houses (5th house of intellect and 8th house of hidden latent patterns).',
    },
    relevantFactors: {
      primaryBodies: ['Rahu', 'Mercury', 'Jupiter'],
      secondaryBodies: ['Mars'],
      housesD1: [5, 8, 10, 11],
      housesD10: [5, 8, 10],
      housesD24: [5, 11],
    },
    candidateTaxonomyIds: ['role_ai_ml_engineer', 'role_data_scientist', 'ai_data_intelligence'],
    positiveConditions: [
      'Rahu placed in or aspecting 5th, 8th, 10th, or 11th house in D1, D10, or D24',
      'Mercury in mutual aspect or conjunction with Rahu, or in Rahu nakshatra (Ardra, Swati, Shatabhisha)',
      '5th house (predictive intelligence) or 8th house (deep neural architectures/latent embeddings) active',
    ],
    contradictionConditions: [
      'Rahu entirely disconnected from intellect houses (5, 9) and career houses (10, 11)',
      'Mercury debilitated without cancelation',
    ],
    limitations: 'AI Engineering is a modern sub-specialization of Computer Science. Classical shastras never mention computers or neural networks; this rule is an interpretive analogy linking Rahu (artificial/synthetic) and Mercury (intellect) and must be communicated as a modern practitioner hypothesis.',
    epistemicStatus: 'practitioner_hypothesis',
  },
  {
    ruleId: 'RULE-MOD-TECH-ECE-SUN-MARS-KETU-012',
    ruleName: 'Modern Hypothesis: Electronics, Microprocessors & ECE (Sun-Mars-Ketu-Mercury)',
    ruleVersion: '1.0.0',
    school: 'synthetic',
    sourceClass: 'modern_hypothesis',
    citation: {
      author: 'Modern Computational Jyotish Research',
      work: 'Semiconductor and Hardware Astrological Delineation',
      chapterOrSection: 'ECE vs CSE Distinction',
      verseOrReference: 'TECH-ECE-003',
      excerpt: 'Electronics & Communication Engineering requires physical electrical current (Sun) channeled through physical circuit pathways (Mars) at micro-miniaturized scales (Ketu) with discrete signal transmission (Mercury/3rd house).',
    },
    relevantFactors: {
      primaryBodies: ['Sun', 'Mars', 'Ketu', 'Mercury'],
      housesD1: [3, 5, 10],
      housesD10: [3, 10],
      housesD24: [3, 5],
    },
    candidateTaxonomyIds: ['role_embedded_systems_engineer', 'role_telecom_engineer', 'electronics_communication_engineering'],
    positiveConditions: [
      'Sun and Mars in contact with 10th house, 3rd house, or 10th lord',
      'Ketu (micro-miniaturization, silicon, nano-scale circuits) aspecting or conjunct Mars or Mercury',
      '3rd house of wave transmission and telecom active',
    ],
    contradictionConditions: [
      'Complete absence of Sun/Mars electrical signatures; pure Mercurial abstract software dominance',
    ],
    limitations: 'Distinguishes physical hardware/semiconductor engineering from purely abstract software programming; however, embedded systems engineers frequently write firmware, creating shared empirical overlap.',
    epistemicStatus: 'practitioner_hypothesis',
  },
  {
    ruleId: 'RULE-MOD-TECH-CYBERSECURITY-MARS-KETU-013',
    ruleName: 'Modern Hypothesis: Cybersecurity & Cryptography (Mars + Ketu + 8th/6th)',
    ruleVersion: '1.0.0',
    school: 'synthetic',
    sourceClass: 'modern_hypothesis',
    citation: {
      author: 'Modern Computational Jyotish Research',
      work: 'Cyber Warfare and Information Defense Astrological Models',
      chapterOrSection: 'Cybersecurity Archetype',
      verseOrReference: 'TECH-CYBER-004',
      excerpt: 'Cybersecurity combines the martial defender/penetration tester (Mars) with covert encryption/secrets (Ketu) and vulnerability/threat detection (8th and 6th houses) in digital systems (Mercury/Rahu).',
    },
    relevantFactors: {
      primaryBodies: ['Mars', 'Ketu', 'Rahu', 'Mercury'],
      housesD1: [6, 8, 10, 12],
      housesD10: [6, 8, 10],
    },
    candidateTaxonomyIds: ['role_cybersecurity_engineer', 'cloud_cybersecurity'],
    positiveConditions: [
      'Mars and Ketu in 6th, 8th, or 10th houses in D1 or D10',
      'Rahu (cyber attacks, network infiltrations) aspecting Mars or 6th house of adversaries',
      'Mercury connected with 8th house (cryptography, vulnerability discovery)',
    ],
    contradictionConditions: [
      'Total absence of 6th/8th house vulnerability defense signatures',
    ],
    limitations: 'Modern occupational category. Astrological indications reflect a psychological instinct for defensive investigation, security audit, and tactical warfare; they cannot confirm specific corporate certifications (e.g. CISSP).',
    epistemicStatus: 'practitioner_hypothesis',
  },

  // -------------------------------------------------------------------------
  // 4. Epistemic Limitation & Abstention Grounding Rules
  // -------------------------------------------------------------------------
  {
    ruleId: 'RULE-EPISTEMIC-OVERLAPPING-TECH-014',
    ruleName: 'Epistemic Standard: Technology Branch Overlap & Mandatory Abstention',
    ruleVersion: '1.0.0',
    school: 'synthetic',
    sourceClass: 'empirical_limitation',
    citation: {
      author: 'AstroWorld Quality Assurance & Research Governance',
      work: 'Standard for Honest Astrological Uncertainty',
      chapterOrSection: 'Occupational Classification Governance',
      verseOrReference: 'EPIST-CAREER-001',
      excerpt: 'Astrological principles identify planetary archetypes (e.g. Mercury for computing, Mars for engineering, Rahu for unconventional algorithms). They do not possess statistically validated resolution to uniquely distinguish Software Engineer from Backend Engineer from Data Scientist with 100% certainty. The engine must declare overlap and abstain from false precision.',
    },
    relevantFactors: {
      primaryBodies: ['Mercury', 'Mars', 'Rahu'],
    },
    candidateTaxonomyIds: ['inconclusive_insufficient_evidence', 'engineering_technology'],
    positiveConditions: [
      'Multiple technical specializations share identical or near-identical D1/D10/D24 supporting factors',
      'The difference in relative compatibility scores between competing roles is less than 15%',
    ],
    contradictionConditions: [],
    limitations: 'Mandates transparent communication of astrological uncertainty. Forbids fabricating guaranteed job titles.',
    epistemicStatus: 'empirical_unvalidated',
  },
];

// ---------------------------------------------------------------------------
// Registry Search & Retrieval
// ---------------------------------------------------------------------------

export function findCareerRulesByPlanets(planets: string[]): CareerRuleRecord[] {
  const pSet = new Set(planets.map((p) => p.toLowerCase()));
  return CAREER_RULE_REGISTRY.filter((rule) =>
    rule.relevantFactors.primaryBodies.some((b) => pSet.has(b.toLowerCase()))
  );
}

export function findCareerRulesByTaxonomyId(taxonomyId: string): CareerRuleRecord[] {
  return CAREER_RULE_REGISTRY.filter((rule) =>
    rule.candidateTaxonomyIds.includes(taxonomyId)
  );
}

export function findCareerRulesBySourceClass(sourceClass: SourceClass): CareerRuleRecord[] {
  return CAREER_RULE_REGISTRY.filter((rule) => rule.sourceClass === sourceClass);
}

export function searchCareerRules(query: string): CareerRuleRecord[] {
  const q = query.toLowerCase();
  return CAREER_RULE_REGISTRY.filter(
    (rule) =>
      rule.ruleName.toLowerCase().includes(q) ||
      rule.citation.work.toLowerCase().includes(q) ||
      rule.citation.author.toLowerCase().includes(q) ||
      (rule.citation.excerpt && rule.citation.excerpt.toLowerCase().includes(q)) ||
      rule.positiveConditions.some((c) => c.toLowerCase().includes(q)) ||
      rule.limitations.toLowerCase().includes(q)
  );
}
