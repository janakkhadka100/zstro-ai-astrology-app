# ZSTRO AI Vedic Astrology House Calculation System

## 🎯 Overview

This is an advanced Vedic astrology computation agent for ZSTRO AI that derives each planet's exact house number (भाव) from the ascendant (लग्न) and zodiac sign (राशी) using deterministic math only.

## ✨ Key Features

- **Deterministic House Calculation**: Uses the formula `house_num = ((planet_sign_num - ascendant_sign_num + 12) % 12) + 1`
- **Auto-Verification**: Automatically corrects mismatches and shows verification notes
- **Lordship Calculation**: Computes planet lordship houses relative to ascendant
- **Cross-Language Support**: English and Nepali language support
- **Self-Test Validation**: Built-in test cases to ensure accuracy
- **Error Handling**: Comprehensive error handling for edge cases

## 🚀 Quick Start

### Basic Usage

```typescript
import { 
  calculateHouse, 
  formatPlanetPosition, 
  formatPlanetPositionWithVerification 
} from './astro-worker-prompt';

// Basic house calculation
const house = calculateHouse(11, 2); // Aquarius (11) in Taurus (2) ascendant = 10th house

// Formatted output with lordship
const result = formatPlanetPosition('Saturn', 'Aquarius', 'Taurus', 'en', true);
// Output: "Saturn — Aquarius (11) → 10th house (Career/Authority). It owns houses 9, 10 (Philosophy/Father, Career/Authority)."

// With verification
const verified = formatPlanetPositionWithVerification('Saturn', 'Aquarius', 'Taurus', 'en', 10);
// Output: "Saturn — Aquarius (11) → 10th house (Career/Authority). It owns houses 9, 10 (Philosophy/Father, Career/Authority)."
```

### Nepali Language Support

```typescript
const result = formatPlanetPosition('शनि', 'कुम्भ', 'वृष', 'ne', true);
// Output: "शनि — कुम्भ (११), लग्न वृष (२) अनुसार १० औं भाव (कर्म / प्रतिष्ठा स्थान) मा छ। यसले ९, १० औं भावहरूको स्वामित्व गर्छ (दर्शन / बुबा, कर्म / प्रतिष्ठा स्थान)।"
```

## 📊 House Calculation Formula

The system uses a deterministic formula to calculate house positions:

```
house_num = ((planet_sign_num - ascendant_sign_num + 12) % 12) + 1
```

### Example Calculations

| Planet Sign | Ascendant | Calculation | Result | House Meaning |
|-------------|-----------|-------------|---------|---------------|
| Aquarius (11) | Taurus (2) | ((11-2+12)%12)+1 | 10 | Career/Authority |
| Sagittarius (9) | Taurus (2) | ((9-2+12)%12)+1 | 8 | Transformation/Secrets |
| Leo (5) | Taurus (2) | ((5-2+12)%12)+1 | 4 | Home/Mother |

## 🧪 Testing

### Quick Test

```bash
cd lib/ai
npx tsx astro-worker-runner.ts --quick
```

### Full Demo

```bash
cd lib/ai
npx tsx astro-worker-runner.ts --full
```

### Self-Test Validation

```typescript
import { runSelfTest } from './astro-worker-prompt';

const result = runSelfTest();
console.log(result.passed ? 'All tests passed!' : 'Some tests failed!');
```

## 📋 API Reference

### Core Functions

#### `calculateHouse(planetSignNum: number, ascendantSignNum: number): number`
Calculates house number from planet sign and ascendant sign numbers.

#### `getSignNumber(signName: string): number`
Gets sign number from sign name (supports English and Nepali).

#### `getSignName(signNum: number, language: 'en' | 'ne'): string`
Gets sign name from sign number.

#### `getHouseMeaning(houseNum: number, language: 'en' | 'ne'): string`
Gets house meaning in specified language.

#### `getPlanetLordshipHouses(planet: string, ascendantSignNum: number): number[]`
Gets houses owned by a planet relative to ascendant.

### Formatter Functions

