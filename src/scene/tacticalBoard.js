import * as THREE from 'three';
import { content, projects, ui } from '../data/content.js';
import {
  PALETTE,
  drawStar,
  makeCanvas,
  roundRectPath,
  seededRandom,
  textureFromCanvas,
} from './assets.js';

const BOARD_WIDTH = 28;
const BOARD_HEIGHT = 19;
const TOKEN_W = 3.6;
const TOKEN_H = 2.8;

/**
 * Composition 4-3-3. Les trois attaquants correspondent aux projets,
 * les autres joueurs affichent les technologies qui les soutiennent.
 */
const FORMATION = [
  { x: 0, y: 0.08, number: 1, label: 'Docker', type: 'support' },
  { x: -0.72, y: 0.3, number: 2, label: 'Vue.js', type: 'support' },
  { x: -0.28, y: 0.26, number: 3, label: 'Node.js', type: 'support' },
  { x: 0.28, y: 0.26, number: 4, label: 'MongoDB', type: 'support' },
  { x: 0.72, y: 0.3, number: 5, label: 'MySQL', type: 'support' },
  { x: -0.45, y: 0.52, number: 6, label: 'Express.js', type: 'support' },
  { x: 0, y: 0.48, number: 8, label: 'Socket.IO', type: 'support' },
  { x: 0.45, y: 0.52, number: 14, label: 'REST API', type: 'support' },
  { x: -0.58, y: 0.8, number: 9, project: projects[0], type: 'project' },
  { x: 0, y: 0.86, number: 11, project: projects[2], type: 'project' },
  { x: 0.58, y: 0.8, number: 7, project: projects[1], type: 'project' },
];

/** Fond du tableau tactique, dessiné à la manière d'un plan de jeu. */
function createBoardTexture(renderer) {
  const canvas = makeCanvas(1400, 950);
  const ctx = canvas.getContext('2d');
  const random = seededRandom(433);

  ctx.fillStyle = '#082A20';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 15; i += 1) {
    ctx.fillStyle = i % 2 === 0 ? 'rgba(16, 84, 60, 0.75)' : 'rgba(8, 42, 32, 0.75)';
    ctx.fillRect(0, 90 + (i * 800) / 15, canvas.width, 800 / 15 + 1);
  }

  // Lignes de terrain.
  ctx.strokeStyle = 'rgba(238, 241, 248, 0.22)';
  ctx.lineWidth = 3;
  ctx.strokeRect(58, 120, canvas.width - 116, 730);
  ctx.beginPath();
  ctx.moveTo(58, 485);
  ctx.lineTo(canvas.width - 58, 485);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(canvas.width / 2, 485, 104, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeRect(canvas.width / 2 - 170, 120, 340, 92);
  ctx.strokeRect(canvas.width / 2 - 170, 758, 340, 92);

  for (let i = 0; i < 600; i += 1) {
    ctx.fillStyle = `rgba(255, 255, 255, ${random() * 0.025})`;
    ctx.fillRect(58 + random() * (canvas.width - 116), 120 + random() * 730, 2, 2);
  }

  // Bandeau titre.
  ctx.fillStyle = 'rgba(5, 8, 16, 0.92)';
  ctx.fillRect(0, 0, canvas.width, 100);
  ctx.fillStyle = 'rgba(5, 8, 16, 0.92)';
  ctx.fillRect(0, 870, canvas.width, 80);
  ctx.fillStyle = PALETTE.gold;
  ctx.fillRect(0, 98, canvas.width, 3);
  ctx.fillRect(0, 868, canvas.width, 3);

  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillStyle = PALETTE.gold;
  ctx.font = '700 30px Bahnschrift, "Segoe UI", sans-serif';
  ctx.fillText(ui.boardTitle, 58, 48);

  ctx.fillStyle = PALETTE.paper;
  ctx.font = '700 42px Bahnschrift, "Segoe UI", sans-serif';
  ctx.fillText(ui.boardSubtitle, 58, 80);

  ctx.textAlign = 'right';
  ctx.fillStyle = 'rgba(238, 241, 248, 0.55)';
  ctx.font = '600 22px Bahnschrift, "Segoe UI", sans-serif';
  ctx.fillText(
    `${content.identity.name.toUpperCase()} · ${content.identity.position}`,
    canvas.width - 58,
    52,
  );
  ctx.fillStyle = PALETTE.gold;
  drawStar(ctx, canvas.width - 78, 78, 13, 5.2);
  ctx.fill();

  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(238, 241, 248, 0.62)';
  ctx.font = '600 19px Bahnschrift, "Segoe UI", sans-serif';
  ctx.fillText(ui.boardFooter, canvas.width / 2, 908);

  // Étoiles de coin.
  ctx.fillStyle = 'rgba(212, 175, 55, 0.5)';
  [[40, 130], [canvas.width - 40, 130], [40, 840], [canvas.width - 40, 840]].forEach(([x, y]) => {
    drawStar(ctx, x, y, 10, 4);
    ctx.fill();
  });

  return textureFromCanvas(canvas, renderer);
}

