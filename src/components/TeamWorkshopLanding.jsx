import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Logo from './Logo';
import './TeamWorkshopLanding.css';
import { useLanguage } from '../context/LanguageContext';
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
    Volume2,
    Globe,
    ArrowRight
} from 'lucide-react';

const translations = {
    he: {
        back: 'חזרה',
        hero_title_1: 'סדנת כלבנות',
        hero_title_highlight: 'לפיתוח צוותים',
        hero_subtitle: 'חוויה ציוותית שמחזקת תקשורת, אמון ושיתוף פעולה.',
        hero_description: `סדנת כלבנות לפיתוח הצוות היא חוויה לצוותי עובדים בחברות, ארגונים ומוסדות.
הסדנה מאפשרת לצוות - לשבור את מהשגרה, להתחבר מחדש ולחוות תקשורת אפקטיבית -
דרך עשייה, למידה וחוויה משותפת.`,
        cta_check: 'לבדיקת התאמה לצוות',
        audience_title: 'הסדנה מיועדת לצוותי עובדים',
        audience_companies: 'חברות וארגונים',
        audience_education: 'צוותי חינוך והדרכה',
        audience_welfare: 'צוותי רווחה',
        audience_management: 'צוותי ניהול',
        value_title: 'מה בסדנה ומה הערך לארגון?',
        value_subtitle: 'חוויה מעשית שמחברת בין עקרונות האילוף המודרני לעולם הניהול והעבודה בצוות',
        value_1_title: 'יצירת שפה משותפת',
        value_1_desc: 'בניית תקשורת ברורה ומדויקת בצוות',
        value_1_benefit: 'שיפור תקשורת ושיתוף פעולה',
        value_2_title: 'השפעה והובלה ללא כוחנות',
        value_2_desc: 'למידה של דרכים להשפיע ולהניע בלי לכפות',
        value_2_benefit: 'ניהול אפקטיבי יותר',
        value_3_title: 'חיזוק חיובי ככלי עבודה',
        value_3_desc: 'שימוש בתגמול והכרה להנעת אנשים',
        value_3_benefit: 'שבירת שגרה עם ערך',
        value_4_title: 'הקשבה, אמון וחיבור',
        value_4_desc: 'חיזוק היכולת להקשיב ולהבין את הצוות',
        value_4_benefit: 'חיזוק חיבור ואמון',
        contact_title: 'רוצים לבדוק התאמה לצוות שלכם?',
        contact_subtitle: 'השאירו פרטים ונחזור אליכם לשיחה קצרה',
        form_name: 'שם מלא',
        form_company: 'שם החברה/הארגון',
        form_phone: 'טלפון (מספרים בלבד)',
        form_email: 'אימייל',
        form_submit: 'שליחה',
        form_sending: 'שולח...',
        error_phone: 'מספר הטלפון אינו תקין. יש להזין 9-10 ספרות, למשל: 0501234567',
        success_msg: '✓ הפרטים נשלחו בהצלחה! נחזור אליכם בהקדם.',
        error_msg: 'אירעה שגיאה. אנא נסו שוב.',
        footer_text: '© 2024 ברק אלוני - סדנאות כלבנות לפיתוח צוותים'
    },
    en: {
        back: 'Back',
        hero_title_1: 'Dog Training Workshop',
        hero_title_highlight: 'For Team Development',
        hero_subtitle: 'A team experience that strengthens communication, trust through action.',
        hero_description: `The Dog Training Workshop for Team Development is an experience for corporate teams, organizations, and institutions.
The workshop allows the team to break the routine, reconnect, and experience effective communication through action, learning, and shared experience.`,
        cta_check: 'Check Team Suitability',
        audience_title: 'The Workshop is Designed for Teams',
        audience_companies: 'Companies & Organizations',
        audience_education: 'Education & Training Teams',
        audience_welfare: 'Welfare Teams',
        audience_management: 'Management Teams',
        value_title: 'The Workshop & Organizational Value',
        value_subtitle: 'A practical experience bridging modern dog training principles with management and teamwork.',
        value_1_title: 'Creating a Common Language',
        value_1_desc: 'Building clear and precise team communication',
        value_1_benefit: 'Improved Communication',
        value_2_title: 'Influence Without Force',
        value_2_desc: 'Learning ways to influence and motivate without coercion',
        value_2_benefit: 'More Effective Management',
        value_3_title: 'Positive Reinforcement',
        value_3_desc: 'Using reward and recognition to motivate people',
        value_3_benefit: 'Meaningful Routine Break',
        value_4_title: 'Listening, Trust & Connection',
        value_4_desc: 'Strengthening the ability to listen and understand the team',
        value_4_benefit: 'Strengthening Trust',
        contact_title: 'Want to Check Suitability?',
        contact_subtitle: 'Leave your details and we will get back to you shortly.',
        form_name: 'Full Name',
        form_company: 'Company/Organization Name',
        form_phone: 'Phone (Numbers only)',
        form_email: 'Email',
        form_submit: 'Send',
        form_sending: 'Sending...',
        error_phone: 'Invalid phone number. Please enter 9-10 digits.',
        success_msg: '✓ Details sent successfully! We will get back to you soon.',
        error_msg: 'An error occurred. Please try again.',
        footer_text: '© 2024 Barak Aloni - Dog Training Workshops for Team Development'
    }
};

