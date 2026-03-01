import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  List,
  Map,
  Settings,
  User,
  Bell,
  Shield,
  LogOut,
  BarChart2,
  Radio,
  CheckSquare
} from "lucide-react";

/* ---------- MOCK OFFICER ---------- */
const mockOfficer = {
  department: "Sanitation"
};

const AdminSidebar = ({ isOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [officer, setOfficer] = useState(null);

  useEffect(() => {
    // replace with GET /api/officer/me
    setTimeout(() => setOfficer(mockOfficer), 200);
  }, []);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    // replace with backend logout / token clear
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (!officer) return null;

  return (
    <aside
      className={`bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300 z-30 ${
        isOpen ? "w-64" : "w-20"
      }`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-slate-100 dark:border-slate-800/50">
        <Link
          to="/admin/dashboard"
          className="flex items-center gap-2 font-bold text-xl"
        >
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
            <Shield size={18} />
          </div>

          {isOpen && (
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                Admin Hub
              </h1>
              <p className="text-[10px] font-bold text-blue-500 uppercase">
                {officer.department}
              </p>
            </div>
          )}
        </Link>
      </div>

      {/* Menu */}
      <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-1 px-3">
        {isOpen && (
          <div className="text-[10px] font-bold text-slate-400 uppercase mb-2 mt-2 px-3">
            Main Panel
          </div>
        )}

        <SidebarItem icon={<LayoutDashboard size={20} />} label="Dashboard" to="/admin/dashboard" active={isActive("/admin/dashboard")} expanded={isOpen} />
        <SidebarItem icon={<List size={20} />} label="Dept. Incidents" to="/admin/incidents" active={isActive("/admin/incidents")} expanded={isOpen} />
        <SidebarItem icon={<Map size={20} />} label="Live Monitor" to="/admin/map" active={isActive("/admin/map")} expanded={isOpen} />
        <SidebarItem icon={<BarChart2 size={20} />} label="Analytics" to="/admin/analytics" active={isActive("/admin/analytics")} expanded={isOpen} />
        <SidebarItem icon={<Radio size={20} />} label="Broadcast" to="/admin/broadcast" active={isActive("/admin/broadcast")} expanded={isOpen} />
        <SidebarItem icon={<CheckSquare size={20} />} label="Task Board" to="/admin/tasks" active={isActive("/admin/tasks")} expanded={isOpen} />

        {isOpen && (
          <div className="text-[10px] font-bold text-slate-400 uppercase mb-2 mt-6 px-3">
            Management
          </div>
        )}

        <SidebarItem icon={<User size={20} />} label="Officer Profile" to="/admin/profile" active={isActive("/admin/profile")} expanded={isOpen} />
        <SidebarItem icon={<Bell size={20} />} label="Notifications" to="/admin/notifications" active={isActive("/admin/notifications")} expanded={isOpen} />
        <SidebarItem icon={<Settings size={20} />} label="Settings" to="/admin/settings" active={isActive("/admin/settings")} expanded={isOpen} />

        {/* Logout */}
        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800/50">
          <button onClick={handleLogout} className="w-full">
            <SidebarItem icon={<LogOut size={20} />} label="Logout" expanded={isOpen} danger />
          </button>
        </div>
      </div>
    </aside>
  );
};

const SidebarItem = ({ icon, label, to, active, expanded, danger = false }) => {
  const content = (
    <div
      className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group relative
        ${
          active
            ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold"
            : danger
            ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600"
            : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
        }
        ${!expanded && "justify-center"}
      `}
    >
      <div className="transition-transform duration-200 group-hover:scale-110">
        {icon}
      </div>

      {expanded && <span className="text-sm truncate">{label}</span>}

      {!expanded && (
        <div className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
          {label}
        </div>
      )}
    </div>
  );

  if (to) return <Link to={to}>{content}</Link>;
  return content;
};

export default AdminSidebar;