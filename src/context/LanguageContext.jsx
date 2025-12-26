import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('he');

    // Set initial language based on browser preference if needed
    useEffect(() => {
        document.documentElement.lang = language;
        document.documentElement.dir = language === 'he' ? 'rtl' : 'ltr';
    }, [language]);

    const translations = {
        he: {
            // Header
            'programs': 'תוכניות',
            'lets_talk': 'בואו נדבר',
            'mobile_menu': 'תפריט',

            // Hero
            'hero_title': 'ברק אלוני',
            'hero_subtitle': 'טיפול באמצעות כלבים / כלבנות טיפולית',
            'hero_description': 'חינוך, קהילה וארגונים. נבנה יחד חוויה מעצימה, ערכית ומחברת - עם מעל 10 שנות ניסיון בשטח.',
            'who_is_it_for': 'למי זה מתאים?',
            'experience': '+10 שנות ניסיון',
            'nationwide': 'פריסה ארצית',
            'all_ages': 'מותאם לכל גיל ואוכלוסייה',
            'video_title': 'סרטון תדמית – ברק אלוני',

            // Programs
            'our_programs': 'התוכניות שלנו',
            'tailored_solutions': 'פתרונות מותאמים אישית',
            'for_education': 'למסגרות חינוך וארגונים',
            'program_education_title': 'גפ"ן / מוסדות חינוך',
            'program_education_content': 'תוכנית תהליכית לתלמידים מכיתות א\' – י"ב, המותאמת לחינוך רגיל, חינוך מיוחד, נוער בסיכון, עולים חדשים ועוד. אנו מעניקים מענה תומך ומשלים לתהליכים החינוכיים המתקיימים במסגרת בית הספר.',
            'program_events_title': 'סדנאות ואירועים חד-פעמיים',
            'program_events_content': 'פעילויות חווייתיות מלאות אנרגיה המתאימות ל: ימי הולדת, קייטנות, סדנאות גיבוש ועוד! הכלבים והצוות שלנו מביאים שמחה, למידה ותחושת העצמה אישית לכל המשתתפים.',
            'program_special_title': 'אוכלוסיות מיוחדות',
            'program_special_content': 'התאמות ייעודיות עבור אוכלוסיות שונות כמו: PTSD, קשישים, נוער בסיכון, מרכזי יום ועוד. אנו משלבים כלים מעצימים, ועבודה קבוצתית שמחזקת אמון ואת תחושת ביטחון.',
            'more_details': 'לפרטים נוספים',
            'watch_video': 'צפה בסרטון',

            // Contact
            'contact_title': 'צרו קשר',
            'contact_subtitle': 'רוצים לשמוע עוד? \nאנחנו זמינים לכל שאלה, התייעצות או בקשה.',
            'who_we_are': 'עם מי מדברים?',
            'barak_aloni': 'ברק אלוני',
            'email': 'אימייל',
            'area': 'אזור פעילות',
            'follow_us': 'עקבו אחרינו',
            'full_name': 'שם מלא',
            'phone_label': 'טלפון',
            'email_label': 'אימייל',
            'message_optional': 'הודעה (אופציונלי)',
            'message_placeholder': 'היי, אשמח לשמוע פרטים על...',
            'send_details': 'שלחו פרטים',
            'privacy_note': '* הנתונים נשלחים ישירות למייל שלנו ולא מועברים לצד ג\'.',
            'whatsapp_message': 'אשמח לשמוע עוד פרטים על השירותים שלכם',
            'name_placeholder': 'ישראל ישראלי',
            'phone_placeholder': '050-0000000',
            'email_placeholder': 'your@email.com',

            // Footer
            'accessibility_statement': 'הצהרת נגישות',
            'privacy_policy': 'מדיניות פרטיות',
            'rights_reserved': '© כל הזכויות באתר זה שמורות לברק אלוני 2024. אין להעתיק, לשכפל ולצלם.',
            'copyright': '© כל הזכויות באתר זה שמורות לברק אלוני {year}. אין להעתיק, לשכפל ולצלם.',

            // Program Modal
            'program_modal_title': 'גפ"ן / מוסדות חינוך',
            'therapeutic_dog_training': 'הדרכת כלבנות טיפולית',
            'gefen_approved': 'תוכנית מאושרת גפ"ן',
            'program_intro': 'התוכנית הינה תוכנית חינוכית המשלבת בין עולם הכלבנות לבין עולם ההתפתחות האישית. התוכנית נועדה לפתח מיומנויות חברתיות, תקשורת וביטחון עצמי אצל התלמידים.',
            'program_goals_title': 'מטרות התוכנית',
            'program_goal_1': 'העצמה אישית וקבוצתית',
            'program_goal_2': 'קבלת האחר וקבלה עצמית',
            'program_goal_3': 'חיזוק ופיתוח כישורי חיים',
            'program_goal_4': 'התגברות על פחדים',
            'program_goal_5': 'חיזוק מעורבות חברתית',
            'program_targets_title': 'יעדים וערכים',
            'program_target_1': 'יצירת סביבה חינוכית בטוחה',
            'program_target_2': 'דיונים ללא שיפוטיות',
            'program_target_3': 'הבעת דעות ללא חשש',
            'program_target_4': 'לקיחת אחריות אישית',
            'program_target_5': 'השתתפות מתוך רצון ובחירה',
            'target_audience_title': 'קהל היעד',
            'target_audience_content': 'התוכנית מיועדת לתלמידים מכיתה <span className="font-bold text-gray-900">א\' ועד י"ב</span> מכל המגזרים. \nמותאמת למגוון רחב של אוכלוסיות: מצטיינים, מחוננים, חינוך מיוחד, נוער בסיכון, הפרעות קשב, לקויות למידה, עולים חדשים וכו\'.',
            'methods_title': 'דרכי פעולה',
            'methods_content_1': 'דרך עולם הכלבנות נלמד תקשורת אפקטיבית, שפת גוף, אילוף בסיסי, ספורט כלבני וכלבי שירות. ההדרכה מתבצעת "בגובה העיניים" תוך יצירת אמון ומחויבות הדדית.',
            'methods_content_2': 'הקבוצות הינן קבועות (ללא חילופי תלמידים) כדי לשמור על מרחב בטוח ואינטימי. אנו מבצעים מעקב אישי אחר כל תלמיד כדי לדייק את המענה.',
            'expected_results_title': 'תוצאות מצופות',
            'result_1': 'ביטחון עצמי וחברתי',
            'result_2': 'יצירת קשרים חברתיים',
            'result_3': 'פיתוח אמפתיה וחמלה',
            'result_4': 'מוסריות כלפי בעלי חיים',
            'technical_details_title': 'פרטים טכניים:',
            'group_size': '• גודל קבוצה: 6-8 תלמידים',
            'requirements': '• דרישות: כיתה קבועה, ליווי ייעוץ חינוכי מטעם המוסד',
            'contact_details_modal': '• פרטי קשר: ברק אלוני | 050-8391268 | Dogs@barakaloni.com',

            // Accessibility Widget
            'accessibility_tools': 'כלי נגישות',
            'grayscale': 'גווני אפור',
            'invert_contrast': 'ניגודיות הפוכה',
            'decrease_text': 'הקטנת טקסט',
            'increase_text': 'הגדלת טקסט',
            'highlight_headings': 'הדגשת כותרות',
            'highlight_links': 'הדגשת קישורים',
            'readable_font': 'גופן קריא',
            'big_cursor': 'סמן גדול',
            'stop_animations': 'עצירת אנימציות',
            'reset_settings': 'איפוס הגדרות',

            // Cookie Banner
            'cookies_title': 'אנחנו משתמשים בעוגיות',
            'cookies_text': 'האתר משתמש בעוגיות כדי לשפר את חווית הגלישה. המשך הגלישה באתר מהווה הסכמה לשימוש זה.',
            'learn_more': 'למידע נוסף',
            'got_it': 'הבנתי, תודה',

            // Legal Modal
            'legal_info': 'מידע משפטי',
            'accessibility_intro': 'אנו בברק אלוני רואים חשיבות עליונה במתן שירות שוויוני לכלל הלקוחות והגולשים ובשיפור השירות הניתן ללקוחות עם מוגבלות.',
            'accessibility_resources': 'בהתאם לכך, אנו משקיעים משאבים רבים בהנגשת האתר שלנו, במטרה לאפשר למרבית האוכלוסייה לגלוש בו בקלות ובנוחות וליהנות מהשירותים ומהתכנים המתפרסמים בו.',
            'accessibility_level': 'רמת הנגישות',
            'accessibility_standard': 'האתר נבנה בהתאם לתקנות שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות), תשע"ג-2013, ולתקן הישראלי ת"י 5568 לנגישות תכנים באינטרנט ברמת AA.',
            'adjustments_made': 'התאמות שבוצעו באתר',
            'adjustment_1': 'האתר מותאם לצפייה בדפדפנים הנפוצים (Chrome, Firefox, Safari, Edge).',
            'adjustment_2': 'תכני האתר כתובים בשפה ברורה וקריאה.',
            'adjustment_3': 'מבנה האתר מושתת על ניווט נוח וברור ותפריטים הבנויים באמצעות רשימות המאפשרים התמצאות קלה ופשוטה.',
            'adjustment_4': 'האתר מותאם לגלישה במכשירים ניידים (רספונסיבי).',
            'adjustment_5': 'התמונות באתר כוללות תיאור טקסטואלי חלופי (Alt Text).',
            'adjustment_6': 'האתר מאפשר שינוי גודל הגופן על ידי שימוש במקלדת (Ctrl + / -).',
            'accessibility_contact_title': 'יצירת קשר בנושא נגישות',
            'accessibility_contact_text': 'אם נתקלתם בקושי כלשהו בגלישה באתר או שיש לכם הערה בנושא, נשמח אם תצרו איתנו קשר כדי שנוכל לטפל בבעיה:',
            'accessibility_email': 'אימייל: dogs@barakaloni.com',
            'accessibility_phone': 'טלפון: 050-8391-268',
            'privacy_intro': 'אנו מכבדים את פרטיות המשתמשים באתר ומחויבים להגן על המידע האישי שאתם משתפים איתנו.',
            'data_collection': 'איסוף מידע',
            'data_collection_text': 'כאשר אתם משאירים פרטים באתר (שם, טלפון, אימייל) לצורך יצירת קשר, אנו אוספים את המידע הזה אך ורק למטרת חזרה אליכם ומתן שירות.',
            'data_use': 'שימוש במידע',
            'data_use_text': 'המידע שנאסף לא יועבר לצדדים שלישיים ללא הסכמתכם, אלא אם כן נדרשנו לכך על פי חוק.',
            'cookies_policy_title': 'עוגיות (Cookies)',
            'cookies_policy_text_1': 'האתר עשוי להשתמש ב"עוגיות" (Cookies) לצורך תפעולו השוטף והתקין, ובכלל זה כדי לאסוף נתונים סטטיסטיים אודות השימוש באתר, לאימות פרטים, וכדי להתאים את האתר להעדפותיכם האישיות.',
            'cookies_policy_text_2': 'דפדפנים מודרניים מאפשרים לכם להימנע מקבלת Cookies. אם אינכם יודעים כיצד לעשות זאת, בדקו בקובץ העזרה של הדפדפן שבו אתם משתמשים.',
        },
        en: {
            // Header
            'programs': 'Programs',
            'lets_talk': "Let's Talk",
            'mobile_menu': 'Menu',

            // Hero
            'hero_title': 'Barak Aloni',
            'hero_subtitle': 'Therapy Dog Workshops & Empowerment',
            'hero_description': 'Education, community, and organizations. Building an empowering, values-driven, and connecting experience together – with over 10 years of field experience.',
            'who_is_it_for': 'Who is it for?',
            'experience': '+10 Years Experience',
            'nationwide': 'Nationwide',
            'all_ages': 'All Ages & Populations',
            'video_title': 'Barak Aloni - Promotional Video',

            // Programs
            'our_programs': 'Our Programs',
            'tailored_solutions': 'Tailored Solutions',
            'for_education': 'For Education & Organizations',
            'program_education_title': 'Gefen / Educational Institutions',
            'program_education_content': 'A process-oriented program for students from 1st to 12th grade, adapted for regular education, special education, at-risk youth, new immigrants, and more. We provide a supportive and complementary response to the educational processes taking place within the school.',
            'program_events_title': 'Workshops & One-Time Events',
            'program_events_content': 'High-energy experiential activities suitable for: birthdays, summer camps, team-building workshops, and more! Our dogs and team bring joy, learning, and a sense of personal empowerment to all participants.',
            'program_special_title': 'Special Populations',
            'program_special_content': 'Dedicated adjustments for various populations such as: PTSD, elderly, at-risk youth, day centers, and more. We integrate empowering tools and group work that strengthens trust and a sense of security.',
            'more_details': 'More Details',
            'watch_video': 'Watch Video',

            // Contact
            'contact_title': 'Contact Us',
            'contact_subtitle': 'Want to hear more? \nWe are available for any question, consultation, or request.',
            'who_we_are': 'Who are you talking to?',
            'barak_aloni': 'Barak Aloni',
            'email': 'Email',
            'area': 'Activity Area',
            'follow_us': 'Follow Us',
            'full_name': 'Full Name',
            'phone_label': 'Phone',
            'email_label': 'Email',
            'message_optional': 'Message (Optional)',
            'message_placeholder': 'Hi, I would like to hear more details about...',
            'send_details': 'Send Details',
            'privacy_note': '* Data is sent directly to our email and not shared with third parties.',
            'whatsapp_message': 'I would like to hear more details about your services',
            'name_placeholder': 'John Doe',
            'phone_placeholder': '050-0000000',
            'email_placeholder': 'your@email.com',

            // Footer
            'accessibility_statement': 'Accessibility Statement',
            'privacy_policy': 'Privacy Policy',
            'copyright': '© All rights reserved to Barak Aloni {year}. Do not copy, duplicate, or photograph.',

            // Program Modal
            'program_modal_title': 'Gefen / Educational Institutions',
            'therapeutic_dog_training': 'Therapeutic Dog Training',
            'gefen_approved': 'Gefen Approved Program',
            'program_intro': 'This educational program combines the world of dog training with personal development. The program is designed to develop social skills, communication, and self-confidence in students.',
            'program_goals_title': 'Program Goals',
            'program_goal_1': 'Personal and Group Empowerment',
            'program_goal_2': 'Acceptance of Others and Self-Acceptance',
            'program_goal_3': 'Strengthening and Developing Life Skills',
            'program_goal_4': 'Overcoming Fears',
            'program_goal_5': 'Strengthening Social Involvement',
            'program_targets_title': 'Goals and Values',
            'program_target_1': 'Creating a Safe Educational Environment',
            'program_target_2': 'Non-Judgmental Discussions',
            'program_target_3': 'Expressing Opinions Without Fear',
            'program_target_4': 'Taking Personal Responsibility',
            'program_target_5': 'Participation by Choice and Will',
            'target_audience_title': 'Target Audience',
            'target_audience_content': 'The program is intended for students from <span className="font-bold text-gray-900">1st to 12th grade</span> from all sectors. \nAdapted for a wide range of populations: gifted, special education, at-risk youth, attention disorders, learning disabilities, new immigrants, etc.',
            'methods_title': 'Methods',
            'methods_content_1': 'Through the world of dogs, we learn effective communication, body language, basic training, dog sports, and service dogs. The training is conducted "at eye level" while creating trust and mutual commitment.',
            'methods_content_2': 'Groups are fixed (without changing students) to maintain a safe and intimate space. We perform personal monitoring of each student to refine the response.',
            'expected_results_title': 'Expected Results',
            'result_1': 'Self and Social Confidence',
            'result_2': 'Creating Social Connections',
            'result_3': 'Developing Empathy and Compassion',
            'result_4': 'Morality Towards Animals',
            'technical_details_title': 'Technical Details:',
            'group_size': '• Group Size: 6-8 Students',
            'requirements': '• Requirements: Fixed classroom, educational counselor accompaniment',
            'contact_details_modal': '• Contact: Barak Aloni | 050-8391268 | Dogs@barakaloni.com',

            // Accessibility Widget
            'accessibility_tools': 'Accessibility Tools',
            'grayscale': 'Grayscale',
            'invert_contrast': 'Invert Contrast',
            'decrease_text': 'Decrease Text',
            'increase_text': 'Increase Text',
            'highlight_headings': 'Highlight Headings',
            'highlight_links': 'Highlight Links',
            'readable_font': 'Readable Font',
            'big_cursor': 'Big Cursor',
            'stop_animations': 'Stop Animations',
            'reset_settings': 'Reset Settings',

            // Cookie Banner
            'cookies_title': 'We Use Cookies',
            'cookies_text': 'This site uses cookies to improve your browsing experience. Continuing to browse the site constitutes acceptance of this use.',
            'learn_more': 'Learn More',
            'got_it': 'Got It, Thanks',

            // Legal Modal
            'legal_info': 'Legal Information',
            'accessibility_intro': 'At Barak Aloni, we view equal service for all customers and visitors as paramount and strive to improve service for customers with disabilities.',
            'accessibility_resources': 'Accordingly, we invest significant resources in making our site accessible to allow the majority of the population to browse it easily and comfortably.',
            'accessibility_level': 'Accessibility Level',
            'accessibility_standard': 'The site is built in accordance with the Equal Rights for Persons with Disabilities Regulations (Service Accessibility Adjustments), 2013, and Israeli Standard 5568 for Web Content Accessibility at Level AA.',
            'adjustments_made': 'Adjustments Made',
            'adjustment_1': 'The site is adapted for viewing in common browsers (Chrome, Firefox, Safari, Edge).',
            'adjustment_2': 'Site content is written in clear and legible language.',
            'adjustment_3': 'Site structure is based on clear and convenient navigation and menus built using lists allowing easy orientation.',
            'adjustment_4': 'The site is adapted for mobile browsing (responsive).',
            'adjustment_5': 'Images on the site include alternative textual description (Alt Text).',
            'adjustment_6': 'The site allows font size change using the keyboard (Ctrl + / -).',
            'accessibility_contact_title': 'Contact Regarding Accessibility',
            'accessibility_contact_text': 'If you encountered any difficulty browsing the site or have a comment on the subject, we would be happy if you contacted us so we can handle the problem:',
            'accessibility_email': 'Email: dogs@barakaloni.com',
            'accessibility_phone': 'Phone: 050-8391-268',
            'privacy_intro': 'We respect the privacy of site users and are committed to protecting the personal information you share with us.',
            'data_collection': 'Data Collection',
            'data_collection_text': 'When you leave details on the site (name, phone, email) for the purpose of contact, we collect this information solely for the purpose of getting back to you and providing service.',
            'data_use': 'Use of Information',
            'data_use_text': 'The information collected will not be transferred to third parties without your consent, unless we are required to do so by law.',
            'cookies_policy_title': 'Cookies',
            'cookies_policy_text_1': 'The site may use "Cookies" for its ongoing and proper operation, including to collect statistical data about site usage, for details verification, and to adapt the site to your personal preferences.',
            'cookies_policy_text_2': 'Modern browsers allow you to avoid receiving Cookies. If you do not know how to do this, check the help file of the browser you are using.',
        }
    };

    const t = (key) => {
        return translations[language][key] || key;
    };

    const toggleLanguage = () => {
        setLanguage(prev => prev === 'he' ? 'en' : 'he');
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};
