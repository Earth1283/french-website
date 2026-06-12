import type { Lesson } from '../../types';

export const cultureLessons: Lesson[] = [
  {
    id: 'culture-1',
    title: 'The Bonjour Police',
    subtitle: 'Not saying it is a genuine social crime. We are not joking.',
    xpReward: 25,
    vocab: [
      {
        french: 'Vous / Tu',
        english: 'Formal you / Informal you',
        pronunciation: 'vu / ty',
        funnyNote: 'Use "vous" with: strangers, shopkeepers, older people, your boss, anyone you just met. Use "tu" with: friends, children, colleagues who ask you to. Getting this wrong makes you seem rude OR weirdly stiff. Master it.',
      },
      {
        french: 'Faire la bise',
        english: 'To do the cheek kiss greeting',
        pronunciation: 'fɛʁ la biz',
        funnyNote: 'One kiss on each cheek (in Paris). Some regions do two, three, or four. You start by leaning to YOUR left. Do not actually make lip contact with the cheek. Make a kissing sound. This is normal.',
      },
      {
        french: 'Excusez-moi',
        english: 'Excuse me (formal)',
        pronunciation: 'ɛkskyze mwa',
        funnyNote: 'Use this to get someone\'s attention or squeeze past someone. Much more polite than just "pardon" alone.',
      },
      {
        french: 'Je vous en prie',
        english: 'You\'re welcome (formal)',
        pronunciation: 'ʒə vu z‿ɑ̃ pʁi',
        funnyNote: 'Very formal and elegant. In everyday situations "de rien" is fine. But "je vous en prie" will make shopkeepers smile at you approvingly.',
      },
      {
        french: 'S\'il vous plaît / S\'il te plaît',
        english: 'Please (formal / informal)',
        pronunciation: 'sil vu plɛ / sil tə plɛ',
        funnyNote: '"S\'il vous plaît" is used constantly — it\'s also how you get a waiter\'s attention. Never snap fingers or shout "garçon". Ever.',
      },
      {
        french: 'Enchanté(e)',
        english: 'Delighted to meet you',
        pronunciation: 'ɑ̃ʃɑ̃te',
        funnyNote: 'Said when being introduced to someone. Sounds incredibly sophisticated. Add the "(e)" if you\'re a woman. It\'s pronounced the same but it matters in writing.',
      },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'You meet your friend\'s grandmother for the first time. Which form do you use?',
        answer: 'Vous — she\'s a stranger and older',
        options: [
          'Tu — it feels friendlier',
          'Vous — she\'s a stranger and older',
          'Either is fine in modern France',
          'Neither — just nod',
        ],
      },
      {
        type: 'fill-blank',
        prompt: 'You enter a boulangerie. The first word out of your mouth must be "___".',
        answer: 'Bonjour',
        hint: 'The sacred greeting',
      },
      {
        type: 'multiple-choice',
        prompt: '"La bise" is a French greeting that involves:',
        answer: 'Leaning in for cheek-to-cheek contact with a kissing sound',
        options: [
          'A firm handshake',
          'Leaning in for cheek-to-cheek contact with a kissing sound',
          'A bow of the head',
          'A hug and a pat on the back',
        ],
      },
    ],
  },
  {
    id: 'culture-2',
    title: 'France: The Manual',
    subtitle: 'Why is everything closed? When do you tip? Why is lunch two hours?',
    xpReward: 25,
    vocab: [
      {
        french: 'Fermé le dimanche',
        english: 'Closed on Sunday',
        pronunciation: 'fɛʁme lə dimɑ̃ʃ',
        funnyNote: 'Most French shops — including many supermarkets — close on Sunday. Pharmacies take turns being on duty. Plan ahead. Sunday in France is sacred.',
      },
      {
        french: 'La pause déjeuner',
        english: 'The lunch break',
        pronunciation: 'la poz deʒœne',
        funnyNote: 'From roughly 12:00 to 14:00, many small shops close for lunch. Even in 2024. This is not laziness — it\'s civilisation.',
      },
      {
        french: 'Le service est compris',
        english: 'Service is included',
        pronunciation: 'lə sɛʁvis ɛ kɔ̃pʁi',
        funnyNote: 'You will see this at the bottom of every restaurant bill. It means the tip is built in. Leaving extra is appreciated but not expected. Do not tip 20%.',
      },
      {
        french: 'Un jour férié',
        english: 'A public holiday',
        pronunciation: 'œ̃ ʒuʁ feʁje',
        funnyNote: 'France has 11 public holidays. They all fall on Tuesdays and Thursdays. The French "make a bridge" (faire le pont) — bridging to the weekend — giving them a four-day weekend. This is genius.',
      },
      {
        french: 'Payer par carte',
        english: 'To pay by card',
        pronunciation: 'peje paʁ kaʁt',
        example: 'Je peux payer par carte ?',
        exampleTranslation: 'Can I pay by card?',
        funnyNote: 'Most places accept card. Some small markets or boulangeries are cash only. Always ask: "Vous acceptez la carte ?"',
      },
      {
        french: 'La monnaie',
        english: 'Change / Coins',
        pronunciation: 'la mɔnɛ',
        funnyNote: '"Avez-vous de la monnaie ?" = Do you have change? French cashiers will ask you for exact change with the energy of someone defusing a bomb. Try to comply.',
      },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'It\'s 13:00 on a Tuesday. The pharmacy is closed. The most likely reason is:',
        answer: 'La pause déjeuner — they close for lunch',
        options: [
          'It\'s a public holiday',
          'La pause déjeuner — they close for lunch',
          'They close early on Tuesdays',
          'They are permanently closed',
        ],
      },
      {
        type: 'multiple-choice',
        prompt: 'Your restaurant bill says "service compris". Do you need to leave an extra tip?',
        answer: 'No — it\'s already included in the bill',
        options: [
          'Yes — always tip 15%',
          'No — it\'s already included in the bill',
          'Yes — service compris means the food only',
          'Tipping is illegal in France',
        ],
      },
      {
        type: 'fill-blank',
        prompt: '"Je peux payer par ___ ?" (Can I pay by card?)',
        answer: 'carte',
        hint: 'The word for card',
      },
    ],
  },
  {
    id: 'culture-3',
    title: 'The French Meal: A 4-Act Play',
    subtitle: 'Entrée, plat, fromage, dessert. In that order. Always.',
    xpReward: 25,
    vocab: [
      {
        french: 'L\'entrée',
        english: 'The starter',
        pronunciation: 'lɑ̃tʁe',
        funnyNote: 'WARNING: "entrée" in France means the STARTER, not the main course. This is the opposite of American usage and has caused many ruined dinners.',
      },
      {
        french: 'Le plat (principal)',
        english: 'The main course',
        pronunciation: 'lə pla pʁɛ̃sipal',
        funnyNote: 'The main event. In a proper French meal this arrives after the starter and before the cheese. Not before or during. There is an order.',
      },
      {
        french: 'Le fromage',
        english: 'The cheese course',
        pronunciation: 'lə fʁomaʒ',
        funnyNote: 'Cheese comes BEFORE dessert in France. This surprises almost everyone. It\'s not negotiable. The cheese course is a palate bridge between savoury and sweet.',
      },
      {
        french: 'Le dessert',
        english: 'Dessert',
        pronunciation: 'lə desɛʁ',
        funnyNote: 'Comes last. If someone serves cheese after dessert, a small part of France weeps.',
      },
      {
        french: 'Le digestif',
        english: 'The after-dinner drink',
        pronunciation: 'lə diʒɛstif',
        funnyNote: 'Cognac, Armagnac, Calvados, Chartreuse. The French believe a small shot of something strong helps digestion. Science is uncertain. The tradition is not.',
      },
      {
        french: 'Bon appétit !',
        english: 'Enjoy your meal!',
        pronunciation: 'bɔn apeti',
        funnyNote: 'Said by the host or whoever serves the food, before everyone begins eating. Do not start eating before the host says it. This is not a suggestion.',
      },
      {
        french: 'C\'est convivial',
        english: 'It\'s warm and sociable',
        pronunciation: 'sɛ kɔ̃vivjal',
        funnyNote: '"Convivial" in French doesn\'t mean slightly jolly — it means genuinely warm, social, and life-affirming. The French apply this word to good meals, good company, and any gathering worth attending.',
      },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'In a French meal, what comes after the plat (main course) and BEFORE dessert?',
        answer: 'Le fromage',
        options: ['Le pain', 'Le café', 'Le fromage', 'L\'entrée'],
      },
      {
        type: 'multiple-choice',
        prompt: '"L\'entrée" in French means:',
        answer: 'The starter',
        options: ['The main course', 'The entrance', 'The starter', 'The dessert'],
      },
      {
        type: 'translation',
        prompt: 'What do you say before everyone starts eating?',
        answer: 'Bon appétit !',
        hint: 'The host always says this first',
      },
    ],
  },
];
