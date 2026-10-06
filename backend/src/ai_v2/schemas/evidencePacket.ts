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
  evidenceIds?: string[];
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

  const toolResults = Array.isArray(packet.toolResults) ? packet.toolResults : [];
  const verifiedSuccessfulTools = new Set(
    toolResults
      .filter((r: any) => r?.success === true && r?.provenance?.verified === true)
      .map((r: any) => r.toolName),
  );
  const factIds = new Set(
    (Array.isArray(packet.facts) ? packet.facts : []).map((f: any) => f?.id).filter(Boolean),
  );
  const derivedIds = new Set(
    (Array.isArray(packet.derivedFacts) ? packet.derivedFacts : []).map((f: any) => f?.id).filter(Boolean),
  );

  for (const fact of Array.isArray(packet.facts) ? packet.facts : []) {
    if (!fact?.id || !fact?.sourceTool) {
      errors.push('Every FactItem must have id and sourceTool.');
    }
    if (fact?.verified === true && !verifiedSuccessfulTools.has(fact.sourceTool)) {
      errors.push(`Verified fact "${fact?.id}" has no matching verified successful source tool.`);
    }
  }

  for (const derived of Array.isArray(packet.derivedFacts) ? packet.derivedFacts : []) {
    if (!derived?.id || !derived?.sourceTool) {
      errors.push('Every DerivedFactItem must have id and sourceTool.');
    }
    if (derived?.verified === true && !verifiedSuccessfulTools.has(derived.sourceTool)) {
      errors.push(`Verified derived fact "${derived?.id}" has no matching verified successful source tool.`);
    }
    if (Array.isArray(derived?.evidenceIds)) {
      for (const evidenceId of derived.evidenceIds) {
        if (!factIds.has(evidenceId) && !derivedIds.has(evidenceId)) {
          errors.push(`Derived fact "${derived?.id}" references missing evidence "${evidenceId}".`);
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
