// script.js
// מנוע ייעוץ דמה: תשובות מפורטות למצבי בריונות, ללא צורך ב-API
// דורש את mock_advice.js באותו תיקייה

/*
====================
Global Image Refresh Rate Limit & Anti-Script Protection
====================
All image refresh buttons (section images and personalized advice) are protected by a global rate limiter:
- If the user clicks any refresh button more than 5 times in 10 seconds, a warning is shown and no API call is made.
- If more than 15 refreshes in 60 seconds, or 8 in 20 seconds, all refresh buttons are locked for 2 minutes (to prevent abuse or scripts from draining API credits).
- While locked, any click shows a toast message and does not trigger an API call.
- After 2 minutes, the buttons are automatically unlocked.
This logic is enforced in one place (canRefreshImageGlobal) and used by all refresh buttons.
*/

// =====================
// Tab Functionality
// =====================
const tabVictim = document.getElementById('tab-victim');
const tabBully = document.getElementById('tab-bully');
const contentVictim = document.getElementById('content-victim');
const contentBully = document.getElementById('content-bully');

// Toggle between victim and bully tabs
function setupTabs() {
  tabVictim.addEventListener('click', () => {
    tabVictim.classList.add('active');
    tabBully.classList.remove('active');
    contentVictim.classList.remove('hidden');
    contentBully.classList.add('hidden');
  });
  tabBully.addEventListener('click', () => {
    tabBully.classList.add('active');
    tabVictim.classList.remove('active');
    contentBully.classList.remove('hidden');
    contentVictim.classList.add('hidden');
  });
}
setupTabs();

// =====================
// Chart.js Functionality
// =====================
const tooltipTitleCallback = (tooltipItems) => {
  const item = tooltipItems[0];
  let label = item.chart.data.labels[item.dataIndex];
  return Array.isArray(label) ? label.join(' ') : label;
};

const defaultChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        font: { family: "'Assistant', sans-serif", size: 14, color: '#3C3C3C' }
      }
    },
    tooltip: {
      callbacks: { title: tooltipTitleCallback },
      bodyFont: { family: "'Assistant', sans-serif" },
      titleFont: { family: "'Assistant', sans-serif" }
    }
  }
};

let impactChart = null;
let preventionChart = null;

// Update both charts with new data
function updateCharts(dict) {
  // Impact Chart
  const impactChartEl = document.getElementById('impactChart');
  const impactChartCtx = impactChartEl.getContext('2d');
  if (impactChart) impactChart.destroy();
  impactChartEl.setAttribute('aria-label', dict.charts.impactAriaLabel || '');
  impactChart = new Chart(impactChartCtx, {
    type: 'doughnut',
    data: {
      labels: dict.charts.impactLabels,
      datasets: [{
        label: dict.charts.impactLabels.join(', '),
        data: dict.charts.impactData || [40, 30, 20, 10],
        backgroundColor: ['#A7C4A8', '#7F9F80', '#B2B2B2', '#D4E2D4'],
        borderColor: '#FFFFFF',
        borderWidth: 4
      }]
    },
    options: { ...defaultChartOptions }
  });

  // Prevention Chart
  const preventionChartEl = document.getElementById('preventionChart');
  const preventionChartCtx = preventionChartEl.getContext('2d');
  if (preventionChart) preventionChart.destroy();
  preventionChartEl.setAttribute('aria-label', dict.charts.preventionAriaLabel || '');
  preventionChart = new Chart(preventionChartCtx, {
    type: 'bar',
    data: {
      labels: dict.charts.preventionLabels,
      datasets: [{
        label: dict.charts.preventionLabels.join(', '),
        data: dict.charts.preventionData || [90, 85, 75, 80],
        backgroundColor: '#A7C4A8',
        borderColor: '#7F9F80',
        borderWidth: 1,
        borderRadius: 5
      }]
    },
    options: {
      ...defaultChartOptions,
      indexAxis: 'y',
      scales: {
        x: {
          beginAtZero: true,
          max: 100,
          ticks: { font: { family: "'Assistant', sans-serif", color: '#3C3C3C' } }
        },
        y: {
          ticks: { font: { family: "'Assistant', sans-serif", size: 14, color: '#3C3C3C' } }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: { title: tooltipTitleCallback },
          bodyFont: { family: "'Assistant', sans-serif" },
          titleFont: { family: "'Assistant', sans-serif" }
        }
      }
    }
  });
}

// =====================
// Pixabay Keyword Mapping & Image Fetching
// =====================
const scenarioInput = document.getElementById('scenarioInput');
const getAdviceBtn = document.getElementById('getAdviceBtn');
const adviceOutput = document.getElementById('adviceOutput');
const loadingSpinner = document.getElementById('loadingSpinner');

