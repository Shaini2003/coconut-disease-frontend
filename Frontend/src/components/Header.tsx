// Frontend/src/components/Header.tsx
import { Leaf, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from '../i18n';

interface HeaderProps {
  currentPage: string;
  onNavigate:  (page: string) => void;
  onLogout:    () => void;
}

export default function Header({ currentPage, onNavigate, onLogout }: HeaderProps) {
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home',        label: t.nav.home },
    { id: 'detect',      label: t.nav.detect },
    { id: 'history',     label: t.nav.history },
    { id: 'diseases',    label: t.nav.diseases },
    { id: 'chatbot',     label: t.nav.chatbot },
    { id: 'progression', label: 'Progression' }, // 🔥 ADDED
    { id: 'about',       label: t.nav.about },
  ];

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate('home')}>
            <div className="bg-green-600 p-2 rounded-lg"><Leaf className="h-6 w-6 text-white" /></div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">CocoAI</h1>
              <p className="text-xs text-gray-500">Disease Detection</p>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <button key={item.id} onClick={() => onNavigate(item.id)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  currentPage === item.id ? 'bg-green-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}>
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher />
            <button onClick={onLogout}
              className="flex items-center space-x-1 px-4 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-700 border border-red-200 transition-colors">
              <LogOut className="h-4 w-4" /><span>{t.nav.logout}</span>
            </button>
          </div>

          <button className="md:hidden p-2 rounded-lg hover:bg-gray-100" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-6 w-6 text-gray-700" /> : <Menu className="h-6 w-6 text-gray-700" />}
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t space-y-1">
            <div className="px-4 pb-3 border-b border-gray-100"><LanguageSwitcher /></div>
            {navItems.map((item) => (
              <button key={item.id} onClick={() => { onNavigate(item.id); setMobileMenuOpen(false); }}
                className={`block w-full text-left px-4 py-3 text-sm font-medium transition-colors ${
                  currentPage === item.id ? 'bg-green-50 text-green-700 border-l-4 border-green-600' : 'text-gray-700 hover:bg-gray-50'
                }`}>
                {item.label}
              </button>
            ))}
            <button onClick={() => { onLogout(); setMobileMenuOpen(false); }}
              className="flex items-center space-x-2 w-full text-left px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 border-l-4 border-transparent hover:border-red-400 transition-colors">
              <LogOut className="h-4 w-4" /><span>{t.nav.logout}</span>
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}