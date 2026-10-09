/**
 * ASTROWORLD AI V2 — Astrological Confluence & Temporal Reasoning Engine
 * Determines multi-layer agreement across D1, Vargas, Dasha, Transits, Yogas, and Ashtakavarga.
 * Computes temporal window intersections using strictly verified dates from the engine.
 */

import { QuestionPlan } from '../schemas/questionPlan.ts';
import { EvidencePacket, FactItem, DerivedFactItem } from '../schemas/evidencePacket.ts';
import {
  ConfluenceResult,
  ConfluenceItem,
  TemporalWindowResult,
  InterpretationStrength,
  ClassifiedFactor,
} from '../schemas/reasoningPacket.ts';

export class ConfluenceEngine {
  private deterministicWindowId(
    prefix: string,
    parts: Array<string | number | undefined>,
  ): string {
    return `win_${prefix}_${parts
      .filter((part): part is string | number => part !== undefined)
      .map(part => String(part).replace(/[^a-zA-Z0-9]+/g, '_'))
      .join('_')}`;
  }

  /**
   * Evaluates astrological confluence across independent chart layers.
   */
  public evaluateConfluence(
    plan: QuestionPlan,
    evidence: EvidencePacket,
    primaryFactors: ClassifiedFactor[],
    restrictingFactors: ClassifiedFactor[]
  ): ConfluenceResult {
    const layers: ConfluenceItem[] = [];

    const baseWeights: Record<ConfluenceItem['layer'], number> = {
      D1: 1.25,
      Varga: 1.0,
      Dasha: 1.2,
      Transit: 1.0,
      Yoga: 1.15,
      Ashtakavarga: 0.8,
      Jaimini: 0.8,
    };

    const classifyLayer = (sourceTool: string, category: string): ConfluenceItem['layer'] | null => {
      const tool = sourceTool.toLowerCase();
      if (category === 'varga' || tool.includes('divisional')) return 'Varga';
      if (category === 'dasha' || tool.includes('dasha')) return 'Dasha';
      if (category === 'transit' || tool.includes('transit')) return 'Transit';
      if (category === 'ashtakavarga' || tool.includes('ashtakavarga')) return 'Ashtakavarga';
      if (category === 'jaimini' || tool.includes('jaimini')) return 'Jaimini';
      if (category === 'yoga' || tool.includes('yoga')) return 'Yoga';
      if (category === 'natal' || tool.includes('birth_chart') || tool.includes('planetary_positions')) return 'D1';
      return null;
    };

    const factorsForLayer = (
      layer: ConfluenceItem['layer'],
      factors: ClassifiedFactor[],
      derived = false,
    ): ClassifiedFactor[] => factors.filter((factor) => {
      const toolLayer = classifyLayer(
        factor.sourceTool,
        derived ? 'yoga' : factor.property,
      );
      if (toolLayer === layer) return true;
      return layer === 'D1' && factor.sourceTool.toLowerCase().includes('planet');
    });

    const pushLayer = (
      layer: ConfluenceItem['layer'],
      description: string,
      evidenceId: string,
      factorSet: ClassifiedFactor[],
      forceNeutral = false,
    ) => {
      const factorScores = forceNeutral ? [] : factorSet.map(f => ({
        support: f.role === 'restricting' || f.role === 'conflicting' ? 0 : (f.weight ?? 0) * baseWeights[layer],
        restrict: f.role === 'restricting' || f.role === 'conflicting' ? (f.weight ?? 0) * baseWeights[layer] : 0,
      }));
      const supportScore = Number(factorScores.reduce((n, x) => n + x.support, 0).toFixed(3));
      const restrictingScore = Number(factorScores.reduce((n, x) => n + x.restrict, 0).toFixed(3));

      let alignment: ConfluenceItem['alignment'] = 'neutral';
      if (supportScore >= 0.75 && supportScore > restrictingScore) alignment = 'supportive';
      if (restrictingScore >= 0.75 && restrictingScore > supportScore) alignment = 'restricting';

      layers.push({
        layer,
        factorDescription: description,
        alignment: forceNeutral ? 'neutral' : alignment,
        evidenceId,
        supportScore,
        restrictingScore,
      });
    };

    // Only create a layer when there is evidence AND at least one relevant
    // classified factor. Mere tool execution is not treated as confluence.
    const d1Facts = evidence.facts.filter(f => f.category === 'natal');
    const d1Factors = [
      ...factorsForLayer('D1', primaryFactors),
      ...factorsForLayer('D1', restrictingFactors),
    ];
    if (d1Facts.length > 0 && d1Factors.length > 0) {
      pushLayer(
        'D1',
        `Natal D1 factors: ${d1Facts.slice(0, 3).map(f => `${f.entity}${f.sign ? ` in ${f.sign}` : ''}`).join(', ')}`,
        d1Facts[0].id,
        d1Factors,
      );
    }

    const vargaFacts = evidence.facts.filter(f => f.category === 'varga' && f.verified);
    const vargaFactors = [
      ...factorsForLayer('Varga', primaryFactors),
      ...factorsForLayer('Varga', restrictingFactors),
    ];
    const extractVargaCode = (entity: string): string | undefined =>
      entity.match(/\bD(?:1|2|3|4|7|9|10|12|16|20|24|27|30|40|45|60)\b/i)?.[0].toUpperCase();

    // Keep each actual divisional chart as an independent signal. Pooling D4 and
    // D10 scores into one Varga bucket can hide disagreement and misattribute evidence.
    const vargaCodes = Array.from(new Set(vargaFacts.map(f => extractVargaCode(f.entity)).filter(Boolean))) as string[];
    const vargaGroups = vargaCodes.length > 0 ? vargaCodes : ['Varga'];
    for (const code of vargaGroups) {
      const factsForVarga = vargaFacts.filter(f =>
        (extractVargaCode(f.entity) || 'Varga') === code
      );
      const factorsForVarga = vargaFactors.filter(f =>
        (extractVargaCode(f.entity) || 'Varga') === code
      );
      if (factsForVarga.length === 0 || factorsForVarga.length === 0) continue;

      pushLayer(
        'Varga',
        `${code === 'Varga' ? 'Divisional' : code} divisional evidence: ${factsForVarga.slice(0, 2).map(f => f.value).join(', ')}`,
        factsForVarga[0].id,
        factorsForVarga,
      );
    }

    const dashaFacts = evidence.facts.filter(f => f.category === 'dasha');
    const dashaFactors = [
      ...factorsForLayer('Dasha', primaryFactors),
      ...factorsForLayer('Dasha', restrictingFactors),
    ];
    if (dashaFacts.length > 0 && dashaFactors.length > 0) {
      pushLayer(
        'Dasha',
        `Vimshottari Dasha evidence: ${String(dashaFacts[0].value ?? '')}`,
        dashaFacts[0].id,
        dashaFactors,
      );
    }

    const transitFacts = evidence.facts.filter(f => f.category === 'transit');
    const transitFactors = [
      ...factorsForLayer('Transit', primaryFactors),
      ...factorsForLayer('Transit', restrictingFactors),
    ];
    if (transitFacts.length > 0 && transitFactors.length > 0) {
      const transitFocus = transitFacts.find(f => f.entity.toLowerCase().includes('jupiter')) || transitFacts[0];
      pushLayer(
        'Transit',
        `Gochara evidence: ${String(transitFocus.value ?? '')}`,
        transitFocus.id,
        transitFactors,
      );
    }

    const yogaFacts = evidence.derivedFacts.filter(f => f.type === 'Yoga' && f.verified);
    const yogaFactors = primaryFactors.filter(f => yogaFacts.some(y => y.id === f.evidenceId));
    if (yogaFacts.length > 0 && yogaFactors.length > 0) {
      pushLayer(
        'Yoga',
        `Verified classical combinations: ${yogaFacts.slice(0, 2).map(y => y.description).join('; ')}`,
        yogaFacts[0].id,
        yogaFactors,
      );
    }

    const ashtakavargaFacts = evidence.facts.filter(f => f.category === 'ashtakavarga' && f.verified);
    const ashtakavargaFactors = [
      ...factorsForLayer('Ashtakavarga', primaryFactors),
      ...factorsForLayer('Ashtakavarga', restrictingFactors),
    ];
    if (ashtakavargaFacts.length > 0) {
      pushLayer(
        'Ashtakavarga',
        `Verified Ashtakavarga context: ${ashtakavargaFacts.slice(0, 2).map(f => String(f.value ?? '')).join(', ')}`,
        ashtakavargaFacts[0].id,
        ashtakavargaFactors,
        true,
      );
    }

    const jaiminiFacts = evidence.facts.filter(f => f.category === 'jaimini' && f.verified);
    const jaiminiFactors = [
      ...factorsForLayer('Jaimini', primaryFactors),
      ...factorsForLayer('Jaimini', restrictingFactors),
    ];
    if (jaiminiFacts.length > 0) {
      pushLayer(
        'Jaimini',
        `Verified Jaimini context: ${jaiminiFacts.slice(0, 2).map(f => String(f.value ?? '')).join(', ')}`,
        jaiminiFacts[0].id,
        jaiminiFactors,
        true,
      );
    }

    const supportiveScore = Number(layers.reduce((n, l) => n + (l.supportScore ?? 0), 0).toFixed(3));
    const restrictingScore = Number(layers.reduce((n, l) => n + (l.restrictingScore ?? 0), 0).toFixed(3));
    const supportiveLayers = layers.filter(l => l.alignment === 'supportive').length;
    const restrictingLayers = layers.filter(l => l.alignment === 'restricting').length;

    let confluenceStrength: InterpretationStrength = 'inconclusive';
    if (supportiveLayers >= 3 && supportiveScore >= 3.0 && supportiveScore > restrictingScore + 0.75) {
      confluenceStrength = 'strong';
    } else if (supportiveLayers >= 2 && supportiveScore >= 1.5 && supportiveScore > restrictingScore + 0.5) {
      confluenceStrength = 'moderate';
    } else if (supportiveLayers >= 1 || restrictingLayers >= 1) {
      confluenceStrength = 'weak';
    }

    const hasConfluence =
      supportiveLayers >= 2 &&
      supportiveScore >= 1.5 &&
      supportiveScore > restrictingScore + 0.5;

    const confluenceSummary = hasConfluence
      ? `Weighted multi-layer confluence confirmed across ${supportiveLayers} independent layers (support=${supportiveScore}, restrict=${restrictingScore}).`
      : `No sufficient multi-layer confluence: support=${supportiveScore}, restrict=${restrictingScore}; layers remain explicitly neutral where evidence is not outcome-supporting.`;

    return {
      hasConfluence,
      confluenceStrength,
      convergingLayersCount: supportiveLayers,
      layers,
      confluenceSummary,
      supportiveScore,
      restrictingScore,
    };
  }

