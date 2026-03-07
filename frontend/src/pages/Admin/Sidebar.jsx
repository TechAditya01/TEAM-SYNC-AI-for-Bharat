import React from "react";
import { Link, useLocation } from "react-router-dom";
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
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/logo.jpeg";

const AdminSidebar = ({ isOpen, officer }) => {
  const location = useLocation();
  const { logout } = useAuth();

  const department = officer?.department || 'Operations';
  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
  };

  if (!officer) return null;

  return (
    <>
      {/* Desktop Sidebar - Hidden on mobile */}
      <aside
        className={`hidden md:flex bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex-col transition-all duration-300 z-30 ${
          isOpen ? "w-64" : "w-20"
        }`}
      >
        {/* Logo Section */}
        <div className="h-16 flex items-center justify-center border-b border-slate-200 dark:border-slate-700">
          <Link
            to="/admin/dashboard"
            className="flex items-center gap-3 font-bold text-xl"
          >
            <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
              <img src={logo} alt="नगर Alert Hub" className="w-full h-full object-cover" />
            </div>

            {isOpen && (
              <div>
                <h1 className="text-base font-bold text-slate-900 dark:text-white">
                  नगर Alert Hub
                </h1>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Admin Console
                </p>
              </div>
            )}
          </Link>
        </div>

        {/* Menu */}
        <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-1 px-3">
          {isOpen && (
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 px-3">
              Main Panel
            </div>
          )}

          <SidebarItem 
            icon={<LayoutDashboard size={20} />} 
            label="Dashboard" 
            to="/admin/dashboard" 
            active={isActive("/admin/dashboard")} 
            expanded={isOpen} 
          />
          <SidebarItem 
            icon={<List size={20} />} 
            label="Dept. Incidents" 
            to="/admin/incidents" 
            active={isActive("/admin/incidents")} 
            expanded={isOpen} 
          />
          <SidebarItem 
            icon={<Map size={20} />} 
            label="Live Monitor" 
            to="/admin/map" 
            active={isActive("/admin/map")} 
            expanded={isOpen} 
          />
          <SidebarItem 
            icon={<BarChart2 size={20} />} 
            label="Analytics" 
            to="/admin/analytics" 
            active={isActive("/admin/analytics")} 
            expanded={isOpen} 
          />
          <SidebarItem 
            icon={<Radio size={20} />} 
            label="Broadcast" 
            to="/admin/broadcast" 
            active={isActive("/admin/broadcast")} 
            expanded={isOpen} 
          />
          <SidebarItem 
            icon={<CheckSquare size={20} />} 
            label="Task Board" 
            to="/admin/tasks" 
            active={isActive("/admin/tasks")} 
            expanded={isOpen} 
          />

          {isOpen && (
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 mt-6 px-3">
              Management
            </div>
          )}

          <SidebarItem 
            icon={<User size={20} />} 
            label="Officer Profile" 
            to="/admin/profile" 
            active={isActive("/admin/profile")} 
            expanded={isOpen} 
          />
          <SidebarItem 
            icon={<Bell size={20} />} 
            label="Notifications" 
            to="/admin/notifications" 
            active={isActive("/admin/notifications")} 
            expanded={isOpen} 
          />
          <SidebarItem 
            icon={<Settings size={20} />} 
            label="Settings" 
            to="/admin/settings" 
            active={isActive("/admin/settings")} 
            expanded={isOpen} 
          />

          {/* Logout */}
          <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-700">
            <button onClick={handleLogout} className="w-full">
              <SidebarItem 
                icon={<LogOut size={20} />} 
                label="Logout" 
                expanded={isOpen} 
                danger 
              />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile bottom padding */}
      <div className="md:hidden h-20" />
    </>
  );
};

const SidebarItem = ({ icon, label, to, active, expanded, danger = false, badge }) => {
  const content = (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg transition-colors relative group
        ${
          active
            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold"
            : danger
            ? "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
        }
        ${!expanded && "justify-center"}
      `}
    >
      <div className="shrink-0">
        {icon}
      </div>

      {expanded ? (
        <div className="flex items-center justify-between flex-1">
          <span className="text-sm truncate">{label}</span>
          {badge && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-600 dark:bg-blue-500 text-white">
              {badge}
            </span>
          )}
        </div>
      ) : (
        <div className="absolute left-full ml-2 px-3 py-2 bg-slate-900 dark:bg-slate-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-lg">
          {label}
          {badge && (
            <span className="ml-2 text-xs font-semibold px-1.5 py-0.5 rounded bg-blue-600 text-white">
              {badge}
            </span>
          )}
        </div>
      )}

      {active && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 dark:bg-blue-500 rounded-r"></div>
      )}
    </div>
  );

  if (to) return <Link to={to}>{content}</Link>;
  return content;
};

export default AdminSidebar;