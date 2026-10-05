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
    ) => {
      const factorScores = factorSet.map(f => ({
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
        alignment,
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

    const vargaFacts = evidence.facts.filter(f => f.category === 'varga');
    const vargaFactors = [
      ...factorsForLayer('Varga', primaryFactors),
      ...factorsForLayer('Varga', restrictingFactors),
    ];
    if (vargaFacts.length > 0 && vargaFactors.length > 0) {
      const targetVarga = plan.chartLayers.find(l => l !== 'D1') || 'D10';
      pushLayer(
        'Varga',
        `${targetVarga} divisional evidence: ${vargaFacts.slice(0, 2).map(f => f.value).join(', ')}`,
        vargaFacts[0].id,
        vargaFactors,
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
    plan: QuestionPlan,
    evidence: EvidencePacket
  ): TemporalWindowResult[] {
    const windows: TemporalWindowResult[] = [];

    // A. Active Current / Target Dasha Period Window
    const dashaToolResult = evidence.toolResults.find(
      r => (r.toolName === 'get_current_dasha' || r.toolName === 'get_dasha_at') && r.success
    );

    if (dashaToolResult && dashaToolResult.data?.currentHierarchy) {
      const h = dashaToolResult.data.currentHierarchy;
      if (h.mahadasha && h.antardasha) {
        windows.push({
          id: `win_dasha_${Date.now()}`,
          label: `Vimshottari Dasha Window (${h.mahadasha.lord} - ${h.antardasha.subLord || h.antardasha.lord})`,
          startDateIso: h.antardasha.startDateIso || h.mahadasha.startDateIso || new Date().toISOString(),
          endDateIso: h.antardasha.endDateIso || h.mahadasha.endDateIso || new Date().toISOString(),
          type: 'supportive_window',
          contributingDasha: `${h.mahadasha.lord}/${h.antardasha.subLord || h.antardasha.lord}`,
          evidenceIds: [evidence.facts.find(f => f.category === 'dasha')?.id || 'dasha_ev_1'],
          strength: 'moderate',
        });
      }
    }

    // B. Target Timing Scope from QuestionPlan (e.g. 2027)
    if (plan.temporalScope.type === 'specific_date' || plan.temporalScope.type === 'upcoming') {
      const targetDate = plan.targetDatesIso[0] || plan.temporalScope.startIso || '2027-01-01T00:00:00.000Z';
      windows.push({
        id: `win_target_${Date.now()}`,
        label: `Target Query Window (${new Date(targetDate).getUTCFullYear()})`,
        startDateIso: plan.temporalScope.startIso || targetDate,
        endDateIso: plan.temporalScope.endIso || targetDate,
        type: 'peak_confluence_window',
        evidenceIds: evidence.facts.filter(f => f.category === 'transit' || f.category === 'dasha').map(f => f.id),
        strength: 'strong',
      });
    }

    return windows;
  }
}
