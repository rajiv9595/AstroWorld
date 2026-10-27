import json
import os

script_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(script_dir)

input_path = os.path.join(backend_dir, 'datasets', 'specialization', 'AstroTech_RAG_Corpus.jsonl')
output_paths = [
    os.path.join(backend_dir, 'src', 'ai', 'rag', 'specializationTechCorpus.ts'),
    os.path.join(backend_dir, 'src', 'ai_v2', 'rag', 'specializationTechCorpus.ts')
]

with open(input_path, 'r', encoding='utf-8') as f:
    lines = [line.strip() for line in f if line.strip()]

records = [json.loads(l) for l in lines]

ts_content = f'''/**
 * ASTROWORLD AI — Emerging Technology & Advanced Specialization Corpus (Expanded)
 * Sourced from AstroTech_RAG_Corpus.jsonl ({len(records)} Atomic Curated Records).
 * Integrates:
 * 1. 15 Frontier Technology Domains (AI/ML, Data Engineering, Cybersecurity, Quantum, Robotics, etc.)
 * 2. 34 Comprehensive Educational & Degree Pathways (ECE, CSE, Mech, Civil, Chem, MBBS, Law, MBA, Commerce, etc.)
 * 3. 33 Planetary Conjunction Hypotheses (Mercury+Saturn, Mercury+Mars, Sun+Saturn, Mercury+Jupiter+Saturn, etc.)
 * 4. 19 Classical House & Graha Conventions mapped to modern professional competencies
 * 5. 17 Methodological RAG & Scoring Rules (5-Factor Coherence Formula: 0.30 Edu + 0.25 Graha + 0.20 Career + 0.15 Varga + 0.10 Dasha)
 * 6. 8 Critical Epistemic Guardrails (No determinism, No "Rahu=AI" fallacy, Heuristic scores not probabilities, EDU-GUARD-001)
 * 7. 19 Canonical Source References (BPHS, Brihat Jataka, WEF 2025, OECD 2025, MeitY, NSF, Bar Council, Medical/Engineering Accreditation)
 */

import {{ KnowledgeRecord }} from '../schemas/knowledgeRecord.ts';

export const SPECIALIZATION_KNOWLEDGE_RECORDS: KnowledgeRecord[] = [
'''

