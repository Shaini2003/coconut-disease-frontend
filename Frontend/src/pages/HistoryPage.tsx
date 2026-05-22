// Frontend/src/pages/HistoryPage.tsx
// ✅ UPGRADED PREMIUM UI: Added PDF Download from History, Progress Bars, XAI Badges, and Hover Animations

import { Calendar, Filter, Search, TrendingUp, Download, FileText, Activity, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from '../i18n';

const API_URL = 'http://localhost:5000/api';

interface HistoryPageProps { onNavigate: (page: string) => void; }
interface Detection { 
  id: number; 
  image_url: string; 
  predicted_disease: string; 
  confidence: number; 
  gradcam_url: string | null; 
  recommendation: string; 
  created_at: string; 
}

export default function HistoryPage({ onNavigate }: HistoryPageProps) {
  const { t, language } = useTranslation();
  const [detections, setDetections] = useState<Detection[]>([]);
  const [filtered,   setFiltered]   = useState<Detection[]>([]);
  const [searchTerm,     setSearchTerm]     = useState('');
  const [filterDisease,  setFilterDisease]  = useState('all');
  const [isLoading,  setIsLoading]  = useState(true);
  const [error,      setError]      = useState('');
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  useEffect(() => { fetchHistory(); }, []);
  useEffect(() => { filterResults(); }, [searchTerm, filterDisease, detections]);

  const fetchHistory = async () => {
    setIsLoading(true); setError('');
    try {
      const token = localStorage.getItem('token');
      const res   = await fetch(`${API_URL}/detect/history`, { headers: { Authorization: `Bearer ${token}` } });
      const data  = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      // Fix confidence if it's stored as 0.x instead of percentage
      const formattedHistory = (data.history || []).map((d: any) => ({
        ...d,
        confidence: d.confidence <= 1 ? d.confidence * 100 : d.confidence
      }));

      setDetections(formattedHistory); 
      setFiltered(formattedHistory);
    } catch { 
      setError(t.history.error); 
    } finally { 
      setIsLoading(false); 
    }
  };

  const filterResults = () => {
    let result = detections;
    if (filterDisease !== 'all') result = result.filter((d) => d.predicted_disease === filterDisease);
    if (searchTerm) result = result.filter((d) => d.predicted_disease.toLowerCase().includes(searchTerm.toLowerCase()));
    setFiltered(result);
  };

  // 🔥 NEW: Download PDF directly from History
  const handleDownloadPDF = async (id: number) => {
    setDownloadingId(id);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/report/${id}?lang=${language}`, { 
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
      alert(language === 'si' ? 'වාර්තාව බාගත කිරීම අසාර්ථකයි.' : 'Failed to download report.');
    } finally { 
      setDownloadingId(null); 
    }
  };

  const uniqueDiseases = Array.from(new Set(detections.map((d) => d.predicted_disease)));
  const isHealthy = (disease: string) => disease === 'Healthy_Leaves' || disease === 'Healthy';
  
  const getConfColor = (c: number) => c >= 90 ? 'bg-green-500' : c >= 70 ? 'bg-yellow-500' : 'bg-orange-500';
  const getConfTextColor = (c: number) => c >= 90 ? 'text-green-700' : c >= 70 ? 'text-yellow-700' : 'text-orange-700';
  
  const stats = { 
    total: detections.length, 
    healthy: detections.filter((d) => isHealthy(d.predicted_disease)).length, 
    diseased: detections.filter((d) => !isHealthy(d.predicted_disease)).length, 
    avgConf: detections.length > 0 ? detections.reduce((s, d) => s + d.confidence, 0) / detections.length : 0 
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* ── HERO HEADER ── */}
      <div className="bg-gradient-to-br from-green-800 to-emerald-700 text-white py-12 px-6 shadow-md mb-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">{t.history.title}</h1>
          <p className="text-green-100 text-lg max-w-2xl mx-auto opacity-90">{t.history.subtitle}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-14 relative z-10">
        
        {/* ── STATS CARDS ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: t.history.stats.totalScans, val: stats.total, icon: <TrendingUp className="h-6 w-6 text-blue-600" />, bg: 'bg-blue-50', color: 'text-gray-900' },
            { label: t.history.stats.healthy,    val: stats.healthy, icon: <Activity className="h-6 w-6 text-green-600" />, bg: 'bg-green-50', color: 'text-green-600' },
            { label: t.history.stats.diseased,   val: stats.diseased, icon: <Activity className="h-6 w-6 text-red-600" />, bg: 'bg-red-50', color: 'text-red-600' },
            { label: t.history.stats.avgConf,    val: stats.avgConf.toFixed(1) + '%', icon: <FileText className="h-6 w-6 text-purple-600" />, bg: 'bg-purple-50', color: 'text-purple-600' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className={`w-12 h-12 rounded-full ${s.bg} flex items-center justify-center flex-shrink-0`}>
                {s.icon}
              </div>
              <div>
                <p className="text-gray-500 text-sm font-medium">{s.label}</p>
                <h3 className={`text-2xl font-bold ${s.color}`}>{s.val}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* ── SEARCH & FILTERS ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input 
              type="text" 
              placeholder={t.history.searchPlaceholder} 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white transition-all text-sm font-medium" 
            />
          </div>
          <div className="relative w-full md:w-72">
            <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select 
              value={filterDisease} 
              onChange={(e) => setFilterDisease(e.target.value)}
              className="w-full pl-12 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 bg-white cursor-pointer text-sm font-medium appearance-none"
            >
              <option value="all">{t.history.filterAll}</option>
              {uniqueDiseases.map((d) => (<option key={d} value={d}>{d.replace(/_/g, ' ')}</option>))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>
        </div>

        {/* ── HISTORY GRID ── */}
        {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center font-medium mb-6">{error}</div>}
        
        {isLoading ? (
          <div className="text-center py-20">
            <Loader2 className="animate-spin h-10 w-10 text-green-600 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">{t.history.loading}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-10 w-10 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium text-lg mb-6">{t.history.noResults}</p>
            <button onClick={() => onNavigate('detect')} className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
              {t.history.startFirst}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((d) => {
              const isOk = isHealthy(d.predicted_disease);
              return (
                <div key={d.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col">
                  
                  {/* Image Section */}
                  <div className="relative h-52 bg-gray-100 overflow-hidden">
                    <img 
                      src={`http://localhost:5000${d.image_url}`} 
                      alt="Detection" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=Image+Not+Found'; }} 
                    />
                    {/* Status Badge */}
                    <div className={`absolute top-3 right-3 px-3 py-1.5 rounded-full text-xs font-extrabold shadow-sm backdrop-blur-sm ${isOk ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'}`}>
                      {isOk ? t.history.healthyLabel : t.history.diseasedLabel}
                    </div>
                    {/* XAI Badge */}
                    {d.gradcam_url && (
                      <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-purple-600/90 text-white text-[10px] font-bold shadow-sm backdrop-blur-sm">
                        XAI Verified
                      </div>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-extrabold text-gray-900 text-lg mb-1">{d.predicted_disease.replace(/_/g, ' ')}</h3>
                    
                    <div className="flex items-center text-xs text-gray-500 font-medium mb-4">
                      <Calendar className="h-3.5 w-3.5 mr-1.5" />
                      {new Date(d.created_at).toLocaleDateString(language === 'si' ? 'si-LK' : 'en-GB', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>

                    {/* Confidence Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-gray-500">AI Confidence</span>
                        <span className={getConfTextColor(d.confidence)}>{d.confidence.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className={`h-2 rounded-full ${getConfColor(d.confidence)}`} style={{ width: `${Math.min(d.confidence, 100)}%` }}></div>
                      </div>
                    </div>

                    <div className="flex-1">
                      {d.recommendation && !isOk && (
                        <p className="text-sm text-gray-600 line-clamp-2 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                          <span className="font-bold text-gray-700">Treatment: </span>{d.recommendation}
                        </p>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="mt-5 pt-4 border-t border-gray-100">
                      <button 
                        onClick={() => handleDownloadPDF(d.id)}
                        disabled={downloadingId === d.id}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white border-2 border-green-600 text-green-700 rounded-xl font-bold hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {downloadingId === d.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        {language === 'si' ? 'වාර්තාව බාගන්න' : 'Download PDF Report'}
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}