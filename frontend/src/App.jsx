import React from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import {
  HomePage,
  HowItWorksPage,
  MunicipalitiesPage,
  PrivacyPolicyPage,
  SuccessStoriesPage,
  TermsOfServicePage,
} from './pages';
import Login from './AuthPages/Login';
import Register from './AuthPages/Register';
import ForgotPassword from './AuthPages/ForgotPassword';
import OTPVerify from './AuthPages/OTPVerify';
import { useAuth } from './context/AuthContext';

import AdminDashboard from './pages/Admin/Dashboard';
import CitizenDashboard from './pages/Citizen/Dashboard';
import ReportIssue from './pages/Citizen/ReportIssue';
import LiveMap from './pages/Citizen/LiveMap';
import SOS from './pages/Citizen/SOS';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRole && user["custom:role"] !== allowedRole) return <Navigate to="/" replace />;
  return children;
};

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  React.useEffect(() => {
    if (hash) {
      const elementId = hash.replace('#', '');
      const scrollToHashElement = () => {
        const targetElement = document.getElementById(elementId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      };
      requestAnimationFrame(scrollToHashElement);
      return;
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname, hash]);

  return null;
};

const App = () => {
  React.useEffect(() => {
    const dark =
      localStorage.theme === 'dark' ||
      (!('theme' in localStorage) &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);

    document.documentElement.classList.toggle('dark', dark);
    if (!('theme' in localStorage)) {
      localStorage.theme = dark ? 'dark' : 'light';
    }
  }, []);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/municipalities" element={<MunicipalitiesPage />} />
        <Route path="/success-stories" element={<SuccessStoriesPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/terms-of-service" element={<TermsOfServicePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<OTPVerify />} />

        {/* Citizen Routes */}
        <Route path="/dashboard" element={<ProtectedRoute allowedRole="citizen"><CitizenDashboard /></ProtectedRoute>} />
        <Route path="/report" element={<ProtectedRoute allowedRole="citizen"><ReportIssue /></ProtectedRoute>} />
        <Route path="/map" element={<ProtectedRoute allowedRole="citizen"><LiveMap /></ProtectedRoute>} />
        <Route path="/sos" element={<ProtectedRoute allowedRole="citizen"><SOS /></ProtectedRoute>} />

        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;