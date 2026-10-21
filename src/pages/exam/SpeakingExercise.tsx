import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { REVEAL } from '../../utils/motion';
import { ChevronLeft, Mic, Sparkles } from 'lucide-react';
import { getSpeakingTask } from '../../data/exam/speaking';
import { toOutOf25 } from '../../data/exam/rubric';
import { SpeakingSession, formatMinutes } from '../../components/exam/SpeakingSession';
import { SpeakingFeedback, SpeakingMarking } from '../../components/exam/SpeakingResult';
import { Button } from '../../components/ui/Button';
import { useExamStore } from '../../stores/examStore';
import { useConversationStore } from '../../stores/conversationStore';
import { useProgressStore } from '../../stores/progressStore';
import { todayString } from '../../utils/streak';
import type { Recording } from '../../utils/audioRecording';
import type { SpeakingAttempt, SpeakingEvaluation } from '../../types/exam';

type Phase = 'intro' | 'speaking' | 'marking' | 'result';
type Mode = 'exam' | 'practice';

export function SpeakingExercise() {
  const { taskId } = useParams<{ taskId: string }>();
  const task = taskId ? getSpeakingTask(taskId) : undefined;
  const apiKey = useConversationStore(s => s.geminiApiKey);
  const allAttempts = useExamStore(s => s.speakingAttempts);
  const addSpeakingAttempt = useExamStore(s => s.addSpeakingAttempt);
  const setSpeakingEvaluation = useExamStore(s => s.setSpeakingEvaluation);

  const [phase, setPhase] = useState<Phase>('intro');
  const [mode, setMode] = useState<Mode>('practice');
  const [attempt, setAttempt] = useState(0);
  const [recordings, setRecordings] = useState<(Recording | null)[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);

  if (!task) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <p className="text-muted">This speaking task doesn't exist.</p>
        <Link to="/exam"><Button className="mt-4">Back to DELF Prep</Button></Link>
      </div>
    );
  }

  const past = allAttempts.filter(a => a.taskId === task.id).reverse();
  const shown = currentId ? allAttempts.find(a => a.id === currentId) ?? null : null;
  const totalMinutes = task.parts.reduce((sum, p) => sum + p.speakMinutes, 0);
  const prepMinutes = task.parts.reduce((sum, p) => sum + p.prepMinutes, 0);

  function finished(recs: (Recording | null)[]) {
    if (!task) return;
    const attemptRecord: SpeakingAttempt = {
      id: `speaking-${Date.now()}`,
      taskId: task.id,
      date: todayString(),
      secondsPerPart: recs.map(r => Math.round(r?.seconds ?? 0)),
      evaluation: null,
    };
    addSpeakingAttempt(attemptRecord);
    if (past.length === 0) useProgressStore.getState().addXP(task.level === 'a1' || task.level === 'a2' ? 20 : 40);
    setRecordings(recs);
    setCurrentId(attemptRecord.id);
    setPhase('marking');
  }

  function evaluated(evaluation: SpeakingEvaluation) {
    if (currentId) setSpeakingEvaluation(currentId, evaluation);
    setPhase('result');
  }

  function again() {
    setRecordings([]);
    setCurrentId(null);
    setAttempt(a => a + 1);
    setPhase('intro');
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <div>
        <Link to="/exam" className="inline-flex items-center gap-0.5 text-sm font-medium mb-3 no-underline" style={{ color: 'var(--accent)' }}>
          <ChevronLeft size={18} strokeWidth={2.4} className="-ml-1.5" /> DELF Prep
        </Link>
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="chip text-xs">DELF {task.level.toUpperCase()}</span>
          <span className="chip text-xs">Production orale</span>
          <span className="chip text-xs">{task.parts.length} parties</span>
        </div>
        <h1 className="text-2xl font-bold text-primary">{task.title}</h1>
      </div>

      {phase === 'intro' && (
        <div className="space-y-4">
          <div className="card p-4 space-y-2">
            <ol className="text-sm text-primary space-y-1 list-decimal pl-5" lang="fr">
              {task.parts.map((p, i) => (
                <li key={i}>
                  {p.title} <span className="text-xs text-muted">· ≈ {formatMinutes(p.speakMinutes)}{p.prepMinutes ? ` · ${p.prepMinutes} min de préparation` : ''}</span>
                </li>
              ))}
            </ol>
            <p className="text-xs text-muted">
              About {Math.round(totalMinutes)} minutes of speaking, plus {prepMinutes} minutes' preparation. You need a microphone;
              your recordings stay on this device unless they're sent for marking.
            </p>
          </div>

          <div className="space-y-2">
            <div className="seg-control" role="tablist" aria-label="Mode">
              <button className="seg-item" role="tab" aria-pressed={mode === 'practice'} aria-selected={mode === 'practice'} onClick={() => setMode('practice')}>
                Practice
              </button>
              <button className="seg-item" role="tab" aria-pressed={mode === 'exam'} aria-selected={mode === 'exam'} onClick={() => setMode('exam')}>
                Exam conditions
              </button>
            </div>
            <p className="text-xs text-muted px-1">
              {mode === 'exam'
                ? 'French instructions only, the examiner’s lines are heard rather than read, and each part is done once.'
                : 'English help, checklists and useful phrases are available, and you can redo any part before marking.'}
            </p>
          </div>

          {!apiKey && (
            <p className="text-xs text-muted flex items-start gap-1.5 px-1">
              <Sparkles size={12} className="mt-0.5 flex-shrink-0" />
              <span>
                Add a Gemini API key in <Link to="/settings" style={{ color: 'var(--accent)' }}>Settings</Link> to have your
                recordings transcribed and marked, pronunciation included. Without one, you listen back and mark yourself.
              </span>
            </p>
          )}

          <Button onClick={() => setPhase('speaking')} className="w-full"><Mic size={15} /> Begin</Button>
        </div>
      )}

      {phase === 'speaking' && (
        <SpeakingSession key={attempt} task={task} examMode={mode === 'exam'} onComplete={finished} />
      )}

      {phase === 'marking' && (
        <SpeakingMarking task={task} recordings={recordings} apiKey={apiKey} onEvaluated={evaluated} />
      )}

      {phase === 'result' && shown?.evaluation && (
        <motion.div {...REVEAL} className="space-y-4">
          <SpeakingFeedback task={task} evaluation={shown.evaluation} recordings={recordings} />
          <Button variant="secondary" onClick={again} className="w-full"><Mic size={15} /> Try it again</Button>
        </motion.div>
      )}

      {phase === 'intro' && past.length > 0 && (
        <section>
          <div className="section-label">Previous attempts</div>
          <div className="inset-group">
            {past.map((a, i) => (
              <button
                key={a.id}
                type="button"
                disabled={!a.evaluation}
                onClick={() => { setRecordings([]); setCurrentId(a.id); setPhase('result'); }}
                className="inset-row w-full justify-between cursor-pointer text-left disabled:cursor-default"
                style={{ background: 'transparent', border: 'none', borderTop: i > 0 ? '0.5px solid var(--hairline)' : 'none' }}
              >
                <span className="text-sm text-primary">{a.date}</span>
                <span className="text-xs font-semibold text-secondary">
                  {a.evaluation
                    ? `${toOutOf25(a.evaluation.score, a.evaluation.maxScore)}/25 · ${a.evaluation.source === 'ai' ? 'AI' : 'self'}`
                    : 'Not marked'}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
