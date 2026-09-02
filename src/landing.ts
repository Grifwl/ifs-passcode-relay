import type { SupportedLanguage } from "./domain/language.js";
import { BOT_URL } from "./domain/botInfo.js";
import { DEFAULT_PATTERN } from "./domain/pattern.js";

const REPO_URL = "https://github.com/Grifwl/ifs-passcode-relay";

// GitHub's own "mark-github" Octicon (MIT-licensed), inlined so the
// footer link doesn't need an external request or a raster image. Uses
// currentColor so it always matches the surrounding link text, in both
// light and dark mode.
const GITHUB_ICON = `<svg class="gh-icon" viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"/></svg>`;

interface CommandRow {
  command: string;
  description: string;
}

interface CommandGroup {
  heading: string;
  rows: CommandRow[];
}

/**
 * A "How it works" step. Plain steps are a single sentence; a step can
 * also carry `subitems` (e.g. reporting a new value vs. correcting vs.
 * removing your own report all live under one step, since they're all
 * facets of "reporting the passcode").
 */
interface Step {
  text: string;
  subitems?: string[];
}

interface LandingContent {
  htmlLang: string;
  metaDescription: string;
  eyebrow: string;
  title: string;
  tagline: string;
  ctaLabel: string;
  navAbout: string;
  navHowItWorks: string;
  navCommands: string;
  aboutHeading: string;
  aboutBody: string[];
  howHeading: string;
  steps: Step[];
  commandsHeading: string;
  commandsIntro: string;
  commandGroups: CommandGroup[];
  footerLanguages: string;
  footerSource: string;
}

const en: LandingContent = {
  htmlLang: "en",
  metaDescription:
    "A Telegram bot that lets Ingress First Saturday attendees collaboratively assemble their event's passcode in real time.",
  eyebrow: "For Ingress First Saturday",
  title: "IFS Passcode Relay",
  tagline: "Build your event's passcode together, in real time — no more screenshots in a group chat.",
  ctaLabel: "Open @ifs_relay_bot in Telegram",
  navAbout: "What is this",
  navHowItWorks: "How it works",
  navCommands: "Commands",
  aboutHeading: "What is this?",
  aboutBody: [
    "Ingress First Saturday is a recurring in-person event for the mobile game Ingress. During it, players are given the images of a set of portals; visiting each one in the field and inspecting its media reveals one character. Concatenating the characters in the right order produces a passcode redeemable in the in-game store for an IFS item pack.",
    "This bot lets everyone attending a specific IFS report the character they found and the position it belongs to, and keeps a live, shared view of the passcode as it fills in. Several IFS events can run at once — each with its own join code and its own group of participants.",
  ],
  howHeading: "How it works",
  steps: [
    { text: "Whoever organizes the passcode relay creates an event with /newevent — the creator is joined automatically as its administrator, and gets a ready-to-paste invite message to forward to attendees." },
    { text: "Every other attendee sends /join <code> to the bot, which also invites them to run /sharetext and help spread the word." },
    {
      text: "Found something? Report it by sending its position and value, no command needed:",
      subitems: [
        '"6 GLYPH" records that position 6 is GLYPH.',
        "Made a mistake and want to correct your own report? Resend the same position with the right value — no confirmation needed, and the bot reminds you what the old value was in case you want to undo it.",
        'Reported to the wrong position, or don\'t actually know it yet? Send just the position with nothing after it, e.g. "6", to remove your own report there.',
      ],
    },
    { text: "If two different people report different values for the same position, both are kept and shown as separate possibilities — until the event's administrator settles it with /resolve." },
    { text: "Full agreement isn't the same as verified: the event can only be closed once its administrator has actually tested a passcode in-game and confirmed it with /verify, which then sends the final passcode to every participant." },
  ],
  commandsHeading: "Commands",
  commandsIntro: "Every player sees these in their own language, set once with /language.",
  commandGroups: [
    {
      heading: "Getting started",
      rows: [
        { command: "/start, /help", description: "Introduction and command list." },
        { command: "/language <code>", description: "Set your language (en, ca, es, fr, gl, eu)." },
      ],
    },
    {
      heading: "Events",
      rows: [
        {
          command: "/newevent <name> [| <pattern>]",
          description: `Create a new IFS event and get its join code; joins you automatically and marks you trusted. Confirms first if your current event is still unresolved (declining creates nothing); that one is handed off first. The pattern is optional (default ${DEFAULT_PATTERN}); to set your own, type the name, then a "|", then the pattern using X for a letter, 9 for a digit and * for a whole word, e.g. "/newevent Barcelona 2026-08 | XXX99*999XX".`,
        },
        { command: "/join <code>", description: "Join an event — confirms first only if your current event is still unresolved; reopens one closed with no administrator under you, instead of rejecting the code." },
        { command: "/leave", description: "Leave your current event. If you're the administrator, another participant automatically takes over (trusted ones first, then whoever's contributed the most), or the event closes as unfinished if no one is eligible — creating or joining a different event hands off the same way." },
        { command: "/current", description: "Show your current event, its administrator and participant count." },
        { command: "/sharetext [code] [lang]", description: "(Re)get the invite message, defaulting to your current event and own language." },
        { command: "/events", description: "List every event you've been part of, current or past." },
      ],
    },
    {
      heading: "Reporting the passcode",
      rows: [
        { command: '"<position> <value>"', description: "Report the value found at a position." },
        { command: '"<position>" (no value)', description: "Remove your own report at that position, if any." },
        {
          command: "/status",
          description: "Show the current state of the passcode on demand, and move future live updates to this new message.",
        },
      ],
    },
    {
      heading: "For the event's administrator",
      rows: [
        { command: "/resolve <position> [<value>]", description: "Pick the correct value when there's a disagreement; with no value, lists reported values (with trusted-supporter breakdown) as tap-to-resolve buttons." },
        { command: "/resolve", description: "Walk through every position still in disagreement, one at a time; once none are left, points the administrator at /verify — consensus alone never closes the event." },
        { command: "/unresolve <position>", description: "Reopen a resolved position." },
        { command: "/trust, /troll, /untrust <user>", description: "Moderate a participant's contributions; trusted support is called out in /resolve's candidate lists." },
        { command: "/kick <user>", description: "Remove a participant from the event." },
        { command: "/promote <user>", description: "Hand the administrator role to another participant already in the event; marks them trusted too, the same way /newevent does for its own administrator." },
        { command: "/claim", description: "Try to take over as administrator if the current one has gone quiet for 30+ minutes; they get 5 minutes to accept, decline, or not respond before it goes through." },
        { command: "/verify <passcode>", description: "The only way to close an event: paste a passcode confirmed correct at the game's redeem screen; resolves every position from it at once, freezes the event and announces the final passcode to everyone." },
      ],
    },
  ],
  footerLanguages: "Available in English, Català, Castellano, Français, Galego and Euskara.",
  footerSource: "Source on GitHub",
};

