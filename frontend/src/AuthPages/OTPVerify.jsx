import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Mail, CheckCircle, Loader2 } from 'lucide-react';
import AuthCard from '../components/auth/AuthCard';
import Button from '../components/ui/Button';
import OTPInput from '../components/auth/OTPInput';
import { useLanguage } from '../context/LanguageContext';

const OTPVerify = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { email, mobile, userType, mode, uid: stateUid, name: userName } = location.state || {};
    const { t } = useLanguage();

    const [emailOtp, setEmailOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false); // Track if OTP has been sent
    const [resendTimer, setResendTimer] = useState(60); // Cooldown timer in seconds
    const [canResend, setCanResend] = useState(false); // Can resend after cooldown

    // Only email verification required
    const [mobileVerified, setMobileVerified] = useState(true);
    const [emailVerified, setEmailVerified] = useState(false);

    const [loadingEmail, setLoadingEmail] = useState(false);

    useEffect(() => {
        // Validation: Only email required
        if (!email) {
            toast.error(t('authNoVerificationDetails') || 'Email is required');
            navigate(mode === 'login' ? '/login' : '/register');
            return;
        }
        
        // AUTO-SEND OTP when component mounts (user lands on page)
        if (email && !otpSent) {
            console.log('📧 Auto-sending OTP to:', email);
            sendOtp(email);
            setOtpSent(true);
            startResendTimer();
        }
    }, [email, navigate, mode, userType, t]);

    // Timer for resend cooldown
    useEffect(() => {
        let interval = null;
        if (resendTimer > 0 && !canResend) {
            interval = setInterval(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);
        } else if (resendTimer === 0) {
            setCanResend(true);
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [resendTimer, canResend]);

    // Remove auto-redirect - only redirect after actual OTP verification
    useEffect(() => {
        const finalizeVerification = async () => {
            if (emailVerified) {
                try {
                    toast.success(t('authVerificationComplete') || "Email verified successfully!");

                    // Account is now confirmed in Cognito
                    // Redirect to dashboard/admin based on role
                    setTimeout(() => {
                        console.log('Redirecting to dashboard');
                        navigate(userType === 'admin' ? '/admin' : '/dashboard');
                    }, 1500);
                } catch (err) {
                    console.error("Verification finalization error:", err);
                    toast.error(err.message || "Failed to complete verification");
                }
            }
        };
        finalizeVerification();
    }, [emailVerified, userType, navigate, t]);

    const sendOtp = async (contact) => {
        // Prevent multiple sends during cooldown
        if (!canResend && otpSent) {
            toast.error(`Please wait ${resendTimer} seconds before requesting a new OTP`);
            return;
        }

        setLoadingEmail(true);

        try {
            const API_BASE_URL = import.meta.env.VITE_AWS_API_GATEWAY_URL || '';
            const res = await fetch(`${API_BASE_URL}/api/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'email',
                    contact,
                    name: userName || 'User'
                })
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(t('authEmailOtpSent') || 'OTP sent to your email! Please check your inbox and spam folder.');
                console.log('✅ OTP sent successfully. Check your email at:', contact);
                setOtpSent(true);
                startResendTimer();
                // ❌ REMOVED: Don't show OTP in console for security
                // The OTP should only be visible in the user's email
            } else {
                throw new Error(data.detail || 'Failed to send OTP');
            }
        } catch (error) {
            console.error('❌ Send OTP Error:', error);
            toast.error(error.message || 'Failed to send OTP. Please try again.');
        } finally {
            setLoadingEmail(false);
        }
    };

    const startResendTimer = () => {
        setResendTimer(60); // 60 seconds cooldown
        setCanResend(false);
    };

    const verifyLocalOtp = async (contact, otp) => {
        if (otp.length !== 6) return toast.error(t('authEnterValidOtp'));

        setLoadingEmail(true);
        try {
            const API_BASE_URL = import.meta.env.VITE_AWS_API_GATEWAY_URL || '';
            const res = await fetch(`${API_BASE_URL}/api/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: contact, code: otp })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.detail || 'OTP verification failed');
            }

            // OTP verified successfully on backend
            // No need to call Cognito confirmRegistration since we use our own OTP system
            console.log('✅ OTP verified on backend');
            setEmailVerified(true);
            toast.success(t('authEmailVerified') || "Email Verified Successfully!");

        } catch (error) {
            console.error("OTP Verification Error:", error);
            toast.error(error.message || t('authInvalidOtp'));
        } finally {
            setLoadingEmail(false);
        }
    };

    if (!email) return null;

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
            <AuthCard
                title={mode === 'login' ? t('authTwoFactorTitle') : t('authAccountVerificationTitle')}
                subtitle={t('authVerifyEmailSubtitle') || 'Please verify your email to continue'}
            >
                <div className="space-y-8">

                    {/* Email Verification Section - Always Show */}
                    <div className={`p-4 rounded-xl border ${emailVerified ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-slate-200 dark:border-slate-800'}`}>
                        {/* ... (Keep existing email verification UI) ... */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <Mail className={`w-5 h-5 ${emailVerified ? 'text-green-600' : 'text-slate-500'}`} />
                                <div>
                                    <h3 className="font-semibold text-slate-900 dark:text-white">{t('authEmailVerification')}</h3>
                                    <p className="text-xs text-slate-500">{email}</p>
                                </div>
                            </div>
                            {emailVerified ? (
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            ) : (
                                <button 
                                    onClick={() => sendOtp(email)} 
                                    disabled={loadingEmail || (!canResend && otpSent)}
                                    className={`text-sm ${(!canResend && otpSent) ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:underline'}`}
                                >
                                    {loadingEmail ? t('authSending') : (!canResend && otpSent ? `Resend OTP in ${resendTimer}s` : (otpSent ? t('authResendOtp') || 'Resend OTP' : t('authSendOtp')))}
                                </button>
                            )}
                        </div>

                        {!emailVerified && (
                            <div className="space-y-3">
                                <OTPInput length={6} onComplete={(val) => setEmailOtp(val)} />
                                <Button
                                    onClick={() => verifyLocalOtp(email, emailOtp)}
                                    disabled={loadingEmail || emailOtp.length !== 6}
                                    className="w-full h-9 text-sm"
                                >
                                    {loadingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : t('authVerifyEmail')}
                                </Button>
                            </div>
                        )}
                    </div>

                </div>
            </AuthCard>
        </div>
    );
};

export default OTPVerify;
