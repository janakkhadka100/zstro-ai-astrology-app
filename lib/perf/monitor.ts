// lib/perf/monitor.ts
// Performance monitoring and metrics

import { cache, getCacheStats } from './cache';

export interface PerformanceMetrics {
  timestamp: string;
  endpoint: string;
  method: string;
  duration: number;
  statusCode: number;
  cacheHit: boolean;
  memoryUsage: NodeJS.MemoryUsage;
  cacheStats: {
    memory: string;
    keys: number;
    hits: number;
    misses: number;
  };
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics[] = [];
  private maxMetrics = 1000; // Keep last 1000 metrics

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  async recordMetric(
    endpoint: string,
    method: string,
    duration: number,
    statusCode: number,
    cacheHit: boolean = false
  ): Promise<void> {
    try {
      const cacheStats = await getCacheStats();
      const memoryUsage = process.memoryUsage();
      
      const metric: PerformanceMetrics = {
        timestamp: new Date().toISOString(),
        endpoint,
        method,
        duration,
        statusCode,
        cacheHit,
        memoryUsage,
        cacheStats,
      };

      this.metrics.push(metric);
      
      // Keep only the last maxMetrics
      if (this.metrics.length > this.maxMetrics) {
        this.metrics = this.metrics.slice(-this.maxMetrics);
      }

      // Log slow requests
      if (duration > 2000) { // 2 seconds
        console.warn(`Slow request detected: ${method} ${endpoint} took ${duration}ms`);
      }

      // Log cache miss for important endpoints
      if (!cacheHit && (endpoint.includes('/bootstrap') || endpoint.includes('/fetch'))) {
        console.log(`Cache miss for ${endpoint}`);
      }
    } catch (error) {
      console.error('Error recording performance metric:', error);
    }
  }

  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  getRecentMetrics(minutes: number = 5): PerformanceMetrics[] {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    return this.metrics.filter(m => new Date(m.timestamp) > cutoff);
  }

  getAverageResponseTime(endpoint?: string, minutes: number = 5): number {
    const recent = this.getRecentMetrics(minutes);
    const filtered = endpoint ? recent.filter(m => m.endpoint === endpoint) : recent;
    
    if (filtered.length === 0) return 0;
    
    const total = filtered.reduce((sum, m) => sum + m.duration, 0);
    return total / filtered.length;
  }

  getCacheHitRate(endpoint?: string, minutes: number = 5): number {
    const recent = this.getRecentMetrics(minutes);
    const filtered = endpoint ? recent.filter(m => m.endpoint === endpoint) : recent;
    
    if (filtered.length === 0) return 0;
    
    const hits = filtered.filter(m => m.cacheHit).length;
    return hits / filtered.length;
  }

  getErrorRate(endpoint?: string, minutes: number = 5): number {
    const recent = this.getRecentMetrics(minutes);
    const filtered = endpoint ? recent.filter(m => m.endpoint === endpoint) : recent;
    
    if (filtered.length === 0) return 0;
    
    const errors = filtered.filter(m => m.statusCode >= 400).length;
    return errors / filtered.length;
  }

  getMemoryUsage(): {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
    arrayBuffers: number;
  } {
    return process.memoryUsage();
  }

  getHealthStatus(): {
    healthy: boolean;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    
    // Check average response time
    const avgResponseTime = this.getAverageResponseTime();
    if (avgResponseTime > 1000) {
      issues.push(`High average response time: ${avgResponseTime.toFixed(2)}ms`);
      recommendations.push('Consider enabling more aggressive caching');
    }
    
    // Check error rate
    const errorRate = this.getErrorRate();
    if (errorRate > 0.05) { // 5%
      issues.push(`High error rate: ${(errorRate * 100).toFixed(2)}%`);
      recommendations.push('Investigate error causes and improve error handling');
    }
    
    // Check cache hit rate
    const cacheHitRate = this.getCacheHitRate();
    if (cacheHitRate < 0.3) { // 30%
      issues.push(`Low cache hit rate: ${(cacheHitRate * 100).toFixed(2)}%`);
      recommendations.push('Review caching strategy and TTL settings');
    }
    
    // Check memory usage
    const memory = this.getMemoryUsage();
    const memoryUsagePercent = (memory.heapUsed / memory.heapTotal) * 100;
    if (memoryUsagePercent > 80) {
      issues.push(`High memory usage: ${memoryUsagePercent.toFixed(2)}%`);
      recommendations.push('Consider memory optimization or scaling');
    }
    
    return {
      healthy: issues.length === 0,
      issues,
      recommendations,
    };
  }

  // Clear old metrics
  clearOldMetrics(hours: number = 24): void {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    this.metrics = this.metrics.filter(m => new Date(m.timestamp) > cutoff);
  }

  // Export metrics for analysis
  exportMetrics(): string {
    return JSON.stringify(this.metrics, null, 2);
  }
}

// Singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();

// Middleware for automatic performance monitoring
export function withPerformanceMonitoring<T extends any[]>(
  fn: (...args: T) => Promise<any>,
  endpoint: string,
  method: string = 'POST'
) {
  return async (...args: T) => {
    const startTime = Date.now();
    let statusCode = 200;
    let cacheHit = false;
    
    try {
      const result = await fn(...args);
      
      // Check if result indicates cache hit
      if (result && typeof result === 'object') {
        cacheHit = result.cacheHit || false;
      }
      
      return result;
    } catch (error: any) {
      statusCode = error.statusCode || 500;
      throw error;
    } finally {
      const duration = Date.now() - startTime;
      await performanceMonitor.recordMetric(
        endpoint,
        method,
        duration,
        statusCode,
        cacheHit
      );
    }
  };
}

// Performance API endpoint data
export function getPerformanceSummary(): {
  totalRequests: number;
  averageResponseTime: number;
  cacheHitRate: number;
  errorRate: number;
  memoryUsage: NodeJS.MemoryUsage;
  healthStatus: ReturnType<PerformanceMonitor['getHealthStatus']>;
} {
  const monitor = PerformanceMonitor.getInstance();
  const recent = monitor.getRecentMetrics(5); // Last 5 minutes
  
  return {
    totalRequests: recent.length,
    averageResponseTime: monitor.getAverageResponseTime(),
    cacheHitRate: monitor.getCacheHitRate(),
    errorRate: monitor.getErrorRate(),
    memoryUsage: monitor.getMemoryUsage(),
    healthStatus: monitor.getHealthStatus(),
  };
}
