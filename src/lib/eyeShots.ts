import { asset } from "@/lib/asset";

/**
 * The flat pictures of the events section that live in Geary's eye, one per layout the section really has, widest
 * first, so the dive lands on what's there: `media` picks one, `aspect` is its height ÷ width, `title` is where the
 * EVENTS title sits down it (0–1) and `max` the widest it shows, in CSS px. Retake them whenever Events changes.
 */
export type EyeShot = { media: string; src: string; aspect: number; title: number; max: number };

export const EYE_SHOTS: EyeShot[] = [
  // the sticker wall, which needs a mouse: same test as Events' `board`
  { media: "(min-width: 1000px) and (pointer: fine)", src: asset("/events/eye-desktop.webp"), aspect: 0.6389, title: 0.2053, max: 1440 },
  // the print grid at four columns, then three, then two
  { media: "(min-width: 905px)", src: asset("/events/eye-tablet-wide.webp"), aspect: 0.9472, title: 0.1616, max: Infinity },
  { media: "(min-width: 671px)", src: asset("/events/eye-tablet.webp"), aspect: 1.2286, title: 0.1246, max: Infinity },
  { media: "all", src: asset("/events/eye-phone.webp"), aspect: 3.059, title: 0.0735, max: Infinity },
];

export const pickEyeShot = () => EYE_SHOTS.find((s) => window.matchMedia(s.media).matches) ?? EYE_SHOTS[EYE_SHOTS.length - 1];
