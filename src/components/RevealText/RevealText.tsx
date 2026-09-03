import { useRef, type ElementType } from 'react';
import { gsap } from '../../motion/gsap';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import './RevealText.css';

export interface RevealTextProps {
  text: string;
  as?: ElementType;
  className?: string;
  mode?: 'lift' | 'glow';
  scrub?: boolean;
  start?: string;
  stagger?: number;
  delay?: number;
}

export default function RevealText({
  text,
  as = 'span',
  className,
  mode = 'lift',
  scrub = false,
  start = 'top 80%',
  stagger = 0.06,
  delay = 0,
}: RevealTextProps) {
  const rootRef = useRef<HTMLElement | null>(null);
  const words = text.split(' ');
  const Tag = as;
  const isMobile = useMediaQuery('(max-width: 760px)');

  useScrollReveal(
    rootRef,
    (root, reducedMotion) => {
      const innerEls = root.querySelectorAll<HTMLElement>('[data-word-inner]');
      if (innerEls.length === 0) return;

      gsap.set(innerEls, { clearProps: 'transform,opacity,filter' });

      if (reducedMotion) {
        gsap.set(innerEls, { y: 0, opacity: 1, rotateX: 0, filter: 'blur(0px)' });
        return;
      }

      if (mode === 'lift') {
        const y = isMobile ? 26 : 48;
        const rotateX = isMobile ? 0 : 10;
        const blur = isMobile ? 3 : 7;
        const effectiveStagger = isMobile ? Math.min(stagger, 0.05) : stagger;

        gsap.set(innerEls, { y, opacity: 0, rotateX, filter: `blur(${blur}px)` });
        gsap.to(innerEls, {
          y: 0,
          opacity: 1,
          rotateX: 0,
          filter: 'blur(0px)',
          duration: isMobile ? 0.7 : 0.85,
          ease: 'power3.out',
          stagger: effectiveStagger,
          delay,
          scrollTrigger: {
            trigger: root,
            start,
            once: true,
          },
        });
        return;
      }

      gsap.set(innerEls, { opacity: 0.22 });

      if (scrub) {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root,
            start: 'top 85%',
            end: 'bottom 40%',
            scrub: true,
          },
        });
        innerEls.forEach((el, i) => {
          tl.to(el, { opacity: 1, duration: 1, ease: 'none' }, i);
        });
      } else {
        gsap.to(innerEls, {
          opacity: 1,
          duration: 0.7,
          ease: 'power2.out',
          stagger,
          delay,
          scrollTrigger: {
            trigger: root,
            start,
            once: true,
          },
        });
      }
    },
    [mode, scrub, start, stagger, delay, text, isMobile],
  );

  return (
    <Tag ref={rootRef} className={className} aria-label={text}>
      <span aria-hidden="true" className="reveal-text__words">
        {words.map((word, i) => (
          <span className="reveal-text__word" key={`${word}-${i}`}>
            <span className="reveal-text__wordInner" data-word-inner>
              {word}
            </span>
          </span>
        ))}
      </span>
    </Tag>
  );
}
