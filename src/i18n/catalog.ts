type Params = Record<string, string | number>;
type Message = (params: Params) => string;

const en = {
  "common.genericError": () => "Something went wrong. Please try again.",
  "common.eventNotFound": () => "No active event found with that code.",
  "common.eventClosed": () => "That event is closed.",

  "start.welcome": () =>
    "Welcome! This bot helps a group of Ingress First Saturday attendees build a shared event passcode in real time.\n\n" +
    "Use /join <code> to join an event someone already created, or /newevent to start one yourself. Send /help to see every command.",
  "help.text": () =>
    "Commands:\n" +
    "/language <code> - set your language (en, ca, es, fr)\n" +
    "/newevent <name> [| <pattern>] - create an event\n" +
    "/sharetext <code> [lang] - get an invite message to share\n" +
    "/join <code> - join an event\n" +
    "/leave - leave your current event\n" +
    "/myevent - show which event you're in\n\n" +
    "More commands for reporting and resolving the passcode are coming soon.",

  "language.usage": () => "Usage: /language <code>. Supported: en, ca, es, fr.",
  "language.invalid": (p) => `"${p.code}" isn't a supported language. Supported: en, ca, es, fr.`,
  "language.set": () => "Your language is now set to English.",

  "newevent.usage": (p) => `Usage: /newevent <name> or /newevent <name> | <pattern>. Default pattern: ${p.defaultPattern}.`,
  "newevent.invalidPattern": () => "That pattern isn't valid: it can only contain X (letter), 9 (digit) and * (word).",
  "newevent.created": (p) =>
    `Event "${p.name}" created. Join code: ${p.code}\nPattern: ${p.pattern}\n` +
    `Share the code with attendees, or run /sharetext ${p.code} to get an invite message. ` +
    `Use /join ${p.code} yourself if you're also hunting portals.`,

  "sharetext.usage": () => "Usage: /sharetext <code> [lang].",
  "sharetext.text": (p) => `Join the passcode relay for "${p.name}": open a chat with this bot and send /join ${p.code}.`,

  "join.usage": () => "Usage: /join <code>.",
  "join.confirmSwitch": (p) => `You're already in "${p.currentEventName}". Switch to "${p.newEventName}"?`,
  "join.confirmYesButton": () => "Yes, switch",
  "join.confirmNoButton": () => "Cancel",
  "join.switched": (p) => `Switched to "${p.name}".`,
  "join.joined": (p) => `Joined "${p.name}". Report what you find as "<position> <value>", e.g. "6 CIPHER".`,
  "join.alreadyInThisEvent": (p) => `You're already in "${p.name}".`,
  "join.cancelled": (p) => `Cancelled — you're still in "${p.name}".`,

  "leave.notInEvent": () => "You're not currently in any event.",
  "leave.left": (p) => `Left "${p.name}".`,

  "myevent.notInEvent": () => "You're not currently in any event. Use /join <code> or /newevent to start one.",
  "myevent.info": (p) => `You're in "${p.name}" (code ${p.code}, pattern ${p.pattern}).`,
} satisfies Record<string, Message>;

export type MessageKey = keyof typeof en;
type Catalog = Record<MessageKey, Message>;

