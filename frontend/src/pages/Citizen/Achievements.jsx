import React, { useState, useEffect } from "react";
import { Trophy, Award, Star, Target, Shield, Zap, Lock, Unlock, Loader2 } from "lucide-react";
import CivicLayout from "./CivicLayout";
import { useAuth } from "../../context/AuthContext";

const API = import.meta.env.VITE_AWS_API_GATEWAY_URL || "";

// Icon map for achievement keys from backend
const ICONS = {
  first_report: <Star size={24} />,
  active_citizen: <Shield size={24} />,
  community_hero: <Trophy size={24} />,
  guardian: <Shield size={24} />,
  legend: <Award size={24} />,
  quick_resolver: <Zap size={24} />,
  streak_master: <Zap size={24} />,
  verifier: <Target size={24} />,
};

const COLORS = {
  first_report:    { color: "text-yellow-500", bg: "bg-yellow-100 dark:bg-yellow-900/20" },
  active_citizen:  { color: "text-blue-500",   bg: "bg-blue-100 dark:bg-blue-900/20" },
  community_hero:  { color: "text-purple-500", bg: "bg-purple-100 dark:bg-purple-900/20" },
  guardian:        { color: "text-indigo-500", bg: "bg-indigo-100 dark:bg-indigo-900/20" },
  legend:          { color: "text-red-500",    bg: "bg-red-100 dark:bg-red-900/20" },
  quick_resolver:  { color: "text-orange-500", bg: "bg-orange-100 dark:bg-orange-900/20" },
  streak_master:   { color: "text-pink-500",   bg: "bg-pink-100 dark:bg-pink-900/20" },
  verifier:        { color: "text-green-500",  bg: "bg-green-100 dark:bg-green-900/20" },
};

const Achievements = () => {
  const { user } = useAuth();
  const userId = user?.sub || localStorage.getItem("uid") || "";

  const [points, setPoints] = useState(0);
  const [earned, setEarned] = useState([]);
  const [available, setAvailable] = useState([]);
  const [reportsCount, setReportsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }

    Promise.all([
      fetch(`${API}/api/user/${userId}/achievements`).then(r => r.json()),
      fetch(`${API}/api/user/${userId}/points`).then(r => r.json()),
    ])
      .then(([achData, pointsData]) => {
        setEarned(achData.earned || []);
        setAvailable(achData.available || []);
        setReportsCount(achData.reportsCount || 0);
        setPoints(pointsData.total || achData.totalPoints || 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId]);

  const allAchievements = [...earned, ...available];
  const nextAchievement = available[0];
  const progress = nextAchievement
    ? Math.min(100, ((nextAchievement.progress || 0) / nextAchievement.threshold) * 100)
    : 100;

  if (loading) {
    return (
      <CivicLayout>
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
      </CivicLayout>
    );
  }

  return (
    <CivicLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Your Achievements</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Track your impact and earn badges as you improve your city.
        </p>
      </div>

      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 to-violet-600 p-8 text-white shadow-xl mb-10">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="text-sm font-bold uppercase tracking-widest opacity-80 mb-1">Total Impact Score</div>
            <div className="text-5xl font-black">{points} <span className="text-2xl font-medium">pts</span></div>
            <div className="mt-2 text-indigo-100 font-medium flex items-center gap-2">
              {nextAchievement ? (
                <>
                  <Target size={18} />
                  <span>{nextAchievement.threshold - (nextAchievement.progress || 0)} more to unlock "{nextAchievement.name}"</span>
                </>
              ) : (
                <span>All achievements unlocked! 🎉</span>
              )}
            </div>
            <div className="mt-1 text-indigo-200 text-sm">{reportsCount} reports submitted</div>
          </div>

          <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/20">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full border-4 border-white/30 flex items-center justify-center text-xl font-bold">
                {Math.round(progress)}%
              </div>
              <div>
                <div className="text-sm opacity-80">Next Goal</div>
                <div className="font-bold text-lg">{nextAchievement?.name || "Master"}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-64 w-64 rounded-full bg-indigo-500/30 blur-3xl" />
      </div>

      {/* Achievements Grid */}
      {allAchievements.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 dark:bg-slate-800/50 rounded-3xl">
          <Trophy size={48} className="mx-auto mb-3 text-slate-300" />
          <p className="text-slate-500">Submit your first report to start earning achievements!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allAchievements.map(achievement => {
            const isUnlocked = achievement.earned;
            const style = COLORS[achievement.id] || { color: "text-blue-500", bg: "bg-blue-100" };
            const icon = ICONS[achievement.id] || <Trophy size={24} />;
            const progressPct = isUnlocked ? 100 : Math.min(100, ((achievement.progress || 0) / achievement.threshold) * 100);

            return (
              <div
                key={achievement.id}
                className={`relative overflow-hidden rounded-3xl p-6 border transition-all duration-300 ${
                  isUnlocked
                    ? "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-lg hover:-translate-y-1"
                    : "bg-slate-50 dark:bg-slate-800/50 border-transparent opacity-70 grayscale-[0.8]"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${style.bg} ${style.color}`}>
                    {icon}
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                    isUnlocked
                      ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400"
                      : "bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
                  }`}>
                    {isUnlocked ? <><Unlock size={12} /> Unlocked</> : <><Lock size={12} /> Locked</>}
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{achievement.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 min-h-[40px]">{achievement.description}</p>

                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${isUnlocked ? "bg-gradient-to-r from-green-400 to-emerald-500" : "bg-slate-300 dark:bg-slate-600"}`}
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <div className="mt-2 text-xs font-medium text-slate-400 flex justify-between">
                  <span>{achievement.progress || 0}</span>
                  <span>{achievement.threshold} reports</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </CivicLayout>
  );
};

export default Achievements;
