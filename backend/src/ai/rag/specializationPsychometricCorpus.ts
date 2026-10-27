/**
 * ASTROWORLD — Psychometric, Career Dominance & Temperament Knowledge Corpus
 * Ingests authoritative psychological, communication style, and career dominance rules
 * extracted from the 43 specialized Jyotisha psychometric treatises in:
 * backend/datasets/extracted_pdf_markdown/
 * 
 * Topics:
 * - Attention Direction (Self vs Others in Leadership and Coaching)
 * - Temperament Typologies (Choleric, Melancholy, Phlegmatic, Sanguine)
 * - Communication Modalities (Auditory, Visual, Kinesthetic, Auditory-Digital)
 * - Thinking Styles (FORM, Function, Leaning, Local/Global, SCOPE)
 * - Emotional Intelligence (Managing Emotions, Self-Awareness, Motivating Oneself)
 */

import { KnowledgeRecord } from '../schemas/knowledgeRecord.ts';

export const SPECIALIZATION_PSYCHOMETRIC_CORPUS: KnowledgeRecord[] = [
  // --- 1. ATTENTION DIRECTION (SELF VS OTHERS) ---
  {
    id: 'PSY-ATTENTION-DIRECTION-01',
    sourceText: 'Attention Direction Self / Others Jyotisha Career Rulebook',
    author: 'AstroWorld Psychology Guild',
    chapter: 'The 1st-7th House Axis & Vocational Attention Allocation',
    citation: 'Attention Direction Rulebook: Chapter 8 & 14',
    canonicalTranslation:
      'When the 1st House, Sun, or Mars dominates (Self-Pattern), the native excels in autonomous direction, technical innovation, entrepreneurial ventures, and executive authority where independent judgment is paramount. When the 7th House, Venus, Moon, or Jupiter dominates (Others-Pattern), the native naturally gravitates toward leadership through mentorship, relationship management, mediation, counseling, and high-trust human alliances.',
    normalizedInterpretation:
      'Clients with strong 1st house or Sun/Mars configurations struggle in micro-managed or overly consensus-driven roles; they require sovereignty. Clients with strong 7th house or Jupiter/Venus configurations thrive when their work directly impacts, counsels, or elevates other human beings.',
    metadata: {
      tradition: 'empirical_modern',
      topic: 'career',
      subtopic: 'attention_direction',
      ruleType: 'general_principle',
      planetarySubjects: ['Sun', 'Mars', 'Jupiter', 'Venus'],
      houseSubjects: [1, 7, 10],
      signSubjects: ['Aries', 'Libra', 'Leo'],
      vargaSubjects: ['D1', 'D10'],
      authorityLevel: 'authoritative_commentary',
      tags: ['attention_direction', 'self_pattern', 'others_pattern', 'career_dominance', 'leadership_coaching'],
    },
    version: 'Psychometric-1.0',
    verified: true,
  },

  // --- 2. TEMPERAMENT TYPOLOGY (CHOLERIC, SANGUINE, MELANCHOLIC, PHLEGMATIC) ---
  {
    id: 'PSY-TEMPERAMENT-CHOLERIC-02',
    sourceText: 'Choleric Temperament Jyotish Core Values Rulebook',
    author: 'AstroWorld Psychology Guild',
    chapter: 'Agni Tattwa Dominance: Executive Drive and Fast-Paced Mastery',
    citation: 'Choleric Temperament Rulebook: Chapter 4 & 9',
    canonicalTranslation:
      'Agni (Fire) signs (Aries, Leo, Sagittarius) coupled with Mars and Sun predominance instill a Choleric temperament: goal-centric, competitive, impatient with inefficiency, and naturally drawn to crisis management, venture-building, surgery, and aggressive market expansion.',
    normalizedInterpretation:
      'Choleric natives require high-autonomy milestones. If forced into slow, repetitive administrative bureaucracy, their fire turns inward, causing burnout, gastrointestinal heat, or interpersonal friction.',
    metadata: {
      tradition: 'empirical_modern',
      topic: 'career',
      subtopic: 'choleric_temperament',
      ruleType: 'general_principle',
      planetarySubjects: ['Sun', 'Mars'],
      houseSubjects: [1, 3, 10],
      signSubjects: ['Aries', 'Leo', 'Sagittarius'],
      vargaSubjects: ['D1', 'D10'],
      authorityLevel: 'authoritative_commentary',
      tags: ['choleric', 'agni_tattwa', 'executive_drive', 'temperament', 'leadership'],
    },
    version: 'Psychometric-1.0',
    verified: true,
  },
  {
    id: 'PSY-TEMPERAMENT-MELANCHOLIC-03',
    sourceText: 'Melancholy Temperament Jyotish Core Values Rulebook',
    author: 'AstroWorld Psychology Guild',
    chapter: 'Prithvi Tattwa Dominance: Architectural Precision and Systematic Depth',
    citation: 'Melancholy Temperament Rulebook: Chapter 5 & 11',
    canonicalTranslation:
      'Prithvi (Earth) signs (Taurus, Virgo, Capricorn) governed by Saturn and Mercury generate the Melancholy (analytical) temperament: exhaustive diligence, risk-mitigation focus, structural integrity, and exceptional talent in auditing, systems architecture, legal contracts, and financial engineering.',
    normalizedInterpretation:
      'Analytical/Melancholic natives feel acute stress when forced to make hasty leaps without data. They produce world-class output when granted uninterrupted focus to architect robust, error-free systems.',
    metadata: {
      tradition: 'empirical_modern',
      topic: 'career',
      subtopic: 'melancholy_temperament',
      ruleType: 'general_principle',
      planetarySubjects: ['Saturn', 'Mercury'],
      houseSubjects: [2, 6, 10],
      signSubjects: ['Taurus', 'Virgo', 'Capricorn'],
      vargaSubjects: ['D1', 'D10', 'D24'],
      authorityLevel: 'authoritative_commentary',
      tags: ['melancholy', 'prithvi_tattwa', 'analytical_depth', 'architecture', 'auditing'],
    },
    version: 'Psychometric-1.0',
    verified: true,
  },
  {
    id: 'PSY-TEMPERAMENT-SANGUINE-04',
    sourceText: 'Sanguine Temperament Jyotisha Core Values Rulebook',
    author: 'AstroWorld Psychology Guild',
    chapter: 'Vayu Tattwa Dominance: Synthesis, Networking, and Strategic Vision',
    citation: 'Sanguine Temperament Rulebook: Chapter 6 & 10',
    canonicalTranslation:
      'Vayu (Air) signs (Gemini, Libra, Aquarius) energized by Mercury, Venus, and Rahu manifest the Sanguine temperament: agile ideation, cross-domain pollinator, persuasive communication, and effortless synthesis of complex social networks and emergent technologies.',
    normalizedInterpretation:
      'Sanguine natives thrive in product management, public relations, business development, and generative media. They suffer when isolated from dynamic conversational exchange.',
    metadata: {
      tradition: 'empirical_modern',
      topic: 'career',
      subtopic: 'sanguine_temperament',
      ruleType: 'general_principle',
      planetarySubjects: ['Mercury', 'Venus', 'Rahu'],
      houseSubjects: [3, 7, 11],
      signSubjects: ['Gemini', 'Libra', 'Aquarius'],
      vargaSubjects: ['D1', 'D10'],
      authorityLevel: 'authoritative_commentary',
      tags: ['sanguine', 'vayu_tattwa', 'networking', 'communication', 'synthesis'],
    },
    version: 'Psychometric-1.0',
    verified: true,
  },
  {
    id: 'PSY-TEMPERAMENT-PHLEGMATIC-05',
    sourceText: 'Phlegmatic Temperament Jyotish Rulebook',
    author: 'AstroWorld Psychology Guild',
    chapter: 'Jala Tattwa Dominance: Empathic Stability and Institutional Care',
    citation: 'Phlegmatic Temperament Rulebook: Chapter 7 & 12',
    canonicalTranslation:
      'Jala (Water) signs (Cancer, Scorpio, Pisces) aligned with Moon, Jupiter, and Ketu foster the Phlegmatic temperament: psychological perception, deep emotional equilibrium, patient loyalty, and superior capability in healthcare, clinical counseling, non-profit stewardship, and institutional continuity.',
    normalizedInterpretation:
      'Water-dominant natives are the emotional anchors of teams. They prioritize psychological safety, ethical values, and human well-being over ruthless transactional gains.',
    metadata: {
      tradition: 'empirical_modern',
      topic: 'career',
      subtopic: 'phlegmatic_temperament',
      ruleType: 'general_principle',
      planetarySubjects: ['Moon', 'Jupiter', 'Ketu'],
      houseSubjects: [4, 8, 12],
      signSubjects: ['Cancer', 'Scorpio', 'Pisces'],
      vargaSubjects: ['D1', 'D9'],
      authorityLevel: 'authoritative_commentary',
      tags: ['phlegmatic', 'jala_tattwa', 'empathy', 'counseling', 'healthcare'],
    },
    version: 'Psychometric-1.0',
    verified: true,
  },

  // --- 3. COMMUNICATION MODES (AUDITORY, VISUAL, KINESTHETIC, AUDITORY-DIGITAL) ---
  {
    id: 'PSY-COMM-AUDITORY-DIGITAL-06',
    sourceText: 'Auditory Digital Communication Jyotish Rulebook',
    author: 'AstroWorld Psychology Guild',
    chapter: 'Mercury-Jupiter-Ketu Synthesis: The Logic-First Communicator',
    citation: 'Auditory Digital Rulebook: Chapter 3 & 8',
    canonicalTranslation:
      'When Mercury interacts with Jupiter or Ketu in the 2nd, 3rd, or 5th house, the native communicates in the Auditory-Digital modality: requiring precise definitions, structural logic, and evidentiary rigor. They internally process discourse through questions such as "Does this make sense?", "What is the systematic procedure?", and "Where is the underlying metric?".',
    normalizedInterpretation:
      'When advising this native, use structured logic, precise timelines, and clear rationale rather than emotional appeals or vague generalities.',
    metadata: {
      tradition: 'empirical_modern',
      topic: 'education',
      subtopic: 'communication_styles',
      ruleType: 'general_principle',
      planetarySubjects: ['Mercury', 'Jupiter', 'Ketu'],
      houseSubjects: [2, 3, 5],
      signSubjects: ['Virgo', 'Gemini', 'Sagittarius'],
      vargaSubjects: ['D1', 'D24'],
      authorityLevel: 'authoritative_commentary',
      tags: ['auditory_digital', 'logical_communication', 'mercury_jupiter', 'learning_styles'],
    },
    version: 'Psychometric-1.0',
    verified: true,
  },
  {
    id: 'PSY-COMM-VISUAL-KINESTHETIC-07',
    sourceText: 'Visual Communicators & Kinesthetic Psychology Jyotish Rulebooks',
    author: 'AstroWorld Psychology Guild',
    chapter: 'Venus-Mars-Moon Dynamics: Spatial and Experiential Cognition',
    citation: 'Visual Communicators Rulebook: Chapter 4 & Kinesthetic Rulebook: Chapter 5',
    canonicalTranslation:
      'Strong Venus and Sun stimulate Visual cognition (thinking in pictures, rapid aesthetic evaluation, impatience with verbose text). Strong Mars and Moon generate Kinesthetic cognition (learning by doing, requiring tactile experience, and relying on gut-level intuitive bodily responses before intellectual endorsement).',
    normalizedInterpretation:
      'Visual-Kinesthetic natives require prototypes, roadmaps, and hands-on experiments rather than abstract theoretical manuals.',
    metadata: {
      tradition: 'empirical_modern',
      topic: 'education',
      subtopic: 'sensory_modalities',
      ruleType: 'general_principle',
      planetarySubjects: ['Venus', 'Sun', 'Mars', 'Moon'],
      houseSubjects: [3, 5, 10],
      signSubjects: ['Taurus', 'Leo', 'Scorpio'],
      vargaSubjects: ['D1', 'D10', 'D24'],
      authorityLevel: 'authoritative_commentary',
      tags: ['visual_cognition', 'kinesthetic_learning', 'experiential_knowledge', 'design_engineering'],
    },
    version: 'Psychometric-1.0',
    verified: true,
  },

  // --- 4. THINKING STYLES (LOCAL VS GLOBAL & SCOPE) ---
  {
    id: 'PSY-THINKING-LOCAL-GLOBAL-08',
    sourceText: 'Level of Thinking Local / Global Jyotish Core Values Rulebook',
    author: 'AstroWorld Psychology Guild',
    chapter: 'Mercury (Micro) vs Jupiter (Macro) Synthesis',
    citation: 'Level of Thinking Rulebook: Chapter 6 & 12',
    canonicalTranslation:
      'Mercury rules Local Thinking: micro-granularity, exact syntax, edge-case debugging, and fine detail. Jupiter rules Global Thinking: macro-architectural vision, philosophical horizon, multi-year trends, and geopolitical/institutional scale. Charts with Mercury-Jupiter coordination possess the rare executive gift of zooming from a 30,000-foot vision directly down to a 1-millimeter operational fix.',
    normalizedInterpretation:
      'If Jupiter dominates without Mercury, the native casts grand visions but fumbles operational execution. If Mercury dominates without Jupiter, the native optimizes minutiae but misses the macro paradigm shift.',
    metadata: {
      tradition: 'empirical_modern',
      topic: 'career',
      subtopic: 'thinking_styles',
      ruleType: 'general_principle',
      planetarySubjects: ['Mercury', 'Jupiter'],
      houseSubjects: [3, 5, 9, 10],
      signSubjects: ['Gemini', 'Virgo', 'Sagittarius', 'Pisces'],
      vargaSubjects: ['D1', 'D10', 'D24'],
      authorityLevel: 'authoritative_commentary',
      tags: ['local_thinking', 'global_thinking', 'executive_synthesis', 'mercury_jupiter'],
    },
    version: 'Psychometric-1.0',
    verified: true,
  },

  // --- 5. EMOTIONAL INTELLIGENCE & SELF-AWARENESS ---
  {
    id: 'PSY-EQ-SELF-AWARENESS-09',
    sourceText: 'Self Awareness Jupiter & Managing Emotions Jyotisha Rulebooks',
    author: 'AstroWorld Psychology Guild',
    chapter: 'Chandra-Guru Coordination: Sattva and Emotional Mastery',
    citation: 'Managing Emotions Rulebook: Chapter 4 & 8',
    canonicalTranslation:
      'Gaja Kesari Yoga (Jupiter in Kendra from Moon) or Jupiter aspecting Moon forms the bedrock of emotional intelligence (EQ): the native possesses an innate capacity to observe their own emotional turbulence with philosophical detachment, reframing crises as developmental lessons.',
    normalizedInterpretation:
      'Natives with Moon-Jupiter harmony maintain mental calm during market panic or leadership friction, becoming stabilizing pillars in their organizations.',
    metadata: {
      tradition: 'empirical_modern',
      topic: 'spirituality',
      subtopic: 'emotional_intelligence',
      ruleType: 'general_principle',
      planetarySubjects: ['Moon', 'Jupiter'],
      houseSubjects: [1, 4, 7, 10],
      signSubjects: ['Cancer', 'Sagittarius', 'Pisces'],
      vargaSubjects: ['D1', 'D9'],
      authorityLevel: 'authoritative_commentary',
      tags: ['emotional_intelligence', 'eq', 'self_awareness', 'gaja_kesari', 'resilience'],
    },
    version: 'Psychometric-1.0',
    verified: true,
  },
];
