"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

type Lang = "en" | "hi" | "ne";

const LangContext = createContext({
  lang: "en" as Lang,
  setLang: (lang: Lang) => {}
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  
  const value = { lang, setLang };
  
  return React.createElement(LangContext.Provider, { value }, children);
}

export const useLang = () => useContext(LangContext);