  /**
   * Constructs verified temporal evaluation windows from engine Dasha and Transit facts.
   */
  public buildTemporalWindows(
    _plan: QuestionPlan,
    evidence: EvidencePacket
  ): TemporalWindowResult[] {
    const windows: TemporalWindowResult[] = [];

    const dashaToolResult = evidence.toolResults.find(
      r => (r.toolName === 'get_current_dasha' || r.toolName === 'get_dasha_at') &&
        r.success &&
        r.provenance?.verified &&
        r.data?.currentHierarchy,
    );

    if (dashaToolResult) {
      const h = dashaToolResult.data.currentHierarchy;
      if (h.mahadasha && h.antardasha) {
        const startDateIso = h.antardasha.startDateIso || h.mahadasha.startDateIso;
        const endDateIso = h.antardasha.endDateIso || h.mahadasha.endDateIso;
        if (startDateIso && endDateIso) {
          const dashaLord = h.mahadasha.lord;
          const subLord = h.antardasha.subLord || h.antardasha.lord;
          windows.push({
            id: this.deterministicWindowId('dasha', [dashaLord, subLord, startDateIso, endDateIso]),
            label: `Vimshottari Dasha Window (${dashaLord} - ${subLord})`,
            startDateIso,
            endDateIso,
            type: 'general_dasha_period',
            contributingDasha: `${dashaLord}/${subLord}`,
            evidenceIds: evidence.facts
              .filter(f => f.category === 'dasha' && f.verified)
              .map(f => f.id),
            strength: 'moderate',
          });
        }
      }
    }

    return windows;
  }
}
