
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, FileText, CheckCircle2, Users, BookOpen, Heart, Check } from 'lucide-react';


export default function ProgramModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 text-right" dir="rtl">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50 shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl shadow-sm">
                                <FileText size={28} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 leading-tight">גפ"ן / מוסדות חינוך</h3>
                                <div className="text-sm text-gray-500 font-medium mt-1 flex flex-wrap items-center gap-2">
                                    <span>הדרכת כלבנות טיפולית</span>
                                    <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200">
                                        <CheckCircle2 size={14} className="text-green-600" strokeWidth={2.5} />
                                        תוכנית מאושרת גפ"ן
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                        <div className="max-w-3xl mx-auto space-y-10">

                            {/* Introduction */}
                            <section>
                                <p className="text-xl text-gray-700 leading-relaxed font-medium">
                                    התוכנית הינה תוכנית חינוכית המשלבת בין עולם הכלבנות לבין  עולם ההתפתחות האישית.
                                    התוכנית נועדה לפתח מיומנויות חברתיות, תקשורת וביטחון עצמי אצל התלמידים.
                                </p>
                            </section>

                            {/* Goals Grid */}
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="relative p-8 rounded-3xl bg-white shadow-[0_2px_20px_-10px_rgba(59,130,246,0.15)] border border-blue-50 hover:border-blue-100 transition-colors group">
                                    <div className="absolute top-0 right-8 -translate-y-1/2 bg-blue-50 text-blue-600 p-3 rounded-2xl shadow-sm group-hover:scale-110 transition-transform duration-300 flex items-center justify-center">
                                        <span className="text-2xl">🎯</span>
                                    </div>
                                    <h4 className="text-xl font-bold text-gray-900 mt-4 mb-6">מטרות התוכנית</h4>
                                    <ul className="space-y-4">
                                        {[
                                            "העצמה אישית וקבוצתית",
                                            "קבלת האחר וקבלה עצמית",
                                            "חיזוק ופיתוח כישורי חיים",
                                            "התגברות על פחדים",
                                            "חיזוק מעורבות חברתית"
                                        ].map((goal, i) => (
                                            <li key={i} className="flex items-start gap-3">
                                                <CheckCircle2 size={18} className="text-blue-500 shrink-0 mt-0.5" />
                                                <span className="text-gray-700 font-medium">{goal}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="relative p-8 rounded-3xl bg-white shadow-[0_2px_20px_-10px_rgba(99,102,241,0.15)] border border-indigo-50 hover:border-indigo-100 transition-colors group">
                                    <div className="absolute top-0 right-8 -translate-y-1/2 bg-indigo-50 text-indigo-600 p-3 rounded-2xl shadow-sm group-hover:scale-110 transition-transform duration-300 flex items-center justify-center">
                                        <span className="text-2xl">💡</span>
                                    </div>
                                    <h4 className="text-xl font-bold text-gray-900 mt-4 mb-6">יעדים וערכים</h4>
                                    <ul className="space-y-4">
                                        {[
                                            "יצירת סביבה חינוכית בטוחה",
                                            "דיונים ללא שיפוטיות",
                                            "הבעת דעות ללא חשש",
                                            "לקיחת אחריות אישית",
                                            "השתתפות מתוך רצון ובחירה"
                                        ].map((goal, i) => (
                                            <li key={i} className="flex items-start gap-3">
                                                <CheckCircle2 size={18} className="text-indigo-500 shrink-0 mt-0.5" />
                                                <span className="text-gray-700 font-medium">{goal}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Target Audience & Structure */}
                            <section className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-orange-100 text-orange-600 rounded-lg shrink-0 mt-1">
                                        <Users size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold text-gray-900 mb-2">קהל היעד</h4>
                                        <p className="text-gray-600 leading-relaxed">
                                            התוכנית מיועדת לתלמידים מכיתה <span className="font-bold text-gray-900">א' ועד י"ב</span> מכל המגזרים.
                                            <br />
                                            מותאמת למגוון רחב של אוכלוסיות: מצטיינים, מחוננים, חינוך מיוחד, נוער בסיכון, הפרעות קשב, לקויות  למידה, עולים חדשים וכו'.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-green-100 text-green-600 rounded-lg shrink-0 mt-1">
                                        <BookOpen size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold text-gray-900 mb-2">דרכי פעולה</h4>
                                        <p className="text-gray-600 leading-relaxed mb-2">
                                            דרך עולם הכלבנות נלמד תקשורת אפקטיבית, שפת גוף, אילוף בסיסי, ספורט כלבני וכלבי שירות.
                                            ההדרכה מתבצעת "בגובה העיניים" תוך יצירת אמון ומחויבות הדדית.
                                        </p>
                                        <p className="text-gray-600 leading-relaxed">
                                            הקבוצות הינן קבועות (ללא חילופי תלמידים) כדי לשמור על מרחב בטוח ואינטימי.
                                            אנו מבצעים מעקב אישי אחר כל תלמיד כדי לדייק את המענה.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-rose-100 text-rose-600 rounded-lg shrink-0 mt-1">
                                        <Heart size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold text-gray-900 mb-2">תוצאות מצופות</h4>
                                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-gray-600">
                                            <li className="flex items-center gap-2">
                                                <Check className="w-5 h-5 text-rose-500 shrink-0" />
                                                ביטחון עצמי וחברתי
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <Check className="w-5 h-5 text-rose-500 shrink-0" />
                                                יצירת קשרים חברתיים
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <Check className="w-5 h-5 text-rose-500 shrink-0" />
                                                פיתוח אמפתיה וחמלה
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <Check className="w-5 h-5 text-rose-500 shrink-0" />
                                                מוסריות כלפי בעלי חיים
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </section>

                            {/* Details Box */}
                            <div className="bg-gray-50 rounded-2xl p-6 text-sm text-gray-500 border border-gray-100">
                                <h5 className="font-bold text-gray-900 mb-2">פרטים טכניים:</h5>
                                <ul className="space-y-1">
                                    <li>• גודל קבוצה: 6-8 תלמידים</li>
                                    <li>• דרישות: כיתה קבועה, ליווי יועץ חינוכי</li>
                                    <li>• פרטי קשר: ברק אלוני | 050-8391268 | Dogs@barakaloni.com</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
