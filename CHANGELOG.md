# Changelog – kids-bullying

## [1.0.0] – 2024-07-25

### 🎉 Initial Release

#### Core Features
- **Interactive Bullying Guide**: Step-by-step SPA for parents, educators, and children.
- **Multilingual Support**: Hebrew, English, and French (dynamic i18n JSON files).
- **Dynamic Advice Engine**: Contextual, role- and age-based advice powered by mock_advice.js and i18n.
- **Data-Driven Visualizations**: Emotional impact and prevention strategy charts (Chart.js, i18n-driven).
- **Contextual Images**: Automatic, keyword-based image loading from Pixabay API for each section and advice.
- **Accessible UI**: Full accessibility (ARIA, keyboard navigation, RTL/LTR, alt text, high contrast).
- **Responsive Design**: Mobile-first, modern layout (TailwindCSS, custom CSS).
- **Government & Resource Links**: Curated official resources and guides (gov_resources.html).

#### Project Structure
```
kids-bullying/
├── i18n/            # Multilingual JSON files (he, en, fr)
├── index.html       # Main SPA entry point
├── info.html        # Theoretical background & article
├── gov_resources.html # Official resources & links
├── script.js        # Main JS logic (dynamic content, charts, images)
├── style.css        # Custom styles
├── mock_advice.js   # Advice engine (contextual, role/age-based)
├── config.js        # (User-supplied) Pixabay API key (not in repo)
└── README.md / README.en.md / README.fr.md
```

#### API & Configuration
- **Pixabay API**: Requires user-supplied API key in `config.js` (not included in repo, see README for setup).

#### Accessibility & Best Practices
- **Tabindex, ARIA, alt text, and dynamic descriptions**
- **RTL/LTR support**
- **Keyboard navigation**

### 🗣️ Text-to-Speech (TTS) Experience Upgrade (July 2024)
- Animated speaker icon and visual feedback while speaking.
- TTS buttons are toggleable: click again to stop, or click another to switch.
- Only one section/advice can be read at a time.
- Added accessible sliders for speech rate and pitch, with localStorage persistence.
- All TTS features are fully accessible (ARIA, keyboard, focus, color contrast).
- Hebrew voice warning: gentle, accessible message with install instructions if no Hebrew TTS is available.
- All features work in Hebrew, English, and French (subject to browser TTS support).
- See README for usage details.

---

For full documentation, setup instructions, and theoretical background, see the README files. 

## [1.1.0] – 2024-07-25

### 🚀 שדרוג נגן טקסט מדובר (TTS)
- **נגן Popup חדשני**: נגן TTS עצמאי, ממורכז, עם עיצוב מודרני, צבעים רכים, כפתורים עגולים, וצללים עדינים.
- **בחירת קול (Voice)**: תפריט בחירה של כל הקולות הזמינים לשפה (כולל גבר/אישה), עם שמירה אוטומטית של ההעדפה.
- **סליידרים מהירות וטון**: שליטה מלאה, שמירה ב-localStorage.
- **תמיכה מלאה ב-RTL/LTR**: כל הממשק, כולל תוויות, כפתורים, ותפריטים.
- **נגישות גבוהה**: ARIA, פוקוס, ניווט מקלדת, תיאורי כפתורים.
- **הודעה מותאמת אם אין קול עברי**: הסבר בעברית עם הוראות התקנה, במקום הנגן.
- **הפעלה רק בלחיצה על Play**: לא מתחיל אוטומטית.
- **עיצוב רספונסיבי**: מתאים לנייד ודסקטופ.
- **הכנה להרחבה עתידית ל-Canvas**: ניתן להוסיף בעתיד נגן Canvas עם אנימציות. 