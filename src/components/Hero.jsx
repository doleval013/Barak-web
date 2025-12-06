import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle, X, Play } from 'lucide-react';

export default function Hero() {
    const [isVideoExpanded, setIsVideoExpanded] = useState(false);

    return (
        <section className="relative pt-48 pb-32 overflow-hidden">
            {/* Abstract Background Shapes */}
            {/* Abstract Background Shapes */}
            <motion.div
                animate={{
                    y: [0, -20, 0],
                    rotate: [0, 5, 0],
                    scale: [1, 1.05, 1]
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute top-0 right-0 w-2/3 h-full bg-[var(--color-secondary)]/5 -skew-x-12 translate-x-1/4 -z-10 blur-3xl"
            />
            <motion.div
                animate={{
                    y: [0, 30, 0],
                    rotate: [0, -5, 0],
                    scale: [1, 1.1, 1]
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                }}
                className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-[var(--color-accent)]/10 rounded-full blur-3xl -z-10"
            />

            <div className="container">
                <div className="grid md:grid-cols-2 gap-12 items-center">

                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="order-1 text-right"
                    >


                        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-8 leading-[1.1] text-[var(--color-text)] tracking-tight">
                            <span className="text-gradient">ברק אלוני</span>
                            <br />
                            סדנאות כלבנות והעצמה
                        </h1>

                        <p className="text-xl text-[var(--color-text-muted)] mb-10 leading-relaxed max-w-lg ml-auto">
                            חינוך, קהילה וארגונים. נבנה יחד חוויה מעצימה, ערכית ומחברת – עם מעל 10 שנות ניסיון בשטח.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 mb-10">
                            <a
                                href="#contact"
                                className="btn-shine inline-flex items-center justify-center gap-2 rounded-full font-bold text-lg transition-all transform hover:-translate-y-1 shadow-glow hover:shadow-lg bg-[var(--color-primary)] px-8 py-4"
                                style={{ color: '#ffffff' }}
                            >
                                <span className="relative z-20 flex items-center gap-2">
                                    בואו נדבר
                                    <ArrowLeft size={20} />
                                </span>
                            </a>
                            <a
                                href="#programs"
                                className="glass-panel inline-flex items-center justify-center gap-2 text-[var(--color-text)] px-8 py-4 rounded-full font-bold text-lg hover:bg-white/80 transition-all shadow-sm"
                            >
                                למי זה מתאים?
                            </a>
                        </div>

                        <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-[var(--color-text-muted)]">
                            {['+10 שנות ניסיון', 'פריסה ארצית', 'מותאם לכל גיל'].map((tag, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <CheckCircle size={16} className="text-[var(--color-accent)]" />
                                    {tag}
                                </div>
                            ))}
                        </div>
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
                                    alt="Video Thumbnail"
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
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[var(--color-primary)]/10 rounded-full blur-2xl -z-10"></div>
                    </motion.div>

                </div>
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
