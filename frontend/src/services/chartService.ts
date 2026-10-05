/**
 * ASTROWORLD — Chart Persistence Client Service
 *
 * The authenticated user is established exclusively by the server session.
 * No user id is accepted from the browser as an authorization credential.
 */

import { BirthProfile } from '../engine/types.ts';

export interface SavedKundliRecord {
  id: string;
  userId: string;
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
  chartStyle?: 'NORTH_INDIAN' | 'SOUTH_INDIAN';
  createdAt: string;
}

async function parseResponse(res: Response): Promise<any> {
  return res.json().catch(() => null);
}

export const fetchUserCharts = async (_legacyUserId?: string): Promise<SavedKundliRecord[]> => {
  try {
    const res = await fetch('/api/user/charts', {
      method: 'GET',
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });

    const data = await parseResponse(res);
    if (!res.ok || !data?.success || !Array.isArray(data.charts)) {
      if (res.status === 401) return [];
      throw new Error(data?.error || 'Failed to fetch saved charts.');
    }

    return data.charts;
  } catch (err) {
    console.warn('[Charts] Unable to load saved charts:', err);
    return [];
  }
};

export const saveUserChart = async (
  _legacyUserId: string | undefined,
  profile: BirthProfile,
  chartStyle: 'NORTH_INDIAN' | 'SOUTH_INDIAN' = 'NORTH_INDIAN',
): Promise<SavedKundliRecord> => {
  const payload = {
    chart: {
      name: profile.name,
      year: profile.year,
      month: profile.month,
      day: profile.day,
      hour: profile.hour,
      minute: profile.minute,
      second: profile.second ?? 0,
      latitude: profile.latitude,
      longitude: profile.longitude,
      timezone: profile.timezone,
      cityName: profile.cityName || 'India',
      chartStyle,
    },
  };

  const res = await fetch('/api/user/charts', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await parseResponse(res);
  if (!res.ok || !data?.success || !data.chart) {
    throw new Error(data?.error || ('Unable to save chart (HTTP ' + res.status + ').'));
  }

  return data.chart;
};

export const deleteUserChart = async (_legacyUserId: string | undefined, chartId: string): Promise<boolean> => {
  try {
    const res = await fetch('/api/user/charts/' + encodeURIComponent(chartId), {
      method: 'DELETE',
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });

    return res.ok;
  } catch {
    return false;
  }
};
