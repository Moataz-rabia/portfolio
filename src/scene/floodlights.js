import * as THREE from 'three';
import { PALETTE, drawStar, makeCanvas, textureFromCanvas } from './assets.js';

const POSITIONS = [
  [-54, -70],
  [54, -70],
  [-54, 70],
  [54, 70],
];

/** Texture de halo doux pour les projecteurs. */
function createHaloTexture(renderer) {
  const canvas = makeCanvas(256, 256);
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
  gradient.addColorStop(0.16, 'rgba(210, 228, 255, 0.55)');
  gradient.addColorStop(0.42, 'rgba(140, 180, 255, 0.18)');
  gradient.addColorStop(1, 'rgba(20, 86, 200, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);
  return textureFromCanvas(canvas, renderer);
}

/** Texture de la face lumineuse d'un projecteur. */
function createLampTexture(renderer) {
  const canvas = makeCanvas(384, 160);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#05070D';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
  ctx.lineWidth = 3;
  ctx.strokeRect(6, 6, canvas.width - 12, canvas.height - 12);

  for (let row = 0; row < 2; row += 1) {
    for (let col = 0; col < 4; col += 1) {
      const x = 60 + col * 88;
      const y = 52 + row * 56;
      const glow = ctx.createRadialGradient(x, y, 0, x, y, 34);
      glow.addColorStop(0, 'rgba(255, 255, 255, 1)');
      glow.addColorStop(0.45, 'rgba(230, 240, 255, 0.9)');
      glow.addColorStop(1, 'rgba(180, 210, 255, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, 32, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(238, 241, 248, 0.95)';
      ctx.beginPath();
      ctx.arc(x, y, 11, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.fillStyle = PALETTE.gold;
  drawStar(ctx, canvas.width / 2, 20, 8, 3.2);
  ctx.fill();

  return textureFromCanvas(canvas, renderer);
}

/**
 * Quatre projecteurs de stade avec mât, panneau lumineux, halo et faisceau très léger.
 */
export function createFloodlights(renderer, { mobile = false } = {}) {
  const group = new THREE.Group();
  group.name = 'projecteurs';

  const haloTexture = createHaloTexture(renderer);
  const lampTexture = createLampTexture(renderer);
  const metal = new THREE.MeshStandardMaterial({
    color: '#0B1220',
    roughness: 0.6,
    metalness: 0.55,
  });
  const beamMaterial = new THREE.MeshBasicMaterial({
    color: 0x9fc4ff,
    transparent: true,
    opacity: mobile ? 0.012 : 0.028,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
    toneMapped: false,
  });

  const lightUnits = [];
  const headHeight = 31;

  POSITIONS.forEach(([x, z], index) => {
    const mast = new THREE.Mesh(
      new THREE.CylinderGeometry(0.32, 0.55, headHeight, 8),
      metal,
    );
    mast.position.set(x, headHeight / 2, z);
    mast.castShadow = false;
    group.add(mast);

    const base = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.9, 1.2, 8), metal);
    base.position.set(x, 0.6, z);
    group.add(base);

    const head = new THREE.Group();
    head.position.set(x, headHeight, z);
    head.rotation.y = Math.atan2(-x, -z);

    const backing = new THREE.Mesh(new THREE.BoxGeometry(6.6, 3.2, 0.55), metal);
    backing.position.z = -0.15;
    head.add(backing);

    const lampMaterial = new THREE.MeshBasicMaterial({
      map: lampTexture,
      toneMapped: false,
    });
    const lamp = new THREE.Mesh(new THREE.PlaneGeometry(6.2, 3), lampMaterial);
    lamp.position.z = 0.18;
    head.add(lamp);

    const haloMaterial = new THREE.SpriteMaterial({
      map: haloTexture,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    });
    const halo = new THREE.Sprite(haloMaterial);
    halo.scale.set(20, 20, 1);
    halo.position.set(0, 0.2, 2.4);
    head.add(halo);

    group.add(head);

    // Faisceau volumétrique très discret vers le centre du terrain.
    const target = new THREE.Vector3(0, 0, 0);
    const headPosition = new THREE.Vector3(x, headHeight, z);
    const direction = headPosition.clone().sub(target);
    const distance = direction.length();
    const beamLength = distance * 0.94;
    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.55, 10, beamLength, 14, 1, true),
      beamMaterial,
    );
    direction.normalize();
    beam.position.copy(headPosition).addScaledVector(direction, -beamLength / 2);
    beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
    group.add(beam);

    lightUnits.push({
      halo,
      lampMaterial,
      phase: index * 1.73,
    });
  });

  /** Vacillement à peine perceptible, comme des projecteurs sous tension. */
  function update(time) {
    lightUnits.forEach((unit) => {
      const slow = Math.sin(time * 2.1 + unit.phase) * 0.5 + 0.5;
      const fast = Math.sin(time * 19 + unit.phase * 3) * 0.5 + 0.5;
      const flicker = slow * 0.035 + fast * 0.012;
      unit.halo.material.opacity = 0.46 + flicker;
      unit.lampMaterial.color.setScalar(0.9 + flicker * 1.8);
    });
  }

  return { group, update };
}
