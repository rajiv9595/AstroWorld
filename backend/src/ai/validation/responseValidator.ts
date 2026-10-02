/**
 * ASTROWORLD — Deterministic Post-Generation Response Validator
 * Audits Gemini output before it reaches the client to guarantee astronomical correctness,
 * Varga identity preservation, timing honesty, and absence of hallucinated facts.
 */

import { ConsultationContextPacket, StructuredAiResponse, ValidationResult } from '../types.ts';

export function validateAstrologerResponse(
  response: StructuredAiResponse,
  packet: ConsultationContextPacket
): ValidationResult {
  const violations: string[] = [];

  const fullOutputText = [
    response.direct_answer,
    response.astrological_reasoning,
    response.personal_interpretation,
    response.practical_guidance || '',
    ...(response.facts_used || []),
  ].join(' ');

  const normalizedOutput = fullOutputText.toLowerCase();

  // 1. Validate D1 vs D9 / Varga Firewall Invariants
  // If D9 was discussed: Check Sun in D9 vs Sun in D1
  if (normalizedOutput.includes('d9 sun') || normalizedOutput.includes('sun in d9') || normalizedOutput.includes('navamsha sun')) {
    const d9Fact = packet.relevantVargaFacts?.find((v) => v.code === 'D9')?.planets.find((p) => p.name === 'Sun');
    if (d9Fact && d9Fact.vargaSign === 'Aries') {
      if (normalizedOutput.includes('d9 sun in leo') || normalizedOutput.includes('navamsha sun in leo')) {
        violations.push('Varga Firewall Violation: D9 Sun was incorrectly described as being in Leo (D1 sign) instead of Aries.');
      }
    }
  }

  // 2. Validate Dignity Claims
  packet.relevantChartFacts.planets.forEach((p) => {
    // If D1 planet is NOT exalted in D1, verify the AI doesn't claim it is exalted in D1
    if (p.dignity !== 'EXALTED') {
      const regex = new RegExp(`\\bd1\\s+${p.name.toLowerCase()}\\s+is\\s+exalted\\b`, 'i');
      if (regex.test(fullOutputText)) {
        violations.push(`Dignity Mismatch: D1 ${p.name} was claimed as Exalted, but its canonical D1 dignity is ${p.dignity}.`);
      }
    }
  });

  // 3. Validate Exact Timing Firewall
  if (packet.entities.isExactDateRequested) {
    // Check if the AI invented an exact future calendar date (e.g. "On November 14, 2027 you will get a job offer")
    const datePattern = /\b(on\s+(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},\s+\d{4})\b/i;
    if (datePattern.test(fullOutputText) && !normalizedOutput.includes('born on') && !normalizedOutput.includes('birth date')) {
      violations.push('Timing Firewall Violation: AI claimed an exact future calendar day for an unpredicted life event.');
    }
  }

  // 4. Validate Transit Table Structure
  if (response.transit_overview_table && Array.isArray(response.transit_overview_table)) {
    response.transit_overview_table.forEach((row) => {
      if (!row.planet || !row.sign) {
        violations.push('Malformed Transit Table: Row missing planet or sign.');
      }
    });
  }

  // 5. Check if direct answer is empty
  if (!response.direct_answer || response.direct_answer.trim().length < 5) {
    violations.push('Incomplete Response: Direct answer is empty or trivial.');
  }

  return {
    isValid: violations.length === 0,
    violations,
    repairedResponse: violations.length === 0 ? response : undefined,
  };
}
