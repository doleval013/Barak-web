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

        // Reset error state on interaction
        if (submitStatus === 'invalid_phone' && name === 'phone') {
            setSubmitStatus(null);
        }

        // Enforce numbers only for phone field
        if (name === 'phone') {
            const numericValue = value.replace(/\D/g, ''); // Remove non-digits
            setFormData(prev => ({ ...prev, [name]: numericValue }));
            return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validatePhone = (phone) => {
        // Basic Israeli phone validation: 9-10 digits, starts with 0
        const phoneRegex = /^0\d{8,9}$/;
        return phoneRegex.test(phone);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate Phone
        if (!validatePhone(formData.phone)) {
            setSubmitStatus('invalid_phone');
            return;
        }

        setIsSubmitting(true);
        setSubmitStatus(null);

        // Simulate form submission - replace with actual endpoint
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            setSubmitStatus('success');
            setFormData({ name: '', company: '', phone: '', email: '' });
        } catch (error) {
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
            // Automatically clear status message after a few seconds
            setTimeout(() => setSubmitStatus(null), 5000);
        }
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
        <div className="workshop-page">

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
            <section className="workshop-hero">
                <div className="workshop-hero-bg" />
                <div className="workshop-hero-pattern" />

                {/* Decorative Circles */}
                <motion.div
                    className="workshop-hero-circle-1"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 8, repeat: Infinity }}
                />
                <motion.div
                    className="workshop-hero-circle-2"
                    animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 10, repeat: Infinity }}
                />

                <div className="workshop-hero-content">
                    <div className="workshop-hero-grid">
                        {/* Text Content */}
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={staggerContainer}
                            className="workshop-hero-text"
                        >
                            <motion.h1 variants={fadeInUp} className="workshop-hero-title">
                                סדנת כלבנות
                                <span className="workshop-hero-title-highlight">לפיתוח צוותים</span>
                            </motion.h1>

                            <motion.p variants={fadeInUp} className="workshop-hero-subtitle">
                                חוויה ציוותית שמחזקת תקשורת, אמון ושיתוף פעולה.
                            </motion.p>

                            <motion.p variants={fadeInUp} className="workshop-hero-description">
                                סדנת כלבנות לפיתוח הצוות היא חוויה לצוותי עובדים בחברות, ארגונים ומוסדות.
                                <br />
                                הסדנה מאפשרת לצוות - לשבור את מהשגרה, להתחבר מחדש ולחוות תקשורת אפקטיבית -
                                דרך עשייה, למידה וחוויה משותפת.
                            </motion.p>

                            {/* CTA Button - Desktop Only */}
                            <motion.div variants={fadeInUp} className="workshop-cta-desktop">
                                <a href="#contact" className="workshop-cta-btn">
                                    <span>לבדיקת התאמה לצוות</span>
                                    <ArrowLeft />
                                </a>
                            </motion.div>
                        </motion.div>

                        {/* Video */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className="workshop-video-wrapper"
                        >
                            <div className="workshop-video-container">
                                {/* Floating Icons */}
                                <motion.div
                                    className="workshop-floating-icon workshop-floating-icon--users"
                                    animate={{ y: [0, -8, 0], rotate: [0, 5, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                >
                                    <div className="workshop-floating-badge workshop-floating-badge--amber">
                                        <Users />
                                    </div>
                                </motion.div>

                                <motion.div
                                    className="workshop-floating-icon workshop-floating-icon--heart"
                                    animate={{ y: [0, 6, 0], rotate: [0, -5, 0] }}
                                    transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                                >
                                    <div className="workshop-floating-badge workshop-floating-badge--rose">
                                        <Heart />
                                    </div>
                                </motion.div>

                                <motion.div
                                    className="workshop-floating-icon workshop-floating-icon--handshake"
                                    animate={{ x: [0, -5, 0], scale: [1, 1.1, 1] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                >
                                    <div className="workshop-floating-badge workshop-floating-badge--sky">
                                        <Handshake />
                                    </div>
                                </motion.div>

                                {/* Video Frame */}
                                <div className="workshop-video-frame">
                                    <iframe
                                        src="https://www.youtube.com/embed/kZMeB9DZNAs?rel=0"
                                        title="סדנת כלבנות לצוותים"
                                        className="workshop-video-iframe"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* CTA Button - Mobile Only */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                        className="workshop-cta-mobile"
                    >
                        <a href="#contact" className="workshop-cta-btn">
                            <span>לבדיקת התאמה לצוות</span>
                            <ArrowLeft />
                        </a>
                    </motion.div>
                </div>

                {/* Wave */}
                <div className="workshop-hero-wave">
                    <svg viewBox="0 0 1440 120" fill="none" preserveAspectRatio="none">
                        <path d="M0 60L48 55C96 50 192 40 288 45C384 50 480 70 576 75C672 80 768 70 864 60C960 50 1056 40 1152 45C1248 50 1344 70 1392 80L1440 90V120H0V60Z" fill="#f8fafc" />
                    </svg>
                </div>
            </section>

            {/* Target Audience Section */}
            <section className="workshop-audience">
                <div className="workshop-audience-container">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={staggerContainer}
                    >
                        <motion.h2 variants={fadeInUp} className="workshop-audience-title">
                            הסדנה מיועדת לצוותי עובדים
                        </motion.h2>

                        <motion.div variants={fadeInUp} className="workshop-audience-grid">
                            {[
                                { icon: Building2, label: 'חברות וארגונים' },
                                { icon: GraduationCap, label: 'צוותי חינוך והדרכה' },
                                { icon: Heart, label: 'צוותי רווחה' },
                                { icon: Users, label: 'צוותי ניהול' }
                            ].map((audience, index) => (
                                <motion.div
                                    key={index}
                                    whileHover={{ scale: 1.05 }}
                                    className="workshop-audience-item"
                                >
                                    <audience.icon />
                                    <span>{audience.label}</span>
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Workshop Value Section */}
            <section className="workshop-value">
                <div className="workshop-value-container">
                    {/* Section Header */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={staggerContainer}
                        className="workshop-value-header"
                    >
                        <motion.h2 variants={fadeInUp} className="workshop-value-title">
                            מה בסדנה ומה הערך לארגון?
                        </motion.h2>
                        <motion.p variants={fadeInUp} className="workshop-value-subtitle">
                            חוויה מעשית שמחברת בין עקרונות האילוף המודרני לעולם הניהול והעבודה בצוות
                        </motion.p>
                    </motion.div>

                    {/* Value Cards */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-50px" }}
                        variants={staggerContainer}
                        className="workshop-value-grid"
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
                                className="workshop-value-card"
                            >
                                <div className="workshop-value-card-content">
                                    <div className="workshop-value-card-icon">
                                        <item.icon />
                                    </div>
                                    <div className="workshop-value-card-text">
                                        <h3>{item.title}</h3>
                                        <p>{item.description}</p>
                                        <div className="workshop-value-card-benefit">
                                            <CheckCircle2 />
                                            <span>{item.benefit}</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>


                </div>
            </section>


            {/* Contact Form Section */}
            <section id="contact" className="workshop-contact">
                <div className="workshop-contact-container">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={staggerContainer}
                        className="workshop-contact-header"
                    >
                        <motion.h2 variants={fadeInUp} className="workshop-contact-title">
                            רוצים לבדוק התאמה לצוות שלכם?
                        </motion.h2>
                        <motion.p variants={fadeInUp} className="workshop-contact-subtitle">
                            השאירו פרטים ונחזור אליכם לשיחה קצרה
                        </motion.p>
                    </motion.div>

                    <motion.form
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        onSubmit={handleSubmit}
                        className="workshop-form"
                    >
                        <div className="workshop-form-grid">
                            {/* Name */}
                            <div className="workshop-input-group">
                                <User className="workshop-input-icon" />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="שם מלא"
                                    required
                                    className="workshop-input"
                                />
                            </div>

                            {/* Company */}
                            <div className="workshop-input-group">
                                <Building2 className="workshop-input-icon" />
                                <input
                                    type="text"
                                    name="company"
                                    value={formData.company}
                                    onChange={handleInputChange}
                                    placeholder="שם החברה/הארגון"
                                    className="workshop-input"
                                />
                            </div>

                            {/* Phone */}
                            <div className="workshop-input-group">
                                <Phone className="workshop-input-icon" />
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    placeholder="טלפון (מספרים בלבד)"
                                    required
                                    className={`workshop-input ${submitStatus === 'invalid_phone' ? 'workshop-input--error' : ''}`}
                                    dir="ltr"
                                    style={{ textAlign: 'right' }}
                                />
                            </div>

                            {/* Email */}
                            <div className="workshop-input-group">
                                <Mail className="workshop-input-icon" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="אימייל"
                                    className="workshop-input"
                                />
                            </div>
                        </div>

                        {submitStatus === 'invalid_phone' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="workshop-form-message workshop-form-message--error"
                            >
                                מספר הטלפון אינו תקין. יש להזין 9-10 ספרות, למשל: 0501234567
                            </motion.div>
                        )}

                        {/* Submit Button */}
                        <motion.button
                            type="submit"
                            disabled={isSubmitting}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="workshop-submit-btn"
                        >
                            {isSubmitting ? (
                                <span>שולח...</span>
                            ) : (
                                <>
                                    <span>שליחה</span>
                                    <Send />
                                </>
                            )}
                        </motion.button>

                        {/* Success/Error Messages */}
                        {submitStatus === 'success' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="workshop-form-message workshop-form-message--success"
                            >
                                ✓ הפרטים נשלחו בהצלחה! נחזור אליכם בהקדם.
                            </motion.div>
                        )}

                        {submitStatus === 'error' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="workshop-form-message workshop-form-message--error"
                            >
                                אירעה שגיאה. אנא נסו שוב.
                            </motion.div>
                        )}
                    </motion.form>
                </div>
            </section >

            {/* Footer */}
            < footer className="workshop-footer" >
                <p>
                    © {new Date().getFullYear()} ברק אלוני - סדנאות כלבנות לפיתוח צוותים
                </p>
            </footer >
        </div >
    );
}

export default TeamWorkshopLanding;
