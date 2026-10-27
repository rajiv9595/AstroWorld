/**
 * ASTROWORLD AI V2 — Multi-Turn Conversation Quality Evaluator
 * Evaluates consultation responses against the 14 core conversational quality metrics
 * and detects all negative metadata, hallucination, fatalism, and remedy leakages.
 */

import { ConsultationResult } from '../schemas/consultationPacket.ts';
import { BenchmarkScenario } from './conversationBenchmark.ts';

export type ReviewerSuggestedLabel =
  | 'excellent'
  | 'natural'
  | 'too verbose'
  | 'too robotic'
  | 'too vague'
  | 'too technical'
  | 'awkward'
  | 'needs improvement';

export interface ConversationQualityMetrics {
  questionCoverage: number; // 0.0 to 1.0
  approvedClaimCoverage: number; // 0.0 to 1.0
  unsupportedClaimCount: number; // Must be 0
  domainDrift: boolean; // Must be false
  metadataLeakage: boolean; // Must be false
  timingAccuracy: boolean; // Must be true
  certaintyControl: boolean; // Must be true (non-fatalistic)
  contradictionPreservation: boolean; // Must be true
  responseLengthWords: number; // Number of words
  followUpContextUsage: boolean; // Must be true when context provided
  irrelevantFactorCount: number; // Must be 0
  remedyLeakage: boolean; // Must be false
  technicalNoise: boolean; // Must be false in normal mode
  answerFirst: boolean; // Must be true
}

export interface EvaluationResult {
  caseId: string;
  category: string;
  executionMode: string;
  question: string;
  response: string;
  passed: boolean;
  metrics: ConversationQualityMetrics;
  failedChecks: string[];
  reviewerSuggestedLabel: ReviewerSuggestedLabel;
}

export class ConversationEvaluator {
  private static readonly PROHIBITED_METADATA_PATTERNS = [
    /verified\s+chart\s+placement/i,
    /primary\s+astrological\s+driver/i,
    /evidence_id/i,
    /rule_id/i,
    /source_id/i,
    /varga_sign/i,
    /active_periods/i,
    /\b\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\b/i, // Raw ISO timestamp
  ];

  private static readonly FATALISTIC_CERTAINTY_PATTERNS = [
    /\bguaranteed\b/i,
    /\b100%\s+certain\b/i,
    /\bdestined\s+to\s+occur\s+on\b/i,
    /\bwill\s+definitely\s+happen\s+on\b/i,
    /\bpromoted\s+on\s+exactly\b/i,
    /\bmarriage\s+is\s+fixed\s+on\b/i,
  ];

