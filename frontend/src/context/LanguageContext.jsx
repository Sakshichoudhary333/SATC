import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { translations } from '../i18n/translations';

const STORAGE_KEY = 'tms_language';

const LanguageContext = createContext(null);

const getNestedValue = (obj, key) =>
  key.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved && translations[saved] ? saved : 'en';
  });

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const changeLanguage = useCallback((code) => {
    if (!translations[code]) return;
    setLanguage(code);
    localStorage.setItem(STORAGE_KEY, code);
    document.documentElement.lang = code;
  }, []);

  const t = useCallback(
    (key) => {
      const value = getNestedValue(translations[language], key);
      if (value !== undefined) return value;
      const fallback = getNestedValue(translations.en, key);
      return fallback !== undefined ? fallback : key;
    },
    [language]
  );

  const value = useMemo(
    () => ({ language, changeLanguage, t }),
    [language, changeLanguage, t]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};
