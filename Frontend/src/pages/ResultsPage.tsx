// Frontend/src/pages/ResultsPage.tsx
// ✅ FIXED: Safe null checks on ALL result fields — no more blank page crash
// ✅ Beautiful results display with Grad-CAM, confidence bar, disease info
// ✅ Works even if some fields are missing/undefined from backend

import { useState } from 'react';
import {
  Leaf, ArrowLeft,
  BarChart2, Thermometer, FlaskConical, Eye, EyeOff,
  MapPin, Clock, TrendingUp
} from 'lucide-react';
const ML_URL    = 'http://localhost:8000';
const API_URL   = 'http://localhost:5000';

// ── Safe import of AnalysisResult (re-define here to avoid import issues) ────
export interface AnalysisResult {
  disease:            string;
  confidence:         number;
  severity?:          string;
  recommendation?:    string;
  fertilizer?:        string;
  gradcam_url?:       string | null;
  all_probabilities?: Record<string, number>;
  imageUrl?:          string;
  location?:          string;
  createdAt?:         string;
  id?:                number;
}

interface ResultsPageProps {
  result:           AnalysisResult;
  onNavigate:       (page: string) => void;
  onNewDetection:   () => void;
}

// ── Severity config ───────────────────────────────────────────────────────────
const getSeverityConfig = (severity?: string) => {
  switch ((severity || '').toLowerCase()) {
    case 'critical': return { bg: 'bg-red-100',    text: 'text-red-700',    badge: 'bg-red-600',    label: '🔴 Critical'  };
    case 'high':     return { bg: 'bg-orange-100', text: 'text-orange-700', badge: 'bg-orange-500', label: '🟠 High'      };
    case 'medium':   return { bg: 'bg-yellow-100', text: 'text-yellow-700', badge: 'bg-yellow-500', label: '🟡 Medium'    };
    case 'none':
    case 'healthy':  return { bg: 'bg-green-100',  text: 'text-green-700',  badge: 'bg-green-600',  label: '🟢 Healthy'   };
    default:         return { bg: 'bg-gray-100',   text: 'text-gray-700',   badge: 'bg-gray-500',   label: '⚪ Unknown'   };
  }
};

const getConfidenceColor = (conf: number) => {
  if (conf >= 80) return 'from-green-500 to-emerald-500';
  if (conf >= 60) return 'from-yellow-400 to-orange-400';
  return 'from-red-400 to-red-500';
};

// ── Format disease name for display ──────────────────────────────────────────
const formatDiseaseName = (name?: string) => {
  if (!name) return 'Unknown';
  return name
    .replace(/_/g, ' ')
    .replace(/WCLWD/g, 'WCLWD')
    .replace(/CCI/g, 'CCI');
};

