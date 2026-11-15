import * as THREE from 'three';
import gsap from 'gsap';
import { content, ui } from '../data/content.js';
import {
  PALETTE,
  drawStar,
  makeCanvas,
  roundRectPath,
  textureFromCanvas,
  wrapText,
} from './assets.js';

const LOCKER_W = 3.6;
const LOCKER_H = 6.5;
const WALL_W = LOCKER_W * content.skillGroups.length;
const WALL_H = 7.6;

/** Porte de casier fermée : rayures, numéro et nom de la catégorie. */
function createDoorTexture(renderer, group) {
  const canvas = makeCanvas(384, 768);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = PALETTE.ink;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let x = 0; x < canvas.width; x += 46) {
    ctx.fillStyle = Math.floor(x / 46) % 2 === 0
      ? 'rgba(10, 58, 140, 0.9)'
      : 'rgba(10, 10, 16, 0.9)';
    ctx.fillRect(x, 0, 46, canvas.height);
  }

  const shade = ctx.createLinearGradient(0, 0, 0, canvas.height);
  shade.addColorStop(0, 'rgba(10, 10, 16, 0.25)');
  shade.addColorStop(0.55, 'rgba(10, 10, 16, 0.35)');
  shade.addColorStop(1, 'rgba(10, 10, 16, 0.85)');
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = PALETTE.gold;
  ctx.lineWidth = 5;
  roundRectPath(ctx, 14, 14, canvas.width - 28, canvas.height - 28, 18);
  ctx.stroke();

  ctx.fillStyle = 'rgba(238, 241, 248, 0.62)';
  ctx.font = '700 18px Bahnschrift, "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(ui.lockerDoorTop, canvas.width / 2, 74);

  ctx.fillStyle = PALETTE.gold;
  ctx.font = '700 108px Bahnschrift, "Segoe UI", sans-serif';
  ctx.fillText(group.number, canvas.width / 2, 170);

  ctx.fillStyle = PALETTE.gold;
  drawStar(ctx, canvas.width / 2, 272, 22, 8.8);
  ctx.fill();

  ctx.fillStyle = PALETTE.paper;
  const words = group.short.toUpperCase().split(' ');
  ctx.font = '700 50px Bahnschrift, "Segoe UI", sans-serif';
  words.forEach((word, index) => {
    ctx.fillText(word, canvas.width / 2, 370 + index * 56);
  });

  ctx.fillStyle = 'rgba(238, 241, 248, 0.62)';
  ctx.font = '600 18px Bahnschrift, "Segoe UI", sans-serif';
  const label = group.title.toUpperCase();
  const lines = label.length > 22 ? [label.slice(0, 21), `${label.slice(21)}`] : [label];
  lines.forEach((line, index) => {
    ctx.fillText(line, canvas.width / 2, 545 + index * 28);
  });

  ctx.fillStyle = PALETTE.gold;
  ctx.fillRect(90, 650, canvas.width - 180, 2);
  ctx.fillStyle = 'rgba(238, 241, 248, 0.45)';
  ctx.font = '600 16px Bahnschrift, "Segoe UI", sans-serif';
  ctx.fillText(`${group.items.length} ${ui.itemsLabel}`, canvas.width / 2, 690);

  return textureFromCanvas(canvas, renderer);
}

