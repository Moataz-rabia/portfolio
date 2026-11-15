import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { PALETTE, seededRandom } from './assets.js';

const CONFIGS = [
  { id: 'nord', length: 116, position: [0, 0, -57], rotation: 0, gap: 0, seed: 11 },
  { id: 'sud', length: 116, position: [0, 0, 57], rotation: Math.PI, gap: 14, seed: 22 },
  { id: 'est', length: 114, position: [45, 0, 0], rotation: -Math.PI / 2, gap: 0, seed: 33 },
  { id: 'ouest', length: 114, position: [-45, 0, 0], rotation: Math.PI / 2, gap: 0, seed: 44 },
];

const ROWS = 8;
const ROW_DEPTH = 2.8;
const ROW_HEIGHT = 2.5;
const START_Y = 1.1;
const SEAT_GAP = 1.05;
const MOBILE_SEAT_STEP = 2.1;

/** Géométrie d'un siège simple : assise + dossier. */
function createSeatGeometry() {
  const base = new THREE.BoxGeometry(0.42, 0.1, 0.4);
  base.translate(0, 0.05, 0);
  const back = new THREE.BoxGeometry(0.42, 0.42, 0.09);
  back.translate(0, 0.29, -0.16);
  return mergeGeometries([base, back], false);
}

/** Silhouette de spectateur, utilisée en InstancedMesh animé. */
function createCrowdGeometry() {
  const body = new THREE.CapsuleGeometry(0.15, 0.24, 2, 5);
  body.translate(0, 0.32, 0);
  const head = new THREE.SphereGeometry(0.13, 6, 4);
  head.translate(0, 0.71, 0);
  return mergeGeometries([body, head], false);
}

/** Découpe une rangée en deux segments autour d'un passage central. */
function getSegments(length, gap) {
  if (!gap) return [{ center: 0, length }];
  const segmentLength = (length - gap) / 2;
  return [
    { center: -(gap / 2 + segmentLength / 2), length: segmentLength },
    { center: gap / 2 + segmentLength / 2, length: segmentLength },
  ];
}

/**
 * Construit une tribune : marches en béton, sièges instanciés et foule animée.
 * Le groupe retourné est orienté vers le terrain (axe local +Z).
 */
function buildStand(config, seatGeometry, crowdGeometry, { mobile, seatMaterial, crowdMaterial }) {
  const random = seededRandom(config.seed);
  const group = new THREE.Group();
  group.name = `tribune-${config.id}`;

  const concrete = new THREE.MeshStandardMaterial({
    color: '#141B2E',
    roughness: 0.92,
    metalness: 0.04,
  });
  const accent = new THREE.MeshStandardMaterial({
    color: PALETTE.blue,
    emissive: PALETTE.blue,
    emissiveIntensity: 0.22,
    roughness: 0.7,
  });

  const segments = getSegments(config.length, config.gap);
  const depth = ROWS * ROW_DEPTH;
  const totalHeight = START_Y + ROWS * ROW_HEIGHT;
  const seatSpots = [];

  // Marches.
  for (let row = 0; row < ROWS; row += 1) {
    const y = START_Y + row * ROW_HEIGHT + ROW_HEIGHT / 2;
    const z = -(row + 0.5) * ROW_DEPTH;
    segments.forEach((segment) => {
      const step = new THREE.Mesh(
        new THREE.BoxGeometry(segment.length, ROW_HEIGHT, ROW_DEPTH),
        concrete,
      );
      step.position.set(segment.center, y, z);
      step.receiveShadow = !mobile;
      step.castShadow = false;
      group.add(step);
    });
  }

  // Mur arrière et mur de touche, avec ouverture pour le tunnel sud.
  segments.forEach((segment) => {
    const backWall = new THREE.Mesh(
      new THREE.BoxGeometry(segment.length, totalHeight + 1.2, 1.6),
      concrete,
    );
    backWall.position.set(segment.center, (totalHeight + 1.2) / 2, -depth - 0.8);
    backWall.receiveShadow = !mobile;
    group.add(backWall);

    const frontWall = new THREE.Mesh(
      new THREE.BoxGeometry(segment.length, 2.2, 0.9),
      concrete,
    );
    frontWall.position.set(segment.center, 1.1, 0.4);
    frontWall.receiveShadow = !mobile;
    group.add(frontWall);
  });

  // Liseré bleu sur le mur de touche.
  segments.forEach((segment) => {
    const strip = new THREE.Mesh(
      new THREE.BoxGeometry(segment.length, 0.16, 0.1),
      accent,
    );
    strip.position.set(segment.center, 2.15, 0.9);
    group.add(strip);
  });

  // Collecte des positions de sièges.
  for (let row = 0; row < ROWS; row += 1) {
    const y = START_Y + (row + 1) * ROW_HEIGHT;
    const z = -(row + 0.55) * ROW_DEPTH;
    const step = mobile ? MOBILE_SEAT_STEP : SEAT_GAP;
    for (let x = -config.length / 2 + 1.2; x <= config.length / 2 - 1.2; x += step) {
      if (config.gap && Math.abs(x) < config.gap / 2 + 0.9) continue;
      seatSpots.push({
        x,
        y,
        z,
        color: chooseSeatColor(x, row, random, config),
        crowd: random() < (mobile ? 0 : 0.4),
        phase: random() * Math.PI * 2,
        scale: 0.85 + random() * 0.3,
      });
    }
  }

  // Sièges.
  const seats = new THREE.InstancedMesh(seatGeometry, seatMaterial, seatSpots.length);
  seats.name = `sieges-${config.id}`;
  const dummy = new THREE.Object3D();
  const color = new THREE.Color();
  seatSpots.forEach((spot, index) => {
    dummy.position.set(spot.x, spot.y, spot.z);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.setScalar(1);
    dummy.updateMatrix();
    seats.setMatrixAt(index, dummy.matrix);
    seats.setColorAt(index, color.set(spot.color));
  });
  seats.instanceMatrix.needsUpdate = true;
  if (seats.instanceColor) seats.instanceColor.needsUpdate = true;
  seats.castShadow = false;
  seats.receiveShadow = !mobile;
  group.add(seats);

  // Foule animée (uniquement sur les appareils confortables).
  let crowd = null;
  let crowdData = null;
  if (!mobile) {
    const candidates = seatSpots.filter((spot) => spot.crowd);
    const count = Math.min(candidates.length, Math.floor(seatSpots.length * 0.38));
    if (count > 0) {
      crowd = new THREE.InstancedMesh(crowdGeometry, crowdMaterial, count);
      crowd.name = `foule-${config.id}`;
      crowdData = [];
      for (let i = 0; i < count; i += 1) {
        const spot = candidates[i % candidates.length];
        crowdData.push({
          x: spot.x + (random() - 0.5) * 0.14,
          y: spot.y + 0.1,
          z: spot.z,
          phase: spot.phase,
          scale: spot.scale,
        });
        crowd.setColorAt(
          i,
          color.set(spot.color === PALETTE.gold ? PALETTE.paper : spot.color),
        );
      }
      dummy.position.set(0, 0, 0);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      for (let i = 0; i < count; i += 1) crowd.setMatrixAt(i, dummy.matrix);
      if (crowd.instanceColor) crowd.instanceColor.needsUpdate = true;
      crowd.instanceMatrix.needsUpdate = true;
      crowd.castShadow = false;
      crowd.frustumCulled = false;
      group.add(crowd);
    }
  }

  group.position.set(...config.position);
  group.rotation.y = config.rotation;

  return { group, seatCount: seatSpots.length, crowd, crowdData };
}