for r in records:
    rec_type = r.get('record_type', 'general')
    rule_id = r.get('rule_id', '')
    title = r.get('title', '')
    
    # Map into KnowledgeRecord fields
    rec_id = f"astrotech_{rule_id.lower().replace('-', '_')}"
    source_text = "AstroTech Emerging Technology & Education Jyotisha Corpus"
    author = "AstroWorld Knowledge Engineering (Sources S01-S19: BPHS, Brihat Jataka, WEF 2025, OECD 2025, MeitY, NSF, Accreditation Standards)"
    chapter = f"{rec_type.replace('_', ' ').title()} ({rule_id})"
    citation = f"AstroTech [{rule_id}] {title}"
    
    # Create canonical translation and normalized interpretation based on record type
    if rec_type == 'technology_domain':
        specs = ", ".join(r.get('modern_specializations', []))
        prereq = ", ".join(r.get('prerequisite_knowledge', []))
        canonical = f"Domain Overview: {title}. Modern Specializations: {specs}. Required Prerequisites: {prereq}."
        normalized = f"Jyotisha Mapping Hypothesis: {r.get('jyotisha_mapping', '')} Proposed Rule: {r.get('proposed_rule', '')} (Evidence Status: {r.get('evidence_status', '')})."
        rule_type = 'karaka_rule'
        tags = ['emerging_technology', 'specialization', 'career', 'education'] + r.get('tags', [])
    elif rec_type == 'education_pathway':
        routes = ", ".join(r.get('degree_routes', []))
        specs = ", ".join(r.get('modern_specializations', []))
        canonical = f"Educational Pathway [{title}]: Degree Routes: {routes}. Modern Specializations: {specs}."
        normalized = (
            f"Jyotisha Mapping Hypothesis: {r.get('jyotisha_mapping', '')} "
            f"Proposed Rule: {r.get('proposed_rule', '')} "
            f"Corroboration: {r.get('corroboration_requirements', '')} "
            f"Forbidden Conclusions: {r.get('forbidden_conclusions', '')} "
            f"(Evidence Status: {r.get('evidence_status', '')})."
        )
        rule_type = 'karaka_rule'
        tags = ['education_pathway', 'degree_routing', 'curriculum', 'career_family'] + r.get('tags', [])
    elif rec_type == 'combination_hypothesis':
        combo = r.get('combination', '')
        synthesis = r.get('symbolic_synthesis', '')
        fields = ", ".join(r.get('possible_modern_fields', []))
        canonical = f"Planetary Combination Hypothesis [{combo}]: Symbolic synthesis: {synthesis}. Potential modern fields: {fields}."
        normalized = f"Trigger Conditions: {r.get('trigger_conditions', '')} Shastric Limitations: {r.get('limitation', '')} Evidence Status: {r.get('evidence_status', '')}."
        rule_type = 'conjunction_rule'
        tags = ['conjunction', 'modern_specialization', 'hypothesis', 'career'] + r.get('tags', [])
    elif rec_type == 'jyotisha_convention':
        statement = r.get('statement', '') or r.get('traditional_summary', '')
        mod_app = r.get('modern_application', '') or r.get('modern_technology_analogy', '')
        caveat = r.get('caveat', '')
        canonical = f"Jyotisha Convention [{title}]: {statement}. Modern Professional Analogy: {mod_app}."
        normalized = f"Caveat / Application Conditions: {caveat}. Use Conditions: {r.get('use_conditions', '')} (Evidence Status: {r.get('evidence_status', '')})."
        rule_type = 'house_lord_rule' if 'house' in title.lower() else 'karaka_rule'
        tags = ['convention', 'graha', 'house', 'career', 'education'] + r.get('tags', [])
    elif rec_type == 'guardrail':
        statement = r.get('statement', '')
        rationale = r.get('rationale', '')
        canonical = f"Safety & Epistemic Guardrail [{title}]: {statement}."
        normalized = f"Operational Rationale: {rationale} (Evidence Status: {r.get('evidence_status', '')})."
        rule_type = 'general_principle'
        tags = ['guardrail', 'safety', 'epistemic_calibration', 'must_follow'] + r.get('tags', [])
    elif rec_type == 'method_rule':
        statement = r.get('statement', '')
        rationale = r.get('rationale', '')
        canonical = f"Methodological Architecture Rule [{title}]: {statement}."
        normalized = f"Engineering Rationale: {rationale} (Evidence Status: {r.get('evidence_status', '')})."
        rule_type = 'general_principle'
        tags = ['methodology', 'rag_architecture', 'validation', 'scoring'] + r.get('tags', [])
    elif rec_type == 'scoring_method':
        formula = str(r.get('formula', {}))
        statement = r.get('statement', '')
        canonical = f"Thematic Coherence Scoring Formula [SCORE-001]: {statement} Weights: {formula}."
        normalized = "5-Factor Heuristic Coherence: 0.30 Education + 0.25 Planetary Themes + 0.20 Career Houses + 0.15 Varga Corroboration + 0.10 Dasha Activation. Never output as probability percentage."
        rule_type = 'general_principle'
        tags = ['scoring', 'coherence_formula', 'method']
    elif rec_type == 'case_study':
        steps = " -> ".join(r.get('stepwise_interpretation', []))
        canonical = f"AstroTech Case Study [CASE-001: {title}]: Stepwise Interpretation: {steps}."
        normalized = f"Possible Output: {r.get('possible_output', '')} Forbidden Conclusion: {r.get('forbidden_conclusion', '')}."
        rule_type = 'empirical_case_study'
        tags = ['case_study', 'cross_domain', 'audit']
    else:
        canonical = f"AstroTech Reference [{rule_id}]: {title}. {r.get('source_role', '')}"
        normalized = f"URL: {r.get('url', '')} Organization: {r.get('organization', '')}."
        rule_type = 'definition'
        tags = ['reference', 'citation']

    # Extract planets and houses
    planets = []
    for p in ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu']:
        if p.lower() in (canonical + normalized).lower():
            planets.append(p)
            
    houses = []
    for h in range(1, 13):
        if f"{h}th" in (canonical + normalized).lower() or f"house {h}" in (canonical + normalized).lower() or f"{h} house" in (canonical + normalized).lower():
            houses.append(h)

    # Sanitize strings for TS template
    safe_canonical = canonical.replace('\\', '\\\\').replace('"', '\\"').replace('\n', ' ')
    safe_normalized = normalized.replace('\\', '\\\\').replace('"', '\\"').replace('\n', ' ')
    safe_citation = citation.replace('"', '\\"')
    safe_chapter = chapter.replace('"', '\\"')

    record_ts = f"""  {{
    id: "{rec_id}",
    sourceText: "{source_text}",
    author: "{author}",
    chapter: "{safe_chapter}",
    citation: "{safe_citation}",
    canonicalTranslation: "{safe_canonical}",
    normalizedInterpretation: "{safe_normalized}",
    metadata: {{
      tradition: "empirical_modern",
      topic: "career",
      subtopic: "{rule_id.lower()}",
      ruleType: "{rule_type}",
      planetarySubjects: {json.dumps(planets)},
      houseSubjects: {json.dumps(houses)},
      signSubjects: [],
      vargaSubjects: ["D1", "D10", "D24"],
      authorityLevel: "empirical_validated",
      tags: {json.dumps(list(set(tags)))},
    }},
    version: "1.0",
    verified: true,
  }},
"""
    ts_content += record_ts

ts_content += """
];

/**
 * Heuristic 5-Factor Thematic Coherence Scoring Formula (AstroTech SCORE-001)
 * Computes heuristic alignment score (0 - 100), NOT a fatalistic probability.
 */
export interface SpecializationCoherenceInput {
  educationConvergence: number;     // 0.0 to 1.0 (5th/9th/D24 academic indicators)
  planetaryThemeConvergence: number;// 0.0 to 1.0 (independent planetary signatures, e.g. Mercury+Saturn)
  careerHouseConvergence: number;   // 0.0 to 1.0 (10th/6th/11th/D10 career indicators)
  vargaCorroboration: number;       // 0.0 to 1.0 (D24 education + D10 career corroboration)
  dashaActivation: number;          // 0.0 to 1.0 (current running Dasha lord alignment)
  contradictionPenalty?: number;    // 0.0 to 0.3 (conflicting placements)
}

export function calculateSpecializationCoherenceScore(input: SpecializationCoherenceInput): number {
  const weighted =
    0.30 * Math.max(0, Math.min(1, input.educationConvergence)) +
    0.25 * Math.max(0, Math.min(1, input.planetaryThemeConvergence)) +
    0.20 * Math.max(0, Math.min(1, input.careerHouseConvergence)) +
    0.15 * Math.max(0, Math.min(1, input.vargaCorroboration)) +
    0.10 * Math.max(0, Math.min(1, input.dashaActivation));

  const penalty = Math.max(0, input.contradictionPenalty || 0);
  const rawScore = Math.max(0, (weighted - penalty) * 100);
  return Math.min(100, Math.round(rawScore));
}
"""

for out_path in output_paths:
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(ts_content)
    print(f"Generated {out_path} with {len(records)} records successfully.")
