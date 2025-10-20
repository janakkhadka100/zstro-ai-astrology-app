// lib/db/schema/memory.ts
import { pgTable, serial, varchar, date, text, jsonb, timestamp, boolean, index, numeric } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const userMemory = pgTable("user_memory", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 64 }).notNull(),
  eventDate: date("event_date"),
  eventType: varchar("event_type", { length: 64 }), // e.g. marriage, accident, promotion, illness, travel, success, failure
  eventDescription: text("event_description"),
  planetaryContext: jsonb("planetary_context"), // snapshot of planetary positions that day
  dashaContext: jsonb("dasha_context"), // dasha periods active during event
  transitContext: jsonb("transit_context"), // transit positions during event
  confidence: numeric("confidence", { precision: 3, scale: 2 }), // 0.00 - 1.00
  sourceMessageId: varchar("source_message_id", { length: 64 }),
  assumedTime: boolean("assumed_time").default(false),
  lang: varchar("lang", { length: 8 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("user_memory_user_id_idx").on(table.userId),
  eventDateIdx: index("user_memory_event_date_idx").on(table.eventDate),
  createdAtIdx: index("user_memory_created_at_idx").on(table.createdAt),
}));

export const chatHistory = pgTable("chat_history", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 64 }).notNull(),
  message: text("message").notNull(),
  response: text("response"),
  context: jsonb("context"), // astrological context used for response
  eventExtracted: jsonb("event_extracted"), // any events extracted from this chat
  createdAt: timestamp("created_at").defaultNow(),
});

export const userExperience = pgTable("user_experience", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 64 }).notNull().unique(),
  experienceScore: varchar("experience_score", { length: 3 }).default("0"), // 0-100
  totalSessions: varchar("total_sessions", { length: 10 }).default("0"),
  successfulSessions: varchar("successful_sessions", { length: 10 }).default("0"),
  lastActive: timestamp("last_active").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const userMemoryRelations = relations(userMemory, ({ one }) => ({
  // Add relations if needed
}));

export const chatHistoryRelations = relations(chatHistory, ({ one }) => ({
  // Add relations if needed
}));

export const userExperienceRelations = relations(userExperience, ({ one }) => ({
  // Add relations if needed
}));
