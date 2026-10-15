import { TypedAnswer, type TypedExerciseProps } from './TypedAnswer';

export function TranslationChallenge(props: TypedExerciseProps) {
  return <TypedAnswer {...props} label="Say it in French" placeholder="Type it in French" checkLabel="Check" multiline />;
}
