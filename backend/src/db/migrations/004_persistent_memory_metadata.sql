-- =============================================================================
-- ASTROWORLD AI V2 — Migration 004: Persistent Memory Metadata
-- =============================================================================

ALTER TABLE persistent_memories
    ADD COLUMN IF NOT EXISTS normalized_value TEXT;

ALTER TABLE persistent_memories
    ADD COLUMN IF NOT EXISTS source_trust VARCHAR(32);

ALTER TABLE persistent_memories
    ADD COLUMN IF NOT EXISTS source_turn_id VARCHAR(128);

ALTER TABLE persistent_memories
    ADD COLUMN IF NOT EXISTS conversation_id VARCHAR(64);

ALTER TABLE persistent_memories
    ADD COLUMN IF NOT EXISTS sensitivity VARCHAR(16) NOT NULL DEFAULT 'normal';

ALTER TABLE persistent_memories
    ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE persistent_memories
    ADD COLUMN IF NOT EXISTS last_validated_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE persistent_memories
    ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE persistent_memories
    ADD COLUMN IF NOT EXISTS supersedes_memory_id VARCHAR(64);

ALTER TABLE persistent_memories
    ADD COLUMN IF NOT EXISTS superseded_by_memory_id VARCHAR(64);

ALTER TABLE persistent_memories
    ADD COLUMN IF NOT EXISTS validation_status VARCHAR(32) NOT NULL DEFAULT 'not_applicable';

ALTER TABLE persistent_memories
    ADD COLUMN IF NOT EXISTS evidence_refs JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE persistent_memories
    ADD COLUMN IF NOT EXISTS version INT NOT NULL DEFAULT 1;

ALTER TABLE persistent_memories
    ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_memories_user_updated
    ON persistent_memories(user_id, updated_at DESC);
