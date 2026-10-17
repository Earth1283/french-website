import { useState, useEffect, lazy, Suspense } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { TAP_TRANSITION, STEP_FORWARD } from '../utils/motion';
import { ArrowRight, ChevronLeft, ChevronRight, Bookmark, BookOpen, Sparkles } from 'lucide-react';
import { UNITS } from '../data/units';
import { getDeepLessonPages } from '../content/deepLessons';
import { hasInteractive } from '../interactive/registry';
import { useProgressStore } from '../stores/progressStore';
import { useLearnerStore } from '../stores/learnerStore';
import { FlashCard } from '../components/lesson/FlashCard';
import { MultipleChoice } from '../components/lesson/MultipleChoice';
import { FillInBlank } from '../components/lesson/FillInBlank';
import { TranslationChallenge } from '../components/lesson/TranslationChallenge';
import { LessonComplete } from '../components/lesson/LessonComplete';
import { DeepLessonReader } from '../components/lesson/DeepLessonReader';
import { ProgressBar } from '../components/layout/ProgressBar';
import { Button } from '../components/ui/Button';

const InteractivePlayer = lazy(() => import('../interactive/InteractivePlayer').then(m => ({ default: m.InteractivePlayer })));

type Phase = 'intro' | 'read' | 'explore' | 'flashcards' | 'exercises' | 'complete';

interface SavedProgress {
  phase: Phase;
  cardIndex: number;
  queuePos: number;
  queue: number[];
  sceneIndex?: number;
}

function loadSavedProgress(lessonId: string | undefined): SavedProgress | null {
  if (!lessonId) return null;
  try {
    const raw = sessionStorage.getItem(`lesson-progress-${lessonId}`);
    const saved = raw ? JSON.parse(raw) : null;
    return saved && Array.isArray(saved.queue) ? saved : null;
  } catch {
    return null;
  }
}

