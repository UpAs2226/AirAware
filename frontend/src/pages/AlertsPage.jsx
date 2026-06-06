import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const ALERT_TYPES = [
  { value: 'aqi', label: 'AQI (European Index)' },
  { value: 'pm25', label: 'PM2.5 (µg/m³)' },
  { value: 'pm10', label: 'PM10 (µg/m³)' },
  { value: 'ozone', label: 'Ozone (µg/m³)' },
  { value: 'co2', label: 'Carbon Monoxide (µg/m³)' },
];

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: 'aqi', threshold: '', location: '', message: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchAlerts(); }, []);

  const fetchAlerts = async () => {
    try {
      const res = await api.get('/alerts');
      setAlerts(res.data.alerts);
    } catch {
      setError('Failed to load alerts.');
    } finally {
      setLoading(false);
    }
  };

  const createAlert = async (e) => {
    e.preventDefault();
    if (!form.threshold) return setError('Threshold is required.');
    setSaving(true);
    setError('');
    try {
      const res = await api.post('/alerts', {
        type: form.type,
        threshold: Number(form.threshold),
        location: form.location ? { name: form.location } : undefined,
        message: form.message || undefined
      });
      setAlerts([res.data.alert, ...alerts]);
      setShowForm(false);
      setForm({ type: 'aqi', threshold: '', location: '', message: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create alert.');
    } finally {
      setSaving(false);
    }
  };

  const toggleAlert = async (id, isActive) => {
    try {
      const res = await api.put(`/alerts/${id}`, { isActive: !isActive });
      setAlerts(alerts.map((a) => a._id === id ? res.data.alert : a));
    } catch {}
  };

  const deleteAlert = async (id) => {
    if (!window.confirm('Delete this alert?')) return;
    try {
      await api.delete(`/alerts/${id}`);
      setAlerts(alerts.filter((a) => a._id !== id));
    } catch {}
  };

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-12 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-on-surface mb-1">Health Alerts</h1>
          <p className="text-on-surface-variant text-sm">Get notified when air quality exceeds your thresholds</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary hover:opacity-90 text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">{showForm ? 'close' : 'add'}</span>
          {showForm ? 'Cancel' : 'New Alert'}
        </button>
      </div>

      {error && (
        <div className="bg-error-container border border-on-error-container/20 rounded-xl px-4 py-3 text-sm text-on-error-container mb-6">
          {error}
        </div>
      )}

      {/* Create Form */}
      {showForm && (
        <div className="card border border-primary/30 mb-6">
          <h2 className="font-display font-semibold text-xl text-on-surface mb-5">Create New Alert</h2>
          <form onSubmit={createAlert} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">Alert Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="input-field"
                >
                  {ALERT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">Threshold Value</label>
                <input
                  type="number"
                  required
                  value={form.threshold}
                  onChange={(e) => setForm({ ...form, threshold: e.target.value })}
                  className="input-field"
                  placeholder="e.g. 50"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">Location (optional)</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="input-field"
                  placeholder="e.g. New Delhi"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">Custom Message (optional)</label>
                <input
                  type="text"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="input-field"
                  placeholder="Alert notification text"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="bg-primary hover:opacity-90 disabled:opacity-60 text-white px-6 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all"
              >
                {saving && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                Save Alert
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary px-6 py-2.5 rounded-lg text-sm">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Alerts List */}
      {loading ? (
        <div className="space-y-3">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="card animate-pulse h-20"></div>
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-3">notifications_off</span>
          <h3 className="font-semibold text-on-surface mb-1">No alerts configured</h3>
          <p className="text-sm text-on-surface-variant mb-4">Create your first health alert to get notified about air quality changes.</p>
          <button onClick={() => setShowForm(true)} className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-all">
            Create Alert
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div key={alert._id} className={`card flex items-center gap-4 transition-all ${!alert.isActive ? 'opacity-60' : ''}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${alert.isActive ? 'bg-primary/10' : 'bg-surface-container'}`}>
                <span className={`material-symbols-outlined text-[20px] ${alert.isActive ? 'text-primary' : 'text-on-surface-variant'}`}>
                  {alert.isActive ? 'notifications_active' : 'notifications_off'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-on-surface">
                    {ALERT_TYPES.find((t) => t.value === alert.type)?.label || alert.type.toUpperCase()}
                  </p>
                  <span className="text-xs bg-surface-container px-2 py-0.5 rounded-full text-on-surface-variant">
                    Threshold: {alert.threshold}
                  </span>
                  {alert.location?.name && (
                    <span className="text-xs text-on-surface-variant flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[12px]">place</span>
                      {alert.location.name}
                    </span>
                  )}
                </div>
                {alert.message && <p className="text-xs text-on-surface-variant mt-0.5 truncate">{alert.message}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => toggleAlert(alert._id, alert.isActive)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${alert.isActive ? 'bg-primary' : 'bg-outline-variant'}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${alert.isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
                <button
                  onClick={() => deleteAlert(alert._id)}
                  className="p-1.5 rounded-lg hover:bg-error-container text-on-surface-variant hover:text-on-error-container transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
