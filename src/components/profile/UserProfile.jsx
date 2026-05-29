/**
 * UserProfile — Profile management page
 * 
 * Shows Google-sourced info (name, email, picture).
 * Allows editing optional fields: phone, age.
 * Upload/replace CV.
 * Access application history.
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, User, Mail, Phone, Calendar, FileText, Upload, Save, Check, AlertCircle, AlertTriangle, Trash2, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export default function UserProfile() {
    const { user, isLoading, updateProfile, uploadCV, deleteCV, deleteAccount } = useAuth();
    const { language } = useLanguage();
    const isHebrew = language === 'he';
    const fileInputRef = useRef(null);

    const [fullName, setFullName] = useState(user?.fullName || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [age, setAge] = useState(user?.age || '');
    const [saving, setSaving] = useState(false);
    const [uploadingCV, setUploadingCV] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [deletingCV, setDeletingCV] = useState(false);

    // Redirect to home if not logged in
    useEffect(() => {
        if (!isLoading && !user) {
            window.history.pushState({}, '', '/');
            window.dispatchEvent(new PopStateEvent('popstate'));
        }
    }, [user, isLoading]);

    const navigateBack = () => {
        window.history.pushState({}, '', '/');
        window.dispatchEvent(new PopStateEvent('popstate'));
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');
        setSaved(false);

        try {
            await updateProfile({ fullName: fullName || null, phone: phone || null, age: age || null });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleCVUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingCV(true);
        setError('');

        try {
            await uploadCV(file);
        } catch (err) {
            setError(err.message);
        } finally {
            setUploadingCV(false);
        }
    };

    const handleDeleteCV = async () => {
        if (isHebrew) {
            if (!window.confirm('האם אתה בטוח שברצונך למחוק את קורות החיים?')) return;
        } else {
            if (!window.confirm('Are you sure you want to delete your CV?')) return;
        }

        setDeletingCV(true);
        setError('');
        try {
            await deleteCV();
        } catch (err) {
            setError(err.message);
        } finally {
            setDeletingCV(false);
        }
    };

    const handleDeleteAccount = async () => {
        setDeleting(true);
        setError('');
        try {
            await deleteAccount();
            window.history.pushState({}, '', '/');
            window.dispatchEvent(new PopStateEvent('popstate'));
        } catch (err) {
            setError(err.message);
            setDeleting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white" dir={isHebrew ? 'rtl' : 'ltr'}>
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white">
                <div className="max-w-3xl mx-auto px-4 py-10">
                    <button
                        onClick={navigateBack}
                        className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-6 text-sm"
                    >
                        <ArrowLeft size={16} />
                        {isHebrew ? 'חזרה' : 'Back'}
                    </button>

                    <div className="flex items-center gap-4">
                        {user.pictureUrl ? (
                            <img 
                                src={user.pictureUrl} 
                                alt={user.fullName}
                                className="w-16 h-16 rounded-full border-3 border-white/30"
                                referrerPolicy="no-referrer"
                            />
                        ) : (
                            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
                                {user.fullName?.charAt(0)}
                            </div>
                        )}
                        <div>
                            <h1 className="text-2xl font-bold">{user.fullName}</h1>
                            <p className="text-blue-200 text-sm">{user.email}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Profile Form */}
            <div className="max-w-3xl mx-auto px-4 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
                >
                    {/* Google Info (read-only) */}
                    <div className="p-6 border-b border-slate-100">
                        <h2 className="text-lg font-bold text-slate-900 mb-4">
                            {isHebrew ? 'פרטים מ-Google' : 'Google Account Info'}
                        </h2>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <Mail size={18} className="text-slate-400 shrink-0" />
                                <div>
                                    <div className="text-xs text-slate-500">{isHebrew ? 'אימייל' : 'Email'}</div>
                                    <div className="font-medium text-slate-900">{user.email}</div>
                                </div>
                            </div>
                        </div>
                        <p className="text-xs text-slate-400 mt-3">
                            {isHebrew 
                                ? 'האימייל מנוהל ומאומת דרך חשבון Google שלך.'
                                : 'Email is managed and verified by your Google account.'}
                        </p>
                    </div>

                    {/* Editable Fields */}
                    <div className="p-6 border-b border-slate-100">
                        <h2 className="text-lg font-bold text-slate-900 mb-4">
                            {isHebrew ? 'פרטי פרופיל' : 'Profile Info'}
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
                                    <User size={14} />
                                    {isHebrew ? 'שם מלא' : 'Full Name'} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder={isHebrew ? 'ישראל ישראלי' : 'John Doe'}
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
                                    <Phone size={14} />
                                    {isHebrew ? 'טלפון' : 'Phone'} <span className="text-slate-400 font-normal">({isHebrew ? 'אופציונלי' : 'optional'})</span>
                                </label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder={isHebrew ? '050-1234567' : '050-1234567'}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                    dir="ltr"
                                />
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
                                    <Calendar size={14} />
                                    {isHebrew ? 'גיל' : 'Age'} <span className="text-slate-400 font-normal">({isHebrew ? 'אופציונלי' : 'optional'})</span>
                                </label>
                                <input
                                    type="number"
                                    value={age}
                                    onChange={(e) => setAge(e.target.value)}
                                    placeholder="25"
                                    min="0"
                                    max="120"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                    dir="ltr"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 mt-3 text-red-600 text-sm">
                                <AlertCircle size={14} />
                                {error}
                            </div>
                        )}

                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="mt-4 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                            style={{ backgroundColor: '#2563eb', color: '#ffffff' }}
                        >
                            {saved ? (
                                <>
                                    <Check size={16} />
                                    {isHebrew ? 'נשמר!' : 'Saved!'}
                                </>
                            ) : saving ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Save size={16} />
                                    {isHebrew ? 'שמור שינויים' : 'Save Changes'}
                                </>
                            )}
                        </button>
                    </div>

                    {/* CV Upload */}
                    <div className="p-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-4">
                            {isHebrew ? 'קורות חיים' : 'CV / Resume'}
                        </h2>

                        {user.cvUrl ? (
                            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl mb-4">
                                <FileText size={20} className="text-green-600" />
                                <div className="flex-1">
                                    <div className="font-medium text-green-800 text-sm">
                                        {isHebrew ? 'קורות חיים הועלו' : 'CV uploaded'}
                                    </div>
                                    <div className="text-xs text-green-600">{user.cvUrl.split('/').pop()}</div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <a
                                        href={user.cvUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-green-700 hover:underline font-semibold"
                                    >
                                        {isHebrew ? 'צפה' : 'View'}
                                    </a>
                                    <span className="text-slate-300">|</span>
                                    <button
                                        onClick={handleDeleteCV}
                                        disabled={deletingCV}
                                        className="text-sm text-red-600 hover:underline disabled:opacity-50 font-semibold"
                                    >
                                        {deletingCV ? (
                                            <div className="w-3.5 h-3.5 border-2 border-red-300 border-t-red-600 rounded-full animate-spin inline-block" />
                                        ) : (
                                            isHebrew ? 'הסר' : 'Remove'
                                        )}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl mb-4">
                                <FileText size={20} className="text-slate-400" />
                                <span className="text-sm text-slate-500">
                                    {isHebrew ? 'לא הועלו קורות חיים עדיין' : 'No CV uploaded yet'}
                                </span>
                            </div>
                        )}

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleCVUpload}
                            className="hidden"
                        />

                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadingCV}
                            className="px-6 py-2.5 border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            {uploadingCV ? (
                                <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Upload size={16} />
                                    {user.cvUrl 
                                        ? (isHebrew ? 'החלף קורות חיים' : 'Replace CV')
                                        : (isHebrew ? 'העלה קורות חיים' : 'Upload CV')}
                                </>
                            )}
                        </button>
                        <p className="text-xs text-slate-400 mt-2">
                            PDF, DOC, DOCX — {isHebrew ? 'עד 5MB' : 'max 5MB'}
                        </p>
                    </div>
                </motion.div>

                {/* Danger Zone */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-red-50/20 rounded-2xl border border-red-100/60 shadow-sm overflow-hidden mt-6 p-6"
                >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-bold text-red-950 flex items-center gap-2">
                                <AlertTriangle className="text-red-600" size={20} />
                                {isHebrew ? 'אזור מסוכן' : 'Danger Zone'}
                            </h2>
                            <p className="text-sm text-slate-600 mt-1">
                                {isHebrew 
                                    ? 'פעולות בלתי הפיכות הקשורות לחשבון שלך.'
                                    : 'Irreversible actions related to your account.'}
                            </p>
                        </div>
                        <div className="shrink-0">
                            <button
                                onClick={() => {
                                    setError('');
                                    setShowDeleteConfirm(true);
                                }}
                                className="px-5 py-2.5 border border-slate-300 text-black bg-white rounded-xl font-semibold hover:bg-red-50/50 hover:text-red-700 hover:border-red-200 transition-all flex items-center gap-2 text-sm shadow-sm"
                            >
                                <Trash2 size={16} className="text-red-500" />
                                {isHebrew ? 'מחק חשבון' : 'Delete Account'}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {showDeleteConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        {/* Overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => {
                                setShowDeleteConfirm(false);
                                setError('');
                            }}
                            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />

                        {/* Modal Box */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 z-10 relative overflow-hidden"
                        >
                            {/* Accent line */}
                            <div className="absolute top-0 left-0 right-0 h-1.5 bg-red-600" />

                            <button
                                onClick={() => {
                                    setShowDeleteConfirm(false);
                                    setError('');
                                }}
                                className={`absolute top-4 ${isHebrew ? 'left-4' : 'right-4'} text-slate-400 hover:text-slate-600 transition-colors`}
                            >
                                <X size={20} />
                            </button>

                            <div className="flex items-start gap-4 mt-2">
                                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                                    <AlertTriangle className="text-red-600" size={24} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                                        {isHebrew ? 'מחיקת חשבון' : 'Delete Account'}
                                    </h3>
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        {isHebrew 
                                            ? 'נתוני החשבון יימחקו. האם ברצונך להמשיך?'
                                            : 'The account data will be deleted. Do you want to proceed?'}
                                    </p>

                                    {/* Modal Error Display */}
                                    {error && (
                                        <div className="flex items-start gap-2 mt-3 p-3 bg-red-50 rounded-xl text-red-600 text-sm border border-red-100/60 font-medium">
                                            <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                            <span>
                                                {isHebrew && error === 'Cannot delete the last admin account' 
                                                    ? 'לא ניתן למחוק את חשבון המנהל (Admin) האחרון במערכת.' 
                                                    : error}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className={`flex gap-3 justify-end mt-6 ${isHebrew ? 'flex-row-reverse' : ''}`}>
                                <button
                                    onClick={() => {
                                        setShowDeleteConfirm(false);
                                        setError('');
                                    }}
                                    className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium text-sm"
                                >
                                    {isHebrew ? 'ביטול' : 'Cancel'}
                                </button>
                                <button
                                    onClick={handleDeleteAccount}
                                    disabled={deleting}
                                    className="px-5 py-2 rounded-xl font-semibold text-sm shadow-sm flex items-center justify-center min-w-[90px] disabled:opacity-50 hover:bg-red-55 hover:text-red-700 transition-all"
                                    style={{ backgroundColor: '#ffffff', color: '#000000', border: '1px solid #cbd5e1' }}
                                >
                                    {deleting ? (
                                        <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                                    ) : (
                                        isHebrew ? 'אישור' : 'Approve'
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
