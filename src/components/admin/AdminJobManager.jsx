/**
 * AdminJobManager — Admin CRUD for job postings
 * 
 * Table view of all jobs with create/edit/delete functionality.
 * Includes application count per job.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Eye, EyeOff, Users, X, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const JOB_TYPES = ['full-time', 'part-time', 'contract'];
const JOB_STATUSES = ['open', 'closed'];

export default function AdminJobManager({ onViewApplications }) {
    const { authFetch } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingJob, setEditingJob] = useState(null);
    const [formData, setFormData] = useState({ 
        title: '', description: '', location: '', jobType: 'full-time', 
        isVisible: true, editPolicy: 'owner_only', newOwnerId: '' 
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => { fetchJobs(); }, []);

    const fetchJobs = async () => {
        try {
            // Fetch all jobs (including closed)
            const openRes = await authFetch('/api/jobs?status=all');
            const data = openRes.ok ? await openRes.json() : { jobs: [] };
            setJobs(data.jobs || []);
        } catch (err) {
            console.error('[AdminJobs] Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const openCreateForm = () => {
        setEditingJob(null);
        setFormData({ title: '', description: '', location: '', jobType: 'full-time', isVisible: true, editPolicy: 'owner_only', newOwnerId: '' });
        setShowForm(true);
        setError('');
    };

    const openEditForm = (job) => {
        setEditingJob(job);
        setFormData({
            title: job.title,
            description: job.description,
            location: job.location || '',
            jobType: job.jobType,
            isVisible: job.isVisible !== undefined ? job.isVisible : true,
            editPolicy: job.editPolicy || 'owner_only',
            newOwnerId: ''
        });
        setShowForm(true);
        setError('');
    };

    const handleSubmit = async () => {
        if (!formData.title || !formData.description) {
            setError('Title and description are required');
            return;
        }

        setSaving(true);
        setError('');

        try {
            const url = editingJob ? `/api/jobs/${editingJob.id}` : '/api/jobs';
            const method = editingJob ? 'PUT' : 'POST';

            const res = await authFetch(url, {
                method,
                body: JSON.stringify(formData),
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
        if (!confirm(`Delete "${job.title}"? This will also delete all applications.`)) return;
        try {
            await authFetch(`/api/jobs/${job.id}`, { method: 'DELETE' });
            fetchJobs();
        } catch (err) {
            console.error('[AdminJobs] Delete error:', err);
        }
    };

    if (loading) {
        return <div className="flex justify-center py-12"><div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>;
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-bold text-slate-900">Job Postings</h3>
                    <p className="text-sm text-slate-500">{jobs.length} total jobs</p>
                </div>
                <button
                    onClick={openCreateForm}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors text-sm"
                >
                    <Plus size={16} />
                    New Job
                </button>
            </div>

            {/* Job List */}
            <div className="space-y-3">
                {jobs.map((job) => (
                    <div key={job.id} className="bg-white rounded-xl border border-slate-100 p-4 hover:shadow-sm transition-shadow">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-semibold text-slate-900 truncate">{job.title}</h4>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                        job.status === 'open' ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'
                                    }`}>
                                        {job.status}
                                    </span>
                                    {!job.isVisible && (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-50 text-amber-700">
                                            Hidden
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-slate-500 truncate">{job.description}</p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                                    {job.location && <span>📍 {job.location}</span>}
                                    <span>📋 {job.jobType}</span>
                                    <span className="text-blue-600">👤 {job.creatorName}</span>
                                    <span>📅 {new Date(job.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                                <button
                                    onClick={() => onViewApplications?.(job)}
                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="View Applications"
                                >
                                    <Users size={16} />
                                </button>
                                <button
                                    onClick={() => toggleJobStatus(job)}
                                    className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                    title={job.status === 'open' ? 'Close Job' : 'Reopen Job'}
                                >
                                    {job.status === 'open' ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                                <button
                                    onClick={() => openEditForm(job)}
                                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                                    title="Edit"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={() => deleteJob(job)}
                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                {jobs.length === 0 && (
                    <div className="text-center py-12 text-slate-400">
                        <p>No jobs yet. Create your first job posting!</p>
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowForm(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl w-full max-w-lg shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between p-6 border-b border-slate-100">
                                <h3 className="text-lg font-bold text-slate-900">
                                    {editingJob ? 'Edit Job' : 'Create New Job'}
                                </h3>
                                <button onClick={() => setShowForm(false)} className="p-1 text-slate-400 hover:text-slate-600">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="e.g., Therapy Dog Handler"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Description *</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Describe the position, requirements, and responsibilities..."
                                        rows={5}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                                        <input
                                            type="text"
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                            placeholder="e.g., Tel Aviv"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Job Type</label>
                                        <select
                                            value={formData.jobType}
                                            onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                        >
                                            {JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Visibility</label>
                                        <select
                                            value={formData.isVisible ? 'true' : 'false'}
                                            onChange={(e) => setFormData({ ...formData, isVisible: e.target.value === 'true' })}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                        >
                                            <option value="true">Visible</option>
                                            <option value="false">Hidden</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Edit Policy</label>
                                        <select
                                            value={formData.editPolicy}
                                            onChange={(e) => setFormData({ ...formData, editPolicy: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                        >
                                            <option value="owner_only">Only Me / Admins</option>
                                            <option value="all_recruiters">All Recruiters</option>
                                        </select>
                                    </div>
                                </div>

                                {editingJob && authContext?.isAdmin && (
                                    <div className="pt-2 border-t border-slate-100">
                                        <label className="block text-sm font-bold text-amber-600 mb-1">Transfer Ownership (Admin Only)</label>
                                        <input
                                            type="text"
                                            value={formData.newOwnerId}
                                            onChange={(e) => setFormData({ ...formData, newOwnerId: e.target.value })}
                                            placeholder="Enter New Owner User ID"
                                            className="w-full px-4 py-2 rounded-xl border border-amber-200 bg-amber-50 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all"
                                        />
                                        <p className="text-[10px] text-amber-600 mt-1">Get the User ID from the Users tab. Leave blank to keep current owner.</p>
                                    </div>
                                )}

                                {error && <p className="text-red-500 text-sm">{error}</p>}
                            </div>

                            <div className="flex gap-3 p-6 pt-0">
                                <button
                                    onClick={() => setShowForm(false)}
                                    className="flex-1 py-3 border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={saving}
                                    className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {saving ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Save size={16} />
                                            {editingJob ? 'Save Changes' : 'Create Job'}
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
