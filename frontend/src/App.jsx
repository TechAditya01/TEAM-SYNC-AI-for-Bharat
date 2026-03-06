import React from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
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

// Citizen Pages
import CitizenDashboard from './pages/Citizen/Dashboard';
import ReportIssue from './pages/Citizen/ReportIssue';
import CitizenLiveMap from './pages/Citizen/LiveMap';
import SOS from './pages/Citizen/SOS';
import MyReports from './pages/Citizen/MyReports';
import ReportDetail from './pages/Citizen/ReportDetail';
import CitizenProfile from './pages/Citizen/Profile';
import CitizenNotifications from './pages/Citizen/Notifications';
import Achievements from './pages/Citizen/Achievements';
import Leaderboard from './pages/Citizen/Leaderboard';
import DataUsage from './pages/Citizen/DataUsage';
import Preferences from './pages/Citizen/Preferences';
import PrivacySecurity from './pages/Citizen/PrivacySecurity';
import WhatsAppGuide from './pages/Citizen/WhatsAppGuide';

// Admin Pages
import AdminDashboard from './pages/Admin/Dashboard';
import AdminLiveMap from './pages/Admin/LiveMap';
import Incidents from './pages/Admin/Incidents';
import IncidentDetail from './pages/Admin/IncidentDetail';
import Tasks from './pages/Admin/Tasks';
import Broadcast from './pages/Admin/Broadcast';
import Analytics from './pages/Admin/Analytics';
import AdminNotifications from './pages/Admin/Notifications';
import OfficerProfile from './pages/Admin/OfficerProfile';
import AdminSettings from './pages/Admin/Settings';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  // Check role from user.role (fetched from DynamoDB)
  if (allowedRole && user.role !== allowedRole) return <Navigate to="/" replace />;
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
    <>
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
        <Route path="/map" element={<ProtectedRoute allowedRole="citizen"><CitizenLiveMap /></ProtectedRoute>} />
        <Route path="/sos" element={<ProtectedRoute allowedRole="citizen"><SOS /></ProtectedRoute>} />
        <Route path="/my-reports" element={<ProtectedRoute allowedRole="citizen"><MyReports /></ProtectedRoute>} />
        <Route path="/report/:id" element={<ProtectedRoute allowedRole="citizen"><ReportDetail /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute allowedRole="citizen"><CitizenProfile /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute allowedRole="citizen"><CitizenNotifications /></ProtectedRoute>} />
        <Route path="/achievements" element={<ProtectedRoute allowedRole="citizen"><Achievements /></ProtectedRoute>} />
        <Route path="/leaderboard" element={<ProtectedRoute allowedRole="citizen"><Leaderboard /></ProtectedRoute>} />
        <Route path="/data-usage" element={<ProtectedRoute allowedRole="citizen"><DataUsage /></ProtectedRoute>} />
        <Route path="/preferences" element={<ProtectedRoute allowedRole="citizen"><Preferences /></ProtectedRoute>} />
        <Route path="/privacy-security" element={<ProtectedRoute allowedRole="citizen"><PrivacySecurity /></ProtectedRoute>} />
        <Route path="/whatsapp-guide" element={<ProtectedRoute allowedRole="citizen"><WhatsAppGuide /></ProtectedRoute>} />

        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/dashboard" element={<ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/map" element={<ProtectedRoute allowedRole="admin"><AdminLiveMap /></ProtectedRoute>} />
        <Route path="/admin/incidents" element={<ProtectedRoute allowedRole="admin"><Incidents /></ProtectedRoute>} />
        <Route path="/admin/incidents/:id" element={<ProtectedRoute allowedRole="admin"><IncidentDetail /></ProtectedRoute>} />
        <Route path="/admin/tasks" element={<ProtectedRoute allowedRole="admin"><Tasks /></ProtectedRoute>} />
        <Route path="/admin/broadcast" element={<ProtectedRoute allowedRole="admin"><Broadcast /></ProtectedRoute>} />
        <Route path="/admin/analytics" element={<ProtectedRoute allowedRole="admin"><Analytics /></ProtectedRoute>} />
        <Route path="/admin/notifications" element={<ProtectedRoute allowedRole="admin"><AdminNotifications /></ProtectedRoute>} />
        <Route path="/admin/profile" element={<ProtectedRoute allowedRole="admin"><OfficerProfile /></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute allowedRole="admin"><AdminSettings /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default App;