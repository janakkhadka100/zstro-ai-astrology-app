// lib/analytics.ts
// Analytics service for tracking user behavior and application metrics

import { logger } from './services/logger';
import { featureFlags } from './featureFlags';

export interface AnalyticsEvent {
  name: string;
  properties: Record<string, any>;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
  context?: Record<string, any>;
}

export interface PageViewEvent extends AnalyticsEvent {
  name: 'page_view';
  properties: {
    page: string;
    referrer?: string;
    title?: string;
    url: string;
    loadTime?: number;
  };
}

export interface ChartGeneratedEvent extends AnalyticsEvent {
  name: 'chart_generated';
  properties: {
    chartType: string;
    birthDate: string;
    birthPlace: string;
    processingTime: number;
    accuracy: number;
    userId?: string;
  };
}

export interface PaymentSucceededEvent extends AnalyticsEvent {
  name: 'payment_succeeded';
  properties: {
    amount: number;
    currency: string;
    paymentMethod: string;
    transactionId: string;
    userId: string;
    tier?: string;
  };
}

export interface UserActionEvent extends AnalyticsEvent {
  name: 'user_action';
  properties: {
    action: string;
    element?: string;
    value?: any;
    page: string;
    userId?: string;
  };
}

export interface ErrorEvent extends AnalyticsEvent {
  name: 'error';
  properties: {
    error: string;
    message: string;
    stack?: string;
    page?: string;
    userId?: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
  };
}

export interface PerformanceEvent extends AnalyticsEvent {
  name: 'performance';
  properties: {
    metric: string;
    value: number;
    unit: string;
    page: string;
    userId?: string;
  };
}

class AnalyticsService {
  private events: AnalyticsEvent[] = [];
  private sessionId: string;
  private userId?: string;
  private isEnabled: boolean = false;
  private batchSize: number = 10;
  private flushInterval: number = 30000; // 30 seconds
  private flushTimer?: NodeJS.Timeout;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.isEnabled = featureFlags.isEnabled('analytics_tracking');
    
