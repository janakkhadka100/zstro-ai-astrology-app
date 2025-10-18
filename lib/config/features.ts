// lib/config/features.ts
// Feature flag configuration

export interface FeatureFlags {
  darkMode: boolean;
  skeletons: boolean;
  wsRealtime: boolean;
  export: boolean;
  history: boolean;
  notifications: boolean;
  pwa: boolean;
  transit: boolean;
  social: boolean;
  consult: boolean;
}

export function getFeatureFlags(): FeatureFlags {
  return {
    darkMode: process.env.FF_DARK_MODE === "1",
    skeletons: process.env.FF_SKELETONS === "1",
    wsRealtime: process.env.FF_WS_REALTIME === "1",
    export: process.env.FF_EXPORT === "1",
    history: process.env.FF_HISTORY === "1",
    notifications: process.env.FF_NOTIFICATIONS === "1",
    pwa: process.env.FF_PWA === "1",
    transit: process.env.FF_TRANSIT === "1",
    social: process.env.FF_SOCIAL === "1",
    consult: process.env.FF_CONSULT === "1",
  };
}

export function isFeatureEnabled(feature: keyof FeatureFlags | string): boolean {
  // Handle both new format (keyof FeatureFlags) and legacy string format
  if (feature in getFeatureFlags()) {
    const flags = getFeatureFlags();
    return flags[feature as keyof FeatureFlags];
  }
  
  // Legacy string format support
  switch (feature) {
    case 'dark_mode':
      return process.env.NEXT_PUBLIC_FF_DARK_MODE === '1';
    case 'skeletons':
      return process.env.NEXT_PUBLIC_FF_SKELETONS === '1';
    case 'ws_realtime':
    case 'wsRealtime':
      return process.env.NEXT_PUBLIC_FF_WS_REALTIME === '1';
    case 'export':
      return process.env.NEXT_PUBLIC_FF_EXPORT === '1';
    case 'history':
      return process.env.NEXT_PUBLIC_FF_HISTORY === '1';
    case 'notifications':
      return process.env.NEXT_PUBLIC_FF_NOTIFICATIONS === '1';
    case 'pwa':
      return process.env.NEXT_PUBLIC_FF_PWA === '1';
    case 'transit':
      return process.env.NEXT_PUBLIC_FF_TRANSIT === '1';
    case 'social':
      return process.env.NEXT_PUBLIC_FF_SOCIAL === '1';
    case 'consult':
      return process.env.NEXT_PUBLIC_FF_CONSULT === '1';
    default:
      return false;
  }
}

// Client-side feature flag hook
export function useFeatureFlag(feature: keyof FeatureFlags): boolean {
  // In a real implementation, this would be a React hook
  // For now, return the server-side value
  return isFeatureEnabled(feature);
}
