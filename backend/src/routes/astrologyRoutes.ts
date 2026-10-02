import { Router, Request, Response } from 'express';
import {
  computeCanonicalChart,
  DEFAULT_BIRTH_PROFILE,
  BirthProfile,
} from '../../../shared/index.ts';

export const astrologyRouter = Router();

// Compute Chart API
astrologyRouter.post('/compute', (req: Request, res: Response) => {
  try {
    const profile: BirthProfile = req.body.profile || DEFAULT_BIRTH_PROFILE;
    const evalDate = req.body.evaluationDate ? new Date(req.body.evaluationDate) : new Date();
    const chart = computeCanonicalChart(profile, evalDate);
    res.json({ success: true, chart });
  } catch (error: any) {
    console.error('Computation error:', error);
    res.status(500).json({ success: false, error: error.message || 'Calculation error' });
  }
});

// Canonical Default Benchmark Profile API
astrologyRouter.get('/default', (_req: Request, res: Response) => {
  try {
    const chart = computeCanonicalChart(DEFAULT_BIRTH_PROFILE);
    res.json({
      success: true,
      profile: DEFAULT_BIRTH_PROFILE,
      chart,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
