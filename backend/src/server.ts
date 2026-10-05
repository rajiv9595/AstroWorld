/**
 * ASTROWORLD — Backend API Server
 * Production-ready Express API with isolated routes for Auth, Charts, Geocoding, AI, and Astrology.
 */

import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { authRouter } from './routes/authRoutes.ts';
import { chartRouter } from './routes/chartRoutes.ts';
import { geoRouter } from './routes/geoRoutes.ts';
import { aiV2Router } from './ai_v2/routes/aiV2Routes.ts';
import { astrologyRouter } from './routes/astrologyRoutes.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();
const PORT = Number(process.env.PORT) || 3000;
app.set('trust proxy', 1);

const configuredOrigins = (process.env.CORS_ORIGINS || process.env.PUBLIC_WEB_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = new Set([
  ...configuredOrigins,
  ...(process.env.NODE_ENV === 'production'
    ? []
    : ['http://localhost:5173', 'http://127.0.0.1:5173']),
]);

// Production Security Headers & CORS Middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const unsafeMethod = !['GET', 'HEAD', 'OPTIONS'].includes(req.method.toUpperCase());

  // CORS controls browser reads; Origin enforcement also blocks cross-site
  // state-changing requests that could otherwise ride cookie credentials.
  if (origin && unsafeMethod && !allowedOrigins.has(origin)) {
    res.status(403).json({ success: false, error: 'Origin not allowed.' });
    return;
  }
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'SAMEORIGIN');
  res.header('X-XSS-Protection', '1; mode=block');
  res.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  if (process.env.NODE_ENV === 'staging' || process.env.NODE_ENV === 'production') {
    res.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  const origin = req.headers.origin;
  if (origin && allowedOrigins.has(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Vary', 'Origin');
  } else if (origin && req.method === 'OPTIONS') {
    res.status(403).json({ success: false, error: 'Origin not allowed.' });
    return;
  }

  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, Content-Length, X-Requested-With, X-Idempotency-Key'
  );
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
  } else {
    next();
  }
});

app.use(express.json({ limit: '1mb' }));

// Mount Modular API Routers
app.use('/api/auth', authRouter);
app.use('/api/user/charts', chartRouter);
app.use('/api/geo', geoRouter);
app.use('/api/ai-v2', aiV2Router);
app.use('/api/astrology', astrologyRouter);


import { HealthCheckService } from './ai_v2/production/healthCheck.ts';

// Health check endpoints
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.get('/api/health/live', (_req: Request, res: Response) => {
  res.json(HealthCheckService.checkLiveness());
});

app.get('/api/health/ready', async (_req: Request, res: Response) => {
  const readiness = await HealthCheckService.checkReadiness();
  const statusCode = readiness.status === 'ready' ? 200 : 503;
  res.status(statusCode).json(readiness);
});

export async function startBackendServer(port: number = PORT) {
  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`[ASTROWORLD BACKEND] Server running live on port ${port}`);
  });

  if (process.env.NODE_ENV !== 'production') {
    try {
      const frontendDir = path.resolve(__dirname, '../../frontend');
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        root: frontendDir,
        configFile: path.resolve(frontendDir, 'vite.config.ts'),
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
      console.log('[ASTROWORLD FRONTEND] Vite development middleware attached.');
    } catch (err: any) {
      console.log('[Backend Server] Running API standalone mode:', err?.message || err);
    }
  } else {
    const distPath = path.resolve(__dirname, '../../frontend/dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  return server;
}

// Start only when this module is the direct process entrypoint.
const invokedScript = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (invokedScript === __filename) {
  startBackendServer(PORT).catch((error) => {
    console.error('[ASTROWORLD BACKEND] Failed to start:', error);
    process.exitCode = 1;
  });
}


