/* Extras : histoire à Windsor (épisodes, jeu de rôle), Memory, appel en direct avec Claude,
   carte du parcours en 24 unités, badges. */
(function () {
  'use strict';
  const A = App, esc = A.esc, M = A.modules;

  /* ---------- Histoire ---------- */
  const STORY = [
    { t: 'Episode 1 · Arrival in Windsor', intro: 'Obed arrive à Windsor pour son master. À l\'accueil des étudiants internationaux, il rencontre Sarah.', lines: [
      ['Sarah', 'Hi, welcome to the International Student Centre! How can I help you?'],
      ['Obed', 'Hi! I just arrived from Cyprus. I need to pick up my student card.'],
      ['Sarah', 'Of course. Can I see your passport and your admission letter?'],
      ['Obed', 'Here they are. I am starting a master\'s degree in industrial engineering.'],
      ['Sarah', 'Great program! Have you found accommodation yet?'],
      ['Obed', 'Not yet. I am staying in a hotel for a few days while I look for a room.'],
      ['Sarah', 'You should check the housing board on our website. Rooms near campus go quickly.'],
      ['Obed', 'Thanks for the advice. Is there a bus that goes downtown?'],
      ['Sarah', 'Yes, the number two runs every fifteen minutes. Your student card works as a bus pass.'],
      ['Obed', 'That is very convenient. Thank you so much for your help!']] },
    { t: 'Episode 2 · The first lab', intro: 'Premier jour au laboratoire de qualité. Le professeur Chen présente le projet.', lines: [
      ['Prof. Chen', 'Good morning, everyone. This term, you will work with a local car parts supplier.'],
      ['Obed', 'Excuse me, professor. What kind of problem will we work on?'],
      ['Prof. Chen', 'Their defect rate has increased by four percent since spring. They want to know why.'],
      ['Obed', 'So we will need to collect data from the production line.'],
      ['Prof. Chen', 'Exactly. Each team will map the process and identify the main causes of defects.'],
      ['Obed', 'Could we use a Pareto chart to rank the causes?'],
      ['Prof. Chen', 'Good idea. That is usually the first step. Then you will test your hypotheses.'],
      ['Obed', 'When do we have to submit the first report?'],
      ['Prof. Chen', 'In three weeks. And remember: every claim must be supported by evidence.']] },
    { t: 'Episode 3 · Weekend plans', intro: 'Le vendredi, Jonas, un camarade, propose une sortie.', lines: [
      ['Jonas', 'Hey Obed, a few of us are going to Point Pelee on Saturday. Do you want to come?'],
      ['Obed', 'I would love to! What is Point Pelee?'],
      ['Jonas', 'It\'s a national park on Lake Erie. It is the southernmost point of mainland Canada.'],
      ['Obed', 'Sounds amazing. How are we getting there?'],
      ['Jonas', 'Maya has a car. We\'ll leave at eight, so we can avoid the traffic.'],
      ['Obed', 'Perfect. Should I bring anything?'],
      ['Jonas', 'Just some food and warm clothes. It can be windy by the lake.'],
      ['Obed', 'Great, I\'ll make some sandwiches for everyone. See you on Saturday!']] }
  ];
  function story(opts = {}) {
    const k = opts.ep != null ? opts.ep : Math.min((A.S.seen.story || 0), STORY.length - 1);
    const ep = STORY[k]; let hide = false;
    const other = (() => { const vs = A.voices(); const o = vs.find(v => /en-(GB|AU)/i.test(v.lang)); return o ? o.name : ''; })();
    const sayLine = (l, end) => A.speak(l[1], { voice: l[0] === 'Obed' ? '' : other, claudeVoice: l[0] === 'Obed' ? 'rounded' : 'airy', onend: end });
    A.runner.open({
      dirty: () => false,
      render(body, foot) {
        A.runner.timer(null); A.runner.progress(0);
        body.innerHTML = `<div class="instr">${esc(ep.t)}</div><div class="card muted">${esc(ep.intro)} Touche un mot pour sa traduction. 🎙️ = tu joues Obed.</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="chip" id="stAll">▶ Écouter l'épisode</button><button class="chip ${hide ? 'on' : ''}" id="stHide">Masquer le texte (écoute seule)</button></div>
          ${ep.lines.map((l, i) => `<div class="card" style="${l[0] === 'Obed' ? 'border-left:4px solid var(--accent)' : ''}"><small class="muted"><b>${esc(l[0])}</b></small>
            <div style="display:flex;gap:8px;align-items:flex-start"><p style="flex:1;margin:4px 0;${hide ? 'filter:blur(6px)' : ''}">${M.learn.tappable(l[1])}</p>
            <button class="icbtn" data-p="${i}" aria-label="Écouter" style="background:var(--fill)">▶</button>${l[0] === 'Obed' ? `<button class="icbtn" data-r="${i}" aria-label="Dire la réplique" style="background:var(--fill)">🎙️</button>` : ''}</div><div id="sr${i}"></div></div>`).join('')}`;
        foot.innerHTML = `<button class="btn" id="stEnd">${k < STORY.length - 1 ? 'Épisode terminé' : 'Terminer'}</button>`;
        A.$('#stHide').onclick = () => { hide = !hide; this.render(body, foot); };
        A.$('#stAll').onclick = () => { let i = 0; const nx = () => { if (i < ep.lines.length) sayLine(ep.lines[i++], nx); }; nx(); };
        A.$$('[data-p]', body).forEach(b => b.onclick = () => sayLine(ep.lines[+b.dataset.p]));
        A.$$('[data-r]', body).forEach(b => {
          let ctl = null;
          b.onclick = async () => {
            const i = +b.dataset.r;
            if (!ctl) { b.textContent = '■'; ctl = await M.prod.record(); return; }
            const r = await ctl.stop(); ctl = null; b.textContent = '🎙️'; M.prod.keepUrl(r.url);
            const m = M.speaking.lcsWords(ep.lines[i][1], r.text);
            A.$('#sr' + i).innerHTML = `<div class="fb ${m.score >= .8 ? 'ok' : 'warn'}"><small>${r.text ? Math.round(m.score * 100) + ' % des mots reconnus' : 'Pas de transcription'}</small>${r.url ? `<audio controls src="${r.url}" style="width:100%"></audio>` : ''}</div>`;
            A.addPoints(Math.round(m.score * 5));
          };
        });
        A.$('#stEnd').onclick = () => { A.S.seen.story = Math.max(A.S.seen.story || 0, k + 1); A.save(); A.runner.close(true); if (opts.onDone) opts.onDone(); };
      }
    });
  }

  /* ---------- Memory ---------- */
  function memory(opts = {}) {
    const learned = VOCAB.slice(0, Math.max(8, (A.S.seen.vocabLot || 0) * 8));
    const pairs = A.pick(learned, 6);
    const cards = A.shuffle(pairs.flatMap((p, i) => [{ i, t: p.w, en: true }, { i, t: p.fr }]));
    let open = [], found = 0, tries = 0;
    A.runner.open({
      dirty: () => false,
      render(body, foot) {
        A.runner.timer(null);
        body.innerHTML = `<div class="instr">Memory · anglais ↔ français</div><p class="muted">Retrouve les 6 paires.</p>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">${cards.map((c, k) => `<button class="card mem" data-k="${k}" style="margin:0;min-height:76px;font-weight:600;font-size:.9em">?</button>`).join('')}</div><p id="memS" class="muted"></p>`;
        foot.innerHTML = '<button class="btn sec" id="memEnd">Terminer</button>';
        A.$('#memEnd').onclick = () => { A.runner.close(true); if (opts.onDone) opts.onDone(); };
        A.$$('.mem', body).forEach(b => b.onclick = () => {
          const k = +b.dataset.k, c = cards[k];
          if (c.done || open.includes(k) || open.length === 2) return;
          b.textContent = c.t; b.style.background = 'color-mix(in srgb,var(--accent) 15%,var(--card))'; open.push(k);
          if (c.en) A.speak(c.t);
          if (open.length === 2) {
            tries++;
            const [x, y] = open.map(j => cards[j]);
            setTimeout(() => {
              if (x.i === y.i) { x.done = y.done = true; found++; A.beep(true); A.addPoints(3); open.forEach(j => A.$(`.mem[data-k="${j}"]`).style.background = 'color-mix(in srgb,var(--green) 25%,var(--card))'); }
              else open.forEach(j => { const e = A.$(`.mem[data-k="${j}"]`); e.textContent = '?'; e.style.background = ''; });
              open = [];
              A.$('#memS').textContent = `${found}/6 paires · ${tries} essais`;
              if (found === 6) { A.confetti(); foot.innerHTML = '<button class="btn" id="memEnd2">Bravo ! Terminer</button>'; A.$('#memEnd2').onclick = () => { A.runner.close(true); if (opts.onDone) opts.onDone(); }; }
            }, x.i === y.i ? 300 : 900);
          }
        });
      }
    });
  }

  /* ---------- Appel en direct (IA de Claude) ---------- */
  const CALL = {
    prof: ['👨‍🏫 Le prof', 'You are an English teacher for Obed (French speaker, B2, target 120 on the Duolingo English Test). Keep each reply under 45 words. After each of his messages: first give a short correction in French of his mistakes (if any), starting with "Correction :", then continue the conversation in English with one question.'],
    libre: ['💬 Discussion libre', 'You are a friendly Canadian student chatting with Obed. Keep replies under 35 words, natural spoken English, and always end with a question. Do not correct him.'],
    role: ['🎭 Jeu de rôle', 'Role-play: you are a housing officer at the University of Windsor and Obed is a new international student looking for a room. Stay in character, replies under 35 words, end with a question.'],
    det: ['🎓 Oral du DET', 'You are the Duolingo English Test "Interactive Speaking" interviewer. Ask one question at a time (max 22 words) about everyday topics, adapting to his previous answer. After 6 questions, give in French a short evaluation (fluency, vocabulary, grammar) and an estimated level.']
  };
  function call(opts = {}) {
    if (!(A.ai && A.ai.sample)) { A.sheet(`<div class="shd"><h2>📞 Appel en direct</h2><button class="btn sec" style="width:auto;min-height:36px" onclick="App.closeSheet()">Fermer</button></div><p>L'appel en direct utilise l'IA de Claude : ouvre la <b>copie de l'app dans Claude</b> pour l'utiliser. Ici, entraîne-toi avec l'Interactive Speaking, qui fonctionne sans IA.</p>`); return; }
    let mode = null; const msgs = [];
    A.runner.open({
      dirty: () => msgs.length > 0,
      render(body, foot) {
        A.runner.timer(null);
        if (!mode) {
          body.innerHTML = `<div class="instr">📞 Type d'appel</div>${Object.entries(CALL).map(([k, v]) => `<button class="choice" data-m="${k}"><b>${v[0]}</b></button>`).join('')}`;
          foot.innerHTML = '';
          A.$$('[data-m]', body).forEach(b => b.onclick = async () => { mode = b.dataset.m; this.render(body, foot); await reply('(The call starts. Greet Obed and ask your first question.)'); });
          return;
        }
        body.innerHTML = `<div class="instr">${CALL[mode][0]}</div><div id="callLog"></div><div id="callLive" class="muted"></div>`;
        foot.innerHTML = `<div class="btns"><input type="text" id="callTx" placeholder="Écris ou parle…" autocomplete="off" style="flex:2"><button class="btn red" id="callMic" style="flex:0 0 56px">🎙️</button><button class="btn" id="callSend" style="flex:0 0 64px">➤</button></div>`;
        draw();
        const send = () => { const v = A.$('#callTx').value.trim(); if (!v) return; A.$('#callTx').value = ''; reply(v); };
        A.$('#callSend').onclick = send; A.$('#callTx').onkeydown = e => { if (e.key === 'Enter') send(); };
        let ctl = null;
        A.$('#callMic').onclick = async () => {
          if (!ctl) { A.$('#callMic').textContent = '■'; ctl = await M.prod.record(t => A.$('#callLive').textContent = t); return; }
          const r = await ctl.stop(); ctl = null; A.$('#callMic').textContent = '🎙️'; A.$('#callLive').textContent = ''; M.prod.keepUrl(r.url);
          if (r.text) reply(r.text); else A.toast('Je n\'ai rien entendu');
        };
      }
    });
    function draw() { const el = A.$('#callLog'); if (!el) return; el.innerHTML = msgs.filter(m => !m.hidden).map(m => `<div class="card" style="${m.role === 'user' ? 'margin-left:40px;background:color-mix(in srgb,var(--accent) 12%,var(--card))' : 'margin-right:20px'}">${esc(m.content)}${m.role === 'assistant' ? ` <button class="icbtn" style="display:inline-grid" onclick="App.speak(this.parentElement.firstChild.textContent)">▶</button>` : ''}</div>`).join(''); A.$('#rBody').scrollTop = 1e6; }
    async function reply(userText) {
      msgs.push({ role: 'user', content: userText, hidden: userText.startsWith('(The call') }); draw();
      try {
        const convo = [{ role: 'user', content: CALL[mode][1] + '\n\n' + msgs[0].content }].concat(msgs.slice(1).map(m => ({ role: m.role, content: m.content })));
        const r = await A.ai.sample(convo, { modelTier: 'quick', cache: false });
        msgs.push({ role: 'assistant', content: r.text.trim() }); draw();
        const toSay = r.text.replace(/Correction\s*:[^\n]*\n?/i, '');
        A.speak(toSay);
      } catch (e) { msgs.push({ role: 'assistant', content: '(IA indisponible pour le moment)' }); draw(); }
    }
  }

  /* ---------- Parcours en 24 unités ---------- */
  const THEMES = ['Études et université', 'Sciences et recherche', 'Économie', 'Ingénierie et technologie', 'Environnement', 'Santé', 'Éducation', 'Société et médias', 'Droit et éthique', 'Ville et transports', 'Énergie', 'Travail et carrière'];
  const STEPS = [['Vocabulaire', '📚', d => M.learn.vocab({ onDone: d })], ['Grammaire', '📐', d => M.learn.grammar({ onDone: d })], ['Exercices', '✍️', d => M.ctest.fib({ n: 6, onDone: d })], ['Lecture', '📖', d => M.ireading.run({ onDone: d })], ['Écoute', '🎧', d => M.listening.listenType({ onDone: d })], ['Écriture', '📝', d => M.writing.interactive({ onDone: d })], ['Oral', '🎙️', d => M.speaking.readThenSpeak({ onDone: d })]];
  const UNITS = Array.from({ length: 24 }, (_, i) => ({ n: i + 1, theme: THEMES[i % THEMES.length], lvl: i < 8 ? 'B2' : i < 16 ? 'B2+ / C1' : 'C1 / C2' }));
  function unitsPage(el) {
    const U = A.S.units || (A.S.units = {});
    const doneU = u => STEPS.every((_, s) => (U[u] || {})[s]);
    let open = UNITS.findIndex((u, i) => !doneU(i)); if (open < 0) open = 23;
    el.innerHTML = UNITS.map((u, i) => {
      const locked = i > open, st = U[i] || {}, cnt = STEPS.filter((_, s) => st[s]).length;
      const due = STEPS.some((_, s) => st[s] && A.srs.has('unit:' + i + ':' + s) && A.S.srs['unit:' + i + ':' + s].due <= A.today());
      return `<div class="card" style="opacity:${locked ? .45 : 1};margin-left:${[0, 40, 80, 40][i % 4]}px">
        <b>${locked ? '🔒' : doneU(i) ? '✅' : '⭐'} Unité ${u.n} · ${esc(u.theme)}</b> <small class="muted">${u.lvl} · ${cnt}/7${due ? ' · 🔁 rappel' : ''}</small>
        ${!locked ? `<div style="margin-top:6px">${STEPS.map((s, k) => `<button class="chip ${st[k] ? 'on' : ''}" data-u="${i}" data-s="${k}">${s[1]} ${s[0]}</button>`).join('')}</div>` : ''}</div>`;
    }).join('');
    A.$$('[data-u]', el).forEach(b => b.onclick = () => {
      const u = +b.dataset.u, s = +b.dataset.s;
      STEPS[s][2](() => { const U2 = A.S.units; (U2[u] || (U2[u] = {}))[s] = A.today(); A.srs.grade('unit:' + u + ':' + s, true); A.addPoints(10); A.save(); A.refresh(); });
    });
  }

  /* ---------- Badges ---------- */
  function badges() {
    const S = A.S, h = s => S.hist.filter(x => x.s === s).reduce((a, x) => a + x.n, 0);
    const list = [
      ['🔥', 'Série de 3 jours', S.streak.n >= 3], ['🏆', 'Série de 7 jours', S.streak.n >= 7],
      ['✍️', '100 réponses de lecture', h('reading') >= 100], ['📖', '500 réponses de lecture', h('reading') >= 500],
      ['📝', '5 écrits longs', (S.seen.wsample ? Object.values(S.seen.wsample).reduce((a, b) => a + b, 0) : 0) + (S.seen.iwrite ? Object.values(S.seen.iwrite).reduce((a, b) => a + b, 0) : 0) >= 5],
      ['🎙️', 'Interactive Speaking sans oubli', (S.seen.ispeak && !S.errors.some(e => e.wrong === 'Record Now oublié'))],
      ['🎧', '50 phrases écoutées', h('listening') >= 50], ['🎓', 'Examen blanc terminé', (S.mocks || []).some(m => m.kind === 'mock')],
      ['📚', '5 lots de vocabulaire', (S.seen.vocabLot || 0) >= 5], ['📐', '5 leçons de grammaire', Object.keys(S.seen.gram || {}).length >= 5],
      ['⭐', '1 000 points', S.points >= 1000], ['🗺️', 'Première unité terminée', Object.values(S.units || {}).some(u => Object.keys(u).length >= 7)]
    ];
    return `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px">${list.map(b => `<div class="kpi" style="opacity:${b[2] ? 1 : .35}"><b>${b[0]}</b><small style="font-size:.68em">${esc(b[1])}</small></div>`).join('')}</div>`;
  }

  A.modules.extras = { story, memory, call, unitsPage, badges, STORY };
})();
