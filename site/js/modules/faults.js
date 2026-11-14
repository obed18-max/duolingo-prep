/* Mes fautes : 8 familles d'erreurs réelles. Mini-leçon → « trouve la faute » → répétition espacée.
   + lessons.forItem() : ouvre la mini-leçon liée à une erreur (bouton « Revoir la leçon »). */
(function () {
  'use strict';
  const A = App, esc = A.esc;
  const strip = w => w.replace(/[^A-Za-z'’]/g, '');

  function lessonHtml(f) {
    return `<h2>${f.icon} ${esc(f.title)}</h2><p class="muted">Relevé dans tes copies : ${esc(f.seen)}</p>
      <div class="card">${f.rule}</div>
      ${f.ex ? `<table><tr><th>✕ Ce que tu écrivais</th><th>✓ La bonne forme</th></tr>${f.ex.map(e => `<tr><td style="color:var(--red)">${esc(e[0])}</td><td style="color:var(--green);font-weight:600">${esc(e[1])}</td></tr>`).join('')}</table>` : ''}`;
  }

  // Choisir la famille du jour : la plus fragile d'abord, puis celle qui est due
  function familyScore(f) {
    const ids = itemsOf(f).map(x => x.id);
    let lap = 0, due = 0, seen = 0; const t = A.today();
    ids.forEach(id => { const s = A.S.srs[id]; if (s) { seen++; lap += s.lapses; if (s.due <= t) due++; } });
    return { seen, lap, due, n: ids.length };
  }
  function itemsOf(f) { return f.items.map((it, k) => Object.assign({ id: 'fault:' + f.id + ':' + k, fam: f }, it)); }
  function nextFamily() {
    const scored = FAULTS.map(f => [f, familyScore(f)]);
    const unseen = scored.filter(([, s]) => s.seen === 0);
    if (unseen.length) return unseen[0][0];
    return scored.sort((a, b) => (b[1].due * 3 + b[1].lap) - (a[1].due * 3 + a[1].lap))[0][0];
  }

  /* Exercice « trouve la faute » sur une liste d'items (peut mélanger plusieurs familles) */
  function drill(items, opts = {}) {
    let idx = 0, ok = 0;
    const queue = items.map(it => ({ it, retry: false }));
    const mod = {
      dirty: () => idx > 0 && idx < queue.length,
      render(body, foot) {
        A.runner.timer(null);
        if (opts.lesson && idx === 0 && !mod._lessonShown) {
          mod._lessonShown = true;
          body.innerHTML = lessonHtml(opts.lesson) + `<p class="muted">Ensuite : ${items.length} phrases. Touche le mot faux, ou « Aucune faute ».</p>`;
          foot.innerHTML = '<button class="btn" id="fGo">J\'ai compris, on s\'entraîne</button>';
          A.$('#fGo').onclick = () => mod.render(body, foot);
          return;
        }
        if (idx >= queue.length) return end(body, foot);
        const q = queue[idx], it = q.it;
        A.runner.progress(idx / queue.length);
        if (it.fam.choice) return choice(body, foot, q);
        const toks = it.s.split(' ');
        body.innerHTML = `<div class="instr">Trouve la faute.</div><p class="muted">${it.fam.icon} ${esc(it.fam.title)}</p>
          ${q.retry ? '<div class="fb warn">On réessaie cette phrase.</div>' : ''}
          <div class="card" style="font-size:1.15em;line-height:2.2">${toks.map((t, k) => `<button class="chip" data-k="${k}">${esc(t)}</button>`).join(' ')}</div>
          <div id="fFb"></div>`;
        foot.innerHTML = '<button class="btn sec" id="fNone">Aucune faute</button>';
        let done = false;
        const answer = k => {
          if (done) return; done = true;
          const chosen = k == null ? null : strip(toks[k]);
          const right = it.bad ? chosen === strip(it.bad) || (chosen && strip(it.bad).startsWith(chosen)) : k == null;
          A.$$('.chip', body).forEach((c, j) => { c.disabled = true; if (it.bad && strip(toks[j]) === strip(it.bad)) c.classList.add('on'); });
          if (k != null && !right) A.$(`.chip[data-k="${k}"]`, body).style.background = 'var(--red)';
          const corrected = it.ok || (it.bad ? it.s.split(' ').map(t => strip(t) === strip(it.bad) ? t.replace(strip(it.bad), it.fix) : t).join(' ') : it.s);
          if (right) { ok++; A.addPoints(10); A.beep(true); }
          else {
            A.beep(false);
            A.logError({ cat: it.fam.cat, src: 'faute', wrong: it.s, right: corrected, ctx: it.s, why: it.fam.title, ref: it.id });
            if (!q.retry) queue.splice(Math.min(idx + 3, queue.length), 0, { it, retry: true });
          }
          if (!q.retry || right) A.srs.grade(it.id, right);
          A.$('#fFb').innerHTML = `<div class="fb ${right ? 'ok' : 'ko'}"><h3>${right ? '✓ Bien vu' : '✕ Pas tout à fait'}</h3>
            ${it.bad ? `<p><s style="color:var(--red)">${esc(it.bad)}</s> → <b style="color:var(--green)">${esc(it.fix)}</b></p><p>✓ ${esc(corrected)}</p>` : '<p>Cette phrase était correcte. Ne corrige pas ce qui est juste !</p>'}
            ${!right ? `<p class="muted">${it.fam.rule}</p>` : ''}</div>`;
          foot.innerHTML = `<button class="btn ${right ? 'green' : ''}" id="fNext">Continuer</button>`;
          A.$('#fNext').onclick = () => { idx++; mod.render(body, foot); };
        };
        A.$$('.chip', body).forEach(c => c.onclick = () => answer(+c.dataset.k));
        A.$('#fNone').onclick = () => answer(null);
      }
    };
    function choice(body, foot, q) {
      const it = q.it;
      body.innerHTML = `<div class="instr">${esc(it.q)}</div>${it.opts.map((o, k) => `<button class="choice" data-k="${k}">${esc(o)}</button>`).join('')}<div id="fFb"></div>`;
      foot.innerHTML = '';
      A.$$('.choice', body).forEach(b => b.onclick = () => {
        const k = +b.dataset.k, right = k === it.a;
        A.$$('.choice', body).forEach((c, j) => { c.disabled = true; if (j === it.a) c.classList.add('ok'); });
        if (!right) b.classList.add('ko');
        if (right) { ok++; A.addPoints(10); A.beep(true); } else { A.beep(false); A.logError({ cat: it.fam.cat, src: 'faute', wrong: it.opts[k], right: it.opts[it.a], ctx: it.q, why: it.why, ref: it.id }); }
        A.srs.grade(it.id, right);
        A.$('#fFb').innerHTML = `<div class="fb ${right ? 'ok' : 'ko'}"><h3>${right ? '✓ Oui' : '✕ Non'}</h3><p>${esc(it.why)}</p></div>`;
        foot.innerHTML = `<button class="btn" id="fNext">Continuer</button>`;
        A.$('#fNext').onclick = () => { idx++; mod.render(body, foot); };
      });
    }
    function end(body, foot) {
      A.runner.progress(1);
      body.innerHTML = `<div style="text-align:center;margin-top:24px">${A.mascot(true)}<h2>Bravo</h2><p style="font-size:2em;font-weight:800">${ok}/${queue.length}</p>
        <p class="muted">Les phrases ratées reviennent demain, puis dans 3, 7, 15 jours…</p></div>`;
      foot.innerHTML = '<button class="btn" id="fEnd">Terminer</button>';
      A.$('#fEnd').onclick = () => { A.record('writing', ok, queue.length); A.runner.close(true); if (opts.onDone) opts.onDone(); };
    }
    A.runner.open(mod);
  }

  function family(f, opts = {}) { drill(A.shuffle(itemsOf(f)).slice(0, opts.n || 8), Object.assign({ lesson: f }, opts)); }
  function mixed(opts = {}) {
    // 1 phrase par famille + les items dus
    const all = FAULTS.flatMap(itemsOf);
    const due = all.filter(x => A.S.srs[x.id] && A.S.srs[x.id].due <= A.today());
    const pickOne = FAULTS.map(f => A.pick(itemsOf(f), 1)[0]);
    const set = [...new Map([...due, ...pickOne].map(x => [x.id, x])).values()];
    drill(A.shuffle(set).slice(0, opts.n || 10), opts);
  }

  /* --- leçons liées aux erreurs --- */
  const lessons = {
    show(f) { A.sheet(`<div class="shd"><span></span><button class="btn sec" style="width:auto;min-height:36px" onclick="App.closeSheet()">Fermer</button></div>` + lessonHtml(f)); },
    tips(key, title) {
      A.sheet(`<div class="shd"><h2>${esc(title)}</h2><button class="btn sec" style="width:auto;min-height:36px" onclick="App.closeSheet()">Fermer</button></div>
        <ul>${DET.tips[key].map(t => `<li style="margin:8px 0">${t}</li>`).join('')}</ul>`);
    },
    collocs() {
      A.sheet(`<div class="shd"><h2>🔗 Collocations clés</h2><button class="btn sec" style="width:auto;min-height:36px" onclick="App.closeSheet()">Fermer</button></div>
        <p class="muted">Des mots qui vont toujours ensemble. Apprends-les en bloc, pas mot par mot.</p>
        <table>${COLLOCS.map(c => `<tr><td><b>${esc(c[0])}</b> <button class="icbtn" style="min-height:30px;min-width:30px;display:inline-grid" aria-label="Écouter" onclick="App.speak('${c[0].replace(/'/g, '')}')">▶</button></td><td>${esc(c[1])}</td></tr>`).join('')}</table>`);
    },
    forItem(it) {
      if (it.k === 'c') return this.collocs();
      if (/raise|rise/.test(it.s) && it.trap && it.trap.some(t => /ri?ai?se|rose/.test(t))) return this.show(FAULTS.find(f => f.id === 'raise-rise'));
      if (it.k === 'v') return A.modules.cognates.sheet();
      return this.tips('fib', 'Fill in the Blanks : la méthode');
    }
  };

  A.modules.faults = { family, mixed, nextFamily, familyScore, itemsOf, lessonHtml };
  A.modules.lessons = lessons;
})();
