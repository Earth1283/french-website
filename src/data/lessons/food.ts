import type { Lesson } from '../../types';

export const foodLessons: Lesson[] = [
  {
    id: 'food-1',
    title: 'The Sacred Art of Ordering Coffee',
    subtitle: 'In France, getting this wrong is a social crime.',
    xpReward: 20,
    vocab: [
      {
        french: 'Un café, s\'il vous plaît',
        english: 'A coffee, please',
        pronunciation: 'œ̃ kafe sil vu plɛ',
        funnyNote: '"Un café" is an espresso. If you want a big American coffee, say "un café allongé". Do not ask for a "grande". Just don\'t.',
      },
      {
        french: 'Un café au lait',
        english: 'Coffee with milk (breakfast style)',
        pronunciation: 'œ̃ kafe o lɛ',
        funnyNote: 'This is the big bowl of coffee French people dunk their croissants into at breakfast. Charming.',
      },
      {
        french: 'Un croissant, s\'il vous plaît',
        english: 'A croissant, please',
        pronunciation: 'œ̃ kʁwasɑ̃ sil vu plɛ',
        funnyNote: 'The correct pronunciation is NOT "croy-sant". It\'s "kwah-sahn". Your soul will cringe the first time you say it right, but you\'ll feel proud afterwards.',
      },
      {
        french: 'L\'addition, s\'il vous plaît',
        english: 'The bill, please',
        pronunciation: 'ladisjɔ̃ sil vu plɛ',
        funnyNote: 'French waiters will NOT bring the bill until you ask. You could sit there for geological epochs. Ask for it.',
      },
      {
        french: 'C\'est délicieux !',
        english: 'It\'s delicious!',
        pronunciation: 'sɛ delisjø',
        funnyNote: 'Say this whenever you eat anything. The French will beam.',
      },
      {
        french: 'La carte, s\'il vous plaît',
        english: 'The menu, please',
        pronunciation: 'la kaʁt sil vu plɛ',
        funnyNote: '"La carte" is the menu. "Le menu" is actually the fixed-price meal deal. French is designed to trip you up.',
      },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'You\'re at a Parisian café. You want an espresso. What do you say?',
        answer: 'Un café, s\'il vous plaît',
        options: ['Un grand café', 'Un café, s\'il vous plaît', 'Un espresso, please', 'Je voudrais un Starbucks'],
      },
      {
        type: 'translation',
        prompt: 'How do you ask for the bill?',
        answer: "L'addition, s'il vous plaît",
        hint: '"L\'addition" means "the bill"',
      },
      {
        type: 'multiple-choice',
        prompt: 'You want to see the menu. What do you ask for?',
        answer: 'La carte, s\'il vous plaît',
        options: ['Le menu, s\'il vous plaît', 'La carte, s\'il vous plaît', 'La liste', 'Les options'],
      },
    ],
  },
  {
    id: 'food-2',
    title: 'At the Restaurant: Ordering & Surviving',
    subtitle: 'Navigate a French menu without accidentally ordering offal.',
    xpReward: 25,
    vocab: [
      {
        french: 'Je voudrais...',
        english: 'I would like...',
        pronunciation: 'ʒə vudʁɛ',
        example: 'Je voudrais le poulet, s\'il vous plaît.',
        exampleTranslation: 'I would like the chicken, please.',
        funnyNote: 'More polite than "Je veux" (I want). Don\'t use "Je veux" with strangers unless you want them to judge you silently.',
      },
      {
        french: 'Qu\'est-ce que vous recommandez ?',
        english: 'What do you recommend?',
        pronunciation: 'kɛskə vu ʁəkɔmɑ̃de',
        funnyNote: 'This question has a magic effect on French waiters. They suddenly become human.',
      },
      {
        french: 'Je suis végétarien(ne)',
        english: 'I\'m vegetarian',
        pronunciation: 'ʒə sɥi veʒetaʁjɛ̃',
        funnyNote: 'Be prepared to have a philosophical discussion. France is improving on this front, but slowly.',
      },
      {
        french: 'Je suis allergique à...',
        english: 'I\'m allergic to...',
        pronunciation: 'ʒə sɥi alɛʁʒik a',
        funnyNote: 'Important. Very important. Say this clearly and slowly.',
      },
      {
        french: 'C\'est trop salé / sucré / épicé',
        english: 'It\'s too salty / sweet / spicy',
        pronunciation: 'sɛ tʁo sale / sykʁe / epise',
        funnyNote: 'Complaining about food in France is a delicate art. Tread carefully.',
      },
      {
        french: 'Une carafe d\'eau, s\'il vous plaît',
        english: 'A jug of tap water, please',
        pronunciation: 'yn kaʁaf do sil vu plɛ',
        funnyNote: 'FREE in French restaurants by law. They can\'t refuse this. Knowing this will save you money.',
      },
    ],
    exercises: [
      {
        type: 'translation',
        prompt: 'Say "I would like the fish, please" (le poisson = fish)',
        answer: 'Je voudrais le poisson, s\'il vous plaît',
        hint: 'Start with "Je voudrais..."',
      },
      {
        type: 'multiple-choice',
        prompt: 'You\'re vegetarian. What do you say to the waiter?',
        answer: 'Je suis végétarien',
        options: ['Je mange pas viande', 'Je suis végétarien', 'Pas de viande, merci', 'Je ne veux pas meat'],
      },
      {
        type: 'fill-blank',
        prompt: 'Free water in French restaurants: "Une ___ d\'eau, s\'il vous plaît"',
        answer: 'carafe',
        hint: 'The container that holds the water',
      },
    ],
  },
  {
    id: 'food-3',
    title: 'Boulangerie Basics',
    subtitle: 'The bread is non-negotiable. You must buy bread.',
    xpReward: 15,
    vocab: [
      {
        french: 'Une baguette, s\'il vous plaît',
        english: 'A baguette, please',
        pronunciation: 'yn baɡɛt sil vu plɛ',
        funnyNote: 'A well-baked baguette. Carrying one under your arm is not a stereotype, it\'s a lifestyle.',
      },
      {
        french: 'Bien cuite',
        english: 'Well done / crispy',
        pronunciation: 'bjɛ̃ kɥit',
        funnyNote: 'Ask for this if you want a darker, crunchier baguette. Some bakeries will look at you knowingly.',
      },
      {
        french: 'Un pain au chocolat',
        english: 'A chocolate croissant',
        pronunciation: 'œ̃ pɛ̃ o ʃɔkɔla',
        funnyNote: 'NOT a "chocolatine". Unless you\'re in southwest France. This debate is their version of the pronunciation war.',
      },
      {
        french: 'C\'est combien ?',
        english: 'How much is it?',
        pronunciation: 'sɛ kɔ̃bjɛ̃',
        funnyNote: 'A baguette costs about €1–€1.50. If it\'s more, you\'re in a tourist trap.',
      },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'You want a crispy baguette. What extra word do you add?',
        answer: 'Bien cuite',
        options: ['Très bonne', 'Bien cuite', 'Extra croustillante', 'Avec crunch'],
      },
      {
        type: 'translation',
        prompt: 'How do you ask "How much is it?"',
        answer: "C'est combien ?",
        hint: 'It literally means "It\'s how much?"',
      },
    ],
  },
];
