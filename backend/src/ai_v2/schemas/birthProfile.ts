import { BirthProfile, VargaCode } from '../../../../shared/index.ts';

export type { BirthProfile };
export type BirthProfileInput = BirthProfile;

export interface ValidatedBirthProfile extends BirthProfile {
  name: string;
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second?: number;
  latitude: number;
  longitude: number;
  timezone: string;
  cityName?: string;
  gender?: 'male' | 'female' | 'other';
}

/**
 * Validates a birth profile object to ensure all required astronomical fields are present and in range.
 */
export function validateBirthProfile(profile: any): { valid: boolean; error?: string; data?: ValidatedBirthProfile } {
  if (!profile || typeof profile !== 'object') {
    return { valid: false, error: 'Birth profile must be a non-null object.' };
  }

  const { year, month, day, hour, minute, latitude, longitude, timezone } = profile;

  if (typeof year !== 'number' || year < 1000 || year > 3000) {
    return { valid: false, error: `Invalid birth year: ${year}. Must be between 1000 and 3000.` };
  }

  if (typeof month !== 'number' || month < 1 || month > 12) {
    return { valid: false, error: `Invalid birth month: ${month}. Must be between 1 and 12.` };
  }

  if (typeof day !== 'number' || day < 1 || day > 31) {
    return { valid: false, error: `Invalid birth day: ${day}. Must be between 1 and 31.` };
  }

  if (typeof hour !== 'number' || hour < 0 || hour > 23) {
    return { valid: false, error: `Invalid birth hour: ${hour}. Must be between 0 and 23.` };
  }

  if (typeof minute !== 'number' || minute < 0 || minute > 59) {
    return { valid: false, error: `Invalid birth minute: ${minute}. Must be between 0 and 59.` };
  }

  if (typeof latitude !== 'number' || latitude < -90 || latitude > 90) {
    return { valid: false, error: `Invalid latitude: ${latitude}. Must be between -90 and +90.` };
  }

  if (typeof longitude !== 'number' || longitude < -180 || longitude > 180) {
    return { valid: false, error: `Invalid longitude: ${longitude}. Must be between -180 and +180.` };
  }

  if (typeof timezone !== 'string' || !timezone.trim()) {
    return { valid: false, error: 'Timezone string (e.g. "Asia/Kolkata", "UTC") is required.' };
  }

  return {
    valid: true,
    data: {
      name: profile.name?.trim() || 'Native',
      year,
      month,
      day,
      hour,
      minute,
      second: typeof profile.second === 'number' ? profile.second : 0,
      latitude,
      longitude,
      timezone: timezone.trim(),
      cityName: profile.cityName?.trim() || undefined,
      gender: profile.gender || undefined,
    },
  };
}

export const VALID_VARGA_CODES: VargaCode[] = [
  'D1',
  'D2',
  'D3',
  'D4',
  'D7',
  'D9',
  'D10',
  'D12',
  'D16',
  'D20',
  'D24',
  'D27',
  'D30',
  'D40',
  'D45',
  'D60',
];
