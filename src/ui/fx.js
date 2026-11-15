/**
 * Effets de transition : flash de coup d'envoi et annonces accessibles.
 */
export function createFx(flashNode, liveNode) {
  let flashTimer = null;

  function flash() {
    if (!flashNode) return;
    if (flashTimer) window.clearTimeout(flashTimer);
    flashNode.classList.remove('is-active');
    // Force le redémarrage de l'animation CSS.
    void flashNode.offsetWidth;
    flashNode.classList.add('is-active');
    flashTimer = window.setTimeout(() => {
      flashNode.classList.remove('is-active');
    }, 760);
  }

  function announce(message) {
    if (!liveNode) return;
    liveNode.textContent = '';
    window.setTimeout(() => {
      liveNode.textContent = message;
    }, 40);
  }

  function dispose() {
    if (flashTimer) window.clearTimeout(flashTimer);
  }

  return { flash, announce, dispose };
}
