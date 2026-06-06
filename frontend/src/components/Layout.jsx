import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { path: '/map', label: 'Pollution Map', icon: 'map' },
  { path: '/health', label: 'Health Analysis', icon: 'favorite' },
  { path: '/alerts', label: 'Alerts', icon: 'notifications' },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navbar */}
      <header className="bg-white/90 backdrop-blur-md border-b border-outline-variant sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-12 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 rounded-lg hover:bg-surface-container-low"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <span className="material-symbols-outlined text-on-surface-variant">menu</span>
            </button>
            <Link to="/dashboard" className="font-display font-bold text-2xl text-primary">
              AirAware
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-medium transition-colors flex items-center gap-1.5 pb-0.5 ${
                  location.pathname === item.path
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link to="/alerts" className="p-2 rounded-full hover:bg-surface-container-low transition-colors">
              <span className="material-symbols-outlined text-on-surface-variant text-[22px]">notifications</span>
            </Link>
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="h-9 w-9 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-sm hover:opacity-90 transition-all"
              >
                {initials}
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-11 w-48 bg-white border border-outline-variant rounded-xl shadow-lg py-1 z-50">
                  <div className="px-4 py-2 border-b border-outline-variant">
                    <p className="text-sm font-semibold text-on-surface truncate">{user?.name}</p>
                    <p className="text-xs text-on-surface-variant truncate">{user?.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-on-surface hover:bg-surface-container-low"
                  >
                    <span className="material-symbols-outlined text-[18px]">person</span> Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-tertiary hover:bg-surface-container-low"
                  >
                    <span className="material-symbols-outlined text-[18px]">logout</span> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-outline-variant bg-white">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-6 py-3 text-sm ${
                  location.pathname === item.path
                    ? 'text-primary bg-surface-container-low font-semibold'
                    : 'text-on-surface-variant'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-white border-t border-outline-variant py-6">
        <div className="max-w-7xl mx-auto px-4 md:px-12 flex flex-col md:flex-row justify-between items-center gap-3">
          <span className="font-display font-bold text-xl text-primary">AirAware</span>
          <p className="text-xs text-on-surface-variant">© 2024 AirAware Environmental Health. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
