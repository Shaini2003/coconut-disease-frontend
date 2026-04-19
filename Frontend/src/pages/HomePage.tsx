// Frontend/src/pages/HomePage.tsx
import { ArrowRight, Brain, Eye, Leaf, Lightbulb, MapPin, Shield, Zap } from 'lucide-react';
import { useTranslation } from '../i18n';

interface HomePageProps { onNavigate: (page: string) => void; }

export default function HomePage({ onNavigate }: HomePageProps) {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">

      {/* Hero */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-6">
                <Leaf className="h-4 w-4 mr-2" />{t.home.badge}
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                {t.home.title1}<span className="text-green-600"> {t.home.title2}</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">{t.home.description}</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={() => onNavigate('detect')}
                  className="flex items-center justify-center px-8 py-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl">
                  {t.home.startButton}<ArrowRight className="ml-2 h-5 w-5" />
                </button>
                <button onClick={() => onNavigate('diseases')}
                  className="flex items-center justify-center px-8 py-4 bg-white text-gray-700 border-2 border-gray-300 rounded-lg font-semibold hover:border-green-600 hover:text-green-600 transition-colors">
                  {t.home.learnButton}
                </button>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://parachutekalpavriksha.org/cdn/shop/articles/Sure_ways_to_keep_the_coconut_tree_healthy.jpg?v=1711267599&width=2048"
                alt="Coconut plantation" className="rounded-2xl shadow-2xl" />
              <div className="absolute -bottom-6 -right-6 w-64 h-64 bg-green-200 rounded-full opacity-20 blur-3xl"></div>
              <div className="absolute -top-6 -left-6 w-64 h-64 bg-green-300 rounded-full opacity-20 blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t.home.features.title}</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">{t.home.features.subtitle}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <Zap className="h-6 w-6 text-white" />, ...t.home.features.instant },
              { icon: <Eye className="h-6 w-6 text-white" />, ...t.home.features.visual },
              { icon: <Brain className="h-6 w-6 text-white" />, ...t.home.features.accurate },
              { icon: <Lightbulb className="h-6 w-6 text-white" />, ...t.home.features.guidance },
            ].map((f) => (
              <div key={f.title} className="bg-green-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="bg-green-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">{f.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats banner */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-8 md:p-12 text-white">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">{t.home.targeted.title}</h2>
                <p className="text-green-50 text-lg mb-6">{t.home.targeted.subtitle}</p>
                <div className="flex items-start space-x-3 mb-4">
                  <MapPin className="h-6 w-6 text-green-200 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">{t.home.targeted.local.title}</h4>
                    <p className="text-green-50 text-sm">{t.home.targeted.local.desc}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Shield className="h-6 w-6 text-green-200 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">{t.home.targeted.research.title}</h4>
                    <p className="text-green-50 text-sm">{t.home.targeted.research.desc}</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { val: '8+',   label: t.home.stats.diseases    },
                  { val: '90%+', label: t.home.stats.accuracy    },
                  { val: '<5s',  label: t.home.stats.speed       },
                  { val: '100%', label: t.home.stats.explainable },
                ].map((s) => (
                  <div key={s.label} className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
                    <div className="text-4xl font-bold mb-2">{s.val}</div>
                    <div className="text-green-50 text-sm">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t.home.howItWorks.title}</h2>
            <p className="text-lg text-gray-600">{t.home.howItWorks.subtitle}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[t.home.howItWorks.step1, t.home.howItWorks.step2, t.home.howItWorks.step3].map((step, i) => (
              <div key={i} className="text-center">
                <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-md">
                  <span className="text-2xl font-bold text-green-600">{i + 1}</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <button onClick={() => onNavigate('detect')}
              className="inline-flex items-center px-8 py-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl">
              {t.home.howItWorks.tryButton}<ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}