/** Jeton de joueur : doré pour un projet, bleu pour un soutien technique. */
function createTokenTexture(renderer, item) {
  const canvas = makeCanvas(384, 300);
  const ctx = canvas.getContext('2d');
  const isProject = item.type === 'project';
  const label = isProject ? item.project.title : item.label;
  const number = item.number;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Carte.
  ctx.fillStyle = isProject ? 'rgba(6, 10, 22, 0.94)' : 'rgba(7, 16, 36, 0.92)';
  roundRectPath(ctx, 4, 4, canvas.width - 8, canvas.height - 8, 26);
  ctx.fill();
  ctx.lineWidth = isProject ? 6 : 3;
  ctx.strokeStyle = isProject ? PALETTE.gold : 'rgba(20, 86, 200, 0.85)';
  roundRectPath(ctx, 4, 4, canvas.width - 8, canvas.height - 8, 26);
  ctx.stroke();

  const circleX = canvas.width / 2;
  const circleY = 118;
  const circleRadius = 78;

  ctx.save();
  ctx.beginPath();
  ctx.arc(circleX, circleY, circleRadius, 0, Math.PI * 2);
  ctx.clip();

  if (isProject) {
    for (let x = circleX - circleRadius; x < circleX + circleRadius; x += 26) {
      ctx.fillStyle = Math.floor((x - circleX + circleRadius) / 26) % 2 === 0
        ? PALETTE.blue
        : PALETTE.ink;
      ctx.fillRect(x, circleY - circleRadius, 26, circleRadius * 2);
    }
  } else {
    const gradient = ctx.createRadialGradient(circleX, circleY, 0, circleX, circleY, circleRadius);
    gradient.addColorStop(0, 'rgba(20, 86, 200, 0.65)');
    gradient.addColorStop(1, 'rgba(10, 58, 140, 0.2)');
    ctx.fillStyle = gradient;
    ctx.fillRect(circleX - circleRadius, circleY - circleRadius, circleRadius * 2, circleRadius * 2);
  }
  ctx.restore();

  ctx.strokeStyle = isProject ? PALETTE.gold : 'rgba(238, 241, 248, 0.55)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(circleX, circleY, circleRadius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = isProject ? PALETTE.paper : 'rgba(238, 241, 248, 0.92)';
  ctx.font = `700 ${isProject ? 66 : 48}px Bahnschrift, "Segoe UI", sans-serif`;
  if (isProject) {
    ctx.fillText(String(number).padStart(2, '0'), circleX, circleY + 4);
  } else {
    ctx.font = '700 24px Bahnschrift, "Segoe UI", sans-serif';
    ctx.fillStyle = PALETTE.gold;
    ctx.fillText(String(number).padStart(2, '0'), circleX, circleY - 30);
    ctx.fillStyle = PALETTE.paper;
    ctx.font = '700 25px Bahnschrift, "Segoe UI", sans-serif';
    const words = item.label.split(' ');
    if (words.length > 1) {
      ctx.fillText(words[0], circleX, circleY + 5);
      ctx.fillText(words.slice(1).join(' '), circleX, circleY + 34);
    } else {
      ctx.fillText(item.label, circleX, circleY + 12);
    }
  }

  // Nom du projet sous le cercle.
  ctx.fillStyle = isProject ? PALETTE.gold : 'rgba(238, 241, 248, 0.85)';
  ctx.font = `700 ${isProject ? 24 : 20}px Bahnschrift, "Segoe UI", sans-serif`;
  if (isProject) {
    ctx.fillStyle = 'rgba(238, 241, 248, 0.65)';
    ctx.font = '600 16px Bahnschrift, "Segoe UI", sans-serif';
    ctx.fillText(ui.projectTokenLabel, canvas.width / 2, 222);
    ctx.fillStyle = PALETTE.gold;
    ctx.font = '700 23px Bahnschrift, "Segoe UI", sans-serif';
    const shortTitle = label.length > 25 ? `${label.slice(0, 23)}…` : label;
    ctx.fillText(shortTitle, canvas.width / 2, 252);
  } else {
    ctx.fillStyle = 'rgba(238, 241, 248, 0.72)';
    ctx.font = '600 19px Bahnschrift, "Segoe UI", sans-serif';
    ctx.fillText(label, canvas.width / 2, 252);
  }

  return textureFromCanvas(canvas, renderer);
}

/**
 * Tableau tactique 3D interactif posé sur la ligne de touche ouest.
 */
