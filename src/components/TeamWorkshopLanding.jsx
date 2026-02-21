import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from './Logo';
import './TeamWorkshopLanding.css';
import { useLanguage } from '../context/LanguageContext';
import {
    Phone,
    Mail,
    User,
    Send,
    Building2,
    Globe,
    ArrowLeft,
    ArrowRight,
    X
} from 'lucide-react';
import imgFeed from '../assets/workshop/feed.jpg';
import imgGate from '../assets/workshop/gate.jpg';
import imgHighfive from '../assets/workshop/highfive.jpg';
import imgRelax from '../assets/workshop/relax.jpg';
import imgRelax2 from '../assets/workshop/relax2.jpg';

/* ============================================================
   MOBILE SLIDER COMPONENT
   ============================================================ */
const MobileSlider = ({ children }) => {
    const scrollRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            const isMobile = window.innerWidth <= 899;
            if (isMobile && scrollRef.current && !isHovered) {
                const scroller = scrollRef.current;
                const maxScroll = scroller.scrollWidth - scroller.clientWidth;
                if (maxScroll <= 0) return;

                const currentScroll = Math.abs(scroller.scrollLeft);
                if (currentScroll >= maxScroll - 10) {
                    scroller.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    const isRTL = document.documentElement.dir === 'rtl';
                    scroller.scrollBy({ left: isRTL ? -scroller.clientWidth : scroller.clientWidth, behavior: 'smooth' });
                }
            }
        }, 4000);
        return () => clearInterval(interval);
    }, [isHovered]);

    const scrollPrev = () => {
        if (scrollRef.current) {
            const scroller = scrollRef.current;
            const isRTL = document.documentElement.dir === 'rtl';
            const currentScroll = Math.abs(scroller.scrollLeft);
            const maxScroll = scroller.scrollWidth - scroller.clientWidth;

            if (currentScroll < 10) {
                // At the start, jump to the end
                scroller.scrollTo({ left: isRTL ? -maxScroll : maxScroll, behavior: 'smooth' });
            } else {
                const offset = isRTL ? scroller.clientWidth : -scroller.clientWidth;
                scroller.scrollBy({ left: offset, behavior: 'smooth' });
            }
        }
    };

    const scrollNext = () => {
        if (scrollRef.current) {
            const scroller = scrollRef.current;
            const isRTL = document.documentElement.dir === 'rtl';
            const currentScroll = Math.abs(scroller.scrollLeft);
            const maxScroll = scroller.scrollWidth - scroller.clientWidth;

            if (currentScroll >= maxScroll - 10) {
                // At the end, jump to the beginning
                scroller.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                const offset = isRTL ? -scroller.clientWidth : scroller.clientWidth;
                scroller.scrollBy({ left: offset, behavior: 'smooth' });
            }
        }
    };

    return (
        <div className="workshop-slider-wrapper">
            <button
                className="workshop-slider-arrow workshop-slider-arrow--prev"
                onClick={scrollPrev}
                aria-label="Previous image"
            >
                <ArrowLeft size={24} />
            </button>
            <div
                className="workshop-stack-scroller"
                ref={scrollRef}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onTouchStart={() => setIsHovered(true)}
                onTouchEnd={() => setTimeout(() => setIsHovered(false), 3000)}
            >
                {children}
            </div>
            <button
                className="workshop-slider-arrow workshop-slider-arrow--next"
                onClick={scrollNext}
                aria-label="Next image"
            >
                <ArrowRight size={24} />
            </button>
        </div>
    );
};

/* ============================================================
   TRANSLATIONS
   ============================================================ */
