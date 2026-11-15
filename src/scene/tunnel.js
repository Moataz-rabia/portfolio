import * as THREE from 'three';
import { content, ui } from '../data/content.js';
import {
  PALETTE,
  drawStar,
  makeCanvas,
  textureFromCanvas,
} from './assets.js';

const START_Z = 57.5;
const END_Z = 92;
const LENGTH = END_Z - START_Z;
const WIDTH = 12;
const HEIGHT = 8;

/** Enseigne du tunnel, orientée vers le terrain. */
function createTunnelSignTexture(renderer) {
  const canvas = makeCanvas(1400, 170);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#05070D';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let x = 0; x < canvas.width; x += 50) {
    ctx.fillStyle = Math.floor(x / 50) % 2 === 0
      ? 'rgba(10, 58, 140, 0.55)'
      : 'rgba(10, 10, 16, 0.55)';
    ctx.fillRect(x, 0, 50, canvas.height);
  }

  ctx.fillStyle = 'rgba(5, 7, 13, 0.6)';
  ctx.fillRect(0, 24, canvas.width, 122);
  ctx.fillStyle = PALETTE.gold;
  ctx.fillRect(0, 22, canvas.width, 3);
  ctx.fillRect(0, 145, canvas.width, 3);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = PALETTE.paper;
  ctx.font = '700 62px Bahnschrift, "Segoe UI", sans-serif';
  ctx.fillText(ui.tunnelSign, canvas.width / 2, 80);

  ctx.fillStyle = PALETTE.gold;
  drawStar(ctx, 78, 85, 18, 7.2);
  ctx.fill();
  drawStar(ctx, canvas.width - 78, 85, 18, 7.2);
  ctx.fill();

  return textureFromCanvas(canvas, renderer);
}

/** Mur latéral avec rayures et numéro de joueur (format proche du panneau 3D). */
function createWallTexture(renderer, side) {
  const canvas = makeCanvas(2048, 432);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#060A14';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let x = 0; x < canvas.width; x += 128) {
    ctx.fillStyle = Math.floor(x / 128) % 2 === 0
      ? 'rgba(10, 58, 140, 0.5)'
      : 'rgba(10, 10, 16, 0.5)';
    ctx.fillRect(x, 0, 128, canvas.height);
  }

  const shade = ctx.createLinearGradient(0, 0, 0, canvas.height);
  shade.addColorStop(0, 'rgba(5, 7, 13, 0.8)');
  shade.addColorStop(0.5, 'rgba(5, 7, 13, 0.35)');
  shade.addColorStop(1, 'rgba(5, 7, 13, 0.9)');
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = PALETTE.gold;
  ctx.fillRect(0, 0, canvas.width, 5);
  ctx.fillRect(0, canvas.height - 5, canvas.width, 5);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(238, 241, 248, 0.15)';
  ctx.font = '700 240px Bahnschrift, "Segoe UI", sans-serif';
  ctx.fillText(content.identity.number, canvas.width / 2, 232);

  ctx.fillStyle = 'rgba(238, 241, 248, 0.72)';
  ctx.font = '700 40px Bahnschrift, "Segoe UI", sans-serif';
  ctx.fillText(content.identity.name.toUpperCase(), canvas.width / 2, 68);
  ctx.fillStyle = PALETTE.gold;
  ctx.font = '600 30px Bahnschrift, "Segoe UI", sans-serif';
  ctx.fillText(
    side === 'left'
      ? `${content.identity.position} · ${ui.loaderBadge.toUpperCase()}`
      : ui.searchValue.toUpperCase(),
    canvas.width / 2,
    380,
  );

  return textureFromCanvas(canvas, renderer);
}

/** Cercle de lumière au bout du tunnel. */
function createExitTexture(renderer) {
  const canvas = makeCanvas(512, 512);
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 250);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.24, 'rgba(238, 241, 248, 0.95)');
  gradient.addColorStop(0.5, 'rgba(212, 175, 55, 0.5)');
  gradient.addColorStop(0.78, 'rgba(20, 86, 200, 0.18)');
  gradient.addColorStop(1, 'rgba(20, 86, 200, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 512);
  return textureFromCanvas(canvas, renderer);
}

/**
 * Tunnel des joueurs : couloir sombre, structure rouge et lumière dorée au bout.
 */