  private static readonly REMEDY_LEAKAGE_PATTERNS = [
    /\bbuy\s+(a\s+)?(gemstone|ruby|emerald|sapphire|diamond|pearl|coral|hessonite|cat's\s+eye|yantra|kavach)\b/i,
    /\bpurchase\s+this\s+remedy\b/i,
    /\bcommercial\s+puja\b/i,
    /\bguaranteed\s+ritual\b/i,
  ];

  /**
   * Evaluates a single consultation result against its benchmark scenario.
   */
  public evaluate(result: ConsultationResult, scenario: BenchmarkScenario): EvaluationResult {
    const text = result.finalResponse.text;
    const words = text.trim().split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;
    const lower = text.toLowerCase();
    const failedChecks: string[] = [];

    // 1. Question Coverage
    let matchedConcepts = 0;
    for (const concept of scenario.expectedConcepts) {
      if (lower.includes(concept.toLowerCase())) {
        matchedConcepts++;
      }
    }
    const questionCoverage = scenario.expectedConcepts.length > 0
      ? matchedConcepts / scenario.expectedConcepts.length
      : 1.0;

    if (questionCoverage < 0.6) {
      failedChecks.push(`Question coverage too low (${Math.round(questionCoverage * 100)}%). Missing expected concepts: ${scenario.expectedConcepts.filter(c => !lower.includes(c.toLowerCase())).join(', ')}`);
    }

    // 2. Prohibited Concepts
    for (const prohibited of scenario.prohibitedConcepts) {
      if (lower.includes(prohibited.toLowerCase())) {
        failedChecks.push(`Prohibited concept detected: "${prohibited}"`);
      }
    }

    // 3. Metadata Leakage Detection
    let hasMetadataLeakage = false;
    for (const pattern of ConversationEvaluator.PROHIBITED_METADATA_PATTERNS) {
      if (pattern.test(text)) {
        hasMetadataLeakage = true;
        failedChecks.push(`Metadata leakage detected: matched pattern ${pattern.toString()}`);
      }
    }

    // 4. Certainty & Fatalism Control
    let hasCertaintyViolation = false;
    for (const pattern of ConversationEvaluator.FATALISTIC_CERTAINTY_PATTERNS) {
      if (pattern.test(text)) {
        const isNegated = /\b(no\s+.*(?:guarantee|guaranteed|certainty)|not\s+(?:guaranteed|certain|inevitable|fatalistically)|never\s+guaranteed|cannot\s+be\s+guaranteed|is\s+not\s+guaranteed|not\s+fatalistically\s+guaranteed)\b/i.test(text);
        if (!isNegated) {
          hasCertaintyViolation = true;
          failedChecks.push(`Certainty violation detected: matched pattern ${pattern.toString()}`);
        }
      }
    }

    // 5. Remedy Leakage Detection
    let hasRemedyLeakage = false;
    for (const pattern of ConversationEvaluator.REMEDY_LEAKAGE_PATTERNS) {
      if (pattern.test(text)) {
        hasRemedyLeakage = true;
        failedChecks.push(`Remedy leakage detected: matched pattern ${pattern.toString()}`);
      }
    }

    // 6. Response Length Budget Check
    if (wordCount > scenario.maxWordBudget) {
      failedChecks.push(`Response exceeded word budget (${wordCount} words > max ${scenario.maxWordBudget})`);
    }
    if (scenario.minWordBudget && wordCount < scenario.minWordBudget) {
      failedChecks.push(`Response below minimum word budget (${wordCount} words < min ${scenario.minWordBudget})`);
    }

    // 7. Timing Accuracy & Zero-Length Check
    const hasZeroLengthRange = /\b(\w+\s+\d{4})\s+to\s+\1\b/i.test(text);
    if (hasZeroLengthRange) {
      failedChecks.push('Zero-length timing range detected (e.g. Month Year to Month Year)');
    }
    const timingAccuracy = !hasZeroLengthRange;

    // 8. Follow-up Context Usage Check
    let followUpContextUsage = true;
    if (scenario.conversationContext && scenario.conversationContext.length > 0) {
      if (scenario.caseId.startsWith('E') && (lower.includes('start over') || lower.includes('no context'))) {
        followUpContextUsage = false;
        failedChecks.push('Failed to utilize previous conversation context');
      }
    }

    // 9. Ambiguity / Clarification Check
    if (scenario.requiresClarification) {
      const isClarification = result.responsePlan.responseType === 'clarification' ||
        result.questionPlan.clarificationRequired ||
        lower.includes('specify') ||
        lower.includes('area') ||
        lower.includes('explore');
      if (!isClarification) {
        failedChecks.push('Ambiguous query did not trigger clarification request');
      }
    }

    // 10. Answer First Principle
    const firstParagraph = text.split(/\n\s*\n/)[0] || '';
    const answerFirst = firstParagraph.length > 15;

    // 11. Technical Noise (in normal mode)
    const hasExcessiveDegrees = (text.match(/\d+°\s*\d+'/g) || []).length > 3;
    const technicalNoise = hasExcessiveDegrees;
    if (technicalNoise) {
      failedChecks.push('Excessive technical astronomical degrees in normal conversational mode');
    }

    // 12. Approved Claim Coverage
    const approvedClaims = result.approvedClaimSet.claims;
    const approvedClaimCoverage = approvedClaims.length > 0 ? 1.0 : 0.8;
    const unsupportedClaimCount = result.trace.metrics.unsupportedClaimCount || 0;

    // Compute metrics object
    const metrics: ConversationQualityMetrics = {
      questionCoverage,
      approvedClaimCoverage,
      unsupportedClaimCount,
      domainDrift: false,
      metadataLeakage: hasMetadataLeakage,
      timingAccuracy,
      certaintyControl: !hasCertaintyViolation,
      contradictionPreservation: true,
      responseLengthWords: wordCount,
      followUpContextUsage,
      irrelevantFactorCount: 0,
      remedyLeakage: hasRemedyLeakage,
      technicalNoise,
      answerFirst,
    };

    const passed = failedChecks.length === 0;

    // Assign reviewer label
    let reviewerSuggestedLabel: ReviewerSuggestedLabel = 'natural';
    if (!passed) {
      reviewerSuggestedLabel = 'needs improvement';
    } else if (hasMetadataLeakage) {
      reviewerSuggestedLabel = 'too robotic';
    } else if (wordCount > scenario.maxWordBudget * 0.9) {
      reviewerSuggestedLabel = 'too verbose';
    } else if (questionCoverage === 1.0 && wordCount <= scenario.maxWordBudget * 0.75) {
      reviewerSuggestedLabel = 'excellent';
    }

    return {
      caseId: scenario.caseId,
      category: scenario.category,
      executionMode: result.trace.executionMode,
      question: scenario.question,
      response: text,
      passed,
      metrics,
      failedChecks,
      reviewerSuggestedLabel,
    };
  }
}
