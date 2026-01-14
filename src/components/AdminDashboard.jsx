import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Lock, BarChart, RefreshCw, Eye, Video, MousePointer, Activity, Globe, Info, MapPin, Smartphone, Chrome, Users, ArrowUpRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart as RechartsBarChart, Bar, Cell } from 'recharts';

export default function AdminDashboard() {
    const [authToken, setAuthToken] = useState(() => {
        return sessionStorage.getItem('barak_admin_token') || '';
    });
    const [isAuthenticated, setIsAuthenticated] = useState(!!sessionStorage.getItem('barak_admin_token'));
    const [password, setPassword] = useState('');
    const [stats, setStats] = useState({
        visits: 0,
        visitsToday: 0,
        liveUsers: 0,
        videoClicks: 0,
        contactClicks: 0,
        programViews: 0,
        trendData: [],
        videoTrend: [],
        contactTrend: [],
        durationTrend: [],
        deviceStats: [],
        pageStats: [],
        videoStats: [],
        programStats: [],
        contactStats: [],
        geoStats: [],
        sourceStats: [],
        sourceTrends: [], // NEW
        recentLogs: [],
        version: '',
        gitCommit: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [uptime, setUptime] = useState(0);

    useEffect(() => {
        if (!authToken) return;
        fetchStats(authToken);
        const interval = setInterval(() => fetchStats(authToken), 30000); // Poll every 30s for live count
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
                if (data.uptime) setUptime(Math.floor(data.uptime / 60));
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
        try {
            const res = await fetch('/api/stats', {
                headers: { 'x-admin-auth': token }
            });
            if (res.ok) {
                const data = await res.json();
                setStats(data);
                if (data.uptime) setUptime(Math.floor(data.uptime / 60));
            } else if (res.status === 401) {
                setAuthToken('');
                setIsAuthenticated(false);
                sessionStorage.removeItem('barak_admin_token');
            }
        } catch (err) {
            console.error(err);
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
                            style={{ backgroundColor: '#0f172a' }}
                        >
                            Login
                        </button>
                    </form>
                </motion.div>
            </div>
        );
    }

    // Process Trend Data for Chart
    const visitTrendData = useMemo(() => {
        if (!stats.trendData) return [];
        return stats.trendData.map(d => ({
            date: d.date,
            total: parseInt(d.total_visits || 0),
            unique: parseInt(d.unique_visitors || 0)
        }));
    }, [stats.trendData]);

    // Process Source Data for Chart
    const sourceTrendData = useMemo(() => {
        if (!stats.sourceTrends) return [];
        const grouped = {};

        stats.sourceTrends.forEach(d => {
            if (!grouped[d.date]) {
                grouped[d.date] = { date: d.date };
            }

            // Clean referrer
            let source = 'Direct';
            if (d.referrer && d.referrer !== '') {
                // simple hostname extraction
                try {
                    const url = new URL(d.referrer.startsWith('http') ? d.referrer : `http://${d.referrer}`);
                    source = url.hostname.replace('www.', '').split('.')[0];
                    // e.g. 'google', 'facebook', 'instagram'
                    // capitalize
                    source = source.charAt(0).toUpperCase() + source.slice(1);
                } catch (e) {
                    source = 'Other';
                }
            }
            if (!grouped[d.date][source]) grouped[d.date][source] = 0;
            grouped[d.date][source] += parseInt(d.count);
        });

        return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
    }, [stats.sourceTrends]);

    // Get reliable distinct sources for coloring
    const distinctSources = useMemo(() => {
        const sources = new Set();
        sourceTrendData.forEach(day => {
            Object.keys(day).forEach(key => {
                if (key !== 'date') sources.add(key);
            });
        });
        return Array.from(sources);
    }, [sourceTrendData]);

    const sourceColors = {
        'Google': '#4285F4',
        'Facebook': '#1877F2',
        'Instagram': '#E1306C',
        'Direct': '#94a3b8',
        'Other': '#cbd5e1'
    };

    const getSourceColor = (source) => {
        return sourceColors[source] || `#${Math.floor(Math.random() * 16777215).toString(16)}`;
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 font-sans text-slate-900" dir="ltr">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 font-display">Mission Control</h1>
                        <p className="text-slate-500 flex items-center gap-2">
                            Real-time User Analytics & Monitoring
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* Live User Indicator */}
                        <div className="bg-white px-5 py-2.5 rounded-full border border-slate-200/60 shadow-sm flex items-center gap-3">
                            <div className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                            </div>
                            <span className="font-bold text-slate-700">{stats.liveUsers} Online Now</span>
                        </div>
                        <button
                            onClick={() => fetchStats(authToken)}
                            className="p-3 bg-white text-slate-600 rounded-full shadow-sm hover:shadow-md transition-all active:scale-95 border border-slate-200"
                        >
                            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </div>

                {/* KPI Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Unique Visitors */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full -mr-16 -mt-16" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                                    <Users size={24} />
                                </div>
                                <span className="text-slate-500 font-medium text-sm uppercase tracking-wide">Unique Visitors (30d)</span>
                            </div>
                            <div className="text-4xl font-bold text-slate-900 font-display">
                                {visitTrendData.reduce((acc, curr) => acc + curr.unique, 0).toLocaleString()}
                            </div>
                            <div className="text-sm text-slate-400 mt-1">
                                {(stats.visits / (visitTrendData.reduce((acc, curr) => acc + curr.unique, 1))).toFixed(1)}x Pageviews per user
                            </div>
                        </div>
                    </div>

                    {/* Total Views */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full -mr-16 -mt-16" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                                    <Eye size={24} />
                                </div>
                                <span className="text-slate-500 font-medium text-sm uppercase tracking-wide">Page Loads (24h)</span>
                            </div>
                            <div className="text-4xl font-bold text-slate-900 font-display">
                                {stats.visits.toLocaleString()}
                            </div>
                        </div>
                    </div>

                    {/* Engagement Score */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-50/50 rounded-full -mr-16 -mt-16" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
                                    <Video size={24} />
                                </div>
                                <span className="text-slate-500 font-medium text-sm uppercase tracking-wide">Video Plays (24h)</span>
                            </div>
                            <div className="text-4xl font-bold text-slate-900 font-display">
                                {stats.videoClicks.toLocaleString()}
                            </div>
                        </div>
                    </div>

                    {/* Conversion */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-green-50/50 rounded-full -mr-16 -mt-16" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-green-50 text-green-600 rounded-2xl">
                                    <MousePointer size={24} />
                                </div>
                                <span className="text-slate-500 font-medium text-sm uppercase tracking-wide">Contacts (24h)</span>
                            </div>
                            <div className="text-4xl font-bold text-slate-900 font-display">
                                {stats.contactClicks.toLocaleString()}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Trends Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Traffic & Sources Column */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Traffic Growth */}
                        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">Traffic Growth</h3>
                                    <p className="text-slate-500 text-sm">Unique People vs. Total Page Loads (30 Days)</p>
                                </div>
                            </div>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={visitTrendData}>
                                        <defs>
                                            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorUnique" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} minTickGap={30} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dx={-10} />
                                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                        <Area type="monotone" dataKey="total" name="Page Views" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
                                        <Area type="monotone" dataKey="unique" name="Unique People" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorUnique)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Source Trends (New) */}
                        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">Source Trends</h3>
                                    <p className="text-slate-500 text-sm">Where traffic is coming from (Daily)</p>
                                </div>
                            </div>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RechartsBarChart data={sourceTrendData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} minTickGap={30} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dx={-10} />
                                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                        {distinctSources.map((source, idx) => (
                                            <Bar key={source} dataKey={source} stackId="a" fill={getSourceColor(source)} radius={[2, 2, 0, 0]} />
                                        ))}
                                    </RechartsBarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Geo & Source Column */}
                    <div className="space-y-6">
                        {/* Geo Stats */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex-1">
                            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Globe size={18} className="text-blue-500" />
                                Top Countries
                            </h3>
                            <div className="space-y-4">
                                {stats.geoStats?.map((geo, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 text-xs font-bold">
                                                {geo.country || 'N/A'}
                                            </div>
                                            <span className="text-slate-600 font-medium">{geo.country || 'Unknown'}</span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="font-bold text-slate-900">{geo.count}</span>
                                            <span className="text-xs text-slate-400">{geo.unique_users} unique</span>
                                        </div>
                                    </div>
                                ))}
                                {(!stats.geoStats || stats.geoStats.length === 0) && <p className="text-slate-400 text-sm">No location data yet.</p>}
                            </div>
                        </div>

                        {/* Traffic Sources */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
                            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <ArrowUpRight size={18} className="text-green-500" />
                                Top Sources (30d)
                            </h3>
                            <div className="space-y-3">
                                {stats.sourceStats?.map((source, i) => (
                                    <div key={i} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors">
                                        <span className="text-slate-600 font-medium truncate max-w-[150px]" title={source.referrer}>
                                            {source.referrer ? source.referrer.replace('https://', '').replace('http://', '').split('/')[0] : 'Direct / Bookmark'}
                                        </span>
                                        <span className="font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded-md text-xs">{source.count}</span>
                                    </div>
                                ))}
                                {(!stats.sourceStats || stats.sourceStats.length === 0) && <p className="text-slate-400 text-sm">No source data yet.</p>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Device Stats */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Device Tech</h3>
                        <div className="space-y-4">
                            {stats.deviceStats?.map((device, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {device.type === 'mobile' ? <Smartphone size={16} className="text-purple-500" /> : <BarChart size={16} className="text-slate-500" />}
                                        <span className="text-slate-600 font-medium text-sm">
                                            {device.browser} <span className="text-slate-400">on</span> {device.type}
                                        </span>
                                    </div>
                                    <span className="font-bold text-slate-900">{device.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Top Pages */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Top Content</h3>
                        <div className="space-y-4">
                            {stats.pageStats?.map((page, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                                        <span className="text-slate-600 font-medium">{page.page}</span>
                                    </div>
                                    <span className="font-bold text-slate-900">{page.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Avg Duration */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Avg Time Spent</h3>
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.durationTrend}>
                                    <Bar dataKey="avg_duration" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none' }} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <p className="text-center text-xs text-slate-400 mt-2">Seconds per session (Daily Avg)</p>
                    </div>
                </div>

                {/* Activity Log Table */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
                    <div className="p-6 md:p-8 border-b border-slate-50 bg-slate-50/30">
                        <h3 className="text-lg font-bold text-slate-900">Live Traffic Feed</h3>
                    </div>
                    <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead className="bg-slate-50 sticky top-0 z-10">
                                <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                                    <th className="py-4 px-6">Action</th>
                                    <th className="py-4 px-6">Details</th>
                                    <th className="py-4 px-6">Location</th>
                                    <th className="py-4 px-6">Source</th>
                                    <th className="py-4 px-6">Time</th>
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
                                            {log.device_type && <div className="text-xs text-slate-400 capitalize">{log.device_type}</div>}
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2 text-slate-600 text-sm">
                                                {log.country ? (
                                                    <><MapPin size={12} className="text-red-400" /> {log.city || ''}, {log.country}</>
                                                ) : <span className="text-slate-300">-</span>}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-sm text-slate-500">
                                            {log.referrer ? (
                                                <span className="truncate max-w-[150px] inline-block" title={log.referrer}>
                                                    {log.referrer.replace('https://', '').split('/')[0]}
                                                </span>
                                            ) : '-'}
                                        </td>
                                        <td className="py-4 px-6 text-slate-500 text-sm whitespace-nowrap">
                                            {new Date(log.timestamp).toLocaleTimeString()} <span className="text-xs text-slate-400">{new Date(log.timestamp).toLocaleDateString()}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mt-8 text-center text-slate-400 text-xs">
                    <p>System Uptime: {formatUptime(uptime)} • Version: {stats.version}</p>
                </div>
            </div>
        </div>
    );
}
