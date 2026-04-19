// Frontend/src/i18n/I18nProvider.tsx
import { ReactNode, useState } from 'react';
import { I18nContext, Language, translations } from './index';

export default function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('cocoai_lang');
    return saved === 'si' ? 'si' : 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('cocoai_lang', lang);
    document.documentElement.lang = lang;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      {children}
    </I18nContext.Provider>
  );
}