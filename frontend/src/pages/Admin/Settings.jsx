import React, { useState, useEffect } from "react";
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
  Save
} from "lucide-react";
import { toast } from "react-hot-toast";

/* ---------- MOCK OFFICER ---------- */
const mockOfficer = {
  firstName: "Manish",
  lastName: "Kumar",
  department: "Sanitation",
  id: "R-0923-7782"
};

const Settings = () => {
  const [officer, setOfficer] = useState(null);
  const [theme, setTheme] = useState("dark");
  const [loading, setLoading] = useState(false);

  const [notifSettings, setNotifSettings] = useState({
    aiAnomalies: true,
    directMessaging: true,
    smsAlerts: false
  });

  /* ---------- LOAD OFFICER ---------- */
  useEffect(() => {
    // replace with GET /api/officer/me
    setTimeout(() => setOfficer(mockOfficer), 300);
  }, []);

  const handleSave = () => {
    setLoading(true);

    // replace with PUT /api/settings
    setTimeout(() => {
      setLoading(false);
      toast.success("System Configuration Saved");
    }, 800);
  };

  if (!officer) return null;

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-10 pb-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center gap-8 bg-white dark:bg-slate-900 p-10 rounded-[3rem] border shadow-sm">
          <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-4xl font-black">
            {officer.firstName.charAt(0)}
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase rounded mb-3 inline-block">
              Direct Command • {officer.department}
            </div>

            <h1 className="text-4xl font-black uppercase">
              {officer.firstName} {officer.lastName}
            </h1>

            <p className="text-sm font-bold text-slate-500 uppercase">
              Authorized Official ID: {officer.id}
            </p>
          </div>

          <button className="px-6 py-4 bg-slate-900 text-white rounded-3xl text-[10px] font-black uppercase flex items-center gap-2">
            <User size={16} /> Edit Profile
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            <SettingsNav icon={<SettingsIcon size={18} />} label="Operational Matrix" active />
            <SettingsNav icon={<Bell size={18} />} label="Communications" />
            <SettingsNav icon={<Shield size={18} />} label="Security Protocol" />
            <SettingsNav icon={<Globe size={18} />} label="Network & Sync" />
          </div>

          {/* Panels */}
          <div className="lg:col-span-8 space-y-8">
            {/* Notifications */}
            <Panel title="Notification Logic" icon={<Bell className="text-blue-600" />}>
              <SettingToggle
                label="AI Intelligence Alerts"
                desc="Receive AI anomaly notifications"
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
                desc="Citizens can tag you in reports"
                active={notifSettings.directMessaging}
                onToggle={() =>
                  setNotifSettings({
                    ...notifSettings,
                    directMessaging: !notifSettings.directMessaging
                  })
                }
              />

              <SettingToggle
                label="Operational SMS"
                desc="Critical summaries via SMS"
                active={notifSettings.smsAlerts}
                onToggle={() =>
                  setNotifSettings({
                    ...notifSettings,
                    smsAlerts: !notifSettings.smsAlerts
                  })
                }
              />
            </Panel>

            {/* Theme */}
            <Panel title="Visual Terminal" icon={<Palette className="text-indigo-600" />}>
              <div className="grid grid-cols-3 gap-4">
                <ThemeCard icon={<Sun size={20} />} label="Light" active={theme === "light"} onClick={() => setTheme("light")} />
                <ThemeCard icon={<Moon size={20} />} label="Dark" active={theme === "dark"} onClick={() => setTheme("dark")} />
                <ThemeCard icon={<Laptop size={20} />} label="System" active={theme === "system"} onClick={() => setTheme("system")} />
              </div>
            </Panel>

            {/* Save */}
            <div className="flex justify-end gap-4">
              <button className="px-8 py-4 text-slate-500 font-black text-[10px] uppercase">
                Discard
              </button>

              <button
                onClick={handleSave}
                disabled={loading}
                className="px-10 py-5 bg-blue-600 text-white rounded-[2rem] text-[10px] font-black uppercase shadow-xl flex items-center gap-3"
              >
                {loading ? "Saving..." : <><Save size={18} /> Save Settings</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

/* ---------- UI ---------- */

const Panel = ({ title, icon, children }) => (
  <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border shadow-sm">
    <h3 className="text-lg font-black uppercase mb-8 flex items-center gap-3">
      {icon} {title}
    </h3>
    <div className="space-y-6">{children}</div>
  </div>
);

const SettingsNav = ({ icon, label, active }) => (
  <div
    className={`flex items-center gap-4 px-6 py-5 rounded-[1.5rem] ${
      active
        ? "bg-slate-900 text-white"
        : "text-slate-500 hover:bg-slate-100"
    }`}
  >
    {icon}
    <span className="text-[11px] font-black uppercase">{label}</span>
  </div>
);

const SettingToggle = ({ label, desc, active, onToggle }) => (
  <div className="flex items-center justify-between">
    <div>
      <h4 className="font-bold text-sm">{label}</h4>
      <p className="text-xs text-slate-400">{desc}</p>
    </div>

    <button
      onClick={onToggle}
      className={`w-14 h-8 rounded-full p-1 ${
        active ? "bg-blue-600" : "bg-slate-300"
      }`}
    >
      <div
        className={`w-6 h-6 bg-white rounded-full transition ${
          active ? "translate-x-6" : ""
        }`}
      />
    </button>
  </div>
);

const ThemeCard = ({ icon, label, active, onClick }) => (
  <div
    onClick={onClick}
    className={`p-6 rounded-[2rem] border-2 cursor-pointer text-center ${
      active
        ? "border-blue-600 text-blue-600 bg-blue-50"
        : "text-slate-400"
    }`}
  >
    <div className={`p-3 rounded-2xl ${active ? "bg-blue-600 text-white" : "bg-white"}`}>
      {icon}
    </div>
    <span className="text-[10px] font-black uppercase">{label}</span>
  </div>
);

export default Settings;