const ca: LandingContent = {
  htmlLang: "ca",
  metaDescription:
    "Un bot de Telegram que permet als assistents a un Ingress First Saturday construir el passcode de l'esdeveniment en temps real.",
  eyebrow: "Per a l'Ingress First Saturday",
  title: "IFS Passcode Relay",
  tagline: "Construeix el passcode del teu esdeveniment entre tots, en temps real — sense captures de pantalla en un grup de xat.",
  ctaLabel: "Obre @ifs_relay_bot a Telegram",
  navAbout: "Què és això",
  navHowItWorks: "Com funciona",
  navCommands: "Comandes",
  aboutHeading: "Què és això?",
  aboutBody: [
    "Ingress First Saturday és un esdeveniment presencial recurrent del joc mòbil Ingress. Durant l'esdeveniment, es mostren als jugadors les imatges d'una sèrie de portals; visitar-los sobre el terreny i inspeccionar-ne el contingut multimèdia revela un caràcter. Concatenant els caràcters en l'ordre correcte s'obté un passcode bescanviable a la botiga del joc per un paquet d'objectes de l'IFS.",
    "Aquest bot permet a tothom qui assisteix a un IFS concret reportar quin caràcter ha trobat i a quina posició correspon, i manté una vista compartida i en viu del passcode a mesura que s'omple. Poden haver-hi diversos IFS en marxa alhora — cadascun amb el seu propi codi d'accés i el seu propi grup de participants.",
  ],
  howHeading: "Com funciona",
  steps: [
    { text: "Qui organitza el relleu de passcode crea un esdeveniment amb /newevent — qui el crea s'hi uneix automàticament com a administrador/a, i rep un text d'invitació llest per reenviar als assistents." },
    { text: "La resta d'assistents envien /join <codi> al bot, que també els convida a executar /sharetext per ajudar a difondre'l." },
    {
      text: "Has trobat alguna cosa? Reporta-ho enviant la posició i el valor, sense cap comanda:",
      subitems: [
        '"6 GLYPH" registra que la posició 6 és GLYPH.',
        "T'has equivocat i vols corregir el teu propi report? Torna a enviar la mateixa posició amb el valor correcte — no cal confirmació, i el bot et recorda quin era el valor anterior per si el vols desfer.",
        'Has reportat a la posició equivocada, o encara no la coneixes de veritat? Envia només la posició sense res després, p. ex. "6", per eliminar el teu report allà.',
      ],
    },
    { text: "Si dues persones diferents reporten valors diferents per a la mateixa posició, totes dues es conserven i es mostren com a possibilitats separades — fins que qui administra l'esdeveniment ho resol amb /resolve." },
    { text: "L'acord total no és el mateix que verificat: l'esdeveniment només es pot tancar un cop qui l'administra ha provat de veritat un passcode al joc i l'ha confirmat amb /verify, que aleshores envia el passcode final a tots els participants." },
  ],
  commandsHeading: "Comandes",
  commandsIntro: "Cada jugador les veu en el seu propi idioma, establert un cop amb /language.",
  commandGroups: [
    {
      heading: "Per començar",
      rows: [
        { command: "/start, /help", description: "Introducció i llista de comandes." },
        { command: "/language <codi>", description: "Estableix el teu idioma (en, ca, es, fr, gl, eu)." },
      ],
    },
    {
      heading: "Esdeveniments",
      rows: [
        {
          command: "/newevent <nom> [| <patró>]",
          description: `Crea un nou esdeveniment IFS i n'obté el codi d'accés; t'hi uneix automàticament i et marca com a de confiança. Demana confirmació primer si el teu esdeveniment actual encara no està resolt (dir que no no crea res); aquell es traspassa primer. El patró és opcional (per defecte ${DEFAULT_PATTERN}); per posar-ne un de propi, escriu el nom, després un "|", i després el patró fent servir X per a una lletra, 9 per a un número i * per a una paraula sencera, p. ex. "/newevent Barcelona 2026-08 | XXX99*999XX".`,
        },
        { command: "/join <codi>", description: "Uneix-te a un esdeveniment — demana confirmació només si el teu esdeveniment actual encara no està resolt; un de tancat sense administrador es reobre sota teu en comptes de rebutjar-se." },
        { command: "/leave", description: "Surt de l'esdeveniment actual. Si ets qui l'administra, un altre participant assumeix el rol automàticament (primer els de confiança, si no qui hagi aportat més), o es tanca com a inacabat si no hi ha ningú apte — crear-ne o unir-te a un altre esdeveniment traspassa el rol igualment." },
        { command: "/current", description: "Mostra l'esdeveniment actual, qui l'administra i el nombre de participants." },
        { command: "/sharetext [codi] [idioma]", description: "(Re)obté el text d'invitació, per defecte del teu esdeveniment actual i el teu idioma." },
        { command: "/events", description: "Llista tots els esdeveniments en què has participat, actuals o passats." },
      ],
    },
    {
      heading: "Reportar el passcode",
      rows: [
        { command: '"<posició> <valor>"', description: "Reporta el valor trobat en una posició." },
        { command: '"<posició>" (sense valor)', description: "Elimina el teu propi report en aquella posició, si n'hi ha." },
        {
          command: "/status",
          description: "Mostra l'estat actual del passcode quan ho vulguis, i trasllada aquí les properes actualitzacions en directe.",
        },
      ],
    },
    {
      heading: "Per a qui administra l'esdeveniment",
      rows: [
        { command: "/resolve <posició> [<valor>]", description: "Tria el valor correcte quan hi ha discrepància; sense valor, llista els valors reportats (amb el desglossament de suports de confiança) com a botons per resoldre." },
        { command: "/resolve", description: "Repassa totes les posicions encara en discrepància, una per una; quan ja no en queda cap, remet a /verify — el consens per si sol mai tanca l'esdeveniment." },
        { command: "/unresolve <posició>", description: "Reobre una posició resolta." },
        { command: "/trust, /troll, /untrust <usuari>", description: "Modera les aportacions d'un participant; el suport de confiança es destaca a les llistes de candidats de /resolve." },
        { command: "/kick <usuari>", description: "Expulsa un participant de l'esdeveniment." },
        { command: "/promote <usuari>", description: "Cedeix el rol d'administrador/a a un altre participant ja unit a l'esdeveniment; també el marca de confiança, igual que /newevent fa amb qui crea l'esdeveniment." },
        { command: "/claim", description: "Intenta assumir el càrrec d'administrador si l'actual porta 30+ minuts inactiu; té 5 minuts per acceptar-ho, rebutjar-ho o no respondre abans que es faci efectiu." },
        { command: "/verify <passcode>", description: "L'única manera de tancar un esdeveniment: enganxa un passcode confirmat correcte a la pantalla de bescanvi del joc; resol totes les posicions a partir d'ell alhora, congela l'esdeveniment i anuncia el passcode final a tothom." },
      ],
    },
  ],
  footerLanguages: "Disponible en català, anglès, castellà, francès, gallec i basc.",
  footerSource: "Codi font a GitHub",
};

