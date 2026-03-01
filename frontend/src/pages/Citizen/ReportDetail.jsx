import React from "react";
import {
  MapPin,
  Clock,
  Share2,
  CheckCircle,
  AlertTriangle,
  ThumbsUp,
  ExternalLink,
} from "lucide-react";
import { useParams } from "react-router-dom";
import CivicLayout from "./CivicLayout";

import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const ReportDetail = () => {
  const { id } = useParams();
  const [report, setReport] = React.useState(null);

  /* -------- FETCH REPORT -------- */
  React.useEffect(() => {
    const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

    fetch(`${API}/api/reports/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data.report) return;

        const r = data.report;
        const ts = r.createdAt || r.timestamp;

        setReport({
          ...r,
          ticketId: r.id
            ? `#${r.id.slice(-6).toUpperCase()}`
            : "#UNKNOWN",
          address: r.location?.address || "Address unavailable",
          lat: parseFloat(r.location?.lat || 0),
          lng: parseFloat(r.location?.lng || 0),
          timeFormatted: new Date(ts).toLocaleString(),
          timeline: [
            {
              title: "Report Submitted",
              time: new Date(ts).toLocaleString(),
              active: true,
              current: r.status === "Pending",
            },
            {
              title: "In Progress",
              time:
                r.status !== "Pending"
                  ? "Verified by Admin"
                  : "Pending Review",
              active: r.status !== "Pending",
              current: r.status === "In Progress",
            },
            {
              title: "Resolved",
              time:
                r.status === "Resolved"
                  ? "Issue Fixed"
                  : "Waiting",
              active: r.status === "Resolved",
              current: r.status === "Resolved",
            },
          ],
        });
      });
  }, [id]);

  if (!report)
    return <div className="text-center p-10">Loading...</div>;

  return (
    <CivicLayout noPadding>
      <div className="bg-white rounded-[2.5rem] overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">

          {/* LEFT */}
          <div className="h-[400px] lg:h-auto flex flex-col">

            {/* IMAGE */}
            <div className="h-1/2">
              <img
                src={report.imageUrl}
                className="w-full h-full object-cover"
              />
            </div>

            {/* MAP (Leaflet) */}
            <div className="h-1/2">
              {report.lat !== 0 ? (
                <MapContainer
                  center={[report.lat, report.lng]}
                  zoom={15}
                  style={{ width: "100%", height: "100%" }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[report.lat, report.lng]} />
                </MapContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  No location
                </div>
              )}

              {/* Open OSM */}
              <a
                href={`https://www.openstreetmap.org/?mlat=${report.lat}&mlon=${report.lng}`}
                target="_blank"
                rel="noreferrer"
                className="absolute bottom-4 right-4 bg-white px-3 py-2 rounded-xl text-xs font-bold flex gap-2"
              >
                <ExternalLink size={14} /> Open Map
              </a>
            </div>
          </div>

          {/* RIGHT */}
          <div className="p-8 flex flex-col">

            <h1 className="text-3xl font-bold mb-2">
              {report.type}
            </h1>

            <div className="flex gap-2 text-slate-500 mb-6">
              <MapPin size={18} /> {report.address}
            </div>

            {/* AI */}
            <div className="bg-blue-50 p-4 rounded-xl mb-6">
              <b>AI Analysis</b>
              <p className="text-sm mt-2">
                {report.aiAnalysis || "No AI analysis"}
              </p>
            </div>

            {/* TIMELINE */}
            <div className="space-y-4">
              {report.timeline.map((s, i) => (
                <div key={i}>
                  <b>{s.title}</b>
                  <div className="text-xs text-slate-400">
                    {s.time}
                  </div>
                </div>
              ))}
            </div>

            {/* ACTIONS */}
            <div className="mt-8 flex gap-4">
              <button className="px-4 py-2 border rounded-xl">
                <Share2 size={16} /> Share
              </button>

              <button className="px-4 py-2 border rounded-xl">
                <ThumbsUp size={16} /> Like
              </button>
            </div>
          </div>
        </div>
      </div>
    </CivicLayout>
  );
};

export default ReportDetail;