import { checkAnswer } from './fuzzy';

interface GradableQuestion {
  type: 'multiple-choice' | 'short';
  answer: string;
}

/** MCQs must match exactly; short written answers get the same typo/accent tolerance as lessons. */
export function isListeningAnswerCorrect(question: GradableQuestion, given: string | undefined): boolean {
  if (!given) return false;
  if (question.type === 'multiple-choice') return given === question.answer;
  return checkAnswer(given.trim(), question.answer) !== 'wrong';
}

export function gradeListening(questions: GradableQuestion[], answers: (string | undefined)[]): boolean[] {
  return questions.map((q, i) => isListeningAnswerCorrect(q, answers[i]));
}
