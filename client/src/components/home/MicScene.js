import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

/*
  Scroll-driven 3D centrepiece for the homepage.
  Default model: a procedural studio microphone (no external files).
  If the admin uploads a .glb (e.g. a 3D model of SA), it replaces the mic.

  Public API:
    const scene = new MicScene(canvas, { modelUrl, compact, still })
    scene.setProgress(0..1)   // scroll position through the hero
    scene.setPointer(x, y)    // -1..1, gentle parallax
    scene.dispose()
*/

const ACID = new THREE.Color('#D5FF00');
const lerp = (a, b, t) => a + (b - a) * t;
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const seg = (p, a, b) => Math.min(Math.max((p - a) / (b - a), 0), 1);

function buildMic() {
  const mic = new THREE.Group();

  const chrome = new THREE.MeshStandardMaterial({ color: 0xd9d9d9, metalness: 1, roughness: 0.22 });
  const gunmetal = new THREE.MeshStandardMaterial({ color: 0x1b1b1b, metalness: 0.85, roughness: 0.32 });
  const rubber = new THREE.MeshStandardMaterial({ color: 0x0c0c0c, metalness: 0.1, roughness: 0.8 });

  // Head: dark inner capsule + chrome wire grille + latitude bands
  const inner = new THREE.Mesh(new THREE.CapsuleGeometry(0.56, 0.62, 12, 40), new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.9 }));
  const grille = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.62, 0.62, 14, 44),
    new THREE.MeshStandardMaterial({ color: 0xcfcfcf, metalness: 1, roughness: 0.28, wireframe: true })
  );
  const head = new THREE.Group();
  head.add(inner, grille);
  [-0.31, 0, 0.31].forEach((y) => {
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.625, 0.02, 12, 80), chrome);
    band.rotation.x = Math.PI / 2;
    band.position.y = y;
    head.add(band);
  });
  head.position.y = 1.45;
  mic.add(head);

  // Accent collar: the one acid-green detail, softly glowing
  const collar = new THREE.Mesh(
    new THREE.TorusGeometry(0.6, 0.05, 16, 90),
    // Unlit and excluded from tone mapping so it stays the exact brand green.
    new THREE.MeshBasicMaterial({ color: ACID, toneMapped: false })
  );
  collar.rotation.x = Math.PI / 2;
  collar.position.y = 0.62;
  mic.add(collar);

  // Neck, body, end cap
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.44, 0.22, 56), chrome);
  neck.position.y = 0.5;
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.27, 2.3, 56), gunmetal);
  body.position.y = -0.75;
  const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.31, 0.7, 56), rubber);
  grip.position.y = -0.95;
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.25, 0.16, 48), chrome);
  cap.position.y = -1.98;
  mic.add(neck, body, grip, cap);

  // Cable leaving the bottom and curling out of frame
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, -2.05, 0),
    new THREE.Vector3(0.05, -2.6, 0.1),
    new THREE.Vector3(0.6, -3.1, 0.4),
    new THREE.Vector3(0.2, -3.8, -0.2),
    new THREE.Vector3(-0.8, -4.6, 0.3),
    new THREE.Vector3(-0.4, -6.5, 0),
  ]);
  mic.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 120, 0.075, 12, false), rubber));

  mic.userData.head = head;
  return mic;
}

/** Expanding rings from the mic head: the "voice". */
function buildRings() {
  const g = new THREE.Group();
  for (let i = 0; i < 3; i += 1) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1, 0.008, 8, 120),
      new THREE.MeshBasicMaterial({ color: ACID, transparent: true, opacity: 0, depthWrite: false, toneMapped: false })
    );
    ring.userData.offset = i / 3;
    g.add(ring);
  }
  return g;
}

function buildDust(count) {
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    pos[i * 3] = (Math.random() - 0.5) * 18;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 12;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  return new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xf5f5f5, size: 0.018, transparent: true, opacity: 0.5, depthWrite: false }));
}

export default class MicScene {
  constructor(canvas, { modelUrl = '', compact = false, still = false } = {}) {
    this.canvas = canvas;
    this.compact = compact;
    this.still = still;
    this.target = 0;
    this.progress = 0;
    this.pointer = { x: 0, y: 0, sx: 0, sy: 0 };
    this.clock = new THREE.Clock();
    this.running = false;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, compact ? 1.5 : 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    this.renderer = renderer;

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    this.envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = this.envTex;
    pmrem.dispose();
    this.scene = scene;

    this.camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    this.camera.position.set(0, 0.3, 9);

    // Lights: cool key, acid rim from behind-left
    const key = new THREE.DirectionalLight(0xffffff, 1.6);
    key.position.set(3, 4, 5);
    const rim = new THREE.PointLight(ACID, 30, 12, 2);
    rim.position.set(-2.5, 1.5, -2);
    scene.add(key, rim, new THREE.AmbientLight(0xffffff, 0.15));

    this.rig = new THREE.Group(); // receives scroll + pointer motion
    this.model = buildMic();
    this.rig.add(this.model);
    this.rings = buildRings();
    this.rig.add(this.rings);
    scene.add(this.rig);
    this.dust = buildDust(compact ? 220 : 480);
    scene.add(this.dust);

    if (modelUrl) this.loadModel(modelUrl);

    this.resize = this.resize.bind(this);
    this.tick = this.tick.bind(this);
    this.ro = new ResizeObserver(this.resize);
    this.ro.observe(canvas);
    this.resize();
  }

