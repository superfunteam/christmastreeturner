import * as THREE from 'three';
import { createLatheFromProfile, generateRidgedProfile } from '../geometries';
import { createBrassMaterial } from '../materials';
import {
  SKIRT_OUTER_RADIUS,
  SKIRT_HEIGHT,
  SKIRT_LIP_RADIUS,
  SKIRT_LIP_HEIGHT,
  CUP_TOP_RADIUS,
  CUP_BOTTOM_RADIUS,
  CUP_DEPTH,
  PLATFORM_INNER_RADIUS,
  PLATFORM_OUTER_RADIUS,
  PLATFORM_HEIGHT,
  RIDGE_COUNT,
  RIDGE_DEPTH,
  PROFILE_POINTS,
} from '../constants';

export function createUpperMember(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'upperMember';

  const material = createBrassMaterial();

  // Build the full profile from top (cup bottom) to bottom (lip)
  // Profile is an array of [radius, y] points, bottom-to-top
  const profile: Array<[number, number]> = [];

  // --- Cup interior (inside the funnel) ---
  // Start at the very bottom center of the cup
  profile.push([CUP_BOTTOM_RADIUS, 0]);
  // Cup wall going up (tapered, wider at top)
  const cupSteps = 12;
  for (let i = 1; i <= cupSteps; i++) {
    const t = i / cupSteps;
    const r = CUP_BOTTOM_RADIUS + (CUP_TOP_RADIUS - CUP_BOTTOM_RADIUS) * t;
    const y = CUP_DEPTH * t;
    profile.push([r, y]);
  }

  // --- Platform ring (flat horizontal at top of cup) ---
  const platformY = CUP_DEPTH;
  profile.push([PLATFORM_INNER_RADIUS, platformY]);
  profile.push([PLATFORM_OUTER_RADIUS, platformY]);
  profile.push([PLATFORM_OUTER_RADIUS, platformY + PLATFORM_HEIGHT]);

  // --- Skirt outer surface: platform edge down to lip ---
  // The skirt starts at the platform outer edge and curves outward and down
  // with 5 sinusoidal ridge undulations
  const skirtTopY = platformY + PLATFORM_HEIGHT;
  const skirtBottomY = skirtTopY - SKIRT_HEIGHT;
  const skirtStartR = PLATFORM_OUTER_RADIUS + 0.3;

  const ridgedProfile = generateRidgedProfile(
    skirtStartR,
    skirtTopY,
    SKIRT_OUTER_RADIUS,
    skirtBottomY + SKIRT_LIP_HEIGHT,
    RIDGE_COUNT,
    RIDGE_DEPTH,
    PROFILE_POINTS,
    0.5, // concave curvature
  );
  profile.push(...ridgedProfile);

  // --- Rolled lip at bottom ---
  const lipY = skirtBottomY;
  profile.push([SKIRT_OUTER_RADIUS, lipY + SKIRT_LIP_HEIGHT * 0.5]);
  // Lip curves inward
  profile.push([SKIRT_OUTER_RADIUS - 0.05, lipY + 0.05]);
  profile.push([SKIRT_LIP_RADIUS, lipY]);
  // Lip rolls back up slightly (the undercut)
  profile.push([SKIRT_LIP_RADIUS - 0.1, lipY + 0.1]);

  const geometry = createLatheFromProfile(profile);
  geometry.computeVertexNormals();

  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData = { partId: 'upperMember' };
  group.add(mesh);

  // Tag child meshes for raycasting
  group.userData = { partId: 'upperMember' };

  return group;
}
