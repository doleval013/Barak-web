import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { School, PartyPopper, HeartHandshake, ChevronDown, Sparkles, X, Play, FileText } from 'lucide-react';
import ProgramModal from './ProgramModal';
import { useLanguage } from '../context/LanguageContext';

export default function Programs() {
    const { t } = useLanguage();
    const [videoModal, setVideoModal] = useState(null);
    const [isProgramModalOpen, setIsProgramModalOpen] = useState(false);
    const [activeSlide, setActiveSlide] = useState(0);
    const [isFocused, setIsFocused] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const scrollRef = useRef(null);

    const programs = [
        {
            id: 'education',
            title: t('program_education_title'),
            icon: School,
            content: t('program_education_content'),
            video: 'https://www.youtube.com/embed/HC4Sm4KhXlU?autoplay=1&rel=0',
            hasModal: true
        },
        {
            id: 'events',
            title: t('program_events_title'),
            icon: PartyPopper,
            content: t('program_events_content'),
            video: 'https://www.youtube.com/embed/kZMeB9DZNAs?rel=0'
        },
        {
            id: 'community',
            title: t('program_special_title'),
            icon: HeartHandshake,
            content: t('program_special_content')
        }
    ];

    const checkActiveState = () => {
        const container = scrollRef.current;
        if (!container) return;

        // 1. Vertical Center Check (Viewport)
        // Ensure the component is roughly in the middle 40% of the screen
        const rect = container.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const containerCenterY = rect.top + rect.height / 2;
        const viewportCenterY = viewportHeight / 2;
        const isVerticallyCentered = Math.abs(containerCenterY - viewportCenterY) < (viewportHeight * 0.2);

        // 2. Horizontal Center Check (Carousel)
        const containerCenterX = rect.left + rect.width / 2;
        // 15% threshold for horizontal snap (approx 50px)
        const focusThresholdX = container.clientWidth * 0.15;

        let closestIndex = 0;
        let minDistanceX = Number.MAX_VALUE;

        Array.from(container.children).forEach((child, index) => {
            const childRect = child.getBoundingClientRect();
            const childCenterX = childRect.left + childRect.width / 2;
            const distanceX = Math.abs(childCenterX - containerCenterX);

            if (distanceX < minDistanceX) {
                minDistanceX = distanceX;
                closestIndex = index;
            }
        });

        setActiveSlide(closestIndex);
        // Compound Focus: Center of screen AND Center of carousel
        setIsFocused(isVerticallyCentered && minDistanceX < focusThresholdX);
    };

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
            checkActiveState();
        };

        handleResize();

        // Listen to global scroll for vertical detection
        window.addEventListener('resize', handleResize);
        window.addEventListener('scroll', checkActiveState, { passive: true });

        // Initial delayed check
        const timeoutId = setTimeout(checkActiveState, 100);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('scroll', checkActiveState);
            clearTimeout(timeoutId);
        };
    }, []);

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
        <section id="programs" className="pt-12 pb-24 relative overflow-hidden">
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
                        <span>{t('our_programs')}</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-bold mb-6 tracking-tight"
                    >
                        <span className="text-[var(--color-primary)]">{t('tailored_solutions')}</span>
                        <br />
                        <span className="text-gradient-accent text-3xl md:text-4xl font-normal">{t('for_education')}</span>
                    </motion.h2>
                </div>

                <div
                    ref={scrollRef}
                    onScroll={checkActiveState}
                    className="flex items-stretch md:grid md:grid-cols-3 gap-6 md:gap-8 overflow-x-auto pb-12 pt-4 -mx-4 px-4 md:mx-0 md:px-0 snap-x snap-mandatory hide-scrollbar"
                >
                    {programs.map((program, index) => {
                        const isActiveMobile = isMobile && activeSlide === index && isFocused;

                        // Base classes common to both
                        const baseCardClasses = "min-h-[22rem] flex flex-col h-full transition-all duration-300 relative glass-panel rounded-[2rem] px-6 pt-6 pb-2 md:p-8";

                        // Mobile-specific classes (Focus/Scroll driven only)
                        const mobileCardClasses = isActiveMobile
                            ? "min-w-[80vw] snap-center bg-white shadow-2xl -translate-y-4 scale-105 z-10 border-blue-100" // Active Pop
                            : "min-w-[80vw] snap-center scale-95 opacity-60 grayscale-[0.5]"; // Inactive / Greyish

                        // Desktop-specific classes (Hover driven)
                        const desktopCardClasses = "min-w-0 group hover:bg-white hover:shadow-glow hover:-translate-y-2";

                        const cardClasses = `${baseCardClasses} ${isMobile ? mobileCardClasses : desktopCardClasses}`;

                        // Icon Styles
                        const activeIconStyles = "bg-[var(--color-accent)] text-white shadow-[0_10px_20px_-5px_var(--color-accent)] scale-110 rotate-3";
                        const inactiveIconStyles = "bg-[var(--color-bg)] text-[var(--color-primary)] shadow-sm";
                        const hoverIconStyles = !isMobile ? "group-hover:bg-[var(--color-accent)] group-hover:text-white group-hover:shadow-[0_10px_20px_-5px_var(--color-accent)] group-hover:scale-110 group-hover:rotate-3" : "";

                        const iconClasses = `w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center transition-all duration-500 mb-4 md:mb-8 ${(isMobile && isActiveMobile) ? activeIconStyles : `${inactiveIconStyles} ${hoverIconStyles}`
                            }`;

                        // Title Styles
                        const activeTitleStyles = "text-[var(--color-accent)]";
                        const inactiveTitleStyles = "text-[var(--color-primary)]";
                        const hoverTitleStyles = !isMobile ? "group-hover:text-[var(--color-accent)]" : "";

                        const titleClasses = `text-2xl font-bold mb-4 transition-colors ${(isMobile && isActiveMobile) ? activeTitleStyles : `${inactiveTitleStyles} ${hoverTitleStyles}`
                            }`;

                        return (
                            <motion.div
                                key={program.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                whileTap={{ scale: 0.98 }}
                                transition={{ delay: index * 0.1, duration: 0.5 }}
                                className={cardClasses}
                            >

                                <div className="relative z-10 flex flex-col flex-grow h-full justify-between">
                                    <div>
                                        <div className={iconClasses}>
                                            <program.icon size={32} />
                                        </div>

                                        <h3 className={titleClasses}>
                                            {program.title}
                                        </h3>

                                        <p className="text-[var(--color-text-muted)] leading-relaxed mb-4 text-sm md:text-base">
                                            {program.content}
                                        </p>
                                    </div>

                                    <div className="mt-auto pt-4 border-t border-[var(--color-border)] w-full flex flex-col gap-3">
                                        {program.hasModal && (
                                            <button
                                                onClick={() => {
                                                    setIsProgramModalOpen(true);
                                                    fetch('/api/event', {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({ type: 'program_view', name: 'program_card', metadata: t(program.title) })
                                                    }).catch(console.error);
                                                }}
                                                className="w-full py-3 px-4 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 font-bold flex items-center justify-center gap-2 hover:!bg-blue-600 hover:!text-white hover:!border-blue-600 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                                            >
                                                {t('more_details')}
                                                <FileText size={18} />
                                            </button>
                                        )}

                                        {program.video && (
                                            <button
                                                onClick={() => {
                                                    setVideoModal(program.video);
                                                    fetch('/api/event', {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({ type: 'video_click', name: 'video_play', metadata: t(program.title) })
                                                    }).catch(console.error);
                                                }}
                                                className="w-full py-3 px-4 rounded-xl btn-youtube font-bold flex items-center justify-center gap-2 group/btn"
                                            >
                                                {t('watch_video')}
                                                <div className="w-8 h-8 rounded-full icon-circle flex items-center justify-center mr-2">
                                                    <Play size={18} className="fill-current ml-0.5" />
                                                </div>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
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
