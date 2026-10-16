/**
 * ASTROWORLD AI V2 — Master Narrator Contract & System Prompt
 * Defines the strict conversational instructions, tone guidelines, and non-negotiable boundaries.
 */

import { ResponsePlan } from '../schemas/responsePlan.ts';
import { ApprovedClaimSet } from '../schemas/claimPacket.ts';

/**
 * Convert firewall coverage gaps into concise user-safe disclosures. Internal
 * validator wording is never copied verbatim into a final answer.
 */
export function getQuestionCoverageLimitations(approvedClaimSet: ApprovedClaimSet): string[] {
  const missing: string[] = Array.isArray(approvedClaimSet.questionCoverage?.missing)
    ? approvedClaimSet.questionCoverage.missing
    : [];
  const labels: Record<string, string> = {
    career: 'the career portion of your question',
    finance: 'the income and savings portion of your question',
    wealth: 'the income and savings portion of your question',
    relationship: 'the relationship portion of your question',
    travel: 'the travel or relocation portion of your question',
    education: 'the education portion of your question',
    health: 'health-related themes in your question',
    spirituality: 'the spirituality portion of your question',
  };
  const disclosures: string[] = [];

  for (const item of missing) {
    const secondary = item.match(/Secondary domain\s+"([^"]+)"/i);
    const primary = item.match(/\bDomain\s+"([^"]+)"/i);
    const planet = item.match(/Planet focus\s+"([^"]+)"/i);
    const domain = (secondary?.[1] || primary?.[1] || '').trim().toLowerCase();

    if (domain) {
      const topic = labels[domain] || `the ${domain} portion of your question`;
      disclosures.push(`I don't have enough verified chart evidence to assess ${topic} reliably, so I won't guess about it.`);
    } else if (planet?.[1]) {
      disclosures.push(`I don't have enough verified evidence to assess the requested ${planet[1]} factor reliably, so I won't guess about it.`);
    }
  }

  return Array.from(new Set(disclosures)).slice(0, 3);
}

export function getNarratorSystemInstruction(): string {
  return `You are AstroWorld's Master Astrologer and Jyotish Mentor — an elite Vedic scholar, research-grade astrologer, and empathetic life strategist having a natural one-on-one consultation with the seeker.

### YOUR EXPERT PERSONA:
- You combine classical Parashari, Jaimini, and Tajik shastric precision with modern psychological realism and practical life advice.
- You speak with the authority and depth of a world-class mentor. You never recite generic astrological cookbook blurbs or mystical platitudes.
- Address the user directly as a trusted mentor ("you", "your journey").
- Tone: Direct, articulate, dignified, analytical, and deeply empowering.

### ADAPTIVE NARRATION ARCHITECTURE:
You adapt your response structure to the specific inquiry type and conversational context:
1. **Quick Factual Answer:** Questions about a single chart fact (Moon sign, Ascendant, Nakshatra, single planet/house placement) receive a concise, direct 1–3 sentence answer. Never force multiple sections, tables, or boilerplate on a simple factual query.
2. **Natural Follow-Up:** Questions such as "Why?", "How did you conclude that?", "What about the opposite?", or "Explain it simply" must continue the existing conversation directly, addressing the specific follow-up without re-reciting the entire chart or dumping unnecessary tables.
3. **Comparison:** Inquiries comparing two periods, factors, or alternatives should contrast them side-by-side rather than forcing the standard consultation layout.
4. **Exploratory Conversation:** Open-ended personal questions receive a natural conversational response with grounded Jyotish perspective, not an automatic long astrological report.
5. **Detailed Consultation:** Questions requesting comprehensive analysis receive a structured, sufficiently detailed answer covering direct verdict, relevant placements and dignities, timeline analysis, supportive strengths vs. structural friction, and practical Purushartha guidance.
6. **Clarification:** When essential context is missing or ambiguous, ask a concise, friendly clarifying question.

### STRICT NEGATIVE CONSTRAINTS (ZERO TOLERANCE):
1. FORBIDDEN CLICHÉS: Never use phrases like:
   - "cosmic currents", "tapestry of life", "celestial tapestry", "dance of the planets", "symphony of stars"
   - "peer into the inner soul", "the architecture of your relationships", "journey of discovery"
   - "According to your chart...", "Based on the provided data...", "Your horoscope reveals...", "As an AI..."
2. NO HALLUCINATIONS: NEVER introduce planets, houses, signs, dashas, or yogas that are not explicitly in the verified context.
3. NO FABRICATED CALENDAR DATES: Use the time windows provided in context; never invent specific days (e.g. do not say "on October 14th").
4. TRANSIT-FIRST RULE: When the question asks about an upcoming transit (e.g., Jupiter transit), lead the response with how that transit activates the specific house.
5. NO COMMERCIAL REMEDIES: Do not prescribe gemstones, commercial rituals, or commercial pujas. Focus on conscious right action, mental clarity, and discipline.
6. HONEST LIMITATIONS: If evidence for a secondary domain or factor is insufficient, disclose it with calm clarity.`;
}

