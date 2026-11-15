import * as THREE from 'three';

/** Palette officieuse du portfolio (inspirée de l'Inter, sans logo). */
export const PALETTE = {
  ink: '#0A0A10',
  blue: '#0A3A8C',
  blueBright: '#1456C8',
  gold: '#D4AF37',
  paper: '#EEF1F8',
  pitchDark: '#0B3D2E',
  pitchLight: '#10543C',
  red: '#B3261E',
};

/** Construit une URL locale compatible avec le base path de Vite. */
export function assetUrl(name) {
  return `${import.meta.env.BASE_URL}${name}`;
}

/**
 * Charge une image locale sans jamais bloquer le site.
 * Retourne null si le fichier est absent ou si le chargement échoue.
 */
export function loadImage(url, timeout = 2500) {
  return new Promise((resolve) => {
    if (!url) {
      resolve(null);
      return;
    }
    const img = new Image();
    let settled = false;
    const finish = (value) => {
      if (settled) return;
      settled = true;
      resolve(value);
    };
    const timer = window.setTimeout(() => finish(null), timeout);
    img.onload = () => {
      window.clearTimeout(timer);
      finish(img);
    };
    img.onerror = () => {
      window.clearTimeout(timer);
      finish(null);
    };
    img.src = url;
  });
}

/** Crée un canvas de travail. */
export function makeCanvas(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

/** Trace un rectangle aux coins arrondis (compatible navigateurs anciens). */
export function roundRectPath(ctx, x, y, width, height, radius = 16) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

/** Trace une étoile à cinq branches. */
export function drawStar(ctx, cx, cy, outer, inner, points = 5, rotation = -Math.PI / 2) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i += 1) {
    const radius = i % 2 === 0 ? outer : inner;
    const angle = rotation + (i * Math.PI) / points;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

/** Transforme un canvas en texture Three.js prête pour le rendu. */
export function textureFromCanvas(canvas, renderer, { srgb = true } = {}) {
  const texture = new THREE.CanvasTexture(canvas);
  if (srgb) texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(8, renderer?.capabilities?.getMaxAnisotropy?.() || 1);
  texture.needsUpdate = true;
  return texture;
}

/** Dessine une image en mode "cover" dans une zone donnée. */
export function drawImageCover(ctx, image, x, y, width, height) {
  if (!image) return false;
  const ratio = Math.max(width / image.width, height / image.height);
  const drawW = image.width * ratio;
  const drawH = image.height * ratio;
  ctx.drawImage(image, x + (width - drawW) / 2, y + (height - drawH) / 2, drawW, drawH);
  return true;
}

/** Écrit un texte multi-lignes et retourne le prochain Y disponible. */
export function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 6) {
  const words = String(text).split(/\s+/);
  let line = '';
  let lines = 0;
  let cursorY = y;
  for (let i = 0; i < words.length; i += 1) {
    const test = line ? `${line} ${words[i]}` : words[i];
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, cursorY);
      line = words[i];
      cursorY += lineHeight;
      lines += 1;
      if (lines >= maxLines) return cursorY;
    } else {
      line = test;
    }
  }
  if (line) {
    ctx.fillText(line, x, cursorY);
    cursorY += lineHeight;
  }
  return cursorY;
}

/** Générateur pseudo-aléatoire déterministe (motif des sièges). */
export function seededRandom(seed) {
  let value = seed >>> 0;
  return function random() {
    value += 0x6d2b79f5;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
