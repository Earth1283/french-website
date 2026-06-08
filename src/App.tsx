import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useProgressStore } from './stores/progressStore';
import { Navbar } from './components/layout/Navbar';
import { BottomNav } from './components/layout/BottomNav';
import { PageTransition } from './components/layout/PageTransition';
import { Home } from './pages/Home';
import { UnitDetail } from './pages/UnitDetail';
import { Lesson } from './pages/Lesson';
import { Phrasebook } from './pages/Phrasebook';
import { Profile } from './pages/Profile';
import { Conversation } from './pages/Conversation';
import { Settings } from './pages/Settings';

const ACCENT_HOVER: Record<string, string> = {
  '#E63946': '#cc2f3b',
  '#3B82F6': '#2563eb',
  '#8B5CF6': '#7c3aed',
  '#F59E0B': '#d97706',
  '#EC4899': '#db2777',
  '#0EA5E9': '#0284c7',
};

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition keyProp="/"><Home /></PageTransition>} />
        <Route path="/unit/:slug" element={<PageTransition keyProp="unit"><UnitDetail /></PageTransition>} />
        <Route path="/unit/:slug/lesson/:lessonId" element={<PageTransition keyProp="lesson"><Lesson /></PageTransition>} />
        <Route path="/phrasebook" element={<PageTransition keyProp="phrasebook"><Phrasebook /></PageTransition>} />
        <Route path="/converse" element={<PageTransition keyProp="converse"><Conversation /></PageTransition>} />
        <Route path="/profile" element={<PageTransition keyProp="profile"><Profile /></PageTransition>} />
        <Route path="/settings" element={<PageTransition keyProp="settings"><Settings /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

function AppContent() {
  const darkMode = useProgressStore(s => s.darkMode);
  const accentColor = useProgressStore(s => s.accentColor);
  const appleMode = useProgressStore(s => s.appleMode);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', accentColor);
    document.documentElement.style.setProperty('--accent-hover', ACCENT_HOVER[accentColor] ?? accentColor);
  }, [accentColor]);

  useEffect(() => {
    document.documentElement.classList.toggle('apple-mode', appleMode);
  }, [appleMode]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      <Navbar />
      <main className={appleMode ? 'pb-28 sm:pb-0' : 'pb-16 sm:pb-0'}>
        <AnimatedRoutes />
      </main>
      <BottomNav />
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
