/** 8-tooth gear outline shared by the 3D hero gear and the 2D About gear (same tooth count as Geary's head). */
export type GearSpec = { teeth: number; rTip: number; rRoot: number; tipHalf: number; rootHalf: number };

export const GEAR: GearSpec = { teeth: 8, rTip: 1, rRoot: 0.8, tipHalf: 0.17, rootHalf: 0.26 };

/** Outline points (counter-clockwise), angles in radians, scaled by `r`. */
export function gearOutline(r = 1, spec: GearSpec = GEAR, arcSteps = 10): [number, number][] {
  const pts: [number, number][] = [];
  const step = (Math.PI * 2) / spec.teeth;
  const at = (a: number, rad: number): [number, number] => [Math.cos(a) * rad * r, Math.sin(a) * rad * r];
  for (let i = 0; i < spec.teeth; i++) {
    const a = i * step;
    pts.push(at(a - spec.rootHalf, spec.rRoot));
    pts.push(at(a - spec.tipHalf, spec.rTip));
    pts.push(at(a + spec.tipHalf, spec.rTip));
    pts.push(at(a + spec.rootHalf, spec.rRoot));
    const a0 = a + spec.rootHalf;
    const a1 = a + step - spec.rootHalf;
    for (let s = 1; s < arcSteps; s++) pts.push(at(a0 + ((a1 - a0) * s) / arcSteps, spec.rRoot));
  }
  return pts;
}

/** SVG path for a gear centred on (cx, cy). */
export function gearPath(cx: number, cy: number, r: number, spec: GearSpec = GEAR): string {
  return (
    gearOutline(r, spec)
      .map(([x, y], i) => `${i ? "L" : "M"}${(cx + x).toFixed(2)} ${(cy + y).toFixed(2)}`)
      .join(" ") + " Z"
  );
}
