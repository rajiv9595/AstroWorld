/**
 * ASTROWORLD — Dynamic RAG Engine (Vedic Mastery & Empirical Research)
 * Provides high-dimensional retrieval, dynamic rule ingestion, and domain filtering
 * across classical treatises and empirical modern research.
 * 
 * Ready to ingest and index external research documents (e.g., user-provided .docx extractions).
 */

import { CLASSICAL_JYOTISH_KNOWLEDGE_BASE } from './knowledgeBase.ts';
import { MASTER_KNOWLEDGE_CORPUS } from './masterKnowledgeCorpus.ts';
import { SPECIALIZATION_KNOWLEDGE_RECORDS } from './specializationTechCorpus.ts';
import { MASTER_PACK_NOTES_CORPUS } from './masterPackNotesCorpus.ts';
import { SPECIALIZATION_PSYCHOMETRIC_CORPUS } from './specializationPsychometricCorpus.ts';
import { convertCaseStudiesToKnowledgeRecords } from './empiricalCaseStudies.ts';
import { KnowledgeRecord } from '../schemas/knowledgeRecord.ts';

export type RAGCategory =
  | 'wealth'
  | 'career'
  | 'health'
  | 'marriage'
  | 'spirituality'
  | 'education'
  | 'progeny'
  | 'property'
  | 'litigation'
  | 'foreign'
  | 'remedy'
  | 'transits'
  | 'dasha'
  | 'classical_rule'
  | 'empirical_evidence'
  | 'systems_approach'
  | 'aifas_timing'
  | 'nakshatras_secrets'
  | 'advanced_numerology'
  | 'job_timing_kp'
  | 'education_astrology'
  | 'general';

export interface RAGSearchOptions {
  query?: string;
  domain?: RAGCategory;
  planets?: string[];
  houses?: number[];
  vargas?: string[];
  limit?: number;
  minScore?: number;
  includeExceptions?: boolean;
}

export interface IngestedDocumentChunk {
  id: string;
  sourceDocName: string;
  sectionTitle: string;
  category: RAGCategory;
  content: string;
  keywords: string[];
  planetarySubjects?: string[];
  houseSubjects?: number[];
  vargaSubjects?: string[];
  exceptionClauses?: string[];
  addedAtIso: string;
}

/**
 * Canonical Term Normalization & Search Expansion (Master Pack Note 15)
 * Maps Sanskrit IAST diacritics, ASCII spellings, and canonical topic aliases.
 */
