import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Eye, FileText } from 'lucide-react';

export default function LegalModal({ isOpen, onClose, initialTab = 'accessibility' }) {
    const [activeTab, setActiveTab] = useState(initialTab);

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
        { id: 'accessibility', label: 'הצהרת נגישות', icon: Eye },
        { id: 'privacy', label: 'מדיניות פרטיות', icon: Shield },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
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
                            <h2 className="text-2xl font-bold text-[var(--color-primary)]">מידע משפטי</h2>
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
                        <div className="flex-1 overflow-y-auto p-8 text-right bg-white custom-scrollbar">
                            {activeTab === 'accessibility' && (
                                <div className="space-y-6 text-gray-700">
                                    <h3 className="text-xl font-bold text-[var(--color-primary)]">הצהרת נגישות</h3>
                                    <p>אנו בברק אלוני רואים חשיבות עליונה במתן שירות שוויוני לכלל הלקוחות והגולשים ובשיפור השירות הניתן ללקוחות עם מוגבלות.</p>
                                    <p>בהתאם לכך, אנו משקיעים משאבים רבים בהנגשת האתר שלנו, במטרה לאפשר למרבית האוכלוסייה לגלוש בו בקלות ובנוחות וליהנות מהשירותים ומהתכנים המתפרסמים בו.</p>

                                    <h4 className="font-bold mt-4">רמת הנגישות</h4>
                                    <p>האתר נבנה בהתאם לתקנות שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות), תשע"ג-2013, ולתקן הישראלי ת"י 5568 לנגישות תכנים באינטרנט ברמת AA.</p>

                                    <h4 className="font-bold mt-4">התאמות שבוצעו באתר</h4>
                                    <ul className="list-disc list-inside space-y-2">
                                        <li>האתר מותאם לצפייה בדפדפנים הנפוצים (Chrome, Firefox, Safari, Edge).</li>
                                        <li>תכני האתר כתובים בשפה ברורה וקריאה.</li>
                                        <li>מבנה האתר מושתת על ניווט נוח וברור ותפריטים הבנויים באמצעות רשימות המאפשרים התמצאות קלה ופשוטה.</li>
                                        <li>האתר מותאם לגלישה במכשירים ניידים (רספונסיבי).</li>
                                        <li>התמונות באתר כוללות תיאור טקסטואלי חלופי (Alt Text).</li>
                                        <li>האתר מאפשר שינוי גודל הגופן על ידי שימוש במקלדת (Ctrl + / -).</li>
                                    </ul>

                                    <h4 className="font-bold mt-4">יצירת קשר בנושא נגישות</h4>
                                    <p>אם נתקלתם בקושי כלשהו בגלישה באתר או שיש לכם הערה בנושא, נשמח אם תצרו איתנו קשר כדי שנוכל לטפל בבעיה:</p>
                                    <p>אימייל: dogs@barakaloni.com</p>
                                    <p>טלפון: 050-8391-268</p>
                                </div>
                            )}

                            {activeTab === 'privacy' && (
                                <div className="space-y-6 text-gray-700">
                                    <h3 className="text-xl font-bold text-[var(--color-primary)]">מדיניות פרטיות</h3>
                                    <p>אנו מכבדים את פרטיות המשתמשים באתר ומחויבים להגן על המידע האישי שאתם משתפים איתנו.</p>

                                    <h4 className="font-bold mt-4">איסוף מידע</h4>
                                    <p>כאשר אתם משאירים פרטים באתר (שם, טלפון, אימייל) לצורך יצירת קשר, אנו אוספים את המידע הזה אך ורק למטרת חזרה אליכם ומתן שירות.</p>

                                    <h4 className="font-bold mt-4">שימוש במידע</h4>
                                    <p>המידע שנאסף לא יועבר לצדדים שלישיים ללא הסכמתכם, אלא אם כן נדרשנו לכך על פי חוק.</p>

                                    <h4 className="font-bold mt-4">עוגיות (Cookies)</h4>
                                    <p>האתר עשוי להשתמש ב"עוגיות" (Cookies) לצורך תפעולו השוטף והתקין, ובכלל זה כדי לאסוף נתונים סטטיסטיים אודות השימוש באתר, לאימות פרטים, וכדי להתאים את האתר להעדפותיכם האישיות.</p>
                                    <p>דפדפנים מודרניים מאפשרים לכם להימנע מקבלת Cookies. אם אינכם יודעים כיצד לעשות זאת, בדקו בקובץ העזרה של הדפדפן שבו אתם משתמשים.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
