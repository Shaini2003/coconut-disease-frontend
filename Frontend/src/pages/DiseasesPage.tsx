// Frontend/src/pages/DiseasesPage.tsx

import { useState } from 'react';
import { Search, AlertCircle, AlertTriangle, ShieldCheck, X, ChevronRight, Activity, Droplets, Leaf } from 'lucide-react';
import { useTranslation } from '../i18n';

// --- Types ---
type Severity = 'Critical' | 'High' | 'Medium' | 'None';

interface DiseaseInfo {
  id: string;
  name: { en: string; si: string };
  scientificName: string;
  severity: Severity;
  shortDesc: { en: string; si: string };
  fullDesc: { en: string; si: string };
  symptoms: { en: string[]; si: string[] };
  treatment: { en: string; si: string };
}

// --- Mock Database for the Library ---
const DISEASES: DiseaseInfo[] = [
  {
    id: 'bud-rot',
    name: { en: 'Bud Rot', si: 'බද් රොට් (මොටෙයියන් කුණුවීම)' },
    scientificName: 'Phytophthora palmivora',
    severity: 'Critical',
    shortDesc: { 
      en: 'A fatal disease causing rotting of the growing bud (heart) of the coconut palm.', 
      si: 'පොල් ගසේ වැඩෙන මදය (ගොබය) කුණුවී යන ඉතා භයානක රෝගයකි.' 
    },
    fullDesc: {
      en: 'Bud rot is one of the most devastating diseases of the coconut palm. It affects the apical growing point (bud), causing it to rot and emit a foul smell. If left untreated, the entire crown falls off, leading to the death of the tree.',
      si: 'මෙය පොල් ගසට වැළඳෙන ඉතාම විනාශකාරී රෝගයකි. ගසේ ගොබය කුණුවී දුර්ගන්ධයක් හමන අතර, ප්‍රතිකාර නොකළහොත් ගස සම්පූර්ණයෙන්ම මිය යයි.'
    },
    symptoms: {
      en: ['Yellowing of the youngest leaf', 'Rotting of the spindle', 'Foul odor from the crown', 'Crown collapse'],
      si: ['ළාබාලතම පත්‍රය කහ පැහැ වීම', 'ගොබය දිරාපත් වීම', 'ගස මුදුනෙන් දුර්ගන්ධයක් හැමීම', 'මුදුන කඩා වැටීම']
    },
    treatment: {
      en: 'Remove and destroy the infected tissue. Apply Copper Oxychloride (3g/L of water) directly to the crown.',
      si: 'ආසාදිත කොටස් කපා පුළුස්සා දමන්න. Copper Oxychloride (වතුර ලීටරයකට ග්‍රෑම් 3ක්) ගොබයට යොදන්න.'
    }
  },
  {
    id: 'wclwd',
    name: { en: 'WCLWD (Wilt Disease)', si: 'වැලිගම පොල් කොළ මැලවීමේ රෝගය' },
    scientificName: 'Phytoplasma spp.',
    severity: 'Critical',
    shortDesc: { 
      en: 'A systemic and fatal disease causing severe yellowing, flaccidity, and drying of leaflets.', 
      si: 'පොල් කොළ කහ පැහැ ගැන්වීම, මැලවීම සහ වේලී යාම සිදු කරන භයානක රෝගයකි.' 
    },
    fullDesc: {
      en: 'Weligama Coconut Leaf Wilt Disease (WCLWD) is a severe phytoplasma-borne disease. It gradually weakens the palm, drastically reducing yield and eventually causing the death of the tree. It is vector-transmitted.',
      si: 'මෙය ශ්‍රී ලංකාවේ දකුණු පළාතේ බහුලව දක්නට ලැබෙන, ගසේ අස්වැන්න සම්පූර්ණයෙන්ම විනාශ කර ගස මරණයට පත් කරන රෝගයකි.'
    },
    symptoms: {
      en: ['Flaccidity of leaflets', 'Yellowing of fronds', 'Premature nut fall', 'Tapering of the trunk'],
      si: ['පොල් කොළ එල්ලා වැටීම', 'කොළ කහ පැහැ ගැන්වීම', 'ගෙඩි කුඩා කාලයේදීම වැටීම', 'කඳ සිහින් වීම']
    },
    treatment: {
      en: 'No known cure. Eradicate severely affected palms to prevent spread. Apply Imidacloprid to control leafhopper vectors. Contact CRISL immediately.',
      si: 'ස්ථිර ප්‍රතිකාරයක් නොමැත. රෝගී ගස් කපා ඉවත් කළ යුතුය. කෘමීන් පාලනය සඳහා Imidacloprid යොදන්න. වහාම පොල් පර්යේෂණ ආයතනයට දැනුම් දෙන්න.'
    }
  },
  {
    id: 'bud-root-dropping',
    name: { en: 'Bud Root Dropping', si: 'බද් රූට් ඩ්‍රොපිං' },
    scientificName: 'Phytophthora spp.',
    severity: 'High',
    shortDesc: { 
      en: 'A condition where the bud roots begin to drop prematurely, affecting the health and stability.', 
      si: 'ගසේ මුල් පද්ධතියට හානි වීමෙන් ගසේ ස්ථායිතාවයට සහ සෞඛ්‍යයට බලපෑම් ඇති කරන තත්ත්වයකි.' 
    },
    fullDesc: {
      en: 'This disease primarily targets the root system and the lower trunk area, severely impacting the tree\'s ability to absorb water and nutrients, leading to a general decline in palm health.',
      si: 'මෙම රෝගය ප්‍රධාන වශයෙන් මූල පද්ධතියට බලපාන අතර, ගසට ජලය සහ පෝෂ්‍ය පදාර්ථ උරා ගැනීම වළක්වයි.'
    },
    symptoms: {
      en: ['Premature dropping of roots', 'General wilting', 'Reduced nut size'],
      si: ['මුල් කඩා වැටීම', 'සාමාන්‍ය මැලවීම', 'ගෙඩි වල ප්‍රමාණය කුඩා වීම']
    },
    treatment: {
      en: 'Improve soil drainage around the tree base. Apply potassium-rich MOP (0-0-60) and specific systemic fungicides.',
      si: 'ගස වටා ජලාපවාහනය වැඩි දියුණු කරන්න. පොටෑසියම් බහුල MOP පොහොර සහ දිලීර නාශක යොදන්න.'
    }
  },
  {
    id: 'gray-leaf-spot',
    name: { en: 'Gray Leaf Spot', si: 'අළු පැහැති පත්‍ර පුල්ලි රෝගය' },
    scientificName: 'Pestalotiopsis palmarum',
    severity: 'Medium',
    shortDesc: { 
      en: 'A common fungal disease causing grayish-brown spots on leaves, reducing photosynthetic area.', 
      si: 'පොල් කොළ මත අළු-දුඹුරු පැහැති පුල්ලි ඇති කරමින් ප්‍රභාසංශ්ලේෂණය අඩු කරන දිලීර රෝගයකි.' 
    },
    fullDesc: {
      en: 'Gray Leaf Spot primarily affects older fronds. While rarely fatal to mature palms, severe infections can significantly stunt the growth of seedlings and reduce the overall yield of adult trees.',
      si: 'බොහෝ විට වයසක කොළ වලට බලපාන අතර, දරුණු ලෙස ආසාදනය වුවහොත් තරුණ පැළ වල වර්ධනය අඩාල කර අස්වැන්න අඩු කරයි.'
    },
    symptoms: {
      en: ['Yellowish spots that turn grayish-brown', 'Spots have a dark brown margin', 'Leaf blighting in severe cases'],
      si: ['කහ පැහැති පුල්ලි ක්‍රමයෙන් අළු-දුඹුරු පැහැ වීම', 'පුල්ලි වටා තද දුඹුරු පැහැති දාරයක් තිබීම', 'කොළ වේලී යාම']
    },
    treatment: {
      en: 'Cut and burn heavily infected lower fronds. Spray Mancozeb (2g/L of water) every 14 days.',
      si: 'තදින් ආසාදිත පහළ කොළ කපා පුළුස්සා දමන්න. Mancozeb දිලීර නාශකය (වතුර ලීටරයකට 2g) දින 14 කට වරක් ඉසින්න.'
    }
  },
  {
    id: 'cci-caterpillars',
    name: { en: 'CCI Caterpillars', si: 'CCI දළඹු හානිය' },
    scientificName: 'Opisina arenosella',
    severity: 'Medium',
    shortDesc: { 
      en: 'Caterpillar infestation that causes severe damage to coconut leaves by feeding on leaf tissue.', 
      si: 'පොල් කොළවල පටක ආහාරයට ගැනීමෙන් ගසට දැඩි හානි සිදු කරන දළඹු විශේෂයකි.' 
    },
    fullDesc: {
      en: 'The Coconut Caterpillar is a major pest. The larvae live in galleries made of silk and frass on the undersurface of leaves, actively feeding on the green tissues, which reduces the photosynthetic efficiency.',
      si: 'පොල් ගස් සඳහා වන ප්‍රධාන පළිබෝධකයෙකි. මොවුන් කොළ වල යටි පැත්තේ දැල් බැඳගෙන හරිත පටක ආහාරයට ගනී.'
    },
    symptoms: {
      en: ['Drying of leaves appearing as burnt', 'Presence of silken galleries on undersides', 'Accumulation of frass (droppings)'],
      si: ['කොළ පිළිස්සුණු ස්වභාවයක් ගැනීම', 'කොළ යට සේද වැනි දැල් තිබීම', 'දළඹු මලපහ එකතු වී තිබීම']
    },
    treatment: {
      en: 'Release larval parasitoids (biological control). In severe cases, apply safe bio-insecticides like Bt (Bacillus thuringiensis).',
      si: 'පරපෝෂිත කෘමීන් මුදා හැරීම (ජෛව පාලනය). හානිය දරුණු නම් Bt වැනි ජෛව කෘමිනාශක යොදන්න.'
    }
  },
  {
    id: 'healthy',
    name: { en: 'Healthy Palm', si: 'නිරෝගී පොල් ගස' },
    scientificName: 'Cocos nucifera',
    severity: 'None',
    shortDesc: { 
      en: 'The coconut palm is in a healthy state with no visible signs of disease or pest infestation.', 
      si: 'කිසිදු රෝගයක් හෝ පළිබෝධ හානියක් නොමැති නිරෝගී තත්ත්වයකි.' 
    },
    fullDesc: {
      en: 'A perfectly healthy coconut tree showing robust growth, rich green fronds, and strong trunk development. Consistent care prevents future issues.',
      si: 'හොඳ වර්ධනයක්, තද කොළ පැහැති පත්‍ර සහ ශක්තිමත් කඳක් සහිත නිරෝගී ගසකි. නිසි නඩත්තුව මඟින් අනාගත රෝග වළක්වා ගත හැක.'
    },
    symptoms: {
      en: ['Vibrant green leaves', 'Strong fruit setting', 'Firm and unblemished trunk'],
      si: ['පැහැපත් තද කොළ පැහැති පත්‍ර', 'හොඳින් ගෙඩි හටගැනීම', 'ශක්තිමත්, නිරෝගී කඳ']
    },
    treatment: {
      en: 'Maintain regular watering. Apply NPK 14-14-14 fertilizer (500g per tree) every 3 months. Keep the base clear of weeds.',
      si: 'නිතිපතා ජලය යොදන්න. මාස 3කට වරක් NPK 14-14-14 පොහොර (ග්‍රෑම් 500ක්) යොදන්න. ගස වටා වල් පැලෑටි ඉවත් කර තබාගන්න.'
    }
  }
];

