// lib/ai/astro-worker-prompt.ts
// Advanced Vedic astrology computation agent for ZSTRO AI

export const ASTRO_WORKER_SYSTEM_PROMPT = `You are an advanced Vedic astrology computation agent for ZSTRO AI.
Your main responsibility: derive each planet's exact house number (भाव) from the ascendant (लग्न) and zodiac sign (राशी), using deterministic math only.

Rules:

1️⃣ **Sign Number Map (1–12)**
   Aries=1, Taurus=2, Gemini=3, Cancer=4, Leo=5, Virgo=6, Libra=7, Scorpio=8, Sagittarius=9, Capricorn=10, Aquarius=11, Pisces=12.

2️⃣ **Formula for House Calculation:**
   house_num = ((planet_sign_num - ascendant_sign_num + 12) % 12) + 1  
   → This is the ONLY valid way to compute a planet's house.  
   → Example: Taurus lagna (2) and Saturn in Aquarius (11) ⇒ ((11-2+12)%12)+1 = 10 ⇒ 10th house ✅  

3️⃣ **Output Verification Rule:**
   Always print both rashi and computed house:
   "Saturn — Aquarius (11) → 10th house (Career/Authority)."

4️⃣ **Never trust verbal assumptions** like "Saturn is in 12th house" unless the numeric formula confirms it.  
   If your text and computed number disagree → correct the text automatically and show a note:
   "Auto-corrected by house formula."

5️⃣ **Lordship Rule:**
   Compute each planet's sign lordship and derive house ownership relative to lagna:
   Sun=Leo(5), Moon=Cancer(4), Mars=Aries(1),Scorpio(8), Mercury=Gemini(3),Virgo(6),
   Jupiter=Sagittarius(9),Pisces(12), Venus=Taurus(2),Libra(7), Saturn=Capricorn(10),Aquarius(11).

   For example:
   Taurus lagna → Jupiter owns Sagittarius(9→8th house) and Pisces(12→11th house).

6️⃣ **Prompt Behavior:**
   - Always show numeric derivation clearly.
   - When responding to the user, if they ask "Which house is Saturn in?" or "Mars position?", recompute using the formula.
   - If lagna or sign names are given in Nepali, map them to correct numbers before calculation.

7️⃣ **Cross-check message:**
   Before sending any astro output, re-validate all house positions via formula and assert no mismatch:
   Example test:
   if asc=2 and planet_sign=11 → must yield 10 (not 12).

8️⃣ **If mismatch detected:** 
   Fix it silently and show a short note: "(corrected via house formula)".

9️⃣ **Output format (English or Nepali depending on user language):**
   Example:
   "शनि — कुम्भ राशी (११), लग्न वृष (२) अनुसार १० औं भाव (कर्म / प्रतिष्ठा स्थान) मा छ।  
    यसले तपाईको पेशागत जिम्मेवारी र स्थायित्वमा गहिरो प्रभाव पार्छ।"

10️⃣ **Self-Test (debug)**
   Maintain a small built-in test table:
   Taurus→Aquarius=10
   Taurus→Capricorn=9
   Aries→Aries=1
   Pisces→Taurus=3
   If any test fails, flag "House Calculation Error".

Goal: ensure 100% mathematically correct Bhava computation before astrological interpretation.`;

// Helper functions for house calculation
export const SIGN_TO_NUM: Record<string, number> = {
  'Aries': 1, 'मेष': 1,
  'Taurus': 2, 'वृष': 2, 'वृषभ': 2,
  'Gemini': 3, 'मिथुन': 3,
  'Cancer': 4, 'कर्क': 4, 'कर्कट': 4,
  'Leo': 5, 'सिंह': 5,
  'Virgo': 6, 'कन्या': 6,
  'Libra': 7, 'तुला': 7,
  'Scorpio': 8, 'वृश्चिक': 8,
  'Sagittarius': 9, 'धनु': 9,
  'Capricorn': 10, 'मकर': 10,
  'Aquarius': 11, 'कुम्भ': 11,
  'Pisces': 12, 'मीन': 12
};

export const NUM_TO_SIGN: Record<number, string> = {
  1: 'Aries', 2: 'Taurus', 3: 'Gemini', 4: 'Cancer',
  5: 'Leo', 6: 'Virgo', 7: 'Libra', 8: 'Scorpio',
  9: 'Sagittarius', 10: 'Capricorn', 11: 'Aquarius', 12: 'Pisces'
};

export const NUM_TO_SIGN_NEPALI: Record<number, string> = {
  1: 'मेष', 2: 'वृष', 3: 'मिथुन', 4: 'कर्क',
  5: 'सिंह', 6: 'कन्या', 7: 'तुला', 8: 'वृश्चिक',
  9: 'धनु', 10: 'मकर', 11: 'कुम्भ', 12: 'मीन'
};

