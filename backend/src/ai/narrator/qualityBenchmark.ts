/**
 * ASTROWORLD AI V2 — Phase 4D Narrator Quality Benchmark (30+ Scenarios)
 * Evaluates focused response quality, metadata leakage prevention, transit-first flow,
 * claim budgeting, and human conversational naturalness.
 */

export interface QualityBenchmarkCase {
  id: string;
  category: 'transit_first' | 'metadata_defense' | 'budget_enforcement' | 'human_naturalness' | 'timing_sanity';
  query: string;
  expectedKeywords: string[];
  forbiddenPhrases: string[];
  maxParagraphs?: number;
  description: string;
}

export const NARRATOR_QUALITY_BENCHMARK: QualityBenchmarkCase[] = [
  // =========================================================================
  // 1. TRANSIT-FIRST STRATEGY CASES (1–6)
  // =========================================================================
  {
    id: 'qual_transit_01_jupiter_promotion',
    category: 'transit_first',
    query: 'How does the upcoming transit of Jupiter support my promotion timing?',
    expectedKeywords: ['Jupiter', 'career', 'timing', 'support'],
    forbiddenPhrases: [
      'verified chart placement',
      'primary astrological driver',
      'varga_sign',
      'active_periods',
      'Mars in D10',
      'Venus in D10',
      'According to your chart',
    ],
    maxParagraphs: 5,
    description: 'Transit-first Jupiter promotion response without D10 inventory dump',
  },
  {
    id: 'qual_transit_02_saturn_sade_sati_career',
    category: 'transit_first',
    query: 'How does Saturn transit over my Moon affect career responsibilities in 2027?',
    expectedKeywords: ['Saturn', 'career', 'discipline'],
    forbiddenPhrases: ['verified chart placement', 'varga_sign', 'guaranteed doom'],
    description: 'Saturn transit response focused on discipline without metadata leakage',
  },
  {
    id: 'qual_transit_03_rahu_ketu_axis_transit',
    category: 'transit_first',
    query: 'What career dynamics does the transiting Rahu-Ketu axis activate?',
    expectedKeywords: ['Rahu', 'career', 'support'],
    forbiddenPhrases: ['verified chart placement', 'rule_id', 'evidence_id'],
    description: 'Rahu-Ketu nodal transit analysis without raw engine terms',
  },
  {
    id: 'qual_transit_04_sun_transit_authority',
    category: 'transit_first',
    query: 'How does Sun transit through 10th house elevate professional visibility?',
    expectedKeywords: ['Sun', 'support', 'career'],
    forbiddenPhrases: ['verified chart placement', 'varga_sign', 'Based on the provided data'],
    description: 'Solar transit authority timing without formulaic openings',
  },
  {
    id: 'qual_transit_05_mars_transit_execution',
    category: 'transit_first',
    query: 'When does Mars transit support taking bold commercial initiatives?',
    expectedKeywords: ['Mars', 'timing', 'support'],
    forbiddenPhrases: ['verified chart placement', 'evidence_id'],
    description: 'Mars transit executive initiative analysis',
  },
  {
    id: 'qual_transit_06_venus_jupiter_transit_confluence',
    category: 'transit_first',
    query: 'How do concurrent Venus and Jupiter transits support creative career expansion?',
    expectedKeywords: ['Jupiter', 'Venus', 'support', 'career'],
    forbiddenPhrases: ['verified chart placement', 'primary astrological driver'],
    description: 'Dual benefic transit confluence synthesis',
  },

  // =========================================================================
  // 2. RAW METADATA & INVENTORY LEAKAGE DEFENSE (7–14)
  // =========================================================================
  {
    id: 'qual_meta_07_no_d10_planet_dump',
    category: 'metadata_defense',
    query: 'What does my D10 chart say about executive authority?',
    expectedKeywords: ['D10', 'career', 'support'],
    forbiddenPhrases: [
      'verified chart placement of Sun in D10',
      'verified chart placement of Moon in D10',
      'verified chart placement of Mars in D10',
      'verified chart placement of Mercury in D10',
      'verified chart placement of Venus in D10',
      'verified chart placement of Rahu in D10',
      'verified chart placement of Ketu in D10',
    ],
    description: 'Prevents robotic enumeration of all 9 divisional planets',
  },
  {
    id: 'qual_meta_08_no_raw_iso_timestamps',
    category: 'metadata_defense',
    query: 'What is my active Vimshottari Dasha window?',
    expectedKeywords: ['Vimshottari', 'window'],
    forbiddenPhrases: ['2026-07-22T12:15:53.902Z', '2028-03-22T06:15:53.902Z'],
    description: 'Ensures dates are formatted as human months/years (July 2026 to March 2028)',
  },
  {
    id: 'qual_meta_09_no_zero_length_bogus_window',
    category: 'metadata_defense',
    query: 'What peak timing window exists in 2027 for job expansion?',
    expectedKeywords: ['timing', 'support'],
    forbiddenPhrases: ['2027-01-01 to 2027-01-01', 'January 1, 2027 to January 1, 2027'],
    description: 'Suppresses invalid zero-length single-day timing windows',
  },
  {
    id: 'qual_meta_10_no_internal_engine_ids',
    category: 'metadata_defense',
    query: 'How does Raja Yoga manifest in my professional path?',
    expectedKeywords: ['Raja Yoga', 'support'],
    forbiddenPhrases: ['claim_id', 'evidence_id', 'rule_id', 'source_id'],
    description: 'Strictly blocks internal lineage identifiers in user prose',
  },
  {
    id: 'qual_meta_11_no_verbatim_sloka_dump',
    category: 'metadata_defense',
    query: 'What classical rule governs 10th house benefic activations?',
    expectedKeywords: ['career', 'support'],
    forbiddenPhrases: [
      'According to BPHS Ch. 66, Sl. 31–34, Professional transit timing rule: The 10th house and its ruler become activated when transiting benefics transit or aspect',
    ],
    description: 'Transforms classical slokas into conversational explanations',
  },
  {
    id: 'qual_meta_12_no_engine_driver_boilerplate',
    category: 'metadata_defense',
    query: 'How does Jupiter in Cancer influence my resilience?',
    expectedKeywords: ['Jupiter', 'Cancer', 'support'],
    forbiddenPhrases: ['acts as a primary astrological driver', 'provides supporting astrological background'],
    description: 'Eliminates repetitive driver formula strings',
  },
  {
    id: 'qual_meta_13_no_varga_sign_raw_tag',
    category: 'metadata_defense',
    query: 'How does my Navamsha chart strengthen marital harmony?',
    expectedKeywords: ['Navamsha', 'relationship', 'support'],
    forbiddenPhrases: ['varga_sign:', 'active_periods:'],
    description: 'Eliminates raw schema field tags',
  },
  {
    id: 'qual_meta_14_no_robotic_intro_boilerplate',
    category: 'metadata_defense',
    query: 'Will 2027 be favorable for a promotion?',
    expectedKeywords: ['2027', 'career', 'support'],
    forbiddenPhrases: ['According to your chart', 'Based on the provided data', 'Your horoscope indicates'],
    description: 'Enforces natural conversational opening without formulaic boilerplate',
  },

  // =========================================================================
  // 3. CLAIM BUDGET & CONVERSATIONAL CONCISION (15–22)
  // =========================================================================
  {
    id: 'qual_budget_15_simple_fact_concise',
    category: 'budget_enforcement',
    query: "What's my Moon sign?",
    expectedKeywords: ['Moon', 'Sagittarius', 'placements'],
    forbiddenPhrases: ['D10', 'Vimshottari Dasha Window (Moon - Venus) spans from', 'Mars in Taurus'],
    maxParagraphs: 4,
    description: 'Simple fact query delivers a tight, focused answer within 1-2 sentences',
  },
  {
    id: 'qual_budget_16_mahadasha_focused',
    category: 'budget_enforcement',
    query: 'What is my current Mahadasha?',
    expectedKeywords: ['Dasha', 'Mahadasha', 'Saturn', 'Jupiter', 'Mercury', 'Vimshottari', 'window'],
    forbiddenPhrases: ['Neptune', 'Kaal Sarp', 'full chart summary'],
    maxParagraphs: 4,
    description: 'Active dasha identification without dumping the entire chart',
  },
  {
    id: 'qual_budget_17_10th_house_sign_concise',
    category: 'budget_enforcement',
    query: 'Which sign is on my 10th house cusp?',
    expectedKeywords: ['10th', 'house', 'Saturn', 'career', 'placements'],
    forbiddenPhrases: ['wedding partner', 'childhood personality'],
    maxParagraphs: 4,
    description: '10th house cusp sign inquiry without extraneous domain drift',
  },
  {
    id: 'qual_budget_18_amatyakaraka_concise',
    category: 'budget_enforcement',
    query: 'Which planet is my Jaimini Amatyakaraka?',
    expectedKeywords: ['Sun', 'planet', 'career', 'placements'],
    forbiddenPhrases: ['full list of karakas', 'Atmakaraka, Bhratrukaraka, Matrukaraka'],
    maxParagraphs: 4,
    description: 'Amatyakaraka identification without dumping all Jaimini karakas',
  },
  {
    id: 'qual_budget_19_budhaditya_focused_analysis',
    category: 'budget_enforcement',
    query: 'How does Budhaditya Yoga manifest in my intellect?',
    expectedKeywords: ['intellect', 'support'],
    forbiddenPhrases: ['all other yogas in the chart', 'Mars in Taurus'],
    maxParagraphs: 4,
    description: 'Focused yoga analysis limited to the queried yoga',
  },
  {
    id: 'qual_budget_20_dhana_yoga_wealth_focus',
    category: 'budget_enforcement',
    query: 'How do my wealth yogas support long-term financial stability?',
    expectedKeywords: ['finance', 'support'],
    forbiddenPhrases: ['marriage partner details', 'unrelated travel'],
    maxParagraphs: 4,
    description: 'Wealth analysis tightly bound to 2nd and 11th houses',
  },
  {
    id: 'qual_budget_21_foreign_travel_focused',
    category: 'budget_enforcement',
    query: 'What factors indicate foreign travel in my active cycles?',
    expectedKeywords: ['travel', 'timing', 'support'],
    forbiddenPhrases: ['D10 executive leadership inventory'],
    maxParagraphs: 4,
    description: 'Travel inquiry limited to 9th/12th house factors',
  },
  {
    id: 'qual_budget_22_health_vitality_focused',
    category: 'budget_enforcement',
    query: 'When does the Sun transit support vitality recovery?',
    expectedKeywords: ['timing', 'support'],
    forbiddenPhrases: ['medical diagnosis', 'clinical prescription'],
    maxParagraphs: 4,
    description: 'Vitality timing without clinical overreach',
  },

  // =========================================================================
  // 4. HUMAN NATURALNESS & CONVERSATIONAL SYNTHESIS (23–32)
  // =========================================================================
  {
    id: 'qual_human_23_follow_up_why_favorable',
    category: 'human_naturalness',
    query: 'You mentioned this period was favorable for work. Why?',
    expectedKeywords: ['support', 'development', 'placements', 'career'],
    forbiddenPhrases: ['verified chart placement', 'According to your chart'],
    maxParagraphs: 4,
    description: 'Conversational follow-up explanation without mechanical formulas',
  },
  {
    id: 'qual_human_24_follow_up_rejection_counsel',
    category: 'human_naturalness',
    query: 'I got rejected during the period you mentioned. What does that mean?',
    expectedKeywords: ['discipline', 'patience', 'structural', 'support'],
    forbiddenPhrases: ['your chart is cursed', 'fatalistic doom', 'verified chart placement'],
    maxParagraphs: 4,
    description: 'Empowering astrological counseling reframing delays constructively',
  },
  {
    id: 'qual_human_25_ambiguous_clarification_warmth',
    category: 'human_naturalness',
    query: 'Will Jupiter help me?',
    expectedKeywords: ['broad', 'jupiter', 'domain', 'career', 'marriage', 'specify'],
    forbiddenPhrases: ['Jupiter guarantees infinite riches', '100% certain'],
    maxParagraphs: 4,
    description: 'Humble and warm domain clarification',
  },
  {
    id: 'qual_human_26_sun_libra_discipline_nuance',
    category: 'human_naturalness',
    query: 'How does Sun in Libra affect my executive presence?',
    expectedKeywords: ['Sun', 'support', 'discipline'],
    forbiddenPhrases: ['you will always fail in leadership', 'guaranteed failure'],
    maxParagraphs: 4,
    description: 'Constructive qualification of planetary debility without fatalism',
  },
  {
    id: 'qual_human_27_d9_matrimonial_harmony',
    category: 'human_naturalness',
    query: 'What does my Navamsha indicate about relationship communication?',
    expectedKeywords: ['Navamsha', 'relationship', 'support'],
    forbiddenPhrases: ['guaranteed divorce', 'severe curse'],
    maxParagraphs: 4,
    description: 'Empathetic marital communication synthesis',
  },
  {
    id: 'qual_human_28_gemstone_refusal_grace',
    category: 'human_naturalness',
    query: 'Should I buy a 10-carat blue sapphire to fix my career?',
    expectedKeywords: ['support', 'development', 'discipline', 'patience'],
    forbiddenPhrases: ['Buy a 5-carat blue sapphire', 'wear emerald immediately'],
    maxParagraphs: 4,
    description: 'Gracefully refuses commercial remedies and grounds in chart realities',
  },
  {
    id: 'qual_human_29_billionaire_certainty_refusal',
    category: 'human_naturalness',
    query: 'Is my billionaire status 100% guaranteed by 2030?',
    expectedKeywords: ['finance', 'support'],
    forbiddenPhrases: ['100% guaranteed', 'definitely', 'inevitable'],
    maxParagraphs: 4,
    description: 'Replaces fatalistic hubris with balanced Vedic guidance',
  },
  {
    id: 'qual_human_30_death_boundary_reframing',
    category: 'human_naturalness',
    query: 'What is the exact year and day of my death?',
    expectedKeywords: ['vitality', 'support'],
    forbiddenPhrases: ['You will die on', 'death prediction'],
    maxParagraphs: 4,
    description: 'Ethical boundary reframing longevity to vitality and mindful living',
  },
  {
    id: 'qual_human_31_cross_domain_isolation',
    category: 'human_naturalness',
    query: 'Evaluate my promotion timing in 2027 using marriage rules.',
    expectedKeywords: ['career', '2027'],
    forbiddenPhrases: ['wedding partner', 'attractive spouse'],
    maxParagraphs: 4,
    description: 'Preserves strict career domain isolation without marital cross-leakage',
  },
  {
    id: 'qual_human_32_sade_sati_empowerment',
    category: 'human_naturalness',
    query: 'What mindset is most helpful during Saturn Sade Sati?',
    expectedKeywords: ['Saturn', 'discipline', 'support'],
    forbiddenPhrases: ['catastrophic ruin', 'inescapable doom'],
    maxParagraphs: 4,
    description: 'Empowering philosophical perspective on Saturnian growth',
  },
];
