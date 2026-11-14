/* Réviser : tout ce qui est dû en répétition espacée (mots ratés dans leur phrase, fautes, cognats),
   puis un mini-quiz mélangé de ce qui est déjà vu. */
(function () {
  'use strict';
  const A = App, esc = A.esc, C = () => A.modules.ctest;

  function gapItemFromRef(ref) {
    if (ref.startsWith('fib:')) {
      const it = FIB.find(x => x.id === ref.slice(4)); if (!it) return null;
      const p = C().parseFib(it); return { ref, before: p.before, word: p.word, after: p.after, fr: it.fr, item: it };
    }
    if (ref.startsWith('rac:')) {
      const [, pid, gi] = ref.split(':'); const pas = RAC.find(x => x.id === pid); if (!pas) return null;
      const b = C().buildGaps(pas), g = b.gaps[+gi]; if (!g) return null;
      const parts = b.parts[g.sent]; let before = '', after = '', hit = false;
      parts.forEach(x => { const t = x.g ? x.g.word + x.g.punct : x.t; if (x.g && x.g.i === g.i) { hit = true; after += g.punct; } else if (hit) after += t; else before += t; });
      return { ref, before, word: g.word, after, fr: 'Paragraphe « ' + pas.t + ' ».' };
    }
    return null;
  }

  function counts() {
    const due = A.srs.due();
    return { gaps: due.filter(r => /^(fib|rac):/.test(r)).length, faults: due.filter(r => r.startsWith('fault:')).length, other: due.filter(r => /^(cog|ff):/.test(r)).length, total: due.length };
  }

  function gapReview(items, opts) {
    let idx = 0, ok = 0;
    const mod = {
      dirty: () => idx > 0 && idx < items.length,
      render(body, foot) {
        if (idx >= items.length) { if (opts.onDone) opts.onDone(ok, items.length); return; }
        const it = items[idx], pre = C().shown(it.word);
        A.runner.progress(idx / items.length);
        body.innerHTML = `<div class="instr">Révision · complète le mot</div>
          <div class="passage">${esc(it.before)}<span class="gap">${esc(it.word.slice(0, pre))}${C().gapInput(it.word.length - pre, 0)}</span>${esc(it.after)}</div><div id="rvFb"></div>`;
        foot.innerHTML = '<button class="btn" id="rvGo">Valider</button>';
        const ins = C().wireInputs(body, () => grade());
        setTimeout(() => ins[0].focus(), 250);
        let done = false;
        A.$('#rvGo').onclick = () => done ? next() : grade();
        A.runner.timer(20, () => grade());
        function grade() {
          if (done) return; done = true; A.runner.stopTimer(); ins[0].disabled = true;
          const full = it.word.slice(0, pre) + ins[0].value, right = full.toLowerCase() === it.word.toLowerCase();
          A.srs.grade(it.ref, right);
          if (right) { ok++; A.addPoints(8); A.beep(true); }
          else {
            A.beep(false);
            const c = C().classify(it.word, full, it.item || null, (it.before + ' ' + it.after).match(/[A-Za-z]+/g) || []);
            A.logError({ cat: c.cat, src: 'revision', wrong: full, right: it.word, ctx: it.before + it.word + it.after, why: it.fr, ref: it.ref });
          }
          A.$('#rvFb').innerHTML = `<div class="fb ${right ? 'ok' : 'ko'}"><h3>${right ? '✓ Retenu' : '✕ ' + esc(it.word)}</h3>${right ? '' : `<p style="font-size:1.2em">${C().letterDiff(it.word, ins[0].value, pre)}</p>`}<p class="muted">${it.fr}</p></div>`;
          foot.innerHTML = '<button class="btn" id="rvNext">Continuer</button>';
          A.$('#rvNext').onclick = next;
        }
        function next() { idx++; mod.render(body, foot); }
      }
    };
    A.runner.open(mod);
  }

  function start(opts = {}) {
    const due = A.srs.due();
    let gaps = due.filter(r => /^(fib|rac):/.test(r)).map(gapItemFromRef).filter(Boolean);
    // Mini-quiz mélangé : compléter avec des phrases déjà vues (jamais de notion non vue)
    const seenFib = Object.keys((A.S.seen.fib || {})).map(id => 'fib:' + id).filter(r => !due.includes(r));
    gaps = gaps.slice(0, 12).concat(A.pick(seenFib, Math.max(0, 4 - Math.min(gaps.length, 4))).map(gapItemFromRef).filter(Boolean));
    const faultsDue = due.some(r => r.startsWith('fault:'));
    const cogDue = due.some(r => /^(cog|ff):/.test(r));
    const finish = () => { if (opts.onDone) opts.onDone(); };
    const afterGaps = () => {
      A.runner.close(true);
      if (faultsDue) A.modules.faults.mixed({ onDone: cogDue ? () => setTimeout(() => A.modules.cognates.falseFriends({ n: 5, onDone: finish }), 50) : finish });
      else if (cogDue) A.modules.cognates.falseFriends({ n: 5, onDone: finish });
      else finish();
    };
    if (gaps.length) gapReview(A.shuffle(gaps), { onDone: afterGaps });
    else if (faultsDue || cogDue) afterGaps();
    else { A.toast('Rien à réviser : on fait un mélange de tes fautes'); A.modules.faults.mixed({ n: 6, onDone: finish }); }
  }

  A.modules.review = { start, counts, gapItemFromRef };
})();