const ca: Catalog = {
  "common.genericError": () => "S'ha produït un error. Torna-ho a provar.",
  "common.eventNotFound": () => "No s'ha trobat cap esdeveniment actiu amb aquest codi.",
  "common.eventClosed": () => "Aquest esdeveniment està tancat.",

  "start.welcome": () =>
    "Benvingut! Aquest bot ajuda un grup d'assistents a un Ingress First Saturday a construir el passcode de l'esdeveniment en temps real.\n\n" +
    "Fes servir /join <codi> per unir-te a un esdeveniment que algú ja ha creat, o /newevent per crear-ne un tu mateix. Envia /help per veure totes les comandes.",
  "help.text": () =>
    "Comandes:\n" +
    "/language <codi> - estableix el teu idioma (en, ca, es, fr)\n" +
    "/newevent <nom> [| <patró>] - crea un esdeveniment\n" +
    "/sharetext <codi> [idioma] - obté un text d'invitació per compartir\n" +
    "/join <codi> - uneix-te a un esdeveniment\n" +
    "/leave - surt de l'esdeveniment actual\n" +
    "/myevent - mostra a quin esdeveniment estàs\n\n" +
    "Aviat hi haurà més comandes per reportar i resoldre el passcode.",

  "language.usage": () => "Ús: /language <codi>. Suportats: en, ca, es, fr.",
  "language.invalid": (p) => `"${p.code}" no és un idioma suportat. Suportats: en, ca, es, fr.`,
  "language.set": () => "El teu idioma ara és el català.",

  "newevent.usage": (p) => `Ús: /newevent <nom> o /newevent <nom> | <patró>. Patró per defecte: ${p.defaultPattern}.`,
  "newevent.invalidPattern": () => "Aquest patró no és vàlid: només pot contenir X (lletra), 9 (número) i * (paraula).",
  "newevent.created": (p) =>
    `Esdeveniment "${p.name}" creat. Codi d'accés: ${p.code}\nPatró: ${p.pattern}\n` +
    `Comparteix el codi amb els assistents, o executa /sharetext ${p.code} per obtenir un text d'invitació. ` +
    `Fes /join ${p.code} tu mateix si també vas a caçar portals.`,

  "sharetext.usage": () => "Ús: /sharetext <codi> [idioma].",
  "sharetext.text": (p) => `Uneix-te al relleu de passcode de "${p.name}": obre una conversa amb aquest bot i envia /join ${p.code}.`,

  "join.usage": () => "Ús: /join <codi>.",
  "join.confirmSwitch": (p) => `Ja ets a "${p.currentEventName}". Vols canviar a "${p.newEventName}"?`,
  "join.confirmYesButton": () => "Sí, canvia",
  "join.confirmNoButton": () => "Cancel·la",
  "join.switched": (p) => `Has canviat a "${p.name}".`,
  "join.joined": (p) => `T'has unit a "${p.name}". Reporta el que trobis com a "<posició> <valor>", p.ex. "6 CIPHER".`,
  "join.alreadyInThisEvent": (p) => `Ja ets a "${p.name}".`,
  "join.cancelled": (p) => `Cancel·lat — segueixes a "${p.name}".`,

  "leave.notInEvent": () => "Ara mateix no ets a cap esdeveniment.",
  "leave.left": (p) => `Has sortit de "${p.name}".`,

  "myevent.notInEvent": () => "Ara mateix no ets a cap esdeveniment. Fes servir /join <codi> o /newevent per crear-ne un.",
  "myevent.info": (p) => `Ets a "${p.name}" (codi ${p.code}, patró ${p.pattern}).`,
};

const es: Catalog = {
  "common.genericError": () => "Se ha producido un error. Inténtalo de nuevo.",
  "common.eventNotFound": () => "No se ha encontrado ningún evento activo con ese código.",
  "common.eventClosed": () => "Ese evento está cerrado.",

  "start.welcome": () =>
    "¡Bienvenido! Este bot ayuda a un grupo de asistentes a un Ingress First Saturday a construir el passcode del evento en tiempo real.\n\n" +
    "Usa /join <código> para unirte a un evento que alguien ya haya creado, o /newevent para crear uno tú mismo. Envía /help para ver todos los comandos.",
  "help.text": () =>
    "Comandos:\n" +
    "/language <código> - establece tu idioma (en, ca, es, fr)\n" +
    "/newevent <nombre> [| <patrón>] - crea un evento\n" +
    "/sharetext <código> [idioma] - obtén un texto de invitación para compartir\n" +
    "/join <código> - únete a un evento\n" +
    "/leave - sal del evento actual\n" +
    "/myevent - muestra en qué evento estás\n\n" +
    "Pronto habrá más comandos para reportar y resolver el passcode.",

  "language.usage": () => "Uso: /language <código>. Soportados: en, ca, es, fr.",
  "language.invalid": (p) => `"${p.code}" no es un idioma soportado. Soportados: en, ca, es, fr.`,
  "language.set": () => "Tu idioma ahora es el español.",

  "newevent.usage": (p) => `Uso: /newevent <nombre> o /newevent <nombre> | <patrón>. Patrón por defecto: ${p.defaultPattern}.`,
  "newevent.invalidPattern": () => "Ese patrón no es válido: solo puede contener X (letra), 9 (número) y * (palabra).",
  "newevent.created": (p) =>
    `Evento "${p.name}" creado. Código de acceso: ${p.code}\nPatrón: ${p.pattern}\n` +
    `Comparte el código con los asistentes, o ejecuta /sharetext ${p.code} para obtener un texto de invitación. ` +
    `Haz /join ${p.code} tú mismo si también vas a cazar portales.`,

  "sharetext.usage": () => "Uso: /sharetext <código> [idioma].",
  "sharetext.text": (p) => `Únete al relevo de passcode de "${p.name}": abre una conversación con este bot y envía /join ${p.code}.`,

  "join.usage": () => "Uso: /join <código>.",
  "join.confirmSwitch": (p) => `Ya estás en "${p.currentEventName}". ¿Quieres cambiar a "${p.newEventName}"?`,
  "join.confirmYesButton": () => "Sí, cambiar",
  "join.confirmNoButton": () => "Cancelar",
  "join.switched": (p) => `Has cambiado a "${p.name}".`,
  "join.joined": (p) => `Te has unido a "${p.name}". Reporta lo que encuentres como "<posición> <valor>", p.ej. "6 CIPHER".`,
  "join.alreadyInThisEvent": (p) => `Ya estás en "${p.name}".`,
  "join.cancelled": (p) => `Cancelado — sigues en "${p.name}".`,

  "leave.notInEvent": () => "Ahora mismo no estás en ningún evento.",
  "leave.left": (p) => `Has salido de "${p.name}".`,

  "myevent.notInEvent": () => "Ahora mismo no estás en ningún evento. Usa /join <código> o /newevent para crear uno.",
  "myevent.info": (p) => `Estás en "${p.name}" (código ${p.code}, patrón ${p.pattern}).`,
};

