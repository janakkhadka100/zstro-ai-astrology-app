// lib/config/env.ts
// Environment configuration with validation

import { z } from 'zod';

const envSchema = z.object({
  // Database
  POSTGRES_URL: z.string().url(),
  DATABASE_URL: z.string().url(),
  
  // Authentication
  AUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url().optional(),
  
  // OpenAI
  OPENAI_API_KEY: z.string().min(1),
  
  // Prokerala API
  PROKERALA_API_KEY: z.string().min(1),
  PROKERALA_API_SECRET: z.string().min(1),
  PROKERALA_BASE_URL: z.string().url().default('https://api.prokerala.com/v2'),
  
  // Redis (optional)
  REDIS_URL: z.string().url().optional(),
  
  // Timezone API (optional)
  TIMEZONE_API_KEY: z.string().optional(),
  
  // Logging
  LOG_LEVEL: z.enum(['ERROR', 'WARN', 'INFO', 'DEBUG']).default('INFO'),
  
  // External Services (optional)
  SENTRY_DSN: z.string().url().optional(),
  
  // Payment Gateways
  KHALTI_SECRET_KEY: z.string().optional(),
  KHALTI_PUBLIC_KEY: z.string().optional(),
  KHALTI_WEBHOOK_SECRET: z.string().optional(),
  
  ESEWA_MERCHANT_ID: z.string().optional(),
  ESEWA_SECRET_KEY: z.string().optional(),
  
  CONNECTIPS_MERCHANT_ID: z.string().optional(),
  CONNECTIPS_SECRET_KEY: z.string().optional(),
  
  // Email
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  
  // File Storage
  VERCEL_BLOB_READ_WRITE_TOKEN: z.string().optional(),
  
  // Development
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export type EnvConfig = z.infer<typeof envSchema>;

let envConfig: EnvConfig;

try {
  envConfig = envSchema.parse(process.env);
} catch (error) {
  console.error('❌ Invalid environment configuration:');
  if (error instanceof z.ZodError) {
    error.errors.forEach((err) => {
      console.error(`  - ${err.path.join('.')}: ${err.message}`);
    });
  }
  process.exit(1);
}

export default envConfig;

// Helper functions for common environment checks
export const isDevelopment = envConfig.NODE_ENV === 'development';
export const isProduction = envConfig.NODE_ENV === 'production';
export const isTest = envConfig.NODE_ENV === 'test';

// Feature flags based on environment
export const features = {
  redis: !!envConfig.REDIS_URL,
  sentry: !!envConfig.SENTRY_DSN,
  timezoneApi: !!envConfig.TIMEZONE_API_KEY,
  email: !!(envConfig.SMTP_HOST && envConfig.SMTP_USER && envConfig.SMTP_PASS),
  payments: {
    khalti: !!(envConfig.KHALTI_SECRET_KEY && envConfig.KHALTI_PUBLIC_KEY),
    esewa: !!(envConfig.ESEWA_MERCHANT_ID && envConfig.ESEWA_SECRET_KEY),
    connectips: !!(envConfig.CONNECTIPS_MERCHANT_ID && envConfig.CONNECTIPS_SECRET_KEY),
  },
} as const;
