import { AlertCircle, Camera, Upload, X } from 'lucide-react';
import { useState } from 'react';

interface DetectPageProps {
  onAnalysisComplete: (result: AnalysisResult) => void;
}

export interface AnalysisResult {
  imageUrl: string;
  predictedDisease: string;
  confidence: number;
  gradcamUrl: string;
  timestamp: Date;
}

export default function DetectPage({ onAnalysisComplete }: DetectPageProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const simulateAnalysis = () => {
    setIsAnalyzing(true);

    setTimeout(() => {
      const diseases = [
        { name: 'Lethal Yellowing', confidence: 0.94 },
        { name: 'Leaf Spot', confidence: 0.89 },
        { name: 'Bud Rot', confidence: 0.92 },
        { name: 'Stem Bleeding', confidence: 0.87 },
        { name: 'Healthy', confidence: 0.96 },
      ];

      const randomDisease = diseases[Math.floor(Math.random() * diseases.length)];

      const result: AnalysisResult = {
        imageUrl: selectedImage!,
        predictedDisease: randomDisease.name,
        confidence: randomDisease.confidence,
        gradcamUrl: selectedImage!,
        timestamp: new Date(),
      };

      setIsAnalyzing(false);
      onAnalysisComplete(result);
    }, 3000);
  };

  const clearImage = () => {
    setSelectedImage(null);
    setLocation('');
    setNotes('');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Coconut Disease Detection
          </h1>
          <p className="text-lg text-gray-600">
            Upload an image of a coconut leaf or tree for instant AI-powered disease analysis
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-6">
          {!selectedImage ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="border-3 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-green-500 transition-colors cursor-pointer"
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
                Supports: JPG, PNG, JPEG (Max 10MB)
              </p>
            </div>
          ) : (
            <div>
              <div className="relative mb-6">
                <img
                  src={selectedImage}
                  alt="Selected coconut leaf"
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
                    placeholder="Any additional observations or symptoms you've noticed..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <button
                onClick={simulateAnalysis}
                disabled={isAnalyzing}
                className="w-full py-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Analyzing Image...
                  </>
                ) : (
                  'Analyze for Disease'
                )}
              </button>
            </div>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start">
            <AlertCircle className="h-6 w-6 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">Tips for Best Results</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Capture images in good natural lighting</li>
                <li>• Ensure the leaf or affected area is clearly visible</li>
                <li>• Avoid blurry or out-of-focus images</li>
                <li>• Include the entire leaf if possible</li>
                <li>• For tree diseases, capture the affected trunk or crown area</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
