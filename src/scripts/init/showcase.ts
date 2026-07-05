import { gsap, ScrollTrigger } from '../../lib/gsap';
import { prefersReduced } from '../../lib/motion';

/**
 * Featured projects as a pinned horizontal showcase: the section pins and its
 * track scrolls left as you scroll down. On touch / reduced motion the track is
 * a plain vertical list (CSS) and this is skipped.
 */
export function initShowcase(): (() => void) | void {
  const section = document.querySelector<HTMLElement>('[data-showcase]');
  const track = document.querySelector<HTMLElement>('[data-showcase-track]');
  if (!section || !track) return;
  if (prefersReduced() || window.matchMedia('(max-width: 600px)').matches) return;

  const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);

  const tween = gsap.to(track, {
    x: () => -distance(),
    ease: 'none',
    scrollTrigger: {
      trigger: section,
      pin: true,
      scrub: 1,
      anticipatePin: 1,
      start: 'top top',
      end: () => '+=' + distance(),
      invalidateOnRefresh: true,
    },
  });

  return () => {
    tween.scrollTrigger?.kill();
    tween.kill();
  };
}
