import { Calendar, Filter, Search, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

const API_URL = 'http://localhost:5000/api';

interface HistoryPageProps {
  onNavigate: (page: string) => void;
}

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
  const [detections, setDetections] = useState<Detection[]>([]);
  const [filtered, setFiltered] = useState<Detection[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDisease, setFilterDisease] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    filterResults();
  }, [searchTerm, filterDisease, detections]);

  const fetchHistory = async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/detect/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setDetections(data.history || []);
      setFiltered(data.history || []);
    } catch (err: any) {
      setError('Failed to load history. Make sure backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const filterResults = () => {
    let result = detections;
    if (filterDisease !== 'all') {
      result = result.filter((d) => d.predicted_disease === filterDisease);
    }
    if (searchTerm) {
      result = result.filter((d) =>
        d.predicted_disease.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFiltered(result);
  };

  const uniqueDiseases = Array.from(new Set(detections.map((d) => d.predicted_disease)));

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600 bg-green-100';
    if (confidence >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-orange-600 bg-orange-100';
  };

  const isHealthy = (disease: string) =>
    disease === 'Healthy_Leaves' || disease === 'Healthy';

  const stats = {
    total: detections.length,
    healthy: detections.filter((d) => isHealthy(d.predicted_disease)).length,
    diseased: detections.filter((d) => !isHealthy(d.predicted_disease)).length,
    avgConfidence:
      detections.length > 0
        ? detections.reduce((sum, d) => sum + d.confidence, 0) / detections.length
        : 0,
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Detection History
          </h1>
          <p className="text-lg text-gray-600">
            Review your past disease detection results
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Total Scans</span>
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Healthy Trees</span>
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
            </div>
            <div className="text-3xl font-bold text-green-600">{stats.healthy}</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Diseased Trees</span>
              <div className="h-3 w-3 rounded-full bg-red-500"></div>
            </div>
            <div className="text-3xl font-bold text-red-600">{stats.diseased}</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Avg Confidence</span>
              <div className="h-3 w-3 rounded-full bg-blue-500"></div>
            </div>
            <div className="text-3xl font-bold text-blue-600">
              {stats.avgConfidence.toFixed(1)}%
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          {/* Search & Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by disease name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={filterDisease}
                onChange={(e) => setFilterDisease(e.target.value)}
                className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 bg-white cursor-pointer"
              >
                <option value="all">All Diseases</option>
                {uniqueDiseases.map((d) => (
                  <option key={d} value={d}>{d.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="text-center py-8 text-red-500">{error}</div>
          )}

          {/* Loading */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading history...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg mb-4">No detections found</p>
              <button
                onClick={() => onNavigate('detect')}
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Start First Detection
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((detection) => (
                <div
                  key={detection.id}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative h-48 bg-gray-100">
                    <img
                      src={`http://localhost:5000${detection.image_url}`}
                      alt="Detection"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://via.placeholder.com/400x200?text=Image+Not+Found';
                      }}
                    />
                    <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold ${
                      isHealthy(detection.predicted_disease)
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {isHealthy(detection.predicted_disease) ? '✅ Healthy' : '⚠️ Diseased'}
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">
                        {detection.predicted_disease.replace(/_/g, ' ')}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(detection.confidence)}`}>
                        {detection.confidence.toFixed(1)}%
                      </span>
                    </div>

                    {detection.recommendation && (
                      <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                        {detection.recommendation}
                      </p>
                    )}

                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(detection.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}