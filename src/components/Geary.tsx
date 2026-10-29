"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { loadGeary, type GearyRig } from "@/lib/geary";
import { Minus, Plus, Reset } from "./icons";

const DIST = { min: 2.1, max: 6.2, start: 4.4 };

export type GearyApi = { zoom: (f: number) => void; reset: () => void; spin: () => void };

export default function GearyStage({ label }: { label: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const api = useRef<GearyApi | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    const host = hostRef.current!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    const camera = new THREE.PerspectiveCamera(30, 1, 0.05, 50);

    const key = new THREE.DirectionalLight("#ffffff", 2.1);
    key.position.set(2, 3, 4);
    const rimL = new THREE.PointLight("#8b9cf2", 26, 10);
    rimL.position.set(-2.4, 1, -1);
    const rimR = new THREE.PointLight("#e4405e", 22, 10);
    rimR.position.set(2.4, -0.4, -1);
    scene.add(key, rimL, rimR, new THREE.HemisphereLight("#fbf9fe", "#a97fdc", 0.7));

    const stage = new THREE.Group(); // user yaw/pitch
    const body = new THREE.Group(); // bob, hop and lean
    stage.add(body);
    scene.add(stage);

    let rig: GearyRig | null = null;
    let alive = true;
    loadGeary({ reduce }).then(
      (r) => {
        if (!alive) return r.dispose();
        rig = r;
        body.add(r.root);
        setStatus("ready");
      },
      () => alive && setStatus("error"),
    );

    // ── input: drag to turn, tap to spin the gear, pinch / ctrl+wheel / buttons to zoom
    const view = { yaw: -0.35, pitch: 0.05, vyaw: 0, dist: DIST.start, targetDist: DIST.start };
    const pointerNdc = new THREE.Vector2(0, 0.1);
    let pointerSeen = 0;
    let drag: { x: number; y: number; moved: number } | null = null;
    let idleAt = performance.now();
    let hop = 0;
    const pointers = new Map<number, { x: number; y: number }>();
    let pinch0 = 0;
    const el = renderer.domElement;

    const spin = () => {
      rig?.spin();
      hop = 1;
    };

    const down = (e: PointerEvent) => {
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        pinch0 = Math.hypot(a.x - b.x, a.y - b.y);
      }
      drag = { x: e.clientX, y: e.clientY, moved: 0 };
      el.setPointerCapture(e.pointerId);
      host.classList.add("grabbing");
    };
    const move = (e: PointerEvent) => {
      if (!pointers.has(e.pointerId)) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        view.targetDist = THREE.MathUtils.clamp(view.targetDist * (pinch0 / d), DIST.min, DIST.max);
        pinch0 = d;
        if (drag) drag.moved = 99;
        return;
      }
      if (!drag) return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      drag.moved += Math.abs(dx) + Math.abs(dy);
      view.yaw += dx * 0.009;
      view.vyaw = dx * 0.009;
      view.pitch = THREE.MathUtils.clamp(view.pitch + dy * 0.006, -0.6, 0.7);
      drag.x = e.clientX;
      drag.y = e.clientY;
      idleAt = performance.now();
    };
    const up = (e: PointerEvent) => {
      pointers.delete(e.pointerId);
      if (pointers.size === 0) {
        if (drag && drag.moved < 6 && e.type === "pointerup") spin();
        drag = null;
        host.classList.remove("grabbing");
      }
      idleAt = performance.now();
    };
    // the eyes follow the cursor anywhere on the page
    const look = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      pointerNdc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      pointerSeen = performance.now();
    };
    const wheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return; // plain wheel keeps scrolling the page
      e.preventDefault();
      view.targetDist = THREE.MathUtils.clamp(view.targetDist * Math.exp(e.deltaY * 0.01), DIST.min, DIST.max);
    };
    const dbl = () => {
      view.targetDist = view.targetDist > (DIST.min + DIST.max) / 2 ? DIST.min + 0.2 : DIST.start;
    };
    const keydown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") view.vyaw -= 0.08;
      else if (e.key === "ArrowRight") view.vyaw += 0.08;
      else if (e.key === "+" || e.key === "=") api.current?.zoom(0.8);
      else if (e.key === "-") api.current?.zoom(1.25);
      else if (e.key === "Enter" || e.key === " ") spin();
      else return;
      e.preventDefault();
      idleAt = performance.now();
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    el.addEventListener("wheel", wheel, { passive: false });
    el.addEventListener("dblclick", dbl);
    host.addEventListener("keydown", keydown);
    window.addEventListener("pointermove", look, { passive: true });

    api.current = {
      zoom: (f) => (view.targetDist = THREE.MathUtils.clamp(view.targetDist * f, DIST.min, DIST.max)),
      reset: () => {
        view.targetDist = DIST.start;
        view.pitch = 0.05;
        view.yaw = -0.35;
        view.vyaw = 0;
      },
      spin,
    };

    const resize = () => {
      const w = host.clientWidth, h = host.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    let visible = false;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { rootMargin: "200px" });
    io.observe(host);

    const ray = new THREE.Raycaster();
    const facePlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -1.4);
    const hit = new THREE.Vector3();
    let raf = 0, last = performance.now();

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!visible || document.hidden) return;

      if (!drag) {
        view.yaw += view.vyaw;
        view.vyaw *= 0.94;
        // ease back to facing the visitor after a while, then sway gently
        if (now - idleAt > 4000) {
          const home = Math.round(view.yaw / (Math.PI * 2)) * Math.PI * 2 + (reduce ? 0 : Math.sin(now / 2400) * 0.35);
          view.yaw += (home - view.yaw) * 0.02;
        }
      }
      view.dist += (view.targetDist - view.dist) * 0.12;
      stage.rotation.set(view.pitch, view.yaw, 0);

      hop = Math.max(0, hop - dt * 1.8);
      body.position.y = (reduce ? 0 : Math.sin(now / 900) * 0.035) + Math.sin(hop * Math.PI) * 0.22;

      // eyes glance toward the pointer, or wander when there isn't one
      if (rig) {
        let look: THREE.Vector3 | null = null;
        if (now - pointerSeen < 3000) {
          ray.setFromCamera(pointerNdc, camera);
          if (ray.ray.intersectPlane(facePlane, hit)) look = hit;
        }
        rig.update(dt, now, look);
      }

      const close = 1 - (view.dist - DIST.min) / (DIST.max - DIST.min);
      camera.position.set(0, 0.32 * close, view.dist);
      camera.lookAt(0, 0.34 * close, 0);
      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      host.removeEventListener("keydown", keydown);
      window.removeEventListener("pointermove", look);
      el.removeEventListener("wheel", wheel);
      alive = false;
      rig?.dispose();
      renderer.dispose();
      pmrem.dispose();
      el.remove();
      api.current = null;
    };
  }, []);

  return (
    <div className="geary">
      <div className="geary-floor" aria-hidden="true" />
      <div className="geary-canvas" ref={hostRef} tabIndex={0} role="img" aria-label={label} data-status={status} />
      {status !== "ready" && (
        <p className="geary-status" role="status">
          {status === "loading" ? "Geary is getting ready…" : "Geary couldn’t load. Refresh to try again."}
        </p>
      )}
      <div className="geary-tools">
        <button className="btn white sm" onClick={() => api.current?.spin()}>
          Spin the gear
        </button>
        <button className="icon-btn glass" aria-label="Zoom in" onClick={() => api.current?.zoom(0.78)}>
          <Plus />
        </button>
        <button className="icon-btn glass" aria-label="Zoom out" onClick={() => api.current?.zoom(1.28)}>
          <Minus />
        </button>
        <button className="icon-btn glass" aria-label="Reset view" onClick={() => api.current?.reset()}>
          <Reset />
        </button>
      </div>
    </div>
  );
}
