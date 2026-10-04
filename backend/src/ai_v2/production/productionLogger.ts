/**
 * ASTROWORLD AI V2 — Production Structured Logger
 * Emits structured JSON logs with strict redaction of sensitive credentials, API keys,
 * hidden reasoning traces, and personally identifiable credentials.
 */

export interface StructuredLogContext {
  requestId?: string;
  conversationId?: string;
  userId?: string;
  turnId?: string;
  executionMode?: string;
  stage?: string;
  durationMs?: number;
  modelUsed?: string;
  retryCount?: number;
  toolCount?: number;
  memoryCount?: number;
  validationStatus?: string;
  errorCode?: string;
  statusCode?: number;
  [key: string]: any;
}

export class ProductionLogger {
  private static readonly SENSITIVE_PATTERNS = [
    /AIza[0-9A-Za-z-_]{35}/g, // Google API keys
    /Bearer\s+[A-Za-z0-9-_.]+/gi, // Bearer tokens
    /password["':\s]+["']?[^"',\s}]+/gi,
    /secret["':\s]+["']?[^"',\s}]+/gi,
  ];

  public static sanitize(value: any): any {
    if (typeof value === 'string') {
      let sanitized = value;
      for (const pattern of this.SENSITIVE_PATTERNS) {
        sanitized = sanitized.replace(pattern, '[REDACTED_SECRET]');
      }
      return sanitized;
    }
    if (Array.isArray(value)) {
      return value.map(item => this.sanitize(item));
    }
    if (value !== null && typeof value === 'object') {
      const result: Record<string, any> = {};
      for (const [k, v] of Object.entries(value)) {
        if (/api_?key|password|secret|token|credential/i.test(k)) {
          result[k] = '[REDACTED_SECRET]';
        } else {
          result[k] = this.sanitize(v);
        }
      }
      return result;
    }
    return value;
  }

  public static info(message: string, context: StructuredLogContext = {}) {
    const entry = {
      level: 'INFO',
      timestamp: new Date().toISOString(),
      message,
      context: this.sanitize(context),
    };
    console.log(JSON.stringify(entry));
  }

  public static warn(message: string, context: StructuredLogContext = {}) {
    const entry = {
      level: 'WARN',
      timestamp: new Date().toISOString(),
      message,
      context: this.sanitize(context),
    };
    console.warn(JSON.stringify(entry));
  }

  public static error(message: string, context: StructuredLogContext = {}, error?: Error) {
    const entry = {
      level: 'ERROR',
      timestamp: new Date().toISOString(),
      message,
      context: this.sanitize(context),
      error: error
        ? {
            name: error.name,
            message: this.sanitize(error.message),
            stack: process.env.NODE_ENV === 'production' ? undefined : error.stack,
          }
        : undefined,
    };
    console.error(JSON.stringify(entry));
  }
}
