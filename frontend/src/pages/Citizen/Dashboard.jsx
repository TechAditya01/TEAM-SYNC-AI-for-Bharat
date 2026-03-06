import React from 'react';
import { Camera, Map, AlertTriangle, Award, MapPin, Clock, CheckCircle, FileText, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
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
            if (!user?.sub) {
                setLoading(false);
                return;
            }
            try {
                const res = await fetch(`${import.meta.env.VITE_AWS_API_GATEWAY_URL}/api/my-reports/${user.sub}`);
                const data = await res.json();
                const reportsList = Array.isArray(data) ? data : [];
                setReports(reportsList);

                // Calculate stats
                const total = reportsList.length;
                const pending = reportsList.filter(r => r.status === 'Pending' || r.status === 'In Progress').length;
                const resolved = reportsList.filter(r => r.status === 'Resolved').length;
                setStats({ total, pending, resolved, points: resolved * 100 });

                // Get recent reports (last 5)
                const recent = reportsList
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0, 5)
                    .map(r => ({
                        type: r.category || r.issueType || 'issue',
                        address: r.location?.address || r.address || 'Unknown location',
                        time: new Date(r.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
                        status: r.status
                    }));
                setRecentReports(recent);

                // Calculate weekly data
                const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                const weekData = days.map(day => ({ name: day, reports: 0, resolved: 0 }));
                
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                
                reportsList.forEach(report => {
                    const reportDate = new Date(report.createdAt);
                    if (reportDate >= oneWeekAgo) {
                        const dayIndex = reportDate.getDay();
                        weekData[dayIndex].reports += 1;
                        if (report.status === 'Resolved') {
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
    
    // Get user's display name
    const displayName = user?.name || user?.email?.split('@')[0] || 'Citizen';

    return (
        <CivicLayout>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                    Welcome back, {displayName}!
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                    Track your civic impact and community progress
                </p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : (
            <>
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
                    iconBg="bg-yellow-100 dark:bg-yellow-900/20"
                    iconColor="text-yellow-600 dark:text-yellow-400"
                />
                <StatCard
                    icon={<CheckCircle size={24} />}
                    label="Resolved"
                    value={stats.resolved}
                    iconBg="bg-green-100 dark:bg-green-900/20"
                    iconColor="text-green-600 dark:text-green-400"
                />
                <StatCard
                    icon={<Award size={24} />}
                    label="Points"
                    value={stats.points}
                    iconBg="bg-purple-100 dark:bg-purple-900/20"
                    iconColor="text-purple-600 dark:text-purple-400"
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
                    {weeklyData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={weeklyData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                                <YAxis stroke="#94a3b8" fontSize={12} />
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                                <Bar dataKey="reports" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Reports" />
                                <Bar dataKey="resolved" fill="#22c55e" radius={[4, 4, 0, 0]} name="Resolved" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-[250px] text-slate-500">
                            No activity data yet. Submit your first report!
                        </div>
                    )}
                </div>
            </div>

            {/* Activity Feeds */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                    <h2 className="font-bold text-lg text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                        Your Recent Reports
                    </h2>
                    <div className="space-y-4">
                        {recentReports.length > 0 ? (
                            recentReports.map((report, i) => (
                                <div key={i} className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                                    <div className="text-2xl">{getIssueIcon(report.type)}</div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-sm text-slate-900 dark:text-white capitalize">{report.type} Reported</h4>
                                        <p className="text-xs text-slate-500">{report.address}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-slate-400">{report.time}</div>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                                            report.status === 'Resolved' ? 'bg-green-100 text-green-700' :
                                            report.status === 'In Progress' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-blue-100 text-blue-700'
                                        }`}>
                                            {report.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-slate-500">
                                <FileText className="mx-auto mb-3" size={40} />
                                <p className="text-sm">No reports yet. Start by reporting an issue!</p>
                            </div>
                        )}
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