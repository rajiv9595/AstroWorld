/**
 * ASTROWORLD — Root Server Bridge
 * Boots the modular full-stack backend server in backend/src/server.ts
 */

import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config();

import { startBackendServer } from './backend/src/server.ts';

startBackendServer();

export * from './backend/src/server.ts';
