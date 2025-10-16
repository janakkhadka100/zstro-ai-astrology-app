// src/astro/lords.ts
// Sign to lord mapping for Vedic astrology

export const signLord: Record<string, string> = {
  Aries: "Mars",
  Taurus: "Venus", 
  Gemini: "Mercury",
  Cancer: "Moon",
  Leo: "Sun",
  Virgo: "Mercury",
  Libra: "Venus",
  Scorpio: "Mars",
  Sagittarius: "Jupiter",
  Capricorn: "Saturn",
  Aquarius: "Saturn",
  Pisces: "Jupiter"
};

export const lordSigns: Record<string, string[]> = {
  Sun: ["Leo"],
  Moon: ["Cancer"],
  Mars: ["Aries", "Scorpio"],
  Mercury: ["Gemini", "Virgo"],
  Jupiter: ["Sagittarius", "Pisces"],
  Venus: ["Taurus", "Libra"],
  Saturn: ["Capricorn", "Aquarius"]
};

// House ownership from lagna perspective
export const getHouseLords = (lagnaSign: string): Record<number, string> => {
  const lords: Record<number, string> = {};
  
  // Calculate which signs are in which houses from lagna
  const signs = Object.keys(signLord);
  const lagnaIndex = signs.indexOf(lagnaSign);
  
  for (let house = 1; house <= 12; house++) {
    const signIndex = (lagnaIndex + house - 1) % 12;
    const sign = signs[signIndex];
    lords[house] = signLord[sign];
  }
  
  return lords;
};

// Get houses owned by a planet from lagna
export const getHousesOwnedBy = (planet: string, lagnaSign: string): number[] => {
  const houseLords = getHouseLords(lagnaSign);
  const houses: number[] = [];
  
  for (const [house, lord] of Object.entries(houseLords)) {
    if (lord === planet) {
      houses.push(parseInt(house));
    }
  }
  
  return houses;
};
