import React from 'react';
import { Phone, Mail, User, Send, MapPin, Facebook, Instagram, Youtube } from 'lucide-react';
import { motion } from 'framer-motion';

const TikTok = ({ size = 24, className = "" }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
);

export default function Contact() {
    return (
        <section id="contact" className="section-padding pb-20 bg-white">
            <div className="container max-w-6xl">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                    className="glass-panel rounded-[2.5rem] shadow-card overflow-hidden"
                >
                    <div className="grid lg:grid-cols-5">

                        {/* Contact Info Side */}
                        <div className="lg:col-span-2 p-10 md:p-14 bg-[var(--color-primary)] text-white flex flex-col justify-between relative overflow-hidden">
                            <div className="relative z-10 flex flex-col gap-8">
                                <div>
                                    <h2 className="text-3xl font-bold mb-6">צרו קשר</h2>
                                    <p className="text-white/80 text-lg leading-relaxed">
                                        רוצים לשמוע עוד? <br />
                                        אנחנו זמינים לכל שאלה, התייעצות או בקשה.
                                    </p>
                                </div>

                                <div className="space-y-8">
                                    <div className="flex items-start gap-5">
                                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm flex-shrink-0 text-white">
                                            <User size={24} />
                                        </div>
                                        <div>
                                            <div className="text-sm text-white/60 mb-1 font-medium">עם מי מדברים?</div>
                                            <div className="font-bold text-lg">ברק אלוני</div>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-5">
                                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm flex-shrink-0 text-white">
                                            <Phone size={24} />
                                        </div>
                                        <div>
                                            <div className="text-sm text-white/60 mb-1 font-medium">טלפון</div>
                                            <a href="tel:0508391268" className="font-bold text-lg hover:text-[var(--color-accent)] transition-colors" dir="ltr">050-8391-268</a>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-5">
                                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm flex-shrink-0 text-white">
                                            <Mail size={24} />
                                        </div>
                                        <div>
                                            <div className="text-sm text-white/60 mb-1 font-medium">אימייל</div>
                                            <a href="mailto:dogs@barakaloni.com" className="font-bold text-lg hover:text-[var(--color-accent)] transition-colors">dogs@barakaloni.com</a>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-5">
                                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm flex-shrink-0 text-white">
                                            <MapPin size={24} />
                                        </div>
                                        <div>
                                            <div className="text-sm text-white/60 mb-1 font-medium">אזור פעילות</div>
                                            <div className="font-bold text-lg">פריסה ארצית</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Social Links - Added Here */}
                                <div className="mt-8 pt-10 border-t border-white/10 flex flex-col gap-12">
                                    <h3 className="text-lg font-bold opacity-90">עקבו אחרינו</h3>
                                    <div className="flex gap-12">
                                        {/* Facebook - Blue */}
                                        <a
                                            href="https://www.facebook.com/barakaloni.dogs"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-12 h-12 rounded-full bg-[#1877F2] text-white flex items-center justify-center transition-all hover:scale-110 hover:shadow-[0_0_15px_rgba(24,119,242,0.5)]"
                                            aria-label="Facebook"
                                        >
                                            <Facebook size={24} />
                                        </a>

                                        {/* Instagram - Gradient */}
                                        <a
                                            href="https://www.instagram.com/barakaloni.dogs/"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white flex items-center justify-center transition-all hover:scale-110 hover:shadow-[0_0_15px_rgba(220,39,67,0.5)]"
                                            aria-label="Instagram"
                                        >
                                            <Instagram size={24} />
                                        </a>

                                        {/* TikTok - Black */}
                                        <a
                                            href="https://www.tiktok.com/@barakaloni"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center transition-all hover:scale-110 hover:shadow-[0_0_15px_rgba(0,0,0,0.5)]"
                                            aria-label="TikTok"
                                        >
                                            <TikTok size={20} />
                                        </a>

                                        {/* YouTube - Red */}
                                        <a
                                            href="https://www.youtube.com/channel/UC56vSCOnTh1K-5FkiwoIdvA/videos"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-12 h-12 rounded-full bg-[#FF0000] text-white flex items-center justify-center transition-all hover:scale-110 hover:shadow-[0_0_15px_rgba(255,0,0,0.5)]"
                                            aria-label="YouTube"
                                        >
                                            <Youtube size={24} />
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Decorative circles */}
                            <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/20 rounded-full translate-y-1/3 -translate-x-1/3 blur-3xl"></div>
                        </div>

                        {/* Form Side */}
                        <div className="lg:col-span-3 p-10 md:p-14 bg-white/50 backdrop-blur-sm border-r border-gray-100">
                            <form
                                action="https://formspree.io/f/your-form-id"
                                method="POST"
                                className="space-y-6 max-w-lg mx-auto lg:mx-0 p-8 rounded-3xl border border-gray-100 bg-white shadow-sm"
                            >
                                <input type="hidden" name="_subject" value="פנייה מהאתר של ברק" />

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-bold text-[var(--color-text)] mb-2">שם מלא</label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            required
                                            placeholder="ישראל ישראלי"
                                            className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary-light)]/50 outline-none transition-all bg-gray-50 focus:bg-white"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-bold text-[var(--color-text)] mb-2">טלפון</label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            placeholder="050-0000000"
                                            className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary-light)]/50 outline-none transition-all bg-gray-50 focus:bg-white"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-bold text-[var(--color-text)] mb-2">אימייל</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        required
                                        placeholder="your@email.com"
                                        className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary-light)]/50 outline-none transition-all bg-gray-50 focus:bg-white"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="message" className="block text-sm font-bold text-[var(--color-text)] mb-2">הודעה (אופציונלי)</label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        rows="4"
                                        placeholder="היי, אשמח לשמוע פרטים על..."
                                        className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary-light)]/50 outline-none transition-all bg-gray-50 focus:bg-white resize-none"
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    className="btn-shine w-full flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-lg transition-all transform hover:-translate-y-1 shadow-glow group bg-[var(--color-primary)] text-white"
                                >
                                    <span>שלחו פרטים</span>
                                    <Send size={20} className="group-hover:translate-x-1 transition-transform rtl:rotate-180" />
                                </button>

                                <p className="text-xs text-center text-[var(--color-text-muted)] mt-4">
                                    * הנתונים נשלחים ישירות למייל של ברק ולא מועברים לצד ג'.
                                </p>
                            </form>
                        </div>

                    </div>
                </motion.div>
            </div>
        </section>
    );
}
