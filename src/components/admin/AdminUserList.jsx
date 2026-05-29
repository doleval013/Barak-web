/**
 * AdminUserList — Admin view of all registered users
 * 
 * Paginated list with search, role badges.
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Shield, User, Mail, Phone, Calendar, RefreshCw, AlertCircle, CheckCircle, Ban, Briefcase } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminUserList() {
    const { authFetch } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });

    useEffect(() => {
        fetchUsers();
    }, [pagination.page]);

    const fetchUsers = async () => {
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
    };

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
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-bold text-slate-900">Users</h3>
                    <p className="text-sm text-slate-500">{pagination.total} registered users</p>
                </div>
                <button
                    onClick={fetchUsers}
                    className="p-2.5 text-slate-500 hover:text-slate-700 bg-white rounded-xl border border-slate-200 hover:shadow-sm transition-all"
                >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="mb-6">
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name or email..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm"
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
                            <div className="flex items-center gap-4">
                                {user.pictureUrl ? (
                                    <img src={user.pictureUrl} alt="" className="w-10 h-10 rounded-full" referrerPolicy="no-referrer" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm">
                                        {user.fullName?.charAt(0)?.toUpperCase()}
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-slate-900 truncate">{user.fullName}</span>
                                        {user.role === 'admin' && (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">
                                                <Shield size={10} /> Admin
                                            </span>
                                        )}
                                        {user.role === 'recruiter' && (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-full">
                                                <Briefcase size={10} /> Recruiter
                                            </span>
                                        )}
                                        {user.status === 'blocked' && (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full">
                                                <Ban size={10} /> Blocked
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-slate-500 mt-0.5">
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
                                <div className="flex items-center gap-3 shrink-0">
                                    <div className="flex flex-col gap-2">
                                        <select
                                            value={user.role}
                                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                            className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-700 focus:outline-none focus:border-blue-400"
                                        >
                                            <option value="user">User</option>
                                            <option value="recruiter">Recruiter</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                        <select
                                            value={user.status || 'active'}
                                            onChange={(e) => handleStatusChange(user.id, e.target.value)}
                                            className={`text-xs border rounded px-2 py-1 focus:outline-none focus:border-blue-400 ${user.status === 'blocked' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}
                                        >
                                            <option value="active">Active</option>
                                            <option value="blocked">Blocked</option>
                                        </select>
                                    </div>
                                    <div className="text-[10px] text-slate-400 text-right">
                                        <div>Joined:</div>
                                        <div>{new Date(user.createdAt).toLocaleDateString()}</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {users.length === 0 && (
                        <div className="text-center py-12 text-slate-400">
                            <User size={40} className="mx-auto mb-3 opacity-50" />
                            <p>No users found.</p>
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
                        Previous
                    </button>
                    <span className="text-sm text-slate-500">
                        Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <button
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                        disabled={pagination.page >= pagination.totalPages}
                        className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
