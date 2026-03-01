import React, { useEffect, useState } from "react";
import { Menu, X, Bell, Search } from "lucide-react";
import { Link } from "react-router-dom";

/* ---------- MOCK OFFICER ---------- */
const mockOfficer = {
  firstName: "Manish",
  lastName: "Kumar",
  department: "Sanitation",
  role: "ADMIN"
};

const AdminTopbar = ({ toggleSidebar, isSidebarOpen }) => {
  const [officer, setOfficer] = useState(null);

  useEffect(() => {
    // replace with GET /api/officer/me
    setTimeout(() => setOfficer(mockOfficer), 200);
  }, []);

  if (!officer) return null;

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-8">
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 lg:hidden"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-full">
          <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
          <span className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-widest">
            {officer.department}
          </span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3 lg:gap-6">
        {/* Search */}
        <div className="relative hidden sm:block">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Search incidents..."
            className="bg-slate-100 dark:bg-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 w-64 outline-none"
          />
        </div>

        {/* Notifications */}
        <Link
          to="/admin/notifications"
          className="relative p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
        >
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
        </Link>

        {/* User */}
        <div className="flex items-center gap-4 pl-4 border-l border-slate-200 dark:border-slate-800">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
              Operational Lead
            </p>
            <p className="text-xs font-black text-slate-900 dark:text-white uppercase">
              {officer.firstName} {officer.lastName}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
              {officer.role}
            </div>

            <div className="w-11 h-11 rounded-[0.9rem] bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-lg font-black shadow-xl">
              {officer.firstName.charAt(0)}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminTopbar;