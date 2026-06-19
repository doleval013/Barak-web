/**
 * MyApplications — User's job application history
 * 
 * Shows all jobs the user has applied to, with status badges.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Briefcase, Clock, Check, X, Eye, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

const STATUS_CONFIG = {
    pending: { label: 'ממתין', labelEn: 'Pending', color: 'bg-amber-50 text-amber-700', icon: Clock },
    reviewed: { label: 'נבדק', labelEn: 'Reviewed', color: 'bg-blue-50 text-blue-700', icon: Eye },
    accepted: { label: 'התקבל', labelEn: 'Accepted', color: 'bg-green-50 text-green-700', icon: Check },
    rejected: { label: 'נדחה', labelEn: 'Rejected', color: 'bg-red-50 text-red-700', icon: X },
};

export default function MyApplications() {
    const { authFetch, isAuthenticated } = useAuth();
    const { language } = useLanguage();
    const isHebrew = language === 'he';
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchApplications = useCallback(async () => {
        try {
            const res = await authFetch('/api/jobs/my/applications');
            if (res.ok) {
                const data = await res.json();
                setApplications(data.applications || []);
            }
        } catch (err) {
            console.error('[MyApps] Error:', err);
        } finally {
            setLoading(false);
        }
    }, [authFetch]);

    useEffect(() => {
        if (isAuthenticated) {
            setTimeout(() => {
                fetchApplications();
            }, 0);
        }
    }, [isAuthenticated, fetchApplications]);

    const navigateBack = () => {
        window.history.pushState({}, '', '/');
        window.dispatchEvent(new PopStateEvent('popstate'));
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <p className="text-slate-500">{isHebrew ? 'נדרשת התחברות' : 'Sign in required'}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white" dir={isHebrew ? 'rtl' : 'ltr'}>
            <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white">
                <div className="max-w-4xl mx-auto px-4 py-10">
                    <button
                        onClick={navigateBack}
                        className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-6 text-sm"
                    >
                        <ArrowLeft size={16} />
                        {isHebrew ? 'חזרה' : 'Back'}
                    </button>
                    <h1 className="text-2xl font-bold">
                        {isHebrew ? '📋 המועמדויות שלי' : '📋 My Applications'}
                    </h1>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-8">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                    </div>
                ) : applications.length === 0 ? (
                    <div className="text-center py-16">
                        <Briefcase size={48} className="mx-auto text-slate-300 mb-4" />
                        <h3 className="text-lg font-semibold text-slate-700 mb-2">
                            {isHebrew ? 'עדיין לא הגשתם מועמדות' : 'No applications yet'}
                        </h3>
                        <p className="text-slate-500 mb-4">
                            {isHebrew ? 'עברו על המשרות הפתוחות שלנו' : 'Browse our open positions'}
                        </p>
                        <button
                            onClick={() => {
                                window.history.pushState({}, '', '/jobs');
                                window.dispatchEvent(new PopStateEvent('popstate'));
                            }}
                            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                        >
                            {isHebrew ? 'צפו במשרות' : 'View Jobs'}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {applications.map((app) => {
                            const status = STATUS_CONFIG[app.status] || STATUS_CONFIG.pending;
                            const StatusIcon = status.icon;

                            return (
                                <div
                                    key={app.id}
                                    className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <h3 className="font-bold text-slate-900 mb-1">{app.jobTitle}</h3>
                                            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                                                {app.jobLocation && (
                                                    <span className="flex items-center gap-1">
                                                        <MapPin size={14} /> {app.jobLocation}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1">
                                                    <Clock size={14} />
                                                    {new Date(app.appliedAt).toLocaleDateString(isHebrew ? 'he-IL' : 'en-US')}
                                                </span>
                                            </div>
                                            {app.coverLetter && (
                                                <p className="text-sm text-slate-600 mt-2 line-clamp-2">{app.coverLetter}</p>
                                            )}
                                        </div>
                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${status.color}`}>
                                            <StatusIcon size={14} />
                                            {isHebrew ? status.label : status.labelEn}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
