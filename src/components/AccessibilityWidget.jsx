import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Accessibility,
    X,
    Type,
    Minus,
    Plus,
    Underline as UnderlineIcon,
    Heading as HeadingIcon,
    PauseCircle,
    RotateCcw,
    Barcode,
    Contrast,
    Eye,
    MousePointer2
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function AccessibilityWidget({ isBannerOpen }) {
    const [isOpen, setIsOpen] = useState(false);
    const { t } = useLanguage();
    const [settings, setSettings] = useState({
        scale: 1,
        grayscale: false,
        invertContrast: false,
        highlightLinks: false,
        highlightHeadings: false,
        readableFont: false,
        cursor: false,
        stopAnimations: false
    });

    // Apply settings to document
    useEffect(() => {
        const body = document.body;
        const html = document.documentElement;

        // Scale Text
        html.style.fontSize = `${settings.scale * 100}%`;

        // Invert Contrast
        if (settings.invertContrast) body.classList.add('high-contrast');
        else body.classList.remove('high-contrast');

        // Highlight Links
        if (settings.highlightLinks) body.classList.add('access-links');

        else body.classList.remove('access-links');

        // Highlight Headings
        if (settings.highlightHeadings) body.classList.add('highlight-headings');
        else body.classList.remove('highlight-headings');

        // Readable Font
        if (settings.readableFont) body.classList.add('readable-font');
        else body.classList.remove('readable-font');

        // Big Cursor
        if (settings.cursor) body.classList.add('access-cursor');
        else body.classList.remove('access-cursor');

        // Stop Animations
        if (settings.stopAnimations) body.classList.add('stop-animations');
        else body.classList.remove('stop-animations');

    }, [settings]);

    const updateScale = (delta) => {
        setSettings(prev => {
            const newScale = Math.min(Math.max(prev.scale + delta, 0.8), 1.5);
            return { ...prev, scale: newScale };
        });
    };

    const toggleSetting = (key) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const resetSettings = () => {
        setSettings({
            scale: 1,
            grayscale: false,
            invertContrast: false,
            highlightLinks: false,
            highlightHeadings: false,
            readableFont: false,
            cursor: false,
            stopAnimations: false
        });
    };

    return (
        <>
            {/* Grayscale Overlay */}
            {settings.grayscale && (
                <div
                    className="fixed inset-0 z-[100] pointer-events-none"
                    style={{ backdropFilter: 'grayscale(100%)', WebkitBackdropFilter: 'grayscale(100%)' }}
                />
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed left-4 z-[80] p-3 rounded-full shadow-2xl hover:scale-110 transition-transform focus:outline-none focus:ring-4 focus:ring-blue-300 text-white border-4 border-white ring-1 ring-black shadow-glow"
                aria-label={t('accessibility_tools')}
                title={t('accessibility_tools')}
                style={{
                    backgroundColor: '#0f172a',
                    bottom: isBannerOpen ? '240px' : '1rem',
                    transition: 'bottom 0.3s ease-in-out'
                }}
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
                        className="accessibility-widget fixed left-4 z-[90] w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden text-[#0f172a] rtl:text-right ltr:text-left"
                        dir="auto"
                        style={{
                            bottom: isBannerOpen ? '300px' : '5rem',
                            transition: 'bottom 0.3s ease-in-out'
                        }}
                    >
                        {/* Header */}
                        <div className="bg-[var(--color-primary)] p-4 flex items-center justify-between text-white">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <Accessibility size={20} />
                                {t('accessibility_tools')}
                            </h3>
                            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-4 grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            <AccessBtn
                                active={settings.grayscale}
                                onClick={() => toggleSetting('grayscale')}
                                icon={Barcode}
                                label={t('grayscale')}
                            />
                            <AccessBtn
                                active={settings.invertContrast}
                                onClick={() => toggleSetting('invertContrast')}
                                icon={Contrast}
                                label={t('invert_contrast')}
                            />
                            <AccessBtn
                                onClick={() => updateScale(-0.1)}
                                icon={Minus}
                                label={t('decrease_text')}
                            />
                            <AccessBtn
                                onClick={() => updateScale(0.1)}
                                icon={Plus}
                                label={t('increase_text')}
                            />
                            <AccessBtn
                                active={settings.highlightHeadings}
                                onClick={() => toggleSetting('highlightHeadings')}
                                icon={HeadingIcon}
                                label={t('highlight_headings')}
                            />
                            <AccessBtn
                                active={settings.highlightLinks}
                                onClick={() => toggleSetting('highlightLinks')}
                                icon={UnderlineIcon}
                                label={t('highlight_links')}
                            />
                            <AccessBtn
                                active={settings.readableFont}
                                onClick={() => toggleSetting('readableFont')}
                                icon={Eye}
                                label={t('readable_font')}
                            />
                            <AccessBtn
                                active={settings.cursor}
                                onClick={() => toggleSetting('cursor')}
                                icon={MousePointer2}
                                label={t('big_cursor')}
                            />
                            <AccessBtn
                                active={settings.stopAnimations}
                                onClick={() => toggleSetting('stopAnimations')}
                                icon={PauseCircle}
                                label={t('stop_animations')}
                            />
                            <AccessBtn
                                onClick={resetSettings}
                                icon={RotateCcw}
                                label={t('reset_settings')}
                            />
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
            <span className="text-xs font-bold text-center">{label}</span>
        </button>
    );
}
