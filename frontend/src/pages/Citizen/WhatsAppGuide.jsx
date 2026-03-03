import React, { useState } from "react";
import { Camera, Send, MapPin, Check, MessageCircle, QrCode } from "lucide-react";
import { toast } from "react-hot-toast";
import CivicLayout from "./CivicLayout";
import WhatsAppSimulator from "../../components/civic/WhatsAppSimulator";

const WhatsAppGuide = () => {
  const [loading, setLoading] = useState(false);

  // backend auth from localStorage (JWT login)
  const uid = localStorage.getItem("uid");
  const isLoggedIn = !!uid;

  const handleJoinCommunity = async () => {
    if (!uid) return;

    setLoading(true);
    try {
      const API_BASE =
        import.meta.env.VITE_AWS_API_GATEWAY_URL || "";

      const res = await fetch(`${API_BASE}/api/auth/join-community`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid }),
      });

      if (res.ok) {
        toast.success("Community invite sent to your WhatsApp!");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to join community");
      }
    } catch (err) {
      console.error("Join error", err);
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <CivicLayout>
      <div className="min-h-[calc(100vh-100px)] flex flex-col justify-center">
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-xl border overflow-hidden">
          <div className="flex flex-col lg:flex-row min-h-[600px]">
            {/* LEFT */}
            <div className="lg:w-3/5 p-8 lg:p-16 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-8">
                <div className="px-4 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-bold">
                  <MessageCircle size={14} /> Official Integration
                </div>
                <div className="px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-bold animate-pulse">
                  Bot Online
                </div>
              </div>

              <h1 className="text-4xl lg:text-5xl font-extrabold mb-6">
                No App? No Problem.
                <br />
                <span className="text-green-600">Just WhatsApp Us.</span>
              </h1>

              <p className="text-lg text-slate-500 mb-10 max-w-xl">
                Report potholes, garbage, or accidents through our WhatsApp bot.
                Just send a message like you would to a friend.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <a
                  href="https://wa.me/919981478143?text=Start"
                  target="_blank"
                  rel="noreferrer"
                  className="px-8 py-4 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-2xl font-bold text-lg shadow-lg flex items-center justify-center gap-3"
                >
                  <MessageCircle size={24} /> Chat with Bot
                </a>

                {isLoggedIn ? (
                  <button
                    onClick={handleJoinCommunity}
                    disabled={loading}
                    className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-lg shadow-lg"
                  >
                    {loading ? "Sending..." : "Join Community"}
                  </button>
                ) : (
                  <div className="px-8 py-4 bg-slate-50 border rounded-2xl font-bold text-slate-600 flex items-center gap-2">
                    <QrCode size={20} />
                    <span className="font-mono">+91 99814 78143</span>
                  </div>
                )}
              </div>

              {/* STEPS */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 border-t">
                <StepItem icon={<Send />} label="1. Say Start" />
                <StepItem icon={<Camera />} label="2. Send Photo" />
                <StepItem icon={<MapPin />} label="3. Auto Location" />
                <StepItem icon={<Check />} label="4. Get Ticket" />
              </div>
            </div>

            {/* RIGHT */}
            <div className="hidden lg:flex lg:w-2/5 bg-[#00a884] items-center justify-center">
              <div className="w-full max-w-sm">
                <WhatsAppSimulator />
              </div>
            </div>
          </div>
        </div>
      </div>
    </CivicLayout>
  );
};

const StepItem = ({ icon, label }) => (
  <div className="flex flex-col items-center text-center gap-2">
    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
      {React.cloneElement(icon, { size: 18 })}
    </div>
    <span className="text-xs font-bold text-slate-600">{label}</span>
  </div>
);

export default WhatsAppGuide;