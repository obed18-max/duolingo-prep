/* Écoute : Listen and Type (3 écoutes, 1 min, correction mot à mot) et Interactive Listening
   (Listen and Complete, Listen and Respond — chaque audio une fois —, Summarize 75 s). */
(function () {
  'use strict';
  const A = App, esc = A.esc;
  const FW = new Set('a an the of to in on at for with by from and or but is are was were be been has have had do does did will would can could should may might must not that this these those it its there their they we you he she i'.split(' '));
  const norm = w => w.toLowerCase().replace(/[^a-z0-9']/g, '').replace(/’/g, "'");

  function diff(target, typed) {
    const T = target.split(/\s+/), U = typed.trim().split(/\s+/).filter(Boolean);
    const t = T.map(norm), u = U.map(norm);
    const d = Array.from({ length: t.length + 1 }, () => new Array(u.length + 1).fill(0));
    for (let i = 1; i <= t.length; i++) for (let j = 1; j <= u.length; j++) d[i][j] = t[i - 1] === u[j - 1] ? d[i - 1][j - 1] + 1 : Math.max(d[i - 1][j], d[i][j - 1]);
    const match = new Map(); let i = t.length, j = u.length;
    while (i && j) { if (t[i - 1] === u[j - 1]) { match.set(i - 1, j - 1); i--; j--; } else if (d[i - 1][j] >= d[i][j - 1]) i--; else j--; }
    const out = [], errs = [];
    T.forEach((w, k) => {
      if (!match.has(k)) { out.push(`<span class="lt m">${esc(w)}</span>`); errs.push({ cat: FW.has(t[k]) ? 'mot-outil' : /'/.test(w) ? 'mot-outil' : 'orthographe', wrong: '(oublié)', right: w }); return; }
      const v = U[match.get(k)];
      if (v === w) out.push(`<span class="lt g">${esc(w)}</span>`);
      else if (v.toLowerCase() === w.toLowerCase()) { out.push(`<span class="lt r">${esc(v)}</span>`); errs.push({ cat: 'majuscule', wrong: v, right: w }); }
      else { out.push(`<span class="lt r">${esc(v)}</span>`); errs.push({ cat: 'ponctuation', wrong: v, right: w }); }
    });
    const extra = U.filter((_, k) => ![...match.values()].includes(k));
    extra.forEach(x => errs.push({ cat: 'orthographe', wrong: x, right: '(mot en trop ou mal écrit)' }));
    return { html: out.join(' '), errs, ok: errs.length === 0, score: match.size / T.length };
  }

  function listenType(opts = {}) {
    const n = opts.n || 6;
    const due = A.srs.due('lt:').map(x => LTYPE[+x.slice(3)]).filter(Boolean);
    const items = [...new Set([...due, ...A.pick(LTYPE, n)])].slice(0, n);
    let i = 0, tot = 0;
    A.runner.open({
      dirty: () => i > 0 && i < items.length,
      render(body, foot) {
        if (i >= items.length) {
          A.runner.timer(null); A.runner.progress(1);
          body.innerHTML = `<div style="text-align:center;margin-top:30px">${A.mascot(tot / items.length >= .85)}<h2>${Math.round(tot / items.length * 100)} %</h2><p class="muted">des mots justes</p></div><div class="card">Rappel : relis l'orthographe, la majuscule du début et le point final. Les petits mots (of, to, the, 've) sont ceux qu'on oublie le plus.</div>`;
          foot.innerHTML = '<button class="btn" id="x">Terminer</button>'; A.$('#x').onclick = () => { A.record('listening', Math.round(tot * 10), items.length * 10); A.runner.close(true); if (opts.onDone) opts.onDone(); }; return;
        }
        const s = items[i], idx = LTYPE.indexOf(s); let plays = 0, done = false;
        A.runner.progress(i / items.length);
        body.innerHTML = `<div class="instr">Type the statement that you hear.</div>
          <div class="card" style="text-align:center"><button class="btn sec" id="ltPlay" style="width:auto;margin:auto">🔊 Écouter (3 restantes)</button></div>
          <textarea id="ltTx" spellcheck="false" autocorrect="off" autocapitalize="sentences" style="min-height:90px" placeholder="Type here…"></textarea><div id="ltFb"></div>`;
        foot.innerHTML = '<button class="btn" id="ltGo">Valider</button>';
        const play = () => { if (plays >= 3) return; plays++; A.speak(s, { rate: 1 }); A.$('#ltPlay').textContent = plays >= 3 ? '🔇 Plus d\'écoute' : `🔊 Écouter (${3 - plays} restante${3 - plays > 1 ? 's' : ''})`; };
        A.$('#ltPlay').onclick = play; setTimeout(play, 400);
        const go = () => {
          if (done) { i++; return this.render(body, foot); }
          done = true; A.runner.stopTimer();
          const r = diff(s, A.$('#ltTx').value); tot += r.score;
          A.srs.grade('lt:' + idx, r.ok);
          r.errs.slice(0, 4).forEach(e => A.logError(Object.assign({ src: 'listen-type', ctx: s, why: e.cat === 'mot-outil' ? 'Petit mot oublié : réécoute en cherchant of, to, the, have…' : e.cat === 'majuscule' ? 'Majuscule' : 'Orthographe ou ponctuation' }, e)));
          if (r.ok) { A.addPoints(10); A.beep(true); } else A.beep(false);
          A.$('#ltFb').innerHTML = `<div class="fb ${r.ok ? 'ok' : 'ko'}"><h3>${r.ok ? '✓ Parfait' : Math.round(r.score * 100) + ' % des mots'}</h3><p style="line-height:2">${r.html}</p><p class="muted">${esc(s)}</p>
            ${r.errs.some(e => e.cat === 'mot-outil') ? '<p>🧩 Tu as oublié un petit mot : au test, utilise la 2e et la 3e écoute pour les chercher.</p>' : ''}</div><button class="btn sec" id="ltAgain">▶ Réécouter</button>`;
          A.$('#ltAgain').onclick = () => A.speak(s);
          A.$('#ltGo').textContent = 'Continuer';
        };
        A.$('#ltGo').onclick = go;
        A.runner.timer(60, () => { if (!done) go(); });
      }
    });
  }

  /* ---------- Interactive Listening ---------- */
  function otherVoice() { const vs = A.voices(); const cur = A.S.settings.voice; const o = vs.find(v => v.name !== cur && /en-(GB|AU)/i.test(v.lang)) || vs.find(v => v.name !== cur); return o ? o.name : ''; }
  function interactive(opts = {}) {
    const set = A.modules.writing.pickBy(ILISTEN, 'ilisten');
    const voice = otherVoice();
    let shared = 390, t0, ok = 0, total = 0, summary;
    const say = (txt, end) => A.speak(txt, { voice, claudeVoice: 'airy', rate: 1, onend: end });
    const remaining = () => Math.max(5, shared - Math.round((Date.now() - t0) / 1000));
    const steps = [
      (b, f) => new Promise(r => {
        b.innerHTML = `<div class="instr">Interactive Listening · ${esc(set.t)}</div><div class="card">${esc(set.scene)}</div>
          <div class="card muted">1) Listen and Complete : audio rejouable, complète les mots.<br>2) Listen and Respond : chaque réplique n'est dite <b>qu'une fois</b>, choisis la meilleure réponse.<br>3) Résumé de la conversation en 75 s.<br>Chrono partagé de 6 min 30 pour les parties 1 et 2 : va vite sur les questions faciles.</div>`;
        f.innerHTML = '<button class="btn" id="go">Commencer</button>'; A.$('#go').onclick = () => { t0 = Date.now(); r(); };
      }),
      (b, f) => new Promise(r => {
        const parts = set.complete.split(/(\{[^}]+\})/); let k = 0; const ans = [];
        const plain = set.complete.replace(/[{}]/g, '');
        b.innerHTML = `<div class="instr">Listen and Complete</div><button class="btn sec" id="lcPlay">🔊 Écouter (rejouable)</button>
          <div class="passage" style="margin-top:10px">${parts.map(p => { const m = p.match(/^\{(.+)\}$/); if (!m) return esc(p); ans.push(m[1]); return `<span class="gap">${esc(m[1][0])}${A.modules.ctest.gapInput(m[1].length - 1, k++)}</span>`; }).join('')}</div><div id="lcFb"></div>`;
        f.innerHTML = '<button class="btn" id="lcGo">Valider</button>';
        A.$('#lcPlay').onclick = () => say(plain); setTimeout(() => say(plain), 400);
        const ins = A.modules.ctest.wireInputs(b, () => {});
        let done = false;
        const go = () => {
          if (done) return r(); done = true;
          ans.forEach((w, j) => { const v = w[0] + ins[j].value, good = v.toLowerCase() === w.toLowerCase(); total++; if (good) ok++; else A.logError({ cat: 'orthographe', src: 'interactive-listening', wrong: v, right: w, ctx: plain, why: 'Listen and Complete' }); ins[j].disabled = true; ins[j].parentElement.classList.add(good ? 'ok' : 'ko'); if (!good) ins[j].parentElement.insertAdjacentHTML('beforeend', `<span class="fix">${esc(w.slice(1))}</span>`); });
          A.$('#lcGo').textContent = 'Continuer';
        };
        A.$('#lcGo').onclick = go;
        A.runner.timer(remaining(), () => { if (!done) go(); r(); });
      }),
      async (b, f) => {
        for (let k = 0; k < set.convo.length; k++) {
          const c = set.convo[k];
          A.runner.progress(.3 + k / set.convo.length * .4);
          b.innerHTML = `<div class="instr">Listen and Respond · ${k + 1}/${set.convo.length}</div><div class="card" style="text-align:center"><p>🔊 ${k === 0 ? 'Écoute bien : une seule fois.' : 'Réplique suivante…'}</p></div>`;
          f.innerHTML = '';
          await new Promise(r => say(c.b, r));
          await new Promise(r => {
            b.innerHTML = `<div class="instr">Select the best response.</div>${c.o.map((o, j) => `<button class="choice" data-j="${j}">${esc(o)}</button>`).join('')}<div id="lrFb"></div>`;
            A.runner.timer(remaining(), () => r());
            A.$$('.choice', b).forEach(x => x.onclick = () => {
              const j = +x.dataset.j, good = j === c.a; total++; if (good) { ok++; A.beep(true); } else { A.beep(false); A.logError({ cat: 'sens', src: 'interactive-listening', wrong: c.o[j], right: c.o[c.a], ctx: c.b, why: 'Réponse qui ne suit pas logiquement la réplique.' }); }
              A.$$('.choice', b).forEach((y, q) => { y.disabled = true; if (q === c.a) y.classList.add('ok'); }); if (!good) x.classList.add('ko');
              A.$('#lrFb').innerHTML = `<div class="fb ${good ? 'ok' : 'ko'}"><p>Réplique : <i>${esc(c.b)}</i></p></div>`;
              f.innerHTML = '<button class="btn" id="lrN">Continuer</button>'; A.$('#lrN').onclick = r;
            });
          });
        }
        A.runner.stopTimer();
      },
      async (b, f) => {
        const transcript = set.convo.map(c => `<p><b>B :</b> ${esc(c.b)}<br><b>Toi :</b> ${esc(c.o[c.a])}</p>`).join('');
        summary = await A.modules.writing.writeScreen(b, f, { instr: 'Summarize the conversation you just had in 75 seconds.', promptHtml: `<details open><summary>La conversation</summary>${transcript}</details><div class="card muted">Qui parle, de quoi, les points clés, comment ça se termine. Phrases complètes, pas de puces.</div>`, sec: 75, target: 50 });
      },
      async (b, f) => {
        A.record('listening', ok, total);
        A.addPoints(ok * 4);
        await A.modules.writing.reviewScreen(b, f, Object.assign({}, summary, { target: 50, model: set.model, q: 'Summarize the conversation: ' + set.scene, task: 'Summarize the Conversation (75 s)' }));
        b.innerHTML = `<div style="text-align:center;margin-top:30px">${A.mascot(ok / total >= .75)}<h2>Écoute : ${ok}/${total}</h2></div>`;
        f.innerHTML = '<button class="btn" id="x">Terminer</button>'; await new Promise(r => A.$('#x').onclick = r);
      }
    ];
    A.runner.open({ dirty: () => true, async render(b, f) { for (let i = 0; i < steps.length; i++) { A.runner.progress(i / steps.length); await steps[i](b, f); } A.runner.close(true); if (opts.onDone) opts.onDone(); } });
  }

  A.modules.listening = { listenType, interactive, diff };
})();
