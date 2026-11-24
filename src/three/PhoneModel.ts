import * as THREE from 'three';

function createRoundedRectShape(width: number, height: number, radius: number): THREE.Shape {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;
  const r = Math.min(radius, width / 2, height / 2);

  shape.moveTo(x + r, y);
  shape.lineTo(x + width - r, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + r);
  shape.lineTo(x + width, y + height - r);
  shape.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  shape.lineTo(x + r, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);
  shape.closePath();

  return shape;
}

function normalizeShapeUVs(geometry: THREE.BufferGeometry, width: number, height: number) {
  const pos = geometry.attributes.position;
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    const px = pos.getX(i);
    const py = pos.getY(i);
    uv[i * 2] = (px + width / 2) / width;
    uv[i * 2 + 1] = (py + height / 2) / height;
  }
  geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
}

function createBackEmblemTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, 512, 512);
    // 상단 로고랑 같은 S자 곡선
    const size = 460;
    const scale = size / 36;
    const ox = (512 - size) / 2;
    const oy = (512 - size) / 2;

    ctx.save();
    ctx.strokeStyle = 'rgba(112, 124, 142, 0.68)';
    ctx.lineWidth = 3.1 * scale;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(ox + 9 * scale, oy + 19.125 * scale);
    ctx.bezierCurveTo(
      ox + 13.5 * scale,
      oy + 12.75 * scale,
      ox + 18 * scale,
      oy + 12.75 * scale,
      ox + 18 * scale,
      oy + 18 * scale,
    );
    ctx.bezierCurveTo(
      ox + 18 * scale,
      oy + 23.25 * scale,
      ox + 22.5 * scale,
      oy + 23.25 * scale,
      ox + 27 * scale,
      oy + 16.875 * scale,
    );
    ctx.stroke();
    ctx.restore();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

export interface BuiltPhone {
  group: THREE.Group;
  dispose: () => void;
}

