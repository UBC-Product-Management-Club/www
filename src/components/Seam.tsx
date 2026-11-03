/* eslint-disable @next/next/no-img-element */

/** Rendered 3D gears in public/gears, each a glossy brand-ramp, lavender, rose or chrome gear seen at an angle. */
export type GearAsset = "ramp-8" | "ramp-12" | "lav-9" | "rose-8" | "silver-10" | "silver-12";

/** One gear: which asset, its side, how far in from that side (vw), size (px), and which way it turns as you scroll. */
export type SeamGear = { src: GearAsset; side: "left" | "right"; at: number; size: number; dir?: 1 | -1; lift?: number };

/**
 * A zero-height band laid between two sections, carrying gears that straddle the join, so the page reads
 * as one surface rather than stacked panels. Purely decorative; each gear turns and drifts with the scroll.
 */
export default function Seam({ gears }: { gears: SeamGear[] }) {
  return (
    <div className="seam" aria-hidden="true">
      {gears.map((g, i) => (
        <img
          key={i}
          src={`/gears/${g.src}.webp`}
          alt=""
          width={g.size}
          height={g.size}
          loading="lazy"
          decoding="async"
          style={
            {
              [g.side]: `${g.at}vw`,
              "--size": `${g.size}px`,
              "--dir": g.dir ?? 1,
              "--lift": `${g.lift ?? 0}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
