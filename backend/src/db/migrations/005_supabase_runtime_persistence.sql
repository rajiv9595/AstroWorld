-- =============================================================================
-- ASTROWORLD — Migration 005: Supabase Runtime Persistence
--
-- Apply this migration by itself to projects that already use Supabase Auth
-- and the existing public.profiles / kundli_charts / saved_consultations schema.
--
-- This is an additive migration: it does not alter or copy existing astrology
-- tables. It uses auth.users.id (UUID) as the owner key and keeps conversation
-- and memory record IDs as VARCHAR because the application generates string IDs.
-- =============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.conversations (
    id VARCHAR(64) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'active',
    state_version INT NOT NULL DEFAULT 0,
    state_payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.conversation_messages (
    id VARCHAR(64) PRIMARY KEY,
    conversation_id VARCHAR(64) NOT NULL
        REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(16) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    turn_index INT NOT NULL,
    turn_payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.persistent_memories (
    memory_id VARCHAR(64) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category VARCHAR(32) NOT NULL,
    "key" VARCHAR(128) NOT NULL,
    value TEXT NOT NULL,
    source_type VARCHAR(32) NOT NULL,
    source_trust VARCHAR(32),
    source_turn_id VARCHAR(128),
    conversation_id VARCHAR(64),
    status VARCHAR(32) NOT NULL DEFAULT 'active',
    confidence DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    superseded_by VARCHAR(64),
    supersedes_memory_id VARCHAR(64),
    superseded_by_memory_id VARCHAR(64),
    tags TEXT[] NOT NULL DEFAULT '{}',
    normalized_value TEXT,
    sensitivity VARCHAR(16) NOT NULL DEFAULT 'normal',
    last_used_at TIMESTAMP WITH TIME ZONE,
    last_validated_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    validation_status VARCHAR(32) NOT NULL DEFAULT 'not_applicable',
    evidence_refs JSONB NOT NULL DEFAULT '[]'::jsonb,
    version INT NOT NULL DEFAULT 1,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.idempotency_cache (
    key VARCHAR(128) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    conversation_id VARCHAR(64) NOT NULL
        REFERENCES public.conversations(id) ON DELETE CASCADE,
    response_payload JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Query patterns used by the conversation and persistent-memory repositories.
CREATE INDEX IF NOT EXISTS idx_conversations_user
    ON public.conversations(user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_conversations_user_status
    ON public.conversations(user_id, status, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_conv_turn
    ON public.conversation_messages(conversation_id, turn_index ASC);

CREATE INDEX IF NOT EXISTS idx_memories_user_status
    ON public.persistent_memories(user_id, status);

CREATE INDEX IF NOT EXISTS idx_memories_user_cat_key
    ON public.persistent_memories(user_id, category, "key");

CREATE INDEX IF NOT EXISTS idx_memories_user_updated
    ON public.persistent_memories(user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_idempotency_expires
    ON public.idempotency_cache(expires_at);

CREATE UNIQUE INDEX IF NOT EXISTS uq_active_memory_key
    ON public.persistent_memories(user_id, category, "key")
    WHERE status = 'active';

-- Persistence is server-only. RLS plus explicit grants prevent browser roles
-- from reading or writing conversation content and long-term memory records.
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.persistent_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.idempotency_cache ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE
    public.conversations,
    public.conversation_messages,
    public.persistent_memories,
    public.idempotency_cache
FROM PUBLIC, anon, authenticated;

GRANT ALL ON TABLE
    public.conversations,
    public.conversation_messages,
    public.persistent_memories,
    public.idempotency_cache
TO service_role;

NOTIFY pgrst, 'reload schema';

COMMIT;
