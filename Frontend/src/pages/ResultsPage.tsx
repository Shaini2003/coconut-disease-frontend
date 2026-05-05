// Frontend/src/pages/ResultsPage.tsx
// ✅ Full i18n (EN + Sinhala) — all text translated
// ✅ Safe null checks on all fields
// ✅ Includes Explainable AI (XAI) text representation
// ✅ Includes PDF Report Download functionality

import { useState } from 'react';
import { ArrowLeft, BarChart2, Leaf, FlaskConical, Eye, EyeOff, Clock, MapPin, TrendingUp, Thermometer, Download, Loader2, Brain } from 'lucide-react';
import { useTranslation } from '../i18n';

const ML_URL  = 'http://localhost:8000';
const API_URL = 'http://localhost:5000';

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
  xai_explanation_en?: string;
  xai_explanation_si?: string;
}

interface ResultsPageProps {
  result:           AnalysisResult;
  onNavigate:       (page: string) => void;
  onNewDetection:   () => void;
}

const formatName = (name?: string) =>
  (name || 'Unknown').replace(/_/g, ' ');

const getConfColor = (c: number) =>
  c >= 80 ? 'from-green-500 to-emerald-500' : c >= 60 ? 'from-yellow-400 to-orange-400' : 'from-red-400 to-red-500';

