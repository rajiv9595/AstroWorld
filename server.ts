/**
 * ASTROWORLD — Root Server Bridge
 * Boots the modular full-stack backend server in backend/src/server.ts
 */

import { startBackendServer } from './backend/src/server.ts';

startBackendServer();

export * from './backend/src/server.ts';
