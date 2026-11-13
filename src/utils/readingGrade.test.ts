import { describe, expect, it } from 'vitest';
import { gradeReading, isReadingAnswerCorrect } from './readingGrade';

const number = { type: 'short' as const, answer: '5' };
const time = { type: 'short' as const, answer: '9 h 30' };

describe('reading answers', () => {
  it('requires the right number, while accepting equivalent numeric notation', () => {
    expect(isReadingAnswerCorrect(number, '6')).toBe(false);
    expect(isReadingAnswerCorrect(number, '50')).toBe(false);
    expect(isReadingAnswerCorrect(number, '05')).toBe(true);
    expect(isReadingAnswerCorrect(number, '5,0')).toBe(true);
    expect(isReadingAnswerCorrect({ ...number, answer: '420' }, '420 euros')).toBe(true);
    expect(isReadingAnswerCorrect({ ...number, answer: '420' }, '421 €')).toBe(false);
  });
  it('accepts common time formats but not a different time', () => {
    for (const answer of ['9h30', '09:30', '9 h 30']) expect(isReadingAnswerCorrect(time, answer)).toBe(true);
    for (const answer of ['9:31', '8 h 30', '9 h', '9']) expect(isReadingAnswerCorrect(time, answer)).toBe(false);
  });
  it('locks choices to the selected option and counts unanswered questions as wrong', () => {
    const choice = { type: 'multiple-choice' as const, answer: 'Samedi' };
    expect(gradeReading([choice, number, time], ['Samedi', '5', '09:30'])).toEqual([true, true, true]);
    expect(gradeReading([choice, number, time], ['samedii'])).toEqual([false, false, false]);
  });
});