    if (this.isEnabled) {
      this.startFlushTimer();
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  private stopFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = undefined;
    }
  }

  setUserId(userId: string): void {
    this.userId = userId;
    logger.debug(`Analytics user ID set: ${userId}`);
  }

  clearUserId(): void {
    this.userId = undefined;
    logger.debug('Analytics user ID cleared');
  }

  track(event: AnalyticsEvent): void {
    if (!this.isEnabled) {
      return;
    }

    // Add common properties
    const enrichedEvent: AnalyticsEvent = {
      ...event,
      userId: event.userId || this.userId,
      sessionId: event.sessionId || this.sessionId,
      timestamp: event.timestamp || new Date(),
    };

    this.events.push(enrichedEvent);
    logger.debug(`Analytics event tracked: ${event.name}`, enrichedEvent.properties);

    // Flush if batch size reached
    if (this.events.length >= this.batchSize) {
      this.flush();
    }
  }

  trackPageView(properties: PageViewEvent['properties']): void {
    this.track({
      name: 'page_view',
      properties,
      timestamp: new Date(),
      userId: this.userId,
      sessionId: this.sessionId,
    });
  }

  trackChartGenerated(properties: ChartGeneratedEvent['properties']): void {
    this.track({
      name: 'chart_generated',
      properties,
      timestamp: new Date(),
      userId: this.userId,
      sessionId: this.sessionId,
    });
  }

  trackPaymentSucceeded(properties: PaymentSucceededEvent['properties']): void {
    this.track({
      name: 'payment_succeeded',
      properties,
      timestamp: new Date(),
      userId: this.userId,
      sessionId: this.sessionId,
    });
  }

  trackUserAction(properties: UserActionEvent['properties']): void {
    this.track({
      name: 'user_action',
      properties,
      timestamp: new Date(),
      userId: this.userId,
      sessionId: this.sessionId,
    });
  }

  trackError(properties: ErrorEvent['properties']): void {
    this.track({
      name: 'error',
      properties,
      timestamp: new Date(),
      userId: this.userId,
      sessionId: this.sessionId,
    });
  }

  trackPerformance(properties: PerformanceEvent['properties']): void {
    this.track({
      name: 'performance',
      properties,
      timestamp: new Date(),
      userId: this.userId,
      sessionId: this.sessionId,
    });
  }

  async flush(): Promise<void> {
    if (this.events.length === 0) {
      return;
    }

    const eventsToFlush = [...this.events];
    this.events = [];

    try {
      // In production, this would send to your analytics service
      // For now, we'll just log them
      logger.info(`Flushing ${eventsToFlush.length} analytics events`);
      
      // Group events by type for better logging
      const eventsByType = eventsToFlush.reduce((acc, event) => {
        if (!acc[event.name]) {
          acc[event.name] = [];
        }
        acc[event.name].push(event);
        return acc;
      }, {} as Record<string, AnalyticsEvent[]>);

      for (const [eventType, events] of Object.entries(eventsByType)) {
        logger.info(`Analytics ${eventType}: ${events.length} events`, {
          eventType,
          count: events.length,
          sample: events[0]?.properties,
        });
      }

      // Here you would typically send to your analytics service
      // await this.sendToAnalyticsService(eventsToFlush);

    } catch (error) {
      logger.error('Failed to flush analytics events:', error);
      // Re-add events to queue for retry
      this.events.unshift(...eventsToFlush);
    }
  }

  private async sendToAnalyticsService(events: AnalyticsEvent[]): Promise<void> {
    // This would be implemented based on your analytics service
    // Examples: Google Analytics, Mixpanel, Amplitude, etc.
    
    // Example for Google Analytics 4
    // if (process.env.GA4_MEASUREMENT_ID) {
    //   await fetch(`https://www.google-analytics.com/mp/collect`, {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({
    //       measurement_id: process.env.GA4_MEASUREMENT_ID,
    //       events: events.map(event => ({
    //         name: event.name,
    //         params: event.properties,
    //         timestamp_micros: event.timestamp.getTime() * 1000,
    //       })),
    //     }),
    //   });
    // }
  }

  getStats(): {
    enabled: boolean;
    eventsInQueue: number;
    sessionId: string;
    userId?: string;
  } {
    return {
      enabled: this.isEnabled,
      eventsInQueue: this.events.length,
      sessionId: this.sessionId,
      userId: this.userId,
    };
  }

  enable(): void {
    this.isEnabled = true;
    this.startFlushTimer();
    logger.info('Analytics enabled');
  }

  disable(): void {
    this.isEnabled = false;
    this.stopFlushTimer();
    this.flush(); // Flush remaining events
    logger.info('Analytics disabled');
  }

  destroy(): void {
    this.stopFlushTimer();
    this.flush();
    this.events = [];
    this.userId = undefined;
    logger.info('Analytics service destroyed');
  }
}

// Singleton instance
export const analytics = new AnalyticsService();

// Helper functions for common tracking
export const trackPageView = (page: string, properties?: Partial<PageViewEvent['properties']>) => {
  analytics.trackPageView({
    page,
    url: typeof window !== 'undefined' ? window.location.href : page,
    title: typeof window !== 'undefined' ? document.title : page,
    ...properties,
  });
};

export const trackChartGenerated = (properties: ChartGeneratedEvent['properties']) => {
  analytics.trackChartGenerated(properties);
};

export const trackPaymentSucceeded = (properties: PaymentSucceededEvent['properties']) => {
  analytics.trackPaymentSucceeded(properties);
};

export const trackUserAction = (action: string, properties?: Partial<UserActionEvent['properties']>) => {
  analytics.trackUserAction({
    action,
    page: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
    ...properties,
  });
};

export const trackError = (error: Error, properties?: Partial<ErrorEvent['properties']>) => {
  analytics.trackError({
    error: error.name,
    message: error.message,
    stack: error.stack,
    page: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
    severity: 'medium',
    ...properties,
  });
};

export const trackPerformance = (metric: string, value: number, unit: string = 'ms') => {
  analytics.trackPerformance({
    metric,
    value,
    unit,
    page: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
  });
};

export default analytics;
