// Frontend/src/pages/DiseasesPage.tsx
import { AlertTriangle, CheckCircle, Search, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from '../i18n';

const ML_URL = 'http://localhost:8000';
interface Disease { name: string; severity: string; recommendation: string; fertilizer: string; }

const DISEASE_DETAILS: Record<string, { scientific_name: string; description: { en: string; si: string }; symptoms: { en: string[]; si: string[] }; causes: { en: string[]; si: string[] }; prevention: { en: string; si: string }; }> = {
  'Bud Root Dropping': {
    scientific_name: 'Phytophthora spp.',
    description: { en: 'A condition where the bud roots begin to drop prematurely, affecting the overall health and stability of the coconut palm.', si: 'පොල් ගසේ බද් මූල කලින් ඇද වැටෙන තත්ත්වයකි, ගසේ සමස්ත සෞඛ්‍යය සහ ස්ථාවරත්වය කෙරෙහි බලපායි.' },
    symptoms: { en: ['Premature dropping of bud roots', 'Yellowing of lower fronds', 'Weakened crown structure'], si: ['බද් මූල කලින් ඇද වැටීම', 'පහළ කොළ කහ වීම', 'ශීර්ෂ ව්‍යුහය දුර්වල වීම'] },
    causes: { en: ['Fungal infection', 'Waterlogged soil', 'Poor drainage'], si: ['දිලීර ආසාදනය', 'ජලය ගැළී ගිය පස', 'දුර්වල ජල බැසයාම'] },
    prevention: { en: 'Ensure proper drainage, avoid waterlogging, and apply preventive fungicide during rainy season.', si: 'නිසි ජල බැසයාම සහතික කරන්න, ජලය ගැළීම වළකින්න, සහ වර්ෂා ඍතුවේ වැළැක්වීමේ දිලීරනාශකය යොදන්න.' },
  },
  'Bud Rot': {
    scientific_name: 'Phytophthora palmivora',
    description: { en: 'A fatal disease causing rotting of the growing bud (heart) of the coconut palm. Highly dangerous and can kill the tree quickly.', si: 'පොල් ගසේ වැඩෙන බද (හදවත) කුළු වීම ඇති කරන මාරාන්තික රෝගයකි. ඉතා භයානකයි, ගස ඉක්මනින් මරා දැමිය හැකිය.' },
    symptoms: { en: ['Yellowing of youngest leaves', 'Foul smell from crown', 'Rotting of the spear leaf', 'Wilting of the crown'], si: ['නවතම කොළ කහ වීම', 'ශීර්ෂ ප්‍රදේශයෙන් අශෝභන සුවඳ', 'ශූල කොළ කුළු ගැනීම', 'ශීර්ෂ ප්‍රදේශය කලිගෑෙෂ'] },
    causes: { en: ['Fungus Phytophthora palmivora', 'High humidity', 'Continuous heavy rainfall'], si: ['Phytophthora palmivora දිලීරය', 'ඉහළ ආර්ද්‍රතාව', 'නිරන්තර අධික වර්ෂාව'] },
    prevention: { en: 'Apply Bordeaux mixture to the crown, ensure good drainage, and avoid wounding the crown.', si: 'ශීර්ෂ ප්‍රදේශයට Bordeaux මිශ්‍රණය ගැල්වන්න, හොඳ ජල බැසයාම සහතික කරන්න, ශීර්ෂ ප්‍රදේශය තුවාල නොකරන්න.' },
  },
  'CCI_Caterpillars': {
    scientific_name: 'Opisina arenosella',
    description: { en: 'Caterpillar infestation that causes severe damage to coconut leaves by feeding on leaf tissue, reducing photosynthesis.', si: 'කොළ පටක ආහාරයට ගෙන ප්‍රභාසංශ්ලේෂණය අඩු කරමින් පොල් කොළ වලට දරුණු හානි කරන රූකඩ ආක්‍රමණයයි.' },
    symptoms: { en: ['White streaks on leaves', 'Leaf skeletonization', 'Brownish dry patches', 'Presence of caterpillars on leaves'], si: ['කොළ වල සුදු ඉරි', 'කොළ ශිරා ජාලය ඉතිරි වීම', 'දුඹුරු වියළි ලප', 'කොළ මත රූකඩ සිටීම'] },
    causes: { en: ['Coconut caterpillar (Opisina arenosella)', 'High temperature and dry conditions'], si: ['පොල් රූකඩ (Opisina arenosella)', 'ඉහළ උෂ්ණත්වය සහ වියළි කාලගුණය'] },
    prevention: { en: 'Introduce natural predators, apply biological control agents (Bt), and monitor regularly.', si: 'ස්වාභාවික ගොදුරු කරන්නන් හඳුන්වා දෙන්න, ජෛව පාලන ක්‍රියාකාරීන් (Bt) යොදන්න, නිතිපතා නිරීක්ෂණය කරන්න.' },
  },
  'Gray Leaf Spot': {
    scientific_name: 'Pestalotiopsis palmarum',
    description: { en: 'A common fungal disease causing grayish-brown spots on leaves, reducing the photosynthetic area.', si: 'කොළ වල අළු-දුඹුරු ලප ඇති කරන සාමාන්‍ය දිලීර රෝගයකි, ප්‍රභාසංශ්ලේෂණ ප්‍රදේශය අඩු කරයි.' },
    symptoms: { en: ['Small gray spots on leaves', 'Spots with dark margins', 'Drying of leaf tips', 'Yellowing around spots'], si: ['කොළ මත කුඩා අළු ලප', 'අඳුරු කෙළවරු සහිත ලප', 'කොළ කෙළවරු වියළීම', 'ලප වටා කහ වීම'] },
    causes: { en: ['Fungus Pestalotiopsis', 'High humidity', 'Potassium deficiency'], si: ['Pestalotiopsis දිලීරය', 'ඉහළ ආර්ද්‍රතාව', 'පොටෑසියම් ඌනතාවය'] },
    prevention: { en: 'Maintain proper plant nutrition, ensure good air circulation, and prune infected leaves.', si: 'නිසි ශාක පෝෂණය පවත්වා ගන්න, හොඳ වාතාශ්‍රය සහතික කරන්න, ආසාදිත කොළ කේතෝ කරන්න.' },
  },
  'Healthy_Leaves': {
    scientific_name: 'N/A',
    description: { en: 'The coconut palm is in a healthy state with no visible signs of disease. Continue regular maintenance and monitoring.', si: 'පොල් ගස රෝගයේ දෘශ්‍ය ලක්ෂණ නොමැතිව සෞඛ්‍ය සම්පන්න තත්ත්වයකදී ඇත. නිතිපතා නඩත්තු සහ නිරීක්ෂණය දිගටම කරන්න.' },
    symptoms: { en: ['Deep green color', 'Strong upright fronds', 'Regular nut production'], si: ['ගැඹුරු කොළ වර්ණය', 'ශක්තිමත් සෘජු ශාඛා', 'නිතිපතා ගෙඩි නිෂ්පාදනය'] },
    causes: { en: ['No disease present'], si: ['රෝගය නොමැත'] },
    prevention: { en: 'Continue regular fertilization, irrigation, and periodic inspection for early signs of disease.', si: 'නිතිපතා පොහොර යෙදීම, ජල සැපයීම, සහ රෝගයේ ඉක්මන් ලක්ෂණ සඳහා වාරිකව පරීක්ෂාව දිගටම කරන්න.' },
  },
  'Leaf Rot': {
    scientific_name: 'Colletotrichum gloeosporioides',
    description: { en: 'A fungal disease causing rotting and browning of coconut leaves, starting from the tips and spreading inward.', si: 'කෙළවරින් ආරම්භ වී ඇතුළට ව්‍යාප්ත වන, පොල් කොළ කුළු ගෑීම සහ දුඹුරු වීම ඇති කරන දිලීර රෝගයකි.' },
    symptoms: { en: ['Brown discoloration starting from leaf tips', 'Rotting leaf tissue', 'Wilting fronds', 'Dark lesions on leaflets'], si: ['කොළ කෙළවරින් ආරම්භ වන දුඹුරු විවර්ණ වීම', 'කොළ පටක කුළු ගෑීම', 'ශාඛා ශෝෂණය', 'ශාඛා කොළ මත අඳුරු තුවාල'] },
    causes: { en: ['Fungal infection', 'Excessive moisture', 'Poor air circulation'], si: ['දිලීර ආසාදනය', 'අධික තෙතමනය', 'දුර්වල වාතාශ්‍රය'] },
    prevention: { en: 'Improve drainage, prune affected leaves, and apply copper-based fungicides.', si: 'ජල බැසයාම වැඩිදියුණු කරන්න, බලපෑමට ලක් වූ කොළ කේතෝ කරන්න, තඹ-පදනම් දිලීරනාශක යොදන්න.' },
  },
  'Stem Bleeding': {
    scientific_name: 'Thielaviopsis paradoxa',
    description: { en: 'A serious disease characterized by dark reddish-brown liquid oozing from cracks in the trunk.', si: 'ගස්කඳෙහි ඉරිතැලීම් වලින් අඳුරු රතු-දුඹුරු දියර ගලා ඒමෙන් සංලක්ෂිත දරුණු රෝගයකි.' },
    symptoms: { en: ['Dark reddish-brown liquid on trunk', 'Bark turning black', 'Peeling bark', 'Decaying inner tissue'], si: ['ගස්කඳෙහි අඳුරු රතු-දුඹුරු දියර', 'පොතු කළු වීම', 'පොතු ගැලීම', 'ඇතුළු පටක ක්ෂය වීම'] },
    causes: { en: ['Fungus Thielaviopsis paradoxa', 'Physical injury to trunk', 'Poor drainage'], si: ['Thielaviopsis paradoxa දිලීරය', 'ගස්කඳට භෞතික තුවාල', 'දුර්වල ජල බැසයාම'] },
    prevention: { en: 'Avoid trunk injuries, maintain good drainage, and apply Bordeaux paste to wounds.', si: 'ගස්කඳ තුවාල නොකරන්න, හොඳ ජල බැසයාම පවත්වා ගන්න, තුවාල වලට Bordeaux කිරිල ගාන්න.' },
  },
  'WCLWD_DryingofLeaflets': {
    scientific_name: 'Candidatus Phytoplasma',
    description: { en: 'Weligama Coconut Leaf Wilt Disease — a serious phytoplasma disease causing progressive drying of leaflets.', si: 'වෙළිගම පොල් කොළ萎凋 රෝගය — ශාඛා කොළ ක්‍රමික වශයෙන් වියළීම ඇති කරන දරුණු phytoplasma රෝගයකි.' },
    symptoms: { en: ['Yellowing and drying of leaflets from tip', 'Progressive wilting from older to younger fronds', 'Reduced nut production', 'Thinning of crown'], si: ['ශාඛා කොළ කෙළවරින් කහ වීම සහ වියළීම', 'පැරණි සිට නව ශාඛා දෙසට ක්‍රමිකව ශෝෂණය', 'ගෙඩි නිෂ්පාදනය අඩු වීම', 'ශීර්ෂ ශාඛා ක්ෂය වීම'] },
    causes: { en: ['Phytoplasma (bacteria-like organism)', 'Spread by planthopper insects'], si: ['Phytoplasma (බැක්ටීරියා-සමාන ජීවියෙකු)', 'ශාකය උකු කන කෘමීන් විසින් ව්‍යාප්ත කෙරේ'] },
    prevention: { en: 'Control insect vectors, remove and destroy severely infected palms, report to Coconut Research Institute.', si: 'කෘමි රෝග ව්‍යාප්තිකාරකයන් පාලනය කරන්න, දරුණු ලෙස ආසාදිත ගස් ඉවත් කර විනාශ කරන්න, පොල් පර්යේෂණ ආයතනයට වාර්තා කරන්න.' },
  },
};

export default function DiseasesPage() {
  const { t, language } = useTranslation();
  const [diseases,         setDiseases]         = useState<Disease[]>([]);
  const [filtered,         setFiltered]         = useState<Disease[]>([]);
  const [searchTerm,       setSearchTerm]       = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [selectedDisease,  setSelectedDisease]  = useState<Disease | null>(null);
  const [isLoading,        setIsLoading]        = useState(true);

  useEffect(() => { fetchDiseases(); }, []);
  useEffect(() => { filterDiseases(); }, [searchTerm, selectedSeverity, diseases]);

  const fetchDiseases = async () => {
    setIsLoading(true);
    try {
      const res  = await fetch(`${ML_URL}/diseases`);
      const data = await res.json();
      if (data.diseases) { setDiseases(data.diseases); setFiltered(data.diseases); }
    } catch {
      const fallback: Disease[] = Object.keys(DISEASE_DETAILS).map((name) => ({
        name, severity: name === 'Healthy_Leaves' ? 'None' : name === 'Bud Rot' || name === 'Stem Bleeding' || name === 'WCLWD_DryingofLeaflets' ? 'Critical' : name === 'Bud Root Dropping' || name === 'Leaf Rot' ? 'High' : 'Medium',
        recommendation: 'Consult an agricultural expert.', fertilizer: 'Apply balanced NPK fertilizer.',
      }));
      setDiseases(fallback); setFiltered(fallback);
    } finally { setIsLoading(false); }
  };

  const filterDiseases = () => {
    let result = diseases;
    if (selectedSeverity !== 'all') result = result.filter((d) => d.severity === selectedSeverity);
    if (searchTerm) result = result.filter((d) => d.name.toLowerCase().includes(searchTerm.toLowerCase()));
    setFiltered(result);
  };

  const getSevColor = (s: string) => ({ Critical: 'bg-red-100 text-red-800 border-red-200', High: 'bg-orange-100 text-orange-800 border-orange-200', Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200', None: 'bg-green-100 text-green-800 border-green-200' }[s] || 'bg-gray-100 text-gray-800 border-gray-200');
  const getSevIcon = (s: string) => (s === 'Critical' || s === 'High') ? <XCircle className="h-4 w-4" /> : s === 'Medium' ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />;
  const getDetails = (name: string) => DISEASE_DETAILS[name] || { scientific_name: 'Unknown', description: { en: 'No description.', si: 'විස්තරයක් නැත.' }, symptoms: { en: [], si: [] }, causes: { en: [], si: [] }, prevention: { en: '', si: '' } };
  const L = language === 'si' ? 'si' : 'en';

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{t.diseases.title}</h1>
          <p className="text-lg text-gray-600">{t.diseases.subtitle}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input type="text" placeholder={t.diseases.searchPlaceholder} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            </div>
            <div className="flex gap-2 flex-wrap">
              {['all', 'Critical', 'High', 'Medium', 'None'].map((s) => (
                <button key={s} onClick={() => setSelectedSeverity(s)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedSeverity === s ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                  {s === 'all' ? t.diseases.allFilter : s}
                </button>
              ))}
            </div>
          </div>
        </div>
        {isLoading ? (
          <div className="text-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div><p className="text-gray-600 mt-4">{t.diseases.loading}</p></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((disease) => {
              const details = getDetails(disease.name);
              return (
                <div key={disease.name} onClick={() => setSelectedDisease(disease)}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer">
                  <div className={`h-2 w-full ${disease.severity === 'Critical' ? 'bg-red-500' : disease.severity === 'High' ? 'bg-orange-500' : disease.severity === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'}`} />
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{disease.name.replace(/_/g, ' ')}</h3>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getSevColor(disease.severity)}`}>{getSevIcon(disease.severity)}{disease.severity}</span>
                    </div>
                    <p className="text-sm text-gray-500 italic mb-3">{details.scientific_name}</p>
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">{details.description[L]}</p>
                    <button className="text-green-600 text-sm font-medium hover:text-green-700">{t.diseases.learnMore}</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal */}
        {selectedDisease && (() => {
          const details = getDetails(selectedDisease.name);
          return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl max-w-3xl max-h-[90vh] overflow-y-auto w-full">
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                  <div><h2 className="text-2xl font-bold text-gray-900">{selectedDisease.name.replace(/_/g, ' ')}</h2><p className="text-gray-500 italic text-sm">{details.scientific_name}</p></div>
                  <button onClick={() => setSelectedDisease(null)} className="text-gray-400 hover:text-gray-600 bg-gray-100 p-2 rounded-full"><XCircle className="h-6 w-6" /></button>
                </div>
                <div className="p-6 space-y-6">
                  <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${getSevColor(selectedDisease.severity)}`}>{getSevIcon(selectedDisease.severity)} {selectedDisease.severity}</span>
                  <div><h3 className="text-lg font-semibold text-gray-900 mb-2">{t.diseases.modal.description}</h3><p className="text-gray-700 leading-relaxed">{details.description[L]}</p></div>
                  {details.symptoms[L].length > 0 && (<div><h3 className="text-lg font-semibold text-gray-900 mb-2">{t.diseases.modal.symptoms}</h3><ul className="space-y-1">{details.symptoms[L].map((s: string, i: number) => (<li key={i} className="flex items-start text-gray-700"><span className="text-green-600 mr-2">•</span>{s}</li>))}</ul></div>)}
                  {details.causes[L].length > 0 && (<div><h3 className="text-lg font-semibold text-gray-900 mb-2">{t.diseases.modal.causes}</h3><ul className="space-y-1">{details.causes[L].map((c: string, i: number) => (<li key={i} className="flex items-start text-gray-700"><span className="text-green-600 mr-2">•</span>{c}</li>))}</ul></div>)}
                  <div><h3 className="text-lg font-semibold text-gray-900 mb-2">{t.diseases.modal.treatment}</h3><p className="text-gray-700 leading-relaxed">{selectedDisease.recommendation}</p></div>
                  <div><h3 className="text-lg font-semibold text-gray-900 mb-2">{t.diseases.modal.fertilizer}</h3><p className="text-gray-700 leading-relaxed">{selectedDisease.fertilizer}</p></div>
                  <div><h3 className="text-lg font-semibold text-gray-900 mb-2">{t.diseases.modal.prevention}</h3><p className="text-gray-700 leading-relaxed">{details.prevention[L]}</p></div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}