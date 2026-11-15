import * as THREE from 'three';
import { content, stations, ui } from '../data/content.js';
import {
  PALETTE,
  drawImageCover,
  drawStar,
  makeCanvas,
  seededRandom,
  textureFromCanvas,
} from './assets.js';

/** Repli graphique si public/stadium.jpg est absent. */
function drawStadiumFallback(ctx, width, height) {
  const random = seededRandom(88);
  const sky = ctx.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, '#02040C');
  sky.addColorStop(0.55, '#0A3A8C');
  sky.addColorStop(1, '#05070D');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);

  // Tribunes stylisées.
  ctx.fillStyle = '#080D18';
  ctx.beginPath();
  ctx.moveTo(0, height * 0.48);
  ctx.lineTo(width * 0.18, height * 0.32);
  ctx.lineTo(width * 0.82, height * 0.32);
  ctx.lineTo(width, height * 0.48);
  ctx.lineTo(width, height * 0.76);
  ctx.lineTo(0, height * 0.76);
  ctx.closePath();
  ctx.fill();

  for (let i = 0; i < 850; i += 1) {
    const x = random() * width;
    const y = height * 0.34 + random() * height * 0.34;
    ctx.fillStyle = random() > 0.7 ? 'rgba(20, 86, 200, 0.65)' : 'rgba(238, 241, 248, 0.22)';
    ctx.fillRect(x, y, 3, 3);
  }

  // Pelouse.
  const pitch = ctx.createLinearGradient(0, height * 0.72, 0, height);
  pitch.addColorStop(0, '#10543C');
  pitch.addColorStop(1, '#082A1F');
  ctx.fillStyle = pitch;
  ctx.fillRect(0, height * 0.7, width, height * 0.3);
  ctx.strokeStyle = 'rgba(238, 241, 248, 0.3)';
  ctx.lineWidth = 2;
  ctx.strokeRect(width * 0.28, height * 0.76, width * 0.44, height * 0.22);
  ctx.beginPath();
  ctx.moveTo(width * 0.5, height * 0.76);
  ctx.lineTo(width * 0.5, height * 0.98);
  ctx.stroke();

  // Projecteurs.
  [[0.12, 0.26], [0.88, 0.26]].forEach(([x, y]) => {
    const glow = ctx.createRadialGradient(width * x, height * y, 0, width * x, height * y, 120);
    glow.addColorStop(0, 'rgba(238, 241, 248, 0.8)');
    glow.addColorStop(1, 'rgba(238, 241, 248, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(width * x - 130, height * y - 130, 260, 260);
  });
}

