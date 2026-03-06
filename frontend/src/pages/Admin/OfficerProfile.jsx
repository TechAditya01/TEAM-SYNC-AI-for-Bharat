import React, { useState, useEffect } from "react";
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
  Edit
} from "lucide-react";
import { getOfficerProfile, logout } from "../../services/backendService";
import { toast } from "react-hot-toast";

/* -------- MOCK OFFICER (replace with API) -------- */
const mockOfficer = {
  firstName: "Manish",
  lastName: "Kumar",
  role: "Admin Officer",
  department: "Sanitation",
  email: "manish@city.gov",
  phoneNumber: "+91 9876543210"
};

const OfficerProfile = () => {
  const [officer, setOfficer] = useState(null);
  const [loading, setLoading] = useState(true);

  /* -------- LOAD FROM API -------- */
  useEffect(() => {
    const fetchOfficer = async () => {
      try {
        setLoading(true);
        const data = await getOfficerProfile();

        if (data && !data.error) {
          // Map backend fields to the component UI structure
          setOfficer({
            firstName: data.firstName || data.name?.split(' ')[0] || "Admin",
            lastName: data.lastName || data.name?.split(' ').slice(1).join(' ') || "Officer",
            role: data.role || "Admin Officer",
            department: data.department || "Municipal",
            email: data.email || localStorage.getItem("email") || "admin@city.gov",
            phoneNumber: data.phoneNumber || data.phone || "Not provided",
            stats: data.stats || {
              resolved: 1284,
              responseTime: "12m 30s",
              rating: "4.9/5",
              hours: "142 hrs"
            }
          });
        } else {
          setOfficer(mockOfficer); // fallback
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
        setOfficer(mockOfficer); // fall back to mock data if not logged in or API fails
      } finally {
        setLoading(false);
      }
    };

    fetchOfficer();
  }, []);

  const handleLogout = () => {
    logout();
  };

  if (loading) return (
    <AdminLayout>
      <div className="flex items-center justify-center h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    </AdminLayout>
  );

  if (!officer) return null;

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto pb-20 space-y-8">
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 lg:p-12 border shadow-sm">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
            {/* Avatar */}
            <div className="w-32 h-32 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-[2.5rem] flex items-center justify-center text-5xl font-black text-white">
              {officer.firstName.charAt(0)}
            </div>

            {/* Name + Role */}
            <div className="flex-1 space-y-2">
              <div className="flex gap-3">
                <Badge text={officer.role} color="blue" />
                <Badge text="Active Duty" color="green" pulse />
              </div>

              <h1 className="text-4xl font-black uppercase">
                {officer.firstName} {officer.lastName}
              </h1>

              <p className="text-sm font-bold text-slate-400 uppercase flex items-center gap-2">
                <Shield size={14} />
                Department of {officer.department}
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 self-stretch md:self-auto justify-center">
              <button className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors">
                <Edit size={18} />
                Edit Profile
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold transition-colors"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </div>

            {/* Contact */}
            <div className="flex flex-col gap-3">
              <InfoBadge icon={<Mail size={16} />} label={officer.email} />
              <InfoBadge icon={<Phone size={16} />} label={officer.phoneNumber} />
              <InfoBadge icon={<MapPin size={16} />} label="Central HQ" />
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Stats */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border shadow-sm">
              <h3 className="text-lg font-black uppercase mb-6 flex gap-2">
                <Activity size={20} /> Performance
              </h3>

              <div className="space-y-4">
                <StatRow label="Incidents Resolved" value={officer.stats?.resolved || "1,284"} icon={<CheckCircle size={18} />} />
                <StatRow label="Response Time" value={officer.stats?.responseTime || "12m 30s"} icon={<Clock size={18} />} />
                <StatRow label="Citizen Rating" value={officer.stats?.rating || "4.9/5"} icon={<Award size={18} />} />
                <StatRow label="Time on Duty" value={officer.stats?.hours || "142 hrs"} icon={<Calendar size={18} />} />
              </div>
            </div>

            {/* Award */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 text-white">
              <Award size={40} className="mb-4 text-yellow-300" />
              <h3 className="text-xl font-black">Officer of the Month</h3>
              <p className="text-blue-100 text-sm">
                Exceptional service during sanitation drive.
              </p>
              <div className="text-xs font-black mt-4 bg-white/20 px-3 py-1 rounded">
                Nov 2025
              </div>
            </div>
          </div>

          {/* Activity Log */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border shadow-sm">
            <h3 className="text-lg font-black uppercase mb-8 flex gap-2">
              <Clock size={20} /> Service Log
            </h3>

            <div className="space-y-8 border-l-2 border-slate-200 pl-8">
              <LogItem
                title="Report Verified #10293"
                time="10:42 AM Today"
                desc="Verified pothole complaint"
                icon={<CheckCircle size={14} />}
                color="bg-green-500"
              />
              <LogItem
                title="Broadcast Sent"
                time="09:15 AM Today"
                desc="Rain alert issued"
                icon={<Activity size={14} />}
                color="bg-blue-500"
              />
              <LogItem
                title="Shift Started"
                time="09:00 AM"
                desc="Logged in from HQ"
                icon={<Shield size={14} />}
                color="bg-slate-500"
              />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

/* ---------- UI PARTS ---------- */

const Badge = ({ text, color, pulse }) => (
  <span
    className={`px-3 py-1 text-xs font-black uppercase rounded-lg ${color === "blue"
        ? "bg-blue-50 text-blue-600"
        : "bg-green-50 text-green-600"
      }`}
  >
    {pulse && <span className="w-2 h-2 bg-green-500 rounded-full mr-1 inline-block animate-pulse" />}
    {text}
  </span>
);

const InfoBadge = ({ icon, label }) => (
  <div className="flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-2xl border">
    <div className="text-slate-400">{icon}</div>
    <span className="text-xs font-bold">{label}</span>
  </div>
);

const StatRow = ({ label, value, icon }) => (
  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-white rounded-xl">{icon}</div>
      <span className="text-xs font-bold text-slate-500 uppercase">
        {label}
      </span>
    </div>
    <span className="font-black text-lg">{value}</span>
  </div>
);

const LogItem = ({ title, time, desc, icon, color }) => (
  <div className="relative">
    <div className={`absolute -left-12 top-0 w-8 h-8 rounded-full ${color} flex items-center justify-center text-white`}>
      {icon}
    </div>
    <h4 className="font-bold">{title}</h4>
    <span className="text-xs text-slate-400">{time}</span>
    <p className="text-sm text-slate-500">{desc}</p>
  </div>
);

export default OfficerProfile;