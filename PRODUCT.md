# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js (App Router, TypeScript) with three.js for 3D. Chosen by the user.

## Users

UBC students curious about or preparing for product management roles, deciding whether to join the club or volunteer. Secondary: companies and mentors looking to sponsor or speak.

## Product Purpose

The general one-page site for the UBC Product Management Club (UBC PMC). It introduces the club, shows its events, people and proof, and sends visitors to join. Success is a visitor clicking through to become a member or volunteer.

## Positioning

Canada's largest product management club. Founded in 2020; uses industry connections, a tight-knit student network and real PM experience to demystify product management.

## Operating Context

- This site is a single general page. Each event has its own page in a separate repo; this site only links out to them.
- Become a member: https://portal.ubcpmc.com/
- Volunteer as a PM / become a mentor: https://forms.gle/R5Utwtev718pUACw6
- Event pages: https://ubcpmc.com/productnight, /productheist, /productconference, /productsprint, /productjackpot
- Partnerships: partnerships@ubcpmc.com. General: connect@ubcpmc.com.

## Capabilities and Constraints

- No backend in this repo; join flows are external links.
- Team roster changes yearly (2025/26 roster in `src/data/team.ts`).
- Stats (600+ students impacted, 32+ events since 2023, 100+ active members) come from the club's earlier site draft.

## Brand Commitments

- Brand ramp from the PMC posters: periwinkle #8b9cf2, lavender #a97fdc, orchid #d25fa6, rose #e4405e; deep ink #1d1838.
- Poppins throughout, matching ubcpmc.com: 700 for headings, 400–600 for body and UI.
- The glossy 3D PMC triangle logo.
- Geary, the gear-headed mascot (silver gear head, navy suit, white collar, orange tie). 3D model in `public/models/geary.glb`, converted from the club's Rhino export.
- User sketch (Oct 2026) pins the page sequence: draggable 3D gear hero, gear zooms into a dark events section with peelable, draggable event stickers, gear turns to show stats beside Who We Are / Our Mission, an ID lanyard cycling exec profiles beside photos, and Get Involved with an interactive 3D Geary.

## Evidence on Hand

- Event posters, team photos, company logos and event photos hosted on framerusercontent.com (URLs from the earlier draft).
- Company logo strip: Microsoft, 1Password, Tesla, Rivian, Asana, Avanade, Amazon, Google, Cisco, SAP, Samsung, BlackBerry, Hootsuite, Dayforce, Salesforce.
- No testimonials or press on hand; do not invent them.
- "Product Getaway" appears in the sketch but has no live page yet.

## Product Principles

1. Every path ends at joining: membership and volunteering stay one click away.
2. Show the club through its real things: its events, its people, its mascot.
3. Playful to touch, quick to read. Interactions reward curiosity but never hide the content.

## Accessibility & Inclusion

WCAG AA contrast, full keyboard access to every interactive toy (stickers, lanyard, 3D models), and reduced-motion support.
