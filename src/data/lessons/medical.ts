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
      {
        type: 'multiple-choice',
        prompt: '"J\'ai mal à la gorge" means:',
        answer: 'I have a sore throat',
        options: ['I have a headache', 'I have a sore throat', 'I have a stomachache', 'I have a backache'],
      },
      {
        type: 'translation',
        prompt: 'Say "I have a fever"',
        answer: "J'ai de la fièvre",
        hint: '"J\'ai de la" + fièvre',
      },
    ],
  },
  {
    id: 'medical-2',
    title: 'At the Pharmacy',
    subtitle: 'The green cross is your friend. French pharmacists are surprisingly powerful.',
    xpReward: 25,
    vocab: [
      {
        french: 'La pharmacie',
        english: 'The pharmacy',
        pronunciation: 'la faʁmasi',
        funnyNote: 'Identified by a glowing green cross. French pharmacists can diagnose, recommend, and treat minor issues on the spot. They\'re basically doctors with better retail space.',
      },
      {
        french: 'J\'ai besoin de...',
        english: 'I need...',
        pronunciation: 'ʒɛ bəzwɛ̃ də',
        example: 'J\'ai besoin de quelque chose contre la toux.',
        exampleTranslation: 'I need something for a cough.',
      },
      {
        french: 'Quelque chose contre...',
        english: 'Something for... / Something against...',
        pronunciation: 'kɛlkə ʃoz kɔ̃tʁ',
        funnyNote: '"Contre" literally means "against". In France, you are at war with your ailments.',
      },
      {
        french: 'La toux',
        english: 'A cough',
        pronunciation: 'la tu',
      },
      {
        french: 'Le rhume',
        english: 'A cold',
        pronunciation: 'lə ʁym',
      },
      {
        french: 'Un médicament',
        english: 'A medicine / medication',
        pronunciation: 'œ̃ medikamɑ̃',
      },
      {
        french: 'Une ordonnance',
        english: 'A prescription',
        pronunciation: 'yn ɔʁdɔnɑ̃s',
        funnyNote: 'Some medications require one. The pharmacist will say "Il faut une ordonnance" — you\'ll need to see a doctor first.',
      },
      {
        french: 'La posologie',
        english: 'The dosage instructions',
        pronunciation: 'la pozɔlɔʒi',
        funnyNote: 'On every medication box. Tells you how much to take and when.',
      },
      {
        french: 'J\'ai une allergie à...',
        english: 'I\'m allergic to...',
        pronunciation: 'ʒɛ yn alɛʁʒi a',
        funnyNote: 'Critical. Say it slowly and clearly before accepting any medication.',
      },
      {
        french: 'Des anti-douleurs',
        english: 'Painkillers',
        pronunciation: 'de ɑ̃ti dulœʁ',
      },
    ],
    exercises: [
      {
        type: 'translation',
        prompt: 'Ask for "something for a cough"',
        answer: 'Quelque chose contre la toux',
        hint: '"Quelque chose contre" + the ailment',
      },
      {
        type: 'multiple-choice',
        prompt: 'The pharmacist says "Il faut une ordonnance." What does this mean?',
        answer: 'You need a prescription',
        options: ['You need a prescription', 'It\'s very expensive', 'Come back tomorrow', 'We don\'t have that'],
      },
      {
        type: 'fill-blank',
        prompt: '"J\'ai ___ de médicaments contre le rhume" (I need cold medicine)',
        answer: 'besoin',
        hint: '"Avoir besoin de" = to need',
      },
      {
        type: 'multiple-choice',
        prompt: 'What is "la posologie" on a medicine box?',
        answer: 'The dosage instructions',
        options: ['The expiry date', 'The dosage instructions', 'The price', 'The ingredients list'],
      },
      {
        type: 'translation',
        prompt: 'Say "I\'m allergic to penicillin" (pénicilline)',
        answer: "J'ai une allergie à la pénicilline",
        hint: '"J\'ai une allergie à" + the substance',
      },
      {
        type: 'multiple-choice',
        prompt: 'What is "la pharmacie" identified by in France?',
        answer: 'A glowing green cross',
        options: ['A red cross sign', 'A glowing green cross', 'A blue shield', 'A white snake symbol'],
      },
    ],
  },
  {
    id: 'medical-3',
    title: 'Emergencies & Accidents',
    subtitle: 'Hopefully you never need this. But if you do, you\'ll be ready.',
    xpReward: 30,
    vocab: [
      {
        french: 'Au secours !',
        english: 'Help!',
        pronunciation: 'o səkuʁ',
        funnyNote: 'The universal cry for help in French. Louder is better in a genuine emergency.',
      },
      {
        french: 'Appelez le SAMU !',
        english: 'Call an ambulance! (emergency medical service)',
        pronunciation: 'aple lə samy',
        funnyNote: 'SAMU = 15. Police = 17. Fire brigade = 18. European emergency number = 112. Save these.',
      },
      {
        french: 'J\'ai eu un accident',
        english: 'I\'ve had an accident',
        pronunciation: 'ʒɛ y œ̃ aksidɑ̃',
      },
      {
        french: 'Il / Elle est blessé(e)',
        english: 'He / She is injured',
        pronunciation: 'il / ɛl ɛ blɛse',
      },
      {
        french: 'Je saigne',
        english: 'I\'m bleeding',
        pronunciation: 'ʒə sɛɲ',
        funnyNote: 'You should probably know this one.',
      },
      {
        french: 'Je ne peux pas bouger',
        english: 'I can\'t move',
        pronunciation: 'ʒə nə pø pa buʒe',
      },
      {
        french: 'Je suis diabétique / épileptique',
        english: 'I\'m diabetic / epileptic',
        pronunciation: 'ʒə sɥi djabetik / epilɛptik',
        funnyNote: 'Give this information to emergency responders immediately. Also: asthmatique (asthmatic).',
      },
      {
        french: 'Où est l\'urgence la plus proche ?',
        english: 'Where is the nearest emergency room?',
        pronunciation: 'u ɛ lyʁʒɑ̃s la ply pʁɔʃ',
      },
      {
        french: 'C\'est urgent',
        english: 'It\'s urgent',
        pronunciation: 'sɛ tyʁʒɑ̃',
      },
      {
        french: 'J\'ai perdu connaissance',
        english: 'I lost consciousness',
        pronunciation: 'ʒɛ pɛʁdy kɔnɛsɑ̃s',
      },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'What number do you call for an ambulance (SAMU) in France?',
        answer: '15',
        options: ['15', '911', '999', '17'],
      },
      {
        type: 'translation',
        prompt: 'Shout "Help! Call an ambulance!"',
        answer: 'Au secours ! Appelez le SAMU !',
        hint: '"Au secours" = Help, "Appelez le SAMU" = Call an ambulance',
      },
      {
        type: 'fill-blank',
        prompt: '"Je ___ pas bouger" (I can\'t move)',
        answer: 'ne peux',
        hint: 'Negation: ne...pas wraps around the verb "peux" (can)',
      },
      {
        type: 'multiple-choice',
        prompt: 'Someone is injured. What do you say to the emergency operator?',
        answer: 'Il est blessé',
        options: ['Il est blessé', 'Il est très fatigué', 'Il a mangé quelque chose', 'Il dort profondément'],
      },
      {
        type: 'translation',
        prompt: 'Say "I\'m bleeding and it\'s urgent"',
        answer: "Je saigne et c'est urgent",
        hint: '"Je saigne" + "et" (and) + "c\'est urgent"',
      },
      {
        type: 'multiple-choice',
        prompt: '"J\'ai perdu connaissance" means:',
        answer: 'I lost consciousness',
        options: ['I lost my bag', 'I lost consciousness', 'I can\'t remember', 'I lost my phone'],
      },
    ],
  },
];
