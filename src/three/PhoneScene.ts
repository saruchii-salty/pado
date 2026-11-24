import * as THREE from 'three';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { createPhoneModel, BuiltPhone } from './PhoneModel';
import { PhoneScreenRenderer } from './PhoneScreenRenderer';

interface Pose {
  x: number;
  y: number;
  z: number;
  rx: number;
  ry: number;
  rz: number;
  scale: number;
}

interface MotionSegment {
  startT: number;
  endT: number;
  from: Pose;
  mid?: Pose;
  to: Pose;
}

interface SectionStage {
  startT: number;
  endT: number;
  enter: Pose;
  leave: Pose;
  midToNext?: Pose;
}

function buildMotionSegments(stages: SectionStage[]): MotionSegment[] {
  const segments: MotionSegment[] = [];
  for (let i = 0; i < stages.length; i++) {
    const curr = stages[i];
    segments.push({
      startT: curr.startT,
      endT: curr.endT,
      from: curr.enter,
      to: curr.leave,
    });
    if (i < stages.length - 1) {
      const next = stages[i + 1];
      segments.push({
        startT: curr.endT,
        endT: next.startT,
        from: curr.leave,
        mid: curr.midToNext,
        to: next.enter,
      });
    }
  }
  return segments;
}

// 7개 섹션(각 560vh, 총 스크롤 3820vh)에 맞춘 구간 테이블
// 전환 구간은 midToNext 경유 2차 베지어로 이어서 중간에 멈추지 않게 함
const DESKTOP_SEGMENTS = buildMotionSegments([
  {
    startT: 0.000,
    endT: 0.068,
    enter: { x: 0.00, y: -0.46, z: 0.00, rx: -0.07, ry: -0.18, rz: -0.02, scale: 0.88 },
    leave: { x: 0.00, y: -0.43, z: 0.06, rx: -0.02, ry: 0.06, rz: 0.02, scale: 0.90 },
    midToNext: { x: 0.00, y: -0.20, z: 0.18, rx: 0.05, ry: Math.PI, rz: -0.04, scale: 0.97 },
  },
  {
    startT: 0.168,
    endT: 0.228,
    enter: { x: 0.00, y: -0.06, z: 0.14, rx: 0.02, ry: Math.PI * 2 - 0.12, rz: -0.02, scale: 1.04 },
    leave: { x: 0.00, y: -0.04, z: 0.18, rx: -0.02, ry: Math.PI * 2 + 0.10, rz: 0.02, scale: 1.06 },
    midToNext: { x: -0.02, y: 0.26, z: 0.12, rx: 0.03, ry: Math.PI * 2, rz: -0.05, scale: 0.92 },
  },
  {
    startT: 0.308,
    endT: 0.368,
    enter: { x: -0.03, y: 0.56, z: 0.04, rx: 0.04, ry: Math.PI * 2 - 0.14, rz: -0.10, scale: 0.76 },
    leave: { x: 0.03, y: 0.54, z: 0.08, rx: 0.02, ry: Math.PI * 2 + 0.10, rz: -0.05, scale: 0.78 },
    midToNext: { x: -0.64, y: 0.24, z: 0.14, rx: 0.04, ry: Math.PI * 2 + 0.24, rz: -0.05, scale: 0.98 },
  },
  {
    startT: 0.452,
    endT: 0.512,
    enter: { x: -1.32, y: -0.04, z: 0.18, rx: 0.05, ry: Math.PI * 2 + 0.34, rz: -0.04, scale: 1.16 },
    leave: { x: -1.28, y: -0.01, z: 0.22, rx: 0.01, ry: Math.PI * 2 + 0.22, rz: 0.01, scale: 1.18 },
    midToNext: { x: 0.00, y: 0.02, z: 0.30, rx: -0.04, ry: Math.PI * 2 - 0.06, rz: 0.06, scale: 1.06 },
  },
  {
    startT: 0.596,
    endT: 0.656,
    enter: { x: 1.30, y: -0.04, z: 0.20, rx: 0.03, ry: Math.PI * 2 - 0.32, rz: 0.03, scale: 1.16 },
    leave: { x: 1.26, y: -0.05, z: 0.24, rx: -0.01, ry: Math.PI * 2 - 0.22, rz: -0.01, scale: 1.18 },
    midToNext: { x: 1.29, y: -0.04, z: 0.23, rx: -0.02, ry: Math.PI * 2 - 0.25, rz: -0.02, scale: 1.18 },
  },
  {
    startT: 0.740,
    endT: 0.800,
    enter: { x: 1.32, y: -0.04, z: 0.22, rx: -0.03, ry: Math.PI * 2 - 0.28, rz: -0.02, scale: 1.18 },
    leave: { x: 1.28, y: -0.02, z: 0.26, rx: 0.02, ry: Math.PI * 2 - 0.18, rz: 0.01, scale: 1.20 },
    midToNext: { x: 0.00, y: 0.10, z: 0.18, rx: 0.04, ry: Math.PI * 2 + 0.04, rz: -0.03, scale: 1.08 },
  },
  {
    startT: 0.884,
    endT: 1.000,
    enter: { x: -1.26, y: 0.16, z: 0.12, rx: 0.02, ry: Math.PI * 2 + 0.20, rz: 0.00, scale: 1.02 },
    leave: { x: -1.26, y: 0.18, z: 0.14, rx: 0.00, ry: Math.PI * 2 + 0.14, rz: 0.00, scale: 1.02 },
  },
]);