export default function ResultsPage({ result, onNavigate, onNewDetection }: ResultsPageProps) {
  const [showGradcam, setShowGradcam] = useState(false);

  // ── Safely extract all fields with fallbacks ──────────────────────────────
  const disease        = result?.disease         || 'Unknown';
  const confidence     = typeof result?.confidence === 'number' ? result.confidence : 0;
  const severity       = result?.severity        || 'Unknown';
  const recommendation = result?.recommendation  || 'Consult an agricultural expert for proper diagnosis and treatment.';
  const fertilizer     = result?.fertilizer      || 'Apply balanced NPK fertilizer as a general measure.';
  const gradcam_url    = result?.gradcam_url      || null;
  const all_probs      = result?.all_probabilities || {};
  const imageUrl       = result?.imageUrl         || null;
  const location       = result?.location         || null;
  const createdAt      = result?.createdAt        || null;

  const severityConfig = getSeverityConfig(severity);
  const isHealthy      = disease.toLowerCase().includes('healthy');
  const confColor      = getConfidenceColor(confidence);

  // Build full Grad-CAM URL
  const gradcamFullUrl = gradcam_url
    ? (gradcam_url.startsWith('http') ? gradcam_url : `${ML_URL}${gradcam_url}`)
    : null;

  // Build full image URL
  const imageFullUrl = imageUrl
    ? (imageUrl.startsWith('http') ? imageUrl : `${API_URL}${imageUrl}`)
    : null;

  // Sort probabilities descending
  const sortedProbs = Object.entries(all_probs)
    .filter(([name]) => name !== 'Other')
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8);

  // Format date
  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      })
    : new Date().toLocaleString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <button
            onClick={onNewDetection}
            className="flex items-center gap-2 text-gray-600 hover:text-green-700 font-medium transition text-sm bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm hover:shadow"
          >
            <ArrowLeft className="h-4 w-4" />
            New Detection
          </button>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Analysis Results</h1>
            <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mt-1">
              <Clock className="h-3 w-3" />
              <span>{formattedDate}</span>
              {location && (
                <>
                  <span>•</span>
                  <MapPin className="h-3 w-3" />
                  <span>{location}</span>
                </>
              )}
            </div>
          </div>
          <button
            onClick={() => onNavigate('history')}
            className="flex items-center gap-2 text-gray-600 hover:text-green-700 font-medium transition text-sm bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm hover:shadow"
          >
            View History
          </button>
        </div>

        {/* ── Main Result Card ────────────────────────────────────────────── */}
        <div className={`rounded-3xl p-6 shadow-xl border-2 ${
          isHealthy ? 'bg-green-50 border-green-300' : 'bg-white border-gray-100'
        }`}>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">

            {/* Disease name + severity */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <span className={`text-xs font-bold px-3 py-1 rounded-full text-white ${severityConfig.badge}`}>
                  {severityConfig.label}
                </span>
                {isHealthy && (
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-green-100 text-green-700">
                    ✅ No Disease Detected
                  </span>
                )}
              </div>

              <h2 className={`text-3xl font-bold mb-1 ${isHealthy ? 'text-green-700' : 'text-gray-900'}`}>
                {isHealthy ? '🌿 ' : '⚠️ '}{formatDiseaseName(disease)}
              </h2>

              {!isHealthy && (
                <p className="text-sm text-gray-500">Disease detected in coconut leaf sample</p>
              )}
            </div>

            {/* Confidence circle */}
            <div className="flex flex-col items-center bg-white rounded-2xl p-5 shadow-md border border-gray-100 min-w-[130px]">
              <div className={`text-4xl font-black bg-gradient-to-r ${confColor} bg-clip-text text-transparent`}>
                {confidence.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500 mt-1 font-medium">AI Confidence</div>
              <div className="mt-2 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${confColor} rounded-full transition-all duration-1000`}
                  style={{ width: `${Math.min(confidence, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Image + Grad-CAM Row ────────────────────────────────────────── */}
        {(imageFullUrl || gradcamFullUrl) && (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 pt-5 pb-3">
              <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <Eye className="h-4 w-4 text-green-600" />
                {showGradcam && gradcamFullUrl ? 'Grad-CAM Heatmap' : 'Uploaded Image'}
              </h3>
              {gradcamFullUrl && (
                <button
                  onClick={() => setShowGradcam(!showGradcam)}
                  className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 transition border border-purple-200"
                >
                  {showGradcam ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  {showGradcam ? 'Show Original' : '🔥 Show Grad-CAM'}
                </button>
              )}
            </div>

            <div className="px-6 pb-6">
              {showGradcam && gradcamFullUrl ? (
                <div className="relative">
                  <img
                    src={gradcamFullUrl}
                    alt="Grad-CAM Heatmap"
                    className="w-full rounded-2xl object-cover max-h-80 border border-purple-200"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  <div className="mt-2 text-xs text-gray-500 text-center">
                    🔥 Red/warm areas indicate disease-affected regions detected by AI
                  </div>
                </div>
              ) : imageFullUrl ? (
                <img
                  src={imageFullUrl}
                  alt="Uploaded leaf"
                  className="w-full rounded-2xl object-cover max-h-80 border border-gray-200"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              ) : null}
            </div>
          </div>
        )}

        {/* ── Recommendation + Fertilizer ────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Recommendation */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center">
                <Leaf className="h-4 w-4 text-green-600" />
              </div>
              <h3 className="font-bold text-gray-800 text-sm">Treatment Recommendation</h3>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{recommendation}</p>
          </div>

          {/* Fertilizer */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
                <FlaskConical className="h-4 w-4 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-800 text-sm">Fertilizer Advice</h3>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{fertilizer}</p>
          </div>
        </div>

        {/* ── All Probabilities ───────────────────────────────────────────── */}
        {sortedProbs.length > 0 && (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-green-600" />
              All Disease Probabilities
            </h3>
            <div className="space-y-3">
              {sortedProbs.map(([name, prob]) => {
                const isTop     = name === disease;
                const probVal   = typeof prob === 'number' ? prob : 0;
                const displayP  = probVal > 1 ? probVal : probVal * 100; // handle both % and 0-1
                return (
                  <div key={name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-medium ${isTop ? 'text-green-700 font-bold' : 'text-gray-600'}`}>
                        {isTop && '✅ '}{formatDiseaseName(name)}
                      </span>
                      <span className={`text-xs font-bold ${isTop ? 'text-green-700' : 'text-gray-500'}`}>
                        {displayP.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          isTop
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                            : 'bg-gradient-to-r from-gray-300 to-gray-400'
                        }`}
                        style={{ width: `${Math.min(displayP, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Action Buttons ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pb-6">
          <button
            onClick={onNewDetection}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3.5 rounded-2xl transition shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            <Leaf className="h-5 w-5" />
            Analyse Another
          </button>
          <button
            onClick={() => onNavigate('history')}
            className="bg-white hover:bg-gray-50 text-gray-700 font-bold py-3.5 rounded-2xl transition shadow border border-gray-200 hover:border-gray-300 flex items-center justify-center gap-2"
          >
            <TrendingUp className="h-5 w-5 text-green-600" />
            View History
          </button>
          <button
            onClick={() => onNavigate('diseases')}
            className="bg-white hover:bg-gray-50 text-gray-700 font-bold py-3.5 rounded-2xl transition shadow border border-gray-200 hover:border-gray-300 flex items-center justify-center gap-2"
          >
            <Thermometer className="h-5 w-5 text-orange-500" />
            Disease Library
          </button>
        </div>

      </div>
    </div>
  );
}