import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import { MapPin, AlertTriangle, Clock, ChevronRight, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const API = import.meta.env.VITE_AWS_API_GATEWAY_URL || "";
const AWS_REGION = import.meta.env.VITE_AWS_REGION || 'ap-south-1';
const API_KEY = import.meta.env.VITE_AWS_LOCATION_API_KEY;

const AdminMapDirect = () => {
    const { user } = useAuth();
    const mapContainer = useRef(null);
    const map = useRef(null);
    const markersRef = useRef([]);
    
    const [incidents, setIncidents] = useState([]);
    const [selectedIncident, setSelectedIncident] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mapLoading, setMapLoading] = useState(true);
    const [error, setError] = useState(null);

    /* -------- INITIALIZE MAP -------- */
    useEffect(() => {
        if (map.current || !mapContainer.current) return;

        if (!API_KEY) {
            setError('AWS Location API Key not configured');
            setMapLoading(false);
            return;
        }

        try {
            const styleUrl = `https://maps.geo.${AWS_REGION}.amazonaws.com/v2/styles/Standard/descriptor?key=${API_KEY}`;
            
            console.log('Initializing map...');
            
            map.current = new maplibregl.Map({
                container: mapContainer.current,
                style: styleUrl,
                center: [79.0882, 21.1458],
                zoom: 12,
            });

            map.current.on('load', () => {
                console.log('✓ Map loaded');
                setMapLoading(false);
            });

            map.current.on('error', (e) => {
                console.error('Map error:', e);
                setError('Failed to load map');
                setMapLoading(false);
            });

            map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
            map.current.addControl(new maplibregl.ScaleControl({ maxWidth: 100 }), 'bottom-left');

        } catch (err) {
            console.error('Map init error:', err);
            setError('Failed to initialize map');
            setMapLoading(false);
        }

        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, []);

    /* -------- FETCH INCIDENTS -------- */
    const fetchIncidents = async () => {
        setLoading(true);
        try {
            const dept = user?.department || '';
            const adminSub = user?.sub || '';

            let url = `${API}/api/dashboard`;
            const params = new URLSearchParams();
            if (dept) params.set('department', dept);
            if (adminSub) params.set('adminSub', adminSub);
            if (params.toString()) url += `?${params.toString()}`;

            const res = await fetch(url);
            const data = await res.json();
            
            if (Array.isArray(data)) {
                const validIncidents = data.filter(r => 
                    r.location && 
                    r.location.lat && 
                    r.location.lng &&
                    r.status !== 'Resolved'
                );
                
                setIncidents(validIncidents);
                
                // Fly to first incident
                if (validIncidents.length > 0 && map.current) {
                    const first = validIncidents[0];
                    map.current.flyTo({
                        center: [first.location.lng, first.location.lat],
                        zoom: 14,
                        duration: 1500
                    });
                }
            } else {
                console.error("Invalid response:", data);
                toast.error(data.error || "Failed to load incidents");
                setIncidents([]);
            }
        } catch (err) {
            console.error("Fetch error:", err);
            toast.error("Failed to load incidents");
            setIncidents([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user) return;
        fetchIncidents();
        const interval = setInterval(fetchIncidents, 30000);
        return () => clearInterval(interval);
    }, [user]);

    /* -------- ADD MARKERS -------- */
    useEffect(() => {
        if (!map.current || mapLoading) return;

        // Clear existing markers
        markersRef.current.forEach(m => m.remove());
        markersRef.current = [];

        const addMarkers = () => {
            incidents.forEach((incident) => {
                const color = incident.priority === "High" ? "#ef4444" : 
                             incident.status === "Accepted" ? "#f59e0b" : "#3b82f6";

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
                `;
                
                el.innerHTML = '📍';
                el.onmouseenter = () => el.style.transform = 'scale(1.2)';
                el.onmouseleave = () => el.style.transform = 'scale(1)';

                const marker = new maplibregl.Marker({ element: el })
                    .setLngLat([incident.location.lng, incident.location.lat])
                    .addTo(map.current);

                el.addEventListener('click', () => {
                    setSelectedIncident(incident);
                    map.current.flyTo({
                        center: [incident.location.lng, incident.location.lat],
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
    }, [incidents, mapLoading]);

    return (
        <AdminLayout>
            <div className="h-[calc(100vh-150px)] flex flex-col gap-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">Department Live Monitor</h1>
                        <p className="text-sm text-slate-500">
                            Geospatial view of active civic issues (Direct MapLibre)
                        </p>
                    </div>
                    <button
                        onClick={fetchIncidents}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                </div>

                <div className="flex-1 flex gap-4 overflow-hidden relative">
                    {/* Map Container */}
                    <div className="flex-1 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden relative bg-slate-100 dark:bg-slate-900" style={{ minHeight: '500px' }}>
                        {mapLoading && (
                            <div className="absolute inset-0 z-30 bg-white/80 dark:bg-slate-900/80 flex items-center justify-center">
                                <div className="text-center">
                                    <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-2" />
                                    <p className="text-slate-600 dark:text-slate-400">Loading map...</p>
                                </div>
                            </div>
                        )}
                        {error && (
                            <div className="absolute inset-0 z-30 bg-white dark:bg-slate-900 flex items-center justify-center">
                                <div className="text-center p-6">
                                    <div className="text-red-500 text-4xl mb-4">⚠️</div>
                                    <h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-white">Map Error</h3>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm">{error}</p>
                                </div>
                            </div>
                        )}
                        <div ref={mapContainer} className="w-full h-full" />
                    </div>

                    {/* Sidebar */}
                    {selectedIncident ? (
                        <div className="w-80 bg-white rounded-3xl border p-6 flex flex-col shadow-sm">
                            <h3 className="font-bold text-lg mb-2 flex gap-2 items-center">
                                <AlertTriangle className={
                                    selectedIncident.priority === "High" ? "text-red-500" : "text-yellow-500"
                                } size={20} />
                                {selectedIncident.type}
                            </h3>
                            <span className={`text-xs font-semibold px-2 py-1 rounded-md w-max mb-4 ${
                                selectedIncident.status === "Pending" ? "bg-blue-100 text-blue-700" :
                                selectedIncident.status === "Accepted" ? "bg-yellow-100 text-yellow-700" :
                                "bg-slate-100 text-slate-700"
                            }`}>
                                {selectedIncident.status}
                            </span>

                            <p className="text-sm text-slate-600 mb-4 flex-1">
                                {selectedIncident.description}
                            </p>

                            <div className="text-xs text-slate-500 mb-2">
                                <MapPin size={12} className="inline mr-1" />
                                {selectedIncident.location?.address || 'Location not available'}
                            </div>

                            <div className="text-xs text-slate-400 font-medium flex gap-2 mb-4 items-center">
                                <Clock size={14} />
                                {new Date(selectedIncident.createdAt).toLocaleString()}
                            </div>

                            <Link
                                to={`/admin/incidents/${selectedIncident.report_id}`}
                                className="mt-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-center w-full transition-colors flex items-center justify-center gap-2"
                            >
                                View Full Report
                                <ChevronRight size={16} />
                            </Link>

                            <button
                                onClick={() => setSelectedIncident(null)}
                                className="mt-2 text-slate-500 text-sm hover:underline py-2"
                            >
                                Dismiss
                            </button>
                        </div>
                    ) : (
                        <div className="w-80 bg-white rounded-3xl border p-6 flex flex-col items-center justify-center text-center">
                            <MapPin size={48} className="text-slate-300 mb-4" />
                            <p className="text-slate-500 font-medium">
                                {loading ? 'Loading incidents...' : 
                                 incidents.length === 0 ? 'No active incidents' :
                                 'Click a marker to view details'}
                            </p>
                            <p className="text-xs text-slate-400 mt-2">
                                {incidents.length} active incident{incidents.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminMapDirect;
