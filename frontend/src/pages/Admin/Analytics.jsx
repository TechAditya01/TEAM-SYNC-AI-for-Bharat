import React, { useState, useEffect } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, BarChart, Bar,
    PieChart, Pie, Cell
} from 'recharts';
import { Download } from 'lucide-react';
import AdminLayout from './AdminLayout';

const mockReports = [
    {
        category: "garbage",
        createdAt: "2026-02-24T10:30:00",
        location: { address: "Sector 4, City" }
    },
    {
        category: "water",
        createdAt: "2026-02-25T15:00:00",
        location: { address: "Sector 7, City" }
    },
    {
        category: "road",
        createdAt: "2026-02-26T20:00:00",
        location: { address: "Sector 4, City" }
    },
    {
        category: "garbage",
        createdAt: "2026-02-27T09:00:00",
        location: { address: "Sector 2, City" }
    },
    {
        category: "electricity",
        createdAt: "2026-02-28T18:00:00",
        location: { address: "Sector 7, City" }
    }
];

const Analytics = () => {
    const [lineData, setLineData] = useState([]);
    const [pieData, setPieData] = useState([]);
    const [totalReports, setTotalReports] = useState(0);
    const [barData, setBarData] = useState([]);
    const [heatmapData, setHeatmapData] = useState([]);
    const [maxHeat, setMaxHeat] = useState(1);

    useEffect(() => {
        const reportsArray = mockReports; // 👉 replace later with API data
        setTotalReports(reportsArray.length);

        // ---------------- Pie ----------------
        const categoryCounts = {};
        reportsArray.forEach(r => {
            const cat = r.category || "Other";
            categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        });

        const pie = Object.keys(categoryCounts).map((k, i) => ({
            name: k,
            value: categoryCounts[k],
            color: ['#f59e0b', '#3b82f6', '#10b981', '#6366f1', '#ec4899'][i % 5]
        }));
        setPieData(pie);

        // ---------------- Line (7 days) ----------------
        const last7 = {};
        const today = new Date();

        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            last7[key] = 0;
        }

        reportsArray.forEach(r => {
            const d = new Date(r.createdAt);
            const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            if (last7[key] !== undefined) last7[key]++;
        });

        setLineData(
            Object.keys(last7).map(k => ({ name: k, reports: last7[k] }))
        );

        // ---------------- Bar (Avg Duration) ----------------
        const areaStats = {};
        const now = new Date();

        reportsArray.forEach(r => {
            if (!r.location?.address) return;

            let area = r.location.address.split(',')[0];
            if (area.length > 15) area = area.slice(0, 15) + "...";

            const hours = (now - new Date(r.createdAt)) / 3600000;

            if (!areaStats[area]) areaStats[area] = { total: 0, count: 0 };
            areaStats[area].total += hours;
            areaStats[area].count++;
        });

        const bar = Object.keys(areaStats)
            .map(a => ({
                name: a,
                time: Math.round(areaStats[a].total / areaStats[a].count)
            }))
            .sort((a, b) => b.time - a.time)
            .slice(0, 5);

        setBarData(bar);

        // ---------------- Heatmap ----------------
        const grid = Array(35).fill(0);
        let maxVal = 1;

        reportsArray.forEach(r => {
            const d = new Date(r.createdAt);
            let day = d.getDay();
            let col = day === 0 ? 6 : day - 1;

            const h = d.getHours();
            let row = 0;
            if (h >= 5 && h < 10) row = 1;
            else if (h >= 10 && h < 15) row = 2;
            else if (h >= 15 && h < 20) row = 3;
            else if (h >= 20) row = 4;

            const index = row * 7 + col;
            grid[index]++;
            if (grid[index] > maxVal) maxVal = grid[index];
        });

        setHeatmapData(grid);
        setMaxHeat(maxVal);

    }, []);

    const getHeatColor = (v) => {
        if (v === 0) return 'bg-slate-100';
        const i = v / maxHeat;
        if (i > 0.8) return 'bg-red-500';
        if (i > 0.6) return 'bg-orange-500';
        if (i > 0.4) return 'bg-orange-400';
        if (i > 0.2) return 'bg-blue-400';
        return 'bg-blue-200';
    };

    return (
        <AdminLayout>
            <div className="space-y-8">

                {/* HEADER */}
                <div className="flex justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Analytics Report</h1>
                        <p className="text-slate-500">Performance metrics</p>
                    </div>
                    <button className="flex gap-2 border px-4 py-2 rounded-xl">
                        <Download size={18} /> Export PDF
                    </button>
                </div>

                {/* TOP */}
                <div className="grid lg:grid-cols-3 gap-8">

                    {/* LINE */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow">
                        <h3 className="font-bold mb-4">Reports (7 days)</h3>
                        <div className="h-64">
                            <ResponsiveContainer>
                                <AreaChart data={lineData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="reports" stroke="#3b82f6" fill="#93c5fd" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* PIE */}
                    <div className="bg-white p-6 rounded-2xl shadow text-center">
                        <h3 className="font-bold mb-2">Categories</h3>
                        <div className="h-56">
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie data={pieData} dataKey="value">
                                        {pieData.map((e, i) => (
                                            <Cell key={i} fill={e.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="text-3xl font-bold">{totalReports}</div>
                        <div className="text-xs text-slate-500">TOTAL</div>
                    </div>

                </div>

                {/* BOTTOM */}
                <div className="grid lg:grid-cols-2 gap-8">

                    {/* BAR */}
                    <div className="bg-white p-6 rounded-2xl shadow">
                        <h3 className="font-bold mb-4">Avg Duration</h3>
                        <div className="h-64">
                            <ResponsiveContainer>
                                <BarChart data={barData} layout="vertical">
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" />
                                    <Tooltip />
                                    <Bar dataKey="time" fill="#3b82f6" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* HEATMAP */}
                    <div className="bg-white p-6 rounded-2xl shadow">
                        <h3 className="font-bold mb-4">Peak Times</h3>
                        <div className="grid grid-cols-7 grid-rows-5 gap-1 h-64">
                            {heatmapData.map((v, i) => (
                                <div key={i} className={`${getHeatColor(v)} rounded`} />
                            ))}
                        </div>
                    </div>

                </div>

            </div>
        </AdminLayout>
    );
};

export default Analytics;