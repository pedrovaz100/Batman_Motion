import { useCallback } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import BatIcon from '../icons/BatIcon';
import MotionBlock from '../MotionBlock/MotionBlock';
import './Footer.css';

const FOOTER_LINKS = [
  { id: 'hero', label: 'Início' },
  { id: 'historia', label: 'História' },
  { id: 'curiosidades', label: 'Curiosidades' },
  { id: 'evolucao', label: 'Evolução' },
  { id: 'legado', label: 'Legado' },
];

export default function Footer() {
  const reducedMotion = useReducedMotion();
  const year = new Date().getFullYear();

  const scrollToId = useCallback(
    (event: ReactMouseEvent<HTMLAnchorElement>, id: string) => {
      event.preventDefault();
      const el = document.getElementById(id);
      el?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    },
    [reducedMotion],
  );

  const scrollToTop = useCallback(
    (event: ReactMouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
    },
    [reducedMotion],
  );

  return (
    <MotionBlock as="footer" className="site-footer" from="up" distance={20} blur={4}>
      <div className="container site-footer__inner">
        <div className="site-footer__top">
          <a
            href="#hero"
            className="site-footer__brand"
            onClick={(e) => scrollToId(e, 'hero')}
            aria-label="Gotham City — voltar ao início"
          >
            <BatIcon className="site-footer__brandIcon" />
            <span>
              GOTHAM CITY
              <small>Become the Shadow</small>
            </span>
          </a>

          <button type="button" className="site-footer__top-btn" onClick={scrollToTop}>
            Voltar ao topo
          </button>
        </div>

        <nav className="site-footer__nav" aria-label="Links do rodapé">
          {FOOTER_LINKS.map((link) => (
            <a key={link.id} href={`#${link.id}`} onClick={(e) => scrollToId(e, link.id)}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="site-footer__meta">
          <p className="site-footer__credits">
            Projeto acadêmico experimental de motion design e desenvolvimento frontend.
          </p>
          <p className="site-footer__disclaimer">
            Projeto acadêmico e experimental, desenvolvido sem finalidade comercial. Personagens,
            nomes e elementos relacionados pertencem aos seus respectivos detentores de direitos.
          </p>
          <p className="site-footer__copy">
            © {year} Gotham City — Become the Shadow.
          </p>
        </div>
      </div>
    </MotionBlock>
  );
}
