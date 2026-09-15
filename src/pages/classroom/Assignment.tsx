import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, CheckCircle2, Flag, Check } from 'lucide-react';
import { classroomApi } from '../../services/classroom';
import { FlashCard } from '../../components/lesson/FlashCard';
import { MultipleChoice } from '../../components/lesson/MultipleChoice';
import { FillInBlank } from '../../components/lesson/FillInBlank';
import { TranslationChallenge } from '../../components/lesson/TranslationChallenge';
import { DeepLessonReader } from '../../components/lesson/DeepLessonReader';
import { TripProgress } from '../../components/ui/Signage';
import { Button, ButtonLink } from '../../components/ui/Button';
import { bodyToExercises } from '../../types/classroom';
import { parseMarkdownPage } from '../../utils/markdownPage';
import type { AssignmentDetailResponse, AttemptResponseEntry } from '../../types/classroom';

type Phase = 'intro' | 'flashcards' | 'exercises' | 'reading' | 'complete';

export function Assignment() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const [data, setData] = useState<AssignmentDetailResponse | null>(null);
  const [phase, setPhase] = useState<Phase>('intro');
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [readingPage, setReadingPage] = useState(0);
  const [responses, setResponses] = useState<AttemptResponseEntry[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [flaggedIndices, setFlaggedIndices] = useState<Set<number>>(new Set());
  const [flagFormOpen, setFlagFormOpen] = useState(false);
  const [flagReason, setFlagReason] = useState('');
  const [flagSubmitting, setFlagSubmitting] = useState(false);

  useEffect(() => {
    if (!assignmentId) return;
    classroomApi.get<AssignmentDetailResponse>(`/api/student/assignments/${assignmentId}`).then(setData);
  }, [assignmentId]);

  useEffect(() => {
    setFlagFormOpen(false);
    setFlagReason('');
  }, [exerciseIndex]);

  if (!data) {
    return <div className="page text-center text-ink-3 py-16">Loading…</div>;
  }

  const { content } = data;
  const vocab = content.body.kind === 'lesson' ? content.body.vocab : [];
  const exercises = bodyToExercises(content.body);
  const isReading = content.body.kind === 'reading';
  const readingPages = content.body.kind === 'reading' ? content.body.pages.map(parseMarkdownPage) : [];
  const readingGradable = content.body.kind === 'reading' ? content.body.gradable : true;

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

  async function finishReading() {
    setSubmitting(true);
    try {
      await classroomApi.post(`/api/student/assignments/${assignmentId}/attempts`, {
        responses: [],
        score: readingGradable ? 100 : null,
        xpEarned: readingGradable ? content.body.xpReward : 0,
      });
    } finally {
      setSubmitting(false);
      setPhase('complete');
    }
  }

  async function submitFlag() {
    setFlagSubmitting(true);
    try {
      await classroomApi.post(`/api/student/assignments/${assignmentId}/flags`, {
        questionIndex: exerciseIndex,
        reason: flagReason.trim(),
      });
      setFlaggedIndices((prev) => new Set(prev).add(exerciseIndex));
      setFlagFormOpen(false);
      setFlagReason('');
    } finally {
      setFlagSubmitting(false);
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
      <div className="page page--narrow">
        <ButtonLink to="/classes" variant="quiet" className="-ml-1.5 mb-4">
          <ChevronLeft size={20} aria-hidden="true" />
        </ButtonLink>
        <div className="sheet p-6 text-center space-y-6">
          <div>
            <h1 className="h-page">{content.title}</h1>
            {content.subtitle && <p className="t-body text-ink-2 mt-2">{content.subtitle}</p>}
          </div>
          <div className="flex flex-col items-center gap-2 text-ink-2 t-small">
            {isReading && <span>{readingPages.length} pages</span>}
            {!isReading && vocab.length > 0 && <span>{vocab.length} vocab items</span>}
            {!isReading && <span>{exercises.length} {content.body.kind === 'quiz' ? 'questions' : 'exercises'}</span>}
            {(!isReading || readingGradable) && <span className="text-amber-text font-semibold">+{content.body.xpReward} XP</span>}
          </div>
          {data.previousAttempt && (
            <p className="t-small text-ink-3">
              {data.previousAttempt.score === null
                ? "You've already read this. Doing it again just re-marks it as read."
                : `You already completed this — scored ${data.previousAttempt.score}%. Doing it again replaces that score.`}
            </p>
          )}
          <Button
            onClick={() => setPhase(isReading ? 'reading' : vocab.length > 0 ? 'flashcards' : 'exercises')}
            variant="primary"
          >
            {data.previousAttempt ? 'Retake' : isReading ? 'Start reading' : "Let's go!"} <ArrowRight size={17} />
          </Button>
        </div>
      </div>
    );
  }

  if (phase === 'reading') {
    return (
      <div className="page page--narrow">
        <div className="flex items-center gap-3 mb-6">
          <ButtonLink
            to="/classes"
            aria-label="Back to my classes"
            variant="quiet"
          >
            <ChevronLeft size={20} aria-hidden="true" />
          </ButtonLink>
          <p className="t-title text-ink flex-1 truncate">{content.title}</p>
        </div>
        {submitting ? (
          <div className="text-center py-16 text-ink-3 flex flex-col items-center gap-2">
            <CheckCircle2 size={24} />
            <p className="t-small">Saving…</p>
          </div>
        ) : (
          <DeepLessonReader
            pages={readingPages}
            pageIndex={readingPage}
            onPageChange={setReadingPage}
            onComplete={finishReading}
            completeLabel={readingGradable ? 'Finish for XP' : 'Mark as read'}
          />
        )}
      </div>
    );
  }

  if (phase === 'complete') {
    const correct = responses.filter((r) => r.correct).length;
    const score = responses.length ? Math.round((correct / responses.length) * 100) : null;
    return (
      <div className="page page--narrow">
        <div className="sheet p-6 text-center space-y-4">
          <div>
            <h1 className="h-page">Nice work!</h1>
            <p className="t-body text-ink-2 mt-2">
              {isReading
                ? readingGradable
                  ? `Lesson complete · +${content.body.xpReward} XP`
                  : 'Marked as read'
                : `${correct}/${responses.length} correct · ${score}% · +${content.body.xpReward} XP`}
            </p>
          </div>
          <ButtonLink to="/classes" variant="primary">
            Back to my classes
          </ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <div className="page page--narrow">
      <div className="flex items-center gap-3 mb-6">
        <ButtonLink
          to="/classes"
          aria-label="Back to my classes"
          variant="quiet"
        >
          <ChevronLeft size={20} aria-hidden="true" />
        </ButtonLink>
        <TripProgress step={currentStep} total={totalSteps} label="" />
        <span className="t-micro text-ink-3 whitespace-nowrap tabular-nums">
          {currentStep}/{totalSteps}
        </span>
      </div>

      {phase === 'flashcards' && (
        <div>
          <FlashCard item={vocab[cardIndex]} index={cardIndex} total={vocab.length} flipped={flipped} onFlipToggle={() => setFlipped((f) => !f)} />
          <div className="flex items-center justify-between mt-6 gap-2">
            <Button variant="secondary" onClick={() => { setFlipped(false); setCardIndex((i) => i - 1); }} disabled={cardIndex === 0} size="sm">
              <ChevronLeft size={16} /> Prev
            </Button>
            {cardIndex < vocab.length - 1 ? (
              <Button onClick={() => { setFlipped(false); setCardIndex((i) => i + 1); }} size="sm">
                Next <ChevronRight size={16} />
              </Button>
            ) : (
              <Button onClick={() => { setFlipped(false); setPhase('exercises'); }} size="sm">
                Start <ArrowRight size={16} />
              </Button>
            )}
          </div>
        </div>
      )}

      {phase === 'exercises' && !submitting && (
        <div className="space-y-4">
          {(() => {
            const ex = exercises[exerciseIndex];
            const onCorrect = () => advanceExercise({ index: exerciseIndex, correct: true });
            const onWrong = () => advanceExercise({ index: exerciseIndex, correct: false });
            if (ex.type === 'multiple-choice') return <MultipleChoice key={exerciseIndex} exercise={ex} onCorrect={onCorrect} onWrong={onWrong} />;
            if (ex.type === 'fill-blank') return <FillInBlank key={exerciseIndex} exercise={ex} onCorrect={onCorrect} onWrong={onWrong} />;
            if (ex.type === 'translation') return <TranslationChallenge key={exerciseIndex} exercise={ex} onCorrect={onCorrect} onWrong={onWrong} />;
            return null;
          })()}

          <div className="text-center">
            {flaggedIndices.has(exerciseIndex) ? (
              <p className="t-small text-go flex items-center justify-center gap-1">
                <Check size={14} /> Flagged for your teacher
              </p>
            ) : !flagFormOpen ? (
              <button
                onClick={() => setFlagFormOpen(true)}
                className="t-small text-enamel-text hover:underline"
              >
                <Flag size={14} /> Something wrong with this question?
              </button>
            ) : (
              <div className="sheet p-3 text-left space-y-2">
                <p className="t-small text-ink-2">Let your teacher know what's off (optional).</p>
                <input
                  value={flagReason}
                  onChange={(e) => setFlagReason(e.target.value)}
                  placeholder="e.g. the correct answer looks wrong"
                  className="field text-sm"
                  maxLength={500}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={submitFlag}
                    disabled={flagSubmitting}
                    variant="secondary"
                    size="sm"
                  >
                    {flagSubmitting ? 'Sending…' : 'Send to teacher'}
                  </Button>
                  <button
                    onClick={() => setFlagFormOpen(false)}
                    className="t-small text-ink-3 hover:underline"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {submitting && (
        <div className="text-center py-16 text-ink-3 flex flex-col items-center gap-2">
          <CheckCircle2 size={24} />
          <p className="t-small">Saving your results…</p>
        </div>
      )}
    </div>
  );
}
