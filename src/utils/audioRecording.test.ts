import { describe, expect, it } from 'vitest';
import { AUDIO_BUDGET_BYTES, bytesToBase64, chooseSampleRate, encodeWav } from './audioRecording';

describe('chooseSampleRate', () => {
  it('uses 16 kHz while the paper fits the budget', () => {
    expect(chooseSampleRate(60)).toBe(16000);
    expect(chooseSampleRate(AUDIO_BUDGET_BYTES / (2 * 16000))).toBe(16000);
  });

  it('steps down for long papers and gives up below telephone quality', () => {
    const rate = chooseSampleRate(12 * 60)!;
    expect(rate).toBeLessThan(16000);
    expect(rate).toBeGreaterThanOrEqual(8000);
    expect(rate * 2 * 12 * 60).toBeLessThanOrEqual(AUDIO_BUDGET_BYTES);
    expect(chooseSampleRate(20 * 60)).toBeNull();
  });
});

describe('encodeWav', () => {
  it('writes a mono 16-bit PCM header and clamps samples', () => {
    const wav = encodeWav(new Float32Array([0, 1, -1, 2]), 16000);
    const view = new DataView(wav.buffer);
    expect(String.fromCharCode(...wav.subarray(0, 4))).toBe('RIFF');
    expect(String.fromCharCode(...wav.subarray(8, 12))).toBe('WAVE');
    expect(view.getUint16(22, true)).toBe(1);
    expect(view.getUint32(24, true)).toBe(16000);
    expect(view.getUint32(40, true)).toBe(8);
    expect(view.getInt16(46, true)).toBe(0x7fff);
    expect(view.getInt16(48, true)).toBe(-0x8000);
    expect(view.getInt16(50, true)).toBe(0x7fff);
  });
});

describe('bytesToBase64', () => {
  it('matches btoa and handles inputs larger than one chunk', () => {
    expect(bytesToBase64(new Uint8Array([72, 105]))).toBe('SGk=');
    const big = new Uint8Array(100_000).map((_, i) => i % 256);
    expect(atob(bytesToBase64(big)).length).toBe(100_000);
  });
});
