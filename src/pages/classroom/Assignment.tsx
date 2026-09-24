import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, CheckCircle2, PartyPopper, Flag, Check } from 'lucide-react';
import { classroomApi } from '../../services/classroom';
import { FlashCard } from '../../components/lesson/FlashCard';
import { MultipleChoice } from '../../components/lesson/MultipleChoice';
import { FillInBlank } from '../../components/lesson/FillInBlank';
import { TranslationChallenge } from '../../components/lesson/TranslationChallenge';
import { DeepLessonReader } from '../../components/lesson/DeepLessonReader';
import { ListeningPlayer } from '../../components/exam/ListeningPlayer';
import { ListeningQuestions } from '../../components/exam/ListeningQuestions';
import { Transcript } from '../../components/exam/Transcript';
import { WritingWorkspace } from '../../components/exam/WritingWorkspace';
import { RubricScorecard } from '../../components/exam/RubricScorecard';
import { buildEvaluation, countWords } from '../../data/exam/rubric';
import { useExamStore } from '../../stores/examStore';
import { ProgressBar } from '../../components/layout/ProgressBar';
import { Button } from '../../components/ui/Button';
import { bodyToExercises } from '../../types/classroom';
import { parseMarkdownPage } from '../../utils/markdownPage';
import type { AssignmentDetailResponse, AttemptResponseEntry } from '../../types/classroom';

type Phase = 'intro' | 'flashcards' | 'exercises' | 'reading' | 'listening' | 'writing' | 'complete';

