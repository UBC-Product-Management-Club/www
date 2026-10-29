"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { loadGeary, type GearyRig } from "@/lib/geary";

/** What the page tells Geary each frame: where to look (in this canvas's NDC), how fast the gear turns, and when to hop. */
export type GearyDriver = { gaze: { x: number; y: number } | null; speed: number; hops: number };

/** A small, non-interactive Geary that a section drives (the factory's quality inspector). */
export default function GearyMini({ driver, className }: { driver: React.RefObject<GearyDriver>; className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);

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
    const camera = new THREE.PerspectiveCamera(30, 1, 0.05, 30);
    camera.position.set(0, 0.1, 4.3);
    camera.lookAt(0, 0, 0);
    const key = new THREE.DirectionalLight("#ffffff", 2.1);
    key.position.set(2, 3, 4);
    const rimL = new THREE.PointLight("#8b9cf2", 22, 10);
    rimL.position.set(-2.2, 1, -1);
    const rimR = new THREE.PointLight("#e4405e", 18, 10);
    rimR.position.set(2.2, -0.4, -1);
    scene.add(key, rimL, rimR, new THREE.HemisphereLight("#fbf9fe", "#a97fdc", 0.7));
    const body = new THREE.Group();
    scene.add(body);

    let rig: GearyRig | null = null;
    let alive = true;
    loadGeary({ reduce }).then((r) => {
      if (!alive) return r.dispose();
      rig = r;
      body.add(r.root);
    });

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
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(host);

    const ray = new THREE.Raycaster();
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -1.2);
    const hit = new THREE.Vector3();
    const ndc = new THREE.Vector2();
    let hops = 0, hop = 0, raf = 0, last = performance.now();

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!visible || document.hidden || !rig) return;
      const d = driver.current;
      if (d.hops !== hops) {
        hops = d.hops;
        if (!reduce) {
          hop = 1;
          rig.spin(6);
        }
      }
      rig.state.base = reduce ? 0 : d.speed;
      hop = Math.max(0, hop - dt * 2.4);
      body.position.y = Math.sin(hop * Math.PI) * 0.16 + (reduce ? 0 : Math.sin(now / 900) * 0.03);
      body.rotation.z = Math.sin(hop * Math.PI * 2) * 0.05;
      let look: THREE.Vector3 | null = null;
      if (d.gaze) {
        ray.setFromCamera(ndc.set(d.gaze.x, d.gaze.y), camera);
        if (ray.ray.intersectPlane(plane, hit)) look = hit;
      }
      rig.update(dt, now, look);
      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      rig?.dispose();
      renderer.dispose();
      pmrem.dispose();
      renderer.domElement.remove();
    };
  }, [driver]);

  return <div className={className} ref={hostRef} aria-hidden="true" />;
}
