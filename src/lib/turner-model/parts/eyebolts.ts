import * as THREE from 'three';
import { createZincMaterial, createBrassMaterial } from '../materials';
import {
  EYEBOLT_COUNT,
  EYEBOLT_SHAFT_RADIUS,
  EYEBOLT_SHAFT_LENGTH,
  EYEBOLT_EYE_RADIUS,
  EYEBOLT_EYE_TUBE_RADIUS,
  EYEBOLT_NUT_RADIUS,
  EYEBOLT_NUT_HEIGHT,
  EYEBOLT_RING_RADIUS,
  CUP_DEPTH,
  CUP_TOP_RADIUS,
  PLATFORM_HEIGHT,
  PLATFORM_OUTER_RADIUS,
  LATHE_SEGMENTS,
} from '../constants';

// Build a single eyebolt laid flat.
// Eye loop at +Z (outer end), shaft extends along -Z (toward center/bowl).
function createSingleEyebolt(): THREE.Group {
  const bolt = new THREE.Group();
  const material = createZincMaterial();

  // Eye loop at outer end (+Z)
  const eyeGeometry = new THREE.TorusGeometry(
    EYEBOLT_EYE_RADIUS,
    EYEBOLT_EYE_TUBE_RADIUS,
    12,
    24,
  );
  const eye = new THREE.Mesh(eyeGeometry, material);
  eye.position.z = EYEBOLT_EYE_RADIUS * 0.7;
  bolt.add(eye);

  // Shaft (threaded rod) extends inward (-Z) from the ring
  const shaftGeometry = new THREE.CylinderGeometry(
    EYEBOLT_SHAFT_RADIUS,
    EYEBOLT_SHAFT_RADIUS,
    EYEBOLT_SHAFT_LENGTH,
    16,
  );
  const shaft = new THREE.Mesh(shaftGeometry, material);
  shaft.rotation.x = Math.PI / 2;
  shaft.position.z = -EYEBOLT_SHAFT_LENGTH / 2;
  bolt.add(shaft);

  // Hex nut on the outer side of the ring (near eye)
  const nutGeometry = new THREE.CylinderGeometry(
    EYEBOLT_NUT_RADIUS,
    EYEBOLT_NUT_RADIUS,
    EYEBOLT_NUT_HEIGHT,
    6,
  );
  const nut = new THREE.Mesh(nutGeometry, material);
  nut.rotation.x = Math.PI / 2;
  nut.position.z = 0.15;
  bolt.add(nut);

  bolt.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true;
      child.userData = { partId: 'eyebolts' };
    }
  });

  return bolt;
}

// Brass bridge cap — flat ring that sits on top of the cup, bolts thread through it
function createBridgeCap(): THREE.Mesh {
  const innerR = CUP_TOP_RADIUS - 0.2;
  const outerR = PLATFORM_OUTER_RADIUS + 0.3;
  const thickness = 0.2;

  const shape = new THREE.Shape();
  shape.absarc(0, 0, outerR, 0, Math.PI * 2, false);
  const hole = new THREE.Path();
  hole.absarc(0, 0, innerR, 0, Math.PI * 2, true);
  shape.holes.push(hole);

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: false,
  });

  const material = createBrassMaterial();
  const cap = new THREE.Mesh(geometry, material);
  cap.rotation.x = -Math.PI / 2; // lay flat
  cap.castShadow = true;
  cap.receiveShadow = true;
  cap.userData = { partId: 'platform' };
  return cap;
}

export function createEyebolts(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'eyebolts';

  const platformY = CUP_DEPTH + PLATFORM_HEIGHT;

  // Brass bridge cap on top of the cup
  const cap = createBridgeCap();
  cap.position.y = platformY;
  cap.userData = { partId: 'platform' };
  group.add(cap);

  for (let i = 0; i < EYEBOLT_COUNT; i++) {
    const angle = (i / EYEBOLT_COUNT) * Math.PI * 2;
    const bolt = createSingleEyebolt();

    // Position at the platform ring edge
    bolt.position.set(
      Math.cos(angle) * EYEBOLT_RING_RADIUS,
      platformY + 0.1,
      Math.sin(angle) * EYEBOLT_RING_RADIUS,
    );

    // Rotate so eye faces outward, shaft reaches inward into bowl
    bolt.rotation.y = Math.PI / 2 - angle;

    group.add(bolt);
  }

  group.userData = { partId: 'eyebolts' };

  return group;
}
