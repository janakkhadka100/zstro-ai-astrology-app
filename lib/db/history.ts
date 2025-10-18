// lib/db/history.ts
// History management functions

import { eq, desc, and, sql } from 'drizzle-orm';
import { db } from './queries';
import { 
  sessions, 
  messages, 
  snapshots, 
  analysisHistory,
  type SessionWithMessages,
  type MessageWithSnapshot,
  type NewSession,
  type NewMessage,
  type NewSnapshot,
  type NewAnalysisHistory
} from './schema';
import { AstroData } from '@/lib/astrology/types';
import { generateQuestionHash } from '@/lib/perf/cache';

// Session management
export async function createSession(
  userId: string,
  title: string
): Promise<SessionWithMessages> {
  const [session] = await db
    .insert(sessions)
    .values({
      userId,
      title,
    })
    .returning();

  return {
    ...session,
    messages: [],
    snapshots: [],
  };
}

export async function getSession(
  sessionId: string,
  userId: string
): Promise<SessionWithMessages | null> {
  const session = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.id, sessionId), eq(sessions.userId, userId)))
    .limit(1);

  if (session.length === 0) return null;

  const sessionData = session[0];

  // Get messages for this session
  const sessionMessages = await db
    .select()
    .from(messages)
    .where(eq(messages.sessionId, sessionId))
    .orderBy(messages.createdAt);

  // Get snapshots for this session
  const sessionSnapshots = await db
    .select()
    .from(snapshots)
    .where(eq(snapshots.sessionId, sessionId))
    .orderBy(snapshots.createdAt);

  return {
    ...sessionData,
    messages: sessionMessages,
    snapshots: sessionSnapshots,
  };
}

export async function getUserSessions(
  userId: string,
  limit: number = 20,
  offset: number = 0
): Promise<SessionWithMessages[]> {
  const userSessions = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.userId, userId), eq(sessions.isActive, true)))
    .orderBy(desc(sessions.updatedAt))
    .limit(limit)
    .offset(offset);

  // Get messages and snapshots for each session
  const sessionsWithData = await Promise.all(
    userSessions.map(async (session) => {
      const sessionMessages = await db
        .select()
        .from(messages)
        .where(eq(messages.sessionId, session.id))
        .orderBy(messages.createdAt);

      const sessionSnapshots = await db
        .select()
        .from(snapshots)
        .where(eq(snapshots.sessionId, session.id))
        .orderBy(snapshots.createdAt);

      return {
        ...session,
        messages: sessionMessages,
        snapshots: sessionSnapshots,
      };
    })
  );

  return sessionsWithData;
}

export async function updateSession(
  sessionId: string,
  userId: string,
  updates: Partial<Pick<NewSession, 'title' | 'isActive'>>
): Promise<boolean> {
  const result = await db
    .update(sessions)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(and(eq(sessions.id, sessionId), eq(sessions.userId, userId)));

  return result.rowCount > 0;
}

export async function deleteSession(
  sessionId: string,
  userId: string
): Promise<boolean> {
  const result = await db
    .update(sessions)
    .set({ isActive: false })
    .where(and(eq(sessions.id, sessionId), eq(sessions.userId, userId)));

  return result.rowCount > 0;
}

// Message management
export async function addMessage(
  sessionId: string,
  role: 'user' | 'assistant' | 'system',
  content: string,
  metadata?: any
): Promise<MessageWithSnapshot> {
  const [message] = await db
    .insert(messages)
    .values({
      sessionId,
      role,
      content,
      metadata,
    })
    .returning();

  return {
    ...message,
  };
}

export async function getMessage(
  messageId: string
): Promise<MessageWithSnapshot | null> {
  const message = await db
    .select()
    .from(messages)
    .where(eq(messages.id, messageId))
    .limit(1);

  if (message.length === 0) return null;

  // Get snapshot if exists
  const snapshot = await db
    .select()
    .from(snapshots)
    .where(eq(snapshots.messageId, messageId))
    .limit(1);

  return {
    ...message[0],
    snapshot: snapshot[0] || undefined,
  };
}

// Snapshot management
export async function saveSnapshot(
  sessionId: string,
  messageId: string | null,
  cards: AstroData,
  analysis?: string,
  provenance?: any
): Promise<NewSnapshot> {
  const [snapshot] = await db
    .insert(snapshots)
    .values({
      sessionId,
      messageId,
      cards,
      analysis,
      provenance,
    })
    .returning();

  return snapshot;
}

export async function getSnapshot(
  snapshotId: string
): Promise<Snapshot | null> {
  const snapshot = await db
    .select()
    .from(snapshots)
    .where(eq(snapshots.id, snapshotId))
    .limit(1);

  return snapshot[0] || null;
}

export async function getSnapshotsForSession(
  sessionId: string
): Promise<Snapshot[]> {
  return await db
    .select()
    .from(snapshots)
    .where(eq(snapshots.sessionId, sessionId))
    .orderBy(desc(snapshots.createdAt));
}

