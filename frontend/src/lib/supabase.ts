/**
 * ASTROWORLD — Authentication & Supabase Client Helper
 * Safely wraps authentication and session storage for the browser interface.
 */

export interface SupabaseUserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  preferredChartStyle?: 'NORTH_INDIAN' | 'SOUTH_INDIAN';
}

/**
 * Sign up a new user via the full-stack server authentication proxy
 */
export const signUpWithSupabase = async (
  email: string,
  password: string,
  fullName: string
): Promise<{ success: boolean; user?: SupabaseUserProfile; message?: string }> => {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = fullName.trim();

  try {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: cleanName, email: cleanEmail, password }),
    });
    const data = await res.json();
    if (res.ok && data.success && data.user) {
      return { success: true, user: data.user, message: 'Account created successfully!' };
    }
    return { success: false, message: data.error || 'Signup failed' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Connection error. Please try again.' };
  }
};

/**
 * Sign in existing user via the full-stack server authentication proxy
 */
export const signInWithSupabase = async (
  email: string,
  password: string
): Promise<{ success: boolean; user?: SupabaseUserProfile; message?: string }> => {
  const cleanEmail = email.trim().toLowerCase();

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, password }),
    });
    const data = await res.json();
    if (res.ok && data.success && data.user) {
      return { success: true, user: data.user };
    }
    return { success: false, message: data.error || 'Invalid email or password' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Connection error. Please try again.' };
  }
};

/**
 * Send Password Reset Email
 */
export const resetPasswordWithSupabase = async (
  email: string
): Promise<{ success: boolean; message: string }> => {
  const cleanEmail = email.trim().toLowerCase();

  try {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail }),
    });
    const data = await res.json();
    if (data.success) {
      return {
        success: true,
        message: data.message || `Password reset instructions have been sent to ${cleanEmail}.`,
      };
    }
    return { success: false, message: data.error || 'Failed to send password reset.' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Failed to process password reset.' };
  }
};

/**
 * Sign Out and clear local session
 */
export const signOutFromSupabase = async (): Promise<void> => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('astroworld_user');
    localStorage.removeItem('astroworld_supabase_auth_token');
  }
};

/**
 * Get current session user asynchronously from storage
 */
export const getCurrentSupabaseUser = async (): Promise<SupabaseUserProfile | null> => {
  try {
    const saved = localStorage.getItem('astroworld_user');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};
