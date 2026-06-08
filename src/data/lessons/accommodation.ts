import type { Lesson } from '../../types';

export const accommodationLessons: Lesson[] = [
  {
    id: 'accommodation-1',
    title: 'Hotel Check-in Without a Breakdown',
    subtitle: 'The shower has 47 settings. None of them work as expected.',
    xpReward: 20,
    vocab: [
      {
        french: 'J\'ai une réservation',
        english: 'I have a reservation',
        pronunciation: 'ʒɛ yn ʁezɛʁvasjɔ̃',
        funnyNote: 'Say this immediately upon entering. It establishes you as a legitimate guest, not someone who wandered in.',
      },
      {
        french: 'Au nom de...',
        english: 'In the name of... / Under the name...',
        pronunciation: 'o nɔ̃ də',
        example: 'Au nom de Smith.',
        exampleTranslation: 'Under the name Smith.',
      },
      {
        french: 'Ma chambre, s\'il vous plaît',
        english: 'My room, please',
        pronunciation: 'ma ʃɑ̃bʁ sil vu plɛ',
      },
      {
        french: 'Le WiFi ne fonctionne pas',
        english: 'The WiFi isn\'t working',
        pronunciation: 'lə wifi nə fɔ̃ksjɔn pa',
        funnyNote: 'A universal phrase. Transcends culture.',
      },
      {
        french: 'Il n\'y a pas d\'eau chaude',
        english: 'There\'s no hot water',
        pronunciation: 'il nja pa do ʃod',
        funnyNote: 'Critical. Learn this one.',
      },
      {
        french: 'À quelle heure est le petit-déjeuner ?',
        english: 'What time is breakfast?',
        pronunciation: 'a kɛl œʁ ɛ lə pəti deʒœne',
        funnyNote: 'French hotel breakfast is often just coffee and bread. Manage expectations accordingly.',
      },
      {
        french: 'Clé / Carte magnétique',
        english: 'Key / Key card',
        pronunciation: 'kle / kaʁt maɲetik',
      },
    ],
    exercises: [
      {
        type: 'translation',
        prompt: 'Say "I have a reservation under the name Chen"',
        answer: "J'ai une réservation au nom de Chen",
        hint: 'Combine "J\'ai une réservation" + "au nom de"',
      },
      {
        type: 'multiple-choice',
        prompt: 'The WiFi is broken. What do you say at the front desk?',
        answer: 'Le WiFi ne fonctionne pas',
        options: ['Le WiFi est cassé', 'Le WiFi ne fonctionne pas', 'Internet broken', 'Pas de WiFi ici'],
      },
      {
        type: 'fill-blank',
        prompt: '"___ n\'y a pas d\'eau chaude" (There\'s no hot water)',
        answer: 'Il',
        hint: 'The impersonal subject pronoun',
      },
    ],
  },
];
