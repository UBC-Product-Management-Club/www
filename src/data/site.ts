import { asset } from "@/lib/asset";

export const LINKS = {
  member: "https://portal.ubcpmc.com/",
  volunteer: "https://forms.gle/R5Utwtev718pUACw6",
  partnerships: "mailto:partnerships@ubcpmc.com",
  connect: "mailto:connect@ubcpmc.com",
  instagram: "https://www.instagram.com/ubcpmc",
  linkedin: "https://ca.linkedin.com/company/ubc-product-management-club",
  discord: "https://discord.gg/MZChJSpSxA",
};

const F = "https://framerusercontent.com/images/";
export const img = (id: string, size = 1024) => `${F}${id}?scale-down-to=${size}`;

export type EventSticker = {
  id: "getaway" | "jackpot" | "heist" | "night" | "conference" | "sprint";
  name: string;
  when: string;
  blurb: string;
  href?: string;
  /** Poster for the event's polaroid; an event without one has Geary peeking into the frame. */
  poster?: string;
};

/** Each event lives in its own repo; stickers only link out. Newest first: keep a new event at the top. */
export const EVENTS: EventSticker[] = [
  { id: "jackpot", name: "Product Jackpot", when: "Nov 21–22, 2026", blurb: "24-hour product challenge", href: "https://ubcpmc.com/productjackpot", poster: asset("/events/jackpot.webp") },
  // Getaway had no site of its own, so its sticker opens the Instagram recap. TODO: swap in the recap post's own URL.
  { id: "getaway", name: "Product Getaway", when: "Sep 2026", blurb: "See the recap on Instagram", href: "https://www.instagram.com/p/DeXKIRkJpRi/", poster: asset("/events/getaway.webp") },
  { id: "sprint", name: "Product Sprint", when: "Mar 2026", blurb: "Our flagship two-week PM competition", href: "https://ubcpmc.com/productsprint", poster: img("mg8wks2Uk8WpPri365cVxWetC8.png", 640) },
  { id: "conference", name: "Product Conference", when: "Feb 2026", blurb: "Keynotes, workshops and panels", href: "https://ubcpmc.com/productconference", poster: img("YOTBvfm9wMwuyEbB9JVEWFAMHQ.png", 640) },
  { id: "heist", name: "Product Heist", when: "Nov 2025", blurb: "A 24-hour product challenge", href: "https://ubcpmc.com/productheist", poster: img("B0rBpxxJg0VYM53n9iPYj0JrLEc.jpg", 640) },
  { id: "night", name: "Product Night", when: "Oct 2025", blurb: "Keynotes, small-group chats and mentors", href: "https://ubcpmc.com/productnight", poster: img("gIrG8JM7zAiFYqI98Pbu588PXU.jpg", 640) },
];

export type Upcoming = {
  name: string;
  tagline: string;
  /** ISO times in Vancouver local time */
  start: string;
  end: string;
  dates: string;
  href: string;
  sticker?: EventSticker["id"];
  schedule: { day: string; items: [string, string][] }[];
};

/** Shown in "Up next" until `end` passes. Source: ubcpmc.com/productjackpot. Add the next event below when it is announced. */
export const UPCOMING: Upcoming[] = [
  {
    name: "Product Jackpot",
    tagline: "PMC’s 24-hour product challenge",
    start: "2026-11-21T09:00:00-08:00",
    end: "2026-11-22T23:59:00-08:00",
    dates: "November 21–22, 2026",
    href: "https://ubcpmc.com/productjackpot",
    sticker: "jackpot",
    schedule: [
      {
        day: "Saturday, November 21",
        items: [
          ["9:00 am", "Registration"],
          ["9:30 am", "Opening ceremonies"],
          ["10:00 am", "Kickoff"],
          ["12:00 pm", "Lunch"],
          ["3:00 pm", "Workshop"],
          ["4:00 pm", "Mentorship"],
        ],
      },
    ],
  },
];

export const STATS = [
  { n: "600+", label: "students impacted" },
  { n: "32+", label: "events since 2023" },
  { n: "100+", label: "active members" },
];

