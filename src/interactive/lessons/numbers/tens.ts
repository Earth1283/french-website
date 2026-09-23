import type { InteractiveLesson } from '../../types';

export const numbersTens: InteractiveLesson = {
  lessonId: 'numbers-2',
  scenes: [
    {
      id: 'warm-up-base-plus-addend',
      title: 'Quick review: base + digit',
      idea: 'Every decade so far is built the same way — a base word plus a single digit. Twenties, thirties, forties: no tricks yet. This is the pattern the rest of the lesson bends.',
      sentences: [
        {
          tokens: [
            { id: 'vingt', role: 'base', en: 'twenty', fr: 'vingt', value: 20 },
            { id: 'un', role: 'addend', en: 'one', fr: 'et un', value: 1, note: '"un" always glues an "et" onto the base — the only digit that does this.' },
          ],
          focus: ['un'],
        },
        {
          tokens: [
            { id: 'trente', role: 'base', en: 'thirty', fr: 'trente', value: 30 },
            { id: 'quatre', role: 'addend', en: 'four', fr: 'quatre', value: 4 },
          ],
        },
        {
          tokens: [
            { id: 'quarante', role: 'base', en: 'forty', fr: 'quarante', value: 40 },
            { id: 'huit', role: 'addend', en: 'eight', fr: 'huit', value: 8 },
          ],
        },
      ],
      check: {
        tokens: [
          { id: 'cinquante', role: 'base', en: 'fifty', fr: 'cinquante', value: 50 },
          { id: 'deux', role: 'addend', en: 'two', fr: 'deux', value: 2 },
        ],
      },
    },
    {
      id: 'sixties-continue',
      title: '60–69: still playing by the rules',
      idea: 'Soixante plus a digit — the exact same formula as the warm-up. Enjoy it, because it\'s the last normal decade.',
      sentences: [
        {
          tokens: [
            { id: 'soixante', role: 'base', en: 'sixty', fr: 'soixante', value: 60 },
            { id: 'un', role: 'addend', en: 'one', fr: 'et un', value: 1, note: 'Same "et" rule as the warm-up: sixty-and-one.' },
          ],
          focus: ['un'],
        },
        {
          tokens: [
            { id: 'soixante', role: 'base', en: 'sixty', fr: 'soixante', value: 60 },
            { id: 'quatre', role: 'addend', en: 'four', fr: 'quatre', value: 4 },
          ],
        },
        {
          tokens: [
            { id: 'soixante', role: 'base', en: 'sixty', fr: 'soixante', value: 60 },
            { id: 'huit', role: 'addend', en: 'eight', fr: 'huit', value: 8 },
          ],
        },
      ],
      check: {
        tokens: [
          { id: 'soixante', role: 'base', en: 'sixty', fr: 'soixante', value: 60 },
          { id: 'trois', role: 'addend', en: 'three', fr: 'trois', value: 3 },
        ],
      },
    },
    {
      id: 'seventy-borrows',
      title: '70 borrows from 60',
      idea: 'There\'s no French word for seventy. You just keep counting past soixante: soixante-dix is literally "sixty-ten".',
      sentences: [
        {
          tokens: [
            { id: 'soixante', role: 'base', en: 'sixty', fr: 'soixante', value: 60 },
            { id: 'dix', role: 'addend', en: 'ten', fr: 'dix', value: 10, note: 'No new word — seventy is sixty-ten.' },
          ],
          focus: ['dix'],
        },
        {
          tokens: [
            { id: 'soixante', role: 'base', en: 'sixty', fr: 'soixante', value: 60 },
            { id: 'onze', role: 'addend', en: 'eleven', fr: 'et onze', value: 11, note: 'The one exception: 71 glues "et" onto onze, not onto un. Sixty-and-eleven.' },
          ],
          focus: ['onze'],
        },
        {
          tokens: [
            { id: 'soixante', role: 'base', en: 'sixty', fr: 'soixante', value: 60 },
            { id: 'quinze', role: 'addend', en: 'fifteen', fr: 'quinze', value: 15 },
          ],
        },
      ],
      check: {
        tokens: [
          { id: 'soixante', role: 'base', en: 'sixty', fr: 'soixante', value: 60 },
          { id: 'treize', role: 'addend', en: 'thirteen', fr: 'treize', value: 13 },
        ],
      },
    },
    {
      id: 'eighty-multiplies',
      title: '80 does multiplication',
      idea: 'Eighty isn\'t a new word either — it\'s four twenties. Quatre-vingts, literally "four-twenty(s)".',
      sentences: [
        {
          tokens: [
            { id: 'quatre', role: 'multiplier', en: 'four', fr: 'quatre', value: 4 },
            { id: 'vingt', role: 'base', en: 'twenty', fr: 'vingts', value: 20, note: 'vingt takes an s here — with nothing after it, it\'s a plain plural: four twenties.' },
          ],
          focus: ['quatre', 'vingt'],
        },
        {
          tokens: [
            { id: 'quatre', role: 'multiplier', en: 'four', fr: 'quatre', value: 4 },
            { id: 'vingt', role: 'base', en: 'twenty', fr: 'vingt', value: 20, note: 'The s drops the moment another number follows.' },
            { id: 'deux', role: 'addend', en: 'two', fr: 'deux', value: 2 },
          ],
          focus: ['vingt'],
        },
        {
          tokens: [
            { id: 'quatre', role: 'multiplier', en: 'four', fr: 'quatre', value: 4 },
            { id: 'vingt', role: 'base', en: 'twenty', fr: 'vingt', value: 20 },
            { id: 'huit', role: 'addend', en: 'eight', fr: 'huit', value: 8 },
          ],
        },
      ],
      check: {
        tokens: [
          { id: 'quatre', role: 'multiplier', en: 'four', fr: 'quatre', value: 4 },
          { id: 'vingt', role: 'base', en: 'twenty', fr: 'vingt', value: 20 },
          { id: 'six', role: 'addend', en: 'six', fr: 'six', value: 6 },
        ],
      },
    },
    {
      id: 'ninety-doubles-down',
      title: '90 stacks both tricks',
      idea: 'Ninety takes the eighty trick and adds the seventy trick on top: four twenties, plus ten.',
      sentences: [
        {
          tokens: [
            { id: 'quatre', role: 'multiplier', en: 'four', fr: 'quatre', value: 4 },
            { id: 'vingt', role: 'base', en: 'twenty', fr: 'vingt', value: 20 },
            { id: 'dix', role: 'addend', en: 'ten', fr: 'dix', value: 10, note: 'Four twenties plus ten — no new word for ninety, same trick as seventy.' },
          ],
          focus: ['dix'],
        },
        {
          tokens: [
            { id: 'quatre', role: 'multiplier', en: 'four', fr: 'quatre', value: 4 },
            { id: 'vingt', role: 'base', en: 'twenty', fr: 'vingt', value: 20 },
            { id: 'onze', role: 'addend', en: 'eleven', fr: 'onze', value: 11, note: 'No "et" here — that trick only ever happens after soixante.' },
          ],
        },
        {
          tokens: [
            { id: 'quatre', role: 'multiplier', en: 'four', fr: 'quatre', value: 4 },
            { id: 'vingt', role: 'base', en: 'twenty', fr: 'vingt', value: 20 },
            { id: 'dixneuf', role: 'addend', en: 'nineteen', fr: 'dix-neuf', value: 19 },
          ],
        },
      ],
      check: {
        tokens: [
          { id: 'quatre', role: 'multiplier', en: 'four', fr: 'quatre', value: 4 },
          { id: 'vingt', role: 'base', en: 'twenty', fr: 'vingt', value: 20 },
          { id: 'seize', role: 'addend', en: 'sixteen', fr: 'seize', value: 16 },
        ],
      },
    },
    {
      id: 'the-sane-alternative',
      title: 'Belgium and Switzerland said no',
      idea: 'Septante, huitante, nonante — regional French swaps out the tricky decade names, but still adds a digit on top exactly like sixty does.',
      sentences: [
        {
          tokens: [
            { id: 'septante', role: 'base', en: 'seventy', fr: 'septante', value: 70, note: 'Used in Belgium, Switzerland, and parts of DR Congo instead of soixante-dix.' },
            { id: 'un', role: 'addend', en: 'one', fr: 'et un', value: 1, note: 'Still gets the "et" treatment, just like soixante et un.' },
          ],
        },
        {
          tokens: [
            { id: 'nonante', role: 'base', en: 'ninety', fr: 'nonante', value: 90, note: 'Belgium and Switzerland both say nonante instead of quatre-vingt-dix.' },
            { id: 'deux', role: 'addend', en: 'two', fr: 'deux', value: 2 },
          ],
        },
      ],
      check: {
        tokens: [
          { id: 'huitante', role: 'base', en: 'eighty', fr: 'huitante', value: 80, note: 'Mainly Swiss (Vaud, Valais, Fribourg) — instead of quatre-vingts. Belgium still says quatre-vingts.' },
          { id: 'trois', role: 'addend', en: 'three', fr: 'trois', value: 3 },
        ],
      },
    },
  ],
};
