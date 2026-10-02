/**
 * ASTROWORLD — Chart Persistence Client Service
 * Calls server-side proxy routes (/api/user/*) for secure persistence.
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

export const fetchUserCharts = async (userId: string): Promise<SavedKundliRecord[]> => {
  try {
    const res = await fetch(`/api/user/charts/${encodeURIComponent(userId)}`);
    const data = await res.json();
    if (data.success && Array.isArray(data.charts)) {
      localStorage.setItem(`astroworld_cached_charts_${userId}`, JSON.stringify(data.charts));
      return data.charts;
    }
  } catch (err) {
    console.warn('Network fetch charts error, checking local cache:', err);
  }

  try {
    const local = localStorage.getItem(`astroworld_cached_charts_${userId}`);
    return local ? JSON.parse(local) : [];
  } catch {
    return [];
  }
};

export const saveUserChart = async (
  userId: string,
  profile: BirthProfile,
  chartStyle: 'NORTH_INDIAN' | 'SOUTH_INDIAN' = 'NORTH_INDIAN'
): Promise<SavedKundliRecord> => {
  const payload = {
    userId,
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

  try {
    const res = await fetch('/api/user/charts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.success && data.chart) {
      const existing = await fetchUserCharts(userId);
      localStorage.setItem(
        `astroworld_cached_charts_${userId}`,
        JSON.stringify([data.chart, ...existing.filter((c) => c.id !== data.chart.id)])
      );
      return data.chart;
    }
    throw new Error(data.error || 'Failed to save chart');
  } catch (err: any) {
    console.error('Server save chart failed:', err);
    // Fallback local record
    const localRecord: SavedKundliRecord = {
      id: `chart_${Date.now()}`,
      userId,
      ...payload.chart,
      createdAt: new Date().toISOString(),
    };
    const existing = await fetchUserCharts(userId);
    localStorage.setItem(
      `astroworld_cached_charts_${userId}`,
      JSON.stringify([localRecord, ...existing.filter((c) => c.name !== profile.name)])
    );
    return localRecord;
  }
};

export const deleteUserChart = async (userId: string, chartId: string): Promise<boolean> => {
  try {
    const res = await fetch(`/api/user/charts/${encodeURIComponent(userId)}/${encodeURIComponent(chartId)}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    return Boolean(data.success);
  } catch {
    return false;
  }
};
