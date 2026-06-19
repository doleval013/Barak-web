/**
 * JobDetail — Single job detail page with apply functionality
 * 
 * Shows full job description and custom fields.
 * Sign-in required to apply.
 * Render candidate questions with validation in apply modal.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MapPin, Briefcase, Clock, User, Send, Check, X, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import GoogleSignInButton from '../auth/GoogleSignInButton';

const JOB_TYPE_LABELS = {
    'full-time': 'משרה מלאה',
    'part-time': 'משרה חלקית',
    'contract': 'חוזה',
};

export default function JobDetail({ jobId, onBack }) {
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [coverLetter, setCoverLetter] = useState('');
    const [answers, setAnswers] = useState({});
    const [applying, setApplying] = useState(false);
    const [applied, setApplied] = useState(false);
    const [error, setError] = useState('');
    const { user, isAuthenticated, authFetch } = useAuth();
    const { language } = useLanguage();
    const isHebrew = language === 'he';

    const fetchJob = useCallback(async () => {
        try {
            const res = await fetch(`/api/jobs/${jobId}`);
            if (res.ok) {
                setJob(await res.json());
            }
        } catch (err) {
            console.error('[JobDetail] Error:', err);
        } finally {
            setLoading(false);
        }
    }, [jobId]);

    useEffect(() => {
        setTimeout(() => {
            fetchJob();
        }, 0);
    }, [jobId, fetchJob]);

    const isQuestionVisible = useCallback(function checkVisible(q, allQuestions, currentAnswers) {
        if (!q.dependsOn || !q.dependsOn.parentId) return true;
        
        const parentQ = allQuestions.find(parent => parent.id === q.dependsOn.parentId);
        if (!parentQ) return true;
        
        if (!checkVisible(parentQ, allQuestions, currentAnswers)) return false;
        
        const parentAnswer = currentAnswers[parentQ.text];
        
        if (parentQ.type === 'checkbox') {
            const isChecked = !!parentAnswer;
            return q.dependsOn.triggerValues.some(val => {
                const valBool = (val === true || val === 'true');
                return isChecked === valBool;
            });
        } else if (parentQ.type === 'list') {
            if (parentAnswer === undefined || parentAnswer === '') return false;
            return q.dependsOn.triggerValues.includes(parentAnswer);
        }
        
        return true;
    }, []);

    const getCleanedAnswers = useCallback((allQuestions, currentAnswers) => {
        const cleaned = { ...currentAnswers };
        
        const isVisible = (q) => {
            if (!q.dependsOn || !q.dependsOn.parentId) return true;
            const parentQ = allQuestions.find(p => p.id === q.dependsOn.parentId);
            if (!parentQ) return true;
            if (!isVisible(parentQ)) return false;
            
            const parentAnswer = cleaned[parentQ.text];
            if (parentQ.type === 'checkbox') {
                const isChecked = !!parentAnswer;
                return q.dependsOn.triggerValues.some(val => (val === true || val === 'true') === isChecked);
            } else if (parentQ.type === 'list') {
                if (parentAnswer === undefined || parentAnswer === '') return false;
                return q.dependsOn.triggerValues.includes(parentAnswer);
            }
            return true;
        };
        
        for (const q of allQuestions) {
            if (!isVisible(q) && cleaned[q.text] !== undefined) {
                delete cleaned[q.text];
            }
        }
        
        return cleaned;
    }, []);

    const handleAnswerChange = (questionText, value) => {
        setAnswers(prev => {
            const next = { ...prev, [questionText]: value };
            return getCleanedAnswers(job?.questions || [], next);
        });
    };

    const handleApply = async () => {
        // Validate candidate questions
        if (job.questions && job.questions.length > 0) {
            for (const q of job.questions) {
                if (!isQuestionVisible(q, job.questions, answers)) {
                    continue;
                }
                if (q.required) {
                    const ans = answers[q.text];
                    if (q.type === 'checkbox') {
                        if (!ans) {
                            setError(isHebrew 
                                ? `עליכם לאשר את סעיף החובה: "${q.text}"` 
                                : `You must confirm the required item: "${q.text}"`);
                            return;
                        }
                    } else {
                        if (!ans || (typeof ans === 'string' && !ans.trim())) {
                            setError(isHebrew 
                                ? `נא לענות על השאלה: "${q.text}"` 
                                : `Please answer: "${q.text}"`);
                            return;
                        }
                    }
                }
            }
        }

        setApplying(true);
        setError('');

        try {
            const res = await authFetch(`/api/jobs/${jobId}/apply`, {
                method: 'POST',
                body: JSON.stringify({ 
                    coverLetter: coverLetter || null,
                    answers: answers 
                }),
            });

            if (res.ok) {
                setApplied(true);
                setShowApplyModal(false);
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to apply');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setApplying(false);
        }
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString(isHebrew ? 'he-IL' : 'en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
        );
    }

    if (!job) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-slate-700 mb-2">
                        {isHebrew ? 'המשרה לא נמצאה' : 'Job not found'}
                    </h2>
                    <button onClick={onBack} className="text-blue-600 hover:underline bg-transparent border-none cursor-pointer font-semibold">
                        {isHebrew ? 'חזרה למשרות' : 'Back to jobs'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white" dir={isHebrew ? 'rtl' : 'ltr'}>
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white">
                <div className="max-w-4xl mx-auto px-4 py-10">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-6 text-sm bg-transparent border-none cursor-pointer font-semibold"
                    >
                        <ArrowLeft size={16} />
                        {isHebrew ? 'חזרה למשרות' : 'Back to Jobs'}
                    </button>

                    <h1 className="text-3xl font-bold mb-4">{job.title}</h1>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-blue-100">
                        {job.location && (
                            <span className="flex items-center gap-1">
                                <MapPin size={16} />
                                {job.location}
                            </span>
                        )}
                        <span className="flex items-center gap-1">
                            <Briefcase size={16} />
                            {JOB_TYPE_LABELS[job.jobType] || job.jobType}
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock size={16} />
                            {isHebrew ? 'פורסם ב-' : 'Posted '}{formatDate(job.createdAt)}
                        </span>
                        {job.creatorName && (
                            <span className="flex items-center gap-1">
                                <User size={16} />
                                {job.creatorName}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Description */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm">
                            <h2 className="text-lg font-bold text-slate-900 mb-4">
                                {isHebrew ? 'תיאור המשרה' : 'Job Description'}
                            </h2>
                            <div className="prose prose-slate max-w-none whitespace-pre-wrap text-slate-600 leading-relaxed mb-6">
                                {job.description}
                            </div>

                            {/* Render candidate questions list */}
                            {job.questions && job.questions.length > 0 && (
                                <div className="mt-8 pt-8 border-t border-slate-100">
                                    <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">
                                        {isHebrew ? 'שאלות למועמד בהגשת מועמדות' : 'Candidate Application Questions'}
                                    </h3>
                                    <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                                        {job.questions.map((q, idx) => (
                                            <li key={idx}>
                                                <span className="font-semibold">{q.text}</span> ({q.type === 'list' ? (isHebrew ? 'רשימה / בחירה' : 'Dropdown List') : q.type === 'checkbox' ? (isHebrew ? 'תיבת סימון (כן/לא)' : 'Checkbox') : (isHebrew ? 'טקסט חופשי' : 'Free Text')})
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Apply Sidebar */}
                    <div>
                        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm sticky top-8">
                            {applied ? (
                                <div className="text-center py-4">
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Check size={24} className="text-green-600" />
                                    </div>
                                    <h3 className="font-bold text-slate-900 mb-1">
                                        {isHebrew ? 'המועמדות נשלחה!' : 'Applied!'}
                                    </h3>
                                    <p className="text-sm text-slate-500">
                                        {isHebrew ? 'ניצור איתך קשר בקרוב.' : 'We\'ll be in touch soon.'}
                                    </p>
                                </div>
                            ) : isAuthenticated ? (
                                <>
                                    <h3 className="font-bold text-slate-900 mb-3">
                                        {isHebrew ? 'הגשת מועמדות' : 'Apply Now'}
                                    </h3>
                                    <div className="flex items-center gap-3 mb-4 p-3 bg-slate-50 rounded-xl">
                                        {user.pictureUrl ? (
                                            <img src={user.pictureUrl} alt="" className="w-10 h-10 rounded-full" referrerPolicy="no-referrer" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                                                {user.fullName?.charAt(0)}
                                            </div>
                                        )}
                                        <div>
                                            <div className="font-medium text-sm text-slate-900">{user.fullName}</div>
                                            <div className="text-xs text-slate-500">{user.email}</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setAnswers({});
                                            setError('');
                                            setShowApplyModal(true);
                                        }}
                                        className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 cursor-pointer border-none"
                                    >
                                        <Send size={16} />
                                        {isHebrew ? 'הגש מועמדות' : 'Apply'}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="text-center mb-4">
                                        <LogIn size={32} className="mx-auto text-slate-300 mb-3" />
                                        <h3 className="font-bold text-slate-900 mb-1">
                                            {isHebrew ? 'התחברו כדי להגיש מועמדות' : 'Sign in to apply'}
                                        </h3>
                                        <p className="text-xs text-slate-500">
                                            {isHebrew ? 'היכנסו עם חשבון Google' : 'Sign in with your Google account'}
                                        </p>
                                    </div>
                                    <div className="flex justify-center">
                                        <GoogleSignInButton size="large" />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Apply Modal */}
            <AnimatePresence>
                {showApplyModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowApplyModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]"
                            onClick={(e) => e.stopPropagation()}
                            dir={isHebrew ? 'rtl' : 'ltr'}
                        >
                            <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
                                <h3 className="text-lg font-bold text-slate-900">
                                    {isHebrew ? 'הגשת מועמדות' : 'Apply to'} — {job.title}
                                </h3>
                                <button onClick={() => setShowApplyModal(false)} className="p-1 text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                {/* User info summary */}
                                <div className="bg-slate-50 rounded-xl p-4 text-sm">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <span className="text-slate-500">{isHebrew ? 'שם:' : 'Name:'}</span>
                                            <span className="font-medium text-slate-900 ms-2">{user.fullName}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-500">{isHebrew ? 'אימייל:' : 'Email:'}</span>
                                            <span className="font-medium text-slate-900 ms-2">{user.email}</span>
                                        </div>
                                        {user.phone && (
                                            <div>
                                                <span className="text-slate-500">{isHebrew ? 'טלפון:' : 'Phone:'}</span>
                                                <span className="font-medium text-slate-900 ms-2">{user.phone}</span>
                                            </div>
                                        )}
                                        {user.cvUrl && (
                                            <div>
                                                <span className="text-slate-500">CV:</span>
                                                <span className="font-medium text-green-600 ms-2">✓ {isHebrew ? 'מצורף' : 'Attached'}</span>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-400 mt-2">
                                        {isHebrew 
                                            ? 'הפרטים ישלחו כפי שמופיעים בפרופיל שלך.'
                                            : 'Your profile details will be sent as shown above.'}
                                    </p>
                                </div>

                                {/* Cover Letter */}
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-slate-700">
                                        {isHebrew ? 'מכתב מקדים (אופציונלי)' : 'Cover Letter (optional)'}
                                    </label>
                                    <textarea
                                        value={coverLetter}
                                        onChange={(e) => setCoverLetter(e.target.value)}
                                        placeholder={isHebrew ? 'ספרו לנו קצת על עצמכם...' : 'Tell us a bit about yourself...'}
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none text-sm bg-white"
                                    />
                                </div>

                                {/* Dynamic Questions with conditional visibility */}
                                {job.questions && job.questions.length > 0 && (() => {
                                     const visibleQuestions = job.questions.filter(q => isQuestionVisible(q, job.questions, answers));
                                     if (visibleQuestions.length === 0) return null;
                                     return (
                                         <div className="pt-4 border-t border-slate-100 space-y-4">
                                             <h4 className="text-sm font-bold text-slate-900">
                                                 {isHebrew ? 'שאלות למועמד בהגשת מועמדות' : 'Candidate Questions'}
                                             </h4>
                                             {visibleQuestions.map((q, idx) => (
                                                 <div key={idx} className="space-y-1.5 animate-fadeIn">
                                                     <label className="block text-sm font-medium text-slate-700">
                                                         {q.text} {q.required && <span className="text-red-500">*</span>}
                                                     </label>
                                                     {q.type === 'checkbox' ? (
                                                         <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-slate-600">
                                                             <input
                                                                 type="checkbox"
                                                                 checked={!!answers[q.text]}
                                                                 onChange={(e) => handleAnswerChange(q.text, e.target.checked)}
                                                                 className="rounded border-slate-300 text-blue-600 focus:ring-blue-200 cursor-pointer"
                                                             />
                                                             <span>{isHebrew ? 'כן, מאשר/ת' : 'Yes, I confirm'}</span>
                                                         </label>
                                                     ) : q.type === 'list' ? (
                                                         <select
                                                             value={answers[q.text] || ''}
                                                             onChange={(e) => handleAnswerChange(q.text, e.target.value)}
                                                             className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm cursor-pointer bg-white"
                                                         >
                                                             <option value="">
                                                                 -- {isHebrew ? 'בחרו אפשרות' : 'Select an option'} --
                                                             </option>
                                                             {(q.options || []).map((opt, oIdx) => (
                                                                 <option key={oIdx} value={opt}>
                                                                     {opt}
                                                                 </option>
                                                             ))}
                                                         </select>
                                                     ) : (
                                                         <textarea
                                                             value={answers[q.text] || ''}
                                                             onChange={(e) => handleAnswerChange(q.text, e.target.value)}
                                                             placeholder={isHebrew ? 'הקלידו תשובה כאן...' : 'Type your answer here...'}
                                                             rows={2}
                                                             className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm resize-none bg-white"
                                                         />
                                                     )}
                                                 </div>
                                             ))}
                                         </div>
                                     );
                                 })()}

                                {error && (
                                    <p className="text-red-500 text-sm font-semibold mt-2">{error}</p>
                                )}
                            </div>

                            <div className="flex gap-3 p-6 pt-0 sticky bottom-0 bg-white border-t border-slate-50">
                                <button
                                    onClick={() => setShowApplyModal(false)}
                                    className="flex-1 py-3 border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors cursor-pointer bg-white"
                                >
                                    {isHebrew ? 'ביטול' : 'Cancel'}
                                </button>
                                <button
                                    onClick={handleApply}
                                    disabled={applying}
                                    className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer border-none shadow-sm"
                                >
                                    {applying ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Send size={16} />
                                            {isHebrew ? 'שלח מועמדות' : 'Submit Application'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
