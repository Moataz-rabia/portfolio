import * as THREE from 'three';
import { content, ui } from '../data/content.js';
import {
  PALETTE,
  drawImageCover,
  drawStar,
  makeCanvas,
  roundRectPath,
  seededRandom,
  textureFromCanvas,
  wrapText,
} from './assets.js';

const CARD_WIDTH = 6.2;
const CARD_HEIGHT = 8.7;
const CANVAS_W = 768;
const CANVAS_H = 1080;

/** Fond rayé nerazzurro commun aux deux faces. */
function paintCardBase(ctx, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = PALETTE.ink;
  roundRectPath(ctx, 0, 0, CANVAS_W, CANVAS_H, 44);
  ctx.fill();
  ctx.clip();

  const stripeWidth = 58;
  for (let x = 0; x < CANVAS_W; x += stripeWidth) {
    ctx.fillStyle = Math.floor(x / stripeWidth) % 2 === 0
      ? 'rgba(10, 58, 140, 0.95)'
      : 'rgba(10, 10, 16, 0.95)';
    ctx.fillRect(x, 0, stripeWidth, CANVAS_H);
  }

  const shade = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
  shade.addColorStop(0, 'rgba(10, 10, 16, 0.05)');
  shade.addColorStop(0.6, 'rgba(10, 10, 16, 0.3)');
  shade.addColorStop(1, 'rgba(10, 10, 16, 0.78)');
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // Bordure dorée double.
  ctx.strokeStyle = PALETTE.gold;
  ctx.lineWidth = 10;
  roundRectPath(ctx, 16, 16, CANVAS_W - 32, CANVAS_H - 32, 36);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(238, 241, 248, 0.35)';
  ctx.lineWidth = 2;
  roundRectPath(ctx, 34, 34, CANVAS_W - 68, CANVAS_H - 68, 28);
  ctx.stroke();

  ctx.restore();
}