// מילון מיפוי מילים לתמונות
const pixabayKeywordMap = [
  { he: ['בריונות', 'אלימות', 'פיזי', 'פיזית', 'מכה', 'דחיפה', 'מרביץ', 'פצע', 'סימנים כחולים'], en: 'bullying children' },
  { he: ['קללה', 'עלבון', 'לעג', 'מילים פוגעות', 'מכנה', 'מקלל', 'משפיל'], en: 'verbal bullying children' },
  { he: ['חרם', 'נידוי', 'בודד', 'לא משתף', 'לא מדברים', 'התעלמות'], en: 'isolation children' },
  { he: ['חבר', 'חברים', 'חברות', 'שיתוף', 'חברות'], en: 'friendship children' },
  { he: ['פחד', 'פחדים', 'דאגה', 'דואג'], en: 'fear child' },
  { he: ['עצב', 'עצוב', 'בוכה', 'דיכאון'], en: 'sad child' },
  { he: ['שמחה', 'שמח', 'מאושר'], en: 'happy children' },
  { he: ['הורה', 'הורים', 'משפחה', 'אמא', 'אבא'], en: 'parent child support' },
  { he: ['מורה', 'גננת', 'מחנכת', 'בית ספר', 'כיתה'], en: 'teacher classroom children' },
  { he: ['עזרה', 'תמיכה', 'עוזר', 'עזרה ראשונה'], en: 'help children' },
  { he: ['קהילה', 'חברה', 'שכונה'], en: 'community children' },
  { he: ['הצלחה', 'מצוינות', 'הישג'], en: 'success children' },
  { he: ['הקשבה', 'הבנה', 'אמפתיה'], en: 'listening children' },
  { he: ['חינוך', 'למידה', 'לימוד', 'לימודים'], en: 'education children' },
  { he: ['ילד', 'ילדים', 'נער', 'נערה'], en: 'children' }
];

// קבלת מילת חיפוש מתאימה לפי טקסט ושפה
function getPixabayQuery(text, lang) {
  const dict = window.currentDict;
  text = text.toLowerCase();
  if (!dict || !dict.keywords) return lang === 'he' ? 'children' : (lang === 'fr' ? 'enfants' : 'children');
  for (const item of dict.keywords) {
    if (lang === 'he' && item.he) {
      for (const word of item.he) {
        if (text.includes(word)) return item.result;
      }
    } else if (lang === 'en' && item.en) {
      for (const word of item.en) {
        if (text.includes(word)) return item.result;
      }
    } else if (lang === 'fr' && item.fr) {
      for (const word of item.fr) {
        if (text.includes(word)) return item.result;
      }
    }
  }
  // ברירת מחדל
  if (lang === 'he') return 'children';
  if (lang === 'fr') return 'enfants';
  return 'children';
}

// שליפת תמונה מתאימה מ-Pixabay
async function getPixabayImageUrl(query, lang, imgIndex = 0) {
  const API_KEY = window.PIXABAY_API_KEY || '';
  let q = query;
  let apiLang = lang;
  if (lang === 'he') {
    q = getPixabayQuery(query, 'he');
    apiLang = 'en';
  }
  const url = `https://pixabay.com/api/?key=${API_KEY}&q=${encodeURIComponent(q)}&image_type=photo&orientation=horizontal&safesearch=true&per_page=10&lang=${apiLang}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.hits && data.hits.length > 0) {
      // סנן kinder
      const filtered = data.hits.filter(hit =>
        !(hit.tags && hit.tags.toLowerCase().includes('kinder')) &&
        !(hit.pageURL && hit.pageURL.toLowerCase().includes('kinder'))
      );
      const images = filtered.length > 0 ? filtered : data.hits;
      if (images.length > 0) {
        const idx = Math.max(0, Math.min(imgIndex, images.length - 1));
        return images[idx].webformatURL;
      }
    }
  } catch (e) {
    console.error('Pixabay fetch error:', e);
  }
  return null;
}

// =====================
// Section Image Cache & Refresh
// =====================
const sectionImageCache = {};

function getSectionCacheKey(sectionId, lang, query) {
  return `${sectionId}__${lang}__${query}`;
}

async function fetchPixabayImages(query, lang, page = 1) {
  const API_KEY = window.PIXABAY_API_KEY || '';
  let q = query;
  let apiLang = lang;
  if (lang === 'he') {
    q = getPixabayQuery(query, 'he');
    apiLang = 'en';
  }
  const url = `https://pixabay.com/api/?key=${API_KEY}&q=${encodeURIComponent(q)}&image_type=photo&orientation=horizontal&safesearch=true&per_page=10&page=${page}&lang=${apiLang}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.hits && data.hits.length > 0) {
      // סנן kinder
      const filtered = data.hits.filter(hit =>
        !(hit.tags && hit.tags.toLowerCase().includes('kinder')) &&
        !(hit.pageURL && hit.pageURL.toLowerCase().includes('kinder'))
      );
      const images = filtered.length > 0 ? filtered : data.hits;
      return images.map(img => img.webformatURL);
    }
  } catch (e) {
    console.error('Pixabay fetch error:', e);
  }
  return [];
}

async function updateSectionImage(sectionId, queryText, lang, altText) {
  const container = document.getElementById(sectionId);
  if (!container) return;
  const query = getPixabayQuery(queryText, lang);
  const cacheKey = getSectionCacheKey(sectionId, lang, query);
  if (!sectionImageCache[cacheKey]) {
    sectionImageCache[cacheKey] = { urls: [], idx: 0, page: 1 };
  }
  const cache = sectionImageCache[cacheKey];
  // אם אין תמונות בקאש, הבא ראשונות
  if (cache.urls.length === 0) {
    cache.urls = await fetchPixabayImages(query, lang, cache.page);
    cache.idx = 0;
  }
  // אם עדיין אין תמונות, הצג הודעה
  if (cache.urls.length === 0) {
    container.innerHTML = '<div class="img-refresh-row"><button class="refresh-img-btn" aria-label="רענן תמונה" title="רענן תמונה">🔄</button><div class="img-indicator" aria-live="polite">0 / 0</div></div><div style="color:#888">לא נמצאה תמונה</div>';
    setupRefreshImageButtons();
    return;
  }
  // הצג תמונה נוכחית + כפתור רענון + אינדיקציה
  const imgUrl = cache.urls[cache.idx];
  const current = cache.idx + 1;
  const total = cache.urls.length;
  let indicatorText = `${current} / ${total}`;
  if (window.currentDict && window.currentDict.ui && window.currentDict.ui.imageIndicator) {
    indicatorText = window.currentDict.ui.imageIndicator.replace('{current}', current).replace('{total}', total);
  }
  container.innerHTML = `
    <div class="section-img-bg" style="background-image:url('${imgUrl}')">
      <span class="section-img-alt" aria-label="${altText}">${altText}</span>
    </div>
    <div class="img-refresh-row">
      <button class="refresh-img-btn" aria-label="רענן תמונה" title="רענן תמונה">🔄</button>
      <div class="img-indicator" aria-live="polite">${indicatorText}</div>
    </div>
  `;
  setupRefreshImageButtons();
}

