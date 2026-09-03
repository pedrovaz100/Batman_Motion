import { useEffect } from 'react';
import { ScrollTrigger } from '../motion/gsap';

export function useScrollTriggerRefresh(): void {
  useEffect(() => {
    let scheduled = false;
    const refresh = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        ScrollTrigger.refresh();
      });
    };

    refresh();

    const resizeObserver = new ResizeObserver(refresh);
    resizeObserver.observe(document.body);

    document.fonts?.ready?.then(refresh).catch(() => {});
    window.addEventListener('load', refresh);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('load', refresh);
    };
  }, []);
}
