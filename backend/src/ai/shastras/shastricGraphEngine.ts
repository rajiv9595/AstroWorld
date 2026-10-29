/**
 * ASTROWORLD — Dynamic Shastric Knowledge Graph Query Engine
 * 
 * Traverses authentic classical Shastra nodes (BPHS, Saravali, Phaladeepika,
 * Jataka Parijata, Bhavartha Ratnakara) and executes pure mathematical predicates
 * against the native's calculated astronomical chart.
 * 
 * Zero hardcoding. Returns only Shastric verses that genuinely match the chart.
 */

import { SHASTRIC_KNOWLEDGE_GRAPH } from './shastricKnowledgeGraph.ts';
import { ShastricEvidenceItem, ShastricRuleNode } from './shastricRuleTypes.ts';

export class ShastricGraphEngine {
  private rules: ShastricRuleNode[] = SHASTRIC_KNOWLEDGE_GRAPH;

  /**
   * Query matching Shastric evidence nodes for an active chart and domain.
   */
  public queryShastricEvidence(
    chart: any,
    domain?: string,
    targetGraha?: string,
    limit: number = 4
  ): ShastricEvidenceItem[] {
    const results: ShastricEvidenceItem[] = [];

    for (const rule of this.rules) {
      // Domain filter (if provided, match domain or general)
      if (domain && rule.domain !== domain && rule.domain !== 'general') {
        continue;
      }

      // Planet filter (if provided)
      if (targetGraha && rule.targetGraha && rule.targetGraha.toLowerCase() !== targetGraha.toLowerCase()) {
        continue;
      }

      // Lagna filter (if provided)
      if (rule.targetLagna && chart.ascendant?.sign !== rule.targetLagna) {
        continue;
      }

      // Execute mathematical predicate against calculated astronomical chart
      try {
        const matches = rule.evaluator(chart);
        if (matches) {
          const sourceCitation = `${rule.sourceText} (${rule.edition}), Ch. ${rule.chapter}, ${rule.verse}`;
          results.push({
            ruleId: rule.id,
            sourceCitation,
            sanskritVerse: rule.sanskritVerse,
            classicalDictum: rule.classicalDictum,
            modernManifestation: rule.modernManifestation,
            astronomicalTrigger: rule.conditionDescription,
            domain: rule.domain,
          });
        }
      } catch {
        // Skip on evaluation error
      }

      if (results.length >= limit) {
        break;
      }
    }

    return results;
  }

  public getAllRulesCount(): number {
    return this.rules.length;
  }
}

export const globalShastricGraphEngine = new ShastricGraphEngine();