const es: LandingContent = {
  htmlLang: "es",
  metaDescription:
    "Un bot de Telegram que permite a los asistentes a un Ingress First Saturday construir el passcode del evento en tiempo real.",
  eyebrow: "Para el Ingress First Saturday",
  title: "IFS Passcode Relay",
  tagline: "Construye el passcode de tu evento entre todos, en tiempo real — sin capturas de pantalla en un grupo de chat.",
  ctaLabel: "Abre @ifs_relay_bot en Telegram",
  navAbout: "Qué es esto",
  navHowItWorks: "Cómo funciona",
  navCommands: "Comandos",
  aboutHeading: "¿Qué es esto?",
  aboutBody: [
    "Ingress First Saturday es un evento presencial recurrente del juego móvil Ingress. Durante el evento, se muestran a los jugadores las imágenes de una serie de portales; visitarlos sobre el terreno e inspeccionar su contenido multimedia revela un carácter. Concatenando los caracteres en el orden correcto se obtiene un passcode canjeable en la tienda del juego por un paquete de objetos del IFS.",
    "Este bot permite a todos los asistentes a un IFS concreto reportar qué carácter han encontrado y en qué posición corresponde, y mantiene una vista compartida y en vivo del passcode a medida que se completa. Puede haber varios IFS en marcha a la vez — cada uno con su propio código de acceso y su propio grupo de participantes.",
  ],
  howHeading: "Cómo funciona",
  steps: [
    { text: "Quien organiza el relevo de passcode crea un evento con /newevent — quien lo crea se une automáticamente como su administrador, y recibe un texto de invitación listo para reenviar a los asistentes." },
    { text: "El resto de asistentes envía /join <código> al bot, que también les invita a ejecutar /sharetext para ayudar a difundirlo." },
    {
      text: "¿Has encontrado algo? Repórtalo enviando la posición y el valor, sin ningún comando:",
      subitems: [
        '"6 GLYPH" registra que la posición 6 es GLYPH.',
        "¿Te has equivocado y quieres corregir tu propio reporte? Vuelve a enviar la misma posición con el valor correcto — no hace falta confirmación, y el bot te recuerda cuál era el valor anterior por si quieres deshacerlo.",
        '¿Has reportado en la posición equivocada, o todavía no la conoces de verdad? Envía solo la posición sin nada después, p. ej. "6", para eliminar tu reporte ahí.',
      ],
    },
    { text: "Si dos personas distintas reportan valores distintos para la misma posición, ambos se conservan y se muestran como posibilidades separadas — hasta que quien administra el evento lo resuelve con /resolve." },
    { text: "El acuerdo total no es lo mismo que verificado: el evento solo se puede cerrar cuando quien lo administra ha probado de verdad un passcode en el juego y lo ha confirmado con /verify, que entonces envía el passcode final a todos los participantes." },
  ],
  commandsHeading: "Comandos",
  commandsIntro: "Cada jugador los ve en su propio idioma, establecido una vez con /language.",
  commandGroups: [
    {
      heading: "Para empezar",
      rows: [
        { command: "/start, /help", description: "Introducción y lista de comandos." },
        { command: "/language <código>", description: "Establece tu idioma (en, ca, es, fr, gl, eu)." },
      ],
    },
    {
      heading: "Eventos",
      rows: [
        {
          command: "/newevent <nombre> [| <patrón>]",
          description: `Crea un nuevo evento IFS y obtiene su código de acceso; te une automáticamente y te marca como de confianza. Pide confirmación primero si tu evento actual todavía no está resuelto (decir que no no crea nada); ese se traspasa antes. El patrón es opcional (por defecto ${DEFAULT_PATTERN}); para poner uno propio, escribe el nombre, luego un "|", y luego el patrón usando X para una letra, 9 para un número y * para una palabra entera, p. ej. "/newevent Barcelona 2026-08 | XXX99*999XX".`,
        },
        { command: "/join <código>", description: "Únete a un evento — pide confirmación solo si tu evento actual todavía no está resuelto; uno cerrado sin administrador se reabre bajo tu cargo en vez de rechazarse." },
        { command: "/leave", description: "Sal del evento actual. Si eres quien lo administra, otro participante asume el rol automáticamente (primero los de confianza, si no quien más haya aportado), o se cierra como inacabado si no hay nadie apto — crear o unirte a otro evento traspasa el rol igualmente." },
        { command: "/current", description: "Muestra el evento actual, quién lo administra y el número de participantes." },
        { command: "/sharetext [código] [idioma]", description: "(Re)obtén el texto de invitación, por defecto de tu evento actual y tu idioma." },
        { command: "/events", description: "Lista todos los eventos en los que has participado, actuales o pasados." },
      ],
    },
    {
      heading: "Reportar el passcode",
      rows: [
        { command: '"<posición> <valor>"', description: "Reporta el valor encontrado en una posición." },
        { command: '"<posición>" (sin valor)', description: "Elimina tu propio reporte en esa posición, si existe." },
        {
          command: "/status",
          description: "Muestra el estado actual del passcode cuando quieras, y traslada aquí las próximas actualizaciones en directo.",
        },
      ],
    },
    {
      heading: "Para quien administra el evento",
      rows: [
        { command: "/resolve <posición> [<valor>]", description: "Elige el valor correcto cuando hay discrepancia; sin valor, lista los valores reportados (con el desglose de apoyos de confianza) como botones para resolver." },
        { command: "/resolve", description: "Repasa todas las posiciones todavía en discrepancia, una por una; cuando ya no queda ninguna, remite a /verify — el consenso por sí solo nunca cierra el evento." },
        { command: "/unresolve <posición>", description: "Reabre una posición resuelta." },
        { command: "/trust, /troll, /untrust <usuario>", description: "Modera las aportaciones de un participante; el apoyo de confianza se destaca en las listas de candidatos de /resolve." },
        { command: "/kick <usuario>", description: "Expulsa a un participante del evento." },
        { command: "/promote <usuario>", description: "Cede el rol de administrador a otro participante ya unido al evento; también lo marca de confianza, igual que /newevent hace con quien crea el evento." },
        { command: "/claim", description: "Intenta asumir el cargo de administrador si el actual lleva 30+ minutos inactivo; tiene 5 minutos para aceptarlo, rechazarlo o no responder antes de que se haga efectivo." },
        { command: "/verify <passcode>", description: "La única forma de cerrar un evento: pega un passcode confirmado correcto en la pantalla de canje del juego; resuelve todas las posiciones a partir de él a la vez, congela el evento y anuncia el passcode final a todos." },
      ],
    },
  ],
  footerLanguages: "Disponible en español, inglés, catalán, francés, gallego y euskera.",
  footerSource: "Código fuente en GitHub",
};

