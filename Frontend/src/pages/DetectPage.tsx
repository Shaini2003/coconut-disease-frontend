// Frontend/src/pages/DetectPage.tsx
// ✅ FULL CODE: Includes 422 Non-Coconut Image Rejection & Sleek UI

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Leaf, AlertTriangle, CheckCircle, ImageOff, Loader2 } from 'lucide-react';
import { useTranslation } from '../i18n';

const API_URL     = 'http://localhost:5000/api';
const MAX_SIZE_MB = 10;

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

interface DetectPageProps {
  onAnalysisComplete: (result: AnalysisResult) => void;
}

type UploadState = 'idle' | 'ready' | 'analysing' | 'rejected' | 'error';

export default function DetectPage({ onAnalysisComplete }: DetectPageProps) {
  const { t, language } = useTranslation();
  const [file,        setFile]        = useState<File | null>(null);
  const [preview,     setPreview]     = useState<string | null>(null);
  const [location,    setLocation]    = useState('');
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [errorMsg,    setErrorMsg]    = useState('');
  const [dragOver,    setDragOver]    = useState(false);
  const [progress,    setProgress]    = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith('image/')) {
      setErrorMsg(t.detect.errors.invalidType);
      setUploadState('error');
      return;
    }
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      setErrorMsg(t.detect.errors.tooLarge);
      setUploadState('error');
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setUploadState('ready');
    setErrorMsg('');
  }, [t]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const handleRemove = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null); setPreview(null);
    setUploadState('idle'); setErrorMsg('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const startProgress = () => {
    setProgress(0);
    const id = setInterval(() => {
      setProgress(p => { if (p >= 85) { clearInterval(id); return 85; } return p + Math.random() * 10; });
    }, 300);
    return id;
  };

  const handleAnalyse = async () => {
    if (!file) return;
    setUploadState('analysing'); setErrorMsg('');
    const pid = startProgress();
    try {
      const token = localStorage.getItem('token');
      const fd    = new FormData();
      fd.append('image', file);
      if (location.trim()) fd.append('location', location.trim());

      const res = await fetch(`${API_URL}/detect`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd,
      });
      
      clearInterval(pid); setProgress(100);

      // 422 - Non-coconut image handling
      if (res.status === 422) {
        await new Promise(r => setTimeout(r, 300));
        setUploadState('rejected');
        return;
      }
      
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || `Server error (${res.status})`);
      }
      
      const data: AnalysisResult = await res.json();
      await new Promise(r => setTimeout(r, 400));
      onAnalysisComplete({ ...data, location: location.trim() || undefined });
      
    } catch (err: any) {
      clearInterval(pid); setProgress(0); setUploadState('error');
      if (err.message?.toLowerCase().includes('fetch') || err.message?.includes('network')) {
        setErrorMsg(language === 'si' ? 'සේවාදායකය (Backend) ක්‍රියාත්මක නොවේ. කරුණාකර Port 5000 පරීක්ෂා කරන්න.' : t.detect.errors.noBackend);
      } else {
        setErrorMsg(err.message || t.detect.errors.general);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 py-10 px-4 animate-in fade-in duration-500">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl shadow-lg mb-4 transform transition hover:scale-105">
            <Leaf className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{t.detect.title}</h1>
          <p className="text-gray-500 mt-2 font-medium">{t.detect.subtitle}</p>
        </div>

        {/* Rejection Card (422 Not a coconut) */}
        {uploadState === 'rejected' && (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-8 text-center shadow-lg animate-in zoom-in-95 duration-300">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-100 rounded-full mb-5 shadow-inner">
              <ImageOff className="h-10 w-10 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-amber-900 mb-2">{t.detect.rejection.title}</h2>
            <p className="text-amber-800 text-sm leading-relaxed mb-1 font-medium">{t.detect.rejection.desc}</p>
            <p className="text-amber-600 text-xs mb-6 font-semibold">{t.detect.rejection.note}</p>
            {preview && (
              <div className="mb-6 flex justify-center">
                <div className="relative inline-block group">
                  <img src={preview} alt="Rejected" className="w-32 h-32 rounded-2xl object-cover border-2 border-amber-300 opacity-70 group-hover:opacity-100 transition" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-red-500 rounded-full p-2 shadow-lg"><X className="h-5 w-5 text-white" /></div>
                  </div>
                </div>
              </div>
            )}
            <div className="bg-white/80 rounded-2xl p-5 mb-6 border border-amber-200 text-left shadow-sm">
              <p className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />{t.detect.rejection.uploadTitle}
              </p>
              <ul className="space-y-2">
                {t.detect.rejection.items.map((item: string) => (
                  <li key={item} className="text-sm text-gray-700 font-medium">🌿 {item}</li>
                ))}
              </ul>
            </div>
            <button onClick={handleRemove}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold px-10 py-4 rounded-2xl transition-all shadow-lg active:scale-95 text-base">
              {t.detect.rejection.tryAgain}
            </button>
          </div>
        )}

        {/* Main Upload Card */}
        {uploadState !== 'rejected' && (
          <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden transition-all duration-300">
            <div className="p-7">
              {!file ? (
                <div
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-[1.5rem] p-12 text-center cursor-pointer transition-all duration-300 select-none ${
                    dragOver ? 'border-green-500 bg-green-50 scale-[1.02]' : 'border-gray-300 hover:border-green-400 hover:bg-green-50/30'
                  }`}
                >
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-3xl mb-5 shadow-inner">
                    <Upload className="h-8 w-8 text-green-600" />
                  </div>
                  <p className="text-xl font-bold text-gray-800 mb-1">
                    {dragOver ? t.detect.dropzone.dragging : t.detect.dropzone.title}
                  </p>
                  <p className="text-sm font-medium text-gray-400 mb-6">{t.detect.dropzone.desc}</p>
                  <span className="inline-block bg-green-600 text-white text-sm font-bold px-8 py-3 rounded-xl shadow transition hover:bg-green-700 active:scale-95">
                    📁 {t.detect.dropzone.button}
                  </span>
                  <p className="text-xs font-semibold text-gray-400 mt-5">{t.detect.dropzone.formats}</p>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                    onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
                </div>
              ) : (
                <div className="relative animate-in zoom-in-95 duration-300">
                  <img src={preview!} alt="Preview" className="w-full rounded-3xl object-cover max-h-80 border-2 border-gray-100 shadow-md" />
                  <button onClick={handleRemove} className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-xl transition transform hover:scale-110 active:scale-95">
                    <X className="h-5 w-5" />
                  </button>
                  <div className="mt-4 flex items-center gap-3 text-sm text-gray-700 bg-gray-50/80 rounded-2xl px-5 py-3 border border-gray-100 font-medium">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="truncate">{file.name}</span>
                    <span className="ml-auto text-gray-400 text-xs font-bold bg-white px-2 py-1 rounded-md shadow-sm">{(file.size/1024/1024).toFixed(2)} {t.detect.fileInfo}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Location */}
            <div className="px-7 pb-5">
              <label className="block text-sm font-bold text-gray-800 mb-2">
                📍 {t.detect.location} <span className="text-gray-400 font-medium">{t.detect.locationOptional}</span>
              </label>
              <input type="text" value={location} onChange={e => setLocation(e.target.value)}
                placeholder={t.detect.locationPlaceholder}
                className="w-full border-2 border-gray-200 rounded-2xl px-5 py-3.5 text-sm font-medium bg-gray-50 focus:outline-none focus:border-green-500 focus:bg-white transition shadow-sm" />
            </div>

            {/* Error Message */}
            {uploadState === 'error' && errorMsg && (
              <div className="mx-7 mb-5 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3 animate-in shake duration-300">
                <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-800 text-sm leading-relaxed font-semibold">{errorMsg}</p>
              </div>
            )}

            {/* Progress Bar */}
            {uploadState === 'analysing' && (
              <div className="mx-7 mb-5 animate-in fade-in">
                <div className="flex items-center justify-between text-sm text-gray-700 mb-3 font-bold">
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-green-600" />{t.detect.analyzing}
                  </span>
                  <span className="text-green-700">{Math.round(progress)}%</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                  <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            {/* Analyze Button */}
            <div className="px-7 pb-7">
              <button onClick={handleAnalyse} disabled={!file || uploadState === 'analysing'}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-extrabold py-4 rounded-2xl transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-3 text-base">
                {uploadState === 'analysing'
                  ? <><Loader2 className="h-6 w-6 animate-spin" />{t.detect.analyzing}</>
                  : <><Leaf className="h-6 w-6" />{t.detect.analyzeButton}</>
                }
              </button>
            </div>
          </div>
        )}

        {/* Tips Section */}
        {(uploadState === 'idle' || uploadState === 'ready') && (
          <div className="mt-6 bg-white/80 backdrop-blur rounded-[2rem] border border-green-100 p-6 shadow-sm">
            <p className="text-sm font-extrabold text-green-800 mb-4 px-2">💡 {t.detect.tips.title}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                ['📸', t.detect.tips.tip1],
                ['🎯', t.detect.tips.tip2],
                ['🌿', t.detect.tips.tip3],
                ['🚫', t.detect.tips.tip4],
              ].map(([icon, tip]) => (
                <div key={tip} className="flex items-center gap-3 bg-green-50/50 border border-green-100 rounded-2xl px-4 py-3 text-sm text-gray-700 font-semibold hover:bg-green-50 transition">
                  <span className="text-xl">{icon}</span><span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}