import * as THREE from 'three';
import { EXPLODE_OFFSETS } from './constants';

export interface ExplodablePart {
  group: THREE.Object3D;
  assembledPosition: THREE.Vector3;
  explodeOffset: THREE.Vector3;
}

export class ExplodedViewSystem {
  parts: ExplodablePart[] = [];
  targetFactor = 0; // 0 = assembled, 1 = exploded
  currentFactor = 0;
  private readonly easeFactor = 0.06;

  registerPart(group: THREE.Object3D, offsetKey: keyof typeof EXPLODE_OFFSETS): void {
    this.parts.push({
      group,
      assembledPosition: group.position.clone(),
      explodeOffset: new THREE.Vector3(0, EXPLODE_OFFSETS[offsetKey], 0),
    });
  }

  toggle(): void {
    this.targetFactor = this.targetFactor > 0.5 ? 0 : 1;
  }

  get isExploded(): boolean {
    return this.targetFactor > 0.5;
  }

  update(): void {
    // Lerp toward target
    this.currentFactor += (this.targetFactor - this.currentFactor) * this.easeFactor;

    // Snap to target when close enough
    if (Math.abs(this.targetFactor - this.currentFactor) < 0.001) {
      this.currentFactor = this.targetFactor;
    }

    // Apply interpolated positions
    this.parts.forEach((part) => {
      part.group.position.lerpVectors(
        part.assembledPosition,
        part.assembledPosition.clone().add(part.explodeOffset),
        this.currentFactor,
      );
    });
  }
}
