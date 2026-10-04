/**
 * ASTROWORLD AI V2 — Question Understanding & Question Planner
 * Translates natural-language astrological questions into validated QuestionPlan objects.
 * Detects domain, intent, planetary focus, time scope, required chart layers, and ambiguities.
 */

import { VargaCode } from '../../../../shared/index.ts';
import { QuestionPlan, validateQuestionPlan } from '../schemas/questionPlan.ts';

export interface QuestionPlannerOptions {
  geminiApiKey?: string;
}

export class QuestionPlanner {
  private geminiApiKey?: string;

  constructor(options?: QuestionPlannerOptions) {
    this.geminiApiKey = options?.geminiApiKey || process.env.GEMINI_API_KEY;
  }

  /**
   * Translates a natural language user query into a validated, structured QuestionPlan.
   */
  public async plan(rawQuestion: string, followUpContext?: any, contextPack?: any): Promise<QuestionPlan> {
    if (!rawQuestion || typeof rawQuestion !== 'string' || rawQuestion.trim().length === 0) {
      throw new Error('QuestionPlanner: rawQuestion must be a non-empty string.');
    }

    const normalized = rawQuestion.trim();
    const lower = normalized.toLowerCase();

    // 1. Ambiguity Detection (via context pack or built-in patterns)
    if (contextPack?.clarificationNeeded) {
      return {
        questionId: `q_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        rawQuestion,
        normalizedQuestion: normalized,
        intent: 'clarification_needed',
        domain: contextPack.currentDomain || 'general',
        planetFocus: [],
        houseFocus: [],
        chartLayers: ['D1'],
        temporalScope: { type: 'current' },
        targetDatesIso: [],
        requiredTools: [],
        priority: 1,
        ambiguities: [contextPack.clarificationReason || 'Clarification required.'],
        clarificationRequired: true,
        clarification: {
          question: contextPack.clarificationReason || 'Please clarify your inquiry.',
          reason: contextPack.clarificationReason,
          suggestedOptions: contextPack.suggestedOptions || ['Career Timing', 'Relationships', 'Wealth & Finance'],
        },
        version: 'ai-v2-plan-1',
        createdAtIso: new Date().toISOString(),
      };
    }

    const hasFollowUp = Array.isArray(followUpContext) ? followUpContext.length > 0 : Boolean(followUpContext);
    if (!hasFollowUp && this.isAmbiguousQuery(lower)) {
      return this.createAmbiguityPlan(normalized, lower);
    }

    // 2. Structured Extraction (Deterministic Rule & NLP Mapping)
    const plan = this.extractPlanDeterministic(normalized, lower, followUpContext, contextPack);

    // 3. Schema Validation
    const validation = validateQuestionPlan(plan);
    if (!validation.valid) {
      throw new Error(`QuestionPlanner: generated invalid QuestionPlan - ${validation.errors.join('; ')}`);
    }

    return plan;
  }

  /**
   * Detects whether a question is too ambiguous to determine astrological scope without user clarification.
   */
  private isAmbiguousQuery(lower: string): boolean {
    const ambiguousPatterns = [
      /^will jupiter help me[\.\?!]?$/i,
      /^will saturn help me[\.\?!]?$/i,
      /^what happens next[\.\?!]?$/i,
      /^tell me something[\.\?!]?$/i,
      /^is my future good[\.\?!]?$/i,
      /^what about my life[\.\?!]?$/i,
      /^tell me about myself[\.\?!]?$/i,
      /^is this good[\.\?!]?$/i,
      /^is it good[\.\?!]?$/i,
      /^what next[\.\?!]?$/i,
      /^what should i do[\.\?!]?$/i,
    ];

    return ambiguousPatterns.some(pattern => pattern.test(lower.trim()));
  }

  /**
   * Generates a clarification QuestionPlan when the query lacks domain or temporal specificity.
   */
  private createAmbiguityPlan(rawQuestion: string, lower: string): QuestionPlan {
    let clarificationQuestion = 'What specific area of life would you like to explore (e.g. career, marriage, finances, health, or spiritual growth)?';
    let suggestedOptions = ['Career & Profession', 'Marriage & Relationships', 'Wealth & Finance', 'Health & Vitality', 'Spiritual Path'];

    if (lower.includes('jupiter') || lower.includes('saturn') || lower.includes('rahu') || lower.includes('ketu')) {
      const planet = lower.match(/jupiter|saturn|mars|venus|mercury|sun|moon|rahu|ketu/i)?.[0] || 'the planet';
      clarificationQuestion = `What domain of life would you like me to examine ${planet}'s effect on — career, marriage, finances, health, or something else?`;
      suggestedOptions = ['Career Timing', 'Marriage & Relationship', 'Financial Prosperity', 'General Transit Impact'];
    }

    return {
      questionId: `q_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      rawQuestion,
      normalizedQuestion: rawQuestion.trim(),
      intent: 'clarification_needed',
      domain: 'general',
      planetFocus: this.extractPlanets(lower),
      houseFocus: [],
      chartLayers: ['D1'],
      temporalScope: { type: 'current' },
      targetDatesIso: [],
      requiredTools: [],
      priority: 1,
      ambiguities: ['Unspecified domain and outcome criteria.'],
      clarificationRequired: true,
      clarification: {
        question: clarificationQuestion,
        reason: 'The question is too broad to provide a specific astrological reading.',
        suggestedOptions,
      },
      version: 'ai-v2-plan-1',
      createdAtIso: new Date().toISOString(),
    };
  }

  /**
   * Extracts structured astrological factors deterministically from query tokens.
   */
  private extractPlanDeterministic(
    rawQuestion: string,
    lower: string,
    followUpContext?: any,
    contextPack?: any
  ): QuestionPlan {
    let planets = this.extractPlanets(lower);
    let houses = this.extractHouses(lower);
    let chartLayers = this.extractChartLayers(lower);
    let { temporalScope, targetDatesIso } = this.extractTemporalScope(lower);

    // Context inheritance from contextPack
    if (contextPack) {
      if (planets.length === 0 && contextPack.resolvedReferents?.resolvedEntity) {
        planets.push(contextPack.resolvedReferents.resolvedEntity);
      }
      if (contextPack.resolvedReferents?.resolvedTemporalScope) {
        temporalScope = contextPack.resolvedReferents.resolvedTemporalScope;
      }
    }

    // Parse previous conversation context if available
    let prevText = '';
    if (Array.isArray(followUpContext)) {
      prevText = followUpContext.map(m => m.text || '').join(' ').toLowerCase();
    } else if (followUpContext && typeof followUpContext === 'object') {
      prevText = (followUpContext.prevUserText || followUpContext.resolvedEntity || '').toLowerCase();
    }

    // Context inheritance for follow-up turns
    if (prevText) {
      if (planets.length === 0) {
        planets = this.extractPlanets(prevText);
      }
      if (houses.length === 0 && (lower.startsWith('why') || lower.includes('what makes'))) {
        houses = this.extractHouses(prevText);
      }
      if (temporalScope.type === 'natal' && (lower.startsWith('why') || lower.includes('what makes') || lower.includes('how long'))) {
        const prevScope = this.extractTemporalScope(prevText);
        if (prevScope.temporalScope.type !== 'natal') {
          temporalScope = prevScope.temporalScope;
          targetDatesIso = prevScope.targetDatesIso;
        }
      }
    }

    let domain = 'general';
    let intent = 'general_chart_question';
    let event: string | undefined = undefined;

    if (prevText && (lower.startsWith('why') || lower === 'why' || lower === 'why?' || lower.includes('what makes'))) {
      intent = 'challenge_previous_conclusion';
      if (prevText.includes('career') || prevText.includes('job') || prevText.includes('promotion') || prevText.includes('work')) {
        domain = 'career';
      } else if (prevText.includes('marriage') || prevText.includes('relationship') || prevText.includes('spouse') || prevText.includes('partner')) {
        domain = 'relationship';
      }
    }

    // A. Simple Direct Astrological Factor Questions
    if (lower.includes('nakshatra') || lower.includes('tithi') || lower.includes('panchanga')) {
      intent = 'panchanga';
      domain = 'astrological';
      if (!chartLayers.includes('D1')) chartLayers.push('D1');
    } else if (lower.includes('moon sign') || lower.includes('rashi') || lower.includes('rasi') || lower.includes('janma rashi')) {
      intent = 'general_chart_question';
      domain = 'astrological';
      if (!chartLayers.includes('D1')) chartLayers.push('D1');
    } else if (
      (lower.includes('lagna') || lower.includes('ascendant')) &&
      (lower.includes('d10') || lower.includes('dashamsha') || lower.includes('dasamsa'))
    ) {
      intent = 'general_chart_question';
      domain = 'career';
      if (!chartLayers.includes('D10')) chartLayers.push('D10');
    } else if (
      (lower.includes('lagna') || lower.includes('ascendant')) &&
      (lower.includes('d9') || lower.includes('navamsha') || lower.includes('navamsa'))
    ) {
      intent = 'general_chart_question';
      domain = 'relationship';
      if (!chartLayers.includes('D9')) chartLayers.push('D9');
    } else if (lower.includes('ascendant') || (lower.includes('lagna') && !lower.includes('upapada') && !lower.includes('spouse') && !lower.includes('marriage'))) {
      intent = 'general_chart_question';
      domain = 'astrological';
      if (!chartLayers.includes('D1')) chartLayers.push('D1');
    } else if (
      (lower.includes('current mahadasha') ||
        lower.includes('current dasha') ||
        lower.includes('running dasha') ||
        lower.includes('dasha')) &&
      !lower.includes('career') &&
      !lower.includes('marriage') &&
      !lower.includes('relationship') &&
      !lower.includes('wealth') &&
      !lower.includes('finance') &&
      !lower.includes('spiritual') &&
      !lower.includes('dharma') &&
      !lower.includes('analyze') &&
      !lower.includes('evaluate')
    ) {
      intent = 'dasha_analysis';
      domain = 'timing';
    } else if (
      (lower.includes('d10') || lower.includes('dashamsha') || lower.includes('dasamsa')) &&
      !lower.includes('career') &&
      !lower.includes('business')
    ) {
      intent = 'varga_analysis';
      domain = 'career';
      if (!chartLayers.includes('D10')) chartLayers.push('D10');
    } else if (
      (lower.includes('d9') || lower.includes('navamsha') || lower.includes('navamsa')) &&
      !lower.includes('marriage') &&
      !lower.includes('relationship') &&
      !lower.includes('spiritual') &&
      !lower.includes('dharma')
    ) {
      intent = 'varga_analysis';
      domain = 'relationship';
      if (!chartLayers.includes('D9')) chartLayers.push('D9');
    } else if (lower.includes('panchanga') || lower.includes('tithi') || lower.includes('nakshatra')) {
      intent = 'panchanga';
      domain = 'astrological';
    } else if (lower.includes('yoga') || lower.includes('dosha') || lower.includes('gajakesari') || lower.includes('raja yoga')) {
      intent = 'yoga_analysis';
      domain = 'astrological';
    } else if (lower.includes('shadbala') || lower.includes('strength')) {
      intent = 'planet_question';
      domain = 'astrological';
    } else if (lower.includes('ashtakavarga') || lower.includes('bindus') || lower.includes('sav')) {
      intent = 'general_chart_question';
      domain = 'astrological';
    }

    // B. Career & Professional Inquiries
    else if (
      lower.includes('career') ||
      lower.includes('job') ||
      lower.includes('promotion') ||
      lower.includes('work') ||
      lower.includes('profession') ||
      lower.includes('business')
    ) {
      domain = 'career';
      if (lower.includes('promotion')) {
        intent = 'promotion_timing';
        event = 'promotion';
      } else if (lower.includes('change') || lower.includes('switch')) {
        intent = 'job_change';
        event = 'job_change';
      } else if (temporalScope.type === 'upcoming' || temporalScope.type === 'specific_date') {
        intent = 'career_timing';
      } else {
        intent = 'career';
      }
      if (!chartLayers.includes('D10')) chartLayers.push('D10');
      if (!chartLayers.includes('D1')) chartLayers.push('D1');
    }

    // C. Marriage & Relationship Inquiries
    else if (
      lower.includes('marriage') ||
      lower.includes('spouse') ||
      lower.includes('relationship') ||
      lower.includes('partner') ||
      lower.includes('love') ||
      lower.includes('wedding')
    ) {
      domain = 'relationship';
      intent = lower.includes('timing') || temporalScope.type === 'upcoming' ? 'relationship' : 'marriage';
      event = lower.includes('marriage') || lower.includes('wedding') ? 'marriage' : 'relationship';
      if (!chartLayers.includes('D9')) chartLayers.push('D9');
      if (!chartLayers.includes('D1')) chartLayers.push('D1');
    }

    // D. Wealth & Financial Inquiries
    else if (
      lower.includes('money') ||
      lower.includes('wealth') ||
      lower.includes('finance') ||
      lower.includes('financial') ||
      lower.includes('investment') ||
      lower.includes('income')
    ) {
      domain = 'finance';
      intent = 'wealth';
    }

    // E. Travel & Relocation Inquiries
    else if (lower.includes('travel') || lower.includes('foreign') || lower.includes('relocation') || lower.includes('abroad')) {
      domain = 'travel';
      intent = 'travel';
      event = 'foreign_travel';
    }

    // F. Health & Vitality
    else if (lower.includes('health') || lower.includes('disease') || lower.includes('vitality') || lower.includes('illness')) {
      domain = 'health';
      intent = 'health';
    }

    // G. Spiritual Path
    else if (lower.includes('spirituality') || lower.includes('spiritual') || lower.includes('moksha') || lower.includes('dharma')) {
      domain = 'spirituality';
      intent = 'spirituality';
    }

    // H. Transit Specific Inquiries
    else if (lower.includes('transit') || lower.includes('gochara') || lower.includes('sade sati')) {
      domain = 'timing';
      intent = 'transit_analysis';
    }

    // Apply contextPack overrides for follow-up turns
    if (contextPack) {
      if (contextPack.resolvedReferents?.requestedExplanation) {
        intent = 'challenge_previous_conclusion';
      }
      if (
        contextPack.currentDomain &&
        contextPack.currentDomain !== 'general' &&
        (domain === 'general' || lower.startsWith('why') || lower.includes('what makes') || lower.includes('how so'))
      ) {
        domain = contextPack.currentDomain;
      }
    }

    // Deduplicate chart layers and ensure D1 is included if empty
    const uniqueLayers = Array.from(new Set(chartLayers)) as VargaCode[];
    if (uniqueLayers.length === 0) {
      uniqueLayers.push('D1');
    }

    return {
      questionId: `q_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      rawQuestion,
      normalizedQuestion: rawQuestion.trim(),
      intent,
      domain,
      event,
      planetFocus: planets,
      houseFocus: houses,
      chartLayers: uniqueLayers,
      temporalScope,
      targetDatesIso,
      requiredTools: [],
      priority: 1,
      ambiguities: [],
      clarificationRequired: false,
      followUpContext:
        followUpContext || contextPack?.resolvedReferents?.hasReferents
          ? {
              isFollowUp: true,
              parentQuestionId: followUpContext?.parentQuestionId || contextPack?.resolvedReferents?.referentTurnId,
              resolvedEntity: followUpContext?.resolvedEntity || contextPack?.resolvedReferents?.resolvedEntity,
            }
          : undefined,
      version: 'ai-v2-plan-1',
      createdAtIso: new Date().toISOString(),
    };
  }

  private extractPlanets(lower: string): string[] {
    const planets: string[] = [];
    const list = [
      { name: 'Sun', aliases: ['sun', 'surya', 'ravi'] },
      { name: 'Moon', aliases: ['moon', 'chandra', 'soma'] },
      { name: 'Mars', aliases: ['mars', 'mangal', 'kuja', 'angarka'] },
      { name: 'Mercury', aliases: ['mercury', 'budh', 'budha'] },
      { name: 'Jupiter', aliases: ['jupiter', 'guru', 'brihaspati'] },
      { name: 'Venus', aliases: ['venus', 'shukra'] },
      { name: 'Saturn', aliases: ['saturn', 'shani'] },
      { name: 'Rahu', aliases: ['rahu', 'north node'] },
      { name: 'Ketu', aliases: ['ketu', 'south node'] },
    ];

    for (const p of list) {
      if (p.aliases.some(alias => new RegExp(`\\b${alias}\\b`, 'i').test(lower))) {
        planets.push(p.name);
      }
    }
    return planets;
  }

  private extractHouses(lower: string): number[] {
    const houses: number[] = [];
    const houseMatches = lower.match(/\b(1st|2nd|3rd|4th|5th|6th|7th|8th|9th|10th|11th|12th|\d+th)\s+house\b/gi);
    if (houseMatches) {
      for (const m of houseMatches) {
        const num = parseInt(m.match(/\d+/)?.[0] || '0', 10);
        if (num >= 1 && num <= 12 && !houses.includes(num)) {
          houses.push(num);
        }
      }
    }
    return houses;
  }

  private extractChartLayers(lower: string): VargaCode[] {
    const layers: VargaCode[] = [];
    const vargas: VargaCode[] = [
      'D1', 'D2', 'D3', 'D4', 'D7', 'D9', 'D10', 'D12',
      'D16', 'D20', 'D24', 'D27', 'D30', 'D40', 'D45', 'D60'
    ];

    for (const v of vargas) {
      if (new RegExp(`\\b${v}\\b`, 'i').test(lower)) {
        layers.push(v);
      }
    }
    if (lower.includes('navamsha') || lower.includes('navamsa')) layers.push('D9');
    if (lower.includes('dashamsha') || lower.includes('dasamsa')) layers.push('D10');
    if (lower.includes('saptamsha') || lower.includes('saptamsa')) layers.push('D7');
    if (lower.includes('shashtiamsha') || lower.includes('shashtiamsa')) layers.push('D60');

    return Array.from(new Set(layers));
  }

  private extractTemporalScope(lower: string): { temporalScope: { type: any; startIso?: string; endIso?: string }; targetDatesIso: string[] } {
    const targetDatesIso: string[] = [];

    // Check for explicit 4-digit years (e.g. 2026, 2027, 2028)
    const yearMatches = lower.match(/\b(202[0-9]|203[0-9])\b/g);
    if (yearMatches && yearMatches.length > 0) {
      const year = parseInt(yearMatches[0], 10);
      const targetDate = new Date(Date.UTC(year, 5, 15)).toISOString();
      targetDatesIso.push(targetDate);
      return {
        temporalScope: {
          type: 'specific_date',
          startIso: new Date(Date.UTC(year, 0, 1)).toISOString(),
          endIso: new Date(Date.UTC(year, 11, 31)).toISOString(),
        },
        targetDatesIso,
      };
    }

    if (lower.includes('upcoming') || lower.includes('next year') || lower.includes('near future') || lower.includes('soon')) {
      const nextYear = new Date().getFullYear() + 1;
      const targetDate = new Date(Date.UTC(nextYear, 0, 1)).toISOString();
      targetDatesIso.push(targetDate);
      return {
        temporalScope: { type: 'upcoming', startIso: targetDate },
        targetDatesIso,
      };
    }

    if (lower.includes('today') || lower.includes('current') || lower.includes('now') || lower.includes('present')) {
      return {
        temporalScope: { type: 'current' },
        targetDatesIso: [],
      };
    }

    return {
      temporalScope: { type: 'natal' },
      targetDatesIso: [],
    };
  }
}
