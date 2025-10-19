"use client";

import { useEffect, useRef } from "react";

interface ChartViewClientProps {
  data: {
    ascSignId: number;
    ascSignLabel: string;
    planets: Array<{
      planet: string;
      signId: number;
      signLabel: string;
      degree: number | null;
      safeHouse: number;
    }>;
    lang: "ne" | "en";
  };
}

export default function ChartViewClient({ data }: ChartViewClientProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { ascSignId, ascSignLabel, planets, lang } = data;
  const isNepali = lang === "ne";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const size = 400;
    canvas.width = size;
    canvas.height = size;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Draw background circle
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = 180;

    // Outer circle
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.stroke();

    // Draw 12 houses (signs)
    const signLabels = isNepali 
      ? ['मेष', 'वृष', 'मिथुन', 'कर्क', 'सिंह', 'कन्या', 'तुला', 'वृश्चिक', 'धनु', 'मकर', 'कुम्भ', 'मीन']
      : ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

    for (let i = 0; i < 12; i++) {
      const angle = (i * 30) - 90; // Start from top (Aries)
      const startAngle = (angle * Math.PI) / 180;
      const endAngle = ((angle + 30) * Math.PI) / 180;

      // Draw house boundary
      ctx.strokeStyle = '#9CA3AF';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.stroke();

      // Draw sign label
      const labelAngle = angle + 15; // Center of the house
      const labelRadius = radius - 30;
      const labelX = centerX + Math.cos((labelAngle * Math.PI) / 180) * labelRadius;
      const labelY = centerY + Math.sin((labelAngle * Math.PI) / 180) * labelRadius;

      ctx.fillStyle = '#374151';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(signLabels[i], labelX, labelY);

      // Draw house number
      const houseNumber = i + 1;
      const numberRadius = radius - 50;
      const numberX = centerX + Math.cos((labelAngle * Math.PI) / 180) * numberRadius;
      const numberY = centerY + Math.sin((labelAngle * Math.PI) / 180) * numberRadius;

      ctx.fillStyle = '#6B7280';
      ctx.font = '10px Arial';
      ctx.fillText(houseNumber.toString(), numberX, numberY);
    }

    // Draw planets
    const planetSymbols: { [key: string]: string } = {
      'Sun': '☉',
      'Moon': '☽',
      'Mars': '♂',
      'Mercury': '☿',
      'Jupiter': '♃',
      'Venus': '♀',
      'Saturn': '♄',
      'Rahu': '☊',
      'Ketu': '☋'
    };

    planets.forEach(planet => {
      if (planet.degree === null) return;

      const planetAngle = (planet.degree - 90) * (Math.PI / 180); // Convert to radians, start from top
      const planetRadius = radius - 80;
      const planetX = centerX + Math.cos(planetAngle) * planetRadius;
      const planetY = centerY + Math.sin(planetAngle) * planetRadius;

      // Draw planet symbol
      ctx.fillStyle = '#1F2937';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(planetSymbols[planet.planet] || planet.planet, planetX, planetY);

      // Draw planet name
      ctx.fillStyle = '#6B7280';
      ctx.font = '10px Arial';
      ctx.fillText(planet.planet, planetX, planetY + 20);
    });

    // Draw ascendant line
    const ascAngle = (0 - 90) * (Math.PI / 180); // Aries is at 0 degrees
    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(
      centerX + Math.cos(ascAngle) * radius,
      centerY + Math.sin(ascAngle) * radius
    );
    ctx.stroke();

    // Draw ascendant label
    ctx.fillStyle = '#EF4444';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('ASC', centerX + Math.cos(ascAngle) * (radius + 20), centerY + Math.sin(ascAngle) * (radius + 20));

  }, [ascSignId, ascSignLabel, planets, isNepali]);

  return (
    <div className="flex flex-col items-center space-y-4">
      <canvas
        ref={canvasRef}
        className="border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
      <div className="text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {isNepali ? "लग्न" : "Ascendant"}: {ascSignLabel}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
          {isNepali ? "सूर्य, चन्द्रमा र अन्य ग्रहहरूको स्थिति" : "Positions of Sun, Moon and other planets"}
        </p>
      </div>
    </div>
  );
}
