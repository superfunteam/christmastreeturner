import * as THREE from 'three';
import { createBlackPlasticMaterial } from '../materials';
import {
  OUTLET_WIDTH,
  OUTLET_HEIGHT,
  OUTLET_DEPTH,
  SKIRT_OUTER_RADIUS,
  SKIRT_HEIGHT,
  CUP_DEPTH,
  PLATFORM_HEIGHT,
  PLATFORM_OUTER_RADIUS,
} from '../constants';

const OUTLET_COUNT = 3;

function createSingleOutlet(): THREE.Group {
  const outlet = new THREE.Group();

  const material = createBlackPlasticMaterial();

  // Main outlet body — thin, flat against the skirt surface
  const bodyGeometry = new THREE.BoxGeometry(OUTLET_WIDTH, OUTLET_HEIGHT, OUTLET_DEPTH);
  const body = new THREE.Mesh(bodyGeometry, material);
  body.castShadow = true;
  body.userData = { partId: 'outlet' };
  outlet.add(body);

  // Two prong slots on the outward-facing face (+Z)
  const slotMaterial = new THREE.MeshStandardMaterial({
    color: 0x000000,
    metalness: 0,
    roughness: 1,
  });

  // Slots side by side (horizontal layout like the photo)
  const slotW = 0.07;
  const slotH = 0.22;
  const slotGeometry = new THREE.BoxGeometry(slotW, slotH, 0.05);

  const slot1 = new THREE.Mesh(slotGeometry, slotMaterial);
  slot1.position.set(-0.13, 0, OUTLET_DEPTH / 2 + 0.01);
  slot1.userData = { partId: 'outlet' };
  outlet.add(slot1);

  const slot2 = new THREE.Mesh(slotGeometry, slotMaterial);
  slot2.position.set(0.13, 0, OUTLET_DEPTH / 2 + 0.01);
  slot2.userData = { partId: 'outlet' };
  outlet.add(slot2);

  return outlet;
}

export function createOutlet(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'outlet';

  const skirtTopY = CUP_DEPTH + PLATFORM_HEIGHT;

  // The outlets sit in the upper-mid section of the skirt.
  // Compute the Y position and surface radius at that height.
  // The skirt slopes outward from the platform (~3.6r) to the outer edge (~9.5r).
  // Outlets sit roughly 35% down from the top of the skirt.
  const tSkirt = 0.35;
  const outletY = skirtTopY - SKIRT_HEIGHT * tSkirt;
  const surfaceR = PLATFORM_OUTER_RADIUS + (SKIRT_OUTER_RADIUS - PLATFORM_OUTER_RADIUS) * tSkirt + 0.8;

  // The skirt surface has a slope angle — tilt the outlet to match
  const slopeAngle = Math.atan2(SKIRT_HEIGHT, SKIRT_OUTER_RADIUS - PLATFORM_OUTER_RADIUS);

  for (let i = 0; i < OUTLET_COUNT; i++) {
    const angle = (i / OUTLET_COUNT) * Math.PI * 2 + Math.PI / 3; // offset 60° from eyebolts
    const outlet = createSingleOutlet();

    // Place on skirt surface, facing radially outward
    outlet.position.set(
      Math.cos(angle) * surfaceR,
      outletY,
      Math.sin(angle) * surfaceR,
    );

    // Face radially outward, tilted to follow skirt slope
    outlet.rotation.order = 'YXZ';
    outlet.rotation.y = Math.PI / 2 - angle;
    outlet.rotation.x = -slopeAngle * 1.35;

    group.add(outlet);
  }

  group.userData = { partId: 'outlet' };

  return group;
}
