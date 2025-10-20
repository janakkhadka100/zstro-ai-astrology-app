// lib/db/schema.ts
// Database schema for history and user data

import { sql } from 'drizzle-orm';
import { pgTable, text, timestamp, jsonb, uuid, integer, boolean, index } from 'drizzle-orm/pg-core';

// Import memory schema
export * from './schema/memory';

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name'),
  memoryConsent: boolean('memory_consent').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  lastLoginAt: timestamp('last_login_at'),
  isActive: boolean('is_active').default(true).notNull(),
});

// Sessions table for chat sessions
export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  isActive: boolean('is_active').default(true).notNull(),
}, (table) => ({
  userIdIdx: index('sessions_user_id_idx').on(table.userId),
  createdAtIdx: index('sessions_created_at_idx').on(table.createdAt),
}));

// Messages table for chat messages
export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').references(() => sessions.id, { onDelete: 'cascade' }).notNull(),
  role: text('role').notNull(), // 'user' | 'assistant' | 'system'
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  metadata: jsonb('metadata'), // Additional message metadata
}, (table) => ({
  sessionIdIdx: index('messages_session_id_idx').on(table.sessionId),
  createdAtIdx: index('messages_created_at_idx').on(table.createdAt),
  roleIdx: index('messages_role_idx').on(table.role),
}));

// Snapshots table for astro data snapshots
export const snapshots = pgTable('snapshots', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').references(() => sessions.id, { onDelete: 'cascade' }).notNull(),
  messageId: uuid('message_id').references(() => messages.id, { onDelete: 'cascade' }),
  cards: jsonb('cards').notNull(), // AstroData snapshot
  analysis: text('analysis'), // LLM analysis text
  provenance: jsonb('provenance'), // Data provenance info
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  sessionIdIdx: index('snapshots_session_id_idx').on(table.sessionId),
  messageIdIdx: index('snapshots_message_id_idx').on(table.messageId),
  createdAtIdx: index('snapshots_created_at_idx').on(table.createdAt),
}));

// User preferences table
export const userPreferences = pgTable('user_preferences', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  language: text('language').default('ne').notNull(), // 'ne' | 'en'
  theme: text('theme').default('system').notNull(), // 'light' | 'dark' | 'system'
  notifications: jsonb('notifications').default({}).notNull(), // Notification preferences
  astrologySettings: jsonb('astrology_settings').default({}).notNull(), // Astrology-specific settings
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Analysis history table for tracking analysis patterns
export const analysisHistory = pgTable('analysis_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  question: text('question').notNull(),
  questionHash: text('question_hash').notNull(), // For deduplication
  language: text('language').notNull(),
  analysis: text('analysis').notNull(),
  cardsUsed: jsonb('cards_used').notNull(), // Which cards were used
  dataNeeded: jsonb('data_needed'), // What additional data was fetched
  responseTime: integer('response_time'), // Response time in ms
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('analysis_history_user_id_idx').on(table.userId),
  questionHashIdx: index('analysis_history_question_hash_idx').on(table.questionHash),
  createdAtIdx: index('analysis_history_created_at_idx').on(table.createdAt),
}));

