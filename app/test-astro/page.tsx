'use client';

import React, { useState, useEffect } from 'react';
import RealAstroCards from '@/components/astro/RealAstroCards';

export default function TestAstroPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user profile
        const profileResponse = await fetch('/api/user/profile', { cache: 'no-store' });
        const profile = await profileResponse.json();
        console.log('Profile:', profile);

        // Fetch astro data
        const astroResponse = await fetch('/api/astro/prokerala', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            birth: profile.birth, 
            locale: profile.language 
          }),
          cache: 'no-store'
        });
        
        const astro = await astroResponse.json();
        console.log('Astro data:', astro);
        setData(astro);
      } catch (err) {
        console.error('Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Astro Cards</h1>
      <RealAstroCards 
        data={data} 
        loading={loading} 
        userProfile={{
          name: "राम शर्मा",
          birth: {
            date: "1990-05-15",
            time: "14:30:00",
            location: { place: "काठमाडौं, नेपाल" }
          }
        }}
      />
    </div>
  );
}