export default function ResultsPage({ result, onNavigate, onNewDetection }: ResultsPageProps) {
  const { t, language } = useTranslation();
  const [showGradcam, setShowGradcam] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Safe extraction
  const disease        = result?.disease         || 'Unknown';
  const confidence     = typeof result?.confidence === 'number' ? result.confidence : 0;
  const severity       = result?.severity        || 'Unknown';
  const recommendation = result?.recommendation  || '';
  const fertilizer     = result?.fertilizer      || '';
  const gradcam_url    = result?.gradcam_url      || null;
  const all_probs      = result?.all_probabilities || {};
  const imageUrl       = result?.imageUrl         || null;
  const location       = result?.location         || null;
  const createdAt      = result?.createdAt         || null;
  const id             = result?.id;
  
  // Get XAI text based on current language
  const xaiExplanation = language === 'si' ? result?.xai_explanation_si : result?.xai_explanation_en;

  const isHealthy = disease.toLowerCase().includes('healthy');

  // Severity config using translated labels
  const sevMap: Record<string, { bg: string; text: string; badge: string; label: string }> = {
    critical: { bg: 'bg-red-100',    text: 'text-red-700',    badge: 'bg-red-600',    label: t.results.severity.Critical },
    high:     { bg: 'bg-orange-100', text: 'text-orange-700', badge: 'bg-orange-500', label: t.results.severity.High     },
    medium:   { bg: 'bg-yellow-100', text: 'text-yellow-700', badge: 'bg-yellow-500', label: t.results.severity.Medium   },
    none:     { bg: 'bg-green-100',  text: 'text-green-700',  badge: 'bg-green-600',  label: t.results.severity.None     },
    healthy:  { bg: 'bg-green-100',  text: 'text-green-700',  badge: 'bg-green-600',  label: t.results.severity.None     },
  };
  const sevConf = sevMap[severity.toLowerCase()] || { bg: 'bg-gray-100', text: 'text-gray-700', badge: 'bg-gray-500', label: t.results.severity.Unknown };

  const gradcamFullUrl = gradcam_url ? (gradcam_url.startsWith('http') ? gradcam_url : `${ML_URL}${gradcam_url}`) : null;
  const imageFullUrl   = imageUrl    ? (imageUrl.startsWith('http')    ? imageUrl    : `${API_URL}${imageUrl}`)    : null;

  const sortedProbs = Object.entries(all_probs)
    .filter(([n]) => n !== 'Other')
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8);

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleString()
    : new Date().toLocaleString();

  // Function to download the PDF Report
  const handleDownloadPDF = async () => {
    if (!id) return;
    setDownloading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/report/${id}`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CocoAI_Report_${id}.pdf`;
      document.body.appendChild(a);
      a.click(); 
      a.remove();
    } catch (error) {
      console.error('Report download error:', error);
      alert(language === 'si' ? 'වාර්තාව බාගත කිරීම අසාර්ථකයි.' : 'Failed to download report.');
    } finally { 
      setDownloading(false); 
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <button onClick={onNewDetection}
            className="flex items-center gap-2 text-gray-600 hover:text-green-700 font-medium transition text-sm bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
            <ArrowLeft className="h-4 w-4" />{t.results.newDetection}
          </button>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">{t.results.title}</h1>
            <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mt-1">
              <Clock className="h-3 w-3" /><span>{formattedDate}</span>
              {location && (<><span>•</span><MapPin className="h-3 w-3" /><span>{location}</span></>)}
            </div>
          </div>
          <button onClick={() => onNavigate('history')}
            className="flex items-center gap-2 text-gray-600 hover:text-green-700 font-medium transition text-sm bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
            {t.results.viewHistory}
          </button>
        </div>

        {/* Main result & PDF Download Button */}
        <div className={`rounded-3xl p-6 shadow-xl border-2 ${isHealthy ? 'bg-green-50 border-green-300' : 'bg-white border-gray-100'}`}>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <span className={`text-xs font-bold px-3 py-1 rounded-full text-white ${sevConf.badge}`}>{sevConf.label}</span>
                {isHealthy && <span className="text-xs font-semibold px-3 py-1 rounded-full bg-green-100 text-green-700">{t.results.disease.healthy}</span>}
              </div>
              <h2 className={`text-3xl font-bold mb-1 ${isHealthy ? 'text-green-700' : 'text-gray-900'}`}>
                {isHealthy ? '🌿 ' : '⚠️ '}{formatName(disease)}
              </h2>
              {!isHealthy && <p className="text-sm text-gray-500">{t.results.disease.detected}</p>}
            </div>
            
            {/* Confidence */}
            <div className="flex flex-col items-center bg-white rounded-2xl p-5 shadow-md border border-gray-100 min-w-[130px]">
              <div className={`text-4xl font-black bg-gradient-to-r ${getConfColor(confidence)} bg-clip-text text-transparent`}>
                {confidence.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500 mt-1 font-medium">{t.results.disease.confidence}</div>
              <div className="mt-2 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className={`h-full bg-gradient-to-r ${getConfColor(confidence)} rounded-full transition-all duration-1000`}
                  style={{ width: `${Math.min(confidence, 100)}%` }} />
              </div>
            </div>
          </div>

          {/* PDF Download Button placed inside the main card */}
          {id && (
            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
              <button 
                onClick={handleDownloadPDF} 
                disabled={downloading} 
                className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-sm font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-70">
                {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                {language === 'si' ? 'PDF වාර්තාව බාගන්න' : 'Download PDF Report'}
              </button>
            </div>
          )}
        </div>

        {/* XAI Explanation Section */}
        {!isHealthy && xaiExplanation && (
          <div className="bg-purple-50 border border-purple-200 rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-purple-900 flex items-center gap-2 mb-3">
              <Brain className="h-5 w-5 text-purple-600" />
              {language === 'si' ? 'AI තීරණය පැහැදිලි කිරීම (XAI)' : 'AI Reasoning (Explainable AI)'}
            </h3>
            <p className="text-sm text-purple-800 leading-relaxed">{xaiExplanation}</p>
          </div>
        )}

        {/* Image + Grad-CAM */}
        {(imageFullUrl || gradcamFullUrl) && (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 pt-5 pb-3">
              <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <Eye className="h-4 w-4 text-green-600" />
                {showGradcam && gradcamFullUrl ? t.results.image.gradcamTitle : t.results.image.uploadedTitle}
              </h3>
              {gradcamFullUrl && (
                <button onClick={() => setShowGradcam(!showGradcam)}
                  className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 transition border border-purple-200">
                  {showGradcam ? <><EyeOff className="h-3.5 w-3.5" />{t.results.image.showOriginal}</> : <><Eye className="h-3.5 w-3.5" />{t.results.image.showGradcam}</>}
                </button>
              )}
            </div>
            <div className="px-6 pb-6">
              {showGradcam && gradcamFullUrl ? (
                <div>
                  <img src={gradcamFullUrl} alt="Grad-CAM" className="w-full rounded-2xl object-cover max-h-80 border border-purple-200"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  <p className="mt-2 text-xs text-gray-500 text-center">{t.results.image.gradcamHint}</p>
                </div>
              ) : imageFullUrl ? (
                <img src={imageFullUrl} alt="Uploaded" className="w-full rounded-2xl object-cover max-h-80 border border-gray-200"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              ) : null}
            </div>
          </div>
        )}

        {/* Treatment + Fertilizer */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center">
                <Leaf className="h-4 w-4 text-green-600" />
              </div>
              <h3 className="font-bold text-gray-800 text-sm">{t.results.cards.treatment}</h3>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              {recommendation || 'Consult an agricultural expert.'}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
                <FlaskConical className="h-4 w-4 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-800 text-sm">{t.results.cards.fertilizer}</h3>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              {fertilizer || 'Apply balanced NPK fertilizer.'}
            </p>
          </div>
        </div>

        {/* Probabilities */}
        {sortedProbs.length > 0 && (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-green-600" />{t.results.probabilities.title}
            </h3>
            <div className="space-y-3">
              {sortedProbs.map(([name, prob]) => {
                const isTop  = name === disease;
                const pct    = typeof prob === 'number' ? (prob > 1 ? prob : prob * 100) : 0;
                return (
                  <div key={name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-medium ${isTop ? 'text-green-700 font-bold' : 'text-gray-600'}`}>
                        {isTop && t.results.probabilities.predicted}{formatName(name)}
                      </span>
                      <span className={`text-xs font-bold ${isTop ? 'text-green-700' : 'text-gray-500'}`}>{pct.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-700 ${isTop ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-gray-300 to-gray-400'}`}
                        style={{ width: `${Math.min(pct, 100)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pb-6">
          <button onClick={onNewDetection}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3.5 rounded-2xl transition shadow-lg flex items-center justify-center gap-2">
            <Leaf className="h-5 w-5" />{t.results.buttons.analyseAnother}
          </button>
          <button onClick={() => onNavigate('history')}
            className="bg-white hover:bg-gray-50 text-gray-700 font-bold py-3.5 rounded-2xl transition shadow border border-gray-200 flex items-center justify-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />{t.results.buttons.viewHistory}
          </button>
          <button onClick={() => onNavigate('diseases')}
            className="bg-white hover:bg-gray-50 text-gray-700 font-bold py-3.5 rounded-2xl transition shadow border border-gray-200 flex items-center justify-center gap-2">
            <Thermometer className="h-5 w-5 text-orange-500" />{t.results.buttons.diseaseLibrary}
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 pb-4">{t.results.disclaimer}</p>
      </div>
    </div>
  );
}