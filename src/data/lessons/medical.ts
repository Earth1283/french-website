import type { Lesson } from '../../types';

export const medicalLessons: Lesson[] = [
  {
    id: 'medical-1',
    title: 'Body Parts & Symptoms',
    subtitle: 'You ate something. You don\'t know what. Your stomach has opinions.',
    xpReward: 25,
    vocab: [
      {
        french: 'J\'ai mal à...',
        english: 'I have pain in my...',
        pronunciation: 'ʒɛ mal a',
        example: 'J\'ai mal à la tête.',
        exampleTranslation: 'I have a headache.',
        funnyNote: '"J\'ai mal à" + body part. The most useful medical construction in French.',
      },
      {
        french: 'la tête',
        english: 'head',
        pronunciation: 'la tɛt',
      },
      {
        french: 'le ventre / l\'estomac',
        english: 'stomach / belly',
        pronunciation: 'lə vɑ̃tʁ / lɛstɔma',
      },
      {
        french: 'le dos',
        english: 'back',
        pronunciation: 'lə do',
      },
      {
        french: 'la gorge',
        english: 'throat',
        pronunciation: 'la ɡɔʁʒ',
        funnyNote: '"J\'ai mal à la gorge" = sore throat. Very common.',
      },
      {
        french: 'Je me sens mal',
        english: 'I feel sick / I feel bad',
        pronunciation: 'ʒə mə sɑ̃ mal',
      },
      {
        french: 'J\'ai de la fièvre',
        english: 'I have a fever',
        pronunciation: 'ʒɛ də la fjɛvʁ',
      },
      {
        french: 'Je vomis',
        english: 'I\'m vomiting',
        pronunciation: 'ʒə vɔmi',
        funnyNote: 'Unglamorous but critical vocabulary.',
      },
      {
        french: 'Appelez un médecin !',
        english: 'Call a doctor!',
        pronunciation: 'aple œ̃ medsɛ̃',
      },
      {
        french: 'Où est l\'hôpital ?',
        english: 'Where is the hospital?',
        pronunciation: 'u ɛ lopital',
      },
    ],
    exercises: [
      {
        type: 'translation',
        prompt: 'Say "I have a stomachache"',
        answer: "J'ai mal au ventre",
        hint: '"J\'ai mal à" + le ventre → au ventre (à + le = au)',
      },
      {
        type: 'multiple-choice',
        prompt: 'You feel sick and need a doctor. What do you shout?',
        answer: 'Appelez un médecin !',
        options: ['Je suis malade', 'Appelez un médecin !', 'Aide-moi s\'il te plaît', 'Docteur ici !'],
      },
      {
        type: 'fill-blank',
        prompt: '"Où est ___ ?" (Where is the hospital?)',
        answer: "l'hôpital",
        hint: '"Hospital" in French, with the article',
      },
    ],
  },
];
