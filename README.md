# Portfolio 3D — Moataz Rabie

Portfolio immersif en **Vite + Three.js + GSAP**. Une caméra traverse un stade de nuit et s'arrête sur cinq stations : accueil, projets, parcours, compétences et contact.

## Lancer le projet

Toutes les commandes sont à exécuter depuis le dossier `portfolio-3d`.

```cmd
npm install
npm run dev
```

Vite affiche l'adresse locale (en général `http://localhost:5173`).

Pour créer puis prévisualiser la version de production :

```cmd
npm run build
npm run preview
```

Le site compilé est généré dans `dist/`.

## Commandes

| Commande | Rôle |
| --- | --- |
| `npm install` | Installe les dépendances. |
| `npm run dev` | Serveur de développement avec rechargement automatique. |
| `npm run build` | Compile le site dans `dist/`. |
| `npm run preview` | Sert localement le contenu de `dist/`. |

## Navigation

- **Molette**, **glissement vertical** ou **flèches ↑ ↓ / ← →** : changer de station.
- **Touches 1 à 5** : aller directement à une station.
- **Home / End** : première ou dernière station.
- **Mini-terrain** en bas à gauche : cliquer sur un point.
- **Tableau tactique** et **casiers** : objets cliquables dans la scène 3D.

Sur mobile, le glissement vertical et les boutons du HUD remplacent la molette.

## Modifier le contenu

Tout le texte du portfolio se trouve dans un seul fichier :

`src/data/content.js`

- `content.identity` : nom, titre, coordonnées, disponibilité, résumé.
- `content.education` et `content.experiences` : parcours et stages.
- `content.personalProject` : projet personnel.
- `content.skillGroups` : catégories de compétences (sans pourcentages inventés).
- `content.languages` : langues.
- `content.links` : LinkedIn et GitHub, **vides tant que les URL ne sont pas fournies**.
- `stations` : noms, minutes et numéros des cinq étapes.
- `ui` : micro-textes de l'interface et des éléments 3D.

Après modification, le site se met à jour automatiquement en mode développement.

## Images

- `public/stadium.jpg` : image du stade affichée sur l'écran géant. Si elle est absente, une version dessinée est générée automatiquement.
- `public/photo.png` : **facultatif**. Portrait affiché sur la carte du joueur. Sans ce fichier, une silhouette est dessinée sur la carte.

Pour changer le portrait, déposez simplement un fichier nommé `photo.png` dans `public/`. Un portrait vertical fonctionne mieux.

## Structure

```text
index.html                 structure HTML et métadonnées
public/                    favicon, stadium.jpg, photo.png éventuelle
src/main.js                démarrage, navigation et interactions
src/styles.css             styles globaux, HUD, panneaux et repli 2D
src/data/content.js        tout le contenu éditorial
src/scene/                 stade 3D : pelouse, tribunes, toit, projecteurs,
                           écran, carte joueur, tableau tactique, casiers,
                           tunnel, caméra et renderer
src/sections/overlays.js   panneaux HTML des stations + version 2D
src/ui/                    chargement, HUD, curseur ballon, effets
```

## Accessibilité et performances

- Navigation clavier complète, lien d'évitement et annonces vocales.
- Respect de `prefers-reduced-motion` : transitions de caméra instantanées et animations réduites.
- Version 2D complète si WebGL est indisponible ou si le contexte graphique est perdu.
- Géométries instanciées, pixel ratio limité et version allégée sur mobile.
- Aucune ressource distante : polices système, textures générées localement et images du dossier `public/`.

## Note

Ce portfolio utilise une identité visuelle inspirée du football (bleu, noir, or, étoile) sans reprendre de logo officiel de club.