const CANONICAL_TERM_ALIASES: Record<string, string[]> = {
  dasha: ['daśā', 'dasha', 'mahadasha', 'antardasha', 'bhukti', 'vimshottari', 'timing'],
  daśā: ['daśā', 'dasha', 'mahadasha', 'antardasha', 'bhukti', 'vimshottari'],
  nakshatra: ['nakṣatra', 'nakshatra', 'pada', 'constellation', 'lunar mansion'],
  nakṣatra: ['nakṣatra', 'nakshatra', 'pada'],
  bhava: ['bhāva', 'bhava', 'house', 'cusp', 'bhavesha', 'lord'],
  bhāva: ['bhāva', 'bhava', 'house', 'lord'],
  rashi: ['rāśi', 'rashi', 'sign', 'zodiac'],
  rāśi: ['rāśi', 'rashi', 'sign'],
  drishti: ['dṛṣṭi', 'drishti', 'aspect', 'glance'],
  dṛṣṭi: ['dṛṣṭi', 'drishti', 'aspect'],
  yoga: ['yoga', 'combination', 'raja yoga', 'dhana yoga', 'conjunction'],
  varga: [
    'varga', 'amsha', 'divisional', 'd9', 'navamsha', 'navamsa', 'navāṃśa',
    'd10', 'dashamsha', 'dashamsa', 'daśāṃśa', 'd24', 'siddhamsha', 'siddhamsa', 'siddhāṃśa',
    'd7', 'saptamsha', 'saptāṃśa', 'd4', 'chaturthamsha', 'caturthāṃśa', 'd3', 'drekkana',
    'd30', 'trimsamsha', 'triṃśāṃśa', 'd20', 'vimshamsha', 'viṃśāṃśa', 'd12', 'dwadashamsha',
    'd2', 'hora', 'horā', 'd16', 'shodashamsha', 'ṣoḍaśāṃśa', 'd60', 'shashtiamsa', 'ṣaṣṭyāṃśa'
  ],
  siddhamsha: ['siddhāṃśa', 'siddhamsha', 'siddhamsa', 'd24', 'chaturvimshamsha', 'vidya', 'education', 'degree'],
  siddhāṃśa: ['siddhāṃśa', 'siddhamsha', 'd24', 'education', 'degree'],
  navamsha: ['navāṃśa', 'navamsha', 'navamsa', 'd9', 'marriage', 'spouse', 'dharma'],
  navāṃśa: ['navāṃśa', 'navamsha', 'd9', 'marriage', 'spouse'],
  dashamsha: ['daśāṃśa', 'dashamsha', 'dashamsa', 'd10', 'career', 'profession', 'karma'],
  ayanamsha: ['ayanāṃśa', 'ayanamsha', 'lahiri', 'sidereal'],
  shadbala: ['ṣaḍbala', 'shadbala', 'bala', 'strength', 'sthana bala', 'dig bala'],
  ṣaḍbala: ['ṣaḍbala', 'shadbala', 'bala', 'strength'],
  karaka: [
    'kāraka', 'karaka', 'atmakaraka', 'ātmakāraka', 'amatyakaraka', 'amātyakāraka',
    'darakaraka', 'dārakāraka', 'putrakaraka', 'putrakāraka', 'bhratrikaraka', 'gnatikaraka'
  ],
  gochara: ['gochara', 'transit', 'sade sati', 'sadesati', 'saturn transit', 'jupiter transit'],
  ashtakavarga: ['aṣṭakavarga', 'ashtakavarga', 'sav', 'bav', 'bindus', 'rekhas'],
  combustion: ['combustion', 'combust', 'astangata', 'asta'],
  retrograde: ['retrograde', 'retrogression', 'vakri', 'vakra'],
  parashara: ['parashara', 'parāśara', 'bphs', 'brihat parashara hora shastra', 'parashari'],
  mantreswara: ['mantreswara', 'manteśvara', 'phaladeepika', 'phala deepika', 'phaladīpikā'],
  varahamihira: ['varahamihira', 'varāhamihira', 'brihat jataka', 'bṛhat jātaka'],
  jaimini: ['jaimini', 'upadesha sutras', 'karakamsa', 'kārakāṃśa', 'upapada', 'arudha'],
  education: ['education', 'degree', 'study', 'engineering', 'medicine', 'siddhamsha', 'd24', 'vidya', '5th house', 'academic'],
  career: ['career', 'profession', 'job', 'dashamsha', 'd10', '10th house', 'karma', 'leadership', 'vocation'],
  marriage: ['marriage', 'spouse', 'navamsha', 'd9', 'upapada', '7th house', 'vivaha', 'relationship'],
  wealth: ['wealth', 'finance', 'money', 'dhana', 'indu lagna', '2nd house', '11th house', 'assets'],
  health: ['health', 'disease', 'longevity', '22nd drekkana', '64th navamsha', 'maraka', '6th house', '8th house', 'vitality'],
  spirituality: ['spirituality', 'moksha', 'ishta devata', 'd20', 'karakamsa', '12th house', 'atmakaraka', 'meditation'],
  progeny: ['progeny', 'children', 'saptamsha', 'd7', 'putrakaraka', '5th house', 'santan'],
  property: ['property', 'real estate', 'land', 'chaturthamsha', 'd4', 'shodashamsa', 'd16', 'vehicles'],
  litigation: ['litigation', 'legal', 'court', 'shatru hanta', '6th house', 'dispute'],
  foreign: ['foreign', 'overseas', 'travel', 'visa', 'relocation', '12th house', '9th house'],
  remedy: ['remedy', 'remedies', 'gemstone', 'ratna', 'mantra', 'daana', 'fasting', 'upaya', 'bphs'],
  specialization: [
    'specialization', 'branch', 'stream', 'domain', 'engineering', 'tech', 'technology', 'astrotech',
    'major', 'field of study', 'btech', 'mtech', 'cs', 'computer science'
  ],
  ai: [
    'ai', 'artificial intelligence', 'machine learning', 'ml', 'deep learning', 'nlp', 'llm', 'computer vision',
    'neural network', 'data science', 'generative ai', 'foundation model'
  ],
  data_engineering: [
    'data systems', 'data engineering', 'databases', 'cloud', 'data analytics', 'big data', 'distributed systems', 'mlops'
  ],
  cybersecurity: [
    'cybersecurity', 'security', 'infosec', 'cryptography', 'ethical hacking', 'network security', 'soc', 'forensics'
  ],
  quantum: [
    'quantum', 'quantum computing', 'qiskit', 'post-quantum cryptography', 'qubit', 'quantum algorithms'
  ],
  robotics: [
    'robotics', 'automation', 'embedded systems', 'mechatronics', 'autonomous systems', 'control systems', 'drones'
  ],
  semiconductors: [
    'semiconductor', 'vlsi', 'chip design', 'microelectronics', 'hardware', 'asic', 'fpga', 'fabrication'
  ],
  bioinformatics: [
    'bioinformatics', 'computational biology', 'genomics', 'biotech', 'biotechnology', 'rna', 'protein folding'
  ],
  neurotech: [
    'neurotech', 'bci', 'brain computer interface', 'neural engineering', 'computational neuroscience', 'eeg'
  ],
  space_tech: [
    'space tech', 'aerospace', 'astronomy', 'satellite', 'propulsion', 'orbital mechanics', 'isro', 'nasa'
  ],
  clean_energy: [
    'clean energy', 'renewable energy', 'solar', 'wind', 'battery', 'smart grid', 'ev', 'climate tech'
  ],
  blockchain: [
    'blockchain', 'web3', 'cryptocurrency', 'distributed ledger', 'defi', 'smart contracts'
  ],
  hci_xr: [
    'hci', 'xr', 'ar', 'vr', 'augmented reality', 'virtual reality', 'spatial computing', 'ui ux', 'ux'
  ],
  medical_ai: [
    'medical ai', 'health informatics', 'digital health', 'computational medicine', 'clinical ai'
  ],
  ece_eee: [
    'ece', 'eee', 'electronics', 'electrical', 'telecom', 'signal processing', 'microelectronics', 'hardware', 'circuits'
  ],
  computer_science: [
    'computer science', 'cse', 'it', 'software engineering', 'coding', 'web dev', 'distributed systems', 'cloud computing'
  ],
  mechanical: [
    'mechanical', 'mechatronics', 'thermal', 'cad cam', 'robotics hardware', 'fluid dynamics', 'manufacturing', 'industrial'
  ],
  civil_architecture: [
    'civil', 'civil engineering', 'architecture', 'barch', 'structural', 'urban planning', 'construction', 'geotechnical'
  ],
  chemical: [
    'chemical engineering', 'materials science', 'polymers', 'petrochemical', 'process engineering', 'nanotechnology'
  ],
  medicine_physician: [
    'medicine', 'mbbs', 'md', 'ms', 'physician', 'doctor', 'surgery', 'clinical', 'pediatrics', 'pathology', 'radiology'
  ],
  dentistry: [
    'dentistry', 'dental', 'bds', 'mds', 'orthodontics', 'oral surgery', 'prosthodontics', 'periodontics'
  ],
  nursing_allied_health: [
    'nursing', 'allied health', 'physiotherapy', 'bpt', 'mpt', 'public health', 'paramedical', 'radiology technician'
  ],
  pharmacy: [
    'pharmacy', 'pharmaceutical', 'bpharm', 'mpharm', 'pharmacology', 'drug discovery', 'formulation', 'pharmacovigilance'
  ],
  law_legal: [
    'law', 'legal', 'llb', 'llm', 'bar council', 'advocate', 'judiciary', 'litigation', 'corporate law', 'criminal law'
  ],
  mba_management: [
    'mba', 'bba', 'management', 'business administration', 'pgdm', 'strategy', 'operations management', 'marketing'
  ],
  commerce_ca: [
    'commerce', 'bcom', 'mcom', 'chartered accountancy', 'ca', 'icai', 'audit', 'taxation', 'cost accounting', 'cpa'
  ],
  finance_banking: [
    'finance', 'banking', 'investment banking', 'wealth management', 'actuarial', 'risk analysis', 'fintech', 'cfa'
  ],
  civil_services_policy: [
    'civil services', 'upsc', 'ias', 'ips', 'ifs', 'public policy', 'governance', 'political science', 'administration'
  ],
  psychology_counseling: [
    'psychology', 'counseling', 'clinical psychology', 'psychiatry', 'mental health', 'behavioral science', 'therapy'
  ],
  design_arts: [
    'design', 'bdes', 'fine arts', 'graphic design', 'ui ux', 'multimedia', 'animation', 'fashion design', 'creative media'
  ],
  systems_approach: [
    'systems approach', 'moolatrikona', 'mooltrikona', 'functional malefic', 'functional benefic', 'vk choudhry', 'choudhry', '5 degree orb', 'combustion', 'baladi avastha'
  ],
  aifas_timing: [
    'aifas', 'sawhney', 'timing of events', 'rise in profession', 'promotion timing', 'education timing', 'double transit', 'income source', 'foreign travel timing'
  ],
  nakshatras_secrets: [
    'nakshatra', 'constellation', 'ashwini', 'bharani', 'krittika', 'rohini', 'mrigashira', 'ardra', 'punarvasu', 'pushya', 'ashlesha', 'magha', 'purva phalguni', 'uttara phalguni', 'hasta', 'chitra', 'swati', 'vishakha', 'anuradha', 'jyeshtha', 'mula', 'purva ashadha', 'uttara ashadha', 'shravana', 'dhanishta', 'shatabhisha', 'purva bhadrapada', 'uttara bhadrapada', 'revati', 'navatara', 'tara bala', 'acharya bharat'
  ],
  advanced_numerology: [
    'numerology', 'cheiro', 'compound number', 'name number', 'destiny number', 'life path', 'vibration', 'single number', 'chaldean'
  ],
  job_timing_kp: [
    'kp astrology', 'cuspal sublord', 'sub lord', 'ruling planets', 'new job', 'job timing', 'krishnamurti', 'pt akash'
  ],
  education_astrology: [
    'aerospace', 'video game', 'software engineering', 'computer language', 'rahu computer'
  ],
  choleric: ['choleric', 'agni tattwa', 'executive drive', 'temperament', 'fire sign'],
  melancholic: ['melancholy', 'melancholic', 'prithvi tattwa', 'analytical depth'],
  sanguine: ['sanguine', 'vayu tattwa', 'networking', 'communication style'],
  phlegmatic: ['phlegmatic', 'jala tattwa', 'empathy', 'institutional care'],
  doctrine: ['doctrine', 'platform doctrine', 'epistemic honesty', 'deterministic calculation'],
};

