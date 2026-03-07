import React, { useState, useEffect } from "react";
import {
  MapPin,
  Share2,
  ThumbsUp,
  ExternalLink,
  Edit2,
  Save,
  X,
  ImagePlus,
  Map,
} from "lucide-react";
import { useParams } from "react-router-dom";
import CivicLayout from "./CivicLayout";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Helper function to map issue types to departments
const getDepartmentFromIssueType = (issueType) => {
  const typeLC = (issueType || '').toLowerCase();
  
  if (typeLC.includes('pothole') || typeLC.includes('road') || typeLC.includes('traffic')) {
    return 'Traffic';
  }
  if (typeLC.includes('garbage') || typeLC.includes('waste') || typeLC.includes('trash')) {
    return 'Municipal/Waste';
  }
  if (typeLC.includes('water') || typeLC.includes('drainage')) {
    return 'Water Supply';
  }
  if (typeLC.includes('light') || typeLC.includes('street') || typeLC.includes('electricity')) {
    return 'Electricity Board';
  }
  if (typeLC.includes('noise') || typeLC.includes('pollution') || typeLC.includes('air')) {
    return 'Police';
  }
  if (typeLC.includes('animal') || typeLC.includes('stray')) {
    return 'Fire & Safety';
  }
  
  return 'General';
};

