/**
 * UserMenu — Authenticated user dropdown in the header
 * 
 * Shows user avatar + name when signed in.
 * Dropdown options: Profile, My Applications, Sign Out, Delete Account.
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, FileText, LogOut, ChevronDown, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export default function UserMenu() {
    const { user, isAdmin, logout } = useAuth();
    const { language } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    // Close menu on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!user) return null;

    const handleLogout = async () => {
        setIsOpen(false);
        await logout();
    };

    const navigate = (path) => {
        setIsOpen(false);
        window.history.pushState({}, '', path);
        window.dispatchEvent(new PopStateEvent('popstate'));
    };

    return (
        <div className="relative" ref={menuRef}>
            {/* Avatar Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 p-1.5 rounded-full hover:bg-white/10 transition-colors"
                aria-label="User menu"
            >
                {user.pictureUrl ? (
                    <img 
                        src={user.pictureUrl} 
                        alt={user.fullName} 
                        className="w-8 h-8 rounded-full border-2 border-white/30"
                        referrerPolicy="no-referrer"
                    />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
                        {user.fullName?.charAt(0)?.toUpperCase()}
                    </div>
                )}
                <ChevronDown size={14} className={`text-white/70 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className={`absolute ${language === 'he' ? 'left-0' : 'right-0'} mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50`}
                        style={{ direction: 'ltr' }}
                    >
                        {/* User Info Header */}
                        <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                {user.pictureUrl ? (
                                    <img 
                                        src={user.pictureUrl} 
                                        alt={user.fullName}
                                        className="w-10 h-10 rounded-full"
                                        referrerPolicy="no-referrer"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                                        {user.fullName?.charAt(0)?.toUpperCase()}
                                    </div>
                                )}
                                <div className="min-w-0">
                                    <div className="font-semibold text-slate-900 text-sm truncate">{user.fullName}</div>
                                    <div className="text-xs text-slate-500 truncate">{user.email}</div>
                                    {isAdmin && (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full mt-1">
                                            <Shield size={10} /> Admin
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Menu Items */}
                        <div className="py-1">
                            <button
                                onClick={() => navigate('/profile')}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                                <User size={16} className="text-slate-400" />
                                Profile
                            </button>

                            <button
                                onClick={() => navigate('/my-applications')}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                                <FileText size={16} className="text-slate-400" />
                                My Applications
                            </button>

                            {isAdmin && (
                                <button
                                    onClick={() => navigate('/admin')}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-amber-700 hover:bg-amber-50 transition-colors"
                                >
                                    <Shield size={16} className="text-amber-500" />
                                    Admin Dashboard
                                </button>
                            )}
                        </div>

                        <div className="border-t border-slate-100 py-1">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                                <LogOut size={16} className="text-slate-400" />
                                Sign Out
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
