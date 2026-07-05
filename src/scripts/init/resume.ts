import { gsap, ScrollSmoother } from '../../lib/gsap';
import { prefersReduced } from '../../lib/motion';

/**
 * Resume modal — reversible GSAP timeline (backdrop fade + frame rise/scale +
 * close-button fade) with overflow lock, ARIA, Escape/click-outside, a focus
 * trap and focus restore.
 */
export function initResume(): (() => void) | void {
  const modal = document.getElementById('resumeModal');
  const thumb = document.getElementById('resumeThumb');
  const closeBtn = document.getElementById('resumeClose');
  const frame = modal?.querySelector<HTMLElement>('.resume-frame') ?? null;
  if (!modal || !thumb || !frame) return;

  let lastFocus: HTMLElement | null = null;
  let isOpen = false;

  const build = () => {
    const reduce = prefersReduced();
    const t = gsap.timeline({ paused: true });
    t.set(modal, { visibility: 'visible', pointerEvents: 'auto' });
    t.fromTo(
      modal,
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: reduce ? 0.001 : 0.22, ease: 'power2.out' },
      0
    );
    t.fromTo(
      frame,
      { y: reduce ? 0 : 24, scale: reduce ? 1 : 0.97, autoAlpha: 0 },
      { y: 0, scale: 1, autoAlpha: 1, duration: reduce ? 0.001 : 0.32, ease: 'expo.out' },
      0
    );
    if (closeBtn) {
      t.fromTo(closeBtn, { autoAlpha: 0 }, { autoAlpha: 1, duration: reduce ? 0.001 : 0.22 }, 0.08);
    }
    return t;
  };

  let tl = build();

  const focusables = () =>
    Array.from(
      modal.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')
    ).filter((el) => el.offsetParent !== null || el === closeBtn);

  const onTrap = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    const els = focusables();
    if (!els.length) return;
    const first = els[0];
    const last = els[els.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  function open() {
    if (isOpen) return;
    isOpen = true;
    lastFocus = document.activeElement as HTMLElement;
    modal!.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    ScrollSmoother.get()?.paused(true);
    tl = build();
    tl.play(0);
    (closeBtn ?? frame)?.focus?.();
    document.addEventListener('keydown', onTrap, true);
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;
    document.removeEventListener('keydown', onTrap, true);
    tl.eventCallback('onReverseComplete', () => {
      modal!.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      gsap.set(modal!, { visibility: 'hidden', pointerEvents: 'none' });
      ScrollSmoother.get()?.paused(false);
      lastFocus?.focus?.();
    });
    tl.reverse();
  }

  const onThumb = () => open();
  const onClose = () => close();
  const onBackdrop = (e: MouseEvent) => {
    if (e.target === modal) close();
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) close();
  };

  thumb.addEventListener('click', onThumb);
  if (closeBtn) closeBtn.addEventListener('click', onClose);
  modal.addEventListener('click', onBackdrop);
  document.addEventListener('keydown', onKey);

  return () => {
    thumb.removeEventListener('click', onThumb);
    if (closeBtn) closeBtn.removeEventListener('click', onClose);
    modal.removeEventListener('click', onBackdrop);
    document.removeEventListener('keydown', onKey);
    document.removeEventListener('keydown', onTrap, true);
    tl.kill();
  };
}
