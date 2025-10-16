// lib/astro/house.ts
export function calculateHouse(ascRasiId: number, planetRasiId: number): number {
  // Whole-sign: 1..12
  return ((planetRasiId - ascRasiId + 12) % 12) + 1;
}

export function rasiFromLongitude(longitude: number): number {
  return Math.floor(longitude / 30) + 1; // 1..12
}
