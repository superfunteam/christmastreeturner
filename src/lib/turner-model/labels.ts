import * as THREE from 'three';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

export interface LabelDef {
  text: string;
  position: THREE.Vector3;
  partId: string;
}

const LABEL_DEFS: LabelDef[] = [
  { text: 'UPPER MEMBER', position: new THREE.Vector3(7, 3, 0), partId: 'upperMember' },
  { text: 'CUP SOCKET', position: new THREE.Vector3(0, 6, 0), partId: 'cupSocket' },
  { text: 'CLAMPING SCREWS', position: new THREE.Vector3(3, 7, 3), partId: 'eyebolts' },
  { text: 'ELECTRICAL OUTLET', position: new THREE.Vector3(-7, 2.5, 5), partId: 'outlet' },
  { text: 'LOWER BASE', position: new THREE.Vector3(6, -0.5, 5), partId: 'lowerBase' },
  { text: 'REMOTE CONTROL', position: new THREE.Vector3(0, -2.5, -12), partId: 'remote' },
  { text: 'DECORATIVE RIDGES', position: new THREE.Vector3(-8, 1.5, -4), partId: 'upperMember' },
];

export class LabelSystem {
  renderer: CSS2DRenderer;
  labels: CSS2DObject[] = [];
  visible = false;

  constructor(container: HTMLElement) {
    this.renderer = new CSS2DRenderer();
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.domElement.style.position = 'absolute';
    this.renderer.domElement.style.top = '0';
    this.renderer.domElement.style.left = '0';
    this.renderer.domElement.style.pointerEvents = 'none';
    container.appendChild(this.renderer.domElement);
  }

  createLabels(scene: THREE.Scene): void {
    LABEL_DEFS.forEach((def) => {
      const el = document.createElement('div');
      el.className = 'model-label';
      el.textContent = def.text;
      el.style.cssText = `
        font-family: 'IBM Plex Mono', monospace;
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        background: rgba(255, 255, 255, 0.92);
        color: #1a1a1a;
        padding: 3px 8px;
        border: 1px solid #1a1a1a;
        box-shadow: 0 1px 3px rgba(0,0,0,0.12);
        white-space: nowrap;
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
      `;

      const label = new CSS2DObject(el);
      label.position.copy(def.position);
      label.userData = { partId: def.partId };
      scene.add(label);
      this.labels.push(label);
    });
  }

  setVisible(visible: boolean): void {
    this.visible = visible;
    this.labels.forEach((label) => {
      const el = label.element as HTMLElement;
      el.style.opacity = visible ? '1' : '0';
    });
  }

  toggle(): void {
    this.setVisible(!this.visible);
  }

  updateSize(width: number, height: number): void {
    this.renderer.setSize(width, height);
  }

  render(scene: THREE.Scene, camera: THREE.Camera): void {
    this.renderer.render(scene, camera);
  }
}
