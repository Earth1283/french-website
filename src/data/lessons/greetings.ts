import type { Lesson } from '../../types';

export const greetingsLessons: Lesson[] = [
  {
    id: 'greetings-1',
    title: 'Bonjour: The Most Important Word in France',
    subtitle: 'Not saying it to a shopkeeper is considered a war crime here.',
    xpReward: 20,
    vocab: [
      {
        french: 'Bonjour',
        english: 'Good morning / Good day',
        pronunciation: 'bɔ̃ʒuʁ',
        funnyNote: 'Say this to EVERYONE when you enter a shop, a bakery, a doctor\'s office, an elevator. Always. The French will think better of you immediately.',
      },
      {
        french: 'Bonsoir',
        english: 'Good evening',
        pronunciation: 'bɔ̃swaʁ',
        funnyNote: 'Switch from "bonjour" to "bonsoir" around 6pm. There\'s no hard rule. Just feel it.',
      },
      {
        french: 'Bonne nuit',
        english: 'Good night',
        pronunciation: 'bɔn nɥi',
        funnyNote: 'Only when actually going to sleep. Not a general evening greeting.',
      },
      {
        french: 'Salut',
        english: 'Hi / Bye (informal)',
        pronunciation: 'saly',
        funnyNote: 'Only with friends! Using "salut" with a stranger in a shop is like patting your boss on the head.',
      },
      {
        french: 'Au revoir',
        english: 'Goodbye',
        pronunciation: 'o ʁəvwaʁ',
        funnyNote: 'Literally "until seeing again". Say this AND "bonne journée" when leaving a shop. Both. The full combo.',
      },
      {
        french: 'Bonne journée !',
        english: 'Have a good day!',
        pronunciation: 'bɔn ʒuʁne',
        funnyNote: 'This is the required exit phrase. Shopkeepers will love you.',
      },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'You enter a boulangerie at 9am. What\'s the first thing you say?',
        answer: 'Bonjour !',
        options: ['Salut !', 'Bonjour !', 'Bonsoir !', 'Bonne nuit !'],
      },
      {
        type: 'multiple-choice',
        prompt: 'You\'re leaving a shop. What\'s the proper farewell combo?',
        answer: 'Au revoir, bonne journée !',
        options: ['Salut, ciao', 'Au revoir, bonne journée !', 'Bye bye', 'Adieu'],
      },
      {
        type: 'translation',
        prompt: 'What does "Bonsoir" mean?',
        answer: 'Good evening',
        hint: 'Used in the evening, not morning',
      },
    ],
  },
  {
    id: 'greetings-2',
    title: 'Introductions & The Bisou Minefield',
    subtitle: 'One cheek? Two? Left first or right? Nobody agrees. We\'ll explain.',
    xpReward: 25,
    vocab: [
      {
        french: 'Comment vous appelez-vous ?',
        english: 'What is your name? (formal)',
        pronunciation: 'kɔmɑ̃ vu zaple vu',
        funnyNote: 'Formal version. Use with strangers, elders, or anyone you want to impress.',
      },
      {
        french: 'Je m\'appelle...',
        english: 'My name is...',
        pronunciation: 'ʒə mapɛl',
        example: 'Je m\'appelle Sophie.',
        exampleTranslation: 'My name is Sophie.',
      },
      {
        french: 'Enchanté(e)',
        english: 'Pleased to meet you',
        pronunciation: 'ɑ̃ʃɑ̃te',
        funnyNote: 'Add -e if you\'re feminine. "Enchanté" is arguably the most sophisticated thing you can say in French.',
      },
      {
        french: 'Comment allez-vous ?',
        english: 'How are you? (formal)',
        pronunciation: 'kɔmɑ̃ ale vu',
        funnyNote: 'The formal "How are you". Expect "Très bien, merci" in response regardless of actual situation.',
      },
      {
        french: 'Ça va ?',
        english: 'How\'s it going? (informal)',
        pronunciation: 'sa va',
        funnyNote: '"Ça va?" is also the answer: "Ça va." It means everything from fine to catastrophically bad. Context is everything.',
      },
      {
        french: 'Très bien, merci',
        english: 'Very well, thank you',
        pronunciation: 'tʁɛ bjɛ̃ mɛʁsi',
        funnyNote: 'The auto-response. Comes out before you can think.',
      },
    ],
    exercises: [
      {
        type: 'translation',
        prompt: 'How do you say "My name is Marco"?',
        answer: 'Je m\'appelle Marco',
        hint: 'Start with "Je m\'appelle"',
      },
      {
        type: 'multiple-choice',
        prompt: 'What does "Enchanté" mean?',
        answer: 'Pleased to meet you',
        options: ['Enchanted', 'Very good', 'Pleased to meet you', 'My pleasure'],
      },
      {
        type: 'fill-blank',
        prompt: '"___ va ?" (How\'s it going?)',
        answer: 'Ça',
        hint: 'The short casual greeting',
      },
    ],
  },
  {
    id: 'greetings-3',
    title: 'Politeness Power-Ups',
    subtitle: 'The magic words that make France tolerable — and often delightful.',
    xpReward: 15,
    vocab: [
      {
        french: 'S\'il vous plaît',
        english: 'Please (formal)',
        pronunciation: 'sil vu plɛ',
        funnyNote: 'Literally "if it pleases you". Extremely important. Use it constantly.',
      },
      {
        french: 'Merci',
        english: 'Thank you',
        pronunciation: 'mɛʁsi',
      },
      {
        french: 'Merci beaucoup',
        english: 'Thank you very much',
        pronunciation: 'mɛʁsi boku',
      },
      {
        french: 'De rien',
        english: 'You\'re welcome',
        pronunciation: 'də ʁjɛ̃',
        funnyNote: 'Literally "of nothing". The French are philosophically generous.',
      },
      {
        french: 'Excusez-moi',
        english: 'Excuse me',
        pronunciation: 'ɛkskyze mwa',
        funnyNote: 'To get past someone on the street, to get a waiter\'s attention, to apologize for bumping into someone. One phrase, infinite uses.',
      },
      {
        french: 'Pardon',
        english: 'Sorry / Excuse me',
        pronunciation: 'paʁdɔ̃',
        funnyNote: 'Slightly softer than "excusez-moi". Both work. Say one of them. Just say something.',
      },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'What\'s the formal way to say "please"?',
        answer: 'S\'il vous plaît',
        options: ['Merci', 'S\'il vous plaît', 'De rien', 'Pardon'],
      },
      {
        type: 'translation',
        prompt: 'Someone thanks you. How do you say "You\'re welcome"?',
        answer: 'De rien',
        hint: 'Literally "of nothing"',
      },
    ],
  },
];
