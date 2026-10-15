import { TypedAnswer, type TypedExerciseProps } from './TypedAnswer';

export function FillInBlank(props: TypedExerciseProps) {
  return <TypedAnswer {...props} label="Fill in the Blank" placeholder="Type the missing word" checkLabel="Check Answer" />;
}
