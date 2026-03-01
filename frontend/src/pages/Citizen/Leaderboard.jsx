import React, { useState, useEffect } from "react";
import { Trophy, Shield, TrendingUp, Users, Crown } from "lucide-react";
import CivicLayout from "./CivicLayout";

const mockUsers = [
  {
    id: "1",
    name: "Amit Sharma",
    points: 1240,
    avatar: "https://i.pravatar.cc/150?img=1",
  },
  {
    id: "2",
    name: "Priya Verma",
    points: 980,
    avatar: "https://i.pravatar.cc/150?img=2",
  },
  {
    id: "3",
    name: "Rahul Singh",
    points: 860,
    avatar: "https://i.pravatar.cc/150?img=3",
  },
  {
    id: "4",
    name: "Neha Patel",
    points: 720,
    avatar: "https://i.pravatar.cc/150?img=4",
  },
  {
    id: "5",
    name: "Vikas Kumar",
    points: 640,
    avatar: "https://i.pravatar.cc/150?img=5",
    isMe: true,
  },
];

const Leaderboard = () => {
  const [filter, setFilter] = useState("Weekly");
  const [users, setUsers] = useState([]);
  const [currentUserData, setCurrentUserData] = useState(null);

  useEffect(() => {
    // Simulate API fetch
    const sorted = [...mockUsers].sort((a, b) => b.points - a.points);

    const ranked = sorted.map((u, index) => ({
      ...u,
      rank: index + 1,
    }));

    setUsers(ranked);

    const me = ranked.find((u) => u.isMe);
    if (me) setCurrentUserData(me);
  }, []);

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

        {/* Filter */}
        <div className="bg-slate-100 dark:bg-slate-700 p-1.5 rounded-lg flex items-center">
          {["Weekly", "Monthly", "All Time"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold ${
                filter === f
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top 3 */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-8 border flex flex-col justify-end items-center h-[500px]">
          <div className="absolute top-8 text-center">
            <div className="flex items-center justify-center gap-2 text-blue-600 font-semibold uppercase text-sm mb-2">
              <Crown size={16} />
              Current Champion
            </div>
            <div className="text-2xl font-bold">
              {users[0]?.name || "No Data"}
            </div>
          </div>

          <div className="flex items-end gap-4">
            {/* 2nd */}
            <Podium user={users[1]} place={2} height="h-32" />

            {/* 1st */}
            <Podium user={users[0]} place={1} height="h-48" primary />

            {/* 3rd */}
            <Podium user={users[2]} place={3} height="h-24" />
          </div>
        </div>

        {/* Table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-lg border overflow-hidden flex flex-col">
          <div className="p-6 border-b flex justify-between">
            <div>
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Users size={20} className="text-blue-600" />
                Top Contributors
              </h3>
              <p className="text-sm text-slate-500">
                Ranked by civic impact points
              </p>
            </div>
            <div className="flex items-center gap-2 text-blue-600">
              <TrendingUp size={20} />
              <span className="font-semibold text-sm">
                {users.length} Active
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-auto">
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
                {users.slice(3).map((user) => (
                  <tr key={user.id} className="border-t">
                    <td className="px-6 py-4">#{user.rank}</td>

                    <td className="px-6 py-4 flex items-center gap-3">
                      <img
                        src={user.avatar}
                        className="w-10 h-10 rounded-full"
                        alt=""
                      />
                      {user.name}
                    </td>

                    <td className="px-6 py-4">
                      <span className="px-3 py-1 text-xs bg-blue-100 text-blue-600 rounded-lg flex items-center gap-1 w-fit">
                        <Shield size={12} />
                        Lvl {Math.floor(user.points / 100) + 1}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right font-semibold">
                      {user.points} pts
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Sticky Me */}
          {currentUserData && (
            <div className="bg-blue-50 p-4 border-t flex justify-between sticky bottom-0">
              <div className="flex items-center gap-4">
                <div className="font-bold">
                  #{currentUserData.rank}
                </div>

                <div className="flex items-center gap-3">
                  <img
                    src={currentUserData.avatar}
                    className="w-10 h-10 rounded-full"
                    alt=""
                  />
                  <div>
                    <div className="font-bold">You</div>
                    <div className="text-xs text-slate-500">
                      {currentUserData.name}
                    </div>
                  </div>
                </div>
              </div>

              <div className="font-bold">
                {currentUserData.points} pts
              </div>
            </div>
          )}
        </div>
      </div>
    </CivicLayout>
  );
};

const Podium = ({ user, place, height, primary }) => (
  <div className="flex flex-col items-center">
    <div
      className={`${
        primary ? "w-20 h-20 border-blue-600" : "w-16 h-16 border-slate-300"
      } rounded-full border-4 mb-2 overflow-hidden`}
    >
      {user && (
        <img src={user.avatar} className="w-full h-full object-cover" />
      )}
    </div>

    <div
      className={`${height} ${
        primary ? "bg-blue-100" : "bg-slate-200"
      } rounded-t-lg flex items-end justify-center pb-2`}
    >
      <span className="font-semibold">{user?.points || 0}</span>
    </div>

    <div className="text-sm font-bold mt-1">#{place}</div>
  </div>
);

export default Leaderboard;