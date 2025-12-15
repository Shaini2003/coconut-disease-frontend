import { ArrowRight, Brain, Eye, Leaf, Lightbulb, MapPin, Shield, Zap } from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-6">
                <Leaf className="h-4 w-4 mr-2" />
                AI-Powered Agricultural Technology
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Protect Your Coconut Plantation with
                <span className="text-green-600"> Smart Detection</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Advanced deep learning and explainable AI system for early prediction of coconut leaf
                and tree diseases in Sri Lanka. Get instant, accurate diagnoses with visual explanations.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => onNavigate('detect')}
                  className="flex items-center justify-center px-8 py-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl"
                >
                  Start Detection
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
                <button
                  onClick={() => onNavigate('diseases')}
                  className="flex items-center justify-center px-8 py-4 bg-white text-gray-700 border-2 border-gray-300 rounded-lg font-semibold hover:border-green-600 hover:text-green-600 transition-colors"
                >
                  Learn About Diseases
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10">
                <img
                  src="https://images.pexels.com/photos/2132180/pexels-photo-2132180.jpeg"
                  alt="Coconut plantation"
                  className="rounded-2xl shadow-2xl"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-64 h-64 bg-green-200 rounded-full opacity-20 blur-3xl"></div>
              <div className="absolute -top-6 -left-6 w-64 h-64 bg-green-300 rounded-full opacity-20 blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose CocoAI?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Cutting-edge technology designed specifically for Sri Lankan coconut farmers and agricultural officers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-green-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="bg-green-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Instant Detection</h3>
              <p className="text-gray-600">
                Get disease predictions in seconds using state-of-the-art deep learning models
              </p>
            </div>

            <div className="bg-green-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="bg-green-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Eye className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Visual Explanations</h3>
              <p className="text-gray-600">
                Grad-CAM heatmaps show exactly which parts of the leaf indicate disease
              </p>
            </div>

            <div className="bg-green-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="bg-green-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">High Accuracy</h3>
              <p className="text-gray-600">
                CNN models trained on Sri Lankan coconut diseases with over 90% accuracy
              </p>
            </div>

            <div className="bg-green-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="bg-green-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Lightbulb className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Expert Guidance</h3>
              <p className="text-gray-600">
                Detailed treatment and prevention recommendations for each disease
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-8 md:p-12 text-white">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Targeted for Sri Lankan Conditions
                </h2>
                <p className="text-green-50 text-lg mb-6">
                  Our system is specifically trained on coconut diseases prevalent in Sri Lankan districts
                  including Kurunegala, Puttalam, Matale, and Gampaha.
                </p>
                <div className="flex items-start space-x-3 mb-4">
                  <MapPin className="h-6 w-6 text-green-200 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Local Dataset</h4>
                    <p className="text-green-50 text-sm">
                      Trained on real coconut leaf images from major coconut-growing regions
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Shield className="h-6 w-6 text-green-200 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Research-Backed</h4>
                    <p className="text-green-50 text-sm">
                      Based on extensive literature review and local agricultural expertise
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
                  <div className="text-4xl font-bold mb-2">4+</div>
                  <div className="text-green-50 text-sm">Major Diseases Detected</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
                  <div className="text-4xl font-bold mb-2">90%+</div>
                  <div className="text-green-50 text-sm">Accuracy Rate</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
                  <div className="text-4xl font-bold mb-2">&lt;5s</div>
                  <div className="text-green-50 text-sm">Detection Time</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
                  <div className="text-4xl font-bold mb-2">100%</div>
                  <div className="text-green-50 text-sm">Explainable</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600">
              Simple three-step process to detect coconut diseases
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-md">
                <span className="text-2xl font-bold text-green-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload Image</h3>
              <p className="text-gray-600">
                Take a clear photo of the coconut leaf or tree showing symptoms
              </p>
            </div>

            <div className="text-center">
              <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-md">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Analysis</h3>
              <p className="text-gray-600">
                Our deep learning model analyzes the image and identifies the disease
              </p>
            </div>

            <div className="text-center">
              <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-md">
                <span className="text-2xl font-bold text-green-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Get Results</h3>
              <p className="text-gray-600">
                Receive diagnosis with visual explanation and treatment recommendations
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => onNavigate('detect')}
              className="inline-flex items-center px-8 py-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl"
            >
              Try It Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
