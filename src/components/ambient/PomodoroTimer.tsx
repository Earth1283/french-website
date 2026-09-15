import { useEffect, useRef, useState } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { Button } from '../ui/Button';
import { FlipText } from '../ui/FlipText';

type Mode = 'pomodoro' | 'break' | 'long';

const MODES: { id: Mode; label: string; minutes: number }[] = [
  { id: 'pomodoro', label: 'Pomodoro', minutes: 25 },
  { id: 'break', label: 'Break', minutes: 5 },
  { id: 'long', label: 'Long break', minutes: 15 },
];

function formatCountdown(total: number): string {
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function chime() {
  try {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const context = new AudioContextClass();
    [660, 880].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      oscillator.connect(gain);
      gain.connect(context.destination);
      const start = context.currentTime + index * 0.18;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.2, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.5);
      oscillator.start(start);
      oscillator.stop(start + 0.55);
    });
  } catch {
    return;
  }
}

export function PomodoroTimer({ onComplete }: { onComplete?: () => void }) {
  const [mode, setMode] = useState<Mode>('pomodoro');
  const [running, setRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(MODES[0].minutes * 60);
  const intervalRef = useRef<number | null>(null);

  const duration = MODES.find(candidate => candidate.id === mode)!.minutes * 60;

  const selectMode = (next: Mode) => {
    setMode(next);
    setRunning(false);
    setSecondsLeft(MODES.find(candidate => candidate.id === next)!.minutes * 60);
  };

  const reset = () => {
    setRunning(false);
    setSecondsLeft(duration);
  };

  useEffect(() => {
    if (!running) return;
    intervalRef.current = window.setInterval(() => {
      setSecondsLeft(previous => {
        if (previous <= 1) {
          window.clearInterval(intervalRef.current!);
          setRunning(false);
          chime();
          if (mode === 'pomodoro') onComplete?.();
          return 0;
        }
        return previous - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, mode]);

  const countdown = formatCountdown(secondsLeft);
  const status = running ? 'Focus' : secondsLeft === 0 ? 'Terminé !' : 'Paused';

  return (
    <div className="pomodoro">
      <div role="tablist" aria-label="Timer" className="board-tabs">
        {MODES.map(candidate => (
          <button
            key={candidate.id}
            type="button"
            role="tab"
            aria-selected={mode === candidate.id}
            onClick={() => selectMode(candidate.id)}
          >
            {candidate.label}
          </button>
        ))}
      </div>
      <div className="pomodoro__clock">
        <FlipText value={countdown} cells label={`${countdown} remaining`} />
        <p className="board__status mt-3" lang={secondsLeft === 0 ? 'fr' : undefined}>
          {status}
        </p>
      </div>
      <div className="flex flex-wrap gap-3 px-[18px] pb-5">
        <Button variant="primary" onClick={() => (secondsLeft === 0 ? reset() : setRunning(value => !value))}>
          {running ? <Pause size={20} aria-hidden="true" /> : <Play size={20} aria-hidden="true" />}
          {running ? 'Pause' : 'Start'}
        </Button>
        <Button variant="onEnamel" onClick={reset}>
          <RotateCcw size={20} aria-hidden="true" />
          Reset
        </Button>
      </div>
    </div>
  );
}