const fr: LandingContent = {
  htmlLang: "fr",
  metaDescription:
    "Un bot Telegram qui permet aux participants d'un Ingress First Saturday de construire le passcode de l'événement en temps réel.",
  eyebrow: "Pour l'Ingress First Saturday",
  title: "IFS Passcode Relay",
  tagline: "Construisez le passcode de votre événement à plusieurs, en temps réel — plus de captures d'écran dans un groupe.",
  ctaLabel: "Ouvrir @ifs_relay_bot dans Telegram",
  navAbout: "De quoi s'agit-il",
  navHowItWorks: "Comment ça marche",
  navCommands: "Commandes",
  aboutHeading: "De quoi s'agit-il ?",
  aboutBody: [
    "Ingress First Saturday est un événement en présentiel récurrent du jeu mobile Ingress. Pendant l'événement, les joueurs reçoivent les images d'une série de portails ; les visiter sur le terrain et examiner leur contenu multimédia révèle un caractère. En concaténant les caractères dans le bon ordre, on obtient un passcode échangeable dans la boutique du jeu contre un pack d'objets IFS.",
    "Ce bot permet à tous les participants d'un IFS donné de signaler le caractère trouvé et la position correspondante, et maintient une vue partagée et en direct du passcode au fur et à mesure qu'il se complète. Plusieurs IFS peuvent se dérouler en même temps — chacun avec son propre code d'accès et son propre groupe de participants.",
  ],
  howHeading: "Comment ça marche",
  steps: [
    { text: "La personne qui organise le relais de passcode crée un événement avec /newevent — elle y est inscrite automatiquement en tant qu'administrateur, et reçoit un texte d'invitation prêt à transférer aux participants." },
    { text: "Chaque autre participant envoie /join <code> au bot, qui l'invite aussi à lancer /sharetext pour aider à le faire connaître." },
    {
      text: "Vous avez trouvé quelque chose ? Signalez-le en envoyant la position et la valeur, sans aucune commande :",
      subitems: [
        '« 6 GLYPH » signale que la position 6 est GLYPH.',
        "Une erreur et vous voulez corriger votre propre signalement ? Renvoyez simplement la même position avec la bonne valeur — aucune confirmation nécessaire, et le bot vous rappelle quelle était l'ancienne valeur au cas où vous voudriez l'annuler.",
        'Vous avez signalé la mauvaise position, ou vous ne la connaissez pas encore vraiment ? Envoyez juste la position sans rien après, ex. « 6 », pour supprimer votre signalement à cet endroit.',
      ],
    },
    { text: "Si deux personnes différentes signalent des valeurs différentes pour la même position, les deux sont conservées et affichées comme des possibilités distinctes — jusqu'à ce que la personne qui administre l'événement tranche avec /resolve." },
    { text: "Un accord total n'est pas la même chose qu'une vérification : l'événement ne peut être clôturé qu'une fois que son administrateur a réellement testé un passcode en jeu et l'a confirmé avec /verify, qui envoie alors le passcode final à tous les participants." },
  ],
  commandsHeading: "Commandes",
  commandsIntro: "Chaque joueur les voit dans sa propre langue, définie une fois avec /language.",
  commandGroups: [
    {
      heading: "Pour commencer",
      rows: [
        { command: "/start, /help", description: "Introduction et liste des commandes." },
        { command: "/language <code>", description: "Définit votre langue (en, ca, es, fr, gl, eu)." },
      ],
    },
    {
      heading: "Événements",
      rows: [
        {
          command: "/newevent <nom> [| <modèle>]",
          description: `Crée un nouvel événement IFS et obtient son code d'accès ; vous y inscrit automatiquement et vous marque fiable. Demande confirmation d'abord si votre événement actuel n'est pas encore résolu (refuser ne crée rien) ; il est transmis d'abord. Le modèle est optionnel (par défaut ${DEFAULT_PATTERN}) ; pour en définir un, tapez le nom, puis un « | », puis le modèle en utilisant X pour une lettre, 9 pour un chiffre et * pour un mot entier, ex. « /newevent Barcelona 2026-08 | XXX99*999XX ».`,
        },
        { command: "/join <code>", description: "Rejoindre un événement — demande confirmation seulement si votre événement actuel n'est pas encore résolu ; un événement clôturé sans administrateur se rouvre sous votre responsabilité au lieu d'être rejeté." },
        { command: "/leave", description: "Quitter l'événement actuel. Si vous êtes l'administrateur, un autre participant reprend automatiquement le rôle (les fiables en priorité, sinon celui ayant le plus contribué), ou l'événement est clôturé comme inachevé si personne n'est éligible — créer ou rejoindre un autre événement transmet le rôle de la même façon." },
        { command: "/current", description: "Affiche l'événement actuel, son administrateur et le nombre de participants." },
        { command: "/sharetext [code] [langue]", description: "(Re)obtient le texte d'invitation, par défaut de votre événement actuel et de votre langue." },
        { command: "/events", description: "Liste tous les événements auxquels vous avez participé, actuels ou passés." },
      ],
    },
    {
      heading: "Signaler le passcode",
      rows: [
        { command: '"<position> <valeur>"', description: "Signale la valeur trouvée à une position." },
        { command: '"<position>" (sans valeur)', description: "Supprime votre propre signalement à cette position, s'il existe." },
        {
          command: "/status",
          description: "Affiche l'état actuel du passcode à la demande, et y déplace les prochaines mises à jour en direct.",
        },
      ],
    },
    {
      heading: "Pour la personne qui administre l'événement",
      rows: [
        { command: "/resolve <position> [<valeur>]", description: "Choisit la valeur correcte en cas de désaccord ; sans valeur, liste les valeurs signalées (avec la répartition des soutiens fiables) sous forme de boutons à résoudre." },
        { command: "/resolve", description: "Parcourt toutes les positions encore en désaccord, une par une ; une fois qu'il n'en reste plus, renvoie vers /verify — le consensus seul ne clôture jamais l'événement." },
        { command: "/unresolve <position>", description: "Rouvre une position résolue." },
        { command: "/trust, /troll, /untrust <utilisateur>", description: "Modère les contributions d'un participant ; le soutien fiable est mis en avant dans les listes de candidats de /resolve." },
        { command: "/kick <utilisateur>", description: "Exclut un participant de l'événement." },
        { command: "/promote <utilisateur>", description: "Transfère le rôle d'administrateur à un autre participant déjà dans l'événement ; le marque aussi comme fiable, comme /newevent le fait pour son propre administrateur." },
        { command: "/claim", description: "Tente de reprendre le rôle d'administrateur si l'actuel est inactif depuis 30+ minutes ; il a 5 minutes pour accepter, refuser ou ne pas répondre avant que ça se fasse." },
        { command: "/verify <passcode>", description: "La seule façon de clôturer un événement : colle un passcode confirmé correct à l'écran d'échange du jeu ; résout toutes les positions à partir de lui d'un coup, fige l'événement et annonce le passcode final à tout le monde." },
      ],
    },
  ],
  footerLanguages: "Disponible en français, anglais, catalan, espagnol, galicien et basque.",
  footerSource: "Code source sur GitHub",
};

