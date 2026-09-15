import { describe, expect, it } from 'vitest';
import { frenchPunctuation } from './french';

const NNBSP = ' ';

describe('frenchPunctuation', () => {
  it('puts a narrow no-break space before high punctuation', () => {
    expect(frenchPunctuation('Oh non!')).toBe(`Oh non${NNBSP}!`);
    expect(frenchPunctuation('Ça va ?')).toBe(`Ça va${NNBSP}?`);
    expect(frenchPunctuation('Attention : chaud')).toBe(`Attention${NNBSP}: chaud`);
  });

  it('spaces the inside of guillemets', () => {
    expect(frenchPunctuation('« Bonjour »')).toBe(`«${NNBSP}Bonjour${NNBSP}»`);
  });

  it('leaves times and URLs alone', () => {
    expect(frenchPunctuation('Rendez-vous à 14:30')).toBe('Rendez-vous à 14:30');
    expect(frenchPunctuation('https://example.fr')).toBe('https://example.fr');
  });
});
