import { gsap, SplitText } from '../../lib/gsap';
import { fontsReady, prefersReduced } from '../../lib/motion';

// The 4-step palette the original typewriter cycled through while typing.
const PALETTE = ['#659287', '#88BDA4', '#B1D3B9', '#E6F2DD'];

// Resting heading position (matches the small top-center h1).
const REST_TOP = 28;
const REST_SIZE = 22;
const SHRINK_DURATION = 1.4;

/**
 * Hero: char-reveal the word while cycling color, settle to --fg, then slowly
 * shrink it from the big centered title to the small top heading by animating
 * font-size + position on a single fixed→absolute element (no transform-scale,
 * so the glyphs stay crisp and the motion is smooth). Signals `intro:done` when
 * the shrink finishes so the content reveal can begin.
 */
export function initIntro(): (() => void) | void {
  const h1 = document.querySelector<HTMLElement>('[data-anim="intro"]');
  if (!h1) {
    // No hero on this page — let the content reveal proceed anyway.
    document.body.classList.add('intro-up');
    document.dispatchEvent(new Event('intro:done'));
    return;
  }
  const textEl = h1.querySelector<HTMLElement>('.intro-title__text');
  const caret = h1.querySelector<HTMLElement>('.caret');
  if (!textEl) return;

  const fg =
    getComputedStyle(document.documentElement).getPropertyValue('--fg').trim() || '#000';

  function finish() {
    document.body.classList.add('intro-up');
    if (caret) caret.classList.add('is-visible', 'is-blinking');
    document.dispatchEvent(new Event('intro:done'));
  }

  // Reduced motion: no typing, no shrink — drop straight to the resting heading.
  if (prefersReduced()) {
    gsap.set(h1, {
      visibility: 'visible',
      position: 'absolute',
      left: '50%',
      xPercent: -50,
      top: REST_TOP,
      fontSize: REST_SIZE,
      letterSpacing: 0,
    });
    finish();
    return;
  }

  let split: InstanceType<typeof SplitText> | null = null;
  let tl: gsap.core.Timeline | null = null;
  let cancelled = false;

  const revertSplit = () => {
    if (split) {
      split.revert();
      split = null;
    }
  };

  fontsReady().then(() => {
    if (cancelled) return;

    split = new SplitText(textEl, { type: 'chars', charsClass: 'introchar' });
    // The h1 keeps aria-label="bahadir"; hide the generated spans from SR.
    split.chars.forEach((c) => c.setAttribute('aria-hidden', 'true'));

    // Big centered title, vertically centered via top (so the shrink is a plain
    // top + font-size tween with no positioning-model switch mid-flight).
    gsap.set(h1, {
      visibility: 'visible',
      left: '50%',
      xPercent: -50,
      top: () => (window.innerHeight - h1.offsetHeight) / 2,
    });
    gsap.set(split.chars, { autoAlpha: 0 });
    gsap.set(textEl, { color: PALETTE[0] });

    const step = 0.12;
    const typeDur = split.chars.length * step;

    tl = gsap.timeline();
    tl.to(split.chars, { autoAlpha: 1, duration: 0.06, stagger: step, ease: 'none' }, 0);
    // Cycle the color in step with the reveal, then settle to the foreground.
    PALETTE.forEach((c, i) => {
      tl!.set(textEl, { color: c }, (i / PALETTE.length) * typeDur);
    });
    tl!.to(textEl, { color: fg, duration: 0.25 }, typeDur);
    // Flatten back to plain text, then slowly shrink to the resting heading.
    tl!.call(revertSplit, undefined, '+=0.15');
    tl!.to(h1, {
      top: REST_TOP,
      fontSize: REST_SIZE,
      letterSpacing: 0,
      duration: SHRINK_DURATION,
      ease: 'power2.inOut',
      onComplete: () => {
        // Switch to absolute at scroll 0 so the heading scrolls with the page.
        gsap.set(h1, { position: 'absolute', top: REST_TOP });
        finish();
      },
    });
  });

  return () => {
    cancelled = true;
    tl?.kill();
    revertSplit();
  };
}
