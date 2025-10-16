// __tests__/integration/astrology.test.ts
// Integration tests for astrology API endpoints

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { NextRequest } from 'next/server';
import { POST as astrologyPOST } from '@/app/api/astrology/route';
import { enhancedCache } from '@/lib/services/enhanced-cache';
import { astrologyValidationService } from '@/lib/services/astro/validate';

// Mock external dependencies
jest.mock('@/lib/prokerala/service');
jest.mock('@/lib/services/logger');
jest.mock('@/lib/services/enhanced-cache');

describe('Astrology API Integration Tests', () => {
  beforeAll(async () => {
    // Setup test environment
    process.env.NODE_ENV = 'test';
    process.env.OPENAI_API_KEY = 'test-key';
    process.env.PROKERALA_API_KEY = 'test-key';
    process.env.PROKERALA_API_SECRET = 'test-secret';
  });

  afterAll(async () => {
    // Cleanup
    await enhancedCache.close();
  });

  beforeEach(() => {
    // Clear cache before each test
    enhancedCache.clearAll();
  });

  describe('POST /api/astrology', () => {
    it('should return 400 for missing required fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/astrology', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await astrologyPOST(request);
      expect(response.status).toBe(400);
    });

    it('should return 400 for invalid date format', async () => {
      const request = new NextRequest('http://localhost:3000/api/astrology', {
        method: 'POST',
        body: JSON.stringify({
          birthDate: 'invalid-date',
          birthTime: '14:30',
          birthPlace: 'Kathmandu, Nepal',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await astrologyPOST(request);
      expect(response.status).toBe(400);
    });

    it('should return 400 for invalid time format', async () => {
      const request = new NextRequest('http://localhost:3000/api/astrology', {
        method: 'POST',
        body: JSON.stringify({
          birthDate: '1990-01-15',
          birthTime: 'invalid-time',
          birthPlace: 'Kathmandu, Nepal',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await astrologyPOST(request);
      expect(response.status).toBe(400);
    });

    it('should return 400 for missing birth place', async () => {
      const request = new NextRequest('http://localhost:3000/api/astrology', {
        method: 'POST',
        body: JSON.stringify({
          birthDate: '1990-01-15',
          birthTime: '14:30',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await astrologyPOST(request);
      expect(response.status).toBe(400);
    });

    it('should return 400 for invalid coordinates', async () => {
      const request = new NextRequest('http://localhost:3000/api/astrology', {
        method: 'POST',
        body: JSON.stringify({
          birthDate: '1990-01-15',
          birthTime: '14:30',
          lat: 91, // Invalid latitude
          lon: 0,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await astrologyPOST(request);
      expect(response.status).toBe(400);
    });

    it('should accept valid request with birth place', async () => {
      const request = new NextRequest('http://localhost:3000/api/astrology', {
        method: 'POST',
        body: JSON.stringify({
          birthDate: '1990-01-15',
          birthTime: '14:30',
          birthPlace: 'Kathmandu, Nepal',
          question: 'What does my chart say about my career?',
          language: 'en',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Mock the prokerala service response
      const mockAstrologyData = {
        zodiacSign: 'Capricorn',
        planetPositions: [
          { planet: 'Sun', sign: 'Capricorn', house: 1, rasiId: 10, isRetrograde: false },
          { planet: 'Moon', sign: 'Cancer', house: 7, rasiId: 4, isRetrograde: false },
        ],
        dignities: [
          { planet: 'Sun', status: 'Own' },
          { planet: 'Moon', status: 'Own' },
        ],
        aspects: [],
        yogas: [],
        doshas: [],
        vimshottari: null,
      };

      // Mock the service
      const mockProkeralaService = require('@/lib/prokerala/service');
      mockProkeralaService.default = {
        getAstrologyData: jest.fn().mockResolvedValue(mockAstrologyData),
      };

      const response = await astrologyPOST(request);
      expect(response.status).toBe(200);
    });

    it('should accept valid request with coordinates', async () => {
      const request = new NextRequest('http://localhost:3000/api/astrology', {
        method: 'POST',
        body: JSON.stringify({
          birthDate: '1990-01-15',
          birthTime: '14:30',
          lat: 27.7103,
          lon: 85.3222,
          question: 'What does my chart say about my career?',
          language: 'ne',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Mock the prokerala service response
      const mockAstrologyData = {
        zodiacSign: 'Capricorn',
        planetPositions: [
          { planet: 'Sun', sign: 'Capricorn', house: 1, rasiId: 10, isRetrograde: false },
          { planet: 'Moon', sign: 'Cancer', house: 7, rasiId: 4, isRetrograde: false },
        ],
        dignities: [
          { planet: 'Sun', status: 'Own' },
          { planet: 'Moon', status: 'Own' },
        ],
        aspects: [],
        yogas: [],
        doshas: [],
        vimshottari: null,
      };

      // Mock the service
      const mockProkeralaService = require('@/lib/prokerala/service');
      mockProkeralaService.default = {
        getAstrologyData: jest.fn().mockResolvedValue(mockAstrologyData),
      };

      const response = await astrologyPOST(request);
      expect(response.status).toBe(200);
    });

    it('should handle rate limiting', async () => {
      // This test would require mocking the rate limiter
      // For now, we'll just test that the endpoint exists
      const request = new NextRequest('http://localhost:3000/api/astrology', {
        method: 'POST',
        body: JSON.stringify({
          birthDate: '1990-01-15',
          birthTime: '14:30',
          birthPlace: 'Kathmandu, Nepal',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await astrologyPOST(request);
      // Should not return 429 for first request
      expect(response.status).not.toBe(429);
    });

    it('should validate astrology data before processing', async () => {
      const request = new NextRequest('http://localhost:3000/api/astrology', {
        method: 'POST',
        body: JSON.stringify({
          birthDate: '1990-01-15',
          birthTime: '14:30',
          birthPlace: 'Kathmandu, Nepal',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Mock validation service
      const mockValidationService = require('@/lib/services/astro/validate');
      mockValidationService.astrologyValidationService = {
        validateBirthData: jest.fn().mockReturnValue({
          valid: true,
          errors: [],
          warnings: [],
          score: 95,
        }),
        validateChart: jest.fn().mockReturnValue({
          valid: true,
          errors: [],
          warnings: [],
          score: 90,
        }),
      };

      const response = await astrologyPOST(request);
      expect(response.status).toBe(200);
    });

    it('should cache astrology data for repeated requests', async () => {
      const request = new NextRequest('http://localhost:3000/api/astrology', {
        method: 'POST',
        body: JSON.stringify({
          birthDate: '1990-01-15',
          birthTime: '14:30',
          birthPlace: 'Kathmandu, Nepal',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Mock the service
      const mockProkeralaService = require('@/lib/prokerala/service');
      mockProkeralaService.default = {
        getAstrologyData: jest.fn().mockResolvedValue({
          zodiacSign: 'Capricorn',
          planetPositions: [],
          dignities: [],
          aspects: [],
          yogas: [],
          doshas: [],
          vimshottari: null,
        }),
      };

      // First request
      const response1 = await astrologyPOST(request);
      expect(response1.status).toBe(200);

      // Second request should use cache
      const response2 = await astrologyPOST(request);
      expect(response2.status).toBe(200);

      // Service should only be called once due to caching
      expect(mockProkeralaService.default.getAstrologyData).toHaveBeenCalledTimes(1);
    });

    it('should handle errors gracefully', async () => {
      const request = new NextRequest('http://localhost:3000/api/astrology', {
        method: 'POST',
        body: JSON.stringify({
          birthDate: '1990-01-15',
          birthTime: '14:30',
          birthPlace: 'Kathmandu, Nepal',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Mock service to throw error
      const mockProkeralaService = require('@/lib/prokerala/service');
      mockProkeralaService.default = {
        getAstrologyData: jest.fn().mockRejectedValue(new Error('Service unavailable')),
      };

      const response = await astrologyPOST(request);
      expect(response.status).toBe(500);
    });
  });

  describe('Astrology Data Validation', () => {
    it('should validate birth data correctly', () => {
      const result = astrologyValidationService.validateBirthData(
        '1990-01-15',
        '14:30',
        'Kathmandu, Nepal',
        { lat: 27.7103, lon: 85.3222 }
      );

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.score).toBeGreaterThan(0);
    });

    it('should reject invalid birth data', () => {
      const result = astrologyValidationService.validateBirthData(
        'invalid-date',
        'invalid-time',
        '',
        { lat: 91, lon: 181 }
      );

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should validate chart data correctly', () => {
      const planetPositions = [
        { planet: 'Sun', sign: 'Capricorn', house: 1, rasiId: 10, isRetrograde: false },
        { planet: 'Moon', sign: 'Cancer', house: 7, rasiId: 4, isRetrograde: false },
      ];

      const dignities = [
        { planet: 'Sun', status: 'Own' },
        { planet: 'Moon', status: 'Own' },
      ];

      const aspects = [];

      const context = {
        birthDate: '1990-01-15',
        birthTime: '14:30',
        birthPlace: 'Kathmandu, Nepal',
        coordinates: { lat: 27.7103, lon: 85.3222 },
        timezone: 'Asia/Kathmandu',
      };

      const result = astrologyValidationService.validateChart(
        planetPositions,
        dignities,
        aspects,
        null,
        context
      );

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});
