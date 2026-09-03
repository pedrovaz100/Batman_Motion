import { useEffect, useMemo, useRef } from 'react';
import type { CSSProperties } from 'react';
import { gsap } from '../../motion/gsap';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import RevealText from '../RevealText/RevealText';
import './StatementSection.css';

export default function StatementSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const bgRef = useRef<HTMLDivElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);
  const isMobile = useMediaQuery('(max-width: 760px)');
  const canHover = useMediaQuery('(pointer: fine)');

  const particles = useMemo(() => {
    const count = isMobile ? 6 : 16;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.round(Math.random() * 100),
      top: Math.round(Math.random() * 100),
      delay: (Math.random() * 6).toFixed(2),
      duration: (7 + Math.random() * 6).toFixed(2),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile]);

  const reducedMotion = useScrollReveal(
    sectionRef,
    (section, reduced) => {
      const bg = bgRef.current;
      if (!bg || reduced) return;

      gsap.to(bg, {
        yPercent: isMobile ? 6 : 16,
        ease: 'none',
        scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    },
    [isMobile],
  );

  useEffect(() => {
    const section = sectionRef.current;
    const glow = glowRef.current;
    if (!section || !glow || !canHover || reducedMotion || isMobile) return;

    const moveX = gsap.quickTo(glow, 'x', { duration: 0.6, ease: 'power3' });
    const moveY = gsap.quickTo(glow, 'y', { duration: 0.6, ease: 'power3' });

    const onMove = (event: PointerEvent) => {
      const rect = section.getBoundingClientRect();
      moveX(event.clientX - rect.left);
      moveY(event.clientY - rect.top);
    };

    section.addEventListener('pointermove', onMove);
    return () => section.removeEventListener('pointermove', onMove);
  }, [canHover, reducedMotion, isMobile]);

  return (
    <section ref={sectionRef} className="statement-section">
      <div className="statement-section__bg" ref={bgRef} aria-hidden="true" />

      {!isMobile && (
        <div className="statement-section__fog" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      )}

      <div className="statement-section__particles" aria-hidden="true">
        {particles.map((p) => (
          <span
            key={p.id}
            className="statement-section__particle"
            style={
              {
                left: `${p.left}%`,
                top: `${p.top}%`,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`,
              } as CSSProperties
            }
          />
        ))}
      </div>

      {canHover && !isMobile && !reducedMotion && (
        <div ref={glowRef} className="statement-section__glow" aria-hidden="true" />
      )}

      <div className="statement-section__vignette" aria-hidden="true" />

      <div className="container statement-section__inner">
        <RevealText
          as="p"
          mode="glow"
          scrub
          text="NÃO É A AUSÊNCIA DE MEDO. É A DECISÃO DE CONTINUAR."
          className="statement-section__text"
        />
      </div>
    </section>
  );
}
