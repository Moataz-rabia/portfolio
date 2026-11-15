import * as THREE from 'three';
import { CameraDirector } from './CameraDirector.js';
import { createWorld } from './world.js';

/** Détection simple de WebGL, utilisée pour basculer en version 2D. */
export function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext('webgl2') || canvas.getContext('webgl')),
    );
  } catch (error) {
    return false;
  }
}

/**
 * Gère le renderer, la scène, la boucle de rendu et le picking des objets 3D.
 */
export class StadiumScene {
  constructor({ canvas, images, mobile = false, reducedMotion = false, callbacks = {} }) {
    this.canvas = canvas;
    this.mobile = mobile;
    this.reducedMotion = reducedMotion;
    this.callbacks = callbacks;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !mobile,
      powerPreference: 'high-performance',
      alpha: false,
      stencil: false,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight, false);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;
    this.renderer.shadowMap.enabled = !mobile;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#05070D');
    this.scene.fog = new THREE.FogExp2(0x05070D, mobile ? 0.0042 : 0.003);

    this.camera = new THREE.PerspectiveCamera(
      mobile ? 50 : 42,
      window.innerWidth / window.innerHeight,
      0.1,
      600,
    );

    this._addLights();

    this.world = createWorld({
      scene: this.scene,
      renderer: this.renderer,
      images,
      mobile,
      reducedMotion,
    });

    this.director = new CameraDirector(this.camera, { mobile, reducedMotion });
    this.director.goTo(0, { instant: true });

    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.pointerDown = null;
    this.hovered = null;

    this._onPointerMove = this._onPointerMove.bind(this);
    this._onPointerDown = this._onPointerDown.bind(this);
    this._onPointerUp = this._onPointerUp.bind(this);
    this._onPointerLeave = this._onPointerLeave.bind(this);
    this._onResize = this._onResize.bind(this);
    this._loop = this._loop.bind(this);

    this._bindEvents();

