// components/astro/BirthCards.tsx
// Birth Details Cards - auto-display on signup/login

"use client";

import { AstroData } from "@/lib/astrology/types";
import { getHouseSignificance, isKendra, isKona, isTrik, isUpachaya } from "@/lib/astrology/derive";
import { getString, type Lang } from "@/lib/utils/i18n";

interface BirthCardsProps {
  data: AstroData;
  lang?: Lang;
  className?: string;
}

export default function BirthCards({ data, lang = "ne", className = "" }: BirthCardsProps) {
  if (!data.profile || !data.derived) {
    return (
      <div className={`rounded-2xl shadow-lg p-6 bg-white dark:bg-gray-800 border dark:border-gray-700 ${className}`}>
        <div className="text-center text-gray-500 dark:text-gray-400">
          {lang === "ne" ? "जन्म विवरण लोड हुँदै..." : "Loading birth details..."}
        </div>
      </div>
    );
  }

  const { profile } = data;
  const { houses, strengths } = data.derived;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Profile Card */}
      <div className="rounded-2xl shadow-lg p-6 bg-white dark:bg-gray-800 border dark:border-gray-700">
        <h3 className="font-semibold mb-4 text-lg text-gray-900 dark:text-gray-100">
          {lang === "ne" ? "जन्म विवरण" : "Birth Details"}
        </h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                {lang === "ne" ? "नाम" : "Name"}:
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {profile.name || "-"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                {lang === "ne" ? "जन्म मिति" : "Birth Date"}:
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {profile.birthDate || "-"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                {lang === "ne" ? "जन्म समय" : "Birth Time"}:
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {profile.birthTime || "-"}
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                {lang === "ne" ? "समय क्षेत्र" : "Timezone"}:
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {profile.tz || "-"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                {lang === "ne" ? "अक्षांश" : "Latitude"}:
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {profile.lat ? `${profile.lat.toFixed(4)}°` : "-"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                {lang === "ne" ? "देशान्तर" : "Longitude"}:
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {profile.lon ? `${profile.lon.toFixed(4)}°` : "-"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Janmakundali Summary */}
      <div className="rounded-2xl shadow-lg p-6 bg-white dark:bg-gray-800 border dark:border-gray-700">
        <h3 className="font-semibold mb-4 text-lg text-gray-900 dark:text-gray-100">
          {lang === "ne" ? "जन्मकुण्डली सारांश" : "Janmakundali Summary"}
        </h3>
        
        {/* House-Sign-Lord Table */}
        <div className="mb-6">
          <h4 className="font-medium mb-3 text-gray-900 dark:text-gray-100">
            {lang === "ne" ? "घर-राशी-मालिक तालिका" : "House-Sign-Lord Table"}
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b dark:border-gray-600">
                  <th className="text-left py-2 px-3 text-gray-600 dark:text-gray-400">
                    {lang === "ne" ? "घर" : "House"}
                  </th>
                  <th className="text-left py-2 px-3 text-gray-600 dark:text-gray-400">
                    {lang === "ne" ? "राशी" : "Sign"}
                  </th>
                  <th className="text-left py-2 px-3 text-gray-600 dark:text-gray-400">
                    {lang === "ne" ? "मालिक" : "Lord"}
                  </th>
                  <th className="text-left py-2 px-3 text-gray-600 dark:text-gray-400">
                    {lang === "ne" ? "ग्रह" : "Planets"}
                  </th>
                  <th className="text-left py-2 px-3 text-gray-600 dark:text-gray-400">
                    {lang === "ne" ? "दृष्टि" : "Aspects"}
                  </th>
                </tr>
              </thead>
              <tbody>
                {houses.map((house) => (
                  <tr key={house.house} className="border-b dark:border-gray-700">
                    <td className="py-2 px-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                        isKendra(house.house) ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        isKona(house.house) ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        isTrik(house.house) ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}>
                        H{house.house}
                        {isKendra(house.house) && (lang === "ne" ? " (केन्द्र)" : " (Kendra)")}
                        {isKona(house.house) && (lang === "ne" ? " (कोण)" : " (Kona)")}
                        {isTrik(house.house) && (lang === "ne" ? " (त्रिक)" : " (Trik)")}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-medium text-gray-900 dark:text-gray-100">
                      {house.signLabel}
                    </td>
                    <td className="py-2 px-3 text-gray-600 dark:text-gray-400">
                      {house.lord}
                    </td>
                    <td className="py-2 px-3">
                      {house.occupants.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {house.occupants.map((planet) => (
                            <span key={planet} className="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded text-xs">
                              {planet}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-2 px-3">
                      {house.aspectsFrom.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {house.aspectsFrom.map((aspect, idx) => (
                            <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded text-xs">
                              {aspect.planet} ({aspect.kind})
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Shadbala Summary */}
        <div>
          <h4 className="font-medium mb-3 text-gray-900 dark:text-gray-100">
            {lang === "ne" ? "पडवल तालिका" : "Shadbala Summary"}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {strengths.map((strength) => (
              <div key={strength.planet} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {strength.planet}
                </span>
                <div className="text-right">
                  {strength.normalized && (
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {strength.normalized}/100
                    </div>
                  )}
                  {strength.dignity && (
                    <div className={`text-xs px-2 py-1 rounded ${
                      strength.dignity === 'exalt' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      strength.dignity === 'own' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      strength.dignity === 'debil' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                    }`}>
                      {strength.dignity}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
