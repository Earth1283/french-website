import type { Lesson } from '../../types';

export const trainsLessons: Lesson[] = [
  {
    id: 'trains-1',
    title: 'Buying Your Ticket',
    subtitle: 'The machine is in French. The queue is long. You can do this.',
    xpReward: 25,
    vocab: [
      {
        french: 'Un aller simple',
        english: 'A one-way ticket',
        pronunciation: 'œ̃ n‿alɛ sɛ̃pl',
        funnyNote: 'Aller = to go. Simple = just the one direction. Add "pour [city]" and you\'re basically a rail professional.',
      },
      {
        french: 'Un aller-retour',
        english: 'A return ticket',
        pronunciation: 'œ̃ n‿alɛ ʁətuʁ',
        example: 'Un aller-retour pour Lyon, s\'il vous plaît.',
        exampleTranslation: 'A return ticket to Lyon, please.',
        funnyNote: 'Literally "a going-return". French logic is consistent when it tries.',
      },
      {
        french: 'Composter son billet',
        english: 'To validate your ticket',
        pronunciation: 'kɔ̃pɔste sɔ̃ bijɛ',
        funnyNote: 'The yellow machines at the platform entrance. You MUST stamp your ticket before boarding or face a fine. The inspector will not care about your excuses.',
      },
      {
        french: 'Le guichet',
        english: 'The ticket counter',
        pronunciation: 'lə ɡiʃɛ',
        funnyNote: 'The actual human desk. Still exists! Queue here if the machine is broken (it will be).',
      },
      {
        french: 'En quelle classe ?',
        english: 'Which class?',
        pronunciation: 'ɑ̃ kɛl klas',
        funnyNote: 'Première classe or deuxième classe. Second class is totally fine on French trains. Very civilised.',
      },
      {
        french: 'Un carnet',
        english: 'A book of 10 metro tickets',
        pronunciation: 'œ̃ kaʁnɛ',
        funnyNote: 'Cheaper per trip than single tickets. The Navigo pass is even better for a week or more. Ask at the guichet.',
      },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'You\'re going to Bordeaux and coming back. What do you ask for?',
        answer: 'Un aller-retour pour Bordeaux',
        options: [
          'Un aller simple pour Bordeaux',
          'Un aller-retour pour Bordeaux',
          'Deux billets pour Bordeaux',
          'Un ticket pour Bordeaux',
        ],
      },
      {
        type: 'fill-blank',
        prompt: 'Before boarding, you MUST ___ votre billet at the yellow machine.',
        answer: 'composter',
        hint: 'The verb for validating/stamping a ticket',
      },
      {
        type: 'translation',
        prompt: 'How do you say "A one-way ticket to Paris, please"?',
        answer: 'Un aller simple pour Paris, s\'il vous plaît',
        hint: 'Un aller simple pour [city]',
      },
    ],
  },
  {
    id: 'trains-2',
    title: 'Platforms & Surviving the SNCF',
    subtitle: 'Your train is on platform 12B. You have 4 minutes. Bon courage.',
    xpReward: 25,
    vocab: [
      {
        french: 'Le quai / la voie',
        english: 'The platform / the track',
        pronunciation: 'lə kɛ / la vwa',
        funnyNote: '"Voie" appears on the departure board. "Quai" is the physical platform. They\'re used interchangeably in conversation. Check the board — it updates late, on purpose, for sport.',
      },
      {
        french: 'En retard / À l\'heure',
        english: 'Late / On time',
        pronunciation: 'ɑ̃ ʁətaʁ / a lœʁ',
        funnyNote: '"Mon train est en retard" is one of the most-used sentences in France. The SNCF is not always reliable. This is fine. Breathe.',
      },
      {
        french: 'La voiture numéro...',
        english: 'Carriage number...',
        pronunciation: 'la vwatyʁ nymɛʁo',
        funnyNote: '"Voiture" means car AND train carriage. Find the number on your ticket and look for it on the platform composition display.',
      },
      {
        french: 'Le contrôleur',
        english: 'The ticket inspector',
        pronunciation: 'lə kɔ̃tʁolœʁ',
        funnyNote: 'They will find you. They always find you. Have your ticket ready — paper or phone app both work.',
      },
      {
        french: 'La correspondance',
        english: 'The connection / transfer',
        pronunciation: 'la kɔʁɛspɔ̃dɑ̃s',
        example: 'J\'ai une correspondance à Paris.',
        exampleTranslation: 'I have a connection in Paris.',
        funnyNote: 'Missing a correspondance is a French rite of passage.',
      },
      {
        french: 'Le tableau des départs',
        english: 'The departures board',
        pronunciation: 'lə tablo de depaʁ',
        funnyNote: 'Often listed as a "Départs" screen. Yellow screens at big stations. The track is only announced 10–20 minutes before departure — this is intentional and you\'ll get used to it.',
      },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'The departures board shows your train is "en retard". What does this mean?',
        answer: 'Your train is late',
        options: [
          'Your train is cancelled',
          'Your train is late',
          'Your train is on time',
          'Your train changed platform',
        ],
      },
      {
        type: 'multiple-choice',
        prompt: 'What is a "contrôleur" on a French train?',
        answer: 'The ticket inspector',
        options: [
          'The train driver',
          'The ticket machine',
          'The ticket inspector',
          'The station manager',
        ],
      },
      {
        type: 'translation',
        prompt: 'How do you say "I have a connection in Lyon"?',
        answer: 'J\'ai une correspondance à Lyon',
        hint: '"J\'ai une correspondance à..."',
      },
    ],
  },
];
