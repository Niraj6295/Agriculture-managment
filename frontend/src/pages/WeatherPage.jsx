import { useEffect, useState } from 'react';
import { Cloud, Wind, Droplets, Thermometer, MapPin, RefreshCw } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

const WMO_CODES = {
  0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Foggy', 51: 'Light drizzle', 53: 'Moderate drizzle', 61: 'Slight rain',
  63: 'Moderate rain', 65: 'Heavy rain', 80: 'Slight showers', 81: 'Moderate showers',
  95: 'Thunderstorm', 96: 'Thunderstorm with hail',
};

export default function WeatherPage() {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [location, setLocation] = useState({ name: 'Kolkata, India', lat: 22.5726, lon: 88.3639 });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const fetchWeather = async (lat, lon, locName) => {
    setLoading(true);
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weathercode,apparent_temperature&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&timezone=auto&forecast_days=7`;
      const res = await fetch(url);
      const data = await res.json();
      setWeather({
        temp: data.current.temperature_2m,
        feelsLike: data.current.apparent_temperature,
        humidity: data.current.relative_humidity_2m,
        wind: data.current.wind_speed_10m,
        code: data.current.weathercode,
        condition: WMO_CODES[data.current.weathercode] || 'Unknown',
        location: locName,
      });
      setForecast(data.daily.time.map((d, i) => ({
        date: new Date(d).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }),
        max: data.daily.temperature_2m_max[i],
        min: data.daily.temperature_2m_min[i],
        rain: data.daily.precipitation_sum[i],
        condition: WMO_CODES[data.daily.weathercode[i]] || 'Unknown',
      })));
    } catch {
      toast.error('Failed to fetch weather data');
    } finally { setLoading(false); }
  };

  const searchLocation = async () => {
    if (!search.trim()) return;
    try {
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(search)}&count=1`);
      const data = await res.json();
      if (data.results?.length) {
        const r = data.results[0];
        const locName = `${r.name}, ${r.country}`;
        setLocation({ name: locName, lat: r.latitude, lon: r.longitude });
        fetchWeather(r.latitude, r.longitude, locName);
        setSearch('');
      } else {
        toast.error('Location not found');
      }
    } catch { toast.error('Search failed'); }
  };

  const useMyLocation = () => {
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude: lat, longitude: lon } = pos.coords;
        setLocation(l => ({ ...l, lat, lon }));
        fetchWeather(lat, lon, 'My Location');
      },
      () => toast.error('Location access denied')
    );
  };

  useEffect(() => { fetchWeather(location.lat, location.lon, location.name); }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Weather</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Live conditions powered by Open-Meteo (free, no API key)</p>
        </div>
        <div className="flex gap-2">
          <input className="input w-48" placeholder="Search city…" value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && searchLocation()} />
          <button onClick={searchLocation} className="btn-primary px-3">Search</button>
          <button onClick={useMyLocation} className="btn-secondary px-3" title="Use my location"><MapPin size={16} /></button>
          <button onClick={() => fetchWeather(location.lat, location.lon, location.name)} className="btn-secondary px-3" disabled={loading}><RefreshCw size={16} className={loading ? 'animate-spin' : ''} /></button>
        </div>
      </div>

      {loading && !weather ? (
        <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>
      ) : weather ? (
        <>
          {/* Current Weather */}
          <div className="card p-6 bg-gradient-to-br from-primary-600 to-primary-800 text-white">
            <div className="flex items-center gap-2 mb-4 opacity-90">
              <MapPin size={16} />
              <span className="text-sm">{weather.location}</span>
            </div>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-6xl font-bold">{Math.round(weather.temp)}°C</p>
                <p className="text-primary-100 mt-1">{weather.condition}</p>
                <p className="text-sm text-primary-200 mt-1">Feels like {Math.round(weather.feelsLike)}°C</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-primary-100">
                  <Droplets size={18} /><span>{weather.humidity}% Humidity</span>
                </div>
                <div className="flex items-center gap-2 text-primary-100">
                  <Wind size={18} /><span>{weather.wind} km/h Wind</span>
                </div>
              </div>
            </div>
          </div>

          {/* Temp Chart */}
          <div className="card p-5">
            <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">7-Day Temperature Forecast</h2>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={forecast}>
                <defs>
                  <linearGradient id="tGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Area type="monotone" dataKey="max" stroke="#22c55e" fill="url(#tGrad)" name="Max°C" />
                <Area type="monotone" dataKey="min" stroke="#3b82f6" fill="none" name="Min°C" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* 7-day cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {forecast.map((d, i) => (
              <div key={i} className="card p-3 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{d.date}</p>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{Math.round(d.max)}°</p>
                <p className="text-xs text-blue-500">{Math.round(d.min)}°</p>
                {d.rain > 0 && <p className="text-xs text-blue-400 mt-1">🌧 {d.rain}mm</p>}
                <p className="text-xs text-gray-400 mt-1 truncate" title={d.condition}>{d.condition}</p>
              </div>
            ))}
          </div>

          {/* Farming Advisory */}
          <div className="card p-5">
            <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">🌾 Farming Advisory</h2>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              {weather.humidity > 80 && <p className="flex items-center gap-2">⚠️ High humidity detected — watch for fungal diseases on crops.</p>}
              {weather.wind > 40 && <p className="flex items-center gap-2">⚠️ High winds — avoid spraying pesticides or fertilizers today.</p>}
              {forecast[0]?.rain > 10 && <p className="flex items-center gap-2">🌧 Rain expected — consider postponing irrigation scheduled for today.</p>}
              {weather.temp > 38 && <p className="flex items-center gap-2">🌡️ Extreme heat — ensure adequate irrigation. Avoid field work midday.</p>}
              {weather.temp < 10 && <p className="flex items-center gap-2">❄️ Cold temperatures — protect sensitive seedlings overnight.</p>}
              {weather.humidity <= 80 && weather.wind <= 40 && weather.temp >= 10 && weather.temp <= 38 && forecast[0]?.rain <= 10 &&
                <p className="flex items-center gap-2">✅ Conditions look good for normal farm operations today.</p>}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
