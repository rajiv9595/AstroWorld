/**
 * ASTROWORLD — Backend process entrypoint.
 * Keeps backend/src/server.ts side-effect free so it can be imported safely.
 */

import { startBackendServer } from './server.ts';

startBackendServer().catch((error) => {
  console.error('[ASTROWORLD BACKEND] Failed to start:', error);
  process.exitCode = 1;
});
