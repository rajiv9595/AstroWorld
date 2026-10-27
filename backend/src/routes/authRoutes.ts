import { Router, Request, Response } from 'express';
import { supabase } from '../services/supabaseService.ts';
import { createAuthClient } from '../services/authClient.ts';
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
    const authClient = createAuthClient();
    const { data: sessionData, error: sessionError } = await authClient.auth.signInWithPassword({
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

    const authClient = createAuthClient();
    const { data, error } = await authClient.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error || !data?.user || !data.session?.access_token || !data.session.refresh_token) {
      if (error) {
        console.warn('[Auth Login Notice]:', error.message);
      }
      const isEmailNotConfirmed = error?.message?.toLowerCase().includes('email not confirmed');
      return res.status(401).json({
        success: false,
        error: isEmailNotConfirmed
          ? 'Your email address is not confirmed yet. Please verify your email before signing in.'
          : 'Invalid email or password. Please check your credentials or create a new account.',
      });
    }

    const userId = data.user.id;

    // Check if user exists in public.profiles. If deleted from profiles, reject login and purge auth credentials.
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('id', userId)
      .maybeSingle();

    if (!existingProfile) {
      console.warn(`[Auth Login Guard] User ${userId} has no record in public.profiles (profile deleted). Purging auth credentials.`);
      await supabase.auth.admin.deleteUser(userId);
      clearAuthSessionCookies(res);
      return res.status(401).json({
        success: false,
        error: 'This account was deleted and is no longer active. Please click "Create Account" to register anew.',
      });
    }

    const displayName = existingProfile.full_name?.trim() || cleanEmail.split('@')[0];

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

// Google OAuth Initiation Endpoint
authRouter.get('/google', async (req: Request, res: Response) => {
  try {
    const authClient = createAuthClient();

    // Determine client origin for the OAuth callback
    const clientOrigin =
      (req.query.origin as string) ||
      req.get('origin') ||
      (req.get('referer') ? new URL(req.get('referer')!).origin : null) ||
      process.env.APP_URL ||
      'http://localhost:5173';

    const redirectUri = `${clientOrigin.replace(/\/+$/, '')}/api/auth/callback`;

    const { data, error } = await authClient.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUri,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error || !data?.url) {
      console.error('[Google OAuth Init Error]:', error);
      const isProviderDisabled =
        error?.message?.toLowerCase().includes('provider') ||
        error?.message?.toLowerCase().includes('not enabled') ||
        error?.message?.toLowerCase().includes('unsupported');

      return res.status(400).json({
        success: false,
        error: isProviderDisabled
          ? 'Google sign-in is not yet enabled in your Supabase project dashboard. Please enable Google provider in Authentication -> Providers.'
          : error?.message || 'Failed to initialize Google authentication.',
      });
    }

    if (req.headers.accept?.includes('text/html') || req.query.redirect === 'true') {
      return res.redirect(data.url);
    }

    return res.json({ success: true, url: data.url });
  } catch (err: any) {
    console.error('[Google OAuth Init Unexpected Error]:', err);
    return res.status(500).json({ success: false, error: 'Internal server error initializing Google login.' });
  }
});

// Google OAuth Redirect Callback Endpoint
authRouter.get('/callback', async (req: Request, res: Response) => {
  const clientOrigin =
    process.env.APP_URL ||
    (req.get('referer') ? new URL(req.get('referer')!).origin : null) ||
    'http://localhost:5173';

  try {
    const code = req.query.code as string | undefined;
    const errorDesc = req.query.error_description || req.query.error;

    if (errorDesc) {
      console.warn('[Google OAuth Callback Warning]:', errorDesc);
      return res.redirect(`${clientOrigin}/?authError=${encodeURIComponent(String(errorDesc))}`);
    }

    if (!code) {
      return res.redirect(`${clientOrigin}/?authError=No+authorization+code+provided`);
    }

    const authClient = createAuthClient();
    const { data, error } = await authClient.auth.exchangeCodeForSession(code);

    if (error || !data?.session || !data?.user) {
      console.error('[Google OAuth Exchange Error]:', error);
      return res.redirect(`${clientOrigin}/?authError=${encodeURIComponent(error?.message || 'Authentication exchange failed')}`);
    }

    const user = data.user;
    const userEmail = user.email || '';
    const fullName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      userEmail.split('@')[0] ||
      'User';

    // Ensure user profile exists in public.profiles table
    const { error: profileError } = await supabase.from('profiles').upsert(
      {
        id: user.id,
        email: userEmail,
        full_name: fullName,
        preferred_chart_style: 'NORTH_INDIAN',
      },
      { onConflict: 'id' }
    );

    if (profileError) {
      console.warn('[Google OAuth Profile Upsert Notice]:', profileError.message);
    }

    setAuthSessionCookies(
      req,
      res,
      data.session.access_token,
      data.session.refresh_token,
      true
    );

    return res.redirect(`${clientOrigin}/?auth=success`);
  } catch (err: any) {
    console.error('[Google OAuth Callback Exception]:', err);
    return res.redirect(`${clientOrigin}/?authError=Failed+to+complete+Google+login`);
  }
});

