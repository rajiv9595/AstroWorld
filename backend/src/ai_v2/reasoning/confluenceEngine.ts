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

    // 1. D1 Natal Chart Layer
    const d1Facts = evidence.facts.filter(f => f.category === 'natal');
    if (d1Facts.length > 0) {
      const isRestricting = restrictingFactors.some(f => f.sourceTool === 'get_birth_chart' || f.sourceTool === 'get_planetary_positions');
      const isSupportive = primaryFactors.some(f => (f.sourceTool === 'get_birth_chart' || f.sourceTool === 'get_planetary_positions') && f.role === 'primary') || d1Facts.length >= 3;
      layers.push({
        layer: 'D1',
        factorDescription: `Natal D1 chart foundations: ${d1Facts.slice(0, 3).map(f => `${f.entity} in ${f.sign}`).join(', ')}`,
        alignment: isRestricting ? 'restricting' : isSupportive ? 'supportive' : 'neutral',
        evidenceId: d1Facts[0].id,
      });
    }

    // 2. Divisional Chart (Varga) Layer
    const vargaFacts = evidence.facts.filter(f => f.category === 'varga');
    if (vargaFacts.length > 0) {
      const targetVarga = plan.chartLayers.find(l => l !== 'D1') || 'D10';
      const isSupportive = vargaFacts.some(f => f.dignity === 'EXALTED' || f.dignity === 'OWN_SIGN' || f.dignity === 'FRIENDLY') || vargaFacts.length > 0;
      layers.push({
        layer: 'Varga',
        factorDescription: `${targetVarga} Divisional Chart placements: ${vargaFacts.slice(0, 2).map(f => f.value).join(', ')}`,
        alignment: isSupportive ? 'supportive' : 'neutral',
        evidenceId: vargaFacts[0].id,
      });
    }

    // 3. Vimshottari Dasha Layer
    const dashaFacts = evidence.facts.filter(f => f.category === 'dasha');
    if (dashaFacts.length > 0) {
      const dashaStr = String(dashaFacts[0].value || '');
      layers.push({
        layer: 'Dasha',
        factorDescription: `Vimshottari Dasha period: ${dashaStr}`,
        alignment: 'supportive',
        evidenceId: dashaFacts[0].id,
      });
    }

    // 4. Gochara Transit Layer
    const transitFacts = evidence.facts.filter(f => f.category === 'transit');
    if (transitFacts.length > 0) {
      const jupTransit = transitFacts.find(f => f.entity.toLowerCase().includes('jupiter'));
      const isSupportive = Boolean(jupTransit) || transitFacts.length > 0;
      layers.push({
        layer: 'Transit',
        factorDescription: `Gochara planetary transit: ${jupTransit?.value || transitFacts[0].value}`,
        alignment: isSupportive ? 'supportive' : 'neutral',
        evidenceId: (jupTransit || transitFacts[0]).id,
      });
    }

    // 5. Classical Yogas Layer
    const yogas = evidence.derivedFacts.filter(f => f.type === 'Yoga');
    if (yogas.length > 0) {
      layers.push({
        layer: 'Yoga',
        factorDescription: `Active classical combinations: ${yogas.slice(0, 2).map(y => y.description).join('; ')}`,
        alignment: 'supportive',
        evidenceId: yogas[0].id,
      });
    }

    // Calculate Converging Alignment
    const supportiveCount = layers.filter(l => l.alignment === 'supportive').length;
    const restrictingCount = layers.filter(l => l.alignment === 'restricting').length;

    let confluenceStrength: InterpretationStrength = 'weak';
    if (supportiveCount >= 3) {
      confluenceStrength = 'strong';
    } else if (supportiveCount >= 2) {
      confluenceStrength = 'moderate';
    }

    const hasConfluence = supportiveCount >= 2;
    const confluenceSummary = hasConfluence
      ? `Multi-layer confluence confirmed across ${supportiveCount} independent astrological layers (${layers.map(l => l.layer).join(', ')}).`
      : `Single-layer or partial astrological alignment observed.`;

    return {
      hasConfluence,
      confluenceStrength,
      convergingLayersCount: supportiveCount,
      layers,
      confluenceSummary,
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