const MOBILE_SEGMENTS = buildMotionSegments([
  {
    startT: 0.000,
    endT: 0.068,
    enter: { x: 0.0, y: -0.36, z: 0.00, rx: -0.05, ry: -0.14, rz: -0.02, scale: 0.68 },
    leave: { x: 0.0, y: -0.34, z: 0.05, rx: 0.01, ry: 0.08, rz: 0.01, scale: 0.70 },
    midToNext: { x: 0.0, y: 0.02, z: 0.10, rx: 0.04, ry: Math.PI, rz: -0.03, scale: 0.68 },
  },
  {
    startT: 0.168,
    endT: 0.228,
    enter: { x: 0.0, y: 0.31, z: 0.00, rx: 0.02, ry: Math.PI * 2 - 0.12, rz: 0.02, scale: 0.66 },
    leave: { x: 0.0, y: 0.31, z: 0.05, rx: -0.02, ry: Math.PI * 2 + 0.10, rz: -0.02, scale: 0.68 },
    midToNext: { x: 0.0, y: 0.36, z: 0.06, rx: 0.03, ry: Math.PI * 2 + 0.02, rz: -0.05, scale: 0.64 },
  },
  {
    startT: 0.308,
    endT: 0.368,
    enter: { x: 0.0, y: 0.44, z: 0.02, rx: 0.03, ry: Math.PI * 2 - 0.10, rz: -0.08, scale: 0.60 },
    leave: { x: 0.0, y: 0.44, z: 0.04, rx: 0.02, ry: Math.PI * 2 + 0.08, rz: -0.04, scale: 0.61 },
    midToNext: { x: 0.0, y: 0.34, z: 0.08, rx: 0.04, ry: Math.PI * 2 + 0.16, rz: -0.04, scale: 0.64 },
  },
  {
    startT: 0.452,
    endT: 0.512,
    enter: { x: 0.0, y: 0.31, z: 0.00, rx: 0.03, ry: Math.PI * 2 + 0.14, rz: -0.02, scale: 0.66 },
    leave: { x: 0.0, y: 0.31, z: 0.05, rx: -0.02, ry: Math.PI * 2 - 0.06, rz: 0.01, scale: 0.68 },
    midToNext: { x: 0.0, y: 0.32, z: 0.10, rx: -0.03, ry: Math.PI * 2, rz: 0.05, scale: 0.66 },
  },
  {
    startT: 0.596,
    endT: 0.656,
    enter: { x: 0.0, y: 0.31, z: 0.00, rx: 0.02, ry: Math.PI * 2 - 0.12, rz: 0.02, scale: 0.66 },
    leave: { x: 0.0, y: 0.31, z: 0.05, rx: -0.02, ry: Math.PI * 2 + 0.06, rz: -0.02, scale: 0.68 },
    midToNext: { x: 0.0, y: 0.31, z: 0.05, rx: -0.02, ry: Math.PI * 2 - 0.04, rz: -0.01, scale: 0.68 },
  },
  {
    startT: 0.740,
    endT: 0.800,
    enter: { x: 0.0, y: 0.31, z: 0.05, rx: -0.02, ry: Math.PI * 2 - 0.12, rz: -0.01, scale: 0.66 },
    leave: { x: 0.0, y: 0.31, z: 0.08, rx: 0.02, ry: Math.PI * 2 + 0.06, rz: 0.01, scale: 0.68 },
    midToNext: { x: 0.0, y: 0.34, z: 0.06, rx: 0.03, ry: Math.PI * 2 + 0.02, rz: -0.03, scale: 0.66 },
  },
  {
    startT: 0.884,
    endT: 1.000,
    enter: { x: 0.0, y: 0.36, z: 0.00, rx: 0.02, ry: Math.PI * 2 + 0.10, rz: 0.00, scale: 0.64 },
    leave: { x: 0.0, y: 0.37, z: 0.02, rx: 0.00, ry: Math.PI * 2 + 0.06, rz: 0.00, scale: 0.64 },
  },
]);

