/**
 * AdminJobManager — Admin CRUD for job postings and templates
 * 
 * Table view of all jobs and templates with create/edit/delete functionality.
 * Includes application count per job, template pre-filling, unified candidate questions,
 * conditional dependency logic, job expiration settings, and site-wide notifications.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Eye, EyeOff, Users, X, Save, FileText, ArrowLeft, Check, Clock, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

const JOB_TYPES = ['full-time', 'part-time', 'contract'];

export default function AdminJobManager({ onViewApplications }) {
    const authContext = useAuth();
    const { authFetch } = authContext;
    const { t, language } = useLanguage();

    // View modes: 'jobs' or 'templates'
    const [viewMode, setViewMode] = useState('jobs');

    // List states
    const [jobs, setJobs] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form visibility states
    const [showForm, setShowForm] = useState(false);
    const [showTemplateForm, setShowTemplateForm] = useState(false);

    // Edit targets
    const [editingJob, setEditingJob] = useState(null);
    const [editingTemplate, setEditingTemplate] = useState(null);

    // Job form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: '',
        jobType: 'full-time',
        isVisible: true,
        editPolicy: 'owner_only',
        newOwnerId: '',
        customFields: [], // kept as empty array for db compatibility
        questions: [],
        expirationDate: ''
    });

    // Template form state
    const [templateData, setTemplateData] = useState({
        title: '',
        description: '',
        customFields: [], // kept as empty array for db compatibility
        questions: []
    });

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [emailNotifications, setEmailNotifications] = useState(false);
    const [updatingSettings, setUpdatingSettings] = useState(false);

    // ------------------------------------------------------------
    // API DATA FETCHING
    // ------------------------------------------------------------

    const fetchJobs = useCallback(async () => {
        try {
            const openRes = await authFetch('/api/jobs?status=all');
            const data = openRes.ok ? await openRes.json() : { jobs: [] };
            setJobs(data.jobs || []);
        } catch (err) {
            console.error('[AdminJobs] Error fetching jobs:', err);
        }
    }, [authFetch]);

    const fetchTemplates = useCallback(async () => {
        try {
            const res = await authFetch('/api/jobs/templates/all');
            if (res.ok) {
                const data = await res.json();
                setTemplates(data.templates || []);
            }
        } catch (err) {
            console.error('[AdminTemplates] Error fetching templates:', err);
        }
    }, [authFetch]);

    const fetchSettings = useCallback(async () => {
        try {
            const res = await authFetch('/api/jobs/settings/notifications');
            if (res.ok) {
                const data = await res.json();
                setEmailNotifications(!!data.email_notifications_enabled);
            }
        } catch (err) {
            console.error('[AdminSettings] Error fetching settings:', err);
        }
    }, [authFetch]);

    const loadInitialData = useCallback(async () => {
        setLoading(true);
        await Promise.all([fetchJobs(), fetchTemplates(), fetchSettings()]);
        setLoading(false);
    }, [fetchJobs, fetchTemplates, fetchSettings]);

    useEffect(() => {
        setTimeout(() => {
            loadInitialData();
        }, 0);
    }, [loadInitialData]);

    // ------------------------------------------------------------
    // SETTINGS ACTIONS
    // ------------------------------------------------------------

    const toggleEmailNotifications = async () => {
        setUpdatingSettings(true);
        try {
            const nextVal = !emailNotifications;
            const res = await authFetch('/api/jobs/settings/notifications', {
                method: 'POST',
                body: JSON.stringify({ email_notifications_enabled: nextVal })
            });
            if (res.ok) {
                setEmailNotifications(nextVal);
            }
        } catch (err) {
            console.error('[AdminSettings] Error updating settings:', err);
        } finally {
            setUpdatingSettings(false);
        }
    };

    // ------------------------------------------------------------
    // JOB FORM HANDLERS
    // ------------------------------------------------------------

    const openCreateForm = () => {
        setEditingJob(null);
        setFormData({
            title: '',
            description: '',
            location: '',
            jobType: 'full-time',
            isVisible: true,
            editPolicy: 'owner_only',
            newOwnerId: '',
            customFields: [],
            questions: [],
            expirationDate: ''
        });
        setShowForm(true);
        setError('');
    };

    const openEditForm = (job) => {
        setEditingJob(job);
        
        let formattedDate = '';
        if (job.expirationDate) {
            const d = new Date(job.expirationDate);
            const pad = (num) => String(num).padStart(2, '0');
            formattedDate = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        }

        setFormData({
            title: job.title,
            description: job.description,
            location: job.location || '',
            jobType: job.jobType,
            isVisible: job.isVisible !== undefined ? job.isVisible : true,
            editPolicy: job.editPolicy || 'owner_only',
            newOwnerId: '',
            customFields: [],
            questions: (job.questions || []).map((q, idx) => ({
                id: q.id || `q_${Math.random().toString(36).substr(2, 9)}_${idx}`,
                text: q.text || '',
                type: q.type || 'text',
                required: q.required !== undefined ? q.required : true,
                options: q.options || [],
                dependsOn: q.dependsOn || null
            })),
            expirationDate: formattedDate
        });
        setShowForm(true);
        setError('');
    };

    const handleApplyTemplate = (e) => {
        const templateId = parseInt(e.target.value);
        if (!templateId) {
            setFormData(prev => ({
                ...prev,
                title: '',
                description: '',
                customFields: [],
                questions: []
            }));
            return;
        }

        const template = templates.find(t => t.id === templateId);
        if (!template) return;

        setFormData(prev => ({
            ...prev,
            title: template.title || '',
            description: template.description || '',
            customFields: [],
            questions: (template.questions || []).map((q, idx) => ({
                id: q.id || `q_${Math.random().toString(36).substr(2, 9)}_${idx}`,
                text: q.text || '',
                type: q.type || 'text',
                required: q.required !== undefined ? q.required : true,
                options: q.options || [],
                dependsOn: q.dependsOn || null
            }))
        }));
    };

    const handleAddQuestion = () => {
        setFormData(prev => ({
            ...prev,
            questions: [...prev.questions, {
                id: `q_${Math.random().toString(36).substr(2, 9)}_${prev.questions.length}`,
                text: '',
                type: 'text',
                required: true,
                options: [],
                dependsOn: null
            }]
        }));
    };

    const handleUpdateQuestion = (index, key, val) => {
        setFormData(prev => {
            const updated = [...prev.questions];
            if (key === 'type') {
                updated[index] = {
                    ...updated[index],
                    type: val,
                    options: val === 'list' ? [''] : [],
                    dependsOn: null
                };
            } else if (key === 'parentId') {
                if (!val) {
                    updated[index] = { ...updated[index], dependsOn: null };
                } else {
                    updated[index] = {
                        ...updated[index],
                        dependsOn: { parentId: val, triggerValues: [] }
                    };
                }
            } else if (key === 'triggerValues') {
                const currentDepends = updated[index].dependsOn || { parentId: '', triggerValues: [] };
                updated[index] = {
                    ...updated[index],
                    dependsOn: { ...currentDepends, triggerValues: val }
                };
            } else {
                updated[index] = { ...updated[index], [key]: val };
            }
            return { ...prev, questions: updated };
        });
    };

    const handleRemoveQuestion = (index) => {
        setFormData(prev => ({
            ...prev,
            questions: prev.questions.filter((_, i) => i !== index)
        }));
    };

    const handleAddQuestionOption = (qIdx) => {
        setFormData(prev => {
            const updated = [...prev.questions];
            const q = updated[qIdx];
            const opts = q.options ? [...q.options] : [];
            opts.push('');
            updated[qIdx] = { ...q, options: opts };
            return { ...prev, questions: updated };
        });
    };

    const handleUpdateQuestionOption = (qIdx, optIdx, val) => {
        setFormData(prev => {
            const updated = [...prev.questions];
            const q = updated[qIdx];
            const opts = q.options ? [...q.options] : [];
            opts[optIdx] = val;
            updated[qIdx] = { ...q, options: opts };
            return { ...prev, questions: updated };
        });
    };

    const handleRemoveQuestionOption = (qIdx, optIdx) => {
        setFormData(prev => {
            const updated = [...prev.questions];
            const q = updated[qIdx];
            const opts = q.options ? [...q.options] : [];
            opts.splice(optIdx, 1);
            updated[qIdx] = { ...q, options: opts };
            return { ...prev, questions: updated };
        });
    };

    // ------------------------------------------------------------
    // TEMPLATE FORM HANDLERS
    // ------------------------------------------------------------

    const openCreateTemplateForm = () => {
        setEditingTemplate(null);
        setTemplateData({
            title: '',
            description: '',
            customFields: [],
            questions: []
        });
        setShowTemplateForm(true);
        setError('');
    };

    const openEditTemplateForm = (tpl) => {
        setEditingTemplate(tpl);
        setTemplateData({
            title: tpl.title,
            description: tpl.description || '',
            customFields: [],
            questions: (tpl.questions || []).map((q, idx) => ({
                id: q.id || `q_${Math.random().toString(36).substr(2, 9)}_${idx}`,
                text: q.text || '',
                type: q.type || 'text',
                required: q.required !== undefined ? q.required : true,
                options: q.options || [],
                dependsOn: q.dependsOn || null
            }))
        });
        setShowTemplateForm(true);
        setError('');
    };

    const handleAddTplQuestion = () => {
        setTemplateData(prev => ({
            ...prev,
            questions: [...prev.questions, {
                id: `q_${Math.random().toString(36).substr(2, 9)}_${prev.questions.length}`,
                text: '',
                type: 'text',
                required: true,
                options: [],
                dependsOn: null
            }]
        }));
    };

    const handleUpdateTplQuestion = (index, key, val) => {
        setTemplateData(prev => {
            const updated = [...prev.questions];
            if (key === 'type') {
                updated[index] = {
                    ...updated[index],
                    type: val,
                    options: val === 'list' ? [''] : [],
                    dependsOn: null
                };
            } else if (key === 'parentId') {
                if (!val) {
                    updated[index] = { ...updated[index], dependsOn: null };
                } else {
                    updated[index] = {
                        ...updated[index],
                        dependsOn: { parentId: val, triggerValues: [] }
                    };
                }
            } else if (key === 'triggerValues') {
                const currentDepends = updated[index].dependsOn || { parentId: '', triggerValues: [] };
                updated[index] = {
                    ...updated[index],
                    dependsOn: { ...currentDepends, triggerValues: val }
                };
            } else {
                updated[index] = { ...updated[index], [key]: val };
            }
            return { ...prev, questions: updated };
        });
    };

    const handleRemoveTplQuestion = (index) => {
        setTemplateData(prev => ({
            ...prev,
            questions: prev.questions.filter((_, i) => i !== index)
        }));
    };

    const handleAddTplQuestionOption = (qIdx) => {
        setTemplateData(prev => {
            const updated = [...prev.questions];
            const q = updated[qIdx];
            const opts = q.options ? [...q.options] : [];
            opts.push('');
            updated[qIdx] = { ...q, options: opts };
            return { ...prev, questions: updated };
        });
    };

    const handleUpdateTplQuestionOption = (qIdx, optIdx, val) => {
        setTemplateData(prev => {
            const updated = [...prev.questions];
            const q = updated[qIdx];
            const opts = q.options ? [...q.options] : [];
            opts[optIdx] = val;
            updated[qIdx] = { ...q, options: opts };
            return { ...prev, questions: updated };
        });
    };

    const handleRemoveTplQuestionOption = (qIdx, optIdx) => {
        setTemplateData(prev => {
            const updated = [...prev.questions];
            const q = updated[qIdx];
            const opts = q.options ? [...q.options] : [];
            opts.splice(optIdx, 1);
            updated[qIdx] = { ...q, options: opts };
            return { ...prev, questions: updated };
        });
    };

    // ------------------------------------------------------------
    // CRUDS LOGIC SUBMISSIONS
    // ------------------------------------------------------------

    const handleSubmit = async () => {
        if (!formData.title || !formData.description) {
            setError(language === 'he' ? 'חובה להזין כותרת ותיאור' : 'Title and description are required');
            return;
        }

        setSaving(true);
        setError('');

        try {
            const url = editingJob ? `/api/jobs/${editingJob.id}` : '/api/jobs';
            const method = editingJob ? 'PUT' : 'POST';

            // Filter out empty options in list-type questions and clean up invalid dependsOn parent IDs
            const cleanQuestions = formData.questions.map(q => {
                const cleanQ = { ...q };
                if (cleanQ.type === 'list') {
                    cleanQ.options = (cleanQ.options || []).filter(o => o.trim() !== '');
                } else {
                    cleanQ.options = [];
                }
                
                // If the dependsOn parent question doesn't exist anymore in the list, nullify it
                if (cleanQ.dependsOn?.parentId) {
                    const parentExists = formData.questions.some(parent => parent.id === cleanQ.dependsOn.parentId);
                    if (!parentExists) {
                        cleanQ.dependsOn = null;
                    }
                }
                return cleanQ;
            });

            const payload = {
                ...formData,
                questions: cleanQuestions,
                expirationDate: formData.expirationDate || null
            };

            const res = await authFetch(url, {
                method,
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                // If admin and newOwnerId is set during an edit, we transfer ownership
                if (editingJob && formData.newOwnerId && authContext?.isAdmin) {
                    await authFetch(`/api/jobs/${editingJob.id}/owner`, {
                        method: 'PATCH',
                        body: JSON.stringify({ newOwnerId: formData.newOwnerId })
                    });
                }

                setShowForm(false);
                fetchJobs();
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to save');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleTemplateSubmit = async () => {
        if (!templateData.title) {
            setError(language === 'he' ? 'חובה להזין כותרת לתבנית' : 'Template title is required');
            return;
        }

        setSaving(true);
        setError('');

        try {
            const url = editingTemplate ? `/api/jobs/templates/${editingTemplate.id}` : '/api/jobs/templates/create';
            const method = editingTemplate ? 'PUT' : 'POST';

            const cleanQuestions = templateData.questions.map(q => {
                const cleanQ = { ...q };
                if (cleanQ.type === 'list') {
                    cleanQ.options = (cleanQ.options || []).filter(o => o.trim() !== '');
                } else {
                    cleanQ.options = [];
                }
                if (cleanQ.dependsOn?.parentId) {
                    const parentExists = templateData.questions.some(parent => parent.id === cleanQ.dependsOn.parentId);
                    if (!parentExists) {
                        cleanQ.dependsOn = null;
                    }
                }
                return cleanQ;
            });

            const payload = {
                ...templateData,
                questions: cleanQuestions
            };

            const res = await authFetch(url, {
                method,
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                setShowTemplateForm(false);
                fetchTemplates();
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to save template');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const toggleJobStatus = async (job) => {
        const newStatus = job.status === 'open' ? 'closed' : 'open';
        try {
            await authFetch(`/api/jobs/${job.id}`, {
                method: 'PUT',
                body: JSON.stringify({ status: newStatus }),
            });
            fetchJobs();
        } catch (err) {
            console.error('[AdminJobs] Toggle error:', err);
        }
    };

    const deleteJob = async (job) => {
        const deleteMsg = language === 'he'
            ? `האם למחוק את המשרה "${job.title}"? פעולה זו תמחק גם את כל הגשות המועמדות.`
            : `Delete "${job.title}"? This will also delete all applications.`;
        if (!confirm(deleteMsg)) return;
        try {
            await authFetch(`/api/jobs/${job.id}`, { method: 'DELETE' });
            fetchJobs();
        } catch (err) {
            console.error('[AdminJobs] Delete error:', err);
        }
    };

    const deleteTemplate = async (tpl) => {
        const deleteMsg = language === 'he'
            ? `האם למחוק את התבנית "${tpl.title}"?`
            : `Delete template "${tpl.title}"?`;
        if (!confirm(deleteMsg)) return;
        try {
            await authFetch(`/api/jobs/templates/${tpl.id}`, { method: 'DELETE' });
            fetchTemplates();
        } catch (err) {
            console.error('[AdminTemplates] Delete error:', err);
        }
    };

    // ------------------------------------------------------------
    // RENDER FUNCTIONS
    // ------------------------------------------------------------

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div dir={language === 'he' ? 'rtl' : 'ltr'}>
            {/* Top Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div>
                    <h3 className="text-xl font-bold text-slate-900">
                        {viewMode === 'jobs' ? t('job_postings') : (language === 'he' ? 'תבניות משרה' : 'Job Templates')}
                    </h3>
                    <p className="text-sm text-slate-500">
                        {viewMode === 'jobs'
                            ? `${jobs.length} ${t('total_jobs')}`
                            : `${templates.length} ${language === 'he' ? 'תבניות סה"כ' : 'total templates'}`
                        }
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* View Switcher Toggle Button */}
                    <button
                        onClick={() => setViewMode(viewMode === 'jobs' ? 'templates' : 'jobs')}
                        className="flex items-center gap-2 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-medium transition-colors text-sm cursor-pointer bg-white"
                    >
                        {viewMode === 'jobs' ? (
                            <>
                                <FileText size={16} />
                                {language === 'he' ? 'ניהול תבניות משרה' : 'Manage Templates'}
                            </>
                        ) : (
                            <>
                                <ArrowLeft size={16} className={language === 'he' ? 'rotate-180' : ''} />
                                {language === 'he' ? 'חזרה למשרות' : 'Back to Jobs'}
                            </>
                        )}
                    </button>

                    <button
                        onClick={viewMode === 'jobs' ? openCreateForm : openCreateTemplateForm}
                        className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors text-sm cursor-pointer border-none"
                    >
                        <Plus size={16} />
                        {viewMode === 'jobs' ? t('new_job') : (language === 'he' ? 'תבנית חדשה' : 'New Template')}
                    </button>
                </div>
            </div>

            {/* Email Notifications Settings Banner (Admin Only / Recruiter) */}
            {viewMode === 'jobs' && (
                <div className="bg-slate-50 rounded-xl border border-slate-100 p-4 mb-6 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <Mail size={18} />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-slate-800">
                                {language === 'he' ? 'התראות אימייל על הגשות מועמדות' : 'Application Notifications'}
                            </h4>
                            <p className="text-xs text-slate-500">
                                {language === 'he' ? 'שלח אימייל למנהלים ולמפרסם המשרה בכל פעם שמועמד מגיש מועמדות' : 'Send email to admins and job creator whenever a candidate applies'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-600">
                            {emailNotifications ? (language === 'he' ? 'פעיל' : 'Active') : (language === 'he' ? 'כבוי' : 'Inactive')}
                        </span>
                        <button
                            onClick={toggleEmailNotifications}
                            disabled={updatingSettings}
                            className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
                                emailNotifications ? 'bg-blue-600' : 'bg-slate-300'
                            }`}
                            aria-label="Toggle notifications"
                        >
                            <div
                                    className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ${
                                    emailNotifications ? (language === 'he' ? '-translate-x-6' : 'translate-x-6') : 'translate-x-0'
                                }`}
                            />
                        </button>
                    </div>
                </div>
            )}

            {/* ============================================================
                VIEW: JOBS LIST
                ============================================================ */}
            {viewMode === 'jobs' && (
                <div className="space-y-3">
                    {jobs.map((job) => {
                        const isExpired = job.expirationDate && new Date(job.expirationDate) <= new Date();
                        return (
                            <div key={job.id} className="bg-white rounded-xl border border-slate-100 p-4 hover:shadow-sm transition-shadow">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <h4 className="font-semibold text-slate-900 truncate">{job.title}</h4>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                                job.status === 'open' ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'
                                            }`}>
                                                {job.status === 'open' ? (language === 'he' ? 'פתוחה' : 'open') : (language === 'he' ? 'סגורה' : 'closed')}
                                            </span>
                                            {!job.isVisible && (
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-50 text-amber-700">
                                                    {language === 'he' ? 'מוסתרת' : 'Hidden'}
                                                </span>
                                            )}
                                            {isExpired && (
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-red-50 text-red-700 flex items-center gap-1">
                                                    <Clock size={10} />
                                                    {language === 'he' ? 'פג תוקף' : 'Expired'}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-slate-500 truncate">{job.description}</p>
                                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-400 flex-wrap">
                                            {job.location && <span>📍 {job.location}</span>}
                                            <span>📋 {language === 'he' ? (
                                                job.jobType === 'full-time' ? 'משרה מלאה' : job.jobType === 'part-time' ? 'משרה חלקית' : 'פרילאנס'
                                            ) : job.jobType}</span>
                                            <span className="text-blue-600">👤 {job.creatorName}</span>
                                            <span>📅 {new Date(job.createdAt).toLocaleDateString()}</span>
                                            {job.expirationDate && (
                                                <span className="text-amber-600">
                                                    ⏰ {language === 'he' ? 'תוקף:' : 'Expires:'} {new Date(job.expirationDate).toLocaleDateString()} {new Date(job.expirationDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0 justify-end">
                                        <button
                                            onClick={() => onViewApplications?.(job)}
                                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer bg-white border-none"
                                            title={language === 'he' ? 'צפייה במועמדים' : 'View Applications'}
                                        >
                                            <Users size={16} />
                                        </button>
                                        <button
                                            onClick={() => toggleJobStatus(job)}
                                            className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer bg-white border-none"
                                            title={job.status === 'open' ? (language === 'he' ? 'סגירת משרה' : 'Close Job') : (language === 'he' ? 'פתיחת משרה' : 'Reopen Job')}
                                        >
                                            {job.status === 'open' ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                        <button
                                            onClick={() => openEditForm(job)}
                                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer bg-white border-none"
                                            title={language === 'he' ? 'עריכה' : 'Edit'}
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => deleteJob(job)}
                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer bg-white border-none"
                                            title={language === 'he' ? 'מחיקה' : 'Delete'}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {jobs.length === 0 && (
                        <div className="text-center py-12 text-slate-400">
                            <p>{language === 'he' ? 'אין משרות עדיין. צור את משרתך הראשונה!' : 'No jobs yet. Create your first job posting!'}</p>
                        </div>
                    )}
                </div>
            )}

            {/* ============================================================
                VIEW: TEMPLATES LIST
                ============================================================ */}
            {viewMode === 'templates' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {templates.map((tpl) => (
                        <div key={tpl.id} className="bg-white rounded-xl border border-slate-100 p-5 hover:shadow-sm transition-shadow flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-bold text-slate-900 truncate">{tpl.title}</h4>
                                    <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">
                                        {language === 'he' ? 'תבנית משרה' : 'Job Template'}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-500 line-clamp-3 mb-4">{tpl.description || (language === 'he' ? 'אין תיאור לתבנית זו.' : 'No description provided.')}</p>
                                <div className="flex items-center gap-3 text-xs text-slate-400 mb-4">
                                    <span>❓ {tpl.questions?.length || 0} {language === 'he' ? 'שאלות מועמד' : 'questions'}</span>
                                    <span>👤 {tpl.creatorName || (language === 'he' ? 'מערכת' : 'System')}</span>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100/60">
                                <button
                                    onClick={() => openEditTemplateForm(tpl)}
                                    className="px-3 py-1.5 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-xs font-semibold flex items-center gap-1 cursor-pointer bg-white"
                                >
                                    <Edit2 size={12} />
                                    {language === 'he' ? 'ערוך תבנית' : 'Edit'}
                                </button>
                                <button
                                    onClick={() => deleteTemplate(tpl)}
                                    className="px-3 py-1.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-xs font-semibold flex items-center gap-1 cursor-pointer bg-white"
                                >
                                    <Trash2 size={12} />
                                    {language === 'he' ? 'מחק תבנית' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    ))}
                    {templates.length === 0 && (
                        <div className="text-center col-span-full py-12 text-slate-400 bg-white rounded-xl border border-slate-100">
                            <p>{language === 'he' ? 'אין תבניות משרה עדיין. צור את התבנית הראשונה!' : 'No templates yet. Create your first job template!'}</p>
                        </div>
                    )}
                </div>
            )}

            {/* Create/Edit Job Modal */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
                        onClick={() => setShowForm(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl my-8 flex flex-col max-h-[90vh]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0">
                                <h3 className="text-lg font-bold text-slate-900">
                                    {editingJob ? t('edit_job') : t('create_new_job')}
                                </h3>
                                <button onClick={() => setShowForm(false)} className="p-1 text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-6 space-y-4 overflow-y-auto flex-1">
                                {/* Template Picker - only show when creating a new job */}
                                {!editingJob && templates.length > 0 && (
                                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/50">
                                        <label className="block text-xs font-bold text-blue-700 uppercase mb-1.5">
                                            {language === 'he' ? 'החל תבנית מוכנה למשרה' : 'Apply Job Template'}
                                        </label>
                                        <select
                                            onChange={handleApplyTemplate}
                                            className="w-full px-3 py-2 rounded-lg border border-blue-200 focus:border-blue-500 outline-none text-sm cursor-pointer bg-white"
                                        >
                                            <option value="">-- {language === 'he' ? 'בחרו תבנית משרה (אופציונלי)' : 'Select template (optional)'} --</option>
                                            {templates.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                                        </select>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('title_label')}</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder={language === 'he' ? 'למשל: מאלף/מדריך כלבים' : 'e.g., Therapy Dog Handler'}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('desc_label')}</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder={language === 'he' ? 'תארו את המשרה, דרישות ותחומי אחריות...' : 'Describe the position, requirements, and responsibilities...'}
                                        rows={4}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none text-sm bg-white"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">{language === 'he' ? 'מיקום' : 'Location'}</label>
                                        <input
                                            type="text"
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                            placeholder={language === 'he' ? 'למשל: תל אביב' : 'e.g., Tel Aviv'}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">{language === 'he' ? 'סוג משרה' : 'Job Type'}</label>
                                        <select
                                            value={formData.jobType}
                                            onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm cursor-pointer bg-white"
                                        >
                                            <option value="full-time">{language === 'he' ? 'משרה מלאה' : 'Full-time'}</option>
                                            <option value="part-time">{language === 'he' ? 'משרה חלקית' : 'Part-time'}</option>
                                            <option value="contract">{language === 'he' ? 'פרילאנס / חוזה' : 'Contract'}</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">{language === 'he' ? 'נראות' : 'Visibility'}</label>
                                        <select
                                            value={formData.isVisible ? 'true' : 'false'}
                                            onChange={(e) => setFormData({ ...formData, isVisible: e.target.value === 'true' })}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm cursor-pointer bg-white"
                                        >
                                            <option value="true">{language === 'he' ? 'גלויה לציבור' : 'Visible'}</option>
                                            <option value="false">{language === 'he' ? 'מוסתרת' : 'Hidden'}</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">{language === 'he' ? 'מדיניות עריכה' : 'Edit Policy'}</label>
                                        <select
                                            value={formData.editPolicy}
                                            onChange={(e) => setFormData({ ...formData, editPolicy: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm cursor-pointer bg-white"
                                        >
                                            <option value="owner_only">{language === 'he' ? 'רק מפרסם המשרה ומנהלי מערכת' : 'Only Me / Admins'}</option>
                                            <option value="all_recruiters">{language === 'he' ? 'כל המגייסים' : 'All Recruiters'}</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Expiration Date support */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        {language === 'he' ? 'תאריך פקיעת משרה (אופציונלי)' : 'Job Expiration Date (optional)'}
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={formData.expirationDate || ''}
                                        onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm bg-white"
                                    />
                                </div>

                                {/* Candidate Questions Editor */}
                                <div className="pt-4 border-t border-slate-100">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-sm font-bold text-slate-800">{t('candidate_questions_title')}</h4>
                                        <button
                                            type="button"
                                            onClick={handleAddQuestion}
                                            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer bg-transparent border-none"
                                        >
                                            <Plus size={12} /> {t('add_question')}
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {formData.questions.map((q, idx) => {
                                            const eligibleParents = formData.questions.slice(0, idx).filter(p => p.type === 'list' || p.type === 'checkbox');
                                            return (
                                                <div key={idx} className="bg-slate-50 p-3 rounded-xl space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="text"
                                                            placeholder={t('question_text_label')}
                                                            value={q.text}
                                                            onChange={(e) => handleUpdateQuestion(idx, 'text', e.target.value)}
                                                            className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveQuestion(idx)}
                                                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0 cursor-pointer bg-transparent border-none"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-xs flex-wrap">
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-slate-500">{t('question_type')}:</span>
                                                            <select
                                                                value={q.type}
                                                                onChange={(e) => handleUpdateQuestion(idx, 'type', e.target.value)}
                                                                className="bg-white border border-slate-200 rounded px-1.5 py-0.5 cursor-pointer focus:outline-none"
                                                            >
                                                                <option value="text">{t('text_question_type')}</option>
                                                                <option value="list">{t('list_type')}</option>
                                                                <option value="checkbox">{t('checkbox_question_type')}</option>
                                                            </select>
                                                        </div>
                                                        <label className="flex items-center gap-1.5 text-slate-600 cursor-pointer select-none">
                                                            <input
                                                                type="checkbox"
                                                                checked={q.required}
                                                                onChange={(e) => handleUpdateQuestion(idx, 'required', e.target.checked)}
                                                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-200 cursor-pointer"
                                                            />
                                                            <span>{t('question_required')}</span>
                                                        </label>
                                                    </div>

                                                    {/* Dropdown Options List Editor */}
                                                    {q.type === 'list' && (
                                                        <div className="w-full mt-2 pl-4 border-l-2 border-blue-200 space-y-2">
                                                            <div className="text-slate-500 font-semibold">{language === 'he' ? 'ערכים (אפשרויות):' : 'Options:'}</div>
                                                            <div className="space-y-1.5">
                                                                {(q.options || []).map((opt, oIdx) => (
                                                                    <div key={oIdx} className="flex items-center gap-2">
                                                                        <input
                                                                            type="text"
                                                                            placeholder={`${language === 'he' ? 'ערך' : 'Value'} ${oIdx + 1}`}
                                                                            value={opt}
                                                                            onChange={(e) => handleUpdateQuestionOption(idx, oIdx, e.target.value)}
                                                                            className="flex-1 px-3 py-1 text-xs bg-white border border-slate-200 rounded focus:outline-none focus:border-blue-500"
                                                                        />
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleRemoveQuestionOption(idx, oIdx)}
                                                                            className="p-1 text-red-500 hover:bg-red-50 rounded cursor-pointer bg-transparent border-none"
                                                                        >
                                                                            <Trash2 size={12} />
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleAddQuestionOption(idx)}
                                                                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-1 cursor-pointer bg-transparent border-none"
                                                                >
                                                                    <Plus size={12} />
                                                                    {language === 'he' ? 'הוסף ערך' : 'Add Value'}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Dependencies Configuration */}
                                                    {eligibleParents.length > 0 && (
                                                        <div className="border-t border-slate-200/60 pt-2 mt-2 text-xs space-y-2">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <span className="text-slate-500">{language === 'he' ? 'תלוי בשאלה:' : 'Depends on question:'}</span>
                                                                <select
                                                                    value={q.dependsOn?.parentId || ''}
                                                                    onChange={(e) => handleUpdateQuestion(idx, 'parentId', e.target.value)}
                                                                    className="bg-white border border-slate-200 rounded px-2 py-1 cursor-pointer focus:outline-none text-[11px]"
                                                                >
                                                                    <option value="">-- {language === 'he' ? 'ללא (תמיד מוצג)' : 'None (always shown)'} --</option>
                                                                    {eligibleParents.map((p) => (
                                                                        <option key={p.id} value={p.id}>
                                                                            {p.text || `${language === 'he' ? 'שאלה' : 'Question'} ${formData.questions.indexOf(p) + 1}`}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </div>

                                                            {q.dependsOn?.parentId && (() => {
                                                                const parent = eligibleParents.find(p => p.id === q.dependsOn.parentId);
                                                                if (!parent) return null;

                                                                if (parent.type === 'checkbox') {
                                                                    const triggerVal = q.dependsOn.triggerValues?.[0];
                                                                    const selectedVal = (triggerVal === true || triggerVal === 'true') ? 'true' : 'false';
                                                                    return (
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-slate-500">{language === 'he' ? 'יוצג כאשר התשובה היא:' : 'Show when answer is:'}</span>
                                                                            <select
                                                                                value={selectedVal}
                                                                                onChange={(e) => handleUpdateQuestion(idx, 'triggerValues', [e.target.value === 'true'])}
                                                                                className="bg-white border border-slate-200 rounded px-2 py-0.5 cursor-pointer focus:outline-none text-[11px]"
                                                                            >
                                                                                <option value="true">{language === 'he' ? 'מסומן (כן)' : 'Checked (Yes)'}</option>
                                                                                <option value="false">{language === 'he' ? 'לא מסומן (לא)' : 'Unchecked (No)'}</option>
                                                                            </select>
                                                                        </div>
                                                                    );
                                                                }

                                                                if (parent.type === 'list') {
                                                                    const triggerVals = q.dependsOn.triggerValues || [];
                                                                    return (
                                                                        <div className="space-y-1 pl-2 border-l-2 border-blue-200">
                                                                            <span className="text-slate-500 font-medium block">
                                                                                {language === 'he' ? 'יוצג כאשר נבחרה אחת האפשרויות:' : 'Show when one of these options is selected:'}
                                                                            </span>
                                                                            <div className="flex flex-wrap gap-2 mt-1">
                                                                                {(parent.options || []).map((opt, oIdx) => {
                                                                                    if (!opt) return null;
                                                                                    const isChecked = triggerVals.includes(opt);
                                                                                    return (
                                                                                        <label key={oIdx} className="flex items-center gap-1.5 bg-white border border-slate-200 px-2 py-1 rounded text-[11px] cursor-pointer select-none">
                                                                                            <input
                                                                                                type="checkbox"
                                                                                                checked={isChecked}
                                                                                                onChange={(e) => {
                                                                                                    const nextTrigger = e.target.checked
                                                                                                        ? [...triggerVals, opt]
                                                                                                        : triggerVals.filter(v => v !== opt);
                                                                                                    handleUpdateQuestion(idx, 'triggerValues', nextTrigger);
                                                                                                }}
                                                                                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-200"
                                                                                            />
                                                                                            <span>{opt}</span>
                                                                                        </label>
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                }
                                                                return null;
                                                            })()}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {editingJob && authContext?.isAdmin && (
                                    <div className="pt-2 border-t border-slate-100">
                                        <label className="block text-sm font-bold text-amber-600 mb-1">{language === 'he' ? 'העברת בעלות (מנהל בלבד)' : 'Transfer Ownership (Admin Only)'}</label>
                                        <input
                                            type="text"
                                            value={formData.newOwnerId}
                                            onChange={(e) => setFormData({ ...formData, newOwnerId: e.target.value })}
                                            placeholder={language === 'he' ? 'הזן מזהה משתמש חדש' : 'Enter New Owner User ID'}
                                            className="w-full px-4 py-2 rounded-xl border border-amber-200 bg-amber-50 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all text-sm"
                                        />
                                        <p className="text-[10px] text-amber-600 mt-1">{language === 'he' ? 'ניתן להשיג את מזהה המשתמש מתוך כרטיסיית משתמשים. השאר ריק כדי לשמור על הבעלים הנוכחי.' : 'Get the User ID from the Users tab. Leave blank to keep current owner.'}</p>
                                    </div>
                                )}

                                {error && <p className="text-red-500 text-sm font-semibold">{error}</p>}
                            </div>

                            <div className="flex gap-3 p-6 pt-0 shrink-0 border-t border-slate-50 mt-auto bg-white">
                                <button
                                    onClick={() => setShowForm(false)}
                                    className="flex-1 py-3 border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors cursor-pointer bg-white"
                                >
                                    {t('cancel')}
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={saving}
                                    className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer border-none"
                                >
                                    {saving ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Save size={16} />
                                            {editingJob ? t('save_changes') : t('create_job_btn')}
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Create/Edit Template Modal */}
            <AnimatePresence>
                {showTemplateForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
                        onClick={() => setShowTemplateForm(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl my-8 flex flex-col max-h-[90vh]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0">
                                <h3 className="text-lg font-bold text-slate-900">
                                    {editingTemplate 
                                        ? (language === 'he' ? 'עריכת תבנית משרה' : 'Edit Job Template') 
                                        : (language === 'he' ? 'יצירת תבנית משרה חדשה' : 'Create New Job Template')
                                    }
                                </h3>
                                <button onClick={() => setShowTemplateForm(false)} className="p-1 text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-6 space-y-4 overflow-y-auto flex-1">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        {language === 'he' ? 'שם התבנית *' : 'Template Title *'}
                                    </label>
                                    <input
                                        type="text"
                                        value={templateData.title}
                                        onChange={(e) => setTemplateData({ ...templateData, title: e.target.value })}
                                        placeholder={language === 'he' ? 'למשל: תבנית למאלף כלבים' : 'e.g., Therapy Dog Template'}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        {language === 'he' ? 'תיאור משרה ברירת מחדל' : 'Default Job Description'}
                                    </label>
                                    <textarea
                                        value={templateData.description}
                                        onChange={(e) => setTemplateData({ ...templateData, description: e.target.value })}
                                        placeholder={language === 'he' ? 'תארו את המשרה או השאירו הוראות כלליות לתבנית...' : 'Describe the position or leave template instructions...'}
                                        rows={4}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all resize-none text-sm bg-white"
                                    />
                                </div>

                                {/* Template Questions configurations */}
                                <div className="pt-4 border-t border-slate-100">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-sm font-bold text-slate-800">{t('candidate_questions_title')}</h4>
                                        <button
                                            type="button"
                                            onClick={handleAddTplQuestion}
                                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer bg-transparent border-none"
                                        >
                                            <Plus size={12} /> {t('add_question')}
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {templateData.questions.map((q, idx) => {
                                            const eligibleParents = templateData.questions.slice(0, idx).filter(p => p.type === 'list' || p.type === 'checkbox');
                                            return (
                                                <div key={idx} className="bg-slate-50 p-3 rounded-xl space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="text"
                                                            placeholder={t('question_text_label')}
                                                            value={q.text}
                                                            onChange={(e) => handleUpdateTplQuestion(idx, 'text', e.target.value)}
                                                            className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveTplQuestion(idx)}
                                                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0 cursor-pointer bg-transparent border-none"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-xs flex-wrap">
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-slate-500">{t('question_type')}:</span>
                                                            <select
                                                                value={q.type}
                                                                onChange={(e) => handleUpdateTplQuestion(idx, 'type', e.target.value)}
                                                                className="bg-white border border-slate-200 rounded px-1.5 py-0.5 cursor-pointer focus:outline-none"
                                                            >
                                                                <option value="text">{t('text_question_type')}</option>
                                                                <option value="list">{t('list_type')}</option>
                                                                <option value="checkbox">{t('checkbox_question_type')}</option>
                                                            </select>
                                                        </div>
                                                        <label className="flex items-center gap-1.5 text-slate-600 cursor-pointer select-none">
                                                            <input
                                                                type="checkbox"
                                                                checked={q.required}
                                                                onChange={(e) => handleUpdateTplQuestion(idx, 'required', e.target.checked)}
                                                                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-200 cursor-pointer"
                                                            />
                                                            <span>{t('question_required')}</span>
                                                        </label>
                                                    </div>

                                                    {/* Dropdown Options List Editor for Templates */}
                                                    {q.type === 'list' && (
                                                         <div className="w-full mt-2 pl-4 border-l-2 border-indigo-200 space-y-2">
                                                             <div className="text-slate-500 font-semibold">{language === 'he' ? 'ערכים (אפשרויות):' : 'Options:'}</div>
                                                             <div className="space-y-1.5">
                                                                 {(q.options || []).map((opt, oIdx) => (
                                                                     <div key={oIdx} className="flex items-center gap-2">
                                                                         <input
                                                                             type="text"
                                                                             placeholder={`${language === 'he' ? 'ערך' : 'Value'} ${oIdx + 1}`}
                                                                             value={opt}
                                                                             onChange={(e) => handleUpdateTplQuestionOption(idx, oIdx, e.target.value)}
                                                                             className="flex-1 px-3 py-1 text-xs bg-white border border-slate-200 rounded focus:outline-none focus:border-indigo-500"
                                                                         />
                                                                         <button
                                                                             type="button"
                                                                             onClick={() => handleRemoveTplQuestionOption(idx, oIdx)}
                                                                             className="p-1 text-red-500 hover:bg-red-50 rounded cursor-pointer bg-transparent border-none"
                                                                         >
                                                                             <Trash2 size={12} />
                                                                         </button>
                                                                     </div>
                                                                 ))}
                                                                 <button
                                                                     type="button"
                                                                     onClick={() => handleAddTplQuestionOption(idx)}
                                                                     className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mt-1 cursor-pointer bg-transparent border-none"
                                                                 >
                                                                     <Plus size={12} />
                                                                     {language === 'he' ? 'הוסף ערך' : 'Add Value'}
                                                                 </button>
                                                             </div>
                                                         </div>
                                                    )}

                                                    {/* Dependencies Configuration for Templates */}
                                                    {eligibleParents.length > 0 && (
                                                        <div className="border-t border-slate-200/60 pt-2 mt-2 text-xs space-y-2">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <span className="text-slate-500">{language === 'he' ? 'תלוי בשאלה:' : 'Depends on question:'}</span>
                                                                <select
                                                                    value={q.dependsOn?.parentId || ''}
                                                                    onChange={(e) => handleUpdateTplQuestion(idx, 'parentId', e.target.value)}
                                                                    className="bg-white border border-slate-200 rounded px-2 py-1 cursor-pointer focus:outline-none text-[11px]"
                                                                >
                                                                    <option value="">-- {language === 'he' ? 'ללא (תמיד מוצג)' : 'None (always shown)'} --</option>
                                                                    {eligibleParents.map((p) => (
                                                                        <option key={p.id} value={p.id}>
                                                                            {p.text || `${language === 'he' ? 'שאלה' : 'Question'} ${templateData.questions.indexOf(p) + 1}`}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </div>

                                                            {q.dependsOn?.parentId && (() => {
                                                                const parent = eligibleParents.find(p => p.id === q.dependsOn.parentId);
                                                                if (!parent) return null;

                                                                if (parent.type === 'checkbox') {
                                                                    const triggerVal = q.dependsOn.triggerValues?.[0];
                                                                    const selectedVal = (triggerVal === true || triggerVal === 'true') ? 'true' : 'false';
                                                                    return (
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-slate-500">{language === 'he' ? 'יוצג כאשר התשובה היא:' : 'Show when answer is:'}</span>
                                                                            <select
                                                                                value={selectedVal}
                                                                                onChange={(e) => handleUpdateTplQuestion(idx, 'triggerValues', [e.target.value === 'true'])}
                                                                                className="bg-white border border-slate-200 rounded px-2 py-0.5 cursor-pointer focus:outline-none text-[11px]"
                                                                            >
                                                                                <option value="true">{language === 'he' ? 'מסומן (כן)' : 'Checked (Yes)'}</option>
                                                                                <option value="false">{language === 'he' ? 'לא מסומן (לא)' : 'Unchecked (No)'}</option>
                                                                            </select>
                                                                        </div>
                                                                    );
                                                                }

                                                                if (parent.type === 'list') {
                                                                    const triggerVals = q.dependsOn.triggerValues || [];
                                                                    return (
                                                                        <div className="space-y-1 pl-2 border-l-2 border-indigo-200">
                                                                            <span className="text-slate-500 font-medium block">
                                                                                {language === 'he' ? 'יוצג כאשר נבחרה אחת האפשרויות:' : 'Show when one of these options is selected:'}
                                                                            </span>
                                                                            <div className="flex flex-wrap gap-2 mt-1">
                                                                                {(parent.options || []).map((opt, oIdx) => {
                                                                                    if (!opt) return null;
                                                                                    const isChecked = triggerVals.includes(opt);
                                                                                    return (
                                                                                        <label key={oIdx} className="flex items-center gap-1.5 bg-white border border-slate-200 px-2 py-1 rounded text-[11px] cursor-pointer select-none">
                                                                                            <input
                                                                                                type="checkbox"
                                                                                                checked={isChecked}
                                                                                                onChange={(e) => {
                                                                                                    const nextTrigger = e.target.checked
                                                                                                        ? [...triggerVals, opt]
                                                                                                        : triggerVals.filter(v => v !== opt);
                                                                                                    handleUpdateTplQuestion(idx, 'triggerValues', nextTrigger);
                                                                                                }}
                                                                                                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-200"
                                                                                            />
                                                                                            <span>{opt}</span>
                                                                                        </label>
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                }
                                                                return null;
                                                            })()}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {error && <p className="text-red-500 text-sm font-semibold">{error}</p>}
                            </div>

                            <div className="flex gap-3 p-6 pt-0 shrink-0 border-t border-slate-50 mt-auto bg-white">
                                <button
                                    onClick={() => setShowTemplateForm(false)}
                                    className="flex-1 py-3 border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors cursor-pointer bg-white"
                                >
                                    {t('cancel')}
                                </button>
                                <button
                                    onClick={handleTemplateSubmit}
                                    disabled={saving}
                                    className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer border-none"
                                >
                                    {saving ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Save size={16} />
                                            {editingTemplate 
                                                ? (language === 'he' ? 'שמור שינויים' : 'Save Changes')
                                                : (language === 'he' ? 'צור תבנית' : 'Create Template')
                                            }
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
