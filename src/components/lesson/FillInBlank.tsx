import type { Exercise } from '../../types';
import { TypedAnswer } from './TypedAnswer';

interface FillInBlankProps {
  exercise: Exercise;
  onCorrect: () => void;
  onWrong: () => void;
}

export function FillInBlank(props: FillInBlankProps) {
  return <TypedAnswer {...props} placeholder="Type your answer" checkLabel="Check answer" />;
}