export function Assignment() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const [data, setData] = useState<AssignmentDetailResponse | null>(null);
  const [phase, setPhase] = useState<Phase>('intro');
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [responses, setResponses] = useState<AttemptResponseEntry[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [flaggedIndices, setFlaggedIndices] = useState<Set<number>>(new Set());
  const [flagFormOpen, setFlagFormOpen] = useState(false);
  const [flagReason, setFlagReason] = useState('');
  const [flagSubmitting, setFlagSubmitting] = useState(false);
  const [listeningAnswers, setListeningAnswers] = useState<(string | undefined)[]>([]);
  const [listeningResults, setListeningResults] = useState<boolean[] | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const draftKey = `classroom-${assignmentId}`;
  const draft = useExamStore(s => s.drafts[draftKey]);
  const setDraft = useExamStore(s => s.setDraft);
  const clearDraft = useExamStore(s => s.clearDraft);
  const onDraftChange = useCallback((text: string) => setDraft(draftKey, text), [draftKey, setDraft]);

  const load = useCallback(() => {
    if (!assignmentId) return Promise.resolve();
    return classroomApi.get<AssignmentDetailResponse>(`/api/student/assignments/${assignmentId}`).then(setData);
  }, [assignmentId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setFlagFormOpen(false);
    setFlagReason('');
  }, [exerciseIndex]);

  if (!data) {
    return <div className="max-w-xl mx-auto px-4 py-16 text-center text-muted">Loading…</div>;
  }

  const { content } = data;
  const vocab = content.body.kind === 'lesson' ? content.body.vocab : [];
  const exercises = bodyToExercises(content.body);
  const isReading = content.body.kind === 'reading';
  const readingPages = content.body.kind === 'reading' ? content.body.pages.map(parseMarkdownPage) : [];
  const readingGradable = content.body.kind === 'reading' ? content.body.gradable : true;
  const listeningBody = content.body.kind === 'listening' ? content.body : null;
  const writingBody = content.body.kind === 'writing' ? content.body : null;
  const previousReview = data.previousAttempt?.review ?? null;

  async function submitListening() {
    if (!listeningBody) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await classroomApi.post<{ attempt: { responses_json: string } }>(
        `/api/student/assignments/${assignmentId}/attempts`,
        { responses: listeningBody.questions.map((_, index) => ({ index, answerGiven: listeningAnswers[index] ?? '' })) },
      );
      // The server's marking is the one that counts.
      const graded = JSON.parse(res.attempt.responses_json) as AttemptResponseEntry[];
      setListeningResults(listeningBody.questions.map((_, i) => graded.find(g => g.index === i)?.correct ?? false));
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Could not submit your answers.');
    } finally {
      setSubmitting(false);
    }
  }

  async function submitWriting(text: string) {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await classroomApi.post(`/api/student/assignments/${assignmentId}/attempts`, { responses: [], text });
      clearDraft(draftKey);
      await load();
      setPhase('complete');
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Could not submit your text. Your draft is saved — try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function finish(finalResponses: AttemptResponseEntry[]) {
    setSubmitting(true);
    try {
      await classroomApi.post(`/api/student/assignments/${assignmentId}/attempts`, {
        responses: finalResponses.map(({ index, answerGiven }) => ({ index, answerGiven })),
      });
    } finally {
      setSubmitting(false);
      setPhase('complete');
    }
  }

  async function finishReading() {
    setSubmitting(true);
    try {
      await classroomApi.post(`/api/student/assignments/${assignmentId}/attempts`, { responses: [] });
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
            {isReading && <span className="chip">📄 {readingPages.length} pages</span>}
            {listeningBody && <span className="chip">🎧 {listeningBody.questions.length} questions · {listeningBody.plays === 1 ? 'heard once' : `heard ${listeningBody.plays}×`}</span>}
            {writingBody && <span className="chip">✍️ {writingBody.minWords}+ mots{writingBody.timeMinutes ? ` · ${writingBody.timeMinutes} min` : ''}</span>}
            {(content.body.kind === 'lesson' || content.body.kind === 'quiz') && vocab.length > 0 && <span className="chip">📖 {vocab.length} vocab items</span>}
            {(content.body.kind === 'lesson' || content.body.kind === 'quiz') && <span className="chip">✏️ {exercises.length} {content.body.kind === 'quiz' ? 'questions' : 'exercises'}</span>}
            {(!isReading || readingGradable) && <span className="xp-badge text-sm px-3 py-1.5">+{content.body.xpReward} XP</span>}
          </div>
          {data.previousAttempt && !writingBody && (
            <p className="text-xs text-muted">
              {data.previousAttempt.score === null
                ? "You've already read this. Doing it again just re-marks it as read."
                : `You already completed this — scored ${data.previousAttempt.score}%. Doing it again replaces that score.`}
            </p>
          )}
          {data.previousAttempt && writingBody && (
            <div className="text-left space-y-3">
              {previousReview ? (
                <>
                  <RubricScorecard
                    level={writingBody.level}
                    evaluation={buildEvaluation(
                      writingBody.level,
                      'teacher',
                      previousReview.bands,
                      countWords(data.previousAttempt.submissionText ?? ''),
                      0,
                      { comments: {} },
                    )}
                  />
                  {previousReview.feedback && (
                    <div className="card p-4">
                      <p className="text-sm font-semibold text-primary mb-1">Your teacher's feedback</p>
                      <p className="text-sm text-secondary whitespace-pre-wrap">{previousReview.feedback}</p>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-xs text-muted text-center">Submitted — waiting for your teacher to mark it.</p>
              )}
              {data.previousAttempt.submissionText && (
                <div className="card p-4">
                  <p className="text-sm font-semibold text-primary mb-1">Your text</p>
                  <p className="text-sm text-secondary whitespace-pre-wrap" lang="fr">{data.previousAttempt.submissionText}</p>
                </div>
              )}
              {writingBody.modelAnswer && (
                <div className="card p-4">
                  <p className="text-sm font-semibold text-primary mb-1">Model answer</p>
                  <p className="text-sm text-secondary whitespace-pre-wrap" lang="fr">{writingBody.modelAnswer}</p>
                </div>
              )}
              <p className="text-xs text-muted text-center">Submitting again replaces your text and clears the mark.</p>
            </div>
          )}
          <Button
            size="lg"
            onClick={() =>
              setPhase(
                isReading ? 'reading'
                  : listeningBody ? 'listening'
                    : writingBody ? 'writing'
                      : vocab.length > 0 ? 'flashcards' : 'exercises',
              )
            }
            className="w-full max-w-xs mx-auto"
          >
            {data.previousAttempt ? (writingBody ? 'Rewrite' : 'Retake') : isReading ? 'Start Reading' : writingBody ? 'Start writing' : "Let's go!"}{' '}
            <ArrowRight size={17} />
          </Button>
        </motion.div>
      </div>
    );
  }

  if (phase === 'reading') {
    return (
      <div className="max-w-xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Link
            to="/classes"
            aria-label="Back to My Classes"
            className="w-9 h-9 flex items-center justify-center rounded-full ios-press no-underline flex-shrink-0"
            style={{ backgroundColor: 'var(--bg-card)', color: 'var(--accent)', border: '1px solid var(--hairline)', boxShadow: 'var(--shadow-1)' }}
          >
            <ChevronLeft size={20} strokeWidth={2.4} />
          </Link>
          <p className="text-sm font-semibold text-primary flex-1 truncate">{content.title}</p>
        </div>
        {submitting ? (
          <div className="text-center py-16 text-muted flex flex-col items-center gap-2">
            <CheckCircle2 size={24} />
            <p className="text-sm">Saving…</p>
          </div>
        ) : (
          <DeepLessonReader
            pages={readingPages}
            onComplete={finishReading}
            completeLabel={readingGradable ? 'Finish for XP' : 'Mark as Read'}
          />
        )}
      </div>
    );
  }

  if (phase === 'listening' && listeningBody) {
    const correct = listeningResults?.filter(Boolean).length ?? 0;
    return (
      <div className="max-w-xl mx-auto px-4 py-6 space-y-4">
        <div className="flex items-center gap-3">
          <Link
            to="/classes"
            aria-label="Back to My Classes"
            className="w-9 h-9 flex items-center justify-center rounded-full ios-press no-underline flex-shrink-0"
            style={{ backgroundColor: 'var(--bg-card)', color: 'var(--accent)', border: '1px solid var(--hairline)', boxShadow: 'var(--shadow-1)' }}
          >
            <ChevronLeft size={20} strokeWidth={2.4} />
          </Link>
          <p className="text-sm font-semibold text-primary flex-1 truncate">{content.title}</p>
        </div>
        {listeningBody.situation && <p className="text-sm text-secondary" lang="fr">{listeningBody.situation}</p>}
        <ListeningPlayer script={listeningBody.script} maxPlays={listeningResults ? null : listeningBody.plays} allowRateChange={!!listeningResults} />
        {listeningResults && (
          <div className="card p-4">
            <p className="text-sm font-semibold text-primary">{correct} / {listeningBody.questions.length} correct · +{content.body.xpReward} XP</p>
            <p className="text-xs text-muted">Saved for your teacher. The transcript is below.</p>
          </div>
        )}
        <ListeningQuestions
          questions={listeningBody.questions}
          answers={listeningAnswers}
          results={listeningResults}
          onAnswer={(i, v) => setListeningAnswers(prev => { const next = [...prev]; next[i] = v; return next; })}
        />
        {submitError && <p className="text-sm" style={{ color: 'var(--danger)' }}>{submitError}</p>}
        {!listeningResults ? (
          <Button onClick={submitListening} disabled={submitting} className="w-full">
            {submitting ? 'Submitting…' : 'Submit answers'}
          </Button>
        ) : (
          <>
            <Transcript script={listeningBody.script} />
            <Link to="/classes"><Button variant="secondary" className="w-full">Back to My Classes</Button></Link>
          </>
        )}
      </div>
    );
  }

  if (phase === 'writing' && writingBody) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <div className="flex items-center gap-3">
          <Link
            to="/classes"
            aria-label="Back to My Classes"
            className="w-9 h-9 flex items-center justify-center rounded-full ios-press no-underline flex-shrink-0"
            style={{ backgroundColor: 'var(--bg-card)', color: 'var(--accent)', border: '1px solid var(--hairline)', boxShadow: 'var(--shadow-1)' }}
          >
            <ChevronLeft size={20} strokeWidth={2.4} />
          </Link>
          <p className="text-sm font-semibold text-primary flex-1 truncate">{content.title}</p>
          <span className="chip text-xs">DELF {writingBody.level.toUpperCase()}</span>
        </div>
        <div className="card p-4 space-y-2">
          <p className="text-[0.95rem] text-primary leading-relaxed whitespace-pre-wrap" lang="fr">{writingBody.consigne}</p>
          {writingBody.checklist.length > 0 && (
            <ul className="text-xs text-secondary space-y-0.5 list-disc pl-5">
              {writingBody.checklist.map(c => <li key={c}>{c}</li>)}
            </ul>
          )}
        </div>
        {submitError && <p className="text-sm" style={{ color: 'var(--danger)' }}>{submitError}</p>}
        <WritingWorkspace
          minWords={writingBody.minWords}
          timeMinutes={writingBody.timeMinutes ?? 45}
          initialText={draft ?? ''}
          onDraftChange={onDraftChange}
          onSubmit={(text) => submitWriting(text)}
          submitting={submitting}
          submitLabel="Hand in to my teacher"
        />
      </div>
    );
  }

  if (phase === 'complete') {
    const correct = responses.filter((r) => r.correct).length;
    const score = responses.length ? Math.round((correct / responses.length) * 100) : null;
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-5">
        <span className="w-16 h-16 mx-auto rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--accent-tint)' }}>
          <PartyPopper size={26} style={{ color: 'var(--accent)' }} />
        </span>
        <h1 className="text-2xl font-bold text-primary">Nice work!</h1>
        <p className="text-secondary">
          {writingBody
            ? `Handed in · +${content.body.xpReward} XP. Your teacher will mark it with the DELF grid.`
            : isReading
              ? readingGradable
                ? `Lesson complete · +${content.body.xpReward} XP`
                : 'Marked as read'
              : `${correct}/${responses.length} correct · ${score}% · +${content.body.xpReward} XP`}
        </p>
        {writingBody?.modelAnswer && (
          <div className="card p-4 text-left">
            <p className="text-sm font-semibold text-primary mb-1">Model answer</p>
            <p className="text-sm text-secondary whitespace-pre-wrap" lang="fr">{writingBody.modelAnswer}</p>
          </div>
        )}
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
              const onCorrect = (answerGiven?: string) => advanceExercise({ index: exerciseIndex, correct: true, answerGiven });
              const onWrong = (answerGiven?: string) => advanceExercise({ index: exerciseIndex, correct: false, answerGiven });
              if (ex.type === 'multiple-choice') return <MultipleChoice key={exerciseIndex} exercise={ex} onCorrect={onCorrect} onWrong={onWrong} />;
              if (ex.type === 'fill-blank') return <FillInBlank key={exerciseIndex} exercise={ex} onCorrect={onCorrect} onWrong={onWrong} />;
              if (ex.type === 'translation') return <TranslationChallenge key={exerciseIndex} exercise={ex} onCorrect={onCorrect} onWrong={onWrong} />;
              return null;
            })()}

            <div className="max-w-lg mx-auto text-center">
              {flaggedIndices.has(exerciseIndex) ? (
                <p className="text-xs text-muted flex items-center justify-center gap-1">
                  <Check size={12} /> Flagged for your teacher
                </p>
              ) : !flagFormOpen ? (
                <button
                  onClick={() => setFlagFormOpen(true)}
                  className="text-xs text-muted hover:underline cursor-pointer inline-flex items-center gap-1"
                  style={{ background: 'transparent', border: 'none' }}
                >
                  <Flag size={11} /> Something wrong with this question?
                </button>
              ) : (
                <div className="text-left space-y-2 p-3" style={{ borderRadius: 'var(--radius-sm)', border: '1px solid var(--hairline)', backgroundColor: 'var(--bg-card)' }}>
                  <p className="text-xs text-muted">Let your teacher know what's off (optional).</p>
                  <input
                    value={flagReason}
                    onChange={(e) => setFlagReason(e.target.value)}
                    placeholder="e.g. the correct answer looks wrong"
                    className="ios-input py-1.5 text-sm"
                    maxLength={500}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={submitFlag}
                      disabled={flagSubmitting}
                      className="chip cursor-pointer"
                      style={{ border: 'none' }}
                    >
                      {flagSubmitting ? 'Sending…' : 'Send to teacher'}
                    </button>
                    <button
                      onClick={() => setFlagFormOpen(false)}
                      className="text-xs text-muted hover:underline cursor-pointer"
                      style={{ background: 'transparent', border: 'none' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
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