export const TEAMS = ["Co-Presidents", "Community", "Events", "Finance", "Marketing", "Tech", "Partnerships", "Advisors"] as const;
/** The teams, in the roster's order; each hangs as its own keychain. */
export type Team = (typeof TEAMS)[number];

export type Member = {
  name: string;
  team: Team;
  role: string;
  /** The emoji each member picks for their card; null shows a PMC gear. */
  emoji: string | null;
  /** A URL for the square headshot, or null for initials. */
  photo: string | null;
  /** Where clicking the card goes, or null. */
  url: string | null;
  order: number;
};

/** One JSON file per person in src/data/team (see its README); a new file is picked up with no list to update. */
const FILES = import.meta.glob<Record<string, unknown>>(["./team/*.json", "!./team/member.schema.json"], { eager: true, import: "default" });

const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);

/** File sync can leave a copy like "jane-doe 2.json" beside the original; it mustn't put anyone on the team twice. */
const isSyncCopy = (file: string) => / \d+\.json$/.test(file);

const ROSTER: Member[] = Object.entries(FILES).filter(([file]) => !isSyncCopy(file)).map(([file, d]) => {
  const name = str(d.name), role = str(d.role), team = d.team as Team;
  if (!name || !role) throw new Error(`${file}: "name" and "role" are required`);
  if (!TEAMS.includes(team)) throw new Error(`${file}: "team" must be one of ${TEAMS.join(", ")}, not ${JSON.stringify(d.team)}`);
  const photo = str(d.photo);
  return {
    name,
    team,
    role,
    emoji: str(d.emoji),
    // a bare file name lives in public/team; a full URL is used as is
    photo: photo && (/^https?:\/\//.test(photo) ? photo : asset(`/team/${photo}`)),
    url: str(d.url),
    order: typeof d.order === "number" ? d.order : Infinity,
  };
});

const isVP = (m: Member) => m.role.startsWith("VP");

/** Team by team; within a team the VP first (the keychain hangs them in the middle), then by `order`, then by name. */
export const TEAM: Member[] = TEAMS.flatMap((t) =>
  ROSTER.filter((m) => m.team === t).sort((a, b) => Number(isVP(b)) - Number(isVP(a)) || a.order - b.order || a.name.localeCompare(b.name)),
);

/** Source: ubcpmc.com/about, "What we offer". */
export const OFFER = [
  {
    title: "Practical Exposure",
    body: "Engage in activities that challenge you to solve actual problems and apply theoretical knowledge in practical settings. Our hands-on exposure will help you understand the nuances of PM and build a strong foundation.",
    photo: { src: img("VaLY6KAJeCVompZ6IHBvwXnerU.jpeg"), alt: "Students at a PMC event" },
  },
  {
    title: "Product Skills Enhancement",
    body: "Our targeted sessions are designed to enhance your product mindset. We cover everything from user research + prototyping to GTM strategies + data-driven decision-making, led by product experts.",
    photo: { src: img("LtWvxEbfwJNNYTou52t1EylUG0.jpg"), alt: "A PMC session" },
  },
  {
    title: "Networking Opportunities",
    body: "Connect with industry professionals, alumni, and peers through our events, allowing you to build relationships with experienced product managers, gain industry insights, and find potential mentors.",
    photo: { src: img("Cc99yzFG3yLwm48n1fgNQ24U6TM.png"), alt: "PMC members at an outdoor picnic" },
  },
];

export type Advisor = { name: string; badge: string; title: string; photo: string; linkedin: string; bio: string };

/** Board of Advisors. Source: ubcpmc.com/partners. */
export const BOARD: Advisor[] = [
  {
    name: "Timothy Yeung",
    badge: "Inaugural Chair",
    title: "Sr. Director of Product Management, AI @ Uberall",
    photo: "Bd8oSWvydvHHXFdp4ulYhRlSrkQ.png",
    linkedin: "https://www.linkedin.com/in/yeungtimothy/",
    bio: "A product leader with over 13 years in tech, Timothy has led PM teams across core social media management, product growth and mobile at Hootsuite. He is Lead Instructor of Product Management & AI for Business at UBC Sauder CBS, received its Student Impact Award, is a past President of ProductBC, and serves as a Vancouver Director of APM Canada and a board member of AI Governance & Safety Canada.",
  },
  {
    name: "Jason Ropchan",
    badge: "Founding Board Member",
    title: "Director of Enterprise Products @ TELUS",
    photo: "e7eCu3cjUREyK9KOARgTiZM6758.jpg",
    linkedin: "https://www.linkedin.com/in/jropchan/",
    bio: "With over 20 years at the intersection of digital and technology, Jason leads the enterprise platforms and services that power 100K+ team members across TELUS Communications, TELUS Health, TELUS Agriculture & Consumer Goods and TELUS Digital. He is a founding board member of UBC PMC and co-founded the Vancouver chapter of APM Canada.",
  },
  {
    name: "Ti Wu",
    badge: "Advisory Board Member",
    title: "Product Management Director @ Visier",
    photo: "XxBbGGJ7vM1pEpaLUW0Ll71Mg.png",
    linkedin: "https://www.linkedin.com/in/tiwuu/",
    bio: "Ti has spent six years bringing B2B products from concept to market, leading 0-to-1 launches and growing mature products in ML/AI and analytics for SMB and enterprise customers. She volunteers and speaks across the product community, and outside work enjoys tennis, skiing, gardening and board games.",
  },
  {
    name: "Kasey Fu",
    badge: "Advisory Board Member",
    title: "Senior AI Product Manager @ Unbounce",
    photo: "QcyblEJU3P1723zQb62YYDcPpvs.jpg",
    linkedin: "https://www.linkedin.com/in/kaseyfu/",
    bio: "Kasey has been a PM at startups, mid-size tech (Planview) and big tech (Microsoft). He co-founded PM Hive, a PM community in Vancouver, co-hosts Vancouver Tech Week, has published a few books, and writes two newsletters on tech and careers.",
  },
];

export const LOGOS: [string, string][] = [
  ["Microsoft", "bGycXTzFwcRG8tQhB8SSG1sNX4.png"],
  ["1Password", "pfzCTdCWJnVtFoc3ocvcIsRCkbM.png"],
  ["Tesla", "SlXM1qIOwTLhnp3eqNEf4sErMHE.png"],
  ["Rivian", "fEY2BK18Y1h7JSRZpLxEgheIto.png"],
  ["Asana", "707lVJPFgP81RY36u8krGbqW9kU.png"],
  ["Avanade", "EoZ6uPSqPNRVXkT2YanL3YDeE.png"],
  ["Amazon", "CSSjzf7OyOsWy7GpeadIxpbZIKY.png"],
  ["Google", "UXO9gxDXhBzrJ67FdW3gqlh9wPM.png"],
  ["Cisco", "DRWO0IkFRzK9iJjHJS3kmwLE.png"],
  ["SAP", "dfuc4rRVIsgeOjrHcTJMq6SPjI.png"],
  ["Samsung", "j5hhjpfvbk0L46O4Acnd2ZX8ll4.png"],
  ["BlackBerry", "h1a1CqiukfdXBdqpkcejpWoKJ1I.png"],
  ["Hootsuite", "7CX9shyKj3oIvYYgnjn61RQ2s.png"],
  ["Dayforce", "iFbuMcrGjHuCh8yw4D9Mxa9qgM.png"],
  ["Salesforce", "qA9D5BuGxQcMH0EcJteo4GZ5Do.png"],
];

export const PHOTOS = {
  group: { src: img("uSFw5tHixwyNTphFnmrrRPUx0.png"), alt: "PMC members gathered for a group photo" },
  event: { src: img("YjmI7fd8LVl0as6nmNvo3pD7Zg.png"), alt: "Event team lined up at the front of a lecture hall" },
  booth: { src: img("hKSqHX8yNZVTmFBzSkcLyPLA9U.jpg"), alt: "The PMC booth welcoming students" },
};