// כפתור רענון תמונה
function setupRefreshImageButtons() {
  document.querySelectorAll('.refresh-img-btn').forEach(btn => {
    btn.onclick = null;
    btn.addEventListener('click', async function(e) {
      if (globalRefreshLocked) {
        showAdviceToast('הפעולה נחסמה זמנית עקב רענונים מרובים. נסה שוב בעוד 2 דקות.');
        return;
      }
      if (!canRefreshImageGlobal()) {
        return;
      }
      // תיקון: זיהוי sectionId נכון גם אם הכפתור לא ישיר תחת הסקשן
      const container = btn.closest('[id^=section-img-]');
      const sectionId = container ? container.id : '';
      // נזהה את queryText והlang לפי sectionId
      let lang = window.currentLang || 'he';
      let dict = window.currentDict;
      let altText = '';
      let queryText = '';
      // נזהה לפי sectionId
      switch(sectionId) {
        case 'section-img-define':
          altText = dict.sectionImages['section-img-define'] || '';
          queryText = dict.define.title;
          break;
        case 'section-img-identify':
          altText = dict.sectionImages['section-img-identify'] || '';
          queryText = dict.identify.title;
          break;
        case 'section-img-understand':
          altText = dict.sectionImages['section-img-understand'] || '';
          queryText = dict.understand.title;
          break;
        case 'section-img-act':
          altText = dict.sectionImages['section-img-act'] || '';
          queryText = dict.act.title;
          break;
        case 'section-img-prevent':
          altText = dict.sectionImages['section-img-prevent'] || '';
          queryText = dict.prevent.title;
          break;
        case 'section-img-personalize':
          altText = dict.sectionImages['section-img-personalize'] || '';
          queryText = dict.personalize.title;
          break;
        case 'section-img-footer':
          altText = dict.sectionImages['section-img-footer'] || '';
          queryText = dict.footer.title;
          break;
        default:
          altText = '';
          queryText = '';
      }
      const query = getPixabayQuery(queryText, lang);
      const cacheKey = getSectionCacheKey(sectionId, lang, query);
      if (!sectionImageCache[cacheKey]) {
        sectionImageCache[cacheKey] = { urls: [], idx: 0, page: 1 };
      }
      const cache = sectionImageCache[cacheKey];
      // עבור לתמונה הבאה
      cache.idx++;
      if (cache.idx >= cache.urls.length) {
        // נסה להביא page נוסף
        cache.page++;
        const newUrls = await fetchPixabayImages(query, lang, cache.page);
        if (newUrls.length > 0) {
          cache.urls = newUrls;
          cache.idx = 0;
        } else {
          // אין עוד תוצאות, חזור להתחלה
          cache.idx = 0;
        }
      }
      // הצג
      if (cache.urls.length === 0) {
        container.innerHTML = '<div class="img-refresh-row"><button class="refresh-img-btn" aria-label="רענן תמונה" title="רענן תמונה">🔄</button><div class="img-indicator" aria-live="polite">0 / 0</div></div><div style="color:#888">לא נמצאה תמונה</div>';
      } else {
        const imgUrl = cache.urls[cache.idx];
        const current = cache.idx + 1;
        const total = cache.urls.length;
        let indicatorText = `${current} / ${total}`;
        if (window.currentDict && window.currentDict.ui && window.currentDict.ui.imageIndicator) {
          indicatorText = window.currentDict.ui.imageIndicator.replace('{current}', current).replace('{total}', total);
        }
        container.innerHTML = `
          <div class="section-img-bg" style="background-image:url('${imgUrl}')">
            <span class="section-img-alt" aria-label="${altText}">${altText}</span>
          </div>
          <div class="img-refresh-row">
            <button class="refresh-img-btn" aria-label="רענן תמונה" title="רענן תמונה">🔄</button>
            <div class="img-indicator" aria-live="polite">${indicatorText}</div>
          </div>
        `;
      }
      setupRefreshImageButtons();
    });
  });
}

// =====================
// Section Updaters (UI)
// =====================
function updateSectionFields(fields) {
  fields.forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  });
}

function updateDefineSection(dict) {
  updateSectionFields([
    ['define-title', dict.define.title],
    ['define-desc', dict.define.desc],
    ['define-card1-title', dict.define.card1Title],
    ['define-card1-desc', dict.define.card1Desc],
    ['define-card2-title', dict.define.card2Title],
    ['define-card2-desc', dict.define.card2Desc],
    ['define-card3-title', dict.define.card3Title],
    ['define-card3-desc', dict.define.card3Desc]
  ]);
}

