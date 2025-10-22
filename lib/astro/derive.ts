// lib/astro/derive.ts
// Single source of truth for astrological calculations

export const SIGN_TO_NUM: Record<string, number> = {
  // English
  'Aries': 1, 'Taurus': 2, 'Gemini': 3, 'Cancer': 4,
  'Leo': 5, 'Virgo': 6, 'Libra': 7, 'Scorpio': 8,
  'Sagittarius': 9, 'Capricorn': 10, 'Aquarius': 11, 'Pisces': 12,
  // Nepali
  'मेष': 1, 'वृष': 2, 'मिथुन': 3, 'कर्क': 4,
  'सिंह': 5, 'कन्या': 6, 'तुला': 7, 'वृश्चिक': 8,
  'धनु': 9, 'मकर': 10, 'कुम्भ': 11, 'मीन': 12,
  // Alternative spellings
  'वृषभ': 2, 'कर्कट': 4, 'वृश्चिक': 8
};

export const NUM_TO_SIGN: Record<number, { en: string; ne: string }> = {
  1: { en: 'Aries', ne: 'मेष' },
  2: { en: 'Taurus', ne: 'वृष' },
  3: { en: 'Gemini', ne: 'मिथुन' },
  4: { en: 'Cancer', ne: 'कर्क' },
  5: { en: 'Leo', ne: 'सिंह' },
  6: { en: 'Virgo', ne: 'कन्या' },
  7: { en: 'Libra', ne: 'तुला' },
  8: { en: 'Scorpio', ne: 'वृश्चिक' },
  9: { en: 'Sagittarius', ne: 'धनु' },
  10: { en: 'Capricorn', ne: 'मकर' },
  11: { en: 'Aquarius', ne: 'कुम्भ' },
  12: { en: 'Pisces', ne: 'मीन' }
};

/**
 * Convert sign name (EN/NE) or number to sign number
 */
export function toSignNum(v: string | number): number {
  if (typeof v === 'number') {
    if (v >= 1 && v <= 12) return v;
    throw new Error(`Invalid sign number: ${v}`);
  }
  
  const normalized = v.trim();
  const num = SIGN_TO_NUM[normalized];
  if (!num) {
    throw new Error(`Unknown sign: ${v}`);
  }
  return num;
}

/**
 * Calculate house number from planet sign and ascendant sign
 * This is the canonical formula for Vedic astrology house calculation
 */
export function houseFrom(planetSignNum: number, ascSignNum: number): number {
  return ((planetSignNum - ascSignNum + 12) % 12) + 1;
}

/**
 * Get sign name in specified language
 */
export function getSignName(signNum: number, language: 'en' | 'ne' = 'en'): string {
  const sign = NUM_TO_SIGN[signNum];
  if (!sign) throw new Error(`Invalid sign number: ${signNum}`);
  return language === 'ne' ? sign.ne : sign.en;
}

// Self-test at module init
(function validateHouseMath() {
  // Test cases: Taurus(2), Aquarius(11) => 10
  if (houseFrom(11, 2) !== 10) {
    throw new Error("House math broken: Taurus(2), Aquarius(11) should be house 10");
  }
  
  // Test cases: Aries(1), Aries(1) => 1
  if (houseFrom(1, 1) !== 1) {
    throw new Error("House math broken: Aries(1), Aries(1) should be house 1");
  }
  
  // Test cases: Pisces(12), Taurus(2) => 3
  if (houseFrom(2, 12) !== 3) {
    throw new Error("House math broken: Pisces(12), Taurus(2) should be house 3");
  }
  
  console.log("✅ [ZSTRO] House calculation math validated");
})();

export type KundaliData = {
  ascendant: { name: string; num: number; degree?: number };
  moon: { sign: string; num: number; degree?: number; house?: number };
  planets: Array<{ 
    planet: string; 
    sign: string; 
    num: number; 
    degree?: number; 
    house: number;
    _note?: string;
  }>;
  currentDasha?: {
    system: "Vimshottari" | "Yogini";
    maha: string; 
    antara?: string; 
    pratyantara?: string; 
    sookshma?: string; 
    prana?: string;
    start?: string; 
    end?: string;
  };
};
