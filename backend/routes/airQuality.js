// backend/routes/airQuality.js
const fetch = require('node-fetch');
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// ─── AQI META HELPER ─────────────────────────────────────────

function getAqiMeta(aqi) {
  if (aqi === null || aqi === undefined || isNaN(aqi)) {
    return {
      label: 'Unknown',
      color: '#9ca3af',
      advice: 'No data available for this location.'
    };
  }
  if (aqi <= 50) return { label: 'Good', color: '#22c55e', advice: 'Air quality is satisfactory. Enjoy outdoor activities!' };
  if (aqi <= 100) return { label: 'Moderate', color: '#eab308', advice: 'Acceptable air quality. Unusually sensitive people should limit prolonged outdoor exertion.' };
  if (aqi <= 150) return { label: 'Unhealthy for Sensitive Groups', color: '#f97316', advice: 'Sensitive groups (asthma, elderly, children) should reduce outdoor exertion.' };
  if (aqi <= 200) return { label: 'Unhealthy', color: '#ef4444', advice: 'Everyone may experience health effects. Sensitive groups should avoid outdoor exertion.' };
  if (aqi <= 300) return { label: 'Very Unhealthy', color: '#a855f7', advice: 'Health alert: everyone may experience serious effects. Avoid outdoor activity.' };
  return { label: 'Hazardous', color: '#7f1d1d', advice: 'Emergency conditions. Stay indoors with air purifier. Avoid all outdoor activity.' };
}

