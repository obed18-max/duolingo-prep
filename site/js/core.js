/* DET Prep — cœur : stockage, répétition espacée, carnet d'erreurs, interface, voix, sauvegarde. */
(function () {
  'use strict';
  const VERSION = '1.3.0';
  const CHANGELOG = [
    ['1.3.0', '15 nov. 2026', [
      'Examen blanc complet (≈ 1 h, ordre officiel) et diagnostic (≈ 15 min), avec une estimation sur 160 par compétence.',
      'Grammaire C1 : 10 leçons (Comprendre → Écouter → Exercices → À dire) avec les pièges de francophone.',
      'Vocabulaire académique : 128 mots en lots de 8, quiz avec révision des mots faibles.',
      'Dictionnaire : touche un mot dans l\'histoire pour sa traduction, l\'écouter et l\'ajouter à tes mots.',
      'Histoire à Windsor (3 épisodes, tu joues Obed au micro), Memory, appel en direct avec Claude (copie Claude).',
      'Carte du parcours en 24 unités, badges, courbes par compétence dans Progrès.'
    ]],
    ['1.2.0', '15 nov. 2026', [
      'Écriture : Writing Sample, Interactive Writing, Write About the Photo, avec compteur de mots, objectif et rythme en direct.',
      'Détecteur de TES fautes (adjectifs en -s, majuscules, that why, raise/rise, calques, phrase d\'annonce…) après chaque écrit.',
      'Oral : Interactive Speaking avec le bouton Record Now (oubli = 0), Speak About the Photo, Read Then Speak, Speaking Sample.',
      'Shadowing et prononciation (th, h, ship/sheep, accent de mot, -ed). Ton enregistrement reste sur ton téléphone.',
      'Écoute : Listen and Type (3 écoutes, correction mot à mot) et Interactive Listening (compléter, répondre, résumer).',
      'Interactive Reading : 5 tâches, chrono partagé de 7 min 30.',
      'Plan du jour en 6 étapes qui alterne lecture, écrit, oral et écoute.'
    ]],
    ['1.1.0', '15 nov. 2026', [
      'Copie dans Claude : voix Claude, bouton « 🤖 Explique-moi » sur chaque erreur, sauvegarde automatique.',
      'Fenêtres de confirmation intégrées à l\'app (au lieu de celles du navigateur).',
      'Les trous sont soulignés lettre par lettre, comme au vrai test.'
    ]],
    ['1.0.0', '15 nov. 2026', [
      'Squelette de l\'app : Aujourd\'hui, Parcours, Examen, Progrès, Plus (thème clair/sombre, installable).',
      'Fill in the Blanks (20 s) et Read and Complete (3 min) avec correction lettre par lettre.',
      'Habitude « Relis la phrase » : avant de valider, tu relis la phrase avec tes mots.',
      'Pièges de sens : quand tu écris un mot qui ressemble (modern/modest), l\'app te le signale.',
      'Mes fautes : 8 familles tirées de tes copies, en répétition espacée.',
      'Cognats et faux amis pour le Read and Select.',
      'Carnet d\'erreurs, plan du jour, compte à rebours jusqu\'au test, sauvegarde par code.'
    ]]
  ];
  const KEY = 'det_store';
  const INT = [1, 3, 7, 15, 30, 60, 120]; // jours
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------- utilitaires ---------- */
  const pad = n => String(n).padStart(2, '0');
  const dstr = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const today = () => dstr(new Date());
  const addDays = (s, n) => { const d = new Date(s + 'T12:00:00'); d.setDate(d.getDate() + n); return dstr(d); };
  const daysBetween = (a, b) => Math.round((new Date(b + 'T12:00:00') - new Date(a + 'T12:00:00')) / 864e5);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pick = (a, n) => shuffle(a).slice(0, n);
  // Graine du jour : même plan toute la journée
  function seeded(seed) { let h = 2166136261; for (const c of seed) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 1e6) / 1e6; }; }
  function seededShuffle(a, seed) { const r = seeded(seed); a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

  /* ---------- stockage ---------- */
  const DEFAULT = () => ({
    v: 1, created: today(),
    settings: { theme: 'auto', size: 'm', sound: true, rate: 0.95, voice: '', mascot: true, timer: true, reread: true },
    profile: { goal: 120, testDate: '2026-11-22', best: { listening: 115, speaking: 105, writing: 105, reading: 95 } },
    points: 0, streak: { n: 0, last: '' }, days: {},
    srs: {}, errors: [], seen: {}, hist: [], active: {}, notes: [], checklist: {}, lastVersion: ''
  });
  let S;
  function load() {
    try { S = JSON.parse(localStorage.getItem(KEY)) || DEFAULT(); } catch (e) { S = DEFAULT(); }
    const d = DEFAULT();
    for (const k in d) if (S[k] === undefined) S[k] = d[k];
    for (const k in d.settings) if (S.settings[k] === undefined) S.settings[k] = d.settings[k];
    for (const k in d.profile) if (S.profile[k] === undefined) S.profile[k] = d.profile[k];
  }
  let saveT;
  function save() {
    clearTimeout(saveT);
    saveT = setTimeout(() => {
      try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { toast('Stockage plein : fais une sauvegarde'); }
      if (App.sync) App.sync(S);
    }, 120);
  }
  function day(d = today()) { return S.days[d] || (S.days[d] = { pts: 0, done: {}, ok: 0, ko: 0 }); }

  /* ---------- répétition espacée ---------- */
  const srs = {
    grade(id, ok, meta) {
      const it = S.srs[id] || { b: -1, n: 0, lapses: 0 };
      it.n++;
      if (ok) { it.b = Math.min(it.b + 1, INT.length - 1); it.due = addDays(today(), INT[it.b]); }
      else { it.b = 0; it.lapses++; it.due = addDays(today(), 1); }
      if (meta) it.m = meta;
      it.last = today();
      S.srs[id] = it; save();
    },
    due(prefix) {
      const t = today();
      return Object.entries(S.srs).filter(([id, v]) => v.due <= t && (!prefix || id.startsWith(prefix))).map(([id]) => id);
    },
    weak(prefix, n) {
      return Object.entries(S.srs).filter(([id, v]) => (!prefix || id.startsWith(prefix)) && v.lapses > 0)
        .sort((a, b) => b[1].lapses - a[1].lapses).slice(0, n).map(([id]) => id);
    },
    has: id => !!S.srs[id]
  };

  /* ---------- carnet d'erreurs ---------- */
  const CATS = {
    sens: ['Mot qui a les bonnes lettres mais pas le bon sens', '🎯'],
    collocation: ['Collocation', '🔗'],
    orthographe: ['Orthographe', '✏️'],
    'adj-s': ['Adjectif accordé (-s)', '🅰️'],
    pluriel: ['Pluriel oublié', '➕'],
    majuscule: ['Majuscule', '🔠'],
    confusion: ['Mots confondus (chance/change, raise/rise)', '🔀'],
    calque: ['Calque du français', '🇫🇷'],
    'mot-outil': ['Mot-outil (préposition, article)', '🧩'],
    grammaire: ['Grammaire', '📐'],
    'faux-ami': ['Faux ami', '🎭'],
    cognat: ['Cognat non reconnu', '🔍'],
    remplissage: ['Phrase de remplissage / piège', '🫧'],
    ponctuation: ['Ponctuation', '❗']
  };
  function logError(e) {
    S.errors.push(Object.assign({ t: Date.now(), d: today() }, e));
    if (S.errors.length > 2000) S.errors.splice(0, S.errors.length - 2000);
    save();
  }
  function topErrors(n = 5, sinceDays = 3650) {
    const lim = addDays(today(), -sinceDays), c = {};
    S.errors.filter(e => e.d >= lim).forEach(e => { c[e.cat] = (c[e.cat] || 0) + 1; });
    return Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, n);
  }

  /* ---------- points, série, statistiques ---------- */
  function addPoints(n) { S.points += n; day().pts += n; save(); renderHeader(); }
  function record(skill, ok, total) {
    S.hist.push({ d: today(), s: skill, ok, n: total });
    if (S.hist.length > 3000) S.hist.splice(0, S.hist.length - 3000);
    save();
  }
  function markStep(stepId) {
    const dd = day();
    if (dd.done[stepId]) return;
    dd.done[stepId] = true;
    addPoints(20);
    if (App.today && App.today.isComplete()) {
      const t = today();
      if (S.streak.last !== t) {
        S.streak.n = (S.streak.last === addDays(t, -1)) ? S.streak.n + 1 : 1;
        S.streak.last = t; save();
        confetti(); toast('Plan du jour terminé ! 🔥 ' + S.streak.n);
      }
    }
    save();
  }

  /* ---------- interface ---------- */
  function h(html) { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; }
  let toastT;
  function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 2200); }
  function sheet(html, onMount) {
    $('#sheetBody').innerHTML = html;
    $('#scrim').classList.add('on'); $('#sheet').classList.add('on'); $('#sheet').scrollTop = 0;
    if (onMount) onMount($('#sheetBody'));
  }
  // Remplace confirm() (bloqué dans Claude) : feuille avec deux boutons
  function ask(msg, okLabel = 'Oui', danger) {
    return new Promise(res => {
      let done = false; const fin = v => { if (done) return; done = true; closeSheet(); $('#scrim').removeEventListener('click', no); res(v); };
      const no = () => fin(false);
      sheet(`<h3 style="margin-top:6px">${esc(msg)}</h3><div class="btns" style="margin-top:14px"><button class="btn sec" id="askNo">Annuler</button><button class="btn ${danger ? 'red' : ''}" id="askYes">${esc(okLabel)}</button></div>`, b => {
        $('#askNo', b).onclick = no; $('#askYes', b).onclick = () => fin(true);
      });
      $('#scrim').addEventListener('click', no);
    });
  }
  function closeSheet() { $('#scrim').classList.remove('on'); $('#sheet').classList.remove('on'); }

  // Lecteur plein écran. Un module fournit {title, render(body, foot), onClose}
  let RUN = null, timerI = null;
  const runner = {
    open(mod) {
      RUN = mod; $('#runner').classList.add('on'); document.body.style.overflow = 'hidden';
      this.progress(0); this.timer(null); mod.render($('#rBody'), $('#rFoot'));
    },
    async close(force) {
      if (!RUN) return;
      if (!force && RUN.dirty && RUN.dirty()) {
        if (!(await ask('Quitter ? Ce que tu as déjà fait est gardé.', 'Quitter'))) return;
      }
      if (!RUN) return;
      if (!force && App.onQuit) { const q = App.onQuit; App.onQuit = null; q(); }
      const m = RUN; RUN = null; this.timer(null);
      $('#runner').classList.remove('on'); document.body.style.overflow = '';
      $('#rBody').innerHTML = ''; $('#rFoot').innerHTML = '';
      if (m.onClose) m.onClose();
      App.refresh();
    },
    progress(f) { $('#rProg').style.width = Math.round(Math.max(0, Math.min(1, f)) * 100) + '%'; },
    // Chrono : secondes, callback à 0. null = masqué
    timer(sec, onEnd) {
      clearInterval(timerI); const el = $('#rTimer');
      if (sec == null) { el.textContent = ''; return; }
      if (!S.settings.timer) { el.textContent = '∞'; return; }
      let left = sec, end = Date.now() + sec * 1000;
      const draw = () => { el.textContent = Math.floor(left / 60) + ':' + pad(left % 60); el.classList.toggle('low', left <= 10); };
      draw();
      timerI = setInterval(() => { left = Math.max(0, Math.round((end - Date.now()) / 1000)); draw(); if (left <= 0) { clearInterval(timerI); onEnd && onEnd(); } }, 250);
    },
    stopTimer() { clearInterval(timerI); },
    get active() { return RUN; }
  };

  /* ---------- son, voix, mascotte, confettis ---------- */
  let actx;
  function beep(ok) {
    if (!S.settings.sound) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = 'sine'; o.frequency.value = ok ? 880 : 220; g.gain.value = .06;
      o.connect(g); g.connect(actx.destination); o.start();
      if (ok) o.frequency.setValueAtTime(1320, actx.currentTime + .08);
      g.gain.exponentialRampToValueAtTime(.0001, actx.currentTime + .25); o.stop(actx.currentTime + .26);
    } catch (e) { }
  }
  function voices() { return (window.speechSynthesis && speechSynthesis.getVoices().filter(v => /^en[-_]/i.test(v.lang))) || []; }
  // Lire un texte à voix haute. opts.onend : appelé à la fin (ou tout de suite si aucune voix)
  function speak(text, opts = {}) {
    const end = () => { if (opts.onend) { const f = opts.onend; opts.onend = null; f(); } };
    if (App.ai && App.ai.tts && App.ai.tts(text, opts, end)) return;
    if (!window.speechSynthesis) { toast('Voix indisponible sur ce navigateur'); setTimeout(end, 1500); return; }
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const vs = voices(); const v = (opts.voice && vs.find(x => x.name === opts.voice)) || vs.find(x => x.name === S.settings.voice) || vs.find(x => /en-US/i.test(x.lang)) || vs[0];
    if (v) { u.voice = v; u.lang = v.lang; } else u.lang = 'en-US';
    u.rate = opts.rate || S.settings.rate;
    u.onend = end; u.onerror = end;
    // sécurité : certains navigateurs n'envoient jamais onend
    setTimeout(end, 1500 + text.length * 90 / (u.rate || 1));
    speechSynthesis.speak(u);
  }
  const MASCOT = `<svg class="mascot" viewBox="0 0 64 64" aria-hidden="true"><ellipse cx="32" cy="36" rx="24" ry="22" fill="#5ac8fa"/><ellipse cx="32" cy="42" rx="14" ry="11" fill="#e0f6ff"/><circle cx="23" cy="30" r="7" fill="#fff"/><circle cx="41" cy="30" r="7" fill="#fff"/><circle cx="24" cy="31" r="3.4" fill="#1c1c1e"/><circle cx="42" cy="31" r="3.4" fill="#1c1c1e"/><path d="M28 40q4 4 8 0" stroke="#1c1c1e" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M14 20l6 6M50 20l-6 6" stroke="#5ac8fa" stroke-width="5" stroke-linecap="round"/><circle cx="13" cy="18" r="3.5" fill="#ffcc00"/><circle cx="51" cy="18" r="3.5" fill="#ffcc00"/></svg>`;
  function mascot(ok) {
    if (!S.settings.mascot) return '';
    return MASCOT.replace('class="mascot"', 'class="mascot ' + (ok === true ? 'happy' : ok === false ? 'sad' : '') + '"');
  }
  function confetti() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const c = document.createElement('canvas'); c.className = 'confetti'; document.body.appendChild(c);
    const W = c.width = innerWidth, H = c.height = innerHeight, x = c.getContext('2d');
    const cols = ['#007aff', '#34c759', '#ff9500', '#ff2d55', '#af52de', '#ffcc00'];
    const P = Array.from({ length: 120 }, () => ({ x: W / 2, y: H / 3, vx: (Math.random() - .5) * 12, vy: Math.random() * -12 - 2, r: Math.random() * 6 + 3, c: cols[Math.random() * 6 | 0], a: Math.random() * 6 }));
    let f = 0; (function tick() {
      x.clearRect(0, 0, W, H);
      P.forEach(p => { p.vy += .35; p.x += p.vx; p.y += p.vy; p.a += .2; x.fillStyle = p.c; x.save(); x.translate(p.x, p.y); x.rotate(p.a); x.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); x.restore(); });
      if (++f < 110) requestAnimationFrame(tick); else c.remove();
    })();
  }

  /* ---------- sauvegarde par code ---------- */
  async function exportCode() {
    const json = JSON.stringify(S);
    if (window.CompressionStream) {
      const cs = new Blob([json]).stream().pipeThrough(new CompressionStream('gzip'));
      const buf = new Uint8Array(await new Response(cs).arrayBuffer());
      let bin = ''; for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode.apply(null, buf.subarray(i, i + 0x8000));
      return 'DETZ1:' + btoa(bin);
    }
    return 'DETJ1:' + btoa(unescape(encodeURIComponent(json)));
  }
  async function importCode(code) {
    code = code.trim();
    let json;
    if (code.startsWith('DETZ1:')) {
      const bin = atob(code.slice(6)), buf = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
      const ds = new Blob([buf]).stream().pipeThrough(new DecompressionStream('gzip'));
      json = await new Response(ds).text();
    } else if (code.startsWith('DETJ1:')) json = decodeURIComponent(escape(atob(code.slice(6))));
    else throw new Error('Code non reconnu');
    const o = JSON.parse(json);
    if (!o || !o.settings || !o.srs) throw new Error('Code incomplet');
    localStorage.setItem(KEY, JSON.stringify(o)); load(); applySettings(); App.refresh();
  }

  /* ---------- réglages / thème ---------- */
  function applySettings() {
    const st = S.settings, r = document.documentElement;
    const dark = st.theme === 'dark' || (st.theme === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
    r.dataset.theme = dark ? 'dark' : 'light'; r.dataset.size = st.size;
  }
  function renderHeader() { $('#streak').textContent = '🔥 ' + (S.streak.last >= addDays(today(), -1) ? S.streak.n : 0); }

  /* ---------- navigation ---------- */
  const TITLES = { today: 'Aujourd\'hui', path: 'Parcours', exam: 'Examen', progress: 'Progrès', more: 'Plus' };
  const pages = {};
  let current = 'today';
  function show(tab) {
    current = tab;
    $$('main>section').forEach(s => s.classList.toggle('on', s.id === 'p-' + tab));
    $$('#tabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === tab));
    $('#hdrTitle').textContent = TITLES[tab];
    scrollTo(0, 0);
    if (pages[tab]) pages[tab]($('#p-' + tab));
  }
  function refresh() { renderHeader(); if (pages[current]) pages[current]($('#p-' + current)); }

  function boot() {
    load(); if (S.settings.realKeep != null) { S.settings.reread = S.settings.realKeep; S.settings.realKeep = null; } applySettings(); renderHeader();
    matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applySettings);
    $$('#tabs button').forEach(b => b.onclick = () => show(b.dataset.tab));
    $('#rClose').onclick = () => runner.close();
    $('#scrim').onclick = closeSheet;
    addEventListener('scroll', () => $('#hdr').classList.toggle('small', scrollY > 20), { passive: true });
    // Clavier ouvert : cacher la barre d'onglets
    if (window.visualViewport) visualViewport.addEventListener('resize', () => document.body.classList.toggle('kbd', visualViewport.height < innerHeight * 0.75));
    document.addEventListener('focusin', e => { if (e.target.matches('input[type=text],textarea,.gap input')) document.body.classList.add('kbd'); });
    document.addEventListener('focusout', () => setTimeout(() => { if (!document.activeElement.matches('input,textarea')) document.body.classList.remove('kbd'); }, 50));
    // Débloquer l'audio iOS au premier toucher
    addEventListener('touchstart', function unlock() { try { speechSynthesis.speak(new SpeechSynthesisUtterance('')); } catch (e) { } removeEventListener('touchstart', unlock); }, { once: true });
    if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => { });
    if (S.lastVersion !== VERSION) { const first = !S.lastVersion; S.lastVersion = VERSION; save(); if (!first) setTimeout(() => App.pages.news(), 600); }
    show('today');
  }

  window.App = {
    VERSION, CHANGELOG, CATS, INT,
    get S() { return S; }, save, day, today, addDays, daysBetween, esc, shuffle, pick, seededShuffle, $, $$, h,
    srs, logError, topErrors, addPoints, record, markStep,
    toast, sheet, closeSheet, ask, runner, beep, speak, voices, mascot, confetti,
    exportCode, importCode, applySettings, renderHeader,
    show, refresh, boot, pages, current: () => current,
    modules: {}, ai: null, sync: null,
    reset(keepVoice) { const st = S.settings; S = DEFAULT(); if (keepVoice) { S.settings.voice = st.voice; S.settings.rate = st.rate; } save(); applySettings(); refresh(); }
  };
})();
