import { Calendar, Filter, Search, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Prediction, supabase } from '../lib/supabase';

interface HistoryPageProps {
  onNavigate: (page: string) => void;
}

export default function HistoryPage({ onNavigate }: HistoryPageProps) {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [filteredPredictions, setFilteredPredictions] = useState<Prediction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDisease, setFilterDisease] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPredictions();
  }, []);

  useEffect(() => {
    filterResults();
  }, [searchTerm, filterDisease, predictions]);

  const fetchPredictions = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('predictions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (data) {
      setPredictions(data);
      setFilteredPredictions(data);
    }
    setIsLoading(false);
  };

  const filterResults = () => {
    let filtered = predictions;

    if (filterDisease !== 'all') {
      filtered = filtered.filter((p) => p.predicted_disease === filterDisease);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.predicted_disease.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredPredictions(filtered);
  };

  const uniqueDiseases = Array.from(new Set(predictions.map((p) => p.predicted_disease)));

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600 bg-green-100';
    if (confidence >= 0.7) return 'text-yellow-600 bg-yellow-100';
    return 'text-orange-600 bg-orange-100';
  };

  const stats = {
    total: predictions.length,
    healthy: predictions.filter((p) => p.predicted_disease === 'Healthy').length,
    diseased: predictions.filter((p) => p.predicted_disease !== 'Healthy').length,
    avgConfidence:
      predictions.length > 0
        ? predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length
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
            Review past disease detection results and track trends
          </p>
        </div>

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
              {(stats.avgConfidence * 100).toFixed(0)}%
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by disease or location..."
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
                className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white cursor-pointer"
              >
                <option value="all">All Diseases</option>
                {uniqueDiseases.map((disease) => (
                  <option key={disease} value={disease}>
                    {disease}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading predictions...</p>
            </div>
          ) : filteredPredictions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg mb-4">No predictions found</p>
              <button
                onClick={() => onNavigate('detect')}
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Start First Detection
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPredictions.map((prediction) => (
                <div
                  key={prediction.id}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative h-48 bg-gray-100">
                    <img
                      src={prediction.image_url}
                      alt="Prediction"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {prediction.predicted_disease}
                        </h3>
                        {prediction.location && (
                          <p className="text-sm text-gray-500">{prediction.location}</p>
                        )}
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(prediction.confidence)}`}
                      >
                        {(prediction.confidence * 100).toFixed(0)}%
                      </span>
                    </div>

                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(prediction.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>

                    {prediction.notes && (
                      <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                        {prediction.notes}
                      </p>
                    )}
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
