import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, BarChart, RefreshCw, Eye, Video, MousePointer, Activity, Globe, Info } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
    const [authToken, setAuthToken] = useState(() => {
        return sessionStorage.getItem('barak_admin_token') || '';
    });
    const [isAuthenticated, setIsAuthenticated] = useState(!!sessionStorage.getItem('barak_admin_token'));
    const [password, setPassword] = useState('');
    const [stats, setStats] = useState({
        visits: 0,
        visitsToday: 0,
        videoClicks: 0,
        contactClicks: 0,
        programViews: 0,
        videoTrend: [],
        contactTrend: [],
        durationTrend: [],
        firstSeen: null,
        recentLogs: [],
        deviceStats: [],
        pageStats: [],
        videoStats: [],
        programStats: [],
        contactStats: [],
        version: '',
        gitCommit: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [uptime, setUptime] = useState(0);

    // Removed hardcoded hash for security

    useEffect(() => {
        if (!authToken) return;

        // Fetch stats initially and then every minute
        fetchStats(authToken);
        const interval = setInterval(() => fetchStats(authToken), 60000);
        return () => clearInterval(interval);
    }, [authToken]);

    const hashPassword = async (pass) => {
        const encoder = new TextEncoder();
        const data = encoder.encode(pass);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        const hash = await hashPassword(password);

        // Attempt to fetch with this hash to verify validity
        try {
            const res = await fetch('/api/stats', {
                headers: { 'x-admin-auth': hash }
            });

            if (res.ok) {
                setAuthToken(hash);
                setIsAuthenticated(true);
                sessionStorage.setItem('barak_admin_token', hash);
                const data = await res.json();
                setStats(data);
                if (data.uptime) {
                    setUptime(Math.floor(data.uptime / 60));
                }
            } else {
                setError('Invalid Password');
            }
        } catch (err) {
            setError('Connection Error');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async (token) => {
        // setLoading(true); // Don't show global loading on interval updates
        try {
            const res = await fetch('/api/stats', {
                headers: { 'x-admin-auth': token }
            });
            if (res.ok) {
                const data = await res.json();
                setStats(data);
                if (data.uptime) {
                    setUptime(Math.floor(data.uptime / 60));
                }
            } else if (res.status === 401) {
                // Token invalid/expired
                setAuthToken('');
                setIsAuthenticated(false);
                sessionStorage.removeItem('barak_admin_token');
            }
        } catch (err) {
            console.error(err);
        } finally {
            // setLoading(false);
        }
    };

    const formatUptime = (mins) => {
        const days = Math.floor(mins / 1440);
        const hrs = Math.floor((mins % 1440) / 60);
        const m = mins % 60;
        if (days > 0) return `${days}d ${hrs}h ${m}m`;
        return `${hrs}h ${m}m`;
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center"
                >
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Lock className="text-blue-600" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-6 font-display">Secured Access</h2>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setError('');
                            }}
                            placeholder="Enter Password"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                        />
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <button
                            type="submit"
                            className="w-full py-3 text-white rounded-xl font-medium transition-colors shadow-lg shadow-black/10"
                            style={{ backgroundColor: '#0f172a' }} // Hardcoded slate-900 to ensure visibility
                        >
                            Login
                        </button>
                    </form>
                </motion.div>
            </div>
        );
    }

    const engagementData = React.useMemo(() => {
        if (!stats.videoTrend || !stats.contactTrend) return [];
        const dates = new Set([...(stats.videoTrend || []).map(d => d.date), ...(stats.contactTrend || []).map(d => d.date)]);
        const sortedDates = Array.from(dates).sort();
        return sortedDates.map(date => {
            const v = stats.videoTrend.find(d => d.date === date);
            const c = stats.contactTrend.find(d => d.date === date);
            return {
                date,
                video: v ? parseInt(v.count) : 0,
                contact: c ? parseInt(c.count) : 0
            };
        });
    }, [stats.videoTrend, stats.contactTrend]);

    const durationData = React.useMemo(() => {
        return (stats.durationTrend || []).map(d => ({
            ...d,
            avg_duration_mins: parseFloat((d.avg_duration / 60).toFixed(2))
        }));
    }, [stats.durationTrend]);

    const processedTrendData = React.useMemo(() => {
        if (!stats.trendData) return [];
        const grouped = {};

        // Ensure data is array (backend might return directly rows)
        const data = Array.isArray(stats.trendData) ? stats.trendData : [];

        data.forEach(item => {
            if (!grouped[item.date]) {
                grouped[item.date] = { date: item.date, he: 0, en: 0 };
            }
            const lang = item.language === 'en' ? 'en' : 'he';
            grouped[item.date][lang] += parseInt(item.visits || 0);
        });

        return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
    }, [stats.trendData]);

    return (
        <div className="min-h-screen bg-[#f8fafc] p-6 md:p-10" dir="ltr">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 font-display">Master Dashboard</h1>
                        <p className="text-slate-500">Real-time metrics & analytics</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="bg-white px-4 py-2 rounded-full border border-slate-100 flex items-center gap-2 text-sm font-medium text-slate-600 shadow-sm">
                            <Activity size={16} className="text-green-500" />
                            <span>System Active</span>
                        </div>
                        <button
                            onClick={() => fetchStats(authToken)}
                            className="p-3 bg-white text-slate-600 rounded-full shadow-sm hover:shadow-md transition-all active:scale-95 border border-slate-100"
                        >
                            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </div>

                {/* Status Bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Globe size={20} /></div>
                        <div>
                            <div className="text-xs text-slate-400 font-bold uppercase">Version</div>
                            <div className="font-bold text-slate-700">1.0.0</div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                        <div className="p-2 bg-green-50 text-green-600 rounded-lg"><Activity size={20} /></div>
                        <div>
                            <div className="text-xs text-slate-400 font-bold uppercase">Server Uptime</div>
                            <div className="font-bold text-slate-700">{formatUptime(uptime)}</div>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Visitor Card */}
                    <div className="bg-white p-6 rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                        <div className="relative z-10">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                                    <Eye size={24} />
                                </div>
                            </div>
                            <h3 className="text-slate-500 font-medium mb-1">Visits (24h)</h3>
                            <div className="flex items-baseline gap-2">
                                <div className="text-4xl font-bold text-slate-900 font-display">
                                    {stats.visits.toLocaleString()}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Video Clicks */}
                    <div className="bg-white p-6 rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                        <div className="relative z-10">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
                                    <Video size={24} />
                                </div>
                            </div>
                            <h3 className="text-slate-500 font-medium mb-1">Video Plays (24h)</h3>
                            <div className="text-4xl font-bold text-slate-900 font-display">
                                {stats.videoClicks.toLocaleString()}
                            </div>
                        </div>
                    </div>

                    {/* Program Interest */}
                    <div className="bg-white p-6 rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                        <div className="relative z-10">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
                                    <BarChart size={24} />
                                </div>
                            </div>
                            <h3 className="text-slate-500 font-medium mb-1">Program Views (24h)</h3>
                            <div className="text-4xl font-bold text-slate-900 font-display">
                                {stats.programViews.toLocaleString()}
                            </div>
                        </div>
                    </div>

                    {/* Contact Interest */}
                    <div className="bg-white p-6 rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                        <div className="relative z-10">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-green-50 text-green-600 rounded-2xl">
                                    <MousePointer size={24} />
                                </div>
                            </div>
                            <h3 className="text-slate-500 font-medium mb-1">Contact Clicks (24h)</h3>
                            <div className="text-4xl font-bold text-slate-900 font-display">
                                {stats.contactClicks.toLocaleString()}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-6">
                    {/* Consolidated Specific Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Device Stats */}
                        <div className="bg-white p-6 rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-slate-100">
                            <h3 className="text-lg font-bold text-slate-900 mb-4">Device Breakdown</h3>
                            <div className="space-y-4">
                                {stats.deviceStats?.map((device, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-500">
                                                <span className="text-xs font-bold">{device.device_type ? device.device_type[0].toUpperCase() : '?'}</span>
                                            </div>
                                            <span className="text-slate-600 font-medium capitalize">{device.device_type || 'Unknown'}</span>
                                        </div>
                                        <span className="font-bold text-slate-900">{device.count}</span>
                                    </div>
                                ))}
                                {(!stats.deviceStats || stats.deviceStats.length === 0) && (
                                    <p className="text-slate-400 text-sm">No device data yet</p>
                                )}
                            </div>
                        </div>

                        {/* Top Pages */}
                        <div className="bg-white p-6 rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-slate-100">
                            <h3 className="text-lg font-bold text-slate-900 mb-4">Top Pages</h3>
                            <div className="space-y-4">
                                {stats.pageStats?.map((page, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                                                <span className="text-xs font-bold">{i + 1}</span>
                                            </div>
                                            <span className="text-slate-600 font-medium">{page.page}</span>
                                        </div>
                                        <span className="font-bold text-slate-900">{page.count}</span>
                                    </div>
                                ))}
                                {(!stats.pageStats || stats.pageStats.length === 0) && (
                                    <p className="text-slate-400 text-sm">No page data yet</p>
                                )}
                            </div>
                        </div>

                        {/* Top Videos */}
                        <div className="bg-white p-6 rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-slate-100">
                            <h3 className="text-lg font-bold text-slate-900 mb-4">Popular Videos</h3>
                            <div className="space-y-4">
                                {stats.videoStats?.map((video, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                                                <Video size={14} />
                                            </div>
                                            <span className="text-slate-600 font-medium truncate max-w-[120px]" title={video.name}>{video.name}</span>
                                        </div>
                                        <span className="font-bold text-slate-900">{video.count}</span>
                                    </div>
                                ))}
                                {(!stats.videoStats || stats.videoStats.length === 0) && (
                                    <p className="text-slate-400 text-sm">No video data yet</p>
                                )}
                            </div>
                        </div>

                        {/* Top Programs */}
                        <div className="bg-white p-6 rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-slate-100">
                            <h3 className="text-lg font-bold text-slate-900 mb-4">Top Programs</h3>
                            <div className="space-y-4">
                                {stats.programStats?.map((prog, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-500">
                                                <BarChart size={14} />
                                            </div>
                                            <span className="text-slate-600 font-medium">{prog.name}</span>
                                        </div>
                                        <span className="font-bold text-slate-900">{prog.count}</span>
                                    </div>
                                ))}
                                {(!stats.programStats || stats.programStats.length === 0) && (
                                    <p className="text-slate-400 text-sm">No program views yet</p>
                                )}
                            </div>
                        </div>

                        {/* Contact Methods */}
                        <div className="bg-white p-6 rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-slate-100">
                            <h3 className="text-lg font-bold text-slate-900 mb-4">Contact Engagement</h3>
                            <div className="space-y-4">
                                {stats.contactStats?.map((contact, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-500">
                                                <MousePointer size={14} />
                                            </div>
                                            <span className="text-slate-600 font-medium capitalize">{contact.name}</span>
                                        </div>
                                        <span className="font-bold text-slate-900">{contact.count}</span>
                                    </div>
                                ))}
                                {(!stats.contactStats || stats.contactStats.length === 0) && (
                                    <p className="text-slate-400 text-sm">No contact clicks yet</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Trends Chart */}
                    <div className="bg-white p-6 md:p-8 rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-slate-100">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Weekly Unique Visitors</h3>
                                <p className="text-slate-500 text-sm">Last 30 days performance (Hebrew vs English)</p>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold">
                                <Info size={14} />
                                <span>Approx. unique via device storage</span>
                            </div>
                        </div>

                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={processedTrendData}>
                                    <defs>
                                        <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorEn" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                                        dx={-10}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="he"
                                        stackId="1"
                                        name="Hebrew"
                                        stroke="#3b82f6"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorVisits)"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="en"
                                        stackId="1"
                                        name="English"
                                        stroke="#f59e0b"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorEn)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Engagement Trends Grid */}
                    <div className="flex flex-col gap-6">
                        {/* Video Trend */}
                        <div className="bg-white p-6 rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-slate-100">
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Video Engagement</h3>
                            <p className="text-slate-500 text-sm mb-6">Daily video interactions</p>
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={engagementData}>
                                        <defs>
                                            <linearGradient id="colorVideos" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} dx={-10} />
                                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                        <Area type="monotone" dataKey="video" name="Video Plays" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorVideos)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Contact Trend */}
                        <div className="bg-white p-6 rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-slate-100">
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Contact Engagement</h3>
                            <p className="text-slate-500 text-sm mb-6">Daily contact clicks</p>
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={engagementData}>
                                        <defs>
                                            <linearGradient id="colorContacts" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} dx={-10} />
                                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                        <Area type="monotone" dataKey="contact" name="Contact Clicks" stroke="#22c55e" strokeWidth={3} fillOpacity={0.6} fill="url(#colorContacts)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Duration Trend */}
                        <div className="bg-white p-6 rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-slate-100">
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Avg. Session Duration</h3>
                            <p className="text-slate-500 text-sm mb-6">Average time spent per day (Minutes)</p>
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={durationData}>
                                        <defs>
                                            <linearGradient id="colorDuration" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} dx={-10} />
                                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                        <Area type="monotone" dataKey="avg_duration_mins" name="Avg Minutes" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorDuration)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Recent Logs Table */}
                    <div className="bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden">
                        <div className="p-6 md:p-8 border-b border-slate-50">
                            <h3 className="text-lg font-bold text-slate-900">Live Activity Log</h3>
                        </div>
                        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                            <table className="w-full text-left border-collapse min-w-[600px]">
                                <thead className="bg-slate-50/50 sticky top-0 z-10 backdrop-blur-sm">
                                    <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                                        <th className="py-4 px-6">Type</th>
                                        <th className="py-4 px-6">Action / Page</th>
                                        <th className="py-4 px-6">Time</th>
                                        <th className="py-4 px-6">Metadata</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {stats.recentLogs?.map((log, i) => (
                                        <tr key={i} className="hover:bg-blue-50/30 transition-colors group">
                                            <td className="py-4 px-6">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold shadow-sm ${log.type === 'visit' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                                                    {log.type === 'visit' ? <Globe size={10} className="mr-1.5" /> : <Activity size={10} className="mr-1.5" />}
                                                    {log.type.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="font-semibold text-slate-700">{log.name}</div>
                                            </td>
                                            <td className="py-4 px-6 text-slate-500 text-sm whitespace-nowrap">
                                                {new Date(log.timestamp).toLocaleString()}
                                            </td>
                                            <td className="py-4 px-6 text-slate-400 text-xs font-mono max-w-[200px] truncate group-hover:whitespace-normal group-hover:break-all transition-all">
                                                {log.metadata || '-'}
                                            </td>
                                        </tr>
                                    ))}
                                    {(!stats.recentLogs || stats.recentLogs.length === 0) && (
                                        <tr>
                                            <td colSpan="4" className="py-12 text-center text-slate-400">No recent activity found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* System Info Footer */}
                    <div className="mt-8 text-center text-slate-400 text-sm flex flex-col gap-1">
                        <p>
                            Data Collection Started: <span className="font-mono text-slate-600">{stats.firstSeen ? new Date(stats.firstSeen).toLocaleDateString() : 'Pending...'}</span>
                        </p>
                        <p>
                            Image: <span className="font-mono text-slate-600">{stats.imageName}:{stats.version}</span>
                            <span className="mx-2">•</span>
                            Commit: <a href={`https://github.com/doleval013/Barak-web/commit/${stats.gitCommit}`} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline font-mono">{stats.gitCommit?.substring(0, 7) || 'Unknown'}</a>
                        </p>
                    </div>
                </div>
            </div >
        </div >
    );
}
