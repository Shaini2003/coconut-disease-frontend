// Frontend/src/pages/ResultsPage.tsx
// ✅ RESTORED: All Probabilities Section & Bottom Action Buttons
// ✅ ULTIMATE XAI: GradCAM, LIME, BBox, Feature Importance, Counterfactuals & PDF Download
// ✅ PROPERLY FORMATTED: Full indentation, no truncated lines

import { useState } from 'react';
import { 
  ArrowLeft, 
  BarChart2, 
  Leaf, 
  FlaskConical, 
  Eye, 
  Clock, 
  MapPin, 
  TrendingUp, 
  Thermometer, 
  Download, 
  Loader2, 
  Brain, 
  ShieldAlert, 
  Crosshair, 
  Layers, 
  Layers2 
} from 'lucide-react';
import { useTranslation } from '../i18n';

const ML_URL  = 'http://localhost:8000';
const API_URL = 'http://localhost:5000';

export interface AnalysisResult {
  disease: string; 
  confidence: number; 
  severity?: string; 
  recommendation?: string; 
  fertilizer?: string;
  imageUrl?: string; 
  location?: string; 
  createdAt?: string; 
  id?: number; 
  all_probabilities?: Record<string, number>;
  gradcam_url?: string | null; 
  lime_url?: string; 
  bbox_url?: string;
  xai_explanation_en?: string; 
  xai_explanation_si?: string;
  counterfactual_en?: string; 
  counterfactual_si?: string;
  feature_importance?: Record<string, number>;
}

interface Props { 
  result: AnalysisResult; 
  onNavigate: (page: string) => void; 
  onNewDetection: () => void; 
}

const formatName = (name?: string) => (name || 'Unknown').replace(/_/g, ' ');


