// lib/astro/dashaCalculator.ts
// Comprehensive Vedic dasha calculation system

export interface BirthData {
  date: string; // YYYY-MM-DD
  time: string; // HH:mm:ss
  tz_offset: string; // +05:45 etc.
  location: {
    lat: number;
    lon: number;
  };
  ayanamsa: string; // e.g., Lahiri
}

export interface DashaRequest {
  birth: BirthData;
  moon_longitude_deg: number;
  locale: "ne-NP" | "en";
  query_range?: {
    from: string; // ISO date-time
    to: string; // ISO date-time
  };
  user_events?: string[]; // YYYY-MM-DD dates
  config?: {
    traditionHints?: {
      startFrom?: string; // Yogini start lord override
    };
  };
}

export interface NakshatraData {
  index: number; // 1-27
  name: string;
  pada: number; // 1-4
  fraction_used: number;
  fraction_remaining: number;
}

export interface DashaPeriod {
  lord: string;
  start: string; // ISO timestamp
  end: string; // ISO timestamp
  years: number;
}

export interface DashaStack {
  maha?: string;
  antara?: string;
  pratyantara?: string;
  sookshma?: string;
  prana?: string;
}

export interface VimshottariData {
  maha: DashaPeriod[];
  active_stack: DashaStack;
}

export interface YoginiData {
  maha: DashaPeriod[];
  active_stack: DashaStack;
}

export interface EventCheck {
  date: string;
  vimshottari_stack: DashaStack;
  yogini_stack: DashaStack;
  impact_note: string;
}

export interface DashaResponse {
  nakshatra: NakshatraData;
  vimshottari: VimshottariData;
  yogini: YoginiData;
  active: {
    timestamp: string;
    vimshottari: DashaStack;
    yogini: DashaStack;
  };
  event_checks?: EventCheck[];
  notes: {
    start_rule?: string;
    validation: {
      vim_total_years: number;
      yog_total_years: number;
      partition_ok: boolean;
    };
  };
  locale: string;
}

// Vimshottari definitions
const VIMSHOTTARI_LORDS = [
  "Ketu", "Venus", "Sun", "Moon", "Mars", 
  "Rahu", "Jupiter", "Saturn", "Mercury"
];

const VIMSHOTTARI_YEARS = [7, 20, 6, 10, 7, 18, 16, 19, 17]; // Total: 120

// Yogini definitions
const YOGINI_LORDS = [
  "Mangala", "Pingala", "Dhanya", "Bhramari", 
  "Bhadrika", "Ulka", "Siddha", "Sankata"
];

const YOGINI_YEARS = [1, 2, 3, 4, 5, 6, 7, 8]; // Total: 36

// Nakshatra names (27)
const NAKSHATRA_NAMES = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
  "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
  "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishtha",
  "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

// Nakshatra to Vimshottari lord mapping (27 nakshatras → 9 lords)
const NAKSHATRA_TO_VIMSHOTTARI = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, // 1-9: Ketu, Venus, Sun, Moon, Mars, Rahu, Jupiter, Saturn, Mercury
  0, 1, 2, 3, 4, 5, 6, 7, 8, // 10-18: repeat
  0, 1, 2, 3, 4, 5, 6, 7, 8  // 19-27: repeat
];

// Nakshatra to Yogini lord mapping (27 nakshatras → 8 lords)
const NAKSHATRA_TO_YOGINI = [
  0, 1, 2, 3, 4, 5, 6, 7, // 1-8: Mangala, Pingala, Dhanya, Bhramari, Bhadrika, Ulka, Siddha, Sankata
  0, 1, 2, 3, 4, 5, 6, 7, // 9-16: repeat
  0, 1, 2, 3, 4, 5, 6, 7, // 17-24: repeat
  0, 1, 2  // 25-27: partial repeat
];

