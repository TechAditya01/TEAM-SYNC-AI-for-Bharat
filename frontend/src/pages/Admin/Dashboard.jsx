import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    MapPin, AlertTriangle, CheckCircle,
    Sparkles, Send, X, CheckSquare,
    ChevronRight, Loader2
} from "lucide-react";
import AdminLayout from "./AdminLayout";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const API = import.meta.env.VITE_AWS_API_GATEWAY_URL || "";
const AWS_REGION = import.meta.env.VITE_AWS_REGION || 'ap-south-1';
const API_KEY = import.meta.env.VITE_AWS_LOCATION_API_KEY;

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
    const mapContainer = useRef(null);
    const map = useRef(null);
    const markersRef = useRef([]);

    const [stats, setStats] = useState({
        open: 0,
        highSeverity: 0,
        aiFlagged: 0,
        resolved: 0
    });

    const [recentReports, setRecentReports] = useState([]);
    const [selectedIncident, setSelectedIncident] = useState(null);
    const [mapLoading, setMapLoading] = useState(true);
    const [mapError, setMapError] = useState(null);

    /* ---------------- INITIALIZE MAP ---------------- */
    useEffect(() => {
        if (map.current || !mapContainer.current) return;

        if (!API_KEY) {
            setMapError('Map API key not configured');
            setMapLoading(false);
            return;
        }

        try {
            const styleUrl = `https://maps.geo.${AWS_REGION}.amazonaws.com/v2/styles/Standard/descriptor?key=${API_KEY}`;
            
            map.current = new maplibregl.Map({
                container: mapContainer.current,
                style: styleUrl,
                center: [79.0882, 21.1458],
                zoom: 12,
            });

            map.current.on('load', () => {
                setMapLoading(false);
            });

            map.current.on('error', (e) => {
                console.error('Map error:', e);
                setMapError('Failed to load map');
                setMapLoading(false);
            });

            map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

        } catch (err) {
            console.error('Map init error:', err);
            setMapError('Failed to initialize map');
            setMapLoading(false);
        }

        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, []);

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
                
                if (Array.isArray(data)) {
                    processReports(data);
                } else {
                    console.error("Invalid response format:", data);
                    processReports([]);
                }
            } catch (err) {
                console.error("Failed to fetch reports:", err);
                processReports([]);
            }
        };
        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, [user]);

    const processReports = reports => {
        if (!Array.isArray(reports)) {
            reports = [];
        }

        let open = 0, high = 0, flagged = 0, resolved = 0;

        const myDept = user?.department?.toLowerCase();
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
            if (!myDept) return true;
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

    /* ---------------- ADD MARKERS ---------------- */
    useEffect(() => {
        if (!map.current || mapLoading) return;

        markersRef.current.forEach(m => m.remove());
        markersRef.current = [];

        const addMarkers = () => {
            clusters.forEach(cluster => {
                const r = cluster[0];
                if (!r.location || !r.location.lat || !r.location.lng) return;

                const color = r.status === "Resolved" ? "#22c55e" : "#ef4444";

                const el = document.createElement('div');
                el.style.cssText = `
                    width: 32px;
                    height: 32px;
                    background-color: ${color};
                    border: 3px solid white;
                    border-radius: 50%;
                    cursor: pointer;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                    transition: transform 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    color: white;
                    font-weight: bold;
                `;
                
                el.innerHTML = cluster.length > 1 ? cluster.length : '📍';
                el.onmouseenter = () => el.style.transform = 'scale(1.2)';
                el.onmouseleave = () => el.style.transform = 'scale(1)';

                const marker = new maplibregl.Marker({ element: el })
                    .setLngLat([r.location.lng, r.location.lat])
                    .addTo(map.current);

                el.addEventListener('click', () => {
                    setSelectedIncident(r);
                    map.current.flyTo({
                        center: [r.location.lng, r.location.lat],
                        zoom: 16,
                        duration: 800
                    });
                });

                markersRef.current.push(marker);
            });
        };

        if (map.current.isStyleLoaded()) {
            addMarkers();
        } else {
            map.current.on('style.load', addMarkers);
        }
    }, [clusters, mapLoading]);

    /* ---------------- STATUS ---------------- */
    const handleUpdateStatus = async (newStatus) => {
        if (!selectedIncident) return;

        try {
            await fetch(`${API}/api/update-status`, {
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
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white">Command Center</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
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
                    <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 h-[420px] relative overflow-hidden">
                        {mapLoading && (
                            <div className="absolute inset-0 z-30 bg-white/80 dark:bg-slate-900/80 flex items-center justify-center">
                                <div className="text-center">
                                    <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-2" />
                                    <p className="text-slate-600 dark:text-slate-400">Loading map...</p>
                                </div>
                            </div>
                        )}
                        {mapError && (
                            <div className="absolute inset-0 z-30 bg-white dark:bg-slate-900 flex items-center justify-center">
                                <div className="text-center p-6">
                                    <div className="text-red-500 text-4xl mb-4">⚠️</div>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm">{mapError}</p>
                                </div>
                            </div>
                        )}
                        <div ref={mapContainer} className="w-full h-full" />
                    </div>

                    {/* RIGHT PANEL */}
                    <div>
                        {selectedIncident ? (
                            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">

                                <div className="font-bold text-xl text-slate-900 dark:text-white">
                                    #{selectedIncident.report_id?.slice(-6) || 'N/A'}
                                </div>

                                <div className="text-sm text-slate-700 dark:text-slate-300">
                                    {selectedIncident.description}
                                </div>

                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                    {selectedIncident.location?.address || 'No address'}
                                </div>

                                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded text-xs text-blue-700 dark:text-blue-400">
                                    AI Confidence: {selectedIncident.aiConfidence}%
                                </div>

                                {selectedIncident.status === "Pending" && (
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => handleUpdateStatus("Rejected")}
                                            className="border border-slate-300 dark:border-slate-600 rounded py-2 flex justify-center gap-1 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300"
                                        >
                                            <X size={14} /> Reject
                                        </button>

                                        <button
                                            onClick={() => handleUpdateStatus("Accepted")}
                                            className="bg-blue-600 hover:bg-blue-700 text-white rounded py-2 flex justify-center gap-1 transition-colors"
                                        >
                                            <CheckSquare size={14} /> Accept
                                        </button>
                                    </div>
                                )}

                                {selectedIncident.status === "Accepted" && (
                                    <div className="space-y-2">
                                        <button
                                            onClick={() => handleUpdateStatus("Resolved")}
                                            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded transition-colors"
                                        >
                                            Resolve
                                        </button>

                                        <button
                                            onClick={() =>
                                                navigate("/admin/broadcast", {
                                                    state: { incidentId: selectedIncident.report_id }
                                                })
                                            }
                                            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded flex justify-center gap-1 transition-colors"
                                        >
                                            <Send size={14} /> Broadcast
                                        </button>
                                    </div>
                                )}

                            </div>
                        ) : (
                            <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 p-8 text-center text-slate-400 dark:text-slate-500 rounded-lg">
                                Select a report from the map
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
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex justify-between">
        <div>
            <div className="text-xs text-slate-400 dark:text-slate-500">{label}</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">{value}</div>
        </div>
        <div className="text-slate-400 dark:text-slate-500">{icon}</div>
    </div>
);

export default AdminDashboard;