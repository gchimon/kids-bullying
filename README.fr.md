[🇮🇱 Hébreu](README.md) | [🇬🇧 Anglais](README.en.md) | [🇫🇷 Français](README.fr.md)

# 🎲 Guide interactif pour faire face à l'intimidation chez les jeunes enfants

---

## 📝 Description

**Ce site Web est basé sur les principes et les connaissances de l'article complet « Faire face à l'intimidation et à la violence verbale chez les enfants âgés de 6 à 7 ans – Guide pour les parents et les enfants » (voir la référence complète ci-dessous). Toutes les fonctionnalités, recommandations, définitions et conseils de l'application sont dérivés des principes de l'article et présentés de manière interactive et accessible.**

L'application propose :
- 📚 **Informations sur les types d'intimidation** (verbale, physique, sociale) avec des définitions claires, comme présenté dans l'article.
- 🚨 **Signes d'alerte** pour identifier les enfants victimes ou auteurs d'intimidation, selon les listes de contrôle de l'article.
- 📊 **Graphiques interactifs** montrant les effets émotionnels de l'intimidation et l'efficacité des méthodes de prévention, alignés sur les données de l'article.
- 🛡️ **Plan d'action pour les parents** avec des étapes claires et des conseils pratiques, basés sur les recommandations de l'article.
- 🤖 **Moteur de conseils dynamique** offrant des recommandations adaptées en fonction du scénario, de l'âge et du rôle de l'utilisateur, en accord avec les principes d'intervention de l'article.
- 🖼️ **Images contextuelles** illustrant les émotions et adaptées au contexte, telles que la solitude, la peur ou l'amitié – en lien direct avec l'accent mis dans l'article.
- 🌐 **Support multilingue complet**, accessibilité élevée et design adaptatif.

> **Cet outil vise à rendre les principes de l'article accessibles aux parents, éducateurs et enfants de manière engageante, interactive et personnalisée.**

---

## ✨ Fonctionnalités principales

- 🌍 **Support multilingue complet** : hébreu, anglais, français (y compris RTL/LTR, graphiques, conseils, images, interface)
- ⚡ **Chargement dynamique des textes, graphiques et conseils** : Tout le contenu est chargé depuis des fichiers JSON i18n selon la langue choisie
- 📈 **Graphiques dynamiques** : Propulsés par Chart.js avec étiquettes et valeurs adaptées à la langue
- 🤖 **Moteur de conseils dynamique** : `mock_advice.js` sélectionne des réponses contextuelles selon le rôle, l'âge et la langue
- 🖼️ **Chargement d'images contextuelles** : Chaque section et conseil affiche une image pertinente selon la langue de l'interface
- ♿ **Accessibilité complète** : tabindex, aria-label, aria-live, textes alternatifs décrivant dynamiquement les images, contraste élevé, navigation clavier, descriptions dynamiques
- 📱 **Interface responsive** : Adaptée au mobile et au bureau

### 🗣️ Expérience de synthèse vocale (TTS) améliorée
- Icône de haut-parleur animée (pulsation) pendant la lecture
- Boutons TTS basculables : cliquez à nouveau pour arrêter, ou cliquez sur un autre pour changer
- Un seul texte peut être lu à la fois
- Curseurs accessibles pour la vitesse et la tonalité de la voix (enregistrés dans localStorage)
- Accessibilité totale (ARIA, clavier, focus, contraste)
- Message doux si aucune voix hébraïque n'est disponible, avec instructions d'installation
- Fonctionne en hébreu, anglais et français (selon le navigateur)

---

## 🛠️ Technologies

| Technologie      | Usage |
|------------------|-------|
| HTML, CSS, TailwindCSS | Conception et mise en page de l'interface |
| JavaScript       | Chargement dynamique du contenu, graphiques, images et conseils |
| Chart.js         | Graphiques interactifs |
| API Pixabay      | Recherche d'images contextuelles |
| i18n (JSON)      | Fichiers de traduction multilingues |

---

## 🚀 Comment l'exécuter ?

1. 📂 Ouvrez un terminal dans le répertoire `kids-bullying`
2. ▶️ Démarrez un serveur Python :
   ```
   python -m http.server 8080
   ```
3. 🌐 Ouvrez un navigateur et allez à l'adresse : [http://localhost:8080/](http://localhost:8080/)

## Structure du projet

