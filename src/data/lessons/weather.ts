import type { Lesson } from '../../types';

export const weatherLessons: Lesson[] = [
  {
    id: 'weather-1',
    title: 'Il Fait Beau — Or Does It?',
    subtitle: 'Weather is the universal French small-talk opener. Master it first.',
    xpReward: 20,
    vocab: [
      {
        french: 'Il fait beau',
        english: 'The weather is nice',
        pronunciation: 'il fɛ bo',
        funnyNote: 'Literally "it makes beautiful". French weather uses "faire" not "être". Never say "il est beau" about the weather — that means someone is handsome.',
      },
      {
        french: 'Il fait mauvais',
        english: 'The weather is bad',
        pronunciation: 'il fɛ movɛ',
      },
      {
        french: 'Il fait chaud',
        english: 'It\'s hot',
        pronunciation: 'il fɛ ʃo',
      },
      {
        french: 'Il fait froid',
        english: 'It\'s cold',
        pronunciation: 'il fɛ fʁwa',
      },
      {
        french: 'Il pleut',
        english: 'It\'s raining',
        pronunciation: 'il plø',
        funnyNote: '"Pleuvoir" is conjugated in the third person only. It just "il pleut". That\'s it. The verb exists for no other subject.',
      },
      {
        french: 'Il neige',
        english: 'It\'s snowing',
        pronunciation: 'il nɛʒ',
      },
      {
        french: 'Il y a du vent',
        english: 'It\'s windy',
        pronunciation: 'il ja dy vɑ̃',
        funnyNote: '"Il y a" = there is/are. "Du soleil" = sunshine. "Du brouillard" = fog. All follow the same pattern.',
      },
      {
        french: 'Quel temps fait-il ?',
        english: 'What\'s the weather like?',
        pronunciation: 'kɛl tɑ̃ fɛ til',
        funnyNote: '"Temps" means both "weather" AND "time" in French. Context distinguishes them. Quel temps = what weather. Combien de temps = how much time.',
      },
    ],
    exercises: [
      {
        type: 'translation',
        prompt: 'How do you say "It\'s raining"?',
        answer: 'Il pleut',
        hint: 'Pleuvoir only conjugates in third person singular',
      },
      {
        type: 'multiple-choice',
        prompt: '"Il fait chaud" means?',
        answer: 'It\'s hot',
        options: ['It\'s cold', 'It\'s nice', 'It\'s hot', 'It\'s windy'],
      },
      {
        type: 'fill-blank',
        prompt: 'Il y a du ___ (It\'s windy)',
        answer: 'vent',
        hint: '"Du vent" = some wind',
      },
    ],
  },
  {
    id: 'weather-2',
    title: 'Seasons, Forecasts & French Complaints',
    subtitle: 'The French have opinions about weather. Many. Loudly expressed.',
    xpReward: 20,
    vocab: [
      {
        french: 'le printemps',
        english: 'spring',
        pronunciation: 'lə pʁɛ̃tɑ̃',
        funnyNote: 'French spring is genuinely beautiful. Even Parisians become briefly pleasant.',
      },
      {
        french: 'l\'été',
        english: 'summer',
        pronunciation: 'lete',
        funnyNote: 'Paris in August: everyone leaves. July–August is "les grandes vacances". Entire offices close. Plan accordingly.',
      },
      {
        french: 'l\'automne',
        english: 'autumn / fall',
        pronunciation: 'lotɔn',
      },
      {
        french: 'l\'hiver',
        english: 'winter',
        pronunciation: 'livɛʁ',
      },
      {
        french: 'au printemps / en été / en automne / en hiver',
        english: 'in spring / in summer / in autumn / in winter',
        pronunciation: 'o pʁɛ̃tɑ̃ / ɑ̃ ete / ɑ̃ otɔn / ɑ̃ nivɛʁ',
        funnyNote: 'Use "au" before printemps (masculine). Use "en" before the other three. "En hiver" has a liaison: ɑ̃-nivɛʁ.',
      },
      {
        french: 'la météo',
        english: 'the weather forecast',
        pronunciation: 'la meteo',
      },
      {
        french: 'Il fait combien de degrés ?',
        english: 'What\'s the temperature?',
        pronunciation: 'il fɛ kɔ̃bjɛ̃ də dəɡʁe',
        funnyNote: 'France uses Celsius. 20°C = pleasant. 30°C = borderline canicule. 38°C = everyone complains to the government.',
      },
      {
        french: 'une canicule',
        english: 'a heatwave',
        pronunciation: 'yn kanikyl',
        funnyNote: 'The French take canicules seriously after the catastrophic 2003 heatwave. Rightfully so.',
      },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'How do you say "in spring"?',
        answer: 'au printemps',
        options: ['en printemps', 'au printemps', 'à le printemps', 'dans printemps'],
      },
      {
        type: 'translation',
        prompt: 'What is "la météo"?',
        answer: 'The weather forecast',
        hint: 'Short for météorologie',
      },
      {
        type: 'multiple-choice',
        prompt: '"En été" means?',
        answer: 'In summer',
        options: ['In autumn', 'In winter', 'In spring', 'In summer'],
      },
    ],
  },
];
