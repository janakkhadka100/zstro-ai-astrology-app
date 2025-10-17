// lib/source/account.ts
// AccountCard to AstroData mapper - no network calls

import { AccountCard, AstroData, D1PlanetRow, YogaItem, DoshaItem, ShadbalaRow, DashaItem } from '@/lib/astrology/types';
import { wholeSignHouse, getSignLabel } from '@/lib/astrology/util';

export function mapAccountToAstroData(account: AccountCard, lang: "ne" | "en" = "ne"): AstroData {
  const provenance: string[] = [];
  
  // Map profile data
  const profile = {
    name: account.profile.name,
    birthDate: account.profile.birthDate,
    birthTime: account.profile.birthTime,
    tz: account.profile.timezone,
    lat: account.profile.latitude,
    lon: account.profile.longitude,
  };

  // Calculate ascendant sign from birth data (simplified)
  const ascSignId = calculateAscendantSign(account.profile);
  const ascSignLabel = getSignLabel(ascSignId, lang);
  
  if (ascSignId) {
    provenance.push("ascendant");
  }

  // Map D1 planets with house calculation
  const d1: D1PlanetRow[] = [];
  if (account.cachedData?.d1) {
    d1.push(...account.cachedData.d1.map(planet => ({
      ...planet,
      house: planet.house || (ascSignId ? wholeSignHouse(ascSignId, planet.signId) : 1)
    })));
    provenance.push("d1");
  }

  // Map yogas and doshas
  const yogas: YogaItem[] = account.cachedData?.yogas || [];
  const doshas: DoshaItem[] = account.cachedData?.doshas || [];
  
  if (yogas.length > 0) {
    provenance.push("yogas");
  }
  if (doshas.length > 0) {
    provenance.push("doshas");
  }

  // Map shadbala
  const shadbala: ShadbalaRow[] = account.cachedData?.shadbala || [];
  if (shadbala.length > 0) {
    provenance.push("shadbala");
  }

  // Map dashas
  const dashas: DashaItem[] = [];
  if (account.cachedData?.dashas?.vimshottari?.current) {
    dashas.push(account.cachedData.dashas.vimshottari.current);
    provenance.push("dashas.vimshottari.current");
  }
  if (account.cachedData?.dashas?.vimshottari?.maha) {
    dashas.push(...account.cachedData.dashas.vimshottari.maha);
    provenance.push("dashas.vimshottari.maha");
  }
  if (account.cachedData?.dashas?.yogini?.current) {
    dashas.push(account.cachedData.dashas.yogini.current);
    provenance.push("dashas.yogini.current");
  }

  return {
    profile,
    ascSignId: ascSignId || 1,
    ascSignLabel,
    d1,
    divisionals: [], // Will be fetched on-demand
    yogas,
    doshas,
    shadbala,
    dashas,
    lang,
    provenance: {
      account: provenance,
      prokerala: []
    }
  };
}

function calculateAscendantSign(profile: AccountCard['profile']): number {
  // Simplified ascendant calculation
  // In a real implementation, this would use proper astrological calculations
  // For now, return a mock value based on birth date
  
  if (!profile.birthDate) return 1;
  
  try {
    const date = new Date(profile.birthDate);
    const month = date.getMonth() + 1; // 1-12
    
    // Simple mapping: month to sign
    const signMap: { [key: number]: number } = {
      1: 10,  // January -> Capricorn
      2: 11,  // February -> Aquarius
      3: 12,  // March -> Pisces
      4: 1,   // April -> Aries
      5: 2,   // May -> Taurus
      6: 3,   // June -> Gemini
      7: 4,   // July -> Cancer
      8: 5,   // August -> Leo
      9: 6,   // September -> Virgo
      10: 7,  // October -> Libra
      11: 8,  // November -> Scorpio
      12: 9,  // December -> Sagittarius
    };
    
    return signMap[month] || 1;
  } catch (error) {
    console.error('Error calculating ascendant sign:', error);
    return 1; // Default to Aries
  }
}

export function getAccountCard(userId: string): AccountCard | null {
  // Mock implementation - in real app, this would query your database
  // This simulates what would be stored in your user account system
  
  const mockAccount: AccountCard = {
    userId,
    profile: {
      name: "Test User",
      birthDate: "1990-05-15",
      birthTime: "14:30",
      timezone: "Asia/Kathmandu",
      latitude: 27.7172,
      longitude: 85.3240,
    },
    cachedData: {
      d1: [
        { planet: "Sun", signId: 2, signLabel: "Taurus", house: 2, retro: false },
        { planet: "Moon", signId: 4, signLabel: "Cancer", house: 4, retro: false },
        { planet: "Mars", signId: 1, signLabel: "Aries", house: 1, retro: false },
        { planet: "Mercury", signId: 2, signLabel: "Taurus", house: 2, retro: false },
        { planet: "Jupiter", signId: 9, signLabel: "Sagittarius", house: 9, retro: false },
        { planet: "Venus", signId: 3, signLabel: "Gemini", house: 3, retro: false },
        { planet: "Saturn", signId: 10, signLabel: "Capricorn", house: 10, retro: false },
        { planet: "Rahu", signId: 6, signLabel: "Virgo", house: 6, retro: false },
        { planet: "Ketu", signId: 12, signLabel: "Pisces", house: 12, retro: false },
      ],
      yogas: [
        { key: "gajakesari", label: "Gajakesari Yoga" },
        { key: "rajyoga", label: "Raj Yoga" },
      ],
      doshas: [
        { key: "mangala", label: "Mangal Dosha" },
      ],
      shadbala: [
        { planet: "Sun", value: 1.2, unit: "rupa" },
        { planet: "Moon", value: 0.9, unit: "rupa" },
        { planet: "Mars", value: 1.5, unit: "rupa" },
      ],
      dashas: {
        vimshottari: {
          current: {
            system: "Vimshottari",
            level: "current",
            planet: "Jupiter",
            from: "2023-01-01T00:00:00.000Z",
            to: "2039-01-01T00:00:00.000Z"
          },
          maha: [
            {
              system: "Vimshottari",
              level: "maha",
              planet: "Jupiter",
              from: "2023-01-01T00:00:00.000Z",
              to: "2039-01-01T00:00:00.000Z"
            }
          ]
        },
        yogini: {
          current: {
            system: "Yogini",
            level: "current",
            planet: "Sun",
            from: "2024-01-01T00:00:00.000Z",
            to: "2025-01-01T00:00:00.000Z"
          }
        }
      }
    },
    lastUpdated: new Date().toISOString()
  };
  
  return mockAccount;
}

export function validateAccountCard(account: AccountCard): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!account.userId) {
    errors.push("User ID is required");
  }
  
  if (!account.profile.birthDate) {
    errors.push("Birth date is required");
  }
  
  if (!account.profile.birthTime) {
    errors.push("Birth time is required");
  }
  
  if (!account.profile.timezone) {
    errors.push("Timezone is required");
  }
  
  if (account.profile.latitude === undefined || account.profile.longitude === undefined) {
    errors.push("Birth coordinates are required");
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
