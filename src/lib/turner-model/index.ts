import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

import { COLOR_BACKGROUND, PART_INFO } from './constants';
import { createUpperMember } from './parts/upper-member';
import { createLowerBase } from './parts/lower-base';
import { createEyebolts } from './parts/eyebolts';
import { createOutlet } from './parts/outlet';
import { createRemoteControl } from './parts/remote-control';
import { LabelSystem } from './labels';
import { ExplodedViewSystem } from './exploded-view';

export class TurnerModelViewer {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private labelSystem: LabelSystem;
  private explodeSystem: ExplodedViewSystem;
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;
  private hoveredPart: string | null = null;
  private originalMaterials: Map<THREE.Mesh, THREE.Material> = new Map();
  private animationId: number | null = null;
  private resizeObserver: ResizeObserver;

  // Callbacks for UI
  onPartHover?: (partId: string | null, event?: MouseEvent) => void;
  onPartClick?: (partId: string | null) => void;

  constructor(container: HTMLElement) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.explodeSystem = new ExplodedViewSystem();

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      200,
    );
    this.camera.position.set(14, 10, 14);
    this.camera.lookAt(0, 2, 0);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    // Environment map (studio-like reflections, no HDR file needed)
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    const envTexture = pmremGenerator.fromScene(new RoomEnvironment()).texture;
    this.scene.environment = envTexture;
    this.scene.background = new THREE.Color(COLOR_BACKGROUND);
    pmremGenerator.dispose();

    // Lights
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(10, 15, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.set(1024, 1024);
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 50;
    dirLight.shadow.camera.left = -15;
    dirLight.shadow.camera.right = 15;
    dirLight.shadow.camera.top = 15;
    dirLight.shadow.camera.bottom = -15;
    this.scene.add(dirLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);

    // Ground plane (shadow catcher)
    const groundGeo = new THREE.PlaneGeometry(60, 60);
    const groundMat = new THREE.ShadowMaterial({ opacity: 0.08 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.15;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.target.set(0, 2, 0);
    this.controls.minDistance = 8;
    this.controls.maxDistance = 50;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 2.0;
    this.controls.update();

    // Label system
    this.labelSystem = new LabelSystem(container);

    // Build model
    this.buildModel();

    // Events
    container.addEventListener('mousemove', this.onMouseMove);
    container.addEventListener('click', this.onMouseClick);

    // Resize observer
    this.resizeObserver = new ResizeObserver(() => this.onResize());
    this.resizeObserver.observe(container);

    // Start animation loop
    this.animate();
  }

  private buildModel(): void {
    // Upper member (skirt + cup + platform)
    const upperMember = createUpperMember();
    this.scene.add(upperMember);
    this.explodeSystem.registerPart(upperMember, 'upperMember');

    // Lower base
    const lowerBase = createLowerBase();
    this.scene.add(lowerBase);
    this.explodeSystem.registerPart(lowerBase, 'lowerBase');

    // Eyebolts
    const eyebolts = createEyebolts();
    this.scene.add(eyebolts);
    this.explodeSystem.registerPart(eyebolts, 'eyebolts');

    // Outlet
    const outlet = createOutlet();
    this.scene.add(outlet);
    this.explodeSystem.registerPart(outlet, 'outlet');

    // Remote control + cord + plug
    const remote = createRemoteControl();
    this.scene.add(remote);
    this.explodeSystem.registerPart(remote, 'remote');

    // Labels
    this.labelSystem.createLabels(this.scene);
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
      const obj = hit.object;
      if (obj.userData?.partId) {
        partId = obj.userData.partId;
        break;
      }
      // Walk up to find partId on parent
      let parent = obj.parent;
      while (parent) {
        if (parent.userData?.partId) {
          partId = parent.userData.partId;
          break;
        }
        parent = parent.parent;
      }
      if (partId) break;
    }

    if (partId !== this.hoveredPart) {
      this.clearHighlight();
      this.hoveredPart = partId;
      if (partId) this.highlightPart(partId);
      this.onPartHover?.(partId, event);
      this.container.style.cursor = partId ? 'pointer' : 'grab';
    }
  };

  private onMouseClick = (event: MouseEvent): void => {
    // Only fire on actual clicks (not drag-releases)
    const rect = this.container.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);

    let partId: string | null = null;
    for (const hit of intersects) {
      const obj = hit.object;
      if (obj.userData?.partId) {
        partId = obj.userData.partId;
        break;
      }
      let parent = obj.parent;
      while (parent) {
        if (parent.userData?.partId) {
          partId = parent.userData.partId;
          break;
        }
        parent = parent.parent;
      }
      if (partId) break;
    }

    this.onPartClick?.(partId);
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
    this.originalMaterials.forEach((originalMat, mesh) => {
      mesh.material = originalMat;
    });
    this.originalMaterials.clear();
  }

  // --- Public API ---

  toggleLabels(): void {
    this.labelSystem.toggle();
  }

  get labelsVisible(): boolean {
    return this.labelSystem.visible;
  }

  toggleExploded(): void {
    this.explodeSystem.toggle();
  }

  get isExploded(): boolean {
    return this.explodeSystem.isExploded;
  }

  setAutoRotate(enabled: boolean): void {
    this.controls.autoRotate = enabled;
  }

  get autoRotating(): boolean {
    return this.controls.autoRotate;
  }

  resetCamera(): void {
    this.camera.position.set(14, 10, 14);
    this.controls.target.set(0, 2, 0);
    this.controls.update();
  }

  getPartInfo(partId: string): { name: string; description: string } | null {
    return PART_INFO[partId] ?? null;
  }

  dispose(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
    }
    this.container.removeEventListener('mousemove', this.onMouseMove);
    this.container.removeEventListener('click', this.onMouseClick);
    this.resizeObserver.disconnect();
    this.controls.dispose();
    this.renderer.dispose();

    // Remove DOM elements
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
    if (this.labelSystem.renderer.domElement.parentNode) {
      this.labelSystem.renderer.domElement.parentNode.removeChild(
        this.labelSystem.renderer.domElement,
      );
    }
  }
}
