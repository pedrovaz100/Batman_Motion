import { useScrollTriggerRefresh } from './hooks/useScrollTriggerRefresh';
import Header from './components/Header/Header';
import Hero from './components/Hero/Hero';
import IntroSection from './components/IntroSection/IntroSection';
import CuriositiesSection from './components/CuriositiesSection/CuriositiesSection';
import TimelineSection from './components/TimelineSection/TimelineSection';
import StatementSection from './components/StatementSection/StatementSection';
import LegacySection from './components/LegacySection/LegacySection';
import Footer from './components/Footer/Footer';
import ScrollProgress from './components/ScrollProgress/ScrollProgress';

export default function App() {
  useScrollTriggerRefresh();

  return (
    <>
      <a href="#main-content" className="skip-link">
        Pular para o conteúdo
      </a>
      <ScrollProgress />
      <Header />
      <main id="main-content" tabIndex={-1}>
        <Hero />
        <IntroSection />
        <CuriositiesSection />
        <TimelineSection />
        <StatementSection />
        <LegacySection />
      </main>
      <Footer />
    </>
  );
}
