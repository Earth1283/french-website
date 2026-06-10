import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Bookmark } from 'lucide-react';
import { UNITS } from '../data/units';
import { useProgressStore } from '../stores/progressStore';
import { FlashCard } from '../components/lesson/FlashCard';
import { MultipleChoice } from '../components/lesson/MultipleChoice';
import { FillInBlank } from '../components/lesson/FillInBlank';
import { TranslationChallenge } from '../components/lesson/TranslationChallenge';
import { LessonComplete } from '../components/lesson/LessonComplete';
import { ProgressBar } from '../components/layout/ProgressBar';
import { Button } from '../components/ui/Button';

type Phase = 'intro' | 'flashcards' | 'exercises' | 'complete';

function loadSavedProgress(lessonId: string | undefined): { phase: Phase; cardIndex: number; exerciseIndex: number } | null {
  if (!lessonId) return null;
  try {
    const raw = sessionStorage.getItem(`lesson-progress-${lessonId}`);
    return raw ? JSON.parse(raw) : null;
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
  const [earnedBadgesBefore] = useState(() => [...prevBadges]);

  const saved = loadSavedProgress(lessonId);
  const [phase, setPhase] = useState<Phase>(() => saved?.phase ?? 'intro');
  const [cardIndex, setCardIndex] = useState(() => saved?.cardIndex ?? 0);
  const [flipped, setFlipped] = useState(false);
  const [exerciseIndex, setExerciseIndex] = useState(() => saved?.exerciseIndex ?? 0);
  const [keyboardSelect, setKeyboardSelect] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [newBadges, setNewBadges] = useState<string[]>([]);
  const [missedExercises, setMissedExercises] = useState<Array<{ prompt: string; answer: string }>>([]);

  // Persist progress to sessionStorage so back-navigate can resume
  useEffect(() => {
    if (!lessonId || phase === 'intro' || phase === 'complete') {
      sessionStorage.removeItem(`lesson-progress-${lessonId}`);
      return;
    }
    sessionStorage.setItem(`lesson-progress-${lessonId}`, JSON.stringify({ phase, cardIndex, exerciseIndex }));
  }, [lessonId, phase, cardIndex, exerciseIndex]);

  const isBookmarked = lesson ? bookmarkedLessons.includes(lesson.id) : false;

  // Reset keyboard selection when exercise changes
  useEffect(() => {
    setKeyboardSelect(null);
  }, [exerciseIndex]);

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

  if (!unit || !lesson) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-[--text-muted]">Lesson not found.</p>
        <Link to="/" className="text-[--accent] text-sm mt-2 block">← Home</Link>
      </div>
    );
  }

  const nextLessonIndex = unit.lessons.findIndex(l => l.id === lessonId) + 1;
  const nextLesson = nextLessonIndex < unit.lessons.length ? unit.lessons[nextLessonIndex] : undefined;

  const handleFinish = () => {
    sessionStorage.removeItem(`lesson-progress-${lesson.id}`);
    if (!completedLessons.includes(lesson.id)) {
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
    setExerciseIndex(0);
    setCorrectCount(0);
    setNewBadges([]);
    setMissedExercises([]);
  };

  const totalSteps = lesson.vocab.length + lesson.exercises.length;
  const currentStep = phase === 'flashcards' ? cardIndex
    : phase === 'exercises' ? lesson.vocab.length + exerciseIndex
    : phase === 'complete' ? totalSteps : 0;

  if (phase === 'intro') {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center">
        <Link to={`/unit/${slug}`} className="inline-flex items-center gap-1 text-sm text-[--text-muted] hover:text-[--text-primary] mb-8 transition-colors no-underline">
          <ArrowLeft size={14} /> Back to {unit.title}
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          <div className="text-5xl">{unit.emoji}</div>
          <div>
            <h1 className="text-3xl font-bold text-[--text-primary]">{lesson.title}</h1>
            <p className="text-[--text-secondary] mt-2">{lesson.subtitle}</p>
          </div>

          <div className="flex items-center justify-center gap-4 text-sm text-[--text-muted]">
            <span>📖 {lesson.vocab.length} vocab items</span>
            <span>✏️ {lesson.exercises.length} exercises</span>
            <span className="xp-badge">+{lesson.xpReward} XP</span>
          </div>

          <Button size="lg" onClick={() => setPhase('flashcards')} className="w-full max-w-xs mx-auto">
            Let's go! →
          </Button>
        </motion.div>
      </div>
    );
  }

  if (phase === 'complete') {
    return (
      <div className="max-w-xl mx-auto px-4 py-8">
        <LessonComplete
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
    <div className="max-w-xl mx-auto px-4 py-6">
      {/* Top bar */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          to={`/unit/${slug}`}
          className="p-2 rounded-lg text-[--text-muted] hover:text-[--text-primary] hover:bg-[--bg-card-hover] transition-colors"
        >
          <ChevronLeft size={18} />
        </Link>
        <ProgressBar
          value={currentStep}
          max={totalSteps}
          height={8}
          className="flex-1"
          color={unit.color}
        />
        <span className="text-xs text-[--text-muted] whitespace-nowrap">
          {currentStep}/{totalSteps}
        </span>
        <button
          onClick={() => toggleBookmark(lesson.id)}
          className="p-2 rounded-lg transition-colors hover:bg-[--bg-card-hover]"
          aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark lesson'}
          title={isBookmarked ? 'Remove bookmark' : 'Save for later'}
        >
          <Bookmark
            size={16}
            style={{
              fill: isBookmarked ? 'var(--accent)' : 'none',
              color: isBookmarked ? 'var(--accent)' : 'var(--text-muted)',
            }}
          />
        </button>
      </div>

      <AnimatePresence mode="wait">
        {phase === 'flashcards' && (
          <motion.div
            key={`card-${cardIndex}`}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.2 }}
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
            <p className="text-center text-xs text-[--text-muted] mt-3">← → to navigate · Space to flip</p>
          </motion.div>
        )}

        {phase === 'exercises' && (
          <motion.div
            key={`exercise-${exerciseIndex}`}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <p className="text-xs text-center text-[--text-muted] font-semibold uppercase tracking-wider">
              Exercise {exerciseIndex + 1} of {lesson.exercises.length}
            </p>

            {(() => {
              const ex = lesson.exercises[exerciseIndex];
              const advance = () => {
                if (exerciseIndex < lesson.exercises.length - 1) {
                  setExerciseIndex(i => i + 1);
                } else {
                  handleFinish();
                }
              };

              const captureWrong = () => {
                setMissedExercises(prev => [...prev, { prompt: ex.prompt, answer: ex.answer }]);
                setTimeout(advance, 1400);
              };

              if (ex.type === 'multiple-choice') {
                return (
                  <MultipleChoice
                    key={exerciseIndex}
                    exercise={ex}
                    onCorrect={() => { setCorrectCount(c => c + 1); setTimeout(advance, 600); }}
                    onWrong={captureWrong}
                    keyboardSelect={keyboardSelect}
                  />
                );
              }
              if (ex.type === 'fill-blank') {
                return (
                  <FillInBlank
                    key={exerciseIndex}
                    exercise={ex}
                    onCorrect={() => { setCorrectCount(c => c + 1); setTimeout(advance, 600); }}
                    onWrong={captureWrong}
                  />
                );
              }
              if (ex.type === 'translation') {
                return (
                  <TranslationChallenge
                    key={exerciseIndex}
                    exercise={ex}
                    onCorrect={() => { setCorrectCount(c => c + 1); setTimeout(advance, 600); }}
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
