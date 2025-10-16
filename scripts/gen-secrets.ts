#!/usr/bin/env tsx
// scripts/gen-secrets.ts
// Generate secure secrets for environment variables

import { randomBytes } from 'crypto';

function generateSecret(length: number = 32): string {
  return randomBytes(length).toString('hex');
}

function generateBase64Secret(length: number = 32): string {
  return randomBytes(length).toString('base64');
}

function generateJWTSecret(): string {
  return generateSecret(64); // 64 bytes = 128 hex characters
}

function generateNextAuthSecret(): string {
  return generateSecret(32); // 32 bytes = 64 hex characters
}

function generatePIIEncKey(): string {
  return generateBase64Secret(32); // 32 bytes base64 for AES-256
}

console.log('🔐 ZSTRO AI Secret Generator');
console.log('============================\n');

console.log('Generated secrets for your .env file:\n');

console.log('# Authentication');
console.log(`NEXTAUTH_SECRET=${generateNextAuthSecret()}`);
console.log(`JWT_SECRET=${generateJWTSecret()}\n`);

console.log('# Encryption');
console.log(`PII_ENC_KEY=${generatePIIEncKey()}\n`);

console.log('⚠️  Important Security Notes:');
console.log('- Store these secrets securely');
console.log('- Never commit them to version control');
console.log('- Use different secrets for each environment');
console.log('- Rotate secrets regularly in production\n');

console.log('📝 Next Steps:');
console.log('1. Copy these values to your .env.local file');
console.log('2. Add them to Vercel environment variables');
console.log('3. Update your production secrets in Vercel dashboard');
