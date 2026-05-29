/**
 * UserProfile — Profile management page
 * 
 * Shows Google-sourced info (name, email, picture).
 * Allows editing optional fields: phone, age.
 * Upload/replace CV.
 * Access application history.
 */

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Mail, Phone, Calendar, FileText, Upload, Save, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export default function UserProfile() {
    const { user, updateProfile, uploadCV } = useAuth();
    const { language } = useLanguage();
    const isHebrew = language === 'he';
    const fileInputRef = useRef(null);

    const [phone, setPhone] = useState(user?.phone || '');
    const [age, setAge] = useState(user?.age || '');
    const [saving, setSaving] = useState(false);
    const [uploadingCV, setUploadingCV] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    const navigateBack = () => {
        window.history.pushState({}, '', '/');
        window.dispatchEvent(new PopStateEvent('popstate'));
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');
        setSaved(false);

        try {
            await updateProfile({ phone: phone || null, age: age || null });
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

    if (!user) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <p className="text-slate-500">{isHebrew ? 'נדרשת התחברות' : 'Sign in required'}</p>
            </div>
        );
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
                                <User size={18} className="text-slate-400 shrink-0" />
                                <div>
                                    <div className="text-xs text-slate-500">{isHebrew ? 'שם מלא' : 'Full Name'}</div>
                                    <div className="font-medium text-slate-900">{user.fullName}</div>
                                </div>
                            </div>
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
                                ? 'שם ואימייל מנוהלים דרך חשבון Google שלך.'
                                : 'Name and email are managed by your Google account.'}
                        </p>
                    </div>

                    {/* Editable Fields */}
                    <div className="p-6 border-b border-slate-100">
                        <h2 className="text-lg font-bold text-slate-900 mb-4">
                            {isHebrew ? 'פרטים נוספים' : 'Additional Info'}
                        </h2>
                        <div className="space-y-4">
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
                                <a
                                    href={user.cvUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-green-700 hover:underline"
                                >
                                    {isHebrew ? 'צפה' : 'View'}
                                </a>
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
            </div>
        </div>
    );
}
