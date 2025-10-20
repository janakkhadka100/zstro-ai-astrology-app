// lib/time/age.ts
// Age calculation utilities with timezone support

import { DateTime } from "luxon";

export interface AgeResult {
  years: number;
  months: number;
  days: number;
}

/**
 * Compute precise age from birth date to target date
 * @param isoBirthDate - Birth date in ISO format (YYYY-MM-DD)
 * @param zone - IANA timezone string (e.g., "Asia/Kathmandu")
 * @param at - Target date (defaults to now)
 * @returns Age breakdown in years, months, days
 */
export function computeAge(
  isoBirthDate: string, 
  zone: string, 
  at: Date = new Date()
): AgeResult {
  const now = DateTime.fromJSDate(at, { zone });
  const bd = DateTime.fromISO(isoBirthDate, { zone });
  
  if (!now.isValid || !bd.isValid) {
    throw new Error(`Invalid date: birth=${isoBirthDate}, zone=${zone}`);
  }
  
  const d = now.diff(bd, ["years", "months", "days"]).toObject();
  
  return {
    years: Math.floor(d.years || 0),
    months: Math.floor(d.months || 0),
    days: Math.floor(d.days || 0)
  };
}

/**
 * Format age as human-readable string
 * @param age - Age result from computeAge
 * @param lang - Language code ('en', 'ne', 'hi')
 * @returns Formatted age string
 */
export function formatAge(age: AgeResult, lang: 'en' | 'ne' | 'hi' = 'en'): string {
  const { years, months, days } = age;
  
  switch (lang) {
    case 'ne':
      return `${years} वर्ष ${months} महिना ${days} दिन`;
    case 'hi':
      return `${years} वर्ष ${months} महीना ${days} दिन`;
    default:
      return `${years}y ${months}m ${days}d`;
  }
}

/**
 * Get age category for astrological interpretation
 * @param age - Age result from computeAge
 * @returns Age category string
 */
export function getAgeCategory(age: AgeResult): string {
  const { years } = age;
  
  if (years < 18) return 'youth';
  if (years < 30) return 'young_adult';
  if (years < 50) return 'middle_age';
  if (years < 70) return 'mature_adult';
  return 'senior';
}
