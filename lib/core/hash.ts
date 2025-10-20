// lib/core/hash.ts
import crypto from 'crypto';

export function eventHash(eventType: string, isoDate: string, text: string) {
  const norm = (text || '').toLowerCase().replace(/\s+/g, ' ').trim();
  return crypto.createHash('sha256').update(`${eventType}|${isoDate}|${norm}`).digest('hex');
}


