import { useEffect, useRef, useState } from 'react';
import { Mic, Square, RotateCcw, ChevronRight, Timer, Volume2, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/Button';
import { formatClock } from './WritingWorkspace';
import {
  PartRecorder, RecorderStartError, recorderErrorMessage, recordingSupported, type RecorderError, type Recording,
} from '../../utils/audioRecording';
import { loadFrenchVoices, playScript, speechSupported, stopSpeaking, type PlaybackHandle } from '../../utils/speech';
import type { SpeakingPart, SpeakingTask } from '../../types/exam';

interface SpeakingSessionProps {
  task: SpeakingTask;
  /** Exam conditions: no English, no checklists or phrases, no redoing a part. */
  examMode: boolean;
  onComplete: (recordings: (Recording | null)[]) => void;
}

type Phase = 'brief' | 'prep' | 'speaking' | 'review';

/** 2.5 → "2 min 30", the way a French paper writes it. */
export function formatMinutes(minutes: number): string {
  const whole = Math.floor(minutes);
  const seconds = Math.round((minutes - whole) * 60);
  return seconds ? `${whole} min ${seconds}` : `${whole} min`;
}

export function SpeakingSession({ task, examMode, onComplete }: SpeakingSessionProps) {
  const [partIndex, setPartIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('brief');
  const [recordings, setRecordings] = useState<(Recording | null)[]>(() => task.parts.map(() => null));
  const [notes, setNotes] = useState('');
  const part = task.parts[partIndex];
  const isLast = partIndex === task.parts.length - 1;

  function finishPart(recording: Recording | null) {
    const next = recordings.map((r, i) => (i === partIndex ? recording : r));
    setRecordings(next);
    if (examMode) advance(next);
    else setPhase('review');
  }

  function advance(all = recordings) {
    if (isLast) {
      onComplete(all);
      return;
    }
    setPartIndex(i => i + 1);
    setPhase('brief');
  }

  return (
    <div className="space-y-4">
      <ol className="flex gap-1.5 list-none p-0 m-0" aria-label="Parts">
        {task.parts.map((p, i) => (
          <li
            key={i}
            className="h-1.5 flex-1 rounded-full"
            aria-label={`Part ${i + 1}: ${p.title}${i < partIndex ? ' (done)' : i === partIndex ? ' (current)' : ''}`}
            style={{ backgroundColor: i <= partIndex ? 'var(--accent)' : 'var(--bg-inset)', opacity: i < partIndex ? 0.5 : 1 }}
          />
        ))}
      </ol>

      <PartBrief part={part} index={partIndex} examMode={examMode} />

      {(phase === 'prep' || (notes && phase !== 'brief')) && (
        <div className="card p-4 space-y-2">
          <label htmlFor="speaking-notes" className="text-sm font-semibold text-primary">Notes</label>
          <textarea
            id="speaking-notes"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={4}
            lang="fr"
            placeholder="Jot down keywords and your plan. You can look at them while you speak."
            className="w-full text-sm rounded-xl p-3 resize-y"
            style={{ background: 'var(--bg-inset)', border: '0.5px solid var(--hairline)', color: 'var(--text-primary)' }}
          />
        </div>
      )}

      {phase === 'brief' && (
        <div className="flex gap-2 flex-wrap">
          {part.prepMinutes > 0 ? (
            <>
              <Button onClick={() => setPhase('prep')} className="flex-1">
                <Timer size={15} /> Start {part.prepMinutes} min preparation
              </Button>
              {!examMode && (
                <Button variant="secondary" onClick={() => setPhase('speaking')}>Skip</Button>
              )}
            </>
          ) : (
            <Button onClick={() => setPhase('speaking')} className="w-full">
              <Mic size={15} /> {part.examinerLines.length ? 'Start — the examiner speaks first' : 'Start speaking'}
            </Button>
          )}
        </div>
      )}

      {phase === 'prep' && <PrepTimer minutes={part.prepMinutes} onDone={() => setPhase('speaking')} />}

      {phase === 'speaking' && (
        <PartRecorderPanel key={partIndex} part={part} examMode={examMode} onFinish={finishPart} />
      )}

      {phase === 'review' && (
        <PartReview
          recording={recordings[partIndex]}
          isLast={isLast}
          onRedo={() => setPhase('speaking')}
          onNext={() => advance()}
        />
      )}
    </div>
  );
}

function PartBrief({ part, index, examMode }: { part: SpeakingPart; index: number; examMode: boolean }) {
  const [showEnglish, setShowEnglish] = useState(false);
  return (
    <div className="card p-4 space-y-3">
      <div>
        <p className="text-xs font-semibold text-muted uppercase tracking-wide">Partie {index + 1} · ≈ {formatMinutes(part.speakMinutes)}</p>
        <p className="text-lg font-bold text-primary">{part.title}</p>
      </div>
      <p className="text-[0.95rem] text-primary leading-relaxed" lang="fr">{part.consigne}</p>
      {!examMode && (
        <>
          <button
            type="button"
            onClick={() => setShowEnglish(s => !s)}
            className="text-xs font-medium cursor-pointer"
            style={{ background: 'transparent', border: 'none', color: 'var(--accent)', padding: 0 }}
          >
            {showEnglish ? 'Hide English' : 'Show in English'}
          </button>
          {showEnglish && <p className="text-sm text-secondary">{part.instructionsEn}</p>}
        </>
      )}
      {part.document && (
        <div className="rounded-xl p-3 text-sm text-primary whitespace-pre-wrap leading-relaxed" lang="fr" style={{ background: 'var(--bg-inset)' }}>
          {part.document}
        </div>
      )}
      {part.cueCards && (
        <div className="flex flex-wrap gap-1.5">
          {part.cueCards.map(c => <span key={c} className="chip text-sm" lang="fr">{c}</span>)}
        </div>
      )}
      {!examMode && (
        <details className="text-sm">
          <summary className="cursor-pointer font-semibold text-primary">What the examiner looks for · useful phrases</summary>
          <ul className="text-sm text-secondary space-y-1 list-disc pl-5 mt-2">
            {part.checklist.map(c => <li key={c}>{c}</li>)}
          </ul>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {part.usefulPhrases.map(p => <span key={p} className="chip text-xs" lang="fr">{p}</span>)}
          </div>
        </details>
      )}
    </div>
  );
}

function PrepTimer({ minutes, onDone }: { minutes: number; onDone: () => void }) {
  const [left, setLeft] = useState(minutes * 60);
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => {
    const id = setInterval(() => setLeft(l => l - 1), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (left <= 0) done.current();
  }, [left]);

  return (
    <div className="card p-4 flex items-center justify-between gap-3">
      <div>
        <p className="text-xs text-muted">Preparation</p>
        <p className="text-2xl font-bold text-primary tabular-nums" aria-live="off">{formatClock(Math.max(0, left))}</p>
      </div>
      <Button onClick={onDone}>I'm ready <ChevronRight size={15} /></Button>
    </div>
  );
}

interface PanelProps {
  part: SpeakingPart;
  examMode: boolean;
  onFinish: (recording: Recording | null) => void;
}

/** Records one part, pausing while the examiner's lines are read aloud. */
function PartRecorderPanel({ part, examMode, onFinish }: PanelProps) {
  const recorder = useRef<PartRecorder | null>(null);
  const playback = useRef<PlaybackHandle | null>(null);
  const voices = useRef<SpeechSynthesisVoice[]>([]);
  const [error, setError] = useState<RecorderError | null>(null);
  const [started, setStarted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [line, setLine] = useState(-1);
  const [examinerSpeaking, setExaminerSpeaking] = useState(false);
  const [showText, setShowText] = useState(!examMode || !speechSupported());
  const [stopping, setStopping] = useState(false);
  const lines = part.examinerLines;
  const target = part.speakMinutes * 60;

  useEffect(() => {
    loadFrenchVoices().then(v => { voices.current = v; });
    return () => {
      playback.current?.cancel();
      recorder.current?.discard();
    };
  }, []);

  useEffect(() => {
    if (!started) return;
    const id = setInterval(() => setElapsed(recorder.current?.elapsed() ?? 0), 250);
    return () => clearInterval(id);
  }, [started]);

  async function sayLine(index: number) {
    setLine(index);
    if (!speechSupported()) return;
    recorder.current?.pause();
    setExaminerSpeaking(true);
    playback.current?.cancel();
    const handle = playScript([{ speaker: 'Examinateur', text: lines[index] }], voices.current, { rate: 0.95 });
    playback.current = handle;
    await handle.done;
    if (playback.current !== handle) return;
    setExaminerSpeaking(false);
    recorder.current?.resume();
  }

  async function begin() {
    setError(null);
    const r = new PartRecorder();
    try {
      await r.start();
    } catch (err) {
      setError(err instanceof RecorderStartError ? err.code : 'other');
      return;
    }
    recorder.current = r;
    setStarted(true);
    if (lines.length) sayLine(0);
  }

  async function finish() {
    setStopping(true);
    playback.current?.cancel();
    stopSpeaking();
    const recording = await recorder.current?.stop();
    recorder.current = null;
    onFinish(recording && recording.blob.size > 0 ? recording : null);
  }

  if (!recordingSupported()) {
    return (
      <div className="card p-4 space-y-3">
        <p className="text-sm text-secondary flex items-start gap-2">
          <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--danger)' }} />
          {recorderErrorMessage('unsupported')}
        </p>
        <Button variant="secondary" onClick={() => onFinish(null)} className="w-full">Skip this part</Button>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="card p-4 space-y-3">
        {error && (
          <p className="text-sm text-secondary flex items-start gap-2">
            <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--danger)' }} />
            {recorderErrorMessage(error)}
          </p>
        )}
        <p className="text-xs text-muted">
          {lines.length
            ? 'The examiner’s lines are read aloud and recording pauses while they speak. Answer, then tap Next for the next line.'
            : `Speak for about ${formatMinutes(part.speakMinutes)}. Recording starts when you tap the button.`}
        </p>
        <Button onClick={begin} className="w-full"><Mic size={15} /> {error ? 'Try again' : 'Start recording'}</Button>
        {error && (
          <Button variant="secondary" onClick={() => onFinish(null)} className="w-full">Skip this part</Button>
        )}
      </div>
    );
  }

  const answeredAll = line >= lines.length - 1;
  const overTime = elapsed > target;

  return (
    <div className="card p-4 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: examinerSpeaking ? 'var(--text-muted)' : 'var(--danger)' }}
            aria-hidden
          />
          <span className="text-sm font-semibold text-primary" aria-live="polite">
            {examinerSpeaking ? 'Examiner speaking…' : 'Recording'}
          </span>
        </div>
        <span className="text-sm tabular-nums" style={{ color: overTime ? 'var(--accent)' : 'var(--text-secondary)' }}>
          {formatClock(Math.floor(elapsed))} / {formatClock(target)}
        </span>
      </div>

      {lines.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-muted">Examinateur · {line + 1}/{lines.length}</p>
            {speechSupported() && (
              <button
                type="button"
                onClick={() => setShowText(s => !s)}
                className="text-xs font-medium inline-flex items-center gap-1 cursor-pointer"
                style={{ background: 'transparent', border: 'none', color: 'var(--accent)', padding: 0 }}
              >
                {showText ? <EyeOff size={12} /> : <Eye size={12} />} {showText ? 'Hide text' : 'Show text'}
              </button>
            )}
          </div>
          {showText ? (
            <p className="text-[0.95rem] text-primary rounded-xl p-3" lang="fr" style={{ background: 'var(--bg-inset)' }}>
              {lines[line]}
            </p>
          ) : (
            <p className="text-sm text-muted rounded-xl p-3" style={{ background: 'var(--bg-inset)' }}>
              Listen to the examiner, then answer.
            </p>
          )}
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => sayLine(line)} disabled={examinerSpeaking}>
              <Volume2 size={14} /> Repeat
            </Button>
            {!answeredAll && (
              <Button size="sm" onClick={() => sayLine(line + 1)} disabled={examinerSpeaking} className="flex-1">
                Next <ChevronRight size={14} />
              </Button>
            )}
          </div>
        </div>
      )}

      {overTime && (
        <p className="text-xs text-secondary">You’ve reached the suggested time. Round off and finish when you’re ready.</p>
      )}

      <Button
        variant={lines.length && !answeredAll ? 'secondary' : 'primary'}
        onClick={finish}
        disabled={stopping}
        className="w-full"
      >
        <Square size={13} fill="currentColor" /> Finish this part
      </Button>
    </div>
  );
}

function PartReview({ recording, isLast, onRedo, onNext }: { recording: Recording | null; isLast: boolean; onRedo: () => void; onNext: () => void }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!recording) return;
    const u = URL.createObjectURL(recording.blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [recording]);

  return (
    <div className="card p-4 space-y-3">
      {recording ? (
        <>
          <p className="text-sm font-semibold text-primary">Your recording · {formatClock(Math.round(recording.seconds))}</p>
          {url && <audio controls src={url} className="w-full" />}
        </>
      ) : (
        <p className="text-sm text-secondary">Nothing was recorded for this part.</p>
      )}
      <div className="flex gap-2">
        <Button variant="secondary" onClick={onRedo}><RotateCcw size={14} /> Redo</Button>
        <Button onClick={onNext} className="flex-1">
          {isLast ? 'Finish and mark' : 'Next part'} <ChevronRight size={15} />
        </Button>
      </div>
    </div>
  );
}