export function buildNarratorUserPrompt(
  rawQuestion: string,
  responsePlan: ResponsePlan,
  approvedClaimSet: ApprovedClaimSet
): string {
  const pack = responsePlan.contextPack;

  if (pack) {
    const supportingList = pack.supportingFactors.map(f => `- ${f}`).join('\n');
    const restrictingList = pack.restrictingFactors.length > 0
      ? pack.restrictingFactors.map(f => `- ${f}`).join('\n')
      : '- None (general supportive alignment)';

    const timingList = pack.timingWindows.length > 0
      ? pack.timingWindows.map(w => `- ${w.label}: ${w.periodText} (${w.type.replace(/_/g, ' ')})`).join('\n')
      : '- Active current period';
    const secondaryDomains = pack.secondaryDomains || [];
    const secondaryDomainSection = secondaryDomains.length > 0
      ? `SECONDARY DOMAINS TO COVER (required where approved evidence exists): ${secondaryDomains.join(', ')}`
      : '';
    const coverageLimitations = getQuestionCoverageLimitations(approvedClaimSet);
    const coverageLimitationsSection = coverageLimitations.length > 0
      ? `COVERAGE LIMITATIONS (required to disclose plainly):\n${coverageLimitations.map(item => `- ${item}`).join('\n')}`
      : '';

    const transitSection = pack.transitFocus
      ? `TRANSIT FOCUS:
- Planet: ${pack.transitFocus.transitingPlanet}
- House Activated: House ${pack.transitFocus.targetHouse}
- Activation: ${pack.transitFocus.activationSummary}`
      : '';

    const rawLower = rawQuestion.toLowerCase();
    const asksEvidenceVsInterpretation =
      rawLower.includes('calculated') && (rawLower.includes('interpretation') || rawLower.includes('interpretations'));
    const asksStrengthsAndLimits =
      rawLower.includes('strength') && (rawLower.includes('limit') || rawLower.includes('challeng') || rawLower.includes('weakness'));
    const asksMissingEvidence =
      rawLower.includes('missing') || rawLower.includes('missing evidence') || rawLower.includes('unavailable');

    const compoundInstructions = (asksEvidenceVsInterpretation || asksStrengthsAndLimits || asksMissingEvidence)
      ? `\nCOMPOUND CONSULTATION REQUIREMENTS:
- Clearly separate directly calculated chart facts from astrological interpretations.
- Include both supportive strengths and structural limiting factors/challenges.
- Plainly disclose missing evidence (e.g. exact birth time sensitivity for varga charts, uncalculated real-time transits, non-astrological career context).
- Avoid guaranteed predictions or unsupported certainty.
- Do not repeat generic textbook definitions of D10.`
      : '';

    let strategyInstructions = '';
    if (pack.responseType === 'simple_fact') {
      strategyInstructions = `1. QUICK FACTUAL ANSWER: Provide a direct, concise 1–3 sentence answer stating the exact verified placement, sign, house, or dignity. DO NOT generate multiple sections, markdown headings, or timeline tables.
2. DIRECT CLARITY: Answer immediately without throat-clearing, greetings, or meta-commentary.`;
    } else if (pack.responseType === 'follow_up') {
      strategyInstructions = `1. NATURAL FOLLOW-UP: Continue the existing dialogue directly. Address the seeker's specific follow-up (e.g. explaining the reasoning, mechanics, or qualification) conversationally without repeating standard chart background or forcing unnecessary tables.
2. CONTEXT AWARENESS: Build directly on the preceding turn's established context.`;
    } else if (pack.responseType === 'comparison') {
      strategyInstructions = `1. COMPARATIVE ANALYSIS: Present a clear side-by-side comparison between the queried factors or timeframes, highlighting relative strengths, friction points, and timing.
2. CONTRASTING FORMAT: Use a structure that directly contrasts option A versus option B.`;
    } else if (pack.responseType === 'exploratory') {
      strategyInstructions = `1. CONVERSATIONAL EXPLORATION: Provide an empathetic, grounded overview of the queried life theme with practical Vedic orientation.
2. REFLECTIVE GUIDANCE: Focus on conscious choices and core planetary themes rather than exhaustive technical tables.`;
    } else if (pack.responseType === 'clarification' || pack.responseType === 'insufficient_evidence') {
      strategyInstructions = `1. CONCISE CLARIFICATION: Warmly ask a concise clarifying question explaining what essential detail is needed.`;
    } else {
      strategyInstructions = `1. STRUCTURED CONSULTATION: Format using clear Markdown sections:
   - "### 🎯 Direct Verdict & Summary" (Direct answer in first 1–2 sentences)
   - "### 🔍 Core Astrological Placements & Dignities" (Governing planets, houses, and vargas)
   ${pack.timingWindows.length > 0 ? '- "### ⏳ Timeline & Milestone Analysis" (Include a markdown table mapping timing windows to triggers and practical impacts)' : ''}
   - "### ⚖️ Strengths vs. Friction Points" (Supportive factors vs structural karmic discipline)
   - "### 🔮 Practical Guidance & Suggested Follow-Ups" (1–2 practical Purushartha actions and 2–3 suggested follow-up questions)
2. DIRECT ANSWER: Open directly with your verdict in the first 1–2 sentences without preamble.
3. TRANSIT ACTIVATION: If this involves a transit, lead with how the transiting planet activates the queried house.`;
    }

    return `USER QUESTION:
"${rawQuestion}"

RESPONSE PLAN:
- Response Type: ${pack.responseType}
- Direct Answer Direction: ${pack.directAnswerDirection}
- Depth: ${pack.requestedDepth}
- Mode: ${pack.technicalMode}

${secondaryDomainSection}

${coverageLimitationsSection}

${transitSection}

KEY SUPPORTING ASTROLOGICAL FACTORS:
${supportingList}

QUALIFICATIONS & RESTRICTIONS (Must be preserved):
${restrictingList}

VERIFIED TIMING WINDOWS:
${timingList}

CLASSICAL CONTEXT:
${pack.classicalContextSummary}

MASTER NARRATION INSTRUCTIONS:
Deliver a master-level, deeply insightful, articulate astrological consultation directly to the seeker:
${strategyInstructions}
4. NO FLUFF: Adhere strictly to the negative constraints; never use clichés like "cosmic tapestry" or "inner soul".${compoundInstructions}`;
  }

  // Fallback to claim list if contextPack is missing
  const claimsList = approvedClaimSet.claims
    .map(c => `- ${c.text}`)
    .join('\n');

  const coverageLimitations = getQuestionCoverageLimitations(approvedClaimSet);
  const coverageLimitationsSection = coverageLimitations.length > 0
    ? `COVERAGE LIMITATIONS (required to disclose plainly):\n${coverageLimitations.map(item => `- ${item}`).join('\n')}`
    : '';

  return `USER QUESTION:
"${rawQuestion}"

APPROVED CLAIMS:
${claimsList}

${coverageLimitationsSection}

MASTER NARRATION INSTRUCTIONS:
Deliver an authentic, grounded astrological consultation directly to the seeker, adapting your depth and structure to the specific inquiry. Avoid robotic clichés.`;
}
