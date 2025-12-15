import { AlertTriangle, CheckCircle, Search, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DiseaseInfo, supabase } from '../lib/supabase';

export default function DiseasesPage() {
  const [diseases, setDiseases] = useState<DiseaseInfo[]>([]);
  const [filteredDiseases, setFilteredDiseases] = useState<DiseaseInfo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [selectedDisease, setSelectedDisease] = useState<DiseaseInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDiseases();
  }, []);

  useEffect(() => {
    filterDiseases();
  }, [searchTerm, selectedSeverity, diseases]);

  const fetchDiseases = async () => {
    setIsLoading(true);
    const { data } = await supabase.from('disease_info').select('*').order('name');

    if (data) {
      setDiseases(data);
      setFilteredDiseases(data);
    }
    setIsLoading(false);
  };

  const filterDiseases = () => {
    let filtered = diseases;

    if (selectedSeverity !== 'all') {
      filtered = filtered.filter((d) => d.severity === selectedSeverity);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (d) =>
          d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredDiseases(filtered);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'High':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'Critical':
      case 'High':
        return <XCircle className="h-5 w-5" />;
      case 'Medium':
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return <CheckCircle className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Coconut Disease Library
          </h1>
          <p className="text-lg text-gray-600">
            Learn about common coconut diseases, their symptoms, and treatment methods
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search diseases..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-2">
              {['all', 'Critical', 'High', 'Medium', 'Low'].map((severity) => (
                <button
                  key={severity}
                  onClick={() => setSelectedSeverity(severity)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedSeverity === severity
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {severity === 'all' ? 'All' : severity}
                </button>
              ))}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading disease information...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDiseases.map((disease) => (
              <div
                key={disease.id}
                onClick={() => setSelectedDisease(disease)}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
              >
                {disease.image_url && (
                  <div className="h-48 overflow-hidden bg-gray-100">
                    <img
                      src={disease.image_url}
                      alt={disease.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-semibold text-gray-900">{disease.name}</h3>
                    <span
                      className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(disease.severity)}`}
                    >
                      {getSeverityIcon(disease.severity)}
                      <span>{disease.severity}</span>
                    </span>
                  </div>

                  {disease.scientific_name && (
                    <p className="text-sm text-gray-500 italic mb-3">{disease.scientific_name}</p>
                  )}

                  <p className="text-gray-700 text-sm line-clamp-3 mb-4">
                    {disease.description}
                  </p>

                  <button className="text-green-600 text-sm font-medium hover:text-green-700">
                    Learn More →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedDisease && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedDisease.name}</h2>
                  {selectedDisease.scientific_name && (
                    <p className="text-gray-500 italic">{selectedDisease.scientific_name}</p>
                  )}
                </div>
                <button
                  onClick={() => setSelectedDisease(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6">
                {selectedDisease.image_url && (
                  <img
                    src={selectedDisease.image_url}
                    alt={selectedDisease.name}
                    className="w-full h-64 object-cover rounded-lg mb-6"
                  />
                )}

                <div
                  className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium border mb-6 ${getSeverityColor(selectedDisease.severity)}`}
                >
                  {getSeverityIcon(selectedDisease.severity)}
                  <span>Severity: {selectedDisease.severity}</span>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                    <p className="text-gray-700 leading-relaxed">{selectedDisease.description}</p>
                  </div>

                  {selectedDisease.symptoms.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Symptoms</h3>
                      <ul className="space-y-2">
                        {selectedDisease.symptoms.map((symptom, index) => (
                          <li key={index} className="flex items-start text-gray-700">
                            <span className="text-green-600 mr-2 mt-1">•</span>
                            <span>{symptom}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedDisease.causes.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Causes</h3>
                      <ul className="space-y-2">
                        {selectedDisease.causes.map((cause, index) => (
                          <li key={index} className="flex items-start text-gray-700">
                            <span className="text-green-600 mr-2 mt-1">•</span>
                            <span>{cause}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedDisease.treatment && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Treatment</h3>
                      <p className="text-gray-700 leading-relaxed">{selectedDisease.treatment}</p>
                    </div>
                  )}

                  {selectedDisease.prevention && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Prevention</h3>
                      <p className="text-gray-700 leading-relaxed">{selectedDisease.prevention}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
