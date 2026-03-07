import React from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  LogOut,
  Settings,
  Shield,
  Camera,
  Loader2,
  Edit2,
  Save,
  X,
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
  });

  const [uploadingPic, setUploadingPic] = React.useState(false);
  const [editMode, setEditMode] = React.useState(false);
  const [editData, setEditData] = React.useState({});
  const fileInputRef = React.useRef(null);

  React.useEffect(() => {
    if (!currentUser) return navigate("/login");

    const API = import.meta.env.VITE_AWS_API_GATEWAY_URL || "";
    const uid = currentUser.sub || localStorage.getItem("uid") || "";
    if (!uid) return;

    fetch(`${API}/api/user/${uid}`)
      .then(r => r.json())
      .then((userData) => {
        if (userData.user) {
          const user = {
            ...userData.user,
            reportCount: userData.reportCount || 0,
            points: userData.user.points || 0,
          };
          setUserData(user);
          setEditData(user);
        }
      })
      .catch(() => toast.error("Failed to load profile"));
  }, [currentUser, navigate]);

  const handleProfilePicUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file)
      return;

    if (!file.type.startsWith("image/"))
      return toast.error("Select image");

    if (file.size > 5 * 1024 * 1024)
      return toast.error("Max 5MB");

    setUploadingPic(true);
    const t = toast.loading("Uploading...");

    try {
      const API = import.meta.env.VITE_AWS_API_GATEWAY_URL || "";
      const uid = currentUser.sub || localStorage.getItem("uid") || "";

      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onloadend = async () => {
        const imageBase64 = reader.result.split(',')[1]; // Remove data:image/jpeg;base64, prefix
        const filename = file.name;

        const res = await fetch(`${API}/api/user/upload-avatar`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: uid, imageBase64, filename }),
        });

        const { url } = await res.json();
        
        // Add timestamp to force browser to reload the image
        const urlWithCache = `${url}?t=${Date.now()}`;
        setUserData(prev => ({ ...prev, profilePic: urlWithCache }));
        
        toast.success("Updated!", { id: t });
        setUploadingPic(false);
      };
      
      reader.onerror = () => {
        toast.error("Failed to read file", { id: t });
        setUploadingPic(false);
      };
    } catch (error) {
      toast.error("Upload failed", { id: t });
      setUploadingPic(false);
    }
  };

  const handleEditToggle = () => {
    if (editMode) {
      setEditData(userData);
    }
    setEditMode(!editMode);
  };

  const handleEditChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      const API = import.meta.env.VITE_AWS_API_GATEWAY_URL || "";
      const uid = currentUser.sub || localStorage.getItem("uid") || "";

      const res = await fetch(`${API}/api/user/${uid}/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });

      if (res.ok) {
        const result = await res.json();
        setUserData(result.user || editData);
        setEditMode(false);
        toast.success("Profile updated!");
      } else {
        const error = await res.json().catch(() => ({ message: "Failed to update profile" }));
        toast.error(error.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Update failed");
    }
  };

  if (!currentUser) return null;

  const displayName = userData.firstName && userData.lastName 
    ? `${userData.firstName} ${userData.lastName}` 
    : currentUser.email?.split('@')[0] || 'Citizen';

  return (
    <CivicLayout>
      <div className="max-w-2xl mx-auto p-4 md:p-8">
        {/* Profile Header */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 mb-6 border border-slate-200 dark:border-slate-700">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
            {/* Avatar & Name */}
            <div className="flex gap-6 items-center">
              <div className="relative">
                <img
                  src={
                    userData.profilePic ||
                    `https://ui-avatars.com/api/?name=${userData.firstName}+${userData.lastName}&background=random&color=fff`
                  }
                  className="w-24 h-24 rounded-full object-cover border-2 border-blue-600"
                  alt="Profile"
                />

                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleProfilePicUpload}
                />

                <button
                  onClick={() => fileInputRef.current.click()}
                  disabled={uploadingPic}
                  className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {uploadingPic ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Camera size={14} />
                  )}
                </button>
              </div>

              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {displayName}
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  {userData.email}
                </p>
              </div>
            </div>

            {/* Edit Button */}
            <button
              onClick={handleEditToggle}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-2 transition-colors"
            >
              {editMode ? <X size={16} /> : <Edit2 size={16} />}
              {editMode ? 'Cancel' : 'Edit'}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <StatBox label="Reports" value={userData.reportCount} />
          <StatBox label="Points" value={userData.points} />
          <StatBox label="Rank" value="#3" />
        </div>

        {/* Personal Info */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 mb-6 border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
            Personal Information
          </h2>

          {editMode ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  First Name
                </label>
                <input
                  type="text"
                  value={editData.firstName}
                  onChange={(e) => handleEditChange('firstName', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Last Name
                </label>
                <input
                  type="text"
                  value={editData.lastName}
                  onChange={(e) => handleEditChange('lastName', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Phone
                </label>
                <input
                  type="tel"
                  value={editData.mobile}
                  onChange={(e) => handleEditChange('mobile', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Address
                </label>
                <input
                  type="text"
                  value={editData.address}
                  onChange={(e) => handleEditChange('address', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={handleSaveProfile}
                className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Save size={16} />
                Save Changes
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <InfoRow icon={<Mail size={18} />} label="Email" value={userData.email} />
              <InfoRow icon={<Phone size={18} />} label="Phone" value={userData.mobile || 'Not set'} />
              <InfoRow icon={<MapPin size={18} />} label="Address" value={userData.address || 'Not set'} />
            </div>
          )}
        </div>

        {/* Account Settings */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
            Account Settings
          </h2>

          <div className="space-y-2">
            <button
              onClick={() => navigate("/privacy-security")}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <Shield size={18} />
              <span>Privacy & Security</span>
            </button>
            <button
              onClick={() => navigate("/preferences")}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <Settings size={18} />
              <span>Preferences</span>
            </button>
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </CivicLayout>
  );
};

/* ============ UI COMPONENTS ============ */

const StatBox = ({ label, value }) => (
  <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700 text-center">
    <div className="text-2xl font-bold text-slate-900 dark:text-white">{value}</div>
    <div className="text-sm text-slate-600 dark:text-slate-400">{label}</div>
  </div>
);

const InfoRow = ({ icon, label, value }) => (
  <div className="flex gap-3 items-center py-2">
    <div className="text-slate-500 dark:text-slate-400">{icon}</div>
    <div className="flex-1">
      <p className="text-xs text-slate-600 dark:text-slate-400">{label}</p>
      <p className="font-semibold text-slate-900 dark:text-white">{value}</p>
    </div>
  </div>
);

export default Profile;