// ─── FETCH OPEN-METEO POLLUTANT DATA (µg/m³) ─────────────────
// This gives REAL concentrations, not AQI sub-indices
async function fetchOpenMeteoPollutants(lat, lon) {
  try {
    const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm2_5,pm10,carbon_monoxide,nitrogen_dioxide,ozone,sulphur_dioxide,us_aqi&timezone=auto`;

    console.log('   🌍 Open-Meteo URL:', url);

    const response = await fetch(url);

    if (!response.ok) {
      console.warn('   ⚠️ Open-Meteo failed:', response.status);
      return null;
    }

    const data = await response.json();
    console.log('   ✅ Open-Meteo raw current:', JSON.stringify(data.current, null, 2));

    return {
      pm25: data.current?.pm2_5 ?? null,
      pm10: data.current?.pm10 ?? null,
      co: data.current?.carbon_monoxide ?? null,
      no2: data.current?.nitrogen_dioxide ?? null,
      o3: data.current?.ozone ?? null,
      so2: data.current?.sulphur_dioxide ?? null,
      aqi: data.current?.us_aqi ?? null
    };
  } catch (err) {
    console.warn('   ⚠️ Open-Meteo error:', err.message);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
// ✅ GET CURRENT AQI + POLLUTANTS
// ─────────────────────────────────────────────────────────────

router.get('/current', protect, async (req, res) => {
  console.log('\n╔════════════════════════════════════╗');
  console.log('║     STARTING AQI FETCH REQUEST     ║');
  console.log('╚════════════════════════════════════╝\n');

  try {
    const lat = parseFloat(req.query.lat || 26.4499);
    const lon = parseFloat(req.query.lon || 80.3319);

    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid latitude or longitude'
      });
    }

    console.log(`📍 Coordinates: ${lat}, ${lon}\n`);

    // ────────────────────────────────────────────────────────
    // STEP A: Fetch WAQI (for AQI + station info)
    // ────────────────────────────────────────────────────────
    const token = process.env.WAQI_TOKEN;
    let waqiData = null;

    if (token) {
      console.log('🔑 WAQI token found, fetching station data...');
      try {
        const waqiUrl = `https://api.waqi.info/feed/geo:${lat};${lon}/?token=${token}`;
        const waqiResponse = await fetch(waqiUrl);

        if (waqiResponse.ok) {
          const waqiJson = await waqiResponse.json();
          if (waqiJson.status === 'ok') {
            waqiData = waqiJson.data;
            console.log(`   ✅ WAQI Station: ${waqiData.city?.name}`);
            console.log(`   ✅ WAQI AQI: ${waqiData.aqi}`);
            console.log(`   ✅ WAQI iaqi keys: ${Object.keys(waqiData.iaqi || {}).join(', ')}\n`);
          } else {
            console.warn(`   ⚠️ WAQI status: ${waqiJson.status}\n`);
          }
        }
      } catch (waqiErr) {
        console.warn('   ⚠️ WAQI fetch failed:', waqiErr.message, '\n');
      }
    } else {
      console.warn('🔑 No WAQI_TOKEN found, skipping WAQI\n');
    }

    // ────────────────────────────────────────────────────────
    // STEP B: Fetch Open-Meteo (for actual µg/m³ pollutants)
    // ────────────────────────────────────────────────────────
    console.log('🌍 Fetching Open-Meteo pollutant concentrations...');
    const openMeteo = await fetchOpenMeteoPollutants(lat, lon);
    console.log();

    // ────────────────────────────────────────────────────────
    // STEP C: Merge both sources
    // ────────────────────────────────────────────────────────
    console.log('🔀 Merging data from both sources...');

    const iaqi = waqiData?.iaqi || {};

    // AQI: prefer WAQI (ground station), fallback Open-Meteo
    let aqi = null;
    if (waqiData?.aqi && waqiData.aqi !== '-') {
      aqi = parseInt(waqiData.aqi, 10);
      console.log(`   AQI source: WAQI (${aqi})`);
    } else if (openMeteo?.aqi) {
      aqi = openMeteo.aqi;
      console.log(`   AQI source: Open-Meteo (${aqi})`);
    }

    const { label, color, advice } = getAqiMeta(aqi);

    // Pollutants: prefer Open-Meteo (real µg/m³), fallback WAQI sub-index
    const pollutants = {
      pm25: openMeteo?.pm25 ?? iaqi.pm25?.v ?? null,
      pm10: openMeteo?.pm10 ?? iaqi.pm10?.v ?? null,
      co:   openMeteo?.co   ?? iaqi.co?.v   ?? null,
      no2:  openMeteo?.no2  ?? iaqi.no2?.v  ?? null,
      o3:   openMeteo?.o3   ?? iaqi.o3?.v   ?? null,
      so2:  openMeteo?.so2  ?? iaqi.so2?.v  ?? null
    };

    console.log('   📊 Final pollutants:');
    console.log(`      PM2.5: ${pollutants.pm25} µg/m³`);
    console.log(`      PM10:  ${pollutants.pm10} µg/m³`);
    console.log(`      CO:    ${pollutants.co} µg/m³`);
    console.log(`      NO2:   ${pollutants.no2} µg/m³`);
    console.log(`      O3:    ${pollutants.o3} µg/m³`);
    console.log(`      SO2:   ${pollutants.so2} µg/m³\n`);

    const result = {
      success: true,
      aqi,
      aqiLabel: label,
      aqiColor: color,
      advice,
      dominentpol: waqiData?.dominentpol || null,

      // ✅ Individual pollutant concentrations in µg/m³
      pollutants,

      // ✅ Also flat keys for backward compatibility
      pm25: pollutants.pm25,
      pm10: pollutants.pm10,
      co:   pollutants.co,
      no2:  pollutants.no2,
      ozone: pollutants.o3,
      so2:  pollutants.so2,

      environment: {
        temperature: iaqi.t?.v ?? null,
        humidity:    iaqi.h?.v ?? null,
        pressure:    iaqi.p?.v ?? null,
        wind:        iaqi.w?.v ?? null
      },

      stationName: waqiData?.city?.name || 'Open-Meteo Grid',
      stationUrl:  waqiData?.city?.url  || null,
      time: waqiData?.time?.s || new Date().toISOString(),

      dataSources: {
        waqi:      waqiData ? true : false,
        openMeteo: openMeteo ? true : false
      },

      location: {
        lat,
        lon,
        geo: waqiData?.city?.geo || [lat, lon]
      }
    };

    console.log('╔════════════════════════════════════╗');
    console.log('║        REQUEST COMPLETED OK        ║');
    console.log('╚════════════════════════════════════╝\n');

    res.json(result);

  } catch (err) {
    console.error('\n❌ FATAL ERROR:', err.message);
    console.error(err.stack);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch air quality data',
      error: err.message
    });
  }
});

// ─────────────────────────────────────────────────────────────
// ✅ GET FORECAST
// ─────────────────────────────────────────────────────────────

