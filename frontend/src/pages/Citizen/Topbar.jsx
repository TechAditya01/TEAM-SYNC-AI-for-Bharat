import { Link } from 'react-router-dom';
import { Menu, Search, Bell, Sun, Moon, User } from 'lucide-react';
import React, { useState } from 'react';

import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const Topbar = ({ isSidebarOpen, toggleSidebar }) => {
    const { currentUser } = useAuth();
    const { theme, toggleTheme } = useTheme();

    const [showNotifications, setShowNotifications] = useState(false);

    // Local / API notifications (replace later with backend)
    const [notifications] = useState([
        { id: 1, title: 'Issue Resolved', message: 'Your reported pothole has been fixed', time: '2m ago', read: false },
        { id: 2, title: 'New Update', message: 'City council meeting scheduled', time: '1h ago', read: true },
        { id: 3, title: 'Action Required', message: 'Please verify your recent complaint', time: '3h ago', read: false },
    ]);

    const userName = currentUser
        ? (currentUser.firstName
            ? `${currentUser.firstName} ${currentUser.lastName || ''}`
            : (currentUser.displayName || "User"))
        : "Guest";

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 md:px-6 flex items-center justify-between z-20 sticky top-0">

            <div className="flex items-center gap-4">
                <button
                    onClick={toggleSidebar}
                    className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300 transition-colors"
                >
                    <Menu size={20} />
                </button>

                {/* Search */}
                <div className="hidden md:flex items-center gap-3 bg-slate-100 dark:bg-slate-700 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 focus-within:border-blue-500 w-64 lg:w-96">
                    <Search size={18} className="text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search city, area, or issue..."
                        className="bg-transparent outline-none text-sm w-full"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3">

                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                >
                    {theme === 'dark'
                        ? <Sun size={20} />
                        : <Moon size={20} />
                    }
                </button>

                {/* Mobile Search */}
                <button className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                    <Search size={20} />
                </button>

                {/* Notifications */}
                <div
                    className="relative"
                    onMouseEnter={() => setShowNotifications(true)}
                    onMouseLeave={() => setShowNotifications(false)}
                >
                    <Link
                        to="/notifications"
                        className="relative p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg block"
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full"></span>
                        )}
                    </Link>

                    {showNotifications && (
                        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50">

                            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border-b">
                                <h3 className="font-bold text-sm flex items-center gap-2">
                                    <Bell size={16} />
                                    Notifications
                                </h3>
                            </div>

                            <div className="max-h-96 overflow-y-auto">
                                {notifications.length > 0 ? (
                                    notifications.map((notif) => (
                                        <div
                                            key={notif.id}
                                            className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 border-b last:border-0"
                                        >
                                            <p className="text-sm font-semibold">{notif.title}</p>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                {notif.message}
                                            </p>
                                            <p className="text-xs text-slate-400 mt-1">
                                                {notif.time}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="px-4 py-8 text-center text-slate-500">
                                        No new notifications
                                    </div>
                                )}
                            </div>

                            {notifications.length > 0 && (
                                <Link
                                    to="/notifications"
                                    className="block px-4 py-3 text-center text-sm font-semibold text-blue-600 hover:bg-slate-50 border-t"
                                >
                                    View All Notifications
                                </Link>
                            )}
                        </div>
                    )}
                </div>

                <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden md:block"></div>

                {/* Profile */}
                <Link
                    to="/civic/profile"
                    className="flex items-center gap-3 pl-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg px-2 py-1"
                >
                    <div className="text-right hidden md:block">
                        <div className="text-sm font-bold">
                            {userName}
                        </div>
                        <div className="text-xs text-slate-500">
                            {currentUser?.role || 'Citizen'}
                        </div>
                    </div>

                    <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center overflow-hidden">
                        {currentUser?.profilePic ? (
                            <img src={currentUser.profilePic} className="w-full h-full object-cover" />
                        ) : (
                            <User size={18} />
                        )}
                    </div>
                </Link>

            </div>
        </header>
    );
};

export default Topbar;