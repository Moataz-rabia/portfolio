import './styles.css';
import { assetUrl, loadImage } from './scene/assets.js';
import { StadiumScene, supportsWebGL } from './scene/StadiumScene.js';
import { content, stations, ui } from './data/content.js';
import { createOverlays, createFallback2D } from './sections/overlays.js';
import { createLoader } from './ui/loader.js';
import { createHUD } from './ui/hud.js';
import { createFx } from './ui/fx.js';
import { createCursor } from './ui/cursor.js';

const app = document.querySelector('#app');
const canvas = document.querySelector('#scene');
const overlayRoot = document.querySelector('#overlay-root');
const hudRoot = document.querySelector('#hud-root');
const cursorRoot = document.querySelector('#cursor-root');
const loaderRoot = document.querySelector('#loader-root');
const flashNode = document.querySelector('#flash');
const liveNode = document.querySelector('#live');
const fallbackRoot = document.querySelector('#fallback2d');

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
const mobile = coarsePointer || window.innerWidth < 820;

const loader = createLoader(loaderRoot);
loader.set(4, 0);
const fx = createFx(flashNode, liveNode);

let scene = null;
let overlays = null;
let hud = null;
let cursorApi = { setHover() {}, destroy() {} };
let currentIndex = -1;
let fallenBack = false;

const delay = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));
const nextFrame = () => new Promise((resolve) => window.requestAnimationFrame(resolve));

function switchToFallback(reason) {
  if (fallenBack) return;
  fallenBack = true;
  if (reason) console.warn(reason);
  if (scene) {
    scene.dispose();
    scene = null;
  }
  cursorApi.destroy();
  hud?.destroy();
  hud = null;
  overlays = null;
  createFallback2D(app, fallbackRoot);
  loaderRoot.hidden = true;
}

/** Navigation principale entre les cinq stations. */
function goTo(index, { instant = false, onArrive } = {}) {
  if (!scene || !overlays || !hud) return;
  if (index < 0 || index >= stations.length) return;
  if (index === currentIndex && !instant) return;

  currentIndex = index;
  const station = stations[index];
  document.body.dataset.station = station.id;

  if (!instant) {
    fx.flash();
    scene.closeLockers();
    overlays.highlightSkill(null);
    document.body.classList.add('has-navigated');
  }

  overlays.show(index);
  hud.setStation(index);
  scene.updateScreen({
    minuteLabel: station.minuteLabel,
    stationName: station.name,
    progress: station.minute / 90,
  });

  scene.goTo(index, {
    instant,
    onArrive: () => {
      onArrive?.();
    },
  });

  if (!instant) {
    fx.announce(
      `Station ${station.number} sur 05 : ${station.name}. ${station.minuteLabel}.`,
    );
  }
}

function handleProject(projectId) {
  const focus = () => {
    if (!overlays || !scene) return;
    overlays.focusProject(projectId);
    scene.focusProject(projectId);
  };
  if (currentIndex !== 1) goTo(1, { onArrive: focus });
  else focus();
}

function handleLocker(groupId, index) {
  const focus = () => {
    if (!overlays || !scene) return;
    scene.openLocker(index);
    overlays.highlightSkill(groupId);
    const target = overlayRoot.querySelector(`#skill-${CSS.escape(groupId)}`);
    if (target) {
      target.scrollIntoView({
        block: 'center',
        behavior: reducedMotion ? 'auto' : 'smooth',
      });
    }
  };
  if (currentIndex !== 3) goTo(3, { onArrive: focus });
  else focus();
}

function handleHover(value) {
  cursorApi.setHover(value?.type || '');
  if (!overlays) return;
  if (value?.type === 'locker') overlays.highlightSkill(value.id);
  else if (!value) overlays.highlightSkill(null);
}

/** Un élément de l'interface ou un panneau ne doit pas déclencher la navigation. */
function isInterfaceTarget(target) {
  return (
    target instanceof Element &&
    Boolean(target.closest('.station-panel, .hud-top, .hud-bottom, .loader'))
  );
}

