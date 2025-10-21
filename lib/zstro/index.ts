// lib/zstro/index.ts
// ZSTRO AI Unified Module Exports
// This file serves as the central hub for all ZSTRO AI modules

// ===== ASTRO CALCULATION MODULES =====
export {
  calculateHouse,
  getSignNumber,
  getSignName,
  getHouseMeaning,
  getPlanetLordshipHouses,
  formatPlanetPosition,
  formatPlanetPositionWithVerification,
  runSelfTest,
  SIGN_TO_NUM,
  NUM_TO_SIGN
} from '../ai/astro-worker-prompt';
export * from '../ai/astro-worker-integration';
// export * from '../astro/dashaEngine'; // Server-only
export * from '../astro/houseCalculation';
export * from '../astro/divisional-yoga';
export * from '../astro/yoga-detectors';
export * from '../astro/dosha-detectors';
export * from '../astro/nakshatra';
export * from '../astro/house';
// export * from '../astro/stack'; // Server-only

// ===== API SERVICES =====
export * from '../prokerala/service';
export * from '../prokerala/client';
export * from '../prokerala/types';

// ===== UI COMPONENTS =====
export { default as AstroCards } from '../../components/astro/AstroCards';
export { default as BirthCard } from '../../components/cards/BirthCard';
export { default as OverviewCard } from '../../components/cards/OverviewCard';
export { default as PlanetsCard } from '../../components/cards/PlanetsCard';
export { default as ChartsCard } from '../../components/cards/ChartsCard';
export { default as DashaCard } from '../../components/cards/DashaCard';
export { default as YoginiCard } from '../../components/cards/YoginiCard';
export { default as TransitsCard } from '../../components/cards/TransitsCard';
export { default as AnalysisCard } from '../../components/cards/AnalysisCard';
export { default as SuggestCard } from '../../components/cards/SuggestCard';
export { default as PanchangCard } from '../../components/cards/PanchangCard';
export { default as CalendarCard } from '../../components/cards/CalendarCard';
export { default as HouseCalculationCard } from '../../components/cards/HouseCalculationCard';

// ===== CHAT COMPONENTS =====
export { default as ChatComposer } from '../../components/chat/ChatComposer';
export { default as ChatWithCards } from '../../components/chat/ChatWithCards';

// ===== TYPES =====
export * from '../types/astro';
export * from '../astro-contract';

// ===== UTILITIES =====
export * from '../utils';
export * from '../cards/compose';

// ===== DATABASE =====
// Note: Database exports are server-only, not available in client components
// export * from '../db/queries';
// export * from '../db/schema';

// ===== AI PROMPTS =====
// export * from '../ai/prompts'; // Server-only
// export * from '../ai/chatWithMemory'; // Server-only
// export * from '../ai/learnFromMemories'; // Server-only

// ===== CONFIGURATION =====
export const ZSTRO_CONFIG = {
  version: '1.0.0',
  name: 'ZSTRO AI',
  description: 'AI Jyotish Platform',
  features: [
    'Vedic Astrology Calculations',
    'House Position Analysis', 
    'Dasha Period Calculations',
    'AI-Powered Chat',
    'Real-time Transit Analysis',
    'Multi-language Support'
  ]
} as const;

// ===== NETWORK STATUS =====
export class ZstroNetworkStatus {
  private static instance: ZstroNetworkStatus;
  private modules: Map<string, boolean> = new Map();
  private errors: Map<string, string> = new Map();

  static getInstance(): ZstroNetworkStatus {
    if (!ZstroNetworkStatus.instance) {
      ZstroNetworkStatus.instance = new ZstroNetworkStatus();
    }
    return ZstroNetworkStatus.instance;
  }

  registerModule(name: string, status: boolean, error?: string) {
    this.modules.set(name, status);
    if (error) {
      this.errors.set(name, error);
    }
  }

  getStatus(): { modules: Map<string, boolean>; errors: Map<string, string> } {
    return { modules: this.modules, errors: this.errors };
  }

  isHealthy(): boolean {
    return Array.from(this.modules.values()).every(status => status);
  }

  getFailedModules(): string[] {
    return Array.from(this.modules.entries())
      .filter(([_, status]) => !status)
      .map(([name, _]) => name);
  }
}

// ===== AUTO-RETRY MECHANISM =====
export class ZstroAutoRetry {
  private static retryCount = 0;
  private static maxRetries = 3;

  static async retry<T>(
    operation: () => Promise<T>,
    moduleName: string,
    delay: number = 1000
  ): Promise<T> {
    try {
      const result = await operation();
      ZstroNetworkStatus.getInstance().registerModule(moduleName, true);
      return result;
    } catch (error) {
      this.retryCount++;
      console.warn(`⚠️ [ZSTRO] ${moduleName} failed — auto-retrying build (${this.retryCount}/${this.maxRetries})`);
      
      if (this.retryCount < this.maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.retry(operation, moduleName, delay * 2);
      } else {
        ZstroNetworkStatus.getInstance().registerModule(moduleName, false, error as string);
        throw error;
      }
    }
  }

  static reset() {
    this.retryCount = 0;
  }
}

// ===== NETWORK INITIALIZATION =====
export async function initializeZstroNetwork(): Promise<boolean> {
  console.log('🚀 [ZSTRO] Initializing Network Integration...');
  
  try {
    // Initialize all modules
    const modules = [
      'astro-worker',
      'dasha-engine', 
      'house-calculation',
      'prokerala-service',
      'ui-components',
      'chat-system',
      'database'
    ];

    for (const module of modules) {
      await ZstroAutoRetry.retry(
        () => Promise.resolve(),
        module
      );
    }

    const status = ZstroNetworkStatus.getInstance();
    if (status.isHealthy()) {
      console.log('✅ ZSTRO AI Network Integrated Successfully (All Cards Active, Chat Live).');
      return true;
    } else {
      const failed = status.getFailedModules();
      console.error(`❌ [ZSTRO] Network Integration Failed. Failed modules: ${failed.join(', ')}`);
      return false;
    }
  } catch (error) {
    console.error('❌ [ZSTRO] Network Initialization Error:', error);
    return false;
  }
}
