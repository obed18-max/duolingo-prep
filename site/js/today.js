/* Plan du jour : 5 étapes, construit automatiquement (sprint lecture avant le test). */
(function () {
  'use strict';
  const A = App, esc = A.esc;

  function plan() {
    const fam = A.modules.faults.nextFamily();
    const rc = A.modules.review.counts();
    const dayN = A.daysBetween(A.S.created, A.today());
    const disc = [
      { id: 'disc', icon: '🔍', name: 'Cognats', sub: 'Read and Select au chrono (5 s/mot)', min: 4, run: d => A.modules.cognates.readSelect({ onDone: d }) },
      { id: 'disc', icon: '🎭', name: 'Faux amis', sub: 'actually, eventually, library…', min: 4, run: d => A.modules.cognates.falseFriends({ onDone: d }) }
    ][dayN % 2];
    return [
      { id: 'rev', icon: '🔁', name: 'Révision', short: 'Révision', sub: rc.total ? rc.total + ' rappels dus + mini-quiz' : 'Mini-quiz mélangé', min: 5, run: d => A.modules.review.start({ onDone: d }) },
      { id: 'lesson', icon: fam.icon, name: 'Mes fautes', short: 'Fautes', sub: fam.title, min: 6, run: d => A.modules.faults.family(fam, { onDone: d }) },
      { id: 'fib', icon: '✍️', name: 'Fill in the Blanks', short: 'Fill', sub: '9 phrases · 20 s chacune', min: 5, run: d => A.modules.ctest.fib({ onDone: d }) },
      { id: 'rac', icon: '📄', name: 'Read and Complete', short: 'Complete', sub: '2 paragraphes · 3 min chacun', min: 8, run: d => A.modules.ctest.rac({ onDone: d }) },
      disc
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
      ${top.length ? `<div class="card"><h3>⚠️ Tes erreurs les plus fréquentes (7 jours)</h3>${top.map(([c, n]) => `<p>${(A.CATS[c] || ['', '•'])[1]} ${esc((A.CATS[c] || [c])[0])} · <b>${n}</b></p>`).join('')}<p class="muted">Pense à elles pendant les exercices d'aujourd'hui.</p></div>` : ''}
      <div class="card"><h3>Tes meilleurs sous-scores officiels</h3>
        ${[['reading', 'Lecture'], ['writing', 'Écriture'], ['speaking', 'Oral'], ['listening', 'Écoute']].map(([k, n]) => `<div style="display:flex;justify-content:space-between"><span>${n}</span><b style="color:${best[k] >= 120 ? 'var(--green)' : best[k] >= 105 ? 'var(--orange)' : 'var(--red)'}">${best[k]}</b></div><div class="bar"><i style="width:${(best[k] - 10) / 150 * 100}%"></i></div>`).join('')}
        <p class="muted">La lecture (95) est ta priorité : chaque jour, Fill in the Blanks + Read and Complete.</p></div>`;
    const b = A.$('#tGo', el); if (b) b.onclick = () => runStep(next);
    const m = A.$('#tMore', el); if (m) m.onclick = () => A.modules.ctest.rac({ n: 1 });
    A.$$('.row[data-k]', el).forEach(r => r.onclick = () => runStep(steps[+r.dataset.k]));
  }

  A.today = Object.assign(A.today, { plan, isComplete, render });
  A.pages.today = render;
})();