export function calculateNakshatra(moonLongitudeDeg: number): NakshatraData {
  const nakshatraLength = 13.333333; // 13°20'
  const nakIndex = Math.floor(moonLongitudeDeg / nakshatraLength) + 1;
  const padaIndex = Math.floor((moonLongitudeDeg % nakshatraLength) / (nakshatraLength / 4)) + 1;
  const fractionUsed = (moonLongitudeDeg - (nakIndex - 1) * nakshatraLength) / nakshatraLength;
  const fractionRemaining = 1 - fractionUsed;

  return {
    index: Math.min(nakIndex, 27), // Cap at 27
    name: NAKSHATRA_NAMES[Math.min(nakIndex - 1, 26)],
    pada: Math.min(padaIndex, 4), // Cap at 4
    fraction_used: fractionUsed,
    fraction_remaining: fractionRemaining
  };
}

export function calculateVimshottari(
  birthData: BirthData, 
  nakshatraData: NakshatraData,
  queryTimestamp?: string
): VimshottariData {
  const birthTime = new Date(`${birthData.date}T${birthData.time}${birthData.tz_offset}`);
  const nakIndex = nakshatraData.index;
  const fractionRemaining = nakshatraData.fraction_remaining;
  
  // Get first lord from nakshatra
  const firstLordIndex = NAKSHATRA_TO_VIMSHOTTARI[nakIndex - 1];
  const firstLord = VIMSHOTTARI_LORDS[firstLordIndex];
  const firstLordYears = VIMSHOTTARI_YEARS[firstLordIndex];
  
  // Calculate first maha duration
  const firstMahaYears = firstLordYears * fractionRemaining;
  
  // Build maha periods
  const mahaPeriods: DashaPeriod[] = [];
  let currentTime = birthTime;
  let lordIndex = firstLordIndex;
  let totalYears = 0;
  
  // First maha (partial)
  const firstMahaEnd = new Date(currentTime.getTime() + firstMahaYears * 365.2425 * 24 * 60 * 60 * 1000);
  mahaPeriods.push({
    lord: firstLord,
    start: currentTime.toISOString(),
    end: firstMahaEnd.toISOString(),
    years: firstMahaYears
  });
  
  currentTime = firstMahaEnd;
  totalYears += firstMahaYears;
  lordIndex = (lordIndex + 1) % 9;
  
  // Remaining maha periods
  while (totalYears < 120) {
    const lord = VIMSHOTTARI_LORDS[lordIndex];
    const lordYears = VIMSHOTTARI_YEARS[lordIndex];
    const remainingYears = Math.min(lordYears, 120 - totalYears);
    
    const periodEnd = new Date(currentTime.getTime() + remainingYears * 365.2425 * 24 * 60 * 60 * 1000);
    mahaPeriods.push({
      lord,
      start: currentTime.toISOString(),
      end: periodEnd.toISOString(),
      years: remainingYears
    });
    
    currentTime = periodEnd;
    totalYears += remainingYears;
    lordIndex = (lordIndex + 1) % 9;
  }
  
  // Calculate active stack
  const queryTime = queryTimestamp ? new Date(queryTimestamp) : new Date();
  const activeStack = getActiveVimshottariStack(mahaPeriods, queryTime);
  
  return {
    maha: mahaPeriods,
    active_stack: activeStack
  };
}

