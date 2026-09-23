import type { InteractiveLesson } from '../../types';

export const numbersTime: InteractiveLesson = {
  lessonId: 'numbers-3',
  scenes: [
    {
      id: 'hour-plus-minutes',
      title: 'Time starts like a number',
      idea: 'Telling time begins exactly like counting: the hour, then the minutes glued straight on — no colon, no "and".',
      sentences: [
        {
          tokens: [
            { id: 'il', role: 'subject', en: 'It', fr: 'Il' },
            { id: 'est', role: 'verb', en: 'is', fr: 'est' },
            { id: 'trois', role: 'hour', en: 'three', fr: 'trois', value: 3 },
            { id: 'heures', role: 'noun', fr: 'heures', note: '"heures" (hours) has no English equivalent here — English just says "three twenty".' },
            { id: 'vingt', role: 'fraction', en: 'twenty', fr: 'vingt', value: 20 },
          ],
          focus: ['heures'],
        },
        {
          tokens: [
            { id: 'il', role: 'subject', en: 'It', fr: 'Il' },
            { id: 'est', role: 'verb', en: 'is', fr: 'est' },
            { id: 'une', role: 'hour', en: 'one', fr: 'une', value: 1, note: '"Une", not "un" — heure is feminine, so one o\'clock agrees with it.' },
            { id: 'heure', role: 'noun', fr: 'heure', note: 'Singular "heure" — only 1h00 drops the s.' },
            { id: 'dix', role: 'fraction', en: 'ten', fr: 'dix', value: 10 },
          ],
          focus: ['une'],
        },
        {
          tokens: [
            { id: 'il', role: 'subject', en: 'It', fr: 'Il' },
            { id: 'est', role: 'verb', en: 'is', fr: 'est' },
            { id: 'huit', role: 'hour', en: 'eight', fr: 'huit', value: 8 },
            { id: 'heures', role: 'noun', fr: 'heures' },
            { id: 'cinq', role: 'fraction', en: 'five', fr: 'cinq', value: 5 },
          ],
        },
      ],
      check: {
        tokens: [
          { id: 'il', role: 'subject', en: 'It', fr: 'Il' },
          { id: 'est', role: 'verb', en: 'is', fr: 'est' },
          { id: 'neuf', role: 'hour', en: 'nine', fr: 'neuf', value: 9 },
          { id: 'heures', role: 'noun', fr: 'heures' },
          { id: 'quinze', role: 'fraction', en: 'fifteen', fr: 'quinze', value: 15 },
        ],
      },
    },
    {
      id: 'named-fractions',
      title: 'Quarters and halves get names',
      idea: 'At :15 and :30, French swaps the raw minute count for a named fraction — quart (quarter) or demie (half) — glued on with "et".',
      sentences: [
        {
          tokens: [
            { id: 'il', role: 'subject', en: 'It', fr: 'Il' },
            { id: 'est', role: 'verb', en: 'is', fr: 'est' },
            { id: 'quatre', role: 'hour', en: 'four', fr: 'quatre', value: 4 },
            { id: 'heures', role: 'noun', fr: 'heures' },
            { id: 'quart', role: 'fraction', en: 'a quarter', fr: 'et quart', note: '"et quart" = "and a quarter" — 15 minutes past.' },
          ],
          focus: ['quart'],
        },
        {
          tokens: [
            { id: 'il', role: 'subject', en: 'It', fr: 'Il' },
            { id: 'est', role: 'verb', en: 'is', fr: 'est' },
            { id: 'une', role: 'hour', en: 'one', fr: 'une', value: 1 },
            { id: 'heure', role: 'noun', fr: 'heure' },
            { id: 'demie', role: 'fraction', en: 'a half', fr: 'et demie', note: '"et demie" = "and a half" — 30 minutes past. Demie is feminine to agree with heure.' },
          ],
          focus: ['demie'],
        },
        {
          tokens: [
            { id: 'il', role: 'subject', en: 'It', fr: 'Il' },
            { id: 'est', role: 'verb', en: 'is', fr: 'est' },
            { id: 'six', role: 'hour', en: 'six', fr: 'six', value: 6 },
            { id: 'heures', role: 'noun', fr: 'heures' },
            { id: 'demie', role: 'fraction', en: 'a half', fr: 'et demie' },
          ],
        },
      ],
      check: {
        tokens: [
          { id: 'il', role: 'subject', en: 'It', fr: 'Il' },
          { id: 'est', role: 'verb', en: 'is', fr: 'est' },
          { id: 'deux', role: 'hour', en: 'two', fr: 'deux', value: 2 },
          { id: 'heures', role: 'noun', fr: 'heures' },
          { id: 'quart', role: 'fraction', en: 'a quarter', fr: 'et quart' },
        ],
      },
    },
    {
      id: 'counting-down-to-next-hour',
      title: 'Past the half, count down',
      idea: 'After :30, French stops counting up from the current hour and starts counting DOWN from the next one, with "moins" (minus).',
      sentences: [
        {
          tokens: [
            { id: 'il', role: 'subject', en: 'It', fr: 'Il' },
            { id: 'est', role: 'verb', en: 'is', fr: 'est' },
            { id: 'quatre', role: 'hour', en: 'four', fr: 'quatre', value: 4, note: 'This says the clock time is 3:45 — but the hour word is already "four". French jumps to the next hour first.' },
            { id: 'heures', role: 'noun', fr: 'heures' },
            { id: 'moinsquart', role: 'fraction', en: 'minus a quarter', fr: 'moins le quart', note: '"moins le quart" = "minus a quarter" — 15 minutes before four, i.e. 3:45.' },
          ],
          focus: ['quatre', 'moinsquart'],
        },
        {
          tokens: [
            { id: 'il', role: 'subject', en: 'It', fr: 'Il' },
            { id: 'est', role: 'verb', en: 'is', fr: 'est' },
            { id: 'cinq', role: 'hour', en: 'five', fr: 'cinq', value: 5, note: 'Clock says 4:50, hour word says "five" — same next-hour jump.' },
            { id: 'heures', role: 'noun', fr: 'heures' },
            { id: 'moinsdix', role: 'fraction', en: 'minus ten', fr: 'moins dix' },
          ],
        },
        {
          tokens: [
            { id: 'il', role: 'subject', en: 'It', fr: 'Il' },
            { id: 'est', role: 'verb', en: 'is', fr: 'est' },
            { id: 'neuf', role: 'hour', en: 'nine', fr: 'neuf', value: 9 },
            { id: 'heures', role: 'noun', fr: 'heures' },
            { id: 'moinsvingt', role: 'fraction', en: 'minus twenty', fr: 'moins vingt' },
          ],
        },
      ],
      check: {
        tokens: [
          { id: 'il', role: 'subject', en: 'It', fr: 'Il' },
          { id: 'est', role: 'verb', en: 'is', fr: 'est' },
          { id: 'dix', role: 'hour', en: 'ten', fr: 'dix', value: 10 },
          { id: 'heures', role: 'noun', fr: 'heures' },
          { id: 'moinscinq', role: 'fraction', en: 'minus five', fr: 'moins cinq' },
        ],
      },
    },
    {
      id: 'the-24-hour-escape',
      title: 'Official time skips the tricks entirely',
      idea: 'Trains, TV listings, and appointments use the 24-hour clock — plain hour plus plain minutes, every time. No quarts, no demies, no moins.',
      sentences: [
        {
          tokens: [
            { id: 'il', role: 'subject', en: 'It', fr: 'Il' },
            { id: 'est', role: 'verb', en: 'is', fr: 'est' },
            { id: 'treize', role: 'hour', en: 'thirteen', fr: 'treize', value: 13, note: '13h00 = 1pm. No "moins", no "et" — just the number.' },
            { id: 'heures', role: 'noun', fr: 'heures' },
          ],
          focus: ['treize'],
        },
        {
          tokens: [
            { id: 'il', role: 'subject', en: 'It', fr: 'Il' },
            { id: 'est', role: 'verb', en: 'is', fr: 'est' },
            { id: 'vingt', role: 'hour', en: 'twenty', fr: 'vingt', value: 20 },
            { id: 'heures', role: 'noun', fr: 'heures' },
            { id: 'trente', role: 'fraction', en: 'thirty', fr: 'trente', value: 30 },
          ],
        },
        {
          tokens: [
            { id: 'il', role: 'subject', en: 'It', fr: 'Il' },
            { id: 'est', role: 'verb', en: 'is', fr: 'est' },
            { id: 'dixhuit', role: 'hour', en: 'eighteen', fr: 'dix-huit', value: 18 },
            { id: 'heures', role: 'noun', fr: 'heures' },
            { id: 'quarantecinq', role: 'fraction', en: 'forty-five', fr: 'quarante-cinq', value: 45, note: 'Even past the half hour, still no "moins" — 18h45, plainly.' },
          ],
        },
      ],
      check: {
        tokens: [
          { id: 'il', role: 'subject', en: 'It', fr: 'Il' },
          { id: 'est', role: 'verb', en: 'is', fr: 'est' },
          { id: 'vingtdeux', role: 'hour', en: 'twenty-two', fr: 'vingt-deux', value: 22 },
          { id: 'heures', role: 'noun', fr: 'heures' },
          { id: 'quinze', role: 'fraction', en: 'fifteen', fr: 'quinze', value: 15 },
        ],
      },
    },
  ],
};
