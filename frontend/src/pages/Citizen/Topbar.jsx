import { Link } from 'react-router-dom';
import { Menu, Bell, Sun, Moon, User, X, LayoutDashboard, Map, FileText, BarChart2, AlertTriangle, Camera, MessageCircle, Award, LogOut } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';

import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import logo from '../../assets/logo.jpeg';

const API = import.meta.env.VITE_AWS_API_GATEWAY_URL || '';

const formatTime = (ts) => {
    if (!ts) return '';
    const diff = Date.now() - ts;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
};

const Topbar = ({ isSidebarOpen, toggleSidebar }) => {
    const { user } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const userId = user?.sub || localStorage.getItem('uid') || '';

    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Fetch real notifications from API
    useEffect(() => {
        if (!userId) return;
        fetch(`${API}/api/user/${userId}/notifications?limit=10`)
            .then(r => r.json())
            .then(data => {
                const list = (data.notifications || []).map(n => ({
                    id: n.notificationId,
                    title: n.title,
                    message: n.message,
                    time: formatTime(n.createdAt),
                    read: n.read,
                }));
                setNotifications(list);
            })
            .catch(() => {}); // silent fail — topbar is non-critical
    }, [userId]);

    // Mark single notification read via API when clicked
    const handleNotifClick = async (id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        try {
            await fetch(`${API}/api/notifications/${id}/read`, { method: 'POST' });
        } catch { }
    };

    const userName = user?.name || user?.['custom:firstName'] || user?.email?.split('@')[0] || 'Guest';
    const unreadCount = notifications.filter(n => !n.read).length;

    const menuItems = [
        { icon: <LayoutDashboard size={20} />, label: 'Overview', to: '/dashboard' },
        { icon: <Map size={20} />, label: 'Live Map', to: '/map' },
        { icon: <Camera size={20} />, label: 'New Report', to: '/report' },
        { icon: <FileText size={20} />, label: 'My Reports', to: '/my-reports' },
        { icon: <BarChart2 size={20} />, label: 'Leaderboard', to: '/leaderboard' },
        { icon: <Award size={20} />, label: 'Achievements', to: '/achievements' },
        { icon: <User size={20} />, label: 'Profile', to: '/profile' },
        { icon: <Bell size={20} />, label: 'Notifications', to: '/notifications' },
        { icon: <MessageCircle size={20} />, label: 'WhatsApp Guide', to: '/whatsapp-guide' },
        { icon: <AlertTriangle size={20} />, label: 'Emergency SOS', to: '/sos' },
        { icon: <LogOut size={20} />, label: 'Logout', to: '/login', danger: true },
    ];

    return (
        <>
            <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 md:px-6 flex items-center justify-between z-20 sticky top-0">

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
                        className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300 transition-colors"
                    >
                        <Menu size={20} />
                    </button>
                    <Link to="/dashboard" className="md:hidden flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0">
                            <img src={logo} alt="नगर Alert Hub" className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <div className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                                नगर Alert Hub
                            </div>
                            <div className="text-xs text-slate-600 dark:text-slate-400">
                                Citizen
                            </div>
                        </div>
                    </Link>
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

                            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border-b flex items-center justify-between">
                                <h3 className="font-bold text-sm flex items-center gap-2">
                                    <Bell size={16} />
                                    Notifications
                                </h3>
                                {unreadCount > 0 && (
                                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                                        {unreadCount} new
                                    </span>
                                )}
                            </div>

                            <div className="max-h-96 overflow-y-auto">
                                {notifications.length > 0 ? (
                                    notifications.map((notif) => (
                                        <div
                                            key={notif.id}
                                            onClick={() => handleNotifClick(notif.id)}
                                            className={`px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 border-b last:border-0 cursor-pointer transition ${
                                                !notif.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <p className={`text-sm font-semibold ${!notif.read ? 'text-slate-900' : 'text-slate-600'}`}>
                                                    {notif.title}
                                                </p>
                                                {!notif.read && (
                                                    <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-500 mt-0.5">{notif.message}</p>
                                            <p className="text-xs text-slate-400 mt-1">{notif.time}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="px-4 py-8 text-center text-slate-500 text-sm">
                                        No notifications yet
                                    </div>
                                )}
                            </div>

                            <Link
                                to="/notifications"
                                className="block px-4 py-3 text-center text-sm font-semibold text-blue-600 hover:bg-slate-50 border-t"
                            >
                                View All Notifications
                            </Link>
                        </div>
                    )}
                </div>

                <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden md:block"></div>

                {/* Profile */}
                <Link
                    to="/profile"
                    className="flex items-center gap-3 pl-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg px-2 py-1"
                >
                    <div className="text-right hidden md:block">
                        <div className="text-sm font-bold">
                            {userName}
                        </div>
                        <div className="text-xs text-slate-500">
                            {user?.role || 'Citizen'}
                        </div>
                    </div>

                    <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center overflow-hidden">
                        {user?.profilePic ? (
                            <img src={user.profilePic} className="w-full h-full object-cover" />
                        ) : (
                            <User size={18} />
                        )}
                    </div>
                </Link>

            </div>
        </header>

        {/* Mobile Drawer Menu */}
        {mobileDrawerOpen && (
            <>
                {/* Backdrop */}
                <div
                    className="md:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setMobileDrawerOpen(false)}
                />

                {/* Drawer */}
                <div className="md:hidden fixed left-0 right-0 top-16 bottom-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 z-50 overflow-y-auto">
                    <div className="p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Menu</h2>
                            <button
                                onClick={() => setMobileDrawerOpen(false)}
                                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-1">
                            {menuItems.map((item) => (
                                <Link
                                    key={item.to}
                                    to={item.to}
                                    onClick={() => setMobileDrawerOpen(false)}
                                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                                        item.danger
                                            ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                                    }`}
                                >
                                    <div className="shrink-0">
                                        {item.icon}
                                    </div>
                                    <span className="text-sm font-medium">{item.label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </>
        )}
        </>
    );
};

export default Topbar;