"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { gearOutline } from "@/lib/gear";
import { loadGeary, type GearyRig } from "@/lib/geary";
import { clamp01, easeInOut, range } from "@/lib/motion";
import { LINKS } from "@/data/site";
import { asset } from "@/lib/asset";
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
  [-1.05, -1.2, -1.6, 0.34, 9, -1],
];

const easeIn = (x: number) => x * x * x;
/** The event pictures in the eye: height ÷ width, and where the EVENTS title sits down them (0–1). Retake if Events changes. */
const EYE_SHOT = { desk: { aspect: 0.7, title: 0.476 }, phone: { aspect: 3.059, title: 0.0735 } };

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasHost = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current!;
    const host = canvasHost.current!;
    const portal = portalRef.current!;
    const world = worldRef.current!;
    const pin = section.querySelector<HTMLElement>(".hero-stage")!;
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
    let gearyW = 2; // Geary's width in world units, measured once the model loads
    let alive = true;
    let bornAt = -1;
    loadGeary({ reduce }).then(
      (r) => {
        if (!alive) return r.dispose();
        rig = r;
        // measured before it joins the (popping-in, near-zero scale) stage, so the size is Geary's own
        gearyW = new THREE.Box3().setFromObject(r.root).getSize(new THREE.Vector3()).x || 2;
        body.add(r.root);
        place();
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
    // where Geary stands on desktop: inside the same centred column as the headline, right-aligned to it, so the
    // two read as one composition at any width instead of Geary drifting to the window's edge on wide screens
    const mark = { x: 0, scale: 1 };
    const place = () => {
      if (!wide) return;
      const pad = parseFloat(getComputedStyle(copy).paddingRight) || 0;
      const colLeft = copy.offsetLeft + pad;
      const colRight = copy.offsetLeft + copy.clientWidth - pad;
      const head = copy.querySelector("h1") as HTMLElement | null;
      const textRight = colLeft + Math.min(head?.offsetWidth ?? 560, 560) + 24;
      const pxPerUnit = h / (2 * 5.4 * Math.tan(THREE.MathUtils.degToRad(15)));
      const want = gearyW * pxPerUnit * 1.08; // a little room for the bob and the turn
      const room = Math.max(0, colRight - textRight);
      mark.scale = Math.max(0.6, Math.min(1, room / want));
      const cx = colRight - (want * mark.scale) / 2;
      const halfW = 5.4 * Math.tan(THREE.MathUtils.degToRad(15)) * camera.aspect;
      mark.x = (cx / w) * 2 * halfW - halfW;
    };
    const resize = () => {
      w = host.clientWidth;
      h = host.clientHeight;
      wide = w >= 900;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      place();
    };
    document.fonts?.ready.then(() => alive && place());
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

      // progress against the pinned stage itself, so the dive ends exactly as the real events reach the top
      const box = section.getBoundingClientRect();
      const span = section.offsetHeight - pin.offsetHeight;
      const p = reduce || span <= 0 ? 0 : clamp01(-box.top / span);
      // the stage steps aside at the very end, revealing the real section right where its copy was
      pin.classList.toggle("gone", !reduce && p >= 0.999);
      const centre = easeInOut(range(p, 0, 0.3)); // Geary steps to centre stage
      const dive = range(p, 0.15, 1); // then the camera dives into Geary's eye
      const scatter = easeIn(range(p, 0.05, 0.6)); // the floating gears fly past the camera

      // Geary's mark on stage: right of the copy on desktop (see place), above it on phones
      const homeX = wide ? mark.x : 0;
      const homeY = wide ? -0.04 : 0.98;
      stage.position.set(homeX * (1 - centre), homeY * (1 - centre), 0);
      floatGroup.position.copy(stage.position);
      const born = bornAt < 0 ? 0 : clamp01((now - bornAt) / 900);
      // pop in with a little overshoot once the model arrives
      const pop = born < 1 ? 1 + Math.sin(born * Math.PI) * 0.12 * (1 - born) - (1 - born) * 0.9 : 1;
      stage.scale.setScalar(THREE.MathUtils.lerp(wide ? mark.scale : 0.7, 1, centre) * Math.max(0.001, pop));

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
          const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
          portal.style.clipPath = dive > 0.995 ? "none" : `ellipse(${rx.toFixed(1)}px ${ry.toFixed(1)}px at ${cx.toFixed(1)}px ${cy.toFixed(1)}px)`;
          portal.style.opacity = String(range(dive, 0.35, 0.55));

          // a flat picture of the events section lives inside the eye: small with its title centred in the pupil,
          // growing until it fills the window, then the stage fades to the real section. A picture, because a
          // live copy re-drew dozens of images and shadows every frame on top of the 3D scene
          const shot = w >= 1000 ? EYE_SHOT.desk : EYE_SHOT.phone;
          const tx = w / 2, ty = w * shot.aspect * shot.title;
          const k = Math.pow(range(dive, 0.35, 1), 2.4);
          const s = THREE.MathUtils.lerp(0.22, 1, k);
          world.style.transform = `translate3d(${((cx - tx * s) * (1 - k)).toFixed(1)}px, ${((cy - ty * s) * (1 - k)).toFixed(1)}px, 0) scale(${s.toFixed(4)})`;
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
      if (dive < 0.995) renderer.render(scene, camera); // nothing to draw once the eye covers the screen
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
        <div
          className="hero-gear"
          ref={canvasHost}
          tabIndex={0}
          role="img"
          aria-label="Geary, the PMC mascot, in 3D among floating brand gears. Drag or use the arrow keys to turn Geary; press Enter to spin the gear."
        />
        <div className="wrap hero-copy" ref={copyRef}>
          <h1>
            Canada’s Largest <span className="grad">Product Management Club</span>
          </h1>
          <div className="ctas">
            <a className="btn primary" href={LINKS.member}>
              Become a member <Arrow />
            </a>
            <a className="btn secondary" href={LINKS.volunteer}>
              Volunteer with us
            </a>
          </div>
        </div>
        <div className="portal" ref={portalRef} aria-hidden="true">
          <div className="portal-world" ref={worldRef}>
            <picture>
              <source media="(max-width: 999px)" srcSet={asset("/events/preview-phone.webp")} />
              <img src={asset("/events/preview.webp")} alt="" decoding="async" draggable={false} />
            </picture>
          </div>
        </div>
      </div>
    </section>
  );
}
