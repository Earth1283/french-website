import { checkAnswer } from './fuzzy';
import { normalize } from './normalize';

export type SpokenResult = 'correct' | 'close' | 'wrong';

export interface SpokenCheck {
  result: SpokenResult;
  heard: string;
}

const ONES = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize'];
const TENS = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante'];

function below100(n: number): string {
  if (n <= 16) return ONES[n];
  if (n < 20) return `dix-${ONES[n - 10]}`;
  if (n < 70) {
    const unit = n % 10;
    return TENS[Math.floor(n / 10)] + (unit === 0 ? '' : unit === 1 ? ' et un' : `-${ONES[unit]}`);
  }
  if (n < 80) return n === 71 ? 'soixante et onze' : `soixante-${below100(n - 60)}`;
  if (n === 80) return 'quatre-vingts';
  return `quatre-vingt-${below100(n - 80)}`;
}

function below1000(n: number): string {
  const hundreds = Math.floor(n / 100);
  const rest = n % 100;
  if (hundreds === 0) return below100(rest);
  const prefix = hundreds === 1 ? 'cent' : `${ONES[hundreds]} cent`;
  if (rest === 0) return hundreds > 1 ? `${prefix}s` : prefix;
  return `${prefix} ${below100(rest)}`;
}

export function numberToFrench(n: number): string {
  if (n < 1000) return below1000(n);
  const thousands = Math.floor(n / 1000);
  const rest = n % 1000;
  const prefix = thousands === 1 ? 'mille' : `${below1000(thousands).replace(/(cent|vingt)s$/, '$1')} mille`;
  return rest === 0 ? prefix : `${prefix} ${below1000(rest)}`;
}

const FILLERS = /\b(euh+|heu+|hum+|bah|ben)\b/g;

export function spokenForm(s: string): string {
  const words = s
    .normalize('NFC')
    .toLowerCase()
    .replace(/\((?:e|s|es|x)\)/g, '')
    .replace(/(\d+),(\d{2})\s*€/g, '$1 euros $2')
    .replace(/(\d+)\s*€\s*(\d{2})\b/g, '$1 euros $2')
    .replace(/€/g, ' euros')
    .replace(/(\d{1,2})\s*h\s*(\d{2})\b/g, '$1 heures $2')
    .replace(/(\d{1,2})\s*h\b/g, '$1 heures')
    .replace(/%/g, ' pour cent')
    .replace(/\b1er\b/g, 'premier')
    .replace(/\b1re\b/g, 'première')
    .replace(/(\d)[   ](?=\d{3}\b)/g, '$1')
    .replace(/(\d),(\d)/g, '$1 virgule $2')
    .replace(/\d+/g, d => (d.length <= 6 ? ` ${numberToFrench(Number(d))} ` : d))
    .replace(/[-–—]/g, ' ');
  return normalize(words);
}

const SAME_SOUND_SHORT: Record<string, string> = { ils: 'il', elles: 'elle' };

export function soundKey(s: string): string {
  return s
    .split(' ')
    .map(w => {
      if (SAME_SOUND_SHORT[w]) return SAME_SOUND_SHORT[w];
      if (w.length <= 3) return w;
      if (/(aient|ais|ait)$/.test(w)) return w.replace(/(aient|ais|ait)$/, 'è');
      if (/(ées|ée|és|ez|er)$/.test(w)) return w.replace(/(ées|ée|és|ez|er)$/, 'é');
      if (/ment$/.test(w)) return w;
      return w.replace(/(ent|es|s|t|x|d|e)$/, '');
    })
    .join(' ');
}

export function checkSpoken(readings: string[], expected: string): SpokenCheck {
  const target = spokenForm(expected);
  const targetKey = soundKey(target);
  let best: SpokenCheck = { result: 'wrong', heard: readings[0] ?? '' };

  for (const heard of readings) {
    const form = spokenForm(heard).replace(FILLERS, '').replace(/\s+/g, ' ').trim();
    if (!form) continue;
    if (form === target || soundKey(form) === targetKey) return { result: 'correct', heard };
    const typed = checkAnswer(form, target);
    if (typed === 'correct' || typed === 'accent') return { result: 'correct', heard };
    if (typed === 'typo' && best.result === 'wrong') best = { result: 'close', heard };
  }
  return best;
}

export interface WordMatch {
  text: string;
  heard: boolean;
}

export function matchWords(expected: string, heard: string): { words: WordMatch[]; score: number } {
  const tokens = expected.split(/\s+/).filter(Boolean);
  const tokenKeys = tokens.map(t => soundKey(spokenForm(t)).split(' ').filter(Boolean));
  const flat = tokenKeys.flatMap((keys, ti) => keys.map(k => ({ k, ti })));
  const said = soundKey(spokenForm(heard).replace(FILLERS, ' ').replace(/\s+/g, ' ').trim()).split(' ').filter(Boolean);

  const m = flat.length;
  const n = said.length;
  const lcs: number[][] = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      lcs[i][j] = flat[i].k === said[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }

  const matched = new Array<boolean>(m).fill(false);
  for (let i = 0, j = 0; i < m && j < n;) {
    if (flat[i].k === said[j]) {
      matched[i] = true;
      i++;
      j++;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) i++;
    else j++;
  }

  const words = tokens.map((text, ti) => ({
    text,
    heard: flat.every((f, i) => f.ti !== ti || matched[i]),
  }));
  const scored = words.filter((_, ti) => tokenKeys[ti].length > 0);
  const score = scored.length === 0 ? 0 : scored.filter(w => w.heard).length / scored.length;
  return { words, score };
}