function bindNavigation() {
  let wheelAt = 0;

  window.addEventListener(
    'wheel',
    (event) => {
      if (isInterfaceTarget(event.target)) return;
      if (Math.abs(event.deltaY) < 14) return;
      event.preventDefault();
      const now = performance.now();
      if (now - wheelAt < 850) return;
      wheelAt = now;
      goTo(currentIndex + (event.deltaY > 0 ? 1 : -1));
    },
    { passive: false },
  );

  let touchStart = null;
  window.addEventListener(
    'touchstart',
    (event) => {
      if (event.touches.length !== 1 || isInterfaceTarget(event.target)) {
        touchStart = null;
        return;
      }
      touchStart = {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY,
        time: performance.now(),
      };
    },
    { passive: true },
  );

  window.addEventListener(
    'touchend',
    (event) => {
      if (!touchStart) return;
      const touch = event.changedTouches[0];
      const dx = touch.clientX - touchStart.x;
      const dy = touch.clientY - touchStart.y;
      const elapsed = performance.now() - touchStart.time;
      touchStart = null;
      if (elapsed > 900) return;
      if (Math.abs(dy) < 55 || Math.abs(dy) < Math.abs(dx) * 1.2) return;
      goTo(currentIndex + (dy < 0 ? 1 : -1));
    },
    { passive: true },
  );

  window.addEventListener('keydown', (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const target = event.target;
    if (target instanceof Element && target.closest('input, textarea, select')) return;

    if (/^[1-5]$/.test(event.key)) {
      event.preventDefault();
      goTo(Number(event.key) - 1);
      return;
    }

    if (event.key === 'Home') {
      event.preventDefault();
      goTo(0);
      return;
    }

    if (event.key === 'End') {
      event.preventDefault();
      goTo(stations.length - 1);
      return;
    }

    // Dans un panneau, les flèches servent au défilement du contenu.
    if (target instanceof Element && target.closest('.station-panel')) return;

    if (event.key === 'ArrowDown' || event.key === 'ArrowRight' || event.key === 'PageDown') {
      event.preventDefault();
      goTo(currentIndex + 1);
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft' || event.key === 'PageUp') {
      event.preventDefault();
      goTo(currentIndex - 1);
    }
  });
}

async function boot() {
  if (!supportsWebGL()) {
    switchToFallback('WebGL indisponible : affichage de la version 2D.');
    return;
  }

  let progress = 6;
  const progressTimer = window.setInterval(() => {
    progress = Math.min(46, progress + 2.5);
    loader.set(progress);
  }, 130);

  const [stadiumImage, photoImage] = await Promise.all([
    loadImage(assetUrl('stadium.jpg')),
    loadImage(assetUrl('photo.png')),
  ]);
  window.clearInterval(progressTimer);
  loader.set(54, 1);

  await nextFrame();
  loader.set(61, 1);

  try {
    scene = new StadiumScene({
      canvas,
      images: { stadium: stadiumImage, photo: photoImage },
      mobile,
      reducedMotion,
      callbacks: {
        onProject: handleProject,
        onLocker: handleLocker,
        onHover: handleHover,
      },
    });
  } catch (error) {
    console.error(error);
    switchToFallback('La scène 3D n’a pas pu démarrer : affichage de la version 2D.');
    return;
  }

  loader.set(76, 2);

  overlays = createOverlays(overlayRoot, {
    onNavigate: (index) => goTo(index),
    onSkillHover: (index) => {
      if (!scene) return;
      if (index === null) scene.closeLockers();
      else scene.openLocker(index);
    },
  });

  hud = createHUD(hudRoot, {
    onSelect: (index) => goTo(index),
  });

  loader.set(92, 3);
  await delay(420);

  await loader.finish();
  scene.start();

  cursorApi = createCursor(cursorRoot, { reducedMotion });
  document.body.classList.add('is-ready');

  goTo(0, { instant: true });
  fx.announce(
    `Portfolio de ${content.identity.name}. Station 1 sur 5 : Accueil. Utilisez les flèches, la molette ou les touches 1 à 5.`,
  );

  bindNavigation();

  canvas.addEventListener(
    'webglcontextlost',
    (event) => {
      event.preventDefault();
      switchToFallback('Contexte WebGL perdu : affichage de la version 2D.');
    },
    { once: true },
  );

  window.addEventListener(
    'pagehide',
    () => {
      scene?.dispose();
      cursorApi.destroy();
      hud?.destroy();
      fx.dispose();
    },
    { once: true },
  );
}

boot();

// Référence utile pour le débogage local, sans exposer d'API sensible.
window.__portfolio = { content, stations, ui };