function TeamWorkshopLanding() {
    const { language, toggleLanguage } = useLanguage();
    const isRTL = language === 'he';
    const ArrowBack = isRTL ? ArrowRight : ArrowLeft;
    const ArrowNext = isRTL ? ArrowLeft : ArrowRight;

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
        <div className="workshop-page" dir={isRTL ? 'rtl' : 'ltr'} style={{ direction: isRTL ? 'rtl' : 'ltr' }}>

            {/* Navigation Bar */}
            <nav className="workshop-nav">
                <div className="workshop-nav-container">
                    <Logo href="/" />
                    <div className="workshop-nav-controls">
                        <button
                            onClick={toggleLanguage}
                            className="workshop-lang-btn"
                        >
                            <Globe size={20} />
                            <span>{language === 'he' ? 'EN' : 'עב'}</span>
                        </button>
                        <a href="/" className="workshop-back-link">
                            <ArrowBack />
                            <span>{translations[language].back}</span>
                        </a>
                    </div>
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
                                {translations[language].hero_title_1}
                                <span className="workshop-hero-title-highlight">{translations[language].hero_title_highlight}</span>
                            </motion.h1>

                            <motion.p variants={fadeInUp} className="workshop-hero-subtitle">
                                {translations[language].hero_subtitle}
                            </motion.p>

                            <motion.p variants={fadeInUp} className="workshop-hero-description">
                                {translations[language].hero_description}
                            </motion.p>

                            {/* CTA Button - Desktop Only */}
                            <motion.div variants={fadeInUp} className="workshop-cta-desktop">
                                <a href="#contact" className="workshop-cta-btn">
                                    <span>{translations[language].cta_check}</span>
                                    <ArrowNext />
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
                            <span>{translations[language].cta_check}</span>
                            <ArrowNext />
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
                            {translations[language].audience_title}
                        </motion.h2>

                        <motion.div variants={fadeInUp} className="workshop-audience-grid">
                            {[
                                { icon: Building2, label: translations[language].audience_companies },
                                { icon: GraduationCap, label: translations[language].audience_education },
                                { icon: Heart, label: translations[language].audience_welfare },
                                { icon: Users, label: translations[language].audience_management }
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
                            {translations[language].value_title}
                        </motion.h2>
                        <motion.p variants={fadeInUp} className="workshop-value-subtitle">
                            {translations[language].value_subtitle}
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
                                title: translations[language].value_1_title,
                                description: translations[language].value_1_desc,
                                benefit: translations[language].value_1_benefit
                            },
                            {
                                icon: Target,
                                title: translations[language].value_2_title,
                                description: translations[language].value_2_desc,
                                benefit: translations[language].value_2_benefit
                            },
                            {
                                icon: Award,
                                title: translations[language].value_3_title,
                                description: translations[language].value_3_desc,
                                benefit: translations[language].value_3_benefit
                            },
                            {
                                icon: Heart,
                                title: translations[language].value_4_title,
                                description: translations[language].value_4_desc,
                                benefit: translations[language].value_4_benefit
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
                            {translations[language].contact_title}
                        </motion.h2>
                        <motion.p variants={fadeInUp} className="workshop-contact-subtitle">
                            {translations[language].contact_subtitle}
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
                                    placeholder={translations[language].form_name}
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
                                    placeholder={translations[language].form_company}
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
                                    placeholder={translations[language].form_phone}
                                    required
                                    className={`workshop-input ${submitStatus === 'invalid_phone' ? 'workshop-input--error' : ''}`}
                                    dir="ltr"
                                    style={{ textAlign: isRTL ? 'right' : 'left' }}
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
                                    placeholder={translations[language].form_email}
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
                                {translations[language].error_phone}
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
                                <span>{translations[language].form_sending}</span>
                            ) : (
                                <>
                                    <span>{translations[language].form_submit}</span>
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
                                {translations[language].success_msg}
                            </motion.div>
                        )}

                        {submitStatus === 'error' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="workshop-form-message workshop-form-message--error"
                            >
                                {translations[language].error_msg}
                            </motion.div>
                        )}
                    </motion.form>
                </div>
            </section >

            {/* Footer */}
            < footer className="workshop-footer" >
                <p>
                    {translations[language].footer_text}
                </p>
            </footer >
        </div >
    );
}

export default TeamWorkshopLanding;