/** Écran géant du stade, utilisé comme tableau de score du parcours. */
export function createScoreboard(renderer, stadiumImage, { mobile = false } = {}) {
  const group = new THREE.Group();
  group.name = 'ecran-geant';
  group.position.set(0, 34, -92);

  const width = mobile ? 1024 : 1536;
  const height = width / 2;
  const canvas = makeCanvas(width, height);
  const ctx = canvas.getContext('2d');
  const texture = textureFromCanvas(canvas, renderer);
  const screenMaterial = new THREE.MeshBasicMaterial({ map: texture, toneMapped: false });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(34, 17), screenMaterial);
  group.add(screen);

  const frameMaterial = new THREE.MeshStandardMaterial({
    color: '#070B14',
    roughness: 0.55,
    metalness: 0.55,
  });
  const frame = new THREE.Mesh(new THREE.BoxGeometry(36.4, 19.2, 1.1), frameMaterial);
  frame.position.z = -0.75;
  group.add(frame);

  const goldMaterial = new THREE.MeshBasicMaterial({ color: PALETTE.gold, toneMapped: false });
  const trim = [
    { size: [35.2, 0.24, 0.14], position: [0, 8.65, 0.02] },
    { size: [35.2, 0.24, 0.14], position: [0, -8.65, 0.02] },
    { size: [0.24, 17.4, 0.14], position: [-17.35, 0, 0.02] },
    { size: [0.24, 17.4, 0.14], position: [17.35, 0, 0.02] },
  ];
  trim.forEach(({ size, position }) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), goldMaterial);
    mesh.position.set(...position);
    group.add(mesh);
  });

  // Structure de soutien.
  const redMaterial = new THREE.MeshStandardMaterial({
    color: PALETTE.red,
    roughness: 0.55,
    metalness: 0.35,
  });
  [-12, 12].forEach((x) => {
    const column = new THREE.Mesh(new THREE.BoxGeometry(0.7, 34, 0.7), redMaterial);
    column.position.set(x, -17, -1.4);
    group.add(column);
  });
  const brace = new THREE.Mesh(new THREE.BoxGeometry(26, 0.4, 0.4), redMaterial);
  brace.position.set(0, -7.5, -1.4);
  group.add(brace);

  // Halo de l'écran.
  const glowCanvas = makeCanvas(256, 256);
  const glowCtx = glowCanvas.getContext('2d');
  const glowGradient = glowCtx.createRadialGradient(128, 128, 0, 128, 128, 128);
  glowGradient.addColorStop(0, 'rgba(20, 86, 200, 0.4)');
  glowGradient.addColorStop(0.5, 'rgba(10, 58, 140, 0.12)');
  glowGradient.addColorStop(1, 'rgba(10, 58, 140, 0)');
  glowCtx.fillStyle = glowGradient;
  glowCtx.fillRect(0, 0, 256, 256);
  const glowTexture = textureFromCanvas(glowCanvas, renderer);
  const glow = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glowTexture,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    }),
  );
  glow.scale.set(62, 34, 1);
  glow.position.z = -2.2;
  group.add(glow);

  let last = { minuteLabel: "0'", stationName: 'Accueil', progress: 0 };

  /** Redessine l'écran avec la station active. */
  function draw(state = last) {
    last = state;
    ctx.clearRect(0, 0, width, height);
    if (stadiumImage) {
      drawImageCover(ctx, stadiumImage, 0, 0, width, height);
      ctx.fillStyle = 'rgba(5, 8, 16, 0.58)';
      ctx.fillRect(0, 0, width, height);
    } else {
      drawStadiumFallback(ctx, width, height);
      ctx.fillStyle = 'rgba(5, 8, 16, 0.38)';
      ctx.fillRect(0, 0, width, height);
    }

    // Bandes nerazzurre sur le bord gauche.
    const stripeW = width * 0.034;
    for (let i = 0; i < 6; i += 1) {
      ctx.fillStyle = i % 2 === 0 ? 'rgba(10, 58, 140, 0.85)' : 'rgba(10, 10, 16, 0.85)';
      ctx.fillRect(i * stripeW, 0, stripeW, height);
    }
    ctx.fillStyle = 'rgba(212, 175, 55, 0.9)';
    ctx.fillRect(6 * stripeW, 0, 4, height);

    // Voile de lisibilité.
    const veil = ctx.createLinearGradient(0, 0, width, 0);
    veil.addColorStop(0, 'rgba(5, 8, 16, 0.82)');
    veil.addColorStop(0.38, 'rgba(5, 8, 16, 0.56)');
    veil.addColorStop(1, 'rgba(5, 8, 16, 0.24)');
    ctx.fillStyle = veil;
    ctx.fillRect(width * 0.2, 0, width * 0.8, height);

    const pad = width * 0.075;
    ctx.textBaseline = 'middle';

    ctx.fillStyle = PALETTE.gold;
    ctx.font = `700 ${Math.round(width * 0.017)}px Bahnschrift, "Segoe UI", sans-serif`;
    ctx.fillText(ui.screenTop, pad, height * 0.12);

    // Pastille live.
    ctx.fillStyle = 'rgba(238, 241, 248, 0.9)';
    ctx.font = `600 ${Math.round(width * 0.016)}px Bahnschrift, "Segoe UI", sans-serif`;
    ctx.fillText(last.stationName.toUpperCase(), width - pad - width * 0.13, height * 0.12);
    ctx.fillStyle = PALETTE.red;
    ctx.beginPath();
    ctx.arc(width - pad - width * 0.155, height * 0.12, width * 0.0065, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = PALETTE.paper;
    ctx.font = `700 ${Math.round(width * 0.072)}px Bahnschrift, "Segoe UI", sans-serif`;
    ctx.fillText(ui.screenName, pad, height * 0.33);

    ctx.fillStyle = 'rgba(238, 241, 248, 0.75)';
    ctx.font = `600 ${Math.round(width * 0.021)}px Bahnschrift, "Segoe UI", sans-serif`;
    ctx.fillText(ui.screenSub, pad, height * 0.45);

    ctx.fillStyle = PALETTE.gold;
    ctx.font = `700 ${Math.round(width * 0.018)}px Bahnschrift, "Segoe UI", sans-serif`;
    ctx.fillText(ui.screenTarget, pad, height * 0.53);

    // Grand temps de match.
    ctx.fillStyle = PALETTE.paper;
    ctx.font = `700 ${Math.round(width * 0.1)}px Bahnschrift, "Segoe UI", sans-serif`;
    ctx.textAlign = 'right';
    ctx.fillText(last.minuteLabel, width - pad, height * 0.38);
    ctx.textAlign = 'left';

    // Barre de progression façon match.
    const barX = pad;
    const barY = height * 0.78;
    const barW = width - pad * 2;
    ctx.fillStyle = 'rgba(238, 241, 248, 0.18)';
    ctx.fillRect(barX, barY, barW, 6);
    const fillW = Math.max(6, barW * Math.min(1, Math.max(0, last.progress)));
    const barGradient = ctx.createLinearGradient(barX, 0, barX + barW, 0);
    barGradient.addColorStop(0, PALETTE.blueBright);
    barGradient.addColorStop(1, PALETTE.gold);
    ctx.fillStyle = barGradient;
    ctx.fillRect(barX, barY, fillW, 6);

    stations.forEach((station) => {
      const x = barX + (station.minute / 90) * barW;
      ctx.fillStyle = station.minute / 90 <= last.progress + 0.001 ? PALETTE.gold : 'rgba(238, 241, 248, 0.4)';
      ctx.beginPath();
      ctx.arc(x, barY + 3, 5, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = 'rgba(238, 241, 248, 0.55)';
    ctx.font = `600 ${Math.round(width * 0.015)}px Bahnschrift, "Segoe UI", sans-serif`;
    ctx.fillText(ui.screenLive, pad, height * 0.87);
    ctx.textAlign = 'right';
    ctx.fillText(`PFE · ${content.identity.location}`, width - pad, height * 0.87);
    ctx.textAlign = 'left';

    // Étoile dorée.
    ctx.fillStyle = 'rgba(212, 175, 55, 0.9)';
    drawStar(ctx, width - pad - width * 0.02, height * 0.2, 14, 5.6);
    ctx.fill();

    texture.needsUpdate = true;
  }

  draw(last);
  return { group, update: draw, screen };
}
