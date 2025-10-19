# Deterministic Astrology Pipeline

A robust, type-safe pipeline for processing Vedic astrology data that guarantees correct houses, Shadbala normalization, and complete Vimshottari sub-levels.

## Features

- **Deterministic House Calculation**: Always computes correct houses from ascendant, never sign == house
- **Shadbala Normalization**: Validates, rounds, and clamps Shadbala data
- **Complete Dasha Trees**: Ensures full Vimshottari (MAHA→ANTAR→PRATYANTAR→SUKSHMA→PRANA) and Yogini levels
- **API Quirk Protection**: Handles invalid API data gracefully
- **Mismatch Tracking**: Records when API data differs from derived calculations
- **Type Safety**: Full TypeScript support with Zod validation
- **JSON Serializable**: All output is JSON-safe for AI and UI consumption

## Quick Start

```typescript
import { buildAstroOutput, getPlanetRows, getVimshottariLevels } from '@/lib/astrology/pipeline';

const input: AstroInput = {
  ascSignId: 2, // Taurus
  d1: [
    {
      planet: "Sun",
      signId: 9, // Sagittarius
      degree: 245.5,
      house: 7, // API says 7, derived would be 8
      shadbala: { total: 150.25, sthana: 45.5, dig: 30.2, kala: 25.8, chestha: 20.1, naisargika: 28.65 }
    }
  ],
  vimshottari: [/* dasha data */],
  lang: "en"
};

const output = buildAstroOutput(input);

// Use helper functions for display
const planetRows = getPlanetRows(output);
const vimshottariLevels = getVimshottariLevels(output);
```

## Core Components

### 1. House Derivation (`house-derivation.ts`)

```typescript
// Formula: ((signId - ascSignId + 12) % 12) + 1
const house = computeHouseFromAsc(9, 2); // Sagittarius with Taurus asc = House 8

// Process planets and track mismatches
const { processedPlanets, mismatches } = processPlanetHouses(planets, ascSignId);
```

### 2. Shadbala Normalization (`shadbala-normalization.ts`)

```typescript
// Normalize and validate Shadbala data
const normalized = normalizeShadbala({
  total: 150.256789,
  sthana: 45.123456,
  dig: 30.987654,
  // ... other components
}, "Sun");

// Result: all values rounded to 2 decimals, negatives clamped to 0
```

### 3. Dasha Tree Processing (`dasha-trees.ts`)

```typescript
// Process and validate dasha trees
const vimshottariTree = processVimshottariTree(rawVimshottari, fixes);
const yoginiTree = processYoginiTree(rawYogini, fixes);

// Features:
// - ISO timestamp validation
// - Monotonic nesting enforcement
// - Child trimming to parent bounds
// - Chronological sorting
```

### 4. Label Generation (`labels.ts`)

```typescript
// Generate localized labels
const signLabel = getSignLabel(1, "ne"); // "मेष" for Aries in Nepali
const signLabel = getSignLabel(1, "en"); // "Aries" for Aries in English
```

## Input Schema

```typescript
interface AstroInput {
  ascSignId: 1..12;
  ascSignLabel?: string;
  d1: Planet[];
  shadbala?: Record<PlanetName, Shadbala>;
  vimshottari?: DashaBlock[];
  yogini?: YoginiDasha[];
  lang?: "ne" | "en";
}

interface Planet {
  planet: "Sun" | "Moon" | "Mars" | "Mercury" | "Jupiter" | "Venus" | "Saturn" | "Rahu" | "Ketu";
  signId: 1..12;
  signLabel?: string;
  degree?: number | null;
  house?: number | null;
  shadbala?: Shadbala | null;
}
```

## Output Schema

```typescript
interface AstroOutput {
  ascSignId: 1..12;
  ascSignLabel: string;
  planets: PlanetOutput[];
  shadbalaTable: ShadbalaTableRow[];
  vimshottariTree: DashaBlock[];
  yoginiTree: YoginiDasha[];
  mismatches: Mismatch[];
  dashaFixes: string[];
  lang: "ne" | "en";
}

interface PlanetOutput {
  planet: PlanetName;
  signId: SignId;
  signLabel: string;
  degree: number | null;
  house: number | null;
  safeHouse: House; // Always use this for house-based analysis
  shadbala: Shadbala | null;
}
```

## Helper Functions

### getPlanetRows(output)
Returns simplified planet data for display:
```typescript
[
  {
    planet: "Sun",
    signLabel: "Sagittarius", 
    house: 8, // safeHouse
    degree: 245.5,
    shadbalaTotal: 150.25
  }
]
```

### getVimshottariLevels(output)
Returns dasha levels grouped by depth for accordion rendering:
```typescript
[
  {
    level: "MAHA",
    blocks: [/* MAHA level blocks */]
  },
  {
    level: "ANTAR", 
    blocks: [/* ANTAR level blocks */]
  }
]
```

### getYoginiLevels(output)
Similar to Vimshottari but for Yogini dasha system.

## Error Handling

The pipeline **never throws errors**. Instead, it collects issues in:

- **mismatches**: When API house differs from derived house
- **dashaFixes**: When dasha data is corrected (trimmed, sorted, etc.)

```typescript
// Example output with issues
{
  mismatches: [
    { planet: "Sun", apiHouse: 7, derivedHouse: 8 }
  ],
  dashaFixes: [
    "Trimmed children of Sun to fit parent bounds"
  ]
}
```

## Testing

Run the comprehensive test suite:

```bash
npm run test tests/astrology/pipeline.spec.ts
```

Tests cover:
- House derivation accuracy
- Shadbala normalization
- Dasha tree processing
- Label generation
- Full pipeline integration
- Error handling

## Example Usage

See `examples/pipeline-demo.ts` for a complete working example.

## Key Guarantees

1. **Correct Houses**: `safeHouse` is always mathematically correct
2. **Valid Shadbala**: All values are non-negative and properly rounded
3. **Complete Dasha Trees**: Full depth structure for Vimshottari and Yogini
4. **API Protection**: Handles invalid/missing API data gracefully
5. **JSON Safety**: All output is JSON-serializable
6. **Type Safety**: Full TypeScript support with runtime validation
7. **No Exceptions**: Pipeline never throws, always returns valid output
