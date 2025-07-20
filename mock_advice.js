// mock_advice.js
// מנוע דמה: ייעוץ מפורט למצבי בריונות, מותאם לגילאי 5-13
// ניתן להרחיב בקלות מקרים ותשובות

/**
 * מחזיר תשובה מפורטת ומדורגת להורה, לפי תרחיש ומילות מפתח.
 * @param {string} scenario - תיאור המקרה מההורה
 * @returns {string} תשובה בפורמט HTML
 */
function getMockAdvice(scenario, askerType, askerAge) {
  const dict = window.currentDict;
  const text = scenario.toLowerCase();
  // ניתוח הקשר
  let context = 'general';
  if (text.match(/(קללה|עלבון|לעג|מילים פוגעות|מכנה|מקלל|משפיל|insult|curse|mock|hurtful|verbal|insulte|moquerie|paroles)/)) context = 'verbal';
  else if (text.match(/(לא רוצה לשחק|לא משתף|נידוי|חרם|בודד|התעלמות|ostracism|isolation|excluded|lonely|isolement|exclusion|solitude)/)) context = 'isolation';
  else if (text.match(/(מכה|דחיפה|פיזי|פיזית|מרביץ|פצע|סימנים כחולים|physical|hit|push|injury|physique|frapper|pousser)/)) context = 'physical';
  else if (text.match(/(הילד שלי פוגע|הילד שלי מציק|הילד שלי מרביץ|הילד שלי מעליב|הילד שלי דוחה|הילד שלי מוביל חרם|bully|harceleur)/)) context = 'bully';
  // שליפה מה-i18n
  let adviceObj = dict.adviceRich?.[context]?.[askerType];
  let advice = null;
  if (typeof adviceObj === 'object') {
    advice = adviceObj[askerAge] || adviceObj.default;
  } else if (typeof adviceObj === 'string') {
    advice = adviceObj;
  }
  // fallback
  if (!advice && dict.advice && dict.advice[askerType]) advice = dict.advice[askerType];
  if (!advice && dict.advice && dict.advice.parent) advice = dict.advice.parent;
  return advice || '';
} 