// Analysis history management
export async function saveAnalysisHistory(
  userId: string,
  question: string,
  language: string,
  analysis: string,
  cardsUsed: any,
  dataNeeded?: any,
  responseTime?: number
): Promise<NewAnalysisHistory> {
  const questionHash = generateQuestionHash(question, language);
  
  const [history] = await db
    .insert(analysisHistory)
    .values({
      userId,
      question,
      questionHash,
      language,
      analysis,
      cardsUsed,
      dataNeeded,
      responseTime,
    })
    .returning();

  return history;
}

export async function getAnalysisHistory(
  userId: string,
  limit: number = 50,
  offset: number = 0
): Promise<AnalysisHistory[]> {
  return await db
    .select()
    .from(analysisHistory)
    .where(eq(analysisHistory.userId, userId))
    .orderBy(desc(analysisHistory.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getSimilarQuestions(
  questionHash: string,
  userId: string,
  limit: number = 5
): Promise<AnalysisHistory[]> {
  return await db
    .select()
    .from(analysisHistory)
    .where(and(
      eq(analysisHistory.questionHash, questionHash),
      eq(analysisHistory.userId, userId)
    ))
    .orderBy(desc(analysisHistory.createdAt))
    .limit(limit);
}

// Statistics and analytics
export async function getSessionStats(userId: string): Promise<{
  totalSessions: number;
  activeSessions: number;
  totalMessages: number;
  totalSnapshots: number;
  averageMessagesPerSession: number;
  mostRecentActivity: Date | null;
}> {
  const [sessionCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(sessions)
    .where(eq(sessions.userId, userId));

  const [activeSessionCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(sessions)
    .where(and(eq(sessions.userId, userId), eq(sessions.isActive, true)));

  const [messageCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(messages)
    .innerJoin(sessions, eq(messages.sessionId, sessions.id))
    .where(eq(sessions.userId, userId));

  const [snapshotCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(snapshots)
    .innerJoin(sessions, eq(snapshots.sessionId, sessions.id))
    .where(eq(sessions.userId, userId));

  const [mostRecent] = await db
    .select({ createdAt: sessions.updatedAt })
    .from(sessions)
    .where(eq(sessions.userId, userId))
    .orderBy(desc(sessions.updatedAt))
    .limit(1);

  const totalSessions = sessionCount.count;
  const activeSessions = activeSessionCount.count;
  const totalMessages = messageCount.count;
  const totalSnapshots = snapshotCount.count;
  const averageMessagesPerSession = totalSessions > 0 ? totalMessages / totalSessions : 0;
  const mostRecentActivity = mostRecent?.createdAt || null;

  return {
    totalSessions,
    activeSessions,
    totalMessages,
    totalSnapshots,
    averageMessagesPerSession,
    mostRecentActivity,
  };
}

export async function getAnalysisStats(userId: string): Promise<{
  totalAnalyses: number;
  averageResponseTime: number;
  mostCommonQuestions: Array<{ question: string; count: number }>;
  languageDistribution: Array<{ language: string; count: number }>;
}> {
  const [analysisCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(analysisHistory)
    .where(eq(analysisHistory.userId, userId));

  const [avgResponseTime] = await db
    .select({ avg: sql<number>`avg(response_time)` })
    .from(analysisHistory)
    .where(and(
      eq(analysisHistory.userId, userId),
      sql`response_time IS NOT NULL`
    ));

  const commonQuestions = await db
    .select({
      question: analysisHistory.question,
      count: sql<number>`count(*)`,
    })
    .from(analysisHistory)
    .where(eq(analysisHistory.userId, userId))
    .groupBy(analysisHistory.question)
    .orderBy(sql`count(*) DESC`)
    .limit(10);

  const languageDist = await db
    .select({
      language: analysisHistory.language,
      count: sql<number>`count(*)`,
    })
    .from(analysisHistory)
    .where(eq(analysisHistory.userId, userId))
    .groupBy(analysisHistory.language)
    .orderBy(sql`count(*) DESC`);

  return {
    totalAnalyses: analysisCount.count,
    averageResponseTime: avgResponseTime.avg || 0,
    mostCommonQuestions: commonQuestions,
    languageDistribution: languageDist,
  };
}

// Cleanup functions
export async function cleanupOldData(daysToKeep: number = 90): Promise<{
  deletedSessions: number;
  deletedMessages: number;
  deletedSnapshots: number;
  deletedAnalyses: number;
}> {
  const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);

  // Delete old inactive sessions and their related data
  const [deletedSessions] = await db
    .delete(sessions)
    .where(and(
      eq(sessions.isActive, false),
      sql`${sessions.updatedAt} < ${cutoffDate}`
    ));

  // Delete old analysis history
  const [deletedAnalyses] = await db
    .delete(analysisHistory)
    .where(sql`${analysisHistory.createdAt} < ${cutoffDate}`);

  return {
    deletedSessions: deletedSessions.rowCount,
    deletedMessages: 0, // Handled by cascade
    deletedSnapshots: 0, // Handled by cascade
    deletedAnalyses: deletedAnalyses.rowCount,
  };
}
