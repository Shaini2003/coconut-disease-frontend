import { AlertTriangle, CheckCircle, Info, Leaf, TrendingUp, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DiseaseInfo, supabase } from '../lib/supabase';
import { AnalysisResult } from './DetectPage';

interface ResultsPageProps {
  result: AnalysisResult;
  onNavigate: (page: string) => void;
  onNewDetection: () => void;
}

export default function ResultsPage({ result, onNavigate, onNewDetection }: ResultsPageProps) {
  const [diseaseInfo, setDiseaseInfo] = useState<DiseaseInfo | null>(null);
  const [showGradCam, setShowGradCam] = useState(false);

  useEffect(() => {
    fetchDiseaseInfo();
    savePrediction();
  }, [result]);

  const fetchDiseaseInfo = async () => {
    const { data } = await supabase
      .from('disease_info')
      .select('*')
      .eq('name', result.predictedDisease)
      .maybeSingle();

    if (data) {
      setDiseaseInfo(data);
    }
  };

  const savePrediction = async () => {
    await supabase.from('predictions').insert({
      image_url: result.imageUrl,
      predicted_disease: result.predictedDisease,
      confidence: result.confidence,
      gradcam_url: result.gradcamUrl,
      metadata: { timestamp: result.timestamp.toISOString() },
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'High':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'Critical':
      case 'High':
        return <XCircle className="h-5 w-5" />;
      case 'Medium':
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return <CheckCircle className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Analysis Results
          </h1>
          <p className="text-lg text-gray-600">
            AI-powered disease detection with explainable predictions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Uploaded Image</h2>
            <div className="relative">
              <img
                src={result.imageUrl}
                alt="Analyzed coconut leaf"
                className="w-full h-80 object-contain rounded-lg bg-gray-100"
              />
              <button
                onClick={() => setShowGradCam(!showGradCam)}
                className="absolute bottom-4 right-4 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                {showGradCam ? 'Show Original' : 'Show Grad-CAM'}
              </button>
            </div>
            {showGradCam && (
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Info className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-800">
                    The Grad-CAM heatmap highlights the regions of the leaf that the AI model
                    focused on to make its prediction. Warmer colors indicate areas of higher importance.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Detection Result</h2>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-600">Predicted Disease</span>
                  {diseaseInfo && (
                    <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium border ${getSeverityColor(diseaseInfo.severity)}`}>
                      {getSeverityIcon(diseaseInfo.severity)}
                      <span>{diseaseInfo.severity}</span>
                    </span>
                  )}
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {result.predictedDisease}
                </div>
                {diseaseInfo?.scientific_name && (
                  <div className="text-sm text-gray-500 italic">
                    {diseaseInfo.scientific_name}
                  </div>
                )}
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Confidence Level</span>
                  <span className="text-xl font-bold text-green-600">
                    {(result.confidence * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-600 h-3 rounded-full transition-all"
                    style={{ width: `${result.confidence * 100}%` }}
                  ></div>
                </div>
              </div>

              {result.predictedDisease !== 'Healthy' && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <TrendingUp className="h-5 w-5 text-orange-600 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-orange-900 mb-1">Early Detection</h4>
                      <p className="text-sm text-orange-800">
                        Immediate action is recommended to prevent disease progression and protect
                        surrounding trees.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <button
                onClick={onNewDetection}
                className="flex-1 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Analyze Another Image
              </button>
              <button
                onClick={() => onNavigate('history')}
                className="flex-1 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-lg font-semibold hover:border-green-600 hover:text-green-600 transition-colors"
              >
                View History
              </button>
            </div>
          </div>
        </div>

        {diseaseInfo && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Leaf className="h-6 w-6 text-green-600 mr-2" />
                About This Disease
              </h2>
              <p className="text-gray-700 leading-relaxed mb-6">{diseaseInfo.description}</p>

              {diseaseInfo.symptoms.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Common Symptoms</h3>
                  <ul className="space-y-2">
                    {diseaseInfo.symptoms.map((symptom, index) => (
                      <li key={index} className="flex items-start text-gray-700">
                        <span className="text-green-600 mr-2">•</span>
                        <span>{symptom}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {diseaseInfo.causes.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Causes</h3>
                  <ul className="space-y-2">
                    {diseaseInfo.causes.map((cause, index) => (
                      <li key={index} className="flex items-start text-gray-700">
                        <span className="text-green-600 mr-2">•</span>
                        <span>{cause}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {diseaseInfo.treatment && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Treatment Recommendations
                  </h2>
                  <p className="text-gray-700 leading-relaxed">{diseaseInfo.treatment}</p>
                </div>
              )}

              {diseaseInfo.prevention && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Prevention Measures
                  </h2>
                  <p className="text-gray-700 leading-relaxed">{diseaseInfo.prevention}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
