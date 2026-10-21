import { describe, expect, it } from 'vitest';
import { parseDebrief, parseSpeakingEvaluation, parseWritingEvaluation } from './gemini';
import { SPEAKING_TASKS } from '../data/exam/speaking';

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

describe('parseSpeakingEvaluation', () => {
  const speakingTask = SPEAKING_TASKS.find(t => t.level === 'b1')!;
  const enough = speakingTask.parts.map(p => p.speakMinutes * 60);

  it('recomputes the score from bands and keeps one transcript per part', () => {
    const ev = parseSpeakingEvaluation(
      { bands: { task: 2, interaction: 2, lexicon: 3, morphosyntax: 1, phonology: 2 }, score: 25, transcripts: ['Je m\'appelle Ana.'] },
      speakingTask,
      enough,
    );
    expect(ev.score).toBe(3 + 3 + 5 + 1 + 3);
    expect(ev.maxScore).toBe(25);
    expect(ev.transcripts).toHaveLength(speakingTask.parts.length);
    expect(ev.transcripts?.[0]).toBe('Je m\'appelle Ana.');
    expect(ev.transcripts?.[1]).toBe('');
  });

  it('gives 0 throughout when there was too little speech, whatever the model says', () => {
    const ev = parseSpeakingEvaluation(
      { bands: { task: 3, interaction: 3, lexicon: 3, morphosyntax: 3, phonology: 3 } },
      speakingTask,
      speakingTask.parts.map(() => 5),
    );
    expect(ev.tooShort).toBe(true);
    expect(ev.score).toBe(0);
  });

  it('survives a malformed response', () => {
    const ev = parseSpeakingEvaluation(['not', 'an', 'object'], speakingTask, enough);
    expect(ev.score).toBe(0);
    expect(ev.corrections).toEqual([]);
  });
});

describe('parseDebrief', () => {
  it('keeps well-formed parts and caps the lists', () => {
    const d = parseDebrief({
      summary: 'Bien joué.',
      strengths: ['a', 'b', 'c', 'd', 42],
      corrections: [{ original: 'je suis faim', corrected: 'j\'ai faim', explanation: 'Avoir faim.' }, { original: 'x', corrected: 'x' }],
      phrases: [{ french: 'L\'addition, s\'il vous plaît.', english: 'The bill, please.' }, { english: 'no French' }],
    });
    expect(d.source).toBe('ai');
    expect(d.strengths).toEqual(['a', 'b', 'c']);
    expect(d.corrections).toHaveLength(1);
    expect(d.phrases).toEqual([{ french: 'L\'addition, s\'il vous plaît.', english: 'The bill, please.' }]);
  });

  it('survives a malformed response', () => {
    expect(parseDebrief(null)).toEqual({ source: 'ai', summary: '', strengths: [], corrections: [], phrases: [] });
  });
});