function smoothstep01(t: number): number {
  const x = Math.max(0, Math.min(1, t));
  return x * x * (3 - 2 * x);
}

function evalChannel(a: number, mid: number | undefined, b: number, u: number): number {
  if (mid === undefined) return a + (b - a) * u;
  const ctrl = 2 * mid - 0.5 * (a + b);
  const inv = 1 - u;
  return inv * inv * a + 2 * inv * u * ctrl + u * u * b;
}

function sampleSegments(segments: MotionSegment[], t: number, out: Pose) {
  const clamped = Math.max(0, Math.min(1, t));
  let i = 0;
  while (i < segments.length - 1 && clamped > segments[i].endT) {
    i++;
  }
  const seg = segments[i];
  const span = Math.max(0.0001, seg.endT - seg.startT);
  const u = smoothstep01((clamped - seg.startT) / span);

  out.x = evalChannel(seg.from.x, seg.mid?.x, seg.to.x, u);
  out.y = evalChannel(seg.from.y, seg.mid?.y, seg.to.y, u);
  out.z = evalChannel(seg.from.z, seg.mid?.z, seg.to.z, u);
  out.rx = evalChannel(seg.from.rx, seg.mid?.rx, seg.to.rx, u);
  out.ry = evalChannel(seg.from.ry, seg.mid?.ry, seg.to.ry, u);
  out.rz = evalChannel(seg.from.rz, seg.mid?.rz, seg.to.rz, u);
  out.scale = evalChannel(seg.from.scale, seg.mid?.scale, seg.to.scale, u);
}

function createSoftContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(128, 128, 8, 128, 128, 122);
    grad.addColorStop(0, 'rgba(18, 28, 45, 0.28)');
    grad.addColorStop(0.5, 'rgba(18, 28, 45, 0.10)');
    grad.addColorStop(1, 'rgba(18, 28, 45, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
  }
  return new THREE.CanvasTexture(canvas);
}

