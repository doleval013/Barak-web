import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Logo from './Logo';
import './TeamWorkshopLanding.css';
import {
    MessageCircle,
    Heart,
    Target,
    Award,
    Users,
    Sparkles,
    CheckCircle2,
    ArrowLeft,
    Building2,
    GraduationCap,
    Handshake,
    Phone,
    Mail,
    User,
    Send,
    Dog,
    Lightbulb,
    RefreshCw,
    Volume2
} from 'lucide-react';

function TeamWorkshopLanding() {
    const [formData, setFormData] = useState({
        name: '',
        company: '',
        phone: '',
        email: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate form submission - replace with actual endpoint
        try {
            // await fetch('/api/contact', { method: 'POST', body: JSON.stringify(formData) });
            await new Promise(resolve => setTimeout(resolve, 1000));
            setSubmitStatus('success');
            setFormData({ name: '', company: '', phone: '', email: '' });
        } catch (error) {
            setSubmitStatus('error');
        }
        setIsSubmitting(false);
    };

    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0 }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15 }
        }
    };

    return (
        <div className="min-h-screen bg-white" dir="rtl">

            {/* Navigation Bar */}
            <nav className="workshop-nav">
                <div className="workshop-nav-container">
                    <Logo href="/" />
                    <a href="/" className="workshop-back-link">
                        <span>חזרה</span>
                        <ArrowLeft />
                    </a>
                </div>
            </nav>

            {/* Hero Section with Video */}
            <section className="relative py-16 lg:py-20 flex items-center overflow-hidden">
                {/* Background Elements */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700" />
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />

                {/* Decorative Circles */}
                <motion.div
                    className="absolute top-20 left-10 w-72 h-72 bg-sky-400/20 rounded-full blur-3xl"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 8, repeat: Infinity }}
                />
                <motion.div
                    className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"
                    animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 10, repeat: Infinity }}
                />

                <div className="relative z-10 max-w-7xl mx-auto px-6 py-8 w-full">
                    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                        {/* Text Content - Right Side (RTL) */}
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={staggerContainer}
                            className="text-center lg:text-right"
                        >
                            {/* Main Title */}
                            <motion.h1
                                variants={fadeInUp}
                                className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
                                style={{ opacity: 1 }}
                            >
                                סדנת כלבנות
                                <span className="block text-sky-300">לפיתוח צוותים</span>
                            </motion.h1>

                            {/* Sub-headline */}
                            <motion.p
                                variants={fadeInUp}
                                className="text-xl md:text-2xl text-blue-100 mb-4 leading-relaxed"
                                style={{ opacity: 1 }}
                            >
                                חוויה ציוותית שמחזקת תקשורת, אמון ושיתוף פעולה.
                            </motion.p>

                            <motion.p
                                variants={fadeInUp}
                                className="text-lg text-blue-200/80 mb-8"
                            >
                                סדנת כלבנות לפיתוח הצוות היא חוויה לצוותי עובדים בחברות, ארגונים ומוסדות.
                                <br />
                                הסדנה מאפשרת לצוות -  לשבור את מהשגרה, להתחבר מחדש ולחוות תקשורת אפקטיבית -
                                דרך עשייה, למידה וחוויה משותפת.
                            </motion.p>

                            {/* CTA Button - Desktop Only */}
                            <motion.div variants={fadeInUp} className="hidden lg:block">
                                <a
                                    href="#contact"
                                    className="inline-flex items-center gap-3 bg-white hover:bg-sky-50 text-blue-900 font-bold text-lg px-8 py-4 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-white/25"
                                >
                                    <span>לבדיקת התאמה לצוות</span>
                                    <ArrowLeft className="w-5 h-5" />
                                </a>
                            </motion.div>
                        </motion.div>

                        {/* Video - Left Side (RTL) */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className="relative"
                        >
                            {/* Video Glow Effect */}
                            <div className="absolute -inset-4 bg-gradient-to-r from-sky-400/30 to-blue-600/30 rounded-3xl blur-2xl" />

                            {/* Video Container */}
                            <div className="relative aspect-video bg-black/20 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
                                <iframe
                                    src="https://www.youtube.com/embed/kZMeB9DZNAs?rel=0"
                                    title="סדנת כלבנות לצוותים"
                                    className="w-full h-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        </motion.div>
                    </div>

                    {/* CTA Button - Mobile Only (Below Video) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                        className="lg:hidden mt-8 text-center"
                    >
                        <a
                            href="#contact"
                            className="inline-flex items-center gap-3 bg-white hover:bg-sky-50 text-blue-900 font-bold text-lg px-8 py-4 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-white/25"
                        >
                            <span>לבדיקת התאמה לצוות</span>
                            <ArrowLeft className="w-5 h-5" />
                        </a>
                    </motion.div>
                </div>

                {/* Bottom Wave */}
                <div className="absolute -bottom-1 left-0 right-0">
                    <svg viewBox="0 0 1440 120" fill="none" preserveAspectRatio="none" className="w-full h-[80px] block">
                        <path d="M0 60L48 55C96 50 192 40 288 45C384 50 480 70 576 75C672 80 768 70 864 60C960 50 1056 40 1152 45C1248 50 1344 70 1392 80L1440 90V120H0V60Z" fill="#f8fafc" />
                    </svg>
                </div>
            </section>

            {/* Target Audience Section */}
            <section className="py-24 bg-slate-50">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={staggerContainer}
                    >
                        <motion.h2
                            variants={fadeInUp}
                            className="text-3xl md:text-4xl font-bold text-slate-800 mb-24"
                        >
                            הסדנה מיועדת לצוותי עובדים
                        </motion.h2>

                        <motion.div
                            variants={fadeInUp}
                            className="flex flex-wrap justify-center gap-4"
                        >
                            {[
                                { icon: Building2, label: 'חברות וארגונים' },
                                { icon: GraduationCap, label: 'צוותי חינוך והדרכה' },
                                { icon: Heart, label: 'צוותי רווחה' },
                                { icon: Users, label: 'צוותי ניהול' }
                            ].map((audience, index) => (
                                <motion.div
                                    key={index}
                                    whileHover={{ scale: 1.05 }}
                                    className="flex items-center gap-3 bg-white hover:bg-blue-100 px-6 py-3 rounded-full transition-colors duration-300 shadow-sm"
                                >
                                    <audience.icon className="w-5 h-5 text-blue-600" />
                                    <span className="font-medium text-slate-700">{audience.label}</span>
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Workshop Value Section */}
            <section className="py-24 bg-white">
                <div className="max-w-5xl mx-auto px-6">
                    {/* Section Header */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={staggerContainer}
                        className="text-center mb-16"
                    >
                        <motion.h2
                            variants={fadeInUp}
                            className="text-4xl md:text-5xl font-bold text-slate-800 mb-6"
                        >
                            מה בסדנה ומה הערך לארגון?
                        </motion.h2>
                        <motion.p
                            variants={fadeInUp}
                            className="text-xl text-slate-600 max-w-2xl mx-auto"
                        >
                            חוויה מעשית שמחברת בין עקרונות האילוף המודרני לעולם הניהול והעבודה בצוות
                        </motion.p>
                    </motion.div>

                    {/* Value Cards */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-50px" }}
                        variants={staggerContainer}
                        className="grid md:grid-cols-2 gap-6 mb-12"
                    >
                        {[
                            {
                                icon: Volume2,
                                title: 'יצירת שפה משותפת',
                                description: 'בניית תקשורת ברורה ומדויקת בצוות',
                                benefit: 'שיפור תקשורת ושיתוף פעולה'
                            },
                            {
                                icon: Target,
                                title: 'השפעה והובלה ללא כוחנות',
                                description: 'למידה של דרכים להשפיע ולהניע בלי לכפות',
                                benefit: 'ניהול אפקטיבי יותר'
                            },
                            {
                                icon: Award,
                                title: 'חיזוק חיובי ככלי עבודה',
                                description: 'שימוש בתגמול והכרה להנעת אנשים',
                                benefit: 'שבירת שגרה עם ערך'
                            },
                            {
                                icon: Heart,
                                title: 'הקשבה, אמון וחיבור',
                                description: 'חיזוק היכולת להקשיב ולהבין את הצוות',
                                benefit: 'חיזוק חיבור ואמון'
                            }
                        ].map((item, index) => (
                            <motion.div
                                key={index}
                                variants={fadeInUp}
                                whileHover={{ scale: 1.02 }}
                                className="p-8 bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300"
                            >
                                <div className="flex items-start gap-5">
                                    <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center">
                                        <item.icon className="w-7 h-7 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-slate-800 mb-2">{item.title}</h3>
                                        <p className="text-slate-600 mb-3">{item.description}</p>
                                        <div className="flex items-center gap-2 text-blue-600 font-medium">
                                            <CheckCircle2 className="w-4 h-4" />
                                            <span>{item.benefit}</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Bottom Note */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center bg-blue-50 rounded-2xl p-8 border border-blue-100"
                    >
                        <p className="text-lg text-slate-700">
                            החוויה מלווה בשיח ממוקד שמחבר בין ההתנסות לבין המציאות הארגונית -
                            <span className="font-bold text-blue-600"> תובנות שנשארות גם אחרי הסדנה.</span>
                        </p>
                    </motion.div>
                </div>
            </section>


            {/* Contact Form Section */}
            <section id="contact" className="py-24 bg-gradient-to-b from-blue-900 to-blue-950">
                <div className="max-w-4xl mx-auto px-6">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={staggerContainer}
                        className="text-center mb-12"
                    >
                        <motion.h2
                            variants={fadeInUp}
                            className="text-3xl md:text-4xl font-bold text-white mb-4"
                        >
                            רוצים לבדוק התאמה לצוות שלכם?
                        </motion.h2>
                        <motion.p
                            variants={fadeInUp}
                            className="text-blue-200 text-lg"
                        >
                            השאירו פרטים ונחזור אליכם לשיחה קצרה
                        </motion.p>
                    </motion.div>

                    <motion.form
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        onSubmit={handleSubmit}
                        className="bg-white/10 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-white/20"
                    >
                        <div className="grid md:grid-cols-2 gap-6 mb-8">
                            {/* Name */}
                            <div className="relative">
                                <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300" />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="שם מלא"
                                    required
                                    className="w-full bg-white/10 border border-white/20 rounded-xl py-4 pr-12 pl-4 text-white placeholder-blue-300/70 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 transition-all"
                                />
                            </div>

                            {/* Company */}
                            <div className="relative">
                                <Building2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300" />
                                <input
                                    type="text"
                                    name="company"
                                    value={formData.company}
                                    onChange={handleInputChange}
                                    placeholder="שם החברה/הארגון"
                                    required
                                    className="w-full bg-white/10 border border-white/20 rounded-xl py-4 pr-12 pl-4 text-white placeholder-blue-300/70 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 transition-all"
                                />
                            </div>

                            {/* Phone */}
                            <div className="relative">
                                <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300" />
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    placeholder="טלפון"
                                    required
                                    className="w-full bg-white/10 border border-white/20 rounded-xl py-4 pr-12 pl-4 text-white placeholder-blue-300/70 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 transition-all"
                                />
                            </div>

                            {/* Email */}
                            <div className="relative">
                                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="אימייל"
                                    required
                                    className="w-full bg-white/10 border border-white/20 rounded-xl py-4 pr-12 pl-4 text-white placeholder-blue-300/70 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 transition-all"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <motion.button
                            type="submit"
                            disabled={isSubmitting}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            style={{ backgroundColor: '#ffffff' }}
                            className="w-full text-blue-900 font-bold text-lg py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl"
                        >
                            {isSubmitting ? (
                                <span>שולח...</span>
                            ) : (
                                <>
                                    <span>שליחה</span>
                                    <Send className="w-5 h-5" />
                                </>
                            )}
                        </motion.button>

                        {/* Success/Error Messages */}
                        {submitStatus === 'success' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-6 text-center text-sky-300 bg-sky-500/20 rounded-xl py-4"
                            >
                                ✓ הפרטים נשלחו בהצלחה! נחזור אליכם בהקדם.
                            </motion.div>
                        )}

                        {submitStatus === 'error' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-6 text-center text-red-300 bg-red-500/20 rounded-xl py-4"
                            >
                                אירעה שגיאה. אנא נסו שוב.
                            </motion.div>
                        )}
                    </motion.form>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 bg-blue-950 text-center">
                <p className="text-blue-400/60 text-sm">
                    © {new Date().getFullYear()} ברק אלוני - סדנאות כלבנות לפיתוח צוותים
                </p>
            </footer>
        </div>
    );
}

export default TeamWorkshopLanding;
