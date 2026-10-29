/**
 * ASTROWORLD — Astrological Case Study Types & Interfaces
 */

import { NormalizedChartFingerprint } from './chartFingerprint.ts';

export type CaseDomain =
  | 'career'
  | 'wealth'
  | 'marriage'
  | 'health'
  | 'education'
  | 'litigation'
  | 'children'
  | 'spirituality'
  | 'foreign_travel'
  | 'general';

export interface AstrologicalCaseStudyRecord {
  id: string;
  slug: string;
  title: string;
  domain: CaseDomain;
  subDomain?: string;

  // Birth Details
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour: number;
  birthMinute: number;
  birthSecond?: number;
  birthLatitude: number;
  birthLongitude: number;
  birthTimezone: string;
  cityName?: string;

  // Historical Verified Milestone
  eventTitle: string;
  eventDateIso: string;
  eventAge: number;
  historicalOutcome: string;
  shastricRootCause: string;
  provenanceReference: string;
  authenticityGrade: 'A' | 'AA' | 'B' | 'C';

  // High-Dimensional Chart Fingerprint & Mathematical Vectors
  chartFingerprint: NormalizedChartFingerprint;
  embeddingVector: number[];
  verificationStatus: 'verified' | 'pending' | 'rejected';
}

export interface CaseStudyMatchResult {
  caseStudy: AstrologicalCaseStudyRecord;
  cosineSimilarity: number;
  shastricCongruenceScore: number;
  combinedMatchIndex: number; // 0 to 100
  matchingSignatures: string[];
}

export interface CaseStudyQueryFilter {
  domain?: CaseDomain;
  subDomain?: string;
  minSimilarity?: number;
  targetLagna?: string;
  activeDashaLord?: string;
  limit?: number;
}

