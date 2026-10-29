"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { gearOutline } from "@/lib/gear";
import { loadGeary, type GearyRig } from "@/lib/geary";
import { clamp01, easeInOut, range, sectionProgress } from "@/lib/motion";
import { LINKS } from "@/data/site";
import { Arrow } from "./icons";

const RAMP = ["#8b9cf2", "#a97fdc", "#d25fa6", "#e4405e"].map((c) => new THREE.Color(c));

function rampColor(t: number, out: THREE.Color) {
  const x = Math.max(0, Math.min(0.999, t)) * (RAMP.length - 1);
  const i = Math.floor(x);
  return out.copy(RAMP[i]).lerp(RAMP[i + 1], x - i);
}

/** A glossy PMC gear: extruded, with a hub hole, painted periwinkle → rose across its face. */
function buildGear(teeth: number) {
  const shape = new THREE.Shape();
  gearOutline(1, { teeth, rTip: 1, rRoot: 0.8, tipHalf: 1.1 / teeth, rootHalf: 1.76 / teeth }).forEach(([x, y], i) =>
    i ? shape.lineTo(x, y) : shape.moveTo(x, y),
  );
  const hole = new THREE.Path();
  hole.absarc(0, 0, 0.34, 0, Math.PI * 2, true);
  shape.holes.push(hole);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.28,
    bevelEnabled: true,
    bevelThickness: 0.08,
    bevelSize: 0.06,
    bevelSegments: 6,
    curveSegments: 40,
  });
  geo.center();
  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    rampColor((pos.getX(i) - pos.getY(i) + 1.6) / 3.2, c);
    colors.set([c.r, c.g, c.b], i * 3);
  }
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  return geo;
}

/** Gears floating around Geary (relative to Geary, kept clear of the headline): [x, y, z, size, teeth, spin direction]. */
const FLOAT: [number, number, number, number, number, number][] = [
  [1.25, 1.05, -1.4, 0.42, 9, -1],
  [1.2, -0.95, 0.2, 0.3, 8, 1],
  [-1.05, -1.2, -1.6, 0.34, 9, -1],
  [0.4, 1.45, -3, 0.5, 12, 1],
  [2.1, 0.1, -3.4, 0.7, 12, 1],
];

