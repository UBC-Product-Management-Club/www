import type { EventSticker } from "@/data/site";

/**
 * Die-cut sticker art for each event. Every sticker starts with its white silhouette
 * (the vinyl border), so the peel flap can reuse the same art as the sticker's back.
 */
export const STICKER_SIZE: Record<EventSticker["id"], [number, number]> = {
  getaway: [300, 150],
  jackpot: [190, 190],
  night: [250, 160],
  heist: [210, 200],
  conference: [230, 190],
  sprint: [180, 214],
};

const W = "#fff";
const INK = "#1d1838";

export function StickerArt({ id, uid }: { id: EventSticker["id"]; uid: string }) {
  const [w, h] = STICKER_SIZE[id];
  const g = (n: string) => `${uid}-${n}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} className="sticker-svg" aria-hidden="true">
      <defs>
        <linearGradient id={g("deep")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5f6fdc" />
          <stop offset=".4" stopColor="#8a58cf" />
          <stop offset=".75" stopColor="#bf418c" />
          <stop offset="1" stopColor="#d23350" />
        </linearGradient>
        <linearGradient id={g("peri")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8b9cf2" />
          <stop offset="1" stopColor="#a97fdc" />
        </linearGradient>
        <linearGradient id={g("rose")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d25fa6" />
          <stop offset="1" stopColor="#e4405e" />
        </linearGradient>
      </defs>
      {ART[id](g)}
    </svg>
  );
}

type Art = (g: (n: string) => string) => React.ReactNode;

const ART: Record<EventSticker["id"], Art> = {
  getaway: (g) => (
    <>
      {/* boarding pass with side notches */}
      <path
        d="M14 4h272a10 10 0 0 1 10 10v44a17 17 0 0 0 0 34v44a10 10 0 0 1-10 10H14A10 10 0 0 1 4 136V92a17 17 0 0 0 0-34V14A10 10 0 0 1 14 4z"
        fill={W}
      />
      <path
        d="M20 14h260a6 6 0 0 1 6 6v32a24 24 0 0 0 0 46v32a6 6 0 0 1-6 6H20a6 6 0 0 1-6-6V98a24 24 0 0 0 0-46V20a6 6 0 0 1 6-6z"
        fill={`url(#${g("peri")})`}
      />
      <path d="M212 22v106" stroke={W} strokeWidth="2.5" strokeDasharray="5 6" opacity=".8" />
      <text x="34" y="46" className="st-small" fill={W} opacity=".9">BOARDING PASS · UBC → PM</text>
      <text x="32" y="86" className="st-slab" fontSize="25" fill={INK}>PRODUCT</text>
      <text x="32" y="114" className="st-slab" fontSize="25" fill={W}>GETAWAY</text>
      <g transform="translate(248 74) rotate(-30)" fill={INK}>
        <path d="M-22 -3h14l12-16h7l-6 16h13l5-7h5l-3 10 3 10h-5l-5-7h-13l6 16h-7l-12-16h-14a3 3 0 0 1 0-6z" />
      </g>
      <g fill={INK} opacity=".55">
        {[0, 4, 7, 12, 15, 19, 22, 27, 30].map((x) => (
          <rect key={x} x={228 + x} y={110} width={x % 2 ? 2 : 3} height={16} />
        ))}
      </g>
    </>
  ),

  jackpot: (g) => (
    <>
      <circle cx="95" cy="95" r="93" fill={W} />
      <circle cx="95" cy="95" r="84" fill={`url(#${g("rose")})`} />
      {Array.from({ length: 8 }, (_, i) => (
        <rect
          key={i}
          x="88"
          y="12"
          width="14"
          height="22"
          rx="3"
          fill={W}
          transform={`rotate(${i * 45 + 22.5} 95 95)`}
        />
      ))}
      <circle cx="95" cy="95" r="54" fill="none" stroke={W} strokeWidth="2.5" strokeDasharray="4 6" />
      <circle cx="95" cy="95" r="46" fill="#fbf9fe" />
      <text x="95" y="86" textAnchor="middle" className="st-small" fill="#bf418c">PRODUCT</text>
      <text x="95" y="108" textAnchor="middle" className="st-slab" fontSize="21" fill={INK}>JACKPOT</text>
    </>
  ),

  night: (g) => (
    <>
      <ellipse cx="125" cy="80" rx="122" ry="77" fill={W} />
      <ellipse cx="125" cy="80" rx="113" ry="68" fill={INK} />
      <ellipse cx="125" cy="80" rx="113" ry="68" fill={`url(#${g("deep")})`} opacity=".35" />
      <path d="M62 34a26 26 0 1 0 26 34 21 21 0 1 1-26-34z" fill="#fbf9fe" />
      {[
        [196, 42, 4],
        [176, 120, 3],
        [210, 96, 2.5],
        [92, 120, 2.5],
        [150, 30, 2],
      ].map(([x, y, r]) => (
        <path
          key={`${x}${y}`}
          d={`M${x} ${y - r * 2.4}C${x + r * 0.4} ${y - r * 0.4} ${x + r * 0.4} ${y - r * 0.4} ${x + r * 2.4} ${y}C${x + r * 0.4} ${y + r * 0.4} ${x + r * 0.4} ${y + r * 0.4} ${x} ${y + r * 2.4}C${x - r * 0.4} ${y + r * 0.4} ${x - r * 0.4} ${y + r * 0.4} ${x - r * 2.4} ${y}C${x - r * 0.4} ${y - r * 0.4} ${x - r * 0.4} ${y - r * 0.4} ${x} ${y - r * 2.4}Z`}
          fill="#8b9cf2"
        />
      ))}
      <text x="140" y="74" textAnchor="middle" className="st-small" fill="#c9cff8">PRODUCT</text>
      <text x="140" y="100" textAnchor="middle" className="st-slab" fontSize="28" fill="#fbf9fe">NIGHT</text>
    </>
  ),

  heist: (g) => (
    <>
      {/* cut gem */}
      <path d="M52 6h106l48 58-101 130L4 64z" fill={W} stroke={W} strokeWidth="6" strokeLinejoin="round" />
      <path d="M58 16h94l40 48H18z" fill="#a97fdc" />
      <path d="M18 64h174l-87 112z" fill={`url(#${g("peri")})`} />
      <path d="M58 16l22 48 25-48 25 48 22-48" fill="none" stroke={W} strokeWidth="2" opacity=".55" />
      <path d="M18 64l87 112M80 64l25 112 25-112M192 64l-87 112" fill="none" stroke={W} strokeWidth="2" opacity=".35" />
      <rect x="22" y="80" width="166" height="40" rx="6" fill={INK} transform="rotate(-6 105 100)" />
      <text x="105" y="108" textAnchor="middle" className="st-slab" fontSize="24" fill="#fbf9fe" transform="rotate(-6 105 100)">
        HEIST
      </text>
    </>
  ),

  conference: (g) => (
    <>
      <path
        d="M30 4h170a26 26 0 0 1 26 26v86a26 26 0 0 1-26 26H96l-46 44 8-44H30A26 26 0 0 1 4 116V30A26 26 0 0 1 30 4z"
        fill={W}
      />
      <path
        d="M32 13h166a19 19 0 0 1 19 19v82a19 19 0 0 1-19 19H93l-33 31 6-31H32a19 19 0 0 1-19-19V32a19 19 0 0 1 19-19z"
        fill={`url(#${g("rose")})`}
      />
      <g transform="translate(46 50)" fill="none" stroke={W} strokeWidth="3" strokeLinecap="round">
        <rect x="-7" y="-14" width="14" height="24" rx="7" fill={W} />
        <path d="M-12 2a12 12 0 0 0 24 0M0 14v8" />
      </g>
      <text x="74" y="56" className="st-small" fill="#fde7f0">PRODUCT</text>
      <text x="30" y="98" className="st-slab" fontSize="24" fill={W}>CONFERENCE</text>
    </>
  ),

  sprint: (g) => (
    <>
      <rect x="72" y="4" width="36" height="22" rx="6" fill={W} />
      <circle cx="90" cy="122" r="88" fill={W} />
      <rect x="80" y="10" width="20" height="16" rx="4" fill={INK} />
      <circle cx="90" cy="122" r="79" fill={`url(#${g("deep")})`} />
      <circle cx="90" cy="122" r="60" fill="#fbf9fe" />
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={i} x="88.5" y="66" width="3" height={i % 3 ? 6 : 10} rx="1.5" fill={INK} transform={`rotate(${i * 30} 90 122)`} />
      ))}
      <path d="M96 78l-24 50h17l-6 34 28-52H94z" fill="#e4405e" />
      <text x="90" y="198" textAnchor="middle" className="st-slab" fontSize="20" fill={W}>SPRINT</text>
    </>
  ),
};
