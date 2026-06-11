// Frontend/src/components/Footer.tsx
import { Leaf, Mail, MapPin, Phone } from 'lucide-react';
import { useTranslation } from '../i18n';

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-green-600 p-2 rounded-lg"><Leaf className="h-5 w-5 text-white" /></div>
              <div>
                <h3 className="text-white font-bold text-lg">CocoAI</h3>
                <p className="text-xs text-gray-400">Disease Detection System</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed">{t.footer.tagline}</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">{t.footer.quickLinks}</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-green-400 transition-colors">{t.footer.howItWorks}</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">{t.footer.diseaseLib}</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">{t.footer.research}</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">{t.footer.faq}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">{t.footer.contact}</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 mt-1 text-green-400 flex-shrink-0" />
                <span>{t.footer.location}</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-green-400 flex-shrink-0" />
                <span>{t.footer.email}</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-green-400 flex-shrink-0" />
                <span>{t.footer.phone}</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
          <p>&copy; {new Date().getFullYear()} {t.footer.copyright}</p>
          <p className="mt-2 text-gray-500">{t.footer.developed}</p>
        </div>
      </div>
    </footer>
  );
}