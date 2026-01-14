import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle, X, Play } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';


export default function Hero() {
    const [isVideoExpanded, setIsVideoExpanded] = useState(false);
    const { t } = useLanguage();

    // Generate random positions for paw prints once on mount
    const pawPrints = useMemo(() => {
        // Define safe horizontal zones to avoid center text
        // Left side: 2-25%, Right side: 75-98%
        const xZones = [
            [2, 25],
            [75, 98]
        ];

        const paws = [];
        const count = 8; // Reduced count

        for (let i = 0; i < count; i++) {
            const zone = xZones[Math.floor(Math.random() * xZones.length)];
            const duration = 35 + Math.random() * 20; // 35-55s very slow float

            paws.push({
                id: i,
                left: `${zone[0] + Math.random() * (zone[1] - zone[0])}%`,
                top: '110%',
                // bias towards positive delay to have fewer paws initially
                // -0.2*D to +0.8*D => ~20% visible at start
                delay: Math.random() * duration - (duration * 0.2),
                duration: duration
            });
        }
        return paws;
    }, []);

    return (
        <section className="relative pt-48 pb-12 overflow-hidden">




            <div className="container">
                <div className="grid md:grid-cols-2 gap-12 items-center">

                    <div className="order-1 rtl:text-right ltr:text-left">
                        {/* Title Animation: Starts Big and shrinks (No opacity fade, immediate visibility) */}
                        <motion.h1
                            initial={{ scale: 1.5 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 1.5, ease: "easeInOut" }}
                            className="text-5xl sm:text-6xl md:text-7xl font-bold mb-8 leading-[1.1] text-[var(--color-text)] tracking-tight origin-right rtl:origin-right ltr:origin-left"
                        >
                            <span className="text-gradient">{t('hero_title')}</span>
                            <br />
                            {t('hero_subtitle')}
                        </motion.h1>

                        {/* Delayed Reveal for Content - waits for title to shrink */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 1.2, ease: "easeOut" }}
                        >
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

                            <div className="flex flex-wrap justify-center md:justify-start gap-3 md:gap-6 text-sm font-medium text-[var(--color-text-muted)]">
                                {[t('experience'), t('nationwide'), t('all_ages')].map((tag, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-2 bg-[var(--color-accent)]/5 px-3 py-1.5 rounded-full border border-[var(--color-accent)]/10 md:bg-transparent md:p-0 md:border-0"
                                    >
                                        <CheckCircle size={16} className="text-[var(--color-accent)] shrink-0" />
                                        <span>{tag}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 1.4, ease: "easeOut" }}
                        className="order-2 relative"
                    >
                        {/* Video Trigger Card */}
                        <div
                            className="relative rounded-[2rem] overflow-hidden shadow-card border-[6px] border-[var(--color-surface)] bg-[var(--color-surface)] z-10 cursor-pointer group animate-float"
                            onClick={() => {
                                setIsVideoExpanded(true);
                                // Track Video Play
                                if (process.env.NODE_ENV !== 'development') {
                                    fetch('/api/event', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                            type: 'video_click',
                                            name: 'hero_main_video',
                                            metadata: 'user_expanded'
                                        })
                                    }).catch(() => { });
                                }
                            }}
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
                    <img
                        key={paw.id}
                        src="/assets/paw_solid.png"
                        alt=""
                        className="paw-img"
                        style={{
                            left: paw.left,
                            top: paw.top,
                            '--r': `${Math.random() * 30 - 15}deg`,
                            animationDuration: `${paw.duration}s`,
                            animationDelay: `${paw.delay}s`
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
