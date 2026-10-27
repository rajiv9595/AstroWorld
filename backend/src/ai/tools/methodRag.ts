/**
 * Method RAG — classical rule retrieval + domain playbooks for the agent.
 */

import { CLASSICAL_JYOTISH_KNOWLEDGE_BASE } from '../rag/knowledgeBase.ts';
import { dynamicRAGEngine } from '../rag/dynamicRagEngine.ts';
import { DocumentIngestionService } from '../rag/documentIngestionService.ts';
import {
  detectPlaybookDomains,
  getPlaybookByDomain,
  getPlaybooksForQuestion,
} from '../agent/domainPlaybooks.ts';
import { ToolExecutionResult } from './astrologyTools.ts';

export async function executeGetDomainPlaybook(args: any): Promise<ToolExecutionResult> {
  const domain = typeof args?.domain === 'string' ? args.domain.trim().toLowerCase() : '';
  const question = typeof args?.question === 'string' ? args.question : '';

  let playbooks = domain
    ? [getPlaybookByDomain(domain)].filter(Boolean)
    : getPlaybooksForQuestion(question || domain);

  if (!playbooks.length) {
    playbooks = getPlaybooksForQuestion(question || 'general');
  }

  return {
    success: true,
    tool: 'get_domain_playbook',
    data: {
      detectedDomains: detectPlaybookDomains(question || domain),
      playbooks,
    },
    provenance: {
      sourceEngine: 'AstroWorld Domain Playbooks',
      ruleStandard: 'Method checklist (not predictions)',
      calculatedAtIso: new Date().toISOString(),
      verified: true,
    },
  };
}

export async function executeRetrieveClassicalRules(args: any): Promise<ToolExecutionResult> {
  const query = typeof args?.query === 'string' ? args.query.trim() : '';
  const limit = Math.min(8, Math.max(1, Number(args?.limit) || 5));

  if (!query) {
    return {
      success: false,
      tool: 'retrieve_classical_rules',
      error: 'query is required',
      provenance: {
        sourceEngine: 'Classical Jyotish RAG',
        ruleStandard: 'N/A',
        calculatedAtIso: new Date().toISOString(),
        verified: false,
      },
    };
  }

  DocumentIngestionService.autoIngestPreloadedNotes();
  const topRecords = dynamicRAGEngine.search({ query, limit });

  return {
    success: true,
    tool: 'retrieve_classical_rules',
    data: {
      query,
      results: topRecords.map((record) => ({
        id: record.id,
        citation: record.citation,
        sourceText: record.sourceText,
        author: record.author,
        topic: record.metadata.topic,
        ruleType: record.metadata.ruleType,
        interpretation: record.normalizedInterpretation,
        translation: record.canonicalTranslation,
      })),
    },
    provenance: {
      sourceEngine: 'Classical Jyotish Knowledge Base',
      ruleStandard: 'BPHS / Phaladeepika / Saravali / Jaimini corpus',
      calculatedAtIso: new Date().toISOString(),
      verified: true,
    },
  };
}
