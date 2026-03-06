import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft, MapPin, CheckCircle, XCircle,
    AlertTriangle, Calendar, ExternalLink,
    Sparkles, Shield, Clock, Send, Bell
} from "lucide-react";
import AdminLayout from "./AdminLayout";
import { toast } from "react-hot-toast";
import { getReportById, updateReportStatus } from "../../services/backendService";

/* ---------------- MOCK DATA ---------------- */
const mockReports = [
    {
        id: "12345678",
        category: "Garbage",
        department: "Sanitation",
        status: "Pending",
        createdAt: Date.now(),
        aiConfidence: 88,
        aiAnalysis: "Garbage pile detected near road",
        userName: "Rahul",
        description: "Large garbage pile",
        imageUrl: "https://placehold.co/800x450",
        location: {
            lat: 22.5726,
            lng: 88.3639,
            address: "Sector 4, City"
        }
    }
];

const IncidentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);

    const cleanId = id?.startsWith("RPT-")
        ? id.replace("RPT-", "")
        : id;

    /* ---------------- LOAD REPORT ---------------- */
    useEffect(() => {
        if (!cleanId) return;

        const fetchReport = async () => {
            try {
                setLoading(true);
                const data = await getReportById(cleanId);
                // Map API data back to UI expected names
                setReport({
                    id: data.report_id || cleanId,
                    category: data.type || "General",
                    department: data.department || "General",
                    status: data.status || "Pending",
                    createdAt: data.createdAt || data.timestamp || Date.now(),
                    aiConfidence: data.aiConfidence || data.aiAnalysis?.confidence || 0,
                    aiAnalysis: data.aiAnalysis?.description || data.description || "AI analysis complete.",
                    userName: data.userName || "Citizen",
                    description: data.description || "",
                    imageUrl: data.mediaUrl || "https://placehold.co/800x450",
                    location: data.location || { lat: 21.1458, lng: 79.0882, address: "Unknown location" }
                });
            } catch (error) {
                console.error("Error fetching report:", error);
                toast.error("Failed to load report details from server");
                setReport(null);
            } finally {
                setLoading(false);
            }
        };

        fetchReport();
    }, [cleanId]);

    /* ---------------- ACTION ---------------- */
    const handleAction = async (newStatus) => {
        const statusLabel =
            newStatus === "Rejected"
                ? "Rejected - Unconventional Report"
                : newStatus;

        try {
            await updateReportStatus(cleanId, statusLabel, `Status changed to ${statusLabel}`);

            setReport(prev => ({
                ...prev,
                status: statusLabel
            }));

            toast.success(`Report ${newStatus}`);

            if (newStatus === "Accepted") {
                navigate("/admin/broadcast", {
                    state: { incidentId: cleanId }
                });
            }
        } catch (error) {
            console.error("Failed to update status", error);
            toast.error("Failed to update report status");
        }
    };

    /* ---------------- LOADING ---------------- */
    if (loading)
        return (
            <AdminLayout>
                <div className="flex flex-col items-center justify-center h-full gap-4">
                    <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                        Loading Intelligence...
                    </p>
                </div>
            </AdminLayout>
        );

    /* ---------------- NOT FOUND ---------------- */
    if (!report)
        return (
            <AdminLayout>
                <div className="text-center mt-20">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                        <AlertTriangle size={40} />
                    </div>
                    <h2 className="text-2xl font-black mb-2">
                        Report Not Found
                    </h2>
                    <button
                        onClick={() => navigate(-1)}
                        className="mt-8 px-6 py-3 bg-slate-900 text-white font-bold rounded-xl"
                    >
                        Return
                    </button>
                </div>
            </AdminLayout>
        );

    /* ---------------- UI ---------------- */
    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto pb-20">

                {/* HEADER */}
                <div className="flex flex-col md:flex-row justify-between gap-6 mb-10">
                    <div className="flex items-center gap-5">
                        <button
                            onClick={() => navigate(-1)}
                            className="w-12 h-12 flex items-center justify-center bg-white border rounded-2xl"
                        >
                            <ArrowLeft size={20} />
                        </button>

                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-3xl font-black">
                                    Report #{cleanId}
                                </h1>
                                <span className="px-2 py-1 bg-orange-50 text-orange-600 rounded text-xs font-bold">
                                    {report.status || "Active"}
                                </span>
                            </div>

                            <div className="flex gap-4 text-xs text-slate-400">
                                <span className="flex gap-1 items-center">
                                    <Calendar size={14} />
                                    {new Date(report.createdAt).toLocaleDateString()}
                                </span>
                                <span className="flex gap-1 items-center text-blue-500">
                                    <Shield size={14} />
                                    {report.department}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button className="px-5 py-3 bg-white border rounded-2xl text-xs font-bold flex gap-2">
                            <ExternalLink size={16} /> Export
                        </button>
                        <button className="px-5 py-3 bg-blue-600 text-white rounded-2xl text-xs font-bold flex gap-2">
                            <Bell size={16} /> Notify
                        </button>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">

                    {/* LEFT */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* IMAGE */}
                        <div className="bg-white rounded-3xl p-6 border">
                            <img
                                src={report.imageUrl}
                                className="w-full rounded-2xl"
                                alt=""
                            />
                            <div className="mt-4 text-xs text-slate-500 flex gap-2">
                                <MapPin size={14} />
                                {report.location?.lat}, {report.location?.lng}
                            </div>
                        </div>

                        {/* LOCATION */}
                        <div className="bg-white rounded-3xl p-6 border">
                            <h4 className="text-xs font-bold text-slate-400 mb-2">
                                Location
                            </h4>
                            <div className="font-bold">
                                {report.location?.address}
                            </div>
                        </div>

                        {/* REPORTER */}
                        <div className="bg-white rounded-3xl p-6 border">
                            <h4 className="text-xs font-bold text-slate-400 mb-2">
                                Reporter
                            </h4>
                            <div className="font-bold">
                                {report.userName}
                            </div>
                        </div>

                    </div>

                    {/* RIGHT */}
                    <div className="space-y-8">

                        {/* AI */}
                        <div className="bg-blue-600 text-white rounded-3xl p-6">
                            <div className="flex gap-2 items-center mb-3">
                                <Sparkles size={16} />
                                AI Analysis
                            </div>
                            <div className="text-sm">
                                {report.aiAnalysis}
                            </div>
                            <div className="mt-2 text-xs">
                                Confidence: {report.aiConfidence}%
                            </div>
                        </div>

                        {/* ACTION */}
                        <div className="bg-white rounded-3xl p-6 border space-y-4">
                            {(!report.status || report.status === "Pending") && (
                                <>
                                    <button
                                        onClick={() => handleAction("Accepted")}
                                        className="w-full py-3 bg-slate-900 text-white rounded-xl flex justify-center gap-2"
                                    >
                                        <CheckCircle size={16} />
                                        Approve
                                    </button>

                                    <button
                                        onClick={() => handleAction("Rejected")}
                                        className="w-full py-3 border text-red-600 rounded-xl flex justify-center gap-2"
                                    >
                                        <XCircle size={16} />
                                        Reject
                                    </button>
                                </>
                            )}

                            {report.status === "Accepted" && (
                                <>
                                    <button
                                        onClick={() => handleAction("Resolved")}
                                        className="w-full py-3 bg-green-600 text-white rounded-xl flex justify-center gap-2"
                                    >
                                        <CheckCircle size={16} />
                                        Resolve
                                    </button>

                                    <button
                                        onClick={() =>
                                            navigate("/admin/broadcast", {
                                                state: { incidentId: cleanId }
                                            })
                                        }
                                        className="w-full py-3 bg-indigo-600 text-white rounded-xl flex justify-center gap-2"
                                    >
                                        <Send size={16} />
                                        Broadcast
                                    </button>
                                </>
                            )}
                        </div>

                        {/* TIMELINE */}
                        <div className="bg-white rounded-3xl p-6 border">
                            <h4 className="text-xs font-bold text-slate-400 mb-4 flex gap-2">
                                <Clock size={14} /> Timeline
                            </h4>
                            <div className="text-xs text-slate-500">
                                Created: {new Date(report.createdAt).toLocaleTimeString()}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default IncidentDetail;