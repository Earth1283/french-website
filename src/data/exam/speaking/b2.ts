import type { SpeakingTask } from '../../../types/exam';

// DELF B2 production orale: about 12 minutes of speaking, with 30 minutes'
// preparation for part 1. Part 1 is a presentation of a point de vue: the
// candidate reads a press article, identifies the problem it raises and
// presents and defends a structured opinion alone. Part 2 is a debate in which
// the examiner challenges that position, plays devil's advocate and raises
// counter-arguments.

export const B2_SPEAKING: SpeakingTask[] = [
  {
    id: 'b2-oral-mode-ultra-rapide',
    level: 'b2',
    title: 'La mode ultra-rapide',
    parts: [
      {
        kind: 'point-de-vue',
        title: 'Présentation d\'un point de vue',
        consigne:
          'Vous lisez l\'article ci-dessous et vous disposez de trente minutes pour le préparer. Présentez le problème soulevé par cet article, puis défendez un point de vue organisé : introduction, arguments, exemples et conclusion. Vous parlez pendant environ six minutes.',
        instructionsEn:
          'Read the article and use the 30 minutes of preparation. Identify the problem it raises, then present and defend a structured point of view for about 6 minutes: introduction, arguments, examples and conclusion. The examiner does not speak in this part.',
        document:
          'La mode ultra-rapide : faut-il freiner les géants du textile en ligne ?\n\n' +
          'Chaque semaine, certaines plateformes mettent en ligne plusieurs milliers de nouveaux modèles, vendus à des prix si bas qu\'ils semblent défier toute logique. ' +
          'Pour les consommateurs, l\'attrait est évident : un tee-shirt à quelques euros, livré en quarante-huit heures, renouvelé dès que la tendance change. ' +
          'Mais cette commodité a un coût, que l\'on paie ailleurs. Fabriqués à partir de fibres synthétiques, ces vêtements sont portés quelques fois avant d\'être jetés, ' +
          'et une part importante finit dans des décharges, notamment dans les pays du Sud. ' +
          'Les défenseurs de ce modèle répondent qu\'il démocratise la mode et qu\'il fait travailler des usines qui, sans lui, ne tourneraient pas. ' +
          'Ils ajoutent que nul ne devrait être privé de vêtements au motif qu\'il dispose de peu d\'argent. ' +
          'Selon eux, reprocher à ces plateformes leur succès revient à juger sévèrement ceux qui n\'ont pas les moyens d\'acheter plus cher. ' +
          'Pourtant, les pouvoirs publics hésitent. Certains pays envisagent une taxe sur chaque article vendu, tandis que d\'autres misent surtout sur l\'information des acheteurs et sur l\'affichage de l\'impact environnemental. ' +
          'La vraie question est donc moins de savoir si ce modèle doit exister que de déterminer qui doit en supporter le coût : le consommateur, la plateforme ou l\'État. ' +
          'Une chose est certaine : le prix affiché ne reflète plus, depuis longtemps, le prix réel du vêtement.',
        prepMinutes: 30,
        speakMinutes: 6,
        examinerLines: [],
        checklist: [
          'Identifies the problem raised by the article precisely',
          'Has a clear structure: introduction, organised arguments and conclusion',
          'Backs each argument with a relevant example',
          'Uses concession and nuance (subjunctive, bien que, certes)',
          'Speaks fluently for about six minutes',
        ],
        usefulPhrases: [
          'Le problème soulevé par l\'article, c\'est…',
          'Il me semble essentiel que…',
          'Bien que ce modèle soit attractif, il faut reconnaître que…',
          'Certes…, mais…',
          'Cela dit, …',
          'Il serait préférable que…',
          'En somme, je suis convaincu(e) que…',
        ],
        modelAnswer:
          'L\'article soulève un problème majeur : la mode ultra-rapide permet d\'acheter des vêtements à très bas prix, mais elle fait peser le coût réel sur l\'environnement et sur les travailleurs. ' +
          'Selon moi, il est essentiel de réguler ce modèle, même si cela peut sembler contraire à l\'intérêt immédiat des consommateurs. ' +
          'Premièrement, le prix d\'un vêtement ne reflète pas ses coûts cachés. Bien que les fibres synthétiques soient bon marché, leur production consomme beaucoup d\'énergie, ' +
          'et les vêtements, à peine portés, finissent dans des décharges. Il faut donc que les entreprises paient une partie de ce coût, par exemple grâce à une taxe. ' +
          'Deuxièmement, je ne nie pas que cette mode permette à des familles modestes de s\'habiller. Certes, c\'est un avantage réel. ' +
          'Cependant, cette accessibilité repose sur une consommation permanente, qui pousse à acheter sans besoin. ' +
          'Il serait préférable de soutenir la location, la seconde main et la réparation, qui offrent aussi des prix abordables. ' +
          'Troisièmement, l\'argument de l\'emploi mérite d\'être pris au sérieux. Il ne faudrait pas que la régulation condamne les usines des pays producteurs. ' +
          'C\'est pourquoi une taxe devrait être accompagnée d\'aides à la transition, afin que les ouvriers ne soient pas les premières victimes du changement. ' +
          'En conclusion, la question n\'est pas de savoir si la mode doit exister, mais qui doit payer. ' +
          'Je suis convaincu qu\'une régulation intelligente, qui oblige les entreprises à assumer leur impact, est la seule façon de concilier accessibilité, emploi et protection de l\'environnement.',
      },
      {
        kind: 'debat',
        title: 'Débat avec l\'examinateur',
        consigne:
          'Vous débattez avec l\'examinateur à partir du sujet que vous venez de présenter. Il défend une autre position, vous pose des questions et vous demande des précisions. Répondez de façon argumentée, nuancée et respectueuse.',
        instructionsEn:
          'Debate the topic with the examiner, who will challenge your position, ask you to clarify and raise counter-arguments. Give reasoned, nuanced answers and concede points where they are fair.',
        prepMinutes: 0,
        speakMinutes: 6,
        examinerLines: [
          'Pourriez-vous préciser en une phrase la position que vous défendez ?',
          'Certains diraient pourtant que ces plateformes permettent à des personnes modestes de s\'habiller à la mode. Qu\'en pensez-vous ?',
          'Une taxe sur chaque article, est-ce vraiment la meilleure solution ? Ne risquerait-elle pas de pénaliser d\'abord les acheteurs les plus modestes ?',
          'Les entreprises ont-elles réellement le pouvoir de changer ce modèle, ou est-ce aux consommateurs de faire le bon choix ?',
          'Quel est, selon vous, l\'argument le plus fort de la position opposée à la vôtre ?',
          'Certains affirment que l\'information des acheteurs suffit, sans qu\'il soit nécessaire de contraindre les entreprises. Êtes-vous d\'accord ?',
        ],
        checklist: [
          'Responds directly to each challenge instead of evading it',
          'Concedes fair points and nuances the position',
          'Gives precise counter-arguments with examples',
          'Asks for clarification when needed, in a polite register',
        ],
        usefulPhrases: [
          'Je vous accorde que…, mais…',
          'Ce que vous dites est vrai, cependant…',
          'Je ne suis pas certain(e) que…',
          'Il faudrait plutôt…',
          'Pour être honnête, …',
          'Si je comprends bien, …',
        ],
        modelAnswer:
          'Je comprends votre question, et je vous accorde que l\'accessibilité est un vrai enjeu. Mais je ne pense pas qu\'il faille accepter ce modèle sans rien changer. ' +
          'Certes, une taxe pourrait peser sur les acheteurs les plus modestes, c\'est pourquoi je ne défends pas une taxe uniforme. ' +
          'Il faudrait plutôt moduler la taxe selon l\'impact environnemental de chaque vêtement, et redistribuer une partie des recettes aux familles à bas revenus. ' +
          'Quant aux consommateurs, ils ont évidemment leur part de responsabilité. Cependant, il serait injuste de faire reposer toute la charge sur eux. ' +
          'Les plateformes utilisent des algorithmes qui encouragent l\'achat impulsif, et la publicité crée des besoins artificiels. Dans ces conditions, il n\'est pas réaliste d\'attendre que chacun résiste seul. ' +
          'Pour répondre à votre question, l\'argument le plus fort de l\'autre camp est, à mon avis, celui de l\'emploi. Il est vrai que les usines font vivre des familles entières, et il ne faut pas que la transition les abandonne. ' +
          'Toutefois, je ne crois pas que l\'information des acheteurs suffise à elle seule, car on constate souvent que les bonnes intentions ne se traduisent pas en achats responsables. ' +
          'Il faut donc une combinaison de mesures : régulation, information et accompagnement. ' +
          'Pour finir, je reconnais que mon point de vue n\'est pas parfait, mais je pense qu\'il est possible de concilier accès à la mode et respect de l\'environnement, à condition que la régulation soit pensée avec les acteurs concernés.',
      },
    ],
  },
  {
    id: 'b2-oral-ia-ecole',
    level: 'b2',
    title: 'L\'intelligence artificielle et l\'école',
    parts: [
      {
        kind: 'point-de-vue',
        title: 'Présentation d\'un point de vue',
        consigne:
          'Vous lisez l\'article ci-dessous et vous disposez de trente minutes pour le préparer. Présentez le problème soulevé par cet article, puis défendez un point de vue organisé : introduction, arguments, exemples et conclusion. Vous parlez pendant environ six minutes.',
        instructionsEn:
          'Read the article and use the 30 minutes of preparation. Identify the problem it raises, then present and defend a structured point of view for about 6 minutes: introduction, arguments, examples and conclusion. The examiner does not speak in this part.',
        document:
          'L\'intelligence artificielle doit-elle entrer en classe ?\n\n' +
          'Depuis quelques mois, des logiciels capables de rédiger une dissertation ou de résoudre un problème de mathématiques sont accessibles à presque tous les élèves. ' +
          'Face à cette évolution, les établissements oscillent entre interdiction et enthousiasme. ' +
          'Dans plusieurs pays, les ministères de l\'éducation publient déjà des recommandations, sans toujours fixer de règles précises. ' +
          'Certains enseignants y voient un outil précieux : un assistant qui explique une notion autrement, adapte les exercices au niveau de chacun et soulage les professeurs de tâches répétitives. ' +
          'D\'autres redoutent au contraire que les élèves cessent de réfléchir par eux-mêmes, et que l\'effort intellectuel, qui fait la valeur de l\'apprentissage, disparaisse peu à peu. ' +
          'Les parents, eux, se partagent entre inquiétude et curiosité. ' +
          'Les spécialistes soulignent que le problème ne vient pas tant de l\'outil que de la façon dont il est utilisé. ' +
          'Un élève qui demande la solution d\'un exercice n\'apprend rien ; celui qui s\'en sert pour vérifier son raisonnement progresse. ' +
          'Reste une difficulté : comment évaluer le travail d\'un élève quand une machine peut l\'avoir largement rédigé ? ' +
          'Les écoles devront sans doute repenser leurs méthodes, en privilégiant les oraux, les contrôles en classe et les projets collectifs. ' +
          'L\'enjeu n\'est donc pas seulement technique : il touche à ce que l\'on attend réellement de l\'école.',
        prepMinutes: 30,
        speakMinutes: 6,
        examinerLines: [],
        checklist: [
          'Identifies the problem raised by the article precisely',
          'Has a clear structure: introduction, organised arguments and conclusion',
          'Backs each argument with a relevant example',
          'Uses concession and nuance (subjunctive, bien que, certes)',
          'Speaks fluently for about six minutes',
        ],
        usefulPhrases: [
          'Le problème soulevé par l\'article, c\'est…',
          'Il me semble indispensable que…',
          'Bien que cette aide soit précieuse, elle ne doit pas…',
          'Certes…, mais…',
          'Il vaut mieux que les élèves…',
          'Cela dit, …',
          'En somme, …',
        ],
        modelAnswer:
          'L\'article pose une question essentielle : faut-il intégrer l\'intelligence artificielle dans les classes, ou la tenir à distance ? ' +
          'Selon moi, l\'école doit l\'utiliser, à condition de garder le contrôle sur la manière dont les élèves apprennent. ' +
          'D\'abord, il est indéniable que ces outils peuvent aider. Un élève qui ne comprend pas une règle de grammaire peut obtenir une explication immédiate, reformulée de plusieurs façons, ' +
          'ce qui serait impossible pour un professeur qui s\'occupe de trente élèves. Bien que cette aide soit précieuse, elle ne doit pas remplacer le travail personnel, car c\'est l\'effort qui fixe les connaissances. ' +
          'Ensuite, je ne crois pas qu\'il faille interdire ces logiciels. Une interdiction serait difficile à faire respecter, et elle ne préparerait pas les jeunes à un monde où ces outils seront partout. ' +
          'Il vaut mieux leur apprendre à vérifier les réponses, à repérer les erreurs et à citer leurs sources. Certes, cela demande du temps et de la formation pour les enseignants. ' +
          'Enfin, la question de l\'évaluation mérite toute notre attention. Si une machine peut rédiger une dissertation, il faudra valoriser davantage les oraux, les contrôles en classe et les projets collectifs, ' +
          'où l\'élève doit justifier sa démarche. Il ne s\'agit pas de se méfier des élèves, mais de changer ce que l\'on mesure. ' +
          'En conclusion, l\'intelligence artificielle peut transformer l\'école en profondeur, à condition qu\'on ne la considère pas comme une fin en soi. ' +
          'Elle doit rester un outil au service de l\'apprentissage, et non un raccourci qui dispense d\'apprendre.',
      },
      {
        kind: 'debat',
        title: 'Débat avec l\'examinateur',
        consigne:
          'Vous débattez avec l\'examinateur à partir du sujet que vous venez de présenter. Il défend une autre position, vous pose des questions et vous demande des précisions. Répondez de façon argumentée, nuancée et respectueuse.',
        instructionsEn:
          'Debate the topic with the examiner, who will challenge your position, ask you to clarify and raise counter-arguments. Give reasoned, nuanced answers and concede points where they are fair.',
        prepMinutes: 0,
        speakMinutes: 6,
        examinerLines: [
          'Pour commencer, pouvez-vous préciser ce que vous entendez par « utiliser » l\'intelligence artificielle à l\'école ?',
          'Certains diraient pourtant que ces outils rendent l\'éducation plus juste, car tous les élèves peuvent y accéder, quel que soit leur milieu. Qu\'en pensez-vous ?',
          'Ne risque-t-on pas que les élèves perdent l\'habitude de chercher et de se tromper, pourtant à la base de l\'apprentissage ?',
          'Les professeurs, eux, ne sont pas formés pour cela. N\'est-il pas irréaliste de leur demander d\'intégrer ces outils dès maintenant ?',
          'Quel est, selon vous, l\'argument le plus fort de ceux qui veulent interdire ces logiciels ?',
          'Et si l\'on considérait que l\'école doit surtout apprendre à douter des réponses données par une machine ? Cela change-t-il votre position ?',
        ],
        checklist: [
          'Responds directly to each challenge instead of evading it',
          'Concedes fair points and nuances the position',
          'Gives precise counter-arguments, with examples',
          'Asks for clarification when needed, in a polite register',
        ],
        usefulPhrases: [
          'Je vous accorde que…, mais…',
          'Votre question est légitime : …',
          'Je ne suis pas certain(e) que…',
          'Il faudrait plutôt…',
          'Pour être honnête, …',
          'Si je comprends bien, …',
        ],
        modelAnswer:
          'Votre question est légitime : il faut évidemment préciser ce que l\'on entend par « utiliser ». Pour moi, il s\'agit de demander à l\'outil d\'expliquer, de corriger ou de proposer des exercices, et non de rédiger à la place de l\'élève. ' +
          'Je vous accorde que cette distinction n\'est pas toujours facile à faire en pratique. ' +
          'Concernant l\'équité, vous avez raison sur un point : un accès gratuit à un tuteur personnalisé peut réduire les inégalités. ' +
          'Cependant, il ne faut pas oublier que tous les élèves n\'ont pas d\'ordinateur ni de connexion stable à la maison. Sans un vrai investissement public, ces outils creuseraient plutôt l\'écart. ' +
          'Vous avez raison de craindre que les élèves perdent l\'habitude de chercher. C\'est pourquoi je ne propose pas de laisser les logiciels faire le travail, mais de concevoir des exercices où l\'erreur est notée et analysée. ' +
          'Ce qui me semble décisif, c\'est que l\'élève apprenne à douter de la réponse qu\'il reçoit. ' +
          'Pour les enseignants, je reconnais que la formation est un vrai problème. Il serait irréaliste de leur demander d\'intégrer ces outils du jour au lendemain. ' +
          'Il faudrait plutôt commencer par quelques expérimentations, puis généraliser ce qui fonctionne. ' +
          'Quant à l\'argument des partisans de l\'interdiction, je le crois sérieux : une règle claire peut protéger les plus jeunes. Mais une interdiction seule ne règle rien, car les élèves trouveront toujours un moyen de la contourner. ' +
          'Enfin, votre dernière question change en partie ma position : apprendre à douter est sans doute l\'objectif le plus important. ' +
          'Si l\'école parvient à enseigner cela, l\'intelligence artificielle deviendra un outil de réflexion plutôt qu\'un raccourci.',
      },
    ],
  },
  {
    id: 'b2-oral-surtourisme',
    level: 'b2',
    title: 'Le surtourisme dans les villes',
    parts: [
      {
        kind: 'point-de-vue',
        title: 'Présentation d\'un point de vue',
        consigne:
          'Vous lisez l\'article ci-dessous et vous disposez de trente minutes pour le préparer. Présentez le problème soulevé par cet article, puis défendez un point de vue organisé : introduction, arguments, exemples et conclusion. Vous parlez pendant environ six minutes.',
        instructionsEn:
          'Read the article and use the 30 minutes of preparation. Identify the problem it raises, then present and defend a structured point of view for about 6 minutes: introduction, arguments, examples and conclusion. The examiner does not speak in this part.',
        document:
          'Surtourisme : jusqu\'où peut-on accueillir les visiteurs ?\n\n' +
          'Dans les grandes villes historiques, les habitants ne reconnaissent plus leur quartier. Les appartements se transforment en locations saisonnières, les commerces de proximité laissent place aux boutiques de souvenirs, et les files d\'attente devant les monuments s\'allongent chaque été. ' +
          'Les autorités locales, longtemps favorables à l\'afflux de touristes, commencent à limiter le nombre de nuitées ou à imposer une taxe supplémentaire. ' +
          'Dans certains quartiers, la municipalité réserve désormais des rues entières aux habitants pendant les périodes de pointe. ' +
          'Les défenseurs du tourisme rappellent pourtant que cette activité fait vivre des milliers d\'emplois, des hôteliers aux guides, et qu\'elle contribue au rayonnement culturel d\'une région. ' +
          'Ils estiment que la solution passe par une meilleure répartition des visiteurs dans le temps et dans l\'espace, plutôt que par des interdictions. ' +
          'Les habitants, eux, ne demandent pas la fin du tourisme, mais une vraie concertation. ' +
          'D\'autres soutiennent qu\'il est urgent de protéger la qualité de vie des habitants, faute de quoi les centres-villes deviendront de simples décors pour les visiteurs. ' +
          'Pour ces derniers, l\'enjeu est aussi environnemental : les transports et l\'hébergement pèsent lourdement sur les ressources locales. ' +
          'La question est donc moins de savoir s\'il faut accueillir des touristes que de déterminer à quelles conditions. ' +
          'Un territoire qui n\'attire plus que des visiteurs de passage risque de perdre son identité.',
        prepMinutes: 30,
        speakMinutes: 6,
        examinerLines: [],
        checklist: [
          'Identifies the problem raised by the article precisely',
          'Has a clear structure: introduction, organised arguments and conclusion',
          'Backs each argument with a relevant example',
          'Uses concession and nuance (subjunctive, bien que, certes)',
          'Speaks fluently for about six minutes',
        ],
        usefulPhrases: [
          'Le problème soulevé par l\'article, c\'est…',
          'Il faut que les habitants puissent…',
          'Bien qu\'une ville vive grâce aux visiteurs, …',
          'Certes…, mais…',
          'Il serait injuste que…',
          'Cela dit, …',
          'En conclusion, je suis convaincu(e) que…',
        ],
        modelAnswer:
          'L\'article pose la question du surtourisme : jusqu\'à quel point une ville peut-elle accueillir des visiteurs sans perdre ce qui la rend attractive ? ' +
          'Selon moi, il faut limiter l\'afflux, sans renoncer au tourisme, car celui-ci reste une véritable richesse pour beaucoup de territoires. ' +
          'Tout d\'abord, la qualité de vie des habitants doit primer. Lorsqu\'un quartier se vide de ses commerces de proximité au profit de boutiques de souvenirs, les résidents finissent par partir. ' +
          'Bien qu\'une ville vive grâce aux visiteurs, il faut que les habitants puissent y vivre toute l\'année. Dans certaines villes, la transformation d\'appartements en locations saisonnières a fait monter les loyers de manière spectaculaire. ' +
          'Ensuite, je pense qu\'il est préférable de répartir les visiteurs plutôt que de les interdire. Il serait injuste de fermer des hôtels qui font vivre des familles entières. ' +
          'En revanche, on peut encourager les touristes à venir hors des mois d\'été, ou à découvrir des villages voisins, qui ont souvent beaucoup à offrir. ' +
          'Certes, les conséquences environnementales ne doivent pas être négligées. Les transports, la consommation d\'eau et la production de déchets augmentent fortement pendant les pics de fréquentation. ' +
          'C\'est pourquoi une taxe affectée à l\'entretien des sites me paraît juste, à condition qu\'elle serve clairement les habitants. ' +
          'En conclusion, je suis convaincu que le tourisme doit rester une chance, à condition d\'être régulé. Une ville qui accueille des visiteurs sans se soucier de ses habitants risque de perdre précisément ce que les touristes venaient chercher.',
      },
      {
        kind: 'debat',
        title: 'Débat avec l\'examinateur',
        consigne:
          'Vous débattez avec l\'examinateur à partir du sujet que vous venez de présenter. Il défend une autre position, vous pose des questions et vous demande des précisions. Répondez de façon argumentée, nuancée et respectueuse.',
        instructionsEn:
          'Debate the topic with the examiner, who will challenge your position, ask you to clarify and raise counter-arguments. Give reasoned, nuanced answers and concede points where they are fair.',
        prepMinutes: 0,
        speakMinutes: 6,
        examinerLines: [
          'Pourriez-vous préciser la mesure que vous préféreriez pour régler ce problème ?',
          'Certains diraient pourtant que le tourisme est la seule richesse de nombreuses régions rurales. Ne serait-ce pas une erreur de le restreindre ?',
          'Une taxe pour les visiteurs, n\'est-ce pas un moyen de réserver les villes aux personnes aisées ? Qu\'en pensez-vous ?',
          'Les habitants eux-mêmes profitent parfois du tourisme, en louant leur logement ou en vendant leurs produits. Ne faut-il pas en tenir compte ?',
          'Ne serait-il pas plus efficace de développer les transports et les infrastructures, plutôt que de limiter les visiteurs ?',
          'Quel est, selon vous, l\'argument le plus fort de la position opposée à la vôtre ?',
        ],
        checklist: [
          'Responds directly to each challenge instead of evading it',
          'Concedes fair points and nuances the position',
          'Gives precise counter-arguments with examples',
          'Keeps the exchange going, without long silences',
        ],
        usefulPhrases: [
          'Je comprends votre remarque, et je suis d\'accord pour dire que…',
          'Vous soulevez un point important avec…',
          'Il est vrai que…, toutefois…',
          'Il serait souhaitable de…',
          'Quant à…, je pense que…',
          'Ce qui me semble décisif, c\'est…',
        ],
        modelAnswer:
          'Je comprends votre remarque, et je suis d\'accord pour dire que le tourisme apporte beaucoup à certaines régions. Je ne prône pas la fermeture des villes, mais une meilleure régulation. ' +
          'Pour une région rurale, par exemple, un visiteur qui s\'arrête trois jours peut faire vivre une boulangerie toute l\'année. ' +
          'Vous soulevez un point important avec la taxe. Il est vrai qu\'une taxe peut décourager les familles modestes. C\'est pourquoi je pense qu\'elle doit rester modérée, et que son produit doit financer des équipements pour les habitants, comme les transports ou les espaces verts. ' +
          'Ainsi, elle ne réserverait pas les villes aux plus riches. ' +
          'Je reconnais que les habitants profitent aussi du tourisme, notamment grâce à la location de leur logement. Toutefois, cette activité peut vider les immeubles de leurs résidents permanents. ' +
          'Il serait donc souhaitable d\'encadrer les locations saisonnières, sans les interdire totalement. ' +
          'Quant aux transports, c\'est une bonne piste, mais elle ne suffit pas. Développer les infrastructures attirerait encore plus de visiteurs, et le problème se poserait de nouveau. ' +
          'Il faut donc combiner plusieurs mesures : répartir les visites dans le temps, soutenir les sites moins connus et protéger les quartiers résidentiels. ' +
          'Pour répondre à votre dernière question, l\'argument le plus fort de l\'opposition est sans doute économique : limiter le tourisme peut menacer des emplois. ' +
          'Je l\'entends, mais je pense que l\'économie d\'une ville ne doit pas dépendre uniquement de la présence de visiteurs.',
      },
    ],
  },
];
