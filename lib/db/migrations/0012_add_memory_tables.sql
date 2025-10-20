-- Migration: Add memory tables for user experience tracking
-- Created: 2024-01-20

-- User memory table for storing life events and planetary context
CREATE TABLE IF NOT EXISTS user_memory (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    event_date DATE,
    event_type VARCHAR(64),
    event_description TEXT,
    planetary_context JSONB,
    dasha_context JSONB,
    transit_context JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Chat history table for storing conversation context
CREATE TABLE IF NOT EXISTS chat_history (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    message TEXT NOT NULL,
    response TEXT,
    context JSONB,
    event_extracted JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- User experience table for tracking AI learning progress
CREATE TABLE IF NOT EXISTS user_experience (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL UNIQUE,
    experience_score VARCHAR(3) DEFAULT '0',
    total_sessions VARCHAR(10) DEFAULT '0',
    successful_sessions VARCHAR(10) DEFAULT '0',
    last_active TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_memory_user_id ON user_memory(user_id);
CREATE INDEX IF NOT EXISTS idx_user_memory_event_date ON user_memory(event_date);
CREATE INDEX IF NOT EXISTS idx_user_memory_event_type ON user_memory(event_type);
CREATE INDEX IF NOT EXISTS idx_user_memory_created_at ON user_memory(created_at);

CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_created_at ON chat_history(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_history_event_extracted ON chat_history USING GIN(event_extracted);

CREATE INDEX IF NOT EXISTS idx_user_experience_user_id ON user_experience(user_id);
CREATE INDEX IF NOT EXISTS idx_user_experience_score ON user_experience(experience_score);
CREATE INDEX IF NOT EXISTS idx_user_experience_last_active ON user_experience(last_active);

-- Comments
COMMENT ON TABLE user_memory IS 'Stores user life events with planetary context for pattern learning';
COMMENT ON TABLE chat_history IS 'Stores chat conversations with extracted events';
COMMENT ON TABLE user_experience IS 'Tracks user experience level for personalized AI responses';

COMMENT ON COLUMN user_memory.planetary_context IS 'JSONB snapshot of planetary positions during the event';
COMMENT ON COLUMN user_memory.dasha_context IS 'JSONB snapshot of dasha periods during the event';
COMMENT ON COLUMN user_memory.transit_context IS 'JSONB snapshot of transit positions during the event';

COMMENT ON COLUMN chat_history.event_extracted IS 'JSONB extracted events from the conversation';
COMMENT ON COLUMN chat_history.context IS 'JSONB astrological context used for the response';

COMMENT ON COLUMN user_experience.experience_score IS 'Experience score from 0-100 for personalized responses';
COMMENT ON COLUMN user_experience.total_sessions IS 'Total number of chat sessions';
COMMENT ON COLUMN user_experience.successful_sessions IS 'Number of successful/helpful sessions';
