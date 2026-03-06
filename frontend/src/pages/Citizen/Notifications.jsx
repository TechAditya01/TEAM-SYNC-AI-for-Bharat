import React, { useState, useEffect } from "react";
import {
  Bell,
  CheckCircle,
  AlertOctagon,
  Info,
  Trash2,
  Clock,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CivicLayout from "./CivicLayout";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";

const API = import.meta.env.VITE_AWS_API_GATEWAY_URL || "";

const Notifications = () => {
  const { user } = useAuth();
  const userId = user?.sub || localStorage.getItem("uid") || "";

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  /* -------- FETCH FROM API -------- */
  useEffect(() => {
    if (!userId) { setLoading(false); return; }

    fetch(`${API}/api/user/${userId}/notifications`)
      .then(r => r.json())
      .then(data => {
        const list = (data.notifications || []).map(n => ({
          id: n.notificationId,
          type: n.type === "report_update" ? "success"
            : n.type === "broadcast" || n.type === "sos" ? "alert"
            : "info",
          title: n.title,
          message: n.message,
          read: n.read,
          timestamp: n.createdAt,
          time: formatTime(n.createdAt),
        }));
        list.sort((a, b) => b.timestamp - a.timestamp);
        setNotifications(list);
      })
      .catch(() => toast.error("Failed to load notifications"))
      .finally(() => setLoading(false));
  }, [userId]);

  const formatTime = (ts) => {
    if (!ts) return "";
    const diff = Date.now() - ts;
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  const handleDismiss = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markRead = async (id) => {
    try {
      await fetch(`${API}/api/notifications/${id}/read`, { method: "POST" });
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    } catch { /* silent */ }
  };

  const markAllRead = async () => {
    if (!userId) return;
    try {
      await fetch(`${API}/api/user/${userId}/notifications/read-all`, { method: "POST" });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success("All marked as read");
    } catch {
      toast.error("Failed to mark all read");
    }
  };

  return (
    <CivicLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center relative">
              <Bell size={20} />
              {notifications.some(n => !n.read) && (
                <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </div>
            Notifications
            {notifications.some(n => !n.read) && (
              <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-600 text-xs font-bold rounded-full">
                {notifications.filter(n => !n.read).length} new
              </span>
            )}
          </h1>

          {notifications.some(n => !n.read) && (
            <button
              onClick={markAllRead}
              className="text-sm font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg"
            >
              Mark all read
            </button>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-blue-600" size={36} />
          </div>
        )}

        {/* List */}
        {!loading && (
          <div className="space-y-3">
            <AnimatePresence>
              {notifications.length > 0 ? (
                notifications.map(notif => (
                  <motion.div
                    key={notif.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={() => !notif.read && markRead(notif.id)}
                    className={`group relative p-6 rounded-2xl border flex gap-6 cursor-pointer transition ${
                      notif.read ? "bg-white" : "bg-blue-50 border-blue-200"
                    }`}
                  >
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                      notif.type === "success" ? "bg-green-50 text-green-600"
                        : notif.type === "alert" ? "bg-red-50 text-red-600"
                        : "bg-blue-50 text-blue-600"
                    }`}>
                      {notif.type === "success" ? <CheckCircle size={24} />
                        : notif.type === "alert" ? <AlertOctagon size={24} />
                        : <Info size={24} />}
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between mb-1">
                        <h3 className={`font-bold ${notif.read ? "text-slate-600" : "text-slate-900"}`}>
                          {notif.title}
                        </h3>
                        <div className="flex items-center gap-1 text-xs text-slate-400 shrink-0 ml-2">
                          <Clock size={12} />
                          {notif.time}
                        </div>
                      </div>
                      <p className="text-sm text-slate-500">{notif.message}</p>
                    </div>

                    {!notif.read && (
                      <div className="w-2.5 h-2.5 bg-blue-500 rounded-full mt-2 shrink-0" />
                    )}

                    {/* Dismiss */}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDismiss(notif.id); }}
                      className="opacity-0 group-hover:opacity-100 absolute right-4 bottom-4 p-2 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 size={18} className="text-red-400" />
                    </button>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-20 border-dashed border rounded-3xl">
                  <Bell size={48} className="mx-auto mb-4 text-slate-300" />
                  <p className="font-bold text-slate-400">You're all caught up!</p>
                  <p className="text-sm text-slate-400 mt-1">No notifications yet</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </CivicLayout>
  );
};

export default Notifications;
