/**
 * ASTROWORLD AI V3 — Contextual Consultation Visualizations Schema
 * Defines the structured visual payloads that can be attached to consultation responses
 * and rendered natively in the chat interface.
 */

export interface DashaTimelineViz {
  type: 'dasha_timeline';
  mahadasha: string;
  antardasha: string;
  pratyantardasha?: string;
  startDateIso: string;
  endDateIso: string;
  percentElapsed: number; // 0 - 100
  remainingYears: number;
  nextMilestone: string;
}

export interface PlanetaryStrengthViz {
  type: 'planetary_strength';
  planet: string;
  virupas: number;
  requiredVirupas: number;
  ratio: number; // e.g. 1.25 = 125% of required strength
  isStrong: boolean;
  statusText: string;
}

export interface TimingProbabilityViz {
  type: 'timing_probability';
  windowLabel: string;
  periodText: string;
  scorePercent: number; // 0 - 100
  status: 'highly_favorable' | 'supportive' | 'mixed' | 'friction';
  summary: string;
  keyDrivers: string[];
}

export interface AshtakavargaHouseViz {
  type: 'ashtakavarga_house';
  house: number;
  signName?: string;
  bindus: number;
  status: 'exceptional' | 'strong' | 'average' | 'friction';
}

export interface ConsultationVisualizations {
  dashaTimeline?: DashaTimelineViz;
  planetaryStrengths?: PlanetaryStrengthViz[];
  timingProbability?: TimingProbabilityViz;
  ashtakavargaSummary?: AshtakavargaHouseViz[];
}
