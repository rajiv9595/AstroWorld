-- ==============================================================================
-- ASTROWORLD — Complete Production Supabase PostgreSQL Schema & Security Policies
--
-- Single unified master schema for the entire AstroWorld platform.
-- Includes:
--   1. Extensions & Custom Types
--   2. Core Astrology Tables (profiles, kundli_charts, saved_consultations, bookmarks)
--   3. AI V2/V3 Multi-Turn Consultation & Memory (conversations, messages, memories)
--   4. Idempotency, Feedback & Audit Logs
--   5. Strong Check Constraints (coordinate boundaries, time, date sanity)
--   6. High-Performance Query Indexes
--   7. Enterprise Row Level Security (RLS) Policies on EVERY table
--   8. Automated Triggers (User Provisioning & Timestamp Maintenance)
--
-- Run this script in your Supabase Dashboard: SQL Editor -> New Query -> Run
-- ==============================================================================

BEGIN;

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. USER PROFILES TABLE (Mirrors and extends auth.users)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  birth_date DATE,
  birth_time TIME,
  birth_place TEXT,
  latitude NUMERIC(9, 6) CHECK (latitude IS NULL OR (latitude >= -90.0 AND latitude <= 90.0)),
  longitude NUMERIC(9, 6) CHECK (longitude IS NULL OR (longitude >= -180.0 AND longitude <= 180.0)),
  timezone TEXT DEFAULT 'Asia/Kolkata',
  preferred_chart_style TEXT DEFAULT 'NORTH_INDIAN' CHECK (preferred_chart_style IN ('NORTH_INDIAN', 'SOUTH_INDIAN', 'EAST_INDIAN')),
  preferred_ayanamsa TEXT DEFAULT 'LAHIRI' CHECK (preferred_ayanamsa IN ('LAHIRI', 'RAMAN', 'KRISHNAMURTI', 'FAGAN_BRADLEY', 'TROPICAL')),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 3. SAVED KUNDLI BIRTH CHARTS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.kundli_charts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  year INTEGER NOT NULL CHECK (year >= 1800 AND year <= 2200),
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  day INTEGER NOT NULL CHECK (day >= 1 AND day <= 31),
  hour INTEGER NOT NULL CHECK (hour >= 0 AND hour <= 23),
  minute INTEGER NOT NULL CHECK (minute >= 0 AND minute <= 59),
  second INTEGER DEFAULT 0 CHECK (second >= 0 AND second <= 59),
  latitude NUMERIC(9, 6) NOT NULL CHECK (latitude >= -90.0 AND latitude <= 90.0),
  longitude NUMERIC(9, 6) NOT NULL CHECK (longitude >= -180.0 AND longitude <= 180.0),
  timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  city_name TEXT,
  gender TEXT DEFAULT 'male' CHECK (gender IN ('male', 'female', 'other')),
  notes TEXT,
  chart_style TEXT DEFAULT 'NORTH_INDIAN' CHECK (chart_style IN ('NORTH_INDIAN', 'SOUTH_INDIAN', 'EAST_INDIAN')),
  is_primary BOOLEAN DEFAULT false,
  calculation_metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 4. SAVED AI ASTROLOGER CONSULTATIONS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.saved_consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chart_id UUID REFERENCES public.kundli_charts(id) ON DELETE SET NULL,
  domain TEXT NOT NULL DEFAULT 'COMPREHENSIVE',
  query TEXT NOT NULL,
  synthesis TEXT NOT NULL,
  evidence_citations JSONB DEFAULT '[]'::jsonb,
  source TEXT DEFAULT 'gemini_grounded',
  model_name TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 5. USER ASTROLOGICAL BOOKMARKS TABLE (Yogas, Dasha Windows, Research)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.user_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL DEFAULT 'GENERAL' CHECK (category IN ('GENERAL', 'YOGA', 'DASHA', 'TRANSIT', 'VARGA', 'RESEARCH', 'MEDICINE_REMEDY')),
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 6. AI CONVERSATIONS TABLE (Multi-Turn Consultation Sessions)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.conversations (
  id VARCHAR(64) PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
  state_version INT NOT NULL DEFAULT 0,
  state_payload JSONB,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 7. CONVERSATION MESSAGES TABLE (Turns, Citations & Payloads)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.conversation_messages (
  id VARCHAR(64) PRIMARY KEY,
  conversation_id VARCHAR(64) NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(16) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  turn_index INT NOT NULL CHECK (turn_index >= 0),
  turn_payload JSONB,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 8. PERSISTENT MEMORIES TABLE (Longitudinal Cross-Session Knowledge)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.persistent_memories (
  memory_id VARCHAR(64) PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category VARCHAR(32) NOT NULL,
  "key" VARCHAR(128) NOT NULL,
  value TEXT NOT NULL,
  source_type VARCHAR(32) NOT NULL,
  source_trust VARCHAR(32),
  source_turn_id VARCHAR(128),
  conversation_id VARCHAR(64) REFERENCES public.conversations(id) ON DELETE CASCADE,
  status VARCHAR(32) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'superseded', 'deleted', 'archived')),
  confidence DOUBLE PRECISION NOT NULL DEFAULT 1.0 CHECK (confidence >= 0.0 AND confidence <= 1.0),
  superseded_by VARCHAR(64),
  supersedes_memory_id VARCHAR(64),
  superseded_by_memory_id VARCHAR(64),
  tags TEXT[] NOT NULL DEFAULT '{}',
  normalized_value TEXT,
  sensitivity VARCHAR(16) NOT NULL DEFAULT 'normal' CHECK (sensitivity IN ('normal', 'sensitive', 'confidential')),
  last_used_at TIMESTAMPTZ,
  last_validated_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  validation_status VARCHAR(32) NOT NULL DEFAULT 'not_applicable',
  evidence_refs JSONB NOT NULL DEFAULT '[]'::jsonb,
  version INT NOT NULL DEFAULT 1,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 9. IDEMPOTENCY CACHE TABLE (Deduplication & Concurrency Protection)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.idempotency_cache (
  key VARCHAR(128) PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id VARCHAR(64) NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  response_payload JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL
);

-- ==============================================================================
-- 10. CONSULTATION FEEDBACK TABLE (User Rating & Accuracy Quality)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.consultation_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id VARCHAR(64) REFERENCES public.conversations(id) ON DELETE CASCADE,
  turn_index INT,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  category TEXT DEFAULT 'ACCURACY' CHECK (category IN ('ACCURACY', 'TONE', 'ASTROLOGICAL_DEPTH', 'TIMING', 'GENERAL')),
  feedback_text TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 11. SECURITY AUDIT LOGS TABLE (Access & Calculation Trail)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- INDEXES FOR FAST RETRIEVAL & OPTIMAL QUERY PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_kundli_charts_user_id ON public.kundli_charts(user_id);
CREATE INDEX IF NOT EXISTS idx_kundli_charts_user_primary ON public.kundli_charts(user_id, is_primary) WHERE is_primary = true;
CREATE INDEX IF NOT EXISTS idx_kundli_charts_created_at ON public.kundli_charts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_saved_consultations_user_id ON public.saved_consultations(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_consultations_created_at ON public.saved_consultations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_user_id ON public.user_bookmarks(user_id);

CREATE INDEX IF NOT EXISTS idx_conversations_user ON public.conversations(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_user_status ON public.conversations(user_id, status, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_conv_turn ON public.conversation_messages(conversation_id, turn_index ASC);
CREATE INDEX IF NOT EXISTS idx_messages_user ON public.conversation_messages(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_memories_user_status ON public.persistent_memories(user_id, status);
CREATE INDEX IF NOT EXISTS idx_memories_user_cat_key ON public.persistent_memories(user_id, category, "key");
CREATE INDEX IF NOT EXISTS idx_memories_user_updated ON public.persistent_memories(user_id, updated_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS uq_active_memory_key ON public.persistent_memories(user_id, category, "key") WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_idempotency_expires ON public.idempotency_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_feedback_user ON public.consultation_feedback(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_user ON public.audit_logs(user_id, created_at DESC);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES — Guarantees Complete Tenant Data Isolation
-- ==============================================================================

-- Enable RLS on ALL tables without exception
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kundli_charts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.persistent_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.idempotency_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultation_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- Profiles Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- Kundli Charts Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "charts_select_own" ON public.kundli_charts;
CREATE POLICY "charts_select_own" ON public.kundli_charts FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "charts_insert_own" ON public.kundli_charts;
CREATE POLICY "charts_insert_own" ON public.kundli_charts FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "charts_update_own" ON public.kundli_charts;
CREATE POLICY "charts_update_own" ON public.kundli_charts FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "charts_delete_own" ON public.kundli_charts;
CREATE POLICY "charts_delete_own" ON public.kundli_charts FOR DELETE USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- Saved Consultations Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "consultations_select_own" ON public.saved_consultations;
CREATE POLICY "consultations_select_own" ON public.saved_consultations FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "consultations_insert_own" ON public.saved_consultations;
CREATE POLICY "consultations_insert_own" ON public.saved_consultations FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "consultations_delete_own" ON public.saved_consultations;
CREATE POLICY "consultations_delete_own" ON public.saved_consultations FOR DELETE USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- User Bookmarks Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "bookmarks_select_own" ON public.user_bookmarks;
CREATE POLICY "bookmarks_select_own" ON public.user_bookmarks FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "bookmarks_insert_own" ON public.user_bookmarks;
CREATE POLICY "bookmarks_insert_own" ON public.user_bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "bookmarks_delete_own" ON public.user_bookmarks;
CREATE POLICY "bookmarks_delete_own" ON public.user_bookmarks FOR DELETE USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- Conversations & Messages Policies (Browser user can read/delete their own)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "conversations_select_own" ON public.conversations;
CREATE POLICY "conversations_select_own" ON public.conversations FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "conversations_insert_own" ON public.conversations;
CREATE POLICY "conversations_insert_own" ON public.conversations FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "conversations_update_own" ON public.conversations;
CREATE POLICY "conversations_update_own" ON public.conversations FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "conversations_delete_own" ON public.conversations;
CREATE POLICY "conversations_delete_own" ON public.conversations FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "messages_select_own" ON public.conversation_messages;
CREATE POLICY "messages_select_own" ON public.conversation_messages FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "messages_insert_own" ON public.conversation_messages;
CREATE POLICY "messages_insert_own" ON public.conversation_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- Consultation Feedback Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "feedback_select_own" ON public.consultation_feedback;
CREATE POLICY "feedback_select_own" ON public.consultation_feedback FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "feedback_insert_own" ON public.consultation_feedback;
CREATE POLICY "feedback_insert_own" ON public.consultation_feedback FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- Server-Managed Internal Tables: Revoke browser access, grant to service_role
-- ------------------------------------------------------------------------------
REVOKE ALL ON TABLE
    public.persistent_memories,
    public.idempotency_cache,
    public.audit_logs
FROM PUBLIC, anon, authenticated;

GRANT ALL ON TABLE
    public.profiles,
    public.kundli_charts,
    public.saved_consultations,
    public.user_bookmarks,
    public.conversations,
    public.conversation_messages,
    public.persistent_memories,
    public.idempotency_cache,
    public.consultation_feedback,
    public.audit_logs
TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
    public.profiles,
    public.kundli_charts,
    public.saved_consultations,
    public.user_bookmarks,
    public.conversations,
    public.conversation_messages,
    public.consultation_feedback
TO authenticated;

GRANT SELECT ON TABLE
    public.profiles
TO anon;

-- ==============================================================================
-- DATABASE TRIGGERS & AUTOMATION
-- ==============================================================================

-- 1. Automatically create public.profiles record when a new user signs up in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    updated_at = timezone('utc'::text, now());
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. Reciprocal User Deletion Trigger:
-- If a user row is deleted from public.profiles, permanently delete them from auth.users.
-- This ensures:
--   a) All linked data (chats, messages, charts, memories, feedback, bookmarks) cascade deletes everywhere.
--   b) Their login credentials in auth.users are permanently deleted so they cannot log in again.
--   c) If they return, they must sign up anew as a new user.
CREATE OR REPLACE FUNCTION public.handle_profile_deleted()
RETURNS trigger AS $$
BEGIN
  DELETE FROM auth.users WHERE id = old.id;
  RETURN old;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_profile_deleted ON public.profiles;
CREATE TRIGGER on_profile_deleted
  AFTER DELETE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_profile_deleted();

-- 3. If an auth.user is deleted directly from Supabase Auth, ensure public.profiles is deleted
CREATE OR REPLACE FUNCTION public.handle_auth_user_deleted()
RETURNS trigger AS $$
BEGIN
  DELETE FROM public.profiles WHERE id = old.id;
  RETURN old;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
  BEFORE DELETE ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_auth_user_deleted();

-- 4. Automatically update updated_at timestamp on row modification
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  new.updated_at = timezone('utc'::text, now());
  RETURN new;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_modtime ON public.profiles;
CREATE TRIGGER update_profiles_modtime
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

DROP TRIGGER IF EXISTS update_kundli_charts_modtime ON public.kundli_charts;
CREATE TRIGGER update_kundli_charts_modtime
  BEFORE UPDATE ON public.kundli_charts
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

DROP TRIGGER IF EXISTS update_conversations_modtime ON public.conversations;
CREATE TRIGGER update_conversations_modtime
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

DROP TRIGGER IF EXISTS update_persistent_memories_modtime ON public.persistent_memories;
CREATE TRIGGER update_persistent_memories_modtime
  BEFORE UPDATE ON public.persistent_memories
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';

COMMIT;
