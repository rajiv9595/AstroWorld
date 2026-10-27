/**
 * ASTROWORLD — Career & Education Intent Classifier
 *
 * Classifies user career/education queries into 8 distinct analytical intent classes:
 * A. broad_career_identification
 * B. academic_field_identification
 * C. branch_level_identification (e.g. CSE vs ECE)
 * D. occupational_specialization (e.g. AI Engineer vs Data Scientist vs Software Engineer)
 * E. career_suitability_comparison
 * F. career_timing
 * G. existing_occupation_analysis
 * H. research_and_methodology
 */

export type CareerIntentType =
  | 'broad_career_identification'
  | 'academic_field_identification'
  | 'branch_level_identification'
  | 'occupational_specialization'
  | 'career_suitability_comparison'
  | 'career_timing'
  | 'existing_occupation_analysis'
  | 'research_and_methodology';

export interface ClassifiedCareerIntent {
  intent: CareerIntentType;
  intentLabel: string;
  confidence: number;
  extractedCandidates: string[];
  requiresTimingAnalysis: boolean;
  requiresMethodologyComparison: boolean;
  requiresD24EducationAnalysis: boolean;
  requiresD10VocationAnalysis: boolean;
  requiresJaiminiAnalysis: boolean;
}

export function classifyCareerIntent(question: string): ClassifiedCareerIntent {
  const q = question.toLowerCase();

  // 1. Research & Methodology
  if (
    q.includes('classical') ||
    q.includes('shastra') ||
    q.includes('parashara') ||
    q.includes('bphs') ||
    q.includes('jaimini') ||
    q.includes('amatyakaraka') ||
    q.includes('karakamsha') ||
    q.includes('methodology') ||
    q.includes('how does parashari differ') ||
    q.includes('which rule')
  ) {
    if (q.includes('differ') || q.includes('rule') || q.includes('classical') || q.includes('method')) {
      return {
        intent: 'research_and_methodology',
        intentLabel: 'Research and Astrological Methodology Query',
        confidence: 0.95,
        extractedCandidates: extractCandidatesFromQuery(q),
        requiresTimingAnalysis: false,
        requiresMethodologyComparison: true,
        requiresD24EducationAnalysis: true,
        requiresD10VocationAnalysis: true,
        requiresJaiminiAnalysis: true,
      };
    }
  }

  // 2. Career Timing
  if (
    q.includes('when') ||
    q.includes('timing') ||
    q.includes('job change') ||
    q.includes('promotion') ||
    q.includes('switch') ||
    q.includes('which year') ||
    q.includes('dasha period') ||
    q.includes('hike') ||
    q.includes('new job')
  ) {
    return {
      intent: 'career_timing',
      intentLabel: 'Career Timing and Transition Analysis',
      confidence: 0.95,
      extractedCandidates: extractCandidatesFromQuery(q),
      requiresTimingAnalysis: true,
      requiresMethodologyComparison: false,
      requiresD24EducationAnalysis: false,
      requiresD10VocationAnalysis: true,
      requiresJaiminiAnalysis: false,
    };
  }

  // 3. Existing Occupation Analysis
  if (
    q.includes('current job') ||
    q.includes('current occupation') ||
    q.includes('already working as') ||
    q.includes('currently a') ||
    q.includes('fit my current') ||
    q.includes('stay or change') ||
    q.includes('should i quit')
  ) {
    return {
      intent: 'existing_occupation_analysis',
      intentLabel: 'Existing Occupation Alignment & Career Trajectory',
      confidence: 0.9,
      extractedCandidates: extractCandidatesFromQuery(q),
      requiresTimingAnalysis: true,
      requiresMethodologyComparison: false,
      requiresD24EducationAnalysis: false,
      requiresD10VocationAnalysis: true,
      requiresJaiminiAnalysis: true,
    };
  }

  // 4. Branch-Level Identification (CSE vs ECE, Mech vs Civil, etc.)
  if (
    (q.includes('cse') && q.includes('ece')) ||
    (q.includes('computer science') && q.includes('electronics')) ||
    (q.includes('mechanical') && q.includes('civil')) ||
    (q.includes('pharmacy') && q.includes('biotech')) ||
    (q.includes('branch') || q.includes('which branch') || q.includes('which engineering'))
  ) {
    return {
      intent: 'branch_level_identification',
      intentLabel: 'Engineering or Technical Branch Delineation',
      confidence: 0.95,
      extractedCandidates: extractCandidatesFromQuery(q),
      requiresTimingAnalysis: false,
      requiresMethodologyComparison: true,
      requiresD24EducationAnalysis: true,
      requiresD10VocationAnalysis: true,
      requiresJaiminiAnalysis: true,
    };
  }

  // 5. Occupational Specialization (Data Analyst vs Data Scientist, Software vs AI, Surgeon vs Physician)
  if (
    (q.includes('data analyst') && q.includes('data scientist')) ||
    (q.includes('software engineer') && (q.includes('ai') || q.includes('data scientist'))) ||
    (q.includes('surgeon') && q.includes('physician')) ||
    (q.includes('specialization') || q.includes('sub-field') || q.includes('role'))
  ) {
    return {
      intent: 'occupational_specialization',
      intentLabel: 'Occupational Specialization Delineation',
      confidence: 0.95,
      extractedCandidates: extractCandidatesFromQuery(q),
      requiresTimingAnalysis: false,
      requiresMethodologyComparison: true,
      requiresD24EducationAnalysis: true,
      requiresD10VocationAnalysis: true,
      requiresJaiminiAnalysis: true,
    };
  }

  // 6. Academic Field Identification (Education/Degrees)
  if (
    q.includes('degree') ||
    q.includes('study') ||
    q.includes('college') ||
    q.includes('university') ||
    q.includes('b.tech') ||
    q.includes('mbbs') ||
    q.includes('higher education') ||
    q.includes('field of study') ||
    q.includes('academic')
  ) {
    return {
      intent: 'academic_field_identification',
      intentLabel: 'Academic Discipline & Degree Aptitude',
      confidence: 0.9,
      extractedCandidates: extractCandidatesFromQuery(q),
      requiresTimingAnalysis: false,
      requiresMethodologyComparison: false,
      requiresD24EducationAnalysis: true,
      requiresD10VocationAnalysis: false,
      requiresJaiminiAnalysis: false,
    };
  }

  // 7. Career Suitability Comparison (e.g. Medicine vs Engineering, Employment vs Business)
  if (
    q.includes(' vs ') ||
    q.includes(' or ') ||
    q.includes('compare') ||
    q.includes('suitable') ||
    q.includes('employment vs business') ||
    q.includes('job or business')
  ) {
    return {
      intent: 'career_suitability_comparison',
      intentLabel: 'Comparative Career Suitability Evaluation',
      confidence: 0.88,
      extractedCandidates: extractCandidatesFromQuery(q),
      requiresTimingAnalysis: false,
      requiresMethodologyComparison: true,
      requiresD24EducationAnalysis: true,
      requiresD10VocationAnalysis: true,
      requiresJaiminiAnalysis: true,
    };
  }

  // 8. Default: Broad Career Identification
  return {
    intent: 'broad_career_identification',
    intentLabel: 'Broad Professional Field Identification',
    confidence: 0.85,
    extractedCandidates: extractCandidatesFromQuery(q),
    requiresTimingAnalysis: false,
    requiresMethodologyComparison: true,
    requiresD24EducationAnalysis: true,
    requiresD10VocationAnalysis: true,
    requiresJaiminiAnalysis: true,
  };
}

function extractCandidatesFromQuery(query: string): string[] {
  const candidates: string[] = [];
  const knownKeywords = [
    'software engineer',
    'backend engineer',
    'data scientist',
    'data analyst',
    'ai engineer',
    'machine learning',
    'cybersecurity',
    'cloud engineer',
    'cse',
    'ece',
    'computer science',
    'electronics',
    'mechanical',
    'civil',
    'doctor',
    'physician',
    'surgeon',
    'pharmacist',
    'lawyer',
    'corporate law',
    'finance',
    'investment banking',
    'business',
    'consulting',
    'employment',
    'entrepreneurship',
    'researcher',
    'professor',
  ];

  for (const kw of knownKeywords) {
    if (query.includes(kw)) {
      candidates.push(kw);
    }
  }

  return candidates;
}
