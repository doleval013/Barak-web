import React, { useState } from 'react';
import { motion } from 'framer-motion';
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

            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex items-center overflow-hidden">
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

                <div className="relative z-10 max-w-6xl mx-auto px-6 py-20">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={staggerContainer}
                        className="text-center"
                    >
                        {/* Main Title */}
                        <motion.h1
                            variants={fadeInUp}
                            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
                            style={{ opacity: 1 }}
                        >
                            סדנת כלבנות
                            <span className="block text-sky-300">לפיתוח צוותים</span>
                        </motion.h1>

                        {/* Sub-headline */}
                        <motion.p
                            variants={fadeInUp}
                            className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-6 leading-relaxed"
                            style={{ opacity: 1 }}
                        >
                            חוויה ציוותית שמחזקת תקשורת, אמון ושיתוף פעולה.
                        </motion.p>

                        <motion.p
                            variants={fadeInUp}
                            className="text-lg text-blue-200/80 max-w-2xl mx-auto mb-8"
                        >
                            סדנת כלבנות לפיתוח הצוות היא חוויה לצוותי עובדים בחברות, ארגונים ומוסדות.
                            <br />
                            הסדנה מאפשרת לצוות -  לשבור את מהשגרה, להתחבר מחדש ולחוות תקשורת אפקטיבית -
                            דרך עשייה, למידה וחוויה משותפת.
                        </motion.p>

                        {/* CTA Button */}
                        <motion.div variants={fadeInUp}>
                            <a
                                href="#contact"
                                className="inline-flex items-center gap-3 bg-white hover:bg-sky-50 text-blue-900 font-bold text-lg px-8 py-4 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-white/25"
                            >
                                <span>לבדיקת התאמה לצוות</span>
                                <ArrowLeft className="w-5 h-5" />
                            </a>
                        </motion.div>
                    </motion.div>
                </div>

                {/* Bottom Wave */}
                <div className="absolute -bottom-1 left-0 right-0">
                    <svg viewBox="0 0 1440 120" fill="none" preserveAspectRatio="none" className="w-full h-[80px] block">
                        <path d="M0 60L48 55C96 50 192 40 288 45C384 50 480 70 576 75C672 80 768 70 864 60C960 50 1056 40 1152 45C1248 50 1344 70 1392 80L1440 90V120H0V60Z" fill="#f8fafc" />
                    </svg>
                </div>
            </section>

            {/* Why Cynology Section */}
            <section className="py-24 bg-slate-50">
                <div className="max-w-4xl mx-auto px-6">
                    {/* VIDEO PLACEHOLDER - Replace with your teams video */}
                    <div className="aspect-video bg-slate-200 rounded-2xl flex items-center justify-center">
                        <p className="text-slate-500 text-lg">כאן יוצג הסרטון לצוותים</p>
                    </div>
                </div>
            </section>

            {/* What Happens Section */}
            <section className="py-24 bg-white">
                <div className="max-w-6xl mx-auto px-6">
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
                            מה קורה בסדנה?
                        </motion.h2>
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-50px" }}
                        variants={staggerContainer}
                        className="grid md:grid-cols-2 gap-8"
                    >
                        {[
                            { icon: Volume2, title: 'יצירת שפה משותפת', description: 'בניית מילון תקשורת משותף לצוות' },
                            { icon: Target, title: 'השפעה והובלה ללא כוחנות', description: 'למידה של דרכים להשפיע בלי לכפות' },
                            { icon: Award, title: 'חיזוק חיובי ככלי עבודה', description: 'שימוש בתגמול והכרה לשיפור ביצועים' },
                            { icon: Handshake, title: 'הקשבה ודיוק', description: 'פיתוח יכולת הקשבה והבנה מדויקת' }
                        ].map((item, index) => (
                            <motion.div
                                key={index}
                                variants={fadeInUp}
                                whileHover={{ scale: 1.02 }}
                                className="flex gap-6 p-8 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all duration-300"
                            >
                                <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center">
                                    <item.icon className="w-7 h-7 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800 mb-2">{item.title}</h3>
                                    <p className="text-slate-600">{item.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Context Note */}
                    <div className="flex justify-center w-full mt-12">
                        <motion.p
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="text-slate-600 text-lg text-center"
                        >
                            החוויה מלווה בשיח ממוקד שמחבר בין ההתנסות לבין המציאות הארגונית.
                        </motion.p>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-24 bg-gradient-to-b from-slate-100 to-slate-50">
                <div className="max-w-6xl mx-auto px-6">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={staggerContainer}
                        className="grid lg:grid-cols-2 gap-16 items-center"
                    >
                        {/* Content */}
                        <motion.div variants={fadeInUp}>
                            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-12">
                                מה הארגון מרוויח?
                            </h2>

                            <div className="space-y-6">
                                {[
                                    'שבירת שגרה עם ערך',
                                    'חיזוק חיבור ואמון',
                                    'שיפור תקשורת ושיתוף פעולה'
                                ].map((benefit, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: 20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.15 }}
                                        className="flex items-center gap-4"
                                    >
                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                                            <CheckCircle2 className="w-5 h-5 text-white" />
                                        </div>
                                        <span className="text-xl text-slate-700 font-medium">{benefit}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Visual */}
                        <motion.div
                            variants={fadeInUp}
                            className="relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-200 to-sky-100 rounded-3xl transform rotate-3" />
                            <div className="relative bg-white rounded-3xl p-10 shadow-xl">
                                <div className="grid grid-cols-2 gap-6">
                                    {[
                                        { icon: Users, label: 'צוותיות', value: '+40%' },
                                        { icon: MessageCircle, label: 'תקשורת', value: '+55%' },
                                        { icon: Heart, label: 'אמון', value: '+35%' },
                                        { icon: Sparkles, label: 'מוטיבציה', value: '+45%' }
                                    ].map((stat, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            whileInView={{ opacity: 1, scale: 1 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: index * 0.1 }}
                                            className="text-center p-4"
                                        >
                                            <stat.icon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                                            <div className="text-3xl font-bold text-blue-600">{stat.value}</div>
                                            <div className="text-slate-500 text-sm">{stat.label}</div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Target Audience Section */}
            <section className="py-20 bg-white">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={staggerContainer}
                    >
                        <motion.h2
                            variants={fadeInUp}
                            className="text-3xl md:text-4xl font-bold text-slate-800 mb-8"
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
                                    className="flex items-center gap-3 bg-slate-100 hover:bg-blue-100 px-6 py-3 rounded-full transition-colors duration-300"
                                >
                                    <audience.icon className="w-5 h-5 text-blue-600" />
                                    <span className="font-medium text-slate-700">{audience.label}</span>
                                </motion.div>
                            ))}
                        </motion.div>
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
