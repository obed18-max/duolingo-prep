/* Écriture : Write About the Photo, Interactive Writing, Writing Sample, amorces, vitesse de frappe.
   Compteur de mots en direct avec objectif affiché (ton point faible : le volume). */
(function () {
  'use strict';
  const A = App, esc = A.esc, P = () => A.modules.prod;

  // Écran d'écriture générique. Résout {text, sec}
  function writeScreen(body, foot, o) {
    return new Promise(res => {
      body.innerHTML = `<div class="instr">${esc(o.instr)}</div>${o.promptHtml}
        <textarea id="wTx" autocapitalize="sentences" spellcheck="false" autocorrect="off" style="min-height:${o.tall ? 220 : 130}px;margin-top:10px" placeholder="Write here…"></textarea>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px"><span class="wc" id="wWc">0 / ${o.target} mots</span><span class="muted" id="wPace"></span></div>
        <div class="bar"><i id="wBar" style="width:0"></i></div>
        ${o.starters ? `<details><summary>🧱 Amorces (touche pour insérer)</summary>${STARTERS.map(s => s[1].map(x => `<button class="chip" data-st="${esc(x)}">${esc(x)}</button>`).join('')).join('')}</details>` : ''}`;
      foot.innerHTML = `<button class="btn" id="wDone">Terminer</button>`;
      const tx = A.$('#wTx'), t0 = Date.now();
      let finished = false;
      const upd = () => {
        const n = P().words(tx.value), el = (Date.now() - t0) / 1000;
        A.$('#wWc').textContent = n + ' / ' + o.target + ' mots';
        A.$('#wBar').style.width = Math.min(100, n / o.target * 100) + '%';
        A.$('#wBar').style.background = n >= o.target ? 'var(--green)' : 'var(--accent)';
        // rythme attendu : objectif réparti sur 85 % du temps (garder ~10 s/min pour relire)
        const expected = Math.round(o.target * Math.min(1, el / (o.sec * .85)));
        A.$('#wPace').textContent = el > 10 ? (n >= expected ? '✓ dans le rythme' : '⏩ accélère (' + expected + ' attendus)') : '';
      };
      tx.addEventListener('input', upd);
      const pi = setInterval(() => { if (!document.body.contains(tx)) clearInterval(pi); else upd(); }, 3000);
      A.$$('[data-st]', body).forEach(b => b.onclick = () => { const s = tx.selectionStart; tx.value = tx.value.slice(0, s) + (s && !/\s$/.test(tx.value.slice(0, s)) ? ' ' : '') + b.dataset.st + ' ' + tx.value.slice(s); tx.focus(); upd(); });
      setTimeout(() => tx.focus(), 300);
      const end = () => { if (finished) return; finished = true; clearInterval(pi); A.runner.stopTimer(); tx.disabled = true; res({ text: tx.value.trim(), sec: Math.round((Date.now() - t0) / 1000) }); };
      A.$('#wDone').onclick = end;
      A.runner.timer(o.sec, end);
    });
  }
  // Préparation (30 s) avec bouton « Commencer »
  function prepScreen(body, foot, html, sec) {
    return new Promise(res => {
      body.innerHTML = `<div class="instr">Préparation</div>${html}<div class="card muted">💡 Planifie : 1 position claire, 2 idées, 1 exemple personnel. Pas de phrase d'annonce.</div>`;
      foot.innerHTML = '<button class="btn" id="pGo">Commencer à écrire</button>';
      let done = false; const go = () => { if (done) return; done = true; A.runner.stopTimer(); res(); };
      A.$('#pGo').onclick = go; A.runner.timer(sec, go);
    });
  }
  // Correction + modèle + réécriture
  function reviewScreen(body, foot, o) {
    return new Promise(async res => {
      A.runner.timer(null);
      const wpm = o.sec ? Math.round(P().words(o.text) / o.sec * 60) : 0;
      const r = P().report(o.text || '', o.target, { wpm, src: 'ecrit' });
      body.innerHTML = `<div class="instr">Correction</div><div class="card"><p class="muted">${o.q ? esc(o.q) : ''}</p><p>${esc(o.text) || '<i>(vide)</i>'}</p></div>${r.html}<div id="wAi"></div>
        <details ${A.ai && A.ai.sample ? '' : 'open'}><summary>📗 Réponse modèle (C1, ≈ ${P().words(o.model)} mots)</summary><p>${esc(o.model)}</p></details>`;
      foot.innerHTML = '<button class="btn" id="rNext">Continuer</button>';
      A.addPoints(Math.min(30, Math.round(r.n / 5)));
      A.record('writing', Math.min(r.n, o.target), o.target);
      let improved = null;
      if (A.ai && A.ai.sample && o.text) improved = await P().aiEval('ecrit', { task: o.task, q: o.q }, o.text, A.$('#wAi'));
      A.$('#rNext').onclick = () => {
        // Réécrire avant de continuer (version améliorée ou modèle)
        const ref = improved || o.model;
        body.innerHTML = `<div class="instr">Réécris en mieux</div><div class="card"><p class="muted">${improved ? 'Version améliorée par Claude' : 'Réponse modèle'}</p><p>${esc(ref)}</p></div>
          <p>Réécris <b>tes 2 premières phrases</b> en t'inspirant de cette version (garde tes idées).</p><textarea id="rw" spellcheck="false" autocorrect="off"></textarea>`;
        foot.innerHTML = '<div class="btns"><button class="btn sec" id="rwSkip">Passer</button><button class="btn" id="rwOk">Valider</button></div>';
        A.$('#rwSkip').onclick = () => res();
        A.$('#rwOk').onclick = () => { const v = A.$('#rw').value; const iss = P().check(v); A.addPoints(10); if (iss.length) { A.toast(iss.length + ' faute(s) habituelle(s) encore là : ' + iss[0].wrong); } else A.toast('✓ Propre !'); res(); };
      };
    });
  }

  const pickBy = (arr, key) => { const seen = A.S.seen[key] || (A.S.seen[key] = {}); const un = arr.filter(x => !seen[x.id]); const it = (un.length ? A.pick(un, 1) : A.pick(arr, 1))[0]; seen[it.id] = (seen[it.id] || 0) + 1; A.save(); return it; };
  const sceneSvg = sc => `<div class="card" style="padding:0;overflow:hidden"><svg viewBox="0 0 400 260" style="display:block;width:100%" role="img" aria-label="${esc(sc.t)}">${sc.svg}</svg></div>`;

  function run(steps, opts) {
    const mod = { dirty: () => true, async render(body, foot) { for (let i = 0; i < steps.length; i++) { A.runner.progress(i / steps.length); await steps[i](body, foot); } A.runner.close(true); if (opts && opts.onDone) opts.onDone(); } };
    A.runner.open(mod);
  }

  function photo(opts = {}) {
    const n = opts.n || 1, sc = Array.from({ length: n }, () => pickBy(SCENES, 'wphoto'));
    run(sc.map(s => async (b, f) => {
      const r = await writeScreen(b, f, { instr: 'Write one or more sentences that describe the image.', promptHtml: sceneSvg(s), sec: 60, target: 30 });
      await reviewScreen(b, f, Object.assign(r, { target: 30, model: s.model, q: 'Write About the Photo', task: 'Write About the Photo (1 min)' }));
    }), opts);
  }
  function interactive(opts = {}) {
    const it = pickBy(IWRITING, 'iwrite');
    run([
      b => prepScreen(b, A.$('#rFoot'), `<div class="card"><b>${esc(it.q)}</b></div>`, 30),
      async (b, f) => { const r = await writeScreen(b, f, { instr: 'Respond to the question in at least 50 words.', promptHtml: `<div class="card"><b>${esc(it.q)}</b></div>`, sec: 300, target: 130, tall: true, starters: true }); it._r1 = r; },
      async (b, f) => { const r = await writeScreen(b, f, { instr: 'Respond to the follow-up question.', promptHtml: `<div class="card"><b>${esc(it.f)}</b></div>`, sec: 180, target: 75, starters: true }); it._r2 = r; },
      (b, f) => reviewScreen(b, f, Object.assign({}, it._r1, { target: 130, model: it.model, q: it.q, task: 'Interactive Writing, partie 1 (5 min)' })),
      (b, f) => reviewScreen(b, f, Object.assign({}, it._r2, { target: 75, model: '(Pas de modèle pour la question de suivi : applique la même structure — position, raison, exemple.)', q: it.f, task: 'Interactive Writing, suivi (3 min)' }))
    ], opts);
  }
  function sample(opts = {}) {
    const it = pickBy(WSAMPLE, 'wsample');
    run([
      b => prepScreen(b, A.$('#rFoot'), `<div class="card"><b>${esc(it.q)}</b></div>`, 30),
      async (b, f) => { it._r = await writeScreen(b, f, { instr: 'Write about the topic below for 5 minutes.', promptHtml: `<div class="card"><b>${esc(it.q)}</b></div>`, sec: 300, target: 140, tall: true, starters: true }); },
      (b, f) => reviewScreen(b, f, Object.assign({}, it._r, { target: 140, model: it.model, q: it.q, task: 'Writing Sample (5 min)' }))
    ], opts);
  }

  /* Amorces : retrouver le mot manquant */
  function starters(opts = {}) {
    const all = STARTERS.flatMap(s => s[1].map(x => ({ cat: s[0], s: x })));
    const items = A.pick(all, 8);
    let i = 0, ok = 0;
    A.runner.open({
      dirty: () => i > 0 && i < items.length,
      render(body, foot) {
        if (i >= items.length) { body.innerHTML = `<div style="text-align:center;margin-top:30px">${A.mascot(true)}<h2>${ok}/${items.length}</h2><p>Utilise-les dans ton prochain Writing Sample.</p></div>`; foot.innerHTML = '<button class="btn" id="x">Terminer</button>'; A.$('#x').onclick = () => { A.runner.close(true); if (opts.onDone) opts.onDone(); }; return; }
        const it = items[i], ws = it.s.split(' '), k = ws.reduce((b, w, j) => w.replace(/\W/g, '').length > ws[b].replace(/\W/g, '').length ? j : b, 0);
        const ans = ws[k].replace(/[^A-Za-z]/g, '');
        A.runner.progress(i / items.length);
        body.innerHTML = `<div class="instr">Complète l'amorce</div><p class="muted">${esc(it.cat)}</p><div class="passage" style="font-size:1.2em">${ws.map((w, j) => j === k ? `<span class="gap">${A.modules.ctest.gapInput(ans.length, 0)}</span>${esc(w.replace(/[A-Za-z]/g, ''))}` : esc(w)).join(' ')} …</div><div id="stFb"></div>`;
        foot.innerHTML = '<button class="btn" id="stGo">Valider</button>';
        const ins = A.modules.ctest.wireInputs(body, () => go()); setTimeout(() => ins[0].focus(), 200);
        let done = false;
        const go = () => { if (done) { i++; return this.render(body, foot); } done = true; const r = ins[0].value.toLowerCase() === ans.toLowerCase(); if (r) { ok++; A.addPoints(5); } A.beep(r); A.srs.grade('st:' + it.s, r); A.$('#stFb').innerHTML = `<div class="fb ${r ? 'ok' : 'ko'}"><b>${esc(it.s)}</b></div>`; A.$('#stGo').textContent = 'Continuer'; };
        A.$('#stGo').onclick = go;
      }
    });
  }

  /* Vitesse de frappe (1 min) */
  const TYPE_TXT = 'Many students choose to study abroad because it gives them access to better equipment and new ideas. Living in another country also helps them become more independent. However, the first months can be difficult, so it is important to ask for help and to build a routine. In my view, the benefits are much greater than the difficulties.';
  function typing(opts = {}) {
    A.runner.open({
      dirty: () => false,
      async render(body, foot) {
        body.innerHTML = `<div class="instr">Vitesse de frappe · 1 minute</div><div class="card">${esc(TYPE_TXT)}</div><textarea id="tyTx" spellcheck="false" autocorrect="off" autocapitalize="sentences" placeholder="Recopie le texte ici…"></textarea>`;
        foot.innerHTML = '<button class="btn sec" id="tyStop">Arrêter</button>';
        const tx = A.$('#tyTx'); let started = false, done = false;
        const end = () => {
          if (done) return; done = true; A.runner.stopTimer(); tx.disabled = true;
          const n = P().words(tx.value), hist = A.S.typing || (A.S.typing = []); hist.push({ d: A.today(), wpm: n }); A.save();
          body.insertAdjacentHTML('beforeend', `<div class="fb ok"><h3>${n} mots/minute</h3><p>Au Writing Sample (5 min), ton plafond est donc ≈ ${n * 5 - 30} mots en gardant 1 minute pour réfléchir et relire. ${n < 35 ? 'Les amorces apprises par cœur t\'aident à gagner du temps.' : ''}</p>${hist.length > 1 ? `<p class="muted">Historique : ${hist.slice(-6).map(h => h.wpm).join(' → ')}</p>` : ''}</div>`);
          foot.innerHTML = '<button class="btn" id="tyEnd">Terminer</button>'; A.$('#tyEnd').onclick = () => { A.runner.close(true); if (opts.onDone) opts.onDone(); };
        };
        A.runner.timer(null);
        tx.addEventListener('input', () => { if (!started) { started = true; A.runner.timer(60, end); } });
        A.$('#tyStop').onclick = end; setTimeout(() => tx.focus(), 300);
      }
    });
  }

  A.modules.writing = { photo, interactive, sample, starters, typing, writeScreen, prepScreen, reviewScreen, sceneSvg, pickBy };
})();