function updateIdentifySection(dict) {
  updateSectionFields([
    ['identify-title', dict.identify.title],
    ['identify-desc', dict.identify.desc]
  ]);
  // Update tab labels
  tabVictim.textContent = dict.identify.tabVictim;
  tabBully.textContent = dict.identify.tabBully;
  tabVictim.setAttribute('aria-label', dict.aria.tabVictim);
  tabBully.setAttribute('aria-label', dict.aria.tabBully);
  // Victim signs
  const victimList = document.querySelector('#content-victim ul');
  victimList.innerHTML = '';
  dict.identify.victimSigns.forEach((txt, i) => {
    const li = document.createElement('li');
    li.className = 'flex items-start';
    li.id = `victim-sign${i+1}`;
    li.innerHTML = `<span class="text-[#00A1E4] text-xl mr-3 rtl:ml-3 rtl:mr-0">›</span>${txt}`;
    victimList.appendChild(li);
  });
  // Bully signs
  const bullyList = document.querySelector('#content-bully ul');
  bullyList.innerHTML = '';
  dict.identify.bullySigns.forEach((txt, i) => {
    const li = document.createElement('li');
    li.className = 'flex items-start';
    li.id = `bully-sign${i+1}`;
    li.innerHTML = `<span class="text-[#E63946] text-xl mr-3 rtl:ml-3 rtl:mr-0">›</span>${txt}`;
    bullyList.appendChild(li);
  });
}

function updateUnderstandSection(dict) {
  updateSectionFields([
    ['understand-title', dict.understand.title],
    ['understand-desc', dict.understand.desc]
  ]);
}

function updateActSection(dict) {
  updateSectionFields([
    ['act-title', dict.act.title],
    ['act-desc', dict.act.desc]
  ]);
  document.getElementById('act-step1').innerHTML = dict.act.step1;
  document.getElementById('act-step2').innerHTML = dict.act.step2;
  document.getElementById('act-step3').innerHTML = dict.act.step3;
  document.getElementById('act-step4').innerHTML = dict.act.step4;
}

function updatePreventSection(dict) {
  updateSectionFields([
    ['prevent-title', dict.prevent.title],
    ['prevent-desc', dict.prevent.desc]
  ]);
}

function updatePersonalizeSection(dict) {
  updateSectionFields([
    ['personalize-title', dict.personalize.title],
    ['personalize-desc', dict.personalize.desc],
    ['askerType-label', dict.ui.askerType],
    ['askerAge-label', dict.ui.askerAge]
  ]);
  document.getElementById('scenarioInput').placeholder = dict.ui.advicePlaceholder;
  // Update button
  getAdviceBtn.textContent = dict.personalize.title;
  getAdviceBtn.setAttribute('aria-label', dict.aria.getAdviceBtn);
  document.getElementById('adviceOutput').setAttribute('aria-label', dict.aria.adviceOutput);
  document.getElementById('loadingSpinner').setAttribute('aria-label', dict.aria.loadingSpinner);
}

function updateFooterSection(dict) {
  updateSectionFields([
    ['footer-title', dict.footer.title],
    ['footer-desc', dict.footer.desc],
    ['footer-card1-title', dict.footer.card1Title],
    ['footer-card1-desc', dict.footer.card1Desc],
    ['footer-card2-title', dict.footer.card2Title],
    ['footer-card2-desc', dict.footer.card2Desc],
    ['footer-card3-title', dict.footer.card3Title],
    ['footer-card3-desc', dict.footer.card3Desc],
    ['footer-credits', dict.footer.credits]
  ]);
  document.querySelector('footer').setAttribute('aria-label', dict.aria.footer);
}

function updateCreditsBar(dict) {
  document.getElementById('credits-bar').innerHTML = `<p>${dict.creditsBar}</p>`;
}

function updateAdviceOutput(dict, askerType) {
  if (dict.advice && dict.advice[askerType]) {
    document.getElementById('adviceOutput').innerHTML = dict.advice[askerType];
  }
}

// =====================
// Language Switcher
// =====================
async function loadLangFile(lang) {
  const res = await fetch(`i18n/${lang}.json`);
  return await res.json();
}

