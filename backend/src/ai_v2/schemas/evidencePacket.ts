/**
 * ASTROWORLD AI V2 — Evidence Packet Schema & Validation
 * Defines the immutable structured container for all verified astrological facts returned by deterministic tools.
 */

import { QuestionPlan } from './questionPlan.ts';

export interface FactItem {
  id: string;
  category: 'natal' | 'varga' | 'dasha' | 'transit' | 'yoga' | 'shadbala' | 'ashtakavarga' | 'jaimini' | 'panchanga';
  entity: string;
  property: string;
  value: any;
  sign?: string;
  house?: number;
  degree?: number;
  nakshatra?: string;
  dignity?: string;
  sourceTool: string;
  verified: boolean;
}

export interface DerivedFactItem {
  id: string;
  type: string;
  ruleCitation?: string;
  participatingPlanets?: string[];
  participatingHouses?: number[];
  participatingSigns?: string[];
  description: string;
  sourceTool: string;
  verified: boolean;
}

export interface ToolExecutionRecord {
  toolName: string;
  executionDurationMs: number;
  success: boolean;
  provenance: {
    sourceEngine: string;
    ruleStandard: string;
    calculatedAtIso: string;
    verified: boolean;
    inputHash?: string;
  };
  resultSummary?: string;
  data: any;
  error?: string;
}

export interface EvidencePacket {
  version: string;
  createdAtIso: string;
  question: {
    raw: string;
    normalized: string;
    intent: string;
    domain: string;
  };
  plan: QuestionPlan;
  facts: FactItem[];
  derivedFacts: DerivedFactItem[];
  toolResults: ToolExecutionRecord[];
  provenance: Array<{
    toolName: string;
    sourceEngine: string;
    ruleStandard: string;
    calculatedAtIso: string;
    verified: boolean;
  }>;
  warnings: string[];
  missingEvidence: string[];
  executionMetrics: {
    totalDurationMs: number;
    toolsExecutedCount: number;
    parallelBatchesCount: number;
  };
  verified: boolean;
}

export interface EvidencePacketValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateEvidencePacket(packet: any): EvidencePacketValidationResult {
  const errors: string[] = [];

  if (!packet || typeof packet !== 'object') {
    return { valid: false, errors: ['EvidencePacket must be a non-null object.'] };
  }

  if (typeof packet.version !== 'string' || !packet.version) {
    errors.push('EvidencePacket.version must be a non-empty string.');
  }

  if (!packet.question || typeof packet.question !== 'object') {
    errors.push('EvidencePacket.question must be an object.');
  }

  if (!packet.plan || typeof packet.plan !== 'object') {
    errors.push('EvidencePacket.plan must be an object.');
  }

  if (!Array.isArray(packet.facts)) {
    errors.push('EvidencePacket.facts must be an array of FactItems.');
  }

  if (!Array.isArray(packet.derivedFacts)) {
    errors.push('EvidencePacket.derivedFacts must be an array of DerivedFactItems.');
  }

  if (!Array.isArray(packet.toolResults)) {
    errors.push('EvidencePacket.toolResults must be an array of ToolExecutionRecords.');
  }

  if (!Array.isArray(packet.provenance)) {
    errors.push('EvidencePacket.provenance must be an array of Provenance objects.');
  }

  if (typeof packet.verified !== 'boolean') {
    errors.push('EvidencePacket.verified must be a boolean.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
