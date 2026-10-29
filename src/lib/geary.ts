import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

/** Geary's parts (named in the OBJ → GLB conversion) and their colours from the mascot art. */
const PAINT: Record<string, THREE.MeshPhysicalMaterialParameters> = {
  gear: { color: "#d7d9e2", metalness: 0.8, roughness: 0.24, clearcoat: 0.7, clearcoatRoughness: 0.15 },
  gear_back: { color: "#a9adbd", metalness: 0.8, roughness: 0.32 },
  suit: { color: "#2a3876", roughness: 0.58, sheen: 0.8, sheenColor: new THREE.Color("#8b9cf2"), sheenRoughness: 0.45 },
  lapel: { color: "#1b2552", roughness: 0.45, clearcoat: 0.3 },
  legs: { color: "#1c2653", roughness: 0.55 },
  collar: { color: "#f6f5fb", roughness: 0.4 },
  tie: { color: "#f26b22", roughness: 0.3, clearcoat: 0.9 },
  eye_l: { color: "#14141f", roughness: 0.08, clearcoat: 1 },
  eye_r: { color: "#14141f", roughness: 0.08, clearcoat: 1 },
  mouth: { color: "#14141f", roughness: 0.3 },
};

/** Copy quantized attributes to float and bake each mesh's node transform, so every part lives in the model's own (Rhino) units. */
function bake(root: THREE.Object3D): Map<string, THREE.Mesh> {
  root.updateMatrixWorld(true);
  const parts = new Map<string, THREE.Mesh>();
  const meshes: THREE.Mesh[] = [];
  root.traverse((o) => (o as THREE.Mesh).isMesh && meshes.push(o as THREE.Mesh));
  for (const m of meshes) {
    // parts share one vertex buffer in the GLB; give each its own vertices so bounds and pivots are per part
    const geo = m.geometry.index ? m.geometry.toNonIndexed() : m.geometry;
    m.geometry = geo;
    for (const name of ["position", "normal"]) {
      const a = geo.getAttribute(name) as THREE.BufferAttribute;
      if (!a) continue;
      const out = new Float32Array(a.count * a.itemSize);
      for (let i = 0; i < a.count; i++) for (let k = 0; k < a.itemSize; k++) out[i * a.itemSize + k] = a.getComponent(i, k);
      geo.setAttribute(name, new THREE.BufferAttribute(out, a.itemSize));
    }
    geo.applyMatrix4(m.matrixWorld);
    geo.deleteAttribute("uv");
    m.position.set(0, 0, 0);
    m.quaternion.identity();
    m.scale.set(1, 1, 1);
    const name = (m.material as THREE.Material).name;
    // mirrored parts in the Rhino file (the right eye, for one) have reversed winding, so draw both faces
    m.material = new THREE.MeshPhysicalMaterial({ ...(PAINT[name] ?? PAINT.gear), side: THREE.DoubleSide });
    m.name = name;
    parts.set(name, m);
  }
  return parts;
}

/** Move a mesh into a pivot group at its own centre (in the X/Z face plane), so it can spin, blink or glance. */
function pivotAt(mesh: THREE.Mesh, parent: THREE.Object3D) {
  mesh.geometry.computeBoundingBox();
  const c = mesh.geometry.boundingBox!.getCenter(new THREE.Vector3());
  mesh.geometry.translate(-c.x, -c.y, -c.z);
  const pivot = new THREE.Group();
  pivot.position.copy(c);
  pivot.add(mesh);
  parent.add(pivot);
  return { pivot, home: c.clone() };
}

export type GearyEye = { pivot: THREE.Group; home: THREE.Vector3; mesh: THREE.Mesh };

export type GearyRig = {
  /** Geary, 2 units tall, centred on its own origin. */
  root: THREE.Group;
  model: THREE.Group;
  gear: THREE.Group;
  eyes: GearyEye[];
  state: { base: number; v: number; angle: number; squint: number; blink: boolean };
  /** Spin the gear head faster for a moment (and squint). */
  spin(boost?: number): void;
  /** Turn the gear, blink, and glance toward a world-space point (null: let the eyes wander). */
  update(dt: number, now: number, look: THREE.Vector3 | null): void;
  dispose(): void;
};