export function Lesson() {
  const { slug, lessonId } = useParams<{ slug: string; lessonId: string }>();
  const unit = UNITS.find(u => u.slug === slug);
  const lesson = unit?.lessons.find(l => l.id === lessonId);

  const { earnedBadges: prevBadges, completedLessons, bookmarkedLessons } = useProgressStore();
  const completeAction = useProgressStore(s => s.completeLesson);
  const toggleBookmark = useProgressStore(s => s.toggleBookmark);
  const recordExercise = useLearnerStore(s => s.recordExercise);
  const [earnedBadgesBefore] = useState(() => [...prevBadges]);

  const saved = loadSavedProgress(lessonId);
  const [phase, setPhase] = useState<Phase>(() => saved?.phase ?? 'intro');
  const [cardIndex, setCardIndex] = useState(() => saved?.cardIndex ?? 0);
  const [flipped, setFlipped] = useState(false);
  const [queue, setQueue] = useState<number[]>(() => saved?.queue ?? lesson?.exercises.map((_, i) => i) ?? []);
  const [queuePos, setQueuePos] = useState(() => saved?.queuePos ?? 0);
  const exerciseIndex = queue[queuePos] ?? 0;
  const firstPassLength = lesson?.exercises.length ?? 0;
  const isRetry = queuePos >= firstPassLength;
  const [sceneIndex, setSceneIndex] = useState(() => saved?.sceneIndex ?? 0);
  const [keyboardSelect, setKeyboardSelect] = useState<number | null>(null);
  const [firstTryCorrect, setFirstTryCorrect] = useState(0);
  const [newBadges, setNewBadges] = useState<string[]>([]);
  const [newlyCompleted, setNewlyCompleted] = useState(false);
  const [missedExercises, setMissedExercises] = useState<Array<{ prompt: string; answer: string; explanation?: string }>>([]);

  // Persist progress to sessionStorage so back-navigate can resume
  useEffect(() => {
    if (!lessonId || phase === 'intro' || phase === 'complete') {
      sessionStorage.removeItem(`lesson-progress-${lessonId}`);
      return;
    }
    sessionStorage.setItem(`lesson-progress-${lessonId}`, JSON.stringify({ phase, cardIndex, queuePos, queue, sceneIndex }));
  }, [lessonId, phase, cardIndex, queuePos, queue, sceneIndex]);

  const isBookmarked = lesson ? bookmarkedLessons.includes(lesson.id) : false;

  // Reset keyboard selection when exercise changes
  useEffect(() => {
    setKeyboardSelect(null);
  }, [queuePos]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!lesson) return;
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if (phase === 'flashcards') {
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          if (cardIndex < lesson.vocab.length - 1) {
            setFlipped(false);
            setCardIndex(i => i + 1);
          } else {
            setFlipped(false);
            setPhase('exercises');
          }
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          if (cardIndex > 0) {
            setFlipped(false);
            setCardIndex(i => i - 1);
          }
        } else if (e.key === ' ' || e.key === 'f') {
          e.preventDefault();
          setFlipped(f => !f);
        }
      }

      if (phase === 'exercises') {
        const ex = lesson.exercises[exerciseIndex];
        if (ex?.type === 'multiple-choice') {
          const n = parseInt(e.key);
          if (!isNaN(n) && n >= 1 && n <= (ex.options?.length ?? 0)) {
            setKeyboardSelect(n - 1);
          }
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [phase, cardIndex, exerciseIndex, lesson]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [phase, queuePos]);

  if (!unit || !lesson) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-muted">Lesson not found.</p>
        <Link to="/learn" className="text-sm mt-2 block" style={{ color: 'var(--accent)' }}>← Home</Link>
      </div>
    );
  }

  const nextLessonIndex = unit.lessons.findIndex(l => l.id === lessonId) + 1;
  const nextLesson = nextLessonIndex < unit.lessons.length ? unit.lessons[nextLessonIndex] : undefined;
  const deepPages = getDeepLessonPages(unit.slug, lesson.id);
  const interactive = hasInteractive(lesson.id);

  const handleFinish = () => {
    sessionStorage.removeItem(`lesson-progress-${lesson.id}`);
    if (!completedLessons.includes(lesson.id)) {
      setNewlyCompleted(true);
      completeAction(lesson.id, lesson.xpReward);
      const { earnedBadges: newAllBadges } = useProgressStore.getState();
      setNewBadges(newAllBadges.filter(b => !earnedBadgesBefore.includes(b)));
    }
    setPhase('complete');
  };

  const handleReplay = () => {
    sessionStorage.removeItem(`lesson-progress-${lesson!.id}`);
    setPhase('flashcards');
    setCardIndex(0);
    setFlipped(false);
    setQueue(lesson!.exercises.map((_, i) => i));
    setQueuePos(0);
    setFirstTryCorrect(0);
    setNewlyCompleted(false);
    setNewBadges([]);
    setMissedExercises([]);
  };

  const totalSteps = lesson.vocab.length + queue.length;
  const currentStep = phase === 'flashcards' ? cardIndex
    : phase === 'exercises' ? lesson.vocab.length + queuePos
    : phase === 'complete' ? totalSteps : 0;

  if (phase === 'intro') {
    return (
      <div className="max-w-xl mx-auto px-4 py-10 text-center">
        <Link
          to={`/unit/${slug}`}
          className="inline-flex items-center gap-0.5 text-[0.95rem] font-medium mb-8 no-underline ios-press"
          style={{ color: 'var(--accent)' }}
        >
          <ChevronLeft size={20} strokeWidth={2.4} className="-ml-1.5" /> {unit.title}
        </Link>

        <div
          className="space-y-6"
        >
          <span
            className="w-20 h-20 mx-auto rounded-[22px] flex items-center justify-center text-5xl"
            style={{
              backgroundColor: `color-mix(in srgb, ${unit.color} 14%, transparent)`,
              border: `0.5px solid color-mix(in srgb, ${unit.color} 22%, transparent)`,
            }}
          >
            {unit.emoji}
          </span>
          <div>
            <h1 className="text-3xl font-bold text-primary">{lesson.title}</h1>
            <p className="text-secondary mt-2">{lesson.subtitle}</p>
          </div>

          <div className="flex items-center justify-center gap-2 flex-wrap">
            {interactive && <span className="chip"><Sparkles size={12} /> Interactive lesson</span>}
            {deepPages && !interactive && <span className="chip"><BookOpen size={12} /> Full lesson available</span>}
            <span className="chip">📖 {lesson.vocab.length} vocab items</span>
            <span className="chip">✏️ {lesson.exercises.length} exercises</span>
            <span className="xp-badge text-sm px-3 py-1.5">+{lesson.xpReward} XP</span>
          </div>

          {interactive || deepPages ? (
            <div className="space-y-3 max-w-xs mx-auto">
              {interactive ? (
                <Button size="lg" onClick={() => setPhase('explore')} className="w-full">
                  Explore Interactively <Sparkles size={16} />
                </Button>
              ) : (
                <Button size="lg" onClick={() => setPhase('read')} className="w-full">
                  Read the Full Lesson <BookOpen size={16} />
                </Button>
              )}
              <button
                onClick={() => setPhase('flashcards')}
                className="text-sm text-muted hover:underline cursor-pointer"
                style={{ background: 'transparent', border: 'none' }}
              >
                Skip straight to practice
              </button>
            </div>
          ) : (
            <Button size="lg" onClick={() => setPhase('flashcards')} className="w-full max-w-xs mx-auto">
              Let's go! <ArrowRight size={17} />
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (phase === 'explore' && interactive) {
    return (
      <div className="max-w-xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Link
            to={`/unit/${slug}`}
            aria-label={`Back to ${unit.title}`}
            className="w-9 h-9 flex items-center justify-center rounded-full ios-press no-underline flex-shrink-0"
            style={{ backgroundColor: 'var(--bg-card)', color: 'var(--accent)', border: '1px solid var(--hairline)', boxShadow: 'var(--shadow-1)' }}
          >
            <ChevronLeft size={20} strokeWidth={2.4} />
          </Link>
          <p className="text-sm font-semibold text-primary flex-1 truncate">{lesson.title}</p>
        </div>
        <Suspense fallback={<div className="min-h-[50vh]" aria-busy="true" />}>
          <InteractivePlayer
            lessonId={lesson.id}
            accentColor={unit.color}
            sceneIndex={sceneIndex}
            onSceneChange={setSceneIndex}
            completeLabel="Start Flashcards"
            onComplete={() => setPhase('flashcards')}
          />
        </Suspense>
      </div>
    );
  }

  if (phase === 'read' && deepPages) {
    return (
      <div className="max-w-xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Link
            to={`/unit/${slug}`}
            aria-label={`Back to ${unit.title}`}
            className="w-9 h-9 flex items-center justify-center rounded-full ios-press no-underline flex-shrink-0"
            style={{ backgroundColor: 'var(--bg-card)', color: 'var(--accent)', border: '1px solid var(--hairline)', boxShadow: 'var(--shadow-1)' }}
          >
            <ChevronLeft size={20} strokeWidth={2.4} />
          </Link>
          <p className="text-sm font-semibold text-primary flex-1 truncate">{lesson.title}</p>
        </div>
        <DeepLessonReader
          pages={deepPages}
          accentColor={unit.color}
          completeLabel="Start Flashcards"
          onComplete={() => setPhase('flashcards')}
        />
      </div>
    );
  }

  if (phase === 'complete') {
    return (
      <div className="max-w-xl mx-auto px-4 py-8">
        <LessonComplete
          vocab={lesson.vocab}
          firstTryCorrect={firstTryCorrect}
          exerciseCount={lesson.exercises.length}
          alreadyCompleted={!newlyCompleted}
          xpEarned={lesson.xpReward}
          newBadges={newBadges}
          unitSlug={slug!}
          nextLessonId={nextLesson?.id}
          onReplay={handleReplay}
          missedItems={missedExercises}
        />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6 relative">
      {/* Top bar */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          to={`/unit/${slug}`}
          aria-label={`Back to ${unit.title}`}
          className="w-9 h-9 flex items-center justify-center rounded-full ios-press no-underline flex-shrink-0"
          style={{ backgroundColor: 'var(--bg-card)', color: 'var(--accent)', border: '1px solid var(--hairline)', boxShadow: 'var(--shadow-1)' }}
        >
          <ChevronLeft size={20} strokeWidth={2.4} />
        </Link>
        <ProgressBar
          value={currentStep}
          max={totalSteps}
          height={8}
          className="flex-1"
          color={unit.color}
        />
        <span className="text-xs text-muted whitespace-nowrap font-medium">
          {currentStep}/{totalSteps}
        </span>
        <motion.button
          whileTap={{ scale: 0.97 }}
          transition={TAP_TRANSITION}
          onClick={() => toggleBookmark(lesson.id)}
          className="w-9 h-9 flex items-center justify-center rounded-full cursor-pointer flex-shrink-0"
          style={{
            backgroundColor: isBookmarked ? 'var(--accent-tint)' : 'var(--bg-card)',
            border: '1px solid var(--hairline)',
            boxShadow: 'var(--shadow-1)',
          }}
          aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark lesson'}
          title={isBookmarked ? 'Remove bookmark' : 'Save for later'}
        >
          <Bookmark
            size={15}
            style={{
              fill: isBookmarked ? 'var(--accent)' : 'none',
              color: isBookmarked ? 'var(--accent)' : 'var(--text-muted)',
            }}
          />
        </motion.button>
      </div>

      <AnimatePresence mode="popLayout">
        {phase === 'flashcards' && (
          <motion.div
            key={`card-${cardIndex}`}
            {...STEP_FORWARD}
          >
            <FlashCard
              item={lesson.vocab[cardIndex]}
              index={cardIndex}
              total={lesson.vocab.length}
              flipped={flipped}
              onFlipToggle={() => setFlipped(f => !f)}
            />

            <div className="flex items-center justify-between mt-6">
              <Button
                variant="secondary"
                onClick={() => { setFlipped(false); setCardIndex(i => i - 1); }}
                disabled={cardIndex === 0}
              >
                <ChevronLeft size={16} /> Prev
              </Button>

              {cardIndex < lesson.vocab.length - 1 ? (
                <Button onClick={() => { setFlipped(false); setCardIndex(i => i + 1); }}>
                  Next <ChevronRight size={16} />
                </Button>
              ) : (
                <Button onClick={() => { setFlipped(false); setPhase('exercises'); }}>
                  Start Exercises <ArrowRight size={16} />
                </Button>
              )}
            </div>
            <p className="text-center text-xs text-muted mt-3">← → to navigate · Space to flip</p>
          </motion.div>
        )}

        {phase === 'exercises' && (
          <motion.div
            key={`exercise-${queuePos}`}
            {...STEP_FORWARD}
            className="space-y-4"
          >
            {isRetry ? (
              <div className="text-center space-y-1">
                <p className="text-xs text-muted font-semibold uppercase tracking-wider">
                  Second look · {queuePos - firstPassLength + 1} of {queue.length - firstPassLength}
                </p>
                <p className="text-xs text-muted">You missed this one earlier. Recalling it now is what makes it stick.</p>
              </div>
            ) : (
              <p className="text-xs text-center text-muted font-semibold uppercase tracking-wider">
                Exercise {queuePos + 1} of {firstPassLength}
              </p>
            )}

            {(() => {
              const ex = lesson.exercises[exerciseIndex];
              const advance = (requeue: boolean) => {
                const length = queue.length + (requeue ? 1 : 0);
                if (requeue) setQueue(q => [...q, exerciseIndex]);
                if (queuePos < length - 1) setQueuePos(p => p + 1);
                else handleFinish();
              };

              const captureCorrect = () => {
                if (!isRetry) {
                  recordExercise(lesson.id, exerciseIndex, true);
                  setFirstTryCorrect(c => c + 1);
                }
                advance(false);
              };

              const captureWrong = () => {
                if (!isRetry) {
                  recordExercise(lesson.id, exerciseIndex, false);
                  setMissedExercises(prev => [...prev, { prompt: ex.prompt, answer: ex.answer, explanation: ex.explanation }]);
                }
                advance(!isRetry);
              };

              if (ex.type === 'multiple-choice') {
                return (
                  <MultipleChoice
                    key={queuePos}
                    exercise={ex}
                    teach
                    onCorrect={captureCorrect}
                    onWrong={captureWrong}
                    keyboardSelect={keyboardSelect}
                  />
                );
              }
              if (ex.type === 'fill-blank') {
                return (
                  <FillInBlank
                    key={queuePos}
                    exercise={ex}
                    teach
                    onCorrect={captureCorrect}
                    onWrong={captureWrong}
                  />
                );
              }
              if (ex.type === 'translation') {
                return (
                  <TranslationChallenge
                    key={queuePos}
                    exercise={ex}
                    teach
                    speech
                    onCorrect={captureCorrect}
                    onWrong={captureWrong}
                  />
                );
              }
              return null;
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
