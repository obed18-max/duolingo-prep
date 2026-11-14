/* Onglets Parcours, Examen, Progrès, Plus (+ feuilles : nouveautés, idée, sauvegarde, réglages). */
(function () {
  'use strict';
  const A = App, esc = A.esc;
  const close = '<button class="btn sec" style="width:auto;min-height:36px" onclick="App.closeSheet()">Fermer</button>';
  const row = (icon, title, sub, attrs, bg) => `<button class="row" ${attrs}><span class="ic" style="background:${bg || 'var(--fill)'}">${icon}</span><span class="tx"><b>${title}</b>${sub ? `<small class="muted">${sub}</small>` : ''}</span><span class="chev">›</span></button>`;

  /* ---------- Parcours ---------- */
  A.pages.path = el => {
    const seenF = Object.keys(A.S.seen.fib || {}).length, seenR = Object.keys(A.S.seen.rac || {}).length;
    el.innerHTML = `<h1>Parcours</h1>
      <div class="sect">Lecture · ta priorité</div>
      <div class="list">
        ${row('✍️', 'Fill in the Blanks', `${seenF}/${FIB.length} phrases vues · 20 s`, 'data-a="fib"')}
        ${row('📄', 'Read and Complete', `${seenR}/${RAC.length} paragraphes · 3 min`, 'data-a="rac"')}
        ${row('🔍', 'Read and Select · cognats', '5 s par mot', 'data-a="rs"')}
        ${row('💡', 'Méthode Fill in the Blanks', 'les conseils officiels + tes règles', 'data-a="tfib"')}
        ${row('💡', 'Méthode Read and Complete', '', 'data-a="trac"')}
      </div>
      <div class="sect">Mes fautes (tirées de tes copies)</div>
      <div class="list">${FAULTS.map((f, k) => { const s = A.modules.faults.familyScore(f); return row(f.icon, esc(f.title), `${s.seen}/${s.n} vues${s.lap ? ' · ' + s.lap + ' ratées' : ''}${s.due ? ' · ' + s.due + ' à revoir' : ''}`, `data-f="${k}"`); }).join('')}
        ${row('🎲', 'Mélange de toutes mes fautes', '10 phrases', 'data-a="mix"')}</div>
      <div class="sect">Vocabulaire</div>
      <div class="list">
        ${row('🎭', 'Faux amis', 'actually, eventually, library, stage…', 'data-a="ff"')}
        ${row('🔗', 'Collocations clés', COLLOCS.length + ' expressions à apprendre en bloc', 'data-a="col"')}
        ${row('📚', 'Cognats & faux amis : la liste', '', 'data-a="cogl"')}
        ${row('🧱', 'Amorces de phrases', 'pour écrire plus vite (Writing Sample)', 'data-a="starters"')}
      </div>
      <div class="sect">Bientôt (prochaines étapes)</div>
      <div class="list" style="opacity:.55">
        ${row('🎧', 'Listen and Type, Interactive Listening', '', 'disabled')}
        ${row('📝', 'Écriture : compteur de mots + objectif', 'Write About the Photo, Interactive Writing, Writing Sample', 'disabled')}
        ${row('🎙️', 'Oral : Interactive Speaking, Photo, Speaking Sample', '', 'disabled')}
        ${row('🗺️', 'Carte en 24 unités, histoire à Windsor', '', 'disabled')}
      </div>`;
    const M = A.modules;
    const act = { fib: () => M.ctest.fib(), rac: () => M.ctest.rac({ n: 1 }), rs: () => M.cognates.readSelect(), tfib: () => M.lessons.tips('fib', 'Fill in the Blanks : la méthode'), trac: () => M.lessons.tips('rac', 'Read and Complete : la méthode'), mix: () => M.faults.mixed(), ff: () => M.cognates.falseFriends(), col: () => M.lessons.collocs(), cogl: () => M.cognates.sheet(), starters: starters };
    A.$$('[data-a]', el).forEach(b => b.onclick = act[b.dataset.a]);
    A.$$('[data-f]', el).forEach(b => b.onclick = () => M.faults.family(FAULTS[+b.dataset.f]));
  };
  function starters() {
    A.sheet(`<div class="shd"><h2>🧱 Amorces de phrases</h2>${close}</div>
      <p>Tu tapes environ 30 mots/minute : ton plafond au Writing Sample est ~150 mots. Les amorces apprises par cœur te font gagner du temps de réflexion.</p>
      ${STARTERS.map(s => `<h3>${esc(s[0])}</h3><p>${s[1].map(x => `<span class="chip">${esc(x)}</span>`).join('')}</p>`).join('')}`);
  }

  /* ---------- Examen / Le test ---------- */
  A.pages.exam = el => {
    const ck = A.S.checklist, nOk = DET.checklist.filter(c => ck[c[0]]).length;
    el.innerHTML = `<h1>Examen</h1>
      <div class="list">${row('⏱️', 'Section lecture · conditions réelles', 'Read and Select 15 + Fill in the Blanks 7 + Read and Complete 3, sans relecture guidée', 'data-a="real"', 'var(--accent);color:#fff')}
        ${row('🌐', 'Test d\'entraînement officiel (gratuit)', '≈ 45 min : connecte-toi sur le site officiel → Practice', 'data-a="official"')}</div>
      <div class="sect">Checklist du jour J · ${nOk}/${DET.checklist.length}</div>
      <div class="card">${DET.checklist.map(c => `<label class="check"><input type="checkbox" data-c="${c[0]}" ${ck[c[0]] ? 'checked' : ''}><span>${esc(c[1])}</span></label>`).join('')}</div>
      <details><summary>Les 13 types de questions (format 2026)</summary>
        <table><tr><th>Type</th><th>Temps</th><th>Nb</th><th>Compétence</th></tr>${DET.types.map(t => `<tr><td><b>${esc(t[0])}</b><br><small class="muted">${esc(t[1])}</small></td><td>${esc(t[2])}</td><td>${esc(t[3])}</td><td>${esc(t[4])}</td></tr>`).join('')}</table>
        <p class="muted">Score de 10 à 160 par paliers de 5 ; 4 sous-scores (Lecture, Écoute, Écriture, Oral). Test adaptatif d'environ 1 h.</p></details>
      <details><summary>Score et niveaux CECR</summary><table>${DET.cefr.map(c => `<tr><td><b>${c[0]}</b></td><td>${c[1]}</td></tr>`).join('')}</table>
        <p class="muted">Windsor demande 120. Tes meilleurs sous-scores : Écoute 115 · Oral 105 · Écriture 105 · Lecture 95.</p></details>
      <details open><summary>⚠️ Les pièges qui font perdre des points</summary>${DET.traps.map(t => `<p><b>${esc(t[0])}</b><br><span class="muted">${esc(t[1])}</span></p>`).join('')}</details>
      <details><summary>📋 Règles du jour J</summary><ul>${DET.rules.map(r => `<li style="margin:8px 0">${esc(r)}</li>`).join('')}</ul></details>
      <p class="muted">Sources : Duolingo, Questions Guide 2026 et Scoring Guide 2026. Les scores de l'app sont des estimations d'entraînement, jamais des scores officiels.</p>`;
    A.$$('[data-c]', el).forEach(c => c.onchange = () => { A.S.checklist[c.dataset.c] = c.checked; A.save(); A.pages.exam(el); });
    A.$('[data-a="official"]', el).outerHTML = A.$('[data-a="official"]', el).outerHTML.replace('<button', '<a href="' + DET.practiceUrl + '" target="_blank" rel="noopener" style="color:inherit;text-decoration:none"').replace('</button>', '</a>');
    A.$('[data-a="real"]', el).onclick = realReading;
  };
  async function realReading() {
    if (!(await A.ask('Conditions réelles : chrono officiel, pas de relecture guidée, pas de retour en arrière. Environ 15 minutes. On y va ?', 'Commencer'))) return;
    const keep = A.S.settings.reread; A.S.settings.reread = false;
    const restore = () => { A.S.settings.reread = keep; A.save(); };
    A.modules.cognates.readSelect({ n: 15, onDone: () => A.modules.ctest.fib({ n: 7, onDone: () => A.modules.ctest.rac({ n: 3, onDone: restore }) }) });
    setTimeout(() => { if (!A.runner.active) restore(); }, 1000 * 60 * 30);
  }

  /* ---------- Progrès ---------- */
  A.pages.progress = el => {
    const S = A.S, days = [];
    for (let i = 13; i >= 0; i--) days.push(A.addDays(A.today(), -i));
    const acc = days.map(d => { const h = S.hist.filter(x => x.d === d && x.s === 'reading'); const n = h.reduce((a, x) => a + x.n, 0); return n ? Math.round(h.reduce((a, x) => a + x.ok, 0) / n * 100) : null; });
    const cats = A.topErrors(20);
    const last = S.errors.slice(-60).reverse();
    el.innerHTML = `<h1>Progrès</h1>
      <div class="kpis"><div class="kpi"><b>${S.points}</b><small class="muted">points</small></div><div class="kpi"><b>${Object.keys(S.srs).length}</b><small class="muted">éléments suivis</small></div><div class="kpi"><b>${S.errors.length}</b><small class="muted">erreurs notées</small></div></div>
      <div class="card"><h3>Lecture : % de réponses justes (14 jours)</h3>
        <div style="display:flex;align-items:flex-end;gap:4px;height:120px;margin-top:10px">${acc.map((a, i) => `<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%"><small style="font-size:10px">${a == null ? '' : a}</small><div style="width:100%;border-radius:4px 4px 0 0;height:${a == null ? 2 : Math.max(4, a)}%;background:${a == null ? 'var(--fill)' : a >= 80 ? 'var(--green)' : a >= 60 ? 'var(--orange)' : 'var(--red)'}"></div><small style="font-size:9px" class="muted">${days[i].slice(8)}</small></div>`).join('')}</div>
        <p class="muted">Vise 80 % et plus en Fill in the Blanks et Read and Complete.</p></div>
      <div class="sect">Mes erreurs par type</div>
      <div class="card">${cats.length ? cats.map(([c, n]) => `<div style="display:flex;justify-content:space-between"><span>${(A.CATS[c] || ['', '•'])[1]} ${esc((A.CATS[c] || [c])[0])}</span><b>${n}</b></div><div class="bar"><i style="width:${n / cats[0][1] * 100}%;background:var(--red)"></i></div>`).join('') : '<p class="muted">Pas encore d\'erreur notée.</p>'}</div>
      <div class="sect">Carnet d'erreurs (dernières)</div>
      <div class="list">${last.length ? last.map(e => `<div class="row"><span class="ic" style="background:var(--fill)">${(A.CATS[e.cat] || ['', '•'])[1]}</span><span class="tx"><b><s style="color:var(--red);font-weight:400">${esc(e.wrong)}</s> → ${esc(e.right)}</b><small class="muted">${esc((e.ctx || '').slice(0, 120))}</small></span></div>`).join('') : '<div class="row"><span class="tx muted">Vide pour l\'instant.</span></div>'}</div>`;
  };

  /* ---------- Plus ---------- */
  A.pages.more = el => {
    el.innerHTML = `<h1>Plus</h1>
      <div class="list">${row('✨', 'Nouveautés', 'version ' + A.VERSION, 'data-a="news"', 'var(--purple);color:#fff')}
        ${row('💡', 'Idée / Problème', 'note pour Claude', 'data-a="idea"', 'var(--orange);color:#fff')}
        ${row('💾', 'Sauvegarde', 'code à copier / restaurer', 'data-a="backup"', 'var(--green);color:#fff')}
        ${row('⚙️', 'Réglages', 'thème, texte, voix, son, chrono', 'data-a="settings"', '#8e8e93;color:#fff')}
        ${row('🎯', 'Mon test', 'date, objectif, scores', 'data-a="mytest"', 'var(--accent);color:#fff')}</div>
      <div class="list">${row('🔄', 'Repartir de zéro', 'garde tes réglages de voix', 'data-a="reset"', 'var(--red);color:#fff')}</div>
      <p class="muted" style="text-align:center">DET Prep v${A.VERSION} · ton état reste dans ce navigateur, rien n'est envoyé sur un serveur.</p>`;
    const act = { news: A.pages.news, idea, backup, settings, mytest, reset };
    A.$$('[data-a]', el).forEach(b => b.onclick = act[b.dataset.a]);
  };
  A.pages.news = () => A.sheet(`<div class="shd"><h2>✨ Nouveautés</h2>${close}</div>` + A.CHANGELOG.map(c => `<h3>Version ${c[0]} · ${c[1]}</h3><ul>${c[2].map(x => `<li>${esc(x)}</li>`).join('')}</ul>`).join(''));

  function idea() {
    const scr = A.current();
    A.sheet(`<div class="shd"><h2>💡 Idée / Problème</h2>${close}</div>
      <p class="muted">Écran : ${esc(scr)} · version ${A.VERSION} · ${A.today()}</p>
      <textarea id="ideaTx" placeholder="Ce qui ne va pas, ou ce que tu voudrais…"></textarea>
      <div class="btns" style="margin-top:10px"><button class="btn sec" id="ideaSave">Enregistrer</button><button class="btn" id="ideaCopy">Copier pour Claude</button></div>
      ${A.S.notes.length ? `<h3>Mes notes</h3>${A.S.notes.slice().reverse().map(n => `<div class="card"><small class="muted">${esc(n.d)} · ${esc(n.screen)} · v${esc(n.v)}</small><p>${esc(n.text)}</p></div>`).join('')}` : ''}`, b => {
      const get = () => ({ d: A.today(), screen: scr, v: A.VERSION, text: A.$('#ideaTx', b).value.trim() });
      A.$('#ideaSave', b).onclick = () => { const n = get(); if (!n.text) return; A.S.notes.push(n); A.save(); A.toast('Note enregistrée'); idea(); };
      A.$('#ideaCopy', b).onclick = async () => {
        const n = get(); if (n.text) { A.S.notes.push(n); A.save(); }
        const all = A.S.notes.map(x => `- [${x.d} · écran ${x.screen} · v${x.v}] ${x.text}`).join('\n');
        const txt = `DET Prep v${A.VERSION} — mes retours :\n${all}`;
        try { await navigator.clipboard.writeText(txt); A.toast('Copié : colle-le dans Claude'); } catch (e) { A.$('#ideaTx', b).value = txt; A.$('#ideaTx', b).select(); A.toast('Sélectionné : copie-le'); }
      };
    });
  }

  function backup() {
    A.sheet(`<div class="shd"><h2>💾 Sauvegarde</h2>${close}</div>
      <p>Copie ce code dans tes notes une fois par semaine. Colle-le sur un autre appareil pour retrouver ta progression.</p>
      <textarea id="bkTx" readonly style="font-family:ui-monospace,monospace;font-size:12px">Préparation du code…</textarea>
      <div class="btns" style="margin:10px 0"><button class="btn" id="bkCopy">Copier le code</button>${A.inClaude ? '' : '<button class="btn sec" id="bkDl">Télécharger</button>'}</div>
      <h3>Restaurer</h3><textarea id="bkIn" placeholder="Colle ici un code DETZ1:…"></textarea>
      <button class="btn sec" id="bkRestore" style="margin-top:10px">Restaurer ce code</button>`, async b => {
      const code = await A.exportCode(); A.$('#bkTx', b).value = code;
      A.$('#bkCopy', b).onclick = async () => { try { await navigator.clipboard.writeText(code); A.toast('Code copié'); } catch (e) { A.$('#bkTx', b).select(); } };
      if (A.$('#bkDl', b)) A.$('#bkDl', b).onclick = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([code], { type: 'text/plain' })); a.download = 'det-prep-' + A.today() + '.txt'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); };
      A.$('#bkRestore', b).onclick = async () => {
        const v = A.$('#bkIn', b).value; if (!v.trim()) return;
        if (!(await A.ask('Remplacer ta progression actuelle par ce code ?', 'Remplacer', true))) return;
        try { await A.importCode(v); A.closeSheet(); A.toast('Progression restaurée'); } catch (e) { A.toast('Code invalide : ' + e.message); }
      };
    });
  }

  function settings() {
    const st = A.S.settings, vs = A.voices();
    const sw = (k, label) => `<div class="row"><span class="tx"><b>${label}</b></span><label class="sw"><input type="checkbox" data-s="${k}" ${st[k] ? 'checked' : ''}><span></span></label></div>`;
    A.sheet(`<div class="shd"><h2>⚙️ Réglages</h2>${close}</div>
      <div class="sect">Apparence</div>
      <div class="card"><p>Thème</p>${[['auto', 'Auto'], ['light', 'Clair'], ['dark', 'Sombre']].map(t => `<button class="chip ${st.theme === t[0] ? 'on' : ''}" data-theme="${t[0]}">${t[1]}</button>`).join('')}
        <p>Taille du texte</p>${[['m', 'Normal'], ['l', 'Grand'], ['xl', 'Très grand']].map(t => `<button class="chip ${st.size === t[0] ? 'on' : ''}" data-size="${t[0]}">${t[1]}</button>`).join('')}</div>
      <div class="list">${sw('reread', 'Étape « Relis la phrase »')}${sw('timer', 'Chrono officiel')}${sw('sound', 'Sons')}${sw('mascot', 'Mascotte')}</div>
      <div class="sect">Voix</div>
      <div class="card"><select id="stVoice"><option value="">Automatique (en-US)</option>${vs.map(v => `<option ${v.name === st.voice ? 'selected' : ''}>${esc(v.name)}</option>`).join('')}</select>
        <p>Vitesse : <b id="stRateV">${st.rate}</b></p><input type="range" id="stRate" min="0.6" max="1.2" step="0.05" value="${st.rate}" style="width:100%">
        <button class="btn sec" id="stTest" style="margin-top:8px">▶ Tester la voix</button></div>`, b => {
      A.$$('[data-theme]', b).forEach(c => c.onclick = () => { st.theme = c.dataset.theme; A.save(); A.applySettings(); settings(); });
      A.$$('[data-size]', b).forEach(c => c.onclick = () => { st.size = c.dataset.size; A.save(); A.applySettings(); settings(); });
      A.$$('[data-s]', b).forEach(c => c.onchange = () => { st[c.dataset.s] = c.checked; A.save(); });
      A.$('#stVoice', b).onchange = e => { st.voice = e.target.value; A.save(); };
      A.$('#stRate', b).oninput = e => { st.rate = +e.target.value; A.$('#stRateV', b).textContent = st.rate; A.save(); };
      A.$('#stTest', b).onclick = () => A.speak('Researchers are trying to solve the problem of plastic waste.');
    });
  }

  function mytest() {
    const p = A.S.profile;
    A.sheet(`<div class="shd"><h2>🎯 Mon test</h2>${close}</div>
      <div class="card"><p>Date du test</p><input type="text" id="mtDate" value="${p.testDate}" inputmode="numeric" placeholder="AAAA-MM-JJ">
        <p>Objectif</p><input type="text" id="mtGoal" value="${p.goal}" inputmode="numeric">
        <p class="muted">Tes tests : 6 oct. → 105 (L 95 · É 95 · O 105 · Éc 115) · 20 oct. → 100 (L 95 · É 105 · O 100 · Éc 100).</p>
        <button class="btn" id="mtSave">Enregistrer</button></div>`, b => {
      A.$('#mtSave', b).onclick = () => {
        const d = A.$('#mtDate', b).value.trim(), g = parseInt(A.$('#mtGoal', b).value, 10);
        if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return A.toast('Date au format 2026-11-22');
        p.testDate = d; if (g >= 10 && g <= 160) p.goal = g; A.save(); A.closeSheet(); A.refresh();
      };
    });
  }

  async function reset() {
    if (!(await A.ask('Repartir de zéro ? Toute ta progression sera effacée (fais une sauvegarde avant).', 'Continuer', true))) return;
    await new Promise(r => setTimeout(r, 350));
    if (!(await A.ask('Vraiment sûr ? Cette action est définitive.', 'Tout effacer', true))) return;
    A.reset(true); A.toast('Remis à zéro'); A.show('today');
  }
})();
