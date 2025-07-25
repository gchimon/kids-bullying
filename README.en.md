[🇮🇱 Hebrew](README.md) | [🇬🇧 English](README.en.md) | [🇫🇷 Français](README.fr.md)

# 🎲 Interactive Guide for Coping with Bullying in Early Childhood

---

## 📝 Description

**This website is based on the principles and knowledge from the comprehensive article "Coping with Bullying and Verbal Violence Among Children Aged 6-7 – A Guide for Parents and Children" (see full reference below). All features, recommendations, definitions, and advice in the app are derived from the article’s principles and presented interactively and accessibly.**

The application offers:
- 📚 **Information on types of bullying** (verbal, physical, social) with clear definitions, as presented in the article.
- 🚨 **Warning signs** to identify children who are being bullied or are bullying others, based on article-sourced checklists.
- 📊 **Interactive graphs** showing emotional effects of bullying and the effectiveness of prevention methods, aligned with article data and insights.
- 🛡️ **Action plan for parents** with clear steps and practical tips, all based on the article's recommendations.
- 🤖 **Dynamic advice engine**: tailored guidance based on scenario, age, and the user's role, in accordance with the article’s intervention principles.
- 🖼️ **Dynamic images** that adapt to context, such as loneliness, fear, or friendship – all drawn from the article's emphasis.
- 🌐 **Full multilingual support**, high accessibility, and responsive design.

> **This tool aims to make the article's principles accessible to parents, educators, and children in an engaging, interactive, and personalized way.**

---

## ✨ Key Features

- 🌍 **Full multilingual support**: Hebrew, English, French (includes RTL/LTR, graphs, advice, images, UI)
- ⚡ **Dynamic loading of texts, graphs, and advice**: All content loads from i18n JSON files based on selected language
- 📈 **Dynamic charts**: Powered by Chart.js with i18n-based labels and values
- 🤖 **Dynamic advice engine**: `mock_advice.js` selects contextual answers based on role, age, and language
- 🖼️ **Contextual image loading**: Each section and advice entry displays a relevant image mapped to interface language keywords
- ♿ **Full accessibility**: Includes tabindex, aria-label, aria-live, dynamic image alt text, high contrast, keyboard navigation, dynamic descriptions
- 📱 **Responsive UI**: Mobile and desktop friendly

### 🗣️ Enhanced Text-to-Speech (TTS) Experience
- Animated speaker icon (pulsing) while speaking
- TTS buttons are toggleable: click again to stop, or click another to switch
- Only one section/advice can be read at a time
- Accessible sliders for speech rate and pitch (saved in localStorage)
- Full ARIA/keyboard/focus/color accessibility
- Gentle warning if no Hebrew voice is available, with install instructions
- Works in Hebrew, English, and French (browser support required)

---

## 🎤 Text-to-Speech (TTS) Player – Standalone Popup

- Modern popup TTS player, centered, with soft colors, round buttons, and subtle shadows.
- Voice selection: choose from all available voices for the language (male/female), with automatic preference saving.
- Sliders for speech rate and pitch, with localStorage persistence.
- Full RTL/LTR support: all UI, labels, buttons, and menus.
- High accessibility: ARIA, focus, keyboard navigation, button descriptions.
- Hebrew voice warning: clear message with install instructions if no Hebrew TTS is available.
- Playback starts only when Play is pressed (not automatic).
- Fully responsive design.
- Ready for future Canvas-based UI/animations.

### Usage:

```js
TTSPlayer.open({
  text: 'Hello world',
  lang: 'en-US',
  sectionTitle: 'Example'
});
```

---

## 🛠️ Technologies

| Technology      | Purpose |
|----------------|---------|
| HTML, CSS, TailwindCSS | UI design and layout |
| JavaScript     | Dynamic content, charts, images, and advice |
| Chart.js       | Interactive charts |
| Pixabay API    | Contextual image fetching |
| i18n (JSON)    | Multilingual translation files |

---

## 🚀 How to Run?

1. 📂 Open a terminal in the `kids-bullying` directory
2. ▶️ Start a Python server:
   ```
   python -m http.server 8080
   ```
