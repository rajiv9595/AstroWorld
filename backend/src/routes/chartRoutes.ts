import { Router, Request, Response } from 'express';
import { supabase } from '../services/supabaseService.ts';
import { authenticateRequest, getAuthenticatedUser } from '../middleware/authMiddleware.ts';

export const chartRouter = Router();

chartRouter.use(authenticateRequest);

// Fetch authenticated user's saved charts
chartRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { userId } = getAuthenticatedUser(req);

    const { data, error } = await supabase
      .from('kundli_charts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Supabase Fetch Charts Error]:', error.message);
      return res.status(500).json({ success: false, error: 'Failed to fetch saved charts.' });
    }

    const charts = (data || []).map((r: any) => ({
      id: r.id,
      userId: r.user_id,
      name: r.name,
      year: r.year,
      month: r.month,
      day: r.day,
      hour: r.hour,
      minute: r.minute,
      second: r.second ?? 0,
      latitude: Number(r.latitude),
      longitude: Number(r.longitude),
      timezone: r.timezone,
      cityName: r.city_name,
      chartStyle: r.chart_style || 'NORTH_INDIAN',
      createdAt: r.created_at,
    }));

    return res.json({ success: true, charts });
  } catch (err) {
    console.error('[Charts GET] unexpected error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch saved charts.' });
  }
});

// Save authenticated user's chart
chartRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { userId } = getAuthenticatedUser(req);
    const chart = req.body?.chart;

    if (!chart || typeof chart !== 'object' || !String(chart.name || '').trim()) {
      return res.status(400).json({ success: false, error: 'A valid chart payload is required.' });
    }

    const { data, error } = await supabase
      .from('kundli_charts')
      .insert({
        user_id: userId,
        name: String(chart.name).trim(),
        year: chart.year,
        month: chart.month,
        day: chart.day,
        hour: chart.hour,
        minute: chart.minute,
        second: chart.second ?? 0,
        latitude: chart.latitude,
        longitude: chart.longitude,
        timezone: chart.timezone || 'Asia/Kolkata',
        city_name: chart.cityName || 'India',
        chart_style: chart.chartStyle || 'NORTH_INDIAN',
      })
      .select()
      .single();

    if (error || !data) {
      console.error('[Supabase Save Chart Error]:', error?.message);
      return res.status(500).json({ success: false, error: 'Failed to save chart.' });
    }

    return res.status(201).json({
      success: true,
      chart: {
        id: data.id,
        userId: data.user_id,
        name: data.name,
        year: data.year,
        month: data.month,
        day: data.day,
        hour: data.hour,
        minute: data.minute,
        second: data.second ?? 0,
        latitude: Number(data.latitude),
        longitude: Number(data.longitude),
        timezone: data.timezone,
        cityName: data.city_name,
        chartStyle: data.chart_style,
        createdAt: data.created_at,
      },
    });
  } catch (err) {
    console.error('[Charts POST] unexpected error:', err);
    return res.status(500).json({ success: false, error: 'Failed to save chart.' });
  }
});

// Get single authenticated user's chart
chartRouter.get('/:chartId', async (req: Request, res: Response) => {
  try {
    const { userId } = getAuthenticatedUser(req);
    const chartId = req.params.chartId;

    const { data, error } = await supabase
      .from('kundli_charts')
      .select('*')
      .eq('id', chartId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('[Supabase Get Single Chart Error]:', error.message);
      return res.status(500).json({ success: false, error: 'Failed to fetch chart.' });
    }

    if (!data) {
      return res.status(404).json({ success: false, error: 'Saved chart not found.' });
    }

    return res.json({
      success: true,
      chart: {
        id: data.id,
        userId: data.user_id,
        name: data.name,
        year: data.year,
        month: data.month,
        day: data.day,
        hour: data.hour,
        minute: data.minute,
        second: data.second ?? 0,
        latitude: Number(data.latitude),
        longitude: Number(data.longitude),
        timezone: data.timezone,
        cityName: data.city_name,
        gender: data.gender || 'male',
        notes: data.notes,
        chartStyle: data.chart_style || 'NORTH_INDIAN',
        isPrimary: Boolean(data.is_primary),
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
    });
  } catch (err) {
    console.error('[Charts GET :id] unexpected error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch chart.' });
  }
});

