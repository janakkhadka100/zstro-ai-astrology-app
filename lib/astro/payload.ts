// lib/astro/payload.ts
// Prokerala payload builder with timezone support

import { DateTime } from "luxon";

export interface ProkeralaPayload {
  datetime_utc: string;
  tz_offset_minutes: number;
  tz_name: string;
  lat: number;
  lon: number;
}

export interface PayloadOptions {
  localDate: string;        // YYYY-MM-DD format
  localTime?: string;       // HH:mm format, defaults to "12:00"
  iana: string;            // IANA timezone (e.g., "Asia/Kathmandu")
  lat: number;
  lon: number;
}

/**
 * Build Prokerala API payload with correct timezone handling
 * @param opts - Payload options
 * @returns Normalized payload for Prokerala API
 */
export function buildProkeralaPayload(opts: PayloadOptions): ProkeralaPayload {
  const time = opts.localTime ?? "12:00"; // noon default
  const local = DateTime.fromFormat(`${opts.localDate} ${time}`, "yyyy-LL-dd HH:mm", { 
    zone: opts.iana 
  });
  
  if (!local.isValid) {
    throw new Error(`Invalid date/time: ${opts.localDate} ${time} in zone ${opts.iana}`);
  }
  
  return {
    datetime_utc: local.toUTC().toISO({ suppressSeconds: true }),
    tz_offset_minutes: local.offset,
    tz_name: opts.iana,
    lat: opts.lat,
    lon: opts.lon
  };
}

/**
 * Build payload for transit calculations (always uses noon time)
 * @param opts - Payload options without time
 * @returns Payload optimized for transit calculations
 */
export function buildTransitPayload(opts: Omit<PayloadOptions, 'localTime'>): ProkeralaPayload {
  return buildProkeralaPayload({
    ...opts,
    localTime: "12:00" // Always use noon for transit calculations
  });
}

/**
 * Validate payload before sending to Prokerala
 * @param payload - Payload to validate
 * @returns Validation result
 */
export function validatePayload(payload: ProkeralaPayload): { valid: boolean; error?: string } {
  try {
    // Check required fields
    if (!payload.datetime_utc || !payload.tz_name || 
        typeof payload.lat !== 'number' || typeof payload.lon !== 'number') {
      return { valid: false, error: "Missing required fields" };
    }
    
    // Validate coordinates
    if (payload.lat < -90 || payload.lat > 90) {
      return { valid: false, error: "Invalid latitude" };
    }
    if (payload.lon < -180 || payload.lon > 180) {
      return { valid: false, error: "Invalid longitude" };
    }
    
    // Validate timezone offset
    if (Math.abs(payload.tz_offset_minutes) > 14 * 60) { // Max 14 hours
      return { valid: false, error: "Invalid timezone offset" };
    }
    
    // Validate UTC datetime
    const utcDate = DateTime.fromISO(payload.datetime_utc);
    if (!utcDate.isValid) {
      return { valid: false, error: "Invalid UTC datetime" };
    }
    
    return { valid: true };
  } catch (error) {
    return { valid: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
