/**
 * ASTROWORLD AI V2/V3 — Conversational Signal Detector
 * Deterministically analyzes the user's message, conversation history, and preferences
 * to detect:
 * 1. Intended outcome (simple fact, technical audit, emotional reassurance, decision, comparison, correction, comprehensive)
 * 2. Emotional tone (calm, anxious/concerned, curious, frustrated, urgent)
 * 3. Desired depth (concise, standard, deep)
 * 4. Explicitly requested formats (bullet points, table, short prose, step-by-step)
 * 5. Correction / challenge detection to inspect earlier claims
 * 
 * Runs deterministically in < 1ms with ZERO added LLM calls or latency.
 */

export interface ConversationalSignals {
  actualTask: string;
  intendedOutcome:
    | 'simple_fact'
    | 'technical_audit'
    | 'emotional_reassurance'
    | 'decision_support'
    | 'comparison'
    | 'correction_challenge'
    | 'exploratory'
    | 'comprehensive_consultation'
    | 'standard_consultation';
  emotionalTone: 'calm_neutral' | 'concerned_anxious' | 'curious' | 'frustrated_skeptical' | 'urgent';
  desiredDepth: 'concise' | 'standard' | 'deep';
  requestedFormat?: 'bullet_points' | 'table' | 'concise_prose' | 'step_by_step' | 'structured' | 'natural';
  seekerPersona?: 'village_layman' | 'student_scholar' | 'balanced_seeker';
  coreHumanIntent?: 'career_crossroads' | 'relationship_timing' | 'financial_stress' | 'vitality_health' | 'general_guidance';
  communicationModality: 'auditory_digital' | 'visual' | 'auditory_tonal' | 'kinesthetic' | 'balanced';
  thinkingStyle: 'local_execution' | 'global_strategic' | 'balanced';
  conversationalRegister: 'casual_direct' | 'scholarly_technical' | 'reassuring_empathic' | 'balanced_mentor';
  isFollowUp: boolean;
  timingDirectQuery: boolean;
  dynamicNarrationDirective: string;
  isCorrectionOrChallenge: boolean;
  disputedFact?: string;
  userPreferences: {
    responseStyle: 'adaptive' | 'plain_village_clear' | string;
    answerDepth: 'contextual' | string;
    evidenceDetail: 'balanced' | string;
  };
}