async function setLanguage(lang) {
  localStorage.setItem('lang', lang);
  try {
    const dict = await loadLangFile(lang);
    window.currentLang = lang;
    window.currentDict = dict;
    // Update page direction and language
    const html = document.getElementById('html-root');
    if (lang === 'he') {
      html.setAttribute('dir', 'rtl');
      html.setAttribute('lang', 'he');
    } else if (lang === 'fr') {
      html.setAttribute('dir', 'ltr');
      html.setAttribute('lang', 'fr');
    } else {
      html.setAttribute('dir', 'ltr');
      html.setAttribute('lang', 'en');
    }
    // Main UI
    document.querySelector('.header-title').textContent = dict.ui.title;
    document.querySelector('.subtitle').textContent = dict.ui.subtitle;
    // Update asker type and age selectors
    document.getElementById('askerType').options[0].text = dict.ui.parent;
    document.getElementById('askerType').options[1].text = dict.ui.child;
    document.getElementById('askerType').options[2].text = dict.ui.teacher;
    document.getElementById('askerType').options[3].text = dict.ui.counselor;
    document.getElementById('askerAge').previousElementSibling.textContent = dict.ui.askerAge;
    document.getElementById('scenarioInput').placeholder = dict.ui.advicePlaceholder;
    // Update all sections
    updateDefineSection(dict);
    updateIdentifySection(dict);
    updateUnderstandSection(dict);
    updateActSection(dict);
    updatePreventSection(dict);
    updatePersonalizeSection(dict);
    updateFooterSection(dict);
    updateCreditsBar(dict);
    // Update section images
    const sectionImageDefs = [
      { id: 'section-img-define', text: dict.sectionImageQueries?.['section-img-define'] || (lang === 'he' ? 'בריונות ילדים' : lang === 'fr' ? 'intimidation enfants' : 'bullying children'), alt: dict.sectionImages?.['section-img-define'] || 'Section illustration' },
      { id: 'section-img-identify', text: dict.sectionImageQueries?.['section-img-identify'] || (lang === 'he' ? 'סימני אזהרה ילדים' : lang === 'fr' ? 'signes harcèlement enfants' : 'bullying warning signs children'), alt: dict.sectionImages?.['section-img-identify'] || 'Section illustration' },
      { id: 'section-img-understand', text: dict.sectionImageQueries?.['section-img-understand'] || (lang === 'he' ? 'רגשות ילדים' : lang === 'fr' ? 'émotions enfants' : 'emotions children'), alt: dict.sectionImages?.['section-img-understand'] || 'Section illustration' },
      { id: 'section-img-act', text: dict.sectionImageQueries?.['section-img-act'] || (lang === 'he' ? 'הורה עוזר' : lang === 'fr' ? 'parent aide enfant' : 'parent helps child'), alt: dict.sectionImages?.['section-img-act'] || 'Section illustration' },
      { id: 'section-img-prevent', text: dict.sectionImageQueries?.['section-img-prevent'] || (lang === 'he' ? 'מניעת בריונות' : lang === 'fr' ? 'prévention intimidation' : 'bullying prevention'), alt: dict.sectionImages?.['section-img-prevent'] || 'Section illustration' },
      { id: 'section-img-personalize', text: dict.sectionImageQueries?.['section-img-personalize'] || (lang === 'he' ? 'שאלה ילדים' : lang === 'fr' ? 'question enfants' : 'question children'), alt: dict.sectionImages?.['section-img-personalize'] || 'Section illustration' },
      { id: 'section-img-footer', text: dict.sectionImageQueries?.['section-img-footer'] || (lang === 'he' ? 'קהילה ילדים' : lang === 'fr' ? 'communauté enfants' : 'community children'), alt: dict.sectionImages?.['section-img-footer'] || 'Section illustration' }
    ];
    for (const section of sectionImageDefs) {
      await updateSectionImage(section.id, section.text, lang, section.alt);
    }
    // Update initial advice
    updateAdviceOutput(dict, document.getElementById('askerType').value);
    // Update charts
    updateCharts(dict);
    // Accessibility: aria-label for all main sections
    document.getElementById('define').setAttribute('aria-label', dict.aria.sectionDefine);
    document.getElementById('identify').setAttribute('aria-label', dict.aria.sectionIdentify);
    document.getElementById('understand').setAttribute('aria-label', dict.aria.sectionUnderstand);
    document.getElementById('act').setAttribute('aria-label', dict.aria.sectionAct);
    document.getElementById('prevent').setAttribute('aria-label', dict.aria.sectionPrevent);
    document.getElementById('personalize').setAttribute('aria-label', dict.aria.sectionPersonalize);
    document.querySelector('footer').setAttribute('aria-label', dict.aria.sectionFooter);
    document.querySelector('.flex.justify-center.gap-4.mb-12').setAttribute('aria-label', dict.aria.mainNav);
    document.querySelector('.flex.flex-col.items-center').setAttribute('aria-label', dict.aria.personalizeForm);
    // tabindex=0 לכל כרטיס מידע
    document.querySelectorAll('.card').forEach(card => card.setAttribute('tabindex', '0'));
    // Hide gender select and untranslated nav links for non-Hebrew
    const genderDiv = document.getElementById('genderSelect')?.parentElement;
    const linkGov = document.getElementById('link-gov');
    const linkInfo = document.getElementById('link-info');
    if (lang !== 'he') {
      if (genderDiv) genderDiv.style.display = 'none';
      if (linkGov) linkGov.style.display = 'none';
      if (linkInfo) linkInfo.style.display = 'none';
    } else {
      if (genderDiv) genderDiv.style.display = '';
      if (linkGov) linkGov.style.display = '';
      if (linkInfo) linkInfo.style.display = '';
    }
  } catch (e) {
    console.error('Language set error:', lang, e);
  }
}

function updateLanguageUI(lang) {
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('selected', btn.dataset.lang === lang);
  });
}

// =====================
// Text-to-Speech (TTS) for Sections
// =====================
// (הוסרו כל הפונקציות הישנות: getBestVoice, getTTSLang, speakText, stopTTS, setupTTSButtons, setupAdviceTTSButton, showHebrewTTSWarningBubble, וכו')

// החזרת טקסט מלא מה-i18n לכל סקשן
function getSectionI18nText(sectionId) {
  const dict = window.currentDict;
  if (!dict) return '';
  switch (sectionId) {
    case 'define':
      return [
        dict.define.title,
        dict.define.desc,
        dict.define.card1Title + ': ' + dict.define.card1Desc,
        dict.define.card2Title + ': ' + dict.define.card2Desc,
        dict.define.card3Title + ': ' + dict.define.card3Desc
      ].join('\n');
    case 'identify':
      return [
        dict.identify.title,
        dict.identify.desc,
        dict.identify.tabVictim + ': ' + dict.identify.victimSigns.join(', '),
        dict.identify.tabBully + ': ' + dict.identify.bullySigns.join(', ')
      ].join('\n');
    case 'understand':
      return [dict.understand.title, dict.understand.desc].join('\n');
    case 'act':
      return [dict.act.title, dict.act.desc, dict.act.step1, dict.act.step2, dict.act.step3, dict.act.step4].join('\n');
    case 'prevent':
      return [dict.prevent.title, dict.prevent.desc].join('\n');
    case 'personalize':
      return [dict.personalize.title, dict.personalize.desc].join('\n');
    case 'footer':
      return [
        dict.footer.title,
        dict.footer.desc,
        dict.footer.card1Title + ': ' + dict.footer.card1Desc,
        dict.footer.card2Title + ': ' + dict.footer.card2Desc,
        dict.footer.card3Title + ': ' + dict.footer.card3Desc,
        dict.footer.credits
      ].join('\n');
    default:
      return '';
  }
}

