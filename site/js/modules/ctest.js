/* Fill in the Blanks + Read and Complete (format C-test du DET).
   Correction lettre par lettre, détection des « mots qui ont les bonnes lettres mais pas le bon sens »,
   étape « Relis la phrase » avant de valider (habitude à prendre pour le jour J). */
(function () {
  'use strict';
  const A = App, esc = A.esc;

  /* ---------- dictionnaire des vrais mots connus de l'app ---------- */
  let WORDSET;
  function words() {
    if (WORDSET) return WORDSET;
    WORDSET = new Set();
    const add = t => (t.toLowerCase().match(/[a-z]+/g) || []).forEach(w => WORDSET.add(w));
    FIB.forEach(i => { add(i.s); (i.trap || []).forEach(add); });
    RAC.forEach(p => add(p.p));
    COGNATES.forEach(c => add(c[0]));
    FALSEFRIENDS.forEach(f => add(f[0] + ' ' + f[3]));
    FAULTS.forEach(f => (f.items || []).forEach(i => i.fix && add(i.fix)));
    add('modern modest employees employers inside insist attraction attracting sound solve did took rise raised raise rose risen affect effect economic economical analyse successful responsability');
    WORDSET.delete('responsability');
    return WORDSET;
  }
  function lev(a, b) {
    const m = a.length, n = b.length, d = Array.from({ length: m + 1 }, (_, i) => [i]);
    for (let j = 1; j <= n; j++) d[0][j] = j;
    for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[m][n];
  }
  const shown = w => Math.max(1, Math.floor(w.length / 2));

  // Trouver une collocation autour du mot (±4 mots)
  function findColloc(word, ctxWords) {
    const w = word.toLowerCase(), set = ctxWords.map(x => x.toLowerCase());
    for (const c of COLLOCS) {
      const [txt, fr, a, b] = c;
      const stem = s => s.replace(/(ies|es|s|ed|ing|d)$/, '');
      const hitA = stem(w) === stem(a) || w.startsWith(stem(a));
      const hitB = stem(w) === stem(b) || w.startsWith(stem(b));
      if (hitA && set.some(x => x.startsWith(stem(b)) || x === b)) return [txt, fr];
      if (hitB && set.some(x => x.startsWith(stem(a)))) return [txt, fr];
    }
    return null;
  }

  /* Classe une erreur. Renvoie {cat, why} */
  function classify(answer, typedFull, item, ctxWords) {
    const t = typedFull.toLowerCase(), a = answer.toLowerCase();
    const col = findColloc(a, ctxWords);
    const trap = item && item.trap && item.trap.some(x => x.toLowerCase() === t);
    if (t.length <= shown(a)) return { cat: 'sens', why: 'Tu n\'as pas complété ce mot. Au test, un mot vide = point perdu : tente toujours quelque chose.' };
    if (trap || (words().has(t) && t !== a)) {
      let why = '« ' + esc(typedFull) + ' » est un vrai mot, mais il ne va pas dans cette phrase. Relis la phrase entière : le sens doit coller, pas seulement les lettres.';
      if (col) why += ' Ici, c\'est la collocation <b>' + esc(col[0]) + '</b> (' + esc(col[1]) + ').';
      return { cat: col ? 'collocation' : 'sens', why };
    }
    if (lev(t, a) <= 2) {
      const w = { cat: 'orthographe', why: 'Presque ! C\'est une faute d\'orthographe.' };
      if (/s$/.test(a) && !/s$/.test(t)) { w.cat = 'pluriel'; w.why = 'Le nom est au pluriel ici : regarde les mots autour (many, several, two…).'; }
      if (/ing$/.test(a) && !/ing$/.test(t)) { w.cat = 'grammaire'; w.why = 'Il faut la forme en -ing (après une préposition ou un verbe comme enjoy, avoid…).'; }
      if (/ed$/.test(a) && !/ed$/.test(t)) { w.cat = 'grammaire'; w.why = 'Il faut le passé ou le participe passé (-ed) : regarde le temps de la phrase.'; }
      return w;
    }
    if (col) return { cat: 'collocation', why: 'Collocation à retenir : <b>' + esc(col[0]) + '</b> (' + esc(col[1]) + ').' };
    return { cat: 'sens', why: 'Ce n\'est pas le mot attendu. Cherche un mot qui a du sens avec les mots autour.' };
  }

  function letterDiff(answer, typedSuffix, pre) {
    const rest = answer.slice(pre);
    let out = '<span class="lt g">' + esc(answer.slice(0, pre)) + '</span>';
    for (let i = 0; i < rest.length; i++) {
      const c = typedSuffix[i];
      if (c === undefined || c === '') out += '<span class="lt m">' + esc(rest[i]) + '</span>';
      else if (c.toLowerCase() === rest[i].toLowerCase()) out += '<span class="lt g">' + esc(rest[i]) + '</span>';
      else out += '<span class="lt r">' + esc(c) + '</span>';
    }
    return out;
  }

  function gapInput(len, idx) {
    return `<input type="text" data-i="${idx}" maxlength="${len}" style="width:${(len * 1.4 + .1).toFixed(2)}ch" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="next" aria-label="lettres manquantes, ${len}">`;
  }
  // Remplir automatiquement le champ suivant
  function wireInputs(root, onEnter) {
    const ins = A.$$('.gap input', root);
    ins.forEach((el, k) => {
      el.addEventListener('input', () => {
        el.value = el.value.replace(/[^A-Za-z'’-]/g, '');
        if (el.value.length >= +el.maxLength && ins[k + 1]) ins[k + 1].focus();
      });
      el.addEventListener('keydown', e => {
        if (e.key === 'Enter') { e.preventDefault(); if (ins[k + 1]) ins[k + 1].focus(); else onEnter && onEnter(); }
        if (e.key === 'Backspace' && !el.value && ins[k - 1]) { ins[k - 1].focus(); }
      });
    });
    return ins;
  }

  /* =================== FILL IN THE BLANKS =================== */
  function parseFib(item) {
    const m = item.s.match(/^(.*)\{(.+?)\}(.*)$/);
    return { before: m[1], word: m[2], after: m[3] };
  }
  function pickFib(n) {
    const S = A.S, due = A.srs.due('fib:').map(x => x.slice(4));
    const seen = (S.seen.fib || {});
    const byId = Object.fromEntries(FIB.map(i => [i.id, i]));
    let list = due.filter(id => byId[id]).map(id => byId[id]);
    const unseen = A.shuffle(FIB.filter(i => !seen[i.id] && !list.includes(i)));
    // Priorité : pièges de sens et collocations (les points faibles d'Obed)
    unseen.sort((a, b) => ('sc'.includes(b.k) ? 1 : 0) - ('sc'.includes(a.k) ? 1 : 0));
    list = list.concat(unseen);
    if (list.length < n) list = list.concat(A.shuffle(FIB.filter(i => !list.includes(i))));
    return list.slice(0, n);
  }

  function fib(opts = {}) {
    const n = opts.n || 9;
    const queue = pickFib(n).map(i => ({ item: i, retry: false }));
    let idx = 0, ok = 0, total = 0, mistakes = [], phase = 'answer';
    const mod = {
      dirty: () => idx > 0 && idx < queue.length,
      render(body, foot) {
        if (idx >= queue.length) return end(body, foot);
        const q = queue[idx], it = q.item, p = parseFib(it), pre = shown(p.word);
        phase = 'answer';
        A.runner.progress(idx / queue.length);
        body.innerHTML = `
          <div class="instr">Type the missing letters to complete the text below.</div>
          ${q.retry ? '<div class="fb warn"><b>On réessaie</b> cette phrase ratée tout à l\'heure.</div>' : ''}
          <div class="passage" id="fibP">${esc(p.before)}<span class="gap">${esc(p.word.slice(0, pre))}${gapInput(p.word.length - pre, 0)}</span>${esc(p.after)}</div>
          <div id="fibFb"></div>`;
        foot.innerHTML = `<button class="btn" id="fibGo">Valider</button>`;
        const ins = wireInputs(body, () => submit());
        setTimeout(() => ins[0].focus(), 250);
        A.$('#fibGo').onclick = () => phase === 'answer' ? submit() : phase === 'reread' ? grade() : next();
        A.runner.timer(20, () => grade(true));

        function submit() {
          if (A.S.settings.reread && ins[0].value.length) {
            phase = 'reread';
            const full = p.word.slice(0, pre) + ins[0].value;
            A.$('#fibFb').innerHTML = `<div class="reread"><b>👀 Relis la phrase entière.</b> Est-ce qu'elle a du sens ?<p>${esc(p.before)}<mark>${esc(full)}</mark>${esc(p.after)}</p></div>`;
            foot.innerHTML = `<div class="btns"><button class="btn sec" id="fibFix">Je corrige</button><button class="btn" id="fibGo2">Oui, je valide</button></div>`;
            A.$('#fibFix').onclick = () => { phase = 'answer'; A.$('#fibFb').innerHTML = ''; foot.innerHTML = '<button class="btn" id="fibGo">Valider</button>'; A.$('#fibGo').onclick = () => submit(); ins[0].focus(); ins[0].select(); };
            A.$('#fibGo2').onclick = () => grade();
          } else grade();
        }
        function grade(timeout) {
          if (phase === 'done') return;
          phase = 'done'; A.runner.stopTimer();
          ins[0].disabled = true; ins[0].blur();
          const typed = ins[0].value, full = p.word.slice(0, pre) + typed;
          const right = full.toLowerCase() === p.word.toLowerCase();
          total++;
          const gap = A.$('.gap', body);
          gap.classList.add(right ? 'ok' : 'ko');
          let html;
          if (right) {
            ok++; A.addPoints(10); A.beep(true);
            html = `<div class="fb ok"><div style="display:flex;gap:10px;align-items:center">${A.mascot(true)}<div><h3>✓ Correct</h3><p>${it.fr}</p></div></div></div>`;
          } else {
            A.beep(false);
            const c = classify(p.word, full, it, (p.before + ' ' + p.after).match(/[A-Za-z]+/g) || []);
            if (it.k === 'c' && c.cat === 'sens') c.cat = 'collocation';
            gap.insertAdjacentHTML('beforeend', `<span class="fix">${esc(p.word)}</span>`);
            html = `<div class="fb ko"><div style="display:flex;gap:10px;align-items:center">${A.mascot(false)}<div><h3>✕ ${timeout ? 'Temps écoulé' : 'Pas tout à fait'}</h3></div></div>
              <p>Ta réponse : <b>${esc(full) || '—'}</b> · Bonne réponse : <b>${esc(p.word)}</b></p>
              <p style="font-size:1.25em">${letterDiff(p.word, typed, pre)}</p>
              <p>${c.why}</p><p>💡 ${it.fr}</p>
              <button class="btn sec" id="fibLesson" style="margin-top:8px">Revoir la leçon</button>
              ${A.ai && A.ai.sample ? '<button class="btn sec" id="fibAi" style="margin-top:8px">🤖 Explique-moi</button><div id="fibAiOut"></div>' : ''}</div>`;
            A.logError({ cat: c.cat, src: 'fib', wrong: full, right: p.word, ctx: p.before + p.word + p.after, why: it.fr, ref: 'fib:' + it.id });
            mistakes.push({ wrong: full, right: p.word, ctx: p.before + '___' + p.after });
            // revient dans la séance 3 questions plus tard (une fois)
            if (!q.retry) queue.splice(Math.min(idx + 4, queue.length), 0, { item: it, retry: true });
          }
          if (!q.retry || right) A.srs.grade('fib:' + it.id, right);
          const seen = A.S.seen.fib || (A.S.seen.fib = {});
          seen[it.id] = (seen[it.id] || 0) + 1; A.save();
          A.$('#fibFb').innerHTML = html + `<button class="btn sec" id="fibSpeak" style="margin-top:8px">▶ Écouter la phrase</button>`;
          A.$('#fibSpeak').onclick = () => A.speak(p.before + p.word + p.after);
          const les = A.$('#fibLesson'); if (les) les.onclick = () => A.modules.lessons.forItem(it);
          const ai = A.$('#fibAi'); if (ai) ai.onclick = () => { ai.remove(); A.ai.explain(p.before + p.word + p.after, full, p.word, A.$('#fibAiOut')); };
          foot.innerHTML = `<button class="btn ${right ? 'green' : ''}" id="fibNext">Continuer</button>`;
          A.$('#fibNext').onclick = next;
        }
        function next() { idx++; mod.render(body, foot); }
      },
      onClose() { if (total) A.record('reading', ok, total); }
    };
    function end(body, foot) {
      A.runner.timer(null); A.runner.progress(1);
      const firstTry = queue.filter(q => !q.retry).length;
      body.innerHTML = `<div style="text-align:center;margin-top:24px">${A.mascot(ok / Math.max(total, 1) >= .7)}
        <h2>Série terminée</h2><p style="font-size:2em;font-weight:800;margin:4px 0">${ok}/${total}</p>
        <p class="muted">${firstTry} phrases, plus les réessais</p></div>
        ${mistakes.length ? `<h3>À retenir</h3><div class="list">${mistakes.map(m => `<div class="row"><div class="tx"><b>${esc(m.right)}</b><small>${esc(m.ctx)} · tu as écrit « ${esc(m.wrong)} »</small></div></div>`).join('')}</div><p class="muted">Ces mots reviennent demain en révision.</p>` : '<p style="text-align:center">Aucune erreur. 👏</p>'}`;
      foot.innerHTML = `<button class="btn" id="fibEnd">Terminer</button>`;
      A.$('#fibEnd').onclick = () => { A.record('reading', ok, total); total = 0; A.runner.close(true); if (opts.onDone) opts.onDone(); };
    }
    A.runner.open(mod);
  }

  /* =================== READ AND COMPLETE =================== */
  // Découpe un paragraphe en phrases et crée les trous (déterministe)
  function buildGaps(passage, cap = 18) {
    const sents = passage.p.match(/[^.!?]+[.!?]+(\s|$)/g).map(s => s.trim());
    const out = []; let gaps = [], alt = 0;
    sents.forEach((s, si) => {
      const toks = s.split(/(\s+)/);
      const mid = si > 0 && si < sents.length - 1;
      const parts = toks.map(tok => {
        if (!mid || /^\s+$/.test(tok) || gaps.length >= cap) return { t: tok };
        const m = tok.match(/^([A-Za-z]+)([^A-Za-z]*)$/);
        if (!m) return { t: tok };
        const w = m[1];
        if (w.length < 2 || /^[A-Z]/.test(w)) return { t: tok };
        alt++;
        if (alt % 2) return { t: tok };
        const g = { i: gaps.length, word: w, pre: shown(w), sent: si, punct: m[2] };
        gaps.push(g);
        return { g };
      });
      out.push(parts);
    });
    return { sents, parts: out, gaps };
  }
  function sentenceText(built, si, highlight) {
    return built.parts[si].map(x => x.g ? (highlight ? highlight(x.g) : x.g.word + x.g.punct) : esc(x.t)).join('');
  }
  function pickRac() {
    const seen = A.S.seen.rac || {};
    const unseen = RAC.filter(p => !seen[p.id]);
    if (unseen.length) return unseen[Math.floor(Math.random() * unseen.length)];
    return RAC.slice().sort((a, b) => (seen[a.id].best || 0) - (seen[b.id].best || 0))[0];
  }

  function rac(opts = {}) {
    const rounds = opts.n || 2;
    let round = 0, totOk = 0, totN = 0, phase, built, passage, ins;
    const mod = {
      dirty: () => phase === 'answer' || phase === 'reread',
      render(body, foot) {
        if (round >= rounds) return end(body, foot);
        passage = pickRac(); built = buildGaps(passage); phase = 'answer';
        A.runner.progress(round / rounds);
        const html = built.parts.map(ps => ps.map(x => x.g ? `<span class="gap">${esc(x.g.word.slice(0, x.g.pre))}${gapInput(x.g.word.length - x.g.pre, x.g.i)}</span>${esc(x.g.punct)}` : esc(x.t)).join('')).join(' ');
        body.innerHTML = `<div class="instr">Type the missing letters to complete the text below.</div>
          <div class="passage" id="racP">${html}</div><div id="racFb"></div>
          <p class="muted">${built.gaps.length} mots à compléter · ${esc(passage.t)}</p>`;
        foot.innerHTML = `<button class="btn" id="racGo">Valider</button>`;
        ins = wireInputs(body, () => submit());
        A.$('#racGo').onclick = () => submit();
        A.runner.timer(180, () => grade(true));
        function submit() {
          if (phase !== 'answer') return;
          if (A.S.settings.reread) {
            phase = 'reread';
            const hl = g => { const v = g.word.slice(0, g.pre) + (ins[g.i].value || '…'); return `<mark>${esc(v)}</mark>${esc(g.punct)}`; };
            A.$('#racFb').innerHTML = `<div class="reread"><b>👀 Relis chaque phrase avec tes mots.</b> Un mot qui a les bonnes lettres mais pas le bon sens ? Corrige-le maintenant.
              ${built.sents.map((_, si) => built.parts[si].some(x => x.g) ? `<p>${sentenceText(built, si, hl)}</p>` : '').join('')}</div>`;
            A.$('#racFb').scrollIntoView({ behavior: 'smooth' });
            foot.innerHTML = `<div class="btns"><button class="btn sec" id="racFix">Je corrige</button><button class="btn" id="racOk">Je valide</button></div>`;
            A.$('#racFix').onclick = () => { phase = 'answer'; A.$('#racFb').innerHTML = ''; foot.innerHTML = '<button class="btn" id="racGo">Valider</button>'; A.$('#racGo').onclick = () => submit(); A.$('#racP').scrollIntoView({ behavior: 'smooth' }); };
            A.$('#racOk').onclick = () => grade();
          } else grade();
        }
        function grade(timeout) {
          if (phase === 'done') return;
          phase = 'done'; A.runner.stopTimer();
          let ok = 0; const errs = [];
          built.gaps.forEach(g => {
            const el = ins[g.i]; el.disabled = true;
            const full = g.word.slice(0, g.pre) + el.value;
            const right = full.toLowerCase() === g.word.toLowerCase();
            el.parentElement.classList.add(right ? 'ok' : 'ko');
            if (right) ok++;
            else {
              el.parentElement.insertAdjacentHTML('beforeend', `<span class="fix">${esc(g.word.slice(g.pre))}</span>`);
              const ctx = built.sents[g.sent];
              const c = classify(g.word, full, null, ctx.match(/[A-Za-z]+/g) || []);
              errs.push({ g, full, c, typed: el.value });
              A.logError({ cat: c.cat, src: 'rac', wrong: full, right: g.word, ctx, why: c.why.replace(/<[^>]+>/g, ''), ref: 'rac:' + passage.id + ':' + g.i });
              A.srs.grade('rac:' + passage.id + ':' + g.i, false);
            }
          });
          totOk += ok; totN += built.gaps.length;
          A.addPoints(ok * 5);
          A.beep(ok / built.gaps.length >= .7);
          const seen = A.S.seen.rac || (A.S.seen.rac = {});
          const pct = Math.round(ok / built.gaps.length * 100);
          seen[passage.id] = { n: ((seen[passage.id] || {}).n || 0) + 1, best: Math.max(pct, (seen[passage.id] || {}).best || 0), last: A.today() };
          A.save();
          A.$('#racFb').innerHTML = `<div class="fb ${pct >= 70 ? 'ok' : 'ko'}"><div style="display:flex;gap:10px;align-items:center">${A.mascot(pct >= 70)}<div><h3>${timeout ? '⏱ Temps écoulé · ' : ''}${ok}/${built.gaps.length} mots justes (${pct} %)</h3></div></div></div>
            ${errs.map(e => `<div class="card"><p style="font-size:1.2em;margin:0">${letterDiff(e.g.word, e.typed, e.g.pre)}</p>
              <p>Tu as écrit <b>${esc(e.full)}</b> → <b>${esc(e.g.word)}</b></p><p class="muted">${e.c.why}</p>
              <p class="muted">« ${esc(built.sents[e.g.sent])} »</p>
              ${A.ai && A.ai.sample ? `<button class="btn sec" data-ai="${e.g.i}" style="min-height:40px">🤖 Explique-moi</button><div id="aiOut${e.g.i}"></div>` : ''}</div>`).join('')}
            ${errs.length ? '<p class="muted">Ces mots reviennent demain en révision, dans leur phrase.</p>' : ''}`;
          A.$$('[data-ai]', body).forEach(b => b.onclick = () => { const e = errs.find(x => x.g.i === +b.dataset.ai); b.remove(); A.ai.explain(built.sents[e.g.sent], e.full, e.g.word, A.$('#aiOut' + e.g.i)); });
          foot.innerHTML = `<button class="btn" id="racNext">${round + 1 < rounds ? 'Paragraphe suivant' : 'Voir le bilan'}</button>`;
          A.$('#racNext').onclick = () => { round++; mod.render(body, foot); A.$('#rBody').scrollTop = 0; };
        }
      },
      onClose() { if (totN) A.record('reading', totOk, totN); }
    };
    function end(body, foot) {
      A.runner.timer(null); A.runner.progress(1);
      const pct = Math.round(totOk / Math.max(totN, 1) * 100);
      body.innerHTML = `<div style="text-align:center;margin-top:24px">${A.mascot(pct >= 70)}<h2>Read and Complete terminé</h2>
        <p style="font-size:2em;font-weight:800;margin:4px 0">${pct} %</p><p class="muted">${totOk}/${totN} mots justes</p></div>
        <div class="card"><b>Ton objectif pour 120 :</b> viser 80 % et plus ici. Ce qui fait la différence : relire chaque phrase finie, et penser collocation (solve <i>a problem</i>, take <i>place</i>).</div>`;
      foot.innerHTML = `<button class="btn" id="racEnd">Terminer</button>`;
      A.$('#racEnd').onclick = () => { A.record('reading', totOk, totN); totN = 0; A.runner.close(true); if (opts.onDone) opts.onDone(); };
    }
    A.runner.open(mod);
  }

  A.modules.ctest = { fib, rac, buildGaps, sentenceText, shown, classify, letterDiff, gapInput, wireInputs, parseFib, words };
})();
