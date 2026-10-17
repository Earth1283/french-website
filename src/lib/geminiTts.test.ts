import { describe, expect, it } from 'vitest';
import { asWav, audioFromResponse, ttsRequestBody } from './geminiTts';

describe('ttsRequestBody', () => {
  it('sends the phrase as a verbatim transcript, with delivery in speech_metadata', () => {
    const body = ttsRequestBody("Un café, s'il vous plaît.", 'Kore');
    expect(body.input[0].content[0].text).toBe("Un café, s'il vous plaît.");
    expect(body.input[0].content[0].annotations[0].type).toBe('speech_metadata');
    expect(body.response_format).toEqual({ type: 'audio' });
    expect(body.generation_config.speech_config).toEqual([{ voice: 'Kore' }]);
  });
});

describe('audioFromResponse', () => {
  it('takes the last audio part of the model output', () => {
    const data = {
      steps: [
        { type: 'user_input', content: [{ type: 'text', text: 'hi' }] },
        { type: 'model_output', content: [{ type: 'audio', data: 'first' }, { type: 'audio', data: 'last' }] },
      ],
    };
    expect(audioFromResponse(data)).toBe('last');
  });

  it('reads the SDK-style shortcut', () => {
    expect(audioFromResponse({ output_audio: { data: 'abc' } })).toBe('abc');
  });

  it('returns null when there is no audio', () => {
    expect(audioFromResponse({ steps: [{ type: 'model_output', content: [{ type: 'text', text: 'no' }] }] })).toBeNull();
    expect(audioFromResponse(null)).toBeNull();
  });
});

describe('asWav', () => {
  it('leaves WAV untouched', () => {
    const wav = new Uint8Array([82, 73, 70, 70, 1, 2, 3]);
    expect(asWav(wav)).toBe(wav);
  });

  it('wraps raw PCM in a 24 kHz mono 16-bit header', () => {
    const pcm = new Uint8Array(480);
    const wav = asWav(pcm);
    const view = new DataView(wav.buffer);
    expect(String.fromCharCode(...wav.subarray(0, 4))).toBe('RIFF');
    expect(String.fromCharCode(...wav.subarray(8, 12))).toBe('WAVE');
    expect(view.getUint16(22, true)).toBe(1);
    expect(view.getUint32(24, true)).toBe(24000);
    expect(view.getUint16(34, true)).toBe(16);
    expect(view.getUint32(40, true)).toBe(480);
    expect(wav.length).toBe(524);
  });
});