export default function DiseaseLibraryPage() {
  const { language } = useTranslation();
  const isSi = language === 'si';

  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<Severity | 'All'>('All');
  const [selectedDisease, setSelectedDisease] = useState<DiseaseInfo | null>(null);

  // Translations for the UI elements
  const t = {
    title: isSi ? 'පොල් රෝග පුස්තකාලය' : 'Coconut Disease Library',
    subtitle: isSi ? 'ශ්‍රී ලංකාවේ පොල් වගාවට බලපාන රෝග, රෝග ලක්ෂණ සහ නිවැරදි ප්‍රතිකාර ක්‍රම පිළිබඳව ඉගෙන ගන්න.' : 'Learn about coconut diseases, symptoms, and treatment methods in Sri Lanka.',
    searchPlaceholder: isSi ? 'රෝගයක් සොයන්න...' : 'Search diseases...',
    all: isSi ? 'සියලුම' : 'All',
    critical: isSi ? 'අනතුරුදායක' : 'Critical',
    high: isSi ? 'ඉහළ' : 'High',
    medium: isSi ? 'මධ්‍යම' : 'Medium',
    none: isSi ? 'නිරෝගී' : 'None',
    learnMore: isSi ? 'වැඩි විස්තර' : 'Learn More',
    symptoms: isSi ? 'රෝග ලක්ෂණ:' : 'Key Symptoms:',
    treatment: isSi ? 'නිර්දේශිත ප්‍රතිකාරය:' : 'Recommended Treatment:',
    noResults: isSi ? 'ගැළපෙන රෝගයක් හමු නොවුණි.' : 'No matching diseases found.'
  };

  const filteredDiseases = DISEASES.filter(disease => {
    const matchesSearch = disease.name.en.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          disease.name.si.includes(searchTerm);
    const matchesSeverity = filterSeverity === 'All' || disease.severity === filterSeverity;
    return matchesSearch && matchesSeverity;
  });

  const getSeverityStyles = (severity: Severity) => {
    switch (severity) {
      case 'Critical': return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: <AlertTriangle className="w-4 h-4 text-red-600" />, badgeBg: 'bg-red-500' };
      case 'High':     return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', icon: <AlertCircle className="w-4 h-4 text-orange-600" />, badgeBg: 'bg-orange-500' };
      case 'Medium':   return { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', icon: <AlertCircle className="w-4 h-4 text-yellow-600" />, badgeBg: 'bg-yellow-500' };
      case 'None':     return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: <ShieldCheck className="w-4 h-4 text-green-600" />, badgeBg: 'bg-green-500' };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      
      {/* ── HERO SECTION ── */}
      <div className="bg-gradient-to-br from-green-800 to-emerald-700 text-white py-16 px-6 shadow-md relative overflow-hidden">
        {/* Abstract Background Element */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-10">
          <Leaf className="w-64 h-64" />
        </div>
        <div className="max-w-6xl mx-auto relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">{t.title}</h1>
          <p className="text-green-100 text-lg md:text-xl max-w-2xl mx-auto">{t.subtitle}</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-8 relative z-20">
        {/* ── SEARCH & FILTERS ── */}
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 mb-10 flex flex-col md:flex-row gap-4 items-center justify-between border border-gray-100">
          
          <div className="relative w-full md:w-1/2">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder={t.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all text-sm font-medium text-gray-700"
            />
          </div>

          <div className="flex flex-wrap justify-center gap-2 w-full md:w-auto">
            {(['All', 'Critical', 'High', 'Medium', 'None'] as const).map(sev => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 shadow-sm border ${
                  filterSeverity === sev 
                    ? 'bg-green-600 text-white border-green-600 scale-105' 
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-green-300'
                }`}
              >
                {t[sev.toLowerCase() as keyof typeof t]}
              </button>
            ))}
          </div>
        </div>

        {/* ── DISEASE GRID ── */}
        {filteredDiseases.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100">
            <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium text-lg">{t.noResults}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDiseases.map((disease) => {
              const styles = getSeverityStyles(disease.severity);
              return (
                <div 
                  key={disease.id} 
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col h-full"
                  onClick={() => setSelectedDisease(disease)}
                >
                  {/* Card Header Top Border */}
                  <div className={`h-2 w-full ${styles.badgeBg}`}></div>
                  
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 leading-tight mb-1 group-hover:text-green-700 transition-colors">
                          {isSi ? disease.name.si : disease.name.en}
                        </h3>
                        <p className="text-xs text-gray-500 italic font-medium">{disease.scientificName}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${styles.bg} ${styles.text} ${styles.border}`}>
                        {styles.icon}
                        {t[disease.severity.toLowerCase() as keyof typeof t] || disease.severity}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 flex-grow leading-relaxed">
                      {isSi ? disease.shortDesc.si : disease.shortDesc.en}
                    </p>

                    <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
                      <span className="text-sm font-bold text-green-600 group-hover:text-green-700 flex items-center gap-1">
                        {t.learnMore} <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── MODAL (POPUP) FOR DISEASE DETAILS ── */}
      {selectedDisease && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 relative">
            
            {/* Modal Header */}
            <div className={`px-6 py-5 border-b border-gray-100 flex items-center justify-between ${getSeverityStyles(selectedDisease.severity).bg}`}>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{isSi ? selectedDisease.name.si : selectedDisease.name.en}</h2>
                <p className="text-sm text-gray-600 italic font-medium">{selectedDisease.scientificName}</p>
              </div>
              <button 
                onClick={() => setSelectedDisease(null)}
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors shadow-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto p-6 md:p-8 custom-scrollbar">
              <p className="text-base text-gray-700 leading-relaxed mb-8">
                {isSi ? selectedDisease.fullDesc.si : selectedDisease.fullDesc.en}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Symptoms Box */}
                <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 shadow-sm">
                  <h4 className="text-orange-800 font-bold flex items-center gap-2 mb-3">
                    <Activity className="w-5 h-5" /> {t.symptoms}
                  </h4>
                  <ul className="space-y-2">
                    {(isSi ? selectedDisease.symptoms.si : selectedDisease.symptoms.en).map((sym, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-orange-900">
                        <span className="text-orange-400 mt-0.5">•</span> {sym}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Treatment Box */}
                <div className="bg-green-50 border border-green-100 rounded-2xl p-5 shadow-sm">
                  <h4 className="text-green-800 font-bold flex items-center gap-2 mb-3">
                    <Droplets className="w-5 h-5" /> {t.treatment}
                  </h4>
                  <p className="text-sm text-green-900 leading-relaxed">
                    {isSi ? selectedDisease.treatment.si : selectedDisease.treatment.en}
                  </p>
                </div>
              </div>

              {/* Informational Note */}
              <div className="mt-8 bg-blue-50 text-blue-800 text-xs p-4 rounded-xl flex items-start gap-3 border border-blue-100">
                <ShieldCheck className="w-5 h-5 flex-shrink-0 text-blue-600" />
                <p>
                  {isSi 
                    ? 'මෙම තොරතුරු සැපයෙන්නේ සාමාන්‍ය දැනුවත් කිරීම සඳහා පමණි. අනතුරුදායක රෝග තත්ත්වයකදී කරුණාකර පොල් පර්යේෂණ ආයතනය (CRISL) සම්බන්ධ කරගන්න.' 
                    : 'This information is provided for educational purposes. For critical outbreaks, please contact the Coconut Research Institute of Sri Lanka (CRISL) for professional agricultural support.'}
                </p>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}