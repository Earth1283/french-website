import type { Lesson } from '../../types';

export const grammarLessons: Lesson[] = [
  {
    id: 'grammar-1',
    title: 'Gender: The Horror',
    subtitle: 'Every noun is masculine or feminine. There is no escape.',
    xpReward: 30,
    vocab: [
      {
        french: 'Le / La / L\'',
        english: 'The (masculine / feminine / before vowel)',
        pronunciation: 'lə / la / l',
        funnyNote: 'Every single noun has a gender. "Le soleil" (the sun) is masculine. "La lune" (the moon) is feminine. Many assignments seem completely random — because they are. Memorise and move on.',
      },
      {
        french: 'Un / Une',
        english: 'A/An (masculine / feminine)',
        pronunciation: 'œ̃ / yn',
        funnyNote: '"Un homme" (a man) vs "une femme" (a woman). The articles match the noun\'s grammatical gender, not any logical gender.',
      },
      {
        french: 'Les',
        english: 'The (plural)',
        pronunciation: 'le',
        funnyNote: 'Plural for everything. "Les hommes, les femmes, les croissants." Blissfully genderless.',
      },
      {
        french: 'Du / De la / De l\'',
        english: 'Some (partitive article)',
        pronunciation: 'dy / də la / də l',
        example: 'Je veux du pain.',
        exampleTranslation: 'I want some bread.',
        funnyNote: 'This does not exist in English. "Give me bread" in French requires "du" (masculine) or "de la" (feminine) before the noun.',
      },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: '"Soleil" (sun) is masculine. What\'s the correct article?',
        answer: 'Le soleil',
        options: ['La soleil', 'Le soleil', 'Les soleil', 'Un soleil'],
      },
      {
        type: 'multiple-choice',
        prompt: 'The plural article "the" in French is:',
        answer: 'Les',
        options: ['Le', 'La', 'Les', 'Des'],
      },
      {
        type: 'fill-blank',
        prompt: '"Je veux ___ pain" (I want some bread — bread is masculine)',
        answer: 'du',
        hint: 'Partitive article for masculine nouns: de + le',
      },
    ],
  },
  {
    id: 'grammar-2',
    title: 'Être & Avoir: The Two Most Important Verbs',
    subtitle: 'To be and to have. Everything in French uses one of these.',
    xpReward: 30,
    vocab: [
      {
        french: 'Je suis',
        english: 'I am',
        pronunciation: 'ʒə sɥi',
        example: 'Je suis américain.',
        exampleTranslation: 'I am American.',
      },
      {
        french: 'Tu es',
        english: 'You are (informal)',
        pronunciation: 'ty ɛ',
      },
      {
        french: 'Il / Elle est',
        english: 'He / She is',
        pronunciation: 'il / ɛl ɛ',
      },
      {
        french: 'Nous sommes',
        english: 'We are',
        pronunciation: 'nu sɔm',
      },
      {
        french: 'Vous êtes',
        english: 'You are (formal/plural)',
        pronunciation: 'vu zɛt',
      },
      {
        french: 'J\'ai',
        english: 'I have',
        pronunciation: 'ʒɛ',
        example: 'J\'ai faim.',
        exampleTranslation: 'I\'m hungry. (lit: I have hunger)',
        funnyNote: 'In French you "have" hunger, not "are" hungry. You "have" cold, not "are" cold. "Avoir" does a lot of heavy lifting.',
      },
      {
        french: 'Tu as',
        english: 'You have (informal)',
        pronunciation: 'ty a',
      },
      {
        french: 'Il / Elle a',
        english: 'He / She has',
        pronunciation: 'il / ɛl a',
      },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'How do you say "I am tired"? (fatigué = tired)',
        answer: 'Je suis fatigué',
        options: ['J\'ai fatigué', 'Je suis fatigué', 'Je fatigué', 'Moi suis fatigué'],
      },
      {
        type: 'translation',
        prompt: 'Complete: "I\'m hungry" (faim = hunger)',
        answer: "J'ai faim",
        hint: 'In French you literally "have" hunger',
      },
      {
        type: 'multiple-choice',
        prompt: '"Vous êtes" means:',
        answer: 'You are (formal)',
        options: ['We are', 'They are', 'You are (informal)', 'You are (formal)'],
      },
    ],
  },
  {
    id: 'grammar-3',
    title: 'Negation & Questions',
    subtitle: 'How to say no and ask things without sounding completely lost.',
    xpReward: 25,
    vocab: [
      {
        french: 'Ne... pas',
        english: 'Not (negation)',
        pronunciation: 'nə... pa',
        example: 'Je ne parle pas français.',
        exampleTranslation: 'I don\'t speak French.',
        funnyNote: 'The verb gets sandwiched. "Je ne [verb] pas". In casual spoken French, the "ne" often disappears: "Je parle pas français." But learn the full version first.',
      },
      {
        french: 'Est-ce que... ?',
        english: 'Question marker (is it that...?)',
        pronunciation: 'ɛskə',
        example: 'Est-ce que vous parlez anglais ?',
        exampleTranslation: 'Do you speak English?',
        funnyNote: 'Stick "est-ce que" in front of any sentence to make it a question. Works like magic.',
      },
      {
        french: 'Qu\'est-ce que... ?',
        english: 'What is it that...? / What?',
        pronunciation: 'kɛskə',
        example: 'Qu\'est-ce que c\'est ?',
        exampleTranslation: 'What is it?',
      },
      {
        french: 'Pourquoi ?',
        english: 'Why?',
        pronunciation: 'puʁkwa',
      },
      {
        french: 'Quand ?',
        english: 'When?',
        pronunciation: 'kɑ̃',
      },
    ],
    exercises: [
      {
        type: 'translation',
        prompt: 'Make this negative: "Je mange" (I eat)',
        answer: 'Je ne mange pas',
        hint: 'Sandwich the verb with "ne" and "pas"',
      },
      {
        type: 'multiple-choice',
        prompt: 'How do you ask "Do you have a reservation?"',
        answer: 'Est-ce que vous avez une réservation ?',
        options: [
          'Vous avez une réservation ?',
          'Est-ce que vous avez une réservation ?',
          'Avez vous une réservation ?',
          'Question : réservation ?',
        ],
      },
    ],
  },
];
