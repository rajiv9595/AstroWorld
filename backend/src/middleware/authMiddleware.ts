/**
 * ASTROWORLD — Server-trusted authentication middleware.
 *
 * Browser sessions use HttpOnly access/refresh cookies. Protected unsafe
 * requests also require a CSRF token issued by the backend and echoed in the
 * X-CSRF-Token header. API clients may alternatively use a Bearer access token.
 *
 * The authenticated user id is ALWAYS derived from a verified Supabase token.
 * Client-supplied userId fields/headers are never trusted.
 */

import crypto from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import { supabase } from '../services/supabaseService.ts';

export interface AuthenticatedUserContext {
  userId: string;
  email?: string;
  role: 'user' | 'admin';
}

declare global {
  namespace Express {
    interface Request {
      authenticatedUser?: AuthenticatedUserContext;
    }
  }
}

export const AUTH_ACCESS_COOKIE = 'aw_access_token';
export const AUTH_REFRESH_COOKIE = 'aw_refresh_token';
export const AUTH_CSRF_COOKIE = 'aw_csrf_token';
export const AUTH_REMEMBER_COOKIE = 'aw_remember';

function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

function cookieSameSite(): 'Lax' | 'None' {
  // Vercel/Render-style deployments are cross-site. Secure+None is required
  // there; local development stays Lax for convenience.
  return isProduction() ? 'None' : 'Lax';
}

export function parseCookies(header: string | undefined): Record<string, string> {
  if (!header) return {};

  const cookies: Record<string, string> = {};
  for (const part of header.split(';')) {
    const index = part.indexOf('=');
    if (index <= 0) continue;

    const key = decodeURIComponent(part.slice(0, index).trim());
    const value = decodeURIComponent(part.slice(index + 1).trim());
    cookies[key] = value;
  }
  return cookies;
}

function getRequestCredential(req: Request): { token?: string; cookieBased: boolean } {
  const authorization = req.headers.authorization;
  if (authorization?.startsWith('Bearer ')) {
    const token = authorization.slice('Bearer '.length).trim();
    if (token) return { token, cookieBased: false };
  }

  return {
    token: parseCookies(req.headers.cookie)[AUTH_ACCESS_COOKIE],
    cookieBased: true,
  };
}

function setCookie(
  res: Response,
  name: string,
  value: string,
  options: {
    httpOnly?: boolean;
    maxAgeSeconds?: number;
  } = {},
): void {
  const secure = isProduction() ? '; Secure' : '';
  const sameSite = cookieSameSite();
  const httpOnly = options.httpOnly === false ? '' : '; HttpOnly';
  const maxAge = options.maxAgeSeconds
    ? '; Max-Age=' + Math.max(1, Math.floor(options.maxAgeSeconds))
    : '';

  res.append(
    'Set-Cookie',
    name +
      '=' +
      encodeURIComponent(value) +
      '; Path=/' +
      httpOnly +
      '; SameSite=' +
      sameSite +
      secure +
      maxAge,
  );
}

function clearCookie(res: Response, name: string, httpOnly = true): void {
  const secure = isProduction() ? '; Secure' : '';
  const httpOnlyPart = httpOnly ? '; HttpOnly' : '';
  res.append(
    'Set-Cookie',
    name +
      '=; Path=/' +
      httpOnlyPart +
      '; SameSite=' +
      cookieSameSite() +
      secure +
      '; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
  );
}

export function createCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function ensureCsrfCookie(req: Request, res: Response): string {
  const existing = parseCookies(req.headers.cookie)[AUTH_CSRF_COOKIE];
  if (existing && existing.length >= 32) return existing;

  const token = createCsrfToken();
  setCookie(res, AUTH_CSRF_COOKIE, token, {
    httpOnly: false,
    maxAgeSeconds: 60 * 60 * 24 * 30,
  });
  return token;
}

export function setAuthSessionCookies(
  _req: Request,
  res: Response,
  accessToken: string,
  refreshToken: string,
  rememberMe = true,
  existingCsrfToken?: string,
): string {
  const refreshMaxAgeSeconds = rememberMe ? 60 * 60 * 24 * 30 : undefined;
  const accessMaxAgeSeconds = rememberMe ? 60 * 60 : undefined;

  setCookie(res, AUTH_ACCESS_COOKIE, accessToken, {
    maxAgeSeconds: accessMaxAgeSeconds,
  });
  setCookie(res, AUTH_REFRESH_COOKIE, refreshToken, {
    maxAgeSeconds: refreshMaxAgeSeconds,
  });
  setCookie(res, AUTH_REMEMBER_COOKIE, rememberMe ? '1' : '0', {
    maxAgeSeconds: rememberMe ? 60 * 60 * 24 * 30 : undefined,
  });

  // Rotate CSRF on initial login; preserve it during silent access-token refresh.
  const csrfToken = existingCsrfToken || createCsrfToken();
  setCookie(res, AUTH_CSRF_COOKIE, csrfToken, {
    httpOnly: false,
    maxAgeSeconds: rememberMe ? 60 * 60 * 24 * 30 : undefined,
  });

  return csrfToken;
}

