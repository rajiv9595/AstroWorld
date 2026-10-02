/**
 * ASTROWORLD — Supabase Client Configuration & Connection Manager
 * Supports environment variables and direct user credentials with strict validation.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Get stored or env credentials
export const getSupabaseConfig = (): { url: string; anonKey: string } | null => {
  const localUrl = localStorage.getItem('astroworld_supabase_url')?.trim() || '';
  const localKey = localStorage.getItem('astroworld_supabase_anon_key')?.trim() || '';

  const envUrl = (import.meta.env.VITE_SUPABASE_URL as string)?.trim() || '';
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string)?.trim() || '';

  const url = localUrl || (envUrl && !envUrl.includes('your-project-id') ? envUrl : '');
  const anonKey = localKey || (envKey && !envKey.includes('your-anon-key') ? envKey : '');

  if (url && anonKey && url.startsWith('https://')) {
    return { url, anonKey };
  }
  return null;
};

export const isSupabaseConfigured = (): boolean => {
  return getSupabaseConfig() !== null;
};

// Singleton client cache
let clientInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  const config = getSupabaseConfig();
  if (!config) return null;

  if (
    !clientInstance ||
    (clientInstance as any).supabaseUrl !== config.url
  ) {
    clientInstance = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return clientInstance;
};

export const setSupabaseConfig = (url: string, anonKey: string): SupabaseClient => {
  const cleanUrl = url.trim().replace(/\/$/, '');
  const cleanKey = anonKey.trim();

  localStorage.setItem('astroworld_supabase_url', cleanUrl);
  localStorage.setItem('astroworld_supabase_anon_key', cleanKey);

  clientInstance = createClient(cleanUrl, cleanKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return clientInstance;
};

export const clearSupabaseConfig = (): void => {
  localStorage.removeItem('astroworld_supabase_url');
  localStorage.removeItem('astroworld_supabase_anon_key');
  clientInstance = null;
};

/**
 * Validates credentials by performing a real ping to Supabase Auth API
 */
export const testSupabaseConnection = async (
  url: string,
  anonKey: string
): Promise<{ success: boolean; message: string }> => {
  const cleanUrl = url.trim().replace(/\/$/, '');
  const cleanKey = anonKey.trim();

  if (!cleanUrl.startsWith('https://') || !cleanUrl.includes('.supabase.co')) {
    return {
      success: false,
      message: 'Invalid Project URL. It should look like: https://abcdefghijkl.supabase.co',
    };
  }

  if (cleanKey.length < 30) {
    return {
      success: false,
      message: 'Invalid Anon Key. Please paste the full anon public key from Project Settings -> API.',
    };
  }

  try {
    const testClient = createClient(cleanUrl, cleanKey, {
      auth: { persistSession: false },
    });

    // Test health check or session endpoint
    const { error } = await testClient.auth.getSession();
    if (error && error.message.includes('Invalid API key')) {
      return {
        success: false,
        message: 'Supabase rejected the Anon Key (Invalid API key). Please recheck Project Settings -> API.',
      };
    }

    return {
      success: true,
      message: 'Successfully connected to Supabase!',
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Failed to reach Supabase endpoint. Please verify URL and network.',
    };
  }
};

export const supabase = getSupabaseClient();