    this._timer = new THREE.Timer();
    this._timer.connect(document);
    this._elapsed = 0;
    this._running = false;
    this._frame = null;
  }

  _addLights() {
    const hemisphere = new THREE.HemisphereLight(0x2a4f9c, 0x05060c, 0.85);
    this.scene.add(hemisphere);

    const ambient = new THREE.AmbientLight(0x8fa8e8, 0.22);
    this.scene.add(ambient);

    const key = new THREE.DirectionalLight(0xe8f0ff, 1.35);
    key.position.set(38, 70, 26);
    key.castShadow = !this.mobile;
    if (key.castShadow) {
      key.shadow.mapSize.set(1024, 1024);
      key.shadow.camera.left = -58;
      key.shadow.camera.right = 58;
      key.shadow.camera.top = 58;
      key.shadow.camera.bottom = -58;
      key.shadow.camera.near = 1;
      key.shadow.camera.far = 190;
      key.shadow.bias = -0.0004;
      key.shadow.normalBias = 0.035;
    }
    this.scene.add(key);
    this.scene.add(key.target);

    const fill = new THREE.DirectionalLight(0x1456c8, 0.95);
    fill.position.set(-50, 38, 24);
    this.scene.add(fill);

    const rim = new THREE.DirectionalLight(0x1456c8, 0.6);
    rim.position.set(0, 32, -60);
    this.scene.add(rim);
  }

  _bindEvents() {
    this.canvas.addEventListener('pointermove', this._onPointerMove);
    this.canvas.addEventListener('pointerdown', this._onPointerDown);
    this.canvas.addEventListener('pointerup', this._onPointerUp);
    this.canvas.addEventListener('pointerleave', this._onPointerLeave);
    window.addEventListener('resize', this._onResize);
  }

  _updatePointer(event) {
    const rect = this.canvas.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);
  }

  _pick(event) {
    this._updatePointer(event);
    const targets = [
      ...this.world.board.projectMeshes,
      ...this.world.lockers.doors,
    ];
    const intersections = this.raycaster.intersectObjects(targets, false);
    if (!intersections.length) return null;
    const object = intersections[0].object;
    if (object.userData.type === 'project') {
      return { type: 'project', id: object.userData.projectId, object };
    }
    if (object.userData.type === 'locker') {
      return { type: 'locker', id: object.userData.groupId, object };
    }
    return null;
  }

  _onPointerMove(event) {
    if (event.pointerType === 'touch') return;

    const hit = this._pick(event);
    if (hit?.type === 'project') {
      this.world.board.setHovered(hit.object);
      this.world.lockers.setHovered(null);
      this._setHovered({ type: 'project', id: hit.id });
    } else if (hit?.type === 'locker') {
      this.world.board.setHovered(null);
      this.world.lockers.setHovered(hit.object);
      this._setHovered({ type: 'locker', id: hit.id, index: hit.object.userData.index });
    } else {
      this.world.board.setHovered(null);
      this.world.lockers.setHovered(null);
      this._setHovered(null);
    }
  }

  _onPointerDown(event) {
    this.pointerDown = {
      x: event.clientX,
      y: event.clientY,
      time: performance.now(),
      pointerType: event.pointerType,
    };
  }

  _onPointerUp(event) {
    if (!this.pointerDown) return;
    const dx = event.clientX - this.pointerDown.x;
    const dy = event.clientY - this.pointerDown.y;
    const moved = Math.hypot(dx, dy);
    const down = this.pointerDown;
    this.pointerDown = null;
    if (moved > 12) return;

    const hit = this._pick(event);
    if (!hit) return;

    if (hit.type === 'project') {
      this.callbacks.onProject?.(hit.id);
    } else if (hit.type === 'locker') {
      this.callbacks.onLocker?.(hit.id, hit.object.userData.index);
    }

    // Un tap tactile laisse le casier ouvert.
    if (down.pointerType === 'touch' && hit.type === 'locker') {
      this.world.lockers.openLocker(hit.object.userData.index);
    }
  }

  _onPointerLeave() {
    this.world.board.setHovered(null);
    this.world.lockers.setHovered(null);
    this._setHovered(null);
    this.pointerDown = null;
  }

  _setHovered(value) {
    const currentKey = this.hovered ? `${this.hovered.type}:${this.hovered.id}` : '';
    const nextKey = value ? `${value.type}:${value.id}` : '';
    if (currentKey === nextKey) return;
    this.hovered = value;
    this.canvas.classList.toggle('is-interactive', Boolean(value));
    this.callbacks.onHover?.(value);
  }

  _onResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.mobile ? 1.5 : 2));
    this.renderer.setSize(width, height, false);
  }

  _loop() {
    if (!this._running) return;
    this._frame = window.requestAnimationFrame(this._loop);
    this._timer.update();
    const delta = Math.min(this._timer.getDelta(), 0.05);
    this._elapsed += delta;
    const time = this.reducedMotion ? 0 : this._elapsed;
    this.world.update(time);
    this.director.update(time);
    this.renderer.render(this.scene, this.camera);
  }

  start() {
    if (this._running) return;
    this._running = true;
    this._timer.reset();
    this._loop();
  }

  goTo(index, options) {
    this.director.goTo(index, options);
  }

  updateScreen(state) {
    this.world.scoreboard.update(state);
  }

  focusProject(projectId) {
    const point = this.world.board.getProjectPosition(projectId);
    if (point) this.director.focusOn(point);
    const token = this.world.board.projectMeshes.find(
      (mesh) => mesh.userData.projectId === projectId,
    );
    this.world.board.setHovered(token || null);
  }

  openLocker(index) {
    this.world.lockers.openLocker(index);
  }

  closeLockers() {
    this.world.lockers.closeAll();
  }

  dispose() {
    this._running = false;
    if (this._frame) window.cancelAnimationFrame(this._frame);
    this.canvas.removeEventListener('pointermove', this._onPointerMove);
    this.canvas.removeEventListener('pointerdown', this._onPointerDown);
    this.canvas.removeEventListener('pointerup', this._onPointerUp);
    this.canvas.removeEventListener('pointerleave', this._onPointerLeave);
    window.removeEventListener('resize', this._onResize);
    this._timer.dispose();
    this.director.dispose();

    const geometries = new Set();
    const materials = new Set();
    const textures = new Set();

    this.scene.traverse((object) => {
      if (object.geometry) geometries.add(object.geometry);
      if (object.material) {
        const list = Array.isArray(object.material) ? object.material : [object.material];
        list.forEach((material) => {
          materials.add(material);
          Object.keys(material).forEach((key) => {
            const value = material[key];
            if (value && value.isTexture) textures.add(value);
          });
        });
      }
    });

    textures.forEach((texture) => texture.dispose());
    materials.forEach((material) => material.dispose());
    geometries.forEach((geometry) => geometry.dispose());
    this.renderer.dispose();
  }
}
