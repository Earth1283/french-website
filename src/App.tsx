import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useProgressStore } from './stores/progressStore';
import { useIdlePreload } from './hooks/useIdlePreload';
import { AppBar } from './components/layout/AppBar';
import { TabBar } from './components/layout/TabBar';
import { PageTransition, TransitionDirectionProvider, useTransitionDirection } from './components/layout/PageTransition';
import { isLessonRoute } from './components/layout/navigation';
import { ErrorBoundary } from './components/ErrorBoundary';
// Landing is the root front door — eager so it paints with no Suspense flash.
import { Landing } from './pages/Landing';

// Import thunks are shared between lazy() and the idle preloader so a
// preloaded chunk is already in the module cache when the route renders.
const loadHome = () => import('./pages/Home');
const loadPractice = () => import('./pages/Practice');
const loadUnitDetail = () => import('./pages/UnitDetail');
const loadLesson = () => import('./pages/Lesson');
const loadPhrasebook = () => import('./pages/Phrasebook');
const loadProfile = () => import('./pages/Profile');
const loadConversation = () => import('./pages/Conversation');
const loadSettings = () => import('./pages/Settings');
const loadReview = () => import('./pages/Review');
const loadFocus = () => import('./pages/Focus');
const loadAdaptiveTest = () => import('./pages/AdaptiveTest');
const loadClassroomConnect = () => import('./pages/classroom/Connect');
const loadClassroomAuth = () => import('./pages/classroom/Auth');
const loadClassesHome = () => import('./pages/classroom/ClassesHome');
const loadClassDetail = () => import('./pages/classroom/ClassDetail');
const loadContentEditor = () => import('./pages/classroom/ContentEditor');
const loadContentLibrary = () => import('./pages/classroom/ContentLibrary');
const loadAccountSettings = () => import('./pages/classroom/AccountSettings');
const loadAssignment = () => import('./pages/classroom/Assignment');
const loadAssignmentResults = () => import('./pages/classroom/AssignmentResults');

const Home = lazy(() => loadHome().then(m => ({ default: m.Home })));
const Practice = lazy(() => loadPractice().then(m => ({ default: m.Practice })));
const Focus = lazy(() => loadFocus().then(m => ({ default: m.Focus })));
const UnitDetail = lazy(() => loadUnitDetail().then(m => ({ default: m.UnitDetail })));
const Lesson = lazy(() => loadLesson().then(m => ({ default: m.Lesson })));
const Phrasebook = lazy(() => loadPhrasebook().then(m => ({ default: m.Phrasebook })));
const Profile = lazy(() => loadProfile().then(m => ({ default: m.Profile })));
const Conversation = lazy(() => loadConversation().then(m => ({ default: m.Conversation })));
const Settings = lazy(() => loadSettings().then(m => ({ default: m.Settings })));
const Review = lazy(() => loadReview().then(m => ({ default: m.Review })));
const AdaptiveTest = lazy(() => loadAdaptiveTest().then(m => ({ default: m.AdaptiveTest })));
const Connect = lazy(() => loadClassroomConnect().then(m => ({ default: m.Connect })));
const ClassroomAuth = lazy(() => loadClassroomAuth().then(m => ({ default: m.ClassroomAuth })));
const ClassesHome = lazy(() => loadClassesHome().then(m => ({ default: m.ClassesHome })));
const ClassDetail = lazy(() => loadClassDetail().then(m => ({ default: m.ClassDetail })));
const ContentEditor = lazy(() => loadContentEditor().then(m => ({ default: m.ContentEditor })));
const ContentLibrary = lazy(() => loadContentLibrary().then(m => ({ default: m.ContentLibrary })));
const AccountSettings = lazy(() => loadAccountSettings().then(m => ({ default: m.AccountSettings })));
const Assignment = lazy(() => loadAssignment().then(m => ({ default: m.Assignment })));
const AssignmentResults = lazy(() => loadAssignmentResults().then(m => ({ default: m.AssignmentResults })));

