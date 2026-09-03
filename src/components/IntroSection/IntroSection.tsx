import { useRef } from 'react';
import { gsap } from '../../motion/gsap';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import RevealText from '../RevealText/RevealText';
import MotionBlock from '../MotionBlock/MotionBlock';
import './IntroSection.css';

export default function IntroSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const bgRef = useRef<HTMLDivElement | null>(null);
  const numberRef = useRef<HTMLSpanElement | null>(null);
  const lineRef = useRef<HTMLSpanElement | null>(null);

  useScrollReveal(
    sectionRef,
    (section, reducedMotion) => {
      const bg = bgRef.current;
      const number = numberRef.current;
      const line = lineRef.current;
      if (!bg || !number || !line) return;

      gsap.set([number, line], { clearProps: 'transform,opacity' });

      if (reducedMotion) {
        gsap.set([number, line], { opacity: 1, scaleX: 1 });
        return;
      }

      gsap.set(number, { opacity: 0, y: 20 });
      gsap.set(line, { scaleX: 0 });

      gsap.to(number, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power2.out',
        scrollTrigger: { trigger: section, start: 'top 80%', once: true },
      });

      gsap.to(line, {
        scaleX: 1,
        duration: 1.1,
        ease: 'power3.out',
        delay: 0.15,
        scrollTrigger: { trigger: section, start: 'top 80%', once: true },
      });

      gsap.to(bg, {
        yPercent: 14,
        ease: 'none',
        scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    },
    [],
  );

  return (
    <section id="historia" ref={sectionRef} className="intro-section">
      <div className="intro-section__bg" ref={bgRef} aria-hidden="true" />
      <div className="intro-section__overlay" aria-hidden="true" />

      <div className="container intro-section__inner">
        <span ref={numberRef} className="intro-section__number" aria-hidden="true">
          01
        </span>

        <div className="intro-section__body">
          <p className="section-eyebrow">Origem</p>

          <RevealText as="h2" text="A SOMBRA DE GOTHAM" className="intro-section__title" delay={0.25} />

          <span ref={lineRef} className="intro-section__line" aria-hidden="true" />

          <MotionBlock as="p" className="intro-section__text" from="up" distance={30} blur={5} delay={0.65}>
            Em uma cidade dominada pelo medo, uma figura transforma a própria escuridão em símbolo
            de esperança. Sem poderes sobre-humanos, ele utiliza inteligência, preparo, estratégia
            e tecnologia para enfrentar o crime.
          </MotionBlock>
        </div>
      </div>
    </section>
  );
}
