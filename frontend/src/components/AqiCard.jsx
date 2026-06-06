import React from 'react';

export default function AqiCard({ data, loading }) {
  if (loading) {
    return (
      <div className="card animate-pulse">
        <div className="h-4 bg-surface-container-high rounded w-1/3 mb-4"></div>
        <div className="h-16 bg-surface-container-high rounded mb-4"></div>
        <div className="h-4 bg-surface-container-high rounded w-2/3"></div>
      </div>
    );
  }

  if (!data) return null;

  const aqiPercent = Math.min((data.aqi / 100) * 100, 100);

  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-medium text-on-surface-variant uppercase tracking-wide">Air Quality Index</p>
          <h2 className="text-5xl font-display font-bold mt-1" style={{ color: data.aqiColor }}>
            {data.aqi ?? '--'}
          </h2>
        </div>
        <span
          className="px-3 py-1 rounded-full text-xs font-semibold text-white"
          style={{ backgroundColor: data.aqiColor }}
        >
          {data.aqiLabel}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2.5 bg-surface-container rounded-full mb-4 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${aqiPercent}%`, backgroundColor: data.aqiColor }}
        />
      </div>

      <p className="text-sm text-on-surface-variant">{data.advice}</p>

      <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-outline-variant">
        {[
          { label: 'PM2.5', value: data.pm25, unit: 'µg/m³' },
          { label: 'PM10', value: data.pm10, unit: 'µg/m³' },
          { label: 'Ozone', value: data.ozone, unit: 'µg/m³' },
        ].map((item) => (
          <div key={item.label} className="text-center">
            <p className="text-xs text-on-surface-variant">{item.label}</p>
            <p className="text-base font-semibold text-on-surface font-display">
              {item.value != null ? Number(item.value).toFixed(1) : '--'}
            </p>
            <p className="text-xs text-on-surface-variant">{item.unit}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
