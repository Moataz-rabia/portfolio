/**
 * Source unique de tout le contenu du portfolio.
 * Modifier ce fichier suffit pour mettre à jour les textes du site.
 */

export const content = {
  identity: {
    firstName: 'Moataz',
    lastName: 'Rabie',
    name: 'Moataz Rabie',
    number: 10,
    position: 'FSD',
    role: 'Développeur Full-Stack',
    title: 'Développeur Full-Stack | Recherche de stage PFE - Janvier 2027',
    badge: 'Recherche un stage PFE · janvier 2027',
    email: 'moatazrabia11@gmail.com',
    phone: '+216 52 213 163',
    phoneHref: '+21652213163',
    location: 'Médenine-Zarzis, Tunisie',
    availability: 'Disponible pour un stage PFE à partir de janvier 2027',
    summary:
      "Développeur full stack Vue.js / Node.js, je crée des applications web intuitives, sécurisées et déployées avec Docker, de l'interface à l'API et à la base de données. Sensible au design, je combine graphic design et montage vidéo pour offrir des expériences visuelles claires et efficaces.",
  },

  education: {
    id: 'formation',
    kind: 'Formation',
    title: "Licence en Technologie de l'Informatique",
    role: 'Licence en Technologie de l’Informatique',
    date: '2024 - 2027',
    org: 'ISET Djerba',
    place: 'Djerba, Tunisie',
    stack: ['Informatique', 'Développement web', 'Bases de données'],
    description:
      "Formation universitaire en technologie de l'informatique, orientée développement logiciel, web et gestion des données.",
  },

  experiences: [
    {
      id: 'deephysolver',
      kind: 'Stage',
      title: 'DeephySolver',
      role: "Stage d'initiation",
      date: 'Janvier 2025',
      org: 'Smart Center',
      place: 'Médenine-Zarzis',
      stack: ['Vue.js 3', 'JavaScript', 'UI/UX Design', 'REST API'],
      description:
        "Application web Vue.js d'aide aux calculs techniques des ingénieurs (conversions d'unités, calculs de poids). Analyse des besoins auprès d'utilisateurs ingénieurs.",
      highlight: 'Analyse des besoins auprès d’utilisateurs ingénieurs.',
    },
    {
      id: 'cyberpark',
      kind: 'Stage',
      title: 'Gestion de Cyberpark',
      role: 'Stage de perfectionnement',
      date: 'Janvier 2026',
      org: 'Cyberpark',
      place: 'Médenine-Djerba',
      stack: ['Node.js', 'Express.js', 'MongoDB', 'MySQL'],
      description:
        "Tableau de bord de gestion des entreprises hébergées : gestion des entreprises, statistiques, reporting, gestion des utilisateurs.",
      highlight: 'Gestion des entreprises, statistiques, reporting et utilisateurs.',
    },
  ],

  personalProject: {
    id: 'cafe-temps-reel',
    kind: 'Projet personnel',
    title: 'Plateforme de gestion de café et suivi en temps réel',
    role: 'Projet personnel',
    date: 'Projet personnel',
    org: 'Full-stack',
    place: 'Projet personnel',
    stack: ['Vue.js 3', 'Node.js', 'Express.js', 'MongoDB', 'Socket.IO', 'REST API'],
    description:
      "Application full-stack de numérisation des commandes, suivi des commandes et des tables en temps réel via Socket.IO, backend Express/MongoDB, interface Vue 3.",
    highlight: 'Commandes et tables suivies en temps réel avec Socket.IO.',
  },

  skillGroups: [
    {
      id: 'frontend',
      number: '01',
      title: 'Langages et Frontend',
      short: 'Frontend',
      items: ['JavaScript', 'Vue.js 3 (Composition API)', 'HTML5/CSS3', 'UI/UX Design'],
    },
    {
      id: 'backend',
      number: '02',
      title: 'Backend et temps réel',
      short: 'Backend',
      items: ['Node.js', 'Express.js', 'Laravel', 'Socket.IO', 'API RESTful'],
    },
    {
      id: 'databases',
      number: '03',
      title: 'Bases de données',
      short: 'Données',
      items: ['MongoDB', 'MySQL', 'PostgreSQL', 'Prisma'],
    },
    {
      id: 'devops',
      number: '04',
      title: 'Outils et DevOps',
      short: 'DevOps',
      items: ['Docker', 'Git et GitHub', 'Azure DevOps', 'Jira', 'Postman', 'Notion'],
    },
    {
      id: 'design',
      number: '05',
      title: 'Design et montage vidéo',
      short: 'Design',
      items: ['Adobe Photoshop', 'After Effects', 'CapCut', 'Graphic Design', 'Montage vidéo'],
    },
  ],

  languages: [
    { name: 'Arabe', level: 'langue maternelle' },
    { name: 'Français', level: 'intermédiaire' },
    { name: 'Anglais', level: 'bon niveau, documentation technique' },
  ],

  // Laisser vide tant que les liens ne sont pas fournis.
  links: {
    linkedin: '',
    github: '',
  },
};