export function calculateYogini(
  birthData: BirthData,
  nakshatraData: NakshatraData,
  config?: { traditionHints?: { startFrom?: string } },
  queryTimestamp?: string
): YoginiData {
  const birthTime = new Date(`${birthData.date}T${birthData.time}${birthData.tz_offset}`);
  const nakIndex = nakshatraData.index;
  const fractionRemaining = nakshatraData.fraction_remaining;
  
  // Get first lord from nakshatra (default rule)
  let firstLordIndex = (nakIndex - 1) % 8;
  if (config?.traditionHints?.startFrom) {
    const customIndex = YOGINI_LORDS.indexOf(config.traditionHints.startFrom);
    if (customIndex !== -1) {
      firstLordIndex = customIndex;
    }
  }
  
  const firstLord = YOGINI_LORDS[firstLordIndex];
  const firstLordYears = YOGINI_YEARS[firstLordIndex];
  
  // Calculate first maha duration
  const firstMahaYears = firstLordYears * fractionRemaining;
  
  // Build maha periods
  const mahaPeriods: DashaPeriod[] = [];
  let currentTime = birthTime;
  let lordIndex = firstLordIndex;
  let totalYears = 0;
  
  // First maha (partial)
  const firstMahaEnd = new Date(currentTime.getTime() + firstMahaYears * 365.2425 * 24 * 60 * 60 * 1000);
  mahaPeriods.push({
    lord: firstLord,
    start: currentTime.toISOString(),
    end: firstMahaEnd.toISOString(),
    years: firstMahaYears
  });
  
  currentTime = firstMahaEnd;
  totalYears += firstMahaYears;
  lordIndex = (lordIndex + 1) % 8;
  
  // Remaining maha periods
  while (totalYears < 36) {
    const lord = YOGINI_LORDS[lordIndex];
    const lordYears = YOGINI_YEARS[lordIndex];
    const remainingYears = Math.min(lordYears, 36 - totalYears);
    
    const periodEnd = new Date(currentTime.getTime() + remainingYears * 365.2425 * 24 * 60 * 60 * 1000);
    mahaPeriods.push({
      lord,
      start: currentTime.toISOString(),
      end: periodEnd.toISOString(),
      years: remainingYears
    });
    
    currentTime = periodEnd;
    totalYears += remainingYears;
    lordIndex = (lordIndex + 1) % 8;
  }
  
  // Calculate active stack
  const queryTime = queryTimestamp ? new Date(queryTimestamp) : new Date();
  const activeStack = getActiveYoginiStack(mahaPeriods, queryTime);
  
  return {
    maha: mahaPeriods,
    active_stack: activeStack
  };
}

function getActiveVimshottariStack(mahaPeriods: DashaPeriod[], queryTime: Date): DashaStack {
  // Find current maha period
  const currentMaha = mahaPeriods.find(period => 
    queryTime >= new Date(period.start) && queryTime < new Date(period.end)
  );
  
  if (!currentMaha) {
    return {};
  }
  
  // For now, return just maha level
  // TODO: Implement nested calculations for antar, pratyantar, etc.
  return {
    maha: currentMaha.lord
  };
}

function getActiveYoginiStack(mahaPeriods: DashaPeriod[], queryTime: Date): DashaStack {
  // Find current maha period
  const currentMaha = mahaPeriods.find(period => 
    queryTime >= new Date(period.start) && queryTime < new Date(period.end)
  );
  
  if (!currentMaha) {
    return {};
  }
  
  // For now, return just maha level
  // TODO: Implement nested calculations for antar, pratyantar, etc.
  return {
    maha: currentMaha.lord
  };
}

export function calculateDashaSystem(request: DashaRequest): DashaResponse {
  const nakshatra = calculateNakshatra(request.moon_longitude_deg);
  const vimshottari = calculateVimshottari(request.birth, nakshatra);
  const yogini = calculateYogini(request.birth, nakshatra, request.config);
  
  const queryTime = request.query_range?.to ? new Date(request.query_range.to) : new Date();
  
  // Calculate active stacks
  const activeVimshottari = getActiveVimshottariStack(vimshottari.maha, queryTime);
  const activeYogini = getActiveYoginiStack(yogini.maha, queryTime);
  
  // Validation
  const vimTotalYears = vimshottari.maha.reduce((sum, period) => sum + period.years, 0);
  const yogTotalYears = yogini.maha.reduce((sum, period) => sum + period.years, 0);
  
  // Check for gaps/overlaps
  let partitionOk = true;
  for (let i = 0; i < vimshottari.maha.length - 1; i++) {
    const currentEnd = new Date(vimshottari.maha[i].end);
    const nextStart = new Date(vimshottari.maha[i + 1].start);
    if (Math.abs(currentEnd.getTime() - nextStart.getTime()) > 1000) { // 1 second tolerance
      partitionOk = false;
      break;
    }
  }
  
  return {
    nakshatra,
    vimshottari,
    yogini,
    active: {
      timestamp: queryTime.toISOString(),
      vimshottari: activeVimshottari,
      yogini: activeYogini
    },
    notes: {
      validation: {
        vim_total_years: vimTotalYears,
        yog_total_years: yogTotalYears,
        partition_ok: partitionOk
      }
    },
    locale: request.locale
  };
}
