import React, { useState, useEffect, useRef } from "react";
import AdminLayout from "./AdminLayout";
import {
  Mail,
  Phone,
  MapPin,
  Award,
  Clock,
  CheckCircle,
  Shield,
  Calendar,
  Activity,
  User,
  LogOut,
  Edit,
  TrendingUp,
  Target,
  Zap,
  BarChart3,
  RefreshCw,
  Loader2,
  Star,
  Trophy,
  AlertCircle
} from "lucide-react";
import { getOfficerProfile, logout } from "../../services/backendService";
import { toast } from "react-hot-toast";

const OfficerProfile = () => {
  const [officer, setOfficer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const refreshInterval = useRef(null);

  /* -------- LOAD FROM API -------- */
  const fetchOfficer = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);

      const data = await getOfficerProfile();

      if (!data || data.error) {
        throw new Error(data?.error || 'Invalid data received from API');
      }

      setOfficer({
        firstName: data.firstName || data.name?.split(' ')[0] || "Admin",
        lastName: data.lastName || data.name?.split(' ').slice(1).join(' ') || "Officer",
        role: data.role || "Admin Officer",
        department: data.department || "Municipal",
        email: data.email || localStorage.getItem("email") || "admin@city.gov",
        phoneNumber: data.phoneNumber || data.phone || "Not provided",
        joinDate: data.joinDate || Date.now() - 365 * 24 * 60 * 60 * 1000,
        stats: data.stats || {
          resolved: 0,
          responseTime: "N/A",
          rating: 0,
          hours: 0,
          activeIncidents: 0,
          completionRate: 0
        },
        recentActivity: data.recentActivity || []
      });
      setLastUpdate(new Date());
      setIsDemoMode(false);
    } catch (err) {
      console.error("Failed to load profile:", err);
      
      // Only show error toast on first load, not on silent refreshes
      if (!silent) {
        toast.error(`Failed to load profile: ${err.message}`);
      }
      
      // Set demo mode flag
      setIsDemoMode(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOfficer();

    // Real-time refresh every 30 seconds (disabled in demo mode)
    if (autoRefresh && !isDemoMode) {
      refreshInterval.current = setInterval(() => {
        fetchOfficer(true);
      }, 30000);
    }

    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
    };
  }, [autoRefresh, isDemoMode]);

  const handleLogout = () => {
    logout();
  };

  if (loading) return (
    <AdminLayout>
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 size={48} className="animate-spin text-blue-600" />
        <p className="text-sm font-bold text-slate-600">Loading Profile...</p>
      </div>
    </AdminLayout>
  );

  if (!officer) return (
    <AdminLayout>
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <AlertCircle size={48} className="text-red-600" />
        <p className="text-lg font-bold text-slate-800">
          Failed to Load Profile
        </p>
        <p className="text-sm text-slate-600">
          Unable to connect to the API. Please check your connection and try again.
        </p>
        <button
          onClick={() => fetchOfficer()}
          className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2"
        >
          <RefreshCw size={18} />
          Retry
        </button>
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto pb-20 space-y-6 p-6">
        
        {/* Demo Mode Warning Banner */}
        {isDemoMode && (
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-4 text-white shadow-lg">
            <div className="flex items-center gap-3">
              <AlertCircle size={24} />
              <div className="flex-1">
                <p className="font-bold">API Connection Failed</p>
                <p className="text-sm text-white/90">Unable to load profile data from server. Please check your API configuration and connection.</p>
              </div>
              <button
                onClick={() => fetchOfficer()}
                disabled={refreshing}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl font-bold transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                Retry
              </button>
            </div>
          </div>
        )}
        
        {/* Header Card */}
        <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                {isDemoMode && (
                  <div className="flex items-center gap-2 bg-orange-500/20 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs border border-orange-400/30">
                    <AlertCircle size={12} />
                    <span>Demo Mode</span>
                  </div>
                )}
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Active Duty</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs">
                  <Clock size={12} />
                  <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
                </div>
              </div>

              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition-all text-sm"
              >
                <RefreshCw size={16} className={autoRefresh ? 'animate-spin' : ''} />
                Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-start">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center text-5xl font-black border-4 border-white/20 shadow-2xl">
                  {officer.firstName.charAt(0)}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-green-500 p-2 rounded-xl shadow-lg">
                  <Shield size={20} className="text-white" />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-2">
                  {officer.firstName} {officer.lastName}
                </h1>
                <p className="text-white/80 text-lg mb-4 flex items-center gap-2">
                  <Award size={20} />
                  {officer.role} • Department of {officer.department}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <InfoCard icon={<Mail size={16} />} label={officer.email} />
                  <InfoCard icon={<Phone size={16} />} label={officer.phoneNumber} />
                  <InfoCard icon={<MapPin size={16} />} label="Central HQ" />
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3">
                <button className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl font-bold hover:shadow-lg transition-all">
                  <Edit size={18} />
                  Edit Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-all"
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<CheckCircle size={24} className="text-green-600" />}
            label="Resolved"
            value={officer.stats.resolved.toLocaleString()}
            trend="+12%"
            color="green"
          />
          <StatCard
            icon={<Clock size={24} className="text-blue-600" />}
            label="Avg Response"
            value={officer.stats.responseTime}
            trend="-8%"
            color="blue"
          />
          <StatCard
            icon={<Star size={24} className="text-yellow-600" />}
            label="Rating"
            value={`${officer.stats.rating}/5`}
            trend="+0.2"
            color="yellow"
          />
          <StatCard
            icon={<Activity size={24} className="text-purple-600" />}
            label="Active Now"
            value={officer.stats.activeIncidents}
            trend="Live"
            color="purple"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Left Column - Performance */}
          <div className="space-y-6">
            {/* Performance Card */}
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-slate-200">
                <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                  <BarChart3 size={20} className="text-blue-600" />
                  Performance Metrics
                </h3>
              </div>

              <div className="p-6 space-y-4">
                <MetricRow 
                  label="Completion Rate" 
                  value={`${officer.stats.completionRate}%`}
                  progress={officer.stats.completionRate}
                  color="blue"
                />
                <MetricRow 
                  label="Time on Duty" 
                  value={`${officer.stats.hours} hrs`}
                  progress={75}
                  color="green"
                />
                <MetricRow 
                  label="Citizen Satisfaction" 
                  value={`${officer.stats.rating * 20}%`}
                  progress={officer.stats.rating * 20}
                  color="yellow"
                />
              </div>
            </div>

            {/* Achievement Card */}
            <div className="bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-3xl p-8 text-white shadow-2xl">
              <Trophy size={48} className="mb-4 text-yellow-200" />
              <h3 className="text-2xl font-bold mb-2">Officer of the Month</h3>
              <p className="text-white/90 text-sm mb-4">
                Exceptional service during sanitation drive and emergency response.
              </p>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl w-fit">
                <Calendar size={16} />
                <span className="text-sm font-bold">November 2025</span>
              </div>
            </div>
          </div>

          {/* Right Column - Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                    <Activity size={20} className="text-purple-600" />
                    Recent Activity
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">Real-time service log</p>
                </div>
                <button
                  onClick={() => fetchOfficer(true)}
                  disabled={refreshing}
                  className="flex items-center gap-2 bg-purple-100 hover:bg-purple-200 text-purple-700 px-4 py-2 rounded-xl transition-all text-sm font-medium"
                >
                  <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                  Refresh
                </button>
              </div>

              <div className="p-8">
                <div className="space-y-6 border-l-2 border-slate-200 pl-8">
                  {officer.recentActivity && officer.recentActivity.length > 0 ? (
                    officer.recentActivity.map((activity, idx) => (
                      <ActivityItem
                        key={activity.id || idx}
                        title={activity.title}
                        time={new Date(activity.time).toLocaleString()}
                        type={activity.type}
                      />
                    ))
                  ) : (
                    <>
                      <ActivityItem
                        title="Report Verified #10293"
                        time="10:42 AM Today"
                        type="verified"
                      />
                      <ActivityItem
                        title="Broadcast Sent - Rain Alert"
                        time="09:15 AM Today"
                        type="broadcast"
                      />
                      <ActivityItem
                        title="Shift Started"
                        time="09:00 AM Today"
                        type="login"
                      />
                      <ActivityItem
                        title="Incident Resolved #10287"
                        time="Yesterday 5:30 PM"
                        type="resolved"
                      />
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

/* ---------- UI COMPONENTS ---------- */

const InfoCard = ({ icon, label }) => (
  <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-3 rounded-xl border border-white/20">
    <div className="text-white/80">{icon}</div>
    <span className="text-sm font-medium">{label}</span>
  </div>
);

const StatCard = ({ icon, label, value, trend, color }) => {
  const colorClasses = {
    green: 'from-green-50 to-emerald-50 border-green-200',
    blue: 'from-blue-50 to-cyan-50 border-blue-200',
    yellow: 'from-yellow-50 to-orange-50 border-yellow-200',
    purple: 'from-purple-50 to-pink-50 border-purple-200'
  };

  const trendColor = trend.startsWith('+') || trend === 'Live' ? 'text-green-600' : 'text-blue-600';

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-2xl p-6 border-2 shadow-lg`}>
      <div className="flex items-center justify-between mb-4">
        <div className="bg-white p-3 rounded-xl shadow-sm">
          {icon}
        </div>
        <span className={`text-xs font-bold ${trendColor} flex items-center gap-1`}>
          {trend !== 'Live' && <TrendingUp size={12} />}
          {trend}
        </span>
      </div>
      <div className="text-3xl font-bold text-slate-800 mb-1">{value}</div>
      <div className="text-xs text-slate-600 font-medium uppercase">{label}</div>
    </div>
  );
};

const MetricRow = ({ label, value, progress, color }) => {
  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    yellow: 'bg-yellow-500'
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-bold text-slate-700">{label}</span>
        <span className="text-sm font-bold text-slate-900">{value}</span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
        <div 
          className={`h-full ${colorClasses[color]} rounded-full transition-all duration-500`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

const ActivityItem = ({ title, time, type }) => {
  const typeConfig = {
    verified: { color: 'bg-green-500', icon: <CheckCircle size={14} /> },
    broadcast: { color: 'bg-blue-500', icon: <Zap size={14} /> },
    login: { color: 'bg-slate-500', icon: <Shield size={14} /> },
    resolved: { color: 'bg-purple-500', icon: <Target size={14} /> }
  };

  const config = typeConfig[type] || typeConfig.verified;

  return (
    <div className="relative">
      <div className={`absolute -left-12 top-0 w-8 h-8 rounded-full ${config.color} flex items-center justify-center text-white shadow-lg`}>
        {config.icon}
      </div>
      <h4 className="font-bold text-slate-800">{title}</h4>
      <span className="text-xs text-slate-500 flex items-center gap-1 mt-1">
        <Clock size={12} />
        {time}
      </span>
    </div>
  );
};

export default OfficerProfile;
