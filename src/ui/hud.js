import { content, stations, ui } from '../data/content.js';

const MAP_POSITIONS = [
  { x: 50, y: 52 },
  { x: 24, y: 28 },
  { x: 50, y: 17 },
  { x: 76, y: 34 },
  { x: 50, y: 85 },
];

/**
 * HUD : temps de match, mini-terrain cliquable et navigation.
 */
export function createHUD(root, { onSelect } = {}) {
  const isMobile = () => window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 820;

  root.innerHTML = `
    <header class="hud-top">
      <div class="hud-brand">
        <span class="star-mark hud-brand__star" aria-hidden="true"></span>
        <span class="hud-brand__name">MOATAZ <strong>RABIE</strong></span>
        <span class="hud-brand__number" aria-hidden="true">${content.identity.number}</span>
      </div>

      <div class="hud-clock">
        <div class="hud-clock__top">
          <span>0'</span>
          <span class="hud-clock__station">
            <span data-hud-kicker>${stations[0].kicker}</span>
            <strong data-hud-name>${stations[0].name}</strong>
          </span>
          <span>90'</span>
        </div>
        <div class="hud-clock__track" role="progressbar" aria-label="${ui.progressLabel}" aria-valuemin="0" aria-valuemax="90" aria-valuenow="0" data-hud-progress>
          <span class="hud-clock__fill" data-hud-fill></span>
          <span class="hud-clock__dot" data-hud-dot></span>
        </div>
      </div>

      <div class="hud-status">
        <span class="hud-status__dot" aria-hidden="true"></span>
        <span>${ui.hudStatus}</span>
      </div>
    </header>

    <div class="hud-bottom">
      <nav class="minimap" aria-label="${ui.mapLabel}">
        <div class="minimap__pitch" aria-hidden="true">
          <span class="minimap__halfway"></span>
          <span class="minimap__circle"></span>
          <span class="minimap__box minimap__box--top"></span>
          <span class="minimap__box minimap__box--bottom"></span>
        </div>
        <div class="minimap__dots">
          ${stations
            .map(
              (station, index) => `
                <button
                  type="button"
                  class="minimap__dot${index === 0 ? ' is-active' : ''}"
                  data-station="${index}"
                  style="--x:${MAP_POSITIONS[index].x}%;--y:${MAP_POSITIONS[index].y}%"
                  aria-label="${station.number} · ${station.name} · ${station.minuteLabel}"
                  ${index === 0 ? 'aria-current="true"' : ''}
                >
                  <span class="minimap__point" aria-hidden="true"></span>
                  <span class="minimap__label">${station.name}</span>
                </button>
              `,
            )
            .join('')}
        </div>
        <div class="minimap__caption">
          <span data-hud-caption>${stations[0].name}</span>
          <small>${ui.currentStation}</small>
        </div>
      </nav>

      <div class="hud-nav">
        <span class="hud-nav__counter" aria-hidden="true"><b data-hud-counter>01</b><span>/05</span></span>
        <button type="button" class="hud-nav__button" data-hud-prev aria-label="${ui.navPrevious}" disabled>
          <span aria-hidden="true">←</span>
        </button>
        <button type="button" class="hud-nav__button" data-hud-next aria-label="${ui.navNext}">
          <span aria-hidden="true">→</span>
        </button>
      </div>

      <p class="hud-hint" data-hud-hint></p>
    </div>
  `;

  const progress = root.querySelector('[data-hud-progress]');
  const fill = root.querySelector('[data-hud-fill]');
  const dot = root.querySelector('[data-hud-dot]');
  const kicker = root.querySelector('[data-hud-kicker]');
  const name = root.querySelector('[data-hud-name]');
  const caption = root.querySelector('[data-hud-caption]');
  const counter = root.querySelector('[data-hud-counter]');
  const prev = root.querySelector('[data-hud-prev]');
  const next = root.querySelector('[data-hud-next]');
  const hint = root.querySelector('[data-hud-hint]');
  const dots = Array.from(root.querySelectorAll('.minimap__dot'));

  let active = 0;

  function setHint() {
    hint.textContent = isMobile() ? ui.navHintMobile : ui.navHintDesktop;
  }

  function go(index) {
    if (index < 0 || index >= stations.length || index === active) return;
    onSelect?.(index);
  }

  function setStation(index) {
    active = index;
    const station = stations[index];
    const percent = (station.minute / 90) * 100;
    progress.setAttribute('aria-valuenow', String(station.minute));
    fill.style.width = `${percent}%`;
    dot.style.left = `${percent}%`;
    kicker.textContent = `${station.kicker} · ${station.minuteLabel}`;
    name.textContent = station.name;
    caption.textContent = station.name;
    counter.textContent = station.number;
    prev.disabled = index === 0;
    next.disabled = index === stations.length - 1;

    dots.forEach((button, dotIndex) => {
      const isActive = dotIndex === index;
      button.classList.toggle('is-active', isActive);
      if (isActive) button.setAttribute('aria-current', 'true');
      else button.removeAttribute('aria-current');
    });
  }

  dots.forEach((button) => {
    button.addEventListener('click', () => {
      const index = Number(button.dataset.station);
      if (index !== active) onSelect?.(index);
    });
  });

  prev.addEventListener('click', () => go(active - 1));
  next.addEventListener('click', () => go(active + 1));

  setHint();
  setStation(0);
  window.addEventListener('resize', setHint);

  function destroy() {
    window.removeEventListener('resize', setHint);
    root.innerHTML = '';
  }

  return { setStation, destroy };
}
