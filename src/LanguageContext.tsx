import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, TRANSLATIONS, Translations } from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('agriconnect_lang');
    if (saved === 'te' || saved === 'en') return saved;

    const storedFarmer = localStorage.getItem('agriconnect_farmer');
    if (storedFarmer) {
      try {
        const farmerObj = JSON.parse(storedFarmer);
        if (farmerObj?.preferredLanguage === 'te' || farmerObj?.preferredLanguage === 'en') {
          return farmerObj.preferredLanguage;
        }
      } catch (e) {
        // ignore JSON parse errors
      }
    }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('agriconnect_lang', lang);

    const storedFarmer = localStorage.getItem('agriconnect_farmer');
    if (storedFarmer) {
      try {
        const farmerObj = JSON.parse(storedFarmer);
        farmerObj.preferredLanguage = lang;
        localStorage.setItem('agriconnect_farmer', JSON.stringify(farmerObj));
      } catch (e) {
        // ignore
      }
    }
  };

  const t = TRANSLATIONS[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageSelectorProps {
  className?: string;
  theme?: 'light' | 'dark';
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ className = '', theme = 'dark' }) => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className={`inline-flex items-center rounded-xl p-1 border shadow-sm backdrop-blur-md transition-all ${
      theme === 'dark' 
        ? 'bg-slate-900/90 border-slate-700/80 text-slate-200' 
        : 'bg-white/95 border-emerald-600/30 text-emerald-950 shadow-emerald-900/5'
    } ${className}`}>
      <span className="text-[10px] font-bold uppercase tracking-wider px-2 flex items-center gap-1.5 opacity-80 border-r border-slate-700/40 mr-1 py-0.5">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
        <span className="hidden sm:inline">Lang</span>
      </span>
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={() => setLanguage('en')}
          className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            language === 'en'
              ? 'bg-emerald-600 text-white shadow-md'
              : theme === 'dark'
                ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                : 'text-emerald-800 hover:text-emerald-950 hover:bg-emerald-50'
          }`}
          title="Switch to English"
        >
          English
        </button>
        <button
          type="button"
          onClick={() => setLanguage('te')}
          className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            language === 'te'
              ? 'bg-emerald-600 text-white shadow-md'
              : theme === 'dark'
                ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                : 'text-emerald-800 hover:text-emerald-950 hover:bg-emerald-50'
          }`}
          title="తెలుగు భాషకు మారండి"
        >
          తెలుగు
        </button>
      </div>
    </div>
  );
};
