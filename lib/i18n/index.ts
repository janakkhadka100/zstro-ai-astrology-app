// lib/i18n/index.ts
// ZSTRO AI Multilingual Internationalization System

export type SupportedLanguage = 'en' | 'ne' | 'hi';

export interface TranslationKeys {
  // Common UI
  welcome: string;
  signIn: string;
  signOut: string;
  loading: string;
  error: string;
  success: string;
  cancel: string;
  save: string;
  edit: string;
  delete: string;
  close: string;
  next: string;
  previous: string;
  submit: string;
  reset: string;
  search: string;
  filter: string;
  sort: string;
  refresh: string;
  back: string;
  home: string;
  profile: string;
  settings: string;
  help: string;
  about: string;
  contact: string;
  
  // Navigation
  dashboard: string;
  astrology: string;
  kundali: string;
  horoscope: string;
  dasha: string;
  compatibility: string;
  remedies: string;
  chat: string;
  history: string;
  reports: string;
  
  // Astrology specific
  birthDetails: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  latitude: string;
  longitude: string;
  timezone: string;
  gender: string;
  male: string;
  female: string;
  other: string;
  
  // Astro Cards
  ascendant: string;
  moonSign: string;
  sunSign: string;
  currentDasha: string;
  transitHighlights: string;
  todayTips: string;
  lucky: string;
  focus: string;
  generateKundali: string;
  viewChart: string;
  downloadReport: string;
  
  // Chat
  askQuestion: string;
  sendMessage: string;
  typeMessage: string;
  chatHistory: string;
  newChat: string;
  clearChat: string;
  
  // Forms
  required: string;
  invalid: string;
  selectOption: string;
  enterValue: string;
  chooseFile: string;
  uploadFile: string;
  
  // Errors
  somethingWentWrong: string;
  networkError: string;
  serverError: string;
  notFound: string;
  unauthorized: string;
  forbidden: string;
  validationError: string;
  dataLoadFailed: string;
  saveFailed: string;
  deleteFailed: string;
  
  // Success messages
  dataSaved: string;
  dataDeleted: string;
  dataUpdated: string;
  operationSuccessful: string;
  
  // Time and dates
  today: string;
  tomorrow: string;
  yesterday: string;
  thisWeek: string;
  thisMonth: string;
  thisYear: string;
  
  // Astrological terms
  lagna: string;
  rashi: string;
  graha: string;
  nakshatra: string;
  tithi: string;
  yoga: string;
  karana: string;
  mahaDasha: string;
  antarDasha: string;
  pratyantarDasha: string;
  sookshmaDasha: string;
  pranDasha: string;
  
  // House meanings
  house1: string;
  house2: string;
  house3: string;
  house4: string;
  house5: string;
  house6: string;
  house7: string;
  house8: string;
  house9: string;
  house10: string;
  house11: string;
  house12: string;
  
  // Planet names
  sun: string;
  moon: string;
  mars: string;
  mercury: string;
  jupiter: string;
  venus: string;
  saturn: string;
  rahu: string;
  ketu: string;
  
  // Zodiac signs
  aries: string;
  taurus: string;
  gemini: string;
  cancer: string;
  leo: string;
  virgo: string;
  libra: string;
  scorpio: string;
  sagittarius: string;
  capricorn: string;
  aquarius: string;
  pisces: string;
}

