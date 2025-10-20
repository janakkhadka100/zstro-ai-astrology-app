// lib/i18n/transit.ts
// Multilingual labels for transit system

export const transitLabels = {
  en: {
    title: "Today's Transits",
    age: "Age",
    periodRuler: "period ruler",
    benefic: "benefic",
    dasha: "Dasha",
    transits: "Transits",
    location: "Location",
    timezone: "Timezone",
    checkAnotherDate: "Check another date:",
    keyTransits: "Key Transits",
    currentDasha: "Current Dasha",
    periodRulers: "Period Rulers",
    enhancedInfluence: "These planets have enhanced influence",
    refresh: "Refresh",
    loading: "Loading...",
    error: "Error",
    noData: "No transit data available"
  },
  ne: {
    title: "आजको गोचर",
    age: "उमेर",
    periodRuler: "दशा स्वामी",
    benefic: "शुभ",
    dasha: "दशा",
    transits: "गोचर",
    location: "स्थान",
    timezone: "समय क्षेत्र",
    checkAnotherDate: "अर्को मिति जाँच गर्नुहोस्:",
    keyTransits: "मुख्य गोचर",
    currentDasha: "हालको दशा",
    periodRulers: "दशा स्वामी",
    enhancedInfluence: "यी ग्रहहरूको बढी प्रभाव छ",
    refresh: "ताजा पार्नुहोस्",
    loading: "लोड हुँदै...",
    error: "त्रुटि",
    noData: "गोचर डेटा उपलब्ध छैन"
  },
  hi: {
    title: "आज का गोचर",
    age: "आयु",
    periodRuler: "दशा स्वामी",
    benefic: "शुभ",
    dasha: "दशा",
    transits: "गोचर",
    location: "स्थान",
    timezone: "समय क्षेत्र",
    checkAnotherDate: "दूसरी तारीख जांचें:",
    keyTransits: "मुख्य गोचर",
    currentDasha: "वर्तमान दशा",
    periodRulers: "दशा स्वामी",
    enhancedInfluence: "इन ग्रहों का अधिक प्रभाव है",
    refresh: "ताज़ा करें",
    loading: "लोड हो रहा...",
    error: "त्रुटि",
    noData: "गोचर डेटा उपलब्ध नहीं"
  }
};

export function getTransitLabels(lang: 'en' | 'ne' | 'hi' = 'en') {
  return transitLabels[lang];
}

export function formatTransitLabel(key: keyof typeof transitLabels.en, lang: 'en' | 'ne' | 'hi' = 'en'): string {
  return transitLabels[lang][key] || transitLabels.en[key];
}
