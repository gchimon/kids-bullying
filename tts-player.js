// tts-player.js
// Self-contained TTS Player popup component
// Usage: TTSPlayer.open({ text, lang, sectionTitle })

(function(global) {
  // עדכן תוויות ברירת מחדל
  const defaultLabels = {
    he: {
      play: 'נגן', stop: 'עצור', close: 'סגור',
      rate: 'מהירות דיבור', pitch: 'טון דיבור',
      playing: 'מנגן כעת', stopped: 'נעצר',
      title: 'הקראת טקסט',
      ariaDialog: 'נגן טקסט מדובר',
      section: 'סקשן',
    },
    en: {
      play: 'Play', stop: 'Stop', close: 'Close',
      rate: 'Speech Rate', pitch: 'Pitch',
      playing: 'Now playing', stopped: 'Stopped',
      title: 'Text-to-Speech Player',
      ariaDialog: 'Text-to-Speech dialog',
      section: 'Section',
    },
    fr: {
      play: 'Lire', stop: 'Arrêter', close: 'Fermer',
      rate: 'Vitesse de parole', pitch: 'Tonalité',
      playing: 'Lecture en cours', stopped: 'Arrêté',
      title: 'Lecteur TTS',
      ariaDialog: 'Dialogue de synthèse vocale',
      section: 'Section',
    }
  };

  function getLabels(lang) {
    if (!lang) return defaultLabels.en;
    if (lang.startsWith('he')) return defaultLabels.he;
    if (lang.startsWith('fr')) return defaultLabels.fr;
    return defaultLabels.en;
  }

  // Utility: get best voice for lang
  function getBestVoice(lang) {
    const voices = window.speechSynthesis.getVoices();
    if (lang.startsWith('he')) {
      return voices.find(v => v.lang === 'he-IL' && v.name.includes('Google')) || voices.find(v => v.lang === 'he-IL');
    }
    if (lang.startsWith('fr')) {
      return voices.find(v => v.lang === 'fr-FR' && v.name.includes('Google')) || voices.find(v => v.lang === 'fr-FR');
    }
    if (lang.startsWith('en')) {
      return voices.find(v => v.lang === 'en-US' && v.name.includes('Google')) || voices.find(v => v.lang === 'en-US');
    }
    return voices[0];
  }

  // State
  let popup = null, utter = null, isPlaying = false, lastArgs = null;
  let ttsRate = parseFloat(localStorage.getItem('ttsRate')) || 1.0;
  let ttsPitch = parseFloat(localStorage.getItem('ttsPitch')) || 1.0;
  let selectedVoiceURI = null;

  function getVoicesForLang(lang) {
    const voices = window.speechSynthesis.getVoices();
    if (!lang) return voices;
    if (lang.startsWith('he')) return voices.filter(v => v.lang && v.lang.startsWith('he'));
    if (lang.startsWith('fr')) return voices.filter(v => v.lang && v.lang.startsWith('fr'));
    if (lang.startsWith('en')) return voices.filter(v => v.lang && v.lang.startsWith('en'));
    return voices;
  }

  function getSavedVoiceURI(lang) {
    return localStorage.getItem('ttsVoiceURI_' + lang);
  }
  function saveVoiceURI(lang, uri) {
    localStorage.setItem('ttsVoiceURI_' + lang, uri);
  }

  function closePopup() {
    if (popup) popup.remove();
    popup = null;
    stopSpeech();
  }

  function stopSpeech() {
    if (window.speechSynthesis.speaking) window.speechSynthesis.cancel();
    isPlaying = false;
    utter = null;
    updatePlayPause();
  }

  function playSpeech(args) {
    stopSpeech();
    utter = new window.SpeechSynthesisUtterance(args.text);
    utter.lang = args.lang;
    utter.rate = ttsRate;
    utter.pitch = ttsPitch;
    let voice = null;
    if (selectedVoiceURI) {
      voice = window.speechSynthesis.getVoices().find(v => v.voiceURI === selectedVoiceURI);
    }
    if (!voice) {
      voice = getBestVoice(args.lang);
    }
    if (voice) utter.voice = voice;
    utter.onend = utter.onerror = () => {
      isPlaying = false;
      updatePlayPause();
    };
    window.speechSynthesis.speak(utter);
    isPlaying = true;
    updatePlayPause();
  }

  function updatePlayPause() {
    if (!popup) return;
    const btn = popup.querySelector('.ttsplayer-play');
    const lbl = popup.querySelector('.ttsplayer-status');
    const lang = lastArgs ? lastArgs.lang : 'en';
    const labels = getLabels(lang);
    // הצג תמיד את ה-SVG המתאים
    if (btn) {
      if (isPlaying) {
        btn.innerHTML = `<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="12" y="12" width="24" height="24" rx="5" fill="currentColor"/></svg>`;
        btn.setAttribute('aria-label', labels.stop || 'Stop');
        btn.setAttribute('title', labels.stop || 'Stop');
      } else {
        btn.innerHTML = `<svg viewBox="0 0 48 48" aria-hidden="true"><polygon points="14,10 38,24 14,38" fill="currentColor"/></svg>`;
        btn.setAttribute('aria-label', labels.play);
        btn.setAttribute('title', labels.play);
      }
    }
    if (lbl) {
      lbl.innerText = isPlaying ? (labels.playing || 'Now playing') : (labels.stopped || 'Stopped');
    }
  }

  function onPlayPause() {
    if (isPlaying) {
      stopSpeech();
    } else if (lastArgs) {
      playSpeech(lastArgs);
    }
  }

  function onRateChange(e) {
    ttsRate = parseFloat(e.target.value);
    localStorage.setItem('ttsRate', ttsRate);
    popup.querySelector('.ttsplayer-rate-value').innerText = ttsRate.toFixed(2);
    if (isPlaying && lastArgs) playSpeech(lastArgs);
  }
  function onPitchChange(e) {
    ttsPitch = parseFloat(e.target.value);
    localStorage.setItem('ttsPitch', ttsPitch);
    popup.querySelector('.ttsplayer-pitch-value').innerText = ttsPitch.toFixed(2);
    if (isPlaying && lastArgs) playSpeech(lastArgs);
  }

  function renderVoiceSelect(lang, dir) {
    const voices = getVoicesForLang(lang);
    if (!voices.length) return '';
    const saved = getSavedVoiceURI(lang);
    let options = voices.map(v => {
      let label = v.name;
      if (v.gender) label += v.gender === 'female' ? ' (אישה)' : v.gender === 'male' ? ' (גבר)' : '';
      else if (v.name.match(/female|woman|femme|אישה/i)) label += ' (אישה)';
      else if (v.name.match(/male|man|homme|גבר/i)) label += ' (גבר)';
      return `<option value="${v.voiceURI}"${(saved ? v.voiceURI === saved : v.default) ? ' selected' : ''}>${label}${v.localService ? '' : ' 🌐'}</option>`;
    }).join('');
    const label = lang.startsWith('he') ? 'בחר קול' : lang.startsWith('fr') ? 'Choisir une voix' : 'Choose voice';
    return `<label for="ttsplayer-voice" style="margin-bottom:0.2em;display:block;text-align:${dir==='rtl'?'right':'left'};font-weight:bold;color:#0077C0;">${label}:</label>
      <select id="ttsplayer-voice" class="ttsplayer-voice" style="margin-bottom:1em;max-width:260px;width:100%;border-radius:1em;padding:0.4em 0.7em;">
        ${options}
      </select>`;
  }

  function setupVoiceSelect(lang) {
    const sel = popup.querySelector('#ttsplayer-voice');
    if (!sel) return;
    sel.addEventListener('change', e => {
      selectedVoiceURI = sel.value;
      saveVoiceURI(lang, selectedVoiceURI);
      if (isPlaying && lastArgs) playSpeech(lastArgs);
    });
    // אתחל מה-localStorage
    const saved = getSavedVoiceURI(lang);
    if (saved) {
      selectedVoiceURI = saved;
      sel.value = saved;
    } else {
      selectedVoiceURI = sel.value;
    }
  }

  function open(args) {
    // בדוק אם נבחרה עברית ואין קול עברי
    if (args.lang && args.lang.startsWith('he')) {
      const voices = window.speechSynthesis.getVoices();
      const hasHebrew = voices.some(v => v.lang === 'he-IL');
      if (!hasHebrew) {
        // הצג הודעה במקום popup
        closePopup();
        const warn = document.createElement('div');
        warn.className = 'ttsplayer-popup';
        warn.setAttribute('role', 'alertdialog');
        warn.setAttribute('aria-modal', 'true');
        warn.setAttribute('tabindex', '0');
        warn.setAttribute('dir', 'rtl');
        warn.style.position = 'fixed';
        warn.style.left = '50%';
        warn.style.top = '50%';
        warn.style.transform = 'translate(-50%, -50%)';
        warn.style.zIndex = 9999;
        warn.innerHTML = `
          <button class="ttsplayer-close" aria-label="סגור" title="סגור">✖️</button>
          <div class="ttsplayer-title" style="color:#E63946;">לא נמצא קול עברי במערכת</div>
          <div class="ttsplayer-text" style="text-align:center; font-size:1.1em;">
            <p>כדי להפעיל הקראת טקסט בעברית, יש להוסיף קול עברי למערכת ההפעלה.<br><br>
            <b>הוראות התקנת קול עברי ב-Windows:</b></p>
            <ol style="text-align:right; direction:rtl; margin:0 auto; max-width:400px; font-size:1em; padding-right:1.2em;">
              <li>פתחו את <b>הגדרות Windows</b> (Settings).</li>
              <li>עברו ל- <b>זמן ושפה</b> (Time & Language) &rarr; <b>דיבור</b> (Speech).</li>
              <li>גללו לקטע <b>קולות</b> (Voices) ולחצו <b>הוסף קולות</b> (Add voices).</li>
              <li>בחרו <b>עברית (Hebrew)</b> מהרשימה ולחצו <b>התקן</b> (Install).</li>
              <li>לאחר ההתקנה, סגרו את הדפדפן ופתחו מחדש.</li>
            </ol>
            <div style="color:#888; font-size:0.95em; margin-top:0.7em;">הקול העברי יופיע ברשימת הקולות של מערכת Windows. ייתכן שתצטרכו להפעיל מחדש את הדפדפן.</div>
          </div>
        `;
        document.body.appendChild(warn);
        setTimeout(() => warn.focus(), 50);
        warn.querySelector('.ttsplayer-close').onclick = () => { warn.remove(); };
        warn.addEventListener('keydown', e => { if (e.key === 'Escape') warn.remove(); });
        return;
      }
    }
    closePopup();
    lastArgs = args;
    const labels = getLabels(args.lang);
    // RTL/LTR
    const dir = args.lang && args.lang.startsWith('he') ? 'rtl' : 'ltr';
    const voiceSelectHTML = renderVoiceSelect(args.lang, dir);
    // Popup
    popup = document.createElement('div');
    popup.className = 'ttsplayer-popup';
    popup.setAttribute('role', 'dialog');
    popup.setAttribute('aria-modal', 'true');
    popup.setAttribute('tabindex', '0');
    popup.setAttribute('dir', dir);
    popup.setAttribute('aria-label', labels.ariaDialog);
    popup.innerHTML = `
      <button class="ttsplayer-close" aria-label="${labels.close}" title="${labels.close}">✖️</button>
      <div class="ttsplayer-title">${labels.title}${args.sectionTitle ? ' – ' + args.sectionTitle : ''}</div>
      <div class="ttsplayer-section-label">${labels.section}: ${args.sectionTitle || ''}</div>
      <div class="ttsplayer-text">${args.text}</div>
      ${voiceSelectHTML}
      <div class="ttsplayer-controls">
        <button class="ttsplayer-play" aria-label="${labels.play}">${labels.play}</button>
        <span class="ttsplayer-status">${labels.stopped}</span>
      </div>
      <div class="ttsplayer-sliders">
        <label for="ttsplayer-rate">${labels.rate}: <span class="ttsplayer-rate-value">${ttsRate.toFixed(2)}</span></label>
        <input type="range" min="0.5" max="2" step="0.05" value="${ttsRate}" id="ttsplayer-rate" class="ttsplayer-slider" aria-label="${labels.rate}">
        <label for="ttsplayer-pitch">${labels.pitch}: <span class="ttsplayer-pitch-value">${ttsPitch.toFixed(2)}</span></label>
        <input type="range" min="0.5" max="2" step="0.05" value="${ttsPitch}" id="ttsplayer-pitch" class="ttsplayer-slider" aria-label="${labels.pitch}">
      </div>
    `;
    document.body.appendChild(popup);
    setTimeout(() => popup.focus(), 50);
    // Events
    popup.querySelector('.ttsplayer-close').onclick = closePopup;
    popup.querySelector('.ttsplayer-play').onclick = onPlayPause;
    popup.querySelector('#ttsplayer-rate').oninput = onRateChange;
    popup.querySelector('#ttsplayer-pitch').oninput = onPitchChange;
    if (voiceSelectHTML) setupVoiceSelect(args.lang);
    popup.addEventListener('keydown', e => { if (e.key === 'Escape') closePopup(); });
    // Center popup
    popup.style.position = 'fixed';
    popup.style.left = '50%';
    popup.style.top = '50%';
    popup.style.transform = 'translate(-50%, -50%)';
    popup.style.zIndex = 9999;
    // אל תתחיל להקריא אוטומטית
    // playSpeech(args); // הוסר
  }

  // Expose API
  global.TTSPlayer = { open };

  // Ensure voices loaded
  if (typeof speechSynthesis !== 'undefined' && speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = () => {};
  }
})(window); 