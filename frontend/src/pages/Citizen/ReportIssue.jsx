import React, { useState, useEffect } from "react";
import {
  Camera,
  MapPin,
  Crosshair,
  Video,
  Mic,
  Loader2,
  Brain,
  CheckCircle,
  FileText,
  Plus
} from "lucide-react";

import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import CivicLayout from "./CivicLayout";

import {
  verifyImageWithAI,
  verifyVideoWithAI,
  verifyVoiceWithAI,
  submitReportToBackend
} from "../../services/backendService";

import {
  uploadImage,
  uploadVideo,
  uploadAudio
} from "../../services/storageService";

import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { toast } from "react-hot-toast";

const ReportIssue = () => {

  const navigate = useNavigate();

  const [mediaType,setMediaType] = useState(null);

  const [selectedImage,setSelectedImage] = useState(null);
  const [selectedVideo,setSelectedVideo] = useState(null);
  const [selectedAudio,setSelectedAudio] = useState(null);

  const [imageFile,setImageFile] = useState(null);
  const [videoFile,setVideoFile] = useState(null);
  const [audioFile,setAudioFile] = useState(null);

  const [aiResult,setAiResult] = useState(null);
  const [analyzing,setAnalyzing] = useState(false);

  const [location,setLocation] = useState({
    lat:null,
    lng:null,
    address:"Detecting location..."
  });

  const [department,setDepartment] = useState("");
  const [category,setCategory] = useState("");

  // =============================
  // LOCATION
  // =============================

  const fetchAddress = async(lat,lng)=>{

    try{

      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );

      const data = await res.json();

      setLocation({
        lat,
        lng,
        address:data.display_name
      });

    }catch{

      setLocation({
        lat,
        lng,
        address:`${lat},${lng}`
      });

    }

  };

  const detectLocation = ()=>{

    if(!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition((pos)=>{

      fetchAddress(
        pos.coords.latitude,
        pos.coords.longitude
      );

    });

  };

  useEffect(()=>{

    detectLocation();

  },[]);

  // =============================
  // IMAGE UPLOAD
  // =============================

  const handleImageUpload = async(e)=>{

    const file = e.target.files[0];
    if(!file) return;

    setMediaType("image");
    setImageFile(file);

    const reader = new FileReader();

    reader.onloadend = ()=>{
      setSelectedImage(reader.result);
    };

    reader.readAsDataURL(file);

    setAnalyzing(true);

    try{

      const result = await verifyImageWithAI(file,category,location);

      setAiResult(result);

      if(result.detectedCategory)
        setCategory(result.detectedCategory);

      if(result.suggestedDepartment)
        setDepartment(result.suggestedDepartment);

    }catch{

      toast.error("AI analysis failed");

    }

    setAnalyzing(false);

  };

  // =============================
  // VIDEO UPLOAD
  // =============================

  const handleVideoUpload = async(e)=>{

    const file = e.target.files[0];
    if(!file) return;

    setMediaType("video");
    setVideoFile(file);

    const reader = new FileReader();

    reader.onloadend = ()=>{
      setSelectedVideo(reader.result);
    };

    reader.readAsDataURL(file);

    setAnalyzing(true);

    try{

      const result = await verifyVideoWithAI(file,category,location);

      setAiResult(result);

      if(result.detectedIssueType)
        setCategory(result.detectedIssueType);

    }catch{

      toast.error("Video AI analysis failed");

    }

    setAnalyzing(false);

  };

  // =============================
  // AUDIO UPLOAD
  // =============================

  const handleAudioUpload = async(e)=>{

    const file = e.target.files[0];
    if(!file) return;

    setMediaType("audio");
    setAudioFile(file);

    const reader = new FileReader();

    reader.onloadend = ()=>{
      setSelectedAudio(reader.result);
    };

    reader.readAsDataURL(file);

    setAnalyzing(true);

    try{

      const result = await verifyVoiceWithAI(file,category,location);

      setAiResult(result);

      if(result.detectedIssueType)
        setCategory(result.detectedIssueType);

    }catch{

      toast.error("Audio AI analysis failed");

    }

    setAnalyzing(false);

  };

  // =============================
  // SUBMIT REPORT
  // =============================

  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submittedreport_id, setSubmittedreport_id] = useState(null);

  const handleSubmit = async(e)=>{

    e.preventDefault();

    if(!location.lat){

      toast.error("Location required");
      return;

    }

    try{

      let mediaUrl = null;

      if(imageFile)
        mediaUrl = await uploadImage(imageFile,"reports");

      if(videoFile)
        mediaUrl = await uploadVideo(videoFile,"reports");

      if(audioFile)
        mediaUrl = await uploadAudio(audioFile,"reports");

      const reportData = {

        type:category || "General",

        department:department || "General",

        description:e.target.description.value,

        location,

        mediaUrl,

        mediaType,

        aiConfidence:aiResult?.confidence || 0,

        status:"Pending",

        timestamp:Date.now(),

        userId:localStorage.getItem("uid"),

        userName:localStorage.getItem("name") || "Citizen"

      };

      const result = await submitReportToBackend(reportData);

      setSubmittedreport_id(result?.id || null);
      setSubmitSuccess(true);
      toast.success("Report submitted successfully!");

    }catch{

      toast.error("Submit failed");

    }

  };

  const handleSubmitAnother = ()=>{
    // Reset form state
    setSubmitSuccess(false);
    setSubmittedreport_id(null);
    setSelectedImage(null);
    setSelectedVideo(null);
    setSelectedAudio(null);
    setImageFile(null);
    setVideoFile(null);
    setAudioFile(null);
    setAiResult(null);
    setCategory("");
    setDepartment("");
    setMediaType(null);
    // Reset form fields
    const form = document.querySelector('form');
    if(form) form.reset();
  };

  // =============================
  // UI
  // =============================

 return (
<CivicLayout>

<div className="max-w-7xl mx-auto">

{/* HEADER */}

<div className="mb-10">

<h1 className="text-4xl font-bold flex items-center gap-4">

<div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white shadow-lg">

<Camera size={30}/>

</div>

Report Civic Issue

</h1>

<p className="text-gray-500 mt-2 ml-16">

Upload evidence and let AI verify the issue instantly

</p>

</div>

{/* SUCCESS MESSAGE */}
{submitSuccess && (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="mb-8 bg-green-50 border border-green-200 rounded-2xl p-8 text-center"
  >
    <div className="flex justify-center mb-4">
      <div className="p-4 bg-green-500 rounded-full">
        <CheckCircle size={48} className="text-white" />
      </div>
    </div>
    <h2 className="text-2xl font-bold text-green-800 mb-2">
      Report Submitted Successfully!
    </h2>
    <p className="text-green-600 mb-6">
      Your civic issue has been reported and will be reviewed by the authorities.
    </p>
    <div className="flex justify-center gap-4">
      <Link
        to="/my-reports"
        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
      >
        <FileText size={20} />
        View My Reports
      </Link>
      <button
        onClick={handleSubmitAnother}
        className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition"
      >
        <Plus size={20} />
        Submit Another Report
      </button>
    </div>
  </motion.div>
)}

{/* HIDE FORM WHEN SUCCESS */}
{!submitSuccess && (
<div className="grid lg:grid-cols-5 gap-8">

{/* LEFT SIDE */}

<div className="lg:col-span-2 space-y-6">

{/* MEDIA CARD */}

<div className="bg-white shadow-lg rounded-2xl p-6 border">

<h3 className="font-bold text-lg mb-4">

Upload Evidence

</h3>

<div className="grid grid-cols-3 gap-4">

<label className="upload-card">

<input hidden type="file" accept="image/*" onChange={handleImageUpload}/>

<Camera size={28}/>

<p>Photo</p>

</label>

<label className="upload-card">

<input hidden type="file" accept="video/*" onChange={handleVideoUpload}/>

<Video size={28}/>

<p>Video</p>

</label>

<label className="upload-card">

<input hidden type="file" accept="audio/*" onChange={handleAudioUpload}/>

<Mic size={28}/>

<p>Voice</p>

</label>

</div>

{/* MEDIA PREVIEW */}

{selectedImage &&

<img src={selectedImage} className="mt-4 rounded-xl shadow"/>}

{selectedVideo &&

<video src={selectedVideo} controls className="mt-4 rounded-xl shadow"/>}

{selectedAudio &&

<audio src={selectedAudio} controls className="mt-4 w-full"/>}

{/* AI LOADING */}

{analyzing &&

<div className="flex items-center gap-2 mt-4 text-blue-600">

<Loader2 className="animate-spin"/>

AI analyzing...

</div>

}

{/* AI RESULT */}

{aiResult &&

<motion.div

initial={{opacity:0,y:10}}

animate={{opacity:1,y:0}}

className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border rounded-xl">

<div className="flex items-center gap-2 font-semibold text-purple-700">

<Brain size={18}/>

AI Analysis Result

</div>

<div className="mt-2 text-sm">

Confidence Score

</div>

<div className="w-full bg-gray-200 rounded-full h-2 mt-1">

<div

className="bg-green-500 h-2 rounded-full"

style={{width:`${aiResult.confidence || 80}%`}}

></div>

</div>

<p className="text-sm mt-1 font-medium">

{aiResult.confidence || 80}% confidence

</p>

</motion.div>

}

</div>

</div>

{/* RIGHT SIDE */}

<div className="lg:col-span-3 space-y-6">

{/* LOCATION */}

<div className="bg-white shadow-lg rounded-2xl p-6 border">

<div className="flex justify-between mb-4">

<h3 className="font-bold flex items-center gap-2">

<MapPin size={18}/>

Issue Location

</h3>

<div className="flex gap-3">

<button

onClick={detectLocation}

type="button"

className="flex items-center gap-1 text-blue-600">

<Crosshair size={16}/>

Auto Detect

</button>

</div>

</div>

<div className="h-72 rounded-xl overflow-hidden border">

{location.lat ?

<MapContainer

center={[location.lat,location.lng]}

zoom={16}

style={{height:"100%",width:"100%"}}

>

<TileLayer

url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

/>

<Marker

draggable

position={[location.lat,location.lng]}

eventHandlers={{

dragend:(e)=>{

const lat = e.target.getLatLng().lat

const lng = e.target.getLatLng().lng

fetchAddress(lat,lng)

}

}}

/>

</MapContainer>

:

<div className="flex items-center justify-center h-full">

Detecting location...

</div>

}

</div>

<p className="text-xs mt-2 text-gray-500">

{location.address}

</p>

</div>

{/* FORM */}

<form

onSubmit={handleSubmit}

className="bg-white shadow-lg rounded-2xl p-6 border space-y-4">

<h3 className="font-bold text-lg">

Issue Details

</h3>

<select

value={department}

onChange={(e)=>setDepartment(e.target.value)}

className="w-full border rounded-lg p-3">

<option value="">Select Department</option>

<option>Municipal/Waste</option>

<option>Electricity Board</option>

<option>Water Supply</option>

<option>Traffic</option>

<option>Police</option>

<option>Fire & Safety</option>

</select>

<textarea

name="description"

placeholder="Describe the issue..."

className="w-full border rounded-lg p-3 h-24"

/>

<button

type="submit"

disabled={analyzing}

className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:scale-[1.02] transition">

{analyzing ?

<span className="flex justify-center gap-2">

<Loader2 className="animate-spin"/>

Analyzing...

</span>

:

"Submit Report"

}

</button>

</form>

</div>

</div>
)}

</div>

</CivicLayout>
);
};

export default ReportIssue;