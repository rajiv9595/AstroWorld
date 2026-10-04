/**
 * ASTROWORLD AI V2 — Phase 8B Production Alerting & Anomaly Detection Engine
 * Defines actionable production alert thresholds, evaluates metrics snapshots,
 * and emits structured alert notifications without generating noise for standard user activity.
 */

import { MetricsSnapshot } from './productionMetrics.ts';

export type AlertSeverity = 'P0_CRITICAL' | 'P1_HIGH' | 'P2_WARNING';

export type AlertRuleId =
  | 'ELEVATED_5XX_RATE'
  | 'GEMINI_FAILURE_SPIKE'
  | 'GEMINI_LATENCY_SPIKE'
  | 'DATABASE_CONNECTIVITY_FAILURE'
  | 'DATABASE_LATENCY_SPIKE'
  | 'MEMORY_SUBSYSTEM_FAILURE'
  | 'AUTH_FAILURE_SPIKE'
  | 'RATE_LIMIT_SPIKE'
  | 'READINESS_PROBE_FAILURE'
  | 'CROSS_USER_IDOR_SPIKE';

export interface AlertDefinition {
  ruleId: AlertRuleId;
  name: string;
  severity: AlertSeverity;
  thresholdDescription: string;
  remediationAction: string;
}

export interface ActiveAlert {
  ruleId: AlertRuleId;
  name: string;
  severity: AlertSeverity;
  currentValue: string | number;
  threshold: string | number;
  triggeredAt: string;
  remediationAction: string;
}

export const ALERT_RULES: Record<AlertRuleId, AlertDefinition> = {
  ELEVATED_5XX_RATE: {
    ruleId: 'ELEVATED_5XX_RATE',
    name: 'Elevated Internal Server 5xx Rate',
    severity: 'P0_CRITICAL',
    thresholdDescription: '5xx Error Rate > 1.0% over 5-minute rolling window',
    remediationAction: 'Inspect server error logs, check upstream database & Gemini health, trigger auto-rollback if regression detected.',
  },
  GEMINI_FAILURE_SPIKE: {
    ruleId: 'GEMINI_FAILURE_SPIKE',
    name: 'Gemini Provider Outage Spike',
    severity: 'P1_HIGH',
    thresholdDescription: 'Gemini Provider Error Rate > 5.0% over 5-minute window',
    remediationAction: 'Verify API quotas, activate deterministic narration failsafe mode, monitor Google status dashboard.',
  },
  GEMINI_LATENCY_SPIKE: {
    ruleId: 'GEMINI_LATENCY_SPIKE',
    name: 'Gemini Provider Latency Degradation',
    severity: 'P2_WARNING',
    thresholdDescription: 'Gemini p95 latency > 5000ms over 10 consecutive requests',
    remediationAction: 'Check regional edge routing, scale timeout budgets, switch secondary model alias if persistent.',
  },
  DATABASE_CONNECTIVITY_FAILURE: {
    ruleId: 'DATABASE_CONNECTIVITY_FAILURE',
    name: 'PostgreSQL Database Unreachable',
    severity: 'P0_CRITICAL',
    thresholdDescription: 'Readiness probe fails DB ping or connection pool exhausted',
    remediationAction: 'Check Cloud SQL instance state, verify SSL certificates, recycle pool connections, trigger failover.',
  },
  DATABASE_LATENCY_SPIKE: {
    ruleId: 'DATABASE_LATENCY_SPIKE',
    name: 'PostgreSQL Query Latency Spike',
    severity: 'P2_WARNING',
    thresholdDescription: 'Database query p95 latency > 500ms',
    remediationAction: 'Check missing indexes on conversations/memories tables, examine connection saturation, optimize query plans.',
  },
  MEMORY_SUBSYSTEM_FAILURE: {
    ruleId: 'MEMORY_SUBSYSTEM_FAILURE',
    name: 'Persistent Memory Subsystem Error',
    severity: 'P1_HIGH',
    thresholdDescription: 'Memory write gate or repository errors > 0 in window',
    remediationAction: 'Verify persistent memory table constraints, validate memory validation states, isolate memory cache.',
  },
  AUTH_FAILURE_SPIKE: {
    ruleId: 'AUTH_FAILURE_SPIKE',
    name: 'Authentication Failure Spike',
    severity: 'P1_HIGH',
    thresholdDescription: 'Unauthenticated 401 errors > 10 per minute',
    remediationAction: 'Inspect IP sources for credential stuffing, verify JWT secret rotation validity, enable IP rate limiting.',
  },
  RATE_LIMIT_SPIKE: {
    ruleId: 'RATE_LIMIT_SPIKE',
    name: 'Rate Limit 429 Throttle Spike',
    severity: 'P2_WARNING',
    thresholdDescription: 'Rate limited requests > 50 per minute',
    remediationAction: 'Review rate limit tier configuration, check for abusive bots or client looping behavior.',
  },
  READINESS_PROBE_FAILURE: {
    ruleId: 'READINESS_PROBE_FAILURE',
    name: 'Application Readiness Probe Degraded',
    severity: 'P0_CRITICAL',
    thresholdDescription: 'Readiness probe returns status !== "ready"',
    remediationAction: 'Route ingress traffic away from degraded instance, inspect missing dependencies, restart container.',
  },
  CROSS_USER_IDOR_SPIKE: {
    ruleId: 'CROSS_USER_IDOR_SPIKE',
    name: 'Cross-User Authorization (IDOR) Anomaly',
    severity: 'P0_CRITICAL',
    thresholdDescription: 'Conversation ownership violation 403 errors > 3 in 5 minutes',
    remediationAction: 'Investigate potential security breach attempt, isolate offending session IDs, audit conversation access logs.',
  },
};

