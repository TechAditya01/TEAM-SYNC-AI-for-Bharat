import React, { useState, useEffect, useMemo, useRef } from "react";
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import {
  MapPin,
  X,
  Navigation,
  Filter,
  AlertCircle,
  Clock,
  CheckCircle,
  Loader2,
  RefreshCw,
  Layers,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import CivicLayout from "./CivicLayout";

const AWS_REGION = import.meta.env.VITE_AWS_REGION || 'ap-south-1';
const API_KEY = import.meta.env.VITE_AWS_LOCATION_API_KEY;

// Get marker color based on status/priority
const getMarkerColor = (report) => {
  if (report.priority === 'Critical' || report.type?.includes('SOS')) return '#ef4444'; // red
  if (report.status === 'Resolved') return '#22c55e'; // green
  if (report.status === 'In Progress') return '#f59e0b'; // yellow
  return '#3b82f6'; // blue for pending
};

// Get icon based on category
const getCategoryIcon = (category) => {
  const icons = {
    'pothole': '🕳️',
    'road_damage': '🚧',
    'street_light': '💡',
    'garbage': '🗑️',
    'water_supply': '💧',
    'sewage': '🚰',
    'electricity': '⚡',
    'traffic': '🚦',
    'noise': '🔊',
    'encroachment': '🏗️',
    'stray_animals': '🐕',
    'sos': '🆘',
    'other': '📍',
  };
  return icons[category?.toLowerCase()] || '📍';
};

/* ---------------- HAVERSINE ---------------- */
const haversineDistance = (a, b) => {
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
};

const LiveMap = () => {
  const navigate = useNavigate();
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef([]);
  const userMarkerRef = useRef(null);

  const [mapCenter, setMapCenter] = useState([79.0882, 21.1458]); // [lng, lat] - Nagpur
  const [userLocation, setUserLocation] = useState(null);
  const [pins, setPins] = useState([]);
  const [selectedPin, setSelectedPin] = useState(null);
  const [filterType, setFilterType] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mapLoading, setMapLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapStyle, setMapStyle] = useState("Hybrid");
  const [showStylePicker, setShowStylePicker] = useState(false);

  /* ---------- INITIALIZE AWS MAP ---------- */
  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    if (!API_KEY) {
      setError('AWS Location API Key not configured');
      setMapLoading(false);
      return;
    }

    try {
      const styleUrl = `https://maps.geo.${AWS_REGION}.amazonaws.com/v2/styles/${mapStyle}/descriptor?key=${API_KEY}`;
      
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: styleUrl,
        center: mapCenter,
        zoom: 14,
      });

      map.current.on('load', () => {
        setMapLoading(false);
      });

      map.current.on('error', (e) => {
        console.error('Map error:', e);
        setError('Failed to load AWS Map');
        setMapLoading(false);
      });

      // Add navigation controls
      map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
      
      // Add scale
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

  /* ---------- CHANGE MAP STYLE ---------- */
  useEffect(() => {
    if (!map.current || mapLoading) return;
    
    const styleUrl = `https://maps.geo.${AWS_REGION}.amazonaws.com/v2/styles/${mapStyle}/descriptor?key=${API_KEY}`;
    map.current.setStyle(styleUrl);
  }, [mapStyle, mapLoading]);

  /* ---------- FETCH REAL REPORTS FROM API ---------- */
  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_AWS_API_GATEWAY_URL}/api/reports`);
      if (!res.ok) throw new Error('Failed to fetch reports');
      const data = await res.json();
      
      // Transform API data to map format
      const reportPins = (Array.isArray(data) ? data : []).map(report => ({
        id: report.report_id || report.id,
        type: report.category || report.issueType || 'Issue',
        status: report.status || 'Pending',
        department: report.department || 'General',
        priority: report.priority || 'Normal',
        description: report.description || '',
        imageUrl: report.imageUrl,
        location: {
          lat: parseFloat(report.latitude || report.location?.lat || report.lat) || 0,
          lng: parseFloat(report.longitude || report.location?.lng || report.lng) || 0,
          address: report.address || report.location?.address || 'Unknown location',
        },
        timestamp: report.createdAt || Date.now(),
        citizenId: report.citizenId,
      })).filter(p => p.location.lat !== 0 && p.location.lng !== 0);
      
      setPins(reportPins);
    } catch (err) {
      console.error("Fetch reports error:", err);
      setError("Could not load reports. Please try again.");
      setPins([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  /* ---------- GEOLOCATION ---------- */
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(loc);
          setMapCenter([loc.lng, loc.lat]);
          
          // Fly to user location
          if (map.current) {
            map.current.flyTo({ center: [loc.lng, loc.lat], zoom: 15, duration: 1500 });
          }
        },
        (err) => {
          console.log("Geolocation error:", err.message);
        }
      );
    }
  }, []);

  /* ---------- ADD USER LOCATION MARKER ---------- */
  useEffect(() => {
    if (!map.current || !userLocation) return;

    // Remove existing user marker
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
    }

    const el = document.createElement('div');
    el.innerHTML = `
      <div style="
        width: 20px;
        height: 20px;
        background-color: #3b82f6;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.3);
        animation: pulse 2s infinite;
      "></div>
    `;

    userMarkerRef.current = new maplibregl.Marker({ element: el })
      .setLngLat([userLocation.lng, userLocation.lat])
      .addTo(map.current);

  }, [userLocation, mapLoading]);

  /* ---------- FILTER ---------- */
  const filteredPins = useMemo(() => {
    return pins.filter((p) => {
      if (filterType === "all") return p.status !== "Resolved";
      if (filterType === "critical")
        return p.priority === "Critical" || p.type.includes("SOS");
      return p.type?.toLowerCase().includes(filterType);
    });
  }, [pins, filterType]);

  /* ---------- CLUSTER ---------- */
  const clusters = useMemo(() => {
    const res = [];
    const visited = new Set();

    filteredPins.forEach((p) => {
      if (visited.has(p.id)) return;

      const cluster = [p];
      visited.add(p.id);

      filteredPins.forEach((o) => {
        if (visited.has(o.id)) return;

        const d = haversineDistance(p.location, o.location);
        if (d < 300) {
          cluster.push(o);
          visited.add(o.id);
        }
      });

      res.push(cluster);
    });

    return res;
  }, [filteredPins]);

  /* ---------- ADD MARKERS TO MAP ---------- */
  useEffect(() => {
    if (!map.current || mapLoading) return;

    // Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Add markers after style is loaded
    const addMarkers = () => {
      clusters.forEach((cluster) => {
        const pin = cluster[0];
        const isCluster = cluster.length > 1;
        const color = isCluster ? '#f59e0b' : getMarkerColor(pin);

        // Create marker element
        const el = document.createElement('div');
        el.style.cssText = `
          width: ${isCluster ? '40px' : '32px'};
          height: ${isCluster ? '40px' : '32px'};
          background-color: ${color};
          border: 3px solid white;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          transition: transform 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: ${isCluster ? '14px' : '12px'};
          color: white;
          font-weight: bold;
        `;
        
        el.innerHTML = isCluster 
          ? `<span>${cluster.length}</span>`
          : `<span>${getCategoryIcon(pin.type)}</span>`;
        
        el.onmouseenter = () => el.style.transform = 'scale(1.2)';
        el.onmouseleave = () => el.style.transform = 'scale(1)';

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([pin.location.lng, pin.location.lat])
          .addTo(map.current);

        // Click handler
        el.addEventListener('click', () => {
          setSelectedPin(isCluster ? { ...pin, clusterCount: cluster.length } : pin);
          
          // Fly to location
          map.current.flyTo({
            center: [pin.location.lng, pin.location.lat],
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

  /* ---------- STATS ---------- */
  const criticalCount = pins.filter(
    (p) => p.priority === "Critical" || p.type.includes("SOS")
  ).length;

  const pendingCount = pins.filter((p) => p.status === "Pending").length;
  const resolvedCount = pins.filter((p) => p.status === "Resolved").length;

  /* ---------- CENTER ON USER ---------- */
  const centerOnUser = () => {
    if (userLocation && map.current) {
      map.current.flyTo({ 
        center: [userLocation.lng, userLocation.lat], 
        zoom: 16, 
        duration: 1000 
      });
    }
  };

  return (
    <CivicLayout noPadding>
      <div className="relative h-full w-full bg-slate-100 dark:bg-slate-900">

        {/* -------- LOADING STATE -------- */}
        {(loading || mapLoading) && (
          <div className="absolute inset-0 z-30 bg-white/80 dark:bg-slate-900/80 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-2" />
              <p className="text-slate-600 dark:text-slate-400">
                {mapLoading ? 'Loading AWS Map...' : 'Loading reports...'}
              </p>
            </div>
          </div>
        )}

        {/* -------- AWS MAP CONTAINER -------- */}
        <div ref={mapContainer} className="h-full w-full" />

        {/* -------- PULSE ANIMATION STYLE -------- */}
        <style>{`
          @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
            70% { box-shadow: 0 0 0 15px rgba(59, 130, 246, 0); }
            100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
          }
        `}</style>

        {/* -------- STATS BAR -------- */}
        <div className="absolute top-4 left-4 right-4 flex gap-3 z-10">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow flex-1 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-slate-900 dark:text-white">Live Map</h2>
                <span className="text-xs px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full font-medium">
                  AWS
                </span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">{filteredPins.length} Active Reports</p>
            </div>
            <button 
              onClick={fetchReports}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>

          <div className="hidden md:flex gap-3">
            <Stat icon={<AlertCircle className="text-red-500" />} value={criticalCount} label="Critical" />
            <Stat icon={<Clock className="text-yellow-500" />} value={pendingCount} label="Pending" />
            <Stat icon={<CheckCircle className="text-green-500" />} value={resolvedCount} label="Resolved" />
          </div>
        </div>

        {/* -------- FILTER BUTTON -------- */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="absolute top-20 left-4 bg-white dark:bg-slate-800 p-3 rounded-lg shadow z-10 hover:bg-slate-50 dark:hover:bg-slate-700"
        >
          <Filter size={20} />
        </button>

        {/* -------- MAP STYLE BUTTON -------- */}
        <button
          onClick={() => setShowStylePicker(!showStylePicker)}
          className="absolute top-32 left-4 bg-white dark:bg-slate-800 p-3 rounded-lg shadow z-10 hover:bg-slate-50 dark:hover:bg-slate-700"
          title="Change map style"
        >
          <Layers size={20} />
        </button>

        {/* -------- CENTER ON USER BUTTON -------- */}
        {userLocation && (
          <button
            onClick={centerOnUser}
            className="absolute top-20 right-4 bg-white dark:bg-slate-800 p-3 rounded-lg shadow z-10 hover:bg-slate-50 dark:hover:bg-slate-700"
            title="Center on my location"
          >
            <Navigation size={20} />
          </button>
        )}

        {/* -------- FILTER DROPDOWN -------- */}
        {showFilters && (
          <div className="absolute top-44 left-4 bg-white dark:bg-slate-800 p-2 rounded-lg shadow-xl z-10 min-w-[150px]">
            <p className="text-xs font-semibold text-slate-500 px-3 py-1">Filter by</p>
            {["all", "critical", "pothole", "garbage", "water", "traffic"].map((f) => (
              <button
                key={f}
                onClick={() => { setFilterType(f); setShowFilters(false); }}
                className={`block w-full text-left px-3 py-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700 capitalize text-sm ${
                  filterType === f ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : ''
                }`}
              >
                {f === 'all' ? 'All Reports' : f}
              </button>
            ))}
          </div>
        )}

        {/* -------- MAP STYLE PICKER -------- */}
        {showStylePicker && (
          <div className="absolute top-44 left-4 bg-white dark:bg-slate-800 p-2 rounded-lg shadow-xl z-10 min-w-[150px]">
            <p className="text-xs font-semibold text-slate-500 px-3 py-1">Map Style</p>
            {["Standard", "Monochrome", "Hybrid", "Satellite"].map((style) => (
              <button
                key={style}
                onClick={() => { setMapStyle(style); setShowStylePicker(false); }}
                className={`block w-full text-left px-3 py-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-sm ${
                  mapStyle === style ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : ''
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        )}

        {/* -------- ERROR MESSAGE -------- */}
        {error && (
          <div className="absolute bottom-24 left-4 right-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-4 rounded-lg z-10">
            {error}
            <button onClick={fetchReports} className="ml-2 underline">Retry</button>
          </div>
        )}

        {/* -------- SELECTED PIN CARD -------- */}
        {selectedPin && (
          <div className="absolute bottom-6 left-4 right-4 md:left-6 md:right-6 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-xl z-20 border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{getCategoryIcon(selectedPin.type)}</span>
                  <h3 className="font-bold text-lg capitalize text-slate-900 dark:text-white">
                    {selectedPin.type}
                  </h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    selectedPin.status === 'Resolved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    selectedPin.status === 'In Progress' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    selectedPin.priority === 'Critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  }`}>
                    {selectedPin.status}
                  </span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <MapPin size={14} />
                  {selectedPin.location.address}
                </p>
                {selectedPin.description && (
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 line-clamp-2">
                    {selectedPin.description}
                  </p>
                )}
                {selectedPin.clusterCount && (
                  <p className="text-sm text-orange-600 mt-2">
                    +{selectedPin.clusterCount - 1} more reports nearby
                  </p>
                )}
              </div>

              <button 
                onClick={() => setSelectedPin(null)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => navigate(`/report/${selectedPin.id}`)}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                View Details
              </button>
              <button
                onClick={() => {
                  const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedPin.location.lat},${selectedPin.location.lng}`;
                  window.open(url, '_blank');
                }}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Navigation size={16} />
                Navigate
              </button>
            </div>
          </div>
        )}

        {/* -------- LEGEND -------- */}
        <div className="absolute bottom-6 right-4 bg-white dark:bg-slate-800 p-3 rounded-lg shadow z-10 text-xs hidden md:block">
          <p className="font-semibold mb-2">Legend</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div> Critical/SOS</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div> Pending</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500"></div> In Progress</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"></div> Resolved</div>
          </div>
        </div>
      </div>
    </CivicLayout>
  );
};

const Stat = ({ icon, value, label }) => (
  <div className="bg-white dark:bg-slate-800 px-4 py-3 rounded-lg shadow flex items-center gap-3">
    {icon}
    <div>
      <div className="text-xl font-bold text-slate-900 dark:text-white">{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  </div>
);

export default LiveMap;