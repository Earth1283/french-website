import type { Unit } from '../types';
import { emergencyLessons } from './lessons/emergency';
import { foodLessons } from './lessons/food';
import { directionsLessons } from './lessons/directions';
import { numbersLessons } from './lessons/numbers';
import { greetingsLessons } from './lessons/greetings';
import { shoppingLessons } from './lessons/shopping';
import { accommodationLessons } from './lessons/accommodation';
import { medicalLessons } from './lessons/medical';
import { smalltalkLessons } from './lessons/smalltalk';
import { falseFriendsLessons } from './lessons/false-friends';
import { grammarLessons } from './lessons/grammar-survival';
import { slangLessons } from './lessons/slang';

export const UNITS: Unit[] = [
  {
    id: 'emergency',
    slug: 'emergency',
    title: 'Oh Non, I\'m in France',
    emoji: '🚨',
    tagline: 'Emergency Survival',
    funnyDescription: 'You\'ve been teleported. You have 5 phrases. Choose wisely. This unit might literally save your life — or at least your dignity.',
    color: '#E63946',
    accentColor: '#ff6b75',
    lessons: emergencyLessons,
    isA1: true,
    isBeyondA1: false,
  },
  {
    id: 'food',
    slug: 'food',
    title: 'Feed Me or I\'ll Cry',
    emoji: '🥐',
    tagline: 'Food, Cafés & Restaurants',
    funnyDescription: 'The croissant is your first friend. Treat it with respect. Also learn how to order coffee without getting a tall drip from somewhere that rhymes with Starducks.',
    color: '#F4A261',
    accentColor: '#f7b87a',
    lessons: foodLessons,
    isA1: true,
    isBeyondA1: false,
  },
  {
    id: 'directions',
    slug: 'directions',
    title: 'Where On Earth Am I?',
    emoji: '🗺️',
    tagline: 'Getting Around',
    funnyDescription: 'Parisians walk at twice the speed of everyone else. Learn to ask directions while jogging. The metro is your friend; Google Maps is your backup.',
    color: '#2A9D8F',
    accentColor: '#3ab5a6',
    lessons: directionsLessons,
    isA1: true,
    isBeyondA1: false,
  },
  {
    id: 'numbers',
    slug: 'numbers',
    title: 'Money Talks (Poorly)',
    emoji: '💶',
    tagline: 'Numbers & Money',
    funnyDescription: '€4.50 for an espresso. You need to understand what just happened to your wallet. Also: French counting goes completely off the rails after 60.',
    color: '#457B9D',
    accentColor: '#5a93b8',
    lessons: numbersLessons,
    isA1: true,
    isBeyondA1: false,
  },
  {
    id: 'greetings',
    slug: 'greetings',
    title: 'Bonjour, Everyone',
    emoji: '👋',
    tagline: 'Greetings & Social',
    funnyDescription: 'Not saying "bonjour" to the shopkeeper is a genuine social transgression. We\'ll explain the rules, the bisou minefield, and when "salut" will get you judged.',
    color: '#6A4C93',
    accentColor: '#8a6cb3',
    lessons: greetingsLessons,
    isA1: true,
    isBeyondA1: false,
  },
  {
    id: 'shopping',
    slug: 'shopping',
    title: 'Retail Therapy',
    emoji: '🛍️',
    tagline: 'Shopping & Pharmacies',
    funnyDescription: 'French clothing sizes will make you question your entire identity. Also: French pharmacies are incredible and will solve your problems better than WebMD.',
    color: '#E76F51',
    accentColor: '#f08060',
    lessons: shoppingLessons,
    isA1: true,
    isBeyondA1: false,
  },
  {
    id: 'accommodation',
    slug: 'accommodation',
    title: 'A Bed, Please',
    emoji: '🏨',
    tagline: 'Hotels & Accommodation',
    funnyDescription: 'The shower has 47 settings. None of them work the way you expect. Navigate check-in, WiFi complaints, and the mystery of French breakfast.',
    color: '#1D3557',
    accentColor: '#2d4d77',
    lessons: accommodationLessons,
    isA1: true,
    isBeyondA1: false,
  },
  {
    id: 'medical',
    slug: 'medical',
    title: 'I Am Dying (Probably)',
    emoji: '🏥',
    tagline: 'Medical & Health',
    funnyDescription: 'You ate something. You don\'t know what. Your stomach has opinions. Learn to communicate body parts, symptoms, and how to get help without panicking.',
    color: '#E63946',
    accentColor: '#ff6b75',
    lessons: medicalLessons,
    isA1: true,
    isBeyondA1: false,
  },
  {
    id: 'smalltalk',
    slug: 'smalltalk',
    title: 'Weather & Vibes',
    emoji: '☀️',
    tagline: 'Small Talk & Opinions',
    funnyDescription: 'Talking about weather is a universal language. Even the French respect this. Express emotions, compliments, and strong opinions about croissants.',
    color: '#F4A261',
    accentColor: '#f7b87a',
    lessons: smalltalkLessons,
    isA1: true,
    isBeyondA1: false,
  },
  {
    id: 'false-friends',
    slug: 'false-friends',
    title: 'False Friends Will Betray You',
    emoji: '🪤',
    tagline: 'Dangerous Cognates',
    funnyDescription: '"Librairie" is not a library. "Actuellement" does not mean "actually". These words look English but will embarrass you in public. Learn them before they strike.',
    color: '#2A9D8F',
    accentColor: '#3ab5a6',
    lessons: falseFriendsLessons,
    isA1: false,
    isBeyondA1: true,
  },
  {
    id: 'grammar',
    slug: 'grammar',
    title: 'Grammar Survival Kit',
    emoji: '📚',
    tagline: 'Essential Grammar',
    funnyDescription: 'Every noun has a gender. Some assignments make no sense whatsoever. We don\'t make the rules. Survive verb conjugation, negation, and the horror of articles.',
    color: '#457B9D',
    accentColor: '#5a93b8',
    lessons: grammarLessons,
    isA1: true,
    isBeyondA1: false,
  },
  {
    id: 'slang',
    slug: 'slang',
    title: 'Unlocked: The Good Stuff',
    emoji: '🔥',
    tagline: 'Slang & Expressions',
    funnyDescription: 'Modern French slang, verlan (words spelled backwards), useful idioms, and things that will make French people do a double-take. You\'ve earned this.',
    color: '#6A4C93',
    accentColor: '#8a6cb3',
    lessons: slangLessons,
    isA1: false,
    isBeyondA1: true,
  },
];

export const A1_UNIT_IDS = ['emergency', 'food', 'directions', 'numbers', 'greetings', 'shopping', 'accommodation', 'medical', 'smalltalk', 'grammar'];

export function getTotalLessons(): number {
  return UNITS.reduce((sum, u) => sum + u.lessons.length, 0);
}

export function getAllVocab() {
  return UNITS.flatMap(u =>
    u.lessons.flatMap(l =>
      l.vocab.map(v => ({ ...v, unitId: u.id, unitTitle: u.title, lessonId: l.id }))
    )
  );
}