#### `formatPlanetPosition(planet, planetSign, ascendantSign, language, showLordship)`
Formats planet position with house calculation and optional lordship.

#### `formatPlanetPositionWithVerification(planet, planetSign, ascendantSign, language, expectedHouse)`
Formats planet position with auto-verification and correction.

## 🌐 Language Support

### English
- Sign names: Aries, Taurus, Gemini, Cancer, Leo, Virgo, Libra, Scorpio, Sagittarius, Capricorn, Aquarius, Pisces
- House meanings: Self/Personality, Wealth/Family, Communication/Siblings, etc.

### Nepali
- Sign names: मेष, वृष, मिथुन, कर्क, सिंह, कन्या, तुला, वृश्चिक, धनु, मकर, कुम्भ, मीन
- House meanings: स्वभाव/व्यक्तित्व, धन/परिवार, संचार/भाइबहिनी, etc.

## 🔧 Configuration

### Sign Number Mapping
```typescript
const SIGN_TO_NUM = {
  'Aries': 1, 'मेष': 1,
  'Taurus': 2, 'वृष': 2,
  // ... etc
};
```

### Planet Lordship
```typescript
const PLANET_LORDSHIP = {
  'Sun': [5], // Leo
  'Moon': [4], // Cancer
  'Mars': [1, 8], // Aries, Scorpio
  'Mercury': [3, 6], // Gemini, Virgo
  'Jupiter': [9, 12], // Sagittarius, Pisces
  'Venus': [2, 7], // Taurus, Libra
  'Saturn': [10, 11], // Capricorn, Aquarius
};
```

## 🎯 Use Cases

### 1. Birth Chart Analysis
```typescript
const birthChart = {
  ascendant: 'Taurus',
  planets: [
    { name: 'Sun', sign: 'Leo' },
    { name: 'Moon', sign: 'Capricorn' },
    { name: 'Mars', sign: 'Aries' },
    // ... etc
  ]
};

birthChart.planets.forEach(planet => {
  const result = formatPlanetPosition(planet.name, planet.sign, birthChart.ascendant, 'en', true);
  console.log(result);
});
```

### 2. Lordship Analysis
```typescript
const ascendant = 'Taurus';
const ascendantNum = getSignNumber(ascendant);

Object.keys(PLANET_LORDSHIP).forEach(planet => {
  const lordshipHouses = getPlanetLordshipHouses(planet, ascendantNum);
  if (lordshipHouses.length > 0) {
    console.log(`${planet} owns houses ${lordshipHouses.join(', ')}`);
  }
});
```

### 3. Cross-Language Verification
```typescript
const planet = 'Saturn';
const sign = 'Aquarius';
const signNe = 'कुम्भ';
const ascendant = 'Taurus';
const ascendantNe = 'वृष';

const enResult = formatPlanetPosition(planet, sign, ascendant, 'en', true);
const neResult = formatPlanetPosition(planet, signNe, ascendantNe, 'ne', true);

console.log('English:', enResult);
console.log('Nepali:', neResult);
```

## 🚨 Error Handling

The system includes comprehensive error handling:

- **Invalid Sign Names**: Returns 0 for unknown signs
- **Missing Data**: Shows appropriate error messages
- **Calculation Errors**: Auto-corrects and shows verification notes
- **Type Safety**: Full TypeScript support with proper type checking

## 🔍 Validation

### Self-Test Cases
The system includes built-in test cases:
- Taurus→Aquarius=10
- Taurus→Capricorn=9
- Aries→Aries=1
- Pisces→Taurus=3

### Auto-Verification
Before sending any output, the system re-validates all house positions and corrects any mismatches automatically.

## 📚 Examples

See the `astro-worker-demo.ts` file for comprehensive examples including:
- Complete birth chart analysis
- House calculation verification
- Cross-language verification
- Lordship calculation
- Error handling
- Self-test validation

## 🎉 Conclusion

This system ensures 100% mathematically correct Bhava computation before astrological interpretation, making it a reliable tool for Vedic astrology calculations in the ZSTRO AI platform.
