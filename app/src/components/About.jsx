import React from 'react';
import { PawPrint, Quote } from 'lucide-react';
import { motion } from 'framer-motion';

export default function About() {
    return (
        <section id="about" className="section-padding relative">
            <div className="container">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-12"
                    >
                        <span className="text-[var(--color-accent)] font-bold tracking-wider uppercase text-sm">מי אנחנו</span>
                        <h2 className="text-3xl md:text-5xl font-bold mt-2 text-[var(--color-primary)]">קצת עליי ועל הדרך</h2>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="glass-panel relative p-8 md:p-14 rounded-[2.5rem] hover:shadow-glow transition-all duration-500"
                    >
                        {/* Decorative Quote Icon */}
                        <div className="absolute top-8 right-8 text-[var(--color-primary)]/5">
                            <Quote size={80} />
                        </div>

                        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
                            <div className="flex-shrink-0">
                                <motion.div
                                    whileHover={{ rotate: 12, scale: 1.1 }}
                                    className="w-16 h-16 rounded-2xl bg-[var(--color-accent)] text-white flex items-center justify-center shadow-lg transform rotate-3"
                                >
                                    <PawPrint size={32} />
                                </motion.div>
                            </div>

                            <div className="space-y-6 text-lg leading-relaxed text-[var(--color-text-muted)]">
                                <p>
                                    <strong className="text-[var(--color-text)]">אני ברק,</strong> מדריך ומוביל תוכניות חינוכיות בכלבנות טיפולית.
                                    הצוות שלי ואני מפעילים פרויקטים בבתי ספר, בעמותות, בקייטנות ובארגונים בכל הארץ.
                                </p>
                                <p>
                                    אנחנו ספקים מורשים של <strong className="text-[var(--color-accent)]">"גפן"</strong> ועובדים עם מגוון רחב של אוכלוסיות –
                                    החל מחינוך רגיל וחינוך מיוחד, דרך נוער בסיכון וקשישים, ועד סדנאות גיבוש לחברות הייטק.
                                </p>
                                <p>
                                    הגישה שלנו משלבת מקצועיות, רגישות ואהבה גדולה לאנשים ולכלבים, במטרה ליצור חיבורים משמעותיים ורגעים של הצלחה.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