3. 🌐 Open a browser and navigate to: [http://localhost:8080/](http://localhost:8080/)

---

## Project Structure

Below is the recommended folder structure for the project. You should add your `config.js` file directly inside the `kids-bullying/` directory (next to index.html, script.js, etc.).

```
kids-bullying/
├── i18n/
│   ├── he.json
│   ├── en.json
│   └── fr.json
├── index.html
├── info.html
├── gov_resources.html
├── script.js
├── style.css
├── mock_advice.js
├── config.js   ← Place your Pixabay API key file here
└── README.en.md
```

> **Note:** The `config.js` file is not included by default. You must create it manually as described above.

---

## 🖼️ Personal Advice Image Dynamics

- Each personalized advice includes a relevant image shown after the text, based on mapped keywords in the interface language (e.g., "isolation", "verbal bullying", "fear", "friendship").
- Images are pulled from Pixabay and the most relevant (first filtered result) is shown.
- If no match is found, a default educational image is displayed.

---

## 🌐 Multilingual Support (i18n)

- Translation files (Hebrew, English, French) are in `kids-bullying/i18n`.
- Each language has its own JSON file: `he.json`, `en.json`, `fr.json`.
- The UI, keyword mappings, graphs, and advice content load dynamically according to selected language.
- Adding new languages is easy by adding a new translated file.

#### 📦 Sample i18n Structure:
```json
{
  "ui": { "title": "...", ... },
  "define": { "title": "...", ... },
  "charts": {
    "impactLabels": ["...", "...", "...", "..."],
    "preventionLabels": ["...", "...", "...", "..."]
  },
  "adviceRich": {
    "verbal": { "parent": { "5-6": "...", ... }, ... },
    ...
  }
}
```

---

## 🤖 Dynamic Advice Engine (`mock_advice.js`)

- Selects contextual answers by topic (verbal, isolation, physical, bully, general), user profile (parent, child, teacher, counselor), age, and language.
- Advice texts are managed via i18n and are easily translatable and extensible.
- Full multilingual support.

---

## 🛡️ Image Refresh Protection (User-Friendly)

All image refresh buttons (🔄) – for section illustrations and personalized advice – are protected by a smart global rate limiter:
- 🔄 If you click any refresh button more than 5 times in 10 seconds, a friendly toast message will ask you to slow down, and no new images will be loaded.
- ⏳ If you refresh more than 15 times in 60 seconds (or 8 in 20 seconds), all refresh buttons are temporarily locked for 2 minutes to protect your Pixabay API credits.
- ⏳ While locked, any click shows a clear message and does not trigger an API call.
- ✅ After 2 minutes, the buttons are automatically unlocked and you can refresh again.
- All messages and indicators are fully translated and accessible in your chosen language.

**Why?** This protects you from accidental or automated overuse, keeps the app fast and fair for everyone, and ensures you never run out of image credits by mistake. The system always provides clear, friendly feedback in your language.

---

## ♿ Accessibility

- All key elements include tabindex, aria-label, aria-live, dynamic alt text, high contrast, RTL/LTR support, keyboard navigation, graph descriptions, and accessible tabs.
- Hierarchical headers (h1-h3), focus management, error messages with aria-live, and dynamic content accessibility.

### 🗣️ TTS Usage Example
- To listen to a section: click the speaker button (🔊) at the top of any section.
- Click again to stop, or click another to switch.
- Adjust speech rate and pitch using the sliders at the top of the page.
- Settings are saved automatically for your next visit.
- If no Hebrew voice is available, a gentle message with install instructions will appear.

---

## 🌏 Adding a New Language

1. 📄 Copy an existing i18n file (`he.json`/`en.json`/`fr.json`) and translate it.
2. ➕ Add the language to the dropdown in `index.html`.
3. 🛠️ Make sure `script.js` loads the new file by language code.
4. 🖼️ Update image alt and descriptions as needed.

---

## 🏅 Credits

- 🖼️ **Images**: [Pixabay](https://pixabay.com/)
- 💻 **Lovingly developed ❤️ by gchimon**
- 🤖 **AI & Dynamic Help**: OpenAI ChatGPT
- 📄 **Theoretical article**: The initial draft was written in Gemini Canvas, then converted to a webfile and adapted for the app – for transparency and fairness.
- 🗂️ **Source code**: Available on [GitHub](https://github.com/gchimon/kids-bullying)
- 🌐 **Live site**: [kids-bullying.netlify.app](https://kids-bullying.netlify.app/)
- 🗄️ **Code hosting**: GitHub | **Site hosting**: Netlify

---

## 📚 Theoretical Background: Full Article

(The full article appears here, with subheadings, highlights, and lists – keep all original content)