export class ConversationalSignalDetector {
  public static detect(
    rawQuestion: string,
    conversationTurns?: Array<{ role?: string; userMessage?: string; text?: string }>,
    userPreferences?: {
      responseStyle?: string;
      answerDepth?: string;
      evidenceDetail?: string;
    }
  ): ConversationalSignals {
    const raw = (rawQuestion || '').trim();
    const lower = raw.toLowerCase();

    // 1. Detect Correction or Disagreement Challenge
    const isCorrectionOrChallenge =
      /\b(you (said|stated|claimed|told me)|earlier you said|previously you said|wait,? isn'?t|that contradicts|is that an error|that's wrong|are you sure|correction|you made a mistake|which is it|you mentioned)\b/i.test(
        lower
      ) ||
      ((lower.startsWith('why') || lower.startsWith('how so')) &&
        (lower.includes('earlier') || lower.includes('before') || lower.includes('previous')));

    let disputedFact: string | undefined = undefined;
    if (isCorrectionOrChallenge) {
      const match = raw.match(
        /\b(?:about|regarding|said|that|is)\s+([A-Za-z0-9°\s]+?)(?:\s+(?:is|was|in|or|\?|$))/i
      );
      if (match && match[1]) {
        disputedFact = match[1].trim();
      }
    }

    // 2. Detect Emotional Tone (carefully, without diagnosing)
    let emotionalTone: ConversationalSignals['emotionalTone'] = 'calm_neutral';
    if (
      /\b(terrified|scared|worried|anxious|afraid|panic|ruined|destroy|curse|fear|stress|hopeless|desperate|depressed|ruin my life|danger)\b/i.test(
        lower
      )
    ) {
      emotionalTone = 'concerned_anxious';
    } else if (
      /\b(frustrated|annoying|makes no sense|confused|ridiculous|contradictory|why did you say)\b/i.test(
        lower
      )
    ) {
      emotionalTone = 'frustrated_skeptical';
    } else if (/\b(urgent|urgently|immediately|right now|asap|emergency)\b/i.test(lower)) {
      emotionalTone = 'urgent';
    } else if (
      /\b(curious|wondering|interested to know|fascinating|tell me more|what if)\b/i.test(lower)
    ) {
      emotionalTone = 'curious';
    }

    // 3. Detect Explicit Format Request
    let requestedFormat: ConversationalSignals['requestedFormat'] = undefined;
    if (/\b(bullets?|bullet\s*points?|in\s*a\s*list|bulleted|list\s+format)\b/i.test(lower)) {
      requestedFormat = 'bullet_points';
    } else if (/\b(table|tabular|side-by-side\s*table|matrix|in\s*a\s*table)\b/i.test(lower)) {
      requestedFormat = 'table';
    } else if (
      /\b(in\s*one\s*sentence|in\s*two\s*sentences|short\s*answer|in\s*a\s*few\s*words|briefly|quick\s*answer|in\s*a\s*nutshell)\b/i.test(
        lower
      )
    ) {
      requestedFormat = 'concise_prose';
    } else if (/\b(step\s*by\s*step|action\s*plan|steps\s*to\s*take|step-by-step)\b/i.test(lower)) {
      requestedFormat = 'step_by_step';
    }

    // 4. Detect Desired Depth
    let desiredDepth: ConversationalSignals['desiredDepth'] = 'standard';
    const isExplicitDeep =
      /\b(comprehensive|detailed|in-depth|exhaustive|full\s*breakdown|thorough|detailed\s*investigation|deep\s*dive|complete\s*analysis)\b/i.test(
        lower
      ) || userPreferences?.answerDepth === 'detailed';

    const isExplicitBrief =
      /\b(brief|concise|quick|short|nutshell|summary\s*only|one\s*line|just\s*tell\s*me|simple\s*answer)\b/i.test(
        lower
      ) ||
      requestedFormat === 'concise_prose' ||
      userPreferences?.answerDepth === 'brief';

    // Check simple fact query
    const isSimpleFactQuery =
      (lower.startsWith('what is my') ||
        lower.startsWith("what's my") ||
        lower.startsWith('which sign is') ||
        lower.startsWith('which house') ||
        lower.startsWith('where is') ||
        lower.startsWith('is jupiter') ||
        lower.startsWith('which planet is') ||
        lower.startsWith('what is the value of')) &&
      !lower.includes('timing') &&
      !lower.includes('synthesize') &&
      !lower.includes('analyze') &&
      !lower.includes('transit') &&
      !lower.includes('dasha') &&
      !lower.includes('comprehensive');

    if (isExplicitDeep) {
      desiredDepth = 'deep';
    } else if (isExplicitBrief || isSimpleFactQuery) {
      desiredDepth = 'concise';
    }

    // 5. Determine Intended Outcome
    let intendedOutcome: ConversationalSignals['intendedOutcome'] = 'standard_consultation';

    if (isCorrectionOrChallenge) {
      intendedOutcome = 'correction_challenge';
    } else if (isSimpleFactQuery && !isExplicitDeep) {
      intendedOutcome = 'simple_fact';
    } else if (
      /\b(technical\s*audit|evidence\s*breakdown|audit\s*report|audit\s*the\s*calculation|shadbala\s*breakdown|ashtakavarga\s*breakdown|rule\s*verification|audit)\b/i.test(
        lower
      )
    ) {
      intendedOutcome = 'technical_audit';
    } else if (emotionalTone === 'concerned_anxious') {
      intendedOutcome = 'emotional_reassurance';
    } else if (
      lower.includes('compare') ||
      lower.includes('versus') ||
      lower.includes(' vs ') ||
      lower.includes('difference between') ||
      lower.includes('which period is better') ||
      lower.includes('better option')
    ) {
      intendedOutcome = 'comparison';
    } else if (
      /\b(should i|switch\s*jobs|relocate\s*or\s*stay|decide\s*between|make\s*a\s*choice|best\s*decision|career\s*move)\b/i.test(
        lower
      )
    ) {
      intendedOutcome = 'decision_support';
    } else if (desiredDepth === 'deep' || isExplicitDeep) {
      intendedOutcome = 'comprehensive_consultation';
    } else if (
      lower.includes('tell me about') ||
      lower.includes('what do you see') ||
      lower.includes('overall') ||
      lower.includes('guide me') ||
      lower.includes('general overview')
    ) {
      intendedOutcome = 'exploratory';
    }

    // 6. Detect Seeker Persona & Background (Village/Layman vs Scholar)
    let seekerPersona: ConversationalSignals['seekerPersona'] = 'balanced_seeker';
    const isLaymanVillage = /\b(explain\s*simply|simple\s*terms|village|don'?t\s*know\s*astrology|layman|plain\s*english|no\s*jargon|easy\s*to\s*understand|simple\s*words|like\s*i'?m\s*5|non[- ]astrology|satisfy\s*me)\b/i.test(lower);
    const isScholar = /\b(virupas?|kakshya|shadbala|varga|bphs|saravali|jaimini|chara\s*karaka|degrees?|shashtiamsa|d60|bindus?|sav)\b/i.test(lower);

    if (isLaymanVillage) {
      seekerPersona = 'village_layman';
    } else if (isScholar) {
      seekerPersona = 'student_scholar';
    }

    // 7. Detect Core Human Intent & Underlying Anxiety
    let coreHumanIntent: ConversationalSignals['coreHumanIntent'] = 'general_guidance';
    if (/\b(career|job|layoff|fired|promotion|salary|boss|work|interview|offer|unemployed|profession)\b/i.test(lower)) {
      coreHumanIntent = 'career_crossroads';
    } else if (/\b(marriage|wedding|spouse|partner|relationship|divorce|love|marry|dating)\b/i.test(lower)) {
      coreHumanIntent = 'relationship_timing';
    } else if (/\b(debt|loan|money|finance|wealth|savings|losses|loss|bankruptcy|property)\b/i.test(lower)) {
      coreHumanIntent = 'financial_stress';
    } else if (/\b(health|illness|disease|surgery|pain|stamina|vitality|hospital|recovery)\b/i.test(lower)) {
      coreHumanIntent = 'vitality_health';
    }

    // 8. Communication Modality (from 43 PDF Neuro-Astrological Knowledge Base)
    let communicationModality: ConversationalSignals['communicationModality'] = 'balanced';
    if (/\b(makes?\s*sense|logic|logically|sequence|process|reason|why|data|numbers|algorithm|audit|step-by-step|verify|accuracy|accurate|probability|percentage|when\s*exactly|fact|criteria|score)\b/i.test(lower)) {
      communicationModality = 'auditory_digital';
    } else if (/\b(see|look|view|picture|graph|visual|chart|roadmap|horizon|clarity|clear\s*picture|show\s*me|perspective|illustration)\b/i.test(lower)) {
      communicationModality = 'visual';
    } else if (/\b(feel|feeling|gut|touch|handle|heavy|pressure|relaxed|comfortable|grounded|stressed|anxious|relief|peace)\b/i.test(lower)) {
      communicationModality = 'kinesthetic';
    } else if (/\b(hear|sounds?\s*like|tell\s*me|talk|discuss|tone|listen|express|spoke)\b/i.test(lower)) {
      communicationModality = 'auditory_tonal';
    }

    // 9. Thinking Style (Local vs Global from PDF Rules)
    let thinkingStyle: ConversationalSignals['thinkingStyle'] = 'balanced';
    if (/\b(exact|specific|which month|date|which company|in 20\d\d|details|breakdown|line by line|how many)\b/i.test(lower)) {
      thinkingStyle = 'local_execution';
    } else if (/\b(big picture|overall|long term|destiny|lifelong|direction|trajectory|macro|vision)\b/i.test(lower)) {
      thinkingStyle = 'global_strategic';
    }

    // 10. Conversation Turn Context (Follow-Up Detection)
    const isFollowUp = Boolean(conversationTurns && conversationTurns.length > 0);

    // 11. Timing Direct Query
    const timingDirectQuery = /\b(will\s*i|when\s*will|by\s*when|in\s*20\d\d|job\s*offer|placement|get\s*a\s*job|happen|timing|when\s*can\s*i|how\s*soon)\b/i.test(lower);

    // 12. Conversational Register
    let conversationalRegister: ConversationalSignals['conversationalRegister'] = 'balanced_mentor';
    if (/\b(informally|in plain slang|casually|super casual)\b/i.test(lower)) {
      conversationalRegister = 'casual_direct';
    } else if (isScholar || intendedOutcome === 'technical_audit') {
      conversationalRegister = 'scholarly_technical';
    } else if (emotionalTone === 'concerned_anxious') {
      conversationalRegister = 'reassuring_empathic';
    }

    // 13. Dynamic Narration Directive (Guides Narrator to Avoid ALL Static Boilerplate)
    const directiveParts: string[] = [];
    if (isFollowUp) {
      directiveParts.push('FOLLOW-UP TURN: Do NOT repeat greetings ("Namaste", "Welcome seeker"), do NOT re-introduce chart basics or your persona. Jump straight into answering the specific follow-up question.');
    }
    if (timingDirectQuery) {
      directiveParts.push('DIRECT TIMING INQUIRY: State the direct, unequivocal answer ("Yes" / "No" / primary favorable window) in the very first sentence. Then provide the exact date windows and supporting astrological factors.');
    }
    if (conversationalRegister === 'casual_direct') {
      directiveParts.push('CASUAL/FRIENDLY REGISTER: Match the user\'s conversational, authentic, down-to-earth tone. Avoid archaic, pompous, or theatrical language.');
    } else if (conversationalRegister === 'reassuring_empathic') {
      directiveParts.push('EMPATHIC REGISTER: Prioritize grounded comfort, steady reassurance, and constructive remedies to ease stress.');
    }
    if (communicationModality === 'auditory_digital') {
      directiveParts.push('AUDITORY DIGITAL: Use structured logic, clear headings, chronological dates, and bulleted proof points. Avoid flowery abstractions.');
    }
    const dynamicNarrationDirective = directiveParts.join(' ');

    return {
      actualTask: raw,
      intendedOutcome,
      emotionalTone,
      desiredDepth,
      requestedFormat,
      seekerPersona,
      coreHumanIntent,
      communicationModality,
      thinkingStyle,
      conversationalRegister,
      isFollowUp,
      timingDirectQuery,
      dynamicNarrationDirective,
      isCorrectionOrChallenge,
      disputedFact,
      userPreferences: {
        responseStyle: userPreferences?.responseStyle || (seekerPersona === 'village_layman' ? 'plain_village_clear' : 'adaptive'),
        answerDepth: userPreferences?.answerDepth || 'contextual',
        evidenceDetail: userPreferences?.evidenceDetail || 'balanced',
      },
    };
  }
}
