// lib/services/geocoding.ts
// Geocoding service for converting place names to coordinates

import axios from 'axios';

export interface GeocodingResult {
  lat: number;
  lon: number;
  displayName: string;
  timezone?: string;
  country?: string;
  state?: string;
  city?: string;
}

export interface GeocodingOptions {
  countryCode?: string; // e.g., 'NP' for Nepal
  limit?: number;
  language?: string;
}

class GeocodingService {
  private cache = new Map<string, GeocodingResult>();
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Geocode a place name to coordinates using OpenStreetMap Nominatim
   */
  async geocode(
    place: string, 
    options: GeocodingOptions = {}
  ): Promise<GeocodingResult | null> {
    const cacheKey = `${place}-${options.countryCode || 'all'}`;
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && this.isCacheValid(cacheKey)) {
      return cached;
    }

    try {
      const params = new URLSearchParams({
        q: place,
        format: 'json',
        limit: (options.limit || 5).toString(),
        addressdetails: '1',
        extratags: '1',
        ...(options.countryCode && { countrycodes: options.countryCode }),
        ...(options.language && { 'accept-language': options.language }),
      });

      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?${params}`,
        {
          headers: {
            'User-Agent': 'ZSTRO-AI-Astrology/1.0',
          },
          timeout: 10000,
        }
      );

      if (response.data && response.data.length > 0) {
        const result = this.parseNominatimResult(response.data[0]);
        this.cache.set(cacheKey, result);
        return result;
      }

      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }

  /**
   * Reverse geocode coordinates to place name
   */
  async reverseGeocode(
    lat: number, 
    lon: number, 
    options: GeocodingOptions = {}
  ): Promise<GeocodingResult | null> {
    const cacheKey = `reverse-${lat}-${lon}`;
    
    const cached = this.cache.get(cacheKey);
    if (cached && this.isCacheValid(cacheKey)) {
      return cached;
    }

    try {
      const params = new URLSearchParams({
        lat: lat.toString(),
        lon: lon.toString(),
        format: 'json',
        addressdetails: '1',
        extratags: '1',
        ...(options.language && { 'accept-language': options.language }),
      });

      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?${params}`,
        {
          headers: {
            'User-Agent': 'ZSTRO-AI-Astrology/1.0',
          },
          timeout: 10000,
        }
      );

      if (response.data) {
        const result = this.parseNominatimResult(response.data);
        this.cache.set(cacheKey, result);
        return result;
      }

      return null;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  }

  /**
   * Get timezone for coordinates using timezone API
   */
  async getTimezone(lat: number, lon: number): Promise<string | null> {
    try {
      const response = await axios.get(
        `https://api.timezonedb.com/v2.1/get-time-zone?key=${process.env.TIMEZONE_API_KEY}&format=json&by=position&lat=${lat}&lng=${lon}`,
        { timeout: 5000 }
      );

      return response.data?.zoneName || null;
    } catch (error) {
      console.error('Timezone lookup error:', error);
      // Fallback to Nepal timezone for coordinates in Nepal
      if (this.isInNepal(lat, lon)) {
        return 'Asia/Kathmandu';
      }
      return null;
    }
  }

  /**
   * Parse Nominatim API response
   */
  private parseNominatimResult(data: any): GeocodingResult {
    return {
      lat: parseFloat(data.lat),
      lon: parseFloat(data.lon),
      displayName: data.display_name,
      timezone: data.extratags?.timezone || null,
      country: data.address?.country,
      state: data.address?.state,
      city: data.address?.city || data.address?.town || data.address?.village,
    };
  }

  /**
   * Check if coordinates are within Nepal
   */
  private isInNepal(lat: number, lon: number): boolean {
    // Nepal's approximate bounding box
    return (
      lat >= 26.347 && lat <= 30.422 &&
      lon >= 80.088 && lon <= 88.201
    );
  }

  /**
   * Check if cache entry is still valid
   */
  private isCacheValid(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    // For simplicity, we'll use a basic TTL check
    // In production, you might want to store timestamps
    return true; // Simplified for now
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

export const geocodingService = new GeocodingService();
export default geocodingService;
