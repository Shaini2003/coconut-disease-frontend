import { AlertTriangle, CheckCircle, Search, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

const ML_URL = 'http://localhost:8000';

interface Disease {
  name: string;
  severity: string;
  recommendation: string;
  fertilizer: string;
}

const DISEASE_DETAILS: Record<string, {
  scientific_name: string;
  description: string;
  symptoms: string[];
  causes: string[];
  prevention: string;
}> = {
  'Bud Root Dropping': {
    scientific_name: 'Phytophthora spp.',
    description: 'A condition where the bud roots begin to drop prematurely, affecting the overall health and stability of the coconut palm.',
    symptoms: ['Premature dropping of bud roots', 'Yellowing of lower fronds', 'Weakened crown structure'],
    causes: ['Fungal infection', 'Waterlogged soil', 'Poor drainage'],
    prevention: 'Ensure proper drainage, avoid waterlogging, and apply preventive fungicide during rainy season.',
  },
  'Bud Rot': {
    scientific_name: 'Phytophthora palmivora',
    description: 'A fatal disease causing rotting of the growing bud (heart) of the coconut palm. Highly dangerous and can kill the tree quickly.',
    symptoms: ['Yellowing of youngest leaves', 'Foul smell from crown', 'Rotting of the spear leaf', 'Wilting of the crown'],
    causes: ['Fungus Phytophthora palmivora', 'High humidity', 'Continuous heavy rainfall'],
    prevention: 'Apply Bordeaux mixture to the crown, ensure good drainage, and avoid wounding the crown.',
  },
  'CCI_Caterpillars': {
    scientific_name: 'Opisina arenosella',
    description: 'Caterpillar infestation that causes severe damage to coconut leaves by feeding on leaf tissue, reducing photosynthesis.',
    symptoms: ['White streaks on leaves', 'Leaf skeletonization', 'Brownish dry patches', 'Presence of caterpillars on leaves'],
    causes: ['Coconut caterpillar (Opisina arenosella)', 'High temperature and dry conditions'],
    prevention: 'Introduce natural predators, apply biological control agents (Bt), and monitor regularly.',
  },
  'Gray Leaf Spot': {
    scientific_name: 'Pestalotiopsis palmarum',
    description: 'A common fungal disease causing grayish-brown spots on leaves, reducing the photosynthetic area.',
    symptoms: ['Small gray spots on leaves', 'Spots with dark margins', 'Drying of leaf tips', 'Yellowing around spots'],
    causes: ['Fungus Pestalotiopsis', 'High humidity', 'Potassium deficiency'],
    prevention: 'Maintain proper plant nutrition, ensure good air circulation, and prune infected leaves.',
  },
  'Healthy_Leaves': {
    scientific_name: 'N/A',
    description: 'The coconut palm is in a healthy state with no visible signs of disease. Continue regular maintenance and monitoring.',
    symptoms: ['Deep green color', 'Strong upright fronds', 'Regular nut production'],
    causes: ['No disease present'],
    prevention: 'Continue regular fertilization, irrigation, and periodic inspection for early signs of disease.',
  },
  'Leaf Rot': {
    scientific_name: 'Colletotrichum gloeosporioides',
    description: 'A fungal disease causing rotting and browning of coconut leaves, starting from the tips and spreading inward.',
    symptoms: ['Brown discoloration starting from leaf tips', 'Rotting leaf tissue', 'Wilting fronds', 'Dark lesions on leaflets'],
    causes: ['Fungal infection', 'Excessive moisture', 'Poor air circulation'],
    prevention: 'Improve drainage, prune affected leaves, and apply copper-based fungicides.',
  },
  'Stem Bleeding': {
    scientific_name: 'Thielaviopsis paradoxa',
    description: 'A serious disease characterized by dark reddish-brown liquid oozing from cracks in the trunk.',
    symptoms: ['Dark reddish-brown liquid on trunk', 'Bark turning black', 'Peeling bark', 'Decaying inner tissue'],
    causes: ['Fungus Thielaviopsis paradoxa', 'Physical injury to trunk', 'Poor drainage'],
    prevention: 'Avoid trunk injuries, maintain good drainage, and apply Bordeaux paste to wounds.',
  },
  'WCLWD_DryingofLeaflets': {
    scientific_name: 'Candidatus Phytoplasma',
    description: 'Weligama Coconut Leaf Wilt Disease — a serious phytoplasma disease causing progressive drying of leaflets.',
    symptoms: ['Yellowing and drying of leaflets from tip', 'Progressive wilting from older to younger fronds', 'Reduced nut production', 'Thinning of crown'],
    causes: ['Phytoplasma (bacteria-like organism)', 'Spread by planthopper insects'],
    prevention: 'Control insect vectors, remove and destroy severely infected palms, report to Coconut Research Institute.',
  },
};

export default function DiseasesPage() {
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [filtered, setFiltered] = useState<Disease[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [selectedDisease, setSelectedDisease] = useState<Disease | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDiseases();
  }, []);

  useEffect(() => {
    filterDiseases();
  }, [searchTerm, selectedSeverity, diseases]);

  const fetchDiseases = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${ML_URL}/diseases`);
      const data = await res.json();
      if (data.diseases) {
        setDiseases(data.diseases);
        setFiltered(data.diseases);
      }
    } catch (err) {
      // Fallback to hardcoded list if ML server not running
      const fallback: Disease[] = Object.keys(DISEASE_DETAILS).map((name) => ({
        name,
        severity: name === 'Healthy_Leaves' ? 'None'
          : name === 'Bud Rot' || name === 'Stem Bleeding' || name === 'WCLWD_DryingofLeaflets' ? 'Critical'
          : name === 'Bud Root Dropping' || name === 'Leaf Rot' ? 'High'
          : 'Medium',
        recommendation: 'Consult an agricultural expert.',
        fertilizer: 'Apply balanced NPK fertilizer.',
      }));
      setDiseases(fallback);
      setFiltered(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  const filterDiseases = () => {
    let result = diseases;
    if (selectedSeverity !== 'all') {
      result = result.filter((d) => d.severity === selectedSeverity);
    }
    if (searchTerm) {
      result = result.filter((d) =>
        d.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFiltered(result);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'High':     return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium':   return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'None':     return 'bg-green-100 text-green-800 border-green-200';
      default:         return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'Critical':
      case 'High':   return <XCircle className="h-4 w-4" />;
      case 'Medium': return <AlertTriangle className="h-4 w-4" />;
      default:       return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getDetails = (name: string) =>
    DISEASE_DETAILS[name] || {
      scientific_name: 'Unknown',
      description: 'No description available.',
      symptoms: [],
      causes: [],
      prevention: '',
    };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Coconut Disease Library
          </h1>
          <p className="text-lg text-gray-600">
            Learn about coconut diseases, symptoms, and treatment methods
          </p>
        </div>

        {/* Search + Filter */}
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
            <div className="flex gap-2 flex-wrap">
              {['all', 'Critical', 'High', 'Medium', 'None'].map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSeverity(s)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedSeverity === s
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {s === 'all' ? 'All' : s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Disease Cards */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading disease information...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((disease) => {
              const details = getDetails(disease.name);
              return (
                <div
                  key={disease.name}
                  onClick={() => setSelectedDisease(disease)}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                >
                  {/* Color band by severity */}
                  <div className={`h-2 w-full ${
                    disease.severity === 'Critical' ? 'bg-red-500'
                    : disease.severity === 'High' ? 'bg-orange-500'
                    : disease.severity === 'Medium' ? 'bg-yellow-500'
                    : 'bg-green-500'
                  }`} />

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {disease.name.replace(/_/g, ' ')}
                      </h3>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(disease.severity)}`}>
                        {getSeverityIcon(disease.severity)}
                        {disease.severity}
                      </span>
                    </div>

                    <p className="text-sm text-gray-500 italic mb-3">
                      {details.scientific_name}
                    </p>
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                      {details.description}
                    </p>

                    <button className="text-green-600 text-sm font-medium hover:text-green-700">
                      Learn More →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Detail Modal */}
        {selectedDisease && (() => {
          const details = getDetails(selectedDisease.name);
          return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl max-w-3xl max-h-[90vh] overflow-y-auto w-full">
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedDisease.name.replace(/_/g, ' ')}
                    </h2>
                    <p className="text-gray-500 italic text-sm">{details.scientific_name}</p>
                  </div>
                  <button
                    onClick={() => setSelectedDisease(null)}
                    className="text-gray-400 hover:text-gray-600 bg-gray-100 p-2 rounded-full"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  {/* Severity badge */}
                  <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${getSeverityColor(selectedDisease.severity)}`}>
                    {getSeverityIcon(selectedDisease.severity)}
                    Severity: {selectedDisease.severity}
                  </span>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-700 leading-relaxed">{details.description}</p>
                  </div>

                  {details.symptoms.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Symptoms</h3>
                      <ul className="space-y-1">
                        {details.symptoms.map((s, i) => (
                          <li key={i} className="flex items-start text-gray-700">
                            <span className="text-green-600 mr-2">•</span>{s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {details.causes.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Causes</h3>
                      <ul className="space-y-1">
                        {details.causes.map((c, i) => (
                          <li key={i} className="flex items-start text-gray-700">
                            <span className="text-green-600 mr-2">•</span>{c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Treatment</h3>
                    <p className="text-gray-700 leading-relaxed">{selectedDisease.recommendation}</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Fertilizer</h3>
                    <p className="text-gray-700 leading-relaxed">{selectedDisease.fertilizer}</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Prevention</h3>
                    <p className="text-gray-700 leading-relaxed">{details.prevention}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}