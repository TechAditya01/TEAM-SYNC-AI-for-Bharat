import React, { useState, useEffect } from 'react';
import {
    Send, AlertTriangle, CheckCircle,
    Clock, Smartphone, MapPin, Users,
    MessageSquare, Bell, Radio, Loader2
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

const Broadcast = () => {
    const location = useLocation();

    const [target, setTarget] = useState(
        location.state?.targetArea || 'Sector 4'
    );
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
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/alerts/history`);
                if (res.ok) {
                    const data = await res.json();
                    setHistory(data.alerts || []);
                }
            } catch (err) {
                console.error('Failed to load alert history:', err);
                // Fallback mock
                setHistory([
                    { id: 1, area: "Sector 4", type: "Fire Alert", timestamp: Date.now() - 3600000, reach: 2100, status: "Delivered", smsSent: 45 },
                    { id: 2, area: "MG Road", type: "Water Issue", timestamp: Date.now() - 7200000, reach: 3200, status: "Delivered", smsSent: 82 },
                ]);
            } finally {
                setLoadingHistory(false);
            }
        };
        fetchHistory();
    }, []);

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
        } catch {
            setSending(false);
            toast.error("Broadcast failed");
        }
    };

    // ---------------- AI Generate ----------------
    const generateAI = () => {
        if (!target || !type)
            return toast.error("Select Target & Type first");

        setMessage("Generating AI Alert...");

        setTimeout(() => {
            setMessage(
                `🚨 ${type.toUpperCase()} ALERT for ${target.toUpperCase()}

Authorities report a ${type.toLowerCase()} in your area.
Please follow official instructions and avoid the zone.

- Nagar Alert Hub`
            );
        }, 600);
    };

    return (
        <AdminLayout>
            <div className="max-w-6xl mx-auto space-y-8">

                {/* HEADER */}
                <div>
                    <h1 className="text-2xl font-bold flex gap-2">
                        <Send className="text-red-600" /> Broadcast System
                    </h1>
                    <p className="text-slate-500">
                        Send emergency alerts to citizens
                    </p>
                </div>

                {/* GRID */}
                <div className="grid md:grid-cols-2 gap-8">

                    {/* COMPOSE */}
                    <div className="bg-white p-8 rounded-2xl shadow">
                        <h2 className="font-bold mb-6 flex items-center gap-2">
                            <Radio size={18} className="text-red-500" /> Compose Alert
                        </h2>

                        {/* Target Area / City */}
                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Target Area / City</label>
                        <div className="flex gap-2 mb-4">
                            <div className="relative flex-1">
                                <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    value={target}
                                    onChange={e => { setTarget(e.target.value); setTargetCity(e.target.value); }}
                                    className="w-full pl-9 p-3 border rounded-xl"
                                    placeholder="e.g. Sector 4, Mumbai, Delhi"
                                />
                            </div>
                        </div>

                        {/* Alert Type */}
                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Alert Type</label>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {["Fire Alert", "Flood Warning", "Critical Alert", "SOS Emergency", "Announcement"]
                                .map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setType(t)}
                                        className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${type === t
                                            ? "bg-red-50 border-red-300 text-red-600 font-bold shadow-sm"
                                            : "bg-white hover:bg-slate-50"
                                            }`}
                                    >
                                        {t}
                                    </button>
                                ))}
                        </div>

                        {/* Message */}
                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Message</label>
                        <textarea
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            className="w-full p-3 border rounded-xl h-32 mb-2"
                            placeholder="Type your alert message..."
                        />
                        <button
                            onClick={generateAI}
                            className="text-xs text-blue-600 mb-4 hover:underline"
                        >
                            ✨ AI Generate Message
                        </button>

                        <div className="flex flex-col gap-2 mb-4">
                            {/* SMS Toggle */}
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border">
                                <div className="flex items-center gap-2">
                                    <Smartphone size={16} className="text-slate-600" />
                                    <span className="text-sm font-medium">Send SMS via AWS SNS</span>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={sendSMS}
                                        onChange={e => setSendSMS(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-slate-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-600"></div>
                                </label>
                            </div>

                            {/* WhatsApp Toggle */}
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border">
                                <div className="flex items-center gap-2">
                                    <MessageSquare size={16} className="text-green-600" />
                                    <span className="text-sm font-medium text-green-700">Send via WhatsApp (Green API)</span>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={sendWhatsApp}
                                        onChange={e => setWhatsApp(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                </label>
                            </div>
                        </div>

                        {(sendSMS || sendWhatsApp) && (
                            <div className="text-xs text-slate-500 mb-4 flex items-center gap-1">
                                <Bell size={12} />
                                Alerts will be pushed to {target || '...'} via {sendSMS ? 'SMS ' : ''}{sendWhatsApp ? '& WhatsApp' : ''}
                            </div>
                        )}

                        {/* Send */}
                        <button
                            onClick={handleSend}
                            disabled={sending || sent}
                            className={`w-full py-3 rounded-xl text-white flex items-center justify-center gap-2 font-bold ${sent ? "bg-green-600"
                                : "bg-red-600 hover:bg-red-700"
                                }`}
                        >
                            {sending ? (
                                <><Loader2 size={18} className="animate-spin" /> Broadcasting...</>
                            ) : sent ? (
                                <><CheckCircle size={18} /> Alert Sent to {reachCount} users</>
                            ) : (
                                <><Send size={18} /> Broadcast Alert</>
                            )}
                        </button>
                    </div>

                    {/* PREVIEW */}
                    <div className="flex items-center justify-center">
                        <div className="w-72 bg-white rounded-3xl shadow p-4">
                            <div className="text-xs font-bold text-red-600 mb-1">
                                {type} • {target}
                            </div>
                            <div className="text-sm whitespace-pre-line">
                                {message}
                            </div>
                        </div>
                    </div>

                </div>

                {/* HISTORY */}
                <div className="bg-white rounded-xl shadow">
                    <div className="p-4 border-b font-bold">
                        Recent Broadcasts
                    </div>

                    {loadingHistory ? (
                        <div className="p-8 text-center text-slate-400">
                            <Loader2 size={24} className="animate-spin mx-auto mb-2" />
                            Loading history...
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="p-3 text-left">Area</th>
                                    <th className="p-3 text-left">Type</th>
                                    <th className="p-3 text-left">Time</th>
                                    <th className="p-3 text-left">Reach</th>
                                    <th className="p-3 text-left">SMS/WA</th>
                                    <th className="p-3 text-left">Status</th>
                                </tr>
                            </thead>

                            <tbody>
                                {history.map(h => (
                                    <tr key={h.id || h.alert_id || h.timestamp} className="border-b hover:bg-slate-50 transition">
                                        <td className="p-3 font-medium">
                                            <div className="flex items-center gap-1">
                                                <MapPin size={12} className="text-slate-400" />
                                                {h.area}
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded text-xs font-bold">
                                                {h.type}
                                            </span>
                                        </td>
                                        <td className="p-3 text-slate-500">
                                            {new Date(h.timestamp).toLocaleString()}
                                        </td>
                                        <td className="p-3">
                                            <div className="flex items-center gap-1">
                                                <Users size={14} className="text-blue-500" /> {h.reach || 0}
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <div className="flex flex-col gap-1 text-xs">
                                                <div className="flex items-center gap-1 text-slate-600"><Smartphone size={12} /> {h.smsSent || 0}</div>
                                                <div className="flex items-center gap-1 text-green-600"><MessageSquare size={12} /> {h.waSent || 0}</div>
                                            </div>
                                        </td>
                                        <td className="p-3 text-green-600 flex gap-1 items-center">
                                            <CheckCircle size={14} /> {h.status}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>

                        </table>
                    )}
                </div>

            </div>
        </AdminLayout>
    );
};

export default Broadcast;