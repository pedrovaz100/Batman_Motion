import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import gsap from 'gsap';
import { usePointerMotion } from '../../hooks/usePointerMotion';
import {
  computeCoverRect,
  drawCover,
  extractMaskData,
  sampleMaskAlpha,
  type CoverRect,
  type MaskData,
} from './canvasUtils';
import './Hero.css';

const IMG_BASE = '/images/batman-base.jpg';
const IMG_REVEAL = '/images/batman-reveal.jpg';
const IMG_MASK = '/images/batman-mask.png';

const ENTER_DURATION = 0.4;
const EXIT_DURATION = 0.55;
const POSITION_SMOOTH = 0.45;
const POSITION_SMOOTH_REDUCED = 0.05;
const FEATHER = 130;
const GLOW_SCALE = 1.35;
const GLOW_ALPHA = 0.16;
const PARALLAX_MAX = 8;
const AUTO_DEMO_DELAY = 3400;
const MASK_HIT_THRESHOLD = 120;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load ${src}`));
    img.src = src;
  });
}

function getRevealRadius(width: number, height: number): number {
  const base = Math.min(width, height) * 0.3;
  return Math.min(360, Math.max(190, base));
}

type Status = 'loading' | 'ready' | 'error';

export default function Hero() {
  const containerRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const revealCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const glowCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  const imagesRef = useRef<{
    base: HTMLImageElement;
    reveal: HTMLImageElement;
    mask: HTMLImageElement;
  } | null>(null);
  const maskDataRef = useRef<MaskData | null>(null);
  const coverRectRef = useRef<CoverRect>({ scale: 1, dx: 0, dy: 0, dw: 0, dh: 0 });
  const sizeRef = useRef({ width: 0, height: 0, dpr: 1 });

  const hoverRef = useRef(false);
  const radiusRef = useRef({ r: 0 });
  const revealRadiusRef = useRef(260);
  const rafScheduledRef = useRef(false);
  const touchRevealedRef = useRef(false);
  const autoDemoTimeoutRef = useRef<number | undefined>(undefined);
  const autoDemoTweenRef = useRef<gsap.core.Timeline | null>(null);
  const interactedRef = useRef(false);
  const reducedMotionRef = useRef(false);

  const cursorDotRef = useRef<HTMLDivElement | null>(null);
  const cursorRingRef = useRef<HTMLDivElement | null>(null);

  const [status, setStatus] = useState<Status>('loading');
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [heroInView, setHeroInView] = useState(true);

  const renderRef = useRef<() => void>(() => {});

  const requestRender = useCallback(() => {
    if (rafScheduledRef.current) return;
    rafScheduledRef.current = true;
    requestAnimationFrame(() => {
      rafScheduledRef.current = false;
      renderRef.current();
    });
  }, []);

  const pointer = usePointerMotion({
    duration: reducedMotion ? POSITION_SMOOTH_REDUCED : POSITION_SMOOTH,
    ease: 'power3',
    onUpdate: requestRender,
  });

  const cursorPointer = usePointerMotion({ duration: 0.18, ease: 'power3' });

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const touchQuery = window.matchMedia('(hover: none), (pointer: coarse)');

    const applyMotion = () => {
      reducedMotionRef.current = motionQuery.matches;
      setReducedMotion(motionQuery.matches);
    };
    const applyTouch = () => setIsTouchDevice(touchQuery.matches);

    applyMotion();
    applyTouch();

    motionQuery.addEventListener('change', applyMotion);
    touchQuery.addEventListener('change', applyTouch);
    return () => {
      motionQuery.removeEventListener('change', applyMotion);
      touchQuery.removeEventListener('change', applyTouch);
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new IntersectionObserver(([entry]) => setHeroInView(entry.isIntersecting), {
      threshold: 0,
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;

    Promise.all([loadImage(IMG_BASE), loadImage(IMG_REVEAL), loadImage(IMG_MASK)])
      .then(([base, reveal, mask]) => {
        if (cancelled) return;
        imagesRef.current = { base, reveal, mask };
        maskDataRef.current = extractMaskData(mask);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const render = () => {
    const ctx = ctxRef.current;
    const images = imagesRef.current;
    const revealCanvas = revealCanvasRef.current;
    const glowCanvas = glowCanvasRef.current;
    if (!ctx || !images || !revealCanvas || !glowCanvas) return;

    const { width, height } = sizeRef.current;
    if (!width || !height) return;

    const rect = coverRectRef.current;
    const { x: cx, y: cy } = pointer.smoothed;
    const r = radiusRef.current.r;

    ctx.clearRect(0, 0, width, height);
    drawCover(ctx, images.base, rect);

    if (r > 0.5) {
      const parallaxX = clamp(((cx - width / 2) / (width / 2)) * PARALLAX_MAX, -PARALLAX_MAX, PARALLAX_MAX);
      const parallaxY = clamp(((cy - height / 2) / (height / 2)) * PARALLAX_MAX, -PARALLAX_MAX, PARALLAX_MAX);

      const rctx = revealCanvas.getContext('2d')!;
      rctx.clearRect(0, 0, width, height);
      rctx.globalCompositeOperation = 'source-over';
      drawCover(rctx, images.reveal, rect, parallaxX, parallaxY);

      rctx.globalCompositeOperation = 'destination-in';
      drawCover(rctx, images.mask, rect);

      rctx.globalCompositeOperation = 'destination-in';
      const grad = rctx.createRadialGradient(cx, cy, Math.max(r - FEATHER, 0), cx, cy, r);
      grad.addColorStop(0, 'rgba(255,255,255,1)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      rctx.fillStyle = grad;
      rctx.fillRect(0, 0, width, height);

      const gctx = glowCanvas.getContext('2d')!;
      gctx.clearRect(0, 0, width, height);
      const glowR = r * GLOW_SCALE;
      const glowGrad = gctx.createRadialGradient(cx, cy, Math.max(r - FEATHER * 0.5, 0), cx, cy, glowR);
      glowGrad.addColorStop(0, 'rgba(79, 216, 196, 0)');
      glowGrad.addColorStop(0.7, `rgba(79, 216, 196, ${GLOW_ALPHA})`);
      glowGrad.addColorStop(1, 'rgba(79, 216, 196, 0)');
      gctx.fillStyle = glowGrad;
      gctx.fillRect(0, 0, width, height);
      gctx.globalCompositeOperation = 'destination-in';
      drawCover(gctx, images.mask, rect);

      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.drawImage(glowCanvas, 0, 0, width, height);
      ctx.restore();

      ctx.drawImage(revealCanvas, 0, 0, width, height);
    }
  };
  useEffect(() => {
    renderRef.current = render;
  });

  const resize = useCallback(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const revealCanvas = revealCanvasRef.current;
    const glowCanvas = glowCanvasRef.current;
    const images = imagesRef.current;
    if (!container || !canvas || !revealCanvas || !glowCanvas) return;

    const width = container.clientWidth;
    const height = container.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    sizeRef.current = { width, height, dpr };

    for (const c of [canvas, revealCanvas, glowCanvas]) {
      c.width = Math.round(width * dpr);
      c.height = Math.round(height * dpr);
      c.style.width = `${width}px`;
      c.style.height = `${height}px`;
      const cctx = c.getContext('2d');
      cctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    if (images) {
      coverRectRef.current = computeCoverRect(width, height, images.base.naturalWidth, images.base.naturalHeight);
    }
    revealRadiusRef.current = getRevealRadius(width, height);

    requestRender();
  }, [requestRender]);

  useEffect(() => {
    if (status !== 'ready') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    ctxRef.current = canvas.getContext('2d');
    revealCanvasRef.current = document.createElement('canvas');
    glowCanvasRef.current = document.createElement('canvas');

    resize();

    const ro = new ResizeObserver(() => resize());
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener('orientationchange', resize);

    return () => {
      ro.disconnect();
      window.removeEventListener('orientationchange', resize);
    };
  }, [status, resize]);

  const setHover = useCallback(
    (next: boolean, snapX?: number, snapY?: number) => {
      if (hoverRef.current === next) return;
      hoverRef.current = next;

      gsap.killTweensOf(radiusRef.current);

      if (next) {
        if (snapX !== undefined && snapY !== undefined) {
          pointer.jumpTo(snapX, snapY);
        }
        gsap.to(radiusRef.current, {
          r: revealRadiusRef.current,
          duration: reducedMotionRef.current ? 0.001 : ENTER_DURATION,
          ease: 'power2.out',
          onUpdate: requestRender,
        });
      } else {
        gsap.to(radiusRef.current, {
          r: 0,
          duration: reducedMotionRef.current ? 0.001 : EXIT_DURATION,
          ease: 'power2.inOut',
          onUpdate: requestRender,
        });
      }
    },
    [pointer, requestRender],
  );

  const cancelAutoDemo = useCallback(() => {
    if (autoDemoTimeoutRef.current) {
      window.clearTimeout(autoDemoTimeoutRef.current);
      autoDemoTimeoutRef.current = undefined;
    }
    autoDemoTweenRef.current?.kill();
    autoDemoTweenRef.current = null;
  }, []);

  const markInteracted = useCallback(() => {
    if (interactedRef.current) return;
    interactedRef.current = true;
    cancelAutoDemo();
  }, [cancelAutoDemo]);

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (event.pointerType === 'touch') return;
      markInteracted();

      const container = containerRef.current;
      if (!container) return;
      const bounds = container.getBoundingClientRect();
      const px = event.clientX - bounds.left;
      const py = event.clientY - bounds.top;

      cursorPointer.setTarget(px, py);

      const rect = coverRectRef.current;
      const mask = maskDataRef.current;
      let inside = false;
      if (mask && rect.scale > 0) {
        const ix = (px - rect.dx) / rect.scale;
        const iy = (py - rect.dy) / rect.scale;
        inside = sampleMaskAlpha(mask, ix, iy) > MASK_HIT_THRESHOLD;
      }

      if (inside && !hoverRef.current) {
        setHover(true, px, py);
      } else if (!inside && hoverRef.current) {
        setHover(false);
      } else if (inside) {
        pointer.setTarget(px, py);
      }
    },
    [cursorPointer, markInteracted, pointer, setHover],
  );

  const handlePointerLeave = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (event.pointerType === 'touch') return;
      setHover(false);
    },
    [setHover],
  );

  const handleTouchStart = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (event.pointerType !== 'touch') return;
      markInteracted();

      const container = containerRef.current;
      if (!container) return;
      const bounds = container.getBoundingClientRect();
      const px = event.clientX - bounds.left;
      const py = event.clientY - bounds.top;

      if (touchRevealedRef.current) {
        touchRevealedRef.current = false;
        setHover(false);
      } else {
        touchRevealedRef.current = true;
        setHover(true, px, py);
      }
    },
    [markInteracted, setHover],
  );

  const handleTouchMove = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (event.pointerType !== 'touch' || !touchRevealedRef.current) return;
      const container = containerRef.current;
      if (!container) return;
      const bounds = container.getBoundingClientRect();
      const px = event.clientX - bounds.left;
      const py = event.clientY - bounds.top;
      pointer.setTarget(px, py);
    },
    [pointer],
  );

  useEffect(() => {
    if (isTouchDevice || reducedMotion) return;
    let raf = 0;
    const tick = () => {
      const dot = cursorDotRef.current;
      const ring = cursorRingRef.current;
      if (dot && ring) {
        const { x, y } = cursorPointer.smoothed;
        dot.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
        ring.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${hoverRef.current ? 1.6 : 1})`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [cursorPointer, isTouchDevice, reducedMotion]);

  useEffect(() => {
    if (status !== 'ready' || !isTouchDevice || reducedMotion) return;

    autoDemoTimeoutRef.current = window.setTimeout(() => {
      if (interactedRef.current) return;
      const { width, height } = sizeRef.current;
      if (!width || !height) return;

      const cx = width / 2;
      const cy = height / 2;
      pointer.jumpTo(cx * 0.82, cy * 0.9);
      setHover(true, cx * 0.82, cy * 0.9);

      const tl = gsap.timeline({ repeat: -1, yoyo: true, delay: ENTER_DURATION });
      tl.to(pointer.smoothed, {
        x: cx * 1.18,
        y: cy * 1.08,
        duration: 3.2,
        ease: 'sine.inOut',
        onUpdate: requestRender,
      });
      autoDemoTweenRef.current = tl;
    }, AUTO_DEMO_DELAY);

    return () => cancelAutoDemo();
  }, [status, isTouchDevice, reducedMotion, pointer, setHover, requestRender, cancelAutoDemo]);

  useEffect(() => {
    const radiusState = radiusRef.current;
    return () => {
      cancelAutoDemo();
      gsap.killTweensOf(radiusState);
    };
  }, [cancelAutoDemo]);

  const introRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (status !== 'ready') return;
    const el = introRef.current;
    if (!el) return;
    const targets = el.querySelectorAll('[data-intro]');

    if (reducedMotionRef.current) {
      gsap.set(targets, { opacity: 1, y: 0, filter: 'blur(0px)' });
      gsap.set(el, { opacity: 1 });
      return;
    }

    gsap.set(el, { opacity: 1 });
    gsap.fromTo(
      targets,
      { opacity: 0, y: 26, filter: 'blur(8px)' },
      {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 1.1,
        ease: 'power3.out',
        stagger: 0.12,
        delay: 0.35,
      },
    );
  }, [status]);

  const showCustomCursor = !isTouchDevice && !reducedMotion;

  const containerClassName = useMemo(
    () =>
      [
        'hero',
        status === 'ready' && 'hero--ready',
        isTouchDevice && 'hero--touch',
        showCustomCursor && 'hero--customCursor',
      ]
        .filter(Boolean)
        .join(' '),
    [status, isTouchDevice, showCustomCursor],
  );

  return (
    <section
      id="hero"
      ref={containerRef}
      className={containerClassName}
      onPointerMove={(e) => {
        handlePointerMove(e);
        handleTouchMove(e);
      }}
      onPointerDown={handleTouchStart}
      onPointerLeave={handlePointerLeave}
      aria-label="Gotham City — interactive hero"
    >
      <canvas ref={canvasRef} className="hero__canvas" />

      <div className="hero__vignette" aria-hidden="true" />
      <div className="hero__grain" aria-hidden="true" />
      <div className="hero__transition" aria-hidden="true" />

      <div className="hero__content" ref={introRef}>
        <p className="hero__eyebrow" data-intro>
          GOTHAM CITY
        </p>

        <div className="hero__titleBlock">
          <h1 className="hero__title" data-intro>
            BECOME THE SHADOW
          </h1>
          <p className="hero__subtitle" data-intro>
            Move through the darkness. Reveal what Gotham hides.
          </p>
        </div>

        <div className="hero__explore" data-intro>
          <span className="hero__exploreDot" aria-hidden="true" />
          <span>EXPLORE THE SYMBOL</span>
        </div>

        {!isTouchDevice && (
          <p className="hero__hint" data-intro>
            Mova o cursor sobre o símbolo
          </p>
        )}

        <div className="hero__scrollCue" data-intro aria-hidden="true">
          <span className="hero__scrollCueMouse">
            <span className="hero__scrollCueDot" />
          </span>
        </div>
      </div>

      {status === 'loading' && (
        <div className="hero__loader" role="status" aria-live="polite">
          <span className="hero__loaderBar" />
          <span className="hero__loaderText">ENTERING GOTHAM…</span>
        </div>
      )}

      {status === 'error' && (
        <div className="hero__loader" role="alert">
          <span className="hero__loaderText">The symbol failed to load.</span>
        </div>
      )}

      {showCustomCursor && (
        <>
          <div
            ref={cursorRingRef}
            className={`hero__cursorRing ${heroInView ? '' : 'is-hidden'}`}
            aria-hidden="true"
          />
          <div
            ref={cursorDotRef}
            className={`hero__cursorDot ${heroInView ? '' : 'is-hidden'}`}
            aria-hidden="true"
          />
        </>
      )}
    </section>
  );
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
