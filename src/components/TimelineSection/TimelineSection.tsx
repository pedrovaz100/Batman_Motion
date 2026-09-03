import { useRef } from 'react';
import { gsap } from '../../motion/gsap';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import RevealText from '../RevealText/RevealText';
import MotionBlock from '../MotionBlock/MotionBlock';
import './TimelineSection.css';

interface Milestone {
  year: string;
  desc: string;
}

const MILESTONES: Milestone[] = [
  {
    year: '1939 — O início',
    desc: 'A criação do personagem marca o nascimento de um dos ícones mais duradouros dos quadrinhos.',
  },
  {
    year: 'Décadas seguintes — Expansão do universo',
    desc: 'Novos aliados, vilões e histórias ampliam o universo ao redor do Cavaleiro das Trevas.',
  },
  {
    year: 'Anos 1980 — Narrativas mais sombrias',
    desc: 'As histórias em quadrinhos adotam tons mais adultos, complexos e psicológicos.',
  },
  {
    year: 'Anos 1990 — Consolidação nas animações',
    desc: 'Séries animadas apresentam o personagem a uma nova geração de público.',
  },
  {
    year: 'Anos 2000 — Realismo cinematográfico',
    desc: 'O cinema explora uma abordagem mais realista e sombria da mitologia do herói.',
  },
  {
    year: 'Hoje — Um ícone presente em diferentes gerações',
    desc: 'Quadrinhos, filmes, jogos e séries mantêm o símbolo relevante em múltiplas mídias.',
  },
];

export default function TimelineSection() {
  const trackWrapRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);

  useScrollReveal(
    trackWrapRef,
    (wrap, reducedMotion) => {
      const progress = progressRef.current;
      if (!progress) return;

      gsap.set(progress, { clearProps: 'transform' });

      if (reducedMotion) {
        gsap.set(progress, { scaleY: 1 });
        return;
      }

      gsap.set(progress, { scaleY: 0 });
      gsap.to(progress, {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: wrap,
          start: 'top 65%',
          end: 'bottom 65%',
          scrub: true,
        },
      });
    },
    [],
  );

  return (
    <section id="evolucao" className="timeline-section">
      <div className="container">
        <header className="timeline-section__header">
          <p className="section-eyebrow">Linha do tempo</p>
          <RevealText as="h2" text="EVOLUÇÃO DO SÍMBOLO" className="timeline-section__title" />
        </header>

        <div className="timeline" ref={trackWrapRef}>
          <div className="timeline__track" aria-hidden="true">
            <div ref={progressRef} className="timeline__progress" />
          </div>

          <ol className="timeline__list">
            {MILESTONES.map((m, i) => (
              <li className={`timeline-item ${i % 2 === 1 ? 'is-right' : ''}`} key={m.year}>
                <span className="timeline-item__dot" aria-hidden="true" />
                <MotionBlock
                  as="div"
                  className="timeline-item__content"
                  from={i % 2 === 0 ? 'left' : 'right'}
                  distance={60}
                  scale={0.96}
                  blur={6}
                  start="top 88%"
                >
                  <p className="timeline-item__year">{m.year}</p>
                  <p className="timeline-item__desc">{m.desc}</p>
                </MotionBlock>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
