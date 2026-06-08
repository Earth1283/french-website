import type { Lesson } from '../../types';

export const directionsLessons: Lesson[] = [
  {
    id: 'directions-1',
    title: 'Getting Around Without Getting Arrested',
    subtitle: 'Parisians walk at twice the speed of everyone else. Learn this fast.',
    xpReward: 25,
    vocab: [
      {
        french: 'Où est... ?',
        english: 'Where is... ?',
        pronunciation: 'u ɛ',
        example: 'Où est la station de métro ?',
        exampleTranslation: 'Where is the metro station?',
        funnyNote: 'The most useful two words in this course. Memorize them.',
      },
      {
        french: 'À gauche',
        english: 'To the left',
        pronunciation: 'a ɡoʃ',
        funnyNote: 'Gauche also means "awkward" in English. Think of turning left as the awkward option.',
      },
      {
        french: 'À droite',
        english: 'To the right',
        pronunciation: 'a dʁwat',
        funnyNote: '"Droite" also means "right" as in correct/right-wing. Politically charged navigation.',
      },
      {
        french: 'Tout droit',
        english: 'Straight ahead',
        pronunciation: 'tu dʁwa',
        funnyNote: 'Not "tout droite". The gender disappears here. French just does this sometimes to spite you.',
      },
      {
        french: 'Tournez à gauche / droite',
        english: 'Turn left / right',
        pronunciation: 'tuʁne a ɡoʃ / dʁwat',
      },
      {
        french: 'La station de métro',
        english: 'The metro station',
        pronunciation: 'la stasjɔ̃ də metʁo',
        funnyNote: 'Paris has one of the best metro systems on Earth. Trust it.',
      },
      {
        french: 'L\'arrêt de bus',
        english: 'The bus stop',
        pronunciation: 'laʁɛ də bys',
      },
      {
        french: 'C\'est loin ?',
        english: 'Is it far?',
        pronunciation: 'sɛ lwɛ̃',
        funnyNote: 'French people will say "non, c\'est pas loin" for things that are 30 minutes away. Be skeptical.',
      },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'You need the metro. What do you ask?',
        answer: 'Où est la station de métro ?',
        options: ['Où est le taxi ?', 'Où est la station de métro ?', 'Comment aller métro ?', 'Metro, s\'il vous plaît'],
      },
      {
        type: 'multiple-choice',
        prompt: 'Someone says "tournez à gauche". What do they mean?',
        answer: 'Turn left',
        options: ['Turn right', 'Go straight', 'Turn left', 'Stop here'],
      },
      {
        type: 'translation',
        prompt: 'How do you say "Straight ahead"?',
        answer: 'Tout droit',
        hint: 'Two words — no gender ending needed',
      },
      {
        type: 'fill-blank',
        prompt: '"___ est la pharmacie ?" (Where is the pharmacy?)',
        answer: 'Où',
        hint: 'The French word for "where"',
      },
    ],
  },
  {
    id: 'directions-2',
    title: 'Taxis, Trains & Getting Out of Trouble',
    subtitle: 'When your feet give up.',
    xpReward: 20,
    vocab: [
      {
        french: 'Appelez-moi un taxi, s\'il vous plaît',
        english: 'Call me a taxi, please',
        pronunciation: 'aple mwa œ̃ taksi sil vu plɛ',
        funnyNote: 'Or just use an app. But knowing this phrase is never wrong.',
      },
      {
        french: 'Je voudrais aller à...',
        english: 'I would like to go to...',
        pronunciation: 'ʒə vudʁɛ ale a',
        example: 'Je voudrais aller à la Tour Eiffel.',
        exampleTranslation: 'I would like to go to the Eiffel Tower.',
      },
      {
        french: 'Un aller simple / Un aller-retour',
        english: 'One way / Round trip',
        pronunciation: 'œ̃ nale sɛ̃pl / œ̃ nale ʁətuʁ',
        funnyNote: 'Know this for the train. Trains are excellent in France.',
      },
      {
        french: 'À quelle heure part le train ?',
        english: 'What time does the train leave?',
        pronunciation: 'a kɛl œʁ paʁ lə tʁɛ̃',
      },
      {
        french: 'Composez votre billet !',
        english: 'Validate your ticket!',
        pronunciation: 'kɔ̃poze vɔtʁ bijɛ',
        funnyNote: 'The yellow machines on the platform. ALWAYS stamp your ticket before boarding or face a fine. This is how they get tourists.',
      },
    ],
    exercises: [
      {
        type: 'translation',
        prompt: 'Say: "I would like to go to the airport" (l\'aéroport = airport)',
        answer: "Je voudrais aller à l'aéroport",
        hint: '"Je voudrais aller à" + destination',
      },
      {
        type: 'multiple-choice',
        prompt: 'You\'re buying a one-way train ticket. What do you ask for?',
        answer: 'Un aller simple',
        options: ['Un ticket simple', 'Un aller simple', 'Un aller seul', 'Un billet unique'],
      },
    ],
  },
];
