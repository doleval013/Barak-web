/**
 * AdminUserList — Admin view of all registered users
 * 
 * Paginated list with search, role badges.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Shield, User, Mail, Phone, Calendar, RefreshCw, AlertCircle, CheckCircle, Ban, Briefcase } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export default function AdminUserList() {
    const { authFetch } = useAuth();
    const { t, language } = useLanguage();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
            const res = await authFetch(`/api/users?page=${pagination.page}&limit=20${searchParam}`);
            if (res.ok) {
                const data = await res.json();
                setUsers(data.users || []);
                setPagination(prev => ({ ...prev, ...data.pagination }));
            }
        } catch (err) {
            console.error('[AdminUsers] Error:', err);
        } finally {
            setLoading(false);
        }
    }, [pagination.page, search, authFetch]);

    useEffect(() => {
        setTimeout(() => {
            fetchUsers();
        }, 0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagination.page]);

    const handleRoleChange = async (userId, newRole) => {
        try {
            const res = await authFetch(`/api/users/${userId}/role`, {
                method: 'PATCH',
                body: JSON.stringify({ role: newRole })
            });
            if (res.ok) {
                setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to update role');
            }
        } catch (err) {
            console.error(err);
            alert('Failed to update role');
        }
    };

    const handleStatusChange = async (userId, newStatus) => {
        try {
            const res = await authFetch(`/api/users/${userId}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to update status');
            }
        } catch (err) {
            console.error(err);
            alert('Failed to update status');
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchUsers();
    };

    return (
        <div dir={language === 'he' ? 'rtl' : 'ltr'}>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-bold text-slate-900">{t('users')}</h3>
                    <p className="text-sm text-slate-500">{pagination.total} {t('page_title_users').toLowerCase()}</p>
                </div>
                <button
                    onClick={fetchUsers}
                    className="p-2.5 text-slate-500 hover:text-slate-700 bg-white rounded-xl border border-slate-200 hover:shadow-sm transition-all"
                >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* User Roles Guidelines */}
            <div className="mb-6 p-5 bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-2xl border border-blue-100/60 shadow-sm">
                <h4 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
                    <Shield size={16} className="text-blue-600" />
                    {t('role_guidelines_title')}
                </h4>
                <p className="text-xs text-slate-500 mb-4">{t('role_guidelines_sub')}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)]">
                        <div className="font-bold text-amber-600 mb-1 flex items-center gap-1">
                            <Shield size={12} /> {t('admin_role_label')}
                        </div>
                        <p className="text-slate-600 leading-relaxed">{t('role_admin_desc')}</p>
                    </div>
                    <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)]">
                        <div className="font-bold text-indigo-600 mb-1 flex items-center gap-1">
                            <Briefcase size={12} /> {t('recruiter_role_label')}
                        </div>
                        <p className="text-slate-600 leading-relaxed">{t('role_recruiter_desc')}</p>
                    </div>
                    <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)]">
                        <div className="font-bold text-slate-600 mb-1 flex items-center gap-1">
                            <User size={12} /> {t('user_role_label')}
                        </div>
                        <p className="text-slate-600 leading-relaxed">{t('role_user_desc')}</p>
                    </div>
                </div>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="mb-6">
                <div className="relative">
                    <Search size={16} className={`absolute ${language === 'he' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-slate-400`} />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={t('search_placeholder_users')}
                        className={`w-full ${language === 'he' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm`}
                    />
                </div>
            </form>

            {/* User List */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                </div>
            ) : (
                <div className="space-y-2">
                    {users.map((user, i) => (
                        <motion.div
                            key={user.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className="bg-white rounded-xl border border-slate-100 p-4 hover:shadow-sm transition-shadow"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-4 min-w-0">
                                    {user.pictureUrl ? (
                                        <img src={user.pictureUrl} alt="" className="w-10 h-10 rounded-full shrink-0" referrerPolicy="no-referrer" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm shrink-0">
                                            {user.fullName?.charAt(0)?.toUpperCase()}
                                        </div>
                                    )}
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-semibold text-slate-900 truncate">{user.fullName}</span>
                                            {user.role === 'admin' && (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">
                                                    <Shield size={10} /> {t('admin_role_label')}
                                                </span>
                                            )}
                                            {user.role === 'recruiter' && (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-full">
                                                    <Briefcase size={10} /> {t('recruiter_role_label')}
                                                </span>
                                            )}
                                            {user.status === 'blocked' && (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full">
                                                    <Ban size={10} /> {t('blocked_role_label')}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                                            <span className="flex items-center gap-1">
                                                <Mail size={12} />
                                                {user.email}
                                            </span>
                                            {user.phone && (
                                                <span className="flex items-center gap-1">
                                                    <Phone size={12} />
                                                    {user.phone}
                                                </span>
                                            )}
                                            {user.age && (
                                                <span className="flex items-center gap-1">
                                                    <Calendar size={12} />
                                                    {user.age}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className={`flex items-center gap-4 shrink-0 justify-between sm:justify-end ${language === 'he' ? 'text-right' : 'text-left'}`}>
                                    <div className="flex flex-col gap-2">
                                        <select
                                            value={user.role}
                                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                            className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-700 focus:outline-none focus:border-blue-400 cursor-pointer"
                                        >
                                            <option value="user">{t('user_role_label')}</option>
                                            <option value="recruiter">{t('recruiter_role_label')}</option>
                                            <option value="admin">{t('admin_role_label')}</option>
                                        </select>
                                        <select
                                            value={user.status || 'active'}
                                            onChange={(e) => handleStatusChange(user.id, e.target.value)}
                                            className={`text-xs border rounded px-2 py-1 focus:outline-none focus:border-blue-400 cursor-pointer ${user.status === 'blocked' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}
                                        >
                                            <option value="active">{t('active_status')}</option>
                                            <option value="blocked">{t('blocked_status')}</option>
                                        </select>
                                    </div>
                                    <div className="text-[10px] text-slate-400">
                                        <div>{t('joined_date')}</div>
                                        <div>{new Date(user.createdAt).toLocaleDateString()}</div>
                                        <div className="mt-1 font-mono text-[9px] text-slate-300">ID: {user.id}</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {users.length === 0 && (
                        <div className="text-center py-12 text-slate-400">
                            <User size={40} className="mx-auto mb-3 opacity-50" />
                            <p>{t('no_users_found')}</p>
                        </div>
                    )}
                </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                    <button
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                        disabled={pagination.page <= 1}
                        className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {t('previous')}
                    </button>
                    <span className="text-sm text-slate-500">
                        {language === 'he' ? `${t('users')} ${pagination.page} ${t('page_of')} ${pagination.totalPages}` : `Page ${pagination.page} of ${pagination.totalPages}`}
                    </span>
                    <button
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                        disabled={pagination.page >= pagination.totalPages}
                        className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {t('next')}
                    </button>
                </div>
            )}
        </div>
    );
}
