// Frontend/src/pages/DetectPage.tsx

import { AlertCircle, Camera, Upload, X } from 'lucide-react';
import { useState } from 'react';

const API_URL = 'http://localhost:5000/api';

interface DetectPageProps {
  onAnalysisComplete: (result: AnalysisResult) => void;
}

export interface AnalysisResult {
  id?:              number;
  imageUrl:         string;
  predictedDisease: string;
  confidence:       number;
  gradcamUrl:       string | null;
  recommendation:   string;
  fertilizer:       string;
  severity:         string;
  allProbabilities: Record<string, number>;
  timestamp:        Date;
}

export default function DetectPage({ onAnalysisComplete }: DetectPageProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile,  setSelectedFile]  = useState<File | null>(null);
  const [isAnalyzing,   setIsAnalyzing]   = useState(false);
  const [error,         setError]         = useState('');
  const [isInvalidImage, setIsInvalidImage] = useState(false);
  const [location,      setLocation]      = useState('');
  const [notes,         setNotes]         = useState('');

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
      setError('');
      setIsInvalidImage(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
      setError('');
      setIsInvalidImage(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setIsAnalyzing(true);
    setError('');
    setIsInvalidImage(false);

    try {
      const token    = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('image', selectedFile);

      const res = await fetch(`${API_URL}/detect`, {
        method:  'POST',
        headers: { Authorization: `Bearer ${token}` },
        body:    formData,
      });

      const data = await res.json();

      // ── 422 = Flask rejected it as not a coconut leaf ─────────────────────
      if (res.status === 422) {
        setIsInvalidImage(true);
        setError(data.message || 'This does not appear to be a coconut leaf.');
        setIsAnalyzing(false);
        return;
      }

      if (!res.ok) {
        setError(data.message || 'Detection failed. Please try again.');
        setIsAnalyzing(false);
        return;
      }

      const result: AnalysisResult = {
        id:               data.id,
        imageUrl:         selectedImage!,
        predictedDisease: data.disease,
        confidence:       data.confidence,
        gradcamUrl:       data.gradcam_url
                            ? `http://localhost:8000${data.gradcam_url}`
                            : null,
        recommendation:   data.recommendation,
        fertilizer:       data.fertilizer   || 'Apply balanced NPK fertilizer.',
        severity:         data.severity     || 'Unknown',
        allProbabilities: data.all_probabilities || {},
        timestamp:        new Date(),
      };

      onAnalysisComplete(result);

    } catch (err: any) {
      // Network error = backend not reachable
      setError('Cannot connect to backend. Make sure the backend server is running on port 5000.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setSelectedFile(null);
    setLocation('');
    setNotes('');
    setError('');
    setIsInvalidImage(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">

        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Coconut Disease Detection
          </h1>
          <p className="text-lg text-gray-600">
            Upload a coconut leaf image for instant AI-powered disease analysis
          </p>
        </div>

        {/* ── Invalid image error — big clear alert ──────────────────────── */}
        {isInvalidImage && (
          <div className="mb-6 rounded-2xl border-2 border-red-400 bg-red-50 overflow-hidden">
            {/* Red header bar */}
            <div className="bg-red-500 px-6 py-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-red-500 text-xl">🚫</span>
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">Not a Coconut Leaf Image</h3>
                <p className="text-red-100 text-sm">Our AI detected this is not a valid coconut leaf photo</p>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              <div className="flex items-start gap-3 mb-5">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm leading-relaxed">{error}</p>
              </div>

              {/* What to upload guide */}
              <div className="bg-white rounded-xl border border-red-200 p-4 mb-5">
                <p className="text-sm font-semibold text-gray-800 mb-3">
                  ✅ Please upload one of these:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { emoji: '🌿', text: 'Healthy coconut leaf photo' },
                    { emoji: '🍂', text: 'Diseased coconut leaf photo' },
                    { emoji: '🌴', text: 'Coconut palm frond close-up' },
                    { emoji: '📸', text: 'Clear outdoor leaf image' },
                  ].map(item => (
                    <div key={item.text} className="flex items-center gap-2 text-sm text-gray-700">
                      <span>{item.emoji}</span>
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* What NOT to upload */}
              <div className="bg-red-100 rounded-xl border border-red-200 p-4 mb-5">
                <p className="text-sm font-semibold text-red-800 mb-3">
                  ❌ Do not upload:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { emoji: '📱', text: 'Phone or app screenshots' },
                    { emoji: '📄', text: 'Documents or PDFs' },
                    { emoji: '🌃', text: 'Dark or blurry images' },
                    { emoji: '🖼️', text: 'Non-plant photos' },
                  ].map(item => (
                    <div key={item.text} className="flex items-center gap-2 text-sm text-red-700">
                      <span>{item.emoji}</span>
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Try again button */}
              <button
                onClick={clearImage}
                className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-xl transition"
              >
                <Upload className="w-5 h-5" />
                Try Again with a Coconut Leaf Image
              </button>
            </div>
          </div>
        )}

        {/* ── General error (non-invalid-image) ──────────────────────────── */}
        {error && !isInvalidImage && (
          <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-yellow-800 text-sm">Detection Error</p>
              <p className="text-yellow-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* ── Upload area ─────────────────────────────────────────────────── */}
        {!isInvalidImage && (
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-6">
            {!selectedImage ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-green-500 transition-colors cursor-pointer"
              >
                <div className="flex justify-center mb-4">
                  <div className="bg-green-100 p-4 rounded-full">
                    <Upload className="h-12 w-12 text-green-600" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Upload Coconut Leaf Image
                </h3>
                <p className="text-gray-600 mb-4">
                  Drag and drop your image here, or click to browse
                </p>
                <label className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 cursor-pointer transition-colors">
                  <Camera className="h-5 w-5 mr-2" />
                  Choose Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>
                <p className="text-sm text-gray-500 mt-4">
                  Supports: JPG, PNG, WEBP (Max 10MB) — <strong>Coconut leaves only</strong>
                </p>
              </div>
            ) : (
              <div>
                <div className="relative mb-6">
                  <img
                    src={selectedImage}
                    alt="Selected leaf"
                    className="w-full h-96 object-contain rounded-lg bg-gray-100"
                  />
                  <button
                    onClick={clearImage}
                    className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location (Optional)
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g., Kurunegala, Puttalam"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any additional observations about the leaf..."
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="w-full py-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-3"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Analyzing with AI Model...
                    </>
                  ) : (
                    '🔍 Analyze for Disease'
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">Tips for Best Results</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>🌿 <strong>Upload only coconut leaf photos</strong> — other images will be rejected</li>
                <li>☀️ Capture in good natural outdoor lighting</li>
                <li>🔍 Make the leaf or affected area clearly visible</li>
                <li>📷 Avoid blurry, dark, or out-of-focus images</li>
                <li>🚫 Do not upload screenshots, documents, or non-plant images</li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}