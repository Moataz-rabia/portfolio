import * as THREE from 'three';
import { content, ui } from '../data/content.js';
import {
  PALETTE,
  drawStar,
  makeCanvas,
  seededRandom,
  textureFromCanvas,
} from './assets.js';

const PITCH_WIDTH = 68;
const PITCH_LENGTH = 105;

/** Génère la texture de pelouse : bandes de tonte, lignes et étoile dorée. */
function createPitchTexture(renderer) {
  const canvas = makeCanvas(1024, 1536);
  const ctx = canvas.getContext('2d');
  const marginX = 56;
  const marginY = 64;
  const fieldW = canvas.width - marginX * 2;
  const fieldH = canvas.height - marginY * 2;
  const scale = fieldW / PITCH_WIDTH;
  const random = seededRandom(1908);
  const px = (x) => marginX + (x + PITCH_WIDTH / 2) * scale;
  const py = (y) => marginY + (y + PITCH_LENGTH / 2) * scale;

  // Fond herbeux.
  ctx.fillStyle = PALETTE.pitchDark;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Bandes de tonte alternées.
  const bands = 18;
  for (let i = 0; i < bands; i += 1) {
    ctx.fillStyle = i % 2 === 0 ? PALETTE.pitchLight : PALETTE.pitchDark;
    ctx.fillRect(marginX, marginY + (i * fieldH) / bands, fieldW, fieldH / bands + 1);
  }

  // Légères variations organiques.
  for (let i = 0; i < 1400; i += 1) {
    const x = marginX + random() * fieldW;
    const y = marginY + random() * fieldH;
    ctx.fillStyle = `rgba(255, 255, 255, ${random() * 0.018})`;
    ctx.fillRect(x, y, random() * 4 + 1, random() * 2 + 1);
  }

  // Halos bleus des projecteurs.
  const glows = [
    [marginX - 30, marginY - 30],
    [canvas.width - marginX + 30, marginY - 30],
    [marginX - 30, canvas.height - marginY + 30],
    [canvas.width - marginX + 30, canvas.height - marginY + 30],
  ];
  glows.forEach(([x, y]) => {
    const glow = ctx.createRadialGradient(x, y, 0, x, y, 480);
    glow.addColorStop(0, 'rgba(20, 86, 200, 0.22)');
    glow.addColorStop(1, 'rgba(20, 86, 200, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  });

  // Marquages blancs.
  ctx.save();
  ctx.strokeStyle = 'rgba(238, 241, 248, 0.86)';
  ctx.fillStyle = 'rgba(238, 241, 248, 0.86)';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const left = px(-34);
  const right = px(34);
  const top = py(-52.5);
  const bottom = py(52.5);
  const inset = 3;

  // Limites du terrain.
  ctx.strokeRect(left + inset, top + inset, right - left - inset * 2, bottom - top - inset * 2);

  // Ligne médiane et rond central.
  ctx.beginPath();
  ctx.moveTo(left, py(0));
  ctx.lineTo(right, py(0));
  ctx.stroke();

  const centerRadius = 9.15 * scale;
  ctx.beginPath();
  ctx.arc(px(0), py(0), centerRadius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(px(0), py(0), 5, 0, Math.PI * 2);
  ctx.fill();

  // Surfaces de réparation et zones de but.
  const penaltyHalf = 20.16;
  const goalAreaHalf = 9.16;
  const boxDepth = 16.5;
  const goalAreaDepth = 5.5;

  [
    { goalY: -52.5, direction: 1 },
    { goalY: 52.5, direction: -1 },
  ].forEach(({ goalY, direction }) => {
    const boxLineY = goalY + direction * boxDepth;
    const areaLineY = goalY + direction * goalAreaDepth;
    ctx.strokeRect(px(-penaltyHalf), Math.min(py(goalY), py(boxLineY)), penaltyHalf * 2 * scale, boxDepth * scale);
    ctx.strokeRect(px(-goalAreaHalf), Math.min(py(goalY), py(areaLineY)), goalAreaHalf * 2 * scale, goalAreaDepth * scale);

    const spotY = goalY + direction * 11;
    ctx.beginPath();
    ctx.arc(px(0), py(spotY), 4, 0, Math.PI * 2);
    ctx.fill();

    // Arc de réparation visible hors de la surface.
    ctx.beginPath();
    if (direction === 1) {
      ctx.arc(px(0), py(spotY), centerRadius, Math.PI * 0.2, Math.PI * 0.8);
    } else {
      ctx.arc(px(0), py(spotY), centerRadius, Math.PI * 1.2, Math.PI * 1.8);
    }
    ctx.stroke();
  });

  // Arcs de corner.
  const cornerRadius = 1.2 * scale;
  const corners = [
    [left, top, 0, Math.PI / 2],
    [right, top, Math.PI / 2, Math.PI],
    [right, bottom, Math.PI, Math.PI * 1.5],
    [left, bottom, Math.PI * 1.5, Math.PI * 2],
  ];
  corners.forEach(([x, y, start, end]) => {
    ctx.beginPath();
    ctx.arc(x, y, cornerRadius, start, end);
    ctx.stroke();
  });

  ctx.restore();

  // Étoile dorée au rond central.
  ctx.save();
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.62)';
  ctx.fillStyle = 'rgba(212, 175, 55, 0.1)';
  ctx.lineWidth = 4;
  drawStar(ctx, px(0), py(0), 58, 23);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  return textureFromCanvas(canvas, renderer);
}

/** Bandeau publicitaire nerazzurro généré localement. */
function createBannerTexture(renderer) {
  const canvas = makeCanvas(2048, 160);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = PALETTE.ink;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const stripeWidth = 64;
  for (let x = 0; x < canvas.width; x += stripeWidth) {
    ctx.fillStyle = Math.floor(x / stripeWidth) % 2 === 0 ? PALETTE.blue : PALETTE.ink;
    ctx.fillRect(x, 0, stripeWidth, canvas.height);
  }

  ctx.fillStyle = 'rgba(10, 10, 16, 0.6)';
  ctx.fillRect(0, 20, canvas.width, 120);

  ctx.textBaseline = 'middle';
  ctx.font = '700 54px Bahnschrift, "Segoe UI", sans-serif';
  const messages = [
    `${content.identity.name.toUpperCase()} · ${content.identity.number}`,
    ui.cardRole,
    `${ui.loaderBadge.toUpperCase()} · PFE ${ui.statTargetValue}`,
  ];
  for (let i = 0; i < 3; i += 1) {
    const centerX = canvas.width * (i / 3) + canvas.width / 6;
    ctx.textAlign = 'center';
    ctx.fillStyle = i === 1 ? PALETTE.gold : PALETTE.paper;
    ctx.fillText(messages[i], centerX, canvas.height / 2);
    ctx.font = '700 28px Bahnschrift, "Segoe UI", sans-serif';
    ctx.fillStyle = 'rgba(238, 241, 248, 0.45)';
    ctx.fillText(ui.screenTop, centerX, canvas.height / 2 + 44);
    ctx.font = '700 54px Bahnschrift, "Segoe UI", sans-serif';
  }

  return textureFromCanvas(canvas, renderer);
}

/** Crée un but complet avec poteaux, barre et filet filaire. */
function createGoal(sign) {
  const group = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({
    color: PALETTE.paper,
    roughness: 0.55,
    metalness: 0.15,
  });
  const postGeometry = new THREE.CylinderGeometry(0.075, 0.075, 2.44, 8);
  const barGeometry = new THREE.CylinderGeometry(0.075, 0.075, 7.32, 8);
  const goalZ = sign * 52.5;

  [-3.66, 3.66].forEach((x) => {
    const post = new THREE.Mesh(postGeometry, material);
    post.position.set(x, 1.22, goalZ);
    group.add(post);
  });

  const bar = new THREE.Mesh(barGeometry, material);
  bar.rotation.z = Math.PI / 2;
  bar.position.set(0, 2.44, goalZ);
  group.add(bar);

  // Filet : lignes légères, sans géométrie lourde.
  const points = [];
  const depth = 1.9;
  const backZ = goalZ + sign * depth;
  for (let x = -3.66; x <= 3.66; x += 0.61) {
    points.push(new THREE.Vector3(x, 0, backZ), new THREE.Vector3(x, 2.44, backZ));
  }
  for (let y = 0; y <= 2.44; y += 0.61) {
    points.push(new THREE.Vector3(-3.66, y, backZ), new THREE.Vector3(3.66, y, backZ));
    points.push(new THREE.Vector3(-3.66, y, goalZ), new THREE.Vector3(-3.66, y, backZ));
    points.push(new THREE.Vector3(3.66, y, goalZ), new THREE.Vector3(3.66, y, backZ));
  }
  for (let x = -3.66; x <= 3.66; x += 0.61) {
    points.push(new THREE.Vector3(x, 2.44, goalZ), new THREE.Vector3(x, 2.44, backZ));
  }
  const netGeometry = new THREE.BufferGeometry().setFromPoints(points);
  const net = new THREE.LineSegments(
    netGeometry,
    new THREE.LineBasicMaterial({
      color: PALETTE.paper,
      transparent: true,
      opacity: 0.26,
      depthWrite: false,
    }),
  );
  group.add(net);

  group.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = false;
      child.receiveShadow = true;
    }
  });
  return group;
}

