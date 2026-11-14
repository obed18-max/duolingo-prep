/* Diagnostic (≈ 15 min) et examen blanc complet dans l'ordre officiel, avec une ESTIMATION de score.
   L'estimation est un indicateur d'entraînement, jamais un score officiel. */
(function () {
  'use strict';
  const A = App, esc = A.esc, M = A.modules;
  const r5 = x => Math.max(10, Math.min(160, Math.ceil(x / 5) * 5));

  function chain(fns, done) { const go = k => k >= fns.length ? done() : fns[k](() => setTimeout(() => go(k + 1), 60)); go(0); }

  function estimate(h0, e0) {
    const H = A.S.hist.slice(h0), E = A.S.errors.slice(e0);
    const acc = s => { const h = H.filter(x => x.s === s), n = h.reduce((a, x) => a + x.n, 0); return n ? h.reduce((a, x) => a + x.ok, 0) / n : null; };
    const map = a => a == null ? null : r5(55 + a * 95);
    const read = map(acc('reading')), listen = map(acc('listening'));
    const wr = acc('writing'), wFaults = E.filter(e => /ecrit|ia-ecrit/.test(e.src)).length;
    const writing = wr == null ? null : r5(55 + wr * 85 - Math.min(25, wFaults * 2.5));
    const sp = acc('speaking'), missed = E.filter(e => e.wrong === 'Record Now oublié').length;
    const speaking = sp == null ? null : r5(55 + sp * 85 - missed * 10);
    const vals = [read, listen, writing, speaking].filter(v => v != null);
    const overall = vals.length ? r5(vals.reduce((a, b) => a + b, 0) / vals.length) : null;
    const traps = {}; E.forEach(e => traps[e.cat] = (traps[e.cat] || 0) + 1);
    return { read, listen, writing, speaking, overall, traps: Object.entries(traps).sort((a, b) => b[1] - a[1]) };
  }
  const cefr = s => s == null ? '—' : s >= 155 ? 'C2' : s >= 130 ? 'C1' : s >= 100 ? 'B2' : s >= 60 ? 'B1' : 'A1–A2';

  function showResult(title, r, kind) {
    const goal = A.S.profile.goal, best = A.S.profile.best;
    const rows = [['Lecture', r.read, best.reading], ['Écoute', r.listen, best.listening], ['Écriture', r.writing, best.writing], ['Oral', r.speaking, best.speaking]];
    (A.S.mocks || (A.S.mocks = [])).push({ d: A.today(), kind, r }); A.save();
    A.runner.open({
      dirty: () => false,
      render(body, foot) {
        A.runner.timer(null); A.runner.progress(1);
        body.innerHTML = `<div class="instr">${esc(title)}</div>
          <div class="card" style="text-align:center"><p class="muted">Estimation d'entraînement</p><div style="font-size:3em;font-weight:800">${r.overall ?? '—'}</div><p>${cefr(r.overall)} · objectif ${goal}</p></div>
          <div class="card">${rows.map(([n, v, b]) => `<div style="display:flex;justify-content:space-between"><span>${n}</span><span><b style="color:${v == null ? 'inherit' : v >= goal ? 'var(--green)' : v >= goal - 15 ? 'var(--orange)' : 'var(--red)'}">${v ?? '—'}</b> <small class="muted">(officiel : ${b})</small></span></div><div class="bar"><i style="width:${v ? (v - 10) / 1.5 : 0}%"></i></div>`).join('')}</div>
          ${r.traps.length ? `<div class="card"><h3>Pièges commis</h3>${r.traps.slice(0, 6).map(([c, n]) => `<p>${(A.CATS[c] || ['', '•'])[1]} ${esc((A.CATS[c] || [c])[0])} · <b>${n}</b></p>`).join('')}</div>` : ''}
          <div class="card muted">Cette estimation vient de ton taux de réussite et du volume produit ; elle n'a rien d'officiel. Compare-la avec le test d'entraînement gratuit de Duolingo.</div>`;
        foot.innerHTML = '<button class="btn" id="x">Terminer</button>'; A.$('#x').onclick = () => A.runner.close(true);
      }
    });
  }

  function realMode(on) {
    const st = A.S.settings;
    if (on) { st.realKeep = st.reread; st.reread = false; A.onQuit = () => realMode(false); }
    else { if (st.realKeep != null) st.reread = st.realKeep; st.realKeep = null; A.onQuit = null; }
    A.save();
  }

  async function mock() {
    if (!(await A.ask('Examen blanc complet : environ 1 heure, dans l\'ordre du vrai test, chrono officiel, sans relecture guidée. Mets-toi au calme, micro autorisé. On commence ?', 'Commencer'))) return;
    const h0 = A.S.hist.length, e0 = A.S.errors.length; realMode(true);
    chain([
      d => M.cognates.readSelect({ n: 15, onDone: d }),
      d => M.ctest.fib({ n: 7, onDone: d }),
      d => M.ctest.rac({ n: 3, onDone: d }),
      d => M.listening.listenType({ n: 6, onDone: d }),
      d => M.ireading.run({ onDone: d }),
      d => M.listening.interactive({ onDone: d }),
      d => M.writing.photo({ n: 3, onDone: d }),
      d => M.speaking.photo({ onDone: d }),
      d => M.speaking.readThenSpeak({ onDone: d }),
      d => M.speaking.interactive({ onDone: d }),
      d => M.writing.interactive({ onDone: d }),
      d => M.writing.sample({ onDone: d }),
      d => M.speaking.sampleTalk({ onDone: d })
    ], () => { realMode(false); showResult('Examen blanc · résultat', estimate(h0, e0), 'mock'); });
  }
  async function diagnostic() {
    if (!(await A.ask('Diagnostic (≈ 15 min) : un peu de chaque compétence pour estimer ton niveau. On commence ?', 'Commencer'))) return;
    const h0 = A.S.hist.length, e0 = A.S.errors.length; realMode(true);
    chain([
      d => M.cognates.readSelect({ n: 10, onDone: d }),
      d => M.ctest.fib({ n: 4, onDone: d }),
      d => M.ctest.rac({ n: 1, onDone: d }),
      d => M.listening.listenType({ n: 3, onDone: d }),
      d => M.writing.photo({ n: 1, onDone: d }),
      d => M.speaking.photo({ onDone: d })
    ], () => { realMode(false); const r = estimate(h0, e0); A.S.profile.diag = { d: A.today(), r }; A.save(); showResult('Diagnostic · ton niveau estimé', r, 'diag'); });
  }
    async function reading() {
    if (!(await A.ask('Section lecture en conditions réelles : Read and Select 15 + Fill in the Blanks 7 + Read and Complete 3, sans relecture guidée (≈ 15 min). On y va ?', 'Commencer'))) return;
    const h0 = A.S.hist.length, e0 = A.S.errors.length; realMode(true);
    chain([d => M.cognates.readSelect({ n: 15, onDone: d }), d => M.ctest.fib({ n: 7, onDone: d }), d => M.ctest.rac({ n: 3, onDone: d })], () => { realMode(false); showResult('Section lecture · résultat', estimate(h0, e0), 'reading'); });
  }
  A.modules.exam = { mock, diagnostic, reading, estimate, cefr };
})();
