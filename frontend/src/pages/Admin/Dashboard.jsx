import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    MapPin, AlertTriangle, CheckCircle,
    Sparkles, Search, Send, X, CheckSquare,
    Video, AlignLeft, ChevronRight
} from "lucide-react";
import AdminLayout from "./AdminLayout";
import { toast } from "react-hot-toast";

/* ---------------- MOCK DATA ---------------- */
const mockReports = [
    {
        reportId: "rep001234",
        type: "Garbage",
        priority: "High",
        status: "Pending",
        description: "Garbage pile near road",
        aiConfidence: 88,
        userName: "Rahul",
        location: { lat: 22.5726, lng: 88.3639, address: "Sector 4, City" },
        createdAt: Date.now()
    },
    {
        reportId: "rep009876",
        type: "Water Leak",
        priority: "Medium",
        status: "Accepted",
        description: "Water leakage",
        aiConfidence: 70,
        userName: "Amit",
        location: { lat: 22.575, lng: 88.36, address: "MG Road" },
        createdAt: Date.now()
    }
];

/* ---------------- DISTANCE ---------------- */
const haversineDistance = (c1, c2) => {
    const toRad = x => (x * Math.PI) / 180;
    const R = 6371e3;
    const dLat = toRad(c2.lat - c1.lat);
    const dLon = toRad(c2.lng - c1.lng);
    const lat1 = toRad(c1.lat);
    const lat2 = toRad(c2.lat);

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const AdminDashboard = () => {
    const navigate = useNavigate();

    const [stats, setStats] = useState({
        open: 0,
        highSeverity: 0,
        aiFlagged: 0,
        resolved: 0
    });

    const [recentReports, setRecentReports] = useState([]);
    const [selectedIncident, setSelectedIncident] = useState(null);
    const [selectedCluster, setSelectedCluster] = useState(null);

    /* ---------------- LOAD DATA ---------------- */
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_AWS_API_GATEWAY_URL}/api/dashboard`);
                const data = await res.json();
                processReports(data);
            } catch (err) {
                console.error("Failed to fetch reports:", err);
                toast.error("Failed to load live reports");
                // Fallback to mock for testing if API is down
                processReports(mockReports);
            }
        };
        fetchData();
        const interval = setInterval(fetchData, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    const processReports = reports => {
        let open = 0, high = 0, flagged = 0, resolved = 0;

        reports.forEach(r => {
            if (r.status === "Pending") open++;
            if (r.priority === "High") high++;
            if (r.aiConfidence > 80 && r.status === "Pending") flagged++;
            if (r.status === "Resolved") resolved++;
        });

        setStats({ open, highSeverity: high, aiFlagged: flagged, resolved });
        setRecentReports(reports);
        if (reports.length && !selectedIncident)
            setSelectedIncident(reports[0]);
    };

    /* ---------------- CLUSTERS ---------------- */
    const clusters = useMemo(() => {
        const out = [];
        const visited = new Set();

        recentReports.forEach(r => {
            if (visited.has(r.reportId)) return;
            if (!r.location) return;

            const cluster = [r];
            visited.add(r.reportId);

            recentReports.forEach(o => {
                if (visited.has(o.reportId)) return;
                if (!o.location) return;

                const d = haversineDistance(r.location, o.location);
                if (d <= 300) {
                    cluster.push(o);
                    visited.add(o.reportId);
                }
            });

            out.push(cluster);
        });

        return out;
    }, [recentReports]);

    /* ---------------- STATUS ---------------- */
    const handleUpdateStatus = async (newStatus) => {
        if (!selectedIncident) return;

        try {
            await fetch(`${import.meta.env.VITE_AWS_API_GATEWAY_URL}/api/update-status`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    reportId: selectedIncident.reportId,
                    status: newStatus
                })
            });

            const updated = recentReports.map(r =>
                r.reportId === selectedIncident.reportId
                    ? { ...r, status: newStatus }
                    : r
            );

            setRecentReports(updated);
            setSelectedIncident(prev => ({ ...prev, status: newStatus }));

            toast.success(`Incident ${newStatus}`);

            if (newStatus === "Accepted")
                navigate("/admin/broadcast", {
                    state: { incidentId: selectedIncident.reportId }
                });
        } catch (err) {
            console.error("Failed to update status:", err);
            toast.error("Failed to update status on server");
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">

                {/* HEADER */}
                <div>
                    <h1 className="text-2xl font-black">Command Center</h1>
                    <p className="text-sm text-slate-500">
                        Monitoring live reports
                    </p>
                </div>

                {/* STATS */}
                <div className="grid md:grid-cols-4 gap-4">
                    <StatCard label="Open" value={stats.open} icon={<AlertTriangle />} />
                    <StatCard label="High" value={stats.highSeverity} icon={<AlertTriangle />} />
                    <StatCard label="AI Flagged" value={stats.aiFlagged} icon={<Sparkles />} />
                    <StatCard label="Resolved" value={stats.resolved} icon={<CheckCircle />} />
                </div>

                <div className="grid lg:grid-cols-3 gap-6">

                    {/* MAP */}
                    <div className="lg:col-span-2 bg-white rounded-2xl border h-[420px] relative overflow-hidden">

                        {/* Map background */}
                        <div className="absolute inset-0 bg-slate-100 flex items-center justify-center text-slate-400">
                            Map disabled (No Google)
                        </div>

                        {/* Cluster markers */}
                        {clusters.map((cluster, i) => {
                            const r = cluster[0];
                            const left = (r.location.lng % 1) * 100;
                            const top = (r.location.lat % 1) * 100;

                            const isCluster = cluster.length > 1;

                            return (
                                <div
                                    key={i}
                                    style={{ left: `${left}%`, top: `${top}%` }}
                                    className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                                    onClick={() =>
                                        isCluster
                                            ? setSelectedCluster(cluster)
                                            : setSelectedIncident(r)
                                    }
                                >
                                    <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-xs">
                                        {isCluster ? cluster.length : "•"}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* RIGHT PANEL */}
                    <div>
                        {selectedIncident ? (
                            <div className="bg-white rounded-2xl border p-6 space-y-4">

                                <div className="font-bold text-xl">
                                    #{selectedIncident.reportId.slice(-6)}
                                </div>

                                <div className="text-sm">
                                    {selectedIncident.description}
                                </div>

                                <div className="text-xs text-slate-500">
                                    {selectedIncident.location?.address}
                                </div>

                                <div className="bg-blue-50 p-3 rounded text-xs">
                                    AI Confidence: {selectedIncident.aiConfidence}%
                                </div>

                                {selectedIncident.status === "Pending" && (
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => handleUpdateStatus("Rejected")}
                                            className="border rounded py-2 flex justify-center gap-1"
                                        >
                                            <X size={14} /> Reject
                                        </button>

                                        <button
                                            onClick={() => handleUpdateStatus("Accepted")}
                                            className="bg-blue-600 text-white rounded py-2 flex justify-center gap-1"
                                        >
                                            <CheckSquare size={14} /> Accept
                                        </button>
                                    </div>
                                )}

                                {selectedIncident.status === "Accepted" && (
                                    <div className="space-y-2">
                                        <button
                                            onClick={() => handleUpdateStatus("Resolved")}
                                            className="w-full bg-green-600 text-white py-2 rounded"
                                        >
                                            Resolve
                                        </button>

                                        <button
                                            onClick={() =>
                                                navigate("/admin/broadcast", {
                                                    state: { incidentId: selectedIncident.id }
                                                })
                                            }
                                            className="w-full bg-red-600 text-white py-2 rounded flex justify-center gap-1"
                                        >
                                            <Send size={14} /> Broadcast
                                        </button>
                                    </div>
                                )}

                            </div>
                        ) : (
                            <div className="border-2 border-dashed p-8 text-center text-slate-400">
                                Select report
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </AdminLayout>
    );
};

/* ---------------- STAT CARD ---------------- */
const StatCard = ({ label, value, icon }) => (
    <div className="bg-white border rounded-2xl p-4 flex justify-between">
        <div>
            <div className="text-xs text-slate-400">{label}</div>
            <div className="text-xl font-bold">{value}</div>
        </div>
        <div className="text-slate-400">{icon}</div>
    </div>
);

export default AdminDashboard;