export const HOUSE_MEANINGS: Record<number, { en: string; ne: string }> = {
  1: { en: 'Self/Personality', ne: 'स्वभाव/व्यक्तित्व' },
  2: { en: 'Wealth/Family', ne: 'धन/परिवार' },
  3: { en: 'Communication/Siblings', ne: 'संचार/भाइबहिनी' },
  4: { en: 'Home/Mother', ne: 'घर/आमा' },
  5: { en: 'Children/Creativity', ne: 'सन्तान/रचनात्मकता' },
  6: { en: 'Health/Service', ne: 'स्वास्थ्य/सेवा' },
  7: { en: 'Marriage/Partnership', ne: 'विवाह/साझेदारी' },
  8: { en: 'Transformation/Secrets', ne: 'परिवर्तन/गोपनीयता' },
  9: { en: 'Philosophy/Father', ne: 'दर्शन/बुबा' },
  10: { en: 'Career/Authority', ne: 'कर्म/प्रतिष्ठा' },
  11: { en: 'Gains/Friends', ne: 'लाभ/मित्र' },
  12: { en: 'Spirituality/Losses', ne: 'आध्यात्मिकता/हानि' }
};

export const PLANET_LORDSHIP: Record<string, number[]> = {
  'Sun': [5], // Leo
  'Moon': [4], // Cancer
  'Mars': [1, 8], // Aries, Scorpio
  'Mercury': [3, 6], // Gemini, Virgo
  'Jupiter': [9, 12], // Sagittarius, Pisces
  'Venus': [2, 7], // Taurus, Libra
  'Saturn': [10, 11], // Capricorn, Aquarius
  'Rahu': [], // No lordship
  'Ketu': [] // No lordship
};

/**
 * Calculate house number from planet sign and ascendant sign
 * @param planetSignNum - Planet's zodiac sign number (1-12)
 * @param ascendantSignNum - Ascendant's zodiac sign number (1-12)
 * @returns House number (1-12)
 */
export function calculateHouse(planetSignNum: number, ascendantSignNum: number): number {
  return ((planetSignNum - ascendantSignNum + 12) % 12) + 1;
}

/**
 * Get sign number from sign name (supports English and Nepali)
 * @param signName - Sign name in English or Nepali
 * @returns Sign number (1-12) or 0 if not found
 */
export function getSignNumber(signName: string): number {
  const normalizedName = signName.trim();
  return SIGN_TO_NUM[normalizedName] || 0;
}

/**
 * Get sign name from sign number
 * @param signNum - Sign number (1-12)
 * @param language - 'en' or 'ne' for language
 * @returns Sign name
 */
export function getSignName(signNum: number, language: 'en' | 'ne' = 'en'): string {
  if (language === 'ne') {
    return NUM_TO_SIGN_NEPALI[signNum] || 'Unknown';
  }
  return NUM_TO_SIGN[signNum] || 'Unknown';
}

/**
 * Get house meaning
 * @param houseNum - House number (1-12)
 * @param language - 'en' or 'ne' for language
 * @returns House meaning
 */
export function getHouseMeaning(houseNum: number, language: 'en' | 'ne' = 'en'): string {
  const meaning = HOUSE_MEANINGS[houseNum];
  if (!meaning) return 'Unknown';
  return language === 'ne' ? meaning.ne : meaning.en;
}

/**
 * Calculate planet's lordship houses relative to ascendant
 * @param planet - Planet name
 * @param ascendantSignNum - Ascendant's zodiac sign number (1-12)
 * @returns Array of house numbers that the planet owns
 */
export function getPlanetLordshipHouses(planet: string, ascendantSignNum: number): number[] {
  const ownedSigns = PLANET_LORDSHIP[planet] || [];
  return ownedSigns.map(signNum => calculateHouse(signNum, ascendantSignNum));
}

/**
 * Validate house calculation with test cases
 * @returns Array of test results
 */
export function validateHouseCalculation(): Array<{ test: string; expected: number; actual: number; passed: boolean }> {
  const tests = [
    { asc: 2, planet: 11, expected: 10, desc: 'Taurus→Aquarius' },
    { asc: 2, planet: 10, expected: 9, desc: 'Taurus→Capricorn' },
    { asc: 1, planet: 1, expected: 1, desc: 'Aries→Aries' },
    { asc: 12, planet: 2, expected: 3, desc: 'Pisces→Taurus' }
  ];

  return tests.map(test => {
    const actual = calculateHouse(test.planet, test.asc);
    return {
      test: test.desc,
      expected: test.expected,
      actual,
      passed: actual === test.expected
    };
  });
}

