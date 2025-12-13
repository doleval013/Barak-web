import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { School, PartyPopper, HeartHandshake, ChevronDown, Sparkles, X, Play, FileText } from 'lucide-react';
import ProgramModal from './ProgramModal';

const programs = [
    {
        id: 'education',
        title: 'גפ"ן / מוסדות חינוך',
        icon: School,
        content: 'תוכנית תהליכית לתלמידים מכיתות א\' – י"ב, המותאמת לחינוך רגיל, חינוך מיוחד, נוער בסיכון, עולים חדשים ועוד. אנו מעניקים מענה תומך ומשלים לתהליכים החינוכיים המתקיימים במסגרת בית הספר.',
        video: 'https://www.youtube.com/embed/HC4Sm4KhXlU?autoplay=1&rel=0',
        hasModal: true
    },
    {
        id: 'events',
        title: 'סדנאות ואירועים חד-פעמיים',
        icon: PartyPopper,
        content: 'פעילויות חווייתיות מלאות אנרגיה המתאימות ל: ימי הולדת, קייטנות, סדנאות גיבוש ועוד! הכלבים והצוות שלנו מביאים שמחה, למידה ותחושת העצמה אישית לכל המשתתפים.',
        video: 'https://www.youtube.com/embed/kZMeB9DZNAs?rel=0'
    },
    {
        id: 'community',
        title: 'אוכלוסיות מיוחדות',
        icon: HeartHandshake,
        content: 'התאמות ייעודיות עבור אוכלוסיות שונות כמו: PTSD, קשישים, נוער בסיכון, מרכזי יום ועוד. אנו משלבים כלים מעצימים, ועבודה קבוצתית שמחזקת אמון ואת תחושת ביטחון.'
    }
];

export default function Programs() {
    const [videoModal, setVideoModal] = useState(null);
    const [isProgramModalOpen, setIsProgramModalOpen] = useState(false);
    const [activeSlide, setActiveSlide] = useState(0);
    const scrollRef = useRef(null);

    const handleScroll = () => {
        const el = scrollRef.current;
        if (!el) return;

        // Math.abs handles RTL negative scroll values on some browsers
        const currentScroll = Math.abs(el.scrollLeft);
        const maxScroll = el.scrollWidth - el.clientWidth;

        if (maxScroll <= 0) {
            setActiveSlide(0);
            return;
        }

        const index = Math.round((currentScroll / maxScroll) * (programs.length - 1));
        setActiveSlide(index);
    };

    const scrollToSlide = (index) => {
        const el = scrollRef.current;
        if (el && el.children[index]) {
            el.children[index].scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center'
            });
        }
    };

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
                        <span className="text-gradient-accent text-3xl md:text-4xl font-normal">למסגרות חינוך וארגונים</span>
                    </motion.h2>
                </div>

                <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="flex items-stretch md:grid md:grid-cols-3 gap-6 md:gap-8 overflow-x-auto pb-8 -mx-4 px-4 md:mx-0 md:px-0 snap-x snap-mandatory hide-scrollbar"
                >
                    {programs.map((program, index) => (
                        <motion.div
                            key={program.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            className="min-w-[80vw] md:min-w-0 min-h-[22rem] snap-center group relative glass-panel rounded-[2rem] px-6 pt-6 pb-2 md:p-8 hover:bg-white transition-all duration-500 hover:shadow-glow flex flex-col h-full hover:-translate-y-2"
                        >

                            <div className="relative z-10 flex flex-col flex-grow h-full justify-between">
                                <div>
                                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-[var(--color-bg)] text-[var(--color-primary)] group-hover:bg-[var(--color-accent)] group-hover:text-white flex items-center justify-center transition-all duration-500 mb-4 md:mb-8 shadow-sm group-hover:shadow-[0_10px_20px_-5px_var(--color-accent)] group-hover:scale-110 group-hover:rotate-3">
                                        <program.icon size={32} />
                                    </div>

                                    <h3 className="text-2xl font-bold text-[var(--color-primary)] mb-4 group-hover:text-[var(--color-accent)] transition-colors">
                                        {program.title}
                                    </h3>

                                    <p className="text-[var(--color-text-muted)] leading-relaxed mb-4 text-sm md:text-base">
                                        {program.content}
                                    </p>
                                </div>

                                <div className="mt-auto pt-4 border-t border-[var(--color-border)] w-full flex flex-col gap-3">
                                    {program.hasModal && (
                                        <button
                                            onClick={() => setIsProgramModalOpen(true)}
                                            className="w-full py-3 px-4 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 font-bold flex items-center justify-center gap-2 hover:!bg-blue-600 hover:!text-white hover:!border-blue-600 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                                        >
                                            לפרטים נוספים
                                            <FileText size={18} />
                                        </button>
                                    )}

                                    {program.video && (
                                        <button
                                            onClick={() => setVideoModal(program.video)}
                                            className="w-full py-3 px-4 rounded-xl btn-youtube font-bold flex items-center justify-center gap-2 group/btn"
                                        >
                                            צפה בסרטון
                                            <div className="w-8 h-8 rounded-full icon-circle flex items-center justify-center mr-2">
                                                <Play size={18} className="fill-current ml-0.5" />
                                            </div>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Mobile Scroll Indicators */}
                <div className="flex md:hidden justify-center gap-2 mt-2">
                    {programs.map((_, index) => (
                        <div
                            key={index}
                            role="button"
                            tabIndex={0}
                            onClick={() => scrollToSlide(index)}
                            aria-label={`Go to slide ${index + 1}`}
                            className={`scroll-dot h-2 rounded-full transition-all duration-300 cursor-pointer ${index === activeSlide
                                ? 'w-8 bg-[var(--color-accent)]'
                                : 'w-2 bg-[var(--color-primary)]/20 hover:bg-[var(--color-primary)]/40'
                                }`}
                        />
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

            <ProgramModal
                isOpen={isProgramModalOpen}
                onClose={() => setIsProgramModalOpen(false)}
            />
        </section>
    );
}
