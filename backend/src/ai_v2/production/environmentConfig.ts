/**
 * ASTROWORLD AI V2 — Environment Separation & Configuration
 * Provides strict, validated isolation across Development, Staging, and Production.
 * Enforces zero cross-environment contamination.
 */

export type EnvironmentType = 'development' | 'staging' | 'production' | 'test';

export interface EnvironmentConfig {
  env: EnvironmentType;
  apiBaseUrl: string;
  corsAllowedOrigins: string[];
  database: {
    connectionString: string;
    schema: string;
    maxConnections: number;
    ssl: boolean;
  };
  storage: {
    bucketName: string;
    prefix: string;
  };
  rateLimit: {
    windowMs: number;
    maxRequestsPerWindow: number;
    burstCapacity: number;
  };
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    redactSensitiveFields: boolean;
    emitJson: boolean;
  };
  security: {
    enforceHttps: boolean;
    hstsMaxAgeSeconds: number;
    cookieSecure: boolean;
    cookieSameSite: 'strict' | 'lax' | 'none';
  };
  gemini: {
    modelName: string;
    timeoutMs: number;
    maxRetries: number;
  };
}

export class EnvironmentManager {
  private static instance: EnvironmentManager;
  private currentEnv: EnvironmentType;
  private config: EnvironmentConfig;

  private constructor() {
    this.currentEnv = (process.env.NODE_ENV as EnvironmentType) || 'development';
    this.config = this.loadConfig(this.currentEnv);
  }

  public static getInstance(): EnvironmentManager {
    if (!EnvironmentManager.instance) {
      EnvironmentManager.instance = new EnvironmentManager();
    }
    return EnvironmentManager.instance;
  }

  public setEnvironment(env: EnvironmentType): void {
    this.currentEnv = env;
    this.config = this.loadConfig(env);
  }

  public getEnvironment(): EnvironmentType {
    return this.currentEnv;
  }

  public getConfig(): EnvironmentConfig {
    return { ...this.config };
  }

  public validateIsolation(stagingConfig: EnvironmentConfig, prodConfig: EnvironmentConfig): {
    valid: boolean;
    violations: string[];
  } {
    const violations: string[] = [];

    if (stagingConfig.database.connectionString === prodConfig.database.connectionString) {
      violations.push('Staging database connection string matches production database!');
    }
    if (stagingConfig.database.schema === prodConfig.database.schema && stagingConfig.database.schema === 'public') {
      violations.push('Staging database schema matches production schema without namespace separation!');
    }
    if (stagingConfig.storage.bucketName === prodConfig.storage.bucketName && stagingConfig.storage.prefix === prodConfig.storage.prefix) {
      violations.push('Staging storage shares bucket and prefix with production!');
    }
    if (stagingConfig.apiBaseUrl === prodConfig.apiBaseUrl) {
      violations.push('Staging API base URL matches production endpoint!');
    }

    return {
      valid: violations.length === 0,
      violations,
    };
  }

  private loadConfig(env: EnvironmentType): EnvironmentConfig {
    switch (env) {
      case 'staging':
        return {
          env: 'staging',
          apiBaseUrl: process.env.STAGING_API_BASE_URL || 'https://staging-api.astroworld.internal',
          corsAllowedOrigins: [
            'https://staging.astroworld.internal',
            'https://ais-pre-yev7obfh2xw26z7riskdes-324783661501.asia-southeast1.run.app',
            'https://ais-dev-yev7obfh2xw26z7riskdes-324783661501.asia-southeast1.run.app',
            'http://localhost:3000',
          ],
          database: {
            connectionString: process.env.STAGING_DATABASE_URL || '',
            schema: 'astroworld_staging',
            maxConnections: 20,
            ssl: true,
          },
          storage: {
            bucketName: 'astroworld-staging-artifacts',
            prefix: 'staging/',
          },
          rateLimit: {
            windowMs: 60 * 1000,
            maxRequestsPerWindow: 60,
            burstCapacity: 10,
          },
          logging: {
            level: 'info',
            redactSensitiveFields: true,
            emitJson: true,
          },
          security: {
            enforceHttps: true,
            hstsMaxAgeSeconds: 31536000,
            cookieSecure: true,
            cookieSameSite: 'none',
          },
          gemini: {
            modelName: 'gemini-3.8-flash',
            timeoutMs: 10000,
            maxRetries: 2,
          },
        };

      case 'production':
        return {
          env: 'production',
          apiBaseUrl: process.env.PROD_API_BASE_URL || 'https://api.astroworld.com',
          corsAllowedOrigins: [
            'https://astroworld.com',
            'https://app.astroworld.com',
          ],
          database: {
            connectionString: process.env.DATABASE_URL || '',
            schema: 'astroworld_production',
            maxConnections: 100,
            ssl: true,
          },
          storage: {
            bucketName: 'astroworld-production-artifacts',
            prefix: 'prod/',
          },
          rateLimit: {
            windowMs: 60 * 1000,
            maxRequestsPerWindow: 120,
            burstCapacity: 20,
          },
          logging: {
            level: 'warn',
            redactSensitiveFields: true,
            emitJson: true,
          },
          security: {
            enforceHttps: true,
            hstsMaxAgeSeconds: 31536000,
            cookieSecure: true,
            cookieSameSite: 'strict',
          },
          gemini: {
            modelName: 'gemini-3.8-flash',
            timeoutMs: 12000,
            maxRetries: 3,
          },
        };

      case 'test':
      case 'development':
      default:
        return {
          env: 'development',
          apiBaseUrl: 'http://localhost:3000',
          corsAllowedOrigins: ['*'],
          database: {
            connectionString: process.env.DEV_DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/astroworld_dev',
            schema: 'astroworld_dev',
            maxConnections: 10,
            ssl: false,
          },
          storage: {
            bucketName: 'astroworld-dev-artifacts',
            prefix: 'dev/',
          },
          rateLimit: {
            windowMs: 60 * 1000,
            maxRequestsPerWindow: 300,
            burstCapacity: 50,
          },
          logging: {
            level: 'debug',
            redactSensitiveFields: true,
            emitJson: false,
          },
          security: {
            enforceHttps: false,
            hstsMaxAgeSeconds: 0,
            cookieSecure: false,
            cookieSameSite: 'lax',
          },
          gemini: {
            modelName: 'gemini-3.8-flash',
            timeoutMs: 15000,
            maxRetries: 2,
          },
        };
    }
  }
}
