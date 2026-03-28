// Frontend/src/components/Footer.tsx
// No changes needed — your existing Footer is already correct.
// Copy this file as-is to Frontend/src/components/Footer.tsx

import { Leaf, Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-green-600 p-2 rounded-lg">
                <Leaf className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">CocoAI</h3>
                <p className="text-xs text-gray-400">Disease Detection System</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed">
              Advanced AI-powered early detection system for coconut leaf and tree diseases in Sri Lanka.
              Empowering farmers with explainable predictions.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-green-400 transition-colors">How It Works</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">Disease Library</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">Research Paper</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">FAQ</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 mt-1 text-green-400 flex-shrink-0" />
                <span>Department of Agricultural Technology, Sri Lanka</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-green-400 flex-shrink-0" />
                <span>support@cocoai.lk</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-green-400 flex-shrink-0" />
                <span>+94 11 234 5678</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
          <p>&copy; {new Date().getFullYear()} CocoAI Disease Detection System. All rights reserved.</p>
          <p className="mt-2 text-gray-500">
            Developed for coconut farmers and agricultural officers in Sri Lanka
          </p>
        </div>
      </div>
    </footer>
  );
}