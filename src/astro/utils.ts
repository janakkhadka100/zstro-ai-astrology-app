// src/astro/utils.ts
// House math helpers and astrological calculations

export const normalizePlanetName = (planet: string): string => {
  const mapping: Record<string, string> = {
    'Surya': 'Sun',
    'Chandra': 'Moon', 
    'Mangal': 'Mars',
    'Budh': 'Mercury',
    'Guru': 'Jupiter',
    'Shukra': 'Venus',
    'Shani': 'Saturn',
    'Rahu': 'Rahu',
    'Ketu': 'Ketu'
  };
  return mapping[planet] || planet;
};

export const normalizeSignName = (sign: string): string => {
  const mapping: Record<string, string> = {
    'Mesha': 'Aries',
    'Vrishabha': 'Taurus',
    'Mithuna': 'Gemini', 
    'Karka': 'Cancer',
    'Simha': 'Leo',
    'Kanya': 'Virgo',
    'Tula': 'Libra',
    'Vrishchika': 'Scorpio',
    'Dhanu': 'Sagittarius',
    'Makara': 'Capricorn',
    'Kumbha': 'Aquarius',
    'Meena': 'Pisces'
  };
  return mapping[sign] || sign;
};

// Calculate house number from longitude (0-360 degrees)
export const calculateHouseFromLongitude = (longitude: number, lagnaLongitude: number): number => {
  const adjustedLongitude = (longitude - lagnaLongitude + 360) % 360;
  return Math.floor(adjustedLongitude / 30) + 1;
};

// Check if a house is Kendra (angular)
export const isKendra = (house: number): boolean => {
  return [1, 4, 7, 10].includes(house);
};

// Check if a house is Trikona (trine)
export const isTrikona = (house: number): boolean => {
  return [1, 5, 9].includes(house);
};

// Check if a house is Dusthana (malefic)
export const isDusthana = (house: number): boolean => {
  return [6, 8, 12].includes(house);
};

// Check if a house is Upachaya (growth)
export const isUpachaya = (house: number): boolean => {
  return [3, 6, 10, 11].includes(house);
};

// Calculate planetary dignity
export const calculateDignity = (planet: string, sign: string): string => {
  const exaltedSigns: Record<string, string> = {
    'Sun': 'Aries',
    'Moon': 'Taurus',
    'Mars': 'Capricorn',
    'Mercury': 'Virgo',
    'Jupiter': 'Cancer',
    'Venus': 'Pisces',
    'Saturn': 'Libra'
  };
  
  const debilitatedSigns: Record<string, string> = {
    'Sun': 'Libra',
    'Moon': 'Scorpio',
    'Mars': 'Cancer',
    'Mercury': 'Pisces',
    'Jupiter': 'Capricorn',
    'Venus': 'Virgo',
    'Saturn': 'Aries'
  };
  
  const ownSigns: Record<string, string[]> = {
    'Sun': ['Leo'],
    'Moon': ['Cancer'],
    'Mars': ['Aries', 'Scorpio'],
    'Mercury': ['Gemini', 'Virgo'],
    'Jupiter': ['Sagittarius', 'Pisces'],
    'Venus': ['Taurus', 'Libra'],
    'Saturn': ['Capricorn', 'Aquarius']
  };
  
  if (exaltedSigns[planet] === sign) return 'Exalted';
  if (debilitatedSigns[planet] === sign) return 'Debilitated';
  if (ownSigns[planet]?.includes(sign)) return 'Own';
  
  return 'Neutral';
};

// Calculate Shadbala band
export const getShadbalaBand = (score: number): 'strong' | 'medium' | 'weak' => {
  if (score >= 1.2) return 'strong';
  if (score >= 0.9) return 'medium';
  return 'weak';
};