export class DynamicRAGEngine {
  private static instance: DynamicRAGEngine;
  private primaryKnowledgeBase: KnowledgeRecord[];
  private ingestedChunks: IngestedDocumentChunk[] = [];

  private constructor() {
    this.primaryKnowledgeBase = [
      ...CLASSICAL_JYOTISH_KNOWLEDGE_BASE,
      ...MASTER_KNOWLEDGE_CORPUS,
      ...SPECIALIZATION_KNOWLEDGE_RECORDS,
      ...MASTER_PACK_NOTES_CORPUS,
      ...SPECIALIZATION_PSYCHOMETRIC_CORPUS,
      ...convertCaseStudiesToKnowledgeRecords(),
    ];
  }

  public static getInstance(): DynamicRAGEngine {
    if (!DynamicRAGEngine.instance) {
      DynamicRAGEngine.instance = new DynamicRAGEngine();
    }
    return DynamicRAGEngine.instance;
  }

  /**
   * Dynamically ingest a research chunk from user-uploaded research or study notes.
   */
  public ingestChunk(chunk: Omit<IngestedDocumentChunk, 'addedAtIso'>): void {
    // Deduplicate chunk if identical ID already ingested
    const existingIdx = this.ingestedChunks.findIndex((c) => c.id === chunk.id);
    const fullChunk: IngestedDocumentChunk = {
      ...chunk,
      addedAtIso: new Date().toISOString(),
    };

    if (existingIdx >= 0) {
      this.ingestedChunks[existingIdx] = fullChunk;
      const kbIdx = this.primaryKnowledgeBase.findIndex((k) => k.id === chunk.id);
      if (kbIdx >= 0) {
        this.primaryKnowledgeBase[kbIdx] = this.toSyntheticKnowledgeRecord(fullChunk);
      }
      return;
    }

    this.ingestedChunks.push(fullChunk);
    this.primaryKnowledgeBase.push(this.toSyntheticKnowledgeRecord(fullChunk));
  }

