import * as THREE from 'three';
import gsap from 'gsap';

/**
 * Points de vue des cinq stations, pensés comme des caméras de retransmission.
 * Les cibles sont décalées pour laisser la place aux panneaux HTML.
 */
const VIEWS = [
  {
    position: new THREE.Vector3(0, 9.5, 33),
    target: new THREE.Vector3(-4, 8, 0),
  },
  {
    position: new THREE.Vector3(-19, 10, 12),
    target: new THREE.Vector3(-42, 9, -6),
  },
  {
    position: new THREE.Vector3(0, 20, -38),
    target: new THREE.Vector3(8, 33, -92),
  },
  {
    position: new THREE.Vector3(23, 8, 12),
    target: new THREE.Vector3(41, 5, -6),
  },
  {
    position: new THREE.Vector3(0, 4.6, 62),
    target: new THREE.Vector3(-1.2, 4, 94),
  },
];

/**
 * Orchestre les voyages de caméra sur des courbes CatmullRom,
 * avec un léger balancement de caméra embarquée lorsqu'on est à l'arrêt.
 */
export class CameraDirector {
  constructor(camera, { mobile = false, reducedMotion = false } = {}) {
    this.camera = camera;
    this.mobile = mobile;
    this.reducedMotion = reducedMotion;
    this.current = 0;
    this.transitioning = false;
    this.basePosition = VIEWS[0].position.clone();
    this.viewTarget = VIEWS[0].target.clone();
    this.target = VIEWS[0].target.clone();
    this._tween = null;
    this._focusTween = null;
    this._focusTimer = null;

    this.camera.position.copy(this.basePosition);
    this.camera.lookAt(this.target);
  }

  /** Voyage vers une station, ou coupe instantanément si mouvement réduit. */
  goTo(index, { instant = false, onStart, onArrive } = {}) {
    const view = VIEWS[index];
    if (!view) return;

    if (this._tween) this._tween.kill();
    this._clearFocus();
    if (onStart) onStart();

    this.current = index;
    this.viewTarget.copy(view.target);

    if (instant || this.reducedMotion) {
      this.transitioning = false;
      this.basePosition.copy(view.position);
      this.target.copy(view.target);
      this.camera.position.copy(view.position);
      this.camera.lookAt(this.target);
      if (onArrive) onArrive();
      return;
    }

    const startPosition = this.camera.position.clone();
    const endPosition = view.position.clone();
    const startTarget = this.target.clone();

    // Point de passage surélevé, comme un survol de stade.
    const middle = startPosition.clone().lerp(endPosition, 0.5);
    const distance = startPosition.distanceTo(endPosition);
    middle.y += Math.min(15, 5 + distance * 0.18);

    // Déport latéral pour éviter une trajectoire trop rectiligne.
    const flat = endPosition.clone().sub(startPosition);
    flat.y = 0;
    if (flat.lengthSq() > 0.001) {
      const perpendicular = new THREE.Vector3(-flat.z, 0, flat.x).normalize();
      middle.addScaledVector(perpendicular, this.mobile ? 2 : 5.5);
    }

    const middleTarget = startTarget.clone().lerp(view.target, 0.5);
    middleTarget.y += 1.4;

    const positionCurve = new THREE.CatmullRomCurve3(
      [startPosition, middle, endPosition],
      false,
      'catmullrom',
      0.5,
    );
    const targetCurve = new THREE.CatmullRomCurve3(
      [startTarget, middleTarget, view.target.clone()],
      false,
      'catmullrom',
      0.5,
    );

    this.transitioning = true;
    const progress = { t: 0 };

    this._tween = gsap.to(progress, {
      t: 1,
      duration: this.mobile ? 1.55 : 2.35,
      ease: 'power3.inOut',
      onUpdate: () => {
        const position = positionCurve.getPoint(progress.t);
        const target = targetCurve.getPoint(progress.t);
        this.camera.position.copy(position);
        this.target.copy(target);
        this.camera.lookAt(this.target);
      },
      onComplete: () => {
        this.transitioning = false;
        this.basePosition.copy(endPosition);
        this.target.copy(view.target);
        this.camera.position.copy(endPosition);
        this.camera.lookAt(this.target);
        if (onArrive) onArrive();
      },
    });
  }

  /** Oriente temporairement la caméra vers un point d'intérêt (jeton de projet). */
  focusOn(point, hold = 4200) {
    if (!point || this.reducedMotion) return;
    this._clearFocus();
    this._focusTween = gsap.to(this.target, {
      x: point.x,
      y: point.y,
      z: point.z,
      duration: 0.9,
      ease: 'power2.out',
      overwrite: true,
    });
    this._focusTimer = window.setTimeout(() => {
      this._focusTween = gsap.to(this.target, {
        x: this.viewTarget.x,
        y: this.viewTarget.y,
        z: this.viewTarget.z,
        duration: 1.4,
        ease: 'power2.inOut',
        overwrite: true,
      });
    }, hold);
  }

  _clearFocus() {
    if (this._focusTimer) {
      window.clearTimeout(this._focusTimer);
      this._focusTimer = null;
    }
    if (this._focusTween) {
      this._focusTween.kill();
      this._focusTween = null;
    }
  }

  /** Balancement très léger, coupé en mouvement réduit. */
  update(time) {
    if (this.transitioning) return;
    if (this.reducedMotion) {
      this.camera.position.copy(this.basePosition);
      this.camera.lookAt(this.target);
      return;
    }
    const factor = this.mobile ? 0.45 : 1;
    const swayX = Math.sin(time * 0.32) * 0.11 * factor;
    const swayY = Math.sin(time * 0.27 + 1.2) * 0.07 * factor;
    this.camera.position.set(
      this.basePosition.x + swayX,
      this.basePosition.y + swayY,
      this.basePosition.z,
    );
    this.camera.lookAt(
      this.target.x,
      this.target.y + Math.sin(time * 0.5) * 0.035,
      this.target.z,
    );
  }

  dispose() {
    if (this._tween) this._tween.kill();
    this._clearFocus();
    gsap.killTweensOf(this.target);
  }
}

export { VIEWS };
