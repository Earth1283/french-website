import { useCallback, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronDown, Sparkles, PenLine, AlertTriangle, BookOpenCheck } from 'lucide-react';
import { getWritingTask } from '../../data/exam/writing';
import { RUBRIC_CRITERIA, buildEvaluation, countWords, toOutOf25 } from '../../data/exam/rubric';
import { WritingWorkspace } from '../../components/exam/WritingWorkspace';
import { RubricScorecard } from '../../components/exam/RubricScorecard';
import { Button } from '../../components/ui/Button';
import { useExamStore } from '../../stores/examStore';
import { useConversationStore } from '../../stores/conversationStore';
import { useProgressStore } from '../../stores/progressStore';
import { evaluateWriting } from '../../lib/gemini';
import { todayString } from '../../utils/streak';
import type { RubricBand, RubricCriterionId, WritingSubmission } from '../../types/exam';

type Phase = 'writing' | 'marking' | 'result';

function Disclosure({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="card">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between p-4 cursor-pointer text-left"
        style={{ background: 'transparent', border: 'none' }}
      >
        <span className="text-sm font-semibold text-primary">{title}</span>
        <ChevronDown size={16} className="text-muted transition-transform" style={{ transform: open ? 'rotate(180deg)' : undefined }} />
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

const MIDDLE_BANDS = Object.fromEntries(RUBRIC_CRITERIA.map(c => [c.id, 2])) as Record<RubricCriterionId, RubricBand>;

export function WritingExercise() {
  const { taskId } = useParams<{ taskId: string }>();
  const task = taskId ? getWritingTask(taskId) : undefined;
  const apiKey = useConversationStore(s => s.geminiApiKey);
  const drafts = useExamStore(s => s.drafts);
  const setDraft = useExamStore(s => s.setDraft);
  const clearDraft = useExamStore(s => s.clearDraft);
  const addWritingSubmission = useExamStore(s => s.addWritingSubmission);
  const setEvaluation = useExamStore(s => s.setEvaluation);
  const allSubmissions = useExamStore(s => s.writingSubmissions);

  const [phase, setPhase] = useState<Phase>('writing');
  const [current, setCurrent] = useState<WritingSubmission | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selfBands, setSelfBands] = useState(MIDDLE_BANDS);
  const [showEnglish, setShowEnglish] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const onDraftChange = useCallback((text: string) => {
    if (task) setDraft(task.id, text);
  }, [task, setDraft]);

  if (!task) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <p className="text-muted">This writing task doesn't exist.</p>
        <Link to="/exam"><Button className="mt-4">Back to DELF Prep</Button></Link>
      </div>
    );
  }

  const past = allSubmissions.filter(s => s.taskId === task.id).reverse();
  // The live copy from the store, so a saved self-assessment shows immediately.
  const shown = current ? allSubmissions.find(s => s.id === current.id) ?? current : null;

  async function submit(text: string, secondsSpent: number) {
    if (!task) return;
    const submission: WritingSubmission = {
      id: `writing-${Date.now()}`,
      taskId: task.id,
      date: todayString(),
      text,
      wordCount: countWords(text),
      secondsSpent,
      evaluation: null,
    };
    addWritingSubmission(submission);
    clearDraft(task.id);
    if (past.length === 0) useProgressStore.getState().addXP(task.minWords >= 160 ? 40 : 20);
    setCurrent(submission);
    setError(null);

    if (!apiKey) {
      setSelfBands(MIDDLE_BANDS);
      setPhase('result');
      return;
    }
    setPhase('marking');
    try {
      const evaluation = await evaluateWriting(apiKey, task, text);
      setEvaluation(submission.id, evaluation);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not reach Gemini.');
      setSelfBands(MIDDLE_BANDS);
    }
    setPhase('result');
  }

  function saveSelfAssessment() {
    if (!task || !shown) return;
    setEvaluation(shown.id, buildEvaluation(task.level, 'self', selfBands, shown.wordCount, task.minWords, { comments: {} }));
  }

  function writeAgain() {
    setCurrent(null);
    setPhase('writing');
    setAttempt(a => a + 1);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <div>
        <Link to="/exam" className="inline-flex items-center gap-0.5 text-sm font-medium mb-3 no-underline" style={{ color: 'var(--accent)' }}>
          <ChevronLeft size={18} strokeWidth={2.4} className="-ml-1.5" /> DELF Prep
        </Link>
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="chip text-xs">DELF {task.level.toUpperCase()}</span>
          <span className="chip text-xs">Production écrite</span>
          <span className="chip text-xs">{task.genre}</span>
        </div>
        <h1 className="text-2xl font-bold text-primary">{task.title}</h1>
      </div>

      <div className="card p-4 space-y-2">
        <p className="text-[0.95rem] text-primary leading-relaxed" lang="fr">{task.consigne}</p>
        <button
          type="button"
          onClick={() => setShowEnglish(s => !s)}
          className="text-xs font-medium cursor-pointer"
          style={{ background: 'transparent', border: 'none', color: 'var(--accent)', padding: 0 }}
        >
          {showEnglish ? 'Hide English' : 'Show in English'}
        </button>
        {showEnglish && <p className="text-sm text-secondary">{task.instructionsEn}</p>}
      </div>

      {phase === 'writing' && (
        <>
          <Disclosure title="What the examiner looks for">
            <ul className="text-sm text-secondary space-y-1 list-disc pl-5">
              {task.checklist.map(c => <li key={c}>{c}</li>)}
            </ul>
          </Disclosure>
          <Disclosure title="Useful phrases (not available on exam day)">
            <div className="flex flex-wrap gap-1.5">
              {task.usefulPhrases.map(p => <span key={p} className="chip text-xs" lang="fr">{p}</span>)}
            </div>
          </Disclosure>

          {!apiKey && (
            <p className="text-xs text-muted flex items-start gap-1.5 px-1">
              <Sparkles size={12} className="mt-0.5 flex-shrink-0" />
              <span>
                Add a Gemini API key in <Link to="/settings" style={{ color: 'var(--accent)' }}>Settings</Link> to have your text
                marked against the DELF grid with corrections. Without one, you compare with a model answer and mark yourself.
              </span>
            </p>
          )}

          <WritingWorkspace
            key={attempt}
            minWords={task.minWords}
            timeMinutes={task.timeMinutes}
            initialText={drafts[task.id] ?? ''}
            onDraftChange={onDraftChange}
            onSubmit={submit}
            submitLabel={apiKey ? 'Submit for AI marking' : 'Submit and self-assess'}
          />
        </>
      )}

      {phase === 'marking' && (
        <div className="card p-8 text-center space-y-2">
          <Sparkles size={22} className="mx-auto" style={{ color: 'var(--accent)' }} />
          <p className="text-sm text-secondary">Marking against the DELF {task.level.toUpperCase()} grid…</p>
        </div>
      )}

      {phase === 'result' && shown && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {error && (
            <div className="card p-3 flex items-start gap-2">
              <AlertTriangle size={16} style={{ color: 'var(--danger)', flexShrink: 0 }} />
              <p className="text-xs text-secondary">
                AI marking failed ({error}). Your text is saved — mark it yourself below, using the model answer as a reference.
              </p>
            </div>
          )}

          {shown.evaluation ? (
            <>
              <RubricScorecard level={task.level} evaluation={shown.evaluation} />
              {shown.evaluation.source === 'ai' && (
                <p className="text-[0.7rem] text-muted px-1">
                  AI marking is an estimate. Real DELF scripts are double-marked by trained examiners.
                </p>
              )}
              {shown.evaluation.summary && (
                <div className="card p-4">
                  <p className="text-sm font-semibold text-primary mb-1">Overall</p>
                  <p className="text-sm text-secondary">{shown.evaluation.summary}</p>
                </div>
              )}
              {shown.evaluation.corrections && shown.evaluation.corrections.length > 0 && (
                <div className="card p-4 space-y-3">
                  <p className="text-sm font-semibold text-primary">Corrections</p>
                  {shown.evaluation.corrections.map((c, i) => (
                    <div key={i} className="text-sm space-y-0.5">
                      <p lang="fr">
                        <span style={{ color: 'var(--danger)', textDecoration: 'line-through' }}>{c.original}</span>
                        {' → '}
                        <span style={{ color: 'var(--success)' }} className="font-medium">{c.corrected}</span>
                      </p>
                      {c.explanation && <p className="text-xs text-muted">{c.explanation}</p>}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="card p-4 space-y-2">
                <p className="text-sm font-semibold text-primary flex items-center gap-1.5">
                  <BookOpenCheck size={15} /> Mark yourself
                </p>
                <p className="text-xs text-secondary">
                  Compare your text with the model answer and the checklist, then place yourself on each criterion. Be strict:
                  "at level" means an examiner would have nothing to object to for {task.level.toUpperCase()}.
                </p>
                <ul className="text-xs text-secondary space-y-0.5 list-disc pl-5">
                  {task.checklist.map(c => <li key={c}>{c}</li>)}
                </ul>
              </div>
              <RubricScorecard
                level={task.level}
                bands={selfBands}
                onBandChange={(id, band) => setSelfBands(b => ({ ...b, [id]: band }))}
              />
              <Button onClick={saveSelfAssessment} className="w-full">Save my marks</Button>
            </>
          )}

          <Disclosure title={`Your text · ${shown.wordCount} mots`} defaultOpen={!shown.evaluation}>
            <p className="text-sm text-primary whitespace-pre-wrap leading-relaxed" lang="fr">{shown.text}</p>
          </Disclosure>
          <Disclosure title="Model answer" defaultOpen={!shown.evaluation}>
            <p className="text-sm text-primary whitespace-pre-wrap leading-relaxed" lang="fr">{task.modelAnswer}</p>
            <p className="text-xs text-muted mt-2">{countWords(task.modelAnswer)} mots · one good way to do the task, not the only one.</p>
          </Disclosure>

          <Button variant="secondary" onClick={writeAgain} className="w-full">
            <PenLine size={15} /> Write it again
          </Button>
        </motion.div>
      )}

      {phase === 'writing' && past.length > 0 && (
        <section>
          <div className="section-label">Previous attempts</div>
          <div className="inset-group">
            {past.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => { setCurrent(s); setError(null); setSelfBands(MIDDLE_BANDS); setPhase('result'); }}
                className="inset-row w-full justify-between cursor-pointer text-left"
                style={{ background: 'transparent', border: 'none', borderTop: i > 0 ? '0.5px solid var(--hairline)' : 'none' }}
              >
                <span className="text-sm text-primary">{s.date} · {s.wordCount} mots</span>
                <span className="text-xs font-semibold text-secondary">
                  {s.evaluation ? `${toOutOf25(s.evaluation.score, s.evaluation.maxScore)}/25 · ${s.evaluation.source === 'ai' ? 'AI' : 'self'}` : 'Not marked'}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