const ReportDetail = () => {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editFields, setEditFields] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [locationEdit, setLocationEdit] = useState(false);

  useEffect(() => {
    const API = import.meta.env.VITE_AWS_API_GATEWAY_URL || "";
    fetch(`${API}/api/reports/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        console.log("Raw report data from API:", data);
        if (!data.report) {
          console.error("No report in response");
          return;
        }
        const r = data.report;
        console.log("Report media info:", {
          mediaUrl: r.mediaUrl,
          imageUrl: r.imageUrl,
          videoUrl: r.videoUrl,
          audioUrl: r.audioUrl,
          mediaType: r.mediaType
        });
        const ts = r.createdAt || r.timestamp;
        const reportData = {
          ...r,
          ticketId: r.id ? `#${r.id.slice(-6).toUpperCase()}` : "#UNKNOWN",
          address: r.location?.address || "Address unavailable",
          lat: parseFloat(r.location?.lat || 0),
          lng: parseFloat(r.location?.lng || 0),
          timeFormatted: new Date(ts).toLocaleString(),
        };
        setReport(reportData);
        setEditFields({
          type: r.type || "",
          address: r.location?.address || "",
          aiAnalysis: r.aiAnalysis || "",
          imageUrl: r.imageUrl || r.mediaUrl || "",
          lat: parseFloat(r.location?.lat || 0),
          lng: parseFloat(r.location?.lng || 0),
        });
      })
      .catch(err => {
        console.error("Error fetching report:", err);
        setReport({ error: "Failed to load report" });
      });
  }, [id]);

  if (!report) return <div className="text-center p-10">Loading...</div>;
  
  if (report.error) return <div className="text-center p-10 text-red-600">{report.error}</div>;

  // Handlers for editing
  const handleEditToggle = () => setEditMode((v) => !v);
  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setEditFields((prev) => ({ ...prev, [name]: value }));
  };
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      setEditFields((prev) => ({ ...prev, imageFile: file }));
    }
  };
  const handleLocationEdit = () => setLocationEdit((v) => !v);
  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    setEditFields((prev) => ({ ...prev, [name]: value }));
  };
  const handleSave = async () => {
    // TODO: API call to update report
    setEditMode(false);
    setLocationEdit(false);
    // Optionally update local state
    setReport((prev) => ({ ...prev, ...editFields, imageUrl: imagePreview || prev.imageUrl }));
  };
  const handleCancel = () => {
    setEditMode(false);
    setLocationEdit(false);
    setImagePreview(null);
    setEditFields({
      type: report.type,
      address: report.address,
      aiAnalysis: report.aiAnalysis,
      imageUrl: report.imageUrl || report.mediaUrl,
      lat: report.lat,
      lng: report.lng,
    });
  };

  return (
    <CivicLayout noPadding>
      <div className="bg-white rounded-3xl shadow-lg p-6 max-w-4xl mx-auto mt-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* LEFT: Image/Video/Audio & Map */}
          <div className="flex-1 flex flex-col gap-6">
            {/* Media Section - Handle Images, Videos, and Audio */}
            <div className="relative group">
              <div className="h-64 w-full rounded-xl overflow-hidden border bg-slate-100">
                {report.mediaType === 'image' || !report.mediaType ? (
                  // IMAGE
                  report.imageUrl || report.mediaUrl ? (
                    <img
                      src={imagePreview || report.imageUrl || report.mediaUrl}
                      alt="Report Evidence"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error("Image failed to load:", e.target.src);
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-400 flex-col gap-2">
                      <div className="text-4xl">📷</div>
                      <div>No image evidence</div>
                    </div>
                  )
                ) : report.mediaType === 'video' ? (
                  // VIDEO
                  report.videoUrl || report.mediaUrl ? (
                    <video
                      src={imagePreview || report.videoUrl || report.mediaUrl}
                      controls
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error("Video failed to load:", e.target.src);
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-400 flex-col gap-2">
                      <div className="text-4xl">🎥</div>
                      <div>No video evidence</div>
                    </div>
                  )
                ) : report.mediaType === 'audio' ? (
                  // AUDIO
                  report.audioUrl || report.mediaUrl ? (
                    <div className="flex items-center justify-center h-full flex-col gap-4">
                      <audio controls src={report.audioUrl || report.mediaUrl} className="w-full" />
                      <span className="text-xs text-slate-500">Audio evidence available</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-400 flex-col gap-2">
                      <div className="text-4xl">🎵</div>
                      <div>No audio evidence</div>
                    </div>
                  )
                ) : (
                  // UNKNOWN TYPE
                  <div className="flex items-center justify-center h-full text-slate-400 flex-col gap-2">
                    <div className="text-4xl">📄</div>
                    <div>No media evidence</div>
                  </div>
                )}
                {editMode && report.mediaType === 'image' && (
                  <label className="absolute top-2 right-2 bg-white p-2 rounded-full shadow cursor-pointer flex items-center gap-1 hover:bg-gray-100">
                    <ImagePlus size={18} />
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                )}
              </div>
              {/* Media Type Badge */}
              {report.mediaUrl && (
                <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-semibold">
                  {(report.mediaType || 'image').toUpperCase()}
                </div>
              )}
            </div>
            {/* Map Section */}
            <div className="relative">
              <div className="h-64 w-full rounded-xl overflow-hidden border">
                {report.lat !== 0 ? (
                  <MapContainer center={[editFields.lat, editFields.lng]} zoom={15} style={{ width: "100%", height: "100%" }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[editFields.lat, editFields.lng]} />
                  </MapContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">No location</div>
                )}
                {locationEdit && (
                  <div className="absolute top-2 left-2 bg-white p-2 rounded-xl shadow flex gap-2">
                    <input
                      type="number"
                      name="lat"
                      value={editFields.lat}
                      onChange={handleLocationChange}
                      placeholder="Latitude"
                      className="border px-2 py-1 rounded"
                      style={{ width: 100 }}
                    />
                    <input
                      type="number"
                      name="lng"
                      value={editFields.lng}
                      onChange={handleLocationChange}
                      placeholder="Longitude"
                      className="border px-2 py-1 rounded"
                      style={{ width: 100 }}
                    />
                  </div>
                )}
                {editMode && !locationEdit && (
                  <button
                    className="absolute top-2 right-2 bg-white p-2 rounded-full shadow flex items-center gap-1"
                    onClick={handleLocationEdit}
                  >
                    <Map size={18} /> Edit Location
                  </button>
                )}
                <a
                  href={`https://www.openstreetmap.org/?mlat=${editFields.lat}&mlon=${editFields.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute bottom-2 right-2 bg-white px-3 py-2 rounded-xl text-xs font-bold flex gap-2"
                >
                  <ExternalLink size={14} /> Open Map
                </a>
              </div>
            </div>
          </div>
          {/* RIGHT: Details & Edit */}
          <div className="flex-1 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">{editMode ? (
                <input
                  type="text"
                  name="type"
                  value={editFields.type}
                  onChange={handleFieldChange}
                  className="border px-2 py-1 rounded w-2/3"
                />
              ) : report.type}</h1>
              {!editMode ? (
                <button className="p-2 rounded-full bg-blue-100" onClick={handleEditToggle} title="Edit">
                  <Edit2 size={18} />
                </button>
              ) : (
                <div className="flex gap-2">
                  <button className="p-2 rounded-full bg-green-100" onClick={handleSave} title="Save">
                    <Save size={18} />
                  </button>
                  <button className="p-2 rounded-full bg-red-100" onClick={handleCancel} title="Cancel">
                    <X size={18} />
                  </button>
                </div>
              )}
            </div>
            <div className="flex gap-2 text-slate-500">
              <MapPin size={18} />
              {editMode ? (
                <input
                  type="text"
                  name="address"
                  value={editFields.address}
                  onChange={handleFieldChange}
                  className="border px-2 py-1 rounded w-full"
                />
              ) : report.address}
            </div>
            <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
              <b className="text-purple-900">Department</b>
              <p className="text-sm mt-2 text-purple-800 font-semibold">
                {getDepartmentFromIssueType(report.type)}
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-xl">
              <b>AI Analysis</b>
              {editMode ? (
                <textarea
                  name="aiAnalysis"
                  value={editFields.aiAnalysis}
                  onChange={handleFieldChange}
                  className="border px-2 py-1 rounded w-full mt-2"
                  rows={3}
                />
              ) : (
                <p className="text-sm mt-2">{report.aiAnalysis || "No AI analysis"}</p>
              )}
            </div>
            <div className="bg-gray-50 p-4 rounded-xl">
              <b>Report ID:</b> {report.ticketId}
              <div className="text-xs text-slate-400 mt-1">Submitted: {report.timeFormatted}</div>
            </div>
            {/* Timeline */}
            <div className="space-y-4">
              <b>Status Timeline</b>
              {/* ...existing code... */}
            </div>
            {/* Actions */}
            <div className="mt-4 flex gap-4">
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