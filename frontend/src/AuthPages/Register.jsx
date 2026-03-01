import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/LandingPages/Navbar";
import Footer from "../components/LandingPages/Footer";
import { Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [userType, setUserType] = useState("citizen");
  const [loading, setLoading] = useState(false);

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
            }
          : {
              firstName: formData.firstName,
              lastName: formData.lastName,
              department: formData.department,
            }
      );

      toast.success("Registered successfully. Check email OTP");

      navigate("/otp-verify", {
        state: {
          email: formData.email,
          mobile: formData.mobile,
          userType,
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
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#0f172a]">
      <Navbar />

      <div className="flex justify-center items-center py-10 px-4">
        <div className="w-full max-w-lg bg-white dark:bg-slate-900 p-8 rounded-xl shadow">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Register
          </h2>

          {/* USER TYPE */}
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => setUserType("citizen")}
              className={`flex-1 py-2 rounded ${
                userType === "citizen"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200"
              }`}
            >
              Citizen
            </button>

            <button
              type="button"
              onClick={() => setUserType("admin")}
              className={`flex-1 py-2 rounded ${
                userType === "admin"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200"
              }`}
            >
              Admin
            </button>
          </div>

          <form onSubmit={handleRegistration} className="space-y-4">
            <div className="flex gap-2">
              <input
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-1/2 border p-2 rounded"
              />
              <input
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-1/2 border p-2 rounded"
              />
            </div>

            <input
              name="mobile"
              placeholder="Mobile"
              value={formData.mobile}
              onChange={handleInputChange}
              className="w-full border p-2 rounded"
            />

            {userType === "citizen" && (
              <>
                <input
                  name="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded"
                />
                <input
                  placeholder="Address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full border p-2 rounded"
                />
              </>
            )}

            {userType === "admin" && (
              <input
                name="department"
                placeholder="Department"
                value={formData.department}
                onChange={handleInputChange}
                className="w-full border p-2 rounded"
              />
            )}

            <input
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full border p-2 rounded"
            />

            <div className="flex gap-2">
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-1/2 border p-2 rounded"
              />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-1/2 border p-2 rounded"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white rounded flex justify-center"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Register"}
            </button>
          </form>

          <p className="text-center mt-4 text-sm">
            Already have account?{" "}
            <Link to="/login" className="text-blue-600">
              Login
            </Link>
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}