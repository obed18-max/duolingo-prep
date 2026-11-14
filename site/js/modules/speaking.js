/* Oral : Interactive Speaking (avec le piège « Record Now »), Speak About the Photo, Read Then Speak,
   Speaking Sample, shadowing, prononciation. L'enregistrement reste dans le navigateur. */
(function () {
  'use strict';
  const A = App, esc = A.esc, P = () => A.modules.prod, W = () => A.modules.writing;
  const AVATAR = `<svg viewBox="0 0 120 120" width="110" height="110" aria-hidden="true"><circle cx="60" cy="60" r="56" fill="#ffcc00"/><circle cx="60" cy="52" r="26" fill="#8d5524"/><path d="M34 48 Q60 14 86 48 Q80 30 60 28 Q40 30 34 48Z" fill="#2c1b0e"/><circle cx="51" cy="52" r="3.5" fill="#fff"/><circle cx="69" cy="52" r="3.5" fill="#fff"/><path d="M50 64 Q60 72 70 64" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M24 112 Q60 74 96 112" fill="#007aff"/></svg>`;

  // Écran d'enregistrement : bouton Record Now obligatoire. Résout {text,url,sec,missed}
  function recScreen(body, foot, o) {
    return new Promise(res => {
      body.innerHTML = `<div class="instr">${esc(o.instr)}</div>${o.promptHtml || ''}
        <div class="card" style="text-align:center"><div id="spState" style="font-weight:700">Appuie sur « Record Now » pour commencer</div>
        <div id="spLive" class="muted" style="min-height:24px;margin-top:6px"></div></div>
        ${!P().canRecord() && !P().canTranscribe() ? '<div class="fb warn">Micro indisponible sur ce navigateur : parle quand même à voix haute (le chrono tourne), puis compare avec les conseils.</div>' : ''}`;
      foot.innerHTML = `<button class="btn red" id="spRec">🎙️ Record Now</button>`;
      let ctl = null, recording = false, done = false, startedAt = 0;
      const finish = async missed => {
        if (done) return; done = true; A.runner.stopTimer();
        let r = { text: '', url: null, sec: 0 };
        if (ctl) r = await ctl.stop();
        if (recording) r.sec = Math.round((Date.now() - startedAt) / 1000);
        P().keepUrl(r.url);
        res(Object.assign(r, { missed: !recording && missed }));
      };
      A.$('#spRec').onclick = async () => {
        if (recording) return finish(false);
        recording = true; startedAt = Date.now();
        A.$('#spRec').textContent = '■ Terminer'; A.$('#spRec').classList.remove('red');
        A.$('#spState').innerHTML = '<span style="color:var(--red)">● Enregistrement…</span> parle jusqu\'à la fin du temps';
        ctl = await P().record(t => { if (o.showLive) A.$('#spLive').textContent = t; });
        if (o.recSec) A.runner.timer(o.recSec, () => finish(false));
      };
      // Interactive Speaking : le chrono démarre tout seul, pas l'enregistrement
      A.runner.timer(o.sec, () => finish(true));
    });
  }
  function waitPrep(body, foot, html, sec, label) {
    return new Promise(r => {
      body.innerHTML = `<div class="instr">${esc(label || 'Préparation')}</div>${html}`;
      foot.innerHTML = '<button class="btn sec" id="pr">Je suis prêt</button>';
      let d = false; const go = () => { if (d) return; d = true; A.runner.stopTimer(); r(); };
      A.$('#pr').onclick = go; A.runner.timer(sec, go);
    });
  }
  async function oralReview(body, foot, o) {
    A.runner.timer(null);
    body.innerHTML = `<div class="instr">Correction</div>${o.missed ? '<div class="fb ko"><h3>✕ Réponse non enregistrée = 0</h3><p>Au vrai test, sans clic sur « Record Now », ta réponse vaut zéro.</p></div>' : ''}
      ${P().oralReport(o, o.target)}<div id="oAi"></div>${o.tips ? `<details open><summary>💡 Ce qu'il fallait faire</summary>${o.tips}</details>` : ''}`;
    foot.innerHTML = '<button class="btn" id="oNext">Continuer</button>';
    A.record('speaking', o.missed ? 0 : Math.min(o.sec, o.target), o.target);
    if (!o.missed) A.addPoints(15);
    if (o.text && A.ai && A.ai.sample) await P().aiEval('oral', { task: o.task, q: o.q }, o.text, A.$('#oAi'));
    await new Promise(r => A.$('#oNext').onclick = r);
  }
  function run(steps, opts) { A.runner.open({ dirty: () => true, async render(b, f) { for (let i = 0; i < steps.length; i++) { A.runner.progress(i / steps.length); await steps[i](b, f); } A.runner.close(true); if (opts && opts.onDone) opts.onDone(); } }); }

  /* ---------- Interactive Speaking ---------- */
  function interactive(opts = {}) {
    const set = W().pickBy(ISPEAK, 'ispeak');
    const qs = set.topics.flatMap(([t, list]) => list.map((q, k) => ({ topic: t, q, first: k === 0 })));
    const answers = [];
    const steps = [
      (b, f) => new Promise(r => {
        b.innerHTML = `<div class="instr">Interactive Speaking</div><div class="card">Une conversation de ${qs.length} questions sur 2 sujets. <b>Chaque question n'est dite qu'une fois</b>, sans texte. Tu as 35 s par réponse.</div>
          <div class="fb warn"><h3>⚠️ Le piège n°1</h3><p>Le chrono de 35 s démarre tout seul, mais <b>l'enregistrement non</b>. Clique sur <b>Record Now</b> à chaque question, sinon ta réponse vaut 0.</p></div>
          <div class="card muted">Si tu ne comprends pas la question, dis quand même quelque chose sur le sujet.</div>`;
        f.innerHTML = '<button class="btn" id="go">Commencer</button>'; A.$('#go').onclick = r;
      })
    ];
    qs.forEach((item, k) => steps.push(async (b, f) => {
      // question adaptative (Claude) après la 1re question de chaque sujet
      let q = item.q;
      if (!item.first && A.ai && A.ai.sample && answers.length && answers[answers.length - 1].text) {
        try {
          const last = answers[answers.length - 1];
          const r = await A.ai.sample(`You are a friendly interviewer in the Duolingo English Test "Interactive Speaking" task. Topic: ${item.topic}. Your previous question: "${last.q}". The candidate answered: "${last.text}". Ask ONE natural follow-up question (max 22 words) that builds on the answer and invites an opinion or an example. Reply with the question only.`, { modelTier: 'quick' });
          if (r && r.text && r.text.length < 220) q = r.text.trim().replace(/^"|"$/g, '');
        } catch (e) { }
      }
      b.innerHTML = `<div class="instr">Question ${k + 1} / ${qs.length}</div><div style="text-align:center">${AVATAR}<p class="muted">🔊 Écoute…</p></div>`;
      f.innerHTML = '';
      await new Promise(r => A.speak(q, { onend: r, rate: 1 }));
      const res = await recScreen(b, f, { instr: 'Answer the question. You have 35 seconds.', promptHtml: `<div style="text-align:center">${AVATAR}</div>`, sec: 35 });
      if (res.missed) A.logError({ cat: 'remplissage', src: 'oral', wrong: 'Record Now oublié', right: 'Cliquer sur Record Now', ctx: q, why: 'Sans enregistrement, la réponse vaut 0.' });
      answers.push(Object.assign(res, { q }));
    }));
    steps.push(async (b, f) => {
      A.runner.timer(null);
      const all = answers.map(a => a.text).join(' ');
      const missed = answers.filter(a => a.missed).length;
      b.innerHTML = `<div class="instr">Bilan Interactive Speaking</div>${missed ? `<div class="fb ko"><h3>${missed} réponse(s) à 0 : Record Now oublié</h3></div>` : '<div class="fb ok"><h3>✓ Record Now cliqué à chaque question</h3></div>'}
        ${answers.map((a, i) => `<div class="card"><p><b>Q${i + 1}.</b> ${esc(a.q)} <button class="icbtn" style="display:inline-grid" data-sp="${i}" aria-label="Réécouter la question">▶</button></p>${a.url ? `<audio controls src="${a.url}" style="width:100%"></audio>` : ''}<p class="muted">${a.missed ? '— (non enregistré)' : esc(a.text || '(pas de transcription)')} · ${a.sec} s</p></div>`).join('')}
        <div id="isAi"></div><details><summary>💡 Bonne réponse en 35 s</summary><p>1 phrase de réponse directe → 1 raison → 1 exemple personnel → 1 phrase de conclusion. Utilise les 35 s, ne t'arrête pas après 10 s.</p></details>`;
      A.$$('[data-sp]', b).forEach(x => x.onclick = () => A.speak(answers[+x.dataset.sp].q));
      A.record('speaking', answers.filter(a => !a.missed && a.sec >= 20).length, answers.length);
      A.addPoints(answers.filter(a => !a.missed).length * 5);
      f.innerHTML = '<button class="btn" id="isEnd">Terminer</button>';
      if (all && A.ai && A.ai.sample) await P().aiEval('oral', { task: 'Interactive Speaking (6–8 questions, 35 s)', q: answers.map(a => a.q).join(' / ') }, answers.map((a, i) => `Q${i + 1}: ${a.text}`).join('\n'), A.$('#isAi'));
      await new Promise(r => A.$('#isEnd').onclick = r);
    });
    run(steps, opts);
  }

  const TIPS_PHOTO = '<p>Décris comme pour quelqu\'un qui ne voit pas la photo : 1) vue d\'ensemble (<i>This picture shows…</i>), 2) au premier plan / à gauche / à droite, 3) ce que font les gens, 4) une supposition (<i>They might be…</i>). Utilise tout le temps.</p>';
  function photo(opts = {}) {
    const sc = W().pickBy(SCENES, 'sphoto'); let r;
    run([
      b => waitPrep(b, A.$('#rFoot'), W().sceneSvg(sc) + `<p class="muted">Mots utiles : ${sc.words.map(esc).join(', ')}</p>`, 20, 'Regarde la photo (20 s)'),
      async (b, f) => { r = await recScreen(b, f, { instr: 'Speak about the photo for 90 seconds.', promptHtml: W().sceneSvg(sc), sec: 90, recSec: 90, showLive: false }); },
      (b, f) => oralReview(b, f, Object.assign(r, { target: 90, task: 'Speak About the Photo (90 s)', q: 'Describe the photo', tips: TIPS_PHOTO + `<p><b>Modèle :</b> ${esc(sc.model)}</p>` }))
    ], opts);
  }
  function readThenSpeak(opts = {}) {
    const it = W().pickBy(RTSPEAK, 'rtspeak'); let r;
    const html = `<div class="card"><b>${esc(it.q)}</b><ul>${it.b.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>`;
    run([
      b => waitPrep(b, A.$('#rFoot'), html + '<p class="muted">Prépare 1 idée par puce.</p>', 20),
      async (b, f) => { r = await recScreen(b, f, { instr: 'Speak about the topic for 90 seconds.', promptHtml: html, sec: 90, recSec: 90 }); },
      (b, f) => oralReview(b, f, Object.assign(r, { target: 90, task: 'Read, Then Speak (90 s)', q: it.q + ' ' + it.b.join(', '), tips: '<p>Traite chaque puce dans l\'ordre, avec un exemple concret. Passe à la suivante avec un mot de liaison : <i>As for…, The reason is…, What I learned…</i></p>' }))
    ], opts);
  }
  function sampleTalk(opts = {}) {
    const it = W().pickBy(SSAMPLE, 'ssample'); let r;
    const html = `<div class="card"><b>${esc(it.q)}</b></div>`;
    run([
      b => waitPrep(b, A.$('#rFoot'), html + '<div class="card muted">Plan : position → raison 1 + exemple → raison 2 + exemple → limite → conclusion.</div>', 30),
      async (b, f) => { r = await recScreen(b, f, { instr: 'Speak about the topic (up to 3 minutes).', promptHtml: html, sec: 180, recSec: 180 }); },
      (b, f) => oralReview(b, f, Object.assign(r, { target: 150, task: 'Speaking Sample (3 min)', q: it.q, tips: '<p>Parle aussi longtemps que possible en restant sur le sujet. Regarde la caméra, parle plus fort et plus lentement que d\'habitude. Si un mot manque, explique-le avec des mots simples.</p>' }))
    ], opts);
  }

  /* ---------- Shadowing ---------- */
  function lcsWords(a, b) {
    const x = a.toLowerCase().match(/[a-z']+/g) || [], y = b.toLowerCase().match(/[a-z']+/g) || [];
    const d = Array.from({ length: x.length + 1 }, () => new Array(y.length + 1).fill(0));
    for (let i = 1; i <= x.length; i++) for (let j = 1; j <= y.length; j++) d[i][j] = x[i - 1] === y[j - 1] ? d[i - 1][j - 1] + 1 : Math.max(d[i - 1][j], d[i][j - 1]);
    // mots manqués
    const hit = new Set(); let i = x.length, j = y.length;
    while (i && j) { if (x[i - 1] === y[j - 1]) { hit.add(i - 1); i--; j--; } else if (d[i - 1][j] >= d[i][j - 1]) i--; else j--; }
    return { score: x.length ? d[x.length][y.length] / x.length : 0, words: x, hit };
  }
  function shadowSentences() {
    const s = FIB.map(i => i.s.replace(/[{}]/g, ''));
    RAC.forEach(p => (p.p.match(/[^.!?]+[.!?]/g) || []).slice(0, 2).forEach(x => s.push(x.trim())));
    return s.filter(x => x.split(' ').length <= 16);
  }
  function shadowing(opts = {}) {
    const items = A.pick(shadowSentences(), opts.n || 6);
    let i = 0, tot = 0, slow = false, hide = false;
    A.runner.open({
      dirty: () => i > 0 && i < items.length,
      render(body, foot) {
        if (i >= items.length) { body.innerHTML = `<div style="text-align:center;margin-top:30px">${A.mascot(true)}<h2>Shadowing : ${Math.round(tot / items.length * 100)} %</h2><p class="muted">mots reconnus en moyenne</p></div>`; foot.innerHTML = '<button class="btn" id="x">Terminer</button>'; A.$('#x').onclick = () => { A.record('speaking', Math.round(tot), items.length); A.runner.close(true); if (opts.onDone) opts.onDone(); }; return; }
        const s = items[i]; A.runner.progress(i / items.length); A.runner.timer(null);
        body.innerHTML = `<div class="instr">Écoute, puis répète exactement</div>
          <div class="card" id="shTxt" style="font-size:1.15em;${hide ? 'filter:blur(6px)' : ''}">${esc(s)}</div>
          <div class="btns"><button class="btn sec" id="shPlay">▶ Écouter</button><button class="btn sec" id="shSlow">🐢 Lent</button></div>
          <div style="margin-top:8px"><button class="chip ${hide ? 'on' : ''}" id="shHide">Masquer le texte</button></div><div id="shFb"></div>`;
        foot.innerHTML = `<button class="btn red" id="shRec">🎙️ Répéter</button>`;
        A.$('#shPlay').onclick = () => A.speak(s); A.$('#shSlow').onclick = () => A.speak(s, { rate: .7 });
        A.$('#shHide').onclick = () => { hide = !hide; this.render(body, foot); };
        setTimeout(() => A.speak(s), 300);
        let ctl = null;
        A.$('#shRec').onclick = async () => {
          if (!ctl) { A.$('#shRec').textContent = '■ Stop'; ctl = await P().record(); return; }
          const r = await ctl.stop(); P().keepUrl(r.url);
          const m = lcsWords(s, r.text); tot += m.score;
          A.$('#shTxt').style.filter = '';
          A.$('#shTxt').innerHTML = m.words.map((w, k) => `<span style="color:${m.hit.has(k) ? 'var(--green)' : 'var(--red)'};font-weight:${m.hit.has(k) ? 400 : 700}">${esc(w)}</span>`).join(' ');
          A.$('#shFb').innerHTML = `<div class="fb ${m.score >= .8 ? 'ok' : 'warn'}"><h3>${r.text ? Math.round(m.score * 100) + ' % des mots reconnus' : 'Pas de transcription : réécoute-toi'}</h3>${r.url ? `<audio controls src="${r.url}" style="width:100%"></audio>` : ''}<p class="muted">En rouge : les mots à mieux articuler (souvent les petits mots : the, of, to, -s, -ed).</p></div>`;
          A.addPoints(Math.round(m.score * 10));
          foot.innerHTML = '<div class="btns"><button class="btn sec" id="shAgain">Recommencer</button><button class="btn" id="shNext">Suivante</button></div>';
          A.$('#shAgain').onclick = () => { tot -= m.score; this.render(body, foot); };
          A.$('#shNext').onclick = () => { i++; this.render(body, foot); };
        };
      }
    });
  }

  /* ---------- Prononciation ---------- */
  const PRON = [
    ['th', 'Langue entre les dents, souffle doux. Ne dis pas « s » ou « z ».', ['think', 'three', 'thank you', 'the weather', 'although', 'together', 'healthy', 'mathematics']],
    ['h', 'Le h est soufflé : comme une buée sur une vitre.', ['hospital', 'heat', 'hair', 'happy', 'behind', 'perhaps', 'whole', 'however']],
    ['i court / ee long', 'ship (court, relâché) ≠ sheep (long, souriant).', ['ship', 'sheep', 'live', 'leave', 'fit', 'feet', 'still', 'steal']],
    ['u court / oo long', 'full ≠ fool, look ≠ Luke.', ['full', 'fool', 'pull', 'pool', 'look', 'book', 'food', 'should']],
    ['r anglais', 'Le r ne roule pas et ne racle pas : la langue recule sans toucher le palais.', ['research', 'rural', 'library', 'very', 'world', 'reduce', 'around', 'risk']],
    ['accent de mot', 'Les majuscules montrent la syllabe forte.', ['PHOtograph', 'phoTOgraphy', 'ECOnomy', 'ecoNOMic', 'deVElop', 'enVIronment', 'TECHnology', 'COMfortable']],
    ['-ed final', 'worked = /t/, played = /d/, needed = /id/. Pas de « -é ».', ['worked', 'played', 'needed', 'finished', 'decided', 'improved', 'asked', 'reduced']]
  ];
  function pronunciation(opts = {}) {
    const set = opts.set != null ? PRON[opts.set] : A.pick(PRON, 1)[0];
    let i = 0, ok = 0;
    A.runner.open({
      dirty: () => i > 0 && i < set[2].length,
      render(body, foot) {
        if (i >= set[2].length) { body.innerHTML = `<div style="text-align:center;margin-top:30px">${A.mascot(true)}<h2>${ok}/${set[2].length}</h2><p>Son : ${esc(set[0])}</p></div>`; foot.innerHTML = '<button class="btn" id="x">Terminer</button>'; A.$('#x').onclick = () => { A.runner.close(true); if (opts.onDone) opts.onDone(); }; return; }
        const w = set[2][i]; A.runner.progress(i / set[2].length); A.runner.timer(null);
        body.innerHTML = `<div class="instr">Prononciation · ${esc(set[0])}</div><div class="card muted">${esc(set[1])}</div>
          <div class="card" style="text-align:center;font-size:2em;font-weight:700">${esc(w)}</div>
          <button class="btn sec" id="prPlay">▶ Écouter</button><div id="prFb"></div>`;
        foot.innerHTML = '<button class="btn red" id="prRec">🎙️ Dire le mot</button>';
        A.$('#prPlay').onclick = () => A.speak(w.toLowerCase(), { rate: .8 }); setTimeout(() => A.speak(w.toLowerCase(), { rate: .8 }), 250);
        let ctl = null;
        A.$('#prRec').onclick = async () => {
          if (!ctl) { A.$('#prRec').textContent = '■ Stop'; ctl = await P().record(); return; }
          const r = await ctl.stop(); P().keepUrl(r.url);
          const heard = r.text.toLowerCase(), target = w.toLowerCase();
          const good = heard && heard.includes(target.split(' ')[0]);
          if (good) { ok++; A.addPoints(5); }
          A.srs.grade('pron:' + target, !!good);
          A.$('#prFb').innerHTML = `<div class="fb ${good ? 'ok' : r.text ? 'ko' : 'warn'}"><h3>${!r.text ? 'Pas de transcription : compare toi-même' : good ? '✓ Compris : « ' + esc(r.text) + ' »' : '✕ Le micro a compris : « ' + esc(r.text) + ' »'}</h3>${r.url ? `<audio controls src="${r.url}" style="width:100%"></audio>` : ''}</div>`;
          foot.innerHTML = '<div class="btns"><button class="btn sec" id="a">Réessayer</button><button class="btn" id="n">Suivant</button></div>';
          A.$('#a').onclick = () => this.render(body, foot); A.$('#n').onclick = () => { i++; this.render(body, foot); };
        };
      }
    });
  }

  A.modules.speaking = { interactive, photo, readThenSpeak, sampleTalk, shadowing, pronunciation, recScreen, waitPrep, oralReview, PRON, lcsWords };
})();
