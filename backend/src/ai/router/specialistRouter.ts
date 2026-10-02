/**
 * ASTROWORLD — Specialist Domain Router
 * Maps classified intents and entities into a prioritized list of specialist fact/rule selectors.
 */

import { ExtractedEntities, SpecialistDomain, UserIntent } from '../types.ts';

export function routeToSpecialists(
  intents: UserIntent[],
  entities: ExtractedEntities
): SpecialistDomain[] {
  const specialists = new Set<SpecialistDomain>();

  // Direct mapping
  if (intents.includes('CAREER') || intents.includes('JOB')) {
    specialists.add('CAREER_SPECIALIST');
    specialists.add('D10_CAREER_SPECIALIST');
    specialists.add('DASHA_SPECIALIST');
    if (intents.includes('TRANSITS_FUTURE') || intents.includes('TRANSITS_CURRENT') || entities.targetYear) {
      specialists.add('TRANSIT_SPECIALIST');
    }
  }

  if (intents.includes('MARRIAGE') || intents.includes('RELATIONSHIP')) {
    specialists.add('MARRIAGE_SPECIALIST');
    specialists.add('D9_SPECIALIST');
    specialists.add('DASHA_SPECIALIST');
    if (intents.includes('TRANSITS_FUTURE') || intents.includes('TRANSITS_CURRENT')) {
      specialists.add('TRANSIT_SPECIALIST');
    }
  }

  if (intents.includes('FINANCE')) {
    specialists.add('FINANCE_SPECIALIST');
    specialists.add('DASHA_SPECIALIST');
  }

  if (intents.includes('DIGNITY')) {
    specialists.add('DIGNITY_SPECIALIST');
    if (entities.vargaCode === 'D9') specialists.add('D9_SPECIALIST');
    else if (entities.vargaCode === 'D10') specialists.add('D10_CAREER_SPECIALIST');
    else if (entities.vargaCode) specialists.add('VARGA_SPECIALIST');
    else specialists.add('NATAL_SPECIALIST');
  }

  if (intents.includes('D9') && !specialists.has('D9_SPECIALIST')) {
    specialists.add('D9_SPECIALIST');
  }

  if (intents.includes('D10') && !specialists.has('D10_CAREER_SPECIALIST')) {
    specialists.add('D10_CAREER_SPECIALIST');
  }

  if (intents.includes('TRANSITS_FUTURE') || intents.includes('TRANSITS_CURRENT')) {
    specialists.add('TRANSIT_SPECIALIST');
  }

  if (intents.includes('DASHA') && !specialists.has('DASHA_SPECIALIST')) {
    specialists.add('DASHA_SPECIALIST');
  }

  if (intents.includes('YOGA')) {
    specialists.add('YOGA_SPECIALIST');
  }

  if (intents.includes('DOSHA')) {
    specialists.add('DOSHA_SPECIALIST');
  }

  if (intents.includes('JAIMINI')) {
    specialists.add('JAIMINI_SPECIALIST');
  }

  if (intents.includes('STRENGTH')) {
    specialists.add('STRENGTH_SPECIALIST');
  }

  if (intents.includes('REMEDY')) {
    specialists.add('REMEDY_SPECIALIST');
  }

  if (intents.includes('TIMING') || entities.isExactDateRequested || entities.timeframeDescription) {
    specialists.add('TIMING_SPECIALIST');
  }

  if (intents.includes('PLANETS') || intents.includes('NATAL_CHART')) {
    specialists.add('NATAL_SPECIALIST');
  }

  // Fallback
  if (specialists.size === 0) {
    specialists.add('GENERAL_ASTROLOGER');
  }

  return Array.from(specialists);
}
