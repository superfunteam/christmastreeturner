import * as THREE from 'three';
import { LATHE_SEGMENTS } from './constants';

// Create a LatheGeometry from an array of [radius, y] profile points
export function createLatheFromProfile(
  profile: Array<[number, number]>,
  segments = LATHE_SEGMENTS,
): THREE.LatheGeometry {
  const points = profile.map(([r, y]) => new THREE.Vector2(r, y));
  return new THREE.LatheGeometry(points, segments);
}

// Generate a smooth curve between two points with optional sinusoidal ridge undulations
export function generateRidgedProfile(
  startR: number,
  startY: number,
  endR: number,
  endY: number,
  ridgeCount: number,
  ridgeDepth: number,
  steps: number,
  curveFactor = 0.3, // concavity of the overall curve
): Array<[number, number]> {
  const points: Array<[number, number]> = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // Linear interpolation
    let r = startR + (endR - startR) * t;
    const y = startY + (endY - startY) * t;

    // Add slight concave curve to the overall profile
    r += curveFactor * Math.sin(t * Math.PI);

    // Add sinusoidal ridge undulations
    if (ridgeCount > 0) {
      r += ridgeDepth * Math.sin(t * ridgeCount * Math.PI * 2);
    }

    points.push([Math.max(0, r), y]);
  }
  return points;
}
