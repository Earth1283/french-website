import { Fragment, useEffect, useRef, useState } from 'react';
import { Volume2 } from 'lucide-react';
import { loadFrenchVoices, playScript, speakerOrderOf, speechSupported, type PlaybackHandle, type ScriptLine } from '../../utils/speech';
import { matchWords, type WordMatch } from '../../utils/spokenAnswer';
import { listenErrorMessage } from '../../utils/recognition';
import { useSpeechInput } from '../../hooks/useSpeechInput';
import { MicButton } from '../ui/MicButton';

interface Attempt {
  words: WordMatch[];
  score: number;
}

/** The transcript, revealed after answering, with each line replayable on its own. */
export function Transcript({ script }: { script: ScriptLine[] }) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [playingLine, setPlayingLine] = useState<number | null>(null);
  const [shadowLine, setShadowLine] = useState<number | null>(null);
  const [attempts, setAttempts] = useState<Record<number, Attempt>>({});
  const handle = useRef<PlaybackHandle | null>(null);

  const mic = useSpeechInput(readings => {
    if (shadowLine === null) return;
    const best = readings
      .map(heard => matchWords(script[shadowLine].text, heard))
      .reduce((a, b) => (b.score > a.score ? b : a));
    setAttempts(prev => ({ ...prev, [shadowLine]: best }));
  });

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

  function shadow(i: number) {
    if (mic.listening && shadowLine === i) {
      mic.toggle();
      return;
    }
    handle.current?.cancel();
    setShadowLine(i);
    mic.toggle();
  }

  return (
    <div className="card p-4 space-y-2.5">
      {mic.available && (
        <p className="text-xs text-muted pb-1">
          Shadowing: play a line, then tap the mic and say it back. Words you missed stay highlighted.
        </p>
      )}
      {script.map((line, i) => {
        const attempt = attempts[i];
        return (
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
            <div className="flex-1 min-w-0">
              <p className="text-sm text-primary leading-relaxed" lang="fr">
                {line.speaker && <strong className="text-secondary">{line.speaker} : </strong>}
                {attempt
                  ? attempt.words.map((w, wi) => (
                      <Fragment key={wi}>
                        {wi > 0 && ' '}
                        <span style={w.heard ? undefined : { color: 'var(--danger)', textDecoration: 'underline dotted', textUnderlineOffset: 3 }}>
                          {w.text}
                        </span>
                      </Fragment>
                    ))
                  : line.text}
              </p>
              {mic.listening && shadowLine === i && (
                <p className="text-xs text-muted mt-0.5" lang="fr">{mic.interim || 'Listening…'}</p>
              )}
              {attempt && !(mic.listening && shadowLine === i) && (
                <p className="text-xs mt-0.5" style={{ color: attempt.score === 1 ? 'var(--success)' : 'var(--text-muted)' }}>
                  {attempt.score === 1 ? 'Every word. Parfait.' : `${Math.round(attempt.score * 100)}% of the words`}
                </p>
              )}
              {mic.error && shadowLine === i && !mic.listening && (
                <p className="text-xs text-muted mt-0.5" role="status">{listenErrorMessage(mic.error)}</p>
              )}
            </div>
            {mic.available && (
              <MicButton
                listening={mic.listening && shadowLine === i}
                onClick={() => shadow(i)}
                disabled={mic.listening && shadowLine !== i}
                idleLabel={`Repeat line ${i + 1}`}
                diameter={28}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
