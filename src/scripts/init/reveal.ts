import { gsap, ScrollTrigger } from '../../lib/gsap';
import { prefersReduced } from '../../lib/motion';

/**
 * Scroll-triggered content reveal. Each [data-reveal] block fades/rises in as it
 * enters the viewport (batched so neighbors animate together). Elements that
 * also parallax (data-speed) fade without a y-offset so ScrollSmoother keeps
 * ownership of their transform.
 */
export function initReveal(): void {
  const all = gsap.utils.toArray<HTMLElement>('[data-reveal]');
  if (!all.length) return;

  if (prefersReduced()) {
    gsap.set(all, { autoAlpha: 1, clearProps: 'transform' });
    return;
  }

  const slide = all.filter((el) => !el.hasAttribute('data-speed'));
  const fade = all.filter((el) => el.hasAttribute('data-speed'));

  if (slide.length) {
    gsap.set(slide, { autoAlpha: 0, y: 14 });
    ScrollTrigger.batch(slide, {
      start: 'top 88%',
      onEnter: (batch) =>
        gsap.to(batch, {
          autoAlpha: 1,
          y: 0,
          duration: 0.7,
          ease: 'power3.out',
          stagger: 0.08,
          overwrite: 'auto',
          clearProps: 'transform',
        }),
    });
  }

  if (fade.length) {
    gsap.set(fade, { autoAlpha: 0 });
    ScrollTrigger.batch(fade, {
      start: 'top 88%',
      onEnter: (batch) =>
        gsap.to(batch, { autoAlpha: 1, duration: 0.8, ease: 'power2.out', stagger: 0.08, overwrite: 'auto' }),
    });
  }
}
