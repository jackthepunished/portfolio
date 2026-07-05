import { gsap } from '../../lib/gsap';

/**
 * Magnetic pull on pointer-fine devices: the element eases toward the cursor and
 * springs back on leave. `data-magnetic="lift"` adds a subtle scale (replacing
 * the old CSS :hover scale on the reel/resume thumbs). Pointer-only — keyboard
 * focus order and activation are untouched.
 */
export function initMagnetic(els: HTMLElement[]): () => void {
  const cleanups: Array<() => void> = [];

  els.forEach((el) => {
    const lift = el.dataset.magnetic === 'lift';
    const xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3' });
    const sTo = lift ? gsap.quickTo(el, 'scale', { duration: 0.4, ease: 'power3' }) : null;
    const strength = 0.35;

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * strength);
      yTo((e.clientY - (r.top + r.height / 2)) * strength);
    };
    const onEnter = () => sTo?.(1.06);
    const onLeave = () => {
      xTo(0);
      yTo(0);
      sTo?.(1);
    };

    el.addEventListener('pointerenter', onEnter);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    cleanups.push(() => {
      el.removeEventListener('pointerenter', onEnter);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      gsap.set(el, { clearProps: 'transform' });
    });
  });

  return () => cleanups.forEach((fn) => fn());
}
