import type { Lesson } from '../../types';

export const plansLessons: Lesson[] = [
  {
    id: 'plans-1',
    title: 'Telling the Time',
    subtitle: 'France uses a 24-hour clock. Your phone helps. Learn it anyway.',
    xpReward: 20,
    vocab: [
      {
        french: 'Quelle heure est-il ?',
        english: 'What time is it?',
        pronunciation: 'kɛl œʁ ɛ til',
      },
      {
        french: 'Il est deux heures',
        english: 'It\'s two o\'clock',
        pronunciation: 'il ɛ dø zœʁ',
        funnyNote: 'Note the liaison: "deux heures" → dø-z-œʁ. Always use "heures" (plural) except for midi and minuit.',
      },
      {
        french: 'Il est midi / minuit',
        english: 'It\'s noon / midnight',
        pronunciation: 'il ɛ midi / minɥi',
        funnyNote: '"Midi" and "minuit" are singular — never say "midi heures". It\'s just "il est midi".',
      },
      {
        french: 'et quart / et demie',
        english: 'quarter past / half past',
        pronunciation: 'e kaʁ / e dəmi',
        example: 'Il est trois heures et quart.',
        exampleTranslation: 'It\'s quarter past three.',
      },
      {
        french: 'moins le quart',
        english: 'quarter to',
        pronunciation: 'mwɛ̃ lə kaʁ',
        example: 'Il est cinq heures moins le quart.',
        exampleTranslation: 'It\'s quarter to five (= 4:45).',
      },
      {
        french: 'du matin / de l\'après-midi / du soir',
        english: 'in the morning / afternoon / evening',
        pronunciation: 'dy matɛ̃ / də lapʁɛmidi / dy swaʁ',
        funnyNote: 'Formal French uses 24h: 14h00 = quatorze heures. Informal speech adds matin/après-midi/soir to clarify.',
      },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: '"Il est trois heures et demie" means?',
        answer: 'It\'s half past three',
        options: ['It\'s quarter past three', 'It\'s three o\'clock', 'It\'s half past three', 'It\'s quarter to three'],
      },
      {
        type: 'translation',
        prompt: 'How do you ask "What time is it?"',
        answer: 'Quelle heure est-il ?',
        hint: 'Quelle = which/what, heure = hour',
      },
      {
        type: 'fill-blank',
        prompt: 'Il est midi et ___ (It\'s half past noon)',
        answer: 'demie',
        hint: 'Half = demie',
      },
    ],
  },
  {
    id: 'plans-2',
    title: 'Making Plans & Appointments',
    subtitle: 'The rendez-vous is sacred in France. Don\'t be late. Don\'t cancel last-minute.',
    xpReward: 25,
    vocab: [
      {
        french: 'un rendez-vous',
        english: 'an appointment / a meeting',
        pronunciation: 'œ̃ ʁɑ̃devu',
        funnyNote: 'Literally "present yourselves". Covers everything from a doctor\'s appointment to a date — the same word for all.',
      },
      {
        french: 'Je suis libre à...',
        english: 'I\'m free at...',
        pronunciation: 'ʒə sɥi libʁ a',
        example: 'Je suis libre à 18h.',
        exampleTranslation: 'I\'m free at 6pm.',
      },
      {
        french: 'Je suis occupé(e)',
        english: 'I\'m busy',
        pronunciation: 'ʒə sɥi okype',
      },
      {
        french: 'On se retrouve où ?',
        english: 'Where shall we meet?',
        pronunciation: 'ɔ̃ sə ʁətʁuv u',
      },
      {
        french: 'Ça vous convient ?',
        english: 'Does that work for you? (formal)',
        pronunciation: 'sa vu kɔ̃vjɛ̃',
        funnyNote: 'The polished way to confirm a meeting time. Very common in professional emails and calls.',
      },
      {
        french: 'La semaine prochaine',
        english: 'Next week',
        pronunciation: 'la səmɛn pʁɔʃɛn',
      },
      {
        french: 'Ce soir / cet après-midi',
        english: 'Tonight / this afternoon',
        pronunciation: 'sə swaʁ / sɛt apʁɛmidi',
        funnyNote: '"Ce" becomes "cet" before a vowel sound: cet après-midi, cet hiver.',
      },
    ],
    exercises: [
      {
        type: 'translation',
        prompt: 'How do you say "I\'m busy tomorrow"?',
        answer: 'Je suis occupé(e) demain',
        hint: 'Occupé(e) + demain (tomorrow)',
      },
      {
        type: 'multiple-choice',
        prompt: 'What does "un rendez-vous" cover?',
        answer: 'Any appointment or meeting',
        options: [
          'Only romantic dates',
          'Only doctor\'s appointments',
          'Any appointment or meeting',
          'Only business meetings',
        ],
      },
      {
        type: 'fill-blank',
        prompt: 'On se ___ où ? (Where shall we meet?)',
        answer: 'retrouve',
        hint: 'Se retrouver = to meet up',
      },
    ],
  },
  {
    id: 'plans-3',
    title: 'Reservations & Bookings',
    subtitle: '"Je voudrais réserver" — four words that open many doors in France.',
    xpReward: 25,
    vocab: [
      {
        french: 'Je voudrais réserver...',
        english: 'I\'d like to book...',
        pronunciation: 'ʒə vudʁɛ ʁezɛʁve',
        funnyNote: '"Voudrais" is the conditional of vouloir — polite and indispensable. More polite than "je veux" (I want), which can sound blunt or demanding.',
      },
      {
        french: 'une table pour deux',
        english: 'a table for two',
        pronunciation: 'yn tabl puʁ dø',
      },
      {
        french: 'une chambre',
        english: 'a room',
        pronunciation: 'yn ʃɑ̃bʁ',
      },
      {
        french: 'Pour combien de personnes ?',
        english: 'For how many people?',
        pronunciation: 'puʁ kɔ̃bjɛ̃ də pɛʁsɔn',
      },
      {
        french: 'C\'est au nom de...',
        english: 'It\'s under the name of...',
        pronunciation: 'sɛ o nɔ̃ də',
        funnyNote: 'The phrase for giving your booking name at a restaurant or hotel. More common than saying your name unprompted.',
      },
      {
        french: 'Annuler / confirmer la réservation',
        english: 'To cancel / confirm the reservation',
        pronunciation: 'anyle / kɔ̃fiʁme la ʁezɛʁvasjɔ̃',
        funnyNote: 'French restaurants increasingly require cards for reservations. Cancellation policies are getting stricter.',
      },
    ],
    exercises: [
      {
        type: 'translation',
        prompt: 'How do you say "I\'d like to book a table for two"?',
        answer: 'Je voudrais réserver une table pour deux',
        hint: 'Je voudrais réserver + une table pour + number',
      },
      {
        type: 'multiple-choice',
        prompt: '"C\'est au nom de..." is used to:',
        answer: 'Give your name for a booking',
        options: [
          'Ask what the name is',
          'Give your name for a booking',
          'Introduce yourself formally',
          'Ask the price',
        ],
      },
      {
        type: 'fill-blank',
        prompt: 'Je ___ réserver une chambre. (I\'d like to book a room)',
        answer: 'voudrais',
        hint: 'Conditional of vouloir',
      },
    ],
  },
];
