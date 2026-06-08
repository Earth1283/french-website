import type { Lesson } from '../../types';

export const falseFriendsLessons: Lesson[] = [
  {
    id: 'false-friends-1',
    title: 'Words That Will Betray You',
    subtitle: '"Librairie" is not a library. "Actuellement" is not "actually". These words are traps.',
    xpReward: 30,
    vocab: [
      {
        french: 'Préservatif',
        english: 'Contraceptive (NOT "preservative")',
        pronunciation: 'pʁezɛʁvatif',
        funnyNote: '"Conservateur" is the word you want for food preservatives. "Préservatif" means something very different — a common trap for English speakers.',
      },
      {
        french: 'Blessé(e)',
        english: 'Injured (NOT "blessed")',
        pronunciation: 'blɛse',
        example: 'Il est blessé.',
        exampleTranslation: 'He is injured.',
        funnyNote: 'Do not say "Je suis blessé" thinking you\'re saying "I\'m blessed". You\'re telling people you\'re hurt.',
      },
      {
        french: 'Librairie',
        english: 'Bookshop (NOT "library")',
        pronunciation: 'libʁɛʁi',
        funnyNote: 'A library is "une bibliothèque". A bookshop is "une librairie". Ask for directions to a "librairie" expecting to borrow books and you\'ll end up buying them.',
      },
      {
        french: 'Sensible',
        english: 'Sensitive (NOT "sensible")',
        pronunciation: 'sɑ̃sibl',
        funnyNote: 'Describing yourself as "très sensible" means very emotional/sensitive, not very reasonable.',
      },
      {
        french: 'Rester',
        english: 'To stay (NOT "to rest")',
        pronunciation: 'ʁɛste',
        funnyNote: '"Je veux rester ici" = I want to stay here. NOT I want to rest here. "Se reposer" means to rest.',
      },
      {
        french: 'Attendre',
        english: 'To wait (NOT "to attend")',
        pronunciation: 'atɑ̃dʁ',
        funnyNote: '"J\'attends" = I\'m waiting. Not "I\'m attending". Very different.',
      },
      {
        french: 'Actuellement',
        english: 'Currently (NOT "actually")',
        pronunciation: 'aktyɛlmɑ̃',
        funnyNote: '"Actuellement je travaille à Paris" = Currently I work in Paris. "En fait" is "actually".',
      },
      {
        french: 'Demander',
        english: 'To ask (NOT "to demand")',
        pronunciation: 'dəmɑ̃de',
        funnyNote: '"Je demande" sounds aggressive in English but it just means "I\'m asking". Breathe.',
      },
      {
        french: 'Gentil(le)',
        english: 'Kind/Nice (NOT "gentle")',
        pronunciation: 'ʒɑ̃ti',
        funnyNote: '"Il est très gentil" = He is very kind. "Doux" means gentle.',
      },
      {
        french: 'Passer un examen',
        english: 'To take an exam (NOT "to pass an exam")',
        pronunciation: 'pase œ̃ ɛɡzamɛ̃',
        funnyNote: 'You\'ve "passed" an exam in English. In French, "passer un examen" just means to sit/take it. "Réussir un examen" = to pass it.',
      },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'A tourist asks a grocer for "des préservatifs" thinking it means preservatives. What do they actually mean in French?',
        answer: 'Contraceptives',
        options: ['Food additives', 'Bandages', 'Contraceptives', 'Vitamins'],
      },
      {
        type: 'multiple-choice',
        prompt: 'What does "librairie" mean?',
        answer: 'Bookshop',
        options: ['Library', 'Bookshop', 'Book club', 'Reading room'],
      },
      {
        type: 'multiple-choice',
        prompt: '"Actuellement" means:',
        answer: 'Currently',
        options: ['Actually', 'In actuality', 'Currently', 'In reality'],
      },
      {
        type: 'multiple-choice',
        prompt: '"Je suis blessé" means:',
        answer: 'I\'m injured',
        options: ['I\'m blessed', 'I\'m surprised', 'I\'m hurt/injured', 'I\'m offended'],
      },
      {
        type: 'translation',
        prompt: 'Which French word means "to wait" (not "to attend")?',
        answer: 'attendre',
        hint: 'The deceptive cognate of "attend"',
      },
    ],
  },
];