  async loadModel(url) {
    try {
      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
      const gltf = await new GLTFLoader().loadAsync(url);
      const obj = gltf.scene;
      const box = new THREE.Box3().setFromObject(obj);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      const s = 4.2 / Math.max(size.x, size.y, size.z);
      obj.scale.setScalar(s);
      obj.position.sub(center.multiplyScalar(s));
      const holder = new THREE.Group();
      holder.add(obj);
      holder.userData.head = { position: new THREE.Vector3(0, (size.y * s) / 2 - 0.4, 0) };
      this.rig.remove(this.model);
      this.model = holder;
      this.rig.add(holder);
      if (this.still) this.render();
    } catch (err) {
      console.warn('Custom 3D model could not be loaded, showing the default microphone.', err);
    }
  }

  resize() {
    const { clientWidth: w, clientHeight: h } = this.canvas;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.compact = w < 768;
    if (this.still) this.render();
  }

  setProgress(p) { this.target = Math.min(Math.max(p, 0), 1); if (this.still) { this.progress = this.target; this.render(); } }

  setPointer(x, y) { this.pointer.x = x; this.pointer.y = y; }

  start() {
    if (this.running || this.still) return;
    this.running = true;
    this.clock.start();
    this.raf = requestAnimationFrame(this.tick);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  tick() {
    if (!this.running) return;
    this.render();
    this.raf = requestAnimationFrame(this.tick);
  }

  /** Pose for scroll progress p. Three beats: present, turn to camera, held at an angle. */
  pose(p, t) {
    const a = ease(seg(p, 0, 0.5));
    const b = ease(seg(p, 0.5, 1));
    const c = this.compact;
    const rig = this.rig;

    // Desktop: mic sits right of the text for beats 1-2, swings left for the call to action.
    // Phone: mic stays centred in the top half, text sits below it.
    const x = c ? [0, 0, 0] : [1.75, 1.9, -1.9];
    const y = c ? [1.05, 0.55, 0.6] : [-0.2, -0.1, -0.3];
    const sc = c ? [0.5, 0.56, 0.52] : [0.78, 0.88, 0.84];
    const bob = this.still ? 0 : Math.sin(t * 0.9) * 0.06;
    rig.position.x = lerp(lerp(x[0], x[1], a), x[2], b);
    rig.position.y = lerp(lerp(y[0], y[1], a), y[2], b) + bob;
    rig.rotation.y = lerp(-0.5, Math.PI * 2 - 0.2, a) + b * Math.PI * 0.75 + (this.still ? 0 : t * 0.08);
    rig.rotation.z = lerp(lerp(0.12, 0, a), c ? -0.3 : -0.5, b);
    rig.rotation.x = lerp(0.05, 0.22, a) - b * 0.12;
    rig.scale.setScalar(lerp(lerp(sc[0], sc[1], a), sc[2], b));

    this.camera.position.z = lerp(lerp(9, 8.2, a), 8.8, b);
    this.camera.position.x = this.pointer.sx * 0.35;
    this.camera.position.y = 0.3 + this.pointer.sy * 0.25;
    this.camera.lookAt(0, 0, 0);

    // Voice rings pulse out from the head, strongest in the middle beat
    const head = this.model.userData.head?.position || new THREE.Vector3(0, 1.45, 0);
    const strength = 0.35 + 0.65 * Math.sin(Math.PI * seg(p, 0.15, 0.85));
    this.rings.position.copy(head);
    this.rings.children.forEach((ring) => {
      const k = this.still ? 0.4 + ring.userData.offset * 0.5 : (t * 0.35 + ring.userData.offset) % 1;
      ring.scale.setScalar(0.9 + k * 2.4);
      ring.material.opacity = (1 - k) * 0.45 * strength;
      ring.rotation.x = Math.PI / 2;
    });

    this.dust.rotation.y = t * 0.01 + p * 0.4;
    this.dust.position.y = p * 1.5;
  }

  render() {
    const t = this.still ? 0 : this.clock.getElapsedTime();
    this.progress += (this.target - this.progress) * (this.still ? 1 : 0.08);
    this.pointer.sx += (this.pointer.x - this.pointer.sx) * 0.05;
    this.pointer.sy += (this.pointer.y - this.pointer.sy) * 0.05;
    this.pose(this.progress, t);
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.stop();
    this.ro.disconnect();
    this.scene.traverse((o) => {
      o.geometry?.dispose?.();
      if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose());
    });
    this.envTex.dispose();
    this.renderer.dispose();
  }
}