export function clearAuthSessionCookies(res: Response): void {
  clearCookie(res, AUTH_ACCESS_COOKIE, true);
  clearCookie(res, AUTH_REFRESH_COOKIE, true);
  clearCookie(res, AUTH_CSRF_COOKIE, false);
  clearCookie(res, AUTH_REMEMBER_COOKIE, true);
}

function requireCsrfForUnsafeRequest(req: Request): boolean {
  return !['GET', 'HEAD', 'OPTIONS'].includes(req.method.toUpperCase());
}

function csrfIsValid(req: Request, cookieBased: boolean): boolean {
  if (!cookieBased || !requireCsrfForUnsafeRequest(req)) return true;

  const cookies = parseCookies(req.headers.cookie);
  const cookieToken = cookies[AUTH_CSRF_COOKIE];
  const headerToken = req.headers['x-csrf-token'];

  if (!cookieToken || typeof headerToken !== 'string') return false;
  const expected = Buffer.from(cookieToken);
  const received = Buffer.from(headerToken);
  if (expected.length !== received.length || expected.length < 32) return false;
  return crypto.timingSafeEqual(expected, received);
}

async function resolveUserFromToken(accessToken: string): Promise<{
  user: { id: string; email?: string | null; app_metadata?: Record<string, unknown> };
} | null> {
  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error || !data.user) return null;
  return { user: data.user };
}

export async function authenticateRequest(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const credential = getRequestCredential(req);

    if (!csrfIsValid(req, credential.cookieBased)) {
      res.status(403).json({
        success: false,
        errorCode: 'AUTHORIZATION_ERROR',
        userMessage: 'The security token for this request is missing or invalid. Please refresh the page and try again.',
      });
      return;
    }

    const accessToken = credential.token;
    const cookies = parseCookies(req.headers.cookie);

    if (!accessToken) {
      res.status(401).json({
        success: false,
        errorCode: 'AUTHENTICATION_ERROR',
        userMessage: 'Authentication required. Please sign in to continue.',
      });
      return;
    }

    let resolved = await resolveUserFromToken(accessToken);

    if (!resolved && cookies[AUTH_REFRESH_COOKIE]) {
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: cookies[AUTH_REFRESH_COOKIE],
      });

      if (!error && data.session?.access_token && data.session.refresh_token && data.user) {
        setAuthSessionCookies(
          req,
          res,
          data.session.access_token,
          data.session.refresh_token,
          cookies[AUTH_REMEMBER_COOKIE] !== '0',
          cookies[AUTH_CSRF_COOKIE],
        );
        resolved = { user: data.user };
      }
    }

    if (!resolved) {
      clearAuthSessionCookies(res);
      res.status(401).json({
        success: false,
        errorCode: 'AUTHENTICATION_ERROR',
        userMessage: 'Your authentication session has expired. Please sign in again.',
      });
      return;
    }

    const role = resolved.user.app_metadata?.role === 'admin' ? 'admin' : 'user';
    req.authenticatedUser = {
      userId: resolved.user.id,
      email: resolved.user.email || undefined,
      role,
    };

    next();
  } catch (error) {
    console.error('[Auth Middleware] Verification failure:', error);
    clearAuthSessionCookies(res);
    res.status(401).json({
      success: false,
      errorCode: 'AUTHENTICATION_ERROR',
      userMessage: 'Authentication could not be verified. Please sign in again.',
    });
  }
}

export function getAuthenticatedUser(req: Request): AuthenticatedUserContext {
  const user = req.authenticatedUser;
  if (!user) {
    throw new Error('Authenticated user context is missing.');
  }
  return user;
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  try {
    const user = getAuthenticatedUser(req);
    if (user.role !== 'admin') {
      res.status(403).json({
        success: false,
        errorCode: 'AUTHORIZATION_ERROR',
        userMessage: 'You do not have permission to access this resource.',
      });
      return;
    }
    next();
  } catch {
    res.status(401).json({
      success: false,
      errorCode: 'AUTHENTICATION_ERROR',
      userMessage: 'Authentication required. Please sign in to continue.',
    });
  }
}