// Client Session Sync for Google OAuth (Supports frontend implicit hash or code forwarding)
authRouter.post('/google/session', async (req: Request, res: Response) => {
  try {
    const { access_token, refresh_token, code } = req.body || {};
    const authClient = createAuthClient();
    let session: any = null;
    let user: any = null;

    if (code) {
      const { data, error } = await authClient.auth.exchangeCodeForSession(code);
      if (error || !data?.session || !data?.user) {
        return res.status(401).json({ success: false, error: error?.message || 'Invalid authorization code.' });
      }
      session = data.session;
      user = data.user;
    } else if (access_token && refresh_token) {
      const { data, error } = await authClient.auth.setSession({ access_token, refresh_token });
      if (error || !data?.session || !data?.user) {
        return res.status(401).json({ success: false, error: error?.message || 'Invalid session credentials.' });
      }
      session = data.session;
      user = data.user;
    } else {
      return res.status(400).json({ success: false, error: 'Session credentials required.' });
    }

    const userEmail = user.email || '';
    const fullName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      userEmail.split('@')[0] ||
      'User';

    await supabase.from('profiles').upsert(
      {
        id: user.id,
        email: userEmail,
        full_name: fullName,
        preferred_chart_style: 'NORTH_INDIAN',
      },
      { onConflict: 'id' }
    );

    const csrfToken = setAuthSessionCookies(
      req,
      res,
      session.access_token,
      session.refresh_token,
      true
    );

    return res.json({
      success: true,
      authenticated: true,
      csrfToken,
      user: publicUser(user.id, userEmail, fullName),
    });
  } catch (err: any) {
    console.error('[Google Session Endpoint Error]:', err);
    return res.status(500).json({ success: false, error: 'Failed to process Google login session.' });
  }
});

// Current authenticated session
authRouter.get('/session', authenticateRequest, async (req: Request, res: Response) => {
  try {
    const { userId, email } = getAuthenticatedUser(req);

    // Verify user profile still exists in public.profiles.
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('id', userId)
      .maybeSingle();

    if (!profile) {
      console.warn(`[Auth Session Guard] User ${userId} was deleted from public.profiles. Invalidating session.`);
      await supabase.auth.admin.deleteUser(userId);
      clearAuthSessionCookies(res);
      return res.status(401).json({
        success: false,
        authenticated: false,
        error: 'Account was deleted. Please sign in or register anew.',
      });
    }

    const displayName = profile.full_name?.trim() || (email || '').split('@')[0];
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
authRouter.post('/logout', authenticateRequest, (_req: Request, res: Response) => {
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

    const authClient = createAuthClient();
    const { error } = await authClient.auth.resetPasswordForEmail(cleanEmail);
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

// Delete User Account (Purges all data everywhere and permanently deletes auth credentials)
authRouter.delete('/account', authenticateRequest, async (req: Request, res: Response) => {
  try {
    const { userId } = getAuthenticatedUser(req);

    // 1. Delete from profiles (which cascades through all user data tables in PostgreSQL)
    const { error: profileErr } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (profileErr) {
      console.warn('[Delete Account Profile Warning]:', profileErr.message);
    }

    // 2. Delete user from auth.users via admin API so they can NEVER login again with these credentials
    const { error: adminErr } = await supabase.auth.admin.deleteUser(userId);
    if (adminErr) {
      console.warn('[Delete Account Auth Admin Warning]:', adminErr.message);
    }

    // 3. Clear all authentication cookies
    clearAuthSessionCookies(res);

    return res.json({
      success: true,
      message: 'User account and all associated astrological charts, AI consultations, messages, and memories have been permanently deleted. You must sign up anew to use the platform.',
    });
  } catch (err) {
    console.error('[Delete Account] unexpected error:', err);
    return res.status(500).json({ success: false, error: 'Failed to delete account.' });
  }
});

