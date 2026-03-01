import React, { useState, useEffect } from "react";
import {
  Bell,
  CheckCircle,
  AlertOctagon,
  Info,
  Trash2,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CivicLayout from "./CivicLayout";

/* -------- MOCK NOTIFICATIONS -------- */
const mockNotifications = [
  {
    id: "1",
    type: "info",
    title: "Report Submitted",
    message: "Your pothole report has been received.",
    time: "Today",
    timestamp: Date.now() - 500000,
    read: true,
  },
  {
    id: "2",
    type: "success",
    title: "Report Resolved",
    message: "Your garbage report has been resolved.",
    time: "Today",
    timestamp: Date.now() - 300000,
    read: false,
  },
  {
    id: "3",
    type: "alert",
    title: "📢 Official Alert: Water Dept",
    message: "Water supply disruption in your area.",
    time: "Yesterday",
    timestamp: Date.now() - 800000,
    read: false,
  },
];

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);

  /* -------- LOAD (NO FIREBASE) -------- */
  useEffect(() => {
    // simulate API
    const sorted = [...mockNotifications].sort(
      (a, b) => b.timestamp - a.timestamp
    );
    setNotifications(sorted);
  }, []);

  const handleDismiss = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <CivicLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center relative">
              <Bell size={20} />
              {notifications.some((n) => !n.read) && (
                <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></div>
              )}
            </div>
            Notifications
          </h1>

          <button
            onClick={markAllRead}
            className="text-sm font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg"
          >
            Mark all read
          </button>
        </div>

        {/* List */}
        <div className="space-y-3">
          <AnimatePresence>
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <motion.div
                  key={notif.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`group relative p-6 rounded-2xl border flex gap-6 ${
                    notif.read ? "bg-white" : "bg-blue-50 border-blue-200"
                  }`}
                >
                  {/* Icon */}
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      notif.type === "success"
                        ? "bg-green-50 text-green-600"
                        : notif.type === "alert"
                        ? "bg-red-50 text-red-600"
                        : "bg-blue-50 text-blue-600"
                    }`}
                  >
                    {notif.type === "success" ? (
                      <CheckCircle size={24} />
                    ) : notif.type === "alert" ? (
                      <AlertOctagon size={24} />
                    ) : (
                      <Info size={24} />
                    )}
                  </div>

                  {/* Text */}
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <h3
                        className={`font-bold ${
                          notif.read ? "text-slate-600" : "text-slate-900"
                        }`}
                      >
                        {notif.title}
                      </h3>

                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock size={12} />
                        {notif.time}
                      </div>
                    </div>

                    <p className="text-sm text-slate-500">
                      {notif.message}
                    </p>
                  </div>

                  {!notif.read && (
                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-full mt-2"></div>
                  )}

                  {/* Dismiss */}
                  <button
                    onClick={() => handleDismiss(notif.id)}
                    className="opacity-0 group-hover:opacity-100 absolute right-4 bottom-4 p-2 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={18} />
                  </button>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-20 border-dashed border rounded-3xl">
                <Bell size={48} className="mx-auto mb-4 text-slate-300" />
                <p className="font-bold text-slate-400">
                  You're all caught up!
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </CivicLayout>
  );
};

export default Notifications;