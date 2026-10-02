/**
 * ASTROWORLD — AI Astrologer Subsystem Types
 * Core contracts for Intent, Specialists, Context Packet, Validation, and Structured Responses.
 */

import {
  AIInterpretationContext,
  BirthProfile,
  DignityType,
  PlanetName,
  VargaCode,
  ZodiacSign,
} from '../../../shared/index.ts';

export type UserIntent =
  | 'GENERAL'
  | 'NATAL_CHART'
  | 'PLANETS'
  | 'DIGNITY'
  | 'VARGA'
  | 'D9'
  | 'D10'
  | 'PANCHANGA'
  | 'DASHA'
  | 'TRANSITS_CURRENT'
  | 'TRANSITS_FUTURE'
  | 'CAREER'
  | 'JOB'
  | 'FINANCE'
  | 'MARRIAGE'
  | 'RELATIONSHIP'
  | 'EDUCATION'
  | 'HEALTH'
  | 'SPIRITUALITY'
  | 'YOGA'
  | 'DOSHA'
  | 'JAIMINI'
  | 'STRENGTH'
  | 'COMPATIBILITY'
  | 'TIMING'
  | 'MUHURTA'
  | 'REMEDY'
  | 'PREDICTION'
  | 'GENERAL_FOLLOWUP';

export type QueryDepth = 'FACT' | 'OVERVIEW' | 'ANALYSIS' | 'DEEP_CONSULTATION';

export interface ExtractedEntities {
  targetDate?: string; // YYYY-MM-DD
  targetYear?: number;
  targetMonth?: number; // 1-12
  timeframeDescription?: string; // e.g., "March 2027", "next month"
  vargaCode?: VargaCode;
  planetsMentioned?: PlanetName[];
  signsMentioned?: ZodiacSign[];
  housesMentioned?: number[];
  topicArea?: 'CAREER' | 'MARRIAGE' | 'WEALTH' | 'HEALTH' | 'SPIRITUAL' | 'GENERAL';
  depth: QueryDepth;
  isExactDateRequested?: boolean;
}

export interface IntentAnalysisResult {
  primaryIntent: UserIntent;
  allIntents: UserIntent[];
  entities: ExtractedEntities;
  confidence: number;
}

export type SpecialistDomain =
  | 'GENERAL_ASTROLOGER'
  | 'NATAL_SPECIALIST'
  | 'DIGNITY_SPECIALIST'
  | 'VARGA_SPECIALIST'
  | 'D9_SPECIALIST'
  | 'D10_CAREER_SPECIALIST'
  | 'DASHA_SPECIALIST'
  | 'TRANSIT_SPECIALIST'
  | 'CAREER_SPECIALIST'
  | 'FINANCE_SPECIALIST'
  | 'MARRIAGE_SPECIALIST'
  | 'RELATIONSHIP_SPECIALIST'
  | 'YOGA_SPECIALIST'
  | 'DOSHA_SPECIALIST'
  | 'JAIMINI_SPECIALIST'
  | 'STRENGTH_SPECIALIST'
  | 'TIMING_SPECIALIST'
  | 'REMEDY_SPECIALIST';

export interface TimingFact {
  type: 'EXACT' | 'EVENT_WINDOW' | 'UNKNOWN';
  periodLabel: string;
  startDateIso?: string;
  endDateIso?: string;
  description: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'INDICATIVE_ONLY';
}

export interface ConsultationContextPacket {
  userQuestion: string;
  intents: UserIntent[];
  entities: ExtractedEntities;
  conversationSummary?: string;
  recentlyDiscussedFactKeys: string[];
  primaryTradition: string; // "Parashari Classical Vedic Astrology"
  relevantChartFacts: {
    ascendant?: { sign: string; degree: string; nakshatra: string; pada: number };
    planets: Array<{
      name: PlanetName;
      sign: string;
      degree: string;
      house: number;
      dignity: DignityType;
      nakshatra: string;
      pada: number;
      retrograde?: boolean;
      combust?: boolean;
      factKey: string;
    }>;
  };
  relevantVargaFacts?: {
    code: VargaCode;
    ascendantSign: string;
    planets: Array<{
      name: PlanetName;
      vargaSign: string;
      house: number;
      dignity: DignityType;
      isVargottama?: boolean;
      factKey: string;
    }>;
  }[];
  relevantDashaFacts?: {
    activeHierarchy?: string;
    currentMahadasha?: { lord: string; startDate: string; endDate: string };
    currentAntardasha?: { lord: string; startDate: string; endDate: string };
    upcomingPeriods?: Array<{ lord: string; subLord: string; startDate: string; endDate: string }>;
  };
  relevantTransitFacts?: {
    evaluationPeriod: string;
    planets: Array<{
      name: string;
      transitSign: string;
      approxDegree?: number;
      nakshatra?: string;
      retrograde?: boolean;
      natalHouse?: number;
      chandraHouse?: number;
    }>;
    sadeSatiStatus?: string;
  };
  relevantYogas?: Array<{ name: string; reference: string; effects: string }>;
  relevantJaimini?: {
    atmakaraka?: string;
    amatyakaraka?: string;
    darakaraka?: string;
    karakamsa?: string;
    arudhaLagna?: string;
  };
  relevantStrengths?: {
    topPlanets?: string[];
    weakPlanets?: string[];
    savHighlights?: string;
  };
  relevantRules: string[];
  relevantTiming: TimingFact[];
  uncertaintyNotes: string[];
}

export interface StructuredAiResponse {
  direct_answer: string;
  astrological_reasoning: string;
  personal_interpretation: string;
  timing?: Array<{
    type: 'EXACT' | 'EVENT_WINDOW' | 'UNKNOWN';
    period: string;
    indication: string;
  }>;
  facts_used: string[];
  rules_used: string[];
  uncertainty_or_caveats?: string[];
  practical_guidance?: string;
  follow_up_suggestions?: string[];
  transit_overview_table?: Array<{
    planet: string;
    sign: string;
    approx_degree: string;
    nakshatra: string;
    retrograde: boolean;
  }>;
}

export interface ValidationResult {
  isValid: boolean;
  violations: string[];
  repairedResponse?: StructuredAiResponse;
}

export interface ConversationTurn {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestampIso: string;
  intents?: UserIntent[];
  factsReferenced?: string[];
}

export interface ConversationMemoryState {
  sessionId: string;
  turns: ConversationTurn[];
  establishedTimeframe?: string; // e.g. "March 2027"
  establishedTopic?: string; // e.g. "Career transition"
  discussedFactKeys: Set<string>;
  unresolvedQuestions: string[];
}
