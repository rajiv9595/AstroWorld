/**
 * ASTROWORLD — Master Astrologer Synthesis Orchestrator
 * Pipeline:
 * User Question -> Intent -> Specialist Routing -> Context Packet -> Gemini -> Validation -> Memory -> Client Response
 */

import { AIInterpretationContext } from '../../../../shared/index.ts';
import { buildConsultationContextPacket } from '../context/contextPacketBuilder.ts';
import { classifyUserQuestion } from '../intent/intentClassifier.ts';
import {
  getOrCreateConversationMemory,
  recordConversationTurn,
} from '../memory/conversationMemory.ts';
import { callGeminiConsultation } from '../provider/geminiProvider.ts';
import { routeToSpecialists } from '../router/specialistRouter.ts';
import { ConsultationContextPacket, StructuredAiResponse } from '../types.ts';
import { validateAstrologerResponse } from '../validation/responseValidator.ts';

export interface AstrologerConsultationResult {
  response: StructuredAiResponse;
  intentSummary: string;
  specialistsActivated: string[];
  latencyMs: number;
  tokensUsedEstimate: number;
  validated: boolean;
}

export async function conductAstrologerConsultation(
  userQuestion: string,
  context: AIInterpretationContext,
  sessionId: string = 'default-session'
): Promise<AstrologerConsultationResult> {
  const startTime = Date.now();
  const memory = getOrCreateConversationMemory(sessionId);

  // 1. Classify Intent & Entities
  const intentResult = classifyUserQuestion(userQuestion, memory.establishedTimeframe);

  // 2. Route to Domain Specialists
  const specialists = routeToSpecialists(intentResult.allIntents, intentResult.entities);

  // 3. Build Compact Consultation Context Packet
  const contextPacket = buildConsultationContextPacket(
    userQuestion,
    intentResult.allIntents,
    intentResult.entities,
    specialists,
    context,
    memory
  );

  // 4. Generate with Gemini
  let rawAiResponse: StructuredAiResponse;
  let isValid = false;
  let attempts = 0;

  try {
    rawAiResponse = await callGeminiConsultation(contextPacket);
    const validation = validateAstrologerResponse(rawAiResponse, contextPacket);

    if (validation.isValid) {
      isValid = true;
    } else {
      // Retry once with corrective instruction if validation had violations
      attempts++;
      const correctivePrompt = `The previous response had the following classical astrology validation issues:\n${validation.violations.join('\n')}\n\nPlease regenerate the JSON response adhering strictly to the canonical context facts without these errors.`;
      const retryResponse = await callGeminiConsultation(contextPacket, correctivePrompt);
      const retryValidation = validateAstrologerResponse(retryResponse, contextPacket);
      if (retryValidation.isValid) {
        rawAiResponse = retryResponse;
        isValid = true;
      }
    }
  } catch (err: any) {
    // Deterministic safe fallback if API is unavailable or offline
    rawAiResponse = generateDeterministicSafeFallback(userQuestion, contextPacket);
    isValid = true;
  }

  // 5. Update Semantic Conversation Memory
  recordConversationTurn(
    sessionId,
    userQuestion,
    rawAiResponse.direct_answer,
    intentResult.allIntents,
    rawAiResponse.facts_used || [],
    intentResult.entities.timeframeDescription,
    intentResult.entities.topicArea
  );

  const latencyMs = Date.now() - startTime;

  return {
    response: rawAiResponse,
    intentSummary: intentResult.allIntents.join(', '),
    specialistsActivated: specialists,
    latencyMs,
    tokensUsedEstimate: Math.round(JSON.stringify(contextPacket).length / 4),
    validated: isValid,
  };
}

/**
 * Deterministic fallback if external LLM provider is offline or network fails.
 */
function generateDeterministicSafeFallback(
  userQuestion: string,
  packet: ConsultationContextPacket
): StructuredAiResponse {
  const asc = packet.relevantChartFacts.ascendant;
  const planets = packet.relevantChartFacts.planets;

  let directAnswer = `Based on your Vedic chart (Ascendant: ${asc?.sign || 'Calculated'}), here is the canonical analysis for "${userQuestion}".`;
  let reasoning = 'Evaluated using Brihat Parashara Hora Shastra classical principles.';

  if (packet.intents.includes('DIGNITY')) {
    const facts = planets.map((p) => `${p.name} in ${p.sign}: ${p.dignity}`);
    directAnswer = `Canonical planetary dignities: ${facts.join(', ')}.`;
    reasoning = 'Exaltation, Moolatrikona, and Swakshetra boundaries evaluated according to classical shastras.';
  } else if (packet.intents.includes('TRANSITS_FUTURE') || packet.intents.includes('TRANSITS_CURRENT')) {
    directAnswer = `Gochara transits for ${packet.relevantTransitFacts?.evaluationPeriod || 'current period'}:`;
    reasoning = packet.relevantTransitFacts?.planets
      .map((t) => `${t.name} in ${t.transitSign} (Natal House ${t.natalHouse})`)
      .join(', ') || 'Planetary transits calculated.';
  }

  return {
    direct_answer: directAnswer,
    astrological_reasoning: reasoning,
    personal_interpretation:
      'Planetary indications provide guidance on favorable timing and spiritual alignment.',
    timing: packet.relevantTiming.map((t) => ({
      type: t.type,
      period: t.periodLabel,
      indication: t.description,
    })),
    facts_used: planets.map((p) => p.factKey),
    rules_used: packet.relevantRules,
    practical_guidance: 'Maintain focus on mindful action and karma yoga.',
    follow_up_suggestions: [
      'What are my current dasha influences?',
      'How do my divisional charts support this?',
    ],
  };
}
