"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { translations } from "../lib/translations";

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [appLanguage, setAppLanguage] = useState("English");

  useEffect(() => {
    const savedLanguage = localStorage.getItem("appLanguage");
    if (savedLanguage) {
      setAppLanguage(savedLanguage);
    }
  }, []);

  const changeLanguage = (lang) => {
    setAppLanguage(lang);
    localStorage.setItem("appLanguage", lang);
  };

  const t = (key) => {
    const dict = translations[appLanguage] || translations["English"];
    return dict[key] || translations["English"][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ appLanguage, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
