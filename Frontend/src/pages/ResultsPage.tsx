import { AlertTriangle, CheckCircle, Info, Leaf, TrendingUp, XCircle } from 'lucide-react';
import { useState } from 'react';
import { AnalysisResult } from './DetectPage';

interface ResultsPageProps {
  result: AnalysisResult;
  onNavigate: (page: string) => void;
  onNewDetection: () => void;
}

export default function ResultsPage({ result, onNavigate, onNewDetection }: ResultsPageProps) {
  const [showGradCam, setShowGradCam] = useState(false);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'High':     return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium':   return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'None':     return 'bg-green-100 text-green-800 border-green-200';
      default:         return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'Critical':
      case 'High':   return <XCircle className="h-5 w-5" />;
      case 'Medium': return <AlertTriangle className="h-5 w-5" />;
      default:       return <CheckCircle className="h-5 w-5" />;
    }
  };

  // Sort all probabilities highest first
  const sortedProbs = Object.entries(result.allProbabilities || {})
    .sort((a, b) => b[1] - a[1]);

  const confidencePct = (result.confidence * 100).toFixed(1);
  const isHealthy = result.predictedDisease === 'Healthy_Leaves' ||
                    result.predictedDisease === 'Healthy';

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
          {/* Image Panel */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {showGradCam ? 'Grad-CAM Heatmap' : 'Uploaded Image'}
            </h2>
            <div className="relative">
              <img
                src={showGradCam && result.gradcamUrl ? result.gradcamUrl : result.imageUrl}
                alt="Analyzed coconut leaf"
                className="w-full h-80 object-contain rounded-lg bg-gray-100"
              />
              {result.gradcamUrl && (
                <button
                  onClick={() => setShowGradCam(!showGradCam)}
                  className="absolute bottom-4 right-4 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  {showGradCam ? 'Show Original' : 'Show Grad-CAM'}
                </button>
              )}
            </div>
            {showGradCam && (
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Info className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-800">
                    The Grad-CAM heatmap highlights which regions of the leaf the AI focused on.
                    Warmer colors (red/yellow) indicate areas of higher importance for the prediction.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Result Panel */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Detection Result</h2>

              {/* Disease name + severity */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 text-sm">Predicted Disease</span>
                  <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(result.severity)}`}>
                    {getSeverityIcon(result.severity)}
                    <span className="ml-1">{result.severity}</span>
                  </span>
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {result.predictedDisease.replace(/_/g, ' ')}
                </div>
              </div>

              {/* Confidence bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 text-sm">Confidence Level</span>
                  <span className="text-xl font-bold text-green-600">{confidencePct}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-600 h-3 rounded-full transition-all"
                    style={{ width: `${confidencePct}%` }}
                  />
                </div>
              </div>

              {/* Warning for diseased */}
              {!isHealthy && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start">
                    <TrendingUp className="h-5 w-5 text-orange-600 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-orange-900 mb-1">Immediate Action Required</h4>
                      <p className="text-sm text-orange-800">
                        Early treatment is recommended to prevent disease spread to surrounding trees.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Healthy message */}
              {isHealthy && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-green-900 mb-1">Your Tree is Healthy! ✅</h4>
                      <p className="text-sm text-green-800">
                        No disease detected. Continue regular care and monitoring.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action buttons */}
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

        {/* Recommendation + Fertilizer */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Leaf className="h-6 w-6 text-green-600 mr-2" />
              Treatment Recommendation
            </h2>
            <p className="text-gray-700 leading-relaxed">{result.recommendation}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              🌱 Fertilizer Recommendation
            </h2>
            <p className="text-gray-700 leading-relaxed">{result.fertilizer}</p>
          </div>
        </div>

        {/* All Probabilities */}
        {sortedProbs.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              All Disease Probabilities
            </h2>
            <div className="space-y-3">
              {sortedProbs.map(([disease, prob]) => (
                <div key={disease}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className={`font-medium ${disease === result.predictedDisease ? 'text-green-700' : 'text-gray-700'}`}>
                      {disease.replace(/_/g, ' ')}
                      {disease === result.predictedDisease && ' ✓'}
                    </span>
                    <span className="text-gray-600">{prob.toFixed(2)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${disease === result.predictedDisease ? 'bg-green-600' : 'bg-gray-400'}`}
                      style={{ width: `${prob}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}