// Translation dictionaries
const translations: Record<SupportedLanguage, TranslationKeys> = {
  en: {
    // Common UI
    welcome: "Welcome to ZSTRO AI",
    signIn: "Sign In",
    signOut: "Sign Out",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    cancel: "Cancel",
    save: "Save",
    edit: "Edit",
    delete: "Delete",
    close: "Close",
    next: "Next",
    previous: "Previous",
    submit: "Submit",
    reset: "Reset",
    search: "Search",
    filter: "Filter",
    sort: "Sort",
    refresh: "Refresh",
    back: "Back",
    home: "Home",
    profile: "Profile",
    settings: "Settings",
    help: "Help",
    about: "About",
    contact: "Contact",
    
    // Navigation
    dashboard: "Dashboard",
    astrology: "Astrology",
    kundali: "Kundali",
    horoscope: "Horoscope",
    dasha: "Dasha",
    compatibility: "Compatibility",
    remedies: "Remedies",
    chat: "Chat",
    history: "History",
    reports: "Reports",
    
    // Astrology specific
    birthDetails: "Birth Details",
    birthDate: "Birth Date",
    birthTime: "Birth Time",
    birthPlace: "Birth Place",
    latitude: "Latitude",
    longitude: "Longitude",
    timezone: "Timezone",
    gender: "Gender",
    male: "Male",
    female: "Female",
    other: "Other",
    
    // Astro Cards
    ascendant: "Ascendant (Lagna)",
    moonSign: "Moon Sign",
    sunSign: "Sun Sign",
    currentDasha: "Current Dasha",
    transitHighlights: "Transit Highlights",
    todayTips: "Today's Tips",
    lucky: "Lucky",
    focus: "Focus",
    generateKundali: "Generate Kundali",
    viewChart: "View Chart",
    downloadReport: "Download Report",
    
    // Chat
    askQuestion: "Ask a question",
    sendMessage: "Send Message",
    typeMessage: "Type a message...",
    chatHistory: "Chat History",
    newChat: "New Chat",
    clearChat: "Clear Chat",
    
    // Forms
    required: "This field is required",
    invalid: "Invalid value",
    selectOption: "Select an option",
    enterValue: "Enter a value",
    chooseFile: "Choose file",
    uploadFile: "Upload file",
    
    // Errors
    somethingWentWrong: "Something went wrong",
    networkError: "Network error",
    serverError: "Server error",
    notFound: "Not found",
    unauthorized: "Unauthorized",
    forbidden: "Forbidden",
    validationError: "Validation error",
    dataLoadFailed: "Failed to load data",
    saveFailed: "Failed to save",
    deleteFailed: "Failed to delete",
    
    // Success messages
    dataSaved: "Data saved successfully",
    dataDeleted: "Data deleted successfully",
    dataUpdated: "Data updated successfully",
    operationSuccessful: "Operation completed successfully",
    
    // Time and dates
    today: "Today",
    tomorrow: "Tomorrow",
    yesterday: "Yesterday",
    thisWeek: "This Week",
    thisMonth: "This Month",
    thisYear: "This Year",
    
    // Astrological terms
    lagna: "Lagna",
    rashi: "Rashi",
    graha: "Graha",
    nakshatra: "Nakshatra",
    tithi: "Tithi",
    yoga: "Yoga",
    karana: "Karana",
    mahaDasha: "Maha Dasha",
    antarDasha: "Antar Dasha",
    pratyantarDasha: "Pratyantar Dasha",
    sookshmaDasha: "Sookshma Dasha",
    pranDasha: "Pran Dasha",
    
    // House meanings
    house1: "Self/Personality",
    house2: "Wealth/Family",
    house3: "Siblings/Communication",
    house4: "Home/Mother",
    house5: "Children/Creativity",
    house6: "Health/Service",
    house7: "Marriage/Partnership",
    house8: "Transformation/Shared Resources",
    house9: "Philosophy/Father",
    house10: "Career/Authority",
    house11: "Gains/Friends",
    house12: "Spirituality/Losses",
    
    // Planet names
    sun: "Sun",
    moon: "Moon",
    mars: "Mars",
    mercury: "Mercury",
    jupiter: "Jupiter",
    venus: "Venus",
    saturn: "Saturn",
    rahu: "Rahu",
    ketu: "Ketu",
    
    // Zodiac signs
    aries: "Aries",
    taurus: "Taurus",
    gemini: "Gemini",
    cancer: "Cancer",
    leo: "Leo",
    virgo: "Virgo",
    libra: "Libra",
    scorpio: "Scorpio",
    sagittarius: "Sagittarius",
    capricorn: "Capricorn",
    aquarius: "Aquarius",
    pisces: "Pisces",
  },
  
  ne: {
    // Common UI
    welcome: "ZSTRO AI मा स्वागत छ",
    signIn: "साइन इन",
    signOut: "साइन आउट",
    loading: "लोड हुँदैछ...",
    error: "त्रुटि",
    success: "सफलता",
    cancel: "रद्द गर्नुहोस्",
    save: "बचत गर्नुहोस्",
    edit: "सम्पादन गर्नुहोस्",
    delete: "मेटाउनुहोस्",
    close: "बन्द गर्नुहोस्",
    next: "अर्को",
    previous: "अघिल्लो",
    submit: "पेश गर्नुहोस्",
    reset: "रिसेट गर्नुहोस्",
    search: "खोज्नुहोस्",
    filter: "फिल्टर",
    sort: "क्रम",
    refresh: "ताजा पार्नुहोस्",
    back: "फिर्ता",
    home: "घर",
    profile: "प्रोफाइल",
    settings: "सेटिङ",
    help: "मद्दत",
    about: "बारेमा",
    contact: "सम्पर्क",
    
    // Navigation
    dashboard: "ड्यासबोर्ड",
    astrology: "ज्योतिष",
    kundali: "कुण्डली",
    horoscope: "राशिफल",
    dasha: "दशा",
    compatibility: "मेल",
    remedies: "उपाय",
    chat: "च्याट",
    history: "इतिहास",
    reports: "रिपोर्ट",
    
    // Astrology specific
    birthDetails: "जन्म विवरण",
    birthDate: "जन्म मिति",
    birthTime: "जन्म समय",
    birthPlace: "जन्म स्थान",
    latitude: "अक्षांश",
    longitude: "देशान्तर",
    timezone: "समय क्षेत्र",
    gender: "लिङ्ग",
    male: "पुरुष",
    female: "महिला",
    other: "अन्य",
    
    // Astro Cards
    ascendant: "लग्न",
    moonSign: "चन्द्र राशि",
    sunSign: "सूर्य राशि",
    currentDasha: "वर्तमान दशा",
    transitHighlights: "गोचरका मुख्य बुँदा",
    todayTips: "आजका सुझाव",
    lucky: "भाग्यशाली",
    focus: "फोकस",
    generateKundali: "कुण्डली बनाउनुहोस्",
    viewChart: "चार्ट हेर्नुहोस्",
    downloadReport: "रिपोर्ट डाउनलोड",
    
    // Chat
    askQuestion: "प्रश्न सोध्नुहोस्",
    sendMessage: "सन्देश पठाउनुहोस्",
    typeMessage: "सन्देश टाइप गर्नुहोस्...",
    chatHistory: "च्याट इतिहास",
    newChat: "नयाँ च्याट",
    clearChat: "च्याट सफा गर्नुहोस्",
    
    // Forms
    required: "यो फिल्ड आवश्यक छ",
    invalid: "अवैध मान",
    selectOption: "विकल्प छान्नुहोस्",
    enterValue: "मान प्रविष्ट गर्नुहोस्",
    chooseFile: "फाइल छान्नुहोस्",
    uploadFile: "फाइल अपलोड गर्नुहोस्",
    
    // Errors
    somethingWentWrong: "केही गलत भयो",
    networkError: "नेटवर्क त्रुटि",
    serverError: "सर्भर त्रुटि",
    notFound: "भेटिएन",
    unauthorized: "अनधिकृत",
    forbidden: "निषेधित",
    validationError: "प्रमाणीकरण त्रुटि",
    dataLoadFailed: "डेटा लोड गर्न असफल",
    saveFailed: "बचत गर्न असफल",
    deleteFailed: "मेटाउन असफल",
    
    // Success messages
    dataSaved: "डेटा सफलतापूर्वक बचत भयो",
    dataDeleted: "डेटा सफलतापूर्वक मेटाइयो",
    dataUpdated: "डेटा सफलतापूर्वक अपडेट भयो",
    operationSuccessful: "अपरेशन सफलतापूर्वक पूरा भयो",
    
    // Time and dates
    today: "आज",
    tomorrow: "भोली",
    yesterday: "हिजो",
    thisWeek: "यो हप्ता",
    thisMonth: "यो महिना",
    thisYear: "यो वर्ष",
    
    // Astrological terms
    lagna: "लग्न",
    rashi: "राशि",
    graha: "ग्रह",
    nakshatra: "नक्षत्र",
    tithi: "तिथि",
    yoga: "योग",
    karana: "करण",
    mahaDasha: "महादशा",
    antarDasha: "अन्तरदशा",
    pratyantarDasha: "प्रत्यन्तरदशा",
    sookshmaDasha: "सूक्ष्मदशा",
    pranDasha: "प्राणदशा",
    
    // House meanings
    house1: "आत्मा/व्यक्तित्व",
    house2: "धन/परिवार",
    house3: "भाइबहिनी/संचार",
    house4: "घर/आमा",
    house5: "सन्तान/सृजनशीलता",
    house6: "स्वास्थ्य/सेवा",
    house7: "विवाह/साझेदारी",
    house8: "परिवर्तन/साझा संसाधन",
    house9: "दर्शन/बुबा",
    house10: "कर्म/प्रतिष्ठा",
    house11: "लाभ/मित्र",
    house12: "आध्यात्मिकता/हानि",
    
    // Planet names
    sun: "सूर्य",
    moon: "चन्द्र",
    mars: "मङ्गल",
    mercury: "बुध",
    jupiter: "बृहस्पति",
    venus: "शुक्र",
    saturn: "शनि",
    rahu: "राहु",
    ketu: "केतु",
    
    // Zodiac signs
    aries: "मेष",
    taurus: "वृष",
    gemini: "मिथुन",
    cancer: "कर्क",
    leo: "सिंह",
    virgo: "कन्या",
    libra: "तुला",
    scorpio: "वृश्चिक",
    sagittarius: "धनु",
    capricorn: "मकर",
    aquarius: "कुम्भ",
    pisces: "मीन",
  },
  
  hi: {
    // Common UI
    welcome: "ZSTRO AI में आपका स्वागत है",
    signIn: "साइन इन",
    signOut: "साइन आउट",
    loading: "लोड हो रहा है...",
    error: "त्रुटि",
    success: "सफलता",
    cancel: "रद्द करें",
    save: "सेव करें",
    edit: "एडिट करें",
    delete: "डिलीट करें",
    close: "बंद करें",
    next: "अगला",
    previous: "पिछला",
    submit: "सबमिट करें",
    reset: "रीसेट करें",
    search: "खोजें",
    filter: "फिल्टर",
    sort: "सॉर्ट",
    refresh: "रिफ्रेश करें",
    back: "वापस",
    home: "होम",
    profile: "प्रोफाइल",
    settings: "सेटिंग्स",
    help: "हेल्प",
    about: "अबाउट",
    contact: "कॉन्टैक्ट",
    
    // Navigation
    dashboard: "डैशबोर्ड",
    astrology: "ज्योतिष",
    kundali: "कुंडली",
    horoscope: "राशिफल",
    dasha: "दशा",
    compatibility: "मेल",
    remedies: "उपाय",
    chat: "चैट",
    history: "हिस्ट्री",
    reports: "रिपोर्ट्स",
    
    // Astrology specific
    birthDetails: "जन्म विवरण",
    birthDate: "जन्म तिथि",
    birthTime: "जन्म समय",
    birthPlace: "जन्म स्थान",
    latitude: "अक्षांश",
    longitude: "देशांतर",
    timezone: "टाइमजोन",
    gender: "लिंग",
    male: "पुरुष",
    female: "महिला",
    other: "अन्य",
    
    // Astro Cards
    ascendant: "लग्न",
    moonSign: "चंद्र राशि",
    sunSign: "सूर्य राशि",
    currentDasha: "वर्तमान दशा",
    transitHighlights: "गोचर के मुख्य बिंदु",
    todayTips: "आज के सुझाव",
    lucky: "भाग्यशाली",
    focus: "फोकस",
    generateKundali: "कुंडली बनाएं",
    viewChart: "चार्ट देखें",
    downloadReport: "रिपोर्ट डाउनलोड करें",
    
    // Chat
    askQuestion: "प्रश्न पूछें",
    sendMessage: "मैसेज भेजें",
    typeMessage: "मैसेज टाइप करें...",
    chatHistory: "चैट हिस्ट्री",
    newChat: "नई चैट",
    clearChat: "चैट क्लियर करें",
    
    // Forms
    required: "यह फील्ड आवश्यक है",
    invalid: "अमान्य मान",
    selectOption: "विकल्प चुनें",
    enterValue: "मान दर्ज करें",
    chooseFile: "फाइल चुनें",
    uploadFile: "फाइल अपलोड करें",
    
    // Errors
    somethingWentWrong: "कुछ गलत हुआ",
    networkError: "नेटवर्क त्रुटि",
    serverError: "सर्वर त्रुटि",
    notFound: "नहीं मिला",
    unauthorized: "अनधिकृत",
    forbidden: "निषेधित",
    validationError: "वैलिडेशन त्रुटि",
    dataLoadFailed: "डेटा लोड करने में असफल",
    saveFailed: "सेव करने में असफल",
    deleteFailed: "डिलीट करने में असफल",
    
    // Success messages
    dataSaved: "डेटा सफलतापूर्वक सेव हुआ",
    dataDeleted: "डेटा सफलतापूर्वक डिलीट हुआ",
    dataUpdated: "डेटा सफलतापूर्वक अपडेट हुआ",
    operationSuccessful: "ऑपरेशन सफलतापूर्वक पूरा हुआ",
    
    // Time and dates
    today: "आज",
    tomorrow: "कल",
    yesterday: "कल",
    thisWeek: "इस सप्ताह",
    thisMonth: "इस महीने",
    thisYear: "इस साल",
    
    // Astrological terms
    lagna: "लग्न",
    rashi: "राशि",
    graha: "ग्रह",
    nakshatra: "नक्षत्र",
    tithi: "तिथि",
    yoga: "योग",
    karana: "करण",
    mahaDasha: "महादशा",
    antarDasha: "अंतरदशा",
    pratyantarDasha: "प्रत्यंतरदशा",
    sookshmaDasha: "सूक्ष्मदशा",
    pranDasha: "प्राणदशा",
    
    // House meanings
    house1: "आत्मा/व्यक्तित्व",
    house2: "धन/परिवार",
    house3: "भाई-बहन/संचार",
    house4: "घर/मां",
    house5: "संतान/रचनात्मकता",
    house6: "स्वास्थ्य/सेवा",
    house7: "विवाह/साझेदारी",
    house8: "परिवर्तन/साझा संसाधन",
    house9: "दर्शन/पिता",
    house10: "कर्म/प्रतिष्ठा",
    house11: "लाभ/मित्र",
    house12: "आध्यात्मिकता/हानि",
    
    // Planet names
    sun: "सूर्य",
    moon: "चंद्र",
    mars: "मंगल",
    mercury: "बुध",
    jupiter: "बृहस्पति",
    venus: "शुक्र",
    saturn: "शनि",
    rahu: "राहु",
    ketu: "केतु",
    
    // Zodiac signs
    aries: "मेष",
    taurus: "वृष",
    gemini: "मिथुन",
    cancer: "कर्क",
    leo: "सिंह",
    virgo: "कन्या",
    libra: "तुला",
    scorpio: "वृश्चिक",
    sagittarius: "धनु",
    capricorn: "मकर",
    aquarius: "कुंभ",
    pisces: "मीन",
  },
};

// Language detection utility
export function detectLanguage(text?: string | null): SupportedLanguage {
  if (!text) return 'ne';
  
  // Check for Devanagari script
  const hasDevanagari = /[\u0900-\u097F]/.test(text);
  if (!hasDevanagari) return 'en';
  
  // Hindi common words (fallback is Nepali)
  const hiHints = /(हूँ|है|हो|करना|कब|कौन|क्यों|लेकिन|सकता|सकती|यदि|तुम|आप)/;
  return hiHints.test(text) ? 'hi' : 'ne';
}

// Get translation function
export function getTranslation(lang: SupportedLanguage, key: keyof TranslationKeys): string {
  return translations[lang]?.[key] || translations['en'][key] || key;
}

// Get all translations for a language
export function getTranslations(lang: SupportedLanguage): TranslationKeys {
  return translations[lang] || translations['en'];
}

// Language switcher options
export const languageOptions = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ne', name: 'नेपाली', flag: '🇳🇵' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
] as const;

// Default language
export const defaultLanguage: SupportedLanguage = 'ne';

// Language validation
export function isValidLanguage(lang: string): lang is SupportedLanguage {
  return ['en', 'ne', 'hi'].includes(lang);
}
