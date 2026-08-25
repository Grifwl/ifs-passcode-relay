<!-- Languages: [English](README.md) | [Català](README.ca.md) | [Castellano](README.es.md) | Français -->

# IFS Passcode Relay

Un bot Telegram qui permet aux participants d'un événement
**Ingress First Saturday (IFS)** de construire collaborativement, en
temps réel, le passcode échangeable de l'événement.

**Langues :** [English](README.md) · [Català](README.ca.md) · [Castellano](README.es.md) · Français

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
une vue partagée et en direct du code au fur et à mesure qu'il se
complète — plus besoin de collecter des captures d'écran manuellement
dans un groupe de discussion.

## Comment ça marche, du point de vue d'un joueur

1. La personne qui organise le relais de passcode d'un IFS crée un
   événement avec `/newevent` et obtient un code court à partager avec
   les participants (par exemple dans un groupe WhatsApp). Par défaut,
   le passcode est censé suivre le modèle `XXX99*999XX` (trois lettres,
   deux chiffres, un mot entier, trois chiffres, deux lettres) — la
   personne qui crée l'événement peut définir un autre modèle si cet IFS
   utilise un format différent.
2. Chaque participant envoie `/join <code>` au bot. Un agent ne peut
   contribuer activement qu'à un seul événement à la fois.
3. Quand vous trouvez une valeur, vous envoyez simplement sa position et
   sa valeur : `6 CIPHER` signale que la position 6 (le mot) est
   `CIPHER` ; `7 3` signale que la position 7 est le chiffre `3`. Pas
   besoin de retenir une commande. Les lettres sont affichées en
   majuscules, mais vous pouvez les écrire comme vous voulez.
4. Le bot maintient un seul message par participant à jour avec l'état
   actuel du code, en le modifiant à chaque nouveau signalement — il
   n'inonde pas la discussion d'un nouveau message à chaque fois.
5. Si deux personnes signalent des valeurs différentes pour la même
   position, les deux sont conservées : le bot affiche chaque code
   complet possible dans son propre bloc facile à copier, avec le nombre
   de personnes qui le confirment — et, pour les moins confirmés, qui
   les a signalés, afin que la personne qui a créé l'événement puisse
   repérer une erreur ou un troll. Si ce que vous envoyez ne correspond
   pas à la position attendue, ou contredit ce qui existe déjà, le bot
   vous demande confirmation avant de l'enregistrer.
6. La personne qui a créé l'événement résout un désaccord avec
   `/resolve`, et peut marquer un participant comme fiable ou comme
   troll si besoin.
7. Une fois l'événement terminé, son créateur le clôture avec
   `/closeevent`, ce qui envoie le passcode final comme **nouveau**
   message à tous les participants — pas seulement une modification —
   pour que personne ne le rate même sans avoir suivi activement.

### Référence des commandes

| Commande | Qui peut l'utiliser | Ce qu'elle fait |
|---|---|---|
| `/start`, `/help` | tout le monde | Introduction et liste des commandes. |
| `/language <code>` | tout le monde | Définit votre langue (`en`, `ca`, `es`, `fr`). |
| `/newevent <nom> [\| <modèle>]` | tout le monde | Crée un nouvel événement IFS et obtient son code d'accès. |
| `/sharetext <code> [langue]` | tout le monde | Obtient un texte prêt à partager pour inviter à rejoindre, éventuellement dans une langue différente de la vôtre. |
| `/join <code>` | tout le monde | Rejoindre un événement. |
| `/leave` | participant | Quitter l'événement actuel. |
| `/myevent` | tout le monde | Affiche dans quel événement vous êtes, le cas échéant. |
| `<position> <valeur>` (ou `/submit <position> <valeur>`) | participant | Signale la valeur trouvée à une position. |
| `/status` (ou `/code`) | participant | Affiche l'état actuel du code à la demande. |
| `/resolve <position> <valeur \| @utilisateur>` | créateur de l'événement | Choisit la valeur correcte en cas de désaccord. |
| `/unresolve <position>` | créateur de l'événement | Rouvre une position résolue. |
| `/trust <utilisateur>` | créateur de l'événement | Marque un participant comme fiable. |
| `/troll <utilisateur>` | créateur de l'événement | Écarte les contributions d'un participant. |
| `/untrust <utilisateur>` | créateur de l'événement | Retire le marquage de fiabilité d'un participant. |
| `/kick <utilisateur>` | créateur de l'événement | Exclut un participant de l'événement. |
| `/closeevent` | créateur de l'événement | Fige l'événement et annonce le code final à tout le monde. |
| `/events` | tout le monde | Liste les événements que vous avez créés. |

Chaque joueur voit les messages du bot dans sa propre langue, définie une
fois avec `/language` et mémorisée par la suite.

## État du projet

Ce projet est actuellement en **phase de conception**. Le modèle
d'interaction décrit ci-dessus est finalisé, mais aucun code applicatif
n'a encore été écrit. Consultez [`CLAUDE.md`](CLAUDE.md) (en anglais)
pour la conception technique complète (modèle de données, algorithme de
résolution des conflits, architecture d'internationalisation) si vous
souhaitez contribuer.

## Architecture (prévue)

- **Runtime :** Cloudflare Workers, recevant les mises à jour de
  Telegram via webhook.
- **Framework du bot :** [grammY](https://grammy.dev).
- **Base de données :** [Cloudflare D1](https://developers.cloudflare.com/d1/).
- **Langage :** TypeScript.
- **Domaine :** un sous-domaine de `grifwl.blue` (à décider).

Les instructions d'installation et de déploiement seront ajoutées ici dès
qu'une première implémentation existera.

## Licence

MIT.
