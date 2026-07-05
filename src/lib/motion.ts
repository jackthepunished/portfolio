// Shared motion helpers: one matchMedia instance + reduced-motion / font gating.
import { gsap } from './gsap';

// One GSAP matchMedia for the whole app. Decorative motion registers contexts
// here so GSAP auto-reverts them if the OS setting flips live.
export const mm = gsap.matchMedia();

export const REDUCE = '(prefers-reduced-motion: reduce)';
export const NO_PREF = '(prefers-reduced-motion: no-preference)';
export const POINTER_FINE = '(hover: hover) and (pointer: fine)';

export function prefersReduced(): boolean {
  return window.matchMedia(REDUCE).matches;
}

// Resolve when web fonts are ready, but never hang the UI: Pixelify Sans loads
// async, so SplitText must wait for it — yet a font that never loads must not
// keep the page blank. Race the real signal against a timeout fallback.
export function fontsReady(timeout = 1500): Promise<void> {
  if (!('fonts' in document)) return Promise.resolve();
  const ready = (document as Document & { fonts: FontFaceSet }).fonts.ready
    .then(() => undefined)
    .catch(() => undefined);
  const fallback = new Promise<void>((res) => window.setTimeout(res, timeout));
  return Promise.race([ready, fallback]);
}
