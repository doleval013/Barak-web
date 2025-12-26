import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle, X, Play } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';


export default function Hero() {
    const [isVideoExpanded, setIsVideoExpanded] = useState(false);
    const { t } = useLanguage();

    // Generate random positions for paw prints once on mount
    const pawPrints = useMemo(() => {
        // Define 8 "Safe Zones" around the edges to ensure spread and avoid covering center text
        // Format: { leftRange: [min, max], topRange: [min, max] }
        const zones = [
            { left: [2, 20], top: [5, 25] },    // Top-Left
            { left: [80, 98], top: [5, 25] },   // Top-Right
            { left: [2, 20], top: [60, 80] },   // Bottom-Left (Raised from 95)
            { left: [80, 98], top: [60, 80] },  // Bottom-Right (Raised from 95)
            { left: [1, 15], top: [30, 60] },    // Mid-Left (Side)
            { left: [85, 99], top: [30, 60] },   // Mid-Right (Side)
            { left: [30, 70], top: [2, 12] },    // Top-Center (Very high)
            { left: [30, 70], top: [70, 82] },   // Bottom-Center (Raised from 98)
        ];

        return zones.map((zone, i) => ({
            id: i,
            // Random position strictly within the assigned zone
            left: `${zone.left[0] + Math.random() * (zone.left[1] - zone.left[0])}%`,
            top: `${zone.top[0] + Math.random() * (zone.top[1] - zone.top[0])}%`,
            delay: Math.random() * 10,
            duration: 18 + Math.random() * 10,
            rotate: Math.random() * 60 - 30
        }));
    }, []);

    return (
        <section className="relative pt-48 pb-32 overflow-hidden">




            <div className="container">
                <div className="grid md:grid-cols-2 gap-12 items-center">

                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="order-1 rtl:text-right ltr:text-left"
                    >


                        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-8 leading-[1.1] text-[var(--color-text)] tracking-tight">
                            <span className="text-gradient">{t('hero_title')}</span>
                            <br />
                            {t('hero_subtitle')}
                        </h1>

                        <p className="text-xl text-[var(--color-text-muted)] mb-10 leading-relaxed max-w-lg ml-auto rtl:ml-auto ltr:mr-auto">
                            {t('hero_description')}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 mb-10">
                            <motion.a
                                whileTap={{ scale: 0.95 }}
                                href="#contact"
                                className="btn-shine inline-flex items-center justify-center gap-2 rounded-full font-bold text-lg transition-all transform hover:-translate-y-1 shadow-glow hover:shadow-lg bg-[var(--color-primary)] px-8 py-4"
                                style={{ color: '#ffffff' }}
                            >
                                <span className="relative z-20 flex items-center gap-2">
                                    {t('lets_talk')}
                                    <ArrowLeft size={20} className="rtl:rotate-0 ltr:rotate-180" />
                                </span>
                            </motion.a>
                            <motion.a
                                whileTap={{ scale: 0.95 }}
                                href="#programs"
                                className="glass-panel inline-flex items-center justify-center gap-2 text-[var(--color-text)] px-8 py-4 rounded-full font-bold text-lg hover:bg-white/80 transition-all shadow-sm"
                            >
                                {t('who_is_it_for')}
                            </motion.a>
                        </div>

                        <motion.div
                            variants={{
                                hidden: { opacity: 0, y: 10 },
                                show: {
                                    opacity: 1,
                                    y: 0,
                                    transition: {
                                        staggerChildren: 0.1,
                                        delayChildren: 0.4
                                    }
                                }
                            }}
                            initial="hidden"
                            animate="show"
                            className="flex flex-wrap justify-center md:justify-start gap-3 md:gap-6 text-sm font-medium text-[var(--color-text-muted)]"
                        >
                            {[t('experience'), t('nationwide'), t('all_ages')].map((tag, i) => (
                                <motion.div
                                    key={i}
                                    variants={{
                                        hidden: { opacity: 0, scale: 0.9 },
                                        show: { opacity: 1, scale: 1 }
                                    }}
                                    className="flex items-center gap-2 bg-[var(--color-accent)]/5 px-3 py-1.5 rounded-full border border-[var(--color-accent)]/10 md:bg-transparent md:p-0 md:border-0"
                                >
                                    <CheckCircle size={16} className="text-[var(--color-accent)] shrink-0" />
                                    <span>{tag}</span>
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="order-2 relative"
                    >
                        {/* Video Trigger Card */}
                        <div
                            className="relative rounded-[2rem] overflow-hidden shadow-card border-[6px] border-[var(--color-surface)] bg-[var(--color-surface)] z-10 cursor-pointer group animate-float"
                            onClick={() => setIsVideoExpanded(true)}
                        >
                            <div className="aspect-video relative">
                                <img
                                    src="https://img.youtube.com/vi/HC4Sm4KhXlU/maxresdefault.jpg"
                                    alt={t('video_title')}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="video-overlay absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                    <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                        <Play size={32} className="text-[var(--color-primary)] ml-1 fill-current" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Decorative Elements */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[var(--color-accent)]/20 rounded-full blur-2xl -z-10"></div>
                        <div className="absolute bottom-20 -left-10 w-40 h-40 bg-[var(--color-primary)]/10 rounded-full blur-2xl -z-10"></div>
                    </motion.div>
                </div>
            </div>

            {/* Elegant Floating Paws Background Decoration */}
            <div
                className="absolute inset-0 pointer-events-none overflow-hidden -z-5"
                style={{
                    maskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)'
                }}
            >
                {pawPrints.map((paw) => (
                    <motion.img
                        key={paw.id}
                        src="/assets/paw_solid.png"
                        alt=""
                        initial={{ opacity: 0, y: 50, rotate: Math.random() * 30 - 15 }}
                        animate={{
                            opacity: [0, 0.15, 0],
                            y: -100,
                        }}
                        transition={{
                            duration: paw.duration,
                            repeat: Infinity,
                            delay: paw.delay,
                            ease: "easeInOut"
                        }}
                        className="absolute w-16 md:w-24 blur-[0.5px]"
                        style={{
                            left: paw.left,
                            top: paw.top,
                        }}
                    />
                ))}
            </div>










            {/* Lightbox Modal */}
            <AnimatePresence>
                {isVideoExpanded && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
                            onClick={() => setIsVideoExpanded(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl z-10"
                        >
                            <iframe
                                src="https://www.youtube.com/embed/HC4Sm4KhXlU?autoplay=1&rel=0"
                                title="סרטון תדמית – ברק אלוני"
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                            <button
                                onClick={() => setIsVideoExpanded(false)}
                                className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors backdrop-blur-md"
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
