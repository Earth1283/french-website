import type { Lesson } from '../../types';

export const buildingBlocksLessons: Lesson[] = [
  {
    id: 'building-blocks-1',
    title: 'Colors: Say What You See',
    subtitle: 'Because "the red one, please" is more useful than you think.',
    xpReward: 15,
    vocab: [
      {
        french: 'rouge',
        english: 'red',
        pronunciation: 'ʁuʒ',
        example: 'Un vin rouge',
        exampleTranslation: 'A red wine',
      },
      {
        french: 'bleu(e)',
        english: 'blue',
        pronunciation: 'blø / bløz',
        example: 'La mer est bleue.',
        exampleTranslation: 'The sea is blue.',
      },
      {
        french: 'vert(e)',
        english: 'green',
        pronunciation: 'vɛʁ / vɛʁt',
        example: 'Une pomme verte',
        exampleTranslation: 'A green apple',
        funnyNote: 'The feminine adds a T sound that\'s audible: vɛʁt.',
      },
      {
        french: 'jaune',
        english: 'yellow',
        pronunciation: 'ʒon',
        funnyNote: 'Same form for masc and fem. Easy win.',
      },
      {
        french: 'blanc / blanche',
        english: 'white',
        pronunciation: 'blɑ̃ / blɑ̃ʃ',
        funnyNote: 'One of the trickier agreements — the feminine "blanche" adds that -che ending that you can hear.',
      },
      {
        french: 'noir(e)',
        english: 'black',
        pronunciation: 'nwaʁ',
      },
      {
        french: 'gris(e)',
        english: 'grey',
        pronunciation: 'ɡʁi / ɡʁiz',
      },
      {
        french: 'rose',
        english: 'pink',
        pronunciation: 'ʁoz',
        funnyNote: 'Same form regardless of gender.',
      },
      {
        french: 'orange',
        english: 'orange',
        pronunciation: 'oʁɑ̃ʒ',
        funnyNote: 'Invariable — never changes, regardless of gender or number.',
      },
      {
        french: 'violet / violette',
        english: 'purple / violet',
        pronunciation: 'vjolɛ / vjolɛt',
      },
      {
        french: 'marron',
        english: 'brown',
        pronunciation: 'maʁɔ̃',
        funnyNote: 'Literally "chestnut". Marron is invariable — never changes form, unlike most adjectives.',
      },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'What color is "rouge"?',
        answer: 'Red',
        options: ['Blue', 'Red', 'Green', 'Yellow'],
      },
      {
        type: 'translation',
        prompt: 'How do you say "a red wine" in French?',
        answer: 'Un vin rouge',
        hint: 'Adjectives come after the noun in French',
      },
      {
        type: 'multiple-choice',
        prompt: 'Which color is invariable — never changes form?',
        answer: 'orange',
        options: ['blanc', 'vert', 'orange', 'violet'],
      },
    ],
  },
  {
    id: 'building-blocks-2',
    title: 'Days of the Week',
    subtitle: 'No capital letters, Monday starts the week, and the weekend is a concept.',
    xpReward: 20,
    vocab: [
      {
        french: 'lundi',
        english: 'Monday',
        pronunciation: 'lœ̃di',
        funnyNote: 'Days are never capitalized in French. The calendar week starts on Monday, not Sunday.',
      },
      {
        french: 'mardi',
        english: 'Tuesday',
        pronunciation: 'maʁdi',
      },
      {
        french: 'mercredi',
        english: 'Wednesday',
        pronunciation: 'mɛʁkʁədi',
      },
      {
        french: 'jeudi',
        english: 'Thursday',
        pronunciation: 'ʒødi',
      },
      {
        french: 'vendredi',
        english: 'Friday',
        pronunciation: 'vɑ̃dʁədi',
      },
      {
        french: 'samedi',
        english: 'Saturday',
        pronunciation: 'samdi',
      },
      {
        french: 'dimanche',
        english: 'Sunday',
        pronunciation: 'dimɑ̃ʃ',
        funnyNote: 'Sunday is the 7th day on French calendars, not the 1st. Most shops are closed. Not a minor inconvenience — a cultural institution.',
      },
      {
        french: 'aujourd\'hui',
        english: 'today',
        pronunciation: 'oʒuʁdɥi',
        funnyNote: 'Literally "on the day of today" — it\'s very layered. But entirely normal to say.',
      },
      {
        french: 'demain',
        english: 'tomorrow',
        pronunciation: 'dəmɛ̃',
      },
      {
        french: 'hier',
        english: 'yesterday',
        pronunciation: 'jɛʁ',
      },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'Which day comes after mercredi (Wednesday)?',
        answer: 'Jeudi',
        options: ['Mardi', 'Lundi', 'Jeudi', 'Samedi'],
      },
      {
        type: 'translation',
        prompt: 'How do you say "yesterday" in French?',
        answer: 'hier',
        hint: 'Sounds like "yair"',
      },
      {
        type: 'fill-blank',
        prompt: '___jourd\'hui means "today"',
        answer: 'au',
        hint: 'Au + jour + d\'hui',
      },
    ],
  },
  {
    id: 'building-blocks-3',
    title: 'Months, Seasons & Dates',
    subtitle: 'The date system is perfectly logical once you stop expecting it to be English.',
    xpReward: 20,
    vocab: [
      {
        french: 'janvier / février / mars',
        english: 'January / February / March',
        pronunciation: 'ʒɑ̃vje / fevʁije / maʁs',
      },
      {
        french: 'avril / mai / juin',
        english: 'April / May / June',
        pronunciation: 'avʁil / mɛ / ʒɥɛ̃',
      },
      {
        french: 'juillet / août / septembre',
        english: 'July / August / September',
        pronunciation: 'ʒɥijɛ / u / sɛptɑ̃bʁ',
        funnyNote: '"Août" is the stealth word — technically "ut" or just a brief "oo". Many native speakers barely say it.',
      },
      {
        french: 'octobre / novembre / décembre',
        english: 'October / November / December',
        pronunciation: 'ɔktɔbʁ / nɔvɑ̃bʁ / desɑ̃bʁ',
      },
      {
        french: 'le printemps / l\'été',
        english: 'spring / summer',
        pronunciation: 'pʁɛ̃tɑ̃ / lete',
        funnyNote: 'Use "au" before printemps: "au printemps". Use "en" before the others: en été, en automne, en hiver.',
      },
      {
        french: 'l\'automne / l\'hiver',
        english: 'autumn / winter',
        pronunciation: 'lotɔn / livɛʁ',
      },
      {
        french: 'le premier janvier',
        english: 'the 1st of January',
        pronunciation: 'lə pʁəmje ʒɑ̃vje',
        funnyNote: 'For the 1st, use "premier". For all other dates, use the cardinal number: le deux février, le vingt mars, etc.',
      },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'Which month comes after juillet (July)?',
        answer: 'Août',
        options: ['Juin', 'Septembre', 'Août', 'Mai'],
      },
      {
        type: 'translation',
        prompt: 'How do you say "in summer" in French?',
        answer: 'en été',
        hint: 'Use "en" before vowel-starting seasons',
      },
      {
        type: 'multiple-choice',
        prompt: 'How do you say "the 1st of March"?',
        answer: 'le premier mars',
        options: ['le un mars', 'le premier mars', 'le 1 mars', 'une mars'],
      },
    ],
  },
];
