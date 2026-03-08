import React from 'react';
import { Camera, Map, AlertTriangle, Award, MapPin, Clock, CheckCircle, FileText, BarChart3, TrendingUp, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from 'recharts';
import CivicLayout from './CivicLayout';

import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
    const { user } = useAuth();
    const [reports, setReports] = React.useState([]);
    const [stats, setStats] = React.useState({ total: 0, pending: 0, resolved: 0, points: 0 });
    const [weeklyData, setWeeklyData] = React.useState([]);
    const [recentReports, setRecentReports] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchReports = async () => {
            const userId = user?.sub || localStorage.getItem("uid");
            if (!userId) {
                setLoading(false);
                return;
            }
            try {
                const res = await fetch(`${import.meta.env.VITE_AWS_API_GATEWAY_URL}/api/reports/user/${userId}`);
                const data = await res.json();
                console.log("Dashboard API Response:", data);
                const reportsList = data.reports ? data.reports : (Array.isArray(data) ? data : []);
                setReports(reportsList);

                // Calculate stats
                const total = reportsList.length;
                const pending = reportsList.filter(r => r.status === 'Pending' || r.status === 'In Progress').length;
                const resolved = reportsList.filter(r => r.status === 'Resolved' || r.status === 'Accepted').length;
                setStats({ total, pending, resolved, points: resolved * 100 });

                // Get recent reports (last 5)
                const recent = reportsList
                    .sort((a, b) => new Date(b.createdAt || b.timestamp) - new Date(a.createdAt || a.timestamp))
                    .slice(0, 5)
                    .map(r => ({
                        type: r.type || r.category || r.issueType || 'issue',
                        address: r.location?.address || r.address || `${r.location?.lat?.toFixed(4)}, ${r.location?.lng?.toFixed(4)}` || 'Unknown location',
                        time: new Date(r.createdAt || r.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
                        status: r.status
                    }));
                setRecentReports(recent);

                // Calculate weekly data
                const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                const weekData = days.map(day => ({ name: day, reports: 0, resolved: 0 }));
                
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                
                reportsList.forEach(report => {
                    const reportDate = new Date(report.createdAt || report.timestamp);
                    if (reportDate >= oneWeekAgo) {
                        const dayIndex = reportDate.getDay();
                        weekData[dayIndex].reports += 1;
                        if (report.status === 'Resolved' || report.status === 'Accepted') {
                            weekData[dayIndex].resolved += 1;
                        }
                    }
                });
                setWeeklyData(weekData);

            } catch (err) {
                console.error("Fetch reports error:", err);
                setReports([]);
                setStats({ total: 0, pending: 0, resolved: 0, points: 0 });
                setWeeklyData([]);
                setRecentReports([]);
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, [user]);

    const completionRate = stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;
    const displayName = user?.name || user?.email?.split('@')[0] || 'Citizen';

    return (
        <CivicLayout>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 md:p-8">
                {/* Hero Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent mb-2">
                                Welcome back, {displayName}!
                            </h1>
                            <p className="text-slate-600 dark:text-slate-400 text-lg">
                                Your civic impact dashboard
                            </p>
                        </div>
                        <div className="hidden md:block p-4 bg-blue-100 dark:bg-blue-900/20 rounded-2xl">
                            <Zap className="text-blue-600 dark:text-blue-400" size={32} />
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <>
                        {/* Stats Summary Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
                            <StatCard
                                icon={<FileText size={24} />}
                                label="Total Reports"
                                value={stats.total}
                                trend="+12%"
                                iconBg="bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-900/10"
                                iconColor="text-blue-600 dark:text-blue-400"
                            />
                            <StatCard
                                icon={<Clock size={24} />}
                                label="Pending"
                                value={stats.pending}
                                trend={stats.pending > 0 ? "Action needed" : "All clear"}
                                iconBg="bg-gradient-to-br from-yellow-100 to-yellow-50 dark:from-yellow-900/30 dark:to-yellow-900/10"
                                iconColor="text-yellow-600 dark:text-yellow-400"
                            />
                            <StatCard
                                icon={<CheckCircle size={24} />}
                                label="Resolved"
                                value={stats.resolved}
                                trend={`${completionRate}% rate`}
                                iconBg="bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-900/10"
                                iconColor="text-green-600 dark:text-green-400"
                            />
                            <StatCard
                                icon={<Award size={24} />}
                                label="Points Earned"
                                value={stats.points}
                                trend="Keep going!"
                                iconBg="bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-900/10"
                                iconColor="text-purple-600 dark:text-purple-400"
                            />
                        </div>

                        {/* Quick Actions */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
                            <QuickActionLink to="/report" icon={<Camera size={20} />} title="Report Issue" desc="Document problems in your area" color="blue" />
                            <QuickActionLink to="/map" icon={<Map size={20} />} title="Live Map" desc="View all community reports" color="green" />
                            <QuickActionLink to="/sos" icon={<AlertTriangle size={20} />} title="Emergency SOS" desc="Send urgent alert" color="red" />
                        </div>

                        {/* Main Content Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                            {/* Completion Rate Card */}
                            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                            Success Rate
                                        </h3>
                                        <p className="text-xs text-slate-500 mt-1">Based on resolved reports</p>
                                    </div>
                                    <TrendingUp className="text-blue-600 dark:text-blue-400" size={24} />
                                </div>
                                <div className="flex items-center justify-center mb-6">
                                    <div className="relative w-32 h-32">
                                        <svg className="w-32 h-32 transform -rotate-90">
                                            <circle cx="64" cy="64" r="56" stroke="currentColor" className="text-slate-200 dark:text-slate-700" strokeWidth="10" fill="none" />
                                            <circle
                                                cx="64" cy="64" r="56" stroke="currentColor"
                                                className="text-blue-600 dark:text-blue-500"
                                                strokeWidth="10" fill="none"
                                                strokeDasharray={`${completionRate * 3.52} 352`}
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                                            <div className="text-3xl font-bold text-slate-900 dark:text-white">{completionRate}%</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        {stats.resolved} of {stats.total} reports resolved
                                    </p>
                                </div>
                            </div>

                            {/* Activity Chart */}
                            <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h2 className="font-bold text-xl text-slate-900 dark:text-white">Weekly Activity</h2>
                                        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Your reporting trends</p>
                                    </div>
                                    <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-900/10 rounded-xl">
                                        <BarChart3 className="text-blue-600 dark:text-blue-400" size={24} />
                                    </div>
                                </div>
                                {weeklyData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={280}>
                                        <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                                            <YAxis stroke="#94a3b8" fontSize={12} />
                                            <Tooltip 
                                                contentStyle={{ 
                                                    backgroundColor: '#1e293b', 
                                                    border: 'none', 
                                                    borderRadius: '12px', 
                                                    color: '#fff',
                                                    boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
                                                }} 
                                            />
                                            <Bar dataKey="reports" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Reports" />
                                            <Bar dataKey="resolved" fill="#10b981" radius={[8, 8, 0, 0]} name="Resolved" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex items-center justify-center h-[280px] text-slate-500">
                                        <div className="text-center">
                                            <FileText size={40} className="mx-auto mb-3 opacity-50" />
                                            <p>No activity yet. Submit your first report!</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                                <h2 className="font-bold text-xl text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                                    <div className="w-3 h-3 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full animate-pulse"></div>
                                    Recent Reports
                                </h2>
                                <div className="space-y-3">
                                    {recentReports.length > 0 ? (
                                        recentReports.map((report, i) => (
                                            <div key={i} className="flex items-center gap-4 p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 rounded-2xl hover:shadow-md transition-all">
                                                <div className="text-3xl">{getIssueIcon(report.type)}</div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-semibold text-slate-900 dark:text-white capitalize text-sm">{report.type}</h4>
                                                    <p className="text-xs text-slate-600 dark:text-slate-400 truncate">{report.address}</p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <div className="text-xs text-slate-500 mb-1">{report.time}</div>
                                                    <span className={`text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap ${
                                                        report.status === 'Resolved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                        report.status === 'In Progress' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                    }`}>
                                                        {report.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-12 text-slate-500">
                                            <FileText className="mx-auto mb-3 opacity-50" size={40} />
                                            <p className="text-sm">No reports yet. Start making an impact!</p>
                                            <Link to="/report" className="text-blue-600 dark:text-blue-400 text-sm font-semibold mt-3 inline-block hover:underline">
                                                Submit your first report →
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Nearby Alerts */}
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-3xl p-8 border border-green-200 dark:border-green-900/30 shadow-sm hover:shadow-md transition-shadow">
                                <h2 className="font-bold text-xl text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                                    <MapPin className="text-green-600 dark:text-green-400" size={24} />
                                    Your Area
                                </h2>
                                <div className="text-center py-8">
                                    <div className="inline-block p-4 bg-green-100 dark:bg-green-900/30 rounded-2xl mb-4">
                                        <CheckCircle className="text-green-600 dark:text-green-400" size={40} />
                                    </div>
                                    <p className="text-slate-700 dark:text-slate-300 font-semibold mb-2">Safe Zone</p>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm">No urgent alerts nearby. Keep up the good work!</p>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </CivicLayout>
    );
};

// Helper function to get icon based on issue type
const getIssueIcon = (type) => {
    const typeLC = (type || '').toLowerCase();
    if (typeLC.includes('pothole') || typeLC.includes('road')) return '🚧';
    if (typeLC.includes('garbage') || typeLC.includes('waste') || typeLC.includes('trash')) return '🗑️';
    if (typeLC.includes('water') || typeLC.includes('drainage')) return '💧';
    if (typeLC.includes('light') || typeLC.includes('street')) return '💡';
    if (typeLC.includes('traffic')) return '🚦';
    if (typeLC.includes('noise')) return '🔊';
    if (typeLC.includes('air') || typeLC.includes('pollution')) return '🌫️';
    if (typeLC.includes('animal')) return '🐕';
    return '📋';
};

const StatCard = ({ icon, label, value, trend, iconBg, iconColor }) => (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 md:p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all hover:border-blue-300 dark:hover:border-blue-700">
        <div className={`w-fit p-3 rounded-xl mb-4 ${iconBg}`}>
            {React.cloneElement(icon, { className: iconColor })}
        </div>
        <p className="text-slate-600 dark:text-slate-400 text-xs md:text-sm font-semibold mb-2">{label}</p>
        <div className="flex items-end justify-between">
            <p className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 text-right">{trend}</p>
        </div>
    </div>
);

const QuickActionLink = ({ to, icon, title, desc, color }) => {
    const colorClasses = {
        blue: 'from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-900/10 text-blue-600 dark:text-blue-400 hover:border-blue-300 dark:hover:border-blue-700',
        green: 'from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-900/10 text-green-600 dark:text-green-400 hover:border-green-300 dark:hover:border-green-700',
        red: 'from-red-100 to-red-50 dark:from-red-900/30 dark:to-red-900/10 text-red-600 dark:text-red-400 hover:border-red-300 dark:hover:border-red-700'
    };

    return (
        <Link to={to} className={`group bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all`}>
            <div className="flex items-center gap-4">
                <div className={`p-3 bg-gradient-to-br rounded-xl ${colorClasses[color]}`}>
                    {icon}
                </div>
                <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{desc}</p>
                </div>
            </div>
        </Link>
    );
};

export default Dashboard;
