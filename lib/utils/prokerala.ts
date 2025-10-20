import { DateTime } from "luxon";
import { BirthInput, ProkeralaPayload } from "@/lib/types/location";

/**
 * Build Prokerala API payload from normalized birth input
 * This ensures correct timezone handling for any date (including DST)
 */
export function buildProkeralaPayload(birth: BirthInput): ProkeralaPayload {
  // Create DateTime in the stored IANA timezone
  const local = DateTime.fromFormat(
    `${birth.date} ${birth.time}`, 
    "yyyy-LL-dd HH:mm", 
    { zone: birth.place.iana_tz }
  );

  if (!local.isValid) {
    throw new Error(`Invalid birth date/time: ${local.invalidReason}`);
  }

  return {
    datetime_utc: local.toUTC().toISO({ suppressSeconds: true }) || "",
    lat: birth.place.lat,
    lon: birth.place.lon,
    tz_name: birth.place.iana_tz,
    tz_offset_minutes: local.offset
  };
}

/**
 * Validate that a place has all required fields
 */
export function validatePlace(place: any): place is import("@/lib/types/location").NormalizedPlace {
  return (
    place &&
    typeof place.lat === "number" &&
    typeof place.lon === "number" &&
    typeof place.iana_tz === "string" &&
    typeof place.display_name === "string" &&
    typeof place.country_code === "string"
  );
}

/**
 * Format timezone offset for display (e.g., "+05:45", "-08:00")
 */
export function formatTimezoneOffset(offsetMinutes: number): string {
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const absMinutes = Math.abs(offsetMinutes);
  const hours = Math.floor(absMinutes / 60);
  const minutes = absMinutes % 60;
  return `${sign}${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

/**
 * Get timezone display name for UI
 */
export function getTimezoneDisplayName(iana: string): string {
  const parts = iana.split("/");
  if (parts.length === 2) {
    return parts[1].replace(/_/g, " ");
  }
  return iana;
}