export function createTacticalBoard(renderer, { mobile = false } = {}) {
  const group = new THREE.Group();
  group.name = 'tableau-tactique';
  group.position.set(-42, 0, 0);
  group.rotation.y = Math.PI / 2;

  const frameMaterial = new THREE.MeshStandardMaterial({
    color: '#070B14',
    roughness: 0.55,
    metalness: 0.55,
  });
  const redMaterial = new THREE.MeshStandardMaterial({
    color: PALETTE.red,
    roughness: 0.55,
    metalness: 0.4,
  });

  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(BOARD_WIDTH + 1.2, BOARD_HEIGHT + 1.2, 0.9),
    frameMaterial,
  );
  frame.position.y = BOARD_HEIGHT / 2 + 1;
  frame.position.z = -0.55;
  group.add(frame);

  const boardTexture = createBoardTexture(renderer);
  const boardMaterial = new THREE.MeshBasicMaterial({
    map: boardTexture,
    toneMapped: false,
  });
  const board = new THREE.Mesh(new THREE.PlaneGeometry(BOARD_WIDTH, BOARD_HEIGHT), boardMaterial);
  board.position.y = BOARD_HEIGHT / 2 + 1;
  group.add(board);

  // Liseré doré.
  const goldMaterial = new THREE.MeshBasicMaterial({ color: PALETTE.gold, toneMapped: false });
  const trim = new THREE.Mesh(
    new THREE.BoxGeometry(BOARD_WIDTH + 1.4, 0.14, 0.14),
    goldMaterial,
  );
  trim.position.set(0, BOARD_HEIGHT + 1.05, 0.02);
  group.add(trim);

  // Pieds et renforts.
  [-10.5, 10.5].forEach((x) => {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.55, 2.2, 0.55), frameMaterial);
    leg.position.set(x, 0.8, -0.2);
    group.add(leg);

    const brace = new THREE.Mesh(new THREE.BoxGeometry(0.35, 3.2, 0.35), redMaterial);
    brace.rotation.z = x > 0 ? -0.5 : 0.5;
    brace.position.set(x * 0.87, 2.1, -0.2);
    group.add(brace);
  });

  const tokenGeometry = new THREE.PlaneGeometry(TOKEN_W, TOKEN_H);
  const ringGeometry = new THREE.RingGeometry(1.8, 2.1, 40);
  const tokens = [];
  const projectMeshes = [];
  let hoveredToken = null;

  FORMATION.forEach((item) => {
    const texture = createTokenTexture(renderer, item);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      alphaTest: 0.03,
      toneMapped: false,
    });
    const mesh = new THREE.Mesh(tokenGeometry, material);
    const x = item.x * 11.2;
    const y = 3.8 + item.y * 13.5;
    mesh.position.set(x, y, 0.65);
    mesh.userData = {
      type: item.type,
      projectId: item.project?.id || null,
      baseScale: 1,
      hovered: false,
      phase: Math.random() * Math.PI * 2,
    };
    group.add(mesh);
    tokens.push(mesh);
    if (item.type === 'project') projectMeshes.push(mesh);

    // Anneau lumineux autour des projets.
    if (item.type === 'project') {
      const ring = new THREE.Mesh(
        ringGeometry,
        new THREE.MeshBasicMaterial({
          color: PALETTE.gold,
          transparent: true,
          opacity: 0.55,
          side: THREE.DoubleSide,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          toneMapped: false,
        }),
      );
      ring.position.set(x, y, 0.5);
      ring.scale.setScalar(0.86);
      mesh.userData.ring = ring;
      group.add(ring);
    }
  });

  /** Met en avant un jeton, ou retire le survol. */
  function setHovered(mesh) {
    if (hoveredToken === mesh) return;
    if (hoveredToken) {
      hoveredToken.userData.hovered = false;
      hoveredToken.userData.ring?.material.color.set(PALETTE.gold);
    }
    hoveredToken = mesh || null;
    if (hoveredToken) {
      hoveredToken.userData.hovered = true;
      hoveredToken.userData.ring?.material.color.set(PALETTE.paper);
    }
  }

  function update(time) {
    tokens.forEach((token) => {
      const isProject = token.userData.type === 'project';
      const targetScale = token.userData.hovered ? 1.16 : 1;
      const current = token.scale.x;
      const next = current + (targetScale - current) * (mobile ? 0.2 : 0.12);
      token.scale.setScalar(next);

      if (isProject && token.userData.ring) {
        const pulse = 0.82 + Math.sin(time * 1.7 + token.userData.phase) * 0.08;
        token.userData.ring.scale.setScalar(pulse * (token.userData.hovered ? 1.12 : 1));
        token.userData.ring.material.opacity =
          0.35 + Math.sin(time * 1.7 + token.userData.phase) * 0.16;
      }
    });
  }

  function getProjectPosition(projectId) {
    const token = projectMeshes.find((mesh) => mesh.userData.projectId === projectId);
    if (!token) return null;
    return token.getWorldPosition(new THREE.Vector3());
  }

  return { group, tokens, projectMeshes, setHovered, update, getProjectPosition };
}
