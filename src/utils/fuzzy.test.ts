import { describe, it, expect } from 'vitest';
import { checkAnswer } from './fuzzy';

describe('checkAnswer', () => {
  it.each([
    ['Merci !', 'merci', 'correct'],
    ["l’eau", "l'eau", 'correct'],
    ['cœur', 'coeur', 'correct'],
    ['garcon', 'garçon', 'accent'],
    ['ou est la gare', 'Où est la gare ?', 'wrong'],
    ['il a', 'il à', 'wrong'],
    ['je suis fatigue', 'Je suis fatigué.', 'wrong'],
    ['je suis alle', 'je suis allée', 'wrong'],
    ['tu parle', 'tu parles', 'wrong'],
    ['elle est parti', 'elle est partie', 'wrong'],
    ['les chat', 'les chats', 'wrong'],
    ['bonjuor', 'bonjour', 'typo'],
    ['Mercii', 'merci', 'typo'],
    ['je suis fatiguee', 'je suis fatigue', 'wrong'],
    ['bonj', 'bonjour', 'wrong'],
  ] as const)('%j vs %j is %s', (input, expected, result) => {
    expect(checkAnswer(input, expected)).toBe(result);
  });
});