/**
 * Format planet position with house calculation and lordship verification
 * @param planet - Planet name
 * @param planetSign - Planet's zodiac sign
 * @param ascendantSign - Ascendant's zodiac sign
 * @param language - 'en' or 'ne' for language
 * @param showLordship - Whether to show lordship houses
 * @returns Formatted string with house calculation and lordship
 */
export function formatPlanetPosition(
  planet: string,
  planetSign: string,
  ascendantSign: string,
  language: 'en' | 'ne' = 'en',
  showLordship: boolean = true
): string {
  const planetSignNum = getSignNumber(planetSign);
  const ascendantSignNum = getSignNumber(ascendantSign);
  
  if (planetSignNum === 0 || ascendantSignNum === 0) {
    return `${planet} — Invalid sign data`;
  }

  const houseNum = calculateHouse(planetSignNum, ascendantSignNum);
  const houseMeaning = getHouseMeaning(houseNum, language);
  
  let result = '';
  
  if (language === 'ne') {
    result = `${planet} — ${planetSign} (${planetSignNum}), लग्न ${ascendantSign} (${ascendantSignNum}) अनुसार ${houseNum} औं भाव (${houseMeaning}) मा छ।`;
  } else {
    result = `${planet} — ${planetSign} (${planetSignNum}) → ${houseNum}th house (${houseMeaning}).`;
  }

  // Add lordship houses if requested
  if (showLordship) {
    const lordshipHouses = getPlanetLordshipHouses(planet, ascendantSignNum);
    if (lordshipHouses.length > 0) {
      const lordshipMeanings = lordshipHouses.map(house => getHouseMeaning(house, language));
      
      if (language === 'ne') {
        result += ` यसले ${lordshipHouses.join(', ')} औं भावहरूको स्वामित्व गर्छ (${lordshipMeanings.join(', ')})।`;
      } else {
        result += ` It owns houses ${lordshipHouses.join(', ')} (${lordshipMeanings.join(', ')}).`;
      }
    }
  }

  return result;
}

/**
 * Enhanced planet position formatter with auto-verification
 * @param planet - Planet name
 * @param planetSign - Planet's zodiac sign
 * @param ascendantSign - Ascendant's zodiac sign
 * @param language - 'en' or 'ne' for language
 * @param expectedHouse - Expected house number for verification
 * @returns Formatted string with verification
 */
export function formatPlanetPositionWithVerification(
  planet: string,
  planetSign: string,
  ascendantSign: string,
  language: 'en' | 'ne' = 'en',
  expectedHouse?: number
): string {
  const planetSignNum = getSignNumber(planetSign);
  const ascendantSignNum = getSignNumber(ascendantSign);
  
  if (planetSignNum === 0 || ascendantSignNum === 0) {
    return `${planet} — Invalid sign data`;
  }

  const calculatedHouse = calculateHouse(planetSignNum, ascendantSignNum);
  const houseMeaning = getHouseMeaning(calculatedHouse, language);
  
  // Auto-verification
  let verificationNote = '';
  if (expectedHouse && calculatedHouse !== expectedHouse) {
    verificationNote = language === 'ne' 
      ? ` (सूत्र अनुसार सच्याइएको: ${expectedHouse} → ${calculatedHouse})`
      : ` (corrected via house formula: ${expectedHouse} → ${calculatedHouse})`;
  }
  
  let result = '';
  
  if (language === 'ne') {
    result = `${planet} — ${planetSign} (${planetSignNum}), लग्न ${ascendantSign} (${ascendantSignNum}) अनुसार ${calculatedHouse} औं भाव (${houseMeaning}) मा छ।${verificationNote}`;
  } else {
    result = `${planet} — ${planetSign} (${planetSignNum}) → ${calculatedHouse}th house (${houseMeaning}).${verificationNote}`;
  }

  // Add lordship houses
  const lordshipHouses = getPlanetLordshipHouses(planet, ascendantSignNum);
  if (lordshipHouses.length > 0) {
    const lordshipMeanings = lordshipHouses.map(house => getHouseMeaning(house, language));
    
    if (language === 'ne') {
      result += ` यसले ${lordshipHouses.join(', ')} औं भावहरूको स्वामित्व गर्छ (${lordshipMeanings.join(', ')})।`;
    } else {
      result += ` It owns houses ${lordshipHouses.join(', ')} (${lordshipMeanings.join(', ')}).`;
    }
  }

  return result;
}

/**
 * Self-test function to verify house calculations
 * @returns Test results
 */
export function runSelfTest(): { passed: boolean; results: Array<{ test: string; passed: boolean }> } {
  const testResults = validateHouseCalculation();
  const allPassed = testResults.every(result => result.passed);
  
  return {
    passed: allPassed,
    results: testResults.map(result => ({
      test: result.test,
      passed: result.passed
    }))
  };
}
