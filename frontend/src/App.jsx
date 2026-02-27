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
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminIncidents from './pages/admin/Incidents';
import AdminLiveMap from './pages/admin/LiveMap';
import AdminAnalytics from './pages/admin/Analytics';
import AdminBroadcast from './pages/admin/Broadcast';
import AdminTasks from './pages/admin/Tasks';
import OfficerProfile from './pages/admin/OfficerProfile';
import AdminNotifications from './pages/admin/Notifications';
import AdminSettings from './pages/admin/Settings';
import AdminIncidentDetail from './pages/admin/IncidentDetail';
import Dashboard from './pages/civic/Dashboard';
import LiveMap from './pages/civic/LiveMap';
import ReportIssue from './pages/civic/ReportIssue';
import ReportDetail from './pages/civic/ReportDetail';
import MyReports from './pages/civic/MyReports';
import Leaderboard from './pages/civic/Leaderboard';
import Achievements from './pages/civic/Achievements';
import Profile from './pages/civic/Profile';
import Notifications from './pages/civic/Notifications';
import WhatsAppGuide from './pages/civic/WhatsAppGuide';
import SOS from './pages/civic/SOS';
import Preferences from './pages/civic/Preferences';
import PrivacySecurity from './pages/civic/PrivacySecurity';
import DataUsage from './pages/civic/DataUsage';

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

const RoleProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to={role === 'admin' ? '/admin/dashboard' : '/civic/dashboard'} replace />;
  }

  return children;
};

const AdminDashboardPage = () => (
  <AdminDashboard />
);

const CivicSectionPage = ({ title, description }) => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 max-w-xl w-full">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">{description}</p>
    </div>
  </div>
);

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
        <Route
          path="/civic/dashboard"
          element={
            <RoleProtectedRoute requiredRole="citizen">
              <Dashboard />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <RoleProtectedRoute requiredRole="admin">
              <AdminDashboardPage />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/civic/map"
          element={
            <RoleProtectedRoute requiredRole="citizen">
              <LiveMap />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/civic/report"
          element={
            <RoleProtectedRoute requiredRole="citizen">
              <ReportIssue />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/civic/report/:id"
          element={
            <RoleProtectedRoute requiredRole="citizen">
              <ReportDetail />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/civic/my-reports"
          element={
            <RoleProtectedRoute requiredRole="citizen">
              <MyReports />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/leaderboard"
          element={
            <RoleProtectedRoute requiredRole="citizen">
              <Leaderboard />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/civic/leaderboard"
          element={
            <RoleProtectedRoute requiredRole="citizen">
              <Leaderboard />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/civic/achievements"
          element={
            <RoleProtectedRoute requiredRole="citizen">
              <Achievements />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/civic/profile"
          element={
            <RoleProtectedRoute requiredRole="citizen">
              <Profile />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <RoleProtectedRoute requiredRole="citizen">
              <Notifications />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/civic/notifications"
          element={
            <RoleProtectedRoute requiredRole="citizen">
              <Notifications />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/civic/guide"
          element={
            <RoleProtectedRoute requiredRole="citizen">
              <WhatsAppGuide />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/sos"
          element={
            <RoleProtectedRoute requiredRole="citizen">
              <SOS />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/civic/sos"
          element={
            <RoleProtectedRoute requiredRole="citizen">
              <SOS />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/civic/preferences"
          element={
            <RoleProtectedRoute requiredRole="citizen">
              <Preferences />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/civic/privacy"
          element={
            <RoleProtectedRoute requiredRole="citizen">
              <PrivacySecurity />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/civic/data-usage"
          element={
            <RoleProtectedRoute requiredRole="citizen">
              <DataUsage />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/admin/incidents"
          element={
            <RoleProtectedRoute requiredRole="admin">
              <AdminIncidents />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin/incident/:id"
          element={
            <RoleProtectedRoute requiredRole="admin">
              <AdminIncidentDetail />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin/incidents/:id"
          element={
            <RoleProtectedRoute requiredRole="admin">
              <AdminIncidentDetail />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin/map"
          element={
            <RoleProtectedRoute requiredRole="admin">
              <AdminLiveMap />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <RoleProtectedRoute requiredRole="admin">
              <AdminAnalytics />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin/broadcast"
          element={
            <RoleProtectedRoute requiredRole="admin">
              <AdminBroadcast />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin/tasks"
          element={
            <RoleProtectedRoute requiredRole="admin">
              <AdminTasks />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin/profile"
          element={
            <RoleProtectedRoute requiredRole="admin">
              <OfficerProfile />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin/notifications"
          element={
            <RoleProtectedRoute requiredRole="admin">
              <AdminNotifications />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <RoleProtectedRoute requiredRole="admin">
              <AdminSettings />
            </RoleProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;