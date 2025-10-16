# Astrology Logic Documentation

## Overview

This document explains the astrology calculation logic used in the ZSTRO AI platform, including planetary positions, house calculations, yoga detection, and dosha analysis.

## Core Calculations

### 1. Planetary Positions

The system calculates planetary positions using the Prokerala API and internal validation:

```typescript
// Example: Calculate house position from degrees
export function calculateHouseFromDegrees(ascDeg: number, planetDeg: number): number {
  const asc = normalizeDeg(ascDeg);
  const pl = normalizeDeg(planetDeg);
  let diff = pl - asc;
  if (diff < 0) diff += 360;
  const houseNum = Math.floor(diff / 30) + 1;
  return houseNum > 12 ? houseNum - 12 : houseNum;
}
```

### 2. House System

The platform supports both North Indian and South Indian chart styles:

- **North Indian**: Square layout with ascendant at top
- **South Indian**: Diamond layout with ascendant at left

### 3. Navamsa (D9) Calculation

Navamsa is calculated using the traditional Vedic method:

```typescript
export function calculateNavamsha(longitude: number): { sign: string; pada: number; signId: number } {
  const deg = normalizeDeg(longitude);
  const rasiIndex = Math.floor(deg / 30);
  const degInRasi = deg - rasiIndex * 30;
  const NAV_DEG = 10 / 3; // 3°20′ = 3.333...
  const navamsaIndex = Math.floor(degInRasi / NAV_DEG);
  
  // Calculate navamsa sign based on rasi type
  // Movable (चर): 1,4,7,10 → same sign
  // Fixed (स्थिर): 2,5,8,11 → 9th from sign
  // Dual (द्विस्वभाव): 3,6,9,12 → 5th from sign
}
```

## Yoga Detection

### 1. Gaja-Kesari Yoga
Jupiter and Moon in kendra relation (1st, 4th, 7th, 10th houses):

```typescript
if (P["Jupiter"] && P["Moon"]) {
  const jH = P["Jupiter"].house;
  const mH = P["Moon"].house;
  const diff = ((Math.abs(jH - mH) % 12) || 12);
  const kendraRelation = [1, 3, 7, 9, 11].includes(diff) && (isKendra(jH) || isKendra(mH));
}
```

### 2. Panch Mahapurusha Yogas
Five great yogas when planets are in kendra and own/exalted signs:

- **Shasha Yoga**: Saturn in kendra, own/exalted
- **Ruchaka Yoga**: Mars in kendra, own/exalted
- **Bhadra Yoga**: Mercury in kendra, own/exalted
- **Hamsa Yoga**: Jupiter in kendra, own/exalted
- **Malavya Yoga**: Venus in kendra, own/exalted

### 3. Raja Yoga
Kendra-Trikona linkage with at least one planet in each:

```typescript
const hasKT = list.some((a) =>
  isKendra(a.house) && list.some((b) => isTrikon(b.house) && b !== a)
);
```

## Dosha Detection

### 1. Grahan Dosha
Sun or Moon with Rahu/Ketu:

```typescript
const sunG = !!P["Sun"] && 
  ((P["Rahu"] && P["Sun"].house === P["Rahu"].house) ||
   (P["Ketu"] && P["Sun"].house === P["Ketu"].house));
```

### 2. Mangal Dosha (Kuja Dosha)
Mars in sensitive houses (1, 2, 4, 7, 8, 12) from Lagna or Moon:

```typescript
const kujaH = new Set([1, 2, 4, 7, 8, 12]);
const kujaFromLagna = !!P["Mars"] && kujaH.has(P["Mars"].house);
```

### 3. Kaal-Sarpa Dosha
All seven classical planets between Rahu and Ketu:

```typescript
const inside = seven.every((p) => p.house > a && p.house < b);
const outside = seven.every((p) => p.house < a || p.house > b);
if (inside || outside) {
  // Kaal-Sarpa Dosha detected
}
```

## Dasha Systems

### 1. Vimshottari Dasha
120-year cycle with planetary periods:

- Sun: 6 years
- Moon: 10 years
- Mars: 7 years
- Rahu: 18 years
- Jupiter: 16 years
- Saturn: 19 years
- Mercury: 17 years
- Ketu: 7 years
- Venus: 20 years

### 2. Yogini Dasha
8-year cycle with 8 yoginis:

- Sankata: 1 year
- Pingala: 2 years
- Dhanya: 3 years
- Bhramari: 4 years
- Bhadrika: 5 years
- Ulka: 6 years
- Siddha: 7 years
- Sankata: 8 years

## Validation System

### 1. Input Validation
- Birth date: Must be valid and not in future
- Birth time: Must be in HH:MM format
- Birth place: Must be at least 2 characters

### 2. Chart Validation
- All classical planets present
- Valid house numbers (1-12)
- Consistent sign information
- Proper dignity calculations

### 3. Data Integrity
- No duplicate planets
- Valid aspect calculations
- Consistent house positions
- Proper retrograde flags

## API Integration

### Prokerala API
The system integrates with Prokerala API for:

- Birth chart calculations
- Planetary positions
- Divisional charts (D2, D7, D9, D10)
- Dasha calculations
- Shadbala analysis

### Caching Strategy
- Astrology calculations cached for 24 hours
- Geocoding results cached for 24 hours
- User sessions cached for 1 hour
- API responses cached based on parameters

## Error Handling

### 1. API Failures
- Graceful degradation when Prokerala API fails
- Fallback to basic calculations
- Clear error messages to users

### 2. Data Validation
- Input validation before processing
- Chart validation after calculations
- Error logging and monitoring

### 3. User Experience
- Loading states during calculations
- Progress indicators for long operations
- Clear error messages and suggestions

## Performance Optimization

### 1. Caching
- Redis for expensive calculations
- In-memory caching for frequent data
- CDN for static assets

### 2. Database Optimization
- Indexed queries
- Connection pooling
- Query optimization

### 3. API Optimization
- Rate limiting
- Request batching
- Response compression

## Testing

### 1. Unit Tests
- Individual function testing
- Edge case validation
- Error condition testing

### 2. Integration Tests
- API integration testing
- Database integration testing
- End-to-end workflow testing

### 3. Performance Tests
- Load testing
- Stress testing
- Memory usage testing

## Future Enhancements

### 1. Advanced Calculations
- More divisional charts
- Advanced yoga combinations
- Transit calculations
- Muhurta calculations

### 2. Machine Learning
- Personalized insights
- Pattern recognition
- Predictive analytics
- Recommendation engine

### 3. Visualization
- Interactive charts
- 3D visualizations
- Animation effects
- Custom chart styles
