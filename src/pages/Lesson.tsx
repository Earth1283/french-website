import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
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

export function Lesson() {
  const { slug, lessonId } = useParams<{ slug: string; lessonId: string }>();
  const unit = UNITS.find(u => u.slug === slug);
  const lesson = unit?.lessons.find(l => l.id === lessonId);

  const { earnedBadges: prevBadges, completedLessons } = useProgressStore();
  const completeAction = useProgressStore(s => s.completeLesson);
  // Snapshot badges at mount so handleFinish can diff what's newly earned
  const [earnedBadgesBefore] = useState(() => [...prevBadges]);

  const [phase, setPhase] = useState<Phase>('intro');
  const [cardIndex, setCardIndex] = useState(0);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [newBadges, setNewBadges] = useState<string[]>([]);

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
    if (!completedLessons.includes(lesson.id)) {
      completeAction(lesson.id, lesson.xpReward);
      const { earnedBadges: newAllBadges } = useProgressStore.getState();
      setNewBadges(newAllBadges.filter(b => !earnedBadgesBefore.includes(b)));
    }
    setPhase('complete');
  };

  const handleReplay = () => {
    setPhase('flashcards');
    setCardIndex(0);
    setExerciseIndex(0);
    setCorrectCount(0);
    setNewBadges([]);
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
            />

            <div className="flex items-center justify-between mt-6">
              <Button
                variant="secondary"
                onClick={() => setCardIndex(i => i - 1)}
                disabled={cardIndex === 0}
              >
                <ChevronLeft size={16} /> Prev
              </Button>

              {cardIndex < lesson.vocab.length - 1 ? (
                <Button onClick={() => setCardIndex(i => i + 1)}>
                  Next <ChevronRight size={16} />
                </Button>
              ) : (
                <Button onClick={() => setPhase('exercises')}>
                  Start Exercises <ArrowRight size={16} />
                </Button>
              )}
            </div>
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

              if (ex.type === 'multiple-choice') {
                return (
                  <MultipleChoice
                    key={exerciseIndex}
                    exercise={ex}
                    onCorrect={() => { setCorrectCount(c => c + 1); setTimeout(advance, 600); }}
                    onWrong={() => setTimeout(advance, 1000)}
                  />
                );
              }
              if (ex.type === 'fill-blank') {
                return (
                  <FillInBlank
                    key={exerciseIndex}
                    exercise={ex}
                    onCorrect={() => { setCorrectCount(c => c + 1); setTimeout(advance, 600); }}
                    onWrong={() => setTimeout(advance, 1000)}
                  />
                );
              }
              if (ex.type === 'translation') {
                return (
                  <TranslationChallenge
                    key={exerciseIndex}
                    exercise={ex}
                    onCorrect={() => { setCorrectCount(c => c + 1); setTimeout(advance, 600); }}
                    onWrong={() => setTimeout(advance, 1000)}
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
