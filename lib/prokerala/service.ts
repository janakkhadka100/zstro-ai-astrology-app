// lib/prokerala/service.ts
import axios from "axios";
import {
  UserQuery,
  AstrologyData,
  Coordinates,
  PlanetPosition,
  DignityItem,
  AspectItem,
  VimshottariDasha,
  VimshottariLevel,
  YoginiDasha,
  ShadbalaItem,
  DivisionalChart,
  DivisionalPlanet,
} from "./types";
import detectYogas from "../astro/yoga-detectors";
import detectDoshas from "../astro/dosha-detectors";
import { geocodingService } from "../services/geocoding";
import { cacheService, CacheKeys } from "../services/cache";
import { logger } from "../services/logger";
import { astrologyValidationService } from "../services/astrologyValidation";

/* ------------ config/auth ------------- */
type MissingBag = string[];
interface ProkeralaConfig {
  apiKey: string;
  apiSecret: string;
  baseUrl: string;
}
interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope?: string;
}

class ProkeralaService {
  private token: string | null = null;
  private tokenExpiry: Date | null = null;

  private config: ProkeralaConfig = {
    apiKey: process.env.PROKERALA_API_KEY || "",
    apiSecret: process.env.PROKERALA_API_SECRET || "",
    baseUrl: process.env.PROKERALA_BASE_URL || "https://api.prokerala.com/v2",
  };

  private async getAccessToken(): Promise<string> {
    if (this.token && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.token;
    }
    const r = await axios.post<AuthResponse>("https://api.prokerala.com/token", {
      grant_type: "client_credentials",
      client_id: this.config.apiKey,
      client_secret: this.config.apiSecret,
    });
    this.token = r.data.access_token;
    this.tokenExpiry = new Date(Date.now() + r.data.expires_in * 1000);
    return this.token;
  }