// Likeliest next destinations first (Home/dashboard is the most common first hop
// from the landing front door, so warm it early).
const IDLE_PRELOAD_ORDER = [
  loadHome,
  loadPractice,
  loadUnitDetail,
  loadLesson,
  loadPhrasebook,
  loadReview,
  loadProfile,
  loadConversation,
  loadAdaptiveTest,
  loadSettings,
  loadClassesHome,
];

// Full-bleed ambient pages (Landing "/", Focus "/focus") are rendered OUTSIDE
// the AnimatePresence `mode="wait"` transition system. They don't use the iOS
// push/pop slide, and keeping them out avoids a wait-deadlock where navigating
// away mid-transition could leave the outgoing full-screen page (and its fixed
// backdrop) stuck over the next route. Each ambient page handles its own
// entrance animation internally.
function AmbientRoutes() {
  return (
    <ErrorBoundary>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/focus" element={<Focus />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  const direction = useTransitionDirection(location.pathname);
  return (
    <ErrorBoundary>
      <Suspense fallback={null}>
        <TransitionDirectionProvider value={direction}>
          <AnimatePresence mode="wait" custom={direction}>
            <Routes location={location} key={location.pathname}>
              <Route path="/learn" element={<PageTransition><Home /></PageTransition>} />
              <Route path="/practice" element={<PageTransition><Practice /></PageTransition>} />
              <Route path="/unit/:slug" element={<PageTransition><UnitDetail /></PageTransition>} />
              <Route path="/unit/:slug/lesson/:lessonId" element={<PageTransition><Lesson /></PageTransition>} />
              <Route path="/phrasebook" element={<PageTransition><Phrasebook /></PageTransition>} />
              <Route path="/converse" element={<PageTransition><Conversation /></PageTransition>} />
              <Route path="/test" element={<PageTransition><AdaptiveTest /></PageTransition>} />
              <Route path="/classes/connect" element={<PageTransition><Connect /></PageTransition>} />
              <Route path="/classes/auth" element={<PageTransition><ClassroomAuth /></PageTransition>} />
              <Route path="/classes/account" element={<PageTransition><AccountSettings /></PageTransition>} />
              <Route path="/classes/content" element={<PageTransition><ContentLibrary /></PageTransition>} />
              <Route path="/classes/content/new" element={<PageTransition><ContentEditor /></PageTransition>} />
              <Route path="/classes/content/:contentId/edit" element={<PageTransition><ContentEditor /></PageTransition>} />
              <Route path="/classes/assignment/:assignmentId" element={<PageTransition><Assignment /></PageTransition>} />
              <Route path="/classes/:classId/assignments/:assignmentId/results" element={<PageTransition><AssignmentResults /></PageTransition>} />
              <Route path="/classes/:classId" element={<PageTransition><ClassDetail /></PageTransition>} />
              <Route path="/classes" element={<PageTransition><ClassesHome /></PageTransition>} />
              <Route path="/profile" element={<PageTransition><Profile /></PageTransition>} />
              <Route path="/settings" element={<PageTransition><Settings /></PageTransition>} />
              <Route path="/review" element={<PageTransition><Review /></PageTransition>} />
            </Routes>
          </AnimatePresence>
        </TransitionDirectionProvider>
      </Suspense>
    </ErrorBoundary>
  );
}

function AppContent() {
  const darkMode = useProgressStore(s => s.darkMode);
  const { pathname } = useLocation();

  const isAmbient = pathname === '/' || pathname === '/focus';
  const isLesson = isLessonRoute(pathname);

  useIdlePreload(IDLE_PRELOAD_ORDER);

  useEffect(() => {
    (window as unknown as { __bootReady?: () => void }).__bootReady?.();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  if (isAmbient) {
    return (
      <div className="min-h-screen bg-paper">
        <AmbientRoutes />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      {!isLesson && <AppBar />}
      <main className={isLesson ? undefined : 'pb-[calc(62px+env(safe-area-inset-bottom))] md:pb-0'}>
        <AnimatedRoutes />
      </main>
      {!isLesson && <TabBar />}
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
