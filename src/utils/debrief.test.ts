import { describe, expect, it } from 'vitest';
import { scriptedDebrief } from './debrief';
import { SCENARIOS } from '../data/scenarios';

const cafe = SCENARIOS.find(s => s.id === 'cafe')!;

describe('scriptedDebrief', () => {
  it('turns each missed reply into a correction against that turn', () => {
    const d = scriptedDebrief(cafe, [
      { text: 'Bonjour ! Un café, s\'il vous plaît.', correct: true },
      { text: 'Non, c\'est tout.', correct: false },
    ], false);
    expect(d.source).toBe('scripted');
    expect(d.corrections).toEqual([{
      original: 'Non, c\'est tout.',
      corrected: cafe.turns[1].correctResponse,
      explanation: 'The moment called for this: order a croissant too.',
    }]);
    expect(d.strengths).toEqual(['1 of 2 replies did what the moment needed.']);
  });

  it('praises a clean run and keeps the phrases that were used', () => {
    const replies = cafe.turns.map(t => ({ text: t.correctResponse, correct: true }));
    const d = scriptedDebrief(cafe, replies, true);
    expect(d.corrections).toEqual([]);
    expect(d.strengths).toContain('You got all the way through the mission.');
    expect(d.phrases[0]).toEqual({ french: cafe.turns[0].correctResponse, english: cafe.turns[0].playerHint });
  });

  it('copes with leaving before the first reply', () => {
    const d = scriptedDebrief(cafe, [], false);
    expect(d.summary).toContain('before replying');
    expect(d.phrases.length).toBeGreaterThan(0);
  });
});
