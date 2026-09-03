<!-- Languages: [English](README.md) | [Català](README.ca.md) | [Castellano](README.es.md) | Français | [Galego](README.gl.md) | [Euskara](README.eu.md) | [Português](README.pt.md) | [Italiano](README.it.md) | [Deutsch](README.de.md) -->

# IFS Passcode Relay

Un bot Telegram qui permet aux participants d'un événement
**Ingress First Saturday (IFS)** de construire collaborativement, en
temps réel, le passcode échangeable de l'événement.

**Langues :** [English](README.md) · [Català](README.ca.md) · [Castellano](README.es.md) · Français · [Galego](README.gl.md) · [Euskara](README.eu.md) · [Português](README.pt.md) · [Italiano](README.it.md) · [Deutsch](README.de.md)

## Qu'est-ce que c'est ?

Ingress First Saturday est un événement en présentiel récurrent du jeu
mobile [Ingress](https://ingress.com). Pendant l'événement, les joueurs
reçoivent les images d'une série de portails ; les visiter sur le terrain
et examiner leur contenu multimédia révèle un caractère. En concaténant
les caractères dans le bon ordre, on obtient un passcode échangeable dans
la boutique du jeu contre un pack d'objets IFS.

Plusieurs IFS peuvent se dérouler en même temps, chacun avec son propre
passcode. Ce bot permet à tous les participants d'un IFS donné de
signaler le caractère trouvé et la position correspondante, et maintient
une vue partagée et en direct du passcode au fur et à mesure qu'il se
complète — plus besoin de collecter des captures d'écran manuellement
dans un groupe de discussion.

## Comment ça marche, du point de vue d'un joueur

1. La personne qui organise le relais de passcode d'un IFS crée un
   événement avec `/newevent` et obtient un code court à partager avec
   les participants (par exemple dans un groupe WhatsApp) — le bot
   envoie aussitôt un texte d'invitation prêt à coller avec ce code, et
   la personne qui crée l'événement y est automatiquement inscrite — en
   tant qu'administrateur —, car être l'organisateur ne dispense pas de
   chasser des portails aussi. Elle est aussi marquée fiable pour son
   propre événement dès le départ, comme le ferait `/trust` pour
   n'importe qui d'autre.
   Par défaut, le passcode est censé suivre le modèle `XXX99*999XX` (trois
   lettres, deux chiffres, un mot entier, trois chiffres, deux lettres)
   — la personne qui crée l'événement peut définir un autre modèle si
   cet IFS utilise un format différent. Le nom de l'événement n'a pas
   besoin d'être unique : lancer `/newevent` deux fois avec exactement
   le même nom n'est pas une erreur, cela crée simplement deux
   événements distincts avec deux codes d'accès différents. Comme les
   participants ne voient que le nom au moment de choisir quel code
   rejoindre, mieux vaut qu'il soit assez précis pour distinguer des
   événements IFS portant le même nom — par exemple `/newevent
   Barcelona 2026-08`, en incluant l'année et le mois, plutôt qu'un
   simple `/newevent Barcelona` qui entre en collision avec n'importe
   quel autre IFS de Barcelone. Si vous êtes déjà dans un autre
   événement pas encore résolu (non clôturé), on vous demande d'abord
   de confirmer — que vous l'administriez ou non — puisque créer
   celui-ci le laisse derrière vous ; si vous refusez, rien n'est créé.
   Si cet événement était déjà clôturé, ou que vous n'étiez dans aucun,
   il est créé immédiatement sans question. Dans tous les cas, si vous
   administriez celui que vous quittez, il est transmis d'abord, de la
   même façon que `/leave` (voir le point 6 ci-dessous).
2. Chaque autre participant envoie `/join <code>` au bot, qui l'invite
   aussi à lancer `/sharetext` s'il souhaite aider à le faire connaître.
   Un agent ne peut contribuer activement qu'à un seul événement à la fois,
   donc rejoindre un événement différent tant que le vôtre n'est pas
   encore résolu demande d'abord de confirmer le changement — et, si
   vous l'administriez, le transmet de la même façon. Si votre
   événement actuel est déjà clôturé, ou que vous n'en avez aucun,
   `/join` vous change immédiatement sans question. Si le code que vous
   rejoignez appartient à un événement clôturé parce que son
   administrateur précédent l'a quitté sans personne d'éligible pour
   prendre la relève, `/join` le rouvre et fait de vous son
   administrateur au lieu de rejeter le code.
3. Quand vous trouvez une valeur, vous envoyez simplement sa position et
   sa valeur : `6 GLYPH` signale que la position 6 (le mot) est
   `GLYPH` ; `7 3` signale que la position 7 est le chiffre `3`. Pas
   besoin de retenir une commande. Les lettres sont affichées en
   majuscules, mais vous pouvez les écrire comme vous voulez.
4. Le bot maintient un seul message par participant à jour avec l'état
   actuel du passcode, en le modifiant à chaque nouveau signalement — il
   n'inonde pas la discussion d'un nouveau message à chaque fois.
5. Si deux personnes différentes signalent des valeurs différentes pour
   la même position, les deux sont conservées : le bot affiche chaque
   passcode complet possible dans son propre bloc facile à copier, avec le
   nombre de personnes qui le confirment — et, pour les moins confirmés,
   qui les a signalés, afin que la personne qui administre l'événement
   puisse repérer une erreur ou un troll. Si ce que vous envoyez ne
   correspond pas à la position attendue, ou contredit ce qu'**une
   autre personne** a déjà signalé, le bot vous demande confirmation
   avant de l'enregistrer. Corriger votre **propre** signalement
   précédent est différent : aucune confirmation nécessaire, votre
   ancienne valeur à cette position est simplement remplacée — et le bot
   vous indique quelle était cette ancienne valeur, au cas où la
   correction elle-même serait une erreur et que vous vouliez la
   renvoyer. Si c'était la seule chose qui maintenait un désaccord, le
   désaccord disparaît aussitôt.
   Vous avez envoyé une valeur à la mauvaise position, ou vous ne la
   connaissez pas encore vraiment ? Envoyez juste le numéro de position,
   sans rien après (ou `/submit <position>`), pour supprimer votre
   signalement à cette position — sans confirmation, et le bot indique
   quelle valeur il a supprimée au cas où vous voudriez aussi annuler
   ça.
6. La personne qui administre l'événement résout un désaccord avec
   `/resolve <position> <valeur>` — ou, tapé simplement comme
   `/resolve <position>`, le bot liste les valeurs signalées pour cette
   position avec le nombre de personnes qui confirment chacune — et, si
   l'un de ces soutiens est fiable, combien le sont — et affiche un
   bouton par valeur (la plus confirmée en premier) pour la
   résoudre d'un seul geste. Taper `/resolve` seul, sans argument,
   parcourt à la place toutes les positions encore en désaccord une par
   une : résoudre celle affichée via ses boutons envoie aussitôt la
   suivante, jusqu'à ce qu'il n'en reste plus aucune. Cet avis n'offre
   jamais de raccourci pour clôturer l'événement, même si à ce
   moment-là toutes les positions ont déjà une valeur établie — que les
   personnes qui signalent soient d'accord entre elles n'est pas la
   même chose que le passcode fonctionne réellement, donc le bot
   renvoie la personne qui administre vers `/verify` (voir plus bas).
   Elle peut aussi marquer un participant comme fiable ou comme troll
   si besoin. Marquer quelqu'un comme troll, pour cet événement
   uniquement, écarte le reste de ses contributions et arrête de lui
   envoyer des mises à jour — il ne recevra pas non plus le passcode
   final à la clôture de l'événement.

   Quand il ne reste que peu de positions en désaccord, il peut être
   plus rapide d'essayer directement quelques-uns des blocs de passcode
   affichés à l'écran d'échange du jeu. Une fois que l'un d'eux y est
   confirmé correct, la personne qui administre l'événement le recolle
   avec `/verify <passcode>` et le bot détermine, pour toutes les positions
   à la fois, quelle valeur signalée l'a produit.
7. `/verify <passcode>` est la **seule** façon de compléter et de clôturer
   un événement — il n'existe pas de commande séparée pour « clôturer ».
   Même si toutes les positions concordent déjà, cette concordance n'a
   pas été vérifiée face au jeu lui-même : la personne qui administre
   doit copier un passcode candidat, le coller dans la boutique, confirmer
   qu'il est accepté, puis coller ce même passcode dans `/verify`. Une fois
   qu'il correspond, le bot résout toutes les positions à partir de lui
   et envoie le passcode final comme **nouveau** message à tous les
   participants — pas seulement une modification — pour que personne ne
   le rate même sans avoir suivi activement.

### Référence des commandes

| Commande | Qui peut l'utiliser | Ce qu'elle fait |
|---|---|---|
| `/start`, `/help` | tout le monde | Introduction et liste des commandes. |
| `/language <code>` | tout le monde | Définit votre langue (`en`, `ca`, `es`, `fr`, `gl`, `eu`, `pt`, `it`, `de`). |
| `/newevent <nom> [\| <modèle>]` | tout le monde | Crée un nouvel événement IFS et obtient son code d'accès ; vous y inscrit automatiquement et vous marque fiable. Ici, le `\|` sépare le nom du modèle, il ne veut pas dire « choisissez l'un ou l'autre » — ex. `/newevent Barcelona 2026-08 \| XXX99*999XX`. Demande confirmation d'abord si votre événement actuel n'est pas encore résolu (refuser ne crée rien) ; il est transmis d'abord, comme le ferait `/leave`. |
| `/sharetext [code] [langue]` | tout le monde | Obtient un texte prêt à partager pour inviter à rejoindre. `code` prend par défaut votre événement actuel, `langue` la vôtre — déjà envoyé une fois automatiquement par `/newevent`. |
| `/join <code>` | tout le monde | Rejoindre un événement — demande confirmation seulement si votre événement actuel n'est pas encore résolu, en le transmettant si vous l'administriez ; omise si vous n'en avez aucun ou qu'il est déjà clôturé. Un code clôturé sans administrateur se rouvre sous votre responsabilité au lieu d'être rejeté. |
| `/leave` | participant | Quitter l'événement actuel. Si vous êtes l'administrateur, un autre participant reprend automatiquement le rôle (en priorité les fiables, sinon celui ayant le plus contribué), ou l'événement est clôturé comme inachevé si personne n'est éligible — la même transmission se produit si vous partez en créant ou en rejoignant un autre événement au lieu de faire `/leave`. |
| `/current` | tout le monde | Affiche l'événement actuel : nom, code, modèle, nombre de participants et administrateur actuel. |
| `<position> <valeur>` (ou `/submit <position> <valeur>`) | participant | Signale la valeur trouvée à une position. |
| `<position>` seule (ou `/submit <position>`) | participant | Supprime votre propre signalement à cette position, s'il existe. |
| `/status` | participant | Affiche l'état actuel du passcode à la demande ; déplace aussi les prochaines mises à jour en direct vers ce nouveau message, au cas où le précédent aurait trop remonté dans la conversation. |
| `/resolve <position> [<valeur \| @utilisateur>]` | administrateur de l'événement | Choisit la valeur correcte en cas de désaccord ; sans valeur, liste les valeurs signalées (avec la répartition des soutiens fiables) sous forme de boutons à résoudre. |
| `/resolve` (sans argument) | administrateur de l'événement | Parcourt toutes les positions encore en désaccord, une par une ; une fois qu'il n'en reste plus, renvoie vers `/verify` — le consensus seul ne clôture jamais l'événement. |
| `/unresolve <position>` | administrateur de l'événement | Rouvre une position résolue. |
| `/trust <utilisateur>` | administrateur de l'événement | Marque un participant comme fiable, pour que son soutien soit mis en avant dans la liste de candidats de `/resolve`. |
| `/troll <utilisateur>` | administrateur de l'événement | Écarte les contributions d'un participant et arrête de le mettre à jour (cet événement uniquement). |
| `/untrust <utilisateur>` | administrateur de l'événement | Retire le marquage de fiabilité d'un participant ; s'il était marqué troll, rafraîchit aussi son message de statut d'un coup. |
| `/kick <utilisateur>` | administrateur de l'événement | Exclut un participant de l'événement. |
| `/promote <utilisateur>` | administrateur de l'événement | Transfère le rôle d'administrateur à un autre participant déjà dans l'événement ; le marque aussi comme fiable, comme `/newevent` le fait pour son propre administrateur. |
| `/claim` | participant | Tente de reprendre le rôle d'administrateur si l'actuel est inactif depuis 30+ minutes ; il a 5 minutes pour accepter, refuser ou ne pas répondre avant que ça se fasse. |
| `/verify <passcode>` | administrateur de l'événement | La seule façon de clôturer un événement : colle un passcode confirmé correct à l'écran d'échange du jeu ; résout toutes les positions à partir de lui d'un coup, fige l'événement et annonce le passcode final à tout le monde. |
| `/events` | tout le monde | Liste tous les événements auxquels vous avez participé, actuels ou passés. |

Chaque joueur voit les messages du bot dans sa propre langue, définie une
fois avec `/language` et mémorisée par la suite.

## État du projet

**En ligne**, sur [`@ifs_relay_bot`](https://t.me/ifs_relay_bot) sur
Telegram. Toutes les commandes décrites ci-dessus sont implémentées et
déployées. Consultez [`CLAUDE.md`](CLAUDE.md) (en anglais) pour la
conception technique complète (modèle de données, algorithme de
résolution des conflits, architecture d'internationalisation) si vous
souhaitez contribuer.

## Architecture

- **Runtime :** Cloudflare Workers, recevant les mises à jour de
  Telegram via webhook.
- **Framework du bot :** [grammY](https://grammy.dev).
- **Base de données :** [Cloudflare D1](https://developers.cloudflare.com/d1/).
- **Langage :** TypeScript.
- **Domaine :** `ifspasscoderelay.grifwl.blue`.

## Guide d'installation

Voici les étapes à réaliser une seule fois pour mettre en place
l'infrastructure du bot — une fois pour tout le projet, pas une fois par
IFS. Les étapes 1, 3 et 4 ne nécessitent pas que le code de l'application
existe déjà ; les étapes 2 et 5 nécessitent un Worker déployé, elles
viennent donc en dernier, une fois l'implémentation commencée.

### 1. Créer le bot Telegram

1. Ouvrez une discussion avec [@BotFather](https://t.me/BotFather) sur
   Telegram.
2. Envoyez `/newbot`, choisissez un nom d'affichage et un nom
   d'utilisateur unique se terminant par `bot` (ex. `IfsPasscodeRelayBot`).
3. BotFather répond avec un **token de bot** — traitez-le comme un mot de
   passe (quiconque le possède peut envoyer des messages en se faisant
   passer pour le bot). Il est stocké comme secret Cloudflare à l'étape
   4 ; jamais commité dans ce dépôt.
4. Toujours avec BotFather, configurez le profil public du bot :
   - `/setuserpic` — téléversez une photo de profil.
   - `/setdescription` — la description longue affichée sur l'écran de
     discussion vide, avant que quiconque n'ait parlé au bot.
   - `/setabouttext` — la courte bio de la page de profil.
   - `/setjoingroups` → *Disable*. Le bot est conçu pour des discussions
     privées en tête-à-tête — le message d'état en direct de chaque
     participant est modifié sur place, ce qui n'a de sens que dans une
     discussion avec lui seul et le bot — l'usage en groupe reste donc
     désactivé.

   Pas besoin de `/setcommands` : le bot enregistre sa propre liste de
   commandes directement depuis le code, via le `setMyCommands` de la
   Bot API, si bien que Telegram affiche les suggestions d'autocomplétion
   automatiquement et qu'elles ne peuvent jamais se désynchroniser d'une
   liste maintenue à la main dans BotFather.

#### Description et texte « about » suggérés

Définissez d'abord la version anglaise avec `/setdescription` et
`/setabouttext` — c'est celle que BotFather utilise par défaut pour
toute langue de client Telegram sans traduction propre. Ensuite, depuis
les mêmes menus, ajoutez les versions `ca`/`es`/`fr`/`gl`/`eu`/`pt`/`it`/`de` ci-dessous
comme descriptions par langue.

| Langue | `/setdescription` (longue) | `/setabouttext` (courte) |
|---|---|---|
| `en` | Collaboratively build your Ingress First Saturday event's redeemable passcode in real time. Report the character you found and its position — the bot keeps everyone's passcode in sync, flags disagreements, and announces the final result. Available in English, Català, Castellano, Français, Galego, Euskara, Português, Italiano and Deutsch. Send /help to start, or /newevent to create one for your IFS. | Real-time collaborative passcode relay for Ingress First Saturday events. |
| `ca` | Construeix en temps real, de manera col·laborativa, el passcode bescanviable del teu esdeveniment Ingress First Saturday. Reporta el caràcter que has trobat i la seva posició — el bot manté el passcode sincronitzat per a tothom, marca les discrepàncies i anuncia el resultat final. Disponible en català, anglès, castellà, francès, gallec, basc, portuguès, italià i alemany. Envia /help per començar, o /newevent per crear-ne un pel teu IFS. | Relleu col·laboratiu en temps real del passcode d'un Ingress First Saturday. |
| `es` | Construye en tiempo real, de forma colaborativa, el passcode canjeable de tu evento Ingress First Saturday. Reporta el carácter que has encontrado y su posición — el bot mantiene el passcode sincronizado para todos, marca las discrepancias y anuncia el resultado final. Disponible en español, inglés, catalán, francés, gallego, euskera, portugués, italiano y alemán. Envía /help para empezar, o /newevent para crear uno para tu IFS. | Relevo colaborativo en tiempo real del passcode de un Ingress First Saturday. |
| `fr` | Construisez en temps réel, de façon collaborative, le passcode échangeable de votre événement Ingress First Saturday. Signalez le caractère trouvé et sa position — le bot garde le passcode synchronisé pour tout le monde, signale les désaccords et annonce le résultat final. Disponible en français, anglais, catalan, espagnol, galicien, basque, portugais, italien et allemand. Envoyez /help pour commencer, ou /newevent pour en créer un pour votre IFS. | Relais collaboratif en temps réel du passcode d'un Ingress First Saturday. |
| `gl` | Constrúe en tempo real, de forma colaborativa, o passcode canxeable do teu evento Ingress First Saturday. Reporta o carácter que atopaches e a súa posición — o bot mantén o passcode sincronizado para todos, marca as discrepancias e anuncia o resultado final. Dispoñible en galego, inglés, catalán, castelán, francés, éuscaro, portugués, italiano e alemán. Envía /help para empezar, ou /newevent para crear un para o teu IFS. | Relevo colaborativo en tempo real do passcode dun Ingress First Saturday. |
| `eu` | Osatu denbora errealean, elkarlanean, zure Ingress First Saturday ekitaldiaren pasakode kanjeagarria. Jakinarazi aurkitu duzun karakterea eta bere posizioa — botak guztien pasakodea sinkronizatuta mantentzen du, desadostasunak markatzen ditu eta azken emaitza iragartzen du. Euskaraz, ingelesez, katalanez, gaztelaniaz, frantsesez, galizieraz, portugesez, italieraz eta alemanez eskuragarri. Bidali /help hasteko, edo /newevent zure IFS-rako bat sortzeko. | Ingress First Saturday ekitaldien pasakode-errelebo kolaboratiboa, denbora errealean. |
| `pt` | Construa em tempo real, de forma colaborativa, o passcode resgatável do seu evento Ingress First Saturday. Reporte o caractere que encontrou e sua posição — o bot mantém o passcode sincronizado para todos, sinaliza discrepâncias e anuncia o resultado final. Disponível em português, inglês, catalão, castelhano, francês, galego, basco, italiano e alemão. Envie /help para começar, ou /newevent para criar um para o seu IFS. | Revezamento colaborativo em tempo real do passcode de um Ingress First Saturday. |
| `it` | Costruisci in tempo reale, in modo collaborativo, il passcode riscattabile del tuo evento Ingress First Saturday. Segnala il carattere che hai trovato e la sua posizione — il bot mantiene il passcode sincronizzato per tutti, segnala i disaccordi e annuncia il risultato finale. Disponibile in italiano, inglese, catalano, spagnolo, francese, galiziano, basco, portoghese e tedesco. Invia /help per iniziare, o /newevent per crearne uno per il tuo IFS. | Staffetta collaborativa in tempo reale del passcode di un Ingress First Saturday. |
| `de` | Baue in Echtzeit, gemeinsam mit anderen, den einlösbaren Passcode deines Ingress-First-Saturday-Events. Melde das gefundene Zeichen und seine Position — der Bot hält den Passcode für alle synchron, markiert Uneinigkeiten und verkündet das Endergebnis. Verfügbar auf Deutsch, Englisch, Katalanisch, Spanisch, Französisch, Galicisch, Baskisch, Portugiesisch und Italienisch. Sende /help zum Starten, oder /newevent, um eines für dein IFS zu erstellen. | Kollaborative Echtzeit-Passcode-Staffel für Ingress-First-Saturday-Events. |

### 2. Créer le Worker Cloudflare et la base de données D1

Nécessite un compte Cloudflare avec la zone `grifwl.blue` déjà ajoutée,
et [wrangler](https://developers.cloudflare.com/workers/wrangler/)
installé (`npm install -g wrangler`, ou `npx wrangler`).

1. `wrangler login` pour authentifier la CLI.
2. `wrangler d1 create ifs-passcode-relay` crée la base de données D1 et
   affiche un `database_id` — à conserver, il ira dans le binding
   `[[d1_databases]]` (nommé `DB`) de `wrangler.toml` une fois le code
   existant.
3. Une fois le squelette de l'application en place, `wrangler deploy`
   publie le Worker pour la première fois.

### 3. Attribuer le sous-domaine

Le bot vit à l'adresse **`ifspasscoderelay.grifwl.blue`**. Comme la zone
`grifwl.blue` est déjà sur le même compte Cloudflare que celui utilisé
pour déployer, aucune étape manuelle dans le tableau de bord n'est
nécessaire — cela se déclare comme [Custom
Domain](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
directement dans `wrangler.toml` :

```toml
routes = [
  { pattern = "ifspasscoderelay.grifwl.blue", custom_domain = true }
]
```

`wrangler deploy` provisionne alors l'enregistrement DNS et le
certificat TLS automatiquement. Le tableau de bord n'est nécessaire
qu'en secours si la zone a un jour besoin d'une intervention manuelle
(par ex. si elle se trouve finalement sur un compte Cloudflare différent
de celui sur lequel `wrangler` est connecté).

### 4. Publier le token du bot comme secret

1. `wrangler secret put BOT_TOKEN` et collez le token de l'étape 1
   lorsque demandé — cela le stocke chiffré sur Cloudflare, exposé au
   Worker en tant que `env.BOT_TOKEN`, et jamais commité dans le dépôt.
2. Pour le développement local, mettez la même valeur dans `.dev.vars`
   (déjà exclu de git) sous la forme `BOT_TOKEN=...`.
3. Générez aussi une chaîne aléatoire à utiliser comme secret de webhook
   (ex. `openssl rand -hex 32`) et stockez-la de la même façon, sous
   `TELEGRAM_WEBHOOK_SECRET` — le Worker s'en sert pour rejeter toute
   requête qui ne vient pas réellement de Telegram (voir l'étape 5).

### 5. Pointer Telegram vers le Worker (webhook)

Une fois le Worker déployé et accessible à son URL publique :

```sh
curl "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://ifspasscoderelay.grifwl.blue/telegram/webhook&secret_token=<TELEGRAM_WEBHOOK_SECRET>"
```

Telegram inclura ensuite ce même secret dans l'en-tête
`X-Telegram-Bot-Api-Secret-Token` de chaque mise à jour qu'il livre ; le
Worker doit vérifier qu'il correspond avant de traiter quoi que ce soit,
et rejeter la requête sinon — c'est ce qui empêche quiconque d'autre
d'envoyer de fausses mises à jour à l'URL publique du webhook. Vérifiez
que le webhook est bien enregistré avec :

```sh
curl "https://api.telegram.org/bot<BOT_TOKEN>/getWebhookInfo"
```

### 6. Configurer le tableau de bord privé d'administration

Un tableau de bord privé, en lecture seule, se trouve à `/admin` (ex.
`https://ifspasscoderelay.grifwl.blue/admin`), pour inspecter les
données D1 en direct sans ouvrir une session interactive de `wrangler d1
execute`. Il est protégé par mot de passe, et les données appartenant à
un événement précis (participants, signalements, candidats,
résolutions, marques de confiance, négociations de `/claim`) ne
s'affichent qu'une fois cet événement choisi dans une liste déroulante —
les tables globales (événements, utilisateurs, mots connus, créations
d'événement en attente) sont toujours visibles. Rien ne se rafraîchit
tout seul : chaque vue est un instantané au moment où elle a été chargée
ou rafraîchie pour la dernière fois, avec un bouton de rafraîchissement
manuel pour relancer la requête à la demande.

1. Générez un mot de passe et une clé de signature aléatoire distincte
   pour ses cookies de session (ex. `openssl rand -hex 24` pour le mot
   de passe, `openssl rand -hex 32` pour la clé), puis publiez les deux
   de la même façon que le token du bot : `wrangler secret put
   ADMIN_DASHBOARD_PASSWORD` et `wrangler secret put
   ADMIN_SESSION_SECRET`.
2. Pour le développement local, ajoutez les deux mêmes valeurs dans
   `.dev.vars` sous la forme `ADMIN_DASHBOARD_PASSWORD=...` et
   `ADMIN_SESSION_SECRET=...`.

## Licence

MIT.
