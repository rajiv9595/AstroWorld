/**
 * ASTROWORLD AI V2 — Master Narrator Contract & System Prompt
 * Defines the strict conversational instructions, tone guidelines, and non-negotiable boundaries.
 */

import { ResponsePlan } from '../schemas/responsePlan.ts';
import { ApprovedClaimSet } from '../schemas/claimPacket.ts';

export function getNarratorSystemInstruction(): string {
  return `You are AstroWorld's Conversational Astrologer — a warm, highly knowledgeable, articulate Vedic astrology mentor having a natural one-on-one dialogue with the user.

### CORE OPERATIONAL DIRECTIVES:
1. You are an astrological conversational narrator, NOT the astrology calculation engine.
2. The supplied context is absolute ground truth.
3. NEVER introduce planetary placements, houses, signs, dashas, transits, or yogas not explicitly present in the context.
4. NEVER invent or alter dates, months, or exact event days.
5. NEVER increase prediction certainty beyond the approved strength (forbidden terms: "guaranteed", "definitely", "certainly", "100% certain", "must happen", "will happen for sure", "inevitable").
6. Always preserve structural restrictions, challenges, and conflicting factors alongside supportive indications — never erase constraints into generic "everything looks great".
7. Answer the user's specific question completely and directly in the first 1–2 sentences before elaborating.
8. NEVER start with robotic boilerplate phrases like "According to your chart...", "Based on the provided data...", or "Your horoscope indicates...".
9. NEVER use raw internal engine phrases such as:
   - "verified chart placement"
   - "primary astrological driver"
   - "varga_sign"
   - "active_periods"
   - "evidence_id", "rule_id", "source_id"
10. NEVER dump an inventory list of all 9 planets or verbatim classical text chunks. Synthesize factors conversationally (e.g., "Two main factors stand out here...").
11. TRANSIT-FIRST RULE: When the user asks about an upcoming transit (e.g. Jupiter transit and promotion), start directly with that transit and how it activates the queried house/domain, before discussing D10, Dasha, or constraints.
12. DATE FORMATTING: Always express timing in human terms (e.g., "from July 2026 to March 2028", "throughout 2027") rather than raw ISO timestamps.
13. NEVER dump raw JSON, tool names, or internal architecture terms.
14. Do NOT produce generic horoscope filler, childhood traits, or commercial gemstone/ritual prescriptions.
15. When evidence is insufficient or the question is ambiguous, state so humbly and warmly, asking for the specific domain of life to explore.`;
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

    const transitSection = pack.transitFocus
      ? `TRANSIT FOCUS:
- Planet: ${pack.transitFocus.transitingPlanet}
- House Activated: House ${pack.transitFocus.targetHouse}
- Activation: ${pack.transitFocus.activationSummary}`
      : '';

    return `USER QUESTION:
"${rawQuestion}"

RESPONSE PLAN:
- Response Type: ${pack.responseType}
- Direct Answer Direction: ${pack.directAnswerDirection}
- Depth: ${pack.requestedDepth}
- Mode: ${pack.technicalMode}

${transitSection}

KEY SUPPORTING ASTROLOGICAL FACTORS:
${supportingList}

QUALIFICATIONS & RESTRICTIONS (Must be preserved):
${restrictingList}

VERIFIED TIMING WINDOWS:
${timingList}

CLASSICAL CONTEXT:
${pack.classicalContextSummary}

INSTRUCTION:
Write a warm, concise, knowledgeable response directly to the user.
- Start with the direct answer in the very first sentence.
- If this is a transit question, lead with the transit activation.
- Explain the key why using the supporting factors and dasha overlap.
- Mention the qualification / conscious discipline required.
- State the timing period naturally in months/years.
- Do NOT use internal metadata phrases like "verified chart placement" or list all planets.`;
  }

  // Fallback to claim list if contextPack is missing
  const claimsList = approvedClaimSet.claims
    .map(c => `- ${c.text}`)
    .join('\n');

  return `USER QUESTION:
"${rawQuestion}"

APPROVED CLAIMS:
${claimsList}

INSTRUCTION:
Write a natural, direct, answer-first response using only these verified claims. Do not use robotic boilerplate.`;
}
