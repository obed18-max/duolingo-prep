/* Mes fautes — les 8 familles relevées dans les copies d'Obed (6 semaines de corrections).
   Exercice « trouve la faute » : bad = le mot fautif (null = phrase correcte), fix = la bonne forme. */
window.FAULTS = [
  {
    id: 'adj-s', cat: 'adj-s', icon: '🅰️', title: 'Les adjectifs ne prennent jamais de -s', seen: '4 fois dans tes copies',
    rule: 'En anglais, l\'adjectif est <b>invariable</b> : il ne s\'accorde ni en genre ni en nombre. On dit <i>different subjects</i>, <i>male students</i>, <i>long buildings</i>. Attention à <i>its own</i> : <b>own</b> ne prend jamais de -s (<i>its own factories</i>).',
    ex: [['differents subjects', 'different subjects'], ['males students', 'male students'], ['longs buildings', 'long buildings'], ['its owns factories', 'its own factories']],
    items: [
      { s: 'We studied differents subjects in the first year.', bad: 'differents', fix: 'different' },
      { s: 'The class had more males students than female students.', bad: 'males', fix: 'male' },
      { s: 'The city is famous for its longs buildings near the river.', bad: 'longs', fix: 'long' },
      { s: 'The company runs its owns factories in three countries.', bad: 'owns', fix: 'own' },
      { s: 'Importants decisions are made by the board.', bad: 'Importants', fix: 'Important' },
      { s: 'They visited several historicals sites during the trip.', bad: 'historicals', fix: 'historical' },
      { s: 'The engineers proposed two news solutions.', bad: 'news', fix: 'new' },
      { s: 'My parents are very differents from each other.', bad: 'differents', fix: 'different' },
      { s: 'Electric cars are becoming more popular in many countries.', bad: null },
      { s: 'Young people often have different priorities from older people.', bad: null },
      { s: 'The government offers frees courses for unemployed adults.', bad: 'frees', fix: 'free' },
      { s: 'These machines are expensives to repair.', bad: 'expensives', fix: 'expensive' }
    ]
  },
  {
    id: 'pluriel', cat: 'pluriel', icon: '➕', title: 'Le pluriel sur le nom', seen: 'plusieurs fois',
    rule: 'Après un nombre (<i>two, three</i>) ou un mot pluriel (<i>many, several, places like</i>), le <b>nom</b> prend un -s : <i>two software engineers</i>, <i>two motorbikes</i>, <i>send messages</i>, <i>places like museums</i>. Ton réflexe : quand l\'adjectif ne bouge pas, c\'est le nom qui porte le pluriel.',
    ex: [['two software engineer', 'two software engineers'], ['two motobike', 'two motorbikes'], ['send message', 'send messages'], ['visiting place like museum', 'visiting places like museums']],
    items: [
      { s: 'There are two software engineer in my team.', bad: 'engineer', fix: 'engineers' },
      { s: 'My brother bought two motorbike last year.', bad: 'motorbike', fix: 'motorbikes' },
      { s: 'Many student work part-time to pay their rent.', bad: 'student', fix: 'students' },
      { s: 'I enjoy visiting places like museum and art galleries.', bad: 'museum', fix: 'museums' },
      { s: 'Several study show that sleep improves memory.', bad: 'study', fix: 'studies' },
      { s: 'People use their phones to send message to their friends.', bad: 'message', fix: 'messages' },
      { s: 'The factory employs three hundred worker.', bad: 'worker', fix: 'workers' },
      { s: 'One of my friend lives in Canada.', bad: 'friend', fix: 'friends' },
      { s: 'Both of my sisters live in Cyprus.', bad: null },
      { s: 'The two companies signed an agreement in March.', bad: null },
      { s: 'There are many reason why I want to study abroad.', bad: 'reason', fix: 'reasons' },
      { s: 'I have visited five country in Africa.', bad: 'country', fix: 'countries' }
    ]
  },
  {
    id: 'majuscule', cat: 'majuscule', icon: '🔠', title: 'Majuscules : mois, villes, pays, nationalités, langues', seen: '3 fois',
    rule: 'En anglais, prennent une <b>majuscule</b> : les mois (<i>July, September</i>), les jours (<i>Monday</i>), les villes et pays (<i>Windsor, Canada, Cyprus</i>), les nationalités et les langues (<i>French, English, Congolese</i>). Et toujours <b>I</b> (je).',
    ex: [['in july', 'in July'], ['in windsor', 'in Windsor'], ['I speak french', 'I speak French'], ['from cyprus to canada', 'from Cyprus to Canada']],
    items: [
      { s: 'I will move to windsor next year.', bad: 'windsor', fix: 'Windsor' },
      { s: 'The semester starts in september.', bad: 'september', fix: 'September' },
      { s: 'My first language is french.', bad: 'french', fix: 'French' },
      { s: 'I studied engineering in cyprus.', bad: 'cyprus', fix: 'Cyprus' },
      { s: 'Many students dream of studying in canada.', bad: 'canada', fix: 'Canada' },
      { s: 'The project ended in july.', bad: 'july', fix: 'July' },
      { s: 'We have a meeting every monday morning.', bad: 'monday', fix: 'Monday' },
      { s: 'My friend and i went to the museum.', bad: 'i', fix: 'I' },
      { s: 'He learned english at school.', bad: 'english', fix: 'English' },
      { s: 'I arrived in Nicosia in October.', bad: null },
      { s: 'Many congolese engineers work in mining.', bad: 'congolese', fix: 'Congolese' },
      { s: 'She speaks Spanish and Portuguese.', bad: null }
    ]
  },
  {
    id: 'chance-change', cat: 'confusion', icon: '🔀', title: 'chance ≠ change', seen: '2 fois',
    rule: '<b>chance</b> = occasion, possibilité (<i>a chance to study abroad</i>). <b>change</b> = changement / changer (<i>climate change</i>, <i>change my plans</i>). Relis : si tu peux dire « occasion », c\'est <i>chance</i> ; si tu peux dire « changement », c\'est <i>change</i>.',
    ex: [['a big chance in my life', 'a big change in my life'], ['the change to study', 'the chance to study']],
    items: [
      { s: 'Moving to Canada will be a big chance in my life.', bad: 'chance', fix: 'change' },
      { s: 'I hope to have the change to study abroad.', bad: 'change', fix: 'chance' },
      { s: 'Climate chance affects every country.', bad: 'chance', fix: 'change' },
      { s: 'This internship is a great chance to gain experience.', bad: null },
      { s: 'The company decided to chance its strategy.', bad: 'chance', fix: 'change' },
      { s: 'Nobody gave him a second change.', bad: 'change', fix: 'chance' },
      { s: 'The new manager made many changes in the factory.', bad: null },
      { s: 'There is a good chance that it will rain tomorrow.', bad: null }
    ]
  },
  {
    id: 'raise-rise', cat: 'confusion', icon: '📈', title: 'raise ≠ rise', seen: '2 fois',
    rule: '<b>raise</b> + complément = augmenter / lever quelque chose (<i>raise prices, raise awareness, raise your hand</i>). <b>rise</b> sans complément = monter tout seul (<i>prices rise, the sun rises</i>). Formes : raise/raised/raised ; rise/rose/risen. Comme le français : <i>augmenter les prix</i> (raise) / <i>les prix augmentent</i> (rise).',
    ex: [['prices raised', 'prices rose'], ['rise awareness', 'raise awareness']],
    items: [
      { s: 'The campaign aims to rise awareness about recycling.', bad: 'rise', fix: 'raise' },
      { s: 'House prices raised by ten percent last year.', bad: 'raised', fix: 'rose' },
      { s: 'The government decided to rise taxes on fuel.', bad: 'rise', fix: 'raise' },
      { s: 'Temperatures continue to rise every summer.', bad: null },
      { s: 'The university raised its fees for international students.', bad: null },
      { s: 'The number of electric cars has raised quickly.', bad: 'raised', fix: 'risen' },
      { s: 'If you have a question, rise your hand.', bad: 'rise', fix: 'raise' },
      { s: 'The sun rises earlier in summer.', bad: null }
    ]
  },
  {
    id: 'that-is-why', cat: 'grammaire', icon: '📐', title: 'That is why (jamais « that why »)', seen: '1 fois',
    rule: 'Pour dire « c\'est pourquoi », écris <b>That is why</b> (ou <i>That\'s why</i>, <i>This is why</i>). « That why » n\'a pas de verbe : c\'est une phrase incomplète. Variante C1 : <b>For this reason,</b> / <b>As a result,</b>',
    ex: [['That why I chose engineering.', 'That is why I chose engineering.']],
    items: [
      { s: 'I love solving problems. That why I chose engineering.', bad: 'why', fix: 'is why' },
      { s: 'The city is very polluted, that why many people use bicycles.', bad: 'why', fix: 'is why' },
      { s: 'My brother lives in Canada. That is why I want to study there.', bad: null },
      { s: 'Prices are high. This why many students share flats.', bad: 'why', fix: 'is why' },
      { s: 'The roads were flooded. As a result, the schools closed.', bad: null }
    ]
  },
  {
    id: 'calques', cat: 'calque', icon: '🇫🇷', title: 'Calques du français', seen: '11 mots relevés',
    rule: 'Ces mots ressemblent au français mais n\'existent pas en anglais, ou pas avec ce sens. Apprends la bonne forme par cœur.',
    ex: [['responsability', 'responsibility'], ['certitude', 'certainty'], ['planification', 'planning'], ['acceptation', 'acceptance'], ['relaxe', 'relaxed'], ['transfert', 'transfer'], ['visite (nom)', 'visit'], ['to vehicle the message', 'to convey the message'], ['in the past time', 'in the past'], ['Directly at the same time', 'At the same time'], ['as usually', 'as usual']],
    items: [
      { s: 'Managing a team is a big responsability.', bad: 'responsability', fix: 'responsibility' },
      { s: 'I can say with certitude that this method works.', bad: 'certitude', fix: 'certainty' },
      { s: 'Good planification is the key to a successful project.', bad: 'planification', fix: 'planning' },
      { s: 'The acceptation of new ideas takes time.', bad: 'acceptation', fix: 'acceptance' },
      { s: 'After the exam, I felt very relaxe.', bad: 'relaxe', fix: 'relaxed' },
      { s: 'The transfert of technology helps developing countries.', bad: 'transfert', fix: 'transfer' },
      { s: 'Our visite to the factory was very interesting.', bad: 'visite', fix: 'visit' },
      { s: 'Art is a powerful way to vehicle a message.', bad: 'vehicle', fix: 'convey' },
      { s: 'In the past time, people travelled on foot.', bad: 'time', fix: '(à supprimer)', ok: 'In the past, people travelled on foot.' },
      { s: 'As usually, the bus was late.', bad: 'usually', fix: 'usual' },
      { s: 'In the past, cars were much less safe.', bad: null },
      { s: 'At the same time, the company reduced its costs.', bad: null }
    ]
  },
  {
    id: 'remplissage', cat: 'remplissage', icon: '🫧', title: 'Pas de phrase d\'annonce', seen: '15 mots perdus sur 92',
    rule: 'Au DET, le temps est court : <b>commence directement par ta réponse</b>. « In the following part we will see… » n\'apporte aucune idée et te coûte 15 mots. Première phrase = ta position ou ta réponse directe. Exemple : <i>In my view, studying abroad is the best investment a young engineer can make.</i>',
    choice: true,
    items: [
      { q: 'Question : « Do you prefer working alone or in a team? » Quelle est la meilleure 1re phrase ?', opts: ['In the following part, we will see the advantages and disadvantages of both.', 'I prefer working in a team, because complex projects need different skills.', 'This is a very interesting question that many people ask.'], a: 1, why: 'Elle répond directement et annonce déjà la raison. Les deux autres ne disent rien.' },
      { q: 'Question : « Describe a place you enjoyed visiting. » Meilleure 1re phrase ?', opts: ['In this essay I am going to talk about a place.', 'There are many places in the world that people like.', 'One place I really enjoyed visiting is the car museum at Near East University in Cyprus.'], a: 2, why: 'Concrète et personnelle dès le premier mot : c\'est ta force, utilise-la tout de suite.' },
      { q: 'Question : « Should university education be free? » Meilleure 1re phrase ?', opts: ['In my view, university education should be free, because talent should matter more than money.', 'Nowadays, education is a very important topic in our society.', 'Firstly, I will explain my opinion and secondly I will give examples.'], a: 0, why: 'Position claire + raison en une phrase. « Nowadays… very important topic » est une phrase vide.' },
      { q: 'Question : « What technology has changed your life the most? » Meilleure 1re phrase ?', opts: ['Technology is everywhere in our modern world.', 'The smartphone has changed my life more than any other technology.', 'There are a lot of technologies and I will talk about one of them.'], a: 1, why: 'Elle nomme tout de suite la technologie : le lecteur sait de quoi tu parles.' }
    ]
  }
];

/* Amorces de phrases à mémoriser (pour écrire plus vite) */
window.STARTERS = [
  ['Donner ton avis', ['In my view,', 'I strongly believe that', 'From my experience,']],
  ['Ajouter une idée', ['In addition,', 'What is more,', 'Another reason is that']],
  ['Donner un exemple', ['For example, when I', 'A good example of this is', 'This was the case when']],
  ['Expliquer une cause', ['This is mainly because', 'The main reason is that', 'This is due to']],
  ['Donner une conséquence', ['As a result,', 'That is why', 'For this reason,']],
  ['Opposer', ['However,', 'On the other hand,', 'Although']],
  ['Conclure', ['Overall,', 'All in all,', 'For these reasons,']]
];
