import * as THREE from 'three';
import { createBlackPlasticMaterial, createRubberMaterial } from '../materials';
import {
  REMOTE_WIDTH,
  REMOTE_HEIGHT,
  REMOTE_DEPTH,
  SWITCH_WIDTH,
  SWITCH_HEIGHT,
  SWITCH_DEPTH,
  SWITCH_SPACING,
  CORD_RADIUS,
  PLUG_WIDTH,
  PLUG_HEIGHT,
  PLUG_DEPTH,
  PRONG_RADIUS,
  PRONG_LENGTH,
  PRONG_SPACING,
  BASE_RADIUS,
} from '../constants';
import { CatmullRomCurve3, TubeGeometry } from 'three';

function createRemoteFaceTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 320;
  const ctx = canvas.getContext('2d')!;

  // Black background
  ctx.fillStyle = '#222222';
  ctx.fillRect(0, 0, 512, 320);

  // Labels
  ctx.fillStyle = '#C4A44A';
  ctx.font = 'bold 28px sans-serif';
  ctx.textAlign = 'center';

  const labels = ['LIGHTS', 'ROTATE', 'MUSIC'];
  const xPositions = [105, 256, 407];

  labels.forEach((label, i) => {
    ctx.fillText(label, xPositions[i], 55);

    // ON/OFF labels
    ctx.font = '20px sans-serif';
    ctx.fillText('ON', xPositions[i], 120);
    ctx.fillText('OFF', xPositions[i], 255);
    ctx.font = 'bold 28px sans-serif';

    // Switch recess
    ctx.fillStyle = '#111111';
    ctx.fillRect(xPositions[i] - 32, 130, 64, 105);
    ctx.fillStyle = '#C4A44A';
  });

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

function createRemoteBox(): THREE.Group {
  const box = new THREE.Group();
  const material = createBlackPlasticMaterial();

  // Main body with rounded edges (beveled box)
  const bodyGeometry = new THREE.BoxGeometry(
    REMOTE_WIDTH,
    REMOTE_HEIGHT,
    REMOTE_DEPTH,
    2, 2, 2,
  );
  const body = new THREE.Mesh(bodyGeometry, material);
  body.userData = { partId: 'remote' };
  box.add(body);

  // Front face with texture
  const faceGeometry = new THREE.PlaneGeometry(REMOTE_WIDTH * 0.95, REMOTE_HEIGHT * 0.95);
  const faceTexture = createRemoteFaceTexture();
  const faceMaterial = new THREE.MeshStandardMaterial({
    map: faceTexture,
    metalness: 0.0,
    roughness: 0.5,
  });
  const face = new THREE.Mesh(faceGeometry, faceMaterial);
  face.position.z = REMOTE_DEPTH / 2 + 0.01;
  face.userData = { partId: 'remote' };
  box.add(face);

  // 3 light-switch style toggles
  const switchPlateMat = new THREE.MeshStandardMaterial({
    color: 0x151515,
    metalness: 0.05,
    roughness: 0.8,
  });
  const switchRecessMat = new THREE.MeshStandardMaterial({
    color: 0x0a0a0a,
    metalness: 0.0,
    roughness: 0.95,
  });
  const toggleMat = new THREE.MeshStandardMaterial({
    color: 0x1e1e1e,
    metalness: 0.15,
    roughness: 0.6,
  });

  const plateW = 0.55;
  const plateH = 0.75;
  const plateD = 0.06;
  const recessW = 0.35;
  const recessH = 0.55;
  const recessD = 0.08;
  const paddleW = 0.28;
  const paddleH = 0.35;
  const paddleD = 0.15;
  const faceZ = REMOTE_DEPTH / 2;

  for (let i = -1; i <= 1; i++) {
    // Raised switch plate
    const plate = new THREE.Mesh(
      new THREE.BoxGeometry(plateW, plateH, plateD),
      switchPlateMat,
    );
    plate.position.set(i * SWITCH_SPACING, -0.08, faceZ + plateD / 2);
    plate.userData = { partId: 'remote' };
    box.add(plate);

    // Recessed opening in the plate
    const recess = new THREE.Mesh(
      new THREE.BoxGeometry(recessW, recessH, recessD),
      switchRecessMat,
    );
    recess.position.set(i * SWITCH_SPACING, -0.08, faceZ + plateD - recessD / 2 + 0.01);
    recess.userData = { partId: 'remote' };
    box.add(recess);

    // Toggle paddle (tilted up = ON position, varies per switch)
    const paddle = new THREE.Mesh(
      new THREE.BoxGeometry(paddleW, paddleH, paddleD),
      toggleMat,
    );
    // Alternate: LIGHTS off, ROTATE on, MUSIC off
    const tiltAngle = i === 0 ? -0.35 : 0.35;
    const pivotY = -0.08;
    paddle.position.set(
      i * SWITCH_SPACING,
      pivotY - Math.sin(tiltAngle) * 0.1,
      faceZ + plateD + paddleD / 2 + 0.01,
    );
    paddle.rotation.x = tiltAngle;
    paddle.userData = { partId: 'remote' };
    box.add(paddle);

    // Small nub on the paddle face (grip ridge)
    const nub = new THREE.Mesh(
      new THREE.BoxGeometry(paddleW * 0.6, 0.04, 0.03),
      toggleMat,
    );
    nub.position.set(
      i * SWITCH_SPACING,
      pivotY - Math.sin(tiltAngle) * 0.1,
      faceZ + plateD + paddleD + 0.02,
    );
    nub.rotation.x = tiltAngle;
    nub.userData = { partId: 'remote' };
    box.add(nub);
  }

  box.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true;
    }
  });

  return box;
}