// Cache invalidation table for managing cache lifecycle
export const cacheInvalidation = pgTable('cache_invalidation', {
  id: uuid('id').primaryKey().defaultRandom(),
  cacheKey: text('cache_key').notNull().unique(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  invalidatedAt: timestamp('invalidated_at').defaultNow().notNull(),
  reason: text('reason'), // Why it was invalidated
}, (table) => ({
  cacheKeyIdx: index('cache_invalidation_cache_key_idx').on(table.cacheKey),
  userIdIdx: index('cache_invalidation_user_id_idx').on(table.userId),
  invalidatedAtIdx: index('cache_invalidation_invalidated_at_idx').on(table.invalidatedAt),
}));

// Additional tables for compatibility
export const chat = pgTable('chat', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const document = pgTable('document', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    title: text('title').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const suggestion = pgTable('suggestion', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const vote = pgTable('vote', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  suggestionId: uuid('suggestion_id').references(() => suggestion.id, { onDelete: 'cascade' }).notNull(),
  value: integer('value').notNull(), // 1 or -1
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const astrologicalData = pgTable('astrological_data', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  data: jsonb('data').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const district = pgTable('district', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  province: text('province').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const payment = pgTable('payment', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  amount: integer('amount').notNull(),
  currency: text('currency').default('NPR').notNull(),
  status: text('status').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const subscription = pgTable('subscription', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  plan: text('plan').notNull(),
  status: text('status').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Export additional types
export type Chat = typeof chat.$inferSelect;
export type NewChat = typeof chat.$inferInsert;

export type Document = typeof document.$inferSelect;
export type NewDocument = typeof document.$inferInsert;

export type Suggestion = typeof suggestion.$inferSelect;
export type NewSuggestion = typeof suggestion.$inferInsert;

export type Vote = typeof vote.$inferSelect;
export type NewVote = typeof vote.$inferInsert;

export type AstrologicalData = typeof astrologicalData.$inferSelect;
export type NewAstrologicalData = typeof astrologicalData.$inferInsert;

export type District = typeof district.$inferSelect;
export type NewDistrict = typeof district.$inferInsert;

export type Payment = typeof payment.$inferSelect;
export type NewPayment = typeof payment.$inferInsert;

export type Subscription = typeof subscription.$inferSelect;
export type NewSubscription = typeof subscription.$inferInsert;

// Export types for TypeScript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;

export type Snapshot = typeof snapshots.$inferSelect;
export type NewSnapshot = typeof snapshots.$inferInsert;

export type UserPreferences = typeof userPreferences.$inferSelect;
export type NewUserPreferences = typeof userPreferences.$inferInsert;

export type AnalysisHistory = typeof analysisHistory.$inferSelect;
export type NewAnalysisHistory = typeof analysisHistory.$inferInsert;

export type CacheInvalidation = typeof cacheInvalidation.$inferSelect;
export type NewCacheInvalidation = typeof cacheInvalidation.$inferInsert;

// Extended types with relationships
export interface SessionWithMessages extends Session {
  messages: Message[];
  snapshots: Snapshot[];
}

export interface MessageWithSnapshot extends Message {
  snapshot?: Snapshot;
}

export interface UserWithSessions extends User {
  sessions: SessionWithMessages[];
  preferences?: UserPreferences;
}

// Database indexes for performance
export const indexes = {
  // User indexes
  users_email_idx: 'users_email_idx',
  users_created_at_idx: 'users_created_at_idx',
  
  // Session indexes
  sessions_user_id_idx: 'sessions_user_id_idx',
  sessions_created_at_idx: 'sessions_created_at_idx',
  
  // Message indexes
  messages_session_id_idx: 'messages_session_id_idx',
  messages_created_at_idx: 'messages_created_at_idx',
  messages_role_idx: 'messages_role_idx',
  
  // Snapshot indexes
  snapshots_session_id_idx: 'snapshots_session_id_idx',
  snapshots_message_id_idx: 'snapshots_message_id_idx',
  snapshots_created_at_idx: 'snapshots_created_at_idx',
  
  // Analysis history indexes
  analysis_history_user_id_idx: 'analysis_history_user_id_idx',
  analysis_history_question_hash_idx: 'analysis_history_question_hash_idx',
  analysis_history_created_at_idx: 'analysis_history_created_at_idx',
  
  // Cache invalidation indexes
  cache_invalidation_cache_key_idx: 'cache_invalidation_cache_key_idx',
  cache_invalidation_user_id_idx: 'cache_invalidation_user_id_idx',
  cache_invalidation_invalidated_at_idx: 'cache_invalidation_invalidated_at_idx',
} as const;