function getAdviceText() {
  // Get only visible text from #adviceOutput, excluding images/links/icons
  const adviceDiv = document.getElementById('adviceOutput');
  if (!adviceDiv) return '';
  // Remove images, links, divs, emoji/icons
  const clone = adviceDiv.cloneNode(true);
  clone.querySelectorAll('img, a, div, span[aria-hidden], .emoji-icon, .flowchart-arrow').forEach(el => el.remove());
  return clone.textContent.trim();
}

// ===============
// TTSPlayer integration
// ===============
function setupTTSButtons() {
  document.querySelectorAll('.tts-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const section = btn.closest('section, footer');
      if (!section) return;
      const sectionId = section.id || (section.tagName === 'FOOTER' ? 'footer' : '');
      const text = getSectionI18nText(sectionId);
      if (!text) return;
      const lang = window.currentLang === 'he' ? 'he-IL' : window.currentLang === 'fr' ? 'fr-FR' : 'en-US';
      const sectionTitle = section.querySelector('h2')?.textContent || '';
      TTSPlayer.open({ text, lang, sectionTitle });
    });
  });
}
function setupAdviceTTSButton() {
  const btn = document.querySelector('.tts-advice-btn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const text = getAdviceText();
    if (!text) return;
    const lang = window.currentLang === 'he' ? 'he-IL' : window.currentLang === 'fr' ? 'fr-FR' : 'en-US';
    const sectionTitle = document.getElementById('personalize-title')?.textContent || '';
    TTSPlayer.open({ text, lang, sectionTitle });
  });
}

// הפעל גם אחרי טעינת שפה
const origSetLanguage = setLanguage;
setLanguage = async function(lang) {
  await origSetLanguage(lang);
  setupTTSButtons();
  setupAdviceTTSButton();
};

// ===============
// TTS Settings Popup
// ===============
let ttsRate = parseFloat(localStorage.getItem('ttsRate')) || 1.0;
let ttsPitch = parseFloat(localStorage.getItem('ttsPitch')) || 1.0;
let ttsPopup = null;
let ttsPopupBtn = null;

function showTTSSettingsPopup(btn) {
  // הסר בועית קודמת
  if (ttsPopup) ttsPopup.remove();
  document.querySelectorAll('.tts-settings-popup').forEach(p => p.remove());
  ttsPopupBtn = btn;
  // צור בועית
  ttsPopup = document.createElement('div');
  ttsPopup.className = 'tts-settings-popup';
  ttsPopup.setAttribute('role', 'dialog');
  ttsPopup.setAttribute('aria-modal', 'true');
  ttsPopup.setAttribute('tabindex', '0');
  ttsPopup.innerHTML = `
    <button class="tts-popup-close" aria-label="סגור הגדרות" title="סגור">✖️</button>
    <label for="tts-popup-rate">מהירות דיבור: <span id="tts-popup-rate-value">${ttsRate.toFixed(2)}</span></label><br>
    <input type="range" min="0.5" max="2" step="0.05" value="${ttsRate}" id="tts-popup-rate" aria-labelledby="tts-popup-rate-label"><br>
    <label for="tts-popup-pitch">טון דיבור: <span id="tts-popup-pitch-value">${ttsPitch.toFixed(2)}</span></label><br>
    <input type="range" min="0.5" max="2" step="0.05" value="${ttsPitch}" id="tts-popup-pitch" aria-labelledby="tts-popup-pitch-label">
  `;
  btn.style.position = 'relative';
  btn.parentNode.insertBefore(ttsPopup, btn.nextSibling);
  // פוקוס
  setTimeout(() => ttsPopup.focus(), 50);
  // אירועים
  ttsPopup.querySelector('.tts-popup-close').onclick = closeTTSSettingsPopup;
  ttsPopup.addEventListener('keydown', e => { if (e.key === 'Escape') closeTTSSettingsPopup(); });
  // סליידרים
  const rateInput = ttsPopup.querySelector('#tts-popup-rate');
  const pitchInput = ttsPopup.querySelector('#tts-popup-pitch');
  const rateVal = ttsPopup.querySelector('#tts-popup-rate-value');
  const pitchVal = ttsPopup.querySelector('#tts-popup-pitch-value');
  rateInput.addEventListener('input', () => {
    ttsRate = parseFloat(rateInput.value);
    rateVal.textContent = ttsRate.toFixed(2);
    localStorage.setItem('ttsRate', ttsRate);
    restartSpeakingIfNeeded();
  });
  pitchInput.addEventListener('input', () => {
    ttsPitch = parseFloat(pitchInput.value);
    pitchVal.textContent = ttsPitch.toFixed(2);
    localStorage.setItem('ttsPitch', ttsPitch);
    restartSpeakingIfNeeded();
  });
  // סגירה בלחיצה מחוץ לבועית
  setTimeout(() => {
    document.addEventListener('mousedown', outsideTTSClick, { once: true });
  }, 0);
}
function closeTTSSettingsPopup() {
  if (ttsPopup) ttsPopup.remove();
  ttsPopup = null;
  ttsPopupBtn = null;
}
function outsideTTSClick(e) {
  if (ttsPopup && !ttsPopup.contains(e.target) && !e.target.classList.contains('tts-settings-btn')) {
    closeTTSSettingsPopup();
  }
}
function restartSpeakingIfNeeded() {
  if (currentTTSBtn && currentTTSBtn.classList.contains('speaking')) {
    currentTTSBtn.click(); // stop
    setTimeout(() => currentTTSBtn.click(), 100); // restart
  }
}
// הפעל popup בלחיצה על כפתור הגדרות
function setupTTSSettingsButtons() {
  document.querySelectorAll('.tts-settings-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      if (ttsPopup && ttsPopupBtn === btn) {
        closeTTSSettingsPopup();
      } else {
        showTTSSettingsPopup(btn);
      }
    });
  });
}
// הפעל את הפונקציה הזו ב-load
window.addEventListener('DOMContentLoaded', setupTTSSettingsButtons);

