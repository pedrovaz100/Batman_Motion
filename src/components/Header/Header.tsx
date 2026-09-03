import { useCallback, useEffect, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { gsap } from '../../motion/gsap';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import BatIcon from '../icons/BatIcon';
import './Header.css';

interface NavLink {
  id: string;
  label: string;
}

const NAV_LINKS: NavLink[] = [
  { id: 'hero', label: 'Início' },
  { id: 'historia', label: 'História' },
  { id: 'curiosidades', label: 'Curiosidades' },
  { id: 'legado', label: 'Legado' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeId, setActiveId] = useState('hero');
  const reducedMotion = useReducedMotion();

  const panelRef = useRef<HTMLDivElement | null>(null);
  const firstLinkRef = useRef<HTMLAnchorElement | null>(null);
  const toggleRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const sections = NAV_LINKS.map((link) => document.getElementById(link.id)).filter(
      (el): el is HTMLElement => Boolean(el),
    );
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const scrollToId = useCallback(
    (id: string) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    },
    [reducedMotion],
  );

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    toggleRef.current?.focus();
  }, []);

  const handleNavClick = useCallback(
    (event: ReactMouseEvent<HTMLAnchorElement>, id: string) => {
      event.preventDefault();
      scrollToId(id);
      if (menuOpen) setMenuOpen(false);
    },
    [scrollToId, menuOpen],
  );

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    if (menuOpen) {
      panel.style.display = 'flex';
      if (reducedMotion) {
        gsap.set(panel, { autoAlpha: 1, y: 0 });
      } else {
        gsap.fromTo(
          panel,
          { autoAlpha: 0, y: -12 },
          { autoAlpha: 1, y: 0, duration: 0.35, ease: 'power2.out' },
        );
        const items = panel.querySelectorAll('[data-menu-item]');
        gsap.fromTo(
          items,
          { autoAlpha: 0, y: 10 },
          { autoAlpha: 1, y: 0, duration: 0.35, ease: 'power2.out', stagger: 0.06, delay: 0.05 },
        );
      }
      document.body.style.overflow = 'hidden';
      firstLinkRef.current?.focus();
    } else {
      document.body.style.overflow = '';
      if (panel.style.display === 'flex') {
        if (reducedMotion) {
          panel.style.display = 'none';
        } else {
          gsap.to(panel, {
            autoAlpha: 0,
            y: -12,
            duration: 0.25,
            ease: 'power1.in',
            onComplete: () => {
              panel.style.display = 'none';
            },
          });
        }
      }
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen, reducedMotion]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMenu();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [menuOpen, closeMenu]);

  return (
    <header className={`site-header ${scrolled ? 'site-header--scrolled' : ''}`}>
      <div className="site-header__bar container">
        <a
          href="#hero"
          className="site-header__brand"
          onClick={(e) => handleNavClick(e, 'hero')}
          aria-label="Gotham City — voltar ao início"
        >
          <BatIcon className="site-header__brandIcon" />
          <span className="site-header__brandLabel">GOTHAM CITY</span>
        </a>

        <nav className="site-header__nav" aria-label="Navegação principal">
          {NAV_LINKS.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className={`site-header__link ${activeId === link.id ? 'is-active' : ''}`}
              onClick={(e) => handleNavClick(e, link.id)}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="site-header__actions">
          <a
            href="#historia"
            className="site-header__cta"
            onClick={(e) => handleNavClick(e, 'historia')}
          >
            Explorar
          </a>

          <button
            ref={toggleRef}
            type="button"
            className={`site-header__burger ${menuOpen ? 'is-open' : ''}`}
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-panel"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      <div
        id="mobile-nav-panel"
        ref={panelRef}
        className="site-header__panel"
        style={{ display: 'none' }}
      >
        {NAV_LINKS.map((link, i) => (
          <a
            key={link.id}
            href={`#${link.id}`}
            ref={i === 0 ? firstLinkRef : undefined}
            data-menu-item
            className="site-header__panelLink"
            onClick={(e) => handleNavClick(e, link.id)}
          >
            {link.label}
          </a>
        ))}
        <a
          href="#historia"
          data-menu-item
          className="site-header__panelLink site-header__panelLink--cta"
          onClick={(e) => handleNavClick(e, 'historia')}
        >
          Explorar
        </a>
      </div>
    </header>
  );
}
