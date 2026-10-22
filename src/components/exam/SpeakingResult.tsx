import { useEffect, useRef, useState } from 'react';
import { Sparkles, BookOpenCheck, AlertTriangle, ChevronDown } from 'lucide-react';
import { RubricScorecard } from './RubricScorecard';
import { formatClock } from './WritingWorkspace';
import { Button } from '../ui/Button';
import { SPEAKING_CRITERIA, buildSpeakingEvaluation, speakingGrid } from '../../data/exam/rubric';
import { evaluateSpeaking, expectedSpeakingSeconds } from '../../lib/gemini';
import { recordingsForMarking, type Recording } from '../../utils/audioRecording';
import type { RubricBand, SpeakingCriterionId, SpeakingEvaluation, SpeakingTask } from '../../types/exam';

const MIDDLE_BANDS = Object.fromEntries(SPEAKING_CRITERIA.map(c => [c.id, 2])) as Record<SpeakingCriterionId, RubricBand>;

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

function RecordingPlayer({ recording }: { recording: Recording }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    const u = URL.createObjectURL(recording.blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [recording]);
  return url ? <audio controls src={url} className="w-full" /> : null;
}

interface SpeakingMarkingProps {
  task: SpeakingTask;
  recordings: (Recording | null)[];
  apiKey: string;
  onEvaluated: (evaluation: SpeakingEvaluation) => void;
}

export function SpeakingMarking({ task, recordings, apiKey, onEvaluated }: SpeakingMarkingProps) {
  const [mode, setMode] = useState<'ai' | 'self'>(apiKey ? 'ai' : 'self');
  const [error, setError] = useState<string | null>(null);
  const [bands, setBands] = useState(MIDDLE_BANDS);
  const started = useRef(false);
  const seconds = recordings.map(r => r?.seconds ?? 0);
  const spoken = seconds.reduce((a, b) => a + b, 0);

  useEffect(() => {
    if (mode !== 'ai' || started.current) return;
    started.current = true;
    (async () => {
      try {
        const audio = await recordingsForMarking(recordings);
        const evaluation = await evaluateSpeaking(apiKey, task, audio.map((a, i) => ({
          audio: a && { mimeType: a.mimeType, data: a.data },
          seconds: seconds[i],
        })));
        onEvaluated(evaluation);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not reach Gemini.');
        setMode('self');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  if (mode === 'ai') {
    return (
      <div className="card p-8 text-center space-y-2">
        <Sparkles size={22} className="mx-auto" style={{ color: 'var(--accent)' }} />
        <p className="text-sm text-secondary">Listening and marking against the DELF {task.level.toUpperCase()} grid…</p>
        <p className="text-xs text-muted">This can take up to a minute for a long paper.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="card p-3 flex items-start gap-2">
          <AlertTriangle size={16} style={{ color: 'var(--danger)', flexShrink: 0 }} />
          <p className="text-xs text-secondary">AI marking failed ({error}). Listen back and mark yourself below.</p>
        </div>
      )}
      <div className="card p-4 space-y-2">
        <p className="text-sm font-semibold text-primary flex items-center gap-1.5">
          <BookOpenCheck size={15} /> Mark yourself
        </p>
        <p className="text-xs text-secondary">
          Listen to each part next to the sample answer, then place yourself on each criterion. Be strict: “at level” means an
          examiner would have nothing to object to for {task.level.toUpperCase()}.
        </p>
      </div>
      {task.parts.map((part, i) => (
        <Disclosure key={i} title={`Partie ${i + 1} · ${part.title}`} defaultOpen={i === 0}>
          <div className="space-y-3">
            {recordings[i] ? (
              <>
                <p className="text-xs text-muted">Your recording · {formatClock(Math.round(seconds[i]))}</p>
                <RecordingPlayer recording={recordings[i]!} />
              </>
            ) : (
              <p className="text-xs text-muted">Not recorded.</p>
            )}
            <ul className="text-xs text-secondary space-y-0.5 list-disc pl-5">
              {part.checklist.map(c => <li key={c}>{c}</li>)}
            </ul>
            <div>
              <p className="text-xs font-semibold text-muted mb-1">Sample answer</p>
              <p className="text-sm text-primary whitespace-pre-wrap leading-relaxed" lang="fr">{part.modelAnswer}</p>
            </div>
          </div>
        </Disclosure>
      ))}
      <RubricScorecard
        level={task.level}
        grid={speakingGrid(task.level)}
        bands={bands}
        onBandChange={(id, band) => setBands(b => ({ ...b, [id]: band }))}
      />
      <Button
        onClick={() => onEvaluated(buildSpeakingEvaluation('self', bands, spoken, expectedSpeakingSeconds(task)))}
        className="w-full"
      >
        Save my marks
      </Button>
    </div>
  );
}

interface SpeakingFeedbackProps {
  task: SpeakingTask;
  evaluation: SpeakingEvaluation;
  /** Only while the recordings are still in memory. */
  recordings?: (Recording | null)[];
}

export function SpeakingFeedback({ task, evaluation, recordings }: SpeakingFeedbackProps) {
  return (
    <div className="space-y-4">
      <RubricScorecard level={task.level} grid={speakingGrid(task.level)} evaluation={evaluation} />
      {evaluation.source === 'ai' && (
        <p className="text-[0.7rem] text-muted px-1">
          AI marking is an estimate. On the day, two examiners mark you live.
        </p>
      )}
      {evaluation.summary && (
        <div className="card p-4">
          <p className="text-sm font-semibold text-primary mb-1">Overall</p>
          <p className="text-sm text-secondary">{evaluation.summary}</p>
        </div>
      )}
      {evaluation.corrections && evaluation.corrections.length > 0 && (
        <div className="card p-4 space-y-3">
          <p className="text-sm font-semibold text-primary">Corrections</p>
          {evaluation.corrections.map((c, i) => (
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
      {task.parts.map((part, i) => (
        <Disclosure key={i} title={`Partie ${i + 1} · ${part.title}`}>
          <div className="space-y-3">
            {recordings?.[i] && <RecordingPlayer recording={recordings[i]!} />}
            {evaluation.transcripts?.[i] && (
              <div>
                <p className="text-xs font-semibold text-muted mb-1">What the marker heard</p>
                <p className="text-sm text-primary whitespace-pre-wrap leading-relaxed" lang="fr">{evaluation.transcripts[i]}</p>
              </div>
            )}
            <div>
              <p className="text-xs font-semibold text-muted mb-1">Sample answer</p>
              <p className="text-sm text-primary whitespace-pre-wrap leading-relaxed" lang="fr">{part.modelAnswer}</p>
            </div>
          </div>
        </Disclosure>
      ))}
    </div>
  );
}
