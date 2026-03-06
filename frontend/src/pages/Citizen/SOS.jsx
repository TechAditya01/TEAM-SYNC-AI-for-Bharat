import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Phone,
  Shield,
  AlertTriangle,
  Siren,
  CheckCircle,
  BellRing,
} from "lucide-react";
import CivicLayout from "./CivicLayout";
import { useAuth } from "../../context/AuthContext";

const SOS = () => {
  const { user } = useAuth();
  const userId = user?.sub || localStorage.getItem("uid") || "";
  const userPhone = user?.phone_number || localStorage.getItem("phone") || "N/A";
  const [countdown, setCountdown] = useState(null);
  const [active, setActive] = useState(false);
  const [sentLocation, setSentLocation] = useState(null);

  // =========================
  // COUNTDOWN + SOS TRIGGER
  // =========================
  useEffect(() => {
    let timer;

    if (active && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }

    if (active && countdown === 0) {
      triggerSOS();
      setActive(false);
    }

    return () => clearTimeout(timer);
  }, [active, countdown]);

  // =========================
  // SOS FUNCTION
  // =========================
  const triggerSOS = () => {
    // Call Police
    window.location.href = "tel:100";

    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      let address = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

      // OpenStreetMap reverse geocode
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
        );
        const data = await res.json();
        if (data.display_name) address = data.display_name;
      } catch { }

      const loc = { lat, lng, address };
      setSentLocation(loc);

      // Send SOS report to backend
      try {
        const reportData = {
          userId: userId || "anonymous",
          userName: user ? `${user['custom:firstName'] || user.name || 'Citizen'}` : "Citizen",
          type: "SOS Emergency",
          description:
            "User activated Emergency SOS beacon. Immediate assistance required.",
          department: "Police",
          priority: "Critical",
          status: "Pending",
          location: {
            lat,
            lng,
            address,
          },
          timestamp: Date.now(),
        };

        const API_BASE =
          import.meta.env.VITE_AWS_API_GATEWAY_URL || "";

        await fetch(`${API_BASE}/api/reports/create`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reportData),
        });

        console.log("SOS broadcast sent");
      } catch (err) {
        console.error("SOS failed", err);
      }
    });
  };

  // =========================
  // BUTTON CLICK
  // =========================
  const handleSOSClick = () => {
    if (!active) {
      setActive(true);
      setCountdown(5);
      setSentLocation(null);
    } else {
      setActive(false);
      setCountdown(null);
    }
  };

  // =========================
  // UI
  // =========================
  return (
    <CivicLayout>
      <div className="grid lg:grid-cols-2 gap-8 h-[calc(100vh-100px)] items-center">
        {/* LEFT */}
        <div className="space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-full font-bold text-sm mb-4">
              <Siren size={18} /> Emergency Mode
            </div>

            <h1 className="text-4xl font-extrabold mb-4">
              Emergency SOS
            </h1>

            <p className="text-lg text-slate-500 mb-8">
              In case of immediate danger, this will call police and
              broadcast your live location to authorities.
            </p>
          </div>

          {/* CONTACTS */}
          <div className="bg-white rounded-3xl p-8 border">
            <h3 className="font-bold mb-6 flex gap-2 items-center">
              <Shield size={20} /> Trusted Contacts
            </h3>

            <div className="space-y-4">
              <ContactRow name="Police" number="100" />
              <ContactRow name="Fire Brigade" number="101" />
              <ContactRow
                name="My Number"
                number={userPhone}
              />
            </div>
          </div>
        </div>

        {/* RIGHT BIG BUTTON */}
        <div className="flex flex-col items-center justify-center bg-slate-50 rounded-[3rem] border h-full min-h-[500px] relative">
          {active && (
            <motion.div
              animate={{ scale: [1, 2.5], opacity: [0.3, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="absolute w-[500px] h-[500px] bg-red-500 rounded-full blur-3xl"
            />
          )}

          <h2 className="text-2xl font-bold mb-12 text-center">
            {active ? "Sending Alert in..." : "Tap to activate SOS"}
          </h2>

          <button
            onClick={handleSOSClick}
            className={`w-72 h-72 rounded-full flex flex-col items-center justify-center shadow-2xl border-8 transition ${active
                ? "bg-white border-red-500 text-red-600"
                : "bg-red-600 border-red-100 text-white"
              }`}
          >
            {active ? (
              <>
                <span className="text-8xl font-black">
                  {countdown}
                </span>
                <span className="font-bold uppercase">
                  Cancel
                </span>
              </>
            ) : (
              <>
                <BellRing size={80} className="mb-6 animate-pulse" />
                <span className="text-4xl font-black">SOS</span>
              </>
            )}
          </button>

          {/* SUCCESS */}
          {countdown === 0 && sentLocation && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-12 bg-green-100 text-green-700 px-6 py-3 rounded-xl text-center"
            >
              <div className="flex items-center gap-2 justify-center">
                <CheckCircle size={20} />
                Alert Sent
              </div>
              <div className="text-xs mt-1 max-w-xs break-words">
                {sentLocation.address}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </CivicLayout>
  );
};

const ContactRow = ({ name, number }) => (
  <a
    href={`tel:${number}`}
    className="flex justify-between items-center p-4 bg-slate-50 rounded-xl"
  >
    <div>
      <div className="font-bold">{name}</div>
      <div className="text-sm text-slate-500">{number}</div>
    </div>
    <Phone size={18} />
  </a>
);

export default SOS;