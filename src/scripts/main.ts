// Client entry. Bundled by Astro (not is:inline) so the GSAP imports tree-shake
// and pick up the /portfolio base + content hashing automatically.
import { mm, NO_PREF, POINTER_FINE, fontsReady } from '../lib/motion';
import { gsap, ScrollTrigger } from '../lib/gsap';
import { initIntro } from './init/intro';
import { initReveal } from './init/reveal';
import { initResume } from './init/resume';
import { initMagnetic } from './init/magnetic';
import { initCursor } from './init/cursor';
import { initScramble } from './init/scramble';
import { initSmoother } from './init/smooth';
import { initShowcase } from './init/showcase';
import { initProgress } from './init/progress';
import { initVortex } from './init/vortex';

const cleanups: Array<() => void> = [];
const add = (fn?: (() => void) | void) => {
  if (fn) cleanups.push(fn);
};

// Runs once the hero intro finishes. Order matters: ScrollSmoother must exist
// before ScrollTriggers (reveal/showcase/progress) bind to it as their scroller.
function setupScroll() {
  mm.add(NO_PREF, () => {
    const smoother = initSmoother();
    return () => smoother?.kill();
  });

  initReveal();
  add(initShowcase());
  add(initProgress());

  // Pixelify loads async; refresh once metrics settle so pins/starts are correct.
  fontsReady().then(() => ScrollTrigger.refresh());
}

function boot() {
  // Ambient background — behind everything, motion-aware internally.
  add(initVortex());

  // Functional UI — always on, independent of scroll/motion.
  add(initResume());

  // Decorative, pointer-only, motion-aware. GSAP auto-reverts the returned
  // cleanup if the media query stops matching.
  mm.add(`${POINTER_FINE} and ${NO_PREF}`, () => {
    const c1 = initCursor();
    const c2 = initMagnetic(gsap.utils.toArray<HTMLElement>('[data-magnetic]'));
    const c3 = initScramble(gsap.utils.toArray<HTMLElement>('[data-scramble]'));
    return () => {
      c1?.();
      c2();
      c3();
    };
  });

  if (document.body.classList.contains('intro-up')) {
    setupScroll();
  } else {
    document.addEventListener('intro:done', setupScroll, { once: true });
  }

  add(initIntro());
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
