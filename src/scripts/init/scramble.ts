import { gsap } from '../../lib/gsap';

/**
 * Decode/scramble effect on hover for project names. Scrambles toward the
 * element's own text, so it always resolves correctly even if the pointer
 * leaves mid-animation. Pointer-only; clicks/keyboard activation are unaffected.
 */
export function initScramble(els: HTMLElement[]): () => void {
  const cleanups: Array<() => void> = [];

  els.forEach((el) => {
    const text = el.dataset.scramble || el.textContent || '';
    const onEnter = () => {
      gsap.to(el, {
        duration: 0.6,
        ease: 'none',
        scrambleText: { text, chars: 'upperAndLowerCase', speed: 0.8 },
      });
    };
    el.addEventListener('pointerenter', onEnter);
    cleanups.push(() => {
      el.removeEventListener('pointerenter', onEnter);
      gsap.killTweensOf(el);
      el.textContent = text;
    });
  });

  return () => cleanups.forEach((fn) => fn());
}
