// Frontend/src/pages/ResultsPage.tsx

import {
  AlertTriangle, CheckCircle, ChevronDown, ChevronUp,
  Download, Eye, EyeOff, FlaskConical, Info, Leaf, TrendingUp, XCircle
} from 'lucide-react';
import { useState } from 'react';
import { AnalysisResult } from './DetectPage';

const BACKEND_URL = 'http://localhost:5000';

interface ResultsPageProps {
  result:        AnalysisResult;
  onNavigate:    (page: string) => void;
  onNewDetection: () => void;
}

// ── XAI text explanation per disease ────────────────────────────────────────
const XAI_EXPLANATIONS: Record<string, string> = {
  'Bud Rot':
    'The model identified irregular dark discoloration and tissue degradation in the crown region. Grad-CAM highlights the bud area and inner spear leaves where Phytophthora palmivora infection typically begins.',
  'Stem Bleeding':
    'Abnormal browning and surface texture changes consistent with Thielaviopsis paradoxa were detected. Highlighted regions show trunk surface irregularities characteristic of stem bleeding.',
  'Leaf Rot':
    'Water-soaked brown lesions spreading from leaflet tips toward the midrib were identified. The heatmap focuses on the rotting tissue boundaries where fungal activity is highest.',
  'Gray Leaf Spot':
    'Circular gray-brown spots with yellow halos on the leaflet surface were detected. The model concentrated on spot distribution patterns consistent with Pestalotiopsis palmarum.',
  'Bud Root Dropping':
    'Wilting and yellowing patterns indicating root zone stress were detected. Highlighted areas show nutrient deficiency symptoms caused by compromised root function.',
  'CCI_Caterpillars':
    'Irregular feeding damage and silken webbing traces on leaflet surfaces were detected. The model focused on hole patterns characteristic of Opisina arenosella caterpillar damage.',
  'WCLWD_DryingofLeaflets':
    'Progressive yellowing from leaflet tips — a hallmark of phytoplasma infection — was identified. The model highlighted the systematic drying pattern spreading from lower fronds upward.',
  'Healthy_Leaves':
    'The model found uniform green coloration with normal leaf texture and no disease signs. All visual indicators are consistent with a healthy coconut tree.',
};

