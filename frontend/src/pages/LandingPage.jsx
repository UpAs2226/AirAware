import React from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Navbar */}
      <header className="bg-white/80 backdrop-blur-md border-b border-outline-variant sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-12 h-16 flex items-center justify-between">
          <span className="font-display font-bold text-2xl text-primary">AirAware</span>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Features</a>
            <a href="#science" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Science</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">Sign in</Link>
            <Link to="/register" className="btn-primary text-sm px-5 py-2.5 rounded-lg bg-primary text-white font-medium hover:opacity-90 transition-all">
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative hero-gradient py-28 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-64 h-64 bg-primary-container/10 rounded-full blur-2xl"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 md:px-12 grid md:grid-cols-2 gap-16 items-center relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-1.5 rounded-full text-primary text-xs font-semibold mb-6">
              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              Advanced Environmental Monitoring
            </div>
            <h1 className="font-display text-5xl md:text-6xl font-bold text-on-surface mb-6 leading-tight tracking-tight">
              Breathe with <span className="text-primary">Precision.</span>
            </h1>
            <p className="text-lg text-on-surface-variant mb-8 max-w-lg leading-relaxed">
              Leverage real-time atmospheric data and AI-powered analytics to safeguard your health and optimize your environment.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/register" className="bg-primary hover:opacity-90 text-white px-8 py-3.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-primary/20">
                Explore Real-time Map
              </Link>
              <a href="#features" className="bg-white border border-outline-variant hover:bg-surface-container-low text-on-surface px-8 py-3.5 rounded-xl font-semibold text-sm transition-all">
                View Features
              </a>
            </div>
            <div className="flex gap-8 mt-10">
              {[['500K+', 'Users protected'], ['200+', 'Cities monitored'], ['99.9%', 'Uptime'], ].map(([num, label]) => (
                <div key={label}>
                  <p className="text-2xl font-display font-bold text-primary">{num}</p>
                  <p className="text-xs text-on-surface-variant">{label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-outline-variant">
              <img
                alt="Environmental monitoring"
                className="w-full h-[500px] object-cover"
                src="https://images.unsplash.com/photo-1518384938856-ce44e7df1d66?w=800&q=80"
                onError={(e) => {
                  e.target.src = '';
                  e.target.parentElement.style.background = 'linear-gradient(135deg, #006c49 0%, #10b981 100%)';
                  e.target.parentElement.innerHTML = '<div style="height:500px;display:flex;align-items:center;justify-content:center"><span style="font-size:120px">🌿</span></div>';
                }}
              />
            </div>
            <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl border border-outline-variant p-4 shadow-lg">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs font-semibold text-on-surface">Live AQI: 42</span>
              </div>
              <p className="text-xs text-on-surface-variant mt-1">Good air quality</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-12">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold text-on-surface mb-4">Environmental Health Infrastructure</h2>
            <p className="text-lg text-on-surface-variant max-w-2xl mx-auto">
              Our multi-layered approach provides the most comprehensive air quality intelligence available today.
            </p>
          </div>
          <div className="grid md:grid-cols-12 gap-6">
            <div className="md:col-span-8 border border-outline-variant rounded-2xl p-8 hover:shadow-lg transition-shadow">
              <span className="material-symbols-outlined text-primary text-4xl mb-4">map</span>
              <h3 className="text-2xl font-display font-semibold text-on-surface mb-2">Hyper-local Mapping</h3>
              <p className="text-on-surface-variant mb-6">Visualize air quality with street-level resolution using our proprietary sensor fusion technology.</p>
              <div className="w-full h-48 bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl flex items-center justify-center border border-outline-variant">
                <span className="material-symbols-outlined text-primary/30 text-8xl">map</span>
              </div>
            </div>
            <div className="md:col-span-4 bg-primary text-white rounded-2xl p-8 flex flex-col justify-between">
              <div>
                <span className="material-symbols-outlined text-green-300 text-4xl mb-4">notifications_active</span>
                <h3 className="text-2xl font-display font-semibold mb-2">Health Triggers</h3>
                <p className="text-white/80 text-sm">Automated alerts synchronized with your personal health profile.</p>
              </div>
              <div className="mt-6 bg-white/10 border border-white/20 p-4 rounded-xl">
                <p className="text-xs font-bold text-green-300 mb-1">⚠ ALERT</p>
                <p className="text-sm">PM2.5 levels exceeding threshold in your zone.</p>
              </div>
            </div>
            <div className="md:col-span-4 border border-outline-variant rounded-2xl p-8 bg-surface-container-low hover:shadow-lg transition-shadow">
              <span className="material-symbols-outlined text-primary text-4xl mb-4">insights</span>
              <h3 className="text-2xl font-display font-semibold text-on-surface mb-2">Predictive Insights</h3>
              <p className="text-on-surface-variant text-sm mb-6">AI models that forecast pollution spikes up to 48 hours in advance.</p>
              <div className="flex items-end gap-2 h-20">
                {[30, 50, 70, 85, 100, 65, 40].map((h, i) => (
                  <div key={i} className="flex-1 bg-primary rounded-t-sm transition-all" style={{ height: `${h}%`, opacity: 0.3 + (i / 7) * 0.7 }}></div>
                ))}
              </div>
            </div>
            <div className="md:col-span-8 border border-outline-variant rounded-2xl p-8 flex flex-col md:flex-row gap-8 items-center hover:shadow-lg transition-shadow">
              <div className="flex-1">
                <span className="material-symbols-outlined text-primary text-4xl mb-4">psychology</span>
                <h3 className="text-2xl font-display font-semibold text-on-surface mb-2">AI Health Analysis</h3>
                <p className="text-on-surface-variant text-sm">Get personalized health recommendations powered by Groq's LLaMA model based on your health profile and current conditions.</p>
              </div>
              <div className="flex-1 w-full h-40 bg-surface-container-low rounded-xl flex items-center justify-center border border-dashed border-outline">
                <div className="flex gap-6">
                  <span className="material-symbols-outlined text-on-surface-variant/30 text-6xl">smart_toy</span>
                  <span className="material-symbols-outlined text-on-surface-variant/30 text-6xl">favorite</span>
                  <span className="material-symbols-outlined text-on-surface-variant/30 text-6xl">health_and_safety</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Science Section */}
      <section id="science" className="py-24 bg-surface-container-lowest">
        <div className="max-w-7xl mx-auto px-4 md:px-12 grid md:grid-cols-2 gap-16 items-center">
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl h-80 flex items-center justify-center border border-outline-variant">
            <span className="material-symbols-outlined text-primary/20 text-[160px]">science</span>
          </div>
          <div>
            <h2 className="font-display text-4xl font-bold text-on-surface mb-4">Science-First Methodology</h2>
            <p className="text-lg text-on-surface-variant mb-8">
              Our data isn't just gathered—it's validated. In partnership with leading environmental institutes, AirAware employs peer-reviewed algorithms.
            </p>
            <ul className="space-y-4">
              {[
                ['ISO-14001 Certified Standards', 'Adhering to the highest global environmental management protocols.'],
                ['Real-time Calibration', 'Sensors auto-calibrate every 60 seconds against reference stations.'],
                ['AI-Powered Analytics', 'Groq LLaMA models analyze your personal health data in real time.'],
              ].map(([title, desc]) => (
                <li key={title} className="flex items-start gap-4">
                  <div className="h-6 w-6 rounded-full bg-primary-container flex items-center justify-center mt-0.5 shrink-0">
                    <span className="material-symbols-outlined text-[14px] text-on-primary-container">check</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-on-surface">{title}</p>
                    <p className="text-sm text-on-surface-variant">{desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-inverse-surface text-inverse-on-surface rounded-3xl p-16 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary opacity-20 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="font-display text-4xl font-bold mb-4">Ready for a Healthier Atmosphere?</h2>
              <p className="text-lg text-white/70 mb-8">Join over 500,000 professionals and families who rely on AirAware.</p>
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <Link to="/register" className="bg-primary hover:opacity-90 text-white px-10 py-3.5 rounded-xl font-semibold text-sm transition-all">
                  Get Started Free
                </Link>
                <Link to="/login" className="border border-white/30 text-white hover:bg-white/10 px-10 py-3.5 rounded-xl font-semibold text-sm transition-all">
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-outline-variant py-8">
        <div className="max-w-7xl mx-auto px-4 md:px-12 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="font-display font-bold text-xl text-primary">AirAware</span>
          <p className="text-xs text-on-surface-variant">© 2024 AirAware Environmental Health. All rights reserved.</p>
          <div className="flex gap-6 text-xs text-on-surface-variant">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-primary transition-colors">API Documentation</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