/** Les trois projets affichés sur le tableau tactique. */
export const projects = [...content.experiences, content.personalProject];

/** Les étapes du parcours, dans l'ordre du récit. */
export const timeline = [content.education, ...content.experiences, content.personalProject];

/** Les cinq stations du stade. */
export const stations = [
  {
    id: 'accueil',
    index: 0,
    name: 'Accueil',
    kicker: "Coup d'envoi",
    minute: 0,
    minuteLabel: "0'",
    side: 'left',
    number: '01',
  },
  {
    id: 'projets',
    index: 1,
    name: 'Projets',
    kicker: 'Tableau tactique',
    minute: 22,
    minuteLabel: "22'",
    side: 'right',
    number: '02',
  },
  {
    id: 'parcours',
    index: 2,
    name: 'Parcours',
    kicker: 'Tableau de score',
    minute: 45,
    minuteLabel: "45'",
    side: 'right',
    number: '03',
  },
  {
    id: 'competences',
    index: 3,
    name: 'Compétences',
    kicker: 'Vestiaire',
    minute: 68,
    minuteLabel: "68'",
    side: 'left',
    number: '04',
  },
  {
    id: 'contact',
    index: 4,
    name: 'Contact',
    kicker: 'Tunnel des joueurs',
    minute: 90,
    minuteLabel: "90'",
    side: 'left',
    number: '05',
  },
];

/** Micro-textes de l'interface et des éléments 3D. */
export const ui = {
  loaderMessages: [
    'Préparation de la pelouse…',
    'Montage des tribunes…',
    'Réglage des projecteurs…',
    "Entrée des joueurs…",
  ],
  loaderBadge: 'Portfolio 3D',
  navPrevious: 'Station précédente',
  navNext: 'Station suivante',
  navStart: 'Début',
  navEnd: 'Fin',
  navHintDesktop: 'Molette, glissement ou touches ↑ ↓ · 1 à 5',
  navHintMobile: 'Glissez verticalement ou utilisez les boutons',
  navLabel: 'Navigation des stations',
  mapLabel: 'Mini-terrain de navigation',
  progressLabel: 'Temps de match',
  currentStation: 'Station actuelle',
  hudStatus: 'PFE · JANVIER 2027',
  loaderAria: 'Chargement du portfolio',
  loaderHint: 'Stade · 10 · Full-stack',
  statsLabel: 'Repères',
  statNumber: 'Numéro',
  statPosition: 'Poste',
  statTarget: 'Objectif PFE',
  statTargetValue: '2027',
  labelLocation: 'Localisation',
  labelSearch: 'Recherche',
  searchValue: 'Stage PFE · Janvier 2027',
  labelProfile: 'Profil',
  homeCtaProjects: 'Voir les projets',
  homeCtaContact: 'Me contacter',
  projectsHint:
    'Les trois attaquants dorés sont mes projets. Cliquez sur un joueur du tableau 3D ou sur une carte pour ouvrir le détail.',
  projectsSupport: 'Les autres joueurs affichent les technologies qui soutiennent ces projets.',
  parcoursHint: 'Chaque expérience est un match. Le score se lit dans les dates et les étapes.',
  skillsHint: 'Survolez un casier 3D pour l’ouvrir. Cliquez pour afficher la catégorie.',
  contactHint: 'La lumière au bout du tunnel mène à moi.',
  languagesTitle: 'Langues',
  contactTitle: 'Entrer en contact',
  available: 'Disponible',
  formationLabel: 'Formation',
  stagesLabel: 'Stages',
  projectLabel: 'Projet phare',
  contactLabel: 'Contact',
  cardRole: 'FULL-STACK DEVELOPER',
  cardFooterLabel: 'FICHE JOUEUR',
  cardBackKicker: 'FICHE JOUEUR · VERSO',
  cardBackTitle: 'AU DOS DU MAILLOT',
  lockerDoorTop: 'VESTIAIRE',
  categoryLabel: 'CATÉGORIE',
  itemsLabel: 'ÉLÉMENTS',
  projectTokenLabel: 'PROJET',
  boardTitle: 'PLAN DE JEU',
  boardSubtitle: 'PROJETS · 4-3-3',
  boardFooter: 'CLIQUEZ SUR UN ATTAQUANT DORÉ',
  lockerSign: 'VESTIAIRE — COMPÉTENCES',
  tunnelSign: 'TUNNEL DES JOUEURS',
  screenTop: 'STADIO · PORTFOLIO',
  screenSub: 'FULL-STACK DEVELOPER',
  screenTarget: 'OBJECTIF · PFE JANVIER 2027',
  screenName: 'MOATAZ RABIE',
  screenLive: 'MATCH EN COURS',
  fallbackTitle: 'Version 2D du portfolio',
  fallbackText:
    "WebGL n'est pas disponible sur ce navigateur ou ce GPU. Voici le portfolio complet en version texte, sans scène 3D.",
  skipLink: 'Aller au contenu',
  whistle: 'Coup de sifflet',
};
