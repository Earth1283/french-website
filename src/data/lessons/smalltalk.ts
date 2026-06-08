import type { Lesson } from '../../types';

export const smalltalkLessons: Lesson[] = [
  {
    id: 'smalltalk-1',
    title: 'Weather: The Universal Icebreaker',
    subtitle: 'Talking about weather transcends all cultural barriers. Even the French respect this.',
    xpReward: 20,
    vocab: [
      {
        french: 'Il fait beau',
        english: 'The weather is nice / It\'s nice out',
        pronunciation: 'il fɛ bo',
        funnyNote: 'Say this on a gray Paris day and watch the French nod politely while internally disagreeing.',
      },
      {
        french: 'Il fait mauvais',
        english: 'The weather is bad',
        pronunciation: 'il fɛ movɛ',
      },
      {
        french: 'Il pleut',
        english: 'It\'s raining',
        pronunciation: 'il plø',
      },
      {
        french: 'Il fait chaud / froid',
        english: 'It\'s hot / cold',
        pronunciation: 'il fɛ ʃo / fʁwa',
        funnyNote: 'France has actual seasons. "Il fait chaud" in August in Paris — you\'ll need this.',
      },
      {
        french: 'Il neige',
        english: 'It\'s snowing',
        pronunciation: 'il nɛʒ',
      },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'It\'s a beautiful sunny day. What do you say?',
        answer: 'Il fait beau !',
        options: ['Il fait mauvais', 'Il fait beau !', 'Il pleut', 'Il fait froid'],
      },
      {
        type: 'translation',
        prompt: 'How do you say "It\'s cold"?',
        answer: 'Il fait froid',
        hint: '"Il fait" + the temperature adjective',
      },
    ],
  },
  {
    id: 'smalltalk-2',
    title: 'Opinions, Emotions & Compliments',
    subtitle: 'Express yourself. Poorly but enthusiastically.',
    xpReward: 20,
    vocab: [
      {
        french: 'C\'est magnifique !',
        english: 'It\'s magnificent!',
        pronunciation: 'sɛ maɲifik',
        funnyNote: 'Use this freely. The Eiffel Tower. A really good croissant. A sunset. All magnifique.',
      },
      {
        french: 'C\'est incroyable !',
        english: 'It\'s incredible!',
        pronunciation: 'sɛ tɛ̃kʁwajabl',
      },
      {
        french: 'Je suis fatigué(e)',
        english: 'I\'m tired',
        pronunciation: 'ʒə sɥi fatiɡe',
        funnyNote: 'The universal state of a tourist.',
      },
      {
        french: 'Je suis content(e)',
        english: 'I\'m happy',
        pronunciation: 'ʒə sɥi kɔ̃tɑ̃',
        funnyNote: '"Content" in French means happy/satisfied — NOT the English "content" (which would be "contenu").',
      },
      {
        french: 'Vous êtes très sympa',
        english: 'You\'re very kind/nice',
        pronunciation: 'vu zɛt tʁɛ sɛ̃pa',
        funnyNote: '"Sympa" (short for sympathique) is the French word for "nice person". A powerful compliment.',
      },
      {
        french: 'J\'adore ça !',
        english: 'I love that!',
        pronunciation: 'ʒadɔʁ sa',
      },
      {
        french: 'Je n\'aime pas trop ça',
        english: 'I don\'t really like that',
        pronunciation: 'ʒə nɛm pa tʁo sa',
        funnyNote: 'The polite French way of saying something is terrible.',
      },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'Your host is very kind. What do you say?',
        answer: 'Vous êtes très sympa',
        options: ['Vous êtes très bon', 'Vous êtes très sympa', 'Merci pour ça', 'Très bien vous'],
      },
      {
        type: 'translation',
        prompt: 'How do you say "I\'m tired"?',
        answer: 'Je suis fatigué',
        hint: 'Use "Je suis" + the adjective',
      },
      {
        type: 'fill-blank',
        prompt: '"C\'est ___ !" (It\'s magnificent!)',
        answer: 'magnifique',
        hint: 'The French cognate of "magnificent"',
      },
    ],
  },
];
