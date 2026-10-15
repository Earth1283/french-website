import type { Lesson } from '../../types';

export const slangLessons: Lesson[] = [
  {
    id: 'slang-1',
    title: 'Zut & Other Essentials',
    subtitle: 'You\'ve earned this. Don\'t embarrass us.',
    xpReward: 35,
    vocab: [
      {
        french: 'Zut !',
        english: 'Darn! / Shoot! / Rats!',
        pronunciation: 'zyt',
        funnyNote: 'The go-to French exclamation when things go wrong. "Zut, j\'ai raté mon bus !" (Darn, I missed my bus!). Perfectly polite in any situation.',
      },
      {
        french: 'C\'est nul',
        english: 'It\'s no good / It\'s rubbish',
        pronunciation: 'sɛ nyl',
        example: 'Ce film, c\'est vraiment nul.',
        exampleTranslation: 'This movie is really no good.',
        funnyNote: '"Nul" literally means zero/null. Zero quality = nul.',
      },
      {
        french: 'Laisse tomber',
        english: 'Forget it / Drop it',
        pronunciation: 'lɛs tɔ̃be',
        funnyNote: 'Literally "let it fall". Used when you\'re done with a topic or don\'t want to explain something.',
      },
      {
        french: 'T\'as l\'air bien',
        english: 'You look good',
        pronunciation: 'ta lɛʁ bjɛ̃',
        funnyNote: '"Avoir l\'air" = to look/seem. "T\'as l\'air fatigué" = you look tired.',
      },
      {
        french: 'Sympa !',
        english: 'Cool! / Nice!',
        pronunciation: 'sɛ̃pa',
        funnyNote: 'Short for "sympathique". One of the most versatile positives.',
      },
      {
        french: 'C\'est galère',
        english: 'It\'s a hassle / It\'s a struggle',
        pronunciation: 'sɛ ɡalɛʁ',
        funnyNote: 'Very common in casual French speech. "C\'est la galère" = what a nightmare. Used for anything tedious or exhausting.',
      },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'Someone asks why you\'re late. You don\'t want to explain. What do you say?',
        answer: 'Laisse tomber',
        options: ['Je suis désolé', 'C\'est nul', 'Laisse tomber', 'Sympa'],
        explanation: "“Laisse tomber” literally means “let it fall”, a way to close a topic without giving reasons. “C'est nul” would be an insult, not a dodge.",
      },
      {
        type: 'multiple-choice',
        prompt: 'You drop your ice cream. What\'s the appropriate exclamation?',
        answer: 'Zut !',
        options: ['Merci !', 'Bonjour !', 'Zut !', 'De rien'],
        explanation: "“Zut !” is the mild, universal exclamation of annoyance. “Merci” and “Bonjour” are social formulas, and “De rien” is the reply to “merci”.",
      },
      {
        type: 'fill-blank',
        prompt: 'C\'est ___ (It\'s a hassle, slang)',
        answer: 'galère',
        explanation: "“Galère” is slang for a hassle or ordeal. It comes from the old word for a galley ship, where rowers endured hard labour. Used after “c'est” without an article.",
      },
      {
        type: 'fill-blank',
        prompt: '___ ! (Cool! Nice!)',
        answer: 'Sympa',
        explanation: "“Sympa” is short for “sympathique”. It never changes for gender; in the plural it just adds a silent -s: des gens sympas.",
      },
      {
        type: 'translation',
        prompt: 'Say "Forget it" (informal)',
        answer: 'laisse tomber',
        explanation: "“Laisse” is the tu-form imperative of “laisser tomber”, since the phrase is addressed to one person informally. The vous form would be “Laissez tomber”.",
      },
      {
        type: 'translation',
        prompt: 'Say "It\'s rubbish" (slang)',
        answer: 'c\'est nul',
        explanation: "“Nul” means worthless or hopeless. After “c'est”, the adjective stays in its basic form whatever is being judged, as with “c'est bien”.",
      },
    ],
  },
  {
    id: 'slang-2',
    title: 'Verlan: French Backwards Slang',
    subtitle: 'Young French people reverse syllables for slang. It\'s wild. It\'s real.',
    xpReward: 30,
    vocab: [
      {
        french: 'Ouf',
        english: 'Crazy / Intense (verlan of "fou")',
        pronunciation: 'uf',
        funnyNote: '"Fou" (crazy) backwards = "ouf". "C\'est ouf !" = That\'s crazy! Used constantly by under-40s.',
      },
      {
        french: 'Chelou',
        english: 'Sketchy / Weird (verlan of "louche")',
        pronunciation: 'ʃəlu',
        funnyNote: '"Louche" (shady/sketchy) reversed = "chelou". "Il est chelou, ce mec" = That guy is sketchy.',
      },
      {
        french: 'Relou',
        english: 'Annoying / A drag (verlan of "lourd")',
        pronunciation: 'ʁəlu',
        funnyNote: '"Lourd" (heavy/annoying) reversed = "relou". "C\'est relou" = It\'s such a drag.',
      },
      {
        french: 'Meuf',
        english: 'Woman / Girl (verlan of "femme")',
        pronunciation: 'mœf',
        funnyNote: '"Femme" reversed = "meuf". Standard informal French now.',
      },
      {
        french: 'Keum',
        english: 'Guy / Dude (verlan of "mec")',
        pronunciation: 'kœm',
        funnyNote: '"Mec" (guy) reversed, roughly = "keum".',
      },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: '"Ouf" is verlan of which word?',
        answer: 'Fou (crazy)',
        options: ['Fort (strong)', 'Fou (crazy)', 'Fou (alternate spelling)', 'Four (oven)'],
        explanation: "“Ouf” is verlan of “fou” (crazy): the syllables are reversed. “Fort” and “four” are unrelated words; the verlan source is always “fou”.",
      },
      {
        type: 'translation',
        prompt: 'Your friend describes something as "chelou". What do they mean?',
        answer: 'sketchy or weird',
        hint: 'Verlan of "louche" — the shady one',
        explanation: "“Chelou” is verlan of “louche”, which means shady or dodgy. The reversed syllables give the everyday sense of weird or sketchy, used casually.",
      },
      {
        type: 'multiple-choice',
        prompt: '"Relou" is verlan for "lourd". It means:',
        answer: 'Annoying',
        options: ['Annoying', 'Delicious', 'Friendly', 'Tired'],
        explanation: "“Relou” is verlan of “lourd”, which in slang means a drag or annoying. It has no link to the words for delicious, friendly or tired.",
      },
      {
        type: 'fill-blank',
        prompt: 'Une ___ is verlan for "femme"',
        answer: 'meuf',
        explanation: "“Meuf” is verlan of “femme”: the syllables are swapped (fem-me becomes me-f). It is feminine, so it takes “une”.",
      },
      {
        type: 'fill-blank',
        prompt: 'Un ___ is verlan for "mec" (guy)',
        answer: 'keum',
        explanation: "“Keum” is verlan of “mec”, with the syllables reversed and a new vowel sound. It is masculine, so it takes “un”.",
      },
      {
        type: 'translation',
        prompt: 'Say "That\'s crazy!" using the verlan for "fou"',
        answer: 'c\'est ouf',
        explanation: "“Ouf” is the verlan of “fou”, used as an adjective after “c'est”. In slang it stays unchanged, whatever the subject.",
      },
    ],
  },
];
