import json

# Read the TeamWorkshopLanding component
with open('src/components/TeamWorkshopLanding.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Rename Component
content = content.replace('function TeamWorkshopLanding()', 'function GefenLanding()')
content = content.replace('export default TeamWorkshopLanding;', 'export default GefenLanding;')
content = content.replace('_subject: \'מתעניין בסדנת כלבנות לפיתוח צוות\'', '_subject: \'מתעניין בתוכנית גפ"ן\'')
content = content.replace('type: \'form_submit\', name: \'workshop_lead\'', 'type: \'form_submit\', name: \'gefen_lead\'')

# 2. Fix CSS mapping. To use the new hero image, I should inject a style prop for the hero section
content = content.replace('className="workshop-hero workshop-hero--image-bg"', 'className="workshop-hero" style={{ backgroundImage: `url(${imgGate})`, backgroundSize: "cover", backgroundPosition: "center 30%" }}')

# 3. Replace the images:
content = content.replace("import imgFeed from '../assets/workshop/feed.jpg';", "import imgFeed from '../assets/schools/kid-feed-jessie.jpg';")
content = content.replace("import imgGate from '../assets/workshop/gate.jpg';", "import imgGate from '../assets/schools/jessie-petted.jpg';")
content = content.replace("import imgHighfive from '../assets/workshop/highfive.jpg';", "import imgHighfive from '../assets/schools/jessie-and-soccor.jpg';")
content = content.replace("import imgRelax from '../assets/workshop/relax.jpg';", "import imgRelax from '../assets/schools/jessie-petted-zoomin.jpg';")
content = content.replace("import imgRelax2 from '../assets/workshop/relax2.jpg';", "import imgRelax2 from '../assets/schools/girl-feed-jessie.jpg';")

# 4. Replace Video URL
content = content.replace('kZMeB9DZNAs', 'HC4Sm4KhXlU')

# 5. Overwrite the translations object
new_translations = """const translations = {
    he: {
        back: 'חזרה',
        hero_title_1: 'תוכנית גפ"ן /',
        hero_title_highlight: ' מוסדות חינוך',
        hero_subtitle: 'אילוף כלבים טיפולי המשמש כמראה לחיים עצמם',
        hero_description: 'התוכנית שלנו מאושרת גפ"ן ומעניקה כלים משמעותיים וישימים לילדים ובני נוער דרך עבודה חינוכית ומרתקת עם כלבים.',
        cta_check: 'לבדיקת התאמה למוסד',

        intro_text_1: 'התוכנית מציעה סביבה טיפולית מעשית - שילוב של כלים להתמודדות עם אתגרים שיכולים להיות מיושמים באופן מיידי בחיי התלמידים.',
        intro_highlight: 'הכלב מקבל כל אחד כמו שהוא -',
        intro_text_2: 'סביבה בטוחה בזמן אמת בה התלמידים מתנסים ומתחזקים.',
        intro_text_3: 'שילוב של חוויה שוברת שגרה המעודדת תקשורת ברורה וגיבוש חברתי תוך זמן קצר.',

        practice_title: 'מטרות התוכנית',
        practice_1_title: 'העצמה אישית וקבוצתית',
        practice_1_desc: 'דרך העבודה החווייתית, בה הכלבים משמשים כמראה לחיים עצמם, התלמידים מפתחים תחושת מסוגלות ולומדים עבודת צוות.',
        practice_2_title: 'קבלת האחר וקבלה עצמית',
        practice_2_desc: 'הכלב מקבל כל תלמיד ללא תנאי, מה שמאפשר לתלמידים ללמוד לקבל את עצמם ואת השונים מהם בסביבה תומכת.',
        practice_3_title: 'גיבוש שיח חברתי ופיתוח כישורי חיים',
        practice_3_desc: 'התוכנית מקנה מיומנויות חשובות כמו סבלנות, תקשורת ברורה, הצבת גבולות ואחריות אישית בסביבת בית הספר ומחוצה לה.',
        practice_4_title: 'התמודדות עם פחדים ומחסומים',
        practice_4_desc: 'המפגש ההדרגתי מעניק חוויה בטוחה המאפשרת יכולת התמודדות והצלחה עם פחדים שמקבלת ביטוי גם בתחומי חיים אחרים.',

        why_dogs_title: 'למה דווקא כלבים בחינוך?',
        why_dogs_text_1: 'השילוב של כלבים אינו רק אלמנט בידורי - זהו מנגנון חינוכי היוצר תוצאות ברורות. כלב מגיב באופן טיפוסי לבהירות, ליציבות ולתקשורת איכותית.',
        why_dogs_text_2: 'כאשר ההנחיה ברורה - מתקבלת תוצאה. כאשר המסר מבלבל - אין פעולה מדויקת מול הכלב.',
        why_dogs_text_3: 'משוב מיידי זה נותן לתלמידים אפשרות לראות בלייב את אופן הפעולה שלהם, וכיצד היא משפיעה על סביבתם.',
        why_dogs_principles_title: 'היעדים והערכים בתוכנית זהים לחיי הכיתה:',
        why_dogs_principle_1: 'יצירת סביבה חינוכית בטוחה.',
        why_dogs_principle_2: 'דיונים ללא שיפוטיות.',
        why_dogs_principle_3: 'הבעת דעה ללא חשש.',
        why_dogs_principle_4: 'לקיחת אחריות אישית (מוסר ואמפתיה).',
        why_dogs_experiential_1: 'הלמידה החווייתית מעלה את המעורבות של כלל התלמידים, גם המופנמים שבהם, ומייצרת פתיחות מדהימה.',
        why_dogs_experiential_2: 'האינטראקציה חסרת השיפוטיות מאפשרת לתלמידים לתרגל מיומנויות חברתיות בדרך נגישה שמתרכזת בתוצאה.',
        why_dogs_result_title: 'התוצאה:',
        why_dogs_result_1: 'גיבוש חברתי וקשרים חיוביים.',
        why_dogs_result_2: 'העלאת הבטחון העצמי.',
        why_dogs_result_3: 'שיפור ביכולת האמפתיה המשותפת.',
        why_dogs_result_4: 'למידת ערכי עזרה הדדית וכבוד בעלי חיים.',

        benefits_title: 'קהל יעד ומאפיינים',
        benefit_1: 'תלמידים ולומדים מכתה א׳ עד יב׳',
        benefit_2: 'מותאם למגוון אוכלוסיות',
        benefit_3: 'ילדי החינוך המיוחד',
        benefit_4: 'נוער בסיכון ולקויות למידה',
        benefit_5: 'נוער עולה',
        benefit_6: 'קבוצות הומוגניות וקבועות לצורך יצירת אמון.',

        audience_title: 'פרטים טכניים',
        audience_1: 'גודל קבוצה מומלץ: 6-8 תלמידים יחד',
        audience_2: 'דרישות בסיס: כיתת לימוד קבועה',
        audience_3: 'ליווי נדרש: רכזת/יועצת חינוכית',
        audience_4: 'תקשורת אישית ישירה עם צוות ההוראה',

        contact_title: 'רוצים לבדוק התאמה למוסד החינוכי?',
        contact_subtitle: 'השאירו פרטים ונחזור אליכם לשיחה קצרה.',
        form_name: 'שם מלא (נציג המוסד)',
        form_company: 'שם המוסד / ביה"ס',
        form_phone: 'טלפון',
        form_email: 'אימייל',
        form_submit: 'שליחה',
        form_sending: 'שולח...',
        error_phone: 'מספר הטלפון אינו תקין.',
        success_msg: '✓ הפרטים נשלחו בהצלחה! נחזור אליכם בהקדם.',
        error_msg: 'אירעה שגיאה. אנא נסו שוב.',
        footer_text: '© 2026 ברק אלוני - סדנאות אילוף וגפ"ן',

        toc_title: 'בעמוד זה',
        toc_hero: 'סקירה כללית',
        toc_video: 'סרטון הדגמה',
        toc_intro: 'אודות',
        toc_practice: 'מטרות שנתרגל',
        toc_why_dogs: 'למה כלבים?',
        toc_benefits: 'קהל היעד',
        toc_audience: 'פרטים טכניים',
        toc_contact: 'יצירת קשר'
    },
    en: {
        back: 'Back',
        hero_title_1: 'Gefen Program /',
        hero_title_highlight: ' Educational Institutions',
        hero_subtitle: 'Therapeutic dog training operating as a mirror to life',
        hero_description: 'An approved educational program giving youth crucial tools through engaging work with dogs.',
        cta_check: 'Check Suitability',

        intro_text_1: 'The program offers an experiential environment - applying tools for challenges in real time.',
        intro_highlight: 'The dog unconditionally accepts -',
        intro_text_2: 'Creating a safe, non-judgmental space for students to experiment and grow.',
        intro_text_3: 'Breaking routines encourages clear communication and rapid social bonding.',

        practice_title: 'Program Goals',
        practice_1_title: 'Personal & Group Empowerment',
        practice_1_desc: 'Through experiential work, dogs act as a mirror to life itself as students learn teamwork.',
        practice_2_title: 'Acceptance',
        practice_2_desc: 'Unconditional acceptance allows students to accept themselves and others.',
        practice_3_title: 'Bonding & Life Skills',
        practice_3_desc: 'Teaching crucial skills like patience, boundaries, and responsibility outside the classroom.',
        practice_4_title: 'Overcoming Fears',
        practice_4_desc: 'Safe encounters allow students to confront barriers and succeed.',

        why_dogs_title: 'Why Dogs in Education?',
        why_dogs_text_1: 'Dogs respond natively to clear leadership and consistency.',
        why_dogs_text_2: 'When instruction is clear - the result is positive.',
        why_dogs_text_3: 'Real-time feedback demonstrates to students their direct impact on their environment.',
        why_dogs_principles_title: 'Principles match classroom dynamics:',
        why_dogs_principle_1: 'Creating safe environments.',
        why_dogs_principle_2: 'Non-judgmental discussions.',
        why_dogs_principle_3: 'Fearless expression.',
        why_dogs_principle_4: 'Personal responsibility.',
        why_dogs_experiential_1: 'Increases all students’ involvement.',
        why_dogs_experiential_2: 'Allows practicing complex abilities effortlessly.',
        why_dogs_result_title: 'The Result:',
        why_dogs_result_1: 'Social cohesion.',
        why_dogs_result_2: 'Increased self-confidence.',
        why_dogs_result_3: 'Expanded empathy.',
        why_dogs_result_4: 'Respect towards life.',

        benefits_title: 'Target Audience',
        benefit_1: 'Grades 1 through 12',
        benefit_2: 'Adapted for all populations',
        benefit_3: 'Special Needs',
        benefit_4: 'At-risk Youth',
        benefit_5: 'New immigrants',
        benefit_6: 'Fixed, consistent group environments',

        audience_title: 'Technical Details',
        audience_1: 'Groups of 6-8',
        audience_2: 'Consistent environment requirement',
        audience_3: 'Guided securely',
        audience_4: 'Transparent team communication',

        contact_title: 'Want School Integration?',
        contact_subtitle: 'Reach out to check compatibility.',
        form_name: 'Name',
        form_company: 'School',
        form_phone: 'Phone',
        form_email: 'Email',
        form_submit: 'Submit',
        form_sending: 'Sending...',
        error_phone: 'Invalid phone',
        success_msg: '✓ Details sent!',
        error_msg: 'Error sending.',
        footer_text: '© 2026 Barak Aloni',

        toc_title: 'In This Page',
        toc_hero: 'Overview',
        toc_video: 'Video',
        toc_intro: 'About',
        toc_practice: 'Goals',
        toc_why_dogs: 'Why Dogs',
        toc_benefits: 'Audience',
        toc_audience: 'Requirements',
        toc_contact: 'Contact'
    }
};"""

start = content.find('const translations = {')
end = content.find('/* ============================================================')

if start != -1 and end != -1:
    content = content[:start] + new_translations + '\n\n' + content[end:]
else:
    print("Could not find translations block to replace!")

with open('src/components/GefenLanding.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("done")
