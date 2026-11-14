/* Cognats (Read and Select au chrono de 5 s) et faux amis. */
(function () {
  'use strict';
  const A = App, esc = A.esc;

  function readSelect(opts = {}) {
    const n = opts.n || 15, nReal = Math.ceil(n * 0.55);
    const due = A.srs.due('cog:').map(id => COGNATES.find(c => c[0] === id.slice(4))).filter(Boolean);
    const reals = [...new Set([...due, ...A.shuffle(COGNATES)])].slice(0, nReal).map(c => ({ w: c[0], real: true, fr: c[1] }));
    const fakes = A.pick(FAKEWORDS, n - reals.length).map(w => ({ w, real: false }));
    const items = A.shuffle(reals.concat(fakes));
    let idx = 0, ok = 0, missed = [];
    const mod = {
      dirty: () => idx > 0 && idx < items.length,
      render(body, foot) {
        if (idx >= items.length) return end(body, foot);
        const it = items[idx];
        A.runner.progress(idx / items.length);
        body.innerHTML = `<div class="instr">Select the real English words in this list.</div>
          <div class="card" style="text-align:center;padding:40px 16px"><div style="font-size:2em;font-weight:700">${esc(it.w)}</div></div><div id="cFb" style="min-height:70px"></div>`;
        foot.innerHTML = `<div class="btns"><button class="btn red" id="cNo">✕ Pas un mot</button><button class="btn green" id="cYes">✓ Vrai mot</button></div>`;
        let done = false;
        const ans = yes => {
          if (done) return; done = true; A.runner.stopTimer();
          const right = yes === it.real;
          if (right) { ok++; A.addPoints(4); A.beep(true); } else A.beep(false);
          if (it.real) A.srs.grade('cog:' + it.w, right);
          if (!right) { missed.push(it); A.logError({ cat: 'cognat', src: 'rs', wrong: yes ? 'oui' : 'non', right: it.real ? 'vrai mot' : 'faux mot', ctx: it.w, why: it.real ? 'Cognat : ' + it.fr : 'Mot inventé', ref: 'cog:' + it.w }); }
          A.$('#cFb').innerHTML = `<div class="fb ${right ? 'ok' : 'ko'}"><b>${right ? '✓' : '✕'} ${esc(it.w)}</b> ${it.real ? '= <b>' + esc(it.fr) + '</b> (vrai mot' + (right ? '' : ' : pense au français !') + ')' : ': mot inventé'}</div>`;
          setTimeout(() => { idx++; mod.render(body, foot); }, right ? 700 : 1800);
        };
        A.$('#cYes').onclick = () => ans(true); A.$('#cNo').onclick = () => ans(false);
        A.runner.timer(5, () => ans(null));
      }
    };
    function end(body, foot) {
      A.runner.timer(null); A.runner.progress(1);
      body.innerHTML = `<div style="text-align:center;margin-top:24px">${A.mascot(ok >= items.length * .8)}<h2>${ok}/${items.length}</h2></div>
        ${missed.length ? `<div class="list">${missed.map(m => `<div class="row"><div class="tx"><b>${esc(m.w)}</b><small>${m.real ? 'vrai mot = ' + esc(m.fr) : 'mot inventé'}</small></div></div>`).join('')}</div>` : ''}
        <div class="card">Règle d'or : si le mot ressemble à un mot <b>français qui existe</b>, réponds « vrai ». Méfie-toi d'une vraie racine avec une fin bizarre (<i>environmential</i>).</div>`;
      foot.innerHTML = '<button class="btn" id="cEnd">Terminer</button>';
      A.$('#cEnd').onclick = () => { A.record('reading', ok, items.length); A.runner.close(true); if (opts.onDone) opts.onDone(); };
    }
    A.runner.open(mod);
  }

  function falseFriends(opts = {}) {
    const items = A.pick(FALSEFRIENDS.filter(f => f[2] !== '—'), opts.n || 8);
    let idx = 0, ok = 0;
    const mod = {
      dirty: () => idx > 0 && idx < items.length,
      render(body, foot) {
        if (idx >= items.length) {
          A.runner.progress(1);
          body.innerHTML = `<div style="text-align:center;margin-top:24px">${A.mascot(true)}<h2>${ok}/${items.length}</h2><p class="muted">Faux amis</p></div>`;
          foot.innerHTML = '<button class="btn" id="ffEnd">Terminer</button>';
          A.$('#ffEnd').onclick = () => { A.runner.close(true); if (opts.onDone) opts.onDone(); };
          return;
        }
        const f = items[idx], wrong = f[2].replace(/\s*\(.*$/, '');
        const opts2 = A.shuffle([f[1], wrong]);
        A.runner.progress(idx / items.length);
        body.innerHTML = `<div class="instr">« ${esc(f[0])} » veut dire…</div>${opts2.map(o => `<button class="choice">${esc(o)}</button>`).join('')}<div id="ffFb"></div>`;
        foot.innerHTML = '';
        A.$$('.choice', body).forEach(b => b.onclick = () => {
          const right = b.textContent === f[1];
          A.$$('.choice', body).forEach(c => { c.disabled = true; if (c.textContent === f[1]) c.classList.add('ok'); });
          if (!right) b.classList.add('ko');
          if (right) { ok++; A.addPoints(5); A.beep(true); } else { A.beep(false); A.logError({ cat: 'faux-ami', src: 'ff', wrong: wrong, right: f[1], ctx: f[0], why: f[0] + ' = ' + f[1] + ' ≠ ' + f[2], ref: 'ff:' + f[0] }); }
          A.srs.grade('ff:' + f[0], right);
          A.$('#ffFb').innerHTML = `<div class="fb ${right ? 'ok' : 'ko'}"><p><b>${esc(f[0])}</b> = ${esc(f[1])}. Piège : ${esc(f[2])}.</p><p><i>${esc(f[3])}</i> <button class="icbtn" style="display:inline-grid" aria-label="Écouter" id="ffSp">▶</button></p></div>`;
          A.$('#ffSp').onclick = () => A.speak(f[3]);
          foot.innerHTML = '<button class="btn" id="ffNext">Continuer</button>';
          A.$('#ffNext').onclick = () => { idx++; mod.render(body, foot); };
        });
      }
    };
    A.runner.open(mod);
  }

  function sheet() {
    A.sheet(`<div class="shd"><h2>🔍 Cognats & faux amis</h2><button class="btn sec" style="width:auto;min-height:36px" onclick="App.closeSheet()">Fermer</button></div>
      <p>La plupart des mots académiques anglais viennent du latin et du français. <b>Ton avantage de francophone :</b> si un mot ressemble à un mot français qui existe, il est presque toujours vrai.</p>
      <h3>Faux amis</h3><table>${FALSEFRIENDS.map(f => `<tr><td><b>${esc(f[0])}</b></td><td>${esc(f[1])}</td><td class="muted">≠ ${esc(f[2])}</td></tr>`).join('')}</table>
      <h3>Cognats (extrait)</h3><p>${COGNATES.slice(0, 40).map(c => `<span class="chip">${esc(c[0])} · ${esc(c[1])}</span>`).join('')}</p>`);
  }

  A.modules.cognates = { readSelect, falseFriends, sheet };
})();