export function createTunnel(renderer, { mobile = false } = {}) {
  const group = new THREE.Group();
  group.name = 'tunnel';
  const centerZ = (START_Z + END_Z) / 2;

  const wallMaterial = new THREE.MeshStandardMaterial({
    color: '#05080F',
    roughness: 0.9,
    metalness: 0.15,
  });
  const floorMaterial = new THREE.MeshStandardMaterial({
    color: '#080D17',
    roughness: 0.8,
    metalness: 0.15,
  });
  const redMaterial = new THREE.MeshStandardMaterial({
    color: PALETTE.red,
    roughness: 0.55,
    metalness: 0.4,
  });
  const goldMaterial = new THREE.MeshBasicMaterial({ color: PALETTE.gold, toneMapped: false });
  const blueMaterial = new THREE.MeshBasicMaterial({ color: PALETTE.blueBright, toneMapped: false });

  const floor = new THREE.Mesh(new THREE.BoxGeometry(WIDTH, 0.2, LENGTH), floorMaterial);
  floor.position.set(0, 0.1, centerZ);
  group.add(floor);

  const ceiling = new THREE.Mesh(new THREE.BoxGeometry(WIDTH + 0.6, 0.5, LENGTH), wallMaterial);
  ceiling.position.set(0, HEIGHT + 0.25, centerZ);
  group.add(ceiling);

  [-1, 1].forEach((side) => {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(0.6, HEIGHT, LENGTH), wallMaterial);
    wall.position.set(side * (WIDTH / 2 + 0.3), HEIGHT / 2, centerZ);
    group.add(wall);

    const banner = new THREE.Mesh(
      new THREE.PlaneGeometry(LENGTH * 0.9, HEIGHT * 0.82),
      new THREE.MeshBasicMaterial({
        map: createWallTexture(renderer, side < 0 ? 'left' : 'right'),
        toneMapped: false,
      }),
    );
    banner.position.set(side * (WIDTH / 2 - 0.01), HEIGHT / 2, centerZ);
    banner.rotation.y = side < 0 ? Math.PI / 2 : -Math.PI / 2;
    group.add(banner);

    // Ligne dorée et liseré bleu au sol/mur.
    const goldLine = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, LENGTH), goldMaterial);
    goldLine.position.set(side * (WIDTH / 2 - 0.4), 0.28, centerZ);
    group.add(goldLine);

    const blueLine = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, LENGTH), blueMaterial);
    blueLine.position.set(side * (WIDTH / 2 - 0.45), HEIGHT - 0.25, centerZ);
    group.add(blueLine);
  });

  // Nervures rouges.
  for (let z = START_Z + 2.5; z <= END_Z - 1.5; z += 6.5) {
    const top = new THREE.Mesh(new THREE.BoxGeometry(WIDTH + 0.7, 0.22, 0.22), redMaterial);
    top.position.set(0, HEIGHT - 0.15, z);
    group.add(top);

    [-1, 1].forEach((side) => {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.2, HEIGHT, 0.22), redMaterial);
      post.position.set(side * (WIDTH / 2 - 0.25), HEIGHT / 2, z);
      group.add(post);
    });
  }

  // Ligne centrale du couloir.
  const centerLine = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.02, LENGTH - 2),
    goldMaterial,
  );
  centerLine.position.set(0, 0.21, centerZ);
  group.add(centerLine);

  // Portique d'entrée.
  [-1, 1].forEach((side) => {
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.5, HEIGHT + 1.2, 0.5), wallMaterial);
    pillar.position.set(side * (WIDTH / 2 + 0.3), (HEIGHT + 1.2) / 2, START_Z);
    group.add(pillar);

    const trim = new THREE.Mesh(new THREE.BoxGeometry(0.12, HEIGHT + 1.2, 0.12), goldMaterial);
    trim.position.set(side * (WIDTH / 2 + 0.05), (HEIGHT + 1.2) / 2, START_Z - 0.28);
    group.add(trim);
  });

  const lintel = new THREE.Mesh(new THREE.BoxGeometry(WIDTH + 1.5, 0.5, 0.55), wallMaterial);
  lintel.position.set(0, HEIGHT + 1.05, START_Z);
  group.add(lintel);

  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(11, 1.35),
    new THREE.MeshBasicMaterial({
      map: createTunnelSignTexture(renderer),
      toneMapped: false,
    }),
  );
  sign.position.set(0, HEIGHT + 2.1, START_Z - 0.05);
  sign.rotation.y = Math.PI;
  group.add(sign);

  // Mur du fond et lumière de sortie.
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(WIDTH + 1, HEIGHT + 0.8, 0.5), wallMaterial);
  backWall.position.set(0, HEIGHT / 2, END_Z + 0.35);
  group.add(backWall);

  const exitTexture = createExitTexture(renderer);
  const exit = new THREE.Mesh(
    new THREE.PlaneGeometry(WIDTH - 0.9, HEIGHT - 0.8),
    new THREE.MeshBasicMaterial({
      map: exitTexture,
      transparent: true,
      toneMapped: false,
      side: THREE.DoubleSide,
    }),
  );
  exit.position.set(0, HEIGHT / 2, END_Z + 0.02);
  exit.rotation.y = Math.PI;
  group.add(exit);

  const exitGlow = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: exitTexture,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    }),
  );
  exitGlow.scale.set(22, 16, 1);
  exitGlow.position.set(0, HEIGHT / 2, END_Z - 1.5);
  group.add(exitGlow);

  const exitLight = new THREE.PointLight(0xffe0b0, mobile ? 180 : 320, 36, 2);
  exitLight.position.set(0, HEIGHT / 2, END_Z - 3);
  group.add(exitLight);

  // Lumières douces le long du couloir.
  const strips = [];
  for (let z = START_Z + 3; z < END_Z - 2; z += 5.5) {
    [-1, 1].forEach((side) => {
      const strip = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.18, 1.4), blueMaterial);
      strip.position.set(side * (WIDTH / 2 - 0.42), HEIGHT - 0.55, z);
      group.add(strip);
      strips.push(strip);
    });
  }

  function update(time) {
    exitGlow.material.opacity = 0.72 + Math.sin(time * 1.4) * 0.1;
    exitLight.intensity = (mobile ? 180 : 320) + Math.sin(time * 1.7) * 35;
    strips.forEach((strip, index) => {
      strip.scale.y = 0.9 + Math.sin(time * 2.4 + index) * 0.12;
    });
  }

  return { group, update };
}
