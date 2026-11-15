/**
 * Curseur ballon de football. Désactivé sur les appareils tactiles.
 * Le ballon roule en fonction de la distance parcourue par la souris.
 */
export function createCursor(root, { reducedMotion = false } = {}) {
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  if (!finePointer) {
    return { setHover() {}, destroy() {} };
  }

  root.innerHTML = `
    <div class="ball-cursor" data-kind="">
      <div class="ball-cursor__ball" aria-hidden="true"><span></span></div>
      <div class="ball-cursor__halo" aria-hidden="true"></div>
    </div>
  `;

  const cursor = root.querySelector('.ball-cursor');
  const ball = root.querySelector('.ball-cursor__ball');
  document.documentElement.classList.add('has-ball-cursor');

  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;
  let x = targetX;
  let y = targetY;
  let angle = 0;
  let raf = null;
  let visible = false;

  const onMove = (event) => {
    const dx = event.clientX - targetX;
    const dy = event.clientY - targetY;
    targetX = event.clientX;
    targetY = event.clientY;
    angle += (Math.abs(dx) + Math.abs(dy)) * 0.4;
    if (!visible) {
      visible = true;
      cursor.classList.add('is-visible');
    }
  };

  const onLeave = () => {
    visible = false;
    cursor.classList.remove('is-visible');
  };

  const onDown = () => cursor.classList.add('is-down');
  const onUp = () => cursor.classList.remove('is-down');

  function render() {
    raf = window.requestAnimationFrame(render);
    if (reducedMotion) {
      x = targetX;
      y = targetY;
    } else {
      x += (targetX - x) * 0.24;
      y += (targetY - y) * 0.24;
    }
    cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    ball.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
  }

  window.addEventListener('pointermove', onMove, { passive: true });
  document.addEventListener('pointerleave', onLeave);
  window.addEventListener('pointerdown', onDown, { passive: true });
  window.addEventListener('pointerup', onUp, { passive: true });
  render();

  function setHover(kind) {
    cursor.dataset.kind = kind || '';
  }

  function destroy() {
    if (raf) window.cancelAnimationFrame(raf);
    window.removeEventListener('pointermove', onMove);
    document.removeEventListener('pointerleave', onLeave);
    window.removeEventListener('pointerdown', onDown);
    window.removeEventListener('pointerup', onUp);
    document.documentElement.classList.remove('has-ball-cursor');
    root.innerHTML = '';
  }

  return { setHover, destroy };
}