const translations = {
    he: {
        back: 'חזרה',
        hero_title_1: 'סדנת כלבנות',
        hero_title_highlight: 'לפיתוח צוותים',
        hero_subtitle: 'חווייה ציוותית שמחזקת תקשורת, אמון ושיתוף פעולה',
        hero_description: 'תקשורת היא מנוע הביצועים של כל צוות.\nכאשר המסר ברור, עקבי ומותאם – העבודה זורמת.\nכאשר הוא סותר או מעורפל – נוצרים חיכוך, שחיקה ופערי ביצוע.',
        cta_check: 'לבדיקת התאמה לצוות',

        intro_text_1: 'הסדנה מציעה תהליך למידה יישומי וחווייתי לפיתוח תקשורת אפקטיבית בצוות – תוך שילוב כלים פרקטיים שניתן ליישם באופן מיידי בשגרת העבודה.',
        intro_highlight: 'זו אינה הרצאה -',
        intro_text_2: 'זהו מרחב תרגול בזמן אמת, שבו המשתתפים מתנסים, מקבלים משוב מיידי ומדייקים את אופן העברת המסר שלהם.',
        intro_text_3: 'השילוב בין חוויה שוברת שגרה לבין למידה מקצועית עמוקה מייצר מעורבות גבוהה והטמעה מהירה.',

        practice_title: 'מה מתרגלים בפועל?',
        practice_1_title: 'שימוש בחיזוקים חיוביים',
        practice_1_desc: 'מהו חיזוק חיובי, כיצד הוא מייצר מחויבות ושיתוף פעולה – ואיך להשתמש בו באופן מודע במקום ביקורת שמייצרת התנגדות.',
        practice_2_title: 'זיהוי מסרים סותרים',
        practice_2_desc: 'הפער בין מילים, טון ושפת גוף – ואיך למנוע בלבול שמחליש סמכות ופוגע בביצועים.',
        practice_3_title: 'הגדרת פתרון בחיוב',
        practice_3_desc: 'מעבר מ"מה לא" ל"מה כן" – ליצירת בהירות, אחריות והתנהגות רצויה.',
        practice_4_title: 'עקביות והתמדה',
        practice_4_desc: 'כיצד בונים דפוס תקשורת שמייצר תוצאות לאורך זמן ולא רק מוטיבציה רגעית.',
        practice_5_title: 'התאמת מסר לסגנונות למידה (VARK)',
        practice_5_desc: 'ויזואלי | שמיעתי | קריאה/כתיבה | קינסתטי –\nואיך לוודא שהמסר נקלט באמת אצל כל חבר צוות.',

        why_dogs_title: 'למה השילוב עם כלב?',
        why_dogs_text_1: 'השילוב עם כלב אינו אלמנט בידורי – אלא מנגנון למידה שמייצר תוצאה ברורה. כלב מגיב באופן מיידי לבהירות, עקביות ואיכות המסר.',
        why_dogs_text_2: 'כאשר ההנחיה ברורה – מתקבלת תגובה. כאשר יש מסר סותר או חוסר דיוק – התוצאה מתעכבת או נכשלת.',
        why_dogs_text_3: 'המשוב המיידי הזה מאפשר לצוות לראות בזמן אמת את ההשפעה הישירה של תקשורת על ביצוע.',
        why_dogs_principles_title: 'העקרונות זהים לתקשורת צוותית:',
        why_dogs_principle_1: 'חיזוק חיובי מייצר מחויבות ולא התנגדות.',
        why_dogs_principle_2: 'בהירות מצמצמת טעויות וחוסכת זמן.',
        why_dogs_principle_3: 'עקביות מייצרת אמון.',
        why_dogs_principle_4: 'מסר מדויק משפר תפוקה.',
        why_dogs_experiential_1: 'בנוסף, הלמידה החווייתית רותמת את כלל המשתתפים, מעלה מעורבות ומייצרת פתיחות.',
        why_dogs_experiential_2: 'האינטראקציה הלא-שיפוטית מאפשרת לתרגל תקשורת בצורה ישירה, בטוחה וממוקדת תוצאה.',
        why_dogs_result_title: 'התוצאה:',
        why_dogs_result_1: 'תקשורת ממוקדת יותר.',
        why_dogs_result_2: 'פחות חיכוך פנימי.',
        why_dogs_result_3: 'פחות בזבוז אנרגיה על אי-הבנות.',
        why_dogs_result_4: 'יותר שיתוף פעולה ותיאום.',

        benefits_title: 'תועלות עסקיות לארגון',
        benefit_1: 'שיפור איכות ישיבות והעברת מסרים',
        benefit_2: 'קיצור זמני תיאום וביצוע',
        benefit_3: 'חיזוק שיתוף פעולה בין מחלקות',
        benefit_4: 'הפחתת קונפליקטים הנובעים מאי-הבנה',
        benefit_5: 'חיזוק מנהיגות ניהולית ויכולת הובלת צוות',
        benefit_6: 'חיזוק החיבור והאמון בין חברי הצוות – המהווים בסיס לשיתוף פעולה יציב לאורך זמן.',

        audience_title: 'למי זה מתאים?',
        audience_1: 'צוותי עובדים בחברות וארגונים',
        audience_2: 'צוותי חינוך והדרכה',
        audience_3: 'צוותי ניהול',
        audience_4: 'עסקים משפחתיים',

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
        footer_text: '© 2026 ברק אלוני - סדנאות כלבנות לפיתוח צוותים'
    },
    en: {
        back: 'Back',
        hero_title_1: 'Dog Training Workshop',
        hero_title_highlight: 'For Team Development',
        hero_subtitle: 'A team experience that strengthens communication, trust, and collaboration',
        hero_description: 'Communication is the performance engine of every team.\nWhen the message is clear, consistent, and adapted – work flows.\nWhen it\'s contradictory or vague – friction, burnout, and performance gaps emerge.',
        cta_check: 'Check Team Suitability',

        intro_text_1: 'The workshop offers an applied, experiential learning process for developing effective team communication – integrating practical tools that can be applied immediately in your work routine.',
        intro_highlight: 'This is not a lecture -',
        intro_text_2: 'It\'s a real-time practice space where participants experiment, receive immediate feedback, and refine how they deliver their message.',
        intro_text_3: 'The combination of a routine-breaking experience with deep professional learning creates high engagement and rapid integration.',

        practice_title: 'What do we practice?',
        practice_1_title: 'Using Positive Reinforcement',
        practice_1_desc: 'What is positive reinforcement, how it creates commitment and cooperation – and how to use it consciously instead of criticism that generates resistance.',
        practice_2_title: 'Identifying Contradictory Messages',
        practice_2_desc: 'The gap between words, tone, and body language – and how to prevent confusion that weakens authority and affects performance.',
        practice_3_title: 'Positive Solution Framing',
        practice_3_desc: 'Moving from "what not to do" to "what to do" – for creating clarity, accountability, and desired behavior.',
        practice_4_title: 'Consistency & Persistence',
        practice_4_desc: 'How to build a communication pattern that generates results over time, not just momentary motivation.',
        practice_5_title: 'Adapting Messages to Learning Styles (VARK)',
        practice_5_desc: 'Visual | Auditory | Reading/Writing | Kinesthetic –\nAnd how to ensure the message truly resonates with every team member.',

        why_dogs_title: 'Why the combination with a dog?',
        why_dogs_text_1: 'The combination with a dog is not an entertainment element – it\'s a learning mechanism that produces clear results. A dog responds immediately to clarity, consistency, and message quality.',
        why_dogs_text_2: 'When the instruction is clear – a response follows. When there\'s a contradictory message or imprecision – the result is delayed or fails.',
        why_dogs_text_3: 'This immediate feedback allows the team to see in real-time the direct impact of communication on performance.',
        why_dogs_principles_title: 'The principles are identical to team communication:',
        why_dogs_principle_1: 'Positive reinforcement creates commitment, not resistance.',
        why_dogs_principle_2: 'Clarity reduces errors and saves time.',
        why_dogs_principle_3: 'Consistency builds trust.',
        why_dogs_principle_4: 'A precise message improves output.',
        why_dogs_experiential_1: 'Additionally, experiential learning engages all participants, increases involvement, and creates openness.',
        why_dogs_experiential_2: 'The non-judgmental interaction allows practicing communication in a direct, safe, and results-focused way.',
        why_dogs_result_title: 'The Result:',
        why_dogs_result_1: 'More focused communication.',
        why_dogs_result_2: 'Less internal friction.',
        why_dogs_result_3: 'Less energy wasted on misunderstandings.',
        why_dogs_result_4: 'More collaboration and coordination.',

        benefits_title: 'Business Benefits for Organizations',
        benefit_1: 'Improved meeting quality and message delivery',
        benefit_2: 'Shortened coordination and execution times',
        benefit_3: 'Strengthened cross-department collaboration',
        benefit_4: 'Reduced conflicts arising from misunderstandings',
        benefit_5: 'Strengthened managerial leadership and team guidance',
        benefit_6: 'Strengthened connection and trust among team members – forming a foundation for stable, long-term collaboration.',

        audience_title: 'Who is this for?',
        audience_1: 'Employee teams in companies and organizations',
        audience_2: 'Education and training teams',
        audience_3: 'Management teams',
        audience_4: 'Family businesses',

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
        footer_text: '© 2026 Barak Aloni - Dog Training Workshops for Team Development'
    }
};

