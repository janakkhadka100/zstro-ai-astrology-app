// lib/featureFlags.ts
// Feature flag service for gradual rollouts and A/B testing

import { logger } from './services/logger';

export interface FeatureFlag {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  rolloutPercentage: number;
  conditions: FeatureFlagCondition[];
  metadata: Record<string, any>;
}

export interface FeatureFlagCondition {
  type: 'user_id' | 'user_tier' | 'date_range' | 'percentage' | 'environment';
  operator: 'equals' | 'not_equals' | 'in' | 'not_in' | 'greater_than' | 'less_than' | 'between';
  value: any;
  description: string;
}

export interface FeatureFlagContext {
  userId?: string;
  userTier?: 'free' | 'pro' | 'astro-plus';
  environment?: 'development' | 'staging' | 'production';
  timestamp?: Date;
  customAttributes?: Record<string, any>;
}

class FeatureFlagService {
  private flags: Map<string, FeatureFlag> = new Map();
  private cache: Map<string, { result: boolean; timestamp: number }> = new Map();
  private cacheTTL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.initializeDefaultFlags();
  }

  private initializeDefaultFlags(): void {
    const defaultFlags: FeatureFlag[] = [
      {
        key: 'pwa_enabled',
        name: 'PWA Features',
        description: 'Enable Progressive Web App features',
        enabled: process.env.FF_PWA === 'true',
        rolloutPercentage: 100,
        conditions: [],
        metadata: { category: 'ui', priority: 'high' }
      },
      {
        key: 'stripe_payments',
        name: 'Stripe Payments',
        description: 'Enable Stripe payment processing',
        enabled: process.env.FF_STRIPE === 'true',
        rolloutPercentage: 100,
        conditions: [],
        metadata: { category: 'payments', priority: 'high' }
      },
      {
        key: 'i18n_enabled',
        name: 'Internationalization',
        description: 'Enable multi-language support',
        enabled: process.env.FF_I18N === 'true',
        rolloutPercentage: 100,
        conditions: [],
        metadata: { category: 'ui', priority: 'medium' }
      },
      {
        key: 'advanced_charts',
        name: 'Advanced Chart Visualizations',
        description: 'Enable 3D and interactive chart features',
        enabled: process.env.FF_ADVANCED_CHARTS === 'true',
        rolloutPercentage: 50,
        conditions: [
          {
            type: 'user_tier',
            operator: 'in',
            value: ['pro', 'astro-plus'],
            description: 'Only for Pro and Astro-Plus users'
          }
        ],
        metadata: { category: 'features', priority: 'low' }
      },
      {
        key: 'ai_voice_input',
        name: 'AI Voice Input',
        description: 'Enable voice input for astrology questions',
        enabled: process.env.FF_VOICE_INPUT === 'true',
        rolloutPercentage: 25,
        conditions: [
          {
            type: 'environment',
            operator: 'equals',
            value: 'production',
            description: 'Only in production'
          }
        ],
        metadata: { category: 'ai', priority: 'medium' }
      },
      {
        key: 'real_time_chat',
        name: 'Real-time Chat',
        description: 'Enable real-time chat features',
        enabled: process.env.FF_REAL_TIME_CHAT === 'true',
        rolloutPercentage: 100,
        conditions: [],
        metadata: { category: 'ui', priority: 'high' }
      },
      {
        key: 'analytics_tracking',
        name: 'Analytics Tracking',
        description: 'Enable user behavior analytics',
        enabled: process.env.FF_ANALYTICS === 'true',
        rolloutPercentage: 100,
        conditions: [],
        metadata: { category: 'analytics', priority: 'medium' }
      },
      {
        key: 'beta_features',
        name: 'Beta Features',
        description: 'Enable experimental features',
        enabled: process.env.FF_BETA === 'true',
        rolloutPercentage: 10,
        conditions: [
          {
            type: 'user_tier',
            operator: 'in',
            value: ['pro', 'astro-plus'],
            description: 'Only for Pro and Astro-Plus users'
          }
        ],
        metadata: { category: 'experimental', priority: 'low' }
      }
    ];

    for (const flag of defaultFlags) {
      this.flags.set(flag.key, flag);
    }

    logger.info(`Initialized ${defaultFlags.length} feature flags`);
  }

  isEnabled(flagKey: string, context?: FeatureFlagContext): boolean {
    const cacheKey = `${flagKey}:${JSON.stringify(context || {})}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.result;
    }

    const flag = this.flags.get(flagKey);
    if (!flag) {
      logger.warn(`Feature flag not found: ${flagKey}`);
      return false;
    }

    if (!flag.enabled) {
      this.cache.set(cacheKey, { result: false, timestamp: Date.now() });
      return false;
    }

    // Check rollout percentage
    if (flag.rolloutPercentage < 100) {
      const hash = this.hashString(`${flagKey}:${context?.userId || 'anonymous'}`);
      const percentage = hash % 100;
      if (percentage >= flag.rolloutPercentage) {
        this.cache.set(cacheKey, { result: false, timestamp: Date.now() });
        return false;
      }
    }

    // Check conditions
    if (flag.conditions.length > 0) {
      const allConditionsMet = flag.conditions.every(condition => 
        this.evaluateCondition(condition, context)
      );
      
      if (!allConditionsMet) {
        this.cache.set(cacheKey, { result: false, timestamp: Date.now() });
        return false;
      }
    }

    this.cache.set(cacheKey, { result: true, timestamp: Date.now() });
    return true;
  }

  private evaluateCondition(condition: FeatureFlagCondition, context?: FeatureFlagContext): boolean {
    if (!context) {
      return false;
    }

    let value: any;
    
    switch (condition.type) {
      case 'user_id':
        value = context.userId;
        break;
      case 'user_tier':
        value = context.userTier;
        break;
      case 'environment':
        value = context.environment || process.env.NODE_ENV;
        break;
      case 'date_range':
        value = context.timestamp || new Date();
        break;
      case 'percentage':
        value = this.hashString(`${condition.value}:${context.userId || 'anonymous'}`) % 100;
        break;
      default:
        value = context.customAttributes?.[condition.type];
    }

    return this.compareValues(value, condition.operator, condition.value);
  }

  private compareValues(actual: any, operator: string, expected: any): boolean {
    switch (operator) {
      case 'equals':
        return actual === expected;
      case 'not_equals':
        return actual !== expected;
      case 'in':
        return Array.isArray(expected) && expected.includes(actual);
      case 'not_in':
        return Array.isArray(expected) && !expected.includes(actual);
      case 'greater_than':
        return actual > expected;
      case 'less_than':
        return actual < expected;
      case 'between':
        return Array.isArray(expected) && expected.length === 2 && 
               actual >= expected[0] && actual <= expected[1];
      default:
        return false;
    }
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  // Public methods for flag management
  addFlag(flag: FeatureFlag): void {
    this.flags.set(flag.key, flag);
    this.clearCache();
    logger.info(`Added feature flag: ${flag.key}`);
  }

  updateFlag(flagKey: string, updates: Partial<FeatureFlag>): void {
    const flag = this.flags.get(flagKey);
    if (flag) {
      Object.assign(flag, updates);
      this.clearCache();
      logger.info(`Updated feature flag: ${flagKey}`);
    }
  }

  removeFlag(flagKey: string): void {
    this.flags.delete(flagKey);
    this.clearCache();
    logger.info(`Removed feature flag: ${flagKey}`);
  }

  getFlag(flagKey: string): FeatureFlag | undefined {
    return this.flags.get(flagKey);
  }

  getAllFlags(): FeatureFlag[] {
    return Array.from(this.flags.values());
  }

  getFlagsByCategory(category: string): FeatureFlag[] {
    return this.getAllFlags().filter(flag => 
      flag.metadata.category === category
    );
  }

  clearCache(): void {
    this.cache.clear();
    logger.debug('Feature flag cache cleared');
  }

  getCacheStats(): {
    size: number;
    hitRate: number;
    ttl: number;
  } {
    return {
      size: this.cache.size,
      hitRate: 0, // Would need to track hits/misses
      ttl: this.cacheTTL,
    };
  }

  // Batch evaluation for multiple flags
  evaluateFlags(flagKeys: string[], context?: FeatureFlagContext): Record<string, boolean> {
    const results: Record<string, boolean> = {};
    
    for (const flagKey of flagKeys) {
      results[flagKey] = this.isEnabled(flagKey, context);
    }
    
    return results;
  }

  // Get enabled flags for a context
  getEnabledFlags(context?: FeatureFlagContext): string[] {
    const enabledFlags: string[] = [];
    
    for (const [key, flag] of this.flags) {
      if (this.isEnabled(key, context)) {
        enabledFlags.push(key);
      }
    }
    
    return enabledFlags;
  }
}

// Singleton instance
export const featureFlags = new FeatureFlagService();

// Helper functions for common use cases
export const isPWAEnabled = (context?: FeatureFlagContext) => 
  featureFlags.isEnabled('pwa_enabled', context);

export const isStripeEnabled = (context?: FeatureFlagContext) => 
  featureFlags.isEnabled('stripe_payments', context);

export const isI18nEnabled = (context?: FeatureFlagContext) => 
  featureFlags.isEnabled('i18n_enabled', context);

export const isAdvancedChartsEnabled = (context?: FeatureFlagContext) => 
  featureFlags.isEnabled('advanced_charts', context);

export const isVoiceInputEnabled = (context?: FeatureFlagContext) => 
  featureFlags.isEnabled('ai_voice_input', context);

export const isRealTimeChatEnabled = (context?: FeatureFlagContext) => 
  featureFlags.isEnabled('real_time_chat', context);

export const isAnalyticsEnabled = (context?: FeatureFlagContext) => 
  featureFlags.isEnabled('analytics_tracking', context);

export const isBetaEnabled = (context?: FeatureFlagContext) => 
  featureFlags.isEnabled('beta_features', context);

export default featureFlags;
