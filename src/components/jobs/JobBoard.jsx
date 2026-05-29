/**
 * JobBoard — Public job listings page
 * 
 * Displays all open jobs with search/filter.
 * Visitors can browse without signing in.
 * Sign-in required to apply.
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Briefcase, Clock, ArrowLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import JobDetail from './JobDetail';

const JOB_TYPE_LABELS = {
    'full-time': 'משרה מלאה',
    'part-time': 'משרה חלקית',
    'contract': 'חוזה',
};

const JOB_TYPE_COLORS = {
    'full-time': 'bg-blue-50 text-blue-700',
    'part-time': 'bg-purple-50 text-purple-700',
    'contract': 'bg-amber-50 text-amber-700',
};

export default function JobBoard() {
    const { user } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedJobId, setSelectedJobId] = useState(null);
    const { language } = useLanguage();
    const isHebrew = language === 'he';

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const res = await fetch('/api/jobs');
            if (res.ok) {
                const data = await res.json();
                setJobs(data.jobs || []);
            }
        } catch (err) {
            console.error('[JobBoard] Error fetching jobs:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredJobs = jobs.filter(job => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
            job.title.toLowerCase().includes(q) ||
            job.description.toLowerCase().includes(q) ||
            (job.location && job.location.toLowerCase().includes(q))
        );
    });

    const navigateHome = () => {
        window.history.pushState({}, '', '/');
        window.dispatchEvent(new PopStateEvent('popstate'));
    };

    // Show job detail if a job is selected
    if (selectedJobId) {
        return (
            <JobDetail 
                jobId={selectedJobId} 
                onBack={() => setSelectedJobId(null)} 
            />
        );
    }

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString(isHebrew ? 'he-IL' : 'en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white" dir={isHebrew ? 'rtl' : 'ltr'}>
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white">
                <div className="max-w-5xl mx-auto px-4 py-12 md:py-16">
                    <button
                        onClick={navigateHome}
                        className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-6 text-sm"
                    >
                        <ArrowLeft size={16} />
                        {isHebrew ? 'חזרה לעמוד הראשי' : 'Back to Home'}
                    </button>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold mb-3">
                                {isHebrew ? '💼 לוח משרות' : '💼 Job Board'}
                            </h1>
                            <p className="text-blue-100 text-lg max-w-2xl">
                                {isHebrew 
                                    ? 'הצטרפו לצוות שלנו! כאן תמצאו את המשרות הפתוחות שלנו.'
                                    : 'Join our team! Browse our open positions below.'}
                            </p>
                        </div>
                        {(user?.role === 'admin' || user?.role === 'recruiter') && (
                            <button
                                onClick={() => {
                                    window.history.pushState({}, '', '/admin');
                                    window.dispatchEvent(new PopStateEvent('popstate'));
                                }}
                                className="flex items-center gap-2 px-5 py-3 bg-white text-blue-700 font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-102 active:scale-98 transition-all text-sm shrink-0 border border-blue-100 self-start md:self-center cursor-pointer"
                            >
                                <Briefcase size={16} />
                                {isHebrew ? 'ניהול משרות' : 'Manage Jobs'}
                            </button>
                        )}
                    </div>

                    {/* Search */}
                    <div className="mt-8 max-w-xl">
                        <div className="relative">
                            <Search size={20} className="absolute top-1/2 -translate-y-1/2 text-slate-400" style={{ [isHebrew ? 'right' : 'left']: '14px' }} />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={isHebrew ? 'חיפוש משרות...' : 'Search jobs...'}
                                className="w-full py-3 px-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Job Cards */}
            <div className="max-w-5xl mx-auto px-4 py-8">
                {loading ? (
                    <div className="flex justify-center py-16">
                        <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                    </div>
                ) : filteredJobs.length === 0 ? (
                    <div className="text-center py-16">
                        <Briefcase size={48} className="mx-auto text-slate-300 mb-4" />
                        <h3 className="text-lg font-semibold text-slate-700 mb-2">
                            {isHebrew ? 'אין משרות פתוחות כרגע' : 'No open positions right now'}
                        </h3>
                        <p className="text-slate-500">
                            {isHebrew 
                                ? 'חזרו שוב בקרוב — אנחנו תמיד מחפשים אנשים מעולים!'
                                : 'Check back soon — we\'re always looking for great people!'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredJobs.map((job, i) => (
                            <motion.button
                                key={job.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                onClick={() => setSelectedJobId(job.id)}
                                className="w-full text-start bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors mb-2">
                                            {job.title}
                                        </h3>
                                        <p className="text-slate-600 text-sm line-clamp-2 mb-3">
                                            {job.description}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-3 text-sm">
                                            {job.location && (
                                                <span className="flex items-center gap-1 text-slate-500">
                                                    <MapPin size={14} />
                                                    {job.location}
                                                </span>
                                            )}
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${JOB_TYPE_COLORS[job.jobType] || 'bg-slate-100 text-slate-600'}`}>
                                                <Briefcase size={12} />
                                                {JOB_TYPE_LABELS[job.jobType] || job.jobType}
                                            </span>
                                            <span className="flex items-center gap-1 text-slate-400 text-xs">
                                                <Clock size={12} />
                                                {formatDate(job.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                    <ChevronRight size={20} className="text-slate-300 group-hover:text-blue-500 transition-colors shrink-0 mt-1" />
                                </div>
                            </motion.button>
                        ))}
                    </div>
                )}

                <div className="text-center mt-8 text-sm text-slate-400">
                    {filteredJobs.length > 0 && `${filteredJobs.length} ${isHebrew ? 'משרות פתוחות' : 'open positions'}`}
                </div>
            </div>
        </div>
    );
}
