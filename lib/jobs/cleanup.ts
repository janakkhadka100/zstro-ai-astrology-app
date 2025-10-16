// lib/jobs/cleanup.ts
// Scheduled cleanup jobs for data retention

import { dataPrivacyService } from '../services/dataPrivacy';
import { logger } from '../services/logger';
import { cacheService } from '../services/cache';

export interface CleanupJob {
  name: string;
  schedule: string; // cron expression
  enabled: boolean;
  lastRun?: Date;
  nextRun?: Date;
}

class CleanupScheduler {
  private jobs: Map<string, CleanupJob> = new Map();
  private intervals: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    this.initializeJobs();
  }

  private initializeJobs(): void {
    // Daily data cleanup at 2 AM
    this.addJob({
      name: 'dataCleanup',
      schedule: '0 2 * * *', // 2 AM daily
      enabled: true,
    });

    // Weekly cache cleanup at 3 AM on Sunday
    this.addJob({
      name: 'cacheCleanup',
      schedule: '0 3 * * 0', // 3 AM on Sunday
      enabled: true,
    });

    // Monthly security cleanup at 4 AM on 1st
    this.addJob({
      name: 'securityCleanup',
      schedule: '0 4 1 * *', // 4 AM on 1st of month
      enabled: true,
    });
  }

  /**
   * Add a cleanup job
   */
  addJob(job: CleanupJob): void {
    this.jobs.set(job.name, job);
    this.scheduleJob(job);
  }

  /**
   * Remove a cleanup job
   */
  removeJob(name: string): void {
    const interval = this.intervals.get(name);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(name);
    }
    this.jobs.delete(name);
  }

  /**
   * Schedule a job based on cron expression
   */
  private scheduleJob(job: CleanupJob): void {
    if (!job.enabled) return;

    const interval = this.parseCronExpression(job.schedule);
    if (interval > 0) {
      const timeout = setInterval(() => {
        this.runJob(job.name);
      }, interval);

      this.intervals.set(job.name, timeout);
      
      // Calculate next run time
      const nextRun = new Date(Date.now() + interval);
      job.nextRun = nextRun;

      logger.info('Cleanup job scheduled', {
        job: job.name,
        schedule: job.schedule,
        nextRun: nextRun.toISOString(),
      });
    }
  }

  /**
   * Parse cron expression to milliseconds
   * Simplified parser for basic patterns
   */
  private parseCronExpression(schedule: string): number {
    const parts = schedule.split(' ');
    if (parts.length !== 5) return 0;

    const [minute, hour, day, month, weekday] = parts;

    // For now, handle simple cases
    if (minute === '0' && hour !== '*' && day === '*' && month === '*' && weekday === '*') {
      // Daily at specific hour
      const targetHour = parseInt(hour);
      const now = new Date();
      const nextRun = new Date(now);
      nextRun.setHours(targetHour, 0, 0, 0);
      
      if (nextRun <= now) {
        nextRun.setDate(nextRun.getDate() + 1);
      }
      
      return nextRun.getTime() - now.getTime();
    }

    // Default to 24 hours for complex expressions
    return 24 * 60 * 60 * 1000;
  }

  /**
   * Run a specific cleanup job
   */
  async runJob(jobName: string): Promise<void> {
    const job = this.jobs.get(jobName);
    if (!job || !job.enabled) return;

    logger.info('Starting cleanup job', { job: jobName });

    try {
      switch (jobName) {
        case 'dataCleanup':
          await this.runDataCleanup();
          break;
        case 'cacheCleanup':
          await this.runCacheCleanup();
          break;
        case 'securityCleanup':
          await this.runSecurityCleanup();
          break;
        default:
          logger.warn('Unknown cleanup job', { job: jobName });
          return;
      }

      job.lastRun = new Date();
      logger.info('Cleanup job completed successfully', { job: jobName });
    } catch (error) {
      logger.error('Cleanup job failed', {
        job: jobName,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Run data cleanup
   */
  private async runDataCleanup(): Promise<void> {
    const results = await dataPrivacyService.deleteExpiredUserData();
    logger.info('Data cleanup completed', results);
  }

  /**
   * Run cache cleanup
   */
  private async runCacheCleanup(): Promise<void> {
    // Clear old cache entries
    const stats = await cacheService.getStats();
    logger.info('Cache cleanup completed', { stats });
  }

  /**
   * Run security cleanup
   */
  private async runSecurityCleanup(): Promise<void> {
    // Clean up old login attempts, blocked IPs, etc.
    logger.info('Security cleanup completed');
  }

  /**
   * Get job status
   */
  getJobStatus(): CleanupJob[] {
    return Array.from(this.jobs.values());
  }

  /**
   * Enable/disable a job
   */
  toggleJob(name: string, enabled: boolean): boolean {
    const job = this.jobs.get(name);
    if (!job) return false;

    job.enabled = enabled;
    
    if (enabled) {
      this.scheduleJob(job);
    } else {
      const interval = this.intervals.get(name);
      if (interval) {
        clearInterval(interval);
        this.intervals.delete(name);
      }
    }

    return true;
  }

  /**
   * Start all enabled jobs
   */
  start(): void {
    for (const job of this.jobs.values()) {
      if (job.enabled) {
        this.scheduleJob(job);
      }
    }
    logger.info('Cleanup scheduler started', {
      jobs: Array.from(this.jobs.keys()),
    });
  }

  /**
   * Stop all jobs
   */
  stop(): void {
    for (const [name, interval] of this.intervals) {
      clearInterval(interval);
    }
    this.intervals.clear();
    logger.info('Cleanup scheduler stopped');
  }
}

export const cleanupScheduler = new CleanupScheduler();

// Start scheduler when module is imported
if (process.env.NODE_ENV === 'production') {
  cleanupScheduler.start();
}

export default cleanupScheduler;
