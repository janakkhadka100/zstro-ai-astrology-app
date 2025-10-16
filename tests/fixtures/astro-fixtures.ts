// tests/fixtures/astro-fixtures.ts
// Test fixtures for astrological data

export const fixtureA_ShashaYoga = {
  ascendant: { sign: 'Aries', degree: 0, lord: 'Mars' },
  planets: [
    {
      planet: 'Saturn',
      sign: 'Capricorn',
      house: 10, // Kendra house
      degree: 15,
      isRetro: false
    },
    {
      planet: 'Sun',
      sign: 'Leo',
      house: 5,
      degree: 20,
      isRetro: false
    },
    {
      planet: 'Moon',
      sign: 'Cancer',
      house: 4,
      degree: 25,
      isRetro: false
    }
  ],
  shadbala: {
    'Saturn': 1.3,
    'Sun': 1.1,
    'Moon': 0.9
  },
  dashas: {
    vimshottari: [{
      maha: 'Saturn',
      antar: 'Mercury',
      pratyantar: 'Venus',
      start: '2020-01-01',
      end: '2025-01-01'
    }]
  }
};

export const fixtureB_VipareetaRajyoga = {
  ascendant: { sign: 'Aries', degree: 0, lord: 'Mars' },
  planets: [
    {
      planet: 'Jupiter', // 12th lord from Aries
      sign: 'Pisces',
      house: 6, // Dusthana house
      degree: 15,
      isRetro: false
    },
    {
      planet: 'Saturn', // 8th lord from Aries
      sign: 'Capricorn',
      house: 12, // Dusthana house
      degree: 20,
      isRetro: false
    },
    {
      planet: 'Mars', // 6th lord from Aries
      sign: 'Aries',
      house: 8, // Dusthana house
      degree: 25,
      isRetro: false
    }
  ],
  shadbala: {
    'Jupiter': 0.8,
    'Saturn': 1.1,
    'Mars': 1.2
  },
  dashas: {
    vimshottari: [{
      maha: 'Jupiter',
      antar: 'Saturn',
      pratyantar: 'Mercury',
      start: '2020-01-01',
      end: '2025-01-01'
    }]
  }
};

export const fixtureC_NegativeControls = {
  ascendant: { sign: 'Aries', degree: 0, lord: 'Mars' },
  planets: [
    {
      planet: 'Moon', // Should NOT trigger Shasha Yoga
      sign: 'Cancer',
      house: 4, // Kendra house
      degree: 15,
      isRetro: false
    },
    {
      planet: 'Venus', // 2nd lord - not dusthana
      sign: 'Taurus',
      house: 6, // Dusthana house but not dusthana lord
      degree: 20,
      isRetro: false
    },
    {
      planet: 'Saturn', // Dusthana lord but not in dusthana
      sign: 'Capricorn',
      house: 2, // Not dusthana house
      degree: 25,
      isRetro: false
    }
  ],
  shadbala: {
    'Moon': 1.0,
    'Venus': 0.9,
    'Saturn': 1.1
  },
  dashas: {
    vimshottari: [{
      maha: 'Moon',
      antar: 'Mars',
      pratyantar: 'Rahu',
      start: '2020-01-01',
      end: '2025-01-01'
    }]
  }
};

export const fixtureD_CompleteChart = {
  ascendant: { sign: 'Leo', degree: 15, lord: 'Sun' },
  planets: [
    {
      planet: 'Sun',
      sign: 'Leo',
      house: 1,
      degree: 15,
      isRetro: false
    },
    {
      planet: 'Moon',
      sign: 'Cancer',
      house: 12,
      degree: 20,
      isRetro: false
    },
    {
      planet: 'Mars',
      sign: 'Aries',
      house: 9,
      degree: 25,
      isRetro: false
    },
    {
      planet: 'Mercury',
      sign: 'Virgo',
      house: 2,
      degree: 30,
      isRetro: false
    },
    {
      planet: 'Jupiter',
      sign: 'Sagittarius',
      house: 5,
      degree: 35,
      isRetro: false
    },
    {
      planet: 'Venus',
      sign: 'Libra',
      house: 3,
      degree: 40,
      isRetro: false
    },
    {
      planet: 'Saturn',
      sign: 'Capricorn',
      house: 6,
      degree: 45,
      isRetro: false
    },
    {
      planet: 'Rahu',
      sign: 'Gemini',
      house: 10,
      degree: 50,
      isRetro: true
    },
    {
      planet: 'Ketu',
      sign: 'Sagittarius',
      house: 4,
      degree: 50,
      isRetro: true
    }
  ],
  shadbala: {
    'Sun': 1.4,
    'Moon': 0.8,
    'Mars': 1.2,
    'Mercury': 1.1,
    'Jupiter': 1.3,
    'Venus': 1.0,
    'Saturn': 0.9,
    'Rahu': 0.7,
    'Ketu': 0.7
  },
  dashas: {
    vimshottari: [{
      maha: 'Sun',
      antar: 'Moon',
      pratyantar: 'Mars',
      sookshma: 'Mercury',
      start: '2020-01-01',
      end: '2025-01-01'
    }],
    yogini: [{
      period: 'Mangala',
      start: '2020-01-01',
      end: '2021-01-01'
    }]
  }
};
