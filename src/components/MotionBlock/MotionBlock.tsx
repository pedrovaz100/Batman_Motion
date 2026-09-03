import { useRef, type ElementType, type ReactNode } from 'react';
import { gsap } from '../../motion/gsap';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { useMediaQuery } from '../../hooks/useMediaQuery';

export interface MotionBlockProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  from?: 'up' | 'down' | 'left' | 'right' | 'none';
  distance?: number;
  blur?: number;
  scale?: number;
  duration?: number;
  delay?: number;
  start?: string;
}

const OFFSETS: Record<string, { x: number; y: number }> = {
  up: { x: 0, y: 1 },
  down: { x: 0, y: -1 },
  left: { x: 1, y: 0 },
  right: { x: -1, y: 0 },
  none: { x: 0, y: 0 },
};

export default function MotionBlock({
  children,
  as = 'div',
  className,
  from = 'up',
  distance = 32,
  blur = 6,
  scale,
  duration = 0.9,
  delay = 0,
  start = 'top 85%',
}: MotionBlockProps) {
  const ref = useRef<HTMLElement | null>(null);
  const Tag = as;
  const isMobile = useMediaQuery('(max-width: 760px)');

  useScrollReveal(
    ref,
    (el, reducedMotion) => {
      gsap.set(el, { clearProps: 'transform,opacity,filter' });

      if (reducedMotion) {
        gsap.set(el, { opacity: 1, x: 0, y: 0, scale: 1, filter: 'blur(0px)' });
        return;
      }

      const effectiveFrom = isMobile ? 'up' : from;
      const dir = OFFSETS[effectiveFrom] ?? OFFSETS.up;
      const effectiveDistance = isMobile ? Math.min(distance, 30) : distance;
      const effectiveBlur = isMobile ? Math.min(blur, 4) : blur;
      const initialScale = scale ?? 1;

      gsap.set(el, {
        opacity: 0,
        x: dir.x * effectiveDistance,
        y: dir.y * effectiveDistance,
        scale: initialScale,
        filter: `blur(${effectiveBlur}px)`,
      });
      gsap.to(el, {
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        filter: 'blur(0px)',
        duration,
        delay,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start, once: true },
      });
    },
    [from, distance, blur, scale, duration, delay, start, isMobile],
  );

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
