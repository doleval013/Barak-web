import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Eye, FileText } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function LegalModal({ isOpen, onClose, initialTab = 'accessibility' }) {
    const [activeTab, setActiveTab] = useState(initialTab);
    const { t } = useLanguage();

    useEffect(() => {
        if (isOpen) {
            setActiveTab(initialTab);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen, initialTab]);

    const tabs = [
        { id: 'accessibility', label: t('accessibility_statement'), icon: Eye },
        { id: 'privacy', label: t('privacy_policy'), icon: Shield },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 rtl:text-right ltr:text-left" dir="auto">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50">
                            <h2 className="text-2xl font-bold text-[var(--color-primary)]">{t('legal_info')}</h2>
                            <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-gray-100 overflow-x-auto">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-6 py-4 font-bold transition-colors whitespace-nowrap ${activeTab === tab.id
                                        ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)] bg-blue-50/50'
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    <tab.icon size={18} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            {activeTab === 'accessibility' && (
                                <div className="space-y-6 text-gray-700">
                                    <h3 className="text-xl font-bold text-[var(--color-primary)]">{t('accessibility_statement')}</h3>
                                    <p>{t('accessibility_intro')}</p>
                                    <p>{t('accessibility_resources')}</p>

                                    <h4 className="font-bold mt-4">{t('accessibility_level')}</h4>
                                    <p>{t('accessibility_standard')}</p>

                                    <h4 className="font-bold mt-4">{t('adjustments_made')}</h4>
                                    <ul className="list-disc list-inside space-y-2">
                                        <li>{t('adjustment_1')}</li>
                                        <li>{t('adjustment_2')}</li>
                                        <li>{t('adjustment_3')}</li>
                                        <li>{t('adjustment_4')}</li>
                                        <li>{t('adjustment_5')}</li>
                                        <li>{t('adjustment_6')}</li>
                                    </ul>

                                    <h4 className="font-bold mt-4">{t('accessibility_contact_title')}</h4>
                                    <p>{t('accessibility_contact_text')}</p>
                                    <p>{t('accessibility_email')}</p>
                                    <p>{t('accessibility_phone')}</p>
                                </div>
                            )}

                            {activeTab === 'privacy' && (
                                <div className="space-y-6 text-gray-700">
                                    <h3 className="text-xl font-bold text-[var(--color-primary)]">{t('privacy_policy')}</h3>
                                    <p>{t('privacy_intro')}</p>

                                    <h4 className="font-bold mt-4">{t('data_collection')}</h4>
                                    <p>{t('data_collection_text')}</p>

                                    <h4 className="font-bold mt-4">{t('data_use')}</h4>
                                    <p>{t('data_use_text')}</p>

                                    <h4 className="font-bold mt-4">{t('cookies_policy_title')}</h4>
                                    <p>{t('cookies_policy_text_1')}</p>
                                    <p>{t('cookies_policy_text_2')}</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
