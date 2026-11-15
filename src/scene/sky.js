import * as THREE from 'three';
import { makeCanvas, textureFromCanvas, seededRandom, drawStar, PALETTE } from './assets.js';

/**
 * Ciel de soirée généré localement : dégradé bleu nuit, étoiles et lune discrète.
 * Aucune texture externe n'est nécessaire.
 */
export function createSky(renderer, { mobile = false } = {}) {
  const width = mobile ? 1024 : 2048;
  const height = width / 2;
  const canvas = makeCanvas(width, height);
  const ctx = canvas.getContext('2d');
  const random = seededRandom(2027);

  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#01030A');
  gradient.addColorStop(0.28, '#04102B');
  gradient.addColorStop(0.47, '#0A2B63');
  gradient.addColorStop(0.54, '#0A3A8C');
  gradient.addColorStop(0.6, '#07152F');
  gradient.addColorStop(1, '#05060C');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Halo froid au-dessus de l'horizon, rappel des projecteurs.
  const haze = ctx.createRadialGradient(width * 0.5, height * 0.53, 0, width * 0.5, height * 0.53, width * 0.42);
  haze.addColorStop(0, 'rgba(20, 86, 200, 0.28)');
  haze.addColorStop(0.55, 'rgba(10, 58, 140, 0.1)');
  haze.addColorStop(1, 'rgba(10, 58, 140, 0)');
  ctx.fillStyle = haze;
  ctx.fillRect(0, 0, width, height);

  // Étoiles.
  ctx.save();
  for (let i = 0; i < (mobile ? 220 : 520); i += 1) {
    const x = random() * width;
    const y = random() * height * 0.46;
    const radius = random() * 1.5 + 0.35;
    const alpha = 0.25 + random() * 0.75;
    ctx.fillStyle = random() > 0.88
      ? `rgba(212, 175, 55, ${alpha})`
      : `rgba(238, 241, 248, ${alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    if (radius > 1.35) {
      ctx.fillStyle = `rgba(238, 241, 248, ${alpha * 0.08})`;
      ctx.beginPath();
      ctx.arc(x, y, radius * 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  // Lune stylisée.
  const moonX = width * 0.76;
  const moonY = height * 0.16;
  const moonGlow = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, 110);
  moonGlow.addColorStop(0, 'rgba(238, 241, 248, 0.85)');
  moonGlow.addColorStop(0.2, 'rgba(238, 241, 248, 0.22)');
  moonGlow.addColorStop(1, 'rgba(238, 241, 248, 0)');
  ctx.fillStyle = moonGlow;
  ctx.fillRect(moonX - 130, moonY - 130, 260, 260);
  ctx.fillStyle = 'rgba(238, 241, 248, 0.9)';
  ctx.beginPath();
  ctx.arc(moonX, moonY, 26, 0, Math.PI * 2);
  ctx.fill();

  // Étoile dorée filante, discrète.
  ctx.save();
  ctx.translate(width * 0.24, height * 0.13);
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.35)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-38, 0);
  ctx.lineTo(38, 0);
  ctx.moveTo(0, -38);
  ctx.lineTo(0, 38);
  ctx.stroke();
  ctx.fillStyle = 'rgba(212, 175, 55, 0.55)';
  drawStar(ctx, 0, 0, 11, 4.4);
  ctx.fill();
  ctx.restore();

  const texture = textureFromCanvas(canvas, renderer);
  texture.wrapS = THREE.RepeatWrapping;
  const geometry = new THREE.SphereGeometry(420, mobile ? 24 : 40, mobile ? 12 : 20);
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.BackSide,
    fog: false,
    depthWrite: false,
    toneMapped: false,
  });
  material.color.set(PALETTE.paper);
  const sky = new THREE.Mesh(geometry, material);
  sky.name = 'ciel';
  sky.renderOrder = -2;
  return sky;
}
