import { prefersReduced } from '../../lib/motion';

/**
 * Ambient ASCII vortex background (inspired by arlan.me/vault/midjourney, adapted
 * to a subtle, light-theme backdrop). A field of faint glyphs swirls around the
 * screen centre — fast in the middle, barely moving at the edges — as pure
 * ambient motion. It never coalesces into a word.
 *
 * Canvas 2D (not WebGL): the effect is deliberately low-density and low-contrast,
 * so a few hundred fillText calls per frame are plenty and stay cheap. Sits behind
 * all content and never intercepts pointer events. The whole field fades out as
 * the closing statement scrolls into view.
 */

const GLYPHS = 'abcdefghijklmnopqrstuvwxyz0123456789<>/\\[]{}=+*·:';

const BASE_ALPHA = 0.3; // resting glyph opacity (sparse swirl → stays gentle)
const GLYPH_PX = 14; // on-screen glyph size

interface Particle {
  r: number; // swirl radius
  a: number; // swirl base angle
  w: number; // swirl angular speed (rad/s) — higher near the centre
  ch: string; // current character
  flip: number; // seconds until this glyph swaps character
}

export function initVortex(): (() => void) | void {
  const canvas = document.querySelector<HTMLCanvasElement>('[data-vortex]');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let W = 0;
  let H = 0;
  let cx = 0;
  let cy = 0;
  let dpr = 1;
  let particles: Particle[] = [];

  const glyphColor = () => {
    const fg = getComputedStyle(document.documentElement).getPropertyValue('--ink').trim();
    return fg || '#2c2c31';
  };
  let color = glyphColor();

  function rand(seed: number) {
    const s = Math.sin(seed * 12.9898) * 43758.5453;
    return s - Math.floor(s);
  }

  function build() {
    const maxR = Math.hypot(W, H) * 0.55; // reaches the corners
    const cap = W < 700 ? 550 : 1400;
    const count = Math.min(cap, Math.floor((W * H) / 900));
    particles = new Array(count);
    for (let i = 0; i < count; i++) {
      const rr = Math.sqrt(rand(i + 1)) * maxR; // sqrt → even area coverage
      // Angular speed falls off with radius: centre spins fast, rim barely moves.
      const w = (0.55 * (maxR * 0.14)) / (rr + maxR * 0.14);
      particles[i] = {
        r: rr,
        a: rand(i + 7) * Math.PI * 2,
        w: w * (rand(i + 3) > 0.5 ? 1 : 0.82),
        ch: GLYPHS[Math.floor(rand(i + 11) * GLYPHS.length)],
        flip: rand(i + 5) * 2,
      };
    }
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    cx = W / 2;
    cy = H / 2;
    canvas!.width = Math.floor(W * dpr);
    canvas!.height = Math.floor(H * dpr);
    canvas!.style.width = W + 'px';
    canvas!.style.height = H + 'px';
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx!.font = `${GLYPH_PX}px "MEKsans", ui-monospace, monospace`;
    ctx!.textAlign = 'center';
    ctx!.textBaseline = 'middle';
    color = glyphColor();
    build();
  }

  // The whole field fades out as the closing statement scrolls into view.
  const fadeEl = document.querySelector<HTMLElement>('[data-vortex-fade]');
  let vis = 1;
  function targetVis(): number {
    if (!fadeEl) return 1;
    const top = fadeEl.getBoundingClientRect().top;
    const startY = window.innerHeight; // begins fading once the section edges in
    const endY = window.innerHeight * 0.45; // fully gone by the time it's ~centred
    return Math.max(0, Math.min(1, (top - endY) / (startY - endY)));
  }

  let raf = 0;
  let start = -1;
  let last = 0;

  function frame(now: number) {
    if (start < 0) start = now;
    const t = (now - start) / 1000;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    vis += (targetVis() - vis) * Math.min(1, dt * 8); // smooth the scroll fade

    ctx!.clearRect(0, 0, W, H);
    ctx!.fillStyle = color;

    if (vis > 0.01) {
      ctx!.globalAlpha = BASE_ALPHA * vis;
      for (let i = 0; i < particles.length; i++) {
        const pt = particles[i];
        const ang = pt.a + pt.w * t;
        const x = cx + Math.cos(ang) * pt.r;
        const y = cy + Math.sin(ang) * pt.r;

        // Occasionally swap each glyph so the field feels alive.
        pt.flip -= dt;
        if (pt.flip <= 0) {
          pt.ch = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          pt.flip = 0.8 + Math.random() * 2.5;
        }

        ctx!.fillText(pt.ch, x, y);
      }
      ctx!.globalAlpha = 1;
    }
    raf = requestAnimationFrame(frame);
  }

  // Reduced motion: render the scattered field once, faint and still.
  function drawStatic() {
    ctx!.clearRect(0, 0, W, H);
    ctx!.fillStyle = color;
    ctx!.globalAlpha = BASE_ALPHA;
    for (const pt of particles) {
      ctx!.fillText(pt.ch, cx + Math.cos(pt.a) * pt.r, cy + Math.sin(pt.a) * pt.r);
    }
    ctx!.globalAlpha = 1;
  }

  resize();

  if (prefersReduced()) {
    drawStatic();
    const onResize = () => {
      resize();
      drawStatic();
    };
    window.addEventListener('resize', onResize);
    // Hide the static glyphs when the closing statement is on screen.
    let io: IntersectionObserver | null = null;
    if (fadeEl && 'IntersectionObserver' in window) {
      io = new IntersectionObserver(
        ([e]) => {
          canvas.style.opacity = e.isIntersecting ? '0' : '1';
        },
        { threshold: 0.35 },
      );
      io.observe(fadeEl);
    }
    return () => {
      window.removeEventListener('resize', onResize);
      io?.disconnect();
    };
  }

  let resizeTimer = 0;
  const onResize = () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(resize, 150);
  };
  const onVisibility = () => {
    if (document.visibilityState === 'hidden') {
      cancelAnimationFrame(raf);
      raf = 0;
    } else if (!raf) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
  };

  window.addEventListener('resize', onResize);
  document.addEventListener('visibilitychange', onVisibility);
  raf = requestAnimationFrame(frame);

  return () => {
    cancelAnimationFrame(raf);
    window.clearTimeout(resizeTimer);
    window.removeEventListener('resize', onResize);
    document.removeEventListener('visibilitychange', onVisibility);
  };
}