Voici la structure recommandée du dossier pour le projet. Vous devez ajouter votre fichier `config.js` directement dans le dossier `kids-bullying/` (à côté de index.html, script.js, etc.).

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
├── config.js   ← Placez ici votre fichier de clé API Pixabay
└── README.fr.md
```

> **Remarque :** Le fichier `config.js` n'est pas inclus par défaut. Vous devez le créer manuellement comme décrit ci-dessus.

---

## 🖼️ Dynamique des images de conseils personnalisés

- Chaque conseil personnalisé comprend une image pertinente affichée après le texte, selon des mots-clés mappés dans la langue de l'interface (ex. : "isolement", "intimidation verbale", "peur", "amitié").
- Les images sont extraites de Pixabay et la plus pertinente (premier résultat filtré) est affichée.
- En cas d'absence de correspondance, une image éducative par défaut est affichée.

---

## 🌐 Support multilingue (i18n)

- Les fichiers de traduction (hébreu, anglais, français) se trouvent dans `kids-bullying/i18n`.
- Chaque langue possède son propre fichier JSON : `he.json`, `en.json`, `fr.json`.
- L'interface, les correspondances de mots-clés, les graphiques et les conseils se chargent dynamiquement selon la langue.
- Ajouter une nouvelle langue est simple : il suffit d'ajouter un fichier traduit.

#### 📦 Exemple de structure i18n :
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

## 🤖 Moteur de conseils dynamique (`mock_advice.js`)

- Sélectionne des réponses contextuelles selon le thème (verbal, isolement, physique, agresseur, général), le profil utilisateur (parent, enfant, enseignant, conseiller), l'âge et la langue.
- Les textes de conseil sont gérés via i18n, facilement traduisibles et extensibles.
- Support multilingue complet.

---

## ♿ Accessibilité

- Tous les éléments incluent tabindex, aria-label, aria-live, textes alternatifs dynamiques, contraste élevé, support RTL/LTR, navigation clavier, descriptions de graphiques, et onglets accessibles.
- Titres hiérarchiques (h1-h3), gestion du focus, messages d'erreur avec aria-live, et accessibilité du contenu dynamique.

### 🗣️ Exemple d'utilisation du TTS
- Pour écouter une section : cliquez sur le bouton haut-parleur (🔊) en haut de chaque section.
- Cliquez à nouveau pour arrêter, ou cliquez sur un autre pour changer.
- Réglez la vitesse et la tonalité de la voix à l'aide des curseurs en haut de la page.
- Les paramètres sont enregistrés automatiquement pour votre prochaine visite.
- Si aucune voix hébraïque n'est disponible, un message doux avec des instructions d'installation s'affichera.

---

## 🌏 Ajouter une nouvelle langue

1. 📄 Copiez un fichier i18n existant (`he.json`/`en.json`/`fr.json`) et traduisez-le.
2. ➕ Ajoutez la langue au menu déroulant de sélection dans `index.html`.
3. 🛠️ Vérifiez que `script.js` charge le bon fichier par code langue.
4. 🖼️ Mettez à jour les textes alternatifs et les descriptions si nécessaire.

---

## 🏅 Crédits

- 🖼️ **Images** : [Pixabay](https://pixabay.com/)
- 💻 **Développé avec amour ❤️ par gchimon**
- 🤖 **Aide IA & dynamique** : OpenAI ChatGPT
- 📄 **Article théorique** : La première version a été rédigée dans Gemini Canvas, puis convertie en webfile et adaptée à l'application – pour la transparence et l'équité.
- 🗂️ **Code source** : Disponible sur [GitHub](https://github.com/gchimon/kids-bullying)
- 🌐 **Site en ligne** : [kids-bullying.netlify.app](https://kids-bullying.netlify.app/)
- 🗄️ **Hébergement du code** : GitHub | **Hébergement du site** : Netlify

---

## 📚 Base théorique : article complet

(L'article complet apparaît ici, avec sous-titres, mises en valeur et listes – gardez tout le contenu original)

## 🎤 Lecteur Text-to-Speech (TTS) – Popup autonome

- Lecteur TTS popup moderne, centré, avec couleurs douces, boutons ronds et ombres subtiles.
- Sélection de voix : choisissez parmi toutes les voix disponibles pour la langue (homme/femme), avec sauvegarde automatique de la préférence.
- Sliders pour vitesse et tonalité, avec sauvegarde dans le localStorage.
- Support complet RTL/LTR : toute l’interface, labels, boutons, menus.
- Accessibilité élevée : ARIA, focus, navigation clavier, descriptions des boutons.
- Alerte voix hébreu : message clair avec instructions d’installation si aucune voix hébreu n’est disponible.
- Lecture uniquement après appui sur Play (pas automatique).
- Design entièrement responsive.
- Prêt pour une future version Canvas (UI graphique/animations).

### Exemple d’utilisation :

```js
TTSPlayer.open({
  text: 'Bonjour le monde',
  lang: 'fr-FR',
  sectionTitle: 'Exemple'
});
```