/** Petit drapeau de corner bleu et or. */
function createCornerFlag(x, z, rotation) {
  const group = new THREE.Group();
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.045, 0.045, 1.65, 6),
    new THREE.MeshStandardMaterial({ color: PALETTE.paper, roughness: 0.5 }),
  );
  pole.position.y = 0.825;
  group.add(pole);

  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(1.05, 0.24);
  shape.lineTo(0, 0.48);
  shape.closePath();
  const flag = new THREE.Mesh(
    new THREE.ShapeGeometry(shape),
    new THREE.MeshBasicMaterial({
      color: PALETTE.gold,
      side: THREE.DoubleSide,
      toneMapped: false,
    }),
  );
  flag.position.set(0.04, 1.05, 0);
  group.add(flag);

  group.position.set(x, 0, z);
  group.rotation.y = rotation;
  return group;
}

/**
 * Assemble la pelouse, le terrain annexe, les buts, les bandeaux et les corners.
 */
export function createPitch(renderer, { mobile = false } = {}) {
  const group = new THREE.Group();
  group.name = 'pelouse';

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(190, 240),
    new THREE.MeshStandardMaterial({ color: '#05070D', roughness: 1 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.08;
  ground.receiveShadow = true;
  group.add(ground);

  const track = new THREE.Mesh(
    new THREE.PlaneGeometry(86, 124),
    new THREE.MeshStandardMaterial({ color: '#0A1120', roughness: 0.95 }),
  );
  track.rotation.x = -Math.PI / 2;
  track.position.y = -0.03;
  track.receiveShadow = true;
  group.add(track);

  const fieldMaterial = new THREE.MeshStandardMaterial({
    map: createPitchTexture(renderer),
    roughness: 0.93,
    metalness: 0.02,
  });
  const field = new THREE.Mesh(new THREE.PlaneGeometry(PITCH_WIDTH, PITCH_LENGTH), fieldMaterial);
  field.rotation.x = -Math.PI / 2;
  field.position.y = 0.01;
  field.receiveShadow = true;
  group.add(field);

  group.add(createGoal(-1));
  group.add(createGoal(1));

  // Bandeaux le long des deux lignes de touche.
  const bannerTexture = createBannerTexture(renderer);
  const bannerMaterial = new THREE.MeshBasicMaterial({
    map: bannerTexture,
    toneMapped: false,
    side: THREE.DoubleSide,
  });
  const bannerGeometry = new THREE.PlaneGeometry(78, 2.4);
  const eastBanner = new THREE.Mesh(bannerGeometry, bannerMaterial);
  eastBanner.position.set(38.4, 1.25, 0);
  eastBanner.rotation.y = -Math.PI / 2;
  group.add(eastBanner);

  const westBanner = new THREE.Mesh(bannerGeometry, bannerMaterial);
  westBanner.position.set(-38.4, 1.25, 0);
  westBanner.rotation.y = Math.PI / 2;
  group.add(westBanner);

  // Cadres sombres derrière les bandeaux.
  const frameMaterial = new THREE.MeshStandardMaterial({ color: '#05070D', roughness: 0.8 });
  [-1, 1].forEach((side) => {
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.8, 3, 78), frameMaterial);
    frame.position.set(side * 38.9, 1.2, 0);
    group.add(frame);
  });

  group.add(createCornerFlag(-34, -52.5, 0));
  group.add(createCornerFlag(34, -52.5, Math.PI / 2));
  group.add(createCornerFlag(34, 52.5, Math.PI));
  group.add(createCornerFlag(-34, 52.5, -Math.PI / 2));

  // Un peu de mobilier de touche, très bas poly.
  const benchMaterial = new THREE.MeshStandardMaterial({ color: '#0A1428', roughness: 0.8 });
  [-1, 1].forEach((side) => {
    for (let i = 0; i < 6; i += 1) {
      const bench = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.6, 1), benchMaterial);
      bench.position.set(side * 40, 0.3, -18 + i * 6);
      group.add(bench);
    }
  });

  if (mobile) {
    group.traverse((child) => {
      if (child.isMesh) child.castShadow = false;
    });
  }

  return { group, field };
}

export { PITCH_WIDTH, PITCH_LENGTH };