// 금속/유리 반사용 스튜디오 환경맵
function buildStudioEnvScene(mode: 'light' | 'dark'): THREE.Scene {
  const envScene = new THREE.Scene();

  const domeGeo = new THREE.SphereGeometry(20, 32, 24);
  const domeMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      uTop: { value: new THREE.Color(mode === 'light' ? 0xf9fafb : 0x0d1320) },
      uHorizon: { value: new THREE.Color(mode === 'light' ? 0xedf1f7 : 0x161f33) },
      uBottom: { value: new THREE.Color(mode === 'light' ? 0xd9e0eb : 0x090d17) },
    },
    vertexShader: `
      varying vec3 vDir;
      void main() {
        vDir = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vDir;
      uniform vec3 uTop;
      uniform vec3 uHorizon;
      uniform vec3 uBottom;
      void main() {
        float y = vDir.y;
        vec3 col = y > 0.0
          ? mix(uHorizon, uTop, smoothstep(0.0, 0.85, y))
          : mix(uHorizon, uBottom, smoothstep(0.0, 0.85, -y));
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
  const dome = new THREE.Mesh(domeGeo, domeMat);
  envScene.add(dome);

  // HDR 하이라이트용 1.0 초과 밝기
  const addSoftbox = (
    w: number,
    h: number,
    pos: [number, number, number],
    rgb: [number, number, number],
  ) => {
    const geo = new THREE.PlaneGeometry(w, h);
    const mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(rgb[0], rgb[1], rgb[2]),
      side: THREE.DoubleSide,
      toneMapped: false,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(pos[0], pos[1], pos[2]);
    mesh.lookAt(0, 0, 0);
    envScene.add(mesh);
  };

  if (mode === 'light') {
    addSoftbox(7, 12, [9, 5, 7], [3.5, 3.55, 3.65]);
    addSoftbox(5, 11, [-9, 3, 5], [2.4, 2.5, 2.7]);
    addSoftbox(10, 3, [0, 10, -4], [2.8, 2.85, 2.95]);
    addSoftbox(4, 9, [-6, -2, -8], [2.0, 2.1, 2.25]);
  } else {
    addSoftbox(6, 12, [9, 4, 6], [2.0, 2.1, 2.3]);
    addSoftbox(6, 12, [-8, 3, 5], [1.4, 1.65, 2.1]);
    addSoftbox(10, 3, [0, 10, -3], [1.6, 1.75, 2.0]);
    addSoftbox(5, 9, [5, -2, -8], [1.2, 1.35, 1.7]);
  }

  return envScene;
}

function disposeEnvScene(envScene: THREE.Scene) {
  envScene.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      obj.geometry.dispose();
      if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
      else obj.material.dispose();
    }
  });
}

export class PhoneScene {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private phone: BuiltPhone;
  private screenRenderer: PhoneScreenRenderer;
  private shadowPlane: THREE.Mesh;
  private shadowTex: THREE.CanvasTexture;
  private shadowMat: THREE.MeshBasicMaterial;
  private lightEnvRT: THREE.WebGLRenderTarget;
  private darkEnvRT: THREE.WebGLRenderTarget;
  private rimLight: THREE.DirectionalLight;
  private keyLight: THREE.DirectionalLight;

  private targetScroll = 0;
  private dampedScroll = 0;
  private isSoftwareGl: boolean;
  private frameId = 0;
  private disposed = false;
  private clock = new THREE.Clock();
  private elapsed = 0;
  private sampleOut: Pose = { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0, scale: 1 };
  private reducedMotion = false;
  private currentEnvMode: 'light' | 'dark' = 'light';

  constructor(container: HTMLElement) {
    this.container = container;
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.isSoftwareGl = (() => {
      try {
        const probe = document.createElement('canvas').getContext('webgl2');
        if (!probe) return true;
        const ext = probe.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : probe.RENDERER;
        const gpu = String(probe.getParameter(param));
        probe.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance',
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.04;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(container.clientWidth || window.innerWidth, container.clientHeight || window.innerHeight);
    this.renderer.domElement.style.display = 'block';
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 40);
    this.camera.position.set(0, 0.12, 5.85);
    this.camera.lookAt(0, 0.12, 0);

    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    pmremGenerator.compileEquirectangularShader();

    const lightEnvScene = buildStudioEnvScene('light');
    this.lightEnvRT = pmremGenerator.fromScene(lightEnvScene, 0.03);
    disposeEnvScene(lightEnvScene);

    const darkEnvScene = buildStudioEnvScene('dark');
    this.darkEnvRT = pmremGenerator.fromScene(darkEnvScene, 0.03);
    disposeEnvScene(darkEnvScene);

    pmremGenerator.dispose();

    this.scene.environment = this.lightEnvRT.texture;
    this.scene.environmentIntensity = 1.08;

    const hemiLight = new THREE.HemisphereLight(0xf5f7fa, 0xdde3ec, 0.72);
    this.scene.add(hemiLight);

    this.keyLight = new THREE.DirectionalLight(0xfffdf9, 1.38);
    this.keyLight.position.set(3.2, 4.5, 4.2);
    this.scene.add(this.keyLight);

    this.rimLight = new THREE.DirectionalLight(0xdbe7f5, 1.15);
    this.rimLight.position.set(-4.0, 2.2, -3.2);
    this.scene.add(this.rimLight);

    if (!this.isSoftwareGl) {
      RectAreaLightUniformsLib.init();
      const softboxLeft = new THREE.RectAreaLight(0xffffff, 1.8, 3.0, 5.0);
      softboxLeft.position.set(-3.5, 1.0, 2.5);
      softboxLeft.lookAt(0, 0, 0);
      this.scene.add(softboxLeft);

      const softboxRight = new THREE.RectAreaLight(0xf1f5f9, 1.4, 2.6, 4.5);
      softboxRight.position.set(3.8, -0.5, 2.0);
      softboxRight.lookAt(0, 0, 0);
      this.scene.add(softboxRight);
    }

    const maxAniso = this.renderer.capabilities.getMaxAnisotropy();
    this.screenRenderer = new PhoneScreenRenderer(maxAniso);
    this.phone = createPhoneModel(this.screenRenderer.texture);
    this.scene.add(this.phone.group);

    this.shadowTex = createSoftContactShadowTexture();
    this.shadowMat = new THREE.MeshBasicMaterial({
      map: this.shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.34,
    });
    const shadowGeo = new THREE.PlaneGeometry(2.0, 0.8);
    this.shadowPlane = new THREE.Mesh(shadowGeo, this.shadowMat);
    this.shadowPlane.rotation.x = -Math.PI / 2;
    this.shadowPlane.position.set(0, -1.48, 0);
    this.scene.add(this.shadowPlane);

    if (!this.isSoftwareGl) {
      this.renderer.compile(this.scene, this.camera);
    }

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        if (!this.disposed) {
          this.screenRenderer.render(this.dampedScroll, this.elapsed, true);
        }
      });
    }

    window.addEventListener('resize', this.handleResize);
    this.renderer.domElement.addEventListener('webglcontextlost', this.handleContextLost);
    this.renderer.domElement.addEventListener('webglcontextrestored', this.handleContextRestored);

    this.tick();
  }

  public setTargetScroll(progress: number) {
    this.targetScroll = Math.max(0, Math.min(1, progress));
  }

  private handleResize = () => {
    if (this.disposed) return;
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
  };

  private handleContextLost = (e: Event) => {
    e.preventDefault();
    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);
  };

  private handleContextRestored = () => {
    if (!this.disposed) {
      this.tick();
    }
  };

  private afterDraw(cb: () => void) {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    if (gl && typeof gl.fenceSync === 'function') {
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (this.disposed) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          this.frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          this.frameId = window.setTimeout(cb, 80);
        }
      };
      this.frameId = window.setTimeout(poll, 5);
    } else {
      this.frameId = window.setTimeout(cb, 80);
    }
  }

  private tick = () => {
    if (this.disposed) return;

    const delta = Math.min(this.clock.getDelta(), 0.05);
    this.elapsed += delta;
    const elapsed = this.elapsed;

    this.dampedScroll = THREE.MathUtils.damp(this.dampedScroll, this.targetScroll, 3.4, delta);

    const isDesktop = (this.container.clientWidth || window.innerWidth) >= 1024;
    const segments = isDesktop ? DESKTOP_SEGMENTS : MOBILE_SEGMENTS;
    sampleSegments(segments, this.dampedScroll, this.sampleOut);

    const floatY = this.reducedMotion ? 0 : Math.sin(elapsed * 1.25) * 0.022;
    const floatRotZ = this.reducedMotion ? 0 : Math.cos(elapsed * 0.95) * 0.008;

    this.phone.group.position.set(this.sampleOut.x, this.sampleOut.y + floatY, this.sampleOut.z);
    this.phone.group.rotation.set(
      this.sampleOut.rx,
      this.sampleOut.ry,
      this.sampleOut.rz + floatRotZ,
    );
    this.phone.group.scale.setScalar(this.sampleOut.scale);

    // 3번 섹션에서는 폰이 상단에 떠 있어서 바닥 그림자 숨김
    const hideShadowInUpper = smoothstep01((this.dampedScroll - 0.265) / 0.025) * (1 - smoothstep01((this.dampedScroll - 0.415) / 0.025));
    this.shadowPlane.position.set(this.sampleOut.x, this.sampleOut.y - 1.24 * this.sampleOut.scale, this.sampleOut.z);
    this.shadowPlane.scale.setScalar(this.sampleOut.scale * (1 - floatY * 0.35));

    // 6번 다크 섹션 진입/이탈 조명 크로스페이드
    const nightIn = smoothstep01((this.dampedScroll - 0.702) / 0.034);
    const nightOut = smoothstep01((this.dampedScroll - 0.850) / 0.034);
    const nightWeight = Math.max(0, Math.min(1, nightIn - nightOut));

    const targetEnvMode = nightWeight > 0.5 ? 'dark' : 'light';
    if (targetEnvMode !== this.currentEnvMode) {
      this.currentEnvMode = targetEnvMode;
      this.scene.environment = targetEnvMode === 'dark' ? this.darkEnvRT.texture : this.lightEnvRT.texture;
    }

    this.scene.environmentRotation.y = this.dampedScroll * Math.PI * 0.55 + Math.sin(elapsed * 0.3) * 0.05;
    this.scene.environmentIntensity = 1.08 - nightWeight * 0.14;
    this.rimLight.intensity = 1.15 + nightWeight * 0.95;
    this.keyLight.intensity = 1.38 - nightWeight * 0.32;
    this.shadowMat.opacity = Math.max(0, (0.34 - nightWeight * 0.20) * (1 - hideShadowInUpper));

    this.screenRenderer.render(this.dampedScroll, elapsed);

    this.renderer.render(this.scene, this.camera);

    if (this.isSoftwareGl) {
      this.afterDraw(this.tick);
    } else {
      this.frameId = requestAnimationFrame(this.tick);
    }
  };

  public dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);
    window.removeEventListener('resize', this.handleResize);
    this.renderer.domElement.removeEventListener('webglcontextlost', this.handleContextLost);
    this.renderer.domElement.removeEventListener('webglcontextrestored', this.handleContextRestored);

    this.phone.dispose();
    this.screenRenderer.dispose();
    this.shadowPlane.geometry.dispose();
    this.shadowMat.dispose();
    this.shadowTex.dispose();
    this.lightEnvRT.dispose();
    this.darkEnvRT.dispose();
    this.renderer.dispose();

    if (this.renderer.domElement.parentNode === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
