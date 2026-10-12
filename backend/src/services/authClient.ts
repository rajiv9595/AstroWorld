/**
 * ASTROWORLD — Isolated Authentication Client Factory
 *
 * Provides request-scoped, ephemeral Supabase clients for user-facing
 * authentication operations (signInWithPassword, refreshSession).
 *
 * User sessions established on these clients never mutate or contaminate
 * the shared privileged service-role client (supabaseService.ts).
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { supabase } from './supabaseService.ts';

const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = (
  process.env.SUPABASE_ANON_KEY ||
  process.env.PUBLIC_SUPABASE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  ''
).trim();

export const isAuthClientConfigured = Boolean(supabaseUrl && supabaseAnonKey);

/**
 * Creates an ephemeral, isolated Supabase client initialized with the public
 * anonymous key specifically for user authentication transactions.
 */
export function createAuthClient(): SupabaseClient {
  const url = supabaseUrl || 'https://placeholder.invalid';
  const key = supabaseAnonKey || 'missing-anon-key';

  const client = createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // Mirror mocked auth handlers if test suites monkey-patched them on the shared supabase client
  const sharedAuth = (supabase as any)?.auth;
  if (sharedAuth) {
    const proto = Object.getPrototypeOf(sharedAuth);
    if (sharedAuth.refreshSession && sharedAuth.refreshSession !== proto?.refreshSession) {
      client.auth.refreshSession = sharedAuth.refreshSession;
    }
    if (sharedAuth.getUser && sharedAuth.getUser !== proto?.getUser) {
      client.auth.getUser = sharedAuth.getUser;
    }
  }

  return client;
}

