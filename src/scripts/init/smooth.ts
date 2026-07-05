import { ScrollSmoother } from '../../lib/gsap';

/**
 * Buttery scroll via ScrollSmoother. Created only when motion is allowed (gated
 * by the caller). `effects: true` enables data-speed/data-lag parallax.
 */
export function initSmoother(): ScrollSmoother | undefined {
  if (!document.getElementById('smooth-wrapper')) return;
  return ScrollSmoother.create({
    wrapper: '#smooth-wrapper',
    content: '#smooth-content',
    smooth: 1.1,
    effects: true,
    normalizeScroll: true,
  });
}
