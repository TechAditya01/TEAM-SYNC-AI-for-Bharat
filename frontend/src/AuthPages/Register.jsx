import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/LandingPages/Navbar';
import Footer from '../components/LandingPages/Footer';
// Firebase imports removed for mock implementation
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Phone, Loader2, X, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useLanguage } from '../context/LanguageContext';


export default function Register() {
    const { t } = useLanguage();
    const [userType, setUserType] = useState('citizen');

    // Form State
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        mobile: '',
        email: '',
        password: '',
        confirmPassword: '',
        department: '',
        officialId: '',
        secretCode: ''
    });

    const [address, setAddress] = useState('');
    const [locationLoading, setLocationLoading] = useState(false);

    // Verification State
    const [showVerification, setShowVerification] = useState(false);
    const [mobileOtp, setMobileOtp] = useState('');
    const [serverOtp, setServerOtp] = useState(null); // Stores the generated OTP
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const navigate = useNavigate();



    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateForm = () => {
        let newErrors = {};
        if (!formData.firstName.trim()) newErrors.firstName = t('authFirstNameRequired');
        if (!formData.lastName.trim()) newErrors.lastName = t('authLastNameRequired');
        // Relax mobile validation for testing if needed, or strictly 10 digits
        if (!formData.mobile.trim()) newErrors.mobile = t('authMobileRequired');
        else if (!/^\d{10}$/.test(formData.mobile.replace(/\s/g, ''))) newErrors.mobile = t('authMobileInvalid');

        if (!formData.email.trim()) newErrors.email = t('authEmailRequired');
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = t('authEmailInvalid');

        if (!formData.password) newErrors.password = t('authPasswordRequired');
        else if (formData.password.length < 6) newErrors.password = t('authPasswordMin');

        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = t('authPasswordsNoMatch');

        if (userType === 'citizen' && !address.trim()) {
            newErrors.address = t('authAddressRequired');
        }

        if (userType === 'admin') {
            if (!formData.department) newErrors.department = t('authRequired');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const { register } = useAuth(); // Get register from context

    // --- SINGLE PHASE: REGISTER DIRECTLY (NO OTP) ---
    const handleRegistration = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        try {
            // Mock Registration via Context
            const result = await register({
                email: formData.email.trim(),
                password: formData.password.trim(), // Ensure password is trimmed to match Login logic
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                mobile: formData.mobile.trim(),
                address: userType === 'citizen' ? address.trim() : null,
                city: userType === 'citizen' ? (formData.city ? formData.city.trim() : null) : null,
                role: userType,
                department: formData.department
            });

            // Request WhatsApp OTP immediately after registration
            try {
                if (userType === 'citizen' && formData.mobile) {
                    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
                    await fetch(`${API_BASE_URL}/api/auth/send-otp`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ type: 'whatsapp', contact: formData.mobile })
                    });
                    toast.success(t('authOtpSentWhatsapp'));
                }
            } catch (otpErr) {
                console.error("OTP Send Error:", otpErr);
                // Don't block registration success, just warn
                toast.error(t('authOtpAutoSendFailed'));
            }

            toast.success(`${t('authUserRegistered')} ${formData.firstName}.`);

            // Small delay to let user see the success message
            setTimeout(() => {
                navigate('/verify-otp', {
                    state: {
                        email: formData.email,
                        mobile: formData.mobile,
                        address: userType === 'citizen' ? address : null,
                        userType: userType,
                        uid: result.uid
                    }
                });
            }, 1000);

        } catch (err) {
            console.error(err);
            toast.error(`${t('authRegistrationFailed')} ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // --- GOOGLE SIGN IN ---
    const handleGoogleSignIn = async () => {
        setLoading(true);
        try {
            // Mock Google Sign In via Context (using register for simplicity here, or login)
            await register({
                email: 'google-user@example.com',
                firstName: 'Google',
                lastName: 'User',
                mobile: null,
                role: userType,
                department: null
            });

            navigate(userType === 'citizen' ? '/citizen/dashboard' : '/admin/dashboard');

        } catch (error) {
            console.error(error);
            toast.error(`${t('authGoogleFailed')} ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleLocation = () => {
        if (!navigator.geolocation) { toast.error(t('authGeolocationUnsupported')); return; }
        setLocationLoading(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`)
                    .then(r => r.json()).then(d => {
                        setAddress(d.display_name);
                        setLocationLoading(false);
                    })
                    .catch(() => setLocationLoading(false));
            },
            () => { toast.error(t('authLocationDenied')); setLocationLoading(false); }
        );
    };

    return (
        <div className="min-h-screen flex flex-col bg-white dark:bg-[#0f172a] transition-colors duration-300">
            <Navbar />



            <div className="grow flex w-full overflow-hidden">
                {/* Visuals Left Side */}
                <div className="hidden lg:flex w-1/2 relative flex-col justify-start pt-32 px-12 pb-12 text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-colors">
                    <div className="absolute inset-0 z-0">
                        <img src="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=2144&auto=format&fit=crop" className="h-full w-full object-cover opacity-20 dark:opacity-40 mix-blend-overlay" alt="city" />
                        <div className="absolute inset-0 bg-linear-to-t from-slate-100/80 via-white/50 to-slate-200/50 dark:from-[#0f172a] dark:via-[#0f172a]/80 dark:to-slate-900/90"></div>
                    </div>
                    <div className="relative z-10 mb-8">
                        <h2 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">{t('brandName')}</h2>
                        <h1 className="text-5xl font-bold leading-tight mb-4 text-slate-900 dark:text-white">{t('authRegisterHeadingLine1')}<br /><span className="text-blue-600 dark:text-blue-400">{t('authRegisterHeadingLine2')}</span></h1>
                        <p className="text-slate-600 dark:text-gray-300 text-lg max-w-md">{t('authRegisterSubtext')}</p>
                    </div>
                </div>

                {/* Signup Form Right Side */}
                <div className="w-full lg:w-1/2 flex flex-col relative px-6 py-12 lg:p-24 justify-center bg-white dark:bg-[#0f172a] h-full overflow-y-auto transition-colors">
                    <div className="max-w-110 w-full mx-auto mt-10 lg:mt-0">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{t('brandName')}</h2>
                            <p className="text-slate-500 dark:text-gray-400 text-sm">{t('authJoinAs')} {userType === 'citizen' ? t('authCitizen') : t('authOfficial')}</p>
                        </div>

                        {/* User Type Tabs */}
                        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl mb-8 border border-slate-200 dark:border-slate-700/50">
                            {['citizen', 'admin'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setUserType(type)}
                                    className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${userType === type ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'}`}
                                >
                                    {type === 'citizen' ? t('authCitizenPortal') : t('authAdminOfficial')}
                                </button>
                            ))}
                        </div>

                        {/* Main Form */}


                        <form className="space-y-4" onSubmit={handleRegistration}>
                            <div className="flex gap-4">
                                <div className="w-1/2 space-y-2">
                                    <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">{t('authFirstName')}</label>
                                    <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder={t('authFirstNamePlaceholder')} className={`block w-full px-4 py-3 border ${errors.firstName ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-lg bg-slate-50 dark:bg-slate-800/50 dark:text-white`} />
                                </div>
                                <div className="w-1/2 space-y-2">
                                    <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">{t('authLastName')}</label>
                                    <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder={t('authLastNamePlaceholder')} className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50 dark:text-white" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">{t('authMobileNumber')}</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-700 dark:text-white border-r border-slate-200 dark:border-slate-700 pr-3 mr-2">+91</div>
                                    <input type="tel" name="mobile" value={formData.mobile} onChange={handleInputChange} placeholder={t('authMobilePlaceholder')} maxLength={10} className={`block w-full pl-16 pr-3 py-3 border ${errors.mobile ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-lg bg-slate-50 dark:bg-slate-800/50 dark:text-white`} />
                                </div>
                                {errors.mobile && <p className="text-xs text-red-500">{errors.mobile}</p>}
                            </div>

                            {userType === 'citizen' ? (
                                <div className="space-y-2">
                                    <div className="flex justify-between items-end"><label className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">{t('authAddress')}</label><button type="button" onClick={handleLocation} disabled={locationLoading} className="text-xs text-blue-600 font-medium">{locationLoading ? t('authLocating') : t('authUseCurrentLocation')}</button></div>
                                    <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder={t('authAddressPlaceholder')} className={`block w-full px-4 py-3 border ${errors.address ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-lg bg-slate-50 dark:bg-slate-800/50 dark:text-white`} />
                                    {errors.address && <p className="text-xs text-red-500">{errors.address}</p>}
                                    <input type="text" value={formData.city || ''} onChange={(e) => setFormData({ ...formData, city: e.target.value })} placeholder={t('authCityPlaceholder')} className="mt-2 block w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50 dark:text-white" />
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">{t('authDepartment')}</label>
                                    <select
                                        name="department"
                                        value={formData.department}
                                        onChange={handleInputChange}
                                        className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50 dark:text-white"
                                    >
                                        <option value="">{t('authSelectDepartment')}</option>
                                        <option value="Police">Police</option>
                                        <option value="Traffic">Traffic</option>
                                        <option value="Fire & Safety">Fire & Safety</option>
                                        <option value="Medical/Ambulance">Medical/Ambulance</option>
                                        <option value="Municipal/Waste">Municipal/Waste</option>
                                        <option value="Electricity Board">Electricity Board</option>
                                        <option value="Water Supply">Water Supply</option>
                                    </select>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">{t('authEmail')}</label>
                                <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder={t('authEmailPlaceholderGeneric')} className={`block w-full px-4 py-3 border ${errors.email ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-lg bg-slate-50 dark:bg-slate-800/50 dark:text-white`} />
                            </div>

                            <div className="flex gap-4">
                                <div className="w-1/2 space-y-2"><label className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">{t('authPassword')}</label><input type="password" name="password" value={formData.password} onChange={handleInputChange} className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50 dark:text-white" /></div>
                                <div className="w-1/2 space-y-2"><label className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">{t('authConfirm')}</label><input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50 dark:text-white" /></div>
                            </div>



                            <button type="submit" disabled={loading} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg disabled:opacity-70 transition-all flex justify-center items-center gap-2">{loading ? <Loader2 className="animate-spin" /> : t('authSignUpNow')}</button>
                        </form>

                        <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700/50 text-center"><p className="text-slate-500 dark:text-gray-400 text-sm">{t('authAlreadyMember')} <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-500 ml-1">{t('login')}</Link></p></div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
