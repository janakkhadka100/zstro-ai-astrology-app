-- Migration: Add performance indexes
-- Description: Add indexes for better query performance
-- Date: 2024-01-15

-- Indexes for users table
CREATE INDEX IF NOT EXISTS "idx_users_email" ON "users" ("email");
CREATE INDEX IF NOT EXISTS "idx_users_created_at" ON "users" ("createdAt");
CREATE INDEX IF NOT EXISTS "idx_users_updated_at" ON "users" ("updatedAt");

-- Indexes for transactions table
CREATE INDEX IF NOT EXISTS "idx_transactions_user_id" ON "transactions" ("userId");
CREATE INDEX IF NOT EXISTS "idx_transactions_created_at" ON "transactions" ("createdAt");
CREATE INDEX IF NOT EXISTS "idx_transactions_user_id_created_at" ON "transactions" ("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "idx_transactions_status" ON "transactions" ("status");
CREATE INDEX IF NOT EXISTS "idx_transactions_payment_method" ON "transactions" ("paymentMethod");

-- Indexes for chats table
CREATE INDEX IF NOT EXISTS "idx_chats_user_id" ON "chats" ("userId");
CREATE INDEX IF NOT EXISTS "idx_chats_created_at" ON "chats" ("createdAt");
CREATE INDEX IF NOT EXISTS "idx_chats_user_id_created_at" ON "chats" ("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "idx_chats_visibility" ON "chats" ("visibility");

-- Indexes for messages table
CREATE INDEX IF NOT EXISTS "idx_messages_chat_id" ON "messages" ("chatId");
CREATE INDEX IF NOT EXISTS "idx_messages_created_at" ON "messages" ("createdAt");
CREATE INDEX IF NOT EXISTS "idx_messages_chat_id_created_at" ON "messages" ("chatId", "createdAt");
CREATE INDEX IF NOT EXISTS "idx_messages_role" ON "messages" ("role");

-- Indexes for astrological_data table
CREATE INDEX IF NOT EXISTS "idx_astrological_data_user_id" ON "astrological_data" ("userId");
CREATE INDEX IF NOT EXISTS "idx_astrological_data_created_at" ON "astrological_data" ("createdAt");
CREATE INDEX IF NOT EXISTS "idx_astrological_data_user_id_created_at" ON "astrological_data" ("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "idx_astrological_data_birth_date" ON "astrological_data" ("birthDate");
CREATE INDEX IF NOT EXISTS "idx_astrological_data_birth_place" ON "astrological_data" ("birthPlace");

-- Indexes for user_preferences table
CREATE INDEX IF NOT EXISTS "idx_user_preferences_user_id" ON "user_preferences" ("userId");
CREATE INDEX IF NOT EXISTS "idx_user_preferences_key" ON "user_preferences" ("key");
CREATE INDEX IF NOT EXISTS "idx_user_preferences_user_id_key" ON "user_preferences" ("userId", "key");

-- Indexes for cache table
CREATE INDEX IF NOT EXISTS "idx_cache_key" ON "cache" ("key");
CREATE INDEX IF NOT EXISTS "idx_cache_expires_at" ON "cache" ("expiresAt");
CREATE INDEX IF NOT EXISTS "idx_cache_created_at" ON "cache" ("createdAt");

-- Indexes for audit_logs table
CREATE INDEX IF NOT EXISTS "idx_audit_logs_user_id" ON "audit_logs" ("userId");
CREATE INDEX IF NOT EXISTS "idx_audit_logs_created_at" ON "audit_logs" ("createdAt");
CREATE INDEX IF NOT EXISTS "idx_audit_logs_action" ON "audit_logs" ("action");
CREATE INDEX IF NOT EXISTS "idx_audit_logs_user_id_created_at" ON "audit_logs" ("userId", "createdAt");

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS "idx_chats_user_visibility_created" ON "chats" ("userId", "visibility", "createdAt");
CREATE INDEX IF NOT EXISTS "idx_messages_chat_role_created" ON "messages" ("chatId", "role", "createdAt");
CREATE INDEX IF NOT EXISTS "idx_transactions_user_status_created" ON "transactions" ("userId", "status", "createdAt");

-- Partial indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_active_users" ON "users" ("id") WHERE "deletedAt" IS NULL;
CREATE INDEX IF NOT EXISTS "idx_pending_transactions" ON "transactions" ("id") WHERE "status" = 'pending';
CREATE INDEX IF NOT EXISTS "idx_public_chats" ON "chats" ("id") WHERE "visibility" = 'public';

-- Analyze tables to update statistics
ANALYZE "users";
ANALYZE "transactions";
ANALYZE "chats";
ANALYZE "messages";
ANALYZE "astrological_data";
ANALYZE "user_preferences";
ANALYZE "cache";
ANALYZE "audit_logs";
