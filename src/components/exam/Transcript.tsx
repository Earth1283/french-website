import { useEffect, useRef, useState } from 'react';
import { Volume2 } from 'lucide-react';
import { loadFrenchVoices, playScript, speakerOrderOf, speechSupported, type PlaybackHandle, type ScriptLine } from '../../utils/speech';

/** The transcript, revealed after answering, with each line replayable on its own. */
export function Transcript({ script }: { script: ScriptLine[] }) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [playingLine, setPlayingLine] = useState<number | null>(null);
  const handle = useRef<PlaybackHandle | null>(null);

  useEffect(() => {
    loadFrenchVoices().then(setVoices);
    return () => handle.current?.cancel();
  }, []);

  async function playLine(i: number) {
    handle.current?.cancel();
    setPlayingLine(i);
    handle.current = playScript([script[i]], voices, { speakerOrder: speakerOrderOf(script) });
    await handle.current.done;
    setPlayingLine(p => (p === i ? null : p));
  }

  return (
    <div className="card p-4 space-y-2.5">
      {script.map((line, i) => (
        <div key={i} className="flex items-start gap-2">
          {speechSupported() && (
            <button
              type="button"
              onClick={() => playLine(i)}
              aria-label={`Replay line ${i + 1}`}
              className="w-7 h-7 flex items-center justify-center rounded-full flex-shrink-0 cursor-pointer ios-press"
              style={{
                background: playingLine === i ? 'var(--accent-tint)' : 'transparent',
                border: 'none',
                color: playingLine === i ? 'var(--accent)' : 'var(--text-muted)',
              }}
            >
              <Volume2 size={14} />
            </button>
          )}
          <p className="text-sm text-primary leading-relaxed flex-1" lang="fr">
            {line.speaker && <strong className="text-secondary">{line.speaker} : </strong>}
            {line.text}
          </p>
        </div>
      ))}
    </div>
  );
}