/** Intérieur du casier, lisible quand la porte s'ouvre. */
function createInteriorTexture(renderer, group) {
  const canvas = makeCanvas(512, 1024);
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#071126');
  gradient.addColorStop(1, '#03060D');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
  ctx.lineWidth = 4;
  ctx.strokeRect(16, 16, canvas.width - 32, canvas.height - 32);

  ctx.fillStyle = PALETTE.gold;
  ctx.font = '700 30px Bahnschrift, "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${ui.categoryLabel} ${group.number}`, canvas.width / 2, 90);

  ctx.fillStyle = PALETTE.paper;
  ctx.font = '700 45px Bahnschrift, "Segoe UI", sans-serif';
  wrapText(ctx, group.title, canvas.width / 2, 180, canvas.width - 70, 54, 3);

  ctx.fillStyle = PALETTE.gold;
  drawStar(ctx, canvas.width / 2, 390, 24, 9.6);
  ctx.fill();

  // Liste des compétences, en étiquettes sobres.
  ctx.textAlign = 'left';
  let y = 480;
  group.items.forEach((item) => {
    ctx.fillStyle = 'rgba(20, 86, 200, 0.28)';
    roundRectPath(ctx, 48, y - 27, canvas.width - 96, 48, 12);
    ctx.fill();
    ctx.strokeStyle = 'rgba(20, 86, 200, 0.65)';
    ctx.lineWidth = 1.5;
    roundRectPath(ctx, 48, y - 27, canvas.width - 96, 48, 12);
    ctx.stroke();

    ctx.fillStyle = PALETTE.paper;
    ctx.font = '600 22px Bahnschrift, "Segoe UI", sans-serif';
    ctx.fillText(item, 68, y);
    y += 62;
  });

  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(238, 241, 248, 0.45)';
  ctx.font = '600 18px Bahnschrift, "Segoe UI", sans-serif';
  ctx.fillText(
    `${content.identity.name.toUpperCase()} · ${content.identity.position} · ${content.identity.number}`,
    canvas.width / 2,
    canvas.height - 42,
  );

  return textureFromCanvas(canvas, renderer);
}

/** Enseigne lumineuse au-dessus des casiers. */
function createSignTexture(renderer) {
  const canvas = makeCanvas(1600, 150);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#05070D';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let x = 0; x < canvas.width; x += 52) {
    ctx.fillStyle = Math.floor(x / 52) % 2 === 0
      ? 'rgba(10, 58, 140, 0.5)'
      : 'rgba(10, 10, 16, 0.5)';
    ctx.fillRect(x, 0, 52, canvas.height);
  }

  ctx.fillStyle = 'rgba(5, 7, 13, 0.55)';
  ctx.fillRect(0, 20, canvas.width, 110);
  ctx.fillStyle = PALETTE.gold;
  ctx.fillRect(0, 18, canvas.width, 3);
  ctx.fillRect(0, 129, canvas.width, 3);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = PALETTE.paper;
  ctx.font = '700 56px Bahnschrift, "Segoe UI", sans-serif';
  ctx.fillText(ui.lockerSign, canvas.width / 2, 74);

  ctx.fillStyle = PALETTE.gold;
  drawStar(ctx, 70, 74, 16, 6.4);
  ctx.fill();
  drawStar(ctx, canvas.width - 70, 74, 16, 6.4);
  ctx.fill();

  return textureFromCanvas(canvas, renderer);
}

/**
 * Vestiaire : cinq casiers dont les portes s'ouvrent au survol.
 */
