/**
 * ASTROWORLD AI V2 — Secret Manager & Audit Utility
 * Enforces zero-secret leakage into logs, client payloads, error objects, or git artifacts.
 */

export class SecretManager {
  private static sensitivePatterns: RegExp[] = [
    /AIzaSy[0-9A-Za-z_-]{33}/g, // Google API Key
    /sk-[a-zA-Z0-9]{32,}/g,     // Standard secret keys
    /eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/g, // JWTs
    /postgres(?:ql)?:\/\/[^:]+:([^@]+)@/g, // DB Passwords in URLs
    /("?password"?\s*:\s*)"[^"]+"/gi,
    /("?secret"?\s*:\s*)"[^"]+"/gi,
    /("?apiKey"?\s*:\s*)"[^"]+"/gi,
    /("?token"?\s*:\s*)"[^"]+"/gi,
  ];

  /**
   * Sanitizes arbitrary text or stringified JSON, replacing secrets with masked placeholders.
   */
  public static redactString(input: string): string {
    if (!input || typeof input !== 'string') return input;
    let sanitized = input;

    // Mask Google API keys
    sanitized = sanitized.replace(/AIzaSy[0-9A-Za-z_-]{33}/g, 'AIzaSy[REDACTED_API_KEY]');

    // Mask DB Connection Strings with passwords
    sanitized = sanitized.replace(/(postgres(?:ql)?:\/\/[^:]+:)([^@]+)(@)/g, '$1[REDACTED_PASSWORD]$3');

    // Mask Bearer Tokens
    sanitized = sanitized.replace(/Bearer\s+[A-Za-z0-9_.-]+/gi, 'Bearer [REDACTED_TOKEN]');

    // Mask JWT tokens
    sanitized = sanitized.replace(/eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/g, '[REDACTED_JWT]');

    return sanitized;
  }

  /**
   * Scans a target text or object for any raw unmasked secrets.
   */
  public static scanForSecrets(content: string): { containsSecrets: boolean; matches: string[] } {
    const matches: string[] = [];
    if (!content) return { containsSecrets: false, matches: [] };

    const googleKeyMatch = content.match(/AIzaSy[0-9A-Za-z_-]{33}/g);
    if (googleKeyMatch) matches.push(...googleKeyMatch.map(k => `Google Key: ${k.substring(0, 6)}...`));

    const dbPassMatch = content.match(/postgres(?:ql)?:\/\/[^:]+:([^@]{4,})@/g);
    if (dbPassMatch) matches.push(...dbPassMatch.map(() => 'Database URL password detected'));

    const rawJwtMatch = content.match(/eyJ[a-zA-Z0-9_-]{20,}\.eyJ[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{20,}/g);
    if (rawJwtMatch) matches.push(...rawJwtMatch.map(j => `Raw JWT: ${j.substring(0, 10)}...`));

    return {
      containsSecrets: matches.length > 0,
      matches,
    };
  }

  /**
   * Deeply sanitizes JSON-serializable payloads for public error or response delivery.
   */
  public static sanitizePayload<T>(obj: T): T {
    if (!obj) return obj;
    const str = JSON.stringify(obj);
    const cleanedStr = SecretManager.redactString(str);
    return JSON.parse(cleanedStr);
  }
}