function createCord(
  start: THREE.Vector3,
  end: THREE.Vector3,
): THREE.Mesh {
  const mid1 = new THREE.Vector3(
    start.x + (end.x - start.x) * 0.3,
    start.y - 1.5,
    start.z + (end.z - start.z) * 0.3 - 2,
  );
  const mid2 = new THREE.Vector3(
    start.x + (end.x - start.x) * 0.7,
    end.y - 1.0,
    start.z + (end.z - start.z) * 0.7 - 1.5,
  );

  const curve = new CatmullRomCurve3([start, mid1, mid2, end]);
  const geometry = new TubeGeometry(curve, 32, CORD_RADIUS, 8, false);
  const material = createRubberMaterial();
  const cord = new THREE.Mesh(geometry, material);
  cord.castShadow = true;
  cord.userData = { partId: 'cord' };
  return cord;
}

function createWallPlug(): THREE.Group {
  const plug = new THREE.Group();
  const material = createRubberMaterial();

  // Plug body
  const bodyGeom = new THREE.BoxGeometry(PLUG_WIDTH, PLUG_HEIGHT, PLUG_DEPTH);
  const body = new THREE.Mesh(bodyGeom, material);
  body.userData = { partId: 'cord' };
  plug.add(body);

  // Two prongs
  const prongGeom = new THREE.CylinderGeometry(PRONG_RADIUS, PRONG_RADIUS, PRONG_LENGTH, 8);
  const prongMaterial = new THREE.MeshStandardMaterial({
    color: 0x999999,
    metalness: 0.8,
    roughness: 0.3,
  });

  const prong1 = new THREE.Mesh(prongGeom, prongMaterial);
  prong1.position.set(-PRONG_SPACING, 0.2, PLUG_DEPTH / 2 + PRONG_LENGTH / 2);
  prong1.rotation.x = Math.PI / 2;
  prong1.userData = { partId: 'cord' };
  plug.add(prong1);

  const prong2 = new THREE.Mesh(prongGeom, prongMaterial);
  prong2.position.set(PRONG_SPACING, 0.2, PLUG_DEPTH / 2 + PRONG_LENGTH / 2);
  prong2.rotation.x = Math.PI / 2;
  prong2.userData = { partId: 'cord' };
  plug.add(prong2);

  plug.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true;
    }
  });

  return plug;
}

export function createRemoteControl(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'remote';

  // Remote box
  const remote = createRemoteBox();
  remote.position.set(0, -2.5, -BASE_RADIUS - 3);
  remote.rotation.x = -0.3; // tilted toward viewer slightly
  group.add(remote);

  // Cord from remote to base area
  const cordToBase = createCord(
    new THREE.Vector3(-REMOTE_WIDTH / 2 - 0.1, -2.5, -BASE_RADIUS - 3),
    new THREE.Vector3(-2, -0.5, -BASE_RADIUS + 1),
  );
  group.add(cordToBase);

  // Cord from remote to wall plug
  const wallPlugPos = new THREE.Vector3(REMOTE_WIDTH / 2 + 4, -2.5, -BASE_RADIUS - 5);
  const cordToPlug = createCord(
    new THREE.Vector3(REMOTE_WIDTH / 2 + 0.1, -2.5, -BASE_RADIUS - 3),
    wallPlugPos,
  );
  group.add(cordToPlug);

  // Wall plug
  const wallPlug = createWallPlug();
  wallPlug.position.copy(wallPlugPos);
  wallPlug.rotation.y = 0.3;
  group.add(wallPlug);

  group.userData = { partId: 'remote' };

  return group;
}
