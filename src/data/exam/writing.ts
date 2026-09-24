import type { WritingTask } from '../../types/exam';

// Original writing prompts in the DELF tout public formats. Word minimums and
// suggested times follow the current papers: A1 exercise 2 (40 words), A2
// exercises 1–2 (60 words each, 45 minutes for both), B1 (160 words, 45
// minutes), B2 (250 words, 1 hour). Model answers are sound, at-level texts —
// one good way to do the task, not the only one.

export const WRITING_TASKS: WritingTask[] = [
  // ─── A1 ───────────────────────────────────────────────────────────────────
  {
    id: 'a1-invitation-diner',
    level: 'a1',
    title: 'Inviter un ami à dîner',
    genre: 'Message',
    consigne:
      'Vous invitez votre ami Paul à dîner chez vous. Vous lui écrivez un message. ' +
      'Vous donnez le jour, l\'heure et votre adresse. Vous dites ce que vous allez manger et vous lui demandez d\'apporter quelque chose. (40 mots minimum)',
    instructionsEn:
      'Invite your friend Paul to dinner. Give the day, time and your address, say what you will eat, and ask him to bring something.',
    minWords: 40,
    timeMinutes: 20,
    checklist: [
      'Greet Paul and sign off',
      'Give the day and the time',
      'Give your address',
      'Say what you will eat',
      'Ask him to bring something',
    ],
    usefulPhrases: ['Tu es libre… ?', 'Je t\'invite à dîner', 'J\'habite…', 'On va manger…', 'Tu peux apporter… ?', 'À bientôt !'],
    modelAnswer:
      'Salut Paul,\n\n' +
      'Tu es libre vendredi soir ? Je t\'invite à dîner chez moi à 20 heures. J\'habite 8, rue de la Gare, au premier étage. ' +
      'Je vais faire une quiche et une salade, et il y a un gâteau au chocolat pour le dessert. ' +
      'Tu peux apporter du pain, s\'il te plaît ?\n\n' +
      'À vendredi !\nEmma',
  },
  {
    id: 'a1-carte-vacances',
    level: 'a1',
    title: 'Une carte postale de vacances',
    genre: 'Carte postale',
    consigne:
      'Vous êtes en vacances. Vous écrivez une carte postale à une amie française. ' +
      'Vous dites où vous êtes, quel temps il fait, ce que vous faites et ce que vous aimez. (40 mots minimum)',
    instructionsEn:
      'You are on holiday. Write a postcard to a French friend: where you are, the weather, what you do, and what you like.',
    minWords: 40,
    timeMinutes: 20,
    checklist: ['Greet your friend and sign off', 'Say where you are', 'Describe the weather', 'Say what you do', 'Say what you like'],
    usefulPhrases: ['Je suis à…', 'Il fait beau / chaud', 'Le matin, je…', 'J\'aime beaucoup…', 'Grosses bises'],
    modelAnswer:
      'Chère Camille,\n\n' +
      'Je suis à Nice avec ma sœur pour une semaine. Il fait très beau et chaud : 28 degrés ! ' +
      'Le matin, nous visitons la vieille ville et l\'après-midi, nous allons à la plage. ' +
      'J\'aime beaucoup la mer et les glaces à la fraise. Le soir, on mange au restaurant.\n\n' +
      'Grosses bises,\nSofia',
  },
  {
    id: 'a1-nouveaux-voisins',
    level: 'a1',
    title: 'Se présenter aux voisins',
    genre: 'Message',
    consigne:
      'Vous venez d\'arriver dans un nouvel immeuble. Vous écrivez un message pour vos voisins. ' +
      'Vous vous présentez (nom, âge, profession, famille) et vous les invitez à prendre un café chez vous. (40 mots minimum)',
    instructionsEn:
      'You have just moved into a new building. Write a note to your neighbours: introduce yourself (name, age, job, family) and invite them for coffee.',
    minWords: 40,
    timeMinutes: 20,
    checklist: [
      'Use a greeting suited to neighbours (vous)',
      'Give your name and age',
      'Say what you do for work',
      'Mention your family',
      'Invite them for coffee with a day and time',
    ],
    usefulPhrases: ['Bonjour à tous', 'Je m\'appelle…', 'J\'ai … ans', 'Je suis…', 'Je vous invite à…', 'Appartement n°…'],
    modelAnswer:
      'Bonjour à tous,\n\n' +
      'Je m\'appelle Lucas Martin, j\'ai 32 ans et je suis infirmier à l\'hôpital. ' +
      'J\'habite au troisième étage, appartement 12, avec ma femme Ana et notre fils Léo, qui a quatre ans. ' +
      'Nous vous invitons à prendre un café chez nous samedi à 16 heures.\n\n' +
      'À bientôt !\nLucas',
  },

  // ─── A2 ───────────────────────────────────────────────────────────────────
  {
    id: 'a2-festival',
    level: 'a2',
    title: 'Raconter un week-end au festival',
    genre: 'Courriel',
    consigne:
      'Le week-end dernier, vous êtes allé(e) à un festival de musique. Vous écrivez un courriel à un ami pour lui raconter ' +
      'votre week-end : ce que vous avez fait, qui vous avez rencontré, et ce que vous avez aimé ou non. (60 mots minimum)',
    instructionsEn:
      'Last weekend you went to a music festival. Email a friend about it: what you did, who you met, what you liked or disliked.',
    minWords: 60,
    timeMinutes: 25,
    checklist: [
      'Greeting and sign-off suited to a friend (tu)',
      'Say what you did, in the passé composé',
      'Mention who you met',
      'Give your impressions: what you liked and did not like',
    ],
    usefulPhrases: ['Le week-end dernier, je suis allé(e)…', 'J\'ai rencontré…', 'C\'était génial / un peu long', 'Par contre…', 'Et toi, ça va ?'],
    modelAnswer:
      'Salut Nora,\n\n' +
      'Le week-end dernier, je suis allée au festival de jazz de Vienne avec mon frère. Samedi soir, nous avons écouté ' +
      'un concert magnifique dans le théâtre antique. Dimanche, j\'ai rencontré deux musiciens italiens très sympas et ' +
      'nous avons dîné ensemble. C\'était vraiment une belle expérience ! Par contre, il y avait beaucoup de monde et ' +
      'les boissons étaient très chères. L\'année prochaine, tu viens avec nous ?\n\n' +
      'Bises,\nMarie',
  },
  {
    id: 'a2-refuser-randonnee',
    level: 'a2',
    title: 'Répondre à une invitation',
    genre: 'Courriel',
    consigne:
      'Votre amie Chloé vous écrit : « Salut ! On fait une randonnée en montagne dimanche avec des amis. Tu viens avec nous ? » ' +
      'Vous répondez à Chloé. Vous la remerciez, vous refusez son invitation et vous expliquez pourquoi. ' +
      'Vous proposez une autre activité ensemble un autre jour. (60 mots minimum)',
    instructionsEn:
      'Your friend invites you on a hike on Sunday. Thank her, decline, explain why, and suggest another activity on another day.',
    minWords: 60,
    timeMinutes: 20,
    checklist: [
      'Thank Chloé for the invitation',
      'Decline clearly but politely',
      'Give a reason',
      'Suggest another activity, with a day',
      'Friendly greeting and sign-off',
    ],
    usefulPhrases: ['Merci pour ton invitation', 'Malheureusement, je ne peux pas…', 'parce que…', 'Est-ce que tu veux… ?', 'On pourrait…'],
    modelAnswer:
      'Salut Chloé,\n\n' +
      'Merci beaucoup pour ton invitation, c\'est très gentil ! Malheureusement, je ne peux pas venir dimanche, ' +
      'parce que mes parents arrivent de Lyon pour le week-end et je dois aller les chercher à la gare. ' +
      'Et puis, tu sais, je ne suis pas très sportive… Est-ce que tu veux aller au cinéma mercredi soir ? ' +
      'Il y a une nouvelle comédie française au cinéma du centre. On pourrait manger une pizza avant la séance.\n\n' +
      'Bonne randonnée et à bientôt !\nInès',
  },
  {
    id: 'a2-premier-jour',
    level: 'a2',
    title: 'Mon premier jour de travail',
    genre: 'Message sur un forum',
    consigne:
      'Sur un forum, des internautes racontent leur premier jour dans un nouveau travail. Vous écrivez un message pour ' +
      'raconter votre premier jour : où vous travaillez, ce qui s\'est passé et ce que vous avez ressenti. (60 mots minimum)',
    instructionsEn:
      'On a forum, people share their first day at a new job. Describe yours: where you work, what happened, and how you felt.',
    minWords: 60,
    timeMinutes: 25,
    checklist: [
      'Say where you work and what the job is',
      'Tell what happened, in the past',
      'Describe your feelings',
      'A tone that suits a forum (friendly, informal)',
    ],
    usefulPhrases: ['Il y a un mois, j\'ai commencé…', 'Quand je suis arrivé(e)…', 'J\'étais un peu stressé(e)', 'Heureusement…', 'Finalement…'],
    modelAnswer:
      'Bonjour à tous !\n\n' +
      'Il y a un mois, j\'ai commencé à travailler comme serveur dans un café du centre-ville. ' +
      'Le premier jour, j\'étais très stressé parce que je ne connaissais personne. Le matin, le patron m\'a présenté l\'équipe ' +
      'et une collègue m\'a expliqué comment utiliser la caisse. À midi, il y avait beaucoup de clients et j\'ai fait tomber un plateau ! ' +
      'Heureusement, tout le monde a rigolé. Le soir, j\'étais fatigué mais content.\n\n' +
      'Karim',
  },

  // ─── B1 ───────────────────────────────────────────────────────────────────
  {
    id: 'b1-telephones-ecole',
    level: 'b1',
    title: 'Les téléphones à l\'école',
    genre: 'Message sur un forum',
    consigne:
      'Sur le forum d\'un magazine, les lecteurs répondent à la question : « Faut-il interdire complètement les téléphones portables ' +
      'dans les écoles ? » Vous écrivez un message pour donner votre opinion. Vous l\'illustrez avec des exemples tirés de votre ' +
      'expérience. (160 mots minimum)',
    instructionsEn:
      'A magazine forum asks: should phones be banned completely in schools? Give your opinion with examples from your own experience.',
    minWords: 160,
    timeMinutes: 45,
    checklist: [
      'State a clear opinion early on',
      'Justify it with at least two arguments',
      'Illustrate with concrete personal examples',
      'Organise the text: introduction, development, conclusion',
      'Use connectors (d\'abord, ensuite, par exemple, cependant, en conclusion)',
    ],
    usefulPhrases: [
      'À mon avis, …',
      'Je suis plutôt favorable à…',
      'D\'une part… d\'autre part…',
      'Par exemple, quand j\'étais au lycée…',
      'Cependant, il faut reconnaître que…',
      'Pour conclure, …',
    ],
    modelAnswer:
      'Bonjour à tous,\n\n' +
      'Je suis professeure dans un collège depuis dix ans et, à mon avis, il ne faut pas interdire complètement les téléphones, ' +
      'mais il faut fixer des règles claires.\n\n' +
      'D\'abord, je comprends les parents qui veulent une interdiction. En classe, un téléphone qui vibre suffit à déconcentrer ' +
      'un élève, et pendant les récréations, beaucoup de jeunes ne se parlent plus : ils regardent leur écran. ' +
      'L\'année dernière, dans mon établissement, un élève a même été harcelé à cause de vidéos filmées dans la cour.\n\n' +
      'Cependant, le téléphone peut aussi être un outil utile. Par exemple, avec ma classe de quatrième, nous avons utilisé ' +
      'les téléphones pour enregistrer des interviews en anglais, et les élèves ont adoré. De plus, les parents se sentent ' +
      'rassurés quand leurs enfants peuvent les appeler après les cours.\n\n' +
      'Pour conclure, je propose une solution simple : les téléphones restent éteints dans les sacs, sauf quand le professeur ' +
      'décide de les utiliser pour un projet. Et vous, qu\'en pensez-vous ?\n\n' +
      'Hélène',
  },
  {
    id: 'b1-parc-parking',
    level: 'b1',
    title: 'Sauvons le parc !',
    genre: 'Lettre formelle',
    consigne:
      'Vous avez appris que la mairie de votre ville veut transformer le parc de votre quartier en parking. ' +
      'Vous écrivez au maire pour exprimer votre désaccord. Vous expliquez ce que le parc représente pour les habitants ' +
      'et vous proposez une autre solution. (160 mots minimum)',
    instructionsEn:
      'The town hall plans to turn your neighbourhood park into a car park. Write to the mayor: disagree, explain what the park means to residents, and propose an alternative.',
    minWords: 160,
    timeMinutes: 45,
    checklist: [
      'Formal letter conventions: Monsieur le Maire / Madame la Maire, vous, formal closing formula',
      'Say why you are writing',
      'Express disagreement with reasons',
      'Explain what the park brings to residents, with examples',
      'Propose an alternative solution',
    ],
    usefulPhrases: [
      'Monsieur le Maire,',
      'Je me permets de vous écrire au sujet de…',
      'Je suis profondément opposé(e) à…',
      'Ne serait-il pas possible de… ?',
      'Je vous prie d\'agréer, Monsieur le Maire, l\'expression de mes salutations distinguées.',
    ],
    modelAnswer:
      'Monsieur le Maire,\n\n' +
      'Habitante du quartier des Tilleuls depuis quinze ans, je me permets de vous écrire au sujet de votre projet de ' +
      'transformer le parc Jean-Moulin en parking. Je suis profondément opposée à cette décision.\n\n' +
      'Ce parc est le seul espace vert du quartier. Chaque jour, les enfants de l\'école voisine y jouent après la classe, ' +
      'les personnes âgées s\'y retrouvent sur les bancs et, le dimanche, de nombreuses familles y pique-niquent. ' +
      'En été, ses grands arbres nous protègent de la chaleur, ce qui est de plus en plus important. Le remplacer par du béton ' +
      'rendrait notre quartier moins agréable et moins sain.\n\n' +
      'Je comprends toutefois que le stationnement pose problème. Ne serait-il pas possible d\'ouvrir aux habitants, le soir ' +
      'et le week-end, le parking du supermarché, qui reste vide la plupart du temps ? On pourrait également améliorer ' +
      'la fréquence des bus vers le centre-ville.\n\n' +
      'Je vous remercie par avance de l\'attention que vous porterez à ma demande et vous prie d\'agréer, Monsieur le Maire, ' +
      'l\'expression de mes salutations distinguées.\n\n' +
      'Claire Dubois',
  },
  {
    id: 'b1-vivre-etranger',
    level: 'b1',
    title: 'Vivre à l\'étranger',
    genre: 'Article de blog',
    consigne:
      'Un blog pour les jeunes voyageurs cherche des témoignages. Vous racontez une expérience de vie ou de séjour à l\'étranger : ' +
      'ce qui a été difficile, ce qui vous a plu, et vous donnez votre avis : est-ce que tout le monde devrait vivre ' +
      'cette expérience ? (160 mots minimum)',
    instructionsEn:
      'A travel blog wants testimonies. Tell about living or staying abroad — what was hard, what you enjoyed — and say whether everyone should do it.',
    minWords: 160,
    timeMinutes: 45,
    checklist: [
      'Tell a personal experience with past tenses (passé composé / imparfait)',
      'Describe difficulties and positive moments',
      'Give and justify an opinion on the general question',
      'Engaging but clear structure for a blog',
    ],
    usefulPhrases: [
      'Il y a deux ans, je suis parti(e)…',
      'Au début, j\'avais du mal à…',
      'Ce qui m\'a le plus marqué(e), c\'est…',
      'Avec le recul, …',
      'Je conseillerais à tout le monde de…, à condition de…',
    ],
    modelAnswer:
      'Il y a deux ans, je suis partie six mois à Montréal pour un stage dans une agence de communication. ' +
      'Aujourd\'hui, je voudrais partager cette expérience avec vous.\n\n' +
      'Au début, tout me paraissait difficile. Je pensais que parler français suffirait, mais je ne comprenais pas ' +
      'la moitié des expressions de mes collègues ! L\'hiver a aussi été une épreuve : il faisait moins vingt degrés ' +
      'et la nuit tombait à 16 heures. Pendant les premières semaines, ma famille et mes amis me manquaient beaucoup.\n\n' +
      'Pourtant, petit à petit, j\'ai trouvé mes repères. Mes collègues m\'ont invitée à faire du ski, j\'ai découvert ' +
      'la cuisine québécoise et je me suis fait des amis du monde entier. Ce qui m\'a le plus marquée, c\'est la gentillesse ' +
      'des gens, toujours prêts à rendre service.\n\n' +
      'Avec le recul, je pense que tout le monde devrait vivre une expérience à l\'étranger, à condition de bien la préparer. ' +
      'On apprend à se débrouiller seul, à être plus tolérant et à voir son propre pays autrement. ' +
      'Alors, n\'hésitez pas : partez !\n\n' +
      'Julie',
  },

  // ─── B2 ───────────────────────────────────────────────────────────────────
  {
    id: 'b2-semaine-quatre-jours',
    level: 'b2',
    title: 'Pour la semaine de quatre jours',
    genre: 'Lettre formelle',
    consigne:
      'Votre entreprise envisage de tester la semaine de quatre jours, mais la direction hésite. En tant que représentant(e) ' +
      'du personnel, vous écrivez une lettre à la directrice générale pour la convaincre de lancer cette expérimentation. ' +
      'Vous présentez des arguments précis, vous répondez aux objections possibles et vous proposez des modalités concrètes. ' +
      '(250 mots minimum)',
    instructionsEn:
      'As staff representative, write to the CEO to persuade her to trial a four-day week: precise arguments, answer likely objections, propose concrete arrangements.',
    minWords: 250,
    timeMinutes: 60,
    checklist: [
      'Formal letter layout and register throughout (Madame la Directrice générale, formule de politesse)',
      'State the purpose of the letter clearly',
      'Develop several structured arguments with examples',
      'Anticipate and refute at least one objection',
      'Propose concrete terms for the trial',
      'Varied connectors and a conclusion that calls for action',
    ],
    usefulPhrases: [
      'Je me permets de vous solliciter au nom de…',
      'Tout d\'abord… En outre… Enfin…',
      'On pourrait objecter que… Or…',
      'Certes…, mais…',
      'C\'est pourquoi nous proposons que…',
      'Dans l\'attente de votre réponse, je vous prie d\'agréer…',
    ],
    modelAnswer:
      'Madame la Directrice générale,\n\n' +
      'Au nom des représentants du personnel, je me permets de vous écrire au sujet de la semaine de quatre jours, ' +
      'dont nous avons discuté lors du dernier comité. Nous sommes convaincus qu\'une expérimentation serait bénéfique ' +
      'à la fois pour les salariés et pour l\'entreprise.\n\n' +
      'Tout d\'abord, plusieurs entreprises européennes qui ont tenté l\'expérience ont constaté une baisse de l\'absentéisme ' +
      'et du stress, sans perte de productivité. Des salariés reposés sont plus concentrés, et les réunions inutiles ' +
      'disparaissent naturellement lorsque le temps devient plus précieux. En outre, notre secteur peine à recruter : ' +
      'proposer quatre jours de travail constituerait un argument décisif face à nos concurrents. Lors de nos derniers ' +
      'entretiens d\'embauche, plusieurs candidats nous ont d\'ailleurs demandé si nous envisagions une telle organisation.\n\n' +
      'On pourrait objecter que nos clients attendent une présence cinq jours sur cinq. Or, rien n\'oblige tous les ' +
      'salariés à s\'absenter le même jour : une organisation par roulement garantirait une permanence continue. ' +
      'Certes, certains postes, notamment à l\'accueil, demanderont des ajustements, mais ceux-ci peuvent être définis ' +
      'avec les équipes concernées.\n\n' +
      'C\'est pourquoi nous proposons de lancer un test de six mois dans deux services volontaires, à salaire constant, ' +
      'avec des indicateurs clairs : chiffre d\'affaires, satisfaction des clients et bien-être des salariés. ' +
      'Un bilan partagé, présenté à l\'ensemble du personnel, permettrait ensuite de décider, en toute transparence, ' +
      'de la suite à donner.\n\n' +
      'Nous restons à votre disposition pour vous présenter ce projet plus en détail. Dans l\'attente de votre réponse, ' +
      'je vous prie d\'agréer, Madame la Directrice générale, l\'expression de ma haute considération.\n\n' +
      'Antoine Mercier, représentant du personnel',
  },
  {
    id: 'b2-reseaux-democratie',
    level: 'b2',
    title: 'Les réseaux sociaux et la démocratie',
    genre: 'Article',
    consigne:
      'Le journal de votre université organise un concours d\'articles sur le thème : « Les réseaux sociaux : une menace ' +
      'ou une chance pour la démocratie ? » Vous rédigez un article argumenté dans lequel vous présentez votre point de vue ' +
      'de manière nuancée, en l\'illustrant par des exemples. (250 mots minimum)',
    instructionsEn:
      'Write an argued article for a student newspaper: are social networks a threat or an opportunity for democracy? Take a nuanced position with examples.',
    minWords: 250,
    timeMinutes: 60,
    checklist: [
      'A title and an introduction that sets out the question',
      'Arguments on both sides, with examples',
      'A clear, nuanced personal position',
      'Paragraphs with logical connectors',
      'A conclusion that answers the question (and may open it up)',
    ],
    usefulPhrases: [
      'Il est indéniable que…',
      'Cependant, force est de constater que…',
      'Loin de…, les réseaux…',
      'Il ne s\'agit pas de… mais de…',
      'En définitive, …',
    ],
    modelAnswer:
      'Réseaux sociaux : le meilleur et le pire de la démocratie\n\n' +
      'Aujourd\'hui, plus de la moitié des jeunes s\'informent d\'abord sur les réseaux sociaux. Ces plateformes, qui ' +
      'promettaient de donner la parole à tous, sont désormais accusées de fragiliser nos démocraties. Qu\'en est-il vraiment ?\n\n' +
      'Il est indéniable que les réseaux ont élargi l\'espace du débat public. Grâce à eux, des citoyens ordinaires peuvent ' +
      'alerter sur une injustice, organiser une manifestation ou interpeller directement un élu. Plusieurs mouvements ' +
      'de contestation, dans le monde entier, n\'auraient sans doute jamais pris une telle ampleur sans ces outils. ' +
      'Les réseaux permettent aussi à des médias indépendants, qui disposent de peu de moyens, de toucher un large public.\n\n' +
      'Cependant, force est de constater que ce même fonctionnement présente de sérieux dangers. Les algorithmes mettent ' +
      'en avant les contenus qui suscitent le plus de réactions, c\'est-à-dire souvent les plus choquants. ' +
      'Les fausses informations circulent ainsi plus vite que leurs démentis, et chacun finit par s\'enfermer ' +
      'dans une bulle où il ne rencontre que des opinions semblables aux siennes. Or, une démocratie repose précisément ' +
      'sur la confrontation d\'idées différentes.\n\n' +
      'À mon sens, les réseaux sociaux ne sont donc ni une menace ni une chance en eux-mêmes : tout dépend de l\'usage ' +
      'que nous en faisons et des règles que nous leur imposons. Il ne s\'agit pas de les interdire, mais d\'exiger ' +
      'davantage de transparence sur les algorithmes et d\'apprendre, dès l\'école, à vérifier une source. ' +
      'Les plateformes, elles, devraient rendre des comptes lorsqu\'elles laissent circuler des contenus manifestement faux.\n\n' +
      'En définitive, les réseaux amplifient ce qui existe déjà dans nos sociétés, le meilleur comme le pire. ' +
      'C\'est à nous, citoyens, de décider lequel des deux l\'emportera.',
  },
  {
    id: 'b2-surtourisme',
    level: 'b2',
    title: 'Trop de touristes ?',
    genre: 'Courrier des lecteurs',
    consigne:
      'Chaque été, votre ville reçoit un nombre croissant de touristes. Dans le journal local, un élu affirme que ' +
      '« le tourisme n\'apporte que des avantages ». Vous écrivez au courrier des lecteurs pour réagir : vous nuancez ' +
      'cette affirmation en présentant les effets positifs et négatifs du tourisme, et vous proposez des solutions. ' +
      '(250 mots minimum)',
    instructionsEn:
      'A local politician claims tourism brings only benefits. Write a letter to the newspaper that nuances this, covers pros and cons, and proposes solutions.',
    minWords: 250,
    timeMinutes: 60,
    checklist: [
      'React explicitly to the politician\'s statement',
      'Acknowledge the benefits of tourism',
      'Develop the drawbacks with concrete examples',
      'Propose realistic solutions',
      'Register suited to a newspaper letter (formal, courteous but firm)',
    ],
    usefulPhrases: [
      'C\'est avec étonnement que j\'ai lu…',
      'Loin de moi l\'idée de nier que…',
      'Il n\'en reste pas moins que…',
      'Ne pourrait-on pas envisager… ?',
      'Il est temps de…',
    ],
    modelAnswer:
      'Madame, Monsieur,\n\n' +
      'C\'est avec étonnement que j\'ai lu, dans votre édition du 3 juillet, les propos de M. Garnier selon lesquels ' +
      '« le tourisme n\'apporte que des avantages » à notre ville. En tant qu\'habitant du centre historique, je souhaiterais ' +
      'nuancer cette affirmation.\n\n' +
      'Loin de moi l\'idée de nier les bienfaits du tourisme. Il fait vivre nos restaurants, nos hôtels et nos artisans, ' +
      'crée des emplois saisonniers pour de nombreux jeunes et finance en partie l\'entretien de notre patrimoine. ' +
      'Sans les visiteurs, plusieurs commerces auraient sans doute déjà fermé. Le festival d\'été, qui attire un public ' +
      'venu du monde entier, contribue en outre au rayonnement de notre ville.\n\n' +
      'Il n\'en reste pas moins que cet afflux a un coût, que les habitants paient au quotidien. Les locations de courte durée ' +
      'se multiplient, si bien que les loyers ont fortement augmenté et que les familles quittent le centre. ' +
      'En été, les rues sont si encombrées qu\'il devient difficile de simplement faire ses courses, et les boulangeries ' +
      'cèdent la place aux boutiques de souvenirs. Une ville qui se vide de ses habitants finit par perdre son âme, ' +
      'et donc ce qui attirait les touristes.\n\n' +
      'Des solutions existent pourtant. Ne pourrait-on pas limiter le nombre de logements loués aux touristes, comme l\'ont ' +
      'fait d\'autres villes européennes ? Il serait également utile de mieux répartir les visiteurs en valorisant ' +
      'les quartiers périphériques et en encourageant les séjours hors saison. Enfin, une partie de la taxe de séjour ' +
      'pourrait financer des logements à loyer modéré pour les habitants.\n\n' +
      'Il est temps de construire un tourisme qui profite à tous, visiteurs comme habitants. ' +
      'Je vous prie d\'agréer, Madame, Monsieur, l\'expression de mes salutations distinguées.\n\n' +
      'Paul Rivière',
  },
];

export function getWritingTask(id: string): WritingTask | undefined {
  return WRITING_TASKS.find(t => t.id === id);
}
