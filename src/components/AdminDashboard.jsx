import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, BarChart, RefreshCw, Eye, Video, MousePointer, Activity, Globe, MapPin, Smartphone, Users, ArrowUpRight, TrendingUp, Clock, Monitor, MessageCircle, Filter, Layers, Zap, Target, ChevronRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart as RechartsBarChart, Bar, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const TABS = [
    { id: 'overview', label: 'Overview', icon: Layers },
    { id: 'traffic', label: 'Traffic', icon: TrendingUp },
    { id: 'content', label: 'Content', icon: Video },
    { id: 'geo', label: 'Geo & Devices', icon: Globe },
    { id: 'feed', label: 'Live Feed', icon: Activity },
];

const COLORS = ['#6366f1','#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#14b8a6'];
const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function Card({ children, className = '' }) {
    return <div className={`bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] relative overflow-hidden ${className}`}>{children}</div>;
}

function KpiCard({ icon: Icon, label, value, color, sub }) {
    return (
        <Card>
            <div className={`absolute top-0 right-0 w-32 h-32 ${color}/10 rounded-full -mr-16 -mt-16`} />
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className={`p-3 ${color}/10 text-${color.replace('bg-','')} rounded-2xl`} style={{background:`var(--kpi-bg)`,color:`var(--kpi-fg)`}}>
                        <Icon size={24} />
                    </div>
                    <span className="text-slate-500 font-medium text-sm uppercase tracking-wide">{label}</span>
                </div>
                <div className="text-4xl font-bold text-slate-900 font-display">{typeof value === 'number' ? value.toLocaleString() : value}</div>
                {sub && <div className="text-sm text-slate-400 mt-1">{sub}</div>}
            </div>
        </Card>
    );
}

function SectionTitle({ title, sub }) {
    return (
        <div className="mb-6">
            <h3 className="text-xl font-bold text-slate-900">{title}</h3>
            {sub && <p className="text-slate-500 text-sm">{sub}</p>}
        </div>
    );
}