// =====================
// On Page Load
// =====================
const savedLang = localStorage.getItem('lang') || 'he';
window.addEventListener('DOMContentLoaded', async () => {
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      await setLanguage(btn.dataset.lang);
    });
  });
  await setLanguage(savedLang);
});

// =====================
// Personalized Advice with Dynamic Image
// =====================
// Advice image cache
const adviceImageCache = {};
function getAdviceCacheKey(prompt, lang) {
  return `${lang}__${prompt.trim().toLowerCase()}`;
}
async function fetchAdviceImages(query, lang, page = 1) {
  return await fetchPixabayImages(query, lang, page);
}
// Toast for rate limit (used globally)
function showAdviceToast(msg) {
  let toast = document.getElementById('advice-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'advice-toast';
    toast.style.position = 'fixed';
    toast.style.bottom = '2.5rem';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.background = '#fff';
    toast.style.color = '#0077C0';
    toast.style.padding = '0.7em 1.5em';
    toast.style.borderRadius = '1.2em';
    toast.style.boxShadow = '0 2px 12px #0002';
    toast.style.fontWeight = 'bold';
    toast.style.fontSize = '1.1em';
    toast.style.zIndex = 9999;
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.display = 'block';
  setTimeout(() => { toast.style.display = 'none'; }, 2200);
}
// Global image refresh rate limit + anti-script protection
let globalRefreshClicks = [];
let globalRefreshLocked = false;
let globalRefreshUnlockTimeout = null;
function canRefreshImageGlobal() {
  if (globalRefreshLocked) return false;
  const now = Date.now();
  globalRefreshClicks = globalRefreshClicks.filter(ts => now - ts < 60000);
  // Strong protection: 15 in 60s or 8 in 20s
  const last20s = globalRefreshClicks.filter(ts => now - ts < 20000);
  if (globalRefreshClicks.length >= 15 || last20s.length >= 8) {
    globalRefreshLocked = true;
    showAdviceToast('הפעולה נחסמה זמנית עקב רענונים מרובים. נסה שוב בעוד 2 דקות.');
    if (globalRefreshUnlockTimeout) clearTimeout(globalRefreshUnlockTimeout);
    globalRefreshUnlockTimeout = setTimeout(() => {
      globalRefreshLocked = false;
      showAdviceToast('הכפתור שוחרר, אפשר לרענן שוב.');
    }, 120000); // 2 דקות
    return false;
  }
  // Normal rate limit
  globalRefreshClicks = globalRefreshClicks.filter(ts => now - ts < 10000);
  if (globalRefreshClicks.length >= 5) {
    showAdviceToast('האט בבקשה, כדי לא לבזבז את הקרדיט על התמונות');
    return false;
  }
  globalRefreshClicks.push(now);
  return true;
}
async function renderAdviceOutput(advice, userPrompt, lang) {
  const query = getPixabayQuery(userPrompt, lang);
  const cacheKey = getAdviceCacheKey(userPrompt, lang);
  if (!adviceImageCache[cacheKey]) {
    adviceImageCache[cacheKey] = { urls: [], idx: 0, page: 1, allUrls: [], allCount: 0 };
  }
  const cache = adviceImageCache[cacheKey];
  if (!cache.allUrls) cache.allUrls = [];
  if (!cache.allCount) cache.allCount = 0;
  if (cache.urls.length === 0) {
    cache.urls = await fetchAdviceImages(query, lang, cache.page);
    cache.idx = 0;
    // צבירת כל התמונות שהתקבלו עד כה
    cache.allUrls = cache.allUrls.concat(cache.urls);
    cache.allCount = cache.allUrls.length;
  }
  let imgHtml = '';
  if (cache.urls.length > 0) {
    // חישוב אינדקס כולל (לדוג' 11/20)
    const globalIdx = (cache.page - 1) * 10 + cache.idx + 1;
    const globalCount = cache.allCount;
    let indicatorText = `${globalIdx} / ${globalCount}`;
    if (window.currentDict && window.currentDict.ui && window.currentDict.ui.imageIndicator) {
      indicatorText = window.currentDict.ui.imageIndicator.replace('{current}', globalIdx).replace('{total}', globalCount);
    }
    const imgUrl = cache.urls[cache.idx];
    // תמיד מחליפים innerHTML, אין צורך לבדוק אם יש כבר section-img-bg
    imgHtml = `
      <div class=\"section-img-bg\">\n          <img src=\"${imgUrl}\" alt=\"תמונה רלוונטית לתשובה\" class=\"section-img\" style=\"margin-bottom:0.5rem;\" />\n          <div class=\"img-refresh-row\">\n            <button class=\"refresh-img-btn\" aria-label=\"רענן תמונה\" title=\"רענן תמונה\">🔄</button>\n            <div class=\"img-indicator\" aria-live=\"polite\">${indicatorText}</div>\n          </div>\n        </div>\n      `;
    adviceOutput.innerHTML =
      advice +
      imgHtml +
      '<div style=\"font-size:0.9em;color:#888\">Images from <a href=\"https://pixabay.com/\" target=\"_blank\" rel=\"noopener\">Pixabay</a></div>';
    setupAdviceRefreshBtn(userPrompt, lang);
    return;
  } else {
    // אין תמונה – הצג רק שורת רענון והודעה
    imgHtml = `
      <div class=\"section-img-bg\">\n        <div class=\"img-refresh-row\">\n          <button class=\"refresh-img-btn\" aria-label=\"רענן תמונה\" title=\"רענן תמונה\">🔄</button>\n          <div class=\"img-indicator\" aria-live=\"polite\">0 / 0</div>\n        </div>\n      </div>\n      <div style=\"color:#888\">לא נמצאה תמונה מתאימה</div>\n    `;
    adviceOutput.innerHTML =
      advice +
      imgHtml +
      '<div style=\"font-size:0.9em;color:#888\">Images from <a href=\"https://pixabay.com/\" target=\"_blank\" rel=\"noopener\">Pixabay</a></div>';
    setupAdviceRefreshBtn(userPrompt, lang);
    return;
  }
  // אם לא היה צורך להחליף innerHTML, עדיין צריך לעדכן את כפתור הרענון
  setupAdviceRefreshBtn(userPrompt, lang);
}
function setupAdviceRefreshBtn(userPrompt, lang) {
  const btn = adviceOutput.querySelector('.refresh-img-btn');
  if (!btn) return;
  btn.onclick = null;
  btn.addEventListener('click', async function(e) {
    if (globalRefreshLocked) {
      showAdviceToast('הפעולה נחסמה זמנית עקב רענונים מרובים. נסה שוב בעוד 2 דקות.');
      return;
    }
    if (!canRefreshImageGlobal()) {
      return;
    }
    const query = getPixabayQuery(userPrompt, lang);
    const cacheKey = getAdviceCacheKey(userPrompt, lang);
    if (!adviceImageCache[cacheKey]) {
      adviceImageCache[cacheKey] = { urls: [], idx: 0, page: 1, allUrls: [], allCount: 0 };
    }
    const cache = adviceImageCache[cacheKey];
    cache.idx++;
    if (cache.idx >= cache.urls.length) {
      cache.page++;
      const newUrls = await fetchAdviceImages(query, lang, cache.page);
      if (newUrls.length > 0) {
        cache.urls = newUrls;
        cache.idx = 0;
        // צבירת כל התמונות שהתקבלו עד כה
        cache.allUrls = cache.allUrls.concat(newUrls);
        cache.allCount = cache.allUrls.length;
      } else {
        cache.idx = 0;
      }
    }
    // רנדר מחדש
    renderAdviceOutput(window.lastAdviceText, userPrompt, lang);
  });
}

getAdviceBtn.addEventListener('click', async () => {
  const userPrompt = scenarioInput.value.trim();
  const askerType = document.getElementById('askerType').value;
  const askerAge = document.getElementById('askerAge').value;
  const gender = document.getElementById('genderSelect') ? document.getElementById('genderSelect').value : 'male';
  if (!userPrompt) {
    adviceOutput.textContent = window.currentDict?.ui?.adviceEmpty || 'אנא תארו את התרחיש כדי לקבל עצה.';
    return;
  }
  loadingSpinner.style.display = 'block';
  adviceOutput.style.display = 'none';
  getAdviceBtn.disabled = true;
  setTimeout(async () => {
    const advice = window.getMockAdvice(userPrompt, askerType, askerAge, gender);
    window.lastAdviceText = advice;
    await renderAdviceOutput(advice, userPrompt, window.currentLang);
    loadingSpinner.style.display = 'none';
    adviceOutput.style.display = 'block';
    getAdviceBtn.disabled = false;
  }, 600);
});

// =====================
// דינמיות טעינת תמונות סקשן ראשונית (לגיבוי)
// =====================
window.addEventListener('DOMContentLoaded', async () => {
  const sectionQueries = [
    { id: 'section-img-define', text: 'בריונות ילדים' },
    { id: 'section-img-identify', text: 'סימני אזהרה ילדים' },
    { id: 'section-img-understand', text: 'עצב ילדים' },
    { id: 'section-img-act', text: 'הורה עוזר' },
    { id: 'section-img-prevent', text: 'חינוך ילדים' },
    { id: 'section-img-personalize', text: 'שאלה ילדים' },
    { id: 'section-img-footer', text: 'קהילה ילדים' }
  ];
  for (const section of sectionQueries) {
    await updateSectionImage(section.id, section.text, window.currentLang, 'Section illustration');
  }
});

window.addEventListener('DOMContentLoaded', () => {
  // Ensure voices are loaded before first TTS use
  if (typeof speechSynthesis !== 'undefined' && speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = () => {};
  }
  setupTTSButtons();
  setupAdviceTTSButton();
  setupRefreshImageButtons(); // Call setupRefreshImageButtons here
  // ודא הצגת בועית 'אין קול עברי' גם בטעינה ראשונה
  setTimeout(() => {
    if (window.currentLang === 'he') {
      const hasVoice = window.speechSynthesis.getVoices().some(v => v.lang === 'he-IL');
      if (!hasVoice) {
        const firstBtn = document.querySelector('.tts-btn');
        if (firstBtn) TTSPlayer.open({ text: 'לא נמצא קול עברי במערכת.', lang: 'he-IL', sectionTitle: 'הגדרות' });
      }
    }
  }, 800); // זמן קצר לטעינת קולות
}); 