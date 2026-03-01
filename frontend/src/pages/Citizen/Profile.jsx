import React from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  LogOut,
  Settings as SettingsIcon,
  Shield,
  ChevronRight,
  BarChart,
  Star,
  Trash2,
  Zap,
  Camera,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import CivicLayout from "./CivicLayout";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";

const Profile = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const [userData, setUserData] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    address: "",
    profilePic: "",
    points: 0,
    reportCount: 0,
    role: "Citizen",
    badges: [],
  });

  const [weeklyActivity, setWeeklyActivity] = React.useState([0,0,0,0,0,0,0]);
  const [uploadingPic, setUploadingPic] = React.useState(false);
  const fileInputRef = React.useRef(null);

  /* ---------------- LOAD USER ---------------- */
  React.useEffect(() => {
    if (!currentUser) return navigate("/login");

    const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

    fetch(`${API}/api/user/${currentUser.id}`)
      .then(r => r.json())
      .then(data => {
        if (!data.user) return;

        setUserData({
          ...data.user,
          badges: data.badges || [],
          reportCount: data.reportCount || 0,
          points: data.user.points || 0,
        });

        setWeeklyActivity(data.weeklyActivity || [0,0,0,0,0,0,0]);
      })
      .catch(() => toast.error("Failed to load profile"));
  }, [currentUser, navigate]);

  /* ---------------- AVATAR UPLOAD ---------------- */
  const handleProfilePicUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/"))
      return toast.error("Select image");

    if (file.size > 5 * 1024 * 1024)
      return toast.error("Max 5MB");

    setUploadingPic(true);
    const t = toast.loading("Uploading...");

    try {
      const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

      const fd = new FormData();
      fd.append("file", file);
      fd.append("userId", currentUser.id);

      const res = await fetch(`${API}/api/user/upload-avatar`, {
        method: "POST",
        body: fd,
      });

      const { url } = await res.json();

      setUserData(prev => ({ ...prev, profilePic: url }));
      toast.success("Updated!", { id: t });

    } catch {
      toast.error("Upload failed", { id: t });
    } finally {
      setUploadingPic(false);
    }
  };

  if (!currentUser) return null;

  return (
    <CivicLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT */}
        <div className="space-y-6">
          {/* PROFILE CARD */}
          <div className="bg-white rounded-3xl p-8 flex flex-col items-center text-center">
            <div className="relative w-32 h-32 mb-4">
              <img
                src={
                  userData.profilePic ||
                  `https://ui-avatars.com/api/?name=${userData.firstName}+${userData.lastName}`
                }
                className="w-32 h-32 rounded-full object-cover"
              />

              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleProfilePicUpload}
              />

              <button
                onClick={() => fileInputRef.current.click()}
                className="absolute bottom-1 right-1 bg-black text-white p-2 rounded-full"
              >
                {uploadingPic ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Camera size={14} />
                )}
              </button>
            </div>

            <h1 className="text-2xl font-bold">
              {userData.firstName} {userData.lastName}
            </h1>

            <p className="text-slate-500 mb-6">
              {userData.role} • {userData.address}
            </p>

            <div className="grid grid-cols-3 gap-2 w-full mb-6">
              <StatBox label="Reports" value={userData.reportCount} />
              <StatBox label="Points" value={userData.points} highlighted />
              <StatBox label="Rank" value="#3" />
            </div>
          </div>

          {/* ACCOUNT */}
          <div className="bg-white rounded-3xl p-6">
            <h3 className="text-xs font-bold text-slate-400 mb-4">
              Account
            </h3>

            <ActionRow
              icon={<Shield size={18} />}
              label="Privacy"
              onClick={() => navigate("/civic/privacy")}
            />

            <ActionRow
              icon={<SettingsIcon size={18} />}
              label="Preferences"
              onClick={() => navigate("/civic/preferences")}
            />

            <button
              onClick={logout}
              className="w-full py-3 text-red-500 font-bold"
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>

        {/* RIGHT */}
        <div className="lg:col-span-2 space-y-8">
          {/* WEEKLY */}
          <div className="bg-slate-900 text-white p-8 rounded-3xl">
            <h2 className="text-2xl font-bold mb-4">
              Weekly Activity
            </h2>

            <WeeklyActivityGraph data={weeklyActivity} />
          </div>

          {/* BADGES */}
          <div className="bg-slate-900 text-white p-8 rounded-3xl">
            <h2 className="text-2xl font-bold mb-6">
              Achievements
            </h2>

            <div className="flex gap-4">
              {userData.badges.map(b => (
                <div
                  key={b.id}
                  className="bg-slate-800 p-4 rounded-xl text-center"
                >
                  {b.label}
                </div>
              ))}
            </div>
          </div>

          {/* INFO */}
          <div className="bg-white rounded-3xl p-8">
            <h2 className="text-xl font-bold mb-6">
              Personal Info
            </h2>

            <InfoCard icon={<Mail />} label="Email" value={userData.email} />
            <InfoCard icon={<Phone />} label="Phone" value={userData.mobile} />
            <InfoCard icon={<MapPin />} label="Address" value={userData.address} />
          </div>
        </div>
      </div>
    </CivicLayout>
  );
};

/* ---------------- UI COMPONENTS ---------------- */

const StatBox = ({ label, value, highlighted }) => (
  <div className={`p-3 rounded-xl border text-center ${
    highlighted ? "bg-black text-white" : "bg-slate-50"
  }`}>
    <div className="font-bold text-xl">{value}</div>
    <div className="text-xs">{label}</div>
  </div>
);

const InfoCard = ({ icon, label, value }) => (
  <div className="flex gap-3 mb-4">
    {icon}
    <div>
      <div className="text-xs text-slate-400">{label}</div>
      <div className="font-bold">{value}</div>
    </div>
  </div>
);

const ActionRow = ({ icon, label, onClick }) => (
  <button onClick={onClick} className="flex gap-2 py-2">
    {icon} {label}
  </button>
);

/* ---------------- GRAPH ---------------- */

const WeeklyActivityGraph = ({ data }) => (
  <div className="flex gap-2">
    {data.map((v, i) => (
      <div key={i} className="flex flex-col items-center">
        <div
          className="bg-blue-500 w-4"
          style={{ height: `${v * 10 + 10}px` }}
        />
      </div>
    ))}
  </div>
);

export default Profile;