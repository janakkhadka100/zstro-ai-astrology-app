'use client';

import { useState } from 'react';

interface Planet {
  planet: string;
  signId: number;
  signLabel: string;
  house: number;
  retro: boolean;
}

interface ChartProps {
  planets: Planet[];
  ascendant: {
    signId: number;
    signLabel: string;
  };
}

export default function NorthIndianChart({ planets, ascendant }: ChartProps) {
  // Group planets by house
  const planetsByHouse = planets.reduce((acc, planet) => {
    if (!acc[planet.house]) {
      acc[planet.house] = [];
    }
    acc[planet.house].push(planet);
    return acc;
  }, {} as Record<number, Planet[]>);

  // Planet short names
  const getPlanetShortName = (planet: string): string => {
    const shortNames: Record<string, string> = {
      'Sun': 'Su',
      'Moon': 'Mo',
      'Mars': 'Ma',
      'Mercury': 'Me',
      'Jupiter': 'Ju',
      'Venus': 'Ve',
      'Saturn': 'Sa',
      'Rahu': 'Ra',
      'Ketu': 'Ke'
    };
    return shortNames[planet] || planet.substring(0, 2);
  };

  // Render house content
  const renderHouse = (houseNum: number) => {
    const housePlanets = planetsByHouse[houseNum] || [];
    const isAscendant = houseNum === 1;

    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center p-2">
        {/* House number */}
        <div className="absolute top-1 left-1 text-xs font-bold text-gray-400">
          {houseNum}
        </div>

        {/* Ascendant marker */}
        {isAscendant && (
          <div className="absolute top-1 right-1 text-yellow-500 text-sm">
            ✦
          </div>
        )}

        {/* Planets in this house */}
        <div className="flex flex-wrap gap-1 items-center justify-center">
          {housePlanets.map((planet, idx) => (
            <span
              key={idx}
              className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                planet.retro 
                  ? 'bg-red-100 text-red-700' 
                  : 'bg-blue-100 text-blue-700'
              }`}
              title={`${planet.planet} in ${planet.signLabel}${planet.retro ? ' (R)' : ''}`}
            >
              {getPlanetShortName(planet.planet)}
              {planet.retro && <sup className="text-red-500">R</sup>}
            </span>
          ))}
        </div>

        {/* Sign for ascendant house */}
        {isAscendant && (
          <div className="text-xs text-purple-600 font-semibold mt-1">
            {ascendant.signLabel}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      {/* Chart Title */}
      <h3 className="text-xl font-bold text-center mb-4 text-gray-800">
        उत्तर भारतीय कुण्डली (North Indian Chart)
      </h3>

      {/* Diamond Chart Container */}
      <div className="relative w-full aspect-square bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg shadow-lg p-4">
        <svg viewBox="0 0 400 400" className="w-full h-full">
          {/* Define the diamond path */}
          <defs>
            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3"/>
            </filter>
          </defs>

          {/* Outer diamond border */}
          <path
            d="M 200 20 L 380 200 L 200 380 L 20 200 Z"
            fill="white"
            stroke="#9333ea"
            strokeWidth="3"
            filter="url(#shadow)"
          />

          {/* Inner cross dividing into 4 triangles */}
          <line x1="200" y1="20" x2="200" y2="380" stroke="#9333ea" strokeWidth="2" />
          <line x1="20" y1="200" x2="380" y2="200" stroke="#9333ea" strokeWidth="2" />

          {/* Diagonal lines creating the houses */}
          <line x1="200" y1="20" x2="20" y2="200" stroke="#9333ea" strokeWidth="1" strokeDasharray="4" />
          <line x1="200" y1="20" x2="380" y2="200" stroke="#9333ea" strokeWidth="1" strokeDasharray="4" />
          <line x1="20" y1="200" x2="200" y2="380" stroke="#9333ea" strokeWidth="1" strokeDasharray="4" />
          <line x1="380" y1="200" x2="200" y2="380" stroke="#9333ea" strokeWidth="1" strokeDasharray="4" />

          {/* Additional divisions for 12 houses */}
          {/* Top triangle divisions */}
          <line x1="110" y1="110" x2="200" y2="20" stroke="#9333ea" strokeWidth="1" opacity="0.3" />
          <line x1="290" y1="110" x2="200" y2="20" stroke="#9333ea" strokeWidth="1" opacity="0.3" />
          
          {/* Right triangle divisions */}
          <line x1="290" y1="110" x2="380" y2="200" stroke="#9333ea" strokeWidth="1" opacity="0.3" />
          <line x1="290" y1="290" x2="380" y2="200" stroke="#9333ea" strokeWidth="1" opacity="0.3" />
          
          {/* Bottom triangle divisions */}
          <line x1="290" y1="290" x2="200" y2="380" stroke="#9333ea" strokeWidth="1" opacity="0.3" />
          <line x1="110" y1="290" x2="200" y2="380" stroke="#9333ea" strokeWidth="1" opacity="0.3" />
          
          {/* Left triangle divisions */}
          <line x1="110" y1="290" x2="20" y2="200" stroke="#9333ea" strokeWidth="1" opacity="0.3" />
          <line x1="110" y1="110" x2="20" y2="200" stroke="#9333ea" strokeWidth="1" opacity="0.3" />

          {/* Center circle for ascendant */}
          <circle cx="200" cy="200" r="25" fill="white" stroke="#fbbf24" strokeWidth="2" />
          <text x="200" y="200" textAnchor="middle" dominantBaseline="middle" className="text-xs font-bold fill-purple-600">
            लग्न
          </text>
        </svg>

        {/* House content overlays - positioned absolutely */}
        <div className="absolute inset-0 pointer-events-none">
          {/* House 12 - Top */}
          <div className="absolute left-1/2 top-2 -translate-x-1/2 w-20 h-16 pointer-events-auto">
            {renderHouse(12)}
          </div>

          {/* House 1 - Top Right */}
          <div className="absolute right-[22%] top-[16%] w-20 h-16 pointer-events-auto">
            {renderHouse(1)}
          </div>

          {/* House 2 - Right Top */}
          <div className="absolute right-[8%] top-[32%] w-20 h-16 pointer-events-auto">
            {renderHouse(2)}
          </div>

          {/* House 3 - Right */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 w-20 h-16 pointer-events-auto">
            {renderHouse(3)}
          </div>

          {/* House 4 - Right Bottom */}
          <div className="absolute right-[8%] bottom-[32%] w-20 h-16 pointer-events-auto">
            {renderHouse(4)}
          </div>

          {/* House 5 - Bottom Right */}
          <div className="absolute right-[22%] bottom-[16%] w-20 h-16 pointer-events-auto">
            {renderHouse(5)}
          </div>

          {/* House 6 - Bottom */}
          <div className="absolute left-1/2 bottom-2 -translate-x-1/2 w-20 h-16 pointer-events-auto">
            {renderHouse(6)}
          </div>

          {/* House 7 - Bottom Left */}
          <div className="absolute left-[22%] bottom-[16%] w-20 h-16 pointer-events-auto">
            {renderHouse(7)}
          </div>

          {/* House 8 - Left Bottom */}
          <div className="absolute left-[8%] bottom-[32%] w-20 h-16 pointer-events-auto">
            {renderHouse(8)}
          </div>

          {/* House 9 - Left */}
          <div className="absolute left-2 top-1/2 -translate-y-1/2 w-20 h-16 pointer-events-auto">
            {renderHouse(9)}
          </div>

          {/* House 10 - Left Top */}
          <div className="absolute left-[8%] top-[32%] w-20 h-16 pointer-events-auto">
            {renderHouse(10)}
          </div>

          {/* House 11 - Top Left */}
          <div className="absolute left-[22%] top-[16%] w-20 h-16 pointer-events-auto">
            {renderHouse(11)}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 bg-white rounded-lg p-4 shadow">
        <h4 className="font-semibold text-gray-800 mb-3">Legend:</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-yellow-500 text-lg">✦</span>
            <span>लग्न (Ascendant)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">Su</span>
            <span>सामान्य ग्रह</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs">Ma<sup>R</sup></span>
            <span>वक्री ग्रह</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400 font-bold">1-12</span>
            <span>घर नम्बर</span>
          </div>
        </div>

        {/* Planet names reference */}
        <div className="mt-4 pt-4 border-t">
          <p className="text-xs text-gray-600 mb-2">Planet Short Names:</p>
          <div className="grid grid-cols-3 gap-2 text-xs text-gray-700">
            <span>Su = Sun (सूर्य)</span>
            <span>Mo = Moon (चन्द्र)</span>
            <span>Ma = Mars (मंगल)</span>
            <span>Me = Mercury (बुध)</span>
            <span>Ju = Jupiter (बृहस्पति)</span>
            <span>Ve = Venus (शुक्र)</span>
            <span>Sa = Saturn (शनि)</span>
            <span>Ra = Rahu (राहु)</span>
            <span>Ke = Ketu (केतु)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
