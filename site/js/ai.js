/* Capacités Claude (seulement dans la copie artifact) : voix (tts), IA (sample), sauvegarde (db + user).
   Sur GitHub Pages, window.claude n'existe pas : l'app tourne à 100 % avec le contenu intégré. */
(function () {
  'use strict';
  const A = App;
  A.inClaude = !!(window.claude && window.claude.use);
  A.ai = { sample: null, tts: null, ready: false };
  if (!A.inClaude) return;

  const use = n => window.claude.use(n).catch(() => null);

  // Voix Claude (pas sur Safari / apps mobiles : retombe sur la voix du navigateur)
  use('tts').then(t => {
    if (!t) return;
    A.ai.tts = (text, opts = {}, end) => {
      const o = { language: 'en', rate: Math.max(.7, Math.min(1.5, opts.rate || A.S.settings.rate)) };
      if (opts.claudeVoice) o.voice = opts.claudeVoice;
      t.speak(text, o).then(() => end && end()).catch(e => {
        if (e && e.code === 'not_granted') A.ai.tts = null;
        // repli : voix du navigateur
        const keep = A.ai.tts; A.ai.tts = null; A.speak(text, Object.assign({}, opts, { onend: end })); A.ai.tts = keep;
      });
      return true;
    };
  });

  // Micro (dictée Claude)
  use('dictation').then(d => { if (d) A.ai.dict = d; });

  // IA : explications personnalisées des erreurs
  use('sample').then(s => {
    if (!s) return;
    A.ai.sample = s; A.ai.ready = true;
    A.ai.explain = async (ctx, wrong, right, el) => {
      el.innerHTML = '<p class="muted">🤖 Claude réfléchit…</p>';
      const prompt = `Tu es un coach d'anglais pour Obed, francophone (niveau B2, objectif 120 au Duolingo English Test).
Phrase : "${ctx}"
Mot attendu : "${right}". Obed a écrit : "${wrong}".
En français, en 3 phrases courtes maximum : (1) pourquoi "${right}" est le bon mot ici (sens, collocation ou grammaire, avec le terme de grammaire français), (2) pourquoi "${wrong}" ne va pas, (3) une astuce pour s'en souvenir. Puis une autre phrase d'exemple en anglais avec "${right}". Pas de titre, pas de liste.`;
      try {
        const r = await s(prompt, { modelTier: 'quick', onText: ({ text }) => { el.innerHTML = '<p>🤖 ' + A.esc(text) + '</p>'; } });
        el.innerHTML = '<p>🤖 ' + A.esc(r.text) + '</p>';
      } catch (e) {
        el.innerHTML = '<p class="muted">IA indisponible pour le moment' + (e && e.code === 'rate_limited' ? ' (trop de demandes, réessaie plus tard)' : '') + '.</p>';
        if (e && e.code === 'not_granted') A.ai.sample = null;
      }
    };
  });

  // Sauvegarde dans Claude (privée, par personne) en plus du localStorage
  Promise.all([use('db'), use('user')]).then(async ([db, user]) => {
    if (!db || !user) return;
    try {
      const id = await user.id(); if (!id) return;
      const ref = db.collection('data/users/' + id).doc('state');
      const snap = await ref.get();
      const remote = snap && (snap.data ? snap.data() : snap);
      const localSize = Object.keys(A.S.srs).length + A.S.errors.length;
      if (remote && remote.json && (remote.n || 0) > localSize) {
        localStorage.setItem('det_store', remote.json); location.reload(); return;
      }
      let last = '', t;
      A.sync = S => {
        clearTimeout(t);
        t = setTimeout(() => {
          const json = JSON.stringify(S); if (json === last) return; last = json;
          ref.set({ json, n: Object.keys(S.srs).length + S.errors.length, at: Date.now() }).catch(() => { });
        }, 3000);
      };
      A.sync(A.S);
    } catch (e) { /* pas de sauvegarde distante : le localStorage suffit */ }
  });
})();
