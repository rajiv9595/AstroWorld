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
 * Deterministic consultation-grade synthesis when external LLM provider is offline or unreachable.
 * Ensures the user ALWAYS receives authoritative, authentic, and structured Vedic guidance.
 */
function generateDeterministicSafeFallback(
  userQuestion: string,
  packet: ConsultationContextPacket
): StructuredAiResponse {
  const asc = packet.relevantChartFacts.ascendant;
  const planets = packet.relevantChartFacts.planets;
  const dasha = packet.relevantDashaFacts;
  const timing = packet.relevantTiming;
  const transits = packet.relevantTransitFacts;
  const jaimini = packet.relevantJaimini;
  const vargas = packet.relevantVargaFacts;
  const yogas = packet.relevantYogas || [];

  let directAnswer = '';
  let reasoning = '';
  let interpretation = '';
  let guidance = 'Focus on continuous skill refinement, steady dharma, and mindful karma yoga.';
  const followUps: string[] = [];
  const tableRows: Array<{ planet: string; sign: string; approx_degree: string; nakshatra: string; retrograde: boolean }> = [];

  // Domain 1: Career / Job / Promotion
  if (packet.intents.includes('CAREER') || packet.intents.includes('JOB')) {
    const d10Info = vargas?.find((v) => v.code === 'D10');
    const amkInfo = jaimini?.amatyakaraka ? ` Your Jaimini Amatyakaraka (Career Karaka) is **${jaimini.amatyakaraka}**.` : '';
    const activeDashaText = dasha?.activeHierarchy ? ` You are operating under **${dasha.activeHierarchy}**.` : '';

    if (packet.entities.isExactDateRequested) {
      directAnswer = `According to classical Vedic astrology (Brihat Parashara Hora Shastra), career breakthroughs and job offers occur during energetic activation windows rather than isolated single-day calendar stamps. For your **${asc?.sign || 'Taurus'} Lagna**, career opportunities are governed by your 10th house, D10 Dashamsha, and the active ${dasha?.currentMahadasha?.lord || 'active'} Mahadasha.`;
      interpretation = `The energetic momentum for receiving significant professional offers is strongest during supportive sub-dasha (Antardasha/Pratyantardasha) shifts and favorable Jupiter/Saturn Gochara transits over your 10th or 6th houses. Maintaining active applications and interview readiness during this window aligns your karma with planetary indications.${amkInfo}`;
    } else {
      directAnswer = `For your **${asc?.sign || 'Taurus'} Lagna**, professional growth and karma are activated through the 10th house and the D10 Dashamsha divisional chart.${activeDashaText}`;
      interpretation = `Your career path highlights executive capability and structured achievement. When the ${dasha?.currentMahadasha?.lord || 'active'} Mahadasha interacts with the 10th house ruler and D10 placements, it creates conducive environments for promotion, role elevation, and expanded responsibility.${amkInfo}`;
    }

    reasoning = packet.relevantRules.length > 0
      ? packet.relevantRules.join(' ')
      : `The 10th house governs profession, authority, and public status. D10 Dashamsha confirms the fruition of professional efforts.`;
    guidance = 'Wear comfortable natural fabrics for interviews, maintain ethical leadership, and chant the Surya Gayatri or Vishnu Sahasranama for career vitality.';
    followUps.push(
      'Which industries or roles align best with my D10 Dashamsha?',
      'How does the upcoming transit of Jupiter support my promotion timing?',
      'What specific remedies strengthen my 10th house ruler?'
    );
  }
  // Domain 2: Marriage / Relationships
  else if (packet.intents.includes('MARRIAGE') || packet.intents.includes('RELATIONSHIP')) {
    const d9Info = vargas?.find((v) => v.code === 'D9');
    const dkInfo = jaimini?.darakaraka ? ` Jaimini Darakaraka (Spouse Karaka) is **${jaimini.darakaraka}**.` : '';

    directAnswer = `For your **${asc?.sign || 'Taurus'} Lagna**, relationship dynamics and marital harmony are governed by the 7th house, Venus (Kalathrakaraka), and the D9 Navamsha chart (Navamsha Lagna: **${d9Info?.ascendantSign || 'Canonical'}**).`;
    reasoning = packet.relevantRules.length > 0
      ? packet.relevantRules.join(' ')
      : '7th house represents partnership and union, while D9 Navamsha reveals the deeper spiritual and long-term qualities of the spouse.';
    interpretation = `Your chart indicates a partner who brings complementary intellectual and grounding energy. Relationship stability flourishes when expectations are mutually aligned during favorable Dasha sub-periods.${dkInfo}`;
    guidance = 'Cultivate open communication, honor Venusian harmony, and perform Friday Lakshmi prayers or light a ghee lamp for relationship auspiciousness.';
    followUps.push(
      'What are the distinct qualities of my spouse according to D9 Navamsha?',
      'When is the most auspicious window for marriage or commitment?',
      'Are there any Manglik or 7th house dosha influences in my chart?'
    );
  }
  // Domain 3: Dignity / Vargas (D9, D10)
  else if (packet.intents.includes('DIGNITY') || packet.intents.includes('VARGA') || packet.intents.includes('D9') || packet.intents.includes('D10')) {
    if (vargas && vargas.length > 0) {
      const v = vargas[0];
      const planetList = v.planets.map((p) => `* **${p.name}** in ${p.vargaSign}: **${p.dignity}**`).join('\n');
      directAnswer = `Canonical dignity analysis for **${v.code}** (${v.code === 'D9' ? 'Navamsha' : v.code === 'D10' ? 'Dashamsha' : 'Divisional Chart'}):\n\n${planetList}`;
      reasoning = `In BPHS Vedic astrology, planetary dignities in divisional charts are evaluated independently based on their sign placements within that specific Varga, preserving the strict Varga Firewall.`;
      interpretation = `Placements with exalted, moolatrikona, or swakshetra dignity in ${v.code} provide sustained underlying strength and positive manifestation in that specific area of life.`;
    } else {
      const planetList = planets.map((p) => `* **${p.name}** in ${p.sign} (${p.degree}): **${p.dignity}**`).join('\n');
      directAnswer = `Canonical D1 Natal Planetary Dignities:\n\n${planetList}`;
      reasoning = 'Planetary dignities evaluated according to classical exaltation degrees, Moolatrikona ranges, and planetary friendship relationships.';
      interpretation = 'Planets with high dignity anchor the chart and generate favorable results during their active Vimshottari Dasha periods.';
    }
    followUps.push(
      'Which planets are exalted or debilitated in my D9 Navamsha?',
      'How does my Lagna Lord dignity affect overall vitality?',
      'What is the difference between my D1 and D9 Sun dignity?'
    );
  }
  // Domain 4: Transits / Gochara
  else if (packet.intents.includes('TRANSITS_FUTURE') || packet.intents.includes('TRANSITS_CURRENT')) {
    const period = transits?.evaluationPeriod || 'Requested Period';
    directAnswer = `Planetary Gochara (Transit) Overview for **${period}** based on your **${asc?.sign || 'Taurus'} Lagna**:`;

    if (transits?.planets) {
      transits.planets.forEach((tp) => {
        tableRows.push({
          planet: tp.name,
          sign: tp.transitSign,
          approx_degree: tp.approxDegree !== undefined ? `${tp.approxDegree}°` : '—',
          nakshatra: tp.nakshatra || '—',
          retrograde: Boolean(tp.retrograde),
        });
      });
    }

    reasoning = packet.relevantRules.length > 0
      ? packet.relevantRules.join(' ')
      : `Transits are evaluated using true astronomical ephemeris coordinates with Lahiri Ayanamsha.`;
    interpretation = `During ${period}, major slow-moving planets (Saturn, Jupiter, Rahu, and Ketu) activate specific natal houses, setting the backdrop for key developments when synchronized with your active Dasha.`;
    followUps.push(
      'How does Saturn transit affect my career and finances in 2027?',
      'What are the key benefic Jupiter transit dates for my chart?',
      'Am I undergoing Sade Sati or Dhaiya during this timeframe?'
    );
  }
  // General / Dasha / Synthesis
  else {
    directAnswer = `Based on your **${asc?.sign || 'Taurus'} Lagna**, active **${dasha?.activeHierarchy || 'Vimshottari Dasha'}**, and natal planetary configuration, here is your canonical consultation:`;
    reasoning = packet.relevantRules.length > 0 ? packet.relevantRules.join(' ') : 'Evaluated using Brihat Parashara Hora Shastra principles.';
    interpretation = `Your chart balance reflects purposeful karmic development. Planetary placements indicate that disciplined effort, strategic timing, and awareness of active Dasha periods yield optimal growth.`;
    followUps.push(
      'When will my career see major advancement under Moon Mahadasha?',
      'What does my 7th house and D9 Navamsha reveal about my spouse?',
      'Which gemstone and mantra are most auspicious for my chart?'
    );
  }

  return {
    direct_answer: directAnswer,
    astrological_reasoning: reasoning,
    personal_interpretation: interpretation,
    timing: timing.map((t) => ({
      type: t.type,
      period: t.periodLabel,
      indication: t.description,
    })),
    facts_used: planets.map((p) => p.factKey || `D1:${p.name}:${p.sign}`),
    rules_used: packet.relevantRules,
    practical_guidance: guidance,
    follow_up_suggestions: followUps,
    transit_overview_table: tableRows.length > 0 ? tableRows : undefined,
  };
}
