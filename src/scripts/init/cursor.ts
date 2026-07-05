import { gsap } from '../../lib/gsap';

/**
 * Custom cursor: a fast dot + a trailing ring that grows over interactive
 * elements and contracts on press. Only invoked under (hover:hover) +
 * (pointer:fine) + no-preference, so keyboard/touch users keep the native
 * cursor. The native cursor is hidden only while this is active.
 */
export function initCursor(): (() => void) | void {
  const dot = document.querySelector<HTMLElement>('[data-cursor-dot]');
  const ring = document.querySelector<HTMLElement>('[data-cursor-ring]');
  if (!dot || !ring) return;

  document.documentElement.classList.add('custom-cursor');
  gsap.set([dot, ring], { xPercent: -50, yPercent: -50, autoAlpha: 0 });

  const ringX = gsap.quickTo(ring, 'x', { duration: 0.35, ease: 'power3' });
  const ringY = gsap.quickTo(ring, 'y', { duration: 0.35, ease: 'power3' });
  const dotX = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power3' });
  const dotY = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power3' });

  let shown = false;
  const show = () => {
    if (shown) return;
    shown = true;
    gsap.to([dot, ring], { autoAlpha: 1, duration: 0.3 });
  };
  const onMove = (e: PointerEvent) => {
    show();
    ringX(e.clientX);
    ringY(e.clientY);
    dotX(e.clientX);
    dotY(e.clientY);
  };
  const onEnterLink = () => gsap.to(ring, { scale: 2.4, duration: 0.3 });
  const onLeaveLink = () => gsap.to(ring, { scale: 1, duration: 0.3 });
  const onDown = () => gsap.to(ring, { scale: 0.8, duration: 0.15 });
  const onUp = () => gsap.to(ring, { scale: 1, duration: 0.15 });
  // Hide when the pointer leaves the window, and reset `shown` so the next move
  // (or re-entry) fades it back in — otherwise it stays invisible while the
  // native cursor is still suppressed, leaving no cursor at all.
  const onHide = () => {
    shown = false;
    gsap.to([dot, ring], { autoAlpha: 0, duration: 0.2 });
  };

  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerdown', onDown);
  window.addEventListener('pointerup', onUp);
  document.addEventListener('pointerleave', onHide);

  const links = gsap.utils.toArray<HTMLElement>('[data-cursor="link"], a, button');
  links.forEach((l) => {
    l.addEventListener('pointerenter', onEnterLink);
    l.addEventListener('pointerleave', onLeaveLink);
  });

  return () => {
    document.documentElement.classList.remove('custom-cursor');
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerdown', onDown);
    window.removeEventListener('pointerup', onUp);
    document.removeEventListener('pointerleave', onHide);
    links.forEach((l) => {
      l.removeEventListener('pointerenter', onEnterLink);
      l.removeEventListener('pointerleave', onLeaveLink);
    });
    gsap.set([dot, ring], { autoAlpha: 0 });
  };
}
