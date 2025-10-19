"use client";
import { createContext, useContext, useState, ReactNode } from "react";

export type Lang = "en"|"hi"|"ne";

const Ctx = createContext<{lang:Lang; setLang:(v:Lang)=>void}>({lang:"en", setLang:()=>{}});

export function LangProvider({children}:{children:ReactNode}){ 
  const [lang,setLang]=useState<Lang>("en"); 
  return <Ctx.Provider value={{lang,setLang}}>{children}</Ctx.Provider>; 
}

export const useLang = ()=>useContext(Ctx);