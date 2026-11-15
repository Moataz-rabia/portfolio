import * as THREE from 'three';
import { PALETTE } from './assets.js';
import { createSky } from './sky.js';
import { createPitch } from './pitch.js';
import { createStands } from './stands.js';
import { createRoof } from './roof.js';
import { createFloodlights } from './floodlights.js';
import { createScoreboard } from './scoreboard.js';
import { createPlayerCard } from './playerCard.js';
import { createTacticalBoard } from './tacticalBoard.js';
import { createLockers } from './lockers.js';
import { createTunnel } from './tunnel.js';

/** Petit repère doré au sol pour signaler les abords d'une station. */
function createGroundMarker(x, z, opacity = 0.42) {
  const marker = new THREE.Mesh(
    new THREE.RingGeometry(1.15, 1.42, 40),
    new THREE.MeshBasicMaterial({
      color: PALETTE.gold,
      transparent: true,
      opacity,
      side: THREE.DoubleSide,
      depthWrite: false,
      toneMapped: false,
    }),
  );
  marker.rotation.x = -Math.PI / 2;
  marker.position.set(x, 0.07, z);
  return marker;
}

/**
 * Assemble tout le décor 3D et expose les éléments animés/interactifs.
 */
export function createWorld({ scene, renderer, images, mobile = false, reducedMotion = false }) {
  const sky = createSky(renderer, { mobile });
  scene.add(sky);

  const pitch = createPitch(renderer, { mobile });
  scene.add(pitch.group);

  const stands = createStands(renderer, { mobile });
  scene.add(stands.group);

  const roof = createRoof(renderer, { mobile });
  scene.add(roof.group);

  const floodlights = createFloodlights(renderer, { mobile });
  scene.add(floodlights.group);

  const scoreboard = createScoreboard(renderer, images.stadium, { mobile });
  scene.add(scoreboard.group);

  const board = createTacticalBoard(renderer, { mobile });
  scene.add(board.group);

  const lockers = createLockers(renderer, { mobile });
  scene.add(lockers.group);

  const tunnel = createTunnel(renderer, { mobile });
  scene.add(tunnel.group);

  const player = createPlayerCard(renderer, images.photo, { mobile });
  scene.add(player.base);
  scene.add(player.group);

  // Repères discrets devant les stations.
  const markers = [
    createGroundMarker(-39.2, 0),
    createGroundMarker(39.2, 0, 0.32),
    createGroundMarker(0, 53.6, 0.5),
  ];
  markers.forEach((marker) => scene.add(marker));

  /** Boucle d'animation des éléments vivants du stade. */
  function update(time) {
    sky.rotation.y = time * 0.002;
    stands.update(time);
    floodlights.update(time);
    board.update(time);
    lockers.update(time);
    tunnel.update(time);
    player.update(time);

    markers.forEach((marker, index) => {
      marker.material.opacity = 0.26 + Math.sin(time * 1.3 + index * 1.1) * 0.13;
      const scale = 0.97 + Math.sin(time * 1.1 + index) * 0.03;
      marker.scale.setScalar(scale);
    });
  }

  return {
    update,
    scoreboard,
    board,
    lockers,
    tunnel,
    player,
    stands,
    floodlights,
    sky,
  };
}
