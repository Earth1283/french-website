import type { Lesson } from '../../types';

export const identityLessons: Lesson[] = [
  {
    id: 'identity-1',
    title: 'Where Are You From?',
    subtitle: 'Talk about your origins without accidentally claiming to be a country.',
    xpReward: 20,
    vocab: [
      {
        french: 'Je viens de...',
        english: 'I come from...',
        pronunciation: 'ʒə vjɛ̃ də',
        example: 'Je viens des États-Unis.',
        exampleTranslation: 'I come from the United States.',
      },
      {
        french: 'J\'habite à...',
        english: 'I live in...',
        pronunciation: 'ʒabit a',
        example: 'J\'habite à Londres.',
        exampleTranslation: 'I live in London.',
      },
      {
        french: 'Je suis américain(e)',
        english: 'I am American',
        pronunciation: 'ʒə sɥi zameʁikɛ̃ / ameʁikɛn',
        funnyNote: 'Add -e for feminine. Nationalities are NOT capitalized in French. You\'re "américain", not "Américain". Same for all nationalities.',
      },
      {
        french: 'anglais(e) / australien(ne)',
        english: 'English / Australian',
        pronunciation: 'ɑ̃ɡlɛ / ostʁalijɛ̃',
        funnyNote: 'Feminine forms can change dramatically: australien → australienne.',
      },
      {
        french: 'Je parle anglais / français',
        english: 'I speak English / French',
        pronunciation: 'ʒə paʁl ɑ̃ɡlɛ / fʁɑ̃sɛ',
        funnyNote: 'Languages are NOT capitalized either: "le français", "l\'anglais". Only country names get capitals.',
      },
      {
        french: 'Je parle un peu de français',
        english: 'I speak a little French',
        pronunciation: 'ʒə paʁl œ̃ pø də fʁɑ̃sɛ',
        funnyNote: 'Your new best phrase. Even a terrible attempt earns enormous goodwill from French people.',
      },
    ],
    exercises: [
      {
        type: 'translation',
        prompt: 'How do you say "I come from Australia"?',
        answer: 'Je viens d\'Australie',
        hint: 'de + Australie → d\'Australie (elision before vowel)',
      },
      {
        type: 'multiple-choice',
        prompt: 'How do you say "I speak a little French"?',
        answer: 'Je parle un peu de français',
        options: [
          'Je parle le petit français',
          'Je parle un peu de français',
          'Je suis parlant français',
          'Je parle français un peu',
        ],
      },
      {
        type: 'fill-blank',
        prompt: 'J\'___ à Paris. (I live in Paris)',
        answer: 'habite',
        hint: 'habiter → first person singular',
      },
    ],
  },
  {
    id: 'identity-2',
    title: 'What Do You Do?',
    subtitle: 'Professions, studies, and why you drop the article after être.',
    xpReward: 20,
    vocab: [
      {
        french: 'Je suis étudiant(e)',
        english: 'I am a student',
        pronunciation: 'ʒə sɥi etydijɑ̃',
        funnyNote: 'Notice: no article before the profession. In French, "Je suis professeur" not "Je suis UN professeur". The article disappears after être when stating a profession.',
      },
      {
        french: 'Je suis professeur',
        english: 'I am a teacher',
        pronunciation: 'ʒə sɥi pʁofesœʁ',
      },
      {
        french: 'Je suis médecin',
        english: 'I am a doctor',
        pronunciation: 'ʒə sɥi medsɛ̃',
      },
      {
        french: 'Je suis infirmier / infirmière',
        english: 'I am a nurse (m/f)',
        pronunciation: 'ʒə sɥi ɛ̃fiʁmje / ɛ̃fiʁmjɛʁ',
      },
      {
        french: 'Je travaille dans...',
        english: 'I work in...',
        pronunciation: 'ʒə tʁavaj dɑ̃',
        example: 'Je travaille dans la finance.',
        exampleTranslation: 'I work in finance.',
      },
      {
        french: 'Qu\'est-ce que vous faites ?',
        english: 'What do you do? (formal)',
        pronunciation: 'kɛskə vu fɛt',
        funnyNote: 'Literally "what is it that you do?" — the go-to conversation opener at a dinner party or professional event.',
      },
      {
        french: 'Je suis à la retraite',
        english: 'I am retired',
        pronunciation: 'ʒə sɥi a la ʁətʁɛt',
      },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'Which is grammatically correct in French?',
        answer: 'Je suis médecin',
        options: [
          'Je suis un médecin',
          'Je suis médecin',
          'J\'ai un médecin',
          'Je fais médecin',
        ],
      },
      {
        type: 'translation',
        prompt: 'How do you say "I work in technology"?',
        answer: 'Je travaille dans la technologie',
        hint: 'Je travaille dans + article + field',
      },
      {
        type: 'fill-blank',
        prompt: 'Qu\'est-ce que vous ___ ? (What do you do?)',
        answer: 'faites',
        hint: 'Faire conjugated for vous',
      },
    ],
  },
  {
    id: 'identity-3',
    title: 'Family & Relationships',
    subtitle: 'Talking about the people in your life without accidentally oversharing.',
    xpReward: 25,
    vocab: [
      {
        french: 'la famille',
        english: 'the family',
        pronunciation: 'la famij',
      },
      {
        french: 'mon mari / ma femme',
        english: 'my husband / my wife',
        pronunciation: 'mɔ̃ maʁi / ma fam',
      },
      {
        french: 'mon copain / ma copine',
        english: 'my boyfriend / my girlfriend',
        pronunciation: 'mɔ̃ kɔpɛ̃ / ma kɔpin',
        funnyNote: '"Copain/copine" also means friend — context usually clarifies. For unambiguous "partner" use mon compagnon / ma compagne.',
      },
      {
        french: 'mon frère / ma sœur',
        english: 'my brother / my sister',
        pronunciation: 'mɔ̃ fʁɛʁ / ma sœʁ',
      },
      {
        french: 'mes parents',
        english: 'my parents',
        pronunciation: 'me paʁɑ̃',
        funnyNote: '"Parents" in French means parents (not all relatives — that\'s "famille"). "Mes parents" = my mum and dad.',
      },
      {
        french: 'mon fils / ma fille',
        english: 'my son / my daughter',
        pronunciation: 'mɔ̃ fis / ma fij',
        funnyNote: '"Fils" — the L is silent but the S is pronounced: "fis". That S surprises people every time.',
      },
      {
        french: 'J\'ai deux enfants',
        english: 'I have two children',
        pronunciation: 'ʒe dø zɑ̃fɑ̃',
        funnyNote: 'Note the liaison: "deux enfants" → dø-z-ɑ̃fɑ̃. The S from "deux" carries over.',
      },
      {
        french: 'Je suis célibataire',
        english: 'I am single',
        pronunciation: 'ʒə sɥi selibatɛʁ',
        funnyNote: 'A magnificent word. Six syllables. No English equivalent is this elegant.',
      },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'How do you say "my sister"?',
        answer: 'ma sœur',
        options: ['mon sœur', 'ma sœur', 'le sœur', 'mes sœurs'],
      },
      {
        type: 'translation',
        prompt: 'How do you say "I have two children"?',
        answer: 'J\'ai deux enfants',
        hint: 'Remember the liaison between deux and enfants',
      },
      {
        type: 'fill-blank',
        prompt: 'Mon ___ s\'appelle Thomas. (My son\'s name is Thomas)',
        answer: 'fils',
        hint: 'The L is silent, but the S is pronounced',
      },
    ],
  },
];
