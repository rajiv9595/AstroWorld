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

// CORS headers middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json({ limit: '10mb' }));

// Mount Modular API Routers
app.use('/api/auth', authRouter);
app.use('/api/user/charts', chartRouter);
app.use('/api/geo', geoRouter);
app.use('/api/ai-v2', aiV2Router);
app.use('/api/astrology', astrologyRouter);


// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
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

// Auto-start server
startBackendServer(PORT);


