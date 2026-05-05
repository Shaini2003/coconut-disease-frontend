// Frontend/src/i18n/index.ts
// Complete i18n system — English + Sinhala
import { createContext, useContext } from 'react';
import en from './locales/en';
import si from './locales/si';

export type Language = 'en' | 'si';
export type Translations = typeof en;
export const translations = { en, si };

export interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

export const I18nContext = createContext<I18nContextType>({
  language: 'en',
  setLanguage: () => {},
  t: en,
});

export const useTranslation = () => useContext(I18nContext);