router.get('/forecast', protect, async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat || 26.4499);
    const lon = parseFloat(req.query.lon || 80.3319);

    console.log(`\n🔮 Fetching forecast for: ${lat}, ${lon}`);

    const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&hourly=us_aqi,pm2_5,pm10,carbon_monoxide,nitrogen_dioxide,ozone,sulphur_dioxide&timezone=auto&forecast_days=2`;

    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();

    const forecast = (data.hourly?.time || []).slice(0, 48).map((time, i) => ({
      time,
      aqi:  data.hourly.us_aqi?.[i]            ?? null,
      pm25: data.hourly.pm2_5?.[i]             ?? null,
      pm10: data.hourly.pm10?.[i]              ?? null,
      co:   data.hourly.carbon_monoxide?.[i]   ?? null,
      no2:  data.hourly.nitrogen_dioxide?.[i]  ?? null,
      o3:   data.hourly.ozone?.[i]             ?? null,
      so2:  data.hourly.sulphur_dioxide?.[i]   ?? null
    }));

    console.log(`✅ Forecast: ${forecast.length} hours fetched\n`);

    res.json({
      success: true,
      forecast,
      location: { lat, lon }
    });

  } catch (err) {
    console.error('❌ Forecast error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch forecast data',
      error: err.message
    });
  }
});

// ─────────────────────────────────────────────────────────────
// ✅ GEOCODE
// ─────────────────────────────────────────────────────────────

router.get('/geocode', protect, async (req, res) => {
  try {
    const { city } = req.query;

    if (!city || city.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'City parameter is required'
      });
    }

    console.log(`\n🔍 Geocoding: ${city}`);

    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=5&language=en&format=json`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Geocoding failed');

    const data = await response.json();

    const results = (data.results || []).map((r) => ({
      name: r.name,
      country: r.country,
      lat: r.latitude,
      lon: r.longitude,
      admin1: r.admin1 || null
    }));

    console.log(`✅ Found ${results.length} results\n`);
    res.json({ success: true, results });

  } catch (err) {
    console.error('❌ Geocode error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to geocode location', error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// ✅ NEARBY STATIONS
// ─────────────────────────────────────────────────────────────

router.get('/nearby-stations', protect, async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat || 26.4499);
    const lon = parseFloat(req.query.lon || 80.3319);

    console.log(`\n🗺️  Fetching nearby stations: ${lat}, ${lon}`);

    const token = process.env.WAQI_TOKEN;
    if (!token) {
      return res.status(503).json({ success: false, message: 'WAQI_TOKEN not configured' });
    }

    const url = `https://api.waqi.info/map/bounds/?token=${token}&latlng=${lat - 0.5},${lon - 0.5},${lat + 0.5},${lon + 0.5}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Stations API error');

    const json = await response.json();

    if (json.status !== 'ok') {
      return res.json({ success: true, stations: [], count: 0, location: { lat, lon } });
    }

    const stations = (json.data || []).map((s) => {
      const aqi = s.aqi === '-' ? null : parseInt(s.aqi, 10);
      return {
        uid: s.uid,
        name: s.station?.name || 'Station',
        aqi,
        lat: s.lat,
        lon: s.lon,
        ...getAqiMeta(aqi)
      };
    });

    console.log(`✅ Found ${stations.length} stations\n`);
    res.json({ success: true, stations, count: stations.length, location: { lat, lon } });

  } catch (err) {
    console.error('❌ Stations error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch stations', error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// ✅ HEALTH TIPS
// ─────────────────────────────────────────────────────────────

router.get('/health-tips', protect, (req, res) => {
  try {
    const aqiValue = parseInt(req.query.aqi) || 0;
    const { advice } = getAqiMeta(aqiValue);

    const tips = {
      good: ['Perfect time for outdoor activities', 'No respiratory concerns', 'Great for sports and exercise'],
      moderate: ['Unusually sensitive people should limit prolonged exertion', 'Mask recommended for sensitive groups', 'Consider shorter outdoor sessions'],
      unhealthy_sensitive: ['Sensitive groups should avoid outdoor exertion', 'Wear N95 mask if going outside', 'Keep windows closed', 'Use air purifier indoors'],
      unhealthy: ['Everyone may experience health effects', 'Avoid outdoor activity', 'Wear protective mask', 'Keep indoors with air filtration'],
      very_unhealthy: ['Avoid all outdoor activity', 'Stay indoors as much as possible', 'Use air purifier continuously', 'Consult doctor if symptoms persist'],
      hazardous: ['Emergency conditions - stay indoors', 'Use best available air filtration', 'Seek medical attention if needed', 'Avoid any outdoor exposure']
    };

    let tipCategory = 'good';
    if (aqiValue > 300) tipCategory = 'hazardous';
    else if (aqiValue > 200) tipCategory = 'very_unhealthy';
    else if (aqiValue > 150) tipCategory = 'unhealthy';
    else if (aqiValue > 100) tipCategory = 'unhealthy_sensitive';
    else if (aqiValue > 50) tipCategory = 'moderate';

    res.json({ success: true, aqi: aqiValue, category: tipCategory, advice, tips: tips[tipCategory] });

  } catch (err) {
    console.error('❌ Health tips error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to get health tips', error: err.message });
  }
});

module.exports = router;