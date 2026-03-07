import React, { useState, useEffect, useRef } from 'react';
import {
    Send, AlertTriangle, CheckCircle,
    Clock, Smartphone, MapPin, Users,
    MessageSquare, Bell, Radio, Loader2,
    Sparkles, Info, TrendingUp, Activity,
    Zap, Target, BarChart3, RefreshCw
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { toast } from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_AWS_API_GATEWAY_URL || '';

const mockUser = {
    department: "Fire Department",
    firstName: "Admin",
    lastName: "Officer"
};

const ALERT_TYPES = [
    { id: "Fire Alert", label: "Fire Alert", color: "red", icon: "🔥", gradient: "from-red-500 to-orange-500" },
    { id: "Flood Warning", label: "Flood Warning", color: "blue", icon: "🌊", gradient: "from-blue-500 to-cyan-500" },
    { id: "Critical Alert", label: "Critical Alert", color: "orange", icon: "⚠️", gradient: "from-orange-500 to-yellow-500" },
    { id: "SOS Emergency", label: "SOS Emergency", color: "red", icon: "🚨", gradient: "from-red-600 to-pink-600" },
    { id: "Announcement", label: "Announcement", color: "green", icon: "📢", gradient: "from-green-500 to-emerald-500" }
];

const Broadcast = () => {
    const location = useLocation();
    const historyPollInterval = useRef(null);

    const [target, setTarget] = useState(location.state?.targetArea || 'Sector 4');
    const [type, setType] = useState('Fire Alert');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [sendSMS, setSendSMS] = useState(true);
    const [sendWhatsApp, setWhatsApp] = useState(true);
    const [reachCount, setReachCount] = useState(0);
    const [targetCity, setTargetCity] = useState('');
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(new Date());
    const [autoRefresh, setAutoRefresh] = useState(true);

    // Real-time stats
    const totalSent = history.length;
    const totalReach = history.reduce((sum, h) => sum + (h.reach || 0), 0);
    const totalSMS = history.reduce((sum, h) => sum + (h.smsSent || 0), 0);
    const totalWhatsApp = history.reduce((sum, h) => sum + (h.waSent || 0), 0);

    // ---------------- Auto Fill from Incident ----------------
    useEffect(() => {
        if (location.state?.incidentId) {
            const fetchIncident = async () => {
                try {
                    const res = await fetch(`${import.meta.env.VITE_AWS_API_GATEWAY_URL}/api/reports/${location.state.incidentId}`);
                    if (!res.ok) return;

                    const data = await res.json();
                    const r = data.report;

                    setType(r.category || 'General Alert');
                    const addr = r.location?.address || '';
                    setTarget(addr.split(',')[0] || 'Target Area');

                    setMessage(
                        `OFFICIAL ALERT: ${r.category} reported at ${addr}. Please take precautions.`
                    );
                } catch {
                    toast.error("Incident auto-fill failed");
                }
            };
            fetchIncident();
        }
    }, [location.state?.incidentId]);

    // ---------------- Load History from Alerts Table ----------------
    const fetchHistory = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/alerts/history`);
            if (res.ok) {
                const data = await res.json();
                setHistory(data.alerts || []);
                setLastUpdate(new Date());
            }
        } catch (err) {
            console.error('Failed to load alert history:', err);
            // Fallback mock
            setHistory([
                { id: 1, area: "Sector 4", type: "Fire Alert", timestamp: Date.now() - 3600000, reach: 2100, status: "Delivered", smsSent: 45, waSent: 38 },
                { id: 2, area: "MG Road", type: "Flood Warning", timestamp: Date.now() - 7200000, reach: 3200, status: "Delivered", smsSent: 82, waSent: 71 },
            ]);
        } finally {
            setLoadingHistory(false);
        }
    };

    useEffect(() => {
        fetchHistory();

        // Real-time polling every 10 seconds if auto-refresh is enabled
        if (autoRefresh) {
            historyPollInterval.current = setInterval(fetchHistory, 10000);
        }

        return () => {
            if (historyPollInterval.current) {
                clearInterval(historyPollInterval.current);
            }
        };
    }, [autoRefresh]);

    // ---------------- Send Broadcast ----------------
    const handleSend = async () => {
        if (!message.trim()) return;
        if (!target.trim()) return toast.error('Enter a target area/city');

        setSending(true);

        const payload = {
            area: target,
            city: targetCity || target,
            type,
            message,
            department: mockUser.department,
            sender: mockUser.firstName + " " + mockUser.lastName,
            timestamp: Date.now(),
            sendSMS,
            sendWhatsApp,
        };

        try {
            const res = await fetch(`${API_BASE}/api/broadcast`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            const reach = data.reach || 0;
            const smsSent = data.smsSent || 0;
            const waSent = data.waSent || 0;
            setReachCount(reach);

            const historyEntry = {
                ...payload,
                reach,
                smsSent,
                waSent,
                status: "Delivered"
            };
            setHistory(prev => [historyEntry, ...prev]);

            setSending(false);
            setSent(true);

            if ((sendSMS && smsSent > 0) || (sendWhatsApp && waSent > 0)) {
                toast.success(`Alert broadcast to ${reach} users. SMS: ${smsSent}, WA: ${waSent} sent in "${target}"`);
            } else {
                toast.success(`Alert broadcast to ${reach} users in "${target}"`);
            }

            setTimeout(() => setSent(false), 4000);
            
            // Refresh history immediately after sending
            fetchHistory();
        } catch {
            setSending(false);
            toast.error("Broadcast failed");
        }
    };

    // ---------------- AI Generate ----------------
    const generateAI = () => {
        if (!target || !type)
            return toast.error("Select Target & Type first");

        setIsGeneratingAI(true);
        setMessage("✨ Generating AI-powered alert message...");

        setTimeout(() => {
            const alertType = ALERT_TYPES.find(t => t.id === type);
            setMessage(
                `${alertType?.icon || '🚨'} ${type.toUpperCase()} - ${target.toUpperCase()}

⚠️ OFFICIAL ALERT: Authorities have reported a ${type.toLowerCase()} in your area.

🔹 Immediate Action Required:
• Stay alert and follow official instructions
• Avoid the affected zone
• Keep emergency contacts ready

📍 Location: ${target}
⏰ Issued: ${new Date().toLocaleTimeString()}

Stay safe and informed.
- Nagar Alert Hub`
            );
            setIsGeneratingAI(false);
            toast.success("AI message generated successfully!");
        }, 1200);
    };

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto space-y-6 p-6">

                {/* HEADER WITH REAL-TIME STATS */}
                <div className="bg-gradient-to-br from-red-500 via-orange-500 to-pink-500 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                    {/* Animated Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse"></div>
                        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse delay-1000"></div>
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-start justify-between flex-wrap gap-6">
                            <div className="flex-1 min-w-[300px]">
                                <div className="flex items-center gap-4 mb-3">
                                    <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
                                        <Radio className="text-white" size={32} />
                                    </div>
                                    <div>
                                        <h1 className="text-4xl font-bold mb-1">Broadcast Alert System</h1>
                                        <p className="text-white/90 text-sm flex items-center gap-2">
                                            <Activity size={16} className="animate-pulse" />
                                            Real-time emergency alert broadcasting
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Real-time Stats Grid */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Send size={18} className="text-white/80" />
                                        <span className="text-xs text-white/70 uppercase font-bold">Total Sent</span>
                                    </div>
                                    <div className="text-3xl font-bold">{totalSent}</div>
                                </div>

                                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Users size={18} className="text-white/80" />
                                        <span className="text-xs text-white/70 uppercase font-bold">Total Reach</span>
                                    </div>
                                    <div className="text-3xl font-bold">{totalReach.toLocaleString()}</div>
                                </div>

                                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Smartphone size={18} className="text-white/80" />
                                        <span className="text-xs text-white/70 uppercase font-bold">SMS Sent</span>
                                    </div>
                                    <div className="text-3xl font-bold">{totalSMS}</div>
                                </div>

                                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                                    <div className="flex items-center gap-2 mb-2">
                                        <MessageSquare size={18} className="text-white/80" />
                                        <span className="text-xs text-white/70 uppercase font-bold">WhatsApp</span>
                                    </div>
                                    <div className="text-3xl font-bold">{totalWhatsApp}</div>
                                </div>
                            </div>
                        </div>

                        {/* Last Update Indicator */}
                        <div className="mt-6 flex items-center justify-between text-xs text-white/70">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                <span>Live • Last updated: {lastUpdate.toLocaleTimeString()}</span>
                            </div>
                            <button
                                onClick={() => setAutoRefresh(!autoRefresh)}
                                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-all"
                            >
                                <RefreshCw size={14} className={autoRefresh ? 'animate-spin' : ''} />
                                Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* GRID */}
                <div className="grid lg:grid-cols-3 gap-6">

                    {/* COMPOSE - Takes 2 columns */}
                    <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
                        <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-6">
                            <h2 className="font-bold text-xl flex items-center gap-3 text-white">
                                <div className="bg-white/20 p-2 rounded-xl">
                                    <Send size={22} className="text-white" />
                                </div>
                                Compose Alert
                            </h2>
                            <p className="text-slate-300 text-sm mt-2">Fill in the details to broadcast your alert</p>
                        </div>

                        <div className="p-8 space-y-6">
                            {/* Target Area / City */}
                            <div className="group">
                                <label className="text-xs font-bold text-slate-700 uppercase mb-3 block flex items-center gap-2">
                                    <Target size={16} className="text-red-500" /> Target Area / City
                                </label>
                                <div className="relative">
                                    <MapPin size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-500 transition-colors" />
                                    <input
                                        value={target}
                                        onChange={e => { setTarget(e.target.value); setTargetCity(e.target.value); }}
                                        className="w-full pl-14 pr-4 py-4 border-2 border-slate-200 rounded-2xl focus:border-red-400 focus:ring-4 focus:ring-red-100 transition-all outline-none text-slate-700 font-medium text-lg"
                                        placeholder="e.g. Sector 4, Mumbai, Delhi"
                                    />
                                </div>
                            </div>

                            {/* Alert Type */}
                            <div>
                                <label className="text-xs font-bold text-slate-700 uppercase mb-3 block flex items-center gap-2">
                                    <Zap size={16} className="text-orange-500" /> Alert Type
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {ALERT_TYPES.map(t => (
                                        <button
                                            key={t.id}
                                            onClick={() => setType(t.id)}
                                            className={`relative p-4 rounded-2xl text-sm border-2 transition-all font-bold flex flex-col items-center gap-2 group overflow-hidden ${type === t.id
                                                ? "border-transparent shadow-lg scale-105"
                                                : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-md"
                                                }`}
                                        >
                                            {type === t.id && (
                                                <div className={`absolute inset-0 bg-gradient-to-br ${t.gradient} opacity-10`}></div>
                                            )}
                                            <span className="text-3xl relative z-10 group-hover:scale-110 transition-transform">{t.icon}</span>
                                            <span className={`text-xs relative z-10 ${type === t.id ? `text-${t.color}-700` : 'text-slate-600'}`}>
                                                {t.label}
                                            </span>
                                            {type === t.id && (
                                                <div className="absolute top-2 right-2">
                                                    <CheckCircle size={16} className="text-green-600" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Message */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <label className="text-xs font-bold text-slate-700 uppercase flex items-center gap-2">
                                        <MessageSquare size={16} className="text-blue-500" /> Alert Message
                                    </label>
                                    <button
                                        onClick={generateAI}
                                        disabled={isGeneratingAI}
                                        className="text-xs text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-bold flex items-center gap-2 px-4 py-2 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                                    >
                                        <Sparkles size={16} className={isGeneratingAI ? 'animate-spin' : ''} />
                                        {isGeneratingAI ? 'Generating...' : 'AI Generate'}
                                    </button>
                                </div>
                                <textarea
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    className="w-full p-5 border-2 border-slate-200 rounded-2xl h-44 focus:border-red-400 focus:ring-4 focus:ring-red-100 transition-all outline-none resize-none text-slate-700 leading-relaxed"
                                    placeholder="Type your alert message here..."
                                />
                                <div className="text-xs text-slate-400 mt-2 flex items-center justify-between bg-slate-50 p-3 rounded-xl">
                                    <span className="flex items-center gap-2">
                                        <BarChart3 size={14} />
                                        {message.length} characters
                                    </span>
                                    {message.length > 160 && (
                                        <span className="text-orange-600 font-medium flex items-center gap-1">
                                            <AlertTriangle size={14} />
                                            Long message may be split
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Delivery Channels */}
                            <div>
                                <label className="text-xs font-bold text-slate-700 uppercase mb-3 block flex items-center gap-2">
                                    <Bell size={16} className="text-purple-500" /> Delivery Channels
                                </label>
                                <div className="space-y-3">
                                    {/* SMS Toggle */}
                                    <div className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all cursor-pointer ${sendSMS 
                                        ? 'bg-gradient-to-r from-slate-50 to-slate-100 border-slate-300 shadow-md' 
                                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                                    }`}>
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-xl transition-all ${sendSMS ? 'bg-slate-600 shadow-lg' : 'bg-slate-400'}`}>
                                                <Smartphone size={22} className="text-white" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-slate-800">SMS via AWS SNS</div>
                                                <div className="text-xs text-slate-500 mt-0.5">Direct SMS to registered numbers</div>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={sendSMS}
                                                onChange={e => setSendSMS(e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-16 h-8 bg-slate-300 peer-focus:ring-4 peer-focus:ring-slate-200 rounded-full peer peer-checked:after:translate-x-8 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:bg-slate-600 shadow-inner"></div>
                                        </label>
                                    </div>

                                    {/* WhatsApp Toggle */}
                                    <div className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all cursor-pointer ${sendWhatsApp 
                                        ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 shadow-md' 
                                        : 'bg-green-50/50 border-green-200 hover:border-green-300'
                                    }`}>
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-xl transition-all ${sendWhatsApp ? 'bg-green-600 shadow-lg' : 'bg-green-400'}`}>
                                                <MessageSquare size={22} className="text-white" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-green-800">WhatsApp via Green API</div>
                                                <div className="text-xs text-green-600 mt-0.5">Instant messaging delivery</div>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={sendWhatsApp}
                                                onChange={e => setWhatsApp(e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-16 h-8 bg-green-300 peer-focus:ring-4 peer-focus:ring-green-200 rounded-full peer peer-checked:after:translate-x-8 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:bg-green-600 shadow-inner"></div>
                                        </label>
                                    </div>
                                </div>

                                {(sendSMS || sendWhatsApp) && (
                                    <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl text-sm text-blue-800 flex items-start gap-3">
                                        <Info size={20} className="flex-shrink-0 mt-0.5 text-blue-600" />
                                        <div>
                                            <span className="font-bold">Ready to broadcast:</span> Alert will be sent to citizens in <span className="font-bold text-blue-900">{target || 'selected area'}</span> via {sendSMS && <span className="font-bold">SMS</span>}{sendSMS && sendWhatsApp && ' & '}{sendWhatsApp && <span className="font-bold">WhatsApp</span>}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Send Button */}
                            <button
                                onClick={handleSend}
                                disabled={sending || sent || !message.trim() || !target.trim()}
                                className={`w-full py-5 rounded-2xl text-white flex items-center justify-center gap-3 font-bold text-lg transition-all shadow-xl relative overflow-hidden group ${sent 
                                    ? "bg-gradient-to-r from-green-600 to-emerald-600"
                                    : sending
                                    ? "bg-gradient-to-r from-orange-500 to-red-500"
                                    : !message.trim() || !target.trim()
                                    ? "bg-slate-300 cursor-not-allowed"
                                    : "bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 hover:shadow-2xl active:scale-98"
                                    }`}
                            >
                                {!sent && !sending && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                )}
                                {sending ? (
                                    <><Loader2 size={24} className="animate-spin" /> Broadcasting Alert...</>
                                ) : sent ? (
                                    <><CheckCircle size={24} /> Alert Sent to {reachCount} Users</>
                                ) : (
                                    <><Send size={24} /> Broadcast Alert Now</>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* PREVIEW - Takes 1 column */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 sticky top-6 overflow-hidden">
                            <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-5">
                                <h3 className="font-bold text-base flex items-center gap-2 text-white">
                                    <Smartphone size={18} className="text-white" /> Live Preview
                                </h3>
                                <p className="text-slate-300 text-xs mt-1">See how your alert will appear</p>
                            </div>
                            <div className="p-8 flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                                <div className="w-full max-w-sm">
                                    {/* Phone Mockup */}
                                    <div className="bg-gradient-to-b from-slate-900 to-black rounded-[3rem] p-4 shadow-2xl">
                                        <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-inner">
                                            {/* Phone Notch */}
                                            <div className="bg-slate-900 h-6 rounded-b-3xl mx-auto w-32"></div>
                                            
                                            {/* Phone Header */}
                                            <div className="bg-gradient-to-r from-red-500 to-orange-500 px-5 py-4 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center animate-pulse">
                                                        <Bell size={18} className="text-white" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-white">Emergency Alert</div>
                                                        <div className="text-[10px] text-white/80">Just now</div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Alert Content */}
                                            <div className="p-5 min-h-[240px] bg-white">
                                                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-200">
                                                    <span className="text-2xl animate-bounce">
                                                        {ALERT_TYPES.find(t => t.id === type)?.icon || '📢'}
                                                    </span>
                                                    <div className="flex-1">
                                                        <div className="text-xs font-bold text-red-600 uppercase">
                                                            {type}
                                                        </div>
                                                        <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                                                            <MapPin size={10} /> {target || 'Target Area'}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                                                    {message || (
                                                        <span className="text-slate-400 italic">
                                                            Your alert message will appear here...
                                                        </span>
                                                    )}
                                                </div>
                                                
                                                {/* Delivery Indicators */}
                                                {message && (
                                                    <div className="mt-4 pt-4 border-t border-slate-200 flex items-center gap-2 text-[10px]">
                                                        {sendSMS && (
                                                            <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-full">
                                                                <Smartphone size={10} className="text-slate-600" />
                                                                <span className="text-slate-600 font-medium">SMS</span>
                                                            </div>
                                                        )}
                                                        {sendWhatsApp && (
                                                            <div className="flex items-center gap-1 bg-green-100 px-2 py-1 rounded-full">
                                                                <MessageSquare size={10} className="text-green-600" />
                                                                <span className="text-green-600 font-medium">WhatsApp</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* HISTORY */}
                <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-6 flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h2 className="font-bold text-xl flex items-center gap-3 text-white">
                                <div className="bg-white/20 p-2 rounded-xl">
                                    <Clock size={22} className="text-white" />
                                </div>
                                Broadcast History
                            </h2>
                            <p className="text-slate-300 text-sm mt-2">Track all sent alerts and their delivery status in real-time</p>
                        </div>
                        {history.length > 0 && (
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={fetchHistory}
                                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl transition-all text-sm font-medium"
                                >
                                    <RefreshCw size={16} />
                                    Refresh
                                </button>
                                <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/20">
                                    <span className="text-white/70 text-xs">Total Alerts:</span>
                                    <span className="font-bold text-white ml-2 text-lg">{history.length}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {loadingHistory ? (
                        <div className="p-16 text-center">
                            <Loader2 size={40} className="animate-spin mx-auto mb-4 text-slate-300" />
                            <p className="text-slate-500 font-medium">Loading broadcast history...</p>
                            <p className="text-xs text-slate-400 mt-2">Please wait</p>
                        </div>
                    ) : history.length === 0 ? (
                        <div className="p-16 text-center">
                            <div className="bg-gradient-to-br from-slate-100 to-slate-200 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
                                <Send size={36} className="text-slate-400" />
                            </div>
                            <p className="text-slate-600 font-bold text-lg">No broadcasts sent yet</p>
                            <p className="text-sm text-slate-400 mt-2">Your broadcast history will appear here once you send your first alert</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b-2 border-slate-200">
                                    <tr>
                                        <th className="p-5 text-left font-bold text-slate-700 text-xs uppercase tracking-wide">Area</th>
                                        <th className="p-5 text-left font-bold text-slate-700 text-xs uppercase tracking-wide">Type</th>
                                        <th className="p-5 text-left font-bold text-slate-700 text-xs uppercase tracking-wide">Time</th>
                                        <th className="p-5 text-left font-bold text-slate-700 text-xs uppercase tracking-wide">Reach</th>
                                        <th className="p-5 text-left font-bold text-slate-700 text-xs uppercase tracking-wide">Delivery</th>
                                        <th className="p-5 text-left font-bold text-slate-700 text-xs uppercase tracking-wide">Status</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {history.map((h, idx) => {
                                        const alertType = ALERT_TYPES.find(t => t.id === h.type);
                                        const isRecent = Date.now() - h.timestamp < 60000; // Less than 1 minute
                                        
                                        return (
                                            <tr 
                                                key={h.id || h.alert_id || h.timestamp} 
                                                className={`border-b border-slate-100 hover:bg-slate-50 transition-all ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} ${isRecent ? 'animate-pulse-slow' : ''}`}
                                            >
                                                <td className="p-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-2.5 rounded-xl shadow-sm">
                                                            <MapPin size={16} className="text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-slate-800">{h.area}</div>
                                                            {isRecent && (
                                                                <div className="text-[10px] text-green-600 font-medium flex items-center gap-1 mt-0.5">
                                                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                                                    Just sent
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-5">
                                                    <div className={`px-4 py-2 bg-gradient-to-r ${alertType?.gradient || 'from-slate-500 to-slate-600'} text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-md`}>
                                                        <span className="text-base">{alertType?.icon || '📢'}</span>
                                                        {h.type}
                                                    </div>
                                                </td>
                                                <td className="p-5 text-slate-600">
                                                    <div className="flex items-center gap-2">
                                                        <Clock size={16} className="text-slate-400" />
                                                        <div>
                                                            <div className="text-xs font-medium">{new Date(h.timestamp).toLocaleDateString()}</div>
                                                            <div className="text-[10px] text-slate-400">{new Date(h.timestamp).toLocaleTimeString()}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-5">
                                                    <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-xl border border-blue-200 w-fit shadow-sm">
                                                        <Users size={18} className="text-blue-600" />
                                                        <span className="font-bold text-blue-700 text-base">{(h.reach || 0).toLocaleString()}</span>
                                                    </div>
                                                </td>
                                                <td className="p-5">
                                                    <div className="flex flex-col gap-2">
                                                        <div className="flex items-center gap-2 text-xs bg-gradient-to-r from-slate-100 to-slate-200 px-3 py-1.5 rounded-lg w-fit shadow-sm">
                                                            <Smartphone size={14} className="text-slate-600" />
                                                            <span className="font-bold text-slate-700">SMS: {h.smsSent || 0}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs bg-gradient-to-r from-green-100 to-emerald-100 px-3 py-1.5 rounded-lg w-fit shadow-sm">
                                                            <MessageSquare size={14} className="text-green-600" />
                                                            <span className="font-bold text-green-700">WA: {h.waSent || 0}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-5">
                                                    <div className="flex items-center gap-2 text-green-600 bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2 rounded-xl border border-green-200 w-fit shadow-sm">
                                                        <CheckCircle size={18} />
                                                        <span className="font-bold text-sm">{h.status}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </div>
        </AdminLayout>
    );
};

export default Broadcast;