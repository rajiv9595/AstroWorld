/**
 * ASTROWORLD AI V2 — Classical Jyotish RAG Retriever Service
 * Retrieves source-grounded classical rules driven by QuestionPlan and constrained by verified EvidencePacket.
 * Enforces strict boundaries:
 * - Never overrides deterministic chart facts.
 * - Does not invent speculative native-specific predictions.
 * - Preserves classical text citations and author traditions.
 */

import { CLASSICAL_JYOTISH_KNOWLEDGE_BASE } from './knowledgeBase.ts';
import {
  KnowledgeRecord,
  RAGRetrievalQuery,
  RAGRetrievalResponse,
  RetrievalResultItem,
} from '../schemas/knowledgeRecord.ts';
import { QuestionPlan } from '../schemas/questionPlan.ts';
import { EvidencePacket } from '../schemas/evidencePacket.ts';

export interface ClassicalRAGRetrieverOptions {
  customKnowledgeBase?: KnowledgeRecord[];
}

export class ClassicalRAGRetriever {
  private knowledgeBase: KnowledgeRecord[];

  constructor(options?: ClassicalRAGRetrieverOptions) {
    this.knowledgeBase = options?.customKnowledgeBase || CLASSICAL_JYOTISH_KNOWLEDGE_BASE;
  }