export default function AdminDashboard() {
    const [authToken, setAuthToken] = useState(() => sessionStorage.getItem('barak_admin_token') || '');
    const [isAuthenticated, setIsAuthenticated] = useState(!!sessionStorage.getItem('barak_admin_token'));
    const [password, setPassword] = useState('');
    const [stats, setStats] = useState({
        visits:0, visitsToday:0, liveUsers:0, videoClicks:0, contactClicks:0, programViews:0,
        trendData:[], videoTrend:[], contactTrend:[], durationTrend:[], deviceStats:[], pageStats:[],
        videoStats:[], programStats:[], contactStats:[], geoStats:[], sourceStats:[], sourceTrends:[],
        recentLogs:[], version:'', gitCommit:'',
        videoViewTrends:[], cityStats:[], pageTrends:[], peakHours:[], peakDays:[],
        returnVsNew:[], languageStats:[], bounceStats:[], scrollDepthStats:[], utmStats:[],
        funnelData:{ total_visitors:0, video_plays:0, contact_clicks:0, form_submits:0, whatsapp_clicks:0 },
        whatsappClicks:{ clicks_24h:0, clicks_30d:0 }, timePerPage:[], availablePages:[]
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [uptime, setUptime] = useState(0);
    const [activeTab, setActiveTab] = useState('overview');
    const [feedFilter, setFeedFilter] = useState('all');
    const [pageFilter, setPageFilter] = useState('all');

    useEffect(() => {
        if (!authToken) return;
        fetchStats(authToken, pageFilter);
        const interval = setInterval(() => fetchStats(authToken, pageFilter), 30000);
        return () => clearInterval(interval);
    }, [authToken, pageFilter]);

    const hashPassword = async (pass) => {
        const encoder = new TextEncoder();
        const data = encoder.encode(pass);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        const hash = await hashPassword(password);
        try {
            const res = await fetch('/api/stats', { headers: { 'x-admin-auth': hash } });
            if (res.ok) {
                setAuthToken(hash);
                setIsAuthenticated(true);
                sessionStorage.setItem('barak_admin_token', hash);
                localStorage.setItem('barak_is_admin', 'true');
                const data = await res.json();
                setStats(prev => ({ ...prev, ...data }));
                if (data.uptime) setUptime(Math.floor(data.uptime / 60));
            } else { setError('Invalid Password'); }
        } catch { setError('Connection Error'); }
        finally { setLoading(false); }
    };

    const fetchStats = async (token, page) => {
        try {
            const pageParam = page && page !== 'all' ? `?page=${encodeURIComponent(page)}` : '';
            const res = await fetch(`/api/stats${pageParam}`, { headers: { 'x-admin-auth': token } });
            if (res.ok) {
                const data = await res.json();
                setStats(prev => ({ ...prev, ...data }));
                if (data.uptime) setUptime(Math.floor(data.uptime / 60));
            } else if (res.status === 401) {
                setAuthToken(''); setIsAuthenticated(false);
                sessionStorage.removeItem('barak_admin_token');
            }
        } catch (err) { console.error(err); }
    };

    const formatUptime = (mins) => {
        const d = Math.floor(mins/1440), h = Math.floor((mins%1440)/60), m = mins%60;
        return d > 0 ? `${d}d ${h}h ${m}m` : `${h}h ${m}m`;
    };

    // LOGIN SCREEN
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
                <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6"><Lock className="text-blue-600" size={32}/></div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-6 font-display">Secured Access</h2>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <input type="password" value={password} onChange={e=>{setPassword(e.target.value);setError('');}} placeholder="Enter Password" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"/>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <button type="submit" className="w-full py-3 text-white rounded-xl font-medium transition-colors shadow-lg shadow-black/10" style={{backgroundColor:'#0f172a'}}>Login</button>
                    </form>
                </motion.div>
            </div>
        );
    }

    // PROCESSED DATA
    const visitTrendData = useMemo(() => (stats.trendData||[]).map(d => ({ date: d.date, total: parseInt(d.total_visits||0), unique: parseInt(d.unique_visitors||0) })), [stats.trendData]);

    const sourceTrendData = useMemo(() => {
        if (!stats.sourceTrends) return [];
        const grouped = {};
        stats.sourceTrends.forEach(d => {
            if (!grouped[d.date]) grouped[d.date] = { date: d.date };
            let source = 'Direct';
            if (d.referrer && d.referrer !== '') {
                try { source = new URL(d.referrer.startsWith('http') ? d.referrer : `http://${d.referrer}`).hostname.replace('www.','').split('.')[0]; source = source.charAt(0).toUpperCase() + source.slice(1); } catch { source = 'Other'; }
            }
            grouped[d.date][source] = (grouped[d.date][source]||0) + parseInt(d.count);
        });
        return Object.values(grouped).sort((a,b) => a.date.localeCompare(b.date));
    }, [stats.sourceTrends]);

    const distinctSources = useMemo(() => { const s=new Set(); sourceTrendData.forEach(d=>Object.keys(d).forEach(k=>{if(k!=='date')s.add(k);})); return Array.from(s); }, [sourceTrendData]);

    const sourceColors = { Google:'#4285F4', Facebook:'#1877F2', Instagram:'#E1306C', Direct:'#94a3b8', Other:'#cbd5e1' };
    const getSourceColor = s => sourceColors[s] || COLORS[Math.abs(s.split('').reduce((a,c)=>a+c.charCodeAt(0),0)) % COLORS.length];

    // Per-page trend data
    const pageTrendData = useMemo(() => {
        if (!stats.pageTrends) return [];
        const grouped = {};
        stats.pageTrends.forEach(d => {
            if (!grouped[d.date]) grouped[d.date] = { date: d.date };
            grouped[d.date][d.page || 'home'] = parseInt(d.count);
        });
        return Object.values(grouped).sort((a,b) => a.date.localeCompare(b.date));
    }, [stats.pageTrends]);

    const distinctPages = useMemo(() => { const s=new Set(); pageTrendData.forEach(d=>Object.keys(d).forEach(k=>{if(k!=='date')s.add(k);})); return Array.from(s); }, [pageTrendData]);

    // Per-video trend data
    const videoTrendData = useMemo(() => {
        if (!stats.videoViewTrends) return [];
        const grouped = {};
        stats.videoViewTrends.forEach(d => {
            if (!grouped[d.date]) grouped[d.date] = { date: d.date };
            grouped[d.date][d.event_name || 'unknown'] = parseInt(d.count);
        });
        return Object.values(grouped).sort((a,b) => a.date.localeCompare(b.date));
    }, [stats.videoViewTrends]);

    const distinctVideos = useMemo(() => { const s=new Set(); videoTrendData.forEach(d=>Object.keys(d).forEach(k=>{if(k!=='date')s.add(k);})); return Array.from(s); }, [videoTrendData]);

    // Return vs New
    const returnData = useMemo(() => (stats.returnVsNew||[]).map(d => ({ date: d.date, returning: parseInt(d.returning||0), new: parseInt(d.new_visitors||0) })), [stats.returnVsNew]);

    // Peak hours for heatmap
    const peakHoursData = useMemo(() => {
        const hours = Array.from({length:24},(_,i)=>({hour:i,count:0,label:`${i.toString().padStart(2,'0')}:00`}));
        (stats.peakHours||[]).forEach(h => { hours[h.hour].count = parseInt(h.count); });
        return hours;
    }, [stats.peakHours]);

    const peakDaysData = useMemo(() => {
        const days = DAY_NAMES.map((n,i)=>({name:n,count:0}));
        (stats.peakDays||[]).forEach(d => { if(days[d.dow]) days[d.dow].count = parseInt(d.count); });
        return days;
    }, [stats.peakDays]);

    // Funnel
    const funnel = stats.funnelData || {};

    // Bounce rate
    const bounceData = useMemo(() => (stats.bounceStats||[]).map(b => ({ page: b.page, rate: b.total > 0 ? Math.round((parseInt(b.bounced)/parseInt(b.total))*100) : 0, total: parseInt(b.total) })), [stats.bounceStats]);

    // Language
    const langData = useMemo(() => (stats.languageStats||[]).map(l => ({ name: l.language === 'he' ? 'Hebrew' : l.language === 'en' ? 'English' : l.language, value: parseInt(l.count) })), [stats.languageStats]);

    // Filtered feed
    const filteredLogs = useMemo(() => {
        if (feedFilter === 'all') return stats.recentLogs || [];
        return (stats.recentLogs||[]).filter(l => l.type === feedFilter);
    }, [stats.recentLogs, feedFilter]);

    const maxPeakCount = Math.max(...peakHoursData.map(h=>h.count),1);

    // TOOLTIP STYLE
    const tooltipStyle = { borderRadius:'12px', border:'none', boxShadow:'0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize:'13px' };

    // RENDER
    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900" dir="ltr">
            {/* SIDEBAR */}
            <div className="fixed left-0 top-0 bottom-0 w-[220px] bg-slate-900 text-white z-30 hidden lg:flex flex-col">
                <div className="p-6 border-b border-slate-700/50">
                    <h1 className="text-lg font-bold tracking-tight">Mission Control</h1>
                    <p className="text-slate-400 text-xs mt-1">Analytics Dashboard</p>
                </div>
                <nav className="flex-1 p-3 space-y-1">
                    {TABS.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab===tab.id ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                            <tab.icon size={18}/> {tab.label}
                        </button>
                    ))}
                </nav>
                <div className="p-4 border-t border-slate-700/50 text-xs text-slate-500">
                    <p>Uptime: {formatUptime(uptime)}</p>
                    <p>v{stats.version}</p>
                </div>
            </div>

            {/* MOBILE TAB BAR */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-30 flex">
                {TABS.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${activeTab===tab.id ? 'text-blue-600' : 'text-slate-400'}`}>
                        <tab.icon size={18}/> {tab.label}
                    </button>
                ))}
            </div>

            {/* MAIN CONTENT */}
            <div className="lg:ml-[220px] p-4 md:p-8 pb-24 lg:pb-8">
                {/* TOP BAR */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                    <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-bold text-slate-900 capitalize">{activeTab === 'feed' ? 'Live Feed' : activeTab === 'geo' ? 'Geo & Devices' : activeTab}</h2>
                        {/* Page/Endpoint Filter */}
                        <select
                            value={pageFilter}
                            onChange={e => setPageFilter(e.target.value)}
                            className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 cursor-pointer"
                        >
                            <option value="all">All Pages</option>
                            {(stats.availablePages || []).map(p => (
                                <option key={p} value={p}>/{p}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-white px-4 py-2 rounded-full border border-slate-200/60 shadow-sm flex items-center gap-2">
                            <span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"/><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"/></span>
                            <span className="font-bold text-slate-700 text-sm">{stats.liveUsers} online</span>
                        </div>
                        <button onClick={()=>fetchStats(authToken, pageFilter)} className="p-2.5 bg-white text-slate-600 rounded-full shadow-sm hover:shadow-md transition-all active:scale-95 border border-slate-200">
                            <RefreshCw size={18} className={loading?'animate-spin':''} />
                        </button>
                    </div>
                </div>

                {/* ============ TAB: OVERVIEW ============ */}
                {activeTab === 'overview' && <>
                    {/* KPIs */}
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                        <Card><div className="flex items-center gap-3 mb-3"><div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl"><Users size={20}/></div><span className="text-slate-500 text-xs font-medium uppercase tracking-wide">Unique (30d)</span></div><div className="text-3xl font-bold">{visitTrendData.reduce((a,c)=>a+c.unique,0).toLocaleString()}</div></Card>
                        <Card><div className="flex items-center gap-3 mb-3"><div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><Eye size={20}/></div><span className="text-slate-500 text-xs font-medium uppercase tracking-wide">Views (24h)</span></div><div className="text-3xl font-bold">{stats.visits.toLocaleString()}</div></Card>
                        <Card><div className="flex items-center gap-3 mb-3"><div className="p-2.5 bg-red-50 text-red-600 rounded-xl"><Video size={20}/></div><span className="text-slate-500 text-xs font-medium uppercase tracking-wide">Videos (24h)</span></div><div className="text-3xl font-bold">{stats.videoClicks.toLocaleString()}</div></Card>
                        <Card><div className="flex items-center gap-3 mb-3"><div className="p-2.5 bg-green-50 text-green-600 rounded-xl"><MousePointer size={20}/></div><span className="text-slate-500 text-xs font-medium uppercase tracking-wide">Contacts (24h)</span></div><div className="text-3xl font-bold">{stats.contactClicks.toLocaleString()}</div></Card>
                        <Card><div className="flex items-center gap-3 mb-3"><div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl"><MessageCircle size={20}/></div><span className="text-slate-500 text-xs font-medium uppercase tracking-wide">WhatsApp (24h)</span></div><div className="text-3xl font-bold">{(stats.whatsappClicks?.clicks_24h||0).toLocaleString()}</div></Card>
                    </div>

                    {/* Conversion Funnel */}
                    <Card className="mb-8">
                        <SectionTitle title="Conversion Funnel" sub="30-day visitor journey" />
                        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 py-4">
                            {[
                                { label:'Visitors', val: parseInt(funnel.total_visitors||0), color:'#6366f1' },
                                { label:'Video Plays', val: parseInt(funnel.video_plays||0), color:'#3b82f6' },
                                { label:'Contact Clicks', val: parseInt(funnel.contact_clicks||0), color:'#f59e0b' },
                                { label:'WhatsApp', val: parseInt(funnel.whatsapp_clicks||0), color:'#25D366' },
                                { label:'Form Submits', val: parseInt(funnel.form_submits||0), color:'#10b981' },
                            ].map((step, i, arr) => (
                                <React.Fragment key={step.label}>
                                    <div className="text-center min-w-[100px]">
                                        <div className="text-3xl font-bold" style={{color: step.color}}>{step.val.toLocaleString()}</div>
                                        <div className="text-xs text-slate-500 mt-1">{step.label}</div>
                                        {i > 0 && arr[0].val > 0 && <div className="text-[10px] text-slate-400 mt-0.5">{((step.val / arr[0].val)*100).toFixed(1)}%</div>}
                                    </div>
                                    {i < arr.length - 1 && <ChevronRight size={20} className="text-slate-300 shrink-0" />}
                                </React.Fragment>
                            ))}
                        </div>
                    </Card>

                    {/* Traffic Growth + Peak Hours */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        <Card className="lg:col-span-2">
                            <SectionTitle title="Traffic Growth" sub="Unique vs Total (30 Days)" />
                            <div className="h-[280px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={visitTrendData}>
                                        <defs>
                                            <linearGradient id="cTotal" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
                                            <linearGradient id="cUnique" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/><stop offset="95%" stopColor="#6366f1" stopOpacity={0}/></linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill:'#94a3b8',fontSize:11}} dy={10} minTickGap={40}/>
                                        <YAxis axisLine={false} tickLine={false} tick={{fill:'#94a3b8',fontSize:11}} dx={-10}/>
                                        <Tooltip contentStyle={tooltipStyle}/>
                                        <Area type="monotone" dataKey="total" name="Page Views" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#cTotal)"/>
                                        <Area type="monotone" dataKey="unique" name="Unique People" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#cUnique)"/>
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>

                        <Card>
                            <SectionTitle title="Peak Hours" sub="When visitors arrive" />
                            <div className="grid grid-cols-6 gap-1">
                                {peakHoursData.map(h => {
                                    const intensity = maxPeakCount > 0 ? h.count / maxPeakCount : 0;
                                    return (
                                        <div key={h.hour} className="text-center" title={`${h.label}: ${h.count} visits`}>
                                            <div className="w-full aspect-square rounded-lg transition-colors" style={{backgroundColor:`rgba(99,102,241,${Math.max(0.05,intensity)})`}}/>
                                            <span className="text-[9px] text-slate-400">{h.hour}</span>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="mt-4">
                                <p className="text-xs text-slate-500 font-medium mb-2">By Day of Week</p>
                                <div className="space-y-1.5">
                                    {peakDaysData.map(d => {
                                        const max = Math.max(...peakDaysData.map(x=>x.count),1);
                                        return (
                                            <div key={d.name} className="flex items-center gap-2">
                                                <span className="text-xs text-slate-500 w-8">{d.name}</span>
                                                <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                                    <div className="h-full bg-indigo-500 rounded-full transition-all" style={{width:`${(d.count/max)*100}%`}}/>
                                                </div>
                                                <span className="text-xs text-slate-600 font-medium w-8 text-right">{d.count}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </Card>
                    </div>
                </>}

                {/* ============ TAB: TRAFFIC ============ */}
                {activeTab === 'traffic' && <>
                    {/* Per-page trends */}
                    <Card className="mb-6">
                        <SectionTitle title="Per-Page Traffic" sub="Daily visits by page (30 days)" />
                        <div className="h-[280px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={pageTrendData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill:'#94a3b8',fontSize:11}} dy={10} minTickGap={40}/>
                                    <YAxis axisLine={false} tickLine={false} tick={{fill:'#94a3b8',fontSize:11}}/>
                                    <Tooltip contentStyle={tooltipStyle}/>
                                    {distinctPages.map((page,i) => <Area key={page} type="monotone" dataKey={page} stackId="1" stroke={COLORS[i%COLORS.length]} fill={COLORS[i%COLORS.length]} fillOpacity={0.3} strokeWidth={2}/>)}
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        {/* Source Trends */}
                        <Card>
                            <SectionTitle title="Source Trends" sub="Where traffic comes from (Daily)" />
                            <div className="h-[260px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RechartsBarChart data={sourceTrendData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill:'#94a3b8',fontSize:11}} dy={10} minTickGap={40}/>
                                        <YAxis axisLine={false} tickLine={false} tick={{fill:'#94a3b8',fontSize:11}}/>
                                        <Tooltip contentStyle={tooltipStyle}/>
                                        {distinctSources.map(s => <Bar key={s} dataKey={s} stackId="a" fill={getSourceColor(s)} radius={[2,2,0,0]}/>)}
                                    </RechartsBarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>

                        {/* Return vs New */}
                        <Card>
                            <SectionTitle title="Return vs New Visitors" sub="Daily breakdown (30 days)" />
                            <div className="h-[260px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={returnData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill:'#94a3b8',fontSize:11}} dy={10} minTickGap={40}/>
                                        <YAxis axisLine={false} tickLine={false} tick={{fill:'#94a3b8',fontSize:11}}/>
                                        <Tooltip contentStyle={tooltipStyle}/>
                                        <Area type="monotone" dataKey="new" name="New" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} stackId="1"/>
                                        <Area type="monotone" dataKey="returning" name="Returning" stroke="#10b981" fill="#10b981" fillOpacity={0.3} stackId="1"/>
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        {/* Top Sources */}
                        <Card>
                            <SectionTitle title="Top Sources (30d)" />
                            <div className="space-y-2">
                                {stats.sourceStats?.map((s,i) => (
                                    <div key={i} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors">
                                        <span className="text-slate-600 font-medium truncate max-w-[200px]" title={s.referrer}>{s.referrer ? s.referrer.replace('https://','').replace('http://','').split('/')[0] : 'Direct / Bookmark'}</span>
                                        <span className="font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md text-xs">{s.count}</span>
                                    </div>
                                ))}
                                {(!stats.sourceStats||stats.sourceStats.length===0) && <p className="text-slate-400 text-sm">No data yet.</p>}
                            </div>
                        </Card>

                        {/* UTM Campaigns */}
                        <Card>
                            <SectionTitle title="UTM Campaigns (90d)" />
                            {stats.utmStats?.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead><tr className="text-xs text-slate-400 uppercase"><th className="text-left py-2 px-2">Source</th><th className="text-left py-2 px-2">Medium</th><th className="text-left py-2 px-2">Campaign</th><th className="text-right py-2 px-2">Visits</th></tr></thead>
                                        <tbody>
                                            {stats.utmStats.map((u,i) => (
                                                <tr key={i} className="border-t border-slate-50">
                                                    <td className="py-2 px-2 text-slate-700">{u.source}</td>
                                                    <td className="py-2 px-2 text-slate-500">{u.medium}</td>
                                                    <td className="py-2 px-2 text-slate-500 truncate max-w-[120px]">{u.campaign}</td>
                                                    <td className="py-2 px-2 text-right font-bold">{u.count}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : <p className="text-slate-400 text-sm">No UTM data yet. Add ?utm_source=... to your links.</p>}
                        </Card>
                    </div>
                </>}

                {/* ============ TAB: CONTENT ============ */}
                {activeTab === 'content' && <>
                    {/* Individual video charts — one card per video */}
                    {distinctVideos.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                            {distinctVideos.map((videoName, vi) => {
                                const singleVideoData = videoTrendData.map(d => ({ date: d.date, views: d[videoName] || 0 }));
                                const totalViews = singleVideoData.reduce((a, c) => a + c.views, 0);
                                return (
                                    <Card key={videoName}>
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <h3 className="text-base font-bold text-slate-900 truncate max-w-[250px]" title={videoName}>{videoName}</h3>
                                                <p className="text-xs text-slate-400">30-day daily views</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-bold" style={{color: COLORS[vi % COLORS.length]}}>{totalViews}</div>
                                                <div className="text-[10px] text-slate-400">total plays</div>
                                            </div>
                                        </div>
                                        <div className="h-[180px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={singleVideoData}>
                                                    <defs>
                                                        <linearGradient id={`vg_${vi}`} x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor={COLORS[vi % COLORS.length]} stopOpacity={0.3}/>
                                                            <stop offset="95%" stopColor={COLORS[vi % COLORS.length]} stopOpacity={0}/>
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill:'#94a3b8',fontSize:10}} dy={5} minTickGap={50}/>
                                                    <YAxis axisLine={false} tickLine={false} tick={{fill:'#94a3b8',fontSize:10}} allowDecimals={false}/>
                                                    <Tooltip contentStyle={tooltipStyle}/>
                                                    <Area type="monotone" dataKey="views" name="Views" stroke={COLORS[vi % COLORS.length]} strokeWidth={2.5} fillOpacity={1} fill={`url(#vg_${vi})`}/>
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    ) : (
                        <Card className="mb-6">
                            <SectionTitle title="Video Views" sub="No video play data yet" />
                            <p className="text-slate-400 text-sm py-8 text-center">Video play events will appear here as individual charts once visitors start watching videos.</p>
                        </Card>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                        {/* Scroll Depth */}
                        <Card>
                            <SectionTitle title="Scroll Depth" sub="Avg % scrolled per page" />
                            <div className="space-y-3">
                                {(stats.scrollDepthStats||[]).map((s,i) => (
                                    <div key={i}>
                                        <div className="flex justify-between text-sm mb-1"><span className="text-slate-600 font-medium">{s.page}</span><span className="font-bold text-slate-800">{s.avg_depth}%</span></div>
                                        <div className="w-full bg-slate-100 rounded-full h-2.5"><div className="h-full bg-indigo-500 rounded-full transition-all" style={{width:`${s.avg_depth}%`}}/></div>
                                    </div>
                                ))}
                                {(!stats.scrollDepthStats||stats.scrollDepthStats.length===0) && <p className="text-slate-400 text-sm">No scroll data yet.</p>}
                            </div>
                        </Card>

                        {/* Time on page */}
                        <Card>
                            <SectionTitle title="Time Per Page" sub="Avg session duration" />
                            <div className="space-y-3">
                                {(stats.timePerPage||[]).map((t,i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <span className="text-slate-600 font-medium text-sm">{t.page}</span>
                                        <div className="text-right">
                                            <span className="font-bold text-slate-800">{t.avg_seconds}s</span>
                                            <span className="text-xs text-slate-400 ml-2">({t.sessions} sessions)</span>
                                        </div>
                                    </div>
                                ))}
                                {(!stats.timePerPage||stats.timePerPage.length===0) && <p className="text-slate-400 text-sm">No data yet.</p>}
                            </div>
                        </Card>

                        {/* Language + Bounce */}
                        <Card>
                            <SectionTitle title="Language & Bounce" />
                            {langData.length > 0 && (
                                <div className="h-[140px] mb-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart><Pie data={langData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={4} dataKey="value">
                                            {langData.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                                        </Pie><Tooltip contentStyle={tooltipStyle}/></PieChart>
                                    </ResponsiveContainer>
                                    <div className="flex justify-center gap-4">{langData.map((l,i) => <span key={i} className="flex items-center gap-1.5 text-xs"><span className="w-2.5 h-2.5 rounded-full" style={{backgroundColor:COLORS[i%COLORS.length]}}/>{l.name}: {l.value}</span>)}</div>
                                </div>
                            )}
                            <p className="text-xs text-slate-500 font-medium mb-2 mt-4">Bounce Rate by Page</p>
                            {bounceData.map((b,i) => (
                                <div key={i} className="flex items-center justify-between py-1">
                                    <span className="text-sm text-slate-600">{b.page}</span>
                                    <span className={`text-sm font-bold ${b.rate > 50 ? 'text-red-500' : b.rate > 30 ? 'text-amber-500' : 'text-green-500'}`}>{b.rate}%</span>
                                </div>
                            ))}
                        </Card>
                    </div>

                    {/* WhatsApp vs Contact + Top Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        <Card>
                            <SectionTitle title="Contact Channels" sub="WhatsApp vs Contact clicks" />
                            <div className="flex items-center justify-around py-6">
                                <div className="text-center"><div className="text-4xl font-bold text-green-500">{(stats.whatsappClicks?.clicks_30d||0).toLocaleString()}</div><div className="text-xs text-slate-500 mt-1">WhatsApp (30d)</div></div>
                                <div className="text-3xl text-slate-200 font-light">vs</div>
                                <div className="text-center"><div className="text-4xl font-bold text-blue-500">{(stats.contactStats||[]).reduce((a,c)=>a+parseInt(c.count),0).toLocaleString()}</div><div className="text-xs text-slate-500 mt-1">Contact Clicks (30d)</div></div>
                            </div>
                        </Card>
                        <Card>
                            <SectionTitle title="Top Content" />
                            <div className="space-y-3">
                                {stats.pageStats?.map((p,i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3"><span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">{i+1}</span><span className="text-slate-600 font-medium">{p.page}</span></div>
                                        <span className="font-bold text-slate-900">{p.count}</span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </>}

                {/* ============ TAB: GEO ============ */}
                {activeTab === 'geo' && <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        {/* Countries */}
                        <Card>
                            <SectionTitle title="Top Countries" sub="30-day visitor origins" />
                            <div className="space-y-3">
                                {stats.geoStats?.map((g,i) => {
                                    const max = stats.geoStats[0]?.count || 1;
                                    return (
                                        <div key={i}>
                                            <div className="flex justify-between text-sm mb-1"><span className="text-slate-600 font-medium">{g.country||'Unknown'}</span><span className="font-bold">{g.count} <span className="text-slate-400 font-normal">({g.unique_users} unique)</span></span></div>
                                            <div className="w-full bg-slate-100 rounded-full h-2"><div className="h-full bg-blue-500 rounded-full" style={{width:`${(parseInt(g.count)/parseInt(max))*100}%`}}/></div>
                                        </div>
                                    );
                                })}
                                {(!stats.geoStats||stats.geoStats.length===0) && <p className="text-slate-400 text-sm">No location data yet.</p>}
                            </div>
                        </Card>

                        {/* Cities */}
                        <Card>
                            <SectionTitle title="Top Cities" sub="30-day city breakdown" />
                            <div className="space-y-3">
                                {(stats.cityStats||[]).map((c,i) => {
                                    const max = stats.cityStats[0]?.count || 1;
                                    return (
                                        <div key={i}>
                                            <div className="flex justify-between text-sm mb-1"><span className="text-slate-600 font-medium">{c.city}, {c.country}</span><span className="font-bold">{c.count} <span className="text-slate-400 font-normal">({c.unique_users} unique)</span></span></div>
                                            <div className="w-full bg-slate-100 rounded-full h-2"><div className="h-full bg-indigo-500 rounded-full" style={{width:`${(parseInt(c.count)/parseInt(max))*100}%`}}/></div>
                                        </div>
                                    );
                                })}
                                {(!stats.cityStats||stats.cityStats.length===0) && <p className="text-slate-400 text-sm">No city data yet.</p>}
                            </div>
                        </Card>
                    </div>

                    {/* Devices + Duration */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        <Card>
                            <SectionTitle title="Device / Browser" />
                            <div className="space-y-3">
                                {stats.deviceStats?.map((d,i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {d.type==='mobile' ? <Smartphone size={16} className="text-purple-500"/> : <Monitor size={16} className="text-slate-500"/>}
                                            <span className="text-slate-600 font-medium text-sm">{d.browser} <span className="text-slate-400">on</span> {d.type}</span>
                                        </div>
                                        <span className="font-bold text-slate-900">{d.count}</span>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <Card>
                            <SectionTitle title="Avg Session Duration" sub="Seconds per session (daily)" />
                            <div className="h-[200px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RechartsBarChart data={stats.durationTrend}>
                                        <Bar dataKey="avg_duration" fill="#8b5cf6" radius={[4,4,0,0]}/>
                                        <Tooltip cursor={{fill:'transparent'}} contentStyle={tooltipStyle}/>
                                    </RechartsBarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </div>
                </>}

                {/* ============ TAB: LIVE FEED ============ */}
                {activeTab === 'feed' && <>
                    <Card>
                        <div className="flex items-center justify-between mb-6">
                            <SectionTitle title="Traffic Feed" sub="Recent visitor activity" />
                            <div className="flex gap-2">
                                {['all','visit','event'].map(f => (
                                    <button key={f} onClick={()=>setFeedFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${feedFilter===f ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{f==='all'?'All':f==='visit'?'Visits':'Events'}</button>
                                ))}
                            </div>
                        </div>
                        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                            <table className="w-full text-left border-collapse min-w-[700px]">
                                <thead className="bg-slate-50 sticky top-0 z-10">
                                    <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                                        <th className="py-3 px-4">Type</th>
                                        <th className="py-3 px-4">Details</th>
                                        <th className="py-3 px-4">Location</th>
                                        <th className="py-3 px-4">Source</th>
                                        <th className="py-3 px-4">Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredLogs.map((log,i) => (
                                        <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                                            <td className="py-3 px-4"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${log.type==='visit'?'bg-blue-100 text-blue-700':'bg-purple-100 text-purple-700'}`}>{log.type.toUpperCase()}</span></td>
                                            <td className="py-3 px-4"><div className="font-semibold text-slate-700 text-sm">{log.name}</div>{log.device_type && <div className="text-xs text-slate-400 capitalize">{log.device_type}</div>}</td>
                                            <td className="py-3 px-4">{log.country ? <span className="text-sm text-slate-600"><MapPin size={10} className="inline text-red-400 mr-1"/>{log.city||''}{log.city?', ':''}{log.country}</span> : <span className="text-slate-300">-</span>}</td>
                                            <td className="py-3 px-4 text-sm text-slate-500">{log.referrer ? <span className="truncate max-w-[120px] inline-block" title={log.referrer}>{log.referrer.replace('https://','').split('/')[0]}</span> : '-'}</td>
                                            <td className="py-3 px-4 text-slate-500 text-sm whitespace-nowrap">{new Date(log.timestamp).toLocaleTimeString()} <span className="text-xs text-slate-400">{new Date(log.timestamp).toLocaleDateString()}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </>}

            </div>
        </div>
    );
}
