/**
 * ASTROWORLD AI V2 — Production Observability Metrics
 * Tracks consultation request rates, latency percentiles (p50, p95, p99),
 * component breakdown latencies, retries, and failure rates.
 */

export interface MetricsSnapshot {
  timestamp: string;
  uptimeSeconds: number;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  errorRate: number;
  latencies: {
    totalMs: { p50: number; p95: number; p99: number; avg: number; max: number };
    geminiMs: { p50: number; p95: number; p99: number; avg: number };
    toolsMs: { p50: number; p95: number; p99: number; avg: number };
    memoryMs: { p50: number; p95: number; p99: number; avg: number };
  };
  counters: {
    retries: number;
    rateLimits: number;
    timeouts: number;
    fallbacks: number;
    repairs: number;
    idempotentReplays: number;
    validationFailures: number;
  };
}

export class ProductionMetrics {
  private static instance: ProductionMetrics;
  private startTime = Date.now();

  private totalRequests = 0;
  private successfulRequests = 0;
  private failedRequests = 0;

  private totalLatencies: number[] = [];
  private geminiLatencies: number[] = [];
  private toolsLatencies: number[] = [];
  private memoryLatencies: number[] = [];

  private retries = 0;
  private rateLimits = 0;
  private timeouts = 0;
  private fallbacks = 0;
  private repairs = 0;
  private idempotentReplays = 0;
  private validationFailures = 0;

  private readonly maxSamples = 2000;

  public static getInstance(): ProductionMetrics {
    if (!this.instance) {
      this.instance = new ProductionMetrics();
    }
    return this.instance;
  }

  public recordRequest(success: boolean, durationMs: number) {
    this.totalRequests++;
    if (success) {
      this.successfulRequests++;
    } else {
      this.failedRequests++;
    }
    this.recordSample(this.totalLatencies, durationMs);
  }

  public recordStageLatency(stage: 'gemini' | 'tools' | 'memory', durationMs: number) {
    if (stage === 'gemini') this.recordSample(this.geminiLatencies, durationMs);
    else if (stage === 'tools') this.recordSample(this.toolsLatencies, durationMs);
    else if (stage === 'memory') this.recordSample(this.memoryLatencies, durationMs);
  }

  public recordCounter(counter: 'retries' | 'rateLimits' | 'timeouts' | 'fallbacks' | 'repairs' | 'idempotentReplays' | 'validationFailures') {
    this[counter]++;
  }

  private recordSample(array: number[], val: number) {
    array.push(val);
    if (array.length > this.maxSamples) {
      array.shift();
    }
  }

  private calculatePercentiles(samples: number[]) {
    if (samples.length === 0) {
      return { p50: 0, p95: 0, p99: 0, avg: 0, max: 0 };
    }
    const sorted = [...samples].sort((a, b) => a - b);
    const p50 = sorted[Math.floor(sorted.length * 0.5)];
    const p95 = sorted[Math.floor(sorted.length * 0.95)] || sorted[sorted.length - 1];
    const p99 = sorted[Math.floor(sorted.length * 0.99)] || sorted[sorted.length - 1];
    const avg = Number((sorted.reduce((a, b) => a + b, 0) / sorted.length).toFixed(2));
    const max = sorted[sorted.length - 1];
    return { p50, p95, p99, avg, max };
  }

  public getSnapshot(): MetricsSnapshot {
    const totalMs = this.calculatePercentiles(this.totalLatencies);
    const geminiMs = this.calculatePercentiles(this.geminiLatencies);
    const toolsMs = this.calculatePercentiles(this.toolsLatencies);
    const memoryMs = this.calculatePercentiles(this.memoryLatencies);

    return {
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
      totalRequests: this.totalRequests,
      successfulRequests: this.successfulRequests,
      failedRequests: this.failedRequests,
      errorRate: this.totalRequests > 0 ? Number((this.failedRequests / this.totalRequests).toFixed(4)) : 0,
      latencies: {
        totalMs,
        geminiMs: { p50: geminiMs.p50, p95: geminiMs.p95, p99: geminiMs.p99, avg: geminiMs.avg },
        toolsMs: { p50: toolsMs.p50, p95: toolsMs.p95, p99: toolsMs.p99, avg: toolsMs.avg },
        memoryMs: { p50: memoryMs.p50, p95: memoryMs.p95, p99: memoryMs.p99, avg: memoryMs.avg },
      },
      counters: {
        retries: this.retries,
        rateLimits: this.rateLimits,
        timeouts: this.timeouts,
        fallbacks: this.fallbacks,
        repairs: this.repairs,
        idempotentReplays: this.idempotentReplays,
        validationFailures: this.validationFailures,
      },
    };
  }

  public reset() {
    this.totalRequests = 0;
    this.successfulRequests = 0;
    this.failedRequests = 0;
    this.totalLatencies = [];
    this.geminiLatencies = [];
    this.toolsLatencies = [];
    this.memoryLatencies = [];
    this.retries = 0;
    this.rateLimits = 0;
    this.timeouts = 0;
    this.fallbacks = 0;
    this.repairs = 0;
    this.idempotentReplays = 0;
    this.validationFailures = 0;
    this.startTime = Date.now();
  }
}
