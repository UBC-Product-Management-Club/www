/**
 * The site's base path: empty when it is served from the root (Cloud Run, local dev), "/www" when GitHub Pages
 * serves it as a project site. next.config.ts works it out once and sets both Next's `basePath` and this value,
 * so the two can't drift. Next prefixes its own routes and bundles; plain file paths go through `asset`.
 */
export const BASE = process.env.SITE_BASE_PATH ?? "";

/** A file in public/, as a URL that works under the base path. */
export const asset = (path: string) => `${BASE}${path}`;
