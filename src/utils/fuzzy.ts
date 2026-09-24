import { normalize, stripAccents } from './normalize';

/**
 * `accent` and `typo` both pass, but the learner is shown the right spelling.
 * Anything that changes the grammar or the word itself is `wrong`.
 */
export type AnswerResult = 'correct' | 'accent' | 'typo' | 'wrong';

// Words where the accent picks a different word (a/à, ou/où, ...).
const ACCENT_MINIMAL_PAIRS = new Set(['a', 'ou', 'la', 'sur', 'du', 'mur', 'des', 'peche', 'cote', 'tache', 'sale', 'pate']);
const INFLECTION_LETTERS = 'aeirstxzn';

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function typoThreshold(expectedLen: number): number {
  if (expectedLen <= 5) return 1;
  if (expectedLen <= 12) return 2;
  return 3;
}

/**
 * True when two accent-free words differ only by a grammatical ending
 * (parle/parles, parti/partie, le/les). Those are the mistakes a lesson is
 * teaching, so they are never forgiven as typos. A repeated letter such as
 * merci/mercii is a keystroke slip, except a doubled e/s/x/t.
 */
function endingOnlyDifference(a: string, b: string): boolean {
  const [short, long] = a.length <= b.length ? [a, b] : [b, a];
  if (short.length === long.length) {
    const last = [short[short.length - 1], long[long.length - 1]];
    return short.slice(0, -1) === long.slice(0, -1) && last.every(c => INFLECTION_LETTERS.includes(c));
  }
  if (long.length - short.length > 2 || !long.startsWith(short)) return false;
  const extra = long.slice(short.length);
  const repeatedKeystroke = extra.length === 1 && extra === short[short.length - 1] && !'esxt'.includes(extra);
  return !repeatedKeystroke && [...extra].every(c => INFLECTION_LETTERS.includes(c));
}

/** Accents matter when they separate two words, or sit on a word's last letter (é participles, à, où, là). */
function missingAccentChangesMeaning(a: string, b: string): boolean {
  const wordsA = a.split(' ');
  const wordsB = b.split(' ');
  return wordsA.some((word, i) => {
    const other = wordsB[i];
    if (word === other) return false;
    return ACCENT_MINIMAL_PAIRS.has(stripAccents(word)) || word[word.length - 1] !== other[other.length - 1];
  });
}

export function checkAnswer(input: string, expected: string): AnswerResult {
  const a = normalize(input);
  const b = normalize(expected);
  if (a === b) return 'correct';

  const plainA = stripAccents(a);
  const plainB = stripAccents(b);
  if (plainA === plainB) return missingAccentChangesMeaning(a, b) ? 'wrong' : 'accent';

  const wordsA = plainA.split(' ');
  const wordsB = plainB.split(' ');
  if (wordsA.length === wordsB.length && wordsA.some((w, i) => w !== wordsB[i] && endingOnlyDifference(w, wordsB[i]))) {
    return 'wrong';
  }
  return levenshtein(plainA, plainB) <= typoThreshold(plainB.length) ? 'typo' : 'wrong';
}
