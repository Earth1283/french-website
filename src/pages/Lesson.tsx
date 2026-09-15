import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { UNITS } from '../data/units';
import { lineFor, lineStyle } from '../data/lines';
import { getDeepLessonPages } from '../content/deepLessons';
import { useProgressStore } from '../stores/progressStore';
import { FlashCard } from '../components/lesson/FlashCard';
import { MultipleChoice } from '../components/lesson/MultipleChoice';
import { FillInBlank } from '../components/lesson/FillInBlank';
import { TranslationChallenge } from '../components/lesson/TranslationChallenge';
import { LessonComplete } from '../components/lesson/LessonComplete';
import { DeepLessonReader } from '../components/lesson/DeepLessonReader';
import { LessonBar } from '../components/lesson/LessonBar';
import { LessonIntro } from '../components/lesson/LessonIntro';
import { Button, ButtonLink } from '../components/ui/Button';
import { KeyCap } from '../components/ui/Signage';
import { OhNon } from '../components/ui/Feedback';

type Phase = 'intro' | 'read' | 'flashcards' | 'exercises' | 'complete';

interface SavedProgress {
  phase: Phase;
  cardIndex: number;
  exerciseIndex: number;
  pageIndex?: number;
}

const CORRECT_ADVANCE_MS = 600;
const WRONG_ADVANCE_MS = 1400;

const progressKey = (lessonId: string | undefined) => `lesson-progress-${lessonId}`;

