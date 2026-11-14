/* Outils de production : compteur de mots, détecteur de TES fautes, enregistrement micro,
   rapport de correction (sans IA) et évaluation par Claude (copie artifact). */
(function () {
  'use strict';
  const A = App, esc = A.esc;
  const words = t => (t.trim().match(/[A-Za-z][A-Za-z'’-]*/g) || []).length;

  /* ---------- détecteur des fautes d'Obed ---------- */
  const PROPER = 'january february march april may june july august september october november december monday tuesday wednesday thursday friday saturday sunday canada cyprus windsor congo kolwezi kinshasa lubumbashi rwanda kigali france paris africa europe asia america toronto ontario nicosia turkey nigeria germany english french spanish german turkish congolese canadian african european american christmas'.split(' ');
  const ADJ = 'different important male female long own historical expensive free big small good bad young old new high low large main major various cheap rich poor modern traditional beautiful difficult easy useful interesting other'.split(' ');
  const STOP = new Set('the a an to and of in on at is are was were that which who for with as by it its this these those be been or but not from than then can will would could should do does did have has had my his her our their your'.split(' '));
  const CALQUES = [[/\bresponsabilit(y|ies)\b/gi, 'responsibility'], [/\bcertitude\b/gi, 'certainty'], [/\bplanification\b/gi, 'planning'], [/\bacceptation\b/gi, 'acceptance'], [/\brelaxe\b/gi, 'relaxed'], [/\btransfert\b/gi, 'transfer'], [/\bvisite\b/gi, 'visit'], [/\bvehicle (a|the) message\b/gi, 'convey a message'], [/\bin the past time\b/gi, 'in the past'], [/\bdirectly at the same time\b/gi, 'at the same time'], [/\bas usually\b/gi, 'as usual'], [/\bactually\b/gi, 'currently ? (actually = en fait)'], [/\beventually\b/gi, 'possibly ? (eventually = finalement)'], [/\bpermit to\b/gi, 'allow (sb) to'], [/\bmore better\b/gi, 'better'], [/\bdepend of\b/gi, 'depend on'], [/\bexplain me\b/gi, 'explain to me'], [/\bdiscuss about\b/gi, 'discuss (sans about)'], [/\bpeoples\b/gi, 'people'], [/\binformations\b/gi, 'information'], [/\badvices\b/gi, 'advice'], [/\bequipments\b/gi, 'equipment'], [/\bresearches\b/gi, 'research'], [/\bknowledges\b/gi, 'knowledge']];
  const FILLER = /^\s*(in (the following|this) (part|essay|text|paragraph|answer)|i (am going to|will) (talk|speak|write|discuss)|this is a (very )?(interesting|good|difficult) (question|topic)|there are (many|a lot of) (things|people|places|technologies)|nowadays,?[^.]{0,60}(important|interesting) (topic|subject|question))/i;
  const NUMS = /\b(two|three|four|five|six|seven|eight|nine|ten|several|many|few|these|those|various)\s+([A-Za-z]+)\b/gi;
  const NOPL = new Set('of more other different new old young people children men women hundred thousand million times years weeks months days hours minutes students friends things ways reasons countries cities companies types kinds of the and in on are were have had main important big small good great full brilliant tall short long dark bright large huge tiny little young old other new key major thirty twenty forty fifty sixty seventy eighty ninety hundred more less most much such every each day per kind'.split(' '));

  function check(text) {
    const issues = [];
    const add = (cat, wrong, right, why) => issues.push({ cat, wrong, right, why });
    // adjectif + s
    const reAdj = new RegExp('\\b(' + ADJ.join('|') + ')s\\s+([a-z]+)', 'gi');
    let m;
    while ((m = reAdj.exec(text))) { if (!STOP.has(m[2].toLowerCase())) add('adj-s', m[0], m[1] + ' ' + m[2], 'L\'adjectif ne prend jamais de -s.'); }
    // majuscules
    const reLow = new RegExp('\\b(' + PROPER.join('|') + ')\\b', 'g');
    while ((m = reLow.exec(text))) { if (m[1] === 'may' || m[1] === 'march') continue; add('majuscule', m[1], m[1][0].toUpperCase() + m[1].slice(1), 'Mois, jours, villes, pays, nationalités et langues prennent une majuscule.'); }
    for (const x of text.matchAll(/(^|[\s(])i(?=[\s,.'’])/g)) add('majuscule', 'i', 'I', '« I » (je) toujours en majuscule.');
    // that why
    for (const x of text.matchAll(/\b(that|this) why\b/gi)) add('grammaire', x[0], x[1] + ' is why', '« That is why » : il manque le verbe.');
    // raise / rise
    for (const x of text.matchAll(/\b(prices?|temperatures?|numbers?|costs?|levels?|rates?|sea levels?|salaries|population)\s+(raised|raises|raise)\b/gi)) add('confusion', x[0], x[1] + ' ' + ({ raised: 'rose', raises: 'rises', raise: 'rise' })[x[2].toLowerCase()], 'Sans complément : rise / rose / risen.');
    for (const x of text.matchAll(/\b(rise|rises|rised)\s+(awareness|money|funds|taxes|prices|the price|salaries|my hand|your hand|questions?)\b/gi)) add('confusion', x[0], 'raise ' + x[2], 'Avec un complément : raise.');
    for (const x of text.matchAll(/\brised\b/gi)) add('confusion', x[0], 'rose / raised', '« rised » n\'existe pas.');
    // chance / change
    for (const x of text.matchAll(/\b(climate chance|big chance in my life|chance my (plans|life|mind)|second change|the change to (study|go|work|visit|travel|meet|learn))\b/gi)) add('confusion', x[0], x[0].replace(/chance/i, '§').replace(/change/i, 'chance').replace('§', 'change'), 'chance = occasion ; change = changement.');
    // calques
    CALQUES.forEach(([re, fix]) => { for (const x of text.matchAll(re)) add('calque', x[0], fix, 'Calque du français / mot à vérifier.'); });
    // pluriel après un nombre (à vérifier)
    while ((m = NUMS.exec(text))) { const w = m[2].toLowerCase(); if (/^[A-Z]/.test(m[2])) continue; if (!/s$/.test(w) && !NOPL.has(w) && w.length > 2 && !/(ing|ed|ly|ful|al|ous|ive|ic|able|ible|est)$/.test(w)) add('pluriel', m[0], m[1] + ' ' + m[2] + 's ?', 'Après un nombre ou « many / several », le nom est au pluriel.'); }
    // phrase d'annonce
    if (FILLER.test(text)) add('remplissage', text.match(FILLER)[0].trim(), 'Commence directement par ta réponse', 'Phrase d\'annonce : elle te coûte des mots sans apporter d\'idée.');
    // phrase qui ne commence pas par une majuscule
    if (/^\s*[a-z]/.test(text)) add('majuscule', text.trim().split(/\s/)[0], text.trim()[0].toUpperCase() + text.trim().split(/\s/)[0].slice(1), 'Majuscule au début de chaque phrase.');
    for (const x of text.matchAll(/[.!?]\s+([a-z])/g)) add('majuscule', '. ' + x[1], '. ' + x[1].toUpperCase(), 'Majuscule au début de chaque phrase.');
    return issues;
  }
  const CONNECT = ['however', 'in addition', 'moreover', 'what is more', 'for example', 'for instance', 'as a result', 'that is why', 'for this reason', 'therefore', 'on the other hand', 'although', 'overall', 'in my view', 'in my opinion', 'firstly', 'first', 'second', 'finally', 'because', 'since', 'whereas', 'while', 'all in all', 'this is mainly because', 'from my experience'];
  function connectors(text) { const t = text.toLowerCase(); return CONNECT.filter(c => new RegExp('\\b' + c + '\\b').test(t)); }

  /* ---------- rapport ---------- */
  function report(text, target, opts = {}) {
    const n = words(text), iss = check(text), con = connectors(text);
    const pct = Math.min(100, Math.round(n / target * 100));
    const sentences = (text.match(/[.!?](\s|$)/g) || []).length;
    let html = `<div class="card"><h3>📏 Volume : ${n} mots / objectif ${target}</h3><div class="bar"><i style="width:${pct}%;background:${pct >= 90 ? 'var(--green)' : pct >= 70 ? 'var(--orange)' : 'var(--red)'}"></i></div>
      ${opts.wpm ? `<p class="muted">Vitesse : ${opts.wpm} mots/min.</p>` : ''}
      <p>${pct >= 90 ? '✓ Bon volume.' : pct >= 70 ? 'Presque : vise ' + target + ' mots. Utilise une amorce de plus (For example, … / As a result, …).' : 'Trop court : c\'est ton point faible n°1. Développe chaque idée avec un exemple personnel.'}</p></div>
      <div class="card"><h3>🔗 Mots de liaison : ${con.length}</h3><p>${con.length ? con.map(c => `<span class="chip">${esc(c)}</span>`).join('') : '<span class="muted">Aucun : ajoute However, For example, As a result…</span>'}</p>
      <p class="muted">${sentences} phrase${sentences > 1 ? 's' : ''}.</p></div>
      <div class="card"><h3>🔎 Tes fautes habituelles : ${iss.length}</h3>${iss.length ? iss.map(i => `<p>${(A.CATS[i.cat] || ['', '•'])[1]} <s style="color:var(--red)">${esc(i.wrong)}</s> → <b style="color:var(--green)">${esc(i.right)}</b><br><small class="muted">${esc(i.why)}</small></p>`).join('') : '<p>✓ Aucune de tes fautes habituelles détectée. Relis quand même : le détecteur ne voit pas tout.</p>'}</div>`;
    if (opts.log !== false) iss.forEach(i => A.logError({ cat: i.cat, src: opts.src || 'ecrit', wrong: i.wrong, right: i.right, ctx: text.slice(0, 160), why: i.why }));
    return { html, n, iss, con };
  }

  /* ---------- évaluation par Claude (artifact) ---------- */
  async function aiEval(kind, prompt, answer, el) {
    if (!(A.ai && A.ai.sample)) return null;
    el.innerHTML = '<div class="card"><p class="muted">🤖 Claude évalue ta réponse…</p></div>';
    const crit = kind === 'oral' ? 'contenu, cohérence, fluidité, grammaire, lexique, prononciation (déduite de la transcription)' : 'contenu, cohérence du discours, grammaire, lexique';
    const q = `Tu évalues une réponse au Duolingo English Test (tâche : ${prompt.task}). Candidat : Obed, francophone, objectif 120/160.
Question : "${prompt.q}"
Réponse${kind === 'oral' ? ' (transcription automatique de l\'oral)' : ''} : """${answer}"""
Critères officiels : ${crit}. Réponds UNIQUEMENT en JSON valide :
{"note": nombre entre 10 et 160 par paliers de 5 (estimation), "bien": [2 points forts en français], "coute": [2 à 4 choses qui coûtent des points, en français], "amelioree": "la même réponse réécrite niveau C1, en gardant ses idées et ses exemples, même longueur environ", "erreurs": [{"faux": "...", "juste": "...", "type": "orthographe|ponctuation|mot-outil|grammaire|collocation|calque|majuscule|pluriel|adj-s|hors-sujet", "pourquoi": "en français, 1 phrase"}]}`;
    try {
      const r = await A.ai.sample.json(q, { modelTier: 'default' });
      (r.erreurs || []).slice(0, 12).forEach(e => A.logError({ cat: ({ 'mot-outil': 'mot-outil', 'hors-sujet': 'remplissage' })[e.type] || (A.CATS[e.type] ? e.type : 'grammaire'), src: 'ia-' + kind, wrong: e.faux, right: e.juste, ctx: answer.slice(0, 160), why: e.pourquoi }));
      el.innerHTML = `<div class="card"><h3>🤖 Estimation Claude : ${esc(r.note)} / 160</h3><p class="muted">Estimation d'entraînement, pas un score officiel.</p>
        <p><b>Ce qui est bien</b></p><ul>${(r.bien || []).map(x => `<li>${esc(x)}</li>`).join('')}</ul>
        <p><b>Ce qui coûte des points</b></p><ul>${(r.coute || []).map(x => `<li>${esc(x)}</li>`).join('')}</ul>
        ${(r.erreurs || []).length ? `<p><b>Erreurs</b> (ajoutées à ton carnet)</p>${r.erreurs.map(e => `<p><s style="color:var(--red)">${esc(e.faux)}</s> → <b style="color:var(--green)">${esc(e.juste)}</b><br><small class="muted">${esc(e.pourquoi)}</small></p>`).join('')}` : ''}</div>`;
      return r.amelioree || null;
    } catch (e) { el.innerHTML = '<div class="card muted">IA indisponible pour le moment : utilise le rapport et la réponse modèle.</div>'; return null; }
  }

  /* ---------- micro ---------- */
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const canRecord = () => !!(navigator.mediaDevices && window.MediaRecorder);
  const canTranscribe = () => !!(SR || (A.ai && A.ai.dict));
  // Démarre l'enregistrement. Retourne {stop(): Promise<{text, url, sec}>}
  async function record(onText) {
    let text = '', partial = '', t0 = Date.now(), rec, chunks = [], stream, recog, dict = A.ai && A.ai.dict;
    const emit = () => onText && onText((text + ' ' + partial).trim());
    if (dict) {
      dict.onPartial(({ text: p }) => { partial = p; emit(); });
      dict.onFinal(({ text: f }) => { text += ' ' + f; partial = ''; emit(); });
      dict.start().catch(() => { });
    } else if (SR) {
      recog = new SR(); recog.lang = 'en-US'; recog.continuous = true; recog.interimResults = true;
      recog.onresult = e => { partial = ''; for (let i = e.resultIndex; i < e.results.length; i++) { if (e.results[i].isFinal) text += ' ' + e.results[i][0].transcript; else partial += e.results[i][0].transcript; } emit(); };
      recog.onend = () => { if (recog && recog._on) try { recog.start(); } catch (e) { } };
      try { recog._on = true; recog.start(); } catch (e) { }
    }
    if (canRecord() && !dict) {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        rec = new MediaRecorder(stream); rec.ondataavailable = e => chunks.push(e.data); rec.start();
      } catch (e) { rec = null; }
    }
    return {
      async stop() {
        if (recog) { recog._on = false; try { recog.stop(); } catch (e) { } }
        if (dict) { try { await dict.stop(); } catch (e) { } }
        let url = null;
        if (rec && rec.state !== 'inactive') {
          await new Promise(r => { rec.onstop = r; rec.stop(); });
          url = URL.createObjectURL(new Blob(chunks, { type: rec.mimeType || 'audio/webm' }));
        }
        if (stream) stream.getTracks().forEach(t => t.stop());
        await new Promise(r => setTimeout(r, 300));
        return { text: (text + ' ' + partial).trim(), url, sec: Math.round((Date.now() - t0) / 1000) };
      }
    };
  }
  // Libère l'enregistrement : la voix ne quitte jamais le navigateur
  const urls = []; function keepUrl(u) { if (u) urls.push(u); if (urls.length > 3) URL.revokeObjectURL(urls.shift()); }
  function oralReport(res, target) {
    const n = words(res.text), wpm = res.sec ? Math.round(n / res.sec * 60) : 0;
    const fillers = (res.text.match(/\b(uh+|um+|euh+|er+|hmm+)\b/gi) || []).length;
    const iss = check(res.text).filter(i => i.cat !== 'majuscule');
    iss.forEach(i => A.logError({ cat: i.cat, src: 'oral', wrong: i.wrong, right: i.right, ctx: res.text.slice(0, 160), why: i.why }));
    return `${res.url ? `<div class="card"><p><b>🎧 Réécoute-toi</b> (l'enregistrement reste sur ton téléphone)</p><audio controls src="${res.url}" style="width:100%"></audio></div>` : ''}
      <div class="card"><h3>🗣️ ${n} mots en ${res.sec} s · ${wpm} mots/min</h3>
      <p>${res.sec < target * .7 ? '⚠️ Tu n\'as pas utilisé tout le temps. Au DET, parle jusqu\'au bout : ajoute un exemple, une raison, une conséquence.' : '✓ Tu as utilisé le temps.'}</p>
      <p>${wpm && wpm < 90 ? 'Débit lent : fais des phrases complètes sans t\'arrêter.' : wpm > 170 ? 'Débit rapide : ralentis et articule.' : wpm ? '✓ Débit naturel.' : ''}</p>
      ${fillers ? `<p>Hésitations détectées : ${fillers}. Remplace « euh » par une courte pause.</p>` : ''}</div>
      ${res.text ? `<div class="card"><p><b>Ce que le micro a compris</b></p><p class="muted">${esc(res.text)}</p>
        ${iss.length ? iss.map(i => `<p><s style="color:var(--red)">${esc(i.wrong)}</s> → <b style="color:var(--green)">${esc(i.right)}</b></p>`).join('') : ''}
        <p class="muted">Si des mots sont mal compris, c'est souvent un problème d'articulation : parle plus fort et plus lentement.</p></div>` : '<div class="card muted">Pas de transcription sur ce navigateur : réécoute-toi et compare avec la réponse modèle.</div>'}`;
  }

  A.modules.prod = { words, check, connectors, report, aiEval, record, canRecord, canTranscribe, keepUrl, oralReport };
})();
