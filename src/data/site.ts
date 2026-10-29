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
};

/** Each event lives in its own repo; stickers only link out. */
export const EVENTS: EventSticker[] = [
  { id: "getaway", name: "Product Getaway", when: "Coming soon", blurb: "Details soon" },
  { id: "jackpot", name: "Product Jackpot", when: "Nov 21–22", blurb: "24-hour product challenge", href: "https://ubcpmc.com/productjackpot" },
  { id: "night", name: "Product Night", when: "October", blurb: "Keynotes, small-group chats and mentors", href: "https://ubcpmc.com/productnight" },
  { id: "heist", name: "Product Heist", when: "November", blurb: "A 24-hour product challenge", href: "https://ubcpmc.com/productheist" },
  { id: "conference", name: "Product Conference", when: "February", blurb: "Keynotes, workshops and panels", href: "https://ubcpmc.com/productconference" },
  { id: "sprint", name: "Product Sprint", when: "March", blurb: "Our flagship two-week PM competition", href: "https://ubcpmc.com/productsprint" },
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

/** [name, role, framer photo id (null = initials), LinkedIn handle]. Update each year. */
type Person = [string, string, string | null, string];

export const TEAM: Record<"exec" | "dir" | "adv", Person[]> = {
  exec: [
    ["Megan Chan", "Co-President", "eNSaTFFltvlBVxvLKd8SFlWSw.png", "meganphchan"],
    ["Minli Wang", "Co-President", "9b8PNP5VLZgFni8Zt0rDKaCrAcg.jpg", "minliw"],
    ["Elisabeth Lau", "VP Partnerships", "1eHyAt7226V3vceeTIC06du5FYg.jpg", "elisabeth-lau"],
    ["Toby Lau", "VP Technology", "hSnrl3KGJbPRJlKz61iC3FHRv5Y.png", "tobylau05"],
    ["Nadeen Horia", "VP Marketing", "t47kSiV16cv19b3exxjmsXkdpk.jpg", "nadeenhoria"],
    ["Lynn Vu", "VP Events", "QaoqjibB1kDqW9bMliEKiqSdm0k.png", "plynnvu"],
    ["Chloe Cheung", "VP Finance", "ox80HxnhxWQhkTfpX4ZLQEU1PQ.png", "chloecheungc"],
    ["Kezia Rijadi", "VP Community", "WCAlrh5nLV8hVQEyDgd0ixobq1k.png", "keziar"],
  ],
  dir: [
    ["Brandon Jong", "Event Director", "cGNpxHMPbkHTV9IEtpfHDwgvgM.jpg", "brandon-jong"],
    ["Aidan Chan", "Event Director", "CITZDJctn735c9ImFbGcHOKj8RA.png", "aidan-chan"],
    ["William He", "Event Director", "IBNNG57HlMNbNTVxe9BR5IRH8.png", "will-he1117"],
    ["Cheuk Cheung", "Marketing Director", "S7tbOP2g9YbrhmxtQ3xzSI0LuD0.jpg", "cheuk-lun-cheung"],
    ["Kathleen Cheng", "Marketing Director", "DZo9GnFOLIaFLXdcmX5q1NwuVjI.jpg", "-kathleen-cheng"],
    ["Dayson How", "Design Director", "4wz4ecLQvqUQC0HeV8b4YNoO84s.jpg", "dayson-how-6a616021b"],
    ["Katrina Mrzljak", "Media Director", "oW4xeA1N9PfpVtCifsDeTqwo9E.jpg", "katrina-mrzljak"],
    ["Elisha Kim", "Finance Director", "fxLqEwB1bxRKD7Xar2jbAEQOkY.png", "elisha-kim-2a6a08309"],
    ["Herb Tan", "Corporate Outreach Director", "Tw4h7aSpqlkHg7s8Rmeaofe96nI.png", "herbmatthewtan"],
    ["Erin Chiu", "Corporate Outreach Director", "tQt5Za17JfvrN5VLtnrtabD6yI.jpg", "erin--chiu"],
    ["Eileen Wang", "Mentor Outreach Director", "AMOzpZUfBiatFYysG9uQEvao.jpg", "eileen-wang-105580326"],
    ["Newgen Bao", "Mentor Outreach Director", "SAhWbsCTQ28sv7dS0gMefkBKdSs.png", "newgen-bao"],
    ["Raksha Zunnuru", "Mentor Outreach Director", "JwMsqcy31Ja6cTliv5lEUd3FPE.jpg", "raksha-zunnuru"],
    ["Melissa Fong", "Internal Program Director", "WJt6ZOe2y085HFlNOaUa4fQWYuA.jpg", "melissahlfong"],
    ["Connor Young", "Community Director", "O86kdttey4fkMAiNm0JTJjuxYuc.jpg", "conryoung"],
    ["Jeffrey Xu", "Community Director", "yKb0ARyHvi5bvlRqERiaIGOSuPM.jpg", "xu-jeffrey"],
    ["Elaine Li", "Product Designer", "FDveCh79LVP6wtOP3myTC4mXaM.jpg", "elaine-li-55b880224"],
    ["Kevin Lei", "Developer", "vOBA4j9XGIfCYsrO0P0MMe5Yik.png", "klei05"],
    ["Si Moon Song", "Developer", "or6cSBPBf0RyXwqJwcT7AGFeX08.png", "simoonsong"],
    ["Jeffrey Zhai", "Sr. Developer", "ZV5PmgWx4LdDsT8mcJysPgvQ1I.png", "jeffrey-zhai-519029257"],
  ],
  adv: [
    ["Kai Koyama-Wang", "Advisor", "PoiJGQItOjHrUs0DOOHeTi13fFA.png", "kaikoyamawong"],
    ["Clara Lei", "Advisor", "euDfv8OJNwyyUHVZNCBQQCA1I.png", "claralei"],
    ["Kitty Liu", "Advisor", "5C4b3pHtYxksX0Ws4YzLvmFo3g.jpg", "kittyliu3"],
    ["Gunyup Chun", "Advisor", "tl9vlVa0pFAx0tgLElr0KS1NtQ.png", "gunyupchun"],
    ["Veronica Zoleta", "Advisor", "1aUmiO6AFCsMRlIJU4quwzg7OQ.png", "veronicazoleta"],
    ["Gordon Cheung", "Advisor", "9K1Za2atInExZhu3TGtsLs7tqHI.png", "gordon-cheung-hwc"],
    ["Fahim Gbon", "Advisor", "YtpC6ugewxFjjPN8CX7I06hvNR8.png", "fahimgbon"],
    ["James Kim", "Advisor", "MapfvQF6z6n2BCKJzOMBenDKGhw.jpg", "jameskimca"],
  ],
};

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

export const LIFE = [
  { src: img("uSFw5tHixwyNTphFnmrrRPUx0.png"), alt: "PMC members gathered for a group photo", caption: "The whole crew", tag: "Team", ratio: 1.4 },
  { src: img("gIrG8JM7zAiFYqI98Pbu588PXU.jpg"), alt: "Product Night poster featuring Geary", caption: "Product Night", tag: "October", ratio: 0.8 },
  { src: img("hKSqHX8yNZVTmFBzSkcLyPLA9U.jpg"), alt: "The PMC booth welcoming students", caption: "Say hi at the booth", tag: "Booth", ratio: 1 },
  { src: img("B0rBpxxJg0VYM53n9iPYj0JrLEc.jpg"), alt: "Product Heist poster", caption: "Product Heist", tag: "November", ratio: 0.8 },
  { src: img("Cc99yzFG3yLwm48n1fgNQ24U6TM.png"), alt: "PMC members at an outdoor picnic", caption: "Picnic social", tag: "Socials", ratio: 1.33 },
  { src: img("YOTBvfm9wMwuyEbB9JVEWFAMHQ.png"), alt: "Product Conference poster", caption: "Product Conference", tag: "February", ratio: 0.8 },
  { src: img("YjmI7fd8LVl0as6nmNvo3pD7Zg.png"), alt: "Event team lined up at the front of a lecture hall", caption: "Event day", tag: "Team", ratio: 1.45 },
  { src: img("mg8wks2Uk8WpPri365cVxWetC8.png"), alt: "Product Sprint poster", caption: "Product Sprint", tag: "March", ratio: 0.8 },
];

export const PHOTOS = {
  group: { src: img("uSFw5tHixwyNTphFnmrrRPUx0.png"), alt: "PMC members gathered for a group photo" },
  event: { src: img("YjmI7fd8LVl0as6nmNvo3pD7Zg.png"), alt: "Event team lined up at the front of a lecture hall" },
  booth: { src: img("hKSqHX8yNZVTmFBzSkcLyPLA9U.jpg"), alt: "The PMC booth welcoming students" },
};