const SEVERITY_STYLE: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  Critical: { bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200',    badge: 'bg-red-600 text-white'    },
  High:     { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', badge: 'bg-orange-500 text-white' },
  Medium:   { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', badge: 'bg-yellow-500 text-white' },
  None:     { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200',  badge: 'bg-green-600 text-white'  },
};

function getSeverityIcon(severity: string) {
  if (severity === 'Critical' || severity === 'High') return <XCircle className="h-4 w-4" />;
  if (severity === 'Medium') return <AlertTriangle className="h-4 w-4" />;
  return <CheckCircle className="h-4 w-4" />;
}

function getConfidenceLabel(conf: number) {
  if (conf >= 90) return { label: 'Very High Confidence', color: 'text-green-600' };
  if (conf >= 75) return { label: 'High Confidence',      color: 'text-green-500' };
  if (conf >= 60) return { label: 'Moderate Confidence',  color: 'text-yellow-600' };
  return           { label: 'Low Confidence',             color: 'text-red-500'   };
}

const BAR_COLORS = [
  'bg-green-500','bg-blue-400','bg-purple-400','bg-yellow-400',
  'bg-orange-400','bg-red-400','bg-pink-400','bg-gray-400'
];

export default function ResultsPage({ result, onNavigate, onNewDetection }: ResultsPageProps) {
  const [showGradCam,  setShowGradCam]  = useState(false);
  const [showAllProbs, setShowAllProbs] = useState(false);
  const [showXAI,      setShowXAI]      = useState(false);

  const severity    = result.severity || 'Unknown';
  const sevStyle    = SEVERITY_STYLE[severity] || SEVERITY_STYLE['Medium'];
  const confLabel   = getConfidenceLabel(result.confidence);
  const xaiText     = XAI_EXPLANATIONS[result.predictedDisease]
                    || 'The AI model analysed visual patterns in the uploaded leaf image to classify this disease.';
  const isHealthy   = result.predictedDisease === 'Healthy_Leaves' || result.predictedDisease === 'Healthy';

  // confidence is already 0–100 from backend — display directly
  const confidenceDisplay = result.confidence.toFixed(1);

  // Sort probabilities highest first
  const sortedProbs = Object.entries(result.allProbabilities || {})
    .sort((a, b) => b[1] - a[1]);

  // ── PDF download ────────────────────────────────────────────────────────────
  const downloadReport = async () => {
    if (!result.id) {
      alert('Detection ID not found. Please try again.');
      return;
    }
    try {
      const token    = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/report/${result.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to generate report');
      const blob = await response.blob();
      const url  = window.URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `CocoAI_Report_${result.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Failed to download report. Make sure backend is running.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analysis Results</h1>
          <p className="text-gray-500">AI-powered disease detection with explainable predictions</p>
        </div>

        {/* ── TOP ROW ──────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

          {/* Image panel */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-green-600" />
              {showGradCam ? 'Grad-CAM Heatmap (XAI)' : 'Uploaded Image'}
            </h2>

            <div className="relative rounded-xl overflow-hidden bg-gray-100 mb-4">
              <img
                src={showGradCam && result.gradcamUrl ? result.gradcamUrl : result.imageUrl}
                alt="Leaf analysis"
                className="w-full h-72 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = result.imageUrl;
                }}
              />
              {showGradCam && (
                <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  🔥 Grad-CAM Active
                </div>
              )}
            </div>

            {result.gradcamUrl ? (
              <button
                onClick={() => setShowGradCam(!showGradCam)}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-sm transition ${
                  showGradCam
                    ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                    : 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                }`}
              >
                {showGradCam
                  ? <><EyeOff className="w-4 h-4" /> Show Original Image</>
                  : <><Eye className="w-4 h-4" /> Show Grad-CAM Heatmap 🔥</>}
              </button>
            ) : (
              <div className="w-full py-2 rounded-lg text-center text-sm text-gray-400 bg-gray-50 border border-gray-200">
                Grad-CAM not available — ensure Flask ML server is running
              </div>
            )}

            {showGradCam && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs font-semibold text-gray-600 mb-1">Heatmap Colour Guide:</p>
                <div className="flex gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span> High focus
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block"></span> Medium
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-blue-400 inline-block"></span> Low focus
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Detection result panel */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Detection Result
            </h2>

            {/* Disease + severity */}
            <div className={`rounded-xl p-4 mb-4 ${sevStyle.bg} ${sevStyle.border} border`}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Predicted Disease</p>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {result.predictedDisease.replace(/_/g, ' ')}
                  </h3>
                </div>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${sevStyle.badge}`}>
                  {getSeverityIcon(severity)}
                  <span>{severity}</span>
                </span>
              </div>
              {severity === 'Critical' && (
                <p className="text-red-600 text-sm font-medium flex items-center gap-1 mt-2">
                  <AlertTriangle className="w-4 h-4" /> Immediate action required
                </p>
              )}
              {isHealthy && (
                <p className="text-green-600 text-sm font-medium flex items-center gap-1 mt-2">
                  <CheckCircle className="w-4 h-4" /> Your coconut tree is healthy!
                </p>
              )}
            </div>

            {/* Confidence */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-600">Confidence Level</span>
                <span className={`text-lg font-bold ${confLabel.color}`}>
                  {confidenceDisplay}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-700 ${
                    result.confidence >= 75 ? 'bg-green-500' :
                    result.confidence >= 60 ? 'bg-yellow-500' : 'bg-red-400'
                  }`}
                  style={{ width: `${Math.min(result.confidence, 100)}%` }}
                />
              </div>
              <p className={`text-xs mt-1 font-medium ${confLabel.color}`}>{confLabel.label}</p>
            </div>

            <p className="text-xs text-gray-400 mb-5">
              🕐 Analysed: {result.timestamp.toLocaleString()}
            </p>

            {/* Buttons */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <button
                  onClick={onNewDetection}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg text-sm transition"
                >
                  Analyse Another
                </button>
                <button
                  onClick={() => onNavigate('history')}
                  className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-2.5 rounded-lg text-sm transition"
                >
                  View History
                </button>
              </div>
              <button
                onClick={downloadReport}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg text-sm transition"
              >
                <Download className="w-4 h-4" />
                Download PDF Report
              </button>
            </div>
          </div>
        </div>

        {/* ── XAI SECTION ──────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-purple-200 p-6 mb-6">
          <button
            onClick={() => setShowXAI(!showXAI)}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <FlaskConical className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-left">
                <h2 className="text-lg font-semibold text-gray-900">
                  🧠 Explainable AI (XAI) — Why this prediction?
                </h2>
                <p className="text-sm text-gray-500">Grad-CAM visual explanation + model reasoning</p>
              </div>
            </div>
            {showXAI ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>

          {showXAI && (
            <div className="mt-5 space-y-4">
              {/* What is Grad-CAM */}
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex gap-3">
                <Info className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-purple-800 mb-1">What is Grad-CAM?</p>
                  <p className="text-sm text-purple-700 leading-relaxed">
                    <strong>Gradient-weighted Class Activation Mapping (Grad-CAM)</strong> shows
                    which parts of the leaf the MobileNetV2 model focused on during its prediction.
                    Red/yellow regions indicate the highest model attention — these are the
                    disease-affected areas identified by the AI.
                  </p>
                </div>
              </div>

              {/* AI reasoning for this detection */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p className="font-semibold text-gray-800 mb-2">🔬 AI Reasoning for This Detection</p>
                <p className="text-sm text-gray-700 leading-relaxed">{xaiText}</p>
              </div>

              {/* Colour legend */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { emoji: '🔴', title: 'Red / Yellow', desc: 'Highest activation — strongest disease signal' },
                  { emoji: '🔵', title: 'Blue / Green', desc: 'Low activation — minimal disease signal'      },
                  { emoji: '⚪', title: 'Dark Areas',   desc: 'Neutral — irrelevant to disease diagnosis'   },
                ].map(item => (
                  <div key={item.title} className="bg-white border border-gray-200 rounded-lg p-3 text-sm text-center">
                    <div className="text-xl mb-1">{item.emoji}</div>
                    <div className="font-semibold text-gray-700 mb-1">{item.title}</div>
                    <div className="text-gray-500 text-xs">{item.desc}</div>
                  </div>
                ))}
              </div>

              {/* Model info */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: 'Model',   value: 'MobileNetV2' },
                  { label: 'Method',  value: 'Grad-CAM'    },
                  { label: 'Layer',   value: 'Conv_1'      },
                  { label: 'Classes', value: '8 Diseases'  },
                ].map(item => (
                  <div key={item.label} className="bg-gray-50 rounded-lg p-3 text-center border border-gray-200">
                    <div className="text-xs text-gray-500 mb-1">{item.label}</div>
                    <div className="text-sm font-bold text-gray-800">{item.value}</div>
                  </div>
                ))}
              </div>

              {result.gradcamUrl && (
                <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-3">
                  <span className="text-xl">💡</span>
                  <p className="text-sm text-green-800">
                    Click <strong>"Show Grad-CAM Heatmap"</strong> on the image above to see which leaf regions the AI focused on.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── ALL PROBABILITIES ─────────────────────────────────────────────── */}
        {sortedProbs.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
            <button
              onClick={() => setShowAllProbs(!showAllProbs)}
              className="w-full flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <h2 className="text-lg font-semibold text-gray-900">All Disease Probabilities</h2>
                  <p className="text-sm text-gray-500">Model confidence scores for all 8 classes</p>
                </div>
              </div>
              {showAllProbs ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </button>

            {showAllProbs && (
              <div className="mt-5 space-y-3">
                {sortedProbs.map(([disease, prob], index) => (
                  <div key={disease} className={`p-3 rounded-lg ${
                    disease === result.predictedDisease ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                  }`}>
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-2">
                        {disease === result.predictedDisease && (
                          <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full font-bold">✓ Predicted</span>
                        )}
                        <span className={`text-sm font-medium ${
                          disease === result.predictedDisease ? 'text-green-800' : 'text-gray-700'
                        }`}>
                          {disease.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <span className={`text-sm font-bold ${
                        disease === result.predictedDisease ? 'text-green-700' : 'text-gray-600'
                      }`}>
                        {typeof prob === 'number' ? prob.toFixed(2) : prob}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          disease === result.predictedDisease ? 'bg-green-500' : BAR_COLORS[index] || 'bg-gray-400'
                        }`}
                        style={{ width: `${Math.min(typeof prob === 'number' ? prob : 0, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
                <p className="text-xs text-gray-400 text-center pt-1">
                  Probabilities across all 8 disease classes. Higher = more likely.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── TREATMENT + FERTILIZER ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow-sm border border-orange-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Leaf className="w-5 h-5 text-green-600" /> Treatment Recommendation
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">{result.recommendation}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-green-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span>💊</span> Fertilizer Recommendation
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">{result.fertilizer}</p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
          <p className="text-xs text-gray-500">
            ⚠️ AI predictions are for guidance only. For Critical diseases,
            always consult the <strong>Coconut Research Institute of Sri Lanka (CRISL)</strong>.
          </p>
        </div>

      </div>
    </div>
  );
}