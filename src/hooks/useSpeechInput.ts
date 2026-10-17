import { useEffect, useRef, useState } from 'react';
import { listenOnce, ListenError, recognitionSupported, type ListenHandle, type RecognitionError } from '../utils/recognition';
import { useSpeechStore } from '../stores/speechStore';

export function useSpeechInput(onHeard: (readings: string[]) => void) {
  const micEnabled = useSpeechStore(s => s.micEnabled);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');
  const [error, setError] = useState<RecognitionError | null>(null);
  const handle = useRef<ListenHandle | null>(null);
  const onHeardRef = useRef(onHeard);
  onHeardRef.current = onHeard;

  useEffect(() => () => handle.current?.abort(), []);

  const start = () => {
    handle.current?.abort();
    setError(null);
    setInterim('');
    setListening(true);
    const h = listenOnce({ onInterim: setInterim });
    handle.current = h;
    h.readings
      .then(readings => { if (handle.current === h) onHeardRef.current(readings); })
      .catch((err: unknown) => {
        const code = err instanceof ListenError ? err.code : 'other';
        if (handle.current === h && code !== 'aborted') setError(code);
      })
      .finally(() => {
        if (handle.current !== h) return;
        handle.current = null;
        setListening(false);
        setInterim('');
      });
  };

  const stop = () => handle.current?.stop();

  return {
    available: micEnabled && recognitionSupported(),
    listening,
    interim,
    error,
    toggle: () => (handle.current ? stop() : start()),
    clearError: () => setError(null),
  };
}
