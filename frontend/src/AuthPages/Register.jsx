import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/LandingPages/Navbar";
import Footer from "../components/LandingPages/Footer";
import { Loader2, MapPin, Crosshair, Shield, User, Mail, Phone, Lock } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [userType, setUserType] = useState("citizen");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    mobile: "",
    email: "",
    password: "",
    confirmPassword: "",
    department: "",
    city: "",
  });

  const [address, setAddress] = useState("");
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [userCoords, setUserCoords] = useState({ lat: null, lng: null });

  // Department options for admin
  const departmentOptions = [
    { value: "", label: "Select Department" },
    { value: "Municipal/Waste", label: "Municipal/Waste Management" },
    { value: "Electricity Board", label: "Electricity Board" },
    { value: "Water Supply", label: "Water Supply & Sewage" },
    { value: "Traffic", label: "Traffic & Transportation" },
    { value: "Police", label: "Police & Law Enforcement" },
    { value: "Fire & Safety", label: "Fire & Safety Department" },
  ];

  // Auto-detect city from GPS
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Location not supported by your browser");
      return;
    }

    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserCoords({ lat, lng });

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`
          );
          const data = await res.json();

          const addrParts = data.address || {};
          const city =
            addrParts.city ||
            addrParts.town ||
            addrParts.village ||
            addrParts.county ||
            "";
          const state = addrParts.state || "";
          const fullAddress = data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;

          setFormData((prev) => ({ ...prev, city: city }));
          setAddress(fullAddress);
          toast.success(`Location detected: ${city}, ${state}`);
        } catch {
          toast.error("Could not detect city. Please enter manually.");
        } finally {
          setDetectingLocation(false);
        }
      },
      (err) => {
        console.error(err);
        toast.error("Location access denied");
        setDetectingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.firstName) return false;
    if (!formData.lastName) return false;
    if (!formData.mobile) return false;
    if (!formData.email) return false;
    if (!formData.password) return false;
    if (formData.password !== formData.confirmPassword) return false;

    // Validate password strength for Cognito
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      toast.error("Password must be at least 8 characters with uppercase, lowercase, number, and special character");
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    // Validate phone number (10 digits)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.mobile.replace(/\D/g, ''))) {
      toast.error("Please enter a valid 10-digit Indian mobile number");
      return false;
    }

    if (userType === "citizen" && !address) return false;
    if (userType === "admin" && !formData.department) return false;

    return true;
  };

  const handleRegistration = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);

    try {
      const fullName = `${formData.firstName} ${formData.lastName}`;

      await register(
        formData.email.trim(),
        formData.password.trim(),
        fullName,
        formData.mobile.trim(),
        userType === "citizen" ? "citizen" : "admin",
        userType === "citizen"
          ? {
            firstName: formData.firstName,
            lastName: formData.lastName,
            city: formData.city,
            address: address,
            lat: userCoords.lat,
            lng: userCoords.lng,
          }
          : {
            firstName: formData.firstName,
            lastName: formData.lastName,
            department: formData.department,
          }
      );

      toast.success("Registered successfully. Check email OTP");

      navigate("/verify-otp", {
        state: {
          email: formData.email,
          mobile: formData.mobile,
          userType,
          name: `${formData.firstName} ${formData.lastName}`,
        },
      });
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#0f172a] transition-colors duration-300">
      <Navbar />

      <div className="grow flex w-full overflow-hidden">
        {/* Left Side - Visuals */}
        <div className="hidden lg:flex w-1/2 relative flex-col justify-start pt-32 px-12 pb-12 text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-colors">
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1486325212027-8081e485255e?q=80&w=2070&auto=format&fit=crop"
              alt="Cityscape"
              className="h-full w-full object-cover opacity-20 dark:opacity-40 mix-blend-overlay"
            />
            <div className="absolute inset-0 bg-linear-to-t from-slate-100/80 via-white/50 to-slate-200/50 dark:from-[#0f172a] dark:via-[#0f172a]/80 dark:to-slate-900/90"></div>
          </div>

          <div className="relative z-10 mb-8">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                {userType === 'admin' ? 'Admin Registration' : 'Citizen Registration'}
              </h2>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/50 dark:bg-white/10 backdrop-blur-md border border-blue-200 dark:border-white/10 text-blue-800 dark:text-white text-xs font-medium mb-6">
              <Shield size={14} />
              {userType === 'admin' ? 'Official Government Portal' : 'Verified Citizen Platform'}
            </div>
            <h1 className="text-4xl font-bold leading-tight mb-4 text-slate-900 dark:text-white">
              Join {userType === 'admin' ? 'the' : ''} {userType === 'admin' ? 'Administrative' : 'Civic'} Network
            </h1>
            <p className="text-slate-600 dark:text-gray-300 text-lg max-w-md mb-8">
              {userType === 'admin'
                ? 'Manage civic operations, track reports, and improve your community.'
                : 'Report issues, track progress, and make your city better.'}
            </p>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none">
                <div className="p-2 bg-green-100 dark:bg-green-500/20 rounded-full text-green-600 dark:text-green-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 dark:text-gray-400 uppercase tracking-wider">Verified</div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">Government Platform</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="w-full lg:w-1/2 flex flex-col relative px-6 py-12 lg:p-24 justify-center bg-white dark:bg-[#0f172a] transition-colors">
          <div className="max-w-110 w-full mx-auto">
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-blue-600/20 dark:shadow-blue-900/20">
                {userType === 'admin' ? (
                  <Shield className="w-8 h-8 text-white" />
                ) : (
                  <User className="w-8 h-8 text-white" />
                )}
              </div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                Create Your Account
              </h2>
              <p className="text-slate-500 dark:text-gray-400 text-sm">Join our civic community today</p>
            </div>

            {/* Tabs */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl mb-8 border border-slate-200 dark:border-slate-700/50">
              <button
                onClick={() => setUserType('citizen')}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                  userType === 'citizen'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50'
                }`}
              >
                <User size={16} />
                Citizen
              </button>
              <button
                onClick={() => setUserType('admin')}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                  userType === 'admin'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50'
                }`}
              >
                <Shield size={16} />
                Admin
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleRegistration} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                    First Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500" size={16} />
                    <input
                      name="firstName"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-3 border border-slate-200 dark:border-slate-700 rounded-lg leading-5 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all sm:text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                    Last Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500" size={16} />
                    <input
                      name="lastName"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-3 border border-slate-200 dark:border-slate-700 rounded-lg leading-5 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all sm:text-sm"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                  Mobile Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500" size={16} />
                  <input
                    name="mobile"
                    placeholder="+91 98765 43210"
                    type="tel"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 dark:border-slate-700 rounded-lg leading-5 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all sm:text-sm"
                    required
                  />
                </div>
              </div>

              {userType === "admin" && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                    Department *
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500" size={16} />
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-3 border border-slate-200 dark:border-slate-700 rounded-lg leading-5 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all sm:text-sm appearance-none cursor-pointer"
                      required
                    >
                      {departmentOptions.map((dept) => (
                        <option key={dept.value} value={dept.value}>
                          {dept.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              {userType === "citizen" && (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                      City *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500" size={16} />
                      <input
                        name="city"
                        placeholder="Mumbai"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="block w-full pl-10 pr-10 py-3 border border-slate-200 dark:border-slate-700 rounded-lg leading-5 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all sm:text-sm"
                        required
                      />
                      <button
                        type="button"
                        onClick={handleDetectLocation}
                        disabled={detectingLocation}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-800 p-1"
                        title="Auto-detect from GPS"
                      >
                        {detectingLocation ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Crosshair size={16} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                      Address *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500" size={16} />
                      <input
                        placeholder="Street address, area, landmark"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 border border-slate-200 dark:border-slate-700 rounded-lg leading-5 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all sm:text-sm"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500" size={16} />
                  <input
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 dark:border-slate-700 rounded-lg leading-5 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all sm:text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500" size={16} />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-3 border border-slate-200 dark:border-slate-700 rounded-lg leading-5 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all sm:text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500" size={16} />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-3 border border-slate-200 dark:border-slate-700 rounded-lg leading-5 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all sm:text-sm"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showPassword"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="showPassword" className="text-sm text-slate-600 dark:text-gray-400 cursor-pointer">
                  Show passwords
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-lg shadow-blue-600/30 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <Shield size={18} />
                    Register as {userType === 'citizen' ? 'Citizen' : 'Admin'}
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700/50 text-center">
              <p className="text-slate-500 dark:text-gray-400 text-sm">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-500 dark:hover:text-blue-300 ml-1">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}