"use client";
import { useState } from "react";
import ResultSummaryCard from "@/components/astro/ResultSummaryCard";
import PlanetTableCard from "@/components/astro/PlanetTableCard";
import YogDoshGrid from "@/components/astro/YogDoshGrid";
import PDFButtonCard from "@/components/astro/PDFButtonCard";
import ShadbalaCard from "@/components/astro/ShadbalaCard";
import AshtakavargaCard from "@/components/astro/AshtakavargaCard";
import DashaTreeCard from "@/components/astro/DashaTreeCard";
import VargaTiles from "@/components/astro/VargaTiles";
import ConditionWatchCard from "@/components/astro/ConditionWatchCard";
import TransitTodayCard from "@/components/astro/TransitTodayCard";
import PanchangaCard from "@/components/astro/PanchangaCard";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useLang } from "@/hooks/useLang";
import { getString } from "@/utils/strings";

export default function CardsPage() {
  const { lang } = useLang();
  
  // Comprehensive sample data for demonstration
  const data = {
    ascSignLabel: "वृष (Taurus)",
    moonSignLabel: "मकर (Capricorn)",
    planets: [
      { 
        planet:"Sun", 
        signLabel:"धनु (Sagittarius)", 
        house:8, 
        degree:15.5,
        combust: false,
        retro: false,
        shadbala: { total: 150.25, sthana: 45.5, dig: 30.2, kala: 25.8, chestha: 20.1, naisargika: 28.65, drik: 0 }
      },
      { 
        planet:"Moon",
        signLabel:"मकर (Capricorn)", 
        house:10, 
        degree:8.2,
        combust: false,
        retro: false,
        shadbala: { total: 180.45, sthana: 50.1, dig: 35.3, kala: 30.2, chestha: 25.4, naisargika: 39.45, drik: 0 }
      },
      { 
        planet:"Mars",
        signLabel:"धनु (Sagittarius)", 
        house:8, 
        degree:22.1,
        combust: false,
        retro: true,
        shadbala: { total: 120.45, sthana: 40.1, dig: 25.3, kala: 20.2, chestha: 15.4, naisargika: 19.45, drik: 0 }
      },
      { 
        planet:"Mercury",
        signLabel:"मकर (Capricorn)", 
        house:10, 
        degree:12.8,
        combust: true,
        retro: false,
        shadbala: { total: 95.6, sthana: 32.8, dig: 18.5, kala: 14.1, chestha: 12.9, naisargika: 17.3, drik: 0 }
      },
      { 
        planet:"Jupiter",
        signLabel:"कुम्भ (Aquarius)", 
        house:11, 
        degree:5.3,
        combust: false,
        retro: false,
        shadbala: { total: 200.6, sthana: 60.8, dig: 40.5, kala: 35.1, chestha: 30.9, naisargika: 33.3, drik: 0 }
      },
      { 
        planet:"Venus",
        signLabel:"मकर (Capricorn)", 
        house:10, 
        degree:18.7,
        combust: false,
        retro: false,
        shadbala: { total: 160.4, sthana: 48.2, dig: 32.1, kala: 28.5, chestha: 22.8, naisargika: 28.8, drik: 0 }
      },
      { 
        planet:"Saturn",
        signLabel:"कुम्भ (Aquarius)", 
        house:11, 
        degree:25.9,
        combust: false,
        retro: false,
        shadbala: { total: 140.6, sthana: 42.8, dig: 28.5, kala: 24.1, chestha: 18.9, naisargika: 26.3, drik: 0 }
      },
      { 
        planet:"Rahu",
        signLabel:"मिथुन (Gemini)", 
        house:3, 
        degree:10.2,
        combust: false,
        retro: true,
        shadbala: { total: 110.2, sthana: 35.1, dig: 22.3, kala: 18.7, chestha: 14.2, naisargika: 19.9, drik: 0 }
      },
      { 
        planet:"Ketu",
        signLabel:"धनु (Sagittarius)", 
        house:9, 
        degree:10.2,
        combust: false,
        retro: true,
        shadbala: { total: 105.8, sthana: 33.4, dig: 21.1, kala: 17.8, chestha: 13.5, naisargika: 20.0, drik: 0 }
      }
    ],
    shadbala: {
      "Sun": { total: 150.25, sthana: 45.5, dig: 30.2, kala: 25.8, chestha: 20.1, naisargika: 28.65, drik: 0 },
      "Moon": { total: 180.45, sthana: 50.1, dig: 35.3, kala: 30.2, chestha: 25.4, naisargika: 39.45, drik: 0 },
      "Mars": { total: 120.45, sthana: 40.1, dig: 25.3, kala: 20.2, chestha: 15.4, naisargika: 19.45, drik: 0 },
      "Mercury": { total: 95.6, sthana: 32.8, dig: 18.5, kala: 14.1, chestha: 12.9, naisargika: 17.3, drik: 0 },
      "Jupiter": { total: 200.6, sthana: 60.8, dig: 40.5, kala: 35.1, chestha: 30.9, naisargika: 33.3, drik: 0 },
      "Venus": { total: 160.4, sthana: 48.2, dig: 32.1, kala: 28.5, chestha: 22.8, naisargika: 28.8, drik: 0 },
      "Saturn": { total: 140.6, sthana: 42.8, dig: 28.5, kala: 24.1, chestha: 18.9, naisargika: 26.3, drik: 0 },
      "Rahu": { total: 110.2, sthana: 35.1, dig: 22.3, kala: 18.7, chestha: 14.2, naisargika: 19.9, drik: 0 },
      "Ketu": { total: 105.8, sthana: 33.4, dig: 21.1, kala: 17.8, chestha: 13.5, naisargika: 20.0, drik: 0 }
    },
    ashtakavarga: {
      sav: [
        { house: 1, points: 6 },
        { house: 2, points: 4 },
        { house: 3, points: 5 },
        { house: 4, points: 7 },
        { house: 5, points: 3 },
        { house: 6, points: 4 },
        { house: 7, points: 6 },
        { house: 8, points: 2 },
        { house: 9, points: 5 },
        { house: 10, points: 8 },
        { house: 11, points: 4 },
        { house: 12, points: 3 }
      ],
      bav: [
        { planet: "Sun", house: 1, points: 5 },
        { planet: "Moon", house: 2, points: 4 },
        { planet: "Mars", house: 3, points: 6 },
        { planet: "Mercury", house: 4, points: 3 },
        { planet: "Jupiter", house: 5, points: 7 },
        { planet: "Venus", house: 6, points: 4 },
        { planet: "Saturn", house: 7, points: 5 }
      ]
    },
    dasha: {
      vimshottari: [
        {
          name: "Ketu",
          lord: "Ketu",
          start: "2020-01-01T00:00:00Z",
          end: "2027-01-01T00:00:00Z",
          level: "MAHA",
          children: [
            {
              name: "Venus",
              lord: "Venus",
              start: "2023-01-01T00:00:00Z",
              end: "2024-01-01T00:00:00Z",
              level: "ANTAR",
              children: [
                {
                  name: "Sun",
                  lord: "Sun",
                  start: "2023-06-01T00:00:00Z",
                  end: "2023-09-01T00:00:00Z",
                  level: "PRATYANTAR"
                }
              ]
            }
          ]
        }
      ],
      yogini: [
        {
          name: "Sankata",
          lord: "Rahu",
          start: "2023-01-01T00:00:00Z",
          end: "2024-01-01T00:00:00Z",
          level: "YOGINI"
        }
      ]
    },
    vargas: [
      { id: "D9", title: "Navamsa", keyHints: ["Marriage", "Spiritual growth"], verdict: "Strong 9th house" },
      { id: "D10", title: "Dasamsa", keyHints: ["Career", "Profession"], verdict: "Good career prospects" },
      { id: "D7", title: "Saptamsa", keyHints: ["Children", "Creativity"], verdict: "Favorable for children" },
      { id: "D12", title: "Dwadasamsa", keyHints: ["Parents", "Ancestors"], verdict: "Strong parental influence" },
      { id: "D20", title: "Vimsamsa", keyHints: ["Spirituality", "Devotion"], verdict: "Spiritual inclination" },
      { id: "D60", title: "Shashtyamsa", keyHints: ["Karma", "Past life"], verdict: "Karmic patterns" }
    ],
    transits: [
      { date: "2024-01-20", highlights: ["Jupiter enters Aries", "Mars aspects 7th house"] },
      { date: "2024-02-15", highlights: ["Saturn direct motion", "Venus conjunct Sun"] },
      { date: "2024-03-10", highlights: ["Mercury retrograde ends", "New Moon in Pisces"] },
      { date: "2024-04-05", highlights: ["Mars enters Gemini", "Jupiter trine Moon"] },
      { date: "2024-05-01", highlights: ["Venus enters Taurus", "Saturn square Sun"] }
    ],
    panchanga: {
      tithi: "Purnima",
      vara: "Sunday",
      nakshatra: "Rohini",
      yoga: "Siddhi",
      karana: "Vishti"
    },
    yogas: [
      {label:"गजकेसरी योग", factors:["Jupiter","Moon"]},
      {label:"राज योग", factors:["Sun","Moon"]},
      {label:"लक्ष्मी योग", factors:["Venus","Jupiter"]}
    ],
    doshas: [
      {label:"मंगल दोष", factors:["Mars"]},
      {label:"काल सर्प दोष", factors:["Rahu","Ketu"]},
      {label:"पितृ दोष", factors:["Sun","Moon"]}
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {getString("kundali_report", lang)}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Comprehensive Vedic Astrology Analysis with Strength, Dasha, Varga, and Transit Cards
          </p>
        </div>

        {/* Cards Grid */}
        <ErrorBoundary>
          <div className="space-y-8">
            {/* Top Row - Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ResultSummaryCard asc={data.ascSignLabel} moon={data.moonSignLabel} />
              <PDFButtonCard onClick={() => alert("PDF generation coming soon!")} />
            </div>

            {/* Strength Analysis */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-800 text-center">
                {getString("strength", lang)} Analysis
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ShadbalaCard data={data.shadbala} />
                <AshtakavargaCard data={data.ashtakavarga} />
              </div>
            </div>

            {/* Dasha System */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-800 text-center">
                {getString("dasha_v", lang)} System
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DashaTreeCard title={getString("dasha_v", lang)} tree={data.dasha.vimshottari} />
                {data.dasha.yogini && (
                  <DashaTreeCard title={getString("dasha_y", lang)} tree={data.dasha.yogini} />
                )}
              </div>
            </div>

            {/* Divisional Charts */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-800 text-center">
                {getString("varga", lang)} Charts
              </h2>
              <VargaTiles items={data.vargas} />
            </div>

            {/* Planetary Conditions */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-800 text-center">
                Planetary Conditions
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ConditionWatchCard planets={data.planets} />
                <PlanetTableCard rows={data.planets} />
              </div>
            </div>

            {/* Transits & Panchanga */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-800 text-center">
                {getString("transit", lang)} & {getString("panchanga", lang)}
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TransitTodayCard transits={data.transits} />
                <PanchangaCard panchanga={data.panchanga} />
              </div>
            </div>

            {/* Yogas & Doshas */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-800 text-center">
                {getString("yogas_title", lang)} & {getString("doshas_title", lang)}
              </h2>
              <YogDoshGrid yogas={data.yogas} doshas={data.doshas} />
            </div>
          </div>
        </ErrorBoundary>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            Generated with Vedic Astrology principles • Multilingual Support (EN/HI/NE)
          </p>
        </div>
      </div>
    </div>
  );
}
