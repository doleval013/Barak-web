import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Accessibility, Type, Sun, Link as LinkIcon, X, Eye, MousePointer2 } from 'lucide-react';

export default function AccessibilityWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [settings, setSettings] = useState({
        largeText: false,
        highContrast: false,
        highlightLinks: false,
        readableFont: false,
        cursor: false
    });

    // Apply settings to document
    useEffect(() => {
        const body = document.body;

        // Large Text
        if (settings.largeText) body.classList.add('large-text');
        else body.classList.remove('large-text');

        // High Contrast
        if (settings.highContrast) body.classList.add('high-contrast');
        else body.classList.remove('high-contrast');

        // Highlight Links
        if (settings.highlightLinks) body.classList.add('access-links');
        else body.classList.remove('access-links');

        // Readable Font
        if (settings.readableFont) body.classList.add('readable-font');
        else body.classList.remove('readable-font');

        // Big Cursor
        if (settings.cursor) body.classList.add('access-cursor');
        else body.classList.remove('access-cursor');

    }, [settings]);

    const toggleSetting = (key) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const resetSettings = () => {
        setSettings({
            largeText: false,
            highContrast: false,
            highlightLinks: false,
            readableFont: false,
            cursor: false
        });
    };

    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed left-4 bottom-4 z-[80] p-3 rounded-full shadow-2xl hover:scale-110 transition-transform focus:outline-none focus:ring-4 focus:ring-blue-300 text-white border-4 border-white ring-1 ring-black shadow-glow"
                aria-label="פתח תפריט נגישות"
                title="תפריט נגישות"
                style={{ backgroundColor: '#0f172a' }}
            >
                <Accessibility size={32} strokeWidth={2.5} />
            </button>

            {/* Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: -20, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -20, scale: 0.95 }}
                        className="accessibility-widget fixed left-4 bottom-20 z-[90] w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
                    >
                        <div className="bg-[var(--color-primary)] p-4 flex items-center justify-between text-white">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <Accessibility size={20} />
                                כלי נגישות
                            </h3>
                            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-4 grid grid-cols-2 gap-3">
                            <AccessBtn
                                active={settings.largeText}
                                onClick={() => toggleSetting('largeText')}
                                icon={Type}
                                label="הגדל טקסט"
                            />
                            <AccessBtn
                                active={settings.highContrast}
                                onClick={() => toggleSetting('highContrast')}
                                icon={Sun}
                                label="ניגודיות גבוהה"
                            />
                            <AccessBtn
                                active={settings.highlightLinks}
                                onClick={() => toggleSetting('highlightLinks')}
                                icon={LinkIcon}
                                label="הדגש קישורים"
                            />
                            <AccessBtn
                                active={settings.readableFont}
                                onClick={() => toggleSetting('readableFont')}
                                icon={Eye}
                                label="גופן קריא"
                            />
                            <AccessBtn
                                active={settings.cursor}
                                onClick={() => toggleSetting('cursor')}
                                icon={MousePointer2}
                                label="סמן גדול"
                            />
                        </div>

                        <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
                            <button
                                onClick={resetSettings}
                                className="text-sm text-red-500 font-bold hover:underline"
                            >
                                איפוס הגדרות
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

function AccessBtn({ active, onClick, icon: Icon, label }) {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl transition-all border ${active
                ? 'shadow-md'
                : 'bg-white text-gray-600 border-gray-200 hover:border-[var(--color-primary)] hover:bg-blue-50'
                }`}
            style={active ? { backgroundColor: 'var(--color-primary)', color: 'white', borderColor: 'var(--color-primary)' } : {}}
        >
            <Icon size={24} />
            <span className="text-xs font-bold">{label}</span>
        </button>
    );
}