export interface AlertEvaluationContext {
  snapshot: MetricsSnapshot;
  isDbConnected: boolean;
  isReadinessHealthy: boolean;
  dbLatencyP95Ms?: number;
  authFailuresLastMin?: number;
  idorFailuresLastMin?: number;
}

export class AlertManager {
  private static instance: AlertManager;
  private activeAlerts: Map<AlertRuleId, ActiveAlert> = new Map();

  public static getInstance(): AlertManager {
    if (!this.instance) {
      this.instance = new AlertManager();
    }
    return this.instance;
  }

  /**
   * Evaluates current system context against all alert definitions.
   */
  public evaluate(context: AlertEvaluationContext): ActiveAlert[] {
    const triggered: ActiveAlert[] = [];
    const snap = context.snapshot;
    const now = new Date().toISOString();

    // 1. Elevated 5xx Rate (> 1.0% with at least 20 total requests)
    if (snap.totalRequests >= 20 && snap.errorRate > 0.01) {
      triggered.push({
        ruleId: 'ELEVATED_5XX_RATE',
        name: ALERT_RULES.ELEVATED_5XX_RATE.name,
        severity: ALERT_RULES.ELEVATED_5XX_RATE.severity,
        currentValue: `${(snap.errorRate * 100).toFixed(2)}%`,
        threshold: '1.0%',
        triggeredAt: now,
        remediationAction: ALERT_RULES.ELEVATED_5XX_RATE.remediationAction,
      });
    }

    // 2. Gemini Failure Spike (fallbacks > 5% of total requests)
    if (snap.totalRequests >= 20 && snap.counters.fallbacks / snap.totalRequests > 0.05) {
      triggered.push({
        ruleId: 'GEMINI_FAILURE_SPIKE',
        name: ALERT_RULES.GEMINI_FAILURE_SPIKE.name,
        severity: ALERT_RULES.GEMINI_FAILURE_SPIKE.severity,
        currentValue: `${((snap.counters.fallbacks / snap.totalRequests) * 100).toFixed(2)}%`,
        threshold: '5.0%',
        triggeredAt: now,
        remediationAction: ALERT_RULES.GEMINI_FAILURE_SPIKE.remediationAction,
      });
    }

    // 3. Gemini Latency Spike (> 5000ms p95)
    if (snap.latencies.geminiMs.p95 > 5000) {
      triggered.push({
        ruleId: 'GEMINI_LATENCY_SPIKE',
        name: ALERT_RULES.GEMINI_LATENCY_SPIKE.name,
        severity: ALERT_RULES.GEMINI_LATENCY_SPIKE.severity,
        currentValue: `${snap.latencies.geminiMs.p95}ms`,
        threshold: '5000ms',
        triggeredAt: now,
        remediationAction: ALERT_RULES.GEMINI_LATENCY_SPIKE.remediationAction,
      });
    }

    // 4. Database Connectivity Failure
    if (!context.isDbConnected) {
      triggered.push({
        ruleId: 'DATABASE_CONNECTIVITY_FAILURE',
        name: ALERT_RULES.DATABASE_CONNECTIVITY_FAILURE.name,
        severity: ALERT_RULES.DATABASE_CONNECTIVITY_FAILURE.severity,
        currentValue: 'DISCONNECTED',
        threshold: 'CONNECTED',
        triggeredAt: now,
        remediationAction: ALERT_RULES.DATABASE_CONNECTIVITY_FAILURE.remediationAction,
      });
    }

    // 5. Database Latency Spike (> 500ms)
    if (context.dbLatencyP95Ms !== undefined && context.dbLatencyP95Ms > 500) {
      triggered.push({
        ruleId: 'DATABASE_LATENCY_SPIKE',
        name: ALERT_RULES.DATABASE_LATENCY_SPIKE.name,
        severity: ALERT_RULES.DATABASE_LATENCY_SPIKE.severity,
        currentValue: `${context.dbLatencyP95Ms}ms`,
        threshold: '500ms',
        triggeredAt: now,
        remediationAction: ALERT_RULES.DATABASE_LATENCY_SPIKE.remediationAction,
      });
    }

    // 6. Readiness Probe Failure
    if (!context.isReadinessHealthy) {
      triggered.push({
        ruleId: 'READINESS_PROBE_FAILURE',
        name: ALERT_RULES.READINESS_PROBE_FAILURE.name,
        severity: ALERT_RULES.READINESS_PROBE_FAILURE.severity,
        currentValue: 'UNREADY',
        threshold: 'READY',
        triggeredAt: now,
        remediationAction: ALERT_RULES.READINESS_PROBE_FAILURE.remediationAction,
      });
    }

    // 7. Auth Failure Spike (> 10/min)
    if (context.authFailuresLastMin !== undefined && context.authFailuresLastMin > 10) {
      triggered.push({
        ruleId: 'AUTH_FAILURE_SPIKE',
        name: ALERT_RULES.AUTH_FAILURE_SPIKE.name,
        severity: ALERT_RULES.AUTH_FAILURE_SPIKE.severity,
        currentValue: `${context.authFailuresLastMin}/min`,
        threshold: '10/min',
        triggeredAt: now,
        remediationAction: ALERT_RULES.AUTH_FAILURE_SPIKE.remediationAction,
      });
    }

    // 8. IDOR Spike (> 3 in window)
    if (context.idorFailuresLastMin !== undefined && context.idorFailuresLastMin >= 3) {
      triggered.push({
        ruleId: 'CROSS_USER_IDOR_SPIKE',
        name: ALERT_RULES.CROSS_USER_IDOR_SPIKE.name,
        severity: ALERT_RULES.CROSS_USER_IDOR_SPIKE.severity,
        currentValue: `${context.idorFailuresLastMin} violations`,
        threshold: '3 violations',
        triggeredAt: now,
        remediationAction: ALERT_RULES.CROSS_USER_IDOR_SPIKE.remediationAction,
      });
    }

    // 9. Rate Limit Spike (> 50 rate limit events)
    if (snap.counters.rateLimits > 50) {
      triggered.push({
        ruleId: 'RATE_LIMIT_SPIKE',
        name: ALERT_RULES.RATE_LIMIT_SPIKE.name,
        severity: ALERT_RULES.RATE_LIMIT_SPIKE.severity,
        currentValue: `${snap.counters.rateLimits} throttles`,
        threshold: '50 throttles',
        triggeredAt: now,
        remediationAction: ALERT_RULES.RATE_LIMIT_SPIKE.remediationAction,
      });
    }

    this.activeAlerts.clear();
    for (const a of triggered) {
      this.activeAlerts.set(a.ruleId, a);
    }

    return triggered;
  }

  public getActiveAlerts(): ActiveAlert[] {
    return Array.from(this.activeAlerts.values());
  }

  public clear(): void {
    this.activeAlerts.clear();
  }
}
