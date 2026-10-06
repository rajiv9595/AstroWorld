-- =============================================================================
-- ASTROWORLD AI V2 — Migration 003: Durable Conversation State
-- =============================================================================

ALTER TABLE conversations
    ADD COLUMN IF NOT EXISTS state_version INT NOT NULL DEFAULT 0;

ALTER TABLE conversations
    ADD COLUMN IF NOT EXISTS state_payload JSONB;

ALTER TABLE conversation_messages
    ADD COLUMN IF NOT EXISTS turn_payload JSONB;

CREATE INDEX IF NOT EXISTS idx_conversations_user_status
    ON conversations(user_id, status, updated_at DESC);
