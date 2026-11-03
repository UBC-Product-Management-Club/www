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

/** Each event lives in its own repo; stickers only link out. */
export const EVENTS: EventSticker[] = [
  { id: "getaway", name: "Product Getaway", when: "Coming soon", blurb: "Details soon" },
  { id: "jackpot", name: "Product Jackpot", when: "Nov 21–22", blurb: "24-hour product challenge", href: "https://ubcpmc.com/productjackpot", poster: asset("/events/jackpot.webp") },
  { id: "night", name: "Product Night", when: "October", blurb: "Keynotes, small-group chats and mentors", href: "https://ubcpmc.com/productnight", poster: img("gIrG8JM7zAiFYqI98Pbu588PXU.jpg", 640) },
  { id: "heist", name: "Product Heist", when: "November", blurb: "A 24-hour product challenge", href: "https://ubcpmc.com/productheist", poster: img("B0rBpxxJg0VYM53n9iPYj0JrLEc.jpg", 640) },
  { id: "conference", name: "Product Conference", when: "February", blurb: "Keynotes, workshops and panels", href: "https://ubcpmc.com/productconference", poster: img("YOTBvfm9wMwuyEbB9JVEWFAMHQ.png", 640) },
  { id: "sprint", name: "Product Sprint", when: "March", blurb: "Our flagship two-week PM competition", href: "https://ubcpmc.com/productsprint", poster: img("mg8wks2Uk8WpPri365cVxWetC8.png", 640) },
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

export type TeamGroup = "Co-Presidents" | "Events" | "Partnerships" | "Marketing" | "Community" | "Finance" | "Tech" | "Advisors";

/** The teams, in the roster's order; each shows as its own set of polaroids. */
export const TEAMS: TeamGroup[] = ["Co-Presidents", "Community", "Events", "Finance", "Marketing", "Tech", "Partnerships", "Advisors"];

export type Member = {
  name: string;
  role: string;
  group: TeamGroup;
  /** Square headshot in public/team, or null for initials. */
  photo: string | null;
  url: string | null;
  /** The emoji each member picks for their polaroid. Ask anyone still null to send one. */
  emoji: string | null;
};

const m = (name: string, role: string, group: TeamGroup, photo: boolean, url: string | null = null, emoji: string | null = null): Member => ({
  name,
  role,
  group,
  photo: photo ? asset(`/team/${name.toLowerCase().replace(/[^a-z]+/g, "-")}.webp`) : null,
  url,
  emoji,
});

/**
 * The 2026/27 team, from the club's "PMC 26 27" roster and in its order within each team. Photos come from
 * that roster, or last year's site where the roster has none (Eileen Wang, Dayson How).
 */
const ROSTER: Member[] = [
  m("Kat Mrzljak", "Co-President", "Co-Presidents", true),
  m("Chloe Cheung", "Co-President", "Co-Presidents", true, "https://www.linkedin.com/in/chloecheungc/", "💫"),
  m("Jayjay Silapakalnpradit", "First Year Representative", "Community", true, "https://www.linkedin.com/in/jayjaysil"),
  m("Rylie Tsui", "Community Director", "Community", false, "https://www.linkedin.com/in/rylie-taylor-tsui-961902381"),
  m("Riley So", "Community Director", "Community", false),
  m("Dayson How", "VP Community", "Community", true),
  m("David Kim", "Events Director", "Events", false, "https://www.linkedin.com/in/dakim13/"),
  m("Claire Zhang", "VP Events", "Events", true, "https://www.linkedin.com/in/claire-zhang-985410301/"),
  m("Sergio Lopez", "Finance Director", "Finance", false, "https://www.linkedin.com/in/sergiodalopez/"),
  m("Jaymus Choi", "VP Finance", "Finance", false),
  m("Carmen Setiawan", "Design Director", "Marketing", false, "https://www.linkedin.com/in/carmen-laeticia-setiawan-20b173395"),
  m("Fred Austin", "Design Director", "Marketing", true, "https://fredaustin.ca"),
  m("Kelly Wei Jin", "Marketing Director", "Marketing", false),
  m("Lily Chen", "Media Director", "Marketing", false),
  m("Jenny Lan", "Media Director", "Marketing", false),
  m("Jonathan Ysonza", "Media Director", "Marketing", false, "https://www.linkedin.com/in/jonathan-ysonza-9747a3337/"),
  m("Cheuk-Lun Cheung", "VP Media", "Marketing", true, "https://www.linkedin.com/in/cheuk-lun-cheung"),
  m("Tiya Verma", "Developer", "Tech", false),
  m("Kanwar Sekhon", "Developer", "Tech", false),
  m("Ege Taslicay", "Developer", "Tech", false),
  m("Roberta Lee", "Product Designer", "Tech", false),
  m("Alexi Manning", "Product Designer", "Tech", true, "https://www.linkedin.com/in/aleximanning"),
  m("Evan Peng", "Developer", "Tech", false),
  m("Kashish Garg", "Developer", "Tech", true, "https://www.linkedin.com/in/kashishgarg1/"),
  m("Donald Lee", "VP Technology", "Tech", true, "https://www.linkedin.com/in/donald-k-lee/"),
  m("Cherry Wang", "Partnerships", "Partnerships", false),
  m("Accita Ongko", "Mentor Outreach Director", "Partnerships", true, "https://www.linkedin.com/in/accitadeviongko/", "🐒"),
  m("Jagathi Moturi", "Partnerships", "Partnerships", false),
  m("Moaz Aleem", "Partnerships", "Partnerships", false),
  m("Steven Zhu", "Partnerships", "Partnerships", false),
  m("Eileen Wang", "Partnerships", "Partnerships", true),
  m("Elisabeth Lau", "Advisor", "Advisors", true, "https://www.linkedin.com/in/elisabeth-lau"),
  m("Megan Chan", "Advisor", "Advisors", true, "https://www.linkedin.com/in/meganphchan/"),
  m("Kezia Rijadi", "Advisor", "Advisors", true, "https://www.linkedin.com/in/keziar"),
  m("Jeffrey Xu", "Advisor", "Advisors", true, "https://www.linkedin.com/in/xu-jeffrey"),
];

/** Team by team, each team's VP first, everyone else in the roster's order. */
export const TEAM: Member[] = TEAMS.flatMap((t) => {
  const team = ROSTER.filter((p) => p.group === t);
  return [...team.filter((p) => p.role.startsWith("VP")), ...team.filter((p) => !p.role.startsWith("VP"))];
});

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
    name: "Lee Ling Yang",
    badge: "Advisory Board Member",
    title: "Head of Product @ Levvy",
    photo: "oXi9kihDKts7kvmdKJwPyjs81RU.jpg",
    linkedin: "https://www.linkedin.com/in/leelingyang/",
    bio: "Lee Ling has over seven years in B2B SaaS, from Microsoft to early-stage Levvy, where she is Head of Product. She holds a Master’s in Biology from UBC, helps people from other fields break into product, has mentored aspiring PMs through Lenny’s Newsletter and Ascend, and previously served on the board of Product BC.",
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
