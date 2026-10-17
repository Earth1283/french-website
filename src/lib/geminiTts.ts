export const TTS_MODEL = 'gemini-3.8-flash-lite-tts';

export const GEMINI_VOICES = [
  { id: 'Kore', desc: 'Firm' },
  { id: 'Aoede', desc: 'Breezy' },
  { id: 'Sulafat', desc: 'Warm' },
  { id: 'Achird', desc: 'Friendly' },
  { id: 'Charon', desc: 'Informative' },
  { id: 'Puck', desc: 'Upbeat' },
] as const;

const STYLE = 'a native speaker from Paris, speaking clearly at a relaxed pace for a learner of French';
const CACHE_NAME = 'gemini-tts-v1';
const SAMPLE_RATE = 24000;

const RETRY_AFTER_FAILURE_MS = 60_000;
let cooldownUntil = 0;

const clips = new Map<string, Promise<Blob>>();

export function ttsRequestBody(text: string, voice: string) {
  return {
    model: TTS_MODEL,
    input: [{
      type: 'user_input',
      content: [{
        type: 'text',
        text,
        annotations: [{ type: 'speech_metadata', style: STYLE }],
      }],
    }],
    response_format: { type: 'audio' },
    generation_config: { speech_config: [{ voice }] },
  };
}

export function audioFromResponse(data: unknown): string | null {
  const d = data as { output_audio?: { data?: string }; steps?: { type?: string; content?: { type?: string; data?: string }[] }[] };
  if (typeof d?.output_audio?.data === 'string') return d.output_audio.data;
  const audio = (d?.steps ?? [])
    .filter(s => s.type === 'model_output')
    .flatMap(s => s.content ?? [])
    .filter(c => c.type === 'audio' && typeof c.data === 'string');
  return audio[audio.length - 1]?.data ?? null;
}

function base64ToBytes(b64: string): Uint8Array<ArrayBuffer> {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

export function asWav(bytes: Uint8Array<ArrayBuffer>): Uint8Array<ArrayBuffer> {
  if (bytes.length >= 4 && String.fromCharCode(...bytes.subarray(0, 4)) === 'RIFF') return bytes;
  const out = new Uint8Array(44 + bytes.length);
  const view = new DataView(out.buffer);
  const ascii = (offset: number, s: string) => { for (let i = 0; i < s.length; i++) out[offset + i] = s.charCodeAt(i); };
  ascii(0, 'RIFF');
  view.setUint32(4, 36 + bytes.length, true);
  ascii(8, 'WAVE');
  ascii(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, SAMPLE_RATE, true);
  view.setUint32(28, SAMPLE_RATE * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  ascii(36, 'data');
  view.setUint32(40, bytes.length, true);
  out.set(bytes, 44);
  return out;
}

const cacheKey = (voice: string, text: string) => `https://tts.invalid/${TTS_MODEL}/${voice}/${encodeURIComponent(text)}`;

async function openCache(): Promise<Cache | null> {
  try {
    return typeof caches === 'undefined' ? null : await caches.open(CACHE_NAME);
  } catch {
    return null;
  }
}

async function fetchClip(apiKey: string, text: string, voice: string): Promise<Blob> {
  const key = cacheKey(voice, text);
  const cache = await openCache();
  const hit = await cache?.match(key).catch(() => undefined);
  if (hit) return hit.blob();

  if (Date.now() < cooldownUntil) throw new Error('Gemini voice is cooling down after an error');
  const res = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify(ttsRequestBody(text, voice)),
  }).catch(err => {
    cooldownUntil = Date.now() + RETRY_AFTER_FAILURE_MS;
    throw err;
  });
  if (!res.ok) {
    cooldownUntil = Date.now() + RETRY_AFTER_FAILURE_MS;
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? `Gemini voice error ${res.status}`);
  }
  const b64 = audioFromResponse(await res.json());
  if (!b64) throw new Error('Gemini returned no audio');
  const blob = new Blob([asWav(base64ToBytes(b64))], { type: 'audio/wav' });
  await cache?.put(key, new Response(blob, { headers: { 'Content-Type': 'audio/wav' } })).catch(() => {});
  return blob;
}

export function geminiSpeech(apiKey: string, text: string, voice: string): Promise<Blob> {
  const key = cacheKey(voice, text);
  const known = clips.get(key);
  if (known) return known;
  const clip = fetchClip(apiKey, text, voice);
  clips.set(key, clip);
  clip.catch(() => clips.delete(key));
  return clip;
}

export function previewGeminiVoice(apiKey: string, text: string, voice: string): Promise<Blob> {
  cooldownUntil = 0;
  return geminiSpeech(apiKey, text, voice);
}

export async function cachedClipCount(): Promise<number> {
  const cache = await openCache();
  return (await cache?.keys().catch(() => []))?.length ?? 0;
}

export async function clearClipCache(): Promise<void> {
  clips.clear();
  if (typeof caches !== 'undefined') await caches.delete(CACHE_NAME).catch(() => false);
}
