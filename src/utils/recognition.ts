import { stopSpeaking } from './speech';

export type RecognitionError = 'unsupported' | 'not-allowed' | 'no-speech' | 'network' | 'aborted' | 'other';

interface RecognitionAlternative {
  transcript: string;
}

interface RecognitionResult {
  readonly length: number;
  readonly isFinal: boolean;
  [index: number]: RecognitionAlternative;
}

interface RecognitionEvent {
  readonly resultIndex: number;
  readonly results: { readonly length: number; [index: number]: RecognitionResult };
}

interface Recognition {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  onresult: ((e: RecognitionEvent) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

type RecognitionCtor = new () => Recognition;

function recognitionCtor(): RecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function recognitionSupported(): boolean {
  return recognitionCtor() !== null;
}

export class ListenError extends Error {
  constructor(public readonly code: RecognitionError) {
    super(code);
  }
}

export interface ListenHandle {
  readings: Promise<string[]>;
  stop: () => void;
  abort: () => void;
}

interface ListenOptions {
  lang?: string;
  onInterim?: (text: string) => void;
}

function errorCode(error: string): RecognitionError {
  if (error === 'not-allowed' || error === 'service-not-allowed' || error === 'audio-capture') return 'not-allowed';
  if (error === 'no-speech') return 'no-speech';
  if (error === 'network') return 'network';
  if (error === 'aborted') return 'aborted';
  return 'other';
}

function alternativeReadings(results: RecognitionResult[], max: number): string[] {
  const out: string[] = [];
  for (let k = 0; k < max; k++) {
    const text = results
      .map(r => r[Math.min(k, r.length - 1)]?.transcript.trim() ?? '')
      .filter(Boolean)
      .join(' ');
    if (text && !out.includes(text)) out.push(text);
  }
  return out;
}

export function listenOnce({ lang = 'fr-FR', onInterim }: ListenOptions = {}): ListenHandle {
  const Ctor = recognitionCtor();
  if (!Ctor) return { readings: Promise.reject(new ListenError('unsupported')), stop: () => {}, abort: () => {} };

  stopSpeaking();

  const rec = new Ctor();
  rec.lang = lang;
  rec.continuous = false;
  rec.interimResults = !!onInterim;
  rec.maxAlternatives = 5;

  const finals: RecognitionResult[] = [];
  let failure: RecognitionError | null = null;

  const readings = new Promise<string[]>((resolve, reject) => {
    rec.onresult = e => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finals[i] = r;
        else interim += r[0]?.transcript ?? '';
      }
      if (onInterim) onInterim([...finals.filter(Boolean).map(r => r[0]?.transcript ?? ''), interim].join(' ').trim());
    };
    rec.onerror = e => { failure = errorCode(e.error); };
    rec.onend = () => {
      const heard = alternativeReadings(finals.filter(Boolean), 5);
      if (heard.length > 0) resolve(heard);
      else reject(new ListenError(failure ?? 'no-speech'));
    };
  });

  try {
    rec.start();
  } catch {
    return { readings: Promise.reject(new ListenError('other')), stop: () => {}, abort: () => {} };
  }

  return {
    readings,
    stop: () => rec.stop(),
    abort: () => {
      failure = 'aborted';
      finals.length = 0;
      rec.abort();
    },
  };
}

export function listenErrorMessage(code: RecognitionError): string {
  switch (code) {
    case 'not-allowed':
      return 'Microphone blocked. Allow it in your browser’s site settings, or type instead.';
    case 'no-speech':
      return 'Didn’t catch that. Tap the mic and try again.';
    case 'network':
      return 'Speech recognition needs an internet connection. Type instead for now.';
    case 'unsupported':
      return 'This browser can’t listen. Try Chrome, Edge or Safari, or type instead.';
    default:
      return 'Couldn’t listen just now. Try again, or type instead.';
  }
}