  /**
   * Retrieves relevant classical rules for a user inquiry and verified evidence packet.
   */
  public retrieve(
    queryInput: string | RAGRetrievalQuery,
    questionPlan?: QuestionPlan,
    evidencePacket?: EvidencePacket
  ): RAGRetrievalResponse {
    const rawQuery = typeof queryInput === 'string' ? queryInput : queryInput.query;
    const limit = typeof queryInput === 'object' && queryInput.limit ? queryInput.limit : 5;
    const traditionFilter = typeof queryInput === 'object' ? queryInput.tradition : undefined;
    const ruleTypesFilter = typeof queryInput === 'object' ? queryInput.ruleTypes : undefined;

    if (!rawQuery || rawQuery.trim().length === 0) {
      return {
        results: [],
        retrievalVersion: 'ai-v2-rag-1',
        totalMatches: 0,
        matchedTopics: [],
        warnings: ['Empty retrieval query supplied.'],
        verified: true,
      };
    }

    const lowerQuery = rawQuery.toLowerCase();
    const queryTokens = lowerQuery
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(t => t.length > 2);

    // Extract focus factors from QuestionPlan if available
    const focusPlanets = questionPlan?.planetFocus || [];
    const focusHouses = questionPlan?.houseFocus || [];
    const focusVargas = questionPlan?.chartLayers || [];
    const focusDomain = questionPlan?.domain;
    const focusIntent = questionPlan?.intent;

    // Extract active factors from verified EvidencePacket if available
    const activeYogas = evidencePacket?.derivedFacts
      ?.filter(f => f.type === 'Yoga')
      ?.map(f => f.description.toLowerCase()) || [];

    const scoredRecords: Array<{ record: KnowledgeRecord; score: number }> = [];

    for (const record of this.knowledgeBase) {
      // Filter by tradition if requested
      if (traditionFilter && record.metadata.tradition !== traditionFilter && record.metadata.tradition !== 'classical') {
        continue;
      }

      // Filter by rule type if requested
      if (ruleTypesFilter && ruleTypesFilter.length > 0 && !ruleTypesFilter.includes(record.metadata.ruleType)) {
        continue;
      }

      let score = 0;
      const meta = record.metadata;

      // 1. Domain / Topic Alignment
      const isDomainMatch =
        (focusDomain && (meta.topic === focusDomain || meta.tags.includes(focusDomain))) ||
        ((focusDomain === 'relationship' || focusDomain === 'marriage') && (meta.topic === 'marriage' || meta.topic === 'relationship' || meta.tags.includes('marriage') || meta.tags.includes('relationship'))) ||
        ((focusDomain === 'career' || focusDomain === 'profession') && (meta.topic === 'career' || meta.topic === '10th_house' || meta.tags.includes('career')));

      if (isDomainMatch) {
        score += 4.0;
      }
      if (focusIntent && (meta.subtopic === focusIntent || meta.tags.includes(focusIntent))) {
        score += 3.5;
      }

      // Demote out-of-domain rules strictly
      if ((focusDomain === 'relationship' || focusDomain === 'marriage') && (meta.topic === 'career' || meta.topic === '10th_house' || meta.topic === 'transits' || meta.subtopic === 'sade_sati')) {
        score -= 10.0;
      }
      if ((focusDomain === 'career' || focusDomain === 'profession') && (meta.topic === 'marriage' || meta.topic === 'relationship')) {
        score -= 10.0;
      }
      if (focusIntent === 'dasha_analysis' && (meta.topic === 'transits' || meta.subtopic === 'sade_sati' || meta.topic === 'marriage' || meta.topic === 'career')) {
        score -= 10.0;
      }

      // 2. Planetary Subject Match & Precision
      if (focusPlanets.length > 0) {
        const queryPrimaryPlanets = focusPlanets.filter(p => p !== 'Moon' && p !== 'Sun');
        const recordPrimaryPlanets = meta.planetarySubjects.filter(p => p !== 'Moon' && p !== 'Sun');

        if (queryPrimaryPlanets.length > 0) {
          const hasPrimaryMatch = queryPrimaryPlanets.some(p => recordPrimaryPlanets.includes(p));
          if (hasPrimaryMatch) {
            score += 5.0;
          } else if (recordPrimaryPlanets.length > 0) {
            // Contradicting planet (e.g. Saturn when user asked for Jupiter)
            score -= 6.0;
          }
        } else {
          if (focusPlanets.some(p => meta.planetarySubjects.includes(p))) {
            score += 3.0;
          }
        }
      }

      // 3. House Subject Match
      for (const h of focusHouses) {
        if (meta.houseSubjects.includes(h)) {
          score += 2.0;
        }
      }

      // 4. Varga Subject Match
      for (const v of focusVargas) {
        if (meta.vargaSubjects.includes(v)) {
          score += 2.5;
        }
      }

      // 5. Active Yoga Evidence Match
      for (const yName of activeYogas) {
        if (meta.yogaSubjects?.some(ys => yName.includes(ys.toLowerCase()))) {
          score += 3.0;
        }
      }

      // 6. Textual / Keyword Match
      const recordFullText = `${record.sourceText} ${record.author} ${record.chapter} ${record.canonicalTranslation} ${record.normalizedInterpretation} ${meta.tags.join(' ')}`.toLowerCase();

      for (const token of queryTokens) {
        if (recordFullText.includes(token)) {
          score += 0.8;
        }
      }

      // Boost foundational classical citations
      if (meta.authorityLevel === 'primary_foundational') {
        score += 0.5;
      }

      // Penalty for out-of-domain mismatches (e.g., query is about marriage, record is strictly about career)
      if ((focusDomain === 'career' || focusDomain === 'profession') && (meta.topic === 'marriage' || meta.topic === 'relationship')) {
        score -= 8.0;
      }
      if ((focusDomain === 'relationship' || focusDomain === 'marriage') && (meta.topic === 'career' || meta.topic === 'sade_sati')) {
        score -= 8.0;
      }
      if ((focusDomain === 'timing' || focusIntent === 'dasha_analysis') && (meta.topic === 'marriage' || meta.topic === 'sade_sati')) {
        score -= 8.0;
      }

      if (score >= 2.5) {
        scoredRecords.push({ record, score });
      }
    }

    // Sort by relevance score descending
    scoredRecords.sort((a, b) => b.score - a.score);

    const topResults = scoredRecords.slice(0, limit);
    const maxScore = topResults.length > 0 ? topResults[0].score : 1;

    const results: RetrievalResultItem[] = topResults.map(({ record, score }) => ({
      id: record.id,
      source: record.sourceText,
      author: record.author,
      chapter: record.chapter,
      section: record.sectionOrShloka,
      citation: record.citation,
      content: record.canonicalTranslation,
      normalizedRule: record.normalizedInterpretation,
      relevanceScore: Math.min(1.0, Math.round((score / Math.max(maxScore, 10)) * 100) / 100),
      tradition: record.metadata.tradition,
      metadata: record.metadata,
    }));

    const matchedTopics = Array.from(new Set(results.map(r => r.metadata.topic)));

    return {
      results,
      retrievalVersion: 'ai-v2-rag-1',
      totalMatches: scoredRecords.length,
      matchedTopics,
      warnings: results.length === 0 ? ['No highly relevant classical rules found for the query constraints.'] : [],
      verified: true,
    };
  }

  /**
   * Retrieves all knowledge items in the corpus.
   */
  public getAllRecords(): KnowledgeRecord[] {
    return this.knowledgeBase;
  }
}
