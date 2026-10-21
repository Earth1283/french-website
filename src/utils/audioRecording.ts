// Microphone recording for the speaking exam. MediaRecorder works in every
// current browser (unlike speech recognition), but each one records in its own
// container — WebM in Chrome, Ogg in Firefox, MP4 in Safari — and Gemini only
// takes a few audio types. So recordings are decoded and re-encoded as 16-bit
// mono WAV before marking, at the highest sample rate that keeps a whole
// paper inside one inline request.

export type RecorderError = 'unsupported' | 'not-allowed' | 'other';

export function recordingSupported(): boolean {
  return typeof window !== 'undefined'
    && typeof window.MediaRecorder !== 'undefined'
    && !!navigator.mediaDevices?.getUserMedia;
}

export function recorderErrorMessage(code: RecorderError): string {
  switch (code) {
    case 'not-allowed':
      return 'Microphone blocked. Allow it in your browser’s site settings to record your answers.';
    case 'unsupported':
      return 'This browser can’t record audio. Try a current version of Chrome, Edge, Firefox or Safari.';
    default:
      return 'Couldn’t start the microphone. Check it’s connected and not in use by another app.';
  }
}

export interface Recording {
  blob: Blob;
  /** Seconds actually recorded, not counting pauses. */
  seconds: number;
}

/** Records one part. Pausing (while the examiner speaks) keeps the examiner's voice off the candidate's track. */
export class PartRecorder {
  private recorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private chunks: Blob[] = [];
  private startedAt = 0;
  private recordedMs = 0;

  async start(): Promise<void> {
    if (!recordingSupported()) throw new RecorderStartError('unsupported');
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1 },
      });
    } catch (err) {
      const name = err instanceof DOMException ? err.name : '';
      throw new RecorderStartError(name === 'NotAllowedError' || name === 'SecurityError' ? 'not-allowed' : 'other');
    }
    this.recorder = new MediaRecorder(this.stream);
    this.recorder.ondataavailable = e => { if (e.data.size > 0) this.chunks.push(e.data); };
    this.recorder.start(1000);
    this.startedAt = performance.now();
  }

  get recording(): boolean {
    return this.recorder?.state === 'recording';
  }

  /** Seconds recorded so far, not counting pauses. */
  elapsed(): number {
    const live = this.recording ? performance.now() - this.startedAt : 0;
    return (this.recordedMs + live) / 1000;
  }

  pause(): void {
    if (this.recorder?.state !== 'recording') return;
    this.recorder.pause();
    this.recordedMs += performance.now() - this.startedAt;
  }

  resume(): void {
    if (this.recorder?.state !== 'paused') return;
    this.recorder.resume();
    this.startedAt = performance.now();
  }

  stop(): Promise<Recording> {
    const recorder = this.recorder;
    if (!recorder || recorder.state === 'inactive') return Promise.resolve({ blob: new Blob(), seconds: 0 });
    const seconds = this.elapsed();
    return new Promise(resolve => {
      recorder.onstop = () => {
        this.release();
        resolve({ blob: new Blob(this.chunks, { type: recorder.mimeType || 'audio/webm' }), seconds });
      };
      recorder.stop();
    });
  }

  /** Stops without keeping anything — on leaving the page. */
  discard(): void {
    if (this.recorder && this.recorder.state !== 'inactive') {
      this.recorder.onstop = null;
      this.recorder.stop();
    }
    this.release();
    this.chunks = [];
  }

  private release(): void {
    this.stream?.getTracks().forEach(t => t.stop());
    this.stream = null;
  }
}

export class RecorderStartError extends Error {
  constructor(public readonly code: RecorderError) {
    super(code);
  }
}

// ─── WAV encoding for marking ────────────────────────────────────────────────

/** Gemini accepts up to 20 MB inline; base64 adds a third, so stay well under. */
export const AUDIO_BUDGET_BYTES = 12_000_000;
const PREFERRED_RATE = 16_000;
const MIN_RATE = 8_000;

/** The sample rate for a paper of this length, or null when it's too long to send even at telephone quality. */
export function chooseSampleRate(totalSeconds: number, budgetBytes = AUDIO_BUDGET_BYTES): number | null {
  if (totalSeconds <= 0) return PREFERRED_RATE;
  const fits = Math.floor(budgetBytes / (2 * totalSeconds));
  if (fits >= PREFERRED_RATE) return PREFERRED_RATE;
  if (fits < MIN_RATE) return null;
  return Math.floor(fits / 1000) * 1000;
}

/** 16-bit PCM mono WAV. */
export function encodeWav(samples: Float32Array, sampleRate: number): Uint8Array<ArrayBuffer> {
  const out = new Uint8Array(44 + samples.length * 2);
  const view = new DataView(out.buffer);
  const ascii = (offset: number, s: string) => { for (let i = 0; i < s.length; i++) out[offset + i] = s.charCodeAt(i); };
  ascii(0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  ascii(8, 'WAVE');
  ascii(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  ascii(36, 'data');
  view.setUint32(40, samples.length * 2, true);
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return out;
}

export function bytesToBase64(bytes: Uint8Array): string {
  let bin = '';
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    bin += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(bin);
}

/** Decodes whatever the browser recorded and resamples it to mono at `sampleRate`. */
export async function toWavBase64(blob: Blob, sampleRate: number): Promise<string> {
  const ctx = new AudioContext();
  try {
    const decoded = await ctx.decodeAudioData(await blob.arrayBuffer());
    const length = Math.ceil(decoded.duration * sampleRate);
    const offline = new OfflineAudioContext(1, Math.max(1, length), sampleRate);
    const source = offline.createBufferSource();
    source.buffer = decoded;
    source.connect(offline.destination);
    source.start();
    const rendered = await offline.startRendering();
    return bytesToBase64(encodeWav(rendered.getChannelData(0), sampleRate));
  } finally {
    ctx.close().catch(() => {});
  }
}

export class RecordingTooLongError extends Error {
  constructor() {
    super('These recordings are too long to mark in one go. Keep each part close to its suggested time.');
  }
}

/** Every part's recording as WAV, ready to send for marking; null for parts that weren't recorded. */
export async function recordingsForMarking(
  recordings: (Recording | null)[],
): Promise<({ mimeType: 'audio/wav'; data: string; seconds: number } | null)[]> {
  const total = recordings.reduce((sum, r) => sum + (r?.seconds ?? 0), 0);
  const rate = chooseSampleRate(total);
  if (rate === null) throw new RecordingTooLongError();
  return Promise.all(recordings.map(async r =>
    r && r.blob.size > 0 ? { mimeType: 'audio/wav' as const, data: await toWavBase64(r.blob, rate), seconds: r.seconds } : null,
  ));
}
