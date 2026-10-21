import type { SpeakingTask } from '../../../types/exam';

// DELF B1 production orale: about 11 minutes of speaking, with 10 minutes'
// preparation for part 3. Part 1 is an interview about the candidate's work,
// studies and free time. Part 2 is a role-play in which the examiner plays a
// character who resists or raises objections. Part 3 is an expression d'un
// point de vue: the candidate reads a short press text, then presents and
// defends an opinion alone, with no questions from the examiner.

export const B1_SPEAKING: SpeakingTask[] = [
  {
    id: 'b1-oral-teletravail',
    level: 'b1',
    title: 'Mon travail, le télétravail, la voiture en ville',
    parts: [
      {
        kind: 'entretien',
        title: 'Entretien dirigé',
        consigne:
          'Vous répondez aux questions de l\'examinateur sur votre travail ou vos études, votre vie de tous les jours et vos projets. Donnez des explications et des exemples.',
        instructionsEn:
          'Answer the examiner\'s open questions about your work or studies, your daily routine and your plans. Give reasons and examples.',
        prepMinutes: 0,
        speakMinutes: 2.5,
        examinerLines: [
          'Bonjour ! Pouvez-vous me présenter votre travail, ou celui que vous aimeriez faire ?',
          'Comment se passe une journée type pour vous ?',
          'Pourquoi avez-vous choisi ce métier ?',
          'Quels sont, selon vous, les avantages et les inconvénients de votre travail ?',
          'Comment vous rendez-vous au travail, et combien de temps cela vous prend-il ?',
          'Qu\'est-ce que vous aimeriez faire dans les cinq prochaines années ?',
        ],
        checklist: [
          'Answers with full sentences, giving reasons and examples',
          'Uses the present, the past (passé composé, imparfait) and the future accurately',
          'Talks about work or studies, daily routine and plans',
          'Keeps going when a question is unexpected instead of stopping',
        ],
        usefulPhrases: [
          'Je travaille comme…',
          'Une journée type, c\'est…',
          'Ce qui me plaît, c\'est…',
          'En revanche, le problème, c\'est…',
          'Ça me prend environ vingt-cinq minutes.',
          'Dans cinq ans, j\'aimerais…',
        ],
        modelAnswer:
          'Je travaille comme graphiste dans une petite agence à Nantes depuis trois ans. Avant, j\'ai fait des études de design à Rennes, et ça m\'a beaucoup appris. ' +
          'Quand j\'étais au lycée, je voulais être architecte, mais j\'ai finalement préféré les images et les couleurs. ' +
          'Une journée type commence vers neuf heures : je regarde mes messages, puis je travaille sur les projets des clients. ' +
          'Ce qui me plaît, c\'est la créativité et l\'ambiance de l\'équipe. En revanche, il y a beaucoup de réunions, et j\'ai parfois du mal à finir mes dessins. ' +
          'Pour aller au bureau, je prends mon vélo, ça me prend environ vingt-cinq minutes. ' +
          'Le week-end, je dessine pour le plaisir, ce qui me permet de me détendre. ' +
          'Dans cinq ans, j\'aimerais diriger mon propre studio, parce que je voudrais choisir mes projets.',
      },
      {
        kind: 'interaction',
        title: 'Exercice en interaction',
        consigne:
          'Vous êtes employé(e) dans une entreprise. Vous voulez demander à votre responsable l\'autorisation de faire du télétravail. L\'examinateur joue le rôle du responsable. Présentez votre demande, répondez à ses objections et trouvez un accord.',
        instructionsEn:
          'You are an employee who wants to ask your manager (the examiner) for permission to work from home. Make your request, answer the objections and reach an agreement.',
        document:
          'Situation : vous travaillez depuis deux ans comme assistant(e) marketing dans une entreprise de Bordeaux. · ' +
          'Vous : vous voulez faire du télétravail deux jours par semaine, pour réduire vos trajets et être plus concentré(e). · ' +
          'L\'examinateur joue votre responsable, Madame Girard, qui s\'inquiète pour la cohésion de l\'équipe. · ' +
          'Votre objectif : la convaincre et trouver un compromis.',
        prepMinutes: 0,
        speakMinutes: 3.5,
        examinerLines: [
          'Bonjour ! Vous vouliez me parler de quelque chose d\'important ?',
          'Le télétravail, ça me pose un problème. Notre équipe a besoin de se voir pour avancer vite.',
          'Deux jours par semaine, c\'est beaucoup. Qui va répondre au téléphone des clients quand vous serez chez vous ?',
          'Je comprends votre argument, mais si j\'accepte pour vous, les autres vont demander la même chose.',
          'Bon, je veux bien essayer un jour par semaine. Mais à une condition : vous serez présent(e) à toutes les réunions du matin.',
        ],
        checklist: [
          'Presents the request clearly at the start',
          'Gives concrete arguments (travel time, concentration, results)',
          'Answers each objection instead of repeating the same request',
          'Proposes or accepts a compromise and sets conditions politely',
        ],
        usefulPhrases: [
          'Je voudrais vous proposer…',
          'Je comprends votre inquiétude, mais…',
          'Si je travaille de chez moi, je pourrais…',
          'Je serais disponible pour…',
          'D\'accord, à condition que…',
          'Et si on essayait pendant trois mois ?',
        ],
        modelAnswer:
          'Merci de me recevoir. Je voudrais vous proposer de faire du télétravail un ou deux jours par semaine. ' +
          'Je comprends votre inquiétude pour l\'équipe, mais je pense que je serais plus concentré(e) à la maison, surtout pour les rapports qui demandent beaucoup d\'écriture. ' +
          'Le mois dernier, j\'ai perdu presque deux heures par jour dans les transports, et j\'ai moins avancé que prévu. ' +
          'Pour les clients, je resterais joignable par téléphone et par messagerie toute la journée. ' +
          'Et je serais présent(e) au bureau tous les mercredis, comme ça je pourrais répondre aux appels de l\'équipe. ' +
          'Pour les réunions du matin, je ferais en sorte d\'être toujours disponible. ' +
          'Et si on essayait pendant trois mois ? Si ça ne fonctionne pas, nous reviendrons à l\'organisation actuelle. Qu\'en pensez-vous ?',
      },
      {
        kind: 'point-de-vue',
        title: 'Expression d\'un point de vue',
        consigne:
          'Vous lisez l\'article ci-dessous et vous disposez de dix minutes pour le préparer. Dites quel est le problème soulevé par cet article, puis présentez votre opinion, avec des arguments et des exemples. Vous parlez pendant environ cinq minutes.',
        instructionsEn:
          'Read the article during the 10 minutes of preparation. Say what issue the article raises, then give your own opinion with arguments and examples, for about 5 minutes. The examiner does not speak in this part.',
        document:
          'Centre-ville sans voiture : une bonne idée ?\n\n' +
          'Dans une ville moyenne du sud-ouest, la municipalité a décidé de fermer au trafic les rues du centre, sauf pour les bus, les livraisons et les véhicules des riverains. ' +
          'Le projet a provoqué un vif débat. Ses partisans rappellent que l\'air y est devenu plus respirable et que les rues sont plus calmes. ' +
          'Ils soulignent aussi que la plupart des trajets en voiture ne dépassent pas trois kilomètres, une distance facile à faire à pied ou à vélo. ' +
          'À l\'inverse, les commerçants craignent une baisse de leur clientèle, et certaines personnes âgées ou handicapées se plaignent de ne plus pouvoir se garer près de chez elles. ' +
          'Pour les opposants, la solution serait plutôt de développer les transports en commun et de créer des parkings relais en périphérie. ' +
          'Reste à savoir si la ville saura convaincre ses habitants de laisser leur voiture au garage.',
        prepMinutes: 10,
        speakMinutes: 5,
        examinerLines: [],
        checklist: [
          'Identifies the issue raised by the article',
          'Gives a clear opinion from the start',
          'Supports the opinion with at least two arguments',
          'Backs up the arguments with examples',
          'Uses connectors such as d\'abord, en revanche and enfin',
        ],
        usefulPhrases: [
          'Le problème soulevé par l\'article, c\'est…',
          'À mon avis, …',
          'D\'un côté…, de l\'autre…',
          'En revanche, …',
          'Par exemple, …',
          'Je suis d\'accord avec l\'auteur, car…',
        ],
        modelAnswer:
          'L\'article pose la question de la place de la voiture dans le centre-ville. Selon moi, fermer les rues à la circulation est une bonne idée, mais il faut la mettre en place avec soin. ' +
          'D\'abord, l\'air serait plus propre et le bruit diminuerait, ce qui est important pour la santé. ' +
          'Ensuite, les gens ont plus envie de se promener quand il n\'y a pas de voitures : dans certaines villes, les terrasses de café sont devenues beaucoup plus agréables. ' +
          'En revanche, je comprends les commerçants et les personnes âgées. C\'est pourquoi je pense qu\'il faut d\'abord développer les transports en commun. ' +
          'Un bus toutes les dix minutes depuis la périphérie permettrait à beaucoup de gens de renoncer à leur voiture. ' +
          'En conclusion, je suis favorable à un centre-ville sans voiture, à condition que la ville offre de vraies solutions de remplacement.',
      },
    ],
  },
  {
    id: 'b1-oral-cantine-vegetarienne',
    level: 'b1',
    title: 'Mes études, la cantine, le téléphone à l\'école',
    parts: [
      {
        kind: 'entretien',
        title: 'Entretien dirigé',
        consigne:
          'Vous répondez aux questions de l\'examinateur sur vos études, votre formation et vos habitudes au quotidien. Expliquez vos choix et donnez des exemples.',
        instructionsEn:
          'Answer the examiner\'s questions about your studies, your training and your everyday habits. Explain your choices and give examples.',
        prepMinutes: 0,
        speakMinutes: 2.5,
        examinerLines: [
          'Bonjour ! Qu\'est-ce que vous étudiez en ce moment ?',
          'Pourquoi avez-vous choisi cette formation, et pas une autre ?',
          'Comment se passe une journée d\'études type ? Où mangez-vous à midi ?',
          'Quelle matière, selon vous, est la plus utile dans la vie de tous les jours ?',
          'Si vous pouviez changer une chose dans votre école ou votre université, ce serait laquelle ?',
        ],
        checklist: [
          'Answers each question in full sentences, with reasons',
          'Describes routines in the present and past (imparfait for habits)',
          'Gives opinions about school or university life',
          'Keeps a natural flow and uses linking words',
        ],
        usefulPhrases: [
          'Je suis en deuxième année de…',
          'J\'ai choisi cette formation parce que…',
          'D\'habitude, je…',
          'Quand j\'étais au lycée, je…',
          'Ce qui me gêne, c\'est…',
          'Si je pouvais changer une chose, ce serait…',
        ],
        modelAnswer:
          'Je suis en deuxième année de licence de biologie à Montpellier. J\'ai choisi cette formation parce que j\'ai toujours voulu comprendre le fonctionnement du corps humain. ' +
          'Quand j\'étais au lycée, je passais mes soirées à lire des articles sur la nutrition, donc c\'était une évidence. ' +
          'D\'habitude, je travaille à la bibliothèque toute la journée, et je mange à la cafétéria à midi. ' +
          'C\'est pratique, mais ce qui me gêne, c\'est que les repas sont chers et qu\'il y a très peu de plats végétariens. ' +
          'Selon moi, la matière la plus utile, c\'est la chimie, parce qu\'on l\'utilise pour comprendre ce qu\'on mange. ' +
          'Si je pouvais changer une chose, ce serait la cantine : je voudrais qu\'il y ait un menu végétarien chaque jour, car beaucoup d\'étudiants ne mangent pas de viande.',
      },
      {
        kind: 'interaction',
        title: 'Exercice en interaction',
        consigne:
          'Vous êtes délégué(e) des élèves dans un lycée. Vous rencontrez le responsable de la cantine pour lui demander des repas végétariens. L\'examinateur joue le rôle du responsable. Présentez votre demande, répondez à ses objections et proposez une solution.',
        instructionsEn:
          'You are the student representative at a secondary school. You meet the canteen manager (the examiner) to ask for vegetarian meals. Make your request, answer the objections and propose a solution.',
        document:
          'Situation : vous êtes délégué(e) des élèves dans un lycée de Lille. · ' +
          'Vous : beaucoup d\'élèves ne mangent pas de viande, et ils se plaignent du menu chaque semaine. Vous avez rendez-vous avec le responsable de la cantine. · ' +
          'L\'examinateur joue Monsieur Roux, le responsable de la cantine, fatigué par les problèmes de budget et de gaspillage. · ' +
          'Votre objectif : obtenir au moins deux repas végétariens par semaine, en tenant compte du budget.',
        prepMinutes: 0,
        speakMinutes: 3.5,
        examinerLines: [
          'Bonjour, asseyez-vous. Vous voulez me parler de la cantine, je crois ?',
          'Un repas végétarien tous les jours ? Ce n\'est pas possible. Le budget de la cantine est très serré.',
          'Et les élèves qui mangent de la viande, qu\'est-ce qu\'ils auront dans leur assiette ? On ne peut pas préparer deux menus complets.',
          'Les végétariens sont peu nombreux dans le lycée, non ? Je ne veux pas gaspiller de la nourriture.',
          'Bon, on peut peut-être essayer deux fois par semaine. Mais il faudra que les élèves s\'inscrivent à l\'avance.',
        ],
        checklist: [
          'Explains the request and why it matters to students',
          'Answers the objections about cost, waste and choice',
          'Makes a concrete proposal, for example two days a week',
          'Accepts or negotiates the condition politely',
        ],
        usefulPhrases: [
          'Je voudrais vous proposer…',
          'Je comprends le problème du budget, mais…',
          'Beaucoup d\'élèves ne mangent pas de viande, et…',
          'Et si on proposait un menu végétarien deux fois par semaine ?',
          'D\'accord, à condition que…',
          'On pourrait aussi…',
        ],
        modelAnswer:
          'Bonjour monsieur Roux, merci de me recevoir. Je voudrais vous proposer un repas végétarien par semaine, puis deux si cela fonctionne. ' +
          'Je comprends le problème du budget, mais beaucoup d\'élèves ne mangent pas de viande, et ils se plaignent souvent du menu. ' +
          'Le mois dernier, j\'ai fait un petit sondage : une quarantaine d\'élèves ont dit qu\'ils mangeraient plus à la cantine s\'il y avait un plat végétarien. ' +
          'Pour le gaspillage, on pourrait demander l\'avis des élèves et préparer seulement les quantités commandées. ' +
          'Quant aux inscriptions, ce n\'est pas un problème : nous pouvons faire un tableau dans la salle de classe. ' +
          'Et si on essayait deux fois par semaine, pendant un trimestre ? On pourrait ensuite faire le bilan ensemble. Qu\'en pensez-vous ?',
      },
      {
        kind: 'point-de-vue',
        title: 'Expression d\'un point de vue',
        consigne:
          'Vous lisez l\'article ci-dessous et vous disposez de dix minutes pour le préparer. Dites quel est le problème soulevé par cet article, puis présentez votre opinion, avec des arguments et des exemples. Vous parlez pendant environ cinq minutes.',
        instructionsEn:
          'Read the article during the 10 minutes of preparation. Say what issue the article raises, then give your own opinion with arguments and examples, for about 5 minutes. The examiner does not speak in this part.',
        document:
          'Faut-il interdire le téléphone portable à l\'école ?\n\n' +
          'Depuis la rentrée, plusieurs établissements interdisent les téléphones portables dans l\'enceinte de l\'école, du matin jusqu\'à la sortie des cours. ' +
          'Les directeurs qui ont pris cette décision expliquent que les élèves étaient distraits pendant les leçons et que les conflits entre camarades se multipliaient sur les réseaux sociaux. ' +
          'Les enseignants, eux, constatent que les élèves se concentrent davantage et qu\'ils discutent plus entre eux pendant les récréations. ' +
          'Pourtant, certains parents s\'inquiètent : sans téléphone, comment être joint en cas d\'urgence ? ' +
          'D\'autres font valoir qu\'il vaut mieux apprendre à utiliser ces outils de manière raisonnable que de les interdire. ' +
          'La question ne se résume donc pas à une simple règle. Elle touche à l\'éducation, à la responsabilité des familles et à la place de la technologie dans la vie des jeunes.',
        prepMinutes: 10,
        speakMinutes: 5,
        examinerLines: [],
        checklist: [
          'Identifies the issue raised by the article',
          'Gives a clear opinion from the start',
          'Supports the opinion with at least two arguments',
          'Backs up the arguments with examples',
          'Uses connectors such as d\'abord, ensuite and cela dit',
        ],
        usefulPhrases: [
          'Le problème soulevé par l\'article, c\'est…',
          'À mon avis, …',
          'D\'abord, …',
          'Cela dit, …',
          'Par exemple, …',
          'C\'est pourquoi je pense que…',
        ],
        modelAnswer:
          'L\'article pose la question de l\'interdiction du téléphone portable dans les écoles. À mon avis, cette interdiction est nécessaire, mais elle doit être accompagnée d\'une vraie éducation au numérique. ' +
          'D\'abord, les élèves sont souvent distraits pendant les cours : quand un téléphone vibre sur la table, on ne se concentre plus. ' +
          'Par exemple, dans mon ancien collège, les notes baissaient pendant les semaines où les réseaux sociaux étaient très utilisés. ' +
          'Ensuite, les conflits commencent souvent à la récréation, mais ils continuent sur les écrans, et la règle permet de calmer les choses. ' +
          'Cela dit, je comprends l\'inquiétude des parents. C\'est pourquoi je pense que l\'école devrait garder un moyen de contact en cas d\'urgence, par exemple le téléphone de la vie scolaire. ' +
          'En conclusion, l\'interdiction ne suffit pas à elle seule, mais elle donne un cadre clair aux élèves.',
      },
    ],
  },
  {
    id: 'b1-oral-benevolat',
    level: 'b1',
    title: 'Mes loisirs, mon voisin, le bénévolat',
    parts: [
      {
        kind: 'entretien',
        title: 'Entretien dirigé',
        consigne:
          'Vous répondez aux questions de l\'examinateur sur vos loisirs, vos voyages et vos envies. Expliquez, racontez et donnez des exemples.',
        instructionsEn:
          'Answer the examiner\'s questions about your free time, your travels and what you would like to do. Explain, tell short stories and give examples.',
        prepMinutes: 0,
        speakMinutes: 2.5,
        examinerLines: [
          'Qu\'est-ce que vous faites pendant votre temps libre ?',
          'Depuis combien de temps pratiquez-vous cette activité ?',
          'Vous êtes déjà parti(e) à l\'étranger ? Racontez-moi votre meilleur souvenir de voyage.',
          'Qu\'est-ce qui vous a le plus surpris pendant ce séjour ?',
          'Qu\'est-ce qui pourrait vous motiver à vous engager dans une association, pour aider les autres ?',
        ],
        checklist: [
          'Answers with full sentences and extra details',
          'Tells a story in the past (passé composé and imparfait)',
          'Expresses preferences and plans (aimer, préférer, vouloir + infinitive)',
          'Responds naturally to follow-up questions',
        ],
        usefulPhrases: [
          'Pendant mon temps libre, je…',
          'Je pratique… depuis…',
          'Le meilleur souvenir, c\'est quand…',
          'Ce qui m\'a surpris, c\'est…',
          'Je pourrais m\'engager si…',
          'J\'ai toujours eu envie de…',
        ],
        modelAnswer:
          'Pendant mon temps libre, je fais beaucoup de sport : je joue au basket depuis que j\'ai dix ans, et je fais aussi du yoga le matin. J\'aime aussi lire des romans policiers. ' +
          'L\'année dernière, je suis parti en Écosse pendant trois semaines pour améliorer mon anglais. ' +
          'Le meilleur souvenir, c\'est une randonnée dans les montagnes, où nous avons dormi dans une cabane. ' +
          'Ce qui m\'a surpris, c\'est la gentillesse des habitants : quand nous nous sommes perdus, une femme nous a invités à prendre le thé. ' +
          'Pour l\'association, je n\'ai jamais eu le temps, mais j\'ai toujours eu envie d\'aider les autres. Je pense que cela m\'apporterait beaucoup de rencontres. ' +
          'Je pourrais m\'engager si l\'activité était proche de chez moi et si je pouvais l\'organiser le week-end.',
      },
      {
        kind: 'interaction',
        title: 'Exercice en interaction',
        consigne:
          'Vous habitez dans un immeuble. Le voisin du dessus fait trop de bruit le soir. Vous allez le voir pour lui en parler. L\'examinateur joue le rôle du voisin. Expliquez le problème, répondez à ses réactions et trouvez un accord.',
        instructionsEn:
          'Your upstairs neighbour (the examiner) makes too much noise in the evenings. Go and talk to him. Explain the problem, answer his reactions and reach an agreement.',
        document:
          'Situation : vous habitez un petit appartement au deuxième étage d\'un immeuble. · ' +
          'Vous : depuis un mois, le voisin du dessus écoute de la musique très fort le soir, et vous avez du mal à dormir. Vous allez frapper à sa porte. · ' +
          'L\'examinateur joue Monsieur Dubois, un voisin poli qui se sent un peu accusé. · ' +
          'Votre objectif : obtenir qu\'il baisse le son après vingt-deux heures et trouver un accord.',
        prepMinutes: 0,
        speakMinutes: 3.5,
        examinerLines: [
          'Bonjour ! Vous habitez à l\'étage en dessous, non ? Qu\'est-ce qui se passe ?',
          'Du bruit ? Je ne vois pas du tout de quoi vous parlez. J\'écoute la musique à un volume tout à fait normal.',
          'Vous savez, dans un immeuble, il faut être un peu tolérant. Les enfants jouent, les gens reçoivent des amis, c\'est la vie.',
          'Bon, je mets peut-être un peu fort le soir, je l\'admets. Mais vous pourriez aussi me dire le bruit que fait votre télé, non ?',
          'D\'accord, je veux bien baisser le son après vingt-deux heures. Mais je ne vais pas arrêter de jouer, c\'est important pour moi.',
        ],
        checklist: [
          'Explains the problem calmly, without aggression',
          'Gives concrete facts (when, how often, how loud)',
          'Answers the neighbour\'s objections and his counter-accusation',
          'Proposes a fair compromise and ends the conversation politely',
        ],
        usefulPhrases: [
          'Je voudrais vous parler du bruit…',
          'Le problème, c\'est surtout le soir, après…',
          'Je ne veux pas me plaindre, mais…',
          'Pourriez-vous baisser le son après vingt-deux heures ?',
          'Est-ce qu\'on pourrait trouver un accord ?',
          'D\'accord, merci de votre compréhension.',
        ],
        modelAnswer:
          'Bonjour monsieur Dubois, je suis votre voisin du deuxième étage. Je ne veux pas me plaindre, mais depuis un mois, j\'entends la musique très fort le soir, et j\'ai du mal à dormir. ' +
          'Le problème, c\'est surtout après vingt-deux heures, car je me lève tôt pour aller au travail. ' +
          'Je ne suis pas venu(e) pour me fâcher, je voudrais simplement qu\'on trouve une solution ensemble. ' +
          'Je comprends que vous aimiez la musique, et je ne vous demande pas de faire le silence. Je vous demande simplement de baisser le son après vingt-deux heures. ' +
          'Si ma télé vous gêne aussi, je peux la mettre moins fort. ' +
          'Est-ce qu\'on pourrait trouver un accord ? Par exemple, vous pourriez jouer jusqu\'à vingt et une heures, et ensuite avec un casque. Qu\'en pensez-vous ?',
      },
      {
        kind: 'point-de-vue',
        title: 'Expression d\'un point de vue',
        consigne:
          'Vous lisez l\'article ci-dessous et vous disposez de dix minutes pour le préparer. Dites quel est le problème soulevé par cet article, puis présentez votre opinion, avec des arguments et des exemples. Vous parlez pendant environ cinq minutes.',
        instructionsEn:
          'Read the article during the 10 minutes of preparation. Say what issue the article raises, then give your own opinion with arguments and examples, for about 5 minutes. The examiner does not speak in this part.',
        document:
          'Faut-il rendre le bénévolat obligatoire pour les jeunes ?\n\n' +
          'Dans un rapport publié cette année, une commission propose que chaque lycéen effectue quelques dizaines d\'heures de bénévolat avant le baccalauréat, dans une association, un hôpital ou une maison de retraite. ' +
          'Les auteurs du texte estiment que cette expérience permettrait aux jeunes de découvrir la solidarité et de mieux connaître la vie de leur quartier. ' +
          'Ils avancent aussi que le bénévolat développe des compétences sociales, comme le travail en équipe ou la prise de parole. ' +
          'Certains responsables d\'associations approuvent l\'idée, mais beaucoup s\'inquiètent : un bénévole qui ne veut pas être là ne rend pas service, disent-ils. ' +
          'D\'autres pensent que la liberté de choisir son engagement doit rester essentielle. Ces derniers rappellent que l\'engagement volontaire existe déjà et rassemble chaque année des milliers de jeunes. ' +
          'Entre l\'envie d\'aider et la contrainte, la frontière est parfois fragile.',
        prepMinutes: 10,
        speakMinutes: 5,
        examinerLines: [],
        checklist: [
          'Identifies the issue raised by the text',
          'Gives a clear opinion and sticks to it',
          'Supports the opinion with at least two arguments',
          'Gives concrete examples from school, friends or the community',
        ],
        usefulPhrases: [
          'Le texte pose la question de…',
          'Selon moi, …',
          'Certes, … mais…',
          'D\'un côté…, de l\'autre…',
          'Par exemple, …',
          'En conclusion, je pense que…',
        ],
        modelAnswer:
          'Le texte pose la question de l\'obligation du bénévolat pour les lycéens. Selon moi, je ne suis pas favorable à une obligation, mais l\'idée de départ est bonne. ' +
          'D\'abord, le bénévolat permet de découvrir des gens et des métiers qu\'on ne connaît pas. Quand j\'étais au lycée, j\'ai aidé une association qui distribuait des repas, et j\'ai compris que la pauvreté existait près de chez nous. ' +
          'Ensuite, cela développe des compétences utiles, comme le travail en équipe. ' +
          'Cependant, une obligation risque de produire l\'effet inverse : des jeunes qui font leurs heures sans conviction, et des associations qui n\'ont pas le temps de les encadrer. ' +
          'C\'est pourquoi je préférerais une incitation, par exemple une reconnaissance dans le dossier scolaire. ' +
          'En conclusion, l\'engagement doit venir de l\'envie, pas de la contrainte.',
      },
    ],
  },
];
