import React, { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import {
    Bell,
    Check,
    Trash2,
    AlertTriangle,
    Info,
    CheckCircle,
    Clock
} from "lucide-react";

/* ---------------- MOCK DATA (replace with API) ---------------- */
const mockNotifications = [
    {
        id: "1",
        type: "alert",
        title: "New Garbage Report",
        message: "Garbage pile reported near Sector 4 market.",
        time: new Date().toLocaleString(),
        read: false,
        reportId: "123456"
    },
    {
        id: "2",
        type: "info",
        title: "Water Leak Report",
        message: "Water leakage detected on Main Road.",
        time: new Date().toLocaleString(),
        read: true,
        reportId: "654321"
    }
];

const AdminNotifications = () => {
    const [filter, setFilter] = useState("all");
    const [notifications, setNotifications] = useState([]);

    /* -------- LOAD FROM API -------- */
    useEffect(() => {
        // replace with GET /api/notifications
        setTimeout(() => {
            setNotifications(mockNotifications);
        }, 300);
    }, []);

    const filtered =
        filter === "all"
            ? notifications
            : notifications.filter(n => !n.read);

    const markAsRead = id => {
        setNotifications(prev =>
            prev.map(n => (n.id === id ? { ...n, read: true } : n))
        );
    };

    const markAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const deleteNotif = id => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const clearAll = () => setNotifications([]);

    return (
        <AdminLayout>
            <div className="max-w-4xl mx-auto pb-20 space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-black uppercase mb-2">
                            Command Feeds
                        </h1>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                            Real-time alerts & updates
                        </p>
                    </div>

                    <div className="flex bg-white dark:bg-slate-900 p-1 rounded-xl border">
                        <FilterBtn
                            label="All Feeds"
                            active={filter === "all"}
                            onClick={() => setFilter("all")}
                            count={notifications.length}
                        />
                        <FilterBtn
                            label="Unread"
                            active={filter === "unread"}
                            onClick={() => setFilter("unread")}
                            count={notifications.filter(n => !n.read).length}
                        />
                    </div>
                </div>

                {/* Panel */}
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border shadow-sm overflow-hidden min-h-[500px] flex flex-col">
                    <div className="p-6 border-b flex justify-between items-center">
                        <div className="text-xs font-black uppercase tracking-widest">
                            Showing {filtered.length} Notifications
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={markAllRead}
                                className="text-xs font-black text-blue-600 hover:underline"
                            >
                                Mark all read
                            </button>
                            <button
                                onClick={clearAll}
                                className="text-xs font-black text-red-600 hover:underline"
                            >
                                Clear History
                            </button>
                        </div>
                    </div>

                    <div className="divide-y">
                        {filtered.length > 0 ? (
                            filtered.map(notif => (
                                <div
                                    key={notif.id}
                                    className={`p-6 flex gap-4 group ${!notif.read ? "bg-blue-50/30" : ""
                                        }`}
                                >
                                    <IconBox type={notif.type} />

                                    <div className="flex-1">
                                        <div className="flex justify-between mb-1">
                                            <h4
                                                className={`font-bold ${!notif.read ? "text-black" : "text-slate-500"
                                                    }`}
                                            >
                                                {notif.title}
                                                {!notif.read && (
                                                    <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full inline-block" />
                                                )}
                                            </h4>

                                            <span className="text-xs text-slate-400 flex items-center gap-1">
                                                <Clock size={10} /> {notif.time}
                                            </span>
                                        </div>

                                        <p className="text-sm text-slate-500">
                                            {notif.message}
                                        </p>

                                        <div className="flex gap-4 mt-3 opacity-0 group-hover:opacity-100">
                                            {!notif.read && (
                                                <button
                                                    onClick={() => markAsRead(notif.id)}
                                                    className="text-xs font-bold text-blue-600"
                                                >
                                                    <Check size={12} /> Mark Read
                                                </button>
                                            )}
                                            <button
                                                onClick={() => deleteNotif(notif.id)}
                                                className="text-xs font-bold text-red-500"
                                            >
                                                <Trash2 size={12} /> Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <EmptyState />
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

/* ---------- COMPONENTS ---------- */

const IconBox = ({ type }) => {
    const styles = {
        alert: "bg-red-100 text-red-600",
        success: "bg-green-100 text-green-600",
        info: "bg-blue-100 text-blue-600"
    };

    return (
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${styles[type]}`}>
            {type === "alert" ? (
                <AlertTriangle size={20} />
            ) : type === "success" ? (
                <CheckCircle size={20} />
            ) : (
                <Info size={20} />
            )}
        </div>
    );
};

const FilterBtn = ({ label, active, onClick, count }) => (
    <button
        onClick={onClick}
        className={`px-6 py-2 rounded-lg text-xs font-black uppercase ${active ? "bg-slate-900 text-white" : "text-slate-500"
            }`}
    >
        {label} <span className="ml-1 opacity-60">({count})</span>
    </button>
);

const EmptyState = () => (
    <div className="flex flex-col items-center justify-center p-20 text-slate-300">
        <Bell size={48} className="mb-4 opacity-50" />
        <p className="font-bold text-sm uppercase tracking-widest">
            No notifications found
        </p>
    </div>
);

export default AdminNotifications;