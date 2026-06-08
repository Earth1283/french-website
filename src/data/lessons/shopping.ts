import type { Lesson } from '../../types';

export const shoppingLessons: Lesson[] = [
  {
    id: 'shopping-1',
    title: 'Shopping: Clothes & Sizes',
    subtitle: 'French clothing sizes will make you question your entire identity.',
    xpReward: 20,
    vocab: [
      {
        french: 'Je cherche...',
        english: 'I\'m looking for...',
        pronunciation: 'ʒə ʃɛʁʃ',
        example: 'Je cherche une veste.',
        exampleTranslation: 'I\'m looking for a jacket.',
      },
      {
        french: 'Avez-vous ça en taille... ?',
        english: 'Do you have this in size... ?',
        pronunciation: 'ave vu sa ɑ̃ taj',
        funnyNote: 'French sizes are different. A French 38 ≈ US 8 for women. You will feel like a different person.',
      },
      {
        french: 'C\'est trop grand / petit',
        english: 'It\'s too big / small',
        pronunciation: 'sɛ tʁo ɡʁɑ̃ / pəti',
      },
      {
        french: 'Je peux essayer ça ?',
        english: 'Can I try this on?',
        pronunciation: 'ʒə pø ɛsɛje sa',
        funnyNote: 'The fitting rooms are called "cabines d\'essayage". Point if needed.',
      },
      {
        french: 'Je vais le prendre',
        english: 'I\'ll take it',
        pronunciation: 'ʒə vɛ lə pʁɑ̃dʁ',
      },
      {
        french: 'Ce n\'est pas ce que je cherche',
        english: 'That\'s not what I\'m looking for',
        pronunciation: 'sə nɛ pa sə kə ʒə ʃɛʁʃ',
        funnyNote: 'A polite way to decline without causing international incident.',
      },
    ],
    exercises: [
      {
        type: 'translation',
        prompt: 'How do you say "I\'m looking for a shirt" (une chemise = shirt)?',
        answer: 'Je cherche une chemise',
        hint: 'Start with "Je cherche"',
      },
      {
        type: 'multiple-choice',
        prompt: 'The jacket is too big. What do you say?',
        answer: 'C\'est trop grand',
        options: ['C\'est trop petit', 'C\'est trop grand', 'C\'est parfait', 'Je le prends'],
      },
      {
        type: 'fill-blank',
        prompt: '"Je peux ___ ça ?" (Can I try this on?)',
        answer: 'essayer',
        hint: 'The verb "to try on"',
      },
    ],
  },
  {
    id: 'shopping-2',
    title: 'The Pharmacy: Your Unlikely Best Friend',
    subtitle: 'French pharmacies are incredible. They will solve your problems.',
    xpReward: 20,
    vocab: [
      {
        french: 'La pharmacie',
        english: 'The pharmacy',
        pronunciation: 'la faʁmasi',
        funnyNote: 'Identified by a green cross sign. Open late, staffed by actual pharmacists who can recommend treatments. Better than urgent care for minor issues.',
      },
      {
        french: 'J\'ai besoin de...',
        english: 'I need...',
        pronunciation: 'ʒɛ bəzwɛ̃ də',
        example: 'J\'ai besoin de quelque chose contre le rhume.',
        exampleTranslation: 'I need something for a cold.',
      },
      {
        french: 'J\'ai mal à la tête',
        english: 'I have a headache',
        pronunciation: 'ʒɛ mal a la tɛt',
      },
      {
        french: 'J\'ai de la fièvre',
        english: 'I have a fever',
        pronunciation: 'ʒɛ də la fjɛvʁ',
      },
      {
        french: 'Avez-vous de l\'aspirine ?',
        english: 'Do you have aspirin?',
        pronunciation: 'ave vu də laspiʁin',
      },
      {
        french: 'Une ordonnance',
        english: 'A prescription',
        pronunciation: 'yn ɔʁdɔnɑ̃s',
        funnyNote: 'Many things that require a prescription in the US are over-the-counter in France. Your pharmacist will know.',
      },
    ],
    exercises: [
      {
        type: 'translation',
        prompt: 'Say "I have a headache"',
        answer: "J'ai mal à la tête",
        hint: '"J\'ai mal à" = I have pain in/at',
      },
      {
        type: 'multiple-choice',
        prompt: 'What is a "pharmacie" identified by?',
        answer: 'A green cross',
        options: ['A red cross', 'A green cross', 'A blue circle', 'A white snake'],
      },
    ],
  },
];