// Update authenticated user's chart
chartRouter.put('/:chartId', async (req: Request, res: Response) => {
  try {
    const { userId } = getAuthenticatedUser(req);
    const chartId = req.params.chartId;
    const updates = req.body || {};

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    if (updates.name !== undefined) updatePayload.name = String(updates.name).trim();
    if (updates.year !== undefined) updatePayload.year = Number(updates.year);
    if (updates.month !== undefined) updatePayload.month = Number(updates.month);
    if (updates.day !== undefined) updatePayload.day = Number(updates.day);
    if (updates.hour !== undefined) updatePayload.hour = Number(updates.hour);
    if (updates.minute !== undefined) updatePayload.minute = Number(updates.minute);
    if (updates.second !== undefined) updatePayload.second = Number(updates.second);
    if (updates.latitude !== undefined) updatePayload.latitude = Number(updates.latitude);
    if (updates.longitude !== undefined) updatePayload.longitude = Number(updates.longitude);
    if (updates.timezone !== undefined) updatePayload.timezone = String(updates.timezone);
    if (updates.cityName !== undefined) updatePayload.city_name = String(updates.cityName);
    if (updates.notes !== undefined) updatePayload.notes = String(updates.notes);
    if (updates.gender !== undefined) updatePayload.gender = String(updates.gender);
    if (updates.chartStyle !== undefined) updatePayload.chart_style = String(updates.chartStyle);

    const { data, error } = await supabase
      .from('kundli_charts')
      .update(updatePayload)
      .eq('id', chartId)
      .eq('user_id', userId)
      .select()
      .maybeSingle();

    if (error) {
      console.error('[Supabase Update Chart Error]:', error.message);
      return res.status(500).json({ success: false, error: 'Failed to update chart.' });
    }

    if (!data) {
      return res.status(404).json({ success: false, error: 'Saved chart not found.' });
    }

    return res.json({ success: true, chart: data });
  } catch (err) {
    console.error('[Charts PUT] unexpected error:', err);
    return res.status(500).json({ success: false, error: 'Failed to update chart.' });
  }
});

// Set chart as primary for authenticated user
chartRouter.put('/:chartId/primary', async (req: Request, res: Response) => {
  try {
    const { userId } = getAuthenticatedUser(req);
    const chartId = req.params.chartId;

    // Reset all existing charts for this user to is_primary = false
    await supabase
      .from('kundli_charts')
      .update({ is_primary: false, updated_at: new Date().toISOString() })
      .eq('user_id', userId);

    // Set the requested chart to is_primary = true
    const { data, error } = await supabase
      .from('kundli_charts')
      .update({ is_primary: true, updated_at: new Date().toISOString() })
      .eq('id', chartId)
      .eq('user_id', userId)
      .select()
      .maybeSingle();

    if (error || !data) {
      console.error('[Supabase Set Primary Chart Error]:', error?.message);
      return res.status(500).json({ success: false, error: 'Failed to set chart as primary.' });
    }

    return res.json({ success: true, chart: data });
  } catch (err) {
    console.error('[Charts PUT primary] unexpected error:', err);
    return res.status(500).json({ success: false, error: 'Failed to set primary chart.' });
  }
});

// Delete authenticated user's chart
chartRouter.delete('/:chartId', async (req: Request, res: Response) => {
  try {
    const { userId } = getAuthenticatedUser(req);
    const chartId = req.params.chartId;

    if (!chartId) {
      return res.status(400).json({ success: false, error: 'chartId is required.' });
    }

    const { data, error } = await supabase
      .from('kundli_charts')
      .delete()
      .eq('id', chartId)
      .eq('user_id', userId)
      .select('id')
      .maybeSingle();

    if (error) {
      console.error('[Supabase Delete Chart Error]:', error.message);
      return res.status(500).json({ success: false, error: 'Failed to delete chart.' });
    }

    if (!data) {
      return res.status(404).json({ success: false, error: 'Saved chart not found.' });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error('[Charts DELETE] unexpected error:', err);
    return res.status(500).json({ success: false, error: 'Failed to delete chart.' });
  }
});
