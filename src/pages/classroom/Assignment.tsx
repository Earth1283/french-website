import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, CheckCircle2, PartyPopper } from 'lucide-react';
import { classroomApi } from '../../services/classroom';
import { FlashCard } from '../../components/lesson/FlashCard';
import { MultipleChoice } from '../../components/lesson/MultipleChoice';
import { FillInBlank } from '../../components/lesson/FillInBlank';
import { TranslationChallenge } from '../../components/lesson/TranslationChallenge';
import { ProgressBar } from '../../components/layout/ProgressBar';
import { Button } from '../../components/ui/Button';
import { bodyToExercises } from '../../types/classroom';
import type { AssignmentInfo, AttemptResponseEntry, ClassroomContentBody } from '../../types/classroom';

type Phase = 'intro' | 'flashcards' | 'exercises' | 'complete';

export function Assignment() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const [data, setData] = useState<{ assignment: AssignmentInfo; content: { title: string; subtitle: string; kind: string; body: ClassroomContentBody } } | null>(
    null
  );
  const [phase, setPhase] = useState<Phase>('intro');
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [responses, setResponses] = useState<AttemptResponseEntry[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!assignmentId) return;
    classroomApi
      .get<{ assignment: AssignmentInfo; content: { title: string; subtitle: string; kind: string; body: ClassroomContentBody } }>(
        `/api/student/assignments/${assignmentId}`
      )
      .then(setData);
  }, [assignmentId]);

  if (!data) {
    return <div className="max-w-xl mx-auto px-4 py-16 text-center text-muted">Loading…</div>;
  }

  const { content } = data;
  const vocab = content.body.kind === 'lesson' ? content.body.vocab : [];
  const exercises = bodyToExercises(content.body);

  async function finish(finalResponses: AttemptResponseEntry[]) {
    setSubmitting(true);
    const correct = finalResponses.filter((r) => r.correct).length;
    const score = Math.round((correct / finalResponses.length) * 100);
    try {
      await classroomApi.post(`/api/student/assignments/${assignmentId}/attempts`, {
        responses: finalResponses,
        score,
        xpEarned: content.body.xpReward,
      });
    } finally {
      setSubmitting(false);
      setPhase('complete');
    }
  }

  const advanceExercise = (entry: AttemptResponseEntry) => {
    const next = [...responses, entry];
    setResponses(next);
    if (exerciseIndex < exercises.length - 1) {
      setExerciseIndex((i) => i + 1);
    } else {
      finish(next);
    }
  };

  const totalSteps = vocab.length + exercises.length;
  const currentStep = phase === 'flashcards' ? cardIndex : phase === 'exercises' ? vocab.length + exerciseIndex : phase === 'complete' ? totalSteps : 0;

  if (phase === 'intro') {
    return (
      <div className="max-w-xl mx-auto px-4 py-10 text-center">
        <Link to="/classes" className="inline-flex items-center gap-0.5 text-[0.95rem] font-medium mb-8 no-underline" style={{ color: 'var(--accent)' }}>
          <ChevronLeft size={20} strokeWidth={2.4} className="-ml-1.5" /> My Classes
        </Link>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', damping: 22, stiffness: 280 }} className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-primary">{content.title}</h1>
            {content.subtitle && <p className="text-secondary mt-2">{content.subtitle}</p>}
          </div>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {vocab.length > 0 && <span className="chip">📖 {vocab.length} vocab items</span>}
            <span className="chip">✏️ {exercises.length} {content.body.kind === 'quiz' ? 'questions' : 'exercises'}</span>
            <span className="xp-badge text-sm px-3 py-1.5">+{content.body.xpReward} XP</span>
          </div>
          <Button size="lg" onClick={() => setPhase(vocab.length > 0 ? 'flashcards' : 'exercises')} className="w-full max-w-xs mx-auto">
            Let's go! <ArrowRight size={17} />
          </Button>
        </motion.div>
      </div>
    );
  }

  if (phase === 'complete') {
    const correct = responses.filter((r) => r.correct).length;
    const score = Math.round((correct / responses.length) * 100);
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-5">
        <span className="w-16 h-16 mx-auto rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--accent-tint)' }}>
          <PartyPopper size={26} style={{ color: 'var(--accent)' }} />
        </span>
        <h1 className="text-2xl font-bold text-primary">Nice work!</h1>
        <p className="text-secondary">
          {correct}/{responses.length} correct · {score}% · +{content.body.xpReward} XP
        </p>
        <Link to="/classes">
          <Button className="mt-2">Back to My Classes</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6 relative">
      <div className="flex items-center gap-3 mb-6">
        <Link
          to="/classes"
          aria-label="Back to My Classes"
          className="w-9 h-9 flex items-center justify-center rounded-full ios-press no-underline flex-shrink-0"
          style={{ backgroundColor: 'var(--bg-card)', color: 'var(--accent)', border: '1px solid var(--hairline)', boxShadow: 'var(--shadow-1)' }}
        >
          <ChevronLeft size={20} strokeWidth={2.4} />
        </Link>
        <ProgressBar value={currentStep} max={totalSteps} height={8} className="flex-1" />
        <span className="text-xs text-muted whitespace-nowrap font-medium">
          {currentStep}/{totalSteps}
        </span>
      </div>

      <AnimatePresence mode="popLayout">
        {phase === 'flashcards' && (
          <motion.div key={`card-${cardIndex}`} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ type: 'spring', damping: 26, stiffness: 320 }}>
            <FlashCard item={vocab[cardIndex]} index={cardIndex} total={vocab.length} flipped={flipped} onFlipToggle={() => setFlipped((f) => !f)} />
            <div className="flex items-center justify-between mt-6">
              <Button variant="secondary" onClick={() => { setFlipped(false); setCardIndex((i) => i - 1); }} disabled={cardIndex === 0}>
                <ChevronLeft size={16} /> Prev
              </Button>
              {cardIndex < vocab.length - 1 ? (
                <Button onClick={() => { setFlipped(false); setCardIndex((i) => i + 1); }}>
                  Next <ChevronRight size={16} />
                </Button>
              ) : (
                <Button onClick={() => { setFlipped(false); setPhase('exercises'); }}>
                  Start <ArrowRight size={16} />
                </Button>
              )}
            </div>
          </motion.div>
        )}

        {phase === 'exercises' && !submitting && (
          <motion.div key={`exercise-${exerciseIndex}`} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ type: 'spring', damping: 26, stiffness: 320 }} className="space-y-4">
            <p className="text-xs text-center text-muted font-semibold uppercase tracking-wider">
              {exerciseIndex + 1} of {exercises.length}
            </p>
            {(() => {
              const ex = exercises[exerciseIndex];
              const onCorrect = () => advanceExercise({ index: exerciseIndex, correct: true });
              const onWrong = () => advanceExercise({ index: exerciseIndex, correct: false });
              if (ex.type === 'multiple-choice') return <MultipleChoice key={exerciseIndex} exercise={ex} onCorrect={onCorrect} onWrong={onWrong} />;
              if (ex.type === 'fill-blank') return <FillInBlank key={exerciseIndex} exercise={ex} onCorrect={onCorrect} onWrong={onWrong} />;
              if (ex.type === 'translation') return <TranslationChallenge key={exerciseIndex} exercise={ex} onCorrect={onCorrect} onWrong={onWrong} />;
              return null;
            })()}
          </motion.div>
        )}

        {submitting && (
          <div className="text-center py-16 text-muted flex flex-col items-center gap-2">
            <CheckCircle2 size={24} />
            <p className="text-sm">Saving your results…</p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