const gl: LandingContent = {
  htmlLang: "gl",
  metaDescription:
    "Un bot de Telegram que permite aos asistentes a un Ingress First Saturday construír o passcode do evento en tempo real.",
  eyebrow: "Para o Ingress First Saturday",
  title: "IFS Passcode Relay",
  tagline: "Constrúe o passcode do teu evento entre todos, en tempo real — sen capturas de pantalla nun grupo de chat.",
  ctaLabel: "Abre @ifs_relay_bot en Telegram",
  navAbout: "Que é isto",
  navHowItWorks: "Como funciona",
  navCommands: "Comandos",
  aboutHeading: "Que é isto?",
  aboutBody: [
    "Ingress First Saturday é un evento presencial recorrente do xogo móbil Ingress. Durante o evento, amósanselles aos xogadores as imaxes dunha serie de portais; visitalos sobre o terreo e inspeccionar o seu contido multimedia revela un carácter. Concatenando os caracteres na orde correcta obtense un passcode canxeable na tenda do xogo por un paquete de obxectos do IFS.",
    "Este bot permite a todos os asistentes a un IFS concreto reportar que carácter atoparon e en que posición corresponde, e mantén unha vista compartida e en directo do passcode a medida que se completa. Pode haber varios IFS en marcha á vez — cada un co seu propio código de acceso e o seu propio grupo de participantes.",
  ],
  howHeading: "Como funciona",
  steps: [
    { text: "Quen organiza o relevo de passcode crea un evento con /newevent — quen o crea únese automaticamente como o seu administrador, e recibe un texto de convite listo para reenviar aos asistentes." },
    { text: "O resto de asistentes envía /join <código> ao bot, que tamén os convida a executar /sharetext para axudar a difundilo." },
    {
      text: "Atopaches algo? Repórtao enviando a posición e o valor, sen ningún comando:",
      subitems: [
        '"6 GLYPH" rexistra que a posición 6 é GLYPH.',
        "Equivocácheste e queres corrixir o teu propio reporte? Volve enviar a mesma posición co valor correcto — non fai falta confirmación, e o bot lémbrache cal era o valor anterior por se o queres desfacer.",
        'Reportaches na posición equivocada, ou aínda non a coñeces de verdade? Envía só a posición sen nada despois, p. ex. "6", para eliminar o teu reporte alí.',
      ],
    },
    { text: "Se dúas persoas distintas reportan valores distintos para a mesma posición, ambos consérvanse e móstranse como posibilidades separadas — ata que quen administra o evento o resolve con /resolve." },
    { text: "O acordo total non é o mesmo que verificado: o evento só se pode pechar cando quen o administra probou de verdade un passcode no xogo e o confirmou con /verify, que entón envía o passcode final a todos os participantes." },
  ],
  commandsHeading: "Comandos",
  commandsIntro: "Cada xogador vainos ver no seu propio idioma, establecido unha vez con /language.",
  commandGroups: [
    {
      heading: "Para empezar",
      rows: [
        { command: "/start, /help", description: "Introdución e lista de comandos." },
        { command: "/language <código>", description: "Establece o teu idioma (en, ca, es, fr, gl, eu)." },
      ],
    },
    {
      heading: "Eventos",
      rows: [
        {
          command: "/newevent <nome> [| <patrón>]",
          description: `Crea un novo evento IFS e obtén o seu código de acceso; únete automaticamente e márcate como de confianza. Pide confirmación primeiro se o teu evento actual aínda non está resolto (dicir que non non crea nada); ese trasládase antes. O patrón é opcional (por defecto ${DEFAULT_PATTERN}); para poñer un propio, escribe o nome, despois un "|", e despois o patrón usando X para unha letra, 9 para un díxito e * para unha palabra enteira, p. ex. "/newevent Barcelona 2026-08 | XXX99*999XX".`,
        },
        { command: "/join <código>", description: "Únete a un evento — pide confirmación só se o teu evento actual aínda non está resolto; un pechado sen administrador reábrese baixo o teu cargo en vez de rexeitarse." },
        { command: "/leave", description: "Sae do evento actual. Se es quen o administra, outro participante asume o rol automaticamente (primeiro os de confianza, se non quen máis achegase), ou péchase como inacabado se non hai ninguén apto — crear ou unirte a outro evento traslada o rol igualmente." },
        { command: "/current", description: "Mostra o evento actual, quen o administra e o número de participantes." },
        { command: "/sharetext [código] [idioma]", description: "(Re)obtén o texto de convite, por defecto do teu evento actual e o teu idioma." },
        { command: "/events", description: "Lista todos os eventos nos que participaches, actuais ou pasados." },
      ],
    },
    {
      heading: "Reportar o passcode",
      rows: [
        { command: '"<posición> <valor>"', description: "Reporta o valor atopado nunha posición." },
        { command: '"<posición>" (sen valor)', description: "Elimina o teu propio reporte nesa posición, se existe." },
        {
          command: "/status",
          description: "Mostra o estado actual do passcode cando queiras, e traslada aquí as próximas actualizacións en directo.",
        },
      ],
    },
    {
      heading: "Para quen administra o evento",
      rows: [
        { command: "/resolve <posición> [<valor>]", description: "Escolle o valor correcto cando hai discrepancia; sen valor, lista os valores reportados (co desglose de apoios de confianza) como botóns para resolver." },
        { command: "/resolve", description: "Repasa todas as posicións aínda en discrepancia, unha por unha; cando xa non queda ningunha, remite a /verify — o consenso por si só nunca pecha o evento." },
        { command: "/unresolve <posición>", description: "Reabre unha posición resolta." },
        { command: "/trust, /troll, /untrust <usuario>", description: "Modera as achegas dun participante; o apoio de confianza destácase nas listas de candidatos de /resolve." },
        { command: "/kick <usuario>", description: "Expulsa un participante do evento." },
        { command: "/promote <usuario>", description: "Cede o rol de administrador a outro participante xa unido ao evento; tamén o marca de confianza, igual que /newevent fai con quen crea o evento." },
        { command: "/claim", description: "Intenta asumir o cargo de administrador se o actual leva 30+ minutos inactivo; ten 5 minutos para aceptalo, rexeitalo ou non responder antes de que se faga efectivo." },
        { command: "/verify <passcode>", description: "A única forma de pechar un evento: pega un passcode confirmado correcto na pantalla de canxeo do xogo; resolve todas as posicións a partir del á vez, conxela o evento e anuncia o passcode final a todos." },
      ],
    },
  ],
  footerLanguages: "Dispoñible en galego, inglés, catalán, castelán, francés e éuscaro.",
  footerSource: "Código fonte en GitHub",
};

