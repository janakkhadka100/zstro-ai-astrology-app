// lib/services/dataPrivacy.ts
// Data privacy and retention service

import { db } from '@/lib/db/queries';
import { logger } from './logger';

export interface DataRetentionPolicy {
  userData: number; // days
  astrologicalData: number; // days
  chatHistory: number; // days
  paymentData: number; // days (longer for legal compliance)
  logs: number; // days
}

export interface PrivacySettings {
  dataRetention: DataRetentionPolicy;
  autoDelete: boolean;
  anonymizeOnDelete: boolean;
  exportData: boolean;
}

class DataPrivacyService {
  private defaultRetentionPolicy: DataRetentionPolicy = {
    userData: 365, // 1 year
    astrologicalData: 180, // 6 months
    chatHistory: 90, // 3 months
    paymentData: 2555, // 7 years (legal requirement)
    logs: 30, // 1 month
  };

  /**
   * Get data retention policy
   */
  getRetentionPolicy(): DataRetentionPolicy {
    return this.defaultRetentionPolicy;
  }

  /**
   * Update data retention policy
   */
  updateRetentionPolicy(policy: Partial<DataRetentionPolicy>): void {
    this.defaultRetentionPolicy = { ...this.defaultRetentionPolicy, ...policy };
  }

  /**
   * Delete expired user data
   */
  async deleteExpiredUserData(): Promise<{
    deletedUsers: number;
    deletedAstroData: number;
    deletedChats: number;
    deletedMessages: number;
  }> {
    const results = {
      deletedUsers: 0,
      deletedAstroData: 0,
      deletedChats: 0,
      deletedMessages: 0,
    };

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.defaultRetentionPolicy.userData);

      // Delete inactive users (no activity for retention period)
      const inactiveUsers = await db.query(`
        SELECT id FROM "User" 
        WHERE "lastMessageAt" < $1 OR "lastMessageAt" IS NULL
      `, [cutoffDate]);

      for (const user of inactiveUsers.rows) {
        await this.deleteUserData(user.id);
        results.deletedUsers++;
      }

      // Delete expired astrological data
      const astroCutoff = new Date();
      astroCutoff.setDate(astroCutoff.getDate() - this.defaultRetentionPolicy.astrologicalData);

      const deletedAstro = await db.query(`
        DELETE FROM "AstrologicalData" 
        WHERE "createdAt" < $1
        RETURNING id
      `, [astroCutoff]);

      results.deletedAstroData = deletedAstro.rowCount || 0;

      // Delete expired chat history
      const chatCutoff = new Date();
      chatCutoff.setDate(chatCutoff.getDate() - this.defaultRetentionPolicy.chatHistory);

      const deletedChats = await db.query(`
        DELETE FROM "Chat" 
        WHERE "createdAt" < $1
        RETURNING id
      `, [chatCutoff]);

      results.deletedChats = deletedChats.rowCount || 0;

      const deletedMessages = await db.query(`
        DELETE FROM "Message" 
        WHERE "createdAt" < $1
        RETURNING id
      `, [chatCutoff]);

      results.deletedMessages = deletedMessages.rowCount || 0;