/** Alterne rayures noires / bleues, avec quelques touches blanches et dorées. */
function chooseSeatColor(x, row, random, config) {
  const stripe = Math.floor((x + config.length / 2) / 3.4);
  const roll = random();
  if (roll < 0.012) return PALETTE.gold;
  if (roll < 0.055) return PALETTE.paper;
  if (row === 3 && roll < 0.1) return PALETTE.paper;
  return stripe % 2 === 0 ? PALETTE.blue : PALETTE.ink;
}

/**
 * Crée les quatre tribunes en anneau et retourne la fonction d'animation de la foule.
 */
export function createStands(renderer, { mobile = false } = {}) {
  const group = new THREE.Group();
  group.name = 'tribunes';

  const seatGeometry = createSeatGeometry();
  const crowdGeometry = createCrowdGeometry();
  const seatMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.82,
    metalness: 0.08,
  });
  const crowdMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 1,
    metalness: 0,
  });

  const crowdStands = [];
  let seatCount = 0;

  CONFIGS.forEach((config) => {
    const stand = buildStand(config, seatGeometry, crowdGeometry, {
      mobile,
      seatMaterial,
      crowdMaterial,
    });
    group.add(stand.group);
    seatCount += stand.seatCount;
    if (stand.crowd) crowdStands.push(stand);
  });

  // Structures sombres dans les angles, pour fermer visuellement l'anneau.
  const cornerMaterial = new THREE.MeshStandardMaterial({
    color: '#080D18',
    roughness: 0.95,
  });
  const cornerAccent = new THREE.MeshStandardMaterial({
    color: PALETTE.gold,
    emissive: PALETTE.gold,
    emissiveIntensity: 0.35,
    roughness: 0.5,
  });
  [
    [-54, -63],
    [54, -63],
    [-54, 63],
    [54, 63],
  ].forEach(([x, z]) => {
    const block = new THREE.Mesh(new THREE.BoxGeometry(13, 17, 13), cornerMaterial);
    block.position.set(x, 8.5, z);
    block.receiveShadow = !mobile;
    group.add(block);

    const goldLine = new THREE.Mesh(new THREE.BoxGeometry(13.2, 0.18, 0.18), cornerAccent);
    goldLine.position.set(x, 16.2, z + (z > 0 ? -6.55 : 6.55));
    group.add(goldLine);
  });

  const dummy = new THREE.Object3D();

  /** Ondulation très légère de la foule, façon stade vivant. */
  function update(time) {
    if (mobile) return;
    crowdStands.forEach((stand) => {
      const { crowd, crowdData } = stand;
      if (!crowd || !crowdData) return;
      for (let i = 0; i < crowdData.length; i += 1) {
        const person = crowdData[i];
        const wave =
          Math.sin(time * 1.55 + person.x * 0.22 + person.z * 0.13 + person.phase) * 0.055;
        dummy.position.set(person.x, person.y + wave, person.z);
        dummy.rotation.set(0, Math.sin(time * 0.7 + person.phase) * 0.05, 0);
        dummy.scale.setScalar(person.scale);
        dummy.updateMatrix();
        crowd.setMatrixAt(i, dummy.matrix);
      }
      crowd.instanceMatrix.needsUpdate = true;
    });
  }

  return { group, update, seatCount };
}
