// lib/utils/i18n.ts
// Internationalization utilities for Nepali/English

export type Lang = "ne" | "en";

export interface I18nStrings {
  // Common UI
  loading: string;
  error: string;
  retry: string;
  success: string;
  cancel: string;
  save: string;
  delete: string;
  edit: string;
  close: string;
  
  // Error messages
  dataLoadFailed: string;
  fileFormatNotSupported: string;
  fileScanFailed: string;
  networkError: string;
  validationError: string;
  rateLimitExceeded: string;
  
  // Fetching states
  fetchingData: string;
  cardsUpdated: string;
  analysisRetried: string;
  
  // Upload messages
  uploadSuccess: string;
  uploadFailed: string;
  fileTooLarge: string;
  invalidFileType: string;
  
  // Astrology specific
  analyzingChart: string;
  generatingReport: string;
  savingAnalysis: string;
  
  // Theme
  lightMode: string;
  darkMode: string;
  toggleTheme: string;
  
  // Notifications
  notifications: string;
  notificationsNotSupported: string;
  subscriptionSuccess: string;
  subscriptionSuccessMessage: string;
  subscriptionFailed: string;
  subscriptionError: string;
  unsubscribeError: string;
  permissionDenied: string;
  notificationStatus: string;
  subscribed: string;
  notSubscribed: string;
  enableNotifications: string;
  disableNotifications: string;
  subscribeToNotifications: string;
  notificationInfo: string;
}

export const strings: Record<Lang, I18nStrings> = {
  en: {
    loading: "Loading...",
    error: "Error",
    retry: "Retry",
    success: "Success",
    cancel: "Cancel",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    close: "Close",
    
    dataLoadFailed: "Failed to load data. Please try again.",
    fileFormatNotSupported: "File format not supported.",
    fileScanFailed: "File scan failed or unsupported format.",
    networkError: "Network error. Please check your connection.",
    validationError: "Invalid input. Please check your data.",
    rateLimitExceeded: "Too many requests. Please wait a moment.",
    
    fetchingData: "Fetching required data...",
    cardsUpdated: "Cards updated. Analysis retried.",
    analysisRetried: "Analysis completed with updated data.",
    
    uploadSuccess: "File uploaded successfully",
    uploadFailed: "Upload failed",
    fileTooLarge: "File too large (max 20MB)",
    invalidFileType: "Invalid file type",
    
    analyzingChart: "Analyzing your chart...",
    generatingReport: "Generating report...",
    savingAnalysis: "Saving analysis...",
    
    lightMode: "Light Mode",
    darkMode: "Dark Mode",
    toggleTheme: "Toggle theme",
    
    notifications: "Notifications",
    notificationsNotSupported: "Notifications are not supported in this browser.",
    subscriptionSuccess: "Successfully Subscribed!",
    subscriptionSuccessMessage: "You will now receive astrology notifications.",
    subscriptionFailed: "Failed to subscribe to notifications.",
    subscriptionError: "An error occurred while subscribing.",
    unsubscribeError: "An error occurred while unsubscribing.",
    permissionDenied: "Notification permission was denied.",
    notificationStatus: "Notification Status",
    subscribed: "Subscribed",
    notSubscribed: "Not Subscribed",
    enableNotifications: "Enable Notifications",
    disableNotifications: "Disable Notifications",
    subscribeToNotifications: "Subscribe to Notifications",
    notificationInfo: "Get notified about new analysis results, messages, and important updates."
  },
  ne: {
    loading: "लोड हुँदै...",
    error: "त्रुटि",
    retry: "पुन: प्रयास",
    success: "सफल",
    cancel: "रद्द",
    save: "बचत",
    delete: "मेटाउनुहोस्",
    edit: "सम्पादन",
    close: "बन्द",
    
    dataLoadFailed: "डेटा ल्याउन असफल। कृपया पुन: प्रयास गर्नुहोस्।",
    fileFormatNotSupported: "फाइल फर्म्याट सपोर्ट भएन।",
    fileScanFailed: "फाइल स्क्यान असफल भयो वा असमर्थित फर्म्याट।",
    networkError: "नेटवर्क त्रुटि। कृपया आफ्नो कनेक्शन जाँच गर्नुहोस्।",
    validationError: "अवैध इनपुट। कृपया आफ्नो डेटा जाँच गर्नुहोस्।",
    rateLimitExceeded: "धेरै अनुरोधहरू। कृपया केही क्षण प्रतीक्षा गर्नुहोस्।",
    
    fetchingData: "कार्डमा आवश्यक विवरण छैन — थप डेटा ल्याउँदै…",
    cardsUpdated: "कार्ड अपडेट भयो। विश्लेषण पुनः भयो।",
    analysisRetried: "अपडेट गरिएको डेटासँग विश्लेषण पूरा भयो।",
    
    uploadSuccess: "फाइल सफलतापूर्वक अपलोड भयो",
    uploadFailed: "अपलोड असफल",
    fileTooLarge: "फाइल धेरै ठूलो छ (अधिकतम २०MB)",
    invalidFileType: "अवैध फाइल प्रकार",
    
    analyzingChart: "तपाईंको कुण्डली विश्लेषण गर्दै...",
    generatingReport: "रिपोर्ट तयार गर्दै...",
    savingAnalysis: "विश्लेषण बचत गर्दै...",
    
    lightMode: "प्रकाश मोड",
    darkMode: "अँध्यारो मोड",
    toggleTheme: "थीम बदल्नुहोस्",
    
    notifications: "सूचनाहरू",
    notificationsNotSupported: "यो ब्राउजरमा सूचनाहरू समर्थित छैन।",
    subscriptionSuccess: "सफलतापूर्वक सदस्यता लिइएको!",
    subscriptionSuccessMessage: "तपाईंले अब ज्योतिष सूचनाहरू प्राप्त गर्नुहुनेछ।",
    subscriptionFailed: "सूचना सदस्यतामा असफल।",
    subscriptionError: "सदस्यता लिँदै गर्दा त्रुटि भयो।",
    unsubscribeError: "सदस्यता रद्द गर्दै गर्दा त्रुटि भयो।",
    permissionDenied: "सूचना अनुमति अस्वीकार गरियो।",
    notificationStatus: "सूचना स्थिति",
    subscribed: "सदस्यता लिइएको",
    notSubscribed: "सदस्यता लिइएको छैन",
    enableNotifications: "सूचना सक्षम गर्नुहोस्",
    disableNotifications: "सूचना अक्षम गर्नुहोस्",
    subscribeToNotifications: "सूचनामा सदस्यता लिनुहोस्",
    notificationInfo: "नयाँ विश्लेषण परिणाम, सन्देशहरू र महत्वपूर्ण अपडेटहरूको बारेमा सूचित हुनुहोस्।"
  }
};

export function getString(key: keyof I18nStrings, lang: Lang): string {
  return strings[lang][key];
}

export function getStrings(lang: Lang): I18nStrings {
  return strings[lang];
}
