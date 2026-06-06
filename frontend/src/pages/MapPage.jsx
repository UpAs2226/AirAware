import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import api from '../utils/api';

const CITIES = [
  { name: 'New Delhi', country: 'India', lat: 28.6139, lon: 77.2090 },
  { name: 'Mumbai', country: 'India', lat: 19.0760, lon: 72.8777 },
  { name: 'Kanpur', country: 'India', lat: 26.4499, lon: 80.3319 },
  { name: 'Kolkata', country: 'India', lat: 22.5726, lon: 88.3639 },
  { name: 'Bangalore', country: 'India', lat: 12.9716, lon: 77.5946 },
  { name: 'Chennai', country: 'India', lat: 13.0827, lon: 80.2707 },
];

export default function MapPage() {
  const [cityData, setCityData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [searchCity, setSearchCity] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [customCities, setCustomCities] = useState([]);

  useEffect(() => {
    fetchAllCities();
  }, []);

  const fetchAllCities = async () => {
    setLoading(true);
    try {
      const results = await Promise.allSettled(
        CITIES.map((c) => api.get(`/air-quality/current?lat=${c.lat}&lon=${c.lon}`))
      );
      const data = results.map((res, i) => ({
        ...CITIES[i],
        ...(res.status === 'fulfilled' ? res.value.data : { aqi: null, aqiLabel: 'N/A', aqiColor: '#9ca3af' })
      }));
      setCityData(data);
      setSelected(data[0]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchCity.trim()) return;
    try {
      const res = await api.get(`/air-quality/geocode?city=${encodeURIComponent(searchCity)}`);
      setSearchResults(res.data.results);
    } catch {
      setSearchResults([]);
    }
  };

  const addCity = async (result) => {
    setSearchResults([]);
    setSearchCity('');
    try {
      const res = await api.get(`/air-quality/current?lat=${result.lat}&lon=${result.lon}`);
      const newCity = { name: result.name, country: result.country, lat: result.lat, lon: result.lon, ...res.data };
      setCustomCities((prev) => [newCity, ...prev]);
      setCityData((prev) => [newCity, ...prev]);
      setSelected(newCity);
    } catch {}
  };

  const chartData = cityData.filter((d) => d.aqi != null).map((d) => ({
    name: d.name,
    aqi: d.aqi,
    color: d.aqiColor || '#006c49'
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-12 py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-on-surface mb-1">Pollution Map</h1>
        <p className="text-on-surface-variant text-sm">Real-time AQI comparison across cities</p>
      </div>

      {/* Search */}
      <div className="flex gap-2 mb-6 max-w-md relative">
        <input
          type="text"
          value={searchCity}
          onChange={(e) => setSearchCity(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Add a city to compare..."
          className="input-field flex-1"
        />
        <button onClick={handleSearch} className="bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-all">
          <span className="material-symbols-outlined text-[18px]">add</span>
        </button>
        {searchResults.length > 0 && (
          <div className="absolute top-full left-0 mt-1 w-full bg-white border border-outline-variant rounded-xl shadow-lg z-20">
            {searchResults.slice(0, 4).map((r, i) => (
              <button key={i} onClick={() => addCity(r)} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-low text-left">
                <span className="material-symbols-outlined text-[16px] text-on-surface-variant">place</span>
                {r.name}, {r.country}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* City List */}
        <div className="md:col-span-1 space-y-3">
          <h2 className="font-semibold text-on-surface text-sm uppercase tracking-wide text-on-surface-variant">Cities</h2>
          {loading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="card animate-pulse h-16"></div>
            ))
          ) : (
            cityData.map((city) => (
              <button
                key={`${city.name}-${city.lat}`}
                onClick={() => setSelected(city)}
                className={`w-full card text-left transition-all hover:shadow-md ${selected?.name === city.name && selected?.lat === city.lat ? 'ring-2 ring-primary' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-on-surface">{city.name}</p>
                    <p className="text-xs text-on-surface-variant">{city.country}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-display font-bold" style={{ color: city.aqiColor }}>
                      {city.aqi ?? '--'}
                    </p>
                    <span className="text-xs px-2 py-0.5 rounded-full text-white font-medium" style={{ backgroundColor: city.aqiColor }}>
                      {city.aqiLabel}
                    </span>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Detail Panel + Chart */}
        <div className="md:col-span-2 space-y-6">
          {selected && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-display text-2xl font-bold text-on-surface">{selected.name}</h2>
                  <p className="text-on-surface-variant text-sm">{selected.country}</p>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-display font-bold" style={{ color: selected.aqiColor }}>{selected.aqi ?? '--'}</p>
                  <span className="text-sm px-3 py-1 rounded-full text-white" style={{ backgroundColor: selected.aqiColor }}>{selected.aqiLabel}</span>
                </div>
              </div>
              {selected.advice && (
                <div className="bg-surface-container-low rounded-xl p-3 mb-4">
                  <p className="text-sm text-on-surface">{selected.advice}</p>
                </div>
              )}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: 'PM2.5', value: selected.pm25 },
                  { label: 'PM10', value: selected.pm10 },
                  { label: 'NO₂', value: selected.no2 },
                  { label: 'Ozone', value: selected.ozone },
                ].map((item) => (
                  <div key={item.label} className="bg-surface-container-low rounded-xl p-3 text-center">
                    <p className="text-xs text-on-surface-variant mb-1">{item.label}</p>
                    <p className="text-base font-display font-bold text-on-surface">
                      {item.value != null ? Number(item.value).toFixed(1) : '--'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bar Chart Comparison */}
          <div className="card">
            <h2 className="font-display font-semibold text-xl text-on-surface mb-4">AQI Comparison</h2>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7eefe" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6c7a71' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#6c7a71' }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#fff', border: '1px solid #e7eefe', borderRadius: 12, fontSize: 12 }}
                  />
                  <Bar dataKey="aqi" radius={[6, 6, 0, 0]} name="AQI">
                    {chartData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-52 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
