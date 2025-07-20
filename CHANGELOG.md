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

---

For full documentation, setup instructions, and theoretical background, see the README files. 