const eu: LandingContent = {
  htmlLang: "eu",
  metaDescription:
    "Ingress First Saturday bateko partaideei ekitaldiaren pasakodea denbora errealean elkarlanean osatzen laguntzen dien Telegram bot bat.",
  eyebrow: "Ingress First Saturday-rako",
  title: "IFS Passcode Relay",
  tagline: "Osatu zure ekitaldiaren pasakodea guztien artean, denbora errealean — talde-txat batean pantaila-argazkirik gehiago gabe.",
  ctaLabel: "Ireki @ifs_relay_bot Telegramen",
  navAbout: "Zer da hau",
  navHowItWorks: "Nola funtzionatzen du",
  navCommands: "Komandoak",
  aboutHeading: "Zer da hau?",
  aboutBody: [
    "Ingress First Saturday Ingress mugikorreko jokoaren aldizkako aurrez aurreko ekitaldi bat da. Ekitaldian zehar, jokalariei portal sorta baten irudiak erakusten zaizkie; horiek lekuan bertan bisitatu eta euren multimedia-edukia aztertzeak karaktere bat agerian jartzen du. Karaktereak ordena zuzenean kateatuz, jokoaren dendan IFS gai-sorta baten truke kanjeatu daitekeen pasakode bat lortzen da.",
    "Bot honek IFS zehatz batera doazen guztiei aurkitutako karakterea eta dagokion posizioa jakinarazteko aukera ematen die, eta pasakodearen ikuspegi partekatu eta zuzeneko bat mantentzen du bete ahala. Aldi berean hainbat IFS ekitaldi egon daitezke martxan — bakoitzak bere batzeko kodea eta bere partaide-taldea dituela.",
  ],
  howHeading: "Nola funtzionatzen du",
  steps: [
    { text: "Pasakode-errelebua antolatzen duenak /newevent bidez sortzen du ekitaldia — sortzailea automatikoki batzen zaio, haren administratzaile gisa, eta partaideei birbidaltzeko gonbidapen-testu bat jasotzen du." },
    { text: "Gainerako partaideek /join <kodea> bidaltzen diote botari, honek /sharetext exekutatzera ere gonbidatzen dituelarik hura zabaltzen laguntzeko." },
    {
      text: "Zerbait aurkitu duzu? Jakinarazi posizioa eta balioa bidaliz, komandorik gabe:",
      subitems: [
        '"6 GLYPH" bidaliz, 6 posizioa GLYPH dela erregistratzen da.',
        "Oker egin duzu eta zure jakinarazpena zuzendu nahi duzu? Bidali posizio bera balio zuzenarekin berriro — ez da berrespenik behar, eta botak aurreko balioa zein zen gogorarazten dizu, atzera bota nahi baduzu.",
        'Posizio okerrean jakinarazi duzu, edo oraindik ez dakizu ziur? Bidali posizioa bakarrik, ondoren ezer gabe, adib. "6", zure jakinarazpena handik kentzeko.',
      ],
    },
    { text: "Bi pertsona ezberdinek posizio berarentzat balio ezberdinak jakinarazten badituzte, biak mantentzen dira eta aukera bereizi gisa erakusten dira — ekitaldiaren administratzaileak /resolve bidez erabaki arte." },
    { text: "Adostasun osoa ez da egiaztatzearen gauza bera: ekitaldia bakarrik itxi daiteke administratzaileak jokoan pasakode bat benetan probatu eta /verify bidez berretsi duenean, orduan azken pasakodea partaide guztiei bidaltzen zaielarik." },
  ],
  commandsHeading: "Komandoak",
  commandsIntro: "Jokalari bakoitzak bere hizkuntzan ikusiko ditu, /language bidez behin ezarrita.",
  commandGroups: [
    {
      heading: "Hasteko",
      rows: [
        { command: "/start, /help", description: "Sarrera eta komandoen zerrenda." },
        { command: "/language <kodea>", description: "Zure hizkuntza ezartzen du (en, ca, es, fr, gl, eu)." },
      ],
    },
    {
      heading: "Ekitaldiak",
      rows: [
        {
          command: "/newevent <izena> [| <eredua>]",
          description: `IFS ekitaldi berri bat sortzen du eta batzeko kodea ematen dizu; automatikoki batzen zaitu eta fidagarritzat markatzen zaitu. Zure uneko ekitaldia oraindik ebatzi gabe badago, lehenik berrespena eskatzen du (ezetz esateak ez du ezer sortzen); hura lehenik lagatzen da. Eredua aukerakoa da (lehenetsia ${DEFAULT_PATTERN}); zeurea ezartzeko, idatzi izena, gero "|" bat, eta gero eredua, X letra baterako, 9 zenbaki baterako eta * hitz oso baterako erabiliz, adib. "/newevent Barcelona 2026-08 | XXX99*999XX".`,
        },
        { command: "/join <kodea>", description: "Ekitaldi batera batzen zaitu — zure uneko ekitaldia oraindik ebatzi gabe badago bakarrik eskatzen du berrespena; administratzailerik gabe itxitako bat zure kargura berrirekitzen da, ukatu ordez." },
        { command: "/leave", description: "Uneko ekitaldia uzten du. Administratzailea bazara, beste partaide batek automatikoki hartzen du rola (lehenik fidagarriak, bestela gehien ekarri duena), edo ekitaldia amaitu gabe ixten da inor egokirik ez badago — beste ekitaldi bat sortu edo horretara batzeak rola berdin lagatzen du." },
        { command: "/current", description: "Uneko ekitaldia, nork administratzen duen eta partaide kopurua erakusten ditu." },
        { command: "/sharetext [kodea] [hizkuntza]", description: "Gonbidapen-testua (berr)eskuratzen du, lehenetsita zure uneko ekitaldia eta zure hizkuntza." },
        { command: "/events", description: "Parte hartu duzun ekitaldi guztiak zerrendatzen ditu, unekoak zein iraganekoak." },
      ],
    },
    {
      heading: "Pasakodea jakinaraztea",
      rows: [
        { command: '"<posizioa> <balioa>"', description: "Posizio batean aurkitutako balioa jakinarazten du." },
        { command: '"<posizioa>" (balio gabe)', description: "Posizio horretan zure jakinarazpena kentzen du, badago." },
        {
          command: "/status",
          description: "Pasakodearen uneko egoera nahi duzunean erakusten du, eta hurrengo zuzeneko eguneraketak hona lekualdatzen ditu.",
        },
      ],
    },
    {
      heading: "Ekitaldia administratzen duenarentzat",
      rows: [
        { command: "/resolve <posizioa> [<balioa>]", description: "Desadostasuna dagoenean balio zuzena aukeratzen du; balio gabe, jakinarazitako balioak (fidagarrien babes-banaketarekin) botoi gisa zerrendatzen ditu, ebazteko." },
        { command: "/resolve", description: "Desadostasunean dauden posizio guztiak banan-banan errepasatzen ditu; bat ere geratzen ez denean, /verify aholkatzen du — adostasunak berak ez du inoiz ekitaldia ixten." },
        { command: "/unresolve <posizioa>", description: "Ebatzitako posizio bat berrirekitzen du." },
        { command: "/trust, /troll, /untrust <erabiltzailea>", description: "Partaide baten ekarpenak moderatzen ditu; babes fidagarria /resolve-ren hautagai-zerrendetan azpimarratzen da." },
        { command: "/kick <erabiltzailea>", description: "Partaide bat ekitaldiatik kanporatzen du." },
        { command: "/promote <erabiltzailea>", description: "Administratzaile rola ekitaldian dagoen beste partaide bati ematen dio; fidagarritzat ere markatzen du, /newevent-ek bere administratzailearekin egiten duen bezala." },
        { command: "/claim", description: "Unekoa 30+ minutu inaktibo egon bada, administratzaile kargua hartzen saiatzen da; 5 minutu ditu onartzeko, ukatzeko edo ez erantzuteko, hori gauzatu aurretik." },
        { command: "/verify <passcode>", description: "Ekitaldi bat ixteko modu bakarra: jokoaren trukatze-pantailan zuzentzat berretsi den pasakode bat itsasten du; hortik posizio guztiak batera ebazten ditu, ekitaldia izoztu eta azken pasakodea guztiei iragartzen die." },
      ],
    },
  ],
  footerLanguages: "Euskaraz, ingelesez, katalanez, gaztelaniaz, frantsesez eta galizieraz eskuragarri.",
  footerSource: "Iturburu-kodea GitHub-en",
};

