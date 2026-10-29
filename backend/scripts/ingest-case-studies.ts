/**
 * ASTROWORLD — Batch Case Ingestion CLI & Corpus Ingestion Pipeline
 * 
 * Ingests external datasets (JSON/CSV) of verified astrological case studies, computes
 * exact ephemeris baselines, derives continuous 59-dimensional fingerprint vectors,
 * and bulk-indexes them into the AstroWorld Case Study Bank.
 */

import * as fs from 'fs';
import * as path from 'path';
import { computeCanonicalChartWithConfiguredEphemeris } from '../src/services/ephemeris/providerRuntime.ts';
import { generateChartFingerprintVector } from '../src/ai/cases/chartFingerprint.ts';
import { globalCaseStudyRepository } from '../src/ai/cases/caseStudyRepository.ts';
import { AstrologicalCaseStudyRecord, CaseDomain } from '../src/ai/cases/caseStudyTypes.ts';

export interface RawCaseStudyInput {
  id?: string;
  slug?: string;
  title: string;
  domain: CaseDomain;
  subDomain?: string;
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour: number;
  birthMinute: number;
  birthSecond?: number;
  birthLatitude: number;
  birthLongitude: number;
  birthTimezone: string;
  cityName?: string;
  eventTitle: string;
  eventDateIso: string;
  historicalOutcome: string;
  shastricRootCause: string;
  provenanceReference: string;
  authenticityGrade?: 'A' | 'AA' | 'B' | 'C';
}

/**
 * Ingest a raw case study file or array into the production case bank.
 */
export async function ingestCaseStudies(
  inputs: RawCaseStudyInput[]
): Promise<{ ingestedCount: number; errors: string[] }> {
  const recordsToIngest: AstrologicalCaseStudyRecord[] = [];
  const errors: string[] = [];

  for (let idx = 0; idx < inputs.length; idx++) {
    const raw = inputs[idx];
    const caseId = raw.id || `case_${raw.domain}_${Date.now()}_${idx + 1}`;
    const slug = raw.slug || `${raw.domain}-${caseId}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    try {
      if (!raw.title || !raw.domain || !raw.eventDateIso || !raw.birthYear || !raw.birthLatitude) {
        throw new Error(`Incomplete mandatory fields in case #${idx + 1}`);
      }

      const birthDate = new Date(Date.UTC(raw.birthYear, raw.birthMonth - 1, raw.birthDay, raw.birthHour, raw.birthMinute));
      const eventDate = new Date(raw.eventDateIso);
      const eventAge = Number(((eventDate.getTime() - birthDate.getTime()) / (365.25 * 86400000)).toFixed(2));

      // Calculate Canonical Astronomical Chart via Swiss/Astronomy Ephemeris
      const profile = {
        year: raw.birthYear,
        month: raw.birthMonth,
        day: raw.birthDay,
        hour: raw.birthHour,
        minute: raw.birthMinute,
        second: raw.birthSecond || 0,
        latitude: raw.birthLatitude,
        longitude: raw.birthLongitude,
        timezone: raw.birthTimezone,
      };

      const chart = await computeCanonicalChartWithConfiguredEphemeris(profile as any, eventDate);
      const fp = generateChartFingerprintVector(chart);

      const record: AstrologicalCaseStudyRecord = {
        id: caseId,
        slug,
        title: raw.title,
        domain: raw.domain,
        subDomain: raw.subDomain,
        birthYear: raw.birthYear,
        birthMonth: raw.birthMonth,
        birthDay: raw.birthDay,
        birthHour: raw.birthHour,
        birthMinute: raw.birthMinute,
        birthSecond: raw.birthSecond || 0,
        birthLatitude: raw.birthLatitude,
        birthLongitude: raw.birthLongitude,
        birthTimezone: raw.birthTimezone,
        cityName: raw.cityName,
        eventTitle: raw.eventTitle,
        eventDateIso: raw.eventDateIso,
        eventAge,
        historicalOutcome: raw.historicalOutcome,
        shastricRootCause: raw.shastricRootCause,
        provenanceReference: raw.provenanceReference,
        authenticityGrade: raw.authenticityGrade || 'A',
        chartFingerprint: fp,
        embeddingVector: fp.embeddingVector,
        verificationStatus: 'verified',
      };

      recordsToIngest.push(record);
    } catch (err: any) {
      errors.push(`[Case ${caseId}] Error: ${err.message}`);
    }
  }

  const result = await globalCaseStudyRepository.ingestBatch(recordsToIngest);
  return {
    ingestedCount: result.ingested,
    errors: [...errors, ...result.errors],
  };
}

