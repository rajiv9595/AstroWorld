/**
 * ASTROWORLD — Server-trusted authentication middleware.
 *
 * Browser sessions use HttpOnly cookies; API clients may also send a Bearer token.
 * The user id used by protected routes is ALWAYS derived from a verified Supabase
 * access token. Client-supplied userId fields/headers are never trusted.
 */

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

function parseCookies(header: string | undefined): Record<string, string> {
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

function getRequestAccessToken(req: Request): string | undefined {
  const authorization = req.headers.authorization;
  if (authorization?.startsWith('Bearer ')) {
    const token = authorization.slice('Bearer '.length).trim();
    if (token) return token;
  }

  return parseCookies(req.headers.cookie)[AUTH_ACCESS_COOKIE];
}

function setAuthCookie(
  res: Response,
  name: string,
  value: string,
  options: { maxAgeSeconds?: number } = {},
): void {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  const maxAge = options.maxAgeSeconds ? ` Max-Age=${Math.max(1, Math.floor(options.maxAgeSeconds))}` : '';
  const encoded = encodeURIComponent(value);
  res.append('Set-Cookie', `${name}=${encoded}; Path=/; HttpOnly; SameSite=Lax${secure};${maxAge}`);
}

export function setAuthSessionCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
  rememberMe = true,
): void {
  const refreshMaxAgeSeconds = rememberMe ? 60 * 60 * 24 * 30 : undefined;
  const accessMaxAgeSeconds = rememberMe ? 60 * 60 : undefined;
  setAuthCookie(res, AUTH_ACCESS_COOKIE, accessToken, { maxAgeSeconds: accessMaxAgeSeconds });
  setAuthCookie(res, AUTH_REFRESH_COOKIE, refreshToken, { maxAgeSeconds: refreshMaxAgeSeconds });
}

export function clearAuthSessionCookies(res: Response): void {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  const expiry = ' Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT';
  res.append('Set-Cookie', `${AUTH_ACCESS_COOKIE}=; Path=/; HttpOnly; SameSite=Lax${secure};${expiry}`);
  res.append('Set-Cookie', `${AUTH_REFRESH_COOKIE}=; Path=/; HttpOnly; SameSite=Lax${secure};${expiry}`);
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
    const accessToken = getRequestAccessToken(req);
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
        setAuthSessionCookies(res, data.session.access_token, data.session.refresh_token, true);
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
