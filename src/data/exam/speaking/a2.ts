import type { SpeakingTask } from '../../../types/exam';

// DELF A2 production orale: about 6 minutes of speaking, 10 minutes' preparation
// for part 2. Part 1 is a short interview about the candidate, part 2 is a
// monologue on a personal topic, prepared from notes and then delivered without
// interruption, and part 3 is a role-play in which the examiner plays the other
// character and throws in one problem the candidate has to deal with.

export const A2_SPEAKING: SpeakingTask[] = [
  {
    id: 'a2-oral-vacances-hotel',
    level: 'a2',
    title: 'Mes vacances, une chambre d\'hôtel',
    parts: [
      {
        kind: 'entretien',
        title: 'Entretien dirigé',
        consigne: 'Vous répondez aux questions de l\'examinateur sur vous, votre travail, vos façons de voyager et vos projets.',
        instructionsEn: 'Answer the examiner\'s questions about yourself, your job, how you travel and your plans.',
        prepMinutes: 0,
        speakMinutes: 1.5,
        examinerLines: [
          'Bonjour ! Qu\'est-ce que vous faites dans la vie ?',
          'Vous partez en vacances souvent ?',
          'Avec qui est-ce que vous voyagez, en général ?',
          'Qu\'est-ce que vous aimez faire pendant les vacances ?',
          'Quel est votre prochain projet de voyage ?',
        ],
        checklist: [
          'Answer each question in full sentences',
          'Say how often you travel and with whom',
          'Describe what you like to do on holiday',
          'Give a plan for the future using the futur proche',
        ],
        usefulPhrases: ['Je pars en vacances…', 'En général, je voyage avec…', 'J\'aime me reposer et…', 'Mon prochain projet, c\'est…', 'Nous allons…'],
        modelAnswer:
          'Je suis infirmière dans un hôpital à Nantes. Je pars en vacances deux ou trois fois par an, surtout en été. ' +
          'En général, je voyage avec mon mari et nos deux enfants. Pendant les vacances, j\'aime me reposer, lire au bord de la mer et faire de la randonnée. ' +
          'Mon prochain projet, c\'est une semaine en Corse au mois de juin. Nous allons louer une petite maison près de la plage, et les enfants sont très contents !',
      },
      {
        kind: 'monologue',
        title: 'Monologue suivi',
        consigne:
          'Vous parlez pendant deux minutes de votre dernier voyage ou de vos dernières vacances : où vous êtes allé(e), avec qui, ce que vous avez fait et ce que vous avez aimé.',
        instructionsEn:
          'Talk for about two minutes about your last trip or holiday: where you went, who with, what you did and what you enjoyed. You have 10 minutes to prepare notes. The examiner does not speak.',
        prepMinutes: 10,
        speakMinutes: 2,
        examinerLines: [],
        checklist: [
          'Speaks for about two minutes with few long pauses',
          'Uses the passé composé for what happened and the imperfect for descriptions',
          'Says where, when, with whom and what they did',
          'Gives a personal opinion about the trip',
        ],
        usefulPhrases: ['Au mois d\'août dernier, je suis allé(e)…', 'Nous avons visité…', 'Il faisait beau / il pleuvait', 'Ce que j\'ai préféré, c\'est…', 'C\'était vraiment…'],
        modelAnswer:
          'Au mois d\'août dernier, je suis partie une semaine en Bretagne avec ma sœur. Nous avons logé dans une petite maison près de la mer, à Carnac. ' +
          'Le premier jour, nous avons visité le village et nous avons mangé des crêpes au bord du port. ' +
          'Il faisait beau presque tous les jours, donc nous sommes allées à la plage et nous avons fait du vélo. ' +
          'Ce que j\'ai préféré, c\'est le coucher du soleil sur l\'océan. C\'était vraiment un très bon souvenir, je voudrais y retourner !',
      },
      {
        kind: 'interaction',
        title: 'Exercice en interaction',
        consigne:
          'Vous téléphonez à l\'hôtel pour réserver une chambre. Vous posez vos questions, vous donnez vos dates et vous acceptez ou refusez les propositions de l\'examinateur.',
        instructionsEn:
          'You phone a hotel to book a room. Ask your questions, give your dates and accept or refuse the examiner\'s suggestions. The examiner is the receptionist.',
        document:
          'Vous voulez réserver une chambre double pour deux personnes à l\'hôtel Les Dunes, à Biarritz, du vendredi 14 au lundi 17 août. ' +
          'Vous voulez savoir si le petit-déjeuner est compris dans le prix et s\'il y a une piscine. L\'examinateur joue le rôle de la réceptionniste.',
        prepMinutes: 0,
        speakMinutes: 3,
        examinerLines: [
          'Hôtel Les Dunes, bonjour ! Qu\'est-ce que je peux faire pour vous ?',
          'Une chambre double pour deux personnes, très bien. Je regarde ça tout de suite.',
          'Malheureusement, la chambre n\'est pas libre le vendredi. Nous avons une chambre à partir du samedi 15 août, à cent vingt euros par nuit.',
          'Oui, il y a une piscine. Elle est ouverte de dix heures à vingt heures.',
          'Très bien, je vous réserve la chambre. À quel nom, s\'il vous plaît ?',
        ],
        checklist: [
          'Greets the receptionist and states the room and dates',
          'Asks about price, breakfast and facilities',
          'Handles the change of dates without giving up',
          'Gives a name and closes the call politely',
        ],
        usefulPhrases: ['Je voudrais réserver une chambre…', 'Est-ce que le petit-déjeuner est compris ?', 'Ah, ce n\'est pas possible ?', 'Ça me va très bien', 'Est-ce qu\'il y a une piscine ?', 'Je m\'appelle…'],
        modelAnswer:
          'Bonjour madame ! Je voudrais réserver une chambre double, pour deux personnes, du vendredi 14 au lundi 17 août. ' +
          'Ah, le vendredi, ce n\'est pas possible ? Bon, alors du samedi 15 au lundi 17 août, ça me va très bien. ' +
          'Est-ce que le petit-déjeuner est compris dans le prix ? Et est-ce qu\'il y a une piscine à l\'hôtel ? ' +
          'Très bien, c\'est parfait. Je m\'appelle Julien Martin. Merci beaucoup, au revoir !',
      },
    ],
  },
  {
    id: 'a2-oral-repas-anniversaire',
    level: 'a2',
    title: 'Mes repas, une table pour un anniversaire',
    parts: [
      {
        kind: 'entretien',
        title: 'Entretien dirigé',
        consigne: 'Vous répondez aux questions de l\'examinateur sur vos repas, vos goûts et votre façon de cuisiner.',
        instructionsEn: 'Answer the examiner\'s questions about your meals, your tastes and how you cook.',
        prepMinutes: 0,
        speakMinutes: 1.5,
        examinerLines: [
          'Bonjour ! Vous aimez manger au restaurant ?',
          'Vous cuisinez souvent ?',
          'Quel est votre plat préféré ?',
          'Est-ce que vous faites attention à ce que vous mangez ?',
          'Vous avez fait un bon repas récemment ?',
        ],
        checklist: [
          'Answer each question in full sentences',
          'Say how often you cook and eat out',
          'Name a favourite dish and say why you like it',
          'Use a past tense for the last good meal',
        ],
        usefulPhrases: ['J\'aime bien manger…', 'Je cuisine presque tous les jours', 'Mon plat préféré, c\'est…', 'Je mange beaucoup de…', 'La semaine dernière, nous avons…'],
        modelAnswer:
          'Oui, j\'aime bien manger au restaurant, surtout avec mes amis, le samedi soir. Je cuisine presque tous les jours, parce que je n\'aime pas les plats surgelés. ' +
          'Mon plat préféré, c\'est la blanquette de veau que ma grand-mère faisait. Oui, je fais attention : je mange beaucoup de légumes et je bois beaucoup d\'eau. ' +
          'La semaine dernière, nous avons fait un très bon repas chez mes parents, avec une tarte aux pommes.',
      },
      {
        kind: 'monologue',
        title: 'Monologue suivi',
        consigne:
          'Vous parlez pendant deux minutes de vos habitudes alimentaires : ce que vous mangez le matin, à midi et le soir, ce que vous aimez cuisiner et ce que vous voudriez changer.',
        instructionsEn:
          'Talk for about two minutes about your eating habits: what you eat in the morning, at lunchtime and in the evening, what you like cooking and what you would like to change. You have 10 minutes to prepare notes. The examiner does not speak.',
        prepMinutes: 10,
        speakMinutes: 2,
        examinerLines: [],
        checklist: [
          'Speaks for about two minutes with few long pauses',
          'Uses the present for habits',
          'Covers breakfast, lunch and dinner',
          'Says what they would like to change',
        ],
        usefulPhrases: ['Le matin, je prends…', 'À midi, je mange souvent…', 'Le soir, nous…', 'J\'aime cuisiner…', 'Je mange trop de…', 'Je voudrais manger plus de…'],
        modelAnswer:
          'Le matin, je prends toujours un café et des tartines avec du beurre et de la confiture. Je n\'ai pas beaucoup de temps, donc le petit-déjeuner est rapide. ' +
          'À midi, je mange souvent un sandwich au bureau, mais le week-end, je préfère un vrai repas chez moi. ' +
          'Le soir, je cuisine avec mon compagnon. Nous aimons les légumes, les pâtes et le poisson. ' +
          'Par contre, j\'ai une mauvaise habitude : je mange trop de sucreries. Je voudrais manger plus de fruits et boire moins de café.',
      },
      {
        kind: 'interaction',
        title: 'Exercice en interaction',
        consigne:
          'Vous téléphonez à un restaurant pour réserver une table. Vous donnez vos demandes et vous négociez si c\'est nécessaire. L\'examinateur joue le rôle de la personne qui répond au téléphone.',
        instructionsEn:
          'You phone a restaurant to book a table for a birthday meal. Give your request and negotiate if needed. The examiner answers the phone.',
        document:
          'Vous voulez réserver une table pour six personnes, samedi soir à vingt heures, pour l\'anniversaire d\'un ami. ' +
          'Vous voulez une table à l\'intérieur, dans un endroit calme. Vous appelez le restaurant Le Bistrot du Port. ' +
          'L\'examinateur joue le rôle de la personne qui répond au téléphone.',
        prepMinutes: 0,
        speakMinutes: 3,
        examinerLines: [
          'Le Bistrot du Port, bonjour ! Vous désirez ?',
          'Pour six personnes, très bien. Un instant, je regarde le planning.',
          'Samedi soir, à vingt heures, c\'est complet. Il reste une table à dix-neuf heures, ou à vingt et une heures trente.',
          'Une table pour six personnes au fond de la salle, à l\'intérieur, c\'est parfait. Vous voulez commander le menu à l\'avance ?',
          'Très bien. Je prends votre nom et votre numéro de téléphone, s\'il vous plaît ?',
        ],
        checklist: [
          'Gives the booking details: day, time and number of people',
          'Reacts to the unavailable time and accepts another',
          'Asks for a quiet table inside',
          'Gives a name and phone number, then closes politely',
        ],
        usefulPhrases: ['Je voudrais réserver une table…', 'Oh, dommage', 'D\'accord, alors…', 'Est-ce qu\'on peut avoir une table à l\'intérieur ?', 'Oui, nous voulons bien…', 'Mon numéro, c\'est le…'],
        modelAnswer:
          'Bonjour ! Je voudrais réserver une table pour six personnes, samedi soir, à vingt heures, s\'il vous plaît. ' +
          'Oh, dommage. D\'accord, alors à dix-neuf heures, ça va très bien. Est-ce qu\'on peut avoir une table à l\'intérieur, dans un endroit calme ? C\'est pour un anniversaire. ' +
          'Parfait, merci beaucoup. Oui, nous voulons bien commander le menu à l\'avance. Je m\'appelle Sophie Bernard, et mon numéro, c\'est le zéro six, douze, trente-quatre, cinquante-six. Merci, au revoir !',
      },
    ],
  },
  {
    id: 'a2-oral-grille-pain',
    level: 'a2',
    title: 'Mon logement, un grille-pain en panne',
    parts: [
      {
        kind: 'entretien',
        title: 'Entretien dirigé',
        consigne: 'Vous répondez aux questions de l\'examinateur sur vos achats et vos habitudes d\'achat.',
        instructionsEn: 'Answer the examiner\'s questions about what you buy and how you shop.',
        prepMinutes: 0,
        speakMinutes: 1.5,
        examinerLines: [
          'Bonjour ! Vous aimez faire les magasins ?',
          'Vous faites vos achats en magasin ou sur Internet ?',
          'Qu\'est-ce que vous avez acheté récemment ?',
          'Vous achetez souvent des appareils électriques pour la maison ?',
          'Est-ce que vous lisez les avis avant d\'acheter quelque chose ?',
        ],
        checklist: [
          'Answer each question in full sentences',
          'Say where and how they usually shop',
          'Give an example of a recent purchase',
          'Explain a habit with parce que',
        ],
        usefulPhrases: ['J\'aime bien faire les magasins…', 'Je fais la plupart de mes achats…', 'Récemment, j\'ai acheté…', 'N\'acheter que quand c\'est nécessaire', 'Je lis toujours les avis'],
        modelAnswer:
          'Oui, j\'aime bien faire les magasins le samedi, surtout pour les vêtements. Je fais la plupart de mes achats en magasin, mais je commande aussi sur Internet quand c\'est moins cher. ' +
          'Récemment, j\'ai acheté une lampe pour ma chambre. Je n\'achète pas souvent des appareils électriques, seulement quand c\'est vraiment nécessaire. ' +
          'Oui, je lis toujours les avis avant d\'acheter quelque chose, parce que je ne veux pas avoir de mauvaise surprise.',
      },
      {
        kind: 'monologue',
        title: 'Monologue suivi',
        consigne:
          'Vous parlez pendant deux minutes de votre logement : où il se trouve, comment il est, ce que vous aimez dedans et ce que vous voudriez changer.',
        instructionsEn:
          'Talk for about two minutes about where you live: where it is, what it is like, what you like about it and what you would change. You have 10 minutes to prepare notes. The examiner does not speak.',
        prepMinutes: 10,
        speakMinutes: 2,
        examinerLines: [],
        checklist: [
          'Speaks for about two minutes without long pauses',
          'Describes the place with il y a and adjectives',
          'Says what they like and what they dislike',
          'Says what they would change, using je voudrais or si je pouvais',
        ],
        usefulPhrases: ['J\'habite dans un petit appartement…', 'Il y a deux chambres…', 'Ce que j\'aime le plus, c\'est…', 'Par contre, …', 'Si je pouvais, je…'],
        modelAnswer:
          'J\'habite dans un petit appartement au troisième étage, près du centre-ville. Il est assez lumineux, parce que le salon et la cuisine ont de grandes fenêtres. ' +
          'Il y a deux chambres, une salle de bain et un petit balcon où je prends mon café le matin. ' +
          'Ce que j\'aime le plus, c\'est le calme de la rue et mes voisins, qui sont très sympathiques. Par contre, la cuisine est un peu petite. ' +
          'Si je pouvais changer quelque chose, je voudrais une cuisine plus grande et un jardin.',
      },
      {
        kind: 'interaction',
        title: 'Exercice en interaction',
        consigne:
          'Vous êtes au magasin. Vous voulez rapporter un appareil qui ne marche plus. Vous expliquez le problème et vous demandez ce que le magasin peut faire pour vous. L\'examinateur joue le rôle du vendeur.',
        instructionsEn:
          'You want to return a toaster that no longer works. Explain the problem, ask for a refund and react to the seller\'s suggestions. The examiner is the shop assistant.',
        document:
          'Vous avez acheté un grille-pain dans le magasin Électro Plus il y a dix jours, au prix de quarante-cinq euros. ' +
          'Il ne marche plus : il ne chauffe pas. Vous avez le ticket de caisse. Vous voulez être remboursé(e). L\'examinateur joue le rôle du vendeur.',
        prepMinutes: 0,
        speakMinutes: 3,
        examinerLines: [
          'Bonjour ! Je peux vous aider ?',
          'Vous avez votre ticket de caisse ? Très bien. Qu\'est-ce qui ne va pas avec l\'appareil ?',
          'Je suis désolé, mais je ne peux pas vous rembourser. Je peux vous proposer un échange ou un bon d\'achat.',
          'Un bon d\'achat de quarante-cinq euros, ou un autre grille-pain du même prix. Qu\'est-ce que vous préférez ?',
          'Très bien. Je vous fais le bon tout de suite. Bonne journée !',
        ],
        checklist: [
          'Explains the problem clearly with the purchase details',
          'Asks for a refund and does not accept the first answer straight away',
          'Chooses between the exchange and the voucher',
          'Closes politely',
        ],
        usefulPhrases: ['J\'ai acheté ça il y a dix jours', 'Il ne marche plus', 'Je voudrais un remboursement', 'Est-ce que je peux parler au responsable ?', 'Ce n\'est pas normal', 'Je préfère…'],
        modelAnswer:
          'Bonjour ! J\'ai acheté ce grille-pain dans votre magasin il y a dix jours. Il ne marche plus, il ne chauffe pas du tout. Voici mon ticket de caisse. ' +
          'Je voudrais un remboursement, s\'il vous plaît. Ah bon ? Mais c\'est un appareil défectueux, ce n\'est pas normal ! Est-ce que je peux parler au responsable, s\'il vous plaît ? ' +
          'D\'accord, alors je préfère le bon d\'achat de quarante-cinq euros. Merci beaucoup, bonne journée, au revoir !',
      },
    ],
  },
];
