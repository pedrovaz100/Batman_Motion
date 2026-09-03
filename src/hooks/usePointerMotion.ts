import { useEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';

interface UsePointerMotionOptions {
  duration?: number;
  ease?: string;
  onUpdate?: () => void;
}

export interface PointerMotion {
  smoothed: { x: number; y: number };
  setTarget: (x: number, y: number) => void;
  jumpTo: (x: number, y: number) => void;
}

export function usePointerMotion({
  duration = 0.5,
  ease = 'power3',
  onUpdate,
}: UsePointerMotionOptions = {}): PointerMotion {
  const smoothed = useRef({ x: 0, y: 0 }).current;
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  const setters = useMemo(() => {
    const xTo = gsap.quickTo(smoothed, 'x', {
      duration,
      ease,
      onUpdate: () => onUpdateRef.current?.(),
    });
    const yTo = gsap.quickTo(smoothed, 'y', { duration, ease });
    return { xTo, yTo };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration, ease]);

  useEffect(
    () => () => {
      gsap.killTweensOf(smoothed);
    },
    [smoothed],
  );

  const setTarget = (x: number, y: number) => {
    setters.xTo(x);
    setters.yTo(y);
  };

  const jumpTo = (x: number, y: number) => {
    gsap.set(smoothed, { x, y });
    setters.xTo(x);
    setters.yTo(y);
    onUpdateRef.current?.();
  };

  return { smoothed, setTarget, jumpTo };
}
