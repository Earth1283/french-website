import { describe, expect, it } from 'vitest';
import { splitForSpeech } from './speech';
import { LISTENING_DOCS } from '../data/exam/listening';

describe('splitForSpeech', () => {
  it('splits on sentence boundaries', () => {
    expect(splitForSpeech('Bonjour. Ça va ? Oui !')).toEqual(['Bonjour.', 'Ça va ?', 'Oui !']);
  });

  it('keeps text without final punctuation', () => {
    expect(splitForSpeech('Premier. Et puis la suite')).toEqual(['Premier.', 'Et puis la suite']);
  });

  it('breaks an over-long sentence at commas', () => {
    const long = Array.from({ length: 12 }, (_, i) => `proposition numéro ${i + 1}`).join(', ') + '.';
    const chunks = splitForSpeech(long, 80);
    expect(chunks.length).toBeGreaterThan(1);
    for (const c of chunks) expect(c.length).toBeLessThanOrEqual(80);
    expect(chunks.join(' ')).toBe(long);
  });

  it('never drops words from a listening script', () => {
    for (const doc of LISTENING_DOCS) {
      for (const line of doc.script) {
        const rejoined = splitForSpeech(line.text).join(' ').replace(/\s+/g, ' ');
        expect(rejoined).toBe(line.text.replace(/\s+/g, ' ').trim());
      }
    }
  });
});
