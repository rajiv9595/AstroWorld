/**
 * ASTROWORLD — Backend Supabase Service
 *
 * The backend owns privileged Supabase operations. It intentionally requires
 * the server-only service-role key and never falls back to a browser VITE key.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
const supabaseServiceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseServiceRoleKey);

if (!isSupabaseConfigured) {
  console.warn(
    '[BACKEND SUPABASE WARNING] SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for privileged backend operations.',
  );
}

// Keep module imports safe for offline structural/unit tests. The readiness
// endpoint reports the configuration failure instead of allowing production
// traffic to assume persistence is available.
const clientUrl = supabaseUrl || 'https://placeholder.invalid';
const clientKey = supabaseServiceRoleKey || 'missing-service-role-key';

export const supabase: SupabaseClient = createClient(clientUrl, clientKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
