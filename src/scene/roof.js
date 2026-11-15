import * as THREE from 'three';
import { PALETTE } from './assets.js';

const ROOFS = [
  { length: 118, position: [0, 0, -57], rotation: 0 },
  { length: 118, position: [0, 0, 57], rotation: Math.PI },
  { length: 116, position: [45, 0, 0], rotation: -Math.PI / 2 },
  { length: 116, position: [-45, 0, 0], rotation: Math.PI / 2 },
];

/**
 * Toit de stade low-poly : panneaux sombres, poutrelles rouges et liseré lumineux.
 * Les poutrelles rouges rappellent l'architecture industrielle des grands stades.
 */
export function createRoof(renderer, { mobile = false } = {}) {
  const group = new THREE.Group();
  group.name = 'toit';

  const dark = new THREE.MeshStandardMaterial({ color: '#080C16', roughness: 0.85, metalness: 0.3 });
  const red = new THREE.MeshStandardMaterial({
    color: PALETTE.red,
    roughness: 0.55,
    metalness: 0.35,
  });
  const led = new THREE.MeshBasicMaterial({ color: PALETTE.blueBright, toneMapped: false });
  const gold = new THREE.MeshBasicMaterial({ color: PALETTE.gold, toneMapped: false });

  ROOFS.forEach((config) => {
    const stand = new THREE.Group();
    stand.position.set(...config.position);
    stand.rotation.y = config.rotation;

    const panel = new THREE.Mesh(
      new THREE.BoxGeometry(config.length + 2, 0.55, 18),
      dark,
    );
    panel.position.set(0, 23.9, -11);
    panel.castShadow = false;
    panel.receiveShadow = false;
    stand.add(panel);

    // Poutrelles rouges transversales.
    const trussStep = mobile ? 13 : 7.5;
    for (let x = -config.length / 2 + 4; x <= config.length / 2 - 4; x += trussStep) {
      const truss = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.28, 19), red);
      truss.position.set(x, 23.45, -11);
      stand.add(truss);
    }

    // Poutres longitudinales.
    [-3.2, -8.4, -13.6, -18.6].forEach((z) => {
      const beam = new THREE.Mesh(new THREE.BoxGeometry(config.length, 0.25, 0.25), red);
      beam.position.set(0, 23.6, z);
      stand.add(beam);
    });

    // Poteaux rouges de soutien.
    for (let x = -config.length / 2 + 8; x <= config.length / 2 - 8; x += 22) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.35, 3.1, 0.35), red);
      post.position.set(x, 22.25, -20);
      stand.add(post);
    }

    // Façade et bandeau lumineux.
    const fascia = new THREE.Mesh(
      new THREE.BoxGeometry(config.length + 2, 2.1, 0.55),
      dark,
    );
    fascia.position.set(0, 22.9, -1.9);
    stand.add(fascia);

    const ledStrip = new THREE.Mesh(
      new THREE.BoxGeometry(config.length + 1, 0.09, 0.08),
      led,
    );
    ledStrip.position.set(0, 21.95, -1.6);
    stand.add(ledStrip);

    const goldStrip = new THREE.Mesh(
      new THREE.BoxGeometry(config.length + 1, 0.05, 0.08),
      gold,
    );
    goldStrip.position.set(0, 22.1, -1.6);
    stand.add(goldStrip);

    group.add(stand);
  });

  return { group };
}
