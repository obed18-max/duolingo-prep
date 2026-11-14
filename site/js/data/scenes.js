/* Scènes illustrées (SVG dessinés pour l'app, pas de photo extérieure) pour Write/Speak About the Photo.
   Chaque scène : svg, mots utiles, description modèle. */
(function () {
  const sky = (c = '#bde4ff') => `<rect width="400" height="260" fill="${c}"/>`;
  const person = (x, y, shirt, s = 1, extra = '') => `<g transform="translate(${x} ${y}) scale(${s})"><circle cx="0" cy="-58" r="11" fill="#8d5524"/><rect x="-11" y="-46" width="22" height="34" rx="6" fill="${shirt}"/><rect x="-10" y="-13" width="8" height="30" fill="#2c3e50"/><rect x="2" y="-13" width="8" height="30" fill="#2c3e50"/>${extra}</g>`;
  const tree = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-5" y="-10" width="10" height="40" fill="#8b5a2b"/><circle cx="0" cy="-30" r="28" fill="#3a9d4f"/><circle cx="-18" cy="-18" r="18" fill="#47b35e"/><circle cx="18" cy="-18" r="18" fill="#47b35e"/></g>`;
  window.SCENES = [
    { id: 's1', t: 'Un marché en plein air',
      svg: `${sky()}<rect y="180" width="400" height="80" fill="#d9c7a7"/>
        <rect x="20" y="110" width="160" height="70" fill="#fff3d6"/><polygon points="10,110 190,110 170,85 30,85" fill="#e74c3c"/><polygon points="40,110 60,85 80,85 60,110" fill="#fff"/><polygon points="100,110 120,85 140,85 120,110" fill="#fff"/>
        ${[40, 70, 100, 130, 160].map((x, i) => `<circle cx="${x}" cy="130" r="9" fill="${['#ff9500', '#ff3b30', '#34c759', '#ffcc00', '#af52de'][i]}"/>`).join('')}
        <rect x="220" y="115" width="160" height="65" fill="#fff3d6"/><polygon points="210,115 390,115 370,90 230,90" fill="#007aff"/>
        ${[245, 275, 305, 335, 360].map(x => `<rect x="${x - 10}" y="130" width="20" height="14" fill="#a0522d"/>`).join('')}
        ${person(110, 235, '#5856d6')}${person(160, 238, '#ff2d55', .95)}${person(300, 235, '#34c759')}${person(345, 240, '#ff9500', .8)}`,
      words: ['stall', 'vendor', 'fresh fruit', 'crowded', 'awning', 'customers', 'bargain', 'in the background'],
      model: 'This picture shows a busy outdoor market on a sunny day. On the left, there is a stall with a red and white awning where a vendor is selling fresh fruit, such as oranges and lemons. Two customers are standing in front of it, probably choosing what to buy. On the right, another stall with a blue roof sells bread. Overall, the scene looks lively and colourful.' },
    { id: 's2', t: 'Une salle de classe',
      svg: `<rect width="400" height="260" fill="#f5efe0"/><rect x="40" y="25" width="200" height="90" fill="#2e4d3a" stroke="#8b5a2b" stroke-width="6"/>
        <text x="60" y="65" fill="#fff" font-size="18" font-family="sans-serif">E = mc²</text><text x="60" y="95" fill="#fff" font-size="14" font-family="sans-serif">Lecture 3: Energy</text>
        ${person(290, 160, '#007aff', 1.1)}<rect x="300" y="80" width="40" height="5" fill="#333" transform="rotate(-30 300 80)"/>
        ${[70, 170, 270].map(x => `<rect x="${x - 40}" y="200" width="80" height="12" fill="#a0522d"/>`).join('')}
        ${[50, 90, 150, 190, 250].map((x, i) => `<g transform="translate(${x} 200)"><circle cx="0" cy="-26" r="10" fill="#c68642"/><rect x="-10" y="-16" width="20" height="18" rx="5" fill="${['#ff9500', '#34c759', '#af52de', '#ff3b30', '#5ac8fa'][i]}"/></g>`).join('')}
        <rect x="350" y="20" width="35" height="50" fill="#bde4ff" stroke="#fff" stroke-width="3"/>`,
      words: ['lecturer', 'whiteboard / blackboard', 'equation', 'students', 'taking notes', 'desks', 'pointing at'],
      model: 'The image shows a lecture in a university classroom. A lecturer in a blue shirt is standing next to a blackboard and pointing at an equation, E = mc². Under it, the title says that this is a lecture about energy. In front of him, five students are sitting at wooden desks and seem to be listening carefully. The room looks simple but well lit.' },
    { id: 's3', t: 'Une usine moderne',
      svg: `<rect width="400" height="260" fill="#dfe6ee"/><rect y="200" width="400" height="60" fill="#9aa5b1"/>
        <rect x="20" y="150" width="360" height="22" fill="#4a4a4a"/>${[40, 100, 160, 220, 280, 340].map(x => `<circle cx="${x}" cy="172" r="8" fill="#222"/><rect x="${x - 15}" y="128" width="30" height="22" fill="#d4a017"/>`).join('')}
        <g><rect x="60" y="40" width="14" height="80" fill="#ff9500"/><rect x="60" y="40" width="70" height="12" fill="#ff9500"/><rect x="122" y="52" width="6" height="40" fill="#555"/></g>
        ${person(250, 235, '#ff9500', 1, '<rect x="-12" y="-72" width="24" height="9" rx="4" fill="#ffcc00"/>')}${person(320, 235, '#007aff', 1, '<rect x="-12" y="-72" width="24" height="9" rx="4" fill="#fff"/><rect x="12" y="-40" width="14" height="18" fill="#fff"/>')}`,
      words: ['production line', 'conveyor belt', 'robotic arm', 'boxes', 'safety helmet', 'clipboard', 'inspecting', 'warehouse'],
      model: 'This photo was taken inside a modern factory. In the middle, boxes are moving along a conveyor belt, and an orange robotic arm is working above the line. In the foreground, two workers are wearing safety helmets. The one on the right is holding a clipboard, so he might be checking the quality of the products. The place looks clean, organised and highly automated.' },
    { id: 's4', t: 'Un parc en été',
      svg: `${sky()}<circle cx="340" cy="45" r="25" fill="#ffd60a"/><rect y="160" width="400" height="100" fill="#7ccf6b"/>
        ${tree(60, 160, 1.1)}${tree(330, 170, .9)}<ellipse cx="200" cy="215" rx="70" ry="18" fill="#5ac8fa"/>
        <rect x="120" y="170" width="70" height="10" fill="#8b5a2b"/>${person(140, 200, '#ff2d55', .8)}${person(170, 200, '#5856d6', .8)}
        <rect x="250" y="225" width="60" height="25" fill="#ff3b30" opacity=".85"/>${person(270, 230, '#ffcc00', .7)}
        <circle cx="110" cy="235" r="8" fill="#fff" stroke="#333"/>${person(90, 250, '#34c759', .7)}`,
      words: ['bench', 'pond', 'picnic blanket', 'shade', 'having a picnic', 'playing with a ball', 'sunny', 'relaxing'],
      model: 'The picture shows a green park on a hot summer day. In the centre, there is a small pond surrounded by grass, and two people are sitting on a wooden bench, probably chatting. On the right, someone is relaxing on a red picnic blanket, while on the left a child is playing with a ball next to a big tree. It looks like a peaceful afternoon.' },
    { id: 's5', t: 'Une rue en ville sous la pluie',
      svg: `<rect width="400" height="260" fill="#7f8c8d"/>${[0, 80, 160, 240, 320].map((x, i) => `<rect x="${x + 5}" y="${30 + i % 2 * 25}" width="70" height="${150 - i % 2 * 25}" fill="${['#566573', '#5d6d7e', '#4d5656', '#626567', '#515a5a'][i]}"/>${[0, 1, 2].map(r => `<rect x="${x + 15}" y="${50 + i % 2 * 25 + r * 35}" width="18" height="18" fill="#f9e79f"/><rect x="${x + 45}" y="${50 + i % 2 * 25 + r * 35}" width="18" height="18" fill="#f9e79f"/>`).join('')}`).join('')}
        <rect y="180" width="400" height="80" fill="#34495e"/><rect x="0" y="215" width="400" height="5" fill="#fff" stroke-dasharray="30 20" stroke="#fff"/>
        <rect x="200" y="190" width="90" height="35" rx="10" fill="#ffcc00"/><circle cx="220" cy="228" r="8" fill="#111"/><circle cx="272" cy="228" r="8" fill="#111"/><text x="228" y="212" font-size="11" font-family="sans-serif">TAXI</text>
        ${person(90, 250, '#2c3e50', .9)}<path d="M60 175 Q90 145 120 175 Z" fill="#ff3b30"/><line x1="90" y1="175" x2="90" y2="195" stroke="#333" stroke-width="2"/>
        ${Array.from({ length: 40 }, (_, i) => `<line x1="${i * 10 + 3}" y1="${(i * 37) % 200}" x2="${i * 10}" y2="${(i * 37) % 200 + 12}" stroke="#d6eaf8" stroke-width="1.5"/>`).join('')}`,
      words: ['umbrella', 'pouring rain', 'taxi', 'pedestrian', 'buildings', 'lit windows', 'wet street', 'in a hurry'],
      model: 'This image shows a city street on a rainy evening. Tall buildings line both sides of the road, and many of their windows are lit. A yellow taxi is driving along the wet street. On the left, a pedestrian is holding a red umbrella to protect himself from the heavy rain. The atmosphere seems grey and a little gloomy, typical of a busy city in autumn.' },
    { id: 's6', t: 'Une bibliothèque',
      svg: `<rect width="400" height="260" fill="#f3e5c8"/>${[20, 140, 260].map(x => `<rect x="${x}" y="20" width="110" height="150" fill="#8b5a2b"/>${[0, 1, 2, 3].map(r => Array.from({ length: 9 }, (_, k) => `<rect x="${x + 6 + k * 11}" y="${28 + r * 36}" width="9" height="28" fill="${['#c0392b', '#2980b9', '#27ae60', '#f39c12', '#8e44ad'][(k + r) % 5]}"/>`).join('')).join('')}`).join('')}
        <rect x="80" y="200" width="240" height="14" fill="#a0522d"/>${person(130, 235, '#007aff', .9)}${person(270, 235, '#ff2d55', .9)}
        <rect x="150" y="186" width="40" height="14" fill="#333"/><rect x="152" y="176" width="36" height="12" fill="#5ac8fa"/><rect x="230" y="190" width="30" height="10" fill="#fff"/>`,
      words: ['bookshelves', 'library', 'laptop', 'studying', 'quiet', 'open book', 'concentrating', 'opposite each other'],
      model: 'The picture was taken in a library. In the background, there are three tall bookshelves full of colourful books. In the foreground, two students are sitting opposite each other at a long wooden table. The young man on the left is working on a laptop, while the woman on the right is reading an open book. They both look focused, so they are probably preparing for exams.' },
    { id: 's7', t: 'Une cuisine en famille',
      svg: `<rect width="400" height="260" fill="#fdebd0"/><rect x="0" y="150" width="400" height="20" fill="#d35400"/><rect y="170" width="400" height="90" fill="#e59866"/>
        <rect x="280" y="40" width="100" height="70" fill="#bde4ff" stroke="#fff" stroke-width="5"/><circle cx="60" cy="140" r="14" fill="#555"/><rect x="40" y="120" width="40" height="6" fill="#555"/>
        ${person(120, 210, '#ffffff', 1.1, '<rect x="-12" y="-44" width="24" height="30" fill="#ff3b30"/>')}${person(200, 215, '#34c759', .8)}${person(250, 210, '#af52de', 1)}
        <ellipse cx="190" cy="148" rx="30" ry="8" fill="#fff"/><circle cx="182" cy="145" r="5" fill="#e74c3c"/><circle cx="196" cy="145" r="5" fill="#27ae60"/>`,
      words: ['kitchen', 'apron', 'cooking together', 'counter', 'vegetables', 'frying pan', 'family', 'helping'],
      model: 'This picture shows a family cooking together in a bright kitchen. A man wearing a red apron is standing near the stove, where there is a frying pan. Next to him, a child and a woman are looking at a plate of vegetables on the counter, so they are probably preparing a salad. Through the window on the right, we can see that it is daytime. The scene looks warm and friendly.' },
    { id: 's8', t: 'Des panneaux solaires',
      svg: `${sky('#cfe9ff')}<circle cx="60" cy="50" r="28" fill="#ffd60a"/><rect y="180" width="400" height="80" fill="#c9b27c"/>
        ${[0, 1, 2, 3].map(i => `<g transform="translate(${30 + i * 90} 140) skewX(-20)"><rect width="80" height="45" fill="#1f3a93"/>${[1, 2, 3].map(k => `<line x1="${k * 20}" y1="0" x2="${k * 20}" y2="45" stroke="#7fb3ff"/>`).join('')}<line x1="0" y1="22" x2="80" y2="22" stroke="#7fb3ff"/></g><rect x="${55 + i * 90}" y="185" width="5" height="20" fill="#666"/>`).join('')}
        ${person(330, 250, '#ff9500', .9, '<rect x="-12" y="-72" width="24" height="9" rx="4" fill="#ffcc00"/>')}<rect x="300" y="60" width="8" height="120" fill="#999"/><polygon points="304,60 340,50 304,70" fill="#eee"/>`,
      words: ['solar panels', 'renewable energy', 'engineer', 'clear sky', 'rows of', 'wind turbine', 'dry land', 'maintenance'],
      model: 'The image shows a solar farm under a clear blue sky. Several rows of dark blue solar panels are installed on dry land, and they are turned towards the bright sun. On the right, an engineer wearing a yellow helmet is standing next to a small wind turbine, perhaps checking the equipment. This photo illustrates how renewable energy can be produced in sunny regions.' }
  ];
})();
