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
 * facets of "reporting the code").
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
    "This bot lets everyone attending a specific IFS report the character they found and the position it belongs to, and keeps a live, shared view of the code as it fills in. Several IFS events can run at once — each with its own code and its own group of participants.",
  ],
  howHeading: "How it works",
  steps: [
    { text: "Whoever organizes the passcode relay creates an event with /newevent — the creator is joined automatically, and gets a ready-to-paste invite message to forward to attendees." },
    { text: "Every other attendee sends /join <code> to the bot, which also invites them to run /sharetext and help spread the word." },
    {
      text: "Found something? Report it by sending its position and value, no command needed:",
      subitems: [
        '"6 GLYPH" records that position 6 is GLYPH.',
        "Made a mistake and want to correct your own report? Resend the same position with the right value — no confirmation needed, and the bot reminds you what the old value was in case you want to undo it.",
        'Reported to the wrong position, or don\'t actually know it yet? Send just the position with nothing after it, e.g. "6", to remove your own report there.',
      ],
    },
    { text: "If two different people report different values for the same position, both are kept and shown as separate possibilities — until the event's creator settles it with /resolve." },
    { text: "When the event is over, its creator closes it with /closeevent, which sends the final passcode to every participant." },
  ],
  commandsHeading: "Commands",
  commandsIntro: "Every player sees these in their own language, set once with /language.",
  commandGroups: [
    {
      heading: "Getting started",
      rows: [
        { command: "/start, /help", description: "Introduction and command list." },
        { command: "/language <code>", description: "Set your language (en, ca, es, fr)." },
      ],
    },
    {
      heading: "Events",
      rows: [
        {
          command: "/newevent <name> [| <pattern>]",
          description: `Create a new IFS event and get its join code; joins you automatically and marks you trusted. The pattern is optional (default ${DEFAULT_PATTERN}); to set your own, type the name, then a "|", then the pattern using X for a letter, 9 for a digit and * for a whole word, e.g. "/newevent Barcelona 2026-08 | XXX99*999XX".`,
        },
        { command: "/join <code>", description: "Join an event." },
        { command: "/leave", description: "Leave your current event." },
        { command: "/myevent", description: "Show which event you're in." },
        { command: "/sharetext [code] [lang]", description: "(Re)get the invite message, defaulting to your current event and own language." },
        { command: "/events", description: "List the events you've created." },
      ],
    },
    {
      heading: "Reporting the code",
      rows: [
        { command: '"<position> <value>"', description: "Report the value found at a position." },
        { command: '"<position>" (no value)', description: "Remove your own report at that position, if any." },
        {
          command: "/status",
          description: "Show the current state of the code on demand, and move future live updates to this new message.",
        },
      ],
    },
    {
      heading: "For the event's creator",
      rows: [
        { command: "/resolve <position> [<value>]", description: "Pick the correct value when there's a disagreement; with no value, lists reported values (with trusted-supporter breakdown) as tap-to-resolve buttons." },
        { command: "/resolve", description: "Walk through every position still in disagreement, one at a time." },
        { command: "/unresolve <position>", description: "Reopen a resolved position." },
        { command: "/trust, /troll, /untrust <user>", description: "Moderate a participant's contributions; trusted support is called out in /resolve's candidate lists." },
        { command: "/kick <user>", description: "Remove a participant from the event." },
        { command: "/closeevent", description: "Freeze the event and announce the final code to everyone." },
      ],
    },
  ],
  footerLanguages: "Available in English, Català, Castellano and Français.",
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
    "Aquest bot permet a tothom qui assisteix a un IFS concret reportar quin caràcter ha trobat i a quina posició correspon, i manté una vista compartida i en viu del codi a mesura que s'omple. Poden haver-hi diversos IFS en marxa alhora — cadascun amb el seu propi codi i el seu propi grup de participants.",
  ],
  howHeading: "Com funciona",
  steps: [
    { text: "Qui organitza el relleu de passcode crea un esdeveniment amb /newevent — qui el crea s'hi uneix automàticament, i rep un text d'invitació llest per reenviar als assistents." },
    { text: "La resta d'assistents envien /join <codi> al bot, que també els convida a executar /sharetext per ajudar a difondre'l." },
    {
      text: "Has trobat alguna cosa? Reporta-ho enviant la posició i el valor, sense cap comanda:",
      subitems: [
        '"6 GLYPH" registra que la posició 6 és GLYPH.',
        "T'has equivocat i vols corregir el teu propi report? Torna a enviar la mateixa posició amb el valor correcte — no cal confirmació, i el bot et recorda quin era el valor anterior per si el vols desfer.",
        'Has reportat a la posició equivocada, o encara no la coneixes de veritat? Envia només la posició sense res després, p. ex. "6", per eliminar el teu report allà.',
      ],
    },
    { text: "Si dues persones diferents reporten valors diferents per a la mateixa posició, totes dues es conserven i es mostren com a possibilitats separades — fins que qui ha creat l'esdeveniment ho resol amb /resolve." },
    { text: "Quan l'esdeveniment s'acaba, qui l'ha creat el tanca amb /closeevent, que envia el passcode final a tots els participants." },
  ],
  commandsHeading: "Comandes",
  commandsIntro: "Cada jugador les veu en el seu propi idioma, establert un cop amb /language.",
  commandGroups: [
    {
      heading: "Per començar",
      rows: [
        { command: "/start, /help", description: "Introducció i llista de comandes." },
        { command: "/language <codi>", description: "Estableix el teu idioma (en, ca, es, fr)." },
      ],
    },
    {
      heading: "Esdeveniments",
      rows: [
        {
          command: "/newevent <nom> [| <patró>]",
          description: `Crea un nou esdeveniment IFS i n'obté el codi d'accés; t'hi uneix automàticament i et marca com a de confiança. El patró és opcional (per defecte ${DEFAULT_PATTERN}); per posar-ne un de propi, escriu el nom, després un "|", i després el patró fent servir X per a una lletra, 9 per a un número i * per a una paraula sencera, p. ex. "/newevent Barcelona 2026-08 | XXX99*999XX".`,
        },
        { command: "/join <codi>", description: "Uneix-te a un esdeveniment." },
        { command: "/leave", description: "Surt de l'esdeveniment actual." },
        { command: "/myevent", description: "Mostra a quin esdeveniment estàs." },
        { command: "/sharetext [codi] [idioma]", description: "(Re)obté el text d'invitació, per defecte del teu esdeveniment actual i el teu idioma." },
        { command: "/events", description: "Llista els esdeveniments que has creat." },
      ],
    },
    {
      heading: "Reportar el codi",
      rows: [
        { command: '"<posició> <valor>"', description: "Reporta el valor trobat en una posició." },
        { command: '"<posició>" (sense valor)', description: "Elimina el teu propi report en aquella posició, si n'hi ha." },
        {
          command: "/status",
          description: "Mostra l'estat actual del codi quan ho vulguis, i trasllada aquí les properes actualitzacions en directe.",
        },
      ],
    },
    {
      heading: "Per a qui crea l'esdeveniment",
      rows: [
        { command: "/resolve <posició> [<valor>]", description: "Tria el valor correcte quan hi ha discrepància; sense valor, llista els valors reportats (amb el desglossament de suports de confiança) com a botons per resoldre." },
        { command: "/resolve", description: "Repassa totes les posicions encara en discrepància, una per una." },
        { command: "/unresolve <posició>", description: "Reobre una posició resolta." },
        { command: "/trust, /troll, /untrust <usuari>", description: "Modera les aportacions d'un participant; el suport de confiança es destaca a les llistes de candidats de /resolve." },
        { command: "/kick <usuari>", description: "Expulsa un participant de l'esdeveniment." },
        { command: "/closeevent", description: "Congela l'esdeveniment i anuncia el codi final a tothom." },
      ],
    },
  ],
  footerLanguages: "Disponible en català, anglès, castellà i francès.",
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
    "Este bot permite a todos los asistentes a un IFS concreto reportar qué carácter han encontrado y en qué posición corresponde, y mantiene una vista compartida y en vivo del código a medida que se completa. Puede haber varios IFS en marcha a la vez — cada uno con su propio código y su propio grupo de participantes.",
  ],
  howHeading: "Cómo funciona",
  steps: [
    { text: "Quien organiza el relevo de passcode crea un evento con /newevent — quien lo crea se une automáticamente, y recibe un texto de invitación listo para reenviar a los asistentes." },
    { text: "El resto de asistentes envía /join <código> al bot, que también les invita a ejecutar /sharetext para ayudar a difundirlo." },
    {
      text: "¿Has encontrado algo? Repórtalo enviando la posición y el valor, sin ningún comando:",
      subitems: [
        '"6 GLYPH" registra que la posición 6 es GLYPH.',
        "¿Te has equivocado y quieres corregir tu propio reporte? Vuelve a enviar la misma posición con el valor correcto — no hace falta confirmación, y el bot te recuerda cuál era el valor anterior por si quieres deshacerlo.",
        '¿Has reportado en la posición equivocada, o todavía no la conoces de verdad? Envía solo la posición sin nada después, p. ej. "6", para eliminar tu reporte ahí.',
      ],
    },
    { text: "Si dos personas distintas reportan valores distintos para la misma posición, ambos se conservan y se muestran como posibilidades separadas — hasta que quien ha creado el evento lo resuelve con /resolve." },
    { text: "Cuando el evento termina, quien lo ha creado lo cierra con /closeevent, que envía el passcode final a todos los participantes." },
  ],
  commandsHeading: "Comandos",
  commandsIntro: "Cada jugador los ve en su propio idioma, establecido una vez con /language.",
  commandGroups: [
    {
      heading: "Para empezar",
      rows: [
        { command: "/start, /help", description: "Introducción y lista de comandos." },
        { command: "/language <código>", description: "Establece tu idioma (en, ca, es, fr)." },
      ],
    },
    {
      heading: "Eventos",
      rows: [
        {
          command: "/newevent <nombre> [| <patrón>]",
          description: `Crea un nuevo evento IFS y obtiene su código de acceso; te une automáticamente y te marca como de confianza. El patrón es opcional (por defecto ${DEFAULT_PATTERN}); para poner uno propio, escribe el nombre, luego un "|", y luego el patrón usando X para una letra, 9 para un número y * para una palabra entera, p. ej. "/newevent Barcelona 2026-08 | XXX99*999XX".`,
        },
        { command: "/join <código>", description: "Únete a un evento." },
        { command: "/leave", description: "Sal del evento actual." },
        { command: "/myevent", description: "Muestra en qué evento estás." },
        { command: "/sharetext [código] [idioma]", description: "(Re)obtén el texto de invitación, por defecto de tu evento actual y tu idioma." },
        { command: "/events", description: "Lista los eventos que has creado." },
      ],
    },
    {
      heading: "Reportar el código",
      rows: [
        { command: '"<posición> <valor>"', description: "Reporta el valor encontrado en una posición." },
        { command: '"<posición>" (sin valor)', description: "Elimina tu propio reporte en esa posición, si existe." },
        {
          command: "/status",
          description: "Muestra el estado actual del código cuando quieras, y traslada aquí las próximas actualizaciones en directo.",
        },
      ],
    },
    {
      heading: "Para quien crea el evento",
      rows: [
        { command: "/resolve <posición> [<valor>]", description: "Elige el valor correcto cuando hay discrepancia; sin valor, lista los valores reportados (con el desglose de apoyos de confianza) como botones para resolver." },
        { command: "/resolve", description: "Repasa todas las posiciones todavía en discrepancia, una por una." },
        { command: "/unresolve <posición>", description: "Reabre una posición resuelta." },
        { command: "/trust, /troll, /untrust <usuario>", description: "Modera las aportaciones de un participante; el apoyo de confianza se destaca en las listas de candidatos de /resolve." },
        { command: "/kick <usuario>", description: "Expulsa a un participante del evento." },
        { command: "/closeevent", description: "Congela el evento y anuncia el código final a todos." },
      ],
    },
  ],
  footerLanguages: "Disponible en español, inglés, catalán y francés.",
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
    "Ce bot permet à tous les participants d'un IFS donné de signaler le caractère trouvé et la position correspondante, et maintient une vue partagée et en direct du code au fur et à mesure qu'il se complète. Plusieurs IFS peuvent se dérouler en même temps — chacun avec son propre code et son propre groupe de participants.",
  ],
  howHeading: "Comment ça marche",
  steps: [
    { text: "La personne qui organise le relais de passcode crée un événement avec /newevent — elle y est inscrite automatiquement, et reçoit un texte d'invitation prêt à transférer aux participants." },
    { text: "Chaque autre participant envoie /join <code> au bot, qui l'invite aussi à lancer /sharetext pour aider à le faire connaître." },
    {
      text: "Vous avez trouvé quelque chose ? Signalez-le en envoyant la position et la valeur, sans aucune commande :",
      subitems: [
        '« 6 GLYPH » signale que la position 6 est GLYPH.',
        "Une erreur et vous voulez corriger votre propre signalement ? Renvoyez simplement la même position avec la bonne valeur — aucune confirmation nécessaire, et le bot vous rappelle quelle était l'ancienne valeur au cas où vous voudriez l'annuler.",
        'Vous avez signalé la mauvaise position, ou vous ne la connaissez pas encore vraiment ? Envoyez juste la position sans rien après, ex. « 6 », pour supprimer votre signalement à cet endroit.',
      ],
    },
    { text: "Si deux personnes différentes signalent des valeurs différentes pour la même position, les deux sont conservées et affichées comme des possibilités distinctes — jusqu'à ce que la personne qui a créé l'événement tranche avec /resolve." },
    { text: "Une fois l'événement terminé, son créateur le clôture avec /closeevent, ce qui envoie le passcode final à tous les participants." },
  ],
  commandsHeading: "Commandes",
  commandsIntro: "Chaque joueur les voit dans sa propre langue, définie une fois avec /language.",
  commandGroups: [
    {
      heading: "Pour commencer",
      rows: [
        { command: "/start, /help", description: "Introduction et liste des commandes." },
        { command: "/language <code>", description: "Définit votre langue (en, ca, es, fr)." },
      ],
    },
    {
      heading: "Événements",
      rows: [
        {
          command: "/newevent <nom> [| <modèle>]",
          description: `Crée un nouvel événement IFS et obtient son code d'accès ; vous y inscrit automatiquement et vous marque fiable. Le modèle est optionnel (par défaut ${DEFAULT_PATTERN}) ; pour en définir un, tapez le nom, puis un « | », puis le modèle en utilisant X pour une lettre, 9 pour un chiffre et * pour un mot entier, ex. « /newevent Barcelona 2026-08 | XXX99*999XX ».`,
        },
        { command: "/join <code>", description: "Rejoindre un événement." },
        { command: "/leave", description: "Quitter l'événement actuel." },
        { command: "/myevent", description: "Affiche dans quel événement vous êtes." },
        { command: "/sharetext [code] [langue]", description: "(Re)obtient le texte d'invitation, par défaut de votre événement actuel et de votre langue." },
        { command: "/events", description: "Liste les événements que vous avez créés." },
      ],
    },
    {
      heading: "Signaler le code",
      rows: [
        { command: '"<position> <valeur>"', description: "Signale la valeur trouvée à une position." },
        { command: '"<position>" (sans valeur)', description: "Supprime votre propre signalement à cette position, s'il existe." },
        {
          command: "/status",
          description: "Affiche l'état actuel du code à la demande, et y déplace les prochaines mises à jour en direct.",
        },
      ],
    },
    {
      heading: "Pour la personne qui crée l'événement",
      rows: [
        { command: "/resolve <position> [<valeur>]", description: "Choisit la valeur correcte en cas de désaccord ; sans valeur, liste les valeurs signalées (avec la répartition des soutiens fiables) sous forme de boutons à résoudre." },
        { command: "/resolve", description: "Parcourt toutes les positions encore en désaccord, une par une." },
        { command: "/unresolve <position>", description: "Rouvre une position résolue." },
        { command: "/trust, /troll, /untrust <utilisateur>", description: "Modère les contributions d'un participant ; le soutien fiable est mis en avant dans les listes de candidats de /resolve." },
        { command: "/kick <utilisateur>", description: "Exclut un participant de l'événement." },
        { command: "/closeevent", description: "Fige l'événement et annonce le code final à tout le monde." },
      ],
    },
  ],
  footerLanguages: "Disponible en français, anglais, catalan et espagnol.",
  footerSource: "Code source sur GitHub",
};

const content: Record<SupportedLanguage, LandingContent> = { en, ca, es, fr };

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
