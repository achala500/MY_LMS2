/**
 * StudySync Lightweight Monoline Academic Celebration Engine
 * Ultra-safe, memory-bounded, zero-leak particle system.
 * Uses a single lightweight canvas with strict GPU memory bounds and immediate Skia texture release.
 */

export interface ConfettiOptions {
  particleCount?: number;
  originX?: number;
  originY?: number;
  style?: 'dual_cannon' | 'fountain' | 'stars_only' | 'cards_only';
}

interface Particle {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
  alpha: number;
  decay: number;
  shape: 'card' | 'star' | 'circle';
}

const PALETTE = ['#fa7268', '#fcd34d', '#c85a32', '#456644', '#ffffff', '#fb923c'];
const CONTOUR = '#19202e';

let activeCanvas: HTMLCanvasElement | null = null;
let activeRafId: number | null = null;
let activeTimeoutId: any = null;

function cleanup() {
  if (activeRafId) {
    cancelAnimationFrame(activeRafId);
    activeRafId = null;
  }
  if (activeTimeoutId) {
    clearTimeout(activeTimeoutId);
    activeTimeoutId = null;
  }
  if (activeCanvas) {
    // Release Skia GPU backing texture in Chromium immediately
    activeCanvas.width = 0;
    activeCanvas.height = 0;
    activeCanvas.remove();
    activeCanvas = null;
  }
}

export function fireConfetti(options?: ConfettiOptions) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  // Reduced motion preference check
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  // Clean up any running instance so we never stack GPU textures
  cleanup();

  const count = Math.min(options?.particleCount || 30, 40);
  const winW = Math.min(window.innerWidth, 1920);
  const winH = Math.min(window.innerHeight, 1080);

  const canvas = document.createElement('canvas');
  activeCanvas = canvas;
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '999999';

  // Keep canvas resolution bounded to 1x DPR to prevent VRAM exhaustion / Crashpad OOM
  canvas.width = winW;
  canvas.height = winH;
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) {
    cleanup();
    return;
  }

  const particles: Particle[] = [];
  const startX = options?.originX !== undefined ? options.originX : winW / 2;
  const startY = options?.originY !== undefined ? options.originY : winH * 0.4;

  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
    const speed = 5 + Math.random() * 8;
    const shapes: ('card' | 'star' | 'circle')[] = ['card', 'star', 'circle'];

    particles.push({
      x: startX,
      y: startY,
      w: 8 + Math.random() * 6,
      h: 10 + Math.random() * 6,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 4,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.08,
      color: PALETTE[i % PALETTE.length],
      alpha: 1,
      decay: 0.015 + Math.random() * 0.015,
      shape: shapes[i % shapes.length],
    });
  }

  // Hard safety timeout: guaranteed removal after 2.2 seconds
  activeTimeoutId = setTimeout(() => {
    cleanup();
  }, 2200);

  const render = () => {
    if (!activeCanvas || !ctx) return;
    ctx.clearRect(0, 0, winW, winH);

    let activeCount = 0;
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      if (p.alpha <= 0) continue;
      activeCount++;

      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.28; // Gravity
      p.vx *= 0.98; // Air drag
      p.rotation += p.rotationSpeed;
      p.alpha = Math.max(0, p.alpha - p.decay);

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.strokeStyle = CONTOUR;
      ctx.lineWidth = 1.25;

      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);

      if (p.shape === 'card') {
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.strokeRect(-p.w / 2, -p.h / 2, p.w, p.h);
      } else if (p.shape === 'star') {
        const r = p.w / 2;
        ctx.beginPath();
        for (let s = 0; s < 4; s++) {
          const a = (s * Math.PI) / 2;
          ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
          ctx.lineTo(Math.cos(a + Math.PI / 4) * (r * 0.4), Math.sin(a + Math.PI / 4) * (r * 0.4));
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      ctx.restore();
    }

    if (activeCount > 0) {
      activeRafId = requestAnimationFrame(render);
    } else {
      cleanup();
    }
  };

  activeRafId = requestAnimationFrame(render);
}
