import React, { useState, useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  CircleMarker,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

import {
  MapPin,
  X,
  Navigation,
  Filter,
  AlertCircle,
  Clock,
  CheckCircle,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import CivicLayout from "./CivicLayout";
import { useTheme } from "../../context/ThemeContext";

/* ---------------- MOCK REPORT DATA ---------------- */
const mockPins = [
  {
    id: "1",
    type: "pothole",
    status: "Pending",
    department: "Road",
    priority: "Normal",
    location: {
      lat: 21.1458,
      lng: 79.0882,
      address: "Main Road, Nagpur",
    },
    timestamp: Date.now(),
  },
  {
    id: "2",
    type: "garbage",
    status: "Pending",
    department: "Sanitation",
    priority: "Normal",
    location: {
      lat: 21.1465,
      lng: 79.089,
      address: "Market Area",
    },
    timestamp: Date.now(),
  },
  {
    id: "3",
    type: "SOS Emergency",
    status: "Pending",
    department: "Police",
    priority: "Critical",
    location: {
      lat: 21.147,
      lng: 79.087,
      address: "City Center",
    },
    timestamp: Date.now(),
  },
];

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
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [mapCenter, setMapCenter] = useState([21.1458, 79.0882]);
  const [pins, setPins] = useState([]);
  const [selectedPin, setSelectedPin] = useState(null);
  const [filterType, setFilterType] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  /* ---------- LOAD MOCK ---------- */
  useEffect(() => {
    setPins(mockPins);
  }, []);

  /* ---------- GEOLOCATION ---------- */
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition((pos) => {
      setMapCenter([pos.coords.latitude, pos.coords.longitude]);
    });
  }, []);

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

  /* ---------- STATS ---------- */
  const criticalCount = pins.filter(
    (p) => p.priority === "Critical" || p.type.includes("SOS")
  ).length;

  const pendingCount = pins.filter((p) => p.status === "Pending").length;
  const resolvedCount = pins.filter((p) => p.status === "Resolved").length;

  return (
    <CivicLayout noPadding>
      <div className="relative h-full w-full bg-slate-100 dark:bg-slate-900">

        {/* -------- MAP -------- */}
        <MapContainer
          center={mapCenter}
          zoom={15}
          className="h-full w-full z-0"
        >
          <TileLayer
            url={
              theme === "dark"
                ? "https://tiles.stadiamaps.com/tiles/alidade_dark/{z}/{x}/{y}{r}.png"
                : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            }
          />

          {/* USER */}
          <CircleMarker center={mapCenter} radius={10} pathOptions={{ color: "#3b82f6" }} />

          {/* PINS */}
          {clusters.map((cluster, i) => {
            const pin = cluster[0];

            if (cluster.length > 1) {
              return (
                <CircleMarker
                  key={i}
                  center={[pin.location.lat, pin.location.lng]}
                  radius={18}
                  pathOptions={{ color: "orange" }}
                  eventHandlers={{
                    click: () => setSelectedPin(pin),
                  }}
                />
              );
            }

            return (
              <Marker
                key={pin.id}
                position={[pin.location.lat, pin.location.lng]}
                eventHandlers={{
                  click: () => setSelectedPin(pin),
                }}
              />
            );
          })}
        </MapContainer>

        {/* -------- STATS BAR -------- */}
        <div className="absolute top-4 left-4 right-4 flex gap-3 z-10">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow flex-1">
            <h2 className="font-bold">Live Map</h2>
            <p className="text-sm">{filteredPins.length} Active Reports</p>
          </div>

          <div className="hidden md:flex gap-3">
            <Stat icon={<AlertCircle />} value={criticalCount} label="Critical" />
            <Stat icon={<Clock />} value={pendingCount} label="Pending" />
            <Stat icon={<CheckCircle />} value={resolvedCount} label="Resolved" />
          </div>
        </div>

        {/* -------- FILTER -------- */}
        {showFilters && (
          <div className="absolute top-24 left-4 bg-white p-4 rounded-lg shadow z-10">
            {["all", "critical", "pothole", "garbage"].map((f) => (
              <button
                key={f}
                onClick={() => setFilterType(f)}
                className="block w-full text-left px-3 py-2 hover:bg-slate-100"
              >
                {f}
              </button>
            ))}
          </div>
        )}

        {/* -------- PIN CARD -------- */}
        {selectedPin && (
          <div className="absolute bottom-6 left-6 right-6 bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl z-20">
            <div className="flex justify-between">
              <div>
                <h3 className="font-bold capitalize">
                  {selectedPin.type}
                </h3>
                <p className="text-sm text-slate-500">
                  {selectedPin.location.address}
                </p>
              </div>

              <button onClick={() => setSelectedPin(null)}>
                <X />
              </button>
            </div>

            <button
              onClick={() => navigate("/civic/report")}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
            >
              Details
            </button>
          </div>
        )}
      </div>
    </CivicLayout>
  );
};

const Stat = ({ icon, value, label }) => (
  <div className="bg-white dark:bg-slate-800 px-4 py-3 rounded-lg shadow flex items-center gap-2">
    {icon}
    <div>
      <div className="text-xl font-bold">{value}</div>
      <div className="text-xs">{label}</div>
    </div>
  </div>
);

export default LiveMap;