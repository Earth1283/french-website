import type { ReadingQuestion } from '../types/exam';
import { isListeningAnswerCorrect } from './listeningGrade';

/** Spelling tolerance must never turn a different price, quantity or time into a correct answer. */
export function isReadingAnswerCorrect(question: Pick<ReadingQuestion, 'type' | 'answer'>, given: string | undefined): boolean {
  if (!given?.trim()) return false;
  if (question.type === 'multiple-choice') return given === question.answer;
  const expected = question.answer.trim();
  const time = expected.match(/^(\d{1,2})\s*h\s*(\d{2})$/i);
  if (time) {
    const actual = given.trim().match(/^(\d{1,2})\s*(?:h|:)\s*(\d{2})$/i);
    return !!actual && Number(actual[1]) === Number(time[1]) && Number(actual[2]) === Number(time[2]);
  }
  if (/^\d+(?:[.,]\d+)?$/.test(expected)) {
    const actual = given.trim().replace(/\s*(?:€|euros?)$/i, '').replace(/\s+/g, '').replace(',', '.');
    return /^\d+(?:\.\d+)?$/.test(actual) && Number(actual) === Number(expected.replace(',', '.'));
  }
  return isListeningAnswerCorrect(question, given);
}

export function gradeReading(questions: Pick<ReadingQuestion, 'type' | 'answer'>[], answers: (string | undefined)[]): boolean[] {
  return questions.map((q, i) => isReadingAnswerCorrect(q, answers[i]));
}
