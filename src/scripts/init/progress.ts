import { gsap, ScrollTrigger } from '../../lib/gsap';
import { prefersReduced } from '../../lib/motion';

/**
 * Thin top scroll-progress bar (scaleX 0→1). Hidden under reduced motion (CSS).
 */
export function initProgress(): (() => void) | void {
  const bar = document.querySelector<HTMLElement>('[data-progress-bar]');
  if (!bar || prefersReduced()) return;

  gsap.set(bar, { scaleX: 0, transformOrigin: 'left center' });
  const st = ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => gsap.set(bar, { scaleX: self.progress }),
  });

  return () => st.kill();
}
