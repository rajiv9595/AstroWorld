-- =============================================================================
-- ASTROWORLD — Migration 006: Astrological Case Bank & Vector Indexing
--
-- Supports enterprise scale (10,000+ verified case studies) with high-dimensional
-- astronomical chart fingerprints, domain categorizations, and vector search.
-- =============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.astrological_case_studies (
    id VARCHAR(64) PRIMARY KEY,
    slug VARCHAR(128) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    domain VARCHAR(64) NOT NULL CHECK (domain IN (
        'career', 'wealth', 'marriage', 'health', 'education',
        'litigation', 'children', 'spirituality', 'foreign_travel', 'general'
    )),
    sub_domain VARCHAR(128),
    
    -- Exact Astrological Birth Baseline
    birth_year INT NOT NULL,
    birth_month INT NOT NULL,
    birth_day INT NOT NULL,
    birth_hour INT NOT NULL,
    birth_minute INT NOT NULL,
    birth_second INT NOT NULL DEFAULT 0,
    birth_latitude NUMERIC(9, 6) NOT NULL,
    birth_longitude NUMERIC(9, 6) NOT NULL,
    birth_timezone VARCHAR(64) NOT NULL,
    city_name VARCHAR(255),
    
    -- Historical Verified Life Event
    event_title VARCHAR(255) NOT NULL,
    event_date DATE NOT NULL,
    event_age NUMERIC(5, 2) NOT NULL,
    historical_outcome TEXT NOT NULL,
    shastric_root_cause TEXT NOT NULL,
    provenance_reference VARCHAR(255) NOT NULL,
    authenticity_grade VARCHAR(16) NOT NULL DEFAULT 'A' CHECK (authenticity_grade IN ('A', 'AA', 'B', 'C')),
    
    -- High-Dimensional Chart Fingerprint & Mathematical Vectors
    chart_fingerprint JSONB NOT NULL,
    embedding_vector FLOAT8[] NOT NULL DEFAULT '{}',
    
    verification_status VARCHAR(32) NOT NULL DEFAULT 'verified',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_case_studies_domain ON public.astrological_case_studies(domain);
CREATE INDEX IF NOT EXISTS idx_case_studies_event_date ON public.astrological_case_studies(event_date);
CREATE INDEX IF NOT EXISTS idx_case_studies_authenticity ON public.astrological_case_studies(authenticity_grade);
CREATE INDEX IF NOT EXISTS idx_case_studies_fingerprint ON public.astrological_case_studies USING GIN (chart_fingerprint);

COMMIT;