const content: Record<SupportedLanguage, LandingContent> = { en, ca, es, fr, gl, eu };

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function renderCommand(command: string): string {
  // The literal "<position> <value>" rows use angle brackets as part of
  // the example itself, not a placeholder to escape differently — plain
  // escaping handles both cases correctly.
  return escapeHtml(command);
}

/** Renders the public landing page served at "/", in the given language. */
export function renderLandingPage(lang: SupportedLanguage): string {
  const c = content[lang];

  const stepsHtml = c.steps
    .map((step, i) => {
      const subitemsHtml = step.subitems
        ? `<ul class="substeps">${step.subitems.map((item) => `<li>${escapeHtml(item)}</li>`).join("\n")}</ul>`
        : "";
      return `<li><span class="step-num">${i + 1}</span><span>${escapeHtml(step.text)}${subitemsHtml}</span></li>`;
    })
    .join("\n");

  const groupsHtml = c.commandGroups
    .map(
      (group) => `
      <div class="command-group">
        <h3>${escapeHtml(group.heading)}</h3>
        <dl>
          ${group.rows
            .map(
              (row) => `
          <div class="command-row">
            <dt><code>${renderCommand(row.command)}</code></dt>
            <dd>${escapeHtml(row.description)}</dd>
          </div>`
            )
            .join("\n")}
        </dl>
      </div>`
    )
    .join("\n");

  const aboutHtml = c.aboutBody.map((p) => `<p>${escapeHtml(p)}</p>`).join("\n");

  return `<!doctype html>
<html lang="${c.htmlLang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(c.title)}</title>
<meta name="description" content="${escapeHtml(c.metaDescription)}">
<link rel="icon" type="image/png" href="/logo.png">
<style>
  :root {
    --bg: #f7f5f2;
    --bg-alt: #ffffff;
    --text: #1c1a17;
    --text-muted: #63594d;
    --accent: #0f7a5c;
    --accent-contrast: #ffffff;
    --border: #e4ddd3;
    --code-bg: #efe9e0;
    --shadow: 0 1px 3px rgba(28, 26, 23, 0.06), 0 8px 24px rgba(28, 26, 23, 0.05);
    --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    --font-mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #171512;
      --bg-alt: #201d19;
      --text: #f3efe9;
      --text-muted: #ab9f8e;
      --accent: #35c990;
      --accent-contrast: #0c1512;
      --border: #332e28;
      --code-bg: #2a251f;
      --shadow: 0 1px 3px rgba(0, 0, 0, 0.3), 0 8px 24px rgba(0, 0, 0, 0.35);
    }
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    background: var(--bg);
    color: var(--text);
    font-family: var(--font-sans);
    line-height: 1.6;
  }
  a { color: var(--accent); }
  .wrap { max-width: 760px; margin: 0 auto; padding: 0 20px; }
  header.hero {
    padding: 64px 0 48px;
    text-align: center;
  }
  header.hero img.logo {
    width: 96px;
    height: 96px;
    border-radius: 24px;
    box-shadow: var(--shadow);
    margin-bottom: 20px;
  }
  .eyebrow {
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--accent);
    margin: 0 0 8px;
  }
  h1 {
    font-size: clamp(1.8rem, 4vw, 2.6rem);
    margin: 0 0 12px;
    letter-spacing: -0.01em;
  }
  .tagline {
    font-size: 1.15rem;
    color: var(--text-muted);
    max-width: 46ch;
    margin: 0 auto 28px;
  }
  .cta {
    display: inline-block;
    background: var(--accent);
    color: var(--accent-contrast);
    text-decoration: none;
    font-weight: 600;
    padding: 12px 24px;
    border-radius: 999px;
    box-shadow: var(--shadow);
  }
  nav.toc {
    display: flex;
    justify-content: center;
    gap: 24px;
    padding: 8px 0 40px;
    font-size: 0.95rem;
  }
  nav.toc a { text-decoration: none; color: var(--text-muted); }
  nav.toc a:hover { color: var(--accent); }
  section { padding: 40px 0; border-top: 1px solid var(--border); }
  section h2 { font-size: 1.5rem; margin: 0 0 20px; }
  .steps { list-style: none; margin: 0; padding: 0; display: grid; gap: 16px; }
  .steps > li {
    display: grid;
    grid-template-columns: 32px 1fr;
    gap: 14px;
    align-items: start;
    background: var(--bg-alt);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 14px 16px;
    box-shadow: var(--shadow);
  }
  .step-num {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--accent);
    color: var(--accent-contrast);
    font-weight: 700;
    font-size: 0.9rem;
  }
  .substeps {
    list-style: disc;
    margin: 10px 0 0;
    padding-left: 20px;
    display: grid;
    gap: 6px;
    color: var(--text-muted);
    font-size: 0.95rem;
  }
  .commands-intro { color: var(--text-muted); margin-top: -8px; }
  .command-group { margin-top: 28px; }
  .command-group h3 {
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--text-muted);
    margin: 0 0 12px;
  }
  .command-group dl { margin: 0; }
  .command-row {
    display: grid;
    grid-template-columns: minmax(140px, 260px) 1fr;
    gap: 12px 20px;
    padding: 10px 0;
    border-top: 1px solid var(--border);
  }
  .command-row:first-of-type { border-top: none; }
  .command-row dt, .command-row dd { margin: 0; }
  .command-row code {
    font-family: var(--font-mono);
    background: var(--code-bg);
    padding: 2px 8px;
    border-radius: 6px;
    font-size: 0.85rem;
    white-space: nowrap;
  }
  .command-row dd { color: var(--text-muted); }
  @media (max-width: 520px) {
    .command-row { grid-template-columns: 1fr; }
    .command-row code { white-space: normal; }
  }
  footer {
    padding: 32px 0 64px;
    text-align: center;
    color: var(--text-muted);
    font-size: 0.9rem;
  }
  footer a { color: var(--text-muted); }
  .gh-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .gh-icon { flex: none; }
</style>
</head>
<body>
  <div class="wrap">
    <header class="hero">
      <img class="logo" src="/logo.png" alt="${escapeHtml(c.title)}">
      <p class="eyebrow">${escapeHtml(c.eyebrow)}</p>
      <h1>${escapeHtml(c.title)}</h1>
      <p class="tagline">${escapeHtml(c.tagline)}</p>
      <a class="cta" href="${BOT_URL}">${escapeHtml(c.ctaLabel)}</a>
    </header>

    <nav class="toc">
      <a href="#about">${escapeHtml(c.navAbout)}</a>
      <a href="#how">${escapeHtml(c.navHowItWorks)}</a>
      <a href="#commands">${escapeHtml(c.navCommands)}</a>
    </nav>

    <section id="about">
      <h2>${escapeHtml(c.aboutHeading)}</h2>
      ${aboutHtml}
    </section>

    <section id="how">
      <h2>${escapeHtml(c.howHeading)}</h2>
      <ol class="steps">
        ${stepsHtml}
      </ol>
    </section>

    <section id="commands">
      <h2>${escapeHtml(c.commandsHeading)}</h2>
      <p class="commands-intro">${escapeHtml(c.commandsIntro)}</p>
      ${groupsHtml}
    </section>

    <footer>
      <p>${escapeHtml(c.footerLanguages)}</p>
      <p><a class="gh-link" href="${REPO_URL}">${GITHUB_ICON}${escapeHtml(c.footerSource)}</a></p>
    </footer>
  </div>
</body>
</html>
`;
}
