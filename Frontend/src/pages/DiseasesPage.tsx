import { AlertTriangle, CheckCircle, Search, XCircle, Database } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DiseaseInfo, supabase } from '../lib/supabase';
import { getDiseaseThumbnailImage } from '../lib/imageMap';

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

const loadMockData = () => {
    // Extended fallback data to fully test the UI and filters
    const mockData: DiseaseInfo[] = [
      {
        id: '1',
        name: 'Bud Rot',
        scientific_name: 'Phytophthora palmivora',
        description: 'A fatal disease causing the rotting of the heart or bud of the coconut palm. It usually occurs during periods of high rainfall and humidity.',
        severity: 'Critical',
        symptoms: ['Yellowing of young leaves', 'Rotting of the heart', 'Foul smell from the crown'],
        causes: ['Fungus Phytophthora palmivora', 'High humidity', 'Continuous rainfall'],
        treatment: 'Apply recommended copper-based fungicides immediately. If fully rotted, safely cut and burn the tree to prevent spreading.',
        prevention: 'Ensure proper drainage, avoid wounding the crown, and apply prophylactic fungicidal sprays before the monsoon.',
        image_url: '',
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Stem Bleeding',
        scientific_name: 'Thielaviopsis paradoxa',
        description: 'Characterized by the exudation of a dark reddish-brown liquid from the longitudinal cracks in the bark of the trunk.',
        severity: 'High',
        symptoms: ['Reddish-brown liquid oozing from the stem', 'Bark turns black and peels off', 'Underlying tissues decay and turn yellow'],
        causes: ['Fungus Thielaviopsis paradoxa', 'Soil moisture stress', 'Poor drainage'],
        treatment: 'Chisel out the infected tissues completely and apply hot coal tar or Bordeaux paste to the wound.',
        prevention: 'Maintain optimal soil moisture, avoid physical damage to the trunk, and ensure balanced fertilization.',
        image_url: '',
        created_at: new Date().toISOString()
      },
      {
        id: '3',
        name: 'Lethal Yellowing',
        scientific_name: 'Candidatus Phytoplasma palmae',
        description: 'A devastating disease that causes rapid decline and death of the palm. It is highly contagious and spreads via insect vectors.',
        severity: 'Critical',
        symptoms: ['Premature dropping of coconuts', 'Blackening of new inflorescences', 'Progressive yellowing of fronds from bottom to top'],
        causes: ['Phytoplasma (bacteria-like organism)', 'Planthopper insects (vectors)'],
        treatment: 'No permanent cure exists. Antibiotic injections (Oxytetracycline) can suppress symptoms temporarily.',
        prevention: 'Plant resistant coconut varieties, control insect vectors, and immediately remove and destroy infected trees.',
        image_url: '',
        created_at: new Date().toISOString()
      },
      {
        id: '4',
        name: 'Leaf Blight',
        scientific_name: 'Pestalotiopsis palmarum',
        description: 'A common fungal disease affecting older leaves, causing grayish-brown spots and eventual drying of the leaflets.',
        severity: 'Medium',
        symptoms: ['Small yellowish spots on leaves', 'Spots turn grayish-brown with dark margins', 'Drying of leaf tips'],
        causes: ['Fungus Pestalotiopsis', 'Poor plant nutrition', 'Potassium deficiency'],
        treatment: 'Improve plant nutrition with potassium fertilizers. Apply fungicide if the infection is severe.',
        prevention: 'Maintain proper plant spacing, adequate watering, and optimal soil nutrition.',
        image_url: '',
        created_at: new Date().toISOString()
      },
      {
        id: '5',
        name: 'Root (Wilt) Disease',
        scientific_name: 'Phytoplasma',
        description: 'A debilitating disease causing a gradual decline in the yield and health of the palm without immediately killing it.',
        severity: 'High',
        symptoms: ['Flaccidity (ribbing) of leaflets', 'Yellowing of older leaves', 'Necrosis of leaflets', 'Thinning of the crown'],
        causes: ['Phytoplasma', 'Lace bug and plant hopper vectors'],
        treatment: 'No direct cure. Focus on managing the symptoms and secondary infections (like leaf rot).',
        prevention: 'Eradicate disease-advanced palms, apply organic manure, and intercrop to improve soil health.',
        image_url: '',
        created_at: new Date().toISOString()
      },
      {
        id: '6',
        name: 'Gray Leaf Spot',
        scientific_name: 'Pestalotiopsis spp.',
        description: 'A minor fungal infection mostly seen on older leaves, usually not fatal but can reduce the photosynthetic area of the tree.',
        severity: 'Low',
        symptoms: ['Tiny gray spots on mature fronds', 'Slight yellowing around the spots'],
        causes: ['Fungus Pestalotiopsis', 'High humidity', 'Overcrowding'],
        treatment: 'Usually does not require chemical treatment unless severe. Remove heavily infected lower fronds.',
        prevention: 'Ensure good air circulation by proper spacing and regular pruning of dead leaves.',
        image_url: '',
        created_at: new Date().toISOString()
      }
    ];
    
    setDiseases(mockData);
    setFilteredDiseases(mockData);
  };

  const fetchDiseases = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('disease_info').select('*').order('name');

      if (error) {
        console.error("Supabase Error:", error.message);
        loadMockData(); // Load dummy data on error so UI isn't blank
        return;
      }

      if (data && data.length > 0) {
        setDiseases(data);
        setFilteredDiseases(data);
      } else {
        console.warn("Supabase returned empty data. Check if table is empty or RLS policies are blocking access.");
        loadMockData(); // Load dummy data if DB is empty
      }
    } catch (err) {
      console.error("Unexpected fetch error:", err);
      loadMockData();
    } finally {
      setIsLoading(false);
    }
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
        ) : filteredDiseases.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDiseases.map((disease) => (
              <div
                key={disease.id}
                onClick={() => setSelectedDisease(disease)}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
              >
                {getDiseaseThumbnailImage(disease.name) && (
                  <div className="h-48 overflow-hidden bg-gray-100">
                    <img
                      src={getDiseaseThumbnailImage(disease.name)!}
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
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200">
            <Database className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No diseases found</h3>
            <p className="text-gray-500 mt-2">
              Try adjusting your search or filter settings.
            </p>
          </div>
        )}

        {selectedDisease && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-4xl max-h-[90vh] overflow-y-auto w-full">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedDisease.name}</h2>
                  {selectedDisease.scientific_name && (
                    <p className="text-gray-500 italic">{selectedDisease.scientific_name}</p>
                  )}
                </div>
                <button
                  onClick={() => setSelectedDisease(null)}
                  className="text-gray-400 hover:text-gray-600 bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6">
                {getDiseaseThumbnailImage(selectedDisease.name) && (
                  <img
                    src={getDiseaseThumbnailImage(selectedDisease.name)!}
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

                  {selectedDisease.symptoms && selectedDisease.symptoms.length > 0 && (
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

                  {selectedDisease.causes && selectedDisease.causes.length > 0 && (
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