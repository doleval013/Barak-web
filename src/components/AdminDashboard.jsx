import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, BarChart, RefreshCw, Eye, Video, MousePointer, Activity, Globe, Info } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [stats, setStats] = useState({
        visits: 0,
        videoClicks: 0,
        contactClicks: 0,
        programViews: 0,
        trendData: []
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [uptime, setUptime] = useState(0);

    const PASSWORD_HASH = '30e2bc1d0003c567206d31c09f075c1b518a7810f096f1d2ea0c880a8629578d';

    useEffect(() => {
        // Calculate Uptime (mock based on session start)
        const interval = setInterval(() => {
            setUptime(prev => prev + 1);
        }, 60000); // Every minute
        return () => clearInterval(interval);
    }, []);

    const hashPassword = async (pass) => {
        const encoder = new TextEncoder();
        const data = encoder.encode(pass);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        const hash = await hashPassword(password);

        if (hash === PASSWORD_HASH) {
            setIsAuthenticated(true);
            fetchStats();
        } else {
            setError('Invalid Password');
        }
    };

    const fetchStats = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/stats');
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const formatUptime = (mins) => {
        const hrs = Math.floor(mins / 60);
        const m = mins % 60;
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

    return (
        <div className="min-h-screen bg-[#f8fafc] p-6 md:p-10">
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
                            onClick={fetchStats}
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
                            <div className="text-xs text-slate-400 font-bold uppercase">Session Time</div>
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
                            <h3 className="text-slate-500 font-medium mb-1">Total Visits</h3>
                            <div className="text-4xl font-bold text-slate-900 font-display">
                                {stats.visits.toLocaleString()}
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
                            <h3 className="text-slate-500 font-medium mb-1">Video Plays</h3>
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
                            <h3 className="text-slate-500 font-medium mb-1">Program Views</h3>
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
                            <h3 className="text-slate-500 font-medium mb-1">Contact Clicks</h3>
                            <div className="text-4xl font-bold text-slate-900 font-display">
                                {stats.contactClicks.toLocaleString()}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Trends Chart */}
                <div className="bg-white p-6 md:p-8 rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-slate-100 mt-6">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Weekly Unique Visitors</h3>
                            <p className="text-slate-500 text-sm">Last 7 days performance</p>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold">
                            <Info size={14} />
                            <span>Approx. unique via device storage</span>
                        </div>
                    </div>

                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.trendData}>
                                <defs>
                                    <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="name"
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
                                    dataKey="visits"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorVisits)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
