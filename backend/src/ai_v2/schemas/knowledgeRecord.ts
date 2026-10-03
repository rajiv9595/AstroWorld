/**
 * ASTROWORLD AI V2 — Classical Jyotish Knowledge Record Schema
 * Defines the strict, source-grounded contract for classical Vedic astrology text chunks.
 */

import { VargaCode } from '../../../../shared/index.ts';

export type JyotishTradition = 'parashari' | 'jaimini' | 'siddhantic' | 'tajika' | 'classical';

export type ClassicalRuleType =
  | 'definition'
  | 'general_principle'
  | 'dignity_rule'
  | 'conjunction_rule'
  | 'aspect_rule'
  | 'house_lord_rule'
  | 'dasha_rule'
  | 'transit_rule'
  | 'yoga_rule'
  | 'varga_rule'
  | 'strength_rule'
  | 'exception_rule'
  | 'karaka_rule';

export type AuthorityLevel = 'primary_foundational' | 'authoritative_commentary' | 'siddhantic';

export interface KnowledgeMetadata {
  tradition: JyotishTradition;
  topic: string;
  subtopic: string;
  ruleType: ClassicalRuleType;
  planetarySubjects: string[];
  houseSubjects: number[];
  signSubjects: string[];
  vargaSubjects: VargaCode[];
  dashaSubjects?: string[];
  transitSubjects?: string[];
  yogaSubjects?: string[];
  authorityLevel: AuthorityLevel;
  tags: string[];
}

export interface KnowledgeRecord {
  id: string;
  sourceText: string;
  author: string;
  chapter: string;
  sectionOrShloka?: string;
  citation: string;
  originalSanskrit?: string;
  canonicalTranslation: string;
  normalizedInterpretation: string;
  metadata: KnowledgeMetadata;
  version: string;
  verified: boolean;
}

export interface RAGRetrievalQuery {
  query: string;
  topics?: string[];
  tradition?: JyotishTradition;
  ruleTypes?: ClassicalRuleType[];
  planetarySubjects?: string[];
  houseSubjects?: number[];
  vargaSubjects?: VargaCode[];
  requiredEvidenceIds?: string[];
  limit?: number;
}

export interface RetrievalResultItem {
  id: string;
  source: string;
  author: string;
  chapter: string;
  section?: string;
  citation: string;
  content: string;
  normalizedRule: string;
  relevanceScore: number;
  tradition: JyotishTradition;
  metadata: KnowledgeMetadata;
}

export interface RAGRetrievalResponse {
  results: RetrievalResultItem[];
  retrievalVersion: string;
  totalMatches: number;
  matchedTopics: string[];
  warnings: string[];
  verified: boolean;
}

export function validateKnowledgeRecord(record: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!record || typeof record !== 'object') {
    return { valid: false, errors: ['KnowledgeRecord must be a non-null object.'] };
  }

  if (!record.id || typeof record.id !== 'string') errors.push('KnowledgeRecord.id must be a string.');
  if (!record.sourceText || typeof record.sourceText !== 'string') errors.push('KnowledgeRecord.sourceText must be a string.');
  if (!record.author || typeof record.author !== 'string') errors.push('KnowledgeRecord.author must be a string.');
  if (!record.chapter || typeof record.chapter !== 'string') errors.push('KnowledgeRecord.chapter must be a string.');
  if (!record.citation || typeof record.citation !== 'string') errors.push('KnowledgeRecord.citation must be a string.');
  if (!record.canonicalTranslation || typeof record.canonicalTranslation !== 'string') {
    errors.push('KnowledgeRecord.canonicalTranslation must be a string.');
  }
  if (!record.normalizedInterpretation || typeof record.normalizedInterpretation !== 'string') {
    errors.push('KnowledgeRecord.normalizedInterpretation must be a string.');
  }
  if (!record.metadata || typeof record.metadata !== 'object') {
    errors.push('KnowledgeRecord.metadata must be an object.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