  private toSyntheticKnowledgeRecord(chunk: IngestedDocumentChunk): KnowledgeRecord {
    return {
      id: chunk.id,
      sourceText: chunk.sourceDocName,
      author: 'AstroWorld Master Guild',
      chapter: chunk.sectionTitle,
      citation: `${chunk.sourceDocName}: ${chunk.sectionTitle}`,
      canonicalTranslation: chunk.content,
      normalizedInterpretation: chunk.content,
      metadata: {
        tradition: 'classical',
        topic: chunk.category as any,
        subtopic: chunk.keywords[0] || 'research',
        ruleType: 'general_principle',
        planetarySubjects: (chunk.planetarySubjects || []) as any,
        houseSubjects: chunk.houseSubjects || [],
        signSubjects: [],
        vargaSubjects: (chunk.vargaSubjects || ['D1']) as any,
        authorityLevel: 'authoritative_commentary',
        tags: [
          ...chunk.keywords,
          chunk.category,
          ...(chunk.vargaSubjects || []),
          ...(chunk.exceptionClauses ? ['has_exception'] : []),
        ],
      },
      version: 'MasterPack-1.0',
      verified: true,
    };
  }

  /**
   * Expand raw search terms using canonical IAST/ASCII alias mappings (Master Pack Note 15)
   */
  private expandQueryTokens(rawTokens: string[]): string[] {
    const tokenSet = new Set<string>();
    for (const t of rawTokens) {
      tokenSet.add(t);
      const lower = t.toLowerCase();
      // Match exact alias key
      if (CANONICAL_TERM_ALIASES[lower]) {
        for (const alias of CANONICAL_TERM_ALIASES[lower]) {
          tokenSet.add(alias.toLowerCase());
        }
      }
      // Check if token appears inside any alias array
      for (const [key, aliases] of Object.entries(CANONICAL_TERM_ALIASES)) {
        if (aliases.some((a) => a.toLowerCase() === lower)) {
          tokenSet.add(key.toLowerCase());
          for (const a of aliases) tokenSet.add(a.toLowerCase());
        }
      }
    }
    return Array.from(tokenSet);
  }

