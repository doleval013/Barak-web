/**
 * AdminApplicationViewer — View and manage job applications
 * 
 * Shows all applications for a specific job.
 * Displays applicant snapshots (survives user deletion).
 * Allows status changes (pending → reviewed → accepted/rejected).
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Mail, Phone, FileText, AlertTriangle, Check, Clock, X, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

const STATUS_STYLES = {
    pending: { bg: 'bg-amber-50', text: 'text-amber-700', icon: Clock },
    reviewed: { bg: 'bg-blue-50', text: 'text-blue-700', icon: User },
    accepted: { bg: 'bg-green-50', text: 'text-green-700', icon: Check },
    rejected: { bg: 'bg-red-50', text: 'text-red-700', icon: X },
};

export default function AdminApplicationViewer({ job, onBack }) {
    const { authFetch } = useAuth();
    const { t, language } = useLanguage();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchApplications = async () => {
        try {
            const res = await authFetch(`/api/jobs/${job?.id}/applications`);
            if (res.ok) {
                const data = await res.json();
                setApplications(data.applications || []);
            }
        } catch (err) {
            console.error('[AdminApps] Error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (job?.id) {
            setTimeout(() => {
                fetchApplications();
            }, 0);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [job?.id]);

    const updateStatus = async (appId, status) => {
        try {
            await authFetch(`/api/jobs/applications/${appId}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status }),
            });
            fetchApplications();
        } catch (err) {
            console.error('[AdminApps] Status update error:', err);
        }
    };

    if (loading) {
        return <div className="flex justify-center py-12"><div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>;
    }

    return (
        <div dir={language === 'he' ? 'rtl' : 'ltr'}>
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors mb-6 text-sm cursor-pointer"
            >
                <ArrowLeft size={16} />
                {t('back_to_jobs')}
            </button>

            <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-900">{t('view_applications_title')}{job.title}</h3>
                <p className="text-sm text-slate-500">{applications.length} {language === 'he' ? 'הגשות מועמדות' : 'application(s)'}</p>
            </div>

            {applications.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                    <User size={40} className="mx-auto mb-3 opacity-50" />
                    <p>{t('no_applications_found')}</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {applications.map((app, i) => {
                        const statusStyle = STATUS_STYLES[app.status] || STATUS_STYLES.pending;
                        const StatusIcon = statusStyle.icon;

                        return (
                            <motion.div
                                key={app.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="bg-white rounded-xl border border-slate-100 p-5 hover:shadow-sm transition-shadow"
                            >
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                    <div className="flex-1">
                                        {/* Applicant Info */}
                                        <div className="flex items-center gap-3 mb-3">
                                            {app.currentPicture && !app.isUserDeleted ? (
                                                <img src={app.currentPicture} alt="" className="w-10 h-10 rounded-full shrink-0" referrerPolicy="no-referrer" />
                                            ) : (
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                                                    app.isUserDeleted ? 'bg-slate-200 text-slate-500' : 'bg-blue-100 text-blue-600'
                                                }`}>
                                                    {app.applicantName?.charAt(0)?.toUpperCase()}
                                                </div>
                                            )}
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-slate-900">{app.applicantName}</span>
                                                    {app.isUserDeleted && (
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">
                                                            <AlertTriangle size={10} /> {t('deleted_user_badge')}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-slate-500">{app.applicantEmail}</div>
                                            </div>
                                        </div>

                                        {/* Contact Info */}
                                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 mb-2">
                                            <span className="flex items-center gap-1">
                                                <Mail size={14} className="text-slate-400" />
                                                {app.applicantEmail}
                                            </span>
                                            {app.applicantPhone && (
                                                <span className="flex items-center gap-1">
                                                    <Phone size={14} className="text-slate-400" />
                                                    {app.applicantPhone}
                                                </span>
                                            )}
                                            {app.cvUrl && (
                                                <a
                                                    href={app.cvUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1 text-blue-600 hover:underline font-medium"
                                                >
                                                    <FileText size={14} />
                                                    {t('view_cv')}
                                                </a>
                                            )}
                                        </div>

                                        {/* Cover Letter */}
                                        {app.coverLetter && (
                                            <div className="bg-slate-50 rounded-lg p-3 mt-2">
                                                <p className="text-xs text-slate-500 font-medium mb-1">{t('cover_letter_label')}</p>
                                                <p className="text-sm text-slate-700 whitespace-pre-wrap">{app.coverLetter}</p>
                                            </div>
                                        )}

                                        {/* Custom Answers */}
                                        {app.answers && Object.keys(app.answers).length > 0 && (
                                            <div className="bg-blue-50/20 rounded-lg p-3.5 mt-2 border border-blue-100/40">
                                                <p className="text-xs text-blue-800 font-bold mb-2">
                                                    {language === 'he' ? '📋 תשובות לשאלות מותאמות' : '📋 Custom Question Answers'}
                                                </p>
                                                <div className="space-y-2">
                                                    {Object.entries(app.answers).map(([question, answer], idx) => (
                                                        <div key={idx} className="text-sm">
                                                            <div className="text-slate-500 font-medium text-xs">{question}</div>
                                                            <div className="text-slate-800 font-bold mt-0.5">
                                                                {typeof answer === 'boolean' 
                                                                    ? (answer ? (language === 'he' ? '✓ כן / מאושר' : '✓ Yes / Confirmed') : (language === 'he' ? '✗ לא / לא מאושר' : '✗ No / Unconfirmed')) 
                                                                    : (answer || '-')}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="text-xs text-slate-400 mt-2">
                                            {t('applied_date')}{new Date(app.appliedAt).toLocaleString()}
                                        </div>
                                    </div>

                                    {/* Status + Actions */}
                                    <div className="shrink-0 flex sm:flex-col items-end gap-2 justify-between md:justify-start">
                                        <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text} mb-2`}>
                                            <StatusIcon size={12} />
                                            {app.status === 'pending' ? t('pending_status') : app.status === 'reviewed' ? t('reviewed_status') : app.status === 'accepted' ? t('accepted_status') : t('rejected_status')}
                                        </div>
                                        <div className="mt-2">
                                            <select
                                                value={app.status}
                                                onChange={(e) => updateStatus(app.id, e.target.value)}
                                                className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer bg-white"
                                            >
                                                <option value="pending">{t('pending_status')}</option>
                                                <option value="reviewed">{t('reviewed_status')}</option>
                                                <option value="accepted">{t('accepted_status')}</option>
                                                <option value="rejected">{t('rejected_status')}</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
