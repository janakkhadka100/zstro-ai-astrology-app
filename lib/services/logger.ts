// lib/services/logger.ts
// Centralized logging service with different levels and outputs

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  userId?: string;
  requestId?: string;
  error?: Error;
}

class LoggerService {
  private level: LogLevel;
  private isDevelopment: boolean;

  constructor() {
    this.level = this.getLogLevel();
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  private getLogLevel(): LogLevel {
    const envLevel = process.env.LOG_LEVEL?.toUpperCase();
    switch (envLevel) {
      case 'ERROR': return LogLevel.ERROR;
      case 'WARN': return LogLevel.WARN;
      case 'INFO': return LogLevel.INFO;
      case 'DEBUG': return LogLevel.DEBUG;
      default: return this.isDevelopment ? LogLevel.DEBUG : LogLevel.INFO;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.level;
  }

  private formatMessage(entry: LogEntry): string {
    const { level, message, timestamp, context, userId, requestId, error } = entry;
    
    const levelName = LogLevel[level];
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    const userIdStr = userId ? ` [user:${userId}]` : '';
    const requestIdStr = requestId ? ` [req:${requestId}]` : '';
    const errorStr = error ? `\nError: ${error.stack}` : '';

    return `[${timestamp}] ${levelName}: ${message}${userIdStr}${requestIdStr}${contextStr}${errorStr}`;
  }

  private async writeLog(entry: LogEntry): Promise<void> {
    if (!this.shouldLog(entry.level)) return;

    const formattedMessage = this.formatMessage(entry);

    // Console output
    switch (entry.level) {
      case LogLevel.ERROR:
        console.error(formattedMessage);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage);
        break;
      case LogLevel.INFO:
        console.info(formattedMessage);
        break;
      case LogLevel.DEBUG:
        console.debug(formattedMessage);
        break;
    }

    // In production, you might want to send logs to external services
    if (!this.isDevelopment && entry.level <= LogLevel.ERROR) {
      await this.sendToExternalService(entry);
    }
  }

  private async sendToExternalService(entry: LogEntry): Promise<void> {
    // Example: Send critical errors to external monitoring service
    // This could be Sentry, DataDog, CloudWatch, etc.
    try {
      if (process.env.SENTRY_DSN) {
        // Example Sentry integration
        // Sentry.captureException(entry.error || new Error(entry.message), {
        //   extra: entry.context,
        //   user: entry.userId ? { id: entry.userId } : undefined,
        // });
      }
    } catch (error) {
      console.error('Failed to send log to external service:', error);
    }
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: Record<string, any>,
    userId?: string,
    requestId?: string,
    error?: Error
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      userId,
      requestId,
      error,
    };
  }

  /**
   * Log error message
   */
  async error(
    message: string,
    context?: Record<string, any>,
    userId?: string,
    requestId?: string,
    error?: Error
  ): Promise<void> {
    const entry = this.createLogEntry(LogLevel.ERROR, message, context, userId, requestId, error);
    await this.writeLog(entry);
  }

  /**
   * Log warning message
   */
  async warn(
    message: string,
    context?: Record<string, any>,
    userId?: string,
    requestId?: string
  ): Promise<void> {
    const entry = this.createLogEntry(LogLevel.WARN, message, context, userId, requestId);
    await this.writeLog(entry);
  }

  /**
   * Log info message
   */
  async info(
    message: string,
    context?: Record<string, any>,
    userId?: string,
    requestId?: string
  ): Promise<void> {
    const entry = this.createLogEntry(LogLevel.INFO, message, context, userId, requestId);
    await this.writeLog(entry);
  }

  /**
   * Log debug message
   */
  async debug(
    message: string,
    context?: Record<string, any>,
    userId?: string,
    requestId?: string
  ): Promise<void> {
    const entry = this.createLogEntry(LogLevel.DEBUG, message, context, userId, requestId);
    await this.writeLog(entry);
  }

  /**
   * Log API request
   */
  async logRequest(
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    userId?: string,
    requestId?: string
  ): Promise<void> {
    const level = statusCode >= 400 ? LogLevel.ERROR : LogLevel.INFO;
    const message = `${method} ${url} ${statusCode} (${duration}ms)`;
    
    await this.writeLog({
      level,
      message,
      timestamp: new Date().toISOString(),
      context: {
        method,
        url,
        statusCode,
        duration,
      },
      userId,
      requestId,
    });
  }

  /**
   * Log astrology calculation
   */
  async logAstrologyCalculation(
    birthDate: string,
    birthTime: string,
    place: string,
    duration: number,
    success: boolean,
    userId?: string,
    requestId?: string
  ): Promise<void> {
    const level = success ? LogLevel.INFO : LogLevel.ERROR;
    const message = `Astrology calculation ${success ? 'completed' : 'failed'} for ${birthDate} ${birthTime} in ${place}`;
    
    await this.writeLog({
      level,
      message,
      timestamp: new Date().toISOString(),
      context: {
        birthDate,
        birthTime,
        place,
        duration,
        success,
      },
      userId,
      requestId,
    });
  }

  /**
   * Log payment transaction
   */
  async logPayment(
    transactionId: string,
    amount: number,
    method: string,
    status: string,
    userId?: string,
    requestId?: string
  ): Promise<void> {
    const level = status === 'completed' ? LogLevel.INFO : LogLevel.WARN;
    const message = `Payment ${status}: ${method} ${amount} (${transactionId})`;
    
    await this.writeLog({
      level,
      message,
      timestamp: new Date().toISOString(),
      context: {
        transactionId,
        amount,
        method,
        status,
      },
      userId,
      requestId,
    });
  }

  /**
   * Set log level
   */
  setLevel(level: LogLevel): void {
    this.level = level;
  }

  /**
   * Get current log level
   */
  getLevel(): LogLevel {
    return this.level;
  }
}

export const logger = new LoggerService();
export default logger;
