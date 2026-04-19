// Frontend/src/pages/DetectPage.tsx
// ✅ FIXED: No direct ML server health check (was causing false "ML offline" error)
// ✅ FIXED: 422 response = show "Not a coconut image" message
// ✅ Frontend only talks to Node.js backend (port 5000) — never directly to Flask

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Leaf, AlertTriangle, CheckCircle, ImageOff, Loader2 } from 'lucide-react';

const API_URL     = 'http://localhost:5000/api';
const MAX_SIZE_MB = 10;

export interface AnalysisResult {
  disease:           string;
  confidence:        number;
  severity:          string;
  recommendation:    string;
  fertilizer:        string;
  gradcam_url:       string | null;
  all_probabilities: Record<string, number>;
  imageUrl?:         string;
  location?:         string;
  createdAt?:        string;
}

interface DetectPageProps {
  onAnalysisComplete: (result: AnalysisResult) => void;
}

type UploadState = 'idle' | 'ready' | 'analysing' | 'rejected' | 'error';

export default function DetectPage({ onAnalysisComplete }: DetectPageProps) {
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
      setErrorMsg('Please upload an image file (JPG, PNG, WEBP).');
      setUploadState('error');
      return;
    }
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      setErrorMsg(`Image is too large. Maximum size is ${MAX_SIZE_MB}MB.`);
      setUploadState('error');
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setUploadState('ready');
    setErrorMsg('');
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const handleRemove = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setUploadState('idle');
    setErrorMsg('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const startProgress = () => {
    setProgress(0);
    const id = setInterval(() => {
      setProgress(p => {
        if (p >= 85) { clearInterval(id); return 85; }
        return p + Math.random() * 10;
      });
    }, 300);
    return id;
  };

  const handleAnalyse = async () => {
    if (!file) return;
    setUploadState('analysing');
    setErrorMsg('');
    const progressId = startProgress();

    try {
      const token    = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('image', file);
      if (location.trim()) formData.append('location', location.trim());

      const res = await fetch(`${API_URL}/detect`, {
        method:  'POST',
        headers: { Authorization: `Bearer ${token}` },
        body:    formData,
      });

      clearInterval(progressId);
      setProgress(100);

      // ✅ 422 = Flask rejected as non-coconut image
      if (res.status === 422) {
        await new Promise(r => setTimeout(r, 300));
        setUploadState('rejected');
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data?.error === 'not_coconut_image') {
          setUploadState('rejected');
          return;
        }
        throw new Error(data.message || `Server error (${res.status})`);
      }

      const data: AnalysisResult = await res.json();
      await new Promise(r => setTimeout(r, 400));
      onAnalysisComplete({ ...data, location: location.trim() || undefined });

    } catch (err: any) {
      clearInterval(progressId);
      setProgress(0);
      setUploadState('error');
      if (err.name === 'TypeError' || err.message?.toLowerCase().includes('fetch')) {
        setErrorMsg('Cannot connect to the backend server. Make sure the Node.js backend is running on port 5000.');
      } else {
        setErrorMsg(err.message || 'Analysis failed. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg mb-4">
            <Leaf className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Coconut Disease Detection</h1>
          <p className="text-gray-500 mt-2">Upload a coconut leaf image for instant AI-powered disease analysis</p>
        </div>

        {/* ── REJECTION CARD ── */}
        {uploadState === 'rejected' && (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-7 text-center shadow-md">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-100 rounded-full mb-5">
              <ImageOff className="h-10 w-10 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-amber-800 mb-2">
              🚫 Not a Coconut Leaf Image
            </h2>
            <p className="text-amber-700 text-sm leading-relaxed mb-1">
              Our AI model analysed your image and determined it does <strong>not</strong> contain a coconut leaf or frond.
            </p>
            <p className="text-amber-600 text-xs mb-6">
              Screenshots, documents, animals, people, and other plant types cannot be diagnosed by CocoAI.
            </p>

            {preview && (
              <div className="mb-5 flex justify-center">
                <div className="relative inline-block">
                  <img src={preview} alt="Rejected" className="w-32 h-32 rounded-xl object-cover border-2 border-amber-300 opacity-60" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-red-500 rounded-full p-2 shadow-lg">
                      <X className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl p-4 mb-6 border border-amber-200 text-left">
              <p className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                For accurate results, please upload:
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>🌿 A clear photo of a coconut leaf (green, yellowing, or with spots)</li>
                <li>🌴 A photo of coconut fronds showing disease symptoms</li>
                <li>🌱 A close-up of the coconut bud, stem, or root area</li>
                <li>☀️ A well-lit image — avoid blurry or dark photos</li>
              </ul>
            </div>

            <button
              onClick={handleRemove}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold px-10 py-3.5 rounded-xl transition shadow-lg hover:shadow-xl text-base"
            >
              📸 Try a Different Image
            </button>
          </div>
        )}

        {/* ── MAIN UPLOAD CARD ── */}
        {uploadState !== 'rejected' && (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-6">
              {!file ? (
                <div
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all select-none ${
                    dragOver
                      ? 'border-green-500 bg-green-50 scale-[1.01]'
                      : 'border-gray-300 hover:border-green-400 hover:bg-green-50/50'
                  }`}
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-2xl mb-4">
                    <Upload className="h-7 w-7 text-green-600" />
                  </div>
                  <p className="text-lg font-semibold text-gray-700 mb-1">
                    {dragOver ? 'Drop your image here!' : 'Upload Coconut Leaf Image'}
                  </p>
                  <p className="text-sm text-gray-400 mb-5">Drag & drop or click to browse</p>
                  <span className="inline-block bg-green-600 text-white text-sm font-semibold px-6 py-2.5 rounded-xl shadow">
                    📁 Choose Image
                  </span>
                  <p className="text-xs text-gray-400 mt-4">JPG, PNG, WEBP — Max {MAX_SIZE_MB}MB</p>
                  <input
                    ref={fileInputRef} type="file" accept="image/*" className="hidden"
                    onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
                  />
                </div>
              ) : (
                <div className="relative">
                  <img src={preview!} alt="Preview" className="w-full rounded-2xl object-cover max-h-72 border border-gray-200" />
                  <button onClick={handleRemove} className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg transition">
                    <X className="h-4 w-4" />
                  </button>
                  <div className="mt-3 flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-2.5">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="truncate font-medium">{file.name}</span>
                    <span className="ml-auto text-gray-400 flex-shrink-0 text-xs">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 pb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📍 Location <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text" value={location} onChange={e => setLocation(e.target.value)}
                placeholder="e.g., Kurunegala, Puttalam"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:outline-none focus:border-green-500 focus:bg-white transition"
              />
            </div>

            {uploadState === 'error' && errorMsg && (
              <div className="mx-6 mb-4 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm leading-relaxed">{errorMsg}</p>
              </div>
            )}

            {uploadState === 'analysing' && (
              <div className="mx-6 mb-4">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-green-600" />
                    Analysing with AI...
                  </span>
                  <span className="font-semibold text-green-700">{Math.round(progress)}%</span>
                </div>
                <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-xs text-gray-400 mt-2 text-center">
                  Detecting disease • Generating Grad-CAM heatmap • Preparing recommendations
                </p>
              </div>
            )}

            <div className="px-6 pb-6">
              <button
                onClick={handleAnalyse}
                disabled={!file || uploadState === 'analysing'}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition shadow-lg hover:shadow-xl flex items-center justify-center gap-3 text-base"
              >
                {uploadState === 'analysing' ? (
                  <><Loader2 className="h-5 w-5 animate-spin" />Analysing...</>
                ) : (
                  <><Leaf className="h-5 w-5" />Analyse Disease</>
                )}
              </button>
              {!file && <p className="text-center text-xs text-gray-400 mt-3">Please upload a coconut leaf image to begin</p>}
            </div>
          </div>
        )}

        {(uploadState === 'idle' || uploadState === 'ready') && (
          <div className="mt-6 bg-white/80 backdrop-blur rounded-2xl border border-green-100 p-5 shadow-sm">
            <p className="text-sm font-semibold text-gray-700 mb-3">💡 Tips for Best Results</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                ['📸', 'Take photo in good natural lighting'],
                ['🎯', 'Focus on the affected leaf area'],
                ['🌿', 'Include the full leaf in the frame'],
                ['🚫', 'Avoid screenshots or documents'],
              ].map(([icon, tip]) => (
                <div key={tip} className="flex items-center gap-2 bg-green-50 rounded-xl px-3 py-2.5 text-xs text-gray-600">
                  <span className="text-base">{icon}</span><span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}