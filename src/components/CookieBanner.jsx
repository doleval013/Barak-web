import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie } from 'lucide-react';

export default function CookieBanner({ isVisible, onAccept, onOpenPrivacy }) {

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-0 left-0 right-0 z-[90] p-4 md:p-6 pointer-events-none"
                >
                    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] border border-gray-100 p-6 md:flex items-center justify-between gap-6 pointer-events-auto">
                        <div className="flex items-start gap-4 mb-4 md:mb-0">
                            <div className="p-3 bg-blue-50 rounded-full text-[var(--color-primary)] shrink-0">
                                <Cookie size={24} />
                            </div>
                            <div className="text-right">
                                <h4 className="font-bold text-gray-900 mb-1">אנחנו משתמשים בעוגיות</h4>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    האתר משתמש בעוגיות כדי לשפר את חווית הגלישה. המשך הגלישה באתר מהווה הסכמה לשימוש זה.
                                    <button
                                        onClick={onOpenPrivacy}
                                        className="font-bold mr-1 hover:underline"
                                        style={{ color: '#0f4c81' }}
                                    >
                                        למידע נוסף
                                    </button>
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3 shrink-0">
                            <button
                                onClick={onAccept}
                                className="px-6 py-2.5 rounded-full font-bold transition-colors shadow-lg whitespace-nowrap flex-1 md:flex-none"
                                style={{ backgroundColor: '#0f4c81', color: 'white' }}
                            >
                                הבנתי, תודה
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
