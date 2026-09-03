import { useRef } from 'react';
import { gsap } from '../../motion/gsap';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import RevealText from '../RevealText/RevealText';
import MotionBlock from '../MotionBlock/MotionBlock';
import './LegacySection.css';

const WORDS = [
  { text: 'JUSTIÇA', speed: 0.18 },
  { text: 'MEDO', speed: -0.24 },
  { text: 'ESPERANÇA', speed: 0.14 },
];

export default function LegacySection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const wordsWrapRef = useRef<HTMLUListElement | null>(null);
  const isMobile = useMediaQuery('(max-width: 760px)');

  useScrollReveal(
    sectionRef,
    (section, reducedMotion) => {
      const wrap = wordsWrapRef.current;
      if (!wrap || reducedMotion) return;

      const items = wrap.querySelectorAll<HTMLElement>('[data-legacy-word]');
      const speedScale = isMobile ? 0.6 : 1;

      items.forEach((el, i) => {
        const speed = (WORDS[i]?.speed ?? 0.15) * speedScale;
        gsap.to(el, {
          yPercent: speed * 100,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });
      });
    },
    [isMobile],
  );

  return (
    <section id="legado" ref={sectionRef} className="legacy-section">
      <div className="container legacy-section__intro">
        <p className="section-eyebrow">Legado</p>
        <RevealText as="h2" text="ALÉM DA MÁSCARA" className="legacy-section__title" />
        <MotionBlock as="p" className="legacy-section__text" distance={30} blur={5} delay={0.3}>
          Ao longo das décadas, o Cavaleiro das Trevas tornou-se um dos maiores símbolos da
          cultura popular. Suas histórias exploram justiça, medo, identidade, escolhas e os
          limites entre vingança e esperança.
        </MotionBlock>
      </div>

      <ul className="legacy-words" ref={wordsWrapRef}>
        {WORDS.map((word, i) => (
          <li
            key={word.text}
            data-legacy-word
            className={`legacy-word legacy-word--${i + 1}`}
          >
            {word.text}
          </li>
        ))}
      </ul>
    </section>
  );
}
