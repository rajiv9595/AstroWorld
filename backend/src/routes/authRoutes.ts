import { Router, Request, Response } from 'express';
import { supabase } from '../services/supabaseService.ts';
import {
  authenticateRequest,
  clearAuthSessionCookies,
  getAuthenticatedUser,
  setAuthSessionCookies,
  ensureCsrfCookie,
} from '../middleware/authMiddleware.ts';

export const authRouter = Router();

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function publicUser(userId: string, email: string, name: string) {
  return { id: userId, name, email };
}

async function resolveDisplayName(userId: string, email: string, fallback?: string): Promise<string> {
  const metadataName =
    typeof fallback === 'string' && fallback.trim().length > 0
      ? fallback.trim()
      : undefined;

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', userId)
    .maybeSingle();

  return profile?.full_name?.trim() || metadataName || email.split('@')[0];
}

// Sign Up Endpoint
authRouter.post('/signup', async (req: Request, res: Response) => {
  try {
    const cleanEmail = String(req.body?.email || '').trim().toLowerCase();
    const cleanName = String(req.body?.name || '').trim();
    const password = String(req.body?.password || '');

    if (!EMAIL_PATTERN.test(cleanEmail)) {
      return res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, error: 'Password must be at least 8 characters long.' });
    }
    if (cleanName.length < 2 || cleanName.length > 120) {
      return res.status(400).json({ success: false, error: 'Please enter your full name (2-120 characters).' });
    }

    const { data: adminData, error: adminErr } = await supabase.auth.admin.createUser({
      email: cleanEmail,
      password,
      email_confirm: true,
      user_metadata: { full_name: cleanName },
    });

    if (adminErr) {
      const message = adminErr.message.toLowerCase();
      if (message.includes('already registered') || message.includes('already exists')) {
        return res.status(409).json({
          success: false,
          error: 'An account already exists for this email. Please sign in instead.',
        });
      }

      return res.status(400).json({ success: false, error: 'Unable to create the account. Please try again.' });
    }

    const createdUser = adminData?.user;
    if (!createdUser?.id) {
      return res.status(500).json({ success: false, error: 'Account creation did not return a valid user.' });
    }

    const { error: profileError } = await supabase.from('profiles').upsert({
      id: createdUser.id,
      email: cleanEmail,
      full_name: cleanName,
      preferred_chart_style: 'NORTH_INDIAN',
    });

    if (profileError) {
      console.warn('[Supabase Profiles Notice]:', profileError.message);
    }

    // Create an authenticated session immediately so signup behaves consistently
    // with login while keeping tokens out of browser JavaScript.
    const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (sessionError || !sessionData.session || !sessionData.user) {
      return res.json({
        success: true,
        authenticated: false,
        requiresLogin: true,
        user: publicUser(createdUser.id, cleanEmail, cleanName),
      });
    }

    const csrfToken = setAuthSessionCookies(
      req,
      res,
      sessionData.session.access_token,
      sessionData.session.refresh_token,
      req.body?.rememberMe !== false,
    );

    return res.status(201).json({
      success: true,
      authenticated: true,
      csrfToken,
      user: publicUser(createdUser.id, cleanEmail, cleanName),
    });
  } catch (err) {
    console.error('[Auth Signup] unexpected error:', err);
    return res.status(500).json({ success: false, error: 'Registration failed. Please try again.' });
  }
});

// Login Endpoint
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const cleanEmail = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');

    if (!EMAIL_PATTERN.test(cleanEmail) || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error || !data?.user || !data.session?.access_token || !data.session.refresh_token) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password. Please check your credentials or create a new account.',
      });
    }

    const userId = data.user.id;
    const displayName = await resolveDisplayName(
      userId,
      cleanEmail,
      typeof data.user.user_metadata?.full_name === 'string'
        ? data.user.user_metadata.full_name
        : undefined,
    );

    const { error: profileError } = await supabase.from('profiles').upsert({
      id: userId,
      email: cleanEmail,
      full_name: displayName,
      preferred_chart_style: 'NORTH_INDIAN',
    });

    if (profileError) {
      console.warn('[Supabase Profiles Notice]:', profileError.message);
    }

    const csrfToken = setAuthSessionCookies(
      req,
      res,
      data.session.access_token,
      data.session.refresh_token,
      req.body?.rememberMe !== false,
    );

    return res.json({
      success: true,
      authenticated: true,
      csrfToken,
      user: publicUser(userId, cleanEmail, displayName),
    });
  } catch (err) {
    console.error('[Auth Login] unexpected error:', err);
    return res.status(500).json({ success: false, error: 'Unable to sign in right now. Please try again.' });
  }
});

// Current authenticated session
authRouter.get('/session', authenticateRequest, async (req: Request, res: Response) => {
  try {
    const { userId, email } = getAuthenticatedUser(req);
    const displayName = await resolveDisplayName(userId, email || '');
    const csrfToken = ensureCsrfCookie(req, res);

    return res.json({
      success: true,
      authenticated: true,
      csrfToken,
      user: publicUser(userId, email || '', displayName),
    });
  } catch (err) {
    console.error('[Auth Session] unexpected error:', err);
    clearAuthSessionCookies(res);
    return res.status(401).json({
      success: false,
      authenticated: false,
      error: 'Authentication session is no longer valid.',
    });
  }
});

// Sign Out
authRouter.post('/logout', (_req: Request, res: Response) => {
  clearAuthSessionCookies(res);
  return res.json({ success: true, authenticated: false });
});

// Forgot Password Endpoint
authRouter.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const cleanEmail = String(req.body?.email || '').trim().toLowerCase();

    if (!EMAIL_PATTERN.test(cleanEmail)) {
      return res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
    }

    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail);
    if (error) {
      return res.status(400).json({ success: false, error: 'Unable to start password recovery. Please try again.' });
    }

    // Do not reveal whether the account exists.
    return res.json({
      success: true,
      message: 'If an account exists for this email, password recovery instructions have been sent.',
    });
  } catch (err) {
    console.error('[Auth Password Recovery] unexpected error:', err);
    return res.status(500).json({ success: false, error: 'Failed to process password recovery.' });
  }
});
