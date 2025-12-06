import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { School, PartyPopper, HeartHandshake, ChevronDown, Sparkles, X, Play } from 'lucide-react';

const programs = [
    {
        id: 'education',
        title: 'גפן / מוסדות חינוך',
        icon: School,
        content: 'תוכניות שנתיות וליווי כיתות, עבודה צמודה עם צוותים פדגוגיים, קבוצות חברתיות ופרויקטים העצמה משולבי יעדים לימודיים ורגשיים.'
    },
    {
        id: 'events',
        title: 'קייטנות ואירועים חד-פעמיים',
        icon: PartyPopper,
        content: 'פעילויות חווייתיות מלאות אנרגיה: ימי הולדת, קייטנות, סדנאות לחגים ומפגשים עונתיים. הכלבים והצוות מביאים שמחה, למידה דרך משחק, ותחושת העצמה אישית לכל ילד וילדה.'
    },
    {
        id: 'community',
        title: 'עמותות / קהילות / אוכלוסיות מיוחדות',
        icon: HeartHandshake,
        content: 'התאמות ייעודיות עבור PTSD, קשישים, נוער בסיכון, מרכזי יום וחברות הייטק שמחפשות פעילות גיבוש עם ערך. משלבים כלים מעצימים,  ועבודה קבוצתית שמחזקת אמון ותחושת ביטחון.',
        video: 'https://www.youtube.com/embed/kZMeB9DZNAs?rel=0'
    }
];

export default function Programs() {
    const [videoModal, setVideoModal] = useState(null);

    return (
        <section id="programs" className="section-padding relative overflow-hidden">
            {/* Background decorative elements */}
            {/* Background functional mesh provided by body */}

            <div className="container">
                <div className="text-center mb-20 max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="glass-panel inline-flex items-center gap-2 px-4 py-2 rounded-full text-[var(--color-accent)] font-bold text-sm mb-6"
                    >
                        <Sparkles size={16} />
                        <span>התוכניות שלנו</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-bold mb-6 tracking-tight"
                    >
                        <span className="text-[var(--color-primary)]">פתרונות מותאמים אישית</span>
                        <br />
                        <span className="text-gradient-accent text-3xl md:text-4xl font-normal">לכל צורך ומטרה</span>
                    </motion.h2>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {programs.map((program, index) => (
                        <motion.div
                            key={program.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            className="group relative glass-panel rounded-[2rem] p-6 md:p-8 hover:bg-white transition-all duration-500 hover:shadow-glow flex flex-col h-full hover:-translate-y-2"
                        >

                            <div className="relative z-10 flex flex-col h-full">
                                <div className="w-16 h-16 rounded-2xl bg-[var(--color-bg)] text-[var(--color-primary)] group-hover:bg-[var(--color-accent)] group-hover:text-white flex items-center justify-center transition-all duration-500 mb-8 shadow-sm group-hover:shadow-[0_10px_20px_-5px_var(--color-accent)] group-hover:scale-110 group-hover:rotate-3">
                                    <program.icon size={32} />
                                </div>

                                <h3 className="text-2xl font-bold text-[var(--color-primary)] mb-4 group-hover:text-[var(--color-accent)] transition-colors">
                                    {program.title}
                                </h3>

                                <p className="text-[var(--color-text-muted)] leading-relaxed mb-8 flex-grow">
                                    {program.content}
                                </p>

                                <div className="mt-auto pt-6 border-t border-[var(--color-border)]">
                                    {program.video ? (
                                        <button
                                            onClick={() => setVideoModal(program.video)}
                                            className="w-full py-3 px-4 rounded-xl bg-[var(--color-bg)] text-[var(--color-primary)] font-bold hover:bg-[var(--color-primary)] hover:text-white transition-all flex items-center justify-center gap-2 group/btn"
                                        >
                                            צפה בסרטון
                                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mr-2 group-hover/btn:bg-white/30 transition-colors">
                                                <Play size={14} className="fill-current" />
                                            </div>
                                        </button>
                                    ) : (
                                        <a href="#contact" className="inline-flex items-center font-bold text-[var(--color-primary)] hover:text-[var(--color-accent)] transition-colors group/link">
                                            לפרטים נוספים
                                            <ChevronDown size={18} className="mr-1 rotate-90 group-hover/link:-translate-x-1 transition-transform" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Video Modal */}
            <AnimatePresence>
                {videoModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
                            onClick={() => setVideoModal(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl z-10 border border-white/10"
                        >
                            <iframe
                                src={videoModal}
                                title="Video"
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                            <button
                                onClick={() => setVideoModal(null)}
                                className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors backdrop-blur-md border border-white/10"
                            >
                                <X size={24} />
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </section>
    );
}
