import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw } from 'lucide-react';

type Mode = 'pomodoro' | 'break' | 'long';

const MODES: { id: Mode; label: string; minutes: number }[] = [
  { id: 'pomodoro', label: 'Pomodoro', minutes: 25 },
  { id: 'break', label: 'Break', minutes: 5 },
  { id: 'long', label: 'Long break', minutes: 15 },
];

function fmt(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

/** Soft two-note chime via Web Audio (no asset needed). */
function chime() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    [660, 880].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = freq;
      osc.type = 'sine';
      osc.connect(gain);
      gain.connect(ctx.destination);
      const t = ctx.currentTime + i * 0.18;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.2, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
      osc.start(t);
      osc.stop(t + 0.55);
    });
  } catch {
    /* audio not available — silently skip */
  }
}

/** Ambient Pomodoro study timer. Calls onComplete when a focus session finishes. */
export function PomodoroTimer({ onComplete }: { onComplete?: () => void }) {
  const [mode, setMode] = useState<Mode>('pomodoro');
  const [running, setRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(MODES[0].minutes * 60);
  const intervalRef = useRef<number | null>(null);

  const duration = MODES.find(m => m.id === mode)!.minutes * 60;

  const selectMode = (next: Mode) => {
    setMode(next);
    setRunning(false);
    setSecondsLeft(MODES.find(m => m.id === next)!.minutes * 60);
  };

  const reset = () => {
    setRunning(false);
    setSecondsLeft(duration);
  };

  useEffect(() => {
    if (!running) return;
    intervalRef.current = window.setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          window.clearInterval(intervalRef.current!);
          setRunning(false);
          chime();
          if (mode === 'pomodoro') onComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, mode]);

  const progress = 1 - secondsLeft / duration;
  const R = 130;
  const C = 2 * Math.PI * R;

  return (
    <div className="flex flex-col items-center gap-6 text-white">
      {/* Mode segmented control on glass */}
      <div className="flex gap-1 rounded-full border border-white/15 bg-white/10 p-1 backdrop-blur-md">
        {MODES.map(m => (
          <button
            key={m.id}
            type="button"
            onClick={() => selectMode(m.id)}
            aria-pressed={mode === m.id}
            className="relative rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors"
            style={{ color: mode === m.id ? '#1a1a1a' : 'rgba(255,255,255,0.75)' }}
          >
            {mode === m.id && (
              <motion.span
                layoutId="pomo-seg"
                className="absolute inset-0 rounded-full bg-white"
                transition={{ type: 'spring', damping: 26, stiffness: 380 }}
              />
            )}
            <span className="relative z-10">{m.label}</span>
          </button>
        ))}
      </div>

      {/* Ring + countdown */}
      <div className="relative flex items-center justify-center">
        <svg width="300" height="300" className="-rotate-90">
          <circle cx="150" cy="150" r={R} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="6" />
          <circle
            cx="150"
            cy="150"
            r={R}
            fill="none"
            stroke="white"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - progress)}
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <div className="absolute text-center">
          <div className="text-[3.75rem] font-extralight tabular-nums leading-none" style={{ letterSpacing: '-0.02em' }}>
            {fmt(secondsLeft)}
          </div>
          <div className="mt-1 text-xs uppercase tracking-[0.18em] text-white/55">
            {running ? 'Focus' : secondsLeft === 0 ? 'Terminé !' : 'Paused'}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => (secondsLeft === 0 ? reset() : setRunning(r => !r))}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-neutral-900 shadow-lg"
          aria-label={running ? 'Pause' : 'Start'}
        >
          {running ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" className="ml-0.5" />}
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={reset}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white/85 backdrop-blur-md"
          aria-label="Reset"
        >
          <RotateCcw size={17} />
        </motion.button>
      </div>
    </div>
  );
}
