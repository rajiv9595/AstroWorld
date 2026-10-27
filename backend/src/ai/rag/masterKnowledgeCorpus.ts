/**
 * ASTROWORLD — Master Grounded Knowledge Corpus
 * Compiled from the 8 Primary Shastric & Empirical Treatises in datasets/Knowledge:
 * 1. AIFAS Timing of Events through Dasha and Transit (Shri S.K. Sawhney / K.N. Rao)
 * 2. Systems' Approach to Interpreting Horoscopes (Prof. V.K. Choudhry)
 * 3. The Real Secret of Vedic Astrology — Nakshatras (Acharya Bharat)
 * 4. Education and Astrology (Modern Computer, Software, Hardware & Aerospace Rules)
 * 5. How to Time New Job (KP Cuspal Sublord & Ruling Planet Mechanics)
 * 6. The ABC of Flawless Advanced Numerology (Cheiro & Vedic Compound Numbers 1-52)
 */

import { KnowledgeRecord } from '../schemas/knowledgeRecord.ts';

export const MASTER_KNOWLEDGE_CORPUS: KnowledgeRecord[] = [
  {
    "id": "SYS-APP-001",
    "sourceText": "Systems' Approach to Interpreting Horoscopes",
    "author": "Prof. V.K. Choudhry",
    "chapter": "Foundations of Systems' Approach",
    "sectionOrShloka": "Moolatrikona & Functional Nature Principle",
    "citation": "Systems' Approach (Choudhry), Ch. 1: Functional Malefic Identification",
    "originalSanskrit": "\u0924\u094d\u0930\u093f\u0915\u094b\u0923\u092d\u0935\u0928\u093e\u0927\u093f\u092a\u093e\u0903 \u0936\u0941\u092d\u093e\u0903 (Parashari Foundation)",
    "canonicalTranslation": "A planet is deemed a Functional Malefic (FM) for an ascendant strictly when its Moolatrikona sign falls in a Dusthana (6th, 8th, or 12th house). If its Moolatrikona sign does not fall in a Dusthana, it is a Functional Benefic (FB). Rahu and Ketu are functional malefics for all twelve ascendants. There are no neutral planets in this empirical system.",
    "normalizedInterpretation": "Systems Approach eliminates subjective neutrality: a planet's functional character is 100% determined by whether its Moolatrikona sign occupies houses 6, 8, or 12 from Lagna. Sun's MT is Leo (5), Moon's MT is Cancer (4), Mars's MT is Aries (1), Mercury's MT is Virgo (6), Jupiter's MT is Sagittarius (9), Venus's MT is Libra (7), and Saturn's MT is Aquarius (11).",
    "metadata": {
      "tradition": "empirical_modern",
      "topic": "systems_approach",
      "subtopic": "functional_benefic_malefic_rule",
      "ruleType": "general_principle",
      "planetarySubjects": [
        "Sun",
        "Moon",
        "Mars",
        "Mercury",
        "Jupiter",
        "Venus",
        "Saturn",
        "Rahu",
        "Ketu"
      ],
      "houseSubjects": [
        6,
        8,
        12,
        1
      ],
      "signSubjects": [
        "Aries",
        "Taurus",
        "Gemini",
        "Cancer",
        "Leo",
        "Virgo",
        "Libra",
        "Scorpio",
        "Sagittarius",
        "Capricorn",
        "Aquarius",
        "Pisces"
      ],
      "vargaSubjects": [
        "D1"
      ],
      "authorityLevel": "authoritative_commentary",
      "tags": [
        "systems_approach",
        "vk_choudhry",
        "moolatrikona",
        "functional_malefic",
        "functional_benefic"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "SYS-APP-0002",
    "sourceText": "Systems' Approach to Interpreting Horoscopes",
    "author": "Prof. V.K. Choudhry",
    "chapter": "Ascendant Functional Nature Matrix",
    "sectionOrShloka": "Aries Ascendant Functional Malefics",
    "citation": "Systems' Approach (Choudhry), Ch. 2: Aries Lagna Malefics",
    "canonicalTranslation": "For Aries Ascendant, the Functional Malefics are strictly: Mercury, Rahu, Ketu. All other planets having Moolatrikona signs outside Dusthanas are Functional Benefics.",
    "normalizedInterpretation": "In Aries Lagna charts: Mercury rules 6th (Virgo MT); Mars owns 1st (Aries MT - benefic); Rahu/Ketu always FM. Operating periods of Mercury, Rahu, Ketu trigger challenges, delays, or health/financial stress, while periods of functional benefics yield stability and growth.",
    "metadata": {
      "tradition": "empirical_modern",
      "topic": "systems_approach",
      "subtopic": "aries_lagna_functional_profile",
      "ruleType": "house_lord_rule",
      "planetarySubjects": [
        "Mercury",
        "Rahu",
        "Ketu"
      ],
      "houseSubjects": [
        1,
        6,
        8,
        12
      ],
      "signSubjects": [
        "Aries"
      ],
      "vargaSubjects": [
        "D1"
      ],
      "authorityLevel": "authoritative_commentary",
      "tags": [
        "systems_approach",
        "aries",
        "functional_malefic",
        "moolatrikona"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "SYS-APP-0003",
    "sourceText": "Systems' Approach to Interpreting Horoscopes",
    "author": "Prof. V.K. Choudhry",
    "chapter": "Ascendant Functional Nature Matrix",
    "sectionOrShloka": "Taurus Ascendant Functional Malefics",
    "citation": "Systems' Approach (Choudhry), Ch. 2: Taurus Lagna Malefics",
    "canonicalTranslation": "For Taurus Ascendant, the Functional Malefics are strictly: Venus, Jupiter, Mars, Rahu, Ketu. All other planets having Moolatrikona signs outside Dusthanas are Functional Benefics.",
    "normalizedInterpretation": "In Taurus Lagna charts: Venus rules 6th (Libra MT); Jupiter rules 8th (Sagittarius MT); Mars rules 12th (Aries MT); Saturn rules 10th (Aquarius MT - supreme benefic). Operating periods of Venus, Jupiter, Mars, Rahu, Ketu trigger challenges, delays, or health/financial stress, while periods of functional benefics yield stability and growth.",
    "metadata": {
      "tradition": "empirical_modern",
      "topic": "systems_approach",
      "subtopic": "taurus_lagna_functional_profile",
      "ruleType": "house_lord_rule",
      "planetarySubjects": [
        "Venus",
        "Jupiter",
        "Mars",
        "Rahu",
        "Ketu"
      ],
      "houseSubjects": [
        1,
        6,
        8,
        12
      ],
      "signSubjects": [
        "Taurus"
      ],
      "vargaSubjects": [
        "D1"
      ],
      "authorityLevel": "authoritative_commentary",
      "tags": [
        "systems_approach",
        "taurus",
        "functional_malefic",
        "moolatrikona"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "SYS-APP-0004",
    "sourceText": "Systems' Approach to Interpreting Horoscopes",
    "author": "Prof. V.K. Choudhry",
    "chapter": "Ascendant Functional Nature Matrix",
    "sectionOrShloka": "Gemini Ascendant Functional Malefics",
    "citation": "Systems' Approach (Choudhry), Ch. 2: Gemini Lagna Malefics",
    "canonicalTranslation": "For Gemini Ascendant, the Functional Malefics are strictly: Rahu, Ketu. All other planets having Moolatrikona signs outside Dusthanas are Functional Benefics.",
    "normalizedInterpretation": "In Gemini Lagna charts: No planetary Moolatrikona sign falls in 6th, 8th, or 12th. Gemini has the cleanest functional benefic status with only Rahu and Ketu as FMs. Operating periods of Rahu, Ketu trigger challenges, delays, or health/financial stress, while periods of functional benefics yield stability and growth.",
    "metadata": {
      "tradition": "empirical_modern",
      "topic": "systems_approach",
      "subtopic": "gemini_lagna_functional_profile",
      "ruleType": "house_lord_rule",
      "planetarySubjects": [
        "Rahu",
        "Ketu"
      ],
      "houseSubjects": [
        1,
        6,
        8,
        12
      ],
      "signSubjects": [
        "Gemini"
      ],
      "vargaSubjects": [
        "D1"
      ],
      "authorityLevel": "authoritative_commentary",
      "tags": [
        "systems_approach",
        "gemini",
        "functional_malefic",
        "moolatrikona"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "SYS-APP-0005",
    "sourceText": "Systems' Approach to Interpreting Horoscopes",
    "author": "Prof. V.K. Choudhry",
    "chapter": "Ascendant Functional Nature Matrix",
    "sectionOrShloka": "Cancer Ascendant Functional Malefics",
    "citation": "Systems' Approach (Choudhry), Ch. 2: Cancer Lagna Malefics",
    "canonicalTranslation": "For Cancer Ascendant, the Functional Malefics are strictly: Jupiter, Saturn, Rahu, Ketu. All other planets having Moolatrikona signs outside Dusthanas are Functional Benefics.",
    "normalizedInterpretation": "In Cancer Lagna charts: Jupiter rules 6th (Sagittarius MT); Saturn rules 8th (Aquarius MT); Mars rules 10th (Aries MT - Yogakaraka). Operating periods of Jupiter, Saturn, Rahu, Ketu trigger challenges, delays, or health/financial stress, while periods of functional benefics yield stability and growth.",
    "metadata": {
      "tradition": "empirical_modern",
      "topic": "systems_approach",
      "subtopic": "cancer_lagna_functional_profile",
      "ruleType": "house_lord_rule",
      "planetarySubjects": [
        "Jupiter",
        "Saturn",
        "Rahu",
        "Ketu"
      ],
      "houseSubjects": [
        1,
        6,
        8,
        12
      ],
      "signSubjects": [
        "Cancer"
      ],
      "vargaSubjects": [
        "D1"
      ],
      "authorityLevel": "authoritative_commentary",
      "tags": [
        "systems_approach",
        "cancer",
        "functional_malefic",
        "moolatrikona"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "SYS-APP-0006",
    "sourceText": "Systems' Approach to Interpreting Horoscopes",
    "author": "Prof. V.K. Choudhry",
    "chapter": "Ascendant Functional Nature Matrix",
    "sectionOrShloka": "Leo Ascendant Functional Malefics",
    "citation": "Systems' Approach (Choudhry), Ch. 2: Leo Lagna Malefics",
    "canonicalTranslation": "For Leo Ascendant, the Functional Malefics are strictly: Moon, Rahu, Ketu. All other planets having Moolatrikona signs outside Dusthanas are Functional Benefics.",
    "normalizedInterpretation": "In Leo Lagna charts: Moon rules 12th (Cancer MT); Sun owns 1st (Leo MT); Jupiter owns 5th (Sagittarius MT); Mars owns 9th (Aries MT). Operating periods of Moon, Rahu, Ketu trigger challenges, delays, or health/financial stress, while periods of functional benefics yield stability and growth.",
    "metadata": {
      "tradition": "empirical_modern",
      "topic": "systems_approach",
      "subtopic": "leo_lagna_functional_profile",
      "ruleType": "house_lord_rule",
      "planetarySubjects": [
        "Moon",
        "Rahu",
        "Ketu"
      ],
      "houseSubjects": [
        1,
        6,
        8,
        12
      ],
      "signSubjects": [
        "Leo"
      ],
      "vargaSubjects": [
        "D1"
      ],
      "authorityLevel": "authoritative_commentary",
      "tags": [
        "systems_approach",
        "leo",
        "functional_malefic",
        "moolatrikona"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "SYS-APP-0007",
    "sourceText": "Systems' Approach to Interpreting Horoscopes",
    "author": "Prof. V.K. Choudhry",
    "chapter": "Ascendant Functional Nature Matrix",
    "sectionOrShloka": "Virgo Ascendant Functional Malefics",
    "citation": "Systems' Approach (Choudhry), Ch. 2: Virgo Lagna Malefics",
    "canonicalTranslation": "For Virgo Ascendant, the Functional Malefics are strictly: Saturn, Mars, Sun, Rahu, Ketu. All other planets having Moolatrikona signs outside Dusthanas are Functional Benefics.",
    "normalizedInterpretation": "In Virgo Lagna charts: Saturn rules 6th (Aquarius MT); Mars rules 8th (Aries MT); Sun rules 12th (Leo MT); Mercury owns 1st (Virgo MT). Operating periods of Saturn, Mars, Sun, Rahu, Ketu trigger challenges, delays, or health/financial stress, while periods of functional benefics yield stability and growth.",
    "metadata": {
      "tradition": "empirical_modern",
      "topic": "systems_approach",
      "subtopic": "virgo_lagna_functional_profile",
      "ruleType": "house_lord_rule",
      "planetarySubjects": [
        "Saturn",
        "Mars",
        "Sun",
        "Rahu",
        "Ketu"
      ],
      "houseSubjects": [
        1,
        6,
        8,
        12
      ],
      "signSubjects": [
        "Virgo"
      ],
      "vargaSubjects": [
        "D1"
      ],
      "authorityLevel": "authoritative_commentary",
      "tags": [
        "systems_approach",
        "virgo",
        "functional_malefic",
        "moolatrikona"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "SYS-APP-0008",
    "sourceText": "Systems' Approach to Interpreting Horoscopes",
    "author": "Prof. V.K. Choudhry",
    "chapter": "Ascendant Functional Nature Matrix",
    "sectionOrShloka": "Libra Ascendant Functional Malefics",
    "citation": "Systems' Approach (Choudhry), Ch. 2: Libra Lagna Malefics",
    "canonicalTranslation": "For Libra Ascendant, the Functional Malefics are strictly: Mercury, Rahu, Ketu. All other planets having Moolatrikona signs outside Dusthanas are Functional Benefics.",
    "normalizedInterpretation": "In Libra Lagna charts: Mercury rules 12th (Virgo MT); Saturn owns 5th (Aquarius MT - Yogakaraka); Venus owns 1st (Libra MT). Operating periods of Mercury, Rahu, Ketu trigger challenges, delays, or health/financial stress, while periods of functional benefics yield stability and growth.",
    "metadata": {
      "tradition": "empirical_modern",
      "topic": "systems_approach",
      "subtopic": "libra_lagna_functional_profile",
      "ruleType": "house_lord_rule",
      "planetarySubjects": [
        "Mercury",
        "Rahu",
        "Ketu"
      ],
      "houseSubjects": [
        1,
        6,
        8,
        12
      ],
      "signSubjects": [
        "Libra"
      ],
      "vargaSubjects": [
        "D1"
      ],
      "authorityLevel": "authoritative_commentary",
      "tags": [
        "systems_approach",
        "libra",
        "functional_malefic",
        "moolatrikona"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "SYS-APP-0009",
    "sourceText": "Systems' Approach to Interpreting Horoscopes",
    "author": "Prof. V.K. Choudhry",
    "chapter": "Ascendant Functional Nature Matrix",
    "sectionOrShloka": "Scorpio Ascendant Functional Malefics",
    "citation": "Systems' Approach (Choudhry), Ch. 2: Scorpio Lagna Malefics",
    "canonicalTranslation": "For Scorpio Ascendant, the Functional Malefics are strictly: Mars, Venus, Rahu, Ketu. All other planets having Moolatrikona signs outside Dusthanas are Functional Benefics.",
    "normalizedInterpretation": "In Scorpio Lagna charts: Mars rules 6th (Aries MT); Venus rules 12th (Libra MT); Jupiter owns 2nd/5th (Sagittarius MT). Operating periods of Mars, Venus, Rahu, Ketu trigger challenges, delays, or health/financial stress, while periods of functional benefics yield stability and growth.",
    "metadata": {
      "tradition": "empirical_modern",
      "topic": "systems_approach",
      "subtopic": "scorpio_lagna_functional_profile",
      "ruleType": "house_lord_rule",
      "planetarySubjects": [
        "Mars",
        "Venus",
        "Rahu",
        "Ketu"
      ],
      "houseSubjects": [
        1,
        6,
        8,
        12
      ],
      "signSubjects": [
        "Scorpio"
      ],
      "vargaSubjects": [
        "D1"
      ],
      "authorityLevel": "authoritative_commentary",
      "tags": [
        "systems_approach",
        "scorpio",
        "functional_malefic",
        "moolatrikona"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "SYS-APP-0010",
    "sourceText": "Systems' Approach to Interpreting Horoscopes",
    "author": "Prof. V.K. Choudhry",
    "chapter": "Ascendant Functional Nature Matrix",
    "sectionOrShloka": "Sagittarius Ascendant Functional Malefics",
    "citation": "Systems' Approach (Choudhry), Ch. 2: Sagittarius Lagna Malefics",
    "canonicalTranslation": "For Sagittarius Ascendant, the Functional Malefics are strictly: Moon, Rahu, Ketu. All other planets having Moolatrikona signs outside Dusthanas are Functional Benefics.",
    "normalizedInterpretation": "In Sagittarius Lagna charts: Moon rules 8th (Cancer MT); Jupiter owns 1st (Sagittarius MT); Sun owns 9th (Leo MT); Mars owns 5th (Aries MT). Operating periods of Moon, Rahu, Ketu trigger challenges, delays, or health/financial stress, while periods of functional benefics yield stability and growth.",
    "metadata": {
      "tradition": "empirical_modern",
      "topic": "systems_approach",
      "subtopic": "sagittarius_lagna_functional_profile",
      "ruleType": "house_lord_rule",
      "planetarySubjects": [
        "Moon",
        "Rahu",
        "Ketu"
      ],
      "houseSubjects": [
        1,
        6,
        8,
        12
      ],
      "signSubjects": [
        "Sagittarius"
      ],
      "vargaSubjects": [
        "D1"
      ],
      "authorityLevel": "authoritative_commentary",
      "tags": [
        "systems_approach",
        "sagittarius",
        "functional_malefic",
        "moolatrikona"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "SYS-APP-0011",
    "sourceText": "Systems' Approach to Interpreting Horoscopes",
    "author": "Prof. V.K. Choudhry",
    "chapter": "Ascendant Functional Nature Matrix",
    "sectionOrShloka": "Capricorn Ascendant Functional Malefics",
    "citation": "Systems' Approach (Choudhry), Ch. 2: Capricorn Lagna Malefics",
    "canonicalTranslation": "For Capricorn Ascendant, the Functional Malefics are strictly: Sun, Jupiter, Rahu, Ketu. All other planets having Moolatrikona signs outside Dusthanas are Functional Benefics.",
    "normalizedInterpretation": "In Capricorn Lagna charts: Sun rules 8th (Leo MT); Jupiter rules 12th (Sagittarius MT); Saturn owns 2nd (Aquarius MT); Venus owns 10th (Libra MT - Yogakaraka). Operating periods of Sun, Jupiter, Rahu, Ketu trigger challenges, delays, or health/financial stress, while periods of functional benefics yield stability and growth.",
    "metadata": {
      "tradition": "empirical_modern",
      "topic": "systems_approach",
      "subtopic": "capricorn_lagna_functional_profile",
      "ruleType": "house_lord_rule",
      "planetarySubjects": [
        "Sun",
        "Jupiter",
        "Rahu",
        "Ketu"
      ],
      "houseSubjects": [
        1,
        6,
        8,
        12
      ],
      "signSubjects": [
        "Capricorn"
      ],
      "vargaSubjects": [
        "D1"
      ],
      "authorityLevel": "authoritative_commentary",
      "tags": [
        "systems_approach",
        "capricorn",
        "functional_malefic",
        "moolatrikona"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "SYS-APP-0012",
    "sourceText": "Systems' Approach to Interpreting Horoscopes",
    "author": "Prof. V.K. Choudhry",
    "chapter": "Ascendant Functional Nature Matrix",
    "sectionOrShloka": "Aquarius Ascendant Functional Malefics",
    "citation": "Systems' Approach (Choudhry), Ch. 2: Aquarius Lagna Malefics",
    "canonicalTranslation": "For Aquarius Ascendant, the Functional Malefics are strictly: Moon, Mercury, Rahu, Ketu. All other planets having Moolatrikona signs outside Dusthanas are Functional Benefics.",
    "normalizedInterpretation": "In Aquarius Lagna charts: Moon rules 6th (Cancer MT); Mercury rules 8th (Virgo MT); Saturn owns 1st (Aquarius MT); Venus owns 9th (Libra MT). Operating periods of Moon, Mercury, Rahu, Ketu trigger challenges, delays, or health/financial stress, while periods of functional benefics yield stability and growth.",
    "metadata": {
      "tradition": "empirical_modern",
      "topic": "systems_approach",
      "subtopic": "aquarius_lagna_functional_profile",
      "ruleType": "house_lord_rule",
      "planetarySubjects": [
        "Moon",
        "Mercury",
        "Rahu",
        "Ketu"
      ],
      "houseSubjects": [
        1,
        6,
        8,
        12
      ],
      "signSubjects": [
        "Aquarius"
      ],
      "vargaSubjects": [
        "D1"
      ],
      "authorityLevel": "authoritative_commentary",
      "tags": [
        "systems_approach",
        "aquarius",
        "functional_malefic",
        "moolatrikona"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "SYS-APP-0013",
    "sourceText": "Systems' Approach to Interpreting Horoscopes",
    "author": "Prof. V.K. Choudhry",
    "chapter": "Ascendant Functional Nature Matrix",
    "sectionOrShloka": "Pisces Ascendant Functional Malefics",
    "citation": "Systems' Approach (Choudhry), Ch. 2: Pisces Lagna Malefics",
    "canonicalTranslation": "For Pisces Ascendant, the Functional Malefics are strictly: Sun, Venus, Saturn, Rahu, Ketu. All other planets having Moolatrikona signs outside Dusthanas are Functional Benefics.",
    "normalizedInterpretation": "In Pisces Lagna charts: Sun rules 6th (Leo MT); Venus rules 8th (Libra MT); Saturn rules 12th (Aquarius MT); Jupiter owns 10th (Sagittarius MT); Mars owns 2nd (Aries MT). Operating periods of Sun, Venus, Saturn, Rahu, Ketu trigger challenges, delays, or health/financial stress, while periods of functional benefics yield stability and growth.",
    "metadata": {
      "tradition": "empirical_modern",
      "topic": "systems_approach",
      "subtopic": "pisces_lagna_functional_profile",
      "ruleType": "house_lord_rule",
      "planetarySubjects": [
        "Sun",
        "Venus",
        "Saturn",
        "Rahu",
        "Ketu"
      ],
      "houseSubjects": [
        1,
        6,
        8,
        12
      ],
      "signSubjects": [
        "Pisces"
      ],
      "vargaSubjects": [
        "D1"
      ],
      "authorityLevel": "authoritative_commentary",
      "tags": [
        "systems_approach",
        "pisces",
        "functional_malefic",
        "moolatrikona"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "SYS-APP-014",
    "sourceText": "Systems' Approach to Interpreting Horoscopes",
    "author": "Prof. V.K. Choudhry",
    "chapter": "Analytical Principles & Afflictions",
    "sectionOrShloka": "The Exact 5-Degree Affliction Orb",
    "citation": "Systems' Approach (Choudhry), Ch. 3: Affliction Geometry",
    "canonicalTranslation": "The close conjunction or aspect (within five degrees orb) of a Functional Malefic planet to another planet or to the midpoint (Bhava Madhya) of any house causes severe affliction. An aspect beyond five degrees loses its destructive intensity.",
    "normalizedInterpretation": "Unlike traditional wide-sign aspects, Systems Approach measures aspectual damage strictly within a 5-degree orb. When a Functional Malefic (e.g. Rahu, Ketu, or a Dusthana MT lord) approaches within 5\u00b0 of a natal planet or house cusp, the signification of that planet/house experiences disruption, surgery, or sudden impediments.",
    "metadata": {
      "tradition": "empirical_modern",
      "topic": "systems_approach",
      "subtopic": "exact_degree_affliction",
      "ruleType": "aspect_rule",
      "planetarySubjects": [
        "Rahu",
        "Ketu"
      ],
      "houseSubjects": [
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12
      ],
      "signSubjects": [],
      "vargaSubjects": [
        "D1"
      ],
      "authorityLevel": "authoritative_commentary",
      "tags": [
        "systems_approach",
        "5_degree_orb",
        "affliction",
        "conjunction",
        "aspect"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "SYS-APP-015",
    "sourceText": "Systems' Approach to Interpreting Horoscopes",
    "author": "Prof. V.K. Choudhry",
    "chapter": "Planetary Strengths and Weaknesses",
    "sectionOrShloka": "Baladi Avastha and Combustion Thresholds",
    "citation": "Systems' Approach (Choudhry), Ch. 3: Planetary Weakness Criteria",
    "canonicalTranslation": "A planet is rendered weak if: 1. Placed in infant state (0\u00b0 to 5\u00b0) or old/dead state (25\u00b0 to 30\u00b0); 2. Combust (within 5\u00b0 of the Sun); 3. Placed in Dusthana houses (6th, 8th, or 12th); 4. Debilitated in Rashi or Navamsha; 5. Afflicted by a close 5\u00b0 aspect of an FM.",
    "normalizedInterpretation": "Weak planets cannot fully protect or nurture their natural or house significations. If a Functional Benefic is situated in an infant (0\u00b0-5\u00b0) or old (25\u00b0-30\u00b0) degree, its capability to deliver material fruits is stunted, requiring proactive astrological strengthening measures (colors, non-harming remedies, Kavach).",
    "metadata": {
      "tradition": "empirical_modern",
      "topic": "systems_approach",
      "subtopic": "planetary_weakness_avastha",
      "ruleType": "strength_rule",
      "planetarySubjects": [
        "Sun"
      ],
      "houseSubjects": [
        6,
        8,
        12
      ],
      "signSubjects": [],
      "vargaSubjects": [
        "D1",
        "D9"
      ],
      "authorityLevel": "authoritative_commentary",
      "tags": [
        "systems_approach",
        "baladi_avastha",
        "combustion",
        "weak_planet"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "AIFAS-TIME-001",
    "sourceText": "Timing of Events through Dasha and Transit",
    "author": "Shri S.K. Sawhney (AIFAS / K.N. Rao School)",
    "chapter": "Chapter 6: Timing of Achievements in Educational Accomplishments",
    "sectionOrShloka": "Dasha and Transit Parameters for Higher Education",
    "citation": "AIFAS Timing of Events (Sawhney), Ch. 6, pp. 21-24",
    "canonicalTranslation": "Success and achievements in higher education and competitive entrance exams manifest during the joint operating Dasha of: 1. The 5th Lord; 2. The dispositor of the 5th Lord; 3. The Lagna Lord of Chaturvimshamsha (D-24); 4. Mercury (significator of intellect) and lord of 5th from Mercury; 5. Planets placed in 5th, aspecting 5th, or conjoined with 5th lord. Concurrently, transiting Saturn and Jupiter MUST make dual contact by conjunction or aspect with at least TWO out of four points: 5th house, 5th lord, 9th house, or 9th lord from Lagna or Moon.",
    "normalizedInterpretation": "Educational milestones (admissions, graduation, entrance exam clearance) require the confluence of D24 Lagna Lord, 5th Lord, and Mercury in the running Vimshottari period, confirmed by the classical Double Transit of Saturn and Jupiter on the 5th/9th axis or their lords.",
    "metadata": {
      "tradition": "classical",
      "topic": "aifas_timing",
      "subtopic": "education_achievement_timing",
      "ruleType": "dasha_rule",
      "planetarySubjects": [
        "Mercury",
        "Jupiter",
        "Saturn"
      ],
      "houseSubjects": [
        5,
        9,
        2,
        4
      ],
      "signSubjects": [],
      "vargaSubjects": [
        "D1",
        "D24"
      ],
      "dashaSubjects": [
        "Mahadasha",
        "Antardasha",
        "Pratyantardasha"
      ],
      "transitSubjects": [
        "Saturn",
        "Jupiter"
      ],
      "authorityLevel": "authoritative_commentary",
      "tags": [
        "aifas",
        "sk_sawhney",
        "kn_rao",
        "education_timing",
        "d24_siddhamsa",
        "double_transit"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "AIFAS-TIME-002",
    "sourceText": "Timing of Events through Dasha and Transit",
    "author": "Shri S.K. Sawhney (AIFAS / K.N. Rao School)",
    "chapter": "Chapter 7: Timing for Rise in Profession",
    "sectionOrShloka": "Dasha and Transit Parameters for Professional Rise",
    "citation": "AIFAS Timing of Events (Sawhney), Ch. 7, pp. 24-28",
    "canonicalTranslation": "Rise in profession, appointment to executive posts, and major promotions take place during the Dasha of: 1. 10th Lord of Birth Chart; 2. Dispositor of 10th Lord; 3. Lagna Lord of Dashamsha (D-10); 4. Planets aspecting 10th house, 10th lord, or conjoined with 10th lord; 5. 7th Lord (alternative house of profession, being 10th from 10th - Bhavat Bhavam). Concurrently, transiting Saturn and Jupiter must contact at least TWO of four conditions: 1. 10th House, 2. 10th Lord, 3. 7th House, 4. 7th Lord from Lagna or Moon.",
    "normalizedInterpretation": "Professional appointments and promotions operate under the 10th Lord, its dispositor, or D10 Lagna Lord. The 7th house serves as the secondary career axis (10th from 10th). Saturn and Jupiter must simultaneously activate the 10th or 7th house/lords in Gochara.",
    "metadata": {
      "tradition": "classical",
      "topic": "aifas_timing",
      "subtopic": "career_promotion_timing",
      "ruleType": "dasha_rule",
      "planetarySubjects": [
        "Saturn",
        "Jupiter",
        "Sun"
      ],
      "houseSubjects": [
        10,
        7,
        2,
        11,
        9
      ],
      "signSubjects": [],
      "vargaSubjects": [
        "D1",
        "D10"
      ],
      "dashaSubjects": [
        "Mahadasha",
        "Antardasha"
      ],
      "transitSubjects": [
        "Saturn",
        "Jupiter"
      ],
      "authorityLevel": "authoritative_commentary",
      "tags": [
        "aifas",
        "career_timing",
        "promotion",
        "d10_dashamsha",
        "bhavat_bhavam",
        "double_transit"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "AIFAS-TIME-003",
    "sourceText": "Timing of Events through Dasha and Transit",
    "author": "Shri S.K. Sawhney (AIFAS / K.N. Rao School)",
    "chapter": "Chapter 8: How to Identify Timing of Marriage",
    "sectionOrShloka": "Dasha and Double-Transit Parameters for Matrimony",
    "citation": "AIFAS Timing of Events (Sawhney), Ch. 8, pp. 28-32",
    "canonicalTranslation": "Marriage fructifies in the Dasha of: 1. 7th Lord of D1; 2. Dispositor of 7th Lord; 3. Lagna Lord of Navamsha (D-9) or 7th Lord of D-9; 4. Venus (natural Karaka of marriage for males) or Jupiter (for females); 5. Planets placed in 7th or 2nd house. During this Dasha, transiting Saturn and transiting Jupiter must simultaneously contact by aspect or conjunction two of four points: 7th house, 7th lord, 1st house, or 1st lord from natal Lagna or Chandra Lagna.",
    "normalizedInterpretation": "The solemnization of marriage requires mutual activation of D1/D9 marital lords and the double transit of Saturn and Jupiter blessing the 1st or 7th house/lords.",
    "metadata": {
      "tradition": "classical",
      "topic": "aifas_timing",
      "subtopic": "marriage_timing",
      "ruleType": "dasha_rule",
      "planetarySubjects": [
        "Venus",
        "Jupiter",
        "Saturn"
      ],
      "houseSubjects": [
        7,
        1,
        2,
        9
      ],
      "signSubjects": [],
      "vargaSubjects": [
        "D1",
        "D9"
      ],
      "dashaSubjects": [
        "Mahadasha",
        "Antardasha"
      ],
      "transitSubjects": [
        "Saturn",
        "Jupiter"
      ],
      "authorityLevel": "authoritative_commentary",
      "tags": [
        "aifas",
        "marriage_timing",
        "d9_navamsha",
        "upapada",
        "double_transit"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "AIFAS-TIME-004",
    "sourceText": "Timing of Events through Dasha and Transit",
    "author": "Shri S.K. Sawhney (AIFAS / K.N. Rao School)",
    "chapter": "Chapter 9: Timing of Birth of Children",
    "sectionOrShloka": "Dasha and Saptamsha D7 Verification for Children",
    "citation": "AIFAS Timing of Events (Sawhney), Ch. 9, pp. 32-37",
    "canonicalTranslation": "Conception and birth of children occur in the Dasha of: 1. 5th Lord of D1; 2. Dispositor of 5th Lord; 3. Lagna Lord or 5th Lord of Saptamsha (D-7); 4. Jupiter (Putrakaraka); 5. 9th Lord (5th from 5th). Concurrently, Saturn and Jupiter in Gochara must contact 5th house, 5th lord, 9th house, or 9th lord from Lagna or Moon.",
    "normalizedInterpretation": "Progeny analysis requires cross-verification between D1 and Saptamsha (D7). Dual transit of Jupiter and Saturn over the 5th/9th axis triggers child delivery.",
    "metadata": {
      "tradition": "classical",
      "topic": "aifas_timing",
      "subtopic": "progeny_timing",
      "ruleType": "dasha_rule",
      "planetarySubjects": [
        "Jupiter",
        "Saturn"
      ],
      "houseSubjects": [
        5,
        9,
        2
      ],
      "signSubjects": [],
      "vargaSubjects": [
        "D1",
        "D7"
      ],
      "dashaSubjects": [
        "Mahadasha",
        "Antardasha"
      ],
      "transitSubjects": [
        "Jupiter",
        "Saturn"
      ],
      "authorityLevel": "authoritative_commentary",
      "tags": [
        "aifas",
        "progeny_timing",
        "saptamsha_d7",
        "putrakaraka"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "AIFAS-TIME-005",
    "sourceText": "Timing of Events through Dasha and Transit",
    "author": "Shri S.K. Sawhney (AIFAS / K.N. Rao School)",
    "chapter": "Chapter 10: Timing of Foreign Travels",
    "sectionOrShloka": "Foreign Travel and Settlement Indicators",
    "citation": "AIFAS Timing of Events (Sawhney), Ch. 10, pp. 37-43",
    "canonicalTranslation": "Foreign journeys, overseas visas, and foreign relocation are governed by houses 7 (overseas trade), 9 (long voyages), 8 (crossing oceans), and 12 (foreign residence). Rahu is the natural Karaka of foreign travel. If 4th lord (motherland/home) is in 12th in a movable sign, permanent foreign residence manifests. Dasha of 12th lord, 9th lord, or Rahu activating movable signs triggers overseas relocation.",
    "normalizedInterpretation": "The purpose of foreign visit is determined by the house connecting to 12th: 5th+12th = Foreign Education; 10th+12th = Foreign Career; 7th+12th = Foreign Relocation after Marriage; 4th+12th = Permanent Emigration.",
    "metadata": {
      "tradition": "classical",
      "topic": "aifas_timing",
      "subtopic": "foreign_travel_timing",
      "ruleType": "house_lord_rule",
      "planetarySubjects": [
        "Rahu",
        "Jupiter"
      ],
      "houseSubjects": [
        12,
        9,
        7,
        8,
        4,
        3
      ],
      "signSubjects": [
        "Cancer",
        "Libra",
        "Capricorn",
        "Aries"
      ],
      "vargaSubjects": [
        "D1",
        "D9"
      ],
      "authorityLevel": "authoritative_commentary",
      "tags": [
        "aifas",
        "foreign_travel",
        "overseas_settlement",
        "rahu",
        "12th_house"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "AIFAS-INC-01",
    "sourceText": "Timing of Events through Dasha and Transit",
    "author": "Shri S.K. Sawhney (AIFAS / K.N. Rao School)",
    "chapter": "Chapter 13: How to Identify Sources of Income",
    "sectionOrShloka": "11th Lord in House 1",
    "citation": "AIFAS Timing of Events (Sawhney), Ch. 13: 11th Lord in 1th House",
    "canonicalTranslation": "When the 11th Lord occupies House 1, the primary source of wealth and financial gain for the native manifests through: Income through personal enterprise, physical exertion, self-branding, and independent initiative.",
    "normalizedInterpretation": "The placement of the 11th lord dictates the karmic channel of wealth generation. In House 1: Income through personal enterprise, physical exertion, self-branding, and independent initiative.",
    "metadata": {
      "tradition": "classical",
      "topic": "aifas_timing",
      "subtopic": "income_sources",
      "ruleType": "house_lord_rule",
      "planetarySubjects": [],
      "houseSubjects": [
        11,
        1
      ],
      "signSubjects": [],
      "vargaSubjects": [
        "D1"
      ],
      "authorityLevel": "authoritative_commentary",
      "tags": [
        "aifas",
        "income_source",
        "11th_lord",
        "house_1"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "AIFAS-INC-02",
    "sourceText": "Timing of Events through Dasha and Transit",
    "author": "Shri S.K. Sawhney (AIFAS / K.N. Rao School)",
    "chapter": "Chapter 13: How to Identify Sources of Income",
    "sectionOrShloka": "11th Lord in House 2",
    "citation": "AIFAS Timing of Events (Sawhney), Ch. 13: 11th Lord in 2th House",
    "canonicalTranslation": "When the 11th Lord occupies House 2, the primary source of wealth and financial gain for the native manifests through: Income through accumulated family capital, banking, trade in food/jewels, and financial speech.",
    "normalizedInterpretation": "The placement of the 11th lord dictates the karmic channel of wealth generation. In House 2: Income through accumulated family capital, banking, trade in food/jewels, and financial speech.",
    "metadata": {
      "tradition": "classical",
      "topic": "aifas_timing",
      "subtopic": "income_sources",
      "ruleType": "house_lord_rule",
      "planetarySubjects": [],
      "houseSubjects": [
        11,
        2
      ],
      "signSubjects": [],
      "vargaSubjects": [
        "D1"
      ],
      "authorityLevel": "authoritative_commentary",
      "tags": [
        "aifas",
        "income_source",
        "11th_lord",
        "house_2"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "AIFAS-INC-03",
    "sourceText": "Timing of Events through Dasha and Transit",
    "author": "Shri S.K. Sawhney (AIFAS / K.N. Rao School)",
    "chapter": "Chapter 13: How to Identify Sources of Income",
    "sectionOrShloka": "11th Lord in House 3",
    "citation": "AIFAS Timing of Events (Sawhney), Ch. 13: 11th Lord in 3th House",
    "canonicalTranslation": "When the 11th Lord occupies House 3, the primary source of wealth and financial gain for the native manifests through: Income through sports, media, telecommunications, publications, writing, transport, and IT networking.",
    "normalizedInterpretation": "The placement of the 11th lord dictates the karmic channel of wealth generation. In House 3: Income through sports, media, telecommunications, publications, writing, transport, and IT networking.",
    "metadata": {
      "tradition": "classical",
      "topic": "aifas_timing",
      "subtopic": "income_sources",
      "ruleType": "house_lord_rule",
      "planetarySubjects": [],
      "houseSubjects": [
        11,
        3
      ],
      "signSubjects": [],
      "vargaSubjects": [
        "D1"
      ],
      "authorityLevel": "authoritative_commentary",
      "tags": [
        "aifas",
        "income_source",
        "11th_lord",
        "house_3"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "AIFAS-INC-04",
    "sourceText": "Timing of Events through Dasha and Transit",
    "author": "Shri S.K. Sawhney (AIFAS / K.N. Rao School)",
    "chapter": "Chapter 13: How to Identify Sources of Income",
    "sectionOrShloka": "11th Lord in House 4",
    "citation": "AIFAS Timing of Events (Sawhney), Ch. 13: 11th Lord in 4th House",
    "canonicalTranslation": "When the 11th Lord occupies House 4, the primary source of wealth and financial gain for the native manifests through: Income through real estate, agriculture, property development, vehicle commerce, and educational institutions.",
    "normalizedInterpretation": "The placement of the 11th lord dictates the karmic channel of wealth generation. In House 4: Income through real estate, agriculture, property development, vehicle commerce, and educational institutions.",
    "metadata": {
      "tradition": "classical",
      "topic": "aifas_timing",
      "subtopic": "income_sources",
      "ruleType": "house_lord_rule",
      "planetarySubjects": [],
      "houseSubjects": [
        11,
        4
      ],
      "signSubjects": [],
      "vargaSubjects": [
        "D1"
      ],
      "authorityLevel": "authoritative_commentary",
      "tags": [
        "aifas",
        "income_source",
        "11th_lord",
        "house_4"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "AIFAS-INC-05",
    "sourceText": "Timing of Events through Dasha and Transit",
    "author": "Shri S.K. Sawhney (AIFAS / K.N. Rao School)",
    "chapter": "Chapter 13: How to Identify Sources of Income",
    "sectionOrShloka": "11th Lord in House 5",
    "citation": "AIFAS Timing of Events (Sawhney), Ch. 13: 11th Lord in 5th House",
    "canonicalTranslation": "When the 11th Lord occupies House 5, the primary source of wealth and financial gain for the native manifests through: Income through high intellect, algorithmic software, data science, financial consultations, and advisory services.",
    "normalizedInterpretation": "The placement of the 11th lord dictates the karmic channel of wealth generation. In House 5: Income through high intellect, algorithmic software, data science, financial consultations, and advisory services.",
    "metadata": {
      "tradition": "classical",
      "topic": "aifas_timing",
      "subtopic": "income_sources",
      "ruleType": "house_lord_rule",
      "planetarySubjects": [],
      "houseSubjects": [
        11,
        5
      ],
      "signSubjects": [],
      "vargaSubjects": [
        "D1"
      ],
      "authorityLevel": "authoritative_commentary",
      "tags": [
        "aifas",
        "income_source",
        "11th_lord",
        "house_5"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "AIFAS-INC-06",
    "sourceText": "Timing of Events through Dasha and Transit",
    "author": "Shri S.K. Sawhney (AIFAS / K.N. Rao School)",
    "chapter": "Chapter 13: How to Identify Sources of Income",
    "sectionOrShloka": "11th Lord in House 6",
    "citation": "AIFAS Timing of Events (Sawhney), Ch. 13: 11th Lord in 6th House",
    "canonicalTranslation": "When the 11th Lord occupies House 6, the primary source of wealth and financial gain for the native manifests through: Income through competitive exams, litigation/legal practice, banking loans, medicine, and service employment.",
    "normalizedInterpretation": "The placement of the 11th lord dictates the karmic channel of wealth generation. In House 6: Income through competitive exams, litigation/legal practice, banking loans, medicine, and service employment.",
    "metadata": {
      "tradition": "classical",
      "topic": "aifas_timing",
      "subtopic": "income_sources",
      "ruleType": "house_lord_rule",
      "planetarySubjects": [],
      "houseSubjects": [
        11,
        6
      ],
      "signSubjects": [],
      "vargaSubjects": [
        "D1"
      ],
      "authorityLevel": "authoritative_commentary",
      "tags": [
        "aifas",
        "income_source",
        "11th_lord",
        "house_6"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "AIFAS-INC-07",
    "sourceText": "Timing of Events through Dasha and Transit",
    "author": "Shri S.K. Sawhney (AIFAS / K.N. Rao School)",
    "chapter": "Chapter 13: How to Identify Sources of Income",
    "sectionOrShloka": "11th Lord in House 7",
    "citation": "AIFAS Timing of Events (Sawhney), Ch. 13: 11th Lord in 7th House",
    "canonicalTranslation": "When the 11th Lord occupies House 7, the primary source of wealth and financial gain for the native manifests through: Income through foreign trade, international clients, partnership commerce, and public relations.",
    "normalizedInterpretation": "The placement of the 11th lord dictates the karmic channel of wealth generation. In House 7: Income through foreign trade, international clients, partnership commerce, and public relations.",
    "metadata": {
      "tradition": "classical",
      "topic": "aifas_timing",
      "subtopic": "income_sources",
      "ruleType": "house_lord_rule",
      "planetarySubjects": [],
      "houseSubjects": [
        11,
        7
      ],
      "signSubjects": [],
      "vargaSubjects": [
        "D1"
      ],
      "authorityLevel": "authoritative_commentary",
      "tags": [
        "aifas",
        "income_source",
        "11th_lord",
        "house_7"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "AIFAS-INC-08",
    "sourceText": "Timing of Events through Dasha and Transit",
    "author": "Shri S.K. Sawhney (AIFAS / K.N. Rao School)",
    "chapter": "Chapter 13: How to Identify Sources of Income",
    "sectionOrShloka": "11th Lord in House 8",
    "citation": "AIFAS Timing of Events (Sawhney), Ch. 13: 11th Lord in 8th House",
    "canonicalTranslation": "When the 11th Lord occupies House 8, the primary source of wealth and financial gain for the native manifests through: Income through deep research, data forensics, insurance, metallurgy, joint assets, and sudden dividends.",
    "normalizedInterpretation": "The placement of the 11th lord dictates the karmic channel of wealth generation. In House 8: Income through deep research, data forensics, insurance, metallurgy, joint assets, and sudden dividends.",
    "metadata": {
      "tradition": "classical",
      "topic": "aifas_timing",
      "subtopic": "income_sources",
      "ruleType": "house_lord_rule",
      "planetarySubjects": [],
      "houseSubjects": [
        11,
        8
      ],
      "signSubjects": [],
      "vargaSubjects": [
        "D1"
      ],
      "authorityLevel": "authoritative_commentary",
      "tags": [
        "aifas",
        "income_source",
        "11th_lord",
        "house_8"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "AIFAS-INC-09",
    "sourceText": "Timing of Events through Dasha and Transit",
    "author": "Shri S.K. Sawhney (AIFAS / K.N. Rao School)",
    "chapter": "Chapter 13: How to Identify Sources of Income",
    "sectionOrShloka": "11th Lord in House 9",
    "citation": "AIFAS Timing of Events (Sawhney), Ch. 13: 11th Lord in 9th House",
    "canonicalTranslation": "When the 11th Lord occupies House 9, the primary source of wealth and financial gain for the native manifests through: Income through higher academia, university professorship, legal counsel, religious institutions, and global advisory.",
    "normalizedInterpretation": "The placement of the 11th lord dictates the karmic channel of wealth generation. In House 9: Income through higher academia, university professorship, legal counsel, religious institutions, and global advisory.",
    "metadata": {
      "tradition": "classical",
      "topic": "aifas_timing",
      "subtopic": "income_sources",
      "ruleType": "house_lord_rule",
      "planetarySubjects": [],
      "houseSubjects": [
        11,
        9
      ],
      "signSubjects": [],
      "vargaSubjects": [
        "D1"
      ],
      "authorityLevel": "authoritative_commentary",
      "tags": [
        "aifas",
        "income_source",
        "11th_lord",
        "house_9"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "AIFAS-INC-10",
    "sourceText": "Timing of Events through Dasha and Transit",
    "author": "Shri S.K. Sawhney (AIFAS / K.N. Rao School)",
    "chapter": "Chapter 13: How to Identify Sources of Income",
    "sectionOrShloka": "11th Lord in House 10",
    "citation": "AIFAS Timing of Events (Sawhney), Ch. 13: 11th Lord in 10th House",
    "canonicalTranslation": "When the 11th Lord occupies House 10, the primary source of wealth and financial gain for the native manifests through: Income through executive authority, corporate management, government tenders, and industry leadership.",
    "normalizedInterpretation": "The placement of the 11th lord dictates the karmic channel of wealth generation. In House 10: Income through executive authority, corporate management, government tenders, and industry leadership.",
    "metadata": {
      "tradition": "classical",
      "topic": "aifas_timing",
      "subtopic": "income_sources",
      "ruleType": "house_lord_rule",
      "planetarySubjects": [],
      "houseSubjects": [
        11,
        10
      ],
      "signSubjects": [],
      "vargaSubjects": [
        "D1"
      ],
      "authorityLevel": "authoritative_commentary",
      "tags": [
        "aifas",
        "income_source",
        "11th_lord",
        "house_10"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "AIFAS-INC-11",
    "sourceText": "Timing of Events through Dasha and Transit",
    "author": "Shri S.K. Sawhney (AIFAS / K.N. Rao School)",
    "chapter": "Chapter 13: How to Identify Sources of Income",
    "sectionOrShloka": "11th Lord in House 11",
    "citation": "AIFAS Timing of Events (Sawhney), Ch. 13: 11th Lord in 11th House",
    "canonicalTranslation": "When the 11th Lord occupies House 11, the primary source of wealth and financial gain for the native manifests through: Income through large-scale business networks, multinational consortiums, tech platforms, and investor groups.",
    "normalizedInterpretation": "The placement of the 11th lord dictates the karmic channel of wealth generation. In House 11: Income through large-scale business networks, multinational consortiums, tech platforms, and investor groups.",
    "metadata": {
      "tradition": "classical",
      "topic": "aifas_timing",
      "subtopic": "income_sources",
      "ruleType": "house_lord_rule",
      "planetarySubjects": [],
      "houseSubjects": [
        11,
        11
      ],
      "signSubjects": [],
      "vargaSubjects": [
        "D1"
      ],
      "authorityLevel": "authoritative_commentary",
      "tags": [
        "aifas",
        "income_source",
        "11th_lord",
        "house_11"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "AIFAS-INC-12",
    "sourceText": "Timing of Events through Dasha and Transit",
    "author": "Shri S.K. Sawhney (AIFAS / K.N. Rao School)",
    "chapter": "Chapter 13: How to Identify Sources of Income",
    "sectionOrShloka": "11th Lord in House 12",
    "citation": "AIFAS Timing of Events (Sawhney), Ch. 13: 11th Lord in 12th House",
    "canonicalTranslation": "When the 11th Lord occupies House 12, the primary source of wealth and financial gain for the native manifests through: Income through multinational corporations (MNCs), foreign currency remittances, hospitals, and overseas contracts.",
    "normalizedInterpretation": "The placement of the 11th lord dictates the karmic channel of wealth generation. In House 12: Income through multinational corporations (MNCs), foreign currency remittances, hospitals, and overseas contracts.",
    "metadata": {
      "tradition": "classical",
      "topic": "aifas_timing",
      "subtopic": "income_sources",
      "ruleType": "house_lord_rule",
      "planetarySubjects": [],
      "houseSubjects": [
        11,
        12
      ],
      "signSubjects": [],
      "vargaSubjects": [
        "D1"
      ],
      "authorityLevel": "authoritative_commentary",
      "tags": [
        "aifas",
        "income_source",
        "11th_lord",
        "house_12"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "EDU-ASTRO-001",
    "sourceText": "Education and Astrology",
    "author": "Shri Vinayaka Astrology Research",
    "chapter": "Computers, Electronics & Software Engineering",
    "sectionOrShloka": "Planetary Conjunctions for Software, Hardware & Game Engineering",
    "citation": "Education and Astrology, Section: How Planets Affect Modern Education",
    "canonicalTranslation": "In modern times, Rahu represents computers, electronic circuits, and emerging technologies. A software programmer or engineer requires Rahu, Mercury, and Mars to form aspect or conjunction (or Ketu, Mercury, and Mars). Rahu = Computers & Electronics; Mercury = Discrete Logic & Software Languages; Mars & Ketu = Hardware, microprocessors, and applied electrical engineering. When placed in 3rd, 5th, 9th, or 10th house, technical mastery is guaranteed.",
    "normalizedInterpretation": "The modern tech trinity in Vedic astrology is: Rahu (Computing/AI/Networks) + Mercury (Algorithms/Logic/Software) + Mars/Ketu (Hardware/Electronics/Security). 5th house placement indicates algorithmic and software specialization; connection with Venus/Moon brings UI/UX, gaming, and visual simulation engineering.",
    "metadata": {
      "tradition": "empirical_modern",
      "topic": "education_astrology",
      "subtopic": "software_hardware_engineering",
      "ruleType": "conjunction_rule",
      "planetarySubjects": [
        "Rahu",
        "Mercury",
        "Mars",
        "Ketu",
        "Venus"
      ],
      "houseSubjects": [
        5,
        10,
        3,
        9
      ],
      "signSubjects": [
        "Gemini",
        "Virgo",
        "Aquarius"
      ],
      "vargaSubjects": [
        "D1",
        "D24",
        "D10"
      ],
      "authorityLevel": "empirical_validated",
      "tags": [
        "education_astrology",
        "software_engineering",
        "rahu",
        "mercury",
        "mars",
        "gaming",
        "d24"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "EDU-ASTRO-002",
    "sourceText": "Education and Astrology",
    "author": "Shri Vinayaka Astrology Research",
    "chapter": "Aerospace, Aviation & Space Computing",
    "sectionOrShloka": "Air Signs & High-Altitude Systems",
    "citation": "Education and Astrology, Section: Aerospace & High-Tech Studies",
    "canonicalTranslation": "In case of Aerospace engineering, aviation computing, or space systems studies: Mars, Mercury, and Rahu must associate with Air signs (Gemini, Libra, Aquarius) and occupy Nakshatras ruled by Air-promoting planets (Mercury, Venus, Saturn).",
    "normalizedInterpretation": "Aerospace and satellite technology require the marriage of fiery thrust (Mars) and digital systems (Mercury/Rahu) placed in Airy Rashis (Gemini, Libra, Aquarius) with Ashtakavarga and D24 confirmation.",
    "metadata": {
      "tradition": "empirical_modern",
      "topic": "education_astrology",
      "subtopic": "aerospace_systems",
      "ruleType": "conjunction_rule",
      "planetarySubjects": [
        "Mars",
        "Mercury",
        "Rahu",
        "Saturn"
      ],
      "houseSubjects": [
        5,
        9,
        10
      ],
      "signSubjects": [
        "Gemini",
        "Libra",
        "Aquarius"
      ],
      "vargaSubjects": [
        "D1",
        "D24"
      ],
      "authorityLevel": "empirical_validated",
      "tags": [
        "aerospace",
        "air_signs",
        "education_astrology",
        "mars_rahu_mercury"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "KP-JOB-001",
    "sourceText": "How to Time New Job",
    "author": "Pt. Akash (Nakshatra Jyotish Kendra / KP Astrologer)",
    "chapter": "Cuspal Sub-Lord Mechanics for Job Acquisition",
    "sectionOrShloka": "2, 6, 10, 11 Houses & Ruling Planets (RP) Timing",
    "citation": "How to Time New Job, KP Cuspal & Ruling Planet Analysis",
    "canonicalTranslation": "In KP Astrology, service and earning a new job are promised when the cuspal sub-lords of the 6th and 10th houses signify houses 2 (money/salary), 6 (service/employment), 10 (status/profession), and 11 (fulfillment of desire/gains). The event fructifies during the joint Dasha-Bhukti-Antara (DBA) of significators of 2, 6, 10, 11, triggered when the Sun transits the sign and star of the ruling planets.",
    "normalizedInterpretation": "Precise job offers and joining dates are pinpointed by KP sub-lord confluence: when 6th and 10th cuspal sub-lords connect with 2, 6, 10, 11, appointment letters arrive as the Sun in transit enters the sign/nakshatra of the operating significators.",
    "metadata": {
      "tradition": "empirical_modern",
      "topic": "job_timing_kp",
      "subtopic": "kp_cuspal_sublord_job",
      "ruleType": "dasha_rule",
      "planetarySubjects": [
        "Sun",
        "Saturn",
        "Moon"
      ],
      "houseSubjects": [
        2,
        6,
        10,
        11
      ],
      "signSubjects": [],
      "vargaSubjects": [
        "D1"
      ],
      "authorityLevel": "authoritative_commentary",
      "tags": [
        "kp_astrology",
        "job_timing",
        "cuspal_sublord",
        "ruling_planets",
        "dba"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "NAK-SEC-01",
    "sourceText": "The Real Secret of Vedic Astrology - Nakshatras",
    "author": "Acharya Bharat",
    "chapter": "Nakshatra 1: Ashwini",
    "sectionOrShloka": "Ashwini (Aries (0\u00b0 - 13\u00b020')) - Ruler: Ketu",
    "citation": "Nakshatras Secrets (Acharya Bharat), Constellation 1: Ashwini",
    "canonicalTranslation": "Ashwini (Aries (0\u00b0 - 13\u00b020')) is governed by Ketu and presided over by Ashwini Kumaras (Golden Horse Twins). Key Significations: Healing, medicine, surgery, rapid transit, high-speed engineering, pioneering initiative, martial courage.",
    "normalizedInterpretation": "When Moon, Lagna, or key career planets occupy Ashwini: the native exhibits Healing, medicine, surgery, rapid transit, high-speed engineering, pioneering initiative, martial courage.. Transits over Ashwini activate corresponding lifecycle milestones according to Navatara Chakra.",
    "metadata": {
      "tradition": "classical",
      "topic": "nakshatras_secrets",
      "subtopic": "ashwini_characteristics",
      "ruleType": "definition",
      "planetarySubjects": [
        "Ketu"
      ],
      "houseSubjects": [],
      "signSubjects": [
        "Aries"
      ],
      "vargaSubjects": [
        "D1",
        "D9"
      ],
      "authorityLevel": "authoritative_commentary",
      "tags": [
        "nakshatra",
        "ashwini",
        "ketu",
        "ashwini kumaras (golden horse twins)",
        "acharya_bharat"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "NAK-SEC-02",
    "sourceText": "The Real Secret of Vedic Astrology - Nakshatras",
    "author": "Acharya Bharat",
    "chapter": "Nakshatra 2: Bharani",
    "sectionOrShloka": "Bharani (Aries (13\u00b020' - 26\u00b040')) - Ruler: Venus",
    "citation": "Nakshatras Secrets (Acharya Bharat), Constellation 2: Bharani",
    "canonicalTranslation": "Bharani (Aries (13\u00b020' - 26\u00b040')) is governed by Venus and presided over by Yama (God of Death & Dharma). Key Significations: Struggle, transformation, birth and death, obstetrics, creative intensity, judicial ethics, culinary arts.",
    "normalizedInterpretation": "When Moon, Lagna, or key career planets occupy Bharani: the native exhibits Struggle, transformation, birth and death, obstetrics, creative intensity, judicial ethics, culinary arts.. Transits over Bharani activate corresponding lifecycle milestones according to Navatara Chakra.",
    "metadata": {
      "tradition": "classical",
      "topic": "nakshatras_secrets",
      "subtopic": "bharani_characteristics",
      "ruleType": "definition",
      "planetarySubjects": [
        "Venus"
      ],
      "houseSubjects": [],
      "signSubjects": [
        "Aries"
      ],
      "vargaSubjects": [
        "D1",
        "D9"
      ],
      "authorityLevel": "authoritative_commentary",
      "tags": [
        "nakshatra",
        "bharani",
        "venus",
        "yama (god of death & dharma)",
        "acharya_bharat"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "NAK-SEC-03",
    "sourceText": "The Real Secret of Vedic Astrology - Nakshatras",
    "author": "Acharya Bharat",
    "chapter": "Nakshatra 3: Krittika",
    "sectionOrShloka": "Krittika (Aries (26\u00b040') - Taurus (10\u00b000')) - Ruler: Sun",
    "citation": "Nakshatras Secrets (Acharya Bharat), Constellation 3: Krittika",
    "canonicalTranslation": "Krittika (Aries (26\u00b040') - Taurus (10\u00b000')) is governed by Sun and presided over by Agni (God of Sacred Fire). Key Significations: Sharp intellect, metallurgy, executive digestion, military leadership, cooking, cutting tools, purificatory trials.",
    "normalizedInterpretation": "When Moon, Lagna, or key career planets occupy Krittika: the native exhibits Sharp intellect, metallurgy, executive digestion, military leadership, cooking, cutting tools, purificatory trials.. Transits over Krittika activate corresponding lifecycle milestones according to Navatara Chakra.",
    "metadata": {
      "tradition": "classical",
      "topic": "nakshatras_secrets",
      "subtopic": "krittika_characteristics",
      "ruleType": "definition",
      "planetarySubjects": [
        "Sun"
      ],
      "houseSubjects": [],
      "signSubjects": [
        "Aries"
      ],
      "vargaSubjects": [
        "D1",
        "D9"
      ],
      "authorityLevel": "authoritative_commentary",
      "tags": [
        "nakshatra",
        "krittika",
        "sun",
        "agni (god of sacred fire)",
        "acharya_bharat"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "NAK-SEC-04",
    "sourceText": "The Real Secret of Vedic Astrology - Nakshatras",
    "author": "Acharya Bharat",
    "chapter": "Nakshatra 4: Rohini",
    "sectionOrShloka": "Rohini (Taurus (10\u00b000' - 23\u00b020')) - Ruler: Moon",
    "citation": "Nakshatras Secrets (Acharya Bharat), Constellation 4: Rohini",
    "canonicalTranslation": "Rohini (Taurus (10\u00b000' - 23\u00b020')) is governed by Moon and presided over by Brahma / Prajapati (The Creator). Key Significations: Sensory beauty, agriculture, vehicle commerce, music, artistic design, financial growth, charismatic elegance.",
    "normalizedInterpretation": "When Moon, Lagna, or key career planets occupy Rohini: the native exhibits Sensory beauty, agriculture, vehicle commerce, music, artistic design, financial growth, charismatic elegance.. Transits over Rohini activate corresponding lifecycle milestones according to Navatara Chakra.",
    "metadata": {
      "tradition": "classical",
      "topic": "nakshatras_secrets",
      "subtopic": "rohini_characteristics",
      "ruleType": "definition",
      "planetarySubjects": [
        "Moon"
      ],
      "houseSubjects": [],
      "signSubjects": [
        "Taurus"
      ],
      "vargaSubjects": [
        "D1",
        "D9"
      ],
      "authorityLevel": "authoritative_commentary",
      "tags": [
        "nakshatra",
        "rohini",
        "moon",
        "brahma / prajapati (the creator)",
        "acharya_bharat"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "NAK-SEC-05",
    "sourceText": "The Real Secret of Vedic Astrology - Nakshatras",
    "author": "Acharya Bharat",
    "chapter": "Nakshatra 5: Mrigashira",
    "sectionOrShloka": "Mrigashira (Taurus (23\u00b020') - Gemini (6\u00b040')) - Ruler: Mars",
    "citation": "Nakshatras Secrets (Acharya Bharat), Constellation 5: Mrigashira",
    "canonicalTranslation": "Mrigashira (Taurus (23\u00b020') - Gemini (6\u00b040')) is governed by Mars and presided over by Soma (Moon God / Divine Nectar). Key Significations: Searching spirit, research, investigative journalism, forestry, exploration, telecommunications, agile logic.",
    "normalizedInterpretation": "When Moon, Lagna, or key career planets occupy Mrigashira: the native exhibits Searching spirit, research, investigative journalism, forestry, exploration, telecommunications, agile logic.. Transits over Mrigashira activate corresponding lifecycle milestones according to Navatara Chakra.",
    "metadata": {
      "tradition": "classical",
      "topic": "nakshatras_secrets",
      "subtopic": "mrigashira_characteristics",
      "ruleType": "definition",
      "planetarySubjects": [
        "Mars"
      ],
      "houseSubjects": [],
      "signSubjects": [
        "Taurus"
      ],
      "vargaSubjects": [
        "D1",
        "D9"
      ],
      "authorityLevel": "authoritative_commentary",
      "tags": [
        "nakshatra",
        "mrigashira",
        "mars",
        "soma (moon god / divine nectar)",
        "acharya_bharat"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "NAK-SEC-06",
    "sourceText": "The Real Secret of Vedic Astrology - Nakshatras",
    "author": "Acharya Bharat",
    "chapter": "Nakshatra 6: Ardra",
    "sectionOrShloka": "Ardra (Gemini (6\u00b040' - 20\u00b000')) - Ruler: Rahu",
    "citation": "Nakshatras Secrets (Acharya Bharat), Constellation 6: Ardra",
    "canonicalTranslation": "Ardra (Gemini (6\u00b040' - 20\u00b000')) is governed by Rahu and presided over by Rudra (The Storm God). Key Significations: Technological breakthrough, computational complexity, storms of transformation, software systems, electrical research, tearful breakthroughs.",
    "normalizedInterpretation": "When Moon, Lagna, or key career planets occupy Ardra: the native exhibits Technological breakthrough, computational complexity, storms of transformation, software systems, electrical research, tearful breakthroughs.. Transits over Ardra activate corresponding lifecycle milestones according to Navatara Chakra.",
    "metadata": {
      "tradition": "classical",
      "topic": "nakshatras_secrets",
      "subtopic": "ardra_characteristics",
      "ruleType": "definition",
      "planetarySubjects": [
        "Rahu"
      ],
      "houseSubjects": [],
      "signSubjects": [
        "Gemini"
      ],
      "vargaSubjects": [
        "D1",
        "D9"
      ],
      "authorityLevel": "authoritative_commentary",
      "tags": [
        "nakshatra",
        "ardra",
        "rahu",
        "rudra (the storm god)",
        "acharya_bharat"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "NAK-SEC-07",
    "sourceText": "The Real Secret of Vedic Astrology - Nakshatras",
    "author": "Acharya Bharat",
    "chapter": "Nakshatra 7: Punarvasu",
    "sectionOrShloka": "Punarvasu (Gemini (20\u00b000') - Cancer (3\u00b020')) - Ruler: Jupiter",
    "citation": "Nakshatras Secrets (Acharya Bharat), Constellation 7: Punarvasu",
    "canonicalTranslation": "Punarvasu (Gemini (20\u00b000') - Cancer (3\u00b020')) is governed by Jupiter and presided over by Aditi (Cosmic Mother). Key Significations: Return of the light, renewal, teaching, civil architecture, counseling, philosophy, archery, travel and safe return.",
    "normalizedInterpretation": "When Moon, Lagna, or key career planets occupy Punarvasu: the native exhibits Return of the light, renewal, teaching, civil architecture, counseling, philosophy, archery, travel and safe return.. Transits over Punarvasu activate corresponding lifecycle milestones according to Navatara Chakra.",
    "metadata": {
      "tradition": "classical",
      "topic": "nakshatras_secrets",
      "subtopic": "punarvasu_characteristics",
      "ruleType": "definition",
      "planetarySubjects": [
        "Jupiter"
      ],
      "houseSubjects": [],
      "signSubjects": [
        "Gemini"
      ],
      "vargaSubjects": [
        "D1",
        "D9"
      ],
      "authorityLevel": "authoritative_commentary",
      "tags": [
        "nakshatra",
        "punarvasu",
        "jupiter",
        "aditi (cosmic mother)",
        "acharya_bharat"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "NAK-SEC-08",
    "sourceText": "The Real Secret of Vedic Astrology - Nakshatras",
    "author": "Acharya Bharat",
    "chapter": "Nakshatra 8: Pushya",
    "sectionOrShloka": "Pushya (Cancer (3\u00b020' - 16\u00b040')) - Ruler: Saturn",
    "citation": "Nakshatras Secrets (Acharya Bharat), Constellation 8: Pushya",
    "canonicalTranslation": "Pushya (Cancer (3\u00b020' - 16\u00b040')) is governed by Saturn and presided over by Brihaspati (Spiritual Preceptor). Key Significations: Nourishment, supreme benefic star, governance, dairy, educational institutions, patron of religion, unshakeable stability.",
    "normalizedInterpretation": "When Moon, Lagna, or key career planets occupy Pushya: the native exhibits Nourishment, supreme benefic star, governance, dairy, educational institutions, patron of religion, unshakeable stability.. Transits over Pushya activate corresponding lifecycle milestones according to Navatara Chakra.",
    "metadata": {
      "tradition": "classical",
      "topic": "nakshatras_secrets",
      "subtopic": "pushya_characteristics",
      "ruleType": "definition",
      "planetarySubjects": [
        "Saturn"
      ],
      "houseSubjects": [],
      "signSubjects": [
        "Cancer"
      ],
      "vargaSubjects": [
        "D1",
        "D9"
      ],
      "authorityLevel": "authoritative_commentary",
      "tags": [
        "nakshatra",
        "pushya",
        "saturn",
        "brihaspati (spiritual preceptor)",
        "acharya_bharat"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "NAK-SEC-09",
    "sourceText": "The Real Secret of Vedic Astrology - Nakshatras",
    "author": "Acharya Bharat",
    "chapter": "Nakshatra 9: Ashlesha",
    "sectionOrShloka": "Ashlesha (Cancer (16\u00b040' - 30\u00b000')) - Ruler: Mercury",
    "citation": "Nakshatras Secrets (Acharya Bharat), Constellation 9: Ashlesha",
    "canonicalTranslation": "Ashlesha (Cancer (16\u00b040' - 30\u00b000')) is governed by Mercury and presided over by Nagas (The Serpentine Deities). Key Significations: Deep psychological penetration, occult research, pharmacy, chemical engineering, politics, strategic diplomacy, hypnotic acumen.",
    "normalizedInterpretation": "When Moon, Lagna, or key career planets occupy Ashlesha: the native exhibits Deep psychological penetration, occult research, pharmacy, chemical engineering, politics, strategic diplomacy, hypnotic acumen.. Transits over Ashlesha activate corresponding lifecycle milestones according to Navatara Chakra.",
    "metadata": {
      "tradition": "classical",
      "topic": "nakshatras_secrets",
      "subtopic": "ashlesha_characteristics",
      "ruleType": "definition",
      "planetarySubjects": [
        "Mercury"
      ],
      "houseSubjects": [],
      "signSubjects": [
        "Cancer"
      ],
      "vargaSubjects": [
        "D1",
        "D9"
      ],
      "authorityLevel": "authoritative_commentary",
      "tags": [
        "nakshatra",
        "ashlesha",
        "mercury",
        "nagas (the serpentine deities)",
        "acharya_bharat"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "NAK-SEC-10",
    "sourceText": "The Real Secret of Vedic Astrology - Nakshatras",
    "author": "Acharya Bharat",
    "chapter": "Nakshatra 10: Magha",
    "sectionOrShloka": "Magha (Leo (0\u00b000' - 13\u00b020')) - Ruler: Ketu",
    "citation": "Nakshatras Secrets (Acharya Bharat), Constellation 10: Magha",
    "canonicalTranslation": "Magha (Leo (0\u00b000' - 13\u00b020')) is governed by Ketu and presided over by Pitrus (The Ancestral Fathers). Key Significations: Ancestral authority, royal status, administrative leadership, historical research, institutional directorship, pride of lineage.",
    "normalizedInterpretation": "When Moon, Lagna, or key career planets occupy Magha: the native exhibits Ancestral authority, royal status, administrative leadership, historical research, institutional directorship, pride of lineage.. Transits over Magha activate corresponding lifecycle milestones according to Navatara Chakra.",
    "metadata": {
      "tradition": "classical",
      "topic": "nakshatras_secrets",
      "subtopic": "magha_characteristics",
      "ruleType": "definition",
      "planetarySubjects": [
        "Ketu"
      ],
      "houseSubjects": [],
      "signSubjects": [
        "Leo"
      ],
      "vargaSubjects": [
        "D1",
        "D9"
      ],
      "authorityLevel": "authoritative_commentary",
      "tags": [
        "nakshatra",
        "magha",
        "ketu",
        "pitrus (the ancestral fathers)",
        "acharya_bharat"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "NAK-SEC-11",
    "sourceText": "The Real Secret of Vedic Astrology - Nakshatras",
    "author": "Acharya Bharat",
    "chapter": "Nakshatra 11: Purva Phalguni",
    "sectionOrShloka": "Purva Phalguni (Leo (13\u00b020' - 26\u00b040')) - Ruler: Venus",
    "citation": "Nakshatras Secrets (Acharya Bharat), Constellation 11: Purva Phalguni",
    "canonicalTranslation": "Purva Phalguni (Leo (13\u00b020' - 26\u00b040')) is governed by Venus and presided over by Bhaga (God of Fortune & Prosperity). Key Significations: Creative arts, entertainment, luxury commerce, matrimonial bliss, social charm, rest, leisure, theatrical talent.",
    "normalizedInterpretation": "When Moon, Lagna, or key career planets occupy Purva Phalguni: the native exhibits Creative arts, entertainment, luxury commerce, matrimonial bliss, social charm, rest, leisure, theatrical talent.. Transits over Purva Phalguni activate corresponding lifecycle milestones according to Navatara Chakra.",
    "metadata": {
      "tradition": "classical",
      "topic": "nakshatras_secrets",
      "subtopic": "purva phalguni_characteristics",
      "ruleType": "definition",
      "planetarySubjects": [
        "Venus"
      ],
      "houseSubjects": [],
      "signSubjects": [
        "Leo"
      ],
      "vargaSubjects": [
        "D1",
        "D9"
      ],
      "authorityLevel": "authoritative_commentary",
      "tags": [
        "nakshatra",
        "purva phalguni",
        "venus",
        "bhaga (god of fortune & prosperity)",
        "acharya_bharat"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "NAK-SEC-12",
    "sourceText": "The Real Secret of Vedic Astrology - Nakshatras",
    "author": "Acharya Bharat",
    "chapter": "Nakshatra 12: Uttara Phalguni",
    "sectionOrShloka": "Uttara Phalguni (Leo (26\u00b040') - Virgo (10\u00b000')) - Ruler: Sun",
    "citation": "Nakshatras Secrets (Acharya Bharat), Constellation 12: Uttara Phalguni",
    "canonicalTranslation": "Uttara Phalguni (Leo (26\u00b040') - Virgo (10\u00b000')) is governed by Sun and presided over by Aryaman (God of Patronage & Contracts). Key Significations: Societal contracts, philanthropy, leadership, state alliances, administrative stability, patronage, honorable partnerships.",
    "normalizedInterpretation": "When Moon, Lagna, or key career planets occupy Uttara Phalguni: the native exhibits Societal contracts, philanthropy, leadership, state alliances, administrative stability, patronage, honorable partnerships.. Transits over Uttara Phalguni activate corresponding lifecycle milestones according to Navatara Chakra.",
    "metadata": {
      "tradition": "classical",
      "topic": "nakshatras_secrets",
      "subtopic": "uttara phalguni_characteristics",
      "ruleType": "definition",
      "planetarySubjects": [
        "Sun"
      ],
      "houseSubjects": [],
      "signSubjects": [
        "Leo"
      ],
      "vargaSubjects": [
        "D1",
        "D9"
      ],
      "authorityLevel": "authoritative_commentary",
      "tags": [
        "nakshatra",
        "uttara phalguni",
        "sun",
        "aryaman (god of patronage & contracts)",
        "acharya_bharat"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "NAK-SEC-13",
    "sourceText": "The Real Secret of Vedic Astrology - Nakshatras",
    "author": "Acharya Bharat",
    "chapter": "Nakshatra 13: Hasta",
    "sectionOrShloka": "Hasta (Virgo (10\u00b000' - 23\u00b020')) - Ruler: Moon",
    "citation": "Nakshatras Secrets (Acharya Bharat), Constellation 13: Hasta",
    "canonicalTranslation": "Hasta (Virgo (10\u00b000' - 23\u00b020')) is governed by Moon and presided over by Savitar (The Solar Craftsman). Key Significations: Dexterity with hands, craft, surgery, digital typing, magic, commercial trade, intricate mechanism, humor, analytical mastery.",
    "normalizedInterpretation": "When Moon, Lagna, or key career planets occupy Hasta: the native exhibits Dexterity with hands, craft, surgery, digital typing, magic, commercial trade, intricate mechanism, humor, analytical mastery.. Transits over Hasta activate corresponding lifecycle milestones according to Navatara Chakra.",
    "metadata": {
      "tradition": "classical",
      "topic": "nakshatras_secrets",
      "subtopic": "hasta_characteristics",
      "ruleType": "definition",
      "planetarySubjects": [
        "Moon"
      ],
      "houseSubjects": [],
      "signSubjects": [
        "Virgo"
      ],
      "vargaSubjects": [
        "D1",
        "D9"
      ],
      "authorityLevel": "authoritative_commentary",
      "tags": [
        "nakshatra",
        "hasta",
        "moon",
        "savitar (the solar craftsman)",
        "acharya_bharat"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "NAK-SEC-14",
    "sourceText": "The Real Secret of Vedic Astrology - Nakshatras",
    "author": "Acharya Bharat",
    "chapter": "Nakshatra 14: Chitra",
    "sectionOrShloka": "Chitra (Virgo (23\u00b020') - Libra (6\u00b040')) - Ruler: Mars",
    "citation": "Nakshatras Secrets (Acharya Bharat), Constellation 14: Chitra",
    "canonicalTranslation": "Chitra (Virgo (23\u00b020') - Libra (6\u00b040')) is governed by Mars and presided over by Vishwakarma (Divine Architect). Key Significations: Structural architecture, design, jewelry, mechanical drawing, graphics, visual aesthetics, brilliant craftsmanship, structural engineering.",
    "normalizedInterpretation": "When Moon, Lagna, or key career planets occupy Chitra: the native exhibits Structural architecture, design, jewelry, mechanical drawing, graphics, visual aesthetics, brilliant craftsmanship, structural engineering.. Transits over Chitra activate corresponding lifecycle milestones according to Navatara Chakra.",
    "metadata": {
      "tradition": "classical",
      "topic": "nakshatras_secrets",
      "subtopic": "chitra_characteristics",
      "ruleType": "definition",
      "planetarySubjects": [
        "Mars"
      ],
      "houseSubjects": [],
      "signSubjects": [
        "Virgo"
      ],
      "vargaSubjects": [
        "D1",
        "D9"
      ],
      "authorityLevel": "authoritative_commentary",
      "tags": [
        "nakshatra",
        "chitra",
        "mars",
        "vishwakarma (divine architect)",
        "acharya_bharat"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "NAK-SEC-15",
    "sourceText": "The Real Secret of Vedic Astrology - Nakshatras",
    "author": "Acharya Bharat",
    "chapter": "Nakshatra 15: Swati",
    "sectionOrShloka": "Swati (Libra (6\u00b040' - 20\u00b000')) - Ruler: Rahu",
    "citation": "Nakshatras Secrets (Acharya Bharat), Constellation 15: Swati",
    "canonicalTranslation": "Swati (Libra (6\u00b040' - 20\u00b000')) is governed by Rahu and presided over by Vayu (The Wind God). Key Significations: Independence, flexibility, aviation, trade, marketing, diplomacy, international commerce, music, self-driven enterprise.",
    "normalizedInterpretation": "When Moon, Lagna, or key career planets occupy Swati: the native exhibits Independence, flexibility, aviation, trade, marketing, diplomacy, international commerce, music, self-driven enterprise.. Transits over Swati activate corresponding lifecycle milestones according to Navatara Chakra.",
    "metadata": {
      "tradition": "classical",
      "topic": "nakshatras_secrets",
      "subtopic": "swati_characteristics",
      "ruleType": "definition",
      "planetarySubjects": [
        "Rahu"
      ],
      "houseSubjects": [],
      "signSubjects": [
        "Libra"
      ],
      "vargaSubjects": [
        "D1",
        "D9"
      ],
      "authorityLevel": "authoritative_commentary",
      "tags": [
        "nakshatra",
        "swati",
        "rahu",
        "vayu (the wind god)",
        "acharya_bharat"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "NAK-SEC-16",
    "sourceText": "The Real Secret of Vedic Astrology - Nakshatras",
    "author": "Acharya Bharat",
    "chapter": "Nakshatra 16: Vishakha",
    "sectionOrShloka": "Vishakha (Libra (20\u00b000') - Scorpio (3\u00b020')) - Ruler: Jupiter",
    "citation": "Nakshatras Secrets (Acharya Bharat), Constellation 16: Vishakha",
    "canonicalTranslation": "Vishakha (Libra (20\u00b000') - Scorpio (3\u00b020')) is governed by Jupiter and presided over by Indra-Agni (Triumph & Fire). Key Significations: Focused ambition, competitive triumph, targeted goal attainment, law, political campaigning, single-minded obsession.",
    "normalizedInterpretation": "When Moon, Lagna, or key career planets occupy Vishakha: the native exhibits Focused ambition, competitive triumph, targeted goal attainment, law, political campaigning, single-minded obsession.. Transits over Vishakha activate corresponding lifecycle milestones according to Navatara Chakra.",
    "metadata": {
      "tradition": "classical",
      "topic": "nakshatras_secrets",
      "subtopic": "vishakha_characteristics",
      "ruleType": "definition",
      "planetarySubjects": [
        "Jupiter"
      ],
      "houseSubjects": [],
      "signSubjects": [
        "Libra"
      ],
      "vargaSubjects": [
        "D1",
        "D9"
      ],
      "authorityLevel": "authoritative_commentary",
      "tags": [
        "nakshatra",
        "vishakha",
        "jupiter",
        "indra-agni (triumph & fire)",
        "acharya_bharat"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "NAK-SEC-17",
    "sourceText": "The Real Secret of Vedic Astrology - Nakshatras",
    "author": "Acharya Bharat",
    "chapter": "Nakshatra 17: Anuradha",
    "sectionOrShloka": "Anuradha (Scorpio (3\u00b020' - 16\u00b040')) - Ruler: Saturn",
    "citation": "Nakshatras Secrets (Acharya Bharat), Constellation 17: Anuradha",
    "canonicalTranslation": "Anuradha (Scorpio (3\u00b020' - 16\u00b040')) is governed by Saturn and presided over by Mitra (God of Friendship & Devotion). Key Significations: Devotional brotherhood, corporate networking, mining, foreign alliances, musical harmony, resilience through adversity.",
    "normalizedInterpretation": "When Moon, Lagna, or key career planets occupy Anuradha: the native exhibits Devotional brotherhood, corporate networking, mining, foreign alliances, musical harmony, resilience through adversity.. Transits over Anuradha activate corresponding lifecycle milestones according to Navatara Chakra.",
    "metadata": {
      "tradition": "classical",
      "topic": "nakshatras_secrets",
      "subtopic": "anuradha_characteristics",
      "ruleType": "definition",
      "planetarySubjects": [
        "Saturn"
      ],
      "houseSubjects": [],
      "signSubjects": [
        "Scorpio"
      ],
      "vargaSubjects": [
        "D1",
        "D9"
      ],
      "authorityLevel": "authoritative_commentary",
      "tags": [
        "nakshatra",
        "anuradha",
        "saturn",
        "mitra (god of friendship & devotion)",
        "acharya_bharat"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "NAK-SEC-18",
    "sourceText": "The Real Secret of Vedic Astrology - Nakshatras",
    "author": "Acharya Bharat",
    "chapter": "Nakshatra 18: Jyeshtha",
    "sectionOrShloka": "Jyeshtha (Scorpio (16\u00b040' - 30\u00b000')) - Ruler: Mercury",
    "citation": "Nakshatras Secrets (Acharya Bharat), Constellation 18: Jyeshtha",
    "canonicalTranslation": "Jyeshtha (Scorpio (16\u00b040' - 30\u00b000')) is governed by Mercury and presided over by Indra (King of the Gods). Key Significations: Seniority, administrative supremacy, protective courage, occult command, defense engineering, corporate management.",
    "normalizedInterpretation": "When Moon, Lagna, or key career planets occupy Jyeshtha: the native exhibits Seniority, administrative supremacy, protective courage, occult command, defense engineering, corporate management.. Transits over Jyeshtha activate corresponding lifecycle milestones according to Navatara Chakra.",
    "metadata": {
      "tradition": "classical",
      "topic": "nakshatras_secrets",
      "subtopic": "jyeshtha_characteristics",
      "ruleType": "definition",
      "planetarySubjects": [
        "Mercury"
      ],
      "houseSubjects": [],
      "signSubjects": [
        "Scorpio"
      ],
      "vargaSubjects": [
        "D1",
        "D9"
      ],
      "authorityLevel": "authoritative_commentary",
      "tags": [
        "nakshatra",
        "jyeshtha",
        "mercury",
        "indra (king of the gods)",
        "acharya_bharat"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "NAK-SEC-19",
    "sourceText": "The Real Secret of Vedic Astrology - Nakshatras",
    "author": "Acharya Bharat",
    "chapter": "Nakshatra 19: Mula",
    "sectionOrShloka": "Mula (Sagittarius (0\u00b000' - 13\u00b020')) - Ruler: Ketu",
    "citation": "Nakshatras Secrets (Acharya Bharat), Constellation 19: Mula",
    "canonicalTranslation": "Mula (Sagittarius (0\u00b000' - 13\u00b020')) is governed by Ketu and presided over by Nirriti (Goddess of Dissolution). Key Significations: Root investigation, foundational research, pharmaceuticals, botany, data mining, dissolution of superficial structures, deep research.",
    "normalizedInterpretation": "When Moon, Lagna, or key career planets occupy Mula: the native exhibits Root investigation, foundational research, pharmaceuticals, botany, data mining, dissolution of superficial structures, deep research.. Transits over Mula activate corresponding lifecycle milestones according to Navatara Chakra.",
    "metadata": {
      "tradition": "classical",
      "topic": "nakshatras_secrets",
      "subtopic": "mula_characteristics",
      "ruleType": "definition",
      "planetarySubjects": [
        "Ketu"
      ],
      "houseSubjects": [],
      "signSubjects": [
        "Sagittarius"
      ],
      "vargaSubjects": [
        "D1",
        "D9"
      ],
      "authorityLevel": "authoritative_commentary",
      "tags": [
        "nakshatra",
        "mula",
        "ketu",
        "nirriti (goddess of dissolution)",
        "acharya_bharat"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "NAK-SEC-20",
    "sourceText": "The Real Secret of Vedic Astrology - Nakshatras",
    "author": "Acharya Bharat",
    "chapter": "Nakshatra 20: Purva Ashadha",
    "sectionOrShloka": "Purva Ashadha (Sagittarius (13\u00b020' - 26\u00b040')) - Ruler: Venus",
    "citation": "Nakshatras Secrets (Acharya Bharat), Constellation 20: Purva Ashadha",
    "canonicalTranslation": "Purva Ashadha (Sagittarius (13\u00b020' - 26\u00b040')) is governed by Venus and presided over by Apas (Cosmic Water Goddess). Key Significations: Invincible confidence, fluid articulation, naval transport, maritime trade, artistic triumph, declaration of independence.",
    "normalizedInterpretation": "When Moon, Lagna, or key career planets occupy Purva Ashadha: the native exhibits Invincible confidence, fluid articulation, naval transport, maritime trade, artistic triumph, declaration of independence.. Transits over Purva Ashadha activate corresponding lifecycle milestones according to Navatara Chakra.",
    "metadata": {
      "tradition": "classical",
      "topic": "nakshatras_secrets",
      "subtopic": "purva ashadha_characteristics",
      "ruleType": "definition",
      "planetarySubjects": [
        "Venus"
      ],
      "houseSubjects": [],
      "signSubjects": [
        "Sagittarius"
      ],
      "vargaSubjects": [
        "D1",
        "D9"
      ],
      "authorityLevel": "authoritative_commentary",
      "tags": [
        "nakshatra",
        "purva ashadha",
        "venus",
        "apas (cosmic water goddess)",
        "acharya_bharat"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "NAK-SEC-21",
    "sourceText": "The Real Secret of Vedic Astrology - Nakshatras",
    "author": "Acharya Bharat",
    "chapter": "Nakshatra 21: Uttara Ashadha",
    "sectionOrShloka": "Uttara Ashadha (Sagittarius (26\u00b040') - Capricorn (10\u00b000')) - Ruler: Sun",
    "citation": "Nakshatras Secrets (Acharya Bharat), Constellation 21: Uttara Ashadha",
    "canonicalTranslation": "Uttara Ashadha (Sagittarius (26\u00b040') - Capricorn (10\u00b000')) is governed by Sun and presided over by Vishwadevas (Universal Gods). Key Significations: Uncontested victory, permanent institutional stature, judicial integrity, civil service, statesman qualities, enduring achievement.",
    "normalizedInterpretation": "When Moon, Lagna, or key career planets occupy Uttara Ashadha: the native exhibits Uncontested victory, permanent institutional stature, judicial integrity, civil service, statesman qualities, enduring achievement.. Transits over Uttara Ashadha activate corresponding lifecycle milestones according to Navatara Chakra.",
    "metadata": {
      "tradition": "classical",
      "topic": "nakshatras_secrets",
      "subtopic": "uttara ashadha_characteristics",
      "ruleType": "definition",
      "planetarySubjects": [
        "Sun"
      ],
      "houseSubjects": [],
      "signSubjects": [
        "Sagittarius"
      ],
      "vargaSubjects": [
        "D1",
        "D9"
      ],
      "authorityLevel": "authoritative_commentary",
      "tags": [
        "nakshatra",
        "uttara ashadha",
        "sun",
        "vishwadevas (universal gods)",
        "acharya_bharat"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "NAK-SEC-22",
    "sourceText": "The Real Secret of Vedic Astrology - Nakshatras",
    "author": "Acharya Bharat",
    "chapter": "Nakshatra 22: Shravana",
    "sectionOrShloka": "Shravana (Capricorn (10\u00b000' - 23\u00b020')) - Ruler: Moon",
    "citation": "Nakshatras Secrets (Acharya Bharat), Constellation 22: Shravana",
    "canonicalTranslation": "Shravana (Capricorn (10\u00b000' - 23\u00b020')) is governed by Moon and presided over by Vishnu (The Preserver). Key Significations: Hearing, listening, oral tradition, audio engineering, linguistics, intelligence gathering, scholarly research, preservation of wisdom.",
    "normalizedInterpretation": "When Moon, Lagna, or key career planets occupy Shravana: the native exhibits Hearing, listening, oral tradition, audio engineering, linguistics, intelligence gathering, scholarly research, preservation of wisdom.. Transits over Shravana activate corresponding lifecycle milestones according to Navatara Chakra.",
    "metadata": {
      "tradition": "classical",
      "topic": "nakshatras_secrets",
      "subtopic": "shravana_characteristics",
      "ruleType": "definition",
      "planetarySubjects": [
        "Moon"
      ],
      "houseSubjects": [],
      "signSubjects": [
        "Capricorn"
      ],
      "vargaSubjects": [
        "D1",
        "D9"
      ],
      "authorityLevel": "authoritative_commentary",
      "tags": [
        "nakshatra",
        "shravana",
        "moon",
        "vishnu (the preserver)",
        "acharya_bharat"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "NAK-SEC-23",
    "sourceText": "The Real Secret of Vedic Astrology - Nakshatras",
    "author": "Acharya Bharat",
    "chapter": "Nakshatra 23: Dhanishta",
    "sectionOrShloka": "Dhanishta (Capricorn (23\u00b020') - Aquarius (6\u00b040')) - Ruler: Mars",
    "citation": "Nakshatras Secrets (Acharya Bharat), Constellation 23: Dhanishta",
    "canonicalTranslation": "Dhanishta (Capricorn (23\u00b020') - Aquarius (6\u00b040')) is governed by Mars and presided over by Ashta Vasus (The Eight Beneficent Elements). Key Significations: Rhythm, music, wealth, real estate, electronic instrumentation, martial arts, drums, corporate acquisitions.",
    "normalizedInterpretation": "When Moon, Lagna, or key career planets occupy Dhanishta: the native exhibits Rhythm, music, wealth, real estate, electronic instrumentation, martial arts, drums, corporate acquisitions.. Transits over Dhanishta activate corresponding lifecycle milestones according to Navatara Chakra.",
    "metadata": {
      "tradition": "classical",
      "topic": "nakshatras_secrets",
      "subtopic": "dhanishta_characteristics",
      "ruleType": "definition",
      "planetarySubjects": [
        "Mars"
      ],
      "houseSubjects": [],
      "signSubjects": [
        "Capricorn"
      ],
      "vargaSubjects": [
        "D1",
        "D9"
      ],
      "authorityLevel": "authoritative_commentary",
      "tags": [
        "nakshatra",
        "dhanishta",
        "mars",
        "ashta vasus (the eight beneficent elements)",
        "acharya_bharat"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "NAK-SEC-24",
    "sourceText": "The Real Secret of Vedic Astrology - Nakshatras",
    "author": "Acharya Bharat",
    "chapter": "Nakshatra 24: Shatabhisha",
    "sectionOrShloka": "Shatabhisha (Aquarius (6\u00b040' - 20\u00b000')) - Ruler: Rahu",
    "citation": "Nakshatras Secrets (Acharya Bharat), Constellation 24: Shatabhisha",
    "canonicalTranslation": "Shatabhisha (Aquarius (6\u00b040' - 20\u00b000')) is governed by Rahu and presided over by Varuna (Cosmic Ocean & Cosmic Law). Key Significations: The hundred physicians, biomedical research, pharmacology, space sciences, advanced radar, secret intelligence, healing mysteries.",
    "normalizedInterpretation": "When Moon, Lagna, or key career planets occupy Shatabhisha: the native exhibits The hundred physicians, biomedical research, pharmacology, space sciences, advanced radar, secret intelligence, healing mysteries.. Transits over Shatabhisha activate corresponding lifecycle milestones according to Navatara Chakra.",
    "metadata": {
      "tradition": "classical",
      "topic": "nakshatras_secrets",
      "subtopic": "shatabhisha_characteristics",
      "ruleType": "definition",
      "planetarySubjects": [
        "Rahu"
      ],
      "houseSubjects": [],
      "signSubjects": [
        "Aquarius"
      ],
      "vargaSubjects": [
        "D1",
        "D9"
      ],
      "authorityLevel": "authoritative_commentary",
      "tags": [
        "nakshatra",
        "shatabhisha",
        "rahu",
        "varuna (cosmic ocean & cosmic law)",
        "acharya_bharat"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "NAK-SEC-25",
    "sourceText": "The Real Secret of Vedic Astrology - Nakshatras",
    "author": "Acharya Bharat",
    "chapter": "Nakshatra 25: Purva Bhadrapada",
    "sectionOrShloka": "Purva Bhadrapada (Aquarius (20\u00b000') - Pisces (3\u00b020')) - Ruler: Jupiter",
    "citation": "Nakshatras Secrets (Acharya Bharat), Constellation 25: Purva Bhadrapada",
    "canonicalTranslation": "Purva Bhadrapada (Aquarius (20\u00b000') - Pisces (3\u00b020')) is governed by Jupiter and presided over by Aja Ekapada (One-Footed Cosmic Serpent). Key Significations: Ascetic intensity, occult science, radical breakthroughs, philosophical depth, financial transformation, fierce detachment.",
    "normalizedInterpretation": "When Moon, Lagna, or key career planets occupy Purva Bhadrapada: the native exhibits Ascetic intensity, occult science, radical breakthroughs, philosophical depth, financial transformation, fierce detachment.. Transits over Purva Bhadrapada activate corresponding lifecycle milestones according to Navatara Chakra.",
    "metadata": {
      "tradition": "classical",
      "topic": "nakshatras_secrets",
      "subtopic": "purva bhadrapada_characteristics",
      "ruleType": "definition",
      "planetarySubjects": [
        "Jupiter"
      ],
      "houseSubjects": [],
      "signSubjects": [
        "Aquarius"
      ],
      "vargaSubjects": [
        "D1",
        "D9"
      ],
      "authorityLevel": "authoritative_commentary",
      "tags": [
        "nakshatra",
        "purva bhadrapada",
        "jupiter",
        "aja ekapada (one-footed cosmic serpent)",
        "acharya_bharat"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "NAK-SEC-26",
    "sourceText": "The Real Secret of Vedic Astrology - Nakshatras",
    "author": "Acharya Bharat",
    "chapter": "Nakshatra 26: Uttara Bhadrapada",
    "sectionOrShloka": "Uttara Bhadrapada (Pisces (3\u00b020' - 16\u00b040')) - Ruler: Saturn",
    "citation": "Nakshatras Secrets (Acharya Bharat), Constellation 26: Uttara Bhadrapada",
    "canonicalTranslation": "Uttara Bhadrapada (Pisces (3\u00b020' - 16\u00b040')) is governed by Saturn and presided over by Ahirbudhnya (Serpent of the Deep Waters). Key Significations: Deep wisdom, meditative tranquility, institutional benevolence, oceanographic sciences, charitable trusts, unshakeable calm.",
    "normalizedInterpretation": "When Moon, Lagna, or key career planets occupy Uttara Bhadrapada: the native exhibits Deep wisdom, meditative tranquility, institutional benevolence, oceanographic sciences, charitable trusts, unshakeable calm.. Transits over Uttara Bhadrapada activate corresponding lifecycle milestones according to Navatara Chakra.",
    "metadata": {
      "tradition": "classical",
      "topic": "nakshatras_secrets",
      "subtopic": "uttara bhadrapada_characteristics",
      "ruleType": "definition",
      "planetarySubjects": [
        "Saturn"
      ],
      "houseSubjects": [],
      "signSubjects": [
        "Pisces"
      ],
      "vargaSubjects": [
        "D1",
        "D9"
      ],
      "authorityLevel": "authoritative_commentary",
      "tags": [
        "nakshatra",
        "uttara bhadrapada",
        "saturn",
        "ahirbudhnya (serpent of the deep waters)",
        "acharya_bharat"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "NAK-SEC-27",
    "sourceText": "The Real Secret of Vedic Astrology - Nakshatras",
    "author": "Acharya Bharat",
    "chapter": "Nakshatra 27: Revati",
    "sectionOrShloka": "Revati (Pisces (16\u00b040' - 30\u00b000')) - Ruler: Mercury",
    "citation": "Nakshatras Secrets (Acharya Bharat), Constellation 27: Revati",
    "canonicalTranslation": "Revati (Pisces (16\u00b040' - 30\u00b000')) is governed by Mercury and presided over by Pushan (The Nourisher & Guide of Travelers). Key Significations: Guidance, safe journeys, animal welfare, trade, subtle intuition, financial accounting, gentle compassion, spiritual liberation.",
    "normalizedInterpretation": "When Moon, Lagna, or key career planets occupy Revati: the native exhibits Guidance, safe journeys, animal welfare, trade, subtle intuition, financial accounting, gentle compassion, spiritual liberation.. Transits over Revati activate corresponding lifecycle milestones according to Navatara Chakra.",
    "metadata": {
      "tradition": "classical",
      "topic": "nakshatras_secrets",
      "subtopic": "revati_characteristics",
      "ruleType": "definition",
      "planetarySubjects": [
        "Mercury"
      ],
      "houseSubjects": [],
      "signSubjects": [
        "Pisces"
      ],
      "vargaSubjects": [
        "D1",
        "D9"
      ],
      "authorityLevel": "authoritative_commentary",
      "tags": [
        "nakshatra",
        "revati",
        "mercury",
        "pushan (the nourisher & guide of travelers)",
        "acharya_bharat"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "NUM-COMP-10",
    "sourceText": "The ABC of Flawless Advanced Numerology",
    "author": "Cheiro & Vedic Numerology Research",
    "chapter": "Compound Number 10: Wheel of Fortune",
    "sectionOrShloka": "Occult Vibration of 10",
    "citation": "Advanced Numerology, Compound Number 10: Wheel of Fortune",
    "canonicalTranslation": "Compound Number 10 (Wheel of Fortune): Number of Rise and Fall; symbolizes honor, faith, and success in plans; one can be fortunate or unfortunate depending on how desire is channeled.",
    "normalizedInterpretation": "When a person's name number, birth day, or destiny compound reduces to 10: the life is colored by the archetype of 'Wheel of Fortune'. Number of Rise and Fall; symbolizes honor, faith, and success in plans; one can be fortunate or unfortunate depending on how desire is channeled.",
    "metadata": {
      "tradition": "empirical_modern",
      "topic": "advanced_numerology",
      "subtopic": "compound_number_10",
      "ruleType": "definition",
      "planetarySubjects": [],
      "houseSubjects": [],
      "signSubjects": [],
      "vargaSubjects": [],
      "authorityLevel": "authoritative_commentary",
      "tags": [
        "numerology",
        "number_10",
        "wheel_of_fortune",
        "cheiro",
        "occult_vibration"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "NUM-COMP-11",
    "sourceText": "The ABC of Flawless Advanced Numerology",
    "author": "Cheiro & Vedic Numerology Research",
    "chapter": "Compound Number 11: The Clashing Lions",
    "sectionOrShloka": "Occult Vibration of 11",
    "citation": "Advanced Numerology, Compound Number 11: The Clashing Lions",
    "canonicalTranslation": "Compound Number 11 (The Clashing Lions): Number of Hidden Trials and Treachery; warns of hidden dangers, betrayals from friends, and subtle spiritual conflict.",
    "normalizedInterpretation": "When a person's name number, birth day, or destiny compound reduces to 11: the life is colored by the archetype of 'The Clashing Lions'. Number of Hidden Trials and Treachery; warns of hidden dangers, betrayals from friends, and subtle spiritual conflict.",
    "metadata": {
      "tradition": "empirical_modern",
      "topic": "advanced_numerology",
      "subtopic": "compound_number_11",
      "ruleType": "definition",
      "planetarySubjects": [],
      "houseSubjects": [],
      "signSubjects": [],
      "vargaSubjects": [],
      "authorityLevel": "authoritative_commentary",
      "tags": [
        "numerology",
        "number_11",
        "the_clashing_lions",
        "cheiro",
        "occult_vibration"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "NUM-COMP-12",
    "sourceText": "The ABC of Flawless Advanced Numerology",
    "author": "Cheiro & Vedic Numerology Research",
    "chapter": "Compound Number 12: The Sacrifice / The Victim",
    "sectionOrShloka": "Occult Vibration of 12",
    "citation": "Advanced Numerology, Compound Number 12: The Sacrifice / The Victim",
    "canonicalTranslation": "Compound Number 12 (The Sacrifice / The Victim): Number of Anxieties and Self-Sacrifice; indicates being made a scapegoat or enduring victimhood for the sake of others.",
    "normalizedInterpretation": "When a person's name number, birth day, or destiny compound reduces to 12: the life is colored by the archetype of 'The Sacrifice / The Victim'. Number of Anxieties and Self-Sacrifice; indicates being made a scapegoat or enduring victimhood for the sake of others.",
    "metadata": {
      "tradition": "empirical_modern",
      "topic": "advanced_numerology",
      "subtopic": "compound_number_12",
      "ruleType": "definition",
      "planetarySubjects": [],
      "houseSubjects": [],
      "signSubjects": [],
      "vargaSubjects": [],
      "authorityLevel": "authoritative_commentary",
      "tags": [
        "numerology",
        "number_12",
        "the_sacrifice_/_the_victim",
        "cheiro",
        "occult_vibration"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "NUM-COMP-13",
    "sourceText": "The ABC of Flawless Advanced Numerology",
    "author": "Cheiro & Vedic Numerology Research",
    "chapter": "Compound Number 13: Regeneration / Change",
    "sectionOrShloka": "Occult Vibration of 13",
    "citation": "Advanced Numerology, Compound Number 13: Regeneration / Change",
    "canonicalTranslation": "Compound Number 13 (Regeneration / Change): Number of Metamorphosis; often misunderstood as unlucky, it represents sudden transformation, upheaval, and radical renewal.",
    "normalizedInterpretation": "When a person's name number, birth day, or destiny compound reduces to 13: the life is colored by the archetype of 'Regeneration / Change'. Number of Metamorphosis; often misunderstood as unlucky, it represents sudden transformation, upheaval, and radical renewal.",
    "metadata": {
      "tradition": "empirical_modern",
      "topic": "advanced_numerology",
      "subtopic": "compound_number_13",
      "ruleType": "definition",
      "planetarySubjects": [],
      "houseSubjects": [],
      "signSubjects": [],
      "vargaSubjects": [],
      "authorityLevel": "authoritative_commentary",
      "tags": [
        "numerology",
        "number_13",
        "regeneration_/_change",
        "cheiro",
        "occult_vibration"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "NUM-COMP-14",
    "sourceText": "The ABC of Flawless Advanced Numerology",
    "author": "Cheiro & Vedic Numerology Research",
    "chapter": "Compound Number 14: Movement and Challenge",
    "sectionOrShloka": "Occult Vibration of 14",
    "citation": "Advanced Numerology, Compound Number 14: Movement and Challenge",
    "canonicalTranslation": "Compound Number 14 (Movement and Challenge): Number of Magnetic Energy; combines risk with financial speculation; warns of perils from wind/water and financial tempests.",
    "normalizedInterpretation": "When a person's name number, birth day, or destiny compound reduces to 14: the life is colored by the archetype of 'Movement and Challenge'. Number of Magnetic Energy; combines risk with financial speculation; warns of perils from wind/water and financial tempests.",
    "metadata": {
      "tradition": "empirical_modern",
      "topic": "advanced_numerology",
      "subtopic": "compound_number_14",
      "ruleType": "definition",
      "planetarySubjects": [],
      "houseSubjects": [],
      "signSubjects": [],
      "vargaSubjects": [],
      "authorityLevel": "authoritative_commentary",
      "tags": [
        "numerology",
        "number_14",
        "movement_and_challenge",
        "cheiro",
        "occult_vibration"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "NUM-COMP-15",
    "sourceText": "The ABC of Flawless Advanced Numerology",
    "author": "Cheiro & Vedic Numerology Research",
    "chapter": "Compound Number 15: The Magician / Mystery",
    "sectionOrShloka": "Occult Vibration of 15",
    "citation": "Advanced Numerology, Compound Number 15: The Magician / Mystery",
    "canonicalTranslation": "Compound Number 15 (The Magician / Mystery): Number of Eloquence and Magnetism; strongly governed by Venus; bestows artistic gifts, hypnotic speech, and material charm.",
    "normalizedInterpretation": "When a person's name number, birth day, or destiny compound reduces to 15: the life is colored by the archetype of 'The Magician / Mystery'. Number of Eloquence and Magnetism; strongly governed by Venus; bestows artistic gifts, hypnotic speech, and material charm.",
    "metadata": {
      "tradition": "empirical_modern",
      "topic": "advanced_numerology",
      "subtopic": "compound_number_15",
      "ruleType": "definition",
      "planetarySubjects": [],
      "houseSubjects": [],
      "signSubjects": [],
      "vargaSubjects": [],
      "authorityLevel": "authoritative_commentary",
      "tags": [
        "numerology",
        "number_15",
        "the_magician_/_mystery",
        "cheiro",
        "occult_vibration"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "NUM-COMP-16",
    "sourceText": "The ABC of Flawless Advanced Numerology",
    "author": "Cheiro & Vedic Numerology Research",
    "chapter": "Compound Number 16: The Shattered Citadel",
    "sectionOrShloka": "Occult Vibration of 16",
    "citation": "Advanced Numerology, Compound Number 16: The Shattered Citadel",
    "canonicalTranslation": "Compound Number 16 (The Shattered Citadel): Number of Karmic Fall; warns of sudden collapse of pride, accidents, or loss of high status; calls for humble spiritual grounding.",
    "normalizedInterpretation": "When a person's name number, birth day, or destiny compound reduces to 16: the life is colored by the archetype of 'The Shattered Citadel'. Number of Karmic Fall; warns of sudden collapse of pride, accidents, or loss of high status; calls for humble spiritual grounding.",
    "metadata": {
      "tradition": "empirical_modern",
      "topic": "advanced_numerology",
      "subtopic": "compound_number_16",
      "ruleType": "definition",
      "planetarySubjects": [],
      "houseSubjects": [],
      "signSubjects": [],
      "vargaSubjects": [],
      "authorityLevel": "authoritative_commentary",
      "tags": [
        "numerology",
        "number_16",
        "the_shattered_citadel",
        "cheiro",
        "occult_vibration"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "NUM-COMP-17",
    "sourceText": "The ABC of Flawless Advanced Numerology",
    "author": "Cheiro & Vedic Numerology Research",
    "chapter": "Compound Number 17: The Star of the Magi",
    "sectionOrShloka": "Occult Vibration of 17",
    "citation": "Advanced Numerology, Compound Number 17: The Star of the Magi",
    "canonicalTranslation": "Compound Number 17 (The Star of the Magi): Number of Hope and Immortality; a highly spiritual and fortunate number; bestows enduring reputation, fame, and divine protection.",
    "normalizedInterpretation": "When a person's name number, birth day, or destiny compound reduces to 17: the life is colored by the archetype of 'The Star of the Magi'. Number of Hope and Immortality; a highly spiritual and fortunate number; bestows enduring reputation, fame, and divine protection.",
    "metadata": {
      "tradition": "empirical_modern",
      "topic": "advanced_numerology",
      "subtopic": "compound_number_17",
      "ruleType": "definition",
      "planetarySubjects": [],
      "houseSubjects": [],
      "signSubjects": [],
      "vargaSubjects": [],
      "authorityLevel": "authoritative_commentary",
      "tags": [
        "numerology",
        "number_17",
        "the_star_of_the_magi",
        "cheiro",
        "occult_vibration"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "NUM-COMP-18",
    "sourceText": "The ABC of Flawless Advanced Numerology",
    "author": "Cheiro & Vedic Numerology Research",
    "chapter": "Compound Number 18: Internal Conflict and Deception",
    "sectionOrShloka": "Occult Vibration of 18",
    "citation": "Advanced Numerology, Compound Number 18: Internal Conflict and Deception",
    "canonicalTranslation": "Compound Number 18 (Internal Conflict and Deception): Number of War and Quarrels; indicates conflicts within families, treachery, and struggles with deception or litigation.",
    "normalizedInterpretation": "When a person's name number, birth day, or destiny compound reduces to 18: the life is colored by the archetype of 'Internal Conflict and Deception'. Number of War and Quarrels; indicates conflicts within families, treachery, and struggles with deception or litigation.",
    "metadata": {
      "tradition": "empirical_modern",
      "topic": "advanced_numerology",
      "subtopic": "compound_number_18",
      "ruleType": "definition",
      "planetarySubjects": [],
      "houseSubjects": [],
      "signSubjects": [],
      "vargaSubjects": [],
      "authorityLevel": "authoritative_commentary",
      "tags": [
        "numerology",
        "number_18",
        "internal_conflict_and_deception",
        "cheiro",
        "occult_vibration"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "NUM-COMP-19",
    "sourceText": "The ABC of Flawless Advanced Numerology",
    "author": "Cheiro & Vedic Numerology Research",
    "chapter": "Compound Number 19: The Prince of Heaven",
    "sectionOrShloka": "Occult Vibration of 19",
    "citation": "Advanced Numerology, Compound Number 19: The Prince of Heaven",
    "canonicalTranslation": "Compound Number 19 (The Prince of Heaven): Number of Supreme Success and Joy; one of the most fortunate numbers in numerology; guarantees happiness, honor, and triumphant victory.",
    "normalizedInterpretation": "When a person's name number, birth day, or destiny compound reduces to 19: the life is colored by the archetype of 'The Prince of Heaven'. Number of Supreme Success and Joy; one of the most fortunate numbers in numerology; guarantees happiness, honor, and triumphant victory.",
    "metadata": {
      "tradition": "empirical_modern",
      "topic": "advanced_numerology",
      "subtopic": "compound_number_19",
      "ruleType": "definition",
      "planetarySubjects": [],
      "houseSubjects": [],
      "signSubjects": [],
      "vargaSubjects": [],
      "authorityLevel": "authoritative_commentary",
      "tags": [
        "numerology",
        "number_19",
        "the_prince_of_heaven",
        "cheiro",
        "occult_vibration"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "NUM-COMP-20",
    "sourceText": "The ABC of Flawless Advanced Numerology",
    "author": "Cheiro & Vedic Numerology Research",
    "chapter": "Compound Number 20: The Awakening",
    "sectionOrShloka": "Occult Vibration of 20",
    "citation": "Advanced Numerology, Compound Number 20: The Awakening",
    "canonicalTranslation": "Compound Number 20 (The Awakening): Number of Purpose and Renewal; calls for new ambitions and spiritual awakening; not a material number but brings great inner clarity.",
    "normalizedInterpretation": "When a person's name number, birth day, or destiny compound reduces to 20: the life is colored by the archetype of 'The Awakening'. Number of Purpose and Renewal; calls for new ambitions and spiritual awakening; not a material number but brings great inner clarity.",
    "metadata": {
      "tradition": "empirical_modern",
      "topic": "advanced_numerology",
      "subtopic": "compound_number_20",
      "ruleType": "definition",
      "planetarySubjects": [],
      "houseSubjects": [],
      "signSubjects": [],
      "vargaSubjects": [],
      "authorityLevel": "authoritative_commentary",
      "tags": [
        "numerology",
        "number_20",
        "the_awakening",
        "cheiro",
        "occult_vibration"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "NUM-COMP-21",
    "sourceText": "The ABC of Flawless Advanced Numerology",
    "author": "Cheiro & Vedic Numerology Research",
    "chapter": "Compound Number 21: The Crown of the Magi",
    "sectionOrShloka": "Occult Vibration of 21",
    "citation": "Advanced Numerology, Compound Number 21: The Crown of the Magi",
    "canonicalTranslation": "Compound Number 21 (The Crown of the Magi): Number of Worldly Advancement; promises general success, high awards, elevation in career, and enduring victory.",
    "normalizedInterpretation": "When a person's name number, birth day, or destiny compound reduces to 21: the life is colored by the archetype of 'The Crown of the Magi'. Number of Worldly Advancement; promises general success, high awards, elevation in career, and enduring victory.",
    "metadata": {
      "tradition": "empirical_modern",
      "topic": "advanced_numerology",
      "subtopic": "compound_number_21",
      "ruleType": "definition",
      "planetarySubjects": [],
      "houseSubjects": [],
      "signSubjects": [],
      "vargaSubjects": [],
      "authorityLevel": "authoritative_commentary",
      "tags": [
        "numerology",
        "number_21",
        "the_crown_of_the_magi",
        "cheiro",
        "occult_vibration"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "NUM-COMP-22",
    "sourceText": "The ABC of Flawless Advanced Numerology",
    "author": "Cheiro & Vedic Numerology Research",
    "chapter": "Compound Number 22: The Blindfolded Visionary",
    "sectionOrShloka": "Occult Vibration of 22",
    "citation": "Advanced Numerology, Compound Number 22: The Blindfolded Visionary",
    "canonicalTranslation": "Compound Number 22 (The Blindfolded Visionary): Number of Illusion and Warning; warns of living in a fool's paradise, false friends, and misplaced trust.",
    "normalizedInterpretation": "When a person's name number, birth day, or destiny compound reduces to 22: the life is colored by the archetype of 'The Blindfolded Visionary'. Number of Illusion and Warning; warns of living in a fool's paradise, false friends, and misplaced trust.",
    "metadata": {
      "tradition": "empirical_modern",
      "topic": "advanced_numerology",
      "subtopic": "compound_number_22",
      "ruleType": "definition",
      "planetarySubjects": [],
      "houseSubjects": [],
      "signSubjects": [],
      "vargaSubjects": [],
      "authorityLevel": "authoritative_commentary",
      "tags": [
        "numerology",
        "number_22",
        "the_blindfolded_visionary",
        "cheiro",
        "occult_vibration"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "NUM-COMP-23",
    "sourceText": "The ABC of Flawless Advanced Numerology",
    "author": "Cheiro & Vedic Numerology Research",
    "chapter": "Compound Number 23: The Royal Star of the Lion",
    "sectionOrShloka": "Occult Vibration of 23",
    "citation": "Advanced Numerology, Compound Number 23: The Royal Star of the Lion",
    "canonicalTranslation": "Compound Number 23 (The Royal Star of the Lion): Number of Lion-Hearted Success; bestows high executive authority, royal favors, career triumph, and victory over adversaries.",
    "normalizedInterpretation": "When a person's name number, birth day, or destiny compound reduces to 23: the life is colored by the archetype of 'The Royal Star of the Lion'. Number of Lion-Hearted Success; bestows high executive authority, royal favors, career triumph, and victory over adversaries.",
    "metadata": {
      "tradition": "empirical_modern",
      "topic": "advanced_numerology",
      "subtopic": "compound_number_23",
      "ruleType": "definition",
      "planetarySubjects": [],
      "houseSubjects": [],
      "signSubjects": [],
      "vargaSubjects": [],
      "authorityLevel": "authoritative_commentary",
      "tags": [
        "numerology",
        "number_23",
        "the_royal_star_of_the_lion",
        "cheiro",
        "occult_vibration"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "NUM-COMP-24",
    "sourceText": "The ABC of Flawless Advanced Numerology",
    "author": "Cheiro & Vedic Numerology Research",
    "chapter": "Compound Number 24: Love and Money",
    "sectionOrShloka": "Occult Vibration of 24",
    "citation": "Advanced Numerology, Compound Number 24: Love and Money",
    "canonicalTranslation": "Compound Number 24 (Love and Money): Number of Harmonious Fortune; brings assistance from people in high ranks, romantic bliss, and steady financial prosperity.",
    "normalizedInterpretation": "When a person's name number, birth day, or destiny compound reduces to 24: the life is colored by the archetype of 'Love and Money'. Number of Harmonious Fortune; brings assistance from people in high ranks, romantic bliss, and steady financial prosperity.",
    "metadata": {
      "tradition": "empirical_modern",
      "topic": "advanced_numerology",
      "subtopic": "compound_number_24",
      "ruleType": "definition",
      "planetarySubjects": [],
      "houseSubjects": [],
      "signSubjects": [],
      "vargaSubjects": [],
      "authorityLevel": "authoritative_commentary",
      "tags": [
        "numerology",
        "number_24",
        "love_and_money",
        "cheiro",
        "occult_vibration"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "NUM-COMP-25",
    "sourceText": "The ABC of Flawless Advanced Numerology",
    "author": "Cheiro & Vedic Numerology Research",
    "chapter": "Compound Number 25: Wisdom through Trials",
    "sectionOrShloka": "Occult Vibration of 25",
    "citation": "Advanced Numerology, Compound Number 25: Wisdom through Trials",
    "canonicalTranslation": "Compound Number 25 (Wisdom through Trials): Number of Hard-Won Insight; indicates spiritual discrimination gained through observation of worldly struggles.",
    "normalizedInterpretation": "When a person's name number, birth day, or destiny compound reduces to 25: the life is colored by the archetype of 'Wisdom through Trials'. Number of Hard-Won Insight; indicates spiritual discrimination gained through observation of worldly struggles.",
    "metadata": {
      "tradition": "empirical_modern",
      "topic": "advanced_numerology",
      "subtopic": "compound_number_25",
      "ruleType": "definition",
      "planetarySubjects": [],
      "houseSubjects": [],
      "signSubjects": [],
      "vargaSubjects": [],
      "authorityLevel": "authoritative_commentary",
      "tags": [
        "numerology",
        "number_25",
        "wisdom_through_trials",
        "cheiro",
        "occult_vibration"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "NUM-COMP-26",
    "sourceText": "The ABC of Flawless Advanced Numerology",
    "author": "Cheiro & Vedic Numerology Research",
    "chapter": "Compound Number 26: Partnership Hazards",
    "sectionOrShloka": "Occult Vibration of 26",
    "citation": "Advanced Numerology, Compound Number 26: Partnership Hazards",
    "canonicalTranslation": "Compound Number 26 (Partnership Hazards): Number of Grave Warnings; warns of disasters through speculative partnerships, ruinous associations, and bad debts.",
    "normalizedInterpretation": "When a person's name number, birth day, or destiny compound reduces to 26: the life is colored by the archetype of 'Partnership Hazards'. Number of Grave Warnings; warns of disasters through speculative partnerships, ruinous associations, and bad debts.",
    "metadata": {
      "tradition": "empirical_modern",
      "topic": "advanced_numerology",
      "subtopic": "compound_number_26",
      "ruleType": "definition",
      "planetarySubjects": [],
      "houseSubjects": [],
      "signSubjects": [],
      "vargaSubjects": [],
      "authorityLevel": "authoritative_commentary",
      "tags": [
        "numerology",
        "number_26",
        "partnership_hazards",
        "cheiro",
        "occult_vibration"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "NUM-COMP-27",
    "sourceText": "The ABC of Flawless Advanced Numerology",
    "author": "Cheiro & Vedic Numerology Research",
    "chapter": "Compound Number 27: The Sceptre",
    "sectionOrShloka": "Occult Vibration of 27",
    "citation": "Advanced Numerology, Compound Number 27: The Sceptre",
    "canonicalTranslation": "Compound Number 27 (The Sceptre): Number of High Intelligence and Command; promises command over groups, creative mastery, literary honor, and executive status.",
    "normalizedInterpretation": "When a person's name number, birth day, or destiny compound reduces to 27: the life is colored by the archetype of 'The Sceptre'. Number of High Intelligence and Command; promises command over groups, creative mastery, literary honor, and executive status.",
    "metadata": {
      "tradition": "empirical_modern",
      "topic": "advanced_numerology",
      "subtopic": "compound_number_27",
      "ruleType": "definition",
      "planetarySubjects": [],
      "houseSubjects": [],
      "signSubjects": [],
      "vargaSubjects": [],
      "authorityLevel": "authoritative_commentary",
      "tags": [
        "numerology",
        "number_27",
        "the_sceptre",
        "cheiro",
        "occult_vibration"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "NUM-COMP-28",
    "sourceText": "The ABC of Flawless Advanced Numerology",
    "author": "Cheiro & Vedic Numerology Research",
    "chapter": "Compound Number 28: The Broken Straw",
    "sectionOrShloka": "Occult Vibration of 28",
    "citation": "Advanced Numerology, Compound Number 28: The Broken Straw",
    "canonicalTranslation": "Compound Number 28 (The Broken Straw): Number of Trust Betrayal; indicates great promise broken by placing unmerited trust in friends or partners; legal vulnerabilities.",
    "normalizedInterpretation": "When a person's name number, birth day, or destiny compound reduces to 28: the life is colored by the archetype of 'The Broken Straw'. Number of Trust Betrayal; indicates great promise broken by placing unmerited trust in friends or partners; legal vulnerabilities.",
    "metadata": {
      "tradition": "empirical_modern",
      "topic": "advanced_numerology",
      "subtopic": "compound_number_28",
      "ruleType": "definition",
      "planetarySubjects": [],
      "houseSubjects": [],
      "signSubjects": [],
      "vargaSubjects": [],
      "authorityLevel": "authoritative_commentary",
      "tags": [
        "numerology",
        "number_28",
        "the_broken_straw",
        "cheiro",
        "occult_vibration"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "NUM-COMP-29",
    "sourceText": "The ABC of Flawless Advanced Numerology",
    "author": "Cheiro & Vedic Numerology Research",
    "chapter": "Compound Number 29: Uncertainty and Trials",
    "sectionOrShloka": "Occult Vibration of 29",
    "citation": "Advanced Numerology, Compound Number 29: Uncertainty and Trials",
    "canonicalTranslation": "Compound Number 29 (Uncertainty and Trials): Number of Deception in Partnerships; warns of severe emotional let-downs, betrayal from the opposite gender, and grief.",
    "normalizedInterpretation": "When a person's name number, birth day, or destiny compound reduces to 29: the life is colored by the archetype of 'Uncertainty and Trials'. Number of Deception in Partnerships; warns of severe emotional let-downs, betrayal from the opposite gender, and grief.",
    "metadata": {
      "tradition": "empirical_modern",
      "topic": "advanced_numerology",
      "subtopic": "compound_number_29",
      "ruleType": "definition",
      "planetarySubjects": [],
      "houseSubjects": [],
      "signSubjects": [],
      "vargaSubjects": [],
      "authorityLevel": "authoritative_commentary",
      "tags": [
        "numerology",
        "number_29",
        "uncertainty_and_trials",
        "cheiro",
        "occult_vibration"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "NUM-COMP-30",
    "sourceText": "The ABC of Flawless Advanced Numerology",
    "author": "Cheiro & Vedic Numerology Research",
    "chapter": "Compound Number 30: Mental Superiority",
    "sectionOrShloka": "Occult Vibration of 30",
    "citation": "Advanced Numerology, Compound Number 30: Mental Superiority",
    "canonicalTranslation": "Compound Number 30 (Mental Superiority): Number of Intellectual Command; indicates intellectual brilliance, scholarly output, and philosophical mastery over material pursuits.",
    "normalizedInterpretation": "When a person's name number, birth day, or destiny compound reduces to 30: the life is colored by the archetype of 'Mental Superiority'. Number of Intellectual Command; indicates intellectual brilliance, scholarly output, and philosophical mastery over material pursuits.",
    "metadata": {
      "tradition": "empirical_modern",
      "topic": "advanced_numerology",
      "subtopic": "compound_number_30",
      "ruleType": "definition",
      "planetarySubjects": [],
      "houseSubjects": [],
      "signSubjects": [],
      "vargaSubjects": [],
      "authorityLevel": "authoritative_commentary",
      "tags": [
        "numerology",
        "number_30",
        "mental_superiority",
        "cheiro",
        "occult_vibration"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "NUM-COMP-31",
    "sourceText": "The ABC of Flawless Advanced Numerology",
    "author": "Cheiro & Vedic Numerology Research",
    "chapter": "Compound Number 31: The Solitary Thinker",
    "sectionOrShloka": "Occult Vibration of 31",
    "citation": "Advanced Numerology, Compound Number 31: The Solitary Thinker",
    "canonicalTranslation": "Compound Number 31 (The Solitary Thinker): Number of Seclusion and Self-Contained Focus; indicates one who walks alone, aloof from society, pursuing solitary research.",
    "normalizedInterpretation": "When a person's name number, birth day, or destiny compound reduces to 31: the life is colored by the archetype of 'The Solitary Thinker'. Number of Seclusion and Self-Contained Focus; indicates one who walks alone, aloof from society, pursuing solitary research.",
    "metadata": {
      "tradition": "empirical_modern",
      "topic": "advanced_numerology",
      "subtopic": "compound_number_31",
      "ruleType": "definition",
      "planetarySubjects": [],
      "houseSubjects": [],
      "signSubjects": [],
      "vargaSubjects": [],
      "authorityLevel": "authoritative_commentary",
      "tags": [
        "numerology",
        "number_31",
        "the_solitary_thinker",
        "cheiro",
        "occult_vibration"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "NUM-COMP-32",
    "sourceText": "The ABC of Flawless Advanced Numerology",
    "author": "Cheiro & Vedic Numerology Research",
    "chapter": "Compound Number 32: Magnetic Alliance",
    "sectionOrShloka": "Occult Vibration of 32",
    "citation": "Advanced Numerology, Compound Number 32: Magnetic Alliance",
    "canonicalTranslation": "Compound Number 32 (Magnetic Alliance): Number of International Connections; indicates power through collective associations, foreign enterprises, and massive social influence.",
    "normalizedInterpretation": "When a person's name number, birth day, or destiny compound reduces to 32: the life is colored by the archetype of 'Magnetic Alliance'. Number of International Connections; indicates power through collective associations, foreign enterprises, and massive social influence.",
    "metadata": {
      "tradition": "empirical_modern",
      "topic": "advanced_numerology",
      "subtopic": "compound_number_32",
      "ruleType": "definition",
      "planetarySubjects": [],
      "houseSubjects": [],
      "signSubjects": [],
      "vargaSubjects": [],
      "authorityLevel": "authoritative_commentary",
      "tags": [
        "numerology",
        "number_32",
        "magnetic_alliance",
        "cheiro",
        "occult_vibration"
      ]
    },
    "version": "1.0",
    "verified": true
  },
  {
    "id": "NUM-COMP-33",
    "sourceText": "The ABC of Flawless Advanced Numerology",
    "author": "Cheiro & Vedic Numerology Research",
    "chapter": "Compound Number 33: The Master Teacher",
    "sectionOrShloka": "Occult Vibration of 33",
    "citation": "Advanced Numerology, Compound Number 33: The Master Teacher",
    "canonicalTranslation": "Compound Number 33 (The Master Teacher): Number of Holy Compassion; the highest spiritual vibration; brings selfless service, spiritual teaching, and profound healing influence.",
    "normalizedInterpretation": "When a person's name number, birth day, or destiny compound reduces to 33: the life is colored by the archetype of 'The Master Teacher'. Number of Holy Compassion; the highest spiritual vibration; brings selfless service, spiritual teaching, and profound healing influence.",
    "metadata": {
      "tradition": "empirical_modern",
      "topic": "advanced_numerology",
      "subtopic": "compound_number_33",
      "ruleType": "definition",
      "planetarySubjects": [],
      "houseSubjects": [],
      "signSubjects": [],
      "vargaSubjects": [],
      "authorityLevel": "authoritative_commentary",
      "tags": [
        "numerology",
        "number_33",
        "the_master_teacher",
        "cheiro",
        "occult_vibration"
      ]
    },
    "version": "1.0",
    "verified": true
  }
];
