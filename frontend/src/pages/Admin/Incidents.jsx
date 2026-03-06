import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import {
    Search, Filter, MapPin, Calendar,
    ExternalLink, ArrowRight, List, Grid, Loader2
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getAllReports } from "../../services/backendService";
import { toast } from "react-hot-toast";

const STATUS_COLORS = {
    Pending: "bg-orange-50 text-orange-600",
    Accepted: "bg-blue-50 text-blue-600",
    Resolved: "bg-green-50 text-green-600",
    Rejected: "bg-red-50 text-red-600",
};

const IncidentList = () => {
    const { user } = useAuth();
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [viewMode, setViewMode] = useState("grid");

    /* ---------------- LOAD FROM API ---------------- */
    useEffect(() => {
        if (!user) return;

        const fetchIncidents = async () => {
            try {
                setLoading(true);
                const data = await getAllReports({
                    department: user.department,
                    municipality: user.municipality || ""
                });

                const list = Array.isArray(data) ? data : (data.reports || []);
                setIncidents(list.map(r => ({
                    id: r.report_id || r.id,
                    userName: r.userName || "Citizen",
                    category: r.type || r.category || "General",
                    priority: r.priority || "Normal",
                    status: r.status || "Pending",
                    description: r.description || "No description provided",
                    createdAt: r.createdAt || r.timestamp || Date.now(),
                    imageUrl: r.mediaUrl || 'https://placehold.co/600x400/e2e8f0/94a3b8?text=No+Image',
                    location: r.location || {},
                })));
            } catch (err) {
                console.error('Failed to load incidents:', err);
                toast.error("Failed to load incidents");
            } finally {
                setLoading(false);
            }
        };

        fetchIncidents();
    }, [user]);

    /* ---------------- FILTER ---------------- */
    const filteredIncidents = incidents.filter(i => {
        const matchesSearch =
            i.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            i.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            i.category?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
            statusFilter === "All" || i.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    return (
        <AdminLayout>
            <div className="space-y-6">

                {/* HEADER */}
                <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black">
                            Incident Repository
                        </h1>
                        <p className="text-sm text-slate-500">
                            Archive & active reports
                        </p>
                    </div>

                    <div className="flex gap-2 bg-white p-1 rounded-xl border">
                        <button
                            onClick={() => setViewMode("grid")}
                            className={`p-2 rounded-lg ${viewMode === "grid"
                                ? "bg-blue-600 text-white"
                                : "text-slate-400"
                                }`}
                        >
                            <Grid size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode("list")}
                            className={`p-2 rounded-lg ${viewMode === "list"
                                ? "bg-blue-600 text-white"
                                : "text-slate-400"
                                }`}
                        >
                            <List size={18} />
                        </button>
                    </div>
                </div>

                {/* FILTERS */}
                <div className="flex flex-wrap gap-4 bg-white p-5 rounded-3xl border">
                    <div className="flex-1 min-w-[260px] relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search ID, user, category..."
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-2xl"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2 bg-slate-50 px-4 py-3 rounded-2xl">
                        <Filter size={16} className="text-slate-400" />
                        <select
                            className="bg-transparent text-xs font-bold"
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                        >
                            <option>All</option>
                            <option>Pending</option>
                            <option>Accepted</option>
                            <option>Resolved</option>
                            <option>Rejected - Unconventional Report</option>
                        </select>
                    </div>
                </div>

                {/* GRID VIEW */}
                {viewMode === "grid" ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {loading && (
                            <div className="col-span-3 flex justify-center py-20">
                                <Loader2 className="animate-spin text-blue-600" size={36} />
                            </div>
                        )}
                        {!loading && filteredIncidents.map(incident => (
                            <div
                                key={incident.id}
                                className="bg-white rounded-3xl border overflow-hidden flex flex-col hover:shadow-xl transition"
                            >
                                {/* IMAGE */}
                                <div className="h-48 overflow-hidden">
                                    <img
                                        src={incident.imageUrl}
                                        className="w-full h-full object-cover"
                                        alt=""
                                        onError={e => { e.target.src = 'https://placehold.co/600x400/e2e8f0/94a3b8?text=No+Image'; }}
                                    />
                                </div>

                                {/* INFO */}
                                <div className="p-6 flex flex-col flex-1">
                                    <div className="flex justify-between mb-3">
                                        <div>
                                            <div className="text-[10px] font-bold text-blue-600">
                                                #{incident.id}
                                            </div>
                                            <div className="font-bold">
                                                {incident.userName}
                                            </div>
                                        </div>

                                        <div className={`text-xs px-2 py-1 rounded ${STATUS_COLORS[incident.status] || 'bg-slate-50 text-slate-600'}`}>
                                            {incident.status}
                                        </div>
                                    </div>

                                    <p className="text-xs text-slate-500 mb-4 italic">
                                        {incident.description}
                                    </p>

                                    <div className="text-xs text-slate-500 flex gap-2 mb-6">
                                        <MapPin size={14} />
                                        {incident.location?.address || 'Location not set'}
                                    </div>

                                    <div className="mt-auto flex justify-between items-center">
                                        <Link
                                            to={`/admin/incidents/${incident.id}`}
                                            className="text-xs font-bold flex gap-1 items-center"
                                        >
                                            View <ArrowRight size={14} />
                                        </Link>

                                        <ExternalLink size={16} className="text-slate-400" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* LIST VIEW */
                    <div className="bg-white rounded-3xl border overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-xs font-bold text-slate-400">
                                <tr>
                                    <th className="px-6 py-4">Incident</th>
                                    <th className="px-6 py-4">Reporter</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Priority</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredIncidents.map(incident => (
                                    <tr key={incident.id} className="border-t">
                                        <td className="px-6 py-4">
                                            <div className="flex gap-3 items-center">
                                                <img
                                                    src={incident.imageUrl}
                                                    className="w-10 h-10 rounded object-cover"
                                                    alt=""
                                                />
                                                <div>
                                                    <div className="font-bold text-xs">
                                                        {incident.category}
                                                    </div>
                                                    <div className="text-[10px] text-slate-400">
                                                        #{incident.id}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-sm">
                                            {incident.userName}
                                        </td>

                                        <td className="px-6 py-4 text-xs">
                                            {incident.status}
                                        </td>

                                        <td className="px-6 py-4 text-xs">
                                            {incident.priority}
                                        </td>

                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                to={`/admin/incidents/${incident.id}`}
                                                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-bold"
                                            >
                                                Review
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* EMPTY */}
                {filteredIncidents.length === 0 && !loading && (
                    <div className="py-20 text-center text-slate-400">
                        No matching reports
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default IncidentList;