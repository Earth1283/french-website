import type { Exercise } from '../../types';
import { TypedAnswer } from './TypedAnswer';

interface TranslationChallengeProps {
  exercise: Exercise;
  onCorrect: () => void;
  onWrong: () => void;
}

export function TranslationChallenge(props: TranslationChallengeProps) {
  return <TypedAnswer {...props} multiline placeholder="Type your translation" checkLabel="Check translation" />;
}
