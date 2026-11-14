# NOTES — DET Prep (organisation technique)

## Format du DET vérifié
- Sources consultées le 14–15 nov. 2026 : Duolingo *Questions Guide 2026*, *Scoring Guide for Teachers 2026*,
  billet officiel sur l'alignement CECR (blog.englishtest.duolingo.com), document CIOL « DET CEFR Alignment ».
- 13 types de questions (tableau dans `site/js/data/test.js`). Interactive Speaking (6–8 questions, 35 s, entendues une fois)
  a remplacé Listen, Then Speak le 1er juillet 2025. Des temps minimum de réponse ont été supprimés à cette date
  pour certains types : vérifier dans le Questions Guide avant de coder les chronos de l'oral.
- CECR (officiel) : C2 155–160 · C1 130–150 · B2 100–125 · B1 60–95 · A1–A2 10–55. Même grille pour les sous-scores.

## Hébergement
- Dépôt public `obed18-max/duolingo-prep`, GitHub Pages via `.github/workflows/pages.yml`
  (actions officielles configure-pages / upload-pages-artifact / deploy-pages), dossier publié : `site/`.
- Aucun secret, aucune clé, aucune donnée personnelle dans le dépôt. L'état d'Obed reste dans `localStorage` (clé `det_store`).
- Pas d'IA dans la version en ligne : tout fonctionne avec le contenu intégré. L'IA (sample/tts/dictation) n'existe que dans la copie artifact Claude.

## Organisation du code (`site/`)
- `index.html` : coquille (en-tête, 5 sections d'onglets `#p-*`, lecteur plein écran `#runner`, feuille modale, barre d'onglets).
- `js/core.js` : stockage, répétition espacée (`App.srs`, intervalles 1·3·7·15·30·60·120 j, échec → demain),
  carnet d'erreurs (`App.logError`, catégories dans `App.CATS`), points/série, lecteur + chrono, voix, sauvegarde gzip+base64 (`DETZ1:`).
- `js/today.js` : plan du jour en 5 étapes (Révision · Mes fautes · Fill in the Blanks · Read and Complete · Découverte en rotation).
- `js/pages.js` : onglets Parcours, Examen, Progrès, Plus (+ Nouveautés, Idée/Problème, Sauvegarde, Réglages, Mon test).
- `js/modules/ctest.js` : Fill in the Blanks + Read and Complete (C-test). Trous auto : 1re et dernière phrase intactes,
  un mot sur deux (≥ 2 lettres, pas de majuscule) perd sa 2e moitié (`floor(n/2)` lettres affichées), 18 trous max.
  Classement des erreurs : vrai mot mais mauvais sens → `sens` / `collocation` ; ≤ 2 lettres d'écart → `orthographe`, `pluriel`, `grammaire`.
- `js/modules/faults.js` : les 8 familles de fautes d'Obed (« trouve la faute ») + `App.modules.lessons`.
- `js/modules/cognates.js` : Read and Select (cognats vs faux mots, 5 s) et faux amis.
- `js/modules/review.js` : révision des éléments dus (mots ratés replacés dans leur phrase).
- `js/data/*.js` : contenus. Ajouter du contenu = ajouter des lignes ici (ids uniques, jamais réutilisés).

## Modules ajoutés (v1.2–1.3)
- `modules/prod.js` : compteur de mots, détecteur des fautes d'Obed (regex), micro (`record()` : dictée Claude, sinon webkitSpeechRecognition + MediaRecorder ; blob URLs libérées, rien n'est envoyé), évaluation IA (`sample.json`) en copie Claude.
- `modules/writing.js`, `speaking.js`, `listening.js`, `ireading.js` : les 13 types du DET (Interactive Speaking : chrono auto, enregistrement seulement après « Record Now »).
- `modules/learn.js` : grammaire (10 leçons, `data/grammar.js`), vocabulaire (`data/vocab.js`, lots de 8), dictionnaire au toucher (`.tw`).
- `modules/exam.js` : diagnostic, examen blanc, section lecture. Estimation = fonction du taux de réussite et du volume (indicateur, pas un score officiel).
- `modules/extras.js` : histoire à Windsor (3 épisodes), Memory, appel en direct (IA, copie Claude uniquement), carte des 24 unités (les unités réutilisent les modules génériques), badges.
- Scènes « photo » : SVG dessinés (`data/scenes.js`), pas de photos externes.
- Pas fait : cinéma (vidéos sous licence libre à vérifier une par une), voix neuronales pré-enregistrées, banque Read and Select de 600 mots, 1 500 mots de vocabulaire.

## Ajouter un module
1. Créer `js/modules/xxx.js` qui expose `App.modules.xxx`, et utilise `App.runner.open({render, dirty, onClose})`.
2. L'ajouter dans `index.html` et dans `FILES` de `sw.js`, puis **changer `CACHE`** dans `sw.js`.
3. Augmenter `VERSION` et ajouter une entrée à `CHANGELOG` dans `core.js`.
4. Tester : `cd site && python3 -m http.server`, Playwright 390×844, zéro `pageerror`.

## Décisions
- Priorité lecture (95, jamais monté) : Fill in the Blanks et Read and Complete construits en premier, tous les jours dans le plan.
- Étape « Relis la phrase » activée par défaut (désactivable ; désactivée en « conditions réelles »).
- Erreurs d'Obed relevées dans ses copies codées en dur dans `data/faults.js`.