/** Silhouette de remplacement si public/photo.png est absent. */
function paintSilhouette(ctx, cx, cy, radius) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(20, 86, 200, 0.45)';
  ctx.fill();

  ctx.fillStyle = 'rgba(238, 241, 248, 0.88)';
  ctx.beginPath();
  ctx.arc(cx, cy - radius * 0.18, radius * 0.31, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(cx, cy + radius * 0.58, radius * 0.6, radius * 0.48, 0, Math.PI, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(10, 10, 16, 0.25)';
  ctx.beginPath();
  ctx.arc(cx, cy + radius * 0.02, radius * 0.44, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** Face avant de la carte joueur. */
function paintFront(ctx, photo) {
  paintCardBase(ctx, 1);
  const centerX = CANVAS_W / 2;

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.fillStyle = PALETTE.gold;
  ctx.font = '700 22px Bahnschrift, "Segoe UI", sans-serif';
  ctx.fillText(ui.screenTop, centerX, 78);

  ctx.fillStyle = PALETTE.gold;
  drawStar(ctx, centerX, 130, 24, 9.6);
  ctx.fill();

  // Portrait.
  const photoX = centerX;
  const photoY = 356;
  const photoRadius = 158;
  ctx.save();
  ctx.beginPath();
  ctx.arc(photoX, photoY, photoRadius, 0, Math.PI * 2);
  ctx.clip();
  if (photo) {
    drawImageCover(ctx, photo, photoX - photoRadius, photoY - photoRadius, photoRadius * 2, photoRadius * 2);
    ctx.fillStyle = 'rgba(10, 10, 16, 0.18)';
    ctx.fillRect(photoX - photoRadius, photoY - photoRadius, photoRadius * 2, photoRadius * 2);
  } else {
    paintSilhouette(ctx, photoX, photoY, photoRadius);
  }
  ctx.restore();

  ctx.strokeStyle = PALETTE.gold;
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.arc(photoX, photoY, photoRadius + 5, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(238, 241, 248, 0.35)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(photoX, photoY, photoRadius + 16, 0, Math.PI * 2);
  ctx.stroke();

  // Numéro en filigrane.
  ctx.save();
  ctx.globalAlpha = 0.14;
  ctx.fillStyle = PALETTE.gold;
  ctx.font = '700 360px Bahnschrift, "Segoe UI", sans-serif';
  ctx.fillText(content.identity.number, centerX + 210, 820);
  ctx.restore();

  // Nom et poste.
  ctx.fillStyle = PALETTE.paper;
  ctx.font = '700 74px Bahnschrift, "Segoe UI", sans-serif';
  ctx.fillText(content.identity.name.toUpperCase(), centerX, 620);

  ctx.fillStyle = PALETTE.gold;
  ctx.font = '700 28px Bahnschrift, "Segoe UI", sans-serif';
  ctx.fillText(ui.cardRole, centerX, 682);

  // Badge de poste.
  ctx.fillStyle = 'rgba(10, 58, 140, 0.9)';
  roundRectPath(ctx, centerX - 118, 720, 236, 58, 29);
  ctx.fill();
  ctx.strokeStyle = PALETTE.gold;
  ctx.lineWidth = 2;
  roundRectPath(ctx, centerX - 118, 720, 236, 58, 29);
  ctx.stroke();
  ctx.fillStyle = PALETTE.paper;
  ctx.font = '700 27px Bahnschrift, "Segoe UI", sans-serif';
  ctx.fillText(`${content.identity.position} · N° ${content.identity.number}`, centerX, 751);

  ctx.fillStyle = 'rgba(238, 241, 248, 0.72)';
  ctx.font = '600 20px Bahnschrift, "Segoe UI", sans-serif';
  ctx.fillText(content.identity.location, centerX, 835);

  // Pied de carte.
  ctx.fillStyle = PALETTE.gold;
  ctx.fillRect(150, 886, 468, 2);
  ctx.fillStyle = PALETTE.paper;
  ctx.font = '700 25px Bahnschrift, "Segoe UI", sans-serif';
  ctx.fillText(content.identity.badge.toUpperCase(), centerX, 935);

  ctx.fillStyle = 'rgba(238, 241, 248, 0.5)';
  ctx.font = '600 18px Bahnschrift, "Segoe UI", sans-serif';
  ctx.fillText(
    `${content.identity.name.toUpperCase()} · ${ui.cardFooterLabel}`,
    centerX,
    1005,
  );
}

/** Dos de la carte : les informations clés du parcours. */
function paintBack(ctx) {
  paintCardBase(ctx, 1);
  const left = 78;
  const right = CANVAS_W - 78;

  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';

  ctx.fillStyle = PALETTE.gold;
  ctx.font = '700 20px Bahnschrift, "Segoe UI", sans-serif';
  ctx.fillText(ui.cardBackKicker, left, 92);

  ctx.fillStyle = PALETTE.paper;
  ctx.font = '700 42px Bahnschrift, "Segoe UI", sans-serif';
  ctx.fillText(ui.cardBackTitle, left, 145);

  ctx.fillStyle = PALETTE.gold;
  drawStar(ctx, right - 34, 118, 20, 8);
  ctx.fill();

  const rows = [
    {
      label: ui.formationLabel.toUpperCase(),
      value: `${content.education.title} · ${content.education.date} · ${content.education.org}`,
    },
    {
      label: ui.stagesLabel.toUpperCase(),
      value: content.experiences
        .map((experience) => `${experience.title} (${experience.org})`)
        .join(' · '),
    },
    {
      label: ui.projectLabel.toUpperCase(),
      value: content.personalProject.title,
    },
    {
      label: ui.contactLabel.toUpperCase(),
      value: `${content.identity.email}\n${content.identity.phone}\n${content.identity.location}`,
    },
  ];

  let y = 225;
  rows.forEach((row) => {
    ctx.fillStyle = PALETTE.gold;
    ctx.font = '700 18px Bahnschrift, "Segoe UI", sans-serif';
    ctx.fillText(row.label, left, y);

    ctx.strokeStyle = 'rgba(212, 175, 55, 0.45)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(left, y + 18);
    ctx.lineTo(right, y + 18);
    ctx.stroke();

    ctx.fillStyle = PALETTE.paper;
    ctx.font = '600 25px Bahnschrift, "Segoe UI", sans-serif';
    const lines = row.value.split('\n');
    let cursorY = y + 52;
    lines.forEach((line) => {
      cursorY = wrapText(ctx, line, left, cursorY, right - left, 32, 3) + 2;
    });

    y = cursorY + 28;
  });

  ctx.fillStyle = 'rgba(238, 241, 248, 0.62)';
  ctx.font = '600 18px Bahnschrift, "Segoe UI", sans-serif';
  ctx.fillText(
    `Langues : ${content.languages.map((language) => `${language.name} (${language.level})`).join(' · ')}`,
    left,
    928,
  );

  ctx.fillStyle = PALETTE.gold;
  ctx.fillRect(left, 958, right - left, 2);

  ctx.fillStyle = PALETTE.paper;
  ctx.font = '700 23px Bahnschrift, "Segoe UI", sans-serif';
  ctx.fillText(ui.screenTarget, left, 1000);
}

/** Halo doux derrière la carte. */
function createGlowTexture(renderer) {
  const canvas = makeCanvas(256, 256);
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  gradient.addColorStop(0, 'rgba(20, 86, 200, 0.55)');
  gradient.addColorStop(0.45, 'rgba(10, 58, 140, 0.18)');
  gradient.addColorStop(1, 'rgba(10, 58, 140, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);
  return textureFromCanvas(canvas, renderer);
}

/**
 * Carte joueur flottante : face avant (portrait, numéro 10) et dos (parcours, contact).
 */
export function createPlayerCard(renderer, photo, { mobile = false } = {}) {
  const group = new THREE.Group();
  group.name = 'carte-joueur';
  group.position.set(0, 8.35, 0);

  const frontCanvas = makeCanvas(CANVAS_W, CANVAS_H);
  paintFront(frontCanvas.getContext('2d'), photo);
  const backCanvas = makeCanvas(CANVAS_W, CANVAS_H);
  paintBack(backCanvas.getContext('2d'));

  const frontTexture = textureFromCanvas(frontCanvas, renderer);
  const backTexture = textureFromCanvas(backCanvas, renderer);
  const frontMaterial = new THREE.MeshBasicMaterial({
    map: frontTexture,
    transparent: true,
    alphaTest: 0.04,
    toneMapped: false,
  });
  const backMaterial = new THREE.MeshBasicMaterial({
    map: backTexture,
    transparent: true,
    alphaTest: 0.04,
    toneMapped: false,
  });

  const geometry = new THREE.PlaneGeometry(CARD_WIDTH, CARD_HEIGHT);
  const front = new THREE.Mesh(geometry, frontMaterial);
  front.position.z = 0.035;
  group.add(front);

  const back = new THREE.Mesh(geometry, backMaterial);
  back.position.z = -0.035;
  back.rotation.y = Math.PI;
  group.add(back);

  // Étoile dorée en relief au-dessus du cadre.
  const starShape = new THREE.Shape();
  const points = 5;
  const outer = 0.46;
  const inner = 0.19;
  for (let i = 0; i < points * 2; i += 1) {
    const radius = i % 2 === 0 ? outer : inner;
    const angle = -Math.PI / 2 + (i * Math.PI) / points;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) starShape.moveTo(x, y);
    else starShape.lineTo(x, y);
  }
  starShape.closePath();
  const starGeometry = new THREE.ExtrudeGeometry(starShape, {
    depth: 0.12,
    bevelEnabled: true,
    bevelSegments: 1,
    bevelSize: 0.035,
    bevelThickness: 0.035,
  });
  const starMaterial = new THREE.MeshStandardMaterial({
    color: PALETTE.gold,
    metalness: 0.85,
    roughness: 0.25,
    emissive: PALETTE.gold,
    emissiveIntensity: 0.25,
  });
  const star = new THREE.Mesh(starGeometry, starMaterial);
  star.position.set(0, CARD_HEIGHT / 2 + 0.5, 0.06);
  group.add(star);

  // Halo bleu derrière la carte.
  const glow = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: createGlowTexture(renderer),
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    }),
  );
  glow.scale.set(16, 20, 1);
  glow.position.z = -0.6;
  group.add(glow);

  // Poussière dorée autour de la carte.
  const random = seededRandom(10);
  const particleCount = mobile ? 36 : 90;
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i += 1) {
    const radius = 5 + random() * 4.5;
    const angle = random() * Math.PI * 2;
    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = (random() - 0.5) * 9;
    positions[i * 3 + 2] = Math.sin(angle) * radius;
  }
  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particles = new THREE.Points(
    particleGeometry,
    new THREE.PointsMaterial({
      color: PALETTE.gold,
      size: 0.055,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    }),
  );
  group.add(particles);

  // Socle lumineux au sol, séparé pour ne pas tourner avec la carte.
  const base = new THREE.Group();
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(4.6, 4.85, 64),
    new THREE.MeshBasicMaterial({
      color: PALETTE.gold,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide,
      depthWrite: false,
      toneMapped: false,
    }),
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.05;
  base.add(ring);

  const innerRing = new THREE.Mesh(
    new THREE.RingGeometry(3.2, 3.28, 64),
    new THREE.MeshBasicMaterial({
      color: PALETTE.blueBright,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
      depthWrite: false,
      toneMapped: false,
    }),
  );
  innerRing.rotation.x = -Math.PI / 2;
  innerRing.position.y = 0.06;
  base.add(innerRing);

  const baseY = group.position.y;
  const baseScale = group.scale.x;

  /** Rotation lente, flottement et pulsation du socle. */
  function update(time) {
    group.rotation.y = time * 0.22;
    group.position.y = baseY + Math.sin(time * 0.9) * 0.18;
    star.rotation.z = Math.sin(time * 0.8) * 0.08;
    glow.material.opacity = 0.68 + Math.sin(time * 1.4) * 0.12;
    particles.rotation.y = -time * 0.05;
    const pulse = 0.98 + Math.sin(time * 1.2) * 0.035;
    ring.scale.setScalar(pulse);
    ring.material.opacity = 0.48 + Math.sin(time * 1.2) * 0.18;
    base.scale.setScalar(baseScale);
  }

  return { group, base, update };
}
