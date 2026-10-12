/**
 * ASTROWORLD — Authentication & Session Client
 *
 * Authentication tokens are deliberately never exposed to browser JavaScript.
 * The backend sets HttpOnly session cookies and derives the authenticated user
 * from the verified Supabase session.
 */

export interface SupabaseUserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  preferredChartStyle?: 'NORTH_INDIAN' | 'SOUTH_INDIAN';
}

let csrfToken: string | null = null;

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
}

export const getCsrfToken = (): string | null => {
  return csrfToken || getCookie('aw_csrf_token');
};

export const authWriteHeaders = (extra: Record<string, string> = {}): Record<string, string> => {
  const token = getCsrfToken();
  return token
    ? { ...extra, 'X-CSRF-Token': token }
    : { ...extra };
};

async function parseJsonResponse(res: Response): Promise<any> {
  return res.json().catch(() => null);
}

export const signUpWithSupabase = async (
  email: string,
  password: string,
  fullName: string,
  rememberMe = true,
): Promise<{ success: boolean; authenticated?: boolean; user?: SupabaseUserProfile; message?: string }> => {
  try {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      credentials: 'include',
      headers: authWriteHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        rememberMe,
      }),
    });

    const data = await parseJsonResponse(res);
    if (res.ok && data?.success && data?.user) {
      if (typeof data.csrfToken === 'string') csrfToken = data.csrfToken;
      return {
        success: true,
        authenticated: data.authenticated !== false,
        user: data.user,
        message: data.authenticated === false
          ? 'Account created. Please sign in to continue.'
          : 'Account created successfully!',
      };
    }

    return { success: false, message: data?.error || 'Signup failed.' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Connection error. Please try again.' };
  }
};

export const signInWithSupabase = async (
  email: string,
  password: string,
  rememberMe = true,
): Promise<{ success: boolean; user?: SupabaseUserProfile; message?: string }> => {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      credentials: 'include',
      headers: authWriteHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        password,
        rememberMe,
      }),
    });

    const data = await parseJsonResponse(res);
    if (res.ok && data?.success && data?.user) {
      if (typeof data.csrfToken === 'string') csrfToken = data.csrfToken;
      return { success: true, user: data.user };
    }

    return { success: false, message: data?.error || 'Invalid email or password.' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Connection error. Please try again.' };
  }
};

export const resetPasswordWithSupabase = async (
  email: string,
): Promise<{ success: boolean; message: string }> => {
  try {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    });

    const data = await parseJsonResponse(res);
    return {
      success: !!(res.ok && data?.success),
      message: data?.message || data?.error || 'Unable to process password recovery.',
    };
  } catch {
    return { success: false, message: 'Failed to connect to authentication service.' };
  }
};

export const signOutFromSupabase = async (): Promise<void> => {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
      headers: authWriteHeaders({ 'Content-Type': 'application/json' }),
    });
  } finally {
    localStorage.removeItem('astroworld_user');
  }
};

export const getCurrentSupabaseUser = async (): Promise<SupabaseUserProfile | null> => {
  try {
    const res = await fetch('/api/auth/session', {
      method: 'GET',
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) {
      localStorage.removeItem('astroworld_user');
      return null;
    }

    const data = await res.json();
    if (typeof data?.csrfToken === 'string') csrfToken = data.csrfToken;
    if (!data?.authenticated || !data?.user) {
      localStorage.removeItem('astroworld_user');
      return null;
    }

    // Non-sensitive display metadata only. Authorization never depends on this
    // client-side copy; the backend verifies the HttpOnly session cookie.
    localStorage.setItem('astroworld_user', JSON.stringify(data.user));
    return data.user;
  } catch {
    return null;
  }
};
