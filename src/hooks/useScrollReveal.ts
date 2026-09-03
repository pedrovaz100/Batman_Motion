import { useEffect, type DependencyList, type RefObject } from 'react';
import { gsap } from '../motion/gsap';
import { useReducedMotion } from './useReducedMotion';

export function useScrollReveal<T extends HTMLElement>(
  containerRef: RefObject<T | null>,
  build: (el: T, reducedMotion: boolean) => void,
  deps: DependencyList = [],
): boolean {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ctx = gsap.context(() => build(el, reducedMotion), el);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion, ...deps]);

  return reducedMotion;
}