export default function ResultsPage({ result, onNavigate, onNewDetection }: Props) {
  const { t, language } = useTranslation();
  const [imgView, setImgView] = useState<'original'|'gradcam'|'lime'|'bbox'>('gradcam');
  const [opacity, setOpacity] = useState(70);
  const [downloading, setDownloading] = useState(false);

  const d = result;
  const isHealthy = d.disease.toLowerCase().includes('healthy');
  const L = language === 'si' ? 'si' : 'en';

  const xaiText = L === 'si' ? d.xai_explanation_si : d.xai_explanation_en;
  const cfText  = L === 'si' ? d.counterfactual_si : d.counterfactual_en;
  
  const imgBase = d.imageUrl 
    ? (d.imageUrl.startsWith('http') ? d.imageUrl : `${API_URL}${d.imageUrl}`) 
    : '';
    
  const getFull = (url?: string) => 
    url ? (url.startsWith('http') ? url : `${ML_URL}${url}`) : '';

  const sortedProbs = Object.entries(d.all_probabilities || {})
    .filter(([n]) => n !== 'Other')
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8);

  const handleDownloadPDF = async () => {
    if (!d.id) return;
    setDownloading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/report/${d.id}`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CocoAI_Report_${d.id}.pdf`;
      document.body.appendChild(a);
      a.click(); 
      a.remove();
    } catch (error) {
      alert(language === 'si' ? 'වාර්තාව බාගත කිරීම අසාර්ථකයි.' : 'Failed to download report.');
    } finally { 
      setDownloading(false); 
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 animate-in fade-in">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header with PDF Download */}
        <div className="flex items-center justify-between">
          <button 
            onClick={onNewDetection} 
            className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm text-sm font-bold text-gray-700 hover:text-green-600 transition"
          >
            <ArrowLeft className="w-4 h-4"/> 
            {t.results.newDetection}
          </button>
          
          <div className="text-center">
            <h1 className="text-2xl font-black text-gray-900">
              {t.results.title}
            </h1>
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mt-1">
              <Clock className="w-3 h-3"/> 
              {new Date(d.createdAt || Date.now()).toLocaleDateString()}
              {d.location && (
                <>
                  <span className="mx-1">•</span>
                  <MapPin className="w-3 h-3"/> 
                  {d.location}
                </>
              )}
            </div>
          </div>
          
          <button 
            onClick={handleDownloadPDF} 
            disabled={!d.id || downloading} 
            className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-xl shadow-sm text-sm font-bold hover:bg-green-600 transition disabled:opacity-50"
          >
            {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4"/>} 
            PDF
          </button>
        </div>

        {/* 1. Top Result Card */}
        <div className={`p-6 rounded-3xl shadow-xl border-2 ${isHealthy ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
          <div className="flex justify-between items-center">
            <div>
              <span className={`px-3 py-1 rounded-full text-xs font-black text-white shadow-sm ${isHealthy ? 'bg-green-600' : 'bg-red-600'}`}>
                {isHealthy ? t.results.disease.healthy : d.severity?.toUpperCase() || 'CRITICAL'}
              </span>
              <h2 className="text-4xl font-black text-gray-900 mt-3 flex items-center gap-2">
                {isHealthy ? '🌿' : '⚠️'} 
                {formatName(d.disease)}
              </h2>
              {!isHealthy && (
                <p className="text-sm text-gray-500 mt-1 font-medium">
                  {t.results.disease.detected}
                </p>
              )}
            </div>
            
            <div className="bg-white p-4 rounded-2xl shadow border border-gray-100 text-center min-w-[120px]">
              <span className={`text-4xl font-black ${isHealthy ? 'text-green-600' : 'text-red-600'}`}>
                {d.confidence.toFixed(0)}%
              </span>
              <p className="text-xs font-bold text-gray-400 mt-1">
                {t.results.disease.confidence}
              </p>
            </div>
          </div>
        </div>

        {/* XAI Grid: Visuals & Reasoning */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left: Interactive Visual Diagnostics */}
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-600"/> 
                Visual Diagnostics
              </h3>
            </div>
            
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div className="relative rounded-2xl overflow-hidden bg-gray-100 aspect-video shadow-inner mb-4 flex items-center justify-center">
                <img 
                  src={imgBase} 
                  className="absolute inset-0 w-full h-full object-cover" 
                  alt="Original" 
                />
                
                {imgView === 'gradcam' && d.gradcam_url && (
                  <img 
                    src={getFull(d.gradcam_url)} 
                    style={{opacity: opacity / 100}} 
                    className="absolute inset-0 w-full h-full object-cover transition-opacity duration-200" 
                    alt="GradCAM" 
                  />
                )}
                
                {imgView === 'lime' && d.lime_url && (
                  <img 
                    src={getFull(d.lime_url)} 
                    className="absolute inset-0 w-full h-full object-cover animate-in fade-in" 
                    alt="LIME" 
                  />
                )}
                
                {imgView === 'bbox' && d.bbox_url && (
                  <img 
                    src={getFull(d.bbox_url)} 
                    className="absolute inset-0 w-full h-full object-cover animate-in fade-in" 
                    alt="BBox" 
                  />
                )}
              </div>
              
              {imgView === 'gradcam' && (
                <div className="mb-4 bg-blue-50 p-3 rounded-xl">
                  <div className="flex justify-between text-xs font-bold text-blue-800 mb-2">
                    <span>Grad-CAM Intensity</span>
                    <span>{opacity}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={opacity} 
                    onChange={e => setOpacity(Number(e.target.value))} 
                    className="w-full accent-blue-600" 
                  />
                </div>
              )}

              <div className="flex gap-2 bg-gray-100 p-1.5 rounded-xl overflow-x-auto whitespace-nowrap scroll-smooth no-scrollbar">
                {[
                  {id:'original', l:'Original', i:<Eye className="w-4 h-4"/>}, 
                  {id:'gradcam', l:'Heatmap', i:<Layers className="w-4 h-4"/>}, 
                  {id:'lime', l:'LIME', i:<Layers2 className="w-4 h-4"/>}, 
                  {id:'bbox', l:'Bounding Box', i:<Crosshair className="w-4 h-4"/>}
                ].map(tab => (
                  <button 
                    key={tab.id} 
                    onClick={() => setImgView(tab.id as any)} 
                    className={`flex-shrink-0 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                      imgView === tab.id 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.id !== 'original' && tab.i} 
                    <span>{tab.l}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Logical Explanations & Feature Importance */}
          <div className="space-y-6 flex flex-col">
            
            {/* Reasoning & Counterfactual Text */}
            {!isHealthy && (
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-6 shadow-md border border-indigo-100">
                <h3 className="font-bold text-indigo-900 flex items-center gap-2 mb-3">
                  <Brain className="w-5 h-5 text-indigo-600"/> 
                  AI Reasoning (XAI)
                </h3>
                <p className="text-sm text-indigo-800 font-medium mb-4">
                  {xaiText || 'Analysis complete.'}
                </p>
                
                <h4 className="font-bold text-purple-900 flex items-center gap-2 mb-2 mt-5 border-t border-indigo-200 pt-4">
                  <ShieldAlert className="w-4 h-4 text-purple-600"/> 
                  Counterfactual Insight
                </h4>
                <p className="text-sm text-purple-800 italic bg-white/50 p-3 rounded-xl border border-purple-100">
                  "{cfText || 'N/A'}"
                </p>
              </div>
            )}

            {/* Feature Importance Chart */}
            {d.feature_importance && Object.keys(d.feature_importance).length > 0 && (
              <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 flex-1">
                <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
                  <BarChart2 className="w-5 h-5 text-green-600"/> 
                  Feature Importance
                </h3>
                <div className="space-y-4">
                  {Object.entries(d.feature_importance).map(([feature, weight]) => (
                    <div key={feature}>
                      <div className="flex justify-between text-xs font-bold text-gray-600 mb-1">
                        <span>{feature}</span>
                        <span>{weight}%</span>
                      </div>
                      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full" 
                          style={{width: `${weight}%`}} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 4. Recommendations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 shadow-md border-l-4 border-green-500">
            <h3 className="font-black text-gray-800 mb-3 flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Leaf className="w-4 h-4 text-green-600"/>
              </div> 
              {t.results.cards.treatment}
            </h3>
            <p className="text-sm text-gray-600 font-medium leading-relaxed">
              {d.recommendation || 'Consult an agricultural expert.'}
            </p>
          </div>
          
          <div className="bg-white rounded-3xl p-6 shadow-md border-l-4 border-blue-500">
            <h3 className="font-black text-gray-800 mb-3 flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <FlaskConical className="w-4 h-4 text-blue-600"/>
              </div> 
              {t.results.cards.fertilizer}
            </h3>
            <p className="text-sm text-gray-600 font-medium leading-relaxed">
              {d.fertilizer || 'Apply balanced NPK fertilizer.'}
            </p>
          </div>
        </div>

        {/* RESTORED: All Probabilities List */}
        {sortedProbs.length > 0 && (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
            <h3 className="font-bold text-gray-800 mb-5 flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-green-600" />
              {t.results.probabilities.title}
            </h3>
            <div className="space-y-4">
              {sortedProbs.map(([name, prob]) => {
                const isTop  = name === d.disease;
                const pct    = typeof prob === 'number' ? (prob > 1 ? prob : prob * 100) : 0;
                return (
                  <div key={name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-sm ${isTop ? 'text-green-700 font-bold' : 'text-gray-600 font-medium'}`}>
                        {isTop && t.results.probabilities.predicted}
                        {formatName(name)}
                      </span>
                      <span className={`text-sm font-bold ${isTop ? 'text-green-700' : 'text-gray-500'}`}>
                        {pct.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${
                          isTop 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 shadow-sm' 
                            : 'bg-gradient-to-r from-gray-300 to-gray-400'
                        }`} 
                        style={{ width: `${Math.min(pct, 100)}%` }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* RESTORED: Action buttons at the bottom */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4">
          <button 
            onClick={onNewDetection} 
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-2 text-base"
          >
            <Leaf className="h-5 w-5" />
            {t.results.buttons.analyseAnother}
          </button>
          
          <button 
            onClick={() => onNavigate('history')} 
            className="bg-white hover:bg-gray-50 text-gray-800 font-bold py-4 rounded-2xl transition-all shadow border border-gray-200 active:scale-95 flex items-center justify-center gap-2 text-base"
          >
            <TrendingUp className="h-5 w-5 text-green-600" />
            {t.results.buttons.viewHistory}
          </button>
          
          <button 
            onClick={() => onNavigate('diseases')} 
            className="bg-white hover:bg-gray-50 text-gray-800 font-bold py-4 rounded-2xl transition-all shadow border border-gray-200 active:scale-95 flex items-center justify-center gap-2 text-base"
          >
            <Thermometer className="h-5 w-5 text-orange-500" />
            {t.results.buttons.diseaseLibrary}
          </button>
        </div>

        {/* RESTORED: Disclaimer */}
        <p className="text-center text-xs text-gray-400 pb-4 font-medium">
          {t.results.disclaimer}
        </p>

      </div>
    </div>
  );
}