import type { SpeakingTask } from '../../../types/exam';

// DELF A1 production orale: 5–7 minutes, 10 minutes' preparation for parts 2
// and 3. Part 1 is a short interview about the candidate, part 2 has them ask
// the examiner questions from word cards, part 3 is a shopping role-play.

export const A1_SPEAKING: SpeakingTask[] = [
  {
    id: 'a1-oral-quartier',
    level: 'a1',
    title: 'Mon quartier, mes loisirs, au marché',
    parts: [
      {
        kind: 'entretien',
        title: 'Entretien dirigé',
        consigne: 'Vous répondez aux questions de l\'examinateur sur vous, votre famille, vos goûts ou vos activités.',
        instructionsEn: 'Answer the examiner\'s questions about yourself, your family, what you like and what you do.',
        prepMinutes: 0,
        speakMinutes: 1,
        examinerLines: [
          'Bonjour ! Comment vous appelez-vous ?',
          'Vous habitez où ?',
          'Qu\'est-ce que vous faites dans la vie ?',
          'Vous avez des frères et sœurs ?',
          'Qu\'est-ce que vous aimez faire le week-end ?',
        ],
        checklist: [
          'Answer each question with a full sentence',
          'Say your name, where you live and what you do',
          'Talk about your family',
          'Say what you like doing',
        ],
        usefulPhrases: ['Je m\'appelle…', 'J\'habite à…', 'Je suis étudiant(e) / Je travaille…', 'J\'ai un frère et une sœur', 'Le week-end, j\'aime…'],
        modelAnswer:
          'Je m\'appelle Lucas Moreau. J\'habite à Lyon, dans un petit appartement. Je suis étudiant en informatique. ' +
          'Oui, j\'ai une sœur, elle s\'appelle Inès, elle a quinze ans. Le week-end, j\'aime jouer au football avec mes amis et regarder des films.',
      },
      {
        kind: 'echange',
        title: 'Échange d\'informations',
        consigne:
          'Vous posez des questions à l\'examinateur à l\'aide des mots écrits sur les cartes. Utilisez chaque mot pour poser une question.',
        instructionsEn: 'Ask the examiner one question for each word card. Use "vous".',
        cueCards: ['Sport ?', 'Week-end ?', 'Quartier ?', 'Animal ?', 'Cuisine ?', 'Vacances ?'],
        prepMinutes: 10,
        speakMinutes: 2,
        examinerLines: [],
        checklist: [
          'Ask one question for every card',
          'Use question forms (est-ce que, inversion, rising intonation)',
          'Use "vous" with the examiner',
        ],
        usefulPhrases: ['Est-ce que vous… ?', 'Qu\'est-ce que vous… ?', 'Vous aimez… ?', 'Où est-ce que vous… ?', 'Quel est votre… ?'],
        modelAnswer:
          'Est-ce que vous faites du sport ? Qu\'est-ce que vous faites le week-end ? ' +
          'Vous aimez votre quartier ? Est-ce que vous avez un animal ? ' +
          'Quelle est votre cuisine préférée ? Où est-ce que vous allez en vacances cet été ?',
      },
      {
        kind: 'interaction',
        title: 'Dialogue simulé',
        consigne:
          'Vous êtes au marché. Vous achetez des fruits et des légumes pour un repas. Vous demandez les prix et vous payez. L\'examinateur joue le rôle du vendeur.',
        instructionsEn: 'You are at the market buying fruit and vegetables for a meal. Ask the prices and pay. The examiner is the stallholder.',
        document: 'Pommes : 2,50 € le kilo · Tomates : 3 € le kilo · Salade : 1,20 € · Fraises : 4 € la barquette',
        prepMinutes: 0,
        speakMinutes: 2,
        examinerLines: [
          'Bonjour ! Qu\'est-ce que je vous sers ?',
          'Très bien. Et avec ceci ?',
          'Désolé, je n\'ai plus de fraises aujourd\'hui. Vous voulez autre chose ?',
          'Alors, ça fait neuf euros vingt, s\'il vous plaît.',
          'Merci, voilà votre monnaie. Bonne journée !',
        ],
        checklist: [
          'Greet the seller and say goodbye',
          'Say what you want and how much',
          'Ask a price',
          'Deal with the missing item',
          'Pay and thank the seller',
        ],
        usefulPhrases: ['Je voudrais…', 'un kilo de…', 'C\'est combien ?', 'Ça fait combien ?', 'Voilà', 'Merci, au revoir !'],
        modelAnswer:
          'Bonjour madame ! Je voudrais un kilo de tomates et une salade, s\'il vous plaît. ' +
          'Et des fraises, une barquette. C\'est combien ? ' +
          'Ah, dommage. Alors, je voudrais un kilo de pommes. ' +
          'Voilà dix euros. Merci beaucoup, au revoir !',
      },
    ],
  },
  {
    id: 'a1-oral-cafe',
    level: 'a1',
    title: 'Au café, le matin',
    parts: [
      {
        kind: 'entretien',
        title: 'Entretien dirigé',
        consigne: 'Vous répondez aux questions de l\'examinateur sur vous, votre travail ou vos études et vos habitudes.',
        instructionsEn: 'Answer the examiner\'s questions about yourself, your work or studies and your habits.',
        prepMinutes: 0,
        speakMinutes: 1,
        examinerLines: [
          'Bonjour ! Quel est votre prénom ?',
          'D\'où venez-vous ?',
          'Vous travaillez ou vous étudiez ?',
          'Vous prenez souvent le petit-déjeuner au café ?',
          'Qu\'est-ce que vous prenez le matin, en général ?',
        ],
        checklist: [
          'Answer each question with a full sentence',
          'Say where you come from and what you do',
          'Talk about your breakfast habits',
        ],
        usefulPhrases: ['Je m\'appelle…', 'Je viens de…', 'Je travaille dans…', 'Je prends souvent…', 'Le matin, je prends…'],
        modelAnswer:
          'Je m\'appelle Camille. Je viens de Marseille, mais j\'habite à Paris depuis deux ans. Je travaille dans une banque, dans le centre-ville. ' +
          'Oui, je prends souvent le petit-déjeuner au café, près de chez moi, avant le travail. Le matin, je prends un thé et un croissant.',
      },
      {
        kind: 'echange',
        title: 'Échange d\'informations',
        consigne:
          'Vous posez des questions à l\'examinateur à l\'aide des mots écrits sur les cartes. Utilisez chaque mot pour poser une question.',
        instructionsEn: 'Ask the examiner one question for each word card. Use "vous".',
        cueCards: ['Musique ?', 'Livres ?', 'Transports ?', 'Restaurant ?', 'Famille ?', 'Métier ?'],
        prepMinutes: 10,
        speakMinutes: 2,
        examinerLines: [],
        checklist: [
          'Ask one question for every card',
          'Use question forms (est-ce que, inversion, rising intonation)',
          'Use "vous" with the examiner',
        ],
        usefulPhrases: ['Est-ce que vous… ?', 'Quelle est votre… ?', 'Vous aimez… ?', 'Vous avez… ?', 'Combien de… ?'],
        modelAnswer:
          'Est-ce que vous écoutez de la musique ? Quel est votre livre préféré ? ' +
          'Est-ce que vous prenez souvent les transports en commun ? Vous aimez les restaurants ? ' +
          'Est-ce que vous avez une grande famille ? Quel est votre métier ?',
      },
      {
        kind: 'interaction',
        title: 'Dialogue simulé',
        consigne:
          'Vous êtes dans un café, le matin. Vous commandez une boisson et quelque chose à manger. Vous demandez le prix et vous payez. L\'examinateur joue le rôle du serveur.',
        instructionsEn: 'You are in a café in the morning. Order a drink and something to eat, ask the price and pay. The examiner is the waiter.',
        document: 'Café crème : 3,50 € · Thé : 2,80 € · Croissant : 1,20 € · Pain au chocolat : 1,50 € · Jus d\'orange : 3 €',
        prepMinutes: 0,
        speakMinutes: 2,
        examinerLines: [
          'Bonjour ! Vous désirez ?',
          'Et avec ça ?',
          'Désolé, il n\'y a plus de croissants ce matin. Vous voulez autre chose ?',
          'Alors, ça fait cinq euros, s\'il vous plaît.',
          'Merci. Bonne journée, au revoir !',
        ],
        checklist: [
          'Greet the waiter and say what you want to drink and eat',
          'React to the missing item and choose another',
          'Ask the total price and pay',
          'Say thank you and goodbye',
        ],
        usefulPhrases: ['Je voudrais…', 'Un café crème, s\'il vous plaît', 'C\'est combien en tout ?', 'Ah, dommage', 'Voilà', 'Merci, au revoir !'],
        modelAnswer:
          'Bonjour ! Je voudrais un café crème, s\'il vous plaît. Et je voudrais aussi un croissant. ' +
          'Ah, dommage. Alors, un pain au chocolat, d\'accord. C\'est combien en tout ? ' +
          'Voilà, je vous donne cinq euros. Merci beaucoup, bonne journée, au revoir !',
      },
    ],
  },
  {
    id: 'a1-oral-billet-train',
    level: 'a1',
    title: 'Un billet de train pour Lyon',
    parts: [
      {
        kind: 'entretien',
        title: 'Entretien dirigé',
        consigne: 'Vous répondez aux questions de l\'examinateur sur vous, la ville où vous habitez et vos déplacements.',
        instructionsEn: 'Answer the examiner\'s questions about yourself, the town where you live and how you travel.',
        prepMinutes: 0,
        speakMinutes: 1,
        examinerLines: [
          'Bonjour ! Quel est votre prénom ?',
          'Vous habitez dans une grande ville ou à la campagne ?',
          'Vous prenez souvent le train ?',
          'Quel est votre moyen de transport préféré ?',
          'Vous avez déjà voyagé à l\'étranger ?',
        ],
        checklist: [
          'Answer each question with a full sentence',
          'Say where you live and whether it is a city or the countryside',
          'Say how you usually travel',
          'Give one example of a past trip',
        ],
        usefulPhrases: ['J\'habite dans une grande ville…', 'Je prends souvent…', 'Mon moyen de transport préféré, c\'est…', 'Oui, j\'ai déjà voyagé…', 'Je suis allé(e) en…'],
        modelAnswer:
          'Je m\'appelle Thomas. J\'habite dans une grande ville, à Lille, et je prends le train presque toutes les semaines pour travailler à Paris. ' +
          'Mon moyen de transport préféré, c\'est le train, parce que je peux lire ou dormir pendant le trajet. ' +
          'Oui, j\'ai déjà voyagé à l\'étranger : je suis allé en Belgique l\'année dernière, avec mes parents.',
      },
      {
        kind: 'echange',
        title: 'Échange d\'informations',
        consigne:
          'Vous posez des questions à l\'examinateur à l\'aide des mots écrits sur les cartes. Utilisez chaque mot pour poser une question.',
        instructionsEn: 'Ask the examiner one question for each word card. Use "vous".',
        cueCards: ['Cinéma ?', 'Musée ?', 'Télévision ?', 'Vélo ?', 'Langues ?', 'Santé ?'],
        prepMinutes: 10,
        speakMinutes: 2,
        examinerLines: [],
        checklist: [
          'Ask one question for every card',
          'Use question forms (est-ce que, inversion, rising intonation)',
          'Use "vous" with the examiner',
        ],
        usefulPhrases: ['Est-ce que vous… ?', 'Vous aimez… ?', 'Vous allez souvent… ?', 'Quelles… parlez-vous ?', 'Comment va… ?'],
        modelAnswer:
          'Est-ce que vous aimez beaucoup le cinéma ? Vous allez souvent au musée de la ville ? ' +
          'Est-ce que vous regardez la télévision le soir, après le travail ? Vous faites du vélo dans votre quartier ? ' +
          'Quelles langues parlez-vous, à part le français ? Comment va votre santé en ce moment ?',
      },
      {
        kind: 'interaction',
        title: 'Dialogue simulé',
        consigne:
          'Vous êtes à la gare, devant le guichet. Vous achetez un billet de train pour Lyon : vous choisissez le type de billet et l\'heure du départ. L\'examinateur joue le rôle de l\'employé du guichet.',
        instructionsEn: 'You are at the station ticket counter buying a train ticket to Lyon. Choose the type of ticket and the departure time. The examiner is the ticket clerk.',
        document: 'Paris → Lyon · Aller simple : 45 € · Aller-retour : 80 € · Départs : 9 h 15, 11 h 40, 14 h 05',
        prepMinutes: 0,
        speakMinutes: 2,
        examinerLines: [
          'Bonjour ! Vous désirez ?',
          'Vous voulez un aller simple ou un aller-retour ?',
          'Pour quel jour, et à quelle heure ?',
          'Désolé, le train de neuf heures quinze est complet. Il reste des places à onze heures quarante.',
          'Ça fait quatre-vingts euros. Voilà votre billet. Bon voyage !',
        ],
        checklist: [
          'Say where you are going and what ticket you want',
          'Give the day and time you want',
          'React to the full train and choose another time',
          'Ask the price and pay',
        ],
        usefulPhrases: ['Je voudrais un billet pour Lyon', 'Un aller-retour, s\'il vous plaît', 'Pour samedi prochain', 'Ah, d\'accord', 'C\'est combien ?', 'Bon voyage, merci !'],
        modelAnswer:
          'Bonjour monsieur ! Je voudrais un billet pour Lyon, s\'il vous plaît. Un aller-retour. ' +
          'Pour samedi prochain, le train de neuf heures quinze, si possible. Ah, d\'accord. Alors, le train de onze heures quarante, c\'est parfait. ' +
          'C\'est combien ? Voilà, je paie par carte. Merci beaucoup, bonne journée !',
      },
    ],
  },
];
