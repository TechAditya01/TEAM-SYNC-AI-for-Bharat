import React, { useState, useEffect, useRef } from "react";
import AdminLayout from "./AdminLayout";
import {
  Settings as SettingsIcon,
  Bell,
  Shield,
  User,
  Globe,
  Moon,
  Sun,
  Laptop,
  Palette,
  Save,
  Loader2,
  CheckCircle,
  Lock,
  Mail,
  Phone,
  MapPin,
  Zap,
  Activity,
  RefreshCw,
  AlertCircle,
  Eye,
  EyeOff
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

const Settings = () => {
  const { user } = useAuth();
  const [officer, setOfficer] = useState(null);
  const [theme, setTheme] = useState("dark");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [activeTab, setActiveTab] = useState("notifications");
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const autoSaveTimer = useRef(null);

  const [notifSettings, setNotifSettings] = useState({
    aiAnomalies: true,
    directMessaging: true,
    smsAlerts: false,
    emailAlerts: true,
    pushNotifications: true
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: 30,
    loginAlerts: true
  });

  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    department: '',
    designation: ''
  });

  /* ---------- LOAD OFFICER FROM API ---------- */
  useEffect(() => {
    if (!user) return;

    const fetchOfficerProfile = async () => {
      try {
        const API_BASE = import.meta.env.VITE_AWS_API_GATEWAY_URL || '';
        const res = await fetch(`${API_BASE}/api/officer/me`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: Failed to fetch officer profile`);
        }

        const data = await res.json();
        const officerData = {
          firstName: data.firstName || data.name?.split(' ')[0] || 'Admin',
          lastName: data.lastName || data.name?.split(' ').slice(1).join(' ') || '',
          department: data.department || 'Operations',
          id: data.officerId || data.id || `R-${Date.now()}`,
          email: data.email || '',
          phoneNumber: data.phoneNumber || '',
          designation: data.designation || data.role || 'ADMIN'
        };
        
        setOfficer(officerData);
        setProfileData(officerData);
        
        // Load saved settings if available
        if (data.preferences) {
          setNotifSettings({
            aiAnomalies: data.preferences.aiAnomalies ?? true,
            directMessaging: data.preferences.directMessaging ?? true,
            smsAlerts: data.preferences.smsAlerts ?? false,
            emailAlerts: data.preferences.emailAlerts ?? true,
            pushNotifications: data.preferences.pushNotifications ?? true
          });
          setSecuritySettings({
            twoFactorAuth: data.preferences.twoFactorAuth ?? false,
            sessionTimeout: data.preferences.sessionTimeout ?? 30,
            loginAlerts: data.preferences.loginAlerts ?? true
          });
          setTheme(data.preferences.theme || 'dark');
          setLastSaved(data.preferences.lastSaved || null);
        }
      } catch (err) {
        console.error('Failed to load officer:', err);
        toast.error(`Failed to load profile: ${err.message}`);
        setIsDemoMode(true);
      } finally {
        setFetching(false);
      }
    };

    fetchOfficerProfile();
  }, [user]);

  // Track changes (but don't mark as changed on initial load)
  useEffect(() => {
    // Only set hasChanges after initial load
    if (!fetching && officer) {
      setHasChanges(true);
    }
  }, [notifSettings, securitySettings, theme, profileData]);

  const handleSave = async () => {
    if (isDemoMode) {
      toast.error('Cannot save in demo mode - API unavailable');
      return;
    }

    setLoading(true);

    try {
      const API_BASE = import.meta.env.VITE_AWS_API_GATEWAY_URL || '';
      
      const payload = {
        preferences: {
          ...notifSettings,
          ...securitySettings,
          theme: theme,
          lastSaved: Date.now()
        },
        profile: profileData,
        updatedAt: Date.now()
      };

      const res = await fetch(`${API_BASE}/api/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: Failed to save settings`);
      }

      const result = await res.json();
      setLastSaved(Date.now());
      setHasChanges(false);
      toast.success("Settings saved successfully!");
    } catch (err) {
      console.error('Failed to save settings:', err);
      toast.error(`Failed to save settings: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <AdminLayout>
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 size={48} className="animate-spin text-blue-600" />
        <p className="text-sm font-bold text-slate-600">
          Loading Settings...
        </p>
      </div>
    </AdminLayout>
  );

  if (!officer) return (
    <AdminLayout>
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <AlertCircle size={48} className="text-red-600" />
        <p className="text-lg font-bold text-slate-800">
          Failed to Load Settings
        </p>
        <p className="text-sm text-slate-600">
          Unable to connect to the API. Please check your connection and try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2"
        >
          <RefreshCw size={18} />
          Retry
        </button>
      </div>
    </AdminLayout>
  );

  const tabs = [
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
    { id: 'security', label: 'Security', icon: <Shield size={18} /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette size={18} /> },
    { id: 'profile', label: 'Profile', icon: <User size={18} /> }
  ];

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6 p-6">
        
        {/* Demo Mode Warning Banner */}
        {isDemoMode && (
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-4 text-white shadow-lg">
            <div className="flex items-center gap-3">
              <AlertCircle size={24} />
              <div className="flex-1">
                <p className="font-bold">API Connection Failed</p>
                <p className="text-sm text-white/90">Unable to load data from server. Please check your API configuration and connection.</p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl font-bold transition-all flex items-center gap-2"
              >
                <RefreshCw size={16} />
                Retry
              </button>
            </div>
          </div>
        )}
        
        {/* Header with Live Status */}
        <div className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"></div>
          </div>

          <div className="relative z-10 flex items-center justify-between flex-wrap gap-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-3xl font-black shadow-xl">
                {officer.firstName.charAt(0)}
              </div>
              
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold">Settings & Preferences</h1>
                  {isDemoMode ? (
                    <div className="flex items-center gap-2 bg-orange-500/20 backdrop-blur-sm px-3 py-1 rounded-lg text-xs border border-orange-400/30">
                      <AlertCircle size={12} />
                      <span>Demo Mode</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-lg text-xs">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span>Live</span>
                    </div>
                  )}
                </div>
                <p className="text-white/70 text-sm">
                  {officer.firstName} {officer.lastName} • {officer.department}
                </p>
              </div>
            </div>

            {/* Last Saved Indicator */}
            {lastSaved && (
              <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/20">
                <div className="flex items-center gap-2 text-xs text-white/70">
                  <CheckCircle size={14} className="text-green-400" />
                  <span>Last saved: {new Date(lastSaved).toLocaleTimeString()}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-4 gap-6">
          
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1 space-y-3">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-bold text-sm transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 border border-green-200 mt-6">
              <div className="flex items-center gap-2 mb-3">
                <Activity size={18} className="text-green-600" />
                <span className="text-xs font-bold text-green-700 uppercase">System Status</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">Sync Status</span>
                  <span className="font-bold text-green-600">Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Last Backup</span>
                  <span className="font-bold text-slate-700">2 hrs ago</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-slate-200">
                  <h2 className="font-bold text-xl flex items-center gap-3 text-slate-800">
                    <Bell size={24} className="text-blue-600" />
                    Notification Preferences
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">Manage how you receive alerts and updates</p>
                </div>

                <div className="p-8 space-y-6">
                  <SettingToggle
                    label="AI Intelligence Alerts"
                    desc="Receive real-time AI anomaly detection notifications"
                    icon={<Zap size={20} className="text-yellow-500" />}
                    active={notifSettings.aiAnomalies}
                    onToggle={() =>
                      setNotifSettings({
                        ...notifSettings,
                        aiAnomalies: !notifSettings.aiAnomalies
                      })
                    }
                  />

                  <SettingToggle
                    label="Direct Messaging"
                    desc="Allow citizens to tag you in incident reports"
                    icon={<Mail size={20} className="text-blue-500" />}
                    active={notifSettings.directMessaging}
                    onToggle={() =>
                      setNotifSettings({
                        ...notifSettings,
                        directMessaging: !notifSettings.directMessaging
                      })
                    }
                  />

                  <SettingToggle
                    label="SMS Alerts"
                    desc="Receive critical incident summaries via SMS"
                    icon={<Phone size={20} className="text-green-500" />}
                    active={notifSettings.smsAlerts}
                    onToggle={() =>
                      setNotifSettings({
                        ...notifSettings,
                        smsAlerts: !notifSettings.smsAlerts
                      })
                    }
                  />

                  <SettingToggle
                    label="Email Notifications"
                    desc="Get daily digest and important updates via email"
                    icon={<Mail size={20} className="text-purple-500" />}
                    active={notifSettings.emailAlerts}
                    onToggle={() =>
                      setNotifSettings({
                        ...notifSettings,
                        emailAlerts: !notifSettings.emailAlerts
                      })
                    }
                  />

                  <SettingToggle
                    label="Push Notifications"
                    desc="Browser push notifications for urgent alerts"
                    icon={<Bell size={20} className="text-red-500" />}
                    active={notifSettings.pushNotifications}
                    onToggle={() =>
                      setNotifSettings({
                        ...notifSettings,
                        pushNotifications: !notifSettings.pushNotifications
                      })
                    }
                  />
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
                <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 border-b border-slate-200">
                  <h2 className="font-bold text-xl flex items-center gap-3 text-slate-800">
                    <Shield size={24} className="text-red-600" />
                    Security Settings
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">Protect your account and data</p>
                </div>

                <div className="p-8 space-y-6">
                  <SettingToggle
                    label="Two-Factor Authentication"
                    desc="Add an extra layer of security to your account"
                    icon={<Lock size={20} className="text-red-500" />}
                    active={securitySettings.twoFactorAuth}
                    onToggle={() =>
                      setSecuritySettings({
                        ...securitySettings,
                        twoFactorAuth: !securitySettings.twoFactorAuth
                      })
                    }
                  />

                  <SettingToggle
                    label="Login Alerts"
                    desc="Get notified when someone logs into your account"
                    icon={<AlertCircle size={20} className="text-orange-500" />}
                    active={securitySettings.loginAlerts}
                    onToggle={() =>
                      setSecuritySettings({
                        ...securitySettings,
                        loginAlerts: !securitySettings.loginAlerts
                      })
                    }
                  />

                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                    <div className="flex items-start gap-4">
                      <div className="bg-blue-100 p-3 rounded-xl">
                        <Clock size={20} className="text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-sm mb-1">Session Timeout</h4>
                        <p className="text-xs text-slate-500 mb-4">Auto-logout after inactivity</p>
                        <select
                          value={securitySettings.sessionTimeout}
                          onChange={(e) => setSecuritySettings({
                            ...securitySettings,
                            sessionTimeout: parseInt(e.target.value)
                          })}
                          className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
                        >
                          <option value={15}>15 minutes</option>
                          <option value={30}>30 minutes</option>
                          <option value={60}>1 hour</option>
                          <option value={120}>2 hours</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 border-b border-slate-200">
                  <h2 className="font-bold text-xl flex items-center gap-3 text-slate-800">
                    <Palette size={24} className="text-purple-600" />
                    Appearance
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">Customize your interface theme</p>
                </div>

                <div className="p-8">
                  <div className="grid grid-cols-3 gap-4">
                    <ThemeCard 
                      icon={<Sun size={24} />} 
                      label="Light" 
                      desc="Bright and clean"
                      active={theme === "light"} 
                      onClick={() => setTheme("light")} 
                    />
                    <ThemeCard 
                      icon={<Moon size={24} />} 
                      label="Dark" 
                      desc="Easy on eyes"
                      active={theme === "dark"} 
                      onClick={() => setTheme("dark")} 
                    />
                    <ThemeCard 
                      icon={<Laptop size={24} />} 
                      label="System" 
                      desc="Auto-adjust"
                      active={theme === "system"} 
                      onClick={() => setTheme("system")} 
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 border-b border-slate-200">
                  <h2 className="font-bold text-xl flex items-center gap-3 text-slate-800">
                    <User size={24} className="text-green-600" />
                    Profile Information
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">Update your personal details</p>
                </div>

                <div className="p-8 space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase mb-2 block">First Name</label>
                      <input
                        type="text"
                        value={profileData.firstName}
                        onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase mb-2 block">Last Name</label>
                      <input
                        type="text"
                        value={profileData.lastName}
                        onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase mb-2 block">Email</label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase mb-2 block">Phone Number</label>
                    <input
                      type="tel"
                      value={profileData.phoneNumber}
                      onChange={(e) => setProfileData({...profileData, phoneNumber: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase mb-2 block">Department</label>
                      <input
                        type="text"
                        value={profileData.department}
                        onChange={(e) => setProfileData({...profileData, department: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase mb-2 block">Designation</label>
                      <input
                        type="text"
                        value={profileData.designation}
                        onChange={(e) => setProfileData({...profileData, designation: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Save Bar */}
            {hasChanges && (
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 shadow-2xl flex items-center justify-between">
                <div className="flex items-center gap-3 text-white">
                  <AlertCircle size={24} />
                  <div>
                    <p className="font-bold">Unsaved Changes</p>
                    <p className="text-xs text-blue-100">You have unsaved changes. Don't forget to save!</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl font-bold transition-all"
                  >
                    Discard
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-8 py-3 bg-white text-blue-600 rounded-xl font-bold flex items-center gap-2 hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <><Loader2 size={18} className="animate-spin" /> Saving...</>
                    ) : (
                      <><Save size={18} /> Save Changes</>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

/* ---------- UI COMPONENTS ---------- */

const SettingToggle = ({ label, desc, icon, active, onToggle }) => (
  <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border-2 border-slate-200 hover:border-slate-300 transition-all">
    <div className="flex items-start gap-4 flex-1">
      <div className="bg-white p-3 rounded-xl shadow-sm">
        {icon}
      </div>
      <div className="flex-1">
        <h4 className="font-bold text-sm text-slate-800 mb-1">{label}</h4>
        <p className="text-xs text-slate-500">{desc}</p>
      </div>
    </div>

    <button
      onClick={onToggle}
      className={`relative w-16 h-8 rounded-full p-1 transition-all shadow-inner ${
        active ? "bg-gradient-to-r from-blue-600 to-indigo-600" : "bg-slate-300"
      }`}
    >
      <div
        className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
          active ? "translate-x-8" : "translate-x-0"
        }`}
      />
    </button>
  </div>
);

const ThemeCard = ({ icon, label, desc, active, onClick }) => (
  <div
    onClick={onClick}
    className={`relative p-6 rounded-2xl border-2 cursor-pointer text-center transition-all group hover:scale-105 ${
      active
        ? "border-blue-600 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg"
        : "border-slate-200 bg-white hover:border-slate-300"
    }`}
  >
    {active && (
      <div className="absolute top-3 right-3">
        <CheckCircle size={20} className="text-blue-600" />
      </div>
    )}
    <div className={`inline-flex p-4 rounded-2xl mb-3 transition-all ${
      active 
        ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg" 
        : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
    }`}>
      {icon}
    </div>
    <div className={`text-sm font-bold mb-1 ${active ? 'text-blue-700' : 'text-slate-700'}`}>
      {label}
    </div>
    <div className="text-xs text-slate-500">{desc}</div>
  </div>
);

export default Settings;