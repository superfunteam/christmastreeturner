import * as THREE from 'three';
import { createLatheFromProfile } from '../geometries';
import { createBlackMetalMaterial, createGoldRimMaterial } from '../materials';
import {
  BASE_RADIUS,
  BASE_HEIGHT,
  BASE_FLANGE_HEIGHT,
  GOLD_RIM_RADIUS,
  GOLD_RIM_TUBE_RADIUS,
  LATHE_SEGMENTS,
} from '../constants';

export function createLowerBase(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'lowerBase';

  const baseMaterial = createBlackMetalMaterial();

  // Base pan profile: flat disc with upturned flange
  const profile: Array<[number, number]> = [
    [0.5, 0],                          // center hole (for wiring)
    [0.5, -0.1],                        // center lip
  ];

  profile.push(
    [BASE_RADIUS - 0.5, -0.1],           // flat bottom edge
    [BASE_RADIUS - 0.3, -0.1],         // start curving up
    [BASE_RADIUS, 0],                   // edge bottom
    [BASE_RADIUS, BASE_FLANGE_HEIGHT],  // flange going up
    [BASE_RADIUS - 0.1, BASE_HEIGHT],   // top of flange, slight inward lean
    [BASE_RADIUS - 0.8, BASE_HEIGHT],   // inner top edge
    [BASE_RADIUS - 0.8, BASE_HEIGHT - 0.15], // step down
    [1.5, BASE_HEIGHT - 0.15],          // inner floor
    [1.0, BASE_HEIGHT - 0.15],          // toward center
  );

  const baseGeometry = createLatheFromProfile(profile);
  baseGeometry.computeVertexNormals();

  const baseMesh = new THREE.Mesh(baseGeometry, baseMaterial);
  baseMesh.castShadow = true;
  baseMesh.receiveShadow = true;
  baseMesh.userData = { partId: 'lowerBase' };
  group.add(baseMesh);

  // 4 radial ridges on the bottom face, spaced 90° apart like spokes
  const ridgeLength = BASE_RADIUS - 1.0;
  const ridgeWidth = 0.08;
  const ridgeHeight = 0.03;
  const ridgeGeometry = new THREE.BoxGeometry(ridgeLength, ridgeHeight, ridgeWidth);

  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2; // 0°, 90°, 180°, 270°
    const ridgeMesh = new THREE.Mesh(ridgeGeometry, baseMaterial);
    const offsetDist = ridgeLength / 2 + 0.5; // center the ridge between center hole and edge
    ridgeMesh.position.set(
      Math.cos(angle) * offsetDist,
      -0.11,
      Math.sin(angle) * offsetDist,
    );
    ridgeMesh.rotation.y = -angle; // align along the radial direction
    ridgeMesh.userData = { partId: 'lowerBase' };
    group.add(ridgeMesh);
  }

  // Embossed text on bottom — centered in a quadrant between two ridges
  const embossRadius = (BASE_RADIUS - 0.5) * 0.55;
  const bottomDisc = new THREE.CircleGeometry(embossRadius, 64);
  const loader = new THREE.TextureLoader();
  const bumpMap = loader.load('/textures/bottom-emboss.png');
  bumpMap.wrapS = THREE.ClampToEdgeWrapping;
  bumpMap.wrapT = THREE.ClampToEdgeWrapping;

  const bottomMaterial = new THREE.MeshStandardMaterial({
    color: 0x1A1A1A,
    metalness: 0.3,
    roughness: 0.15,
    bumpMap: bumpMap,
    bumpScale: 0.3,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });

  const embossAngle = Math.PI / 4; // 45° — midway between the 0° and 90° ridges
  const embossOffset = BASE_RADIUS * 0.4;
  const bottomMesh = new THREE.Mesh(bottomDisc, bottomMaterial);
  bottomMesh.rotation.x = Math.PI / 2; // face down
  bottomMesh.position.set(
    Math.cos(embossAngle) * embossOffset,
    -0.101, // just barely below the base bottom (-0.1) to stay flush
    Math.sin(embossAngle) * embossOffset,
  );
  bottomMesh.renderOrder = 1; // render after base to avoid z-fighting
  bottomMesh.userData = { partId: 'lowerBase' };
  group.add(bottomMesh);

  // Gold rim ring at base edge
  const rimGeometry = new THREE.TorusGeometry(
    GOLD_RIM_RADIUS,
    GOLD_RIM_TUBE_RADIUS,
    16,
    LATHE_SEGMENTS,
  );
  const rimMaterial = createGoldRimMaterial();
  const rimMesh = new THREE.Mesh(rimGeometry, rimMaterial);
  rimMesh.rotation.x = Math.PI / 2;
  rimMesh.position.y = 0;
  rimMesh.userData = { partId: 'goldRim' };
  group.add(rimMesh);

  group.userData = { partId: 'lowerBase' };

  return group;
}
