import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match.');
    }
    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-2 justify-center mb-8">
          <span className="font-display font-bold text-2xl text-primary">AirAware</span>
        </Link>

        <div className="card shadow-sm">
          <h1 className="font-display text-2xl font-bold text-on-surface mb-1">Create your account</h1>
          <p className="text-sm text-on-surface-variant mb-6">Start monitoring air quality for free</p>

          {error && (
            <div className="bg-error-container border border-on-error-container/20 rounded-lg px-4 py-3 text-sm text-on-error-container mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">Full name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-field"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">Email address</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-field"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">Password</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input-field"
                placeholder="Min. 6 characters"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">Confirm password</label>
              <input
                type="password"
                required
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                className="input-field"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:opacity-90 disabled:opacity-60 text-white py-3 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2"
            >
              {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-on-surface-variant">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
