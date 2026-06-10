import { normalize } from './normalize';

export type AnswerResult = 'correct' | 'typo' | 'wrong';

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

export function checkAnswer(input: string, expected: string): AnswerResult {
  const a = normalize(input);
  const b = normalize(expected);
  if (a === b) return 'correct';
  const dist = levenshtein(a, b);
  if (dist <= typoThreshold(b.length)) return 'typo';
  return 'wrong';
}
