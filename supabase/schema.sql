-- ==============================================================================
-- ASTROWORLD — Complete Production Supabase PostgreSQL Schema & Security Policies
-- Run this script in your Supabase Dashboard: SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. User Profiles Table (Mirrors and extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  birth_date DATE,
  birth_time TIME,
  birth_place TEXT,
  latitude NUMERIC(9, 6),
  longitude NUMERIC(9, 6),
  timezone TEXT DEFAULT 'Asia/Kolkata',
  preferred_chart_style TEXT DEFAULT 'NORTH_INDIAN' CHECK (preferred_chart_style IN ('NORTH_INDIAN', 'SOUTH_INDIAN')),
  preferred_ayanamsa TEXT DEFAULT 'LAHIRI',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Saved Kundli Birth Charts Table
CREATE TABLE IF NOT EXISTS public.kundli_charts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  day INTEGER NOT NULL,
  hour INTEGER NOT NULL,
  minute INTEGER NOT NULL,
  second INTEGER DEFAULT 0,
  latitude NUMERIC(9, 6) NOT NULL,
  longitude NUMERIC(9, 6) NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  city_name TEXT,
  gender TEXT DEFAULT 'male',
  notes TEXT,
  chart_style TEXT DEFAULT 'NORTH_INDIAN' CHECK (chart_style IN ('NORTH_INDIAN', 'SOUTH_INDIAN')),
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Saved AI Astrologer Consultations Table
CREATE TABLE IF NOT EXISTS public.saved_consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chart_id UUID REFERENCES public.kundli_charts(id) ON DELETE SET NULL,
  domain TEXT NOT NULL DEFAULT 'COMPREHENSIVE',
  query TEXT NOT NULL,
  synthesis TEXT NOT NULL,
  evidence_citations JSONB DEFAULT '[]'::jsonb,
  source TEXT DEFAULT 'gemini_grounded',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. User Astrological Bookmarks Table (Yogas, Dasha Windows, Research)
CREATE TABLE IF NOT EXISTS public.user_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL DEFAULT 'GENERAL',
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- INDEXES FOR FAST RETRIEVAL & OPTIMAL QUERY PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_kundli_charts_user_id ON public.kundli_charts(user_id);
CREATE INDEX IF NOT EXISTS idx_kundli_charts_created_at ON public.kundli_charts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_consultations_user_id ON public.saved_consultations(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_consultations_created_at ON public.saved_consultations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_user_id ON public.user_bookmarks(user_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES — Ensures Complete Tenant Data Isolation
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kundli_charts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_bookmarks ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Kundli Charts Policies
DROP POLICY IF EXISTS "Users can view their own saved charts" ON public.kundli_charts;
CREATE POLICY "Users can view their own saved charts"
  ON public.kundli_charts FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert charts for themselves" ON public.kundli_charts;
CREATE POLICY "Users can insert charts for themselves"
  ON public.kundli_charts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own charts" ON public.kundli_charts;
CREATE POLICY "Users can update their own charts"
  ON public.kundli_charts FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own charts" ON public.kundli_charts;
CREATE POLICY "Users can delete their own charts"
  ON public.kundli_charts FOR DELETE
  USING (auth.uid() = user_id);

-- Consultations Policies
DROP POLICY IF EXISTS "Users can view their own consultations" ON public.saved_consultations;
CREATE POLICY "Users can view their own consultations"
  ON public.saved_consultations FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert consultations for themselves" ON public.saved_consultations;
CREATE POLICY "Users can insert consultations for themselves"
  ON public.saved_consultations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own consultations" ON public.saved_consultations;
CREATE POLICY "Users can delete their own consultations"
  ON public.saved_consultations FOR DELETE
  USING (auth.uid() = user_id);

-- Bookmarks Policies
DROP POLICY IF EXISTS "Users can view their own bookmarks" ON public.user_bookmarks;
CREATE POLICY "Users can view their own bookmarks"
  ON public.user_bookmarks FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert bookmarks for themselves" ON public.user_bookmarks;
CREATE POLICY "Users can insert bookmarks for themselves"
  ON public.user_bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own bookmarks" ON public.user_bookmarks;
CREATE POLICY "Users can delete their own bookmarks"
  ON public.user_bookmarks FOR DELETE
  USING (auth.uid() = user_id);

-- ==============================================================================
-- DATABASE TRIGGERS & AUTOMATION
-- ==============================================================================

-- Trigger Function: Automatically create public.profile when a new user signs up in auth.users
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

-- Trigger Function: Update updated_at timestamp automatically
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
