// lib/security/headers.ts
// Security headers configuration

import { NextRequest, NextResponse } from 'next/server';
import { SecurityHeadersInput } from './validators';

export const SECURITY_HEADERS: SecurityHeadersInput = {
  'content-security-policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' https://api.openai.com https://api.anthropic.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests"
  ].join('; '),
  
  'x-frame-options': 'DENY',
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'permissions-policy': [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'interest-cohort=()',
    'payment=()',
    'usb=()',
    'magnetometer=()',
    'gyroscope=()',
    'accelerometer=()'
  ].join(', ')
};

// Apply security headers to response
export function applySecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    if (value) {
      response.headers.set(key, value);
    }
  });
  
  return response;
}

// Create secure response
export function createSecureResponse(
  data: any,
  status: number = 200,
  options: { headers?: Record<string, string> } = {}
): NextResponse {
  const response = NextResponse.json(data, { status });
  
  // Apply security headers
  applySecurityHeaders(response);
  
  // Apply custom headers
  if (options.headers) {
    Object.entries(options.headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }
  
  return response;
}

// Security middleware
export function securityMiddleware(req: NextRequest) {
  const response = NextResponse.next();
  
  // Apply security headers
  applySecurityHeaders(response);
  
  // Add additional security measures
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('X-DNS-Prefetch-Control', 'off');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  return response;
}

// CORS configuration
export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' 
    ? 'https://zstro.ai' 
    : '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400'
};

// Apply CORS headers
export function applyCORSHeaders(response: NextResponse): NextResponse {
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  return response;
}

// Rate limit headers
export function addRateLimitHeaders(
  response: NextResponse,
  limit: number,
  remaining: number,
  resetTime: number
): NextResponse {
  response.headers.set('X-RateLimit-Limit', limit.toString());
  response.headers.set('X-RateLimit-Remaining', remaining.toString());
  response.headers.set('X-RateLimit-Reset', new Date(resetTime).toISOString());
  
  return response;
}

// Cache control headers
export const CACHE_HEADERS = {
  'no-cache': 'no-cache, no-store, must-revalidate',
  'private': 'private, max-age=0, must-revalidate',
  'public-short': 'public, max-age=300', // 5 minutes
  'public-medium': 'public, max-age=1800', // 30 minutes
  'public-long': 'public, max-age=3600', // 1 hour
  'immutable': 'public, max-age=31536000, immutable' // 1 year
};

// Apply cache headers
export function applyCacheHeaders(
  response: NextResponse,
  cacheType: keyof typeof CACHE_HEADERS
): NextResponse {
  response.headers.set('Cache-Control', CACHE_HEADERS[cacheType]);
  
  return response;
}
