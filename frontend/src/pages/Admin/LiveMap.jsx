import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import { MapPin, AlertTriangle, Clock, ChevronRight } from "lucide-react";

// Import our AWS Location Service Map component
import AWSMapView from "../../components/maps/AWSMapView";

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
        location: { lat: 21.1458, lng: 79.0882 } // Nagpur default
    },
    {
        id: "654321",
        userName: "Amit",
        type: "Water Leak",
        priority: "Normal",
        status: "Resolved",
        description: "Water leakage in sector 4",
        createdAt: Date.now() - 86400000,
        imageUrl: "https://placehold.co/100",
        location: { lat: 21.1470, lng: 79.0895 }
    }
];

const AdminMap = () => {
    const [incidents, setIncidents] = useState([]);
    const [selectedIncident, setSelectedIncident] = useState(null);
    const [center, setCenter] = useState([79.0882, 21.1458]); // [lng, lat]

    /* -------- LOAD DATA (API later) -------- */
    useEffect(() => {
        // replace with GET /api/reports
        setTimeout(() => {
            setIncidents(mockIncidents);
            if (mockIncidents.length) {
                // Set center using the first incident's location
                setCenter([mockIncidents[0].location.lng, mockIncidents[0].location.lat]);
            }
        }, 400);
    }, []);

    // Format incidents to markers for the AWSMapView component
    const mapMarkers = incidents.map(incident => ({
        lat: incident.location.lat,
        lng: incident.location.lng,
        title: incident.type,
        description: incident.description,
        color: incident.status === "Resolved" ? "#22c55e" : "#ef4444", // green/red
        category: incident.type,
        data: incident // payload to pass back on click
    }));

    return (
        <AdminLayout>
            <div className="h-[calc(100vh-150px)] flex flex-col gap-6">
                <div>
                    <h1 className="text-2xl font-bold">Department Live Monitor</h1>
                    <p className="text-sm text-slate-500">
                        Geospatial view of active civic issues (AWS Location Services)
                    </p>
                </div>

                <div className="flex-1 flex gap-4 overflow-hidden">
                    {/* Map Area */}
                    <div className="flex-1 rounded-3xl border overflow-hidden relative bg-slate-100">
                        <AWSMapView
                            center={center}
                            zoom={14}
                            markers={mapMarkers}
                            onMarkerClick={(incident) => setSelectedIncident(incident)}
                            style="Standard"
                        />
                    </div>

                    {/* Sidebar / details panel could hook into selectedIncident here, if you want something prominent */}
                    {selectedIncident && (
                        <div className="w-80 bg-white rounded-3xl border p-6 flex flex-col shadow-sm">
                            <h3 className="font-bold text-lg mb-2 flex gap-2 items-center">
                                <AlertTriangle className={selectedIncident.status === "Resolved" ? "text-green-500" : "text-red-500"} size={20} />
                                {selectedIncident.type}
                            </h3>
                            <span className="text-xs font-semibold px-2 py-1 bg-slate-100 rounded-md w-max mb-4">
                                {selectedIncident.status}
                            </span>

                            <p className="text-sm text-slate-600 mb-6 flex-1">
                                {selectedIncident.description}
                            </p>

                            <div className="text-xs text-slate-400 font-medium flex gap-2 mb-4 items-center">
                                <Clock size={14} />
                                {new Date(selectedIncident.createdAt).toLocaleString()}
                            </div>

                            <Link
                                to={`/admin/incident/${selectedIncident.id}`}
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
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminMap;