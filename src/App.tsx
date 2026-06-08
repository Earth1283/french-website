import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useProgressStore } from './stores/progressStore';
import { Navbar } from './components/layout/Navbar';
import { PageTransition } from './components/layout/PageTransition';
import { Home } from './pages/Home';
import { UnitDetail } from './pages/UnitDetail';
import { Lesson } from './pages/Lesson';
import { Phrasebook } from './pages/Phrasebook';
import { Profile } from './pages/Profile';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition keyProp="/"><Home /></PageTransition>} />
        <Route path="/unit/:slug" element={<PageTransition keyProp="unit"><UnitDetail /></PageTransition>} />
        <Route path="/unit/:slug/lesson/:lessonId" element={<PageTransition keyProp="lesson"><Lesson /></PageTransition>} />
        <Route path="/phrasebook" element={<PageTransition keyProp="phrasebook"><Phrasebook /></PageTransition>} />
        <Route path="/profile" element={<PageTransition keyProp="profile"><Profile /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

function AppContent() {
  const darkMode = useProgressStore(s => s.darkMode);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      <Navbar />
      <main>
        <AnimatedRoutes />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
}
