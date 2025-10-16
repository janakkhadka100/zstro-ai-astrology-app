// lib/prokerala/client.ts
// ------------------------------------------------------------------
// Prokerala API wrapper (fetches charts, dashas, aspects, dignities)
// ------------------------------------------------------------------

import axios from 'axios';

const PROKERALA_API_KEY = process.env.PROKERALA_API_KEY || 'your-prokerala-api-key';

export async function fetchProkeralaData(params: {
  date: string;
  time: string;
  lat: number;
  lon: number;
  tz?: string;
  includeDivisional?: boolean;
  includeDashas?: boolean;
  includeAspects?: boolean;
}) {
  try {
    // Example endpoint – update with your actual API endpoint
    const url = 'https://api.prokerala.com/v2/astrology/birth-chart';

    const { data } = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${PROKERALA_API_KEY}`,
      },
      params: {
        datetime: `${params.date}T${params.time}`,
        latitude: params.lat,
        longitude: params.lon,
        timezone: params.tz || '+05:45',
        charts: params.includeDivisional ? 'D1,D9,D10,D7,D2' : 'D1',
        dashas: params.includeDashas ? 'vimshottari' : undefined,
        aspects: params.includeAspects ? true : undefined,
      },
    });

    return data;
  } catch (err) {
    console.error('Prokerala API error:', err);
    return null;
  }
}
