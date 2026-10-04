-- =============================================================================
-- ASTROWORLD AI V2 — Migration 002: Indexes & High-Performance Constraints
-- =============================================================================

-- Composite user and status index on persistent memories for low-latency retrieval
CREATE INDEX IF NOT EXISTS idx_memories_user_status ON persistent_memories(user_id, status);

-- Category and key lookup index for persistent memories
CREATE INDEX IF NOT EXISTS idx_memories_user_cat_key ON persistent_memories(user_id, category, key);

-- Monotonic turn ordering index for conversations
CREATE INDEX IF NOT EXISTS idx_messages_conv_turn ON conversation_messages(conversation_id, turn_index ASC);

-- User-scoped conversations index
CREATE INDEX IF NOT EXISTS idx_conversations_user ON conversations(user_id, updated_at DESC);

-- Idempotency expiry index for fast TTL cleanup
CREATE INDEX IF NOT EXISTS idx_idempotency_expires ON idempotency_cache(expires_at);

-- Add uniqueness constraint on active memory key per user
CREATE UNIQUE INDEX IF NOT EXISTS uq_active_memory_key ON persistent_memories(user_id, category, key) WHERE status = 'active';
