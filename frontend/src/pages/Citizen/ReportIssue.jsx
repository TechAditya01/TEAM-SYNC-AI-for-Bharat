import React, { useState, useEffect } from "react";
import {
  Camera,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Trash2,
  Lightbulb,
  Droplets,
  X,
  Loader2,
  Search,
  Crosshair,
  Award,
  Video,
  Mic,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import CivicLayout from "./CivicLayout";
import { verifyImageWithAI, submitReportToBackend } from "../../services/backendService";
import { uploadImage, uploadVideo, uploadAudio } from "../../services/storageService";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { toast } from "react-hot-toast";

const ReportIssue = () => {
  const navigate = useNavigate();

  const [mediaType, setMediaType] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedAudio, setSelectedAudio] = useState(null);

  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);

  const [aiResult, setAiResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const [location, setLocation] = useState({
    lat: null,
    lng: null,
    address: "Detecting location...",
  });

  const [department, setDepartment] = useState("");
  const [category, setCategory] = useState("");

  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [submittedReportId, setSubmittedReportId] = useState(null);

  // =============================
  // LOCATION — OpenStreetMap
  // =============================

  const fetchAddress = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      const data = await res.json();

      setLocation({
        lat,
        lng,
        address: data.display_name || `${lat}, ${lng}`,
      });
    } catch {
      setLocation({
        lat,
        lng,
        address: `${lat}, ${lng}`,
      });
    }
  };

  const detectLocation = () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition((pos) => {
      fetchAddress(pos.coords.latitude, pos.coords.longitude);
    });
  };

  useEffect(() => {
    detectLocation();
  }, []);

  // =============================
  // MEDIA UPLOAD
  // =============================

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setMediaType("image");
    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => setSelectedImage(reader.result);
    reader.readAsDataURL(file);

    setAnalyzing(true);

    try {
      const result = await verifyImageWithAI(file);
      setAiResult(result);
    } catch {
      toast.error("AI analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setMediaType("video");
    setVideoFile(file);

    const reader = new FileReader();
    reader.onloadend = () => setSelectedVideo(reader.result);
    reader.readAsDataURL(file);
  };

  const handleAudioUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setMediaType("audio");
    setAudioFile(file);

    const reader = new FileReader();
    reader.onloadend = () => setSelectedAudio(reader.result);
    reader.readAsDataURL(file);
  };

  // =============================
  // SUBMIT
  // =============================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!location.lat) {
      toast.error("Location required");
      return;
    }

    try {
      let mediaUrl = null;
      let finalType = mediaType;

      if (imageFile) mediaUrl = await uploadImage(imageFile, "reports");
      if (videoFile) mediaUrl = await uploadVideo(videoFile, "reports");
      if (audioFile) mediaUrl = await uploadAudio(audioFile, "reports");

      const reportData = {
        type: category || "General",
        department,
        description: e.target.description.value,
        location,
        mediaUrl,
        mediaType: finalType,
        aiAnalysis: aiResult?.detected || "",
        aiConfidence: aiResult?.confidence || 0,
        status: "Pending",
        timestamp: Date.now(),
        userId: localStorage.getItem("uid"),
        userName: localStorage.getItem("name") || "Citizen",
      };

      const res = await submitReportToBackend(reportData);

      setSubmittedReportId(res.id || "N/A");
      setShowSuccessPopup(true);

      setTimeout(() => {
        navigate("/civic/my-reports");
      }, 2500);
    } catch (err) {
      toast.error("Submit failed");
    }
  };

  // =============================
  // UI
  // =============================

  return (
    <CivicLayout>
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <div className="p-3 bg-blue-600 rounded-lg text-white">
            <Camera size={28} />
          </div>
          Report Issue
        </h1>
        <p className="text-slate-500 ml-16">
          Help improve your community with AI reporting
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* LEFT — MEDIA */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg p-6 border">
            <h3 className="font-bold mb-4">Upload Evidence</h3>

            {!selectedImage && !selectedVideo && !selectedAudio && (
              <div className="grid grid-cols-3 gap-4">
                <label className="upload-box">
                  <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                  <Camera size={32} />
                  <span>Photo</span>
                </label>

                <label className="upload-box">
                  <input type="file" hidden accept="video/*" onChange={handleVideoUpload} />
                  <Video size={32} />
                  <span>Video</span>
                </label>

                <label className="upload-box">
                  <input type="file" hidden accept="audio/*" onChange={handleAudioUpload} />
                  <Mic size={32} />
                  <span>Audio</span>
                </label>
              </div>
            )}

            {selectedImage && (
              <img src={selectedImage} className="rounded-lg mt-4" />
            )}
            {selectedVideo && (
              <video src={selectedVideo} controls className="rounded-lg mt-4" />
            )}
            {selectedAudio && (
              <audio src={selectedAudio} controls className="mt-4 w-full" />
            )}

            {analyzing && (
              <div className="flex items-center gap-2 mt-4 text-blue-600">
                <Loader2 className="animate-spin" size={18} />
                AI analyzing…
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — FORM */}
        <div className="lg:col-span-3 space-y-6">
          {/* LOCATION */}
          <div className="bg-white p-6 rounded-lg border">
            <div className="flex justify-between mb-3">
              <h3 className="font-bold flex gap-2 items-center">
                <MapPin size={18} />
                Location
              </h3>
              <button
                type="button"
                onClick={detectLocation}
                className="text-blue-600"
              >
                <Crosshair size={18} />
              </button>
            </div>

            <div className="h-64 rounded-lg overflow-hidden border">
              {location.lat ? (
                <MapContainer
                  center={[location.lat, location.lng]}
                  zoom={15}
                  style={{ width: "100%", height: "100%" }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[location.lat, location.lng]} />
                </MapContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  Detecting location…
                </div>
              )}
            </div>

            <div className="text-xs mt-2 text-slate-500">
              {location.address}
            </div>
          </div>

          {/* DEPARTMENT */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="font-bold mb-3">Department</h3>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full border rounded-lg p-3"
            >
              <option value="">Select</option>
              <option>Municipal/Waste</option>
              <option>Electricity Board</option>
              <option>Water Supply</option>
              <option>Traffic</option>
              <option>Police</option>
              <option>Fire & Safety</option>
            </select>
          </div>

          {/* DESCRIPTION */}
          <div className="bg-white p-6 rounded-lg border">
            <textarea
              name="description"
              placeholder="Describe issue..."
              className="w-full border rounded-lg p-3 h-24"
            />
          </div>

          {/* SUBMIT */}
          <button
            onClick={handleSubmit}
            disabled={!department || !mediaType}
            className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold"
          >
            Submit Report
          </button>
        </div>
      </div>

      {/* SUCCESS POPUP */}
      <AnimatePresence>
        {showSuccessPopup && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="bg-white p-8 rounded-xl text-center"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
            >
              <CheckCircle size={48} className="text-blue-600 mx-auto mb-3" />
              <h2 className="font-bold text-xl mb-2">
                Report Submitted!
              </h2>
              <p>ID: {submittedReportId}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STYLE */}
      <style jsx>{`
        .upload-box {
          border: 2px dashed #cbd5e1;
          border-radius: 12px;
          height: 140px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          gap: 6px;
        }
        .upload-box:hover {
          border-color: #2563eb;
          background: #eff6ff;
        }
      `}</style>
    </CivicLayout>
  );
};

export default ReportIssue;