// script.js
// מנוע ייעוץ דמה: תשובות מפורטות למצבי בריונות, ללא צורך ב-API
// דורש את mock_advice.js באותו תיקייה

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
// Section Image Loader (Reusable)
// =====================
async function updateSectionImage(sectionId, queryText, lang, altText) {
  const container = document.getElementById(sectionId);
  if (!container) return;
  const query = getPixabayQuery(queryText, lang);
  // אינדקס רנדומלי בטעינה ראשונה
  const key = `imgIdx_${sectionId}_${lang}`;
  let imgIdx = localStorage.getItem(key);
  if (imgIdx === null) {
    imgIdx = Math.floor(Math.random() * 10);
    localStorage.setItem(key, imgIdx.toString());
  } else {
    imgIdx = parseInt(imgIdx, 10);
    if (isNaN(imgIdx)) imgIdx = 0;
  }
  const imgUrl = await getPixabayImageUrl(query, lang, imgIdx);
  container.innerHTML = imgUrl
    ? `<div class="section-img-bg" style="background-image:url('${imgUrl}')"><span class="section-img-alt" aria-label="${altText}">${altText}</span></div>`
    : '<div style="color:#888">No image found</div>';
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
    const query = getPixabayQuery(userPrompt, window.currentLang);
    const imgUrl = await getPixabayImageUrl(query, window.currentLang);
    adviceOutput.innerHTML =
      advice +
      (imgUrl ? `<img src="${imgUrl}" alt="תמונה רלוונטית לתשובה" class="section-img" />` : '<div style="color:#888">לא נמצאה תמונה מתאימה</div>') +
      '<div style="font-size:0.9em;color:#888">Images from <a href="https://pixabay.com/" target="_blank" rel="noopener">Pixabay</a></div>';
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