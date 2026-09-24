export function speak(text: string, lang = 'fr-FR'): void {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang;
  utter.rate = 0.85;
  window.speechSynthesis.speak(utter);
}

export function speechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/**
 * Voices load asynchronously in Chrome, so the first getVoices() call often
 * returns []. Waits for voiceschanged, but never longer than `timeoutMs`.
 */
export function loadFrenchVoices(timeoutMs = 1500): Promise<SpeechSynthesisVoice[]> {
  if (!speechSupported()) return Promise.resolve([]);
  const pick = () => window.speechSynthesis.getVoices().filter(v => v.lang.toLowerCase().startsWith('fr'));
  const now = pick();
  if (now.length > 0) return Promise.resolve(now);
  return new Promise(resolve => {
    const done = () => {
      window.speechSynthesis.removeEventListener('voiceschanged', done);
      clearTimeout(timer);
      resolve(pick());
    };
    const timer = setTimeout(done, timeoutMs);
    window.speechSynthesis.addEventListener('voiceschanged', done);
  });
}

/**
 * Chrome silently stops an utterance after roughly 15 seconds, so long lines
 * are read sentence by sentence.
 */
export function splitForSpeech(text: string, maxLen = 180): string[] {
  const sentences = text.match(/[^.!?…]+[.!?…]+["»)]*\s*|[^.!?…]+$/g) ?? [text];
  const chunks: string[] = [];
  for (const raw of sentences) {
    const s = raw.trim();
    if (!s) continue;
    if (s.length <= maxLen) {
      chunks.push(s);
      continue;
    }
    // A very long sentence: break at commas/semicolons instead.
    let current = '';
    for (const part of s.split(/(?<=[,;:])\s+/)) {
      if (current && (current + ' ' + part).length > maxLen) {
        chunks.push(current);
        current = part;
      } else {
        current = current ? `${current} ${part}` : part;
      }
    }
    if (current) chunks.push(current);
  }
  return chunks;
}

export interface ScriptLine {
  speaker?: string;
  text: string;
}

export interface PlaybackHandle {
  /** Resolves 'ended' after the last line, 'cancelled' if stopped, 'unsupported' without speech synthesis. */
  done: Promise<'ended' | 'cancelled' | 'unsupported'>;
  cancel: () => void;
}

interface PlayOptions {
  rate?: number;
  /** Silence between speaker turns, in ms. */
  gapMs?: number;
  onLine?: (index: number) => void;
  /** Fixes which voice each speaker gets, so replaying one line keeps its voice. */
  speakerOrder?: string[];
}

export function speakerOrderOf(lines: ScriptLine[]): string[] {
  return [...new Set(lines.map(l => l.speaker ?? ''))];
}

// With only one French voice installed (common on Windows and Android),
// speakers are told apart by pitch instead.
const PITCHES = [1, 0.8, 1.2, 0.9];

/** Reads a script aloud line by line, giving each speaker a distinct voice or pitch. */
export function playScript(lines: ScriptLine[], voices: SpeechSynthesisVoice[], opts: PlayOptions = {}): PlaybackHandle {
  if (!speechSupported()) return { done: Promise.resolve('unsupported'), cancel: () => {} };

  const synth = window.speechSynthesis;
  const rate = opts.rate ?? 1;
  const gapMs = opts.gapMs ?? 450;
  let cancelled = false;
  let wake: (() => void) | null = null;

  const speakers = opts.speakerOrder ?? speakerOrderOf(lines);
  const voiceFor = (speaker: string) => {
    const i = speakers.indexOf(speaker);
    return {
      voice: voices.length > 0 ? voices[i % voices.length] : undefined,
      pitch: voices.length > i ? 1 : PITCHES[i % PITCHES.length],
    };
  };

  const say = (text: string, speaker: string) =>
    new Promise<void>(resolve => {
      const utter = new SpeechSynthesisUtterance(text);
      const { voice, pitch } = voiceFor(speaker);
      utter.lang = voice?.lang ?? 'fr-FR';
      if (voice) utter.voice = voice;
      utter.pitch = pitch;
      utter.rate = rate;
      // Some engines never fire onend; fall back on a generous length estimate.
      const safety = setTimeout(finish, (text.length / (12 * rate)) * 1000 + 4000);
      function finish() {
        clearTimeout(safety);
        wake = null;
        resolve();
      }
      wake = finish;
      utter.onend = finish;
      utter.onerror = finish;
      synth.speak(utter);
    });

  const pause = (ms: number) =>
    new Promise<void>(resolve => {
      const t = setTimeout(() => { wake = null; resolve(); }, ms);
      wake = () => { clearTimeout(t); wake = null; resolve(); };
    });

  const run = async (): Promise<'ended' | 'cancelled'> => {
    synth.cancel();
    for (let i = 0; i < lines.length; i++) {
      if (cancelled) return 'cancelled';
      opts.onLine?.(i);
      for (const chunk of splitForSpeech(lines[i].text)) {
        if (cancelled) return 'cancelled';
        await say(chunk, lines[i].speaker ?? '');
      }
      if (i < lines.length - 1) await pause(lines[i + 1].speaker !== lines[i].speaker ? gapMs : gapMs / 3);
    }
    return cancelled ? 'cancelled' : 'ended';
  };

  return {
    done: run(),
    cancel: () => {
      cancelled = true;
      synth.cancel();
      wake?.();
    },
  };
}
