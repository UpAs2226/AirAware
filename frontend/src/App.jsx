import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import MapPage from './pages/MapPage';
import HealthPage from './pages/HealthPage';
import AlertsPage from './pages/AlertsPage';
import ProfilePage from './pages/ProfilePage';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-on-surface-variant text-sm">Loading...</p>
      </div>
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route
        path="/dashboard"
        element={<PrivateRoute><Layout><DashboardPage /></Layout></PrivateRoute>}
      />
      <Route
        path="/map"
        element={<PrivateRoute><Layout><MapPage /></Layout></PrivateRoute>}
      />
      <Route
        path="/health"
        element={<PrivateRoute><Layout><HealthPage /></Layout></PrivateRoute>}
      />
      <Route
        path="/alerts"
        element={<PrivateRoute><Layout><AlertsPage /></Layout></PrivateRoute>}
      />
      <Route
        path="/profile"
        element={<PrivateRoute><Layout><ProfilePage /></Layout></PrivateRoute>}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