  private async tryFetch<T>(
    url: string,
    params: Record<string, any>,
    missing: MissingBag,
    label: string
  ): Promise<T | null> {
    try {
      const token = await this.getAccessToken();
      const resp = await axios.get<T>(url, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });
      // Some endpoints respond with `{ data: ... }`, others raw
      // @ts-ignore
      return resp.data?.data ?? (resp.data as any) ?? null;
    } catch {
      missing.push(`prokerala:${label}`);
      return null;
    }
  }

  /* ------------ helpers (time/geo + core math) ------------- */

  /**
   * Get coordinates for a place using geocoding service
   */
  private async getCoordinates(place?: string): Promise<Coordinates> {
    if (!place) {
      // Default to Kathmandu if no place provided
      return { lat: 27.710315, lon: 85.322163 };
    }

    try {
      // Check cache first
      const cacheKey = CacheKeys.geocode(place);
      const cached = await cacheService.get<Coordinates>(cacheKey);
      if (cached) {
        logger.debug('Using cached coordinates', { place, coordinates: cached });
        return cached;
      }

      // Geocode the place
      const result = await geocodingService.geocode(place, {
        countryCode: 'NP', // Focus on Nepal
        limit: 1,
      });

      if (result) {
        const coordinates = { lat: result.lat, lon: result.lon };
        
        // Cache the result for 24 hours
        await cacheService.set(cacheKey, coordinates, { ttl: 86400 });
        
        logger.info('Geocoded place successfully', { 
          place, 
          coordinates,
          displayName: result.displayName 
        });
        
        return coordinates;
      }

      // Fallback to Kathmandu if geocoding fails
      logger.warn('Geocoding failed, using Kathmandu as fallback', { place });
      return { lat: 27.710315, lon: 85.322163 };
    } catch (error) {
      logger.error('Geocoding error', { place, error });
      return { lat: 27.710315, lon: 85.322163 };
    }
  }

  // Nepal TZ used for now (Asia/Kathmandu = +05:45)
  private toISO(date: string, time: string): string {
    const t = /^\d{2}:\d{2}(:\d{2})?$/.test(time)
      ? time.length === 5
        ? `${time}:00`
        : time
      : "00:00:00";
    return `${date}T${t}+05:45`;
  }

  private zodiac = [
    "Aries",
    "Taurus",
    "Gemini",
    "Cancer",
    "Leo",
    "Virgo",
    "Libra",
    "Scorpio",
    "Sagittarius",
    "Capricorn",
    "Aquarius",
    "Pisces",
  ];

  private rasiFromLong(L: number) {
    return Math.floor(L / 30) + 1; // 1..12
  }
  private calcHouseFromSigns(asc: number, pr: number) {
    return ((pr - asc + 12) % 12) + 1; // 1..12
  }

  private buildDignities(ps: PlanetPosition[]): DignityItem[] {
    // super-light dignity classifier using rasiId only
    const uccha = { Sun: 1, Moon: 2, Mars: 10, Mercury: 6, Jupiter: 4, Venus: 12, Saturn: 7 } as Record<string, number>;
    const nicha = { Sun: 7, Moon: 8, Mars: 4, Mercury: 12, Jupiter: 10, Venus: 6, Saturn: 1 } as Record<string, number>;
    const moola = { Sun: 5, Moon: 2, Mars: 1, Mercury: 6, Jupiter: 9, Venus: 7, Saturn: 11 } as Record<string, number>;
    const own = {
      Sun: [5],
      Moon: [4],
      Mars: [1, 8],
      Mercury: [3, 6],
      Jupiter: [9, 12],
      Venus: [2, 7],
      Saturn: [10, 11],
    } as Record<string, number[]>;

    return ps.map((p) => {
      const rasiId = p.rasiId;
      let status = "neutral";
      if (rasiId) {
        if (uccha[p.planet] === rasiId) status = "Exalted";
        else if (nicha[p.planet] === rasiId) status = "Debilitated";
        else if (own[p.planet]?.includes(rasiId)) status = "Own";
        else if (moola[p.planet] === rasiId) status = "Mooltrikona";
      }
      return { planet: p.planet, status };
    });
  }

  private buildAspects(ps: PlanetPosition[]): AspectItem[] {
    const out: AspectItem[] = [];
    for (const p of ps) {
      const adds =
        p.planet === "Mars"
          ? [4, 7, 8]
          : p.planet === "Jupiter"
          ? [5, 7, 9]
          : p.planet === "Saturn"
          ? [3, 7, 10]
          : [7];
      for (const step of adds) {
        const to = ((p.house + step - 2) % 12) + 1;
        out.push({
          fromPlanet: p.planet,
          toPlanetOrHouse: `H${to}`,
          type: step === 7 ? "seventh" : "special",
        });
      }
    }
    return out;
  }

  /** keep only one entry per planet, prefer the one that has house + rasiId */
  private sanitizePlanetPositions(ps: PlanetPosition[]): PlanetPosition[] {
    const keep = new Map<string, PlanetPosition>();
    for (const p of ps) {
      const k = p.planet;
      const prev = keep.get(k);
      if (!prev) keep.set(k, p);
      else {
        const score = (x: PlanetPosition) => (x.house ? 1 : 0) + (x.rasiId ? 1 : 0);
        if (score(p) >= score(prev)) keep.set(k, p);
      }
    }
    return Array.from(keep.values());
  }

  private async fetchDivisional(
    baseParams: Record<string, any>,
    missing: MissingBag,
    code: string
  ): Promise<DivisionalChart | null> {
    const url = `${this.config.baseUrl}/astrology/divisional-chart`;
    const data = await this.tryFetch<any>(
      url,
      { ...baseParams, chart: code },
      missing,
      `divisional:${code.toLowerCase()}`
    );
    if (!data || !Array.isArray(data.planets)) return null;
    const planets: DivisionalPlanet[] = data.planets.map((p: any) => ({
      planet: p.name,
      sign: p.sign || p.rasi || "",
      house: p.house ?? null,
    }));
    return { type: code, planets };
  }

  /* ------------ MAIN ------------- */
  public async getAstrologyData(q: UserQuery): Promise<AstrologyData> {
    const startTime = Date.now();
    const missing: MissingBag = [];
    const { birthDate, birthTime, birthPlace } = q;
    
    if (!birthDate || !birthTime || !birthPlace) {
      throw new Error("Birth details are required");
    }

    // Create cache key for this calculation
    const coords = await this.getCoordinates(birthPlace);
    const cacheKey = CacheKeys.astroData(birthDate, birthTime, coords.lat, coords.lon);
    
    // Check cache first
    const cached = await cacheService.get<AstrologyData>(cacheKey);
    if (cached) {
      logger.debug('Using cached astrology data', { 
        birthDate, 
        birthTime, 
        birthPlace,
        cacheKey 
      });
      return cached;
    }

    // Validate birth data
    const birthDataValidation = astrologyValidationService.validateBirthData(
      birthDate, 
      birthTime, 
      birthPlace
    );
    
    if (!birthDataValidation.valid) {
      logger.warn('Invalid birth data provided', {
        birthDate,
        birthTime,
        birthPlace,
        errors: birthDataValidation.errors,
      });
      throw new Error(`Invalid birth data: ${birthDataValidation.errors.join(', ')}`);
    }

    logger.info('Starting astrology calculation', { 
      birthDate, 
      birthTime, 
      birthPlace,
      coordinates: coords,
      validationWarnings: birthDataValidation.warnings,
    });

    const iso = this.toISO(birthDate, birthTime);
    const baseParams = {
      datetime: iso,
      latitude: coords.lat,
      longitude: coords.lon,
      ayanamsa: 1,
    };

    // Provider calls
    const birth = await this.tryFetch<any>(
      `${this.config.baseUrl}/astrology/birth-chart`,
      baseParams,
      missing,
      "birth-chart"
    );
    const panch = await this.tryFetch<any>(
      `${this.config.baseUrl}/astrology/panchang`,
      baseParams,
      missing,
      "panchang"
    );
    const dM = await this.tryFetch<any>(
      `${this.config.baseUrl}/astrology/vimshottari-dasha`,
      baseParams,
      missing,
      "vim-maha"
    );
    const dA = await this.tryFetch<any>(
      `${this.config.baseUrl}/astrology/vimshottari-dasha/antar`,
      baseParams,
      missing,
      "vim-antar"
    );
    const dP = await this.tryFetch<any>(
      `${this.config.baseUrl}/astrology/vimshottari-dasha/pratyantar`,
      baseParams,
      missing,
      "vim-praty"
    );
    const yoginiRaw = await this.tryFetch<any>(
      `${this.config.baseUrl}/astrology/yogini-dasha`,
      baseParams,
      missing,
      "yogini"
    );
    const shadbalaRaw = await this.tryFetch<any>(
      `${this.config.baseUrl}/astrology/shadbala`,
      baseParams,
      missing,
      "shadbala"
    );

    // ---- normalize D1 planets (whole-sign houses) ----
    let planetPositions: PlanetPosition[] = [];
    let ascRasiId: number | undefined;
    let ascSign: string | undefined;

    if (birth?.ascendant != null && birth?.planets) {
      ascRasiId = Math.floor((birth.ascendant as number) / 30) + 1; // 1..12
      ascSign = this.zodiac[ascRasiId - 1];

      planetPositions = (birth.planets as any[]).map((pl: any) => {
        const lon = Number(pl.longitude ?? pl.lng ?? pl.long ?? 0);
        const name = pl.name ?? pl.planet ?? "";
        const rasiId = this.rasiFromLong(lon);
        const house = this.calcHouseFromSigns(ascRasiId!, rasiId);
        return {
          planet: name,
          sign: this.zodiac[rasiId - 1],
          house,
          rasiId,
          isRetrograde: !!(pl.is_retrograde ?? pl.isRetrograde),
        };
      });

      // Add pseudo Asc for detectors
      planetPositions.push({
        planet: "Asc",
        sign: ascSign,
        house: 1,
        rasiId: ascRasiId,
        isRetrograde: false,
      });

      planetPositions = this.sanitizePlanetPositions(planetPositions);
    } else {
      missing.push("planets/basic");
    }

    // ---- vimshottari ----
    const mapLevel = (x: any): VimshottariLevel | null =>
      x ? { planet: x.name || x.planet, start: x.start, end: x.end } : null;

    const vdash: VimshottariDasha = {
      current: mapLevel(dM?.current ?? null) ?? undefined,
      timelineMaha: Array.isArray(dM?.periods)
        ? (dM.periods.map(mapLevel).filter(Boolean) as VimshottariLevel[])
        : undefined,
      timelineAntar: Array.isArray(dA?.periods)
        ? (dA.periods.map(mapLevel).filter(Boolean) as VimshottariLevel[])
        : undefined,
    };

    // ---- yogini ----
    let yogini: YoginiDasha | null = null;
    if (yoginiRaw) {
      yogini = {
        current: mapLevel(yoginiRaw.current ?? null) ?? undefined,
        timeline: Array.isArray(yoginiRaw.periods)
          ? (yoginiRaw.periods.map(mapLevel).filter(Boolean) as VimshottariLevel[])
          : undefined,
      };
    }

    // ---- shadbala ----
    let shadbala: ShadbalaItem[] | null = null;
    if (shadbalaRaw?.planets) {
      shadbala = (shadbalaRaw.planets as any[]).map((p: any) => ({
        planet: p.name,
        value: Number(p.total_rupa ?? p.total ?? 0),
        unit: p.unit ?? "Rupa",
        components: {
          sthana: Number(p.sthana_bala ?? 0),
          dig: Number(p.dig_bala ?? 0),
          kala: Number(p.kala_bala ?? 0),
          chestha: Number(p.chestha_bala ?? 0),
          naisargika: Number(p.naisargika_bala ?? 0),
          drik: Number(p.drik_bala ?? 0),
        },
      }));
    }

    // ---- derived dignities / aspects (from sanitized D1 only) ----
    const dignities: DignityItem[] | undefined = planetPositions.length
      ? this.buildDignities(planetPositions)
      : undefined;
    const aspects: AspectItem[] | undefined = planetPositions.length
      ? this.buildAspects(planetPositions)
      : undefined;

    // ---- divisionals (optional) ----
    const divisionals: DivisionalChart[] = [];
    for (const code of ["D2", "D7", "D9", "D10"] as const) {
      const d = await this.fetchDivisional(baseParams, missing, code);
      if (d) divisionals.push(d);
    }

    // ---- yogas/doshas (purely D1) ----
    const yogas = planetPositions.length
      ? detectYogas(planetPositions, dignities || [], aspects || [], vdash)
      : undefined;
    const doshas = planetPositions.length ? detectDoshas(planetPositions, vdash) : undefined;

    // Validate the calculated chart
    const chartValidation = astrologyValidationService.validateChart(
      planetPositions,
      dignities || [],
      aspects || [],
      ascSign
    );

    // Log validation results
    const validationSummary = astrologyValidationService.getValidationSummary(chartValidation);
    logger.info('Chart validation completed', {
      birthDate,
      birthTime,
      birthPlace,
      validationStatus: validationSummary.status,
      validationMessage: validationSummary.message,
      validationDetails: validationSummary.details,
    });

    // ---- return strictly as AstrologyData ----
    const result: AstrologyData = {
      zodiacSign: ascSign || "-",
      planetPositions,
      dignities,
      aspects,
      yogas,
      doshas,
      vimshottari: vdash,
      divisionals: divisionals.length ? divisionals : null,
      yogini: yogini ?? null,
      shadbala: shadbala ?? null,
    };

    // Cache the result for 24 hours
    await cacheService.set(cacheKey, result, { ttl: 86400 });

    const duration = Date.now() - startTime;
    logger.info('Astrology calculation completed', {
      birthDate,
      birthTime,
      birthPlace,
      duration,
      missing: missing.length > 0 ? missing : undefined,
      validationStatus: validationSummary.status,
    });

    return result;
  }
}

const prokeralaService = new ProkeralaService();
export default prokeralaService;
