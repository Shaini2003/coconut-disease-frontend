// Frontend/src/components/WeatherRiskWidget.tsx

import { useEffect, useState } from 'react';
import { CloudRain, Sun, Droplets, AlertTriangle, MapPin, Loader2, Thermometer, ShieldCheck } from 'lucide-react';
import { useTranslation } from '../i18n';

// 🔴 මෙතනට ඔබගේ OpenWeather API Key එක දාන්න
const WEATHER_API_KEY = '9ef6b9855bc89bf5ab855dc9e06783a8'; 

interface WeatherData {
  temp: number;
  humidity: number;
  condition: string;
  locationName: string;
}

export default function WeatherRiskWidget() {
  const { t, language } = useTranslation();
  const isSi = language === 'si';

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getLocationAndWeather();
  }, []);

  const getLocationAndWeather = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError(isSi ? 'ඔබගේ බ්‍රවුසරය GPS සඳහා සහාය නොදක්වයි.' : 'Geolocation is not supported by your browser.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric`
          );
          if (!response.ok) throw new Error('Weather API error');
          const data = await response.json();
          
          setWeather({
            temp: Math.round(data.main.temp),
            humidity: data.main.humidity,
            condition: data.weather[0].main, // e.g., 'Rain', 'Clouds', 'Clear'
            locationName: data.name,
          });
        } catch (err) {
          setError(isSi ? 'කාලගුණ දත්ත ලබාගැනීම අසාර්ථකයි.' : 'Failed to fetch weather data.');
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setError(isSi ? 'කරුණාකර Location (GPS) On කරන්න.' : 'Please enable Location (GPS) access.');
        setLoading(false);
      }
    );
  };

  // ── AI Risk Prediction Logic (රෝග අවදානම් තීරණය කිරීම) ──
  const getRiskPrediction = () => {
    if (!weather) return null;

    // 1. Fungal Diseases (High humidity & Rain -> Bud Rot, Leaf Rot)
    if (weather.condition === 'Rain' || weather.humidity > 80) {
      return {
        level: 'High',
        title: isSi ? 'දිලීර රෝග අවදානම ඉහළයි (බද් රොට්)' : 'High Fungal Disease Risk (Bud Rot)',
        desc: isSi 
          ? `ඔබගේ ප්‍රදේශයට පවතින වර්ෂාව සහ අධික ආර්ද්‍රතාවය (${weather.humidity}%) හේතුවෙන් Bud Rot සහ කොළ කුණු රෝගය පැතිරීමේ දැඩි අවදානමක් පවතී. ගස්වල මුදුනට ජලය පිරීමෙන් වළකින්න. Copper Oxychloride යෙදීම සුදුසුය.` 
          : `Due to rain and high humidity (${weather.humidity}%) in your area, there is a severe risk of Bud Rot and Leaf Rot. Avoid water stagnation in the crown. Preventive Copper Oxychloride spray is recommended.`,
        icon: <CloudRain className="w-8 h-8 text-blue-500" />,
        color: 'bg-blue-50 border-blue-200 text-blue-800',
        alertColor: 'text-blue-600',
      };
    }
    
    // 2. Pest / Stress Diseases (High temp, low humidity -> WCLWD Stress, Caterpillars)
    if (weather.temp > 32 && weather.humidity < 65) {
      return {
        level: 'Medium',
        title: isSi ? 'පළිබෝධ සහ වියළි කාලගුණ අවදානම' : 'Pest & Drought Stress Risk',
        desc: isSi 
          ? `පවතින අධික උෂ්ණත්වය (${weather.temp}°C) හේතුවෙන් WCLWD රෝගී ගස් වල තත්ත්වය නරක අතට හැරිය හැක. එසේම CCI දළඹු හානි වැඩි විය හැක. කරුණාකර ගස් වලට හොඳින් ජලය සපයන්න.` 
          : `High temperatures (${weather.temp}°C) can worsen stress in WCLWD-affected trees and increase CCI Caterpillar activity. Ensure proper irrigation and monitor leaves.`,
        icon: <Sun className="w-8 h-8 text-orange-500" />,
        color: 'bg-orange-50 border-orange-200 text-orange-800',
        alertColor: 'text-orange-600',
      };
    }

    // 3. Good Weather (Optimal)
    return {
      level: 'Low',
      title: isSi ? 'පොල් වගාවට හිතකර කාලගුණයක්' : 'Optimal Weather for Coconuts',
      desc: isSi 
        ? `ඔබගේ ප්‍රදේශයේ කාලගුණය (උෂ්ණත්වය: ${weather.temp}°C, ආර්ද්‍රතාවය: ${weather.humidity}%) දැනට පොල් වගාවට ඉතා හිතකරය. රෝග අවදානම අවම මට්ටමක පවතී.` 
        : `Current weather conditions (Temp: ${weather.temp}°C, Humidity: ${weather.humidity}%) in your area are highly optimal for coconut farming. Disease risk is low.`,
      icon: <ShieldCheck className="w-8 h-8 text-green-500" />,
      color: 'bg-green-50 border-green-200 text-green-800',
      alertColor: 'text-green-600',
    };
  };

  const risk = getRiskPrediction();

  return (
    <div className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-4 flex items-center justify-between">
        <h3 className="text-white font-bold text-lg flex items-center gap-2">
          <MapPin className="w-5 h-5 text-green-400" />
          {isSi ? 'AI කාලගුණ සහ රෝග අවදානම් පුරෝකථනය' : 'AI Weather & Disease Risk Predictor'}
        </h3>
        {weather && (
          <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-semibold backdrop-blur-sm">
            {weather.locationName}
          </span>
        )}
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="w-8 h-8 text-green-500 animate-spin mb-3" />
            <p className="text-gray-500 text-sm">{isSi ? 'කාලගුණ දත්ත ලබා ගනිමින්...' : 'Fetching weather data...'}</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
            <button onClick={getLocationAndWeather} className="ml-auto bg-red-100 px-3 py-1 rounded-lg text-xs font-bold hover:bg-red-200">
              {isSi ? 'නැවත උත්සාහ කරන්න' : 'Retry'}
            </button>
          </div>
        ) : risk && weather ? (
          <div className="flex flex-col md:flex-row gap-6">
            
            {/* Weather Stats Box */}
            <div className="flex gap-4 md:w-1/3">
              <div className="flex-1 bg-gray-50 rounded-2xl p-4 border border-gray-100 flex flex-col items-center justify-center">
                <Thermometer className="w-6 h-6 text-red-500 mb-1" />
                <span className="text-2xl font-black text-gray-900">{weather.temp}°C</span>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{isSi ? 'උෂ්ණත්වය' : 'Temperature'}</span>
              </div>
              <div className="flex-1 bg-gray-50 rounded-2xl p-4 border border-gray-100 flex flex-col items-center justify-center">
                <Droplets className="w-6 h-6 text-blue-500 mb-1" />
                <span className="text-2xl font-black text-gray-900">{weather.humidity}%</span>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{isSi ? 'ආර්ද්‍රතාවය' : 'Humidity'}</span>
              </div>
            </div>

            {/* AI Risk Alert Box */}
            <div className={`flex-1 rounded-2xl p-5 border ${risk.color} flex items-start gap-4 transition-all hover:shadow-sm`}>
              <div className="bg-white p-3 rounded-full shadow-sm">
                {risk.icon}
              </div>
              <div>
                <h4 className={`text-lg font-extrabold mb-1 flex items-center gap-2 ${risk.alertColor}`}>
                  {risk.level === 'High' && <AlertTriangle className="w-5 h-5 animate-pulse" />}
                  {risk.title}
                </h4>
                <p className="text-sm font-medium leading-relaxed opacity-90">
                  {risk.desc}
                </p>
              </div>
            </div>

          </div>
        ) : null}
      </div>
    </div>
  );
}