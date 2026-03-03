import React from 'react';
import { Camera, Map, AlertTriangle, Award, Activity, MapPin, Clock, CheckCircle, FileText, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

// Mock data for UI demonstration
const MOCK_STATS = { total: 12, pending: 4, resolved: 8, points: 1250 };
const MOCK_WEEKLY_DATA = [
    { name: 'Sun', reports: 2, resolved: 1 },
    { name: 'Mon', reports: 4, resolved: 2 },
    { name: 'Tue', reports: 1, resolved: 1 },
    { name: 'Wed', reports: 5, resolved: 3 },
    { name: 'Thu', reports: 2, resolved: 2 },
    { name: 'Fri', reports: 3, resolved: 1 },
    { name: 'Sat', reports: 1, resolved: 0 },
];
const MOCK_RECENT = [
    { type: 'pothole', address: 'Main Street, Sector 4', time: '10:30 AM' },
    { type: 'garbage', address: 'Park Avenue, North Block', time: '09:15 AM' },
];

import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

const Dashboard = () => {
    const { user } = useAuth();
    const [reports, setReports] = React.useState([]);
    const [stats, setStats] = React.useState({ total: 0, pending: 0, resolved: 0, points: 0 });

    React.useEffect(() => {
        const fetchReports = async () => {
            if (!user?.sub) return;
            try {
                const res = await fetch(`${import.meta.env.VITE_AWS_API_GATEWAY_URL}/api/my-reports/${user.sub}`);
                const data = await res.json();
                setReports(data || []);

                const total = data.length;
                const pending = data.filter(r => r.status === 'Pending').length;
                const resolved = data.filter(r => r.status === 'Resolved').length;
                setStats({ total, pending, resolved, points: resolved * 100 });
            } catch (err) {
                console.error("Fetch reports error:", err);
                // Fallback to mock for UI dev
                setReports(MOCK_RECENT);
                setStats(MOCK_STATS);
            }
        };
        fetchReports();
    }, [user]);

    const completionRate = stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                    Welcome back, Citizen!
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                    Track your civic impact and community progress
                </p>
            </div>

            {/* Stats Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    icon={<FileText size={24} />}
                    label="Total Reports"
                    value={stats.total}
                    iconBg="bg-blue-100 dark:bg-blue-900/20"
                    iconColor="text-blue-600 dark:text-blue-400"
                />
                <StatCard
                    icon={<Clock size={24} />}
                    label="Pending"
                    value={stats.pending}
                    iconBg="bg-blue-100 dark:bg-blue-900/20"
                    iconColor="text-blue-600 dark:text-blue-400"
                />
                <StatCard
                    icon={<CheckCircle size={24} />}
                    label="Resolved"
                    value={stats.resolved}
                    iconBg="bg-blue-100 dark:bg-blue-900/20"
                    iconColor="text-blue-600 dark:text-blue-400"
                />
                <StatCard
                    icon={<Award size={24} />}
                    label="Points"
                    value={stats.points}
                    iconBg="bg-blue-100 dark:bg-blue-900/20"
                    iconColor="text-blue-600 dark:text-blue-400"
                />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <QuickActionLink to="/report" icon={<Camera />} title="Report Issue" desc="Document problems" />
                <QuickActionLink to="/map" icon={<Map />} title="Live Map" desc="View all reports" />
                <QuickActionLink to="/sos" icon={<AlertTriangle />} title="Emergency SOS" desc="Quick alert" />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Completion Rate Circle */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                    <h3 className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-6">
                        Completion Rate
                    </h3>
                    <div className="flex items-center justify-center mb-6">
                        <div className="relative w-40 h-40">
                            <svg className="w-40 h-40 transform -rotate-90">
                                <circle cx="80" cy="80" r="70" stroke="currentColor" className="text-slate-200 dark:text-slate-700" strokeWidth="12" fill="none" />
                                <circle
                                    cx="80" cy="80" r="70" stroke="currentColor"
                                    className="text-blue-600 dark:text-blue-500"
                                    strokeWidth="12" fill="none"
                                    strokeDasharray={`${completionRate * 4.4} 440`}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center flex-col">
                                <div className="text-4xl font-bold text-slate-900 dark:text-white">{completionRate}%</div>
                                <div className="text-xs text-slate-600 dark:text-slate-400 font-semibold">Success Rate</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Activity Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="font-bold text-lg text-slate-900 dark:text-white">Weekly Activity</h2>
                            <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Reporting patterns over 7 days</p>
                        </div>
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
                            <BarChart3 className="text-blue-600 dark:text-blue-400" size={24} />
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={MOCK_WEEKLY_DATA}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                            <YAxis stroke="#94a3b8" fontSize={12} />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                            <Bar dataKey="reports" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="resolved" fill="#60a5fa" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Activity Feeds */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                    <h2 className="font-bold text-lg text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                        Community Feed
                    </h2>
                    <div className="space-y-4">
                        {MOCK_RECENT.map((report, i) => (
                            <div key={i} className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                                <div className="text-2xl">{report.type === 'pothole' ? '🚧' : '🗑️'}</div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-sm text-slate-900 dark:text-white capitalize">{report.type} Reported</h4>
                                    <p className="text-xs text-slate-500">{report.address}</p>
                                </div>
                                <div className="text-xs text-slate-400">{report.time}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                    <h2 className="font-bold text-lg text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <MapPin className="text-blue-600" size={20} /> Nearby Alerts
                    </h2>
                    <div className="text-center py-8">
                        <CheckCircle className="mx-auto mb-3 text-blue-500" size={40} />
                        <p className="text-slate-600 dark:text-slate-400 text-sm">Safe Zone! No urgent alerts nearby.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon, label, value, iconBg, iconColor }) => (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
        <div className={`w-fit p-3 rounded-xl mb-4 ${iconBg}`}>
            {React.cloneElement(icon, { className: iconColor })}
        </div>
        <p className="text-slate-600 dark:text-slate-400 text-sm font-semibold mb-1">{label}</p>
        <p className="text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
    </div>
);

const QuickActionLink = ({ to, icon, title, desc }) => (
    <Link to={to} className="group bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:border-blue-500 transition-all hover:shadow-lg">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl text-blue-600">
                {icon}
            </div>
            <div>
                <h3 className="font-bold text-slate-900 dark:text-white">{title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{desc}</p>
            </div>
        </div>
    </Link>
);

export default Dashboard;