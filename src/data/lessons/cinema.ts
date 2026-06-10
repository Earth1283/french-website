import type { Lesson } from '../../types';

export const cinemaLessons: Lesson[] = [
  {
    id: 'cinema-1',
    title: 'At the Cinema',
    subtitle: 'VO or VF? Get this wrong and you\'ll watch Avengers dubbed into French.',
    xpReward: 25,
    vocab: [
      {
        french: 'La version originale (VO)',
        english: 'Original language version (with French subtitles)',
        pronunciation: 'la vɛʁsjɔ̃ ɔʁiʒinal',
        funnyNote: 'Always look for "VO" or "VOST" (version originale sous-titrée). If you want to watch an English film in English, this is what you want. "VF" is dubbed — avoid if you value your sanity.',
      },
      {
        french: 'La version française (VF)',
        english: 'French-dubbed version',
        pronunciation: 'la vɛʁsjɔ̃ fʁɑ̃sɛz',
        funnyNote: 'The French are world champions of dubbing. The voices are actually good. But if you\'re watching an English film to relax, VF will mess with your brain.',
      },
      {
        french: 'Une séance',
        english: 'A screening / showing',
        pronunciation: 'yn seɑ̃s',
        example: 'À quelle heure est la prochaine séance ?',
        exampleTranslation: 'What time is the next showing?',
        funnyNote: 'Also means a session at a doctor\'s. Context will usually save you.',
      },
      {
        french: 'Deux places, s\'il vous plaît',
        english: 'Two seats/tickets, please',
        pronunciation: 'dø plas sil vu plɛ',
        funnyNote: '"Une place" = one ticket. Not "un billet" in this context — a cinema ticket is "une place" (a place/seat).',
      },
      {
        french: 'Les sous-titres',
        english: 'Subtitles',
        pronunciation: 'le su titʁ',
        funnyNote: 'Subtitle-friendly cinemas are marked "VOST". French cinemas in large cities reliably carry VO screenings. Small towns: bring your dubbed-French tolerance.',
      },
      {
        french: 'La salle',
        english: 'The screen room / auditorium',
        pronunciation: 'la sal',
        funnyNote: '"Salle 3" = Screen 3. You\'ll see this on your ticket. In France, seats are usually allocated — check your place number.',
      },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'You want to watch a film in its original English with French subtitles. You ask for:',
        answer: 'La version originale (VO)',
        options: [
          'La version française (VF)',
          'La version originale (VO)',
          'La version sous-titrée (VS)',
          'La séance anglaise',
        ],
      },
      {
        type: 'fill-blank',
        prompt: '"À quelle heure est la prochaine ___ ?" (What time is the next showing?)',
        answer: 'séance',
        hint: 'The word for a cinema screening',
      },
      {
        type: 'translation',
        prompt: 'How do you ask for two tickets?',
        answer: 'Deux places, s\'il vous plaît',
        hint: 'In cinemas, a ticket is called "une place"',
      },
    ],
  },
  {
    id: 'cinema-2',
    title: 'Museums & Culture',
    subtitle: 'The Louvre queue is 3 hours. The audioguide is 5 euros. C\'est la vie.',
    xpReward: 25,
    vocab: [
      {
        french: 'L\'entrée',
        english: 'Entry / Admission / The entrance',
        pronunciation: 'lɑ̃tʁe',
        example: 'C\'est combien l\'entrée ?',
        exampleTranslation: 'How much is admission?',
        funnyNote: 'Both the physical entrance door AND the ticket/admission price. Context dependent but you\'ll figure it out.',
      },
      {
        french: 'Gratuit / Payant',
        english: 'Free / Paid entry',
        pronunciation: 'ɡʁatɥi / pɛjɑ̃',
        funnyNote: 'Many French national museums are free for under-26s (EU residents). The first Sunday of the month is often free. Always check — you may not need to pay.',
      },
      {
        french: 'Un audioguide',
        english: 'An audioguide',
        pronunciation: 'œ̃ n‿odjogid',
        funnyNote: 'Usually €5–8. Available in English. Worth it for the Louvre, Musée d\'Orsay, and Versailles. Wear the headphones confidently like you own the place.',
      },
      {
        french: 'La file d\'attente',
        english: 'The queue / the waiting line',
        pronunciation: 'la fil d‿atɑ̃t',
        funnyNote: '"Il y a une grande file d\'attente" = there is a long queue. Book online to skip it. Seriously. Book online.',
      },
      {
        french: 'Interdit de toucher',
        english: 'Do not touch',
        pronunciation: 'ɛ̃tɛʁdi də tuʃe',
        funnyNote: 'You\'ll see this everywhere. "Interdit de photographier" = no photos. Some rooms allow photos without flash. When in doubt, watch what the French visitors do — they ignore all rules, which means it\'s fine.',
      },
      {
        french: 'L\'exposition temporaire',
        english: 'The temporary exhibition',
        pronunciation: 'lɛkspozisijɔ̃ tɑ̃pɔʁɛʁ',
        funnyNote: 'Often requires a separate ticket on top of the museum entry. Always worth checking — French temp exhibitions are genuinely world-class.',
      },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'The museum sign says "Entrée gratuite". What does this mean?',
        answer: 'Free entry',
        options: [
          'Entry by reservation only',
          'Free entry',
          'Pay at the door',
          'Closed for renovation',
        ],
      },
      {
        type: 'fill-blank',
        prompt: '"Je voudrais un ___" (I would like an audioguide)',
        answer: 'audioguide',
        hint: 'The same word in French and English',
      },
      {
        type: 'translation',
        prompt: 'How do you say "There is a long queue"?',
        answer: 'Il y a une grande file d\'attente',
        hint: '"Il y a" = there is, "grande" = long/big',
      },
    ],
  },
];
