// Frontend/src/components/Header.tsx

import { Leaf, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  currentPage: string;
  onNavigate:  (page: string) => void;
  onLogout:    () => void;
}

export default function Header({ currentPage, onNavigate, onLogout }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home',     label: 'Home'            },
    { id: 'detect',   label: 'Detect Disease'  },
    { id: 'history',  label: 'History'         },
    { id: 'diseases', label: 'Disease Library' },
    { id: 'chatbot',  label: 'AI Assistant'    }, // ← NEW
    { id: 'about',    label: 'About'           },
  ];

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => onNavigate('home')}
          >
            <div className="bg-green-600 p-2 rounded-lg">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">CocoAI</h1>
              <p className="text-xs text-gray-500">Disease Detection</p>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === item.id
                    ? 'bg-green-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </button>
            ))}

            {/* Logout */}
            <button
              onClick={onLogout}
              className="ml-2 flex items-center space-x-1 px-4 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-700 border border-red-200 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </nav>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen
              ? <X    className="h-6 w-6 text-gray-700" />
              : <Menu className="h-6 w-6 text-gray-700" />}
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { onNavigate(item.id); setMobileMenuOpen(false); }}
                className={`block w-full text-left px-4 py-3 text-sm font-medium transition-colors ${
                  currentPage === item.id
                    ? 'bg-green-50 text-green-700 border-l-4 border-green-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </button>
            ))}

            {/* Logout - mobile */}
            <button
              onClick={() => { onLogout(); setMobileMenuOpen(false); }}
              className="flex items-center space-x-2 w-full text-left px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 border-l-4 border-transparent hover:border-red-400 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}