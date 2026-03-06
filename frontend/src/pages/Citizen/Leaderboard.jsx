import React, { useState, useEffect } from "react";
import { Trophy, Shield, TrendingUp, Users, Crown, Loader2 } from "lucide-react";
import CivicLayout from "./CivicLayout";
import { useAuth } from "../../context/AuthContext";

const API = import.meta.env.VITE_AWS_API_GATEWAY_URL || "";

const Leaderboard = () => {
  const { user } = useAuth();
  const myUserId = user?.sub || localStorage.getItem("uid") || "";

  const [filter, setFilter] = useState("All Time");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myEntry, setMyEntry] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(`${API}/api/leaderboard`)
      .then(r => r.json())
      .then(data => {
        const list = data.leaderboard || [];
        setUsers(list);
        const me = list.find(u => u.userId === myUserId);
        if (me) setMyEntry(me);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [myUserId]);

  const top3 = users.slice(0, 3);
  const rest = users.slice(3);

  return (
    <CivicLayout>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
            <div className="p-3 bg-blue-600 rounded-lg">
              <Trophy size={28} className="text-white" />
            </div>
            Leaderboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-base ml-16">
            Top civic contributors making real impact
          </p>
        </div>

        <div className="bg-slate-100 dark:bg-slate-700 p-1.5 rounded-lg flex items-center">
          {["Weekly", "Monthly", "All Time"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold ${
                filter === f ? "bg-blue-600 text-white" : "text-slate-600 dark:text-slate-400"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top 3 Podium */}
          <div className="bg-white dark:bg-slate-800 rounded-lg p-8 border flex flex-col justify-end items-center h-[500px] relative">
            <div className="absolute top-8 text-center">
              <div className="flex items-center justify-center gap-2 text-blue-600 font-semibold uppercase text-sm mb-2">
                <Crown size={16} /> Current Champion
              </div>
              <div className="text-2xl font-bold">{top3[0]?.name || "No Data"}</div>
            </div>

            <div className="flex items-end gap-4">
              <Podium user={top3[1]} place={2} height="h-32" />
              <Podium user={top3[0]} place={1} height="h-48" primary />
              <Podium user={top3[2]} place={3} height="h-24" />
            </div>
          </div>

          {/* Table */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-lg border overflow-hidden flex flex-col">
            <div className="p-6 border-b flex justify-between">
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Users size={20} className="text-blue-600" /> Top Contributors
                </h3>
                <p className="text-sm text-slate-500">Ranked by civic impact points</p>
              </div>
              <div className="flex items-center gap-2 text-blue-600">
                <TrendingUp size={20} />
                <span className="font-semibold text-sm">{users.length} Active</span>
              </div>
            </div>

            <div className="flex-1 overflow-auto">
              {rest.length === 0 && users.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <Trophy size={40} className="mx-auto mb-3 opacity-30" />
                  <p>No citizens ranked yet</p>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-xs uppercase">
                    <tr>
                      <th className="px-6 py-4">Rank</th>
                      <th className="px-6 py-4">Citizen</th>
                      <th className="px-6 py-4">Level</th>
                      <th className="px-6 py-4 text-right">Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(rest.length > 0 ? rest : users).map(u => (
                      <tr
                        key={u.userId}
                        className={`border-t transition ${u.userId === myUserId ? "bg-blue-50" : "hover:bg-slate-50"}`}
                      >
                        <td className="px-6 py-4 font-bold">#{u.rank}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || "U")}&background=3b82f6&color=fff`}
                              className="w-10 h-10 rounded-full object-cover"
                              alt=""
                            />
                            <span className="font-medium">
                              {u.userId === myUserId ? <span className="text-blue-600">You</span> : u.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 text-xs bg-blue-100 text-blue-600 rounded-lg flex items-center gap-1 w-fit">
                            <Shield size={12} /> Lvl {Math.floor(u.points / 100) + 1}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-semibold">{u.points} pts</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Sticky Me */}
            {myEntry && (
              <div className="bg-blue-50 p-4 border-t flex justify-between sticky bottom-0">
                <div className="flex items-center gap-4">
                  <div className="font-bold">#{myEntry.rank}</div>
                  <div className="flex items-center gap-3">
                    <img
                      src={myEntry.avatar || `https://ui-avatars.com/api/?name=Me&background=3b82f6&color=fff`}
                      className="w-10 h-10 rounded-full"
                      alt=""
                    />
                    <div>
                      <div className="font-bold text-blue-700">You</div>
                      <div className="text-xs text-slate-500">{myEntry.name}</div>
                    </div>
                  </div>
                </div>
                <div className="font-bold">{myEntry.points} pts</div>
              </div>
            )}
          </div>
        </div>
      )}
    </CivicLayout>
  );
};

const Podium = ({ user, place, height, primary }) => (
  <div className="flex flex-col items-center">
    <div className={`${primary ? "w-20 h-20 border-blue-600" : "w-16 h-16 border-slate-300"} rounded-full border-4 mb-2 overflow-hidden bg-slate-100`}>
      {user && (
        <img
          src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "U")}&background=3b82f6&color=fff`}
          className="w-full h-full object-cover"
          alt=""
        />
      )}
    </div>
    <div className={`${height} ${primary ? "bg-blue-100" : "bg-slate-200"} rounded-t-lg flex items-end justify-center pb-2`}>
      <span className="font-semibold text-sm">{user?.points || 0}</span>
    </div>
    <div className="text-sm font-bold mt-1">#{place}</div>
  </div>
);

export default Leaderboard;
