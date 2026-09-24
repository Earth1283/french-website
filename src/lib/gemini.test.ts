import { describe, expect, it } from 'vitest';
import { parseWritingEvaluation } from './gemini';

const task = { level: 'b1' as const, consigne: 'Donnez votre opinion.', minWords: 160 };
const longText = Array.from({ length: 170 }, (_, i) => `mot${i}`).join(' ');

describe('parseWritingEvaluation', () => {
  it('recomputes the score from bands instead of trusting the model', () => {
    const ev = parseWritingEvaluation(
      { bands: { task: 3, coherence: 2, sociolinguistic: 2, lexicon: 1, morphosyntax: 0 }, score: 25, summary: 'Bien.' },
      task,
      longText,
    );
    expect(ev.score).toBe(5 + 3 + 3 + 1 + 0);
    expect(ev.maxScore).toBe(25);
    expect(ev.summary).toBe('Bien.');
    expect(ev.source).toBe('ai');
  });

  it('survives a malformed response', () => {
    const ev = parseWritingEvaluation('nonsense', task, longText);
    expect(ev.score).toBe(0);
    expect(ev.corrections).toEqual([]);
  });

  it('drops empty or no-op corrections and caps their length', () => {
    const ev = parseWritingEvaluation(
      {
        bands: {},
        corrections: [
          { original: 'je suis allé', corrected: 'je suis allée', explanation: 'Agreement.' },
          { original: 'pareil', corrected: 'pareil' },
          { original: '', corrected: 'x' },
          { original: 'x'.repeat(1000), corrected: 'y' },
        ],
      },
      task,
      longText,
    );
    expect(ev.corrections).toHaveLength(2);
    expect(ev.corrections![1].original.length).toBe(300);
  });

  it('applies the too-short rule even if the model gave high bands', () => {
    const ev = parseWritingEvaluation({ bands: { task: 3, coherence: 3, sociolinguistic: 3, lexicon: 3, morphosyntax: 3 } }, task, 'Trop court.');
    expect(ev.tooShort).toBe(true);
    expect(ev.score).toBe(0);
  });
});