export function createPhoneModel(screenTexture: THREE.Texture): BuiltPhone {
  const group = new THREE.Group();
  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];
  const extraTextures: THREE.Texture[] = [];

  const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
    geometries.push(g);
    return g;
  };
  const trackMat = <T extends THREE.Material>(m: T): T => {
    materials.push(m);
    return m;
  };

  // 1 unit ≈ 72mm
  const bodyW = 1.06;
  const bodyH = 2.22;
  const bodyD = 0.088;
  const cornerR = 0.165;

  const titaniumMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: 0xd0d6e0,
      metalness: 0.92,
      roughness: 0.24,
      anisotropy: 0.72,
      clearcoat: 0.25,
      clearcoatRoughness: 0.3,
    }),
  );

  const darkTrimMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x3b4252,
      metalness: 0.75,
      roughness: 0.42,
    }),
  );

  const backGlassMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: 0xe6ebf2,
      metalness: 0.06,
      roughness: 0.44,
      clearcoat: 0.65,
      clearcoatRoughness: 0.22,
    }),
  );

  const cameraBumpMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: 0xe3e8f0,
      metalness: 0.08,
      roughness: 0.14,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
    }),
  );

  const cameraRingMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: 0xc2cbd9,
      metalness: 0.96,
      roughness: 0.14,
      anisotropy: 0.75,
      clearcoat: 0.45,
      clearcoatRoughness: 0.12,
    }),
  );

  const cameraBarrelMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x07090d,
      metalness: 0.25,
      roughness: 0.68,
    }),
  );

  const cameraInnerBaffleMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x111622,
      metalness: 0.55,
      roughness: 0.32,
    }),
  );

  const sapphireLensMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: 0x0b1f44,
      metalness: 0.18,
      roughness: 0.03,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      iridescence: 1.0,
      iridescenceIOR: 1.52,
      ior: 1.77,
    }),
  );

  const lensCoverGlassMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: 0x081020,
      metalness: 0.05,
      roughness: 0.02,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      iridescence: 0.85,
      iridescenceIOR: 1.42,
      transparent: true,
      opacity: 0.34,
      depthWrite: false,
    }),
  );

  const bezelMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: 0x07090d,
      metalness: 0.08,
      roughness: 0.14,
      clearcoat: 0.9,
      clearcoatRoughness: 0.06,
    }),
  );

  const screenMat = trackMat(
    new THREE.MeshBasicMaterial({
      map: screenTexture,
      toneMapped: false,
    }),
  );

  const frontGlassMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: 0x05080f,
      metalness: 0.0,
      roughness: 0.04,
      clearcoat: 0.5,
      clearcoatRoughness: 0.04,
      envMapIntensity: 0.32,
      transparent: true,
      opacity: 0.035,
      depthWrite: false,
    }),
  );

  // z=0 중심으로 압출
  const chassisShape = createRoundedRectShape(bodyW, bodyH, cornerR);
  const chassisGeo = trackGeo(
    new THREE.ExtrudeGeometry(chassisShape, {
      depth: bodyD,
      bevelEnabled: true,
      bevelThickness: 0.016,
      bevelSize: 0.015,
      bevelSegments: 8,
      curveSegments: 24,
    }),
  );
  chassisGeo.translate(0, 0, -bodyD / 2);
  chassisGeo.computeVertexNormals();
  const chassisMesh = new THREE.Mesh(chassisGeo, titaniumMat);
  group.add(chassisMesh);

  const bandGeo = trackGeo(new THREE.BoxGeometry(bodyW + 0.032, 0.014, bodyD * 0.64));
  const topBand = new THREE.Mesh(bandGeo, darkTrimMat);
  topBand.position.set(0, bodyH * 0.37, 0);
  const botBand = new THREE.Mesh(bandGeo, darkTrimMat);
  botBand.position.set(0, -bodyH * 0.37, 0);
  group.add(topBand, botBand);

  const backW = bodyW - 0.034;
  const backH = bodyH - 0.034;
  const backShape = createRoundedRectShape(backW, backH, cornerR - 0.016);
  const backGeo = trackGeo(new THREE.ShapeGeometry(backShape, 24));
  normalizeShapeUVs(backGeo, backW, backH);
  const backMesh = new THREE.Mesh(backGeo, backGlassMat);
  backMesh.rotation.y = Math.PI;
  backMesh.position.z = -bodyD / 2 - 0.0168;
  group.add(backMesh);

  const emblemTex = createBackEmblemTexture();
  extraTextures.push(emblemTex);
  const emblemMat = trackMat(
    new THREE.MeshBasicMaterial({
      map: emblemTex,
      transparent: true,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    }),
  );
  const emblemGeo = trackGeo(new THREE.PlaneGeometry(0.46, 0.46));
  const emblemMesh = new THREE.Mesh(emblemGeo, emblemMat);
  emblemMesh.rotation.y = Math.PI;
  emblemMesh.position.set(0, -0.02, -bodyD / 2 - 0.0176);
  group.add(emblemMesh);

  const islandSize = 0.455;
  const islandShape = createRoundedRectShape(islandSize, islandSize, 0.115);
  const islandGeo = trackGeo(
    new THREE.ExtrudeGeometry(islandShape, {
      depth: 0.02,
      bevelEnabled: true,
      bevelThickness: 0.009,
      bevelSize: 0.009,
      bevelSegments: 6,
      curveSegments: 20,
    }),
  );
  const islandMesh = new THREE.Mesh(islandGeo, cameraBumpMat);
  islandMesh.rotation.y = Math.PI;
  islandMesh.position.set(bodyW / 2 - 0.29, bodyH / 2 - 0.29, -bodyD / 2 - 0.017);
  group.add(islandMesh);

  const collarShape = createRoundedRectShape(islandSize + 0.024, islandSize + 0.024, 0.122);
  const collarGeo = trackGeo(
    new THREE.ExtrudeGeometry(collarShape, {
      depth: 0.006,
      bevelEnabled: true,
      bevelThickness: 0.003,
      bevelSize: 0.003,
      bevelSegments: 3,
      curveSegments: 20,
    }),
  );
  const collarMesh = new THREE.Mesh(collarGeo, titaniumMat);
  collarMesh.rotation.y = Math.PI;
  collarMesh.position.set(islandMesh.position.x, islandMesh.position.y, -bodyD / 2 - 0.0165);
  group.add(collarMesh);

  const lensOffsets: Array<[number, number]> = [
    [0.108, 0.108],
    [0.108, -0.108],
    [-0.108, 0.0],
  ];

  // Lathe 기준축(+Y)을 -Z 방향으로 눕힘
  const bezelProfile = [
    new THREE.Vector2(0.070, 0.0),
    new THREE.Vector2(0.090, 0.0),
    new THREE.Vector2(0.090, 0.018),
    new THREE.Vector2(0.082, 0.024),
    new THREE.Vector2(0.072, 0.024),
    new THREE.Vector2(0.070, 0.016),
    new THREE.Vector2(0.070, 0.0),
  ];
  const lensHousingGeo = trackGeo(new THREE.LatheGeometry(bezelProfile, 40));

  const barrelBackGeo = trackGeo(new THREE.CircleGeometry(0.070, 32));
  const baffleRingGeo = trackGeo(new THREE.RingGeometry(0.044, 0.066, 36));
  const innerBaffleGeo = trackGeo(new THREE.RingGeometry(0.032, 0.044, 36));
  const opticElementGeo = trackGeo(new THREE.SphereGeometry(0.032, 28, 16, 0, Math.PI * 2, 0, Math.PI * 0.42));
  const coverGlassGeo = trackGeo(new THREE.CircleGeometry(0.071, 36));

  const plateauFrontZ = -bodyD / 2 - 0.045;

  lensOffsets.forEach(([ox, oy]) => {
    const lx = islandMesh.position.x + ox;
    const ly = islandMesh.position.y + oy;

    const ring = new THREE.Mesh(lensHousingGeo, cameraRingMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(lx, ly, plateauFrontZ + 0.004);
    group.add(ring);

    const cavity = new THREE.Mesh(barrelBackGeo, cameraBarrelMat);
    cavity.rotation.y = Math.PI;
    cavity.position.set(lx, ly, plateauFrontZ - 0.002);
    group.add(cavity);

    const baffle1 = new THREE.Mesh(baffleRingGeo, cameraInnerBaffleMat);
    baffle1.rotation.y = Math.PI;
    baffle1.position.set(lx, ly, plateauFrontZ - 0.005);
    group.add(baffle1);

    const baffle2 = new THREE.Mesh(innerBaffleGeo, cameraBarrelMat);
    baffle2.rotation.y = Math.PI;
    baffle2.position.set(lx, ly, plateauFrontZ - 0.008);
    group.add(baffle2);

    // 내부 렌즈도 -Z 방향 맞춤
    const optic = new THREE.Mesh(opticElementGeo, sapphireLensMat);
    optic.rotation.x = -Math.PI / 2;
    optic.position.set(lx, ly, plateauFrontZ - 0.003);
    group.add(optic);

    const cover = new THREE.Mesh(coverGlassGeo, lensCoverGlassMat);
    cover.rotation.y = Math.PI;
    cover.position.set(lx, ly, plateauFrontZ - 0.019);
    cover.renderOrder = 3;
    group.add(cover);
  });

  const flashRimGeo = trackGeo(new THREE.RingGeometry(0.028, 0.036, 28));
  const flashDiffuserGeo = trackGeo(new THREE.CircleGeometry(0.028, 28));
  const flashMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: 0xfef6dc,
      roughness: 0.35,
      metalness: 0.04,
      clearcoat: 0.9,
      clearcoatRoughness: 0.08,
    }),
  );
  const flashRim = new THREE.Mesh(flashRimGeo, cameraRingMat);
  flashRim.rotation.y = Math.PI;
  flashRim.position.set(islandMesh.position.x - 0.108, islandMesh.position.y + 0.132, plateauFrontZ - 0.002);
  group.add(flashRim);

  const flashMesh = new THREE.Mesh(flashDiffuserGeo, flashMat);
  flashMesh.rotation.y = Math.PI;
  flashMesh.position.set(islandMesh.position.x - 0.108, islandMesh.position.y + 0.132, plateauFrontZ - 0.003);
  group.add(flashMesh);

  const lidarRimGeo = trackGeo(new THREE.RingGeometry(0.032, 0.039, 28));
  const lidarGlassGeo = trackGeo(new THREE.CircleGeometry(0.032, 28));
  const lidarGlassMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: 0x06080c,
      metalness: 0.1,
      roughness: 0.04,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
    }),
  );
  const lidarRim = new THREE.Mesh(lidarRimGeo, cameraRingMat);
  lidarRim.rotation.y = Math.PI;
  lidarRim.position.set(islandMesh.position.x - 0.108, islandMesh.position.y - 0.132, plateauFrontZ - 0.002);
  group.add(lidarRim);

  const lidarMesh = new THREE.Mesh(lidarGlassGeo, lidarGlassMat);
  lidarMesh.rotation.y = Math.PI;
  lidarMesh.position.set(islandMesh.position.x - 0.108, islandMesh.position.y - 0.132, plateauFrontZ - 0.003);
  group.add(lidarMesh);

  const rearMicGeo = trackGeo(new THREE.CircleGeometry(0.008, 16));
  const rearMic = new THREE.Mesh(rearMicGeo, cameraBarrelMat);
  rearMic.rotation.y = Math.PI;
  rearMic.position.set(islandMesh.position.x - 0.165, islandMesh.position.y - 0.078, plateauFrontZ - 0.002);
  group.add(rearMic);

  const makeSideButton = (x: number, y: number, h: number) => {
    const bShape = createRoundedRectShape(0.022, h, 0.009);
    const bGeo = trackGeo(
      new THREE.ExtrudeGeometry(bShape, {
        depth: 0.024,
        bevelEnabled: true,
        bevelThickness: 0.004,
        bevelSize: 0.004,
        bevelSegments: 3,
      }),
    );
    const bMesh = new THREE.Mesh(bGeo, titaniumMat);
    bMesh.rotation.y = Math.PI / 2;
    bMesh.position.set(x, y, 0.011);
    group.add(bMesh);
  };

  makeSideButton(bodyW / 2 + 0.008, 0.22, 0.24); // 전원
  makeSideButton(-bodyW / 2 - 0.028, 0.44, 0.095); // 액션
  makeSideButton(-bodyW / 2 - 0.028, 0.26, 0.165); // 볼륨 +
  makeSideButton(-bodyW / 2 - 0.028, 0.05, 0.165); // 볼륨 -

  const usbcShape = createRoundedRectShape(0.16, 0.036, 0.018);
  const usbcGeo = trackGeo(new THREE.ShapeGeometry(usbcShape, 12));
  const usbcMesh = new THREE.Mesh(usbcGeo, cameraBarrelMat);
  usbcMesh.rotation.x = Math.PI / 2;
  usbcMesh.position.set(0, -bodyH / 2 - 0.0165, 0);
  group.add(usbcMesh);

  const speakerHoleGeo = trackGeo(new THREE.CylinderGeometry(0.009, 0.009, 0.006, 12));
  for (let side of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      const hole = new THREE.Mesh(speakerHoleGeo, cameraBarrelMat);
      hole.position.set(side * (0.16 + i * 0.036), -bodyH / 2 - 0.015, 0);
      group.add(hole);
    }
  }

  const bezelW = bodyW - 0.026;
  const bezelH = bodyH - 0.026;
  const bezelShape = createRoundedRectShape(bezelW, bezelH, cornerR - 0.012);
  const bezelGeo = trackGeo(new THREE.ShapeGeometry(bezelShape, 28));
  const bezelMesh = new THREE.Mesh(bezelGeo, bezelMat);
  bezelMesh.position.z = bodyD / 2 + 0.0168;
  group.add(bezelMesh);

  const screenW = bodyW - 0.072;
  const screenH = bodyH - 0.072;
  const screenShape = createRoundedRectShape(screenW, screenH, cornerR - 0.036);
  const screenGeo = trackGeo(new THREE.ShapeGeometry(screenShape, 28));
  normalizeShapeUVs(screenGeo, screenW, screenH);
  const screenMesh = new THREE.Mesh(screenGeo, screenMat);
  screenMesh.position.z = bodyD / 2 + 0.018;
  group.add(screenMesh);

  const glassGeo = trackGeo(new THREE.ShapeGeometry(bezelShape, 28));
  const glassMesh = new THREE.Mesh(glassGeo, frontGlassMat);
  glassMesh.position.z = bodyD / 2 + 0.0202;
  glassMesh.renderOrder = 2;
  group.add(glassMesh);

  const selfieLensGeo = trackGeo(new THREE.CircleGeometry(0.019, 24));
  const selfieLens = new THREE.Mesh(selfieLensGeo, sapphireLensMat);
  selfieLens.position.set(0.072, screenH / 2 - 0.078, bodyD / 2 + 0.0192);
  group.add(selfieLens);

  const dispose = () => {
    geometries.forEach((g) => g.dispose());
    materials.forEach((m) => m.dispose());
    extraTextures.forEach((t) => t.dispose());
  };

  return { group, dispose };
}
