// lib/utils/url.ts
// Utility for deriving base URL across different environments

export const getBaseUrl = (): string => {
  // Check for explicit site URL first
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  // Check for NextAuth URL
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }

  // Server-side fallback
  if (typeof window === 'undefined') {
    // In production, we should have NEXTAUTH_URL set
    if (process.env.NODE_ENV === 'production') {
      console.warn('NEXTAUTH_URL not set in production');
    }
    return 'http://localhost:3000';
  }

  // Client-side fallback
  return window.location.origin;
};

export const getEnvironment = (): 'local' | 'preview' | 'production' => {
  if (process.env.NODE_ENV === 'development') {
    return 'local';
  }
  
  if (process.env.VERCEL_ENV === 'preview') {
    return 'preview';
  }
  
  if (process.env.VERCEL_ENV === 'production') {
    return 'production';
  }
  
  // Fallback detection
  const baseUrl = getBaseUrl();
  if (baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')) {
    return 'local';
  }
  
  if (baseUrl.includes('vercel.app') && !baseUrl.includes('zstro-ai')) {
    return 'preview';
  }
  
  return 'production';
};

export const isDevelopment = (): boolean => {
  return getEnvironment() === 'local';
};

export const isPreview = (): boolean => {
  return getEnvironment() === 'preview';
};

export const isProduction = (): boolean => {
  return getEnvironment() === 'production';
};
