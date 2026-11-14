/* Cognats (mots anglais qui viennent du latin/français) et faux amis.
   Au Read and Select : si un mot ressemble à un mot français existant, il est presque toujours vrai. */
window.COGNATES = [
  ['peninsula', 'péninsule'], ['reservoir', 'réservoir'], ['period', 'période'], ['characteristic', 'caractéristique'], ['process', 'processus'],
  ['series', 'série'], ['analysis', 'analyse'], ['hypothesis', 'hypothèse'], ['phenomenon', 'phénomène'], ['infrastructure', 'infrastructure'],
  ['mechanism', 'mécanisme'], ['territory', 'territoire'], ['agriculture', 'agriculture'], ['evaluation', 'évaluation'], ['sequence', 'séquence'],
  ['migration', 'migration'], ['frequency', 'fréquence'], ['minority', 'minorité'], ['legislation', 'législation'], ['distribution', 'distribution'],
  ['consumption', 'consommation'], ['civilization', 'civilisation'], ['opportunity', 'opportunité'], ['ambiguity', 'ambiguïté'], ['curiosity', 'curiosité'],
  ['diversity', 'diversité'], ['generosity', 'générosité'], ['abundance', 'abondance'], ['tolerance', 'tolérance'], ['coherence', 'cohérence'],
  ['consequence', 'conséquence'], ['existence', 'existence'], ['considerable', 'considérable'], ['comparable', 'comparable'], ['inevitable', 'inévitable'],
  ['visible', 'visible'], ['rigid', 'rigide'], ['fragile', 'fragile'], ['humid', 'humide'], ['vigilant', 'vigilant'],
  ['prudent', 'prudent'], ['adequate', 'adéquat'], ['immense', 'immense'], ['precise', 'précis'], ['obscure', 'obscur'],
  ['severe', 'sévère'], ['autonomous', 'autonome'], ['numerous', 'nombreux'], ['rigorous', 'rigoureux'], ['ambitious', 'ambitieux'],
  ['contemporary', 'contemporain'], ['preliminary', 'préliminaire'], ['voluntary', 'volontaire'], ['temporary', 'temporaire'], ['fundamental', 'fondamental'],
  ['substantial', 'substantiel'], ['municipal', 'municipal'], ['rural', 'rural'], ['medieval', 'médiéval'], ['maritime', 'maritime'],
  ['terrestrial', 'terrestre'], ['aquatic', 'aquatique'], ['vegetation', 'végétation'], ['sediment', 'sédiment'], ['erosion', 'érosion'],
  ['irrigation', 'irrigation'], ['cultivation', 'culture (des terres)'], ['mineral', 'minéral'], ['molecule', 'molécule'], ['particle', 'particule'],
  ['nucleus', 'noyau (nucléaire)'], ['organism', 'organisme'], ['epidemic', 'épidémie'], ['symptom', 'symptôme'], ['diagnosis', 'diagnostic'],
  ['therapy', 'thérapie'], ['catastrophe', 'catastrophe'], ['commerce', 'commerce'], ['negotiation', 'négociation'], ['hierarchy', 'hiérarchie'],
  ['bureaucracy', 'bureaucratie'], ['monarchy', 'monarchie'], ['parliament', 'parlement'], ['jurisdiction', 'juridiction'], ['tribunal', 'tribunal'],
  ['manuscript', 'manuscrit'], ['archive', 'archive'], ['monument', 'monument'], ['sculpture', 'sculpture'], ['architecture', 'architecture'],
  ['velocity', 'vélocité (vitesse)'], ['friction', 'friction'], ['combustion', 'combustion'], ['corrosion', 'corrosion'], ['tolerance', 'tolérance (technique)'],
  ['equilibrium', 'équilibre'], ['oscillation', 'oscillation'], ['trajectory', 'trajectoire'], ['logistics', 'logistique'], ['inventory', 'inventaire / stock']
];

/* Faux mots crédibles (n'existent pas en anglais) */
window.FAKEWORDS = [
  'abundity', 'accomplition', 'agricultance', 'ambitude', 'analytive', 'approximance', 'attentual', 'borrowance', 'calculance', 'certainment',
  'compositure', 'conclusment', 'crucialty', 'economance', 'effectuous', 'environmential', 'evaluance', 'experimentive', 'fragilous', 'generosive',
  'historal', 'identicate', 'industrance', 'influental', 'infrastructive', 'legislance', 'logistal', 'majoritive', 'mechanicism', 'minimitude',
  'necessitive', 'obligance', 'particularous', 'peninsulary', 'polliment', 'possibilate', 'practicate', 'preferency', 'processure', 'productal',
  'quantitude', 'reservance', 'responsitive', 'scientitude', 'sequentive', 'structurous', 'temporive', 'territoral', 'vegetance', 'curiosment'
];

/* Faux amis : [anglais, vrai sens, piège (sens français trompeur), exemple] */
window.FALSEFRIENDS = [
  ['actually', 'en fait', 'actuellement (= currently)', 'Actually, the meeting is tomorrow.'],
  ['eventually', 'finalement, à la fin', 'éventuellement (= possibly)', 'He eventually found a job in Toronto.'],
  ['library', 'bibliothèque', 'librairie (= bookshop)', 'I study at the university library.'],
  ['stage', 'étape, scène', 'un stage (= internship)', 'The project is at an early stage.'],
  ['versatile', 'polyvalent', 'versatile (= fickle, changeant)', 'A versatile engineer can work in many fields.'],
  ['sensible', 'raisonnable', 'sensible (= sensitive)', 'That is a sensible decision.'],
  ['attend', 'assister à', 'attendre (= wait)', 'I attend every lecture.'],
  ['demand', 'exiger', 'demander (= ask)', 'Workers demand higher wages.'],
  ['pretend', 'faire semblant', 'prétendre (= claim)', 'He pretended to understand.'],
  ['lecture', 'cours magistral', 'une lecture (= reading)', 'The lecture lasts two hours.'],
  ['sympathetic', 'compatissant', 'sympathique (= nice, friendly)', 'She was sympathetic when I lost my job.'],
  ['achieve', 'réussir, atteindre', 'achever (= finish)', 'She achieved her goal.'],
  ['deception', 'tromperie', 'déception (= disappointment)', 'The scam was based on deception.'],
  ['injury', 'blessure', 'injure (= insult)', 'He had a knee injury.'],
  ['journey', 'voyage, trajet', 'journée (= day)', 'The journey took six hours.'],
  ['resume', 'reprendre', 'résumer (= summarize)', 'Classes resume on Monday.'],
  ['location', 'emplacement', 'location (= rental)', 'The factory has a good location.'],
  ['large', 'grand', 'large (= wide)', 'A large number of students passed.'],
  ['currently', 'actuellement', '—', 'I am currently living in Cyprus.'],
  ['evidence', 'preuves', 'évidence (= obviousness)', 'There is no evidence that it works.'],
  ['formation', 'formation (géologique, d\'un groupe)', 'une formation (= training)', 'I need more training in Excel.'],
  ['assist', 'aider', 'assister à (= attend)', 'Nurses assist doctors during surgery.'],
  ['control', 'maîtriser, diriger', 'contrôler (= check)', 'Please check your answers.'],
  ['coin', 'pièce de monnaie', 'coin (= corner)', 'He found a coin on the floor.'],
  ['affair', 'liaison, affaire publique', 'une affaire (= business, deal, case)', 'It was a good business deal.']
];
