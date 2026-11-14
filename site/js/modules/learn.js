/* Apprendre : leçons de grammaire C1 (Comprendre → Écouter → Exercices → À dire),
   vocabulaire académique par lots de 8 + quiz (révision entrelacée), dictionnaire au toucher. */
(function () {
  'use strict';
  const A = App, esc = A.esc;

  function quizScreen(body, foot, items, opts) {
    // items: [{q, o:[...], a, why}]
    return new Promise(res => {
      let i = 0, ok = 0;
      const show = () => {
        if (i >= items.length) return res(ok);
        const it = items[i], order = A.shuffle(it.o.map((_, j) => j));
        A.runner.progress((opts.base || 0) + (i / items.length) * (opts.span || 1));
        body.innerHTML = `<div class="instr">${esc(opts.title || 'Exercice')} · ${i + 1}/${items.length}</div>${it.extra ? `<p class="muted">${esc(it.extra)}</p>` : ''}<div class="card" style="font-size:1.1em">${it.qHtml || esc(it.q)}</div>
          ${order.map(j => `<button class="choice" data-j="${j}">${esc(it.o[j])}</button>`).join('')}<div id="qFb"></div>`;
        foot.innerHTML = '';
        A.$$('.choice', body).forEach(b => b.onclick = () => {
          const j = +b.dataset.j, good = j === it.a;
          A.$$('.choice', body).forEach(c => { c.disabled = true; if (+c.dataset.j === it.a) c.classList.add('ok'); });
          if (!good) b.classList.add('ko');
          if (good) { ok++; A.addPoints(5); A.beep(true); } else { A.beep(false); A.logError({ cat: it.cat || 'grammaire', src: opts.src, wrong: it.o[j], right: it.o[it.a], ctx: it.q, why: it.why || '' }); }
          if (it.srs) A.srs.grade(it.srs, good);
          A.$('#qFb').innerHTML = `<div class="fb ${good ? 'ok' : 'ko'}"><p>${good ? '✓ ' : '✕ '}${esc(it.why || '')}</p>${it.say ? `<button class="btn sec" id="qSay">▶ Écouter</button>` : ''}</div>`;
          if (it.say) A.$('#qSay').onclick = () => A.speak(it.say);
          foot.innerHTML = '<button class="btn" id="qN">Continuer</button>';
          A.$('#qN').onclick = () => { i++; show(); };
        });
      };
      show();
    });
  }
  const next = (foot, label = 'Continuer') => new Promise(r => { foot.innerHTML = `<button class="btn" id="lnN">${label}</button>`; A.$('#lnN').onclick = r; });

  /* ---------- grammaire ---------- */
  function nextGrammar() {
    const seen = A.S.seen.gram || {};
    return GRAMMAR.find(g => !seen[g.id]) || GRAMMAR.slice().sort((a, b) => (seen[a.id].best || 0) - (seen[b.id].best || 0))[0];
  }
  function grammar(opts = {}) {
    const g = opts.id ? GRAMMAR.find(x => x.id === opts.id) : nextGrammar();
    A.runner.open({
      dirty: () => true,
      async render(body, foot) {
        A.runner.timer(null); A.runner.progress(0);
        body.innerHTML = `<div class="instr">📐 ${esc(g.t)}</div><p class="muted">1. Comprendre</p><div class="card">${g.expl}</div><div class="fb ko"><b>Pièges de francophone</b><p>${esc(g.trap)}</p></div>`;
        await next(foot);
        A.runner.progress(.15);
        body.innerHTML = `<div class="instr">📐 ${esc(g.t)}</div><p class="muted">2. Écouter</p>${g.ex.map((e, k) => `<div class="card" style="display:flex;gap:10px;align-items:center"><button class="icbtn" data-k="${k}" aria-label="Écouter" style="background:var(--fill)">▶</button><span>${esc(e)}</span></div>`).join('')}`;
        A.$$('[data-k]', body).forEach(b => b.onclick = () => A.speak(g.ex[+b.dataset.k]));
        await next(foot);
        // Exercices + 2 phrases de grammaire déjà vue (révision entrelacée)
        const seen = A.S.seen.gram || (A.S.seen.gram = {});
        const old = GRAMMAR.filter(x => x.id !== g.id && seen[x.id]).flatMap(x => x.q.map(q => Object.assign({ from: x.t }, q)));
        const items = g.q.map(q => ({ q: q.s, o: q.o, a: q.a, why: q.w, say: q.s.replace('___', q.o[q.a]), srs: 'gram:' + g.id })).concat(A.pick(old, 2).map(q => ({ q: q.s, o: q.o, a: q.a, why: q.w, extra: 'Révision : ' + q.from, say: q.s.replace('___', q.o[q.a]) })));
        const ok = await quizScreen(body, foot, items, { title: '3. Exercices', src: 'grammaire', base: .3, span: .5 });
        const own = Math.min(ok, 6);
        seen[g.id] = { n: ((seen[g.id] || {}).n || 0) + 1, best: Math.max(own, (seen[g.id] || {}).best || 0) }; A.save();
        A.record('writing', ok, items.length);
        if (ok < 4 + Math.max(0, items.length - 6) * 0) {
          body.innerHTML = `<div class="fb warn"><h3>${ok}/${items.length} : on revoit cette leçon demain</h3><p>Relis l'explication : ${g.expl}</p></div>`;
          A.srs.grade('gram:' + g.id, false);
        } else body.innerHTML = `<div class="fb ok"><h3>${ok}/${items.length} : leçon validée</h3></div>`;
        await next(foot);
        A.runner.progress(.85);
        body.innerHTML = `<div class="instr">4. À dire</div><p>Répète ces phrases à voix haute (écoute d'abord).</p>${g.ex.map((e, k) => `<div class="card" style="display:flex;gap:10px;align-items:center"><button class="icbtn" data-k="${k}" style="background:var(--fill)">▶</button><span>${esc(e)}</span></div>`).join('')}`;
        A.$$('[data-k]', body).forEach(b => b.onclick = () => A.speak(g.ex[+b.dataset.k]));
        await next(foot, 'Terminer');
        A.runner.close(true); if (opts.onDone) opts.onDone();
      }
    });
  }

  /* ---------- vocabulaire ---------- */
  function nextLot() { const n = (A.S.seen.vocabLot || 0); return Math.min(n, Math.floor((VOCAB.length - 1) / 8)); }
  function vocab(opts = {}) {
    const lot = opts.lot != null ? opts.lot : nextLot();
    const words = VOCAB.slice(lot * 8, lot * 8 + 8);
    A.runner.open({
      dirty: () => true,
      async render(body, foot) {
        A.runner.timer(null);
        for (let k = 0; k < words.length; k++) {
          const w = words[k]; A.runner.progress(k / words.length * .5);
          body.innerHTML = `<div class="instr">Lot ${lot + 1} · mot ${k + 1}/8</div><div class="card" style="text-align:center"><div style="font-size:2em;font-weight:800">${esc(w.w)}</div><p class="muted">${esc(w.fr)}</p><button class="btn sec" id="vP" style="width:auto;margin:auto">▶ Écouter</button></div>
            <div class="card"><p><b>Definition :</b> ${esc(w.d)}</p><p><i>${esc(w.ex)}</i> <button class="icbtn" id="vE" style="display:inline-grid">▶</button></p></div>`;
          A.$('#vP').onclick = () => A.speak(w.w); A.$('#vE').onclick = () => A.speak(w.ex); setTimeout(() => A.speak(w.w), 250);
          await next(foot, k < 7 ? 'Mot suivant' : 'Quiz');
        }
        // Quiz : les 8 mots + 3 mots faibles des lots précédents
        const weak = A.srs.weak('voc:', 3).map(id => VOCAB.find(v => v.id === id.slice(4))).filter(Boolean).filter(v => !words.includes(v));
        const pool = words.concat(weak);
        const items = A.shuffle(pool).map((w, k) => {
          const others = A.pick(VOCAB.filter(v => v !== w), 3);
          const blanked = w.ex.replace(new RegExp(w.w.split(' ')[0].slice(0, Math.max(3, w.w.length - 3)) + '\\w*', 'i'), '_____');
          if (k % 2 && blanked !== w.ex) return { q: blanked, o: [w.w].concat(others.map(o => o.w)), a: 0, why: w.w + ' = ' + w.fr, say: w.ex, srs: 'voc:' + w.id, cat: 'collocation', extra: weak.includes(w) ? 'Mot à revoir' : '' };
          return { q: '« ' + w.w + ' » veut dire…', o: [w.fr].concat(others.map(o => o.fr)), a: 0, why: w.d, say: w.w, srs: 'voc:' + w.id, cat: 'sens', extra: weak.includes(w) ? 'Mot à revoir' : '' };
        });
        const ok = await quizScreen(body, foot, items, { title: 'Quiz', src: 'vocabulaire', base: .5, span: .5 });
        if (opts.lot == null && ok >= items.length * .6) { A.S.seen.vocabLot = lot + 1; A.save(); }
        body.innerHTML = `<div style="text-align:center;margin-top:30px">${A.mascot(ok >= items.length * .6)}<h2>${ok}/${items.length}</h2><p>${ok >= items.length * .6 ? 'Lot validé : les mots entrent en répétition espacée.' : 'On refait ce lot la prochaine fois.'}</p></div>`;
        await next(foot, 'Terminer');
        A.record('reading', ok, items.length);
        A.runner.close(true); if (opts.onDone) opts.onDone();
      }
    });
  }
  function vocabList() {
    const lots = Math.ceil(VOCAB.length / 8), cur = nextLot();
    A.sheet(`<div class="shd"><h2>📚 Vocabulaire académique</h2><button class="btn sec" style="width:auto;min-height:36px" onclick="App.closeSheet()">Fermer</button></div>
      <p class="muted">${VOCAB.length} mots, ${lots} lots de 8. Lot actuel : ${cur + 1}.</p>
      <div class="list">${Array.from({ length: lots }, (_, k) => `<button class="row" data-l="${k}"><span class="ic" style="background:${k < cur ? 'var(--green)' : 'var(--fill)'};color:${k < cur ? '#fff' : 'inherit'}">${k < cur ? '✓' : k + 1}</span><span class="tx"><b>Lot ${k + 1}</b><small class="muted">${VOCAB.slice(k * 8, k * 8 + 8).map(v => esc(v.w)).join(', ')}</small></span></button>`).join('')}</div>`,
      b => A.$$('[data-l]', b).forEach(x => x.onclick = () => { A.closeSheet(); vocab({ lot: +x.dataset.l }); }));
  }

  /* ---------- dictionnaire au toucher ---------- */
  function lookup(raw) {
    const w = raw.toLowerCase().replace(/[^a-z'-]/g, '');
    if (!w) return;
    const stem = w.replace(/(ies|es|s|ed|ing|d)$/, '');
    const v = VOCAB.find(x => x.w === w || x.w.startsWith(stem) && stem.length > 3);
    const c = COGNATES.find(x => x[0] === w || x[0] === stem);
    const f = FALSEFRIENDS.find(x => x[0] === w);
    const fib = FIB.find(x => (x.s.match(/\{(.+?)\}/) || [])[1] === w);
    const fr = v ? v.fr : c ? c[1] : f ? f[1] : null;
    const my = A.S.mywords || (A.S.mywords = {});
    A.sheet(`<div class="shd"><h2>${esc(w)}</h2><button class="btn sec" style="width:auto;min-height:36px" onclick="App.closeSheet()">Fermer</button></div>
      <button class="btn sec" id="dP">▶ Écouter</button>
      <div class="card">${fr ? `<p><b>Français :</b> ${esc(fr)}</p>` : '<p class="muted">Pas dans le dictionnaire de l\'app.</p>'}
        ${v ? `<p><b>Definition :</b> ${esc(v.d)}</p><p><i>${esc(v.ex)}</i></p>` : ''}${f ? `<p class="muted">⚠️ Faux ami : ≠ ${esc(f[2])}</p>` : ''}${fib ? `<p class="muted">💡 ${fib.fr}</p>` : ''}<div id="dAi"></div></div>
      <button class="btn" id="dAdd">${my[w] ? '✓ Dans mes mots' : '+ Ajouter à mes mots'}</button>`, b => {
      A.$('#dP', b).onclick = () => A.speak(w);
      A.$('#dAdd', b).onclick = () => { my[w] = { fr: fr || '', d: A.today() }; A.srs.grade('my:' + w, false); A.save(); A.toast('Ajouté : revient demain en révision'); A.closeSheet(); };
      if (!fr && A.ai && A.ai.sample) {
        A.$('#dAi', b).innerHTML = '<p class="muted">🤖 Claude traduit…</p>';
        A.ai.sample(`Donne en une ligne la traduction française du mot anglais "${w}" (sens le plus courant en contexte académique), puis une très courte définition en anglais simple. Format : traduction — définition.`, { modelTier: 'quick' }).then(r => { A.$('#dAi', b).innerHTML = '<p>🤖 ' + esc(r.text) + '</p>'; my[w] && (my[w].fr = r.text); }).catch(() => { A.$('#dAi', b).innerHTML = ''; });
      }
    });
  }
  // Rendre un texte « touchable » : chaque mot ouvre le dictionnaire
  function tappable(text) { return esc(text).replace(/([A-Za-z][A-Za-z'-]{2,})/g, '<span class="tw" data-w="$1">$1</span>'); }
  document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('.tw'); if (t) lookup(t.dataset.w); });

  A.modules.learn = { grammar, vocab, vocabList, lookup, tappable, quizScreen, nextGrammar };
})();