function loadSavedProgress(lessonId: string | undefined): SavedProgress | null {
  if (!lessonId) return null;
  try {
    const raw = sessionStorage.getItem(progressKey(lessonId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function Lesson() {
  const { slug, lessonId } = useParams<{ slug: string; lessonId: string }>();
  const unit = UNITS.find(candidate => candidate.slug === slug);
  const lesson = unit?.lessons.find(candidate => candidate.id === lessonId);

  const earnedBadges = useProgressStore(s => s.earnedBadges);
  const completedLessons = useProgressStore(s => s.completedLessons);
  const completeLesson = useProgressStore(s => s.completeLesson);
  const [earnedBadgesBefore] = useState(() => [...earnedBadges]);

  const [saved] = useState(() => loadSavedProgress(lessonId));
  const [phase, setPhase] = useState<Phase>(saved?.phase ?? 'intro');
  const [cardIndex, setCardIndex] = useState(saved?.cardIndex ?? 0);
  const [pageIndex, setPageIndex] = useState(saved?.pageIndex ?? 0);
  const [flipped, setFlipped] = useState(false);
  const [exerciseIndex, setExerciseIndex] = useState(saved?.exerciseIndex ?? 0);
  const [keyboardSelect, setKeyboardSelect] = useState<number | null>(null);
  const [newBadges, setNewBadges] = useState<string[]>([]);
  const [missedExercises, setMissedExercises] = useState<Array<{ prompt: string; answer: string }>>([]);

  useEffect(() => {
    if (!lessonId || phase === 'intro' || phase === 'complete') {
      sessionStorage.removeItem(progressKey(lessonId));
      return;
    }
    sessionStorage.setItem(progressKey(lessonId), JSON.stringify({ phase, cardIndex, exerciseIndex, pageIndex }));
  }, [lessonId, phase, cardIndex, exerciseIndex, pageIndex]);

  useEffect(() => {
    setKeyboardSelect(null);
  }, [exerciseIndex]);

  useEffect(() => {
    if (!lesson) return;
    const handleKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if (phase === 'flashcards') {
        if (event.key === 'ArrowRight') {
          event.preventDefault();
          setFlipped(false);
          if (cardIndex < lesson.vocab.length - 1) setCardIndex(index => index + 1);
          else setPhase('exercises');
        } else if (event.key === 'ArrowLeft' && cardIndex > 0) {
          event.preventDefault();
          setFlipped(false);
          setCardIndex(index => index - 1);
        } else if (event.key === ' ' || event.key === 'f') {
          event.preventDefault();
          setFlipped(value => !value);
        }
      }

      if (phase === 'exercises') {
        const exercise = lesson.exercises[exerciseIndex];
        const choice = parseInt(event.key);
        if (exercise?.type === 'multiple-choice' && choice >= 1 && choice <= (exercise.options?.length ?? 0)) {
          setKeyboardSelect(choice - 1);
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [phase, cardIndex, exerciseIndex, lesson]);

  if (!unit || !lesson) {
    return (
      <div className="page page--narrow">
        <OhNon>This lesson isn't on any line. Pick one from Learn.</OhNon>
        <ButtonLink to="/learn" variant="secondary" className="mt-4">
          Back to Learn
        </ButtonLink>
      </div>
    );
  }

  const line = lineFor(unit);
  const nextLesson = unit.lessons[unit.lessons.findIndex(candidate => candidate.id === lesson.id) + 1];
  const deepPages = getDeepLessonPages(unit.slug, lesson.id);

  const handleFinish = () => {
    sessionStorage.removeItem(progressKey(lesson.id));
    if (!completedLessons.includes(lesson.id)) {
      completeLesson(lesson.id, lesson.xpReward);
      const badgesNow = useProgressStore.getState().earnedBadges;
      setNewBadges(badgesNow.filter(badge => !earnedBadgesBefore.includes(badge)));
    }
    setPhase('complete');
  };

  const handleReplay = () => {
    sessionStorage.removeItem(progressKey(lesson.id));
    setPhase('flashcards');
    setCardIndex(0);
    setFlipped(false);
    setExerciseIndex(0);
    setNewBadges([]);
    setMissedExercises([]);
  };

  const totalSteps = lesson.vocab.length + lesson.exercises.length;
  const currentStep =
    phase === 'flashcards' ? cardIndex : phase === 'exercises' ? lesson.vocab.length + exerciseIndex : totalSteps;

  const renderExercise = () => {
    const exercise = lesson.exercises[exerciseIndex];
    const advance = () => {
      if (exerciseIndex < lesson.exercises.length - 1) setExerciseIndex(index => index + 1);
      else handleFinish();
    };
    const handlers = {
      onCorrect: () => window.setTimeout(advance, CORRECT_ADVANCE_MS),
      onWrong: () => {
        setMissedExercises(previous => [...previous, { prompt: exercise.prompt, answer: exercise.answer }]);
        window.setTimeout(advance, WRONG_ADVANCE_MS);
      },
    };
    if (exercise.type === 'multiple-choice') {
      return <MultipleChoice key={exerciseIndex} exercise={exercise} keyboardSelect={keyboardSelect} {...handlers} />;
    }
    if (exercise.type === 'fill-blank') return <FillInBlank key={exerciseIndex} exercise={exercise} {...handlers} />;
    if (exercise.type === 'translation') return <TranslationChallenge key={exerciseIndex} exercise={exercise} {...handlers} />;
    return null;
  };

  const stage = () => {
    switch (phase) {
      case 'intro':
        return (
          <LessonIntro
            line={line}
            lesson={lesson}
            deepPages={deepPages}
            onRead={() => setPhase('read')}
            onPractice={() => setPhase('flashcards')}
          />
        );
      case 'read':
        if (!deepPages) return null;
        return (
          <>
            <LessonBar line={line} lesson={lesson} caption={`Page ${pageIndex + 1} of ${deepPages.length}`} />
            <DeepLessonReader
              pages={deepPages}
              pageIndex={pageIndex}
              onPageChange={setPageIndex}
              completeLabel="Start flashcards"
              onComplete={() => setPhase('flashcards')}
            />
          </>
        );
      case 'complete':
        return (
          <LessonComplete
            line={line}
            lessonsDone={unit.lessons.filter(candidate => useProgressStore.getState().completedLessons.includes(candidate.id)).length}
            xpEarned={lesson.xpReward}
            newBadges={newBadges}
            nextLessonId={nextLesson?.id}
            onReplay={handleReplay}
            missedItems={missedExercises}
          />
        );
      case 'flashcards':
        return (
          <>
            <LessonBar line={line} lesson={lesson} step={currentStep} total={totalSteps} />
            <div className="page page--narrow">
              <FlashCard
                key={cardIndex}
                item={lesson.vocab[cardIndex]}
                index={cardIndex}
                total={lesson.vocab.length}
                flipped={flipped}
                onFlipToggle={() => setFlipped(value => !value)}
              />
              <div className="mt-6 flex items-center justify-between gap-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setFlipped(false);
                    setCardIndex(index => index - 1);
                  }}
                  disabled={cardIndex === 0}
                >
                  <ChevronLeft size={20} aria-hidden="true" />
                  Previous
                </Button>
                {cardIndex < lesson.vocab.length - 1 ? (
                  <Button
                    onClick={() => {
                      setFlipped(false);
                      setCardIndex(index => index + 1);
                    }}
                  >
                    Next card
                    <ChevronRight size={20} aria-hidden="true" />
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      setFlipped(false);
                      setPhase('exercises');
                    }}
                  >
                    Start exercises
                  </Button>
                )}
              </div>
              <p className="t-small mt-4 hidden text-center pointer-fine:block">
                <KeyCap>←</KeyCap> <KeyCap>→</KeyCap> move between cards, <KeyCap>Space</KeyCap> flips
              </p>
            </div>
          </>
        );
      case 'exercises':
        return (
          <>
            <LessonBar line={line} lesson={lesson} step={currentStep} total={totalSteps} />
            <div className="page page--narrow">
              <p className="t-small num mb-3">
                Exercise {exerciseIndex + 1} of {lesson.exercises.length}
              </p>
              {renderExercise()}
            </div>
          </>
        );
    }
  };

  return <div style={lineStyle(line)}>{stage()}</div>;
}
