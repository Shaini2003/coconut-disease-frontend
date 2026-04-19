// Frontend/src/pages/AboutPage.tsx
import { Award, BookOpen, Brain, Target, Users } from 'lucide-react';
import { useTranslation } from '../i18n';

export default function AboutPage() {
  const { t } = useTranslation();
  const regions = ['Kurunegala / කුරුණෑගල', 'Puttalam / පුත්තලම', 'Matale / මාතලේ', 'Gampaha / ගම්පහ', 'Galle / ගාල්ල', 'Colombo / කොළඹ'];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{t.about.title}</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">{t.about.subtitle}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t.about.mission.title}</h2>
              <p className="text-gray-700 leading-relaxed mb-6">{t.about.mission.text1}</p>
              <p className="text-gray-700 leading-relaxed">{t.about.mission.text2}</p>
            </div>
            <div className="bg-green-50 rounded-xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">{t.about.stats.accuracy}</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between"><span className="text-gray-700">{t.about.stats.accuracy}</span><span className="text-2xl font-bold text-green-600">90%+</span></div>
                <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-green-600 h-2 rounded-full" style={{ width: '92%' }}></div></div>
                <div className="flex items-center justify-between pt-4"><span className="text-gray-700">{t.about.stats.speed}</span><span className="text-2xl font-bold text-green-600">&lt;5s</span></div>
                <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-green-600 h-2 rounded-full" style={{ width: '95%' }}></div></div>
                <div className="flex items-center justify-between pt-4"><span className="text-gray-700">{t.about.stats.diseases}</span><span className="text-2xl font-bold text-green-600">8</span></div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">{t.about.objectives.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { icon: <Target className="h-6 w-6 text-green-600" />,  ...t.about.objectives.early    },
              { icon: <Brain  className="h-6 w-6 text-green-600" />,  ...t.about.objectives.decision },
              { icon: <Users  className="h-6 w-6 text-green-600" />,  ...t.about.objectives.crop     },
              { icon: <Award  className="h-6 w-6 text-green-600" />,  ...t.about.objectives.access   },
            ].map((obj) => (
              <div key={obj.title} className="bg-white rounded-xl shadow-md p-6">
                <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">{obj.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{obj.title}</h3>
                <p className="text-gray-700">{obj.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-8 md:p-12 text-white mb-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">{t.about.tech.title}</h2>
            <p className="text-green-50">{t.about.tech.subtitle}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Brain className="h-8 w-8 mx-auto mb-3" />,    ...t.about.tech.deepLearning },
              { icon: <BookOpen className="h-8 w-8 mx-auto mb-3" />, ...t.about.tech.xai          },
              { icon: <Award className="h-8 w-8 mx-auto mb-3" />,    ...t.about.tech.frontend     },
              { icon: <Target className="h-8 w-8 mx-auto mb-3" />,   ...t.about.tech.database     },
            ].map((tech) => (
              <div key={tech.title} className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
                {tech.icon}<h3 className="font-semibold mb-2">{tech.title}</h3><p className="text-sm text-green-50">{tech.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">{t.about.academic.title}</h2>
          <div className="space-y-6">
            {[t.about.academic.q1, t.about.academic.q2, t.about.academic.q3, t.about.academic.q4].map((q) => (
              <div key={q.title} className="border-l-4 border-green-600 pl-6 py-2">
                <h3 className="font-semibold text-gray-900 mb-2">{q.title}</h3>
                <p className="text-gray-700">{q.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <div className="bg-gray-100 rounded-xl p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-3">{t.about.targets}</h3>
            <p className="text-gray-700 mb-4">{t.about.targetsDesc}</p>
            <div className="flex flex-wrap justify-center gap-3">
              {regions.map((r) => (<span key={r} className="px-4 py-2 bg-white text-gray-700 rounded-full text-sm font-medium shadow-sm">{r}</span>))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}