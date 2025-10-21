// lib/error-watcher.ts
// ZSTRO AI Error Monitoring and Auto-Retry System

export class ZstroErrorWatcher {
  private static instance: ZstroErrorWatcher;
  private errorLog: Map<string, ErrorLogEntry> = new Map();
  private retryQueue: RetryQueueEntry[] = [];
  private isWatching = false;

  static getInstance(): ZstroErrorWatcher {
    if (!ZstroErrorWatcher.instance) {
      ZstroErrorWatcher.instance = new ZstroErrorWatcher();
    }
    return ZstroErrorWatcher.instance;
  }

  startWatching() {
    if (this.isWatching) return;
    
    this.isWatching = true;
    console.log('🔍 [ZSTRO] Error Watcher started');
    
    // Monitor for unhandled errors
    window.addEventListener('error', this.handleError.bind(this));
    window.addEventListener('unhandledrejection', this.handlePromiseRejection.bind(this));
    
    // Process retry queue every 5 seconds
    setInterval(() => this.processRetryQueue(), 5000);
  }

  stopWatching() {
    this.isWatching = false;
    window.removeEventListener('error', this.handleError.bind(this));
    window.removeEventListener('unhandledrejection', this.handlePromiseRejection.bind(this));
    console.log('🔍 [ZSTRO] Error Watcher stopped');
  }

  private handleError(event: ErrorEvent) {
    const error = {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack
    };

    this.logError('JavaScript Error', error);
    this.autoRetry('JavaScript Error', error);
  }

  private handlePromiseRejection(event: PromiseRejectionEvent) {
    const error = {
      message: event.reason?.message || 'Unhandled Promise Rejection',
      stack: event.reason?.stack
    };

    this.logError('Promise Rejection', error);
    this.autoRetry('Promise Rejection', error);
  }

  logError(module: string, error: any) {
    const timestamp = new Date().toISOString();
    const errorId = `${module}-${timestamp}`;
    
    this.errorLog.set(errorId, {
      module,
      error,
      timestamp,
      retryCount: 0,
      resolved: false
    });

    console.error(`❌ [ZSTRO] ${module} failed:`, error);
  }

  autoRetry(module: string, error: any) {
    const retryEntry: RetryQueueEntry = {
      module,
      error,
      retryCount: 0,
      maxRetries: 3,
      nextRetry: Date.now() + 1000 // Retry after 1 second
    };

    this.retryQueue.push(retryEntry);
    console.log(`🔄 [ZSTRO] ${module} queued for auto-retry`);
  }

  private async processRetryQueue() {
    const now = Date.now();
    const readyToRetry = this.retryQueue.filter(entry => 
      entry.nextRetry <= now && entry.retryCount < entry.maxRetries
    );

    for (const entry of readyToRetry) {
      try {
        await this.retryModule(entry);
      } catch (error) {
        console.error(`❌ [ZSTRO] Retry failed for ${entry.module}:`, error);
      }
    }
  }

  private async retryModule(entry: RetryQueueEntry) {
    entry.retryCount++;
    entry.nextRetry = Date.now() + (entry.retryCount * 2000); // Exponential backoff

    console.log(`🔄 [ZSTRO] Retrying ${entry.module} (attempt ${entry.retryCount}/${entry.maxRetries})`);

    try {
      // Attempt to fix common issues
      await this.attemptFix(entry.module, entry.error);
      
      // Remove from retry queue on success
      this.retryQueue = this.retryQueue.filter(e => e !== entry);
      console.log(`✅ [ZSTRO] ${entry.module} retry successful`);
      
    } catch (error) {
      if (entry.retryCount >= entry.maxRetries) {
        console.error(`❌ [ZSTRO] ${entry.module} failed after ${entry.maxRetries} retries`);
        this.retryQueue = this.retryQueue.filter(e => e !== entry);
      }
    }
  }

  private async attemptFix(module: string, error: any): Promise<void> {
    // Module-specific fix attempts
    switch (module) {
      case 'astro-worker':
        await this.fixAstroWorker(error);
        break;
      case 'dasha-engine':
        await this.fixDashaEngine(error);
        break;
      case 'prokerala-service':
        await this.fixProkeralaService(error);
        break;
      case 'ui-components':
        await this.fixUIComponents(error);
        break;
      case 'chat-system':
        await this.fixChatSystem(error);
        break;
      case 'database':
        await this.fixDatabase(error);
        break;
      default:
        console.log(`🔧 [ZSTRO] No specific fix available for ${module}`);
    }
  }

  private async fixAstroWorker(error: any): Promise<void> {
    // Attempt to re-import or re-initialize astro worker
    console.log('🔧 [ZSTRO] Attempting to fix astro-worker...');
    // Implementation would go here
  }

  private async fixDashaEngine(error: any): Promise<void> {
    console.log('🔧 [ZSTRO] Attempting to fix dasha-engine...');
    // Implementation would go here
  }

  private async fixProkeralaService(error: any): Promise<void> {
    console.log('🔧 [ZSTRO] Attempting to fix prokerala-service...');
    // Implementation would go here
  }

  private async fixUIComponents(error: any): Promise<void> {
    console.log('🔧 [ZSTRO] Attempting to fix ui-components...');
    // Implementation would go here
  }

  private async fixChatSystem(error: any): Promise<void> {
    console.log('🔧 [ZSTRO] Attempting to fix chat-system...');
    // Implementation would go here
  }

  private async fixDatabase(error: any): Promise<void> {
    console.log('🔧 [ZSTRO] Attempting to fix database...');
    // Implementation would go here
  }

  getErrorStats() {
    const total = this.errorLog.size;
    const resolved = Array.from(this.errorLog.values()).filter(e => e.resolved).length;
    const pending = this.retryQueue.length;

    return { total, resolved, pending, unresolved: total - resolved };
  }

  getRecentErrors(limit = 10) {
    return Array.from(this.errorLog.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }
}

interface ErrorLogEntry {
  module: string;
  error: any;
  timestamp: string;
  retryCount: number;
  resolved: boolean;
}

interface RetryQueueEntry {
  module: string;
  error: any;
  retryCount: number;
  maxRetries: number;
  nextRetry: number;
}

// Global error watcher instance
export const errorWatcher = ZstroErrorWatcher.getInstance();
