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
        explanation: "Je cherche means I'm looking for, from chercher (to look for). Chemise is feminine, so the article is une.",
      },
      {
        type: 'multiple-choice',
        prompt: 'The jacket is too big. What do you say?',
        answer: 'C\'est trop grand',
        options: ['C\'est trop petit', 'C\'est trop grand', 'C\'est parfait', 'Je le prends'],
        explanation: "Trop grand means too big. The distractor trop petit means too small, the opposite.",
      },
      {
        type: 'fill-blank',
        prompt: '"Je peux ___ ça ?" (Can I try this on?)',
        answer: 'essayer',
        hint: 'The verb "to try on"',
        explanation: "Essayer means to try, and in a shop it means to try something on. Ça is the object, so the verb stays in the infinitive.",
      },
      {
        type: 'multiple-choice',
        prompt: 'You love the jacket (le blouson) and want to buy it. What do you say?',
        answer: 'Je vais le prendre',
        options: ['Je vais le prendre', 'Je cherche une chemise', 'C\'est trop petit', 'Ce n\'est pas ce que je cherche'],
        explanation: "Je vais le prendre means I'll take it: le stands for le blouson. For a feminine item like la chemise, it becomes je vais la prendre.",
      },
      {
        type: 'fill-blank',
        prompt: 'C\'est trop ___ (It\'s too small)',
        answer: 'petit',
        explanation: "Trop petit means too small. Petit is the opposite of grand, and trop stays before the adjective.",
      },
      {
        type: 'translation',
        prompt: 'Ask "Do you have this in size 40?"',
        answer: 'Avez-vous ça en taille 40 ?',
        explanation: "Avez-vous is the formal question form of to have. Ça means this, en taille means in size, and the number follows.",
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
        explanation: "Avoir mal à plus the body part is how French describes pain. À la doesn't contract, unlike à le, which becomes au.",
      },
      {
        type: 'multiple-choice',
        prompt: 'What is a "pharmacie" identified by?',
        answer: 'A green cross',
        options: ['A red cross', 'A green cross', 'A blue circle', 'A white snake'],
        explanation: "A pharmacy is marked by a green cross. Red crosses belong to the Red Cross, not to pharmacies.",
      },
      {
        type: 'multiple-choice',
        prompt: 'What is "une ordonnance"?',
        answer: 'A prescription',
        options: ['A prescription', 'A pharmacy', 'An ointment', 'A fever'],
        explanation: "Une ordonnance is a prescription, a doctor's written order. Une pharmacie is the shop itself, not the paper.",
      },
      {
        type: 'fill-blank',
        prompt: 'J\'ai de la ___ (I have a fever)',
        answer: 'fièvre',
        explanation: "Fièvre is feminine, which is why the partitive is de la. The accent on fièvre is required.",
      },
      {
        type: 'fill-blank',
        prompt: 'Avez-vous de l\'___ ? (Do you have aspirin?)',
        answer: 'aspirine',
        explanation: "Aspirine is feminine, so the partitive is de l' before the vowel. This partitive is used for an unspecified amount.",
      },
      {
        type: 'translation',
        prompt: 'Say "I need aspirin"',
        answer: 'J\'ai besoin d\'aspirine',
        explanation: "Avoir besoin de means to need. Before a vowel, de contracts to d', so de aspirine becomes d'aspirine.",
      },
    ],
  },
];
