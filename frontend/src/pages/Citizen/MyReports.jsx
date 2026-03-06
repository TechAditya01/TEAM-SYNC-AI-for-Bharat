import React, { useState, useEffect } from "react";
import {
  FileText,
  MapPin,
  Calendar,
  ArrowRight,
  Search,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";
import CivicLayout from "./CivicLayout";
import { useAuth } from "../../context/AuthContext";

const MyReports = () => {
  const { user } = useAuth();
  const [filter, setFilter] = useState("All");
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  /* ---------- USER FROM AUTH CONTEXT ---------- */
  const userId = user?.sub || localStorage.getItem("uid") || "";

  useEffect(() => {
    if (!userId) return;

    const fetchReports = async () => {
      const API_BASE_URL =
        import.meta.env.VITE_AWS_API_GATEWAY_URL || "";

      const url = `${API_BASE_URL}/api/reports/user/${userId}`;
      console.log("Fetching reports from:", url);
      console.log("UserId:", userId);

      try {
        const res = await fetch(url);
        console.log("Response status:", res.status);
        const data = await res.json();
        console.log("Raw API Response:", data);

        if (res.ok && data.reports) {
          console.log(`Found ${data.reports.length} reports`);
          
          // Log each report's media information
          data.reports.forEach((r, index) => {
            console.log(`Report ${index + 1}:`, {
              id: r.id,
              type: r.type,
              mediaUrl: r.mediaUrl,
              imageUrl: r.imageUrl,
              videoUrl: r.videoUrl,
              audioUrl: r.audioUrl,
              mediaType: r.mediaType
            });
          });
          
          setReports(
            data.reports.map((r) => ({
              id: r.id,
              type: r.type,
              location:
                r.location?.address ||
                `${r.location?.lat?.toFixed(4)}, ${r.location?.lng?.toFixed(
                  4
                )}`,
              date: new Date(r.createdAt || r.timestamp).toLocaleString(),
              status: r.status,
              severity: r.priority || "Normal",
              department: r.department || "General",
              mediaType: r.mediaType || "image",
              mediaUrl: r.mediaUrl || r.imageUrl || null,
              imageUrl: r.imageUrl || r.mediaUrl || null,
              videoUrl: r.videoUrl || r.mediaUrl || null,
              audioUrl: r.audioUrl || r.mediaUrl || null,
            }))
          );
        } else {
          console.log("No reports found or error in response");
          setReports([]);
        }
      } catch (e) {
        console.error("Fetch reports error:", e);
        setReports([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [userId]);

  /* ---------- FILTER ---------- */
  const filteredReports = reports.filter((r) => {
    const matchesFilter = filter === "All" || r.status === filter;
    const matchesSearch =
      r.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  /* ---------- STATS ---------- */
  const stats = {
    total: reports.length,
    pending: reports.filter((r) => r.status === "Pending").length,
    resolved: reports.filter(
      (r) => r.status === "Resolved" || r.status === "Accepted"
    ).length,
    inProgress: reports.filter((r) => r.status === "In Progress").length,
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "Pending":
        return {
          bg: "bg-blue-100",
          text: "text-blue-600",
          border: "border-blue-200",
          icon: <Clock size={14} />,
        };
      case "Resolved":
      case "Accepted":
        return {
          bg: "bg-blue-100",
          text: "text-blue-600",
          border: "border-blue-200",
          icon: <CheckCircle size={14} />,
        };
      case "In Progress":
        return {
          bg: "bg-blue-100",
          text: "text-blue-600",
          border: "border-blue-200",
          icon: <Loader2 size={14} className="animate-spin" />,
        };
      case "Rejected - Unconventional Report":
        return {
          bg: "bg-red-100",
          text: "text-red-600",
          border: "border-red-200",
          icon: <AlertCircle size={14} />,
        };
      default:
        return {
          bg: "bg-slate-100",
          text: "text-slate-600",
          border: "border-slate-200",
          icon: <FileText size={14} />,
        };
    }
  };

  return (
    <CivicLayout>
      {/* Header */}
      <div className="flex justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="p-3 bg-blue-600 rounded-lg">
              <FileText size={28} className="text-white" />
            </div>
            My Reports
          </h1>
          <p className="text-slate-500 ml-16">
            Track and manage your civic issue submissions
          </p>
        </div>

        <Link
          to="/report"
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg"
        >
          <Plus size={20} /> New Report
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total" value={stats.total} />
        <StatCard label="Pending" value={stats.pending} />
        <StatCard label="In Progress" value={stats.inProgress} />
        <StatCard label="Resolved" value={stats.resolved} />
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          placeholder="Search reports"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-3 border rounded-lg"
        />
      </div>

      {/* List */}
      {!userId && !loading && (
        <div className="text-center py-10 bg-yellow-50 rounded-lg">
          <p className="text-yellow-700">Please log in to view your reports.</p>
          <p className="text-sm text-yellow-600 mt-2">User ID not found. Try logging out and back in.</p>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin" size={40} />
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">No reports found.</p>
          <Link
            to="/report"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            <Plus size={18} /> Create Your First Report
          </Link>
        </div>
      ) : (
        filteredReports.map((report) => {
          const statusConfig = getStatusConfig(report.status);
          return (
            <div
              key={report.id}
              className="bg-white p-6 rounded-lg border mb-4"
            >
              <div className="flex justify-between">
                <div>
                  <h3 className="font-bold text-lg">{report.type}</h3>

                  <div className="flex gap-2 mt-1 text-sm text-slate-500">
                    <MapPin size={14} />
                    {report.location}
                  </div>

                  <div className="text-xs mt-1 text-slate-400">
                    {report.date}
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-lg text-xs font-semibold ${statusConfig.bg} ${statusConfig.text}`}
                  >
                    {statusConfig.icon}
                    {report.status}
                  </span>
                </div>

                <Link
                  to={`/report/${report.id}`}
                  className="p-3 bg-slate-100 rounded-lg"
                >
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          );
        })
      )}
    </CivicLayout>
  );
};

const StatCard = ({ label, value }) => (
  <div className="bg-white rounded-lg p-6 border">
    <div className="text-sm text-slate-500">{label}</div>
    <div className="text-3xl font-bold">{value}</div>
  </div>
);

export default MyReports;