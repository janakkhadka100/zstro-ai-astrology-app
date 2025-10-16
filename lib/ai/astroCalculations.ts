// lib/ai/astroCalculations.ts
// -----------------------------------------------------------
//  ज्योतिष क्याल्कुलेसन: राशी/डिग्रीबाट भाव, नवमांश आदि
//  – Whole-sign र Degree-based दुवै House गणना उपलब्ध
//  – Navamsa (D9) सही पद्धतिमा
// -----------------------------------------------------------

/** ०–३६० बीच normalize */
export function normalizeDeg(d: number): number {
  let x = d % 360;
  if (x < 0) x += 360;
  return x;
}

/** longitude (०–३६०) बाट राशी ID (१–१२) */
export function rasiIdFromLongitude(longitude: number): number {
  const deg = normalizeDeg(longitude);
  return Math.floor(deg / 30) + 1; // 1..12
}

/** ✅ डिग्री-आधारित House गणना (सबैभन्दा सही) */
export function calculateHouseFromDegrees(ascDeg: number, planetDeg: number): number {
  const asc = normalizeDeg(ascDeg);
  const pl = normalizeDeg(planetDeg);
  let diff = pl - asc;
  if (diff < 0) diff += 360;                 // wrap-around
  const houseNum = Math.floor(diff / 30) + 1; // प्रत्येक ३०° = १ House
  return houseNum > 12 ? houseNum - 12 : houseNum;
}

/** ✅ राशी-आधारित Whole-sign House (पुरानो formula) 
 *  ascRasiId = लग्नको राशी नम्बर (१–१२)
 *  planetRasiId = ग्रहको राशी नम्बर (१–१२)
 *  नोट: degree नहुँदा fallback लागि मात्र।
 */
export function calculateHouse(ascRasiId: number, planetRasiId: number): number {
  return ((planetRasiId - ascRasiId + 12) % 12) + 1;
}

/** ✅ ग्रहको House (डिग्री उपलब्ध भए डिग्री-आधारित, नभए राशी-आधारित) */
export function getHouse(
  ascLongitudeDeg: number | null | undefined,
  planetLongitudeDeg: number | null | undefined,
  ascRasiId: number,
  planetRasiId: number
): number {
  if (
    typeof ascLongitudeDeg === 'number' &&
    typeof planetLongitudeDeg === 'number'
  ) {
    return calculateHouseFromDegrees(ascLongitudeDeg, planetLongitudeDeg);
  }
  return calculateHouse(ascRasiId, planetRasiId);
}

/** ✅ नवमांश (Navamsa/D9) निकाल्ने (longitude बाट) */
export function calculateNavamsha(longitude: number): { sign: string; pada: number; signId: number } {
  const deg = normalizeDeg(longitude);
  const rasiIndex = Math.floor(deg / 30);       // 0..11
  const degInRasi = deg - rasiIndex * 30;       // 0..<30
  const NAV_DEG = 10 / 3;                       // 3°20′ = 3.333...
  const navamsaIndex = Math.floor(degInRasi / NAV_DEG); // 0..8
  const pada = navamsaIndex + 1;                // 1..9

  const base = rasiIndex + 1; // 1..12
  let startSign: number;

  // Movable (चर): 1,4,7,10 → same sign
  // Fixed (स्थिर): 2,5,8,11 → 9th from sign
  // Dual  (द्विस्वभाव): 3,6,9,12 → 5th from sign
  if ([1, 4, 7, 10].includes(base)) {
    startSign = base;
  } else if ([2, 5, 8, 11].includes(base)) {
    startSign = ((base + 8 - 1) % 12) + 1; // 9th
  } else {
    startSign = ((base + 4 - 1) % 12) + 1; // 5th
  }

  const navamsaSignId = ((startSign - 1 + navamsaIndex) % 12) + 1;

  const signNames = [
    'Mesha',     // 1
    'Vrishabha', // 2
    'Mithuna',   // 3
    'Karka',     // 4
    'Simha',     // 5
    'Kanya',     // 6
    'Tula',      // 7
    'Vrischika', // 8
    'Dhanu',     // 9
    'Makara',    // 10
    'Kumbha',    // 11
    'Meena',     // 12
  ];

  return { sign: signNames[navamsaSignId - 1], pada, signId: navamsaSignId };
}

/** Util: कन्द्र/त्रिकोण चेक */
export function isKendra(house: number) {
  return house === 1 || house === 4 || house === 7 || house === 10;
}
export function isTrikona(house: number) {
  return house === 1 || house === 5 || house === 9;
}

/** Helper: signId → नाम */
export function signName(signId: number): string {
  const names = [
    'Mesha','Vrishabha','Mithuna','Karka','Simha','Kanya',
    'Tula','Vrischika','Dhanu','Makara','Kumbha','Meena'
  ];
  return names[(((signId - 1) % 12) + 12) % 12];
}

/** Debug helper: चन्द्रमा गलत भाव देखिएको केस जाँच्ने */
export function debugHouseExample(ascDeg: number, moonDeg: number) {
  const degHouse = calculateHouseFromDegrees(ascDeg, moonDeg);
  const ascRasi = rasiIdFromLongitude(ascDeg);
  const moonRasi = rasiIdFromLongitude(moonDeg);
  const rasiHouse = calculateHouse(ascRasi, moonRasi);
  return {
    ascDeg,
    moonDeg,
    ascRasi,
    moonRasi,
    degHouse,  // डिग्री-आधारित नतिजा
    rasiHouse, // राशी-आधारित नतिजा
  };
}
