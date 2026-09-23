export type Role =
  | 'subject' | 'verb' | 'object' | 'adjective' | 'negation' | 'adverb' | 'noun' | 'article'
  | 'base' | 'multiplier' | 'addend'
  | 'hour' | 'fraction';

export interface Token {
  id: string;
  role: Role;
  /** English text; omit when the word only exists in French (e.g. ne). */
  en?: string;
  /** French text; omit when the word only exists in English (e.g. don't). */
  fr?: string;
  /** Tokens sharing a group light up together (e.g. don't ↔ ne … pas). Defaults to the id. */
  group?: string;
  note?: string;
  /** Numeric value for base/multiplier/addend tokens, so a number breakdown can be computed and shown. */
  value?: number;
}

export interface Sentence {
  tokens: Token[];
  /** Token ids in English order. Defaults to the tokens with `en`, in list order. */
  en?: string[];
  /** Token ids in French order. Defaults to the tokens with `fr`, in list order. */
  fr?: string[];
  /** Token ids to spotlight once the sentence turns French. */
  focus?: string[];
}

export interface Scene {
  id: string;
  title: string;
  idea: string;
  sentences: Sentence[];
  /** Sentence the learner rebuilds in French order before moving on. */
  check: Sentence;
}

export interface InteractiveLesson {
  lessonId: string;
  scenes: Scene[];
}