const fr: Catalog = {
  "common.genericError": () => "Une erreur s'est produite. Réessayez.",
  "common.eventNotFound": () => "Aucun événement actif trouvé avec ce code.",
  "common.eventClosed": () => "Cet événement est clôturé.",

  "start.welcome": () =>
    "Bienvenue ! Ce bot aide un groupe de participants à un Ingress First Saturday à construire le passcode de l'événement en temps réel.\n\n" +
    "Utilisez /join <code> pour rejoindre un événement déjà créé, ou /newevent pour en créer un vous-même. Envoyez /help pour voir toutes les commandes.",
  "help.text": () =>
    "Commandes :\n" +
    "/language <code> - définit votre langue (en, ca, es, fr)\n" +
    "/newevent <nom> [| <modèle>] - crée un événement\n" +
    "/sharetext <code> [langue] - obtient un texte d'invitation à partager\n" +
    "/join <code> - rejoindre un événement\n" +
    "/leave - quitter l'événement actuel\n" +
    "/myevent - affiche dans quel événement vous êtes\n\n" +
    "D'autres commandes pour signaler et résoudre le passcode arrivent bientôt.",

  "language.usage": () => "Utilisation : /language <code>. Langues gérées : en, ca, es, fr.",
  "language.invalid": (p) => `"${p.code}" n'est pas une langue gérée. Langues gérées : en, ca, es, fr.`,
  "language.set": () => "Votre langue est maintenant le français.",

  "newevent.usage": (p) => `Utilisation : /newevent <nom> ou /newevent <nom> | <modèle>. Modèle par défaut : ${p.defaultPattern}.`,
  "newevent.invalidPattern": () => "Ce modèle n'est pas valide : il ne peut contenir que X (lettre), 9 (chiffre) et * (mot).",
  "newevent.created": (p) =>
    `Événement "${p.name}" créé. Code d'accès : ${p.code}\nModèle : ${p.pattern}\n` +
    `Partagez le code avec les participants, ou lancez /sharetext ${p.code} pour obtenir un texte d'invitation. ` +
    `Faites /join ${p.code} vous-même si vous chassez aussi des portails.`,

  "sharetext.usage": () => "Utilisation : /sharetext <code> [langue].",
  "sharetext.text": (p) => `Rejoignez le relais de passcode de "${p.name}" : ouvrez une discussion avec ce bot et envoyez /join ${p.code}.`,

  "join.usage": () => "Utilisation : /join <code>.",
  "join.confirmSwitch": (p) => `Vous êtes déjà dans "${p.currentEventName}". Passer à "${p.newEventName}" ?`,
  "join.confirmYesButton": () => "Oui, changer",
  "join.confirmNoButton": () => "Annuler",
  "join.switched": (p) => `Vous êtes passé à "${p.name}".`,
  "join.joined": (p) => `Vous avez rejoint "${p.name}". Signalez ce que vous trouvez sous la forme "<position> <valeur>", ex. "6 CIPHER".`,
  "join.alreadyInThisEvent": (p) => `Vous êtes déjà dans "${p.name}".`,
  "join.cancelled": (p) => `Annulé — vous êtes toujours dans "${p.name}".`,

  "leave.notInEvent": () => "Vous n'êtes actuellement dans aucun événement.",
  "leave.left": (p) => `Vous avez quitté "${p.name}".`,

  "myevent.notInEvent": () => "Vous n'êtes actuellement dans aucun événement. Utilisez /join <code> ou /newevent pour en créer un.",
  "myevent.info": (p) => `Vous êtes dans "${p.name}" (code ${p.code}, modèle ${p.pattern}).`,
};

export const catalogs = { en, ca, es, fr } satisfies Record<string, Catalog>;