  /**
   * Search knowledge base across classical records and ingested research chunks.
   * Employs hybrid lexical + semantic token expansion with authority weighting and exception bundling.
   */
  public search(options: RAGSearchOptions): KnowledgeRecord[] {
    const limit = Math.min(20, Math.max(1, options.limit || 5));
    const minScore = options.minScore || 1;
    const rawQuery = (options.query || '').trim();
    const domain = options.domain?.toLowerCase();
    const planets = (options.planets || []).map((p) => p.toLowerCase());
    const houses = options.houses || [];
    const vargas = (options.vargas || []).map((v) => v.toLowerCase());

    const rawTokens = rawQuery
      ? rawQuery
          .replace(/[^\w\s\u0900-\u097F\u0100-\u024F]/g, ' ')
          .split(/\s+/)
          .filter((t) => t.length > 1)
      : [];

    const expandedTokens = this.expandQueryTokens(rawTokens);

    const scored = this.primaryKnowledgeBase.map((record) => {
      let score = 0;
      const hay = [
        record.canonicalTranslation,
        record.normalizedInterpretation,
        record.citation,
        record.sourceText,
        record.author,
        record.chapter,
        ...(record.metadata.tags || []),
        record.metadata.topic,
        record.metadata.subtopic || '',
        ...(record.metadata.vargaSubjects || []),
      ]
        .join(' ')
        .toLowerCase();

      const rawLowerSet = new Set(rawTokens.map((r) => r.toLowerCase()));

      // 1. Exact raw query token matching (primary high-precision weight)
      for (const t of rawTokens) {
        const lowerT = t.toLowerCase();
        if (hay.includes(lowerT)) {
          score += 4;
          // Exact citation, chapter, id, or sourceText match bonus
          if (
            record.citation.toLowerCase().includes(lowerT) ||
            record.sourceText.toLowerCase().includes(lowerT) ||
            record.chapter.toLowerCase().includes(lowerT) ||
            record.id.toLowerCase().includes(lowerT)
          ) {
            score += 4;
          }
        }
      }

      // 2. Expanded synonym token matching (recall expansion)
      for (const t of expandedTokens) {
        const lowerT = t.toLowerCase();
        if (!rawLowerSet.has(lowerT) && hay.includes(lowerT)) {
          score += 1;
        }
      }

      // Domain match bonus (only if query matched or domain explicitly requested)
      if (domain && score > 0) {
        if (record.metadata.topic.toLowerCase().includes(domain) || hay.includes(domain)) {
          score += 5;
        }
      }

      // Planet matches
      for (const p of record.metadata.planetarySubjects || []) {
        if (planets.includes(p.toLowerCase())) score += 3;
        if (rawQuery.toLowerCase().includes(p.toLowerCase())) score += 2;
      }

      // House matches
      for (const h of record.metadata.houseSubjects || []) {
        if (houses.includes(h)) score += 2;
      }

      // Varga matches
      for (const v of record.metadata.vargaSubjects || []) {
        if (vargas.includes(v.toLowerCase()) || rawQuery.toLowerCase().includes(v.toLowerCase())) {
          score += 3;
        }
      }

      // Authority tier weighting (BPHS, Phaladeepika, Saravali, Brihat Jataka prioritized ONLY if matched)
      if (score > 0 && record.metadata.authorityLevel === 'primary_foundational') {
        score += 3;
      }

      return { record, score };
    });

    scored.sort((a, b) => b.score - a.score);

    const results = scored
      .filter((s) => s.score >= minScore)
      .slice(0, limit)
      .map((s) => s.record);

    // Exception bundling (Golden evaluation case RAG-002: Rule and exception retrieved together)
    if (options.includeExceptions !== false && results.length > 0) {
      const topRuleKeywords = results
        .slice(0, 3)
        .flatMap((r) => r.metadata.tags || [])
        .filter((t) => t.length > 3);

      const exceptionCandidates = this.primaryKnowledgeBase.filter((r) => {
        if (results.some((res) => res.id === r.id)) return false;
        const text = (r.canonicalTranslation + ' ' + r.normalizedInterpretation).toLowerCase();
        const isExceptionDoc =
          text.includes('exception') ||
          text.includes('cancellation') ||
          text.includes('bhanga') ||
          text.includes('counter-indication') ||
          text.includes('qualifying condition');
        if (!isExceptionDoc) return false;
        return topRuleKeywords.some((kw) => text.includes(kw.toLowerCase()));
      });

      if (exceptionCandidates.length > 0) {
        results.push(...exceptionCandidates.slice(0, 2));
      }
    }

    return results;
  }

  /**
   * Get all ingested research chunks.
   */
  public getIngestedChunks(): IngestedDocumentChunk[] {
    return [...this.ingestedChunks];
  }

  /**
   * Total number of knowledge records available.
   */
  public getTotalRuleCount(): number {
    return this.primaryKnowledgeBase.length;
  }
}

export const dynamicRAGEngine = DynamicRAGEngine.getInstance();

