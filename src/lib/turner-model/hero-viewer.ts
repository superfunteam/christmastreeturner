import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';

import { PART_INFO } from './constants';
import { createUpperMember } from './parts/upper-member';
import { createLowerBase } from './parts/lower-base';
import { createEyebolts } from './parts/eyebolts';
import { createOutlet } from './parts/outlet';
import { createRemoteControl } from './parts/remote-control';
import { LabelSystem } from './labels';
import { ExplodedViewSystem } from './exploded-view';

export class HeroModelViewer {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;
  private labelSystem: LabelSystem;
  private explodeSystem: ExplodedViewSystem;
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;
  private hoveredPart: string | null = null;
  private originalMaterials: Map<THREE.Mesh, THREE.Material> = new Map();
  private animationId: number | null = null;
  private resizeObserver: ResizeObserver;

  onPartHover?: (partId: string | null) => void;
  onPartClick?: (partId: string | null) => void;

  constructor(container: HTMLElement) {
    this.container = container;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.explodeSystem = new ExplodedViewSystem();

    this.scene = new THREE.Scene();
    this.scene.background = null;

    this.camera = new THREE.PerspectiveCamera(
      40,
      container.clientWidth / container.clientHeight,
      0.1,
      200,
    );
    this.camera.position.set(-14.07, 18.17, 20.59);
    this.camera.lookAt(0, 1.5, 0);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    const envTexture = pmremGenerator.fromScene(new RoomEnvironment()).texture;
    this.scene.environment = envTexture;
    pmremGenerator.dispose();

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(10, 15, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.set(512, 512);
    this.scene.add(dirLight);
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.4));

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.target.set(0, 1.5, 0);
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 3.0;
    this.controls.enableZoom = true;
    this.controls.enablePan = false;
    this.controls.minDistance = 10;
    this.controls.maxDistance = 30;
    this.controls.minPolarAngle = 0.4;
    this.controls.maxPolarAngle = 1.4;
    this.controls.update();

    this.labelSystem = new LabelSystem(container);

    this.buildModel();
    this.labelSystem.createLabels(this.scene);

    container.addEventListener('mousemove', this.onMouseMove);
    container.addEventListener('click', this.onMouseClick);

    this.resizeObserver = new ResizeObserver(() => this.onResize());
    this.resizeObserver.observe(container);

    this.animate();
  }

  private buildModel(): void {
    const upper = createUpperMember();
    this.scene.add(upper);
    this.explodeSystem.registerPart(upper, 'upperMember');

    const base = createLowerBase();
    this.scene.add(base);
    this.explodeSystem.registerPart(base, 'lowerBase');

    const bolts = createEyebolts();
    this.scene.add(bolts);
    this.explodeSystem.registerPart(bolts, 'eyebolts');

    const outlet = createOutlet();
    this.scene.add(outlet);
    this.explodeSystem.registerPart(outlet, 'outlet');

    const remote = createRemoteControl();
    this.scene.add(remote);
    this.explodeSystem.registerPart(remote, 'remote');
  }

  private animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate);
    this.controls.update();
    this.explodeSystem.update();
    this.renderer.render(this.scene, this.camera);
    this.labelSystem.render(this.scene, this.camera);
  };

  private onResize(): void {
    const { clientWidth: w, clientHeight: h } = this.container;
    if (w === 0 || h === 0) return;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.labelSystem.updateSize(w, h);
  }

  private onMouseMove = (event: MouseEvent): void => {
    const rect = this.container.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);

    let partId: string | null = null;
    for (const hit of intersects) {
      let obj: THREE.Object3D | null = hit.object;
      while (obj) {
        if (obj.userData?.partId) { partId = obj.userData.partId; break; }
        obj = obj.parent;
      }
      if (partId) break;
    }

    if (partId !== this.hoveredPart) {
      this.clearHighlight();
      this.hoveredPart = partId;
      if (partId) this.highlightPart(partId);
      this.onPartHover?.(partId);
      this.container.style.cursor = partId ? 'pointer' : 'grab';
    }
  };

  private onMouseClick = (): void => {
    this.onPartClick?.(this.hoveredPart);
  };

  private highlightPart(partId: string): void {
    this.scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh && obj.userData?.partId === partId) {
        if (!this.originalMaterials.has(obj)) {
          this.originalMaterials.set(obj, obj.material as THREE.Material);
        }
        const mat = (obj.material as THREE.MeshStandardMaterial).clone();
        mat.emissive = new THREE.Color(0x444444);
        mat.emissiveIntensity = 0.4;
        obj.material = mat;
      }
    });
  }

  private clearHighlight(): void {
    this.originalMaterials.forEach((orig, mesh) => { mesh.material = orig; });
    this.originalMaterials.clear();
  }

  // --- Public API ---
  toggleLabels(): void { this.labelSystem.toggle(); }
  get labelsVisible(): boolean { return this.labelSystem.visible; }

  toggleExploded(): void { this.explodeSystem.toggle(); }
  get isExploded(): boolean { return this.explodeSystem.isExploded; }

  setAutoRotate(on: boolean): void { this.controls.autoRotate = on; }
  get autoRotating(): boolean { return this.controls.autoRotate; }

  resetCamera(): void {
    this.camera.position.set(-14.07, 18.17, 20.59);
    this.controls.target.set(0, 1.5, 0);
    this.controls.update();
  }

  getPartInfo(partId: string) { return PART_INFO[partId] ?? null; }

  getCameraSettings(): string {
    const p = this.camera.position;
    const t = this.controls.target;
    return `camera.position.set(${p.x.toFixed(2)}, ${p.y.toFixed(2)}, ${p.z.toFixed(2)});\ncontrols.target.set(${t.x.toFixed(2)}, ${t.y.toFixed(2)}, ${t.z.toFixed(2)});`;
  }

  getCameraReadout(): string {
    const p = this.camera.position;
    const t = this.controls.target;
    return `pos(${p.x.toFixed(1)}, ${p.y.toFixed(1)}, ${p.z.toFixed(1)}) → tgt(${t.x.toFixed(1)}, ${t.y.toFixed(1)}, ${t.z.toFixed(1)})`;
  }

  dispose(): void {
    if (this.animationId !== null) cancelAnimationFrame(this.animationId);
    this.container.removeEventListener('mousemove', this.onMouseMove);
    this.container.removeEventListener('click', this.onMouseClick);
    this.resizeObserver.disconnect();
    this.controls.dispose();
    this.renderer.dispose();
    if (this.renderer.domElement.parentNode)
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    if (this.labelSystem.renderer.domElement.parentNode)
      this.labelSystem.renderer.domElement.parentNode.removeChild(this.labelSystem.renderer.domElement);
  }
}
