import { Award, BookOpen, Brain, Target, Users } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            About CocoAI
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Deep Learning and Explainable AI-Based Early Prediction of Coconut Leaf and Tree Diseases in Sri Lanka
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                CocoAI aims to revolutionize coconut disease detection in Sri Lanka by providing
                farmers and agricultural officers with an advanced, AI-powered tool that delivers
                instant, accurate diagnoses with transparent explanations.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Traditional detection methods rely on expert visual inspection, which is time-consuming,
                subjective, and inconsistent. Our system addresses these challenges by combining
                state-of-the-art deep learning with explainable AI techniques, enabling early detection
                and effective decision-making.
              </p>
            </div>

            <div className="bg-green-50 rounded-xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Key Statistics</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Detection Accuracy</span>
                  <span className="text-2xl font-bold text-green-600">90%+</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <span className="text-gray-700">Analysis Speed</span>
                  <span className="text-2xl font-bold text-green-600">&lt;5s</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '95%' }}></div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <span className="text-gray-700">Diseases Detected</span>
                  <span className="text-2xl font-bold text-green-600">5</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Research Objectives</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Early Detection</h3>
              <p className="text-gray-700">
                Enable early identification of coconut leaf and tree diseases to support timely
                interventions and prevent widespread crop damage.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Improved Decision-Making</h3>
              <p className="text-gray-700">
                Use Explainable AI to help agricultural officers validate and understand prediction
                results, building trust in AI-driven recommendations.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Enhanced Crop Health</h3>
              <p className="text-gray-700">
                Reduce disease progression and improve overall coconut yield and plantation
                sustainability through proactive disease management.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Award className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Accessibility</h3>
              <p className="text-gray-700">
                Provide a user-friendly, web-based platform accessible to farmers and agricultural
                workers across Sri Lanka, bridging the technology gap in rural areas.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-8 md:p-12 text-white mb-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Technology Stack</h2>
            <p className="text-green-50">
              Built with cutting-edge AI and web technologies
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
              <Brain className="h-8 w-8 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Deep Learning</h3>
              <p className="text-sm text-green-50">CNN, Transfer Learning</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
              <BookOpen className="h-8 w-8 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Explainable AI</h3>
              <p className="text-sm text-green-50">Grad-CAM, Visual Explanations</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
              <Award className="h-8 w-8 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Frontend</h3>
              <p className="text-sm text-green-50">React.js, Tailwind CSS</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
              <Target className="h-8 w-8 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Database</h3>
              <p className="text-sm text-green-50">Supabase (PostgreSQL)</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Academic Questions Addressed
          </h2>
          <div className="space-y-6">
            <div className="border-l-4 border-green-600 pl-6 py-2">
              <h3 className="font-semibold text-gray-900 mb-2">
                1. Classification Effectiveness
              </h3>
              <p className="text-gray-700">
                How effectively can deep learning models classify coconut leaf and tree diseases
                using image data?
              </p>
            </div>

            <div className="border-l-4 border-green-600 pl-6 py-2">
              <h3 className="font-semibold text-gray-900 mb-2">
                2. XAI Interpretability
              </h3>
              <p className="text-gray-700">
                How can XAI techniques improve the interpretability of disease prediction for
                farmers and agricultural officers?
              </p>
            </div>

            <div className="border-l-4 border-green-600 pl-6 py-2">
              <h3 className="font-semibold text-gray-900 mb-2">
                3. Early Prediction Impact
              </h3>
              <p className="text-gray-700">
                To what extent does early prediction help prevent disease progression and improve
                coconut crop health?
              </p>
            </div>

            <div className="border-l-4 border-green-600 pl-6 py-2">
              <h3 className="font-semibold text-gray-900 mb-2">
                4. Automated vs Traditional Detection
              </h3>
              <p className="text-gray-700">
                What advantages does an automated disease detection system offer compared with
                traditional visual inspection methods?
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="bg-gray-100 rounded-xl p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Target Regions</h3>
            <p className="text-gray-700 mb-4">
              Our system is specifically designed for Sri Lankan coconut farming conditions
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {['Kurunegala', 'Puttalam', 'Matale', 'Gampaha', 'Galle', 'Colombo'].map((region) => (
                <span
                  key={region}
                  className="px-4 py-2 bg-white text-gray-700 rounded-full text-sm font-medium shadow-sm"
                >
                  {region}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
