// lib/astro/nakshatra.ts
// Calculate Nakshatra & Pada from 0–360° sidereal longitude

const NAKS = [
  "Ashwini","Bharani","Krittika","Rohini","Mrigashira","Ardra","Punarvasu","Pushya","Ashlesha",
  "Magha","Purva Phalguni","Uttara Phalguni","Hasta","Chitra","Swati","Vishakha","Anuradha","Jyeshtha",
  "Mula","Purvashada","Uttarashada","Shravana","Dhanishta","Shatabhisha","Purva Bhadrapada","Uttara Bhadrapada","Revati"
];

export function nakshatraPada(longitude: number) {
  const part = 360 / 27;               // 13°20'
  const idx = Math.floor(longitude / part);      // 0..26
  const within = longitude - idx * part;         // 0..13°20'
  const pada = Math.floor(within / (part / 4)) + 1; // 1..4
  return { name: NAKS[idx], pada };
}
