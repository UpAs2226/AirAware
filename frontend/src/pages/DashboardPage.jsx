import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import AqiCard from '../components/AqiCard';

export default function DashboardPage() {
  const { user } = useAuth();
  const [airData, setAirData] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [loadingAir, setLoadingAir] = useState(true);
  const [loadingAI, setLoadingAI] = useState(false);
  const [city, setCity] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [coords, setCoords] = useState({ lat: 26.4499, lon: 80.3319 }); // Kanpur default
  const [locationName, setLocationName] = useState('Kanpur, India');
  const [error, setError] = useState('');

  const fetchAirData = async (lat, lon) => {
    setLoadingAir(true);
    setError('');
    try {
      const [currentRes, forecastRes] = await Promise.all([
        api.get(`/air-quality/current?lat=${lat}&lon=${lon}`),
        api.get(`/air-quality/forecast?lat=${lat}&lon=${lon}`)
      ]);
      setAirData(currentRes.data);
      const chartData = forecastRes.data.forecast
        .filter((_, i) => i % 3 === 0)
        .slice(0, 16)
        .map((d) => ({
          time: new Date(d.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          aqi: d.aqi,
          pm25: d.pm25
        }));
      setForecast(chartData);
    } catch (err) {
      setError('Failed to fetch air quality data.');
    } finally {
      setLoadingAir(false);
    }
  };

  useEffect(() => {
    // Try to get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setCoords({ lat: latitude, lon: longitude });
          setLocationName('Your location');
          fetchAirData(latitude, longitude);
        },
        () => {
          fetchAirData(coords.lat, coords.lon);
        }
      );
    } else {
      fetchAirData(coords.lat, coords.lon);
    }
  }, []);

  const handleSearch = async () => {
    if (!city.trim()) return;
    try {
      const res = await api.get(`/air-quality/geocode?city=${encodeURIComponent(city)}`);
      setSearchResults(res.data.results);
    } catch {
      setError('City search failed.');
    }
  };

  const selectCity = (result) => {
    setCoords({ lat: result.lat, lon: result.lon });
    setLocationName(`${result.name}, ${result.country}`);
    setSearchResults([]);
    setCity('');
    fetchAirData(result.lat, result.lon);
  };

  const fetchAIAnalysis = async () => {
    if (!airData) return;
    setLoadingAI(true);
    setAiAnalysis('');
    try {
      const res = await api.post('/ai/analyze', {
        aqi: airData.aqi,
        pm25: airData.pm25,
        pm10: airData.pm10,
        ozone: airData.ozone,
        location: locationName,
        healthProfile: user?.healthProfile
      });
      setAiAnalysis(res.data.analysis);
    } catch (err) {
      setAiAnalysis(err.response?.data?.message || 'AI analysis unavailable. Please set your Groq API key.');
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-12 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-on-surface">
            Hello, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-on-surface-variant text-sm mt-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">location_on</span>
            {locationName}
          </p>
        </div>
        {/* Search */}
        <div className="relative flex gap-2">
          <div className="relative">
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search city..."
              className="input-field w-56 pr-8"
            />
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 mt-1 w-full bg-white border border-outline-variant rounded-xl shadow-lg z-20">
                {searchResults.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => selectCity(r)}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-low text-left"
                  >
                    <span className="material-symbols-outlined text-[16px] text-on-surface-variant">place</span>
                    {r.name}, {r.country}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={handleSearch}
            className="bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">search</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-error-container border border-on-error-container/20 rounded-xl px-4 py-3 text-sm text-on-error-container mb-6">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-1">
          <AqiCard data={airData} loading={loadingAir} />
        </div>

        {/* Quick Stats */}
        <div className="md:col-span-2 grid grid-cols-2 gap-4">
          {[
            { label: 'Carbon Monoxide', value: airData?.co, unit: 'µg/m³', icon: 'co2', color: '#6366f1' },
            { label: 'Nitrogen Dioxide', value: airData?.no2, unit: 'µg/m³', icon: 'air', color: '#f59e0b' },
            { label: 'PM10', value: airData?.pm10, unit: 'µg/m³', icon: 'grain', color: '#8b5cf6' },
            { label: 'Ozone', value: airData?.ozone, unit: 'µg/m³', icon: 'wb_sunny', color: '#10b981' },
          ].map((item) => (
            <div key={item.label} className="card hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: item.color + '20' }}>
                  <span className="material-symbols-outlined text-[18px]" style={{ color: item.color }}>{item.icon}</span>
                </div>
                <p className="text-xs font-medium text-on-surface-variant">{item.label}</p>
              </div>
              <p className="text-2xl font-display font-bold text-on-surface">
                {loadingAir ? '--' : item.value != null ? Number(item.value).toFixed(1) : '--'}
              </p>
              <p className="text-xs text-on-surface-variant">{item.unit}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Forecast Chart */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display font-semibold text-xl text-on-surface">48-Hour Forecast</h2>
            <p className="text-sm text-on-surface-variant">AQI prediction over time</p>
          </div>
          <span className="text-xs text-on-surface-variant bg-surface-container-low px-3 py-1 rounded-full">Live</span>
        </div>
        {forecast.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={forecast} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <defs>
                <linearGradient id="aqiGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#006c49" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#006c49" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7eefe" />
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#6c7a71' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#6c7a71' }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: '#fff', border: '1px solid #e7eefe', borderRadius: 12, fontSize: 12 }}
                labelStyle={{ color: '#3c4a42', fontWeight: 600 }}
              />
              <Area type="monotone" dataKey="aqi" name="AQI" stroke="#006c49" strokeWidth={2} fill="url(#aqiGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-52 flex items-center justify-center bg-surface-container-low rounded-xl">
            {loadingAir ? (
              <div className="flex items-center gap-2 text-on-surface-variant text-sm">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                Loading forecast...
              </div>
            ) : (
              <p className="text-on-surface-variant text-sm">No forecast data available.</p>
            )}
          </div>
        )}
      </div>

      {/* AI Analysis */}
      <div className="card border-l-4 border-l-primary">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[20px]">psychology</span>
            </div>
            <div>
              <h2 className="font-display font-semibold text-on-surface">AI Health Analysis</h2>
              <p className="text-xs text-on-surface-variant">Powered by Groq LLaMA</p>
            </div>
          </div>
          <button
            onClick={fetchAIAnalysis}
            disabled={loadingAI || !airData}
            className="bg-primary hover:opacity-90 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all"
          >
            {loadingAI && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
            {loadingAI ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
        <div className="bg-surface-container-low rounded-xl p-4 min-h-[80px]">
          {aiAnalysis ? (
            <p className="text-sm text-on-surface leading-relaxed whitespace-pre-wrap">{aiAnalysis}</p>
          ) : (
            <p className="text-sm text-on-surface-variant italic">
              Click "Analyze" to get personalized health recommendations based on current air quality conditions and your health profile.
            </p>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {[
          { to: '/map', icon: 'map', label: 'Pollution Map' },
          { to: '/health', icon: 'favorite', label: 'Health AI Chat' },
          { to: '/alerts', icon: 'notifications', label: 'Manage Alerts' },
          { to: '/profile', icon: 'person', label: 'Health Profile' },
        ].map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="card flex items-center gap-3 hover:shadow-md transition-all hover:-translate-y-0.5"
          >
            <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[20px]">{item.icon}</span>
            </div>
            <span className="text-sm font-medium text-on-surface">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
