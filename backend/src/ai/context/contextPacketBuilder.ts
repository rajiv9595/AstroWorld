/**
 * ASTROWORLD — Consultation Context Packet Builder
 * Deterministically filters and packages only relevant canonical facts,
 * applying the non-repetition filter and timing firewall.
 */

import { AIInterpretationContext } from '../../../../shared/index.ts';
import {
  selectCareerEvidence,
  selectDashaEvidence,
  selectDignityEvidence,
  selectMarriageEvidence,
  selectTransitEvidence,
} from '../specialists/domainSpecialists.ts';
import {
  ConsultationContextPacket,
  ConversationMemoryState,
  ExtractedEntities,
  SpecialistDomain,
  TimingFact,
  UserIntent,
} from '../types.ts';
import { buildConversationSummary } from '../memory/conversationMemory.ts';

export function buildConsultationContextPacket(
  userQuestion: string,
  intents: UserIntent[],
  entities: ExtractedEntities,
  specialists: SpecialistDomain[],
  context: AIInterpretationContext,
  memory: ConversationMemoryState
): ConsultationContextPacket {
  const packet: ConsultationContextPacket = {
    userQuestion,
    intents,
    entities,
    conversationSummary: buildConversationSummary(memory),
    recentlyDiscussedFactKeys: Array.from(memory.discussedFactKeys),
    primaryTradition: 'Parashari Classical Vedic Astrology',
    relevantChartFacts: {
      planets: [],
    },
    relevantRules: [],
    relevantTiming: [],
    uncertaintyNotes: [],
  };

  // Base Ascendant
  packet.relevantChartFacts.ascendant = {
    sign: context.ascendant.sign,
    degree: context.ascendant.formattedDegree,
    nakshatra: context.ascendant.nakshatra,
    pada: context.ascendant.pada,
  };

  // Merge evidence from activated specialists
  if (specialists.includes('CAREER_SPECIALIST') || specialists.includes('D10_CAREER_SPECIALIST')) {
    const careerEv = selectCareerEvidence(context, entities);
    mergePacketParts(packet, careerEv);
  }

  if (specialists.includes('MARRIAGE_SPECIALIST') || specialists.includes('D9_SPECIALIST')) {
    const marriageEv = selectMarriageEvidence(context, entities);
    mergePacketParts(packet, marriageEv);
  }

  if (specialists.includes('DIGNITY_SPECIALIST')) {
    const dignityEv = selectDignityEvidence(context, entities);
    mergePacketParts(packet, dignityEv);
  }

  if (specialists.includes('TRANSIT_SPECIALIST')) {
    const transitEv = selectTransitEvidence(context, entities);
    mergePacketParts(packet, transitEv);
  }

  if (specialists.includes('DASHA_SPECIALIST')) {
    const dashaEv = selectDashaEvidence(context);
    mergePacketParts(packet, dashaEv);
  }

  if (specialists.includes('NATAL_SPECIALIST') || specialists.includes('GENERAL_ASTROLOGER')) {
    // If no specific planets were selected yet, populate D1 planets
    if (packet.relevantChartFacts.planets.length === 0) {
      packet.relevantChartFacts.planets = context.planets.map((p) => ({
        name: p.name,
        sign: p.sign,
        degree: p.formattedDegree,
        house: p.houseNumber,
        dignity: p.dignity,
        nakshatra: p.nakshatra,
        pada: p.pada,
        retrograde: p.retrograde,
        combust: p.combust,
        factKey: `D1:${p.name}:${p.sign}:${p.dignity}`,
      }));
    }
  }

  if (specialists.includes('YOGA_SPECIALIST') && !packet.relevantYogas) {
    packet.relevantYogas = (context.yogas || [])
      .filter((y) => y.present)
      .slice(0, 5)
      .map((y) => ({ name: y.name, reference: y.bphsReference || 'BPHS', effects: y.effects }));
  }

  if (specialists.includes('JAIMINI_SPECIALIST') && !packet.relevantJaimini) {
    const amk = context.jaimini?.charaKarakas?.find((k) => k.role === 'AmK');
    const dk = context.jaimini?.charaKarakas?.find((k) => k.role === 'DK');
    packet.relevantJaimini = {
      atmakaraka: context.jaimini?.atmakaraka,
      amatyakaraka: amk ? `${amk.planet} (Career)` : undefined,
      darakaraka: dk ? `${dk.planet} (Spouse)` : undefined,
      karakamsa: context.jaimini?.karakamsaNavamshaSign,
      arudhaLagna: context.jaimini?.arudhaLagna?.sign,
    };
  }

  // Exact date safety rule
  if (entities.isExactDateRequested) {
    packet.relevantTiming.push({
      type: 'UNKNOWN',
      periodLabel: 'Exact Day Prediction',
      description:
        'Vedic astrology principles map energetic dasha windows and transit triggers, not single deterministic timestamps for social event occurrences.',
      confidence: 'LOW',
    });
    packet.uncertaintyNotes.push(
      'Astrological indications identify supportive time windows and planetary alignments; exact calendar dates for future personal events should not be claimed as absolute certainty.'
    );
  }

  return packet;
}

function mergePacketParts(
  target: ConsultationContextPacket,
  source: Partial<ConsultationContextPacket>
): void {
  if (source.relevantChartFacts?.planets) {
    source.relevantChartFacts.planets.forEach((sp) => {
      if (!target.relevantChartFacts.planets.some((tp) => tp.name === sp.name)) {
        target.relevantChartFacts.planets.push(sp);
      }
    });
  }

  if (source.relevantVargaFacts) {
    if (!target.relevantVargaFacts) target.relevantVargaFacts = [];
    source.relevantVargaFacts.forEach((sv) => {
      const existing = target.relevantVargaFacts!.find((tv) => tv.code === sv.code);
      if (existing) {
        sv.planets.forEach((svp) => {
          if (!existing.planets.some((ep) => ep.name === svp.name)) {
            existing.planets.push(svp);
          }
        });
      } else {
        target.relevantVargaFacts!.push(sv);
      }
    });
  }

  if (source.relevantDashaFacts) {
    target.relevantDashaFacts = { ...target.relevantDashaFacts, ...source.relevantDashaFacts };
  }

  if (source.relevantTransitFacts) {
    target.relevantTransitFacts = source.relevantTransitFacts;
  }

  if (source.relevantYogas) {
    target.relevantYogas = [...(target.relevantYogas || []), ...source.relevantYogas];
  }

  if (source.relevantJaimini) {
    target.relevantJaimini = { ...target.relevantJaimini, ...source.relevantJaimini };
  }

  if (source.relevantRules) {
    target.relevantRules = Array.from(new Set([...target.relevantRules, ...source.relevantRules]));
  }

  if (source.relevantTiming) {
    target.relevantTiming = [...target.relevantTiming, ...source.relevantTiming];
  }
}
