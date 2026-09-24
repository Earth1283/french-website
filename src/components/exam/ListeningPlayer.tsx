import { useEffect, useRef, useState } from 'react';
import { Play, Square, Headphones, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/Button';
import { loadFrenchVoices, playScript, speechSupported, type PlaybackHandle, type ScriptLine } from '../../utils/speech';

interface ListeningPlayerProps {
  script: ScriptLine[];
  /** Plays allowed; null means unlimited (practice mode). */
  maxPlays: number | null;
  /** Practice mode lets the learner slow the audio down. */
  allowRateChange: boolean;
  onFirstPlay?: () => void;
  onPlaysChange?: (used: number) => void;
}

const RATES = [0.75, 0.9, 1] as const;

export function ListeningPlayer({ script, maxPlays, allowRateChange, onFirstPlay, onPlaysChange }: ListeningPlayerProps) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[] | null>(null);
  const [playing, setPlaying] = useState(false);
  const [used, setUsed] = useState(0);
  const [rate, setRate] = useState<number>(1);
  const [currentLine, setCurrentLine] = useState<number | null>(null);
  const handle = useRef<PlaybackHandle | null>(null);
  const supported = speechSupported();

  useEffect(() => {
    let alive = true;
    loadFrenchVoices().then(v => { if (alive) setVoices(v); });
    return () => {
      alive = false;
      handle.current?.cancel();
    };
  }, []);

  const exhausted = maxPlays !== null && used >= maxPlays;

  async function play() {
    if (playing || exhausted) return;
    const nextUsed = used + 1;
    if (used === 0) onFirstPlay?.();
    setUsed(nextUsed);
    onPlaysChange?.(nextUsed);
    setPlaying(true);
    handle.current = playScript(script, voices ?? [], {
      rate: allowRateChange ? rate : 1,
      onLine: setCurrentLine,
    });
    await handle.current.done;
    handle.current = null;
    setPlaying(false);
    setCurrentLine(null);
  }

  function stop() {
    handle.current?.cancel();
  }

  if (!supported) {
    return (
      <div className="card p-4 flex items-start gap-3">
        <AlertTriangle size={18} style={{ color: 'var(--danger)', flexShrink: 0 }} />
        <p className="text-sm text-secondary">
          This browser can't read French aloud (no speech synthesis). Answer from the transcript after submitting, or switch to
          Chrome, Edge or Safari.
        </p>
      </div>
    );
  }

  const speakers = new Set(script.map(l => l.speaker).filter(Boolean)).size;

  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-center gap-3">
        <span
          className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: 'var(--accent-tint)', color: 'var(--accent)' }}
        >
          <Headphones size={20} />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-primary">
            {playing
              ? currentLine !== null && script[currentLine]?.speaker
                ? `En cours… (${script[currentLine].speaker})`
                : 'En cours…'
              : exhausted
                ? 'Écoutes terminées'
                : used === 0
                  ? 'Prêt(e) ? Lisez d\'abord les questions.'
                  : maxPlays === null
                    ? 'Réécoutez autant que vous voulez'
                    : 'Pause — complétez vos réponses'}
          </p>
          <p className="text-xs text-muted">
            {maxPlays === null ? `Unlimited replays · played ${used}×` : `Écoute ${Math.min(used, maxPlays)} / ${maxPlays}`}
            {speakers > 1 && ` · ${speakers} voix`}
          </p>
        </div>
        {playing ? (
          <Button variant="secondary" size="sm" onClick={stop} aria-label="Stop audio">
            <Square size={14} /> Stop
          </Button>
        ) : (
          <Button size="sm" onClick={play} disabled={exhausted || voices === null} aria-label="Play audio">
            <Play size={14} /> {used === 0 ? 'Écouter' : 'Réécouter'}
          </Button>
        )}
      </div>

      {allowRateChange && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted">Speed</span>
          <div className="seg-control flex-1">
            {RATES.map(r => (
              <button key={r} className="seg-item" aria-pressed={rate === r} onClick={() => setRate(r)} disabled={playing}>
                {r === 1 ? 'Exam speed' : `${r}×`}
              </button>
            ))}
          </div>
        </div>
      )}

      {voices !== null && voices.length === 0 && (
        <p className="text-xs text-muted flex items-start gap-1.5">
          <AlertTriangle size={12} className="mt-0.5 flex-shrink-0" />
          No French voice is installed, so your browser may read this with an English accent. Add a French voice in your
          system's speech settings for realistic audio.
        </p>
      )}
      {voices !== null && voices.length === 1 && speakers > 1 && (
        <p className="text-xs text-muted">Only one French voice is installed — speakers are told apart by pitch.</p>
      )}
    </div>
  );
}
