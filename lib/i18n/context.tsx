// lib/i18n/context.tsx
// Language Context Provider for ZSTRO AI

'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { SupportedLanguage, getTranslation, getTranslations, detectLanguage, defaultLanguage, isValidLanguage } from './index';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: keyof import('./index').TranslationKeys) => string;
  translations: import('./index').TranslationKeys;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: React.ReactNode;
  initialLanguage?: SupportedLanguage;
}

export function LanguageProvider({ children, initialLanguage }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<SupportedLanguage>(initialLanguage || defaultLanguage);
  const [isLoading, setIsLoading] = useState(true);

  // Load language from localStorage on mount
  useEffect(() => {
    const loadLanguage = () => {
      try {
        const stored = localStorage.getItem('zstro_lang');
        if (stored && isValidLanguage(stored)) {
          setLanguageState(stored);
        } else {
          // Try to detect from browser language
          const browserLang = navigator.language.split('-')[0];
          if (isValidLanguage(browserLang)) {
            setLanguageState(browserLang);
          }
        }
      } catch (error) {
        console.warn('Failed to load language from localStorage:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLanguage();
  }, []);

  // Set language and persist to localStorage
  const setLanguage = useCallback((lang: SupportedLanguage) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('zstro_lang', lang);
    } catch (error) {
      console.warn('Failed to save language to localStorage:', error);
    }
  }, []);

  // Translation function
  const t = useCallback((key: keyof import('./index').TranslationKeys) => {
    return getTranslation(language, key);
  }, [language]);

  // Get all translations for current language
  const translations = getTranslations(language);

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
    translations,
    isLoading,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

// Hook to use language context
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Hook for translations only
export function useTranslations() {
  const { t, translations } = useLanguage();
  return { t, translations };
}

// Hook for language switching
export function useLanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  return { language, setLanguage };
}
