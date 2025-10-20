export type GeoProvider = "opencage" | "mapbox" | "google";

export type NormalizedPlace = {
  provider: GeoProvider;
  provider_place_id: string;        // e.g. OpenCage annotated place_id or hash
  display_name: string;             // e.g. "Kathmandu, Bagmati, Nepal"
  country: string;                  // canonical English
  country_code: string;             // "np"
  admin1?: string;                  // state/province if present
  city?: string;
  lat: number;
  lon: number;
  iana_tz: string;                  // "Asia/Kathmandu"
  // raw payload (for audit/debug)
  raw?: any;
};

export type BirthInput = {
  date: string;     // "YYYY-MM-DD" local
  time: string;     // "HH:mm" local
  place: NormalizedPlace;
};

export type ProkeralaPayload = {
  datetime_utc: string;   // ISO in UTC (computed)
  lat: number;
  lon: number;
  tz_name: string;        // IANA
  tz_offset_minutes: number; // e.g. 345 for Nepal
};

export type TimezoneResult = {
  iana: string;
  offset_minutes: number;
  datetime_utc: string;
};
