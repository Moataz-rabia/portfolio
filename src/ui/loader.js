import { content, ui } from '../data/content.js';

/**
 * Écran de chargement : ballon qui rebondit et pourcentage.
 * Le chargement réel (textures locales) est complété par une courte animation.
 */
export function createLoader(root) {
  root.innerHTML = `
    <div class="loader" role="status" aria-live="polite" aria-label="${ui.loaderAria}">
      <div class="loader__inner">
        <div class="loader__kicker">
          <span class="loader__star" aria-hidden="true">✦</span>
          ${ui.loaderBadge} · ${content.identity.name.toUpperCase()}
        </div>

        <div class="loader__ball-stage" aria-hidden="true">
          <div class="loader__ball"><i></i></div>
          <div class="loader__shadow"></div>
        </div>

        <div class="loader__percent" aria-hidden="true">
          <span data-loader-percent>0</span><small>%</small>
        </div>

        <p class="loader__message" data-loader-message>${ui.loaderMessages[0]}</p>

        <div class="loader__track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
          <span class="loader__fill" data-loader-fill></span>
        </div>

        <p class="loader__hint">${ui.loaderHint}</p>
      </div>
    </div>
  `;

  const loader = root.querySelector('.loader');
  const percentNode = root.querySelector('[data-loader-percent]');
  const messageNode = root.querySelector('[data-loader-message]');
  const fillNode = root.querySelector('[data-loader-fill]');
  const progressNode = root.querySelector('.loader__track');

  let value = 0;

  function set(percent, messageIndex) {
    const next = Math.round(Math.min(100, Math.max(value, percent)));
    value = next;
    percentNode.textContent = String(next);
    fillNode.style.width = `${next}%`;
    progressNode.setAttribute('aria-valuenow', String(next));
    if (typeof messageIndex === 'number') {
      const message = ui.loaderMessages[messageIndex % ui.loaderMessages.length];
      if (messageNode.textContent !== message) messageNode.textContent = message;
    } else {
      const index = Math.min(
        ui.loaderMessages.length - 1,
        Math.floor((next / 100) * ui.loaderMessages.length),
      );
      messageNode.textContent = ui.loaderMessages[index];
    }
  }

  function finish() {
    set(100);
    loader.classList.add('is-done');
    document.body.classList.remove('is-loading');
    return new Promise((resolve) => {
      window.setTimeout(() => {
        root.hidden = true;
        resolve();
      }, 620);
    });
  }

  function fail(message) {
    loader.classList.add('is-error');
    messageNode.textContent = message || 'Le stade n’a pas pu être chargé.';
    progressNode.setAttribute('aria-valuenow', String(value));
  }

  document.body.classList.add('is-loading');

  return { set, finish, fail, get value() { return value; } };
}
