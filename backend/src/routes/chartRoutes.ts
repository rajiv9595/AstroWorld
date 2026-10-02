import { Router, Request, Response } from 'express';
import { supabase } from '../services/supabaseService.ts';

export const chartRouter = Router();

// Fetch User Saved Charts
chartRouter.get('/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ success: false, error: 'UserId required' });
    }

    const { data, error } = await supabase
      .from('kundli_charts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Supabase Fetch Charts Error]:', error.message);
      return res.status(500).json({ success: false, error: error.message });
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
  } catch (err: any) {
    console.error('Fetch charts error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch charts' });
  }
});

// Save / Insert User Chart
chartRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { userId, chart } = req.body;
    if (!userId || !chart || !chart.name) {
      return res.status(400).json({ success: false, error: 'Valid chart payload and userId required' });
    }

    const { data, error } = await supabase
      .from('kundli_charts')
      .insert({
        user_id: userId,
        name: chart.name,
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

    if (error) {
      console.error('[Supabase Save Chart Error]:', error.message);
      return res.status(500).json({ success: false, error: error.message });
    }

    const savedChart = {
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
    };

    return res.json({ success: true, chart: savedChart });
  } catch (err: any) {
    console.error('Save chart error:', err);
    return res.status(500).json({ success: false, error: 'Failed to save chart' });
  }
});

// Delete User Chart
chartRouter.delete('/:userId/:chartId', async (req: Request, res: Response) => {
  try {
    const { userId, chartId } = req.params;
    if (!userId || !chartId) {
      return res.status(400).json({ success: false, error: 'userId and chartId required' });
    }

    const { error } = await supabase
      .from('kundli_charts')
      .delete()
      .eq('id', chartId)
      .eq('user_id', userId);

    if (error) {
      console.error('[Supabase Delete Chart Error]:', error.message);
      return res.status(500).json({ success: false, error: error.message });
    }

    return res.json({ success: true });
  } catch (err: any) {
    console.error('Delete chart error:', err);
    return res.status(500).json({ success: false, error: 'Failed to delete chart' });
  }
});
