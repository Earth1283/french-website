import type { Lesson } from '../../types';

export const vieFrancaiseLessons: Lesson[] = [
  {
    id: 'vie-francaise-1',
    title: 'L\'Apéro: France\'s Happiest Hour',
    subtitle: 'The ritual that happens before every French dinner. It is not optional.',
    xpReward: 25,
    vocab: [
      {
        french: 'L\'apéro / l\'apéritif',
        english: 'Pre-dinner drinks',
        pronunciation: 'lapero / lapeʁitif',
        funnyNote: 'L\'apéro is not just a drink — it\'s a decompression ritual. It happens between roughly 6pm and 8pm. Light snacks appear. Nobody is in a hurry. The whole concept is the opposite of happy hour.',
      },
      {
        french: 'On prend l\'apéro ?',
        english: 'Shall we have drinks?',
        pronunciation: 'ɔ̃ pʁɑ̃ lapero',
        funnyNote: 'This four-word phrase is a genuine social invitation. Saying yes commits you to at least an hour of pleasant conversation. Saying no is technically allowed but socially noted.',
      },
      {
        french: 'Un kir',
        english: 'White wine with blackcurrant liqueur',
        pronunciation: 'œ̃ kiʁ',
        funnyNote: 'The classic French aperitif. Named after Canon Félix Kir, mayor of Dijon, who popularised it after WWII. Kir Royale = same thing with Champagne. Order one and you immediately look like you know what you\'re doing.',
      },
      {
        french: 'Un pastis',
        english: 'Anise-flavoured aperitif, diluted with water',
        pronunciation: 'œ̃ pastis',
        funnyNote: 'The South of France in a glass. Pernod, Ricard, Pastis 51 — all pastis. You pour a measure and add cold water; it turns cloudy. Never add ice first. This matters to French people.',
      },
      {
        french: 'Des amuse-gueules',
        english: 'Small snacks served with drinks',
        pronunciation: 'de zamyz ɡœl',
        funnyNote: 'Literally "mouth-amusers". Olives, crisps, small toasts, tiny tarts. Nothing elaborate — the point is to maintain the conversation, not replace dinner.',
      },
      {
        french: 'Santé !',
        english: 'Cheers! (Informal)',
        pronunciation: 'sɑ̃te',
        funnyNote: 'Literally "health". When toasting, you MUST make eye contact with each person as you clink glasses. Missing someone is considered bad luck — seven years of bad luck, by some accounts. The French take this seriously.',
      },
      {
        french: 'À votre santé !',
        english: 'To your health! (Formal)',
        pronunciation: 'a votʁ sɑ̃te',
        funnyNote: 'The formal version. Use with people you\'d use "vous" with. In a group of strangers, "à votre santé" signals good manners.',
      },
      {
        french: 'Cul sec !',
        english: 'Bottoms up! / Down in one!',
        pronunciation: 'ky sɛk',
        funnyNote: 'Literally "dry bottom". Only for among friends, and only when someone challenges you. Not a standard toast.',
      },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'You\'re toasting at a dinner table with 5 French people. What is expected of you?',
        answer: 'Make eye contact with each person as you clink glasses',
        options: [
          'Just raise your glass and say Santé',
          'Make eye contact with each person as you clink glasses',
          'Clink only with the person next to you',
          'Wait for the host to clink with you first',
        ],
      },
      {
        type: 'translation',
        prompt: 'How do you ask a friend "Shall we have drinks?"',
        answer: 'On prend l\'apéro ?',
        hint: 'On prend + l\'apéro',
      },
      {
        type: 'multiple-choice',
        prompt: 'A pastis turns cloudy when you add water. This is:',
        answer: 'Normal — it\'s the louche effect of anise',
        options: [
          'A sign it\'s gone off',
          'Normal — it\'s the louche effect of anise',
          'Only supposed to happen with ice',
          'A sign you added too much water',
        ],
      },
    ],
  },
  {
    id: 'vie-francaise-2',
    title: 'Le Marché: Shopping as a Way of Life',
    subtitle: 'The market is not a supermarket. It is a cultural institution.',
    xpReward: 25,
    vocab: [
      {
        french: 'Le marché',
        english: 'The market',
        pronunciation: 'lə maʁʃe',
        funnyNote: 'Every French town has a market — usually weekly, often twice weekly. The marché is where locals actually shop for food, not the supermarché. Going to the market is a ritual, not an errand.',
      },
      {
        french: 'Le maraîcher',
        english: 'The market gardener / produce seller',
        pronunciation: 'lə maʁɛʃe',
        funnyNote: 'Your local produce vendor at the market. They grow what they sell, usually within 50km. Building a rapport with your maraîcher is a French life skill.',
      },
      {
        french: 'De saison',
        english: 'In season',
        pronunciation: 'də sɛzɔ̃',
        funnyNote: 'The most important phrase in French food culture. "C\'est de saison ?" (Is it in season?) is not a quirky question — it\'s the correct question. Buying strawberries in November is quietly frowned upon.',
      },
      {
        french: 'Le terroir',
        english: 'The land, soil, and local character of produce',
        pronunciation: 'lə tɛʁwaʁ',
        funnyNote: 'One of the most untranslatable French words. "Terroir" means the taste of where something is from — the soil, climate, tradition of a specific place. Wine, cheese, vegetables all have terroir. It\'s a philosophy, not just a word.',
      },
      {
        french: 'Un kilo de... / une livre de...',
        english: 'A kilo of... / half a kilo of...',
        pronunciation: 'œ̃ kilo də / yn livʁ də',
        funnyNote: '"Une livre" is 500g in French (half a kilo). Not a pound. This is a common confusion. "Une livre de tomates" = 500g of tomatoes.',
      },
      {
        french: 'C\'est de chez qui ?',
        english: 'Who is it from? / Where is it from?',
        pronunciation: 'sɛ də ʃe ki',
        funnyNote: 'The question that separates the shopper from the tourist. Asking where the produce is from shows you understand that origin matters. Vendors love this question.',
      },
      {
        french: 'Le fromager',
        english: 'The cheese seller',
        pronunciation: 'lə fʁomaʒe',
        funnyNote: 'A specialist who sells only cheese. At a good marché, they will let you taste before you buy, recommend something for tonight vs something for the weekend, and have opinions.',
      },
      {
        french: 'Ne touchez pas, s\'il vous plaît',
        english: 'Please don\'t touch',
        pronunciation: 'nə tuʃe pa sil vu plɛ',
        funnyNote: 'Market etiquette: you do not touch the produce yourself. You point and the vendor picks it. This is the rule. Don\'t be the person who squeezes every peach.',
      },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'At a French market, how do you select your fruit and vegetables?',
        answer: 'Point at what you want — the vendor picks it for you',
        options: [
          'Pick them up and examine them yourself',
          'Point at what you want — the vendor picks it for you',
          'Ask for a bag and fill it yourself',
          'Choose from pre-packaged displays only',
        ],
      },
      {
        type: 'translation',
        prompt: 'Ask for "a kilo of tomatoes"',
        answer: 'Un kilo de tomates',
        hint: 'Un kilo de + the item',
      },
      {
        type: 'multiple-choice',
        prompt: '"Le terroir" refers to:',
        answer: 'The distinctive character a place gives to its food and wine',
        options: [
          'Organic farming methods',
          'The distinctive character a place gives to its food and wine',
          'The soil type only',
          'A wine classification system',
        ],
      },
    ],
  },
  {
    id: 'vie-francaise-3',
    title: 'La Flânerie: The Art of Going Nowhere',
    subtitle: 'France is one of the few places where aimless wandering is a recognised activity.',
    xpReward: 25,
    vocab: [
      {
        french: 'La flânerie',
        english: 'Aimless, pleasurable wandering',
        pronunciation: 'la flanʁi',
        funnyNote: 'To "flâner" is to wander without purpose — slowly, observantly, for the pleasure of it. The "flâneur" was romanticised by Baudelaire. In France, wandering around a neighbourhood for two hours is a legitimate Saturday activity, not a sign of being lost.',
      },
      {
        french: 'Une terrasse',
        english: 'A café terrace',
        pronunciation: 'yn tɛʁas',
        funnyNote: 'The outdoor section of a café, usually on the pavement. In France, the terrasse is not where you sit when there\'s no room inside — it\'s where you sit by choice. The view of the street is the point.',
      },
      {
        french: 'Je prends juste un café',
        english: 'I\'ll just have a coffee',
        pronunciation: 'ʒə pʁɑ̃ ʒyst œ̃ kafe',
        funnyNote: 'In France, ordering one coffee and sitting for 90 minutes is entirely acceptable. Nobody will hurry you. Nobody will bring the bill until you ask. A café is not a place to process customers — it\'s a place to be.',
      },
      {
        french: 'Se balader',
        english: 'To stroll, wander around',
        pronunciation: 'sə balade',
        funnyNote: '"On se balade ?" = Shall we go for a wander? More casual than flânerie, but the same spirit. Walking with no destination.',
      },
      {
        french: 'Prendre le temps',
        english: 'To take one\'s time',
        pronunciation: 'pʁɑ̃dʁ lə tɑ̃',
        funnyNote: '"Prenez le temps" — take your time — is said frequently in France and genuinely meant. Rushing is considered a sign of poor organisation, not dedication.',
      },
      {
        french: 'Le quartier',
        english: 'The neighbourhood',
        pronunciation: 'lə kaʁtje',
        funnyNote: 'French people identify strongly with their quartier. A Parisian says they\'re from the 11th arrondissement, not from Paris. The quartier has its own market, café, baker, and character.',
      },
      {
        french: 'Flâner dans les rues',
        english: 'To wander the streets',
        pronunciation: 'flane dɑ̃ le ʁy',
        funnyNote: 'The sentence that sums up an ideal French afternoon. No phone, no destination, a good coat.',
      },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'You sit at a Paris café, finish your coffee, and stay talking for an hour. The waiter:',
        answer: 'Leaves you alone until you ask for the bill',
        options: [
          'Asks you to order again or leave',
          'Leaves you alone until you ask for the bill',
          'Brings the bill after 20 minutes',
          'Asks you to move to free up the table',
        ],
      },
      {
        type: 'translation',
        prompt: 'How do you say "to take one\'s time"?',
        answer: 'Prendre le temps',
        hint: 'Prendre = to take, le temps = time',
      },
      {
        type: 'multiple-choice',
        prompt: '"La flânerie" means:',
        answer: 'Aimless, pleasurable wandering',
        options: [
          'Speed-walking for exercise',
          'Aimless, pleasurable wandering',
          'Window shopping without buying',
          'Getting lost in a foreign city',
        ],
      },
    ],
  },
];
