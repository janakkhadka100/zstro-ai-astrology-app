'use client';

import { useEffect, useState } from 'react';

interface District {
  id: string;
  districtName: string;
  latitude: string;
  longitude: string;
  timezone: string;
  timeDifference: string;
}

export default function DistrictForm() {
  const [districts, setDistricts] = useState<District[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);

  useEffect(() => {
    const fetchDistricts = async () => {
      const res = await fetch('/api/districts');
      const data = await res.json();
      console.log('Fetched districts:', data);
      setDistricts(data); // <-- this line is now correct
    };
    fetchDistricts();
  }, []);


  const handleDistrictChange = (id: string) => {
    const found = districts.find((d) => d.id === id);
    setSelectedDistrict(found || null);
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="district" className="text-sm font-medium text-gray-700 dark:text-zinc-300">Select Birth Place
            <select
                id="district"
                onChange={(e) => handleDistrictChange(e.target.value)}
                defaultValue=""
                className="mt-1 w-full rounded-md border border-gray-300 p-2 dark:bg-zinc-800 dark:border-zinc-600"
                >
                <option value="" disabled>Select birth place</option>
                {districts.map((district) => (
                    <option key={district.id} value={district.id}>
                    {district.districtName}
                    </option>
                ))}
            </select>
        </label>
      </div>

      {/* Show the hidden fields only when a district is selected */}
      {selectedDistrict && (
        <>
            <input type="hidden" name="place" value={selectedDistrict.districtName} />
            <input type="hidden" name="latitude" value={selectedDistrict.latitude} />
            <input type="hidden" name="longitude" value={selectedDistrict.longitude} />
            <input type="hidden" name="timezone" value={selectedDistrict.timezone} />
        </>
      )}
    </div>
  );
}
