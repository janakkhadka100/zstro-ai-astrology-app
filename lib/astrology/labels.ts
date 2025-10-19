import { SignId, Language } from './schemas';

// Sign labels in English
const SIGN_LABELS_EN = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

// Sign labels in Nepali (Devanagari)
const SIGN_LABELS_NE = [
  "मेष", "वृष", "मिथुन", "कर्क", "सिंह", "कन्या",
  "तुला", "वृश्चिक", "धनु", "मकर", "कुम्भ", "मीन"
];

/**
 * Get sign label based on language
 */
export function getSignLabel(signId: SignId, lang: Language = "ne"): string {
  const labels = lang === "ne" ? SIGN_LABELS_NE : SIGN_LABELS_EN;
  return labels[signId - 1] || `Sign ${signId}`;
}

/**
 * Fill missing ascSignLabel
 */
export function fillAscSignLabel(ascSignId: SignId, lang: Language): string {
  return getSignLabel(ascSignId, lang);
}

/**
 * Fill missing planet sign labels
 */
export function fillPlanetSignLabels<T extends { signId: SignId; signLabel?: string }>(
  planets: T[],
  lang: Language
): Array<T & { signLabel: string }> {
  return planets.map(planet => ({
    ...planet,
    signLabel: planet.signLabel || getSignLabel(planet.signId, lang)
  }));
}

/**
 * Test cases for label generation
 */
export const LABEL_TESTS = {
  // Test English labels
  englishLabels: () => {
    const ariesLabel = getSignLabel(1, "en");
    const piscesLabel = getSignLabel(12, "en");
    return ariesLabel === "Aries" && piscesLabel === "Pisces";
  },

  // Test Nepali labels
  nepaliLabels: () => {
    const ariesLabel = getSignLabel(1, "ne");
    const piscesLabel = getSignLabel(12, "ne");
    return ariesLabel === "मेष" && piscesLabel === "मीन";
  },

  // Test filling missing labels
  fillMissingLabels: () => {
    const planets = [
      { signId: 1 as SignId, signLabel: "Aries" },
      { signId: 2 as SignId },
      { signId: 3 as SignId, signLabel: undefined }
    ];
    
    const filled = fillPlanetSignLabels(planets, "en");
    
    return filled[0].signLabel === "Aries" &&
           filled[1].signLabel === "Taurus" &&
           filled[2].signLabel === "Gemini";
  }
};
