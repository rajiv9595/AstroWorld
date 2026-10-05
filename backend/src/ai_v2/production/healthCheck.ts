/**
 * ASTROWORLD AI V2 — Health & Readiness Service
 * Distinct liveness and readiness probes for zero-downtime orchestration.
 */

import { ReadinessCheckResult } from './productionTypes.ts';
import { isSupabaseConfigured } from '../../services/supabaseService.ts';

export class HealthCheckService {
  public static checkLiveness(): { status: 'ok'; timestamp: string; uptimeSeconds: number } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
    };
  }

  public static async checkReadiness(dependencies: {
    hasGeminiKey?: boolean;
    isMemoryStoreConnected?: boolean;
    isStateStoreConnected?: boolean;
  } = {}): Promise<ReadinessCheckResult> {
    const geminiConfigured = dependencies.hasGeminiKey !== undefined
      ? dependencies.hasGeminiKey
      : Boolean(process.env.GEMINI_API_KEY);

    const astrologyEngineOperational = true;
    const databaseConfigured = isSupabaseConfigured;
    const corsConfigured =
      process.env.NODE_ENV !== 'production' ||
      Boolean((process.env.CORS_ORIGINS || process.env.PUBLIC_WEB_ORIGIN || '').trim());
    const memorySubsystemOperational = dependencies.isMemoryStoreConnected !== undefined
      ? dependencies.isMemoryStoreConnected
      : true;
    const conversationStateOperational = dependencies.isStateStoreConnected !== undefined
      ? dependencies.isStateStoreConnected
      : true;

    const allReady =
      astrologyEngineOperational &&
      databaseConfigured &&
      corsConfigured &&
      memorySubsystemOperational &&
      conversationStateOperational;

    return {
      status: allReady ? 'ready' : 'degraded',
      checks: {
        geminiConfigured,
        astrologyEngineOperational,
        databaseConfigured,
        corsConfigured,
        memorySubsystemOperational,
        conversationStateOperational,
      },
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: '2.0.0-production',
    };
  }
}
