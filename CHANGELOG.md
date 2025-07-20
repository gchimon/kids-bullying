# Changelog – kids-bullying

## [1.2.0] – 2024-07-25

### 🛡️ Global Image Refresh Rate Limit & Anti-Script Protection
- **Global protection for all image refresh buttons (sections & personalized advice):**
  - If the user clicks any refresh button more than 5 times in 10 seconds, a warning is shown and no API call is made.
  - If more than 15 refreshes in 60 seconds, or 8 in 20 seconds, all refresh buttons are locked for 2 minutes (to prevent abuse or scripts from draining API credits).
  - While locked, any click shows a toast message and does not trigger an API call.
  - After 2 minutes, the buttons are automatically unlocked.
- **One unified mechanism** protects all image refreshes, with clear user feedback.
- **Purpose:** Prevents accidental or scripted abuse of the Pixabay API and protects user API credits.

## [1.1.0] – 2024-07-25

### 🚀 Text-to-Speech (TTS) Experience Upgrade
- Modern popup TTS player with soft colors, round buttons, and subtle shadows.
- Voice selection for all available voices (male/female), with automatic preference saving.
- Accessible sliders for speech rate and pitch, with localStorage persistence.
- Full RTL/LTR support, ARIA, keyboard navigation, and button descriptions.
- Hebrew voice warning: clear message with install instructions if no Hebrew TTS is available.
- Playback starts only when Play is pressed (not automatic).
- Fully responsive design.
- Ready for future Canvas-based UI/animations.

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

---

For full documentation, setup instructions, and theoretical background, see the README files. 