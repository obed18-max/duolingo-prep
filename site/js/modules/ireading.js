/* Interactive Reading : 5 tâches sur un même texte, chrono partagé de 7 min 30. */
(function () {
  'use strict';
  const A = App, esc = A.esc;
  const sentences = t => t.match(/[^.!?]+[.!?]+/g).map(s => s.trim());

  function run(opts = {}) {
    const set = A.modules.writing.pickBy(IREAD, 'iread');
    const choices = []; // [{opts, a}]
    const p1clean = set.p1.replace(/\[([^\]]+)\]/g, (_, g) => { const o = g.split('|'); const a = o.findIndex(x => x.endsWith('*')); choices.push({ o: o.map(x => x.replace('*', '')), a }); return o[a].replace('*', ''); });
    const gapSentence = set.gap.o[set.gap.a];
    const all = sentences(p1clean).concat(set.p2.map(s => s === '@' ? gapSentence : s));
    let ok = 0, total = 0, t0;
    const left = () => Math.max(3, 450 - Math.round((Date.now() - t0) / 1000));
    const mark = (good, wrong, right, cat = 'sens') => { total++; if (good) { ok++; A.beep(true); } else { A.beep(false); A.logError({ cat, src: 'interactive-reading', wrong, right, ctx: set.id, why: 'Interactive Reading' }); } };
    const next = (f, label = 'Continuer') => new Promise(r => { f.innerHTML = `<button class="btn" id="irN">${label}</button>`; A.$('#irN').onclick = r; });
    const timed = (r) => A.runner.timer(left(), r);
    const passageHtml = (clickable) => `<div class="passage" style="line-height:1.7">${all.map((s, i) => clickable ? `<span class="hl" data-i="${i}" style="cursor:pointer;border-radius:4px">${esc(s)}</span>` : esc(s)).join(' ')}</div>`;

    const steps = [
      (b, f) => new Promise(r => { b.innerHTML = `<div class="instr">Interactive Reading</div><div class="card">Un texte ${esc(set.kind)}, puis 5 tâches dans l'ordre. Chrono <b>partagé</b> de 7 min 30 : ne t'attarde pas sur une seule question. Les premières réponses aident pour la suite.</div>`; f.innerHTML = '<button class="btn" id="go">Commencer</button>'; A.$('#go').onclick = () => { t0 = Date.now(); r(); }; }),
      // 1. Complete the Sentences
      (b, f) => new Promise(r => {
        let k = 0;
        const html = set.p1.replace(/\[([^\]]+)\]/g, () => { const c = choices[k]; return `<select data-k="${k++}" style="width:auto;display:inline-block;padding:4px 8px;margin:2px;background:var(--fill)"><option value="">Select a word</option>${c.o.map((o, j) => `<option value="${j}">${esc(o)}</option>`).join('')}</select>`; });
        b.innerHTML = `<div class="instr">Select the best option for each missing word.</div><div class="passage" style="line-height:2.2">${html}</div><div id="f1"></div>`;
        f.innerHTML = '<button class="btn" id="v1">Valider</button>';
        let done = false;
        const go = async () => {
          if (done) return; done = true;
          A.$$('select', b).forEach(s => { const c = choices[+s.dataset.k], v = s.value === '' ? -1 : +s.value, good = v === c.a; s.disabled = true; s.style.background = good ? 'color-mix(in srgb,var(--green) 30%,transparent)' : 'color-mix(in srgb,var(--red) 25%,transparent)'; if (!good) s.insertAdjacentHTML('afterend', ` <b style="color:var(--green)">${esc(c.o[c.a])}</b>`); mark(good, v >= 0 ? c.o[v] : '—', c.o[c.a]); });
          A.$('#f1').innerHTML = '<div class="fb warn">Rappel : choisis le mot qui a du <b>sens</b>, pas seulement celui qui ressemble (expensive / expansive).</div>';
          await next(f); r();
        };
        A.$('#v1').onclick = go; timed(go);
      }),
      // 2. Complete the Passage
      (b, f) => new Promise(r => {
        b.innerHTML = `<div class="instr">Select the best sentence to fill in the blank in the passage.</div><div class="passage" style="line-height:1.7">${set.p2.map(s => s === '@' ? '<b style="background:var(--fill);padding:2px 30px;border-radius:6px">______</b>' : esc(s)).join(' ')}</div>
          ${set.gap.o.map((o, j) => `<button class="choice" data-j="${j}">${esc(o)}</button>`).join('')}`;
        f.innerHTML = '';
        let done = false;
        const pick = async j => {
          if (done) return; done = true; A.runner.stopTimer(); const good = j === set.gap.a; mark(good, j >= 0 ? set.gap.o[j] : '—', set.gap.o[set.gap.a]);
          A.$$('.choice', b).forEach((c, q) => { c.disabled = true; if (q === set.gap.a) c.classList.add('ok'); else if (q === j) c.classList.add('ko'); });
          await next(f); r();
        };
        A.$$('.choice', b).forEach(c => c.onclick = () => pick(+c.dataset.j)); timed(() => pick(-1));
      })
    ];
    // 3-4. Highlight the Answer ×2
    set.hl.forEach((h, n) => steps.push((b, f) => new Promise(r => {
      b.innerHTML = `<div class="instr">Click and drag text to highlight the answer to the question.</div><div class="card"><b>${esc(h.q)}</b></div>${passageHtml(true)}<p class="muted">Ici : touche la phrase qui contient la réponse. Au vrai test, surligne seulement la réponse, pas de texte en trop.</p>`;
      f.innerHTML = '';
      let done = false;
      const pick = async i => {
        if (done) return; done = true; A.runner.stopTimer(); const good = i === h.s; mark(good, i >= 0 ? all[i] : '—', all[h.s]);
        A.$$('.hl', b).forEach(x => { const k = +x.dataset.i; if (k === h.s) x.style.background = 'color-mix(in srgb,var(--green) 35%,transparent)'; else if (k === i) x.style.background = 'color-mix(in srgb,var(--red) 30%,transparent)'; });
        await next(f); r();
      };
      A.$$('.hl', b).forEach(x => x.onclick = () => pick(+x.dataset.i)); timed(() => pick(-1));
    })));
    // 5-6. Identify the Idea, Title the Passage
    [['Select the idea that is expressed in the passage.', set.idea], ['Select the best title for the passage.', set.title]].forEach(([ins, q]) => steps.push((b, f) => new Promise(r => {
      const order = A.shuffle(q.o.map((o, j) => j));
      b.innerHTML = `<div class="instr">${ins}</div><details><summary>Relire le texte</summary>${passageHtml(false)}</details>${order.map(j => `<button class="choice" data-j="${j}">${esc(q.o[j])}</button>`).join('')}<div class="muted">Choisis ce qui couvre <b>tout</b> le texte, pas un détail.</div>`;
      f.innerHTML = '';
      let done = false;
      const pick = async j => {
        if (done) return; done = true; A.runner.stopTimer(); const good = j === q.a; mark(good, j >= 0 ? q.o[j] : '—', q.o[q.a]);
        A.$$('.choice', b).forEach(c => { const k = +c.dataset.j; c.disabled = true; if (k === q.a) c.classList.add('ok'); else if (k === j) c.classList.add('ko'); });
        await next(f); r();
      };
      A.$$('.choice', b).forEach(c => c.onclick = () => pick(+c.dataset.j)); timed(() => pick(-1));
    })));
    steps.push((b, f) => new Promise(r => {
      A.runner.timer(null); A.record('reading', ok, total); A.addPoints(ok * 5);
      b.innerHTML = `<div style="text-align:center;margin-top:30px">${A.mascot(ok / total >= .75)}<h2>Interactive Reading : ${ok}/${total}</h2><p class="muted">en ${Math.round((Date.now() - t0) / 1000)} s sur 450</p></div>${passageHtml(false)}`;
      f.innerHTML = '<button class="btn" id="x">Terminer</button>'; A.$('#x').onclick = r;
    }));
    A.runner.open({ dirty: () => true, async render(b, f) { for (let i = 0; i < steps.length; i++) { A.runner.progress(i / steps.length); await steps[i](b, f); } A.runner.close(true); if (opts.onDone) opts.onDone(); } });
  }
  A.modules.ireading = { run };
})();