/* ============================================================
   MAIN COMPONENT
   ============================================================ */
function TeamWorkshopLanding() {
    const { language, toggleLanguage } = useLanguage();
    const isRTL = language === 'he';
    const t = translations[language];
    const ArrowBack = isRTL ? ArrowRight : ArrowLeft;
    const ArrowNext = isRTL ? ArrowLeft : ArrowRight;

    const [formData, setFormData] = useState({ name: '', company: '', phone: '', email: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (submitStatus === 'invalid_phone' && name === 'phone') setSubmitStatus(null);
        if (name === 'phone') {
            setFormData(prev => ({ ...prev, [name]: value.replace(/\D/g, '') }));
            return;
        }
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validatePhone = (phone) => /^0\d{8,9}$/.test(phone);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validatePhone(formData.phone)) { setSubmitStatus('invalid_phone'); return; }
        setIsSubmitting(true);
        setSubmitStatus(null);
        try {
            const response = await fetch('https://formspree.io/f/mdkqdljn', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    _subject: 'מתעניין בסדנת כלבנות לפיתוח צוות',
                    message: `מתעניין בסדנת כלבנות לפיתוח צוות.\nשם: ${formData.name}\nחברה: ${formData.company}\nטלפון: ${formData.phone}\nאימייל: ${formData.email}`
                })
            });
            if (response.ok) { setSubmitStatus('success'); setFormData({ name: '', company: '', phone: '', email: '' }); }
            else setSubmitStatus('error');
        } catch { setSubmitStatus('error'); }
        finally { setIsSubmitting(false); setTimeout(() => setSubmitStatus(null), 5000); }
    };

    // Animation variants
    const fadeUp = {
        hidden: { opacity: 0, y: 40, filter: 'blur(8px)' },
        visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } }
    };
    const stagger = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.1 } }
    };

    const practiceItems = [
        { title: t.practice_1_title, desc: t.practice_1_desc },
        { title: t.practice_2_title, desc: t.practice_2_desc },
        { title: t.practice_3_title, desc: t.practice_3_desc },
        { title: t.practice_4_title, desc: t.practice_4_desc },
        { title: t.practice_5_title, desc: t.practice_5_desc }
    ];

    const benefits = [t.benefit_1, t.benefit_2, t.benefit_3, t.benefit_4, t.benefit_5, t.benefit_6];

    const audiences = [t.audience_1, t.audience_2, t.audience_3, t.audience_4];

    return (
        <div className="workshop-page" dir={isRTL ? 'rtl' : 'ltr'} style={{ direction: isRTL ? 'rtl' : 'ltr' }}>

            {/* ===== NAVIGATION ===== */}
            <nav className="workshop-nav">
                <div className="workshop-nav-container">
                    <Logo href="/" />
                    <div className="workshop-nav-controls">
                        <button onClick={toggleLanguage} className="workshop-lang-btn">
                            <Globe size={20} />
                            <span>{language === 'he' ? 'EN' : 'עב'}</span>
                        </button>
                        <a href="/" className="workshop-back-link">
                            <ArrowBack />
                            <span>{t.back}</span>
                        </a>
                    </div>
                </div>
            </nav>

            {/* ===== HERO SECTION ===== */}
            <section className="workshop-hero workshop-hero--image-bg">
                <div className="workshop-hero-overlay" />
                <div className="workshop-hero-content workshop-hero-content--centered">
                    <motion.div initial="hidden" animate="visible" variants={stagger} className="workshop-hero-text">
                        <motion.h1 variants={fadeUp} className="workshop-hero-title">
                            {t.hero_title_1}
                            <span className="workshop-hero-title-highlight">{t.hero_title_highlight}</span>
                        </motion.h1>
                        <motion.p variants={fadeUp} className="workshop-hero-subtitle">
                            {t.hero_subtitle}
                        </motion.p>
                        <motion.p variants={fadeUp} className="workshop-hero-description">
                            {t.hero_description}
                        </motion.p>
                        <motion.div variants={fadeUp} className="workshop-cta-desktop" style={{ justifyContent: 'center' }}>
                            <a href="#contact" className="workshop-cta-btn">
                                <span>{t.cta_check}</span>
                                <ArrowNext />
                            </a>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* ===== VIDEO SECTION ===== */}
            <section className="workshop-video-section">
                <div className="workshop-split-container">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="workshop-standalone-video"
                    >
                        <div className="workshop-video-container">
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
            </section>

            {/* ===== INTRO SECTION (Image on Left in RTL, Right in LTR) ===== */}
            <section className="workshop-intro">
                <div className="workshop-split-container">
                    <div className="workshop-split-grid">
                        <motion.div
                            initial="hidden" whileInView="visible"
                            viewport={{ once: true, margin: '-80px' }}
                            variants={stagger}
                            className="workshop-intro-content"
                        >
                            <motion.p variants={fadeUp} className="workshop-intro-text">
                                {t.intro_text_1}
                            </motion.p>
                            <motion.h2 variants={fadeUp} className="workshop-intro-highlight">
                                {t.intro_highlight}
                                <span style={{ fontWeight: 400, color: 'var(--tw-color-slate-600)', fontSize: '1.25rem' }}> {t.intro_text_2}</span>
                            </motion.h2>
                            <motion.p variants={fadeUp} className="workshop-intro-text workshop-intro-text--accent">
                                {t.intro_text_3}
                            </motion.p>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: isRTL ? -50 : 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: '-80px' }}
                            transition={{ duration: 0.8 }}
                            className="workshop-split-image-wrapper"
                        >
                            <img
                                src={imgHighfive}
                                alt="High five connection"
                                className="workshop-split-image workshop-split-image--clickable"
                                loading="lazy"
                                onClick={() => setSelectedImage(imgHighfive)}
                            />
                            <div className="workshop-split-image-decoration"></div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ===== PRACTICE SECTION (6 items with polygon art) ===== */}
            <section className="workshop-practice">
                <div className="workshop-practice-container">
                    <motion.div
                        initial="hidden" whileInView="visible"
                        viewport={{ once: true, margin: '-80px' }}
                        variants={stagger}
                        className="workshop-practice-header"
                    >
                        <motion.div variants={fadeUp} className="workshop-section-divider" />
                        <motion.h2 variants={fadeUp} className="workshop-practice-title">
                            {t.practice_title}
                        </motion.h2>
                    </motion.div>

                    <motion.div
                        initial="hidden" whileInView="visible"
                        viewport={{ once: true, margin: '-50px' }}
                        variants={stagger}
                        className="workshop-practice-grid"
                    >
                        {practiceItems.map((item, i) => (
                            <motion.div
                                key={i}
                                variants={fadeUp}
                                whileHover={{ scale: 1.03, y: -6, transition: { duration: 0.3 } }}
                                className="workshop-practice-card"
                            >
                                <h3 className="workshop-practice-card-title">{item.title}</h3>
                                <p className="workshop-practice-card-desc">{item.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ===== WHY DOGS SECTION ===== */}
            <section className="workshop-why-dogs">
                <div className="workshop-split-container">
                    <div className="workshop-split-grid">
                        <motion.div
                            initial="hidden" whileInView="visible"
                            viewport={{ once: true, margin: '-80px' }}
                            variants={stagger}
                        >
                            <motion.div variants={fadeUp} className="workshop-section-divider" />
                            <motion.h2 variants={fadeUp} className="workshop-why-dogs-title">
                                {t.why_dogs_title}
                            </motion.h2>
                            <motion.p variants={fadeUp} className="workshop-why-dogs-lead">
                                {t.why_dogs_text_1}
                            </motion.p>

                            <motion.p variants={fadeUp} className="workshop-why-dogs-text">
                                {t.why_dogs_text_2}
                            </motion.p>
                            <motion.p variants={fadeUp} className="workshop-why-dogs-text workshop-why-dogs-text--strong">
                                {t.why_dogs_text_3}
                            </motion.p>

                            {/* Principles */}
                            <motion.div variants={fadeUp} className="workshop-principles">
                                <h3 className="workshop-principles-title">{t.why_dogs_principles_title}</h3>
                                <div className="workshop-principles-grid">
                                    {[t.why_dogs_principle_1, t.why_dogs_principle_2, t.why_dogs_principle_3, t.why_dogs_principle_4].map((p, i) => (
                                        <motion.div
                                            key={i}
                                            className="workshop-principle-item"
                                            initial={{ opacity: 0, x: isRTL ? 30 : -30 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: i * 0.15, duration: 0.5 }}
                                        >
                                            <div className="workshop-principle-marker" />
                                            <span>{p}</span>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        </motion.div>

                        {/* Why Dogs Image Stack */}
                        <motion.div
                            initial={{ opacity: 0, x: isRTL ? 50 : -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: '-80px' }}
                            transition={{ duration: 0.8 }}
                            className="workshop-split-image-wrapper workshop-split-image-wrapper--stack"
                        >
                            <MobileSlider>
                                <img
                                    src={imgFeed}
                                    alt="Training with treats"
                                    className="workshop-split-image workshop-split-image--clickable"
                                    loading="lazy"
                                    onClick={() => setSelectedImage(imgFeed)}
                                />
                                <img
                                    src={imgRelax2}
                                    alt="Workshop interaction"
                                    className="workshop-split-image workshop-split-image--clickable"
                                    loading="lazy"
                                    onClick={() => setSelectedImage(imgRelax2)}
                                />
                            </MobileSlider>
                            <div className="workshop-split-image-decoration workshop-split-image-decoration--secondary"></div>
                        </motion.div>
                    </div>

                    {/* Experiential Text and Result Box (Full Width) */}
                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
                        variants={stagger} className="workshop-fullwidth-content mt-16"
                        style={{ marginTop: '64px' }}
                    >
                        <motion.p variants={fadeUp} className="workshop-why-dogs-text" style={{ maxWidth: '800px', margin: '0 auto 20px', textAlign: 'center' }}>
                            {t.why_dogs_experiential_1}
                        </motion.p>
                        <motion.p variants={fadeUp} className="workshop-why-dogs-text" style={{ maxWidth: '800px', margin: '0 auto 40px', textAlign: 'center' }}>
                            {t.why_dogs_experiential_2}
                        </motion.p>

                        <motion.div variants={fadeUp} className="workshop-result-box" style={{ maxWidth: '900px', margin: '0 auto' }}>
                            <h3 style={{ textAlign: isRTL ? 'right' : 'left' }}>{t.why_dogs_result_title}</h3>
                            <ul style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                                {[t.why_dogs_result_1, t.why_dogs_result_2, t.why_dogs_result_3, t.why_dogs_result_4].map((r, i) => (
                                    <motion.li
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.1 * i }}
                                    >
                                        {r}
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* ===== BUSINESS BENEFITS (Image on Left in RTL, Right in LTR) ===== */}
            <section className="workshop-benefits">
                <div className="workshop-split-container">
                    <div className="workshop-split-grid">
                        <motion.div
                            initial="hidden" whileInView="visible"
                            viewport={{ once: true, margin: '-80px' }}
                            variants={stagger}
                        >
                            <motion.div variants={fadeUp} className="workshop-section-divider" />
                            <motion.h2 variants={fadeUp} className="workshop-benefits-title">
                                {t.benefits_title}
                            </motion.h2>

                            <div className="workshop-benefits-stack">
                                {benefits.map((b, i) => (
                                    <motion.div
                                        key={i}
                                        className="workshop-benefit-block"
                                        initial={{ opacity: 0, x: isRTL ? 60 : -60, scale: 0.9 }}
                                        whileInView={{ opacity: 1, x: 0, scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.12, duration: 0.5, type: 'spring', stiffness: 100 }}
                                        whileHover={{ scale: 1.02, x: isRTL ? -8 : 8 }}
                                    >
                                        <div className="workshop-benefit-block-num">{i + 1}</div>
                                        <span>{b}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Benefits Image Stack */}
                        <motion.div
                            initial={{ opacity: 0, x: isRTL ? -50 : 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: '-80px' }}
                            transition={{ duration: 0.8 }}
                            className="workshop-split-image-wrapper workshop-split-image-wrapper--stack"
                        >
                            <MobileSlider>
                                <img
                                    src={imgRelax}
                                    alt="Relaxed engagement"
                                    className="workshop-split-image workshop-split-image--clickable"
                                    loading="lazy"
                                    onClick={() => setSelectedImage(imgRelax)}
                                />
                            </MobileSlider>
                            <div className="workshop-split-image-decoration workshop-split-image-decoration--teal"></div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ===== TARGET AUDIENCE ===== */}
            <section className="workshop-audience-new">
                <div className="workshop-audience-new-container">
                    <motion.div
                        initial="hidden" whileInView="visible"
                        viewport={{ once: true, margin: '-80px' }}
                        variants={stagger}
                    >
                        <motion.div variants={fadeUp} className="workshop-section-divider" />
                        <motion.h2 variants={fadeUp} className="workshop-audience-new-title">
                            {t.audience_title}
                        </motion.h2>

                        <motion.div variants={stagger} className="workshop-audience-new-grid">
                            {audiences.map((a, i) => (
                                <motion.div
                                    key={i}
                                    variants={fadeUp}
                                    whileHover={{ y: -6, scale: 1.03 }}
                                    className="workshop-audience-new-card"
                                >

                                    <span>{a}</span>
                                </motion.div>
                            ))}
                        </motion.div>

                    </motion.div>
                </div>
            </section>

            {/* ===== CONTACT FORM ===== */}
            <section id="contact" className="workshop-contact">
                <div className="workshop-contact-container">
                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true }}
                        variants={stagger} className="workshop-contact-header"
                    >
                        <motion.h2 variants={fadeUp} className="workshop-contact-title">{t.contact_title}</motion.h2>
                        <motion.p variants={fadeUp} className="workshop-contact-subtitle">{t.contact_subtitle}</motion.p>
                    </motion.div>

                    <motion.form
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        onSubmit={handleSubmit}
                        className="workshop-form"
                    >
                        <div className="workshop-form-grid">
                            <div className="workshop-input-group">
                                <User className="workshop-input-icon" />
                                <input type="text" name="name" value={formData.name}
                                    onChange={handleInputChange} placeholder={t.form_name}
                                    required className="workshop-input" />
                            </div>
                            <div className="workshop-input-group">
                                <Building2 className="workshop-input-icon" />
                                <input type="text" name="company" value={formData.company}
                                    onChange={handleInputChange} placeholder={t.form_company}
                                    className="workshop-input" />
                            </div>
                            <div className="workshop-input-group">
                                <Phone className="workshop-input-icon" />
                                <input type="tel" name="phone" value={formData.phone}
                                    onChange={handleInputChange} placeholder={t.form_phone}
                                    required dir="ltr"
                                    className={`workshop-input ${submitStatus === 'invalid_phone' ? 'workshop-input--error' : ''}`}
                                    style={{ textAlign: isRTL ? 'right' : 'left' }} />
                            </div>
                            <div className="workshop-input-group">
                                <Mail className="workshop-input-icon" />
                                <input type="email" name="email" value={formData.email}
                                    onChange={handleInputChange} placeholder={t.form_email}
                                    className="workshop-input" />
                            </div>
                        </div>

                        {submitStatus === 'invalid_phone' && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                className="workshop-form-message workshop-form-message--error">
                                {t.error_phone}
                            </motion.div>
                        )}

                        <motion.button type="submit" disabled={isSubmitting}
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            className="workshop-submit-btn">
                            {isSubmitting ? <span>{t.form_sending}</span> : <><span>{t.form_submit}</span><Send /></>}
                        </motion.button>

                        {submitStatus === 'success' && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                className="workshop-form-message workshop-form-message--success">
                                {t.success_msg}
                            </motion.div>
                        )}
                        {submitStatus === 'error' && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                className="workshop-form-message workshop-form-message--error">
                                {t.error_msg}
                            </motion.div>
                        )}
                    </motion.form>
                </div>
            </section>

            {/* ===== FOOTER ===== */}
            <footer className="workshop-footer">
                <p>{t.footer_text}</p>
            </footer>

            {/* ===== IMAGE LIGHTBOX MODAL ===== */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="workshop-lightbox"
                        onClick={() => setSelectedImage(null)}
                    >
                        <button className="workshop-lightbox-close" onClick={() => setSelectedImage(null)}>
                            <X size={32} />
                        </button>
                        <motion.img
                            src={selectedImage}
                            alt="Enlarged view"
                            className="workshop-lightbox-image"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            onClick={(e) => e.stopPropagation()} /* Prevent closing when clicking the image itself */
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default TeamWorkshopLanding;
