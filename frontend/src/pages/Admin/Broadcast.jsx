import React, { useState, useEffect } from 'react';
import {
    Send, AlertTriangle, CheckCircle,
    Clock, Smartphone
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { toast } from 'react-hot-toast';

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

    // ---------------- Load History ----------------
    useEffect(() => {
        // Replace with API later
        setHistory([
            {
                id: 1,
                area: "Sector 4",
                type: "Fire Alert",
                timestamp: Date.now() - 3600000,
                reach: 2100,
                status: "Delivered"
            },
            {
                id: 2,
                area: "MG Road",
                type: "Water Issue",
                timestamp: Date.now() - 7200000,
                reach: 3200,
                status: "Delivered"
            }
        ]);
    }, []);

    // ---------------- Send Broadcast ----------------
    const handleSend = async () => {
        if (!message.trim()) return;

        setSending(true);

        const payload = {
            area: target,
            type,
            message,
            department: mockUser.department,
            sender: mockUser.firstName + " " + mockUser.lastName,
            reach: Math.floor(Math.random() * 5000) + 500,
            timestamp: Date.now(),
            status: "Delivered"
        };

        try {
            // Optional API
            await fetch(`${import.meta.env.VITE_AWS_API_GATEWAY_URL}/api/broadcast`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            // Local history update
            setHistory(prev => [payload, ...prev]);

            setSending(false);
            setSent(true);
            toast.success("Broadcast sent");

            setTimeout(() => setSent(false), 3000);
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
                        <h2 className="font-bold mb-6">Compose Alert</h2>

                        {/* Target */}
                        <input
                            value={target}
                            onChange={e => setTarget(e.target.value)}
                            className="w-full p-3 border rounded-xl mb-4"
                            placeholder="Target Area"
                        />

                        {/* Type */}
                        <div className="flex gap-2 mb-4">
                            {["Fire Alert", "Critical Alert", "Announcement"]
                                .map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setType(t)}
                                        className={`px-3 py-1 rounded-lg text-xs border ${type === t
                                            ? "bg-red-50 border-red-300 text-red-600"
                                            : "bg-white"
                                            }`}
                                    >
                                        {t}
                                    </button>
                                ))}
                        </div>

                        {/* Message */}
                        <textarea
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            className="w-full p-3 border rounded-xl h-32 mb-2"
                        />
                        <button
                            onClick={generateAI}
                            className="text-xs text-blue-600 mb-4"
                        >
                            ✨ AI Generate
                        </button>

                        {/* Send */}
                        <button
                            onClick={handleSend}
                            disabled={sending || sent}
                            className={`w-full py-3 rounded-xl text-white ${sent ? "bg-green-600"
                                : "bg-red-600 hover:bg-red-700"
                                }`}
                        >
                            {sending
                                ? "Broadcasting..."
                                : sent
                                    ? "Alert Sent"
                                    : "Broadcast"}
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

                    <table className="w-full text-sm">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="p-3 text-left">Area</th>
                                <th className="p-3 text-left">Type</th>
                                <th className="p-3 text-left">Time</th>
                                <th className="p-3 text-left">Reach</th>
                                <th className="p-3 text-left">Status</th>
                            </tr>
                        </thead>

                        <tbody>
                            {history.map(h => (
                                <tr key={h.id || h.timestamp}>
                                    <td className="p-3 font-medium">{h.area}</td>
                                    <td className="p-3">{h.type}</td>
                                    <td className="p-3">
                                        {new Date(h.timestamp).toLocaleString()}
                                    </td>
                                    <td className="p-3 flex items-center gap-1">
                                        <Smartphone size={14} /> {h.reach}
                                    </td>
                                    <td className="p-3 text-green-600 flex gap-1 items-center">
                                        <CheckCircle size={14} /> {h.status}
                                    </td>
                                </tr>
                            ))}
                        </tbody>

                    </table>
                </div>

            </div>
        </AdminLayout>
    );
};

export default Broadcast;