import { useEffect, useRef } from 'react';
import { gsap } from '../../motion/gsap';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import RevealText from '../RevealText/RevealText';
import MotionBlock from '../MotionBlock/MotionBlock';
import StaggerGroup from '../StaggerGroup/StaggerGroup';
import './CuriositiesSection.css';

interface Curiosity {
  title: string;
  text: string;
}

const CARDS: Curiosity[] = [
  {
    title: '1939 — A primeira aparição',
    text: 'O personagem apareceu pela primeira vez em Detective Comics #27, publicado em 1939.',
  },
  {
    title: 'Um herói sem superpoderes',
    text: 'Sua força está no treinamento, na inteligência investigativa, na estratégia e na tecnologia.',
  },
  {
    title: 'A cidade como personagem',
    text: 'Gotham não funciona apenas como cenário. Sua arquitetura, criminalidade e atmosfera influenciam diretamente as histórias.',
  },
  {
    title: 'O sinal no céu',
    text: 'O sinal luminoso representa um pedido de ajuda e também funciona como aviso para aqueles que ameaçam a cidade.',
  },
  {
    title: 'Tecnologia e investigação',
    text: 'Equipamentos, veículos e ferramentas de análise são utilizados para investigar crimes e superar adversários.',
  },
  {
    title: 'A base subterrânea',
    text: 'A caverna funciona como centro de operações, laboratório, arquivo e espaço de preparação.',
  },
];

function CuriosityCard({ title, text, index }: Curiosity & { index: number }) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const reducedMotion = useReducedMotion();
  const isCoarsePointer = useMediaQuery('(pointer: coarse)');

  useEffect(() => {
    const card = cardRef.current;
    if (!card || reducedMotion || isCoarsePointer) return;

    gsap.set(card, { transformPerspective: 900 });
    const rotateX = gsap.quickTo(card, 'rotationX', { duration: 0.45, ease: 'power3' });
    const rotateY = gsap.quickTo(card, 'rotationY', { duration: 0.45, ease: 'power3' });

    const onMove = (event: PointerEvent) => {
      const rect = card.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;
      card.style.setProperty('--mx', `${px * 100}%`);
      card.style.setProperty('--my', `${py * 100}%`);
      rotateY((px - 0.5) * 8);
      rotateX(-(py - 0.5) * 8);
    };
    const onLeave = () => {
      rotateX(0);
      rotateY(0);
    };

    card.addEventListener('pointermove', onMove);
    card.addEventListener('pointerleave', onLeave);
    return () => {
      card.removeEventListener('pointermove', onMove);
      card.removeEventListener('pointerleave', onLeave);
    };
  }, [reducedMotion, isCoarsePointer]);

  useEffect(() => {
    const card = cardRef.current;
    if (!card || reducedMotion) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          card.classList.add('is-revealed');
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(card);
    return () => observer.disconnect();
  }, [reducedMotion]);

  return (
    <div className="curiosity-card" ref={cardRef}>
      <div className="curiosity-card__glow" aria-hidden="true" />
      <div className="curiosity-card__content">
        <span className="curiosity-card__index" aria-hidden="true">
          {String(index + 1).padStart(2, '0')}
        </span>
        <h3 className="curiosity-card__title">{title}</h3>
        <p className="curiosity-card__text">{text}</p>
      </div>
    </div>
  );
}

export default function CuriositiesSection() {
  return (
    <section id="curiosidades" className="curiosities-section">
      <div className="container">
        <header className="curiosities-section__header">
          <p className="section-eyebrow">Registros</p>
          <RevealText as="h2" text="ARQUIVOS DA CAVERNA" className="curiosities-section__title" />
          <MotionBlock as="p" className="curiosities-section__subtitle" distance={30} blur={5} delay={0.25}>
            Informações e curiosidades por trás do símbolo.
          </MotionBlock>
        </header>

        <StaggerGroup as="div" className="curiosities-grid" start="top 90%">
          {CARDS.map((card, i) => (
            <CuriosityCard key={card.title} index={i} {...card} />
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
