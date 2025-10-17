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

export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  const flags = getFeatureFlags();
  return flags[feature];
}

// Client-side feature flag hook
export function useFeatureFlag(feature: keyof FeatureFlags): boolean {
  // In a real implementation, this would be a React hook
  // For now, return the server-side value
  return isFeatureEnabled(feature);
}
