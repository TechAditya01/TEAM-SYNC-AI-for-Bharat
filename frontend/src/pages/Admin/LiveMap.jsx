import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import {
    GoogleMap,
    Marker,
    useJsApiLoader,
    InfoWindow,
    OverlayView
} from "@react-google-maps/api";
import { GOOGLE_MAPS_API_KEY } from "../../mapsConfig";
import { MapPin, AlertTriangle, Clock, ChevronRight } from "lucide-react";

const libraries = ["places"];

/* ---------------- MOCK INCIDENTS ---------------- */
const mockIncidents = [
    {
        id: "123456",
        userName: "Rahul",
        type: "Garbage",
        priority: "High",
        status: "Pending",
        description: "Garbage pile near road",
        createdAt: Date.now(),
        imageUrl: "https://placehold.co/100",
        location: { lat: 22.5726, lng: 88.3639 }
    },
    {
        id: "654321",
        userName: "Amit",
        type: "Water Leak",
        priority: "Normal",
        status: "Resolved",
        description: "Water leakage",
        createdAt: Date.now(),
        imageUrl: "https://placehold.co/100",
        location: { lat: 22.574, lng: 88.365 }
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

const AdminMap = () => {
    const [incidents, setIncidents] = useState([]);
    const [selectedIncident, setSelectedIncident] = useState(null);
    const [selectedCluster, setSelectedCluster] = useState(null);
    const [center, setCenter] = useState({ lat: 22.5726, lng: 88.3639 });

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
        libraries
    });

    /* -------- LOAD DATA (API later) -------- */
    useEffect(() => {
        // replace with GET /api/reports
        setTimeout(() => {
            setIncidents(mockIncidents);
            if (mockIncidents.length) setCenter(mockIncidents[0].location);
        }, 400);
    }, []);

    /* -------- CLUSTERING -------- */
    const clusters = React.useMemo(() => {
        const clustered = [];
        const visited = new Set();

        incidents.forEach(i => {
            if (visited.has(i.id)) return;

            const cluster = [i];
            visited.add(i.id);

            incidents.forEach(o => {
                if (visited.has(o.id)) return;
                if (!i.location || !o.location) return;

                if (haversineDistance(i.location, o.location) <= 300) {
                    cluster.push(o);
                    visited.add(o.id);
                }
            });

            clustered.push(cluster);
        });

        return clustered;
    }, [incidents]);

    if (!isLoaded)
        return <div className="h-full flex items-center justify-center" />;

    return (
        <AdminLayout>
            <div className="h-[calc(100vh-150px)] flex flex-col gap-6">
                <div>
                    <h1 className="text-2xl font-bold">Department Live Monitor</h1>
                    <p className="text-sm text-slate-500">
                        Geospatial view of incidents
                    </p>
                </div>

                <div className="flex-1 rounded-3xl border overflow-hidden relative">
                    <GoogleMap
                        mapContainerStyle={{ width: "100%", height: "100%" }}
                        center={center}
                        zoom={13}
                    >
                        {clusters.map((cluster, idx) => {
                            const main = cluster[0];
                            const isCluster = cluster.length > 1;

                            if (isCluster) {
                                return (
                                    <OverlayView
                                        key={idx}
                                        position={main.location}
                                        mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                                    >
                                        <div
                                            className="relative w-10 h-10 bg-red-600 rounded-full text-white flex items-center justify-center cursor-pointer"
                                            onClick={() => setSelectedCluster(cluster)}
                                        >
                                            {cluster.length}

                                            {/* Cluster tooltip */}
                                            {selectedCluster === cluster && (
                                                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-64 bg-black text-white p-3 rounded-xl">
                                                    <div className="text-xs font-bold mb-2">
                                                        {cluster.length} Issues
                                                    </div>

                                                    {cluster.map(i => (
                                                        <Link
                                                            key={i.id}
                                                            to={`/admin/incident/${i.id}`}
                                                            className="flex gap-2 items-center py-1 text-xs hover:underline"
                                                        >
                                                            <MapPin size={12} />
                                                            {i.type}
                                                            <ChevronRight size={12} />
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </OverlayView>
                                );
                            }

                            return (
                                <Marker
                                    key={main.id}
                                    position={main.location}
                                    onClick={() => setSelectedIncident(main)}
                                    icon={{
                                        url:
                                            main.status === "Resolved"
                                                ? "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
                                                : "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
                                    }}
                                />
                            );
                        })}

                        {/* InfoWindow */}
                        {selectedIncident && (
                            <InfoWindow
                                position={selectedIncident.location}
                                onCloseClick={() => setSelectedIncident(null)}
                            >
                                <div className="p-2 w-60">
                                    <div className="font-bold text-sm">
                                        {selectedIncident.type}
                                    </div>

                                    <div className="text-xs text-slate-500 italic">
                                        {selectedIncident.description}
                                    </div>

                                    <div className="flex justify-between mt-2 text-[10px] text-slate-400">
                                        <div className="flex gap-1 items-center">
                                            <Clock size={10} />
                                            {new Date(
                                                selectedIncident.createdAt
                                            ).toLocaleDateString()}
                                        </div>

                                        <Link
                                            to={`/admin/incident/${selectedIncident.id}`}
                                            className="text-blue-600 font-bold"
                                        >
                                            Details
                                        </Link>
                                    </div>
                                </div>
                            </InfoWindow>
                        )}
                    </GoogleMap>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminMap;