// Frontend/src/components/LanguageSwitcher.tsx
import { useTranslation } from '../i18n';

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useTranslation();
  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
      <button
        onClick={() => setLanguage('en')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
          language === 'en'
            ? 'bg-white text-green-700 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        <span>🇬🇧</span> {t.language.english}
      </button>
      <button
        onClick={() => setLanguage('si')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
          language === 'si'
            ? 'bg-white text-green-700 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        <span>🇱🇰</span> {t.language.sinhala}
      </button>
    </div>
  );
}