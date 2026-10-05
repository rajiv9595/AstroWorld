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
