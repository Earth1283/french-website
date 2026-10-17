import { describe, expect, it } from 'vitest';
import { checkSpoken, matchWords, numberToFrench, soundKey, spokenForm } from './spokenAnswer';

describe('numberToFrench', () => {
  it.each([
    [0, 'zéro'], [16, 'seize'], [17, 'dix-sept'], [21, 'vingt et un'], [22, 'vingt-deux'],
    [70, 'soixante-dix'], [71, 'soixante et onze'], [77, 'soixante-dix-sept'], [80, 'quatre-vingts'],
    [81, 'quatre-vingt-un'], [91, 'quatre-vingt-onze'], [100, 'cent'], [200, 'deux cents'],
    [201, 'deux cent un'], [1000, 'mille'], [2024, 'deux mille vingt-quatre'], [200000, 'deux cent mille'],
  ])('%i → %s', (n, words) => {
    expect(numberToFrench(n)).toBe(words);
  });
});

describe('spokenForm', () => {
  it('spells out digits, prices and times the way a recogniser writes them', () => {
    expect(spokenForm('100')).toBe('cent');
    expect(spokenForm('4,50 €')).toBe('quatre euros cinquante');
    expect(spokenForm('Le train part à 14h30.')).toBe('le train part à quatorze heures trente');
    expect(spokenForm('Avez-vous ça en taille 40 ?')).toBe('avez vous ça en taille quarante');
  });

  it('drops optional agreement in brackets', () => {
    expect(spokenForm('Je suis occupé(e) demain')).toBe('je suis occupé demain');
  });
});

describe('soundKey', () => {
  it('folds silent endings', () => {
    expect(soundKey('parle')).toBe(soundKey('parles'));
    expect(soundKey('parle')).toBe(soundKey('parlent'));
    expect(soundKey('allé')).toBe(soundKey('aller'));
    expect(soundKey('parlais')).toBe(soundKey('parlait'));
  });

  it('keeps endings you can hear', () => {
    expect(soundKey('grand')).not.toBe(soundKey('grande'));
    expect(soundKey('le')).not.toBe(soundKey('les'));
    expect(soundKey('parle')).not.toBe(soundKey('parlé'));
    expect(soundKey('comment')).not.toBe(soundKey('comme'));
  });
});

describe('checkSpoken', () => {
  it('accepts what the recogniser writes for a correct answer', () => {
    expect(checkSpoken(['Un croissant, s’il vous plaît'], "Un croissant, s'il vous plaît").result).toBe('correct');
    expect(checkSpoken(['100'], 'cent').result).toBe('correct');
    expect(checkSpoken(['4,50 €'], 'quatre euros cinquante').result).toBe('correct');
  });

  it("doesn't blame the learner for the recogniser's choice of homophone", () => {
    expect(checkSpoken(['il parle français'], 'ils parlent français').result).toBe('correct');
    expect(checkSpoken(['je suis allée au marché'], 'Je suis allé au marché').result).toBe('correct');
  });

  it('ignores hesitation', () => {
    expect(checkSpoken(['euh je voudrais un café'], 'Je voudrais un café').result).toBe('correct');
  });

  it('picks the best of several readings', () => {
    const check = checkSpoken(['je voudrais un cadeau', 'je voudrais un café'], 'Je voudrais un café');
    expect(check).toEqual({ result: 'correct', heard: 'je voudrais un café' });
  });

  it('passes a near miss as close and a different sentence as wrong', () => {
    expect(checkSpoken(["l'addition s'il vous plait"], "L'addition, s'il vous plaît").result).toBe('correct');
    expect(checkSpoken(['je voudrais un cafés au lait'], 'Je voudrais un café au lait').result).toBe('correct');
    expect(checkSpoken(['je voudrais un cafard'], 'Je voudrais un café').result).toBe('close');
    expect(checkSpoken(['je voudrais une café'], 'Je voudrais un café').result).toBe('wrong');
    expect(checkSpoken(['bonjour madame'], 'Bonjour monsieur').result).toBe('wrong');
    expect(checkSpoken([], 'Bonjour').result).toBe('wrong');
  });
});

describe('matchWords', () => {
  it('marks the words that were heard, in order', () => {
    const { words, score } = matchWords('Le train pour Lyon partira du quai 3.', 'le train pour lyon partira du quai');
    expect(words.map(w => w.heard)).toEqual([true, true, true, true, true, true, true, false]);
    expect(score).toBeCloseTo(7 / 8);
  });

  it('scores a perfect repeat as 1', () => {
    expect(matchWords('Bonjour, je voudrais un café !', 'bonjour je voudrais un café').score).toBe(1);
  });

  it('scores silence as 0', () => {
    expect(matchWords('Bonjour', '').score).toBe(0);
  });
});
