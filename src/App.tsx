import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useProgressStore } from './stores/progressStore';
import { useIdlePreload } from './hooks/useIdlePreload';
import { Navbar } from './components/layout/Navbar';
import { BottomNav } from './components/layout/BottomNav';
import { PageTransition } from './components/layout/PageTransition';
// Landing is the root front door — eager so it paints with no Suspense flash.
import { Landing } from './pages/Landing';

// Import thunks are shared between lazy() and the idle preloader so a
// preloaded chunk is already in the module cache when the route renders.
const loadHome = () => import('./pages/Home');
const loadUnitDetail = () => import('./pages/UnitDetail');
const loadLesson = () => import('./pages/Lesson');
const loadPhrasebook = () => import('./pages/Phrasebook');
const loadProfile = () => import('./pages/Profile');
const loadConversation = () => import('./pages/Conversation');
const loadSettings = () => import('./pages/Settings');
const loadReview = () => import('./pages/Review');
const loadFocus = () => import('./pages/Focus');

const Home = lazy(() => loadHome().then(m => ({ default: m.Home })));
const Focus = lazy(() => loadFocus().then(m => ({ default: m.Focus })));
const UnitDetail = lazy(() => loadUnitDetail().then(m => ({ default: m.UnitDetail })));
const Lesson = lazy(() => loadLesson().then(m => ({ default: m.Lesson })));
const Phrasebook = lazy(() => loadPhrasebook().then(m => ({ default: m.Phrasebook })));
const Profile = lazy(() => loadProfile().then(m => ({ default: m.Profile })));
const Conversation = lazy(() => loadConversation().then(m => ({ default: m.Conversation })));
const Settings = lazy(() => loadSettings().then(m => ({ default: m.Settings })));
const Review = lazy(() => loadReview().then(m => ({ default: m.Review })));

// Likeliest next destinations first (Home/dashboard is the most common first hop
// from the landing front door, so warm it early).
const IDLE_PRELOAD_ORDER = [
  loadHome,
  loadUnitDetail,
  loadLesson,
  loadPhrasebook,
  loadReview,
  loadProfile,
  loadConversation,
  loadSettings,
];

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
    <Suspense fallback={null}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Landing />} />
          <Route path="/learn" element={<PageTransition keyProp="/learn"><Home /></PageTransition>} />
          <Route path="/focus" element={<Focus />} />
          <Route path="/unit/:slug" element={<PageTransition keyProp="unit"><UnitDetail /></PageTransition>} />
          <Route path="/unit/:slug/lesson/:lessonId" element={<PageTransition keyProp="lesson"><Lesson /></PageTransition>} />
          <Route path="/phrasebook" element={<PageTransition keyProp="phrasebook"><Phrasebook /></PageTransition>} />
          <Route path="/converse" element={<PageTransition keyProp="converse"><Conversation /></PageTransition>} />
          <Route path="/profile" element={<PageTransition keyProp="profile"><Profile /></PageTransition>} />
          <Route path="/settings" element={<PageTransition keyProp="settings"><Settings /></PageTransition>} />
          <Route path="/review" element={<PageTransition keyProp="review"><Review /></PageTransition>} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
}

function AppContent() {
  const darkMode = useProgressStore(s => s.darkMode);
  const accentColor = useProgressStore(s => s.accentColor);
  const appleMode = useProgressStore(s => s.appleMode);
  const reducedGpu = useProgressStore(s => s.reducedGpu);
  const { pathname } = useLocation();

  // Ambient full-bleed surfaces hide the app chrome and the padded layout.
  const isAmbient = pathname === '/' || pathname === '/focus';

  // After a few seconds of inactivity, warm the remaining route chunks
  useIdlePreload(IDLE_PRELOAD_ORDER);

  // Dismiss the HTML loading screen once the app shell is mounted
  useEffect(() => {
    (window as unknown as { __bootReady?: () => void }).__bootReady?.();
  }, []);

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
      {!isAmbient && <Navbar />}
      <main className={isAmbient ? '' : reducedGpu ? 'pb-16 sm:pb-0' : 'pb-28 sm:pb-0'}>
        <AnimatedRoutes />
      </main>
      {!isAmbient && <BottomNav />}
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