const easeIn = (x: number) => x * x * x;

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasHost = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current!;
    const host = canvasHost.current!;
    const portal = portalRef.current!;
    const copy = copyRef.current!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    // full-screen canvas: 1.5× is visually indistinguishable here and ~45% fewer pixels than 2×
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

    const camera = new THREE.PerspectiveCamera(30, 1, 0.01, 60);
    const key = new THREE.DirectionalLight("#ffffff", 2.1);
    key.position.set(2, 3, 4);
    const rimL = new THREE.PointLight("#8b9cf2", 30, 12);
    rimL.position.set(-2.6, 1, -1);
    const rimR = new THREE.PointLight("#e4405e", 24, 12);
    rimR.position.set(2.6, -0.4, -1);
    scene.add(key, rimL, rimR, new THREE.HemisphereLight("#fbf9fe", "#a97fdc", 0.7));

    // the brand gears drifting around Geary
    const gearMat = new THREE.MeshPhysicalMaterial({
      vertexColors: true,
      roughness: 0.2,
      metalness: 0.12,
      clearcoat: 1,
      clearcoatRoughness: 0.06,
    });
    const geos = new Map<number, THREE.BufferGeometry>();
    const floatGroup = new THREE.Group(); // follows Geary across the stage
    scene.add(floatGroup);
    const floats = FLOAT.map(([x, y, z, s, teeth, dir], i) => {
      if (!geos.has(teeth)) geos.set(teeth, buildGear(teeth));
      const mesh = new THREE.Mesh(geos.get(teeth)!, gearMat);
      mesh.scale.setScalar(s);
      mesh.rotation.set(0.5 - (i % 3) * 0.35, (i % 2 ? -1 : 1) * 0.6, 0);
      const holder = new THREE.Group();
      holder.add(mesh);
      floatGroup.add(holder);
      return { holder, mesh, home: new THREE.Vector3(x, y, z), dir, phase: i * 1.7, speed: 0.5 / s };
    });

    const stage = new THREE.Group(); // where Geary stands, slides to centre on scroll
    const turn = new THREE.Group(); // user yaw
    const body = new THREE.Group(); // bob and hop
    turn.add(body);
    stage.add(turn);
    scene.add(stage);

    let rig: GearyRig | null = null;
    let alive = true;
    let bornAt = -1;
    loadGeary({ reduce }).then(
      (r) => {
        if (!alive) return r.dispose();
        rig = r;
        body.add(r.root);
        bornAt = performance.now();
        host.dataset.status = "ready";
      },
      () => (host.dataset.status = "error"),
    );

    // ── input: drag to turn Geary, tap to spin the gear, the eyes follow the pointer everywhere
    const view = { yaw: -0.3, vyaw: 0 };
    let drag: { x: number; moved: number } | null = null;
    let idleAt = performance.now();
    let hop = 0;
    const pointer = new THREE.Vector2(0, 0);
    const pointerSmooth = new THREE.Vector2(0, 0);
    let pointerSeen = 0;
    const el = renderer.domElement;

    const spin = () => {
      rig?.spin();
      hop = 1;
    };
    const down = (e: PointerEvent) => {
      drag = { x: e.clientX, moved: 0 };
      el.setPointerCapture(e.pointerId);
      host.classList.add("grabbing");
    };
    const move = (e: PointerEvent) => {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      drag.moved += Math.abs(dx);
      view.yaw += dx * 0.009;
      view.vyaw = dx * 0.009;
      drag.x = e.clientX;
      idleAt = performance.now();
    };
    const up = (e: PointerEvent) => {
      if (drag && drag.moved < 6 && e.type === "pointerup") spin();
      drag = null;
      host.classList.remove("grabbing");
      idleAt = performance.now();
    };
    const look = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      pointerSeen = performance.now();
    };
    const keydown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") view.vyaw -= 0.08;
      else if (e.key === "ArrowRight") view.vyaw += 0.08;
      else if (e.key === "Enter" || e.key === " ") spin();
      else return;
      e.preventDefault();
      idleAt = performance.now();
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    host.addEventListener("keydown", keydown);
    window.addEventListener("pointermove", look, { passive: true });

    let w = 0, h = 0, wide = true;
    const resize = () => {
      w = host.clientWidth;
      h = host.clientHeight;
      wide = w >= 900;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(section);

    const ray = new THREE.Raycaster();
    const lookPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -1.2);
    const hit = new THREE.Vector3();
    const eyeBox = new THREE.Box3();
    const eyeWorld = new THREE.Vector3();
    const origin = new THREE.Vector3();
    const target = new THREE.Vector3();
    const corner = new THREE.Vector3();
    let last = performance.now(), raf = 0;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!visible || document.hidden) return;

      const p = reduce ? 0 : sectionProgress(section);
      const centre = easeInOut(range(p, 0, 0.3)); // Geary steps to centre stage
      const dive = range(p, 0.2, 0.97); // then the camera dives into Geary's eye
      const scatter = easeIn(range(p, 0.05, 0.6)); // the floating gears fly past the camera

      // Geary's mark on stage: right of the copy on desktop, above it on phones
      // half the visible width at Geary's depth; Geary stands halfway out, clear of the headline
      const halfW = (wide ? 5.4 : 7.2) * Math.tan(THREE.MathUtils.degToRad(15)) * camera.aspect;
      const homeX = wide ? halfW * 0.56 : 0;
      const homeY = wide ? -0.04 : 0.98;
      stage.position.set(homeX * (1 - centre), homeY * (1 - centre), 0);
      floatGroup.position.copy(stage.position);
      const born = bornAt < 0 ? 0 : clamp01((now - bornAt) / 900);
      // pop in with a little overshoot once the model arrives
      const pop = born < 1 ? 1 + Math.sin(born * Math.PI) * 0.12 * (1 - born) - (1 - born) * 0.9 : 1;
      stage.scale.setScalar((wide ? 1 : THREE.MathUtils.lerp(0.7, 1, centre)) * Math.max(0.001, pop));

      if (!drag) {
        view.yaw += view.vyaw;
        view.vyaw *= 0.94;
        if (now - idleAt > 3500) {
          const home = Math.round(view.yaw / (Math.PI * 2)) * Math.PI * 2 + (reduce ? 0 : Math.sin(now / 2600) * 0.28);
          view.yaw += (home - view.yaw) * 0.02;
        }
      }
      // face the camera squarely before the dive
      const faceOn = Math.round(view.yaw / (Math.PI * 2)) * Math.PI * 2;
      turn.rotation.y = THREE.MathUtils.lerp(view.yaw, faceOn, centre);
      hop = Math.max(0, hop - dt * 1.8);
      body.position.y = (reduce ? 0 : Math.sin(now / 900) * 0.035) * (1 - dive) + Math.sin(hop * Math.PI) * 0.22;

      pointerSmooth.lerp(pointer, 0.06);
      floats.forEach((f, i) => {
        const bob = reduce ? 0 : Math.sin(now / 1300 + f.phase) * 0.08;
        // fly outward and toward the lens as the dive begins
        const out = 1 + scatter * 2.2;
        f.holder.position.set(
          f.home.x * out + pointerSmooth.x * (0.12 + i * 0.03),
          (f.home.y + bob) * out + pointerSmooth.y * (0.08 + i * 0.02),
          f.home.z + scatter * 7,
        );
        f.mesh.rotation.z += dt * f.dir * f.speed * (reduce ? 0 : 0.35 + scatter * 3);
      });

      // camera: a slow push, then an exponential dive into Geary's left eye
      const camZ = wide ? 5.4 : 7.2;
      if (rig) {
        rig.state.base = reduce ? 0 : 0.35 + dive * 5;
        rig.state.blink = dive < 0.05;
        scene.updateMatrixWorld();
        const eye = rig.eyes[0];
        eyeBox.setFromObject(eye.mesh);
        eyeBox.getCenter(eyeWorld);
        const d = easeInOut(dive);
        const dist = camZ * Math.pow(0.045 / camZ, easeIn(dive) * 0.55 + d * 0.45);
        target.lerpVectors(origin, eyeWorld, d); // frame the stage, then the eye
        camera.position.set(target.x, target.y, eyeWorld.z * d + dist);
        camera.lookAt(target);

        // eyes follow the pointer, then lock onto you as you fall in
        let gaze: THREE.Vector3 | null = null;
        if (dive > 0.01) gaze = camera.position;
        else if (now - pointerSeen < 3000) {
          ray.setFromCamera(pointer, camera);
          if (ray.ray.intersectPlane(lookPlane, hit)) gaze = hit;
        }
        rig.update(dt, now, gaze);

        // the dark portal is the pupil itself: an ellipse over the eye's projected bounds
        if (dive > 0.35) {
          let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
          for (let k = 0; k < 8; k++) {
            corner
              .set(k & 1 ? eyeBox.max.x : eyeBox.min.x, k & 2 ? eyeBox.max.y : eyeBox.min.y, k & 4 ? eyeBox.max.z : eyeBox.min.z)
              .project(camera);
            const sx = (corner.x * 0.5 + 0.5) * w, sy = (-corner.y * 0.5 + 0.5) * h;
            x0 = Math.min(x0, sx);
            x1 = Math.max(x1, sx);
            y0 = Math.min(y0, sy);
            y1 = Math.max(y1, sy);
          }
          const grow = 1 + range(dive, 0.82, 0.97) * 3; // finish the cover once the eye fills the screen
          const rx = ((x1 - x0) / 2) * 0.9 * grow, ry = ((y1 - y0) / 2) * 0.9 * grow;
          portal.style.clipPath = `ellipse(${rx.toFixed(1)}px ${ry.toFixed(1)}px at ${((x0 + x1) / 2).toFixed(1)}px ${((y0 + y1) / 2).toFixed(1)}px)`;
          portal.style.opacity = String(range(dive, 0.35, 0.55));
        } else portal.style.opacity = "0";
      } else {
        camera.position.set(0, 0, camZ);
        camera.lookAt(0, 0, 0);
      }

      // the copy steps back into the page as Geary takes over
      const fade = range(p, 0.02, 0.16);
      copy.style.opacity = String(1 - fade);
      copy.style.transform = `translate3d(0, ${-fade * 30}px, 0) perspective(900px) rotateX(${fade * 22}deg) scale(${1 - fade * 0.08})`;
      copy.style.filter = fade > 0 ? `blur(${(fade * 8).toFixed(1)}px)` : "";
      copy.style.visibility = fade >= 1 ? "hidden" : "visible";
      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      host.removeEventListener("keydown", keydown);
      window.removeEventListener("pointermove", look);
      rig?.dispose();
      geos.forEach((g) => g.dispose());
      gearMat.dispose();
      renderer.dispose();
      pmrem.dispose();
      el.remove();
    };
  }, []);

  return (
    <section className="hero" id="top" ref={sectionRef}>
      <div className="hero-stage">
        <div className="wash" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        <div
          className="hero-gear"
          ref={canvasHost}
          tabIndex={0}
          role="img"
          aria-label="Geary, the PMC mascot, in 3D among floating brand gears. Drag or use the arrow keys to turn Geary; press Enter to spin the gear."
        />
        <div className="wrap hero-copy" ref={copyRef}>
          <h1>Canada’s Largest Product Management Club</h1>
          <div className="ctas">
            <a className="btn primary" href={LINKS.member}>
              Become a member <Arrow />
            </a>
            <a className="btn secondary" href={LINKS.volunteer}>
              Volunteer with us
            </a>
          </div>
        </div>
        <div className="portal" ref={portalRef} aria-hidden="true" />
      </div>
    </section>
  );
}