let buffer: Promise<ArrayBuffer> | null = null;
/** One download per page, however many Gearys are on it. */
const fetchModel = () => (buffer ??= fetch("/models/geary.glb").then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(r.status))));

export async function loadGeary({ reduce = false } = {}): Promise<GearyRig> {
  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  const gltf = await loader.parseAsync((await fetchModel()).slice(0), "/models/");
  const parts = bake(gltf.scene);
  const model = new THREE.Group();
  parts.forEach((m) => model.add(m));

  // the gear head turns about its own hub, behind the face and suit
  const g = pivotAt(parts.get("gear")!, model);
  const back = parts.get("gear_back");
  if (back) {
    back.geometry.translate(-g.home.x, -g.home.y, -g.home.z);
    g.pivot.add(back);
  }

  // eyes: each on its own pivot with a catch-light, so they glance and blink
  const shine = new THREE.MeshBasicMaterial({ color: "#ffffff" });
  const eyes: GearyEye[] = (["eye_l", "eye_r"] as const).map((n) => {
    const mesh = parts.get(n)!;
    const e = pivotAt(mesh, model);
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.42, 20, 12), shine);
    dot.scale.set(1, 0.3, 1);
    dot.position.set(-0.45, 0.08, -0.85);
    const small = dot.clone();
    small.scale.multiplyScalar(0.5);
    small.position.set(0.45, 0.08, 0.7);
    e.pivot.add(dot, small);
    return { ...e, mesh };
  });

  // Rhino export lies in the XZ plane, face toward +Y, head toward −Z
  model.rotation.x = Math.PI / 2;
  model.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  model.position.sub(box.getCenter(new THREE.Vector3()));
  const root = new THREE.Group();
  const norm = new THREE.Group();
  norm.scale.setScalar(2 / size.y);
  norm.add(model);
  root.add(norm);

  const state = { base: reduce ? 0 : 0.35, v: reduce ? 0 : 0.35, angle: 0, squint: 0, blink: true };
  const local = new THREE.Vector3();
  let nextBlink = performance.now() + 2500, blinkAt = -1;

  return {
    root,
    model,
    gear: g.pivot,
    eyes,
    state,
    spin(boost = 14) {
      state.v += boost;
      state.squint = 1;
    },
    update(dt, now, look) {
      state.v += (state.base - state.v) * Math.min(1, dt * 1.4);
      state.angle += state.v * dt;
      g.pivot.rotation.y = -state.angle;
      state.squint = Math.max(0, state.squint - dt * 0.8);

      if (look) model.worldToLocal(local.copy(look));
      if (state.blink && now > nextBlink) {
        blinkAt = now;
        nextBlink = now + 2600 + Math.random() * 3200;
      }
      const b = blinkAt > 0 ? (now - blinkAt) / 160 : 2;
      const lid = b < 2 ? 1 - Math.sin(Math.min(b, 1) * Math.PI) * 0.92 : 1;
      for (const e of eyes) {
        const tx = look ? e.home.x + Math.tanh((local.x - e.home.x) / 22) * 1.15 : e.home.x + Math.sin(now / 1700) * 0.7;
        const tz = look ? e.home.z + Math.tanh((local.z - e.home.z) / 22) * 1.0 : e.home.z + Math.sin(now / 2300) * 0.35;
        e.pivot.position.x += (tx - e.pivot.position.x) * 0.18;
        e.pivot.position.z += (tz - e.pivot.position.z) * 0.18;
        e.pivot.scale.z = Math.max(0.08, lid * (1 - state.squint * 0.75));
      }
    },
    dispose() {
      root.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.isMesh) {
          m.geometry.dispose();
          (m.material as THREE.Material).dispose();
        }
      });
    },
  };
}
