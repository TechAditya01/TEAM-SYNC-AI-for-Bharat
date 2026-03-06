import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    MapPin, AlertTriangle, CheckCircle,
    Sparkles, Send, X, CheckSquare,
    ChevronRight
} from "lucide-react";
import AdminLayout from "./AdminLayout";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import AWSMapView from "../../components/maps/AWSMapView";

const API = import.meta.env.VITE_AWS_API_GATEWAY_URL || "";

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
    const { user } = useAuth();

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
        if (!user) return;

        const fetchData = async () => {
            try {
                const dept = user.department || '';
                const adminSub = user.sub || '';

                let url = `${API}/api/dashboard`;
                const params = new URLSearchParams();
                if (dept) params.set('department', dept);
                if (adminSub) params.set('adminSub', adminSub);
                if (params.toString()) url += `?${params.toString()}`;

                const res = await fetch(url);
                const data = await res.json();
                processReports(data);
            } catch (err) {
                console.error("Failed to fetch reports:", err);
                toast.error("Failed to load live reports");
                processReports([]);
            }
        };
        fetchData();
        const interval = setInterval(fetchData, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, [user]);

    const processReports = reports => {
        let open = 0, high = 0, flagged = 0, resolved = 0;

        // Fallback frontend filtering to prevent new admins from seeing all reports
        // in case the backend map fails for unmapped departments.
        const myDept = user?.department?.toLowerCase();

        // Allowed mapping mirroring the backend
        const deptMap = {
            'fire': ['fire', 'fire accident', 'fire hazard'],
            'fire department': ['fire', 'fire accident', 'fire hazard'],
            'sanitation': ['garbage', 'waste', 'litter', 'sanitation', 'drainage', 'sewage'],
            'water': ['water leak', 'water', 'flooding', 'flood'],
            'electricity': ['electricity', 'power', 'streetlight', 'electric'],
            'roads': ['pothole', 'road', 'traffic', 'road damage'],
            'health': ['health', 'hospital', 'medical'],
            'police': ['crime', 'accident', 'sos', 'violence', 'theft'],
        };
        const allowedTypes = myDept ? (deptMap[myDept] || []) : [];

        const filteredReports = reports.filter(r => {
            if (!myDept) return true; // show all if no dept
            const rType = (r.type || r.category || "").toLowerCase();
            const rDept = (r.department || "").toLowerCase();

            return (rDept === myDept || allowedTypes.includes(rType));
        });

        filteredReports.forEach(r => {
            if (r.status === "Pending") open++;
            if (r.priority === "High") high++;
            if (r.aiConfidence > 80 && r.status === "Pending") flagged++;
            if (r.status === "Resolved") resolved++;
        });

        setStats({ open, highSeverity: high, aiFlagged: flagged, resolved });
        setRecentReports(filteredReports);
        if (filteredReports.length && !selectedIncident)
            setSelectedIncident(filteredReports[0]);
    };

    /* ---------------- CLUSTERS ---------------- */
    const clusters = useMemo(() => {
        const out = [];
        const visited = new Set();

        recentReports.forEach(r => {
            if (visited.has(r.report_id)) return;
            if (!r.location) return;

            const cluster = [r];
            visited.add(r.report_id);

            recentReports.forEach(o => {
                if (visited.has(o.report_id)) return;
                if (!o.location) return;

                const d = haversineDistance(r.location, o.location);
                if (d <= 300) {
                    cluster.push(o);
                    visited.add(o.report_id);
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
                    report_id: selectedIncident.report_id,
                    status: newStatus
                })
            });

            const updated = recentReports.map(r =>
                r.report_id === selectedIncident.report_id
                    ? { ...r, status: newStatus }
                    : r
            );

            setRecentReports(updated);
            setSelectedIncident(prev => ({ ...prev, status: newStatus }));

            toast.success(`Incident ${newStatus}`);

            if (newStatus === "Accepted")
                navigate("/admin/broadcast", {
                    state: { incidentId: selectedIncident.report_id }
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
                        <AWSMapView
                            center={[79.0882, 21.1458]} // Default Nagpur [lng, lat]
                            zoom={12}
                            markers={clusters.map(cluster => {
                                const r = cluster[0];
                                return {
                                    lat: r.location.lat,
                                    lng: r.location.lng,
                                    title: r.type,
                                    description: r.description,
                                    color: r.status === "Resolved" ? "#22c55e" : "#ef4444",
                                    category: r.type,
                                    data: r
                                };
                            })}
                            onMarkerClick={(incident) => setSelectedIncident(incident)}
                            style="Standard"
                        />
                    </div>

                    {/* RIGHT PANEL */}
                    <div>
                        {selectedIncident ? (
                            <div className="bg-white rounded-2xl border p-6 space-y-4">

                                <div className="font-bold text-xl">
                                    #{selectedIncident.report_id.slice(-6)}
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