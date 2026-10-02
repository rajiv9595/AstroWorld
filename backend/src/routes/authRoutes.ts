import { Router, Request, Response } from 'express';
import { supabase } from '../services/supabaseService.ts';

export const authRouter = Router();

// Sign Up Endpoint
authRouter.post('/signup', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const cleanEmail = email?.trim().toLowerCase();
    const cleanName = name?.trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long.' });
    }
    if (!cleanName || cleanName.length < 2) {
      return res.status(400).json({ success: false, error: 'Please enter your full name.' });
    }

    // 1. Create user in Supabase Auth
    let { data: adminData, error: adminErr } = await supabase.auth.admin.createUser({
      email: cleanEmail,
      password,
      email_confirm: true,
      user_metadata: { full_name: cleanName },
    });

    if (adminErr) {
      if (
        adminErr.message.toLowerCase().includes('already registered') ||
        adminErr.message.toLowerCase().includes('already exists')
      ) {
        try {
          const { data: { users } } = await supabase.auth.admin.listUsers();
          const existing = users?.find((u) => u.email?.toLowerCase() === cleanEmail);
          if (existing) {
            await supabase.auth.admin.deleteUser(existing.id);
            const fresh = await supabase.auth.admin.createUser({
              email: cleanEmail,
              password,
              email_confirm: true,
              user_metadata: { full_name: cleanName },
            });
            adminData = fresh.data;
            adminErr = fresh.error;
          }
        } catch {
          // ignore
        }
      }
      if (adminErr) {
        return res.status(400).json({ success: false, error: adminErr.message });
      }
    }

    if (!adminData?.user) {
      return res.status(400).json({ success: false, error: 'Failed to create user account in Supabase.' });
    }

    const userId = adminData.user.id;

    // 2. Upsert into public.profiles
    const { error: profErr } = await supabase.from('profiles').upsert({
      id: userId,
      email: cleanEmail,
      full_name: cleanName,
      preferred_chart_style: 'NORTH_INDIAN',
    });

    if (profErr) {
      console.warn('[Supabase Profiles Notice]:', profErr.message);
    }

    return res.json({
      success: true,
      user: {
        id: userId,
        name: cleanName,
        email: cleanEmail,
      },
    });
  } catch (err: any) {
    console.error('Signup error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Registration failed' });
  }
});

// Login Endpoint
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = email?.trim().toLowerCase();

    if (!cleanEmail || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error || !data?.user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password. Please check your credentials or create a new account.',
      });
    }

    const userId = data.user.id;
    let displayName = data.user.user_metadata?.full_name || cleanEmail.split('@')[0];

    try {
      const { data: prof } = await supabase
        .from('profiles')
        .select('full_name, preferred_chart_style')
        .eq('id', userId)
        .single();

      if (prof?.full_name) {
        displayName = prof.full_name;
      } else {
        await supabase.from('profiles').upsert({
          id: userId,
          email: cleanEmail,
          full_name: displayName,
          preferred_chart_style: 'NORTH_INDIAN',
        });
      }
    } catch {
      await supabase.from('profiles').upsert({
        id: userId,
        email: cleanEmail,
        full_name: displayName,
        preferred_chart_style: 'NORTH_INDIAN',
      });
    }

    return res.json({
      success: true,
      user: {
        id: userId,
        name: displayName,
        email: cleanEmail,
      },
      token: data.session?.access_token,
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error during login' });
  }
});

// Forgot Password Endpoint
authRouter.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const cleanEmail = email?.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
    }

    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail);
    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    return res.json({
      success: true,
      message: `Password reset link sent to ${cleanEmail}. Please check your inbox.`,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to process password reset' });
  }
});