      logger.info('Data cleanup completed', {
        ...results,
        retentionPolicy: this.defaultRetentionPolicy,
      });

    } catch (error) {
      logger.error('Data cleanup failed', { error });
      throw error;
    }

    return results;
  }

  /**
   * Delete all data for a specific user (GDPR compliance)
   */
  async deleteUserData(userId: string): Promise<boolean> {
    try {
      // Delete in correct order to respect foreign key constraints
      await db.query('DELETE FROM "Vote" WHERE "chatId" IN (SELECT id FROM "Chat" WHERE "userId" = $1)', [userId]);
      await db.query('DELETE FROM "Message" WHERE "chatId" IN (SELECT id FROM "Chat" WHERE "userId" = $1)', [userId]);
      await db.query('DELETE FROM "Chat" WHERE "userId" = $1', [userId]);
      await db.query('DELETE FROM "AstrologicalData" WHERE "userId" = $1', [userId]);
      await db.query('DELETE FROM "Document" WHERE "userId" = $1', [userId]);
      await db.query('DELETE FROM "Suggestion" WHERE "userId" = $1', [userId]);
      await db.query('DELETE FROM "Payment" WHERE "userId" = $1', [userId]);
      await db.query('DELETE FROM "Subscription" WHERE "userId" = $1', [userId]);
      await db.query('DELETE FROM "User" WHERE "id" = $1', [userId]);

      logger.info('User data deleted successfully', { userId });
      return true;
    } catch (error) {
      logger.error('Failed to delete user data', { userId, error });
      return false;
    }
  }

  /**
   * Anonymize user data instead of deleting (for legal compliance)
   */
  async anonymizeUserData(userId: string): Promise<boolean> {
    try {
      const anonymizedData = {
        name: 'Deleted User',
        email: `deleted_${userId}@anonymized.com`,
        password: null,
        resetToken: null,
        resetTokenExpiry: null,
        gender: 'other' as const,
        dob: '1900-01-01',
        time: '00:00:00',
        latitude: '0.000000',
        longitude: '0.000000',
        timezone: 'UTC',
        place: 'Unknown',
      };

      await db.query(`
        UPDATE "User" 
        SET name = $1, email = $2, password = $3, "resetToken" = $4, 
            "resetTokenExpiry" = $5, gender = $6, dob = $7, time = $8,
            latitude = $9, longitude = $10, timezone = $11, place = $12
        WHERE id = $13
      `, [
        anonymizedData.name,
        anonymizedData.email,
        anonymizedData.password,
        anonymizedData.resetToken,
        anonymizedData.resetTokenExpiry,
        anonymizedData.gender,
        anonymizedData.dob,
        anonymizedData.time,
        anonymizedData.latitude,
        anonymizedData.longitude,
        anonymizedData.timezone,
        anonymizedData.place,
        userId,
      ]);

      logger.info('User data anonymized successfully', { userId });
      return true;
    } catch (error) {
      logger.error('Failed to anonymize user data', { userId, error });
      return false;
    }
  }

  /**
   * Export user data (GDPR compliance)
   */
  async exportUserData(userId: string): Promise<{
    user: any;
    astrologicalData: any[];
    chats: any[];
    payments: any[];
  }> {
    try {
      const user = await db.query('SELECT * FROM "User" WHERE id = $1', [userId]);
      const astroData = await db.query('SELECT * FROM "AstrologicalData" WHERE "userId" = $1', [userId]);
      const chats = await db.query('SELECT * FROM "Chat" WHERE "userId" = $1', [userId]);
      const payments = await db.query('SELECT * FROM "Payment" WHERE "userId" = $1', [userId]);

      const exportData = {
        user: user.rows[0] || null,
        astrologicalData: astroData.rows,
        chats: chats.rows,
        payments: payments.rows,
      };

      logger.info('User data exported successfully', { userId });
      return exportData;
    } catch (error) {
      logger.error('Failed to export user data', { userId, error });
      throw error;
    }
  }

  /**
   * Schedule automatic data cleanup
   */
  scheduleCleanup(): void {
    // Run cleanup daily at 2 AM
    const cleanupInterval = 24 * 60 * 60 * 1000; // 24 hours
    const now = new Date();
    const nextRun = new Date(now);
    nextRun.setHours(2, 0, 0, 0);
    
    if (nextRun <= now) {
      nextRun.setDate(nextRun.getDate() + 1);
    }

    const timeUntilNext = nextRun.getTime() - now.getTime();

    setTimeout(() => {
      this.deleteExpiredUserData().catch((error) => {
        logger.error('Scheduled data cleanup failed', { error });
      });
      
      // Schedule next cleanup
      this.scheduleCleanup();
    }, timeUntilNext);

    logger.info('Data cleanup scheduled', { 
      nextRun: nextRun.toISOString(),
      retentionPolicy: this.defaultRetentionPolicy 
    });
  }

  /**
   * Get privacy policy text
   */
  getPrivacyPolicy(): string {
    return `
# ZSTRO AI Astrology - Privacy Policy

## Data Collection
We collect the following data to provide astrological services:
- Birth details (date, time, place) for chart calculations
- Chat history for improving our AI responses
- Payment information for subscription management
- Usage analytics for service improvement

## Data Retention
- User accounts: ${this.defaultRetentionPolicy.userData} days
- Astrological data: ${this.defaultRetentionPolicy.astrologicalData} days
- Chat history: ${this.defaultRetentionPolicy.chatHistory} days
- Payment records: ${this.defaultRetentionPolicy.paymentData} days (legal requirement)

## Your Rights
- Request data export
- Request data deletion
- Request data anonymization
- Opt-out of data collection

## Data Security
- All data is encrypted in transit and at rest
- Regular security audits and updates
- Access controls and monitoring
- Secure payment processing

## Contact
For privacy concerns, contact: privacy@zstro.ai
    `.trim();
  }
}

export const dataPrivacyService = new DataPrivacyService();
export default dataPrivacyService;