export function createLockers(renderer, { mobile = false } = {}) {
  const group = new THREE.Group();
  group.name = 'vestiaire';
  group.position.set(41, 0, 0);
  group.rotation.y = -Math.PI / 2;

  const frameMaterial = new THREE.MeshStandardMaterial({
    color: '#0A0F1D',
    roughness: 0.65,
    metalness: 0.45,
  });
  const goldMaterial = new THREE.MeshBasicMaterial({ color: PALETTE.gold, toneMapped: false });

  const backdrop = new THREE.Mesh(
    new THREE.BoxGeometry(WALL_W + 0.8, WALL_H + 0.8, 0.5),
    frameMaterial,
  );
  backdrop.position.set(0, WALL_H / 2, -0.62);
  group.add(backdrop);

  const topRail = new THREE.Mesh(new THREE.BoxGeometry(WALL_W + 0.9, 0.22, 0.95), frameMaterial);
  topRail.position.set(0, WALL_H + 0.05, -0.1);
  group.add(topRail);

  const bottomRail = new THREE.Mesh(new THREE.BoxGeometry(WALL_W + 0.9, 0.35, 1), frameMaterial);
  bottomRail.position.set(0, 0.25, -0.1);
  group.add(bottomRail);

  const signTexture = createSignTexture(renderer);
  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(16.5, 1.55),
    new THREE.MeshBasicMaterial({ map: signTexture, toneMapped: false }),
  );
  sign.position.set(0, WALL_H + 1.25, 0.4);
  group.add(sign);

  const signGlow = new THREE.Mesh(
    new THREE.BoxGeometry(16.5, 0.06, 0.06),
    goldMaterial,
  );
  signGlow.position.set(0, WALL_H + 0.45, 0.45);
  group.add(signGlow);

  const doors = [];
  const lightStrips = [];
  const doorGeometry = new THREE.PlaneGeometry(LOCKER_W - 0.22, LOCKER_H - 0.18);
  const interiorGeometry = new THREE.PlaneGeometry(LOCKER_W - 0.3, LOCKER_H - 0.3);

  content.skillGroups.forEach((skillGroup, index) => {
    const centerX = -WALL_W / 2 + LOCKER_W * (index + 0.5);

    // Séparateurs verticaux.
    if (index > 0) {
      const divider = new THREE.Mesh(
        new THREE.BoxGeometry(0.16, WALL_H + 0.1, 0.95),
        frameMaterial,
      );
      divider.position.set(centerX - LOCKER_W / 2, WALL_H / 2, -0.05);
      group.add(divider);
    }

    const interior = new THREE.Mesh(
      interiorGeometry,
      new THREE.MeshBasicMaterial({
        map: createInteriorTexture(renderer, skillGroup),
        toneMapped: false,
      }),
    );
    interior.position.set(centerX, WALL_H / 2 - 0.25, 0.02);
    group.add(interior);

    // Pivot de charnière à gauche.
    const pivot = new THREE.Group();
    pivot.position.set(centerX - (LOCKER_W - 0.22) / 2, WALL_H / 2 - 0.25, 0.55);
    group.add(pivot);

    const door = new THREE.Mesh(
      doorGeometry,
      new THREE.MeshBasicMaterial({
        map: createDoorTexture(renderer, skillGroup),
        side: THREE.DoubleSide,
        toneMapped: false,
      }),
    );
    door.position.set((LOCKER_W - 0.22) / 2, 0, 0);
    door.userData = {
      type: 'locker',
      groupId: skillGroup.id,
      index,
      pivot,
      open: false,
    };
    pivot.add(door);
    doors.push(door);

    // Poignée dorée.
    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.55, 0.09), goldMaterial);
    handle.position.set(LOCKER_W - 0.55, -0.9, 0.08);
    pivot.add(handle);

    // Liseré lumineux au-dessus de la porte.
    const strip = new THREE.Mesh(
      new THREE.BoxGeometry(LOCKER_W - 0.4, 0.07, 0.07),
      new THREE.MeshBasicMaterial({
        color: PALETTE.blueBright,
        transparent: true,
        opacity: 0.8,
        toneMapped: false,
      }),
    );
    strip.position.set(centerX, WALL_H - 0.1, 0.5);
    group.add(strip);
    lightStrips.push(strip);

    // Petit numéro doré au-dessus.
    const star = new THREE.Mesh(
      new THREE.CircleGeometry(0.11, 12),
      goldMaterial,
    );
    star.position.set(centerX, WALL_H + 0.15, 0.52);
    group.add(star);
  });

  let hoveredDoor = null;

  function openDoor(door) {
    if (!door || door.userData.open) return;
    door.userData.open = true;
    gsap.to(door.userData.pivot.rotation, {
      y: -1.32,
      duration: mobile ? 0.35 : 0.65,
      ease: 'power3.out',
      overwrite: true,
    });
  }

  function closeDoor(door) {
    if (!door || !door.userData.open) return;
    door.userData.open = false;
    gsap.to(door.userData.pivot.rotation, {
      y: 0,
      duration: mobile ? 0.3 : 0.55,
      ease: 'power2.inOut',
      overwrite: true,
    });
  }

  /** Ouvre le casier survolé et referme le précédent. */
  function setHovered(door) {
    if (hoveredDoor === door) return;
    if (hoveredDoor) closeDoor(hoveredDoor);
    hoveredDoor = door || null;
    if (hoveredDoor) openDoor(hoveredDoor);
  }

  function openLocker(index) {
    const door = doors.find((item) => item.userData.index === index);
    setHovered(door);
  }

  function closeAll() {
    setHovered(null);
  }

  function update(time) {
    lightStrips.forEach((strip, index) => {
      strip.material.opacity = 0.55 + Math.sin(time * 2 + index * 0.7) * 0.18;
    });
  }

  return { group, doors, setHovered, openLocker, closeAll, update };
}
