import * as THREE from 'three';
import {
  COLOR_BRASS,
  COLOR_ZINC,
  COLOR_BLACK_PLASTIC,
  COLOR_BLACK_METAL,
  COLOR_RUBBER,
  COLOR_GOLD_RIM,
} from './constants';

// Generate concentric lathe-line roughness map for brass
function createLatheRoughnessMap(size = 256): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Base roughness
  ctx.fillStyle = '#888';
  ctx.fillRect(0, 0, size, size);

  // Concentric lathe lines (horizontal bands in UV space = concentric rings on lathe surface)
  for (let y = 0; y < size; y++) {
    const brightness = 120 + Math.sin(y * 0.8) * 20 + Math.random() * 15;
    ctx.fillStyle = `rgb(${brightness}, ${brightness}, ${brightness})`;
    ctx.fillRect(0, y, size, 1);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

export function createBrassMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: COLOR_BRASS,
    metalness: 0.9,
    roughness: 0.28,
    roughnessMap: createLatheRoughnessMap(),
    side: THREE.DoubleSide,
  });
}

export function createBlackMetalMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: COLOR_BLACK_METAL,
    metalness: 0.3,
    roughness: 0.15,
  });
}

export function createZincMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: COLOR_ZINC,
    metalness: 0.7,
    roughness: 0.4,
  });
}

export function createBlackPlasticMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: COLOR_BLACK_PLASTIC,
    metalness: 0.0,
    roughness: 0.6,
  });
}

export function createRubberMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: COLOR_RUBBER,
    metalness: 0.0,
    roughness: 0.9,
  });
}

export function createGoldRimMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: COLOR_GOLD_RIM,
    metalness: 0.85,
    roughness: 0.25,
  });
}

// Highlighted version of any material (for hover/selection)
export function createHighlightMaterial(baseMaterial: THREE.MeshStandardMaterial): THREE.MeshStandardMaterial {
  const highlight = baseMaterial.clone();
  highlight.emissive = new THREE.Color(0x333333);
  highlight.emissiveIntensity = 0.5;
  return highlight;
}
