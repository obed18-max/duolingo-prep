/* Plan du jour : 5 étapes, construit automatiquement (sprint lecture avant le test). */
(function () {
  'use strict';
  const A = App, esc = A.esc;

  function plan() {
    const M = A.modules, fam = M.faults.nextFamily(), rc = M.review.counts();
    const dayN = Math.max(0, A.daysBetween(A.S.created, A.today()));
    const rot = (arr, k = 0) => arr[(dayN + k) % arr.length];
    const read = rot([
      { name: 'Fill in the Blanks + Read and Complete', short: 'Lecture', icon: '✍️', sub: '6 phrases + 1 paragraphe', min: 7, run: d => M.ctest.fib({ n: 6, onDone: () => M.ctest.rac({ n: 1, onDone: d }) }) },
      { name: 'Interactive Reading', short: 'Lecture', icon: '📖', sub: '1 texte, 5 tâches, 7 min 30', min: 8, run: d => M.ireading.run({ onDone: d }) },
      { name: 'Read and Complete', short: 'Lecture', icon: '📄', sub: '2 paragraphes · 3 min', min: 7, run: d => M.ctest.rac({ onDone: d }) }
    ]);
    const prod = rot([
      { name: 'Writing Sample', short: 'Écrit', icon: '📝', sub: '30 s de préparation, 5 min, objectif 140 mots', min: 9, run: d => M.writing.sample({ onDone: d }) },
      { name: 'Interactive Speaking', short: 'Oral', icon: '🎙️', sub: '6–8 questions · 35 s · Record Now !', min: 8, run: d => M.speaking.interactive({ onDone: d }) },
      { name: 'Interactive Writing', short: 'Écrit', icon: '📝', sub: '5 min + 3 min', min: 10, run: d => M.writing.interactive({ onDone: d }) },
      { name: 'Photo : écrire puis parler', short: 'Photo', icon: '🖼️', sub: 'Write (1 min) + Speak (90 s)', min: 6, run: d => M.writing.photo({ onDone: () => M.speaking.photo({ onDone: d }) }) },
      { name: 'Read, Then Speak', short: 'Oral', icon: '🗣️', sub: '20 s de préparation, 90 s', min: 4, run: d => M.speaking.readThenSpeak({ onDone: d }) },
      { name: 'Speaking Sample', short: 'Oral', icon: '🎥', sub: '30 s de préparation, 3 min', min: 5, run: d => M.speaking.sampleTalk({ onDone: d }) }
    ]);
    const listen = rot([
      { name: 'Listen and Type', short: 'Écoute', icon: '🎧', sub: '6 phrases · 3 écoutes max', min: 6, run: d => M.listening.listenType({ onDone: d }) },
      { name: 'Interactive Listening', short: 'Écoute', icon: '💬', sub: 'compléter, répondre, résumer', min: 9, run: d => M.listening.interactive({ onDone: d }) }
    ]);
    const disc = rot([
      { name: 'Cognats', icon: '🔍', sub: 'Read and Select au chrono (5 s/mot)', min: 4, run: d => M.cognates.readSelect({ onDone: d }) },
      { name: 'Shadowing', icon: '🔁', sub: 'écoute, répète, compare', min: 5, run: d => M.speaking.shadowing({ onDone: d }) },
      { name: 'Faux amis', icon: '🎭', sub: 'actually, eventually, library…', min: 4, run: d => M.cognates.falseFriends({ onDone: d }) },
      { name: 'Prononciation', icon: '👄', sub: 'th, h, ship/sheep, accent de mot', min: 4, run: d => M.speaking.pronunciation({ onDone: d }) },
      { name: 'Amorces de phrases', icon: '🧱', sub: 'pour écrire plus vite', min: 3, run: d => M.writing.starters({ onDone: d }) },
      { name: 'Grammaire C1', icon: '📐', sub: M.learn.nextGrammar().t, min: 6, run: d => M.learn.grammar({ onDone: d }) },
      { name: 'Vocabulaire académique', icon: '📚', sub: 'lot ' + ((A.S.seen.vocabLot || 0) + 1) + ' : 8 mots + quiz', min: 6, run: d => M.learn.vocab({ onDone: d }) },
      { name: 'Histoire à Windsor', icon: '🏙️', sub: 'écoute, touche les mots, joue Obed', min: 6, run: d => M.extras.story({ onDone: d }) }
    ]);
    return [
      { id: 'rev', icon: '🔁', name: 'Révision', short: 'Révision', sub: rc.total ? rc.total + ' rappels dus + mini-quiz' : 'Mini-quiz mélangé', min: 5, run: d => M.review.start({ onDone: d }) },
      { id: 'lesson', icon: fam.icon, name: 'Mes fautes', short: 'Fautes', sub: fam.title, min: 5, run: d => M.faults.family(fam, { onDone: d }) },
      Object.assign({ id: 'read' }, read),
      Object.assign({ id: 'prod' }, prod),
      Object.assign({ id: 'listen' }, listen),
      Object.assign({ id: 'disc', short: 'Découverte' }, disc)
    ];
  }
  function isComplete() { const d = A.day(); return plan().every(s => d.done[s.id]); }
  function runStep(s) { s.run(() => { A.markStep(s.id); A.refresh(); }); }

  function render(el) {
    const S = A.S, d = A.day(), steps = plan();
    const done = steps.filter(s => d.done[s.id]).length;
    const next = steps.find(s => !d.done[s.id]);
    const left = A.daysBetween(A.today(), S.profile.testDate);
    const C = 2 * Math.PI * 42, off = C * (1 - done / steps.length);
    const mins = steps.filter(s => !d.done[s.id]).reduce((a, s) => a + s.min, 0);
    const top = A.topErrors(3, 7);
    const best = S.profile.best;
    el.innerHTML = `
      <h1>Aujourd'hui</h1>
      ${left >= 0 ? `<div class="countdown"><b>J-${left}</b> avant ton DET (vers le ${new Date(S.profile.testDate + 'T12:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}) · objectif <b>${S.profile.goal}</b></div>` : ''}
      <div class="card">
        <div class="hero">
          <div class="ring"><svg width="96" height="96"><circle class="bg" cx="48" cy="48" r="42"/><circle class="fg" cx="48" cy="48" r="42" stroke-dasharray="${C}" stroke-dashoffset="${off}"/></svg><div class="lbl">${done}/${steps.length}</div></div>
          <div><h2 style="margin:0">${next ? (steps.length - done) + ' étape' + (steps.length - done > 1 ? 's' : '') + ' pour aujourd\'hui' : 'Plan terminé ! 🎉'}</h2>
          <p class="muted">${next ? 'Environ ' + mins + ' min' : 'Reviens demain pour garder ta série.'}</p></div>
          ${A.mascot(next ? null : true)}
        </div>
        <div class="steps">${steps.map(s => `<div class="step ${d.done[s.id] ? 'done' : s === next ? 'cur' : ''}"><div class="dot">${d.done[s.id] ? '✓' : s.icon}</div>${esc(s.short || s.name)}</div>`).join('')}</div>
        ${next ? `<button class="btn" id="tGo" style="margin-top:12px">Continuer : ${esc(next.name)} · ${next.min} min</button>` : `<button class="btn sec" id="tMore" style="margin-top:12px">Encore un Read and Complete</button>`}
      </div>
      <div class="sect">Le plan du jour</div>
      <div class="list">${steps.map((s, k) => `<button class="row" data-k="${k}"><span class="ic" style="background:${d.done[s.id] ? 'var(--green)' : 'var(--fill)'};color:${d.done[s.id] ? '#fff' : 'inherit'}">${d.done[s.id] ? '✓' : s.icon}</span><span class="tx"><b>${esc(s.name)}</b><small class="muted">${esc(s.sub)}</small></span><span class="chev">›</span></button>`).join('')}</div>
      <div class="kpis"><div class="kpi"><b>🔥 ${S.streak.last >= A.addDays(A.today(), -1) ? S.streak.n : 0}</b><small class="muted">série</small></div>
        <div class="kpi"><b>${d.pts}</b><small class="muted">points aujourd'hui</small></div>
        <div class="kpi"><b>${A.srs.due().length}</b><small class="muted">rappels dus</small></div></div>
      ${!S.profile.diag || A.daysBetween(S.profile.diag.d, A.today()) >= 14 ? `<button class="card row" id="tDiag" style="width:100%"><span class="ic" style="background:var(--green);color:#fff">🧭</span><span class="tx"><b>${S.profile.diag ? 'Refaire le diagnostic' : 'Faire le diagnostic'}</b><small class="muted">≈ 15 min · estime ton niveau par compétence</small></span><span class="chev">›</span></button>` : ''}
      ${left >= 0 && left <= 2 && !(S.mocks || []).some(m => m.kind === 'mock' && A.daysBetween(m.d, A.today()) <= 3) ? `<button class="card row" id="tMock" style="width:100%"><span class="ic" style="background:var(--purple);color:#fff">🎓</span><span class="tx"><b>C'est le moment de l'examen blanc</b><small class="muted">≈ 1 h, dans les conditions du vrai test</small></span><span class="chev">›</span></button>` : ''}
      ${top.length ? `<div class="card"><h3>⚠️ Tes erreurs les plus fréquentes (7 jours)</h3>${top.map(([c, n]) => `<p>${(A.CATS[c] || ['', '•'])[1]} ${esc((A.CATS[c] || [c])[0])} · <b>${n}</b></p>`).join('')}<p class="muted">Pense à elles pendant les exercices d'aujourd'hui.</p></div>` : ''}
      <div class="card"><h3>Tes meilleurs sous-scores officiels</h3>
        ${[['reading', 'Lecture'], ['writing', 'Écriture'], ['speaking', 'Oral'], ['listening', 'Écoute']].map(([k, n]) => `<div style="display:flex;justify-content:space-between"><span>${n}</span><b style="color:${best[k] >= 120 ? 'var(--green)' : best[k] >= 105 ? 'var(--orange)' : 'var(--red)'}">${best[k]}</b></div><div class="bar"><i style="width:${(best[k] - 10) / 150 * 100}%"></i></div>`).join('')}
        <p class="muted">La lecture (95) est ta priorité : chaque jour, Fill in the Blanks + Read and Complete.</p></div>`;
    const b = A.$('#tGo', el); if (b) b.onclick = () => runStep(next);
    const dg = A.$('#tDiag', el); if (dg) dg.onclick = () => A.modules.exam.diagnostic();
    const mk = A.$('#tMock', el); if (mk) mk.onclick = () => A.modules.exam.mock();
    const m = A.$('#tMore', el); if (m) m.onclick = () => A.modules.ctest.rac({ n: 1 });
    A.$$('.row[data-k]', el).forEach(r => r.onclick = () => runStep(steps[+r.dataset.k]));
  }

  A.today = Object.assign(A.today, { plan, isComplete, render });
  A.pages.today = render;
})();
