import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    healthProfile: {
      hasAsthma: user?.healthProfile?.hasAsthma || false,
      hasCOPD: user?.healthProfile?.hasCOPD || false,
      hasAllergies: user?.healthProfile?.hasAllergies || false,
      sensitivityLevel: user?.healthProfile?.sensitivityLevel || 'medium'
    },
    alertsEnabled: user?.alertsEnabled ?? true
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');
    setError('');
    try {
      const res = await api.put('/auth/profile', form);
      updateUser(res.data.user);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-12 py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-on-surface mb-1">Profile & Settings</h1>
        <p className="text-on-surface-variant text-sm">Manage your health profile for personalized recommendations</p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-4 mb-8 p-5 bg-gradient-to-r from-primary/10 to-transparent rounded-2xl border border-primary/20">
        <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl font-display">
          {initials}
        </div>
        <div>
          <p className="font-display font-semibold text-xl text-on-surface">{user?.name}</p>
          <p className="text-sm text-on-surface-variant">{user?.email}</p>
          <span className="inline-flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full mt-1">
            <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            Active member
          </span>
        </div>
      </div>

      {success && (
        <div className="bg-primary/10 border border-primary/20 rounded-xl px-4 py-3 text-sm text-primary mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          {success}
        </div>
      )}
      {error && (
        <div className="bg-error-container border border-on-error-container/20 rounded-xl px-4 py-3 text-sm text-on-error-container mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Info */}
        <div className="card">
          <h2 className="font-display font-semibold text-lg text-on-surface mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">person</span>
            Basic Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">Email</label>
              <input type="email" value={user?.email || ''} disabled className="input-field opacity-60 cursor-not-allowed" />
            </div>
          </div>
        </div>

        {/* Health Profile */}
        <div className="card">
          <h2 className="font-display font-semibold text-lg text-on-surface mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">favorite</span>
            Health Profile
          </h2>
          <p className="text-xs text-on-surface-variant mb-5">
            This information helps personalize your AI health recommendations.
          </p>

          <div className="space-y-4">
            {[
              { key: 'hasAsthma', label: 'Asthma', desc: 'Chronic respiratory condition' },
              { key: 'hasCOPD', label: 'COPD', desc: 'Chronic obstructive pulmonary disease' },
              { key: 'hasAllergies', label: 'Respiratory Allergies', desc: 'Pollen, dust, or environmental allergies' },
            ].map((item) => (
              <label key={item.key} className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-container-low cursor-pointer">
                <div>
                  <p className="text-sm font-medium text-on-surface">{item.label}</p>
                  <p className="text-xs text-on-surface-variant">{item.desc}</p>
                </div>
                <input
                  type="checkbox"
                  checked={form.healthProfile[item.key]}
                  onChange={(e) => setForm({
                    ...form,
                    healthProfile: { ...form.healthProfile, [item.key]: e.target.checked }
                  })}
                  className="w-5 h-5 rounded accent-primary cursor-pointer"
                />
              </label>
            ))}

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-2">Sensitivity Level</label>
              <div className="grid grid-cols-3 gap-2">
                {['low', 'medium', 'high'].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setForm({ ...form, healthProfile: { ...form.healthProfile, sensitivityLevel: level } })}
                    className={`py-2.5 rounded-xl text-sm font-medium capitalize transition-all ${
                      form.healthProfile.sensitivityLevel === level
                        ? 'bg-primary text-white'
                        : 'bg-surface-container-low border border-outline-variant text-on-surface-variant hover:border-primary'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="card">
          <h2 className="font-display font-semibold text-lg text-on-surface mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">notifications</span>
            Notifications
          </h2>
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-sm font-medium text-on-surface">Enable Alerts</p>
              <p className="text-xs text-on-surface-variant">Receive health alerts when air quality thresholds are exceeded</p>
            </div>
            <button
              type="button"
              onClick={() => setForm({ ...form, alertsEnabled: !form.alertsEnabled })}
              className={`relative w-12 h-6 rounded-full transition-colors ${form.alertsEnabled ? 'bg-primary' : 'bg-outline-variant'}`}
            >
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.alertsEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </label>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-primary hover:opacity-90 disabled:opacity-60 text-white py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all"
        >
          {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
