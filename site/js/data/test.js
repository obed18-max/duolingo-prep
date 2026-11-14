/* Infos officielles du DET (Questions Guide 2026, Scoring Guide 2026 ; vérifié le 14-15 nov. 2026, voir NOTES.md). */
window.DET = {
  types: [
    ['Read and Select', 'Vrai mot anglais ? oui/non', '5 s / mot', '15–18', 'Lecture'],
    ['Fill in the Blanks', 'Finir un mot dans une phrase', '20 s', '6–9', 'Lecture'],
    ['Read and Complete', 'Paragraphe, plusieurs mots à finir', '3 min', '3–6', 'Lecture'],
    ['Listen and Type', 'Écouter une phrase et la taper', '1 min', '6–9', 'Écoute'],
    ['Interactive Reading', 'Texte + 5 tâches', '7–8 min', '2–3', 'Lecture'],
    ['Interactive Listening', 'Scène + 3 tâches (dont un résumé en 75 s)', '6 min 30', '2–3', 'Écoute'],
    ['Write About the Photo', 'Décrire une photo par écrit', '1 min', '3', 'Écriture'],
    ['Interactive Writing', '2 questions sur un sujet', '5 + 3 min', '1', 'Écriture'],
    ['Speak About the Photo', 'Décrire une photo à l\'oral', '90 s', '1', 'Oral'],
    ['Read, Then Speak', 'Question écrite, réponse orale', '90 s', '1', 'Oral'],
    ['Interactive Speaking', 'Conversation, 6–8 questions entendues 1 fois', '35 s / réponse', '6–8', 'Oral'],
    ['Writing Sample', 'Essai d\'opinion/expérience', '5 min', '1', 'Écriture'],
    ['Speaking Sample', 'Réponse orale filmée', '3 min', '1', 'Oral']
  ],
  cefr: [['C2', '155–160'], ['C1', '130–150'], ['B2', '100–125'], ['B1', '60–95'], ['A1–A2', '10–55']],
  tips: {
    fib: ['Utilise le reste de la phrase : synonymes, contraires, expressions courantes.', 'Ta règle perso : <b>relis la phrase entière</b> avec ton mot avant de passer. Le mot doit avoir du sens, pas seulement les bonnes lettres.', 'Pense collocation : <i>solve</i> a problem, <i>face</i> a challenge, <i>take</i> place.', 'Après une préposition (at, of, by…), le verbe prend -ing.'],
    rac: ['Lis tout le paragraphe d\'abord.', 'Commence par les mots les plus faciles.', 'Appuie-toi sur le sens et la grammaire : singulier/pluriel, temps du verbe, nom ou adjectif ?', 'À la fin : relis chaque phrase complète. Un mot qui « colle » aux lettres mais pas au sens = point perdu.'],
    rs: ['Coche « oui » si tu connais ou as déjà vu le mot ; le prononcer dans ta tête aide.', 'Si le mot ressemble à un mot français qui existe (peninsula, reservoir), il est presque toujours vrai.', 'Méfie-toi des terminaisons bizarres collées à une vraie racine (environmential, reservance).', 'Ne sur-étudie pas cette tâche : le vocabulaire utile sert aussi à l\'écrit et à l\'oral.']
  },
  traps: [
    ['Oublier « Record Now » à l\'Interactive Speaking', 'Le chrono de 35 s part seul, l\'enregistrement non. Sans clic = 0.'],
    ['Se presser pour avoir l\'air fluide', 'Utilise tout le temps. Exception : en Interactive Reading/Listening, le chrono est partagé.'],
    ['Ne pas relire son écrit', 'Fautes de frappe, mots oubliés, phrases incomplètes coûtent le plus.'],
    ['Hors sujet à l\'oral', 'Un point principal, puis des idées liées.'],
    ['Mal articuler, parler trop bas', 'Parle plus fort et plus lentement que d\'habitude.'],
    ['Mot rare mal employé', 'Un mot simple correct vaut mieux qu\'un mot savant faux.'],
    ['Réponse non anglaise, charabia ou silence', 'Détecté et pénalisé.'],
    ['Trop étudier les listes du Read and Select', 'Le sous-score le plus bas est presque toujours la production.'],
    ['Se reprendre avec un synonyme en parlant', 'Finis ta phrase proprement plutôt que de t\'arrêter.']
  ],
  rules: [
    'Ordinateur Windows 10+ ou macOS 10.15+, avec l\'application de bureau Duolingo English Test (pas de téléphone, tablette, Chromebook, Linux ni navigateur). Ton app d\'entraînement sur iPhone ne remplace pas cet environnement.',
    'Webcam, micro et haut-parleurs sur l\'ordinateur, plus ton téléphone chargé comme 2e caméra (QR code, app mobile Duolingo, scan de la pièce et des oreilles). Pose-le de façon stable, ne le touche pas, mode « Ne pas déranger ».',
    'Pièce calme, bien éclairée, seul. Sur le bureau : ordinateur, téléphone, pièce d\'identité, rien d\'autre.',
    'Pièce d\'identité officielle valide (passeport), nom identique à l\'inscription.',
    'Ferme TOUS les autres programmes, y compris en arrière-plan (navigateurs, WhatsApp, Discord, TeamViewer…). C\'est la règle la plus souvent enfreinte. Pas de machine virtuelle, pas de correcteur ni Grammarly, pas de saisie non latine.',
    'Yeux sur l\'écran (surtout à l\'oral). Regarder le clavier en tapant est permis. Pas de notes, pas de stylo.',
    'Résultats en général sous 2 jours. Une règle enfreinte = résultat non certifié possible, sans remboursement.'
  ],
  checklist: [
    ['credit', 'Crédit DET acheté (les 2 précédents sont utilisés)'],
    ['pc', 'Ordinateur Windows/Mac prêt, app de bureau DET installée et à jour'],
    ['systest', 'Test système officiel fait sur cet ordinateur'],
    ['phone', 'Téléphone chargé, app Duolingo installée, support stable, « Ne pas déranger »'],
    ['id', 'Passeport valide à portée de main (nom identique à l\'inscription)'],
    ['room', 'Pièce calme, éclairée, porte fermée, personne autour'],
    ['desk', 'Bureau vide : seulement ordinateur, téléphone, passeport'],
    ['apps', 'Tous les programmes fermés (vérifier la barre système / gestionnaire des tâches)'],
    ['spell', 'Correcteur automatique et Grammarly désactivés, clavier en anglais/français latin'],
    ['practice', 'Test d\'entraînement officiel gratuit passé au moins une fois'],
    ['sleep', 'Bonne nuit de sommeil la veille'],
    ['deposit', 'Rappel : dépôt Windsor (4 000 CAD) avant le 1er décembre']
  ],
  practiceUrl: 'https://englishtest.duolingo.com/'
};
