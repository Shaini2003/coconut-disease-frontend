// Frontend/src/components/LanguageSwitcher.tsx
import { useTranslation } from '../i18n';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useTranslation();
  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => setLanguage('en')}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
          language === 'en' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        🇬🇧 EN
      </button>
      <button
        onClick={() => setLanguage('si')}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
          language === 'si' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        🇱🇰 සිං
      </button>
    </div>
  );
}